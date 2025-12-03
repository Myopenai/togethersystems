/**
 * T,. OSTOSOS Donation Core
 * Vollständiges Donation System
 * 
 * Features:
 * - Donation Dashboard
 * - Donation Tracking
 * - Donation Widget
 * - Multiple Donation Platforms
 */

class OSTOSOSDonation {
  constructor() {
    this.donations = [];
    this.goals = [];
    this.platforms = {
      gofundme: {
        name: 'GoFundMe',
        icon: '💰',
        url: 'https://www.gofundme.com',
        enabled: true
      },
      paypal: {
        name: 'PayPal',
        icon: '💳',
        url: 'https://www.paypal.com',
        enabled: false
      },
      patreon: {
        name: 'Patreon',
        icon: '🎨',
        url: 'https://www.patreon.com',
        enabled: false
      }
    };
    
    this.loadDonations();
    this.loadGoals();
    
    console.log('T,. Donation System initialisiert');
  }
  
  /**
   * Erstellt ein Donation Widget
   */
  createWidget(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container nicht gefunden: ${containerId}`);
      return;
    }
    
    // Schließen-Button hinzufügen
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Schließen';
    closeBtn.className = 'ostosos-donation-close';
    closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;background:#dc3545;color:#fff;border:none;border-radius:4px;padding:6px 12px;cursor:pointer;font-size:0.9em;z-index:1000;';
    closeBtn.onclick = () => {
      if (window.OSTOSOSWindowManager) {
        // Verwende Window Manager falls verfügbar
        const widgetWindow = container.closest('.ostosos-window');
        if (widgetWindow) {
          const windowId = widgetWindow.dataset.windowId;
          if (windowId) {
            window.OSTOSOSWindowManager.closeWindow(windowId);
            return;
          }
        }
      }
      // Fallback: Verstecke Container
      container.style.display = 'none';
      // Oder entferne komplett
      if (options.removeOnClose !== false) {
        container.remove();
      }
    };
    
    const widget = document.createElement('div');
    widget.className = 'ostosos-donation-widget';
    widget.style.cssText = `
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      color: white;
      box-shadow: 0 5px 20px rgba(255, 107, 107, 0.3);
    `;
    
    const title = document.createElement('h3');
    title.textContent = options.title || '🎵 Magnitudo Musica Mundo unterstützen';
    title.style.cssText = 'margin-bottom: 15px; font-size: 1.2em;';
    widget.appendChild(title);
    
    const description = document.createElement('p');
    description.textContent = options.description || 'Unterstützen Sie die musikalische Zukunft und helfen Sie dabei, €33.000 für Events, Übungsräume, Equipment und Instrumente zu sammeln.';
    description.style.cssText = 'margin-bottom: 20px; opacity: 0.9; font-size: 0.9em;';
    widget.appendChild(description);
    
    // Progress Bar
    if (options.showProgress) {
      const goal = options.goal || 33000;
      const current = options.current || this.getTotalDonations();
      
      const progressContainer = document.createElement('div');
      progressContainer.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        height: 20px;
        margin-bottom: 15px;
        overflow: hidden;
      `;
      
      const progressFill = document.createElement('div');
      progressFill.style.cssText = `
        height: 100%;
        background: white;
        width: ${Math.min(100, (current / goal) * 100)}%;
        transition: width 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ff6b6b;
        font-weight: bold;
        font-size: 12px;
      `;
      progressFill.textContent = `€${current.toLocaleString('de-DE')} / €${goal.toLocaleString('de-DE')}`;
      
      progressContainer.appendChild(progressFill);
      widget.appendChild(progressContainer);
    }
    
    // Donate Button
    const donateBtn = document.createElement('a');
    donateBtn.href = options.url || 'https://www.gofundme.com/f/magnitudo?utm_campaign=unknown&utm_medium=referral&utm_source=widget';
    donateBtn.target = '_blank';
    donateBtn.rel = 'noopener noreferrer';
    donateBtn.textContent = options.buttonText || 'Jetzt spenden';
    donateBtn.style.cssText = `
      display: inline-block;
      padding: 12px 30px;
      background: white;
      color: #ff6b6b;
      text-decoration: none;
      border-radius: 25px;
      font-weight: 600;
      transition: all 0.3s;
    `;
    
    donateBtn.addEventListener('mouseenter', () => {
      donateBtn.style.transform = 'translateY(-2px)';
      donateBtn.style.boxShadow = '0 5px 15px rgba(255, 255, 255, 0.4)';
    });
    
