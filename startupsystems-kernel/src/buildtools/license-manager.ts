/**
 * BuildTools License System
 * Branding: ttt,.D:\BuildTools(C)(R)t,,.
 * 
 * Live-On-Demand mit notarieller Verifizierung
 * 
 * Pfad: D:\BuildTools
 */

import { createHash } from 'crypto';

/**
 * Verifizierungs-Level
 */
export enum VerificationLevel {
  AUTO = 'AUTO',           // Kostenlos, automatisch
  EXTENDED = 'EXTENDED',    // Kostenpflichtig, automatisch
  NOTARIZED = 'NOTARIZED'   // Persönlich, notariell, auf Anfrage
}

/**
 * Automatische Verifizierung (Blockchain-basiert)
 */
export interface AutoVerification {
  kernelHash: string;
  timestamp: string;
  blockchainTx?: string; // Optional: Transaktions-Hash
  publicKey: string;
  cost: 0; // Kostenlos
  level: VerificationLevel.AUTO;
}

/**
 * Erweiterte Lizenz (Kostenpflichtig, automatisch)
 */
export interface ExtendedLicense {
  licenseId: string;
  kernelHash: string;
  timestamp: string;
  publicKey: string;
  cost: number; // Kostenpflichtig
  level: VerificationLevel.EXTENDED;
  features: string[]; // Zusätzliche Features
}

/**
 * Notarielle Verifizierung (Persönlich, auf Anfrage)
 */
export interface NotaryVerification {
  notaryId: string;
  notaryName: string;
  notaryCertificate: string;
  timestamp: string;
  personalVerification: true;
  cost: number; // Kostenpflichtig, auf Anfrage
  digitalSignature: string;
  level: VerificationLevel.NOTARIZED;
}

/**
 * Hybrid-Lizenz
 */
export type HybridLicense = AutoVerification | ExtendedLicense | NotaryVerification;

/**
 * BuildTools License Manager
 */
export class BuildToolsLicenseManager {
  private licenses: Map<string, HybridLicense> = new Map();
  private publicKey: string;

  constructor(publicKey?: string) {
    this.publicKey = publicKey || this.generatePublicKey();
  }

  /**
   * Öffentlicher Kernel (kostenlos)
   * 
   * Gibt den öffentlichen Kernel zurück - keine Lizenz nötig
   */
  getPublicKernel(kernelHash: string): AutoVerification {
    const timestamp = new Date().toISOString();
    
    const license: AutoVerification = {
      kernelHash,
      timestamp,
      publicKey: this.publicKey,
      cost: 0,
      level: VerificationLevel.AUTO
    };

    const licenseId = this.generateLicenseId(kernelHash, VerificationLevel.AUTO);
    this.licenses.set(licenseId, license);

    return license;
  }

  /**
   * Erstellt automatische Verifizierung (kostenlos)
   */
  createAutoVerification(kernelHash: string, blockchainTx?: string): AutoVerification {
    const license = this.getPublicKernel(kernelHash);
    
    if (blockchainTx) {
      license.blockchainTx = blockchainTx;
    }

    return license;
  }

  /**
   * Erstellt erweiterte Lizenz (kostenpflichtig, automatisch)
   */
  createExtendedLicense(
    kernelHash: string,
    cost: number,
    features: string[] = []
  ): ExtendedLicense {
    const timestamp = new Date().toISOString();
    const licenseId = this.generateLicenseId(kernelHash, VerificationLevel.EXTENDED);

    const license: ExtendedLicense = {
      licenseId,
      kernelHash,
      timestamp,
      publicKey: this.publicKey,
      cost,
      level: VerificationLevel.EXTENDED,
      features
    };

    this.licenses.set(licenseId, license);
    return license;
  }

