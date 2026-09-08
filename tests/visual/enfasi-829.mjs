/* [MISURA 829 · S3 v1 / 7.811] L'ENFASI DICE LA COSA VERA? Per ogni riga d'enfasi del diario (le due
   famiglie di r.5170: «dominio» e «sofferenza») si guarda il punteggio a quel minuto:
     INCOERENTE = famiglia «dominio» con la frase di chi e' avanti/pari mentre siamo SOTTO, o famiglia
                  «sofferenza» con la frase di chi difende mentre siamo AVANTI di due o piu' — oppure una
                  parola di stato («sotto», «avanti», «pari/sblocca») che contraddice il tabellone;
     MUTA       = riga d'enfasi senza nessuna parola di stato (dice l'umore, non la partita).
   Rosso CPM_ROSSO=811S. Atteso: incoerenti 0 nel verde; mute alte nel rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI=(process.env.CPM_NOMI||'Ea,Eb,Ec,Ed').split(',');
const SEMI=NOMI.map((_,g)=>5150+g*397);
const DOM=/dominando|in fiamme|Momento magico|spinge|spingiamo|serve il gol|sblocca|in controllo|Dominio/i;
const SOF=/Reggiamo|Sotto pressione|teniamo duro|schiacciati|in salita|scossa|delicato|assedio|sofferenza|si difende|va difeso|coi denti/i;
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
let tot=0,inc=0,mute=0;const esempi=[];
for(let g=0;g<NOMI.length;g++){
  const ctx=await b.newContext({viewport:{width:412,height:915}});
  const page=await ctx.newPage();await installCdnRoutes(page);
  await page.addInitScript((o)=>{window.__CPM_GLB=true;window.__CPM_REC=true;window.__CPM_SCMS681=3500;window.__CPM_DTREAL=true;window.__CPM_CRO802=[];if(o.rosso)window['__CPM_NO'+o.rosso]=true;},{rosso:(process.env.CPM_ROSSO||'')});
  await openMatch(page,port,{skipLoadAll:true,name:NOMI[g]});
  await page.evaluate((s)=>window.__CPM_AUTOPLAY(true,{seed:s,policy:'seeded',tickMs:300}),SEMI[g]);
  const punti={};let clock=0;
  for(let k=0;k<3400;k++){await sleep(200);
    const s=await page.evaluate(()=>{const ms=window.__CPM_MS&&window.__CPM_MS();return ms?{min:ms.min|0,h:(ms.score&&ms.score.h)|0,a:(ms.score&&ms.score.a)|0}:null;});
    if(!s)continue;clock=s.min;punti[s.min]=s.h-s.a;if(clock>=89)break;}
  const cro=await page.evaluate(()=>(window.__CPM_CRO802||[]).map(x=>({t:x.t|0,txt:x.txt||''})));
  await ctx.close();
  let n=0,i2=0,m2=0;
  cro.forEach(c=>{const dom=DOM.test(c.txt),sof=SOF.test(c.txt);if(!dom&&!sof)return;
    /* solo le righe d'enfasi di r.5170: escludo le righe di piano/catena che possono contenere «spinge» */
    if(!/^(🔥|💪|⚡|😤|🛡️|⚠️)\s/.test(c.txt))return;
    let sd=0;for(let m=c.t;m>=0;m--){if(punti[m]!==undefined){sd=punti[m];break;}}
    n++;tot++;
    const diceSotto=/\bsotto\b/i.test(c.txt)&&!/sotto pressione|sotto assedio/i.test(c.txt);
    const diceAvanti=/\bavanti\b|vantaggio/i.test(c.txt);const dicePari=/\bpari\b|pareggio|sblocca/i.test(c.txt);
    const parola=diceSotto||diceAvanti||dicePari;
    let bad=false;
    if(diceSotto&&sd>=0)bad=true;if(diceAvanti&&sd<=0)bad=true;if(dicePari&&sd!==0)bad=true;
    if(!parola){m2++;mute++;
      /* la famiglia senza parola di stato: «teniamo alta l'intensità» / «in fiamme» / «magico» sotto nel punteggio e' la bugia del rapporto n°3 */
      if(dom&&/teniamo alta|in fiamme|Momento magico/i.test(c.txt)&&sd<0)bad=true;
      if(sof&&/Reggiamo|teniamo duro/i.test(c.txt)&&sd>=2)bad=true;}
    if(bad){i2++;inc++;if(esempi.length<6)esempi.push(c.t+"' ("+(sd>0?'+':'')+sd+") "+c.txt.slice(0,90));}});
  console.log('  '+NOMI[g]+': righe d\'enfasi '+n+' · incoerenti '+i2+' · mute sullo stato '+m2);
}
await b.close();srv.close();
console.log('\n=== L\'ENFASI E IL TABELLONE ('+NOMI.length+' partite) ===');
console.log('  righe d\'enfasi '+tot+' · INCOERENTI '+inc+' ('+(tot?Math.round(100*inc/tot):0)+'%) · mute sullo stato '+mute+' ('+(tot?Math.round(100*mute/tot):0)+'%)');
esempi.forEach(e=>console.log('   · '+e));
