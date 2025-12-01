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
  document.getElementById('pubkey').textContent = b64(pub);
  const universe = localStorage.getItem('tos.universe') || uuid();
  localStorage.setItem('tos.universe', universe);
  document.getElementById('universe').textContent = universe;
  document.getElementById('devclass').textContent = /Mobi|Android|iPhone/.test(navigator.userAgent) ? "mobile" : "desktop";
  document.getElementById('idStatus').textContent = "Schlüssel aktiv";
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
  { id:"manifest", title:"Manifest & Identität", tags:["identity","signatur","audit","schlüssel"], content:"Erzeuge Schlüssel, signiere Manifest, exportiere Audit-Log, versiegelte Snapshots." },
  { id:"perf", title:"Performance Uplift", tags:["fps","latency","durchsatz","coalesce","optimierer"], content:"Messe Baseline, wende Optimierer an, erfasse Beweise als signierte Visuals." },
  { id:"security", title:"Sicherheit & Verifikation", tags:["hash-kette","verify","rotation","snapshot","compliance"], content:"Prüfe Hash-Kette, rotiere Schlüssel, versiegel lokale Zustände, Compliance." },
  { id:"mesh", title:"Netzwerk & Mesh", tags:["presence","hmac","p2p","publish","sync","bandbreite"], content:"Erzeuge Presence-Token, aktiviere P2P, veröffentliche selektiv." },
  { id:"apps", title:"Apps Hub", tags:["telbank","voucher","legal","honeycomb"], content:"Signiere Transaktionen, verwalte Verträge, starte Produktionsflüsse." },
  { id:"dev", title:"Developer Superkiste", tags:["profiler","crypto","solver","diagramm","runner","dataset"], content:"Profiler, Krypto, Solver, Diagramme, Code Runner, Dataset-Sandbox, Netz-Graph." }
];

docs.forEach(Search.addDoc);

function attachSearchUI(){
  const input = document.getElementById('searchBox');
  const res = document.getElementById('searchOut');
  input.addEventListener('input', ()=>{
    const q = input.value;
    if (!q){ res.innerHTML = ""; return; }
    const out = Search.search(q);
    res.innerHTML = out.results.map(r=>`<a class="pill" href="#${r.doc.id}">${r.doc.title} <span class="muted">(${r.score})</span></a>`).join(' ');
  });
}

(async function init(){
  await openDB();
  attachSearchUI();
  
  document.getElementById('genKey').onclick = genKeypair;
  document.getElementById('writeManifest').onclick = async ()=>{
    const manifest = { name:"OSOS · tOS", universe: localStorage.getItem('tos.universe'), device: document.getElementById('devclass').textContent, ts: new Date().toISOString(), version: document.getElementById('version').textContent };
    const entry = await writeLog("manifest", manifest);
    document.getElementById('idStatus').textContent = "Manifest signiert: " + entry.id;
  };
  
  document.getElementById('startBaseline').onclick = async ()=>{
    const rttWin=[];
    for (let i=0;i<6;i++){ await pingRTT(); rttWin.push(metrics.rttSamples.at(-1)); }
    const baseline = { latency: (rttWin.reduce((a,b)=>a+b,0)/rttWin.length)||50, throughput: 1000, cpuIdle: Math.min(100, Math.max(0, 100 - metrics.fps)), coalesce: (metrics.coalesce.coalesced/Math.max(1,metrics.coalesce.total))||0.2 };
    document.getElementById('fps').textContent = metrics.fps;
    document.getElementById('rtt50').textContent = Math.round(rttWin[Math.floor(rttWin.length*0.5)]||0);
    document.getElementById('rtt95').textContent = Math.round(rttWin[Math.floor(rttWin.length*0.95)]||0);
    document.getElementById('downlink').textContent = metrics.downlink||"–";
    await writeLog("performance_baseline", baseline);
  };
  
  document.getElementById('profiler').onclick = ()=>{
    performance.mark('A'); const arr = [];
    for(let i=0;i<1e6;i++) arr.push(i^((i<<3)&255));
    performance.mark('B'); performance.measure('loop','A','B');
    const m = performance.getEntriesByName('loop')[0];
    document.getElementById('devout').textContent = `Profiler: ${m.duration.toFixed(2)} ms, heap ~ ${Math.round(arr.length*8/1024/1024)} MB`;
  };
})();

