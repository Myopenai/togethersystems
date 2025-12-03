/**
 * TOGETHERSYSTEMS - Automatic Link Fixer
 * 
 * This script automatically finds and fixes broken links in HTML files.
 * Run with: node auto-fix-links.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const HTML_FILES = [
  'index.html',
  'admin.html',
  'manifest-forum.html',
  'manifest-portal.html',
  'honeycomb.html',
  'legal-hub.html'
];

// Known correct paths mapping (broken -> fixed)
const LINK_FIXES = {
  // Common typos and wrong paths
  'manifst-portal.html': 'manifest-portal.html',
  'manifest_portal.html': 'manifest-portal.html',
  'manifest-portaal.html': 'manifest-portal.html',
  'adminn.html': 'admin.html',
  'admin-panel.html': 'admin.html',
  'honeycomb-room.html': 'honeycomb.html',
  'legal.html': 'legal-hub.html',
  'legalhub.html': 'legal-hub.html',
  'forum.html': 'manifest-forum.html',
  'manifest_forum.html': 'manifest-forum.html',
  'home.html': 'index.html',
  'main.html': 'index.html',
  './index': 'index.html',
  '/index': 'index.html',
  
  // Assets paths
  'assets/branding': 'assets/branding/',
  '/assets/': 'assets/',
  '../assets/': 'assets/',
  
  // JavaScript void fixes
  'javascript:void(0)': '#',
  'javascript:void(0);': '#',
  'javascript:;': '#',
};

// Statistics
let totalFixed = 0;
let filesModified = 0;

function fixHtmlFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  let fixCount = 0;

  // Fix known broken links
  for (const [broken, fixed] of Object.entries(LINK_FIXES)) {
    const regex = new RegExp(`href=["']${escapeRegex(broken)}["']`, 'gi');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, `href="${fixed}"`);
      fixCount += matches.length;
      console.log(`  ✓ Fixed: ${broken} → ${fixed} (${matches.length}x)`);
    }
  }

  // Fix empty hrefs
  const emptyHrefRegex = /href=["']\s*["']/g;
  const emptyMatches = content.match(emptyHrefRegex);
  if (emptyMatches) {
    content = content.replace(emptyHrefRegex, 'href="#"');
    fixCount += emptyMatches.length;
    console.log(`  ✓ Fixed ${emptyMatches.length} empty href attributes`);
  }

  // Fix onclick with broken references
  const onclickPattern = /onclick=["']location\.href\s*=\s*['"]([^'"]+)['"]["']/g;
  let match;
  while ((match = onclickPattern.exec(originalContent)) !== null) {
    const targetPage = match[1];
    if (LINK_FIXES[targetPage]) {
      const oldOnclick = match[0];
      const newOnclick = oldOnclick.replace(targetPage, LINK_FIXES[targetPage]);
      content = content.replace(oldOnclick, newOnclick);
      fixCount++;
      console.log(`  ✓ Fixed onclick: ${targetPage} → ${LINK_FIXES[targetPage]}`);
    }
  }

  // Add missing .html extensions
  const noExtensionPattern = /href=["']([a-zA-Z0-9-]+)["']/g;
  content = content.replace(noExtensionPattern, (match, page) => {
    // Skip if it's already a valid reference
    if (page.includes('.') || page.startsWith('#') || page.startsWith('http')) {
      return match;
    }
    // Check if page.html exists
    const expectedFile = page + '.html';
    if (HTML_FILES.includes(expectedFile)) {
      fixCount++;
      console.log(`  ✓ Added .html extension: ${page} → ${expectedFile}`);
      return `href="${expectedFile}"`;
    }
    return match;
  });

  // Save if modified
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    filesModified++;
    totalFixed += fixCount;
    console.log(`  📝 Saved ${path.basename(filePath)} with ${fixCount} fixes\n`);
  } else {
    console.log(`  ✓ No fixes needed for ${path.basename(filePath)}\n`);
  }
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureNavigation() {
  console.log('\n🔗 Checking navigation consistency...\n');
  
  const navHtml = `
<!-- TOGETHERSYSTEMS Navigation - Auto-generated -->
<nav id="ts-main-nav" class="ts-navigation">
  <a href="index.html" class="nav-link" data-page="home">🏠 Home</a>
  <a href="manifest-portal.html" class="nav-link" data-page="portal">🌐 Portal</a>
  <a href="manifest-forum.html" class="nav-link" data-page="forum">💬 Forum</a>
  <a href="honeycomb.html" class="nav-link" data-page="honeycomb">🐝 Räume</a>
  <a href="admin.html" class="nav-link" data-page="admin">⚙️ Admin</a>
  <a href="legal-hub.html" class="nav-link" data-page="legal">⚖️ Legal</a>
</nav>
`;

  // Create navigation component file
  const navFilePath = path.join(ROOT_DIR, 'components', 'navigation.html');
  const componentsDir = path.join(ROOT_DIR, 'components');
  
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  
  fs.writeFileSync(navFilePath, navHtml, 'utf-8');
  console.log(`  ✓ Created navigation component: components/navigation.html`);
}

function createNavigationCSS() {
  const cssContent = `
/* TOGETHERSYSTEMS Navigation Styles */
.ts-navigation {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 2px solid #0f3460;
  flex-wrap: wrap;
  justify-content: center;
}

