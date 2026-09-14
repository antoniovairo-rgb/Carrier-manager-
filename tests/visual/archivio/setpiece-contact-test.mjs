/* [7.323.0] GUARDIANO PERMANENTE — GEOMETRIA DEL CONTATTO SUL PIAZZATO
   (direttiva PO «il giocatore supera il pallone durante l'animazione»)

   Per ogni frame (recorder in pagina, mai poll da node): proiezione del CORPO del battitore sull'asse
   pallone→porta rispetto allo spot. Tre proprieta':
     (a) prima che il pallone parta il corpo sta SEMPRE dietro la palla (proiezione < -0.1);
     (b) il battitore ARRIVA davvero al contatto (alla partenza la proiezione e' > -1.3: non e' a meta' corsa);
     (c) la rincorsa esiste (arretramento massimo >= 2.6).
   Misurato alla stesura: -0.62 (rigore, esattamente il punto di contatto _SP_REST) · -0.25/-0.26 (punizioni,
   follow-through appena avviato a palla partita). PRIMA del fix: +0.51/+0.62/+0.93 = corpo OLTRE il pallone.

     node setpiece-contact-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;const b=await launchBrowser();
const SP=[["penalty",5],["freekick",13],["freekick",14]];let fails=0;
for(const [tipo,gi] of SP){
  const page=await b.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;});
  await openMatch(page,port);await sleep(800);
  await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);await sleep(800);
  await page.evaluate(()=>{window.__CPM_FROZEN=false;});await sleep(1400);
  await page.evaluate(()=>window.__CPM_REC_DRAIN());
  await page.evaluate(()=>{window.__CPM_FORCE_OUTCOME='success';window.__CPM_RESOLVE(0);});
  await sleep(3000);
  const fr=await page.evaluate(()=>window.__CPM_REC_DRAIN());
  if(!fr.length){console.log(`gi${gi} ${tipo}: nessun frame`);await page.close();continue;}
  // pallone di partenza = primo frame; partenza del pallone = primo frame con spostamento >0.5 dal punto iniziale
  const b0=fr[0].b;let dep=-1;
  for(let i=1;i<fr.length;i++){if(Math.hypot(fr[i].b[0]-b0[0],fr[i].b[1]-b0[1])>0.5){dep=i;break;}}
  // asse pallone→porta (world): AWAY_GOAL ~ x=48.6, z=0
  let ax=48.6-b0[0],az=-b0[1];const al=Math.hypot(ax,az)||1;ax/=al;az/=al;
  let overshoot=-99,atDep=null,minBack=99;
  for(let i=0;i<fr.length;i++){
    const proj=(fr[i].h[0]-b0[0])*ax+(fr[i].h[1]-b0[1])*az;/* h=[x,z] eroe */
    if(dep<0||i<=dep){if(proj>overshoot)overshoot=proj;if(proj<minBack)minBack=proj;}
    if(i===dep)atDep=proj;
  }
  const okA=overshoot<-0.1,okB=(atDep!=null&&atDep>-1.3),okC=(-minBack)>=2.6;
  const ok=okA&&okB&&okC;if(!ok)fails++;
  console.log(`${ok?'✅':'❌'} gi${String(gi).padStart(3)} ${tipo.padEnd(8)} corpo max ${overshoot.toFixed(2)}u (mai >-0.1) · alla partenza ${atDep==null?'?':atDep.toFixed(2)}u (> -1.3) · rincorsa ${(-minBack).toFixed(2)}u (>=2.6)`);
  await page.close();
}
await b.close();srv.close();
console.log(fails?`\n❌ FAIL — ${fails}`:`\n✅ PASS — il battitore arriva ACCANTO al pallone e non lo supera mai`);
process.exit(fails?2:0);
