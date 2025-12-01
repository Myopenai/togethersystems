/**
 * Alphabet-based User ID Service
 * Global kulturell neutral, nur A-Z, unbegrenzte Länge
 * 
 * T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT T,.&T,,.T,,,.(C)
 */

export interface UserIdentity {
  alphabetId: string; // Nur A-Z, beliebige Länge
  firstName: string;
  clearLastName: string; // Gespeichert, nicht öffentlich
  createdAt: Date;
  verified: boolean;
}

export interface UserIdReservation {
  alphabetId: string;
  reservedAt: Date;
  reservedBy: string;
  expiresAt?: Date;
}

export class AlphabetUserIdService {
  private static instance: AlphabetUserIdService;
  private reservedIds: Set<string> = new Set();
  private users: Map<string, UserIdentity> = new Map();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): AlphabetUserIdService {
    if (!AlphabetUserIdService.instance) {
      AlphabetUserIdService.instance = new AlphabetUserIdService();
    }
    return AlphabetUserIdService.instance;
  }

  /**
   * Validiert Alphabet-ID Format (nur A-Z, keine Sonderzeichen, keine Ziffern)
   */
  public validateAlphabetId(id: string): {
    valid: boolean;
    error?: string;
  } {
    if (!id || id.length === 0) {
      return { valid: false, error: 'Alphabet-ID darf nicht leer sein' };
    }

    // Nur A-Z erlaubt (Groß- und Kleinbuchstaben werden normalisiert)
    const normalizedId = id.toUpperCase();
    if (!/^[A-Z]+$/.test(normalizedId)) {
      return { valid: false, error: 'Alphabet-ID darf nur Buchstaben A-Z enthalten' };
    }

    return { valid: true };
  }

  /**
   * Generiert eine eindeutige Alphabet-ID
   */
  public generateAlphabetId(firstName: string, clearLastName: string, desiredLength: number = 8): string {
    // Basis-ID aus Initialen
    const initials = (firstName[0] || 'U').toUpperCase() + (clearLastName[0] || 'U').toUpperCase();
    
    // Füge zufällige Buchstaben hinzu bis zur gewünschten Länge
    let alphabetId = initials;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    while (alphabetId.length < desiredLength) {
      alphabetId += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    // Stelle sicher, dass ID eindeutig ist
    let attempts = 0;
    while (this.isReserved(alphabetId) && attempts < 100) {
      // Füge Suffix hinzu bei Kollision
      alphabetId += alphabet[Math.floor(Math.random() * alphabet.length)];
      attempts++;
    }

    // Wenn immer noch nicht eindeutig, füge Hash-Suffix hinzu
    if (this.isReserved(alphabetId)) {
      const hash = this.hashString(firstName + clearLastName + Date.now());
      const hashSuffix = this.hashToAlphabet(hash, 4);
      alphabetId = alphabetId.substring(0, desiredLength) + hashSuffix;
    }

    return alphabetId.toUpperCase();
  }

  /**
   * Reserviert Alphabet-ID
   */
  public reserveAlphabetId(alphabetId: string, reservedBy: string, expiresAt?: Date): {
    success: boolean;
    error?: string;
  } {
    const validation = this.validateAlphabetId(alphabetId);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const normalizedId = alphabetId.toUpperCase();

    if (this.isReserved(normalizedId)) {
      return { success: false, error: 'Alphabet-ID ist bereits reserviert' };
    }

    this.reservedIds.add(normalizedId);
    this.saveToStorage();

    return { success: true };
  }

  /**
   * Registriert User mit Alphabet-ID
   */
  public registerUser(
    alphabetId: string,
    firstName: string,
    clearLastName: string
  ): {
    success: boolean;
    user?: UserIdentity;
    error?: string;
  } {
    const validation = this.validateAlphabetId(alphabetId);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const normalizedId = alphabetId.toUpperCase();

    // Prüfe ob bereits registriert
    if (this.users.has(normalizedId)) {
      return { success: false, error: 'Alphabet-ID ist bereits registriert' };
    }

    // Erstelle User-Identität
    const user: UserIdentity = {
      alphabetId: normalizedId,
      firstName,
      clearLastName,
      createdAt: new Date(),
      verified: false
    };

    // Speichere User
    this.users.set(normalizedId, user);
    this.reservedIds.add(normalizedId);
    this.saveToStorage();

    return { success: true, user };
  }

  /**
   * Verifiziert User-Identität (Coherence-Check)
   */
  public verifyUserIdentity(
    alphabetId: string,
    firstName: string,
    clearLastName: string
  ): {
    verified: boolean;
    error?: string;
  } {
    const normalizedId = alphabetId.toUpperCase();
    const user = this.users.get(normalizedId);

    if (!user) {
      return { verified: false, error: 'User nicht gefunden' };
    }

    // Coherence-Check (weiche Regeln, keine harte Identitätsprüfung)
    if (user.firstName.toLowerCase() !== firstName.toLowerCase()) {
      return { verified: false, error: 'Vorname stimmt nicht überein' };
    }

    if (user.clearLastName.toLowerCase() !== clearLastName.toLowerCase()) {
      return { verified: false, error: 'Nachname stimmt nicht überein' };
    }

    // Verifiziere User
    user.verified = true;
    this.saveToStorage();

    return { verified: true };
  }

  /**
   * Hole User-Identität (ohne klarLastName für öffentliche Verwendung)
   */
  public getUser(alphabetId: string): Omit<UserIdentity, 'clearLastName'> | null {
    const normalizedId = alphabetId.toUpperCase();
    const user = this.users.get(normalizedId);

    if (!user) {
      return null;
    }

    // Entferne klarLastName für öffentliche Verwendung
    const { clearLastName, ...publicUser } = user;
    return publicUser;
  }

  /**
   * Prüft ob ID reserviert ist
   */
  private isReserved(alphabetId: string): boolean {
    return this.reservedIds.has(alphabetId.toUpperCase());
  }

  /**
   * Hash zu Alphabet konvertieren
   */
  private hashToAlphabet(hash: string, length: number): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    
    for (let i = 0; i < length && i < hash.length; i++) {
      const charCode = hash.charCodeAt(i);
      const index = charCode % alphabet.length;
      result += alphabet[index];
    }

    return result;
  }

  /**
   * Einfacher Hash-String (vereinfacht - in Produktion: SHA-256)
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Lädt aus Storage (localStorage oder Server)
   */
  private loadFromStorage(): void {
    // In Produktion: Aus Datenbank laden
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('alphabet_user_ids');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          this.reservedIds = new Set(data.reservedIds || []);
          // Users werden nicht in localStorage gespeichert (Datenschutz)
        } catch (e) {
          console.error('Fehler beim Laden der Alphabet-IDs:', e);
        }
      }
    }
  }

  /**
   * Speichert in Storage
   */
  private saveToStorage(): void {
    // In Produktion: In Datenbank speichern
    if (typeof localStorage !== 'undefined') {
      const data = {
        reservedIds: Array.from(this.reservedIds),
        // Users werden nicht in localStorage gespeichert (Datenschutz)
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('alphabet_user_ids', JSON.stringify(data));
    }
  }
}

// Export Singleton
export default AlphabetUserIdService;




