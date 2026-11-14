#!/usr/bin/env node
/* [giro 192 · PO-406] provino: il chiamato della serata (beat 3) nel tempo di scena, 8 fotogrammi ritagliati. Uso: node pres-filmstrip-192.mjs <tag> [flag] */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apri } from './misura-pres-192.mjs';
import { execFileSync } from 'node:child_process';
const TAG = process.argv[2] || 'dopo', FLAGS = (process.argv[3] || '').split(',').filter(Boolean);
const srv = await startServer(); const b = await launchBrowser(); const p = await apri(b, srv.address().port, FLAGS);
await p.evaluate(() => window.__CPM_CAREER.apriPresentazione(3));
await p.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 60000 }).catch(() => {});
const files = [], tempi = [];
for (const tt of [0.2, 0.8, 1.2, 1.6, 2.2, 2.8, 3.4, 4.0]) {
  await p.waitForFunction(t => (window.__CPM_PRES142.t144 || 0) >= t, tt, { timeout: 90000 }).catch(() => {});
  const f = `/tmp/pf192-${files.length}.png`; await p.screenshot({ path: f, clip: { x: 60, y: 300, width: 255, height: 330 } }); files.push(f);
  tempi.push(await p.evaluate(() => +(window.__CPM_PRES142.t144 || 0).toFixed(2))); }
await b.close(); srv.close();
execFileSync('python3', ['-c', `import sys\nfrom PIL import Image\nims=[Image.open(f) for f in sys.argv[2:]]\nc=Image.new('RGB',(sum(i.width for i in ims),ims[0].height))\nx=0\nfor i in ims:\n  c.paste(i,(x,0));x+=i.width\nc.save(sys.argv[1],quality=82)`, `../../docs/sviluppo/giro192/${TAG}-presentazione-filmstrip.jpg`, ...files]);
console.log('tempi', tempi.join(' '));
