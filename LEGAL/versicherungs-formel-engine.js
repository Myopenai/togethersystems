/**
 * Versicherungs-Formel-Engine
 * IBM-Standard: Zero-Defect, Industrial Fabrication Software
 * Version: 1.0.0-XXXL
 * Branding: T,.&T,,.&T,,,.(C)TEL1.NL
 * Branding-Code: [- - (.,[}.,{T{,.{),.]
 * 
 * Automatische Berechnung von Versicherungswerten basierend auf Formel-Klauseln
 */

class VersicherungsFormelEngine {
  constructor(config = {}) {
    this.config = {
      brandingCode: '[- - (.,[}.,{T{,.{),.]',
      tttFactor: 1.0, // TTT-Branding-Faktor (1.0 - 2.0)
      ...config
    };
  }

  /**
   * Formel 1: Kapital-Schätzung (Versicherungstechnisch)
   * V = Σᵢ₌₁ⁿ (Aᵢ × Pᵢ × Lᵢ × Rᵢ)
   */
  calculateVersicherungswert(assets) {
    let total = 0;

    assets.forEach(asset => {
      const {
        value: A_i,           // Asset-Wert
        praevalenz: P_i = 1.0, // Prävalenz-Faktor (flächenbezogen)
        lokation: L_i = 1.0,   // Lokations-Faktor
        risiko: R_i = 1.0      // Risiko-Faktor
      } = asset;

      const assetValue = A_i * P_i * L_i * R_i;
      total += assetValue;
    });

    return {
      formula: 'V = Σᵢ₌₁ⁿ (Aᵢ × Pᵢ × Lᵢ × Rᵢ)',
      versicherungswert: total,
      breakdown: assets.map(a => ({
        asset: a.name || 'Unknown',
        value: a.value,
        factors: {
          praevalenz: a.praevalenz || 1.0,
          lokation: a.lokation || 1.0,
          risiko: a.risiko || 1.0
        },
        calculated: a.value * (a.praevalenz || 1.0) * (a.lokation || 1.0) * (a.risiko || 1.0)
      })),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formel 2: Unendlichkeitslösung (Rechtsprechung)
   * U(P₁, P₂) = lim(n→∞) (P₁ⁿ + P₂ⁿ)^(1/n)
   */
  calculateUnendlichkeitsloesung(position1, position2, iterations = 1000) {
    // Approximation des Limes durch große n
    const n = iterations;
    const P1_pow_n = Math.pow(Math.abs(position1), n);
    const P2_pow_n = Math.pow(Math.abs(position2), n);
    const sum = P1_pow_n + P2_pow_n;
    const result = Math.pow(sum, 1 / n);

    // Signum bestimmen (welche Position ist größer)
    const sign = position1 >= position2 ? 1 : -1;

    return {
      formula: `U(P₁, P₂) = lim(n→∞) (P₁ⁿ + P₂ⁿ)^(1/n)`,
      position1,
      position2,
      iterations: n,
      loesung: sign * result,
      konvergenz: this.checkKonvergenz(position1, position2, iterations),
      timestamp: new Date().toISOString(),
      description: 'Unendlichkeitslösung für Rechtsprechung bei zwei gegenseitigen Parteien'
    };
  }

  /**
   * Konvergenz prüfen
   */
  checkKonvergenz(P1, P2, maxIterations = 1000) {
    const results = [];
    for (let n = 10; n <= maxIterations; n += 10) {
      const P1_pow_n = Math.pow(Math.abs(P1), n);
      const P2_pow_n = Math.pow(Math.abs(P2), n);
      const sum = P1_pow_n + P2_pow_n;
      const result = Math.pow(sum, 1 / n);
      results.push({ n, value: result });
    }

    // Prüfe ob konvergent (letzte 10 Werte variieren < 0.01)
    const last10 = results.slice(-10);
    const avg = last10.reduce((sum, r) => sum + r.value, 0) / last10.length;
    const variance = last10.reduce((sum, r) => sum + Math.pow(r.value - avg, 2), 0) / last10.length;

    return {
      konvergent: variance < 0.0001,
      variance,
      average: avg,
      iterations: results
    };
  }

  /**
   * Formel 3: Identifikation & Kontrolle
   * I(x) = { Identifizierung(x) | Wissen(x) = Bestätigt }
   */
  checkIdentifikationUndKontrolle(person, beweise) {
    const identifiziert = person.identifizierung === 'bestätigt';
    const wissen = beweise.wissen === 'bestätigt';
    const beweiseAusreichend = beweise.beweismaterial >= beweise.minimum;

    const haftung = identifiziert && wissen && beweiseAusreichend;

    return {
      formula: 'I(x) = { Identifizierung(x) | Wissen(x) = Bestätigt }',
      person: person.name || 'Unknown',
      identifiziert,
      wissen,
      beweiseAusreichend,
      haftung,
      begruendung: haftung
        ? 'Haftung gegeben: Identifizierung, Wissen und Beweismaterial bestätigt'
        : 'Keine Haftung: Fehlende Identifikation, Wissen oder Beweismaterial',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formel 4: Börsenkapital-Schätzung
   * C_Börse = Σᵢ₌₁ⁿ (Aᵢ × Mᵢ × Sᵢ × TTTᵢ)
   */
  calculateBoersenkapital(assets, tttFactor = null) {
    const TTT_i = tttFactor || this.config.tttFactor;

    let total = 0;
    const breakdown = [];

    assets.forEach(asset => {
      const {
        value: A_i,           // Asset-Wert
        multiplikator: M_i = 1.0, // Multiplikator-Faktor
        skalierung: S_i = 1.0,    // Skalierungs-Faktor (flächendeckend)
        ttt: assetTTT = TTT_i     // TTT-Branding-Faktor
      } = asset;

      const assetValue = A_i * M_i * S_i * assetTTT;
      total += assetValue;

      breakdown.push({
        asset: asset.name || 'Unknown',
        basiswert: A_i,
        multiplikator: M_i,
        skalierung: S_i,
        tttFaktor: assetTTT,
        berechnet: assetValue
      });
    });

    return {
      formula: 'C_Börse = Σᵢ₌₁ⁿ (Aᵢ × Mᵢ × Sᵢ × TTTᵢ)',
      boersenkapital: total,
      tttFactor: TTT_i,
      breakdown,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Formel 5: Globale Fabrikage (Flächendeckend)
   * F_Global = Σᵢ₌₁ⁿ (Mᵢ × Aᵢ × Pᵢ × Dᵢ)
   */
  calculateGlobaleFabrikage(industriemodelle) {
    let total = 0;
    const breakdown = [];

    industriemodelle.forEach(modell => {
      const {
        modellTyp: M_i,
        anzahlStandorte: A_i,
        produktionskapazitaet: P_i,
        durchschnittswert: D_i
      } = modell;

      const modellWert = M_i * A_i * P_i * D_i;
      total += modellWert;

      breakdown.push({
        modell: modell.name || 'Unknown',
        modellTyp: M_i,
        anzahlStandorte: A_i,
        produktionskapazitaet: P_i,
        durchschnittswert: D_i,
        berechnet: modellWert
      });
    });

    return {
      formula: 'F_Global = Σᵢ₌₁ⁿ (Mᵢ × Aᵢ × Pᵢ × Dᵢ)',
      globaleFabrikage: total,
      breakdown,
      anzahlModelle: industriemodelle.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Versicherungsprämie berechnen
   * Prämie = V × r × (1 + R_Risiko)
   */
  calculatePraemie(versicherungswert, zinsatz, risikoZuschlag = 0) {
    const praemie = versicherungswert * zinsatz * (1 + risikoZuschlag);

    return {
      formula: 'Prämie = V × r × (1 + R_Risiko)',
      versicherungswert,
      zinsatz,
      risikoZuschlag,
      praemie,
      jaehrlich: praemie,
      monatlich: praemie / 12,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Automatische Versicherungsgesellschaft-Erklärung generieren
   */
  generateVersicherungsgesellschaftErklaerung(data) {
    const kapital = this.calculateVersicherungswert(data.kapitalVermoegen || []);
    const finanzVermoegen = this.calculateVersicherungswert(data.finanzVermoegen || []);
    const fabrikage = this.calculateGlobaleFabrikage(data.fabrikage || []);
    const boersenkapital = this.calculateBoersenkapital(data.boersenAssets || []);

    const gesamtKapital = kapital.versicherungswert + finanzVermoegen.versicherungswert;
    const gesamtWert = gesamtKapital + fabrikage.globaleFabrikage + boersenkapital.boersenkapital;

    return {
      erklaerung: {
        versicherungsnehmer: data.versicherungsnehmer || 'Unknown',
        datum: new Date().toISOString(),
        branding: this.config.brandingCode,
        logo: 'T,.&T,,.&T,,,.(C)TEL1.NL'
      },
      kapitalsumme: {
        formula: 'K = Σ (Kapitalvermögen + Finanzvermögen)',
        wert: gesamtKapital,
        breakdown: {
          kapitalVermoegen: kapital,
          finanzVermoegen: finanzVermoegen
        }
      },
      finanzvermoegen: {
        formula: 'F = Σ (Beweglich + Unbeweglich)',
        wert: finanzVermoegen.versicherungswert,
        breakdown: finanzVermoegen.breakdown
      },
      fabrikage: {
        formula: 'Fab = Σᵢ₌₁ⁿ (Mᵢ × Aᵢ × Pᵢ × Dᵢ)',
        wert: fabrikage.globaleFabrikage,
        anzahlModelle: fabrikage.anzahlModelle,
        breakdown: fabrikage.breakdown,
        beschreibung: 'Flächendeckend auf der Erde für jedes industrielle Modell'
      },
      potenziellesKapital: {
        formula: 'C_Börse = Σᵢ₌₁ⁿ (Aᵢ × Mᵢ × Sᵢ × TTTᵢ)',
        wert: boersenkapital.boersenkapital,
        beschreibung: 'Für geplanten Börsenzugang unter drei großen T\'s (TTT)',
        breakdown: boersenkapital.breakdown
      },
      gesamtWert: {
        formula: 'V_Total = K + F + Fab + C_Börse',
        wert: gesamtWert,
        aufschlüsselung: {
          kapitalsumme: gesamtKapital,
          fabrikage: fabrikage.globaleFabrikage,
          boersenkapital: boersenkapital.boersenkapital
        }
      },
      versicherungsprämie: data.zinsatz
        ? this.calculatePraemie(gesamtWert, data.zinsatz, data.risikoZuschlag || 0)
        : null,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Branding-Code-Faktor berechnen
   * [- - (.,[}.,{T{,.{),.]
   */
  calculateBrandingCodeFactor() {
    const code = this.config.brandingCode;
    
    // Analysiere Branding-Code
    const tCount = (code.match(/T/g) || []).length;
    const bracketCount = (code.match(/[\[\{\(]/g) || []).length;
    const dotCount = (code.match(/\./g) || []).length;
    
    // Berechne Faktor basierend auf Code-Struktur
    const factor = 1.0 + (tCount * 0.1) + (bracketCount * 0.05) + (dotCount * 0.02);
    
    return {
      code: this.config.brandingCode,
      tCount,
      bracketCount,
      dotCount,
      factor: Math.min(factor, 2.0), // Max 2.0
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Vollständige Berechnung mit Branding
   */
  calculateComplete(assets, options = {}) {
    const branding = this.calculateBrandingCodeFactor();
    const baseValue = this.calculateVersicherungswert(assets);
    const brandedValue = baseValue.versicherungswert * branding.factor;

    return {
      ...baseValue,
      branding,
      versicherungswertOhneBranding: baseValue.versicherungswert,
      versicherungswertMitBranding: brandedValue,
      brandingMultiplikator: branding.factor
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VersicherungsFormelEngine;
} else {
  window.VersicherungsFormelEngine = VersicherungsFormelEngine;
}

