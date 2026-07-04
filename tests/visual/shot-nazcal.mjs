import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT='/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 402, height: 900 } });
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,160)));
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = { phase:'career', player:{ name:'Francesco Vairo', nation:'Italia', avatarId:0, proStatus:'pro', season:12, week:14, age:26, ovr:85, tutorialDone:true,
    club:{ id:'juve', n:'Torino Athletic', a:'TAT', p:90, c:'#111', c2:'#fff', nat:'🇮🇹', lg:'Lega A' },
    stats:{ 'velocità':86, tecnica:84, fisico:80, 'mentalità':83, tiro:88, passaggio:82, dribbling:85, posizionamento:84 },
    goals:15, assists:9, matches:14, totalGoals:120, totalMatches:280, totalAssists:70, trophies:[{},{}],
    form:82, morale:80, fatigue:22, coachTrust:78, popularity:65, value:45, bankBalance:5200000,
    nationalCaps:15, nationalGoals:15, lastNationalSeason:12,
    euroMondiale:{active:true,type:'Europeo',phase:'group',groupMatchIdx:1,groupOpponents:['Spagna','Germania','Francia'],groupMatches:[{opp:'Spagna',played:true,won:true}],season:12},
    contract:{ duration:3, wage:60000, expiresAtSeason:15 }, log:[] } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000});
await sleep(1500);
try{ await page.getByText('Continua',{exact:false}).first().click({timeout:6000}); }catch(e){}
await page.waitForFunction(()=>!!window.__CPM_CAREER,{timeout:15000}).catch(()=>{});
await sleep(1000);
try{ await page.getByText('Carriera',{exact:false}).first().click({timeout:5000}); await sleep(700);}catch(e){}
try{ await page.getByText('Nazionale',{exact:false}).first().click({timeout:5000}); await sleep(1000);}catch(e){console.log('naz nav fail');}
const has=await page.evaluate(()=>({
  cal:[...document.querySelectorAll('*')].some(n=>n.children.length===0&&/Calendario Nazionale/i.test(n.textContent||'')),
  next:[...document.querySelectorAll('*')].some(n=>n.children.length===0&&/prossima gara/i.test(n.textContent||'')),
  tornei:[...document.querySelectorAll('*')].some(n=>n.children.length===0&&/Prossimi tornei/i.test(n.textContent||'')),
}));
console.log('CALENDAR', JSON.stringify(has));
await page.screenshot({ path:`${OUT}/nazcal.png`, fullPage:true });
console.log('shot done');
await browser.close(); srv.close(); process.exit(0);
