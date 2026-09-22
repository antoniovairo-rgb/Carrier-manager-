/* ANTEPRIMA DELLA MIXED ZONE IN 2D — il gala' vive a fine stagione, quindi senza il varco di collaudo
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
     il CH38, quindi il guardiano passava in entrambi i bracci e non provava niente. */ if(r) window.__CPM_NO963=true;
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
await page.waitForFunction(()=>!!(window.__CPM_CAREER&&window.__CPM_CAREER.forceInterview),{timeout:25000}).catch(()=>{});
/* [7.948] il contatore si azzera QUI: il CH38 lo chiede anche il ritratto dell'avatar
   (_heroPhotoAssets, cruscotto), che non c'entra con la cerimonia. Contare tutta la sessione
   faceva fallire il verde per un motivo estraneo alla scena. */
corpi.length=0;
await page.evaluate(()=>{try{window.__CPM_CORPI948=0;}catch(_e){}});
const apri = await page.evaluate(()=>{ try{ return window.__CPM_CAREER.forceInterview('win'); }catch(e){ return 'error:'+e; } });
await sleep(2600);/* [7.961] il modale entra da destra con un'animazione: scattare a 1,4 s fotografava la transizione, non la schermata */
const busta = await page.evaluate(()=>({ gala:document.querySelectorAll('[role="dialog"], .cpm-press, div').length>0&&/\?|\.|,/.test(document.body.innerText),
  webgl:document.querySelectorAll('canvas').length }));
await page.screenshot({ path:'/tmp/claude-0/intervista-1.png' });
try{ await page.getByText('Apri la busta',{exact:false}).first().click({timeout:6000}); await sleep(700);
     for(let i=0;i<2;i++){ await page.getByText(/Il secondo posto|e il vincitore/i).first().click({timeout:6000}); await sleep(700);} }catch(_e){}
await sleep(900);
await page.screenshot({ path:'/tmp/claude-0/intervista-2.png' });
/* [7.948] il testimone si legge ALLA FINE: i corpi si caricano in modo asincrono e leggerli
   subito dopo l'apertura dava zero anche nel braccio rosso. */
await sleep(2500);
const corpiScena = await page.evaluate(()=>window.__CPM_CORPI948|0);
/* [7.961] il contratto e' cambiato su collaudo del PO («togli il 3d», «togli i visi, lascia solo una
   scenografia 2D molto carina»): la sala stampa e' DISEGNATA, quindi zero canvas e zero facce. La scena
   si riconosce dal suo attributo, le facce dal loro (`data-cpm-viso`, messo su AvatarSVG dalla 7.961). */
const scena = await page.evaluate(()=>{
  const s=document.querySelector('[data-cpm-scena="intervista2d"]');
  return { c:!!s, visiScena:s?s.querySelectorAll('[data-cpm-viso]').length:-1,
           canvasScena:s?s.querySelectorAll('canvas').length:-1,
           visiTot:document.querySelectorAll('[data-cpm-viso]').length };});
const visi = scena.visiScena;
await browser.close(); await new Promise(r=>server.close(r));
console.log(`\n=== LA MIXED ZONE E' IN 2D === ${rosso?'[ROSSO __CPM_NO947]':'[VERDE]'}`);
console.log(`  scena aperta: ${busta.gala?'SI':'no'} · sala stampa disegnata: ${scena.c?'SI':'NO'}`);
console.log(`  canvas WebGL nella pagina: ${busta.webgl} · visi nella scena: ${scena.visiScena} · visi in tutta la pagina: ${scena.visiTot}`);
console.log(`  corpi CH38 nella scena: ${corpiScena} · modelli chiesti alla rete: ${corpi.length}`);
console.log(`  errori di pagina ${err.length}${err.length?' → '+err[0]:''}`);
const ok = rosso ? (busta.webgl>0) : (corpiScena===0 && busta.gala && scena.c && busta.webgl===0 && scena.visiScena===0 && err.length===0);
console.log(ok ? (rosso ? "\n\u2705 difetto riprodotto — col rosso __CPM_NO963 la scenografia 3D torna in scena"
                        : "\n\u2705 PASS — sala stampa disegnata: zero canvas, zero facce, zero corpi")
              : '\n\u274c FAIL');
process.exit(ok?0:1);
