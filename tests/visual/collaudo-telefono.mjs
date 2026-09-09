/* [COLLAUDO DA TELEFONO, AUTOMATIZZATO — richiesta PO 09/09] Quello che il PO fa col telefono, fatto
   da una macchina: una partita intera alla taglia del telefono (412x915, portrait, campo 3D acceso,
   tick reale), fotografata a cadenza fissa e su ogni evento che conta (gol, scena dell'eroe, tiro,
   palla morta, duplice fischio), e misurata nei numeri che l'occhio giudica: il pallone reso ai piedi
   del padrone logico, i salti del pallone, lo scarto reso<->logico, i minuti di gioco fermo, i tagli
   di camera, i fotogrammi al secondo. Produce un foglio di contatto e una scheda con bande.
   DICHIARATO: e' Chromium alla taglia del telefono, non un Android vero (GPU, tocco e prestazioni
   reali restano fuori). Il giudizio «ci credo?» sulle foto resta a un occhio: la scheda lo prepara.
     CPM_NOME=Vairo [CPM_AWAY=1] [CPM_SEME=4242] node collaudo-telefono.mjs                          */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const NOME=process.env.CPM_NOME||'Vairo';const SEME=+(process.env.CPM_SEME||4242);const AWAY=!!process.env.CPM_AWAY;
