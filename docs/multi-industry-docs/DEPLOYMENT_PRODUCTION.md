# Multi-Industry Docs Professional - Remote Deployment Guide

## Overview
This document provides step-by-step instructions to deploy the complete Multi-Industry Docs system to your remote server with full WYSIWYG persistence, API backend, and zero user handlings required.

## Prerequisites
- Remote host: 45.87.81.214 (port 65002)
- Remote credentials: User `u972026836`
- Remote webroot: `/home/u972026836/domains/digitalnotar.in/public_html`
- Node.js installed on remote server (v14+)
- npm installed on remote server

## System Architecture

### Production Stack
```
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Server                        │
│                     (Node.js Backend)                       │
│                    Running on Port 3000                     │
├─────────────────────────────────────────────────────────────┤
│ API Endpoints:                                              │
│  POST   /api/save          → Save WYSIWYG content           │
│  GET    /api/content/:id   → Retrieve saved content         │
│  GET    /api/contents      → List all saved content         │
│  POST   /api/export        → Export all data as JSON        │
│  DELETE /api/content/:id   → Delete content                 │
├─────────────────────────────────────────────────────────────┤
│ Static Files (served from dist/):                           │
│  ✓ index.html             - Homepage with WYSIWYG editor    │
│  ✓ /industries/*          - Industry-specific pages         │
│  ✓ css/styles.min.css     - Compiled & minified styles      │
│  ✓ js/*.min.js            - Minified JavaScript (wysiwyg)   │
├─────────────────────────────────────────────────────────────┤
│ Persistent Storage:                                         │
│  └─ /data/content/        - Saved WYSIWYG content (JSON)    │
└─────────────────────────────────────────────────────────────┘
```

## What's Included

### Core Features
- **WYSIWYG Editor**
  - Real-time editing with visual feedback
  - Auto-save every 500ms (debounced)
  - Undo/Redo history (up to 50 revisions)
  - Rich text formatting (bold, italic, underline, lists)
  - Keyboard shortcuts (Ctrl+S save, Ctrl+Z/Y undo/redo)
  - Save indicators (saving → saved → ✓)

- **Backend API**
  - RESTful endpoints for content management
  - File-based JSON storage in `/data/content/`
  - Full CORS support for cross-domain requests
  - Security headers (CSP, XSS protection, etc.)
  - Health check endpoint for monitoring

- **Static Site**
  - Multi-industry documentation portal
  - Responsive design
  - Search functionality
  - 404 error page handling
  - SPA route fallback to index.html

### Production Build Output
```
dist/
├── index.html           (Homepage with editor)
├── 404.html             (Error page)
├── css/
│   └── styles.min.css   (Compiled SCSS)
├── js/
│   ├── main.min.js      (Main scripts)
│   ├── wysiwyg.min.js   (Enhanced editor)
│   └── search.js        (Search functionality)
└── images/              (Assets)
```

## Deployment Options

### Option A: Manual Upload via WinSCP (Recommended for beginners)

1. **Connect to Remote Server**
   ```
   Host: 45.87.81.214
   Port: 65002
   Username: u972026836
   Password: [your password]
   ```

2. **Upload Project Files**
   - Right-click on `dist/` folder → Upload to `/home/u972026836/domains/digitalnotar.in/public_html/`
   - Right-click on `server.js` → Upload to `/home/u972026836/domains/digitalnotar.in/public_html/`
   - Right-click on `package.json` → Upload to `/home/u972026836/domains/digitalnotar.in/public_html/`

3. **Install Dependencies on Server**
   ```bash
   cd /home/u972026836/domains/digitalnotar.in/public_html
   npm install
   ```

4. **Start Server**
   ```bash
   # Option 1: Direct run
   PORT=80 node server.js
   
   # Option 2: Background (using nohup)
   nohup PORT=80 node server.js > server.log 2>&1 &
   
   # Option 3: Using pm2 (if installed)
   pm2 start server.js --name "docs" -- --PORT 80
   ```

5. **Verify Server is Running**
   ```bash
   curl http://localhost:80/api/health
   # Response: {"status":"ok","timestamp":"...","uptime":...}
   ```

### Option B: Automated PowerShell Deployment

Use the provided `deploy-secure.ps1` script:

```powershell
# Generate secure credential
$cred = Get-Credential -UserName "u972026836" -Message "Enter remote password"

# Run deployment
.\deploy-secure.ps1 -Host "45.87.81.214" `
                    -Port 65002 `
                    -Credential $cred `
                    -SourcePath "D:\...\docs\multi-industry-docs" `
                    -RemotePath "/home/u972026836/domains/digitalnotar.in/public_html"
```

### Option C: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist ./dist
COPY server.js .
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t multi-industry-docs .
docker run -p 3000:3000 -v $(pwd)/data:/app/data multi-industry-docs
```

## Post-Deployment Configuration

### 1. Set Environment Variables
```bash
# For production
export NODE_ENV=production
export PORT=80

