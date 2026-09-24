/* [7.989.0 Patrimonio F1] Sonda dello STAFF PRIVATO A LIVELLI.
   Misura: (1) livello 1 = costi storici; L2/L3 costano x1,8/x2,8; (2) sospensione a fondi finiti spegne tutte e
   quattro le figure e ricorda il livello; (3) fisioterapista: infortuni simulati su 4000 semi a fatica alta,
   L0 vs L3 (atteso ~ -24%); (4) mental coach: morale settimanale L0 vs L3; (5) UI: 4 righe, + / − cambiano livello.
   CPM_ROSSO=1 → __CPM_NO_STAFF24 (formule storiche): la sonda deve andare in rosso. Exit != 0 se fallisce. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage({ viewport:{ width:414, height:896 } });
await installCdnRoutes(page);
const pageErrs=[]; page.on('pageerror', e => pageErrs.push(String(e.message).slice(0,140)));
await page.addInitScript((rosso) => {
  window.__CPM_GLB = false; if (rosso) window.__CPM_NO_STAFF24 = true;
  const save = { phase:'career', player:{ name:'Test Uno', nation:'Italia', avatarId:0, proStatus:'pro',
    season:2, week:10, age:24, ovr:78, tutorialDone:true, hasAgent:true, bankBalance:2000000,
    club:{ id:'juve', n:'Torino Athletic', a:'TAT', p:88, c:'#111', c2:'#fff', nat:'🇮🇹', lg:'Lega A' },
    stats:{ 'velocità':78, tecnica:78, fisico:78, 'mentalità':78, tiro:78, passaggio:78, dribbling:78, posizionamento:78 },
    calendar:[], standings:[], matchHistory:[], worldMemory:[],
    contract:{ duration:3, wage:40000, expiresAtSeason:5 }, log:[] } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
}, ROSSO);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000});
await sleep(1500);
try{ await page.getByText('Continua',{exact:false}).first().click({timeout:5000}); }catch(e){}
await page.waitForFunction(()=>!!window.__CPM_CAREER&&typeof window.__CPM_CAREER.simInjuryRoll==='function',{timeout:15000}).catch(()=>{});
await sleep(600);
const R = await page.evaluate(()=>{
  const C=window.__CPM_CAREER, out={fails:[]}; const F=(c,m)=>{ if(!c) out.fails.push(m); };
  const pro=(o)=>({proStatus:'pro',contractExpired:false,contract:{wage:40000},bankBalance:0,hasAgent:false,...o});
  const all=(lv)=>({perkTrainer:lv>0,perkNutrition:lv>0,perkFisio:lv>0,perkMental:lv>0,perkTrainerLv:lv,perkNutritionLv:lv,perkFisioLv:lv,perkMentalLv:lv});
  // (1) costi
  const c1=40000-C.weeklyEconomyFields(pro({perkTrainer:true,perkNutrition:true})).bankBalance;
  out.costoStoricoL1=c1; F(c1===3600, `L1 trainer+nutri deve costare 3600 (storico), costa ${c1}`);
  const cL=[1,2,3].map(l=>40000-C.weeklyEconomyFields(pro(all(l))).bankBalance); out.costi4figure=cL;
  F(cL[1]>cL[0]*1.7&&cL[2]>cL[1]*1.4, `L2/L3 devono costare di piu' (${cL})`);
  // (2) sospensione
  const br=C.weeklyEconomyFields(pro({...all(3),contract:{wage:1000},bankBalance:-50000}));
  out.sospensione={t:br.perkTrainer,n:br.perkNutrition,f:br.perkFisio,m:br.perkMental};
  F(br.perkTrainer===false&&br.perkNutrition===false&&br.perkFisio===false&&br.perkMental===false, `sospensione non spegne le 4 figure ${JSON.stringify(out.sospensione)}`);
  // (3) fisioterapista: infortuni su 4000 semi a fatica 80 (carico partita 12..22 -> 92..100 = banda alta)
  const inj=(lv)=>{let n=0;for(let s=1;s<=4000;s++){const r=C.simInjuryRoll(pro({fatigue:80,...all(lv)}),s*7919);if(r&&r.injured)n++;}return n;};
  const i0=inj(0),i3=inj(3); out.infortuniL0=i0; out.infortuniL3=i3; out.calo=+(1-i3/i0).toFixed(3);
  F(i0>150&&out.calo>0.15&&out.calo<0.33, `fisio L3 deve tagliare ~24% degli infortuni (L0 ${i0}, L3 ${i3})`);
  // (4) mental coach: effetto di UNA settimana, media su morale di partenza 30..90 (L3 atteso +1,5)
  const d1=(lv,m)=>{const g=C.weeklyGrowthFields({...pro(all(lv)),morale:m,stats:{tiro:70},form:60,fatigue:30,sessionsThisWeek:0,sessionLog:[],matchHistory:[]},{});return typeof g==='string'?NaN:g.morale;};
  let sd=0,nn=0;for(let m=30;m<=90;m+=5){sd+=d1(3,m)-d1(0,m);nn++;}
  out.moraleDeltaL3=+(sd/nn).toFixed(2); let sd1=0;for(let m=30;m<=90;m+=5)sd1+=d1(1,m)-d1(0,m); out.moraleDeltaL1=+(sd1/nn).toFixed(2);
  F(out.moraleDeltaL3>=1&&out.moraleDeltaL3<=2&&out.moraleDeltaL1>=0.2&&out.moraleDeltaL1<=1, `mental coach: delta settimanale L1 ${out.moraleDeltaL1}, L3 ${out.moraleDeltaL3} (attesi ~0,5 e ~1,5)`);
  return out;
});
// (5) UI
try{ await window_goto(); }catch(e){}
async function window_goto(){ await page.evaluate(()=>window.__CPM_CAREER.goTab&&window.__CPM_CAREER.goTab('agente')); await sleep(900); }
const rows = await page.$$eval('[data-cpm^="staff24-"]', els=>els.map(e=>({k:e.getAttribute('data-cpm'),lv:+e.getAttribute('data-lv')})));
R.righeUI = rows.length; if(rows.length!==4 && !ROSSO) R.fails.push(`UI: attese 4 righe staff, trovate ${rows.length}`);
if(rows.length){
  await page.click('[data-cpm="staff24-perkFisio"] button[aria-label^="Alza"]'); await sleep(250);
  await page.click('[data-cpm="staff24-perkFisio"] button[aria-label^="Alza"]'); await sleep(250);
  const lv=await page.getAttribute('[data-cpm="staff24-perkFisio"]','data-lv'); R.fisioDopoDuePiu=+lv;
  if(+lv!==2) R.fails.push(`UI: fisio dopo due + deve essere livello 2, e' ${lv}`);
  await page.screenshot({ path:'/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/staff24.png' });
}
R.pageErrs = pageErrs;
console.log(JSON.stringify(R,null,1));
await browser.close(); srv.close();
const ok = R.fails.length===0 && pageErrs.length===0;
console.log(ok?'✅ PASS staff24':'❌ FAIL staff24'); process.exit(ok?0:1);
