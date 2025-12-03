#!/usr/bin/env bash
#
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  AUTO-FIX SYSTEM                                                          ║
# ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║
# ║                                                                           ║
# ║  Ein Knopf: Clean → Build → Hash → SW-Version → Deploy → CDN Purge       ║
# ╚═══════════════════════════════════════════════════════════════════════════╝
#
set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════════
# KONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

ROOT="${1:-.}"
BUILD="$ROOT/docs_build"
ASSETS="$BUILD/docs_assets"
SW="$BUILD/sw.js"

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║  ⚡ AUTO-FIX SYSTEM                                                       ║"
echo "║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Timestamp für Logs
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
CACHE_VERSION="osos-cache-v$(date +%s)"

# ═══════════════════════════════════════════════════════════════════════════════
# [1/7] CLEAN
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}[1/7] Clean Build-Verzeichnis...${NC}"

if [ -d "$BUILD" ]; then
    rm -rf "$BUILD"
    echo -e "  ${GREEN}✓${NC} Altes Build gelöscht"
fi
mkdir -p "$BUILD"
mkdir -p "$ASSETS"
echo -e "  ${GREEN}✓${NC} Neues Build-Verzeichnis erstellt"

# ═══════════════════════════════════════════════════════════════════════════════
# [2/7] DETERMINISTIC BUILD
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[2/7] Deterministischer Build...${NC}"

# Prüfe ob build_docs.sh existiert
if [ -f "$ROOT/scripts/build_docs.sh" ]; then
    chmod +x "$ROOT/scripts/build_docs.sh"
    "$ROOT/scripts/build_docs.sh" "$ROOT"
    echo -e "  ${GREEN}✓${NC} build_docs.sh ausgeführt"
else
    # Fallback: Kopiere HTML/CSS/JS direkt
    echo -e "  ${YELLOW}⚠${NC} build_docs.sh nicht gefunden, verwende Fallback..."
    
    # Kopiere alle HTML
    find "$ROOT" -maxdepth 1 -name "*.html" -exec cp {} "$BUILD/" \;
    
    # Kopiere Assets
    if [ -d "$ROOT/docs_assets" ]; then
        cp -r "$ROOT/docs_assets/"* "$ASSETS/" 2>/dev/null || true
    fi
    
    # Kopiere CSS/JS aus Root
    find "$ROOT" -maxdepth 1 -name "*.css" -exec cp {} "$ASSETS/" \; 2>/dev/null || true
    find "$ROOT" -maxdepth 1 -name "*.js" -exec cp {} "$ASSETS/" \; 2>/dev/null || true
    
    echo -e "  ${GREEN}✓${NC} Fallback-Build abgeschlossen"
fi

# Zähle Dateien
HTML_COUNT=$(find "$BUILD" -name "*.html" | wc -l)
CSS_COUNT=$(find "$ASSETS" -name "*.css" 2>/dev/null | wc -l)
JS_COUNT=$(find "$ASSETS" -name "*.js" 2>/dev/null | wc -l)
echo -e "  ${GREEN}✓${NC} Gebaut: ${HTML_COUNT} HTML, ${CSS_COUNT} CSS, ${JS_COUNT} JS"

# ═══════════════════════════════════════════════════════════════════════════════
# [3/7] CACHE-BUSTING (HASH FILENAMES)
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[3/7] Cache-Busting (Hash Dateinamen)...${NC}"

HASHED_COUNT=0

# Finde alle Assets und füge Hash hinzu
if [ -d "$ASSETS" ]; then
    for f in $(find "$ASSETS" -type f \( -name "*.css" -o -name "*.js" -o -name "*.png" -o -name "*.svg" -o -name "*.jpg" -o -name "*.woff2" \) 2>/dev/null); do
        if [ -f "$f" ]; then
            # Berechne Hash
            if command -v sha256sum &> /dev/null; then
                h=$(sha256sum "$f" | cut -c1-12)
            elif command -v shasum &> /dev/null; then
                h=$(shasum -a 256 "$f" | cut -c1-12)
            else
                # Fallback: Timestamp
                h=$(date +%s | cut -c1-12)
            fi
            
            # Neue Dateinamen
            ext="${f##*.}"
            base="${f%.*}"
            new="${base}.${h}.${ext}"
            
            # Umbenennen
            mv "$f" "$new"
            
            # Referenzen in HTML ersetzen
            oldname="$(basename "$f")"
            newname="$(basename "$new")"
            
            find "$BUILD" -name "*.html" -print0 2>/dev/null | xargs -0 sed -i "s|$oldname|$newname|g" 2>/dev/null || true
            
            ((HASHED_COUNT++)) || true
        fi
    done
fi

echo -e "  ${GREEN}✓${NC} ${HASHED_COUNT} Dateien mit Hash versehen"

# ═══════════════════════════════════════════════════════════════════════════════
# [4/7] SERVICE WORKER VERSION BUMP
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[4/7] Service Worker Version Bump...${NC}"

# Erstelle oder aktualisiere SW
cat > "$SW" << EOF
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  SERVICE WORKER - AUTO-GENERATED                                          ║
// ║  [.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS                                   ║
// ║                                                                           ║
// ║  Version: $CACHE_VERSION                                                  ║
// ║  Generated: $TIMESTAMP                                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const CACHE = '$CACHE_VERSION';
const ASSETS = [
    '/',
    '/index.html'
];

