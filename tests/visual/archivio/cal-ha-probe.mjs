import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,140)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await sleep(1500);
const res = await page.evaluate(()=>{
  if(typeof generateSeasonCalendar!=='function') return {err:'fns not global'};
  const pool = (typeof U18_CLUBS_P2!=='undefined')?U18_CLUBS_P2:(typeof U18_CLUBS!=='undefined'?U18_CLUBS:[]);
  const club=pool[0];
  const out=[];
  for(let s=1;s<=4;s++){
    const seed=s*777+ (typeof hashStr==='function'?hashStr(club.id):s);
    const cal=generateSeasonCalendar(club, pool, seed);
    const home=cal.filter(m=>m.isHome).length, away=cal.filter(m=>!m.isHome).length;
    let consec=0; for(let i=1;i<cal.length;i++) if(cal[i].opponentId===cal[i-1].opponentId) consec++;
    // longest away streak
    let curAway=0,maxAway=0,curHome=0,maxHome=0;
    for(const m of cal){ if(m.isHome){curHome++;maxHome=Math.max(maxHome,curHome);curAway=0;} else {curAway++;maxAway=Math.max(maxAway,curAway);curHome=0;} }
    out.push({season:s, len:cal.length, home, away, consecSameOpp:consec, maxAwayStreak:maxAway, maxHomeStreak:maxHome,
      seq: cal.slice(0,8).map(m=>(m.isHome?'H:':'A:')+(m.opponentName||m.opponentId||'').slice(0,6)) });
  }
  return {club:club.n||club.id, out};
});
console.log(JSON.stringify(res,null,1));
await browser.close(); srv.close(); process.exit(0);
