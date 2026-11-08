#!/usr/bin/env node
/* [giro 117 PO-323 «Calcio d'angolo di HOWARD: attacca il pallone! · Stacco in corsa potente → miss · corpo↔porta al contatto 159°,
   eroe a x -2.1 · troppo distante»] GUARDIANO GLB-ON sulle scene d'ANGOLO e di CROSS generate dal motore (scenaDalMotoreCross), su
   PAGINA NUOVA per ogni caso (lezione 7.483). Casi: occasione dichiarata lontano dall'area (centrocampo, come nella nota del PO) e
   dentro l'area; i due lati del campo (y<50 → bandierina 2,5 · y>50 → bandierina 97,5); esito riuscito e fallito; semi diversi.
   Misura dal testimone __CPM_CONT121 (giro 121: il fotogramma in cui l'arco del colpo PARTE; prima __CPM_CONT53, instabile) al contatto: angolo corpo↔porta, distanza eroe↔pallone, distanza eroe↔linea di
   porta (3D, linea a 48,6).
   VERDE: su tutti i casi angolo ≤ 35° (la soglia del testimone), porta ≤ 10,5 u (il dischetto: 11 m = 10,5 u — si stacca in area,
   fra il dischetto e la porta) e pallone ≤ 1,0 u dall'eroe. Soglie fissate DOPO la misura (giro 117, 8 casi verdi): porta 4,5-6,6 u,
   pallone 0,1-0,5 u; nel rosso porta 31-40 u e pallone fino a 2,0 u. Ciascuna soglia sta a meta' strada o oltre il doppio del verde.
   ROSSO (__CPM_NO_G117A): sui casi lontani l'eroe stacca a ≥ 25 u dalla porta (la nota del PO), il guardiano deve vederlo.
   ROSSO g121 (giro 121): __CPM_NO_G121H+__CPM_NO_G121C sui casi in area, l'eroe al contatto deve risultare girato oltre 35°.
   Uso: node angolo-117.mjs · CPM_SOLO=verde|rosso|g121 · CPM_CASI=k1,k2 */
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
const SOGLIA = { ang: 35, porta: 10.5, palla: 1.0, rossoPorta: 25 };
const CASI = [
  { k: 'angolo-centro-dx-fail', tipo: 'angolo', x: 48, y: 50, out: 'fail', s0: 1, lontano: 1 },
  { k: 'angolo-centro-dx-ok', tipo: 'angolo', x: 48, y: 50, out: 'success', s0: 1, lontano: 1 },
  { k: 'angolo-lato-basso-fail', tipo: 'angolo', x: 58, y: 22, out: 'fail', s0: 40, lontano: 1 },
  { k: 'angolo-lato-alto-fail', tipo: 'angolo', x: 55, y: 80, out: 'fail', s0: 90, lontano: 1 },
  { k: 'angolo-lato-alto-ok', tipo: 'angolo', x: 55, y: 80, out: 'success', s0: 150, lontano: 1 },
  { k: 'angolo-area-fail', tipo: 'angolo', x: 90, y: 54, out: 'fail', s0: 1, lontano: 0 },
  { k: 'angolo-area-basso-ok', tipo: 'angolo', x: 89, y: 44, out: 'success', s0: 200, lontano: 0 },
  { k: 'cross-lontano-fail', tipo: 'cross', x: 62, y: 30, out: 'fail', s0: 60, lontano: 1 },
];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const solo = process.env.CPM_SOLO || ''; const esito = { verde: [], rosso: [], g121: [] };
/* [giro 121] tre bracci: verde · rosso (__CPM_NO_G117A, casi lontani) · g121 (__CPM_NO_G121H + __CPM_NO_G121C, casi in area: il colpo di
   testa muore prima del contatto e l'eroe stacca girato — misurato 136-146° al contatto vero). */
