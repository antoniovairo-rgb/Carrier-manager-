#!/usr/bin/env node
/* [7.341] SETACCIO DELLE AZIONI — usa il rilevatore del taccuino di collaudo (draftBugNote, 7.339/7.340) come
   CACCIATORE DI BUG: forza ogni situation, ne risolve un'azione e legge cosa il gioco stesso dice di aver visto.
   Ne esce l'elenco OGGETTIVO delle azioni difettose, per classe di difetto — l'inverso del collaudo a mano.

   Uso:  node action-sweep.mjs                 (tutte le situations, esito fail)
         AS_OUT=success node action-sweep.mjs  (esito riuscito)
         AS_FROM=0 AS_TO=60 node action-sweep.mjs   (fetta, per girarlo in parallelo)
         AS_ACT=1 node action-sweep.mjs        (seconda azione invece della prima)
   Output: out/action-sweep-<esito>.json + riepilogo per classe a stdout. Non-gate: è uno strumento d'indagine. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUTCOME = process.env.AS_OUT || 'fail';
const ACT = +(process.env.AS_ACT || 0);
const FROM = +(process.env.AS_FROM || 0);
const TO = process.env.AS_TO ? +process.env.AS_TO : null;
/* [7.341.0] la finestra deve contenere TUTTA la scena: a 2600ms un gol subito non aveva ancora finito di
   entrare e la misura diceva «la palla non è mai arrivata in porta» su reti perfettamente regolari. */
const WAIT = +(process.env.AS_WAIT || 3400);

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(900);

const N = await page.evaluate(() => (window.__CPM_SITS || []).length);
const last = TO == null ? N : Math.min(TO, N);
console.log(`=== SETACCIO AZIONI · ${last - FROM} situations · esito ${OUTCOME} · azione #${ACT} ===`);

const rows = [];
for (let gi = FROM; gi < last; gi++) {
  const info = await page.evaluate((g) => {
    const s = (window.__CPM_SITS || [])[g]; if (!s) return null;
    let acts = s.actions || [];
    try { if (typeof window.filterSitActions === 'function') { const f = window.filterSitActions(acts, 50, s); if (Array.isArray(f) && f.length) acts = f; } } catch (e) {}/* firma reale: (actions, playerX, sit) */
    return { text: String(s.text || '').slice(0, 60), n: acts.length, labels: acts.map(a => String(a.label || '').slice(0, 34)) };
  }, gi);
  if (!info || !info.n) continue;
  const k = Math.min(ACT, info.n - 1);
  try {
    await page.evaluate(g => { window.__CPM_SWEEP_GI = g; window.__CPM_FORCE_SIT(g, true); }, gi); await sleep(750);
    await page.evaluate(() => { window.__CPM_FROZEN = false; }); await sleep(320);
    await page.evaluate(([kk, oo]) => { window.__CPM_FORCE_OUTCOME = oo; window.__CPM_RESOLVE(kk); }, [k, OUTCOME]);
    await sleep(WAIT);
    const r = await page.evaluate(() => {
      try {
        const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP();
        const st = window.__CPM_STATE ? window.__CPM_STATE() : null;
        const o = window.__CPM_OUTCOME || null;
        const sk = (window.__CPM_LAST_FORCED_GI != null) ? null : null;
        const _s = (window.__CPM_SITS || [])[window.__CPM_SWEEP_GI];
        const ctx = { out: o ? (o.outKey || o.outKind || null) : null, ok: o ? !!o.ok : null,
          intent: _s ? ((typeof window.deriveIntent === 'function' ? window.deriveIntent(_s, null) : null) || _s.it || null) : null,
          def: !!(_s && _s.type === 'def'), act: o ? (o.actionLabel || o.label || null) : null };
        /* la scena da analizzare è la PIÙ RECENTE con chiave valida: l'ultimo campione, a esito concluso, è
           già tornato in «playing» (chiave −1) e filtrando su quella si mescolavano periodi di scene diverse
           → falsi «pallone tornato indietro di 50 unità» e posizioni finali di un'altra azione. */
        if (snap && snap.samples.length) {
          let mx = -1; for (const q of snap.samples) if (q.sk > mx) mx = q.sk;
          if (mx >= 0) ctx.sceneKey = mx;
        }
        const draft = (typeof window.draftBugNote === 'function') ? window.draftBugNote(snap, ctx) : '';
        return { draft, out: ctx.out, ok: ctx.ok, act: ctx.act, ball: st ? [+st.ball.x.toFixed(1), +st.ball.y.toFixed(1)] : null };
      } catch (e) { return { draft: '', err: String(e.message).slice(0, 60) }; }
    });
    const lines = (r.draft || '').split('\n').filter(l => l.startsWith('· ')).map(l => l.slice(2));
    rows.push({ gi, sit: info.text, act: r.act || info.labels[k], out: r.out, ok: r.ok, ball: r.ball, flags: lines });
    if (lines.length) console.log(`gi${String(gi).padStart(3)} «${info.text}» [${r.act || info.labels[k]}]\n      ${lines.join('\n      ')}`);
  } catch (e) { rows.push({ gi, sit: info.text, err: String(e.message).slice(0, 80) }); }
}

/* riepilogo per CLASSE di difetto */
const CLASSES = [
  ['indietro', /tornato INDIETRO/], ['teletrasporto', /teletrasporto/], ['palla ferma', /rimasta FERMA/],
  ['fuori campo', /uscita dal campo/], ['nessun destinatario', /nessun compagno/], ['esito≠3D', /l'esito dichiarato/],
];
const flagged = rows.filter(r => r.flags && r.flags.length);
console.log(`\n=== RIEPILOGO · ${flagged.length}/${rows.length} azioni con anomalie ===`);
for (const [name, rx] of CLASSES) {
  const hit = rows.filter(r => (r.flags || []).some(f => rx.test(f)));
  if (hit.length) console.log(`${String(hit.length).padStart(3)} × ${name}: gi ${hit.slice(0, 14).map(h => h.gi).join(', ')}${hit.length > 14 ? '…' : ''}`);
}
if (errs.length) console.log('pageerror: ' + errs.slice(0, 3).join(' | '));
try { mkdirSync('out', { recursive: true }); } catch (e) {}
writeFileSync(`out/action-sweep-${OUTCOME}${ACT ? '-a' + ACT : ''}${FROM || TO ? `-${FROM}_${last}` : ''}.json`,
  JSON.stringify({ outcome: OUTCOME, act: ACT, from: FROM, to: last, total: rows.length, flagged: flagged.length, rows }, null, 1));
console.log(`\n→ out/action-sweep-${OUTCOME}.json`);
await browser.close(); srv.close();
