/* [CENSIMENTO 827 · S4 della roadmap] LE RIGHE CHE SI PERDONO. Con una scheda aperta addCom rifiuta
   (7.686): quante righe in tutto (__CPM_SC681_REF), quante righe di PIANO (__CPM_REF_PIANO: apertura/
   tiro/parata dell'occasione, battute della costruzione del gol) e, nel diario (__CPM_CRO802), quante
   occasioni escono con tutte e tre le righe. Banco a tempo reale, schede in scala. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Ra,Rb,Rc').split(',');
const SEMI=NOMI.map((_,g)=>6150+g*443);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
let tRef=0,tPiano=0,tBeat=0,tRighe=0,occTot=0,occComplete=0;
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;window.__CPM_DTREAL=true;window.__CPM_CRO802=[];});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  let clock=0;for(let k=0;k<3400;k++){await sleep(200);clock=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});if(clock>=89)break;}
  const d=await page.evaluate(()=>({ref:window.__CPM_SC681_REF|0,piano:window.__CPM_REF_PIANO|0,salva:window.__CPM_SALVA812|0,beat:(window.__CPM_BEAT792||[]).filter(x=>x&&x.occ),cro:(window.__CPM_CRO802||[]).map(x=>x.txt)}));
  await ctx.close();
  /* un'occasione = tre battute consecutive (step 0,1,2); e' completa se tutte e tre le sue frasi stanno nel diario */
  const occ=[];d.beat.forEach(x=>{if(x.step===0)occ.push([]);if(occ.length)occ[occ.length-1].push(x.txt||'');});
  let comp=0;occ.forEach(o=>{const ok=o.length===3&&o.every(t=>t&&d.cro.some(c=>c.startsWith(t.slice(0,40))));if(ok)comp++;});
  tRef+=d.ref;tPiano+=d.piano;tBeat+=d.beat.length;tRighe+=d.cro.length;occTot+=occ.length;occComplete+=comp;
  console.log('  '+NOMI[g]+': righe nel diario '+d.cro.length+' · rifiutate da addCom (scheda aperta) '+d.ref+' · di cui di PIANO '+d.piano+' su '+d.beat.length+' battute · occasioni complete nel diario '+comp+'/'+occ.length+' · guardia 7.812 scattata '+d.salva+' volte');
}
await b.close();srv.close();
console.log('\n=== LE RIGHE CHE SI PERDONO ('+NOMI.length+' partite) ===');
console.log('  rifiutate '+tRef+' su '+(tRef+tRighe)+' proposte ('+Math.round(100*tRef/Math.max(1,tRef+tRighe))+'%)   · righe di PIANO rifiutate '+tPiano+'/'+tBeat+' ('+Math.round(100*tPiano/Math.max(1,tBeat))+'%)');
console.log('  occasioni con tutte e tre le righe nel diario '+occComplete+'/'+occTot+' ('+Math.round(100*occComplete/Math.max(1,occTot))+'%)');
