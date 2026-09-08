/* [CENSIMENTO 834 · bugie S/K] IL PORTIERE E' IL PORTIERE. Nel diario (__CPM_CRO802), con i portieri in campo letti
   dal testimone __CPM_GK823: «rinvio dal fondo per X» (X deve essere un portiere), «X riparte in campo aperto» e
   «X blocca e rilancia con le mani» (il primo NON deve essere un portiere, il secondo SI'), «portiere di X» (mai).
   Rosso: CPM_ROSSO=823. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Vairo,Moretti,Galli,Conti').split(',');
const ROSSO=process.env.CPM_ROSSO||'';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const T={rinvio:[0,0],campoAperto:[0,0],mani:[0,0],portiereDi:0,righe:0,doppi:0,golEroe:[0,0],vant:[0,0]};
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((o)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_CRO802=[];if(o.rosso)String(o.rosso).split(',').forEach(r=>{window['__CPM_NO'+r]=true;});if(o.away)window.__CPM_AWAY_TEST=true;},{rosso:ROSSO,away:g>=NOMI.length/2});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate(()=>window.__CPM_AUTOPLAY(true,{seed:4242,policy:'seeded',tickMs:300}));
  let clock=0;for(let k=0;k<3400;k++){await sleep(200);clock=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?(ms.min|0):0;});if(clock>=89)break;}
  const d=await page.evaluate(()=>({cro:(window.__CPM_CRO802||[]).map(x=>({t:x.t|0,txt:String(x.txt||'')})),gk:window.__CPM_GK823||null,gol:((window.__CPM_EV&&window.__CPM_EV())||[]).filter(e=>e.ev==='goal').map(e=>({min:e.min|0,side:e.side,src:e.src}))}));
  await ctx.close();
  const gks=new Set([d.gk&&d.gk.h,d.gk&&d.gk.a].filter(Boolean));const isGk=(n)=>gks.has(String(n||'').replace(/\s*\(.*$/,''));
  const loc={rinvio:[0,0],campoAperto:[0,0],mani:[0,0],portiereDi:0};const ex=[];
  /* [T] lo stesso cognome due volte in una riga · [N] gol dell'eroe con la riga del gol · [V] «Squadra in vantaggio» col margine gia' > 1 */
  let doppi=0;const eroeGol=d.gol.filter(g=>g.src==='highlight'&&g.side==='home');let nRiga=0;let vTot=0,vFalsi=0;
  const margine=(mn)=>{let h=0,a=0;d.gol.forEach(g=>{if(g.min<=mn){if(g.side==='home')h++;else a++;}});return h-a;};
  d.cro.forEach(c=>{const s=c.txt;const w=(s.replace(/\([A-Z]{2,3}\)/g,'').match(/(?<=[\s:,—-])[A-Z][a-zà-ù']{2,}/g)||[]);const seen=new Set();for(const x of w){if(seen.has(x)&&!/^(Bruno|Silvio|Rete|Squadra|Momento)$/.test(x)){doppi++;ex.push('[doppio] '+s);break;}seen.add(x);}
    if(/^⚽ \S+ segna( su assist di \S+)?! \d+-\d+\.$/.test(s))nRiga++;
    if(/Squadra in vantaggio!/.test(s)){vTot++;if(margine(c.t)>=2){vFalsi++;ex.push('[vantaggio] '+c.t+"' "+s);}}});
  T.doppi+=doppi;T.golEroe[0]+=Math.min(nRiga,eroeGol.length);T.golEroe[1]+=eroeGol.length;T.vant[0]+=vFalsi;T.vant[1]+=vTot;
  d.cro.map(c=>c.txt).forEach(s=>{let m;
    if((m=/rinvio dal fondo per ([^\s.(]+)/.exec(s))){loc.rinvio[1]++;if(!isGk(m[1])){loc.rinvio[0]++;ex.push(s);}}
    if((m=/([^\s!]+) \([A-Z]{2,3}\) riparte in campo aperto/.exec(s))){loc.campoAperto[1]++;if(isGk(m[1])){loc.campoAperto[0]++;ex.push(s);}}
    if((m=/^([^\s]+) blocca e rilancia con le mani/.exec(s.replace(/^\S+\s/,'')))||(m=/([A-Z][^\s]+) blocca e rilancia con le mani/.exec(s))){loc.mani[1]++;if(!isGk(m[1])){loc.mani[0]++;ex.push(s);}}
    if(/portiere di [A-Z]/.test(s)){loc.portiereDi++;ex.push(s);}});
  T.righe+=d.cro.length;console.log('      [T] cognome doppio in una riga '+doppi+' · [N] gol dell\'eroe con la riga del gol '+Math.min(nRiga,eroeGol.length)+'/'+eroeGol.length+' · [V] «in vantaggio» col margine >1: '+vFalsi+'/'+vTot);for(const k of ['rinvio','campoAperto','mani']){T[k][0]+=loc[k][0];T[k][1]+=loc[k][1];}T.portiereDi+=loc.portiereDi;
  console.log('  '+NOMI[g]+': portieri '+[...gks].join('/')+' · rinvio dal fondo sbagliati '+loc.rinvio[0]+'/'+loc.rinvio[1]+' · portiere in campo aperto '+loc.campoAperto[0]+'/'+loc.campoAperto[1]+' · «con le mani» non portiere '+loc.mani[0]+'/'+loc.mani[1]+' · «portiere di X» '+loc.portiereDi);
  ex.slice(0,4).forEach(s=>console.log('      · '+s.slice(0,110)));
}
await b.close();srv.close();
console.log('\n=== IL PORTIERE E\' IL PORTIERE ('+NOMI.length+' partite'+(ROSSO?', ROSSO NO'+ROSSO:'')+') ===');
console.log('  rinvio dal fondo battuto da un uomo di movimento: '+T.rinvio[0]+'/'+T.rinvio[1]);
console.log('  portiere che riparte in campo aperto: '+T.campoAperto[0]+'/'+T.campoAperto[1]);
console.log('  «blocca e rilancia con le mani» detto di un uomo di movimento: '+T.mani[0]+'/'+T.mani[1]);
console.log('  «il portiere di X»: '+T.portiereDi+'   · righe lette '+T.righe);
console.log('  [T] righe con lo stesso cognome due volte: '+T.doppi);
console.log('  [N] gol dell\'eroe con la riga del gol (marcatore + tabellone): '+T.golEroe[0]+'/'+T.golEroe[1]);
console.log('  [V] «Squadra in vantaggio!» detto col margine gia\' >1: '+T.vant[0]+'/'+T.vant[1]);
