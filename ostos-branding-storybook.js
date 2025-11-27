/**
 * OSTOS Branding Universe - Interactive Storybook
 * 
 * Psychologisch, physiologisch, soziologisch, kulturell erkennbare Visualisierungen
 * Reagiert auf: Scrollen, Mausbewegung, Pausen, User-Aktionen
 */

class OSTOSStorybook {
  constructor() {
    this.sponsors = [];
    this.animationState = {
      scrollProgress: 0,
      mousePosition: { x: 0, y: 0 },
      idleTime: 0,
      lastInteraction: Date.now(),
      welcomePhase: 'initial',
      sponsorIntegrationPhase: 'ready'
    };
    this.culturalGreetings = {
      de: 'Willkommen',
      en: 'Welcome',
      es: 'Bienvenido',
      fr: 'Bienvenue',
      it: 'Benvenuto',
      pt: 'Bem-vindo',
      ja: 'ようこそ',
      zh: '欢迎',
      ar: 'أهلاً وسهلاً',
      hi: 'स्वागत है',
      ru: 'Добро пожаловать'
    };
    this.init();
  }

  init() {
    this.loadSponsors();
    this.setupEventListeners();
    this.startAnimationLoop();
    this.showWelcomeSequence();
    this.setupCulturalGreeting();
  }

  loadSponsors() {
    // Lade Sponsoren von API oder localStorage
    // Prüfe ob nicht file:// Protokoll (CORS-Schutz)
    if (location.protocol !== 'file:') {
      fetch('/api/sponsors/list')
        .then(r => {
          if (!r.ok) throw new Error('API not available');
          return r.json();
        })
        .then(data => {
          if (data.ok && data.sponsors) {
            this.sponsors = data.sponsors;
            this.integrateSponsors();
          }
        })
        .catch(() => {
          // Fallback: localStorage
          this.loadSponsorsFromStorage();
        });
    } else {
      // Direkt localStorage bei file://
      this.loadSponsorsFromStorage();
    }
  }

  loadSponsorsFromStorage() {
    try {
      const stored = localStorage.getItem('ostos-sponsors');
      if (stored) {
        this.sponsors = JSON.parse(stored);
        this.integrateSponsors();
      }
    } catch (e) {
      console.error('Error loading sponsors from storage:', e);
      this.sponsors = [];
    }
  }

