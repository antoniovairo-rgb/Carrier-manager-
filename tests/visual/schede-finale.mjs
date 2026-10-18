#!/usr/bin/env node
/* [giro 52, decisione PO 16/10 «Fatto del finale + rete»] GUARDIANO della scheda del PARI nel finale.
   Misurato (RAPPORTO-giro44): «pari nel finale» nasceva al 75' in 6 partite su 8 — il primo minuto ammesso, un orologio. Ora nasce da un
   FATTO del finale (tiro in porta, legno o tiro pericoloso di una delle due squadre, o occasione dell'eroe, dal 75', recente) e, se il
   fatto non arriva, dalla rete di sicurezza all'81' (INT259.finale, src/14).
   (A) regola pura, in node: pari al 75'-80' SENZA fatto → muta; con un fatto recente → scheda; dall'81' → rete. Rosso __CPM_NO_FIN252b:
       la scheda torna a nascere al 75' senza fatto (il guardiano deve riconoscerlo).
   (B) partite vere (CPM_PARTITE, default 4; 0 = solo A): ogni scheda del pari ha un fatto datato (finMin fra il 75' e tre minuti prima) o
       e' nata dalla rete (>= 81'). Percorso di misura-226: save-194, playMatch, pilota seedato, velocita' 4, GLB spento, ?cpmtest=1.
       CPM_ROSSO=1 gioca le stesse partite col rosso e pretende che almeno una scheda del pari nasca senza fatto prima dell'81'.
   Uscita 0 = verde. */
