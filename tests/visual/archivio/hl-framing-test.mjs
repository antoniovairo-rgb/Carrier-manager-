/* [7.306.0] collaudo PO «azione con rimorchio… la palla vola!» — GUARDIANO DELL'INQUADRATURA.
 * Per ogni situation forza la scena e chiede alla camera REALE dove cade il pallone in coordinate
 * normalizzate: se |ndc| > 1 il pallone è FUORI dal quadro, cioè il giocatore non vede l'oggetto
 * dell'azione. Baseline in hl-framing-baseline.json (FRAME_UPDATE=1 la rigenera).
 * Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node hl-framing-test.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';

const BASE = new URL('./hl-framing-baseline.json', import.meta.url).pathname;
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const errs = [];
const page = await browser.newPage();
await page.setViewportSize({ width: 900, height: 760 });
await installCdnRoutes(page);
page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(900);

const N = await page.evaluate(() => window.__CPM_NUMSIT || 191);
const off = [];
for (let g = 0; g < N; g++) {
  await forceSituation(page, g, { settle: 340 });
  const s = await page.evaluate(() => {
    const st = window.__CPM_STATE();
    return { ball: st.ball && st.ball.onScreen, ndc: st.ball && st.ball.ndc, hero: st.hero && st.hero.onScreen };
  });
  if (!s.ball || !s.hero) off.push({ g, ball: !!s.ball, hero: !!s.hero, ndc: s.ndc });
}
await browser.close(); srv.close();

const m = { total: N, off: off.length, list: off.map(o => o.g) };
console.log(JSON.stringify(m));
if (off.length) console.log(JSON.stringify(off.slice(0, 12)));

if (process.env.FRAME_UPDATE === '1' || !existsSync(BASE)) {
  writeFileSync(BASE, JSON.stringify(m, null, 1));
  console.log('baseline scritta →', BASE);
  process.exit(errs.length ? 2 : 0);
}
const b = JSON.parse(readFileSync(BASE, 'utf8'));
const nuovi = m.list.filter(g => !b.list.includes(g));
const bad = [];
if (nuovi.length) bad.push('situations FUORI QUADRO nuove: ' + nuovi.join(', '));
if (m.off > b.off) bad.push(`totale fuori quadro ${m.off} > baseline ${b.off}`);
if (errs.length) bad.push('pageerror: ' + errs.join(' | '));
console.log(bad.length ? '❌ FAIL\n  ' + bad.join('\n  ') : `✅ PASS — ${N - m.off}/${N} situations con eroe E pallone in quadro`);
process.exit(bad.length ? 2 : 0);
