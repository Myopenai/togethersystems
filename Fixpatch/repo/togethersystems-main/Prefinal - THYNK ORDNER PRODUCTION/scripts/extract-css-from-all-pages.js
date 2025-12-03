// Extrahiert CSS von ALLEN Seiten des THYNK-Flows
// Navigiert durch alle Routen/Seiten und sammelt CSS von jeder Seite

async function extractCSSFromAllPages() {
  console.log('🌐 Starte CSS-Extraktion von ALLEN Seiten...\n');
  
  const allPagesCSS = {
    extracted_at: new Date().toISOString(),
    source: 'https://thynkorders.com',
    pages: [],
    all_stylesheets: new Set(),
    all_css_rules: [],
    combined_css: ''
  };

  try {
    // 1. Aktuelle Seite analysieren
    console.log('📄 Analysiere aktuelle Seite...');
    const currentPage = await analyzePageCSS(window.location.href);
    allPagesCSS.pages.push(currentPage);
    
    // 2. Finde alle möglichen Routen/Seiten
    console.log('🗺️ Finde alle Routen...');
    const routes = findAllRoutes();
    console.log(`✅ ${routes.length} Routen gefunden`);
    
    // 3. Navigiere durch alle Routen und sammle CSS
    console.log('🔍 Navigiere durch Routen und sammle CSS...');
    for (const route of routes.slice(0, 10)) { // Limitiere auf 10 Seiten
      try {
        console.log(`📄 Analysiere: ${route}`);
        // Verwende fetch um Seite zu laden (ohne Navigation)
        const response = await fetch(route);
        if (response.ok) {
          const htmlText = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlText, 'text/html');
          
          // Finde CSS-Links in dieser Seite
          const cssLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
          cssLinks.forEach(link => {
            if (link.href) {
              allPagesCSS.all_stylesheets.add(link.href);
            }
          });
          
          // Finde inline Styles
          const inlineStyles = Array.from(doc.querySelectorAll('[style]'));
          allPagesCSS.pages.push({
            url: route,
            css_links: cssLinks.map(l => l.href),
            inline_styles_count: inlineStyles.length
          });
        }
      } catch (error) {
        console.warn(`⚠️  Konnte Route nicht analysieren: ${route} - ${error.message}`);
      }
    }
    
    // 4. Lade ALLE gefundenen Stylesheets
    console.log('📥 Lade alle gefundenen Stylesheets...');
    for (const stylesheetUrl of Array.from(allPagesCSS.all_stylesheets)) {
      try {
        const response = await fetch(stylesheetUrl);
        if (response.ok) {
          const cssText = await response.text();
          allPagesCSS.all_css_rules.push({
            url: stylesheetUrl,
            css: cssText
          });
          
          // Download
          const blob = new Blob([cssText], { type: 'text/css' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = stylesheetUrl.split('/').pop().split('?')[0] || 'style.css';
          link.click();
          URL.revokeObjectURL(url);
          
          console.log(`✅ CSS heruntergeladen: ${link.download}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.warn(`⚠️  Konnte CSS nicht laden: ${stylesheetUrl}`);
      }
    }
    
    // 5. Kombiniere alle CSS
    allPagesCSS.combined_css = allPagesCSS.all_css_rules
      .map(rule => `/* === ${rule.url} === */\n${rule.css}\n\n`)
      .join('\n');
    
    // 6. Download kombiniertes CSS
    const combinedBlob = new Blob([allPagesCSS.combined_css], { type: 'text/css' });
    const combinedUrl = URL.createObjectURL(combinedBlob);
    const combinedLink = document.createElement('a');
    combinedLink.href = combinedUrl;
    combinedLink.download = `thynk-all-pages-combined-css-${Date.now()}.css`;
    combinedLink.click();
    URL.revokeObjectURL(combinedUrl);
    
    // 7. Download JSON-Analyse
    const dataStr = JSON.stringify(allPagesCSS, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const dataUrl = URL.createObjectURL(dataBlob);
    const dataLink = document.createElement('a');
    dataLink.href = dataUrl;
    dataLink.download = `thynk-all-pages-css-analysis-${Date.now()}.json`;
    dataLink.click();
    URL.revokeObjectURL(dataUrl);
    
    console.log('\n✅ CSS-Extraktion von allen Seiten abgeschlossen!');
    console.log(`📊 ${allPagesCSS.pages.length} Seiten analysiert`);
    console.log(`📦 ${allPagesCSS.all_stylesheets.size} Stylesheets gefunden`);
    
    return allPagesCSS;

  } catch (error) {
    console.error('❌ Fehler:', error);
    return { error: error.message };
  }
}

async function analyzePageCSS(url) {
  const stylesheets = Array.from(document.styleSheets);
  const inlineStyles = Array.from(document.querySelectorAll('[style]'));
  const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  return {
    url: url,
    stylesheets: stylesheets.map(s => s.href || 'inline').filter(Boolean),
    css_links: cssLinks.map(l => l.href),
    inline_styles_count: inlineStyles.length
  };
}

function findAllRoutes() {
  const routes = new Set();
  
  // Aus Links
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.href || link.getAttribute('href');
    if (href && href.includes(window.location.origin)) {
      try {
        const url = new URL(href);
        routes.add(url.href);
      } catch (e) {}
    }
  });
  
  // Hash-Routes (SPA)
  const hashRoutes = [
    '/#/userCenter',
    '/#/orders',
    '/#/products',
    '/#/settings',
    '/#/dashboard'
  ];
  
  hashRoutes.forEach(route => {
    routes.add(window.location.origin + route);
  });
  
  return Array.from(routes);
}

window.extractCSSFromAllPages = extractCSSFromAllPages;

console.log('✅ Multi-Page CSS-Extraktions-Script geladen!');
console.log('🚀 Führen Sie aus: extractCSSFromAllPages()');

