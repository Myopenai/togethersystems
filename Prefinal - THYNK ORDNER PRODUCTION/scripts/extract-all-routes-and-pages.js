// Extrahiert ALLE Routen & Seiten der Application (1:1)
// Analysiert SPA-Routing, Navigation, alle verfügbaren Seiten

async function extractAllRoutesAndPages() {
  console.log('🗺️ Starte Extraktion ALLER Routen & Seiten...\n');
  
  const routes = {
    extracted_at: new Date().toISOString(),
    source: 'https://thynkorders.com',
    current_url: window.location.href,
    routes: [],
    pages: [],
    navigation: {},
    sitemap: []
  };

  try {
    // 1. Alle Links analysieren (für Routen-Erkennung)
    console.log('🔗 Analysiere alle Links...');
    const allLinks = Array.from(document.querySelectorAll('a[href]'));
    const routeSet = new Set();
    
    allLinks.forEach(link => {
      const href = link.href || link.getAttribute('href');
      if (href) {
        try {
          const url = new URL(href, window.location.origin);
          if (url.hostname === window.location.hostname || url.hostname === 'thynkorders.com') {
            const route = url.pathname + (url.hash || '');
            routeSet.add(route);
            
            routes.sitemap.push({
              text: link.textContent?.trim(),
              href: route,
              full_url: href,
              title: link.title || link.getAttribute('title')
            });
          }
        } catch (e) {}
      }
    });
    
    routes.routes = Array.from(routeSet).sort();
    console.log(`✅ ${routes.routes.length} Routen gefunden`);

    // 2. SPA-Routing analysieren (React Router, Vue Router, etc.)
    console.log('🔍 Analysiere SPA-Routing...');
    
    // React Router
    if (window.__REACT_ROUTER__ || window.React) {
      routes.framework = 'React';
      routes.routing_type = 'React Router';
      console.log('✅ React Router erkannt');
    }
    
    // Vue Router
    if (window.__VUE_ROUTER__ || window.Vue) {
      routes.framework = 'Vue';
      routes.routing_type = 'Vue Router';
      console.log('✅ Vue Router erkannt');
    }
    
    // Angular Router
    if (window.ng || document.querySelector('[ng-app]')) {
      routes.framework = 'Angular';
      routes.routing_type = 'Angular Router';
      console.log('✅ Angular Router erkannt');
    }

    // 3. Navigation-Struktur analysieren
    console.log('🧭 Analysiere Navigation...');
    
    const nav = document.querySelector('nav, [role="navigation"], .nav, .navigation');
    if (nav) {
      routes.navigation = {
        html: nav.outerHTML.substring(0, 2000),
        items: [],
        structure: {}
      };
      
      nav.querySelectorAll('a, [role="menuitem"], li > a').forEach(item => {
        routes.navigation.items.push({
          text: item.textContent?.trim(),
          href: item.href || item.getAttribute('href'),
          classes: item.className,
          title: item.title
        });
      });
    }

    // 4. Hash-Routing analysieren (#/ routes)
    console.log('📄 Analysiere Hash-Routes...');
    const hashRoutes = new Set();
    
    allLinks.forEach(link => {
      const href = link.href || link.getAttribute('href');
      if (href && href.includes('#')) {
        const hash = href.split('#')[1];
        if (hash && hash.startsWith('/')) {
          hashRoutes.add(hash);
        }
      }
    });
    
    routes.hash_routes = Array.from(hashRoutes);
    console.log(`✅ ${routes.hash_routes.length} Hash-Routes gefunden`);

    // 5. Browser-History analysieren
    console.log('📜 Analysiere Browser-History...');
    if (window.history && window.history.length) {
      routes.history_length = window.history.length;
    }

    // 6. Alle möglichen Seiten identifizieren
    console.log('📋 Identifiziere alle Seiten...');
    
    // Durch Navigation gehen und alle möglichen Seiten sammeln
    const possiblePages = new Set();
    
    // Aus Navigation
    if (routes.navigation.items) {
      routes.navigation.items.forEach(item => {
        if (item.href) {
          try {
            const url = new URL(item.href, window.location.origin);
            possiblePages.add({
              name: item.text,
              route: url.pathname + url.hash,
              url: item.href
            });
          } catch (e) {}
        }
      });
    }
    
    // Aus Links
    allLinks.slice(0, 100).forEach(link => {
      const text = link.textContent?.trim();
      const href = link.href || link.getAttribute('href');
      if (href && text && text.length > 0 && text.length < 50) {
        try {
          const url = new URL(href, window.location.origin);
          if (url.hostname === window.location.hostname) {
            possiblePages.add({
              name: text,
              route: url.pathname + url.hash,
              url: href
            });
          }
        } catch (e) {}
      }
    });
    
    routes.pages = Array.from(possiblePages);
    console.log(`✅ ${routes.pages.length} mögliche Seiten identifiziert`);

    // 7. Routen-Konfiguration versuchen zu extrahieren
    console.log('⚙️ Versuche Routen-Konfiguration zu extrahieren...');
    
    // Suche nach Router-Objekten im Window
    const routerObjects = {};
    for (let key in window) {
      if (key.toLowerCase().includes('router') || key.toLowerCase().includes('route')) {
        try {
          routerObjects[key] = typeof window[key];
        } catch (e) {}
      }
    }
    routes.router_objects = routerObjects;

    // 8. Download
    const dataStr = JSON.stringify(routes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thynk-all-routes-pages-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('\n✅ Routen & Seiten-Extraktion abgeschlossen!');
    console.log('📥 JSON-Datei wurde heruntergeladen');
    console.log('\n📊 Zusammenfassung:');
    console.log(`   - Routen: ${routes.routes.length}`);
    console.log(`   - Hash-Routes: ${routes.hash_routes.length}`);
    console.log(`   - Mögliche Seiten: ${routes.pages.length}`);
    console.log(`   - Navigation-Items: ${routes.navigation.items?.length || 0}`);
    
    return routes;

  } catch (error) {
    console.error('❌ Fehler bei Routen-Extraktion:', error);
    return { error: error.message };
  }
}

// Globale Funktion
window.extractAllRoutesAndPages = extractAllRoutesAndPages;

console.log('✅ Routen & Seiten-Extraktions-Script geladen!');
console.log('🚀 Führen Sie aus: extractAllRoutesAndPages()');

