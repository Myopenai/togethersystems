/**
 * T,. OSTOSOS - OS-Detector
 * Erkennt automatisch das Host-OS
 */

function detectHostOS() {
    // Windows
    if (typeof ActiveXObject !== 'undefined') {
        return 'windows';
    }
    if (typeof navigator !== 'undefined' && navigator.platform.includes('Win')) {
        return 'windows';
    }
    if (typeof process !== 'undefined' && process.platform === 'win32') {
        return 'windows';
    }
    
    // macOS
    if (typeof navigator !== 'undefined' && navigator.platform.includes('Mac')) {
        return 'macos';
    }
    if (typeof window !== 'undefined' && typeof window.require !== 'undefined') {
        return 'macos';
    }
    if (typeof process !== 'undefined' && process.platform === 'darwin') {
        return 'macos';
    }
    
    // Linux
    if (typeof navigator !== 'undefined' && navigator.platform.includes('Linux')) {
        return 'linux';
    }
    if (typeof process !== 'undefined' && process.platform === 'linux') {
        return 'linux';
    }
    
    // Unknown
    return 'unknown';
}

// Auto-Start wenn erkannt
if (typeof window !== 'undefined') {
    const os = detectHostOS();
    if (os !== 'unknown') {
        console.log(`[OSTOSOS] Host-OS erkannt: ${os}`);
        // Starte passende Version
        window.location.href = `./ostosos/${os}/OSTOSOS-OS-COMPLETE-SYSTEM.html`;
    }
}

// Export für Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { detectHostOS };
}

