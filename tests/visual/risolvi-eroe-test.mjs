/* [7.999.3] GUARDIANO DEL PASSO 3: GLI ESITI DELL'EROE LI DECIDE E LI CONTA IL MOTORE.
   A (node, motore da solo): una scena difensiva fallita con goal_against scrive tiro e gol dell'avversario nel tabellino.
   B (browser, partita vera): rigore e punizione dell'eroe sono decisi dal dado del motore e finiscono nel suo tabellino,
      cosi' a fine scena tabellone e tabellino del motore coincidono.
   CPM_ROSSO=1 → __CPM_NO_RISOLVI: il gol subito non entra nel motore e il piazzato torna al dado proprio; deve andare ROSSO. */
import '../../prototipo/partita-vera/motore-v2.js'; import '../../prototipo/partita-vera/partita.js';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
if (ROSSO) globalThis.window = { __CPM_NO_RISOLVI: 1 };
const fails = [];

/* A — motore da solo */
{
  const P = globalThis.creaPartita({ registra: false, v2: true, seed: 4242, casa: { sigla: 'CAS', forza: 70 }, ospite: { sigla: 'OSP', forza: 70 }, eroeLato: 'home', eroe: { nome: 'EROE', ovr: 74 } });
  for (let k = 0; k < 60; k++) P.passo();
  const M = P.motore; const t0 = M.tabellino(); const a0 = t0.away.gol, s0 = t0.away.tiri;
  M.risolviEroe.eventi('goal_against', { rew: 'save', ok: false, cast: {} });
  const t1 = M.tabellino();
  const ok = t1.away.gol === a0 + 1 && t1.away.tiri === s0 + 1;
  console.log(`A · gol subito in scena: gol avversario ${a0} → ${t1.away.gol}, tiri ${s0} → ${t1.away.tiri}`);
  if (!ok) fails.push('A: il gol subito in una scena difensiva non entra nel tabellino del motore');
}
if (ROSSO) delete globalThis.window;

/* B — piazzato dell'eroe nella partita vera (motore gia' vivo) */
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let campioni = 0, allineati = 0, dalMotore = 0;
try {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window.__CPM_NO_RISOLVI = 1; }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Piazzato3' });
  /* il motore nasce nel gioco fluido: si lascia scorrere qualche minuto prima di forzare le scene */
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 77, policy: 'seeded', tickMs: 300 }));
  for (let k = 0; k < 40; k++) { await sleep(500); if (await page.evaluate(() => !!(window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ()))) break; }
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false));
  const gis = await page.evaluate(() => { const out = []; const S = window.__CPM_SITS || [];
    for (let i = 0; i < S.length && out.length < 10; i++) { const it = window.deriveIntent ? window.deriveIntent(S[i]) : null; if (it === 'penalty' || it === 'freekick') out.push(i); } return out; });
  for (const gi of gis) {
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(900);
    const prima = await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); return M ? { tab: M.tabellino().home.gol, n: (window.__CPM_SP3 || []).length, sp: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal' && e.src === 'setpiece').length } : null; });
    const cliccato = await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(x => /incrocio|potenza|angolo|cucchiaio|barriera|piazzat|curva|rasoterra|forte|preciso/i.test(x.textContent || ''));
      if (!bs.length) return false; bs[0].click(); return true; });
    if (!cliccato || !prima) continue;
    await sleep(2500);
    const r = await page.evaluate(() => ({ tab: window.__CPM_MOTORE_OBJ().tabellino().home.gol, out: (window.__CPM_SP3 || []).slice(-1)[0] || null, n: (window.__CPM_SP3 || []).length, sp: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal' && e.src === 'setpiece').length }));
    const deciso = r.n > prima.n, golSp = r.sp - prima.sp, golTab = r.tab - prima.tab;
    /* un tiro da piazzato si riconosce dal registro del motore (verde) o dal gol da piazzato nel libro mastro (anche col rosso);
       un bottone di consegna (cross in area) passa da un'altra strada e non conta */
    if (!deciso && golSp === 0) { console.log(`B · gi${gi}: non era un tiro da piazzato (consegna), saltato`); continue; }
    campioni++; if (deciso) dalMotore++;
    const golScena = deciso ? (r.out.dopo === 'goal' ? 1 : 0) : golSp;
    if (golTab === golScena) allineati++;
    console.log(`B · gi${gi}: ${deciso ? 'p=' + r.out.p + ' ' : ''}esito ${deciso ? r.out.prima + '→' + r.out.dopo : (golSp ? 'gol col dado proprio' : '?')} · gol nel motore +${golTab}`);
  }
  await page.close();
} catch (e) { fails.push('B: ' + String(e.message).slice(0, 120)); }
await b.close(); srv.close();
console.log(`B · piazzati ${campioni} · decisi dal motore ${dalMotore} · motore allineato alla scena ${allineati}`);
if (campioni < 2) fails.push(`B: solo ${campioni} piazzati osservati, misura non fatta`);
else if (dalMotore < campioni || allineati < campioni) fails.push(`B: piazzati non decisi o non contati dal motore (${dalMotore}/${campioni} decisi, ${allineati}/${campioni} allineati)`);
if (ROSSO) { const rossoOk = fails.some(f => f.startsWith('A:')) && fails.some(f => f.startsWith('B:'));
  console.log(rossoOk ? '✅ ROSSO come atteso: senza il Passo 3 il motore non conta gol subiti in scena e piazzati' : '❌ il rosso non riproduce il vecchio comportamento\n  ' + fails.join('\n  ')); process.exit(rossoOk ? 0 : 1); }
console.log(fails.length ? '❌ FAIL risolvi-eroe\n  ' + fails.join('\n  ') : '✅ PASS risolvi-eroe'); process.exit(fails.length ? 1 : 0);
