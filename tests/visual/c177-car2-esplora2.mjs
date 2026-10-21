import { apri, vai, testo, bottoni, foto, sleep, clickByText } from './c177-car2-lib.mjs';
const S = await apri(); 
await S.ctx.addInitScript(()=>{ try{localStorage.setItem('cpm-match-speed','2');}catch(e){} });
await vai(S);
const p = S.page;
await clickByText(p, 'Nuova carriera'); await sleep(800);
await p.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); }, 'Marco Vairone');
await clickByText(p, 'Inizia i provini'); await sleep(900);
await clickByText(p, 'Inizia il provino');
await p.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:5,policy:'seeded',tickMs:300}));
let last='';
for(let i=0;i<400;i++){ await sleep(1500);
  const d=await p.evaluate(()=>({ph:window.__CPM_PHASE&&window.__CPM_PHASE(),sc:window.__CPM_SCORE&&JSON.stringify(window.__CPM_SCORE()),ck:window.__CPM_CLOCK&&window.__CPM_CLOCK(),dom:(document.body.innerText.match(/(\d+)\s*[–-]\s*(\d+)\n(\d+)'/)||[]).slice(0,4).join(',')}));
  const k=JSON.stringify(d); if(k!==last){last=k;console.log(i,JSON.stringify(d));}
  if(i%8==0 && d.ck>45 && d.ck<60) await foto(S,'_sc2t-'+i);
  if(d.ph==='ended'||d.ph==='ceremony') break;
}
await S.browser.close(); S.srv.close();