.ts-navigation .nav-link {
  color: #e94560;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.ts-navigation .nav-link:hover {
  background: rgba(233, 69, 96, 0.2);
  transform: translateY(-2px);
}

.ts-navigation .nav-link.active {
  background: #e94560;
  color: white;
}

/* Back button styling */
.ts-back-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: #e94560;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4);
  transition: all 0.3s ease;
  z-index: 9999;
}

.ts-back-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(233, 69, 96, 0.6);
}
`;

  const cssDir = path.join(ROOT_DIR, 'assets', 'css');
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(cssDir, 'navigation.css'), cssContent, 'utf-8');
  console.log(`  ✓ Created navigation CSS: assets/css/navigation.css`);
}

function createNavigationJS() {
  const jsContent = `
/**
 * TOGETHERSYSTEMS Navigation Helper
 * Ensures consistent navigation across all pages
 */

(function() {
  'use strict';

  // Add back button to all pages
  function addBackButton() {
    if (document.querySelector('.ts-back-button')) return;
    
    const btn = document.createElement('button');
    btn.className = 'ts-back-button';
    btn.innerHTML = '← Zurück';
    btn.onclick = function() {
      if (document.referrer && document.referrer.includes(location.host)) {
        history.back();
      } else {
        location.href = 'index.html';
      }
    };
    document.body.appendChild(btn);
  }

  // Highlight current page in navigation
  function highlightCurrentPage() {
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.ts-navigation .nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // Fix any remaining broken links on page load
  function fixBrokenLinks() {
    const links = document.querySelectorAll('a[href]');
    const fixes = {
      'javascript:void(0)': '#',
      'javascript:void(0);': '#',
      'javascript:;': '#'
    };

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (fixes[href]) {
        link.setAttribute('href', fixes[href]);
        console.log('[NavFix] Fixed broken link:', href);
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    addBackButton();
    highlightCurrentPage();
    fixBrokenLinks();
    console.log('[TOGETHERSYSTEMS] Navigation initialized');
  }
})();
`;

  const jsDir = path.join(ROOT_DIR, 'assets', 'js');
  if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(jsDir, 'navigation.js'), jsContent, 'utf-8');
  console.log(`  ✓ Created navigation JS: assets/js/navigation.js`);
}

// Main execution
console.log('═'.repeat(60));
console.log('  TOGETHERSYSTEMS - Automatic Link Fixer');
console.log('═'.repeat(60));
console.log('');

console.log('📁 Processing HTML files...\n');

for (const file of HTML_FILES) {
  const filePath = path.join(ROOT_DIR, file);
  console.log(`📄 Checking ${file}...`);
  fixHtmlFile(filePath);
}

ensureNavigation();
createNavigationCSS();
createNavigationJS();

console.log('\n' + '═'.repeat(60));
console.log(`  ✅ COMPLETE: Fixed ${totalFixed} issues in ${filesModified} files`);
console.log('═'.repeat(60));
console.log('\nNext steps:');
console.log('1. Add to each HTML file in <head>:');
console.log('   <link rel="stylesheet" href="assets/css/navigation.css">');
console.log('2. Add before </body>:');
console.log('   <script src="assets/js/navigation.js"></script>');
console.log('');

]]