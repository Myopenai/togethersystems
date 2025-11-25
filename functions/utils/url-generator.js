// URL-Generator für Mikro-Sites
// Generiert maschinengenerierte URLs im Format: T,.&T,,.&T,,,.etc.

/**
 * Generiert eine Mikro-Site-URL im T,. Format
 * @param {string} userId - User-ID (z.B. aus Portal-Verifizierung)
 * @param {string[]} pathSegments - Array von Pfad-Segmenten (optional)
 * @returns {string} - Formatierte URL (z.B. "T,user123.&T,,about.&T,,,team.")
 */
export function generateMicrositeUrl(userId, pathSegments = []) {
  if (!userId) throw new Error('userId is required');
  
  // Basis: T,userId.
  let url = `T,${userId}.`;
  
  // Jedes zusätzliche Segment bekommt +1 Komma
  pathSegments.forEach((segment, index) => {
    const commas = ','.repeat(index + 2); // +2 weil Basis bereits , hat
    url += `&T${commas}${segment}.`;
  });
  
  return url;
}

/**
 * Dekodiert eine Mikro-Site-URL
 * @param {string} url - Formatierte URL (z.B. "T,user123.&T,,about.")
 * @returns {{userId: string, segments: string[]} | null}
 */
export function decodeMicrositeUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  // Basis-Pattern: T,userId.
  const baseMatch = url.match(/^T,([^.]+)\./);
  if (!baseMatch) return null;
  
  const userId = baseMatch[1];
  const rest = url.substring(baseMatch[0].length);
  
  // Extrahiere alle Segmente: &T,,segment.
  const segments = [];
  const segmentRegex = /&T(,+)([^.]+)\./g;
  let match;
  
  while ((match = segmentRegex.exec(rest)) !== null) {
    segments.push(match[2]);
  }
  
  return { userId, segments };
}

/**
 * Konvertiert URL zu normalem Pfad (für Datenbank)
 * @param {string} micrositeUrl - T,. Format URL
 * @returns {string} - Normaler Pfad (z.B. "/" oder "/about/team")
 */
export function urlToPath(micrositeUrl) {
  const decoded = decodeMicrositeUrl(micrositeUrl);
  if (!decoded) return '/';
  
  if (decoded.segments.length === 0) return '/';
  return '/' + decoded.segments.join('/');
}

/**
 * Konvertiert normalen Pfad zu Mikro-Site-URL
 * @param {string} userId - User-ID
 * @param {string} path - Normaler Pfad (z.B. "/about/team")
 * @returns {string} - T,. Format URL
 */
export function pathToUrl(userId, path) {
  if (!path || path === '/') {
    return generateMicrositeUrl(userId, []);
  }
  
  // Entferne führenden Slash und split
  const segments = path.split('/').filter(s => s.length > 0);
  return generateMicrositeUrl(userId, segments);
}

/**
 * Validiert eine Mikro-Site-URL
 * @param {string} url - Zu validierende URL
 * @returns {boolean}
 */
export function isValidMicrositeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Muss mit T, beginnen und . enden
  if (!url.startsWith('T,') || !url.endsWith('.')) return false;
  
  // Prüfe Format
  const decoded = decodeMicrositeUrl(url);
  return decoded !== null && decoded.userId.length > 0;
}

/**
 * Extrahiert User-ID aus URL
 * @param {string} url - Mikro-Site-URL
 * @returns {string | null}
 */
export function extractUserIdFromUrl(url) {
  const decoded = decodeMicrositeUrl(url);
  return decoded ? decoded.userId : null;
}


