/* ========================================================================
 * KORWARD ELITE — frammento n° 18  (dei 20, numerati da 00 a 19)
 * src/18-app-root.jsx
 *
 * APP ROOT · STRUMENTI DI REVISIONE · IMPOSTAZIONI · MOUNT
 *
 * Il wizard di revisione (_RVW_KEY, ReviewWizard), la modalità Situation Test (SitTest),
 * IntroCinematic, SettingsScreen, AudioSettings, SettingsQuickBtn, HomeNavBar, il
 * componente App, RootErrorBoundary e la chiamata finale a ReactDOM.createRoot(…).
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 40454-41424   ·   971 righe di 41427
 * La prima riga dopo questa intestazione è la riga 40454 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 40430 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
/* ========================================
   APP ROOT
======================================== */
// ============================================================================
// SITUATION TEST MODE (5.43.1) — strumento di iterazione per il Live Match Engine.
//   Attivo SOLO con ?sit=N nell'URL. Monta un match sintetico e salta DIRETTO
//   alla Situation N come highlight LIVE (NON cpmtest → il build-up cinematico,
//   es. BALL_CARRY, viene eseguito davvero). Pannello: ◀ ▶ per cambiare Situation,
//   🔁 per ripetere. Zero impatto sul gioco normale (nessun ?sit= → mai montato).
// ============================================================================
/* ════════════════════════════════════════════════════════════════════════════════════════════════════
   [7.211.0 direttiva PO «c'è modo di farmi testare in sequenza tutte le azioni e relative combinazioni?
   testo e do feedback all'infinito finché tutte le combinazioni hanno il mio ok» + «deve essere un wizard
   super fruibile con tutte le combinazioni in sequenza, positive e negative»]
   WIZARD DI REVISIONE — percorre OGNI combinazione (situazione × azione × esito riuscito/fallito), la gioca
   in 3D con la presentazione REALE e registra il verdetto del PO (OK / da correggere + nota).
   · le azioni sono quelle VISIBILI a schermo (`filterSitActions`), non quelle scartate dai filtri;
   · l'esito è FORZATO in entrambe le direzioni → si vedono anche i casi rari (l'assist finalizzato dal
     compagno, il palo, la parata) che in partita capitano una volta su cento;
   · i verdetti stanno in `safeLS` (`cpm-review-v1`) → si riprende SEMPRE da dove si era rimasti;
   · «Da correggere» esporta l'elenco (situazione, azione, esito, nota) da passare allo sviluppo.
   Modalità di sviluppo: mai raggiungibile nella build store (`__CPM_STORE_BUILD`). Riusa gli hook di
   forzatura già esistenti (__CPM_FORCE_SIT / __CPM_RESOLVE / __CPM_FORCE_OUTCOME) — zero logica duplicata. */
