// KOMPLETTE THYNK Online-Application Branding-Extraktion
// Extrahiert ALLES 1:1 von thynkorders.com

async function extractCompleteThynkBranding() {
  console.log('🎨 Starte KOMPLETTE THYNK Branding-Extraktion (1:1)...\n');
  
  const completeBranding = {
    extracted_at: new Date().toISOString(),
    source: 'https://thynkorders.com',
    url: window.location.href,
    version: '1.0.0',
    branding: {
      css: {
        files: [],
        rules: {},
        inline: [],
        computed: {}
      },
      colors: {
        palette: [],
        primary: null,
        usage: {}
      },
      typography: {
        fonts: [],
        base: {},
        headings: {}
      },
      images: {
        logos: [],
        icons: [],
        backgrounds: [],
        favicon: null,
        all: []
      },
      layout: {
        grid: {},
        spacing: {},
        containers: {},
        breakpoints: {}
      },
      components: {
        buttons: {},
        forms: {},
        tables: {},
        cards: {},
        modals: {},
        navigation: {},
        all: {}
      },
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
      },
      javascript: {
        global_objects: {},
        configs: {},
        custom_code: []
      },
      themes: {},
      animations: {},
      media_queries: []
    }
  };

  try {
    // 1. ALLE CSS-Dateien komplett extrahieren
    console.log('📄 Extrahiere ALLE CSS-Dateien...');
    const allCSS = await extractAllCSS();
    completeBranding.branding.css = allCSS;
    console.log(`✅ ${allCSS.files.length} CSS-Dateien extrahiert`);

    // 2. KOMPLETTE Farb-Palette
    console.log('🎨 Extrahiere KOMPLETTE Farb-Palette...');
    const allColors = await extractCompleteColorPalette();
    completeBranding.branding.colors = allColors;
    console.log(`✅ ${allColors.palette.length} Farben extrahiert`);

    // 3. KOMPLETE Typography
    console.log('📝 Extrahiere KOMPLETE Typography...');
    const typography = await extractCompleteTypography();
    completeBranding.branding.typography = typography;
    console.log('✅ Typography komplett extrahiert');

    // 4. ALLE Bilder
    console.log('🖼️ Extrahiere ALLE Bilder...');
    const allImages = await extractAllImages();
    completeBranding.branding.images = allImages;
    console.log(`✅ ${allImages.all.length} Bilder extrahiert`);

    // 5. KOMPLETTES Layout-System
    console.log('📐 Extrahiere KOMPLETTES Layout...');
    const layout = await extractCompleteLayout();
    completeBranding.branding.layout = layout;
    console.log('✅ Layout komplett extrahiert');

    // 6. ALLE Komponenten
    console.log('🧩 Extrahiere ALLE Komponenten...');
    const components = await extractAllComponents();
    completeBranding.branding.components = components;
    console.log('✅ Alle Komponenten extrahiert');

    // 6.5. KOMPLETE NAVIGATION & MENÜFÜHRUNG
    console.log('🧭 Extrahiere KOMPLETE Navigation & Menüführung...');
    const navigation = await extractCompleteNavigation();
    completeBranding.branding.navigation = navigation;
    console.log('✅ Navigation & Menüführung komplett extrahiert');

    // 7. JavaScript-Konfigurationen
    console.log('⚙️ Extrahiere JavaScript-Konfigurationen...');
    const jsConfigs = await extractJavaScriptConfigs();
    completeBranding.branding.javascript = jsConfigs;
    console.log('✅ JavaScript-Konfigurationen extrahiert');

    // 8. Themes & Varianten
    console.log('🎭 Extrahiere Themes...');
    const themes = await extractThemes();
    completeBranding.branding.themes = themes;
    console.log('✅ Themes extrahiert');

    // 9. Animationen
    console.log('✨ Extrahiere Animationen...');
    const animations = await extractAnimations();
    completeBranding.branding.animations = animations;
    console.log('✅ Animationen extrahiert');

    // 10. Media Queries
    console.log('📱 Extrahiere Media Queries...');
    const mediaQueries = await extractMediaQueries();
    completeBranding.branding.media_queries = mediaQueries;
    console.log('✅ Media Queries extrahiert');

    // 11. KOMPLETE NAVIGATION & MENÜFÜHRUNG
    console.log('🧭 Extrahiere KOMPLETE Navigation & Menüführung...');
    const navigation = await extractCompleteNavigation();
    completeBranding.branding.navigation = navigation;
    console.log('✅ Navigation & Menüführung komplett extrahiert');

    // 11. Download komplettes Branding
    const dataStr = JSON.stringify(completeBranding, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thynk-complete-branding-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('\n🎉 KOMPLETTE THYNK Branding-Extraktion abgeschlossen!');
    console.log('📥 JSON-Datei wurde heruntergeladen');
    console.log('\n📊 Vollständige Zusammenfassung:');
    console.log(`   - CSS-Dateien: ${allCSS.files.length}`);
    console.log(`   - CSS-Regeln: ${Object.keys(allCSS.rules).length}`);
    console.log(`   - Farben: ${allColors.palette.length}`);
    console.log(`   - Fonts: ${typography.fonts.length}`);
    console.log(`   - Bilder: ${allImages.all.length}`);
    console.log(`   - Komponenten: ${Object.keys(components.all).length}`);
    console.log(`   - Animationen: ${Object.keys(animations).length}`);
    console.log(`   - Navigation Items: ${navigation.main_menu?.items?.length || 0}`);
    console.log(`   - Dropdowns: ${navigation.dropdowns?.length || 0}`);
    console.log(`   - Tabs: ${navigation.tabs?.length || 0}`);
    
    return completeBranding;

  } catch (error) {
    console.error('❌ Fehler bei kompletter Branding-Extraktion:', error);
    return { error: error.message, stack: error.stack };
  }
}

