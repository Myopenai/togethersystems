#!/usr/bin/env bash
# [.SYSTEMS.T.SYSTEMS.] One-Click Canvas: Complete Plug-and-Play Code Bundle
# Portal + APIs + Robotics Pipeline Simulation

set -euo pipefail

echo "==> One-click: TogetherSystems portal + APIs + Robotics pipeline (simulation) + downloads + publish prep"
ROOT="$(pwd)"

mkdir -p public/assets public/downloads functions/api/voucher functions/api/presence functions/api/robotics scripts

# 1) CSS (StudioLive XXLS)
cat > public/assets/osoto.css <<'CSS'
:root{
  --bg:#050711; --bg2:#0a0e1e; --accent:#39d0ff; --accent2:#ff6bcb; --text:#f5f7ff; --muted:#8c91b2;
  --pill:999px; --r-lg:18px; --r-md:12px; --s-md:16px; --s-lg:24px; --s-xl:32px; --shadow:0 32px 80px rgba(0,0,0,.85);
  --glass:rgba(12,16,40,.92);
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:system-ui,"Inter","Segoe UI",sans-serif;background:#050608;color:var(--text);line-height:1.6}
body{display:flex;flex-direction:column;min-height:100vh}
a{color:var(--accent);text-decoration:none} a:hover{text-decoration:underline}
.shell{display:grid;grid-template-columns:280px 1fr;grid-template-rows:80px 1fr;grid-template-areas:"topbar topbar" "sidenav main";height:100vh}
.topbar{grid-area:topbar;display:flex;align-items:center;justify-content:space-between;padding:0 var(--s-xl);
  backdrop-filter:blur(30px);background:linear-gradient(to right,rgba(5,7,17,.98),rgba(10,14,30,.9));box-shadow:0 1px 0 rgba(255,255,255,.06)}
.logo{font-weight:800;letter-spacing:.14em;text-transform:uppercase;font-size:14px}
.brand{color:var(--accent);font-weight:900;margin-right:8px}
.top-right{display:flex;gap:12px;align-items:center}
.btn{border-radius:var(--pill);padding:10px 18px;border:1px solid rgba(255,255,255,.14);background:transparent;color:var(--text);cursor:pointer}
.btn-primary{border-color:transparent;background:linear-gradient(135deg,var(--accent),var(--accent2));box-shadow:var(--shadow)}
.btn-outline:hover{border-color:var(--accent)}
.sidenav{grid-area:sidenav;padding:var(--s-lg);border-right:1px solid rgba(255,255,255,.08);background:radial-gradient(circle at 0 0,#141b3f 0,#050711 55%,#000 100%)}
.nav{display:flex;flex-direction:column;gap:var(--s-lg)}
.nav-label{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted)}
.nav-item{display:flex;gap:10px;padding:10px 12px;border-radius:var(--r-md);color:var(--muted);text-decoration:none}
.nav-item:hover,.nav-item.active{background:linear-gradient(120deg,rgba(57,208,255,.3),rgba(255,107,203,.2));color:var(--text)}
.main{grid-area:main;padding:var(--s-xl);overflow:auto}
.header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:var(--s-xl)}
.kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--s-lg);margin-bottom:var(--s-xl)}
.card{padding:var(--s-lg);border-radius:var(--r-lg);background:var(--glass);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(20px);position:relative}
.card::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at top right,rgba(57,208,255,.2),transparent 60%);mix-blend-mode:screen;opacity:.6;pointer-events:none}
.grid{display:grid;gap:var(--s-lg)}
@media(min-width:900px){.grid-2{grid-template-columns:repeat(2,1fr)}.grid-3{grid-template-columns:repeat(3,1fr)}}
.list{list-style:none;margin:0;padding:0}
.list li{margin:6px 0;color:var(--muted)}
.section h2{margin:0 0 12px 0;font-size:18px}
.muted{color:var(--muted)}
pre,code{font-family:"JetBrains Mono",ui-monospace,Menlo,monospace}
.footer{margin-top:var(--s-xl);padding:var(--s-lg);border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;color:var(--muted)}
.pill{display:inline-flex;align-items:center;border-radius:var(--pill);padding:4px 10px;font-size:12px;letter-spacing:.09em;border:1px solid #374151;color:var(--muted)}
CSS

# 2) Portal HTML (StudioLive XXLS), concept + robotics pipeline demo
cat > public/index.html <<'HTML'
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>TogetherSystems – Portal (StudioLive XXLS)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Language" content="de">
  <link rel="stylesheet" href="/assets/osoto.css">
  <script>
    const BASE_URL = window.location.origin || 'https://myopenai.github.io/togethersystems';
  </script>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="logo"><span class="brand">.T.</span> TogetherSystems <span style="color:#39d0ff">StudioLive XXLS</span></div>
      <div class="top-right">
        <button class="btn btn-primary" onclick="location.hash='#konzept'"><span class="brand">.T.</span> Konzept</button>
        <button class="btn btn-outline" onclick="location.href='/manifest-portal.html'">Manifest</button>
        <button class="btn btn-outline" onclick="location.href='/downloads/'">Downloads</button>
      </div>
    </header>
    <aside class="sidenav">
      <nav class="nav">
        <div class="nav-label">Portal</div>
        <a href="#dashboard" class="nav-item active">Dashboard</a>
        <a href="#robotics" class="nav-item">Robotik & 3D‑Printer</a>
        <a href="#finanzierung" class="nav-item">Finanzierung (EU)</a>
        <a href="#radboud" class="nav-item">Radboud Universität</a>
      </nav>
    </aside>
    <main class="main">
      <section id="dashboard" class="header">
        <div>
          <h1>Softwarefabrik + Mikro‑Fabrik</h1>
          <p class="muted">Maxi‑Qualität, auditierbar, modular, global.</p>
        </div>
      </section>
      <section class="kpi">
        <div class="card"><div class="muted">Aktive Mikro‑Fabriken</div><strong id="kpi-factories">—</strong></div>
        <div class="card"><div class="muted">Verifizierte Materialmixes</div><strong id="kpi-materials">—</strong></div>
        <div class="card"><div class="muted">QC‑Passrate</div><strong id="kpi-qc">—</strong></div>
      </section>
      <section id="robotics" class="grid grid-2">
        <article class="card section">
          <h2>Robotik‑Pipeline (Simulation)</h2>
          <p>Startet einen simulierten Auftrag: Materialannahme → Mix → Druckprofil → 3D‑Druckjob → QC.</p>
          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="startPipeline()">Pipeline starten</button>
            <button class="btn btn-outline" onclick="fetchJobLog()">Job‑Log laden</button>
          </div>
          <pre id="pipeline-log" style="margin-top:12px;max-height:240px;overflow:auto;background:rgba(0,0,0,.3);padding:12px;border-radius:8px;font-size:11px"></pre>
        </article>
        <article class="card section">
          <h2>APIs & Status</h2>
          <p><a href="/api/voucher/list">Voucher‑Liste (Cloudflare Functions)</a></p>
          <p><a href="/api/presence/status">Presence‑Status</a></p>
          <p><a href="/api/robotics/jobs">Robotik‑Jobs</a></p>
          <p><a href="/downloads/">Downloads (Checksums & Bundle)</a></p>
          <p><a href="https://myopenai.github.io/togethersystems/manifest-portal.html" target="_blank">Extern: Manifest‑Portal</a></p>
          <p><a href="https://github.com/Myopenai/startupsystems" target="_blank">Repo: startupsystems</a></p>
        </article>
      </section>
      <section id="finanzierung" class="grid grid-2">
        <article class="card section">
          <h2>EU‑Finanzierung – Startpunkte</h2>
          <ul class="list">
            <li>Nachhaltigkeit, Kreislaufwirtschaft, Digitalisierung, KMU‑Innovationen</li>
            <li>Audit‑Reporting, KPI‑Nachweise, maschinische Stempelung</li>
            <li>Cluster/Regionale Partnerschaften (z. B. Gelderland/Nijmegen)</li>
          </ul>
          <p style="margin-top:8px"><a href="https://europa.eu" target="_blank">EU‑Portal</a></p>
        </article>
        <article class="card section">
          <h2>Business‑Mechanik</h2>
          <ul class="list">
            <li>0,30 € Vergütung je Materialeinheit/Flasche</li>
            <li>Preis = Herstellung + Umweltbeitrag (0,30 €) + bis 30 % Wertaufschlag</li>
            <li>Abrechnung pro Maschinenstunde & Bits & Bytes</li>
          </ul>
        </article>
      </section>
      <section id="radboud" class="grid grid-2">
        <article class="card section">
          <h2>Radboud Universität – Einladung</h2>
          <ul class="list">
            <li>Räume für Pilot‑Mikro‑Fabriken</li>
            <li>Begleitung von Prüfprojekten & Gründungen</li>
            <li>Ko‑Design Materialtests, Robotiksteuerung, Wirtschaftlichkeit</li>
          </ul>
          <p style="margin-top:8px"><a href="https://www.ru.nl" target="_blank">Radboud Universität</a></p>
        </article>
        <article class="card section">
          <h2>Globales Maschinennetz</h2>
          <p>Weltweite, modulare Mikro‑Fabriken als verteiltes Produktionssystem mit Recycling als Kernprinzip.</p>
        </article>
      </section>
      <section class="footer">
        <div><span class="brand">.T.</span> TogetherSystems · StudioLive XXLS</div>
        <div class="muted">Auditierbar · Modular · Anonym nutzbar · UTF‑8/NFC</div>
      </section>
    </main>
  </div>
  <script>
    async function set(id,val){const el=document.getElementById(id); if(el) el.textContent=val;}
    async function loadKPIs(){
      try{ const p=await fetch('/api/presence/status').then(r=>r.json()); set('kpi-factories', 1+(p.users%20)); }catch{ set('kpi-factories','offline'); }
      try{ const v=await fetch('/api/voucher/list').then(r=>r.json()); set('kpi-materials', v.length); }catch{ set('kpi-materials','offline'); }
      set('kpi-qc','≥ 95 % (Demo)');
    }
    loadKPIs();
    async function startPipeline(){
      try {
        const res = await fetch('/api/robotics/start', { method:'POST' });
        const j = await res.json();
        const log = document.getElementById('pipeline-log');
        log.textContent = JSON.stringify(j, null, 2);
        console.log('[FABRIKAGE] Pipeline gestartet:', j.jobId);
      } catch(e) {
        console.error('[FABRIKAGE] Pipeline-Fehler:', e);
        document.getElementById('pipeline-log').textContent = 'Fehler: ' + e.message;
      }
    }
    async function fetchJobLog(){
      try {
        const res = await fetch('/api/robotics/jobs');
        const j = await res.json();
        const log = document.getElementById('pipeline-log');
        log.textContent = JSON.stringify(j, null, 2);
        console.log('[FABRIKAGE] Job-Log geladen');
      } catch(e) {
        console.error('[FABRIKAGE] Job-Log-Fehler:', e);
        document.getElementById('pipeline-log').textContent = 'Fehler: ' + e.message;
      }
    }
    console.log('[FABRIKAGE] StudioLive XXLS Portal geladen');
    console.log('[FABRIKAGE] BASE_URL:', BASE_URL);
  </script>
</body>
</html>
HTML

# 3) Manifest page
cat > public/manifest-portal.html <<'HTML'
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Manifest of Thinkers – Portal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/osoto.css">
  <script>
    const BASE_URL = window.location.origin || 'https://myopenai.github.io/togethersystems';
  </script>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="logo"><span class="brand">.T.</span> Manifest<span style="color:#39d0ff">PORTAL</span></div>
      <div class="top-right"><button class="btn btn-outline" onclick="location.href='/'">Zurück</button></div>
    </header>
    <aside class="sidenav"><nav class="nav"><div class="nav-label">System</div><a href="/" class="nav-item">Dashboard</a><a href="/downloads/" class="nav-item">Downloads</a></nav></aside>
    <main class="main">
      <section class="header"><div><h1>Manifest Portal</h1><p class="muted">Voucher & Presence APIs live auf Cloudflare.</p></div></section>
      <section class="grid grid-2">
        <article class="card section">
          <h2>Voucher laden</h2>
          <button class="btn btn-primary" onclick="loadVouchers()">Voucher laden</button>
          <pre id="voucher-output" style="margin-top:12px;max-height:240px;overflow:auto;background:rgba(0,0,0,.3);padding:12px;border-radius:8px;font-size:11px"></pre>
        </article>
        <article class="card section">
          <h2>Presence prüfen</h2>
          <button class="btn btn-outline" onclick="loadPresence()">Presence prüfen</button>
          <pre id="presence-output" style="margin-top:12px;max-height:240px;overflow:auto;background:rgba(0,0,0,.3);padding:12px;border-radius:8px;font-size:11px"></pre>
        </article>
      </section>
    </main>
  </div>
  <script>
    async function loadVouchers(){ try { const res=await fetch('/api/voucher/list'); const j=await res.json(); document.getElementById('voucher-output').textContent=JSON.stringify(j,null,2); console.log('[FABRIKAGE] Vouchers geladen'); } catch(e) { console.error('[FABRIKAGE] Voucher-Fehler:', e); } }
    async function loadPresence(){ try { const res=await fetch('/api/presence/status'); const j=await res.json(); document.getElementById('presence-output').textContent=JSON.stringify(j,null,2); console.log('[FABRIKAGE] Presence geladen'); } catch(e) { console.error('[FABRIKAGE] Presence-Fehler:', e); } }
    console.log('[FABRIKAGE] Manifest Portal geladen');
    console.log('[FABRIKAGE] BASE_URL:', BASE_URL);
  </script>
</body>
</html>
HTML

# 4) Downloads seed + index
cat > public/downloads/README.txt <<'TXT'
OSOTODOS Downloads — Place your build artifacts here.
This directory will be published by Cloudflare Pages.
TXT

cat > public/downloads/sample.txt <<'TXT'
Beispiel — Umlaute geprüft: ÄÖÜ äöü ß. NFC-normalisiert.
TXT

cat > public/downloads/index.html <<'HTML'
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Downloads – TogetherSystems</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/osoto.css">
  <script>
    const BASE_URL = window.location.origin || 'https://myopenai.github.io/togethersystems';
  </script>
</head>
<body>
  <div class="shell">
    <header class="topbar"><div class="logo"><span class="brand">.T.</span> TogetherSystems <span style="color:#39d0ff">Downloads</span></div><div class="top-right"><button class="btn btn-outline" onclick="location.href='/'">Zurück</button></div></header>
    <aside class="sidenav"><nav class="nav"><div class="nav-label">Bereiche</div><a href="/" class="nav-item">Portal</a><a href="/manifest-portal.html" class="nav-item">Manifest</a></nav></aside>
    <main class="main">
      <section class="header"><div><h1>Downloads</h1><p class="muted">Checksums & One‑click bundle.</p></div></section>
      <section class="card">
        <button class="btn btn-primary" onclick="location.href='bundle.zip'"><span class="brand">.T.</span> Alles herunterladen</button>
        <h2 style="margin-top:12px">Checksums</h2>
        <pre id="checksums" style="margin-top:12px;max-height:260px;overflow:auto;background:rgba(0,0,0,.3);padding:12px;border-radius:8px;font-size:11px">Lade…</pre>
      </section>
    </main>
  </div>
  <script>
    try {
      fetch('checksums.json').then(r=>r.json()).then(j=>{
        document.getElementById('checksums').textContent = JSON.stringify(j,null,2);
        console.log('[FABRIKAGE] Checksums geladen');
      }).catch(()=>{ document.getElementById('checksums').textContent = 'checksums.json nicht gefunden'; });
    } catch(e) {
      console.error('[FABRIKAGE] Checksums-Fehler:', e);
    }
    console.log('[FABRIKAGE] Downloads geladen');
    console.log('[FABRIKAGE] BASE_URL:', BASE_URL);
  </script>
</body>
</html>
HTML

# 5) Cloudflare Pages Functions – Voucher/Presence
cat > functions/api/voucher/list.js <<'JS'
export async function onRequest(context) {
  return new Response(JSON.stringify([
    { id: "v-100", amount: 5000, redeemed: 1200, status: "active" },
    { id: "v-101", amount: 2500, redeemed: 2500, status: "redeemed" }
  ]), { headers: { "Content-Type": "application/json; charset=utf-8" }});
}
JS

cat > functions/api/voucher/redeem.js <<'JS'
export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const id = searchParams.get("id");
  return new Response(JSON.stringify({ ok: true, id, redeemed: true }), { headers: { "Content-Type": "application/json; charset=utf-8" }});
}
JS