// Install: Cache Assets
self.addEventListener('install', e => {
    console.log('[SW] Install:', CACHE);
    e.waitUntil(
        caches.open(CACHE)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: Lösche alte Caches
self.addEventListener('activate', e => {
    console.log('[SW] Activate:', CACHE);
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE).map(k => {
                    console.log('[SW] Lösche alten Cache:', k);
                    return caches.delete(k);
                })
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch: Cache-first mit Network-Fallback, aber HTML immer frisch
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    
    // HTML immer frisch laden
    if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
        e.respondWith(
            fetch(e.request, { cache: 'no-store' })
                .catch(() => caches.match(e.request))
        );
        return;
    }
    
    // Assets: Cache-first
    e.respondWith(
        caches.match(e.request)
            .then(r => r || fetch(e.request, { cache: 'no-store' }))
    );
});
EOF

echo -e "  ${GREEN}✓${NC} Service Worker erstellt: $CACHE_VERSION"

# ═══════════════════════════════════════════════════════════════════════════════
# [5/7] BUILD METADATA IN HTML
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[5/7] Build-Metadaten injizieren...${NC}"

# Git Commit (falls verfügbar)
if command -v git &> /dev/null && git rev-parse --git-dir &> /dev/null; then
    GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
else
    GIT_COMMIT="local"
fi

# Injiziere Metadaten in alle HTML-Dateien
for html in $(find "$BUILD" -name "*.html" 2>/dev/null); do
    # Füge Footer mit Build-Info hinzu (vor </body>)
    sed -i "s|</body>|<footer class=\"build-info\" style=\"position:fixed;bottom:0;right:0;padding:4px 8px;font-size:10px;opacity:0.5;font-family:monospace;\">Build: $TIMESTAMP · Commit: $GIT_COMMIT · Cache: $CACHE_VERSION</footer></body>|g" "$html" 2>/dev/null || true
done

echo -e "  ${GREEN}✓${NC} Metadaten injiziert (Commit: $GIT_COMMIT)"

# ═══════════════════════════════════════════════════════════════════════════════
# [6/7] DEPLOY (OPTIONAL)
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[6/7] Deploy...${NC}"

# Prüfe ob DEPLOY_TARGET gesetzt ist
if [ -n "${DEPLOY_TARGET:-}" ]; then
    echo -e "  Deploye nach: $DEPLOY_TARGET"
    
    case "$DEPLOY_TARGET" in
        rsync:*)
            TARGET="${DEPLOY_TARGET#rsync:}"
            rsync -avz --delete "$BUILD/" "$TARGET"
            echo -e "  ${GREEN}✓${NC} rsync deploy abgeschlossen"
            ;;
        github:*)
            echo -e "  ${YELLOW}⚠${NC} GitHub Pages: Push zu gh-pages Branch erforderlich"
            # git subtree push --prefix docs_build origin gh-pages
            ;;
        *)
            echo -e "  ${YELLOW}⚠${NC} Unbekanntes Deploy-Ziel: $DEPLOY_TARGET"
            ;;
    esac
else
    echo -e "  ${YELLOW}⚠${NC} Kein DEPLOY_TARGET gesetzt"
    echo -e "      Setze z.B.: DEPLOY_TARGET=rsync:user@server:/var/www/"
    echo -e "      Oder für GitHub: git push origin main"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# [7/7] CDN PURGE & LOCAL CACHE TIPS
# ═══════════════════════════════════════════════════════════════════════════════

echo -e "\n${CYAN}[7/7] CDN Purge & Cache-Tipps...${NC}"

# Cloudflare Purge (falls Credentials vorhanden)
if [ -n "${CLOUDFLARE_ZONE_ID:-}" ] && [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
    echo -e "  Purge Cloudflare Cache..."
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything":true}' > /dev/null
    echo -e "  ${GREEN}✓${NC} Cloudflare Cache geleert"
else
    echo -e "  ${YELLOW}⚠${NC} Cloudflare nicht konfiguriert"
fi

# Lokale Cache-Tipps
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║  📋 LOKALE CACHE-TIPPS                                                    ║${NC}"
echo -e "${PURPLE}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${PURPLE}║  Chrome/Edge:                                                             ║${NC}"
echo -e "${PURPLE}║    → DevTools (F12) → Application → Service Workers → Unregister         ║${NC}"
echo -e "${PURPLE}║    → Hard Reload: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)              ║${NC}"
echo -e "${PURPLE}║                                                                           ║${NC}"
echo -e "${PURPLE}║  Firefox:                                                                 ║${NC}"
echo -e "${PURPLE}║    → DevTools → Storage → Clear Site Data                                 ║${NC}"
echo -e "${PURPLE}║    → Hard Reload: Ctrl+Shift+R                                            ║${NC}"
echo -e "${PURPLE}║                                                                           ║${NC}"
echo -e "${PURPLE}║  Safari:                                                                  ║${NC}"
echo -e "${PURPLE}║    → Develop → Empty Caches                                               ║${NC}"
echo -e "${PURPLE}║    → Hard Reload: Cmd+Option+R                                            ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"

# ═══════════════════════════════════════════════════════════════════════════════
# ZUSAMMENFASSUNG
# ═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ AUTO-FIX ABGESCHLOSSEN                                                ║${NC}"
echo -e "${GREEN}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Build:         $BUILD${NC}"
echo -e "${GREEN}║  Cache-Version: $CACHE_VERSION${NC}"
echo -e "${GREEN}║  Commit:        $GIT_COMMIT${NC}"
echo -e "${GREEN}║  Timestamp:     $TIMESTAMP${NC}"
echo -e "${GREEN}║  Gehashte:      $HASHED_COUNT Dateien${NC}"
echo -e "${GREEN}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Lokaler Test:  python3 -m http.server 8080 --directory $BUILD${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${PURPLE}[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT${NC}"