// ========== HILFSFUNKTIONEN ==========

async function extractAllCSS() {
  const cssData = {
    files: [],
    rules: {},
    inline: [],
    computed: {}
  };

  // Alle Stylesheets
  Array.from(document.styleSheets).forEach((sheet, index) => {
    try {
      if (sheet.href) {
        const fileInfo = {
          url: sheet.href,
          index: index,
          disabled: sheet.disabled,
          title: sheet.title
        };
        cssData.files.push(fileInfo);

        // Alle CSS-Regeln aus diesem Stylesheet
        const rules = [];
        Array.from(sheet.cssRules || []).forEach((rule, ruleIndex) => {
          try {
            rules.push({
              type: rule.constructor.name,
              selector: rule.selectorText || null,
              cssText: rule.cssText,
              style: rule.style ? extractStyleObject(rule.style) : null,
              media: rule.media ? rule.media.mediaText : null
            });
          } catch (e) {
            // Cross-origin rules können nicht gelesen werden
          }
        });
        cssData.rules[sheet.href] = rules;
      } else {
        // Inline-Styles
        Array.from(sheet.cssRules || []).forEach(rule => {
          cssData.inline.push({
            type: rule.constructor.name,
            selector: rule.selectorText || null,
            cssText: rule.cssText
          });
        });
      }
    } catch (e) {
      console.warn(`Fehler bei CSS-Extraktion ${index}:`, e.message);
    }
  });

  // Computed Styles wichtiger Elemente
  const importantSelectors = [
    'body', 'header', 'nav', '.logo', 'button', 'a', 
    '.container', '.card', 'table', 'input', 'textarea'
  ];
  
  importantSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      const style = window.getComputedStyle(elements[0]);
      cssData.computed[selector] = extractStyleObject(style);
    }
  });

  return cssData;
}

