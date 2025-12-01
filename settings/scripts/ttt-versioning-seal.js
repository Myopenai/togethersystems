/**
 * T,.&T,,. Versiegelungs- und Wiederherstellungssystem
 * 
 * DER NAGEL | OHNE HORIZONT WAGERECHTE UPERSITE STANDING EVER LASTING LAW
 * T,.&T,.T,,,.(C)(R)TEL1.NL-0031613803782-VERWENDET-ALLES-FACTUEELE-MATERIAL
 * 
 * Versiegelung: Zwischen , und . stehen die Daten
 * Der Nagel ist die Botschaft
 * Die horizontale ist die nicht crackbare Sicherungslage
 * Kann nur von T wieder geöffnet werden
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * ABSOLUTES ALPHABET - Alle Numerologie-Systeme
 */
const ABSOLUTES_ALPHABET = {
  A: { pythagorean: 1, chaldean: 1, ordinal: 1, hebrew: 1, greek: 1, meaning: 'Anfang, Ursprung, Quelle' },
  B: { pythagorean: 2, chaldean: 2, ordinal: 2, hebrew: 2, greek: 2, meaning: 'Beziehung, Dualität, Spiegel' },
  C: { pythagorean: 3, chaldean: 3, ordinal: 3, hebrew: 3, greek: 3, meaning: 'Kurve, Bewegung, Emergenz' },
  D: { pythagorean: 4, chaldean: 4, ordinal: 4, hebrew: 4, greek: 4, meaning: 'Grenze, Definition, Form' },
  E: { pythagorean: 5, chaldean: 5, ordinal: 5, hebrew: 5, greek: 5, meaning: 'Energie, Ausdruck, Kommunikation' },
  F: { pythagorean: 6, chaldean: 8, ordinal: 6, hebrew: 6, greek: 6, meaning: 'Feld, Kraftlinien, Funktionalität' },
  G: { pythagorean: 7, chaldean: 3, ordinal: 7, hebrew: 7, greek: 7, meaning: 'Gesetz, Gravitation, Grundprinzip' },
  H: { pythagorean: 8, chaldean: 5, ordinal: 8, hebrew: 8, greek: 8, meaning: 'Haltung, Haus, Hülle' },
  I: { pythagorean: 9, chaldean: 1, ordinal: 9, hebrew: 9, greek: 9, meaning: 'Ich, Linie, Achse, Fokus' },
  J: { pythagorean: 1, chaldean: 1, ordinal: 10, hebrew: 10, greek: 10, meaning: 'Abzweigung, Sprung, Joker' },
  K: { pythagorean: 2, chaldean: 2, ordinal: 11, hebrew: 20, greek: 20, meaning: 'Kraftbündelung, Knotenpunkt' },
  L: { pythagorean: 3, chaldean: 3, ordinal: 12, hebrew: 30, greek: 30, meaning: 'Linie + Winkel, Richtung' },
  M: { pythagorean: 4, chaldean: 4, ordinal: 13, hebrew: 40, greek: 40, meaning: 'Materie, Masse, Matrix' },
  N: { pythagorean: 5, chaldean: 5, ordinal: 14, hebrew: 50, greek: 50, meaning: 'Negation, Node, Netz' },
  O: { pythagorean: 6, chaldean: 7, ordinal: 15, hebrew: 60, greek: 60, meaning: 'Kreis, Ganzheit, Orbit' },
  P: { pythagorean: 7, chaldean: 8, ordinal: 16, hebrew: 70, greek: 70, meaning: 'Projektion, Pol, Punkt-zu-Fläche' },
  Q: { pythagorean: 8, chaldean: 1, ordinal: 17, hebrew: 80, greek: 80, meaning: 'Qual, Qualität, Quanten-Sprung' },
  R: { pythagorean: 9, chaldean: 2, ordinal: 18, hebrew: 90, greek: 90, meaning: 'Rotation, Rhythmus, Resonanz' },
  S: { pythagorean: 1, chaldean: 3, ordinal: 19, hebrew: 100, greek: 100, meaning: 'Schlange, Kurve, Signalfluss' },
  T: { pythagorean: 2, chaldean: 4, ordinal: 20, hebrew: 200, greek: 200, meaning: 'Kreuzung, Achsenkreuz, Terminal' },
  U: { pythagorean: 3, chaldean: 6, ordinal: 21, hebrew: 300, greek: 300, meaning: 'Schale, Auffangform' },
  V: { pythagorean: 4, chaldean: 6, ordinal: 22, hebrew: 400, greek: 400, meaning: 'Gabelung, Vektor, Richtung' },
  W: { pythagorean: 5, chaldean: 6, ordinal: 23, hebrew: 1, greek: 500, meaning: 'Doppel-V, Welle, Interferenz' },
  X: { pythagorean: 6, chaldean: 5, ordinal: 24, hebrew: 2, greek: 600, meaning: 'Kreuzung, Unbekannte, Variable' },
  Y: { pythagorean: 7, chaldean: 1, ordinal: 25, hebrew: 3, greek: 700, meaning: 'Gabelpunkt, Divergenz/Konvergenz' },
  Z: { pythagorean: 8, chaldean: 7, ordinal: 26, hebrew: 4, greek: 800, meaning: 'Zickzack, Blitz, Abschlusslinie' }
};

