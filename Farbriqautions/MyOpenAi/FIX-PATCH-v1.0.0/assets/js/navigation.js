/**
 * TOGETHERSYSTEMS Navigation Helper
 * Ensures consistent navigation across all pages
 * Fixes broken links and adds navigation UI
 */

(function() {
  'use strict';

  const CONFIG = {
    pages: [
      { href: 'index.html', icon: '🏠', label: 'Home' },
      { href: 'manifest-portal.html', icon: '🌐', label: 'Portal' },
      { href: 'manifest-forum.html', icon: '💬', label: 'Forum' },
      { href: 'honeycomb.html', icon: '🐝', label: 'Räume' },
      { href: 'admin.html', icon: '⚙️', label: 'Admin' },
      { href: 'legal-hub.html', icon: '⚖️', label: 'Legal' }
    ],
    linkFixes: {
      'javascript:void(0)': '#',
      'javascript:void(0);': '#',
      'javascript:;': '#',
      'manifst-portal.html': 'manifest-portal.html',
      'manifest_portal.html': 'manifest-portal.html',
      'adminn.html': 'admin.html',
      'admin-panel.html': 'admin.html',
      'home.html': 'index.html',
      'main.html': 'index.html',
      'forum.html': 'manifest-forum.html',
      'legal.html': 'legal-hub.html',
      'honeycomb-room.html': 'honeycomb.html'
    }
  };

  /**
   * Add floating back button
   */
  function addBackButton() {
    if (document.querySelector('.ts-back-button')) return;
    
    const btn = document.createElement('button');
    btn.className = 'ts-back-button';
    btn.innerHTML = '← Zurück';
    btn.setAttribute('aria-label', 'Zurück zur vorherigen Seite');
    
    btn.onclick = function(e) {
      e.preventDefault();
      if (document.referrer && document.referrer.includes(location.host)) {
        history.back();
      } else {
        location.href = 'index.html';
      }
    };
    
    document.body.appendChild(btn);
  }

  /**
   * Add floating home button
   */
  function addHomeButton() {
    if (document.querySelector('.ts-home-button')) return;
    
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'index.html' || currentPage === '') return;
    
    const btn = document.createElement('button');
    btn.className = 'ts-home-button';
    btn.innerHTML = '🏠';
    btn.setAttribute('aria-label', 'Zur Startseite');
    btn.title = 'Zur Startseite';
    
    btn.onclick = function(e) {
      e.preventDefault();
      location.href = 'index.html';
    };
    
    document.body.appendChild(btn);
  }

  /**
   * Highlight current page in navigation
   */
  function highlightCurrentPage() {
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.ts-navigation .nav-link, nav a, .nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Fix any remaining broken links on page load
   */
  function fixBrokenLinks() {
    const links = document.querySelectorAll('a[href]');
    let fixed = 0;

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (CONFIG.linkFixes[href]) {
        link.setAttribute('href', CONFIG.linkFixes[href]);
        fixed++;
        console.log('[NavFix] Fixed:', href, '→', CONFIG.linkFixes[href]);
      }
    });

    if (fixed > 0) {
      console.log(`[NavFix] Fixed ${fixed} broken links`);
    }
  }

  /**
   * Fix onclick handlers with broken page references
   */
  function fixOnclickHandlers() {
    const elements = document.querySelectorAll('[onclick]');
    
    elements.forEach(el => {
      const onclick = el.getAttribute('onclick');
      
      for (const [broken, fixed] of Object.entries(CONFIG.linkFixes)) {
        if (onclick.includes(broken)) {
          el.setAttribute('onclick', onclick.replace(broken, fixed));
          console.log('[NavFix] Fixed onclick:', broken, '→', fixed);
        }
      }
    });
  }

  /**
   * Add breadcrumb navigation
   */
  function addBreadcrumb() {
    if (document.querySelector('.ts-breadcrumb')) return;
    
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const pageInfo = CONFIG.pages.find(p => p.href === currentPage);
    
    if (!pageInfo || currentPage === 'index.html') return;
    
    const nav = document.querySelector('.ts-navigation, nav');
    if (!nav) return;
    
    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'ts-breadcrumb';
    breadcrumb.innerHTML = `
      <a href="index.html">🏠 Home</a>
      <span class="separator">›</span>
      <span class="current">${pageInfo.icon} ${pageInfo.label}</span>
    `;
    
    nav.parentNode.insertBefore(breadcrumb, nav.nextSibling);
  }

  /**
   * Add page transition animation
   */
  function addPageTransition() {
    document.body.classList.add('ts-page-enter');
  }

  /**
   * Show toast notification
   */
  function showToast(message, type = 'info') {
    const existing = document.querySelector('.ts-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `ts-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
  }

  /**
   * Validate all links on page
   */
  function validateLinks() {
    const links = document.querySelectorAll('a[href]');
    const issues = [];
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      
      // Skip external, anchor, and special links
      if (!href || 
          href.startsWith('http') || 
          href.startsWith('#') || 
          href.startsWith('mailto:') ||
          href.startsWith('tel:')) {
        return;
      }
      
      // Check for problematic patterns
      if (href === '' || href === 'javascript:void(0)' || href === 'javascript:;') {
        issues.push({
          element: link,
          href: href,
          text: link.textContent?.trim() || '[no text]',
          issue: 'Empty or void link'
        });
      }
    });
    
    if (issues.length > 0) {
      console.warn('[NavFix] Found link issues:', issues);
    }
    
    return issues;
  }

  /**
   * Initialize navigation helper
   */
  function init() {
    // Fix broken links first
    fixBrokenLinks();
    fixOnclickHandlers();
    
    // Add navigation UI
    addBackButton();
    addHomeButton();
    highlightCurrentPage();
    addBreadcrumb();
    addPageTransition();
    
    // Validate links (for debugging)
    if (localStorage.getItem('ts-debug') === 'true') {
      validateLinks();
    }
    
    console.log('[TOGETHERSYSTEMS] Navigation initialized ✓');
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for external use
  window.TSNavigation = {
    showToast,
    validateLinks,
    fixBrokenLinks,
    config: CONFIG
  };

})();

