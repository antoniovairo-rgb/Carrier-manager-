import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, unfreeze, freeze, canvasShot, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const tag = process.argv[2] || 'before';
const srv=await startServer(); const port=srv.address().port;
const b=await launchBrowser(); const page=await b.newPage({viewport:{width:900,height:900}});
await installCdnRoutes(page); await openMatch(page,port);
// gi0 tiro 1v1, gi64 colpo di testa, gi68 sforbiciata, gi132 blocco/difesa
for(const gi of [0,64,68,132]){
  await forceSituation(page,gi,{settle:550,choose:true});
  await freeze(page); fs.writeFileSync(`out/_vloop/${tag}_gi${gi}_choose.png`, await canvasShot(page)); await unfreeze(page);
  await page.evaluate(()=>window.__CPM_RESOLVE(0)); await sleep(260); // mid-conclusione (swing)
  await freeze(page); fs.writeFileSync(`out/_vloop/${tag}_gi${gi}_swing.png`, await canvasShot(page)); await unfreeze(page);
  await sleep(200);
}
await b.close(); srv.close(); console.log(tag+' captured');
