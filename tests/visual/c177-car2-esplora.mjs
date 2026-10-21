import { apri, vai, testo, bottoni, foto, sleep, clickByText } from './c177-car2-lib.mjs';
const S = await apri(); 
await S.ctx.addInitScript(()=>{ try{localStorage.setItem('cpm-match-speed','2');}catch(e){} });
await vai(S);
const p = S.page;
await clickByText(p, 'Nuova carriera'); await sleep(800);
await p.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); }, 'Marco Vairone');
await clickByText(p, 'Inizia i provini'); await sleep(900);
await clickByText(p, 'Inizia il provino');
let lastPh='';
for(let i=0;i<400;i++){ await sleep(1000);
  const ph=await p.evaluate(()=>window.__CPM_PHASE?window.__CPM_PHASE():null);
  if(ph!==lastPh){ lastPh=ph; const t=(await testo(p)).replace(/\n+/g,' | ').slice(0,420); console.log(i,'s',ph,'::',t, '\n   B:', (await bottoni(p)).filter(x=>x).slice(0,8).join(' ## ')); if(!['playing'].includes(ph)) await foto(S,'_ph-'+ph+'-'+i);}
  if(ph==='hl_choose'){ const ok=await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.offsetParent&&/·\s*\d+\s*$/.test(x.textContent.trim()));if(b.length){b[b.length-1].click();return true}return false}); }
  if(ph==='ended'||ph==='ceremony') {await sleep(1500); break;}
}
console.log('FINE', (await testo(p)).replace(/\n+/g,' | ').slice(0,1500)); console.log(await bottoni(p));
await foto(S,'_fine');
await S.browser.close(); S.srv.close();
