// E2E-Verschlüsselung Manager
// WebCrypto API + Public-Key-Infrastructure (PKI)

class E2EEncryptionManager {
  constructor() {
    this.keyPair = null;
    this.publicKeys = new Map(); // userId → publicKey
    this.sharedSecrets = new Map(); // conversationId → sharedSecret
  }

  // Initialisieren: Key-Pair generieren oder laden
  async init() {
    try {
      // Versuche gespeichertes Key-Pair zu laden
      const savedKeys = this.loadKeyPair();
      
      if (savedKeys) {
        this.keyPair = {
          publicKey: await this.importPublicKey(savedKeys.publicKey),
          privateKey: await this.importPrivateKey(savedKeys.privateKey),
          rawPublicKey: savedKeys.publicKey,
          rawPrivateKey: savedKeys.privateKey,
        };
      } else {
        // Neues Key-Pair generieren
        await this.generateKeyPair();
      }

      // Öffentliche Schlüssel anderer User laden
      await this.loadPublicKeys();

      return true;
    } catch (err) {
      console.error('E2E-Encryption Init Fehler:', err);
      return false;
    }
  }

  // Key-Pair generieren
  async generateKeyPair() {
    try {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        true, // exportable
        ['deriveKey', 'deriveBits']
      );

      // Public Key exportieren
      const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey);
      const publicKeyBase64 = this.arrayBufferToBase64(publicKeyBuffer);

      // Private Key exportieren
      const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const privateKeyBase64 = this.arrayBufferToBase64(privateKeyBuffer);

      this.keyPair = {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        rawPublicKey: publicKeyBase64,
        rawPrivateKey: privateKeyBase64,
      };

      // Key-Pair speichern
      this.saveKeyPair();

