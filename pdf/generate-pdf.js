/**
 * PDF Generator für MCP Dokumentation
 * 
 * Erstellt eine PDF-Datei aus der HTML-Dokumentation
 * 
 * Verwendung:
 *   npm install puppeteer
 *   node generate-pdf.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  console.log('📄 Starte PDF-Generierung...\n');
  
  const htmlPath = path.join(__dirname, 'mcp-setup-documentation.html');
  const pdfPath = path.join(__dirname, 'MCP-Setup-Dokumentation.pdf');
  
  // Prüfe ob HTML-Datei existiert
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ HTML-Datei nicht gefunden:', htmlPath);
    process.exit(1);
  }
  
  try {
    console.log('🌐 Starte Browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    console.log('📖 Lade HTML-Dokument...');
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0'
    });
    
    console.log('📄 Generiere PDF...');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    console.log('\n✅ PDF erfolgreich erstellt!');
    console.log(`📁 Speicherort: ${pdfPath}`);
    console.log(`📊 Dateigröße: ${(fs.statSync(pdfPath).size / 1024).toFixed(2)} KB\n`);
    
  } catch (error) {
    console.error('❌ Fehler bei PDF-Generierung:', error);
    process.exit(1);
  }
}

// Alternative: Verwende html-pdf (falls puppeteer nicht verfügbar)
async function generatePDFAlternative() {
  console.log('📄 Starte PDF-Generierung (Alternative Methode)...\n');
  
  try {
    const pdf = require('html-pdf');
    const htmlPath = path.join(__dirname, 'mcp-setup-documentation.html');
    const pdfPath = path.join(__dirname, 'MCP-Setup-Dokumentation.pdf');
    
    const html = fs.readFileSync(htmlPath, 'utf-8');
    
    const options = {
      format: 'A4',
      border: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      type: 'pdf',
      quality: '75'
    };
    
    console.log('📄 Generiere PDF...');
    
    pdf.create(html, options).toFile(pdfPath, (err, res) => {
      if (err) {
        console.error('❌ Fehler:', err);
        process.exit(1);
      }
      
      console.log('\n✅ PDF erfolgreich erstellt!');
      console.log(`📁 Speicherort: ${res.filename}`);
      console.log(`📊 Dateigröße: ${(res.filename.size / 1024).toFixed(2)} KB\n`);
    });
    
  } catch (error) {
    console.error('❌ Fehler:', error.message);
    console.log('\n💡 Tipp: Installiere puppeteer oder html-pdf:');
    console.log('   npm install puppeteer');
    console.log('   oder');
    console.log('   npm install html-pdf\n');
    process.exit(1);
  }
}

// Hauptfunktion
async function main() {
  // Versuche zuerst puppeteer
  try {
    await generatePDF();
  } catch (error) {
    // Fallback auf alternative Methode
    console.log('⚠️  Puppeteer nicht verfügbar, versuche alternative Methode...\n');
    await generatePDFAlternative();
  }
}

// Führe aus wenn direkt aufgerufen
if (require.main === module) {
  main();
}

module.exports = { generatePDF, generatePDFAlternative };

