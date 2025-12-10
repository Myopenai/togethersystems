// OCR Engine - Text aus Bildern/Briefen extrahieren
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV
//
// Nutzt Tesseract.js für Browser-basierte OCR

class OCREngine {
  constructor() {
    this.tesseract = null;
    this.initialized = false;
  }
  
  /**
   * Initialisiert Tesseract.js (lazy loading)
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Dynamisches Laden von Tesseract.js
      if (typeof window !== 'undefined' && window.Tesseract) {
        this.tesseract = window.Tesseract;
        this.initialized = true;
        return;
      }
      
      // Fallback: CDN laden
      if (typeof window !== 'undefined') {
        await this.loadTesseractFromCDN();
        this.initialized = true;
      }
    } catch (e) {
      console.error('OCR initialization error:', e);
      throw new Error('OCR Engine konnte nicht initialisiert werden');
    }
  }
  
  /**
   * Lädt Tesseract.js von CDN
   */
  async loadTesseractFromCDN() {
    return new Promise((resolve, reject) => {
      if (window.Tesseract) {
        this.tesseract = window.Tesseract;
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
      script.onload = () => {
        this.tesseract = window.Tesseract;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  /**
   * Extrahiert Text aus einem Bild (File, Blob, oder Image-Element)
   */
  async extractText(imageSource, language = 'deu+eng') {
    await this.initialize();
    
    if (!this.tesseract) {
      throw new Error('Tesseract.js nicht verfügbar');
    }
    
    try {
      const { data: { text } } = await this.tesseract.recognize(
        imageSource,
        language,
        {
          logger: (m) => {
            // Optional: Progress logging
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );
      
      return {
        text: text.trim(),
        success: true
      };
    } catch (e) {
      console.error('OCR extraction error:', e);
      return {
        text: '',
        success: false,
        error: e.message
      };
    }
  }
  
  /**
   * Extrahiert Text aus einem File-Input
   */
  async extractTextFromFile(file) {
    if (!file) {
      throw new Error('Keine Datei angegeben');
    }
    
    // Prüfe Dateityp
    if (!file.type.startsWith('image/')) {
      throw new Error('Datei muss ein Bild sein');
    }
    
    return await this.extractText(file);
  }
  
  /**
   * Extrahiert Text aus einem Canvas
   */
  async extractTextFromCanvas(canvas) {
    if (!canvas) {
      throw new Error('Kein Canvas angegeben');
    }
    
    return await this.extractText(canvas);
  }
  
  /**
   * Extrahiert Text aus einer URL
   */
  async extractTextFromURL(imageURL) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const result = await this.extractText(img);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
      img.src = imageURL;
    });
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OCREngine;
}
if (typeof window !== 'undefined') {
  window.OCREngine = OCREngine;
}


