'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'public');
const port = Number(process.env.PORT || 3000);
// Requests that reach the bare Railway hostname are sent to the real domain.
// Only the path and query are carried over onto a fixed origin, so a crafted
// URL (for example "//evil.example") can never redirect off-site.
const CANONICAL_ROOT = 'https://astrorootwork.com/';
function canonicalUrl(reqUrl) {
  const incoming = new URL(reqUrl, 'http://localhost');
  const target = new URL(CANONICAL_ROOT);
  target.pathname = incoming.pathname;
  target.search = incoming.search;
  return target.href;
}
const CSP = [
  "default-src 'self'",
  "script-src 'none'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests"
].join('; ');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader('X-Frame-Options', 'DENY');
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Method not allowed');
  }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Bad request'); }
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(req.method === 'HEAD' ? undefined : 'ok');
  }
  const host = String(req.headers.host || '').split(':')[0].toLowerCase();
  if (host === 'www.astrorootwork.com' || host.endsWith('.up.railway.app')) {
    res.writeHead(301, { Location: canonicalUrl(req.url) });
    return res.end();
  }
  let rel = pathname === '/' ? '/index.html' : pathname;
  // Extensionless room URLs: /observatory serves observatory.html.
  if (!path.extname(rel) && !rel.endsWith('/') && rel !== '/404') rel += '.html';
  const file = path.resolve(root, '.' + rel);
  if (!file.startsWith(root + path.sep) || pathname.includes('\0')) {
    res.writeHead(404);
    return res.end('Not found');
  }
  try {
    const stat = await fs.promises.stat(file);
    if (!stat.isFile()) throw new Error('Not a file');
    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'public, max-age=0, must-revalidate'
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
  } catch {
    const missing = path.join(root, '404.html');
    const html = fs.existsSync(missing) ? fs.readFileSync(missing) : '<p>Room not found.</p>';
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : html);
  }
});
server.listen(port, '0.0.0.0', () => console.log(`The Lucent Laboratory is open on port ${port}`));
process.on('SIGTERM', () => server.close());
