#!/usr/bin/env node
/* [giro 117 PO-323 «Calcio d'angolo di HOWARD: attacca il pallone! · Stacco in corsa potente → miss · corpo↔porta al contatto 159°,
   eroe a x -2.1 · troppo distante»] GUARDIANO GLB-ON sulle scene d'ANGOLO e di CROSS generate dal motore (scenaDalMotoreCross), su
   PAGINA NUOVA per ogni caso (lezione 7.483). Casi: occasione dichiarata lontano dall'area (centrocampo, come nella nota del PO) e
   dentro l'area; i due lati del campo (y<50 → bandierina 2,5 · y>50 → bandierina 97,5); esito riuscito e fallito; semi diversi.
   Misura dal testimone __CPM_CONT53 nel fotogramma del contatto: angolo corpo↔porta, distanza eroe↔pallone, distanza eroe↔linea di
   porta (3D, linea a 48,6).
   VERDE: su tutti i casi angolo ≤ 35° (la soglia del testimone), porta ≤ 10,5 u (il dischetto: 11 m = 10,5 u — si stacca in area,
   fra il dischetto e la porta) e pallone ≤ 1,0 u dall'eroe. Soglie fissate DOPO la misura (giro 117, 8 casi verdi): porta 4,5-6,6 u,
   pallone 0,1-0,5 u; nel rosso porta 31-40 u e pallone fino a 2,0 u. Ciascuna soglia sta a meta' strada o oltre il doppio del verde.
   ROSSO (__CPM_NO_G117A): sui casi lontani l'eroe stacca a ≥ 25 u dalla porta (la nota del PO), il guardiano deve vederlo.
   Uso: node angolo-117.mjs · CPM_SOLO=verde|rosso */
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
const solo = process.env.CPM_SOLO || ''; const esito = { verde: [], rosso: [] };
for (const rosso of [false, true]) {
  if (solo && solo !== (rosso ? 'rosso' : 'verde')) continue;
  for (const caso of CASI) {
    if (rosso && !caso.lontano) continue;
    const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
    await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1; if (r) window.__CPM_NO_G117A = 1; }, rosso);
    await openMatch(page, port, { skipLoadAll: true, name: 'Angolo 117' }); await sleep(1500);
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
    const pr = await page.evaluate(({ caso }) => { const C = { ricevente: { nome: 'Leo SPENCER' }, difensore: { nome: 'Max BAILEY' }, portiere: { nome: 'Ian CARR' }, crossatore: { nome: 'Tom HOWARD' } }, P = { stats: {}, foot: 'R' };
      for (let SEED = caso.s0; SEED < caso.s0 + 400; SEED++) { const s = scenaDalMotoreCross({ tipo: caso.tipo, zona: 'area', x: caso.x, y: caso.y, press: 0.8, liberi: 0, cast: C, origine: { kind: caso.tipo } }, P, SEED); if (!s) continue;
        const k = s.actions.findIndex(a => /Stacco in corsa/.test(a.label)); if (k < 0) continue;
        SITUATIONS.push(s); return { gi: SITUATIONS.length - 1, k, seed: SEED, text: s.text, tipoHL: (deriveHL(s, s.actions[k]) || {}).type }; } return null; }, { caso });
    if (!pr) { esito[rosso ? 'rosso' : 'verde'].push({ k: caso.k, err: 'scena non generata' }); await page.close(); continue; }
    await page.evaluate(gi => { window.__CPM_CONT53 = []; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, pr.gi);
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(700);
    await page.evaluate(({ k, out }) => { window.__CPM_FORCE_OUTCOME = out; window.__CPM_RESOLVE(k); }, { k: pr.k, out: caso.out });
    let c = null;
    for (let w = 0; w < 40; w++) { await sleep(500); c = await page.evaluate(() => { const L = window.__CPM_CONT53 || []; return L.length ? L[L.length - 1] : null; }); if (c) break; }
    const r = { k: caso.k, seed: pr.seed, hl: pr.tipoHL, ang: c ? c.a : null, palla: c ? c.db : null, porta: c ? c.gx : null, z: c ? c.z : null, lontano: caso.lontano };
    esito[rosso ? 'rosso' : 'verde'].push(r); console.log((rosso ? 'rosso ' : 'verde ') + JSON.stringify(r)); await page.close();
  }
}
await b.close(); srv.close();
const g = [];
if (!solo || solo === 'verde') {
  const V = esito.verde; if (V.length !== CASI.length) g.push('verde: casi non giudicati ' + (CASI.length - V.length));
  for (const r of V) {
    if (r.err || r.ang == null) { g.push('verde: non giudicato (contatto mai registrato) ' + r.k); continue; }
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
if (g.length) { console.log('❌ angolo-117'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ angolo-117 verde (e il rosso si vede)');
