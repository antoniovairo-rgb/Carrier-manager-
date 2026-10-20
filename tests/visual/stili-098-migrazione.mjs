/* [giro 67 PO-098] GUARDIANO DELLA MIGRAZIONE DEGLI ARCHETIPI (salvataggi compatibili). Nella pagina vera: per ognuno degli 8 vecchi
   archetipi un salvataggio passa da migratePlayer (window.__CPM_MIGRATE) e deve uscire con lo stile giusto, l'id di prima in
   archetipoOrig, il tratto Enfant solo per l'Enfant (che mantiene la crescita x1,35 sotto i 23 anni), nessun campo perso, e la seconda
   migrazione non deve cambiare niente. La creazione offre 4 stili. Rosso (__CPM_NO_STILI): l'archetipo resta quello di prima.
   [giro 75] Dal giro 75 gira con __CPM_NO_STILEUNICO75 acceso in entrambi i bracci: lo stile unico e' provato da stile-unico-75. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const ATTESO = { bomber: 'finalizzatore', centravanti: 'finalizzatore', trequartista: 'regista', fantasista: 'regista', velocista: 'incursore', leader: 'trascinatore', tuttocampista: 'trascinatore' };
const srv = await startServer(); const b = await launchBrowser(); const err = []; const out = {};
for (const rosso of [false, true]) {
  const page = await b.newPage(); await installCdnRoutes(page);
  await page.addInitScript((r) => { window.__CPM_NO_STILEUNICO75 = 1; window.__CPM_NO_NEUTRO287 = 1; /* [giro 82 PO-287] la 7.999.176: l'eroe neutro e' provato da neutro-287 */ if (r) window.__CPM_NO_STILI = 1; }, rosso);/* [giro 75] questo guardiano prova lo strato del giro 67 (8 archetipi → 4 stili): dal giro 75 lo stile unico lo copre, quindi si spegne lo stile unico (lo prova stile-unico-75) */
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!window.__CPM_MIGRATE && !!window.__CPM_STILI, null, { timeout: 90000 });
  const r = await page.evaluate((pl) => {
    const S = window.__CPM_STILI; const o = { creazione: S.ARCHETYPES.map(a => a.id), casi: {} };
    for (const a of S.ARCHETYPES_8) {
      const p0 = JSON.parse(JSON.stringify(pl)); p0.archetype = a; p0.age = 19;
      const m1 = window.__CPM_MIGRATE(p0).player; const m2 = window.__CPM_MIGRATE(JSON.parse(JSON.stringify(m1)));
      const persi = Object.keys(p0).filter(k => !(k in m1));
      o.casi[a.id] = { stile: (m1.archetype && m1.archetype.id) || m1.archetype, orig: m1.archetipoOrig || null, enfant: !!(m1.tratti && m1.tratti.enfant),
        enfantTratto: S.haTrattoEnfant(m1), persi, idem: !m2.changed || JSON.stringify(m2.player.archetype) === JSON.stringify(m1.archetype) && m2.player.archetipoOrig === m1.archetipoOrig };
    }
    return o;
  }, save.player || save);
  out[rosso ? 'rosso' : 'verde'] = r; await page.close();
}
await b.close(); srv.close();
console.log(JSON.stringify(out, null, 1));
const V = out.verde, R = out.rosso;
if (JSON.stringify(V.creazione) !== JSON.stringify(['finalizzatore', 'regista', 'incursore', 'trascinatore'])) err.push('la creazione non offre i 4 stili: ' + V.creazione);
for (const [id, c] of Object.entries(V.casi)) {
  if (id === 'enfant') { if (!['finalizzatore', 'regista', 'incursore', 'trascinatore'].includes(c.stile) || !c.enfant || !c.enfantTratto) err.push('enfant: ' + JSON.stringify(c)); }
  else { if (c.stile !== ATTESO[id]) err.push(id + ' → ' + c.stile + ' (atteso ' + ATTESO[id] + ')'); if (c.enfant) err.push(id + ': tratto enfant dato per sbaglio'); }
  if (c.orig !== id) err.push(id + ': archetipoOrig ' + c.orig); if (c.persi.length) err.push(id + ': campi persi ' + c.persi); if (!c.idem) err.push(id + ': la seconda migrazione cambia ancora');
}
for (const [id, c] of Object.entries(R.casi)) if (c.stile !== id) err.push('rosso: ' + id + ' migrato lo stesso (' + c.stile + ')');
if (err.length) { console.error('❌ stili-098-migrazione: ' + err.join(' · ')); process.exit(1); }
console.log('✅ stili-098-migrazione verde (8 archetipi → 4 stili + tratto Enfant, idempotente, nessun campo perso; il rosso lascia l\'archetipo)');
