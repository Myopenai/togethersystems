// Community-Mus System
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV

class CommunityMusicSystem {
  constructor() {
    this.audioContext = null;
    this.currentTone = null;
    this.roomMusic = new Map();
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext nicht verfügbar:', e);
    }
  }

  // Klangsequenz beim Eintritt
  playEntryTone(style = 'ruhig') {
    if (!this.audioContext) return;

    const frequencies = {
      ruhig: [220, 261.63, 329.63], // A, C, E (A-Moll)
      feierlich: [261.63, 329.63, 392], // C, E, G (C-Dur)
      kreativ: [293.66, 369.99, 440], // D, F#, A (D-Dur)
      futuristisch: [440, 554.37, 659.25] // A, C#, E (höher)
    };

    const freqs = frequencies[style] || frequencies.ruhig;

    freqs.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 0.1);
      }, index * 200);
    });
  }

  playTone(frequency, duration, volume = 0.1) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Raum-spezifische Musik
  startRoomMusic(roomId, style) {
    // In Produktion: Lade Musik-Dateien basierend auf Style
    console.log(`[Community-Mus] Starte Musik für Raum ${roomId}, Stil: ${style}`);
  }

  stopRoomMusic(roomId) {
    console.log(`[Community-Mus] Stoppe Musik für Raum ${roomId}`);
  }
}

// Export für Browser
if (typeof window !== 'undefined') {
  window.CommunityMusicSystem = CommunityMusicSystem;
}

// Export für Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommunityMusicSystem;
}


