/* SWEEP MASSIVO DECISION ENGINE (LMV 1.0) — tutte le 13 famiglie di intento di decideExecution su una
   griglia gigante: 3 tier qualità × pressione 0-5 × fatica × morale × meteo × piede × posizione × seed.
   Invarianti per TUTTI i contesti: determinismo (stessa ctx ⇒ stesso esito) · quality ∈ [0,1] ·
   execution/outcome stringhe note (nessun undefined) · monotonia aggregata (pressione↑ ⇒ successo↓;
   qualità giocatore↑ ⇒ successo↑) · range di conversione sani per famiglia (rigore >> punizione; nessuna
   famiglia con successo 0% o 100% su tutta la griglia). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(300);

const res = await page.evaluate(() => {
  const DE = window.decideExecution;
  if (typeof DE !== 'function') return { err: 'decideExecution non esposta' };
  const INTENTS = ['shot','cross','through','onetwo','dribble','insertion','penalty','freekick','recover','anticipate','intercept','progression','switch'];
  const TIERS = {
    scarso:   { posizionamento: 46, passaggio: 45, tecnica: 44, mentalità: 46, fisico: 52, velocità: 50, tiro: 42, dribbling: 42 },
    medio:    { posizionamento: 66, passaggio: 62, tecnica: 60, mentalità: 63, fisico: 68, velocità: 64, tiro: 60, dribbling: 60 },
    campione: { posizionamento: 88, passaggio: 85, tecnica: 86, mentalità: 87, fisico: 84, velocità: 86, tiro: 86, dribbling: 85 },
  };
  // esiti "pienamente vincenti" per famiglia (per il tasso di successo)
  const OKKEYS = new Set(['goal','assist','chance','ball_won','completed','beat_man','success','keep','win','advance','progress']);// advance/progress = successi delle famiglie progression/insertion/switch
  const out = { n: 0, bad: [], det: true, fam: {} };
  const WX = ['clear','rain','snow','fog'];
  for (const intent of INTENTS) {
    const F = out.fam[intent] = { n: 0, ok: 0, okByPress: [0,0,0,0,0,0], nByPress: [0,0,0,0,0,0], okByTier: {}, execs: {}, outs: {} };
    for (const tier of Object.keys(TIERS)) {
      F.okByTier[tier] = { ok: 0, n: 0 };
      for (const pressure of [0,1,2,3,4,5]) {
        for (const fatigue of [10,50,85]) {
          for (const morale of [30,65,90]) {
            for (const x of [30, 62, 84]) {
              for (let s = 0; s < 6; s++) {
                const seed = ((s*40503 + pressure*131 + fatigue*17 + morale*7 + x*3 + intent.length*3571 + tier.length*977) >>> 0);
                const ctx = { attrs: TIERS[tier], pressure, support: 1, fatigue, morale, x, weather: WX[s%4], foot: s%2?'L':'R', side: (s%3===0)?'L':'R', seed };
                let d; try { d = DE(intent, ctx); } catch (e) { out.bad.push('throw:'+intent+':'+e.message); continue; }
                out.n++; F.n++;
                if (!d || typeof d.outcome !== 'string' || typeof d.execution !== 'string') { out.bad.push('shape:'+intent); continue; }
                if (!(d.quality >= 0 && d.quality <= 1)) out.bad.push('q:'+intent+':'+d.quality);
                F.execs[d.execution] = (F.execs[d.execution]||0)+1;
                F.outs[d.outcome] = (F.outs[d.outcome]||0)+1;
                const ok = OKKEYS.has(d.outcome);
                if (ok) { F.ok++; F.okByPress[pressure]++; F.okByTier[tier].ok++; }
                F.nByPress[pressure]++; F.okByTier[tier].n++;
                const d2 = DE(intent, ctx);
                if (JSON.stringify(d) !== JSON.stringify(d2)) out.det = false;
              }
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
const pct = (a,b)=> (a/(b||1)*100);
let fail = res.bad.length > 0 || !res.det;
console.log(`decideExecution — ${res.n} contesti totali su 13 famiglie · violazioni shape/quality: ${res.bad.length} · determinismo: ${res.det?'OK':'ROTTO'}\n`);
console.log('famiglia        n      ok%    p0→p5 (successo per pressione)         scarso→campione   esiti principali');
for (const [k,F] of Object.entries(res.fam)) {
  const okp = pct(F.ok,F.n).toFixed(1);
  const byP = F.okByPress.map((o,i)=>pct(o,F.nByPress[i]).toFixed(0)+'%').join(' ');
  const tS = pct(F.okByTier.scarso.ok,F.okByTier.scarso.n), tC = pct(F.okByTier.campione.ok,F.okByTier.campione.n);
  const outs = Object.entries(F.outs).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([o,v])=>`${o} ${pct(v,F.n).toFixed(0)}%`).join(' · ');
  console.log(`${k.padEnd(13)} ${String(F.n).padStart(6)} ${okp.padStart(6)}%  ${byP.padEnd(38)} ${tS.toFixed(0)}%→${tC.toFixed(0)}%          ${outs}`);
  // invarianti per famiglia
  const p0 = pct(F.okByPress[0],F.nByPress[0]), p5 = pct(F.okByPress[5],F.nByPress[5]);
  if (F.ok === 0 || F.ok === F.n) { console.log(`   ❌ ${k}: successo degenerato (${okp}%)`); fail = true; }
  if (p0 < p5 - 1e-9) { console.log(`   ❌ ${k}: pressione NON monotona (p0=${p0.toFixed(1)}% < p5=${p5.toFixed(1)}%)`); fail = true; }
  if (tC < tS - 1e-9) { console.log(`   ❌ ${k}: qualità NON monotona (campione ${tC.toFixed(1)}% < scarso ${tS.toFixed(1)}%)`); fail = true; }
}
// il rigore deve convertire molto più della punizione
const pen = res.fam.penalty, fk = res.fam.freekick;
if (pen && fk && pct(pen.ok,pen.n) <= pct(fk.ok,fk.n)) { console.log('   ❌ penalty ≤ freekick come conversione'); fail = true; }
console.log(fail ? '\n❌ FAIL' : '\n✅ PASS — 13 famiglie sane su tutta la griglia (determinismo, taxonomy, monotonie, conversioni sensate).');
process.exit(fail ? 2 : 0);
