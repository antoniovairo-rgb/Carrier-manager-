/* [7.998.0] Sonda della schermata FORMAZIONI (PO: «schermata strasborda, info pressione inutile»).
   Rende la FormationView vera a 412 px di larghezza e misura: altezza totale, fondo del bottone «Ingresso in
   campo» (deve stare dentro 915 - 96 px di barra di stato del telefono del PO = 819 px utili), assenza del
   riquadro «Pressing avversario». CPM_ROSSO=1 → __CPM_NO_FORMAZ24: deve sforare e mostrare il pressing. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO=process.env.CPM_ROSSO==='1';const UTILE=Number(process.env.CPM_UTILE||700);/* 819 px utili sul telefono del PO (915 - barre), ma li' la stessa schermata e' ~15% piu' alta che in headless (confronto con la sua foto: testata 100 vs 87 px, campo 283 vs ~245): 819/1,15 ~ 710, arrotondato a 700 */
const srv=await startServer(); const port=srv.address().port; const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:412,height:915}}); await installCdnRoutes(page);
const errs=[]; page.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
await page.addInitScript((r)=>{window.__CPM_GLB=false;if(r)window.__CPM_NO_FORMAZ24=true;},ROSSO);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'load',timeout:30000});
await page.waitForFunction(()=>typeof window.FormationView==='function',{timeout:40000}).catch(()=>{});
await page.evaluate(()=>{const host=document.createElement('div');host.id='f24';host.style.cssText='position:fixed;left:0;top:0;width:412px;z-index:99999;background:#f4f1ec;padding:0 8px;box-sizing:border-box';document.body.appendChild(host);
  const h={id:'mer',n:'FC Merseyside',a:'MER',p:84,c:'#dc2626',c2:'#ffffff',nat:'🏴',lg:'Premier Division'},a={id:'sus',n:'FC Sussex',a:'SUS',p:77,c:'#1d4ed8',c2:'#ffffff',nat:'🏴',lg:'Premier Division'};
  const G=window.generateTeamRoster;const hr=G(h,3).slice(0,11).map((r,i)=>i===10?{...r,name:'Antonio Vairo'}:r),ar=G(a,3).slice(0,11);
  ReactDOM.createRoot(host).render(React.createElement(window.FormationView,{homeTeam:h,awayTeam:a,player:{name:'Antonio Vairo',season:3},homeRoster:hr,awayRoster:ar,oppTactic:{pressure:78.5,formation:'4-3-3'},oppTacticLoading:false,homeKitCol:h.c,awayKitCol:a.c,onContinue(){},onSkip(){}}));});
await page.waitForFunction(()=>!!document.querySelector('#f24 [data-cpm="formazioni23"]'),{timeout:15000}).catch(()=>{});
await sleep(700);
const R=await page.evaluate(()=>{const root=document.querySelector('#f24 [data-cpm="formazioni23"]');if(!root)return null;const r=root.getBoundingClientRect();
  const b=[...root.querySelectorAll('button')].find(x=>/Ingresso in campo/.test(x.innerText));const bb=b&&b.getBoundingClientRect();
  return {altezza:Math.round(r.height),fondoBottone:bb?Math.round(bb.bottom):null,pressing:/Pressing avversario/i.test(root.innerText)};});
await page.locator('#f24').screenshot({path:'/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/formazioni24'+(ROSSO?'-rosso':'')+'.png'}).catch(()=>{});
const fails=[];if(!R)fails.push('schermata non resa');else{if(R.fondoBottone==null||R.fondoBottone>UTILE)fails.push(`il bottone finisce a ${R.fondoBottone}px, oltre ${UTILE}`);if(R.pressing)fails.push('c\'e\' ancora il pressing');}
console.log(JSON.stringify(R),'utile',UTILE);console.log('fails',JSON.stringify(fails));if(errs.length)console.log('errs',errs);
await browser.close();srv.close();const ok=fails.length===0&&errs.length===0;console.log(ok?'✅ PASS formazioni24':'❌ FAIL formazioni24');process.exit(ok?0:1);
