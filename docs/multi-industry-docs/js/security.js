/**
 * Security Module
 * Handles security-related functionality including:
 * - XSS protection
 * - CSRF protection
 * - Content Security Policy (CSP) enforcement
 * - Input sanitization
 */

const Security = (() => {
    // Default CSP configuration
    const defaultCSP = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'"],
        'font-src': ["'self'"],
        'object-src': ["'none'"],
        'media-src': ["'self'"],
        'frame-src': ["'none'"],
    };

    // Initialize security module
    function init(customCSP = {}) {
        applyCSP({...defaultCSP, ...customCSP});
        setupCSRFProtection();
        setupErrorHandling();
    }

    // Apply Content Security Policy
    function applyCSP(cspConfig) {
        if (typeof document === 'undefined') return;
        
        const cspValue = Object.entries(cspConfig)
            .map(([directive, sources]) => {
                if (Array.isArray(sources)) {
                    return `${directive} ${sources.join(' ')}`;
                }
                return '';
            })
            .filter(Boolean)
            .join('; ');

        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = cspValue;
        document.head.appendChild(meta);
    }

    // Set up CSRF protection
    function setupCSRFProtection() {
        if (typeof document === 'undefined') return;
        
        const csrfToken = generateCSRFToken();
        document.cookie = `XSRF-TOKEN=${csrfToken}; Path=/; Secure; SameSite=Strict`;
        
        // Add CSRF token to all AJAX requests
        if (window.jQuery) {
            $.ajaxSetup({
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-XSRF-TOKEN', csrfToken);
                }
            });
        } else if (window.axios) {
            window.axios.defaults.headers.common['X-XSRF-TOKEN'] = csrfToken;
        }
        
        return csrfToken;
    }

    // Generate a CSRF token
    function generateCSRFToken() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Sanitize HTML to prevent XSS
    function sanitizeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Set up global error handling
    function setupErrorHandling() {
        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handlePromiseRejection);
    }

    // Handle JavaScript errors
    function handleError(event) {
        console.error('Uncaught error:', event.error || event.message || event);
        // Here you can add error reporting to your backend
        return false; // Prevent default error handling
    }

    // Handle unhandled promise rejections
    function handlePromiseRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        // Here you can add error reporting to your backend
        event.preventDefault();
    }

    // Public API
    return {
        init,
        sanitizeHTML,
        generateCSRFToken
    };
})();

// Auto-initialize security when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Security.init());
} else {
    Security.init();
}
