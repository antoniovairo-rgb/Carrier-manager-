/* [STRUMENTO — R6] IL PALLONE STA NEL QUADRO? Dal filmstrip: nella scena al 54' il pallone esce dal
   bordo e sparisce per ~2s mentre il piano e' vivo. Qui il giudizio a occhio diventa un numero:
   per ogni finestra di piano, frazione di campioni (250ms) con st.ball.onScreen falso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const ROSSO = process.env.CPM_ROSSO || '';
await page.addInitScript((r) => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window['__CPM_NO' + r] = true; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Iq' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const finestre = []; let cur = null;
for (let k = 0; k < 900; k++) {
  await sleep(250);
  const r = await page.evaluate(() => { try {
    const h = window.__CPM_HOLD && window.__CPM_HOLD();
    const st = window.__CPM_STATE && window.__CPM_STATE();
    const bl = st && st.ball;
    return { pg: !!(h && h.pg), on: !!(bl && bl.onScreen), c: st ? st.clock : null,
      ndc: bl && bl.ndc ? { x: +bl.ndc.x.toFixed(2), y: +bl.ndc.y.toFixed(2) } : null,
      bx: bl ? bl.x : null, by: bl ? bl.y : null, sal: !!window.__CPM_SAL689_ON };/* [v3] la finestra e' in regime saliente? separa «camera larga che non insegue» da «lerp lento della saliente» *//* [v2] da che bordo esce e dov'era il pallone: nomina lo scrittore prima del rimedio */
  } catch (_e) { return null; } });
  if (!r) continue;
  if (r.pg) { if (!cur) cur = { min: r.c, tot: 0, fuori: 0, casi: [] }; cur.tot++; cur.sal = (cur.sal||0) + (r.sal?1:0); if (!r.on) { cur.fuori++; cur.fuoriSal = (cur.fuoriSal||0) + (r.sal?1:0); if (cur.casi.length < 6 && r.ndc) cur.casi.push(`ndc(${r.ndc.x},${r.ndc.y})@gioco(${Math.round(r.bx)},${Math.round(r.by)})${r.sal?'S':'-'}`); } }
  else if (cur) { finestre.push(cur); cur = null; }
  if (r.c != null && r.c >= 89) break;
}
if (cur) finestre.push(cur);
await b.close(); srv.close();
console.log(`\n=== IL PALLONE NEL QUADRO (finestre di piano: ${finestre.length}) ===\n`);
for (const f of finestre) console.log(`  min ${f.min}: campioni ${f.tot} (saliente ${f.sal||0}) · FUORI ${f.fuori} (di cui in saliente ${f.fuoriSal||0})${f.casi && f.casi.length ? ' · ' + f.casi.join(' ') : ''}`);
const tot = finestre.reduce((a,f)=>a+f.tot,0), fu = finestre.reduce((a,f)=>a+f.fuori,0);
if (tot) console.log(`\n  totale: fuori ${fu}/${tot} (${Math.round(fu/tot*100)}%)\n`);
