# Erstellt die fehlenden HTML-Dateien für Node-Editor und Bubble
# Sollte nach setup-xxxxxxls-monorepo.ps1 ausgeführt werden

$REPO = "xxxxxxls-fabrikage-monorepo"

if (-not (Test-Path $REPO)) {
    Write-Host "Error: $REPO not found. Run setup-xxxxxxls-monorepo.ps1 first!" -ForegroundColor Red
    exit 1
}

Set-Location $REPO

# Node Editor HTML
$nodeEditorHTML = @"
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Node-Editor · XXXXXXLS</title>
  <link rel="stylesheet" href="ultra.css">
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="logo"><span class="brand">.XLS.</span> Node-Editor</div>
      <div>
        <a class="btn" href="http://localhost:5174">Dashboard</a>
        <a class="btn" href="http://localhost:5176">Bubble</a>
      </div>
    </header>
    <aside class="sidenav">
      <nav class="nav">
        <a class="active">Graph</a>
      </nav>
    </aside>
    <main class="main">
      <section class="card">
        <h2>Graph Editor</h2>
        <div id="graph" style="position:relative;height:60vh;border:1px solid rgba(255,255,255,.15);border-radius:12px;background:rgba(5,7,17,0.5)"></div>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="btn" onclick="addNode()">Node+</button>
          <button class="btn" onclick="connect()">Verbinden</button>
          <button class="btn" onclick="resetGraph()">Reset</button>
          <button class="btn" onclick="exportGraph()">Export</button>
        </div>
        <pre id="out" style="margin-top:12px;max-height:220px;overflow:auto;background:rgba(0,0,0,0.3);padding:12px;border-radius:8px"></pre>
      </section>
    </main>
  </div>
  <script>
    const nodes = [];
    const links = [];
    let selectedNode = null;
    let connectingFrom = null;

    function render() {
      const el = document.getElementById('graph');
      el.innerHTML = '';
      
      // Render links first (behind nodes)
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.pointerEvents = 'none';
      svg.style.zIndex = '1';
      
      links.forEach(link => {
        const fromNode = nodes.find(n => n.id === link.from);
        const toNode = nodes.find(n => n.id === link.to);
        if (fromNode && toNode) {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const x1 = fromNode.x + 60;
          const y1 = fromNode.y + 20;
          const x2 = toNode.x + 60;
          const y2 = toNode.y + 20;
          const dx = x2 - x1;
          const cp1x = x1 + dx * 0.5;
          const cp1y = y1;
          const cp2x = x2 - dx * 0.5;
          const cp2y = y2;
          path.setAttribute('d', `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`);
          path.setAttribute('stroke', '#39d0ff');
          path.setAttribute('stroke-width', '2');
          path.setAttribute('fill', 'none');
          path.setAttribute('opacity', '0.6');
          svg.appendChild(path);
        }
      });
      el.appendChild(svg);
      
      // Render nodes
      nodes.forEach(n => {
        const d = document.createElement('div');
        d.textContent = n.id;
        d.style.position = 'absolute';
        d.style.left = n.x + 'px';
        d.style.top = n.y + 'px';
        d.style.padding = '8px 12px';
        d.style.border = selectedNode === n.id ? '2px solid #ff6bcb' : '1px solid rgba(255,255,255,.3)';
        d.style.background = selectedNode === n.id ? 'rgba(255,107,203,0.2)' : 'rgba(57,208,255,0.15)';
        d.style.borderRadius = '8px';
        d.style.cursor = 'move';
        d.style.zIndex = '10';
        d.style.userSelect = 'none';
        d.draggable = true;
        
        d.ondragstart = e => {
          e.dataTransfer.setData('id', n.id);
          selectedNode = n.id;
        };
        
        d.ondragend = () => {
          selectedNode = null;
        };
        
        d.onclick = () => {
          if (connectingFrom) {
            if (connectingFrom !== n.id) {
              links.push({
                id: 'L-' + Math.random().toString(36).slice(2, 9),
                from: connectingFrom,
                to: n.id,
                type: 'INFORMATION'
              });
              connectingFrom = null;
              render();
            }
          } else {
            selectedNode = n.id;
            render();
          }
        };
        
        d.ondragover = e => {
          e.preventDefault();
        };
        
        d.ondrop = e => {
          e.preventDefault();
          const draggedId = e.dataTransfer.getData('id');
          if (draggedId && draggedId !== n.id) {
            const draggedNode = nodes.find(node => node.id === draggedId);
            if (draggedNode) {
              draggedNode.x = n.x + 120;
              draggedNode.y = n.y;
              render();
            }
          }
        };
        
        el.appendChild(d);
      });
      
      document.getElementById('out').textContent = JSON.stringify({ nodes, links }, null, 2);
    }

    function addNode() {
      nodes.push({
        id: 'N-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        x: 20 + Math.random() * 600,
        y: 20 + Math.random() * 300
      });
      render();
    }

    function connect() {
      if (nodes.length >= 2) {
        connectingFrom = nodes[nodes.length - 1].id;
        alert('Click on target node to connect');
      } else {
        alert('Need at least 2 nodes to connect');
      }
    }

    function resetGraph() {
      if (confirm('Reset graph?')) {
        nodes.splice(0);
        links.splice(0);
        connectingFrom = null;
        selectedNode = null;
        render();
      }
    }

    function exportGraph() {
      const data = JSON.stringify({ nodes, links }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graph-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    render();
  </script>
</body>
</html>
"@

$nodeEditorHTML | Out-File -FilePath "apps/node-editor/public/index.html" -Encoding UTF8

# Bubble HTML
$bubbleHTML = @"
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bubble-Hydrosphäre · XXXXXXLS</title>
  <link rel="stylesheet" href="ultra.css">
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="logo"><span class="brand">.XLS.</span> Bubble Scene</div>
      <div>
        <a class="btn" href="http://localhost:5174">Dashboard</a>
        <a class="btn" href="http://localhost:5175">Node-Editor</a>
      </div>
    </header>
    <aside class="sidenav">
      <nav class="nav">
        <a class="active">Scene</a>
      </nav>
      <div style="margin-top:24px;padding:12px;background:rgba(57,208,255,0.1);border-radius:8px">
        <div class="small" style="margin-bottom:8px">Controls:</div>
        <label style="display:block;margin-bottom:8px">
          <div class="small">Pulse Speed</div>
          <input type="range" id="pulseSpeed" min="0.01" max="0.1" step="0.01" value="0.02" style="width:100%">
        </label>
        <label style="display:block;margin-bottom:8px">
          <div class="small">Foam Level</div>
          <input type="range" id="foamLevel" min="0" max="1" step="0.1" value="0.4" style="width:100%">
        </label>
        <label style="display:block;margin-bottom:8px">
          <div class="small">Brightness</div>
          <input type="range" id="brightness" min="0.5" max="2" step="0.1" value="1" style="width:100%">
        </label>
        <button class="btn" onclick="reset()" style="width:100%;margin-top:8px">Reset</button>
      </div>
    </aside>
    <main class="main">
      <section class="card">
        <h2>Hydrosphäre Visual</h2>
        <canvas id="c" style="width:100%;height:60vh;border-radius:12px;border:1px solid rgba(255,255,255,.15);display:block"></canvas>
        <div class="small" style="margin-top:12px">
          Neon-cyan / deep-aqua / phosphor-magenta bloom. Capillary waves & caustics.
        </div>
      </section>
    </main>
  </div>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let foamLevel = 0.4;
    let pulsePhase = 0;
    let pulseSpeed = 0.02;
    let brightness = 1;

    function resize() {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * window.devicePixelRatio;
      canvas.height = r.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    window.addEventListener('resize', resize);
    resize();

    function draw() {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) / 3 * (1 + 0.03 * Math.sin(pulsePhase));

      // Background gradient
      const grd = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.2);
      grd.addColorStop(0, `rgba(57, 208, 255, ${0.25 * brightness})`);
      grd.addColorStop(0.5, `rgba(255, 107, 203, ${0.10 * brightness})`);
      grd.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Main bubble circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(233, 236, 255, ${0.9 * brightness})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Foam particles
      for (let i = 0; i < 80; i++) {
        const a = (i / 80) * Math.PI * 2 + pulsePhase * 0.4;
        const rr = r * (0.92 + 0.06 * Math.sin(i * 0.3 + pulsePhase));
        const x = cx + rr * Math.cos(a);
        const y = cy + rr * Math.sin(a);
        ctx.fillStyle = `hsla(${180 + 60 * Math.sin(a * 2)}, 80%, 60%, ${0.08 * brightness * (1 + foamLevel)})`;
        ctx.beginPath();
        ctx.arc(x, y, 2 + foamLevel * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Inner glow
      const ig = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 0.9);
      ig.addColorStop(0, `rgba(57, 208, 255, ${0.25 * brightness})`);
      ig.addColorStop(1, `rgba(255, 107, 203, ${0.05 * brightness})`);
      ctx.fillStyle = ig;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // Caustics effect
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2 + pulsePhase;
        const x = cx + r * 0.7 * Math.cos(a);
        const y = cy + r * 0.7 * Math.sin(a);
        ctx.fillStyle = `rgba(57, 208, 255, ${0.1 * brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, 8 + Math.sin(pulsePhase + i) * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      pulsePhase += pulseSpeed;
      requestAnimationFrame(draw);
    }

    function reset() {
      foamLevel = 0.4;
      pulsePhase = 0;
      pulseSpeed = 0.02;
      brightness = 1;
      document.getElementById('foamLevel').value = 0.4;
      document.getElementById('pulseSpeed').value = 0.02;
      document.getElementById('brightness').value = 1;
    }

    document.getElementById('pulseSpeed').addEventListener('input', (e) => {
      pulseSpeed = parseFloat(e.target.value);
    });

    document.getElementById('foamLevel').addEventListener('input', (e) => {
      foamLevel = parseFloat(e.target.value);
    });

    document.getElementById('brightness').addEventListener('input', (e) => {
      brightness = parseFloat(e.target.value);
    });

    draw();
  </script>
</body>
</html>
"@

$bubbleHTML | Out-File -FilePath "apps/bubble/public/index.html" -Encoding UTF8

Write-Host "==> Node-Editor and Bubble apps created!" -ForegroundColor Green



