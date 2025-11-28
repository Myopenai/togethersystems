/**
 * Branding Manager
 * 
 * Verwaltet Branding-Informationen
 * .{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.
 */

import fs from 'fs';
import path from 'path';

/**
 * Branding Information
 */
export interface BrandingInfo {
  branding: string;
  producer: {
    name: string;
    url: string;
    whatsapp: string;
    gofundme: string;
  };
  symbols: {
    tPublic: string;
    tPrivate: string;
    tSeal: string;
    tExtended: string;
    os: string;
    ostos: string;
    infinity: string;
    copyright: string;
  };
  mathematical: {
    limit: string;
    superset: string;
    infinity: string;
    approximation: string;
    superscript: string;
  };
}

/**
 * Branding Manager
 */
export class BrandingManager {
  private settingsPath: string;
  private branding: BrandingInfo;

  constructor(settingsPath: string) {
    this.settingsPath = settingsPath;
    this.branding = this.loadBranding();
  }

  /**
   * Lädt Branding
   */
  private loadBranding(): BrandingInfo {
    const brandingPath = path.join(this.settingsPath, 'branding.json');
    
    if (fs.existsSync(brandingPath)) {
      return JSON.parse(fs.readFileSync(brandingPath, 'utf-8'));
    }

    // Default Branding
    return {
      branding: '.{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.',
      producer: {
        name: 'TEL1.NL',
        url: 'TEL1.NL',
        whatsapp: '0031613803782',
        gofundme: 'https://www.gofundme.com/f/magnitudo'
      },
      symbols: {
        tPublic: 'T,.',
        tPrivate: 'T,,.',
        tSeal: 'T,,,.',
        tExtended: 'T,,,,.',
        os: 'OS-TOS',
        ostos: 'OSTOS',
        infinity: '∞',
        copyright: '(C)(R)'
      },
      mathematical: {
        limit: 'lim',
        superset: 'sup',
        infinity: '∞',
        approximation: '≈',
        superscript: '⁺∞'
      }
    };
  }

  /**
   * Gibt Branding zurück
   */
  getBranding(): BrandingInfo {
    return this.branding;
  }

  /**
   * Gibt Branding-String zurück
   */
  getBrandingString(): string {
    return this.branding.branding;
  }

  /**
   * Gibt Producer-Info zurück
   */
  getProducer(): BrandingInfo['producer'] {
    return this.branding.producer;
  }

  /**
   * Gibt Symbols zurück
   */
  getSymbols(): BrandingInfo['symbols'] {
    return this.branding.symbols;
  }

  /**
   * Formatiert Branding für Display
   */
  formatBranding(): string {
    const { branding, producer } = this.branding;
    return `${branding}\nProducer: ${producer.name} | WhatsApp: ${producer.whatsapp} | GoFundMe: ${producer.gofundme}`;
  }
}

/**
 * Singleton-Instanz
 */
let brandingManager: BrandingManager | null = null;

export function getBrandingManager(settingsPath: string): BrandingManager {
  if (!brandingManager) {
    brandingManager = new BrandingManager(settingsPath);
  }
  return brandingManager;
}

