import { apri, vai, testo, bottoni, foto, sleep, clickByText, clickTesto, giocaLive, fase } from './c177-car2-lib.mjs';
import fs from 'fs';
const S = await apri();
await S.ctx.addInitScript(()=>{ try{localStorage.setItem('cpm-match-speed','2');}catch(e){} });
await vai(S); const p = S.page;
await clickByText(p, 'Nuova carriera'); await sleep(800);
await p.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); }, 'Marco Vairone');
await clickByText(p, 'Inizia i provini'); await sleep(900);
for (let t=1;t<=3;t++){
  if (/Inizia il provino/.test((await bottoni(p)).join())) await clickByText(p, 'Inizia il provino');
  const r = await giocaLive(S, { scelte:[0,1,2,-1] });
  console.log('PROVINO',t,JSON.stringify({sc:r.scoreFine,n:r.hls.length,dur:r.durata}));
  fs.writeFileSync('/tmp/prov'+t+'.json', JSON.stringify(r,null,1));
  console.log((await bottoni(p)).join(' ## '));
  await foto(S,'_fine'+t);
  // continua
  for (let j=0;j<6;j++){ const c = await clickTesto(p, /Salta festeggiamenti|Risultati provino|Vai al Provino|Continua|Prosegui|Avanti|Prossimo|Offerte|Vedi le offerte/); console.log(' click', c); await sleep(900); console.log('  T:', (await testo(p)).replace(/\n+/g,' | ').slice(0,300)); console.log('  B:', (await bottoni(p)).filter(x=>x).slice(0,10).join(' ## ')); if(!c) break; if (/Inizia il provino/.test((await bottoni(p)).join())||/OFFERT/i.test(await testo(p))) break; }
}
console.log('FINE-INIZIO'); console.log((await testo(p)).replace(/\n+/g,' | ').slice(0,2500)); console.log((await bottoni(p)).filter(x=>x).join(' ## '));
await foto(S,'_offerte');
await S.browser.close(); S.srv.close();
