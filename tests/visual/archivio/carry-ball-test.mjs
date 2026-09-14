/* [7.323.0] GUARDIANO PERMANENTE — LA PALLA IN CONDUZIONE NON RESTA MAI DIETRO
   (direttiva PO «il pallone rimane indietro / viene trascinato / sembra scollegato dai piedi»)

   Si tiene premuta una direzione durante hl_choose (passi veri da 2.5u del movimento tastiera/pad) e si
   misura per-frame, dal recorder in pagina, la proiezione del pallone sulla direzione di marcia REALE
   della mesh dell'eroe. Prima del fix: fino a -0.56u dietro il corpo (7% dei frame in conduzione);
   dopo: mai sotto +0.30 (il clamp di conduzione tiene la palla un passo avanti, componente laterale conservata).

     node carry-ball-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;const b=await launchBrowser();
let fails=0;
for(const [gi,key] of [[40,'d'],[12,'d'],[150,'w'],[56,'s']]){
  const page=await b.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;});
  await openMatch(page,port);await sleep(800);
  await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);await sleep(800);
  await page.evaluate(()=>{window.__CPM_FROZEN=false;});await sleep(500);
  await page.evaluate(()=>window.__CPM_REC_DRAIN());
  await page.keyboard.down(key);
  await sleep(2600);
  await page.keyboard.up(key);
  const fr=await page.evaluate(()=>window.__CPM_REC_DRAIN());
  let worst=99,behind=0,mov=0;
  for(let i=2;i<fr.length;i++){
    const a=fr[i-2],c=fr[i];
    const mx=c.h[0]-a.h[0],mz=c.h[1]-a.h[1];const ml=Math.hypot(mx,mz);
    if(ml<0.12)continue;/* fermo: nessuna direzione di marcia */
    const d=Math.hypot(c.b[0]-c.h[0],c.b[1]-c.h[1]);
    if(d>3.5)continue;
    mov++;
    const proj=((c.b[0]-c.h[0])*mx+(c.b[1]-c.h[1])*mz)/ml;
    if(proj<worst)worst=proj;
    if(proj<-0.35)behind++;
  }
  const ok=(mov===0)||(behind===0&&worst>=-0.15);if(!ok)fails++;
  console.log(`${ok?'✅':'❌'} gi${String(gi).padStart(3)} tasto ${key} · frame in marcia ${mov} · proiezione peggiore ${worst===99?'—':worst.toFixed(2)+'u'} · frame palla DIETRO ${behind}`);
  await page.close();
}
await b.close();srv.close();
console.log(fails?`\n❌ FAIL — ${fails}`:`\n✅ PASS — in conduzione il pallone sta sempre davanti al corpo`);
process.exit(fails?2:0);
