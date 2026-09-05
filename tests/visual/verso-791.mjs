#!/usr/bin/env node
/* [7.791 misura] LA FRECCETTA TELEVISIVA DICE IL VERO ANCHE IN TRASFERTA?
   Nota PO (05/09), con fotografia al 69' di FC Mer 3-0 FC Gri: «la direzione della freccetta
   televisiva e' sbagliata, la squadra dell'eroe attaccava dall'altro lato».
   NEL MOTORE convivono DUE nozioni di «casa» — la stessa trappola del 7.52.2 e del 7.278:
     · la casa del FRAME 3D: «l'eroe e' sempre reso home nel 3D» (src/14 r.775), quindi la squadra
       dell'eroe attacca SEMPRE verso x alte, in casa come in trasferta;
     · la casa del CAMPO: `homeTeamObj` (src/14 r.7286), che in trasferta e' l'AVVERSARIO.
   La capsula `verso697` legge la seconda. Se le due divergono — cioe' in trasferta — la freccia
   punta dalla parte sbagliata. Qui si misura, non si deduce: si apre una gara in TRASFERTA vera
   (boot in due fasi dal calendario, ricetta del 7.278) e si confronta la sigla che porta il chevron
   «attacca a destra» con la sigla della squadra dell'EROE.
   Sola lettura. Rosso di controllo: la stessa misura in CASA, dove le due nozioni coincidono e la
   capsula deve risultare giusta comunque. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues=[];
const srv=await startServer();const port=srv.address().port;
const browser=await launchBrowser();

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
  page.on('pageerror',e=>issues.push('pageerror: '+String(e.message).slice(0,120)));
  await installCdnRoutes(page);
  await page.addInitScript((o)=>{window.__CPM_GLB=false;window.__CPM_PRESENT=1;window.__CPM_REC=true;
    localStorage.setItem('cpm-v3',JSON.stringify(o));localStorage.setItem('cpm-intro-seen','1');},save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'load',timeout:40000});
  await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},null,{timeout:60000});
  await sleep(1200);
  try{await page.getByText('Continua',{exact:false}).first().click({timeout:5000});}catch(e){}
  await page.waitForFunction(()=>!!window.__CPM_CAREER,null,{timeout:20000});
  return page;
};

/* legge la capsula: [sigla sinistra, chevron sinistro, chevron destro, sigla destra] */
const leggiCapsula=(page)=>page.evaluate(()=>{
  const el=document.querySelector('[data-cpm="verso697"]');
  if(!el)return null;
  const t=(el.innerText||'').replace(/\s+/g,' ').trim();
  const sig=Array.from(el.querySelectorAll('span')).map(s=>(s.textContent||'').trim()).filter(x=>/^[A-Z]{2,3}$/.test(x));
  return {testo:t,sigle:sig};
});

/* il verso VERO letto dalla simulazione: chi difende la porta bassa attacca verso x alte */
const versoVero=(page)=>page.evaluate(()=>{
  const ms=(window.__CPM_MS&&window.__CPM_MS())||null;if(!ms||!ms.linee)return null;
  return {defHome:ms.linee.home.def,defAway:ms.linee.away.def,min:ms.min|0,
    /* score.h e' SEMPRE la squadra dell'eroe: lo usa _lead38 per decidere se il mister lo risparmia */
    scoreEroe:ms.score?ms.score.h:null};
});