# For development/testing
export NODE_ENV=development
export PORT=3000
```

### 2. Configure Server Port
- **Port 80** (HTTP): Direct internet access (recommended for production)
- **Port 3000** (default): Development/testing behind reverse proxy
- **Port 443** (HTTPS): With SSL certificate (requires additional setup)

### 3. Set Up Reverse Proxy (nginx)
If running on port 3000 and want port 80 access:

```nginx
server {
    listen 80;
    server_name digitalnotar.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Enable HTTPS (Optional but Recommended)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d digitalnotar.in

# Update nginx config to use certificate
```

## API Usage Examples

### Save Content
```bash
curl -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "ecommerce-guide",
    "html": "<h1>E-commerce Guide</h1><p>Content here...</p>",
    "title": "E-commerce Getting Started",
    "industry": "ecommerce"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Content saved successfully",
  "contentId": "ecommerce-guide",
  "lastModified": "2024-01-10T15:30:45.123Z"
}
```

### Retrieve Content
```bash
curl http://localhost:3000/api/content/ecommerce-guide
```

**Response:**
```json
{
  "contentId": "ecommerce-guide",
  "title": "E-commerce Getting Started",
  "industry": "ecommerce",
  "html": "<h1>E-commerce Guide</h1><p>Content here...</p>",
  "metadata": {
    "wordCount": 150,
    "charCount": 1250
  },
  "lastModified": "2024-01-10T15:30:45.123Z"
}
```

### List All Content
```bash
curl http://localhost:3000/api/contents
```

**Response:**
```json
{
  "contents": [
    {
      "contentId": "ecommerce-guide",
      "title": "E-commerce Getting Started",
      "industry": "ecommerce",
      "lastModified": "2024-01-10T15:30:45.123Z"
    }
  ],
  "total": 1
}
```

### Export All Content
```bash
curl -X POST http://localhost:3000/api/export \
  -H "Content-Type: application/json" \
  > export-backup.json
```

### Delete Content
```bash
curl -X DELETE http://localhost:3000/api/content/ecommerce-guide
```

## Monitoring & Maintenance

### Check Server Status
```bash
# Health check
curl http://localhost:3000/api/health

# View logs (if using nohup)
tail -f server.log

# Monitor with pm2
pm2 status
pm2 logs docs
```

### Backup Content
```bash
# Backup JSON files
tar -czf content-backup-$(date +%Y%m%d).tar.gz /home/u972026836/domains/digitalnotar.in/public_html/data/

# Or use API export
curl -X POST http://localhost:3000/api/export > backup-$(date +%Y%m%d).json
```

### Update Server
```bash
# Stop server
pm2 stop docs

# Pull latest code
git pull origin main

# Rebuild
npm run build

# Restart
pm2 start docs
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Permission Denied
```bash
# Fix file permissions
chmod -R 755 /home/u972026836/domains/digitalnotar.in/public_html/
chmod -R 755 /home/u972026836/domains/digitalnotar.in/public_html/data/
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Server Crashes
```bash
# View error logs
tail -100 server.log

# Start with verbose logging
NODE_DEBUG=* node server.js
```

## Security Checklist

- [ ] Change default credentials (local development only)
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure firewall rules (only allow necessary ports)
- [ ] Set up regular backups of `/data/content/`
- [ ] Enable monitoring and alerting
- [ ] Review security headers in server.js
- [ ] Restrict API endpoints if needed (add authentication)
- [ ] Keep Node.js and npm updated
- [ ] Review logs regularly for suspicious activity

## Performance Optimization

### Enable Caching
```javascript
// Already configured in server.js with:
// - Static asset caching (1 day)
// - ETag support
// - 304 Not Modified responses
```

### Database Optimization
```bash
# For larger deployments, consider upgrading to:
# - MongoDB
# - PostgreSQL
# - Redis (caching)
```

### Load Balancing
```bash
# For high traffic, use pm2 cluster mode:
pm2 start server.js -i max --name "docs"
```

## Support & Documentation

- **API Documentation:** See API Usage Examples above
- **WYSIWYG Editor API:** See [Enhanced Editor Documentation](./WYSIWYG_API.md)
- **Build System:** Uses Node.js build tools (Sass, Terser, PostCSS)
- **Server Framework:** Express.js with CORS and body-parser middleware

## Version Info
- Node.js: v14+ (tested with v18)
- Express.js: ^4.18.2
- WYSIWYG Editor: v1.0 (with auto-save persistence)
- Build Tools: Sass, Terser, PostCSS, Autoprefixer

---

**Ready to Deploy!** 🚀

Follow the deployment option that best fits your setup (A, B, or C), then verify with the health check endpoint.

All content is automatically persisted to `/data/content/` and will survive server restarts.
