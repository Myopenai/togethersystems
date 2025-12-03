# T,. CONVERT ALL MD TO HTML
# Konvertiert alle MD-Dateien zu HTML für OSTOSOS

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CONVERT ALL MD TO HTML" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$mdFiles = Get-ChildItem -Path . -Include *.md -File -ErrorAction SilentlyContinue | Where-Object {
    $_.DirectoryName -eq (Get-Location).Path
}

Write-Host "📄 Gefunden: $($mdFiles.Count) MD-Dateien" -ForegroundColor Yellow

$converted = 0
foreach ($mdFile in $mdFiles) {
    $htmlName = $mdFile.Name -replace '\.md$', '.html'
    $htmlPath = Join-Path (Get-Location).Path $htmlName
    
    if (-not (Test-Path $htmlPath)) {
        $mdContent = Get-Content $mdFile.FullName -Raw -Encoding UTF8
        
        # Einfache HTML-Wrapper
        $htmlContent = @"
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>$($mdFile.BaseName)</title>
<style>
  :root{--bg:#0f1419;--card:#0d1117;--fg:#e6edf3;--muted:#8b949e;--accent:#58a6ff;--border:#1f2328;}
  html,body{background:var(--bg);color:var(--fg);margin:0;font:15px/1.6 system-ui,Segoe UI,Roboto,Helvetica,Arial}
  .container{max-width:1200px;margin:0 auto;padding:2rem}
  h1,h2,h3,h4{color:var(--accent);margin-top:2rem}
  pre{background:var(--card);padding:1rem;border-radius:8px;overflow:auto;white-space:pre-wrap}
  code{background:var(--card);padding:.2rem .4rem;border-radius:4px}
  a{color:var(--accent);text-decoration:none}
  a:hover{text-decoration:underline}
</style>
</head>
<body>
<div class="container">
<pre style="white-space:pre-wrap;font-family:inherit">$([System.Security.SecurityElement]::Escape($mdContent))</pre>
</div>
</body>
</html>
"@
        Set-Content -Path $htmlPath -Value $htmlContent -Encoding UTF8 -NoNewline
        $converted++
        Write-Host "   ✅ Konvertiert: $($mdFile.Name) → $htmlName" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✅ $converted MD-Dateien zu HTML konvertiert" -ForegroundColor Green

