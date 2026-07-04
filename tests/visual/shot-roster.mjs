import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT='/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad';
const srv=await startServer(); const port=srv.address().port;
const br=await launchBrowser(); const page=await br.newPage({viewport:{width:402,height:850}});
await installCdnRoutes(page);
page.on('pageerror',e=>console.log('PAGEERR',String(e.message).slice(0,90)));
await page.addInitScript(()=>{ window.__CPM_GLB=false;
  localStorage.setItem('cpm-v3', JSON.stringify({phase:'career',player:{name:'Leo Bianchi',nation:'Italia',avatarId:6,proStatus:'pro',season:3,week:14,age:24,ovr:82,tutorialDone:true,club:{id:'b04',n:'FC Werkstadt',a:'WRK',p:80,c:'#1e6feb',c2:'#0b1020',nat:'🇩🇪',lg:'Deutsche Liga'},stats:{'velocità':84,tecnica:81,fisico:76,'mentalità':79,tiro:83,passaggio:78,dribbling:82,posizionamento:80},goals:14,assists:7,matches:14,form:80,morale:76,contract:{duration:3,wage:14000,expiresAtSeason:6}}}));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'load',timeout:30000});
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000});
await sleep(1500);
try{ await page.getByText('Continua',{exact:false}).first().click({timeout:6000}); }catch(e){}
await page.waitForFunction(()=>!!window.__CPM_CAREER,{timeout:15000}).catch(()=>{});
await sleep(1200);
await page.getByText('Club',{exact:false}).first().click({timeout:5000}); await sleep(1000);
// scroll the internal container to the ROSA section
await page.evaluate(()=>{ const el=document.querySelector('.cpm-scroll')||document.scrollingElement; if(el){el.scrollTop=el.scrollHeight;} });
await sleep(800);
await page.screenshot({path:`${OUT}/ev-roster.png`}); console.log('shot roster');
await br.close(); srv.close(); process.exit(0);
