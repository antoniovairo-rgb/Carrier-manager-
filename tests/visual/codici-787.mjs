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
/* [7.787] CPM_DT60=1 fa avanzare il tempo di gioco di 1/60 per fotogramma renderizzato: l'aritmetica
   del telefono, orologio da parete piu' lento. Serve per i codici che vivono sul singolo fotogramma
   (007 camera, 014 flipper): col dt del banco le reti di legalita' chiudono in una passata sola e il
   fenomeno del PO non puo' nemmeno formarsi. Le attese si allungano di conseguenza. */
const DT60=process.env.CPM_DT60==='1';
await page.addInitScript((o)=>{window.__CPM_GLB=o.glb;window.__CPM_REC=true;window.__CPM_CINE=1;
  if(o.dt60)window.__CPM_DT60=1;
  (o.rossi||[]).forEach(r=>{window[r]=1;});},{glb:GLB,dt60:DT60,rossi:(process.env.CPM_ROSSO||'').split(',').map(x=>x.trim()).filter(Boolean)});
await openMatch(page,port);await sleep(GLB?4000:800);
const tot=await page.evaluate(()=>window.__CPM_SITS.length);
const GIs=[];for(let i=0;i<tot;i+=PASSO)GIs.push(i);
const RIGHE=[];
for(const gi of GIs){
  for(const ai of AZIONI){
    let ok=false;try{ok=await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);}catch(e){}
    if(!ok)continue;
    await sleep(DT60?2000:(GLB?1200:420));
    await page.evaluate(()=>{window.__CPM_FROZEN=false;});
    await sleep(GLB?400:160);
    let r=false;try{r=await page.evaluate(k=>window.__CPM_RESOLVE(k),ai);}catch(e){}
    if(!r)continue;
    await sleep(DT60?12000:(GLB?7000:2600));
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
      /* [7.787] LA STESSA MATEMATICA DEL RILEVATORE, SU OGNI SCENA. La riga del codice 007 si accende
         solo oltre 1,5 inversioni al secondo: su trentanove scene ne accende due, e su due campioni non
         si giudica se un fenomeno e' una CODA o un CORPO. Qui le inversioni dello sguardo si contano per
         tutte, cosi' il metro ha risoluzione anche sotto soglia. Formula identica a sguardo-696: solo lo
         yaw, per secondo reale, ignorando gli scarti sotto 0,006 rad (rumore). */
      let yRev=0,yPrev=0,pMax=0;
      const tA=W[0].t,tB=W[W.length-1].t;const dur=Math.max(0.001,(tB-tA)/1000);
      for(let i=1;i<W.length;i++){const a2=W[i-1],b2=W[i];
        if(a2.lx==null||b2.lx==null||a2.cx==null||b2.cx==null)continue;
        const p=Math.hypot(b2.cx-a2.cx,b2.cz-a2.cz);if(p>pMax)pMax=p;
        const y1=Math.atan2(a2.lx-a2.cx,a2.lz-a2.cz),y2=Math.atan2(b2.lx-b2.cx,b2.lz-b2.cz);
        let dy=((y2-y1+Math.PI*3)%(Math.PI*2))-Math.PI;
        if(Math.abs(dy)>0.006){if(yPrev&&Math.sign(dy)!==Math.sign(yPrev))yRev++;yPrev=dy;}}
      /* ⚠️ [7.787] «AL SECONDO» NON E' CONFRONTABILE FRA I DUE REGIMI. Con __CPM_DT60 il gioco avanza
         di 1/60 per fotogramma renderizzato: un secondo d'orologio contiene molto MENO gioco, quindi le
         inversioni per secondo d'orologio calano da sole senza che la camera sia piu' calma. La prima
         lettura dava 0,14 contro 0,63 e sembrava un miglioramento: era un cambio di unita'.
         L'unita' onesta e' PER FOTOGRAMMA, che e' anche quella in cui l'ipotesi del 7.598 e' scritta
         («le reti si riarmano OGNI FOTOGRAMMA e duellano con la morbidezza»). */
      return{n:W.length,txt,intent:ctx.intent||null,out:ctx.out||null,def:!!ctx.def,md,
        inv:+(yRev/dur).toFixed(2),invF:+(yRev/Math.max(1,W.length-1)).toFixed(3),
        passo:+pMax.toFixed(2),dur:+dur.toFixed(1),fps:+((W.length-1)/dur).toFixed(1)};
    });
    RIGHE.push({gi,ai,...out});
    const codici=(out.txt||'').match(/codice \d{3}|SALTO|uscita dal campo/g)||[];
    /* [7.787] la RIGA INTERA quando un codice si accende: il nome del codice dice CHE COSA, il testo
       dice QUANTO — e senza il quanto non si sceglie un rimedio. */
    if(codici.length)String(out.txt||'').split('\n').filter(l=>/codice |SALTO|uscita dal campo/.test(l)).forEach(l=>console.log('        '+l.trim()));
    if(codici.some(c=>/001/.test(c))&&out.md)console.log('        custodia (s:distanza del compagno piu vicino) '+out.md.filter(m=>m.s<=3.2).map(m=>m.s+':'+(m.d==null?'?':m.d)).join(' '));
    console.log('#'+gi+'.'+ai+'  campioni '+(out.n||0)+'  intent '+(out.intent||'?')+'  esito '+(out.out||'?')
      +'  camera '+(out.invF==null?'?':out.invF)+' inv/fotogramma ('+(out.inv==null?'?':out.inv)+'/s d orologio, '+(out.fps||'?')+' fps)'
      +'  →  '+(codici.length?codici.join(' · '):'—')+(out.err?('  ['+out.err+']'):''));
  }
}
const G000=await page.evaluate(()=>window.__CPM_G000||{});
await b.close();srv.close();
const utili=RIGHE.filter(r=>!r.err&&(r.n||0)>=8);
const CODICI=['001','003','004','006','007','011','012','014','SALTO','uscita dal campo'];
console.log('');
console.log('=== CENSIMENTO ('+utili.length+' scene utili su '+RIGHE.length+' aperte · GLB '+(GLB?'ON':'OFF')+(DT60?' · dt del TELEFONO (1/60)':' · dt del banco')+') ===');
for(const c of CODICI){const n=utili.filter(r=>String(r.txt||'').includes(c==='SALTO'||c==='uscita dal campo'?c:'codice '+c)).length;
  console.log('  '+c.padEnd(18)+n+'/'+utili.length);}