async function extractCompleteColorPalette() {
  const colors = new Set();
  const colorUsage = {};
  const colorPattern = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/gi;

  // Aus allen CSS-Regeln
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule.cssText) {
          const matches = rule.cssText.match(colorPattern);
          if (matches) {
            matches.forEach(color => {
              colors.add(color);
              if (!colorUsage[color]) colorUsage[color] = [];
              colorUsage[color].push(rule.selectorText || 'unknown');
            });
          }
        }
      });
    } catch (e) {}
  });

  // Aus Computed Styles
  Array.from(document.querySelectorAll('*')).slice(0, 100).forEach(el => {
    const style = window.getComputedStyle(el);
    ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 
     'borderRightColor', 'borderBottomColor', 'borderLeftColor',
     'outlineColor', 'textDecorationColor'].forEach(prop => {
      const value = style.getPropertyValue(prop);
      const matches = value.match(colorPattern);
      if (matches) {
        matches.forEach(color => {
          colors.add(color);
          if (!colorUsage[color]) colorUsage[color] = [];
          colorUsage[color].push(`${el.tagName}.${el.className}`);
        });
      }
    });
  });

  return {
    palette: Array.from(colors),
    primary: findPrimaryColor(Array.from(colors)),
    secondary: findSecondaryColor(Array.from(colors)),
    accent: findAccentColor(Array.from(colors)),
    background: findBackgroundColor(Array.from(colors)),
    text: findTextColor(Array.from(colors)),
    usage: colorUsage
  };
}

async function extractCompleteTypography() {
  const fonts = new Set();
  const fontFaces = [];

  // @font-face Regeln
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule instanceof CSSFontFaceRule) {
          const fontFamily = rule.style.fontFamily;
          const fontUrl = rule.style.src?.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1];
          if (fontFamily) {
            fonts.add(fontFamily);
            fontFaces.push({
              family: fontFamily,
              src: fontUrl || null,
              style: rule.style.fontStyle,
              weight: rule.style.fontWeight,
              cssText: rule.cssText
            });
          }
        }
      });
    } catch (e) {}
  });

  // Base Typography
  const bodyStyle = window.getComputedStyle(document.body);
  const base = {
    fontFamily: bodyStyle.fontFamily,
    fontSize: bodyStyle.fontSize,
    fontWeight: bodyStyle.fontWeight,
    lineHeight: bodyStyle.lineHeight,
    letterSpacing: bodyStyle.letterSpacing,
    textTransform: bodyStyle.textTransform,
    fontStyle: bodyStyle.fontStyle
  };

  // Heading Styles
  const headings = {};
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
    const heading = document.querySelector(tag);
    if (heading) {
      const style = window.getComputedStyle(heading);
      headings[tag] = {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        color: style.color,
        margin: style.margin
      };
    }
  });

  return {
    fonts: Array.from(fonts),
    fontFaces: fontFaces,
    base: base,
    headings: headings
  };
}

async function extractAllImages() {
  const images = {
    logos: [],
    icons: [],
    backgrounds: [],
    favicon: null,
    all: []
  };

  // Favicon
  const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  if (favicon) {
    images.favicon = {
      url: favicon.href,
      type: favicon.type || 'image/x-icon',
      sizes: favicon.sizes?.value || null
    };
  }

  // Alle Bilder
  Array.from(document.images).forEach(img => {
    const imgData = {
      src: img.src,
      alt: img.alt || '',
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      classes: img.className,
      id: img.id,
      title: img.title || '',
      category: 'other'
    };

    if (img.src.includes('logo') || img.alt?.toLowerCase().includes('logo')) {
      imgData.category = 'logo';
      images.logos.push(imgData);
    } else if (img.src.includes('icon') || img.width < 100) {
      imgData.category = 'icon';
      images.icons.push(imgData);
    } else if (img.src.includes('background') || img.src.includes('bg')) {
      imgData.category = 'background';
      images.backgrounds.push(imgData);
    }

    images.all.push(imgData);
  });

  // Background-Images aus CSS
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule.style?.backgroundImage) {
          const bgImage = rule.style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1];
          if (bgImage) {
            images.backgrounds.push({
              src: bgImage,
              category: 'background-css',
              selector: rule.selectorText
            });
          }
        }
      });
    } catch (e) {}
  });

  return images;
}

