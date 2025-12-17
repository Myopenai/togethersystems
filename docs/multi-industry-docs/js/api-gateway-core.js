/**
 * API Gateway Core Module
 * Handles:
 * - Centralized API request management
 * - Request/response interceptors
 * - Request queuing and prioritization
 * - Retry logic with exponential backoff
 * - Caching strategies
 * - Request deduplication
 * - Request cancellation
 * - Progress tracking
 * - Offline support
 */

const APIGateway = (() => {
    // Default configuration
    const defaultConfig = {
        baseURL: '',
        timeout: 30000, // 30 seconds
        maxRetries: 3,
        retryDelay: 1000, // 1 second
        maxConcurrent: 5,
        cacheTTL: 5 * 60 * 1000, // 5 minutes
        offlineQueue: [],
        isOnline: true,
        requestQueue: [],
        activeRequests: 0,
        cache: new Map(),
        requestMap: new Map(),
        defaultHeaders: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        // Interceptors
        requestInterceptors: [],
        responseInterceptors: [],
        errorInterceptors: []
    };

    // Initialize the API Gateway
    function init(config = {}) {
        // Merge default config with provided config
        Object.assign(defaultConfig, config);
        
        // Set up online/offline detection
        setupConnectivityDetection();
        
        // Process any queued offline requests when coming back online
        window.addEventListener('online', processOfflineQueue);
        
        // Dispatch initialized event
        const event = new CustomEvent('api:initialized', { detail: { config: defaultConfig } });
        document.dispatchEvent(event);
        
        return this;
    }

    // Set up online/offline detection
    function setupConnectivityDetection() {
        if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
            defaultConfig.isOnline = navigator.onLine;
            
            window.addEventListener('online', () => {
                defaultConfig.isOnline = true;
                const event = new CustomEvent('api:online');
                document.dispatchEvent(event);
            });
            
            window.addEventListener('offline', () => {
                defaultConfig.isOnline = false;
                const event = new CustomEvent('api:offline');
                document.dispatchEvent(event);
            });
        }
    }

    // Add a request interceptor
    function addRequestInterceptor(interceptor) {
        if (typeof interceptor === 'function') {
            defaultConfig.requestInterceptors.push(interceptor);
        }
        return this;
    }

    // Add a response interceptor
    function addResponseInterceptor(interceptor) {
        if (typeof interceptor === 'function') {
            defaultConfig.responseInterceptors.push(interceptor);
        }
        return this;
    }

    // Add an error interceptor
    function addErrorInterceptor(interceptor) {
        if (typeof interceptor === 'function') {
            defaultConfig.errorInterceptors.push(interceptor);
        }
        return this;
    }

    // Execute all request interceptors
    async function executeRequestInterceptors(config) {
        let currentConfig = { ...config };
        
        for (const interceptor of defaultConfig.requestInterceptors) {
            try {
                const result = await interceptor(currentConfig);
                if (result) {
                    currentConfig = result;
                }
            } catch (error) {
                console.error('Request interceptor error:', error);
                throw error;
            }
        }
        
        return currentConfig;
    }

    // Execute all response interceptors
    async function executeResponseInterceptors(response) {
        let currentResponse = { ...response };
        
        for (const interceptor of defaultConfig.responseInterceptors) {
            try {
                const result = await interceptor(currentResponse);
                if (result) {
                    currentResponse = result;
                }
            } catch (error) {
                console.error('Response interceptor error:', error);
                throw error;
            }
        }
        
        return currentResponse;
    }

    // Execute all error interceptors
    async function executeErrorInterceptors(error, config) {
        let currentError = error;
        let shouldRethrow = true;
        
        for (const interceptor of defaultConfig.errorInterceptors) {
            try {
                const result = await interceptor(currentError, config);
                if (result && result !== true) {
                    // If the interceptor returns a response, use it
                    return await executeResponseInterceptors(result);
                } else if (result === true) {
                    // If the interceptor returns true, stop error propagation
                    shouldRethrow = false;
                    break;
                }
            } catch (interceptorError) {
                console.error('Error interceptor error:', interceptorError);
                currentError = interceptorError;
            }
        }
        
        if (shouldRethrow) {
            throw currentError;
        }
        
        return null;
    }

    // Generate a cache key from request config
    function generateCacheKey(config) {
        const { method, url, params, data } = config;
        return JSON.stringify({ method, url, params, data });
    }

    // Check if a request is cacheable
    function isCacheable(config) {
        return config.method.toLowerCase() === 'get' && config.cache !== false;
    }

    // Get a cached response
    function getCachedResponse(config) {
        if (!isCacheable(config)) return null;
        
        const cacheKey = generateCacheKey(config);
        const cached = defaultConfig.cache.get(cacheKey);
        
        if (!cached) return null;
        
        // Check if cache is still valid
        if (cached.expiresAt < Date.now()) {
            defaultConfig.cache.delete(cacheKey);
            return null;
        }
        
        return cached.response;
    }

    // Cache a response
    function cacheResponse(config, response) {
        if (!isCacheable(config) || !response) return;
        
        const cacheKey = generateCacheKey(config);
        const ttl = config.cacheTTL || defaultConfig.cacheTTL;
        
        defaultConfig.cache.set(cacheKey, {
            response,
            expiresAt: Date.now() + ttl,
            timestamp: Date.now()
        });
        
        // Clean up expired cache entries
        cleanupCache();
    }

    // Clean up expired cache entries
    function cleanupCache() {
        const now = Date.now();
        
        for (const [key, entry] of defaultConfig.cache.entries()) {
            if (entry.expiresAt < now) {
                defaultConfig.cache.delete(key);
            }
        }
    }

    // Clear the entire cache or specific entries
    function clearCache(key) {
        if (key) {
            defaultConfig.cache.delete(key);
        } else {
            defaultConfig.cache.clear();
        }
    }

    // Process the request queue
    async function processQueue() {
        if (defaultConfig.requestQueue.length === 0 || 
            defaultConfig.activeRequests >= defaultConfig.maxConcurrent) {
            return;
        }
        
        // Sort queue by priority (higher priority first)
        defaultConfig.requestQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        // Process next request if we're under the concurrency limit
        while (defaultConfig.activeRequests < defaultConfig.maxConcurrent && 
               defaultConfig.requestQueue.length > 0) {
            const { config, resolve, reject } = defaultConfig.requestQueue.shift();
            
            try {
                defaultConfig.activeRequests++;
                const response = await executeRequest(config);
                resolve(response);
            } catch (error) {
                reject(error);
            } finally {
                defaultConfig.activeRequests--;
                // Process next request in queue
                processQueue();
            }
        }
    }

    // Process offline queue when coming back online
    async function processOfflineQueue() {
        if (!defaultConfig.isOnline || defaultConfig.offlineQueue.length === 0) {
            return;
        }
        
        const queue = [...defaultConfig.offlineQueue];
        defaultConfig.offlineQueue = [];
        
        for (const { config, resolve, reject } of queue) {
            try {
                const response = await request(config);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        }
    }

    // Execute a request with retry logic
    async function executeRequest(config, retryCount = 0) {
        const { method, url, params, data, headers, timeout, retryDelay, maxRetries } = config;
        const requestKey = generateCacheKey(config);
        
        // Check if this is a duplicate request
        if (defaultConfig.requestMap.has(requestKey)) {
            return defaultConfig.requestMap.get(requestKey);
        }
        
        // Check cache first for GET requests
        if (isCacheable(config)) {
            const cachedResponse = getCachedResponse(config);
            if (cachedResponse) {
                return cachedResponse;
            }
        }
        
        // Create a promise that will be resolved when the request completes
        const requestPromise = (async () => {
            try {
                // Execute request interceptors
                const processedConfig = await executeRequestInterceptors({
                    ...defaultConfig,
                    method: method.toLowerCase(),
                    url,
                    params,
                    data,
                    headers: { ...defaultConfig.defaultHeaders, ...headers },
                    timeout: timeout || defaultConfig.timeout,
                    retryDelay: retryDelay || defaultConfig.retryDelay,
                    maxRetries: maxRetries !== undefined ? maxRetries : defaultConfig.maxRetries,
                    retryCount,
                    requestKey
                });
                
                // Create AbortController for request cancellation
                const controller = new AbortController();
                const { signal } = controller;
                
                // Set up timeout
                let timeoutId;
                if (processedConfig.timeout) {
                    timeoutId = setTimeout(() => {
                        controller.abort(`Timeout of ${processedConfig.timeout}ms exceeded`);
                    }, processedConfig.timeout);
                }
                
                // Build the full URL with query parameters
                let fullUrl = processedConfig.baseURL 
                    ? `${processedConfig.baseURL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`
                    : url;
                
                // Add query parameters
                if (processedConfig.params) {
                    const queryString = Object.entries(processedConfig.params)
                        .filter(([_, value]) => value !== undefined && value !== null)
                        .map(([key, value]) => {
                            if (Array.isArray(value)) {
                                return value.map(v => `${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`).join('&');
                            }
                            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
                        })
                        .join('&');
                    
                    if (queryString) {
                        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
                    }
                }
                
                // Prepare fetch options
                const fetchOptions = {
                    method: processedConfig.method,
                    headers: processedConfig.headers,
                    signal,
                    credentials: processedConfig.withCredentials ? 'include' : 'same-origin'
                };
                
                // Add body for non-GET/HEAD requests
                if (processedConfig.data && !['get', 'head'].includes(processedConfig.method)) {
                    if (processedConfig.data instanceof FormData || 
                        processedConfig.data instanceof URLSearchParams ||
                        typeof processedConfig.data === 'string') {
                        fetchOptions.body = processedConfig.data;
                    } else if (processedConfig.headers['Content-Type'] === 'application/json') {
                        fetchOptions.body = JSON.stringify(processedConfig.data);
                    } else {
                        // Handle URL-encoded form data
                        const formData = new URLSearchParams();
                        Object.entries(processedConfig.data).forEach(([key, value]) => {
                            if (Array.isArray(value)) {
                                value.forEach(v => formData.append(`${key}[]`, v));
                            } else {
                                formData.append(key, value);
                            }
                        });
                        fetchOptions.body = formData;
                        // Ensure the content type is set correctly
                        fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    }
                }
                
                // Execute the request
                const response = await fetch(fullUrl, fetchOptions);
                
                // Clear timeout
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                
                // Parse response
                let responseData;
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    responseData = await response.json();
                } else if (contentType && (contentType.includes('text/') || contentType.includes('application/xml'))) {
                    responseData = await response.text();
                } else if (contentType && contentType.startsWith('multipart/')) {
                    responseData = await response.formData();
                } else {
                    responseData = await response.blob();
                }
                
                // Create response object
                const responseObj = {
                    data: responseData,
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    config: processedConfig,
                    request: {}
                };
                
                // Handle non-2xx status codes
                if (!response.ok) {
                    const error = new Error(`Request failed with status code ${response.status}`);
                    error.response = responseObj;
                    error.config = processedConfig;
                    error.request = {};
                    throw error;
                }
                
                // Cache the response if needed
                if (isCacheable(processedConfig)) {
                    cacheResponse(processedConfig, responseObj);
                }
                
                // Execute response interceptors
                return await executeResponseInterceptors(responseObj);
                
            } catch (error) {
                // Handle abort errors (timeout or manual cancellation)
                if (error.name === 'AbortError') {
                    const abortError = new Error(error.message || 'Request aborted');
                    abortError.config = config;
                    abortError.code = 'ECONNABORTED';
                    throw abortError;
                }
                
                // Handle network errors
                if (!navigator.onLine) {
                    const offlineError = new Error('Network Error: You are offline');
                    offlineError.config = config;
                    offlineError.code = 'ENETWORK';
                    throw offlineError;
                }
                
                // Handle other errors
                if (!error.config) {
                    error.config = config;
                }
                
                // Execute error interceptors
                try {
                    return await executeErrorInterceptors(error, config);
                } catch (interceptedError) {
                    // If we have retries left, retry the request
                    const shouldRetry = (
                        !config.method || 
                        ['get', 'put', 'delete', 'head', 'options'].includes(config.method.toLowerCase())
                    ) && (
                        !config.retryCount || 
                        config.retryCount < (config.maxRetries || defaultConfig.maxRetries)
                    );
                    
                    if (shouldRetry) {
                        const retryCount = (config.retryCount || 0) + 1;
                        const delay = (config.retryDelay || defaultConfig.retryDelay) * Math.pow(2, retryCount - 1);
                        
                        // Add jitter to avoid thundering herd problem
                        const jitter = Math.random() * 1000;
                        const delayWithJitter = delay + jitter;
                        
                        console.warn(`Retrying request (${retryCount}/${config.maxRetries || defaultConfig.maxRetries}) in ${Math.round(delayWithJitter)}ms`);
                        
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(executeRequest({ ...config, retryCount }, retryCount));
                            }, delayWithJitter);
                        });
                    }
                    
                    throw interceptedError;
                }
            } finally {
                // Clean up request from the map
                defaultConfig.requestMap.delete(requestKey);
            }
        })();
        
        // Store the promise in the request map for deduplication
        defaultConfig.requestMap.set(requestKey, requestPromise);
        
        return requestPromise;
    }

    // Main request method
    function request(config) {
        // If we're offline and this is not a GET request, queue it
        if (!defaultConfig.isOnline && 
            config.method && 
            config.method.toLowerCase() !== 'get' && 
            config.offlineQueue !== false) {
            
            return new Promise((resolve, reject) => {
                defaultConfig.offlineQueue.push({ config, resolve, reject });
                
                // Dispatch event for offline queue update
                const event = new CustomEvent('api:offlineQueued', { 
                    detail: { 
                        config, 
                        queueSize: defaultConfig.offlineQueue.length 
                    } 
                });
                document.dispatchEvent(event);
            });
        }
        
        // If we're at max concurrent requests, queue the request
        if (defaultConfig.activeRequests >= defaultConfig.maxConcurrent) {
            return new Promise((resolve, reject) => {
                defaultConfig.requestQueue.push({ 
                    config, 
                    resolve, 
                    reject,
                    priority: config.priority || 0
                });
                
                // Process queue in case it's not already being processed
                processQueue();
            });
        }
        
        // Otherwise, execute the request immediately
        return executeRequest(config);
    }

    // Convenience methods
    const methods = {
        get(url, config = {}) {
            return request({ ...config, method: 'get', url });
        },
        
        post(url, data = null, config = {}) {
            return request({ ...config, method: 'post', url, data });
        },
        
        put(url, data = null, config = {}) {
            return request({ ...config, method: 'put', url, data });
        },
        
        delete(url, config = {}) {
            return request({ ...config, method: 'delete', url });
        },
        
        head(url, config = {}) {
            return request({ ...config, method: 'head', url });
        },
        
        options(url, config = {}) {
            return request({ ...config, method: 'options', url });
        },
        
        patch(url, data = null, config = {}) {
            return request({ ...config, method: 'patch', url, data });
        }
    };

    // Public API
    return {
        ...methods,
        init,
        request,
        addRequestInterceptor,
        addResponseInterceptor,
        addErrorInterceptor,
        clearCache,
        get isOnline() {
            return defaultConfig.isOnline;
        },
        get pendingRequests() {
            return defaultConfig.requestQueue.length + defaultConfig.activeRequests;
        },
        get offlineQueueSize() {
            return defaultConfig.offlineQueue.length;
        },
        processOfflineQueue,
        cancelRequest(requestKey) {
            if (defaultConfig.requestMap.has(requestKey)) {
                const request = defaultConfig.requestMap.get(requestKey);
                if (request && request.abort) {
                    request.abort();
                }
                defaultConfig.requestMap.delete(requestKey);
                return true;
            }
            return false;
        },
        cancelAllRequests() {
            defaultConfig.requestMap.forEach((request) => {
                if (request && request.abort) {
                    request.abort();
                }
            });
            defaultConfig.requestMap.clear();
            defaultConfig.requestQueue = [];
        }
    };
})();

// Auto-initialize with default config if window is available
if (typeof window !== 'undefined') {
    // Register with the system if available
    if (typeof System !== 'undefined') {
        System.registerModule('api', () => APIGateway);
    }
    
    // Auto-initialize with default config
    document.addEventListener('DOMContentLoaded', () => {
        APIGateway.init({
            baseURL: window.location.origin,
            // Add any other default config here
        });
    });
}

export default APIGateway;
