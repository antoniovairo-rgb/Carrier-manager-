#!/usr/bin/env node
/* [giro 125 PO-328, SOLA MISURA] integrazione mirata ai COLPI DI TESTA: il flusso vero con politica casuale ne produce pochi (14 su 157).
   Scene d'angolo e di cross generate dal motore (scenaDalMotoreCross, come angolo-117) da occasioni a partenza varia (lontane e in area),
   TUTTE le azioni il cui deriveHL e' di testa, pagina nuova per ogni caso, GLB acceso. Lettura: __CPM_CONT121. Nessuna modifica a src/.
   Uso: CPM_ARM=acceso|spento CPM_OUT=file.json node distanze-125-testa.mjs */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
const ARM = process.env.CPM_ARM || 'acceso', OUT = process.env.CPM_OUT || `/tmp/d125-testa-${ARM}.json`, GLB = process.env.CPM_GLB !== '0';
const POS = [[48, 50], [58, 22], [66, 36], [78, 50], [90, 54], [82, 70]];
const CASI = []; for (const tipo of ['angolo', 'cross']) POS.forEach((p, i) => CASI.push({ tipo, x: p[0], y: p[1], s0: 1 + i * 37 + (tipo === 'cross' ? 500 : 0) }));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const out = [];
for (const caso of CASI) {
  const probe = async (kIdx) => {
    const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
    await page.addInitScript(([r, glb]) => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = !!glb; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1;
      if (r === 'spento') { window.__CPM_NO_G117A = 1; window.__CPM_NO_G119P = 1; window.__CPM_NO_G121H = 1; window.__CPM_NO_G121C = 1; window.__CPM_NO_G121M = 1; } }, [ARM, GLB]);
    await openMatch(page, port, { skipLoadAll: true, name: 'Testa 125' }); await sleep(1500);
    if (GLB) await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
    const pr = await page.evaluate(({ caso, kIdx }) => { const C = { ricevente: { nome: 'Leo SPENCER' }, difensore: { nome: 'Max BAILEY' }, portiere: { nome: 'Ian CARR' }, crossatore: { nome: 'Tom HOWARD' } }, P = { stats: {}, foot: 'R' };
      for (let SEED = caso.s0; SEED < caso.s0 + 400; SEED++) { const s = scenaDalMotoreCross({ tipo: caso.tipo, zona: 'area', x: caso.x, y: caso.y, press: 0.8, liberi: 0, cast: C, origine: { kind: caso.tipo } }, P, SEED); if (!s) continue;
        const hs = s.actions.map((a, k) => ({ k, h: deriveHL(s, a) || {} })).filter(o => o.h.type === 'header'); if (hs.length <= kIdx) return { nact: hs.length };
        SITUATIONS.push(s); return { gi: SITUATIONS.length - 1, k: hs[kIdx].k, seed: SEED, nact: hs.length, label: s.actions[hs[kIdx].k].label, variant: hs[kIdx].h.variant, text: s.text }; } return null; }, { caso, kIdx });
    if (!pr || pr.gi == null) { await page.close(); return pr; }
    await page.evaluate(gi => { window.__CPM_CONT121 = []; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, pr.gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {}); await sleep(700);
    await page.evaluate(({ k }) => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, { k: pr.k });
    for (let w = 0; w < 60; w++) { await sleep(250); const f = await page.evaluate(() => ({ n: (window.__CPM_CONT121 || []).length, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null })); if (f.n && f.ph !== 'hl_result') break; }
    const L = await page.evaluate(() => (window.__CPM_CONT121 || []).slice()); await page.close();
    const c = L.find(x => x.act === 'header') || L[0] || null; return { ...pr, c, n: L.length };
  };
  for (let kIdx = 0; kIdx < 2; kIdx++) { let r; try { r = await probe(kIdx); } catch (e) { r = { err: String(e).slice(0, 80) }; }
    if (!r || r.err || r.nact === 0 || (r.gi == null)) { if (r && r.err) console.log('ERR', caso.tipo, caso.x, caso.y, r.err); break; }
    out.push({ tipo: caso.tipo, x: caso.x, y: caso.y, ...r }); console.log(ARM, caso.tipo, caso.x, caso.y, 'k' + kIdx, r.variant, r.c ? `gx ${r.c.gx} z ${r.c.z} a ${r.c.a}` : 'senza contatto'); fs.writeFileSync(OUT, JSON.stringify(out)); }
}
await b.close(); srv.close(); console.log('scritto', OUT, out.length);
