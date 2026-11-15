#!/usr/bin/env node
/* [giro 206 PO-373] MISURA (non guardiano): luminosita' e saturazione di prato, cielo e spalti, giorno e notte, su due tipologie
   di stadio (tetto / torri d'angolo), tre camere fisse. CPM_TAG=prima|dopo per il nome delle foto; CPM_ROSSO=1 arma __CPM_NO_G206. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import { CAMERE, misuraZone, apriPartita } from './lib/notte-206.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const TAG = process.env.CPM_TAG || 'prima', ROSSO = !!process.env.CPM_ROSSO;
const TPL = (process.env.CPM_TPL || 'inglese,storico_it,comunale').split(',');
const VISTE = (process.env.CPM_VISTE || '1280x720,375x667').split(',');
const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro206'); fs.mkdirSync(FOTO, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const R = [];
for (const vista of VISTE) { const [vw, vh] = vista.split('x').map(Number);
  for (const tpl of TPL) for (const tod of ['day', 'night']) {
    const { ctx, page, errs, fase } = await apriPartita(b, port, SAVE, { tod, tpl, vw, vh, init: ROSSO ? { __CPM_NO_G206: 1 } : {}, installCdnRoutes, sleep });
    for (const cam of Object.keys(CAMERE)) {
      const foto = (vista === VISTE[0] || cam === 'tribuna') ? path.join(FOTO, `${TAG}-notte-${tpl}-${tod}-${cam}-${vista}.png`) : null;
      const m = await misuraZone(page, cam, foto); const riga = { vista, tpl, tod, cam, fase, ...m, errs: errs.length };
      R.push(riga); console.log(JSON.stringify(riga)); }
    await ctx.close(); } }
await b.close(); srv.close();
fs.writeFileSync(path.join(FOTO, `misura-notte-${TAG}.json`), JSON.stringify(R, null, 1));
/* tabella: rapporto notte/giorno per zona */
console.log('\nvista · stadio · camera · zona : giorno lum/sat → notte lum/sat (rapporto lum)');
for (const g of R.filter(x => x.tod === 'day')) { const n = R.find(x => x.tod === 'night' && x.vista === g.vista && x.tpl === g.tpl && x.cam === g.cam); if (!n || !g.zone || !n.zone) continue;
  for (const z of ['prato', 'cielo', 'spalti']) { const a = g.zone[z], c = n.zone[z]; if (!a.n || !c.n) continue;
    console.log(`${g.vista} · ${g.tpl} · ${g.cam} · ${z} (${a.n}/${c.n}): ${a.lum}/${a.sat} → ${c.lum}/${c.sat} (${(c.lum / a.lum).toFixed(2)})`); } }
