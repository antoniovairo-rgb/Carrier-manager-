/* [giro 36 PO-262, sonda di sola misura] DOVE DIVERGONO N PARTITE IDENTICHE, SUL PRIMO TRATTO.
   Gioca N volte la stessa partita (stesso nome, stesso seme di autoplay, velocita' a turno da SP) fino al minuto STOP e salva per
   ogni giro: cronaca alla sorgente (__CPM_TXT487), timeline, conteggio dei sorteggi `_rndM` per minuto (__CPM_RNDM959).
   Variabili: N (giri) · SP=1,2 (velocita' a turno) · STOP (minuto) · OUT (json) · ROOTDIR (cartella con un altro
   CARRIER-MANAGER-AV.html, per la bisezione sulle release) · FLAG (una bandiera window.* da accendere) · OVR=1 (sostituisce
   `getStartPos` con una versione seedata dall'esterno: controprova sulle build vecchie, che non hanno __CPM_NO_SP262).
   Il confronto si fa a parte: i giri vanno raggruppati per sequenza identica sul prefisso comune. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const N=+(process.env.N||3), SP=(process.env.SP||'1,1,1').split(',').map(Number), STOP=+(process.env.STOP||14);
const srv=await startServer(process.env.ROOTDIR||undefined); const port=srv.address().port; const b=await launchBrowser();
const out=[];
for(let k=0;k<N;k++){
  const page=await b.newPage({viewport:{width:900,height:900}}); await installCdnRoutes(page);
  await page.addInitScript(o=>{window.__CPM_GLB=false;window.__CPM_TXT487=null;window.__CPM_RNDM959={};window.__CPM_RNDM262={};window.__CPM_ST262={};window.__CPM_PP262=[];window.__CPM_ST262FULL=['pp','mot'];if(o.f)window[o.f]=1;try{localStorage.setItem('cpm-match-speed',String(o.v));}catch(e){}},{v:SP[k%SP.length],f:process.env.FLAG||null});
  await openMatch(page,port,{skipLoadAll:true});
  if(process.env.OVR){const ok=await page.evaluate(()=>{try{if(typeof window.getStartPos!=='function')return 'nofn';let a=0x1234567;const mb=()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};window.getStartPos=function(sit){const sz=(sit&&sit.startZone)||{x:[55,72],y:[30,70]};const r=(x,y)=>Math.floor(mb()*(y-x+1))+x;return{x:r(sz.x[0],sz.x[1]),y:r(sz.y[0],sz.y[1])};};return 'ok';}catch(e){return String(e)}});console.error('OVR',ok);}
  await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:12345,policy:'seeded',tickMs:350}));
  const t0=Date.now();
  while(Date.now()-t0<200000){await sleep(400);const m=await page.evaluate(()=>{const t=window.__CPM_TXT487||[];return t.length?t[t.length-1].m:0;});if(m>=STOP)break;}
  const r=await page.evaluate(()=>{const j=x=>{try{return JSON.parse(JSON.stringify(x))}catch(e){return String(e)}};return {tl:j(window.__CPM_TIMELINE?window.__CPM_TIMELINE():null),ev:j(window.__CPM_EV),txt:j(window.__CPM_TXT487),rn:j(window.__CPM_RNDM959)};});
  out.push(r); await page.close();
}
await b.close(); srv.close();
const fs=await import('fs'); fs.writeFileSync(process.env.OUT||'/tmp/claude-0/div262.json',JSON.stringify(out));
console.log('ok',out.map(o=>(o.txt||[]).length));
