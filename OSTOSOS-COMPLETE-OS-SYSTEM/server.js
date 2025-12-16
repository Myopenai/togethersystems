const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Logging middleware
app.use(morgan('dev'));

// Serve static files
app.use(express.static(__dirname));

// API routes
app.get('/Myopenai/universeallenterprises', (req, res) => {
  console.log('Handling request for /Myopenai/universeallenterprises');
  res.json({
    name: 'universeallenterprises',
    full_name: 'Myopenai/universeallenterprises',
    private: false,
    html_url: 'https://github.com/Myopenai/universeallenterprises',
    description: 'Mock repository for local development',
    stargazers_count: 42,
    forks_count: 7,
    open_issues_count: 3,
    default_branch: 'main',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    license: {
      key: 'mit',
      name: 'MIT License',
      spdx_id: 'MIT',
      url: 'https://api.github.com/licenses/mit'
    }
  });
});

// Handle other API endpoints
app.get('/Myopenai/universeallenterprises/*', (req, res) => {
  const path = req.path.replace('/Myopenai/universeallenterprises', '');
  console.log(`Handling request for /Myopenai/universeallenterprises${path}`);
  
  // Return a mock response
  res.json({
    path: path,
    timestamp: new Date().toISOString(),
    mock: true,
    message: 'This is a mock response from the local development server'
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.path} was not found on this server.`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred on the server.'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`🌐 API available at: http://localhost:${PORT}/Myopenai/universeallenterprises`);
  console.log('\nPress Ctrl+C to stop the server\n');
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server has been stopped');
    process.exit(0);
  });
});
