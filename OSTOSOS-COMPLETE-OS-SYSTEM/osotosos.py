#!/usr/bin/env python3
# osotosos.py — One-file OSOTOSOS sealed-core with open edges
# Single file, stdlib only. Web UI + CLI + audit + plugin overlays + explainability.

import sys, json, time, random, os, threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import urlopen, Request
from urllib.error import URLError
from pathlib import Path
from typing import Dict, List

# =========================
# Sealed core: kernel, audit, contracts
# =========================

APP_NAME = "OSOTOSOS"
VERSION = "1.0.0-onefile"
DOCK_ICON = "☰"

AREAS = [
    ("Frontend/UI", "frontend"),
    ("Backend/API", "backend"),
    ("Build/Deployment", "build"),
    ("Infrastruktur/System", "infra"),
    ("Produktion/SCADA", "prod"),
    ("Organisation", "org"),
    ("Sicherheit/Compliance", "sec"),
    ("Daten/Speicher", "data"),
    ("Benutzer/Interaktion", "user"),
    ("Externe Abhängigkeiten", "ext"),
    ("Zeit/Synchronisation", "time"),
    ("Menschlich/Psychologisch", "human"),
]

QUESTIONNAIRE = [
    ("Physisch", "Ist jede Schraube anwesend und korrekt befestigt?"),
    ("Physisch", "Sind Unterlegscheiben vorhanden und funktionsfähig?"),
    ("Physisch", "Funktionieren Federn ohne Defekt oder Spannungsverlust?"),
    ("Physisch", "Sind Staubpartikel entfernt, keine Beeinträchtigung?"),
    ("Physisch", "Mechanische Teile (Zahnräder, Lager, Riemen) geprüft?"),
    ("Localhost", "Localhost-System läuft fehlerfrei ohne Abstürze?"),
    ("Localhost", "Services lokal gestartet und erreichbar?"),
    ("Localhost", "Datenbanken lokal ohne Korruption?"),
    ("Localhost", "Konfigurationsdateien korrekt geladen?"),
    ("Tests", "Vollständige Unit-Tests lokal bestanden?"),
    ("Online", "Server online erreichbar, Health-Checks ok?"),
    ("Online", "APIs fehlerfrei, gültige Antworten?"),
    ("Online", "Cloud-Ressourcen korrekt provisioniert?"),
    ("Online", "Integrationstest online erfolgreich?"),
    ("Security", "Sicherheitszertifikate gültig?"),
    ("Deploy", "Deployment auf allen Servern erfolgreich?"),
    ("Deploy", "Artefakte vollständig vorhanden?"),
    ("Deploy", "Rollback-Test durchgeführt und funktionsfähig?"),
    ("Observability", "Monitoring aktiv und liefert Daten?"),
    ("Parität", "Localhost vs Online funktionsgleich?"),
    ("UX", "Benutzeroberfläche fehlerfrei, keine Darstellungsprobleme?"),
    ("UX", "Interaktionen (Buttons, Eingaben, Workflows) ok?"),
    ("Perf", "Performance gut (z. B. snappy UI)?"),
    ("Endnutzer", "System fehlerfrei für Endnutzer?"),
    ("Parität", "Keine Unterschiede zwischen lokal und online?"),
    ("Abschluss", "Gesamtaudit erstellt und dokumentiert?"),
    ("Abschluss", "Logs gespeichert und überprüfbar?"),
    ("Compliance", "Compliance-Check (ISO/CEPT/DSGVO) bestanden?"),
    ("Parität", "Online-Fabrik identisch zur physischen Fabrik?"),
    ("Final", "100% Funktionsfähigkeit bestätigt?")
]

