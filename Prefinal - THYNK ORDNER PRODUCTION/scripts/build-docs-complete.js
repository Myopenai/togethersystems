/**
 * ================================================================
 * BUILD: ALLE MD-DATEIEN → HTML KONVERTIERUNG
 * ================================================================
 * Findet ALLE .md Dateien rekursiv und konvertiert sie zu HTML
 * Erstellt vollständige HTML-Seiten mit Navigation und Styling
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

// Base-Verzeichnis (THYNK ORDNER PRODUCTION)
const baseDir = path.resolve(__dirname, '..');

// Ausgeschlossene Pfade
const excludePaths = [
    'node_modules',
    '.git',
    'tests/node_modules',
    'thynk-original',
    '.cursor'
];

/**
 * Findet alle .md Dateien rekursiv
 */
function findAllMarkdownFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        // Prüfe ob ausgeschlossen
        const relativePath = path.relative(baseDir, filePath);
        const shouldExclude = excludePaths.some(exclude => 
            relativePath.includes(exclude)
        );
        
        if (shouldExclude) {
            return;
        }
        
        if (stat.isDirectory()) {
            findAllMarkdownFiles(filePath, fileList);
        } else if (file.endsWith('.md')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

/**
 * Konvertiert Markdown zu HTML
 */
function markdownToHTML(markdown, title) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');
    
    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Wrap list items in ul/ol
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
        return '<ul>' + match + '</ul>';
    });
    
    // Paragraphs (double newline)
    html = html.split('\n\n').map(p => {
        const trimmed = p.trim();
        if (trimmed && !trimmed.match(/^<[hul]/) && !trimmed.match(/^<li>/) && !trimmed.match(/^<pre>/)) {
            return '<p>' + trimmed + '</p>';
        }
        return trimmed;
    }).join('\n\n');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

/**
 * Erstellt vollständige HTML-Seite
 */
function createHTMLPage(title, content, originalPath) {
    // Bestimme relative Pfade für Navigation
    const relativeBase = path.relative(path.dirname(originalPath), baseDir);
    const baseHref = relativeBase ? relativeBase.replace(/\\/g, '/') + '/' : '';
    
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .back-link {
            display: inline-block;
            margin-bottom: 30px;
            padding: 10px 20px;
            background: #e94560;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
        }
        .back-link:hover {
            background: #d63447;
        }
        h1 {
            color: #e94560;
            border-bottom: 3px solid #e94560;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        h2 {
            color: #0f3460;
            margin-top: 40px;
            margin-bottom: 20px;
        }
        h3 {
            color: #16213e;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        h4 {
            color: #16213e;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        p {
            margin-bottom: 15px;
        }
        ul, ol {
            margin-left: 30px;
            margin-bottom: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        pre {
            background: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #e94560;
            overflow-x: auto;
            margin: 20px 0;
            border-radius: 4px;
        }
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        pre code {
            background: none;
            padding: 0;
        }
        a {
            color: #e94560;
            text-decoration: underline;
        }
        a:hover {
            color: #d63447;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 0.9em;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="javascript:history.back()" class="back-link">← Zurück</a>
        <h1>${title}</h1>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>THYNK ORDERS - Dokumentation</p>
            <p>Generiert: ${new Date().toLocaleString('de-DE')}</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Hauptfunktion
 */
function main() {
    console.log('');
    console.log('════════════════════════════════════════════════════════════');
    console.log('  📖 BUILD: ALLE MD-DATEIEN → HTML');
    console.log('════════════════════════════════════════════════════════════');
    console.log('');
    
    // Finde alle MD-Dateien
    console.log('🔍 Suche alle .md Dateien...');
    const mdFiles = findAllMarkdownFiles(baseDir);
    console.log(`✅ ${mdFiles.length} MD-Dateien gefunden\n`);
    
    let converted = 0;
    let failed = 0;
    const errors = [];
    
    mdFiles.forEach(mdPath => {
        try {
            // Lese MD-Datei
            const mdContent = fs.readFileSync(mdPath, 'utf8');
            
            // Extrahiere Titel (erste H1 oder Dateiname)
            let title = path.basename(mdPath, '.md');
            const h1Match = mdContent.match(/^#\s+(.+)$/m);
            if (h1Match) {
                title = h1Match[1].trim();
            }
            
            // Konvertiere zu HTML
            const htmlContent = markdownToHTML(mdContent, title);
            
            // Erstelle vollständige HTML-Seite
            const fullHTML = createHTMLPage(title, htmlContent, mdPath);
            
            // Speichere HTML-Datei (neben MD)
            const htmlPath = mdPath.replace(/\.md$/, '.html');
            fs.writeFileSync(htmlPath, fullHTML, 'utf8');
            
            const relativePath = path.relative(baseDir, htmlPath);
            console.log(`✅ ${relativePath}`);
            converted++;
            
        } catch (error) {
            const relativePath = path.relative(baseDir, mdPath);
            console.error(`❌ ${relativePath}: ${error.message}`);
            errors.push({ file: relativePath, error: error.message });
            failed++;
        }
    });
    
    console.log('');
    console.log('════════════════════════════════════════════════════════════');
    console.log(`  ✅ Erfolgreich konvertiert: ${converted}`);
    console.log(`  ❌ Fehler: ${failed}`);
    console.log('════════════════════════════════════════════════════════════');
    console.log('');
    
    if (errors.length > 0) {
        console.log('Fehlerdetails:');
        errors.forEach(({ file, error }) => {
            console.log(`  • ${file}: ${error}`);
        });
        console.log('');
    }
    
    if (failed === 0) {
        console.log('✨ Alle MD-Dateien erfolgreich zu HTML konvertiert!');
        process.exit(0);
    } else {
        console.log('⚠️  Einige Dateien konnten nicht konvertiert werden.');
        process.exit(1);
    }
}

// Ausführen
main();