  /**
   * Erstellt notarielle Verifizierung (persönlich, auf Anfrage)
   * 
   * @param kernelHash - Hash des Kernels
   * @param notaryId - ID des Notars
   * @param notaryName - Name des Notars
   * @param notaryCertificate - Zertifikat des Notars
   * @param cost - Kosten (auf Anfrage)
   */
  createNotarizedLicense(
    kernelHash: string,
    notaryId: string,
    notaryName: string,
    notaryCertificate: string,
    cost: number
  ): NotaryVerification {
    const timestamp = new Date().toISOString();
    const digitalSignature = this.generateDigitalSignature(
      kernelHash,
      notaryId,
      timestamp
    );

    const license: NotaryVerification = {
      notaryId,
      notaryName,
      notaryCertificate,
      timestamp,
      personalVerification: true,
      cost,
      digitalSignature,
      level: VerificationLevel.NOTARIZED
    };

    const licenseId = this.generateLicenseId(kernelHash, VerificationLevel.NOTARIZED);
    this.licenses.set(licenseId, license);

    return license;
  }

  /**
   * Erstellt Lizenz basierend auf Level
   */
  async createLicense(
    level: VerificationLevel,
    kernelHash: string,
    options?: {
      blockchainTx?: string;
      cost?: number;
      features?: string[];
      notaryId?: string;
      notaryName?: string;
      notaryCertificate?: string;
    }
  ): Promise<HybridLicense> {
    switch (level) {
      case VerificationLevel.AUTO:
        return this.createAutoVerification(
          kernelHash,
          options?.blockchainTx
        );

      case VerificationLevel.EXTENDED:
        return this.createExtendedLicense(
          kernelHash,
          options?.cost || 0,
          options?.features || []
        );

      case VerificationLevel.NOTARIZED:
        if (!options?.notaryId || !options?.notaryName || !options?.notaryCertificate) {
          throw new Error('Notarielle Verifizierung erfordert Notar-Informationen');
        }
        return this.createNotarizedLicense(
          kernelHash,
          options.notaryId,
          options.notaryName,
          options.notaryCertificate,
          options.cost || 0
        );

      default:
        throw new Error(`Unbekanntes Verifizierungs-Level: ${level}`);
    }
  }

  /**
   * Verifiziert eine Lizenz
   */
  verifyLicense(license: HybridLicense): boolean {
    switch (license.level) {
      case VerificationLevel.AUTO:
        return this.verifyAutoLicense(license);
      case VerificationLevel.EXTENDED:
        return this.verifyExtendedLicense(license);
      case VerificationLevel.NOTARIZED:
        return this.verifyNotarizedLicense(license);
      default:
        return false;
    }
  }

  /**
   * Verifiziert automatische Lizenz
   */
  private verifyAutoLicense(license: AutoVerification): boolean {
    // Öffentliche Verifizierung möglich
    return license.publicKey === this.publicKey && license.cost === 0;
  }

  /**
   * Verifiziert erweiterte Lizenz
   */
  private verifyExtendedLicense(license: ExtendedLicense): boolean {
    return license.publicKey === this.publicKey && license.cost > 0;
  }

  /**
   * Verifiziert notarielle Lizenz
   */
  private verifyNotarizedLicense(license: NotaryVerification): boolean {
    // Verifiziert digitale Signatur
    const expectedSignature = this.generateDigitalSignature(
      license.kernelHash || '',
      license.notaryId,
      license.timestamp
    );
    
    return expectedSignature === license.digitalSignature;
  }

  /**
   * Generiert Lizenz-ID
   */
  private generateLicenseId(kernelHash: string, level: VerificationLevel): string {
    const data = `${kernelHash}:${level}:${Date.now()}`;
    return createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  /**
   * Generiert digitale Signatur für notarielle Verifizierung
   */
  private generateDigitalSignature(
    kernelHash: string,
    notaryId: string,
    timestamp: string
  ): string {
    const data = `${kernelHash}:${notaryId}:${timestamp}`;
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generiert öffentlichen Schlüssel
   */
  private generatePublicKey(): string {
    const random = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString();
    return createHash('sha256')
      .update(`${random}:${timestamp}`)
      .digest('hex')
      .substring(0, 32);
  }

  /**
   * Gibt alle Lizenzen zurück
   */
  getAllLicenses(): HybridLicense[] {
    return Array.from(this.licenses.values());
  }
}

/**
 * Singleton-Instanz des License Managers
 */
export const buildToolsLicenseManager = new BuildToolsLicenseManager();

