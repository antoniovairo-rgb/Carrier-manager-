/* AI VISION REVIEW — CATTURA PLAYWRIGHT multi-fase (AI_VISION_REVIEW.md §PLAYWRIGHT)
   Per ogni highlight acquisisce gli screenshot delle 5 fasi calcistiche:
   inizio · preparazione · evento principale · esito · post-highlight.
   Usa le primitive harness reali (forceSituation/canvasShot) → zero re-implementazione.
   NB: durante le fasi dinamiche NON congela (servono i frame reali dell'animazione). */
import fs from 'node:fs';
import path from 'node:path';
import { forceSituation, canvasShot, sleep } from '../harness.mjs';

const PHASES = ['begin', 'preparation', 'main', 'outcome', 'post'];

export async function captureHighlight(page, gi, outDir) {
  const shotsDir = path.join(outDir, 'shots');
  fs.mkdirSync(shotsDir, { recursive: true });
  const shots = [];
  const snap = async (phase) => {
    const buf = await canvasShot(page);
    const fn = `gi${String(gi).padStart(3, '0')}_${phase}.png`;
    fs.writeFileSync(path.join(shotsDir, fn), buf);
    shots.push({ phase, path: path.join(shotsDir, fn), rel: 'shots/' + fn });
  };
  // inizio: framing interattivo della situation
  await forceSituation(page, gi, { settle: 600, choose: true });
  await snap('begin');
  // preparazione: poco prima dell'esecuzione
  await sleep(250); await snap('preparation');
  // evento principale: risolvi l'azione (k=0) e cattura sull'impatto
  await page.evaluate(() => { if (typeof window.__CPM_RESOLVE === 'function') window.__CPM_RESOLVE(0); });
  await sleep(220); await snap('main');
  // esito
  await sleep(500); await snap('outcome');
  // post-highlight
  await sleep(800); await snap('post');
  return shots;
}

export { PHASES };
