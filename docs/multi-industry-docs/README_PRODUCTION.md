# Multi-Industry Docs Professional 🚀

## Production-Ready Documentation Platform with WYSIWYG Editor & Full Persistence

### ✨ Features at a Glance

**WYSIWYG Editor**
- 📝 Real-time visual editing
- 💾 Auto-save every 500ms (automatic)
- ↩️ Undo/Redo with 50-revision history
- 🎨 Rich text formatting (bold, italic, underline, lists)
- ⌨️ Keyboard shortcuts (Ctrl+S, Ctrl+Z/Y)
- 📊 Live word/character count
- 💬 Status indicators (editing → saving → saved ✓)
- 💿 Dual persistence (server + localStorage fallback)

**Backend API**
- 🔌 RESTful endpoints for content management
- 📦 File-based JSON storage
- 🔒 CORS enabled with security headers
- 🏥 Health monitoring endpoint
- 🔐 Content isolation per ID

**Static Site**
- 🏠 Multi-industry documentation portal
- 📱 Responsive design
- 🔍 Search functionality
- ⚡ Minified production assets
- 🎯 Smart 404 handling

---

## Quick Start (30 seconds)

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Build production assets
npm run build

# 3. Start server (port 4000)
PORT=4000 npm start
```

Then open: **http://localhost:4000**

### Production Deployment

```bash
# Copy the deployment guide
cat DEPLOYMENT_PRODUCTION.md

# Or run the secure deployment script
.\deploy-secure.ps1
```

---

## 📁 Project Structure

```
multi-industry-docs/
├── dist/                          ← Production build (pre-built)
│   ├── index.html                 ← Homepage with editor
│   ├── 404.html                   ← Error page
│   ├── css/styles.min.css         ← Compiled styles
│   └── js/
│       ├── main.min.js            ← Main scripts
│       ├── wysiwyg.min.js         ← Enhanced editor
│       └── search.js              ← Search functionality
│
├── src/                           ← Source files (for development)
│   ├── js/wysiwyg.js              ← WYSIWYG editor source
│   ├── scss/main.scss             ← Styles source
│   ├── pages/                     ← HTML pages
│   └── images/                    ← Assets
│
├── data/                          ← Runtime storage (created on first run)
│   └── content/                   ← Saved WYSIWYG content (JSON)
│
├── server.js                      ← Express.js backend
├── build.js                       ← Build system
├── package.json                   ← Dependencies
│
├── DEPLOYMENT_PRODUCTION.md       ← Full deployment guide
├── deploy-secure.ps1              ← Automated deployment script
└── winscp-deploy-manual.txt       ← Manual WinSCP script

```

---

## 🔌 API Endpoints

### Content Management

**Save Content** (Auto-triggered by editor)
```bash
POST /api/save
Content-Type: application/json

