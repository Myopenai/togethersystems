/**
 * User-Friendliness Moral Coding Engine
 * Permanent Hard-Coded im System
 * 
 * T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT T,.&T,,.T,,,.(C)
 */

import { getBrandingManager } from './branding-manager';

export interface UserFriendlinessRules {
  uiLayer: {
    language: {
      simple: boolean;
      multilingual: boolean;
      noJargon: boolean;
      helpfulHints: boolean;
    };
    visual: {
      clearHierarchy: boolean;
      consistentDesign: boolean;
      responsive: boolean;
      loadingStates: boolean;
      errorMessagesHelpful: boolean;
    };
    interaction: {
      minimalClicks: boolean;
      undoPossible: boolean;
      confirmationForDestructive: boolean;
      progressiveDisclosure: boolean;
    };
  };
  codeLayer: {
    errorHandling: {
      alwaysTryCatch: boolean;
      userFriendlyErrors: boolean;
      recoverySuggestions: boolean;
      neverTechnicalStackTraces: boolean;
    };
    performance: {
      fastInitialLoad: boolean;
      progressiveEnhancement: boolean;
      lazyLoading: boolean;
      cachingStrategy: boolean;
    };
    security: {
      privacyByDesign: boolean;
      dataMinimization: boolean;
      explicitConsent: boolean;
      secureByDefault: boolean;
    };
  };
  moralLayer: {
    ethicalRules: string[];
    accessibilityRules: string[];
  };
}

export class UserFriendlinessMoralEngine {
  private static instance: UserFriendlinessMoralEngine;
  private rules: UserFriendlinessRules;
  private settingsPath: string;

  private constructor(settingsPath?: string) {
    this.settingsPath = settingsPath || './Settings';
    this.loadRules();
  }

  public static getInstance(settingsPath?: string): UserFriendlinessMoralEngine {
    if (!UserFriendlinessMoralEngine.instance) {
      UserFriendlinessMoralEngine.instance = new UserFriendlinessMoralEngine(settingsPath);
    }
    return UserFriendlinessMoralEngine.instance;
  }

  private loadRules(): void {
    // Rules werden aus USER-FRIENDLINESS-MORAL-CODING.json geladen
    this.rules = {
      uiLayer: {
        language: {
          simple: true,
          multilingual: true,
          noJargon: true,
          helpfulHints: true
        },
        visual: {
          clearHierarchy: true,
          consistentDesign: true,
          responsive: true,
          loadingStates: true,
          errorMessagesHelpful: true
        },
        interaction: {
          minimalClicks: true,
          undoPossible: true,
          confirmationForDestructive: true,
          progressiveDisclosure: true
        }
      },
      codeLayer: {
        errorHandling: {
          alwaysTryCatch: true,
          userFriendlyErrors: true,
          recoverySuggestions: true,
          neverTechnicalStackTraces: true
        },
        performance: {
          fastInitialLoad: true,
          progressiveEnhancement: true,
          lazyLoading: true,
          cachingStrategy: true
        },
        security: {
          privacyByDesign: true,
          dataMinimization: true,
          explicitConsent: true,
          secureByDefault: true
        }
      },
      moralLayer: {
        ethicalRules: [
          "Nie User-Daten ohne explizite Zustimmung sammeln",
          "Nie Dark Patterns verwenden",
          "Nie User in Abos locken ohne klare Transparenz",
          "Immer ehrliche Fehlermeldungen zeigen",
          "Immer Exit-Optionen anbieten",
          "Nie User zu Aktionen zwingen"
        ],
        accessibilityRules: [
          "WCAG 2.1 AA Minimum",
          "Keyboard-Navigation möglich",
          "Screen-Reader unterstützen",
          "Hoher Kontrast verfügbar",
          "Mehrsprachigkeit unterstützen"
        ]
      }
    };
  }

