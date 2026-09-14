/* [7.618.0 STRUMENTO] IL DRIBBLING FALLITO, FOTOGRAMMA PER FOTOGRAMMA.
   COLLAUDO PO (SIT #21 e #102, dispositivo, build 7.613-7.615): «nel dribbling il pallone e l'eroe
   si separano: gap >4u per ~3 s (max 14,2u)» — entrambe le volte con esito intercept (fallita).
   Il 7.613 ha curato i beat carry/dribble della TIMELINE, ma il dribbling e' fuori dal cancello
   della timeline (kinds shot/cross/header/pass/build): non passa di li'.
   IPOTESI DA VERIFICARE (non da assumere): sul fallito la palla va LEGITTIMAMENTE al difensore
   (poke 7.415, raccoglitore _pkCol415) — il difetto visivo sarebbe l'EROE che continua la sua corsa
   come se conducesse ancora. La sonda registra, per gi con scene dribble ed esito FORZATO intercept:
   posizione eroe, posizione palla, gap, e chi sta scrivendo la palla — per dire se il gap e' «palla
   persa vera» (palla dal difensore, eroe che rincorre a vuoto) o un altro scrittore.
   CPM_GI per la scena (default 21). NON e' un guardiano: misura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GI = Number(process.env.CPM_GI || 21);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_D618 = []; });
await openMatch(page, port, { skipLoadAll: true, name: 'Dr' });
await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [GI, true]);
await sleep(600);
await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_FORCE_KIND = 'intercepted'; window.__CPM_FORCE_OUTCOME = 'fail';
  window.__CPM_D618T = setInterval(() => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.hero || !st.ball) return;
    const A = window.__CPM_D618; if (A.length > 400) return;
    let nd = null; /* distanza del piu' vicino AVVERSARIO di campo dalla palla: e' il numero del raccoglitore */
    if (st.players) for (const p of st.players) { if (!p || p.team !== 'away' || p.gk) continue;
      const d = Math.hypot(p.x - st.ball.x, p.y - st.ball.y); if (nd == null || d < nd) nd = d; }
    A.push({ t: Math.round(performance.now()), ph: st.phase || null, hx: +st.hero.x.toFixed(1), hy: +st.hero.y.toFixed(1),
      bx: +st.ball.x.toFixed(1), by: +st.ball.y.toFixed(1), nd: nd != null ? +nd.toFixed(1) : null });
  } catch (_e) {} }, 80); });
await sleep(2500);
await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));
await sleep(4500);
await page.evaluate(() => clearInterval(window.__CPM_D618T));
const A = await page.evaluate(() => window.__CPM_D618 || []);
const kind = await page.evaluate(() => (window.__CPM_ARC && window.__CPM_ARC.ek) || null);
await b.close(); srv.close();

console.log(`\n=== DRIBBLING FALLITO gi${GI} (${A.length} campioni · kind esito: ${kind}) ===\n`);
if (A.length < 20) { console.log('  ⚠ pochi campioni: NON GIUDICABILE.\n'); process.exit(1); }
let over4 = 0, maxGap = 0, t0 = A[0].t;
for (const c of A) { const g = Math.hypot(c.bx - c.hx, c.by - c.hy); if (g > 4) over4++; if (g > maxGap) maxGap = g; }
console.log(`  gap eroe-palla >4u: ${over4}/${A.length} campioni (${(over4 * 0.08).toFixed(1)} s) · max ${maxGap.toFixed(1)}u`);
console.log(`\n  traccia (1 campione su 4): t(ms) fase · eroe · palla · gap`);
for (let i = 0; i < A.length; i += 4) { const c = A[i]; const g = Math.hypot(c.bx - c.hx, c.by - c.hy);
  console.log(`    ${String(c.t - t0).padStart(5)} ${String(c.ph || '?').padStart(9)} · eroe ${c.hx},${c.hy} · palla ${c.bx},${c.by} · gap ${g.toFixed(1)}${g > 4 ? ' ⚠' : ''} · avversario piu' vicino ${c.nd != null ? c.nd : '?'}u`); }
const last = A[A.length - 1];
console.log(`\n  A FINE SCENA: avversario piu' vicino alla palla a ${last.nd != null ? last.nd : '?'}u (prima del 7.618, misurato dall'audit: 8-10u — il raccoglitore arriva a 1,2u)`);
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
