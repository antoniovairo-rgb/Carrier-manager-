/* [23/09] Gesto dell'eroe CGTrader nella review ottimizzata: dribbling, passaggio, tiro. Nessuna mutazione di gioco.
   CPM_INTENT=dribble|pass|shot sceglie la prima situazione con quell'intento (`deriveIntent`, la stessa funzione del
   gioco) e l'azione il cui testo corrisponde al gesto (CPM_ACT = regex, facoltativa). A ogni campione legge
   `__CPM_CGTRADER_ACTORS_AUDIT` (solo corpi disegnati) e fotografa. Sintesi:
   - gesti dell'eroe montati nella scena (`__CPM_G000`: contati dal gioco fotogramma per fotogramma);
   - contatto: distanza minima palla-piede durante il gesto, a quale tempo di clip, con quale piede;
   - orientamento dell'eroe verso la porta al contatto; eroe e palla nel quadro, altezza apparente;
   - T-pose: un corpo disegnato con entrambe le mani a >0,60 m dal busto e all'altezza del busto (<0,30 m);
   - attori di contesto con un gesto tecnico (non dovrebbero averne).
   Tre fotogrammi in `gesto-review/<intento>/`: apertura, contatto, uscita. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const INTENT = process.env.CPM_INTENT || 'dribble';
const ACT = new RegExp(process.env.CPM_ACT || ({ dribble: 'dribbl', pass: 'passaggio|filtrante|servi|appoggi|lancio', shot: 'tiro|conclu' }[INTENT] || '.'), 'i');
const ROSSO = process.env.CPM_ROSSO || '';
const BASE = process.env.CPM_BASE === '1'; /* partita normale (CH38), senza parametro: stessa scena, confronto appaiato */ /* nome di un interruttore window da accendere prima del caricamento */
const out = path.join(here, 'gesto-review', (process.env.CPM_TAG || INTENT) + (ROSSO ? '-rosso' : '') + (BASE ? '-base' : ''));
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'gesto-'));
const N = Number(process.env.CPM_N || 26), PASSO = Number(process.env.CPM_PASSO || 180);
const server = await startServer();
const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));

