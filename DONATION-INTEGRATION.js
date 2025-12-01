// T,. DONATION INTEGRATION
// Prominente Spenden-Integration in allen Portalen
// GoFundMe + IBAN für Projekt-Unterstützung

/**
 * Donation Integration
 * Integriert Spenden-Link prominent in alle Portale
 */

class DonationIntegration {
  constructor() {
    this.gofundmeUrl = 'https://www.gofundme.com/f/magnitudo?utm_campaign=unknown&utm_medium=referral&utm_source=widget';
    this.iban = 'NL66 RABO 1020 3955 08';
    this.bic = 'RABONL2U';
    this.accountant = 'R.D.TEL "Raymond Demitrio Tel"';
    this.minAmount = 5; // Minimum 5 Euro
  }

  /**
   * Integration in OSTOSOS
   */
  integrateIntoOSTOSOS() {
    if (!document.querySelector('.os-container')) return;

    const checkInterval = setInterval(() => {
      const mainContent = document.querySelector('.main-content');
      if (!mainContent) return;

      clearInterval(checkInterval);

      // Prominente Spenden-Banner erstellen
      const donationBanner = document.createElement('div');
      donationBanner.id = 'donation-banner-ostosos';
      donationBanner.className = 'welcome-card';
      donationBanner.style.cssText = 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 20px; margin-bottom: 30px; border: 3px solid #10b981; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);';
      donationBanner.innerHTML = `
        <div style="text-align: center;">
          <h2 style="color: white; margin-bottom: 15px; font-size: 2em;">💝 Unterstütze dieses Projekt</h2>
          <p style="color: rgba(255,255,255,0.95); font-size: 1.1em; margin-bottom: 20px;">
            Dieses Entwickler-Developer-Tool hat langwierig sehr viel Arbeit gekostet.<br>
            Die Funktionalität ist nicht 100% gegeben, aber es ist für Anfänger sowie für Fortgeschrittene geeignet.
          </p>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 25px;">
            <a href="${this.gofundmeUrl}" target="_blank" rel="noopener noreferrer" 
               style="background: white; color: #10b981; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 1.1em; box-shadow: 0 5px 15px rgba(0,0,0,0.2); transition: transform 0.3s;"
               onmouseover="this.style.transform='scale(1.05)'" 
               onmouseout="this.style.transform='scale(1)'">
              💰 GoFundMe Spende (ab €5)
            </a>
            <button onclick="donationIntegration.showIBANDetails()" 
                    style="background: rgba(255,255,255,0.2); color: white; padding: 15px 30px; border-radius: 10px; border: 2px solid white; font-weight: bold; font-size: 1.1em; cursor: pointer; transition: all 0.3s;"
                    onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                    onmouseout="this.style.background='rgba(255,255,255,0.2)'">
              🏦 Direkt überweisen (IBAN)
            </button>
          </div>
          <p style="color: rgba(255,255,255,0.9); margin-top: 20px; font-size: 0.95em;">
            Vielen Dank für Ihre großzügige Unterstützung! 🙏
          </p>
        </div>
      `;

      // Am Anfang des Main-Content einfügen
      mainContent.insertBefore(donationBanner, mainContent.firstChild);

      // IBAN Details Modal
      this.createIBANModal();
    }, 100);
  }

