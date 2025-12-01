// KOMPLETTE HTML-Quellcode Extraktion (1:1 Original-Kopie)
// Extrahiert ALLES von thynkorders.com für 1:1 Original-Kopie

async function extractCompleteHTMLSource() {
  console.log('📄 Starte KOMPLETTE HTML-Quellcode-Extraktion (1:1 Original)...\n');
  
  const extraction = {
    extracted_at: new Date().toISOString(),
    source: 'https://thynkorders.com',
    url: window.location.href,
    html: {
      complete_source: '',
      head: {},
      body: {},
      scripts: [],
      stylesheets: [],
      meta_tags: [],
      links: []
    },
    assets: {
      javascript: [],
      css: [],
      images: [],
      fonts: [],
      other: []
    },
    pages: [],
    routes: [],
    application_structure: {}
  };

  try {
    // 1. VOLLSTÄNDIGER HTML-QUELLCODE
    console.log('📄 Extrahiere vollständigen HTML-Quellcode...');
    extraction.html.complete_source = document.documentElement.outerHTML;
    
    // Speichere kompletten HTML-Quellcode
    const htmlBlob = new Blob([extraction.html.complete_source], { type: 'text/html' });
    const htmlUrl = URL.createObjectURL(htmlBlob);
    const htmlLink = document.createElement('a');
    htmlLink.href = htmlUrl;
    htmlLink.download = `thynk-original-html-${Date.now()}.html`;
    htmlLink.click();
    URL.revokeObjectURL(htmlUrl);
    console.log('✅ Kompletter HTML-Quellcode heruntergeladen');

    // 2. HEAD analysieren
    console.log('📋 Analysiere HEAD...');
    extraction.html.head = {
      title: document.title,
      meta: [],
      links: [],
      scripts: [],
      base: document.querySelector('base')?.href
    };

    // Meta-Tags
    document.querySelectorAll('meta').forEach(meta => {
      extraction.html.head.meta.push({
        name: meta.name || meta.property || meta.httpEquiv,
        content: meta.content,
        charset: meta.charset,
        property: meta.property,
        httpEquiv: meta.httpEquiv,
        full: meta.outerHTML
      });
    });

    // Links (CSS, Favicons, etc.)
    document.querySelectorAll('link').forEach(link => {
      extraction.html.head.links.push({
        rel: link.rel,
        href: link.href,
        type: link.type,
        crossorigin: link.crossOrigin,
        full: link.outerHTML
      });
    });

    // Scripts im Head
    document.querySelectorAll('head script').forEach(script => {
      extraction.html.head.scripts.push({
        type: script.type,
        src: script.src,
        async: script.async,
        defer: script.defer,
        crossorigin: script.crossOrigin,
        full: script.outerHTML,
        content: script.src ? null : script.textContent
      });
    });

    console.log(`✅ HEAD analysiert: ${extraction.html.head.meta.length} Meta-Tags, ${extraction.html.head.links.length} Links`);

    // 3. BODY analysieren
    console.log('📋 Analysiere BODY...');
    extraction.html.body = {
      structure: document.body.outerHTML.substring(0, 5000),
      divs: Array.from(document.body.querySelectorAll('div')).map(div => ({
        id: div.id,
        class: div.className,
        innerHTML: div.innerHTML.substring(0, 500)
      })).slice(0, 50),
      scripts: Array.from(document.body.querySelectorAll('script')).map(script => ({
        type: script.type,
        src: script.src,
        full: script.outerHTML.substring(0, 1000)
      }))
    };

    // 4. ALLE ASSETS extrahieren
    console.log('📦 Extrahiere ALLE Assets...');
    
    // JavaScript-Module
    document.querySelectorAll('script[type="module"], script[src]').forEach(script => {
      if (script.src) {
        extraction.assets.javascript.push({
          src: script.src,
          type: script.type || 'text/javascript',
          async: script.async,
          defer: script.defer,
          crossorigin: script.crossOrigin
        });
      }
    });

    // CSS-Dateien
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      extraction.assets.css.push({
        href: link.href,
        crossorigin: link.crossOrigin,
        media: link.media
      });
    });

    // Module Preloads
    document.querySelectorAll('link[rel="modulepreload"]').forEach(link => {
      extraction.assets.javascript.push({
        src: link.href,
        type: 'module',
        crossorigin: link.crossOrigin,
        preload: true
      });
    });

    // 5. ALLE BILDER
    console.log('🖼️ Extrahiere alle Bilder...');
    document.querySelectorAll('img').forEach(img => {
      extraction.assets.images.push({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height,
        classes: img.className
      });
    });

    // Favicons & Icons
    document.querySelectorAll('link[rel*="icon"], link[rel*="apple"]').forEach(link => {
      extraction.assets.images.push({
        src: link.href,
        rel: link.rel,
        sizes: link.sizes?.value,
        type: link.type
      });
    });

    // 6. ALLE ROUTEN/SEITEN analysieren
    console.log('🗺️ Analysiere Routen & Seiten...');
    
    // SPA-Routen (falls vorhanden)
    const routes = new Set();
    Array.from(document.querySelectorAll('a[href]')).forEach(link => {
      const href = link.href || link.getAttribute('href');
      if (href && href.includes(window.location.origin)) {
        try {
          const url = new URL(href, window.location.origin);
          routes.add(url.pathname + url.hash);
        } catch (e) {}
      }
    });
    extraction.routes = Array.from(routes);

    // 7. APPLICATION-STRUKTUR analysieren
    console.log('🔍 Analysiere Application-Struktur...');
    
    extraction.application_structure = {
      framework: detectFramework(),
      bundler: detectBundler(),
      entry_point: document.querySelector('#app') ? '#app' : null,
      version: window._APP_VERSION || null,
      scripts: extraction.assets.javascript,
      stylesheets: extraction.assets.css,
      has_react: !!window.React,
      has_vue: !!window.Vue,
      has_angular: !!window.ng
    };

    // 8. ALLE ASSET-URLs sammeln
    console.log('🔗 Sammle alle Asset-URLs...');
    
    const allAssetUrls = new Set();
    
    // Aus HTML
    const htmlContent = document.documentElement.outerHTML;
    const urlPattern = /(https?:\/\/[^\s"'<>]+|\.\/[^\s"'<>]+|\/[^\s"'<>]+)/g;
    const matches = htmlContent.match(urlPattern);
    if (matches) {
      matches.forEach(url => {
        if (url.includes('/assets/') || url.includes('.css') || url.includes('.js') || 
            url.includes('.png') || url.includes('.jpg') || url.includes('.svg') ||
            url.includes('/platform/')) {
          allAssetUrls.add(url);
        }
      });
    }
    
    extraction.assets.all_urls = Array.from(allAssetUrls);

    // 9. Komplette Extraktion speichern
    const dataStr = JSON.stringify(extraction, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const dataUrl = URL.createObjectURL(dataBlob);
    const dataLink = document.createElement('a');
    dataLink.href = dataUrl;
    dataLink.download = `thynk-complete-html-extraction-${Date.now()}.json`;
    dataLink.click();
    URL.revokeObjectURL(dataUrl);

    console.log('\n✅ KOMPLETTE HTML-Quellcode-Extraktion abgeschlossen!');
    console.log('📥 Dateien heruntergeladen:');
    console.log('   - thynk-original-html-*.html (kompletter HTML-Quellcode)');
    console.log('   - thynk-complete-html-extraction-*.json (vollständige Analyse)');
    console.log('\n📊 Zusammenfassung:');
    console.log(`   - Meta-Tags: ${extraction.html.head.meta.length}`);
    console.log(`   - Links: ${extraction.html.head.links.length}`);
    console.log(`   - JavaScript: ${extraction.assets.javascript.length}`);
    console.log(`   - CSS: ${extraction.assets.css.length}`);
    console.log(`   - Bilder: ${extraction.assets.images.length}`);
    console.log(`   - Routen: ${extraction.routes.length}`);
    
    return extraction;

  } catch (error) {
    console.error('❌ Fehler bei HTML-Extraktion:', error);
    return { error: error.message, stack: error.stack };
  }
}

// Framework-Erkennung
function detectFramework() {
  if (window.React) return 'React';
  if (window.Vue) return 'Vue';
  if (window.ng) return 'Angular';
  if (document.querySelector('[data-reactroot]')) return 'React';
  if (document.querySelector('[ng-app]')) return 'Angular';
  return 'Unknown';
}

// Bundler-Erkennung
function detectBundler() {
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const hasVite = scripts.some(s => s.src.includes('vite') || s.type === 'module');
  const hasWebpack = scripts.some(s => s.src.includes('webpack'));
  if (hasVite) return 'Vite';
  if (hasWebpack) return 'Webpack';
  return 'Unknown';
}

// Globale Funktion
window.extractCompleteHTMLSource = extractCompleteHTMLSource;

console.log('✅ HTML-Quellcode-Extraktions-Script geladen!');
console.log('🚀 Führen Sie aus: extractCompleteHTMLSource()');
console.log('   Oder: window.extractCompleteHTMLSource()');