import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const s14 = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = s14.slice(s14.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
const carica = (W) => Function('decideExecution', 'window', code + '\nreturn {INT259};')(undefined, W).INT259;
const fail = [];

/* ---------- (A) regola pura ---------- */
{
  const base = { energia: 80, panchina: false, ingresso: 0, fatte: [], ultima: null, espNoi: 0, espLoro: 0, rigContro: 0 };
  const prova = (I, o) => I.scegli(Object.assign({}, base, o));
  const NO = [['pari al 75 senza fatto', { mn: 75, diff: 0 }], ['pari al 80 senza fatto', { mn: 80, diff: 0 }],
    ['pari al 79, fatto vecchio al 75', { mn: 79, diff: 0, finMin: 75, finK: 'loro' }], ['pari al 78, fatto prima del 75', { mn: 78, diff: 0, finMin: 74, finK: 'noi' }],
    ['1-0 al 77 con un tiro loro', { mn: 77, diff: 1, finMin: 77, finK: 'loro' }]];
  const SI = [['pari al 75 con tiro loro al 75', { mn: 75, diff: 0, finMin: 75, finK: 'loro' }], ['pari al 79 con occasione nostra al 77', { mn: 79, diff: 0, finMin: 77, finK: 'noi' }],
    ['pari al 81 senza fatto (rete)', { mn: 81, diff: 0 }], ['pari al 84 senza fatto (rete)', { mn: 84, diff: 0 }]];
  const V = carica({});
  const eNo = NO.filter(([, c]) => prova(V, c) === 'pari_finale'), eSi = SI.filter(([, c]) => prova(V, c) !== 'pari_finale');
  const tL = V.SCHEDE.pari_finale.txt({ mn: 76, finK: 'loro' }), tR = V.SCHEDE.pari_finale.txt({ mn: 81 });
  console.log(`(A) verde: ${NO.length - eNo.length}/${NO.length} pari senza fatto restano muti · ${SI.length - eSi.length}/${SI.length} con fatto o rete aprono la scheda`);
  console.log(`    testo col fatto: «${tL}» · testo della rete: «${tR}»`);
  if (eNo.length) fail.push('A: scheda del pari senza fatto: ' + eNo.map(x => x[0]).join(', '));
  if (eSi.length) fail.push('A: pari con fatto/rete muto: ' + eSi.map(x => x[0]).join(', '));
  if (tL === tR) fail.push('A: il testo non dice il fatto');
  const R = carica({ __CPM_NO_FIN252b: 1 }); const rAl75 = prova(R, { mn: 75, diff: 0 });
  console.log(`(A) rosso __CPM_NO_FIN252b: pari al 75 senza fatto → ${rAl75} ${rAl75 === 'pari_finale' ? '(riconosciuto: orologio)' : '(NON riconosciuto)'}`);
  if (rAl75 !== 'pari_finale') fail.push('A: rosso non riconosciuto');
}

/* ---------- (B) partite vere ---------- */
const N = process.env.CPM_PARTITE != null ? +process.env.CPM_PARTITE : 4;
if (N > 0) {
  const { startServer, launchBrowser, installCdnRoutes, sleep } = await import('./lib/harness.mjs');
  const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
  const NOMI = ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Galli', 'Conti', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Costa', 'Fontana', 'Moretti', 'Barbieri', 'Lombardi', 'Rinaldi', 'Caruso', 'Ferrara', 'Serra'];
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  async function partita(i, rossi) {
    const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
    const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = 'Prova ' + NOMI[i % NOMI.length] + ' ' + i;
    await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_SCMS681 = 1500; window.__CPM_INT226_IDX = o.idx;
      if (o.rossi) window.__CPM_NO_FIN252b = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save, idx: i % 3, rossi });
    const out = { i, finita: false, schede: [] };
    try {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
      await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
      await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      await page.evaluate(() => window.__CPM_CAREER.playMatch());
      await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
      await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2590 + i * 37);
      const t1 = Date.now();
      while (Date.now() - t1 < 480000) { await sleep(1000); const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (ph === 'ended' || ph === 'ceremony') { out.finita = true; break; } }
      out.schede = await page.evaluate(() => ((window.__CPM_S259 || {}).schede || []).map(s => ({ min: s.min, fatto: s.fatto, finK: s.finK, finMin: s.finMin })));
    } catch (e) { out.errore = String(e.message).slice(0, 160); }
    await page.close(); return out;
  }
  async function giro(rossi) {
    const res = new Array(N); let next = 0;
    const lav = async () => { while (next < N) { const k = next++; res[k] = await partita(k, rossi); } };
    await Promise.all(Array.from({ length: Math.min(+(process.env.CPM_PAR || 2), N) }, lav)); return res;
  }
  const giudica = (res, nome) => {
    const pari = res.flatMap(p => p.schede.filter(s => s.fatto === 'pari_finale').map(s => ({ ...s, p: p.i })));
    const senza = pari.filter(s => !(s.min >= 81 || (s.finMin != null && s.finMin >= 75 && s.min - s.finMin >= 0 && s.min - s.finMin <= 3)));
    console.log(`(B) ${nome}: partite finite ${res.filter(p => p.finita).length}/${res.length} · schede del pari ${pari.length} [${pari.map(s => 'p' + s.p + ' ' + s.min + "'" + (s.finK ? ' dopo ' + s.finK + ' ' + s.finMin + "'" : ' rete')).join(' · ')}] · senza fatto prima dell'81' ${senza.length}`);
    return { pari, senza, finite: res.filter(p => p.finita).length };
  };
  const V = giudica(await giro(false), 'verde');
  if (V.finite < N) fail.push('B: partite non finite');
  if (V.senza.length) fail.push('B: scheda del pari senza fatto: ' + V.senza.map(s => 'p' + s.p + ' ' + s.min + "'").join(', '));
  if (!V.pari.length) console.log('(B) ⚠️ nessuna scheda del pari in queste partite: B non ha giudicato niente (dichiarato, non rosso)');
  if (process.env.CPM_ROSSO) { const R = giudica(await giro(true), 'rosso'); if (!R.senza.length) fail.push('B: rosso non riconosciuto (nessuna scheda del pari senza fatto)'); }
  await b.close(); srv.close();
}
console.log(fail.length ? '❌ schede-finale ROSSO: ' + fail.join(' | ') : '✅ schede-finale verde');
process.exit(fail.length ? 1 : 0);
