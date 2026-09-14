#!/usr/bin/env node
/* [7.361.0] GUARDIANO «IL TABELLONE NON MENTE» — nato da una nota PO (#101 «esito intercept ma la palla
   finisce IN RETE») che la misura NON ha confermato, e resta lo stesso perche' l'invariante e' giusto:
   cio' che l'esito dichiara e dove il pallone finisce davvero devono coincidere.

   La prima passata su tutte le 191 scene x 2 esiti (373 osservazioni) ha dato ZERO incoerenze vere. Le 14
   che aveva segnalato erano tutte del classificatore, e i due errori valgono piu' del risultato:
     · «in rete» non e' x>96. 96 (AWAY_GOAL_X) e' il piano della RETE INTERNA; la linea dei pali sta a
       GOAL_LINE_X=48,6 mondo = 98,6 di gioco. Un pallone a 97 e' DAVANTI alla linea.
     · «gol dichiarato» non e' solo `in_net`. Le varianti legittime sono `in_net_high` e `cross_goal` (e
       `onetwo_back`, che rimanda l'esito vero e quindi non si giudica). Trattando solo `in_net` come gol,
       undici reti regolari risultavano «rete senza gol».
   Il campione e' ridotto (la passata completa costa 40 minuti): copre le scene che avevano prodotto un
   verdetto piu' un ventaglio.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node scoreboard-truth-test.mjs                          */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port); await sleep(900);

const GOL = /^(in_net|in_net_high|cross_goal)$/;          /* dichiara una RETE */
const SOSPESO = /^(onetwo_back|assist_recv|assist_shot)$/; /* rimanda l'esito ad altri: non si giudica */
const GIS = [1, 10, 13, 41, 49, 68, 70, 88, 96, 100, 167, 173, 180, 186, 0, 5, 44, 61, 73, 151, 160, 175];
let visti = 0;

/* una singola osservazione non basta su un esito a DUE TEMPI. `cross_goal` significa «il cross arriva e un
   compagno conclude»: la conclusione dipende da dove il compagno si trova, che deriva fra un run e l'altro
   (le posizioni off-ball sono fuori dalla firma golden proprio per questo). Misurato: gi96 e gi100 hanno
   dato 99,0 e 98,8 in una passata e 98,3 e 89,9 in quella dopo. Un guardiano che boccia sulla prima
   osservazione segnala VARIANZA, non difetti — quindi ogni verdetto negativo si ripete con una finestra
   piu' lunga, e vale solo se si conferma. */
async function osserva(gi, ok, attesa) {
  await page.evaluate(g => { window.__CPM_DISPATCH = null; window.__CPM_FORCE_SIT(g, true); }, gi);
  await sleep(520);
  await page.evaluate(o => {
    window.__BP = { rete: false, maxX: -99, n: 0 };
    const tick = () => { try { const b = window.__CPM_STATE().ball; if (b) { if (b.x > window.__BP.maxX) window.__BP.maxX = b.x; if (b.x > 98.6 && Math.abs(b.y - 50) < 5.4) window.__BP.rete = true; } } catch (e) {} if (++window.__BP.n < 900) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    window.__CPM_FORCE_OUTCOME = o ? 'success' : 'fail'; try { window.__CPM_RESOLVE(0); } catch (e) {}
  }, ok);
  await sleep(attesa);
  return await page.evaluate(() => ({ bp: window.__BP, d: window.__CPM_DISPATCH }));
}

for (const gi of GIS) {
  for (const ok of [true, false]) {
    let r = await osserva(gi, ok, 4600);
    if (!r.d) continue;
    visti++;
    let post = r.d.post || '';
    if (SOSPESO.test(post)) continue;
    let golDetto = GOL.test(post), rete = r.bp.rete;
    if (golDetto !== rete) {                       /* verdetto negativo: si ripete, con piu' tempo */
      const r2 = await osserva(gi, ok, 7200);
      if (!r2.d) continue;
      post = r2.d.post || ''; if (SOSPESO.test(post)) continue;
      golDetto = GOL.test(post); rete = r2.bp.rete;
      if (golDetto === rete) { console.log(`  gi${gi} ok=${ok}: primo verdetto non confermato alla ripetizione (esito a due tempi) — non e' un difetto`); continue; }
      r = r2;
    }
    if (golDetto && !rete) issues.push(`gi${gi} ok=${ok}: l'esito dichiara RETE (${post}) ma il pallone si e' fermato a ${r.bp.maxX.toFixed(1)}, la linea sta a 98,6 — confermato su due osservazioni`);
    if (!golDetto && rete) issues.push(`gi${gi} ok=${ok}: il pallone e' entrato in RETE (${r.bp.maxX.toFixed(1)}) ma l'esito dice «${post || 'niente'}» — confermato su due osservazioni`);
  }
}
console.log(`osservazioni ${visti}/${GIS.length * 2}`);
/* un guardiano che non osserva niente non e' verde, e' cieco */
if (visti < 24) issues.push(`solo ${visti} osservazioni: la misura non e' stata fatta (attesa piu' corta dell'arco?)`);
await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ TABELLONE OK — l\'esito dichiarato e il punto in cui finisce il pallone coincidono');