    donateBtn.addEventListener('mouseleave', () => {
      donateBtn.style.transform = 'translateY(0)';
      donateBtn.style.boxShadow = 'none';
    });
    
    donateBtn.addEventListener('click', () => {
      this.trackDonationClick(options.url || donateBtn.href);
    });
    
    widget.appendChild(donateBtn);
    
    container.appendChild(widget);
  }
  
  /**
   * Erstellt Donation Dashboard
   */
  createDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const dashboard = document.createElement('div');
    dashboard.className = 'ostosos-donation-dashboard';
    dashboard.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    `;
    
    // Total Donations Card
    const totalCard = this.createStatCard('Gesamt Spenden', `€${this.getTotalDonations().toLocaleString('de-DE')}`, '💰');
    dashboard.appendChild(totalCard);
    
    // Goals Card
    const goalsCard = this.createStatCard('Ziele', this.goals.length.toString(), '🎯');
    dashboard.appendChild(goalsCard);
    
    // Platforms Card
    const platformsCard = this.createStatCard('Plattformen', Object.keys(this.platforms).length.toString(), '🌐');
    dashboard.appendChild(platformsCard);
    
    container.appendChild(dashboard);
  }
  
  /**
   * Erstellt Stat Card
   */
  createStatCard(title, value, icon) {
    const card = document.createElement('div');
    card.style.cssText = `
      background: var(--davinci-card, #1a1f3a);
      padding: 20px;
      border-radius: 12px;
      border: 2px solid var(--davinci-accent-primary, #10b981);
      text-align: center;
    `;
    
    const iconEl = document.createElement('div');
    iconEl.textContent = icon;
    iconEl.style.cssText = 'font-size: 48px; margin-bottom: 10px;';
    card.appendChild(iconEl);
    
    const valueEl = document.createElement('div');
    valueEl.textContent = value;
    valueEl.style.cssText = `
      font-size: 32px;
      font-weight: bold;
      color: var(--davinci-accent-primary, #10b981);
      margin-bottom: 5px;
    `;
    card.appendChild(valueEl);
    
    const titleEl = document.createElement('div');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      color: var(--davinci-muted, #9ca3af);
      font-size: 14px;
    `;
    card.appendChild(titleEl);
    
    return card;
  }
  
  /**
   * Trackt einen Donation-Klick
   */
  trackDonationClick(url) {
    const click = {
      url: url,
      timestamp: new Date().toISOString(),
      userId: localStorage.getItem('ostosos.userId') || 'anonymous'
    };
    
    this.donations.push({
      type: 'click',
      ...click
    });
    
    this.saveDonations();
    console.log('T,. Donation-Klick getrackt:', url);
  }
  
  /**
   * Gibt Gesamt-Spenden zurück
   */
  getTotalDonations() {
    // This would typically come from an API
    // For now, return a placeholder
    return 0; // Placeholder - would be loaded from API
  }
  
  /**
   * Fügt ein Ziel hinzu
   */
  addGoal(title, amount, description = '') {
    const goal = {
      id: `goal-${Date.now()}`,
      title: title,
      amount: amount,
      description: description,
      createdAt: new Date().toISOString()
    };
    
    this.goals.push(goal);
    this.saveGoals();
    
    return goal.id;
  }
  
  /**
   * Speichert Donations
   */
  saveDonations() {
    localStorage.setItem('ostosos.donations', JSON.stringify(this.donations));
  }
  
  /**
   * Lädt Donations
   */
  loadDonations() {
    const saved = localStorage.getItem('ostosos.donations');
    if (saved) {
      try {
        this.donations = JSON.parse(saved);
      } catch (e) {
        console.error('Fehler beim Laden der Donations:', e);
        this.donations = [];
      }
    }
  }
  
  /**
   * Speichert Goals
   */
  saveGoals() {
    localStorage.setItem('ostosos.donation.goals', JSON.stringify(this.goals));
  }
  
  /**
   * Lädt Goals
   */
  loadGoals() {
    const saved = localStorage.getItem('ostosos.donation.goals');
    if (saved) {
      try {
        this.goals = JSON.parse(saved);
      } catch (e) {
        console.error('Fehler beim Laden der Goals:', e);
        this.goals = [];
      }
    }
  }
}

// Global verfügbar machen
window.OSTOSOSDonation = OSTOSOSDonation;
window.OSTOSOSDonations = window.OSTOSOSDonations || new OSTOSOSDonation();

console.log('T,. Donation Core geladen');

