// T,. ROOT-APPS INTEGRATION
// Integration aller neuen HTML-Dateien aus dem Root in die drei Portale
// Status: ✅ AKTIV

/**
 * Root-Apps Integration
 * Identifiziert und integriert alle neuen HTML-Dateien aus dem Root
 * in OSTOSOS, manifest-portal.html und manifest-forum.html
 */

class RootAppsIntegration {
  constructor() {
    this.apps = [
      {
        id: 'cosmic-visualizer',
        title: 'Cosmic Visualizer Enterprise Universe XXL',
        description: 'Visualisierung des Universums und kosmischer Strukturen',
        file: 'Cosmic Visualizer Enterprise Universe XXL.html',
        category: 'visualization',
        icon: '🌌',
        standalone: true
      },
      {
        id: 'heilungsspirale-studio',
        title: 'Heilungsspirale Studio',
        description: 'Interaktive Applikation für Heilungsspiralen',
        file: 'Interaktive Applikation – Heilungsspirale Studio.html',
        category: 'healing',
        icon: '🌀',
        standalone: true
      },
      {
        id: 'global-healing-portal',
        title: 'Global Healing Portal',
        description: 'Wisdom & Traditions - Portal für Heilungswissen',
        file: 'Global Healing Portal – Wisdom & Traditions.html',
        category: 'healing',
        icon: '🌍',
        standalone: true
      },
      {
        id: 'heilungspirale',
        title: 'Heilungsspirale',
        description: 'Heilungsspirale Applikation',
        file: 'heilungspirale.html',
        category: 'healing',
        icon: '🌀',
        standalone: true
      },
      {
        id: 'investment-presentation',
        title: 'Investment Presentation',
        description: 'Together Systems – Investment für das nächste Millennium',
        file: 'investment-presentation.html',
        category: 'business',
        icon: '💰',
        standalone: true
      },
      {
        id: 'encryption-laboratory',
        title: 'Encryption Laboratory',
        description: 'Experimentelles Verschlüsselungslabor – Forschung & Eigenstudium',
        file: 'encryption-laboratory.html',
        category: 'security',
        icon: '🔐',
        standalone: true
      },
      {
        id: 'neural-network-console',
        title: 'Neural Network Console',
        description: 'Neural Network Console für KI-Experimente',
        file: 'neural-network-console.html',
        category: 'ai',
        icon: '🧠',
        standalone: true
      },
      {
        id: 'production-dashboard',
        title: 'Production Dashboard',
        description: 'Production Dashboard für System-Überwachung',
        file: 'production-dashboard.html',
        category: 'system',
        icon: '📊',
        standalone: true
      },
      {
        id: 'produktionsprozess-dashboard',
        title: 'Produktionsprozess Dashboard',
        description: 'Dashboard für Produktionsprozess-Dateien',
        file: 'PRODUKTIONSPROZESS-DATEIEN-DASHBOARD.html',
        category: 'system',
        icon: '📁',
        standalone: true
      },
      {
        id: 'builder-bereinigt',
        title: 'Builder – Bereinigte Version',
        description: 'Builder-Tool in bereinigter Version',
        file: 'Builder – Bereinigte Version.html',
        category: 'tools',
        icon: '🔧',
        standalone: true
      },
      {
        id: 'source-code-fach',
        title: 'Source Code Fach',
        description: 'Source Code Management',
        file: 'source-code-fach.html',
        category: 'development',
        icon: '💻',
        standalone: true
      },
      {
        id: 'suos-braintext',
        title: 'SUOS Braintext System',
        description: 'SUOS-offen Braintext System',
        file: 'suos-braintext-system.html',
        category: 'system',
        icon: '📝',
        standalone: true
      },
      {
        id: 'encryption-dashboard',
        title: 'Encryption Dashboard',
        description: 'Dashboard für Verschlüsselung',
        file: 'encryption-dashboard.html',
        category: 'security',
        icon: '🔒',
        standalone: true
      },
      {
        id: 'oso-produktions-system',
        title: 'OSO Produktions System',
        description: 'OSO Produktions System Complete',
        file: 'OSO-PRODUKTIONS-SYSTEM-COMPLETE.html',
        category: 'system',
        icon: '⚙️',
        standalone: true
      },
      {
        id: 'oso-produktions-system-extended',
        title: 'OSO Produktions System Extended',
        description: 'OSO Produktions System Complete Extended',
        file: 'OSO-PRODUKTIONS-SYSTEM-COMPLETE-EXTENDED.html',
        category: 'system',
        icon: '⚙️',
        standalone: true
      },
      {
        id: 'ostosos-announcement',
        title: 'OSTOSOS Ankündigung',
        description: 'OSTOSOS Operating System Ankündigung',
        file: 'OSTOSOS-ANKUENDIGUNG.html',
        category: 'system',
        icon: '🖥️',
        standalone: true
      },
      {
        id: 'ostosos-installer',
        title: 'OSTOSOS Installer',
        description: 'OSTOSOS Operating System Installer',
        file: 'OSTOSOS-OPERATING-SYSTEM-INSTALLER.html',
        category: 'system',
        icon: '💿',
        standalone: true
      },
      {
        id: 'ostosos-os-complete',
        title: 'OSTOSOS OS Complete',
        description: 'OSTOSOS Operating System Complete',
        file: 'OSTOSOS-OS-COMPLETE-SYSTEM.html',
        category: 'system',
        icon: '🖥️',
        standalone: true
      },
      {
        id: 'ostos-branding',
        title: 'OSTOS Branding',
        description: 'OSTOS Branding Storybook',
        file: 'ostos-branding.html',
        category: 'branding',
        icon: '🎨',
        standalone: true
      },
      {
        id: 'admin-monitoring',
        title: 'Admin Monitoring',
        description: 'Admin Monitoring Dashboard',
        file: 'admin-monitoring.html',
        category: 'admin',
        icon: '👁️',
        standalone: true
      },
      {
        id: 'business-admin',
        title: 'Business Admin',
        description: 'Business Admin Dashboard',
        file: 'business-admin.html',
        category: 'business',
        icon: '💼',
        standalone: true
      },
      {
        id: 'cms-dashboard',
        title: 'CMS Dashboard',
        description: 'CMS Dashboard',
        file: 'cms-dashboard.html',
        category: 'cms',
        icon: '📰',
        standalone: true
      },
      {
        id: 'jjc-supervisor',
        title: 'JJC Supervisor Gate',
        description: 'Joint Justification Chain Supervisor Gate',
        file: 'JJC-SUPERVISOR-GATE.html',
        category: 'system',
        icon: '🔗',
        standalone: true
      },
      {
        id: 'bank-contact-universe',
        title: 'Bank Contact Universe',
        description: 'Bank Contact Universe',
        file: 'bank-contact-universe.html',
        category: 'business',
        icon: '🏦',
        standalone: true
      },
      {
        id: 'duurzaam-bouwen',
        title: 'Duurzaam Bouwen Nederland',
        description: 'Nachhaltiges Bauen in den Niederlanden',
        file: 'duurzaam-bouwen-nederland.html',
        category: 'business',
        icon: '🏗️',
        standalone: true
      }
    ];
  }