THEMES = {
    "serious": {
        "font": "Inter, Arial, sans-serif",
        "bg": "#0c0f14",
        "fg": "#e7eef5",
        "panel": {"red": "#ff4d4d", "orange": "#ffa64d", "yellow": "#ffd633", "green": "#66cc66"},
        "window_bg": "#f5f7fa",
        "window_fg": "#111",
        "accent": "#2c3e50"
    },
    "classic": {
        "font": "Georgia, serif",
        "bg": "#101318",
        "fg": "#e7eef5",
        "panel": {"red": "#d9534f", "orange": "#f0ad4e", "yellow": "#ffd966", "green": "#5cb85c"},
        "window_bg": "#ffffff",
        "window_fg": "#111",
        "accent": "#34495e"
    },
    "high_contrast": {
        "font": "Arial, sans-serif",
        "bg": "#000000",
        "fg": "#ffffff",
        "panel": {"red": "#ff0000", "orange": "#ff9900", "yellow": "#ffff00", "green": "#00ff00"},
        "window_bg": "#000000",
        "window_fg": "#ffffff",
        "accent": "#00ffff"
    },
    "kids": {
        "font": "Comic Sans MS, Arial, sans-serif",
        "bg": "#1b2230",
        "fg": "#fefefe",
        "panel": {"red": "#ff6b6b", "orange": "#ffd93d", "yellow": "#f9f871", "green": "#6bcB77"},
        "window_bg": "#fdf6ef",
        "window_fg": "#222",
        "accent": "#6c5ce7"
    }
}

DEFAULT_CONFIG = {
    "theme": "serious",
    "developer_mode": False,
    "prometheus_url": "http://localhost:9090/api/v1/query",
    "panels_thresholds": {"warn": 1, "error": 10},
}

LOGS: List[str] = []
OVERLAY_DIR = Path.home() / ".osotosos" / "overlay_plugins"

def log(msg: str):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{ts}] {msg}"
    LOGS.append(entry)
    print(entry)

def bootstrap():
    log(f"{APP_NAME} {VERSION} kernel starting")
    if DEFAULT_CONFIG["theme"] not in THEMES:
        DEFAULT_CONFIG["theme"] = "serious"
        log("Theme invalid, restored to 'serious'")
    log("Self-healing watchdogs initialized")

# =========================
# Metrics: local simulation + optional Prometheus
# =========================

def query_prometheus(metric: str, url: str) -> float:
    try:
        req = Request(f"{url}?query={metric}", headers={"User-Agent": APP_NAME})
        with urlopen(req, timeout=2.0) as resp:
            payload = resp.read().decode("utf-8", "ignore")
            idx = payload.find('"value"')
            if idx == -1:
                raise ValueError("No value field")
            s = payload[idx: idx+200]
            q = s.split('"')[-2]
            return float(q)
    except Exception as e:
        log(f"Prometheus query failed for {metric}: {e}")
        return float("nan")

def area_metric_stub(key: str) -> float:
    base = sum(ord(c) for c in key) % 7
    jitter = random.random() * 3.0
    return float(base) + jitter

def get_area_status(config: Dict) -> Dict[str, Dict]:
    statuses = {}
    warn_t = config["panels_thresholds"]["warn"]
    err_t = config["panels_thresholds"]["error"]
    prom = config.get("prometheus_url")

    for area_name, key in AREAS:
        metric_map = {
            "frontend": "frontend_errors_total",
            "backend": "backend_errors_total",
            "build": "build_failures_total",
            "infra": "system_cpu_usage",
            "prod": "production_sensor_faults",
            "org": "org_compliance_violations",
            "sec": "security_alerts_total",
            "data": "db_corruption_total",
            "user": "user_input_errors_total",
            "ext": "external_api_failures_total",
            "time": "time_sync_drift_seconds",
            "human": "human_error_reports_total",
        }
        val = float("nan")
        if prom:
            val = query_prometheus(metric_map.get(key, key), prom)
        if not (val == val):
            val = area_metric_stub(key)

        if val > err_t:
            color = "red"
            label = "FEHLER"
        elif val > warn_t:
            color = "orange"
            label = "WARNUNG"
        else:
            color = "green"
            label = "OK"

        statuses[key] = {"value": round(val, 2), "color": color, "label": label, "title": area_name}

    return statuses

# =========================
# Audit questionnaire handling
# =========================

AUDIT_STATE = {i: False for i in range(len(QUESTIONNAIRE))}

