/* [7.785 censimento] QUANTI GOL FA UNA PARTITA, E CHI LI FA.
   Nota PO 05/09: «da quando c'e' il nuovo motore le partite finiscono quasi sempre con pochi gol e
   le azioni pericolose extra eroe sono rare ed imbarazzanti». Due affermazioni misurabili, distinte:
   (1) il TOTALE di gol per partita (tabellone del Match State a fine gara);
   (2) la loro PROVENIENZA — l'evento goal porta `src`: highlight/setpiece = l'eroe, microsim = il
       roll del micro-simulatore, cronaca = la riga ambientale. «Extra eroe» sono le ultime due.
   Nessun rimedio qui: solo il numero. CPM_PARTITE_G partite (default 4). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const N=+(process.env.CPM_PARTITE_G||8);
/* [7.785] IL MONDO CONTA PIU' DEL SEME. Prima passata (4 partite, un solo nome 'Gl'): 0,75 gol a
   partita e zero gol ambientali. Cambiando SOLO il nome dell'eroe — che semina il sorteggio di club e
   avversario — le stesse due partite finiscono 3-2 e 1-2. La prima misura non misurava il gioco,
   misurava un mondo. Qui il campione varia nome E seme. */
const NOMI=['Ga','Gb','Gc','Gd','Ge','Gf','Gg','Gh'];
const OUT=[];
for(let g=0;g<N;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();
  await installCdnRoutes(page);
  await page.addInitScript((rosso)=>{window.__CPM_GLB=false;window.__CPM_REC=true;
    if(rosso)String(rosso).split(',').forEach(r=>{window[r.trim()]=1;});},process.env.CPM_ROSSO||null);
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g%NOMI.length]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),9100+g*733);
  const ev=[];let min=0,fin=false;
  for(let k=0;k<40;k++){await sleep(20000);
    const c=await page.evaluate(()=>{const e=(window.__CPM_EV&&window.__CPM_EV())||[];if(window.__CPM_EV_RESET)window.__CPM_EV_RESET();return e;});
    ev.push(...c);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(ev.some(e=>e.ev==='fine')){fin=true;break;}
    if(min>=90){fin=true;break;}}
  const sc=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms&&ms.score?{h:ms.score.h|0,a:ms.score.a|0}:null;});
  /* [7.785] IL CONTATORE DELLA CATENA: `giri` quante volte il tick e' stato interrogato, `ev` quante
     volte il gol del micro-simulatore era ancora vivo a quel punto. Se `ev` e' in linea con la
     baseline (~2 a partita) ma i gol `microsim` a tabellone sono zero, il gol si perde a valle. */
  const occ=await page.evaluate(()=>window.__CPM_OCC695G||null);
  const gl=ev.filter(e=>e.ev==='goal');
  const es=ev.filter(e=>e.ev==='esito');
  const by={};gl.forEach(x=>{by[x.src||'?']=(by[x.src||'?']||0)+1;});
  OUT.push({g,score:sc,gol:gl.length,src:by,scene:es.length,min,fin,occ});
  console.log('partita '+g+' ['+NOMI[g%NOMI.length]+']: minuto '+min+(fin?' (finita)':' (NON finita)')+' · tabellone '+(sc?sc.h+'-'+sc.a:'?')+' · eventi gol '+gl.length+' '+JSON.stringify(by)+' · scene risolte '+es.length+'\n     giri='+((occ&&occ.giri)|0)+' ev='+((occ&&occ.ev)|0)+' pg='+((occ&&occ.pg)|0)+' ct='+((occ&&occ.ct)|0)+' out='+((occ&&occ.out)|0)+' ok='+((occ&&occ.ok)|0));
  await ctx.close();
}
await b.close();srv.close();
const tot=OUT.reduce((s,o)=>s+(o.score?o.score.h+o.score.a:0),0);
const eroe=OUT.reduce((s,o)=>s+((o.src.highlight||0)+(o.src.setpiece||0)),0);
const extra=OUT.reduce((s,o)=>s+((o.src.microsim||0)+(o.src.cronaca||0)),0);
const scene=OUT.reduce((s,o)=>s+o.scene,0);
console.log('');
console.log('=== '+N+' partite ===');
console.log('gol totali a tabellone: '+tot+'  ·  per partita: '+(tot/N).toFixed(2));
console.log('gol dell EROE (highlight+setpiece): '+eroe+'  ·  per partita: '+(eroe/N).toFixed(2));
console.log('gol EXTRA EROE (microsim+cronaca): '+extra+'  ·  per partita: '+(extra/N).toFixed(2));
console.log('scene risolte per partita: '+(scene/N).toFixed(2));
const ev=OUT.reduce((s,o)=>s+((o.occ&&o.occ.ev)|0),0);
console.log('gol del micro-simulatore vivi nella catena (ev): '+ev+'  ·  per partita: '+(ev/N).toFixed(2)+'  (baseline bgMicroTick: ~1,9)');
console.log('riferimento calcio vero: 2,6-2,8 gol per partita');
