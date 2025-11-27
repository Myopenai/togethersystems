/**
 * User Distribution System
 * 
 * Erstellt User-Endprodukt mit Unique Identifier
 * Notarielle Verifizierung, Portal-Host Versionierung
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { SettingsGraph } from '../schemas/settings.schema';

/**
 * User Distribution Manager
 */
export class UserDistributionManager {
  private settingsPath: string;
  private portalHost: string;
  private db: D1Database | null;

  constructor(settingsPath: string, portalHost: string, db?: D1Database) {
    this.settingsPath = settingsPath;
    this.portalHost = portalHost;
    this.db = db || null;
  }

  /**
   * Generiert Unique Identifier für User
   */
  generateUserIdentifier(): {
    identifier: string;
    key: string;
    keyHash: string;
  } {
    // Generiere Unique Identifier
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    const identifier = `user-${timestamp}-${random}`;

    // Generiere User Key (notariell geschützt)
    const key = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    return { identifier, key, keyHash };
  }

  /**
   * Erstellt User-Endprodukt (Kopie des Settings-Ordners)
   */
  async createUserDistribution(userKey: string): Promise<{
    distributionId: string;
    userKey: string;
    downloadUrl: string;
    notarySignature: string;
    timestamp: string;
  }> {
    // Generiere Identifier
    const { identifier, keyHash } = this.generateUserIdentifier();
    
    // Lade Settings Graph
    const graphLoader = (await import('./graph-loader')).SettingsGraphLoader;
    const loader = new graphLoader(this.settingsPath);
    const graph = await loader.loadGraph();

    // Erstelle Settings Snapshot (verschlüsselt)
    const snapshot = this.createEncryptedSnapshot(graph, userKey);

    // Notarielle Verifizierung
    const notarySignature = await this.notarizeDistribution(identifier, snapshot, keyHash);

    // Speichere in D1 (wenn verfügbar)
    if (this.db) {
      await this.saveDistribution(identifier, keyHash, snapshot, notarySignature);
    }

    // Erstelle Download-URL (Portal-Host versioniert)
    const version = await this.getVersionFromPortal();
    const downloadUrl = `${this.portalHost}/api/settings/distribution/${identifier}?version=${version}&key=${keyHash}`;

    return {
      distributionId: identifier,
      userKey: userKey, // WICHTIG: User muss diesen Key sicher aufbewahren
      downloadUrl,
      notarySignature,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Erstellt verschlüsselte Snapshot
   */
  private createEncryptedSnapshot(graph: SettingsGraph, userKey: string): string {
    // Konvertiere Graph zu JSON
    const graphData = {
      nodes: Array.from(graph.nodes.values()),
      edges: Array.from(graph.edges.entries()).map(([source, targets]) => ({
        source,
        targets
      })),
      manifest: graph.manifest,
      // Source-Code wird NICHT inkludiert - nur Funktionalität
      sourceCodeExcluded: true,
      functionality: 'full',
      restrictions: {
        sourceCodeAccess: false,
        modifications: true,
        extensions: true,
        design: true,
        implementations: true
      }
    };

    const json = JSON.stringify(graphData);
    
    // Verschlüssele mit User Key
    const key = crypto.createHash('sha256').update(userKey).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key.slice(0, 32), iv);
    
    let encrypted = cipher.update(json, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });
  }

  /**
   * Notarielle Verifizierung
   */
  private async notarizeDistribution(
    identifier: string,
    snapshot: string,
    keyHash: string
  ): Promise<string> {
    // Kombiniere alle Daten
    const combined = identifier + snapshot + keyHash;
    
    // Globales Zeitzonensystem (UTC)
    const timestamp = new Date().toISOString();
    const timezone = 'UTC';
    
    // Erstelle Notary Signature
    const notaryData = {
      identifier,
      keyHash,
      timestamp,
      timezone,
      producer: 'TEL1.NL',
      branding: '.{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.',
      whatsapp: '0031613803782',
      version: '1.0.0'
    };

    const signature = crypto.createHash('sha512')
      .update(JSON.stringify(notaryData) + combined)
      .digest('hex');

    // Speichere in D1 (wenn verfügbar)
    if (this.db) {
      await this.saveNotaryVerification(identifier, signature, timestamp);
    }

    return `notary:${signature}`;
  }

  /**
   * Speichert Distribution in D1
   */
  private async saveDistribution(
    identifier: string,
    keyHash: string,
    snapshot: string,
    notarySignature: string
  ): Promise<void> {
    if (!this.db) return;

    const version = await this.getVersionFromPortal();
    
    await this.db.prepare(`
      INSERT INTO user_distributions (
        id, user_key_hash, settings_snapshot, version, portal_host,
        notary_signature, notary_timestamp, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      identifier,
      keyHash,
      snapshot,
      version,
      this.portalHost,
      notarySignature,
      Date.now(),
      Date.now()
    ).run();
  }

  /**
   * Speichert Notary Verification
   */
  private async saveNotaryVerification(
    entityId: string,
    signature: string,
    timestamp: string
  ): Promise<void> {
    if (!this.db) return;

    await this.db.prepare(`
      INSERT INTO notary_verifications (
        id, entity_type, entity_id, verification_type, status,
        signature, verified_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      `notary-${entityId}`,
      'distribution',
      entityId,
      'automatic',
      'verified',
      signature,
      Date.now(),
      JSON.stringify({ timestamp, timezone: 'UTC' })
    ).run();
  }

  /**
   * Holt Version vom Portal-Host
   */
  private async getVersionFromPortal(): Promise<string> {
    try {
      const response = await fetch(`${this.portalHost}/api/settings/version`);
      const data = await response.json();
      return data.version || '1.0.0';
    } catch (error) {
      // Fallback
      return '1.0.0';
    }
  }

  /**
   * Validiert User Key
   */
  async validateUserKey(distributionId: string, userKey: string): Promise<boolean> {
    if (!this.db) return false;

    const keyHash = crypto.createHash('sha256').update(userKey).digest('hex');
    
    const result = await this.db.prepare(`
      SELECT * FROM user_distributions 
      WHERE id = ? AND user_key_hash = ?
    `).bind(distributionId, keyHash).first();

    return result !== null;
  }

  /**
   * Lädt Distribution für User
   */
  async loadDistribution(distributionId: string, userKey: string): Promise<SettingsGraph | null> {
    if (!this.db) return null;

    const keyHash = crypto.createHash('sha256').update(userKey).digest('hex');
    
    const result = await this.db.prepare(`
      SELECT * FROM user_distributions 
      WHERE id = ? AND user_key_hash = ?
    `).bind(distributionId, keyHash).first();

    if (!result) {
      return null;
    }

    // Entschlüssele Snapshot
    const snapshot = JSON.parse(result.settings_snapshot as string);
    const key = crypto.createHash('sha256').update(userKey).digest();
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key.slice(0, 32),
      Buffer.from(snapshot.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(snapshot.authTag, 'hex'));

    let decrypted = decipher.update(snapshot.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const graphData = JSON.parse(decrypted);
    
    // Konvertiere zurück zu SettingsGraph
    const nodes = new Map();
    for (const node of graphData.nodes) {
      nodes.set(node.id, node);
    }

    const edges = new Map();
    for (const edge of graphData.edges) {
      edges.set(edge.source, edge.targets);
    }

    return {
      nodes,
      edges,
      manifest: graphData.manifest
    };
  }
}

