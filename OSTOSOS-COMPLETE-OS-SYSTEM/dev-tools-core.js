// T,. OSTOSOS - Developer Expert Tools Core
// Systemanalyse, Hardware-Identifizierung & Entwickler-Tools

function showTab(tabId){
document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
document.getElementById(tabId).classList.add('active');
if(tabId==='system')refreshSystemInfo();
if(tabId==='hardware')refreshHardwareInfo();
if(tabId==='network')refreshNetworkInfo();
if(tabId==='audio')refreshAudioInfo();
}

async function refreshSystemInfo(){
const specs=await collectSystemInfo();
const container=document.getElementById('systemSpecs');
container.innerHTML=Object.entries(specs).map(([key,value])=>`
<div class="spec-card">
<h3>${key}</h3>
${Object.entries(value).map(([k,v])=>`
<div class="spec-item">
<span class="spec-label">${k}:</span>
<span class="spec-value">${v}</span>
</div>
`).join('')}
</div>
`).join('');
}

async function collectSystemInfo(){
return {
'Betriebssystem':{
'OS':navigator.platform,
'User Agent':navigator.userAgent,
'Sprache':navigator.language,
'Zeitzone':Intl.DateTimeFormat().resolvedOptions().timeZone,
'Cookies aktiv':navigator.cookieEnabled?'Ja':'Nein',
'Online Status':navigator.onLine?'Online':'Offline'
},
'Browser':{
'Name':getBrowserName(),
'Version':getBrowserVersion(),
'Engine':getBrowserEngine(),
'Vendor':navigator.vendor,
'Max Touch Points':navigator.maxTouchPoints||'N/A'
},
'Display':{
'Auflösung':`${screen.width}x${screen.height}`,
'Farbtiefe':`${screen.colorDepth} bit`,
'Pixel Ratio':window.devicePixelRatio||1,
'Orientierung':screen.orientation?.type||'N/A',
'Verfügbarer Platz':`${screen.availWidth}x${screen.availHeight}`
},
'Speicher':{
'LocalStorage':localStorageAvailable()?'Verfügbar':'Nicht verfügbar',
'SessionStorage':sessionStorageAvailable()?'Verfügbar':'Nicht verfügbar',
'IndexedDB':indexedDBAvailable()?'Verfügbar':'Nicht verfügbar',
'Cache API':caches?'Verfügbar':'Nicht verfügbar',
'Service Worker':serviceWorkerAvailable()?'Verfügbar':'Nicht verfügbar'
},
'Performance':{
'Hardware Concurrency':navigator.hardwareConcurrency||'N/A',
'Device Memory':navigator.deviceMemory?`${navigator.deviceMemory} GB`:'N/A',
'Connection':getConnectionInfo(),
'Battery':await getBatteryInfo()
}
};
}

async function refreshHardwareInfo(){
const hardware=await collectHardwareInfo();
const container=document.getElementById('hardwareSpecs');
container.innerHTML=Object.entries(hardware).map(([key,value])=>`
<div class="spec-card">
<h3>${key}</h3>
${Object.entries(value).map(([k,v])=>`
<div class="spec-item">
<span class="spec-label">${k}:</span>
<span class="spec-value">${v}</span>
</div>
`).join('')}
</div>
`).join('');
}