      return this.keyPair;
    } catch (err) {
      console.error('Key-Pair generieren Fehler:', err);
      throw err;
    }
  }

  // Öffentlichen Schlüssel exportieren (für Austausch)
  async exportPublicKey() {
    if (!this.keyPair) {
      throw new Error('Kein Key-Pair vorhanden');
    }
    return this.keyPair.rawPublicKey;
  }

  // Öffentlichen Schlüssel importieren
  async importPublicKey(base64Key) {
    try {
      const keyBuffer = this.base64ToArrayBuffer(base64Key);
      return await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        false, // nicht exportable
        []
      );
    } catch (err) {
      console.error('Public Key importieren Fehler:', err);
      throw err;
    }
  }

  // Privaten Schlüssel importieren
  async importPrivateKey(base64Key) {
    try {
      const keyBuffer = this.base64ToArrayBuffer(base64Key);
      return await crypto.subtle.importKey(
        'pkcs8',
        keyBuffer,
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        true, // exportable
        ['deriveKey', 'deriveBits']
      );
    } catch (err) {
      console.error('Private Key importieren Fehler:', err);
      throw err;
    }
  }

  // Shared Secret ableiten (für Konversation)
  async deriveSharedSecret(otherUserId, otherPublicKeyBase64) {
    const conversationId = this.getConversationId(otherUserId);
    
    // Prüfe ob bereits vorhanden
    if (this.sharedSecrets.has(conversationId)) {
      return this.sharedSecrets.get(conversationId);
    }

    try {
      const otherPublicKey = await this.importPublicKey(otherPublicKeyBase64);

      // Shared Secret ableiten
      const sharedSecret = await crypto.subtle.deriveBits(
        {
          name: 'ECDH',
          public: otherPublicKey,
        },
        this.keyPair.privateKey,
        256
      );

      // Als Key für Verschlüsselung ableiten
      const encryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: new Uint8Array(16), // In Produktion: zufälliger Salt pro Konversation
          iterations: 100000,
          hash: 'SHA-256',
        },
        await crypto.subtle.importKey(
          'raw',
          sharedSecret,
          'PBKDF2',
          false,
          ['deriveKey']
        ),
        {
          name: 'AES-GCM',
          length: 256,
        },
        false,
        ['encrypt', 'decrypt']
      );

      this.sharedSecrets.set(conversationId, encryptionKey);

      return encryptionKey;
    } catch (err) {
      console.error('Shared Secret ableiten Fehler:', err);
      throw err;
    }
  }

  // Nachricht verschlüsseln
  async encryptMessage(message, recipientUserId) {
    try {
      // Öffentlichen Schlüssel des Empfängers holen
      const recipientPublicKey = this.publicKeys.get(recipientUserId);
      if (!recipientPublicKey) {
        throw new Error(`Öffentlicher Schlüssel für ${recipientUserId} nicht gefunden`);
      }

      // Shared Secret ableiten
      const encryptionKey = await this.deriveSharedSecret(recipientUserId, recipientPublicKey);

      // Nachricht zu ArrayBuffer konvertieren
      const messageBuffer = new TextEncoder().encode(message);

      // IV (Initialization Vector) generieren
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Verschlüsseln
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        encryptionKey,
        messageBuffer
      );

      // IV + verschlüsselten Text kombinieren
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      // Base64 encodieren
      const encryptedBase64 = this.arrayBufferToBase64(combined.buffer);

      return {
        encrypted: encryptedBase64,
        iv: this.arrayBufferToBase64(iv),
        algorithm: 'AES-GCM',
        keyDerivation: 'ECDH+PBKDF2',
      };
    } catch (err) {
      console.error('Nachricht verschlüsseln Fehler:', err);
      throw err;
    }
  }

  // Nachricht entschlüsseln
  async decryptMessage(encryptedData, senderUserId) {
    try {
      // Shared Secret ableiten (braucht öffentlichen Schlüssel des Senders)
      const senderPublicKey = this.publicKeys.get(senderUserId);
      if (!senderPublicKey) {
        throw new Error(`Öffentlicher Schlüssel für ${senderUserId} nicht gefunden`);
      }

      const encryptionKey = await this.deriveSharedSecret(senderUserId, senderPublicKey);

      // IV + verschlüsselten Text trennen
      const combined = this.base64ToArrayBuffer(encryptedData.encrypted);
      const iv = new Uint8Array(combined, 0, 12);
      const encrypted = new Uint8Array(combined, 12);

      // Entschlüsseln
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        encryptionKey,
        encrypted
      );

      // Zu Text konvertieren
      const decryptedText = new TextDecoder().decode(decryptedBuffer);

      return decryptedText;
    } catch (err) {
      console.error('Nachricht entschlüsseln Fehler:', err);
      throw err;
    }
  }

  // Öffentlichen Schlüssel eines Users hinzufügen
  async addPublicKey(userId, publicKeyBase64) {
    try {
      // Validieren durch Import
      await this.importPublicKey(publicKeyBase64);
      
      this.publicKeys.set(userId, publicKeyBase64);
      
      // Speichern
      this.savePublicKeys();
      
      return true;
    } catch (err) {
      console.error('Public Key hinzufügen Fehler:', err);
      return false;
    }
  }

  // Öffentliche Schlüssel laden
  async loadPublicKeys() {
    try {
      const raw = localStorage.getItem('e2e_public_keys');
      if (raw) {
        const keys = JSON.parse(raw);
        for (const [userId, publicKey] of Object.entries(keys)) {
          this.publicKeys.set(userId, publicKey);
        }
      }
    } catch (err) {
      console.error('Public Keys laden Fehler:', err);
    }
  }

  // Öffentliche Schlüssel speichern
  savePublicKeys() {
    try {
      const keys = Object.fromEntries(this.publicKeys);
      localStorage.setItem('e2e_public_keys', JSON.stringify(keys));
    } catch (err) {
      console.error('Public Keys speichern Fehler:', err);
    }
  }

  // Key-Pair laden
  loadKeyPair() {
    try {
      const raw = localStorage.getItem('e2e_key_pair');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Key-Pair laden Fehler:', err);
    }
    return null;
  }

  // Key-Pair speichern
  saveKeyPair() {
    if (!this.keyPair) return;
    
    try {
      localStorage.setItem('e2e_key_pair', JSON.stringify({
        publicKey: this.keyPair.rawPublicKey,
        privateKey: this.keyPair.rawPrivateKey,
      }));
    } catch (err) {
      console.error('Key-Pair speichern Fehler:', err);
    }
  }

  // Konversations-ID generieren (sortiert für beide Richtungen gleich)
  getConversationId(userId) {
    const currentUserId = this.getCurrentUserId();
    const ids = [currentUserId, userId].sort();
    return `conv-${ids.join('-')}`;
  }

  // Helper: ArrayBuffer zu Base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Helper: Base64 zu ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Helper: Current User ID
  getCurrentUserId() {
    try {
      return localStorage.getItem('mot_user_id_v1') || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

// Globale Instanz
const e2eEncryption = new E2EEncryptionManager();

// Auto-Init
if (typeof window !== 'undefined') {
  e2eEncryption.init().then(success => {
    if (success) {
      console.log('✅ E2E-Verschlüsselung initialisiert');
    } else {
      console.warn('⚠️ E2E-Verschlüsselung konnte nicht initialisiert werden');
    }
  });
}

// Export
if (typeof window !== 'undefined') {
  window.E2EEncryptionManager = E2EEncryptionManager;
  window.e2eEncryption = e2eEncryption;
}


