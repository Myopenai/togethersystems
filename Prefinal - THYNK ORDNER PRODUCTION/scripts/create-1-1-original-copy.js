// ERSTELLT 1:1 ORIGINAL-KOPIE von thynkorders.com
// Kombiniert alles: HTML, Assets, Branding, Navigation

async function create1To1OriginalCopy() {
  console.log('🎨 Starte 1:1 Original-Kopie Erstellung...\n');
  
  const originalCopy = {
    created_at: new Date().toISOString(),
    source: 'https://thynkorders.com',
    version: window._APP_VERSION || '2.0.1763264237464',
    structure: {
      html: {},
      assets: {},
      branding: {},
      navigation: {},
      routes: []
    },
    files_to_create: []
  };

  try {
    // 1. HTML-Quellcode extrahieren
    console.log('📄 Extrahiere HTML-Quellcode...');
    const htmlSource = document.documentElement.outerHTML;
    originalCopy.structure.html = {
      head: document.head.outerHTML,
      body: document.body.outerHTML,
      complete: htmlSource
    };
    
    // Erstelle lokale HTML-Kopie
    const localHTML = createLocalHTMLCopy(htmlSource);
    originalCopy.files_to_create.push({
      path: 'thynk-original/index.html',
      content: localHTML,
      description: 'Original HTML-Quellcode (angepasst für lokale Verwendung)'
    });
    console.log('✅ HTML-Kopie erstellt');

    // 2. Alle Asset-URLs sammeln
    console.log('📦 Sammle alle Asset-URLs...');
    const assets = {
      javascript: [],
      css: [],
      images: [],
      fonts: []
    };
    
    // JavaScript
    document.querySelectorAll('script[src], link[rel="modulepreload"]').forEach(element => {
      const url = element.src || element.href;
      if (url) assets.javascript.push(url);
    });
    
    // CSS
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      if (link.href) assets.css.push(link.href);
    });
    
    // Bilder
    document.querySelectorAll('img, link[rel*="icon"], link[rel*="apple"], meta[content*=".png"]').forEach(element => {
      const url = element.src || element.href || element.content;
      if (url && (url.includes('.png') || url.includes('.jpg') || url.includes('.svg'))) {
        assets.images.push(url);
      }
    });
    
    originalCopy.structure.assets = assets;
    console.log(`✅ ${assets.javascript.length} JS, ${assets.css.length} CSS, ${assets.images.length} Bilder`);

    // 3. Branding extrahieren
    console.log('🎨 Extrahiere Branding...');
    originalCopy.structure.branding = {
      title: document.title,
      favicon: document.querySelector('link[rel="shortcut icon"]')?.href,
      logos: [],
      colors: await extractColors(),
      fonts: await extractFonts()
    };
    console.log('✅ Branding extrahiert');

    // 4. Navigation extrahieren
    console.log('🧭 Extrahiere Navigation...');
    const nav = document.querySelector('nav, [role="navigation"]');
    if (nav) {
      originalCopy.structure.navigation = {
        html: nav.outerHTML,
        items: Array.from(nav.querySelectorAll('a')).map(a => ({
          text: a.textContent?.trim(),
          href: a.href || a.getAttribute('href')
        }))
      };
    }
    console.log('✅ Navigation extrahiert');

    // 5. Routen sammeln
    console.log('🗺️ Sammle Routen...');
    const routes = new Set();
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.href || link.getAttribute('href');
      if (href && href.includes(window.location.origin)) {
        try {
          const url = new URL(href);
          routes.add(url.pathname + url.hash);
        } catch (e) {}
      }
    });
    originalCopy.structure.routes = Array.from(routes);
    console.log(`✅ ${originalCopy.structure.routes.length} Routen gefunden`);

    // 6. Erstelle Asset-Manifest
    originalCopy.files_to_create.push({
      path: 'thynk-original/assets-manifest.json',
      content: JSON.stringify(assets, null, 2),
      description: 'Asset-Manifest (alle URLs)'
    });

    // 7. Erstelle Konfigurations-Datei
    originalCopy.files_to_create.push({
      path: 'thynk-original/original-config.json',
      content: JSON.stringify({
        version: originalCopy.version,
        source: originalCopy.source,
        framework: detectFramework(),
        bundler: detectBundler(),
        routes: originalCopy.structure.routes
      }, null, 2),
      description: 'Original-Konfiguration'
    });

    // 8. Download alles
    const dataStr = JSON.stringify(originalCopy, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thynk-1-1-original-copy-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('\n✅ 1:1 Original-Kopie Struktur erstellt!');
    console.log('📥 JSON-Datei wurde heruntergeladen');
    console.log('\n📋 Nächste Schritte:');
    console.log('   1. Alle Assets herunterladen');
    console.log('   2. HTML-Dateien anpassen');
    console.log('   3. In thynk-original/ Ordner kopieren');
    
    return originalCopy;

  } catch (error) {
    console.error('❌ Fehler:', error);
    return { error: error.message };
  }
}

function createLocalHTMLCopy(originalHTML) {
  // Erstellt lokale HTML-Kopie mit angepassten Pfaden
  let localHTML = originalHTML;
  
  // Ersetze externe URLs durch lokale Pfade
  localHTML = localHTML.replace(/https:\/\/thynkorders\.com\//g, './');
  localHTML = localHTML.replace(/\.\/assets\//g, './assets/');
  localHTML = localHTML.replace(/\.\/platform\//g, './platform/');
  
  // Füge Kommentar hinzu
  localHTML = `<!-- 
  THYNK ORDERS - 1:1 Original-Kopie
  Quelle: https://thynkorders.com
  Erstellt: ${new Date().toISOString()}
  WICHTIG: Alle Asset-Pfade müssen angepasst werden!
-->
${localHTML}`;
  
  return localHTML;
}

async function extractColors() {
  const colors = new Set();
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule.cssText) {
          const matches = rule.cssText.match(/#[0-9A-Fa-f]{6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
          if (matches) matches.forEach(c => colors.add(c));
        }
      });
    } catch (e) {}
  });
  return Array.from(colors);
}

async function extractFonts() {
  const fonts = new Set();
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule instanceof CSSFontFaceRule) {
          fonts.add(rule.style.fontFamily);
        }
      });
    } catch (e) {}
  });
  return Array.from(fonts);
}

function detectFramework() {
  if (window.React) return 'React';
  if (window.Vue) return 'Vue';
  if (window.ng) return 'Angular';
  return 'Unknown';
}

function detectBundler() {
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  if (scripts.some(s => s.type === 'module')) return 'Vite';
  return 'Unknown';
}

// Globale Funktion
window.create1To1OriginalCopy = create1To1OriginalCopy;

console.log('✅ 1:1 Original-Kopie Script geladen!');
console.log('🚀 Führen Sie aus: create1To1OriginalCopy()');