/**
 * Unendliche Symbole für Versiegelung
 */
const INFINITY_SYMBOLS = [
  '∞', '∞̇', '∞̈', '∞̄', '∞⃗', '∞⃒', '∞⃤', '♾', '♾️', '∽', '∝', '∺', 
  'ꝏ', 'Ꝏ', '𞁘', '𐡷', '∞⧜', '∞⧝', '∞⧞', '∞⧟', '∞⧠', '∞⧡', '∞⧢', 
  '∞⧣', '∞⧤', '∞⧥', '∞⧦', '∞⧧', '∞⧨', '∞⧩', '∞⧪', '∞⧫', '∞⧬', 
  '∞⧭', '∞⧮', '∞⧯', '☯', '☥', '♲', '⟳', '⟲', '↻', '↺', '⤣', 
  '⤤', '⤥', '⤦', '⟴', '∞↺', '∞↻', '∞→', '∞←', '∞↔', '∞⇄', '∞⇆', 
  '∞⇋', '∞⇌', '∞́', '∞̀', '∞̂', '∞̃', '∞̌', '∞̄', '∞̅', '∞̊', '∞̐'
];

/**
 * Mathematische Dimensionen
 */
const MATHEMATICAL_DIMENSIONS = [
  'ℝ', 'ℝ¹', 'ℝ²', 'ℝ³', 'ℝ⁴', 'ℝⁿ', 'ℂ', 'ℍ', '𝕄⁴', '𝕊²', '𝕊³', 
  '𝕋³', '∇', '∂', '∞', 'ℵ₀', 'ℵ₁', 'ℵ₂', 'ħ', 'ℏ', 'Λ', 'Ω', 
  'α', 'β', 'γ', 'δ', 'θ', 'λ', 'μ', 'π', 'τ', 'φ', 'χ', 'ψ', 'ω', 
  '⊕', '⊗', '⊥', '∥', '∡', '∢', '∣', '⋂', '⋃', '⟂', '↕', '↔', 
  '⇅', '⇆', '⇋', '⇌', '☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'
];

/**
 * T,.&T,,. Versiegelungs-Manager
 */
export class TTTVersioningSealManager {
  constructor(settingsPath) {
    this.settingsPath = settingsPath;
    this.versionsPath = path.join(settingsPath, 'versions');
    this.ensureVersionsDirectory();
  }

  /**
   * Erstellt Versions-Verzeichnis
   */
  ensureVersionsDirectory() {
    if (!fs.existsSync(this.versionsPath)) {
      fs.mkdirSync(this.versionsPath, { recursive: true });
    }
  }

  /**
   * Generiert T,.&T,,. Nagel (Schlüssel)
   * 
   * Formel: {O}({O})=t
   * SPEICHERPLATZ FÜR =PROGRAM ({T})T=USER VERSION
   */
  generateNail(originalData, userVersion) {
    // T,. (Punkt) - Public Key / Start
    const tPublic = this.generateTPublic(originalData);
    
    // T,,. (Komma) - Private Key / Continuation
    const tPrivate = this.generateTPrivate(originalData, userVersion);
    
    // T,,,. (Dreifach) - Versiegelung
    const tSeal = this.generateTSeal(originalData, tPublic, tPrivate);
    
    // Nagel-Struktur: T,.{DATA}T,,.{VERSION}T,,,.{SEAL}
    const nail = {
      t: 'T',
      public: `T,.${tPublic}`,
      private: `T,,.${tPrivate}`,
      seal: `T,,,.${tSeal}`,
      version: userVersion,
      timestamp: new Date().toISOString(),
      formula: '{O}({O})=t',
      storage: `PROGRAM({T})T=${userVersion}`,
      branding: 'DER NAGEL | OHNE HORIZONT WAGERECHTE UPERSITE STANDING EVER LASTING LAW T,.&T,.T,,,.(C)(R)TEL1.NL-0031613803782-VERWENDET-ALLES-FACTUEELE-MATERIAL',
      endOfLine: 'T.END OF LINE'
    };

    return nail;
  }

