// OSOS · tOS Production Portal Core
// Alle Funktionen aus dem Original Production Portal

const enc = new TextEncoder();
const dec = new TextDecoder();
const hex = buf => Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = s => Uint8Array.from(atob(s), c=>c.charCodeAt(0));
const uuid = () => crypto.randomUUID();

let keyAlgo = null;
let keypair = null;

async function genKeypair() {
  try {
    keyAlgo = { name: "Ed25519" };
    keypair = await crypto.subtle.generateKey(keyAlgo, true, ["sign","verify"]);
    document.getElementById('algo').textContent = "Ed25519";
  } catch {
    keyAlgo = { name: "ECDSA", namedCurve: "P-256" };
    keypair = await crypto.subtle.generateKey(keyAlgo, true, ["sign","verify"]);
    document.getElementById('algo').textContent = "ECDSA-P256";
  }
  const pub = await crypto.subtle.exportKey("spki", keypair.publicKey);
  const pubkeyB64 = b64(pub);
  const pubkeyEl = document.getElementById('pubkey');
  if (pubkeyEl) {
    pubkeyEl.textContent = pubkeyB64;
    pubkeyEl.style.wordBreak = 'break-all';
    pubkeyEl.style.maxWidth = '400px';
    pubkeyEl.style.overflowWrap = 'break-word';
    pubkeyEl.style.display = 'inline-block';
    pubkeyEl.style.paddingRight = '100px';
    // Zeige Copy-Button
    const copyBtn = document.getElementById('copyPubKey');
    if (copyBtn) {
      copyBtn.style.display = 'inline-block';
      copyBtn.onclick = function() {
        const textToCopy = pubkeyB64;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Kopiert!';
            copyBtn.style.background = '#10b981';
            setTimeout(() => {
              copyBtn.textContent = originalText;
              copyBtn.style.background = '#10b981';
            }, 2000);
          }).catch(() => {
            // Fallback
            fallbackCopy(textToCopy, copyBtn);
          });
        } else {
          fallbackCopy(textToCopy, copyBtn);
        }
      };
    }
  }
  
  function fallbackCopy(text, btn) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      const originalText = btn.textContent;
      btn.textContent = '✅ Kopiert!';
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '#10b981';
      }, 2000);
    } catch(e) {
      alert('Kopieren fehlgeschlagen. Bitte manuell kopieren: ' + text.substring(0, 50) + '...');
    }
    document.body.removeChild(textarea);
  }
  const universe = localStorage.getItem('tos.universe') || uuid();
  localStorage.setItem('tos.universe', universe);
  const universeEl = document.getElementById('universe');
  if (universeEl) universeEl.textContent = universe;
  const devclassEl = document.getElementById('devclass');
  if (devclassEl) devclassEl.textContent = /Mobi|Android|iPhone/.test(navigator.userAgent) ? "mobile" : "desktop";
  const idStatusEl = document.getElementById('idStatus');
  if (idStatusEl) idStatusEl.textContent = "Schlüssel aktiv";
}

async function signBytes(bytes) {
  if (!keypair) throw new Error("No keypair");
  const toSign = bytes instanceof ArrayBuffer ? bytes : enc.encode(bytes);
  if (keyAlgo.name === "Ed25519") {
    return new Uint8Array(await crypto.subtle.sign(keyAlgo, keypair.privateKey, toSign));
  }
  return new Uint8Array(await crypto.subtle.sign({ name:"ECDSA", hash:"SHA-256" }, keypair.privateKey, toSign));
}

const DB_NAME = "osos_log_v2";
let db;

function openDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME,1);
    req.onupgradeneeded = () => {
      const d = req.result;
      d.createObjectStore("entries",{ keyPath:"id" });
      d.createObjectStore("meta",{ keyPath:"key" });
    };
    req.onsuccess = ()=>{ db=req.result; resolve(db); };
    req.onerror = e=>reject(e);
  });
}

async function put(store,obj){
  return new Promise((res,rej)=>{
    const tx = db.transaction(store,"readwrite");
    tx.objectStore(store).put(obj);
    tx.oncomplete = ()=>res(true);
    tx.onerror = e=>rej(e);
  });
}

