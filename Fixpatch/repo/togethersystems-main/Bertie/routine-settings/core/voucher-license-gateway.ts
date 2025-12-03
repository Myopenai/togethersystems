/**
 * Voucher License Gateway
 * Online/Offline-Verifikation mit Payment-first, verify-now
 * 
 * T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT T,.&T,,.T,,,.(C)
 */

import { AlphabetUserIdService } from './alphabet-user-id-service';
import { IndustrialDesignEngine, SlotType } from './industrial-design-engine';
import { TelemetryAuditSystem } from './telemetry-audit-system';

export interface Voucher {
  voucherId: string;
  batchId?: string;
  productId: string;
  assignedTo?: string; // Alphabet-ID
  validity: {
    start: Date;
    end: Date;
    activationWindow?: number; // Stunden
  };
  maxActivations: number;
  status: 'unused' | 'active' | 'suspended' | 'revoked';
  paymentRef?: string;
  features: string[];
  region?: string;
}

export interface License {
  licenseId: string;
  productId: string;
  voucherId: string;
  userId: string; // Alphabet-ID
  status: 'active' | 'suspended' | 'revoked';
  features: {
    toggles: Record<string, boolean>;
    limits: Record<string, number>;
    inertiaProfile?: string;
  };
  activations: {
    count: number;
    max: number;
    devices: string[];
  };
  lastActivation?: Date;
  lastVerification?: Date;
}

export interface VerificationResult {
  valid: boolean;
  license?: License;
  slotType: SlotType;
  offline: boolean;
  gracePeriodActive: boolean;
  hoursUntilRenewal?: number;
  error?: string;
}

export class VoucherLicenseGateway {
  private static instance: VoucherLicenseGateway;
  private userIdService: AlphabetUserIdService;
  private designEngine: IndustrialDesignEngine;
  private telemetry: TelemetryAuditSystem;
  private vouchers: Map<string, Voucher> = new Map();
  private licenses: Map<string, License> = new Map();
  private offlineCache: Map<string, { license: License; cachedAt: Date }> = new Map();

  private constructor() {
    this.userIdService = AlphabetUserIdService.getInstance();
    this.designEngine = IndustrialDesignEngine.getInstance();
    this.telemetry = TelemetryAuditSystem.getInstance();
    this.loadFromStorage();
  }

  public static getInstance(): VoucherLicenseGateway {
    if (!VoucherLicenseGateway.instance) {
      VoucherLicenseGateway.instance = new VoucherLicenseGateway();
    }
    return VoucherLicenseGateway.instance;
  }

  /**
   * Erstellt Voucher
   */
  public createVoucher(
    productId: string,
    validityDays: number,
    maxActivations: number,
    features: string[],
    paymentRef?: string
  ): Voucher {
    const voucherId = this.generateVoucherId();
    const now = new Date();
    
    const voucher: Voucher = {
      voucherId,
      productId,
      validity: {
        start: now,
        end: new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000)
      },
      maxActivations,
      status: 'unused',
      paymentRef,
      features
    };

    this.vouchers.set(voucherId, voucher);
    this.saveToStorage();

