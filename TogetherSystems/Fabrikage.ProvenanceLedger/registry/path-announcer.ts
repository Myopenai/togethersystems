/**
 * ============================================================================
 * PATH ANNOUNCER
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. Path-Announcer - Gibt immer exakten Pfad bei Erstellung an
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import { RegistryManager, Artifact } from './registry-manager';

export interface PathAnnouncement {
  type: 'created' | 'updated' | 'deprecated' | 'archived';
  artifact_id: string;
  path: string;
  anchor?: string;
  hash: string;
  deep_link: string;
  portal_link: string;
  timestamp: string;
  module: string;
}

export class PathAnnouncer {
  private registry: RegistryManager;
  private announcements: PathAnnouncement[] = [];
  private announcementLog: string;

  constructor(registry: RegistryManager, logPath: string = './artifacts.log') {
    this.registry = registry;
    this.announcementLog = logPath;
  }

  /**
   * Kündigt ein neues Artefakt an
   */
  announceCreated(
    filePath: string,
    module: string,
    anchor?: string
  ): PathAnnouncement {
    const hash = this.calculateHash(filePath);
    const artifactId = this.generateArtifactId(module, hash);
    const deepLink = this.createDeepLink(filePath, anchor);
    const portalLink = this.createPortalLink(filePath, anchor);

    const announcement: PathAnnouncement = {
      type: 'created',
      artifact_id: artifactId,
      path: filePath,
      anchor: anchor,
      hash: hash,
      deep_link: deepLink,
      portal_link: portalLink,
      timestamp: new Date().toISOString(),
      module: module,
    };

    this.announcements.push(announcement);
    this.logAnnouncement(announcement);
    this.printAnnouncement(announcement);

    return announcement;
  }

  /**
   * Erstellt Deep-Link
   */
  private createDeepLink(filePath: string, anchor?: string): string {
    const relativePath = path.relative(process.cwd(), filePath);
    if (anchor) {
      return `${relativePath}#${anchor}`;
    }
    return relativePath;
  }

  /**
   * Erstellt Portal-Link
   */
  private createPortalLink(filePath: string, anchor?: string): string {
    const relativePath = path.relative(process.cwd(), filePath);
    const module = this.extractModule(relativePath);
    const baseName = path.basename(filePath, path.extname(filePath));
    
    if (anchor) {
      return `Portal/index.html#${module}-${baseName}-${anchor}`;
    }
    return `Portal/index.html#${module}-${baseName}`;
  }

  /**
   * Extrahiert Modul aus Pfad
   */
  private extractModule(filePath: string): string {
    const parts = filePath.split(path.sep);
    if (parts[0] === 'Fabrikage') {
      return parts[1] || 'root';
    }
    return parts[0] || 'root';
  }

  /**
   * Berechnet Hash
   */
  private calculateHash(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Generiert Artefakt-ID
   */
  private generateArtifactId(module: string, hash: string): string {
    const shortHash = hash.substring(0, 8);
    return `artifact-${module}-${shortHash}`;
  }

  /**
   * Loggt Announcement
   */
  private logAnnouncement(announcement: PathAnnouncement): void {
    const logEntry = `${announcement.timestamp} | ${announcement.type.toUpperCase()} | ${announcement.artifact_id} | ${announcement.path} | ${announcement.hash} | ${announcement.deep_link}\n`;
    fs.appendFileSync(this.announcementLog, logEntry);
  }

  /**
   * Druckt Announcement
   */
  private printAnnouncement(announcement: PathAnnouncement): void {
    console.log('');
    console.log('=====================================');
    console.log('T,. ARTEFAKT ERSTELLT');
    console.log('=====================================');
    console.log(`Typ: ${announcement.type}`);
    console.log(`ID: ${announcement.artifact_id}`);
    console.log(`Pfad: ${announcement.path}`);
    if (announcement.anchor) {
      console.log(`Anchor: ${announcement.anchor}`);
    }
    console.log(`Hash: ${announcement.hash.substring(0, 16)}...`);
    console.log(`Deep-Link: ${announcement.deep_link}`);
    console.log(`Portal-Link: ${announcement.portal_link}`);
    console.log(`Modul: ${announcement.module}`);
    console.log(`Zeitstempel: ${announcement.timestamp}`);
    console.log('=====================================');
    console.log('');
    console.log('→ Öffnen:');
    console.log(`  Datei: ${announcement.path}`);
    console.log(`  Portal: ${announcement.portal_link}`);
    console.log('');
  }

  /**
   * Gibt letzte Announcements zurück
   */
  getRecentAnnouncements(limit: number = 10): PathAnnouncement[] {
    return this.announcements.slice(-limit).reverse();
  }

  /**
   * Sucht Announcements
   */
  searchAnnouncements(query: string): PathAnnouncement[] {
    const lowerQuery = query.toLowerCase();
    return this.announcements.filter(a => 
      a.path.toLowerCase().includes(lowerQuery) ||
      a.artifact_id.toLowerCase().includes(lowerQuery) ||
      a.hash.toLowerCase().includes(lowerQuery) ||
      a.module.toLowerCase().includes(lowerQuery)
    );
  }
}

