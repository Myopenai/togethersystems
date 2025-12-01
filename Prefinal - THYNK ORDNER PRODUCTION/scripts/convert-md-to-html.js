/**
 * Convert all .md files to .html files for browser display
 * 
 * This script converts all markdown files referenced in the documentation portal
 * to standalone HTML files that can be opened directly in the browser.
 */

const fs = require('fs');
const path = require('path');

// List of .md files to convert (all referenced in HTML portals)
const mdFilesToConvert = [
    'tests/think-orders/HANDBUCH-DE-KOMPLETT.md',
    'tests/think-orders/HANDBUCH-NL-KOMPLETT.md',
    'tests/think-orders/HANDBUCH-EN-COMPLETE.md',
    'tests/think-orders/START-HIER-DUMMIES.md',
    'tests/think-orders/BILDER-ANLEITUNG.md',
    'tests/think-orders/ERWEITERUNGS-HANDBUCH-VOLLSTAENDIG.md',
    'tests/think-orders/TEST-FEATURES.md',
    'KALKULATIONSRECHNUNGSANTRAG-VOLLSTAENDIG.md'
];

// Find all .md files in the project
function findAllMdFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules and other common directories
            if (!['node_modules', '.git', 'branding', 'thynk-original'].includes(file)) {
                findAllMdFiles(filePath, fileList);
            }
        } else if (file.endsWith('.md')) {
            const relativePath = path.relative(__dirname + '/..', filePath).replace(/\\/g, '/');
            fileList.push(relativePath);
        }
    });
    
    return fileList;
}

// Simple Markdown to HTML converter
function markdownToHTML(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');
    
    // Process lists
    const lines = html.split('\n');
    let processedLines = [];
    let inList = false;
    let listType = null;
    
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        
        // Check for unordered list
        if (/^[\-\*\+] .+/.test(trimmed)) {
            if (!inList || listType !== 'ul') {
                if (inList) processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
                processedLines.push('<ul>');
                inList = true;
                listType = 'ul';
            }
            processedLines.push(`<li>${trimmed.substring(2)}</li>`);
        }
        // Check for ordered list
        else if (/^\d+\. .+/.test(trimmed)) {
            if (!inList || listType !== 'ol') {
                if (inList) processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
                processedLines.push('<ol>');
                inList = true;
                listType = 'ol';
            }
            processedLines.push(`<li>${trimmed.replace(/^\d+\. /, '')}</li>`);
        }
        // Regular content
        else {
            if (inList) {
                processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
                inList = false;
                listType = null;
            }
            
            if (trimmed) {
                // Already a header or other HTML tag
                if (trimmed.match(/^<[h1-6]/)) {
                    processedLines.push(line);
                }
                // Already a paragraph or other HTML
                else if (trimmed.match(/^</)) {
                    processedLines.push(line);
                }
                // Regular paragraph
                else {
                    processedLines.push(`<p>${trimmed}</p>`);
                }
            }
        }
    });
    
    if (inList) {
        processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
    }
    
    html = processedLines.join('\n');
    
    // Clean up multiple newlines in paragraphs
    html = html.replace(/<\/p>\n+<p>/g, '</p><p>');
    
    return html;
}

// Create HTML wrapper
function createHTMLPage(title, content, originalPath) {
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #e94560;
            border-bottom: 3px solid #e94560;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        h2 {
            color: #0f3460;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        h3 {
            color: #16213e;
            margin-top: 25px;
            margin-bottom: 10px;
        }
        h4 {
            color: #1a1a2e;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        p {
            margin-bottom: 15px;
        }
        ul, ol {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        li {
            margin-bottom: 8px;
        }
        pre {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #e94560;
            margin: 15px 0;
        }
        code {
            background: #f0f0f0;
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
            color: #0f3460;
        }
        hr {
            border: none;
            border-top: 2px solid #e94560;
            margin: 30px 0;
        }
        .back-button {
            display: inline-block;
            margin-bottom: 20px;
            padding: 10px 20px;
            background: #e94560;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
        .back-button:hover {
            background: #0f3460;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="javascript:history.back()" class="back-button">← Zurück</a>
        ${content}
        <div class="footer">
            <p><small>Quelle: ${originalPath}</small></p>
        </div>
    </div>
</body>
</html>`;
}

// Convert a single .md file to .html
function convertMdToHtml(mdPath) {
    const fullMdPath = path.join(__dirname, '..', mdPath);
    
    if (!fs.existsSync(fullMdPath)) {
        console.log(`⚠️  Datei nicht gefunden: ${mdPath}`);
        return false;
    }
    
    try {
        const mdContent = fs.readFileSync(fullMdPath, 'utf-8');
        const htmlContent = markdownToHTML(mdContent);
        
        // Get title from first H1 or filename
        const titleMatch = mdContent.match(/^# (.+)$/m);
        const title = titleMatch ? titleMatch[1] : path.basename(mdPath, '.md');
        
        const htmlPage = createHTMLPage(title, htmlContent, mdPath);
        
        // Save HTML file
        const htmlPath = fullMdPath.replace(/\.md$/, '.html');
        fs.writeFileSync(htmlPath, htmlPage, 'utf-8');
        
        console.log(`✅ Konvertiert: ${mdPath} → ${path.relative(__dirname + '/..', htmlPath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Fehler bei ${mdPath}:`, error.message);
        return false;
    }
}

// Main function
function main() {
    console.log('🔄 Konvertiere .md Dateien zu .html...\n');
    
    const baseDir = path.join(__dirname, '..');
    const allMdFiles = findAllMdFiles(baseDir);
    
    console.log(`📄 ${allMdFiles.length} .md Dateien gefunden\n`);
    
    let converted = 0;
    let failed = 0;
    
    allMdFiles.forEach(mdFile => {
        if (convertMdToHtml(mdFile)) {
            converted++;
        } else {
            failed++;
        }
    });
    
    console.log(`\n📊 Zusammenfassung:`);
    console.log(`  ✅ Konvertiert: ${converted}`);
    console.log(`  ❌ Fehler: ${failed}`);
    console.log(`\n✨ Fertig! Alle .md Dateien wurden zu .html konvertiert.`);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { convertMdToHtml, markdownToHTML, createHTMLPage };