  /**
   * Validiert Code auf User-Friendliness
   */
  public validateCode(code: string): {
    valid: boolean;
    violations: string[];
    suggestions: string[];
  } {
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Prüfe auf try-catch
    if (!code.includes('try') && code.includes('async') || code.includes('await')) {
      violations.push('Fehlende try-catch Blöcke bei asynchronen Operationen');
      suggestions.push('Alle async/await Operationen sollten in try-catch Blöcken sein');
    }

    // Prüfe auf User-freundliche Fehlermeldungen
    if (code.includes('throw new Error') && !code.includes('user-friendly') && !code.includes('userMessage')) {
      violations.push('Fehlende User-freundliche Fehlermeldungen');
      suggestions.push('Error-Messages sollten user-friendly sein, nicht technisch');
    }

    // Prüfe auf Accessibility
    if (code.includes('<button') && !code.includes('aria-label') && !code.includes('aria-labelledby')) {
      violations.push('Fehlende Accessibility-Attribute');
      suggestions.push('Buttons sollten aria-label oder aria-labelledby haben');
    }

    // Prüfe auf Branding-Integration
    if (!code.includes('T,.&T,,.&T,,,.')) {
      suggestions.push('Brand-Mark sollte in allen Komponenten präsent sein');
    }

    return {
      valid: violations.length === 0,
      violations,
      suggestions
    };
  }

  /**
   * Prüft UI-Komponente auf User-Friendliness
   */
  public validateUI(component: any): {
    valid: boolean;
    violations: string[];
    suggestions: string[];
  } {
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Prüfe auf Loading-States
    if (!component.loadingState) {
      violations.push('Fehlender Loading-State');
      suggestions.push('UI sollte Loading-States für asynchrone Operationen haben');
    }

    // Prüfe auf Error-Handling
    if (!component.errorHandling) {
      violations.push('Fehlendes Error-Handling in UI');
      suggestions.push('UI sollte User-freundliche Error-Messages anzeigen');
    }

    // Prüfe auf Undo-Funktionalität
    if (component.destructiveAction && !component.undoPossible) {
      violations.push('Destruktive Aktionen ohne Undo');
      suggestions.push('Destruktive Aktionen sollten rückgängig machbar sein');
    }

    return {
      valid: violations.length === 0,
      violations,
      suggestions
    };
  }

  /**
   * Erstellt User-freundliche Fehlermeldung
   */
  public createUserFriendlyError(technicalError: string, context?: string): string {
    // Übersetze technische Fehler in User-freundliche Sprache
    const errorMap: Record<string, string> = {
      'network': 'Verbindungsproblem. Bitte überprüfe deine Internetverbindung.',
      'timeout': 'Die Anfrage dauerte zu lange. Bitte versuche es erneut.',
      '404': 'Die gewünschte Seite wurde nicht gefunden.',
      '500': 'Ein Serverfehler ist aufgetreten. Bitte versuche es später erneut.',
      'unauthorized': 'Du bist nicht berechtigt, diese Aktion auszuführen.',
      'forbidden': 'Zugriff verweigert.'
    };

    for (const [key, message] of Object.entries(errorMap)) {
      if (technicalError.toLowerCase().includes(key)) {
        return message + (context ? ` (${context})` : '');
      }
    }

    return 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut oder kontaktiere den Support.';
  }

  /**
   * Integriert Brand-Mark in Komponente
   */
  public integrateBrandMark(component: any): any {
    const brandingManager = getBrandingManager(this.settingsPath);
    const branding = brandingManager.getBranding();
    
    return {
      ...component,
      branding: {
        mark: branding.branding,
        full: branding.branding,
        short: 'T,.&T,,.&T,,,.',
        variants: {
          full: branding.branding,
          short: 'T,.&T,,.&T,,,.',
          international: 'TOGETHERSYSTEMS. INTERNATIONAL TTT',
          symbolic: 'T,.&T,,.&T,,,.'
        }
      },
      metadata: {
        ...component.metadata,
        brand: 'T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT T,.&T,,.T,,,.(C)'
      }
    };
  }

  /**
   * Prüft Moral-Compliance
   */
  public checkMoralCompliance(component: any): boolean {
    // Prüfe auf Dark Patterns
    if (component.darkPatterns) {
      console.error('❌ Dark Patterns erkannt - nicht erlaubt!');
      return false;
    }

    // Prüfe auf explizite Zustimmung für Daten
    if (component.dataCollection && !component.explicitConsent) {
      console.error('❌ Daten-Sammlung ohne explizite Zustimmung - nicht erlaubt!');
      return false;
    }

    // Prüfe auf Exit-Optionen
    if (component.requiresAction && !component.exitOption) {
      console.error('❌ Aktion ohne Exit-Option - nicht erlaubt!');
      return false;
    }

    return true;
  }
}

// Export Singleton
export default UserFriendlinessMoralEngine;




