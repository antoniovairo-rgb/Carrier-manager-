import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const OUT='/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 402, height: 850 } });
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,160)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000});
await sleep(1500);
// Home → Nuova carriera / Crea
try{ await page.getByText('Nuova',{exact:false}).first().click({timeout:5000}); await sleep(1200);}catch(e){
  try{ await page.getByText('Crea',{exact:false}).first().click({timeout:4000}); await sleep(1200);}catch(e2){console.log('nav create fail',e.message.slice(0,50));}
}
const info = await page.evaluate(()=>{
  const btns=[...document.querySelectorAll('button')].filter(b=>/aspetto/i.test(''));
  // count avatar swatch buttons: those containing an <svg> inside a grid of 5
  const grids=[...document.querySelectorAll('div')].filter(d=>{const s=getComputedStyle(d);return /repeat\(5/.test(s.gridTemplateColumns)||s.gridTemplateColumns.split(' ').length===5;});
  const svgCount=document.querySelectorAll('svg').length;
  const pager=[...document.querySelectorAll('*')].some(n=>n.children.length===0&&/^\d\/\d$/.test((n.textContent||'').trim()));
  return {grids:grids.length, svgCount, hasPager:pager};
});
console.log('INFO', JSON.stringify(info));
await page.screenshot({ path:`${OUT}/avatars10.png`, fullPage:true });
console.log('shot done');
await browser.close(); srv.close(); process.exit(0);
