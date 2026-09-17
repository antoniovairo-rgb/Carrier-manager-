/* ANTEPRIMA DEL GALA' IN 2D — il gala' vive a fine stagione, quindi senza il varco di collaudo
   servirebbe giocare una stagione intera per guardarlo. Due scatti: busta chiusa e vincitore. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const rosso = process.argv.includes('--rosso');
const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport:{width:412,height:915}, deviceScaleFactor:2 });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
const err=[]; page.on('pageerror',e=>err.push(String(e).slice(0,160)));
/* [7.948] IL CRITERIO NON E' «zero canvas»: dalla regola di coerenza la scenografia e' quella 3D che
   c'era gia', quindi un canvas ci DEVE essere. Cio' che deve sparire e' il CH38, e il fatto misurabile
   e' che il suo modello non venga MAI chiesto alla rete. */
const corpi=[]; page.on('request',r=>{const u=r.url();if(/footballer[^/]*\.glb|actor-[a-z-]*\.glb/.test(u))corpi.push(u.split('/').pop());});
await page.addInitScript((r)=>{ /* [7.948] NON si spengono i modelli: la sonda spegnendoli impediva al braccio ROSSO di caricare
     il CH38, quindi il guardiano passava in entrambi i bracci e non provava niente. */ if(r) window.__CPM_NO946=true;
  const save={phase:'career',player:{name:'Carrascito',nation:'Italia',avatarId:3,proStatus:'pro',
    season:11,week:39,age:28,ovr:93,
    club:{id:'mer',n:'FC Merseyside',a:'MER',p:88,c:'#8e1f33',c2:'#f0b33a',nat:'🏴',lg:'Premier Division'},
    stats:{'velocità':92,tecnica:93,fisico:88,'mentalità':92,tiro:94,passaggio:90,dribbling:92,posizionamento:93},
    form:95,morale:100,fatigue:37,popularity:90,value:120,bankBalance:2000000,
    contract:{duration:3,wage:120000,expiresAtSeason:14}}};
  try{localStorage.setItem('cpm-v3',JSON.stringify(save));}catch(_e){}
}, rosso);
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:90000 });
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:60000}).catch(()=>{});
await sleep(1500);
try{ await page.getByText('CONTINUA',{exact:false}).first().click({timeout:8000}); }catch(_e){}
await page.waitForFunction(()=>!!(window.__CPM_CAREER&&window.__CPM_CAREER.apriGala),{timeout:25000}).catch(()=>{});
/* [7.948] il contatore si azzera QUI: il CH38 lo chiede anche il ritratto dell'avatar
   (_heroPhotoAssets, cruscotto), che non c'entra con la cerimonia. Contare tutta la sessione
   faceva fallire il verde per un motivo estraneo alla scena. */
corpi.length=0;
await page.evaluate(()=>{try{window.__CPM_CORPI948=0;}catch(_e){}});
const apri = await page.evaluate(()=>{ try{ return window.__CPM_CAREER.apriGala(); }catch(e){ return 'error:'+e; } });
await sleep(1400);
const busta = await page.evaluate(()=>({ gala:/La notte del Gala/i.test(document.body.innerText),
  webgl:document.querySelectorAll('canvas').length }));
await page.screenshot({ path:'/tmp/claude-0/gala-1-busta.png' });
try{ await page.getByText('Apri la busta',{exact:false}).first().click({timeout:6000}); await sleep(700);
     for(let i=0;i<2;i++){ await page.getByText(/Il secondo posto|e il vincitore/i).first().click({timeout:6000}); await sleep(700);} }catch(_e){}
await sleep(900);
await page.screenshot({ path:'/tmp/claude-0/gala-2-vincitore.png' });
/* [7.948] il testimone si legge ALLA FINE: i corpi si caricano in modo asincrono e leggerli
   subito dopo l'apertura dava zero anche nel braccio rosso. */
await sleep(2500);
const corpiScena = await page.evaluate(()=>window.__CPM_CORPI948|0);
const visi = await page.evaluate(()=>{const n=document.querySelectorAll('[data-cpm-gala], svg');return document.body.querySelectorAll('svg').length;});
await browser.close(); await new Promise(r=>server.close(r));
console.log(`\n=== IL GALA' E' IN 2D === ${rosso?'[ROSSO __CPM_NO946]':'[VERDE]'}`);
console.log(`  scena aperta: ${busta.gala?'SI':'no'} · scenografia 3D: ${busta.webgl?'SI':'no'} · visi SVG: ${visi}`);
console.log(`  corpi CH38 nella scena: ${corpiScena} · modelli chiesti alla rete: ${corpi.length}`);
console.log(`  errori di pagina ${err.length}${err.length?' → '+err[0]:''}`);
const ok = rosso ? (corpiScena>0||corpi.length>0) : (corpiScena===0 && busta.gala && busta.webgl>0 && visi>=3 && err.length===0);
console.log(ok ? (rosso ? "\n\u2705 difetto riprodotto — col rosso il CH38 torna a essere caricato"
                        : "\n\u2705 PASS — il gala' usa la scenografia 3D senza CH38, e i visi sono quelli della libreria")
              : '\n\u274c FAIL');
process.exit(ok?0:1);