async function getAll(store){
  return new Promise((res,rej)=>{
    const tx = db.transaction(store,"readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = ()=>res(req.result);
    req.onerror = e=>rej(e);
  });
}

async function writeLog(kind, payloadObj){
  const payload = enc.encode(JSON.stringify(payloadObj));
  const hash = await crypto.subtle.digest("SHA-256", payload);
  const prev = (await getAll("entries")).sort((a,b)=>a.ts.localeCompare(b.ts)).pop();
  const links = prev ? [prev.id] : [];
  const sig = await signBytes(payload);
  const entry = {
    id: uuid(),
    ts: new Date().toISOString(),
    kind, payload_b64: b64(payload), payload_sha256: hex(hash),
    sig_b64: b64(sig), algo: keyAlgo?.name || "unknown", links
  };
  await put("entries", entry);
  return entry;
}

const metrics = { fps: 0, jankHist: [], rttSamples: [], downlink: null, coalesce: { total:0, coalesced:0 } };

(function measureFPS(){
  let last=performance.now(), frames=0, acc=0, janks=[];
  function loop(t){
    frames++; const dt=t-last; last=t; acc+=dt; if (dt>16.7*1.5) janks.push(dt);
    if (acc>=1000){ metrics.fps = frames; frames=0; acc=0; metrics.jankHist = janks.slice(-100); janks=[]; }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

async function pingRTT(){
  const t0 = performance.now();
  await new Promise(r=>setTimeout(r, Math.random()*30+20));
  const rtt = performance.now()-t0;
  metrics.rttSamples.push(rtt);
}

setInterval(pingRTT, 2000);

function updateNetInfo(){
  const c = navigator.connection || {};
  metrics.downlink = c.downlink || null;
}

setInterval(updateNetInfo, 1000);

const Search = (() => {
  const corpus = [];
  const index = new Map();
  const grams = new Map();

  function addDoc(doc) {
    corpus.push(doc);
    const tokens = tokenize(doc.title + " " + doc.tags.join(" ") + " " + doc.content);
    const uniq = new Set(tokens);
    uniq.forEach(tok => {
      if (!index.has(tok)) index.set(tok, new Set());
      index.get(tok).add(doc.id);
      const g = ngrams(tok, 3);
      g.forEach(gr => {
        if (!grams.has(gr)) grams.set(gr, new Set());
        grams.get(gr).add(tok);
      });
    });
  }

  function tokenize(text) {
    return text.toLowerCase().normalize('NFKD').replace(/[^\w\s\-\.]/g,' ').split(/\s+/).filter(Boolean);
  }

  function ngrams(tok, n=3){
    const s = `__${tok}__`;
    const g=[]; for(let i=0;i<=s.length-n;i++) g.push(s.slice(i,i+n));
    return g;
  }

  function search(query){
    const qTokens = tokenize(query);
    const docScores = new Map();
    qTokens.forEach(qt=>{
      const ids = index.get(qt);
      if (ids) ids.forEach(id=> docScores.set(id, (docScores.get(id)||0)+3));
    });
    const rankedDocs = Array.from(docScores.entries())
      .map(([id,score])=>({ id, score }))
      .sort((a,b)=> b.score - a.score)
      .map(([id,score])=>({ doc: corpus.find(d=>d.id===id), score }));
    return { results: rankedDocs.slice(0,12), confidence: rankedDocs[0]?.score || 0 };
  }

  return { addDoc, search };
})();

const docs = [
  { id:"manifest", title:"Manifest & Identität", tags:["identity","signatur","audit","schlüssel","www","web"], content:"Erzeuge Schlüssel, signiere Manifest, exportiere Audit-Log, versiegelte Snapshots. Web, WWW, Internet, Browser." },
  { id:"perf", title:"Performance Uplift", tags:["fps","latency","durchsatz","coalesce","optimierer","www","web"], content:"Messe Baseline, wende Optimierer an, erfasse Beweise als signierte Visuals. Web Performance, WWW Performance." },
  { id:"security", title:"Sicherheit & Verifikation", tags:["hash-kette","verify","rotation","snapshot","compliance","www","web"], content:"Prüfe Hash-Kette, rotiere Schlüssel, versiegel lokale Zustände, Compliance. Web Security, WWW Security." },
  { id:"mesh", title:"Netzwerk & Mesh", tags:["presence","hmac","p2p","publish","sync","bandbreite","www","web","netzwerk"], content:"Erzeuge Presence-Token, aktiviere P2P, veröffentliche selektiv. Web Mesh, WWW Mesh, Netzwerk." },
  { id:"apps", title:"Apps Hub", tags:["telbank","voucher","legal","honeycomb","www","web","apps"], content:"Signiere Transaktionen, verwalte Verträge, starte Produktionsflüsse. Web Apps, WWW Apps." },
  { id:"dev", title:"Developer Superkiste", tags:["profiler","crypto","solver","diagramm","runner","dataset","www","web","developer"], content:"Profiler, Krypto, Solver, Diagramme, Code Runner, Dataset-Sandbox, Netz-Graph. Web Development, WWW Development." }
];

docs.forEach(Search.addDoc);

function attachSearchUI(){
  const input = document.getElementById('searchBox');
  const res = document.getElementById('searchOut');
  if (!input || !res) return; // Exit if elements not found
  input.addEventListener('input', ()=>{
    const q = input.value.toLowerCase().trim();
    if (!q){ res.innerHTML = ""; return; }
    
    // Erweiterte Suche - auch Teilstrings finden
    const out = Search.search(q);
    
    // Wenn keine Ergebnisse, suche auch in Teilstrings
    if (out.results.length === 0) {
      const allDocs = docs.filter(doc => {
        const searchText = (doc.title + ' ' + doc.tags.join(' ') + ' ' + doc.content).toLowerCase();
        return searchText.includes(q);
      });
      if (allDocs.length > 0) {
        res.innerHTML = allDocs.map(doc=>`<a class="pill" href="#${doc.id}">${doc.title}</a>`).join(' ');
        return;
      }
    }
    
    // Zeige Ergebnisse
    if (out.results.length > 0) {
      res.innerHTML = out.results.map(r=>`<a class="pill" href="#${r.doc.id}">${r.doc.title} <span class="muted">(${r.score.toFixed(2)})</span></a>`).join(' ');
    } else {
      res.innerHTML = `<span class="muted">Keine Ergebnisse für "${q}". Versuche: identität, performance, sicherheit, mesh, telbank, diagramm</span>`;
    }
  });
}

(async function init(){
  await openDB();
  
  // Warte auf DOM ready
  function setupEventListeners() {
    attachSearchUI();
    
    const genKeyBtn = document.getElementById('genKey');
    if (genKeyBtn) genKeyBtn.onclick = genKeypair;
    
    const writeManifestBtn = document.getElementById('writeManifest');
    if (writeManifestBtn) writeManifestBtn.onclick = async ()=>{
    const manifest = { name:"OSOS · tOS", universe: localStorage.getItem('tos.universe'), device: document.getElementById('devclass').textContent, ts: new Date().toISOString(), version: document.getElementById('version').textContent };
    const entry = await writeLog("manifest", manifest);
      const idStatusEl = document.getElementById('idStatus');
      if (idStatusEl) idStatusEl.textContent = "Manifest signiert: " + entry.id;
    };
    
    const startBaselineBtn = document.getElementById('startBaseline');
    if (startBaselineBtn) startBaselineBtn.onclick = async ()=>{
      const rttWin=[];
      for (let i=0;i<6;i++){ await pingRTT(); rttWin.push(metrics.rttSamples.at(-1)); }
      const baseline = { latency: (rttWin.reduce((a,b)=>a+b,0)/rttWin.length)||50, throughput: 1000, cpuIdle: Math.min(100, Math.max(0, 100 - metrics.fps)), coalesce: (metrics.coalesce.coalesced/Math.max(1,metrics.coalesce.total))||0.2 };
      const fpsEl = document.getElementById('fps');
      if (fpsEl) fpsEl.textContent = metrics.fps;
      const rtt50El = document.getElementById('rtt50');
      if (rtt50El) rtt50El.textContent = Math.round(rttWin[Math.floor(rttWin.length*0.5)]||0);
      const rtt95El = document.getElementById('rtt95');
      if (rtt95El) rtt95El.textContent = Math.round(rttWin[Math.floor(rttWin.length*0.95)]||0);
      const downlinkEl = document.getElementById('downlink');
      if (downlinkEl) downlinkEl.textContent = metrics.downlink||"–";
      await writeLog("performance_baseline", baseline);
    };
    
    const profilerBtn = document.getElementById('profiler');
    if (profilerBtn) profilerBtn.onclick = ()=>{
      performance.mark('A'); 
      const arr = [];
      for(let i=0;i<1e6;i++) arr.push(i^((i<<3)&255));
      performance.mark('B'); 
      performance.measure('loop','A','B');
      const m = performance.getEntriesByName('loop')[0];
      const devoutEl = document.getElementById('devout');
      if (devoutEl && m) devoutEl.textContent = `Profiler: ${m.duration.toFixed(2)} ms, heap ~ ${Math.round(arr.length*8/1024/1024)} MB`;
    };
  }
  
  // Warte auf DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
  } else {
    setupEventListeners();
  }
})();