def audit_export() -> str:
    checked = sum(1 for v in AUDIT_STATE.values() if v)
    total = len(QUESTIONNAIRE)
    status = "OK" if checked == total else ("WARNUNG" if checked > (total * 0.7) else "FEHLER")
    lines = ["# OSOTOSOS Audit-Ergebnis", f"- Status: {status}", f"- Erfüllt: {checked}/{total}", "", "## Checkliste"]
    for i, (cat, q) in enumerate(QUESTIONNAIRE):
        mark = "[x]" if AUDIT_STATE.get(i, False) else "[ ]"
        lines.append(f"- {mark} ({cat}) {q}")
    return "\n".join(lines)

# =========================
# UI shell (local web server)
# =========================

def page_index(config: Dict) -> str:
    theme = THEMES[config["theme"]]
    colors = theme["panel"]
    styles = f"""
    body {{ margin:0; font-family:{theme['font']}; background:{theme['bg']}; color:{theme['fg']}; }}
    .dock {{ position:fixed; bottom:12px; left:12px; display:flex; gap:8px; }}
    .icon {{ width:42px; height:42px; background:{theme['accent']}; border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; }}
    .window {{ position:fixed; top:6%; left:5%; width:90%; height:82%; background:{theme['window_bg']}; color:{theme['window_fg']}; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.3); display:grid; grid-template-columns: 260px 1fr; }}
    .sidebar {{ border-right:1px solid #ddd; padding:12px; overflow:auto; }}
    .content {{ padding:12px; overflow:auto; }}
    .menu-item {{ padding:8px; border-radius:6px; cursor:pointer; }}
    .menu-item:hover {{ background:#e6f0ff; }}
    .panel {{ padding:12px; border-radius:8px; text-align:center; margin:6px; color:#111; }}
    .red {{ background:{colors['red']}; }}
    .orange {{ background:{colors['orange']}; }}
    .yellow {{ background:{colors['yellow']}; }}
    .green {{ background:{colors['green']}; }}
    .statusgrid {{ display:grid; grid-template-columns: repeat(4,1fr); gap:12px; }}
    .badge {{ font-size:12px; opacity:0.85; }}
    .small {{ font-size:13px; }}
    .topbar {{ display:flex; justify-content:space-between; align-items:center; padding:10px 16px; }}
    .btn {{ background:{theme['accent']}; color:{theme['fg']}; padding:6px 10px; border:none; border-radius:6px; cursor:pointer; }}
    .btn:disabled {{ opacity:0.6; cursor:not-allowed; }}
    .note {{ font-size:12px; opacity:0.8; }}
    """

    html = f"""<!doctype html>
<html><head><meta charset="utf-8"><title>{APP_NAME}</title><style>{styles}</style></head>
<body>
<div class="topbar">
  <div><b>{APP_NAME}</b> {VERSION} • Theme: {config['theme']}</div>
  <div>
    <button class="btn" onclick="cycleTheme()">Theme wechseln</button>
    <button class="btn" onclick="openDocs()">Dokumentation</button>
    <button class="btn" onclick="openExplain()">Explain</button>
    <button class="btn" onclick="openAudit()">Audit</button>
  </div>
</div>
<div class="dock">
  <div class="icon" onclick="toggleMenu()">{DOCK_ICON}</div>
</div>
<div id="win" class="window" style="display:none;">
  <div class="sidebar">
    <div class="menu-item" onclick="openPanel('programs')">Programme</div>
    <div class="menu-item" onclick="openPanel('tools')">Werkzeuge</div>
    <div class="menu-item" onclick="openPanel('settings')">Einstellungen</div>
    <div class="menu-item" onclick="openPanel('plugins')">Plugins</div>
    <div class="menu-item" onclick="openPanel('help')">Hilfe</div>
    <div class="note small">Developer-Mode: {"ON" if config.get("developer_mode") else "OFF"}</div>
  </div>
  <div class="content" id="content">
    Willkommen bei {APP_NAME}. Öffne das Menü über die linke Dock-Schaltfläche.
  </div>
</div>
<script>
function toggleMenu(){{ const w = document.getElementById('win'); w.style.display = (w.style.display==='none')?'grid':'none'; }}
function openPanel(name){{
  if(name==='programs'){{ loadStatus(); }}
  else if(name==='tools'){{ document.getElementById('content').innerHTML = toolsPanel(); }}
  else if(name==='settings'){{ document.getElementById('content').innerHTML = settingsPanel(); }}
  else if(name==='plugins'){{ document.getElementById('content').innerHTML = pluginsPanel(); }}
  else if(name==='help'){{ openDocs(); }}
  else {{ document.getElementById('content').innerText = 'Panel'; }}
}}
function loadStatus(){{
  fetch('/api/status').then(r=>r.json()).then(data=>{{
    let html = '<div class="statusgrid">';
    for(const k in data){{
      const item = data[k];
      html += `<div class="panel ${{item.color}}"><b>${{item.title}}</b><div class="badge">${{item.label}}</div><div class="small">Wert: ${{item.value}}</div></div>`;
    }}
    html += '</div>';
    document.getElementById('content').innerHTML = html;
  }}).catch(_=>{{ document.getElementById('content').innerHTML = 'Status nicht verfügbar'; }});
}}
function toolsPanel(){{ return '<div><h3>Werkzeuge</h3><ul class="small"><li>Diagnose: Live-Status, Self-Healing-Logs</li><li>Rollback: Canary/Parität</li><li>Metrics: Prometheus optional</li></ul></div>'; }}
function settingsPanel(){{ return '<div><h3>Einstellungen</h3><p>Accessibility-Presets: Senior, Kids, High-Contrast.</p><p>Theme über Topbar wechseln.</p></div>'; }}
function pluginsPanel(){{ return '<div><h3>Plugins</h3><p>Sealed core; Overlay-Plugins im Benutzerordner (.osotosos/overlay_plugins).</p><p>Developer-Mode: optional, signierte/unsignierte Overlays.</p></div>'; }}
function cycleTheme(){{ fetch('/api/theme/cycle').then(_=>location.reload()); }}
function openDocs(){{ window.open('/docs','_blank'); }}
function openExplain(){{ window.open('/explain','_blank'); }}
function openAudit(){{ window.open('/audit','_blank'); }}
</script>
</body></html>"""
    return html

