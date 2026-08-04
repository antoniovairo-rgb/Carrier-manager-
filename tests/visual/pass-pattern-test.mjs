/* [7.319.0] GUARDIANO PERMANENTE — DUE PROPRIETÀ DEL PIAZZATO E DEL PASSAGGIO

   (A) collaudo PO «azione scarica e ricevi sul fondo, l'azione è disegnata male, il pallone fa dei giri
       strani!». Il pattern del passaggio si deduceva SOLO dal testo dell'azione e la parola «scarico»
       bastava a farlo diventare SWITCH (cambio di gioco diagonale) — ma «Scarico e RICEVI sul fondo» è un
       UNO-DUE, e la situation lo DICHIARA. In più il compagno largo veniva scelto senza chiedere che fosse
       almeno alla stessa altezza di chi passa, quindi la diagonale poteva finire ALLE SPALLE.
       Misurato su gi185 prima del fix: percorso totale 63.3 unità con 10.3 di arretramento cumulato.
       Dopo: 26.2 e 0.8.

   (B) collaudo PO «sulle punizioni e rigori ci deve essere la rincorsa, non possono tirare da fermo!».
       Su ENTRAMBI i piazzati il battitore arretra ~3.2 unità e corre sul pallone, arrivandoci quando la
       gamba colpisce. ⚠️ Nota di metodo: nel 7.319 la punizione era stata esclusa perché il gesto sembrava
       già avviato durante l'attesa — misura SPORCA, la sonda riusava la stessa pagina fra una situation e
       l'altra e la punizione ereditava il gesto del rigore provato prima. Per questo ogni scenario qui
       parte da PAGINA NUOVA.

     node pass-pattern-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

/* [7.322.0] soglia 3.0 → 5.0, e il motivo va detto perche' allentare un guardiano e' sempre sospetto:
   dal 7.321 l'uno-due ha la RESTITUZIONE, e un muro che torna al passatore E' movimento all'indietro del
   pallone — legittimo, anzi e' il punto della giocata. Le cifre: il difetto originale («il pallone fa dei
   giri strani») misurava 10.3u di arretramento su un percorso di 63.3; col solo fix 7.319 era sceso a 0.8;
   oggi la sponda ne costa 3.2 su un percorso di 16.2. Il tetto a 5 lascia un fattore 2 di margine rispetto
   al difetto vero, quindi il guardiano continua a intercettarlo. */
const BACK_MAX = 5.0;
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
let page = await b.newPage();
await page.setViewportSize({ width: 900, height: 760 });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 160)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port); await sleep(900);

let fails = 0;
const say = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? '✅' : '❌'} ${msg}`); };

/* A1 — nessuna azione di passaggio contraddice l'intento dichiarato */
const P = await page.evaluate(() => {
  const S = window.__CPM_SITS || [], out = [], ATTESO = { through: 'THROUGH_BALL', switch: 'SWITCH', onetwo: 'COMBINATION' };
  for (let g = 0; g < S.length; g++) {
    const s = S[g]; if (!s) continue;
    (s.actions || []).forEach((a, k) => {
      let hl = null; try { hl = window.deriveHL(s, a); } catch (e) { }
      if (!hl || hl.type !== 'pass') return;
      const att = ATTESO[s.intent];
      if (att && hl.pattern !== att) out.push({ g, k, it: s.intent, pat: hl.pattern, att, l: a.label });
    });
  }
  return out;
});
say(P.length === 0, `nessuna azione di passaggio contraddice l'intento dichiarato (conflitti: ${P.length})`);
P.slice(0, 6).forEach(o => console.log(`   ❌ gi${o.g} k${o.k} it=${o.it} → ${o.pat} invece di ${o.att} · «${o.l}»`));

/* A2 — sulla scena vera la consegna dell'uno-due non torna indietro */
const GI = await page.evaluate(() => { const S = window.__CPM_SITS || []; for (let g = 0; g < S.length; g++) if (S[g] && /Uno-due sull'esterno/.test(S[g].text || '')) return g; return -1; });
if (GI < 0) { console.log('❌ situation di riferimento non trovata'); fails++; }
else {
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), GI); await sleep(1100);
  await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(1100);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  let prev = null, back = 0, tot = 0;
  for (let k = 0; k < 14; k++) {
    await sleep(420);
    const s = await page.evaluate(() => { try { const st = window.__CPM_STATE(); return { x: st.ball.x, y: st.ball.y }; } catch (e) { return null; } });
    if (!s) continue;
    if (prev) { tot += Math.hypot(s.x - prev.x, s.y - prev.y); if (s.x < prev.x) back += prev.x - s.x; }
    prev = s;
  }
  say(back <= BACK_MAX, `gi${GI} «Uno-due sull'esterno» · arretramento cumulato ${back.toFixed(1)}u (max ${BACK_MAX}) · percorso ${tot.toFixed(1)}u`);
}

/* B — la rincorsa dei piazzati: arretra prima, arriva sul pallone al colpo */
const SP = await page.evaluate(() => { const S = window.__CPM_SITS || [], o = {}; for (let g = 0; g < S.length; g++) { const s = S[g]; if (!s) continue; let hl = null; try { hl = window.deriveHL(s, (s.actions || [])[0]); } catch (e) { } if (hl && (hl.type === 'penalty' || hl.type === 'freekick') && o[hl.type] == null) o[hl.type] = g; } return o; });
if (!Object.keys(SP).length) { console.log('❌ nessun piazzato nel pool'); fails++; }
for (const [tipo, GP] of Object.entries(SP)) {
  /* ⚠️ PAGINA NUOVA: dopo aver risolto l'highlight del punto A la macchina resta in hl_result e un secondo
     `__CPM_RESOLVE` non fa partire il gesto — misurato (l'arretramento restava a 3.18 e il test falliva
     senza che ci fosse alcun difetto nel gioco). Ogni scenario parte pulito. */
  await page.close();
  page = await b.newPage(); await page.setViewportSize({ width: 900, height: 760 });
  await installCdnRoutes(page); page.on('pageerror', e => errs.push(e.message.slice(0, 160)));
  await page.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(page, port); await sleep(900);
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), GP); await sleep(900);
  await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(1500);
  const attesa = await page.evaluate(() => (window.__CPM_RUNUP || {}).off);
  say(attesa >= 2.6, `${tipo} (gi${GP}) · in attesa il battitore è arretrato di ${attesa}u dal pallone (atteso ~3.2)`);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  /* si misura il MINIMO raggiunto: la rincorsa e' riuscita quando il battitore ARRIVA sul pallone, e il
     valore finale non serve (a gesto esaurito il blocco si disattiva e l'ultimo campione resta appeso). */
  let minimo = attesa;
  for (let k = 0; k < 16; k++) { await sleep(230); const o = await page.evaluate(() => (window.__CPM_RUNUP || {}).off); if (o != null && o < minimo) minimo = o; }
  say(minimo <= 0.3, `${tipo} (gi${GP}) · durante la battuta la rincorsa si consuma fino a ${minimo}u (arriva sul pallone)`);
}

if (errs.length) { console.log('❌ pageerror:', errs.slice(0, 3).join(' | ')); fails++; }
console.log(fails ? `\n❌ FAIL — ${fails}` : `\n✅ PASS — il dato comanda sul testo, la palla non torna indietro, i piazzati hanno la rincorsa`);
await b.close(); srv.close();
process.exit(fails ? 2 : 0);
