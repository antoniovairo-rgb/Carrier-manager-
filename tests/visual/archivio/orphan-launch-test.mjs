/* [7.322.0] GUARDIANO PERMANENTE — NESSUN LANCIO ORFANO ("il tiro parte da solo")

   Chiude un residuo vecchio e onesto: il difetto «si vede un DOPPIO TIRO, il primo da solo» era stato
   corretto nel 7.255 RAGIONANDO sul codice, senza mai misurarlo. Qui si misura.

   Due lanci NON sono di per se' un difetto — passaggio + conclusione del ricevente sono due lanci veri.
   Il difetto e' il lancio ORFANO: il pallone che accelera mentre nessun sistema lo sta guidando (nessun
   arco, nessun post-arco, nessun executor della timeline). Quello e' il pallone che parte da solo.

   ⚠️ Nota di metodo: la prima stesura campionava da node ogni 110ms e restituiva velocita' tutte a zero —
   misura VACUA, il polling e' molto piu' grossolano del frame rate. Si usa il recorder per-frame in pagina
   (__CPM_REC), che e' l'unica fonte con la risoluzione giusta.

   Misurato alla stesura: gi30/25/57/29 → 0 lanci orfani; i due lanci di gi57 sono entrambi sotto arco vivo.

     node dbl.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;const b=await launchBrowser();
let fails=0;
for(const gi of [30,25,57,29]){
  const page=await b.newPage();await page.setViewportSize({width:900,height:760});
  await installCdnRoutes(page);await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;});
  await openMatch(page,port);await sleep(800);
  const k=await page.evaluate(g=>{const S=window.__CPM_SITS[g];let k=0;
    (S.actions||[]).forEach((a,i)=>{try{const h=window.deriveHL(S,a);if(h.type==='pass'&&k===0)k=i;}catch(e){}});return k;},gi);
  await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);await sleep(700);
  await page.evaluate(()=>{window.__CPM_FROZEN=false;});await sleep(400);
  await page.evaluate(()=>window.__CPM_REC_DRAIN());
  await page.evaluate(k=>{window.__CPM_FORCE_OUTCOME='success';window.__CPM_RESOLVE(k);},k);
  await sleep(4200);
  const fr=await page.evaluate(()=>window.__CPM_REC_DRAIN());
  const v=[];for(let i=1;i<fr.length;i++){const a=fr[i-1],c=fr[i];const dt=(c.t-a.t)/1000;
    if(dt<=0)continue;v.push(Math.hypot(c.b[0]-a.b[0],c.b[1]-a.b[1])/dt);}
  // un LANCIO = la velocita' della palla passa da quasi-ferma (<2 u/s) a chiaramente lanciata (>14 u/s)
  /* due lanci NON sono di per se' un difetto: passaggio + conclusione del ricevente sono due lanci veri.
     Il difetto era il lancio ORFANO — pallone che parte mentre nessun sistema lo sta guidando
     (nessun arco, nessun post-arco, nessun executor): quello e' il «tiro da solo». */
  let lanci=0,orfani=0,armato=true;const det=[];
  for(let i=0;i<v.length;i++){const f=fr[i+1];
    if(armato&&v[i]>14){lanci++;const orf=(!f.pa&&!f.arc&&!f.tl);if(orf)orfani++;det.push(`${v[i].toFixed(0)}u/s[${f.pa||'-'}${f.arc?'+arco':''}${f.tl?'+exec':''}]`);armato=false;}
    if(v[i]<2)armato=true;}
  const ok=(orfani===0);if(!ok)fails++;
  console.log(`${ok?'✅':'❌'} gi${String(gi).padStart(3)} frame ${fr.length} · lanci ${lanci} (ORFANI ${orfani}) · ${det.join(' ')||'nessun lancio nella finestra'}`);
  await page.close();
}
await b.close();srv.close();
console.log(fails?`\n❌ FAIL — ${fails} situation con lanci orfani`:`\n✅ PASS — ogni lancio del pallone ha un sistema che lo guida`);
process.exit(fails?2:0);
