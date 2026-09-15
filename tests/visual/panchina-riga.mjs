/* [7.899 — LA VOCE DELLA PANCHINA NON COPRE LA TELECRONACA] Nota PO 15/09: «le indicazioni della panchina sono invasive
   graficamente» (foto: il riquadro copre la seconda riga del racconto). Si campiona una partita (GLB accesi, 412×915)
   ogni 300 ms; quando banner della telecronaca e voce della panchina sono entrambi in pagina si misura l'AREA di
   sovrapposizione fra il rettangolo della panchina e i rettangoli del testo del racconto (span fuori dalla panchina),
   piu' l'altezza della panchina e la sua quota di larghezza. CPM_ROSSO=__CPM_NO899B per la coppia. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO=(process.env.CPM_ROSSO||'').split(',').filter(Boolean);const TAG=ROSSO.length?'rosso':'verde';
const srv=await startServer();const port=srv.address().port;const b=await launchBrowser();
const H=+(process.env.CPM_H||915);/* CPM_H=700: l'altezza utile di un Android con barra degli indirizzi e barra di stato (la foto del PO: ~685 px CSS di gioco) — il sottopancia sta all'11 % dal fondo e a viewport bassa scende dentro la colonna delle voci */
const ctx=await b.newContext({viewport:{width:412,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});
const page=await ctx.newPage();await installCdnRoutes(page);
await page.addInitScript((r)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_REALWAIT=true;for(const k of r)window[k]=true;},ROSSO);
await openMatch(page,port,{skipLoadAll:true,name:process.env.CPM_NOME||'Vairo'});
await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:4242,policy:'seeded',tickMs:300}));
/* le voci si ACCENDONO con il gancio di collaudo __CPM_HUD_FORCE (7.536): una partita intera in autoplay ne ha mostrate zero (misurato: 477 campioni, 0 con la panchina). Racconto lungo (due righe a 412 px) + ordine del mister, ogni 4 s */
const FRASI=["Nadia Fracassi: \u00abAttenzione al terzo uomo, e\u2019 li\u2019 che si apre la partita quando la palla gira veloce.\u00bb","Marchetti ci prova da lontanissimo con il destro, il portiere si distende e para in due tempi.","Possesso paziente sulla trequarti, la squadra fa girare il pallone da un lato all\u2019altro cercando il varco."];
const ORDINI=["Accorcia sul portatore!","Palla in mezzo, chiudi il corridoio!","Stringi sul portatore, non lasciarlo girare."];
/* la condizione della foto del PO: eroe SOSTITUITO (tasto «Salta al fischio finale», colonna delle voci alzata di 46 px, 7.543) */
{let ok=false;for(let k=0;k<60;k++){await sleep(500);const s=await page.evaluate(()=>({ph:(window.__CPM_PHASE&&window.__CPM_PHASE())||'?',min:(window.__CPM_CLOCK&&window.__CPM_CLOCK())|0}));if(s.ph==='playing'&&s.min>=3){ok=true;break;}}
 const sub=await page.evaluate(()=>!!(window.__CPM_FORCE_SUBOFF&&window.__CPM_FORCE_SUBOFF()));console.log('eroe sostituito (leva __CPM_FORCE_SUBOFF):',sub,'· gioco vivo raggiunto:',ok);await sleep(800);}
let n=0,conP=0,sovr=0,areaTot=0;const alt=[],larg=[];let esempio=null;const t0=Date.now();let kf=0,tf=0;
while(Date.now()-t0<120000){await sleep(300);
  if(Date.now()-tf>4000){tf=Date.now();const i=kf++%3;await page.evaluate((o)=>{try{window.__CPM_HUD_FORCE&&window.__CPM_HUD_FORCE(o);}catch(e){}},{com:FRASI[i],coach:ORDINI[i]});await sleep(250);}
  const s=await page.evaluate(()=>{const ph=(window.__CPM_PHASE&&window.__CPM_PHASE())||'?';if(ph==='ended')return{fine:true};
    const c=document.querySelector('[data-cpm="com661"]');const p=document.querySelector('[data-cpm="panchina"]');/* la voce della panchina puo' vivere dentro il banner (7.788) o nella colonna delle voci (7.536): si cerca in tutta la pagina */if(!c||!p)return{ph,p:0};
    const pr=p.getBoundingClientRect();if(pr.width<2||pr.height<2)return{ph,p:0};
    let area=0;const rs=[];/* il testo del racconto sta in DIV, non in span (7.695): si misurano i NODI DI TESTO con un Range */const tw=document.createTreeWalker(c,NodeFilter.SHOW_TEXT);const nodi=[];let nd;while((nd=tw.nextNode()))if(!p.contains(nd)&&String(nd.textContent).trim().length>1)nodi.push(nd);for(const tn of nodi){const rg=document.createRange();rg.selectNodeContents(tn);const r=rg.getBoundingClientRect();if(r.width<2||r.height<2)continue;rs.push([Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]);
      const ix=Math.max(0,Math.min(r.right,pr.right)-Math.max(r.left,pr.left)),iy=Math.max(0,Math.min(r.bottom,pr.bottom)-Math.max(r.top,pr.top));area+=ix*iy;}
    return{ph,p:1,area:Math.round(area),h:Math.round(pr.height),w:Math.round(pr.width),rs,pr:[Math.round(pr.left),Math.round(pr.top),Math.round(pr.width),Math.round(pr.height)],txt:String(p.textContent||'').slice(0,60)};});
  if(!s||s.fine)break;if(s.ph!=='playing')continue;n++;if(!s.p)continue;conP++;alt.push(s.h);larg.push(s.w);
  if(s.area>0){sovr++;areaTot+=s.area;if(!esempio)esempio=s;}}
await b.close();srv.close();
const med=a=>a.length?a.slice().sort((x,y)=>x-y)[a.length>>1]:null;
console.log(`=== ${TAG} (viewport 412×${H}): campioni di gioco vivo ${n} · con la voce della panchina in pagina ${conP} · SOVRAPPOSTA al testo del racconto ${sovr} (${conP?Math.round(100*sovr/conP):0} %) · area media ${sovr?Math.round(areaTot/sovr):0} px² · altezza panchina mediana ${med(alt)} px · larghezza mediana ${med(larg)} px ===`);
if(esempio)console.log('esempio: panchina',JSON.stringify(esempio.pr),'testo',JSON.stringify(esempio.rs),'«'+esempio.txt+'»');
console.log(sovr===0?'VERDE — la panchina non copre mai il racconto.':'ROSSO — la panchina copre il racconto.');