async function extractCompleteLayout() {
  const layout = {
    grid: {},
    spacing: {},
    containers: {},
    breakpoints: {}
  };

  // Container
  const containers = document.querySelectorAll('[class*="container"], [class*="wrapper"], .container, .wrapper');
  containers.forEach((container, index) => {
    if (index < 5) { // Erste 5
      const style = window.getComputedStyle(container);
      layout.containers[container.className || `container-${index}`] = {
        maxWidth: style.maxWidth,
        width: style.width,
        padding: style.padding,
        margin: style.margin,
        display: style.display
      };
    }
  });

  // Spacing-System
  const spacings = new Set();
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule.style) {
          ['margin', 'padding', 'gap', 'gridGap'].forEach(prop => {
            const value = rule.style[prop];
            if (value) spacings.add(value);
          });
        }
      });
    } catch (e) {}
  });
  layout.spacing = Array.from(spacings);

  // Media Queries für Breakpoints
  const breakpoints = new Set();
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule.media) {
          breakpoints.add(rule.media.mediaText);
        }
      });
    } catch (e) {}
  });
  layout.breakpoints = Array.from(breakpoints);

  return layout;
}

async function extractAllComponents() {
  const components = {
    buttons: [],
    forms: [],
    tables: [],
    cards: [],
    modals: [],
    navigation: [],
    all: {}
  };

  // Buttons
  document.querySelectorAll('button, .btn, [class*="button"], input[type="button"], input[type="submit"]').forEach((btn, index) => {
    if (index < 10) {
      const style = window.getComputedStyle(btn);
      components.buttons.push({
        class: btn.className,
        styles: extractStyleObject(style),
        html: btn.outerHTML.substring(0, 200)
      });
    }
  });

  // Forms
  document.querySelectorAll('form, input, textarea, select').forEach((formEl, index) => {
    if (index < 10) {
      const style = window.getComputedStyle(formEl);
      components.forms.push({
        tag: formEl.tagName.toLowerCase(),
        class: formEl.className,
        styles: extractStyleObject(style)
      });
    }
  });

  // Tables
  document.querySelectorAll('table').forEach((table, index) => {
    if (index < 5) {
      const style = window.getComputedStyle(table);
      components.tables.push({
        class: table.className,
        styles: extractStyleObject(style),
        html: table.outerHTML.substring(0, 500)
      });
    }
  });

  // Cards
  document.querySelectorAll('.card, [class*="card"]').forEach((card, index) => {
    if (index < 10) {
      const style = window.getComputedStyle(card);
      components.cards.push({
        class: card.className,
        styles: extractStyleObject(style)
      });
    }
  });

  // Alle Komponenten zusammenfassen
  components.all = {
    buttons: components.buttons.length,
    forms: components.forms.length,
    tables: components.tables.length,
    cards: components.cards.length
  };

  return components;
}

async function extractJavaScriptConfigs() {
  const jsConfigs = {
    global_objects: {},
    configs: {},
    custom_code: []
  };

  // Window-Objekte
  for (let key in window) {
    if (key.toLowerCase().includes('thynk') || 
        key.toLowerCase().includes('order') ||
        key.toLowerCase().includes('config') ||
        key.toLowerCase().includes('branding')) {
      try {
        jsConfigs.global_objects[key] = typeof window[key];
      } catch (e) {}
    }
  }

  // Config-Objekte
  for (let key in window) {
    if (key.toLowerCase().includes('config') || key.toLowerCase().includes('setting')) {
      try {
        const value = window[key];
        if (typeof value === 'object') {
          jsConfigs.configs[key] = JSON.parse(JSON.stringify(value));
        }
      } catch (e) {}
    }
  }

  return jsConfigs;
}

