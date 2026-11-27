#!/usr/bin/env node
/* [giro 419, PO-682] SONDA (non guardiano): colpi di testa dell'eroe da ANGOLO e da CROSS costruiti dal motore (scenaDalMotoreCross),
   GLB ACCESO, teatro acceso, PAGINA NUOVA per caso (lezione 7.483). Per ogni caso: angolo corpo↔porta al contatto da DUE testimoni
   (__CPM_CONT121 = fotogramma in cui l'arco del colpo parte; __CPM_CONT53 = quello che scrive la bozza del taccuino), distanza dalla
   porta e dal pallone, gesto montato. Uso: node misura-419.mjs · CPM_LAB=regex · CPM_ROSSO=__CPM_NO_G419 · CPM_CASI=k1,k2 */
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
export const CASI419 = [
  { k: 'angolo-dx-fail', tipo: 'angolo', x: 90, y: 54, out: 'fail', s0: 1 },
  { k: 'angolo-dx-ok', tipo: 'angolo', x: 90, y: 58, out: 'success', s0: 30 },
  { k: 'angolo-sx-fail', tipo: 'angolo', x: 89, y: 42, out: 'fail', s0: 60 },
  { k: 'angolo-sx-ok', tipo: 'angolo', x: 91, y: 44, out: 'success', s0: 90 },
  { k: 'angolo-lontano-fail', tipo: 'angolo', x: 55, y: 70, out: 'fail', s0: 120 },
  { k: 'cross-dx-fail', tipo: 'cross', x: 90, y: 56, out: 'fail', s0: 150 },
  { k: 'cross-sx-ok', tipo: 'cross', x: 90, y: 44, out: 'success', s0: 180 },
  { k: 'cross-sx-fail', tipo: 'cross', x: 88, y: 40, out: 'fail', s0: 210 },
];
export async function caso419(b, port, caso, { lab = /Testa di potenza/, rosso = [], orig = true, foto = null } = {}) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: foto ? 2 : 1 }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1; for (const f of r) window[f] = 1; }, rosso);
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Testa 419' }); await sleep(1500);
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
    const pr = await page.evaluate(({ caso, src }) => { const lab = new RegExp(src); const C = { ricevente: { nome: 'Leo SPENCER' }, difensore: { nome: 'Max BAILEY' }, portiere: { nome: 'Ian CARR' }, crossatore: { nome: 'Tom GUNTHER' } }, P = { stats: {}, foot: 'R' };
      for (let SEED = caso.s0; SEED < caso.s0 + 400; SEED++) { const s = scenaDalMotoreCross({ tipo: caso.tipo, zona: 'area', x: caso.x, y: caso.y, press: 0.8, liberi: 0, cast: C, origine: { kind: caso.tipo } }, P, SEED); if (!s) continue;
        const k = s.actions.findIndex(a => lab.test(a.label)); if (k < 0) continue;
        SITUATIONS.push(s); return { gi: SITUATIONS.length - 1, k, seed: SEED, text: s.text, lab: s.actions[k].label, hl: deriveHL(s, s.actions[k]) || {} }; } return null; }, { caso, src: lab.source });
    if (!pr) return { k: caso.k, err: 'scena non generata' };
    await page.evaluate(gi => { window.__CPM_CONT53 = []; window.__CPM_CONT121 = []; window.__CPM_ORIG26 = []; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, pr.gi);
    /* [giro 419] PERCORSO VERO: nel gioco l'angolo/cross del motore porta un'ORIGINE (_ORIG26, src/15): il pallone parte dalla bandierina
       (o dal crossatore) e vola sul corpo dell'eroe DOVE STA. Il banco forzato non la arma e misurava un'altra scena (l'eroe correva sul
       primo palo). La sonda la arma come fa src/15 (stessa forma dell'oggetto). */
    if (orig) await page.evaluate(({ gi, caso }) => { const ang = caso.tipo === 'angolo'; _ORIG26 = { sit: SITUATIONS[gi], kind: caso.tipo, at: ang ? 'corner' : 'wing', x: ang ? 97 : 88, y: ang ? (caso.y < 50 ? 2.5 : 97.5) : (caso.y < 50 ? 8 : 92), hl: 999, min: 20, active: true }; }, { gi: pr.gi, caso });
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(700);
    await page.evaluate(({ k, out }) => { window.__CPM_FORCE_OUTCOME = out; window.__CPM_RESOLVE(k); }, { k: pr.k, out: caso.out });
    /* foto (foto-419): la scena si ferma nel fotogramma in cui parte l'arco del colpo di testa, la foto non dipende dalla latenza dello scatto */
    if (foto) { const ok = await page.waitForFunction(() => { if ((window.__CPM_CONT121 || []).some(x => x.act === 'header')) { window.__CPM_FROZEN = true; return true; } return false; }, null, { timeout: 40000, polling: 'raf' }).catch(() => false);
      if (ok) { await sleep(500); await page.screenshot({ path: foto }); } await page.evaluate(() => { window.__CPM_FROZEN = false; }); }
    for (let w = 0; w < 60; w++) { await sleep(250); const f = await page.evaluate(() => ({ n: (window.__CPM_CONT121 || []).length, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null })); if (f.n && f.ph !== 'hl_result') break; }
    const T = await page.evaluate(() => ({ c121: (window.__CPM_CONT121 || []).slice(), c53: (window.__CPM_CONT53 || []).slice(), o26: (window.__CPM_ORIG26 || []).length }));
    const c = T.c121.find(x => x.act === 'header') || null; const c53 = T.c53.find(x => x.tipo) || T.c53[0] || null;
    return { k: caso.k, seed: pr.seed, lab: pr.lab, hl: pr.hl.type + '/' + pr.hl.variant, ang: c ? c.a : null, palla: c ? c.db : null, porta: c ? c.gx : null, x: c ? c.x : null, z: c ? c.z : null,
      a53: c53 ? c53.a : null, x53: c53 ? c53.x : null, z53: c53 ? c53.z : null, gx53: c53 ? c53.gx : null, o26: T.o26, archi: T.c121.map(x => `${x.act}/${x.bg}:${x.a}`).join(' ') };
  } catch (e) { return { k: caso.k, err: String(e && e.message).slice(0, 120) }; } finally { await page.close().catch(() => {}); }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const rosso = (process.env.CPM_ROSSO || '').split(',').filter(Boolean); const lab = new RegExp(process.env.CPM_LAB || 'Testa di potenza');
  const casi = CASI419.filter(c => !process.env.CPM_CASI || process.env.CPM_CASI.split(',').includes(c.k));
  for (let i = 0; i < casi.length; i += 2) { const R = await Promise.all(casi.slice(i, i + 2).map(c => caso419(b, port, c, { lab, rosso, orig: !process.env.CPM_SENZA_ORIG }))); for (const r of R) console.log(JSON.stringify(r)); }
  await b.close(); srv.close();
}