  /**
   * Integration in manifest-portal.html
   */
  integrateIntoPortal() {
    if (!document.querySelector('.wr')) return;

    const checkInterval = setInterval(() => {
      const portalContent = document.querySelector('.wr');
      if (!portalContent) return;

      clearInterval(checkInterval);

      // Prominente Spenden-Panel erstellen
      const donationPanel = document.createElement('div');
      donationPanel.className = 'panel pad';
      donationPanel.style.cssText = 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); margin-top: 18px; border: 3px solid #10b981; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);';
      donationPanel.innerHTML = `
        <div class="title" style="color: white; font-size: 1.5em; margin-bottom: 15px; text-align: center;">💝 Unterstütze dieses Projekt</div>
        <p style="color: rgba(255,255,255,0.95); text-align: center; margin-bottom: 20px;">
          Dieses Entwickler-Developer-Tool hat langwierig sehr viel Arbeit gekostet.<br>
          Die Funktionalität ist nicht 100% gegeben, aber es ist für Anfänger sowie für Fortgeschrittene geeignet.
        </p>
        <div class="row" style="justify-content: center; gap: 15px; flex-wrap: wrap; margin-top: 20px;">
          <a href="${this.gofundmeUrl}" target="_blank" rel="noopener noreferrer" 
             class="btn" style="background: white; color: #10b981; padding: 15px 30px; font-size: 1.1em; font-weight: bold;">
            💰 GoFundMe Spende (ab €5)
          </a>
          <button onclick="donationIntegration.showIBANDetails()" 
                  class="btn alt" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 15px 30px; font-size: 1.1em; font-weight: bold;">
            🏦 Direkt überweisen (IBAN)
          </button>
        </div>
        <p style="color: rgba(255,255,255,0.9); text-align: center; margin-top: 20px; font-size: 0.95em;">
          Vielen Dank für Ihre großzügige Unterstützung! 🙏
        </p>
      `;

      // Am Anfang einfügen
      portalContent.insertBefore(donationPanel, portalContent.firstChild);

      // IBAN Details Modal
      this.createIBANModal();
    }, 100);
  }

  /**
   * Integration in manifest-forum.html
   */
  integrateIntoForum() {
    if (!document.querySelector('.grid')) return;

    const checkInterval = setInterval(() => {
      const forumContent = document.querySelector('.grid');
      if (!forumContent) return;

      clearInterval(checkInterval);

      // Spenden-Card erstellen
      const donationCard = document.createElement('div');
      donationCard.className = 'card pad';
      donationCard.style.cssText = 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: 3px solid #10b981; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3); margin-bottom: 16px;';
      donationCard.innerHTML = `
        <div class="sec-title" style="color: white; font-size: 1.3em; margin-bottom: 15px; text-align: center;">💝 Unterstütze dieses Projekt</div>
        <p style="color: rgba(255,255,255,0.95); text-align: center; margin-bottom: 20px;">
          Dieses Entwickler-Developer-Tool hat langwierig sehr viel Arbeit gekostet.<br>
          Die Funktionalität ist nicht 100% gegeben, aber es ist für Anfänger sowie für Fortgeschrittene geeignet.
        </p>
        <div class="row" style="justify-content: center; gap: 10px; flex-wrap: wrap; margin-top: 20px;">
          <a href="${this.gofundmeUrl}" target="_blank" rel="noopener noreferrer" 
             class="btn" style="background: white; color: #10b981; padding: 12px 25px; font-weight: bold;">
            💰 GoFundMe (ab €5)
          </a>
          <button onclick="donationIntegration.showIBANDetails()" 
                  class="btn secondary" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 12px 25px; font-weight: bold;">
            🏦 IBAN
          </button>
        </div>
        <p style="color: rgba(255,255,255,0.9); text-align: center; margin-top: 15px; font-size: 0.9em;">
          Vielen Dank! 🙏
        </p>
      `;

      // Am Anfang einfügen
      forumContent.insertBefore(donationCard, forumContent.firstChild);

      // IBAN Details Modal
      this.createIBANModal();
    }, 100);
  }

  /**
   * IBAN Details Modal erstellen
   */
  createIBANModal() {
    if (document.getElementById('iban-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'iban-modal';
    modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
      <div style="background: var(--davinci-card, #1a1f3a); padding: 40px; border-radius: 20px; max-width: 500px; width: 90%; border: 3px solid #10b981; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
        <h2 style="color: #10b981; margin-bottom: 20px; text-align: center;">🏦 Direktüberweisung</h2>
        <div style="background: var(--davinci-bg, #0f172a); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <div style="margin-bottom: 15px;">
            <strong style="color: var(--davinci-muted, #9ca3af);">IBAN:</strong>
            <div style="color: white; font-size: 1.2em; font-family: monospace; margin-top: 5px; padding: 10px; background: rgba(16, 185, 129, 0.1); border-radius: 5px; border: 1px solid #10b981;">
              ${this.iban}
            </div>
          </div>
          <div style="margin-bottom: 15px;">
            <strong style="color: var(--davinci-muted, #9ca3af);">BIC:</strong>
            <div style="color: white; font-size: 1.1em; font-family: monospace; margin-top: 5px;">
              ${this.bic}
            </div>
          </div>
          <div>
            <strong style="color: var(--davinci-muted, #9ca3af);">Kontoinhaber:</strong>
            <div style="color: white; margin-top: 5px;">
              ${this.accountant}
            </div>
          </div>
        </div>
        <p style="color: var(--davinci-muted, #9ca3af); text-align: center; margin-bottom: 20px; font-size: 0.9em;">
          Minimumbetrag: €${this.minAmount}<br>
          Personifiziert oder anonymisiert möglich
        </p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button onclick="donationIntegration.copyIBAN()" 
                  style="background: #10b981; color: white; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            📋 IBAN kopieren
          </button>
          <button onclick="donationIntegration.closeIBANModal()" 
                  style="background: var(--davinci-border, #223040); color: white; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            Schließen
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  showIBANDetails() {
    const modal = document.getElementById('iban-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  closeIBANModal() {
    const modal = document.getElementById('iban-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  copyIBAN() {
    navigator.clipboard.writeText(this.iban).then(() => {
      alert('IBAN wurde in die Zwischenablage kopiert!');
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = this.iban;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('IBAN wurde in die Zwischenablage kopiert!');
    });
  }

  /**
   * Initialisierung
   */
  init() {
    // Prüfe welches Portal
    if (document.querySelector('.os-container')) {
      this.integrateIntoOSTOSOS();
    } else if (document.querySelector('.wr')) {
      this.integrateIntoPortal();
    } else if (document.querySelector('.grid')) {
      this.integrateIntoForum();
    }
  }
}

// Globaler Export
window.DonationIntegration = DonationIntegration;

// Auto-Init
if (typeof window !== 'undefined') {
  window.donationIntegration = new DonationIntegration();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.donationIntegration.init();
    });
  } else {
    window.donationIntegration.init();
  }
}

