import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,140)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await sleep(1500);
const res = await page.evaluate(()=>{
  if(typeof CLUBS==='undefined') return {err:'no CLUBS'};
  const byLg={}, byNat={};
  CLUBS.forEach(c=>{byLg[c.lg]=(byLg[c.lg]||0)+1; byNat[c.nat]=(byNat[c.nat]||0)+1;});
  // simulate generateProContracts to see offer club leagues (if available)
  let offerLgs=null;
  try{
    if(typeof generateProContracts==='function'){
      const p={ovr:70,nation:'Italia',club:{nat:'🇮🇹',lg:'Primavera 1'},season:2,age:18,stats:{},archetype:'finisher'};
      const offs=generateProContracts(p);
      offerLgs=(offs||[]).map(o=>({ct:o.contractType,lg:o.club?.lg,nat:o.club?.nat,n:o.club?.n,inClubs:CLUBS.filter(c=>c.lg===o.club?.lg).length}));
    }
  }catch(e){offerLgs='err:'+e.message;}
  return {totalClubs:CLUBS.length, byLg, byNat, offerLgs};
});
console.log(JSON.stringify(res,null,1));
await browser.close(); srv.close(); process.exit(0);
