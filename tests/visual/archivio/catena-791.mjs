#!/usr/bin/env node
/* [7.791 misura] LA PORTA DELLA CATENA: se l'eroe esce MENTRE una scena e' in corso, la catena continua?
   Nota PO (05/09): «Dopo la sostituzione dell'eroe continuavano le interazioni interattive».
   La sostituzione naturale al 67' NON riproduce il difetto (0 scene su 3 partite, con 51 viste prima e
   la risposta automatica spenta): il binario schedulato ha la sua guardia e regge.
   Ma leggendo il codice restano DUE porte senza guardia, e questa sonda prova ad aprirne una:
   le CATENE (src/14 r.6884 «CATENA!» e r.6934 «SI CONTINUA!») rientrano in `hl_intro` con un
   setPhase diretto, senza mai chiedere se l'eroe sia ancora in campo.
   Metodo: si aspetta che il gioco sia DENTRO una scena (`hl_choose`), si tira in quell'istante la leva
   d'uscita `__CPM_FORCE_SUBOFF`, e si contano le scene che arrivano DOPO. Se la catena ha la sua
   guardia, sono zero; se non ce l'ha, l'eroe uscito continua a giocare.
   Sola lettura oltre alla leva. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const browser=await launchBrowser();
const N=+(process.env.CPM_PARTITE_C||4);

const mkSave = (extra) => ({ phase: 'career', player: {
  name: 'Curva Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, age: 26, ovr: 78,
  tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, drawSeen: 4, coachPactSeason: 4,
  seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare', coachTrust: 74, teamChemistry: 64,
  club: { id: 'cel', n: 'FC Celeste', a: 'CEL', p: 70, c: '#93c5fd', c2: '#ffffff', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 78, tecnica: 78, fisico: 75, 'mentalità': 77, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
  form: 82, morale: 80, fatigue: 30, popularity: 52, totalMatches: 130, totalGoals: 55,
  matchHistory: [], contract: { duration: 3, wage: 14000, expiresAtSeason: 8 }, ...extra } });

const bootCareer=async(save)=>{
  const page=await browser.newPage({viewport:{width:412,height:915}});
  page.on('pageerror',e=>console.log('   [pageerror] '+String(e.message).slice(0,120)));
  await installCdnRoutes(page);
  await page.addInitScript((o)=>{window.__CPM_GLB=false;window.__CPM_PRESENT=1;window.__CPM_REC=true;
    localStorage.setItem('cpm-v3',JSON.stringify(o));localStorage.setItem('cpm-intro-seen','1');},save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'load',timeout:60000});
  await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},null,{timeout:60000});
  await sleep(1200);
  try{await page.getByText('Continua',{exact:false}).first().click({timeout:5000});}catch(e){}
  await page.waitForFunction(()=>!!window.__CPM_CAREER,null,{timeout:20000});
  return page;
};

const OUT=[];
for(let g=0;g<N;g++){
  const nome='Catena '+g;
  const p=await bootCareer(mkSave({name:nome,week:6+g}));
  await sleep(700);
  let vivo=false;
  for(let a=0;a<16;a++){
    vivo=await p.evaluate(()=>typeof window.__CPM_PHASE==='function'&&!!window.__CPM_SUBOFF);
    if(vivo)break;
    await p.evaluate(()=>{const C=window.__CPM_CAREER;if(!C)return;C.dismiss();if(C.playMatch&&C.playMatch()===true)return;if(C.step)C.step();});
    await sleep(1600);
  }
  if(!vivo){console.log('['+nome+'] partita non raggiunta — scartata');await p.close();continue;}
  await p.evaluate(()=>window.__CPM_AUTOPLAY&&window.__CPM_AUTOPLAY(true,{seed:8802,policy:'seeded',tickMs:300}));
  /* aspetto di essere DENTRO una scena, e li' tiro la leva */
  let tirataA=null,fasiPrima=0;
  for(let k=0;k<900;k++){
    const s=await p.evaluate(()=>{const ms=(window.__CPM_MS&&window.__CPM_MS())||null;
      return{ph:(window.__CPM_PHASE&&window.__CPM_PHASE())||null,min:ms?(ms.min|0):null};});
    if(s.ph==='hl_choose'||s.ph==='hl_move'||s.ph==='hl_intro')fasiPrima++;
    if(s.ph==='hl_choose'){
      const r=await p.evaluate(()=>({ok:!!(window.__CPM_FORCE_SUBOFF&&window.__CPM_FORCE_SUBOFF()),min:((window.__CPM_MS&&window.__CPM_MS())||{}).min|0}));
      if(r.ok){tirataA=r.min;break;}
    }
    if(s.min!=null&&s.min>=88)break;
    await sleep(150);
  }
  if(tirataA==null){console.log('['+nome+'] mai sorpreso dentro una scena ('+fasiPrima+' fasi di scena viste) — scartata');await p.close();continue;}
  /* da qui: l'eroe e' fuori. Ogni scena che arriva e' la catena che non si e' fermata. */
  /* ⚠️ IL VERDETTO SI CONTA IN SCENE, NON IN CAMPIONI, e questa e' la correzione di un mio rosso falso.
     Alla prima passata contavo ogni CAMPIONE in fase di scena: 4 partite su 4 «rosse» con 28 voci —
     ma erano 6-8 letture della STESSA schermata di esito, tutte al minuto della leva, cioe' la scena
     gia' in volo che si concludeva. Una scena che finisce non e' una scena che comincia: l'eroe era in
     campo quando quella e' partita. Cio' che conta e' un INGRESSO nuovo — una transizione verso
     `hl_intro` o `hl_choose` dopo l'uscita. Nella stessa passata gli ingressi erano ZERO. */
  let dopo=0,inter=0,camp=0,minMax=0,ingressi=0,phPrec=null;const fasi={},quando=[];
  for(let k=0;k<300;k++){await sleep(500);
    const s=await p.evaluate(()=>{const ms=(window.__CPM_MS&&window.__CPM_MS())||null;
      return{ph:(window.__CPM_PHASE&&window.__CPM_PHASE())||null,min:ms?(ms.min|0):null};});
    camp++;fasi[s.ph]=(fasi[s.ph]|0)+1;
    if(s.ph!==phPrec&&(s.ph==='hl_intro'||s.ph==='hl_choose')){ingressi++;if(quando.length<10)quando.push((s.min||minMax)+"' INGRESSO "+s.ph);}
    phPrec=s.ph;
    if(s.min!=null&&s.min>minMax)minMax=s.min;
    if(s.ph==='hl_intro'||s.ph==='hl_result'){dopo++;if(quando.length<10)quando.push((s.min||minMax)+"'/"+s.ph);}
    if(s.ph==='hl_choose'||s.ph==='hl_move'){inter++;if(quando.length<10)quando.push((s.min||minMax)+"'/"+s.ph);}
    if(s.ph==='ended'||s.ph==='ceremony'||(s.min!=null&&s.min>=92))break;}
  OUT.push({n:nome,tirataA,dopo,inter,camp,fasi,quando,minMax,ingressi});
  console.log('['+nome+"] leva tirata DENTRO una scena al "+tirataA+"' · campioni dopo "+camp+" · cronometro fino al "+minMax+"'");
  console.log('   INGRESSI in scena NUOVI dopo l\'uscita: '+ingressi+'  (campioni in scena '+dopo+', interattivi '+inter+' — i campioni contano anche la scena gia\' in volo che si conclude)');
  console.log('   fasi viste dopo: '+JSON.stringify(fasi));
  if(quando.length)console.log('   quando: '+quando.join(' · '));
  await p.close();
}
await browser.close();srv.close();
console.log('');
console.log('=== '+OUT.length+' partite, leva tirata DENTRO una scena ===');
if(!OUT.length){console.log('  NESSUN CAMPIONE — non e\' un verde, e\' una misura mancata.');process.exit(2);}
const tg=OUT.reduce((s,x)=>s+x.ingressi,0),td=OUT.reduce((s,x)=>s+x.dopo,0),ti=OUT.reduce((s,x)=>s+x.inter,0);
console.log('  partite con un INGRESSO in scena nuovo dopo l\'uscita: '+OUT.filter(x=>x.ingressi>0).length+'/'+OUT.length);
console.log('  ingressi nuovi: '+tg+'  ·  (campioni in scena '+td+', interattivi '+ti+': includono la scena gia\' in volo)');
console.log((tg===0)?'  VERDE — a eroe uscito nessuna scena NUOVA comincia; quella gia\' in volo si conclude, ed e\' giusto cosi\'.':'  ROSSO — a eroe uscito comincia una scena nuova.');
