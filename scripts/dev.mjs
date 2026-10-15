import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('.');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
createServer(async (req, res) => {
    try {
        const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
        if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
        const file = path.endsWith(sep + 'demo') ? resolve(path, 'index.html') : path;
        const data = await readFile(file);
        res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(data);
    } catch { res.writeHead(404).end('Not found'); }
}).listen(8124, '127.0.0.1', () => console.log('Simulated preview: http://127.0.0.1:8124/demo/index.html'));
