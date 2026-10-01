/* [MISURA 830 · 7.811] LA TABELLA DELL'ENFASI SU TUTTA LA GRIGLIA DEGLI STATI. La misura sul diario e' cieca
   (1 riga d'enfasi in 4 partite). Qui si chiama __CPM_ENFASI811(sd, finale, alto) per ogni stato — sotto di 1-2,
   pari, sopra di 1-2, inizio/finale, momentum alto/basso — e si controlla che NESSUNA frase contraddica il
   tabellone: sotto → mai «teniamo alta l'intensità / in fiamme / magico / avanti / vantaggio / sblocca»;
   sopra → mai «Reggiamo / Sotto nel punteggio / serve il gol / sblocca»; pari → mai «sotto nel punteggio / vantaggio».
   Rosso: CPM_ROSSO=811S (le terne originali) → celle incoerenti attese > 0. Verde atteso: 0. */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const ctx=await b.newContext({viewport:{width:412,height:915}});
const page=await ctx.newPage();await installCdnRoutes(page);
await page.addInitScript((o)=>{window.__CPM_REC=true;if(o.rosso)window['__CPM_NO'+o.rosso]=true;},{rosso:(process.env.CPM_ROSSO||'')});
await openMatch(page,port,{skipLoadAll:true,name:'Tab'});
const R=await page.evaluate(()=>{
  const f=window.__CPM_ENFASI811;if(typeof f!=='function')return {err:'__CPM_ENFASI811 assente'};
  const out=[];
  for(const sd of [-2,-1,0,1,2])for(const fin of [false,true])for(const alto of [true,false]){
    const frasi=f(sd,fin,alto)||[];
    frasi.forEach(t=>{let bad=null;
      if(sd<0&&/teniamo alta|in fiamme|Momento magico|\bavanti\b|vantaggio|sblocca|in controllo/i.test(t))bad='sotto ma parla da avanti/pari';
      if(sd>0&&/Reggiamo|Sotto nel punteggio|serve il gol|sblocca|pareggio è lì|\bsotto\b(?! pressione| assedio)/i.test(t))bad='avanti ma parla da sotto/pari';
      if(sd===0&&/Sotto nel punteggio|vantaggio|\bavanti\b/i.test(t))bad='pari ma parla da sotto/avanti';
      out.push({sd,fin,alto,t,bad});});}
  return {celle:out};});
await ctx.close();await b.close();srv.close();
if(R.err){console.log('  '+R.err);process.exit(1);}
const bad=R.celle.filter(c=>c.bad);
console.log('=== TABELLA DELL\'ENFASI ('+R.celle.length+' frasi su 20 stati) ===');
console.log('  frasi INCOERENTI col tabellone: '+bad.length+'/'+R.celle.length);
bad.slice(0,8).forEach(c=>console.log('   · sd'+(c.sd>0?'+':'')+c.sd+(c.fin?' finale':' ')+(c.alto?' alto':' basso')+'  «'+c.t+'»  → '+c.bad));
