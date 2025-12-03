// T,. OSTOSOS - User-Friendability Modes
// Verschiedene Modi basierend auf psychologischen Bedürfnissen

const USER_FRIENDABILITY_MODES = {
  modes: {
    'comfort': {
      name: 'Komfort-Modus',
      description: 'Maximale Behaglichkeit - Sanfte Animationen, warme Farben, große Schrift',
      settings: {
        animations: { speed: 0.5, intensity: 0.3 },
        colors: { theme: 'warm', contrast: 'medium' },
        typography: { size: 'large', weight: 'regular' },
        notifications: { frequency: 'low', sound: false },
        layout: { spacing: 'comfortable', density: 'low' }
      },
      scientificBasis: 'Medical Ergonomics, Eye Strain Reduction, Comfort Design'
    },
    'productivity': {
      name: 'Produktivitäts-Modus',
      description: 'Maximale Effizienz - Schnelle Navigation, Shortcuts, kompaktes Layout',
      settings: {
        animations: { speed: 1.5, intensity: 0.2 },
        colors: { theme: 'neutral', contrast: 'high' },
        typography: { size: 'medium', weight: 'regular' },
        notifications: { frequency: 'high', sound: true },
        layout: { spacing: 'compact', density: 'high' }
      },
      scientificBasis: 'Cognitive Load Theory, Information Processing'
    },
    'learning': {
      name: 'Lern-Modus',
      description: 'Unterstützung beim Lernen - Tutorials, Tooltips, Schritt-für-Schritt',
      settings: {
        animations: { speed: 1.0, intensity: 0.5 },
        colors: { theme: 'friendly', contrast: 'medium' },
        typography: { size: 'medium', weight: 'regular' },
        notifications: { frequency: 'medium', sound: false },
        layout: { spacing: 'comfortable', density: 'medium' },
        features: { tooltips: true, tutorials: true, progress: true }
      },
      scientificBasis: 'Educational Psychology, Scaffolding'
    },
    'accessibility': {
      name: 'Zugänglichkeits-Modus',
      description: 'Barrierefreiheit - Screen-Reader, Tastatur-Navigation, hoher Kontrast',
      settings: {
        animations: { speed: 0.3, intensity: 0.1 },
        colors: { theme: 'high-contrast', contrast: 'maximum' },
        typography: { size: 'extra-large', weight: 'bold' },
        notifications: { frequency: 'medium', sound: true },
        layout: { spacing: 'very-comfortable', density: 'low' },
        features: { screenReader: true, keyboardNav: true, ariaLabels: true }
      },
      scientificBasis: 'WCAG 2.1, Accessibility Guidelines'
    },
    'minimal': {
      name: 'Minimal-Modus',
      description: 'Weniger ist mehr - Nur essenzielle Funktionen, klare Struktur',
      settings: {
        animations: { speed: 0.8, intensity: 0.1 },
        colors: { theme: 'minimal', contrast: 'medium' },
        typography: { size: 'medium', weight: 'light' },
        notifications: { frequency: 'low', sound: false },
        layout: { spacing: 'comfortable', density: 'low' },
        features: { essentialOnly: true, clearStructure: true }
      },
      scientificBasis: 'Minimalism in Design, Cognitive Load Reduction'
    }
  },
  
  currentMode: 'comfort',
  userProfile: null,
  
  init() {
    this.loadMode();
    this.loadUserProfile();
    this.applyMode(this.currentMode);
  },
  
  loadMode() {
    const saved = localStorage.getItem('ostosos.user.mode');
    if (saved && this.modes[saved]) {
      this.currentMode = saved;
    }
  },
  
  saveMode(mode) {
    localStorage.setItem('ostosos.user.mode', mode);
    this.currentMode = mode;
  },
  
  applyMode(modeId) {
    const mode = this.modes[modeId];
    if (!mode) return;
    
    const settings = mode.settings;
    
    // Animations
    document.documentElement.style.setProperty('--animation-speed', settings.animations.speed);
    document.documentElement.style.setProperty('--animation-intensity', settings.animations.intensity);
    
    // Colors
    if (settings.colors.theme === 'warm') {
      document.documentElement.classList.add('comfort-theme');
    } else if (settings.colors.theme === 'high-contrast') {
      document.documentElement.classList.add('high-contrast-theme');
    } else {
      document.documentElement.classList.remove('comfort-theme', 'high-contrast-theme');
    }
    
    // Typography
    document.documentElement.style.setProperty('--font-size-base', this.getFontSize(settings.typography.size));
    document.documentElement.style.setProperty('--font-weight-base', settings.typography.weight);
    
    // Layout
    document.documentElement.style.setProperty('--spacing-base', this.getSpacing(settings.layout.spacing));
    document.documentElement.style.setProperty('--density', settings.layout.density);
    
    // Features
    if (settings.features) {
      if (settings.features.tooltips) {
        this.enableTooltips();
      }
      if (settings.features.screenReader) {
        this.enableScreenReader();
      }
      if (settings.features.keyboardNav) {
        this.enableKeyboardNav();
      }
    }
    
    this.saveMode(modeId);
    
    // Event
    window.dispatchEvent(new CustomEvent('userModeChanged', { 
      detail: { mode: modeId, modeData: mode } 
    }));
  },
  
  getFontSize(size) {
    const sizes = {
      'extra-large': '20px',
      'large': '18px',
      'medium': '16px',
      'small': '14px'
    };
    return sizes[size] || sizes.medium;
  },
  
  getSpacing(spacing) {
    const spacings = {
      'very-comfortable': '32px',
      'comfortable': '24px',
      'medium': '16px',
      'compact': '12px'
    };
    return spacings[spacing] || spacings.medium;
  },
  
  enableTooltips() {
    // Tooltips überall aktivieren
    document.querySelectorAll('[data-tooltip]').forEach(el => {
      el.setAttribute('aria-label', el.getAttribute('data-tooltip'));
    });
  },
  
  enableScreenReader() {
    // ARIA-Labels hinzufügen
    document.querySelectorAll('button, a, input').forEach(el => {
      if (!el.getAttribute('aria-label') && !el.textContent.trim()) {
        el.setAttribute('aria-label', el.getAttribute('title') || 'Button');
      }
    });
  },
  
  enableKeyboardNav() {
    // Tastatur-Navigation aktivieren
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        // Tab-Navigation verbessern
        const focusable = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const currentIndex = Array.from(focusable).indexOf(document.activeElement);
        
        if (e.shiftKey) {
          // Shift+Tab: Zurück
          if (currentIndex > 0) {
            focusable[currentIndex - 1].focus();
          } else {
            focusable[focusable.length - 1].focus();
          }
        } else {
          // Tab: Vorwärts
          if (currentIndex < focusable.length - 1) {
            focusable[currentIndex + 1].focus();
          } else {
            focusable[0].focus();
          }
        }
        e.preventDefault();
      }
    });
  },
  
  suggestMode(psychologicalAnalysis) {
    // Schlage Modus basierend auf psychologischer Analyse vor
    if (psychologicalAnalysis.psychological.needs.includes('comfort')) {
      return 'comfort';
    }
    if (psychologicalAnalysis.psychological.needs.includes('competence')) {
      return 'learning';
    }
    if (psychologicalAnalysis.comfort.visual === 'needs_attention') {
      return 'accessibility';
    }
    if (psychologicalAnalysis.surface.complexity === 'low') {
      return 'minimal';
    }
    return 'productivity';
  },
  
  loadUserProfile() {
    const saved = localStorage.getItem('ostosos.user.profile');
    if (saved) {
      this.userProfile = JSON.parse(saved);
      
      // Auto-Modus basierend auf Profil
      if (this.userProfile && this.userProfile.recommendedMode) {
        this.applyMode(this.userProfile.recommendedMode);
      }
    }
  },
  
  saveUserProfile(profile) {
    localStorage.setItem('ostosos.user.profile', JSON.stringify(profile));
    this.userProfile = profile;
  }
};

window.USER_FRIENDABILITY_MODES = USER_FRIENDABILITY_MODES;

window.addEventListener('load', () => {
  USER_FRIENDABILITY_MODES.init();
});

