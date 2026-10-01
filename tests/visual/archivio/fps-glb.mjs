#!/usr/bin/env node
/* [D7 — carta bianca PO 15/09 sulle librerie] BANCO fps con i 22 corpi GLB in gioco aperto. Misura appaiata fra
   l'asset di oggi e un corpo semplificato offline (gltf-transform simplify): CPM_GLB_URL=./assets/footballer-s05.glb.
   Campiona __CPM_FPS708 (EMA del frame-rate reale) ogni 500 ms per CPM_SEC secondi di `playing`, con i corpi
   visibili (__CPM_VIS665). DICHIARATO: Chromium software-GL, non il telefono del PO: vale il CONFRONTO, non il valore. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const URL_GLB=process.env.CPM_GLB_URL||'';const SEC=+(process.env.CPM_SEC||60);
const srv=await startServer();const port=srv.address().port;const b=await launchBrowser();
const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:1,isMobile:true,hasTouch:true});
const page=await ctx.newPage();await installCdnRoutes(page);
const errs=[];page.on('pageerror',e=>errs.push(String(e.message).slice(0,120)));
await page.addInitScript(u=>{window.__CPM_GLB=true;window.__CPM_DTREAL=true;if(u)window.__CPM_GLB_URL=u;},URL_GLB);
await openMatch(page,port,{skipLoadAll:true});
await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:4242,policy:'seeded',tickMs:300}));
await sleep(12000);/* caricamento dei GLB */
const fps=[],corpi=[];const t0=Date.now();
while(Date.now()-t0<SEC*1000){await sleep(500);
  const s=await page.evaluate(()=>{try{const v=window.__CPM_VIS665&&window.__CPM_VIS665();return {ph:(window.__CPM_PHASE&&window.__CPM_PHASE())||'?',fps:window.__CPM_FPS708||0,glb:v?v.glb|0:null,proc:v?v.proc|0:null};}catch(e){return null;}});
  if(!s||s.ph!=='playing')continue;fps.push(s.fps);corpi.push((s.glb|0)+(s.proc|0));}
fps.sort((a,b)=>a-b);const med=fps.length?fps[fps.length>>1]:null,p10=fps.length?fps[Math.floor(fps.length*0.1)]:null;
const cm=corpi.length?corpi.sort((a,b)=>a-b)[corpi.length>>1]:null;
console.log(`asset ${URL_GLB||'./assets/footballer.glb (oggi)'} · campioni in playing ${fps.length} · fps mediana ${med!=null?med.toFixed(1):'?'} · p10 ${p10!=null?p10.toFixed(1):'?'} · corpi visibili mediana ${cm}${errs.length?' · pageerror: '+errs[0]:''}`);
await b.close();srv.close();