const _RVW_KEY="cpm-review-v1";
const _rvwLoad=()=>{try{return JSON.parse(safeLS.get(_RVW_KEY)||"{}")||{};}catch(_e){return {};}};
const _rvwSave=(o)=>{try{safeLS.set(_RVW_KEY,JSON.stringify(o));}catch(_e){}};
function ReviewWizard({onExit}){
  const ALL=(typeof SITUATIONS!=='undefined')?SITUATIONS:[];
  /* elenco COMPLETO delle combinazioni: per ogni situazione, ogni azione mostrata, entrambi gli esiti */
  const combos=React.useMemo(()=>{
    const out=[];
    for(let gi=0;gi<ALL.length;gi++){
      const sit=ALL[gi];if(!sit||!Array.isArray(sit.actions))continue;
      const sz=sit.startZone&&sit.startZone.x?(sit.startZone.x[0]+sit.startZone.x[1])/2:58;
      let vis;try{vis=filterSitActions(sit.actions,sz,sit)||sit.actions;}catch(_e){vis=sit.actions;}
      for(let k=0;k<sit.actions.length;k++){
        if(vis.indexOf(sit.actions[k])<0)continue;// azione non mostrata in quel contesto → non va revisionata
        out.push({gi,ai:k,ok:true});out.push({gi,ai:k,ok:false});
      }
    }
    return out;
  },[]);
  const [verd,setVerd]=useState(_rvwLoad);
  const kOf=(c)=>c.gi+"|"+c.ai+"|"+(c.ok?1:0);
  /* [7.300.0] con `?review=gi.ai.ok` si parte da TUTTE le combinazioni (il filtro «mai viste» nasconderebbe
     proprio quella gia' revisionata che si vuole ricontrollare dopo un fix). */
  const _jump=(typeof window!=="undefined"&&window.__CPM_REVIEW_JUMP)||null;
  const [filter,setFilter]=useState(_jump?"all":"todo");
  const list=React.useMemo(()=>{
    if(filter==="ko")return combos.filter(c=>verd[kOf(c)]&&verd[kOf(c)].v===0);
    /* [7.219.0] «da riverificare» = bocciate su una build PRECEDENTE: sono le candidate a essere gia corrette,
       e sono anche le uniche che vale la pena rigiocare per prime dopo una raffica di fix. */
    if(filter==="stale")return combos.filter(c=>verd[kOf(c)]&&verd[kOf(c)].v===0&&(verd[kOf(c)].b||null)!==GAME_VERSION);
    if(filter==="todo")return combos.filter(c=>!verd[kOf(c)]);
    return combos;
  },[combos,verd,filter]);
  const [i,setI]=useState(()=>{if(!_jump)return 0;
    const k=combos.findIndex(c=>c.gi===_jump.gi&&c.ai===_jump.ai&&!!c.ok===!!_jump.ok);return k>=0?k:0;});
  const cur=list[Math.min(i,Math.max(0,list.length-1))]||null;
  const [note,setNote]=useState("");
  const [busy,setBusy]=useState(true);
  const [exp,setExp]=useState(null);
  const md=React.useMemo(()=>{
    const stats={velocità:82,tecnica:84,fisico:78,mentalità:80,tiro:85,passaggio:80,dribbling:86,posizionamento:82};
    const club={id:"tat",n:"Torino Athletic",a:"TAT",p:88,c:"#7c1d1d",c2:"#fff",nat:"🇮🇹",lg:"Lega A"};
    const opp={id:"mil",n:"Milano FC",a:"MIL",p:84,c:"#1e3a8a",c2:"#fff",nat:"🇮🇹",lg:"Lega A"};
    return {player:{name:"Revisione",nation:"🇮🇹",avatarId:0,foot:"R",archetype:"finisher",position:"Attaccante",age:24,stats,ovr:calcOvr(stats),club,season:3,week:10,weekLived:false,morale:75,form:75,fatigue:10,goals:0,assists:0,matches:0,matchHistory:[],log:[],trophies:[]},opp};
  },[]);
  /* gioca la combinazione: forza la situazione, poi risolve l'azione con l'esito voluto */
  const play=React.useCallback((c)=>{
    if(!c)return;setBusy(true);
    const go=()=>{
      const sit=ALL[c.gi];if(!sit||!window.__CPM_FORCE_SIT)return;
      const sz=sit.startZone;
      const px=(sz&&sz.x)?clamp((sz.x[0]+sz.x[1])/2,4,96):58,py=(sz&&sz.y)?clamp((sz.y[0]+sz.y[1])/2,4,96):50;
      try{window.__CPM_FORCE_SIT(c.gi,true,{x:px,y:py});}catch(_e){}
      setTimeout(()=>{try{window.__CPM_FORCE_OUTCOME=c.ok?'success':'fail';window.__CPM_RESOLVE&&window.__CPM_RESOLVE(c.ai);}catch(_e){}setBusy(false);},900);
    };
    if(window.__CPM_FORCE_SIT)go();
    else{let t=0;const id=setInterval(()=>{if(window.__CPM_FORCE_SIT){clearInterval(id);go();}else if(++t>160)clearInterval(id);},120);}
  },[ALL]);
  useEffect(()=>{setNote("");play(cur);},[cur&&cur.gi,cur&&cur.ai,cur&&cur.ok]);// eslint-disable-line
  const mark=(v)=>{
    if(!cur)return;
    const nv={...verd,[kOf(cur)]:{v,n:note.trim(),t:Date.now(),b:GAME_VERSION}};/* [7.219.0] la build su cui il verdetto e stato dato: senza, una bocciatura del mese scorso e indistinguibile da una di oggi e si finisce a ri-correggere cose gia corrette */
    setVerd(nv);_rvwSave(nv);
    /* con il filtro «mai viste» la combinazione appena giudicata esce dalla lista: l'indice resta dov'è
       e mostra automaticamente la successiva. Con gli altri filtri si avanza di uno. */
    if(filter==="todo")setI(x=>Math.min(x,Math.max(0,list.length-2)));else setI(x=>Math.min(x+1,list.length-1));
  };
  const done=combos.filter(c=>verd[kOf(c)]).length,ko=combos.filter(c=>verd[kOf(c)]&&verd[kOf(c)].v===0).length;
  const stale=combos.filter(c=>verd[kOf(c)]&&verd[kOf(c)].v===0&&(verd[kOf(c)].b||null)!==GAME_VERSION).length;/* [7.219.0] bocciate su build precedenti */
  const sit=cur?ALL[cur.gi]:null,act=sit&&sit.actions?sit.actions[cur.ai]:null;
  const bs={background:"#334155",color:"#fff",border:"none",borderRadius:8,padding:"9px 12px",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"};
  const doExport=()=>{
    /* [7.219.0] i verdetti restano salvati fra una sessione e l'altra: senza dire su QUALE build sono stati
       dati, un export mescola le bocciature di oggi con quelle gia corrette in una release precedente — ed e
       esattamente cosi che si finisce a ri-lavorare su difetti gia chiusi. Le vecchie sono in coda, marcate. */
    const _ko=combos.filter(c=>verd[kOf(c)]&&verd[kOf(c)].v===0);
    const _fmt=c=>{const s2=ALL[c.gi],a2=s2&&s2.actions?s2.actions[c.ai]:null,vv=verd[kOf(c)];
      return `gi${c.gi} · ${(s2&&s2.text)||"?"} · azione: ${(a2&&a2.label)||c.ai} · esito: ${c.ok?"RIUSCITO":"FALLITO"}${vv.n?` · nota: ${vv.n}`:""}`;};
    const cur1=_ko.filter(c=>(verd[kOf(c)].b||null)===GAME_VERSION),old=_ko.filter(c=>(verd[kOf(c)].b||null)!==GAME_VERSION);
    const rows=[`— bocciate su questa build (${GAME_VERSION}): ${cur1.length} —`,...cur1.map(_fmt)];
    if(old.length)rows.push("",`— bocciate su build PRECEDENTI (${old.length}, da riverificare: potrebbero essere gia corrette) —`,...old.map(c=>`[${verd[kOf(c)].b||"build ignota"}] `+_fmt(c)));
    const txt=_ko.length?rows.join("\n"):"(nessuna combinazione da correggere)";
    setExp(txt);try{navigator.clipboard&&navigator.clipboard.writeText(txt);}catch(_e){}
  };
  return <div style={{width:"100%",height:"100vh",position:"relative",background:"#050810",display:"flex",flexDirection:"column"}}>
    <div style={{flex:1,minHeight:0,overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <MatchErrorBoundary><LiveMatch player={md.player} opponent={md.opp} context="trial" isMatchHome={!(typeof window!=='undefined'&&window.__CPM_AWAY_TEST)} onMatchEnd={()=>{}}/></MatchErrorBoundary>{/* [7.726.0 strumento] __CPM_AWAY_TEST: il provino si apre IN TRASFERTA per le sonde (la 7.725 ha corretto per lettura sei siti di frame senza poterli misurare). Default invariato. */}
    </div>
    {/* barra ALTA: avanzamento e uscita */}
    <div style={{position:"fixed",top:6,left:6,right:6,zIndex:99999,display:"flex",gap:8,alignItems:"center",background:"rgba(0,0,0,0.45)",backdropFilter:"blur(2px)",WebkitBackdropFilter:"blur(2px)",padding:"7px 10px",borderRadius:10,fontFamily:"inherit",fontSize:12,color:"#e2e8f0",flexWrap:"wrap",textShadow:"0 1px 2px rgba(0,0,0,0.8)"}}>
      <b style={{color:"#fbbf24",letterSpacing:1}}>🎬 REVISIONE</b>
      <span style={{fontWeight:800}}>{done} / {combos.length}</span>
      <span style={{color:"#f87171",fontWeight:800}}>{ko} da correggere</span>
      {stale>0&&<span style={{color:"#fbbf24",fontWeight:800}}>· {stale} da riverificare (build precedenti)</span>}
      <div style={{flex:1,minWidth:60,height:6,background:"#1e293b",borderRadius:3,overflow:"hidden"}}><div style={{width:`${combos.length?done/combos.length*100:0}%`,height:"100%",background:"#22c55e"}}/></div>
      <button onClick={onExit} style={{...bs,padding:"5px 10px",background:"#7f1d1d"}}>✕ Esci</button>
    </div>
    {/* barra BASSA: cosa stai guardando + verdetto. [7.235.0 collaudo PO «rendi piu trasparente lo sfondo
        nero altrimenti non riesco a vedere un pezzo di azione!»] il pannello copriva la parte bassa della
        scena 3D: sfondo 0.94→0.50 + blur leggero (leggibile) + text-shadow, cosi l'azione si vede ANCHE
        sotto la barra. Solo wizard di sviluppo, mai in build store. */}
    <div style={{position:"fixed",left:0,right:0,bottom:0,zIndex:99999,background:"rgba(2,6,16,0.50)",backdropFilter:"blur(2px)",WebkitBackdropFilter:"blur(2px)",borderTop:"1px solid rgba(30,41,59,0.6)",padding:"9px 10px 12px",fontFamily:"inherit",color:"#e2e8f0",textShadow:"0 1px 2px rgba(0,0,0,0.85)"}}>
      {!cur?<div style={{textAlign:"center",padding:"14px 0",fontWeight:800,color:"#22c55e"}}>✅ Nessuna combinazione in questo filtro — hai finito!</div>:<>
        <div style={{display:"flex",gap:8,alignItems:"center",fontSize:11,color:"#94a3b8",marginBottom:4}}>
          <span>gi{cur.gi} · azione {cur.ai+1}</span>
          <span style={{background:cur.ok?"#14532d":"#7f1d1d",color:"#fff",padding:"2px 7px",borderRadius:20,fontWeight:800}}>{cur.ok?"ESITO RIUSCITO":"ESITO FALLITO"}</span>
          {busy&&<span style={{color:"#fbbf24"}}>▶ in corso…</span>}
          <span style={{flex:1}}/>
          <span>{Math.min(i+1,list.length)}/{list.length} nel filtro</span>
        </div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sit?sit.text:"…"}</div>
        <div style={{fontSize:12,color:"#cbd5e1",marginBottom:7,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>▸ {act?act.label:"…"}</div>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Nota (facoltativa): cosa non va?" style={{width:"100%",boxSizing:"border-box",background:"rgba(15,23,42,0.7)",border:"1px solid rgba(30,41,59,0.7)",borderRadius:8,color:"#e2e8f0",padding:"8px 10px",fontSize:13,fontFamily:"inherit",marginBottom:7}}/>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          <button onClick={()=>mark(1)} style={{...bs,background:"#16a34a",flex:"1 1 90px"}}>👍 OK</button>
          <button onClick={()=>mark(0)} style={{...bs,background:"#dc2626",flex:"1 1 90px"}}>👎 Da correggere</button>
          <button onClick={()=>play(cur)} style={bs}>↻ Rivedi</button>
          <button onClick={()=>setI(x=>Math.max(0,x-1))} style={bs}>◀</button>
          <button onClick={()=>setI(x=>Math.min(list.length-1,x+1))} style={bs}>▶</button>
        </div>
      </>}
      <div style={{display:"flex",gap:7,marginTop:7,flexWrap:"wrap",alignItems:"center"}}>
        {[["todo","mai viste"],["ko","da correggere"],["stale","da riverificare"],["all","tutte"]].map(([k,l])=>
          <button key={k} onClick={()=>{setFilter(k);setI(0);}} style={{...bs,padding:"5px 10px",fontSize:11,background:filter===k?"#2563eb":"#1e293b"}}>{l}</button>)}
        <span style={{flex:1}}/>
        <button onClick={doExport} style={{...bs,padding:"5px 10px",fontSize:11,background:"#b45309"}}>📤 Esporta bocciate</button>
      </div>
      {exp!=null&&<div style={{marginTop:7}}>
        <textarea readOnly value={exp} onFocus={e=>e.target.select()} style={{width:"100%",boxSizing:"border-box",height:90,background:"#0f172a",border:"1px solid #1e293b",borderRadius:8,color:"#e2e8f0",padding:8,fontSize:11,fontFamily:"monospace"}}/>
        <button onClick={()=>setExp(null)} style={{...bs,padding:"4px 9px",fontSize:11,marginTop:4}}>chiudi</button>
      </div>}
    </div>
  </div>;
}
function SitTest({sitN}){
  const total=(typeof SITUATIONS!=='undefined')?SITUATIONS.length:179;
  const [n,setN]=useState(clamp(sitN||0,0,total-1));
  const md=React.useMemo(()=>{
    const stats={velocità:82,tecnica:84,fisico:78,mentalità:80,tiro:85,passaggio:80,dribbling:86,posizionamento:82};
    const club={id:"tat",n:"Torino Athletic",a:"TAT",p:88,c:"#7c1d1d",c2:"#fff",nat:"🇮🇹",lg:"Lega A"};
    const opp={id:"mil",n:"Milano FC",a:"MIL",p:84,c:"#1e3a8a",c2:"#fff",nat:"🇮🇹",lg:"Lega A"};
    const player={name:"Tester",nation:"🇮🇹",avatarId:0,foot:"R",archetype:"finisher",position:"Attaccante",age:24,stats,ovr:calcOvr(stats),club,season:3,week:10,weekLived:false,proStatus:"pro",goals:0,assists:0,matches:0,totalGoals:0,totalAssists:0,totalMatches:0,morale:75,fatigue:0,form:75,popularity:40,skillPoints:0,coachTrust:70,value:5,contract:{duration:2,wage:1000,expiresAtSeason:5},log:[],history:[],matchHistory:[],seasonObjectives:[],aiData:{pressReports:{},scoutReports:{},lastOpponentTactic:null},saveVersion:(typeof SAVE_VERSION!=='undefined'?SAVE_VERSION:7)};
    return {player,opp};
  },[]);
  const force=(idx)=>{const k=clamp(idx,0,total-1);setN(k);try{const sit=(typeof SITUATIONS!=='undefined')&&SITUATIONS[k];const sz=sit&&sit.startZone;const sx0=(sz&&sz.x)?(sz.x[0]+sz.x[1])/2:58;const sy0=(sz&&sz.y)?(sz.y[0]+sz.y[1])/2:50;const px=Math.max(sx0,62);window.__CPM_LOAD_ALL&&window.__CPM_LOAD_ALL();window.__CPM_FORCE_SIT&&window.__CPM_FORCE_SIT(k,true,{x:px,y:sy0});}catch(e){}};// 5.43.6: Y reale della situation (le rimesse a y~7 non più spostate a centro)
  useEffect(()=>{let tries=0;const id=setInterval(()=>{tries++;if(window.__CPM_FORCE_SIT&&window.__CPM_LOAD_ALL){force(n);clearInterval(id);}else if(tries>140)clearInterval(id);},150);return()=>clearInterval(id);},[]);// eslint-disable-line
  // 5.43.8: Ripeti SUCCESS / Ripeti FAIL — riforza la situation e risolve l'ULTIMA azione scelta con esito forzato
  const repeat=(outcome)=>{const k=(window.__CPM_LAST_K==null?0:window.__CPM_LAST_K);force(n);setTimeout(()=>{try{window.__CPM_FORCE_OUTCOME=outcome;window.__CPM_RESOLVE&&window.__CPM_RESOLVE(k);}catch(e){}},460);};
  const sit=(typeof SITUATIONS!=='undefined')?SITUATIONS[n]:null;
  const bs={background:"#334155",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"};
  return <div style={{width:"100%",height:"100vh",position:"relative",background:"#050810",display:"flex",flexDirection:"column"}}>
    {/* 5.43.6: catena flex di altezza (come la match-screen reale) → su mobile il canvas 3D NON collassa più a 0 (campo nero) */}
    <div style={{flex:1,minHeight:0,overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <MatchErrorBoundary><LiveMatch player={md.player} opponent={md.opp} context="trial" isMatchHome={!(typeof window!=='undefined'&&window.__CPM_AWAY_TEST)} onMatchEnd={()=>force(n)}/></MatchErrorBoundary>{/* [7.726.0 strumento] idem: apertura in trasferta per le sonde */}
    </div>
    <div style={{position:"fixed",top:6,left:6,right:6,zIndex:99999,display:"flex",gap:8,alignItems:"center",background:"rgba(0,0,0,0.82)",padding:"7px 10px",borderRadius:9,fontFamily:"monospace",fontSize:12,color:"#fff",flexWrap:"wrap",boxShadow:"0 2px 10px rgba(0,0,0,0.5)"}}>
      <b style={{color:"#fbbf24",letterSpacing:1}}>🎬 SIT TEST</b>
      <button onClick={()=>force(n-1)} style={bs}>◀</button>
      <span style={{minWidth:64,textAlign:"center"}}>gi{n} / {total-1}</span>
      <button onClick={()=>force(n+1)} style={bs}>▶</button>
      <button onClick={()=>force(n)} style={{...bs,background:"#2563eb"}}>🔁 Ripeti</button>
      <button onClick={()=>repeat('success')} style={{...bs,background:"#16a34a"}}>✅ Success</button>
      <button onClick={()=>repeat('fail')} style={{...bs,background:"#dc2626"}}>❌ Fail</button>
      <span style={{flex:1,minWidth:140,color:"#cbd5e1",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sit?sit.text:"…"}</span>
    </div>
  </div>;
}
/* [7.32.0 direttiva PO «video tutorial emozionale del live match prima dei provini, per impatto e adozione»]
   INTRO CINEMATICA — trailer renderizzato IN-ENGINE (zero asset video: vincolo peso Play Store): notte di
   stadio, corsa palla al piede, micro-tutorial del live match (scegli l'azione · mira · energia), IL TIRO
   all'incrocio con tuffo del portiere/rete/coriandoli, esultanza, CTA verso il provino. Mostrata UNA volta
   per device (localStorage 'cpm-intro-seen'), sempre skippabile, SPENTA sotto ?cpmtest=1 (harness/validator
   attraversano il flusso create→trial). Pattern GalaStage3D: scena Three dedicata, dispose profondo,
   fallback poster se WebGL/reduced-motion. */
function IntroCinematic({onDone}){
  const ref=React.useRef(null);
  const[beat,setBeat]=useState(0);
  const[flash,setFlash]=useState(false);
  const stRef=React.useRef({t0:0});
  const CAPS=[
    {t:0,   big:"KORWARD ELITE",sub:"La tua storia comincia stanotte."},
    {t:4,   big:null,sub:"Giovanni Pisano. Numero 9. Una carriera vera, una settimana alla volta."},/* [7.37.0 direttiva PO: l'eroe dell'intro ha un NOME] */
    {t:6.3, big:null,sub:"Il live match, come lo giocherai davvero:",chips:["⏱️ 1 · Tieniti pronto: arriva l'highlight","🕹️ 2 · Effettua i movimenti negli spazi","👆 3 · Scegli l'azione — anche su rigori e punizioni"]},
    {t:8.4,big:null,sub:null},
    {t:9.6,big:"⚽ GOOOL DI PISANO!",sub:"Vivi il momento — in 3D, azione per azione."},
    {t:12.8,big:null,sub:"Ogni gol scrive la tua leggenda."},
    {t:16.3,big:"Dalla Primavera al Trofeo d'Oro.",sub:"Tre provini ti separano dal tuo primo contratto.",cta:true},
  ];
  React.useEffect(()=>{
    const iv=setInterval(()=>{
      const el=(Date.now()-stRef.current.t0)/1000;
      let b=0;for(let i=0;i<CAPS.length;i++)if(el>=CAPS[i].t)b=i;
      setBeat(b);
      if(el>=9.5&&el<9.9)setFlash(true);
      if(el>=9.9)setFlash(false);
      if(el>29.4){clearInterval(iv);onDone&&onDone();}
    },120);
    return()=>clearInterval(iv);
  },[]);// eslint-disable-line
  React.useEffect(()=>{
    const host=ref.current;if(!host)return;
    stRef.current.t0=Date.now();
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true});}catch(_e){return;}
    const W=()=>host.clientWidth||360,H=()=>host.clientHeight||640;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setSize(W(),H());renderer.setClearColor(0x050810,1);
    host.appendChild(renderer.domElement);renderer.domElement.style.cssText="position:absolute;inset:0;width:100%;height:100%;";
    const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x050810,26,74);
    const cam=new THREE.PerspectiveCamera(50,W()/H(),0.1,120);
    scene.add(new THREE.AmbientLight(0xaab6d2,1.0));/* [7.42.0 collaudo PO «scena molto molto buia»] +54% */
    scene.add(new THREE.HemisphereLight(0xbdd2ff,0x2a3a2c,0.55));/* riempimento cielo/prato: i dettagli si leggono */
    const moon=new THREE.DirectionalLight(0xdfe9ff,1.05);moon.position.set(-8,18,10);scene.add(moon);
    [[-16,14],[16,14]].forEach(([x,z])=>{const l=new THREE.PointLight(0xfff2d0,1.35,70);l.position.set(x,14,z);scene.add(l);});/* fari più caldi e potenti */
    // prato a strisce
    const pitch=new THREE.Mesh(new THREE.PlaneGeometry(64,44),new THREE.MeshStandardMaterial({color:0x1d7c3c,roughness:0.95}));pitch.rotation.x=-Math.PI/2;scene.add(pitch);
    for(let i=0;i<8;i++){const s=new THREE.Mesh(new THREE.PlaneGeometry(64,2.7),new THREE.MeshStandardMaterial({color:0x196c34,roughness:0.95}));s.rotation.x=-Math.PI/2;s.position.set(0,0.01,-19+i*5.4);scene.add(s);}
    const lineMat=new THREE.MeshBasicMaterial({color:0xe8f2e8});
    /* [7.32.1 collaudo PO «disegna bene l'area di rigore con tutte le righe»] linea di fondo, area GRANDE
       (16m), area PICCOLA (6m), dischetto e LUNETTA — proporzioni reali scalate sulla porta 7.32 */
    const _ln=(w,d,x,z)=>{const ln=new THREE.Mesh(new THREE.PlaneGeometry(w,d),lineMat);ln.rotation.x=-Math.PI/2;ln.position.set(x,0.02,z);scene.add(ln);return ln;};
    _ln(30,0.14,0,-11.98);                     /* linea di fondo */
    _ln(20.2,0.14,0,-5.05);                    /* fronte area grande */
    _ln(0.14,7.1,-10.1,-8.5);_ln(0.14,7.1,10.1,-8.5); /* lati area grande */
    _ln(9.2,0.12,0,-9.5);                      /* fronte area piccola */
    _ln(0.12,2.55,-4.6,-10.72);_ln(0.12,2.55,4.6,-10.72); /* lati area piccola */
    {const spot=new THREE.Mesh(new THREE.CircleGeometry(0.14,14),lineMat);spot.rotation.x=-Math.PI/2;spot.position.set(0,0.02,-7.05);scene.add(spot);}
    /* [7.32.3 collaudo PO «la lunetta a puntini no: linea CONTINUA come le altre»] anello sottile con la
       mappatura verificata: rotation.x=-π/2 porta l'angolo θ del ring in (r·cosθ, 0, −r·sinθ) → il tratto
       fuori dall'area è θ∈[π+0.594, 2π−0.594] (z>−5.05). Larghezza 0.14 come le righe dritte. */
    {const arc=new THREE.Mesh(new THREE.RingGeometry(3.51,3.65,48,1,Math.PI+0.594,Math.PI-1.188),lineMat);
     arc.rotation.x=-Math.PI/2;arc.position.set(0,0.02,-7.05);scene.add(arc);}
    _ln(30,0.14,0,9.8);                        /* metà campo (in fondo alla scena) */
    /* [7.32.2 collaudo PO] LINEE LATERALI (rimesse) + archi del CALCIO D'ANGOLO */
    _ln(0.14,21.9,-14.93,-1.05);_ln(0.14,21.9,14.93,-1.05);
    [[-14.93,Math.PI+Math.PI/2],[14.93,Math.PI]].forEach(([cx,th0])=>{const ca=new THREE.Mesh(new THREE.RingGeometry(0.44,0.58,12,1,th0,Math.PI/2),lineMat);
      ca.rotation.x=-Math.PI/2;ca.position.set(cx,0.02,-12);scene.add(ca);});
    // porta (z=-12) + rete
    const postMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xdddddd,emissiveIntensity:0.5,roughness:0.4});
    const mkPost=(x)=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,2.44,10),postMat);p.position.set(x,1.22,-12);scene.add(p);};
    mkPost(-3.66);mkPost(3.66);
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,7.32,10),postMat);bar.rotation.z=Math.PI/2;bar.position.set(0,2.44,-12);scene.add(bar);
    const netCv=document.createElement('canvas');netCv.width=128;netCv.height=64;const nc=netCv.getContext('2d');nc.strokeStyle="rgba(255,255,255,0.85)";nc.lineWidth=1;for(let i=0;i<=16;i++){nc.beginPath();nc.moveTo(i*8,0);nc.lineTo(i*8,64);nc.stroke();}for(let j=0;j<=8;j++){nc.beginPath();nc.moveTo(0,j*8);nc.lineTo(128,j*8);nc.stroke();}
    const netTex=new THREE.CanvasTexture(netCv);netTex.repeat.set(3,1.6);netTex.wrapS=netTex.wrapT=THREE.RepeatWrapping;
    const net=new THREE.Mesh(new THREE.PlaneGeometry(7.3,2.42),new THREE.MeshBasicMaterial({map:netTex,transparent:true,opacity:0.4,side:THREE.DoubleSide}));net.position.set(0,1.21,-12.55);scene.add(net);
    // tribune scure + folla a punti (pulsa nei beat caldi)
    const standMat=new THREE.MeshStandardMaterial({color:0x141a28,roughness:0.9});
    [[0,-19,44,7,3],[0,19,44,7,3],[-27,0,3,7,40],[27,0,3,7,40]].forEach(([x,z,w,h,d])=>{const st=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),standMat);st.position.set(x,3.5,z);scene.add(st);});
    const crowdN=900;const cg=new THREE.BufferGeometry();const cArr=new Float32Array(crowdN*3);const cBase=new Float32Array(crowdN);
    for(let i=0;i<crowdN;i++){const side=i%4;let x,y,z;let _h=(i*2654435761)>>>0;_h^=_h>>>13;_h=(_h*2246822519)>>>0;_h^=_h>>>11;const r1=(_h%1000)/1000;let _h2=((i+7919)*2654435761)>>>0;_h2^=_h2>>>15;_h2=(_h2*3266489917)>>>0;const r2=(_h2%1000)/1000;
      if(side===0){x=-21+r1*42;z=-16.5-r2*4;}else if(side===1){x=-21+r1*42;z=16.5+r2*4;}else if(side===2){x=-26.5+r2*3;z=-17+r1*34;}else{x=23.5+r2*3;z=-17+r1*34;}
      y=2.2+r2*4.4;cArr[i*3]=x;cArr[i*3+1]=y;cArr[i*3+2]=z;cBase[i]=y;}
    cg.setAttribute('position',new THREE.BufferAttribute(cArr,3));
    const crowd=new THREE.Points(cg,new THREE.PointsMaterial({color:0xd8c9b8,size:0.34,transparent:true,opacity:0.85}));scene.add(crowd);
    /* [7.32.1 collaudo PO «disegna gli spalti con i tifosi con le sciarpe e bandiere!»] secondo strato di
       tifosi COLORATI (granata/bianco) + SCIARPE tese sopra le teste nella curva dietro la porta + BANDIERE
       su asta che sventolano (piani double-side animati nel tick) */
    const crowd2N=520;const cg2=new THREE.BufferGeometry();const c2Arr=new Float32Array(crowd2N*3);
    for(let i=0;i<crowd2N;i++){let _h=(i*2246822519)>>>0;_h^=_h>>>13;_h=(_h*2654435761)>>>0;const r1=(_h%1000)/1000;let _h2=((i+31)*3266489917)>>>0;_h2^=_h2>>>11;const r2=(_h2%1000)/1000;
      const side=i%3;let x,y,z;
      if(side===0){x=-19+r1*38;z=-16.8-r2*3.4;}else if(side===1){x=-19+r1*38;z=16.8+r2*3.4;}else{x=(i%2?-26:24)+r2*2.4;z=-15+r1*30;}
      y=2.5+r2*3.8;c2Arr[i*3]=x;c2Arr[i*3+1]=y;c2Arr[i*3+2]=z;}
    cg2.setAttribute('position',new THREE.BufferAttribute(c2Arr,3));
    const crowd2=new THREE.Points(cg2,new THREE.PointsMaterial({color:0xa3263a,size:0.4,transparent:true,opacity:0.9}));scene.add(crowd2);
    const scarves=[];for(let i=0;i<16;i++){const sc=new THREE.Mesh(new THREE.PlaneGeometry(1.7,0.22),new THREE.MeshBasicMaterial({color:i%2?0xa3263a:0xf5f0e6,side:THREE.DoubleSide}));
      sc.position.set(-15+i*2,4.6+((i*37)%3)*0.7,-17.4-((i*53)%2)*1.1);scene.add(sc);scarves.push(sc);}
    const flags=[];const flagCols=[0xa3263a,0xf5f0e6,0xd4a017,0xa3263a,0xf5f0e6,0xa3263a];
    for(let i=0;i<12;i++){const grp=new THREE.Group();
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,2.6,6),new THREE.MeshStandardMaterial({color:0x888888}));pole.position.y=1.3;grp.add(pole);
      const cloth=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.95),new THREE.MeshBasicMaterial({color:flagCols[i%flagCols.length],side:THREE.DoubleSide}));
      cloth.position.set(0.78,2.05,0);grp.add(cloth);grp._cloth=cloth;
      const behind=i<7;const fx=behind?(-13+i*4.4):(i%2?-25.4:23.6);const fz=behind?-16.6:(-12+(i-7)*5.6);
      grp.position.set(fx,3.1,fz);grp.rotation.y=behind?0:(i%2?Math.PI/2:-Math.PI/2);
      scene.add(grp);flags.push(grp);}
    // fari (coni additivi dagli angoli)
    [[-24,-16],[24,-16],[-24,16],[24,16]].forEach(([x,z])=>{const cone=new THREE.Mesh(new THREE.ConeGeometry(4.5,17,18,1,true),new THREE.MeshBasicMaterial({color:0xfff4d8,transparent:true,opacity:0.06,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));cone.position.set(x*0.82,8.5,z*0.82);cone.rotation.z=x>0?0.5:-0.5;cone.rotation.x=z>0?-0.4:0.4;scene.add(cone);});
    // figure: eroe (granata) + portiere (giallo)
    const mkFig=(shirtCol,shortCol)=>{const g=new THREE.Group();
      const skin=new THREE.MeshStandardMaterial({color:0xc9997a,roughness:0.8});
      const sh=new THREE.MeshStandardMaterial({color:shirtCol,roughness:0.7});
      const pn=new THREE.MeshStandardMaterial({color:shortCol,roughness:0.7});
      const legL=new THREE.Group(),legR=new THREE.Group();
      [[legL,-0.13],[legR,0.13]].forEach(([lg,x])=>{const th=new THREE.Mesh(new THREE.CylinderGeometry(0.085,0.075,0.85,8),pn);th.position.y=-0.42;lg.add(th);lg.position.set(x,0.88,0);g.add(lg);});
      const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.21,0.17,0.62,10),sh);torso.position.y=1.22;g.add(torso);
      const armL=new THREE.Group(),armR=new THREE.Group();
      [[armL,-0.26],[armR,0.26]].forEach(([a,x])=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.045,0.55,8),sh);c.position.y=-0.27;a.add(c);a.position.set(x,1.5,0);g.add(a);});
      const head=new THREE.Mesh(new THREE.SphereGeometry(0.155,14,12),skin);head.position.y=1.72;g.add(head);
      const hair=new THREE.Mesh(new THREE.SphereGeometry(0.158,14,10,0,Math.PI*2,0,Math.PI*0.5),new THREE.MeshStandardMaterial({color:0x241a12,roughness:0.9}));hair.position.y=1.735;g.add(hair);
      g._legL=legL;g._legR=legR;g._armL=armL;g._armR=armR;return g;};
    const hero=mkFig(0x8e1f33,0xf2f2f2);scene.add(hero);
    const gk=mkFig(0xf2c11c,0x1a1a1a);gk.position.set(0,0,-11.6);gk.rotation.y=0;scene.add(gk);
    /* [7.32.1 collaudo PO «il portiere all'inizio era un burattino: MAI DEVE COMPARIRE»] pattern kickoff-hold:
       i procedurali nascono INVISIBILI e restano tali finché il CH38 non aggancia; compaiono SOLO come ultima
       risorsa dopo 5.5s senza GLB (mai scena vuota, mai burattini nell'uso normale — il prefetch li batte). */
    hero.visible=false;gk.visible=false;
    const _fbT=setTimeout(()=>{if(!glbOk){hero.visible=true;gk.visible=true;}},5500);
    /* [7.32.1 collaudo PO] pallone più PICCOLO e MODERNO: texture canvas a pannelli scuri su bianco */
    const ballCv=document.createElement('canvas');ballCv.width=128;ballCv.height=64;const bg2=ballCv.getContext('2d');
    bg2.fillStyle="#fafafa";bg2.fillRect(0,0,128,64);
    bg2.fillStyle="#15181e";[[16,14],[52,30],[92,12],[112,42],[30,46],[72,52]].forEach(([x,y])=>{bg2.beginPath();bg2.ellipse(x,y,9,7,0.4,0,Math.PI*2);bg2.fill();});
    bg2.strokeStyle="rgba(20,24,30,0.25)";bg2.lineWidth=2;bg2.beginPath();bg2.moveTo(0,20);bg2.bezierCurveTo(40,34,88,6,128,22);bg2.stroke();bg2.beginPath();bg2.moveTo(0,46);bg2.bezierCurveTo(48,36,80,58,128,44);bg2.stroke();
    const ballTex=new THREE.CanvasTexture(ballCv);
    const ball=new THREE.Mesh(new THREE.SphereGeometry(0.12,18,16),new THREE.MeshStandardMaterial({map:ballTex,roughness:0.42}));scene.add(ball);
    // [7.32.0 collaudo PO «per il video non i burattini ma la grafica CH38!»] aggancio dei modelli VERI
    //   (footballer.glb + clip per NOME sul rig mixamorig, riusa loadGLB/_glbCache del prefetch al boot):
    //   i procedurali restano come FALLBACK finché il GLB non arriva (mai scena vuota) e guidano posizione/
    //   rotazione (pattern _glbDriven del match); i gesti sono clip vere (jog · kick al tiro · tuffo GK).
    let disposed=false,glbOk=false,heroAv=null,gkAv=null,heroActs=null,gkActs=null;const mixers=[];const stG={kicked:false,kickBack:false,dived:false};
    const _numTex=(hex)=>{/* [7.32.7 collaudo PO «metti il numero 9 alla maglia dell'eroe!»] canvas granata
        col 9 bianco ripetuto su 3 colonne: il busto CH38 copre ~5/16 della U (verifica UV 7.8.2) → il
        pannello posteriore ne cattura uno pulito qualunque sia la sua finestra U */
      const cv=document.createElement('canvas');cv.width=768;cv.height=512;const c2=cv.getContext('2d');
      if(window.__CPM_UVDBG){const cols=["#e11","#1a1","#11e","#ee1","#e1e","#1ee","#fff","#f80"];
        for(let i=0;i<8;i++){c2.fillStyle=cols[i];c2.fillRect(i*96,0,96,512);c2.fillStyle="#000";c2.font="900 60px Arial";c2.textAlign="center";
          for(let r=0;r<4;r++)c2.fillText(String(r),i*96+48,80+r*120);}}
      else{c2.fillStyle=hex;c2.fillRect(0,0,768,512);/* dorso CH38 = colonna U [384,480], riga V ~380-460
          (verifica UV empirica __CPM_UVDBG: glyph a (432,440) esce in alto-centro schiena, dritto) */
        c2.fillStyle="#f5f0e6";c2.font="900 150px Arial";c2.textAlign="center";
        c2.fillText("9",432,470);}
      const t=new THREE.CanvasTexture(cv);t.flipY=false;return t;};
    const _tintKit=(root,shirt,shorts,skin,withNum)=>{root.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=false;const n=(o.name||"").toLowerCase();
      const setC=(hex,dropMap)=>{o.material=o.material.clone();if(dropMap&&o.material.map)o.material.map=null;o.material.color=new THREE.Color(hex);if(o.material.emissive)o.material.emissive=new THREE.Color(hex).multiplyScalar(0.12);};
      if(n.indexOf('shirt')>=0){if(withNum){o.material=o.material.clone();o.material.map=_numTex("#8e1f33");o.material.color=new THREE.Color(0xffffff);if(o.material.emissive)o.material.emissive=new THREE.Color(shirt).multiplyScalar(0.10);o.material.needsUpdate=true;}else setC(shirt,true);}else if(n.indexOf('shorts')>=0)setC(shorts,true);else if(n.indexOf('socks')>=0)setC(shirt,true);else if(n.indexOf('shoes')>=0)setC(0x222222,true);
      else if(withNum&&n.indexOf('hair')>=0&&o.material){o.material=o.material.clone();o.material.color=new THREE.Color(0x1c1712);if(o.material.emissive)o.material.emissive.set(0,0,0);}/* [7.37.2 collaudo PO «capelli castani + gatto nero sulla nuca»] i capelli VERI del CH38 tinti di nero (multiply sulla texture, forma bakata corretta) */
      else if(skin&&n.indexOf('body')>=0&&o.material){/* [7.32.2 collaudo PO «l'attaccante non deve essere di pelle scura»] pattern del match (5.69): color+emissive schiariscono la texture */
        o.material=o.material.clone();const sk=new THREE.Color(skin);o.material.color=sk;if('emissive'in o.material)o.material.emissive=sk.clone().multiplyScalar(0.30);}});};
    const _mkAv=(body,shirt,shorts,skin,withNum)=>{try{const av=(THREE.SkeletonUtils&&THREE.SkeletonUtils.clone)?THREE.SkeletonUtils.clone(body.scene):null;if(!av)return null;
      const bb=new THREE.Box3().setFromObject(av);const hh=Math.max(0.1,bb.max.y-bb.min.y);av.scale.setScalar(1.82/hh);
      _tintKit(av,shirt,shorts,skin,withNum);scene.add(av);return av;}catch(_e){return null;}};
    if(typeof loadGLB==="function"&&window.__CPM_GLB!==false){
      Promise.all([loadGLB('./assets/footballer.glb'),loadGLB('./assets/anim-jog.glb').catch(()=>null),loadGLB('./assets/anim-idle.glb').catch(()=>null),loadGLB('./assets/anim-kick.glb').catch(()=>null),loadGLB('./assets/anim-gk-idle.glb').catch(()=>null),loadGLB('./assets/anim-gk-dive.glb').catch(()=>null),loadGLB('./assets/anim-throwin.glb').catch(()=>null)])
        .then(([body,jog,idle,kick,gkIdle,gkDive,lift])=>{
          if(!body||disposed)return;
          heroAv=_mkAv(body,0x8e1f33,0xf2f2f2,0xf0c8a0,true);gkAv=_mkAv(body,0xf2c11c,0x1a1a1a,null);/* eroe pelle chiara + NUMERO 9 sulla maglia (il GK resta com'è) */
          if(!heroAv||!gkAv)return;
          const clip=g=>(g&&g.animations&&g.animations[0])||null;
          const mk=(av,defs)=>{const mx=new THREE.AnimationMixer(av);mixers.push(mx);const acts={};Object.keys(defs).forEach(k=>{if(defs[k])acts[k]=mx.clipAction(defs[k]);});return acts;};
          heroActs=mk(heroAv,{jog:clip(jog),idle:clip(idle),kick:clip(kick),lift:clip(lift)});/* [7.32.6] lift=throwin congelata all'apice → braccia alzate sotto la curva (pattern cerimonia 7.24.1) */
          gkActs=mk(gkAv,{idle:clip(gkIdle)||clip(idle),dive:clip(gkDive)});
          if(heroActs.jog)heroActs.jog.play();else if(heroActs.idle)heroActs.idle.play();
          if(gkActs.idle)gkActs.idle.play();
          if(heroActs.kick){heroActs.kick.setLoop(THREE.LoopOnce);heroActs.kick.clampWhenFinished=true;}
          if(heroActs.lift){heroActs.lift.setLoop(THREE.LoopOnce);heroActs.lift.clampWhenFinished=true;}
          if(gkActs.dive){gkActs.dive.setLoop(THREE.LoopOnce);gkActs.dive.clampWhenFinished=true;}
          try{heroAv.traverse(o=>{if(!o.isBone)return;const n=o.name||"";if(!stG.fL&&/LeftFoot$|LeftToeBase$/i.test(n))stG.fL=o;if(!stG.fR&&/RightFoot$|RightToeBase$/i.test(n))stG.fR=o;if(!stG.hd&&/mixamorig(\d*)Head$/i.test(n))stG.hd=o;});}catch(_e){}
          /* [7.53.4 collaudo PO «i capelli sembrano attaccati con la colla» — FIX DEFINITIVO]
             NESSUNA geometria aggiuntiva: 4 iterazioni di chioma procedurale (7.37.2→7.52.3) hanno
             sempre letto come un casco incollato sopra il cranio (la calotta segue l'osso ma non la
             silhouette bakata del CH38). Nel MATCH i capelli non sono mai stati contestati: sono quelli
             DIPINTI nella texture del corpo, scuriti dalla tinta della mesh Hair in _tintKit (0x1c1712).
             L'intro ora usa la stessa resa del match — zero mesh extra sull'osso Head. */

          hero.visible=false;gk.visible=false;glbOk=true;
          try{if(!window.__CPM_STORE_BUILD)window.__CPM_INTRO_GLB=true;}catch(_e){}
        }).catch(()=>{});
    }
    // coriandoli + fuochi
    const confN=140;const fg=new THREE.BufferGeometry();const fArr=new Float32Array(confN*3);const fVel=new Float32Array(confN);
    for(let i=0;i<confN;i++){fArr[i*3]=-4+((i*73)%160)/20;fArr[i*3+1]=4+((i*37)%120)/20;fArr[i*3+2]=-12+((i*53)%120)/20;fVel[i]=0.5+((i*29)%40)/40;}
    fg.setAttribute('position',new THREE.BufferAttribute(fArr,3));
    const conf=new THREE.Points(fg,new THREE.PointsMaterial({color:0xd4a017,size:0.14,transparent:true,opacity:0}));scene.add(conf);
        /* [7.52.3 collaudo PO «metti i cartelloni con il nome del gioco»] due LED «K⚽RWARD ELITE» ai lati della porta */
    {const bc=document.createElement('canvas');bc.width=1024;bc.height=128;const bx2=bc.getContext('2d');
     bx2.fillStyle='#12060a';bx2.fillRect(0,0,1024,128);bx2.textAlign='center';bx2.textBaseline='middle';
     bx2.fillStyle='#d4a017';bx2.font='900 64px Arial';bx2.fillText('K⚽RWARD',400,62);
     bx2.fillStyle='#d27f8c';bx2.font='italic 800 46px Arial';bx2.fillText('ELITE',780,64);
     bx2.fillStyle='#d4a017';bx2.fillRect(0,0,1024,6);bx2.fillRect(0,122,1024,6);
     const bt2=new THREE.CanvasTexture(bc);bt2.anisotropy=8;
     [[-7.2],[7.2]].forEach(pp=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(6.2,0.85),new THREE.MeshBasicMaterial({map:bt2}));m.position.set(pp[0],0.5,-13.1);scene.add(m);});}
    const camLook=new THREE.Vector3(0,1.4,-4);
    let raf=null;let netKick=0;let shakeIntro=0;
    const tick=()=>{
      const el=(Date.now()-stRef.current.t0)/1000;
      // ---- coreografia eroe/palla [7.32.3 collaudo PO «palla ANCORA dietro · movimenti lenti e poco
      //      fluidi · post-gol troppo lungo»] traiettoria PURA posAt(t): la direzione della palla è la
      //      DERIVATA ESATTA del moto (differenza finita sul path analitico) → davanti ai piedi in OGNI
      //      frame, anche nello slalom; ritmo alzato (sprint d'ingresso, slalom stretto e rapido, stop
      //      corto prima del tiro); esultanza accorciata (~3.6s in meno). ----
      /* [7.32.4 collaudo PO «troppo zig-zag, il pallone si perde: vai DRITTO in porta con una CANNONATA
         dal limite»] corsa RETTILINEA (facing costante ⇒ palla incollata per costruzione), azione −3.4s,
         tiro dal LIMITE dell'area (z=−4.9) a t=11.2 con volo da bomba (0.32s, parabola piatta). */
      const _posAt=(t)=>{/* → [hx,hz,run,armsUp] · [7.32.5 collaudo PO «manovra non fluida»] la corsa è
          UNA SOLA curva a VELOCITÀ CONTINUA (Hermite con derivate raccordate: 1.38 u/s all'ingresso →
          picco ~2.0 → 0.58 al controllo): niente più stop-and-go ai giunti (lo smoothstep aveva derivata
          ZERO ai bordi → l'eroe si fermava a t=3.4 e t=7.4 e ripartiva a scatto). */
        if(t<3.4)return[9-t*0.9,9-t*1.05,0.8,false];
        if(t<8.2){const p=(t-3.4)/4.8,/* [7.52.3 collaudo PO «azione del gol più veloce»] corsa 7.2→4.8s */s=0.83*p+0.99*p*p-0.82*p*p*p,v=0.83+1.98*p-2.46*p*p;
          return[5.94*(1-s),5.43-10.33*s,Math.min(1,0.35+v*0.55),false];}
        if(t<8.8)return[0,-4.9,0.15,false];/* controllo al limite */
        if(t<9.6)return[0,-4.9,0,false];
        /* [7.32.6 collaudo PO «dopo il gol l'eroe deve festeggiare SOTTO LA CURVA a braccia alzate!»]
           sprint attorno al palo destro fino a sotto la curva dietro la porta (5.4,−13.4), poi braccia
           alzate verso i tifosi (facing −z dal fallback) coi saltelli */
        const p=Math.min((t-9.6)/2.4,1),s=p*p*(3-2*p);return[5.4*s,-4.9-8.5*s,p<0.9?1:0,p>0.8];};
      const _dtI=Math.min(0.09,Math.max(0.001,el-(stG.pEl===undefined?el:stG.pEl)));stG.pEl=el;/* [7.32.6] dt reale del frame per gli smoothing (frame-rate-independent) */
      const _pa=_posAt(el);let hx=_pa[0],hz=_pa[1],run=_pa[2];const armsUp=_pa[3];
      hero.position.set(hx,0,hz);
      stG.ph=(stG.ph||0)+_dtI*(9+run*3);const sw=Math.sin(stG.ph)*(run*0.8);/* [7.32.7] fase INTEGRATA: il salto discreto di frequenza a run=0.7 faceva scattare le gambe (fallback proc) */
      if(hero._legL){hero._legL.rotation.x=sw;hero._legR.rotation.x=-sw;}
      if(hero._armL){hero._armL.rotation.x=armsUp?-2.5:-sw*0.8;hero._armR.rotation.x=armsUp?-2.5:sw*0.8;hero._armL.rotation.z=armsUp?-0.3:0;hero._armR.rotation.z=armsUp?0.3:0;}
      /* forward = derivata del path (lookahead 80ms); sotto soglia (fermo/tiro) → verso la porta */
      const _pb=_posAt(el+0.08);let _fwX=_pb[0]-hx,_fwZ=_pb[1]-hz;
      {const _fl=Math.hypot(_fwX,_fwZ);stG.vNow=_fl/0.08;/* [7.37.1] velocità analitica del path (u/s) */if(_fl<0.004){_fwX=(el>=9.6)?0:0-hx;_fwZ=(el>=9.6)?-1:-12-hz;}/* [7.32.6] fermo sotto la curva → rivolto ai TIFOSI (−z) */
       const _f2=Math.hypot(_fwX,_fwZ)||1;_fwX/=_f2;_fwZ/=_f2;}
      /* rotazione SMUSSATA verso la direzione di corsa — dt-corretta ([7.32.6]: il fattore fisso 0.3/frame
         era frame-rate-dependent come il mover della palla: a fps bassi girava LENTO) */
      {const _tr=Math.atan2(_fwX,_fwZ);let _d=_tr-hero.rotation.y;while(_d>Math.PI)_d-=2*Math.PI;while(_d<-Math.PI)_d+=2*Math.PI;hero.rotation.y+=_d*(1-Math.exp(-_dtI*18));}/* [7.37.1] sterzata più reattiva */
      hero.position.y=armsUp?Math.abs(Math.sin(el*1.6))*0.02:0;/* [7.42.0 collaudo PO] braccia alzate FERME sotto la curva: via i saltelli, solo un respiro */
      // palla: al piede (posizionata DOPO l'update dei mixer, vedi blocco più sotto) → tiro a t=11.2 → in rete
      if(el>=8.8&&el<9.14){/* [7.32.5 collaudo PO «tiro più fluido, davvero a mezz'altezza e angolato»] la
          traiettoria parte da DOVE STA la palla (snapshot al primo frame → zero scatto) e fila nell'angolino
          a mezz'altezza (y 1.25) in 0.34s, con un filo d'arco (+0.3 all'apice) che la rende un tiro VERO */
        if(!stG.sb)stG.sb={x:ball.position.x,y:ball.position.y,z:ball.position.z};
        const p=(el-8.8)/0.34;
        ball.position.set(stG.sb.x+(-3.05-stG.sb.x)*p,stG.sb.y+(2.0-stG.sb.y)*p+Math.sin(p*Math.PI)*0.12,stG.sb.z+(-12-stG.sb.z)*p);/* [7.42.1 collaudo PO] ANGOLO ALTO: sale all'incrocio (y 2.0), arco minimo */
        ball.rotation.x-=0.9;
        if(p>0.9&&netKick===0){netKick=el;shakeIntro=0.6;}}
      else if(el>=9.14)ball.position.set(-3.05,Math.max(0.13,ball.position.y-0.045),-12.25);/* scende nella rete dall'incrocio */
      // [7.42.1 collaudo PO «il portiere deve TENTARE di pararlo senza riuscirci»]: tuffo sul LATO GIUSTO,
      //   disteso verso l'incrocio (y sale a ~0.62) ma CORTO — le dita sfiorano, la palla entra sopra la mano.
      if(el<8.8){gk.position.x=Math.sin(el*1.7)*0.5;gk.position.y=0;gk.rotation.z=0;}
      else if(el<9.5){const p=(el-8.8)/0.7;gk.position.x=-p*2.0;gk.position.y=Math.sin(Math.min(p*1.15,1)*Math.PI)*0.62;gk.rotation.z=p*1.3;}
      // CH38: gli avatar seguono i procedurali (invisibili) — traslazione proc, arti dalle clip
      if(glbOk&&heroAv&&gkAv){
        heroAv.position.copy(hero.position);heroAv.rotation.y=hero.rotation.y;
        if(el>=8.8&&!stG.gkMir){stG.gkMir=true;gkAv.scale.x=-gkAv.scale.x;}/* [7.52.1 collaudo PO «si tuffa al contrario»] SPECCHIA il CH38 al tuffo: la clip gk-dive ha un lato fisso e dominava la lettura contro la traslazione (che era già verso la palla) */
        gkAv.position.copy(gk.position);gkAv.rotation.y=gk.rotation.y;/* niente rotation.z: il tuffo lo fanno gli arti della clip */
        if(el>=8.5&&!stG.kicked){stG.kicked=true;if(heroActs.kick){if(heroActs.jog)heroActs.jog.fadeOut(0.24);heroActs.kick.reset().fadeIn(0.2).play();}}/* [7.42.0 collaudo PO «movimenti robotici»] crossfade morbidi */
        if(el>=10.2&&stG.kicked&&!stG.kickBack){stG.kickBack=true;if(heroActs.kick&&heroActs.jog){heroActs.kick.fadeOut(0.32);heroActs.jog.reset().fadeIn(0.32).play();}}
        if(el>=11.75&&!stG.lifted&&heroActs.lift){stG.lifted=true;if(heroActs.jog)heroActs.jog.fadeOut(0.4);heroActs.lift.reset().fadeIn(0.38).play();}/* alzata braccia MORBIDA *//* [7.32.6] arrivo sotto la curva → braccia alzate */
        if(el>=8.75&&!stG.dived&&gkActs.dive){stG.dived=true;if(gkActs.idle)gkActs.idle.fadeOut(0.1);gkActs.dive.reset().fadeIn(0.06).play();}
        if(heroActs.jog)heroActs.jog.timeScale=clamp(0.55+(stG.vNow||1)*0.55,0.6,1.7);/* [7.37.1 collaudo PO «movimenti da migliorare in fluidità»] cadenza del passo dalla VELOCITÀ REALE del path (anti foot-slide) */
        if(heroAv)heroAv.rotation.x=-0.05*Math.min(stG.vNow||0,2.4)*Math.min(1,run*1.4);/* [7.42.0] lean CONTINUO (il gate on/off a run>0.3 scattava = robotico) */
        const _mdt=Math.min(0.12,(Date.now()-(stG.lastT||Date.now()))/1000);stG.lastT=Date.now();/* [7.32.7] cap 0.05→0.12: a fps bassi le clip restavano in SLOW-MO rispetto al corpo (gliding) */
        mixers.forEach(m=>m.update(_mdt));
        if(stG.lifted&&heroActs.lift){const _ap=heroActs.lift.getClip().duration*0.34;if(heroActs.lift.time>=_ap){heroActs.lift.time=_ap;heroActs.lift.paused=true;}}/* congela all'apice (due mani sopra la testa) */
      }
      /* [7.32.5 collaudo PO «la palla continua a perdersela per strada, rimane spesso dietro!»] fix
         STRUTTURALE: la palla non insegue più nulla (il mover con smoothing per-frame era FRAME-RATE
         DEPENDENT: a fps bassi il lag superava il lead → palla dietro). Ora VIVE SUL PATH ANALITICO:
         è dove l'eroe SARÀ tra ~0.2-0.5s (tocco-e-rincorsa sul lookahead) → davanti per COSTRUZIONE,
         zero lag a ogni frame-rate. Clamp «mai dietro/dentro i piedi»: proiezione sulla direzione di
         corsa rispetto ai PIEDI VERI del CH38 (matrixWorld POST-mixer, pattern 7.24.1) o al corpo. */
      if(el<8.8){/* [7.53.3 collaudo PO «il pallone non viene indirizzato in porta»] il gate era rimasto al VECCHIO tiro (11.2): il blocco piede gira DOPO i mixer e SCHIACCIAVA il volo 8.8→9.14 tenendo la palla incollata al piede fin dentro la festa */
        const _lt=0.34+Math.sin(el*3.0)*0.11;/* [7.32.6] tocco più morbido (freq/ampiezza giù) */
        const _pc=_posAt(Math.min(el+_lt,8.6));let bx=_pc[0],bz=_pc[1];
        let fx=hx,fz=hz;
        if(glbOk&&stG.fL&&stG.fR){/* [7.32.7 collaudo PO «va avanti e torna indietro in loop»] i piedi CRUDI
            oscillano con la FALCATA (~2Hz) e il clamp li trasmetteva alla palla → base = piedi SMUSSATI
            (EMA dt-corretta, τ≈0.35s: assorbe l'offset statico del rig, filtra la falcata) */
          const _v1=stG._v1||(stG._v1=new THREE.Vector3()),_v2=stG._v2||(stG._v2=new THREE.Vector3());
          _v1.setFromMatrixPosition(stG.fL.matrixWorld);_v2.setFromMatrixPosition(stG.fR.matrixWorld);
          const _rfx=(_v1.x+_v2.x)/2,_rfz=(_v1.z+_v2.z)/2,_ka=1-Math.exp(-_dtI*6.5);/* [7.37.0 collaudo PO «palla dietro»] τ 0.35→0.15: l'EMA lenta arretrava la base del clamp di ~0.6u in corsa */
          if(stG.sfx===undefined){stG.sfx=_rfx;stG.sfz=_rfz;}
          stG.sfx+=(_rfx-stG.sfx)*_ka;stG.sfz+=(_rfz-stG.sfz)*_ka;
          fx=stG.sfx;fz=stG.sfz;}
        const _bfx=Math.sin(hero.rotation.y),_bfz=Math.cos(hero.rotation.y);
        const _pj=(bx-fx)*_bfx+(bz-fz)*_bfz;
        if(_pj<1.05){bx+=_bfx*(1.05-_pj);bz+=_bfz*(1.05-_pj);}/* [7.42.1 collaudo PO «rimane indietro a volte»] lead minimo 0.82→1.05 *//* [7.37.0] lead minimo 0.82: palla SEMPRE chiaramente davanti */
        ball.position.x=bx;ball.position.z=bz;
        ball.position.y=0.12+Math.abs(Math.sin(el*7))*0.025*run;
        ball.rotation.x-=run*_dtI*20;ball.rotation.y+=run*_dtI*3;/* [7.32.6] rotolamento dt-scalato */
      }
      // rete: gonfiata al gol
      if(netKick>0){const nu=Math.min((el-netKick)/0.7,1);net.position.z=-12.55-Math.sin(Math.min(nu,0.5)*Math.PI)*0.5*Math.exp(-nu*2);}
      // folla: pulse (forte dopo il gol)
      const amp=el>9.6&&el<15.9?0.30:0.10;/* [7.32.6] la curva salta con l'eroe sotto */
      const pos=cg.attributes.position.array;
      for(let i=0;i<crowdN;i++)pos[i*3+1]=cBase[i]+Math.abs(Math.sin(el*5+i*0.7))*amp;
      cg.attributes.position.needsUpdate=true;
      {const pos2=cg2.attributes.position.array;for(let i=0;i<crowd2N;i++)pos2[i*3+1]=c2Arr[i*3+1]+Math.abs(Math.sin(el*5+i*1.3))*amp*1.15;cg2.attributes.position.needsUpdate=true;}
      scarves.forEach((sc,i)=>{sc.position.y=4.6+((i*37)%3)*0.7+Math.sin(el*4.5+i)*0.3*(amp>0.2?1.6:1);sc.rotation.z=Math.sin(el*4+i*0.9)*0.14;});
      flags.forEach((f,i)=>{if(f._cloth){f._cloth.rotation.y=Math.sin(el*2.4+i*1.4)*0.55;f._cloth.position.x=0.78+Math.sin(el*2.4+i*1.4)*0.06;}});
      // coriandoli dal gol
      if(el>9.6&&el<14.6){conf.material.opacity=Math.min(1,(el-12.2)*2)*(el>12.4?Math.max(0,1-(el-15.0)/2.2):1);
        const fp=fg.attributes.position.array;
        for(let i=0;i<confN;i++){fp[i*3+1]-=fVel[i]*0.045;if(fp[i*3+1]<0.2)fp[i*3+1]=5.5;}
        fg.attributes.position.needsUpdate=true;}
      // ---- camera per beat ----
      let cx,cy,cz,lx=0,ly=1.4,lz=-6;
      if(el<4){const o=el*0.22;cx=Math.sin(o)*26;cy=13-el*0.7;cz=Math.cos(o)*26;lx=0;ly=1;lz=0;}
      else if(el<6.1){cx=hx+6.5;cy=3.4;cz=hz+7.5;lx=hx;ly=1.3;lz=hz-2;}
      else if(el<8.8){cx=hx+4.4;cy=2.5;cz=hz+5.6;lx=hx;ly=1.25;lz=hz-3;}
      else if(el<11.4){cx=4.6;cy=1.9;cz=-6.2;lx=-2.4;ly=1.7;lz=-12;}/* [7.53.3] CAMERA-GOL: il ramo era MORTO (else if 11.0 DOPO 11.2) → il tiro/rete non si vedeva mai; ora copre volo+rete+inizio sprint attorno al palo */
      else{/* [7.32.7 collaudo PO «l'eroe non rimane a festeggiare sotto la curva»] la camera NON se ne va
          più sull'orbita larga (il volo di ritorno attraverso lo stadio leggeva come «la scena torna
          indietro»): resta SOTTO LA CURVA con l'eroe fino alla CTA — leggero dolly laterale + push-in */
        const o=Math.sin((el-11.4)*0.33)*1.9,pu=Math.min(1,Math.max(0,(el-12.6)/4));/* [7.53.3] ancore festa ritimate sull'arrivo sotto la curva (9.6+2.4=12.0) */
        cx=hero.position.x+3.4+o;cy=3.3-pu*0.5;cz=hero.position.z+6.4-pu*1.2;lx=hero.position.x;ly=3.1-pu*0.7;lz=hero.position.z-5;}
      if(shakeIntro>0.01){cx+=Math.sin(el*70)*shakeIntro*0.5;cy+=Math.cos(el*60)*shakeIntro*0.3;shakeIntro*=0.86;}/* colpo di cannone → micro-shake */
      {const _ck=1-Math.exp(-_dtI*5.2),_lk=1-Math.exp(-_dtI*6.8);/* [7.32.7] smoothing camera DT-CORRETTO (il fattore fisso per-frame era frame-rate-dependent → rubber-banding a fps bassi) */
       cam.position.x+=(cx-cam.position.x)*_ck;cam.position.y+=(cy-cam.position.y)*_ck;cam.position.z+=(cz-cam.position.z)*_ck;
       camLook.x+=(lx-camLook.x)*_lk;camLook.y+=(ly-camLook.y)*_lk;camLook.z+=(lz-camLook.z)*_lk;}
      cam.lookAt(camLook);
      {const _w=W(),_h=H();if(stG._vw!==_w||stG._vh!==_h){stG._vw=_w;stG._vh=_h;cam.aspect=_w/_h;cam.updateProjectionMatrix();renderer.setSize(_w,_h);}}/* [7.37.0 collaudo PO «va ancora a scatti»] setSize SOLO su resize: ogni frame riallocava il buffer di disegno */
      renderer.render(scene,cam);
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>{try{disposed=true;clearTimeout(_fbT);if(raf)cancelAnimationFrame(raf);scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.map)m.map.dispose();m.dispose();});}});renderer.dispose();if(renderer.domElement&&renderer.domElement.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);}catch(_e){}};
  },[]);// eslint-disable-line
  const cap=CAPS[beat]||CAPS[0];
  return(
    <div style={{position:"fixed",inset:0,zIndex:70,background:"#050810",overflow:"hidden",fontFamily:"inherit"}}>
      <div ref={ref} style={{position:"absolute",inset:0}}/>
      {flash&&<div style={{position:"absolute",inset:0,background:"#fff",opacity:0.4,pointerEvents:"none"}}/>}
      <div style={{position:"absolute",left:0,right:0,top:"9%",textAlign:"center",pointerEvents:"none",padding:"0 20px"}}>
        {cap.big&&(cap.big==="KORWARD ELITE"
          ?<div key={"b"+beat} style={{display:"flex",justifyContent:"center",animation:"celebTitle .7s ease-out both",filter:"drop-shadow(0 3px 16px rgba(0,0,0,0.85)) drop-shadow(0 0 22px rgba(163,38,58,0.5))"}}><Wordmark size={44}/></div>/* [7.32.1 collaudo PO «la scritta deve essere uguale a quella del logo»] */
          :<div key={"b"+beat} style={{fontSize:cap.big.length>14?24:38,fontWeight:900,color:"#fff",letterSpacing:cap.big.length>14?1:4,textShadow:"0 3px 18px rgba(0,0,0,0.8)",animation:"celebTitle .7s ease-out both"}}>{cap.big}</div>)}
        {cap.sub&&<div key={"s"+beat} style={{fontSize:15,color:"#ffd9a0",fontWeight:700,marginTop:8,textShadow:"0 2px 12px rgba(0,0,0,0.85)",animation:"celebTitle .8s ease-out .15s both"}}>{cap.sub}</div>}
        {cap.chips&&<div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"center",marginTop:14}}>
          {cap.chips.map((c,i)=>(<div key={i} style={{padding:"8px 18px",borderRadius:22,background:"rgba(8,12,24,0.72)",border:"1px solid rgba(255,217,160,0.45)",color:"#fff",fontSize:14,fontWeight:800,animation:`celebTitle .5s ease-out ${0.3+i*0.55}s both`}}>{c}</div>))}
        </div>}
      </div>
      {cap.cta&&<div style={{position:"absolute",left:0,right:0,bottom:"12%",display:"flex",justifyContent:"center",animation:"celebTitle .7s ease-out both"}}>
        <button onClick={onDone} style={{padding:"15px 34px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#b91c1c,#7f1d1d)",color:"#fff",fontSize:17,fontWeight:900,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 30px rgba(185,28,28,0.45)"}}>🎬 Comincia dal provino →</button>
      </div>}
      <button onClick={onDone} style={{position:"absolute",top:14,right:14,padding:"8px 15px",borderRadius:20,border:"1px solid rgba(255,255,255,0.3)",background:"rgba(0,0,0,0.4)",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Salta ⏩</button>
    </div>
  );
}
/* [7.92.0 collaudo PO «crea sezione/Tab/menu dedicato per le impostazioni: audio/effetti/musica/vibrazione/tema
   chiaro-scuro ecc.»] MENU IMPOSTAZIONI dedicato (overlay full-screen): 🎨 GRAFICA (tema chiaro/scuro + modelli
   3D realistici) + 🎧 AUDIO completo (riusa AudioSettings: volumi per categoria, musica, effetti, pubblico,
   arbitro, muto totale, VIBRAZIONE, debug). Un unico posto per tutte le preferenze. */
function SettingsScreen({darkMode,onTheme,onClose,onExitToMenu}){
  const Seg=({active,label,onClick})=>(
    <button onClick={onClick} className="cpm-press" style={{flex:1,padding:'10px 6px',borderRadius:RAD.md,border:`1.5px solid ${active?TH.primary:TH.cardBorder}`,background:active?(TH.primaryTint||TH.track):'transparent',color:active?TH.primary:TH.text,cursor:'pointer',fontFamily:'inherit',fontSize:12.5,fontWeight:active?FW.bold:FW.regular}}>{label}</button>
  );
  return(
    <div style={{position:'fixed',inset:0,zIndex:9998,background:TH.bg,display:'flex',flexDirection:'column'}}>
      <div style={{flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderBottom:`1px solid ${TH.divider||TH.cardBorder}`,background:TH.card}}>
        <div style={{fontSize:16,fontWeight:FW.black,color:TH.text}}>⚙️ Impostazioni</div>
        <button onClick={onClose} className="cpm-press" style={{width:34,height:34,borderRadius:'50%',border:`1px solid ${TH.cardBorder}`,background:'transparent',color:TH.text,cursor:'pointer',fontFamily:'inherit',fontSize:15}}>✕</button>
      </div>
      <div style={{flex:1,minHeight:0,overflowY:'auto',WebkitOverflowScrolling:'touch',padding:'14px 16px',display:'flex',flexDirection:'column',gap:14}}>
        <Card style={{padding:'12px 14px'}}>
          <div style={{fontSize:11,color:TH.muted,textTransform:'uppercase',letterSpacing:1.2,fontWeight:700,marginBottom:10}}>🎨 Grafica</div>
          <div style={{fontSize:12,color:TH.text,fontWeight:600,marginBottom:6}}>Tema</div>
          <div style={{display:'flex',gap:8}}>
            <Seg active={!darkMode} label="☀️ Chiaro" onClick={()=>onTheme(false)}/>
            <Seg active={darkMode} label="🌙 Scuro" onClick={()=>onTheme(true)}/>
          </div>
          {/* [7.97.0 collaudo PO «togli ovunque l'opzione Giocatori 3D realistici: non è più un'opzione, è solo 3D»]
              toggle GLB rimosso — il 3D reale è sempre attivo (il fallback resta solo come rete di sicurezza interna). */}
        </Card>
        <AudioSettings/>
        {onExitToMenu&&(
          <Card style={{padding:'12px 14px'}}>
            <div style={{fontSize:11,color:TH.muted,textTransform:'uppercase',letterSpacing:1.2,fontWeight:700,marginBottom:8}}>🚪 Sessione</div>
            <div style={{fontSize:11,color:TH.muted,lineHeight:1.5,marginBottom:10}}>Il gioco riprende automaticamente da qui alla riapertura. Torna al menu solo se vuoi cambiare slot o iniziare una nuova carriera — i progressi restano salvati.</div>
            <Btn v="ghost" fw onClick={()=>{onClose&&onClose();onExitToMenu();}} style={{padding:'12px',fontSize:13}}>🏠 Torna al Menu Principale</Btn>
          </Card>
        )}{/* [7.149.0] uscita al menu (azzera l'auto-ripresa); presente SOLO durante la carriera, non nelle schermate pre-carriera */}
        <div style={{fontSize:10,color:TH.faint,textAlign:'center',padding:'2px 0 8px'}}>Le impostazioni si salvano automaticamente.</div>
      </div>
    </div>
  );
}
/* [7.62.0 AUDIO] Schermata IMPOSTAZIONI AUDIO — categorie INDIPENDENTI (ON/OFF + volume), mute totale,
   preview al cambio, persistenza automatica (safeLS via AudioMgr). + pannello DEBUG audio (catalogo suonabile). */
function AudioSettings(){
  const[cfg,setCfg]=useState(()=>{try{return AudioMgr.getCfg();}catch(_e){return null;}});
  const[dbg,setDbg]=useState(false);
  if(!cfg)return null;
  const refresh=()=>{try{setCfg(AudioMgr.getCfg());}catch(_e){}};
  // [7.97.0 collaudo PO «volume generale ridondante col device»] slider MASTER rimosso: restano solo le categorie.
  const VOL=[{k:'music',label:'🎵 Musica menu'},{k:'match',label:'🏟️ Audio partite'},{k:'sfx',label:'✨ Effetti sonori'},{k:'crowd',label:'📣 Pubblico'},{k:'referee',label:'🟨 Arbitro'}];
  const TOG=[{k:'tel',label:'🎙️ Telecronaca',note:'in arrivo',dis:true},{k:'vibr',label:'📳 Vibrazione (mobile)'}];
  const Toggle=({on,onClick,dis})=>(
    <button onClick={dis?undefined:onClick} disabled={dis} style={{width:42,height:24,borderRadius:12,border:'none',cursor:dis?'default':'pointer',background:on?TH.success:TH.cardBorder,position:'relative',transition:'background .2s',flexShrink:0}}>
      <span style={{position:'absolute',top:2,left:on?20:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.3)'}}/>
    </button>
  );
  return(
    <Card style={{padding:'12px 14px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{fontSize:11,color:TH.muted,textTransform:'uppercase',letterSpacing:1.2,fontWeight:700}}>🎧 Audio</div>
        <button onClick={()=>{try{const m=AudioMgr.toggleMute();refresh();if(!m)AudioMgr.preview('sfx');}catch(_e){}}} style={{padding:'5px 12px',borderRadius:9,border:`1px solid ${TH.cardBorder}`,background:cfg.mute?TH.danger:'transparent',color:cfg.mute?'#fff':TH.text,cursor:'pointer',fontFamily:'inherit',fontSize:11,fontWeight:700}}>{cfg.mute?'🔇 Muto ON':'🔇 Muto totale'}</button>
      </div>
      {VOL.map(r=>{
        const vol=Math.round((r.master?cfg.master:cfg.vol[r.k])*100);
        const dim=(!r.master&&!cfg.on[r.k])||cfg.mute;
        return(
          <div key={r.k} style={{marginBottom:9,opacity:dim?0.5:1}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:12,color:TH.text,fontWeight:600}}>{r.label}</span>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span className="cpm-num" style={{fontSize:10,color:TH.faint,minWidth:30,textAlign:'right'}}>{vol}%</span>
                {!r.master&&<Toggle on={cfg.on[r.k]} onClick={()=>{const was=cfg.on[r.k];try{AudioMgr.setOn(r.k,!was);refresh();if(!was)AudioMgr.preview(r.k);}catch(_e){}}}/>}
              </div>
            </div>
            {/* [7.96.1 collaudo PO «volume generale cosa guida?»] è il MASTER: scala TUTTI i suoni insieme (le voci qui sotto sono relative a questo). */}
            {r.master&&<div style={{fontSize:9.5,color:TH.faint,marginTop:-2,marginBottom:4,lineHeight:1.35}}>Regola tutti i suoni insieme — musica, partite, effetti, pubblico, arbitro (le voci sotto sono relative a questo).</div>}
            <input type="range" min="0" max="100" value={vol} onChange={e=>{const v=(+e.target.value)/100;try{if(r.master)AudioMgr.setMaster(v);else AudioMgr.setVol(r.k,v);refresh();}catch(_x){}}} onMouseUp={()=>{try{AudioMgr.preview(r.master?'sfx':r.k);}catch(_x){}}} onTouchEnd={()=>{try{AudioMgr.preview(r.master?'sfx':r.k);}catch(_x){}}} style={{width:'100%',accentColor:TH.primary,cursor:'pointer'}}/>
          </div>
        );
      })}
      <div style={{borderTop:`1px dashed ${TH.cardBorder}`,marginTop:6,paddingTop:8}}>
        {TOG.map(r=>(
          <div key={r.k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,opacity:r.dis?0.55:1}}>
            <span style={{fontSize:12,color:TH.text,fontWeight:600}}>{r.label}{r.note&&<span style={{fontSize:9,color:TH.faint,marginLeft:6}}>({r.note})</span>}</span>
            <Toggle on={cfg.on[r.k]} dis={r.dis} onClick={()=>{const was=cfg.on[r.k];try{AudioMgr.setOn(r.k,!was);refresh();if(r.k==='vibr'&&!was)AudioMgr.vibrate(40);}catch(_e){}}}/>
          </div>
        ))}
      </div>
      <div style={{fontSize:9,color:TH.faint,marginTop:2,lineHeight:1.4}}>Audio sintetizzato in tempo reale (nessun download, funziona offline). Le impostazioni si salvano da sole.</div>
      <button onClick={()=>setDbg(d=>!d)} style={{marginTop:8,padding:'5px 10px',borderRadius:8,border:`1px solid ${TH.cardBorder}`,background:'transparent',color:TH.faint,cursor:'pointer',fontFamily:'inherit',fontSize:10}}>🐞 Debug audio {dbg?'▲':'▼'}</button>
      {dbg&&(()=>{let D;try{D=AudioMgr.debug();}catch(_e){D=null;}if(!D)return null;return(
        <div style={{marginTop:8,padding:8,background:TH.surface2||'rgba(0,0,0,.05)',borderRadius:8,fontSize:10}}>
          <div style={{color:TH.muted,marginBottom:6,lineHeight:1.5}}>ctx: <b>{D.ctx}</b> · scena: <b>{D.scene||'—'}</b> · folla: <b>{D.bed?'ON':'off'}</b> · sfx suonati: <b>{D.played}</b> · voci in catalogo: <b>{D.catalog.length}</b>{D.silent?' · (muto sotto test)':''}</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:4,maxHeight:150,overflowY:'auto'}}>
            {D.catalog.map(n=><button key={n} onClick={()=>{try{AudioMgr.unlock();AudioMgr.play(n);setDbg(d=>d);}catch(_e){}}} style={{fontSize:9,padding:'3px 6px',borderRadius:6,border:`1px solid ${TH.cardBorder}`,background:'transparent',color:TH.faint,cursor:'pointer',fontFamily:'inherit'}}>{n}</button>)}
          </div>
        </div>);})()}
    </Card>
  );
}
/* [7.134.0 collaudo PO «il pulsante opzioni/impostazioni nella home deve essere UGUALE e nella STESSA POSIZIONE»]
   nelle schermate pre-carriera (home/provini) non c'è la nav bar col tasto Opzioni → il bottone fisso ora RISPECCHIA
   la cella «⚙️ Opzioni» della nav bar della carriera (stessa icona + label + colori TH), ancorato in basso a DESTRA
   (dove «Opzioni» vive nella nav): stessa identità visiva, stessa posizione. Apre il SettingsScreen completo. */
function SettingsQuickBtn({onOpen}){
  return(
    <button onClick={()=>{try{AudioMgr.unlock();}catch(_e){}if(onOpen)onOpen();}}
      title="Impostazioni"
      style={{position:"fixed",bottom:"calc(env(safe-area-inset-bottom,0px) + 44px)",right:12,zIndex:99999,padding:"8px 14px 6px",minWidth:60,borderRadius:14,border:`1px solid ${TH.cardBorder}`,background:TH.card,color:TH.faint,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:1,boxShadow:"0 4px 14px rgba(0,0,0,0.12)"}}>
      <div style={{fontSize:17}}>⚙️</div>
      <div style={{fontSize:10,marginTop:1,letterSpacing:.3,fontWeight:FW.bold}}>Opzioni</div>
    </button>
  );
}
/* [7.134.0 collaudo PO «questa navbar la riproporrei anche in home page (avvia carriera), ovviamente con pulsanti
   diversi (rivedi intro, ecc)»] barra di navigazione della HOME — STESSE classi/stile della nav bar della carriera
   (.cpm-nav-bar/.cpm-nav-tabs, bottom su mobile, sidebar su desktop) con azioni proprie della home: Home (attiva) ·
   Intro (rivedi) · Importa (salvataggio .json) · Opzioni (impostazioni). Sostituisce il FAB e i bottoni sparsi. */
function HomeNavBar({onImport,onSettings}){
  const fileRef=React.useRef(null);
  const cellStyle=(border)=>({flex:"1 1 0",minWidth:52,padding:"10px 6px 6px",border:"none",borderLeft:border?`1px solid ${TH.cardBorder}`:"none",background:"transparent",cursor:"pointer",fontFamily:"inherit",color:TH.faint,borderTop:"2px solid transparent",transition:"all .15s"});
  return(
    <div className="cpm-nav-bar" style={{zIndex:100}}>
      <div className="cpm-nav-tabs" style={{background:TH.navBg,borderTop:"1px solid "+TH.cardBorder}}>
        <button title="Home" className="cpm-tab-act" style={{...cellStyle(false),color:TH.primary,borderTop:`2px solid ${TH.primary}`,cursor:"default"}}><div style={{fontSize:17}}>🏠</div><div style={{fontSize:10,marginTop:1,letterSpacing:.3}}>Home</div></button>
        <button title="Rivedi l'intro" onClick={()=>{try{AudioMgr.unlock();}catch(_e){}try{window.dispatchEvent(new CustomEvent('cpm-replay-intro'));}catch(_e){}}} style={cellStyle(false)}><div style={{fontSize:17}}>🎬</div><div style={{fontSize:10,marginTop:1,letterSpacing:.3}}>Intro</div></button>
        <button title="Importa salvataggio (.json)" onClick={()=>{try{fileRef.current&&fileRef.current.click();}catch(_e){}}} style={cellStyle(false)}><div style={{fontSize:17}}>📂</div><div style={{fontSize:10,marginTop:1,letterSpacing:.3}}>Importa</div></button>
        <button title="Impostazioni" onClick={()=>{try{AudioMgr.unlock();}catch(_e){}if(onSettings)onSettings();}} style={cellStyle(true)}><div style={{fontSize:17}}>⚙️</div><div style={{fontSize:10,marginTop:1,letterSpacing:.3}}>Opzioni</div></button>
      </div>
      <input ref={fileRef} type="file" accept=".json" style={{display:"none"}} onChange={e=>{if(e.target.files[0]&&onImport)onImport(e.target.files[0]);e.target.value="";}}/>
    </div>
  );
}
function App(){
  const[phase,setPhase]=useState("loading");
  // [7.32.0 collaudo PO «il video deve essere anche RIVEDIBILE»] replay on-demand da qualunque schermata:
  //   i bottoni «Rivedi l'intro» (Home + Profilo) emettono l'evento 'cpm-replay-intro' → overlay sopra la fase corrente.
  const[showIntro,setShowIntro]=useState(false);
  useEffect(()=>{const h=()=>setShowIntro(true);window.addEventListener('cpm-replay-intro',h);return()=>window.removeEventListener('cpm-replay-intro',h);},[]);
  // [7.104.0 collaudo PO «elimina il pulsante muto e metti il tasto impostazioni come nelle altre schermate»]
  //   SettingsScreen raggiungibile anche dalle schermate PRE-carriera (home/provini), dove non c'è la nav bar.
  const[showSettings,setShowSettings]=useState(false);
  const[dark,setDark]=useState(()=>{try{return safeLS.get("cpm-dark")==="1";}catch(_e){return false;}});
  Object.assign(TH,dark?TH_DARK:TH_LIGHT_ORIG);// tema applicato anche fuori dalla carriera
  useEffect(()=>{try{setDark(safeLS.get("cpm-dark")==="1");}catch(_e){}},[phase]);// re-sync col tema scelto in carriera al ritorno in home
  /* [7.179.0 collaudo PO «il font doveva essere ingrandito in TUTTE le schermate!»] ZOOM tipografico +12% BASE su
     ogni schermata (home, creazione, provini, prepartita, carriera): retry rAF perché al primo commit .cpm-scroll
     può non essere ancora nel DOM. LiveMatch lo azzera SOLO nelle fasi col canvas 3D vivo (pixel-perfect). */
  useEffect(()=>{let _zr=0,_zt=0;const _za=()=>{const el=document.querySelector('.cpm-scroll');if(el){if(!el.style.zoom)el.style.zoom="1.12";}else if(_zt++<90){_zr=requestAnimationFrame(_za);}};_za();return()=>{if(_zr)cancelAnimationFrame(_zr);};},[phase]);
  // [7.62.0 AUDIO] gesture-unlock dell'AudioContext (autoplay policy) + click UI DELEGATO (un solo listener copre TUTTI i bottoni, non invasivo)
  useEffect(()=>{const clickH=(ev)=>{try{AudioMgr.unlock();const t=ev.target;if(t&&t.closest&&t.closest('button,[role="button"],a[href],.cpm-clickable,label'))AudioMgr.play('ui.click');}catch(_a){}};document.addEventListener('pointerdown',clickH,true);return()=>document.removeEventListener('pointerdown',clickH,true);},[]);
  // [7.62.0 AUDIO] musica di alto livello per schermata (un solo useEffect sul phase globale → crossfade menu↔partita)
  useEffect(()=>{try{AudioMgr.scene(phase);}catch(_a){}},[phase]);
  const[player,setPlayer]=useState(null);
  const[trials,setTrials]=useState([]);
  const trialResumeRef=React.useRef(null);/* [7.330.0] dati di ripresa provini letti al boot da cpm-trial-prog */
  const[slots,setSlots]=useState([null,null,null]);
  const[currentSlot,setCurrentSlot]=useState(0);
  const[appMsg,setAppMsg]=useState(null);
  const[lang,setLang]=useState(()=>safeLS.get("cpm-lang")||"IT");
  const[legacyBonus,setLegacyBonus]=useState(null);
  const toggleLang=()=>{const nl=lang==="IT"?"EN":"IT";setLang(nl);safeLS.set("cpm-lang",nl);const msg=nl==="EN"?"Language: English 🇬🇧":"Lingua: Italiano 🇮🇹";setAppMsg({msg,color:"#2563eb"});setTimeout(()=>setAppMsg(null),2200);};

  const appNotify=(msg,color=TH.danger)=>{setAppMsg({msg,color});setTimeout(()=>setAppMsg(null),3500);};

  const refreshSlots=()=>storage.listSlots().then(s=>setSlots(s)).catch(()=>setSlots([]));/* [6.44.0 RC-crit] un listSlots che rigetta (storage disabilitato) non deve bloccare il boot */
  useEffect(()=>{
    // [7.149.0 collaudo PO «se metto in background l'app il gioco NON deve riavviarsi, deve riprendere dallo stesso punto»]
    //   AUTO-RIPRESA: se una carriera era attiva (puntatore cpm-active) e lo slot ha un save valido, si rientra DRITTO
    //   in carriera invece di ripartire dalla home → dopo un reload della WebView (background su mobile) si riprende
    //   dov'eri (stesso slot + stesso tab, vedi CareerApp). L'uscita al menu è nel ⚙️ Opzioni della carriera (azzera il
    //   puntatore). Disattivata sotto ?cpmtest=1 (harness/gate guidano la propria navigazione).
    const _test=(typeof window!=="undefined"&&/[?&]cpmtest=1\b/.test(window.location.search||""));
    /* [7.300.1 collaudo PO «non mi porta all'azione, si apre direttamente la carriera»] Il link diretto va letto
       PRIMA di ogni altra cosa: l'avevo messo dopo l'auto-ripresa, che con una carriera attiva fa `return` e non
       ci arrivava mai — cioe' funzionava solo su un dispositivo senza partita in corso, che e' l'unico caso in
       cui non serve. (E il mio test girava senza salvataggio: per questo non l'ha visto.) */
    const _rvJump=(function(){try{const m=/[?&]review=([0-9]+)\.([0-9]+)\.([01])/.exec((typeof window!=="undefined"&&window.location&&window.location.search)||"");
      return (m&&!window.__CPM_STORE_BUILD)?{gi:+m[1],ai:+m[2],ok:m[3]==="1"}:null;}catch(_e){return null;}})();
    if(_rvJump){try{window.__CPM_REVIEW_JUMP=_rvJump;}catch(_e){}setPhase("review");refreshSlots().catch(()=>{});return;}
    refreshSlots().catch(()=>{}).then(async()=>{
      if(!_test){
        let slot=null;try{const a=safeLS.get("cpm-active");if(a!=null&&a!=="")slot=parseInt(a,10);}catch(_e){}
        if(slot!=null&&slot>=0&&slot<=2){
          try{const d=await storage.load(slot);if(d&&d.player){setPlayer(d.player);setCurrentSlot(slot);setPhase("career");return;}}catch(_e){}
        }
      }
      if(!_test){/* [7.330.0 collaudo PO «se non termino i provini non viene salvata la carriera»] AUTO-RIPRESA dei
         PROVINI (pattern 7.149 della carriera): la fase pre-carriera ora PERSISTE (cpm-trial-prog, scritta alla
         creazione e a ogni provino concluso) → chiudere/uccidere l'app a metà provini non butta più nome, avatar
         e risultati. La ripresa in carriera (cpm-active) ha la precedenza; l'envelope si azzera quando la carriera
         viene davvero salvata (onChoose) o quando si crea un nuovo giocatore. */
        try{const _tp=safeLS.get("cpm-trial-prog");if(_tp){const env=JSON.parse(_tp);
          /* [7.332.0 BUG GRAVE collaudo PO «mi ha sovrascritto una carriera»] la ripresa RESTAURA lo slot scelto
             alla creazione: senza, currentSlot restava 0 e la firma del contratto salvava la nuova carriera SOPRA
             quella dello slot 0. Envelope stantio senza slot (7.330/7.331 sul device) → primo slot VUOTO, e se
             sono tutti occupati NON si riprende (meglio ripartire dalla Home che distruggere un salvataggio). */
          let _rSlot=null;
          if(env&&(env.ph==="trial"||env.ph==="offers")){
            if(Number.isInteger(env.slot)&&env.slot>=0&&env.slot<=2)_rSlot=env.slot;
            else{try{const _sl2=await storage.listSlots();const _emp=(_sl2||[]).findIndex(x=>!x);_rSlot=_emp>=0?_emp:null;}catch(_e3){_rSlot=null;}}
          }
          if(env&&env.p&&(env.ph==="offers"||(env.ph==="trial"&&Array.isArray(env.res)&&env.res.length>=3))&&Array.isArray(env.res)&&env.res.length>=3){
            if(_rSlot==null){try{safeLS.set("cpm-trial-prog","");}catch(_e4){}}
            else{setCurrentSlot(_rSlot);setPlayer(env.p);setTrials(env.res.slice(0,3));setPhase("offers");return;}}
          else if(env&&env.p&&env.ph==="trial"){
            if(_rSlot==null){try{safeLS.set("cpm-trial-prog","");}catch(_e4){}}
            else{setCurrentSlot(_rSlot);trialResumeRef.current={res:Array.isArray(env.res)?env.res.slice(0,3):[],opps:env.opps||null};setPlayer(env.p);setPhase("trial");return;}}
        }}catch(_e){}
      }
      setPhase("home");
    });
  },[]);// eslint-disable-line — [6.44.0] la catch garantisce che si raggiunga SEMPRE una fase valida (niente spinner infinito con site-data bloccati)

  const loadSave=async(slot=0)=>{
    const d=await storage.load(slot);
    if(d?.player){
      if((d.saveVersion||0)>SAVE_VERSION)appNotify(`⚠️ Salvataggio creato con una versione più NUOVA del gioco (v${d.saveVersion} > v${SAVE_VERSION}): alcuni dati potrebbero non essere letti correttamente. Aggiorna l'app.`,TH.warning);/* [6.74.0 QA-19] prima un save "futuro" veniva caricato in silenzio */
      setPlayer(d.player);setCurrentSlot(slot);setPhase("career");
      try{safeLS.set("cpm-active",String(slot));}catch(_e){}/* [7.149.0] puntatore per l'auto-ripresa dopo background */
    }
    else appNotify("Salvataggio non valido o corrotto.");
  };
  const startNew=(slot=0)=>{setCurrentSlot(slot);trialResumeRef.current=null;try{safeLS.set("cpm-trial-prog","");}catch(_e){}setPhase("create");};/* [7.330.0] nuova partenza esplicita = i provini in sospeso si abbandonano */
  useEffect(()=>{try{if(typeof window!=="undefined"&&!window.__CPM_STORE_BUILD)window.__CPM_CUR_SLOT=currentSlot;}catch(_e){}},[currentSlot]);/* [7.332.0] diagnostica: lo slot corrente osservabile dal guardiano trial-persist (mai in store build) */
  const deleteSlot=async(slot)=>{await storage.del(slot);await refreshSlots();};
  const importSave=(file)=>{
    const r=new FileReader();
    r.onload=async e=>{
      try{
        const d=JSON.parse(e.target.result);
        // [6.74.0 QA-6] il backup d'emergenza (korward-backup.json, formato {_korwardBackup,slots:{chiave:stringa}})
        // non era reimportabile: l'unico strumento di recupero promesso dal crash-screen falliva con «file non valido».
        if((d?._korwardBackup||d?._elevoraBackup)&&d?.slots){
          const KEYS=["cpm-v3","cpm-v3-s2","cpm-v3-s3"];let rest=0;
          for(let i=0;i<KEYS.length;i++){
            const raw=d.slots[KEYS[i]];if(!raw)continue;
            let sd;try{sd=JSON.parse(raw);}catch{continue;}
            if(!sd?.player?.name)continue;
            if(slots[i]&&!window.confirm(`Lo Slot ${i+1} (${slots[i].name}) verrà sovrascritto dal backup. Continuare?`))continue;
            await storage.save({phase:"career",player:sd.player},i);rest++;
          }
          await refreshSlots();
          if(rest>0)appNotify(`✅ Backup ripristinato: ${rest} slot`,TH.success);else appNotify("Backup vuoto o nessuno slot ripristinato.");
          return;
        }
        if(!d?.player?.name)throw new Error();
        const emptySlot=slots.findIndex(s=>!s);
        const slot=emptySlot>=0?emptySlot:0;
        if(emptySlot<0&&slots[0]&&!window.confirm(`Tutti gli slot sono pieni: lo Slot 1 (${slots[0].name}) verrà sovrascritto. Continuare?`)){appNotify("Import annullato.");return;}/* [6.74.0 QA-6b] prima sovrascriveva lo Slot 1 in silenzio */
        await storage.save({phase:"career",player:d.player},slot);
        await refreshSlots();
        appNotify(`✅ Importato in Slot ${slot+1}`,TH.success);
      }catch{appNotify("File di salvataggio non valido o corrotto.");}
    };
    r.readAsText(file);
  };
  const onCreate=p=>{setPlayer(p);
    trialResumeRef.current=null;try{safeLS.set("cpm-trial-prog",JSON.stringify({ph:"trial",p:p,tn:0,res:[],slot:currentSlot}));}catch(_e){}/* [7.330.0] i provini si salvano da subito · [7.332.0 BUG GRAVE «mi ha sovrascritto una carriera»] con lo SLOT scelto: senza, la ripresa ripartiva da slot 0 e la firma SCRIVEVA SOPRA la carriera che ci abitava */
    /* [7.32.0] intro cinematica UNA volta per device, mai sotto test (harness/validator attraversano create→trial) */
    const _seen=(()=>{try{return safeLS.get("cpm-intro-seen")==="1";}catch(_e){return true;}})();
    const _test=(typeof window!=="undefined"&&/[?&]cpmtest=1\b/.test(window.location.search||""));
    setPhase(!_seen&&!_test?"cinematic":"trial");};
  const onTrials=r=>{const r3=(Array.isArray(r)?r:[]).slice(0,3);setTrials(r3);try{safeLS.set("cpm-trial-prog",JSON.stringify({ph:"offers",p:player,res:r3,slot:currentSlot}));}catch(_e){}setPhase("offers");};/* [7.330.0] anche la schermata offerte sopravvive alla chiusura dell'app · [7.331.0] cap 3 · [7.332.0] +slot */
  const onChoose=club=>{
    // generate initial calendar + standings when first choosing a club
    const lc=club?.lg==="Primavera 2"?U18_CLUBS_P2:U18_CLUBS;
    const seed=1*777+hashStr(club?.id||club?.n||"u18");
    const calendar=generateSeasonCalendar(club,lc,seed);
    const standings=initStandings(lc);
    const p={...player,club,calendar,standings,log:[`🏟️ Hai scelto ${club.name||club.n}!`]};
    setPlayer(p);setPhase("career");
    try{safeLS.set("cpm-active",String(currentSlot));}catch(_e){}/* [7.149.0] puntatore auto-ripresa */
    try{safeLS.set("cpm-trial-prog","");}catch(_e){}/* [7.330.0] carriera salvata → l'envelope provini ha finito il suo lavoro */
    storage.save({phase:"career",player:p},currentSlot);
    refreshSlots();
  };
  const wrap=ch=>(
    <div className="cpm-root" style={{background:TH.bgGrad,color:TH.text,fontFamily:"'Barlow','Segoe UI',sans-serif"}}>
      {showIntro&&<IntroCinematic onDone={()=>setShowIntro(false)}/>}{/* [7.32.0] replay on-demand sopra ogni fase */}
      {/* [7.331.0 direttiva PO «questo pulsante opzioni deve essere visibile solo nella home e a carriera avviata»]
          il bottone fisso ⚙️ (7.104/7.134) è RIMOSSO da creazione/provini/offerte: Opzioni vive solo nella nav
          della Home e nella nav della carriera. SettingsQuickBtn resta definito ma non montato. */}
      {showSettings&&<SettingsScreen darkMode={dark} onTheme={nd=>{try{safeLS.set("cpm-dark",nd?"1":"0");}catch(_e){}setDark(nd);}} onClose={()=>setShowSettings(false)}/>}
      <div style={{position:"fixed",bottom:6,right:8,zIndex:9999,display:"flex",alignItems:"center",gap:6,pointerEvents:"none",fontFamily:"monospace",fontSize:11,letterSpacing:"0.05em",animation:"cpmBadgeFade 9s ease forwards"}}>{/* [5.95.0 QW] auto-fade: visibile al boot per verificare la versione, poi sparisce (su mobile copriva tab-bar/azioni) */}
        <span title="Ambiente di esecuzione" style={{color:"#fff",fontWeight:800,padding:"2px 7px",borderRadius:6,background:APP_ENV==="PRODUCTION"?"rgba(22,163,74,0.85)":"rgba(217,119,6,0.95)",boxShadow:APP_ENV==="PRODUCTION"?"none":"0 0 0 1px rgba(255,255,255,0.35)"}}>{APP_ENV==="PRODUCTION"?"PROD":"TEST"}</span>
        <span style={{color:"#fff",background:"rgba(0,0,0,0.55)",padding:"2px 7px",borderRadius:6}}>KE {GAME_VERSION}</span>
      </div>
      <style>{`
        *{box-sizing:border-box;}
        @keyframes cpmBadgeFade{0%{opacity:1}88%{opacity:1}100%{opacity:0;visibility:hidden}}
        html,body,#root{height:100%;}
        .cpm-root{height:100vh;height:100dvh;display:flex;flex-direction:column;overflow:hidden;}
        .cpm-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:12px 8px calc(80px + env(safe-area-inset-bottom,0px));}
        @media(min-width:560px){.cpm-scroll{padding:14px 14px calc(80px + env(safe-area-inset-bottom,0px));}}
        @media(min-width:900px){.cpm-scroll{padding:16px 24px 20px 244px;}}
        @media(min-width:1280px){.cpm-scroll{padding:18px 48px 20px 268px;}}
        .cpm-page{width:100%;}
        @media(min-width:900px){.cpm-page{max-width:960px;margin:0 auto;}}
        @media(min-width:1280px){.cpm-page{max-width:1140px;}}
        .cpm-career{width:100%;position:relative;}
        @media(min-width:900px){.cpm-career{max-width:100%;margin:0;}}
        .cpm-dash-grid{display:flex;flex-direction:column;gap:12px;}
        @media(min-width:900px){.cpm-dash-grid{display:grid;grid-template-columns:1fr 1fr;align-items:start;}}
        .cpm-offers{display:flex;flex-direction:column;gap:10px;}
        @media(min-width:900px){.cpm-offers{display:grid;grid-template-columns:1fr 1fr;}}
        .cpm-proto{display:flex;flex-direction:column;gap:8px;}
        @media(min-width:900px){.cpm-proto{display:grid;grid-template-columns:1fr 1fr;}}
        .cpm-slots{display:flex;flex-direction:column;gap:8px;}
        @media(min-width:900px){.cpm-slots{display:grid;grid-template-columns:1fr 1fr 1fr;}}
        .cpm-create{display:flex;flex-direction:column;gap:16px;}
        @media(min-width:900px){.cpm-create{display:grid;grid-template-columns:1fr 1fr;align-items:start;gap:20px;}}
        select option{background:#fff;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px;}
        button:hover:not(:disabled){filter:brightness(0.96);}
        button:active:not(:disabled){transform:scale(.97);}
        input,select{outline:none;}
        input:focus,select:focus{border-color:${TH.primary}!important;box-shadow:0 0 0 3px ${TH.primary}22!important;}
        :focus-visible{outline:2px solid ${TH.primary}!important;outline-offset:2px!important;}
        button:focus-visible{outline:2px solid ${TH.primary}!important;outline-offset:2px!important;}
        .kbd{display:inline-block;padding:1px 5px;border-radius:4px;background:#e2e8f0;color:#475569;font-size:9px;font-family:monospace;font-weight:700;letter-spacing:0.3px;border:1px solid #cbd5e1;}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);}}
        .cpm-nav-bar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:600px;z-index:100;}
        .cpm-nav-hint{display:none;}
        .cpm-nav-tabs button div:nth-child(3){display:none;}
        .cpm-nav-tabs{display:flex;align-items:stretch;backdrop-filter:blur(12px);border-top:1px solid #e2e8f0;padding-bottom:env(safe-area-inset-bottom,0px);}
        @media(min-width:900px){
          .cpm-nav-bar{position:fixed;top:0;left:0;bottom:0;right:auto;width:220px;transform:none;max-width:none;display:flex;flex-direction:column;border-right:1px solid rgba(100,116,139,0.18);border-bottom:none;}
          .cpm-nav-hint{display:none;}
          .cpm-nav-tabs{flex:1;flex-direction:column;border-top:none;border-bottom:none;overflow-y:auto;padding-top:8px;}
          .cpm-nav-tabs button{flex:none!important;width:100%;padding:12px 16px!important;justify-content:flex-start;gap:10px;border-top:none!important;border-left:3px solid transparent;border-right:none;text-align:left;display:flex!important;flex-direction:row!important;align-items:center!important;}
          .cpm-nav-tabs button.cpm-tab-act{border-left-color:${TH.primary}!important;background:${TH.primary}11;}
          .cpm-nav-tabs button div:nth-child(1){font-size:20px!important;margin:0!important;}
          .cpm-nav-tabs button div:nth-child(2){font-size:12px!important;font-weight:600;letter-spacing:0.2px;}
          .cpm-nav-tabs button div:nth-child(3){display:none;}
          .cpm-nav-lang{display:none;}
        }
        @media(max-width:380px){
          .cpm-scroll{padding-left:6px!important;padding-right:6px!important;}
        }
      `}</style>
      <Notif msg={appMsg?.msg} color={appMsg?.color}/>
      <div className="cpm-scroll">{ch}</div>
      {phase==="home"&&<HomeNavBar onImport={importSave} onSettings={()=>setShowSettings(true)}/>}{/* [7.134.0 collaudo PO «riproporre la navbar anche in home con pulsanti diversi»] */}
    </div>
  );
  {const _m=(typeof window!=='undefined'&&(window.location.search||"").match(/[?&]sit=(\d+)/));if(_m)return wrap(<SitTest sitN={parseInt(_m[1],10)}/>);}// 5.43.1: ?sit=N → Situation Test Mode (bypassa il flow normale)
  /* [7.211.0] WIZARD DI REVISIONE: il flag va acceso PRIMA che LiveMatch monti (gli hook di forzatura si
     registrano nel suo useEffect) → si imposta qui, nel render del padre, e si spegne all'uscita. */
  if(phase==="review"){try{window.__CPM_REVIEW=true;if(typeof AudioMgr!=="undefined")AudioMgr.setSuspended(true);}catch(_e){}/* [7.243.0 direttiva PO] il wizard e MUTO: sospende anche l audio gia in corso (musica menu) */
    return wrap(<ReviewWizard onExit={()=>{try{window.__CPM_REVIEW=false;window.__CPM_FORCED_MODE=false;if(typeof AudioMgr!=="undefined")AudioMgr.setSuspended(false);}catch(_e){}setPhase("home");}}/>);}
  if(phase==="loading")return wrap(<div style={{textAlign:"center",paddingTop:80,color:TH.faint}}>Caricamento…</div>);
  if(phase==="home")return wrap(<><HomeScreen slots={slots} onNew={startNew} onLoad={loadSave} onDelete={deleteSlot} onImport={importSave}/>
    {(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD)&&<div style={{textAlign:"center",padding:"6px 0 26px"}}>
      <button onClick={()=>setPhase("review")} style={{background:"none",border:"1px dashed "+TH.divider,color:TH.faint,borderRadius:8,padding:"7px 14px",fontSize:11.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🎬 Revisione azioni (sviluppo)</button>
    </div>}</>);/* [7.211.0] ingresso al wizard di revisione — solo in sviluppo, mai nella build store */
  if(phase==="create")return wrap(<CreateScreen onCreate={onCreate} legacyBonus={legacyBonus} onClearLegacy={()=>setLegacyBonus(null)}/>);
  if(phase==="cinematic"&&player)return wrap(<IntroCinematic onDone={()=>{try{safeLS.set("cpm-intro-seen","1");}catch(_e){}setPhase("trial");}}/>);/* [7.32.0] */
  if(phase==="trial"&&player)return wrap(<TrialFlow player={player} onComplete={onTrials} resume={trialResumeRef.current}/>);{/* [7.330.0] ripresa provini · [7.331.0] niente più segnale onLive: il tasto Opzioni non esiste nelle fasi pre-carriera */}
  if(phase==="offers"&&player)return wrap(<OffersScreen player={player} trialStats={trials} onChoose={onChoose}/>);
  if(phase==="career"&&player)return wrap(<CareerApp player={player} currentSlot={currentSlot} onRefreshSlots={refreshSlots} lang={lang} toggleLang={toggleLang} onNewGamePlusCB={(bonus)=>{setLegacyBonus(bonus);setPhase("create");}} onExitToMenu={()=>{try{safeLS.set("cpm-active","");safeLS.set("cpm-match-resume","");}catch(_e){}setPlayer(null);setPhase("home");refreshSlots();}}/>);/* [7.149.0] uscita al menu: azzera l'auto-ripresa (carriera + partita) → prossimo boot torna alla home */
  return wrap(<div style={{textAlign:"center",color:TH.faint}}>Stato non riconosciuto.</div>);
}

// S10.4 — Dev 50-season headless simulation (run in browser console: runCPMTest50())
if(typeof window!=='undefined'&&window.__CPM_STORE_BUILD){window.runCPMTest50=function(){return null;};}else window.runCPMTest50=function(verbose=false){
  let p={name:"TestPlayer",age:17,season:1,week:1,weekLived:false,proStatus:"pro",ovr:70,goals:0,assists:0,matches:0,totalGoals:0,totalAssists:0,totalMatches:0,morale:70,fatigue:0,form:70,popularity:30,coachTrust:60,value:1.2,skillPoints:2,trophies:[],nationalCaps:0,lastNationalSeason:0,clubPrestigeShifts:{},cup:null,contract:{duration:2,wage:800,expiresAtSeason:3},stats:{velocità:72,tecnica:70,fisico:68,mentalità:68,tiro:74,passaggio:65,dribbling:70,posizionamento:70},club:{id:"juve",n:"Torino Athletic",a:"TAT",p:95,c:"#000",c2:"#fff",nat:"🇮🇹",lg:"Lega A"},history:[],matchHistory:[],log:[],seasonObjectives:[],aiData:{pressReports:{},scoutReports:{},lastOpponentTactic:null}};
  const lc=CLUBS.filter(c=>c.lg==="Lega A");
  p.standings=initStandings(lc);p.calendar=generateSeasonCalendar(p.club,lc,p.season*7919);p.seasonObjectives=generateSeasonObjectives(p);
  const anomalies=[];const log=[];
  for(let s=1;s<=50;s++){
    p.season=s;p.week=1;p.goals=0;p.assists=0;p.matches=0;
    for(let w=1;w<=38;w++){
      p.week=w;
      const md=(p.calendar||[]).find(m=>m.week===w&&!m.played);
      if(md){
        const opp=lc.find(c=>c.id===md.opponentId)||lc[0];
        const _tSd=standingsSeed(p.club?.id,p.season||1,w);// [5.76.0 BUG-6] harness deterministico
        const sim=simulateMatch(p.club,opp,p.ovr,md.isHome,(_tSd+1)>>>0,p.clubPrestigeShifts||{});
        const _dG74=sim.won?rng(0,2):0;p.goals+=_dG74;p.assists+=sim.won&&Math.random()<0.4?1:0;p.matches++;p.totalMatches++;p.totalGoals+=_dG74;/* [6.74.0 QA-26] prima sommava il CUMULATO stagionale a ogni giornata (O(n²)) → l'harness dev si auto-ingannava sui totali carriera */
        p.standings=updateStandings(p.standings,p.club?.id,sim,p.clubPrestigeShifts||{},{opponentId:md.opponentId,seed:_tSd});
        p.calendar=p.calendar.map(m=>m.week===w&&!m.played?{...m,played:true,result:sim}:m);
      }
    }
    // Age & decay
    p.age++;
    if(p.age>=28){const physK=['velocità','fisico'];const techK=['tiro','tecnica','dribbling'];const decP=p.age>=35?0.82:p.age>=32?0.62:0.28;if(Math.random()<decP){const dk=p.age>=31?(Math.random()<0.6?pick(physK):pick(techK)):pick(physK);p.stats[dk]=clamp(p.stats[dk]-1,1,99);}}
    p.ovr=calcOvr(p.stats);
    // Checks
    const ovrOK=p.ovr>=1&&p.ovr<=99;const ageOK=p.age<40||p.age>=40;const noNaN=!Object.values(p.stats).some(isNaN);
    const standOK=p.standings?.length===lc.length;
    if(!ovrOK||!noNaN||!standOK)anomalies.push({season:s,age:p.age,ovr:p.ovr,ovrOK,noNaN,standOK});
    if(verbose||s%10===0)log.push({s,age:p.age,ovr:Math.round(p.ovr),goals:p.goals,wage:p.contract?.wage});
    // New season
    const seed=(s+1)*7919+(s+1)*(s+1)*31;
    p.standings=initStandings(lc);p.calendar=generateSeasonCalendar(p.club,lc,seed);
    p.contract={...p.contract,duration:(p.contract?.duration||1)-1};
    if(p.age>=40){log.push({s,msg:"RITIRO CORRETTO a età "+p.age});break;}
  }
  console.log("=== CPM Test 50 Stagioni ===");console.table(log);
  if(anomalies.length)console.warn("ANOMALIE:",anomalies);else console.log("✅ NESSUNA ANOMALIA RILEVATA");
  return{log,anomalies};
};

// roadmap 1.10 — ERROR BOUNDARY GLOBALE + crash screen: un errore in qualsiasi punto dell'app non lascia più una schermata
//   bianca; mostra un recupero che RASSICURA sul salvataggio (localStorage intatto) e offre ricarica + backup → protegge dati e recensioni.
class RootErrorBoundary extends React.Component{
  constructor(p){super(p);this.state={err:null};}
  static getDerivedStateFromError(err){return{err};}
  componentDidCatch(err,info){try{console.error("[KORWARD] Crash globale:",err,info&&info.componentStack);}catch(e){}}
  _backup(){try{const o={};["cpm-v3","cpm-v3-s2","cpm-v3-s3"].forEach(k=>{const v=localStorage.getItem(k);if(v)o[k]=v;});const b=new Blob([JSON.stringify({_elevoraBackup:1,_korwardBackup:1,at:Date.now(),slots:o},null,2)],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="korward-backup.json";a.click();URL.revokeObjectURL(u);}catch(e){}}
  render(){
    if(!this.state.err)return this.props.children;
    return(
      <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:24,background:"#0f172a",color:"#e2e8f0",fontFamily:"'Barlow','Segoe UI',sans-serif",textAlign:"center",zIndex:99999}}>
        <div style={{fontSize:42}}>⚠️</div>
        <div style={{fontSize:20,fontWeight:900}}>Qualcosa è andato storto</div>
        <div style={{fontSize:14,maxWidth:360,opacity:0.85,lineHeight:1.5}}>La tua carriera è <b>al sicuro</b> sul dispositivo. Ricarica per riprendere da dove eri; puoi anche tornare al menu o scaricare un backup di sicurezza.</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginTop:6}}>
          <button onClick={()=>location.reload()} style={{padding:"11px 22px",borderRadius:10,border:"none",background:"#2563eb",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>↻ Ricarica</button>
          <button onClick={()=>{try{localStorage.setItem("cpm-active","");localStorage.setItem("cpm-match-resume","");}catch(e){}location.reload();}} style={{padding:"11px 22px",borderRadius:10,border:"1px solid #334155",background:"transparent",color:"#e2e8f0",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>🏠 Torna al menu</button>{/* [7.149.0] azzera l'auto-ripresa (carriera + partita) → il boot torna alla home: valvola anti crash-loop */}
          <button onClick={()=>this._backup()} style={{padding:"11px 22px",borderRadius:10,border:"1px solid #334155",background:"transparent",color:"#e2e8f0",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>📁 Scarica backup</button>
        </div>
      </div>
    );
  }
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(RootErrorBoundary,null,React.createElement(App)));
requestAnimationFrame(window._hide);
