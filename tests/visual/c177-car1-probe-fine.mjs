import { apri, testo, sleep, bottoni, shot, caricaCarriera, snap } from './c177-car1-lib.mjs';
import fs from 'node:fs';
const save = JSON.parse(fs.readFileSync('../../docs/collaudi/dati-carriera-177-1/stato-corrente.json','utf8'));
const g = await apri({ save, glb: false }); await caricaCarriera(g.page);
await sleep(2000);
const s = await snap(g.page); console.log(JSON.stringify({s:s.season,w:s.week,lived:s.weekLived,age:s.age,ovr:s.ovr}));
console.log(await g.page.evaluate(() => window.__CPM_CAREER.screen()));
console.log(JSON.stringify(await bottoni(g.page)));
console.log((await testo(g.page)).slice(0,700));
const {clic}=await import('./c177-car1-lib.mjs');
await clic(g.page,/Chiudi la stagione/); await sleep(1500);
console.log('SCREEN',await g.page.evaluate(() => window.__CPM_CAREER.screen()));
console.log(JSON.stringify(await bottoni(g.page)));
for (const rx of [/Salta il galà/,/Vai al bilancio/,/Continua →/]) { await clic(g.page,rx); await sleep(1500); console.log('SCREEN',await g.page.evaluate(() => window.__CPM_CAREER.screen()), JSON.stringify(await bottoni(g.page))); }
console.log('TXT',(await testo(g.page)).slice(-1500));await shot(g.page,'probe-fine-s18-2');
await g.close();
