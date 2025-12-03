// T,. Da Vinci Superstudio Animations
// Version: 1.0.0
// Signatur: T,.&T,,.&T,,,.T.
// Jedes einzelne Pixel animiert

class DaVinciAnimations {
    constructor() {
        this.pixelCount = 5000; // Maximale Ausbreitung
        this.animations = [];
        this.init();
    }

    init() {
        this.createPixelCanvas();
        this.createSpirals();
        this.createMorphShapes();
        this.createFlightSimulation();
        this.startPixelAnimation();
    }

    // Pixel-Level Animation - Jedes Pixel einzeln animiert
    createPixelCanvas() {
        const canvas = document.createElement('div');
        canvas.className = 'pixel-canvas';
        document.body.appendChild(canvas);

        for (let i = 0; i < this.pixelCount; i++) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            
            // Zufällige Position
            pixel.style.left = Math.random() * 100 + '%';
            pixel.style.top = Math.random() * 100 + '%';
            
            // Zufällige Farbe aus Da Vinci Palette
            const colors = [
                '#FFD700', '#CD7F32', '#B87333', '#4169E1', 
                '#9370DB', '#DC143C', '#50C878', '#0F52BA'
            ];
            pixel.style.color = colors[Math.floor(Math.random() * colors.length)];
            pixel.style.background = pixel.style.color;
            
            // Zufällige Animation-Delay
            pixel.style.animationDelay = Math.random() * 8 + 's';
            pixel.style.animationDuration = (Math.random() * 4 + 4) + 's';
            
            canvas.appendChild(pixel);
        }
    }

    // Spiral Animation mit Verifikation
    createSpirals() {
        const container = document.querySelector('.spiral-container');
        if (!container) return;

        for (let i = 0; i < 5; i++) {
            const spiral = document.createElement('div');
            spiral.className = 'spiral';
            spiral.style.animationDelay = (i * 0.5) + 's';
            container.appendChild(spiral);
        }
    }

    // Morph Animation mit Systemausbreitung
    createMorphShapes() {
        const container = document.querySelector('.morph-container');
        if (!container) return;

        for (let i = 0; i < 3; i++) {
            const shape = document.createElement('div');
            shape.className = 'morph-shape';
            shape.style.animationDelay = (i * 1) + 's';
            shape.style.width = (300 - i * 50) + 'px';
            shape.style.height = (300 - i * 50) + 'px';
            container.appendChild(shape);
        }
    }

    // Flight Simulation
    createFlightSimulation() {
        const container = document.querySelector('.flight-container');
        if (!container) return;

        const path = document.createElement('div');
        path.className = 'flight-path';
        container.appendChild(path);

        for (let i = 0; i < 3; i++) {
            const obj = document.createElement('div');
            obj.className = 'flight-object';
            obj.style.animationDelay = (i * 5) + 's';
            obj.style.animationDuration = (15 + i * 5) + 's';
            container.appendChild(obj);
        }
    }

    // Start Pixel Animation mit Verifikation
    startPixelAnimation() {
        const pixels = document.querySelectorAll('.pixel');
        
        pixels.forEach((pixel, index) => {
            // Jedes Pixel bekommt individuelle Animation
            const delay = index * 0.001;
            pixel.style.animationDelay = delay + 's';
            
            // Verifikation: Pixel muss sichtbar sein
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        pixel.style.opacity = '1';
                    } else {
                        pixel.style.opacity = '0.3';
                    }
                });
            });
            
            observer.observe(pixel);
        });
    }

    // Systemausbreitung: Dynamische Pixel-Generierung
    expandSystem() {
        const canvas = document.querySelector('.pixel-canvas');
        if (!canvas) return;

        // Füge weitere Pixel hinzu für maximale Ausbreitung
        for (let i = 0; i < 1000; i++) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.style.left = Math.random() * 100 + '%';
            pixel.style.top = Math.random() * 100 + '%';
            
            const colors = [
                '#FFD700', '#CD7F32', '#4169E1', '#9370DB', 
                '#DC143C', '#50C878', '#0F52BA'
            ];
            pixel.style.color = colors[Math.floor(Math.random() * colors.length)];
            pixel.style.background = pixel.style.color;
            pixel.style.animationDelay = Math.random() * 8 + 's';
            
            canvas.appendChild(pixel);
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const animations = new DaVinciAnimations();
    
    // Systemausbreitung nach 5 Sekunden
    setTimeout(() => {
        animations.expandSystem();
    }, 5000);
    
    // Weitere Ausbreitung alle 10 Sekunden
    setInterval(() => {
        animations.expandSystem();
    }, 10000);
});

// Language Switcher
class LanguageSwitcher {
    constructor() {
        this.currentLang = 'DE';
        this.init();
    }

    init() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.switchLanguage(lang);
            });
        });
    }

    switchLanguage(lang) {
        this.currentLang = lang;
        
        // Update buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            }
        });
        
        // Load content for language
        this.loadContent(lang);
    }

    loadContent(lang) {
        // Load appropriate HTML file
        const filename = `index-${lang.toLowerCase()}.html`;
        fetch(filename)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newContent = doc.querySelector('.main-content');
                const oldContent = document.querySelector('.main-content');
                if (newContent && oldContent) {
                    oldContent.innerHTML = newContent.innerHTML;
                }
            })
            .catch(err => console.error('Error loading content:', err));
    }
}

// Initialize language switcher
document.addEventListener('DOMContentLoaded', () => {
    new LanguageSwitcher();
});

