// Link System - Visual Connections
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
function renderLinks() {
  try {
    const svg = document.getElementById('links-svg');
    if (!svg) {
      console.error('links-svg not found');
      return;
    }
    
    if (!window.factoryEngine || !window.factoryEngine.links) {
      console.error('FactoryEngine not initialized');
      return;
    }
    
    svg.innerHTML = '';
    
    window.factoryEngine.links.forEach((link, linkId) => {
      try {
        const path = createLinkPath(link);
        if (path) {
          svg.appendChild(path);
        }
      } catch (e) {
        if (window.errorFixSystem) {
          window.errorFixSystem.reportError(e, { context: 'renderLinks', linkId });
        } else {
          console.error(`Error rendering link ${linkId}:`, e);
        }
      }
    });
  } catch (e) {
    if (window.errorFixSystem) {
      window.errorFixSystem.reportError(e, { context: 'renderLinks' });
    } else {
      console.error('Error in renderLinks:', e);
    }
  }
}

function createLinkPath(link) {
  try {
    if (!link || !link.sourceModule || !link.targetModule) {
      console.warn('Invalid link:', link);
      return null;
    }
    
    const sourceModule = document.getElementById(link.sourceModule);
    const targetModule = document.getElementById(link.targetModule);
    
    if (!sourceModule || !targetModule) {
      // Module nicht gefunden - Link wird nicht gerendert, aber nicht gelöscht
      return null;
    }
    
    const workspace = document.getElementById('workspace');
    if (!workspace) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(new Error('workspace not found'), { context: 'createLinkPath' });
      } else {
        console.error('workspace not found');
      }
      return null;
    }
    
    const svg = document.getElementById('links-svg');
    if (!svg) {
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(new Error('links-svg not found'), { context: 'createLinkPath' });
      } else {
        console.error('links-svg not found');
      }
      return null;
    }
    
    const sourceRect = sourceModule.getBoundingClientRect();
    const targetRect = targetModule.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    
    // Berechne Positionen relativ zum SVG
    const sourceX = sourceRect.right - svgRect.left;
    const sourceY = sourceRect.top + sourceRect.height / 2 - svgRect.top;
    const targetX = targetRect.left - svgRect.left;
    const targetY = targetRect.top + targetRect.height / 2 - svgRect.top;
    
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const cp1x = sourceX + dx * 0.5;
    const cp1y = sourceY;
    const cp2x = targetX - dx * 0.5;
    const cp2y = targetY;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${sourceX} ${sourceY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`);
    path.setAttribute('class', 'link-path');
    path.setAttribute('data-link-id', link.id || '');
    path.setAttribute('stroke', getLinkColor(link.type || 'material'));
    
    path.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Verbindung löschen?')) {
        if (window.factoryEngine && typeof window.factoryEngine.deleteLink === 'function') {
          window.factoryEngine.deleteLink(link.id);
          if (typeof window.renderLinks === 'function') {
            window.renderLinks();
          }
        }
      }
    });
    
    return path;
  } catch (e) {
    console.error('Error creating link path:', e);
    return null;
  }
}

function getLinkColor(type) {
  try {
    const colors = {
      'material': '#39d0ff',
      'energy': '#ff6bcb',
      'information': '#4ade80'
    };
    return colors[type] || colors['material'] || '#39d0ff';
  } catch (e) {
    if (window.errorFixSystem) {
      window.errorFixSystem.reportError(e, { context: 'getLinkColor' });
    } else {
      console.error('Error getting link color:', e);
    }
    return '#39d0ff';
  }
}

// Sicherstellen dass Funktionen verfügbar sind
if (typeof window !== 'undefined') {
  window.renderLinks = renderLinks;
  window.getLinkColor = getLinkColor;
}



