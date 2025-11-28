/**
 * MetaMask Detector - Verbesserte Erkennung
 * Erkennt MetaMask und andere Ethereum Wallets
 * Version: 1.0.0
 */

(function() {
  'use strict';
  
  // MetaMask Detection
  function detectMetaMask() {
    // Prüfe window.ethereum
    if (typeof window.ethereum !== 'undefined') {
      // Prüfe ob es MetaMask ist
      if (window.ethereum.isMetaMask) {
        return {
          detected: true,
          type: 'MetaMask',
          provider: window.ethereum,
          version: window.ethereum.version || 'unknown'
        };
      }
      
      // Andere Ethereum Wallets
      return {
        detected: true,
        type: 'Ethereum Wallet',
        provider: window.ethereum,
        version: 'unknown'
      };
    }
    
    // Prüfe window.web3 (Legacy)
    if (typeof window.web3 !== 'undefined' && window.web3.currentProvider) {
      return {
        detected: true,
        type: 'Legacy Web3',
        provider: window.web3.currentProvider,
        version: 'legacy'
      };
    }
    
    return {
      detected: false,
      type: null,
      provider: null,
      version: null
    };
  }
  
  // Global verfügbar machen
  window.MetaMaskDetector = {
    detect: detectMetaMask,
    isAvailable: function() {
      return detectMetaMask().detected;
    },
    getProvider: function() {
      const result = detectMetaMask();
      return result.provider;
    },
    requestAccounts: async function() {
      const result = detectMetaMask();
      if (!result.detected || !result.provider) {
        throw new Error('MetaMask oder Ethereum Wallet nicht gefunden. Bitte installieren Sie MetaMask.');
      }
      
      try {
        const accounts = await result.provider.request({
          method: 'eth_requestAccounts'
        });
        return accounts;
      } catch (error) {
        console.error('[MetaMask] Request accounts error:', error);
        throw error;
      }
    },
    getChainId: async function() {
      const result = detectMetaMask();
      if (!result.detected || !result.provider) {
        return null;
      }
      
      try {
        const chainId = await result.provider.request({
          method: 'eth_chainId'
        });
        return chainId;
      } catch (error) {
        console.error('[MetaMask] Get chainId error:', error);
        return null;
      }
    }
  };
  
  // Event Listener für MetaMask Installation
  window.addEventListener('ethereum#initialized', function() {
    console.log('[MetaMask] MetaMask wurde nachgeladen');
    if (window.onMetaMaskDetected) {
      window.onMetaMaskDetected();
    }
  }, { once: true });
  
  // Initial Detection
  const detection = detectMetaMask();
  if (detection.detected) {
    console.log('[MetaMask] Erkannt:', detection.type, detection.version);
    window.metaMaskDetected = true;
  } else {
    console.warn('[MetaMask] Nicht erkannt. Bitte MetaMask installieren.');
    window.metaMaskDetected = false;
  }
  
  // Export für Module
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.MetaMaskDetector;
  }
})();