  setupEventListeners() {
    // Scroll-Erkennung
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      this.animationState.scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      this.updateScrollAnimations();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => this.onScrollPause(), 500);
    }, { passive: true });

    // Mausbewegung
    let mouseTimeout;
    window.addEventListener('mousemove', (e) => {
      this.animationState.mousePosition = { x: e.clientX, y: e.clientY };
      this.updateMouseAnimations(e);
      this.animationState.lastInteraction = Date.now();
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => this.onMouseIdle(), 2000);
    }, { passive: true });

    // Pausen-Erkennung
    setInterval(() => {
      const idle = Date.now() - this.animationState.lastInteraction;
      this.animationState.idleTime = idle;
      if (idle > 3000) this.onUserPause();
    }, 1000);

    // Visibility API
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.onUserReturn();
      }
    });
  }

  showWelcomeSequence() {
    const greeting = this.getCulturalGreeting();
    const welcomeEl = document.createElement('div');
    welcomeEl.id = 'ostos-welcome';
    welcomeEl.innerHTML = `
      <div class="welcome-content">
        <div class="welcome-greeting">${greeting}</div>
        <div class="welcome-subtitle">OSTOS ∞ Branding Universe</div>
        <div class="welcome-pulse"></div>
      </div>
    `;
    document.body.appendChild(welcomeEl);

    setTimeout(() => {
      welcomeEl.classList.add('fade-out');
      setTimeout(() => welcomeEl.remove(), 2000);
    }, 3000);

    this.animationState.welcomePhase = 'completed';
  }

  getCulturalGreeting() {
    const lang = navigator.language.split('-')[0];
    return this.culturalGreetings[lang] || this.culturalGreetings['en'];
  }

  setupCulturalGreeting() {
    const greeting = this.getCulturalGreeting();
    const logoCaption = document.querySelector('.logo-caption');
    if (logoCaption) {
      const greetingSpan = document.createElement('span');
      greetingSpan.textContent = `${greeting} · Universal Harmony`;
      greetingSpan.style.color = '#ffd86f';
      logoCaption.appendChild(greetingSpan);
    }
  }

  updateScrollAnimations() {
    const progress = this.animationState.scrollProgress;
    const root = document.documentElement;

    // Parallax-Effekt für Nebula
    const nebula = document.querySelector('.nebula-bg');
    if (nebula) {
      nebula.style.transform = `translateY(${progress * 20}px) scale(${1 + progress * 0.1})`;
    }

    // Logo-Skalierung basierend auf Scroll
    const logoScale = 1 + Math.sin(progress * Math.PI) * 0.1;
    root.style.setProperty('--logo-scale', logoScale);

    // Sponsor-Logos animieren
    document.querySelectorAll('.sponsor-logo').forEach((logo, i) => {
      const delay = i * 0.1;
      const offset = Math.sin(progress * Math.PI * 2 + delay) * 10;
      logo.style.transform = `translateY(${offset}px) scale(${1 + progress * 0.2})`;
    });
  }

  updateMouseAnimations(e) {
    const { x, y } = this.animationState.mousePosition;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    // Logo folgt Maus leicht
    const logoWrapper = document.getElementById('logoWrapper');
    if (logoWrapper) {
      const rotateX = deltaY * 5;
      const rotateY = deltaX * 5;
      logoWrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    // Partikel-Effekt bei Mausbewegung
    this.createMouseParticle(x, y);
  }

  createMouseParticle(x, y) {
    if (Math.random() > 0.95) { // Nur gelegentlich
      const particle = document.createElement('div');
      particle.className = 'mouse-particle';
      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: #00d1ff;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: particle-fade 1s ease-out forwards;
      `;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
  }

  onScrollPause() {
    // Sanfte Puls-Animation bei Scroll-Pause
    const logo = document.getElementById('ostos-logo');
    if (logo) {
      logo.classList.add('logo-pulse-once');
      setTimeout(() => logo.classList.remove('logo-pulse-once'), 900);
    }
  }

  onMouseIdle() {
    // Sanfte Atmung bei Maus-Inaktivität
    const root = document.documentElement;
    root.style.setProperty('--anim-speed-multiplier', '0.8');
  }

  onUserPause() {
    // Zeige subtile Hinweise bei längerer Pause
    if (this.animationState.idleTime > 5000) {
      this.showSubtleHint();
    }
  }

  onUserReturn() {
    // Begrüßung bei Rückkehr
    this.animationState.lastInteraction = Date.now();
    const root = document.documentElement;
    root.style.setProperty('--anim-speed-multiplier', '1');
  }

  showSubtleHint() {
    const hint = document.createElement('div');
    hint.className = 'subtle-hint';
    hint.textContent = '✨ Interagiere mit dem Branding Lab';
    hint.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 209, 255, 0.2);
      border: 1px solid #00d1ff;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      color: #00d1ff;
      font-size: 0.8rem;
      z-index: 10000;
      animation: hint-fade 3s ease-out forwards;
    `;
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 3000);
  }

  integrateSponsors() {
    if (this.sponsors.length === 0) return;

    const logoWrapper = document.getElementById('logoWrapper');
    if (!logoWrapper) return;

    // Erstelle Sponsor-Orbit-Bereich
    let sponsorOrbit = document.getElementById('sponsor-orbit');
    if (!sponsorOrbit) {
      sponsorOrbit = document.createElement('div');
      sponsorOrbit.id = 'sponsor-orbit';
      sponsorOrbit.className = 'sponsor-orbit-container';
      logoWrapper.appendChild(sponsorOrbit);
    }

    // Integriere jeden Sponsor
    this.sponsors.forEach((sponsor, index) => {
      this.animateSponsorIntegration(sponsor, index, sponsorOrbit);
    });

    this.animationState.sponsorIntegrationPhase = 'completed';
  }

  animateSponsorIntegration(sponsor, index, container) {
    const delay = index * 500; // Gestaffelte Animation

    setTimeout(() => {
      const sponsorEl = document.createElement('div');
      sponsorEl.className = 'sponsor-orbit-item';
      sponsorEl.dataset.sponsorId = sponsor.id;

      if (sponsor.logoData) {
        if (sponsor.logoData.startsWith('<svg') || sponsor.logoData.startsWith('data:image/svg')) {
          sponsorEl.innerHTML = sponsor.logoData;
        } else {
          const img = document.createElement('img');
          img.src = sponsor.logoData;
          img.alt = sponsor.name;
          sponsorEl.appendChild(img);
        }
      } else {
        sponsorEl.textContent = sponsor.name.substring(0, 2).toUpperCase();
      }

      // Orbit-Position berechnen
      const angle = (index / this.sponsors.length) * Math.PI * 2;
      const radius = 120;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      sponsorEl.style.cssText = `
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(0, 209, 255, 0.1);
        border: 2px solid #00d1ff;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transform: translate(${x}px, ${y}px);
        animation: sponsor-orbit-enter 1s ease-out forwards, sponsor-orbit-rotate ${10 + index * 2}s linear infinite;
        animation-delay: ${index * 0.1}s;
      `;

      container.appendChild(sponsorEl);

      // Hover-Effekt
      sponsorEl.addEventListener('mouseenter', () => {
        sponsorEl.style.transform = `translate(${x}px, ${y}px) scale(1.3)`;
        sponsorEl.style.zIndex = '1000';
      });

      sponsorEl.addEventListener('mouseleave', () => {
        sponsorEl.style.transform = `translate(${x}px, ${y}px) scale(1)`;
        sponsorEl.style.zIndex = '1';
      });
    }, delay);
  }

  startAnimationLoop() {
    const animate = () => {
      // Kontinuierliche Animationen
      this.updateContinuousAnimations();
      requestAnimationFrame(animate);
    };
    animate();
  }

  updateContinuousAnimations() {
    const time = Date.now() * 0.001;
    const root = document.documentElement;

    // Atmungs-Effekt basierend auf Zeit
    const breath = Math.sin(time * 0.5) * 0.05 + 1;
    root.style.setProperty('--logo-scale', breath);

    // Farbverschiebung basierend auf Tageszeit
    const hour = new Date().getHours();
    const dayNight = (Math.sin((hour / 24) * Math.PI * 2) + 1) / 2;
    // Sanfte Farbanpassung
  }
}

