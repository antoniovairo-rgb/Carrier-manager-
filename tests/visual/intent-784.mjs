/* [7.784 censimento] L'INTENTO DELLA SCENA CONTRO CIO' CHE LA SCENA DICE.
   Nota PO su SIT #26 «Assist di tacco» e SIT #111 «Assist rasoterra»: entrambe arrivano taggate
   [shot]. deriveIntent legge SOLO la zona (z==="area" -> shot) e ignora sia il testo che le azioni.
   Qui conto quante situations dichiarano un ASSIST e vengono classificate come conclusione. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const browser=await launchBrowser();const page=await browser.newPage();
await installCdnRoutes(page);await page.addInitScript(()=>{window.__CPM_GLB=false;});
await openMatch(page,port);await sleep(300);
const res=await page.evaluate(()=>{
  const SITS=window.__CPM_SITS,dI=window.deriveIntent,dHL=window.deriveHL;
  const rows=[];
  SITS.forEach((sit,gi)=>{
    const it=(()=>{try{return dI(sit);}catch(e){return '?';}})();
    const acts=sit.actions||[];
    const rews=acts.map(a=>a&&a.rew);
    const nAssist=rews.filter(r=>r==='assist').length;
    const first=acts[0]||{};
    const hl=(()=>{try{return dHL(sit,first)||{};}catch(e){return{};}})();
    rows.push({gi,text:sit.text||'',it,zones:(sit.zones||[]).join('/'),
      firstRew:first.rew||null,firstStat:first.stat||null,firstLbl:first.label||'',
      hlType:hl.type||null,nAct:acts.length,nAssist});
  });
  return rows;
});
await browser.close();srv.close();
const ASSIST_TXT=/assist|serv[ei]|per il compagno|filtrant|imbucat|scarico|cross|traversone|velo|smarcament|appoggi/i;
const CONCL=new Set(['shot','insertion']);
const A=res.filter(r=>CONCL.has(r.it)&&ASSIST_TXT.test(r.text));
const B=res.filter(r=>CONCL.has(r.it)&&r.firstRew==='assist');
const C=res.filter(r=>CONCL.has(r.it)&&r.firstRew==='assist'&&ASSIST_TXT.test(r.text));
console.log('situations totali: '+res.length);
const cnt={};res.forEach(r=>{cnt[r.it]=(cnt[r.it]||0)+1;});
console.log('intenti: '+JSON.stringify(cnt));
console.log('');
console.log('A) intento CONCLUSIONE ma il TESTO promette una consegna: '+A.length);
A.slice(0,40).forEach(r=>console.log('   #'+r.gi+' ['+r.it+'] '+r.zones+' — '+r.text.slice(0,58)));
console.log('');
console.log('B) intento CONCLUSIONE ma la PRIMA azione (la protagonista) e un assist: '+B.length);
B.slice(0,40).forEach(r=>console.log('   #'+r.gi+' ['+r.it+'->'+r.hlType+'] '+r.zones+' — '+r.text.slice(0,42)+' | '+r.firstLbl.slice(0,34)));
console.log('');
console.log('C) entrambe (testo E azione dicono consegna, l intento dice conclusione): '+C.length);
C.forEach(r=>console.log('   #'+r.gi+' '+r.text.slice(0,58)));
