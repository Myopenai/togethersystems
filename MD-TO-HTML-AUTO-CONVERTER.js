// T,. MD TO HTML AUTO CONVERTER
// Konvertiert automatisch alle MD-Dateien zu HTML für OSTOSOS

const fs = require('fs');
const path = require('path');

class MDToHTMLConverter {
  constructor() {
    this.rootDir = __dirname;
  }

  // Einfacher Markdown zu HTML Konverter
  markdownToHTML(md) {
    if (!md) return '';
    
    let html = md;
    
    // Code-Blöcke zuerst
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Überschriften
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Fett
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Kursiv
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Inline-Code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Horizontale Linien
    html = html.replace(/^---$/gim, '<hr>');
    
    // Listen
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Paragraphen
    html = html.split('\n\n').map(para => {
      para = para.trim();
      if (!para) return '';
      if (para.startsWith('<')) return para;
      return '<p>' + para + '</p>';
    }).join('\n');
    
    // Bereinige leere Paragraphen
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<[h|u|o|p|d|t])/g, '$1');
    html = html.replace(/(<\/[h|u|o|p|d|t|li]>)<\/p>/g, '$1');
    
    return html;
  }

  // Erstelle HTML-Wrapper
  createHTMLWrapper(title, content) {
    return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  :root{
    --bg:#0f1419; --card:#0d1117; --fg:#e6edf3; --muted:#8b949e; --accent:#58a6ff; --border:#1f2328;
  }
  html,body{background:var(--bg);color:var(--fg);margin:0;font:15px/1.6 system-ui,Segoe UI,Roboto,Helvetica,Arial}
  .container{max-width:1200px;margin:0 auto;padding:2rem}
  h1,h2,h3,h4{color:var(--accent);margin-top:2rem}
  pre{background:var(--card);padding:1rem;border-radius:8px;overflow:auto}
  code{background:var(--card);padding:.2rem .4rem;border-radius:4px}
  a{color:var(--accent);text-decoration:none}
  a:hover{text-decoration:underline}
</style>
</head>
<body>
<div class="container">
${content}
</div>
</body>
</html>`;
  }

  // Konvertiere MD zu HTML
  convertMDToHTML(mdPath) {
    try {
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      const htmlContent = this.markdownToHTML(mdContent);
      const title = path.basename(mdPath, '.md');
      const html = this.createHTMLWrapper(title, htmlContent);
      
      const htmlPath = mdPath.replace(/\.md$/, '.html');
      fs.writeFileSync(htmlPath, html, 'utf-8');
      
      return { success: true, htmlPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Konvertiere alle MD-Dateien im Root
  convertAllMD() {
    const mdFiles = fs.readdirSync(this.rootDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(this.rootDir, file));
    
    const results = [];
    mdFiles.forEach(mdPath => {
      const htmlPath = mdPath.replace(/\.md$/, '.html');
      if (!fs.existsSync(htmlPath)) {
        const result = this.convertMDToHTML(mdPath);
        results.push({ md: path.basename(mdPath), ...result });
      }
    });
    
    return results;
  }
}

// Export für Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MDToHTMLConverter;
}

// Browser-Version
if (typeof window !== 'undefined') {
  window.MDToHTMLConverter = MDToHTMLConverter;
}

