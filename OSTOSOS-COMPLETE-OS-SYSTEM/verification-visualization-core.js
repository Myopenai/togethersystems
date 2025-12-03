/**
 * T,. OSOTOSOS Verification Visualization Core
 * Visualisierungs-Komponenten für Verifizierungs- und Portal-Prozess
 * 
 * Features:
 * - Kuchendiagramm (Zeit)
 * - Säulendiagramm (Zeit pro Abschnitt)
 * - Aquarium-Ansicht (Module als Fische)
 */

class OSOTOSOSVerificationVisualization {
  constructor() {
    this.charts = new Map();
    this.processPhases = [
      { name: 'Build', duration: 0, elapsed: 0 },
      { name: 'Test', duration: 0, elapsed: 0 },
      { name: 'Verifikation', duration: 0, elapsed: 0 },
      { name: 'Release', duration: 0, elapsed: 0 }
    ];
    
    this.init();
  }
  
  init() {
    console.log('T,. OSOTOSOS Verification Visualization initialisiert');
  }
  
  /**
   * Erstellt Kuchendiagramm
   */
  createPieChart(containerId, elapsed, remaining) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;
    
    const total = elapsed + remaining;
    const elapsedPercent = total > 0 ? (elapsed / total) * 100 : 0;
    const remainingPercent = total > 0 ? (remaining / total) * 100 : 0;
    
    // Elapsed (Grün)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, (elapsedPercent / 100) * 2 * Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    
    // Remaining (Grau)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, (elapsedPercent / 100) * 2 * Math.PI, 2 * Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = '#223040';
    ctx.fill();
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(elapsedPercent)}%`, centerX, centerY - 10);
    ctx.font = '14px Arial';
    ctx.fillText('Verstrichen', centerX, centerY + 15);
    
    // Legend
    const legend = document.createElement('div');
    legend.style.cssText = `
      margin-top: 20px;
      display: flex;
      justify-content: center;
      gap: 20px;
    `;
    
    const legendElapsed = document.createElement('div');
    legendElapsed.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 20px; height: 20px; background: #10b981; border-radius: 4px;"></div>
        <span>Verstrichen: ${formatTime(elapsed)}</span>
      </div>
    `;
    
    const legendRemaining = document.createElement('div');
    legendRemaining.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 20px; height: 20px; background: #223040; border-radius: 4px;"></div>
        <span>Verbleibend: ${formatTime(remaining)}</span>
      </div>
    `;
    
    legend.appendChild(legendElapsed);
    legend.appendChild(legendRemaining);
    container.appendChild(legend);
  }
  
  /**
   * Erstellt Säulendiagramm
   */
  createBarChart(containerId, phases) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const barWidth = 100;
    const barSpacing = 50;
    const startX = 50;
    const startY = 350;
    const maxHeight = 300;
    
    // Finde maximale Dauer
    const maxDuration = Math.max(...phases.map(p => p.elapsed || 0));
    
    phases.forEach((phase, index) => {
      const x = startX + (index * (barWidth + barSpacing));
      const height = maxDuration > 0 ? (phase.elapsed / maxDuration) * maxHeight : 0;
      const y = startY - height;
      
      // Bar
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x, y, barWidth, height);
      
      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(phase.name, x + barWidth / 2, startY + 20);
      
      // Wert
      ctx.fillText(formatTime(phase.elapsed), x + barWidth / 2, y - 5);
    });
  }
  
  /**
   * Erstellt Aquarium-Ansicht
   */
  createAquariumView(containerId, modules) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    container.style.cssText = `
      position: relative;
      width: 100%;
      height: 500px;
      background: linear-gradient(180deg, #0a0e27 0%, #1a1f3a 100%);
      border: 2px solid #10b981;
      border-radius: 15px;
      overflow: hidden;
    `;
    
    // Zones
    const zones = [
      { name: 'Aktiv', y: 0, height: 33 },
      { name: 'Abgeschlossen', y: 33, height: 33 },
      { name: 'Bevorstehend', y: 66, height: 34 }
    ];
    
    zones.forEach(zone => {
      const zoneEl = document.createElement('div');
      zoneEl.style.cssText = `
        position: absolute;
        top: ${zone.y}%;
        left: 0;
        right: 0;
        height: ${zone.height}%;
        border-bottom: 1px solid #10b981;
        opacity: 0.1;
      `;
      container.appendChild(zoneEl);
      
      const zoneLabel = document.createElement('div');
      zoneLabel.textContent = zone.name;
      zoneLabel.style.cssText = `
        position: absolute;
        top: ${zone.y + zone.height / 2 - 2}%;
        left: 10px;
        color: #10b981;
        font-weight: bold;
        font-size: 14px;
      `;
      container.appendChild(zoneLabel);
    });
    
    // Fish (Modules)
    modules.forEach((module, index) => {
      const fish = document.createElement('div');
      fish.className = 'aquarium-fish';
      fish.textContent = module.icon || '🐠';
      fish.style.cssText = `
        position: absolute;
        left: ${10 + (index * 15)}%;
        top: ${module.zone === 'active' ? 15 : module.zone === 'completed' ? 50 : 75}%;
        font-size: 32px;
        animation: swim ${3 + Math.random() * 2}s linear infinite;
        cursor: pointer;
      `;
      
      fish.title = module.name;
      
      fish.addEventListener('click', () => {
        if (module.onClick) module.onClick();
      });
      
      // Add swim animation
      if (!document.getElementById('aquarium-styles')) {
        const style = document.createElement('style');
        style.id = 'aquarium-styles';
        style.textContent = `
          @keyframes swim {
            0% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(10px) translateY(-5px); }
            50% { transform: translateX(0) translateY(-10px); }
            75% { transform: translateX(-10px) translateY(-5px); }
            100% { transform: translateX(0) translateY(0); }
          }
        `;
        document.head.appendChild(style);
      }
      
      container.appendChild(fish);
    });
  }
  
  /**
   * Aktualisiert Prozess-Phasen
   */
  updateProcessPhases(phases) {
    this.processPhases = phases;
  }
  
  /**
   * Rendert vollständige Visualisierung
   */
  renderFullVisualization(containerId, elapsed, remaining, phases, modules) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
        <div>
          <h3 style="color: #10b981; margin-bottom: 15px;">Zeit-Übersicht</h3>
          <div id="pie-chart-container"></div>
        </div>
        <div>
          <h3 style="color: #10b981; margin-bottom: 15px;">Zeit pro Abschnitt</h3>
          <div id="bar-chart-container"></div>
        </div>
      </div>
      <div>
        <h3 style="color: #10b981; margin-bottom: 15px;">Aquarium-Ansicht</h3>
        <div id="aquarium-container"></div>
      </div>
    `;
    
    // Render Charts
    setTimeout(() => {
      this.createPieChart('pie-chart-container', elapsed, remaining);
      this.createBarChart('bar-chart-container', phases);
      this.createAquariumView('aquarium-container', modules);
    }, 100);
  }
}

// Helper Functions
function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

// Global verfügbar machen
window.OSOTOSOSVerificationVisualization = OSOTOSOSVerificationVisualization;
window.OSOTOSOSViz = window.OSOTOSOSViz || new OSOTOSOSVerificationVisualization();

console.log('T,. OSOTOSOS Verification Visualization Core geladen');

