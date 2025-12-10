# [.SYSTEMS.T.SYSTEMS.] FIX CONSOLE ERRORS - FABRIKAGE STANDARDS
# Behebt alle Console-Fehler nach Fabrikage-Standards

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FIX CONSOLE ERRORS" -ForegroundColor Green
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ROOT = $PSScriptRoot
$htmlFiles = Get-ChildItem -Path $ROOT -Recurse -Filter "*.html" -File | Where-Object { 
    $_.FullName -notmatch "node_modules|\.git|build|Fixpatch|OSTOSOS-COMPLETE-OS-SYSTEM\\build" 
}

$fixed = 0
$errors = @()

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        $fileFixed = $false
        
        # 1. JSON.parse ohne try-catch beheben
        if ($content -match "JSON\.parse\([^)]+\)(?!\s*\{[^}]*catch)") {
            # Finde alle JSON.parse ohne try-catch
            $content = [regex]::Replace($content, 'JSON\.parse\(([^)]+)\)(?!\s*\{[^}]*catch)', {
                param($match)
                $jsonParam = $match.Groups[1].Value
                return "(() => { try { return JSON.parse($jsonParam); } catch(e) { console.error('[FABRIKAGE] JSON parse error:', e); return null; } })()"
            })
            $fileFixed = $true
        }
        
        # 2. Falsche JSON.parse Verwendung (mit jQuery/DOM)
        if ($content -match "JSON\.parse\(\$\(|JSON\.parse\([^)]*editor") {
            # Ersetze durch korrekte Version
            $content = $content -replace 'JSON\.parse\(\$\(([^)]+)\)\)', {
                param($match)
                $selector = $match.Groups[1].Value
                return "(() => { try { const el = $($selector); return el && el.textContent ? JSON.parse(el.textContent) : null; } catch(e) { console.error('[FABRIKAGE] JSON parse error:', e); return null; } })()"
            }
            $fileFixed = $true
        }
        
        # 3. console.log für Fehler → console.error
        $content = $content -replace 'console\.log\(([^)]*error[^)]*)\)', 'console.error($1)'
        $content = $content -replace 'console\.log\(([^)]*Error[^)]*)\)', 'console.error($1)'
        
        # 4. Fehlende Präfixe bei console.error hinzufügen
        $content = [regex]::Replace($content, 'console\.error\(([^,)]+)(?!\s*\[FABRIKAGE\])', {
            param($match)
            $msg = $match.Groups[1].Value
            if ($msg -notmatch "\[FABRIKAGE\]|\[MODULE\]|\[UAE\]") {
                return "console.error('[FABRIKAGE] ' + $msg"
            }
            return $match.Value
        })
        
        # 5. DOM-Zugriffe ohne Null-Checks
        # document.getElementById ohne Check
        $content = [regex]::Replace($content, 'document\.getElementById\(([^)]+)\)\.([a-zA-Z]+)\s*=', {
            param($match)
            $id = $match.Groups[1].Value
            $prop = $match.Groups[2].Value
            return "(() => { const el = document.getElementById($id); if (el) el.$prop = "
        })
        
        # 6. Async-Funktionen ohne try-catch
        if ($content -match "async\s+function\s+\w+\([^)]*\)\s*\{[^}]*await[^}]*\}(?!\s*catch)") {
            # Füge try-catch für async functions hinzu
            $content = [regex]::Replace($content, '(async\s+function\s+\w+\([^)]*\)\s*\{)', {
                param($match)
                return $match.Value + "`n    try {"
            })
            $content = [regex]::Replace($content, '(\}\s*)(?=\s*async\s+function|\s*function\s+\w+|\s*const\s+\w+\s*=|$)', {
                param($match)
                if ($match.Value -notmatch "catch") {
                    return "    } catch(e) { console.error('[FABRIKAGE] Async function error:', e); }`n$($match.Value)"
                }
                return $match.Value
            })
        }
        
        if ($fileFixed) {
            $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            $fixed++
            Write-Host "  ✅ Behoben: $($file.Name)" -ForegroundColor Green
        }
    } catch {
        $errors += "Fehler bei $($file.Name): $_"
        Write-Host "  ❌ Fehler: $($file.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "CONSOLE ERROR FIX ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Behobene Dateien: $fixed" -ForegroundColor White
Write-Host "Fehler: $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "❌ FEHLER:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ FABRIKAGE-STANDARDS: ANGEWENDET" -ForegroundColor Green
Write-Host ""

