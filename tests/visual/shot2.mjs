import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT='/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 402, height: 850 } });
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,100)));
await page.addInitScript(() => { window.__CPM_GLB=false;
  const save={ phase:'career', player:{ name:'Leo Bianchi', nation:'Italia', avatarId:6, proStatus:'pro', season:3, week:14, age:24, ovr:82,
    tutorialDone:true, hasAgent:true, club:{ id:'b04', n:'FC Werkstadt', a:'WRK', p:80, c:'#1e6feb', c2:'#0b1020', nat:'🇩🇪', lg:'Deutsche Liga' },
    stats:{'velocità':84,tecnica:81,fisico:76,'mentalità':79,tiro:83,passaggio:78,dribbling:82,posizionamento:80},
    goals:14,assists:7,matches:14,totalGoals:63,totalMatches:118,totalAssists:31,trophies:[{},{}],
    form:80,morale:76,fatigue:20,coachTrust:70,popularity:60,value:22,bankBalance:2400000,fitnessCoachRel:64,assistantCoachRel:60,teamChemistry:73,
    contract:{duration:3,wage:14000,expiresAtSeason:6},
    matchHistory:[{won:true,drew:false,homeScore:3,awayScore:1,opponent:'FC Nord',rating:8.1,goals:2,assists:0,week:13},{won:false,drew:true,homeScore:1,awayScore:1,opponent:'SV Ost',rating:6.6,goals:0,assists:1,week:12},{won:true,drew:false,homeScore:2,awayScore:0,opponent:'TSV Süd',rating:7.4,goals:1,assists:0,week:11}],
    standings:[{id:'b04',n:'FC Werkstadt',a:'WRK',pts:31,played:14,wins:9,draws:4,losses:1,gf:28,ga:12,gd:16,c:'#1e6feb'},{id:'x1',n:'FC Nord',a:'NRD',pts:29,played:14,wins:9,draws:2,losses:3,gf:25,ga:15,gd:10,c:'#c0392b'},{id:'x2',n:'SV Ost',a:'OST',pts:24,played:14,wins:7,draws:3,losses:4,gf:20,ga:16,gd:4,c:'#16a34a'}],
    seasonObjectives:[{type:'goals',target:18,label:'Segna 18 gol'}],
    log:['⚽ Doppietta vs FC Nord','🏆 Migliore in campo'] } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000});
await sleep(1500);
try{ await page.getByText('Continua',{exact:false}).first().click({timeout:6000}); }catch(e){}
await page.waitForFunction(()=>!!window.__CPM_CAREER,{timeout:15000}).catch(()=>{});
await sleep(1500);
// verify dicebear
const db = await page.evaluate(()=>({ready:!!(window.DiceBear&&window.DiceBear.ready), styles:(window.DiceBear&&window.DiceBear.styles)||[]}));
console.log('DiceBear:', JSON.stringify(db));
await page.screenshot({ path:`${OUT}/ev-dashboard.png`, fullPage:true }); console.log('shot dashboard');
for(const [label,tab] of [['Club','Club'],['Stagione','Stagione'],['Agente','Agente']]){
  try{ await page.getByText(tab,{exact:false}).first().click({timeout:5000}); await sleep(1100);
    await page.screenshot({ path:`${OUT}/ev-${label.toLowerCase()}.png`, fullPage:true }); console.log('shot',label);}catch(e){console.log(label,'fail',e.message.slice(0,40));}
}
await browser.close(); srv.close(); process.exit(0);
