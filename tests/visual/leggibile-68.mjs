#!/usr/bin/env node
/* [7.999.67 guardiano — collaudo PO «alcuni testi sopra non si leggono bene» (sala stampa)] La scena e' in scala 0,775: i testi a 11 px arrivavano a
   ~8,5 px e le due righe basse di marchi stavano dietro microfoni e bottiglietta. Si misura a schermo, sul percorso vero (forceInterview):
   VERDE → la riga «In casa · Il tuo voto…» e' alta almeno 10 px sullo schermo e sotto il tabellino non resta nessun marchio;
   ROSSO (__CPM_NO_IV68) → riga piu' bassa e marchi dietro i microfoni. Uso: node leggibile-68.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv=await startServer(); const port=srv.address().port; const browser=await launchBrowser();
async function braccio(rosso){
const page=await browser.newPage({viewport:{width:414,height:896}}); await installCdnRoutes(page);
await page.addInitScript((rosso)=>{window.__CPM_GLB=false;if(rosso)window.__CPM_NO_IV68=true;
  const J=[{id:'j_ferretti',name:'Marco Ferretti',paper:'Sprint Sportivo',color:'#ef4444',type:'critico',trust:50},{id:'j_esposito',name:'Sofia Esposito',f:true,paper:'Diretta TV',color:'#3b82f6',type:'fan',trust:50},{id:'j_neri',name:'Giovanni Neri',paper:'Cronaca di Sport',color:'#7c3aed',type:'investigativa',trust:50}];
  localStorage.setItem('cpm-v3',JSON.stringify({phase:'career',player:{name:'Test Uno',nation:'Italia',avatarId:0,proStatus:'pro',season:3,week:10,age:25,ovr:78,tutorialDone:true,hasAgent:true,bankBalance:900000,popularity:40,journalists:J,club:{id:'juve',n:'Torino Athletic',a:'TAT',p:88,c:'#111',c2:'#fff',nat:'🇮🇹',lg:'Lega A'},stats:{'velocità':78,tecnica:78,fisico:78,'mentalità':78,tiro:78,passaggio:78,dribbling:78,posizionamento:78},calendar:[],standings:[],matchHistory:[],worldMemory:[],contract:{duration:3,wage:40000,expiresAtSeason:6},log:[]}}));},rosso);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'load'});
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000}); await sleep(1500);
try{await page.getByText('Continua',{exact:false}).first().click({timeout:5000});}catch(e){}
await page.waitForFunction(()=>!!(window.__CPM_CAREER&&window.__CPM_CAREER.forceInterview),{timeout:15000}); await sleep(600);
await page.evaluate(()=>window.__CPM_CAREER.forceInterview('win')); await sleep(1400);
const r=await page.evaluate(()=>{const t=document.querySelector('[data-cpm="tabellino24"]');if(!t)return null;const T=t.getBoundingClientRect();const sub=t.lastElementChild.getBoundingClientRect();
  const pan=t.parentElement;let sotto=0;pan.querySelectorAll('span').forEach(s=>{if(/rward|Elite/.test(s.textContent||'')){const q=s.getBoundingClientRect();if(q.height>0&&q.top>T.bottom-1)sotto++;}});
  return {riga:+sub.height.toFixed(1),sotto};});
await page.close(); return r;}
const v=await braccio(false), r=await braccio(true);
console.log('VERDE',JSON.stringify(v)); console.log('ROSSO (__CPM_NO_IV68)',JSON.stringify(r));
await browser.close(); srv.close();
const okV=!!v&&v.riga>=10&&v.sotto===0, okR=!!r&&(r.riga<v.riga||r.sotto>0);
console.log(okV?'✅ testi del pannello leggibili, nessun marchio dietro i microfoni':'❌ pannello poco leggibile');
console.log(okR?'✅ il rosso __CPM_NO_IV68 riproduce il difetto':'❌ il rosso non si distingue');
process.exit(okV&&okR?0:1);
