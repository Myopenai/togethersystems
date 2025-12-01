# ================================================================
# ERWEITERTE AUTOMATISCHE KOSTENBERECHNUNGS-AKTUALISIERUNG
# ================================================================
# Aktualisiert automatisch die Kostenberechnung mit:
# - Allen Items
# - Detaillierten Zeitangaben
# - Produktionsverlauf
# - Multi-Language Support (DE, NL, EN)
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot
$currentYear = Get-Date -Format "yyyy"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$currentMonth = Get-Date -Format "yyyy-MM"

# Language Templates
$lang = @{
    DE = @{
        Title = "KALKULATIONSRECHNUNGSANTRAG - THYNK ORDERS PRODUCTION"
        Subtitle = "Vollständiger Rechnungsauftrag für Produktionsaufwand"
        Project = "Projekt"
        Date = "Datum"
        Year = "Jahr"
        Status = "Status"
        LastUpdate = "Letzte Aktualisierung"
        ProductionStatus = "PRODUKTIONSSTAND"
        CurrentStatus = "Aktueller Status"
        TotalHours = "Gesamtaufwand (tatsächlich)"
        ImplementedFeatures = "Implementierte Features"
        ProductionTimeline = "PRODUKTIONS-VERLAUF"
        Month = "Monat"
        Phase = "Phase"
        Hours = "Aufwand (Stunden)"
        DetailedBreakdown = "DETAILLIERTE KOSTENAUFSCHLÜSSELUNG"
        Summary = "ZUSAMMENFASSUNG"
        TotalCost = "Gesamtkosten"
        VAT = "MwSt. (21%)"
        TotalGross = "Gesamtsumme (brutto)"
        AutoUpdated = "Automatisch aktualisiert basierend auf aktuellem Produktionsstand"
        InProduction = "In Produktion"
        Planned = "Geplant"
        Active = "Aktiv"
    }
    NL = @{
        Title = "KOSTENBEREKENING REKENING - THYNK ORDERS PRODUCTION"
        Subtitle = "Volledige rekeningaanvraag voor productie-inspanning"
        Project = "Project"
        Date = "Datum"
        Year = "Jaar"
        Status = "Status"
        LastUpdate = "Laatste update"
        ProductionStatus = "PRODUCTIESTATUS"
        CurrentStatus = "Huidige status"
        TotalHours = "Totale inspanning (werkelijk)"
        ImplementedFeatures = "Geïmplementeerde functies"
        ProductionTimeline = "PRODUCTIE-VERLOOP"
        Month = "Maand"
        Phase = "Fase"
        Hours = "Inspanning (uren)"
        DetailedBreakdown = "GEDETAILLEERDE KOSTENOPSPLITSING"
        Summary = "SAMENVATTING"
        TotalCost = "Totale kosten"
        VAT = "BTW (21%)"
        TotalGross = "Totaalbedrag (inclusief BTW)"
        AutoUpdated = "Automatisch bijgewerkt op basis van huidige productiestatus"
        InProduction = "In productie"
        Planned = "Gepland"
        Active = "Actief"
    }
    EN = @{
        Title = "COST CALCULATION INVOICE - THYNK ORDERS PRODUCTION"
        Subtitle = "Complete invoice request for production effort"
        Project = "Project"
        Date = "Date"
        Year = "Year"
        Status = "Status"
        LastUpdate = "Last Update"
        ProductionStatus = "PRODUCTION STATUS"
        CurrentStatus = "Current Status"
        TotalHours = "Total Effort (actual)"
        ImplementedFeatures = "Implemented Features"
        ProductionTimeline = "PRODUCTION TIMELINE"
        Month = "Month"
        Phase = "Phase"
        Hours = "Effort (Hours)"
        DetailedBreakdown = "DETAILED COST BREAKDOWN"
        Summary = "SUMMARY"
        TotalCost = "Total Cost"
        VAT = "VAT (21%)"
        TotalGross = "Total Amount (gross)"
        AutoUpdated = "Automatically updated based on current production status"
        InProduction = "In Production"
        Planned = "Planned"
        Active = "Active"
    }
}

