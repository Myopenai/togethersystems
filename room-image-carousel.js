// room-image-carousel.js
// Bildkarussell für Wabenräume mit öffentlichen Bildern und gegebenen Bildern

const ROOM_CAROUSEL_CONFIG = {
  // Öffentliche Bildquellen (Unsplash, Pexels, etc.)
  PUBLIC_IMAGE_SOURCES: [
    // Unsplash API (kostenlos, hochqualitativ)
    'https://source.unsplash.com/800x600/?nature,landscape',
    'https://source.unsplash.com/800x600/?architecture,modern',
    'https://source.unsplash.com/800x600/?technology,digital',
    'https://source.unsplash.com/800x600/?space,cosmos',
    'https://source.unsplash.com/800x600/?abstract,art',
    'https://source.unsplash.com/800x600/?city,urban',
    'https://source.unsplash.com/800x600/?ocean,water',
    'https://source.unsplash.com/800x600/?forest,green',
  ],
  // Lokale Bilder (gegebene Bilder)
  LOCAL_IMAGES: [
    './GLI5_msWMAAPink.jpg',
    './unnamed(6).jpg',
    './unnamed(8).jpg',
    './unnamed(13).jpg',
    './unnamed(26).jpg',
    './unnamed(29).jpg',
    './Schermafbeelding 2025-11-05 010211.png',
  ],
  // Karussell-Einstellungen
  ROTATION_INTERVAL: 8000, // 8 Sekunden
  TRANSITION_DURATION: 1000, // 1 Sekunde Fade
  FADE_CLASS: 'carousel-fade',
};

let carouselImages = [];
let currentImageIndex = 0;
let carouselInterval = null;

/**
 * Lädt alle verfügbaren Bilder (öffentlich + lokal)
 */
async function loadCarouselImages() {
  const images = [];
  
  // Lokale Bilder hinzufügen (mit Fehlerbehandlung)
  for (const localPath of ROOM_CAROUSEL_CONFIG.LOCAL_IMAGES) {
    try {
      // Prüfe ob Bild existiert (async check mit Timeout)
      const img = new Image();
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(); // Timeout: Bild nicht gefunden
        }, 2000); // 2 Sekunden Timeout
        
        img.onload = () => {
          clearTimeout(timeout);
          images.push({
            src: localPath,
            type: 'local',
            loaded: true,
          });
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          // Bild existiert nicht, überspringen
          resolve();
        };
        img.src = localPath;
      });
    } catch (e) {
      // Fehler beim Laden, überspringen
      console.warn(`Bild nicht gefunden: ${localPath}`);
    }
  }
  
  // Öffentliche Bilder hinzufügen
  ROOM_CAROUSEL_CONFIG.PUBLIC_IMAGE_SOURCES.forEach((url) => {
    images.push({
      src: url,
      type: 'public',
      loaded: false, // Wird beim ersten Laden geprüft
    });
  });
  
  // Mischen für Abwechslung
  carouselImages = shuffleArray(images);
  
  return carouselImages;
}

/**
 * Mischt ein Array zufällig
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Erstellt das Bildkarussell-Element
 */
function createCarouselElement() {
  const container = document.createElement('div');
  container.className = 'room-image-carousel';
  container.innerHTML = `
    <div class="carousel-wrapper">
      <img class="carousel-image active" id="carouselImg1" alt="Raum-Bild 1">
      <img class="carousel-image" id="carouselImg2" alt="Raum-Bild 2">
      <div class="carousel-overlay"></div>
      <div class="carousel-controls">
        <button class="carousel-btn prev" id="carouselPrev" aria-label="Vorheriges Bild">‹</button>
        <button class="carousel-btn next" id="carouselNext" aria-label="Nächstes Bild">›</button>
      </div>
      <div class="carousel-indicators" id="carouselIndicators"></div>
    </div>
  `;
  
  return container;
}

/**
 * Lädt ein Bild in ein img-Element
 */
function loadImageIntoElement(imgEl, imageData) {
  return new Promise((resolve, reject) => {
    imgEl.onload = () => {
      imageData.loaded = true;
      resolve();
    };
    imgEl.onerror = () => {
      // Bild konnte nicht geladen werden, nächstes versuchen
      reject(new Error(`Bild konnte nicht geladen werden: ${imageData.src}`));
    };
    imgEl.src = imageData.src;
  });
}

