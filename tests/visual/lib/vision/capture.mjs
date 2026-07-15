/* AI VISION REVIEW — CATTURA PLAYWRIGHT multi-fase (AI_VISION_REVIEW.md §PLAYWRIGHT)
   Per ogni highlight acquisisce gli screenshot delle 5 fasi calcistiche:
   inizio · preparazione · evento principale · esito · post-highlight.
   Usa le primitive harness reali (forceSituation/canvasShot) → zero re-implementazione.
   NB: durante le fasi dinamiche NON congela (servono i frame reali dell'animazione).

   GUARDIA ANTI-ARTEFATTO (calibrata sul comportamento reale, vedi primo run AI Vision):
   dopo il RESOLVE la finestra 3D dell'esito dura poche centinaia di ms, poi compare la
   CARD di riepilogo (sfondo bianco) mentre matchPhase resta "hl_result": né phase né la
   presenza del <canvas> sono affidabili. Il discriminante è la LUMINANZA del frame:
     · L < 8     → frame NERO di transizione (fade)        → artefatto
     · L > 180   → CARD bianca di riepilogo/risultato       → artefatto (non è il 3D)
     · 8..180    → frame 3D valido (campo notturno)         → buono
   Le fasi post-resolve fanno POLLING di un frame 3D valido entro una finestra; se non lo
   trovano (l'azione è già passata alla card) riusano l'ultimo frame 3D valido. */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { forceSituation, canvasShot, sleep } from '../harness.mjs';

const PHASES = ['begin', 'preparation', 'main', 'outcome', 'post'];
const LUMA_BLACK = 8;   // sotto = frame nero di transizione
const LUMA_CARD = 180;  // sopra = card di riepilogo bianca

// luminanza media campionata (sotto-campionamento per velocità)
function meanLuma(buf) {
  try {
    const { data } = PNG.sync.read(buf);
    let s = 0, n = 0;
    for (let i = 0; i + 2 < data.length; i += 4 * 97) { s += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]; n++; }
    return n ? s / n : 255;
  } catch (_e) { return 128; } // non decodificabile → trattalo come 3D plausibile
}
const classify = L => (L < LUMA_BLACK ? 'blank' : L > LUMA_CARD ? 'summary-card' : null);

export async function captureHighlight(page, gi, outDir) {
  const shotsDir = path.join(outDir, 'shots');
  fs.mkdirSync(shotsDir, { recursive: true });
  const shots = [];
  let lastGood = null; // ultimo buffer 3D valido (fallback anti-artefatto)

  const write = (phase, buf, artifact) => {
    const fn = `gi${String(gi).padStart(3, '0')}_${phase}.png`;
    fs.writeFileSync(path.join(shotsDir, fn), buf);
    shots.push({ phase, path: path.join(shotsDir, fn), rel: 'shots/' + fn, ...(artifact ? { artifact } : {}) });
  };

  // snap diretto (fasi pre-resolve: il 3D c'è di sicuro)
  const snap = (phase) => canvasShot(page).then(buf => { if (!classify(meanLuma(buf))) lastGood = buf; write(phase, buf); });

  // snap guardato: poll di un frame 3D valido entro maxWait; fallback all'ultimo valido
  const guardedSnap = async (phase, { settle = 0, pollMs = 70, maxWait = 600 } = {}) => {
    if (settle) await sleep(settle);
    let buf = await canvasShot(page), art = classify(meanLuma(buf));
    const end = Date.now() + maxWait;
    while (art && Date.now() < end) { await sleep(pollMs); buf = await canvasShot(page); art = classify(meanLuma(buf)); }
    if (art && lastGood) { write(phase, lastGood, art); return; } // artefatto persistente → riusa l'ultimo 3D valido
    if (!art) lastGood = buf;
    write(phase, buf);
  };

  // inizio: framing interattivo della situation
  await forceSituation(page, gi, { settle: 600, choose: true });
  await snap('begin');
  // preparazione: poco prima dell'esecuzione
  await sleep(250); await snap('preparation');
  // evento principale: risolvi l'azione (k=0) e cattura il PRIMO frame 3D valido dell'esito
  await page.evaluate(() => { if (typeof window.__CPM_RESOLVE === 'function') window.__CPM_RESOLVE(0); });
  await guardedSnap('main', { settle: 150, maxWait: 700 });
  // esito: leggero assestamento, ancora dentro la finestra 3D
  await guardedSnap('outcome', { settle: 200, maxWait: 400 });
  // post-highlight: aftermath immediato (mai la card di riepilogo)
  await guardedSnap('post', { settle: 350, maxWait: 300 });
  return shots;
}

/* [BL-19 · VIDEO CONTINUO] cattura un BURST denso e ORDINATO dei fotogrammi della CONCLUSIONE (filmstrip):
   begin (framing) + N frame campionati a passo fisso attraverso la finestra dell'azione (main→outcome→post).
   Stessa GUARDIA ANTI-ARTEFATTO: i frame nero/card sono marcati (`artifact`) ma TENUTI in sequenza (il tempo
   scorre — un buco va mostrato, non nascosto), col fallback all'ultimo 3D valido solo se il primo frame è artefatto.
   L'AI riceve i frame IN ORDINE → può giudicare il MOVIMENTO, non solo pose statiche. Additivo: non tocca captureHighlight. */
export async function captureHighlightSequence(page, gi, outDir, { frames = 10, intervalMs = 110 } = {}) {
  const shotsDir = path.join(outDir, 'shots');
  fs.mkdirSync(shotsDir, { recursive: true });
  const shots = [];
  let lastGood = null;
  const write = (label, buf, artifact) => {
    const fn = `gi${String(gi).padStart(3, '0')}_${label}.png`;
    fs.writeFileSync(path.join(shotsDir, fn), buf);
    shots.push({ phase: label, path: path.join(shotsDir, fn), rel: 'shots/' + fn, ...(artifact ? { artifact } : {}) });
  };

  // framing interattivo (il primo frame del filmstrip = la situation prima dell'esecuzione)
  await forceSituation(page, gi, { settle: 600, choose: true });
  let buf = await canvasShot(page); if (!classify(meanLuma(buf))) lastGood = buf;
  write('f00', buf);

  // esegui l'azione, poi campiona a passo fisso il volgersi dell'azione (movimento reale, niente freeze)
  await page.evaluate(() => { if (typeof window.__CPM_RESOLVE === 'function') window.__CPM_RESOLVE(0); });
  const n = Math.max(3, Math.min(16, frames | 0));
  for (let i = 1; i < n; i++) {
    await sleep(Math.max(40, intervalMs | 0));
    buf = await canvasShot(page);
    const art = classify(meanLuma(buf));
    if (!art) { lastGood = buf; write('f' + String(i).padStart(2, '0'), buf); }
    else if (lastGood) { write('f' + String(i).padStart(2, '0'), lastGood, art); } // buco → riusa l'ultimo 3D valido, marcato
    else { write('f' + String(i).padStart(2, '0'), buf, art); }                    // ancora nessun 3D valido → tieni comunque il frame
  }
  return shots;
}

export { PHASES };
