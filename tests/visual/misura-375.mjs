#!/usr/bin/env node
/* [giro 375 PO-637] sonda: BARRIERA DELLE PUNIZIONI, letta dai CORPI. Per ogni scena di punizione (catalogo SITUATIONS col
   tipo «punizione» + scene costruite dal motore da punti di fallo diversi) apre la scena col teatro acceso (__CPM_PRESENT +
   __CPM_CINE, GLB acceso) e legge dal testimone __CPM_PUN343 (src/12) pallone e corpi della barriera nel mondo (1 u = 1 m:
   il cerchio di centrocampo ha raggio 9,15). Misura: distanza centro-barriera/pallone, scarto del centro dalla linea
   pallone -> centro porta (48,6 · 0), distanza del piu' vicino. Uso: node misura-375.mjs [rosso]   (rosso = __CPM_NO_G375) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
export async function misura375(b, port, rosso, log = console.log) {
  const pg = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(pg);
  await pg.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PUN343 = []; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; if (r) window.__CPM_NO_G375 = 1; }, rosso);
  await openMatch(pg, port, { skipLoadAll: true, name: 'Bar375' }); await sleep(800);
  await pg.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  const cat = await pg.evaluate(() => SITUATIONS.map((s, i) => ({ i, ok: /punizion/i.test(s.text || '') || s.intent === 'freekick' })).filter(q => q.ok).map(q => q.i));
  const PUNTI = [[79, 50], [80.5, 38], [78, 64], [74, 30], [72, 72]];
  const motore = await pg.evaluate((PU) => PU.map(([x, y]) => { try { const sit = scenaDalMotorePiazzato({ tipo: 'punizione', x, y, cast: {} }, { name: 'Validator', stats: { tiro: 70, tecnica: 70, passaggio: 70 }, ovr: 70 }, 7);
    if (!sit) return null; const z = sit.startZone; return { idx: SITUATIONS.push(sit) - 1, pos: { x: z.x[1], y: Math.round((z.y[0] + z.y[1]) / 2 * 10) / 10 } }; } catch (e) { return null; } }).filter(Boolean), PUNTI);
  const scene = [...cat.map(i => ({ idx: i, pos: null })), ...motore];
  const out = [];
  for (const sc of scene) {
    await pg.evaluate(([i, p]) => { window.__CPM_PUN343.length = 0; window.__CPM_FORCE_SIT(i, true, p || undefined); window.__CPM_FROZEN = false; }, [sc.idx, sc.pos]);
    await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 20000 }).catch(() => {});
    await sleep(+(process.env.CPM_ATTESA375 || 3600));
    const w = await pg.evaluate(() => { const W = window.__CPM_PUN343; const r = W.length ? JSON.parse(JSON.stringify(W[W.length - 1])) : null; if (r) r.tg = (window.__CPM_MUR72 || []).map(t => [+((t.x + (t.rx || 0)) - 50).toFixed(2), +(((t.y + (t.ry || 0)) - 50) * 0.68).toFixed(2)]); return r; });
    if (!w || !w.pm || !w.pm.length) { out.push({ idx: sc.idx, ng: w ? 'barriera assente' : 'non punizione' }); continue; }
    const gx = 48.6, gz = 0, dx = gx - w.x, dz = gz - w.z, dn = Math.hypot(dx, dz) || 1, ux = dx / dn, uz = dz / dn;
    const cx = w.pm.reduce((a, q) => a + q[0], 0) / w.pm.length, cz = w.pm.reduce((a, q) => a + q[1], 0) / w.pm.length;
    const lungo = (cx - w.x) * ux + (cz - w.z) * uz, lato = Math.abs((cx - w.x) * uz - (cz - w.z) * ux);
    const dist = w.pm.map(q => Math.hypot(q[0] - w.x, q[1] - w.z));
    const lati = w.pm.map(q => Math.abs((q[0] - w.x) * uz - (q[1] - w.z) * ux));
    out.push({ idx: sc.idx, n: w.pm.length, centro: +Math.hypot(cx - w.x, cz - w.z).toFixed(2), lungo: +lungo.toFixed(2), lato: +lato.toFixed(2), min: +Math.min(...dist).toFixed(2), max: +Math.max(...dist).toFixed(2), latoMax: +Math.max(...lati).toFixed(2), ball: [w.x, w.z], tg: (w.tg || []).map(q => +Math.hypot(q[0] - w.x, q[1] - w.z).toFixed(1)) });
  }
  await pg.close();
  for (const o of out) log(o.ng ? `  gi${o.idx}: NON GIUDICATA (${o.ng})` : `  gi${o.idx}: ${o.n} in barriera · centro a ${o.centro} m (lungo la linea ${o.lungo}) · scarto dalla linea ${o.lato} m · corpi fra ${o.min} e ${o.max} m · pallone ${o.ball.join(',')} · bersagli a ${o.tg.join('/')}`);
  return out;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const b = await launchBrowser();
  await misura375(b, srv.address().port, process.argv[2] === 'rosso');
  await b.close(); srv.close();
}