cat > functions/api/presence/status.js <<'JS'
export async function onRequest(context) {
  return new Response(JSON.stringify({ online: true, users: 42, ts: new Date().toISOString() }), { headers: { "Content-Type": "application/json; charset=utf-8" }});
}
JS

# 6) Cloudflare Pages Functions – Robotics pipeline (simulation)
cat > functions/api/robotics/start.js <<'JS'
/**
 * Simulated pipeline: material intake → mix → print profile → 3D print job → QC
 * Returns a job id and a step-by-step trace.
 */
export async function onRequest(context) {
  const jobId = "job-" + Math.random().toString(36).slice(2, 8);
  const trace = [
    { step: 1, name: "material_intake", status: "ok", detail: "Scanner: PET+PP detected; volume 0.8l" },
    { step: 2, name: "mix_compute", status: "ok", detail: "Safe low-temp mix computed; no chemical change" },
    { step: 3, name: "print_profile", status: "ok", detail: "Layer 0.25mm; nozzle 0.4mm; temp <= critical threshold" },
    { step: 4, name: "job_enqueue", status: "ok", detail: "3D-printer job queued; robot feeder engaged" },
    { step: 5, name: "qc_plan", status: "ok", detail: "Dimensional checks; surface; stress sample; emissions monitor" }
  ];
  return new Response(JSON.stringify({ jobId, trace }), { headers: { "Content-Type": "application/json; charset=utf-8" }});
}
JS

