#!/usr/bin/env node
/* [7.218.0 revisione PO «non si capisce assolutamente che è un dribbling»] LA SCENA SI APRE COL PALLONE DOV'È
   L'AZIONE. Dal 7.194.0 all'avvio di un highlight i 22 giocatori SNAPPANO in posizione — è uno stacco di regia,
   non una corsa. Il pallone no: restava dove l'aveva lasciato la scena precedente e ci arrivava scivolando.
   Misurato su un dribbling forzato: la scena si apriva col pallone a CENTROCAMPO e l'eroe a 26 unità di
   distanza, e per tutta l'azione la palla viaggiava verso di lui senza mai raggiungerlo — nessuna giocata
   tecnica poteva essere leggibile, perché il pallone non era mai ai piedi di chi la esegue.
   La probe confronta la posizione REALE della mesh palla (dal recorder) con la posizione LOGICA dell'azione
   (`__CPM_STATE().ball`) subito dopo l'apertura della scena. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 800, height: 700 } });
await installCdnRoutes(page);
const issues = [];
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
const { total } = await openMatch(page, port);
await page.evaluate(() => { window.__CPM_REC = true; });
await forceSituation(page, 0, { settle: 500, choose: true });
await sleep(400);// scalda il recorder: al primo giro il ring-buffer e ancora vuoto e il campione mancherebbe

const G2X = gx => gx - 50, G2Z = gy => (gy - 50) * 0.68;
/* Due soglie con ruoli diversi. La MEDIA è il segnale robusto: senza lo snap il pallone insegue sempre e
   ovunque (misurato 1.38u di scarto medio contro 0.13u con lo snap), quindi una media alta significa che la
   correzione è saltata del tutto. Il massimo per-scena è la rete per il caso catastrofico — la scena che si
   apre col pallone dall'altra parte del campo (misurati 26u sul dribbling), che una media non coglierebbe. */
const TOL = 3.0, TOL_MEAN = 0.7;
const step = Math.max(1, Math.floor(total / 24));
const rows = [];
for (let gi = 0; gi < total; gi += step) {
  await page.evaluate(() => { try { window.__CPM_REC_DRAIN(); } catch (e) {} });
  await forceSituation(page, gi, { settle: 500, choose: true });
  const st = await page.evaluate(() => { try { const s = window.__CPM_STATE(); return { bx: s.ball.x, by: s.ball.y }; } catch (e) { return null; } });
  const fr = await page.evaluate(() => (window.__CPM_REC_DRAIN ? window.__CPM_REC_DRAIN() : []));
  const last = fr.length ? fr[fr.length - 1] : null;
  if (!st || !last || !last.b) { issues.push(`gi${gi}: campione mancante`); continue; }
  const d = Math.hypot(last.b[0] - G2X(st.bx), last.b[1] - G2Z(st.by));
  rows.push({ gi, d: +d.toFixed(2) });
}
const bad = rows.filter(r => r.d > TOL);
const worst = rows.slice().sort((a, b) => b.d - a.d).slice(0, 5);
console.log(`situazioni campionate ${rows.length} · scarto medio ${(rows.reduce((a, r) => a + r.d, 0) / Math.max(1, rows.length)).toFixed(2)}u`);
console.log(`i cinque scarti maggiori: ${worst.map(r => `gi${r.gi} ${r.d}u`).join(' · ')}`);
const mean = rows.reduce((a, r) => a + r.d, 0) / Math.max(1, rows.length);
if (bad.length) issues.push(`${bad.length} scene su ${rows.length} si aprono col pallone lontano dall'azione: ${bad.slice(0, 8).map(r => `gi${r.gi} (${r.d}u)`).join(', ')}`);
if (mean > TOL_MEAN) issues.push(`scarto medio ${mean.toFixed(2)}u (limite ${TOL_MEAN}): il pallone insegue l'azione invece di essere già lì — lo stacco di scena non lo sta portando`);
if (rows.length < 10) issues.push(`campione insufficiente (${rows.length})`);

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n')
  : '✅ SCENA COERENTE (ogni highlight si apre col pallone nel punto dell\'azione, non altrove in campo)');
process.exit(issues.length ? 1 : 0);
