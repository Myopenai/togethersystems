// THYNK Branding 1:1 Extraktion von thynkorders.com
// Wird im Browser-Konsole nach Login ausgeführt
// Extrahiert ALLES Branding (CSS, Colors, Fonts, Images, etc.)

async function extractThynkBranding() {
  console.log('🎨 Starte THYNK Branding 1:1 Extraktion...\n');
  
  const branding = {
    extracted_at: new Date().toISOString(),
    source: 'https://thynkorders.com',
    url: window.location.href,
    css: {},
    colors: {},
    typography: {},
    images: {},
    layout: {},
    components: {}
  };

  try {
    // 1. Alle CSS-Dateien extrahieren
    console.log('📄 Extrahiere CSS-Dateien...');
    const cssFiles = [];
    Array.from(document.styleSheets).forEach((sheet, index) => {
      try {
        if (sheet.href) {
          cssFiles.push({
            url: sheet.href,
            index: index,
            rules: Array.from(sheet.cssRules || []).length
          });
          
          // Extrahiere auch die CSS-Regeln
          const rules = [];
          Array.from(sheet.cssRules || []).forEach(rule => {
            if (rule.selectorText) {
              rules.push({
                selector: rule.selectorText,
                style: rule.style ? Object.fromEntries(
                  Array.from(rule.style).map(prop => [prop, rule.style.getPropertyValue(prop)])
                ) : null
              });
            }
          });
          branding.css[sheet.href] = rules;
        } else {
          // Inline-Styles
          Array.from(sheet.cssRules || []).forEach(rule => {
            if (rule.selectorText) {
              if (!branding.css['inline']) {
                branding.css['inline'] = [];
              }
              branding.css['inline'].push({
                selector: rule.selectorText,
                style: rule.style ? Object.fromEntries(
                  Array.from(rule.style).map(prop => [prop, rule.style.getPropertyValue(prop)])
                ) : null,
                cssText: rule.cssText
              });
            }
          });
        }
      } catch (e) {
        console.warn(`Fehler bei CSS-Extraktion ${index}:`, e.message);
      }
    });
    branding.css.files = cssFiles;
    console.log(`✅ ${cssFiles.length} CSS-Dateien gefunden`);

    // 2. Farben extrahieren (aus CSS und Computed Styles)
    console.log('🎨 Extrahiere Farben...');
    const colors = new Set();
    const colorPattern = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g;
    
    // Aus CSS-Regeln
    Object.values(branding.css).forEach(rules => {
      if (Array.isArray(rules)) {
        rules.forEach(rule => {
          if (rule.cssText) {
            const matches = rule.cssText.match(colorPattern);
            if (matches) matches.forEach(c => colors.add(c));
          }
          if (rule.style) {
            Object.values(rule.style).forEach(value => {
              const matches = String(value).match(colorPattern);
              if (matches) matches.forEach(c => colors.add(c));
            });
          }
        });
      }
    });
    
    // Aus Computed Styles wichtiger Elemente
    const importantElements = [
      document.body,
      document.querySelector('header'),
      document.querySelector('nav'),
      document.querySelector('.logo'),
      document.querySelector('button'),
      document.querySelector('a')
    ].filter(Boolean);
    
    importantElements.forEach(el => {
      const computed = window.getComputedStyle(el);
      ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
        const value = computed.getPropertyValue(prop);
        const matches = value.match(colorPattern);
        if (matches) matches.forEach(c => colors.add(c));
      });
    });
    
    branding.colors = {
      all: Array.from(colors),
      primary: extractPrimaryColor(Array.from(colors)),
      palette: extractColorPalette(Array.from(colors))
    };
    console.log(`✅ ${colors.size} Farben gefunden`);

    // 3. Typography extrahieren
    console.log('📝 Extrahiere Typography...');
    const bodyStyle = window.getComputedStyle(document.body);
    branding.typography = {
      font_family: bodyStyle.fontFamily,
      font_size: bodyStyle.fontSize,
      font_weight: bodyStyle.fontWeight,
      line_height: bodyStyle.lineHeight,
      letter_spacing: bodyStyle.letterSpacing,
      text_transform: bodyStyle.textTransform
    };
    
    // Extrahiere alle verwendeten Fonts
    const fonts = new Set();
    Array.from(document.styleSheets).forEach(sheet => {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule.style && rule.style.fontFamily) {
          fonts.add(rule.style.fontFamily);
        }
      });
    });
    branding.typography.fonts_used = Array.from(fonts);
    console.log('✅ Typography extrahiert');

    // 4. Bilder extrahieren (Logos, Icons, etc.)
    console.log('🖼️ Extrahiere Bilder...');
    const images = {
      logos: [],
      icons: [],
      backgrounds: [],
      other: []
    };
    
    Array.from(document.images).forEach(img => {
      const imgData = {
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height,
        classes: img.className,
        id: img.id
      };
      
      if (img.src.includes('logo') || img.alt?.toLowerCase().includes('logo')) {
        images.logos.push(imgData);
      } else if (img.src.includes('icon') || img.width < 100) {
        images.icons.push(imgData);
      } else if (img.src.includes('background') || img.src.includes('bg')) {
        images.backgrounds.push(imgData);
      } else {
        images.other.push(imgData);
      }
    });
    
    // Favicon
    const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (favicon) {
      images.favicon = favicon.href;
    }
    
    branding.images = images;
    console.log(`✅ ${document.images.length} Bilder gefunden`);

    // 5. Layout & Spacing extrahieren
    console.log('📐 Extrahiere Layout...');
    branding.layout = {
      container_max_width: extractMaxWidth(),
      spacing: extractSpacing(),
      border_radius: extractBorderRadius(),
      shadows: extractShadows()
    };
    console.log('✅ Layout extrahiert');

    // 6. Component-Styles extrahieren
    console.log('🧩 Extrahiere Component-Styles...');
    branding.components = {
      buttons: extractButtonStyles(),
      forms: extractFormStyles(),
      tables: extractTableStyles(),
      cards: extractCardStyles(),
      modals: extractModalStyles()
    };
    console.log('✅ Component-Styles extrahiert');

    // 7. Download alle Daten
    const dataStr = JSON.stringify(branding, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thynk-branding-extraction-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('\n✅ THYNK Branding 1:1 Extraktion abgeschlossen!');
    console.log('📥 JSON-Datei wurde heruntergeladen');
    console.log('\n📊 Zusammenfassung:');
    console.log(`   - CSS-Dateien: ${cssFiles.length}`);
    console.log(`   - Farben: ${colors.size}`);
    console.log(`   - Bilder: ${document.images.length}`);
    console.log(`   - Fonts: ${fonts.size}`);
    
    return branding;

  } catch (error) {
    console.error('❌ Fehler bei Branding-Extraktion:', error);
    return { error: error.message };
  }
}

