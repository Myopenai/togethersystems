/**
 * Automatic Port Discovery Utility
 * Finds available ports across all applications
 */

const net = require('net');
const os = require('os');

// Port ranges for different application types
const PORT_RANGES = {
  web: { min: 3000, max: 3100 },
  api: { min: 4000, max: 4100 },
  service: { min: 5000, max: 5100 },
  worker: { min: 6000, max: 6100 },
  cache: { min: 6379, max: 6380 },
  database: { min: 27017, max: 27020 }
};

// Track allocated ports to avoid conflicts
const allocatedPorts = new Set();

/**
 * Check if a port is available
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>}
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    try {
      server.listen(port, '0.0.0.0');
    } catch (e) {
      resolve(false);
    }
  });
}

/**
 * Find an available port in a given range
 * @param {string} appType - Type of application (web, api, service, etc.)
 * @param {number} preferredPort - Preferred port if available
 * @returns {Promise<number>}
 */
async function findAvailablePort(appType = 'web', preferredPort = null) {
  const range = PORT_RANGES[appType] || PORT_RANGES.web;
  
  // Check preferred port first
  if (preferredPort && !allocatedPorts.has(preferredPort)) {
    const available = await isPortAvailable(preferredPort);
    if (available) {
      allocatedPorts.add(preferredPort);
      return preferredPort;
    }
  }
  
  // Scan range for available port
  for (let port = range.min; port <= range.max; port++) {
    if (!allocatedPorts.has(port)) {
      const available = await isPortAvailable(port);
      if (available) {
        allocatedPorts.add(port);
        console.log(`✅ Port discovery: Found available port ${port} for ${appType} application`);
        return port;
      }
    }
  }
  
  throw new Error(`No available ports in range ${range.min}-${range.max} for ${appType}`);
}

/**
 * Release a port from allocation tracking
 * @param {number} port - Port to release
 */
function releasePort(port) {
  allocatedPorts.delete(port);
  console.log(`🔓 Port ${port} released`);
}

/**
 * Get current allocated ports
 * @returns {Array<number>}
 */
function getAllocatedPorts() {
  return Array.from(allocatedPorts);
}

/**
 * Get local IP address
 * @returns {string}
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

module.exports = {
  findAvailablePort,
  isPortAvailable,
  releasePort,
  getAllocatedPorts,
  getLocalIP,
  PORT_RANGES
};