for (const braccio of ['verde', 'rosso', 'g121']) {
  if (solo && solo !== braccio) continue; const rosso = braccio === 'rosso';
  for (const caso of CASI) {
    if (braccio === 'g121' && caso.lontano) continue;
    if (process.env.CPM_CASI && !process.env.CPM_CASI.split(',').includes(caso.k)) continue;
    if (rosso && !caso.lontano) continue;
    const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
    await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1; if (r === 'rosso') window.__CPM_NO_G117A = 1; if (r === 'g121') { window.__CPM_NO_G121H = 1; window.__CPM_NO_G121C = 1; } }, braccio);
    await openMatch(page, port, { skipLoadAll: true, name: 'Angolo 117' }); await sleep(1500);
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
    const pr = await page.evaluate(({ caso }) => { const C = { ricevente: { nome: 'Leo SPENCER' }, difensore: { nome: 'Max BAILEY' }, portiere: { nome: 'Ian CARR' }, crossatore: { nome: 'Tom HOWARD' } }, P = { stats: {}, foot: 'R' };
      for (let SEED = caso.s0; SEED < caso.s0 + 400; SEED++) { const s = scenaDalMotoreCross({ tipo: caso.tipo, zona: 'area', x: caso.x, y: caso.y, press: 0.8, liberi: 0, cast: C, origine: { kind: caso.tipo } }, P, SEED); if (!s) continue;
        const k = s.actions.findIndex(a => /Stacco in corsa/.test(a.label)); if (k < 0) continue;
        SITUATIONS.push(s); return { gi: SITUATIONS.length - 1, k, seed: SEED, text: s.text, tipoHL: (deriveHL(s, s.actions[k]) || {}).type }; } return null; }, { caso });
    if (!pr) { esito[braccio].push({ k: caso.k, err: 'scena non generata' }); await page.close(); continue; }
    await page.evaluate(gi => { window.__CPM_CONT53 = []; window.__CPM_CONT121 = []; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, pr.gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(700);
    await page.evaluate(({ k, out }) => { window.__CPM_FORCE_OUTCOME = out; window.__CPM_RESOLVE(k); }, { k: pr.k, out: caso.out });
    /* [giro 121] il contatto si legge da __CPM_CONT121 (fotogramma in cui l'arco PARTE, pallone sull'origine), non da CONT53 (primo
       fotogramma con T>=0, che cade anche nell'attesa del colpo di testa). Si attende l'uscita da hl_result (evento, non tempo fisso:
       PROCESSO «Controlli instabili»), poi si prende il contatto del gesto di testa dell'eroe; CONT53 resta stampato per confronto. */
    for (let w = 0; w < 60; w++) { await sleep(250); const f = await page.evaluate(() => { const L = window.__CPM_CONT121 || []; return { n: L.length, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null }; }); if (f.n && f.ph !== 'hl_result') break; }
    const tutti = await page.evaluate(() => ({ c121: (window.__CPM_CONT121 || []).slice(), c53: (window.__CPM_CONT53 || []).slice(-1)[0] || null }));
    const c = tutti.c121.find(x => x.act === 'header') || tutti.c121.find(x => !x.bg) || tutti.c121[0] || null;
    const r = { k: caso.k, seed: pr.seed, hl: pr.tipoHL, ang: c ? c.a : null, palla: c ? c.db : null, porta: c ? c.gx : null, z: c ? c.z : null, lontano: caso.lontano, at: c ? c.at : null, tgt: c ? [c.tx, c.tz] : null, archi: tutti.c121.map(x => `${x.act}/${x.bg}:${x.db}`).join(' '), c53: tutti.c53 ? { a: tutti.c53.a, db: tutti.c53.db, gx: tutti.c53.gx } : null };
    esito[braccio].push(r); console.log(braccio + ' ' + JSON.stringify(r)); await page.close();
  }
}
await b.close(); srv.close();
const g = [];
if (!solo || solo === 'verde') {
  const V = esito.verde; if (V.length !== CASI.length) g.push('verde: casi non giudicati ' + (CASI.length - V.length));
  for (const r of V) {
    if (r.err || r.ang == null) { g.push('verde: non giudicato (contatto mai registrato) ' + r.k); continue; }
    if (!/header/.test(r.archi || '')) g.push(`verde: ${r.k} non giudicato: nessun arco col gesto di testa (${r.archi})`);
    if (r.ang > SOGLIA.ang) g.push(`verde: ${r.k} girato ${r.ang}° > ${SOGLIA.ang}°`);
    if (r.porta > SOGLIA.porta) g.push(`verde: ${r.k} stacca a ${r.porta} u dalla porta > ${SOGLIA.porta}`);
    if (r.palla > SOGLIA.palla) g.push(`verde: ${r.k} pallone a ${r.palla} u dall'eroe al contatto > ${SOGLIA.palla}`);
  }
  const gir = V.filter(r => r.ang != null && r.ang > SOGLIA.ang).length; console.log(`VERDE: ${V.length} casi · girati ${gir} · porta max ${Math.max(...V.map(r => r.porta || 0))} u · pallone max ${Math.max(...V.map(r => r.palla || 0))} u`);
}
if (!solo || solo === 'rosso') {
  const R = esito.rosso; const visti = R.filter(r => r.porta != null && r.porta >= SOGLIA.rossoPorta).length;
  console.log(`ROSSO (__CPM_NO_G117A): ${R.length} casi lontani · lontani dalla porta (≥${SOGLIA.rossoPorta} u) ${visti}`);
  if (R.length === 0 || visti !== R.length) g.push('rosso: il difetto non ricompare su tutti i casi lontani ' + JSON.stringify(R));
}
if (!solo || solo === 'g121') {
  const R = esito.g121; const visti = R.filter(r => r.ang != null && r.ang > SOGLIA.ang).length;
  console.log(`ROSSO (__CPM_NO_G121H+__CPM_NO_G121C): ${R.length} casi in area · girati (>${SOGLIA.ang}°) ${visti}`);
  if (R.length === 0 || visti !== R.length) g.push('rosso g121: l\'eroe girato al contatto non ricompare su tutti i casi in area ' + JSON.stringify(R));
}
if (g.length) { console.log('❌ angolo-117'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ angolo-117 verde (e il rosso si vede)');
