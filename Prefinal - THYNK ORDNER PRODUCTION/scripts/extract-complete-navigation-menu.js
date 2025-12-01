// KOMPLETTE Navigation & Menüführung Extraktion (1:1)
// Extrahiert ALLE Menüs, Navigation, Dropdowns, Sidebars etc. von thynkorders.com

async function extractCompleteNavigationMenu() {
  console.log('🧭 Starte KOMPLETTE Navigation & Menüführung Extraktion...\n');
  
  const navigation = {
    extracted_at: new Date().toISOString(),
    source: 'https://thynkorders.com',
    url: window.location.href,
    navigation: {
      main_menu: {},
      sidebar: {},
      breadcrumbs: {},
      dropdowns: {},
      mobile_menu: {},
      footer_nav: {},
      context_menu: {},
      tabs: {},
      pagination: {},
      complete_structure: {}
    }
  };

  try {
    // 1. HAUPT-MENÜ
    console.log('📋 Extrahiere Haupt-Menü...');
    const mainMenu = await extractMainMenu();
    navigation.navigation.main_menu = mainMenu;
    console.log(`✅ Haupt-Menü: ${mainMenu.items?.length || 0} Items`);

    // 2. SIDEBAR-NAVIGATION
    console.log('📑 Extrahiere Sidebar...');
    const sidebar = await extractSidebar();
    navigation.navigation.sidebar = sidebar;
    console.log(`✅ Sidebar: ${sidebar.items?.length || 0} Items`);

    // 3. BREADCRUMBS
    console.log('🍞 Extrahiere Breadcrumbs...');
    const breadcrumbs = await extractBreadcrumbs();
    navigation.navigation.breadcrumbs = breadcrumbs;
    console.log('✅ Breadcrumbs extrahiert');

    // 4. DROPDOWN-MENÜS
    console.log('📂 Extrahiere Dropdown-Menüs...');
    const dropdowns = await extractDropdowns();
    navigation.navigation.dropdowns = dropdowns;
    console.log(`✅ ${dropdowns.length} Dropdown-Menüs`);

    // 5. MOBILE-MENÜ
    console.log('📱 Extrahiere Mobile-Menü...');
    const mobileMenu = await extractMobileMenu();
    navigation.navigation.mobile_menu = mobileMenu;
    console.log('✅ Mobile-Menü extrahiert');

    // 6. FOOTER-NAVIGATION
    console.log('👣 Extrahiere Footer-Navigation...');
    const footerNav = await extractFooterNavigation();
    navigation.navigation.footer_nav = footerNav;
    console.log('✅ Footer-Navigation extrahiert');

    // 7. CONTEXT-MENÜS
    console.log('🖱️ Extrahiere Context-Menüs...');
    const contextMenus = await extractContextMenus();
    navigation.navigation.context_menu = contextMenus;
    console.log('✅ Context-Menüs extrahiert');

    // 8. TABS
    console.log('📑 Extrahiere Tabs...');
    const tabs = await extractTabs();
    navigation.navigation.tabs = tabs;
    console.log(`✅ ${tabs.length} Tab-Sets`);

    // 9. PAGINATION
    console.log('📄 Extrahiere Pagination...');
    const pagination = await extractPagination();
    navigation.navigation.pagination = pagination;
    console.log('✅ Pagination extrahiert');

    // 10. KOMPLETTE NAVIGATIONS-STRUKTUR
    console.log('🗺️ Extrahiere komplette Navigations-Struktur...');
    const completeStructure = await extractCompleteNavigationStructure();
    navigation.navigation.complete_structure = completeStructure;
    console.log('✅ Komplette Struktur extrahiert');

    // 11. MENÜ-STYLES & CSS
    console.log('🎨 Extrahiere Menü-Styles...');
    const menuStyles = await extractMenuStyles();
    navigation.navigation.styles = menuStyles;
    console.log('✅ Menü-Styles extrahiert');

    // 12. MENÜ-JAVASCRIPT
    console.log('⚙️ Extrahiere Menü-JavaScript...');
    const menuJS = await extractMenuJavaScript();
    navigation.navigation.javascript = menuJS;
    console.log('✅ Menü-JavaScript extrahiert');

    // Download
    const dataStr = JSON.stringify(navigation, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thynk-complete-navigation-menu-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('\n🎉 KOMPLETTE Navigation & Menüführung Extraktion abgeschlossen!');
    console.log('📥 JSON-Datei wurde heruntergeladen');
    console.log('\n📊 Zusammenfassung:');
    console.log(`   - Haupt-Menü Items: ${mainMenu.items?.length || 0}`);
    console.log(`   - Sidebar Items: ${sidebar.items?.length || 0}`);
    console.log(`   - Dropdown-Menüs: ${dropdowns.length}`);
    console.log(`   - Tabs: ${tabs.length}`);
    console.log(`   - Breadcrumbs: ${breadcrumbs.items?.length || 0}`);
    
    return navigation;

  } catch (error) {
    console.error('❌ Fehler bei Navigation-Extraktion:', error);
    return { error: error.message, stack: error.stack };
  }
}

// ========== HILFSFUNKTIONEN ==========

async function extractMainMenu() {
  const menu = {
    selector: null,
    items: [],
    structure: {},
    styles: {},
    html: null
  };

  // Finde Haupt-Menü
  const menuSelectors = [
    'nav[role="navigation"]',
    'nav.main',
    '.main-menu',
    '.primary-nav',
    '.navbar',
    'header nav',
    '[class*="menu"]',
    '[class*="nav"]'
  ];

  let mainMenuEl = null;
  for (const selector of menuSelectors) {
    mainMenuEl = document.querySelector(selector);
    if (mainMenuEl) {
      menu.selector = selector;
      break;
    }
  }

  if (!mainMenuEl) {
    // Suche in Header
    const header = document.querySelector('header');
    if (header) {
      mainMenuEl = header.querySelector('nav, [class*="menu"], [class*="nav"]');
      if (mainMenuEl) menu.selector = 'header nav';
    }
  }

  if (mainMenuEl) {
    menu.html = mainMenuEl.outerHTML;
    
    // Extrahiere alle Menü-Items
    const menuItems = mainMenuEl.querySelectorAll('a, button, [role="menuitem"], li > a');
    menuItems.forEach((item, index) => {
      const menuItem = {
        index: index,
        text: item.textContent?.trim(),
        href: item.href || item.getAttribute('href'),
        title: item.title || item.getAttribute('title'),
        classes: item.className,
        id: item.id,
        icon: item.querySelector('i, svg, img')?.outerHTML || null,
        children: []
      };

      // Sub-Menü-Items (Dropdown)
      const subMenu = item.parentElement?.querySelector('ul, ol, [role="menu"]');
      if (subMenu) {
        subMenu.querySelectorAll('a, [role="menuitem"]').forEach(subItem => {
          menuItem.children.push({
            text: subItem.textContent?.trim(),
            href: subItem.href || subItem.getAttribute('href'),
            classes: subItem.className
          });
        });
      }

      menu.items.push(menuItem);
    });

    // Styles
    const style = window.getComputedStyle(mainMenuEl);
    menu.styles = extractStyleObject(style);

    // Struktur
    menu.structure = {
      type: mainMenuEl.tagName.toLowerCase(),
      classes: mainMenuEl.className,
      id: mainMenuEl.id,
      role: mainMenuEl.getAttribute('role'),
      ariaLabel: mainMenuEl.getAttribute('aria-label')
    };
  }

  return menu;
}

async function extractSidebar() {
  const sidebar = {
    selector: null,
    items: [],
    structure: {},
    styles: {},
    html: null
  };

  const sidebarSelectors = [
    'aside',
    '.sidebar',
    '.side-nav',
    '[class*="sidebar"]',
    '[class*="side-nav"]',
    'nav.sidebar'
  ];

  let sidebarEl = null;
  for (const selector of sidebarSelectors) {
    sidebarEl = document.querySelector(selector);
    if (sidebarEl) {
      sidebar.selector = selector;
      break;
    }
  }

  if (sidebarEl) {
    sidebar.html = sidebarEl.outerHTML;
    
    // Items
    const items = sidebarEl.querySelectorAll('a, button, [role="menuitem"], li > a, .nav-item');
    items.forEach((item, index) => {
      sidebar.items.push({
        index: index,
        text: item.textContent?.trim(),
        href: item.href || item.getAttribute('href'),
        classes: item.className,
        icon: item.querySelector('i, svg, img')?.outerHTML || null,
        active: item.classList.contains('active') || item.getAttribute('aria-current') === 'page'
      });
    });

    // Styles
    const style = window.getComputedStyle(sidebarEl);
    sidebar.styles = extractStyleObject(style);

    // Struktur
    sidebar.structure = {
      type: sidebarEl.tagName.toLowerCase(),
      classes: sidebarEl.className,
      position: style.position,
      width: style.width
    };
  }

  return sidebar;
}

async function extractBreadcrumbs() {
  const breadcrumbs = {
    selector: null,
    items: [],
    structure: {},
    html: null
  };

  const breadcrumbSelectors = [
    'nav[aria-label="breadcrumb"]',
    '.breadcrumb',
    '.breadcrumbs',
    '[class*="breadcrumb"]',
    'ol.breadcrumb',
    'ul.breadcrumb'
  ];

  let breadcrumbEl = null;
  for (const selector of breadcrumbSelectors) {
    breadcrumbEl = document.querySelector(selector);
    if (breadcrumbEl) {
      breadcrumbs.selector = selector;
      break;
    }
  }

  if (breadcrumbEl) {
    breadcrumbs.html = breadcrumbEl.outerHTML;
    
    const items = breadcrumbEl.querySelectorAll('li, a, [role="listitem"]');
    items.forEach((item, index) => {
      breadcrumbs.items.push({
        index: index,
        text: item.textContent?.trim(),
        href: item.href || item.querySelector('a')?.href,
        isLast: index === items.length - 1,
        classes: item.className
      });
    });

    breadcrumbs.structure = {
      type: breadcrumbEl.tagName.toLowerCase(),
      classes: breadcrumbEl.className
    };
  }

  return breadcrumbs;
}

async function extractDropdowns() {
  const dropdowns = [];

  // Finde alle Dropdowns
  const dropdownSelectors = [
    '.dropdown',
    '[class*="dropdown"]',
    '[data-toggle="dropdown"]',
    '[aria-haspopup="true"]',
    'select'
  ];

  dropdownSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((dropdown, index) => {
      const dropdownData = {
        selector: selector,
        index: index,
        trigger: {
          text: dropdown.textContent?.trim(),
          classes: dropdown.className,
          html: dropdown.outerHTML.substring(0, 200)
        },
        menu: null,
        items: []
      };

      // Dropdown-Menü finden
      const menu = dropdown.querySelector('.dropdown-menu, .dropdown-content, ul, [role="menu"]') ||
                   dropdown.nextElementSibling?.querySelector('.dropdown-menu, [role="menu"]');

      if (menu) {
        dropdownData.menu = {
          classes: menu.className,
          html: menu.outerHTML.substring(0, 500)
        };

        menu.querySelectorAll('a, button, [role="menuitem"], li').forEach(item => {
          dropdownData.items.push({
            text: item.textContent?.trim(),
            href: item.href || item.getAttribute('href'),
            classes: item.className
          });
        });
      }

      dropdowns.push(dropdownData);
    });
  });

  return dropdowns;
}

