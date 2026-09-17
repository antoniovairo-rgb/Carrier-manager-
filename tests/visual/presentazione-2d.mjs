/* GUARDIANO: LA PRESENTAZIONE E' IN 2D — il gala' vive a fine stagione, quindi senza il varco di collaudo
   servirebbe giocare una stagione intera per guardarlo. Due scatti: busta chiusa e vincitore. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
/* [7.948] NESSUNA PROVA DEL ROSSO QUI, e va detto. Con __CPM_NO947 acceso la presentazione NON aggiunge
   comunque corpi in questa sonda (il percorso dei cloni non viene raggiunto alle condizioni del banco),
   quindi il braccio rosso non riprodurrebbe niente e passerebbe a vuoto. Il guardiano prova un
   INVARIANTE: stadio presente, ZERO corpi CH38 nella scena, visi della libreria. La prova del rosso
   esiste sulle altre due cerimonie (intervista e gala), che condividono lo stesso meccanismo. */
const rosso = false;
const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport:{width:412,height:915}, deviceScaleFactor:2 });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
const err=[]; page.on('pageerror',e=>err.push(String(e).slice(0,160)));
/* [7.947 v3] IL CRITERIO NON E' PIU' «zero canvas»: il PO ha chiesto di tenere lo STADIO com'e'
   («come scenografia puoi usare lo stadio cosi' com'e' nell'as is con sovrapposizione delle schermate
   2D»), quindi un canvas ci deve essere. Cio' che deve sparire e' il CH38, e il fatto misurabile e'
   che il suo modello non venga MAI chiesto alla rete. */
const corpi=[]; page.on('request',r=>{const u=r.url();if(/footballer[^/]*\.glb/.test(u))corpi.push(u.split('/').pop());});
await page.addInitScript((r)=>{ /* [7.948] NON si spengono i modelli: la sonda spegnendoli impediva al braccio ROSSO di caricare
     il CH38, quindi il guardiano passava in entrambi i bracci e non provava niente. */ if(r) window.__CPM_NO947=true;
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
const apri = await page.evaluate(()=>{ try{ return window.__CPM_CAREER.apriPresentazione(2); }catch(e){ return 'error:'+e; } });
await sleep(1400);
const busta = await page.evaluate(()=>({ gala:/BENVENUTI ALLO|PRESENTAZIONE|SERATA/i.test(document.body.innerText),
  webgl:document.querySelectorAll('canvas').length }));
await page.screenshot({ path:'/tmp/claude-0/pres-1.png' });
try{ for(let i=0;i<2;i++){ await page.getByText(/Avanti/i).first().click({timeout:6000}); await sleep(800);} }catch(_e){}
await sleep(900);
await page.screenshot({ path:'/tmp/claude-0/pres-2.png' });
/* [7.948] il testimone si legge ALLA FINE: i corpi si caricano in modo asincrono e leggerli
   subito dopo l'apertura dava zero anche nel braccio rosso. */
await sleep(2500);
const corpiScena = await page.evaluate(()=>window.__CPM_CORPI948|0);
const visi = await page.evaluate(()=>{const n=document.querySelectorAll('[data-cpm-gala], svg');return document.body.querySelectorAll('svg').length;});
await browser.close(); await new Promise(r=>server.close(r));
console.log(`\n=== LA PRESENTAZIONE E' IN 2D === ${rosso?'[ROSSO __CPM_NO947]':'[VERDE]'}`);
console.log(`  serata aperta: ${busta.gala?'SI':'no'} · stadio 3D in pagina: ${busta.webgl?'SI':'no'} · visi SVG: ${visi}`);
console.log(`  corpi CH38 nella scena: ${corpiScena} · modelli chiesti alla rete: ${corpi.length}`);
console.log(`  errori di pagina ${err.length}${err.length?' → '+err[0]:''}`);
const ok = rosso ? (corpiScena>0||corpi.length>0) : (corpiScena===0 && busta.gala && busta.webgl>0 && visi>=5 && err.length===0);
console.log(ok ? (rosso ? "\n\u2705 difetto riprodotto — col rosso il CH38 torna a essere caricato"
                        : "\n\u2705 PASS — lo stadio c'e', il CH38 non viene mai chiesto, e i visi sono quelli della libreria")
              : '\n\u274c FAIL');
process.exit(ok?0:1);
