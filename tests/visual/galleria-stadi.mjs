#!/usr/bin/env node
/* [Stadi — Fase 1: galleria/audit visivo (roadmap POC voce 8)] Fotografa ogni impianto (template forzato + capienza) da quattro
   inquadrature FISSE (camera di collaudo __CPM_CAM904), a ora congelata (__CPM_TOD, default night), cosi' gli stadi si confrontano
   a parita' di punto di vista. Scrive out/galleria-stadi/<caso>-<vista>.png e un indice JSON con template/capienza effettivi.
   CPM_NO=__CPM_NO_X,... accende interruttori rossi (foto in galleria-stadi-rosso).
   Uso: [CPM_CASI=provincia:3000,...] [CPM_TOD=day] node galleria-stadi.mjs   (strumento di collaudo, non guardiano) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const TOD=process.env.CPM_TOD||'night';
const NO=(process.env.CPM_NO||'').split(',').filter(Boolean);
const OUT=path.join(__dirname,'..','out','galleria-stadi'+(NO.length?'-rosso':''));fs.mkdirSync(OUT,{recursive:true});
const TUTTI=['provino','provincia:3000','provincia:9000','comunale:9000','comunale:18000','storico_it:18000','moderno_it:30000','inglese:30000','tedesco:50000','spagnolo:50000','francese:30000','olandese:30000','sudamericano:30000'];
const CASI=(process.env.CPM_CASI||'').split(',').filter(Boolean);const casi=CASI.length?CASI:TUTTI;
const VISTE={tv:{x:0,y:16,z:34,lx:0,ly:4,lz:-30},porta:{x:-44,y:6,z:0,lx:30,ly:4,lz:0},curva:{x:5,y:6,z:-20,lx:60,ly:4,lz:20},tetto:{x:0,y:4,z:5,lx:0,ly:14,lz:-55}};
const srv=await startServer();const port=srv.address().port;const b=await launchBrowser();const indice=[];
for(const caso of casi){
  const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const page=await ctx.newPage();await installCdnRoutes(page);const errs=[];page.on('pageerror',e=>errs.push(String(e.message).slice(0,120)));
  const [tplC,capC]=caso.split(':');
  await page.addInitScript(o=>{window.__CPM_GLB=false;window.__CPM_TOD=o.tod;if(o.tpl)window.__CPM_STADIUM_TPL_FORCE=o.tpl;if(o.cap)window.__CPM_STADIUM_CAP_FORCE=o.cap;for(const f of o.no)window[f]=1;},{no:NO,tpl:tplC==='provino'?null:tplC,cap:capC?+capC:0,tod:TOD});
  const cdp=await ctx.newCDPSession(page);let ultimo=null;
  cdp.on('Page.screencastFrame',e=>{ultimo=Buffer.from(e.data,'base64');cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{});});
  await cdp.send('Page.startScreencast',{format:'png',maxWidth:412,maxHeight:915,everyNthFrame:1});
  await openMatch(page,port,{skipLoadAll:true,name:'Galleria'});await sleep(1500);
  await page.evaluate(()=>{window.__CPM_FORCE_SIT(13,true);});
  await page.waitForFunction(()=>window.__CPM_PHASE&&window.__CPM_PHASE()==='hl_choose',null,{timeout:30000}).catch(()=>{});await sleep(1500);
  await page.addStyleTag({content:'body *{visibility:hidden!important} canvas{visibility:visible!important}'});
  const info=await page.evaluate(()=>({ph:window.__CPM_PHASE&&window.__CPM_PHASE(),fail:window.__CPM_STADFAIL||null,pali:window.__CPM_PALI69||null}));
  const foto={};
  for(const [v,c] of Object.entries(VISTE)){
    await page.evaluate(c=>{window.__CPM_CAM904=c;},c);await sleep(1600);ultimo=null;await sleep(900);
    if(ultimo){const f=path.join(OUT,`${caso.replace(':','-')}-${v}.png`);fs.writeFileSync(f,ultimo);foto[v]=path.basename(f);}
  }
  const st=await page.evaluate(()=>{try{return window.__CPM_STATE?null:null;}catch(e){return null;}});
  indice.push({caso,tod:TOD,...info,foto,errs:errs.slice(0,3)});console.log(caso,JSON.stringify(info),Object.keys(foto).length,'foto',errs.length?'ERR '+errs[0]:'');
  await ctx.close();
}
fs.writeFileSync(path.join(OUT,`indice-${TOD}.json`),JSON.stringify(indice,null,1));
await b.close();srv.close();