async function extractMobileMenu() {
  const mobileMenu = {
    selector: null,
    trigger: null,
    menu: null,
    items: [],
    html: null
  };

  // Mobile Menu Trigger (Hamburger)
  const triggerSelectors = [
    '.mobile-menu-toggle',
    '.hamburger',
    '[class*="mobile-menu"]',
    '[class*="menu-toggle"]',
    'button[aria-label*="menu"]'
  ];

  let trigger = null;
  for (const selector of triggerSelectors) {
    trigger = document.querySelector(selector);
    if (trigger) break;
  }

  if (trigger) {
    mobileMenu.trigger = {
      html: trigger.outerHTML,
      classes: trigger.className,
      ariaLabel: trigger.getAttribute('aria-label')
    };

    // Mobile Menu
    const menu = document.querySelector('.mobile-menu, .mobile-nav, [class*="mobile-menu"], [class*="mobile-nav"]');
    if (menu) {
      mobileMenu.menu = {
        html: menu.outerHTML.substring(0, 1000),
        classes: menu.className
      };

      menu.querySelectorAll('a, [role="menuitem"]').forEach(item => {
        mobileMenu.items.push({
          text: item.textContent?.trim(),
          href: item.href || item.getAttribute('href'),
          classes: item.className
        });
      });
    }
  }

  return mobileMenu;
}