const gk=Object.keys(G000);const due=gk.filter(k=>(G000[k].n|0)>=2);
console.log('  000 (secondo gesto)  '+due.length+'/'+gk.length+' scene registrate dal contatore in gioco');
const inv=utili.map(r=>r.inv).filter(x=>x!=null).sort((a,c)=>a-c);
const pas=utili.map(r=>r.passo).filter(x=>x!=null).sort((a,c)=>a-c);
const q=(v,p)=>v.length?v[Math.min(v.length-1,Math.floor(v.length*p))]:'-';
console.log('');
console.log('DISTRIBUZIONE DELLO SGUARDO (soglia del rilevatore: 1,5 inversioni/s)');
console.log('  inversioni/s d orologio   mediana '+q(inv,0.5)+' · p90 '+q(inv,0.9)+' · max '+q(inv,1)+' · sopra 1,5: '+inv.filter(x=>x>=1.5).length+'/'+inv.length);
const invF=utili.map(r=>r.invF).filter(x=>x!=null).sort((a,c)=>a-c);
const fps=utili.map(r=>r.fps).filter(x=>x!=null).sort((a,c)=>a-c);
console.log('  INVERSIONI PER FOTOGRAMMA mediana '+q(invF,0.5)+' · p90 '+q(invF,0.9)+' · max '+q(invF,1)+'   (unita confrontabile fra i regimi)');
console.log('  fotogrammi al secondo     mediana '+q(fps,0.5));
console.log('  passo max      mediana '+q(pas,0.5)+'u · p90 '+q(pas,0.9)+'u · max '+q(pas,1)+'u');
