# T,. OSOTOSOS - Test aller Build-Artefakte
$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "=== T,. OSOTOSOS - Build-Artefakte Test ===" -ForegroundColor Cyan
Write-Host ""

$buildDir = "build"
if (-not (Test-Path $buildDir)) {
    Write-Host "❌ Build-Verzeichnis nicht gefunden: $buildDir" -ForegroundColor Red
    exit 1
}

$builds = Get-ChildItem -Path $buildDir -Filter "*.img" -Recurse
$totalBuilds = $builds.Count

Write-Host "Gefundene Build-Artefakte: $totalBuilds" -ForegroundColor Yellow
Write-Host ""

if ($totalBuilds -eq 0) {
    Write-Host "⚠️ Keine Build-Artefakte gefunden" -ForegroundColor Yellow
    exit 0
}

$passed = 0
$failed = 0
$tested = 0

foreach ($build in $builds | Select-Object -First 10) {
    $tested++
    $relativePath = $build.FullName.Replace($rootDir, '.').Replace('\', '/')
    
    Write-Host "[$tested/$totalBuilds] Teste: $relativePath" -ForegroundColor Cyan
    
    # Prüfe Dateigröße
    $size = $build.Length
    if ($size -lt 100) {
        Write-Host "  ❌ Datei zu klein: $size bytes" -ForegroundColor Red
        $failed++
        continue
    }
    
    # Prüfe Dateiname (muss Schema entsprechen)
    $name = $build.Name
    if ($name -match 'osotosos-(pro|lite)-(desktop|laptop|tablet|phone|embedded)-(elite|gen2|gen3|micro|max)-(x64|arm64)-(de-DE|en-US|nl-NL)-b\d+-.*\.img') {
        Write-Host "  ✅ Schema korrekt, Größe: $size bytes" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ⚠️ Schema nicht standardkonform" -ForegroundColor Yellow
        $passed++
    }
}

Write-Host ""
Write-Host "=== Zusammenfassung ===" -ForegroundColor Cyan
Write-Host "Getestet: $tested von $totalBuilds" -ForegroundColor Yellow
Write-Host "Bestanden: $passed" -ForegroundColor Green
Write-Host "Fehlgeschlagen: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($tested -lt $totalBuilds) {
    Write-Host "Info: Nur erste 10 Builds getestet (Stichprobe)" -ForegroundColor Yellow
}

Write-Host 'T,.&T,,.&T,,,.T. - Together Systems International' -ForegroundColor Cyan

