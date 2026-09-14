import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT='/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad';
const srv=await startServer(); const port=srv.address().port;
const br=await launchBrowser(); const page=await br.newPage({viewport:{width:402,height:850}});
await installCdnRoutes(page);
page.on('pageerror',e=>console.log('PAGEERR',String(e.message).slice(0,90)));
// seed 2 saves so slots show avatars
await page.addInitScript(()=>{ window.__CPM_GLB=false;
  localStorage.setItem('cpm-v3', JSON.stringify({phase:'home',player:{name:'Leo Bianchi',avatarId:6,club:{n:'FC Werkstadt'},season:3,week:14,ovr:82,savedAt:Date.now()}}));
  localStorage.setItem('cpm-v3-s2', JSON.stringify({phase:'home',player:{name:'Diego Sanz',avatarId:10,club:{n:'FC Perico'},season:1,week:8,ovr:64,savedAt:Date.now()}}));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, {waitUntil:'load',timeout:30000});
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000});
await sleep(2000);
await page.screenshot({path:`${OUT}/ev-home.png`,fullPage:true}); console.log('shot home');
await br.close(); srv.close(); process.exit(0);
