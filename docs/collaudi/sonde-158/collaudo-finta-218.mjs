#!/usr/bin/env node
/* [COLLAUDO PO-218 · «Finta e tiro» · sessione collaudatrice, build 7.999.158]
   Le scene «🌀 Finta e tiro» non sono emerse abbastanza dall'autoplay (1 su 25 nel primo giro di partite vere): si
   FORZANO le situazioni che contengono quell'azione (__CPM_FORCE_SIT, come il gate) su una griglia di posizioni di
   partenza (ppos, cambia la geometria della scena), si sceglie l'azione con __CPM_RESOLVE e si legge il testimone
   __CPM_RES218 (esito del motore) + la prima riga di cronaca successiva (__CPM_TXT487, letta alla sorgente).
   Output: jsonl su OUT/finta-218.json, una voce per scena: riquadro (ovl), famiglia (fam), esito (outKind),
   eventi del motore (ev), cronaca (txt), coerenza testo↔motore (contraddizione, stessa regola di esiti-218.mjs).
   Uso: node collaudo-finta-218.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';

const OUT = process.env.OUT || '/tmp/cpm158/collaudo-out'; fs.mkdirSync(OUT, { recursive: true });
const POS = [{ x: 58, y: 50 }, { x: 66, y: 34 }, { x: 66, y: 66 }, { x: 74, y: 50 }, { x: 52, y: 42 }];
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_TXT487 = null; });
await openMatch(page, port, { name: 'Collaudo Finta' });

const gis = await page.evaluate(() => (typeof SITUATIONS !== 'undefined' ? SITUATIONS : []).map((s, i) => ({ i, k: (s.actions || []).findIndex(a => /Finta e tiro/.test(a.label || '')), testo: s.text || s.title || '' })).filter(x => x.k >= 0));
console.error('situazioni con «Finta e tiro»:', JSON.stringify(gis));

const CONTR = (r) => {
  const ev = r.ev || [], fam = r.fam;
  const t = ev.find(e => String(e).startsWith('tiro:')); const es = t ? String(t).split(':')[1].split('(')[0] : null;
  if (ev.some(e => String(e).startsWith('intercetto')) && /^(blocked|wide|saved|post)$/.test(fam || '')) return 'passaggio intercettato raccontato come ' + fam;
  if (es && fam) { const m = { fuori: 'wide', saved: 'saved', blocked: 'blocked', post: 'post' }[es]; if (m && /^(wide|saved|blocked|post)$/.test(fam) && m !== fam) return 'tiro ' + es + ' raccontato come ' + fam; }
  return null;
};
const scene = [];
for (const g of gis) for (const p of POS) {
  await page.evaluate(() => { window.__CPM_RES218 = []; window.__CPM_TXT487 = null; });
  await page.evaluate(([i, pp]) => window.__CPM_FORCE_SIT(i, true, pp), [g.i, p]);
  await sleep(900);
  const ok = await page.evaluate(k => window.__CPM_RESOLVE(k), g.k);
  let res = null, txt = null;
  for (let k = 0; k < 20 && !res; k++) { await sleep(300); res = await page.evaluate(() => (window.__CPM_RES218 || []).slice(-1)[0] || null); }
  await sleep(600);
  txt = await page.evaluate(() => (window.__CPM_TXT487 && (window.__CPM_TXT487.txt || window.__CPM_TXT487)) || null);
  const row = { gi: g.i, pos: p, risolta: ok, azione: 'Finta e tiro', situazione: g.testo, riquadro: res && res.ovl, fam: res && res.fam, esito: res && res.outKind, key: res && res.key, ok: res && res.ok, eventi: res && res.ev, cronaca: typeof txt === 'string' ? txt : (txt && txt.txt) || null, contraddizione: res ? CONTR(res) : 'nessun testimone' };
  scene.push(row);
  console.error(`gi${g.i} x${p.x}y${p.y} → ${row.esito} · ${row.riquadro} · ${row.contraddizione || 'coerente'}`);
}
const contr = scene.filter(s => s.contraddizione && s.contraddizione !== 'nessun testimone').length;
const fs_ = path.join(OUT, 'finta-218.json');
fs.writeFileSync(fs_, JSON.stringify({ build: '7.999.158', totale: scene.length, contraddizioni: contr, pageerror: errors.length, primoErrore: errors[0] || null, scene }, null, 1));
console.log(JSON.stringify({ totale: scene.length, contraddizioni: contr, pageerror: errors.length }));
await browser.close(); srv.close();
