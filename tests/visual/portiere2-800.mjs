/* [7.800 misura] IL PORTIERE, MISURATO IN PARTITA VERA invece che su scene forzate.
   Il 7.799 e' stato revocato non per una misura contraria ma perche' il METRO non reggeva: forzando
   scene una per una i tuffi osservati per passata erano 4, 3, 0, 0, 1 — a codice quasi identico. La
   causa e' che una scena forzata produce un tiro in porta solo quando l'esito sorteggiato lo prevede,
   e quel sorteggio cambia a ogni passata: il campione non e' governabile.
   In NOVANTA MINUTI di gioco i tiri sono tanti e non dipendono da cosa forzo io. Qui si giocano N
   partite intere e si legge `__CPM_GK799` — lo stesso testimone, su un campione che nasce dal gioco.
   Se il numero di tuffi per partita e' stabile fra i mondi, il metro regge e il rimedio si puo'
   giudicare; se oscilla ancora, il difetto e' piu' in profondita' e va detto. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const NOMI=(process.env.CPM_NOMI||'Oa,Ob,Oc,Pa').split(',');
const q=(v,p)=>{if(!v.length)return NaN;const w=v.slice().sort((x,y)=>x-y);return w[Math.min(w.length-1,Math.floor(p*w.length))];};
const TUTTI=[];const perPartita=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),9100+(g%3)*733);
  let min=0;
  for(let k=0;k<40;k++){await sleep(20000);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  /* ⚠️ IL TESTIMONE GIUSTO E' QUELLO DEL MOVIMENTO. `__CPM_GK799` registra quando il tuffo viene
     ARMATO (la decisione); `__CPM_GKM800` quando il corpo COMINCIA A MUOVERSI. Col tempo di reazione
     i due istanti non coincidono piu', ed e' il secondo quello che lo spettatore vede. */
  const G=await page.evaluate(()=>(window.__CPM_GKM800||[]).filter(x=>x.tipo==='gk_dive'));
  /* ⚠️ IL FILTRO GIUSTO E' «ARCO IN CORSO», non «durata non nulla»: senza `act` un tuffo armato quando
   l'arco e' gia' finito porta con se' la durata VECCHIA e un tempo azzerato, e finisce nel mucchio come
   se fosse partito prestissimo. La prima passata leggeva mediana 0 proprio per questo. */
const conArco=G.filter(x=>x.dur!=null&&x.t!=null&&x.dur>0&&x.act===1);
  const _viv=conArco.filter(x=>x.act===1);
  TUTTI.push(...conArco);
  const att=G.map(x=>+x.att||0);
  const conAttesa=att.filter(x=>x>=0.15).length;
  perPartita.push({n:NOMI[g],tot:G.length,min,viv:G.length,tardi:G.length-conAttesa});
  const viv=conArco.filter(x=>x.act===1);
  const tardiP=viv.filter(x=>x.t/x.dur>=0.9).length;
  console.log('['+NOMI[g]+'] min '+min+' · tuffi '+G.length
    +' · con un\'ATTESA prima di partire '+conAttesa+(G.length?' ('+Math.round(100*conAttesa/G.length)+'%)':'')
    +' · attesa mediana '+(att.length?q(att,0.5):'-')+'s');
  await ctx.close();
}
await b.close();srv.close();
console.log('');
console.log('=== '+NOMI.length+' partite intere ===');
/* ⚠️ IL METRO NON E' IL CONTEGGIO, E' LA FRAZIONE. Il numero di tuffi per partita dipende da quanti
   tiri ci sono e oscilla per forza (8-43 nella prima passata): giudicare da li' era un mio errore di
   criterio. Cio' che deve essere stabile e' la QUOTA di tuffi fuori tempo, che e' una frazione e non
   dipende dal numero di occasioni. */
const N=perPartita.map(x=>x.tot);
console.log('  tuffi per partita: '+JSON.stringify(N)+'  (oscilla per forza: dipende da quanti tiri ci sono)');
const QP=perPartita.filter(x=>x.viv>0).map(x=>Math.round(100*x.tardi/x.viv));
if(QP.length>=2){console.log('  QUOTA SENZA attesa per partita: '+JSON.stringify(QP)+'%  → spread '+(Math.max(...QP)-Math.min(...QP))+' punti');
  console.log('  il metro '+((Math.max(...QP)-Math.min(...QP))<=20?'REGGE: il rimedio si puo\' giudicare':'NON REGGE ANCORA'));}
if(!TUTTI.length){console.log('  nessun tuffo misurabile nel tempo.');process.exit(0);}
const R=TUTTI.map(x=>x.t),D=TUTTI.map(x=>x.dur),F=TUTTI.map(x=>+(x.t/x.dur).toFixed(2));
console.log('');
console.log('  durata del volo (s):        mediana '+q(D,0.5)+' · p25 '+q(D,0.25)+' · p75 '+q(D,0.75)+' · max '+Math.max(...D));
console.log('  ISTANTE del tuffo (s):      mediana '+q(R,0.5)+' · p25 '+q(R,0.25)+' · p75 '+q(R,0.75)+' · max '+Math.max(...R));
console.log('  ISTANTE / DURATA del volo:  mediana '+q(F,0.5)+' · p25 '+q(F,0.25)+' · p75 '+q(F,0.75)
  +'   (1,00 = il pallone e\' gia\' arrivato · un portiere vero sta sotto 0,5)');
const tardi=F.filter(x=>x>=0.9).length;
console.log('  tuffi partiti a pallone gia\' arrivato (>=0,90): '+tardi+'/'+F.length+'  ('+Math.round(100*tardi/F.length)+'%)');
