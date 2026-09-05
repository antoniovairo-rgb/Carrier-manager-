/* [7.788 misura] IL TAGLIO E' UNO SOLO? — con il testimone che il 7.456 ha costruito apposta.
   Collaudo PO sulla 7.787: tre note, e due portano i numeri della bozza automatica (eroe ≥48,9u su
   SIT #68, ≥41,2u su SIT #87). MISURATO su 39 scene: in 22 c'e' un fotogramma A SCENA SCOPERTA in cui
   NESSUNO sta entro 3,5 unita' dal pallone, fino a 63,1u. Il transitorio dura un decimo o due, ma
   breve non vuol dire invisibile — ed e' precisamente cio' che il PO chiama codice 001.
   Lo snap di scena ESISTE gia' (`_hlSnap`, armato al cambio di chiave e a hl_intro). La domanda e'
   quindi un'altra: quando i bersagli cambiano in massa, il taglio e' armato? Il testimone `__CPM_STG456`
   registra esattamente questo a ogni cambio di staging — `far` (quanti giocatori sono a piu' di 8u dal
   loro bersaglio), `dmax`, e `snap` (se un taglio e' armato in quel fotogramma). La riga del 7.456 lo
   dice senza ambiguita': «il difetto e' bersagli freschi con NESSUN taglio armato: i ventidue restano
   dove sono e ci vanno a piedi». Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GLB=process.env.CPM_GLB!=='0';
const PASSO=+(process.env.CPM_PASSO||5);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();const page=await b.newPage({viewport:{width:412,height:915}});
await installCdnRoutes(page);
await page.addInitScript((o)=>{window.__CPM_GLB=o.glb;window.__CPM_REC=true;window.__CPM_CINE=1;window.__CPM_PRESENT=1;/* ⚠️ [7.788] SENZA QUESTO IL BANCO NON SNAPPA. `_asIfPlay = (__CPM_PRESENT===1) || !cpmtest` (src/12 r.4480): sotto `?cpmtest=1` e senza questo flag sono spenti lo snap di scena, il ri-snap del 7.401 e il fermo di lettura. Misurare l'apertura senza di esso significa misurare il banco, non il gioco: la prima passata dava 22 scene su 39 col pallone abbandonato a scena scoperta, e il ri-snap era scattato ZERO volte su 39. */
  (o.rossi||[]).forEach(r=>{window[r]=1;});},{glb:GLB,rossi:(process.env.CPM_ROSSO||'').split(',').map(x=>x.trim()).filter(Boolean)});
await openMatch(page,port);await sleep(GLB?4000:900);
const tot=await page.evaluate(()=>window.__CPM_SITS.length);
const GIs=process.env.CPM_GI?process.env.CPM_GI.split(',').map(Number):(()=>{const o=[];for(let i=0;i<tot;i+=PASSO)o.push(i);return o;})();
await page.evaluate(()=>{window.__CPM_STG456=[];});
for(const gi of GIs){
  await page.evaluate(g=>{try{window.__CPM_RESEED&&window.__CPM_RESEED(g);}catch(e){}},gi);
  let ok=false;try{ok=await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);}catch(e){}
  if(!ok)continue;
  await sleep(300);
  await page.evaluate(()=>{window.__CPM_FROZEN=false;});
  await sleep(2200);
}
/* ⚠️ il testimone `__CPM_STG456` registra `snap` PRIMA che il blocco di ri-snap del 7.401 lo
   accenda (witness a r.~4510, ri-snap a r.~4547): quel `false` non prova che il ri-snap non sia
   scattato. Il contatore giusto e' `__CPM_RSNP401`, scritto DAL ri-snap quando parte davvero.
   Letto male una volta: quinta sottigliezza di strumento della giornata. */
const S=await page.evaluate(()=>window.__CPM_STG456||[]);
const RS=await page.evaluate(()=>window.__CPM_RSNP401||[]);
await b.close();srv.close();
const conBersagliFreschi=S.filter(r=>(r.far|0)>0);
const senzaTaglio=conBersagliFreschi.filter(r=>!r.snap);
console.log('cambi di staging registrati: '+S.length);
console.log('RI-SNAP del 7.401 effettivamente scattati: '+RS.length+'  '+JSON.stringify(RS.slice(0,6)));
console.log('di cui con bersagli LONTANI (almeno un giocatore oltre 8u dal suo): '+conBersagliFreschi.length);
console.log('   → di questi, SENZA un taglio armato (i ventidue ci vanno a piedi): '+senzaTaglio.length);
senzaTaglio.slice(0,14).forEach(r=>console.log('      scena '+r.k+' fase '+r.ph+' · lontani '+r.far+'/'+r.n+' · il piu lontano '+r.dmax+'u · '+r.dt+'ms dal taglio'));
const dm=conBersagliFreschi.map(r=>r.dmax).sort((a,c)=>a-c);
console.log('distanza del piu lontano dal suo bersaglio: mediana '+(dm.length?dm[dm.length>>1]:'-')+'u · max '+(dm.length?dm[dm.length-1]:'-')+'u');