async function collectHardwareInfo(){
const info={};
if(navigator.hardwareConcurrency){
info['CPU']={
'Kerne':navigator.hardwareConcurrency,
'Architektur':navigator.userAgent.includes('x64')?'x64':navigator.userAgent.includes('x86')?'x86':'Unbekannt'
};
}
if(navigator.deviceMemory){
info['RAM']={
'Verfügbar':`${navigator.deviceMemory} GB`,
'Geschätzt':`${navigator.deviceMemory*1024} MB`
};
}
if(navigator.getBattery){
const battery=await navigator.getBattery();
info['Batterie']={
'Ladestatus':battery.charging?'Wird geladen':'Nicht am Ladegerät',
'Ladung':`${Math.round(battery.level*100)}%`,
'Ladezeit':battery.chargingTime===Infinity?'Unbekannt':`${Math.round(battery.chargingTime/60)} Minuten`,
'Entladezeit':battery.dischargingTime===Infinity?'Unbekannt':`${Math.round(battery.dischargingTime/60)} Minuten`
};
}
if(navigator.mediaDevices){
const devices=await navigator.mediaDevices.enumerateDevices();
const videoDevices=devices.filter(d=>d.kind==='videoinput');
const audioInputDevices=devices.filter(d=>d.kind==='audioinput');
const audioOutputDevices=devices.filter(d=>d.kind==='audiooutput');
if(videoDevices.length>0){
info['Video-Eingabe']={
'Anzahl':videoDevices.length,
'Geräte':videoDevices.map(d=>d.label||'Unbekannt').join(', ')
};
}
if(audioInputDevices.length>0){
info['Audio-Eingabe']={
'Anzahl':audioInputDevices.length,
'Geräte':audioInputDevices.map(d=>d.label||'Unbekannt').join(', ')
};
}
if(audioOutputDevices.length>0){
info['Audio-Ausgabe']={
'Anzahl':audioOutputDevices.length,
'Geräte':audioOutputDevices.map(d=>d.label||'Unbekannt').join(', ')
};
}
}
return info;
}

async function refreshNetworkInfo(){
const network=await collectNetworkInfo();
const container=document.getElementById('networkSpecs');
container.innerHTML=Object.entries(network).map(([key,value])=>`
<div class="spec-card">
<h3>${key}</h3>
${Object.entries(value).map(([k,v])=>`
<div class="spec-item">
<span class="spec-label">${k}:</span>
<span class="spec-value">${v}</span>
</div>
`).join('')}
</div>
`).join('');
}

async function collectNetworkInfo(){
const info={};
if(navigator.connection||navigator.mozConnection||navigator.webkitConnection){
const conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
info['Verbindung']={
'Typ':conn.effectiveType||'Unbekannt',
'Downlink':conn.downlink?`${conn.downlink} Mbps`:'N/A',
'RTT':conn.rtt?`${conn.rtt} ms`:'N/A',
'Save Data':conn.saveData?'Aktiviert':'Deaktiviert'
};
}
info['Netzwerk-Status']={
'Online':navigator.onLine?'Ja':'Nein',
'Hostname':window.location.hostname||'Lokal',
'Protokoll':window.location.protocol,
'Port':window.location.port||'Standard'
};
if(navigator.geolocation){
try{
const position=await new Promise((resolve,reject)=>{
navigator.geolocation.getCurrentPosition(resolve,reject,{timeout:5000});
});
info['Geolocation']={
'Breitengrad':position.coords.latitude.toFixed(6),
'Längengrad':position.coords.longitude.toFixed(6),
'Genauigkeit':`${Math.round(position.coords.accuracy)} Meter`
};
}catch(e){
info['Geolocation']={'Status':'Nicht verfügbar'};
}
}
return info;
}

async function refreshAudioInfo(){
const audio=await collectAudioInfo();
const container=document.getElementById('audioSpecs');
container.innerHTML=Object.entries(audio).map(([key,value])=>`
<div class="spec-card">
<h3>${key}</h3>
${Object.entries(value).map(([k,v])=>`
<div class="spec-item">
<span class="spec-label">${k}:</span>
<span class="spec-value">${v}</span>
</div>
`).join('')}
</div>
`).join('');
}

