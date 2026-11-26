#!/usr/bin/env node
/* [giro 373 · PO-462 + PO-463] GUARDIANO difetti-373. Tre parti, sul gioco vero (?cpmtest=1, salvataggio S12):
   A (PO-462) INTERVISTA SU PC: con la domanda piu' lunga del catalogo (IV_FATTI183), a 1366x768, 1366x657 (lo stesso PC con la
     barra del browser), 1280x720 e 1180x820 tutte e tre le risposte stanno nella finestra e nello schermo SENZA scorrere; telefono
     390x844 e tablet 820x1180: tre su tre come prima e la finestra nello STESSO punto del braccio rosso (nessun peggioramento).
   B1 (PO-463) SFIDA AL RITIRO: a 34 anni, da pro, con partite giocate e l'addio annunciato, il passaggio di stagione porta al ritiro
     e «Sempreverde» risulta COMPLETATA; una sfida non riuscita (Bomber Puro, 3 gol) al ritiro risulta FALLITA.
   B2 (PO-463) COPPA DELLE NAZIONI: la finale giocata fino al fischio chiude la coppa con l'esito anche nella coda
     (qualified = true, trophyWon booleano e uguale a worldMemory).
   «Non giudicato» = rosso. CPM_ROSSO373=1 accende __CPM_NO_G373A e __CPM_NO_G373B: ogni parte DEVE vedere il difetto (uscita 1);
   se una parte non lo vede l'uscita e' 2. Uso: node difetti-373.mjs ; CPM_ROSSO373=1 node difetti-373.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { misuraIntervista } from './misura-373.mjs';
const ROSSO = process.env.CPM_ROSSO373 === '1';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const esiti = []; const metti = (parte, giudicato, verde, msg) => { esiti.push({ parte, giudicato, verde, msg }); console.log(`${parte}: ${!giudicato ? 'NON GIUDICATO' : verde ? 'verde' : 'ROSSO'} — ${msg}`); };

/* ---------- A ---------- */
const PC = [[1366, 768, 'pc'], [1366, 657, 'pc-browser'], [1280, 720, 'pc-720'], [1180, 820, 'tablet-orizz']];
const FERMI = [[390, 844, 'telefono'], [820, 1180, 'tablet']];
for (const v of PC) {
  const m = await misuraIntervista(b, port, v, ROSSO, false);
  if (m.manca || m.risposte !== 3) { metti('A ' + v[2], false, false, 'intervista non aperta o risposte ≠ 3 ' + JSON.stringify(m)); continue; }
  metti('A ' + v[2], true, m.visibili === 3 && !m.scorre, `risposte visibili ${m.visibili}/3 · contenuto ${m.contenuto} in ${m.visibile} · finestra ${m.pannello}`);
}
for (const v of FERMI) {
  const m = await misuraIntervista(b, port, v, ROSSO, false), r = await misuraIntervista(b, port, v, true, false);
  if (m.manca || r.manca || m.risposte !== 3) { metti('A ' + v[2], false, false, 'intervista non aperta ' + JSON.stringify(m)); continue; }
  const uguale = m.pannello[0] === r.pannello[0] && m.pannello[1] === r.pannello[1];
  metti('A ' + v[2] + ' (non peggiora)', true, m.visibili === 3 && uguale, `visibili ${m.visibili}/3 · finestra ${m.pannello} (rosso ${r.pannello})`);
}

/* ---------- B ---------- */
async function apri(viewport) {
  const ctx = await b.newContext({ viewport }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G373B = 1; localStorage.setItem('cpm-match-speed', '2');
    localStorage.setItem('cpm-v3', JSON.stringify(s)); localStorage.setItem('cpm-active', 'cpm-v3'); }, [save, ROSSO]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {}); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  return { ctx, page };
}
async function ritiro(sfida, extra) {
  const { ctx, page } = await apri({ width: 412, height: 915 });
  const r = await page.evaluate(async ([sfida, extra]) => {
    const C = window.__CPM_CAREER; if (!C) return { err: 'nessun __CPM_CAREER' }; const s = C.snapshot();
    C.patch({ age: 34, proStatus: 'pro', matches: 22, challenge: { id: sfida }, retireAnnounced: s.season || 1, retired: false, ...extra });
    await new Promise(r => setTimeout(r, 800));
    const ok = C.startNewSeason(); await new Promise(r => setTimeout(r, 1500));
    const d = C.snapshot(); return { ok, retired: !!d.retired, challenge: d.challenge, sfida373: window.__CPM_SFIDA373 || null };
  }, [sfida, extra]);
  await ctx.close(); return r;
}
const r1 = await ritiro('sempreverde', {});
if (!r1.retired) metti('B1 Sempreverde', false, false, 'il ritiro non e\' avvenuto ' + JSON.stringify(r1));
else metti('B1 Sempreverde', true, !!(r1.challenge && r1.challenge.completed), 'sfida al ritiro ' + JSON.stringify(r1.challenge));
const r2 = await ritiro('bomber', { goals: 3 });
if (!r2.retired) metti('B1 Bomber (non riuscita)', false, false, 'il ritiro non e\' avvenuto ' + JSON.stringify(r2));
else metti('B1 Bomber (non riuscita)', true, !!(r2.challenge && r2.challenge.failed && !r2.challenge.completed), 'sfida al ritiro ' + JSON.stringify(r2.challenge));

