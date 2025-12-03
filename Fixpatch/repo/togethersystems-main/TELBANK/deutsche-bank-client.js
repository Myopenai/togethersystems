/**
 * Deutsche Bank API Client
 * IBM-Standard: Zero-Defect, Industrial Fabrication Software
 * Version: 1.0.0-XXXL
 * Branding: T,.&T,,.&T,,,.TELBANK(C)(R)
 * 
 * Cloudflare Workers-compatible Client für Deutsche Bank APIs
 */

export class DeutscheBankClient {
  constructor(config) {
    this.config = {
      environment: config.environment || 'sandbox', // 'sandbox' | 'production'
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      certificate: config.certificate, // { clientCert, clientKey, caCert }
      redirectUri: config.redirectUri || 'https://togethersystems.com/auth/callback',
      ...config
    };
    
    this.baseUrl = this.config.environment === 'production'
      ? 'https://api.db.com'
      : 'https://api-sandbox.db.com';
    
    this.oauthToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Generiert X-Request-ID für API-Calls
   */
  generateRequestId() {
    return crypto.randomUUID();
  }

  /**
   * OAuth 2.0 Token für PSD2 APIs (AIS/PIS)
   */
  async getOAuthToken(forceRefresh = false) {
    // Token gültig → verwenden
    if (!forceRefresh && this.oauthToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.oauthToken;
    }

    // Token abgelaufen → neu holen
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Request-ID': this.generateRequestId()
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope: 'ais:accounts:read pis:payments:create'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OAuth token error: ${error.error_description || error.error}`);
    }

    const data = await response.json();
    this.oauthToken = data.access_token;
    // Token 5 Minuten vor Ablauf erneuern
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return this.oauthToken;
  }

  /**
   * mTLS Request für Corporate Banking API
   */
  async makeMTLSRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = this.generateRequestId();

    const fetchOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...options.headers
      }
    };

    // Certificate-based authentication (Cloudflare Workers)
    if (this.config.certificate) {
      fetchOptions.cf = {
        clientTlsAuth: {
          cert: this.config.certificate.clientCert,
          key: this.config.certificate.clientKey
        }
      };
    }

    try {
      const response = await fetch(url, fetchOptions);
      
      // Log API-Call (für Audit)
      await this.logAPICall(endpoint, options.method || 'GET', requestId, response.status, options.body, null);

      if (!response.ok) {
        const error = await response.json();
        await this.handleError(error, requestId);
        throw error;
      }

      return await response.json();
    } catch (error) {
      await this.logAPICall(endpoint, options.method || 'GET', requestId, null, options.body, error.message);
      throw error;
    }
  }

  /**
   * OAuth-basierte Request für PSD2 APIs
   */
  async makeOAuthRequest(endpoint, options = {}) {
    const token = await this.getOAuthToken();
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = this.generateRequestId();

    const fetchOptions = {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, fetchOptions);
      
      // Log API-Call
      await this.logAPICall(endpoint, options.method || 'GET', requestId, response.status, options.body, null);

      if (!response.ok) {
        // Token könnte abgelaufen sein → retry mit refresh
        if (response.status === 401) {
          const newToken = await this.getOAuthToken(true);
          fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, fetchOptions);
          
          if (!retryResponse.ok) {
            const error = await retryResponse.json();
            await this.handleError(error, requestId);
            throw error;
          }
          
          return await retryResponse.json();
        }

        const error = await response.json();
        await this.handleError(error, requestId);
        throw error;
      }

      return await response.json();
    } catch (error) {
      await this.logAPICall(endpoint, options.method || 'GET', requestId, null, options.body, error.message);
      throw error;
    }
  }

  /**
   * Account Information Services (AIS)
   */

  async getAccounts() {
    return this.makeOAuthRequest('/v2/ais/accounts', { method: 'GET' });
  }

  async getAccountBalance(accountId) {
    return this.makeOAuthRequest(`/v2/ais/accounts/${accountId}/balances`, { method: 'GET' });
  }

  async getAccountTransactions(accountId, params = {}) {
    const queryParams = new URLSearchParams({
      dateFrom: params.dateFrom || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: params.dateTo || new Date().toISOString().split('T')[0],
      ...params
    });
    return this.makeOAuthRequest(`/v2/ais/accounts/${accountId}/transactions?${queryParams}`, { method: 'GET' });
  }

  /**
   * Payment Initiation Services (PIS)
   */

  async initiatePayment(paymentData) {
    return this.makeOAuthRequest('/v2/pis/payments', {
      method: 'POST',
      body: JSON.stringify({
        instructedAmount: {
          currency: paymentData.currency || 'EUR',
          amount: paymentData.amount.toString()
        },
        creditorAccount: {
          iban: paymentData.creditorIBAN
        },
        creditorName: paymentData.creditorName,
        remittanceInformationUnstructured: paymentData.reference || 'Together Systems TPGA Telbank',
        requestedExecutionDate: paymentData.executionDate || new Date().toISOString().split('T')[0],
        ...paymentData.additionalFields
      })
    });
  }

  async getPaymentStatus(paymentId) {
    return this.makeOAuthRequest(`/v2/pis/payments/${paymentId}/status`, { method: 'GET' });
  }

  async cancelPayment(paymentId) {
    return this.makeOAuthRequest(`/v2/pis/payments/${paymentId}/cancellation`, { method: 'DELETE' });
  }

  /**
   * Corporate Banking API (mTLS)
   */

  async getCashManagement() {
    return this.makeMTLSRequest('/v1/corporate/cash-management', { method: 'GET' });
  }

  async initiateCorporatePayment(paymentData) {
    return this.makeMTLSRequest('/v1/corporate/payments', {
      method: 'POST',
      body: JSON.stringify({
        creditorAccount: {
          iban: paymentData.creditorIBAN,
          name: paymentData.creditorName
        },
        instructedAmount: {
          currency: paymentData.currency || 'EUR',
          amount: paymentData.amount.toString()
        },
        remittanceInformationUnstructured: paymentData.reference || 'Together Systems TPGA Telbank',
        requestedExecutionDate: paymentData.executionDate || new Date().toISOString().split('T')[0]
      })
    });
  }

  /**
   * Error Handling
   */

  async handleError(error, requestId) {
    const errorCode = error.code || error.error;
    
    // Log Error
    console.error('[Deutsche Bank API Error]', {
      code: errorCode,
      message: error.message || error.error_description,
      requestId
    });

    // Spezifische Error-Behandlung
    const errorHandlers = {
      'DB001': () => ({ type: 'certificate_invalid', action: 'alert_admin', severity: 'critical' }),
      'DB002': () => ({ type: 'certificate_expired', action: 'renew_certificate', severity: 'critical' }),
      'DB003': () => ({ type: 'insufficient_funds', action: 'notify_user', severity: 'high' }),
      'DB007': () => ({ type: 'kyc_required', action: 'trigger_kyc', severity: 'high' }),
      'DB008': () => ({ type: 'aml_check_failed', action: 'block_transaction', severity: 'critical' }),
      'DB009': () => ({ type: 'rate_limit', action: 'retry_with_backoff', severity: 'medium' }),
      'DB010': () => ({ type: 'service_unavailable', action: 'retry_later', severity: 'medium' })
    };

    const handler = errorHandlers[errorCode];
    if (handler) {
      const result = handler();
      // Hier könnte man Alerts/Webhooks triggern
      return result;
    }

    return { type: 'unknown_error', action: 'log_and_alert', severity: 'high' };
  }

  /**
   * API-Call Logging (für Audit)
   */
  async logAPICall(endpoint, method, requestId, statusCode, requestBody, errorMessage) {
    // In Production: In D1 Database speichern
    // Hier: Console-Log für Prototyp
    const logEntry = {
      endpoint,
      method,
      requestId,
      statusCode,
      requestBody: requestBody ? JSON.parse(requestBody) : null,
      errorMessage,
      timestamp: new Date().toISOString()
    };

    console.log('[Deutsche Bank API Log]', logEntry);

    // TODO: In D1 speichern (siehe deutsche_bank_api_log Tabelle)
    // await this.db.prepare(`
    //   INSERT INTO deutsche_bank_api_log (...)
    //   VALUES (...)
    // `).run(...);
  }

  /**
   * Retry mit Exponential Backoff
   */
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        const errorInfo = await this.handleError(error);
        
        if (errorInfo.action === 'retry_with_backoff' && i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
  }
}

// Export für Cloudflare Workers
export default DeutscheBankClient;