// CSS für Animationen hinzufügen
const storybookStyles = `
  @keyframes particle-fade {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(2) translateY(-20px); }
  }
  @keyframes hint-fade {
    0%, 100% { opacity: 0; transform: translateY(10px); }
    20%, 80% { opacity: 1; transform: translateY(0); }
  }
  @keyframes sponsor-orbit-enter {
    0% { opacity: 0; transform: scale(0) translate(0, 0); }
    100% { opacity: 1; transform: scale(1) translate(var(--x), var(--y)); }
  }
  @keyframes sponsor-orbit-rotate {
    0% { transform: rotate(0deg) translateX(120px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
  }
  #ostos-welcome {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    background: radial-gradient(circle, rgba(0, 209, 255, 0.1), transparent);
    pointer-events: none;
  }
  .welcome-content {
    text-align: center;
  }
  .welcome-greeting {
    font-size: 4rem;
    font-weight: 900;
    background: linear-gradient(135deg, #00d1ff, #ff4b9f, #ffd86f);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: welcome-pulse 2s ease-in-out;
  }
  .welcome-subtitle {
    font-size: 1.5rem;
    color: #b9ccff;
    margin-top: 1rem;
  }
  @keyframes welcome-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.9; }
  }
  .welcome-content.fade-out {
    animation: fade-out 2s ease-out forwards;
  }
  @keyframes fade-out {
    to { opacity: 0; transform: scale(0.9); }
  }
  .sponsor-orbit-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .sponsor-orbit-item {
    pointer-events: all;
  }
  .sponsor-orbit-item img,
  .sponsor-orbit-item svg {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  }
`;

// Stylesheet einfügen
const styleSheet = document.createElement('style');
styleSheet.textContent = storybookStyles;
document.head.appendChild(styleSheet);

// Initialisierung wenn DOM bereit
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.ostosStorybook = new OSTOSStorybook();
  });
} else {
  window.ostosStorybook = new OSTOSStorybook();
}