{
  const { ctx, page } = await apri({ width: 1280, height: 900 });
  await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); const o = ['Francia', 'Portogallo', 'Olanda', 'Belgio'].filter(n => n !== s.nation).slice(0, 4);
    window.__CPM_CAREER.patch({ nationalCaps: Math.max(2, s.nationalCaps | 0), nationsCupQueue: { active: true, opponents: o, matchIdx: 3, pts: 7, isFinal: true, done: false, season: s.season,
      matches: [{ opp: o[0], won: true, drew: false, homeScore: 2, awayScore: 0 }, { opp: o[1], won: true, drew: false, homeScore: 1, awayScore: 0 }, { opp: o[2], won: false, drew: true, homeScore: 1, awayScore: 1 }] } }); });
  await sleep(1500);
  const pm = await page.evaluate(() => { try { return window.__CPM_CAREER.apriNC243(); } catch (e) { return 'err ' + e.message; } });
  for (let k = 0; k < 14; k++) { const ph0 = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph0 === 'playing') break;
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null);
      const x = bs.find(b => /Diplomatico|Siamo pronti|Continua|Chiudi|Prosegui|Avanti|Salta e gioca|Salta formazioni e ingresso/i.test(b.textContent || '') && !/Chiudi la stagione|Vivi la Settimana/i.test(b.textContent || '')); if (x) x.click(); });
    await sleep(900); }
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 3731, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let ph; while (Date.now() - t0 < 400000) { ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph === 'ended' || ph === 'ceremony') break; await sleep(800); }
  let q = null, mem = null;
  for (let k = 0; k < 40; k++) { const d = await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); return { q: s.nationsCupQueue, mem: (s.worldMemory || []).filter(m => m && m.type === 'nations_cup' && m.season === s.season).pop() || null }; });
    q = d.q; mem = d.mem; if (q && q.done) break; await page.keyboard.press('Enter').catch(() => {}); await sleep(700); }
  await ctx.close();
  if (pm !== true || !(q && q.done) || !mem) metti('B2 Coppa delle Nazioni', false, false, `coppa non chiusa (apertura ${JSON.stringify(pm)}, fase ${ph}, coda ${JSON.stringify(q && { done: q.done, matchIdx: q.matchIdx })}, memoria ${!!mem})`);
  else metti('B2 Coppa delle Nazioni', true, q.qualified === true && typeof q.trophyWon === 'boolean' && q.trophyWon === !!mem.won, `coda qualified=${q.qualified} trophyWon=${q.trophyWon} · memoria won=${mem.won}`);
}
await b.close(); srv.close();

const nonGiud = esiti.filter(e => !e.giudicato), rossi = esiti.filter(e => e.giudicato && !e.verde);
console.log(`\nBRACCIO ${ROSSO ? 'ROSSO' : 'VERDE'}: ${esiti.length} parti · ${esiti.length - rossi.length - nonGiud.length} verdi · ${rossi.length} rosse · ${nonGiud.length} non giudicate`);
if (!ROSSO) { if (rossi.length || nonGiud.length) { console.log('ESITO: ROSSO'); process.exit(1); } console.log('ESITO: VERDE'); process.exit(0); }
/* braccio rosso: ogni parte che il difetto tocca deve vederlo (le viste che non peggiorano restano uguali per costruzione) */
const devonoVedere = esiti.filter(e => !/non peggiora/.test(e.parte));
const cieche = devonoVedere.filter(e => !e.giudicato || e.verde);
if (cieche.length) { console.log('ESITO: il rosso NON si vede in ' + cieche.map(e => e.parte).join(', ')); process.exit(2); }
console.log('ESITO: ROSSO (atteso: il difetto si vede in tutte le parti)'); process.exit(1);
