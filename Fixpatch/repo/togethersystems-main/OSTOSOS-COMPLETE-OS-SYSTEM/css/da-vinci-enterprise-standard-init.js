/**
 * DA VINCI XXXXXXL ENTERPRISE STANDARD - Initialization
 * Together Systems - Global Design System Initialization
 * Version: 1.1.0-XXXL-STANDARD-FLOW-ENHANCED
 * Branding: T,.&T,,.&T,,,.(C)TEL1.NL
 * 
 * Updates (2025-01-15):
 * - Flussfördernde Animationen als Standard aktiviert
 * - Expressive Animationen automatisch angewendet
 * - Selbstexponierende Animationen für interaktive Elemente
 * - Fluid Motion für alle Übergänge
 */

(function() {
  'use strict';

  // Initialize Da Vinci Design System
  class DaVinciEnterpriseStandard {
    constructor() {
      this.version = '1.2.0-XXXL-STANDARD-REDUCED-EFFECTS';
      this.branding = 'T,.&T,,.&T,,,.(C)TEL1.NL';
      this.initialized = false;
      this.flowAnimationsEnabled = true; // Standard aktiviert
    }

    /**
     * Initialize Da Vinci Design System
     */
    init() {
      if (this.initialized) {
        console.warn('[Da Vinci] Already initialized');
        return;
      }

      console.log(`[Da Vinci XXXXXXL Enterprise Standard] v${this.version} - Initializing...`);
      console.log(`[Da Vinci] Branding: ${this.branding}`);

      // Initialize T,. Logo branding
      this.initLogoBranding();

      // Inject particles background
      this.injectParticlesBackground();

      // Initialize theme detection
      this.initThemeDetection();

      // Initialize animations
      this.initAnimations();

      // Initialize flow animations (Standard)
      if (this.flowAnimationsEnabled) {
        this.initFlowAnimations();
      }

      // Initialize hologram effects
      this.initHologramEffects();

      // Initialize text openings with T,. logo
      this.initTextOpenings();

      // Initialize phosphorescence effects (MAXIMALE QUALITÄT)
      this.initPhosphorescenceEffects();

      // Initialize self-exposing animations
      this.initSelfExposingAnimations();

      // Initialize expressive animations
      this.initExpressiveAnimations();

      // Initialize fluid motion
      this.initFluidMotion();

      // Mark as initialized
      this.initialized = true;

      console.log('[Da Vinci] Initialization complete ✅');
      console.log('[Da Vinci] T,. Logo branding active 🎨');
      console.log('[Da Vinci] Flow-Enhanced Animations active ✨');
      console.log('[Da Vinci] Phosphorescence Effects active ✨ (REDUZIERT - 4x langsamer, transparenter)');
    }
    
    // Make instance globally available
    window.DaVinciStandard = this;

    /**
     * Inject particles background
     */
    injectParticlesBackground() {
      const particlesBg = document.createElement('div');
      particlesBg.className = 'davinci-particles-bg';
      particlesBg.id = 'davinci-particles-bg';

      // Create particles
      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'davinci-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesBg.appendChild(particle);
      }

      document.body.appendChild(particlesBg);
    }

    /**
     * Initialize theme detection
     */
    initThemeDetection() {
      // Detect system theme preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (prefersDark) {
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
      }

      // Listen for theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (e.matches) {
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
        }
      });
    }

    /**
     * Initialize animations
     */
    initAnimations() {
      // Add animation classes to cards on scroll
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('davinci-animated');
          }
        });
      }, {
        threshold: 0.1
      });

      document.querySelectorAll('.davinci-card').forEach(card => {
        observer.observe(card);
      });
    }

    /**
     * Initialize flow animations (Standard)
     * Flussfördernde, animierte, expressive und selbstexponierende Animationen
     */
    initFlowAnimations() {
      console.log('[Da Vinci] Initializing Flow Animations (Standard)...');

      // Expressive Flow - für alle interaktiven Elemente
      document.querySelectorAll('.davinci-btn, .davinci-card, a[href]').forEach(el => {
        if (!el.classList.contains('davinci-flow-expressive')) {
          el.classList.add('davinci-flow-expressive');
        }
      });

      // Self-Exposing - für wichtige Elemente beim ersten Erscheinen
      const selfExposingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('davinci-self-exposed')) {
            entry.target.classList.add('davinci-flow-self-exposing');
            entry.target.classList.add('davinci-self-exposed');
            // Nach Animation entfernen, damit es nicht wiederholt wird
            setTimeout(() => {
              entry.target.classList.remove('davinci-flow-self-exposing');
            }, 2000);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });

      // Self-exposing für Cards, Sections, wichtige Inhalte
      document.querySelectorAll('.davinci-card, section, .davinci-heading-1, .davinci-heading-2').forEach(el => {
        selfExposingObserver.observe(el);
      });

      // Animated Expressions - für dynamische Elemente
      document.querySelectorAll('[data-davinci-expressive]').forEach(el => {
        el.classList.add('davinci-flow-animated-expressions');
      });

      // Fluid Motion - für Übergänge und Navigation
      document.querySelectorAll('a, button, .davinci-btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
          el.classList.add('davinci-flow-fluid-motion');
        });
        el.addEventListener('mouseleave', () => {
          setTimeout(() => {
            el.classList.remove('davinci-flow-fluid-motion');
          }, 400);
        });
      });

      // Flow-Enhanced Spiral für spezielle Elemente
      document.querySelectorAll('[data-davinci-spiral]').forEach(el => {
        el.classList.add('davinci-flow-spiral-enhanced');
      });

      // Flow-Enhanced Morphing für transformierende Elemente
      document.querySelectorAll('[data-davinci-morph]').forEach(el => {
        el.classList.add('davinci-flow-morph-enhanced');
      });

      console.log('[Da Vinci] Flow Animations initialized ✅');
    }

    /**
     * Initialize hologram effects
     */
    initHologramEffects() {
      // Add hologram effect to specific elements
      document.querySelectorAll('[data-davinci-hologram]').forEach(el => {
        el.classList.add('davinci-hologram');
      });
    }

    /**
     * Initialize T,. Logo branding
     */
    initLogoBranding() {
      // Add T,. logo to page title if not present
      if (document.title && !document.title.includes('T,.') && !document.title.includes('Together')) {
        document.title = `T,. ${document.title}`;
      }

      // Create logo element if not exists
      if (!document.querySelector('.davinci-logo')) {
        const logoLink = document.createElement('a');
        logoLink.href = 'https://tel1.jouwweb.nl/servicesoftware';
        logoLink.target = '_blank';
        logoLink.rel = 'noopener noreferrer';
        logoLink.title = 'TEL & Gentlyoverdone - Servicesoftware';
        logoLink.className = 'davinci-logo';
        logoLink.textContent = 'T,.';
        logoLink.setAttribute('aria-label', 'Together Systems Logo - TEL & Gentlyoverdone');

        // Try to insert in header if exists
        const header = document.querySelector('header');
        if (header) {
          header.insertBefore(logoLink, header.firstChild);
        }
      }

      // Make T,. in headings clickable (via JavaScript wrapper)
      document.querySelectorAll('.davinci-heading-1, .davinci-heading-2, .davinci-heading-3').forEach(heading => {
        if (!heading.dataset.logoClickable) {
          heading.dataset.logoClickable = 'true';
          heading.style.cursor = 'pointer';
          heading.addEventListener('click', (e) => {
            // Check if click was on the T,. part (first ~50px of heading)
            const rect = heading.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < 80) { // T,. is usually in first 80px
              // Open link in new tab
              window.open('https://tel1.jouwweb.nl/servicesoftware', '_blank', 'noopener,noreferrer');
            }
          });
        }
      });

      // Make T,. in text openings clickable
      document.querySelectorAll('.davinci-text-opening, .davinci-text p:first-of-type').forEach(textEl => {
        if (!textEl.dataset.logoClickable) {
          textEl.dataset.logoClickable = 'true';
          textEl.style.cursor = 'pointer';
          textEl.addEventListener('click', (e) => {
            const rect = textEl.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < 50) { // T,. is usually in first 50px
              window.open('https://tel1.jouwweb.nl/servicesoftware', '_blank', 'noopener,noreferrer');
            }
          });
        }
      });
    }

    /**
     * Initialize text openings with T,. logo
     */
    initTextOpenings() {
      // Add T,. logo to first paragraph of main content
      const main = document.querySelector('main') || document.querySelector('body');
      if (main) {
        const firstParagraph = main.querySelector('p');
        if (firstParagraph && !firstParagraph.classList.contains('davinci-text-opening')) {
          firstParagraph.classList.add('davinci-text-opening');
        }

        // Add to first heading
        const firstHeading = main.querySelector('h1, h2, h3');
        if (firstHeading && !firstHeading.classList.contains('davinci-text-opening')) {
          firstHeading.classList.add('davinci-text-opening');
        }
      }
    }

    /**
     * Initialize phosphorescence effects (REDUZIERT - 4x langsamer, transparenter)
     */
    initPhosphorescenceEffects() {
      // Check user preferences
      const effectLevel = localStorage.getItem('ostosos.effects.level') || 'reduced';
      const effectsEnabled = localStorage.getItem('ostosos.effects.enabled') !== 'false';
      
      if (!effectsEnabled) {
        document.documentElement.classList.add('davinci-effects-disabled');
        console.log('[Da Vinci] Effects disabled by user');
        return;
      }
      
      if (effectLevel === 'disabled') {
        document.documentElement.classList.add('davinci-effects-disabled');
        console.log('[Da Vinci] Effects disabled');
        return;
      }
      
      if (effectLevel === 'reduced') {
        document.documentElement.classList.add('davinci-effects-reduced');
      }
      
      console.log('[Da Vinci] Initializing Phosphorescence Effects (REDUZIERT - 4x langsamer, transparenter)...');

      // Apply phosphorescence to cards (reduziert)
      document.querySelectorAll('.davinci-card, .system-card, .welcome-card').forEach(card => {
        if (effectLevel !== 'disabled') {
          card.classList.add('davinci-phosphorescent-glow-afterglow');
        }
      });

      // Apply energy phosphorescence to buttons (reduziert)
      document.querySelectorAll('.davinci-btn, button, .install-button, .nav-item').forEach(btn => {
        if (effectLevel !== 'disabled') {
          btn.classList.add('davinci-phosphorescent-energy');
        }
      });

      // Apply neon phosphorescence to headings (reduziert)
      document.querySelectorAll('h1, h2, h3, .davinci-heading-1, .davinci-heading-2, .davinci-heading-3').forEach(heading => {
        if (effectLevel !== 'disabled') {
          heading.classList.add('davinci-phosphorescent-neon');
        }
      });

      // Apply particle phosphorescence to special elements (reduziert)
      document.querySelectorAll('[data-davinci-particle], .logo, .davinci-logo').forEach(el => {
        if (effectLevel !== 'disabled') {
          el.classList.add('davinci-phosphorescent-particle');
        }
      });

      // Apply ambient phosphorescence to body/background (reduziert)
      if (document.body && effectLevel !== 'disabled') {
        document.body.classList.add('davinci-phosphorescent-ambient');
      }

      // Apply complete phosphorescence to important elements (reduziert)
      document.querySelectorAll('[data-davinci-phosphor-complete]').forEach(el => {
        if (effectLevel !== 'disabled') {
          el.classList.add('davinci-phosphorescent-complete');
        }
      });

      // Apply phosphorescence-flow combination (reduziert)
      document.querySelectorAll('[data-davinci-phosphor-flow]').forEach(el => {
        if (effectLevel !== 'disabled') {
          el.classList.add('davinci-phosphorescent-flow');
        }
      });

      console.log('[Da Vinci] Phosphorescence Effects initialized ✅ (Level: ' + effectLevel + ')');
    }
    
    /**
     * Update effects level
     */
    updateEffectsLevel(level) {
      localStorage.setItem('ostosos.effects.level', level);
      localStorage.setItem('ostosos.effects.enabled', level !== 'disabled');
      
      // Remove all effect classes
      document.documentElement.classList.remove('davinci-effects-disabled', 'davinci-effects-reduced');
      document.querySelectorAll('[class*="phosphorescent"], [class*="flow"]').forEach(el => {
        el.classList.remove('davinci-phosphorescent-glow-afterglow', 'davinci-phosphorescent-energy', 
                           'davinci-phosphorescent-neon', 'davinci-phosphorescent-particle',
                           'davinci-phosphorescent-surface', 'davinci-phosphorescent-ambient',
                           'davinci-phosphorescent-complete', 'davinci-phosphorescent-flow',
                           'davinci-flow-expressive', 'davinci-flow-self-exposing',
                           'davinci-flow-animated-expressions', 'davinci-flow-fluid-motion');
      });
      
      // Re-initialize with new level
      this.initPhosphorescenceEffects();
      if (this.flowAnimationsEnabled && level !== 'disabled') {
        this.initFlowAnimations();
      }
    }

    /**
     * Initialize self-exposing animations
     */
    initSelfExposingAnimations() {
      const selfExposingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('davinci-self-exposed')) {
            entry.target.classList.add('davinci-flow-self-exposing');
            entry.target.classList.add('davinci-self-exposed');
            setTimeout(() => {
              entry.target.classList.remove('davinci-flow-self-exposing');
            }, 2000);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });

      document.querySelectorAll('.davinci-card, .system-card, section, .welcome-card').forEach(el => {
        selfExposingObserver.observe(el);
      });
    }

    /**
     * Initialize expressive animations
     */
    initExpressiveAnimations() {
      document.querySelectorAll('[data-davinci-expressive]').forEach(el => {
        el.classList.add('davinci-flow-animated-expressions');
      });
    }

    /**
     * Initialize fluid motion
     */
    initFluidMotion() {
      document.querySelectorAll('a, button, .davinci-btn, .nav-item').forEach(el => {
        el.addEventListener('mouseenter', () => {
          el.classList.add('davinci-flow-fluid-motion');
        });
        el.addEventListener('mouseleave', () => {
          setTimeout(() => {
            el.classList.remove('davinci-flow-fluid-motion');
          }, 400);
        });
      });
    }

    /**
     * Add Da Vinci styling to element
     */
    styleElement(element, styleType = 'card') {
      if (!element) return;

      switch (styleType) {
        case 'card':
          element.classList.add('davinci-card');
          break;
        case 'btn':
          element.classList.add('davinci-btn');
          break;
        case 'input':
          element.classList.add('davinci-input');
          break;
        case 'hologram':
          element.classList.add('davinci-hologram');
          break;
        case 'spiral':
          element.classList.add('davinci-spiral');
          break;
        case 'morph':
          element.classList.add('davinci-morph');
          break;
        case 'glow':
          element.classList.add('davinci-glow');
          break;
        case 'logo':
          element.classList.add('davinci-logo');
          break;
        case 'flow-expressive':
          element.classList.add('davinci-flow-expressive');
          break;
        case 'flow-self-exposing':
          element.classList.add('davinci-flow-self-exposing');
          break;
        case 'flow-animated-expressions':
          element.classList.add('davinci-flow-animated-expressions');
          break;
        case 'flow-fluid-motion':
          element.classList.add('davinci-flow-fluid-motion');
          break;
        case 'flow-complete':
          element.classList.add('davinci-flow-complete');
          break;
      }
    }
  }

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.DaVinciStandard = new DaVinciEnterpriseStandard();
      window.DaVinciStandard.init();
    });
  } else {
    window.DaVinciStandard = new DaVinciEnterpriseStandard();
    window.DaVinciStandard.init();
  }

  // Export for global use
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DaVinciEnterpriseStandard;
  }
})();

