/**
 * Localhost vs Online Live Verifier
 * IBM XXXL Standard - MCP Enhanced
 * Version: 1.0.0-XXXXXXL
 * Verifies 1:1 match between localhost and online production
 */

class LocalhostOnlineVerifier {
  constructor() {
    this.localhostBase = 'http://localhost:8787';
    this.onlineBase = 'https://a0618be2.togethersystems.pages.dev';
    this.githubBase = 'https://myopenai.github.io/togethersystems';
    this.results = {
      localhost: {},
      online: {},
      differences: [],
      errors: []
    };
  }

  async verifyFile(filePath) {
    const results = {
      file: filePath,
      localhost: null,
      online: null,
      match: false,
      errors: []
    };

    try {
      // Check localhost
      const localhostUrl = `${this.localhostBase}/${filePath}`;
      const localhostResponse = await fetch(localhostUrl, { method: 'HEAD' });
      results.localhost = {
        exists: localhostResponse.ok,
        status: localhostResponse.status,
        contentType: localhostResponse.headers.get('content-type'),
        size: localhostResponse.headers.get('content-length')
      };

      // Check online
      const onlineUrl = `${this.onlineBase}/${filePath}`;
      const onlineResponse = await fetch(onlineUrl, { method: 'HEAD' });
      results.online = {
        exists: onlineResponse.ok,
        status: onlineResponse.status,
        contentType: onlineResponse.headers.get('content-type'),
        size: onlineResponse.headers.get('content-length')
      };

      // Compare
      if (results.localhost.exists && results.online.exists) {
        results.match = 
          results.localhost.status === results.online.status &&
          results.localhost.contentType === results.online.contentType &&
          results.localhost.size === results.online.size;
        
        if (!results.match) {
          results.errors.push({
            type: 'mismatch',
            message: `File exists but properties differ`,
            differences: {
              status: results.localhost.status !== results.online.status,
              contentType: results.localhost.contentType !== results.online.contentType,
              size: results.localhost.size !== results.online.size
            }
          });
        }
      } else if (!results.localhost.exists && results.online.exists) {
        results.errors.push({
          type: 'missing_localhost',
          message: `File exists online but not on localhost`
        });
      } else if (results.localhost.exists && !results.online.exists) {
        results.errors.push({
          type: 'missing_online',
          message: `File exists on localhost but not online`
        });
      } else {
        results.errors.push({
          type: 'missing_both',
          message: `File missing on both localhost and online`
        });
      }
    } catch (error) {
      results.errors.push({
        type: 'fetch_error',
        message: error.message,
        stack: error.stack
      });
    }

    return results;
  }

  async verifyAPI(endpoint) {
    const results = {
      endpoint: endpoint,
      localhost: null,
      online: null,
      match: false,
      errors: []
    };

    try {
      // Check localhost API
      const localhostUrl = `${this.localhostBase}${endpoint}`;
      const localhostResponse = await fetch(localhostUrl);
      let localhostData = null;
      try {
        localhostData = await localhostResponse.json();
      } catch (e) {
        localhostData = await localhostResponse.text();
      }
      
      results.localhost = {
        status: localhostResponse.status,
        ok: localhostResponse.ok,
        data: localhostData
      };

      // Check online API
      const onlineUrl = `${this.onlineBase}${endpoint}`;
      const onlineResponse = await fetch(onlineUrl);
      let onlineData = null;
      try {
        onlineData = await onlineResponse.json();
      } catch (e) {
        onlineData = await onlineResponse.text();
      }
      
      results.online = {
        status: onlineResponse.status,
        ok: onlineResponse.ok,
        data: onlineData
      };

      // Compare
      if (results.localhost.ok && results.online.ok) {
        results.match = JSON.stringify(results.localhost.data) === JSON.stringify(results.online.data);
        if (!results.match) {
          results.errors.push({
            type: 'data_mismatch',
            message: `API responses differ`
          });
        }
      } else {
        results.errors.push({
          type: 'api_error',
          message: `API error: localhost=${results.localhost.status}, online=${results.online.status}`
        });
      }
    } catch (error) {
      results.errors.push({
        type: 'fetch_error',
        message: error.message
      });
    }

    return results;
  }

  async verifyAllFiles(fileList) {
    const results = [];
    for (const file of fileList) {
      const result = await this.verifyFile(file);
      results.push(result);
      if (result.errors.length > 0) {
        this.results.errors.push(...result.errors);
      }
      if (!result.match && result.localhost.exists && result.online.exists) {
        this.results.differences.push(result);
      }
    }
    return results;
  }

  async verifyAllAPIs(apiList) {
    const results = [];
    for (const api of apiList) {
      const result = await this.verifyAPI(api);
      results.push(result);
      if (result.errors.length > 0) {
        this.results.errors.push(...result.errors);
      }
      if (!result.match && result.localhost.ok && result.online.ok) {
        this.results.differences.push(result);
      }
    }
    return results;
  }

  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.results.localhost.length || 0,
        totalAPIs: this.results.online.length || 0,
        differences: this.results.differences.length,
        errors: this.results.errors.length
      },
      differences: this.results.differences,
      errors: this.results.errors,
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.errors.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Fix all errors before deployment',
        count: this.results.errors.length
      });
    }

    if (this.results.differences.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: 'Synchronize differences between localhost and online',
        count: this.results.differences.length
      });
    }

    return recommendations;
  }
}

// Export for Node.js and Browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocalhostOnlineVerifier;
}
if (typeof window !== 'undefined') {
  window.LocalhostOnlineVerifier = LocalhostOnlineVerifier;
}

