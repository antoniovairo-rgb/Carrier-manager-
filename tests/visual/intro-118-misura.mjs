import { startServer, launchBrowser, installCdnRoutes, sleep } from './c178-graf-lib.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const F = [{n:'s360',w:360,h:800,t:1},{n:'s412',w:412,h:915,t:1},{n:'pc',w:1440,h:900,t:0}];
for (const f of F) {
  const opt = { viewport:{width:f.w,height:f.h}, deviceScaleFactor:1, serviceWorkers:'block' }; if (f.t){opt.isMobile=true;opt.hasTouch=true;}
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs=[]; page.on('pageerror',e=>errs.push(String(e.message).slice(0,120)));
  await page.addInitScript(()=>{try{localStorage.setItem('cpm-intro-seen','1');localStorage.setItem('cpm-dark','0');}catch(e){} window.__CPM_GLB=true;});
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'load',timeout:120000});
  await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},null,{timeout:90000}); await sleep(2500);
  await page.evaluate(()=>{window.__CPM_GLB=true;window.__CPM_INTRO115={};window.__CPM_INTRO118={};window.dispatchEvent(new CustomEvent('cpm-replay-intro'));});
  const t0=Date.now(); let ch=false; while(Date.now()-t0<90000&&!ch){await sleep(500);ch=await page.evaluate(()=>!!(window.__CPM_INTRO115&&window.__CPM_INTRO115.chiusa));}
  const s=await page.evaluate(()=>(window.__CPM_INTRO118||{}).s||[]);
  console.log(f.n,'campioni',s.length,'errs',errs.join('|'));
  const pick=[0.05,0.2,0.4,0.6,0.8,0.95].map(q=>s[Math.floor(q*(s.length-1))]).filter(Boolean);
  for(const x of pick)console.log(' el',x.el,'GK',JSON.stringify(x.gk),'idle',JSON.stringify(x.gkIdle),'| H',JSON.stringify(x.hero));
  const pre=s.filter(x=>x.el<8.7); const mn=a=>Math.min(...a), mx=a=>Math.max(...a);
  if(pre.length)console.log(' PRE-TUFFO (el<8.7): GK piedi min',mn(pre.map(x=>x.gk.ft)),'max',mx(pre.map(x=>x.gk.ft)),'lo',mn(pre.map(x=>x.gk.lo)),mx(pre.map(x=>x.gk.lo)),'| GK z',mn(pre.map(x=>x.gk.z)),mx(pre.map(x=>x.gk.z)),'| H ft',mn(pre.map(x=>x.hero.ft)),mx(pre.map(x=>x.hero.ft)));
  await ctx.close();
}
await b.close(); srv.close();
