/**
 * T,.&T,,. Verschlüsselung
 * 
 * T,. (Punkt) = Public Key / Start
 * T,,. (Komma) = Private Key / Continuation
 * T,.&T,,. = Kombinierter Verschlüsselungs-Algorithmus
 */

import crypto from 'crypto';

/**
 * T,.&T,,. Encryption Manager
 */
export class TTTEncryptionManager {
  constructor() {
    this.publicKey = 'T,.';
    this.privateKey = 'T,,.';
    this.algorithm = 'T,.&T,,.';
  }

  /**
   * Generiert T,.&T,,. Key-Pair
   */
  generateKeyPair() {
    // T,. (Public Key) - Start/Origin
    const publicKey = this.generatePublicKey();
    
    // T,,. (Private Key) - Continuation
    const privateKey = this.generatePrivateKey();
    
    return {
      publicKey: `T,.${publicKey}`,
      privateKey: `T,,.${privateKey}`,
      algorithm: this.algorithm,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generiert Public Key (T,.)
   */
  generatePublicKey() {
    // T,. = Start/Origin - Öffentlich
    const random = crypto.randomBytes(32);
    return random.toString('base64').substring(0, 32);
  }

  /**
   * Generiert Private Key (T,,.)
   */
  generatePrivateKey() {
    // T,,. = Continuation - Privat
    const random = crypto.randomBytes(32);
    return random.toString('base64').substring(0, 32);
  }

  /**
   * Verschlüsselt Daten mit T,.&T,,.
   */
  encrypt(data, keyPair = null) {
    if (!keyPair) {
      keyPair = this.generateKeyPair();
    }

    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Kombiniere T,. (Public) und T,,. (Private) für Verschlüsselung
    const combinedKey = this.combineKeys(keyPair.publicKey, keyPair.privateKey);
    
    // AES-256-GCM Verschlüsselung
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', combinedKey, iv);
    
    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      publicKey: keyPair.publicKey,
      algorithm: this.algorithm,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Entschlüsselt Daten mit T,.&T,,.
   */
  decrypt(encryptedData, privateKey) {
    const { encrypted, iv, authTag, publicKey } = encryptedData;
    
    // Kombiniere Keys
    const combinedKey = this.combineKeys(publicKey, privateKey);
    
    // Entschlüsselung
    const decipher = crypto.createDecipheriv('aes-256-gcm', combinedKey, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Kombiniert T,. (Public) und T,,. (Private) Keys
   */
  combineKeys(publicKey, privateKey) {
    // Entferne T,. und T,,. Präfixe
    const pub = publicKey.replace('T,.', '');
    const priv = privateKey.replace('T,,.', '');
    
    // Kombiniere Keys
    const combined = pub + priv;
    
    // Erstelle 32-Byte Key für AES-256
    return crypto.createHash('sha256').update(combined).digest();
  }

  /**
   * Signiert Daten mit T,.&T,,.
   */
  sign(data, privateKey) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const key = privateKey.replace('T,,.', '');
    
    const signature = crypto.createHmac('sha256', key)
      .update(dataString)
      .digest('hex');
    
    return {
      signature: `T,.&T,,.${signature}`,
      algorithm: this.algorithm,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Verifiziert Signatur
   */
  verify(data, signature, publicKey) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const sig = signature.replace('T,.&T,,.', '');
    const key = publicKey.replace('T,.', '');
    
    const expectedSignature = crypto.createHmac('sha256', key)
      .update(dataString)
      .digest('hex');
    
    return sig === expectedSignature;
  }

  /**
   * Verschlüsselt Settings
   */
  encryptSettings(settings) {
    const keyPair = this.generateKeyPair();
    const encrypted = this.encrypt(settings, keyPair);
    
    return {
      ...encrypted,
      keyPair: {
        publicKey: keyPair.publicKey,
        // Private Key wird separat gespeichert
      }
    };
  }

  /**
   * Entschlüsselt Settings
   */
  decryptSettings(encryptedSettings, privateKey) {
    return JSON.parse(this.decrypt(encryptedSettings, privateKey));
  }
}

/**
 * Singleton-Instanz
 */
export const tttEncryption = new TTTEncryptionManager();








