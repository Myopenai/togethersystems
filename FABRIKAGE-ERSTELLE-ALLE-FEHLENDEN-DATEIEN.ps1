# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE - ERSTELLE ALLE FEHLENDEN DATEIEN
# Basisregel der Fabrikage-Standards: Alle dokumentierten fehlenden Dateien erstellen

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE" -ForegroundColor Green
Write-Host "ERSTELLE ALLE FEHLENDEN DATEIEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$ultraDir = Join-Path $rootDir "ultra-banking-suite"

$created = 0
$errors = 0

function Create-File {
    param($Path, $Content, $Description)
    try {
        $fullPath = Join-Path $ultraDir $Path
        $dir = Split-Path $fullPath -Parent
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        [System.IO.File]::WriteAllText($fullPath, $Content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  ✅ Erstellt: $Path" -ForegroundColor Green
        $script:created++
        return $true
    } catch {
        Write-Host "  ❌ Fehler bei $Path : $($_.Exception.Message)" -ForegroundColor Red
        $script:errors++
        return $false
    }
}

Write-Host "[PHASE 1] Erstelle Portal HTML..." -ForegroundColor Cyan

$portalHtml = @'
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Ultra Banking Suite · TogetherSystems</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/osoto.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="logo"><span class="brand">.T.</span> Ultra Banking Suite <span style="color:#39d0ff">StudioLive XXLS</span></div>
      <div class="top-right">
        <button class="btn btn-primary" onclick="location.href='/downloads/'">Downloads</button>
        <button class="btn btn-outline" onclick="location.href='/apps/ocr.html'">OCR</button>
        <button class="btn btn-outline" onclick="location.href='/apps/direct-debit.html'">Direct Debit</button>
      </div>
    </header>
    <aside class="sidenav">
      <nav class="nav">
        <div class="nav-label">Module</div>
        <a href="#dashboard" class="nav-item active">Dashboard</a>
        <a href="#accounts" class="nav-item">Konten</a>
        <a href="#payments" class="nav-item">Zahlungen</a>
        <a href="#vouchers" class="nav-item">Vouchers</a>
        <a href="#transactions" class="nav-item">Transaktionen</a>
        <a href="#markets" class="nav-item">Märkte</a>
        <a href="#analytics" class="nav-item">Analytics</a>
        <a href="#compliance" class="nav-item">Compliance</a>
      </nav>
    </aside>
    <main class="main">
      <section id="dashboard" class="header">
        <div>
          <h1>Bankmanagement-System</h1>
          <p class="muted">Konten, Zahlungen, Vouchers, Märkte, OCR, Analytics — alles in einem Portal.</p>
        </div>
        <div class="clock"><span class="digit" id="clock"></span></div>
      </section>
      <section class="kpi">
        <div class="card"><div class="muted">Gesamtsaldo</div><strong id="kpi-balance">—</strong></div>
        <div class="card"><div class="muted">Offene Zahlungen</div><strong id="kpi-payments">—</strong></div>
        <div class="card"><div class="muted">Vouchers aktiv</div><strong id="kpi-vouchers">—</strong></div>
        <div class="card"><div class="muted">QC‑Passrate</div><strong id="kpi-qc">—</strong></div>
      </section>
      <section id="accounts" class="grid grid-2">
        <article class="card">
          <h2>Kontenübersicht</h2>
          <table class="table" id="accounts-table"><thead><tr><th>ID</th><th>Währung</th><th>Saldo</th></tr></thead><tbody></tbody></table>
        </article>
        <article class="card">
          <h2>Kontensalden · Pie</h2>
          <canvas id="chart-accounts"></canvas>
        </article>
      </section>
      <section id="payments" class="grid grid-2">
        <article class="card">
          <h2>Zahlung erstellen</h2>
          <form onsubmit="return createPayment(event)">
            <input id="pay-source" placeholder="Quelle (acc-..)" required>
            <input id="pay-iban" placeholder="Ziel IBAN" required>
            <input id="pay-amount" type="number" step="0.01" placeholder="Betrag" required>
            <button class="btn btn-primary" type="submit">Senden</button>
          </form>
          <pre id="pay-out" style="margin-top:12px"></pre>
        </article>
        <article class="card">
          <h2>Zahlungsstatus</h2>
          <pre id="payments-list"></pre>
        </article>
      </section>
      <section id="vouchers" class="grid grid-2">
        <article class="card">
          <h2>Voucher ausgeben</h2>
          <form onsubmit="return issueVoucher(event)">
            <input id="v-amount" type="number" step="0.01" placeholder="Amount" required>
            <input id="v-currency" value="EUR" required>
            <button class="btn btn-primary" type="submit">Issue</button>
          </form>
          <pre id="v-out" style="margin-top:12px"></pre>
        </article>
        <article class="card">
          <h2>Voucher redeem</h2>
          <form onsubmit="return redeemVoucher(event)">
            <input id="vr-id" placeholder="Voucher ID" required>
            <input id="vr-amount" type="number" step="0.01" placeholder="Amount" required>
            <button class="btn btn-outline" type="submit">Redeem</button>
          </form>
          <pre id="vr-out" style="margin-top:12px"></pre>
        </article>
      </section>
      <section id="transactions" class="grid grid-2">
        <article class="card">
          <h2>Ledger Events</h2>
          <pre id="tx-list"></pre>
        </article>
        <article class="card">
          <h2>Säulen · Cashflow</h2>
          <canvas id="chart-cashflow"></canvas>
        </article>
      </section>
      <section id="markets" class="grid grid-2">
        <article class="card">
          <h2>Order aufgeben (Sim)</h2>
          <form onsubmit="return placeOrder(event)">
            <input id="m-inst" placeholder="Instrument (e.g. AAPL)" required>
            <input id="m-side" value="buy" required>
            <input id="m-qty" type="number" step="1" placeholder="Menge" required>
            <button class="btn btn-primary" type="submit">Order</button>
          </form>
          <pre id="m-out" style="margin-top:12px"></pre>
        </article>
        <article class="card">
          <h2>Positions · Gauge</h2>
          <div class="gauge" id="gauge" style="--p:75%"></div>
        </article>
      </section>
      <section id="analytics" class="grid grid-2">
        <article class="card">
          <h2>Statistik · Säulen</h2>
          <canvas id="chart-stats"></canvas>
        </article>
        <article class="card">
          <h2>Digitale Uhr</h2>
          <div class="clock"><span class="digit" id="clock2"></span></div>
        </article>
      </section>
      <section id="compliance" class="grid grid-2">
        <article class="card">
          <h2>Audit Events</h2>
          <pre id="audit-out"></pre>
        </article>
        <article class="card">
          <h2>Health</h2>
          <pre id="health-out"></pre>
        </article>
      </section>
      <section class="card">
        <h2>Links</h2>
        <ul class="list">
          <li><a href="/api/accounts">/api/accounts</a></li>
          <li><a href="/api/payments">/api/payments</a></li>
          <li><a href="/api/vouchers/issue">/api/vouchers/issue</a></li>
          <li><a href="/api/transactions">/api/transactions</a></li>
          <li><a href="/api/markets/orders">/api/markets/orders</a></li>
          <li><a href="/apps/ocr.html">OCR Upload</a></li>
          <li><a href="/apps/direct-debit.html">Direct Debit (Wise)</a></li>
        </ul>
      </section>
      <section class="footer">
        <div><span class="brand">.T.</span> TogetherSystems · Ultra Banking Suite</div>
        <div class="muted">Charts · Gauges · Clocks · OCR · Audit · UTF‑8/NFC</div>
      </section>
    </main>
  </div>
  <script>
    function tickClock(id){ const el=document.getElementById(id); setInterval(()=>{ const d=new Date(); el.textContent = d.toLocaleTimeString('de-DE'); },1000); }
    tickClock('clock'); tickClock('clock2');
    async function loadKPIs(){
      try {
        const acc = await fetch('/api/accounts').then(r=>r.json()).catch(()=>[]);
        const bal = acc.reduce((s,a)=> s + (a.balance||0), 0);
        document.getElementById('kpi-balance').textContent = Intl.NumberFormat('de-DE',{ style:'currency', currency:'EUR'}).format(bal);
        document.querySelector('#accounts-table tbody').innerHTML = acc.map(a=>`<tr><td>${a.id}</td><td>${a.currency}</td><td>${a.balance??0}</td></tr>`).join('');
        if (acc.length > 0) {
          new Chart(document.getElementById('chart-accounts'), { type:'pie', data:{ labels: acc.map(a=>a.id), datasets:[{ data: acc.map(a=>a.balance||0), backgroundColor:['#39d0ff','#ff6bcb','#3ecf8e'] }] }, options:{ responsive:true } });
        }
        const v = await fetch('/api/vouchers/list').then(r=>r.json()).catch(()=>[]);
        document.getElementById('kpi-vouchers').textContent = v.length ?? 0;
        const tx = await fetch('/api/transactions').then(r=>r.json()).catch(()=>[]);
        document.getElementById('tx-list').textContent = JSON.stringify(tx,null,2);
        if (tx.length > 0) {
          const cash = tx.map((t,i)=> ({x:i,y:t.amount||0}));
          new Chart(document.getElementById('chart-cashflow'), { type:'bar', data:{ labels: cash.map(c=>c.x), datasets:[{ data: cash.map(c=>c.y), backgroundColor:'#39d0ff' }] }, options:{ responsive:true } });
        }
        const pays = await fetch('/api/payments').then(r=>r.json()).catch(()=>[]);
        document.getElementById('kpi-payments').textContent = pays.length ?? 0;
        document.getElementById('payments-list').textContent = JSON.stringify(pays,null,2);
        new Chart(document.getElementById('chart-stats'), { type:'bar', data:{ labels:['A','B','C','D'], datasets:[{ data:[12,19,7,23], backgroundColor:'#ff6bcb' }] }, options:{ responsive:true } });
        document.getElementById('kpi-qc').textContent = '≥ 95 % (Demo)';
        document.getElementById('health-out').textContent = await fetch('/api/health').then(r=>r.text()).catch(()=> 'offline');
        document.getElementById('audit-out').textContent = JSON.stringify({events:[{ts:new Date().toISOString(),type:'system_init'}]},null,2);
      } catch(e) {
        console.error('[FABRIKAGE] Load KPIs error:', e);
      }
    }
    async function createPayment(e){ e.preventDefault();
      try {
        const p={ source_account: document.getElementById('pay-source').value, target_iban: document.getElementById('pay-iban').value, amount: Number(document.getElementById('pay-amount').value), currency:'EUR' };
        const j = await fetch('/api/payments', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(p) }).then(r=>r.json());
        document.getElementById('pay-out').textContent = JSON.stringify(j,null,2); loadKPIs(); return false;
      } catch(e) {
        document.getElementById('pay-out').textContent = 'Fehler: ' + e.message;
        return false;
      }
    }
    async function issueVoucher(e){ e.preventDefault();
      try {
        const v={ amount: Number(document.getElementById('v-amount').value), currency: document.getElementById('v-currency').value };
        const j = await fetch('/api/vouchers/issue', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(v) }).then(r=>r.json());
        document.getElementById('v-out').textContent = JSON.stringify(j,null,2); loadKPIs(); return false;
      } catch(e) {
        document.getElementById('v-out').textContent = 'Fehler: ' + e.message;
        return false;
      }
    }
    async function redeemVoucher(e){ e.preventDefault();
      try {
        const v={ id: document.getElementById('vr-id').value, amount: Number(document.getElementById('vr-amount').value) };
        const j = await fetch('/api/vouchers/redeem', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(v) }).then(r=>r.json());
        document.getElementById('vr-out').textContent = JSON.stringify(j,null,2); loadKPIs(); return false;
      } catch(e) {
        document.getElementById('vr-out').textContent = 'Fehler: ' + e.message;
        return false;
      }
    }
    async function placeOrder(e){ e.preventDefault();
      try {
        const o={ instrument: document.getElementById('m-inst').value, side: document.getElementById('m-side').value, quantity: Number(document.getElementById('m-qty').value) };
        const j = await fetch('/api/markets/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(o) }).then(r=>r.json());
        document.getElementById('m-out').textContent = JSON.stringify(j,null,2);
        document.getElementById('gauge').style.setProperty('--p', Math.min(100, o.quantity)+'%');
        return false;
      } catch(e) {
        document.getElementById('m-out').textContent = 'Fehler: ' + e.message;
        return false;
      }
    }
    loadKPIs();
  </script>
</body>
</html>
'@

Create-File -Path "public/index.html" -Content $portalHtml -Description "Portal HTML"

Write-Host "[PHASE 2] Erstelle Apps..." -ForegroundColor Cyan

$ocrHtml = @'
<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>OCR Upload</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/assets/osoto.css"><script src="https://unpkg.com/tesseract.js@4.0.2/dist/tesseract.min.js"></script></head>
<body><div class="shell"><header class="topbar"><div class="logo"><span class="brand">.T.</span> OCR</div><div class="top-right"><button class="btn btn-outline" onclick="location.href='/'">Zurück</button></div></header>
<aside class="sidenav"><nav class="nav"><div class="nav-label">Bereiche</div><a href="/" class="nav-item">Portal</a></nav></aside>
<main class="main"><section class="header"><div><h1>Beleg/Foto hochladen</h1><p class="muted">Browser‑OCR + serverseitige Analyse</p></div></section>
<section class="card"><input id="file" type="file" accept="image/*,application/pdf"><div style="margin-top:12px;display:flex;gap:8px"><button class="btn btn-primary" onclick="doUpload()">Upload</button><button class="btn btn-outline" onclick="runOCR()">OCR</button><button class="btn btn-outline" onclick="sendAnalysis()">Analyse</button></div>
<h3 style="margin-top:12px">OCR Text</h3><pre id="ocrText"></pre><h3>Report</h3><pre id="report"></pre></section></main></div>
<script>
let lastText=''; async function doUpload(){const f=document.getElementById('file').files[0]; if(!f){alert('Datei wählen');return;} const fd=new FormData(); fd.append('file',f); const j=await fetch('/api/ocr/upload',{method:'POST',body:fd}).then(r=>r.json()).catch(e=>({error:e.message})); document.getElementById('report').textContent=JSON.stringify(j,null,2);}
async function runOCR(){const f=document.getElementById('file').files[0]; if(!f){alert('Datei wählen');return;} const {createWorker}=Tesseract; const w=await createWorker(); await w.loadLanguage('deu'); await w.initialize('deu'); const img=URL.createObjectURL(f); const {data:{text,confidence}}=await w.recognize(img); await w.terminate(); lastText=text; document.getElementById('ocrText').textContent=text+`\n\n[confidence=${confidence}]`; }
async function sendAnalysis(){ if(!lastText){alert('Erst OCR');return;} const j=await fetch('/api/ocr/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ ocrText:lastText, language:'de', confidence:0.7 })}).then(r=>r.json()).catch(e=>({error:e.message})); document.getElementById('report').textContent=JSON.stringify(j,null,2); }
</script></body></html>
'@

Create-File -Path "public/apps/ocr.html" -Content $ocrHtml -Description "OCR App"

$directDebitHtml = @'
<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>Direct Debit (Wise)</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/assets/osoto.css"></head>
<body><div class="shell"><header class="topbar"><div class="logo"><span class="brand">.T.</span> Direct Debit</div><div class="top-right"><button class="btn btn-outline" onclick="location.href='/'">Zurück</button></div></header>
<aside class="sidenav"><nav class="nav"><div class="nav-label">Bereiche</div><a href="/" class="nav-item">Portal</a></nav></aside>
<main class="main"><section class="header"><div><h1>SEPA Mandat & Abbuchung</h1><p class="muted">Wise‑Integration vorbereitet</p></div></section>
<section class="grid grid-2">
<article class="card"><h2>Mandat anlegen</h2><form onsubmit="return createMandate(event)"><input id="dd-name" placeholder="Name" required><input id="dd-iban" placeholder="IBAN" required><button class="btn btn-primary" type="submit">Anlegen</button></form><pre id="dd-out" style="margin-top:12px"></pre></article>
<article class="card"><h2>Abbuchung</h2><form onsubmit="return createCollection(event)"><input id="dc-mandate" placeholder="Mandat ID" required><input id="dc-amount" type="number" step="0.01" placeholder="Betrag EUR" required><button class="btn btn-outline" type="submit">Abbuchen</button></form><pre id="dc-out" style="margin-top:12px"></pre></article>
</section></main></div>
<script>
async function createMandate(e){e.preventDefault(); try { const j=await fetch('/api/direct-debit/mandates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ debtor_name:document.getElementById('dd-name').value, debtor_iban:document.getElementById('dd-iban').value, scheme:'SEPA_CORE', consent_payload:{ ts:new Date().toISOString() } })}).then(r=>r.json()).catch(e=>({error:e.message})); document.getElementById('dd-out').textContent=JSON.stringify(j,null,2); return false; } catch(e) { document.getElementById('dd-out').textContent='Fehler: '+e.message; return false; }}
async function createCollection(e){e.preventDefault(); try { const j=await fetch('/api/direct-debit/collections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ mandate_id:document.getElementById('dc-mandate').value, amount:Number(document.getElementById('dc-amount').value), currency:'EUR' })}).then(r=>r.json()).catch(e=>({error:e.message})); document.getElementById('dc-out').textContent=JSON.stringify(j,null,2); return false; } catch(e) { document.getElementById('dc-out').textContent='Fehler: '+e.message; return false; }}
</script></body></html>
'@

Create-File -Path "public/apps/direct-debit.html" -Content $directDebitHtml -Description "Direct Debit App"

$downloadsHtml = @'
<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Downloads</title><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/assets/osoto.css"></head>
<body><div class="shell"><header class="topbar"><div class="logo"><span class="brand">.T.</span> Downloads</div><div class="top-right"><button class="btn btn-outline" onclick="location.href='/'">Zurück</button></div></header>
<aside class="sidenav"><nav class="nav"><div class="nav-label">Bereiche</div><a href="/" class="nav-item">Portal</a></nav></aside>
<main class="main"><section class="header"><div><h1>Downloads</h1><p class="muted">Checksums & One‑click bundle</p></div></section>
<section class="card"><button class="btn btn-primary" onclick="location.href='bundle.zip'"><span class="brand">.T.</span> Alles herunterladen</button><h2 style="margin-top:12px">Checksums</h2><pre id="checksums">Lade…</pre></section></main></div>
<script>fetch('checksums.json').then(r=>r.json()).then(j=>{document.getElementById('checksums').textContent=JSON.stringify(j,null,2)}).catch(()=>{document.getElementById('checksums').textContent='checksums.json nicht gefunden'})</script>
</body></html>
'@

Create-File -Path "public/downloads/index.html" -Content $downloadsHtml -Description "Downloads Hub"

Write-Host "[PHASE 3] Erstelle API Functions..." -ForegroundColor Cyan

$healthJs = @'
export async function onRequest() {
  return new Response(JSON.stringify({ ok:true, ts:new Date().toISOString() }), { headers:{ "Content-Type":"application/json" }});
}
'@
Create-File -Path "functions/api/health.js" -Content $healthJs -Description "Health API"

$accountsJs = @'
export async function onRequest(ctx) {
  return new Response(JSON.stringify([
    { id:"acc-001", currency:"EUR", balance: 12500.55 },
    { id:"acc-USD", currency:"USD", balance: 3200.10 },
    { id:"acc-GBP", currency:"GBP", balance: 980.00 }
  ]), { headers:{ "Content-Type":"application/json" }});
}
'@
Create-File -Path "functions/api/accounts/index.js" -Content $accountsJs -Description "Accounts API"

$paymentsJs = @'
export async function onRequest(ctx) {
  if (ctx.request.method === 'GET') {
    return new Response(JSON.stringify([{ id:"pay-demo", status:"pending" }]), { headers:{ "Content-Type":"application/json" }});
  }
  if (ctx.request.method === 'POST') {
    const p = await ctx.request.json();
    return new Response(JSON.stringify({ accepted:true, id:"pay-"+crypto.randomUUID(), status:"pending", payload:p }), { status:202, headers:{ "Content-Type":"application/json" }});
  }
  return new Response(null, { status:405 });
}
'@
Create-File -Path "functions/api/payments/index.js" -Content $paymentsJs -Description "Payments API"

$voucherIssueJs = @'
export async function onRequest(ctx) {
  const v = await ctx.request.json();
  return new Response(JSON.stringify({ id:"v-"+Math.random().toString(36).slice(2,8), amount:v.amount, currency:v.currency, status:"active" }), { status:201, headers:{ "Content-Type":"application/json" }});
}
'@
Create-File -Path "functions/api/vouchers/issue.js" -Content $voucherIssueJs -Description "Voucher Issue API"

$voucherRedeemJs = @'
export async function onRequest(ctx) {
  const b = await ctx.request.json();
  return new Response(JSON.stringify({ id:b.id, redeemed:b.amount, status:"partial" }), { headers:{ "Content-Type":"application/json" }});
}
'@
Create-File -Path "functions/api/vouchers/redeem.js" -Content $voucherRedeemJs -Description "Voucher Redeem API"

$voucherListJs = @'
export async function onRequest() {
  return new Response(JSON.stringify([
    { id:"v-100", amount:50, currency:"EUR", status:"active" },
    { id:"v-101", amount:25, currency:"EUR", status:"redeemed" }
  ]), { headers:{ "Content-Type":"application/json" }});
}
'@
Create-File -Path "functions/api/vouchers/list.js" -Content $voucherListJs -Description "Voucher List API"

$transactionsJs = @'
export async function onRequest() {
  return new Response(JSON.stringify([
    { id:"evt-001", ts:new Date().toISOString(), account_debit:"acc-001", account_credit:"acc-USD", amount:100, currency:"EUR", ref_type:"payment" },
    { id:"evt-002", ts:new Date().toISOString(), account_debit:"acc-GBP", account_credit:"acc-001", amount:50, currency:"GBP", ref_type:"voucher_redemption" }
  ]), { headers:{ "Content-Type":"application/json" }});
}
'@
Create-File -Path "functions/api/transactions/index.js" -Content $transactionsJs -Description "Transactions API"

$marketsOrdersJs = @'
export async function onRequest(ctx) {
  if (ctx.request.method === 'POST') {
    const o = await ctx.request.json();
    return new Response(JSON.stringify({ id:"ord-"+crypto.randomUUID(), status:"new", instrument:o.instrument, side:o.side, qty:o.quantity }), { status:202, headers:{ "Content-Type":"application/json" }});
  }
  return new Response(JSON.stringify([{ id:"ord-demo", status:"filled", instrument:"AAPL" }]), { headers:{ "Content-Type":"application/json" }});
}
'@
Create-File -Path "functions/api/markets/orders/index.js" -Content $marketsOrdersJs -Description "Markets Orders API"

$ocrUploadJs = @'
export const config = { runtime: 'edge' };
export async function onRequest(ctx) {
  const ct = ctx.request.headers.get('content-type')||'';
  if (!ct.includes('multipart/form-data')) return new Response(JSON.stringify({ error:'multipart/form-data required' }), { status:400, headers:{ "Content-Type":"application/json" }});
  const form = await ctx.request.formData(); const file=form.get('file');
  const ab = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest('SHA-256', new Uint8Array(ab));
  const hash = Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  return new Response(JSON.stringify({ ok:true, doc:{ filename:file.name, mime:file.type, hash } }), { headers:{ "Content-Type":"application/json" }});
}
'@
Create-File -Path "functions/api/ocr/upload.js" -Content $ocrUploadJs -Description "OCR Upload API"

$ocrAnalyzeJs = @'
export const config = { runtime: 'edge' };
export async function onRequest(ctx) {
  const { ocrText, language='de', confidence=0.7 } = await ctx.request.json();
  if (!ocrText) return new Response(JSON.stringify({ error:'Missing ocrText' }), { status:400, headers:{ "Content-Type":"application/json" }});
  const totalMatch = ocrText.match(/(summe|total)[:\s]*([0-9.,]+)/i);
  const total = totalMatch ? Number((totalMatch[2]||'').replace(/\./g,'').replace(',','.')) : null;
  const fields = { total, currency:(ocrText.match(/EUR|€|USD|\$/i)?.[0]||'EUR'), merchant:(ocrText.match(/REWE|ALDI|LIDL|SPAR|COOP/i)?.[0]||'UNKNOWN') };
  const decision = { score: Math.round(((total||0)*0.3) + 42), quality: confidence>=0.6?'ok':'poor' };
  return new Response(JSON.stringify({ ok:true, language, confidence, extraction:fields, decision }), { headers:{ "Content-Type":"application/json" }});
}
'@
Create-File -Path "functions/api/ocr/analyze.js" -Content $ocrAnalyzeJs -Description "OCR Analyze API"

$ddMandatesJs = @'
export async function onRequest(ctx) {
  if (ctx.request.method==='POST') {
    const b = await ctx.request.json();
    const rec = { id:"mand-"+crypto.randomUUID(), provider:"wise", debtor_name:b.debtor_name, debtor_iban:b.debtor_iban, scheme:b.scheme||"SEPA_CORE", status:"pending", signed_at:new Date().toISOString(), consent_payload:b.consent_payload };
    return new Response(JSON.stringify({ ok:true, mandate:rec }), { status:201, headers:{ "Content-Type":"application/json" }});
  }
  return new Response(null, { status:405 });
}
'@
Create-File -Path "functions/api/direct-debit/mandates/index.js" -Content $ddMandatesJs -Description "Direct Debit Mandates API"

$ddCollectionsJs = @'
export async function onRequest(ctx) {
  if (ctx.request.method==='POST') {
    const b = await ctx.request.json();
    const coll = { id:"coll-"+crypto.randomUUID(), mandate_id:b.mandate_id, amount:b.amount, currency:b.currency||"EUR", scheduled_at:b.scheduled_at||new Date().toISOString(), status:"pending" };
    return new Response(JSON.stringify({ ok:true, collection:coll }), { status:202, headers:{ "Content-Type":"application/json" }});
  }
  return new Response(null, { status:405 });
}
'@
Create-File -Path "functions/api/direct-debit/collections/index.js" -Content $ddCollectionsJs -Description "Direct Debit Collections API"

Write-Host "[PHASE 4] Erstelle Konfigurationsdateien..." -ForegroundColor Cyan

$wranglerToml = @'
name = "ultra-banking-suite"
compatibility_date = "2025-12-06"

[site]
bucket = "./public"
'@
Create-File -Path "wrangler.toml" -Content $wranglerToml -Description "Wrangler Config"

$packageJson = @'
{
  "name": "ultra-banking-suite",
  "private": true,
  "scripts": {
    "dev": "wrangler pages dev ./public",
    "publish": "wrangler pages publish ./public"
  },
  "devDependencies": {
    "wrangler": "^3.82.0"
  }
}
'@
Create-File -Path "package.json" -Content $packageJson -Description "Package JSON"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE - ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ ERSTELLT: $created Dateien" -ForegroundColor Green
Write-Host "❌ FEHLER: $errors" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "🎯 ALLE FEHLENDEN DATEIEN ERSTELLT (Fabrikage-Standard)" -ForegroundColor Green
Write-Host ""
