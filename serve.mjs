/** Local-only server for the icon editor: the page, plus read access to one folder of SVG icons. */
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

const here = fileURLToPath(new URL('.', import.meta.url));
const iconsDir = resolve(process.argv[2] ?? '.');
const port = Number(process.env.PORT ?? 4310);

const send = (res, status, type, body) => {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
};

const SAFE_NAME = /^[\w-][\w.-]*\.svg$/;
const allowedHosts = new Set([`localhost:${port}`, `127.0.0.1:${port}`]);

createServer(async (req, res) => {
  /** Rejects other host names, so a page that rebinds its DNS to 127.0.0.1 cannot read the icons. */
  if (!allowedHosts.has(req.headers.host)) return send(res, 403, 'text/plain', 'forbidden');
  const path = new URL(req.url, 'http://localhost').pathname;
  try {
    if (path === '/') return send(res, 200, 'text/html', await readFile(join(here, 'index.html')));
    if (path === '/icons') {
      const names = (await readdir(iconsDir)).filter((n) => SAFE_NAME.test(n)).sort();
      return send(res, 200, 'application/json', JSON.stringify(names));
    }
    const name = path.startsWith('/icons/') && path.slice(7);
    if (name && SAFE_NAME.test(name)) return send(res, 200, 'text/plain', await readFile(join(iconsDir, name)));
    send(res, 404, 'text/plain', 'not found');
  } catch {
    send(res, 404, 'text/plain', 'not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`icon editor on http://localhost:${port} for ${iconsDir}`));