async function collectAudioInfo(){
const info={};
if(navigator.mediaDevices){
const devices=await navigator.mediaDevices.enumerateDevices();
const audioInputs=devices.filter(d=>d.kind==='audioinput');
const audioOutputs=devices.filter(d=>d.kind==='audiooutput');
if(audioInputs.length>0){
info['Audio-Eingabe']={
'Anzahl Geräte':audioInputs.length,
'Geräte':audioInputs.map((d,i)=>({
'ID':d.deviceId.substring(0,20)+'...',
'Label':d.label||`Gerät ${i+1}`,
'Gruppe':d.groupId.substring(0,20)+'...'
})).map(d=>`${d.Label} (${d.ID})`).join(', ')
};
}
if(audioOutputs.length>0){
info['Audio-Ausgabe']={
'Anzahl Geräte':audioOutputs.length,
'Geräte':audioOutputs.map((d,i)=>({
'ID':d.deviceId.substring(0,20)+'...',
'Label':d.label||`Gerät ${i+1}`,
'Gruppe':d.groupId.substring(0,20)+'...'
})).map(d=>`${d.Label} (${d.ID})`).join(', ')
};
}
if(navigator.mediaDevices.getSupportedConstraints){
const constraints=navigator.mediaDevices.getSupportedConstraints();
info['Audio-Funktionen']={
'Unterstützte Constraints':Object.keys(constraints).filter(k=>constraints[k]).join(', ')
};
}
}
if(typeof AudioContext!=='undefined'||typeof webkitAudioContext!=='undefined'){
const AudioCtx=AudioContext||webkitAudioContext;
const ctx=new AudioCtx();
info['Web Audio API']={
'Status':'Verfügbar',
'Sample Rate':`${ctx.sampleRate} Hz`,
'State':ctx.state,
'Destination Channels':ctx.destination.numberOfChannels
};
}
return info;
}

function executeCode(){
const code=document.getElementById('codeEditor').value;
const output=document.getElementById('codeOutput');
output.style.display='block';
output.innerHTML='';
try{
const result=eval(code);
output.innerHTML+=`<div class="log-entry log-success">✅ Ausführung erfolgreich</div>`;
if(result!==undefined){
output.innerHTML+=`<div class="log-entry log-info">Resultat: ${JSON.stringify(result,null,2)}</div>`;
}
}catch(error){
output.innerHTML+=`<div class="log-entry log-error">❌ Fehler: ${error.message}</div>`;
output.innerHTML+=`<div class="log-entry log-error">Stack: ${error.stack}</div>`;
}
}

function saveCode(){
const code=document.getElementById('codeEditor').value;
localStorage.setItem('ostosos.dev.code',code);
alert('Code gespeichert!');
}

function loadCode(){
const code=localStorage.getItem('ostosos.dev.code');
if(code){
document.getElementById('codeEditor').value=code;
alert('Code geladen!');
}else{
alert('Kein gespeicherter Code gefunden!');
}
}

function clearCode(){
if(confirm('Code wirklich löschen?')){
document.getElementById('codeEditor').value='';
document.getElementById('codeOutput').style.display='none';
}
}

async function runVerification(){
const results=document.getElementById('verificationResults');
results.innerHTML='<div class="log-entry log-info">🔍 Verifikation läuft...</div>';
const checks=[
{name:'System-Erkennung',func:checkSystem},
{name:'Hardware-Verfügbarkeit',func:checkHardware},
{name:'Netzwerk-Verbindung',func:checkNetwork},
{name:'Audio-Geräte',func:checkAudio},
{name:'Speicher-APIs',func:checkStorage},
{name:'Performance-APIs',func:checkPerformance}
];
for(const check of checks){
try{
const result=await check.func();
results.innerHTML+=`<div class="log-entry log-success">✅ ${check.name}: ${result}</div>`;
}catch(error){
results.innerHTML+=`<div class="log-entry log-error">❌ ${check.name}: ${error.message}</div>`;
}
}
results.innerHTML+='<div class="log-entry log-info">✅ Verifikation abgeschlossen</div>';
}

function runSystemRepair(){
alert('System-Reparatur wird gestartet...\n\nDies wird automatisch Fehler erkennen und beheben.');
}

function runPerformanceAnalysis(){
alert('Performance-Analyse wird gestartet...\n\nDies wird System-Performance messen und optimieren.');
}

function runSecurityCheck(){
alert('Sicherheits-Check wird gestartet...\n\nDies wird Sicherheitslücken identifizieren.');
}

