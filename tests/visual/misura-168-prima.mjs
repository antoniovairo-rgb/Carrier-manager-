import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'fs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const SAVE = JSON.parse(fs.readFileSync('fixtures/save-190-s12-ovr93.json','utf8'));
async function apri(init) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const pe=[]; page.on('pageerror', e => pe.push(String(e.message).slice(0,100)));
  await page.addInitScript(init.fn, init.arg);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500); return { ctx, page, pe };
}
const out={};
// 1) quota localStorage
{ const {ctx,page}=await apri({fn:()=>{window.__CPM_GLB=false;},arg:0});
  out.quota=await page.evaluate(()=>{localStorage.clear();const blk='x'.repeat(100000);let n=0;try{for(;;){localStorage.setItem('q'+n,blk);n++;}}catch(e){}let fine=blk.length;let lo=0,hi=100000;while(lo<hi){const m=(lo+hi+1)>>1;try{localStorage.setItem('qz','x'.repeat(m));lo=m;}catch(e){hi=m-1;}}const tot=n*100000+lo;localStorage.clear();return {caratteri:tot,errore:'QuotaExceededError'};});
  await ctx.close(); }
// 2) save lungo: dimensione scritta
{ const {ctx,page,pe}=await apri({fn:(sv)=>{window.__CPM_GLB=false;if(!sessionStorage.getItem('s')){sessionStorage.setItem('s','1');localStorage.setItem('cpm-v3',JSON.stringify(sv));}},arg:SAVE});
  try{await page.getByText('CONTINUA',{exact:false}).first().click({timeout:8000});}catch(e){}
  await page.waitForFunction(()=>!!window.__CPM_CAREER,{timeout:20000}); await sleep(2000);
  await page.evaluate(()=>window.__CPM_CAREER.patch({bankBalance:12345})); await sleep(1500);
  out.save=await page.evaluate(()=>{const r={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);r[k]=localStorage.getItem(k).length;}return r;});
  out.persist=await page.evaluate(async()=>({api:!!(navigator.storage&&navigator.storage.persist),persisted:navigator.storage&&navigator.storage.persisted?await navigator.storage.persisted():null,estimate:navigator.storage&&navigator.storage.estimate?await navigator.storage.estimate():null}));
  // 3) errori fuori da React
  await page.evaluate(()=>{setTimeout(()=>{throw new Error('prova-168-sync');},10);Promise.reject(new Error('prova-168-promise'));}); await sleep(800);
  out.erroriFuoriReact={pageerror:pe.slice(),chiaviLog:await page.evaluate(()=>Object.keys(localStorage).filter(k=>/err|log/i.test(k)))};
  // 4) errore di render in una schermata
  await page.evaluate(()=>window.__CPM_CAREER.patch({stats:null})); await sleep(1500);
  out.erroreRender={testo:(await page.evaluate(()=>document.body.innerText)).slice(0,300),chiaviLog:await page.evaluate(()=>Object.keys(localStorage).filter(k=>/err|log/i.test(k)))};
  await ctx.close(); }
// 5) slot corrotto senza riserva
{ const {ctx,page,pe}=await apri({fn:()=>{window.__CPM_GLB=false;localStorage.setItem('cpm-v3','{"phase":"career","player":{"name":"Tro');localStorage.removeItem('cpm-v3-riserva');},arg:0});
  out.corrotto={testo:(await page.evaluate(()=>document.body.innerText)).slice(0,400),pe}; await ctx.close(); }
console.log(JSON.stringify(out,null,1));
await b.close(); srv.close();
