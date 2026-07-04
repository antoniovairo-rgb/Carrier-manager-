import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,140)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await sleep(1500);
const res = await page.evaluate(()=>{
  // national match result: hero (Italia) beats Portogallo 2-1
  const result={won:true,drew:false,homeScore:2,awayScore:1,opponent:'Portogallo',oppAbbr:'POR',goals:2,assists:0,rating:7.4,context:'euroMondiale_ko'};
  const repNat=generateLocalPressAnalysis(result,{name:'Francesco Vairo',club:'Italia',goals:2,assists:0,rating:7.4},{season:12,age:26});
  const repClub=generateLocalPressAnalysis(result,{name:'Francesco Vairo',club:'FC Werkstadt',goals:2,assists:0,rating:7.4},{season:12,age:26});
  const j=(r)=>JSON.stringify(r.headlines||[]);
  return { natHeadlines:j(repNat), natMentionsItalia:/Italia/.test(j(repNat)), natMentionsWerk:/Werkstadt/.test(j(repNat)) };
});
console.log(JSON.stringify(res,null,1));
await browser.close(); srv.close(); process.exit(0);