  /**
   * Integration in OSTOSOS
   */
  integrateIntoOSTOSOS() {
    if (!document.querySelector('.os-container')) return; // Nicht OSTOSOS

    // Warte auf DOM
    const checkInterval = setInterval(() => {
      const mainContent = document.querySelector('.main-content');
      if (!mainContent) return;

      clearInterval(checkInterval);

      // Root-Apps Section erstellen
      const appsSection = document.createElement('div');
      appsSection.id = 'root-apps-section';
      appsSection.className = 'section';
      appsSection.style.display = 'none';
      appsSection.innerHTML = `
        <div class="welcome-card">
          <h1>📦 Root-Apps & Tools</h1>
          <p>Alle verfügbaren Applikationen und Tools aus dem Root-Verzeichnis</p>
        </div>
        
        <div class="system-grid" id="root-apps-grid">
          ${this.renderAppsGrid()}
        </div>
      `;

      mainContent.appendChild(appsSection);

      // Navigation-Item hinzufügen
      this.addOSTOSOSNavigationItem();
    }, 100);
  }

  /**
   * Integration in manifest-portal.html
   */
  integrateIntoPortal() {
    if (!document.querySelector('.wr')) return; // Nicht Portal

    // Warte auf DOM
    const checkInterval = setInterval(() => {
      const portalContent = document.querySelector('.wr');
      if (!portalContent) return;

      clearInterval(checkInterval);

      // Root-Apps Panel erstellen
      const appsPanel = document.createElement('div');
      appsPanel.className = 'panel pad';
      appsPanel.style.marginTop = '18px';
      appsPanel.innerHTML = `
        <div class="title">📦 Root-Apps & Tools</div>
        <div class="row" style="margin-top: 12px; gap: 8px; flex-wrap: wrap;">
          ${this.renderAppsCards()}
        </div>
      `;

      // Nach THYNK-Section einfügen oder am Ende
      const thynkSection = document.getElementById('thynk-section');
      if (thynkSection && thynkSection.parentNode) {
        thynkSection.parentNode.insertBefore(appsPanel, thynkSection.nextSibling);
      } else {
        portalContent.appendChild(appsPanel);
      }
    }, 100);
  }

