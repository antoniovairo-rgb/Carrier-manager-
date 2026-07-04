import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,140)));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await sleep(1500);
const res = await page.evaluate(()=>{
  const out={};
  const natClub={id:'it-nt',a:'ITA',p:82,c:'#003399',c2:'#fff',nat:'🇮🇹',lg:'Nazionale',n:'Italia'};
  const club={id:'juve',n:'Torino Athletic',a:'TAT',p:90,c:'#111',c2:'#fff',nat:'🇮🇹',lg:'Lega A'};
  try{ out.natStadiumName = getStadiumName(natClub); out.clubStadiumName = getStadiumName(club); }catch(e){out.nameErr=e.message;}
  try{ const cfgN=stadiumConfigFor(natClub,{}); const cfgC=stadiumConfigFor(club,{});
    out.natCfg={tpl:cfgN.template,cap:cfgN.capacity,name:cfgN.name}; out.clubCfg={tpl:cfgC.template,cap:cfgC.capacity,name:cfgC.name}; }catch(e){out.cfgErr=e.message;}
  try{ if(typeof computeCrowdContext==='function'){
    const ccN=computeCrowdContext({context:'euroMondiale_ko',homeClub:natClub,matchWeight:9,derby:false,isFinal:true});
    out.natCrowd={cap:ccN.capacity,att:ccN.attendance,tpl:ccN.stadiumTpl&&ccN.stadiumTpl.template};
  }}catch(e){out.crowdErr=e.message;}
  return out;
});
console.log(JSON.stringify(res,null,1));
await browser.close(); srv.close(); process.exit(0);
