import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT='/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 402, height: 850 } });
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,160)));
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = { phase:'career', player:{ name:'Leo Bianchi', nation:'Italia', avatarId:0, proStatus:'pro', season:5, week:14, age:24, ovr:80, tutorialDone:true,
    club:{ id:'b04', n:'FC Werkstadt', a:'WRK', p:80, c:'#dc2626', c2:'#111111', nat:'🇩🇪', lg:'Deutsche Liga' },
    stats:{ 'velocità':82, tecnica:79, fisico:74, 'mentalità':77, tiro:81, passaggio:76, dribbling:80, posizionamento:78 },
    goals:12, assists:7, matches:14, totalGoals:41, totalMatches:78, totalAssists:22, trophies:[{}],
    form:78, morale:74, fatigue:22, coachTrust:68, popularity:55, value:14.5, bankBalance:820000,
    fitnessCoachRel:62, assistantCoachRel:58, teamChemistry:71, jerseyNum:10,
    standings:[{id:'b04',pts:28,gf:30,ga:18,w:9,d:1,l:4}], contract:{ duration:3, wage:9000, expiresAtSeason:8 }, log:['⚽ Gol'] } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000});
await sleep(1500);
try{ await page.getByText('Continua',{exact:false}).first().click({timeout:6000}); }catch(e){}
await page.waitForFunction(()=>!!window.__CPM_CAREER,{timeout:15000}).catch(()=>{});
await sleep(1000);
const q=async(re)=>page.evaluate((r)=>[...document.querySelectorAll('*')].some(n=>n.children.length===0&&new RegExp(r,'i').test((n.textContent||'').trim())), re);
// Home: should NOT have Staff or Risultati Internazionali
const homeStaff=await q('Staff & Spogliatoio'); const homeIntl=await q('Risultati Internazionali');
console.log('HOME staff=',homeStaff,'intl=',homeIntl,'(both should be false)');
// Club tab
try{ await page.getByText('Club',{exact:false}).first().click({timeout:5000}); await sleep(900);}catch(e){console.log('club nav fail');}
const clubStaff=await q('Staff & Spogliatoio');
console.log('CLUB staff=',clubStaff,'(should be true)');
await page.screenshot({ path:`${OUT}/move-club.png`, fullPage:true });
// Stagione → Classifica
try{ await page.getByText('Stagione',{exact:false}).first().click({timeout:5000}); await sleep(900);}catch(e){console.log('stagione nav fail');}
const stagIntl=await q('Risultati Internazionali');
console.log('STAGIONE intl=',stagIntl,'(should be true)');
await page.screenshot({ path:`${OUT}/move-stagione.png`, fullPage:true });
await browser.close(); srv.close(); process.exit(0);
