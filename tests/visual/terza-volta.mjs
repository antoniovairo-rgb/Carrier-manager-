/* GUARDIANO «TRE VOLTE CONTRO LO STESSO NON SI GIOCA» — dal collaudo PO del 17/09, con le sue due foto.
   Nel calendario di S.11 «FC Aston» compare gia' due volte (W.35 0-0, W.38 5-1) e a stagione finita
   la schermata pre-partita ne offriva una TERZA, in casa. Qui si ricostruisce ESATTAMENTE quella
   situazione e si chiede al rilevatore unico (__CPM_CAREER.staleMd) se la riconosce.
   NESSUNA PROVA DEL ROSSO, e va detto: la rete nuova che avevo scritto per questo caso e' stata
   REVOCATA perche' il rosso passava lo stesso — il caso qui sotto lo cattura gia' la rete della SEDE
   (stessa squadra, stesso campo). Quindi questo guardiano non prova un rimedio: prova un INVARIANTE
   che oggi tiene, cioe' che una terza gara contro la stessa squadra non venga offerta. Il caso vero
   del PO — dove invece viene offerta — NON e' ancora riprodotto: serve il suo salvataggio. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const rosso = false;/* [vedi intestazione] nessun rosso: non c'e' un rimedio da provare */
const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport:{width:412,height:915} });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
const err = [];
page.on('pageerror', e => err.push(String(e).slice(0,160)));
/* [difetto della prima stesura] `__CPM_CAREER` non esiste finche' non c'e' una CARRIERA montata: la
   prima versione apriva la pagina nuda e leggeva `undefined`. Si semina un salvataggio, come fa
   stale-matchday-test, che e' il guardiano vicino di casa. */
await page.addInitScript((r)=>{ window.__CPM_GLB=false; if(r) window.__CPM_NO946=true;
  const save={phase:'career',player:{name:'Anti Replay',nation:'Italia',avatarId:0,proStatus:'pro',
    season:11,week:39,age:28,ovr:88,
    club:{id:'mer',n:'FC Merseyside',a:'MER',p:88,c:'#8e1f33',c2:'#f0b33a',nat:'\ud83c\udff4',lg:'Premier Division'},
    stats:{'velocit\u00e0':86,tecnica:86,fisico:84,'mentalit\u00e0':86,tiro:88,passaggio:85,dribbling:86,posizionamento:86},
    form:90,morale:95,fatigue:30,popularity:80,value:90,bankBalance:900000,
    contract:{duration:3,wage:90000,expiresAtSeason:14}}};
  try{localStorage.setItem('cpm-v3',JSON.stringify(save));}catch(_e){}
}, rosso);
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:90000 });
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:60000}).catch(()=>{});
await sleep(1500);
try{ await page.getByText('CONTINUA',{exact:false}).first().click({timeout:8000}); }catch(_e){}
await page.waitForFunction(()=>!!(window.__CPM_CAREER&&window.__CPM_CAREER.staleMd),{timeout:25000}).catch(()=>{});
const out = await page.evaluate(()=>{
  const S=11;
  /* il calendario del PO: due gare contro FC Aston GIA' GIOCATE, piu' altre voci di contorno */
  const cal=[
    {week:34,matchday:34,opponentId:'ros',opponentName:'AC Rossoneri',isHome:false,played:true,result:{}},
    {week:35,matchday:35,opponentId:'ast',opponentName:'FC Aston',isHome:false,played:true,result:{}},
    {week:36,matchday:36,opponentId:'sta',opponentName:'FC Stamford',isHome:true, played:true,result:{}},
    {week:37,matchday:37,opponentId:'mcr',opponentName:'Manchester Rovers',isHome:true,played:true,result:{}},
    {week:38,matchday:38,opponentId:'ast',opponentName:'FC Aston',isHome:true, played:true,result:{}},
    /* LA TERZA: stessa squadra, in casa, a una settimana SENZA gare giocate e con un numero di
       giornata mai registrato — cioe' fuori dalla portata di tutte le reti precedenti */
    {week:39,matchday:41,opponentId:'ast',opponentName:'FC Aston',isHome:true, played:false},
  ];
  const p={season:S,week:39,calendar:cal,playedMd:{s:S,md:[34,35,36,37,38]},
    matchHistory:[],standings:[],club:{id:'mer',n:'FC Merseyside'}};
  const terza=cal[cal.length-1];
  let stale=null,errore=null;
  try{ stale=window.__CPM_CAREER.staleMd(p,terza); }catch(e){ errore=String(e).slice(0,120); }
  return { stale, errore, rete:!window.__CPM_NO946 };
});
await browser.close(); await new Promise(r2=>server.close(r2));
console.log(`\n=== TRE VOLTE CONTRO LO STESSO === ${rosso?'[ROSSO __CPM_NO946]':'[VERDE]'}`);
console.log(`  la terza gara contro FC Aston e' riconosciuta stantia: ${out.stale===true?'SI':out.stale===false?'NO':JSON.stringify(out.stale)}`);
if(out.errore) console.log(`  il rilevatore ha lanciato: ${out.errore}`);
console.log(`  errori di pagina ${err.length}${err.length?' → '+err[0]:''}`);
const ok = rosso ? (out.stale!==true) : (out.stale===true && !out.errore && err.length===0);
console.log(ok ? (rosso ? '\n✅ difetto riprodotto — senza la rete la terza gara viene offerta'
                        : '\n✅ PASS — la terza gara contro la stessa squadra non viene piu\' offerta')
              : '\n❌ FAIL');
process.exit(ok?0:1);