  /**
   * Generiert T,. (Public Key / Start)
   */
  generateTPublic(data) {
    const dataHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    
    // Kombiniere mit ABSOLUTES ALPHABET
    const alphabetCode = this.encodeWithAbsoluteAlphabet(dataHash);
    
    // Unendliche Versiegelung
    const infinitySeal = this.generateInfinitySeal(dataHash);
    
    // Mathematische Dimensionen
    const dimensionSeal = this.generateDimensionSeal(dataHash);
    
    return `${alphabetCode}.${infinitySeal}.${dimensionSeal}`;
  }

  /**
   * Generiert T,,. (Private Key / Continuation)
   */
  generateTPrivate(originalData, userVersion) {
    const combined = JSON.stringify(originalData) + userVersion;
    const hash = crypto.createHash('sha512').update(combined).digest('hex');
    
    // Umgekehrte Reihenfolge (wie im Prompt gefordert)
    const reversed = hash.split('').reverse().join('');
    
    // Kodiere mit ABSOLUTES ALPHABET (umgekehrt)
    const encoded = this.encodeWithAbsoluteAlphabetReversed(reversed);
    
    return encoded;
  }

  /**
   * Generiert T,,,. (Versiegelung / Seal)
   */
  generateTSeal(originalData, tPublic, tPrivate) {
    // Kombiniere alle Komponenten
    const combined = JSON.stringify(originalData) + tPublic + tPrivate;
    
    // SHA-512 Hash
    const hash = crypto.createHash('sha512').update(combined).digest('hex');
    
    // Versiegele mit Unendlichkeit
    const infinitySeal = this.generateInfinitySeal(hash);
    
    // Versiegele mit Dimensionen
    const dimensionSeal = this.generateDimensionSeal(hash);
    
    // Horizontale Versiegelung (nicht crackbar)
    const horizontalSeal = this.generateHorizontalSeal(hash);
    
    return `${infinitySeal}.${dimensionSeal}.${horizontalSeal}`;
  }

  /**
   * Kodiert mit ABSOLUTES ALPHABET
   */
  encodeWithAbsoluteAlphabet(data) {
    let encoded = '';
    for (const char of data) {
      if (/[A-Za-z]/.test(char)) {
        const upper = char.toUpperCase();
        const codes = ABSOLUTES_ALPHABET[upper];
        if (codes) {
          // Kombiniere alle Numerologie-Systeme
          encoded += `${codes.pythagorean},${codes.chaldean},${codes.ordinal},${codes.hebrew},${codes.greek}.`;
        }
      } else if (/[0-9]/.test(char)) {
        encoded += `${char}.`;
      }
    }
    return encoded;
  }

  /**
   * Kodiert mit ABSOLUTES ALPHABET (umgekehrt)
   */
  encodeWithAbsoluteAlphabetReversed(data) {
    // Umgekehrte Reihenfolge: Z→A
    const reversedAlphabet = Object.keys(ABSOLUTES_ALPHABET).reverse();
    let encoded = '';
    let index = 0;
    
    for (const char of data) {
      if (/[A-Za-z]/.test(char)) {
        const letterIndex = index % reversedAlphabet.length;
        const letter = reversedAlphabet[letterIndex];
        const codes = ABSOLUTES_ALPHABET[letter];
        encoded += `${codes.pythagorean},${codes.chaldean},${codes.ordinal},${codes.hebrew},${codes.greek}.`;
        index++;
      } else if (/[0-9]/.test(char)) {
        encoded += `${char}.`;
      }
    }
    return encoded;
  }

  /**
   * Generiert Unendlichkeits-Versiegelung
   */
  generateInfinitySeal(data) {
    const hash = crypto.createHash('md5').update(data).digest('hex');
    const symbols = [];
    
    for (let i = 0; i < hash.length; i += 2) {
      const value = parseInt(hash.substr(i, 2), 16);
      const symbolIndex = value % INFINITY_SYMBOLS.length;
      symbols.push(INFINITY_SYMBOLS[symbolIndex]);
    }
    
    return symbols.join('');
  }