async function extractThemes() {
  const themes = {};
  
  // Prüfe auf Theme-Klassen
  document.body.className.split(' ').forEach(cls => {
    if (cls.includes('theme') || cls.includes('dark') || cls.includes('light')) {
      themes[cls] = extractBodyTheme();
    }
  });

  return themes;
}

async function extractAnimations() {
  const animations = {};
  
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule instanceof CSSKeyframesRule) {
          animations[rule.name] = {
            name: rule.name,
            keyframes: []
          };
          Array.from(rule.cssRules).forEach(keyframe => {
            animations[rule.name].keyframes.push({
              keyText: keyframe.keyText,
              style: extractStyleObject(keyframe.style)
            });
          });
        }
        if (rule.style?.animation) {
          animations[rule.selectorText] = {
            animation: rule.style.animation,
            animationName: rule.style.animationName,
            animationDuration: rule.style.animationDuration,
            animationTimingFunction: rule.style.animationTimingFunction
          };
        }
      });
    } catch (e) {}
  });

  return animations;
}

async function extractMediaQueries() {
  const mediaQueries = [];
  
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule.media) {
          Array.from(rule.cssRules || []).forEach(mediaRule => {
            mediaQueries.push({
              media: rule.media.mediaText,
              rule: mediaRule.cssText
            });
          });
        }
      });
    } catch (e) {}
  });

  return mediaQueries;
}

// ========== UTILITY FUNKTIONEN ==========

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