try {
  if (ROSSO) await page.addInitScript(n => { window[n] = true; }, ROSSO);
  if (process.env.CPM_FORZA) await page.addInitScript(f => { window.__CPM_VAR23_FORZA = JSON.parse(f); }, process.env.CPM_FORZA); /* es. {"kick":"mx-kick-soccerball"} */
  if (process.env.CPM_F6) await page.addInitScript(() => { window.__CPM_F6REC = 1; });
  await installCdnRoutes(page);
  await openMatch(page, server.address().port, {
    skipLoadAll: true, name: 'Gesto Review',
    query: BASE ? { cpmForce: INTENT === 'pass' ? 'shot' : INTENT } : { hyperCharacter: 'cgtrader-highlight-optimized', cpmForce: INTENT === 'pass' ? 'shot' : INTENT },
  });
  await page.waitForFunction(b => b ? true : window.__CPM_HYPER_CASUAL_STATUS === 'ready-lineup', BASE, { timeout: 180000 });
  if (BASE) await sleep(4000);
  const scelta = await page.evaluate(({ intent, re }) => {
    const rx = new RegExp(re, 'i');
    for (let i = 0; i < SITUATIONS.length; i++) {
      const s = SITUATIONS[i];
      if (!s || !s.actions || deriveIntent(s) !== intent) continue;
      const labels = s.actions.map(a => String(a.label || a.l || a.text || a.t || JSON.stringify(a).slice(0, 40)));
      const k = labels.findIndex(l => rx.test(l));
      if (k >= 0) return { i, k, text: s.text, labels };
    }
    return null;
  }, { intent: INTENT, re: ACT.source });
  if (!scelta) throw new Error(`nessuna situazione con intento ${INTENT} e azione ${ACT}`);
  console.log('SCELTA', JSON.stringify(scelta));
  await page.evaluate(i => window.__CPM_FORCE_SIT(i, true), scelta.i);
  const PRE = Number(process.env.CPM_PRE || 8); /* campioni PRIMA della scelta: l'approccio del dribbling vive in hl_choose */

  /* registratore a OGNI fotogramma (in pagina): il campionamento da fuori vede 3 punti su una clip da 0,42 s */
  await page.evaluate(() => { window.__REC_EROE = []; const giro = () => { try { const a = window.__CPM_CGTRADER_ACTORS_AUDIT && window.__CPM_CGTRADER_ACTORS_AUDIT(); const h = a && a.actors.find(x => x.hero); if (h && h.gesture && window.__REC_EROE.length < 2000) window.__REC_EROE.push({ g: h.gesture, ct: h.clipTime, fl: h.footBallL, fr: h.footBallR, by: a.ball && a.ball.y, face: h.facingGoalDeg, kick: window.__CPM_CGTRADER_KICK_TOUCH ? { ...window.__CPM_CGTRADER_KICK_TOUCH } : null }); } catch (e) {} requestAnimationFrame(giro); }; requestAnimationFrame(giro); });
  const frames = [];
  const t0 = Date.now();
  for (let i = 0; i < N + PRE; i++) {
    if (i === PRE) await page.evaluate(k => window.__CPM_RESOLVE(k), scelta.k);
    await sleep(PASSO);
    const s = await page.evaluate(() => ({
      phase: window.__CPM_PHASE?.() || null,
      sit: window.__CPM_CURSIT?.()?.text ?? null,
      a: window.__CPM_CGTRADER_ACTORS_AUDIT ? window.__CPM_CGTRADER_ACTORS_AUDIT() : null,
      g000: window.__CPM_G000 || null,
      touch: window.__CPM_CGTRADER_DRIBBLE_TOUCH || null,
      mounts: window.__CPM_CGTRADER_MOUNTS || null,
    }));
    const shot = path.join(scratch, `f${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: shot });
    frames.push({ i, t: Date.now() - t0, shot, ...s });
    if (s.phase && !/^hl_/.test(s.phase) && i > PRE + 6) break;
  }

  const rec = await page.evaluate(() => window.__REC_EROE || []);
  if (process.env.CPM_F6) { const f6 = await page.evaluate(() => window.__CPM_F6LOG || []); fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, 'f6.json'), JSON.stringify(f6)); }
  const hero = f => ((f.a && f.a.actors) || []).find(x => x.hero) || {};
  const conGesto = frames.filter(f => hero(f).gesture);
  const piede = h => Math.min(h.footBallL ?? 99, h.footBallR ?? 99);
  const contatto = conGesto.length ? conGesto.reduce((a, b) => (piede(hero(b)) < piede(hero(a)) ? b : a)) : null;
  const scelti = { apertura: conGesto[0] || null, contatto, uscita: conGesto[conGesto.length - 1] || null };
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(out)) if (f.endsWith('.png')) fs.unlinkSync(path.join(out, f));
  for (const [n, f] of Object.entries(scelti)) if (f) fs.copyFileSync(f.shot, path.join(out, `${INTENT}-${n}.png`));
  const tpose = [];
  const contesto = [];
  frames.forEach(f => ((f.a && f.a.actors) || []).forEach(x => {
    if ((x.armL ?? 0) > 0.6 && (x.armR ?? 0) > 0.6 && (x.handsAtChest ?? 9) < 0.3) tpose.push({ i: f.i, actor: x.i, hero: x.hero, gesture: x.gesture, armL: x.armL, armR: x.armR });
    if (!x.hero && !x.gk && x.gesture) contesto.push({ i: f.i, actor: x.i, gesture: x.gesture });
  }));
  const g = frames.at(-1)?.g000 || {};
  const h = contatto ? hero(contatto) : null;
  const sintesi = {
    intento: INTENT, situazione: scelta.text, azione: scelta.labels[scelta.k],
    campioni: frames.length, fasi: [...new Set(frames.map(f => f.phase))],
    gestiEroePerScena: Object.fromEntries(Object.entries(g).map(([k, v]) => [k.slice(0, 40), { n: v.n, gesti: v.gesti, tipi: v.tipi }])),
    perFotogramma: (() => { const out = {}; for (const r of rec) { const o = out[r.g] || (out[r.g] = { fotogrammi: 0, minPiede: 99, ctAlMin: null, byAlMin: null, faceAlMin: null }); o.fotogrammi++; const m = Math.min(r.fl ?? 99, r.fr ?? 99); if (m < o.minPiede) { o.minPiede = m; o.ctAlMin = r.ct; o.byAlMin = r.by; o.faceAlMin = r.face; o.kick = r.kick; } } return out; })(),
    montaggiVeriEroe: frames.at(-1)?.mounts || null,
    campioniConGesto: conGesto.length, clip: [...new Set(conGesto.map(f => hero(f).clip))],
    contatto: h ? { i: contatto.i, gesto: h.gesture, clipTime: h.clipTime, clipDur: h.clipDur, piedeSx: h.footBallL, piedeDx: h.footBallR, facingGoalDeg: h.facingGoalDeg, inFrame: h.inFrame, ballInFrame: h.ballInFrame, height: h.height } : null,
    eroeNelQuadro: +(frames.filter(f => hero(f).inFrame).length / Math.max(1, frames.filter(f => hero(f).i !== undefined).length)).toFixed(2),
    taglia: (() => { const v = frames.filter(f => /^hl_/.test(f.phase || '') && Number.isFinite(hero(f).height)).map(f => hero(f).height).sort((a, b) => a - b); const q = k => v.length ? +v[Math.min(v.length - 1, Math.floor(k * v.length))].toFixed(3) : null; return { n: v.length, q10: q(0.1), mediana: q(0.5), q90: q(0.9) }; })(),
    fuoriQuadroHL: (() => { const v = frames.filter(f => /^hl_/.test(f.phase || '') && hero(f).i !== undefined); return v.length ? +(v.filter(f => !hero(f).inFrame).length / v.length).toFixed(2) : null; })(),
    tpose: tpose.slice(0, 10), tposeCampioni: tpose.length,
    contestoConGesto: contesto.slice(0, 10),
    corpiDisegnati: [...new Set(frames.map(f => ((f.a && f.a.actors) || []).length))],
    esecuzioniScelte: await page.evaluate(() => window.__CPM_VAR23 || null).catch(() => null),
    latoTuffo: await page.evaluate(() => window.__CPM_TUFFO23 || null).catch(() => null),
    specchio: await page.evaluate(() => window.__CPM_SPECCHIO23 || null).catch(() => null),
    errors,
  };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ scelta, sintesi, frames: frames.map(({ shot, ...f }) => f) }, null, 1));
  console.log(JSON.stringify(sintesi, null, 1));
} finally {
  await browser.close();
  server.close();
}
