import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,140)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await page.waitForFunction(()=>typeof window.generateSeasonCalendar==='function'||document.getElementById('root'),{timeout:40000}).catch(()=>{});
await sleep(1500);
const res = await page.evaluate(()=>{
  if(typeof generateSeasonCalendar!=='function'||typeof U18_CLUBS_P2==='undefined') return {err:'fns not global'};
  const out=[];
  // simulate several U18 P2 seasons
  const pool = (typeof U18_CLUBS_P2!=='undefined')?U18_CLUBS_P2:(typeof U18_CLUBS!=='undefined'?U18_CLUBS:[]);
  for(let s=1;s<=6;s++){
    const club=pool[0];
    const seed=s*777+ (typeof hashStr==='function'?hashStr(club.id):s);
    const cal=generateSeasonCalendar(club, pool, seed);
    let consecDup=0, trueDup=0; const seen=new Set();
    for(let i=0;i<cal.length;i++){
      const k=cal[i].opponentId+'|'+cal[i].isHome+'|'+cal[i].week;
      if(seen.has(k)) trueDup++; seen.add(k);
      if(i>0 && cal[i].opponentId===cal[i-1].opponentId) consecDup++;
    }
    out.push({season:s, len:cal.length, consecSameOpp:consecDup, trueDupEntries:trueDup});
  }
  return {out};
});
console.log(JSON.stringify(res,null,1));
await browser.close(); srv.close(); process.exit(0);
