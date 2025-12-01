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
      this.version = '1.1.0-XXXL-STANDARD-FLOW-ENHANCED';
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

      // Mark as initialized
      this.initialized = true;

      console.log('[Da Vinci] Initialization complete ✅');
      console.log('[Da Vinci] T,. Logo branding active 🎨');
    }

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
        const logo = document.createElement('span');
        logo.className = 'davinci-logo';
        logo.textContent = 'T,.';
        logo.setAttribute('aria-label', 'Together Systems Logo');

        // Try to insert in header if exists
        const header = document.querySelector('header');
        if (header) {
          header.insertBefore(logo, header.firstChild);
        }
      }
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

