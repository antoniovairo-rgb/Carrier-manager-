#!/usr/bin/env node
/* [giro 44 PO-226] STRUMENTO DI MISURA (non guardiano): la risposta alla domanda del PO «le interazioni durante la partita hanno risvolti?
   quante a partita? sono correlate all'andamento?», misurata su partite vere di carriera dopo il giro 28 (PO-259).
   Percorso uguale al censimento di schede-259: save-194, playMatch, pilota seedato, velocita' 4, GLB spento, ?cpmtest=1, nomi diversi
   (= semi diversi), la scheda sceglie l'opzione i%3, timer di scadenza corto (1,5 s). Ogni 500 ms: fase, minuto, punteggio, scheda a schermo.
   Registra: schede (minuto, fatto, scarto), scelte (il dato del motore prima/dopo), racconti (fatti del motore prima/dopo), highlight dell'eroe
   (minuto d'ingresso in hl_intro), andamento del punteggio minuto per minuto, tabellino finale, e quante volte la scheda e' a schermo
   fuori da `playing` (PO-260: sopra un highlight o la cerimonia).
   Uso: CPM_PARTITE=20 CPM_PAR=4 node misura-226.mjs  → out/misura-226/misura-<etichetta>.json (CPM_ETICHETTA, default «giro44») */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_PARTITE || 20), PAR = +(process.env.CPM_PAR || 4), TETTO = +(process.env.CPM_TETTO_MS || 480000), OFF = +(process.env.CPM_DA || 0);
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'out', 'misura-226'); fs.mkdirSync(OUT, { recursive: true });
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const NOMI = ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Galli', 'Conti', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Costa', 'Fontana', 'Moretti', 'Barbieri', 'Lombardi', 'Rinaldi', 'Caruso', 'Ferrara', 'Serra', 'Fabbri', 'Villa', 'Mancini', 'Longo'];
const ROSSO = process.env.CPM_ROSSI || '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function partita(i) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = 'Prova ' + NOMI[i % NOMI.length] + ' ' + i;
  await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_SCMS681 = 1500; window.__CPM_INT226_IDX = o.idx;
    for (const k of (o.rossi || '').split(',').filter(Boolean)) window[k] = 1;
    localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save, idx: i % 3, rossi: ROSSO });
  const out = { i, nome: save.player.name, finita: false, andamento: {}, hl: [], fuori: [], aSchermo: 0 };
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
    await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
    await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2590 + i * 37);
    const t1 = Date.now(); let phP = null;
    while (Date.now() - t1 < TETTO) { await sleep(500);
      const d = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), ck: window.__CPM_CLOCK && window.__CPM_CLOCK(), sc: window.__CPM_SCORE && window.__CPM_SCORE(),
        pop: !!document.querySelector('[data-cpm="pop919"]') }));
      if (d.sc && d.ck != null) out.andamento[d.ck] = (d.sc.home | 0) - (d.sc.away | 0);
      if (d.ph === 'hl_intro' && phP !== 'hl_intro') out.hl.push(d.ck);
      if (d.pop) { out.aSchermo++; if (d.ph !== 'playing') out.fuori.push(d.ph + '@' + d.ck); }
      phP = d.ph;
      if (d.ph === 'ended') { out.finita = true; break; }
      if (d.ph === 'ceremony') { out.finita = true; for (let k = 0; k < 8; k++) { await sleep(500); const p = await page.evaluate(() => !!document.querySelector('[data-cpm="pop919"]')); if (p) out.fuori.push('ceremony'); } break; } }
    await sleep(800);
    Object.assign(out, await page.evaluate(() => ({ score: window.__CPM_SCORE && window.__CPM_SCORE(),
      tab: (() => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); return M && M.tabellino ? M.tabellino() : null; } catch (e) { return null; } })(),
      s259: window.__CPM_S259 || { schede: [], scelte: [], racconti: [] }, intx: window.__CPM_INTX669 || [] })));
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
const res = new Array(N); let next = 0;
const lav = async () => { while (next < N) { const k = next++; const p = res[k] = await partita(OFF + k);
  const S = p.s259 || {};
  console.log(`p${OFF + k} ${p.finita ? 'finita' : 'NON FINITA'} ${JSON.stringify(p.score)} hl=${p.hl.length} schede=${(S.schede || []).length} [${(S.schede || []).map(s => s.min + "'" + s.fatto + '(' + s.diff + ')').join(' ')}] scelte=${(S.scelte || []).length} racconti=${(S.racconti || []).length} fuori=${p.fuori.length}${p.errori.length ? ' ERR ' + p.errori[0] : ''}${p.errore ? ' ERRORE ' + p.errore : ''}`); } };
await Promise.all(Array.from({ length: Math.min(PAR, N) }, lav));
await b.close(); srv.close();
fs.writeFileSync(path.join(OUT, 'misura-' + (process.env.CPM_ETICHETTA || 'giro44') + '.json'), JSON.stringify(res, null, 1));
console.log('scritto ' + path.join(OUT, 'misura-' + (process.env.CPM_ETICHETTA || 'giro44') + '.json'));
