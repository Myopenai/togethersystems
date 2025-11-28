/**
 * Error Guard - Global Error Handling
 * Version: 1.0.0-IBM-ETERNAL
 */

(function() {
  'use strict';

  // Environment Detection
  const ENV = {
    protocol: window.location.protocol,
    isFileProtocol: window.location.protocol === 'file:',
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname.includes('pages.dev') || window.location.hostname.includes('github.io')
  };

  // Safe Fetch with Fallback
  window.safeFetchJson = async function(url, options = {}) {
    // If file:// protocol, return demo data
    if (ENV.isFileProtocol) {
      console.warn(`[Error Guard] file:// protocol detected - using fallback for ${url}`);
      return getDemoData(url);
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      return await response.json();
    } catch (error) {
      console.warn(`[Error Guard] Fetch failed for ${url}: ${error.message} - using fallback`);
      return getDemoData(url);
    }
  };

  // Get Demo Data based on URL
  function getDemoData(url) {
    // Return appropriate demo data based on URL pattern
    if (url.includes('/api/teladia/assets')) {
      return Promise.resolve({
        success: true,
        data: {
          fiat: [],
          crypto: [],
          digital: []
        }
      });
    }
    if (url.includes('/api/telbank/negative-assets')) {
      return Promise.resolve({
        success: true,
        data: []
      });
    }
    if (url.includes('/Settings/')) {
      return Promise.resolve({});
    }
    return Promise.resolve({});
  }

  // Global Error Handler
  window.addEventListener('error', function(event) {
    console.error('[Error Guard] Global Error:', event.error);
    // Prevent error from propagating
    event.preventDefault();
  });

  // Unhandled Promise Rejection Handler
  window.addEventListener('unhandledrejection', function(event) {
    console.error('[Error Guard] Unhandled Promise Rejection:', event.reason);
    // Prevent error from propagating
    event.preventDefault();
  });

  // Service Worker Registration with Environment Check
  if ('serviceWorker' in navigator && !ENV.isFileProtocol) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('./sw.js')
        .then(function(reg) {
          console.log('[Error Guard] Service Worker registered:', reg.scope);
        })
        .catch(function(err) {
          console.warn('[Error Guard] Service Worker registration failed:', err.message);
        });
    });
  } else if (ENV.isFileProtocol) {
    console.warn('[Error Guard] Service Worker cannot be registered on file:// protocol');
  }

  console.log('✅ Error Guard initialized', ENV);
})();
