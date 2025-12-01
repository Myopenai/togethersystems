// Organisiert extrahierte Branding-Dateien in die richtigen Ordner
// Nach Extraktion: Organisiert Bilder, CSS, etc. in thynk-original/

async function organizeExtractedBranding(extractionData) {
  console.log('📁 Organisiere extrahierte Branding-Dateien...\n');
  
  // Diese Funktion wird nach der Extraktion aufgerufen
  // Organisiert alle Dateien in die richtigen Ordner
  
  const structure = {
    branding: {
      images: {
        logos: [],
        icons: [],
        backgrounds: []
      },
      css: [],
      fonts: [],
      config: null
    }
  };

  if (!extractionData || !extractionData.branding) {
    console.error('❌ Keine Extraktions-Daten gefunden!');
    return;
  }

  const branding = extractionData.branding;

  // 1. Organisiere Bilder
  if (branding.images) {
    console.log('🖼️ Organisiere Bilder...');
    
    // Logos
    if (branding.images.logos) {
      branding.images.logos.forEach(logo => {
        structure.branding.images.logos.push({
          src: logo.src,
          alt: logo.alt,
          name: extractFileName(logo.src),
          path: `branding/images/logos/${extractFileName(logo.src)}`
        });
      });
    }
    
    // Icons
    if (branding.images.icons) {
      branding.images.icons.forEach(icon => {
        structure.branding.images.icons.push({
          src: icon.src,
          name: extractFileName(icon.src),
          path: `branding/images/icons/${extractFileName(icon.src)}`
        });
      });
    }
    
    // Backgrounds
    if (branding.images.backgrounds) {
      branding.images.backgrounds.forEach(bg => {
        structure.branding.images.backgrounds.push({
          src: bg.src,
          name: extractFileName(bg.src),
          path: `branding/images/backgrounds/${extractFileName(bg.src)}`
        });
      });
    }
    
    console.log(`✅ ${branding.images.all?.length || 0} Bilder organisiert`);
  }

  // 2. Organisiere CSS
  if (branding.css && branding.css.files) {
    console.log('📄 Organisiere CSS-Dateien...');
    
    branding.css.files.forEach(cssFile => {
      structure.branding.css.push({
        url: cssFile.url,
        name: extractFileName(cssFile.url) || 'style.css',
        path: `branding/css/${extractFileName(cssFile.url) || 'style.css'}`
      });
    });
    
    console.log(`✅ ${branding.css.files.length} CSS-Dateien organisiert`);
  }

  // 3. Organisiere Fonts
  if (branding.typography && branding.typography.fontFaces) {
    console.log('🔤 Organisiere Fonts...');
    
    branding.typography.fontFaces.forEach(font => {
      structure.branding.fonts.push({
        family: font.family,
        src: font.src,
        name: extractFileName(font.src),
        path: `branding/fonts/${extractFileName(font.src)}`
      });
    });
    
    console.log(`✅ ${branding.typography.fontFaces.length} Fonts organisiert`);
  }

  // 4. Erstelle Config
  structure.branding.config = {
    colors: branding.colors,
    typography: branding.typography.base,
    layout: branding.layout,
    components: branding.components.all
  };

  // 5. Download Organisations-Struktur
  const dataStr = JSON.stringify(structure, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `thynk-branding-organization-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);

  console.log('\n✅ Organisation abgeschlossen!');
  console.log('📥 Organisations-Struktur wurde heruntergeladen');
  console.log('\n📊 Struktur:');
  console.log(`   - Logos: ${structure.branding.images.logos.length}`);
  console.log(`   - Icons: ${structure.branding.images.icons.length}`);
  console.log(`   - Backgrounds: ${structure.branding.images.backgrounds.length}`);
  console.log(`   - CSS-Dateien: ${structure.branding.css.length}`);
  console.log(`   - Fonts: ${structure.branding.fonts.length}`);
  
  return structure;
}

function extractFileName(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.split('/').pop().split('?')[0];
  } catch {
    return url.split('/').pop().split('?')[0];
  }
}

// Globale Funktion
window.organizeExtractedBranding = organizeExtractedBranding;

console.log('✅ Branding-Organisations-Script geladen!');
console.log('🚀 Verwendung:');
console.log('   1. Führen Sie zuerst extractCompleteThynkBranding() aus');
console.log('   2. Dann: organizeExtractedBranding(extractedData)');
console.log('   Oder: window.organizeExtractedBranding(extractedData)');