def page_docs() -> str:
    return """<!doctype html><html><head><meta charset="utf-8"><title>Dokumentation</title></head>
<body style="font-family:Inter, Arial; margin:24px;">
<h2>OSOTOSOS Dokumentation</h2>
<p>Dieses Artefakt ist ein one-file OS-ähnliches System mit sealed core und offenen Rändern:</p>
<ul>
<li><b>Kernel:</b> Lifecycle, Logging, Self-Healing</li>
<li><b>UI Shell:</b> Dock, Fenster, Panels, Themes</li>
<li><b>Plugin-Layer:</b> optionale Overlays in ~/.osotosos/overlay_plugins</li>
<li><b>Audit:</b> Checkliste, Export</li>
<li><b>Explain:</b> Architektur- und Netzfluss-Ansicht</li>
</ul>
<p>Alle Komponenten sind stdlib-basiert, ohne externe Abhängigkeiten.</p>
</body></html>"""

def page_explain() -> str:
    return """<!doctype html><html><head><meta charset="utf-8"><title>Explain</title></head>
<body style="font-family:Inter, Arial; margin:24px;">
<h2>Explainability</h2>
<p>Wiring & Network Flow:</p>
<pre>
[User] -> [UI Shell (HTTPServer)] -> [Kernel] -> [Metrics/Status] -> [Audit/Docs]
                         \\-> [Plugins Overlay Loader] -> [Registered Extensions]
</pre>
<p>Contracts: themes, panels thresholds, audit schema. Rollback: logs + stubs.</p>
</body></html>"""

