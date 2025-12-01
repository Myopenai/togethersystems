// THYNK Branding Assets Downloader
// Lädt alle Bilder, CSS-Dateien und Fonts von thynkorders.com herunter

async function downloadThynkBrandingAssets() {
  console.log('📥 Starte Download aller THYNK Branding-Assets...\n');
  
  const assets = {
    css: [],
    images: [],
    fonts: [],
    errors: []
  };

  try {
    // 1. CSS-Dateien herunterladen
    console.log('📄 Lade CSS-Dateien herunter...');
    const cssFiles = [];
    Array.from(document.styleSheets).forEach(sheet => {
      if (sheet.href && sheet.href.includes('thynkorders.com')) {
        cssFiles.push(sheet.href);
      }
    });
    
    for (const cssUrl of cssFiles) {
      try {
        const response = await fetch(cssUrl);
        const cssText = await response.text();
        const blob = new Blob([cssText], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = cssUrl.split('/').pop() || 'style.css';
        link.click();
        URL.revokeObjectURL(url);
        assets.css.push({ url: cssUrl, downloaded: true });
        console.log(`✅ CSS heruntergeladen: ${cssUrl.split('/').pop()}`);
      } catch (e) {
        assets.errors.push({ type: 'css', url: cssUrl, error: e.message });
      }
    }

    // 2. Bilder herunterladen (Logos, Icons, Favicon)
    console.log('🖼️ Lade Bilder herunter...');
    const imagesToDownload = [];
    
    // Favicon
    const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (favicon && favicon.href) {
      imagesToDownload.push({ url: favicon.href, type: 'favicon', name: 'favicon.ico' });
    }
    
    // Logos
    Array.from(document.images).forEach(img => {
      if (img.src && (img.src.includes('logo') || img.alt?.toLowerCase().includes('logo'))) {
        imagesToDownload.push({
          url: img.src,
          type: 'logo',
          name: img.src.split('/').pop() || 'logo.png',
          alt: img.alt
        });
      }
    });
    
    // Icons
    Array.from(document.images).forEach(img => {
      if (img.src && (img.src.includes('icon') || img.width < 100)) {
        imagesToDownload.push({
          url: img.src,
          type: 'icon',
          name: img.src.split('/').pop() || 'icon.png'
        });
      }
    });
    
    for (const imgData of imagesToDownload) {
      try {
        const response = await fetch(imgData.url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = imgData.name;
        link.click();
        URL.revokeObjectURL(url);
        assets.images.push({ ...imgData, downloaded: true });
        console.log(`✅ Bild heruntergeladen: ${imgData.name}`);
        
        // Kleine Pause zwischen Downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        assets.errors.push({ type: 'image', url: imgData.url, error: e.message });
      }
    }

    // 3. Fonts herunterladen (aus @font-face Regeln)
    console.log('🔤 Extrahiere Font-Informationen...');
    const fonts = new Set();
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules || []).forEach(rule => {
          if (rule instanceof CSSFontFaceRule) {
            const fontFamily = rule.style.fontFamily;
            const fontUrl = rule.style.src?.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1];
            if (fontFamily && fontUrl) {
              fonts.add({ family: fontFamily, url: fontUrl });
            }
          }
        });
      } catch (e) {
        // Cross-origin Stylesheets können nicht gelesen werden
      }
    });
    
    assets.fonts = Array.from(fonts);
    console.log(`✅ ${fonts.size} Fonts gefunden`);

    // 4. Zusammenfassung erstellen
    const summary = {
      downloaded_at: new Date().toISOString(),
      source: 'https://thynkorders.com',
      assets: {
        css_files: assets.css.length,
        images: assets.images.length,
        fonts: assets.fonts.length,
        errors: assets.errors.length
      },
      details: assets
    };
    
    // Zusammenfassung downloaden
    const summaryBlob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const summaryUrl = URL.createObjectURL(summaryBlob);
    const summaryLink = document.createElement('a');
    summaryLink.href = summaryUrl;
    summaryLink.download = `thynk-branding-assets-summary-${Date.now()}.json`;
    summaryLink.click();
    URL.revokeObjectURL(summaryUrl);

    console.log('\n✅ Download abgeschlossen!');
    console.log(`📊 Zusammenfassung:`);
    console.log(`   - CSS-Dateien: ${assets.css.length}`);
    console.log(`   - Bilder: ${assets.images.length}`);
    console.log(`   - Fonts: ${assets.fonts.length}`);
    console.log(`   - Fehler: ${assets.errors.length}`);
    console.log('\n📥 Zusammenfassungs-JSON wurde heruntergeladen');
    
    return summary;

  } catch (error) {
    console.error('❌ Fehler beim Download:', error);
    return { error: error.message };
  }
}

// Globale Funktion
window.downloadThynkBrandingAssets = downloadThynkBrandingAssets;

console.log('✅ THYNK Branding Assets Downloader geladen!');
console.log('🚀 Führen Sie aus: downloadThynkBrandingAssets()');

