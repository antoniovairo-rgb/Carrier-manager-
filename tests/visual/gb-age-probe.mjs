import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await sleep(1500);
const res = await page.evaluate(()=>{
  const result={won:true,drew:false,homeScore:3,awayScore:0,opponent:'FC Nap',oppAbbr:'NAP',goals:1,assists:1,rating:7.1};
  const perf={name:'Francesco Vairo',club:'FC Werkstadt',goals:1,assists:1,rating:7.1};
  const old=generateLocalPressAnalysis(result,perf,{season:12,age:28,goldenBoys:[6]});   // ex-GB, 28yo
  const young=generateLocalPressAnalysis(result,perf,{season:4,age:21,goldenBoys:[3]});   // GB, 21yo
  const j=r=>JSON.stringify(r.headlines||[]);
  return { at28_mentionsMigliorGiovane:/Miglior Giovane/.test(j(old)), at21_mentionsMigliorGiovane:/Miglior Giovane/.test(j(young)), at28_head:j(old).slice(0,120) };
});
console.log(JSON.stringify(res,null,1));
await browser.close(); srv.close(); process.exit(0);
