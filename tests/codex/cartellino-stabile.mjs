#!/usr/bin/env node
// Scheda 3 proposal: wait for actual scene state and frames instead of fixed sleeps.
import '../../prototipo/partita-vera/motore-v2.js';
import '../../prototipo/partita-vera/partita.js';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const red = process.env.CPM_ROSSO === '1';
const failures = [];
globalThis.window = red ? { __CPM_NO_CARTA9: 1 } : {};
const create = seed => {
  const p = globalThis.creaPartita({ registra: false, v2: true, seed,
    casa: { sigla: 'CAS', forza: 70 }, ospite: { sigla: 'OSP', forza: 70 },
    eroeLato: 'home', eroe: { nome: 'EROE', ovr: 74 } });
  for (let k = 0; k < 60; k++) p.passo();
  return p.motore;
};
const motor = create(4242);
globalThis.window.__CPM_FORZA_CARTA9 = 'yellow';
const beforeAway = motor.tabellino().away.ammonizioni;
const received = motor.risolviEroe.eventi('fouled', { rew: 'dribble', ok: false, cast: {} });
if (!received.some(e => e.t === 'ammonizione' && e.scena) || motor.tabellino().away.ammonizioni !== beforeAway + 1)
  failures.push('A: il giallo del fallo subito non entra nel tabellino');
delete globalThis.window.__CPM_FORZA_CARTA9;
const beforeHome = motor.tabellino().home.ammonizioni;
motor.risolviEroe.eventi('foul', { rew: 'recovery', ok: false, cast: {}, carta: 'yellow' });
if (motor.tabellino().home.ammonizioni !== beforeHome + 1)
  failures.push('A: il giallo commesso dall eroe non entra nel tabellino');
let yellow = 0;
for (let seed = 1; seed <= 400; seed++) if (create(9000 + seed).risolviEroe.eventi('fouled', { rew: 'dribble', ok: false, cast: {} }).some(e => e.t === 'ammonizione' || e.t === 'espulsione')) yellow++;
const ratio = yellow ? 400 / yellow : Infinity;
if (ratio < 4 || ratio > 9) failures.push(`A: frequenza uno ogni ${ratio.toFixed(1)} falli fuori banda`);
delete globalThis.window;

const server = await startServer();
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e.message)));
await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_REC = true; window.__CPM_CARTA9_REC = 1; window.__CPM_BRAIN_REC = 1; if (r) window.__CPM_NO_CARTA9 = 1; }, red);
let witness = null, fps = null, phase = null, resolved = null, b2 = null, motorCard = null, brain = null;
try {
  await openMatch(page, server.address().port, { skipLoadAll: true, name: 'Carta9Stable' });
  await page.waitForFunction(() => window.__CPM_GESTURE?.()?.glb, null, { timeout: 90_000 });
  await page.evaluate(() => window.__CPM_AUTOPLAY?.(true, { seed: 77, policy: 'seeded', tickMs: 300 }));
  await page.waitForFunction(() => !!window.__CPM_MOTORE_OBJ?.(), null, { timeout: 60_000 });
  await page.evaluate(() => window.__CPM_AUTOPLAY?.(false));
  await page.evaluate(() => {
    window.__CPM_CARTA9 = null;
    window.__CPM_FORCE_SIT(30, true);
  });
  await page.waitForFunction(() => window.__CPM_PHASE?.() === 'hl_choose', null, { timeout: 90_000 });
  resolved = await page.evaluate(() => {
    window.__CPM_FORCE_KIND = 'fouled';
    window.__CPM_FORCE_OUTCOME = 'fail';
    window.__CPM_FORZA_CARTA9 = 'yellow';
    return window.__CPM_RESOLVE?.(0);
  });
  const deadline = Date.now() + +(process.env.CPM_MS || 120_000);
  while (Date.now() < deadline) {
    witness = await page.evaluate(() => window.__CPM_CARTA9 || null);
    if (witness?.fotogrammi && witness.cartaVista > 5 && witness.t > 3) break;
    await sleep(300);
  }
  ({ fps, phase, b2, motorCard, brain } = await page.evaluate(() => ({
    fps: window.__CPM_FPS708 || null, phase: window.__CPM_PHASE?.() || null,
    b2: (window.__CPM_B2EV || []).slice(-3),
    motorCard: window.__CPM_MOTORE_OBJ?.()?.tabellino?.()?.away?.ammonizioni ?? null,
    brain: { seq: window.__CPM_BRAINBR ?? null, frames: window.__CPM_BRAINFR ?? null, events: window.__CPM_BRAIN23 || null }
  })));
} catch (e) { failures.push('B: ' + String(e.message || e)); }
finally { await browser.close(); server.close(); }
if (!witness?.fotogrammi) failures.push('B: nessun fotogramma di cartellino');
else {
  if (!(witness.dist < 3.5)) failures.push(`B: arbitro a ${witness.dist} u`);
  if (!(witness.cartaVista > 0)) failures.push('B: cartellino invisibile');
  if (!(witness.manoSopraTesta > 0)) failures.push('B: mano sotto la testa');
  if (witness.opp && !witness.oppUguale && !witness.dalContrasto) failures.push('B: destinatario diverso dal colpevole');
  if (witness.colore !== 'y') failures.push(`B: colore ${witness.colore}`);
}
if (errors.length) failures.push('B: errore pagina ' + errors[0]);
console.log(JSON.stringify({ red, ratio, yellow, resolved, witness, fps, phase, b2, motorCard, brain, failures }));
console.log(failures.length ? 'FAIL cartellino-stabile' : 'PASS cartellino-stabile');
process.exit(failures.length ? 1 : 0);
