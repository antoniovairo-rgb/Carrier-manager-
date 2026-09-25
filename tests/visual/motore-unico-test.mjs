/* [7.999.2] GUARDIANO DEL MOTORE UNICO NEL GIOCO (scelta PO: «ripartiamo dal gioco com'e', miglioriamo il brain»).
   Gioca N partite vere (autoplay seedato, nomi diversi = partite diverse) e misura:
   · gol a partita e loro origine (motore / highlight), allineati al tabellone;
   · le giocate dell'eroe negli highlight: xG del motore, qualita' della giocata, probabilita' usata;
   · che la vecchia via (microsim) non produca piu' gol.
   CPM_ROSSO=1 → __CPM_NO_V2: il gioco torna al microsim e il guardiano deve andare ROSSO. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const N = +(process.env.CPM_PARTITE || 4), ROSSO = process.env.CPM_ROSSO === '1', TETTO_MS = 300000;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const R = [];
for (let k = 0; k < N; k++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window.__CPM_NO_V2 = 1; }, ROSSO);
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Unico' + (k * 37 + 11) });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 5100 + k * 97);
    const t0 = Date.now(); while (Date.now() - t0 < TETTO_MS) { await sleep(500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
    const d = await page.evaluate(() => ({ ev: (window.__CPM_EV ? window.__CPM_EV() : []), score: (window.__CPM_SCORE ? window.__CPM_SCORE() : null), eroe: window.__CPM_V2EROE || [],
      tab: (window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ() ? window.__CPM_MOTORE_OBJ().tabellino() : null),
      /* il gol del microsim arriva al motore come RICHIESTA (chiedi.gol) e poi il motore lo segna: nel registro esce come «cronaca».
         Il segnale che separa i due mondi e' quindi nel motore: tick con una richiesta di gol pendente. Con v2 devono essere zero. */
      golReq: (window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ() ? (window.__CPM_MOTORE_OBJ()._S.conta.golReqTick | 0) : null),
      tat: (window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ() ? window.__CPM_MOTORE_OBJ().tattica : null) }));
    const gol = d.ev.filter(e => e.ev === 'goal');/* il registro scrive il tipo in `ev` (src/11 cpmEv) */
    const cr = d.ev.filter(e => e.ev === 'chronicle');/* quota di cronaca nata dal motore (mk = tipo di fatto del motore) contro righe pescate da tabella/libreria */
    R.push({ k, tat: d.tat, righe: [cr.filter(e => e.mk).length, cr.length], score: d.score, golReq: d.golReq, gol: gol.length, src: gol.reduce((a, e) => { const s = (e.d && e.d.src) || e.src || '?'; a[s] = (a[s] | 0) + 1; return a; }, {}), eroe: d.eroe,
      tiri: d.tab ? [d.tab.home.tiri, d.tab.away.tiri] : null, golMotore: d.tab ? [d.tab.home.gol, d.tab.away.gol] : null, xg: d.tab ? [d.tab.home.xg, d.tab.away.xg] : null });
  } catch (e) { R.push({ k, err: String(e.message).slice(0, 120) }); }
  await ctx.close();
}
await b.close(); srv.close();
for (const r of R) console.log(JSON.stringify({ ...r, eroe: r.eroe && r.eroe.map(x => `${x.rew}:xg${x.xg}·q${x.q}·p${x.p}(prima ${x.vecchio})`) }));
const ok = R.filter(r => r.score); const tot = ok.reduce((a, r) => a + (r.score.home | 0) + (r.score.away | 0), 0) / Math.max(1, ok.length);
const micro = ok.reduce((a, r) => a + ((r.golReq | 0) > 0 ? 1 : 0), 0);/* partite in cui il microsim ha chiesto gol al motore */ const giocate = ok.reduce((a, r) => a + (r.eroe ? r.eroe.length : 0), 0);
{ const rm = ok.reduce((a, r) => a + r.righe[0], 0), rt = ok.reduce((a, r) => a + r.righe[1], 0); console.log(`righe di cronaca nate dal motore: ${rm}/${rt} (${rt ? Math.round(100 * rm / rt) : 0}%)`); }
console.log(`gol a partita ${tot.toFixed(2)} · partite con gol chiesti dal microsim ${micro} · giocate dell'eroe decise dal motore ${giocate}`);
const fails = []; if (ok.length < Math.ceil(N / 2)) fails.push('troppe partite non finite');
const golReg = ok.reduce((a, r) => a + (r.gol | 0), 0), golTab = ok.reduce((a, r) => a + (r.score.home | 0) + (r.score.away | 0), 0);
if (golTab > 0 && golReg === 0) fails.push('il registro non vede nessun gol: guardiano cieco');
/* [7.999.5] la partita live riceve gli stili: l'avversario gioca con la sua persona NPC (almeno una manopola diversa da zero) */
if (!ROSSO && process.env.CPM_NO_TAT !== '1') for (const r of ok) { const a = r.tat && r.tat.away; if (!a || !Object.values(a).some(v => v !== 0)) fails.push(`partita ${r.k}: l'avversario non ha uno stile nel motore (${JSON.stringify(a)})`); }
/* [7.999.3 passo 3] a fine partita il tabellino del motore e il tabellone dicono lo stesso risultato */
for (const r of ok) if (r.golMotore && !ROSSO && (r.golMotore[0] !== (r.score.home | 0) || r.golMotore[1] !== (r.score.away | 0))) fails.push(`partita ${r.k}: tabellone ${r.score.home}-${r.score.away} ma motore ${r.golMotore[0]}-${r.golMotore[1]}`);
if (!ROSSO) { if (micro > 0) fails.push('il microsim decide ancora gol'); if (giocate === 0) fails.push('nessuna giocata dell\'eroe decisa dal motore'); if (tot > 4.5) fails.push(`gol a partita ${tot.toFixed(2)} oltre 4,5`); 
  /* scelta PO «Occasione da gol»: il tiro dell'eroe in un highlight vale una grande occasione, non l'xG nudo del punto */
  const pg = ok.flatMap(r => (r.eroe || []).filter(x => x.rew === 'goal').map(x => +x.p)).sort((a, b) => a - b);
  if (pg.length) { const med = pg[Math.floor(pg.length / 2)]; console.log(`probabilita' di gol dell'eroe: mediana ${med.toFixed(2)} su ${pg.length} tiri`); if (med < 0.2 || med > 0.55) fails.push(`mediana gol eroe ${med.toFixed(2)} fuori da 0,20-0,55`); } }
else { if (micro === 0 && giocate === 0) fails.push('(rosso atteso) — ok'); }
if (ROSSO) { const rossoOk = micro > 0 && giocate === 0; console.log(rossoOk ? '✅ ROSSO come atteso: col motore spento i gol tornano dal microsim' : '❌ il rosso non riproduce il vecchio comportamento'); process.exit(rossoOk ? 0 : 1); }
console.log(fails.length ? '❌ FAIL motore-unico\n  ' + fails.join('\n  ') : '✅ PASS motore-unico'); process.exit(fails.length ? 1 : 0);
