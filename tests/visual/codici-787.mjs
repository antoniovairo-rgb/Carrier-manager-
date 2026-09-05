/* [7.787 STRUMENTO] IL CENSIMENTO DEI CODICI DEL PO SU SCENE FORZATE, GLB ON.
   La coda delle note del PO parla per codici (000 gesto scoordinato, 001 apertura scena, 010
   pattinata, 011 palla congelata, 014 palla flipper, 111 portiere fuori tempo…) e il gioco ha gia' il
   rilevatore che li accende: `draftBugNote`, esposto come `__CPM_DRAFTNOTE`, lo stesso che scrive le
   righe che il PO incolla.
   PERCHE' UNO STRUMENTO NUOVO. `sguardo-696` fa girare quel rilevatore su scene VERE con GLB ON, ma
   aspetta che la partita gliele porti: misurato oggi, DUE scene utili in venticinque minuti, tutte
   dallo stesso mondo. Su due scene non si giudica niente. Qui le scene si FORZANO una per una — stesso
   regime del gioco vero (GLB ON, esecutore cinematico acceso), stesso rilevatore, stesso contesto — e
   il campione sale a una dozzina in dieci minuti.
   Sola lettura: nessun comportamento cambia. Con CPM_GLB=0 si torna al regime veloce, ma allora il
   sistema delle clip non gira e i codici sul GESTO non possono nemmeno accendersi (misurato: 28 scene
   aperte GLB OFF, zero registrazioni nel contatore dei gesti). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GLB=process.env.CPM_GLB!=='0';
const PASSO=+(process.env.CPM_PASSO||16), AZIONI=(process.env.CPM_AZIONI||'0').split(',').map(Number);
const srv=await startServer();const port=srv.address().port;
const b=await launchBrowser();const page=await b.newPage({viewport:{width:412,height:915}});
await installCdnRoutes(page);
await page.addInitScript((o)=>{window.__CPM_GLB=o.glb;window.__CPM_REC=true;window.__CPM_CINE=1;
  (o.rossi||[]).forEach(r=>{window[r]=1;});},{glb:GLB,rossi:(process.env.CPM_ROSSO||'').split(',').map(x=>x.trim()).filter(Boolean)});
await openMatch(page,port);await sleep(GLB?4000:800);
const tot=await page.evaluate(()=>window.__CPM_SITS.length);
const GIs=[];for(let i=0;i<tot;i+=PASSO)GIs.push(i);
const RIGHE=[];
for(const gi of GIs){
  for(const ai of AZIONI){
    let ok=false;try{ok=await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);}catch(e){}
    if(!ok)continue;
    await sleep(GLB?1200:420);
    await page.evaluate(()=>{window.__CPM_FROZEN=false;});
    await sleep(GLB?400:160);
    let r=false;try{r=await page.evaluate(k=>window.__CPM_RESOLVE(k),ai);}catch(e){}
    if(!r)continue;
    await sleep(GLB?7000:2600);
    const out=await page.evaluate(()=>{
      const snap=window.__CPM_WATCH_SNAP&&window.__CPM_WATCH_SNAP();
      if(!snap||!snap.samples||!snap.samples.length)return{err:'nessun campione'};
      const S=snap.samples;const ks=S.map(s=>s.sk).filter(k=>k!=null&&k>=0);
      if(!ks.length)return{err:'nessuna chiave di scena'};
      const k=Math.max(...ks);const W=S.filter(s=>s.sk===k);
      /* il rilevatore si chiama COME LO CHIAMA IL GIOCO: col contesto vero, non con la sola chiave —
         senza intent/out il test «scena difensiva?» e' sempre falso e il 001 scatta dove non deve. */
      let ctx=null;try{ctx=window.__CPM_BUGCTX&&window.__CPM_BUGCTX();}catch(e){}
      ctx=ctx?{...ctx,sceneKey:k}:{sceneKey:k};
      let txt='';try{txt=window.__CPM_DRAFTNOTE(snap,ctx)||'';}catch(e){txt='ERR '+e.message;}
      /* [7.787] LA TRACCIA DELLA CUSTODIA quando il 001 si accende: `md` e' la distanza del compagno
         piu' vicino dal pallone, campione per campione. Serve a sapere se qualcuno STA ARRIVANDO (la
         distanza cala) o se il pallone resta abbandonato (la distanza sta ferma o cresce): sono due
         difetti diversi e vogliono due rimedi diversi. */
      const t0=W.length?W[0].t:0;
      const md=W.map(q=>({s:+((q.t-t0)/1000).toFixed(1),d:(q.md==null||q.md<0)?null:+q.md.toFixed(1)}));
      return{n:W.length,txt,intent:ctx.intent||null,out:ctx.out||null,def:!!ctx.def,md};
    });
    RIGHE.push({gi,ai,...out});
    const codici=(out.txt||'').match(/codice \d{3}|SALTO|uscita dal campo/g)||[];
    /* [7.787] la RIGA INTERA quando un codice si accende: il nome del codice dice CHE COSA, il testo
       dice QUANTO — e senza il quanto non si sceglie un rimedio. */
    if(codici.length)String(out.txt||'').split('\n').filter(l=>/codice |SALTO|uscita dal campo/.test(l)).forEach(l=>console.log('        '+l.trim()));
    if(codici.some(c=>/001/.test(c))&&out.md)console.log('        custodia (s:distanza del compagno piu vicino) '+out.md.filter(m=>m.s<=3.2).map(m=>m.s+':'+(m.d==null?'?':m.d)).join(' '));
    console.log('#'+gi+'.'+ai+'  campioni '+(out.n||0)+'  intent '+(out.intent||'?')+'  esito '+(out.out||'?')
      +'  →  '+(codici.length?codici.join(' · '):'—')+(out.err?('  ['+out.err+']'):''));
  }
}
const G000=await page.evaluate(()=>window.__CPM_G000||{});
await b.close();srv.close();
const utili=RIGHE.filter(r=>!r.err&&(r.n||0)>=8);
const CODICI=['001','003','004','006','007','011','012','014','SALTO','uscita dal campo'];
console.log('');
console.log('=== CENSIMENTO ('+utili.length+' scene utili su '+RIGHE.length+' aperte · GLB '+(GLB?'ON':'OFF')+') ===');
for(const c of CODICI){const n=utili.filter(r=>String(r.txt||'').includes(c==='SALTO'||c==='uscita dal campo'?c:'codice '+c)).length;
  console.log('  '+c.padEnd(18)+n+'/'+utili.length);}
const gk=Object.keys(G000);const due=gk.filter(k=>(G000[k].n|0)>=2);
console.log('  000 (secondo gesto)  '+due.length+'/'+gk.length+' scene registrate dal contatore in gioco');
