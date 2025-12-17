const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const marked = require('marked');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = process.env.PORT || 3000;
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Configure marked
marked.setOptions({
    gfm: true,
    breaks: true,
    sanitize: false, // We'll handle sanitization with DOMPurify
    smartLists: true,
    smartypants: true
});

// Ensure content directory exists
const CONTENT_DIR = path.join(__dirname, 'content');
if (!fsSync.existsSync(CONTENT_DIR)) {
    fsSync.mkdirSync(CONTENT_DIR, { recursive: true });
}

// Ensure necessary directories exist
const requiredDirs = [
    path.join(__dirname, 'dist'),
    path.join(__dirname, 'dist', 'css'),
    path.join(__dirname, 'dist', 'js'),
    path.join(__dirname, 'dist', 'images'),
    path.join(__dirname, 'logs')
];

requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Set Content Security Policy
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "font-src 'self'; " +
        "connect-src 'self';"
    );
    next();
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
    extensions: ['html', 'htm'],
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// List all markdown files
app.get('/api/files', async (req, res) => {
    try {
        const files = await fs.readdir(CONTENT_DIR);
        const markdownFiles = files
            .filter(file => file.endsWith('.md'))
            .map(file => ({
                name: file,
                path: path.join(CONTENT_DIR, file),
                created: fsSync.statSync(path.join(CONTENT_DIR, file)).birthtime,
                modified: fsSync.statSync(path.join(CONTENT_DIR, file)).mtime
            }));
        res.json(markdownFiles);
    } catch (error) {
        console.error('Error reading files:', error);
        res.status(500).json({ error: 'Failed to read files' });
    }
});

// Get a specific file
app.get('/api/files/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        if (!filename.endsWith('.md')) {
            return res.status(400).json({ error: 'Only .md files are supported' });
        }
        
        const filePath = path.join(CONTENT_DIR, filename);
        const content = await fs.readFile(filePath, 'utf8');
        
        res.json({
            filename,
            content,
            lastModified: (await fs.stat(filePath)).mtime
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({ error: 'File not found' });
        }
        console.error('Error reading file:', error);
        res.status(500).json({ error: 'Failed to read file' });
    }
});

// Save a file
app.post('/api/files', express.json(), async (req, res) => {
    try {
        const { filename, content } = req.body;
        if (!filename || typeof content !== 'string') {
            return res.status(400).json({ error: 'Filename and content are required' });
        }
        
        const safeFilename = filename.replace(/[^a-z0-9\-_\.]/gi, '_').toLowerCase();
        const filePath = path.join(CONTENT_DIR, `${safeFilename}.md`);
        
        await fs.writeFile(filePath, content, 'utf8');
        
        res.json({
            success: true,
            filename: `${safeFilename}.md`,
            path: filePath
        });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ error: 'Failed to save file' });
    }
});

// Delete a file
app.delete('/api/files/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        if (!filename.endsWith('.md')) {
            return res.status(400).json({ error: 'Only .md files can be deleted' });
        }
        
        const filePath = path.join(CONTENT_DIR, filename);
        await fs.unlink(filePath);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// Convert markdown to HTML
app.post('/api/markdown', express.json(), (req, res) => {
    try {
        const { markdown } = req.body;
        if (typeof markdown !== 'string') {
            return res.status(400).send('Markdown content is required');
        }
        
        // Convert markdown to HTML
        const unsafeHtml = marked(markdown);
        // Sanitize HTML to prevent XSS
        const safeHtml = DOMPurify.sanitize(unsafeHtml);
        
        res.send(safeHtml);
    } catch (error) {
        console.error('Error converting markdown:', error);
        res.status(500).send('Error converting markdown to HTML');
    }
});

// Handle SPA routing - serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log(`- http://localhost:${PORT}/`);
    console.log(`- http://localhost:${PORT}/industries/`);
    console.log(`- http://localhost:${PORT}/industries/ecommerce/`);
    console.log(`- http://localhost:${PORT}/404`);
});
