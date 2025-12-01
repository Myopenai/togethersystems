# T,. OSTOSOS - Dokumentationsportal Builder (PowerShell)
# Erstellt Luxus-Dokumentationsportal aus allen .md/.txt Dateien im Root

Write-Host "🔍 Suche nach Dokumenten im Root..." -ForegroundColor Cyan

$rootDir = Split-Path -Parent $PSScriptRoot
$outputDir = $PSScriptRoot
$mdFiles = @()

# Rekursive Suche nach .md und .txt Dateien
function Get-MarkdownFiles {
    param([string]$Path)
    
    $files = Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.Extension -match '\.(md|MD|txt|TXT)$' -and
        $_.FullName -notmatch '\\node_modules\\' -and
        $_.FullName -notmatch '\\.git\\' -and
        $_.FullName -notmatch '\\dist\\' -and
        $_.FullName -notmatch '\\build\\'
    }
    
    return $files
}

$mdFiles = Get-MarkdownFiles -Path $rootDir

Write-Host "✅ $($mdFiles.Count) Dokumente gefunden" -ForegroundColor Green

if ($mdFiles.Count -eq 0) {
    Write-Host "⚠️ Keine Dokumente gefunden!" -ForegroundColor Yellow
    exit
}

# Lade und verarbeite Dateien
$items = @()
foreach ($file in $mdFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $relativePath = $file.FullName.Replace($rootDir + '\', '').Replace('\', '/')
        $dirName = Split-Path -Parent $relativePath
        if ($dirName -eq '') { $dirName = 'Root' }
        
        # Erkenne Typ
        $type = 'Dokument'
        $lowerPath = $file.FullName.ToLower()
        if ($lowerPath -match 'readme') { $type = 'README' }
        elseif ($lowerPath -match 'changelog') { $type = 'Changelog' }
        elseif ($lowerPath -match 'license') { $type = 'Lizenz' }
        elseif ($lowerPath -match 'todo') { $type = 'TODO' }
        elseif ($lowerPath -match 'innovation') { $type = 'Innovation' }
        elseif ($lowerPath -match 'settings') { $type = 'Settings' }
        elseif ($lowerPath -match 'studienprojekt') { $type = 'Studienprojekt' }
        elseif ($lowerPath -match 'guide') { $type = 'Guide' }
        elseif ($lowerPath -match 'report') { $type = 'Report' }
        elseif ($lowerPath -match 'architektur') { $type = 'Architektur' }
        
        $items += @{
            Id = "doc_$($items.Count + 1)"
            Title = $file.Name
            Path = $relativePath
            Dir = $dirName
            Content = $content
            Type = $type
        }
    } catch {
        Write-Warning "⚠️ Fehler beim Lesen von $($file.FullName): $_"
    }
}

Write-Host "📊 Verarbeitet: $($items.Count) Dokumente" -ForegroundColor Cyan

