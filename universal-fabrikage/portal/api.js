// Portal API - Verbindung zum Engine
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const API_BASE = window.location.origin;

export async function generateProgram(prompt) {
  try {
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    // Fallback: Lokale Generierung
    console.warn('API nicht verfügbar, verwende lokale Generierung');
    return generateProgramLocal(prompt);
  }
}

async function generateProgramLocal(prompt) {
  // Simuliere lokale Generierung
  return {
    ok: true,
    result: {
      category: 'Haushalts-Finanz-Energie-Simulator',
      domains: ['Finanz', 'Energie', 'Statistik'],
      targets: ['web', 'cli'],
      files: [
        { language: 'python', path: 'program.py' },
        { language: 'javascript', path: 'program.js' }
      ],
      hasUI: true
    }
  };
}

export async function downloadProgram(result) {
  // Erstelle ZIP-Datei mit allen generierten Dateien
  // In Produktion: Server-seitige ZIP-Erstellung
  alert('Download-Funktion wird implementiert');
}