/**
 * Wechselt zum nächsten Bild
 */
async function rotateCarousel() {
  if (carouselImages.length === 0) return;
  
  const img1 = document.getElementById('carouselImg1');
  const img2 = document.getElementById('carouselImg2');
  const indicators = document.getElementById('carouselIndicators');
  
  if (!img1 || !img2) return;
  
  // Nächstes Bild laden
  currentImageIndex = (currentImageIndex + 1) % carouselImages.length;
  const nextImage = carouselImages[currentImageIndex];
  
  // Bestimme welches img-Element gerade sichtbar ist
  const activeEl = img1.classList.contains('active') ? img1 : img2;
  const hiddenEl = activeEl === img1 ? img2 : img1;
  
  // Lade nächstes Bild in verstecktes Element
  try {
    await loadImageIntoElement(hiddenEl, nextImage);
    
    // Fade-Transition
    activeEl.classList.add(ROOM_CAROUSEL_CONFIG.FADE_CLASS);
    hiddenEl.classList.add('active');
    
    setTimeout(() => {
      activeEl.classList.remove('active', ROOM_CAROUSEL_CONFIG.FADE_CLASS);
      hiddenEl.classList.remove(ROOM_CAROUSEL_CONFIG.FADE_CLASS);
    }, ROOM_CAROUSEL_CONFIG.TRANSITION_DURATION);
    
    // Indicators aktualisieren
    updateIndicators(indicators);
  } catch (e) {
    console.warn('Fehler beim Laden des Karussell-Bildes:', e);
    // Nächstes Bild versuchen
    setTimeout(rotateCarousel, 1000);
  }
}

/**
 * Aktualisiert die Indikatoren
 */
function updateIndicators(indicatorsEl) {
  if (!indicatorsEl) return;
  
  indicatorsEl.innerHTML = '';
  carouselImages.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.className = `indicator-dot ${index === currentImageIndex ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      currentImageIndex = index;
      rotateCarousel();
    });
    indicatorsEl.appendChild(dot);
  });
}

/**
 * Initialisiert das Bildkarussell
 */
export async function initRoomImageCarousel(containerSelector = '#roomCarouselContainer') {
  // Warte bis DOM bereit ist
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }
  
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn('Karussell-Container nicht gefunden:', containerSelector);
    // Versuche später nochmal
    setTimeout(() => initRoomImageCarousel(containerSelector), 500);
    return;
  }
  
  // Bilder laden
  await loadCarouselImages();
  
  if (carouselImages.length === 0) {
    console.warn('Keine Bilder für Karussell gefunden');
    return;
  }
  
  // Karussell-Element erstellen
  const carouselEl = createCarouselElement();
  container.appendChild(carouselEl);
  
  // Erstes Bild laden
  const img1 = document.getElementById('carouselImg1');
  if (img1 && carouselImages.length > 0) {
    try {
      await loadImageIntoElement(img1, carouselImages[0]);
      updateIndicators(document.getElementById('carouselIndicators'));
    } catch (e) {
      console.warn('Fehler beim Laden des ersten Bildes:', e);
    }
  }
  
  // Navigation-Buttons
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex - 1 + carouselImages.length) % carouselImages.length;
      rotateCarousel();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      rotateCarousel();
    });
  }
  
  // Automatische Rotation starten
  if (carouselInterval) {
    clearInterval(carouselInterval);
  }
  carouselInterval = setInterval(rotateCarousel, ROOM_CAROUSEL_CONFIG.ROTATION_INTERVAL);
  
  // Pause bei Hover
  const carouselWrapper = document.querySelector('.carousel-wrapper');
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', () => {
      if (carouselInterval) {
        clearInterval(carouselInterval);
      }
    });
    carouselWrapper.addEventListener('mouseleave', () => {
      carouselInterval = setInterval(rotateCarousel, ROOM_CAROUSEL_CONFIG.ROTATION_INTERVAL);
    });
  }
  
  console.log('✅ Bildkarussell initialisiert mit', carouselImages.length, 'Bildern');
}

/**
 * Stoppt das Karussell
 */
export function stopRoomImageCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
}

// Auto-Init wenn DOM bereit
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wird manuell von honeycomb.html aufgerufen
  });
} else {
  // DOM bereits bereit
}

