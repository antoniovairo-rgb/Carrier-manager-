#!/usr/bin/env node
/* [7.214.0 revisione PO «la rovesciata deve partire con il pallone ancora in aria e non con palla a terra» ·
   «il colpo di testa non è sincronizzato con il pallone in aria, scende a terra» · «la volée non parte con la
   palla in aria»] GUARDIANO DELLO STATO-PALLA AEREO.
   Il motore SA quali situazioni hanno il pallone per aria (`hlBallState(sit)==="aerial"`: cross, corner,
   rimbalzo, sponda) — è l'invariante che permette a `deriveHL` di scegliere testa/rovesciata/volée. Ma il
   render non lo sapeva: la palla riposava a 0.65 (a terra) fino al momento del contatto, e la conclusione
   partiva da lì. Risultato: rovesciate su palla ferma e incornate a un pallone che sta sull'erba.
   La probe FORZA ogni situation aerea e misura la QUOTA REALE della mesh palla (`__CPM_STATE().ball.worldY`)
   nel momento di lettura (hl_choose), e la confronta con un campione di situazioni a palla al piede — che
   devono restare a terra (controprova: nessun sollevamento indiscriminato). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
const issues = [];
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
const { total } = await openMatch(page, port);

/* stato-palla di OGNI situation, letto dal motore (mai una copia del modello) */
const states = await page.evaluate(() => (window.__CPM_SITS || []).map(s => {
  try { return window.hlBallState(s); } catch (e) { return null; }
}));
const aerial = states.map((s, i) => [s, i]).filter(([s]) => s === 'aerial').map(([, i]) => i);
const feet = states.map((s, i) => [s, i]).filter(([s]) => s === 'feet').map(([, i]) => i);
console.log(`situations ${total} · aeree ${aerial.length} · a terra ${feet.length}`);
if (aerial.length < 10) issues.push(`solo ${aerial.length} situazioni aeree trovate — l'estrazione dello stato-palla non ha funzionato`);

const sample = (arr, n) => arr.filter((_, k) => k % Math.max(1, Math.ceil(arr.length / n)) === 0).slice(0, n);
const measure = async (gi) => {
  const st = await forceSituation(page, gi, { settle: 700, choose: true });
  return st && st.ball ? st.ball.worldY : null;
};

const REST = 0.65;                 // quota di riposo del pallone sul prato
const MIN_AIR = 1.20;              // sotto questa quota il pallone è, a schermo, «per terra»
let lowAir = [], highFeet = [];
for (const gi of sample(aerial, 14)) {
  const y = await measure(gi);
  if (y == null) { issues.push(`gi${gi}: quota palla non leggibile`); continue; }
  if (y < MIN_AIR) lowAir.push(`gi${gi} y=${y}`);
}
for (const gi of sample(feet, 8)) {
  const y = await measure(gi);
  if (y != null && y > REST + 0.35) highFeet.push(`gi${gi} y=${y}`);
}
console.log(`aeree campionate 14 → a terra ${lowAir.length}${lowAir.length ? ' (' + lowAir.slice(0, 6).join(', ') + ')' : ''}`);
console.log(`a-terra campionate 8 → sollevate ${highFeet.length}${highFeet.length ? ' (' + highFeet.join(', ') + ')' : ''}`);
if (lowAir.length) issues.push(`${lowAir.length} situazioni AEREE hanno il pallone a terra al momento della lettura: ${lowAir.slice(0, 6).join(', ')}`);
if (highFeet.length) issues.push(`${highFeet.length} situazioni a PALLA AL PIEDE hanno il pallone sollevato: ${highFeet.join(', ')} — il sollevamento non deve essere indiscriminato`);

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n')
  : '✅ STATO-PALLA COERENTE (le azioni aeree si giocano con il pallone in aria, quelle a terra restano a terra)');
process.exit(issues.length ? 1 : 0);
