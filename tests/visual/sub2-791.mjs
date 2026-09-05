#!/usr/bin/env node
/* [7.791 misura v2] DOPO LA SOSTITUZIONE DELL'EROE, IL GIOCO GLI CHIEDE ANCORA DI GIOCARE?
   Nota PO (05/09): «Dopo la sostituzione dell'eroe continuavano le interazioni interattive».

   LA PRIMA STESURA NON MISURAVA NIENTE, e resta a verbale: usava la leva di collaudo
   `__CPM_FORCE_SUBOFF` dentro il PROVINO. Due errori in uno. (a) La leva accende anche `onBench`,
   cioe' proprio lo stato che il binario panchina protegge gia': misuravo il caso facile. (b) Il
   provino non e' contesto «career» ne' «cup», e `_subDue38` lo richiede — li' una sostituzione non
   puo' avvenire per costruzione. In piu' leggevo la fase da `__CPM_STATE()` (lo stato del 3D) invece
   che da `__CPM_PHASE()`, e il cronometro non avanzava mai: 200 campioni tutti «playing» e mai il
   90'. Un verde cosi' non e' un verde: e' uno strumento fermo.

   QUI la sostituzione e' VERA: carriera vera, stanchezza 70 → il minuto d'uscita nasce da
   `subOffAtRef` (56 + (80-fatica)*1,1 ≈ 67'). Nessuna leva. Si campiona `__CPM_PHASE()` e il
   cronometro, e si contano le fasi interattive DOPO il minuto in cui l'eroe e' uscito davvero.
   Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv=await startServer();const port=srv.address().port;
const browser=await launchBrowser();
const N=+(process.env.CPM_PARTITE_S||3);

const mkSave = (extra) => ({ phase: 'career', player: {
  name: 'Curva Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, age: 26, ovr: 78,
  tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, drawSeen: 4, coachPactSeason: 4,
  seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare', coachTrust: 74, teamChemistry: 64,
  club: { id: 'cel', n: 'FC Celeste', a: 'CEL', p: 70, c: '#93c5fd', c2: '#ffffff', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 78, tecnica: 78, fisico: 75, 'mentalità': 77, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
  form: 82, morale: 80, fatigue: 70, popularity: 52, totalMatches: 130, totalGoals: 55,
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
  const nome='Sub Probe '+g;
  const p=await bootCareer(mkSave({name:nome,week:6+g}));
  await sleep(700);
  /* entro nella partita */
  let vivo=false;
  for(let a=0;a<16;a++){
    vivo=await p.evaluate(()=>typeof window.__CPM_PHASE==='function'&&!!window.__CPM_SUBOFF);
    if(vivo)break;
    await p.evaluate(()=>{const C=window.__CPM_CAREER;if(!C)return;C.dismiss();if(C.playMatch&&C.playMatch()===true)return;if(C.step)C.step();});
    await sleep(1600);
  }
  if(!vivo){console.log('['+nome+'] partita non raggiunta — scartata');await p.close();continue;}
  const at=await p.evaluate(()=>(window.__CPM_SUBOFF&&window.__CPM_SUBOFF())||null);
  console.log('['+nome+'] uscita prevista al '+(at&&at.at)+"' · fatica "+(at&&at.fat)+' · contesto '+(at&&at.ctx));
  if(!at||at.at==null){console.log('   nessuna uscita programmata — scartata');await p.close();continue;}
  await p.evaluate(()=>window.__CPM_AUTOPLAY&&window.__CPM_AUTOPLAY(true,{seed:7301,policy:'seeded',tickMs:300}));
  let uscitoAl=null,inter=0,intro=0,camp=0,minMax=0;const quando=[],fasi={};
  /* ⚠️ IL SECONDO STRUMENTO CIECO, e anche questo a verbale. Col solo campionamento della fase, le
     fasi INTERATTIVE risultavano zero anche PRIMA dell'uscita (48 scene viste, 0 hl_choose): non
     perche' non ci fossero, ma perche' l'autoplay le risolve entro il suo tick e non si fanno mai
     campionare. Contare zero dopo l'uscita, con quello strumento, non dimostrava niente.
     Rimedio: appena l'eroe esce si SPEGNE la risposta automatica. Da quel momento una fase
     interattiva, se arriva, ci resta — il cronometro dentro la scena e' fermo — e diventa
     impossibile non vederla. La partita intanto continua da sola nelle fasi di gioco. */
  let spento=false;
  /* ⚠️ IL CONTROLLO CHE MANCAVA: quante scene vede lo strumento PRIMA dell'uscita. Senza questo numero
     uno zero dopo l'uscita non distingue «il gioco si comporta bene» da «la sonda e' cieca» — ed e' la
     lezione gia' pagata due volte (voci del mister a zero, ri-snap a zero). */
  let interPrima=0,introPrima=0,campPrima=0;const fasiPrima={};
  for(let k=0;k<420;k++){await sleep(900);
    const s=await p.evaluate(()=>{const so=(window.__CPM_SUBOFF&&window.__CPM_SUBOFF())||{};
      const ms=(window.__CPM_MS&&window.__CPM_MS())||null;
      return{ph:(window.__CPM_PHASE&&window.__CPM_PHASE())||null,min:ms?(ms.min|0):null,off:!!so.off,bench:!!so.bench};});
    if(s.min!=null&&s.min>minMax)minMax=s.min;
    if(s.off&&uscitoAl==null){uscitoAl=(s.min!=null?s.min:minMax);
      try{await p.evaluate(()=>window.__CPM_AUTOPLAY&&window.__CPM_AUTOPLAY(false));spento=true;}catch(_e){}}
    if(uscitoAl==null){campPrima++;fasiPrima[s.ph]=(fasiPrima[s.ph]|0)+1;
      if(s.ph==='hl_choose'||s.ph==='hl_move')interPrima++;
      else if(s.ph==='hl_intro'||s.ph==='hl_result')introPrima++;}
    if(uscitoAl!=null){camp++;fasi[s.ph]=(fasi[s.ph]|0)+1;
      if(s.ph==='hl_choose'||s.ph==='hl_move'){inter++;if(quando.length<12)quando.push((s.min||minMax)+"'/"+s.ph);}
      else if(s.ph==='hl_intro'||s.ph==='hl_result'){intro++;if(quando.length<12)quando.push((s.min||minMax)+"'/"+s.ph);}}
    if(s.ph==='ended'||s.ph==='ceremony'||(s.min!=null&&s.min>=92))break;}
  if(uscitoAl==null){console.log('   l\'eroe NON e\' mai uscito (cronometro arrivato al '+minMax+"') — scartata");await p.close();continue;}
  OUT.push({n:nome,uscitoAl,inter,intro,camp,fasi,quando,minMax,interPrima,introPrima,campPrima});
  console.log('   CONTROLLO, prima dell\'uscita: campioni '+campPrima+' · fasi interattive '+interPrima
    +' · scene '+introPrima+' · fasi viste '+JSON.stringify(fasiPrima));
  console.log('   uscito al '+uscitoAl+"' · cronometro fino al "+minMax+"' · campioni dopo l'uscita "+camp);
  console.log('   risposta automatica spenta all\'uscita: '+(spento?'SI':'NO — misura non valida'));
  console.log('   FASI INTERATTIVE dopo l\'uscita (hl_choose/hl_move): '+inter+' · scene (hl_intro/hl_result): '+intro);
  console.log('   fasi viste dopo l\'uscita: '+JSON.stringify(fasi));
  if(quando.length)console.log('   quando: '+quando.join(' · '));
  await p.close();
}
await browser.close();srv.close();
const ti=OUT.reduce((s,x)=>s+x.inter,0),tn=OUT.reduce((s,x)=>s+x.intro,0);
console.log('');
console.log('=== '+OUT.length+' partite con sostituzione VERA ===');
if(!OUT.length){console.log('  NESSUN CAMPIONE — la misura non ha valore, non e\' un verde.');process.exit(2);}
console.log('  partite con almeno una scena dopo l\'uscita: '+OUT.filter(x=>x.inter>0||x.intro>0).length+'/'+OUT.length);
console.log('  campioni in fase INTERATTIVA dopo l\'uscita: '+ti);
console.log('  campioni in scena (intro/result) dopo l\'uscita: '+tn);
const tp=OUT.reduce((s,x)=>s+x.interPrima+x.introPrima,0);
console.log('  NOTA sul controllo: prima dell\'uscita le fasi interattive si contano quasi sempre 0 perche\' l\'autoplay');
console.log('  le risolve entro il suo tick. Il numero che conta e\' quello DOPO, dove la risposta automatica e\' spenta:');
console.log('  li\' una scena interattiva resterebbe bloccata e verrebbe vista di sicuro.');
console.log('  CONTROLLO — scene viste PRIMA dell\'uscita: '+tp+' (se e\' 0, lo strumento e\' cieco e lo zero qui sopra non vale niente)');
if(tp===0){console.log('  INDETERMINATO — la sonda non ha visto nemmeno una scena mentre l\'eroe era in campo.');process.exit(3);}
console.log((ti===0&&tn===0)?'  VERDE — a eroe sostituito, nessuna scena, e la sonda le sa vedere.':'  ROSSO — l\'eroe e\' uscito e il gioco gli chiede ancora di giocare.');