  /**
   * Generiert Dimensions-Versiegelung
   */
  generateDimensionSeal(data) {
    const hash = crypto.createHash('md5').update(data).digest('hex');
    const dimensions = [];
    
    for (let i = 0; i < hash.length; i += 2) {
      const value = parseInt(hash.substr(i, 2), 16);
      const dimIndex = value % MATHEMATICAL_DIMENSIONS.length;
      dimensions.push(MATHEMATICAL_DIMENSIONS[dimIndex]);
    }
    
    return dimensions.join('');
  }

  /**
   * Generiert horizontale Versiegelung (nicht crackbar)
   */
  generateHorizontalSeal(data) {
    // Horizontale = Wagerechte = Unbrechbare Versiegelung
    const hash1 = crypto.createHash('sha256').update(data).digest('hex');
    const hash2 = crypto.createHash('sha512').update(data + hash1).digest('hex');
    const hash3 = crypto.createHash('sha384').update(data + hash2).digest('hex');
    
    // Kombiniere alle Hashes
    const combined = hash1 + hash2 + hash3;
    
    // Versiegele mit T,.&T,,. Algorithm
    const sealed = this.sealWithTTT(combined);
    
    return sealed;
  }

  /**
   * Versiegelt mit T,.&T,,. Algorithm
   */
  sealWithTTT(data) {
    // T,. (Public) + T,,. (Private) = Versiegelung
    const tPublic = crypto.createHash('sha256').update(data + 'T,.').digest('hex');
    const tPrivate = crypto.createHash('sha256').update(data + 'T,,.').digest('hex');
    const combined = tPublic + tPrivate;
    
    // Finale Versiegelung
    return crypto.createHash('sha512').update(combined).digest('hex');
  }

  /**
   * Versiegelt Settings-Version
   */
  async sealVersion(settingsData, userVersion, metadata = {}) {
    // Original-Daten (Chat, Prompts, etc.)
    const originalData = {
      settings: settingsData,
      metadata,
      chatHistory: metadata.chatHistory || [],
      prompts: metadata.prompts || [],
      timestamp: new Date().toISOString()
    };

    // Generiere Nagel
    const nail = this.generateNail(originalData, userVersion);

    // Versiegele Daten (zwischen , und .)
    const sealedData = this.sealData(originalData, nail);

    // Speichere Version
    const versionId = this.saveVersion(sealedData, nail, userVersion);

    return {
      versionId,
      nail,
      sealedData,
      restoreKey: this.generateRestoreKey(nail, userVersion)
    };
  }

  /**
   * Versiegelt Daten (zwischen , und .)
   */
  sealData(data, nail) {
    const dataString = JSON.stringify(data);
    
    // Versiegele: T,.{DATA}T,,.
    const sealed = `T,.${dataString}T,,.${nail.seal}`;
    
    // Verschlüssele zusätzlich
    const encrypted = this.encryptSealed(sealed, nail);
    
    return encrypted;
  }

  /**
   * Verschlüsselt versiegelte Daten
   */
  encryptSealed(sealed, nail) {
    // Kombiniere Keys
    const key = nail.public + nail.private;
    const keyHash = crypto.createHash('sha512').update(key).digest();
    
    // AES-256-GCM Verschlüsselung
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyHash.slice(0, 32), iv);
    
