/**
 * YORDY Artist Showcase Integration
 * 
 * Integriert die YORDY Showcase prominent in das System
 */

// Erstellt einen prominenten Link zur YORDY Showcase
function createYordyShowcaseLink() {
  const showcaseLink = document.createElement('a');
  showcaseLink.href = './YORDY/yordy-artist-showcase.html';
  showcaseLink.className = 'yordy-showcase-link';
  showcaseLink.innerHTML = `
    <div class="yordy-link-content">
      <div class="yordy-link-icon">🎨</div>
      <div class="yordy-link-text">
        <strong>YORDY</strong>
        <span>Artist Showcase - MicroLED Quality</span>
      </div>
      <div class="yordy-link-arrow">→</div>
    </div>
  `;
  showcaseLink.style.cssText = `
    display: block;
    margin: 1rem 0;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1));
    border: 2px solid #00ffff;
    border-radius: 12px;
    text-decoration: none;
    color: #00ffff;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  `;
  
  // Hover-Effekt
  showcaseLink.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.02)';
    this.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.5)';
    this.style.borderColor = '#ff00ff';
  });
  
  showcaseLink.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
    this.style.boxShadow = 'none';
    this.style.borderColor = '#00ffff';
  });
  
  return showcaseLink;
}

// Fügt YORDY Showcase zu einem Container hinzu
function integrateYordyShowcase(containerSelector, position = 'prepend') {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  const link = createYordyShowcaseLink();
  
  if (position === 'prepend') {
    container.insertBefore(link, container.firstChild);
  } else {
    container.appendChild(link);
  }
}

// Auto-Integration bei Seitenladen
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Integration in verschiedene Bereiche
    integrateYordyShowcase('main', 'prepend');
    integrateYordyShowcase('.toolbar', 'append');
    integrateYordyShowcase('nav', 'append');
  });
} else {
  // Bereits geladen
  integrateYordyShowcase('main', 'prepend');
  integrateYordyShowcase('.toolbar', 'append');
  integrateYordyShowcase('nav', 'append');
}

// Export für manuelle Integration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createYordyShowcaseLink,
    integrateYordyShowcase
  };
}