cat > functions/api/robotics/jobs.js <<'JS'
/**
 * Returns demo jobs (stateless preview). For persistence, wire KV/D1/Durable Objects.
 */
export async function onRequest(context) {
  const sample = [
    { jobId: "job-demo-001", status: "queued", printer: "P-01", startedAt: null },
    { jobId: "job-demo-002", status: "printing", printer: "P-02", startedAt: new Date().toISOString() }
  ];
  return new Response(JSON.stringify(sample), { headers: { "Content-Type": "application/json; charset=utf-8" }});
}
JS

# 7) Wrangler config + package.json
cat > wrangler.toml <<'TOML'
name = "togethersystems"
compatibility_date = "2025-12-06"
[site]
bucket = "./public"
TOML

cat > package.json <<'JSON'
{
  "name": "togethersystems",
  "private": true,
  "scripts": {
    "dev": "wrangler pages dev ./public",
    "publish": "wrangler pages publish ./public"
  },
  "devDependencies": {
    "wrangler": "^3.82.0"
  }
}
JSON

# 8) NFC normalize (UTF-8 umlauts across files)
node -e "
const fs=require('fs'),p=require('path');
function norm(f){const t=fs.readFileSync(f,'utf8').normalize('NFC');fs.writeFileSync(f,t,'utf8');}
function walk(d){for(const f of fs.readdirSync(d)){const x=p.join(d,f);const s=fs.statSync(x);if(s.isDirectory())walk(x);else if(/\.(html|css|js|json|txt|toml)$/i.test(f))norm(x);}}
walk('public'); walk('functions'); walk('.');
console.log('NFC normalization complete.');
"

# 9) Generate checksums and bundle.zip (downloads)
echo "==> Generating checksums and bundle zip"
cd public/downloads
python3 - <<'PY' || node -e "
const fs=require('fs'),crypto=require('crypto');
const files=fs.readdirSync('.').filter(f=>fs.statSync(f).isFile());
const data={};
files.forEach(f=>{
  const hash=crypto.createHash('sha256');
  hash.update(fs.readFileSync(f));
  data[f]=hash.digest('hex');
});
fs.writeFileSync('checksums.json',JSON.stringify(data,null,2),'utf8');
console.log('checksums.json written');
" || true
PY

rm -f bundle.zip
zip -qr bundle.zip . || true
cd "$ROOT"

echo
echo "==> Ready."
echo "   1) npm install"
echo "   2) bash scripts/oneclick.sh"
echo "   3) npm run dev   (local Pages dev with Functions)"
echo "   4) npm run publish (deploy to Cloudflare Pages)"
echo "Visit: /index.html, /manifest-portal.html, /downloads/, /api/*"
