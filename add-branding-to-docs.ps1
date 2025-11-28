# Fügt OCR & Unternehmens-Branding zu allen Dokumentations-Dateien hinzu
# IBM+++ MCP MCP MCP Standard

$brandingFooter = @"

---

## 🏢 Unternehmens-Branding & OCR

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

| Information | Link |
|------------|------|
| **Initiator** | [Raymond Demitrio Tel](https://orcid.org/0009-0003-1328-2430) |
| **ORCID** | [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430) |
| **Website** | [tel1.nl](https://tel1.nl) |
| **WhatsApp** | [+31 613 803 782](https://wa.me/31613803782) |
| **GitHub** | [myopenai/togethersystems](https://github.com/myopenai/togethersystems) |
| **Businessplan** | [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf) |

**Branding:** `T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -`

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---

"@

$brandingHTML = @"
<!-- Unternehmens-Branding -->
<div style="margin-top: 3rem; padding: 2rem; background: linear-gradient(135deg, rgba(0, 24, 168, 0.1), rgba(0, 191, 166, 0.1)); border: 2px solid #0018A8; border-radius: 12px;">
  <h2 style="color: #0018A8; margin-bottom: 1rem;">🏢 Unternehmens-Informationen</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 0.5rem; font-weight: bold;">Initiator:</td>
      <td style="padding: 0.5rem;"><a href="https://orcid.org/0009-0003-1328-2430" target="_blank" rel="noopener noreferrer" style="color: #0018A8; text-decoration: underline;">Raymond Demitrio Tel</a></td>
    </tr>
    <tr>
      <td style="padding: 0.5rem; font-weight: bold;">ORCID:</td>
      <td style="padding: 0.5rem;"><a href="https://orcid.org/0009-0003-1328-2430" target="_blank" rel="noopener noreferrer" style="color: #0018A8; text-decoration: underline;">0009-0003-1328-2430</a></td>
    </tr>
    <tr>
      <td style="padding: 0.5rem; font-weight: bold;">Website:</td>
      <td style="padding: 0.5rem;"><a href="https://tel1.nl" target="_blank" rel="noopener noreferrer" style="color: #0018A8; text-decoration: underline;">tel1.nl</a></td>
    </tr>
    <tr>
      <td style="padding: 0.5rem; font-weight: bold;">WhatsApp:</td>
      <td style="padding: 0.5rem;"><a href="https://wa.me/31613803782" target="_blank" rel="noopener noreferrer" style="color: #0018A8; text-decoration: underline;">+31 613 803 782</a></td>
    </tr>
    <tr>
      <td style="padding: 0.5rem; font-weight: bold;">GitHub:</td>
      <td style="padding: 0.5rem;"><a href="https://github.com/myopenai/togethersystems" target="_blank" rel="noopener noreferrer" style="color: #0018A8; text-decoration: underline;">myopenai/togethersystems</a></td>
    </tr>
    <tr>
      <td style="padding: 0.5rem; font-weight: bold;">Businessplan:</td>
      <td style="padding: 0.5rem;"><a href="https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf" target="_blank" rel="noopener noreferrer" style="color: #0018A8; text-decoration: underline;">TGPA Businessplan DE.pdf</a></td>
    </tr>
  </table>
  <p style="margin-top: 1rem; font-family: monospace; color: #0018A8; font-weight: bold;">
    Branding: T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -
  </p>
  <p style="margin-top: 0.5rem; color: #666;">
    <strong>IBM+++ MCP MCP MCP Standard</strong> | <strong>Industrial Business Machine</strong> | <strong>Industrial Fabrication Software</strong>
  </p>
</div>
"@

Write-Host "Füge Branding zu Dokumentationen hinzu..." -ForegroundColor Cyan

# Markdown-Dateien
$mdFiles = Get-ChildItem -Path . -Filter "*.md" -Recurse -File | Where-Object {
    $_.FullName -notlike "*\node_modules\*" -and
    $_.FullName -notlike "*\backup\*" -and
    $_.FullName -notlike "*\archive\*" -and
    $_.FullName -notlike "*\Produktionsordner\*"
}

foreach ($file in $mdFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -notlike "*ORCID*0009-0003-1328-2430*") {
        $newContent = $content.TrimEnd() + "`n`n" + $brandingFooter
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "  [OK] $($file.Name)" -ForegroundColor Green
    }
}

# HTML-Dateien (Info-Seiten)
$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -File | Where-Object {
    $_.Name -like "*INFO*" -or
    $_.Name -like "*README*" -or
    $_.Name -like "*ABOUT*" -or
    $_.Name -like "*CONTACT*"
}

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -notlike "*ORCID*0009-0003-1328-2430*") {
        # Füge vor </body> ein
        if ($content -like "*</body>*") {
            $newContent = $content -replace "</body>", "$brandingHTML`n</body>"
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            Write-Host "  [OK] $($file.Name)" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "Branding hinzugefügt!" -ForegroundColor Green