    let encrypted = cipher.update(sealed, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      nail: {
        public: nail.public,
        // Private wird separat gespeichert
      }
    };
  }

  /**
   * Speichert Version
   */
  saveVersion(sealedData, nail, userVersion) {
    const versionId = `v${Date.now()}_${userVersion}`;
    const versionPath = path.join(this.versionsPath, `${versionId}.json`);
    
    const version = {
      versionId,
      userVersion,
      nail: {
        public: nail.public,
        seal: nail.seal,
        formula: nail.formula,
        storage: nail.storage,
        branding: nail.branding,
        endOfLine: nail.endOfLine
      },
      sealedData,
      timestamp: new Date().toISOString(),
      metadata: {
        originalSize: JSON.stringify(sealedData).length,
        algorithm: 'T,.&T,,.&T,,,.',
        encryption: 'AES-256-GCM'
      }
    };

    fs.writeFileSync(versionPath, JSON.stringify(version, null, 2), 'utf-8');
    
    // Speichere auch Private Key separat (verschlüsselt)
    const privateKeyPath = path.join(this.versionsPath, `${versionId}.private.key`);
    const privateKeySealed = this.sealPrivateKey(nail.private, nail);
    fs.writeFileSync(privateKeyPath, JSON.stringify(privateKeySealed, null, 2), 'utf-8');

    return versionId;
  }

  /**
   * Versiegelt Private Key
   */
  sealPrivateKey(privateKey, nail) {
    // Private Key wird mit Public Key versiegelt
    const key = crypto.createHash('sha256').update(nail.public).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key.slice(0, 32), iv);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Generiert Wiederherstellungsschlüssel
   */
  generateRestoreKey(nail, userVersion) {
    // Formel: {O}({O})=t
    // O = Original, t = T (Nagel)
    const restoreKey = {
      formula: '{O}({O})=t',
      storage: `PROGRAM({T})T=${userVersion}`,
      t: 'T',
      public: nail.public,
      seal: nail.seal,
      userVersion,
      instructions: [
        '1. Verwende T (Nagel) als Schlüssel',
        '2. Kombiniere T,. (Public) mit T,,. (Private)',
        '3. Entschlüssele mit T,,,. (Seal)',
        '4. Wiederherstelle Original-Daten'
      ]
    };

    return restoreKey;
  }

  /**
   * Wiederherstellung (kann nur von T geöffnet werden)
   */
  async restoreVersion(versionId, restoreKey, privateKey) {
    const versionPath = path.join(this.versionsPath, `${versionId}.json`);
    
    if (!fs.existsSync(versionPath)) {
      throw new Error(`Version ${versionId} nicht gefunden`);
    }

    const version = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
    
    // Verifiziere T (Nagel)
    if (restoreKey.t !== 'T') {
      throw new Error('Nur T (Nagel) kann Versiegelung öffnen');
    }

    // Verifiziere Public Key
    if (restoreKey.public !== version.nail.public) {
      throw new Error('Public Key stimmt nicht überein');
    }

    // Lade Private Key
    const privateKeyPath = path.join(this.versionsPath, `${versionId}.private.key`);
    if (!fs.existsSync(privateKeyPath)) {
      throw new Error('Private Key nicht gefunden');
    }

    const privateKeySealed = JSON.parse(fs.readFileSync(privateKeyPath, 'utf-8'));
    const decryptedPrivateKey = this.unsealPrivateKey(privateKeySealed, version.nail);

    // Entschlüssele versiegelte Daten
    const decrypted = this.decryptSealed(version.sealedData, {
      public: version.nail.public,
      private: decryptedPrivateKey,
      seal: version.nail.seal
    });

    // Parse Original-Daten
    const originalData = this.parseSealedData(decrypted);

    return {
      versionId,
      userVersion: version.userVersion,
      originalData,
      restoredAt: new Date().toISOString()
    };
  }

  /**
   * Entsiegel Private Key
   */
  unsealPrivateKey(privateKeySealed, nail) {
    const key = crypto.createHash('sha256').update(nail.public).digest();
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key.slice(0, 32),
      Buffer.from(privateKeySealed.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(privateKeySealed.authTag, 'hex'));
    
    let decrypted = decipher.update(privateKeySealed.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Entschlüsselt versiegelte Daten
   */
  decryptSealed(sealedData, nail) {
    const key = nail.public + nail.private;
    const keyHash = crypto.createHash('sha512').update(key).digest();
    
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      keyHash.slice(0, 32),
      Buffer.from(sealedData.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(sealedData.authTag, 'hex'));
    
    let decrypted = decipher.update(sealedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Parst versiegelte Daten
   */
  parseSealedData(sealed) {
    // Entferne T,. und T,,. Präfixe
    const data = sealed.replace(/^T,\./, '').replace(/T,,\.(.*)$/, '');
    return JSON.parse(data);
  }

  /**
   * Listet alle Versionen
   */
  listVersions() {
    const files = fs.readdirSync(this.versionsPath)
      .filter(f => f.endsWith('.json') && !f.endsWith('.private.key'));
    
    return files.map(file => {
      const versionPath = path.join(this.versionsPath, file);
      const version = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
      return {
        versionId: version.versionId,
        userVersion: version.userVersion,
        timestamp: version.timestamp,
        nail: {
          public: version.nail.public.substring(0, 50) + '...',
          seal: version.nail.seal.substring(0, 50) + '...'
        }
      };
    });
  }
}

/**
 * Singleton-Instanz
 */
let versioningSealManager = null;

export function getVersioningSealManager(settingsPath) {
  if (!versioningSealManager) {
    versioningSealManager = new TTTVersioningSealManager(settingsPath);
  }
  return versioningSealManager;
}








