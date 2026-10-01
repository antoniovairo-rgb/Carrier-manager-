/* [7.788 censimento] LE INDICAZIONI DEL MISTER: quante, quanto varie, e collegate a cosa.
   Domanda del PO in collaudo: «le indicazioni del mister sono collegate con le azioni? … devono essere
   davvero indicazioni utili e non ripetitive».
   Dal codice il collegamento c'e': `selectCoachOrder(minuto, punteggio, momentum, stanchezza)` sceglie
   fra nove ordini (rimonta, all_in, cerca_gol, gestisci_1, consolida, verticale, cavalca, pressing,
   intelligente) e l'ordine muove davvero tacticBonus, possesso, momentum e le linee. Le grida brevi
   (COACH_SHOUTS) seguono la FASE. Ma «collegato» non basta: qui si contano le voci di una partita
   intera, quante sono DIVERSE, e con quale stato del tabellone escono. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const N=+(process.env.CPM_PARTITE_G||3);const NOMI=(process.env.CPM_NOMI||'Ma,Mb,Mc').split(',');
const TUTTE=[];
for(let g=0;g<N;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;
    /* registratore test-only della voce di panchina: il riquadro vive in uno stato di React e sparisce
       dopo sei secondi, quindi da fuori non lo si puo' campionare a colpo sicuro. */
    /* ⚠️ [7.788] IL MutationObserver NON E' IL METRO GIUSTO per un riquadro che vive sei secondi e
       cambia per stato di React: due partite intere, ZERO voci contate, mentre il gioco le scriveva.
       Qui si campiona a intervalli dentro la pagina — mezzo secondo, che sta largo dentro i sei della
       dissolvenza — e si registra ogni testo nuovo che si vede. */
    const _o=[];window.__CPM_MISTER=_o;
    setInterval(()=>{try{const el=document.querySelector('[data-cpm="panchina"]');if(!el)return;
      const t=(el.innerText||'').replace(/\s+/g,' ').trim();if(!t)return;
      if(_o.length&&_o[_o.length-1].t===t)return;
      const ms=window.__CPM_MS&&window.__CPM_MS();
      _o.push({t,min:(ms&&ms.min)|0,sc:(ms&&ms.score)?ms.score.h+'-'+ms.score.a:'?'});}catch(e){}},500);});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g%NOMI.length]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),9100+g*733);
  let min=0;
  for(let k=0;k<40;k++){await sleep(20000);
    min=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});
    if(min>=89)break;}
  const v=await page.evaluate(()=>window.__CPM_MISTER||[]);
  console.log('--- partita '+g+' ['+NOMI[g%NOMI.length]+'] min '+min+' · voci di panchina: '+v.length);
  v.forEach(x=>console.log("    "+String(x.min).padStart(2)+"' ("+x.sc+")  "+x.t.slice(0,84)));
  TUTTE.push(...v);
  await ctx.close();
}
await b.close();srv.close();
const testi=TUTTE.map(x=>x.t);
const uniq=new Set(testi);
console.log('');
console.log('=== '+N+' partite intere ===');
console.log('voci di panchina totali: '+testi.length+'  ·  per partita: '+(testi.length/N).toFixed(1));
console.log('voci DIVERSE: '+uniq.size+'/'+testi.length+'  ('+(testi.length?Math.round(uniq.size/testi.length*100):0)+'%)');
const cnt={};testi.forEach(t=>{cnt[t]=(cnt[t]||0)+1;});
const rip=Object.entries(cnt).filter(([,n])=>n>1).sort((a,c)=>c[1]-a[1]);
console.log('ripetute: '+rip.length);
rip.slice(0,8).forEach(([t,n])=>console.log('   x'+n+'  '+t.slice(0,80)));