# Erstelle HTML (vereinfacht - vollständige Version in .js)
$html = @"
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>T,. OSTOSOS - Luxus-Dokumentationsportal</title>
<style>
:root{--bg:#0f1419;--card:#0d1117;--fg:#e6edf3;--muted:#8b949e;--accent:#58a6ff}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg);color:var(--fg);font:15px/1.6 system-ui,Segoe UI,Roboto,Helvetica,Arial}
.site-header{position:sticky;top:0;background:rgba(13,17,23,.95);backdrop-filter:blur(8px);border-bottom:1px solid #1f2328;padding:1rem;z-index:1000}
.brand{font-weight:700;font-size:1.2em;margin-bottom:1rem;color:var(--accent)}
.brand a{color:var(--accent);text-decoration:none}
.tools{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-top:1rem}
.tools input{flex:1;min-width:280px;background:var(--card);color:var(--fg);border:1px solid #30363d;border-radius:10px;padding:.6rem .8rem}
.tools button{background:var(--card);color:var(--fg);border:1px solid #30363d;border-radius:10px;padding:.6rem 1rem;cursor:pointer}
.stats{display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem;font-size:.85em;color:var(--muted)}
.stat-item{background:var(--card);padding:.4rem .8rem;border-radius:6px;border:1px solid #1f2328}
.container{display:grid;grid-template-columns:280px 1fr;gap:1rem;padding:1rem;max-width:1800px;margin:0 auto}
.sidebar{background:var(--card);border:1px solid #1f2328;border-radius:12px;padding:1rem;position:sticky;top:120px;max-height:calc(100vh - 140px);overflow-y:auto}
.nav-group{margin-bottom:1.5rem}
.nav-group-title{font-weight:600;color:var(--accent);margin-bottom:.5rem;font-size:.9em}
.nav-link{display:block;color:var(--muted);text-decoration:none;padding:.4rem .6rem;border-radius:8px;margin-bottom:.3rem;font-size:.85em;border-left:3px solid transparent}
.nav-link:hover{color:var(--fg);background:rgba(88,166,255,0.1);border-left-color:var(--accent)}
.nav-link.active{color:var(--accent);background:rgba(88,166,255,0.15);border-left-color:var(--accent);font-weight:600}
.content{display:flex;flex-direction:column;gap:1rem}
.doc-section{background:var(--card);border:1px solid #1f2328;border-radius:12px;padding:1.5rem}
.doc-header{margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid #1f2328}
.doc-header h2{font-size:1.5em;margin-bottom:.5rem;color:var(--accent)}
.doc-meta{display:flex;gap:1rem;flex-wrap:wrap;font-size:.85em;color:var(--muted)}
.doc-type{background:rgba(88,166,255,0.1);color:var(--accent);padding:.2rem .6rem;border-radius:6px;font-weight:600}
.doc-path{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.doc-content{line-height:1.8;white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.9em}
mark{background:#f2cc60;color:#0b0f14;border-radius:4px;padding:.1rem .2rem;font-weight:600}
</style>
</head>
<body>
<header class="site-header">
  <div class="brand"><a href="https://tel1.jouwweb.nl/servicesoftware" target="_blank">T,.&T,,.&T,,,.</a> Luxus-Dokumentationsportal</div>
  <div class="tools">
    <input id="search" type="text" placeholder="🔍 Suche ($($items.Count) Dokumente)…" />
    <button id="clear">Löschen</button>
    <span id="hits" class="muted"></span>
  </div>
  <div class="stats">
    <div class="stat-item">📄 $($items.Count) Dokumente</div>
    <div class="stat-item">🔍 Volltextsuche</div>
    <div class="stat-item">💾 Offline-fähig</div>
  </div>
</header>
<div class="container">
  <aside class="sidebar">
    <nav class="site-nav">
      $(($items | Group-Object -Property Dir | Sort-Object Name | ForEach-Object {
        $dir = $_.Name
        $dirItems = $_.Group | Sort-Object Title
        "<div class='nav-group'><div class='nav-group-title'>📁 $dir</div>" + 
        ($dirItems | ForEach-Object { "<a href='#$($_.Id)' class='nav-link' data-type='$($_.Type)'>$($_.Title)</a>" }) + 
        "</div>"
      }) -join '')
    </nav>
  </aside>
  <main class="content">
    $(($items | ForEach-Object {
      "<section id='$($_.Id)' class='doc-section' data-type='$($_.Type)' data-path='$($_.Path)'><div class='doc-header'><h2>$($_.Title)</h2><div class='doc-meta'><span class='doc-type'>$($_.Type)</span><span class='doc-path'>$($_.Path)</span></div></div><div class='doc-content'>$($_.Content -replace '<','&lt;' -replace '>','&gt;')</div></section>"
    }) -join '')
  </main>
</div>
<footer class="site-footer">© T,. OSTOSOS - Luxus-Dokumentationsportal</footer>
<script>
const searchBox=document.getElementById('search'),clearBtn=document.getElementById('clear'),hitsTxt=document.getElementById('hits'),sections=Array.from(document.querySelectorAll('.doc-section')),navLinks=Array.from(document.querySelectorAll('.nav-link'));
function stripHighlights(el){el.querySelectorAll('mark').forEach(m=>{const t=document.createTextNode(m.textContent);m.replaceWith(t)})}
function highlightText(el,term){if(!term)return;const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null),textNodes=[];while(walker.nextNode())textNodes.push(walker.currentNode);textNodes.forEach(node=>{const txt=node.nodeValue,lower=txt.toLowerCase(),idx=lower.indexOf(term.toLowerCase());if(idx>=0){const span=document.createElement('mark');span.textContent=txt.slice(idx,idx+term.length);const pre=document.createTextNode(txt.slice(0,idx)),post=document.createTextNode(txt.slice(idx+term.length)),parent=node.parentNode;parent.insertBefore(pre,node);parent.insertBefore(span,node);parent.insertBefore(post,node);parent.removeChild(node)}})}
function search(term){const t=term.trim().toLowerCase();let hits=0,visibleCount=0;sections.forEach(sec=>{stripHighlights(sec);const match=t?sec.textContent.toLowerCase().includes(t):true;sec.style.display=match?'':'none';if(match){visibleCount++;if(t){highlightText(sec,t);const count=(sec.textContent.toLowerCase().match(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,'\\\\$&'),'g'))||[]).length;hits+=count}}const id=sec.id,navLink=navLinks.find(link=>link.getAttribute('href')==='#'+id);if(navLink){if(match)navLink.classList.add('active');else navLink.classList.remove('active')}});hitsTxt.textContent=t?`✅ ${visibleCount} Dokumente, ${hits} Treffer`:'';
if(t&&visibleCount>0){const first=sections.find(s=>s.style.display!=='none');if(first){setTimeout(()=>{first.scrollIntoView({behavior:'smooth',block:'start'});location.hash='#'+first.id},100)}}}
searchBox.addEventListener('input',()=>search(searchBox.value));clearBtn.addEventListener('click',()=>{searchBox.value='';search('');navLinks.forEach(link=>link.classList.remove('active'))});
navLinks.forEach(link=>{link.addEventListener('click',e=>{e.preventDefault();const targetId=link.getAttribute('href').substring(1),target=document.getElementById(targetId);if(target){target.scrollIntoView({behavior:'smooth',block:'start'});location.hash='#'+targetId;navLinks.forEach(l=>l.classList.remove('active'));link.classList.add('active')}})});
if(location.hash){const target=document.querySelector(location.hash);if(target){setTimeout(()=>{target.scrollIntoView({behavior:'smooth',block:'start'});const navLink=navLinks.find(link=>link.getAttribute('href')===location.hash);if(navLink)navLink.classList.add('active')},100)}}
if('serviceWorker' in navigator){navigator.serviceWorker.register('./documentation-portal-sw.js').catch(()=>{})}
console.log('✅ Luxus-Dokumentationsportal geladen:',sections.length,'Dokumente');
</script>
</body>
</html>
"@

$outputPath = Join-Path $outputDir "documentation-portal.html"
$html | Out-File -FilePath $outputPath -Encoding UTF8

Write-Host "✅ Portal erstellt: $outputPath" -ForegroundColor Green
Write-Host "📊 Statistiken:" -ForegroundColor Cyan
Write-Host "   - $($items.Count) Dokumente" -ForegroundColor White
Write-Host "   - $($items | Group-Object -Property Dir | Measure-Object | Select-Object -ExpandProperty Count) Ordner" -ForegroundColor White
Write-Host "   - $($items | Where-Object { $_.Type -eq 'Innovation' } | Measure-Object | Select-Object -ExpandProperty Count) Innovationen" -ForegroundColor White
Write-Host "   - $($items | Where-Object { $_.Type -eq 'Settings' } | Measure-Object | Select-Object -ExpandProperty Count) Settings" -ForegroundColor White