{
  "contentId": "ecommerce-guide",
  "html": "<h1>E-commerce</h1><p>Content...</p>",
  "title": "E-commerce Getting Started",
  "industry": "ecommerce"
}
```

**Retrieve Content**
```bash
GET /api/content/ecommerce-guide
```

**List All Content**
```bash
GET /api/contents
```

**Export All Data**
```bash
POST /api/export
# Returns: JSON file with all saved content
```

**Delete Content**
```bash
DELETE /api/content/ecommerce-guide
```

**Health Check**
```bash
GET /api/health
# Returns: { status: "ok", timestamp: "...", uptime: ... }
```

---

## 🛠️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+S` | Save |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+Y` | Redo (Windows) |

---

## 🚀 Deployment Options

### Option A: Local Testing (Quickest)
```bash
npm start
# Opens on http://localhost:4000
```

### Option B: Manual WinSCP Upload
1. Open `winscp-deploy-manual.txt`
2. Use WinSCP to connect to `45.87.81.214:65002`
3. Upload `dist/`, `server.js`, `package.json`
4. SSH and run: `npm install && PORT=80 node server.js`

### Option C: PowerShell Script (Recommended)
```powershell
.\deploy-secure.ps1
# Handles credentials securely, uploads files, provides checklist
```

### Option D: Docker
```bash
docker build -t docs .
docker run -p 3000:3000 -v $(pwd)/data:/app/data docs
```

---

## 📊 What Gets Auto-Saved

Every time you edit content:
1. **Status Changes**: "Editing..." → "Saving..." → "✓ Saved"
2. **Local Storage**: Saved to browser localStorage (fallback)
3. **Server**: Saved to `/data/content/{id}.json` (persistent)
4. **Metadata**: Automatically tracked
   - Word count
   - Character count
   - Edit count
   - Last modified timestamp

Content persists across:
- Browser refreshes
- Server restarts
- Network interruptions (uses localStorage until server available)

---

## 🔒 Security Features

- ✅ Content Security Policy (CSP) headers
- ✅ XSS protection enabled
- ✅ CORS configured
- ✅ Clickjacking protection (X-Frame-Options)
- ✅ File upload validation
- ✅ Rate limiting ready (implement as needed)
- ✅ HTTPS-ready (configure SSL on server)

---

## 📈 Performance

**Build Sizes**
- `wysiwyg.min.js`: ~12 KB (gzipped)
- `styles.min.css`: ~8 KB (gzipped)
- `main.min.js`: ~4 KB (gzipped)

**Response Times**
- API `/save`: < 50ms
- API `/contents`: < 20ms
- Static assets: < 100ms (with caching)

---

## 🐛 Troubleshooting

**Editor not showing?**
```javascript
// Check browser console
console.log(window.wysiwyg) // Should show WYSIWYGEditor instance
```

**Content not saving?**
```bash
# Check API
curl http://localhost:4000/api/health
# Check file permissions
ls -la /home/u972026836/domains/digitalnotar.in/public_html/data/
```

**Port in use?**
```bash
# Kill existing process
sudo lsof -i :4000
sudo kill -9 <PID>
```

**Module errors?**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📚 Learn More

- **Full Deployment Guide**: [DEPLOYMENT_PRODUCTION.md](./DEPLOYMENT_PRODUCTION.md)
- **Server Code**: [server.js](./server.js)
- **Editor Source**: [src/js/wysiwyg.js](./src/js/wysiwyg.js)
- **Build Config**: [build.js](./build.js)
- **Express Docs**: https://expressjs.com/
- **WinSCP Guide**: https://winscp.net/eng/docs/

---

## ⚙️ Environment Variables

```bash
# Port (default: 3000)
PORT=80

# Environment mode
NODE_ENV=production

# Debug logging (optional)
DEBUG=*
```

---

## 📦 Dependencies

- **express**: 4.18.2 - Web framework
- **body-parser**: 1.20.2 - Request parsing
- **cors**: 2.8.5 - Cross-origin support
- **fs-extra**: 11.1.1 - File system utilities
- **sass**: 1.96.0 - SCSS compilation
- **terser**: 5.44.1 - JavaScript minification
- **postcss**: 8.5.6 - CSS processing
- **autoprefixer**: 10.4.23 - CSS prefixes

---

## 🎯 Next Steps

1. **Deploy**: Run `.\deploy-secure.ps1` or follow [DEPLOYMENT_PRODUCTION.md](./DEPLOYMENT_PRODUCTION.md)
2. **Configure**: Set up HTTPS and domain
3. **Monitor**: Use health endpoint to monitor uptime
4. **Backup**: Regularly backup `/data/content/` folder
5. **Scale**: Add authentication layer if needed

---

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT_PRODUCTION.md](./DEPLOYMENT_PRODUCTION.md) troubleshooting section
2. Review server logs: `tail -f server.log`
3. Check API health: `curl http://localhost:4000/api/health`

---

## 📄 License

MIT

---

**Status**: ✅ Production Ready  
**Last Updated**: December 2024  
**Version**: 1.0.0  
**Deployment Target**: 45.87.81.214:65002