// Hilfsfunktionen

function extractPrimaryColor(colors) {
  // Finde die am häufigsten verwendete Farbe
  const colorCounts = {};
  colors.forEach(c => {
    colorCounts[c] = (colorCounts[c] || 0) + 1;
  });
  return Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function extractColorPalette(colors) {
  return {
    primary: extractPrimaryColor(colors),
    secondary: colors.filter(c => c !== extractPrimaryColor(colors))[0] || null,
    accent: colors.find(c => c.includes('FF') || c.includes('255')) || null,
    background: colors.find(c => c.includes('FFF') || c.includes('255, 255, 255')) || '#FFFFFF',
    text: colors.find(c => c.includes('000') || c.includes('0, 0, 0')) || '#000000'
  };
}

function extractMaxWidth() {
  const container = document.querySelector('.container, .wrapper, [class*="container"], [class*="wrapper"]');
  if (container) {
    const style = window.getComputedStyle(container);
    return style.maxWidth || style.width || null;
  }
  return null;
}

function extractSpacing() {
  // Extrahiere Spacing-Werte aus CSS
  const spacings = new Set();
  Object.values(branding.css).forEach(rules => {
    if (Array.isArray(rules)) {
      rules.forEach(rule => {
        if (rule.style) {
          ['margin', 'padding', 'gap'].forEach(prop => {
            const value = rule.style[prop];
            if (value) spacings.add(value);
          });
        }
      });
    }
  });
  return Array.from(spacings);
}

function extractBorderRadius() {
  const radiuses = new Set();
  Object.values(branding.css).forEach(rules => {
    if (Array.isArray(rules)) {
      rules.forEach(rule => {
        if (rule.style?.borderRadius) {
          radiuses.add(rule.style.borderRadius);
        }
      });
    }
  });
  return Array.from(radiuses);
}

function extractShadows() {
  const shadows = new Set();
  Object.values(branding.css).forEach(rules => {
    if (Array.isArray(rules)) {
      rules.forEach(rule => {
        if (rule.style?.boxShadow) {
          shadows.add(rule.style.boxShadow);
        }
      });
    }
  });
  return Array.from(shadows);
}

function extractButtonStyles() {
  const button = document.querySelector('button, .btn, [class*="button"]');
  if (button) {
    const style = window.getComputedStyle(button);
    return {
      background: style.backgroundColor,
      color: style.color,
      border: style.border,
      borderRadius: style.borderRadius,
      padding: style.padding,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight
    };
  }
  return null;
}

function extractFormStyles() {
  const input = document.querySelector('input, textarea, select');
  if (input) {
    const style = window.getComputedStyle(input);
    return {
      border: style.border,
      borderRadius: style.borderRadius,
      padding: style.padding,
      fontSize: style.fontSize,
      color: style.color,
      backgroundColor: style.backgroundColor
    };
  }
  return null;
}

function extractTableStyles() {
  const table = document.querySelector('table');
  if (table) {
    const style = window.getComputedStyle(table);
    const headerStyle = window.getComputedStyle(table.querySelector('th') || table);
    return {
      border: style.border,
      borderCollapse: style.borderCollapse,
      headerBackground: headerStyle.backgroundColor,
      headerColor: headerStyle.color
    };
  }
  return null;
}

function extractCardStyles() {
  const card = document.querySelector('.card, [class*="card"]');
  if (card) {
    const style = window.getComputedStyle(card);
    return {
      background: style.backgroundColor,
      borderRadius: style.borderRadius,
      padding: style.padding,
      boxShadow: style.boxShadow,
      border: style.border
    };
  }
  return null;
}

function extractModalStyles() {
  const modal = document.querySelector('.modal, [class*="modal"], [class*="dialog"]');
  if (modal) {
    const style = window.getComputedStyle(modal);
    return {
      background: style.backgroundColor,
      borderRadius: style.borderRadius,
      padding: style.padding,
      boxShadow: style.boxShadow,
      maxWidth: style.maxWidth
    };
  }
  return null;
}

// Globale Funktion für einfachen Aufruf
window.extractThynkBranding = extractThynkBranding;

console.log('✅ THYNK Branding Extraktions-Script geladen!');
console.log('🚀 Führen Sie aus: extractThynkBranding()');
console.log('   Oder: window.extractThynkBranding()');

