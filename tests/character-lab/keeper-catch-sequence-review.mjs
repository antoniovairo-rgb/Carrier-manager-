/* Presa alta del portiere CGTrader (review opt-in `cgtrader-highlight-optimized`). Nessuna mutazione di gioco.
   [22/09] Riscritta: la versione precedente leggeva `__CPM_CGTRADER_CONTACT_AUDIT`, che esiste solo nel
   benchmark misto, quindi nella review ottimizzata registrava sempre `null`. Ora legge
   `__CPM_CGTRADER_KEEPER_AUDIT` (portiere di casa: mani, palla, distanza, gesto, apertura braccia) a ogni
   campione, fotografa ogni campione in scratch e conserva in `keeper-catch-review/` tre fotogrammi:
   APERTURA (primo campione con la clip di presa), CONTATTO (distanza palla-mani minima) e RECUPERO (ultimo
   campione con la palla ancora in mano o l'ultimo del gesto). Scrive `report.json` con la sequenza. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROSSO = process.env.CPM_ROSSO === '1'; /* rosso appaiato: __CPM_NO_PRESA spegne il canale della presa */
const ROSSO_CAM = process.env.CPM_ROSSO_CAM === '1'; /* rosso della sola regia: __CPM_NO_PRESACAM */
const out = path.join(here, ROSSO ? 'keeper-catch-review-rosso' : (ROSSO_CAM ? 'keeper-catch-review-rosso-cam' : 'keeper-catch-review'));
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'presa-'));
const N = Number(process.env.CPM_N || 70), PASSO = Number(process.env.CPM_PASSO || 180);
const server = await startServer();
const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(String(error.message).slice(0, 200)));

try {
  if (ROSSO) await page.addInitScript(() => { window.__CPM_NO_PRESA = true; });
  if (ROSSO_CAM) await page.addInitScript(() => { window.__CPM_NO_PRESACAM = true; });
  await installCdnRoutes(page);
  await openMatch(page, server.address().port, {
    skipLoadAll: true,
    name: 'Keeper Catch Review',
    query: { hyperCharacter: 'cgtrader-highlight-optimized', cpmForce: 'keeper' },
  });
  await page.waitForFunction(() => window.__CPM_HYPER_CASUAL_STATUS === 'ready-lineup', null, { timeout: 180000 });
  await page.evaluate(index => window.__CPM_FORCE_SIT(index, true), 33); // «Muro in area»
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => /Chiama il portiere/i.test(b.textContent || '')), null, { timeout: 45000 });
  const before = await page.evaluate(() => ({
    buttons: [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean).slice(-8),
    keeper: window.__CPM_CGTRADER_KEEPER_AUDIT ? window.__CPM_CGTRADER_KEEPER_AUDIT() : 'testimone assente',
    phase: window.__CPM_PHASE?.() || null,
  }));
  console.log('PRIMA DELLA SCELTA', JSON.stringify(before));
  await page.evaluate(() => window.__CPM_RESOLVE(2)); // terza scelta = «Chiama il portiere»

  const frames = [];
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await sleep(PASSO);
    const s = await page.evaluate(() => ({
      phase: window.__CPM_PHASE?.() || null,
      keeper: window.__CPM_CGTRADER_KEEPER_AUDIT ? window.__CPM_CGTRADER_KEEPER_AUDIT() : null,
      roster: window.__CPM_CGTRADER_CINEMA_ROSTER || null,
      sceneT: window.__CPM_SCENET ?? null,
    }));
    const shot = path.join(scratch, `f${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: shot });
    frames.push({ i, t: Date.now() - t0, shot, ...s });
    if (s.phase && !/^hl_/.test(s.phase) && i > 10) break;
  }

  const k = f => f.keeper || {};
  const inPresa = frames.filter(f => k(f).gesture === 'catch');
  const conDist = frames.filter(f => Number.isFinite(k(f).handBall));
  const apertura = inPresa[0] || null;
  const contatto = conDist.length ? conDist.reduce((a, b) => (k(b).handBall < k(a).handBall ? b : a)) : null;
  const dopo = contatto ? frames.filter(f => f.i > contatto.i && Number.isFinite(k(f).handBall)) : [];
  const recupero = dopo.length ? dopo[dopo.length - 1] : (inPresa[inPresa.length - 1] || null);
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(out)) if (f.endsWith('.png')) fs.unlinkSync(path.join(out, f));
  const scelti = { apertura, contatto, recupero };
  for (const [nome, f] of Object.entries(scelti)) if (f) fs.copyFileSync(f.shot, path.join(out, `presa-${nome}.png`));

  const sintesi = {
    azioneOfferta: before.buttons.some(x => /Chiama il portiere/i.test(x)),
    campioni: frames.length,
    fasi: [...new Set(frames.map(f => f.phase))],
    campioniInPresa: inPresa.length,
    clip: [...new Set(inPresa.map(f => k(f).clip))],
    portiereSempreDisegnato: frames.filter(f => k(f).hasKeeper).every(f => k(f).visible),
    lodPortiere: [...new Set(frames.map(f => k(f).lod))],
    distanzaMinimaPallaMani: contatto ? k(contatto).handBall : null,
    distanzaDopoContatto: dopo.map(f => k(f).handBall),
    aperturaBracciaMax: Math.max(...frames.map(f => k(f).armOpen || 0)),
    maniSopraBustoAlContatto: contatto ? k(contatto).handsAboveSpine : null,
    portiereNelQuadroAlContatto: contatto ? (k(contatto).screen || {}).keeperInFrame ?? null : null,
    altezzaApparenteAlContatto: contatto ? (k(contatto).screen || {}).keeperHeight ?? null : null,
    quotaNelQuadroDopoArmo: (() => { const q = frames.filter(f => k(f).presa); return q.length ? +(q.filter(f => (k(f).screen || {}).keeperInFrame).length / q.length).toFixed(2) : null; })(),
    tempoClipAlContatto: (frames.at(-1)?.keeper?.presa || {}).contactClipT ?? null,
    fotogrammi: Object.fromEntries(Object.entries(scelti).map(([n, f]) => [n, f ? { i: f.i, t: f.t, phase: f.phase, ...k(f) } : null])),
    errors,
  };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ before, sintesi, frames: frames.map(({ shot, ...f }) => f) }, null, 1));
  console.log(JSON.stringify(sintesi, null, 1));
} finally {
  await browser.close();
  server.close();
}