async function giro(etichetta,save,attesaCasa){
  const p=await bootCareer(save);
  await sleep(600);
  const dati=await p.evaluate(()=>{try{const s=JSON.parse(localStorage.getItem('cpm-v3'));
    return {club:(s.player.club&&s.player.club.a)||null,cal:s.player.calendar||[],week:s.player.week};}catch(e){return null;}});
  const eroe=dati&&dati.club;
  /* ⚠️ la prima stesura aspettava `__CPM_MS()` NON NULLO: ma il Match State nasce col primo tick di
     cronometro, e prima (matchday/formations/walkout) e' nullo. Il ciclo quindi non si fermava mai e
     continuava a chiamare playMatch/step, oltrepassando la partita: quattro rilievi, tutti «non
     leggibile», e nessuna misura. L'attesa giusta e' quella dei ganci del vivo. */
  let vivo=false;
  for(let a=0;a<16;a++){
    vivo=await p.evaluate(()=>typeof window.__CPM_PHASE==='function'&&!!window.__CPM_SUBOFF);
    if(vivo)break;
    await p.evaluate(()=>{const C=window.__CPM_CAREER;if(!C)return 'no';C.dismiss();if(C.playMatch&&C.playMatch()===true)return 'match';return C.step?C.step():'no-step';});
    await sleep(1600);
  }
  if(!vivo){issues.push('['+etichetta+'] partita non raggiunta');await p.close();return null;}
  /* la capsula si disegna solo in fase `playing`: l'autoplay ci porta, e il cronometro fa nascere il MS */
  await p.evaluate(()=>window.__CPM_AUTOPLAY&&window.__CPM_AUTOPLAY(true,{seed:5150,policy:'seeded',tickMs:300}));
  for(let a=0;a<40;a++){
    const ok=await p.evaluate(()=>((window.__CPM_PHASE&&window.__CPM_PHASE())==='playing')&&!!(window.__CPM_MS&&window.__CPM_MS())&&!!document.querySelector('[data-cpm="verso697"]'));
    if(ok)break;await sleep(700);
  }
  const capsula=await leggiCapsula(p);
  const vero=await versoVero(p);
  const casa=await p.evaluate(()=>{try{const s=JSON.parse(localStorage.getItem('cpm-v3'));
    const m=(s.player.calendar||[]).find(x=>x&&x.week===s.player.week);return m?m.isHome:null;}catch(e){return null;}});
  console.log('');
  console.log('['+etichetta+'] sigla EROE '+eroe+' · isHome dichiarato '+casa);
  if(!capsula)issues.push('['+etichetta+'] capsula verso697 non trovata nel DOM');
  else console.log('   capsula: «'+capsula.testo+'» · sigle '+JSON.stringify(capsula.sigle));
  if(!vero)issues.push('['+etichetta+'] match state non leggibile');
  else console.log('   simulazione: linea difensiva home x='+vero.defHome+' · away x='+vero.defAway
    +' → la squadra «home» del 3D attacca verso '+((vero.defHome!=null&&vero.defAway!=null&&vero.defHome<vero.defAway)?'x ALTE (destra)':'x BASSE (sinistra)'));
  if(capsula&&capsula.sigle.length>=2){
    /* la PRIMA sigla e' quella col chevron «attacca a destra» */
    const attaccaDestra=capsula.sigle[0];
    const ok=(attaccaDestra===eroe);
    console.log('   la capsula dice che attacca a destra: '+attaccaDestra+' · la simulazione dice: '+eroe
      +' → '+(ok?'COINCIDONO':'DIVERGONO'));
    if(!ok)issues.push('['+etichetta+'] la freccetta indica '+attaccaDestra+' ma a destra attacca '+eroe);
  }
  await p.close();
  return {eroe,capsula,vero,casa};
}

/* (A) IN CASA — le due nozioni coincidono: qui la capsula deve essere giusta comunque */
{
  const p=await bootCareer(mkSave({}));
  await sleep(800);
  const cal=await p.evaluate(()=>{try{return JSON.parse(localStorage.getItem('cpm-v3')).player.calendar||[];}catch(e){return [];}});
  await p.close();
  const casa=cal.find(m=>m&&!m.played&&m.isHome===true&&!m.type);
  const via=cal.find(m=>m&&!m.played&&m.isHome===false&&!m.type);
  if(!casa)issues.push('nessuna gara in CASA nel calendario ('+cal.length+' voci)');
  else await giro('CASA W.'+casa.week,mkSave({week:casa.week,calendar:cal}),true);
  if(!via)issues.push('nessuna gara in TRASFERTA nel calendario ('+cal.length+' voci)');
  else await giro('TRASFERTA W.'+via.week,mkSave({week:via.week,calendar:cal}),false);
}

await browser.close();srv.close();
console.log('');
if(issues.length===0)console.log('VERDE — la freccetta indica la squadra che attacca davvero, in casa e in trasferta.');
else{console.log('ROSSO — '+issues.length+' rilievi:');issues.forEach(x=>console.log('  · '+x));}
process.exit(issues.length?1:0);
