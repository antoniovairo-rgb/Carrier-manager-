/* D1 — REPLAY ENGINE (slice headless, LIVE_MATCH_QA_SPEC cap. 3.5) — nucleo DATI, auto-verificabile.
   recordReplay: registra l'ARCO COMPLETO dell'highlight (choose → resolve → settle) campionando lo
   stato osservabile per-frame (palla/eroe/22 giocatori/camera/fase) + gli EVENTI (__CPM_TIMELINE).
   validateReplay: verifica COMPLETEZZA e COERENZA del replay (AC-051..055: replay non troncato,
   intera situation visibile, palla presente, esito registrato). Tutto a livello DATI (probe), non
   render → validabile in autonomia (gate-safe, nessuna modifica al gioco). */
import { sleep } from './harness.mjs';

export async function recordReplay(page, gi, { settle = 450, pollMs = 90, choosePolls = 5, resolvePolls = 11 } = {}) {
  await page.evaluate(() => window.__CPM_TIMELINE_RESET && window.__CPM_TIMELINE_RESET());
  await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]);
  await sleep(settle);
  await page.evaluate(() => { window.__CPM_FROZEN = false; });
  const intent = await page.evaluate(g => (window.__CPM_SITS && window.__CPM_SITS[g] && window.__CPM_SITS[g].intent) || null, gi);
  const t0 = Date.now();
  const frames = [];
  const snap = async (tag) => {
    const d = await page.evaluate(() => {
      const s = (typeof window.__CPM_STATE === 'function') ? window.__CPM_STATE() : null;
      const p = (typeof window.__CPM_PROBE === 'function') ? window.__CPM_PROBE() : null;
      return { s, ballOn: p && p.ball ? p.ball.onScreen : null, heroOn: p && p.hero ? p.hero.onScreen : null };
    });
    const s = d.s || {};
    frames.push({
      t: Date.now() - t0, tag, phase: s.phase || null,
      ball: s.ball ? { x: s.ball.x, y: s.ball.y, on: d.ballOn } : null,
      hero: s.hero ? { x: s.hero.x, y: s.hero.y, on: d.heroOn } : null,
      players: (s.players || []).map(p => [p.x, p.y]),
    });
  };
  for (let i = 0; i < choosePolls; i++) { await snap('choose'); await sleep(pollMs); }
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));
  for (let i = 0; i < resolvePolls; i++) { await snap('resolve'); await sleep(pollMs); }
  const events = await page.evaluate(() => (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []));
  return { gi, intent, frameCount: frames.length, durMs: frames.length ? frames[frames.length - 1].t : 0, frames, events };
}

export function validateReplay(rep) {
  const issues = [], warnings = [];
  const f = rep.frames || [];
  // AC-052/055: il replay copre l'INTERA azione, non è troncato all'evento
  if (f.length < 12) issues.push(`gi${rep.gi}: replay troncato (${f.length} frame < 12)`);
  const tags = new Set(f.map(x => x.tag));
  if (!tags.has('choose')) issues.push(`gi${rep.gi}: manca la fase di sviluppo (choose)`);
  if (!tags.has('resolve')) issues.push(`gi${rep.gi}: manca la conclusione (resolve)`);
  // tempo monotono (replay ricostruibile)
  for (let i = 1; i < f.length; i++) if (f[i].t < f[i - 1].t) { issues.push(`gi${rep.gi}: tempo non monotono al frame ${i}`); break; }
  // AC-021: palla presente in ogni frame
  const noBall = f.filter(x => !x.ball).length;
  if (noBall > 0) issues.push(`gi${rep.gi}: palla assente in ${noBall}/${f.length} frame`);
  // conteggio giocatori stabile (nessuno sparisce)
  const counts = [...new Set(f.map(x => (x.players || []).length))];
  if (counts.length > 1) issues.push(`gi${rep.gi}: conteggio giocatori variabile ${JSON.stringify(counts)}`);
  // AC-053/054: l'esito è registrato nella timeline
  const et = new Set((rep.events || []).map(e => e.type));
  if (!et.has('ActionResolved')) issues.push(`gi${rep.gi}: esito non registrato (nessun ActionResolved)`);
  if (!et.has('HighlightForced')) warnings.push(`gi${rep.gi}: inizio non registrato (nessun HighlightForced)`);
  // info: salto palla massimo (diagnostico, non bloccante: i tiri muovono la palla velocemente)
  let maxJump = 0; for (let i = 1; i < f.length; i++) if (f[i].ball && f[i - 1].ball) { const d = Math.hypot(f[i].ball.x - f[i - 1].ball.x, f[i].ball.y - f[i - 1].ball.y); if (d > maxJump) maxJump = d; }
  return { issues, warnings, info: { gi: rep.gi, intent: rep.intent, frames: f.length, durMs: rep.durMs, maxBallJump: +maxJump.toFixed(1), events: (rep.events || []).length } };
}