    return voucher;
  }

  /**
   * Aktiviert Voucher für User (Payment-first, verify-now)
   */
  public async activateVoucher(
    voucherId: string,
    userId: string, // Alphabet-ID
    paymentRef: string,
    deviceId?: string
  ): Promise<{
    success: boolean;
    license?: License;
    error?: string;
  }> {
    const voucher = this.vouchers.get(voucherId);
    
    if (!voucher) {
      return { success: false, error: 'Voucher nicht gefunden' };
    }

    // Payment-first: Prüfe ob Payment-Referenz vorhanden
    if (!paymentRef || !voucher.paymentRef || paymentRef !== voucher.paymentRef) {
      return { success: false, error: 'Payment-Referenz ungültig oder fehlt' };
    }

    // Verify-now: Prüfe User-ID
    const user = this.userIdService.getUser(userId);
    if (!user) {
      return { success: false, error: 'User-ID nicht gefunden' };
    }

    // Prüfe Gültigkeit
    const now = new Date();
    if (now < voucher.validity.start || now > voucher.validity.end) {
      return { success: false, error: 'Voucher außerhalb Gültigkeitszeitraum' };
    }

    // Prüfe Status
    if (voucher.status !== 'unused' && voucher.status !== 'active') {
      return { success: false, error: `Voucher-Status ungültig: ${voucher.status}` };
    }

    // Erstelle License
    const licenseId = this.generateLicenseId();
    const license: License = {
      licenseId,
      productId: voucher.productId,
      voucherId,
      userId,
      status: 'active',
      features: {
        toggles: this.createFeatureToggles(voucher.features),
        limits: {},
        inertiaProfile: 'purchased' // Standard nach Kauf
      },
      activations: {
        count: 1,
        max: voucher.maxActivations,
        devices: deviceId ? [deviceId] : []
      },
      lastActivation: now,
      lastVerification: now
    };

    // Aktualisiere Voucher
    voucher.status = 'active';
    voucher.assignedTo = userId;

    // Speichere
    this.licenses.set(licenseId, license);
    this.vouchers.set(voucherId, voucher);
    this.offlineCache.set(userId, { license, cachedAt: now });
    this.saveToStorage();

    // Track Telemetry
    this.telemetry.trackVoucherActivation(voucherId, userId, voucher.productId, true);
    this.telemetry.trackLicenseStatus(userId, voucher.productId, 'active', 'purchased');

    return { success: true, license };
  }

  /**
   * Verifiziert License (Online oder Offline)
   */
  public async verifyLicense(
    userId: string,
    productId: string,
    offline: boolean = false
  ): Promise<VerificationResult> {
    // Suche aktive License
    let license: License | undefined;
    for (const [_, lic] of this.licenses.entries()) {
      if (lic.userId === userId && lic.productId === productId && lic.status === 'active') {
        license = lic;
        break;
      }
    }

    if (!license) {
      // Prüfe Offline-Cache
      const cached = this.offlineCache.get(userId);
      if (cached && cached.license.productId === productId) {
        license = cached.license;
        
        // Prüfe Grace-Period
        const gracePeriodActive = this.designEngine.isInGracePeriod(
          license.lastActivation || new Date()
        );
        
        if (gracePeriodActive) {
          return {
            valid: true,
            license,
            slotType: 'purchased',
            offline: true,
            gracePeriodActive: true
          };
        }
      }

      return {
        valid: false,
        slotType: 'demo',
        offline,
        gracePeriodActive: false,
        error: 'Keine aktive License gefunden'
      };
    }

    // Online-Verifikation
    if (!offline) {
      license.lastVerification = new Date();
      this.offlineCache.set(userId, { license, cachedAt: new Date() });
      this.saveToStorage();
    } else {
      // Offline: Prüfe Cache-Alter
      const cached = this.offlineCache.get(userId);
      if (cached) {
        const cacheAge = (new Date().getTime() - cached.cachedAt.getTime()) / (1000 * 60 * 60);
        if (cacheAge > 24) { // Cache älter als 24 Stunden
          return {
            valid: true,
            license,
            slotType: 'free', // Degradiere zu free bei altem Cache
            offline: true,
            gracePeriodActive: false,
            error: 'Offline-Cache zu alt - Online-Verifikation empfohlen'
          };
        }
      }
    }

    // Bestimme Slot-Type basierend auf License-Status
    const slotType: SlotType = this.determineSlotType(license);

    // Prüfe vor Blockade
    const lastRenewal = license.lastVerification || license.lastActivation || new Date();
    const beforeBlockade = this.designEngine.isBeforeFullBlockade(lastRenewal, 24);

    return {
      valid: true,
      license,
      slotType,
      offline,
      gracePeriodActive: false,
      hoursUntilRenewal: beforeBlockade.hoursUntilRenewal
    };
  }

  /**
   * Bestimmt Slot-Type basierend auf License
   */
  private determineSlotType(license: License): SlotType {
    if (license.status === 'suspended' || license.status === 'revoked') {
      return 'demo';
    }

    const profile = license.features.inertiaProfile;
    if (profile === 'premium') return 'premium';
    if (profile === 'purchased') return 'purchased';
    if (profile === 'prickle') return 'prickle_user';
    if (profile === 'free') return 'free';
    
    return 'demo';
  }

  /**
   * Erstellt Feature-Toggles
   */
  private createFeatureToggles(features: string[]): Record<string, boolean> {
    const toggles: Record<string, boolean> = {};
    for (const feature of features) {
      toggles[feature] = true;
    }
    return toggles;
  }

  /**
   * Generiert Voucher-ID
   */
  private generateVoucherId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `VOUCH-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Generiert License-ID
   */
  private generateLicenseId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `LIC-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Lädt aus Storage
   */
  private loadFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('voucher_license_gateway');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          // In Produktion: Aus Datenbank laden
        } catch (e) {
          console.error('Fehler beim Laden der Licenses:', e);
        }
      }
    }
  }

  /**
   * Speichert in Storage
   */
  private saveToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const data = {
        vouchers: Array.from(this.vouchers.entries()),
        licenses: Array.from(this.licenses.entries()),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('voucher_license_gateway', JSON.stringify(data));
    }
  }
}

// Export Singleton
export default VoucherLicenseGateway;