function findPrimaryColor(colors) {
  const counts = {};
  colors.forEach(c => counts[c] = (counts[c] || 0) + 1);
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function findSecondaryColor(colors) {
  const primary = findPrimaryColor(colors);
  return colors.find(c => c !== primary) || null;
}

function findAccentColor(colors) {
  return colors.find(c => /#[fF]{2}/.test(c) || /255/.test(c)) || null;
}

function findBackgroundColor(colors) {
  return colors.find(c => /fff/i.test(c) || /255.*255.*255/.test(c)) || '#FFFFFF';
}

function findTextColor(colors) {
  return colors.find(c => /000/i.test(c) || /0.*0.*0/.test(c)) || '#000000';
}

function extractBodyTheme() {
  const bodyStyle = window.getComputedStyle(document.body);
  return {
    background: bodyStyle.backgroundColor,
    color: bodyStyle.color,
    fontFamily: bodyStyle.fontFamily
  };
}

async function extractCompleteNavigation() {
  const navigation = {
    main_menu: {},
    sidebar: {},
    breadcrumbs: {},
    dropdowns: [],
    mobile_menu: {},
    footer_nav: {},
    context_menu: [],
    tabs: [],
    pagination: {},
    complete_structure: {}
  };

  // Haupt-Menü
  const mainMenuEl = document.querySelector('nav[role="navigation"], nav.main, .main-menu, .primary-nav, .navbar, header nav');
  if (mainMenuEl) {
    navigation.main_menu = {
      html: mainMenuEl.outerHTML,
      items: [],
      styles: extractStyleObject(window.getComputedStyle(mainMenuEl))
    };
    mainMenuEl.querySelectorAll('a, button, [role="menuitem"], li > a').forEach((item, index) => {
      navigation.main_menu.items.push({
        index: index,
        text: item.textContent?.trim(),
        href: item.href || item.getAttribute('href'),
        classes: item.className,
        children: Array.from(item.parentElement?.querySelectorAll('ul a') || []).map(child => ({
          text: child.textContent?.trim(),
          href: child.href || child.getAttribute('href')
        }))
      });
    });
  }

  // Sidebar
  const sidebarEl = document.querySelector('aside, .sidebar, .side-nav, [class*="sidebar"]');
  if (sidebarEl) {
    navigation.sidebar = {
      html: sidebarEl.outerHTML,
      items: Array.from(sidebarEl.querySelectorAll('a, button, [role="menuitem"]')).map(item => ({
        text: item.textContent?.trim(),
        href: item.href || item.getAttribute('href'),
        classes: item.className
      }))
    };
  }

  // Breadcrumbs
  const breadcrumbEl = document.querySelector('nav[aria-label="breadcrumb"], .breadcrumb, .breadcrumbs');
  if (breadcrumbEl) {
    navigation.breadcrumbs = {
      html: breadcrumbEl.outerHTML,
      items: Array.from(breadcrumbEl.querySelectorAll('li, a')).map(item => ({
        text: item.textContent?.trim(),
        href: item.href || item.querySelector('a')?.href
      }))
    };
  }

  // Dropdowns
  document.querySelectorAll('.dropdown, [class*="dropdown"], [data-toggle="dropdown"]').forEach(dropdown => {
    const menu = dropdown.querySelector('.dropdown-menu, ul, [role="menu"]');
    if (menu) {
      navigation.dropdowns.push({
        trigger: dropdown.textContent?.trim(),
        items: Array.from(menu.querySelectorAll('a, button, [role="menuitem"]')).map(item => ({
          text: item.textContent?.trim(),
          href: item.href || item.getAttribute('href')
        }))
      });
    }
  });

  // Mobile Menu
  const mobileMenuEl = document.querySelector('.mobile-menu, .mobile-nav, [class*="mobile-menu"]');
  if (mobileMenuEl) {
    navigation.mobile_menu = {
      html: mobileMenuEl.outerHTML,
      items: Array.from(mobileMenuEl.querySelectorAll('a, [role="menuitem"]')).map(item => ({
        text: item.textContent?.trim(),
        href: item.href || item.getAttribute('href')
      }))
    };
  }

  // Footer Navigation
  const footer = document.querySelector('footer');
  if (footer) {
    navigation.footer_nav = {
      html: footer.outerHTML.substring(0, 2000),
      items: Array.from(footer.querySelectorAll('a')).map(item => ({
        text: item.textContent?.trim(),
        href: item.href || item.getAttribute('href')
      }))
    };
  }

  // Tabs
  document.querySelectorAll('[role="tablist"], .tabs').forEach(tabList => {
    navigation.tabs.push({
      tabs: Array.from(tabList.querySelectorAll('[role="tab"], .tab')).map(tab => ({
        text: tab.textContent?.trim(),
        id: tab.id || tab.getAttribute('aria-controls'),
        active: tab.classList.contains('active')
      }))
    });
  });

  // Komplette Struktur
  const allLinks = Array.from(document.querySelectorAll('a[href]'));
  navigation.complete_structure = {
    routes: [...new Set(allLinks.map(link => {
      try {
        return new URL(link.href, window.location.origin).pathname;
      } catch {
        return null;
      }
    }).filter(Boolean))],
    sitemap: allLinks.slice(0, 100).map(link => ({
      text: link.textContent?.trim(),
      href: link.href
    }))
  };

  return navigation;
}

// Globale Funktion
window.extractCompleteThynkBranding = extractCompleteThynkBranding;

console.log('✅ KOMPLETE THYNK Branding-Extraktions-Script geladen!');
console.log('🚀 Führen Sie aus: extractCompleteThynkBranding()');
console.log('   Oder: window.extractCompleteThynkBranding()');
console.log('\n📋 Extrahiert:');
console.log('   - ALLE CSS-Dateien & Regeln');
console.log('   - KOMPLETE Farb-Palette');
console.log('   - KOMPLETE Typography');
console.log('   - ALLE Bilder');
console.log('   - KOMPLETTES Layout');
console.log('   - ALLE Komponenten');
console.log('   - KOMPLETE Navigation & Menüführung');
console.log('   - JavaScript-Konfigurationen');
console.log('   - Themes & Animationen');
console.log('   - Media Queries');

