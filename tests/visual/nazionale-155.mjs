#!/usr/bin/env node
/* [7.999.173 PO-155 «Svincolato, poi finestre + CT»] GUARDIANO DELLA NAZIONALE PER FINESTRE.
   Una stagione intera (S5, nessun torneo per nazionali in corso) sugli handler veri (`__CPM_CAREER.step`, Nazionale
   simulata con __CPM_SIM_NAT=1), due profili:
   A) titolare forte (Italia, OVR 88, contratto valido): il CT decide in OGNI sosta del calendario (finestra), le
      amichevoli cadono SOLO nelle soste, almeno 3 finestre valutate e almeno 2 presenze nella stagione.
   B) stesso profilo ma SVINCOLATO (contractExpired): zero valutazioni passate al cancello e zero presenze.
   Rossi: CPM_ROSSO=fin accende __CPM_NO_FIN155 (torna il dado settimanale: finestre valutate < 3 → A fallisce);
          CPM_ROSSO=sv accende __CPM_NO_SV155 (lo svincolato torna convocabile → B fallisce). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO || '';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
/* [giro 77, instabile 1 su 3] MISURATO: `__CPM_CAREER` si registra in un useEffect (src/18 ~1391), cioe' DOPO il commit; un passo
   dato prima che il render del passo precedente (e quello dell'effetto della finestra, che aggiunge l'amichevole) sia arrivato
   decide su una chiusura VECCHIA: «settimana 18 senza gara → avanza» mentre lo stato e' gia' alla 19 con l'amichevole, e
   l'aggiornamento funzionale salta la 19. L'amichevole resta «19?» per sempre e blocca le finestre 28 e 35 (pendente): 3 stagioni
   rosse su 4 con quattro stagioni in parallelo, 1 su 5 da sola. Il passo successivo parte solo quando il registro e' stato
   ri-registrato dopo il passo e resta fermo 250 ms (nessun render in coda). */
async function assesta(page) {
  await page.waitForFunction(() => window.__CPM_CAREER !== window.__CPM_C155, null, { timeout: 5000 }).catch(() => {});
  for (let i = 0; i < 40; i++) { const ok = await page.evaluate(() => { const C = window.__CPM_CAREER; const f = window.__CPM_C155b === C; window.__CPM_C155b = C; return f; }); if (ok) break; await sleep(250); }
}
async function stagione(svincolato) {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } }); await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  await page.addInitScript(c => {
    window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; window.__CPM_CALLUP = [];
    if (c.rosso === 'fin') window.__CPM_NO_FIN155 = true; if (c.rosso === 'sv') window.__CPM_NO_SV155 = true;
    const S = 5;
    const save = { phase: 'career', player: { name: 'Probe Finestre', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: S, week: 2, age: 26, ovr: 88, tutorialDone: true, nationalCaps: 12,
      campDone: true, presidentModalSeason: S, jerseyNumSeason: S, drawSeen: S, mercatoSeen: S, presentSeason: S, weekLived: false, seasonPledge: { season: S, tone: 'equilibrato' },
      club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 82, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
      stats: { 'velocità': 88, tecnica: 88, fisico: 86, 'mentalità': 87, tiro: 89, passaggio: 86, dribbling: 88, posizionamento: 87 },
      form: 82, morale: 80, fatigue: 10, coachTrust: 85, popularity: 75, goals: 0, assists: 0, matches: 0,
      contract: c.sv ? { duration: 0, wage: 0, expiresAtSeason: S - 1 } : { duration: 3, wage: 60000, expiresAtSeason: S + 3 }, contractExpired: !!c.sv } };
    localStorage.setItem('cpm-v3', JSON.stringify(save));
  }, { rosso: ROSSO, sv: svincolato });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1200);
  let iter = 0, last = null;
  while (iter++ < 200) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; window.__CPM_C155 = C; const res = C.step(); C.dismiss(); const s = C.snapshot(); return { res: String(res), season: s && s.season, week: s && s.week }; });
    last = r; if (r.res === 'seasonEnd' || r.season !== 5 || r.res.startsWith('error:')) break;
    if (r.res.startsWith('blocked:')) await page.evaluate(() => window.__CPM_CAREER.dismiss());
    await assesta(page);
  }
  const R = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3') || '{}'); const p = s.player || s;
    const lg = (p.calendar || []).filter(m => m && (!m.type || m.type === 'league') && m.week); const ws = new Set(lg.map(m => m.week));
    const a = Math.min(...ws), b = Math.max(...ws); const soste = []; for (let w = a + 1; w < b; w++) if (!ws.has(w)) soste.push(w);
    const nat = (p.calendar || []).filter(m => m.type === 'national'); const cu = window.__CPM_CALLUP || [];
    return { soste, amichevoli: nat.map(m => m.week + (m.played ? '' : '?') + (m.ctRole ? ':' + m.ctRole : '')), caps: (p.nationalCaps || 0) - 12,
      valut: cu.filter(x => x.s === 5).map(x => x.w + (x.fin ? 'F' : '') + (x.passa ? '+' : '-')), passate: cu.filter(x => x.s === 5 && x.passa).length,
      log: (p.log || []).filter(t => /CT/.test(t)).slice(0, 6) }; });
  R.ultimo = last; R.errori = errors.length; await page.close(); return R;
}
const [A, B] = await Promise.all([stagione(false), stagione(true)]);
await browser.close(); srv.close();
console.log('A titolare: ' + JSON.stringify(A)); console.log('B svincolato: ' + JSON.stringify(B));
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
const finA = A.valut.filter(v => /F/.test(v)).length;
ok(A.ultimo && (A.ultimo.res === 'seasonEnd' || A.ultimo.season !== 5), `A: stagione arrivata in fondo (${JSON.stringify(A.ultimo)})`);
ok(finA >= 3, `A: il CT decide in almeno 3 finestre (${finA} su ${A.soste.length} soste)`);
ok(A.amichevoli.length > 0 && A.amichevoli.every(x => A.soste.includes(parseInt(x, 10))), `A: amichevoli solo nelle soste (${A.amichevoli.join(',')} ⊂ ${A.soste.join(',')})`);
ok(A.caps >= 2, `A: almeno 2 presenze nella stagione (${A.caps})`);
ok(B.passate === 0 && B.caps === 0, `B: da svincolato nessuna convocazione (passate ${B.passate}, presenze ${B.caps})`);
ok(A.errori === 0 && B.errori === 0, `nessun errore di pagina (${A.errori}/${B.errori})`);
console.log(err.length ? `\nFALLITO${ROSSO ? ' (rosso ' + ROSSO + ': atteso)' : ''}: ${err.length}` : '\nVERDE');
process.exit(err.length ? 1 : 0);
