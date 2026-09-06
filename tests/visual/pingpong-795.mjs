/* [7.795 misura] IL PING PONG DOPO LA CONCLUSIONE, DENTRO LA SCENA DELL'EROE.
   Nota PO sulla 7.792 (S.11 W.17, 33', SIT #67 [cross] «Tiro col mancino a sorpresa» → miss):
   «ha mostrato un ping pong ripetuto, un tiro da distanza enorme... insomma non e' calcio ma una
   sequenza di bug».
   Il 7.702 aveva gia' costruito il DOPO-PARATA come palla morta (angolo o presa) — ma solo per le
   occasioni extra-eroe (`_pg532.occ`). Qui la scena e' dell'EROE, e quel ramo non la tocca: dopo la
   conclusione il pallone resta VIVO e rimbalza (`hlPostVY*=-0,22`, `-0,30`).
   METODO: si forza la situazione, si risolve l'azione e si campiona la posizione del pallone a passo
   fitto per la finestra del post-azione. Si conta un'INVERSIONE quando il verso lungo x cambia con
   un'ampiezza superiore a due unita' di gioco — cosi' il tremolio non conta e un rimbalzo vero si'.
   Un rimbalzo dopo un tiro e' calcio; quattro o cinque avanti e indietro sono il ping pong. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();
const GI=(process.env.CPM_GI||'67,63,93,17,87,113,153,178').split(',').map(Number);
const ctx=await b.newContext({viewport:{width:412,height:915}});
const page=await ctx.newPage();await installCdnRoutes(page);
await page.addInitScript(()=>{window.__CPM_GLB=false;window.__CPM_REC=true;window.__CPM_PRESENT=1;});
await openMatch(page,port,{});
const RIS=[];
const q=(v,p)=>{if(!v.length)return NaN;const w=v.slice().sort((x,y)=>x-y);return w[Math.min(w.length-1,Math.floor(p*w.length))];};
for(const gi of GI){
  try{
    await page.evaluate(([i,c])=>window.__CPM_FORCE_SIT(i,c),[gi,true]);
    await sleep(700);
    await page.evaluate(()=>window.__CPM_RESOLVE&&window.__CPM_RESOLVE(0));
    const P=[];const fine=Date.now()+5200;
    while(Date.now()<fine){
      const d=await page.evaluate(()=>{try{const st=window.__CPM_STATE&&window.__CPM_STATE();
        return st&&st.ball?{x:st.ball.x,y:st.ball.y,t:Date.now()}:null;}catch(e){return null;}});
      if(d)P.push(d);
      await sleep(90);
    }
    if(P.length<8){console.log('gi'+gi+' — campioni insufficienti ('+P.length+')');continue;}
    /* inversioni del verso lungo x, con ampiezza minima di due unita' */
    let inv=0,seg=0,verso=0,estremo=P[0].x;const amp=[];
    for(let i=1;i<P.length;i++){
      const d=P[i].x-P[i-1].x;
      if(Math.abs(d)<0.05)continue;
      const v=d>0?1:-1;
      if(verso===0){verso=v;estremo=P[i].x;continue;}
      if(v!==verso){
        const a=Math.abs(P[i-1].x-estremo);
        if(a>=2){inv++;amp.push(+a.toFixed(1));estremo=P[i-1].x;verso=v;}
      } else estremo=(v>0)?Math.max(estremo,P[i].x):Math.min(estremo,P[i].x);
      seg++;
    }
    const escursione=Math.max(...P.map(p=>p.x))-Math.min(...P.map(p=>p.x));
    RIS.push({gi,inv,amp,escursione:+escursione.toFixed(1),n:P.length});
    console.log('gi'+String(gi).padStart(3)+' · campioni '+P.length+' · INVERSIONI (>2u) '+inv
      +' · ampiezze '+JSON.stringify(amp.slice(0,8))+' · escursione totale '+escursione.toFixed(1)+'u'
      +(inv>=3?'   ← PING PONG':''));
  }catch(e){console.log('gi'+gi+' — errore: '+String(e.message).slice(0,90));}
}
await ctx.close();await b.close();srv.close();
console.log('');
const I=RIS.map(r=>r.inv);
console.log('=== '+RIS.length+' scene ===');
if(!I.length){console.log('  NESSUN CAMPIONE — misura mancata, non un verde.');process.exit(2);}
console.log('  inversioni per scena: mediana '+q(I,0.5)+' · p75 '+q(I,0.75)+' · max '+Math.max(...I));
const pp=RIS.filter(r=>r.inv>=3);
console.log('  scene con PING PONG (>=3 inversioni da oltre 2u): '+pp.length+'/'+RIS.length
  +(pp.length?'  → '+pp.map(r=>'gi'+r.gi+'('+r.inv+')').join(' · '):''));
