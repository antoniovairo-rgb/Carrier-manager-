/* [7.996.0] Sonda del VOLTO INTERO nella figurina (cinque commenti PO «il contorno taglia troppo il volto»).
   Rende la figurina vera del gioco a 8 larghezze e misura dal DOM il riquadro della foto: altezza/larghezza.
   Il ritratto e' quadrato, quindi 1,00 = volto intero; sotto 1 la foto «a riempimento» taglia fronte e mento.
   Atteso: >= 0,98 per ogni larghezza sotto i 120 px (la figurina ingrandita da 143 tiene la regola storica).
   CPM_ROSSO=1 → __CPM_NO_FOTO24: le figurine con testo tornano a tagliare, la sonda deve andare in rosso. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO=process.env.CPM_ROSSO==='1';
const srv=await startServer(); const port=srv.address().port; const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:414,height:896}}); await installCdnRoutes(page);
const errs=[]; page.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
await page.addInitScript((r)=>{window.__CPM_GLB=false;if(r)window.__CPM_NO_FOTO24=true;},ROSSO);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'load',timeout:30000});
await page.waitForFunction(()=>typeof window.Figurina==='function'||typeof Figurina==='function',{timeout:40000}).catch(()=>{});
const L=[36,44,52,58,64,80,100,143];
await page.evaluate((L)=>{const F=window.Figurina||Figurina;const host=document.createElement('div');host.id='fig24';host.style.cssText='position:fixed;left:0;top:0;z-index:99999;background:#fff;display:flex;flex-wrap:wrap;gap:8px;padding:8px;width:400px';document.body.appendChild(host);
  const els=L.map(l=>React.createElement('div',{key:l,'data-l':l},React.createElement(F,{tipo:'giocatore',chiave:'Marko Bauer',ruolo:'Attaccante · 24 anni',larg:l})));
  ReactDOM.createRoot(host).render(React.createElement(React.Fragment,null,els));},L);
await page.waitForFunction(()=>document.querySelectorAll('#fig24 img').length>=8,{timeout:20000}).catch(()=>{});
await sleep(800);
const R=await page.evaluate(()=>[...document.querySelectorAll('#fig24 [data-l]')].map(d=>{const img=d.querySelector('img');const box=img&&img.parentElement.getBoundingClientRect();
  const righe=[...d.querySelectorAll('[data-cpm-figurina] > div')].length;return {l:+d.dataset.l,foto:img?+(box.height/box.width).toFixed(3):null,testo:(d.innerText||'').replace(/\s+/g,' ').trim()};}));
await page.locator('#fig24').screenshot({path:'/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/figurina24'+(ROSSO?'-rosso':'')+'.png'}).catch(()=>{});
const fails=[];for(const r of R){if(r.foto==null)fails.push(`larg ${r.l}: nessuna foto`);else if(r.l<120&&r.foto<0.98)fails.push(`larg ${r.l}: foto ${r.foto} (tagliata)`);}
if(R.length<8)fails.push(`rese ${R.length}/8 figurine`);
console.log(JSON.stringify(R,null,0).replace(/},/g,'},\n'));console.log('fails',JSON.stringify(fails));if(errs.length)console.log('errs',errs);
await browser.close();srv.close();const ok=fails.length===0&&errs.length===0;console.log(ok?'✅ PASS figurina-volto24':'❌ FAIL figurina-volto24');process.exit(ok?0:1);
