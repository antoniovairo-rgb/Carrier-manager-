/* [KE 7.803 · #50] L'AZIONE PERICOLOSA VIENE ANNUNCIATA E NON MOSTRATA.
   Note PO: «Ha detto la telecronaca che c'e' stata una parata ma il motore non ha mostrato
   l'azione pericolosa» · «precedente azione pericolosa finta, ha fatto vedere azione
   insignificante a centrocampo».
   METRO: una riga che AFFERMA un fatto d'area (parata, tiro, occasione, gol) e' MOSTRATA se, nei
   due secondi attorno a essa, il pallone RESO e' arrivato almeno nell'ultimo terzo dalla parte
   giusta. Se resta a meta' campo, il racconto afferma e il campo smentisce.
   Si usa il pallone RESO — l'unico che il giocatore guarda — perche' il logico e' un altro oggetto
   (lezione della 7.803/7.804, sbagliata tre volte in una sessione). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Ea,Eb,Ec,Ed').split(',');
const SEMI=NOMI.map((_,g)=>6100+g*829);
const PERICOLO=/(parata|tuffo|respinge|devia|palo|traversa|gol|rete|conclusione|tiro|calcia|incornata|stacca|botta sicura|a giro|occasione|solo davanti|si divora)/i;
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const R=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_CRO802=[];});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  let min=0,viste=0;const scia=[];
  for(let k=0;k<3000;k++){
    await sleep(120);
    const s=await page.evaluate(()=>{
      const ms=window.__CPM_MS&&window.__CPM_MS();
      const st=window.__CPM_STATE&&window.__CPM_STATE();
      const cro=window.__CPM_CRO802||[];
      return {min:ms?(ms.min|0):0, bx:(st&&st.ball)?+st.ball.x.toFixed(1):null,
              n:cro.length, ultima:cro.length?cro[cro.length-1]:null};});
    if(!s)continue;min=s.min;
    if(s.bx!=null){scia.push(s.bx);if(scia.length>17)scia.shift();}
    if(s.n>viste){
      const nuova=s.ultima;viste=s.n;
      if(nuova&&PERICOLO.test(nuova.txt||'')){
        const prima=scia.slice();
        const dopo=[];
        for(let j=0;j<8;j++){await sleep(120);
          const q=await page.evaluate(()=>{const st=window.__CPM_STATE&&window.__CPM_STATE();
            return (st&&st.ball)?+st.ball.x.toFixed(1):null;});
          if(q!=null)dopo.push(q);}
        const tutti=prima.concat(dopo).filter(v=>v!=null);
        /* il frame e' eroe-centrico: la nostra porta e' a 0, la loro a 100 */
        const versoLoro=tutti.length?Math.max(...tutti):null;
        const versoNoi=tutti.length?Math.min(...tutti):null;
        const arrivata=(versoLoro!=null&&versoLoro>=70)||(versoNoi!=null&&versoNoi<=30);
        R.push({partita:NOMI[g],min:nuova.t,txt:(nuova.txt||'').slice(0,72),
                loro:versoLoro,noi:versoNoi,arrivata});
      }
    }
    if(min>=89)break;}
  console.log('  '+NOMI[g]+': righe che affermano un fatto d\'area '+R.filter(x=>x.partita===NOMI[g]).length);
  await ctx.close();
}
await b.close();srv.close();
const ok=R.filter(x=>x.arrivata).length;
console.log('\n=== LE AZIONI PERICOLOSE SONO MOSTRATE? ('+R.length+' righe su '+NOMI.length+' partite) ===');
console.log('  una riga e\' MOSTRATA se, nei ~2 s attorno, il pallone reso raggiunge un\'area (>=70 o <=30).');
console.log('  mostrate     '+ok+'/'+R.length+'  ('+(R.length?Math.round(100*ok/R.length):0)+'%)');
console.log('  NON mostrate '+(R.length-ok)+'/'+R.length+'  ('+(R.length?Math.round(100*(R.length-ok)/R.length):0)+'%)');
console.log('\n  le righe che il campo NON ha mostrato (prime 14):');
R.filter(x=>!x.arrivata).slice(0,14).forEach(x=>console.log('    '+String(x.min).padStart(3)+"'  palla fra "+String(x.noi).padStart(5)+' e '+String(x.loro).padStart(5)+'   «'+x.txt+'»'));
