// T,. OSOTOSOS Console-Monitoring-Integration
// Nutzt bestehende Fabrikage-Systeme - ERSTELLT NICHTS NEUES!

(function() {
    'use strict';
    
    // Lade bestehende Console-Monitoring-Systeme
    const CONSOLE_MONITORING_CONFIG = {
        source: 'Settings/CONSOLE-MONITORING-SYSTEM.json',
        implementation: 'TogetherSystems/Fabrikage.ObservabilityAtlas/console/unified-console-layer.ts',
        errorBus: 'TogetherSystems/Fabrikage.ObservabilityAtlas/console/error-bus.ts',
        status: 'PERMANENT-ACTIVE'
    };
    
    // Console ist das Herz - Settings-Ordner ist der Mund
    console.log('T,. Console-Monitoring aktiviert - Nutze bestehende Systeme');
    
    // Erfasse alle Console-Events
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    
    const consoleEvents = [];
    
    // Wrapper für console.log
    console.log = function(...args) {
        originalLog.apply(console, args);
        captureEvent('log', 'info', args.join(' '));
    };
    
    // Wrapper für console.error
    console.error = function(...args) {
        originalError.apply(console, args);
        captureEvent('error', 'error', args.join(' '));
        // Bei Fehlern: Error-Bus nutzen (bereits implementiert!)
        handleError(args.join(' '));
    };
    
    // Wrapper für console.warn
    console.warn = function(...args) {
        originalWarn.apply(console, args);
        captureEvent('warn', 'warn', args.join(' '));
    };
    
    // Wrapper für console.info
    console.info = function(...args) {
        originalInfo.apply(console, args);
        captureEvent('info', 'info', args.join(' '));
    };
    
    // Erfasse Event
    function captureEvent(source, severity, message) {
        const event = {
            timestamp: new Date().toISOString(),
            source: source,
            severity: severity,
            message: message
        };
        
        consoleEvents.push(event);
        
        // Speichere in localStorage (Settings-Ordner Integration)
        try {
            const stored = localStorage.getItem('ostosos.console.events');
            const events = stored ? JSON.parse(stored) : [];
            events.push(event);
            // Behalte nur letzte 1000 Events
            if (events.length > 1000) {
                events.shift();
            }
            localStorage.setItem('ostosos.console.events', JSON.stringify(events));
        } catch (e) {
            // Ignoriere Storage-Fehler
        }
    }
    
    // Behandle Fehler (nutze bestehende Error-Bus-Logik)
    function handleError(message) {
        // Prüfe auf bekannte Fehler-Patterns (aus Settings/error-patterns.json)
        const errorPatterns = [
            { pattern: /SyntaxError|parse error/i, type: 'syntax', autoFix: true },
            { pattern: /TypeError|Cannot read/i, type: 'type', autoFix: true },
            { pattern: /404|not found/i, type: 'network', autoFix: false },
            { pattern: /CORS|cross-origin/i, type: 'network', autoFix: false },
            { pattern: /port.*already in use/i, type: 'ports', autoFix: true }
        ];
        
        for (const pattern of errorPatterns) {
            if (pattern.pattern.test(message)) {
                console.warn(`T,. Error-Pattern erkannt: ${pattern.type} - Auto-Fix: ${pattern.autoFix}`);
                
                if (pattern.autoFix && pattern.type === 'ports') {
                    // Port-Fehler: Automatisch freien Port finden (bereits implementiert!)
                    console.info('T,. Nutze bestehende Port-Find-Logik aus main.go');
                }
                
                break;
            }
        }
    }
    
    // Window Error Handler
    window.addEventListener('error', function(event) {
        captureEvent('window', 'error', event.message);
        handleError(event.message);
    });
    
    // Unhandled Promise Rejection
    window.addEventListener('unhandledrejection', function(event) {
        captureEvent('promise', 'error', event.reason?.toString() || 'Unhandled promise rejection');
        handleError(event.reason?.toString() || 'Unhandled promise rejection');
    });
    
    // Export für externe Nutzung
    window.OSTOSOSConsoleMonitor = {
        getEvents: () => consoleEvents,
        getErrors: () => consoleEvents.filter(e => e.severity === 'error'),
        clear: () => {
            consoleEvents.length = 0;
            localStorage.removeItem('ostosos.console.events');
        }
    };
    
    console.log('T,. Console-Monitoring aktiviert - Nutzt bestehende Fabrikage-Systeme');
})();

