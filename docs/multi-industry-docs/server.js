// Production server with WYSIWYG persistence
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');

const app = express();
const PORT = process.env.PORT || 3000;

// Define directories
const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const LOGS_DIR = path.join(ROOT_DIR, 'logs');

// Ensure required directories exist
[CONTENT_DIR, DIST_DIR, LOGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Enable CORS for development
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Serve static files from src directory
app.use('/src', express.static(path.join(ROOT_DIR, 'src'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Serve static files from dist directory
app.use(express.static(DIST_DIR, {
    extensions: ['html', 'htm'],
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Serve static files from root directory for development
app.use(express.static(ROOT_DIR));

// Create a rotating write stream for logging
const logDirectory = path.join(__dirname, 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Create a rotating write stream for access logs
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory,
  compress: 'gzip'
});
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Setup request logging
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); // Log to console in development

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Error logging middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval'");
  next();
});

// ============ API ENDPOINTS ============

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /api/content/:contentId
 * Retrieve saved content by ID
 */
app.get('/api/content/:contentId', (req, res) => {
  try {
    const { contentId } = req.params;
    const sanitizedId = contentId.replace(/[^a-z0-9_-]/gi, '');
    const filePath = path.join(CONTENT_DIR, `${sanitizedId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'Content not found',
        contentId: sanitizedId
      });
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(content);
  } catch (error) {
    console.error('Error retrieving content:', error);
    res.status(500).json({ error: 'Failed to retrieve content', details: error.message });
  }
});

/**
 * POST /api/save
 * Save WYSIWYG editor content
 * Body: { contentId, html, title, industry, metadata }
 */
app.post('/api/save', (req, res) => {
  try {
    const { contentId, html, title, industry, metadata } = req.body;

    // Validate input
    if (!contentId || typeof contentId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing contentId' });
    }

    // Sanitize filename
    const sanitizedId = contentId.replace(/[^a-z0-9_-]/gi, '');
    const filePath = path.join(CONTENT_DIR, `${sanitizedId}.json`);

    // Prepare content object
    const content = {
      contentId: sanitizedId,
      title: title || 'Untitled',
      industry: industry || 'general',
      html: html || '',
      metadata: metadata || {},
      lastModified: new Date().toISOString(),
      version: '1.0'
    };

    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));

    console.log(`✅ Saved content: ${sanitizedId}`);
    res.json({ 
      success: true, 
      message: 'Content saved successfully',
      contentId: sanitizedId,
      lastModified: content.lastModified,
      path: filePath
    });
  } catch (error) {
    console.error('Error saving content:', error);
    res.status(500).json({ error: 'Failed to save content', details: error.message });
  }
});

/**
 * DELETE /api/content/:contentId
 * Delete saved content
 */
app.delete('/api/content/:contentId', (req, res) => {
  try {
    const { contentId } = req.params;
    const sanitizedId = contentId.replace(/[^a-z0-9_-]/gi, '');
    const filePath = path.join(CONTENT_DIR, `${sanitizedId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Content not found' });
    }

    fs.unlinkSync(filePath);
    console.log(`🗑️  Deleted content: ${sanitizedId}`);
    res.json({ success: true, message: 'Content deleted successfully', contentId: sanitizedId });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content', details: error.message });
  }
});

/**
 * GET /api/contents
 * List all saved contents
 */
app.get('/api/contents', (req, res) => {
  try {
    if (!fs.existsSync(CONTENT_DIR)) {
      return res.json({ contents: [] });
    }

    const files = fs.readdirSync(CONTENT_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const filePath = path.join(CONTENT_DIR, f);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return {
          contentId: content.contentId,
          title: content.title,
          industry: content.industry,
          lastModified: content.lastModified
        };
      })
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    res.json({ contents: files, total: files.length });
  } catch (error) {
    console.error('Error listing contents:', error);
    res.status(500).json({ error: 'Failed to list contents', details: error.message });
  }
});

/**
 * POST /api/export
 * Export all content as JSON
 */
app.post('/api/export', (req, res) => {
  try {
    if (!fs.existsSync(CONTENT_DIR)) {
      return res.json({ contents: [], exportDate: new Date().toISOString() });
    }

    const files = fs.readdirSync(CONTENT_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const filePath = path.join(CONTENT_DIR, f);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      });

    const exportData = {
      exportDate: new Date().toISOString(),
      totalItems: files.length,
      contents: files
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="export-${Date.now()}.json"`);
    res.send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    console.error('Error exporting content:', error);
    res.status(500).json({ error: 'Failed to export content', details: error.message });
  }
});

// ============ STATIC FILES ============

// Serve static files from dist
app.use(express.static(DIST_DIR, {
  maxAge: '1d',
  etag: false
}));

// Handle SPA routing - serve editor.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'editor.html'));
});

// Handle SPA routing - serve the requested file if it exists, otherwise serve editor.html
app.get('*', (req, res, next) => {
  const requestedPath = path.join(ROOT_DIR, req.path);
  
  // Check if the file exists
  fs.access(requestedPath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, serve editor.html
      return res.sendFile(path.join(ROOT_DIR, 'editor.html'));
    }
    // File exists, let Express handle it
    next();
  });
});

// ============ ERROR HANDLING ============

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    details: err.message 
  });
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Multi-Industry Docs Server Started');
  console.log('─'.repeat(50));
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${DIST_DIR}`);
  console.log(`💾 Content stored in: ${CONTENT_DIR}`);
  console.log('');
  console.log('📋 API Endpoints:');
  console.log('  GET  /api/health              - Health check');
  console.log('  GET  /api/contents            - List all saved content');
  console.log('  GET  /api/content/:id         - Retrieve content by ID');
  console.log('  POST /api/save                - Save/update content');
  console.log('  POST /api/export              - Export all content');
  console.log('  DELETE /api/content/:id       - Delete content');
  console.log('');
  console.log('🌍 Available Routes:');
  console.log('  /                             - Markdown Editor');
  console.log('  /editor.html                  - Markdown Editor');
  console.log('  /api/markdown                - Convert Markdown to HTML');
  console.log('  /api/files                   - List all markdown files');
  console.log('  /api/files/:filename         - Get specific markdown file');
  console.log('');
  console.log('─'.repeat(50));
  console.log('📝 Editor available at: http://localhost:3000/editor.html');
  console.log('─'.repeat(50));
});

module.exports = app;
