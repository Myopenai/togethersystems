// ambient-media.js
// Leichtes, grünes/neonartiges Ambient-System für Portal/Startseite.
// Verwendet NUR CSS-Gradients als "Bildplatzhalter", keine großen Bilddateien.
// Bindet sich an Elemente mit data-ambient-slot, z.B. die Hero-Bereiche.

const AMBIENT_THEMES = [
  {
    id: 'jungle-soft',
    description: 'Sanfter Dschungel / Waldlicht',
    overlay:
      'radial-gradient(420px 260px at 5% 105%, rgba(34,197,94,0.35), transparent 70%)'
  },
  {
    id: 'bahamas-breeze',
    description: 'Bahamas / türkis-grüner Horizont',
    overlay:
      'radial-gradient(520px 260px at 100% 0%, rgba(45,212,191,0.28), transparent 68%)'
  },
  {
    id: 'media-neon',
    description: 'Neon-Medienstreifen (Stadt / Sunset-Strip)',
    overlay:
      'radial-gradient(520px 260px at 110% 120%, rgba(74,222,128,0.25), transparent 70%), radial-gradient(420px 220px at -10% -10%, rgba(56,189,248,0.22), transparent 60%)'
  }
];

let currentThemeIndex = 0;

function pickNextTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % AMBIENT_THEMES.length;
  return AMBIENT_THEMES[currentThemeIndex];
}

function applyThemeToSlot(slot, theme) {
  if (!slot || !theme) return;
  // Setze CSS-Custom-Property, die in den Seiten-CSS für die Hero-Backgrounds verwendet wird.
  slot.style.setProperty('--ambient-overlay', theme.overlay);

  // Kleiner Lichtblitz / Puls beim Wechsel
  slot.classList.remove('ambient-pulse');
  // Reflow erzwingen, damit Animation neu startet
  // eslint-disable-next-line no-unused-expressions
  slot.offsetHeight;
  slot.classList.add('ambient-pulse');
}

function initAmbientMedia() {
  const slots = Array.from(document.querySelectorAll('[data-ambient-slot]'));
  if (!slots.length) return;

  // Initial: zufälliges Theme wählen
  currentThemeIndex = Math.floor(Math.random() * AMBIENT_THEMES.length);
  const initialTheme = AMBIENT_THEMES[currentThemeIndex];
  slots.forEach((slot) => applyThemeToSlot(slot, initialTheme));

  // Bei User-Interaktion (Klick/Keydown/Tab-Wechsel) langsam rotieren
  let interactionCount = 0;
  const rotateIfNeeded = () => {
    interactionCount += 1;
    // Nur bei jeder dritten Interaktion wechseln, damit es ruhig bleibt
    if (interactionCount % 3 !== 0) return;
    const theme = pickNextTheme();
    slots.forEach((slot) => applyThemeToSlot(slot, theme));
  };

  window.addEventListener('click', rotateIfNeeded, { passive: true });
  window.addEventListener('keydown', rotateIfNeeded, { passive: true });
  window.addEventListener('hashchange', rotateIfNeeded, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAmbientMedia);
} else {
  initAmbientMedia();
}


