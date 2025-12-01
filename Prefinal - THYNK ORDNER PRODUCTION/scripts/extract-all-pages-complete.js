// KOMPLETTE Extraktion ALLER Seiten & Routen der THYNK-Anwendung
// Extrahiert 1:1 alle Seiten, Routen, Navigation und Struktur

async function extractAllPagesComplete() {
  console.log('📄 Starte KOMPLETTE Extraktion ALLER Seiten & Routen...\n');
  
  const extraction = {
    extracted_at: new Date().toISOString(),
    source: 'https://thynkorders.com',
    url: window.location.href,
    version: '1.0.0',
    pages: [],
    routes: [],
    navigation: {},
    sitemap: [],
    components: {},
    functionality: {}
  };

  try {
    // 1. ALLE ROUTEN IDENTIFIZIEREN
    console.log('🔍 Identifiziere ALLE Routen...');
    const routes = await extractAllRoutes();
    extraction.routes = routes;
    console.log(`✅ ${routes.length} Routen gefunden`);

    // 2. ALLE SEITEN IDENTIFIZIEREN
    console.log('📄 Identifiziere ALLE Seiten...');
    const pages = await extractAllPages();
    extraction.pages = pages;
    console.log(`✅ ${pages.length} Seiten gefunden`);

    // 3. NAVIGATIONS-STRUKTUR
    console.log('🧭 Extrahiere Navigations-Struktur...');
    const navigation = await extractCompleteNavigation();
    extraction.navigation = navigation;
    console.log('✅ Navigation extrahiert');

    // 4. SITEMAP ERSTELLEN
    console.log('🗺️ Erstelle Sitemap...');
    const sitemap = await createSitemap();
    extraction.sitemap = sitemap;
    console.log(`✅ Sitemap mit ${sitemap.length} Einträgen erstellt`);

    // 5. KOMPONENTEN IDENTIFIZIEREN
    console.log('🧩 Identifiziere Komponenten...');
    const components = await extractComponents();
    extraction.components = components;
    console.log('✅ Komponenten identifiziert');

    // 6. FUNKTIONALITÄT ANALYSIEREN
    console.log('⚙️ Analysiere Funktionalität...');
    const functionality = await analyzeFunctionality();
    extraction.functionality = functionality;
    console.log('✅ Funktionalität analysiert');

    // 7. DOWNLOAD
    const dataStr = JSON.stringify(extraction, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thynk-all-pages-routes-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('\n🎉 KOMPLETTE Seiten & Routen-Extraktion abgeschlossen!');
    console.log('📥 JSON-Datei wurde heruntergeladen');
    console.log('\n📊 Zusammenfassung:');
    console.log(`   - Routen: ${routes.length}`);
    console.log(`   - Seiten: ${pages.length}`);
    console.log(`   - Navigation Items: ${navigation.main_menu?.items?.length || 0}`);
    console.log(`   - Sitemap Einträge: ${sitemap.length}`);
    console.log(`   - Komponenten: ${Object.keys(components).length}`);
    
    return extraction;

  } catch (error) {
    console.error('❌ Fehler bei Extraktion:', error);
    return { error: error.message, stack: error.stack };
  }
}

// ========== HILFSFUNKTIONEN ==========

async function extractAllRoutes() {
  const routes = new Set();
  const routeData = [];

  // Hash-Routes (#/...)
  const hashPattern = /#\/([^?\s]+)/g;
  const currentHash = window.location.hash;
  if (currentHash) {
    routes.add(currentHash);
  }

  // Alle Links analysieren
  const allLinks = Array.from(document.querySelectorAll('a[href]'));
  allLinks.forEach(link => {
    const href = link.href || link.getAttribute('href');
    if (href) {
      // Hash-Routes
      if (href.includes('#/')) {
        const match = href.match(/#\/([^?\s]+)/);
        if (match) {
          const route = '#/' + match[1];
          routes.add(route);
        }
      }
      
      // Pathname-Routes
      try {
        const url = new URL(href, window.location.origin);
        if (url.hostname === window.location.hostname || url.hostname === 'thynkorders.com') {
          if (url.pathname !== '/' && url.pathname !== '') {
            routes.add(url.pathname);
          }
        }
      } catch (e) {}
    }
  });

  // Router-Konfiguration analysieren (wenn verfügbar)
  if (window.router || window.app || window.Router) {
    const routerObj = window.router || window.app?.router || window.Router;
    if (routerObj && routerObj.routes) {
      Object.keys(routerObj.routes).forEach(route => {
        routes.add(route);
      });
    }
  }

  // Routen-Daten strukturieren
  Array.from(routes).forEach(route => {
    routeData.push({
      route: route,
      type: route.startsWith('#/') ? 'hash' : 'pathname',
      full_url: route.startsWith('#/') ? window.location.origin + route : window.location.origin + route
    });
  });

  return routeData;
}

async function extractAllPages() {
  const pages = [];
  const pageIds = new Set();

  // Hash-Routes zu Seiten mappen
  const routes = await extractAllRoutes();
  routes.forEach(route => {
    if (route.type === 'hash') {
      const pageId = route.route.replace('#/', '').replace(/\//g, '-') || 'home';
      if (!pageIds.has(pageId)) {
        pageIds.add(pageId);
        pages.push({
          id: pageId,
          route: route.route,
          name: formatPageName(pageId),
          type: 'hash-route'
        });
      }
    }
  });

  // Komponenten/Vue/React-Seiten (wenn SPA)
  const appElement = document.getElementById('app');
  if (appElement) {
    // Suche nach Router-Views
    const routerViews = document.querySelectorAll('[router-view], [router-view-name], [data-router-view]');
    routerViews.forEach((view, index) => {
      const viewId = view.id || `view-${index}`;
      pages.push({
        id: viewId,
        route: view.getAttribute('data-route') || null,
        name: viewId,
        type: 'router-view'
      });
    });
  }

  // Navigation-Links zu Seiten mappen
  const navLinks = document.querySelectorAll('nav a, .nav-link, [data-route]');
  navLinks.forEach(link => {
    const route = link.getAttribute('href') || link.getAttribute('data-route');
    if (route && route.startsWith('#/')) {
      const pageId = route.replace('#/', '').replace(/\//g, '-') || 'home';
      if (!pageIds.has(pageId)) {
        pageIds.add(pageId);
        pages.push({
          id: pageId,
          route: route,
          name: link.textContent?.trim() || formatPageName(pageId),
          type: 'navigation-link'
        });
      }
    }
  });

  // Typische THYNK-Seiten (falls nicht gefunden)
  const typicalPages = [
    { id: 'home', route: '#/', name: 'Home' },
    { id: 'userCenter', route: '#/userCenter', name: 'User Center' },
    { id: 'orders', route: '#/orders', name: 'Orders' },
    { id: 'products', route: '#/products', name: 'Products' },
    { id: 'invoices', route: '#/invoices', name: 'Invoices' },
    { id: 'customers', route: '#/customers', name: 'Customers' },
    { id: 'settings', route: '#/settings', name: 'Settings' },
    { id: 'sign-in', route: '#/sign-in', name: 'Sign In' }
  ];

  typicalPages.forEach(page => {
    if (!pageIds.has(page.id)) {
      pageIds.add(page.id);
      pages.push({
        ...page,
        type: 'typical-thynk-page'
      });
    }
  });

  return pages;
}

async function extractCompleteNavigation() {
  const navigation = {
    main_menu: {},
    sidebar: {},
    breadcrumbs: {},
    dropdowns: [],
    mobile_menu: {},
    footer_nav: {},
    tabs: [],
    complete_structure: {}
  };

  // Haupt-Menü
  const mainMenuEl = document.querySelector('nav, .main-menu, .primary-nav, .navbar, header nav');
  if (mainMenuEl) {
    navigation.main_menu = {
      selector: mainMenuEl.tagName + (mainMenuEl.className ? '.' + mainMenuEl.className.split(' ').join('.') : ''),
      items: Array.from(mainMenuEl.querySelectorAll('a, [data-route]')).map(link => ({
        text: link.textContent?.trim(),
        href: link.href || link.getAttribute('href'),
        route: link.getAttribute('data-route'),
        classes: link.className
      }))
    };
  }

  // Sidebar
  const sidebarEl = document.querySelector('aside, .sidebar, .side-nav');
  if (sidebarEl) {
    navigation.sidebar = {
      items: Array.from(sidebarEl.querySelectorAll('a, [data-route]')).map(link => ({
        text: link.textContent?.trim(),
        href: link.href || link.getAttribute('href'),
        route: link.getAttribute('data-route')
      }))
    };
  }

  // Breadcrumbs
  const breadcrumbEl = document.querySelector('nav[aria-label="breadcrumb"], .breadcrumb');
  if (breadcrumbEl) {
    navigation.breadcrumbs = {
      items: Array.from(breadcrumbEl.querySelectorAll('a, li')).map(item => ({
        text: item.textContent?.trim(),
        href: item.href || item.querySelector('a')?.href
      }))
    };
  }

  // Dropdowns
  document.querySelectorAll('.dropdown, [class*="dropdown"]').forEach(dropdown => {
    const menu = dropdown.querySelector('.dropdown-menu, ul, [role="menu"]');
    if (menu) {
      navigation.dropdowns.push({
        trigger: dropdown.textContent?.trim(),
        items: Array.from(menu.querySelectorAll('a')).map(item => ({
          text: item.textContent?.trim(),
          href: item.href
        }))
      });
    }
  });

  // Footer
  const footer = document.querySelector('footer');
  if (footer) {
    navigation.footer_nav = {
      items: Array.from(footer.querySelectorAll('a')).map(link => ({
        text: link.textContent?.trim(),
        href: link.href
      }))
    };
  }

  // Tabs
  document.querySelectorAll('[role="tablist"], .tabs').forEach(tabList => {
    navigation.tabs.push({
      tabs: Array.from(tabList.querySelectorAll('[role="tab"], .tab')).map(tab => ({
        text: tab.textContent?.trim(),
        id: tab.id || tab.getAttribute('aria-controls')
      }))
    });
  });

  return navigation;
}

async function createSitemap() {
  const sitemap = [];
  const routes = await extractAllRoutes();
  const pages = await extractAllPages();

  routes.forEach(route => {
    const page = pages.find(p => p.route === route.route);
    sitemap.push({
      route: route.route,
      name: page?.name || formatPageName(route.route),
      type: route.type,
      full_url: route.full_url
    });
  });

  return sitemap;
}

async function extractComponents() {
  const components = {
    buttons: [],
    forms: [],
    tables: [],
    cards: [],
    modals: [],
    inputs: [],
    navigation: []
  };

  // Buttons
  document.querySelectorAll('button, .btn, [class*="button"]').forEach((btn, index) => {
    if (index < 20) {
      components.buttons.push({
        text: btn.textContent?.trim(),
        classes: btn.className,
        onclick: btn.getAttribute('onclick'),
        type: btn.type || 'button'
      });
    }
  });

  // Forms
  document.querySelectorAll('form').forEach((form, index) => {
    if (index < 10) {
      components.forms.push({
        id: form.id,
        action: form.action,
        method: form.method,
        inputs: Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
          type: input.type,
          name: input.name,
          placeholder: input.placeholder,
          required: input.required
        }))
      });
    }
  });

  // Tables
  document.querySelectorAll('table').forEach((table, index) => {
    if (index < 5) {
      components.tables.push({
        id: table.id,
        rows: table.rows.length,
        columns: table.rows[0]?.cells.length || 0
      });
    }
  });

  // Cards
  document.querySelectorAll('.card, [class*="card"]').forEach((card, index) => {
    if (index < 20) {
      components.cards.push({
        id: card.id,
        classes: card.className,
        content: card.textContent?.trim().substring(0, 100)
      });
    }
  });

  return components;
}

async function analyzeFunctionality() {
  const functionality = {
    data_storage: [],
    api_endpoints: [],
    events: [],
    functions: []
  };

  // LocalStorage Keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.toLowerCase().includes('thynk')) {
      functionality.data_storage.push({
        key: key,
        type: 'localStorage'
      });
    }
  }

  // Window Functions (THYNK-bezogen)
  for (let key in window) {
    if (key.toLowerCase().includes('thynk') || 
        key.toLowerCase().includes('order') ||
        key.toLowerCase().includes('route')) {
      try {
        if (typeof window[key] === 'function') {
          functionality.functions.push({
            name: key,
            type: 'function'
          });
        }
      } catch (e) {}
    }
  }

  return functionality;
}

// ========== UTILITY ==========

function formatPageName(pageId) {
  return pageId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Globale Funktion
window.extractAllPagesComplete = extractAllPagesComplete;

console.log('✅ KOMPLETE Seiten & Routen-Extraktions-Script geladen!');
console.log('🚀 Führen Sie aus: extractAllPagesComplete()');
console.log('   Oder: window.extractAllPagesComplete()');
console.log('\n📋 Extrahiert:');
console.log('   - ALLE Routen (Hash & Pathname)');
console.log('   - ALLE Seiten');
console.log('   - Komplette Navigation');
console.log('   - Sitemap');
console.log('   - Komponenten');
console.log('   - Funktionalität');