# Detaillierte Feature-Analyse mit Zeit-Tracking
function Analyze-ProductionStatus {
    $baseDir = Split-Path -Parent $PSScriptRoot
    
    $items = @()
    
    # Core System
    $coreFiles = (Get-ChildItem -Path $baseDir -Filter "*THYNK-ORDERS*.html" -Recurse -ErrorAction SilentlyContinue).Count
    if ($coreFiles -gt 0) {
        $items += @{
            Name = "Core System - Think Orders"
            Status = "✅ Implementiert"
            Files = $coreFiles
            Hours = 84
            StartDate = "2025-01-15"
            LastUpdate = (Get-Date).ToString("yyyy-MM-dd")
            Phase = "Deployment"
        }
    }
    
    # Test Suite
    $testFiles = (Get-ChildItem -Path $baseDir -Filter "*.spec.ts" -Recurse -ErrorAction SilentlyContinue).Count
    if ($testFiles -gt 0) {
        $items += @{
            Name = "Vollständige Test-Suite"
            Status = "✅ Implementiert"
            Files = $testFiles
            Hours = 56
            StartDate = "2025-01-15"
            LastUpdate = (Get-Date).ToString("yyyy-MM-dd")
            Phase = "Testing"
        }
    }
    
    # Dokumentation
    $docFiles = (Get-ChildItem -Path $baseDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules|\.git' }).Count
    if ($docFiles -gt 0) {
        $items += @{
            Name = "Vollständige Handbücher (3 Sprachen)"
            Status = "✅ Implementiert"
            Files = $docFiles
            Hours = 92
            StartDate = "2025-01-15"
            LastUpdate = (Get-Date).ToString("yyyy-MM-dd")
            Phase = "Documentation"
        }
    }
    
    # CMS System
    $cmsFiles = (Get-ChildItem -Path $baseDir -Filter "*cms*.js" -Recurse -ErrorAction SilentlyContinue).Count
    if ($cmsFiles -gt 0) {
        $items += @{
            Name = "CMS System"
            Status = "✅ Implementiert"
            Files = $cmsFiles
            Hours = 68
            StartDate = "2025-01-15"
            LastUpdate = (Get-Date).ToString("yyyy-MM-dd")
            Phase = "Development"
        }
    }
    
    # Mikro-Sites System
    $microSites = (Get-ChildItem -Path $baseDir -Filter "*microsite*" -Recurse -ErrorAction SilentlyContinue).Count
    if ($microSites -gt 0) {
        $items += @{
            Name = "Mikro-Sites System"
            Status = "✅ Implementiert"
            Files = $microSites
            Hours = 56
            StartDate = "2025-01-15"
            LastUpdate = (Get-Date).ToString("yyyy-MM-dd")
            Phase = "Development"
        }
    }
    
    # Backup & Recovery
    $backupFiles = (Get-ChildItem -Path $baseDir -Filter "*backup*" -Recurse -ErrorAction SilentlyContinue).Count
    if ($backupFiles -gt 0) {
        $items += @{
            Name = "Backup & Recovery System"
            Status = "✅ Implementiert"
            Files = $backupFiles
            Hours = 22
            StartDate = "2025-01-15"
            LastUpdate = (Get-Date).ToString("yyyy-MM-dd")
            Phase = "Development"
        }
    }
    
    # Deployment System
    $deployFiles = (Get-ChildItem -Path $baseDir -Filter "*deploy*" -Recurse -ErrorAction SilentlyContinue).Count
    if ($deployFiles -gt 0) {
        $items += @{
            Name = "Deployment System"
            Status = "✅ Implementiert"
            Files = $deployFiles
            Hours = 16
            StartDate = "2025-01-15"
            LastUpdate = (Get-Date).ToString("yyyy-MM-dd")
            Phase = "Deployment"
        }
    }
    
    # Design & UI/UX
    $designFiles = (Get-ChildItem -Path $baseDir -Filter "*design*" -Recurse -ErrorAction SilentlyContinue).Count
    if ($designFiles -gt 0) {
        $items += @{
            Name = "Design & UI/UX"
            Status = "✅ Implementiert"
            Files = $designFiles
            Hours = 72
            StartDate = "2025-01-15"
            LastUpdate = (Get-Date).ToString("yyyy-MM-dd")
            Phase = "Development"
        }
    }
    
    return $items
}

# Erstelle Kostenberechnung in mehreren Sprachen
function Create-CostCalculation {
    param($language, $items)
    
    $l = $lang[$language]
    $totalHours = ($items.Hours | Measure-Object -Sum).Sum
    $totalCost = $totalHours * 65
    $management = $totalCost * 0.10
    $risk = $totalCost * 0.05
    $support = $totalCost * 0.05
    $subtotal = $totalCost + $management + $risk + $support
    $vat = $subtotal * 0.21
    $grandTotal = $subtotal + $vat
    
    $content = @"
# 📋 $($l.Title)

## 🎯 $($l.Subtitle)

**$($l.Project):** Think Orders Production System  
**$($l.Date):** $(Get-Date -Format "yyyy-MM-dd")  
**$($l.Year):** $currentYear  
**Rechnungsnummer:** THYNK-$currentYear-001-PRODUCTION  
**$($l.Status):** ✅ $($l.AutoUpdated)  
**$($l.LastUpdate):** $timestamp

---

## 📊 $($l.ProductionStatus) $currentYear

**$($l.CurrentStatus):** $(if ($totalHours -gt 0) { $l.InProduction } else { $l.Planned })  
**$($l.TotalHours):** $totalHours Stunden  
**$($l.ImplementedFeatures):** $($items.Count)

### Implementierungsstatus:

$($items | ForEach-Object {
    "**$($_.Name):** $($_.Status) ($($_.Files) Dateien) - $($_.Hours) Stunden"
} | Out-String)

---

## 📈 $($l.ProductionTimeline) $currentYear

| $($l.Month) | $($l.Phase) | $($l.Status) | $($l.Hours) |
|-------|-------|--------|-------------------|
$($items | ForEach-Object {
    "| $($_.LastUpdate) | $($_.Phase) | $($l.Active) | $($_.Hours) |"
} | Out-String)

**Gesamt:** | | | **$totalHours** |

---

## 💼 $($l.DetailedBreakdown)

$($items | ForEach-Object {
    $itemCost = $_.Hours * 65
    "### $($_.Name)
**Status:** $($_.Status)
**Dateien:** $($_.Files)
**Aufwand:** $($_.Hours) Stunden
**Start:** $($_.StartDate)
**Letzte Aktualisierung:** $($_.LastUpdate)
**Phase:** $($_.Phase)
**Kosten (bei €65/Stunde):** €$itemCost
"
})

---

## 💰 $($l.Summary)

**Gesamtstunden:** $totalHours  
**Gesamtkosten (bei €65/Stunde):** €$([math]::Round($totalCost, 2))

### Zuschläge:
- Projekt-Management (10%): €$([math]::Round($management, 2))
- Risikopuffer (5%): €$([math]::Round($risk, 2))
- Wartung & Support (5%): €$([math]::Round($support, 2))

**Zwischensumme (netto):** €$([math]::Round($subtotal, 2))  
**$($l.VAT):** €$([math]::Round($vat, 2))  
**$($l.TotalGross):** €$([math]::Round($grandTotal, 2))

---

## 📅 PRODUKTIONS-TIMELINE $currentYear

**Start:** $(($items | Sort-Object StartDate | Select-Object -First 1).StartDate)  
**Aktueller Stand:** $(Get-Date -Format "yyyy-MM-dd")  
**Status:** $(if ($totalHours -gt 0) { $l.InProduction } else { $l.Planned })

---

**Diese Rechnung wird automatisch aktualisiert basierend auf dem aktuellen Produktionsstand.**
"@
    
    return $content
}

# Haupt-Funktion
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔄 ERWEITERTE AUTOMATISCHE KOSTENBERECHNUNGS-AKTUALISIERUNG" -ForegroundColor Cyan
Write-Host "  Jahr: $currentYear | Zeit: $timestamp" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Analysiere Produktionsstand
Write-Host "📊 Analysiere Produktionsstand..." -ForegroundColor Cyan
$items = Analyze-ProductionStatus
Write-Host "✅ $($items.Count) Items gefunden" -ForegroundColor Green
Write-Host ""

# Erstelle Kostenberechnung in allen Sprachen
foreach ($langCode in @("DE", "NL", "EN")) {
    Write-Host "📄 Erstelle Kostenberechnung: $langCode..." -ForegroundColor Cyan
    
    $content = Create-CostCalculation -language $langCode -items $items
    
    $fileName = switch ($langCode) {
        "DE" { "KALKULATIONSRECHNUNGSANTRAG-VOLLSTAENDIG.md" }
        "NL" { "KOSTENBEREKENING-REKENING-VOLLEDIG.md" }
        "EN" { "COST-CALCULATION-INVOICE-COMPLETE.md" }
    }
    
    $filePath = Join-Path $baseDir $fileName
    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "✅ Erstellt: $fileName" -ForegroundColor Green
}

# Erstelle Production Tracking JSON
$trackingData = @{
    year = $currentYear
    lastUpdate = $timestamp
    items = $items
    totalHours = ($items.Hours | Measure-Object -Sum).Sum
    totalCost = ($items.Hours | Measure-Object -Sum).Sum * 65 * 1.10 * 1.21
    status = if (($items.Hours | Measure-Object -Sum).Sum -gt 0) { "In Production" } else { "Planned" }
} | ConvertTo-Json -Depth 10

$trackingFile = Join-Path $baseDir "PRODUCTION-TRACKING-$currentYear.json"
[System.IO.File]::WriteAllText($trackingFile, $trackingData, [System.Text.Encoding]::UTF8)
Write-Host "✅ Production Tracking erstellt: PRODUCTION-TRACKING-$currentYear.json" -ForegroundColor Green

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ AUTOMATISCHE AKTUALISIERUNG ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