  /**
   * Integration in manifest-forum.html (nur wenn möglich)
   */
  integrateIntoForum() {
    if (!document.querySelector('.grid')) return; // Nicht Forum

    // Forum ist ein komplettes Programm, daher nur als Link-Liste
    const checkInterval = setInterval(() => {
      const forumContent = document.querySelector('.grid');
      if (!forumContent) return;

      clearInterval(checkInterval);

      // Root-Apps Card erstellen
      const appsCard = document.createElement('div');
      appsCard.className = 'card pad';
      appsCard.style.marginTop = '16px';
      appsCard.innerHTML = `
        <div class="sec-title">📦 Verfügbare Root-Apps</div>
        <div style="margin-top: 12px;">
          ${this.renderAppsList()}
        </div>
      `;

      forumContent.appendChild(appsCard);
    }, 100);
  }

  /**
   * Apps Grid für OSTOSOS rendern
   */
  renderAppsGrid() {
    return this.apps.map(app => `
      <div class="system-card" onclick="window.open('./${app.file}', '_blank')">
        <h3>${app.icon} ${this.escapeHtml(app.title)}</h3>
        <p>${this.escapeHtml(app.description)}</p>
        <span class="status-badge status-active">${app.category}</span>
      </div>
    `).join('');
  }

  /**
   * Apps Cards für Portal rendern
   */
  renderAppsCards() {
    return this.apps.map(app => `
      <div class="entry" style="cursor: pointer; border: 1px solid var(--border); border-radius: 8px; padding: 12px;" onclick="window.open('./${app.file}', '_blank')">
        <h3 style="margin: 0 0 6px;">${app.icon} ${this.escapeHtml(app.title)}</h3>
        <div class="meta">${this.escapeHtml(app.description)}</div>
        <div style="margin-top: 8px; font-size: 11px; color: var(--muted);">Kategorie: ${app.category}</div>
      </div>
    `).join('');
  }

  /**
   * Apps List für Forum rendern
   */
  renderAppsList() {
    return this.apps.map(app => `
      <div class="post" style="cursor: pointer;" onclick="window.open('./${app.file}', '_blank')">
        <h3>${app.icon} ${this.escapeHtml(app.title)}</h3>
        <div class="meta">${this.escapeHtml(app.description)}</div>
      </div>
    `).join('');
  }

  /**
   * Navigation-Item für OSTOSOS hinzufügen
   */
  addOSTOSOSNavigationItem() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const navItem = document.createElement('div');
    navItem.className = 'nav-item';
    navItem.innerHTML = '📦 Root-Apps';
    navItem.onclick = () => {
      // Finde showSection Funktion
      if (typeof showSection === 'function') {
        showSection('root-apps', navItem);
      }
      const appsSection = document.getElementById('root-apps-section');
      if (appsSection) {
        appsSection.style.display = 'block';
        appsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    // Nach THYNK einfügen oder am Ende
    const thynkItem = Array.from(sidebar.querySelectorAll('.nav-item')).find(item => 
      item.textContent.includes('THYNK')
    );
    
    if (thynkItem && thynkItem.nextSibling) {
      sidebar.insertBefore(navItem, thynkItem.nextSibling);
    } else {
      sidebar.appendChild(navItem);
    }
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

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Globaler Export
window.RootAppsIntegration = RootAppsIntegration;

// Auto-Init
if (typeof window !== 'undefined') {
  window.rootAppsIntegration = new RootAppsIntegration();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.rootAppsIntegration.init();
    });
  } else {
    window.rootAppsIntegration.init();
  }
}

