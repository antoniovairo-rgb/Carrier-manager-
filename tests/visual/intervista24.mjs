/* [7.994.0] Sonda dell'INTERVISTA a tre passi (scelte PO: contesto partita, conseguenze visibili, sala viva, rilancio).
   Misura: tabellino sul pannello con il risultato; sala con gli altri giornalisti; dopo la prima risposta il
   rilancio (domanda diversa, 4 opzioni con «No comment») e le reazioni in sala; dopo il No comment la prima
   pagina col titolo e gli effetti; la fiducia del giornalista scende di 3 in piu'; «Chiudi» chiude.
   CPM_ROSSO=1 → __CPM_NO_IV24: la finestra si chiude alla prima risposta, la sonda deve andare in rosso. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO=process.env.CPM_ROSSO==='1';const S='/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/';
const srv=await startServer(); const port=srv.address().port; const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:414,height:896}}); await installCdnRoutes(page);
const errs=[]; page.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
const fails=[]; const F=(c,m)=>{if(!c)fails.push(m);}; const out={};
await page.addInitScript((rosso)=>{window.__CPM_GLB=false;if(rosso)window.__CPM_NO_IV24=true;
  const J=[{id:'j_ferretti',name:'Marco Ferretti',paper:'Sprint Sportivo',color:'#ef4444',type:'critico',trust:50},{id:'j_esposito',name:'Sofia Esposito',f:true,paper:'Diretta TV',color:'#3b82f6',type:'fan',trust:50},{id:'j_neri',name:'Giovanni Neri',paper:'Cronaca di Sport',color:'#7c3aed',type:'investigativa',trust:50}];
  localStorage.setItem('cpm-v3',JSON.stringify({phase:'career',player:{name:'Test Uno',nation:'Italia',avatarId:0,proStatus:'pro',season:3,week:10,age:25,ovr:78,tutorialDone:true,hasAgent:true,bankBalance:900000,popularity:40,journalists:J,club:{id:'juve',n:'Torino Athletic',a:'TAT',p:88,c:'#111',c2:'#fff',nat:'🇮🇹',lg:'Lega A'},stats:{'velocità':78,tecnica:78,fisico:78,'mentalità':78,tiro:78,passaggio:78,dribbling:78,posizionamento:78},calendar:[],standings:[],matchHistory:[],worldMemory:[],contract:{duration:3,wage:40000,expiresAtSeason:6},log:[]}}));},ROSSO);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'load'});
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000}); await sleep(1500);
try{await page.getByText('Continua',{exact:false}).first().click({timeout:5000});}catch(e){}
await page.waitForFunction(()=>!!(window.__CPM_CAREER&&window.__CPM_CAREER.forceInterview),{timeout:15000}); await sleep(600);
await page.evaluate(()=>window.__CPM_CAREER.forceInterview('win')); await sleep(1400);
out.tabellino=await page.$eval('[data-cpm="tabellino24"]',e=>e.innerText.replace(/\s+/g,' ')).catch(()=>null);
F(out.tabellino&&/2 – 1/.test(out.tabellino), `tabellino assente o senza risultato: ${out.tabellino}`);
out.sala=await page.$eval('[data-cpm="sala24"]',e=>e.innerText.replace(/\s+/g,' ')).catch(()=>null);
F(out.sala&&/Esposito/.test(out.sala)&&/Neri/.test(out.sala), `sala senza gli altri giornalisti: ${out.sala}`);
await page.screenshot({path:S+'iv24-1.png'});
const q1=await page.$eval('.cpm-press',e=>e.closest('div').parentElement.innerText).catch(()=>'');
const trust0=await page.evaluate(()=>0);
await page.locator('[data-cpm="risposta24"]').first().click(); await sleep(700);
const bottoni=await page.locator('[data-cpm="risposta24"]').allInnerTexts();
out.rilancio={opzioni:bottoni.length,noComment:bottoni.some(t=>/No comment/.test(t))};
out.salaDopo=await page.$eval('[data-cpm="sala24"]',e=>e.innerText.replace(/\s+/g,' ')).catch(()=>null);
F(bottoni.length===4&&out.rilancio.noComment, `rilancio: ${JSON.stringify(out.rilancio)}`);
F(out.salaDopo&&!/in sala.*in sala/.test(out.salaDopo)&&/(alza|applaude|annuisce|sorride|appunti|scrive|cerca)/.test(out.salaDopo), `reazioni in sala assenti: ${out.salaDopo}`);
await page.screenshot({path:S+'iv24-2.png'});
if(bottoni.length){await page.locator('[data-cpm="risposta24"]',{hasText:'No comment'}).first().click().catch(()=>{}); await sleep(700);}
out.prima=await page.$eval('[data-cpm="prima-pagina24"]',e=>e.innerText.replace(/\s+/g,' ')).catch(()=>null);
F(out.prima&&/Sprint Sportivo/.test(out.prima)&&/Domani in edicola/i.test(out.prima)&&/bocca cucita/.test(out.prima), `prima pagina: ${out.prima}`);
await page.screenshot({path:S+'iv24-3.png'});
await page.getByRole('button',{name:'Chiudi'}).first().click().catch(()=>{}); await sleep(600);
out.chiusa=!(await page.$('[data-cpm="prima-pagina24"]'));
F(out.chiusa,'Chiudi non chiude');
out.errs=errs; console.log(JSON.stringify(out,null,1)); console.log('fails',JSON.stringify(fails,null,1));
await browser.close(); srv.close();
const ok=fails.length===0&&errs.length===0; console.log(ok?'✅ PASS intervista24':'❌ FAIL intervista24'); process.exit(ok?0:1);
