/* [STRUMENTO] L'OCCASIONE FINISCE IN PARATA, E IL PORTIERE SI TUFFA DAVVERO?
   Due domande separate, perche' sono due sistemi: (a) la macchina delle occasioni si arma e arriva fino
   alla riga che NOMINA il portiere? (b) il renderer esegue il tuffo che quella riga chiede?
   Un testo che promette una parata e un portiere che resta in piedi sarebbe peggio di niente. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const out = [];
for (const seme of [7300, 8100, 9200]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const rossi = (process.env.CPM_ROSSO || '').split(',').map(x => x.trim()).filter(Boolean);
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; for (const k of r) window['__CPM_NO' + k] = true; }, rossi);
  await openMatch(page, port, { skipLoadAll: true, name: 'Pa' });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seme);
  let why = {};
  /* [7.702] IL FLIPPER RESO NUMERO — collaudo PO: «ping pong di 4-5 volte tra il portiere e un
     avversario». Nei ~6 secondi dopo OGNI riga di parata si conta quante volte il pallone inverte il
     verso sull'asse lungo con passi >3u. Con la palla morta armata alla chiusura deve stare a ~zero. */
  let parPrev = 0, codaPP = 0, bxPrev = null, dPrev = 0; const pingpong = [];
  let ppCur = null;
  for (let k = 0; k < 900; k++) {
    await sleep(250);
    const r = await page.evaluate(() => { try {
      const st = window.__CPM_STATE && window.__CPM_STATE();
      return { w: window.__CPM_SAL689_WHY || null, c: st ? st.clock : null,
               bx: st && st.ball ? st.ball.x : null,
               par: (window.__CPM_OCC695 && window.__CPM_OCC695.parate) || 0 };
    } catch (_e) { return null; } });
    if (!r) continue;
    if (r.w) why[r.w] = (why[r.w] || 0) + 1;
    if (r.par > parPrev) { parPrev = r.par; codaPP = 24; ppCur = { inv: 0 }; bxPrev = r.bx; dPrev = 0; }
    else if (codaPP > 0 && r.bx != null) {
      const d = bxPrev != null ? r.bx - bxPrev : 0; bxPrev = r.bx;
      if (Math.abs(d) > 3) { if (dPrev && Math.sign(d) !== Math.sign(dPrev)) ppCur.inv++; dPrev = d; }
      if (--codaPP === 0 && ppCur) { pingpong.push(ppCur.inv); ppCur = null; }
    }
    if (r.c != null && r.c >= 89) break;
  }
  if (ppCur) pingpong.push(ppCur.inv);
  const w = await page.evaluate(() => ({ occ: window.__CPM_OCC695 || null, gk: window.__CPM_GK695 || null,
    tiri: ((window.__CPM_EV && window.__CPM_EV()) || []).filter(e => e.ev === 'chronicle' && (e.shots || e.oppShots)).length,
    gol: ((window.__CPM_EV && window.__CPM_EV()) || []).filter(e => e.ev === 'goal').length }));
  out.push({ seme, ...w, why, pingpong });
  await ctx.close();
}
await b.close(); srv.close();
console.log('\n=== L\'OCCASIONE FINISCE IN PARATA? ===\n');
let A = 0, P = 0, T = 0;
for (const o of out) {
  const a = (o.occ && o.occ.armate) || 0, p = (o.occ && o.occ.parate) || 0, t = (o.gk && o.gk.tuffi) || 0;
  A += a; P += p; T += t;
  console.log(`  seme ${o.seme} · occasioni armate ${a} · righe di parata ${p} · TUFFI nel 3D ${t} · tiri ${o.tiri} · gol ${o.gol} · finestre ${JSON.stringify(o.why)}`);
}
console.log(`\n  totale: ${A} occasioni armate · ${P} arrivate alla parata (${A ? Math.round(P / A * 100) : 0}%) · ${T} tuffi eseguiti`);
console.log(`  testo e gesto coincidono: ${P === T ? 'SI' : `NO — ${P} righe contro ${T} tuffi`}`);
const pp = out.flatMap(o => o.pingpong || []);
console.log(`  FLIPPER dopo la parata (inversioni >3u nei 6s): ${pp.length ? pp.join(' · ') : '—'}  (atteso ~0 con la palla morta)`);
console.log('');
