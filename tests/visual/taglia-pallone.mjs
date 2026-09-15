/* [7.899 — TAGLIA DEL PALLONE IN CAMPO LARGO] Nota PO 15/09: «pallone troppo grande e sproporzionato» (foto a
   centrocampo, 1,5×). Qui si fotografa la partita (GLB accesi, 412×915, screencast CDP, scena congelata) a tre minuti
   di gioco vivo e si misura sulla FOTO il diametro del pallone (pixel quasi bianchi attorno al punto proiettato) e, dal
   gancio __CPM_TAGLIA862, l'altezza a schermo di un uomo fermo sul pallone (hb) e il pavimento applicato (min).
   Metro: rapporto pallone/uomo alla stessa profondita'. CPM_ROSSO=__CPM_NO899 per la coppia. Foto in out/taglia-pallone/. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path'; import { PNG } from 'pngjs';
const ROSSO=(process.env.CPM_ROSSO||'').split(',').filter(Boolean);const TAG=ROSSO.length?'rosso':'verde';
const MINUTI=(process.env.CPM_MINUTI||'12,25,40').split(',').map(Number);
const OUT=path.join(__dirname,'out','taglia-pallone');fs.mkdirSync(OUT,{recursive:true});
const srv=await startServer();const port=srv.address().port;const b=await launchBrowser();
const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:1,isMobile:true,hasTouch:true});
const page=await ctx.newPage();await installCdnRoutes(page);
await page.addInitScript((r)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_REALWAIT=true;for(const k of r)window[k]=true;},ROSSO);
const cdp=await ctx.newCDPSession(page);let ultimo=null;
cdp.on('Page.screencastFrame',e=>{ultimo=Buffer.from(e.data,'base64');cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{});});
await cdp.send('Page.startScreencast',{format:'png',maxWidth:412,maxHeight:915,everyNthFrame:1});
await openMatch(page,port,{skipLoadAll:true,name:process.env.CPM_NOME||'Vairo'});
await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:4242,policy:'seeded',tickMs:300}));
const RIS=[];
for(const M of MINUTI){
  let ok=false;const t0=Date.now();
  while(Date.now()-t0<240000){await sleep(400);const s=await page.evaluate(()=>({min:(window.__CPM_CLOCK&&window.__CPM_CLOCK())|0,ph:(window.__CPM_PHASE&&window.__CPM_PHASE())||'?',w:(window.__CPM_WS&&window.__CPM_WS())||null}));
    if(s.ph==='ended')break;if(s.min>=M&&s.ph==='playing'&&s.w&&!(s.w.arc&&s.w.arc.on)){ok=true;break;}}
  if(!ok){console.log(`[${M}'] gioco vivo non raggiunto`);continue;}
  await page.evaluate(()=>{window.__CPM_FROZEN=true;});await sleep(900);ultimo=null;await sleep(700);
  const h=await page.evaluate(()=>{const T=window.__CPM_TAGLIA862||{};const c=document.querySelector('canvas');const r=c&&c.getBoundingClientRect();return{px:T.px?T.px[T.px.length-1]:null,out:T.out??null,hb:T.hb??null,min:T.min??null,ndc:T.ndc||null,up:T.up|0,hpx:T.hpx?T.hpx[T.hpx.length-1]:null,rect:r?{x:r.left,y:r.top,w:r.width,h:r.height}:null,min_:(window.__CPM_CLOCK&&window.__CPM_CLOCK())|0};});
  const foto=ultimo;const nome=`${TAG}-${M}.png`;if(foto)fs.writeFileSync(path.join(OUT,nome),foto);
  let dFoto=null;
  if(foto&&h.ndc&&h.rect){try{const png=PNG.sync.read(foto);const sx=Math.round(h.rect.x+(h.ndc[0]+1)/2*h.rect.w),sy=Math.round(h.rect.y+(1-h.ndc[1])/2*h.rect.h);
    let x0=1e9,x1=-1,y0=1e9,y1=-1;for(let y=Math.max(0,sy-30);y<Math.min(png.height,sy+30);y++)for(let x=Math.max(0,sx-30);x<Math.min(png.width,sx+30);x++){const i=(y*png.width+x)*4;const r=png.data[i],g=png.data[i+1],bb=png.data[i+2];if(r>200&&g>200&&bb>200&&Math.abs(r-g)<25&&Math.abs(g-bb)<25){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}
    if(x1>=x0)dFoto=Math.max(x1-x0+1,y1-y0+1);}catch(e){dFoto=null;}}
  const r={min:h.min_,px:h.out??h.px,nat:h.px,hb:h.hb,pav:h.min,dFoto,hpx:h.hpx,rap:((h.out??h.px)&&h.hb)?+((h.out??h.px)/h.hb).toFixed(2):null};RIS.push(r);
  console.log(`[${h.min_}'] pallone reso ${h.out??h.px} px (naturale ${h.px}) · in foto ${dFoto??'?'} px · uomo alla stessa profondita' ${h.hb} px · pavimento ${h.pav} · rapporto pallone/uomo ${r.rap} · eroe ${h.hpx} px · foto ${nome}`);
  await page.evaluate(()=>{window.__CPM_FROZEN=false;});
}
await b.close();srv.close();
const rr=RIS.filter(x=>x.rap!=null).map(x=>x.rap);
console.log(`\n=== ${TAG}: campioni ${RIS.length} · rapporto pallone/uomo mediana ${rr.length?rr.sort((a,c)=>a-c)[rr.length>>1]:'?'} (proporzione di base 0,25; calcio vero 0,125) · pallone px ${RIS.map(x=>x.px).join('/')} · foto px ${RIS.map(x=>x.dFoto).join('/')} ===`);
