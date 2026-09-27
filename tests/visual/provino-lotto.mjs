#!/usr/bin/env node
/* [7.999.31 lotto gesti P1-a] PROVINO DELLE CLIP CANDIDATE: fotografa ogni clip in N istanti sul corpo di gioco (CGTrader lod1)
   usando tests/visual/provino-clip.html, e salva un foglio per clip in tests/character-lab/provini-p1a/.
   Nessuna modifica al gioco. Uso: node provino-lotto.mjs [clip,clip...]  (prefisso cg: = clip del pacchetto CGTrader) */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const DEF = ['cg:opening', 'cg:walk', 'cg:running', 'cg:jogging', 'cg:run-look-back', 'cg:look-over-shoulder', 'cg:recovery-run', 'cg:running-to-turn',
  'mx-stall-soccerball', 'mx-kneeing-soccerball', 'mx-goalkeeper-directing', 'mx-offensive-idle', 'mx-transition'];
const arg = process.argv[2] ? process.argv[2].split(',') : DEF;
const OUT = path.resolve('../character-lab/provini-p1a'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const esiti = [];
/* il file Mixamo ha piu' varianti con suffisso: se il nome esatto manca si prende la prima che comincia cosi' */
for (const a of arg) {
  const cg = a.startsWith('cg:'); const fi = a.startsWith('file:'); let nome = cg ? a.slice(3) : a; let FILE = null;
  if (fi) { const [, f, n] = a.split(':'); FILE = f; nome = n; }
  const page = await b.newPage({ viewport: { width: 1260, height: 300 } }); await installCdnRoutes(page);
  const url = n => `http://localhost:${port}/tests/visual/provino-clip.html?clip=${encodeURIComponent(n)}&n=${process.env.CPM_NFOTO || 6}${cg ? '&src=cg' : ''}${FILE ? '&file=' + encodeURIComponent(FILE) : ''}`;
  await page.goto(url(nome), { waitUntil: 'load' });
  let r = null; for (let i = 0; i < 60 && !r; i++) { r = await page.evaluate(() => window.__PROVINO || null); if (!r) await sleep(500); }
  if (r && !r.ok && /disponibili|assente/.test(r.err || '')) {
    const lista = await page.evaluate(async (cgf) => { const L = new THREE.GLTFLoader(); const f = cgf ? '../../assets/cgtrader-review-lod1-kit-adapter.glb' : '../../assets/cgtrader-clip-mixamo.glb'; const g = await new Promise((o, k) => L.load(f, o, undefined, k)); return g.animations.map(x => x.name); }, cg);
    const alt = lista.find(x => x.startsWith(nome)); if (alt) { nome = alt; await page.goto(url(nome), { waitUntil: 'load' }); r = null; for (let i = 0; i < 60 && !r; i++) { r = await page.evaluate(() => window.__PROVINO || null); if (!r) await sleep(500); } }
    else r = { ok: false, err: 'assente; simili: ' + lista.filter(x => x.includes(nome.split('-')[1] || nome)).join(',') };
  }
  const f = path.join(OUT, (cg ? 'cg-' : '') + nome + '.png');
  if (r && r.ok) await page.screenshot({ path: f, fullPage: true });
  esiti.push({ clip: (cg ? 'cg:' : '') + nome, ok: !!(r && r.ok), piede: r && r.piede || null, testa: r && r.testa || null, durata: r && r.durata ? +r.durata.toFixed(2) : null, bacinoY: r && r.campioni ? r.campioni.map(c => c.y) : null, err: r && r.err || null });
  console.log(JSON.stringify(esiti[esiti.length - 1]));
  await page.close();
}
await b.close(); srv.close();
fs.writeFileSync(path.join(OUT, 'esiti.json'), JSON.stringify(esiti, null, 1));
