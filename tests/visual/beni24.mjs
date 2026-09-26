/* [7.992.0 Patrimonio F4] Sonda di BENI E STILE DI VITA + EREDITA'.
   Misura: (1) UI Staff: «Auto sportiva» scala 150k, popolarita' +3, fiducia mister −2, riga nel log; compri la
   fondazione; (2) casa: +0,5 di morale a settimana (media su partenze 30..90); (3) eredita': legacy score con
   patrimonio (accademia 6 ragazzi + fondazione + 6M netti = 18+10+12 = +40) e rosso = +0; (4) ritiro VERO
   (retireAnnounced → startNewSeason → careerEnd): la card «L'eredità fuori dal campo» c'e' con +40.
   CPM_ROSSO=1 → __CPM_NO_BENI24 + __CPM_NO_EREDITA24: deve andare in rosso. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const pageErrs=[]; const fails=[]; const out={}; const F=(c,m)=>{ if(!c) fails.push(m); };
async function boot(extra){
  const page = await browser.newPage({ viewport:{ width:414, height:896 } });
  await page.emulateMedia({ reducedMotion:'reduce' });
  await installCdnRoutes(page); page.on('pageerror', e => pageErrs.push(String(e.message).slice(0,140)));
  await page.addInitScript(([rosso,extra]) => {
    window.__CPM_GLB = false; if (rosso) { window.__CPM_NO_BENI24 = true; window.__CPM_NO_EREDITA24 = true; }
    const save = { phase:'career', player:{ name:'Test Uno', nation:'Italia', avatarId:0, proStatus:'pro',
      season:3, week:38, age:25, ovr:78, tutorialDone:true, hasAgent:true, bankBalance:1000000, popularity:40, coachTrust:60,
      club:{ id:'juve', n:'Torino Athletic', a:'TAT', p:88, c:'#111', c2:'#fff', nat:'🇮🇹', lg:'Lega A' },
      stats:{ 'velocità':78, tecnica:78, fisico:78, 'mentalità':78, tiro:78, passaggio:78, dribbling:78, posizionamento:78 },
      calendar:[], standings:[], matchHistory:[], worldMemory:[],
      contract:{ duration:3, wage:40000, expiresAtSeason:6 }, log:[], ...extra } };
    localStorage.setItem('cpm-v3', JSON.stringify(save));
  }, [ROSSO, extra||{}]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
  await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000});
  await sleep(1500);
  try{ await page.getByText('Continua',{exact:false}).first().click({timeout:5000}); }catch(e){}
  await page.waitForFunction(()=>!!window.__CPM_CAREER&&typeof window.__CPM_CAREER.startNewSeason==='function',{timeout:15000}).catch(()=>{});
  await sleep(600); return page;
}
{ const page=await boot();
  await page.evaluate(()=>window.__CPM_CAREER.goTab('ufficio')); await sleep(900);
  const P0=await page.evaluate(()=>window.__CPM_CAREER.get());
  await page.click('[data-cpm="bene24-compra-auto"]').catch(()=>{}); await sleep(500);
  const P1=await page.evaluate(()=>window.__CPM_CAREER.get());
  out.auto={costo:P0.bank-P1.bank,pop:P1.popularity-P0.popularity,fiducia:P1.coachTrust-P0.coachTrust,log:(P1.logTop||[])[0]};
  F(out.auto.costo===150000&&out.auto.pop===3&&out.auto.fiducia===-2&&/Auto sportiva/.test(out.auto.log||''), `auto: ${JSON.stringify(out.auto)}`);
  await page.click('[data-cpm="bene24-compra-fondazione"]').catch(()=>{}); await sleep(500);
  const own=await page.getAttribute('[data-cpm="bene24-fondazione"]','data-own').catch(()=>null); out.fondazioneTua=own;
  F(own==='1', `fondazione non risulta tua`);
  await page.locator('[data-cpm="beni24"]').scrollIntoViewIfNeeded().catch(()=>{}); await sleep(300);
  await page.screenshot({ path:'/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/beni24.png' });
  const mor=await page.evaluate(()=>{const C=window.__CPM_CAREER;const pro=(o)=>({proStatus:'pro',contractExpired:false,contract:{wage:40000},stats:{tiro:70},form:60,fatigue:30,sessionsThisWeek:0,sessionLog:[],matchHistory:[],...o});
    let sd=0,n=0;for(let m=30;m<=90;m+=5){sd+=C.weeklyGrowthFields(pro({morale:m,beni24:['casa']}),{}).morale-C.weeklyGrowthFields(pro({morale:m,beni24:[]}),{}).morale;n++;}return +(sd/n).toFixed(2);});
  out.moraleCasa=mor; F(mor>=0.3&&mor<=0.7, `casa: delta morale settimanale ${mor} (atteso ~0,5)`);
  await page.close(); }
const ric={academy24:{name:'Accademia Uno',founded:1,grads:[],tot:6,paused:false},beni24:['fondazione'],bankBalance:6000000};
{ const page=await boot(ric); const L=await page.evaluate(()=>window.__CPM_CAREER.get().legacy24); out.eredita=L;
  F(L&&L.pat&&L.pat.pts===40, `eredità: attesi +40 (18+10+12), ${JSON.stringify(L)}`); await page.close(); }
{ const page=await boot({...ric,retireAnnounced:3,age:36});
  await page.evaluate(()=>window.__CPM_CAREER.startNewSeason()); await sleep(2500);
  for(let i=0;i<6;i++){ const b=page.getByText(/Salta|Continua|Avanti/).first(); if(await b.isVisible().catch(()=>false)){await b.click().catch(()=>{});await sleep(600);} }
  const card=await page.$('[data-cpm="eredita24"]'); out.cardRitiro=card?await card.getAttribute('data-pts'):null;
  F(out.cardRitiro==='40', `ritiro: card eredità ${out.cardRitiro}`);
  if(card){await card.scrollIntoViewIfNeeded();await sleep(300);await page.screenshot({ path:'/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/eredita24.png' });}
  await page.close(); }
out.pageErrs=pageErrs; console.log(JSON.stringify(out,null,1)); console.log('fails',JSON.stringify(fails,null,1));
await browser.close(); srv.close();
const ok=fails.length===0&&pageErrs.length===0; console.log(ok?'✅ PASS beni24':'❌ FAIL beni24'); process.exit(ok?0:1);
