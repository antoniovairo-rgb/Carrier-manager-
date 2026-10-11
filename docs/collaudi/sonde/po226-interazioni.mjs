#!/usr/bin/env node
/* PO-226 — censimento delle interazioni in partita, SOLA OSSERVAZIONE (nessuna modifica al gioco).
   Per ogni partita vera (provino → partita reale, come match-full-test.mjs), registra:
     - SCHEDE INTX669 (testimone __CPM_INTX669: minuto, id, famiglia) — dal testimone di collaudo, armato da ?cpmtest=1
     - SCELTE su scheda (testimone __CPM_SC681: id, indice, auto=true se è scattato il timer sull'opzione neutra)
     - ORDINI DEL MISTER e GRIDE (letti dal DOM: il MutationObserver confronta il testo comparso con i testi
       di COACH_ORDERS (txt + alt) e di COACH_SHOUTS, presenti nel sorgente del gioco; registra minuto di comparsa,
       punteggio e fase)
     - SOSTITUZIONE (__CPM_SUBOFF(): minuto di uscita, panchina)
   Opzione --panchina: l'eroe parte in panchina con __CPM_FORCE_BENCH (hook di collaudo ESISTENTE, forzato: va dichiarato).
   Uso: node po226-interazioni.mjs <nomeFile> <indiceInizio> <quante> [panchina]
   Ogni partita scrive un JSON in docs/collaudi/PO226-dati/ (il nome del giocatore cambia per partita: il seme nasce anche dal nome). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from '../../../tests/visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, '..', 'PO226-dati');
fs.mkdirSync(outDir, { recursive: true });
const [, , tag = 'run', startArg = '0', countArg = '3', benchArg = ''] = process.argv;
const start = +startArg, count = +countArg, panchina = benchArg === 'panchina';
const TETTO_MS = 260000;

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
// Percorso di CARRIERA (salvataggio della zona B, nome del giocatore diverso per partita): è il percorso
// che il PO gioca. Il provino (openMatch) non emetteva ordini del mister: non lo usiamo per il censimento.
const SAVE = JSON.parse(fs.readFileSync(path.join(here, '..', '..', '..', 'tests', 'visual', 'fixtures', 'save-194-primavera-w38.json'), 'utf8'));
for (let i = start; i < start + count; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const nome = `Coll226${tag}${i}`;
  const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = nome;
  await page.addInitScript((s) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, save);
  const t0 = Date.now();
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
    await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {});
    await sleep(2500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    if (panchina) await page.evaluate(() => window.__CPM_FORCE_BENCH && window.__CPM_FORCE_BENCH(false));
    // Osservatore sul DOM: ordini e grida, dal testo che il gioco stesso scrive (liste del sorgente).
    await page.evaluate(() => {
      const L = [];
      // coachSay() sceglie fra ctx e alt (CARRIER-MANAGER-AV.html:25155): il testo mostrato è uno di questi.
      try { Object.entries(COACH_ORDERS).forEach(([k, o]) => { L.push({ k: 'ordine', id: k, s: o.ctx }); (o.alt || []).forEach((a, j) => L.push({ k: 'ordine-alt', id: k + '#' + j, s: a })); }); } catch (e) {}
      try { Object.entries(COACH_SHOUTS).forEach(([cat, arr]) => (arr || []).forEach(s => L.push({ k: 'grida', id: cat, s }))); } catch (e) {}
      window.__SONDA226 = { voci: [], visti: {} };
      const cerca = (testo) => { for (const v of L) if (testo.indexOf(v.s) >= 0) return v; return null; };
      const reg = (v) => {
        const cl = (window.__CPM_CLOCK && window.__CPM_CLOCK()) | 0, sc = window.__CPM_SCORE ? window.__CPM_SCORE() : null;
        const key = v.k + ':' + v.id + ':' + cl;
        if (window.__SONDA226.visti[key]) return; window.__SONDA226.visti[key] = 1;
        window.__SONDA226.voci.push({ min: cl, k: v.k, id: v.id, testo: v.s.slice(0, 60), score: sc, fase: window.__CPM_PHASE ? window.__CPM_PHASE() : null });
      };
      // Scansione periodica del testo VISIBILE (React riscrive i nodi esistenti: un osservatore sui soli nodi aggiunti perde le righe).
      // Testimone del riquadro del mister (CARRIER-MANAGER-AV.html:37025, data-cpm="panchina"): quanti nodi, e un campione del testo.
      window.__SONDA226.pn = 0; window.__SONDA226.snip = [];
      setInterval(() => {
        let t = ''; try { t = document.body.innerText || ''; } catch (e) { return; }
        const nodi = document.querySelectorAll('[data-cpm="panchina"]').length;
        if (nodi > window.__SONDA226.pn) window.__SONDA226.pn = nodi;
        if ((t.indexOf('Panchina') >= 0 || t.indexOf('📢') >= 0) && window.__SONDA226.snip.length < 4) {
          const i = Math.max(t.indexOf('Panchina'), t.indexOf('📢')); window.__SONDA226.snip.push(t.slice(i, i + 90).replace(/\n/g, ' | '));
        }
        for (const v of L) if (v.s && t.indexOf(v.s) >= 0) reg(v);
      }, 350);
    });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 1100 + i * 37);
    let finita = false, ck = null; const t1 = Date.now();
    while (Date.now() - t1 < TETTO_MS) {
      await sleep(600);
      const d = await page.evaluate(() => ({ ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, ck: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null }));
      if (d.ck != null) ck = d.ck;
      if (d.ph === 'ended' || d.ph === 'ceremony') { finita = true; break; }
    }
    const dati = await page.evaluate(() => ({
      intx: (window.__CPM_INTX669 || []).map(x => ({ min: x.min, id: x.id, fam: x.fam })),
      sc: (window.__CPM_SC681 || []).map(x => ({ id: x.id, idx: x.idx, auto: x.auto, min: x.min })),
      sub: (() => { try { return window.__CPM_SUBOFF ? window.__CPM_SUBOFF() : null; } catch (e) { return null; } })(),
      score: window.__CPM_SCORE ? window.__CPM_SCORE() : null,
      voci: (window.__SONDA226 || { voci: [] }).voci,
      panchinaNodiMax: (window.__SONDA226 || {}).pn ?? null,
      panchinaSnip: (window.__SONDA226 || {}).snip || [],
      intxN: window.__CPM_INTX_N || null,
      hlMin: (() => { try { return window.__CPM_HLTIMES ? window.__CPM_HLTIMES() : []; } catch (e) { return []; } })(),
    }));
    const rec = { partita: i, nome, panchina, finita, ckFinale: ck, secondi: Math.round((Date.now() - t0) / 1000), errori: errs.slice(0, 3), ...dati };
    fs.writeFileSync(path.join(outDir, `${tag}-p${i}.json`), JSON.stringify(rec, null, 1));
    console.log(`p${i} ${finita ? 'FINITA' : 'NON_FINITA'} ck=${ck} score=${JSON.stringify(dati.score)} intx=${dati.intx.length} sc=${dati.sc.length} voci=${dati.voci.length} sub=${dati.sub && dati.sub.off} ${rec.secondi}s`);
  } catch (e) {
    console.log(`p${i} ERRORE: ${String(e.message).slice(0, 160)}`);
  }
  await page.close();
}
await b.close(); srv.close();
