// Lädt ALLE CSS-Dateien herunter (vendor, index, und alle anderen)
// Findet alle CSS-Referenzen im gesamten THYNK-Flow

async function downloadAllCSSFiles() {
  console.log('📥 Lade ALLE CSS-Dateien herunter...\n');
  
  const downloadLog = {
    start_time: new Date().toISOString(),
    downloaded: [],
    failed: [],
    all_css_urls: []
  };

  try {
    // 1. CSS-URLs aus HTML finden
    console.log('🔍 Finde alle CSS-URLs...');
    const htmlContent = document.documentElement.outerHTML;
    
    // Pattern für CSS-URLs
    const patterns = [
      /href=["']([^"']+\.css[^"']*)["']/gi,
      /src=["']([^"']+\.css[^"']*)["']/gi,
      /url\(["']([^"']+\.css[^"']*)["']\)/gi
    ];
    
    const cssUrls = new Set();
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(htmlContent)) !== null) {
        const url = match[1];
        try {
          const fullUrl = new URL(url, window.location.origin).href;
          cssUrls.add(fullUrl);
        } catch (e) {
          cssUrls.add(url);
        }
      }
    });
    
    // 2. CSS-URLs aus Stylesheets
    Array.from(document.styleSheets).forEach(sheet => {
      if (sheet.href) {
        cssUrls.add(sheet.href);
      }
    });
    
    // 3. CSS-URLs aus link-Tags
    document.querySelectorAll('link[rel="stylesheet"], link[href*=".css"]').forEach(link => {
      if (link.href) {
        cssUrls.add(link.href);
      }
    });
    
    // 4. Bekannte THYNK CSS-Dateien
    const knownThynkCSS = [
      './assets/vendor-DCfzXDSe.css',
      './assets/index-BdjXOkTT.css',
      './assets/vendor-*.css',
      './assets/index-*.css'
    ];
    
    knownThynkCSS.forEach(pattern => {
      const fullUrl = new URL(pattern.replace('*', ''), window.location.origin).href;
      cssUrls.add(fullUrl);
    });
    
    downloadLog.all_css_urls = Array.from(cssUrls);
    console.log(`✅ ${cssUrls.size} CSS-URLs gefunden`);
    
    // 5. Lade alle CSS-Dateien herunter
    console.log('📥 Lade CSS-Dateien herunter...');
    for (const cssUrl of Array.from(cssUrls)) {
      try {
        // Versuche verschiedene URL-Varianten
        const urlsToTry = [
          cssUrl,
          cssUrl.replace(window.location.origin, ''),
          new URL(cssUrl, window.location.origin).href
        ];
        
        let downloaded = false;
        
        for (const urlToTry of urlsToTry) {
          try {
            const response = await fetch(urlToTry);
            if (response.ok) {
              const cssText = await response.text();
              
              // Bestimme Dateiname
              const urlPath = new URL(urlToTry).pathname;
              let filename = urlPath.split('/').pop().split('?')[0];
              if (!filename.endsWith('.css')) {
                filename = 'style.css';
              }
              
              // Download
              const blob = new Blob([cssText], { type: 'text/css' });
              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = filename;
              link.click();
              URL.revokeObjectURL(blobUrl);
              
              downloadLog.downloaded.push({
                url: urlToTry,
                filename: filename,
                size: cssText.length,
                success: true
              });
              
              console.log(`✅ ${filename} heruntergeladen (${(cssText.length/1024).toFixed(2)} KB)`);
              downloaded = true;
              
              await new Promise(resolve => setTimeout(resolve, 100));
              break;
            }
          } catch (fetchError) {
            // Versuche nächste URL
            continue;
          }
        }
        
        if (!downloaded) {
          downloadLog.failed.push({
            url: cssUrl,
            error: 'Could not fetch'
          });
          console.warn(`⚠️  Konnte nicht herunterladen: ${cssUrl}`);
        }
        
      } catch (error) {
        downloadLog.failed.push({
          url: cssUrl,
          error: error.message
        });
      }
    }
    
    // 6. Speichere Download-Log
    downloadLog.end_time = new Date().toISOString();
    const logStr = JSON.stringify(downloadLog, null, 2);
    const logBlob = new Blob([logStr], { type: 'application/json' });
    const logUrl = URL.createObjectURL(logBlob);
    const logLink = document.createElement('a');
    logLink.href = logUrl;
    logLink.download = `thynk-css-download-log-${Date.now()}.json`;
    logLink.click();
    URL.revokeObjectURL(logUrl);
    
    console.log('\n✅ Download abgeschlossen!');
    console.log(`📊 Heruntergeladen: ${downloadLog.downloaded.length}`);
    console.log(`❌ Fehlgeschlagen: ${downloadLog.failed.length}`);
    
    return downloadLog;

  } catch (error) {
    console.error('❌ Fehler beim Download:', error);
    return { error: error.message };
  }
}

window.downloadAllCSSFiles = downloadAllCSSFiles;

console.log('✅ CSS-Download-Script geladen!');
console.log('🚀 Führen Sie aus: downloadAllCSSFiles()');