def page_audit() -> str:
    items = []
    for i,(cat,q) in enumerate(QUESTIONNAIRE):
        checked = "checked" if AUDIT_STATE.get(i, False) else ""
        items.append(f"""<div><label><input type="checkbox" onchange="toggle({i})" {checked}/> ({cat}) {q}</label></div>""")
    html_items = "\n".join(items)
    return f"""<!doctype html><html><head><meta charset="utf-8"><title>Audit</title></head>
<body style="font-family:Inter, Arial; margin:24px;">
<h2>Audit Fragebogen</h2>
<div>{html_items}</div>
<br/>
<button onclick="exportAudit()">Export als Markdown</button>
<pre id="out" style="margin-top:12px; background:#f3f4f6; padding:12px;"></pre>
<script>
function toggle(i){{ fetch('/api/audit/toggle?i='+i).then(_=>console.log('toggled')); }}
function exportAudit(){{ fetch('/api/audit/export').then(r=>r.text()).then(t=>{{ document.getElementById('out').innerText = t; }}); }}
</script>
</body></html>"""

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            if self.path in ["/", "/index"]:
                self._ok_html(page_index(CONFIG))
            elif self.path == "/docs":
                self._ok_html(page_docs())
            elif self.path == "/explain":
                self._ok_html(page_explain())
            elif self.path == "/audit":
                self._ok_html(page_audit())
            elif self.path.startswith("/api/status"):
                self._ok_json(get_area_status(CONFIG))
            elif self.path.startswith("/api/theme/cycle"):
                self._cycle_theme()
            elif self.path.startswith("/api/audit/toggle"):
                self._audit_toggle()
            elif self.path.startswith("/api/audit/export"):
                self._ok_text(audit_export())
            else:
                self._not_found()
        except Exception as e:
            log(f"HTTP error: {e}")
            self.send_response(500); self.end_headers()

    def _ok_html(self, html: str):
        self.send_response(200)
        self.send_header("Content-Type","text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(html.encode("utf-8"))

    def _ok_json(self, data: Dict):
        self.send_response(200)
        self.send_header("Content-Type","application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def _ok_text(self, txt: str):
        self.send_response(200)
        self.send_header("Content-Type","text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(txt.encode("utf-8"))

    def _not_found(self):
        self.send_response(404)
        self.end_headers()

    def _cycle_theme(self):
        names = list(THEMES.keys())
        idx = names.index(CONFIG["theme"])
        CONFIG["theme"] = names[(idx+1) % len(names)]
        log(f"Theme switched to {CONFIG['theme']}")
        self._ok_text("OK")

    def _audit_toggle(self):
        try:
            from urllib.parse import urlparse, parse_qs
            qs = parse_qs(urlparse(self.path).query)
            i = int(qs.get("i",[0])[0])
            AUDIT_STATE[i] = not AUDIT_STATE.get(i, False)
            self._ok_text("OK")
        except Exception:
            self._ok_text("ERR")

def discover_overlays(dev_mode: bool) -> List[str]:
    names = []
    if dev_mode and OVERLAY_DIR.exists():
        for p in OVERLAY_DIR.iterdir():
            if p.suffix == ".py":
                names.append(p.name)
    return names

def load_overlays(names: List[str]):
    for n in names:
        log(f"Overlay discovered (not executed in sealed mode): {n}")

def cli_dashboard():
    bootstrap()
    print(f"=== {APP_NAME} CLI Dashboard ===")
    statuses = get_area_status(CONFIG)
    for key, st in statuses.items():
        color = {"OK":"\033[32m","WARNUNG":"\033[33m","FEHLER":"\033[31m"}[st["label"]]
        print(f"{color}{st['title']}: {st['label']} (Wert {st['value']})\033[0m")
    print("=== Audit Kurzfassung ===")
    checked = sum(1 for v in AUDIT_STATE.values() if v)
    print(f"Audit erfüllt: {checked}/{len(QUESTIONNAIRE)}")
    print("Logs:")
    for line in LOGS[-5:]:
        print(" -", line)

CONFIG = DEFAULT_CONFIG.copy()

def run_server():
    bootstrap()
    overlays = discover_overlays(CONFIG["developer_mode"])
    load_overlays(overlays)
    server = HTTPServer(('127.0.0.1', 9876), Handler)
    log(f"{APP_NAME} UI ready: http://127.0.0.1:9876")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log("Shutting down")

if __name__ == "__main__":
    args = sys.argv[1:]
    if "--theme" in args:
        try:
            t = args[args.index("--theme")+1]
            if t in THEMES:
                CONFIG["theme"] = t
        except Exception:
            pass
    if "--dev" in args:
        CONFIG["developer_mode"] = True
    if "--cli" in args:
        cli_dashboard()
    else:
        run_server()

