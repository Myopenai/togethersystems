// T,. OSTOSOS - Luxus-Dokumentationsportal Builder
// Erfasst alle Dokumente im Root (jeden Ordner und Unterordner komplett)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Markdown zu HTML Konverter (vereinfacht, da marked möglicherweise nicht verfügbar)
function markdownToHTML(md) {
  if (!md) return '';
  
  let html = md;
  
  // Überschriften
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Fett
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Kursiv
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Code-Blöcke
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Listen
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Zeilenumbrüche
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // Bereinige leere Paragraphen
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<[h|u|o|p])/g, '$1');
  html = html.replace(/(<\/[h|u|o|p|li]>)<\/p>/g, '$1');
  
  return html;
}

// Rekursive Dateisuche
function findMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Überspringe node_modules, .git, etc.
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
        findMarkdownFiles(filePath, fileList);
      }
    } else if (file.endsWith('.md') || file.endsWith('.MD') || file.endsWith('.txt') || file.endsWith('.TXT')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Haupt-Build-Funktion
function buildPortal() {
  console.log('🔍 Suche nach Dokumenten im Root...');
  
  // Root-Verzeichnis (ein Ordner über diesem Script)
  const rootDir = path.resolve(__dirname, '..');
  const outputDir = path.resolve(__dirname);
  
  // Finde alle Markdown/TXT-Dateien
  const mdFiles = findMarkdownFiles(rootDir);
  
  console.log(`✅ ${mdFiles.length} Dokumente gefunden`);
  
  // Lade und verarbeite alle Dateien
  const items = mdFiles.map((filePath, i) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(rootDir, filePath);
      const fileName = path.basename(filePath);
      const dirName = path.dirname(relativePath);
      
      // Erkenne Typ
      let type = 'Dokument';
      if (filePath.includes('README')) type = 'README';
      else if (filePath.includes('CHANGELOG')) type = 'Changelog';
      else if (filePath.includes('LICENSE')) type = 'Lizenz';
      else if (filePath.includes('TODO')) type = 'TODO';
      else if (filePath.includes('Innovationsordner')) type = 'Innovation';
      else if (filePath.includes('Settings')) type = 'Settings';
      else if (filePath.includes('STUDIENPROJEKT')) type = 'Studienprojekt';
      
      return {
        id: `doc_${i + 1}`,
        title: fileName,
        path: relativePath,
        dir: dirName,
        content: content,
        type: type,
        html: markdownToHTML(content)
      };
    } catch (error) {
      console.warn(`⚠️ Fehler beim Lesen von ${filePath}:`, error.message);
      return null;
    }
  }).filter(item => item !== null);
  
  // Gruppiere nach Ordnern
  const grouped = {};
  items.forEach(item => {
    const key = item.dir || 'Root';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });
  
  // Erstelle Navigation
  const navItems = Object.keys(grouped).sort().map(dir => {
    const dirItems = grouped[dir];
    return `
      <div class="nav-group">
        <div class="nav-group-title">${dir === 'Root' ? '📁 Root' : `📁 ${dir}`}</div>
        ${dirItems.map(item => `<a href="#${item.id}" class="nav-link" data-type="${item.type}">${item.title}</a>`).join('')}
      </div>
    `;
  }).join('');
  
  // Erstelle Sections
  const sections = items.map(item => `
    <section id="${item.id}" class="doc-section" data-type="${item.type}" data-path="${item.path}">
      <div class="doc-header">
        <h2>${item.title}</h2>
        <div class="doc-meta">
          <span class="doc-type">${item.type}</span>
          <span class="doc-path">${item.path}</span>
        </div>
      </div>
      <div class="doc-content">
        ${item.html}
      </div>
    </section>
  `).join('\n');
  
  // Erstelle HTML
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>T,. OSTOSOS - Luxus-Dokumentationsportal</title>
<style>
:root{
  --bg:#0f1419; --card:#0d1117; --fg:#e6edf3; --muted:#8b949e; --accent:#58a6ff; --ok:#3fb950;
  --warn:#d29922; --bad:#f85149;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg);color:var(--fg);font:15px/1.6 system-ui,Segoe UI,Roboto,Helvetica,Arial;margin:0}
.site-header{position:sticky;top:0;background:rgba(13,17,23,.95);backdrop-filter:saturate(140%) blur(8px);border-bottom:1px solid #1f2328;padding:1rem;z-index:1000}
.brand{font-weight:700;letter-spacing:.02em;font-size:1.2em;margin-bottom:1rem;color:var(--accent)}
.brand a{color:var(--accent);text-decoration:none}
.tools{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-top:1rem}
.tools input{flex:1;min-width:280px;background:var(--card);color:var(--fg);border:1px solid #30363d;border-radius:10px;padding:.6rem .8rem;font-size:1em}
.tools button{background:var(--card);color:var(--fg);border:1px solid #30363d;border-radius:10px;padding:.6rem 1rem;cursor:pointer;font-size:.9em}
.tools button:hover{border-color:var(--accent)}
.tools .muted{color:var(--muted);font-size:.9em;margin-left:.5rem}
.container{display:grid;grid-template-columns: 280px 1fr;gap:1rem;padding:1rem;max-width:1800px;margin:0 auto}
.sidebar{background:var(--card);border:1px solid #1f2328;border-radius:12px;padding:1rem;position:sticky;top:120px;max-height:calc(100vh - 140px);overflow-y:auto}
.nav-group{margin-bottom:1.5rem}
.nav-group-title{font-weight:600;color:var(--accent);margin-bottom:.5rem;font-size:.9em;text-transform:uppercase;letter-spacing:.05em}
.nav-link{display:block;color:var(--muted);text-decoration:none;padding:.4rem .6rem;border-radius:8px;margin-bottom:.3rem;font-size:.85em;transition:all 0.2s;border-left:3px solid transparent}
.nav-link:hover{color:var(--fg);background:rgba(88,166,255,0.1);border-left-color:var(--accent)}
.nav-link.active{color:var(--accent);background:rgba(88,166,255,0.15);border-left-color:var(--accent);font-weight:600}
.content{display:flex;flex-direction:column;gap:1rem}
.doc-section{background:var(--card);border:1px solid #1f2328;border-radius:12px;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.2)}
.doc-header{margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid #1f2328}
.doc-header h2{font-size:1.5em;margin-bottom:.5rem;color:var(--accent)}
.doc-meta{display:flex;gap:1rem;flex-wrap:wrap;font-size:.85em;color:var(--muted)}
.doc-type{background:rgba(88,166,255,0.1);color:var(--accent);padding:.2rem .6rem;border-radius:6px;font-weight:600}
.doc-path{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.doc-content{line-height:1.8}
.doc-content h1{font-size:2em;margin:1.5rem 0 1rem;color:var(--accent);border-bottom:2px solid var(--accent);padding-bottom:.5rem}
.doc-content h2{font-size:1.5em;margin:1.2rem 0 .8rem;color:var(--accent)}
.doc-content h3{font-size:1.2em;margin:1rem 0 .6rem;color:var(--fg)}
.doc-content p{margin:.8rem 0}
.doc-content ul, .doc-content ol{margin:.8rem 0;padding-left:2rem}
.doc-content li{margin:.4rem 0}
.doc-content code{background:rgba(88,166,255,0.1);color:var(--accent);padding:.2rem .4rem;border-radius:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.9em}
.doc-content pre{background:#0b0f14;border:1px solid #1f2328;border-radius:8px;padding:1rem;overflow-x:auto;margin:1rem 0}
.doc-content pre code{background:none;color:var(--fg);padding:0}
.doc-content a{color:var(--accent);text-decoration:none;border-bottom:1px solid transparent;transition:border-color 0.2s}
.doc-content a:hover{border-bottom-color:var(--accent)}
.doc-content blockquote{border-left:4px solid var(--accent);padding-left:1rem;margin:1rem 0;color:var(--muted);font-style:italic}
mark{background:#f2cc60;color:#0b0f14;border-radius:4px;padding:.1rem .2rem;font-weight:600}
.doc-section[style*="display: none"]{display:none !important}
.stats{display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem;font-size:.85em;color:var(--muted)}
.stat-item{background:var(--card);padding:.4rem .8rem;border-radius:6px;border:1px solid #1f2328}
.site-footer{padding:2rem 1rem;color:var(--muted);text-align:center;border-top:1px solid #1f2328;margin-top:3rem}
@media (max-width: 1024px){
  .container{grid-template-columns:1fr}
  .sidebar{position:static;max-height:none}
}
</style>
</head>
<body>
<header class="site-header">
  <div class="brand"><a href="https://tel1.jouwweb.nl/servicesoftware" target="_blank">T,.&T,,.&T,,,.</a> Luxus-Dokumentationsportal</div>
  <div class="tools">
    <input id="search" type="text" placeholder="🔍 Suche im gesamten Portal (${items.length} Dokumente)…" />
    <button id="clear">Löschen</button>
    <span id="hits" class="muted"></span>
  </div>
  <div class="stats">
    <div class="stat-item">📄 ${items.length} Dokumente</div>
    <div class="stat-item">📁 ${Object.keys(grouped).length} Ordner</div>
    <div class="stat-item">🔍 Volltextsuche</div>
    <div class="stat-item">💾 Offline-fähig</div>
  </div>
</header>

<div class="container">
  <aside class="sidebar">
    <nav class="site-nav">
      ${navItems}
    </nav>
  </aside>

  <main class="content">
    ${sections}
  </main>
</div>

<footer class="site-footer">
  © T,. OSTOSOS - Luxus-Dokumentationsportal · Alle Dokumente aus Root & Unterordnern · Offline-fähig
</footer>

<script>
const searchBox = document.getElementById('search');
const clearBtn = document.getElementById('clear');
const hitsTxt = document.getElementById('hits');
const sections = Array.from(document.querySelectorAll('.doc-section'));
const navLinks = Array.from(document.querySelectorAll('.nav-link'));

function stripHighlights(el) {
  el.querySelectorAll('mark').forEach(m => {
    const t = document.createTextNode(m.textContent);
    m.replaceWith(t);
  });
}

function highlightText(el, term) {
  if (!term) return;
  
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }
  
  textNodes.forEach(node => {
    const txt = node.nodeValue;
    const lower = txt.toLowerCase();
    const idx = lower.indexOf(term.toLowerCase());
    
    if (idx >= 0) {
      const span = document.createElement('mark');
      span.textContent = txt.slice(idx, idx + term.length);
      
      const pre = document.createTextNode(txt.slice(0, idx));
      const post = document.createTextNode(txt.slice(idx + term.length));
      
      const parent = node.parentNode;
      parent.insertBefore(pre, node);
      parent.insertBefore(span, node);
      parent.insertBefore(post, node);
      parent.removeChild(node);
    }
  });
}

function search(term) {
  const t = term.trim().toLowerCase();
  let hits = 0;
  let visibleCount = 0;
  
  sections.forEach(sec => {
    stripHighlights(sec);
    
    const match = t ? sec.textContent.toLowerCase().includes(t) : true;
    sec.style.display = match ? '' : 'none';
    
    if (match) {
      visibleCount++;
      if (t) {
        highlightText(sec, t);
        const count = (sec.textContent.toLowerCase().match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        hits += count;
      }
    }
    
    // Update Navigation
    const id = sec.id;
    const navLink = navLinks.find(link => link.getAttribute('href') === '#' + id);
    if (navLink) {
      if (match) {
        navLink.classList.add('active');
      } else {
        navLink.classList.remove('active');
      }
    }
  });
  
  hitsTxt.textContent = t ? \`✅ \${visibleCount} Dokumente, \${hits} Treffer\` : '';
  
  // Scroll zum ersten Treffer
  if (t && visibleCount > 0) {
    const first = sections.find(s => s.style.display !== 'none');
    if (first) {
      setTimeout(() => {
        first.scrollIntoView({ behavior: 'smooth', block: 'start' });
        location.hash = '#' + first.id;
      }, 100);
    }
  }
}

searchBox.addEventListener('input', () => search(searchBox.value));
clearBtn.addEventListener('click', () => {
  searchBox.value = '';
  search('');
  navLinks.forEach(link => link.classList.remove('active'));
});

// Navigation Click
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      location.hash = '#' + targetId;
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
});

// Hash-basierte Navigation beim Laden
if (location.hash) {
  const target = document.querySelector(location.hash);
  if (target) {
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const navLink = navLinks.find(link => link.getAttribute('href') === location.hash);
      if (navLink) navLink.classList.add('active');
    }, 100);
  }
}

// Service Worker für Offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./documentation-portal-sw.js').catch(() => {
    console.log('Service Worker optional');
  });
}

console.log('✅ Luxus-Dokumentationsportal geladen:', sections.length, 'Dokumente');
</script>
</body>
</html>`;

  // Speichere Portal
  const outputPath = path.join(outputDir, 'documentation-portal.html');
  fs.writeFileSync(outputPath, html);
  
  console.log(`✅ Portal erstellt: ${outputPath}`);
  console.log(`📊 Statistiken:`);
  console.log(`   - ${items.length} Dokumente`);
  console.log(`   - ${Object.keys(grouped).length} Ordner`);
  console.log(`   - ${items.filter(i => i.type === 'Innovation').length} Innovationen`);
  console.log(`   - ${items.filter(i => i.type === 'Settings').length} Settings`);
  console.log(`   - ${items.filter(i => i.type === 'Studienprojekt').length} Studienprojekte`);
  
  return outputPath;
}

// Ausführen
try {
  buildPortal();
} catch (error) {
  console.error('❌ Fehler beim Erstellen des Portals:', error);
  process.exit(1);
}

]]