#!/usr/bin/env node
/* [giro 60 — PO-218 «esiti bugiardi», residui L1-bis] GUARDIANO verde/rosso, sola ENUMERAZIONE sul motore vero (nessuna partita giocata).
   A · LA SCENA DIFENSIVA NON E' UN TIRO DELL'EROE (rosso __CPM_NO_DIF60). Per ogni azione delle situations difensive (type 'def') il cui
       gesto non e' un contrasto (deriveHL: header/cross), riuscita (chiave = premio) e fallita (chiave = fail), il motore non deve
       scrivere un tiro dell'eroe, un cross dell'eroe ne' il rammarico sulla riuscita.
       MISURATO prima (censimento esiti-241 CPM_DIF=1, scene forzate GLB acceso): gi36/gi44 «Muro invalicabile» / «SALVATO!» riusciti ->
       tiro:saved dell'eroe + parata + rammarico; gi136 cross difensivo fallito -> «cross, fuori» dell'eroe.
   B · LO STACCO CHE RECUPERA, SE FALLISCE, E' UN DUELLO AEREO PERSO (rosso __CPM_NO_STACCO60). Scena forzata gi126/1 «Stacco difensivo
       deciso» (premio recupero), esito fallito naturale, GLB acceso, pagina nuova: il riquadro non parla di tiro/parata e nel 3D il
       portiere avversario non fa gesti. MISURATO prima (censimento): 2/2 «Tentativo respinto — Tiro debole, para comodo», gk_block/gk_dive.
   VERDE: A 0 azioni sbagliate su >=3, B 0/2. ROSSO: A >=1, B >=1/2.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node esiti-60.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { catTesto } from './lib/esiti-241.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) {
  const page = await b.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_DIF60 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Esiti60' });
  await page.waitForFunction(() => typeof creaMotorePossesso === 'function' && typeof deriveHL === 'function', null, { timeout: 60000 });
  esito[rosso ? 'rosso' : 'verde'] = await page.evaluate(() => {
    const A = { n: 0, bad: 0, es: [] };
    SITUATIONS.forEach((s, gi) => { if (s.type !== 'def') return; (s.actions || []).forEach((a, k) => {
      let h = {}; try { h = deriveHL(s, a) || {}; } catch (e) {} if (!h.type || h.type === 'tackle') return;
      for (const ok of [true, false]) {
        const M = creaMotorePossesso({ giocatori: [], eroe: { name: 'EROE', x: 25, y: 50 }, seed: 7 + gi });
        const key = ok ? (a.rew || 'save') : (a.fail || 'goal_against');
        let ev = []; try { ev = M.risolviEroe.eventi(key, { tipo: h.type, variante: h.variant || '', rew: a.rew || '', ok, cast: {}, def: true, outKind: ok ? null : 'blocked' }); } catch (e) { ev = [{ t: 'ERRORE ' + e.message }]; }
        A.n++; const eroe = e => e.chi && /EROE/.test(e.chi.nome || ''); const sb = ev.filter(e => (e.t === 'tiro' && eroe(e)) || (e.t === 'cross') || (e.t === 'parata') || (ok && e.t === 'rammarico') || /^ERRORE/.test(e.t));
        if (sb.length) { A.bad++; if (A.es.length < 4) A.es.push(`gi${gi}/${k} ${h.type} ${ok ? 'riuscita' : 'fallita'} «${a.label}»: ${ev.map(e => e.t + (e.esito ? ':' + e.esito : '')).join('+')}`); }
      } }); });
    return { A };
  });
  await page.close();
  const B = { n: 0, bad: 0, es: [] };
  for (let rip = 0; rip < 2; rip++) {
    const p2 = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p2);
    await p2.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_V241 = {}; if (r) window.__CPM_NO_STACCO60 = 1; }, rosso);
    await openMatch(p2, port, { skipLoadAll: true, name: 'Esiti60' });
    await p2.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7, policy: 'seeded', tickMs: 300 }));
    await p2.waitForFunction(() => window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ() && typeof window.__CPM_FORCE_SIT === 'function', null, { timeout: 90000 }).catch(() => {});
    await p2.evaluate(() => window.__CPM_AUTOPLAY(false));
    await p2.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
    await p2.evaluate(() => window.__CPM_FORCE_SIT((126 + 61) % SITUATIONS.length, true)); await sleep(1500);
    await p2.evaluate(() => window.__CPM_FORCE_SIT(126, true)); await sleep(2500);
    const lab = await p2.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_V241 = {}; const s = SITUATIONS[126]; window.__CPM_RESOLVE(1); return s && s.actions[1] ? s.actions[1].label : null; });
    const tR = Date.now(); let s0 = null;
    while (Date.now() - tR < 40000) { await sleep(400); const s = await p2.evaluate(() => (typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null)).catch(() => null); if (s != null) { if (s0 == null) s0 = s; if (s - s0 >= 4) break; } }
    const r = await p2.evaluate(() => { const o = window.__CPM_OUTCOME || {}; const W = window.__CPM_V241 || {}; return { outKind: o.outKind || null, overlay: o.overlay || null, text: o.text || null, v: (W.all || []).slice(-1)[0] || null }; });
    await p2.close();
    if (!r.v || !/stacco/i.test(lab || '')) { B.es.push('non osservata: ' + lab); continue; }
    B.n++; const cat = new Set([...catTesto(r.overlay), ...catTesto(r.text)]); const gk = Object.keys(r.v.gk || {}).length > 0;
    const tiro = /tiro|para\b|parat|portiere/i.test((r.overlay || '') + ' ' + (r.text || ''));
    if (tiro || gk || cat.has('portiere')) B.bad++;
    B.es.push(`${r.outKind} «${r.overlay}» «${r.text}» gk ${JSON.stringify(Object.keys(r.v.gk || {}))}`);
  }
  esito[rosso ? 'rosso' : 'verde'].B = B;
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso; console.log('verde', JSON.stringify(V)); console.log('rosso', JSON.stringify(R));
const g = [];
if (V.A.n < 3) g.push(`A cieca: ${V.A.n} esecuzioni`); if (V.A.bad) g.push(`verde A: ${V.A.bad}/${V.A.n} scene difensive raccontate come tiro/cross dell'eroe`);
if (!R.A.bad) g.push('rosso A: il difetto non si vede spento (__CPM_NO_DIF60)');
if (V.B.n < 2) g.push(`B cieca: ${V.B.n}/2 scene osservate`); if (V.B.bad) g.push(`verde B: ${V.B.bad}/${V.B.n} stacchi falliti raccontati come tiro parato`);
if (R.B.n && !R.B.bad) g.push('rosso B: il difetto non si vede spento (__CPM_NO_STACCO60)');
if (g.length) { console.log('❌ esiti-60\n  · ' + g.join('\n  · ')); process.exit(1); }
console.log(`✅ esiti-60 verde (A 0/${V.A.n} · B 0/${V.B.n}) e il rosso si vede (A ${R.A.bad}/${R.A.n} · B ${R.B.bad}/${R.B.n})`);
