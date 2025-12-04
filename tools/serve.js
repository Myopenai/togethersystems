import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 8080;
const root = process.cwd();
const indexPath = path.join(root, 'index.html');

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? indexPath : path.join(root, req.url);
  fs.readFile(urlPath, (err, buf) => {
    if (err) {
      res.writeHead(404); res.end('Not Found'); return;
    }
    const ctype = urlPath.endsWith('.html') ? 'text/html'
      : urlPath.endsWith('.js') ? 'application/javascript'
      : urlPath.endsWith('.css') ? 'text/css'
      : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ctype });
    res.end(buf);
  });
});

server.listen(PORT, () => console.log(`[serve] http://127.0.0.1:${PORT}`));

