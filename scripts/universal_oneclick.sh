#!/usr/bin/env bash
set -euo pipefail

echo "==> Universal Weltfabrik: Portal + APIs + Simulation + Audit"

ROOT="$(pwd)"
mkdir -p public/assets public/downloads public/apps \
  functions/api functions/api/universal functions/api/dtn functions/api/audit scripts

# 1) CSS
cat > public/assets/osoto.css <<'CSS'
:root{--bg:#050711;--accent:#39d0ff;--accent2:#ff6bcb;--text:#f5f7ff;--muted:#8c91b2;--pill:999px;--r-lg:18px;--r-md:12px;--s-lg:24px;--glass:rgba(12,16,40,.92)}
*{box-sizing:border-box;margin:0;padding:0} html,body{font-family:system-ui,"Inter","Segoe UI",sans-serif;background:#050608;color:var(--text);line-height:1.6}
.shell{display:grid;grid-template-columns:300px 1fr;grid-template-rows:80px 1fr;grid-template-areas:"topbar topbar" "sidenav main";height:100vh}
.topbar{grid-area:topbar;display:flex;align-items:center;justify-content:space-between;padding:0 var(--s-lg);backdrop-filter:blur(30px);background:linear-gradient(to right,rgba(5,7,17,.98),rgba(10,14,30,.9))}
.logo{font-weight:800;letter-spacing:.14em;text-transform:uppercase;font-size:14px}.brand{color:var(--accent);font-weight:900;margin-right:8px}
.top-right{display:flex;gap:12px;align-items:center}
.btn{border-radius:var(--pill);padding:10px 18px;border:1px solid rgba(255,255,255,.14);background:transparent;color:var(--text);cursor:pointer}
.btn-primary{border-color:transparent;background:linear-gradient(135deg,var(--accent),var(--accent2))}
.sidenav{grid-area:sidenav;padding:var(--s-lg);border-right:1px solid rgba(255,255,255,.08);background:radial-gradient(circle at 0 0,#141b3f 0,#050711 55%,#000 100%)}
.nav{display:flex;flex-direction:column;gap:16px}.nav-label{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted)}
.nav-item{display:flex;gap:10px;padding:10px 12px;border-radius:var(--r-md);color:var(--muted);text-decoration:none}
.nav-item:hover,.nav-item.active{background:linear-gradient(120deg,rgba(57,208,255,.3),rgba(255,107,203,.2));color:var(--text)}
.main{grid-area:main;padding:var(--s-lg);overflow:auto}
.card{padding:16px;border-radius:var(--r-lg);background:var(--glass);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(20px)}
.grid{display:grid;gap:16px} @media(min-width:1100px){.grid-2{grid-template-columns:repeat(2,1fr)}.grid-3{grid-template-columns:repeat(3,1fr)}}
.table{width:100%;border-collapse:collapse}.table th,.table td{padding:8px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left}
.gauge{width:160px;height:160px;border-radius:50%;background:conic-gradient(var(--accent) var(--p),#222 0)}
.muted{color:var(--muted)}
CSS

# 2) Portal
cat > public/index.html <<'HTML'
<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Weltfabrik Universal · Operations</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/assets/osoto.css"><script src="https://cdn.jsdelivr.net/npm/chart.js"></script></head>
<body><div class="shell">
<header class="topbar"><div class="logo"><span class="brand">.WF.</span> Weltfabrik Universal</div>
<div class="top-right"><button class="btn btn-primary" onclick="location.href='/downloads/'">Downloads</button><button class="btn btn-outline" onclick="location.href='/apps/sim.html'">Simulation</button></div></header>
<aside class="sidenav"><nav class="nav"><div class="nav-label">Ebenen</div>
<a href="#planetary" class="nav-item active">Planetar</a><a href="#orbital" class="nav-item">Orbital</a><a href="#interplanetary" class="nav-item">Interplanetar</a><a href="#extragalactic" class="nav-item">Extragalaktisch</a><a href="#audit" class="nav-item">Audit</a></nav></aside>
<main class="main">
<section id="planetary" class="grid grid-2">
  <article class="card"><h2>Planetare Produktion</h2><table class="table" id="table-planet"><thead><tr><th>Cluster</th><th>Output</th><th>QS</th></tr></thead><tbody></tbody></table></article>
  <article class="card"><h2>Kontinentale Last · Pie</h2><canvas id="chart-planet"></canvas></article>
</section>
<section id="orbital" class="grid grid-2">
  <article class="card"><h2>Orbital‑Solarringe</h2><div class="gauge" id="g-orbital" style="--p:64%"></div><p class="muted">Leistungsgrad (Demo)</p></article>
  <article class="card"><h2>DTN‑Fenster</h2><pre id="dtn-orbital" style="max-height:220px;overflow:auto"></pre></article>
</section>
<section id="interplanetary" class="grid grid-2">
  <article class="card"><h2>Interplanetare Knoten</h2><pre id="nodes-inter" style="max-height:220px;overflow:auto"></pre></article>
  <article class="card"><h2>Material‑Kapseln · Säulen</h2><canvas id="chart-capsules"></canvas></article>
</section>
<section id="extragalactic" class="grid grid-2">
  <article class="card"><h2>Extragalaktische Subnetze</h2><pre id="nodes-extra" style="max-height:220px;overflow:auto"></pre></article>
  <article class="card"><h2>Meta‑Governance</h2><pre id="gov-extra" style="max-height:220px;overflow:auto"></pre></article>
</section>
<section id="audit" class="grid grid-2">
  <article class="card"><h2>Audit Events</h2><pre id="audit-out" style="max-height:260px;overflow:auto"></pre></article>
  <article class="card"><h2>Health</h2><pre id="health-out"></pre></article>
</section>
<section class="card"><h2>APIs</h2><ul><li><a href="/api/universal/planet">/api/universal/planet</a></li><li><a href="/api/universal/orbital">/api/universal/orbital</a></li><li><a href="/api/universal/interplanetary">/api/universal/interplanetary</a></li><li><a href="/api/universal/extragalactic">/api/universal/extragalactic</a></li><li><a href="/api/audit/events">/api/audit/events</a></li><li><a href="/api/health">/api/health</a></li></ul></section>
</main></div>
<script>
async function q(u){try{return await fetch(u).then(r=>r.json());}catch{return null}}
(async function init(){
  const planet = await q('/api/universal/planet')||{clusters:[]};
  document.querySelector('#table-planet tbody').innerHTML = planet.clusters.map(c=>`<tr><td>${c.name}</td><td>${c.output}</td><td>${c.qc}</td></tr>`).join('');
  new Chart(document.getElementById('chart-planet'), { type:'pie', data:{ labels: planet.clusters.map(c=>c.name), datasets:[{ data: planet.clusters.map(c=>c.load||0) }] } });
  const dtnO = await q('/api/universal/orbital'); document.getElementById('dtn-orbital').textContent = JSON.stringify(dtnO,null,2);
  const inter = await q('/api/universal/interplanetary'); document.getElementById('nodes-inter').textContent = JSON.stringify(inter,null,2);
  new Chart(document.getElementById('chart-capsules'), { type:'bar', data:{ labels:(inter.capsules||[]).map((_,i)=>i), datasets:[{ data:(inter.capsules||[]).map(c=>c.mass) }] } });
  const extra = await q('/api/universal/extragalactic'); document.getElementById('nodes-extra').textContent = JSON.stringify(extra.nodes,null,2); document.getElementById('gov-extra').textContent = JSON.stringify(extra.governance,null,2);
  const audit = await q('/api/audit/events'); document.getElementById('audit-out').textContent = JSON.stringify(audit,null,2);
  document.getElementById('health-out').textContent = JSON.stringify(await q('/api/health'),null,2);
})();
</script>
</body></html>
HTML

# 3) Simulation App
cat > public/apps/sim.html <<'HTML'
<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Weltfabrik Simulation</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/assets/osoto.css"></head>
<body><div class="shell"><header class="topbar"><div class="logo"><span class="brand">.WF.</span> Simulation</div><div class="top-right"><button class="btn btn-outline" onclick="location.href='/'">Zurück</button></div></header>
<aside class="sidenav"><nav class="nav"><div class="nav-label">Bereiche</div><a href="/" class="nav-item">Portal</a></nav></aside>
<main class="main"><section class="card"><h2>End‑to‑End Lauf</h2><div style="display:flex;gap:8px;margin-top:8px"><button class="btn btn-primary" onclick="run()">Pipeline starten</button><button class="btn btn-outline" onclick="log()">Logs laden</button></div><pre id="out" style="margin-top:12px;max-height:280px;overflow:auto"></pre></section></main></div>
<script>
async function run(){ const j=await fetch('/api/universal/run', { method:'POST' }).then(r=>r.json()); document.getElementById('out').textContent = JSON.stringify(j,null,2); }
async function log(){ const j=await fetch('/api/audit/events').then(r=>r.json()); document.getElementById('out').textContent = JSON.stringify(j,null,2); }
</script></body></html>
HTML

# 4) APIs (Workers Functions)
cat > functions/api/health.js <<'JS'
export async function onRequest(){ return new Response(JSON.stringify({ ok:true, ts:new Date().toISOString() }), { headers:{ "Content-Type":"application/json" }}); }
JS

cat > functions/api/universal/planet.js <<'JS'
export async function onRequest(){
  const clusters = [
    { name:"EU-Continent-West", output:"Polymer modules", qc:"≥99%", load: 32 },
    { name:"AS-Continent-East", output:"Ceramic cores", qc:"≥98%", load: 28 },
    { name:"NA-Continent-North", output:"Metal frames", qc:"≥97%", load: 24 },
    { name:"AF-Continent-Central", output:"Bio composites", qc:"≥96%", load: 16 }
  ];
  return new Response(JSON.stringify({ clusters }), { headers:{ "Content-Type":"application/json" }});
}
JS

cat > functions/api/universal/orbital.js <<'JS'
export async function onRequest(){
  const windows = [
    { slot:"T+00:15", latencyMs: 1200, integrity:"ok" },
    { slot:"T+01:00", latencyMs: 1800, integrity:"ok" },
    { slot:"T+02:30", latencyMs: 2200, integrity:"warn" }
  ];
  return new Response(JSON.stringify({ dtnWindows: windows, solarRingEfficiencyPct: 64 }), { headers:{ "Content-Type":"application/json" }});
}
JS

cat > functions/api/universal/interplanetary.js <<'JS'
export async function onRequest(){
  const nodes = [{ id:"Mars-Node-01"},{ id:"Luna-Node-Alpha"},{ id:"Titan-Node-X"}];
  const capsules = [{ id:"CAP-001", mass: 120 },{ id:"CAP-002", mass: 90 },{ id:"CAP-003", mass: 150 }];
  return new Response(JSON.stringify({ nodes, capsules }), { headers:{ "Content-Type":"application/json" }});
}
JS

cat > functions/api/universal/extragalactic.js <<'JS'
export async function onRequest(){
  const nodes = [{ id:"Andromeda-Subnet-A"},{ id:"Sombrero-Subnet-B"}];
  const governance = { policyId:"WF-GOV-UNIV-001", principles:["Null-Emission","Auditierbarkeit","Resilienz","Autarkie"] };
  return new Response(JSON.stringify({ nodes, governance }), { headers:{ "Content-Type":"application/json" }});
}
JS

cat > functions/api/universal/run.js <<'JS'
export async function onRequest(){
  const trace = [
    { step:1, name:"plan", status:"ok", detail:"manifest.universal → DAG" },
    { step:2, name:"generate", status:"ok", detail:"DSL→Code: robotik/material/qc" },
    { step:3, name:"build", status:"ok", detail:"artefakte+SBOM+checksums" },
    { step:4, name:"test", status:"ok", detail:"quick→unit→integration" },
    { step:5, name:"autofix", status:"ok", detail:"none needed" },
    { step:6, name:"publish", status:"ok", detail:"canary/DTN windows" },
    { step:7, name:"audit", status:"ok", detail:"export evidence pack" }
  ];
  return new Response(JSON.stringify({ ok:true, runId:"RUN-"+Math.random().toString(36).slice(2,8), trace }), { headers:{ "Content-Type":"application/json" }});
}
JS

cat > functions/api/audit/events.js <<'JS'
export async function onRequest(){
  const events = [
    { id:"evt-1", ts:new Date().toISOString(), scope:"planetary", layer:"production", message:"Recipe RCP-742 approved." },
    { id:"evt-2", ts:new Date().toISOString(), scope:"orbital", layer:"energy", message:"Solar ring performance 64%." }
  ];
  return new Response(JSON.stringify(events), { headers:{ "Content-Type":"application/json" }});
}
JS

# 5) Manifest (Single Source of Truth)
cat > manifest.universal.yaml <<'YAML'
project: weltfabrik-universal
version: 1.0.0
layers: [planetary, orbital, interplanetary, extragalactic]
pipelines:
  - name: universal-e2e
    stages: [plan, generate, build, test, autofix, publish, audit]
policies:
  retries: { attempts: 3, backoff: exponential, maxDelayMs: 30000 }
  gates: { requireTestsGreen: true, requireSbom: true }
  dtn: { windows: ["T+00:15","T+01:00","T+02:30"], storeForward: true }
audit:
  evidence: [events, sbom, checksums]
YAML

# 6) Downloads hub
cat > public/downloads/index.html <<'HTML'
<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Downloads · Weltfabrik Universal</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/assets/osoto.css"></head>
<body><div class="shell"><header class="topbar"><div class="logo"><span class="brand">.WF.</span> Downloads</div><div class="top-right"><button class="btn btn-outline" onclick="location.href='/'">Zurück</button></div></header>
<aside class="sidenav"><nav class="nav"><div class="nav-label">Bereiche</div><a href="/" class="nav-item">Portal</a></nav></aside>
<main class="main"><section class="card"><h2>Audit & Bundle</h2><button class="btn btn-primary" onclick="location.href='bundle.zip'">Alles herunterladen</button><h3 style="margin-top:12px">Checksums</h3><pre id="checksums">Lade…</pre></section></main></div>
<script>fetch('checksums.json').then(r=>r.json()).then(j=>{document.getElementById('checksums').textContent=JSON.stringify(j,null,2)}).catch(()=>{document.getElementById('checksums').textContent='checksums.json nicht gefunden'})</script>
</body></html>
HTML

# 7) Wrangler & package.json
cat > wrangler.toml <<'TOML'
name = "weltfabrik-universal"
compatibility_date = "2025-12-06"
[site]
bucket = "./public"
TOML

cat > package.json <<'JSON'
{
  "name": "weltfabrik-universal",
  "private": true,
  "scripts": {
    "dev": "wrangler pages dev ./public",
    "publish": "wrangler pages publish ./public"
  },
  "devDependencies": { "wrangler": "^3.82.0" }
}
JSON

echo "==> Weltfabrik Universal ready."
echo "   1) npm install"
echo "   2) bash scripts/universal_oneclick.sh"
echo "   3) npm run dev"
echo "   4) npm run publish"
