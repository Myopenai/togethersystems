// KOMPLETTE CSS-EXTRAKTION - ALLE CSS für THYNK Flow (1:1 Original)
// Findet ALLE CSS-Dateien, inline Styles, dynamische Styles, und alles für alle Seiten

async function extractAllCSSComplete() {
  console.log('🎨 Starte KOMPLETTE CSS-Extraktion (alle Seiten, alle CSS)...\n');
  
  const cssExtraction = {
    extracted_at: new Date().toISOString(),
    source: 'https://thynkorders.com',
    url: window.location.href,
    css: {
      external_stylesheets: [],
      inline_styles: [],
      computed_styles: {},
      all_css_rules: [],
      css_variables: {},
      media_queries: [],
      animations: [],
      fonts: []
    },
    all_pages_css: [],
    complete_css_text: ''
  };

  try {
    // 1. EXTERNE STYLESHEETS extrahieren
    console.log('📦 Extrahiere externe Stylesheets...');
    const stylesheets = Array.from(document.styleSheets);
    
    for (let i = 0; i < stylesheets.length; i++) {
      const sheet = stylesheets[i];
      try {
        const href = sheet.href || sheet.ownerNode?.href;
        if (href) {
          cssExtraction.css.external_stylesheets.push({
            href: href,
            index: i,
            type: sheet.type || 'text/css',
            disabled: sheet.disabled || false,
            ownerNode: sheet.ownerNode?.tagName || null
          });
          
          console.log(`✅ Externes Stylesheet gefunden: ${href.split('/').pop()}`);
        }
      } catch (e) {}
    }
    
    // 2. LADE ALLE EXTERNEN CSS-DATEIEN
    console.log('📥 Lade alle externen CSS-Dateien...');
    for (const sheetInfo of cssExtraction.css.external_stylesheets) {
      try {
        const response = await fetch(sheetInfo.href);
        if (response.ok) {
          const cssText = await response.text();
          cssExtraction.css.all_css_rules.push({
            source: sheetInfo.href,
            css: cssText,
            rules_count: cssText.split('{').length - 1
          });
          
          // Download CSS-Datei
          const blob = new Blob([cssText], { type: 'text/css' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = sheetInfo.href.split('/').pop().split('?')[0] || 'style.css';
          link.click();
          URL.revokeObjectURL(url);
          
          console.log(`✅ CSS heruntergeladen: ${link.download}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.warn(`⚠️  Konnte CSS nicht laden: ${sheetInfo.href} - ${error.message}`);
      }
    }
    
    // 3. INLINE STYLES extrahieren
    console.log('📋 Extrahiere inline Styles...');
    document.querySelectorAll('[style]').forEach((element, index) => {
      const inlineStyle = element.getAttribute('style');
      if (inlineStyle && inlineStyle.trim()) {
        cssExtraction.css.inline_styles.push({
          selector: element.tagName.toLowerCase() + (element.id ? `#${element.id}` : '') + (element.className ? `.${element.className.split(' ').join('.')}` : ''),
          style: inlineStyle,
          element: element.tagName
        });
      }
    });
    console.log(`✅ ${cssExtraction.css.inline_styles.length} inline Styles gefunden`);
    
    // 4. ALLE CSS-REGELN extrahieren (aus allen Stylesheets)
    console.log('📋 Extrahiere alle CSS-Regeln...');
    const allRules = [];
    
    for (let i = 0; i < stylesheets.length; i++) {
      const sheet = stylesheets[i];
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach(rule => {
          if (rule.cssText) {
            allRules.push({
              type: rule.constructor.name,
              cssText: rule.cssText,
              selectorText: rule.selectorText || null,
              style: rule.style ? Object.fromEntries(Array.from(rule.style).map(prop => [prop, rule.style.getPropertyValue(prop)])) : null
            });
          }
        });
      } catch (e) {
        // CORS-Fehler sind normal bei externen Stylesheets
      }
    }
    
    cssExtraction.css.all_css_rules = allRules;
    console.log(`✅ ${allRules.length} CSS-Regeln extrahiert`);
    
    // 5. CSS-VARIABLEN extrahieren
    console.log('📋 Extrahiere CSS-Variablen...');
    const cssVars = {};
    allRules.forEach(rule => {
      if (rule.cssText && rule.cssText.includes('--')) {
        const varMatches = rule.cssText.match(/--([a-zA-Z0-9-]+):\s*([^;]+);/g);
        if (varMatches) {
          varMatches.forEach(match => {
            const [varName, varValue] = match.split(':').map(s => s.trim());
            if (varName) {
              cssVars[varName] = varValue.replace(';', '').trim();
            }
          });
        }
      }
    });
    cssExtraction.css.css_variables = cssVars;
    console.log(`✅ ${Object.keys(cssVars).length} CSS-Variablen gefunden`);
    
    // 6. MEDIA QUERIES extrahieren
    console.log('📋 Extrahiere Media Queries...');
    const mediaQueries = [];
    allRules.forEach(rule => {
      if (rule.type === 'CSSMediaRule' || rule.cssText.includes('@media')) {
        mediaQueries.push({
          media: rule.media?.mediaText || rule.cssText.match(/@media\s+([^{]+)/)?.[1] || '',
          css: rule.cssText
        });
      }
    });
    cssExtraction.css.media_queries = mediaQueries;
    console.log(`✅ ${mediaQueries.length} Media Queries gefunden`);
    
    // 7. ANIMATIONS extrahieren
    console.log('📋 Extrahiere Animations...');
    const animations = [];
    allRules.forEach(rule => {
      if (rule.cssText && (rule.cssText.includes('@keyframes') || rule.cssText.includes('animation'))) {
        animations.push({
          type: rule.cssText.includes('@keyframes') ? 'keyframes' : 'animation',
          css: rule.cssText
        });
      }
    });
    cssExtraction.css.animations = animations;
    console.log(`✅ ${animations.length} Animations gefunden`);
    
    // 8. FONTS extrahieren
    console.log('📋 Extrahiere Fonts...');
    const fonts = new Set();
    allRules.forEach(rule => {
      if (rule.type === 'CSSFontFaceRule' || rule.cssText.includes('@font-face')) {
        const fontFamily = rule.style?.fontFamily || rule.cssText.match(/font-family:\s*([^;]+)/)?.[1];
        if (fontFamily) {
          fonts.add(fontFamily.replace(/['"]/g, '').trim());
        }
        
        // Font-URLs
        const fontUrls = rule.cssText.match(/url\(['"]?([^'")]+)['"]?\)/g);
        if (fontUrls) {
          fontUrls.forEach(url => {
            const cleanUrl = url.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1];
            if (cleanUrl) {
              cssExtraction.css.fonts.push({
                url: cleanUrl,
                fontFamily: fontFamily
              });
            }
          });
        }
      }
    });
    console.log(`✅ ${fonts.size} Font-Familien gefunden`);
    
    // 9. KOMPLETTE CSS-TEXT sammeln (alle Stylesheets kombiniert)
    console.log('📋 Kombiniere alle CSS...');
    let completeCSSText = '';
    
    // Externe Stylesheets
    for (const cssRule of cssExtraction.css.all_css_rules) {
      if (cssRule.css) {
        completeCSSText += `/* === ${cssRule.source || 'Unknown'} === */\n`;
        completeCSSText += cssRule.css + '\n\n';
      }
    }
    
    // Inline Styles als CSS
    cssExtraction.css.inline_styles.forEach(inline => {
      completeCSSText += `/* Inline: ${inline.selector} */\n`;
      completeCSSText += `${inline.selector} { ${inline.style} }\n\n`;
    });
    
    cssExtraction.complete_css_text = completeCSSText;
    
    // 10. ALLE CSS-URLS aus HTML-Quellcode finden
    console.log('🔍 Suche alle CSS-URLs im HTML...');
    const htmlContent = document.documentElement.outerHTML;
    const cssUrlPattern = /(?:href|src)=["']([^"']+\.css[^"']*)["']/gi;
    const cssUrls = new Set();
    
    let match;
    while ((match = cssUrlPattern.exec(htmlContent)) !== null) {
      const url = match[1];
      try {
        const fullUrl = new URL(url, window.location.origin).href;
        cssUrls.add(fullUrl);
      } catch (e) {
        cssUrls.add(url);
      }
    }
    
    cssExtraction.css.all_css_urls = Array.from(cssUrls);
    console.log(`✅ ${cssExtraction.css.all_css_urls.length} CSS-URLs im HTML gefunden`);
    
    // 11. KOMPLETTE EXTRACTION speichern
    const dataStr = JSON.stringify(cssExtraction, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const dataUrl = URL.createObjectURL(dataBlob);
    const dataLink = document.createElement('a');
    dataLink.href = dataUrl;
    dataLink.download = `thynk-complete-css-extraction-${Date.now()}.json`;
    dataLink.click();
    URL.revokeObjectURL(dataUrl);
    
    // 12. KOMPLETTE CSS-DATEI erstellen (alle kombiniert)
    const completeCSSBlob = new Blob([completeCSSText], { type: 'text/css' });
    const completeCSSUrl = URL.createObjectURL(completeCSSBlob);
    const completeCSSLink = document.createElement('a');
    completeCSSLink.href = completeCSSUrl;
    completeCSSLink.download = `thynk-complete-all-css-${Date.now()}.css`;
    completeCSSLink.click();
    URL.revokeObjectURL(completeCSSUrl);
    
    console.log('\n✅ KOMPLETTE CSS-EXTRAKTION abgeschlossen!');
    console.log('📥 Dateien heruntergeladen:');
    console.log('   - thynk-complete-css-extraction-*.json (Analyse)');
    console.log('   - thynk-complete-all-css-*.css (Kombinierte CSS)');
    console.log('   - Alle einzelnen CSS-Dateien');
    console.log('\n📊 Zusammenfassung:');
    console.log(`   - Externe Stylesheets: ${cssExtraction.css.external_stylesheets.length}`);
    console.log(`   - Inline Styles: ${cssExtraction.css.inline_styles.length}`);
    console.log(`   - CSS-Regeln: ${cssExtraction.css.all_css_rules.length}`);
    console.log(`   - CSS-Variablen: ${Object.keys(cssExtraction.css.css_variables).length}`);
    console.log(`   - Media Queries: ${cssExtraction.css.media_queries.length}`);
    console.log(`   - Animations: ${cssExtraction.css.animations.length}`);
    console.log(`   - Fonts: ${cssExtraction.css.fonts.length}`);
    console.log(`   - CSS-URLs gefunden: ${cssExtraction.css.all_css_urls.length}`);
    
    return cssExtraction;

  } catch (error) {
    console.error('❌ Fehler bei CSS-Extraktion:', error);
    return { error: error.message, stack: error.stack };
  }
}

// Globale Funktion
window.extractAllCSSComplete = extractAllCSSComplete;

console.log('✅ Komplette CSS-Extraktions-Script geladen!');
console.log('🚀 Führen Sie aus: extractAllCSSComplete()');

