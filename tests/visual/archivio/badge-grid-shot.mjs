/* [7.168.0] SHOT griglia scudetti moderni: 36 club rappresentativi (forme/pattern misti) via __CPM_TeamBadge. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage({ viewport: { width: 900, height: 760 } });
await installCdnRoutes(page);
const errs=[]; page.on('pageerror',e=>errs.push(String(e.message).slice(0,160)));
await page.addInitScript(()=>{window.__CPM_GLB=false;});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'load',timeout:40000});
await page.waitForFunction(()=>typeof window.__CPM_TeamBadge==='function'&&typeof window.CLUBS!=='undefined'||document.getElementById('root')?.children.length>0,null,{timeout:60000});
await sleep(2500);
const ok=await page.evaluate(()=>{
  if(typeof window.__CPM_TeamBadge!=='function')return 'no hook';
  const ids=['sal','gen','sam','juv','int','mil','nap','rom','laz','fio','ata','tor','bol','cag','ver','lec','pal','samp','bri','new','ars','avl','qpr','ray','bla','rma','bar','atm','bay','psg','por','spo','fey','gal','mon','cel'];
  const C=(typeof CLUBS!=='undefined')?CLUBS:[];
  const list=ids.map(i=>C.find(c=>c.id===i)).filter(Boolean).slice(0,36);
  const div=document.createElement('div');div.id='bgrid';div.style.cssText='position:fixed;inset:0;z-index:99999;background:#10141c;display:grid;grid-template-columns:repeat(6,1fr);gap:8px;padding:14px;overflow:auto;';
  document.body.appendChild(div);
  const root=ReactDOM.createRoot(div);
  const cells=list.map(c=>React.createElement('div',{key:c.id,style:{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px'}},
    React.createElement(window.__CPM_TeamBadge,{team:c,size:78}),
    React.createElement('div',{style:{color:'#9aa4b2',fontSize:'10px'}},c.id)));
  root.render(React.createElement('div',{style:{display:'contents'}},cells));
  return 'ok '+list.length;
});
console.log('grid:',ok);
await sleep(1200);
await page.screenshot({path:'out/badge-grid.png'});
console.log('errs:',errs.slice(0,2).join(' | ')||'none','→ out/badge-grid.png');
await browser.close();srv.close();
