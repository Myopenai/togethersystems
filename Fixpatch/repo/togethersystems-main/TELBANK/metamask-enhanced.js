/**
 * MetaMask Enhanced Integration
 * IBM-Standard: Zero-Defect, Industrial Fabrication Software
 * Version: 1.0.0-XXXL
 * Branding: T,.&T,,.&T,,,.TELBANK(C)(R)
 * 
 * Vollständige MetaMask-Integration mit Error-Recovery, Multi-Chain, Transaction-Handling
 */

class MetaMaskEnhanced {
  constructor(config = {}) {
    this.config = {
      defaultChainId: config.defaultChainId || '0x1', // Ethereum Mainnet
      supportedChains: config.supportedChains || [
        { chainId: '0x1', name: 'Ethereum Mainnet', rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY' },
        { chainId: '0x5', name: 'Goerli Testnet', rpcUrl: 'https://eth-goerli.alchemyapi.io/v2/YOUR_KEY' },
        { chainId: '0xaa36a7', name: 'Sepolia Testnet', rpcUrl: 'https://eth-sepolia.alchemyapi.io/v2/YOUR_KEY' },
        { chainId: '0x89', name: 'Polygon Mainnet', rpcUrl: 'https://polygon-rpc.com' },
        { chainId: '0x13881', name: 'Mumbai Testnet', rpcUrl: 'https://rpc-mumbai.maticvigil.com' }
      ],
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      transactionTimeout: config.transactionTimeout || 300000, // 5 minutes
      ...config
    };

    this.provider = null;
    this.account = null;
    this.chainId = null;
    this.isConnected = false;
    this.listeners = new Map();
    
    // Transaction tracking
    this.pendingTransactions = new Map();
    this.transactionHistory = [];
    
    // Error recovery state
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Initialize MetaMask Connection
   */
  async init() {
    await this.detectProvider();
    
    if (!this.provider) {
      throw new Error('MetaMask not detected. Please install MetaMask extension.');
    }

    this.setupEventListeners();
    
    // Check if already connected
    try {
      const accounts = await this.provider.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        this.account = accounts[0];
        this.isConnected = true;
        this.chainId = await this.provider.request({ method: 'eth_chainId' });
        this.emit('connected', { account: this.account, chainId: this.chainId });
      }
    } catch (error) {
      console.error('[MetaMask] Initial connection check failed:', error);
    }

    return this.isConnected;
  }

  /**
   * Detect MetaMask Provider
   */
  async detectProvider() {
    // Check for MetaMask Detector
    if (window.MetaMaskDetector && window.MetaMaskDetector.isAvailable()) {
      this.provider = window.MetaMaskDetector.getProvider();
      console.log('[MetaMask] Detected via MetaMaskDetector');
      return;
    }

    // Check window.ethereum
    if (window.ethereum) {
      this.provider = window.ethereum;
      
      // Check if it's MetaMask specifically
      if (window.ethereum.isMetaMask) {
        console.log('[MetaMask] Detected via window.ethereum (isMetaMask=true)');
        return;
      }
      
      // Could be another wallet → try anyway
      console.warn('[MetaMask] window.ethereum detected but might not be MetaMask');
      return;
    }

    // Provider not found
    this.provider = null;
    throw new Error('MetaMask provider not found');
  }

  /**
   * Setup Event Listeners
   */
  setupEventListeners() {
    if (!this.provider) return;

    // Account changed
    this.provider.on('accountsChanged', (accounts) => {
      const previousAccount = this.account;
      this.account = accounts && accounts.length > 0 ? accounts[0] : null;
      this.isConnected = !!this.account;
      
      this.emit('accountsChanged', {
        previous: previousAccount,
        current: this.account,
        connected: this.isConnected
      });

      if (!this.account) {
        this.emit('disconnected');
      }
    });

    // Chain changed
    this.provider.on('chainChanged', (chainId) => {
      const previousChainId = this.chainId;
      this.chainId = chainId;
      
      this.emit('chainChanged', {
        previous: previousChainId,
        current: chainId,
        networkName: this.getNetworkName(chainId)
      });

      // Check if chain is supported
      const isSupported = this.isChainSupported(chainId);
      if (!isSupported) {
        this.emit('unsupportedChain', { chainId });
      }
    });

    // Disconnect event (EIP-1193)
    if (this.provider.on) {
      this.provider.on('disconnect', (error) => {
        this.isConnected = false;
        this.account = null;
        this.emit('disconnected', error);
      });
    }
  }

  /**
   * Connect to MetaMask
   */
  async connect(options = {}) {
    if (!this.provider) {
      await this.detectProvider();
      if (!this.provider) {
        throw new Error('MetaMask not available');
      }
    }

    try {
      // Request account access
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from MetaMask');
      }

      this.account = accounts[0];
      this.chainId = await this.provider.request({ method: 'eth_chainId' });
      this.isConnected = true;
      this.reconnectAttempts = 0;

      this.emit('connected', {
        account: this.account,
        chainId: this.chainId,
        networkName: this.getNetworkName(this.chainId)
      });

      // Switch to default chain if requested
      if (options.switchToDefaultChain && this.chainId !== this.config.defaultChainId) {
        await this.switchChain(this.config.defaultChainId);
      }

      return {
        account: this.account,
        chainId: this.chainId,
        networkName: this.getNetworkName(this.chainId)
      };
    } catch (error) {
      await this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * Disconnect from MetaMask
   */
  disconnect() {
    this.account = null;
    this.chainId = null;
    this.isConnected = false;
    this.emit('disconnected');
  }

  /**
   * Switch to a different chain
   */
  async switchChain(targetChainId) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    // Check if already on target chain
    const currentChainId = await this.provider.request({ method: 'eth_chainId' });
    if (currentChainId.toLowerCase() === targetChainId.toLowerCase()) {
      return { success: true, message: 'Already on target chain' };
    }

    try {
      // Try to switch chain
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }]
      });

      this.chainId = targetChainId;
      this.emit('chainChanged', {
        previous: currentChainId,
        current: targetChainId,
        networkName: this.getNetworkName(targetChainId)
      });

      return { success: true, chainId: targetChainId };
    } catch (error) {
      // Error 4902: Chain not added to wallet
      if (error.code === 4902) {
        // Try to add chain
        const chainConfig = this.config.supportedChains.find(
          chain => chain.chainId.toLowerCase() === targetChainId.toLowerCase()
        );

        if (chainConfig) {
          return await this.addChain(chainConfig);
        } else {
          throw new Error(`Chain ${targetChainId} not supported`);
        }
      }

      throw error;
    }
  }

  /**
   * Add a chain to MetaMask
   */
  async addChain(chainConfig) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      await this.provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainConfig.chainId,
          chainName: chainConfig.name,
          nativeCurrency: chainConfig.nativeCurrency || {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: [chainConfig.rpcUrl],
          blockExplorerUrls: chainConfig.blockExplorerUrls || []
        }]
      });

      // Switch to the newly added chain
      return await this.switchChain(chainConfig.chainId);
    } catch (error) {
      throw new Error(`Failed to add chain: ${error.message}`);
    }
  }

  /**
   * Send Transaction with Error Recovery
   */
  async sendTransaction(txParams, options = {}) {
    if (!this.isConnected) {
      throw new Error('Not connected to MetaMask');
    }

    const {
      maxRetries = this.config.maxRetries,
      retryDelay = this.config.retryDelay,
      timeout = this.config.transactionTimeout
    } = options;

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Get current nonce if not provided
      if (!txParams.nonce) {
        txParams.nonce = await this.getTransactionCount(this.account);
      }

      // Estimate gas if not provided
      if (!txParams.gas) {
        try {
          const gasEstimate = await this.estimateGas(txParams);
          txParams.gas = `0x${(parseInt(gasEstimate, 16) * 1.2).toString(16)}`; // Add 20% buffer
        } catch (error) {
          console.warn('[MetaMask] Gas estimation failed, using default:', error);
          txParams.gas = '0x5208'; // 21000 default
        }
      }

      // Send transaction with retry logic
      let txHash = null;
      let lastError = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          txHash = await this.provider.request({
            method: 'eth_sendTransaction',
            params: [txParams]
          });

          // Track pending transaction
          this.pendingTransactions.set(txHash, {
            txHash,
            txParams,
            submittedAt: Date.now(),
            status: 'pending'
          });

          // Wait for transaction receipt
          const receipt = await this.waitForTransaction(txHash, timeout);
          
          // Remove from pending, add to history
          this.pendingTransactions.delete(txHash);
          this.transactionHistory.push({
            txHash,
            receipt,
            txParams,
            submittedAt: Date.now(),
            confirmedAt: Date.now(),
            status: receipt.status === '0x1' ? 'success' : 'failed'
          });

          this.emit('transactionConfirmed', { txHash, receipt });

          return {
            success: true,
            txHash,
            receipt
          };
        } catch (error) {
          lastError = error;
          
          // Check if it's a retryable error
          if (this.isRetryableError(error) && attempt < maxRetries - 1) {
            await this.sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
            continue;
          }

          // Non-retryable or max retries reached
          throw error;
        }
      }

      throw lastError;
    } catch (error) {
      await this.handleTransactionError(error, txParams);
      throw error;
    }
  }

  /**
   * Wait for Transaction Receipt
   */
  async waitForTransaction(txHash, timeout = 300000) {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < timeout) {
      try {
        const receipt = await this.provider.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash]
        });

        if (receipt) {
          return receipt;
        }

        await this.sleep(pollInterval);
      } catch (error) {
        console.error('[MetaMask] Error polling transaction receipt:', error);
        await this.sleep(pollInterval);
      }
    }

    throw new Error(`Transaction timeout: ${txHash} not confirmed within ${timeout}ms`);
  }

  /**
   * Get Transaction Count (Nonce)
   */
  async getTransactionCount(account) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const nonce = await this.provider.request({
      method: 'eth_getTransactionCount',
      params: [account, 'latest']
    });

    return nonce;
  }

  /**
   * Estimate Gas
   */
  async estimateGas(txParams) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const gasEstimate = await this.provider.request({
      method: 'eth_estimateGas',
      params: [txParams]
    });

    return gasEstimate;
  }

  /**
   * Get Balance
   */
  async getBalance(account = this.account) {
    if (!this.provider || !account) {
      throw new Error('Provider not initialized or no account');
    }

    const balance = await this.provider.request({
      method: 'eth_getBalance',
      params: [account, 'latest']
    });

    return {
      wei: balance,
      eth: parseInt(balance, 16) / Math.pow(10, 18),
      formatted: `${(parseInt(balance, 16) / Math.pow(10, 18)).toFixed(6)} ETH`
    };
  }

  /**
   * Get Network Name
   */
  getNetworkName(chainId) {
    if (!chainId) return 'Unknown';
    
    const id = chainId.toString().toLowerCase();
    const chain = this.config.supportedChains.find(
      c => c.chainId.toLowerCase() === id
    );

    if (chain) {
      return chain.name;
    }

    // Fallback to common chain IDs
    const commonChains = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet',
      '0xa': 'Optimism',
      '0xa4b1': 'Arbitrum One'
    };

    return commonChains[id] || `Chain ${id}`;
  }

  /**
   * Check if Chain is Supported
   */
  isChainSupported(chainId) {
    return this.config.supportedChains.some(
      chain => chain.chainId.toLowerCase() === chainId.toLowerCase()
    );
  }

  /**
   * Check if Error is Retryable
   */
  isRetryableError(error) {
    // Network errors, timeouts, rate limits
    const retryableMessages = [
      'network',
      'timeout',
      'rate limit',
      'too many requests',
      'temporarily unavailable'
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    return retryableMessages.some(msg => errorMessage.includes(msg));
  }

  /**
   * Handle Connection Error
   */
  async handleConnectionError(error) {
    console.error('[MetaMask] Connection error:', error);

    // User rejected
    if (error.code === 4001) {
      this.emit('userRejected');
      return;
    }

    // Provider not found → try to reconnect
    if (error.code === -32002 || error.message?.includes('not found')) {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        await this.sleep(this.config.retryDelay * this.reconnectAttempts);
        
        try {
          await this.init();
        } catch (retryError) {
          console.error('[MetaMask] Reconnection attempt failed:', retryError);
        }
      }
    }

    this.emit('connectionError', error);
  }

  /**
   * Handle Transaction Error
   */
  async handleTransactionError(error, txParams) {
    console.error('[MetaMask] Transaction error:', error);

    // User rejected
    if (error.code === 4001) {
      this.emit('transactionRejected', { error, txParams });
      return;
    }

    // Insufficient funds
    if (error.message?.includes('insufficient funds')) {
      this.emit('insufficientFunds', { error, txParams });
      return;
    }

    // Gas estimation failed
    if (error.message?.includes('gas') || error.code === -32000) {
      this.emit('gasEstimationFailed', { error, txParams });
      return;
    }

    this.emit('transactionError', { error, txParams });
  }

  /**
   * Event System
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[MetaMask] Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Utility: Sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get Pending Transactions
   */
  getPendingTransactions() {
    return Array.from(this.pendingTransactions.values());
  }

  /**
   * Get Transaction History
   */
  getTransactionHistory(limit = 50) {
    return this.transactionHistory.slice(0, limit);
  }

  /**
   * Get Status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      account: this.account,
      chainId: this.chainId,
      networkName: this.getNetworkName(this.chainId),
      isChainSupported: this.isChainSupported(this.chainId),
      pendingTransactions: this.pendingTransactions.size,
      transactionHistoryCount: this.transactionHistory.length
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MetaMaskEnhanced;
} else {
  window.MetaMaskEnhanced = MetaMaskEnhanced;
}

