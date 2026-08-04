/* L'UNO-DUE VERO — il pallone deve TORNARE all'eroe.

   L'etichetta «dai e vai / scarico e ricevi / parete» promette una sponda: l'eroe gioca corto,
   il compagno RESTITUISCE, l'eroe finalizza. Questa sonda misura se la restituzione esiste davvero:
   campiona la distanza palla↔eroe per tutta l'azione e cerca la firma dell'uno-due — la palla si
   allontana (primo appoggio) e poi TORNA a contatto dell'eroe.

   ⚠️ PAGINA NUOVA per ogni scenario: riusare la pagina lascia la macchina in hl_result e il secondo
   `__CPM_RESOLVE` non fa partire nulla (trappola gia' costata tre misure false in questa sessione).

     node onetwo-return-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const CASES = [
  { gi: 180, re: /Scarico e ricevi in area/, o2: true },
  { gi: 186, re: /Sponda corta e ricevi in area/, o2: true },
  { gi: 185, re: /Scarico e ricevi sul fondo/, o2: true },
  { gi: 121, re: /Dai e vai subito/, o2: true },
  { gi: 152, re: /Schema a tre/, o2: true },  // l'UNICA con premio GOL: torna e conclude l'eroe
  /* CONTROPROVA — senza questa il test sarebbe vacuo: un passaggio che NON e' un uno-due
     (filtrante dichiarato `through`) deve continuare in avanti, non tornare indietro. */
  { gi: 25, re: /./, through: true, o2: false },
];
const RITORNO_MAX = 3.2;   // "a contatto" dell'eroe
const APPOGGIO_MIN = 6;    // il primo appoggio deve allontanare davvero il pallone
const AVANZ_MIN = 3;       // [7.322] «dai e VAI»: l'eroe non resta fermo, si muove verso la porta

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = []; let fails = 0;
const say = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? '✅' : '❌'} ${msg}`); };

for (const c of CASES) {
  const page = await b.newPage(); await page.setViewportSize({ width: 900, height: 760 });
  await installCdnRoutes(page); page.on('pageerror', e => errs.push(e.message.slice(0, 160)));
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(page, port); await sleep(900);
  const info = await page.evaluate(([gi, src, thr]) => {
    const s = (window.__CPM_SITS || [])[gi]; if (!s) return null;
    const rx = new RegExp(src);
    /* per la controprova serve un'azione che deriva davvero in un PASSAGGIO (non un tiro) */
    let k = -1;
    (s.actions || []).forEach((a, i) => {
      if (k >= 0 || !rx.test(a.label || '')) return;
      if (!thr) { k = i; return; }
      try { const h = window.deriveHL(s, a); if (h.type === 'pass' && h.pattern !== 'COMBINATION') k = i; } catch (e) { }
    });
    if (k < 0) return null;
    let pat = null; try { pat = window.deriveHL(s, s.actions[k]).pattern; } catch (e) { }
    return { k, label: s.actions[k].label, rew: s.actions[k].rew, intent: s.intent, pat };
  }, [c.gi, c.re.source, !!c.through]);
  if (!info) { say(false, `gi${c.gi} — azione non trovata`); await page.close(); continue; }
  await page.evaluate(gi => window.__CPM_FORCE_SIT(gi, true), c.gi); await sleep(800);
  await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(600);
  await page.evaluate(k => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, info.k);

  const d = [], hx = [];
  for (let i = 0; i < 34; i++) {
    const v = await page.evaluate(() => { try { const s = window.__CPM_STATE(); return { d: +Math.hypot(s.ball.x - s.hero.x, s.ball.y - s.hero.y).toFixed(2), hx: s.hero.x }; } catch (e) { return null; } });
    if (v != null) { d.push(v.d); hx.push(v.hx); }
    await sleep(120);
  }
  /* la CORSA del «vai» (7.322): mentre la sponda torna, l'eroe deve avanzare verso la porta */
  const avanz = hx.length ? +(Math.max(...hx) - hx[0]).toFixed(1) : 0;
  const via = Math.max(...d), iPk = d.indexOf(via);
  const torna = iPk < d.length - 1 ? Math.min(...d.slice(iPk)) : via;
  const tornata = torna <= RITORNO_MAX;
  say(c.o2 ? (via >= APPOGGIO_MIN && tornata && avanz >= AVANZ_MIN) : !tornata,
    `gi${c.gi} [${info.intent}·${info.rew}·${info.pat}] "${info.label}" · ${c.o2 ? 'UNO-DUE' : 'CONTROPROVA (non deve tornare)'} · appoggio ${via.toFixed(1)}u → ritorno ${torna.toFixed(1)}u${c.o2 ? ` · il «vai» dell'eroe ${avanz}u (min ${AVANZ_MIN})` : ''}`);
  await page.close();
}

if (errs.length) { console.log('❌ pageerror:', errs.slice(0, 3).join(' | ')); fails++; }
console.log(fails ? `\n❌ FAIL — ${fails}` : `\n✅ PASS — l'uno-due si vede: la palla torna all'eroe`);
await b.close(); srv.close();
process.exit(fails ? 2 : 0);
