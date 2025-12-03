/**
 * DB.com Menu 1:1 Implementation
 * Exakte Nachbildung des DB.com Menüs mit T,. Symbolen
 * Version: 1.0.0
 */

(function() {
  'use strict';
  
  // T,. Symbolica Icons
  const T_SYMBOL = 'T';
  const COMMA_SYMBOL = ',';
  const POINT_SYMBOL = '.';
  const TTT_SYMBOL = `${T_SYMBOL}${COMMA_SYMBOL}.&${T_SYMBOL}${COMMA_SYMBOL}${COMMA_SYMBOL}.&${T_SYMBOL}${COMMA_SYMBOL}${COMMA_SYMBOL}${COMMA_SYMBOL}.`;
  
  // Menu Structure (DB.com 1:1)
  const menuStructure = {
    logo: {
      text: 'T,.&T,,.&T,,,.TOGETHERSYSTEMS',
      href: './index.html',
      symbol: TTT_SYMBOL
    },
    nav: [
      {
        label: 'Portal',
        href: './index.html',
        icon: '🏠'
      },
      {
        label: 'Online-Portal',
        href: './manifest-portal.html',
        icon: '🌐'
      },
      {
        label: 'Manifest',
        href: './manifest-forum.html',
        icon: '📋'
      },
      {
        label: 'Wabenräume',
        href: './honeycomb.html',
        icon: '🍯'
      },
      {
        label: 'Legal-Hub',
        href: './legal-hub.html',
        icon: '⚖️'
      },
      {
        label: 'TELBANK',
        href: './TELBANK/telbank-portal-negative-assets.html',
        icon: '💰',
        style: 'bank'
      },
      {
        label: 'TELADIA',
        href: './TELADIA/teladia-portal-redesign.html',
        icon: '💎',
        style: 'bank'
      },
      {
        label: 'CMS',
        href: './cms-dashboard.html',
        icon: '📝'
      },
      {
        label: 'Settings',
        href: './SETTINGS-MASTER-DASHBOARD.html',
        icon: '⚙️'
      }
    ],
    dropdowns: [
      {
        label: 'Mehr',
        items: [
          { label: 'Duurzaam Bouwen', href: './duurzaam-bouwen-nederland.html', icon: '🇳🇱' },
          { label: 'Investoren-Portal', href: './ostos-branding.html', icon: '💎' },
          { label: 'Microsoft Account', href: './Microsoft-Account-Android-Erklaerung.html', icon: '📧' },
          { label: 'Bank Contacts', href: './bank-contact-universe.html', icon: '🏦' },
          { label: 'JJC Supervisor', href: './JJC-SUPERVISOR-GATE.html', icon: '🔍' },
          { label: 'Job-Angebot', href: './JOB-ANGEBOT-ENTWICKLER.html', icon: '💼' }
        ]
      }
    ]
  };
  
  // Create DB.com Menu
  function createDBMenu() {
    const menu = document.createElement('nav');
    menu.className = 'db-menu';
    
    const container = document.createElement('div');
    container.className = 'db-menu__container';
    
    // Logo
    const logo = document.createElement('a');
    logo.className = 'db-menu__logo';
    logo.href = menuStructure.logo.href;
    logo.innerHTML = `
      <span class="db-menu__symbol db-menu__symbol--t">${menuStructure.logo.symbol}</span>
      <span class="db-menu__logo-text">${menuStructure.logo.text}</span>
    `;
    
    // Navigation
    const nav = document.createElement('ul');
    nav.className = 'db-menu__nav';
    
    menuStructure.nav.forEach(item => {
      const li = document.createElement('li');
      li.className = 'db-menu__nav-item';
      
      const link = document.createElement('a');
      link.className = `db-menu__nav-link ${item.href === window.location.pathname.split('/').pop() ? 'db-menu__nav-link--active' : ''}`;
      link.href = item.href;
      link.innerHTML = `<span class="db-menu__symbol">${item.icon || ''}</span> ${item.label}`;
      
      if (item.style === 'bank') {
        link.style.color = 'var(--db-blue)';
        link.style.fontWeight = 'var(--db-font-weight-semibold)';
      }
      
      li.appendChild(link);
      nav.appendChild(li);
    });
    
    // Dropdowns
    menuStructure.dropdowns.forEach(dropdown => {
      const li = document.createElement('li');
      li.className = 'db-menu__nav-item db-menu__dropdown';
      
      const toggle = document.createElement('button');
      toggle.className = 'db-menu__dropdown-toggle';
      toggle.textContent = dropdown.label;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
      });
      
      const menu = document.createElement('div');
      menu.className = 'db-menu__dropdown-menu';
      
      dropdown.items.forEach(item => {
        const link = document.createElement('a');
        link.className = 'db-menu__dropdown-item';
        link.href = item.href;
        link.innerHTML = `<span class="db-menu__symbol">${item.icon || ''}</span> ${item.label}`;
        menu.appendChild(link);
      });
      
      li.appendChild(toggle);
      li.appendChild(menu);
      nav.appendChild(li);
    });
    
    // Mobile Toggle
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'db-menu__mobile-toggle';
    mobileToggle.setAttribute('aria-label', 'Menu öffnen');
    mobileToggle.innerHTML = '<svg class="db-menu__mobile-toggle-icon" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
    mobileToggle.addEventListener('click', function() {
      nav.classList.toggle('db-menu__nav--mobile-open');
    });
    
    container.appendChild(logo);
    container.appendChild(nav);
    container.appendChild(mobileToggle);
    menu.appendChild(container);
    
    return menu;
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    // Find existing header/menu
    const existingHeader = document.querySelector('header');
    const existingBrandBanner = document.querySelector('.ts-brand-banner');
    
    // Create DB.com Menu
    const dbMenu = createDBMenu();
    
    // Replace or insert
    if (existingHeader) {
      existingHeader.replaceWith(dbMenu);
    } else if (existingBrandBanner) {
      existingBrandBanner.insertAdjacentElement('beforebegin', dbMenu);
    } else {
      document.body.insertBefore(dbMenu, document.body.firstChild);
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.db-menu__dropdown')) {
        document.querySelectorAll('.db-menu__dropdown-toggle').forEach(toggle => {
          toggle.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }
  
  // Export for module use
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createDBMenu, menuStructure };
  }
  
  window.DBMenu = { createDBMenu, menuStructure };
})();

