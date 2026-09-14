#!/usr/bin/env node
/* [C7 — nota PO 14/09: «occhio ai tabelloni luminosi degli stadi, l'altezza deve essere misurata stadio per stadio;
 *  nello stadio del provino e' un tabellone volante nel cielo»]
 *
 * Misura STADIO PER STADIO, con foto. Per ogni impianto (il provino vero + i dieci template forzati sullo stesso
 * provino) la sonda apre una partita reale, la fa giocare e aspetta il primo istante in cui la regia inquadra il
 * tabellone (x=55, Curva Sud); allora fotografa e misura due cose:
 *   1. GEOMETRIA (indipendente dalla camera): bordo alto del tabellone contro la CIMA di cio' che sta davvero
 *      dietro — la Curva Sud (gradoni, copertura), non la tribuna di fondo usata dal 7.455;
 *   2. PIXEL (dipendente dalla camera): nella striscia di 3-12 px sopra il bordo alto, quante colonne sono CIELO
 *      (colore uguale allo sfondo della scena, `sky`), e altrettanto sotto il bordo basso.
 * I quattro spigoli del tabellone vengono proiettati con la camera VERA (`__CPM_PROJ767`): niente ricerca del
 * tabellone a tentoni nella foto. Foto in out/tabellone-stadi/<impianto>.png.
 * DICHIARATO: Chromium 412x915, campo GLB spento (il tabellone non dipende dai GLB), dpr 1.
 *   [CPM_ROSSO=__CPM_NO455] [CPM_CASI=provino,provincia,...] node tabellone-stadi.mjs                        */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path'; import { PNG } from 'pngjs';
const ROSSO=(process.env.CPM_ROSSO||'').split(',').filter(Boolean);
const OUT=path.join(__dirname,'..','out','tabellone-stadi'+(ROSSO.length?'-rosso':''));fs.mkdirSync(OUT,{recursive:true});
/* caso = template[:capienza]. Il provino del banco e' un impianto grande (capienza del club offerto): per gli stadi PICCOLI — quello
   del PO — si forza anche la capienza (`__CPM_STADIUM_CAP_FORCE`), che decide taglia e livello architettonico. */