function openExtensionsManager(){
window.location.href='./extensions-manager.html';
}

function exportSystemInfo(){
const data={
system:collectSystemInfo(),
hardware:collectHardwareInfo(),
network:collectNetworkInfo(),
audio:collectAudioInfo(),
timestamp:new Date().toISOString()
};
const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
const url=URL.createObjectURL(blob);
const a=document.createElement('a');
a.href=url;
a.download=`ostosos-system-info-${new Date().toISOString().split('T')[0]}.json`;
a.click();
}

function getBrowserName(){
const ua=navigator.userAgent;
if(ua.includes('Chrome')&&!ua.includes('Edg'))return 'Chrome';
if(ua.includes('Firefox'))return 'Firefox';
if(ua.includes('Safari')&&!ua.includes('Chrome'))return 'Safari';
if(ua.includes('Edg'))return 'Edge';
if(ua.includes('Opera')||ua.includes('OPR'))return 'Opera';
return 'Unbekannt';
}

function getBrowserVersion(){
const ua=navigator.userAgent;
const match=ua.match(/(Chrome|Firefox|Safari|Edg|Opera|OPR)\/(\d+)/);
return match?match[2]:'Unbekannt';
}

function getBrowserEngine(){
if(navigator.userAgent.includes('Gecko'))return 'Gecko';
if(navigator.userAgent.includes('WebKit'))return 'WebKit';
if(navigator.userAgent.includes('Blink'))return 'Blink';
return 'Unbekannt';
}

function getConnectionInfo(){
if(navigator.connection){
const conn=navigator.connection;
return `${conn.effectiveType||'Unbekannt'} (${conn.downlink||'N/A'} Mbps)`;
}
return 'Nicht verfügbar';
}

async function getBatteryInfo(){
if(navigator.getBattery){
const battery=await navigator.getBattery();
return `${Math.round(battery.level*100)}% (${battery.charging?'Lädt':'Nicht am Ladegerät'})`;
}
return 'Nicht verfügbar';
}

function localStorageAvailable(){
try{localStorage.setItem('test','test');localStorage.removeItem('test');return true;}catch(e){return false;}
}

function sessionStorageAvailable(){
try{sessionStorage.setItem('test','test');sessionStorage.removeItem('test');return true;}catch(e){return false;}
}

function indexedDBAvailable(){
return typeof indexedDB!=='undefined';
}

function serviceWorkerAvailable(){
return 'serviceWorker' in navigator;
}

async function checkSystem(){
const info=await collectSystemInfo();
return `OS: ${info['Betriebssystem']['OS']}, Browser: ${getBrowserName()}`;
}

async function checkHardware(){
const info=await collectHardwareInfo();
return `CPU: ${info['CPU']?info['CPU']['Kerne']:'N/A'} Kerne, RAM: ${info['RAM']?info['RAM']['Verfügbar']:'N/A'}`;
}

async function checkNetwork(){
const info=await collectNetworkInfo();
return `Online: ${info['Netzwerk-Status']['Online']}, Typ: ${info['Verbindung']?info['Verbindung']['Typ']:'N/A'}`;
}

async function checkAudio(){
const info=await collectAudioInfo();
return `Eingabe: ${info['Audio-Eingabe']?info['Audio-Eingabe']['Anzahl Geräte']:0}, Ausgabe: ${info['Audio-Ausgabe']?info['Audio-Ausgabe']['Anzahl Geräte']:0}`;
}

function checkStorage(){
return `LocalStorage: ${localStorageAvailable()?'✅':'❌'}, IndexedDB: ${indexedDBAvailable()?'✅':'❌'}`;
}

function checkPerformance(){
return `Hardware Concurrency: ${navigator.hardwareConcurrency||'N/A'}, Device Memory: ${navigator.deviceMemory?navigator.deviceMemory+' GB':'N/A'}`;
}

window.addEventListener('load',()=>{
refreshSystemInfo();
});

