// KOMPLETTE Asset-Downloader (1:1 Original)
// Lädt ALLE Assets von thynkorders.com herunter

async function downloadAllAssetsComplete() {
  console.log('📥 Starte KOMPLETTEN Asset-Download (1:1 Original)...\n');
  
  const downloadLog = {
    start_time: new Date().toISOString(),
    downloaded: {
      javascript: [],
      css: [],
      images: [],
      fonts: [],
      other: []
    },
    errors: []
  };

  try {
    // 1. JavaScript-Module downloaden
    console.log('📦 Lade JavaScript-Module...');
    const jsFiles = [];
    
    // Module Scripts
    document.querySelectorAll('script[type="module"][src], script[src]').forEach(script => {
      if (script.src) jsFiles.push(script.src);
    });
    
    // Module Preloads
    document.querySelectorAll('link[rel="modulepreload"]').forEach(link => {
      if (link.href) jsFiles.push(link.href);
    });
    
    // Alle JavaScript-URLs sammeln (auch aus HTML-Quellcode)
    const htmlContent = document.documentElement.outerHTML;
    const jsPattern = /(["'])([^"']+\.js(?:\?[^"']*)?)\1/g;
    let match;
    while ((match = jsPattern.exec(htmlContent)) !== null) {
      const url = match[2];
      if (url.startsWith('./') || url.startsWith('/') || url.startsWith('http')) {
        const fullUrl = new URL(url, window.location.origin).href;
        if (!jsFiles.includes(fullUrl)) {
          jsFiles.push(fullUrl);
        }
      }
    }
    
    for (const jsUrl of jsFiles) {
      try {
        const response = await fetch(jsUrl);
        if (response.ok) {
          const jsText = await response.text();
          const blob = new Blob([jsText], { type: 'application/javascript' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = jsUrl.split('/').pop().split('?')[0] || 'script.js';
          link.click();
          URL.revokeObjectURL(url);
          downloadLog.downloaded.javascript.push({ url: jsUrl, success: true });
          console.log(`✅ JavaScript heruntergeladen: ${jsUrl.split('/').pop()}`);
          await new Promise(resolve => setTimeout(resolve, 100)); // Pause zwischen Downloads
        }
      } catch (e) {
        downloadLog.errors.push({ type: 'javascript', url: jsUrl, error: e.message });
      }
    }

    // 2. CSS-Dateien downloaden
    console.log('🎨 Lade CSS-Dateien...');
    const cssFiles = [];
    
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      if (link.href) cssFiles.push(link.href);
    });
    
    // CSS aus HTML-Quellcode
    const cssPattern = /(["'])([^"']+\.css(?:\?[^"']*)?)\1/g;
    while ((match = cssPattern.exec(htmlContent)) !== null) {
      const url = match[2];
      if (url.startsWith('./') || url.startsWith('/') || url.startsWith('http')) {
        const fullUrl = new URL(url, window.location.origin).href;
        if (!cssFiles.includes(fullUrl)) {
          cssFiles.push(fullUrl);
        }
      }
    }
    
    for (const cssUrl of cssFiles) {
      try {
        const response = await fetch(cssUrl);
        if (response.ok) {
          const cssText = await response.text();
          const blob = new Blob([cssText], { type: 'text/css' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = cssUrl.split('/').pop().split('?')[0] || 'style.css';
          link.click();
          URL.revokeObjectURL(url);
          downloadLog.downloaded.css.push({ url: cssUrl, success: true });
          console.log(`✅ CSS heruntergeladen: ${cssUrl.split('/').pop()}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (e) {
        downloadLog.errors.push({ type: 'css', url: cssUrl, error: e.message });
      }
    }

    // 3. ALLE Bilder downloaden
    console.log('🖼️ Lade ALLE Bilder...');
    const imageUrls = new Set();
    
    // Von img-Tags
    document.querySelectorAll('img').forEach(img => {
      if (img.src) imageUrls.add(img.src);
    });
    
    // Von link-Tags (Favicons, Icons)
    document.querySelectorAll('link[rel*="icon"], link[rel*="apple"], link[href*=".png"], link[href*=".jpg"], link[href*=".svg"]').forEach(link => {
      if (link.href) imageUrls.add(link.href);
    });
    
    // Von meta-Tags
    document.querySelectorAll('meta[content*=".png"], meta[content*=".jpg"], meta[content*=".svg"]').forEach(meta => {
      if (meta.content && (meta.content.includes('.png') || meta.content.includes('.jpg') || meta.content.includes('.svg'))) {
        imageUrls.add(meta.content);
      }
    });
    
    // Aus CSS (background-images)
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules || []).forEach(rule => {
          if (rule.style?.backgroundImage) {
            const bgImage = rule.style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1];
            if (bgImage) {
              const fullUrl = new URL(bgImage, window.location.origin).href;
              imageUrls.add(fullUrl);
            }
          }
        });
      } catch (e) {}
    });
    
    // Platform-Logos (aus Meta-Tags)
    document.querySelectorAll('meta[content*="/platform/"], meta[content*="logo"]').forEach(meta => {
      if (meta.content) {
        const fullUrl = new URL(meta.content, window.location.origin).href;
        imageUrls.add(fullUrl);
      }
    });
    
    for (const imgUrl of Array.from(imageUrls)) {
      try {
        const response = await fetch(imgUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          
          // Bestimme Kategorie für Ordner-Struktur
          let filename = imgUrl.split('/').pop().split('?')[0];
          let category = 'other';
          
          if (imgUrl.includes('logo')) {
            category = 'logos';
            if (!filename.includes('logo')) filename = 'logo-' + filename;
          } else if (imgUrl.includes('icon') || imgUrl.includes('favicon')) {
            category = 'icons';
          } else if (imgUrl.includes('background') || imgUrl.includes('bg')) {
            category = 'backgrounds';
          }
          
          link.href = url;
          link.download = filename || 'image.png';
          link.click();
          URL.revokeObjectURL(url);
          
          downloadLog.downloaded.images.push({ url: imgUrl, category, filename, success: true });
          console.log(`✅ Bild heruntergeladen: ${filename}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (e) {
        downloadLog.errors.push({ type: 'image', url: imgUrl, error: e.message });
      }
    }

    // 4. Fonts downloaden
    console.log('🔤 Lade Fonts...');
    const fontUrls = new Set();
    
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules || []).forEach(rule => {
          if (rule instanceof CSSFontFaceRule) {
            const fontUrl = rule.style.src?.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1];
            if (fontUrl) {
              const fullUrl = new URL(fontUrl, window.location.origin).href;
              fontUrls.add(fullUrl);
            }
          }
        });
      } catch (e) {}
    });
    
    for (const fontUrl of Array.from(fontUrls)) {
      try {
        const response = await fetch(fontUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fontUrl.split('/').pop().split('?')[0] || 'font.woff';
          link.click();
          URL.revokeObjectURL(url);
          downloadLog.downloaded.fonts.push({ url: fontUrl, success: true });
          console.log(`✅ Font heruntergeladen: ${fontUrl.split('/').pop()}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (e) {
        downloadLog.errors.push({ type: 'font', url: fontUrl, error: e.message });
      }
    }

    // 5. Download-Log speichern
    downloadLog.end_time = new Date().toISOString();
    downloadLog.duration = new Date(downloadLog.end_time) - new Date(downloadLog.start_time);
    
    const logStr = JSON.stringify(downloadLog, null, 2);
    const logBlob = new Blob([logStr], { type: 'application/json' });
    const logUrl = URL.createObjectURL(logBlob);
    const logLink = document.createElement('a');
    logLink.href = logUrl;
    logLink.download = `thynk-asset-download-log-${Date.now()}.json`;
    logLink.click();
    URL.revokeObjectURL(logUrl);

    console.log('\n✅ KOMPLETTER Asset-Download abgeschlossen!');
    console.log('📥 Download-Log heruntergeladen');
    console.log('\n📊 Zusammenfassung:');
    console.log(`   - JavaScript: ${downloadLog.downloaded.javascript.length}`);
    console.log(`   - CSS: ${downloadLog.downloaded.css.length}`);
    console.log(`   - Bilder: ${downloadLog.downloaded.images.length}`);
    console.log(`   - Fonts: ${downloadLog.downloaded.fonts.length}`);
    console.log(`   - Fehler: ${downloadLog.errors.length}`);
    
    return downloadLog;

  } catch (error) {
    console.error('❌ Fehler beim Asset-Download:', error);
    return { error: error.message };
  }
}

// Globale Funktion
window.downloadAllAssetsComplete = downloadAllAssetsComplete;

console.log('✅ Kompletter Asset-Downloader geladen!');
console.log('🚀 Führen Sie aus: downloadAllAssetsComplete()');