const OUT=path.join(__dirname,'..','out','collaudo-telefono',NOME+(AWAY?'-fuori':'-casa'));
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
const srv=await startServer();const port=srv.address().port;const b=await launchBrowser();
const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const page=await ctx.newPage();await installCdnRoutes(page);
await page.addInitScript((o)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_CRO802=[];window.__CPM_SCMS681=3500;window.__CPM_DTREAL=true;if(o.away)window.__CPM_AWAY_TEST=true;},{away:AWAY});
await openMatch(page,port,{skipLoadAll:true,name:NOME});
await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEME);
const foto=[];let nFoto=0;const MAXF=70;
async function scatta(min,tag,txt){if(nFoto>=MAXF)return;nFoto++;const f=`f${String(nFoto).padStart(2,'0')}-min${String(min).padStart(2,'0')}-${tag}.png`;try{await page.screenshot({path:path.join(OUT,f)});foto.push({f,min,tag,txt:String(txt||'').slice(0,90)});}catch(_e){}}
const c={n:0,dCar:[],scarto:[],salti:0,carN:0,carOk:0,fasi:{},ultimaFoto:Date.now(),ultimoMin:-1,croVisti:0,hlPrev:false,pgPrev:false};
let prev=null,min=0;
for(let k=0;k<6000;k++){await sleep(70);
  const s=await page.evaluate(()=>{try{const ms=window.__CPM_MS&&window.__CPM_MS();const w=window.__CPM_WS&&window.__CPM_WS();const h=window.__CPM_HOLD&&window.__CPM_HOLD();
    return {t:Date.now(),min:ms?(ms.min|0):0,w:w,ph:(window.__CPM_PHASE&&window.__CPM_PHASE())||'?',pg:!!(h&&h.pg),cro:(window.__CPM_CRO802||[]).length};}catch(_e){return null;}});
  if(!s)continue;min=s.min;c.fasi[s.ph]=(c.fasi[s.ph]|0)+1;
  const inHL=/^hl_/.test(s.ph);
  if(inHL&&!c.hlPrev){await scatta(min,'scena-apre','');}
  if(!inHL&&c.hlPrev){await scatta(min,'scena-esito','');}
  c.hlPrev=inHL;
  if(s.pg&&!c.pgPrev){await scatta(min,'occasione-apre','');}
  c.pgPrev=s.pg;
  if(s.cro>c.croVisti){const nuove=await page.evaluate((da)=>(window.__CPM_CRO802||[]).slice(da).filter(x=>!x.intro).map(x=>x.txt),c.croVisti);c.croVisti=s.cro;
    for(const t of nuove){if(/segna|⚽/.test(t)&&!/GOL \[/.test(t))await scatta(min,'gol',t);else if(/^💥/.test(t))await scatta(min,'tiro',t);else if(/^🚩|^⏸️|^🟡|^⏸/.test(t))await scatta(min,'fermo',t);else if(/^🧤/.test(t))await scatta(min,'portiere',t);}}
  if(Date.now()-c.ultimaFoto>20000){c.ultimaFoto=Date.now();await scatta(min,'gioco','');}
  if(s.ph==='playing'&&s.w){c.n++;
    if(s.w.lx!=null)c.scarto.push(Math.hypot(s.w.rx-s.w.lx,s.w.ry-s.w.ly));
    if(s.w.car){c.carN++;const dc=Math.hypot(s.w.rx-s.w.car.x,s.w.ry-s.w.car.y);c.dCar.push(dc);if(dc<=3)c.carOk++;}
    if(prev){const dd=Math.hypot(s.w.rx-prev.rx,s.w.ry-prev.ry);const dt=s.t-prev.t;if(dt<=110&&dd>8)c.salti++;}
    prev={rx:s.w.rx,ry:s.w.ry,t:s.t};}else prev=null;
  if(min>=89)break;}
const fine=await page.evaluate(()=>({sch:window.__CPM_SCHERMO843||[],fps:Math.round(window.__CPM_FPS708||0),cam:(window.__CPM_CAM471||[]).length,pad:window.__CPM_PADRONE||null,ms:(window.__CPM_MS&&window.__CPM_MS())||null,cro:(window.__CPM_CRO802||[]).filter(x=>!x.intro).length}));
await ctx.close();await b.close();srv.close();
const q=(a,p)=>{if(!a.length)return null;const s2=a.slice().sort((u,v)=>u-v);return +s2[Math.min(s2.length-1,Math.floor(p*(s2.length-1)))].toFixed(1);};
const cls={};fine.sch.forEach(x=>{const k=x.ko>0?'calcio-inizio':x.kick>0?'ripresa':x.hl?'scena':x.out?'palla-morta':x.fermo?'fermo':x.sp?'piazzato':'gioco';cls[k]=(cls[k]|0)+1;});
const R=[];R.push(`# Collaudo da telefono — ${NOME} ${AWAY?'fuori':'casa'} · seme ${SEME}`);R.push('');
R.push('Chromium 412×915 portrait, campo 3D acceso, tick reale. NON e\' un Android vero: GPU, tocco e prestazioni reali restano fuori.');R.push('');
R.push('| misura | valore | banda |');R.push('|---|---|---|');
const pct=(a,b)=>b?Math.round(100*a/b)+'%':'n/d';
R.push(`| pallone reso ai piedi del padrone logico (≤3u) | ${pct(c.carOk,c.carN)} su ${c.carN} campioni | ≥ 60% verde · < 40% rosso |`);
R.push(`| distanza reso↔padrone, mediana / p90 | ${q(c.dCar,0.5)} / ${q(c.dCar,0.9)} u | mediana ≤ 3u |`);
R.push(`| scarto pallone reso↔logico, mediana / p90 | ${q(c.scarto,0.5)} / ${q(c.scarto,0.9)} u | p90 ≤ 8u |`);
R.push(`| salti del pallone (> 8u in ≤ 110 ms) | ${c.salti} in ${c.n} campioni | 0 fuori dagli stacchi |`);
R.push(`| fotogrammi al secondo (medi) | ${fine.fps} | ≥ 30 |`);
R.push(`| tagli di camera registrati | ${fine.cam} | (informativo) |`);
R.push(`| minuti per stato dello schermo | ${JSON.stringify(cls)} | palla morta + fermo ≤ 15 |`);
R.push(`| righe di cronaca | ${fine.cro} | 70-110 |`);
R.push(`| risultato | ${fine.ms&&fine.ms.score?(fine.ms.score.h+'-'+fine.ms.score.a):'?'} | |`);
R.push('');R.push('## Fotogrammi');R.push('');R.push('| # | minuto | evento | riga |');R.push('|---|---|---|---|');
foto.forEach((f,i)=>R.push(`| ${f.f} | ${f.min}' | ${f.tag} | ${f.txt} |`));
fs.writeFileSync(path.join(OUT,'report.md'),R.join('\n')+'\n');
console.log(R.slice(0,14).join('\n'));console.log(`fotogrammi: ${foto.length} → ${OUT}`);
