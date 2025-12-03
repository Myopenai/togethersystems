#!/usr/bin/env python3
"""
T,. OSOTOSOS - OBERSTER STEIN Report Generator
Generiert einen visuellen HTML-Report aus dem JSON-Report
"""

import json
import sys
from pathlib import Path
from datetime import datetime

def generate_html_report(json_file: str):
    """Generiert HTML-Report aus JSON"""
    with open(json_file, 'r', encoding='utf-8') as f:
        report = json.load(f)
    
    # HTML Template
    html = f"""<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>T,. OBERSTER STEIN - System-Analyse Report</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Inter', 'Arial', sans-serif;
            background: linear-gradient(135deg, #0c0f14 0%, #1a1f3a 100%);
            color: #e7eef5;
            padding: 20px;
            line-height: 1.6;
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
        }}
        .header {{
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
            border-radius: 16px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
        }}
        .header h1 {{
            font-size: 2.5em;
            color: white;
            margin-bottom: 10px;
        }}
        .header .subtitle {{
            font-size: 1.2em;
            color: rgba(255, 255, 255, 0.9);
        }}
        .gesamtbewertung {{
            background: {'#2d5016' if report['gesamtbewertung']['status'] == '✅' else '#5d1a1a' if report['gesamtbewertung']['status'] == '❌' else '#5d4a1a'};
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }}
        .gesamtbewertung h2 {{
            font-size: 2em;
            margin-bottom: 10px;
        }}
        .gesamtbewertung .status {{
            font-size: 3em;
            margin: 20px 0;
        }}
        .gesamtbewertung .anzahl {{
            font-size: 1.5em;
            margin-top: 10px;
        }}
        .kategorien {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        .kategorie-card {{
            background: rgba(26, 31, 58, 0.8);
            padding: 20px;
            border-radius: 12px;
            border: 2px solid #10b981;
        }}
        .kategorie-card h3 {{
            color: #10b981;
            margin-bottom: 15px;
            font-size: 1.3em;
        }}
        .kategorie-card .anzahl {{
            font-size: 2em;
            font-weight: bold;
            color: #3b82f6;
            margin: 10px 0;
        }}
        .probleme-liste {{
            background: rgba(15, 23, 42, 0.9);
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
        }}
        .probleme-liste h2 {{
            color: #10b981;
            margin-bottom: 20px;
            font-size: 1.8em;
        }}
        .problem-item {{
            background: rgba(26, 31, 58, 0.6);
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }}
        .problem-item .datei {{
            color: #3b82f6;
            font-weight: bold;
            margin-bottom: 5px;
        }}
        .problem-item .problem {{
            color: #e7eef5;
        }}
        .balance {{
            background: rgba(26, 31, 58, 0.8);
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
        }}
        .balance h2 {{
            color: #10b981;
            margin-bottom: 20px;
        }}
        .balance-bar {{
            background: rgba(15, 23, 42, 0.9);
            height: 30px;
            border-radius: 15px;
            margin: 10px 0;
            overflow: hidden;
            position: relative;
        }}
        .balance-fill {{
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            color: #9ca3af;
            margin-top: 40px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ T,. OBERSTER STEIN</h1>
            <div class="subtitle">Fundamentale System-Analyse der gesamten Fabrik</div>
            <div style="margin-top: 20px; color: rgba(255,255,255,0.8);">
                Erstellt: {report['timestamp']}
            </div>
        </div>
        
        <div class="gesamtbewertung">
            <h2>Gesamtbewertung</h2>
            <div class="status">{report['gesamtbewertung']['status']}</div>
            <div style="font-size: 1.5em; margin: 10px 0;">{report['gesamtbewertung']['bewertung']}</div>
            <div class="anzahl">Gesamtprobleme: {report['gesamtbewertung']['gesamt_probleme']}</div>
        </div>
        
        <div class="kategorien">
            <div class="kategorie-card">
                <h3>🔴 Schwachstellen</h3>
                <div class="anzahl">{report['gesamtbewertung']['aufschlüsselung']['schwachstellen']}</div>
            </div>
            <div class="kategorie-card">
                <h3>🟡 Inkonsistenzen</h3>
                <div class="anzahl">{report['gesamtbewertung']['aufschlüsselung']['inkonsistenzen']}</div>
            </div>
            <div class="kategorie-card">
                <h3>⚪ Funktionslose Funktionen</h3>
                <div class="anzahl">{report['gesamtbewertung']['aufschlüsselung']['funktionslose_funktionen']}</div>
            </div>
            <div class="kategorie-card">
                <h3>⚠️ Bedeutungsvolle aber defekte</h3>
                <div class="anzahl">{report['gesamtbewertung']['aufschlüsselung']['bedeutungsvolle_aber_defekte']}</div>
            </div>
            <div class="kategorie-card">
                <h3>🔧 Unqualifizierte Techniken</h3>
                <div class="anzahl">{report['gesamtbewertung']['aufschlüsselung']['unqualifizierte_techniken']}</div>
            </div>
            <div class="kategorie-card">
                <h3>⚙️ Fließband-Probleme</h3>
                <div class="anzahl">{report['gesamtbewertung']['aufschlüsselung']['fliessband_probleme']}</div>
            </div>
        </div>
        
        <div class="balance">
            <h2>⚖️ Balance-Analyse (Ozean-Prinzip)</h2>
            <div style="margin: 20px 0;">
                <div>Code-Anteil: {report['balance_analyse'].get('code_anteil', 'N/A')}</div>
                <div class="balance-bar">
                    <div class="balance-fill" style="width: {float(report['balance_analyse'].get('code_anteil', '0%').rstrip('%'))}%;">
                        {report['balance_analyse'].get('code_anteil', 'N/A')}
                    </div>
                </div>
            </div>
            <div style="margin: 20px 0;">
                <div>Test-Anteil: {report['balance_analyse'].get('test_anteil', 'N/A')}</div>
                <div class="balance-bar">
                    <div class="balance-fill" style="width: {float(report['balance_analyse'].get('test_anteil', '0%').rstrip('%'))}%;">
                        {report['balance_analyse'].get('test_anteil', 'N/A')}
                    </div>
                </div>
            </div>
            <div style="margin: 20px 0;">
                <div>Dokumentation-Anteil: {report['balance_analyse'].get('dokumentation_anteil', 'N/A')}</div>
                <div class="balance-bar">
                    <div class="balance-fill" style="width: {float(report['balance_analyse'].get('dokumentation_anteil', '0%').rstrip('%'))}%;">
                        {report['balance_analyse'].get('dokumentation_anteil', 'N/A')}
                    </div>
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: rgba(15, 23, 42, 0.9); border-radius: 8px;">
                <strong>Bewertung:</strong> {report['balance_analyse'].get('bewertung', 'N/A')}
            </div>
        </div>
        
        <div class="probleme-liste">
            <h2>🔴 Schwachstellen ({len(report['schwachstellen'])})</h2>
            {''.join([f'''
            <div class="problem-item">
                <div class="datei">{item.get('kategorie', 'Unbekannt')} - {item.get('datei', 'N/A')}</div>
                <div class="problem">{item.get('problem', 'N/A')}</div>
            </div>
            ''' for item in report['schwachstellen'][:20]])}
            {f'<div style="text-align: center; margin-top: 20px; color: #9ca3af;">... und {len(report["schwachstellen"]) - 20} weitere</div>' if len(report['schwachstellen']) > 20 else ''}
        </div>
        
        <div class="probleme-liste">
            <h2>🟡 Inkonsistenzen ({len(report['inkonsistenzen'])})</h2>
            {''.join([f'''
            <div class="problem-item">
                <div class="datei">{item.get('kategorie', 'Unbekannt')} - {item.get('datei', 'N/A')}</div>
                <div class="problem">{item.get('problem', 'N/A')}</div>
            </div>
            ''' for item in report['inkonsistenzen']])}
        </div>
        
        <div class="probleme-liste">
            <h2>⚪ Funktionslose Funktionen ({len(report['funktionslose_funktionen'])})</h2>
            {''.join([f'''
            <div class="problem-item">
                <div class="datei">{item.get('datei', 'N/A')} - {item.get('funktion', 'N/A')}</div>
                <div class="problem">{item.get('problem', 'N/A')}</div>
            </div>
            ''' for item in report['funktionslose_funktionen'][:20]])}
            {f'<div style="text-align: center; margin-top: 20px; color: #9ca3af;">... und {len(report["funktionslose_funktionen"]) - 20} weitere</div>' if len(report['funktionslose_funktionen']) > 20 else ''}
        </div>
        
        <div class="footer">
            <p>T,.&T,,.&T,,,.T. - Together Systems International</p>
            <p>Oberster Stein System - Fundamentale Analyse</p>
        </div>
    </div>
</body>
</html>"""
    
    # Speichere HTML
    html_file = Path(json_file).parent / f"oberster-stein-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.html"
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"HTML-Report generiert: {html_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Finde neuesten JSON-Report
        artifacts_dir = Path("artifacts")
        if artifacts_dir.exists():
            json_files = list(artifacts_dir.glob("oberster-stein-report-*.json"))
            if json_files:
                json_file = max(json_files, key=lambda p: p.stat().st_mtime)
                generate_html_report(str(json_file))
            else:
                print("Kein JSON-Report gefunden!")
        else:
            print("Artifacts-Ordner nicht gefunden!")
    else:
        generate_html_report(sys.argv[1])