async function extractFooterNavigation() {
  const footerNav = {
    selector: null,
    sections: [],
    items: [],
    html: null
  };

  const footer = document.querySelector('footer');
  if (footer) {
    footerNav.selector = 'footer';
    footerNav.html = footer.outerHTML.substring(0, 2000);

    // Navigation-Sektionen im Footer
    footer.querySelectorAll('nav, .footer-nav, [class*="footer-nav"]').forEach((nav, index) => {
      const section = {
        index: index,
        title: nav.querySelector('h3, h4, .title')?.textContent?.trim() || null,
        items: []
      };

      nav.querySelectorAll('a, li > a').forEach(item => {
        section.items.push({
          text: item.textContent?.trim(),
          href: item.href || item.getAttribute('href')
        });
      });

      footerNav.sections.push(section);
    });

    // Alle Links im Footer
    footer.querySelectorAll('a').forEach(item => {
      footerNav.items.push({
        text: item.textContent?.trim(),
        href: item.href || item.getAttribute('href'),
        classes: item.className
      });
    });
  }

  return footerNav;
}

async function extractContextMenus() {
  const contextMenus = [];

  // Suche nach Context-Menüs (meist hidden)
  document.querySelectorAll('[role="menu"], .context-menu, [class*="context-menu"]').forEach(menu => {
    if (menu.offsetParent !== null || window.getComputedStyle(menu).display !== 'none') {
      const items = [];
      menu.querySelectorAll('[role="menuitem"], a, button, li').forEach(item => {
        items.push({
          text: item.textContent?.trim(),
          action: item.onclick?.toString() || item.getAttribute('onclick'),
          classes: item.className
        });
      });

      contextMenus.push({
        selector: menu.className || menu.id,
        items: items,
        html: menu.outerHTML.substring(0, 500)
      });
    }
  });

  return contextMenus;
}

