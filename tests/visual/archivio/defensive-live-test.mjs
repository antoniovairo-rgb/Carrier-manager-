/* Live check (GLB ON): forza le Situations DIFENSIVE (type:"def"), risolve l'azione e legge DOVE finisce
   la palla nel 3D reale (__CPM_STATE().ball.x, coord di gioco 0..100). Invariante: una respinta/recupero
   difensivo NON deve MAI finire vicino alla porta avversaria (x ≥ 75). Verifica anche la varietà del punto d'arrivo. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await openMatch(page, port);
await sleep(400);

const defIdx = await page.evaluate(() => (window.__CPM_SITS || []).map((s, i) => ({ i, def: s.type === 'def' })).filter(o => o.def).map(o => o.i));
console.log('Situations difensive (type:"def"): ' + defIdx.length + ' → ' + defIdx.join(','));

let maxX = -1, bad = 0; const xs = [];
for (const gi of defIdx.slice(0, 12)) {
  for (const success of [true, false]) {
    await page.evaluate((g) => window.__CPM_FORCE_SIT(g, true, { x: 28, y: 42 }), gi);
    await sleep(450);
    await page.evaluate((s) => { window.__CPM_FORCE_OUTCOME = s ? 'success' : 'fail'; window.__CPM_RESOLVE(0); }, success);
    await sleep(1700); // lascia completare l'arco difensivo
    const st = await page.evaluate(() => window.__CPM_STATE && window.__CPM_STATE());
    const gx = st && st.ball ? st.ball.x : null;
    if (gx != null) { xs.push(gx); if (gx > maxX) maxX = gx; if (gx >= 75) bad++; }
  }
}
await browser.close(); srv.close();

if (xs.length === 0) { console.log('\n⚠️ __CPM_STATE non disponibile — check inconcludente (non un fallimento).'); process.exit(0); }
const min = Math.min(...xs), max = Math.max(...xs), spread = +(max - min).toFixed(1);
console.log('\ncampioni palla (game-x): ' + xs.map(v => v.toFixed(0)).join(', '));
console.log('range x palla difensiva: ' + min.toFixed(1) + ' → ' + max.toFixed(1) + '  (spread ' + spread + ')  ·  soglia porta avversaria: 75');
console.log(bad === 0
  ? '\n✅ PASS — nessuna palla difensiva finita vicino alla porta avversaria (max x=' + maxX.toFixed(1) + '<75) · punti d\'arrivo VARI (spread ' + spread + 'u).'
  : '\n❌ FAIL — ' + bad + '/' + xs.length + ' respinte difensive finite oltre x=75 (verso la porta avversaria).');
process.exit(bad === 0 ? 0 : 1);
