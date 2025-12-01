// ULTIMATIVE CSS-EXTRAKTION - ALLES für THYNK (1:1 Original)
// Kombiniert alle CSS-Extraktions-Methoden

async function extractAllThynkCSSComplete() {
  console.log('🎨🎨🎨 ULTIMATIVE THYNK CSS-EXTRAKTION - ALLES 🎨🎨🎨\n');
  
  const completeCSS = {
    extracted_at: new Date().toISOString(),
    source: 'https://thynkorders.com',
    version: window._APP_VERSION || '2.0.1763264237464',
    css: {
      // Externe Stylesheets
      external: [],
      // Inline Styles
      inline: [],
      // Computed Styles (von Elementen)
      computed: {},
      // Alle CSS-Regeln
      all_rules: [],
      // CSS-Variablen
      variables: {},
      // Media Queries
      media_queries: [],
      // Animations
      animations: [],
      // Fonts
      fonts: [],
      // Alle CSS-URLs
      all_urls: []
    },
    pages: [],
    complete_combined_css: ''
  };

  try {
    // ============================================
    // PHASE 1: AKTUELLE SEITE - KOMPLETT
    // ============================================
    console.log('📄 PHASE 1: Analysiere aktuelle Seite komplett...\n');
    
    // 1.1 Externe Stylesheets
    console.log('   📦 Externe Stylesheets...');
    Array.from(document.styleSheets).forEach((sheet, index) => {
      try {
        const href = sheet.href || sheet.ownerNode?.href;
        if (href) {
          completeCSS.css.external.push({
            href: href,
            index: index,
            disabled: sheet.disabled || false
          });
        }
      } catch (e) {}
    });
    console.log(`   ✅ ${completeCSS.css.external.length} externe Stylesheets gefunden`);
    
    // 1.2 Lade alle externen CSS-Dateien
    console.log('   📥 Lade externe CSS-Dateien...');
    for (const sheetInfo of completeCSS.css.external) {
      if (!sheetInfo.href) continue;
      
      try {
        const response = await fetch(sheetInfo.href);
        if (response.ok) {
          const cssText = await response.text();
          
          // Parse CSS
          const cssRules = parseCSSRules(cssText);
          completeCSS.css.all_rules.push(...cssRules.map(rule => ({
            ...rule,
            source: sheetInfo.href
          })));
          
          // Download
          const blob = new Blob([cssText], { type: 'text/css' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = sheetInfo.href.split('/').pop().split('?')[0] || `style-${index}.css`;
          link.click();
          URL.revokeObjectURL(url);
          
          console.log(`   ✅ ${link.download} heruntergeladen`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.warn(`   ⚠️  ${sheetInfo.href}: ${error.message}`);
      }
    }
    
    // 1.3 Inline Styles
    console.log('   📋 Inline Styles...');
    document.querySelectorAll('[style]').forEach(element => {
      const style = element.getAttribute('style');
      if (style) {
        completeCSS.css.inline.push({
          selector: generateSelector(element),
          style: style,
          tag: element.tagName.toLowerCase()
        });
      }
    });
    console.log(`   ✅ ${completeCSS.css.inline.length} inline Styles`);
    
    // 1.4 Computed Styles (von wichtigen Elementen)
    console.log('   📊 Computed Styles...');
    const importantElements = document.querySelectorAll('body, #app, .container, header, nav, main');
    importantElements.forEach(element => {
      const computed = window.getComputedStyle(element);
      const selector = generateSelector(element);
      completeCSS.css.computed[selector] = {};
      
      Array.from(computed).slice(0, 20).forEach(prop => {
        completeCSS.css.computed[selector][prop] = computed.getPropertyValue(prop);
      });
    });
    console.log(`   ✅ Computed Styles von ${importantElements.length} Elementen`);
    
    // ============================================
    // PHASE 2: CSS-REGELN & FEATURES
    // ============================================
    console.log('\n📋 PHASE 2: CSS-Regeln & Features...\n');
    
    // 2.1 Alle CSS-Regeln aus Stylesheets
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules || []).forEach(rule => {
          if (rule.cssText) {
            completeCSS.css.all_rules.push({
              type: rule.constructor.name,
              cssText: rule.cssText,
              selectorText: rule.selectorText || null
            });
          }
        });
      } catch (e) {}
    });
    console.log(`   ✅ ${completeCSS.css.all_rules.length} CSS-Regeln`);
    
    // 2.2 CSS-Variablen
    extractCSSVariables(completeCSS.css.all_rules, completeCSS.css.variables);
    console.log(`   ✅ ${Object.keys(completeCSS.css.variables).length} CSS-Variablen`);
    
    // 2.3 Media Queries
    completeCSS.css.all_rules.forEach(rule => {
      if (rule.type === 'CSSMediaRule' || rule.cssText.includes('@media')) {
        completeCSS.css.media_queries.push({
          media: rule.media?.mediaText || extractMediaQuery(rule.cssText),
          css: rule.cssText
        });
      }
    });
    console.log(`   ✅ ${completeCSS.css.media_queries.length} Media Queries`);
    
    // 2.4 Animations
    completeCSS.css.all_rules.forEach(rule => {
      if (rule.cssText.includes('@keyframes') || rule.cssText.includes('animation:')) {
        completeCSS.css.animations.push(rule.cssText);
      }
    });
    console.log(`   ✅ ${completeCSS.css.animations.length} Animations`);
    
    // 2.5 Fonts
    completeCSS.css.all_rules.forEach(rule => {
      if (rule.cssText.includes('@font-face')) {
        const fontFamily = rule.cssText.match(/font-family:\s*([^;]+)/)?.[1];
        const fontUrl = rule.cssText.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1];
        if (fontFamily || fontUrl) {
          completeCSS.css.fonts.push({
            family: fontFamily?.replace(/['"]/g, '').trim(),
            url: fontUrl
          });
        }
      }
    });
    console.log(`   ✅ ${completeCSS.css.fonts.length} Fonts`);
    
    // ============================================
    // PHASE 3: ALLE CSS-URLS FINDEN
    // ============================================
    console.log('\n🔍 PHASE 3: Finde ALLE CSS-URLs...\n');
    
    // 3.1 Aus HTML
    const htmlContent = document.documentElement.outerHTML;
    const urlPatterns = [
      /href=["']([^"']+\.css[^"']*)["']/gi,
      /src=["']([^"']+\.css[^"']*)["']/gi,
      /url\(["']([^"']+\.css[^"']*)["']\)/gi,
      /['"]([^'"]*assets[^'"]*\.css[^'"]*)['"]/gi
    ];
    
    urlPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(htmlContent)) !== null) {
        const url = match[1];
        try {
          const fullUrl = new URL(url, window.location.origin).href;
          completeCSS.css.all_urls.push(fullUrl);
        } catch (e) {
          completeCSS.css.all_urls.push(url);
        }
      }
    });
    
    // 3.2 Aus JavaScript (dynamisch geladene CSS)
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    scripts.forEach(script => {
      if (script.src.includes('assets')) {
        // Versuche CSS-Version zu finden
        const jsPath = script.src;
        const cssPath = jsPath.replace('.js', '.css');
        completeCSS.css.all_urls.push(cssPath);
      }
    });
    
    // Deduplizieren
    completeCSS.css.all_urls = Array.from(new Set(completeCSS.css.all_urls));
    console.log(`   ✅ ${completeCSS.css.all_urls.length} CSS-URLs gefunden`);
    
    // ============================================
    // PHASE 4: KOMPLETTE CSS-DATEI ERSTELLEN
    // ============================================
    console.log('\n📝 PHASE 4: Erstelle komplette CSS-Datei...\n');
    
    let combinedCSS = `/* ========================================== */\n`;
    combinedCSS += `/* THYNK ORDERS - KOMPLETTE CSS (1:1 Original) */\n`;
    combinedCSS += `/* Quelle: ${completeCSS.source} */\n`;
    combinedCSS += `/* Version: ${completeCSS.version} */\n`;
    combinedCSS += `/* Extrahiert: ${completeCSS.extracted_at} */\n`;
    combinedCSS += `/* ========================================== */\n\n`;
    
    // Externe Stylesheets
    combinedCSS += `/* === EXTERNE STYLESHEETS === */\n\n`;
    for (const rule of completeCSS.css.all_rules.filter(r => r.source)) {
      combinedCSS += `/* Source: ${rule.source} */\n`;
      combinedCSS += `${rule.cssText}\n\n`;
    }
    
    // CSS-Variablen
    combinedCSS += `/* === CSS-VARIABLEN === */\n\n:root {\n`;
    Object.entries(completeCSS.css.variables).forEach(([varName, varValue]) => {
      combinedCSS += `  ${varName}: ${varValue};\n`;
    });
    combinedCSS += `}\n\n`;
    
    // Media Queries
    combinedCSS += `/* === MEDIA QUERIES === */\n\n`;
    completeCSS.css.media_queries.forEach(mq => {
      combinedCSS += `${mq.css}\n\n`;
    });
    
    // Animations
    combinedCSS += `/* === ANIMATIONS === */\n\n`;
    completeCSS.css.animations.forEach(anim => {
      combinedCSS += `${anim}\n\n`;
    });
    
    // Inline Styles als CSS
    combinedCSS += `/* === INLINE STYLES (konvertiert) === */\n\n`;
    completeCSS.css.inline.forEach(inline => {
      combinedCSS += `${inline.selector} { ${inline.style} }\n\n`;
    });
    
    completeCSS.complete_combined_css = combinedCSS;
    
    // ============================================
    // PHASE 5: DOWNLOADS
    // ============================================
    console.log('📥 PHASE 5: Downloads...\n');
    
    // 5.1 Kombinierte CSS-Datei
    const combinedBlob = new Blob([combinedCSS], { type: 'text/css' });
    const combinedUrl = URL.createObjectURL(combinedBlob);
    const combinedLink = document.createElement('a');
    combinedLink.href = combinedUrl;
    combinedLink.download = `thynk-complete-all-css-${Date.now()}.css`;
    combinedLink.click();
    URL.revokeObjectURL(combinedUrl);
    console.log(`   ✅ Kombinierte CSS: ${combinedLink.download}`);
    
    // 5.2 JSON-Analyse
    const jsonStr = JSON.stringify(completeCSS, null, 2);
    const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `thynk-complete-css-analysis-${Date.now()}.json`;
    jsonLink.click();
    URL.revokeObjectURL(jsonUrl);
    console.log(`   ✅ JSON-Analyse: ${jsonLink.download}`);
    
    // 5.3 CSS-URLs Liste
    const urlsStr = completeCSS.css.all_urls.join('\n');
    const urlsBlob = new Blob([urlsStr], { type: 'text/plain' });
    const urlsUrl = URL.createObjectURL(urlsBlob);
    const urlsLink = document.createElement('a');
    urlsLink.href = urlsUrl;
    urlsLink.download = `thynk-all-css-urls-${Date.now()}.txt`;
    urlsLink.click();
    URL.revokeObjectURL(urlsUrl);
    console.log(`   ✅ CSS-URLs Liste: ${urlsLink.download}`);
    
    console.log('\n✅✅✅ ULTIMATIVE CSS-EXTRAKTION ABGESCHLOSSEN! ✅✅✅');
    console.log('\n📊 ZUSAMMENFASSUNG:');
    console.log(`   - Externe Stylesheets: ${completeCSS.css.external.length}`);
    console.log(`   - Inline Styles: ${completeCSS.css.inline.length}`);
    console.log(`   - CSS-Regeln: ${completeCSS.css.all_rules.length}`);
    console.log(`   - CSS-Variablen: ${Object.keys(completeCSS.css.variables).length}`);
    console.log(`   - Media Queries: ${completeCSS.css.media_queries.length}`);
    console.log(`   - Animations: ${completeCSS.css.animations.length}`);
    console.log(`   - Fonts: ${completeCSS.css.fonts.length}`);
    console.log(`   - CSS-URLs: ${completeCSS.css.all_urls.length}`);
    
    return completeCSS;

  } catch (error) {
    console.error('❌ Fehler:', error);
    return { error: error.message, stack: error.stack };
  }
}

