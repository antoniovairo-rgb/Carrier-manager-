#!/usr/bin/env node
/* [giro 170b PO-367] BANCO DI MISURA DEI GESTI NEGLI HIGHLIGHT — strumento, NON guardiano. Non tocca src/.
   Per ogni gesto dell'inventario: scene forzate (dal censimento character-lab/CENSIMENTO_SCENE.json), piu' semi, GLB acceso,
   tempo virtuale a 1/60 s per fotogramma (vedi lib/gesti-170b.mjs). Scrive un file grezzo per esecuzione in out/giro170b/raw/
   (ripartibile: le esecuzioni gia' presenti si saltano). L'analisi e' in gesti-170b-analisi.mjs.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node gesti-170b.mjs [filtro-gesto]
        CPM_SEMI=1,2,3 · CPM_PER_PAGINA=5 · CPM_MAX_MIN=9 (si ferma pulito dopo N minuti: i rituali stanno sotto i dieci) */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, __dirname as LIBDIR } from './lib/harness.mjs';
import { pagina170, scena170 } from './lib/gesti-170b.mjs';

/* gesto → [gi, k, esito, tipo forzato, secondi di scena] */
export const CASI = {
  'tiro-collo': [[3, 1], [8, 0], [9, 2]],
  'tiro-piatto': [[0, 0], [10, 1], [3, 0], [12, 0]],
  'tiro-prima': [[1, 2], [2, 0]],
  'tiro-volo': [[6, 1], [9, 0], [1, 0]],
  'pallonetto': [[0, 2], [70, 0]],
  'testa': [[7, 0], [41, 1], [64, 2], [6, 0], [55, 0], [171, 0]],
  'rigore': [[5, 0], [58, 0], [5, 1]],
  'punizione': [[13, 0], [78, 0], [13, 2]],
  'pass-corto': [[18, 0], [3, 2], [28, 1], [85, 0], [20, 2], [25, 1]],
  'pass-lungo': [[29, 0], [60, 0], [59, 2]],
  'cross': [[42, 0], [46, 0], [63, 2], [148, 0], [16, 0], [16, 1], [50, 2], [82, 2]],
  'dribbling': [[30, 0], [150, 0], [120, 2], [29, 2], [79, 1]],
  'contrasto': [[31, 1], [33, 0], [31, 0], [131, 0], [32, 1], [33, 2], [36, 0]],
  'parata': [[3, 1, 'fail', 'saved'], [8, 0, 'fail', 'saved'], [0, 0, 'fail', 'saved'], [7, 0, 'fail', 'saved']],
  'disappunto': [[3, 1, 'fail', 'wide', 6.5], [9, 2, 'fail', 'wide', 6.5], [7, 0, 'fail', 'wide', 6.5]],
  'esultanza': [[3, 1, 'success', null, 8], [0, 0, 'success', null, 8], [7, 0, 'success', null, 8], [5, 0, 'success', null, 8]],
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const OUT = path.join(LIBDIR, '..', 'out', 'giro170b', 'raw'); fs.mkdirSync(OUT, { recursive: true });
  const filtro = process.argv[2] || ''; const SEMI = (process.env.CPM_SEMI || '1,2,3').split(',').map(Number);
  const PER = +(process.env.CPM_PER_PAGINA || 5); const MAXMS = +(process.env.CPM_MAX_MIN || 9) * 60000; const t0 = Date.now();
  const lista = [];
  for (const [g, cs] of Object.entries(CASI)) { if (filtro && !g.includes(filtro)) continue; for (const c of cs) for (const s of SEMI) lista.push({ g, gi: c[0], k: c[1], out: c[2] || 'success', kind: c[3] || null, sec: c[4] || 4.5, seme: s }); }
  lista.sort((a, b) => a.seme - b.seme);/* prima un seme per tutti i gesti, poi il successivo: un giro interrotto resta bilanciato */
  const nome = c => `${c.g}_gi${c.gi}_k${c.k}_${c.out}${c.kind ? '-' + c.kind : ''}_s${c.seme}.json`;
  const fare = lista.filter(c => !fs.existsSync(path.join(OUT, nome(c))));
  console.log(`esecuzioni: ${lista.length} · da fare ${fare.length}`);
  const srv = await startServer(); const b = await launchBrowser(); let page = null, n = 0, fatti = 0;
  for (const c of fare) {
    if (Date.now() - t0 > MAXMS) { console.log('tempo: mi fermo pulito'); break; }
    try {
      if (!page || n >= PER) { if (page) await page.context().close(); page = await pagina170(b, srv.address().port, {}); n = 0; }
      n++;
      const info = await page.evaluate(([gi, k]) => { const s = SITUATIONS[gi]; const a = (s.actions || [])[k]; let t = null; try { t = deriveHL(s, a); } catch (e) {} return { sit: String(s.text || '').slice(0, 60), label: a && a.label, type: t && t.type, variant: t && t.variant, piede: window.__CPM_PIEDE31 || null }; }, [c.gi, c.k]);
      const r = await scena170(page, { gi: c.gi, k: c.k, out: c.out, kind: c.kind, seme: c.seme, secondi: c.sec });
      fs.writeFileSync(path.join(OUT, nome(c)), JSON.stringify({ ...c, info, glb: page._glb, errs: page._errs.slice(0, 5), ...r }));
      fatti++; console.log(`${nome(c)} · ${r.errore || (r.fr.length + ' fr · ' + Object.keys(r.clip).join(',') + ' · archi ' + r.c121.length)}`);
    } catch (e) { console.log(`${nome(c)} · ERRORE ${String(e.message).slice(0, 140)}`); try { await page.context().close(); } catch (_) {} page = null; }
  }
  await b.close(); srv.close();
  console.log(`FINE fatti ${fatti} · restano ${fare.length - fatti} · ${((Date.now() - t0) / 60000).toFixed(1)} min`);
}
