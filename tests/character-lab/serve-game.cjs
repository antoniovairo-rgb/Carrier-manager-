const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..', 'dist');
const PORT = Number(process.env.PORT || 4174);
const LAN = process.argv.includes('--lan');
const HOST = LAN ? '0.0.0.0' : '127.0.0.1';
const TOKEN = LAN ? (process.env.KORWARD_TOKEN || crypto.randomBytes(18).toString('base64url')) : null;
const localIp = () => Object.values(os.networkInterfaces()).flat().find(n => n && n.family === 'IPv4' && !n.internal)?.address || 'IP-del-PC';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.glb': 'model/gltf-binary', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (LAN) {
    const paired = url.searchParams.get('access') === TOKEN || String(req.headers.cookie || '').split(';').some(v => v.trim() === `korward-pair=${TOKEN}`);
    if (!paired) { res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Apri il link di pairing mostrato nel terminale.'); }
    if (url.searchParams.get('access') === TOKEN) res.setHeader('Set-Cookie', `korward-pair=${TOKEN}; HttpOnly; SameSite=Strict; Path=/`);
  }
  const pathname = decodeURIComponent(url.pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^[/\\]+/, '');
  const file = path.resolve(ROOT, relative);
  if (!file.startsWith(ROOT + path.sep) && file !== path.join(ROOT, 'index.html')) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (error, body) => {
    if (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 500); return res.end(error.code || 'Error'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  });
}).listen(PORT, HOST, () => {
  if (LAN) console.log(`Korward POC mobile (link temporaneo): http://${localIp()}:${PORT}/?hyperCharacter=full&access=${TOKEN}`);
  else console.log(`Korward POC: http://127.0.0.1:${PORT}/?hyperCharacter=hero`);
});
