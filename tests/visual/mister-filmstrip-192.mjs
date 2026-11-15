#!/usr/bin/env node
/* [giro 192] provino: primo piano sul mister che entra nella premiazione di coppa (8 fotogrammi), per GUARDARE la falcata.
   Uso: node mister-filmstrip-192.mjs <tag> [flag]. Scrive docs/sviluppo/giro192/<tag>-mister-filmstrip.jpg */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { execFileSync } from 'node:child_process';
const TAG = process.argv[2] || 'dopo', FLAGS = (process.argv[3] || '').split(',').filter(Boolean);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const p = await b.newPage({ viewport: { width: 375, height: 812 } }); await installCdnRoutes(p);
await p.addInitScript(f => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CERCAM192 = 'mister'; for (const k of f) window[k] = 1; }, FLAGS);
await openMatch(p, port, { skipLoadAll: true, name: 'Film192' });
await p.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
await p.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'COPPA NAZIONALE', kind: 'cup' }));
await p.waitForFunction(() => window.__CPM_COACH77 && window.__CPM_COACH77.fr.some(f => f.glb === 1), null, { timeout: 60000 }).catch(() => {});
await p.evaluate(() => { window.__CPM_CERT_SET = 0; }); await sleep(2500);
const files = [];
for (let i = 0; i < 8; i++) { const f = `/tmp/film192-${i}.png`; await p.screenshot({ path: f, clip: { x: 60, y: 250, width: 255, height: 380 } }); files.push(f); await sleep(450); }
await b.close(); srv.close();
execFileSync('python3', ['-c', `import sys\nfrom PIL import Image\nims=[Image.open(f) for f in sys.argv[2:]]\nc=Image.new('RGB',(sum(i.width for i in ims),ims[0].height))\nx=0\nfor i in ims:\n  c.paste(i,(x,0));x+=i.width\nc.save(sys.argv[1],quality=82)`, `../../docs/sviluppo/giro192/${TAG}-mister-filmstrip.jpg`, ...files]);
console.log('filmstrip', TAG);