// Helper-Funktionen
function parseCSSRules(cssText) {
  const rules = [];
  const rulePattern = /([^{]+)\{([^}]+)\}/g;
  let match;
  
  while ((match = rulePattern.exec(cssText)) !== null) {
    rules.push({
      selector: match[1].trim(),
      declarations: match[2].trim(),
      cssText: match[0]
    });
  }
  
  return rules;
}

function extractCSSVariables(rules, variables) {
  rules.forEach(rule => {
    if (rule.cssText && rule.cssText.includes('--')) {
      const matches = rule.cssText.matchAll(/--([a-zA-Z0-9-]+):\s*([^;]+);/g);
      for (const match of matches) {
        variables[match[1]] = match[2].trim();
      }
    }
  });
}

function extractMediaQuery(cssText) {
  const match = cssText.match(/@media\s+([^{]+)/);
  return match ? match[1].trim() : '';
}

function generateSelector(element) {
  let selector = element.tagName.toLowerCase();
  if (element.id) selector += `#${element.id}`;
  if (element.className) {
    const classes = Array.from(element.classList).join('.');
    selector += `.${classes}`;
  }
  return selector;
}

window.extractAllThynkCSSComplete = extractAllThynkCSSComplete;

console.log('✅ ULTIMATIVE CSS-Extraktions-Script geladen!');
console.log('🚀 Führen Sie aus: extractAllThynkCSSComplete()');