const TUTTI=['provino','provincia:3000','provincia:9000','comunale:9000','comunale:18000','storico_it:18000','moderno_it:30000','inglese:30000','tedesco:50000','spagnolo:50000','francese:30000','olandese:30000','sudamericano:30000'];
const CASI=(process.env.CPM_CASI||'').split(',').filter(Boolean);const casi=CASI.length?CASI:TUTTI;
const ATTESA_S=+(process.env.CPM_ATTESA||150);
const srv=await startServer();const port=srv.address().port;const b=await launchBrowser();
const righe=[];
function hex(n){return '#'+(n>>>0).toString(16).padStart(6,'0').slice(-6);}
function ndc2px(p,W,H){return {x:(p.x+1)/2*W,y:(1-p.y)/2*H};}
async function misura(caso){
  const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const page=await ctx.newPage();await installCdnRoutes(page);
  const errs=[];page.on('pageerror',e=>errs.push(String(e.message).slice(0,120)));
  const [tplC,capC]=caso.split(':');
  await page.addInitScript(o=>{window.__CPM_GLB=false;window.__CPM_CAMT767ON=1;if(o.tpl)window.__CPM_STADIUM_TPL_FORCE=o.tpl;if(o.cap)window.__CPM_STADIUM_CAP_FORCE=o.cap;for(const f of o.rosso)window[f]=1;},{tpl:tplC==='provino'?null:tplC,cap:capC?+capC:0,rosso:ROSSO});
  /* la foto arriva dallo screencast CDP (png): page.screenshot restituisce il canvas WebGL NERO (buffer non preservato), misurato 14/09 */
  const cdp=await ctx.newCDPSession(page);let ultimoFrame=null;
  cdp.on('Page.screencastFrame',e=>{ultimoFrame=Buffer.from(e.data,'base64');cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{});});
  await cdp.send('Page.startScreencast',{format:'png',maxWidth:412,maxHeight:915,everyNthFrame:1});
  await openMatch(page,port,{skipLoadAll:true});
  await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:4242,policy:'seeded',tickMs:300}));
  const t0=Date.now();let colpo=null,j=null,ultimo=null,n=0;
  while(Date.now()-t0<ATTESA_S*1000){await sleep(250);n++;
    const s=await page.evaluate(()=>{try{const j=window.__CPM_JUMBO455,P=window.__CPM_PROJ767;if(!j||!P)return null;
      const c=[[55,j.y+j.h/2,-j.w/2],[55,j.y+j.h/2,j.w/2],[55,j.y-j.h/2,j.w/2],[55,j.y-j.h/2,-j.w/2]].map(v=>P(v[0],v[1],v[2]));
      const cv=document.querySelector('canvas'),r=cv?cv.getBoundingClientRect():null;/* la proiezione NDC vale sul CANVAS, non sulla pagina: il 3D sta sotto la barra superiore (misurato: ~135 px di scarto senza questo) */
      return {j,c,rect:r?{x:r.left,y:r.top,w:r.width,h:r.height}:null,ph:(window.__CPM_PHASE&&window.__CPM_PHASE())||'?',cam:window.__CPM_CAMT767||null,min:(window.__CPM_CLOCK&&window.__CPM_CLOCK())|0};}catch(e){return {err:String(e)};}});
    if(!s||s.err){ultimo=s;continue;}j=s.j;ultimo=s;
    const dentro=s.c.every(p=>p.z<1&&Math.abs(p.x)<0.97&&Math.abs(p.y)<0.97);
    if(!s.rect)continue;const px=s.c.map(p=>{const q=ndc2px(p,s.rect.w,s.rect.h);return {x:q.x+s.rect.x,y:q.y+s.rect.y};});const larg=Math.hypot(px[1].x-px[0].x,px[1].y-px[0].y);
    if(dentro&&larg>=28&&s.ph==='playing'){colpo={px,larg,ph:s.ph,cam:s.cam,min:s.min,t:+((Date.now()-t0)/1000).toFixed(1)};break;}
  }
  let pix=null;
  if(colpo){
    /* FOTO E PROIEZIONE NELLO STESSO ISTANTE: la regia stringe sull'eroe e fra il campione e il fotogramma il tabellone
       cambiava taglia del 34 % (misurato: 132 px proiettati contro 177 in foto). Si congela la scena (dt=0, come fa
       forceSituation), si lascia consegnare un fotogramma fermo, poi si riproietta sul fotogramma fermo. */
    await page.evaluate(()=>{window.__CPM_FROZEN=true;});await sleep(900);
    const s2=await page.evaluate(()=>{const j=window.__CPM_JUMBO455,P=window.__CPM_PROJ767;const c=[[55,j.y+j.h/2,-j.w/2],[55,j.y+j.h/2,j.w/2],[55,j.y-j.h/2,j.w/2],[55,j.y-j.h/2,-j.w/2]].map(v=>P(v[0],v[1],v[2]));
      const cv=document.querySelector('canvas'),r=cv.getBoundingClientRect();return {c,rect:{x:r.left,y:r.top,w:r.width,h:r.height},cam:window.__CPM_CAMT767||null};});
    colpo.px=s2.c.map(p=>{const q=ndc2px(p,s2.rect.w,s2.rect.h);return {x:q.x+s2.rect.x,y:q.y+s2.rect.y};});colpo.cam=s2.cam;colpo.larg=Math.hypot(colpo.px[1].x-colpo.px[0].x,colpo.px[1].y-colpo.px[0].y);
    const buf=ultimoFrame;if(!buf)throw new Error('nessun fotogramma dallo screencast');const img=PNG.sync.read(buf);const W=img.width,H=img.height;
    fs.writeFileSync(path.join(OUT,caso.replace(':','-')+'.png'),buf);
    {let lum=0,n=0;for(let i=0;i<img.data.length;i+=4*97){lum+=img.data[i]+img.data[i+1]+img.data[i+2];n++;}if(lum/n<12)throw new Error('fotogramma nero: la foto non vale');}
    const sky=j.sky>>>0,sr=(sky>>16)&255,sg=(sky>>8)&255,sb=sky&255;
    const isSky=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return null;const i=(y*W+x)*4;const d=img.data;return Math.abs(d[i]-sr)<=10&&Math.abs(d[i+1]-sg)<=10&&Math.abs(d[i+2]-sb)<=10;};
    const striscia=(a,b2,segno)=>{let tot=0,cielo=0,dentroTab=0;for(let k=0;k<=40;k++){const t=k/40;const x=a.x+(b2.x-a.x)*t,y=a.y+(b2.y-a.y)*t;
      let c=0,m=0;for(let d=3;d<=12;d++){const v=isSky(x,y+signo(segno)*d);if(v==null)continue;m++;if(v)c++;}
      if(m){tot++;if(c/m>=0.5)cielo++;}const inn=isSky(x,y-signo(segno)*3);if(inn===false)dentroTab++;}
      return {colonne:tot,cielo,quota:tot?+(cielo/tot).toFixed(2):null,tabellonePresente:dentroTab};};
    const signo=s=>s;
    /* v2: IL METRO PRINCIPALE e' la distanza dal bordo alto al PRIMO pixel di cielo (colonne centrali 25-75 %): rosso = 1 px
       (il cielo comincia sul bordo), verde = quanti pixel di gradinata/copertura restano sopra il tabellone. */
    const hpx=((colpo.px[2].y-colpo.px[1].y)+(colpo.px[3].y-colpo.px[0].y))/2,upx=j.h/Math.max(1,hpx);const ss=[];
    for(let k=10;k<=30;k++){const t=k/40,x=colpo.px[0].x+(colpo.px[1].x-colpo.px[0].x)*t,y=colpo.px[0].y+(colpo.px[1].y-colpo.px[0].y)*t;let sv=999;for(let g=1;g<=160;g++){if(isSky(x,y-g)){sv=g;break;}}ss.push(sv);}
    ss.sort((p,q)=>p-q);
    pix={sopra:striscia(colpo.px[0],colpo.px[1],-1),sotto:striscia(colpo.px[3],colpo.px[2],+1),W,H,primoCielo:{minPx:ss[0],medPx:ss[10],medU:+(ss[10]*upx).toFixed(2),uPerPx:+upx.toFixed(3)}};
  }
  await ctx.close();
  const sud=j&&j.sud;const bTop=j?+(j.y+j.h/2).toFixed(2):null,bBot=j?+(j.y-j.h/2).toFixed(2):null;
  const dietroTop=sud?Math.max(sud.top,sud.roofTop||0):null;
  const r={caso,j,bTop,bBot,dietroTop,staccoSud:(sud&&bTop!=null)?+(bTop-dietroTop).toFixed(2):null,
    staccoFondo:j?+(bBot-j.endH).toFixed(2):null,colpo,pix,errs:errs.slice(0,3),campioni:n,ultimo:colpo?null:ultimo};
  righe.push(r);
  const g=j?`[${j.tpl||'?'} ${j.cap||'?'}] tab y ${j.y} h ${j.h} w ${j.w} [${bBot}..${bTop}] liv.${j.lvl} traliccio ${j.traliccio?'si':'no'} · Sud h ${sud?sud.h:'?'} anelli ${sud?sud.tiers:'?'} fronte x ${sud?sud.frontX:'?'} cima ${sud?sud.top:'?'}@x${sud?sud.topX:'?'} tetto ${sud&&sud.roofTop!=null?sud.roofTop+'@x'+sud.roofFrontX:'no'} · stacco cima-Sud ${r.staccoSud>0?'+':''}${r.staccoSud} · fondo(7.455) ${r.staccoFondo}`:'sonda cieca';
  const f=colpo?`foto ${colpo.min}' a ${colpo.t}s larg ${colpo.larg.toFixed(0)}px · PRIMO CIELO sopra il bordo alto ${pix.primoCielo.medPx>=999?'mai':pix.primoCielo.medPx+' px = '+pix.primoCielo.medU+'u'} (min ${pix.primoCielo.minPx}) · cielo sopra ${pix.sopra.cielo}/${pix.sopra.colonne} (${pix.sopra.quota}) sotto ${pix.sotto.cielo}/${pix.sotto.colonne} · tab presente ${pix.sopra.tabellonePresente}/41 · cam (${colpo.cam?[colpo.cam.tPx,colpo.cam.tPy,colpo.cam.tPz].join(','):'?'})`:`MAI INQUADRATO in ${ATTESA_S}s (${n} campioni, fase ${ultimo&&ultimo.ph})`;
  console.log(`${caso.padEnd(13)} ${g}\n${' '.repeat(14)}${f}${errs.length?'  pageerror: '+errs[0]:''}`);
}
for(const c of casi){try{await misura(c);}catch(e){console.log(`${c.padEnd(13)} ERRORE ${String(e.message||e).slice(0,140)}`);righe.push({caso:c,errore:String(e.message||e)});}}
fs.writeFileSync(path.join(OUT,'misure.json'),JSON.stringify(righe,null,1));
await b.close();srv.close();
console.log(`\nfoto e misure in ${OUT}`);
