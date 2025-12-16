const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Create a simple mock response for GitHub API endpoints
app.get('/Myopenai/universeallenterprises', (req, res) => {
  res.json({
    name: 'universeallenterprises',
    full_name: 'Myopenai/universeallenterprises',
    private: false,
    // Add more GitHub-like response fields as needed
  });
});

// Handle other API endpoints with mock responses
app.get('/Myopenai/universeallenterprises/*', (req, res) => {
  const path = req.path.replace('/Myopenai/universeallenterprises', '');
  console.log(`Mock API request: ${path}`);
  
  // Return a simple mock response
  res.json({
    path: path,
    timestamp: new Date().toISOString(),
    message: 'This is a mock response from local-dev-server.js'
  });
});

// Handle 404 for all other routes
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
    message: 'The requested resource was not found on this server.'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${__dirname}`);
  console.log(`🌐 Mock API available at: http://localhost:${PORT}/Myopenai/universeallenterprises`);
  console.log('\nPress Ctrl+C to stop the server\n');
});
