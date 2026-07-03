import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT='/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad';
const DARK = process.argv.includes('--dark');
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 402, height: 850 } });
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,120)));
await page.addInitScript((dark) => {
  window.__CPM_GLB = false;
  if (dark) localStorage.setItem('cpm-dark','1');
  const save = { phase:'career', player:{ name:'Leo Bianchi', nation:'Italia', avatarId:0, proStatus:'pro', season:3, week:14, age:22, ovr:78, tutorialDone:true,
    club:{ id:'b04', n:'FC Werkstadt', a:'WRK', p:80, c:'#dc2626', c2:'#111111', nat:'🇩🇪', lg:'Deutsche Liga' },
    stats:{ 'velocità':82, tecnica:79, fisico:74, 'mentalità':77, tiro:81, passaggio:76, dribbling:80, posizionamento:78 },
    goals:12, assists:7, matches:14, totalGoals:41, totalMatches:78, totalAssists:22, trophies:[{}],
    form:78, morale:74, fatigue:22, coachTrust:68, popularity:55, value:14.5, bankBalance:820000,
    fitnessCoachRel:62, assistantCoachRel:58, teamChemistry:71,
    matchHistory:[{won:true,drew:false,homeScore:2,awayScore:1,opponent:'FC Nord',rating:7.8,goals:1,assists:1,week:13},{won:false,drew:true,homeScore:1,awayScore:1,opponent:'SV Ost',rating:6.5,goals:0,assists:0,week:12},{won:true,drew:false,homeScore:3,awayScore:0,opponent:'TSV Süd',rating:8.4,goals:2,assists:0,week:11},{won:true,drew:false,homeScore:2,awayScore:0,opponent:'FC West',rating:7.2,goals:1,assists:1,week:10},{won:false,drew:false,homeScore:0,awayScore:2,opponent:'FC Kron',rating:5.4,goals:0,assists:0,week:9}],
    goalStreak:3, seasonObjectives:[{type:'goals',target:15,label:'Segna 15 gol'},{type:'standing',target:4,label:'Top 4 in campionato'}],
    contract:{ duration:3, wage:9000, expiresAtSeason:6 }, log:['⚽ Gol vs FC Nord','🏆 Nominato MVP del mese','📈 Valore di mercato in crescita'] } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
}, DARK);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000});
await sleep(1500);
const tag = DARK?'dark':'light';
// enter career
try{ await page.getByText('Continua',{exact:false}).first().click({timeout:6000}); }catch(e){console.log('continua fail',e.message.slice(0,50));}
await page.waitForFunction(()=>!!window.__CPM_CAREER,{timeout:15000}).catch(()=>{});
await sleep(1500);
await page.screenshot({ path:`${OUT}/now-dashboard-${tag}.png`, fullPage:true });
console.log('shot dashboard', tag);
// Profilo tab: click nav "Carriera" then "Profilo"
try{ await page.getByText('Carriera',{exact:false}).first().click({timeout:5000}); await sleep(1000);
  await page.screenshot({ path:`${OUT}/now-profile-${tag}.png`, fullPage:true }); console.log('shot profile', tag);}catch(e){console.log('profile nav fail',e.message.slice(0,60));}
// Agente (per confronto volti eroe vs agente)
try{ await page.getByText('Agente',{exact:false}).first().click({timeout:5000}); await sleep(1000);
  await page.screenshot({ path:`${OUT}/now-agente-${tag}.png`, fullPage:true }); console.log('shot agente', tag);}catch(e){console.log('agente nav fail',e.message.slice(0,60));}
await browser.close(); srv.close(); process.exit(0);
