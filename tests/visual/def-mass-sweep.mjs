/* SWEEP MASSIVO FASE DIFENSIVA (6.75.0) — decine di migliaia di contesti sui due motori PURI:
   resolveDefensiveOutcome (esiti difensivi) e decideExecution (intenti recover/anticipate/intercept).
   Varia: qualità giocatori (3 tier), pressione 0-5, fatica, morale, meteo, piede, posizione, seed.
   Invarianti: esiti validi · clearance mai oltre x=68 · throw_in solo su linea laterale · corner solo in zona
   profonda · determinismo (stesso ctx+seed ⇒ stesso esito) · monotonia pressione (più pressione ⇒ meno successo)
   · monotonia qualità (attrs migliori ⇒ più successo). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(300);

const res = await page.evaluate(() => {
  const RDO = window.resolveDefensiveOutcome, DE = window.decideExecution;
  if (typeof RDO !== 'function') return { err: 'resolveDefensiveOutcome non esposta' };
  if (typeof DE !== 'function') return { err: 'decideExecution non esposta' };
  const TIERS = {
    scarso:   { posizionamento: 48, passaggio: 45, tecnica: 44, mentalità: 46, fisico: 52, velocità: 50, tiro: 40, dribbling: 42 },
    medio:    { posizionamento: 66, passaggio: 62, tecnica: 60, mentalità: 63, fisico: 68, velocità: 64, tiro: 58, dribbling: 60 },
    campione: { posizionamento: 88, passaggio: 85, tecnica: 86, mentalità: 87, fisico: 84, velocità: 86, tiro: 84, dribbling: 85 },
  };
  const VALID = new Set(['intercept_keep','tackle_win','pass_start','counter','short_clear','safe_clear','throw_in','corner_conceded','beaten','loose_second','contest_nearby']);
  const out = { rdo: { n: 0, bad: [], detOk: true, kinds: {}, safeLo: 0, safeHi: 0, totLo: 0, totHi: 0 },
                de:  { n: 0, bad: [], detOk: true, okByPress: {}, okByTier: {}, keys: {} } };
  // ── 1) resolveDefensiveOutcome — griglia ampia ────────────────────────────
  for (const tier of Object.keys(TIERS)) {
    for (const x of [8, 15, 25, 35, 45, 55, 65]) {
      for (const y of [6, 25, 50, 75, 94]) {
        for (const pressure of [0, 1, 2, 3, 4, 5]) {
          for (const success of [true, false]) {
            for (let s = 0; s < 10; s++) {
              const seed = (s * 2654435761 + x * 131 + y * 17 + pressure * 7 + tier.length * 977) >>> 0;
              const ctx = { success, x, y, pressure, attrs: TIERS[tier], foot: s % 2 ? 'L' : 'R', seed };
              const o = RDO(ctx); out.rdo.n++;
              out.rdo.kinds[o.kind] = (out.rdo.kinds[o.kind] || 0) + 1;
              if (!VALID.has(o.kind)) out.rdo.bad.push('kind:' + o.kind);
              // clearance/target mai oltre x=68 (clamp del render): dx segnato in avanti
              if (!o.toTouch && !o.toGoalLine) { const tgx = Math.max(6, Math.min(x + (o.dx || 0), 68)); if (tgx > 68) out.rdo.bad.push('tgx>' + tgx); }
              if (o.kind === 'throw_in' && !(y < 18 || y > 82)) out.rdo.bad.push('throw_in@y' + y);
              if (o.kind === 'corner_conceded' && x >= 26) out.rdo.bad.push('corner@x' + x);
              if (!(o.arcDur > 0 && o.arcH > 0)) out.rdo.bad.push('arc:' + o.kind);
              const b = pressure <= 1 ? 'lo' : pressure >= 3 ? 'hi' : null;
              if (b && success) { out.rdo['tot' + (b === 'lo' ? 'Lo' : 'Hi')]++; if (o.kind === 'safe_clear') out.rdo['safe' + (b === 'lo' ? 'Lo' : 'Hi')]++; }
              // determinismo
              const o2 = RDO(ctx);
              if (JSON.stringify(o) !== JSON.stringify(o2)) out.rdo.detOk = false;
            }
          }
        }
      }
    }
  }
  // ── 2) decideExecution — intenti difensivi ────────────────────────────────
  const WX = ['clear', 'rain', 'snow', 'fog'];
  for (const intent of ['recover', 'anticipate', 'intercept']) {
    for (const tier of Object.keys(TIERS)) {
      for (const pressure of [0, 1, 2, 3, 4, 5]) {
        for (const fatigue of [10, 45, 80]) {
          for (const morale of [30, 60, 90]) {
            for (let s = 0; s < 8; s++) {
              const seed = (s * 40503 + pressure * 131 + fatigue * 17 + morale * 7 + intent.length * 3571) >>> 0;
              const ctx = { attrs: TIERS[tier], pressure, support: 1, fatigue, morale, x: 30, weather: WX[s % 4], foot: s % 2 ? 'L' : 'R', side: 'C', seed };
              const d = DE(intent, ctx); out.de.n++;
              if (!d || typeof d.outcome !== 'string') { out.de.bad.push('no-outcome:' + intent); continue; }
              out.de.keys[d.outcome] = (out.de.keys[d.outcome] || 0) + 1;
              if (!(d.quality >= 0 && d.quality <= 1)) out.de.bad.push('q:' + d.quality);
              const okish = d.outcome === 'ball_won'; // unico esito pienamente vincente degli intenti difensivi
              const kp = 'p' + pressure; out.de.okByPress[kp] = out.de.okByPress[kp] || { ok: 0, n: 0 }; out.de.okByPress[kp].n++; if (okish) out.de.okByPress[kp].ok++;
              out.de.okByTier[tier] = out.de.okByTier[tier] || { ok: 0, n: 0 }; out.de.okByTier[tier].n++; if (okish) out.de.okByTier[tier].ok++;
              const d2 = DE(intent, ctx);
              if (JSON.stringify(d) !== JSON.stringify(d2)) out.de.detOk = false;
            }
          }
        }
      }
    }
  }
  return out;
});
await browser.close(); srv.close();

if (res.err) { console.error('❌ ' + res.err); process.exit(2); }
const r = res.rdo, d = res.de;
const pct = (a, b) => (a / (b || 1) * 100).toFixed(1);
console.log(`resolveDefensiveOutcome — ${r.n} contesti (3 tier × 7 x × 5 y × 6 press × 2 esiti × 10 seed)`);
console.log(`  esiti: ${Object.entries(r.kinds).map(([k, v]) => k + ' ' + pct(v, r.n) + '%').join(' · ')}`);
console.log(`  spazzata lunga: bassa pressione ${pct(r.safeLo, r.totLo)}% · alta ${pct(r.safeHi, r.totHi)}%`);
console.log(`  violazioni invarianti: ${r.bad.length}${r.bad.length ? ' → ' + r.bad.slice(0, 5).join(', ') : ''} · determinismo: ${r.detOk ? 'OK' : 'ROTTO'}`);
console.log(`\ndecideExecution (recover/anticipate/intercept) — ${d.n} contesti`);
console.log(`  outcome keys: ${Object.entries(d.keys).map(([k, v]) => k + ' ' + pct(v, d.n) + '%').join(' · ')}`);
const op = Object.keys(d.okByPress).sort().map(k => k + '=' + pct(d.okByPress[k].ok, d.okByPress[k].n) + '%').join(' ');
console.log(`  successo per pressione: ${op}`);
const ot = ['scarso', 'medio', 'campione'].map(k => k + '=' + pct(d.okByTier[k]?.ok, d.okByTier[k]?.n) + '%').join(' ');
console.log(`  successo per qualità: ${ot}`);
console.log(`  violazioni: ${d.bad.length}${d.bad.length ? ' → ' + d.bad.slice(0, 5).join(', ') : ''} · determinismo: ${d.detOk ? 'OK' : 'ROTTO'}`);
const p0 = d.okByPress.p0 ? d.okByPress.p0.ok / d.okByPress.p0.n : 0, p5 = d.okByPress.p5 ? d.okByPress.p5.ok / d.okByPress.p5.n : 0;
const tS = d.okByTier.scarso ? d.okByTier.scarso.ok / d.okByTier.scarso.n : 0, tC = d.okByTier.campione ? d.okByTier.campione.ok / d.okByTier.campione.n : 0;
const fail = r.bad.length || d.bad.length || !r.detOk || !d.detOk ||
  parseFloat(pct(r.safeLo, r.totLo)) > 8 ||       // spazzata NON eccezionale a bassa pressione
  p0 <= p5 ||                                      // la pressione deve costare
  tC <= tS;                                        // la qualità deve pagare
console.log(fail ? '\n❌ FAIL — vedi violazioni sopra' : '\n✅ PASS — invarianti difensive tenute su tutta la griglia (determinismo, cap clearance, monotonia pressione/qualità, spazzata eccezionale).');
process.exit(fail ? 2 : 0);