async function extractTabs() {
  const tabs = [];

  // Finde alle Tab-Container
  document.querySelectorAll('[role="tablist"], .tabs, [class*="tab"]').forEach((tabList, index) => {
    const tabSet = {
      index: index,
      selector: tabList.className || tabList.id,
      tabs: [],
      panels: []
    };

    // Tab-Buttons
    tabList.querySelectorAll('[role="tab"], .tab, button[data-tab]').forEach(tab => {
      tabSet.tabs.push({
        text: tab.textContent?.trim(),
        id: tab.id || tab.getAttribute('aria-controls'),
        classes: tab.className,
        active: tab.classList.contains('active') || tab.getAttribute('aria-selected') === 'true'
      });
    });

    // Tab-Panels
    const panels = document.querySelectorAll(`[role="tabpanel"], .tab-panel, [class*="tab-panel"]`);
    panels.forEach(panel => {
      tabSet.panels.push({
        id: panel.id,
        classes: panel.className,
        html: panel.outerHTML.substring(0, 500)
      });
    });

    tabs.push(tabSet);
  });

  return tabs;
}

async function extractPagination() {
  const pagination = {
    selector: null,
    items: [],
    html: null
  };

  const paginationEl = document.querySelector('.pagination, [class*="pagination"], nav[aria-label*="pagination"]');
  if (paginationEl) {
    pagination.selector = paginationEl.className;
    pagination.html = paginationEl.outerHTML;

    paginationEl.querySelectorAll('a, button, [role="link"]').forEach(item => {
      pagination.items.push({
        text: item.textContent?.trim(),
        href: item.href || item.getAttribute('href'),
        classes: item.className,
        ariaLabel: item.getAttribute('aria-label')
      });
    });
  }

  return pagination;
}

