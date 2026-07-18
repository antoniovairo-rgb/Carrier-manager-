/* [7.123.0] verifica storico piazzamenti COMPLETO: uncap (>8 stagioni) + match per ID (robusto ai rinomini). */
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
// 12 stagioni pro archiviate allo STESSO club (id 'sal'), di cui le ultime 3 con playerClub RINOMINATO
// (simula _syncClub70): senza il match per ID il vecchio filtro-per-nome le taglierebbe.
const arch = [];
for (let s = 1; s <= 12; s++) {
  arch.push({ season: s, league: 'Lega A', champion: '–', championId: '–',
    playerClub: s >= 10 ? 'US Salernum' /* nome rinominato */ : 'FC Salernum',
    playerClubId: 'sal', playerPos: ((s * 3) % 17) + 1, playerGoals: 10 + s, playerAssists: 4,
    relegated: [], isPlayerCupChamp: s === 6, isPlayerEuroChamp: false,
    cupR: s === 6 ? 'W' : 2, euroPlayed: null, euroEnd: null });
}
const save = { phase:'career', player:{ name:'Storia Probe', nation:'Italia', avatarId:0, proStatus:'pro',
  season:13, week:12, weekLived:false, age:29, ovr:84, tutorialDone:true, campDone:true,
  jerseyNumSeason:13, presidentModalSeason:13, drawSeen:13, squadRole:'titolare', coachTrust:80,
  value:60, popularity:70, goals:12, assists:5, matches:12, totalGoals:140, totalMatches:250,
  leagueArchive: arch,
  matchHistory:[{opponent:'FC Rivale',rating:7.4,goals:1,assists:0,won:true,drew:false,homeScore:2,awayScore:1,week:11}],
  seasonObjectives:{position:5}, records:{topSeasonGoals:24,topSeasonAssists:9,topOvr:84},
  club:{ id:'sal', n:'US Salernum', a:'SAL', p:55, c:'#6c1f2e', c2:'#f5f5f4', nat:'🇮🇹', lg:'Lega A' },
  stats:{ 'velocità':83, tecnica:83, fisico:81, 'mentalità':83, tiro:85, passaggio:82, dribbling:84, posizionamento:83 },
  form:78, morale:72, fatigue:18, contract:{ duration:3, wage:30000, expiresAtSeason:16 }, bankBalance:900000 } };
const page = await browser.newPage({ viewport:{ width:480, height:2200 } });
await installCdnRoutes(page);
const errs=[]; page.on('pageerror', e=>errs.push(String(e.message).slice(0,140)));
await page.addInitScript((o)=>{ window.__CPM_GLB=false; localStorage.setItem('cpm-v3', JSON.stringify(o)); }, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:40000 });
await page.waitForFunction(()=>{ const r=document.getElementById('root'); return r && r.children.length>0; }, null, { timeout:60000 });
await sleep(1600);
try { await page.getByText('Continua',{exact:false}).first().click({timeout:2500}); } catch(e){}
await sleep(400);
try { await page.evaluate(()=>window.__CPM_CAREER && window.__CPM_CAREER.dismiss && window.__CPM_CAREER.dismiss()); } catch(e){}
await sleep(400);
// naviga al Tab Club (nav bar in basso: label ESATTA "Club" su un leaf)
const clickNav = async(label)=>{ await page.evaluate((lb)=>{ const el=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&(e.textContent||'').trim()===lb); if(el){ let t=el; for(let i=0;i<5&&t;i++){ if(t.onclick||t.getAttribute('role')==='button'){t.click();return;} t=t.parentElement; } el.click(); } }, label); await sleep(900); };
await clickNav('Club');
await sleep(600);
// conta le righe S.N nello storico piazzamenti
const seasons = await page.evaluate(()=>{
  // segmento di testo tra l'header «Storico piazzamenti» e la card successiva «Contratto»
  const body=document.body.innerText||document.body.textContent||'';
  const i0=body.search(/Storico piazzamenti/i); if(i0<0) return { found:false };
  const rest=body.slice(i0);
  const iEnd=rest.search(/Contratto/i);
  const seg=iEnd>0?rest.slice(0,iEnd):rest;
  const m=[...seg.matchAll(/S\.(\d+)/g)].map(x=>+x[1]).filter(n=>n>=1&&n<=12);
  return { found:true, seasons:[...new Set(m)].sort((a,b)=>a-b) };
});
const fs=await import('node:fs'); const path=await import('node:path');
fs.writeFileSync(path.join(ROOT,'tests/visual/out/placement-history.png'), await page.screenshot({fullPage:false}));
let ok=true;
if(!seasons.found){ console.log('❌ card storico piazzamenti non trovata'); ok=false; }
else {
  const expect=Array.from({length:12},(_,i)=>i+1);
  const missing=expect.filter(s=>!seasons.seasons.includes(s));
  console.log('stagioni mostrate:', seasons.seasons.join(','));
  if(missing.length){ console.log('❌ mancano stagioni:', missing.join(',')); ok=false; }
  else console.log('✅ tutte le 12 stagioni mostrate (uncap + match per ID sui rinomini S.10-12)');
}
console.log('pageerr', errs.length?errs.slice(0,3):0);
await browser.close(); srv.close();
process.exit(ok&&errs.length===0?0:1);
