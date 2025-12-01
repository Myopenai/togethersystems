/**
 * ================================================================
 * BUILD: HTML-GESAMTLÖSUNG - ALLE DOKUMENTE IN EINER DATEI
 * ================================================================
 * Erstellt eine einzige große HTML-Datei mit allen Dokumenten
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');

function findAllMarkdownFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    const excludePaths = ['node_modules', '.git', 'tests/node_modules', 'thynk-original', '.cursor'];
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        const relativePath = path.relative(baseDir, filePath);
        const shouldExclude = excludePaths.some(exclude => relativePath.includes(exclude));
        
        if (shouldExclude) return;
        
        if (stat.isDirectory()) {
            findAllMarkdownFiles(filePath, fileList);
        } else if (file.endsWith('.md')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

function markdownToHTML(markdown) {
    let html = markdown;
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => '<ul>' + match + '</ul>');
    html = html.split('\n\n').map(p => {
        const trimmed = p.trim();
        if (trimmed && !trimmed.match(/^<[hul]/) && !trimmed.match(/^<li>/) && !trimmed.match(/^<pre>/)) {
            return '<p>' + trimmed + '</p>';
        }
        return trimmed;
    }).join('\n\n');
    return html;
}

function createCompleteHTML(docs) {
    const navItems = docs.map((doc, index) => 
        `<li><a href="#doc-${index}" data-index="${index}">${doc.title}</a></li>`
    ).join('\n                ');
    
    const docSections = docs.map((doc, index) => `
        <section id="doc-${index}" class="doc-section" data-index="${index}">
            <div class="doc-header">
                <h1>${doc.title}</h1>
                <div class="doc-meta">
                    <span class="doc-category">${doc.category}</span>
                    <span class="doc-path">${doc.path}</span>
                </div>
            </div>
            <div class="doc-content">
                ${doc.content}
            </div>
        </section>
    `).join('\n');
    
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>THYNK ORDERS - Komplette Dokumentation</title>
    <link rel="stylesheet" href="THYNK-DOKU-COMPLETE.css">
</head>
<body>
    <canvas id="particleCanvas"></canvas>
    <canvas id="glowCanvas"></canvas>
    
    <div class="loader" id="loader">
        <div class="loader-content">
            <div class="hexagon"></div>
            <p>Lade Dokumentation...</p>
        </div>
    </div>
    
    <nav class="main-nav" id="mainNav">
        <div class="nav-header">
            <h2>📚 Dokumentation</h2>
            <button class="nav-toggle" id="navToggle">☰</button>
        </div>
        <div class="search-box">
            <input type="text" id="searchInput" placeholder="Suchen...">
        </div>
        <ul class="nav-list" id="navList">
            ${navItems}
        </ul>
        <div class="nav-footer">
            <p>${docs.length} Dokumente</p>
        </div>
    </nav>
    
    <main class="main-content" id="mainContent">
        ${docSections}
    </main>
    
    <div class="scroll-indicator" id="scrollIndicator"></div>
    
    <script src="THYNK-DOKU-COMPLETE.js"></script>
</body>
</html>`;
}

function main() {
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  📖 BUILD: HTML-GESAMTLÖSUNG');
    console.log('════════════════════════════════════════════════════════════\n');
    
    const mdFiles = findAllMarkdownFiles(baseDir);
    console.log(`✅ ${mdFiles.length} MD-Dateien gefunden\n`);
    
    const docs = [];
    
    mdFiles.forEach((mdPath, index) => {
        try {
            const mdContent = fs.readFileSync(mdPath, 'utf8');
            const title = path.basename(mdPath, '.md');
            const relativePath = path.relative(baseDir, mdPath).replace(/\\/g, '/');
            const htmlContent = markdownToHTML(mdContent);
            
            // Kategorie aus Pfad ableiten
            let category = 'Dokumentation';
            if (relativePath.includes('tests')) category = 'Tests';
            if (relativePath.includes('HANDBUCH') || relativePath.includes('handbuch')) category = 'Handbücher';
            if (relativePath.includes('ANLEITUNG') || relativePath.includes('anleitung')) category = 'Anleitungen';
            
            docs.push({
                index: index,
                title: title,
                path: relativePath,
                category: category,
                content: htmlContent
            });
            
            if ((index + 1) % 10 === 0) {
                console.log(`  Verarbeitet: ${index + 1}/${mdFiles.length}...`);
            }
        } catch (error) {
            console.error(`❌ Fehler bei ${mdPath}: ${error.message}`);
        }
    });
    
    console.log(`\n✅ ${docs.length} Dokumente verarbeitet\n`);
    
    const completeHTML = createCompleteHTML(docs);
    const outputPath = path.join(baseDir, 'THYNK-DOKU-COMPLETE.html');
    
    fs.writeFileSync(outputPath, completeHTML, 'utf8');
    
    console.log('════════════════════════════════════════════════════════════');
    console.log(`✅ HTML-Gesamtlösung erstellt: THYNK-DOKU-COMPLETE.html`);
    console.log(`   ${docs.length} Dokumente eingebettet`);
    console.log('════════════════════════════════════════════════════════════\n');
}

main();