async function extractCompleteNavigationStructure() {
  const structure = {
    routes: [],
    menu_hierarchy: {},
    navigation_map: {},
    sitemap: []
  };

  // Alle Links sammeln
  const allLinks = Array.from(document.querySelectorAll('a[href]'));
  const routes = new Set();

  allLinks.forEach(link => {
    const href = link.href || link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      try {
        const url = new URL(href, window.location.origin);
        routes.add(url.pathname);
        
        structure.sitemap.push({
          text: link.textContent?.trim(),
          href: url.pathname,
          fullUrl: href
        });
      } catch (e) {}
    }
  });

  structure.routes = Array.from(routes);

  // Menü-Hierarchie
  const mainMenu = document.querySelector('nav, .main-menu, .primary-nav');
  if (mainMenu) {
    structure.menu_hierarchy = extractMenuHierarchy(mainMenu);
  }

  return structure;
}

async function extractMenuStyles() {
  const styles = {};

  const menuElements = [
    'nav',
    '.main-menu',
    '.sidebar',
    '.breadcrumb',
    '.dropdown',
    '.mobile-menu'
  ];

  menuElements.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      const style = window.getComputedStyle(elements[0]);
      styles[selector] = extractStyleObject(style);
    }
  });

  return styles;
}

async function extractMenuJavaScript() {
  const jsConfig = {
    menu_handlers: [],
    navigation_functions: [],
    event_listeners: []
  };

  // Suche nach Menu-bezogenen JavaScript-Objekten
  for (let key in window) {
    if (key.toLowerCase().includes('menu') || 
        key.toLowerCase().includes('nav') ||
        key.toLowerCase().includes('dropdown')) {
      try {
        if (typeof window[key] === 'function') {
          jsConfig.navigation_functions.push({
            name: key,
            type: 'function'
          });
        } else if (typeof window[key] === 'object') {
          jsConfig.menu_handlers.push({
            name: key,
            type: typeof window[key]
          });
        }
      } catch (e) {}
    }
  }

  return jsConfig;
}

// ========== UTILITY ==========

function extractStyleObject(style) {
  const styleObj = {};
  if (style && style.length) {
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      styleObj[prop] = style.getPropertyValue(prop);
    }
  }
  return styleObj;
}

function extractMenuHierarchy(element) {
  const hierarchy = {
    type: element.tagName.toLowerCase(),
    classes: element.className,
    items: []
  };

  element.querySelectorAll('> ul > li, > ol > li, > a').forEach(item => {
    const itemData = {
      text: item.textContent?.trim(),
      href: item.querySelector('a')?.href || item.href,
      children: []
    };

    const subMenu = item.querySelector('ul, ol');
    if (subMenu) {
      subMenu.querySelectorAll('li').forEach(subItem => {
        itemData.children.push({
          text: subItem.textContent?.trim(),
          href: subItem.querySelector('a')?.href
        });
      });
    }

    hierarchy.items.push(itemData);
  });

  return hierarchy;
}

// Globale Funktion
window.extractCompleteNavigationMenu = extractCompleteNavigationMenu;

console.log('✅ KOMPLETE Navigation & Menüführung Extraktions-Script geladen!');
console.log('🚀 Führen Sie aus: extractCompleteNavigationMenu()');
console.log('   Oder: window.extractCompleteNavigationMenu()');
console.log('\n📋 Extrahiert:');
console.log('   - Haupt-Menü komplett');
console.log('   - Sidebar-Navigation');
console.log('   - Breadcrumbs');
console.log('   - Dropdown-Menüs');
console.log('   - Mobile-Menü');
console.log('   - Footer-Navigation');
console.log('   - Context-Menüs');
console.log('   - Tabs');
console.log('   - Pagination');
console.log('   - Komplette Navigations-Struktur');
console.log('   - Menü-Styles & JavaScript');

