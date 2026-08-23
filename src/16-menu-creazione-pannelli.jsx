/* ========================================================================
 * KORWARD ELITE — frammento n° 16  (dei 20, numerati da 00 a 19)
 * src/16-menu-creazione-pannelli.jsx
 *
 * MENU · CREAZIONE · PROVINO · NAZIONALE · TUTORIAL · ALLENAMENTO
 *
 * PwaInstallBanner, BallO, Wordmark, HomeScreen, LogoMark, CreateScreen, OffersScreen,
 * TrialFlow, AISettingsCard, NationalCallupScreen, CareerEndScreen, le tabelle
 * CHALLENGES / LOCALE / CAREER_MILESTONES / MARKET_NEWS_TPL / MONTHLY_COACH_REVIEWS /
 * TUTORIAL_STEPS, TutorialOverlay, MilestoneCelebrationModal, TrainPanel e le
 * stance/driver di morale.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 27155-29704   ·   2550 righe di 41427
 * La prima riga dopo questa intestazione è la riga 27155 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 27129 del file generato.
 *
 * NON si modifica CARRIER-MANAGER-AV.html: è GENERATO. Si modifica QUESTO file,
 * poi si esegue `node tools/build-src.mjs`. La prova che nulla è cambiato per
 * sbaglio è `node tools/check-src.mjs`: il ricomposto deve essere identico byte
 * per byte. La riga qui sotto chiude l'intestazione — la build taglia tutto fino
 * a essa compresa, ed è per questo che il risultato torna identico.
 * ========================================================================
 */
/* CMAV-SRC-HEADER-END */
/* F-2: PWA install banner — Android (beforeinstallprompt) + iOS Safari hint */
function PwaInstallBanner(){
  const[installable,setInstallable]=useState(!!window._cpmDp);
  useEffect(()=>{
    const onReady=()=>setInstallable(true);
    const onDone=()=>setInstallable(false);
    window.addEventListener('cpm_installready',onReady);
    window.addEventListener('cpm_installed',onDone);
    return()=>{window.removeEventListener('cpm_installready',onReady);window.removeEventListener('cpm_installed',onDone);};
  },[]);
  if(window.matchMedia('(display-mode: standalone)').matches)return null;
  if(installable)return(
    <div onClick={()=>window._cpmInstall?.()} style={{display:'flex',alignItems:'center',gap:10,background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:12,padding:'10px 14px',marginBottom:12,cursor:'pointer'}}>
      <div style={{fontSize:20,lineHeight:1}}>📲</div>
      <div style={{flex:1}}>
        <div style={{fontSize:11,fontWeight:700,color:'#1d4ed8'}}>Installa Korward Elite come app</div>
        <div style={{fontSize:10,color:'#3b82f6',marginTop:1}}>Tocca per aggiungere alla schermata principale</div>
      </div>
      <div style={{fontSize:14,color:'#3b82f6',fontWeight:700}}>›</div>
    </div>
  );
  if(/iphone|ipad|ipod/i.test(navigator.userAgent))return(
    <div style={{display:'flex',alignItems:'center',gap:10,background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:12,padding:'10px 14px',marginBottom:12}}>
      <div style={{fontSize:20,lineHeight:1}}>📲</div>
      <div style={{flex:1}}>
        <div style={{fontSize:11,fontWeight:700,color:'#1d4ed8'}}>Installa su iPhone / iPad</div>
        <div style={{fontSize:10,color:'#3b82f6',marginTop:1}}>Safari → <b>Condividi ⬆️</b> → "Aggiungi a Home"</div>
      </div>
    </div>
  );
  return null;
}

/* ========================================
   WORDMARK — "Korward" (la "o" è il pallone) + sottotitolo "Elite" corsivo
======================================== */
function BallO({em=0.82,small=false,va="-0.11em"}){
  // pallone classico bianco/nero: pentagono centrale + 5 al bordo ritagliati nel cerchio. [6.69.0] em/va/small opzionali (default = ball storico byte-identico)
  const cid=React.useMemo(()=>"bo"+Math.floor(Math.random()*1e6),[]);
  return(
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{width:em+"em",height:em+"em",verticalAlign:va,flex:"0 0 auto"}}>
      <defs><clipPath id={cid}><circle cx="12" cy="12" r="10.3"/></clipPath></defs>
      <circle cx="12" cy="12" r="10.3" fill="#fff" stroke="#1e293b" strokeWidth={small?2.0:1.2}/>
      <g clipPath={`url(#${cid})`} fill="#1e293b">
        <polygon points="12,8.5 15.33,10.92 14.06,14.83 9.94,14.83 8.67,10.92"/>
        {!small&&<React.Fragment>
        <polygon points="16.06,6.42 14.82,2.62 18.05,0.27 21.29,2.62 20.05,6.42"/>
        <polygon points="18.56,14.13 21.8,11.78 25.03,14.13 23.79,17.93 19.8,17.93"/>
        <polygon points="12,18.9 15.23,21.25 14,25.05 10,25.05 8.77,21.25"/>
        <polygon points="5.44,14.13 4.2,17.93 0.21,17.93 -1.03,14.13 2.2,11.78"/>
        <polygon points="7.94,6.42 3.95,6.42 2.71,2.62 5.95,0.27 9.18,2.62"/>
        </React.Fragment>}
      </g>
    </svg>
  );
}
/* [6.69.0] REBRAND: nome principale «Korward» (la "o" è il pallone BallO), «Elite» = SOTTOTITOLO più piccolo in corsivo, IMPILATO sotto.
   Hero "Korward" = system-sans 900 granata (gradiente solo grande); Elite corsivo italic ambra, ~0.42×, lettera-spaziato. `color` forza mono su entrambe. */
function Wordmark({size=30,color,elite="#f59e0b"}){
  const small=size<18;
  const gran=color||"#a3263a";
  const useGrad=!color&&size>=28;
  const kFont="'Segoe UI',system-ui,-apple-system,Roboto,Arial,sans-serif";
  const eSmall=size*0.42<13;
  const eFont=eSmall?"'Segoe UI',system-ui,Arial,sans-serif":"'KWScript','Segoe Script','Brush Script MT','Snell Roundhand','Apple Chancery',cursive";
  const korStyle=useGrad
    ?{backgroundImage:"linear-gradient(180deg,#a3263a 0%,#5e0f1d 100%)",WebkitBackgroundClip:"text",backgroundClip:"text",WebkitTextFillColor:"transparent",color:"transparent"}
    :{color:gran};
  return(
    <span style={{display:"inline-flex",flexDirection:"column",alignItems:"center",lineHeight:1,whiteSpace:"nowrap"}}>
      <span style={{fontFamily:kFont,fontWeight:900,fontSize:size,letterSpacing:size*0.01,lineHeight:1,...korStyle}}>K<BallO em={0.74} small={small} va="-0.04em"/>rward</span>
      <span style={{fontFamily:eFont,fontStyle:"italic",fontWeight:700,fontSize:Math.max(9,Math.round(size*0.42)),color:color||elite,lineHeight:1,letterSpacing:Math.max(1,size*0.15),marginTop:Math.round(size*0.1)}}>Elite</span>
    </span>
  );
}
/* ========================================
   HOME SCREEN — slot salvataggio
======================================== */
function HomeScreen({onNew,onLoad,onDelete,onImport,slots}){
  const _dk=window.innerWidth>=640;
  const[confirmDel,setConfirmDel]=useState(null);
  const fmtDate=ts=>ts?new Date(ts).toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}):"–";
  useEffect(()=>{
    const onKey=e=>{
      if(_scrive386(e))return;/* [7.386.0] chi scrive tiene la tastiera */
      if(e.target.tagName==="INPUT"||confirmDel!==null)return;
      if(e.key==="Enter"){
        e.preventDefault();
        const firstFilled=slots.findIndex(Boolean);
        if(firstFilled>=0)onLoad(firstFilled);
        else{const firstEmpty=slots.findIndex(s=>!s);if(firstEmpty>=0)onNew(firstEmpty);}
      }
      if(["1","2","3"].includes(e.key)){
        const i=parseInt(e.key)-1;
        if(slots[i])onLoad(i);
        else onNew(i);
      }
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[slots,confirmDel,onLoad,onNew]);// eslint-disable-line
  const hasAny=slots.some(Boolean);
  const allFull=slots.every(Boolean);// card di sovrascrittura solo quando non c'è alcuno slot vuoto
  return(
    <div style={{width:"100%"}}>
      {confirmDel!==null&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <Card style={{maxWidth:340,width:"100%",padding:"22px",textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:10}}>🗑️</div>
            <div style={{fontSize:14,fontWeight:700,marginBottom:6,color:TH.text}}>Eliminare il salvataggio?</div>
            <div style={{fontSize:12,color:TH.muted,marginBottom:18}}>I progressi della carriera nello slot {confirmDel+1} saranno persi per sempre.</div>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={()=>setConfirmDel(null)} v="secondary" fw>Annulla</Btn>
              <Btn onClick={()=>{onDelete(confirmDel);setConfirmDel(null);}} v="danger" fw>Elimina</Btn>
            </div>
          </Card>
        </div>
      )}
      {/* [6.19.0] HERO masthead — banner branded (prima impressione premium) */}
      <div style={{position:"relative",borderRadius:RAD.xl,overflow:"hidden",marginBottom:18,boxShadow:TH.el2,background:"linear-gradient(150deg,#a3263a 0%,#8e1f33 46%,#5e0f1d 120%)"}}>
        <div aria-hidden style={{position:"absolute",inset:0,background:"radial-gradient(130% 85% at 84% -12%,rgba(255,255,255,0.22),transparent 55%)"}}/>
        <div aria-hidden style={{position:"absolute",left:-30,bottom:-40,width:180,height:180,borderRadius:"50%",border:"18px solid rgba(255,255,255,0.05)"}}/>
        <div style={{position:"relative",textAlign:"center",padding:"28px 20px 24px"}}>
          <div className="lrise" style={{display:"inline-block",marginBottom:11,lineHeight:0}}>
            <svg width="60" height="60" viewBox="0 0 100 100" style={{filter:"drop-shadow(0 6px 16px rgba(0,0,0,0.35))"}}>
              <rect className="lb lb1" x="24" y="46" width="15" height="26" rx="7" fill="#fff"/>
              <rect className="lb lb2" x="43" y="36" width="15" height="36" rx="7" fill="#fff"/>
              <rect className="lb lb3" x="62" y="24" width="15" height="48" rx="7" fill="#fff"/>
              <g className="lball"><circle cx="69.5" cy="15" r="10" fill="#fff" stroke="#5e0f1d" strokeWidth="1.3"/><clipPath id="homeBall"><circle cx="69.5" cy="15" r="10"/></clipPath><g clipPath="url(#homeBall)" fill="#5e0f1d"><polygon points="69.5,11.6 72.73,13.95 71.5,17.75 67.5,17.75 66.27,13.95"/><polygon points="73.44,9.58 72.24,5.89 75.38,3.61 78.52,5.89 77.32,9.58"/><polygon points="75.87,17.07 79.01,14.79 82.15,17.07 80.95,20.76 77.07,20.76"/><polygon points="69.5,21.7 72.64,23.98 71.44,27.67 67.56,27.67 66.36,23.98"/><polygon points="63.13,17.07 61.93,20.76 58.05,20.76 56.85,17.07 59.99,14.79"/><polygon points="65.56,9.58 61.68,9.58 60.48,5.89 63.62,3.61 66.76,5.89"/></g></g>
            </svg>
          </div>
          <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",lineHeight:1}}>
            <span style={{fontFamily:"'Segoe UI',system-ui,-apple-system,Roboto,'Helvetica Neue',Arial,sans-serif",fontWeight:900,fontSize:40,letterSpacing:.5,color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,0.3)",lineHeight:1}}>K<span style={{fontSize:31,verticalAlign:"baseline"}}>⚽</span>rward</span>
            <span style={{fontFamily:"'KWScript','Segoe Script','Snell Roundhand','Apple Chancery',cursive",fontWeight:400,fontSize:30,letterSpacing:1,color:"#f59e0b",textShadow:"0 2px 8px rgba(0,0,0,0.3)",marginTop:0,lineHeight:1}}>Elite</span>
          </div>
          <p style={{color:"rgba(255,255,255,0.86)",fontSize:11,margin:"8px 0 3px",letterSpacing:2,textTransform:"uppercase",fontWeight:FW.black}}>Football Career Simulator</p>
          <p style={{color:"rgba(255,255,255,0.64)",fontSize:12,margin:0,fontStyle:"italic"}}>From prospect to legend</p>
        </div>
      </div>
      <PwaInstallBanner/>
      {/* Save slots */}
      <div className="cpm-slots" style={{marginBottom:14}}>
        {slots.map((s,i)=>s&&s.corrupted?(
          <div key={i} style={{border:`2px solid #fca5a5`,borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",background:TH.lossBg}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:TH.danger}}>⚠️ Slot {i+1} — dati corrotti</div>
              <div style={{fontSize:11,color:TH.muted,marginTop:2}}>Il salvataggio non è leggibile. Elimina e ricomincia.</div>
            </div>
            <button onClick={()=>setConfirmDel(i)} style={{padding:"6px 12px",borderRadius:8,border:"1px solid #fca5a5",background:TH.lossBg,cursor:"pointer",color:TH.danger,fontSize:12,fontWeight:700}}>🗑️ Elimina</button>
          </div>
        ):s?(
          <Card key={i} border={TH.cardBorder} style={{padding:"12px 14px"}}>
            {/* [7.453.0 collaudo PO «il testo è sovrapposto!», screenshot della Home] La card teneva QUATTRO
                colonne su una riga sola — avatar, testo, anello OVR, bottoni — tutte in px fissi tranne il
                testo, che e' quindi l'unico che cede. MISURATO: la colonna di testo scende a 115px su un
                viewport da 412, a 67px su 360, a 27px su 320. A quel punto «CF Madrid · S.20 W.1/38» si
                spezza in cinque righe da una parola l'una, incollate all'anello: e' lo screenshot del PO.
                Ora avatar+testo+anello sono un gruppo unico che chiede almeno 210px e i bottoni SCENDONO
                SOTTO quando quella soglia non c'e' — nessuna media query, e' il flex che cede dove deve —
                e le tre righe di testo troncano con i puntini invece di sbriciolarsi. */}
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flex:"1 1 210px",minWidth:0}}>
                <AvatarSVG id={s.avatarId} size={46}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,fontSize:14,color:TH.text,marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                  <div style={{fontSize:11,color:TH.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.retired?<span style={{color:"#b45309",fontWeight:700}}>🏁 Carriera conclusa · S.{s.season}</span>:<>{s.club} · S.{s.season} W.{s.week}/38</>}</div>{/* [7.258.0] uno slot ritirato non promette una settimana da giocare */}
                  <div style={{fontSize:10,color:TH.faint,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>💾 {fmtDate(s.savedAt)}</div>
                </div>
                <OvrRing value={s.ovr} size={40}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0,marginLeft:"auto"}}>
                <Btn onClick={()=>onLoad(i)} v="primary" style={{padding:"8px 14px",fontSize:13}}>{s.retired?"🏛️ Rivivi il finale →":"Continua →"}</Btn>
                <button onClick={()=>setConfirmDel(i)} style={{padding:"5px",borderRadius:7,border:"1px solid "+TH.cardBorder,background:"transparent",cursor:"pointer",color:TH.faint,fontSize:11}}>🗑️ Elimina</button>
              </div>
            </div>
          </Card>
        ):(
          <div key={i} style={{border:`2px dashed ${TH.cardBorder}`,borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,0.4)"}}>
            <div style={{fontSize:12,color:TH.faint}}>Slot {i+1} — vuoto</div>
            <Btn onClick={()=>onNew(i)} v="secondary" style={{padding:"8px 14px",fontSize:13}}>⚡ Nuova carriera</Btn>
          </div>
        ))}
      </div>
      {!hasAny&&<Card style={{marginBottom:12,padding:"14px 16px"}}>
        <p style={{fontSize:12,color:TH.muted,margin:"0 0 12px",lineHeight:1.7}}>Crea il tuo calciatore, supera i provini e costruisci la tua carriera calcistica nei principali campionati europei.</p>
      </Card>}
      {/* Card di sovrascrittura: solo quando TUTTI gli slot sono pieni (nessuno slot vuoto disponibile) */}
      {allFull&&(
        <Card style={{marginBottom:10,padding:"12px 14px",background:TH.bgBlue,border:"1px solid #bfdbfe"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:TH.primary}}>⚡ Nuova Carriera</div>
              <div style={{fontSize:10,color:TH.muted,marginTop:2}}>Tutti gli slot sono pieni — sovrascrivine uno per iniziare</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              {slots.map((s,i)=>(
                <button key={i} onClick={()=>onNew(i)} title={s&&s.corrupted?`Sovrascrive S${i+1} (corrotto)`:s?`Sovrascrive: ${s.name}`:`Slot ${i+1} vuoto`}
                  style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${s?"#fecaca":"#bfdbfe"}`,background:s?"#fee2e2":"#dbeafe",cursor:"pointer",fontSize:11,fontWeight:700,color:s?TH.danger:TH.primary}}>
                  {s?`⚠️S${i+1}`:`+S${i+1}`}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
      {_dk&&<div style={{textAlign:"center",marginBottom:8,fontSize:10,color:TH.faint}}>
        <span className="kbd">1</span><span className="kbd">2</span><span className="kbd">3</span> slot · <span className="kbd">Enter</span> continua/nuova
      </div>}
      {/* [7.134.0 collaudo PO] Importa salvataggio e Rivedi l'intro sono ora nella nav bar della home (HomeNavBar) */}
    </div>
  );
}

/* ========================================
   CREATE SCREEN  (req #2 – avatar)
======================================== */
// Logo "Rise" riutilizzabile (marchio app) — usato su tutte le schermate
function LogoMark({size=32,shadow=true}){
  const gid=React.useMemo(()=>"lm"+Math.floor(Math.random()*1e6),[]);
  return(
    <svg width={size} height={size} viewBox="0 0 100 100" style={{flexShrink:0,...(shadow?{filter:"drop-shadow(0 4px 12px rgba(94,15,29,0.30))"}:{})}}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#a3263a"/><stop offset="1" stopColor="#5e0f1d"/></linearGradient></defs>
      <rect x="2" y="2" width="96" height="96" rx="27" fill={`url(#${gid})`}/>
      {/* contenuto entro la zona di sicurezza maskable (scala 0.8, ricentrato) */}
      <g transform="translate(50 52) scale(0.8) translate(-51.75 -38.5)">
      <rect x="24" y="46" width="15" height="26" rx="7" fill="#fff"/>
      <rect x="43" y="36" width="15" height="36" rx="7" fill="#fff"/>
      <rect x="62" y="24" width="15" height="48" rx="7" fill="#fff"/>
      <g><circle cx="69.5" cy="15" r="10" fill="#fff" stroke="#1e293b" strokeWidth="1.3"/><clipPath id={gid+"b"}><circle cx="69.5" cy="15" r="10"/></clipPath><g clipPath={`url(#${gid}b)`} fill="#1e293b"><polygon points="69.5,11.6 72.73,13.95 71.5,17.75 67.5,17.75 66.27,13.95"/><polygon points="73.44,9.58 72.24,5.89 75.38,3.61 78.52,5.89 77.32,9.58"/><polygon points="75.87,17.07 79.01,14.79 82.15,17.07 80.95,20.76 77.07,20.76"/><polygon points="69.5,21.7 72.64,23.98 71.44,27.67 67.56,27.67 66.36,23.98"/><polygon points="63.13,17.07 61.93,20.76 58.05,20.76 56.85,17.07 59.99,14.79"/><polygon points="65.56,9.58 61.68,9.58 60.48,5.89 63.62,3.61 66.76,5.89"/></g></g>
      </g>
    </svg>
  );
}
function CreateScreen({onCreate,legacyBonus,onClearLegacy}){
  const[name,setName]=useState(""),[nation,setNation]=useState("Italia"),[avatarId,setAvatarId]=useState(0),[page,setPage]=useState(0);
  const[archetypeId,setArchetypeId]=useState("bomber");
  const[challengeId,setChallengeId]=useState(null);
  const[dreamClub,setDreamClub]=useState(null);
  const[dreamSearch,setDreamSearch]=useState("");
  const inp={background:TH.surface2,border:"1px solid "+TH.cardBorder,borderRadius:10,color:TH.text,padding:"10px 14px",fontFamily:"inherit",fontSize:14,width:"100%",boxSizing:"border-box"};
  const lbl={display:"block",fontSize:11,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6};
  const go=()=>{
    if(!name.trim())return;
    const arc=ARCHETYPES.find(a=>a.id===archetypeId)||ARCHETYPES[0];
    let stats=baseStats(arc);
    if(legacyBonus?.statBoost){Object.keys(stats).forEach(k=>{stats[k]=clamp(stats[k]+legacyBonus.statBoost,1,99);});}
    const age=17;
    const challenge=challengeId?CHALLENGES.find(c=>c.id===challengeId):null;
    if(onClearLegacy)onClearLegacy();
    const newPlayerBase={name:name.trim(),nation,avatarId,foot:(Math.abs(hashStr((name||"")+(nation||"")))%100)<22?"L":"R",archetype:arc,position:"Attaccante",age,stats,ovr:calcOvr(stats),club:null,trialsDone:0,trialStats:[],season:1,week:1,weekLived:false,u18Seasons:0,isU18:true,proStatus:"u18",goals:0,assists:0,matches:0,totalGoals:0,totalAssists:0,totalMatches:0,morale:legacyBonus?clamp(70+(legacyBonus.moraleBoost||0),0,100):70,fatigue:0,popularity:20,skillPoints:2,log:[],history:[],matchHistory:[],value:0.8,coachTrust:60,form:70,transferOffers:[],offerHistory:[],contract:{duration:1,wage:577,expiresAtSeason:2},aiData:{lastOpponentTactic:null,scoutReports:{},pressReports:{}},dreamClub:dreamClub||null,worldMemory:[],rival:null,saveVersion:SAVE_VERSION,...(legacyBonus?{legacyBonusLabel:legacyBonus.label}:{}),...(challenge?{challenge:{id:challenge.id,completed:false,failed:false}}:{})};
    onCreate({...newPlayerBase,teammates:generateTeammates(newPlayerBase),journalists:generateJournalists()});
  };
  const perPage=10;const totalPages=Math.ceil(AVATARS.length/perPage);const pageAvatars=AVATARS.slice(page*perPage,(page+1)*perPage);
  return(
    <div style={{width:"100%"}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><LogoMark size={46}/></div>
        <h1 style={{fontSize:20,fontWeight:900,margin:0,color:TH.text}}>Crea il tuo calciatore</h1>
        <p style={{color:TH.muted,fontSize:12,margin:"6px 0 0"}}>Ruolo fisso: <strong style={{color:TH.primary}}>Attaccante</strong></p>
      </div>
      <Card style={{maxWidth:900,margin:"0 auto",padding:"16px 16px 18px"}}>
      <div className="cpm-create">
        {/* SINISTRA — Identità: 3D + avatar + nome + nazionalità */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{fontSize:10,color:TH.faint,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>👤 Identità</div>
          <div style={{display:"flex",justifyContent:"center"}}>
            <AvatarSVG id={avatarId} size={200} border={true}/>
          </div>
          <div>
            <label style={lbl}>Aspetto calciatore</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
              {pageAvatars.map(av=>(
                <button key={av.id} onClick={()=>setAvatarId(av.id)} title={av.label} style={{padding:4,borderRadius:10,border:`2px solid ${avatarId===av.id?TH.primary:"transparent"}`,background:avatarId===av.id?TH.primaryTint:"transparent",cursor:"pointer",display:"flex",justifyContent:"center"}}>
                  <AvatarSVG id={av.id} size={44}/>
                </button>
              ))}
            </div>
            {totalPages>1&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{background:"none",border:"1px solid "+TH.cardBorder,borderRadius:8,padding:"4px 12px",cursor:"pointer",color:TH.muted,fontSize:12}}>←</button>
                <span style={{fontSize:11,color:TH.faint}}>{page+1}/{totalPages}</span>
                <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} style={{background:"none",border:"1px solid "+TH.cardBorder,borderRadius:8,padding:"4px 12px",cursor:"pointer",color:TH.muted,fontSize:12}}>→</button>
              </div>
            )}
            <div style={{textAlign:"center",marginTop:8,fontSize:11,color:TH.muted}}>{AVATARS[avatarId]?.label}</div>
          </div>
          <div><label style={lbl}>Nome</label><input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="Es. Giovanni Pisano" maxLength={22} autoComplete="off" autoCorrect="off" spellCheck={false} name="cpm-hero-name" onKeyDown={e=>e.key==="Enter"&&go()}/>{/* [7.37.2 collaudo PO «continuo a vedere Leo Vairo»] era l'AUTOFILL del browser (vecchio input dell'utente): il campo non aveva autocomplete=off */}</div>
          <div><label style={lbl}>Nazionalità</label><select style={inp} value={nation} onChange={e=>setNation(e.target.value)}>{NATIONS.map(n=><option key={n}>{n}</option>)}</select></div>
        </div>
        {/* DESTRA — Stile & percorso */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{fontSize:10,color:TH.faint,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700}}>🎯 Stile & percorso</div>
          <Card style={{padding:"12px 14px",background:TH.bgBlue,border:"1px solid #bfdbfe"}} shadow={false}>
            <div style={{fontSize:12,color:TH.primary,fontWeight:700,marginBottom:3}}>📋 Percorso carriera</div>
            <div style={{fontSize:11,color:TH.muted,lineHeight:1.6}}>3 provini → offerte U18 → Lega A Primavera → campionati europei</div>
          </Card>
          {/* S12.2: Archetype selection */}
          <div>
            <label style={lbl}>Stile di gioco</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {ARCHETYPES.map(arc=>{
                const sel=archetypeId===arc.id;
                return(
                  <button key={arc.id} onClick={()=>setArchetypeId(arc.id)} style={{padding:"8px 10px",borderRadius:10,border:`2px solid ${sel?TH.primary:TH.cardBorder}`,background:sel?TH.primaryTint:TH.surface2,cursor:"pointer",textAlign:"left",transition:"border .15s"}}>
                    <div style={{fontSize:16,marginBottom:2}}>{arc.e}</div>
                    <div style={{fontSize:11,fontWeight:700,color:sel?TH.primary:TH.text}}>{arc.name}</div>
                    <div style={{fontSize:10,color:TH.faint,lineHeight:1.4}}>{arc.desc}</div>
                  </button>
                );
              })}
            </div>
            {(()=>{const arc=ARCHETYPES.find(a=>a.id===archetypeId);return arc?(
              <div style={{marginTop:6,padding:"7px 10px",background:TH.bgGreen,borderRadius:8,border:"1px solid #bbf7d0",fontSize:10,color:TH.txGreen}}>{/* [7.120.0 audit UI] bg verde chiaro FISSO → testo verde scuro FISSO (era TH.muted = chiaro in dark mode → illeggibile) */}
                {Object.entries(arc.bonus).map(([k,v])=><span key={k} style={{marginRight:6,color:v>0?TH.success:TH.danger,fontWeight:700}}>{k} {v>0?"+":""}{v}</span>)}
              </div>
            ):null;})()}
          </div>
          {/* Club dei Sogni — tutti i club del gioco */}
          <div>
            <label style={lbl}>⭐ Club dei sogni <span style={{color:TH.faint,fontWeight:400,textTransform:"none",letterSpacing:0}}>(opzionale)</span></label>
            <input
              value={dreamSearch}
              onChange={e=>setDreamSearch(e.target.value)}
              placeholder="Cerca squadra…"
              style={{...inp,fontSize:12,padding:"7px 12px",marginBottom:6}}
            />
            <div style={{maxHeight:220,overflowY:"auto",display:"flex",flexDirection:"column",gap:4,marginBottom:4,paddingRight:2}}>
              {CLUBS.filter(c=>!c.isU18&&(!dreamSearch||c.n.toLowerCase().includes(dreamSearch.toLowerCase())||c.a.toLowerCase().includes(dreamSearch.toLowerCase()))).sort((a,b)=>b.p-a.p).map(c=>{
                const sel=dreamClub?.id===c.id;
                return(
                <button key={c.id} onClick={()=>setDreamClub(sel?null:c)} title={c.n} style={{padding:"6px 9px",borderRadius:9,border:`2px solid ${sel?c.c||TH.primary:"transparent"}`,background:sel?TH.primaryTint:TH.surface2,cursor:"pointer",display:"flex",alignItems:"center",gap:9,textAlign:"left"}}>
                  <TeamBadge team={c} size={24}/>
                  <span style={{flex:1,minWidth:0,fontSize:12,fontWeight:700,color:sel?c.c||TH.primary:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.n}</span>
                  <span style={{fontSize:9,color:TH.faint,flexShrink:0,whiteSpace:"nowrap"}}>{c.lg}</span>
                </button>
                );
              })}
            </div>
            {dreamClub&&<div style={{fontSize:10,color:TH.success,background:TH.bgGreen,borderRadius:8,padding:"6px 10px",border:"1px solid #bbf7d0",display:"flex",alignItems:"center",gap:8}}><TeamBadge team={dreamClub} size={20}/> Il tuo sogno: <strong>{dreamClub.n}</strong> ({dreamClub.lg}). Ce la farai?</div>}
          </div>
          {legacyBonus&&<div style={{padding:"10px 12px",borderRadius:10,background:"linear-gradient(135deg,#7c3aed22,#4f46e522)",border:"1px solid #7c3aed44",marginBottom:6,fontSize:11,color:"#7c3aed",fontWeight:700}}>🌟 Nuova Partita+ attiva — Bonus {legacyBonus.label}: +{legacyBonus.statBoost} a tutti gli attributi</div>}
          <details style={{marginBottom:6}}>
            <summary style={{fontSize:11,color:TH.muted,cursor:"pointer",userSelect:"none",padding:"4px 0"}}>⚡ Modalità Sfida <span style={{color:challengeId?TH.warning:"inherit"}}>{challengeId?`(attiva: ${CHALLENGES.find(c=>c.id===challengeId)?.name||""})`:""}</span></summary>
            <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>
              {CHALLENGES.map(ch=>{const sel=challengeId===ch.id;return(<button key={ch.id} onClick={()=>setChallengeId(sel?null:ch.id)} style={{textAlign:"left",padding:"8px 10px",borderRadius:10,border:`2px solid ${sel?"#f59e0b":TH.cardBorder}`,background:sel?"#fef9c3":"#f8fafc",cursor:"pointer"}}><div style={{fontSize:14,marginBottom:2}}>{ch.icon} <span style={{fontWeight:700,fontSize:11}}>{ch.name}</span></div><div style={{fontSize:10,color:TH.muted}}>{ch.desc}</div><div style={{fontSize:10,color:"#f59e0b",marginTop:2}}>{ch.reward}</div></button>);})}
            </div>
          </details>
          <Btn onClick={go} disabled={!name.trim()} fw style={{padding:"14px",fontSize:15}}>⚡ INIZIA I PROVINI</Btn>
        </div>
      </div>{/* end cpm-create */}
      </Card>
    </div>
  );
}

/* ========================================
   OFFERS SCREEN  (req #11 – clubs)
======================================== */
function OffersScreen({player,trialStats,onChoose}){
  const _dk=window.innerWidth>=640;
  const total=trialStats.reduce((a,m)=>a+m.goals,0),avg=Math.round(trialStats.reduce((a,m)=>a+m.rating,0)/Math.max(1,trialStats.length)*10)/10,perf=total*2+avg*5;
  const[offers]=useState(()=>[...ALL_U18_CLUBS].sort((a,b)=>{const sa=a.p+(Math.random()-.5)*30,sb=b.p+(Math.random()-.5)*30;return perf>50?sb-sa:sa-sb;}).slice(0,perf>50?3:2));
  const[selIdx,setSelIdx]=useState(0);
  useEffect(()=>{
    const onKey=e=>{
      if(_scrive386(e))return;/* [7.386.0] chi scrive tiene la tastiera */
      if(["1","2","3"].includes(e.key)){const i=parseInt(e.key)-1;if(offers[i])onChoose(offers[i]);return;}
      if(e.key==="ArrowDown"||e.key==="ArrowRight"){e.preventDefault();setSelIdx(i=>Math.min(offers.length-1,i+1));return;}
      if(e.key==="ArrowUp"||e.key==="ArrowLeft"){e.preventDefault();setSelIdx(i=>Math.max(0,i-1));return;}
      if(e.key==="Enter"){e.preventDefault();if(offers[selIdx])onChoose(offers[selIdx]);return;}
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[offers,selIdx,onChoose]);// eslint-disable-line
  return(
    <div style={{width:"100%"}}>
      <div style={{textAlign:"center",marginBottom:14}}><div style={{display:"flex",justifyContent:"center",marginBottom:8}}><LogoMark size={40}/></div><h1 style={{fontSize:18,fontWeight:900,margin:0,color:TH.text}}>Offerte ricevute</h1><p style={{color:TH.muted,fontSize:12,margin:"6px 0 0"}}>3 provini · {total} gol · Rating medio {avg}</p></div>
      <Card style={{marginBottom:12,padding:"12px 14px"}}>
        <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Riepilogo provini</div>
        <div style={{display:"flex",gap:6}}>{trialStats.map((t,i)=><div key={i} className="cpm-num" style={{flex:1,background:TH.surface2,borderRadius:RAD.sm,padding:"7px",textAlign:"center",border:"1px solid "+TH.divider}}><div style={{fontSize:10,color:TH.faint,marginBottom:2}}>Provino {i+1}</div><div style={{fontSize:12,fontWeight:FW.bold,color:TH.text}}>⚽{t.goals} 🎯{t.assists}</div><div style={{fontSize:11,color:TH.warning,fontWeight:FW.bold}}>{t.rating}</div></div>)}</div>
      </Card>
      {_dk&&<div style={{fontSize:10,color:TH.faint,textAlign:"center",marginBottom:8}}>↑↓ seleziona · Enter / 1·2·3 scegli</div>}
      <div className="cpm-offers" style={{marginBottom:12}}>
        {offers.map((club,i)=>{
          const isSel=i===selIdx;
          return(
            <Card key={club.id} interactive border={isSel?TH.primary:i===0?TH.primaryBorder:undefined} bg={isSel?TH.primaryTint:undefined} style={{outline:isSel?`2px solid ${TH.primary}`:"none",transition:"outline .1s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <TeamBadge team={club} size={44}/>
                  <div><div style={{fontWeight:700,fontSize:14,color:TH.text}}>{club.name}</div><div style={{fontSize:11,color:TH.muted,marginTop:1}}>{club.nat} · Prestigio {club.p}</div></div>
                </div>
                <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                  {i===0&&<div style={{fontSize:10,color:TH.primary,fontWeight:700}}>⭐ TOP</div>}
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    {_dk&&<span className="kbd">{i+1}</span>}
                    <Btn onClick={()=>onChoose(club)} v={isSel?"primary":"secondary"}>Scegli →</Btn>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


/* ========================================
   TRIAL FLOW
======================================== */
// Sprint PROV — avversari dei provini sempre diversi (pool, nessuno granata per non confondersi con l'eroe)
const TRIAL_OPPONENTS=[
  {id:"t_reg",n:"Selezione Regionale",name:"Selezione Regionale",a:"REG",abbr:"REG",p:52,c:"#475569",col:"#475569",c2:"#fff",nat:"🇮🇹"},
  {id:"t_acc",n:"Accademia Nord",name:"Accademia Nord",a:"ACN",abbr:"ACN",p:50,c:"#1d4ed8",col:"#1d4ed8",c2:"#fff",nat:"🇮🇹"},
  {id:"t_rap",n:"Rappresentativa Provinciale",name:"Rappresentativa Provinciale",a:"RAP",abbr:"RAP",p:49,c:"#0d9488",col:"#0d9488",c2:"#fff",nat:"🇮🇹"},
  {id:"t_pol",n:"Polisportiva Centro",name:"Polisportiva Centro",a:"POL",abbr:"POL",p:51,c:"#ea580c",col:"#ea580c",c2:"#fff",nat:"🇮🇹"},
  {id:"t_giov",n:"Giovanili Élite",name:"Giovanili Élite",a:"GIO",abbr:"GIO",p:53,c:"#7c3aed",col:"#7c3aed",c2:"#fff",nat:"🇮🇹"},
  {id:"t_sud",n:"Selezione Sud",name:"Selezione Sud",a:"SUD",abbr:"SUD",p:50,c:"#0891b2",col:"#0891b2",c2:"#fff",nat:"🇮🇹"},
  {id:"t_cef",n:"Centro Federale",name:"Centro Federale",a:"CEF",abbr:"CEF",p:54,c:"#16a34a",col:"#16a34a",c2:"#fff",nat:"🇮🇹"},
];
function TrialFlow({player:initPlayer,onComplete,resume}){
  // Sprint PROV — la squadra dell'eroe ai provini è in GRANATA
  const _granata={id:"trial-hero",n:"Selezione Granata",name:"Selezione Granata",a:"GRA",abbr:"GRA",p:50,c:"#7a1f2b",col:"#7a1f2b",c2:"#e8c98f",nat:"🇮🇹",lg:"Provini"};
  const[player,setPlayer]=useState(()=>({...initPlayer,club:_granata}));
  /* [7.330.0 collaudo PO «se non termino i provini non viene salvata la carriera»] i provini RIPRENDONO da dove
     erano (prop resume dal boot: provino corrente, risultati, stessi avversari) e ogni avanzamento viene
     PERSISTITO su cpm-trial-prog → chiudere l'app a metà non azzera più la creazione. */
  /* [7.331.0 collaudo PO «I provini non sono quattro!»] alla ripresa il provino corrente è DERIVATO dai risultati
     (res.length), NON dal tn salvato: chiudendo l'app nella schermata POST i risultati erano già n+1 mentre tn
     non era ancora avanzato → si rigiocava un provino e il riepilogo ne mostrava 4. I risultati sono cappati a 3
     e l'append ha la guardia. */
  const _res0=(resume&&Array.isArray(resume.res))?resume.res.slice(0,3):[];
  const[trialNum,setTrialNum]=useState(()=>Math.min(_res0.length,2)),[results,setResults]=useState(()=>_res0),[phase,setPhase]=useState("pre");
  const[oppList]=useState(()=>{try{if(resume&&Array.isArray(resume.opps)&&resume.opps.length===3){const l=resume.opps.map(id=>TRIAL_OPPONENTS.find(o=>o.id===id)).filter(Boolean);if(l.length===3)return l;}}catch(_e){}return shuffle(TRIAL_OPPONENTS).slice(0,3);});
  useEffect(()=>{try{let _sl=null;try{const _pv=JSON.parse(safeLS.get("cpm-trial-prog")||"null");if(_pv&&Number.isInteger(_pv.slot))_sl=_pv.slot;}catch(_e2){}safeLS.set("cpm-trial-prog",JSON.stringify({ph:"trial",p:initPlayer,tn:trialNum,res:results,opps:oppList.map(o=>o.id),slot:_sl}));}catch(_e){}},[trialNum,results]);// eslint-disable-line — [7.330.0] persistenza avanzamento provini · [7.332.0] lo SLOT dell'envelope precedente si PRESERVA (TrialFlow non conosce currentSlot; perderlo = firma su slot 0 = carriera sovrascritta)
  const opp=oppList[trialNum]||oppList[0];
  const _kbHint=(typeof window!=="undefined"&&window.matchMedia&&!window.matchMedia('(hover: none)').matches);/* [7.331.0 collaudo PO «elimina da cellulare la scritta Enter!»] l'hint tastiera esiste solo dove esiste una tastiera */
  // [7.8.6 collaudo PO «guida i nuovi giocatori nei primi passi»] guida contestuale per provino + onboarding
  const _totG=results.reduce((a,r)=>a+(r.goals||0),0),_totA=results.reduce((a,r)=>a+(r.assists||0),0);
  const _scoutGuide=[
    {t:"Sei al primo dei 3 provini",d:"Le tribune sono piene di osservatori. È la tua occasione: mettiti in mostra! Ogni gol, assist e giocata brillante pesa sul giudizio degli scout."},
    {t:"Secondo provino",d:"Gli osservatori ti hanno notato. Conferma con continuità e personalità: fanno la differenza agli occhi dei club."},
    {t:"Ultimo provino — decisivo",d:"È il momento della verità. Un'ultima grande prestazione può convincere un club a metterti sotto contratto: dai tutto!"},
  ][trialNum]||{t:"Provino",d:"Mostra le tue qualità."};
  const _howTips=[
    {i:"👆",t:"Scegli l'azione",d:"Ad ogni occasione tocca il bottone dell'azione che preferisci — tiro, dribbling, passaggio…"},
    {i:"🎯",t:"Piazzati su misura",d:"Su rigori e punizioni scegli lo STILE del tiro — angolato, potente, all'incrocio… — ognuno con il suo rischio e la sua ricompensa."},/* [7.331.0 collaudo PO «in nessuna azione si può mirare»] la barra di mira non esiste più dal SET-PIECE 2.0 (7.51.0) */
    {i:"⭐",t:"Conta tutto",d:"Gol, assist e voto finale decidono le offerte dei club alla fine dei tre provini."},
  ];
  const onMatchEnd=r=>{if(results.length>=3)return;/* [7.331.0] mai un 4° risultato */const res={goals:r.goals,assists:r.assists,rating:r.rating};const nr=[...results,res];setResults(nr);setPlayer(p=>({...p,totalGoals:(p.totalGoals||0)+r.goals,totalAssists:(p.totalAssists||0)+r.assists,totalMatches:(p.totalMatches||0)+1}));setPhase("post");if(trialNum>=2)setTimeout(()=>onComplete(nr),300);};
  useEffect(()=>{
    if(phase==="match")return;
    const h=e=>{
      if(_scrive386(e))return;/* [7.386.0] chi scrive tiene la tastiera */
      if(e.key!=="Enter"&&e.key!==" ")return;
      if(e.target.tagName==="INPUT"||e.target.tagName==="BUTTON")return;
      e.preventDefault();
      if(phase==="pre"){setPhase("match");}
      else if(phase==="post"){const done=trialNum>=2;if(!done){setTrialNum(n=>n+1);setPhase("pre");}}
    };
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[phase,trialNum]);// eslint-disable-line
  // 5.70.0 — FIX "il campo del provino non si vede": durante il match, come in carriera, togli padding/scroll
  //   allo .cpm-scroll così il contenitore ha ALTEZZA reale. Senza questo, su mobile il campo (flex:1 con
  //   overflow:hidden) collassava a 0 e il canvas 3D veniva ritagliato → campo invisibile.
  useEffect(()=>{
    const el=document.querySelector('.cpm-scroll');if(!el)return;
    if(phase==="match"){el.style.padding="0";el.style.overflowY="hidden";}
    else{el.style.padding="";el.style.overflowY="";}
    return()=>{el.style.padding="";el.style.overflowY="";};
  },[phase]);
  // 5.70.0 — contenitore match a ALTEZZA PIENA (come la carriera: height:100% + flex:1 attorno a LiveMatch),
  //   così il campo 3D riceve un'altezza reale invece di collassare.
  if(phase==="match")return<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column"}}><div style={{textAlign:"center",padding:"6px 0",flexShrink:0}}><div style={{display:"inline-block",padding:"4px 16px",borderRadius:20,background:TH.bgBlue,border:"1px solid #bfdbfe",fontSize:11,color:TH.primary,fontWeight:700}}>🎯 PROVINO {trialNum+1}/3</div></div><div style={{flex:1,minHeight:0,overflow:"hidden",display:"flex",flexDirection:"column"}}><MatchErrorBoundary><LiveMatch player={player} opponent={opp} context="trial" onMatchEnd={onMatchEnd}/></MatchErrorBoundary></div></div>;
  if(phase==="post"){const last=results[results.length-1],done=trialNum>=2;
    const _r=+(last.rating||6),_g=last.goals||0,_a=last.assists||0;
    const _emoji=_r>=7.5?"🌟":_r>=6.5?"👏":_r>=5.5?"🙂":"😕";
    const _title=_r>=7.5?"Prestazione da predestinato!":_r>=6.5?"Bella prova, gli scout ti hanno notato":_r>=5.5?"Prova sufficiente":"Provino in salita";
    const _react=_r>=7.5?"Gli osservatori prendono appunti freneticamente: un talento così non passa inosservato.":_r>=6.5?"Diversi osservatori annuiscono in tribuna. Sei sul taccuino dei club.":_r>=5.5?"Una prova onesta. C'è margine per convincere del tutto i club nei prossimi provini.":"Non la tua giornata migliore. Testa alta: hai ancora occasioni per ribaltare il giudizio.";
    return <div style={{width:"100%",maxWidth:560,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:46,marginBottom:4,animation:"pulse87 1.4s ease-in-out infinite"}}>{_emoji}</div>
        <div style={{fontSize:10,color:TH.warning,letterSpacing:2,fontWeight:800}}>PROVINO {trialNum+1} DI 3 · COMPLETATO</div>
        <div style={{fontSize:16,fontWeight:900,color:TH.text,marginTop:6}}>{_title}</div>
      </div>
      <style>{`@keyframes pulse87{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
      {/* stat tiles */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
        {[{e:"⚽",l:"Gol",v:_g},{e:"🎯",l:"Assist",v:_a},{e:"⭐",l:"Voto",v:last.rating,c:TH.warning}].map(s=>(
          <Card key={s.l} style={{padding:"14px 8px",textAlign:"center"}}>
            <div style={{fontSize:20}}>{s.e}</div>
            <div style={{fontSize:24,fontWeight:900,color:s.c||TH.text,marginTop:2}}>{s.v}</div>
            <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:0.5,marginTop:2}}>{s.l}</div>
          </Card>
        ))}
      </div>
      {/* scout reaction */}
      <Card style={{padding:"14px",marginBottom:12,borderLeft:"4px solid "+(_r>=6.5?TH.success:_r>=5.5?TH.warning:TH.danger)}}>
        <div style={{display:"flex",gap:11,alignItems:"flex-start"}}><div style={{fontSize:22,lineHeight:1}}>🔭</div><div style={{flex:1,fontSize:12,color:TH.muted,lineHeight:1.5}}>{_react}</div></div>
      </Card>
      {/* progress dots */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginBottom:14}}>{[0,1,2].map(i=><React.Fragment key={i}>{i>0&&<div style={{width:22,height:2,background:i<=trialNum?TH.success:TH.cardBorder,borderRadius:2}}/>}<div style={{width:26,height:26,borderRadius:"50%",background:i<=trialNum?TH.success:"transparent",border:`2px solid ${i<=trialNum?TH.success:TH.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:i<=trialNum?"#fff":TH.faint}}>{i<=trialNum?"✓":i+1}</div></React.Fragment>)}</div>
      {done?<div style={{textAlign:"center",color:TH.success,fontSize:12.5,fontWeight:700,marginBottom:12}}>✅ Tre provini completati! I club stanno valutando le offerte…</div>:<div style={{textAlign:"center",color:TH.muted,fontSize:12,marginBottom:12}}>Manca ancora {2-trialNum} {2-trialNum===1?"provino":"provini"} per convincere i club.{_kbHint?<span style={{color:TH.faint}}> [Enter]</span>:null}</div>}
      <Btn onClick={done?()=>{}:()=>{setTrialNum(n=>n+1);setPhase("pre");}} v={done?"success":"primary"} fw style={{padding:"14px",fontSize:15}}>{done?"⏳ Calcolo delle offerte…":`Vai al Provino ${trialNum+2} →`}</Btn>
    </div>;}
  return <div style={{width:"100%",maxWidth:560,margin:"0 auto"}}>
    {/* header + progress dots */}
    <div style={{textAlign:"center",marginBottom:14}}>
      <div style={{fontSize:10,color:TH.warning,letterSpacing:2,fontWeight:800,marginBottom:10}}>IL PROVINO · PASSO {trialNum+1} DI 3</div>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8}}>{[0,1,2].map(i=><React.Fragment key={i}>{i>0&&<div style={{width:22,height:2,background:i<=trialNum?TH.warning:TH.cardBorder,borderRadius:2}}/>}<div style={{width:30,height:30,borderRadius:"50%",background:i<trialNum?TH.success:i===trialNum?TH.warning:"transparent",border:`2px solid ${i<trialNum?TH.success:i===trialNum?TH.warning:TH.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:i<=trialNum?"#fff":TH.faint}}>{i<trialNum?"✓":i+1}</div></React.Fragment>)}</div>
    </div>
    {/* VS hero */}
    <Card style={{padding:0,overflow:"hidden",marginBottom:12}} shadow>
      <div style={{background:"linear-gradient(135deg,#7a1f2b 0%,#4a1119 100%)",padding:"18px 12px",display:"flex",alignItems:"center",justifyContent:"space-around",position:"relative"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(120% 90% at 50% 0%,rgba(255,255,255,0.10),transparent 60%)",pointerEvents:"none"}}/>
        <div style={{textAlign:"center",flex:1,minWidth:0,zIndex:1}}><TeamBadge team={_granata} size={44}/><div style={{fontSize:12,fontWeight:800,color:"#fff",marginTop:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>La tua Selezione</div><div style={{fontSize:9,color:"#e8c98f"}}>La squadra dei provinanti</div></div>
        <div style={{fontSize:22,fontWeight:900,color:"rgba(255,255,255,0.55)",padding:"0 8px",zIndex:1}}>VS</div>
        <div style={{textAlign:"center",flex:1,minWidth:0,zIndex:1}}><TeamBadge team={opp} size={44}/><div style={{fontSize:12,fontWeight:800,color:"#fff",marginTop:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{opp.n}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.6)"}}>Avversario del provino</div></div>
      </div>
    </Card>
    {/* scout guidance */}
    <Card style={{padding:"14px",marginBottom:12,borderLeft:"4px solid "+TH.warning}}>
      <div style={{display:"flex",gap:11,alignItems:"flex-start"}}>
        <div style={{fontSize:24,lineHeight:1}}>🔭</div>
        <div style={{flex:1}}><div style={{fontWeight:800,color:TH.text,fontSize:13.5}}>{_scoutGuide.t}</div><div style={{color:TH.muted,fontSize:12,marginTop:4,lineHeight:1.5}}>{_scoutGuide.d}</div></div>
      </div>
    </Card>
    {/* onboarding — come si gioca (full sul 1° provino, poi si nasconde) */}
    {trialNum===0&&<Card style={{padding:"14px",marginBottom:12}}>
      <div style={{fontSize:10,color:TH.muted,letterSpacing:1.5,textTransform:"uppercase",marginBottom:11,fontWeight:700}}>💡 Come si gioca — i primi passi</div>
      {_howTips.map((t,i)=><div key={i} style={{display:"flex",gap:11,marginBottom:i<_howTips.length-1?11:0,alignItems:"flex-start"}}><div style={{fontSize:19,width:24,textAlign:"center"}}>{t.i}</div><div style={{flex:1}}><div style={{fontWeight:700,fontSize:12.5,color:TH.text}}>{t.t}</div><div style={{fontSize:11.5,color:TH.muted,marginTop:1,lineHeight:1.45}}>{t.d}</div></div></div>)}
    </Card>}
    {trialNum>0&&<div style={{textAlign:"center",fontSize:12,color:TH.muted,marginBottom:12}}>Finora ai provini: <strong style={{color:TH.text}}>{_totG} gol</strong> · <strong style={{color:TH.text}}>{_totA} assist</strong></div>}
    <Btn onClick={()=>setPhase("match")} fw style={{padding:"15px",fontSize:15}}>⚡ Inizia il provino{_kbHint?<span style={{opacity:0.6,fontSize:12}}> [Enter]</span>:null}</Btn>
  </div>;
}

/* ========================================
   AI SETTINGS CARD
======================================== */
function AISettingsCard({player}){
  const[key,setKey]=useState(()=>safeLS.get("cpm-api-key")||"");
  const[mock,setMock]=useState(()=>safeLS.get("cpm-ai-mock")==="true");
  const[saved,setSaved]=useState(false);
  const saveKey=()=>{
    safeLS.set("cpm-api-key",key.trim());
    setSaved(true);setTimeout(()=>setSaved(false),2000);
    console.log("[CPM-AI] API key saved");
  };
  const toggleMock=()=>{
    const next=toggleAIMock();
    setMock(next);
  };
  return(
    <Card style={{padding:"14px"}}>
      <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>🤖 Impostazioni AI</div>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:11,color:TH.text,marginBottom:4}}>Anthropic API Key</div>
        <div style={{display:"flex",gap:6}}>
          <input type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="sk-ant-api03-…" style={{flex:1,background:TH.surface2,border:"1px solid "+TH.cardBorder,borderRadius:8,color:TH.text,padding:"7px 10px",fontFamily:"inherit",fontSize:11}}/>
          <button onClick={saveKey} style={{padding:"7px 12px",borderRadius:8,border:"none",background:saved?TH.success:TH.primary,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{saved?"✅":"Salva"}</button>
        </div>
        <div style={{fontSize:10,color:TH.faint,marginTop:4}}>La chiave è salvata solo in localStorage del tuo browser.</div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid "+TH.cardBorder}}>
        <div>
          <div style={{fontSize:11,color:TH.text,fontWeight:600}}>Mock Mode</div>
          <div style={{fontSize:10,color:TH.faint}}>Risposte simulate (test senza API)</div>
        </div>
        <button onClick={toggleMock} style={{padding:"5px 14px",borderRadius:20,border:"none",background:mock?"#dcfce7":TH.cardBorder,color:mock?TH.success:TH.muted,fontWeight:700,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{mock?"ON":"OFF"}</button>
      </div>
      {player&&player.aiData?.lastOpponentTactic&&(
        <div style={{marginTop:8,padding:"8px 10px",background:TH.surface2,borderRadius:8,border:"1px solid "+TH.cardBorder}}>
          <div style={{fontSize:10,color:TH.primary,fontWeight:700,marginBottom:2}}>ULTIMA TATTICA AVVERSARIA</div>
          <div style={{fontSize:11,color:TH.text}}>{player.aiData.lastOpponentTactic.formation} · Pressing {player.aiData.lastOpponentTactic.pressure}%</div>
          <div style={{fontSize:10,color:TH.muted}}>{player.aiData.lastOpponentTactic.reasoning}</div>
        </div>
      )}
    </Card>
  );
}

/* ========================================
   NATIONAL CALLUP SCREEN  (Sprint 7)
======================================== */
const NAT_DATA={
  "Italia":    {flag:"🇮🇹",col:"#003399",col2:"#fff",opp:"Brasile"},
  "Spagna":    {flag:"🇪🇸",col:"#AA151B",col2:"#F1BF00",opp:"Germania"},
  "Francia":   {flag:"🇫🇷",col:"#002395",col2:"#fff",opp:"Portogallo"},
  "Germania":  {flag:"🇩🇪",col:"#1a1a1a",col2:"#FFCE00",opp:"Francia"},
  "Inghilterra":{flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",col:"#003c8f",col2:"#fff",opp:"Argentina"},
  "Portogallo":{flag:"🇵🇹",col:"#006600",col2:"#EE1111",opp:"Spagna"},
  "Brasile":   {flag:"🇧🇷",col:"#009C3B",col2:"#FFDF00",opp:"Argentina"},
  "Argentina": {flag:"🇦🇷",col:"#74ACDF",col2:"#fff",opp:"Brasile"},
  "Olanda":    {flag:"🇳🇱",col:"#FF4F00",col2:"#fff",opp:"Germania"},
  "Belgio":    {flag:"🇧🇪",col:"#1a1a1a",col2:"#FDDA24",opp:"Francia"},
};
const NAT_CLUB_DATA={
  "Italia":{id:"it-nt",a:"ITA",p:82,c:"#003399",c2:"#fff",nat:"🇮🇹"},
  "Spagna":{id:"es-nt",a:"ESP",p:90,c:"#AA151B",c2:"#F1BF00",nat:"🇪🇸"},
  "Francia":{id:"fr-nt",a:"FRA",p:85,c:"#002395",c2:"#fff",nat:"🇫🇷"},
  "Germania":{id:"de-nt",a:"GER",p:87,c:"#1a1a1a",c2:"#FFCE00",nat:"🇩🇪"},
  "Inghilterra":{id:"en-nt",a:"ENG",p:88,c:"#003c8f",c2:"#fff",nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿"},
  "Portogallo":{id:"pt-nt",a:"POR",p:80,c:"#006600",c2:"#EE1111",nat:"🇵🇹"},
  "Brasile":{id:"br-nt",a:"BRA",p:91,c:"#009C3B",c2:"#FFDF00",nat:"🇧🇷"},
  "Argentina":{id:"ar-nt",a:"ARG",p:89,c:"#74ACDF",c2:"#fff",nat:"🇦🇷"},
  "Olanda":{id:"nl-nt",a:"NED",p:78,c:"#FF4F00",c2:"#fff",nat:"🇳🇱"},
  "Belgio":{id:"be-nt",a:"BEL",p:79,c:"#1a1a1a",c2:"#FDDA24",nat:"🇧🇪"},
};
function NationalCallupScreen({data,onPlay}){
  const{nation,isFirst,newCaps,opp:dataOpp}=data;
  const nd=NAT_DATA[nation]||{flag:"🏳",col:"#1e40af",col2:"#fff",opp:"Avversario"};
  const{flag,col,col2}=nd;
  const opp=dataOpp||nd.opp||"Avversario";
  const oppNd=NAT_DATA[opp]||{flag:"🏳",col:"#888",col2:"#fff"};
  const[shown,setShown]=React.useState(false);
  React.useEffect(()=>{const t=setTimeout(()=>setShown(true),60);return()=>clearTimeout(t);},[]);
  return(
    <div style={{width:"100%",background:`linear-gradient(160deg,${col}30 0%,#050810 55%)`,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 16px 32px",boxSizing:"border-box",opacity:shown?1:0,transition:"opacity 0.45s",overflowY:"auto"}}>
      {isFirst&&<div style={{background:`${TH.accent}20`,border:`1px solid ${TH.accent}55`,borderRadius:8,padding:"7px 18px",marginBottom:18,fontSize:10,color:TH.accent,letterSpacing:2,textTransform:"uppercase",fontWeight:800,textAlign:"center"}}>★ Traguardo di Carriera — Prima Convocazione ★</div>}
      <div style={{fontSize:54,marginBottom:4,lineHeight:1}}>{flag}</div>
      <div style={{fontSize:10,color:TH.muted,letterSpacing:2.5,textTransform:"uppercase",marginBottom:4}}>Convocazione Nazionale</div>
      <div style={{fontSize:26,fontWeight:900,color:"#fff",marginBottom:2}}>Nazionale {nation}</div>
      <div style={{fontSize:12,color:TH.muted,marginBottom:22}}>Cap #{newCaps} · Amichevole Internazionale</div>
      {/* Jersey */}
      <div style={{marginBottom:22,filter:`drop-shadow(0 0 20px ${col}99)`}}>
        <svg width="92" height="104" viewBox="0 0 92 104">
          <defs>
            <linearGradient id="ng" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={col}/>
              <stop offset="100%" stopColor={col} stopOpacity="0.75"/>
            </linearGradient>
          </defs>
          <path d="M23 13 Q11 16 7 26 L2 47 L21 49 L21 92 L71 92 L71 49 L90 47 L85 26 Q81 16 69 13 Q59 7 46 6 Q33 7 23 13Z" fill="url(#ng)" stroke={col2} strokeWidth="1.6"/>
          <path d="M31 13 Q38 22 46 22 Q54 22 61 13" fill="none" stroke={col2} strokeWidth="1.4"/>
          <text x="46" y="65" textAnchor="middle" fill={col2} fontSize="21" fontWeight="900" fontFamily="Arial,sans-serif">10</text>
        </svg>
      </div>
      {/* Pre-match info */}
      <Card style={{width:"100%",maxWidth:360,padding:"14px 16px",marginBottom:20}}>
        <div style={{fontSize:10,color:TH.muted,letterSpacing:2,textTransform:"uppercase",textAlign:"center",marginBottom:12}}>Prossima Partita</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <div style={{textAlign:"center",flex:1}}>
            <div style={{fontSize:28,lineHeight:1,marginBottom:4}}>{flag}</div>
            <div style={{fontSize:11,fontWeight:700,color:TH.text}}>{nation}</div>
          </div>
          <div style={{textAlign:"center",padding:"8px 14px",background:"rgba(255,255,255,0.05)",borderRadius:8}}>
            <div style={{fontSize:24,fontWeight:900,color:TH.muted}}>VS</div>
          </div>
          <div style={{textAlign:"center",flex:1}}>
            <div style={{fontSize:28,lineHeight:1,marginBottom:4}}>{oppNd.flag}</div>
            <div style={{fontSize:11,fontWeight:700,color:TH.text}}>{opp}</div>
          </div>
        </div>
      </Card>
      {/* Boosts preview */}
      <Card style={{width:"100%",maxWidth:360,padding:"12px 16px",marginBottom:24}}>
        <div style={{fontSize:10,color:TH.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Bonus dopo la partita</div>
        <div style={{display:"flex",justifyContent:"space-around"}}>
          {[{l:"Popolarità",v:"+8",e:"📈",c:TH.success},{l:"Valore",v:"+€0.15M",e:"💶",c:TH.warning},{l:"Morale",v:"+12",e:"😊",c:TH.accent}].map(b=>(
            <div key={b.l} style={{textAlign:"center"}}>
              <div style={{fontSize:16,marginBottom:2}}>{b.e}</div>
              <div style={{fontSize:15,fontWeight:800,color:b.c}}>{b.v}</div>
              <div style={{fontSize:10,color:TH.muted}}>{b.l}</div>
            </div>
          ))}
        </div>
      </Card>
      <Btn onClick={onPlay} v="green" fw style={{padding:"14px",fontSize:15,maxWidth:360,fontWeight:800}}>
        🏟️ Gioca la Partita
      </Btn>
    </div>
  );
}

/* ========================================
   RETIREMENT UTILITIES + CAREER END SCREEN  (Sprint 9)
======================================== */
function calcLegacyScore(p){
  const goals=p.totalGoals||0;
  const assists=p.totalAssists||0;
  const trophies=(p.trophies||[]).length;
  const caps=p.nationalCaps||0;
  const history=p.history||[];
  const peakOvr=history.reduce((mx,h)=>Math.max(mx,h.ovr||0),p.ovr||60);
  const seasons=Math.max(0,(p.season||1)-1);
  let score=0;
  score+=Math.min(goals*2,300);
  score+=Math.min(assists,100);
  score+=trophies*80;
  score+=Math.min(caps*10,150);
  score+=clamp((peakOvr-65)*5,0,150);
  score+=Math.min(seasons*5,100);
  return Math.round(clamp(score,0,1000));
}
function getLegacyGrade(score){
  if(score>=900)return{label:"Leggenda Assoluta",e:"👑",color:"#7c3aed"};
  if(score>=750)return{label:"Campione",e:"🏆",color:TH.txAmber};
  if(score>=600)return{label:"Professionista Eccellente",e:"⭐",color:TH.txBlue};
  if(score>=400)return{label:"Onesta Carriera",e:"✅",color:"#16a34a"};
  if(score>=200)return{label:"Carriera Solida",e:"💪",color:"#4b5563"};
  return{label:"Inizio Promettente",e:"🌱",color:"#6b7280"};
}
function generateRetirementBio(p,legacyScore){
  const name=p.name||"Il giocatore";
  const seasons=proCareerOf(p).seasons/* [7.272.0] solo le stagioni da professionista */;
  const goals=p.totalGoals||0;
  const matches=proCareerOf(p).matches/* [7.272.0] presenze pro, Primavera esclusa */;
  const trophies=(p.trophies||[]).length;
  const caps=p.nationalCaps||0;
  const clubs=[...new Set((p.history||[]).map(h=>h.club).filter(Boolean))];
  const lastClub=p.club?.n||clubs[clubs.length-1]||"–";
  const grade=getLegacyGrade(legacyScore);
  let bio=`${name} ha disputato ${seasons} stagioni da professionista, realizzando ${goals} gol in ${matches} presenze.`;
  /* [7.453.0 collaudo PO «scrivi meglio questo box, istituzionali che significa??»] La riga diceva
     «Ha conquistato 33 titolo istituzionali»: due guasti in una riga sola. (1) Il plurale di «titolo» non
     e' mai stato scritto — il ternario che doveva produrlo restituiva stringa vuota in ENTRAMBI i rami,
     quindi restava «titolo» anche con 33. (2) «istituzionali» non vuol dire niente: in bacheca ci sono
     campionati, coppe nazionali, trofei europei e titoli con la Nazionale, che sono cose diverse e vanno
     dette per nome. Il tipo e' gia' su ogni trofeo (type: int/euro/cup, altrimenti campionato), lo stesso
     che il diario usa per ordinare i momenti di una vita: qui si limita a leggerlo. */
  if(trophies>0){
    const _tr453=p.trophies||[];
    const _n453=(f)=>_tr453.filter(f).length;
    const _naz=_n453(t=>t&&(t.type==="int"||t.isNational)),_eur=_n453(t=>t&&t.type==="euro"),
          _cop=_n453(t=>t&&t.type==="cup"),_cam=trophies-_naz-_eur-_cop;
    const _voci=[];
    if(_cam>0)_voci.push(`${_cam} campionat${_cam>1?"i":"o"}`);
    if(_cop>0)_voci.push(`${_cop} copp${_cop>1?"e":"a"} nazional${_cop>1?"i":"e"}`);
    if(_eur>0)_voci.push(`${_eur} ${_eur>1?"trofei europei":"trofeo europeo"}`);
    if(_naz>0)_voci.push(`${_naz} titol${_naz>1?"i":"o"} con la Nazionale`);
    const _elenco=_voci.length>1?_voci.slice(0,-1).join(", ")+" e "+_voci[_voci.length-1]:_voci[0];
    bio+=trophies===1?` In bacheca ${_elenco}.`:` In bacheca ${trophies} trofei: ${_elenco}.`;
  }
  if(caps>0)bio+=` ${caps} cap${caps>1?"s":""} con la Nazionale.`;
  if(clubs.length>1)bio+=` Ha vestito la maglia di ${clubs.slice(-3).join(", ")}.`;
  bio+=` Ultima squadra: ${lastClub}. Legacy score: ${legacyScore} — "${grade.label}".`;
  return bio;
}

function CareerEndScreen({retData,onNewGame,onNewGamePlus}){
  const{player:p,legacyScore}=retData;
  const grade=getLegacyGrade(legacyScore);
  // [6.58.0] CERIMONIA DI RITIRO — tributo d'addio animato (flash-safe) prima del riepilogo. Saltata con reduced-motion.
  const _reduceCer=(typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [cer,setCer]=useState(!_reduceCer);
  const [cer2,setCer2]=useState(false);// [7.20.0] atto II: la lettera d'addio + maglia ritirata
  const bio=generateRetirementBio(p,legacyScore);
  /* [7.20.0 L'ADDIO AL CALCIO — backlog favola] atto II della cerimonia: LETTERA D'ADDIO in prima persona
     (derivata dai fatti VERI della carriera) + MAGLIA RITIRATA dal club dove sei stato bandiera (≥5 stagioni
     e ≥60 gol con la stessa maglia — stesso criterio dell'arco «La bandiera» 7.18). Zero campi save. */
  const _flagClub=(()=>{try{const by={};(p.history||[]).forEach(h=>{if(!h||!h.clubId)return;by[h.clubId]=by[h.clubId]||{id:h.clubId,n:h.club,seasons:0,goals:0};by[h.clubId].seasons++;by[h.clubId].goals+=(h.goals||0);});const best=Object.values(by).sort((a,b)=>(b.seasons*100+b.goals)-(a.seasons*100+a.goals))[0];if(best){const _db56=(typeof CLUBS!=="undefined")&&CLUBS.find(c=>c.id===best.id);if(_db56)best.n=_db56.n;}/* [7.257.0 screenshot PO «squadra sbagliata!»] le stagioni U18 condividono l'id del club madre e il nome veniva dalla PRIMA entry dello storico («FC Salernum Primavera», quella del provino): il club del cuore e la maglia ritirata sono del club SENIOR — nome risolto dal DB per id */return best&&best.seasons>=5&&best.goals>=60?best:null;}catch(_e){return null;}})();
  const _firstClub=(p.history||[])[0]?.club||p.club?.n||"il mio primo club";
  const _totG=p.totalGoals||p.goals||0,_totM=p.totalMatches||p.matches||0,_totS=Math.max(1,(p.season||1)-1);
  const trophies=p.trophies||[];
  const history=p.history||[];
  const bestSeason=history.reduce((best,h)=>(!best||h.goals>best.goals)?h:best,null);
  const clubs=[...new Set(history.map(h=>h.club).filter(Boolean))];
  const pct=Math.round((legacyScore/1000)*100);
  // Sprint 58: extra career data
  const pAwards=p.playerAwards||{palloneOros:[],scarpaOros:[],youngYears:[],seasonRecords:[],leagueMvpYears:[],leagueTopScorerYears:[],teamOfYearYears:[]};
  const hasPrizes=(pAwards.palloneOros.length+pAwards.scarpaOros.length+pAwards.youngYears.length+(pAwards.leagueMvpYears||[]).length+(pAwards.leagueTopScorerYears||[]).length+(pAwards.teamOfYearYears||[]).length)>0;
  // Pick up to 5 most important diary moments
  /* [7.257.0 screenshot PO «non credo siano questi i momenti indimenticabili»] su una carriera lunga il diario
     (cap 80) conserva solo l'ultima stagione, e il bucket «milestone» portava dentro legami/verifiche
     trimestrali: i momenti di una vita ora vengono PRIMA dai TROFEI persistenti (p.trophies, mai sfrattati —
     nazionale > europei > titoli > coppe) e poi dai soli tipi FORTI del diario. */
  const diaryMoments=(()=>{try{const out=[];
    const _wT=t=>t&&t.type==="int"?5:(t&&t.type==="euro"?4:(t&&t.type==="cup"?2:3));
    const _tr=[...(p.trophies||[])].sort((a,b)=>_wT(b)-_wT(a)||(a.season||0)-(b.season||0));
    _tr.slice(0,3).forEach(t=>out.push({e:"🏆",color:"#f59e0b",headline:`${t.league||"Titolo"}${t.isNational?" con la Nazionale":""}`,body:`${t.club||""} · S.${t.season||"?"}`}));
    const _dS=(p.diary||[]).filter(d=>["pallone_oro","scarpa_oro","cup_trophy","euro_mondiale_trophy","first_national","first_goal","hattrick"].includes(d.type)).slice(-5).reverse();
    for(const d of _dS){if(out.length>=5)break;out.push(d);}
    return out.slice(0,5);}catch(_e){return (p.diary||[]).slice(-5).reverse();}})();
  // Hall of Fame: find last known league from history
  const lastLg=history.length>0?history[history.length-1].league||history[history.length-1].lg||history[history.length-1].club:null;/* [6.74.0 QA-16] le entry di history salvano `league`, non `lg` → il lookup falliva sempre e la Hall of Fame confrontava un bomber di qualsiasi lega coi record della PRIMA lega del DB */
  const lgRecord=lastLg?(Object.entries(LEAGUE_RECORDS).find(([k])=>k===lastLg||history.some(h=>(h.league||h.lg)===k))||[null,null])[1]:null;
  const lgRecordAuto=lgRecord||Object.values(LEAGUE_RECORDS)[0]||null;
  const hofScorers=lgRecordAuto?[...lgRecordAuto.topScorers,{name:p.name,goals:p.totalGoals||0,isPlayer:true}].sort((a,b)=>b.goals-a.goals):[];
  const hofPos=hofScorers.findIndex(s=>s.isPlayer);
  // Journalist final verdicts
  const journalists=p.journalists||[];
  const jVerdict=(j,ji)=>{
    /* [7.259.0 screenshot PO «stesso giudizio al ritiro!»] due fix sul 7.257.0: (1) la variante per-NOME
       collide (3 bucket hash su 3 firme ≈ 78% di doppioni — Ferretti ed Esposito uscivano identici) → ora
       l'indice del giornalista entra nel seed: 3 firme = 3 varianti DISTINTE per costruzione; (2) la fascia
       era keyed SOLO sulla fiducia → una LEGGENDA (612 gol, Mondiale+Europeo) liquidata come «un buon
       giocatore»: la carriera fa da PAVIMENTO (legacy≥600 → mai sotto la fascia «solida», ≥400 → mai
       sotto la media) — la fiducia bassa può raffreddare il tono, non riscrivere i fatti. */
    const t=Math.max(j.trust||50,legacyScore>=600?68:legacyScore>=400?48:0);
    const _vi=(Math.abs(hashStr("jv|"+(p.name||"")))+(ji||0))%3;const B=(a,b,c)=>[a,b,c][_vi];
    if(t>=80)return{txt:B(`"${p.name} è stato un privilegio da raccontare. Una carriera straordinaria."`,`"Uno di quelli che segnano un'epoca. Le sue notti resteranno negli archivi."`,`"Ho consumato la penna a scrivere di lui. Un fuoriclasse vero."`),color:"#16a34a"};
    if(t>=65)return{txt:B(`"Carriera solida, tanti momenti memorabili. Un giocatore che ha onorato la maglia."`,`"Professionista esemplare: quando contava, c'era quasi sempre."`,`"Il pubblico si fidava di lui. Una firma affidabile del nostro calcio."`),color:TH.txBlue};
    if(t>=45)return{txt:B(`"Nel complesso una carriera di buon livello. Non sempre costante, ma con picchi notevoli."`,`"Alti e bassi, come tutte le storie vere. I picchi però erano da grande."`,`"Un buon giocatore che a tratti è sembrato un campione."`),color:"#ca8a04"};
    if(t>=30)return{txt:B(`"Poteva dare di più. Il talento c'era, la continuità meno."`,`"Il potenziale era superiore ai numeri. Resta un po' di rammarico."`,`"Le premesse erano da top: il rendimento, non sempre."`),color:TH.txAmber};
    return{txt:B(`"Una carriera travagliata. I numeri parlano chiaro — poteva andare meglio."`,`"Tra infortuni e polemiche, non è mai davvero decollato."`,`"Il talento non basta: serviva più fame."`),color:"#dc2626"};
  };
  // [6.58.0] CERIMONIA DI RITIRO — overlay celebrativo (tap-to-continue); riusa keyframes esistenti (flash-safe)
  if(cer){
    const _tCount=Math.min(8,(p.trophies||[]).length);
    const _cSeasons=Math.max(0,(p.season||1)-1);
    const _cGoals=p.totalGoals||p.goals||0,_cMatches=p.totalMatches||p.matches||0;
    const _conf=Array.from({length:16},(_,i)=>({left:(i*61+13)%100,delay:((i%8)*0.24).toFixed(2),dur:(2.6+(i%5)*0.4).toFixed(2),col:["#f0b33a","#a3263a","#e0526a","#ffffff"][i%4]}));
    return(
      <div style={{position:"fixed",inset:0,zIndex:60,background:"radial-gradient(circle at 50% 40%,#5e0f1d 0%,#2b0810 82%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,overflow:"hidden",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
        {_conf.map((c,i)=><div key={i} style={{position:"absolute",top:"-8vh",left:c.left+"%",width:9,height:14,borderRadius:2,background:c.col,opacity:0,animation:`confettiFall ${c.dur}s linear ${c.delay}s infinite`}}/>)}
        <div style={{position:"absolute",width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle,rgba(240,179,58,0.20),transparent 70%)",animation:"trophyGlow 3.2s ease-in-out infinite",pointerEvents:"none"}}/>
        <div style={{position:"relative",textAlign:"center",maxWidth:440}}>
          <div style={{fontSize:64,lineHeight:1,animation:"trophyRise 1s ease-out both"}}>👟</div>
          <div style={{fontSize:12,letterSpacing:6,color:"#f0b33a",fontWeight:800,marginTop:8,animation:"celebTitle .8s ease-out .3s both"}}>FINE DI UN'ERA</div>
          <div style={{fontSize:30,fontWeight:900,color:"#fff",marginTop:6,animation:"celebTitle .8s ease-out .5s both"}}>Grazie, {p.name}</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.82)",marginTop:8,animation:"celebTitle .8s ease-out .7s both"}}>{_cSeasons} stagion{_cSeasons===1?"e":"i"} · {_cGoals} gol · {_cMatches} presenze{(p.age||0)?` · ${p.age} anni`:""}</div>
          <div style={{marginTop:16,display:"inline-flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:999,background:grade.color+"22",border:`1.5px solid ${grade.color}`,animation:"celebTitle .8s ease-out .9s both"}}>
            <span style={{fontSize:22}}>{grade.e}</span>
            <span style={{fontSize:14,fontWeight:900,color:grade.color}}>{grade.label}</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.65)"}}>· {legacyScore}/1000</span>
          </div>
          {_tCount>0&&<div style={{marginTop:18,display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap"}}>
            {Array.from({length:_tCount}).map((_,i)=><span key={i} style={{fontSize:26,animation:`trophyRise .7s ease-out ${(1.1+i*0.12).toFixed(2)}s both`}}>🏆</span>)}
          </div>}
          <div style={{marginTop:_tCount>0?18:22,fontSize:12,color:"rgba(255,255,255,0.7)",fontStyle:"italic",lineHeight:1.5,animation:"celebTitle .8s ease-out 1.25s both"}}>“{p.name} lascia il calcio giocato. Lo stadio è in piedi: un ultimo giro di campo, sotto una pioggia di applausi.”</div>
          <div style={{marginTop:20,animation:"celebTitle .8s ease-out 1.5s both"}}>
            <button onClick={()=>{setCer(false);setCer2(true);}} style={{padding:"13px 30px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#a3263a,#5e0f1d)",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 26px rgba(0,0,0,0.45)"}}>Continua →</button>
          </div>
        </div>
      </div>
    );
  }
  if(cer2){/* [7.20.0] ATTO II — la lettera d'addio (+ maglia ritirata se bandiera) */
    return(
      <div style={{position:"fixed",inset:0,zIndex:60,background:"radial-gradient(circle at 50% 30%,#141b2e 0%,#070a14 78%)",display:"flex",alignItems:"center",justifyContent:"center",padding:22,overflow:"auto",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
        <div style={{maxWidth:460,width:"100%",textAlign:"center",padding:"18px 0"}}>
          <div style={{fontSize:11,letterSpacing:5,color:"#93c5fd",fontWeight:800,marginBottom:10,animation:"celebTitle .7s ease-out both"}}>✍️ LA LETTERA D'ADDIO</div>
          <div style={{textAlign:"left",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:14,padding:"16px 18px",animation:"celebTitle .8s ease-out .2s both"}}>
            <div style={{fontSize:12.5,color:"rgba(255,255,255,0.88)",lineHeight:1.75,fontStyle:"italic"}}>
              «Cari tifosi,<br/>
              tutto è cominciato con un pallone e un provino al {_firstClub}. Da quel giorno sono passate {_totS} stagioni, {_totM} presenze e {_totG} gol — ma i numeri non raccontano gli abbracci, i cori sotto la curva, le notti in cui non riuscivo a dormire prima di una finale.<br/>
              {(_flagClub?`Al ${_flagClub.n} lascio il pezzo più grande del mio cuore: ${_flagClub.seasons} stagioni e ${_flagClub.goals} gol insieme non si dimenticano. `:"A ogni maglia che ho vestito lascio un pezzo di cuore. ")}
              {(p.life&&(p.life.stage==="sposato"||p.life.stage==="genitore"))?`Il grazie più grande va a ${p.life.name}${p.life.stage==="genitore"?" e ai nostri figli":""}: le notti difficili le avete vinte voi, prima di me. `:""}{/* [7.29.0 ONDA 4 §S14] payoff della vita privata */}
              Oggi appendo le scarpette al chiodo. Grazie di tutto — siete stati voi la mia carriera.»
            </div>
            <div style={{fontSize:12,color:"#93c5fd",fontWeight:800,marginTop:10,textAlign:"right"}}>— {p.name}</div>
          </div>
          {_flagClub&&(
            <div style={{marginTop:14,background:"linear-gradient(135deg,#3b2a07,#5b420c)",border:"1px solid #d4a017",borderRadius:14,padding:"14px 16px",animation:"celebTitle .8s ease-out .55s both"}}>
              <div style={{fontSize:34,marginBottom:4}}>👕</div>
              <div style={{fontSize:14,fontWeight:900,color:"#fde68a"}}>Il {_flagClub.n} RITIRA la maglia numero {p.jerseyNum||10}</div>
              <div style={{fontSize:11,color:"rgba(253,230,138,0.75)",marginTop:4}}>Nessuno la vestirà più: il tuo numero sale nella storia del club, accanto alle bandiere di sempre.</div>
            </div>
          )}
          <div style={{marginTop:18,animation:"celebTitle .8s ease-out .8s both"}}>
            <button onClick={()=>setCer2(false)} style={{padding:"13px 30px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#1d4ed8,#172554)",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 26px rgba(0,0,0,0.45)"}}>Rivivi la carriera →</button>
          </div>
        </div>
      </div>
    );
  }
  return(
    <div style={{width:"100%",paddingBottom:40}}>
      {/* Header */}
      <div style={{textAlign:"center",padding:"28px 16px 16px"}}>
        <div style={{fontSize:56,marginBottom:8}}>👟</div>
        <h1 style={{fontSize:24,fontWeight:900,margin:"0 0 4px",color:TH.text}}>Fine Carriera</h1>
        <p style={{fontSize:13,color:TH.muted,margin:0}}>{p.name} · {p.age} anni · {Math.max(0,(p.season||1)-1)} stagioni</p>
      </div>

      {/* Legacy grade */}
      <Card style={{marginBottom:12,padding:"18px",textAlign:"center"}} bg={grade.color+"11"} border={grade.color+"44"}>
        <div style={{fontSize:36,marginBottom:4}}>{grade.e}</div>
        <div style={{fontSize:18,fontWeight:900,color:grade.color,marginBottom:6}}>{grade.label}</div>
        <div style={{fontSize:11,color:TH.muted,marginBottom:10}}>Legacy Score: {legacyScore} / 1000</div>
        <div style={{background:TH.cardBorder,borderRadius:10,height:8,overflow:"hidden"}}>
          <div style={{width:`${pct}%`,height:"100%",background:grade.color,borderRadius:10}}/>
        </div>
      </Card>

      {/* Career stats */}
      <Card style={{marginBottom:12,padding:"14px 16px"}}>
        <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>📊 Statistiche Carriera</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,textAlign:"center",marginBottom:bestSeason?10:0}}>
          {[{l:"Stagioni",v:Math.max(0,(p.season||1)-1),e:"📅"},{l:"Partite",v:p.totalMatches||0,e:"🎮"},{l:"Gol",v:p.totalGoals||0,e:"⚽"},{l:"Assist",v:p.totalAssists||0,e:"🎯"},{l:"Trofei",v:trophies.length,e:"🏆"},{l:"Caps Naz.",v:p.nationalCaps||0,e:"🌍"}].map(s=>(
            <div key={s.l} style={{background:TH.bg,borderRadius:8,padding:"8px 4px"}}>
              <div style={{fontSize:18}}>{s.e}</div>
              <div style={{fontSize:20,fontWeight:900,color:TH.text}}>{s.v}</div>
              <div style={{fontSize:10,color:TH.muted}}>{s.l}</div>
            </div>
          ))}
        </div>
        {bestSeason&&<div style={{background:TH.bgAmber,borderRadius:8,padding:"8px 10px",fontSize:11,color:TH.txAmber}}>⭐ Miglior stagione: S.{bestSeason.season} con {bestSeason.goals} gol · Livello {bestSeason.ovr}</div>}
      </Card>

      {/* Sprint 58: Premi vinti */}
      {hasPrizes&&(
        <Card style={{marginBottom:12,padding:"14px 16px"}}>
          <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>🏅 Premi e Riconoscimenti</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {/* Premi Europei */}
            {pAwards.palloneOros.map(s=><div key={"po"+s} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",background:TH.bgAmber,borderRadius:8,border:"1px solid #fde68a"}}><span style={{fontSize:20}}>🏆</span><div><div style={{fontSize:12,fontWeight:800,color:TH.txAmber}}>Trofeo d'Oro</div><div style={{fontSize:10,color:TH.txAmber}}>Stagione {s} — miglior calciatore d'Europa</div></div></div>)}
            {pAwards.scarpaOros.map(s=><div key={"so"+s} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",background:TH.lossBg,borderRadius:8,border:"1px solid #fca5a5"}}><span style={{fontSize:20}}>👟</span><div><div style={{fontSize:12,fontWeight:800,color:TH.lossFg}}>Re dei Bomber</div><div style={{fontSize:10,color:TH.lossFg}}>Stagione {s} — capocannoniere d'Europa</div></div></div>)}
            {/* Premi di Lega (Sprint 134) */}
            {(pAwards.leagueMvpYears||[]).map(s=><div key={"lm"+s} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",background:"#eef2ff",borderRadius:8,border:"1px solid #c7d2fe"}}><span style={{fontSize:20}}>🏅</span><div><div style={{fontSize:12,fontWeight:800,color:"#4338ca"}}>MVP della Stagione</div><div style={{fontSize:10,color:"#3730a3"}}>Stagione {s} — miglior calciatore del campionato</div></div></div>)}
            {(pAwards.leagueTopScorerYears||[]).map(s=><div key={"lt"+s} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",background:TH.bgGreen,borderRadius:8,border:"1px solid #bbf7d0"}}><span style={{fontSize:20}}>⚽</span><div><div style={{fontSize:12,fontWeight:800,color:TH.txGreen}}>Capocannoniere del Campionato</div><div style={{fontSize:10,color:TH.txGreen}}>Stagione {s} — bomber dell'anno</div></div></div>)}
            {pAwards.youngYears.map(s=><div key={"yy"+s} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",background:"#ede9fe",borderRadius:8,border:"1px solid #c4b5fd"}}><span style={{fontSize:20}}>💎</span><div><div style={{fontSize:12,fontWeight:800,color:"#5b21b6"}}>Giovane dell'Anno</div><div style={{fontSize:10,color:"#4c1d95"}}>Stagione {s} — miglior Under 23 del campionato</div></div></div>)}
            {(pAwards.teamOfYearYears||[]).map(s=><div key={"ty"+s} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",background:TH.bgBlue,borderRadius:8,border:"1px solid #bae6fd"}}><span style={{fontSize:20}}>📋</span><div><div style={{fontSize:12,fontWeight:800,color:TH.txBlue}}>Squadra dell'Anno</div><div style={{fontSize:10,color:TH.txBlue}}>Stagione {s} — selezionato nell'XI ideale della lega</div></div></div>)}
          </div>
        </Card>
      )}

      {/* Sprint 58: Hall of Fame */}
      {lgRecordAuto&&hofPos>=0&&(
        <Card style={{marginBottom:12,padding:"14px 16px",background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)",border:"1px solid rgba(99,102,241,0.3)"}}>
          <div style={{fontSize:10,color:"rgba(165,180,252,0.7)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>🏟️ Hall of Fame — {lgRecordAuto.league||"Lega"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {hofScorers.slice(0,Math.min(8,hofPos+2)).map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:8,background:s.isPlayer?"rgba(99,102,241,0.25)":"rgba(0,0,0,0.2)",border:s.isPlayer?"1px solid rgba(99,102,241,0.5)":"none"}}>
                <div style={{width:24,textAlign:"center",fontSize:s.isPlayer?14:11,fontWeight:900,color:i===0?"#fbbf24":i===1?"#9ca3af":i===2?"#b45309":"rgba(165,180,252,0.6)"}}>{i+1}</div>
                <div style={{flex:1,fontSize:12,fontWeight:s.isPlayer?900:600,color:s.isPlayer?"#e0e7ff":"rgba(165,180,252,0.7)"}}>{s.name}{s.isPlayer?" 👈":""}</div>
                <div style={{fontSize:13,fontWeight:900,color:s.isPlayer?"#818cf8":"rgba(165,180,252,0.6)"}}>{s.goals}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:8,textAlign:"center",fontSize:11,color:"rgba(165,180,252,0.7)",fontWeight:700}}>
            {hofPos===0?"🥇 Sei il capocannoniere di tutti i tempi della lega!":hofPos<=2?`🥈 #${hofPos+1} nella storia della lega — straordinario!`:`#${hofPos+1} nella storia con ${p.totalGoals||0} gol in carriera`}
          </div>
        </Card>
      )}

      {/* Sprint 58: Momenti indimenticabili */}
      {diaryMoments.length>0&&(
        <Card style={{marginBottom:12,padding:"14px 16px"}}>
          <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>✨ Momenti Indimenticabili</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {diaryMoments.map((d,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:(d.color||"#6b7280")+"22",border:`1.5px solid ${d.color||"#6b7280"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{d.e||"📌"}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:800,color:TH.text}}>{d.headline}</div>
                  <div style={{fontSize:10,color:TH.muted}}>{d.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sprint 58: Verdetto dei giornalisti */}
      {journalists.length>0&&(
        <Card style={{marginBottom:12,padding:"14px 16px"}}>
          <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>📰 Verdetto della Stampa</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {journalists.map((j,i)=>{
              const v=jVerdict(j,i);/* [7.259.0] l'indice garantisce 3 voci distinte */
              return(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{fontSize:22,flexShrink:0}}>{j.icon||"📰"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:800,color:TH.text}}>{j.name} <span style={{color:j.color||TH.muted,fontWeight:400,fontSize:10}}>· {j.paper}</span></div>
                    <div style={{fontSize:11,color:v.color,fontStyle:"italic",lineHeight:1.5,marginTop:2}}>{v.txt}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Sprint 58: Rivale finale */}
      {p.rival&&(()=>{
        const r=p.rival;
        const isAhead=(p.totalGoals||0)>(r.totalGoals||0);const isTie=(p.totalGoals||0)===(r.totalGoals||0);/* [7.462.0] tre esiti, non due */
        return(
          <Card style={{marginBottom:12,padding:"14px 16px",background:"linear-gradient(135deg,#1e1b4b,#312e81)",border:"1px solid rgba(99,102,241,0.3)"}}>
            <div style={{fontSize:10,color:"rgba(165,180,252,0.7)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>🆚 Il Verdetto Finale — Tu vs {r.name}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",textAlign:"center"}}>
              <div style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"10px 6px"}}>
                <div style={{fontSize:10,color:"rgba(74,222,128,0.7)",marginBottom:2}}>TU</div>
                <div style={{fontSize:26,fontWeight:900,color:isAhead?"#4ade80":"#f87171"}}>{p.totalGoals||0}</div>
                <div style={{fontSize:8,color:"rgba(165,180,252,0.4)"}}>GOL CARRIERA</div>
              </div>
              <div style={{fontSize:18,color:"rgba(165,180,252,0.4)"}}>⚔️</div>
              <div style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"10px 6px"}}>
                <div style={{fontSize:10,color:"rgba(99,102,241,0.7)",marginBottom:2}}>{r.name.split(" ")[0].toUpperCase()}</div>
                <div style={{fontSize:26,fontWeight:900,color:isTie?"#fbbf24":(!isAhead?"#4ade80":"#f87171")}}>{r.totalGoals||0}</div>
                <div style={{fontSize:8,color:"rgba(165,180,252,0.4)"}}>GOL CARRIERA</div>
              </div>
            </div>
            <div style={{marginTop:10,textAlign:"center",fontSize:12,fontWeight:800,color:isTie?"#fbbf24":(isAhead?"#4ade80":"#f87171")}}>
              {isTie?`🤝 Finita in parità con ${r.name}: ${r.totalGoals||0} gol a testa. Nessuno dei due ha ceduto.`:isAhead?`✅ Hai vinto la sfida con ${r.name}. Sarai ricordato come il migliore.`:`😤 ${r.name} ti ha superato. Ma che battaglia incredibile.`}
            </div>
            <div style={{marginTop:4,textAlign:"center",fontSize:10,color:"rgba(165,180,252,0.5)"}}>
              Relazione: {({sconosciuto:"Sconosciuto",rivale:"🔥 Rivalità accesa",rispettato:"🤝 Rispetto reciproco",amico:"👥 Amicizia"})[r.relationship||"sconosciuto"]}
            </div>
          </Card>
        );
      })()}

      {/* Clubs */}
      {clubs.length>0&&(
        <Card style={{marginBottom:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>🏟️ Club della Carriera</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {clubs.map((c,i)=><div key={i} style={{padding:"4px 10px",borderRadius:20,background:TH.bg,border:`1px solid ${TH.cardBorder}`,fontSize:10,color:TH.text}}>{c}</div>)}
          </div>
        </Card>
      )}

      {/* Trophies */}
      {trophies.length>0&&(
        <Card style={{marginBottom:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>🏆 Albo d'Oro</div>
          {trophies.map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:i<trophies.length-1?"1px solid "+TH.cardBorder:"none"}}>
              <span style={{fontSize:16}}>🏆</span>
              <div><div style={{fontSize:11,fontWeight:700,color:TH.text}}>S.{t.season} · {t.club}</div><div style={{fontSize:10,color:TH.muted}}>{compLbl(t.league)}</div></div>
            </div>
          ))}
        </Card>
      )}

      {/* Biography */}
      <Card style={{marginBottom:16,padding:"14px 16px"}}>
        <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>📖 Biografia</div>
        <p style={{fontSize:11,color:TH.text,lineHeight:1.6,margin:0}}>{bio}</p>
      </Card>

      {/* Actions */}
      <Btn onClick={()=>{const txt=buildCareerCard(p);if(navigator.clipboard){navigator.clipboard.writeText(txt).then(()=>alert("📋 Riepilogo copiato negli appunti!")).catch(()=>alert(txt));}else{alert(txt);}}}/* [6.45.0 RC] .catch: una clipboard bloccata non deve generare una promise rejection non gestita → fallback al testo */ v="ghost" fw style={{padding:"12px",fontSize:13,marginBottom:8}}>
        📋 Copia Riepilogo Carriera
      </Btn>
      {onNewGamePlus&&(()=>{const bonus=legacyScore>=600?{statBoost:3,label:"Leggenda",moraleBoost:15}:legacyScore>=400?{statBoost:2,label:"Veterano",moraleBoost:10}:legacyScore>=200?{statBoost:1,label:"Esperienza",moraleBoost:5}:null;return bonus?(<Btn onClick={()=>onNewGamePlus(bonus)} fw style={{padding:"13px",fontSize:14,marginBottom:10,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",border:"none"}}>🌟 Nuova Partita+ — Bonus {bonus.label} (+{bonus.statBoost} stats)</Btn>):null;})()}
      {onNewGamePlus&&legacyScore>=100&&(<Btn onClick={()=>onNewGamePlus({statBoost:1,label:"Eredità Familiare",moraleBoost:8,generation:true,parentName:p.name,parentTotalGoals:p.totalGoals||0})} v="ghost" fw style={{padding:"12px",fontSize:13,marginBottom:8,border:`1.5px solid #16a34a`,color:"#16a34a"}}>👨‍👦 Gioca come figlio/a di {p.name}</Btn>)}
      <Btn onClick={onNewGame} v="primary" fw style={{padding:"16px",fontSize:15}}>
        🏠 Torna al Menu Principale
      </Btn>
    </div>
  );
}

/* ========================================
   SPRINT 19-20 — Challenges, Locale, Career Export
======================================== */
const CHALLENGES=[
  {id:"scalata",icon:"🏔️",name:"La Scalata",desc:"Vinci il campionato entro la stagione 5.",
   check:p=>(p.trophies||[]).length>0,fail:p=>(p.season||1)>5&&(p.trophies||[]).length===0,reward:"🏆 Scalatore Nato"},
  {id:"bomber",icon:"🔥",name:"Bomber Puro",desc:"Segna 50 gol in una singola stagione.",
   check:p=>(p.goals||0)>=50,fail:()=>false,reward:"⚽ Macchina da Gol"},
  {id:"talento",icon:"💎",name:"Talento Puro",desc:"Raggiungi Livello 90 prima dei 26 anni.",
   check:p=>(p.ovr||60)>=90&&(p.age||17)<26,fail:p=>(p.age||17)>=26&&(p.ovr||60)<90,reward:"🌟 Predestinato"},
  // Sprint 61 — nuove sfide
  {id:"fedele",icon:"❤️",name:"Fedele per Sempre",desc:"Gioca almeno 5 stagioni nello stesso club.",
   check:p=>(p.fanLegend||[]).some(f=>f.seasons>=5),fail:()=>false,reward:"🏟️ Bandiera del Club"},
  {id:"nazionale_star",icon:"🌍",name:"Centurione",desc:"Raggiungi 20 presenze in Nazionale.",
   check:p=>(p.nationalCaps||0)>=20,fail:()=>false,reward:"🌟 Capitano Azzurro"},
  {id:"sempreverde",icon:"🎂",name:"Sempreverde",desc:"Gioca ancora a 34 anni o oltre.",
   check:p=>(p.age||17)>=34&&(p.matches||0)>0&&(p.proStatus||"u18")==="pro",fail:()=>false,reward:"🏅 Immortale"},
  {id:"assist_machine",icon:"🎯",name:"Assist Machine",desc:"Totalizza 75 assist in carriera.",
   check:p=>(p.totalAssists||0)>=75,fail:()=>false,reward:"🎯 Playmaker Leggendario"},
  {id:"scalata_rapida",icon:"🚀",name:"Scalata Rapida",desc:"Vinci un trofeo nelle prime 3 stagioni da pro.",
   check:p=>{const proStart=(p.u18Seasons||0)+1;return(p.trophies||[]).some(t=>(t.season||0)<=proStart+2);},
   fail:p=>((p.season||1)-(p.u18Seasons||0))>3&&(p.trophies||[]).length===0,reward:"⚡ Meteora d'Oro"},
];
const LOCALE={
  IT:{
    tabs:{dashboard:"Home",calendar:"Calendario",standings:"Classifica",training:"Allena",profile:"Profilo"},
    agent:"Agente",
    liveWeek:"⚡ Vivi la Settimana",startSeason:"🏁 Avvia Stagione",startSeasonSub:"ritiro, raduno e presentazioni",rehab:"🏥 Sessione Riabilitazione",weekLived:"✅ Settimana vissuta",advanceWeek:"⏭️ Avanza Settimana",
    season:"Stagione",week:"Settimana",matches:"Partite",goals:"Gol",assists:"Assist",
    morale:"Morale",form:"Forma",coachTrust:"Fiducia mister",popularity:"Popolarità",fatigue:"Fatica",
    contract:"Contratto",salary:"Stipendio",expires:"Scade stagione",
    biography:"Biografia",attributes:"Attributi",careerHistory:"Timeline Stagioni",
    train:"Allena",trainSub:"Migliora i tuoi attributi",skillPts:"Punti crescita",
    standings:"Classifica",topScorer:"Capocannoniere",
    advanceWeekConfirm:"Avanzare alla settimana successiva?",
    noMatchThisWeek:"Nessuna partita questa settimana",
    injuryStop:"settimane di stop",
    playMatch:"Gioca",simulateMatch:"Simula",cancel:"Annulla",
    talkCoach:"Parla col Mister",singleActions:"Azioni singole",
    export:"Esporta salvataggio JSON",toggleDark:"Scuro",toggleLight:"Chiaro",
    langChanged:"Lingua: Italiano 🇮🇹",
    backToCareer:"← Home",backToDashboard:"🏟️ Torna alla Dashboard",
    postMatch:"POST MATCH",
    goalLabel:"Gol",assistLabel:"Assist",ratingLabel:"Voto",
    shots:"Tiri",possession:"Possesso",fouls:"Falli",corners:"Corner",
    ratingExcellent:"Eccellente!",ratingGood:"Buona partita",ratingSufficient:"Sufficiente",ratingPoor:"Da migliorare",
    pressReview:"📰 Rassegna Stampa",
    liveWeekSub:"allenamento, eventi e crescita",
    homeMatch:"Casa",awayMatch:"Trasferta",cup:"Coppa",
    rehabWeeksLeft:"sett. rimanenti",stopWeeksLeft:"sett. di stop rimanenti",
    advanceInjured:"⏭️ Avanza (infortunato)",
    matchPromptTitle:"Hai una partita!",matchPromptCup:"Gara di Coppa!",matchPromptWhat:"cosa vuoi fare?",
    understood:"✅ Capito",cannotPlayInjured:"Non puoi giocare (infortunato)",
    skipAndRecover:"⏭️ Salta e recupera settimana",cancelStay:"rimani in dashboard",
    weekHeader:"Settimana",thisWeek:"Questa settimana",
    weekLivedNote:"La settimana è stata vissuta. Clicca \"Avanza\" per passare alla prossima o gioca la partita prima.",
    rehabCompletedNote:"Sessione completata. Clicca 'Avanza Settimana' per continuare il recupero.",
  },
  EN:{
    tabs:{dashboard:"Home",calendar:"Calendar",standings:"Standings",training:"Training",profile:"Profile"},
    agent:"Agent",
    liveWeek:"⚡ Live Week",startSeason:"🏁 Start Season",startSeasonSub:"camp, gathering and presentations",rehab:"🏥 Rehab Session",weekLived:"✅ Week Lived",advanceWeek:"⏭️ Advance Week",
    season:"Season",week:"Week",matches:"Matches",goals:"Goals",assists:"Assists",
    morale:"Morale",form:"Form",coachTrust:"Coach Trust",popularity:"Popularity",fatigue:"Fatigue",
    contract:"Contract",salary:"Salary",expires:"Expires season",
    biography:"Biography",attributes:"Attributes",careerHistory:"Season Timeline",
    train:"Train",trainSub:"Improve your attributes",skillPts:"Skill Points",
    standings:"Standings",topScorer:"Top Scorer",
    advanceWeekConfirm:"Advance to next week?",
    noMatchThisWeek:"No match this week",
    injuryStop:"weeks out",
    playMatch:"Play",simulateMatch:"Simulate",cancel:"Cancel",
    talkCoach:"Talk to Coach",singleActions:"Single Actions",
    export:"Export save JSON",toggleDark:"Dark",toggleLight:"Light",
    langChanged:"Language: English 🇬🇧",
    backToCareer:"← Home",backToDashboard:"🏟️ Back to Dashboard",
    postMatch:"POST MATCH",
    goalLabel:"Goals",assistLabel:"Assists",ratingLabel:"Rating",
    shots:"Shots",possession:"Possession",fouls:"Fouls",corners:"Corners",
    ratingExcellent:"Excellent!",ratingGood:"Good game",ratingSufficient:"Sufficient",ratingPoor:"Needs work",
    pressReview:"📰 Press Review",
    liveWeekSub:"training, events and growth",
    homeMatch:"Home",awayMatch:"Away",cup:"Cup",
    rehabWeeksLeft:"weeks left",stopWeeksLeft:"weeks out remaining",
    advanceInjured:"⏭️ Advance (injured)",
    matchPromptTitle:"You have a match!",matchPromptCup:"Cup Match!",matchPromptWhat:"what do you want to do?",
    understood:"✅ Got it",cannotPlayInjured:"Can't play (injured)",
    skipAndRecover:"⏭️ Skip and recover week",cancelStay:"stay on dashboard",
    weekHeader:"Week",thisWeek:"This week",
    weekLivedNote:"Week completed. Click 'Advance' to go to the next or play the match first.",
    rehabCompletedNote:"Session completed. Click 'Advance Week' to continue your recovery.",
  },
};
const buildCareerCard=(p)=>{
  const sc=calcLegacyScore(p);const g=getLegacyGrade(sc);
  const seasons=Math.max(0,(p.season||1)-1);
  const clubs=[...new Set((p.history||[]).map(h=>h.club).filter(Boolean))];
  return[
    `⚽ KORWARD ELITE`,
    `${g.e} ${g.label}`,
    `${p.name} · ${p.nation} · ${p.age} anni`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Stagioni: ${seasons}  Presenze: ${p.totalMatches||0}`,
    `Gol: ${p.totalGoals||0}  Assist: ${p.totalAssists||0}`,
    `Trofei: ${(p.trophies||[]).length}  Cap Naz.: ${p.nationalCaps||0}`,
    `Livello: ${p.ovr||60}  Carriera: ${sc}/1000`,
    `━━━━━━━━━━━━━━━━━━━━`,
    clubs.length>0?`Club: ${clubs.join(" → ")}`:"",
    `#KorwardElite #FootballCareerSimulator`,
  ].filter(Boolean).join("\n");
};

/* ========================================
   CAREER APP  (req #9,#10,#12,#13,#14)
======================================== */

// Sprint 52: simulate all non-player cup bracket matches for a given round
const _simCupOtherMatches=(cup,playerClubId,opponentId,playerWon,homeScore,awayScore)=>{
  const cupRound=cup.round||1;
  const roundKey=["r16","quarters","semi","final"][cupRound-1]||`r${cupRound}`;
  const survivors=cup.cupSurvivors||(cup.bracket||[]);
  const otherIds=survivors.filter(id=>id!==playerClubId&&id!==opponentId);
  const getClub=id=>CLUBS.find(c=>c.id===id||c.n===id)||{id,n:String(id||"?"),p:70,c:"#888",a:String(id||"?").slice(0,3).toUpperCase()};
  const bracketMatches=[];
  for(let i=0;i<otherIds.length;i+=2){
    if(!otherIds[i+1])break;
    const hc=getClub(otherIds[i]);const ac=getClub(otherIds[i+1]);
    const _cSd=hashStr(String(cup.season||0)+"|"+cupRound+"|"+String(hc.id)+"|"+String(ac.id))>>>0;// [5.76.0 BUG-6] bracket riproducibile
    const sr=simulateMatch(hc,ac,70,true,_cSd);
    const mWon=sr.won||(sr.drew&&(hashStr("tb|"+_cSd)%1000)/1000<0.55);
    bracketMatches.push({home:otherIds[i],away:otherIds[i+1],homeScore:sr.homeScore,awayScore:sr.awayScore,winner:mWon?otherIds[i]:otherIds[i+1]});
  }
  bracketMatches.push({home:playerClubId,away:opponentId,homeScore,awayScore,winner:playerWon?playerClubId:opponentId,isPlayer:true});
  const nextSurvivors=[...(playerWon?[playerClubId]:[opponentId]),...bracketMatches.filter(m=>!m.isPlayer).map(m=>m.winner)];/* [6.74.0 QA-20] se PERDI, il club che ti elimina deve restare tra i sopravvissuti (prima spariva: survivors dispari, tabellone incoerente) */
  return{roundKey,bracketMatches,nextSurvivors};
};

// [6.74.0 QA-23] dopo l'eliminazione del giocatore il tabellone di Coppa si CONGELAVA a quel turno per tutta
// la stagione (quarti/semi/finale mai simulati, nessun campione → Tab Coppe monco). Questo helper simula i
// turni RESTANTI in modo deterministico (stessi seed di _simCupOtherMatches) e ritorna bracket completo + campione.
const _simCupRemainder=(cup)=>{
  const ROUND_KEYS=["r16","quarters","semi","final"];
  let survivors=[...(cup.cupSurvivors||[])];
  let round=cup.round||1; // round già avanzato oltre quello appena giocato
  const bm={...(cup.cupBracketMatches||{})};
  const getClub=id=>CLUBS.find(c=>c.id===id||c.n===id)||{id,n:String(id||"?"),p:70,c:"#888",a:String(id||"?").slice(0,3).toUpperCase()};
  let guard=0;
  while(survivors.length>1&&round<=4&&guard++<6){
    const rk=ROUND_KEYS[round-1]||("r"+round);
    const ms=[];const nxt=[];
    for(let i=0;i<survivors.length;i+=2){
      if(!survivors[i+1]){nxt.push(survivors[i]);break;}
      const hc=getClub(survivors[i]);const ac=getClub(survivors[i+1]);
      const _cSd=hashStr(String(cup.season||0)+"|"+round+"|"+String(hc.id)+"|"+String(ac.id))>>>0;
      const sr=simulateMatch(hc,ac,70,true,_cSd);
      const mWon=sr.won||(sr.drew&&(hashStr("tb|"+_cSd)%1000)/1000<0.55);
      ms.push({home:survivors[i],away:survivors[i+1],homeScore:sr.homeScore,awayScore:sr.awayScore,winner:mWon?survivors[i]:survivors[i+1]});
      nxt.push(mWon?survivors[i]:survivors[i+1]);
    }
    bm[rk]=ms;survivors=nxt;round++;
  }
  return{cupBracketMatches:bm,winnerId:survivors[0]||null};
};

const CAREER_MILESTONES=[
  {id:"g10",check:p=>(p.totalGoals||0)>=10,txt:"⚽ 10 gol in carriera raggiunti!",color:"#16a34a"},
  {id:"g25",check:p=>(p.totalGoals||0)>=25,txt:"🔥 25 gol in carriera! Bomber in ascesa.",color:"#f59e0b"},
  {id:"g50",big:true,check:p=>(p.totalGoals||0)>=50,txt:"💥 CINQUANTA GOL! Leggenda nascente.",color:"#ef4444",sub:"Traguardo straordinario — sei entrato nella storia del club."},
  {id:"g100",big:true,check:p=>(p.totalGoals||0)>=100,txt:"👑 CENTO GOL! Sei nella storia del calcio.",color:"#7c3aed",sub:"Pochi calciatori raggiungono questa vetta. Sei uno di loro."},
  {id:"m25",check:p=>(p.totalMatches||0)>=25,txt:"👟 25 presenze in carriera!",color:"#0891b2"},
  {id:"m50",check:p=>proCareerOf(p).matches>=50/* [7.272.0] pro-only: la Primavera non conta */,txt:"⚡ 50 partite da professionista!",color:"#0891b2"},
  {id:"m100",big:true,check:p=>(p.totalMatches||0)>=100,txt:"💎 100 PRESENZE! Una carriera vera.",color:"#7c3aed",sub:"Cento battaglie. Cento storie. Una carriera che merita rispetto."},
  {id:"ovr75",check:p=>(p.ovr||60)>=75,txt:"📈 Livello 75 — Giocatore solido e affidabile!",color:"#059669"},
  {id:"ovr80",check:p=>(p.ovr||60)>=80,txt:"🌟 Livello 80 — TOP PLAYER!",color:TH.txAmber},
  {id:"ovr90",big:true,check:p=>(p.ovr||60)>=90,txt:"✨ Livello 90 — FUORICLASSE assoluto!",color:"#7c3aed",sub:"Hai raggiunto la vetta del calcio mondiale. Rispettato da tutti."},
  // [7.8.21 collaudo tester «crea nuove milestone»] tier superiori + assist
  {id:"g150",big:true,check:p=>(p.totalGoals||0)>=150,txt:"🔱 CENTOCINQUANTA GOL! Bomber leggendario.",color:"#be123c",sub:"Un totale che ti mette tra i più grandi realizzatori di sempre."},
  {id:"m200",big:true,check:p=>(p.totalMatches||0)>=200,txt:"🏛️ 200 PRESENZE! Una carriera monumentale.",color:"#7c3aed",sub:"Duecento partite di dedizione. Una bandiera vivente."},
  {id:"a10",check:p=>(p.totalAssists||0)>=10,txt:"🎯 10 assist in carriera — sai far giocare la squadra!",color:"#0891b2"},
  {id:"a25",check:p=>(p.totalAssists||0)>=25,txt:"🎨 25 assist in carriera! Rifinitore di classe.",color:"#f59e0b"},
  {id:"a50",big:true,check:p=>(p.totalAssists||0)>=50,txt:"🖌️ CINQUANTA ASSIST! Un regista offensivo raro.",color:"#7c3aed",sub:"Non solo gol: illumini il gioco per i tuoi compagni."},
  {id:"ovr95",big:true,check:p=>(p.ovr||60)>=95,txt:"🚀 Livello 95 — TRA I MIGLIORI DI SEMPRE!",color:"#be123c",sub:"Pochissimi hanno mai toccato questa vetta. Sei tra loro."},
];
/* Sprint 59 — Classifica Marcatori Live (Sprint 81: fix week guard + name dedup) */
const generateLeagueScorers=(player,opts)=>{
  const week=Math.min((opts&&opts.week)||player.week||1,38);/* [7.9.2 collaudo PO] opts.week → i PREMI leggono la classifica a W38 */
  const season=player.season||1;
  const league=player.club?.lg;
  // Sprint 81: hide until at least 1 matchday played
  if(!league||week<=1)return[];
  const rivals=CLUBS.filter(c=>c.lg===league&&c.id!==player.club?.id).slice(0,17);
  const FNAMES=["Luca","Marco","Diego","Carlos","Ahmed","Kai","Lucas","Leon","Robert","Daniel","Victor","Andre","Erik","Tomas","Marko"];
  const LNAMES=["Gomez","Silva","Bauer","Romano","Moretti","Andersson","Novak","Costa","Laurent","Fischer","Moreau","Nielsen","Ferreira","Petrov","Schmidt"];
  const scorers=rivals.map(c=>{
    const seed=hashStr(c.id+"_"+season+"_s59");
    const seed2=hashStr(c.id+"_ln_"+season+"_s59"); // Sprint 81: separate seed for last name → no duplicates
    const rate=0.30+(c.p||60)/99*0.45;
    // [7.120.0 audit economia] cap alle gare REALI di lega (doppio girone di 18 = 34 giornate). Prima usava
    //   week-1 = 37 a W38 → rivali gonfiati ~9% (≈+2-3 gol) → l'eroe capocannoniere veniva scavalcato in volata.
    const played=Math.min(Math.max(0,week-1),34); // games actually played (cap stagione di lega)
    const goals=Math.max(0,Math.round(rate*played)+((seed%3)-1)); // ±1 swing (was ±2)
    const name=FNAMES[seed%FNAMES.length]+" "+LNAMES[seed2%LNAMES.length];
    return{name,club:(opts&&opts.fullClub)?(c.n||c.a):(c.a||c.n),goals,isPlayer:false};/* [7.9.2] fullClub → nomi estesi per la cerimonia premi */
  });
  scorers.push({name:player.name,club:(opts&&opts.fullClub)?(player.club?.n||player.club?.a||"–"):(player.club?.a||player.club?.n||"–"),goals:leagueGoalsOf(player),isPlayer:true});/* [7.8.28 QA] SOLO gol di lega (i rivali sono stimati su week-1 gare di LEGA; i gol di coppa/europa hanno le loro classifiche 7.8.18) */
  const _sorted=scorers.sort((a,b)=>b.goals-a.goals);
  return (opts&&opts.all)?_sorted:_sorted.slice(0,12);/* [7.9.2] all → lista intera per i premi (l'eroe può essere oltre il 12°) */
};
/* [7.8.18 collaudo tester «le classifiche cannonieri devono essere divise per competizione, i marcatori delle
   coppe consultabili nella relativa sezione»] marcatori di COPPA (nazionale) / EUROPA, deterministici. I gol
   dell'EROE sono REALI, sommati dalle voci di matchHistory marcate (m.cup / m.euro) → stagionali, coerenti con
   la competizione. Gli avversari sono stimati dal prestigio (i club forti vanno avanti nel tabellone → più gare
   → più gol), seedati per stagione. Nessun nuovo campo salvato. */
const generateCupScorers=(player,kind)=>{
  const season=player.season||1,isEuro=kind==="euro",league=player.club?.lg;
  const pool=isEuro
    ?CLUBS.filter(c=>c.p>=68&&c.id!==player.club?.id).sort((a,b)=>b.p-a.p).slice(0,24)
    :CLUBS.filter(c=>c.lg===league&&c.id!==player.club?.id).sort((a,b)=>b.p-a.p).slice(0,16);
  const FNAMES=["Luca","Marco","Diego","Carlos","Ahmed","Kai","Lucas","Leon","Robert","Daniel","Victor","Andre","Erik","Tomas","Marko"];
  const LNAMES=["Gomez","Silva","Bauer","Romano","Moretti","Andersson","Novak","Costa","Laurent","Fischer","Moreau","Nielsen","Ferreira","Petrov","Schmidt"];
  const myG=(player.matchHistory||[]).filter(m=>m&&(isEuro?m.euro:(m.cup&&!m.euro))).reduce((s,m)=>s+(m.goals||0),0);
  // [7.8.20 collaudo tester «la competizione deve ancora iniziare, già così tanti gol?? deve essere realistica»]
  //   i marcatori devono ACCUMULARE col progresso del torneo (come la lega usa week-1), non partire da un totale
  //   fisso. rounds = turni EFFETTIVAMENTE disputati: coppa nazionale = da cup.round/results (R16 non giocato ⇒ 0);
  //   europa = gare di girone + KO giocate. Se 0 turni ⇒ [] (la card non si mostra: «torneo non ancora iniziato»).
  let rounds=0;
  if(isEuro){rounds=((player.euro?.groupResults||[]).length)+((player.euro?.koResults||[]).length)*1.5;}
  else{const _cr=player.cup?.round||1,_played=(player.cup?.results||[]).length;rounds=Math.max(_played,_cr-1);}
  if(rounds<=0)return[];// torneo non ancora iniziato → nessun marcatore
  const scorers=pool.map(c=>{
    const seed=hashStr(c.id+"_"+season+(isEuro?"_eusc18":"_cupsc18")),seed2=hashStr(c.id+"_ln_"+season+(isEuro?"_eu18":"_cup18"));
    // gol ∝ prestigio × turni disputati (i club forti vanno avanti = più gare = più gol). Coppa ~1.6/turno top · Euro ~1.3/turno top
    const rate=(isEuro?0.4:0.5)+(c.p/99)*(isEuro?0.95:1.15);
    const g=Math.max(0,Math.round(rate*rounds)+(rounds>1?((seed%3)-1):0));
    return{name:FNAMES[seed%FNAMES.length]+" "+LNAMES[seed2%LNAMES.length],club:c.a||c.n,goals:g,isPlayer:false};
  });
  scorers.push({name:player.name,club:player.club?.a||player.club?.n||"–",goals:myG,isPlayer:true});
  return scorers.sort((a,b)=>b.goals-a.goals).slice(0,10);
};
/* [6.8.2] COPPA EUROPEA — classifica girone: UNICA fonte per DISPLAY (Tab Coppe) e DECISIONE di
   qualificazione. Prima il display mostrava "Top 2 passano" (posizione) ma la qualificazione era
   decisa da una soglia PUNTI (pts>=5) → un 3° posto con 11pt "passava" comunque. Ora entrambi usano
   questa stessa tabella (riga reale dell'eroe da groupResults + avversari stimati deterministici) →
   qualificato ⟺ TOP 2, coerente con ciò che l'utente vede. */
/* [7.290.0 collaudo PO «le differenze reti sono sballate»] Lo erano, e in modo dimostrabile: la stima degli
   avversari decideva PRIMA l'esito della partita e POI, separatamente, i gol fatti e subiti — due sorteggi
   scollegati. Cosi' una VITTORIA poteva essere registrata con 2 gol fatti e 7 subiti, un PAREGGIO 3-8 e una
   SCONFITTA 9-1. Nello screenshot: Marsiglia 1V·1N con differenza −2 (impossibile: una vittoria piu' un
   pareggio non puo' dare un saldo negativo) e Torino 0V·1N·1S con +3 (impossibile all'opposto). E il girone
   non tornava nemmeno come sistema: la somma delle differenze reti faceva −5 invece di 0, perche' ogni
   squadra veniva inventata per conto suo, senza un avversario dall'altra parte del campo.
   Ora il girone e' un SISTEMA CHIUSO. Si simulano le PARTITE, non le classifiche: per ogni giornata il
   risultato VERO dell'eroe viene accreditato anche a chi l'ha subito (specchiato), e le altre due squadre si
   affrontano fra loro con un punteggio seedato — dal quale l'esito DERIVA, invece di precederlo. Per
   costruzione: nessuna riga incoerente, somma delle differenze reti sempre zero, vittorie totali = sconfitte
   totali, e tutti con le stesse partite giocate. */
const euroGroupTable=(euro,playerClub)=>{
  const _ec=euro?.competition||"UCL";const gr=euro?.groupResults||[];const groupOpps=euro?.groupOpponents||[];
  const _row=(o,isP)=>({fullName:(isP?(playerClub?.n||playerClub?.a):(o?.n||o?.a))||"?",n:(isP?(playerClub?.a||playerClub?.n):(o?.a||o?.n))||"?",nat:(isP?playerClub?.nat:o?.nat)||"",w:0,d:0,l:0,gf:0,ga:0,pts:0,isPlayer:!!isP});
  const me=_row(null,true),rows=groupOpps.map(o=>_row(o,false));
  const _add=(r,gf,ga)=>{if(!r)return;r.gf+=gf;r.ga+=ga;if(gf>ga){r.w++;r.pts+=3;}else if(gf===ga){r.d++;r.pts+=1;}else r.l++;};
  /* i GOL sono la sorgente, l'esito e' la conseguenza: 0 gol 30% · 1 32% · 2 21% · 3 11% · 4 4% · 5 2%,
     inclinato dal divario di prestigio */
  /* ⚠️ avalanche OBBLIGATORIA: `hashStr%100` su seed quasi identici (…|A / …|B, giornate adiacenti) e'
     CLUSTERATO — le due squadre finivano nello stesso secchio e il girone usciva con 16 pareggi su 24.
     Terza ricorrenza della stessa trappola dopo i nomi degli ultras (7.174.0) e i gol del rivale (7.285.0). */
  const _goals=(seed,edge)=>{const _v=hashStr(seed),r=((typeof _mix32==="function")?_mix32(_v):Math.abs(_v))%100,sh=clamp(Math.round(edge*3),-14,14);
    const t=[30,62,83,94,98].map(v=>clamp(v-sh,3,99));
    for(let i=0;i<t.length;i++)if(r<t[i])return i;return 5;};
  gr.forEach((res,k)=>{
    const hs=res.hs||0,as=res.as||0;
    _add(me,hs,as);
    let oi=groupOpps.findIndex(o=>o&&(o.n===res.opp||o.a===res.opp||o.id===res.opp));
    if(oi<0&&groupOpps.length)oi=k%groupOpps.length;/* salvataggi vecchi senza il nome dell'avversario */
    if(oi>=0)_add(rows[oi],as,hs);/* il risultato vero vale anche per chi l'ha subito */
    const altri=groupOpps.map((_,i)=>i).filter(i=>i!==oi);
    for(let j=0;j+1<altri.length;j+=2){
      const A=groupOpps[altri[j]],B=groupOpps[altri[j+1]];
      const sd=_ec+"|"+(A?.id||A?.n||"a")+"|"+(B?.id||B?.n||"b")+"|"+k;
      const ed=(((A?.p)||70)-((B?.p)||70))/20;
      const gA=_goals(sd+"|A",ed),gB=_goals(sd+"|B",-ed);
      _add(rows[altri[j]],gA,gB);_add(rows[altri[j+1]],gB,gA);
    }
  });
  return[me,...rows].sort((a,b)=>b.pts-a.pts||((b.gf-b.ga)-(a.gf-a.ga))||b.gf-a.gf);
};
const euroPlayerTop2=(euro,playerClub)=>{const t=euroGroupTable(euro,playerClub);const i=t.findIndex(r=>r.isPlayer);return i>=0&&i<=1;};
if(_CPM_TEST&&typeof window!=='undefined'){window.euroGroupTable=euroGroupTable;}/* [7.290.0] hook test-only per la probe group-table (spento in store build) */
/* [7.15.0 BUG PESANTE collaudo PO «ottavi di finale mai giocati!»] La transizione girone→KO viveva SOLO in
   doAdvanceWeek (check a W15+/W17+, per giunta DOPO l'early-return di fine stagione): se la 6ª gara del girone
   veniva risolta dal path LIVE (onMatchEnd), da SIMULA (simulateAndAdvance) o dall'auto-sim/infortunio, e le
   settimane restanti non passavano mai dal path principale di doAdvanceWeek, la fase restava "group" per sempre
   → «Qualificati alla fase successiva» a fine stagione ma OTTAVI MAI PROGRAMMATI (zombie). Stessa classe dei bug
   STAB 6.32→6.37 (frammentazione dei path settimanali). UNICA logica condivisa, chiamata da TUTTI i path che
   risolvono una gara di girone + heal in migration. Puro e DETERMINISTICO (avversario/sede seedati da club+stagione
   — «nulla è casuale»); ritorna null se il girone non è completo, altrimenti il patch {calendar?,euro,log}. */
const euroGroupKOPatch=(p)=>{
  try{
    if((p.proStatus||"u18")==="u18"||!p.euro||!p.euro.active||p.euro.phase!=="group")return null;
    const total=((p.euro.groupOpponents||[]).length*2)||6;
    const played=Math.max((p.euro.groupResults||[]).length,(p.calendar||[]).filter(m=>m.type==="euro_group"&&m.played).length);// [6.8.2] conteggio robusto
    if(played<total)return null;
    const sig=euroSig(p.euro.competition);
    if(!euroPlayerTop2(p.euro,p.club))return{euro:{...p.euro,phase:"eliminated",eliminated:true,qualified:false},log:[`❌ ${sig}: eliminato dalla fase a gironi (${p.euro.pts||0} pt).`,...(p.log||[])].slice(0,60)};
    const euroQ={...p.euro,phase:"r16",qualified:true,eliminated:false};
    if((p.calendar||[]).some(m=>m.type==="euro"&&!m.played&&m.euroPhase==="r16"))return{euro:euroQ};// dedup: R16 già in calendario
    const used=(p.euro.groupOpponents||[]).map(o=>o.id);
    const minP=p.euro.competition==="UCL"?82:p.euro.competition==="UEL"?65:52;
    const pool=CLUBS.filter(c=>((((p.leagueOverrides||{})[c.id])||c.lg)!==(p.club?.lg||"Lega A"))&&!c.isU18&&c.p>=minP&&!used.includes(c.id))/* [7.162.0 CAL-F9] override-aware */;
    const sd=Math.abs(hashStr((p.club?.id||"club")+"|r16|"+(p.season||1)));
    const opp=pool.length?pool[sd%pool.length]:(CLUBS.find(c=>c.lg!==(p.club?.lg||"Lega A"))||CLUBS[0]);
    const wk=Math.max(23,(p.week||1)+2);
    if(!opp||wk>37)return{euro:euroQ,log:[`🌍 ${sig}: qualificato agli Ottavi, ma la stagione è al termine — il torneo riprenderà per altri club.`,...(p.log||[])].slice(0,60)};// niente spazio: fase onesta, il rollover chiude
    return{calendar:[...(p.calendar||[]),{matchday:995,week:wk,opponentId:opp.id,opponentName:opp.n,isHome:(sd>>>3)%2===0,played:false,result:null,type:"euro",competition:p.euro.competition,euroPhase:"r16",cupRoundName:"Ottavi di Finale",opponentData:opp}],euro:euroQ,log:[`⭐ ${sig}: qualificato agli OTTAVI DI FINALE! Sfida a ${opp.n} (Settimana ${wk}).`,...(p.log||[])].slice(0,60)};
  }catch(e){return null;}
};
// [6.62.0 collaudo PO «Tab Nazionale — classifica girone»] classifica del girone NAZIONALE (Europeo/Mondiale/Coppa
//   Nazioni): riga reale dell'eroe da groupMatches + avversari stimati deterministicamente (come euroGroupTable),
//   ordinata per pts/DR/GF. `matches` accetta sia {homeScore,awayScore} (euroMondiale) sia {hs,as} (nationsCup).
const natGroupTable=(natName,groupOpponents,matches,tag)=>{
  const gms=matches||[],gopps=groupOpponents||[];
  const _hs=m=>m.homeScore??m.hs??0,_as=m=>m.awayScore??m.as??0;
  const _p={w:0,d:0,l:0,gf:0,ga:0,pts:0};
  gms.forEach(m=>{if(m.won){_p.w++;_p.pts+=3;}else if(m.drew){_p.d++;_p.pts+=1;}else{_p.l++;}_p.gf+=_hs(m);_p.ga+=_as(m);});
  const played=gms.length;
  const est=(nm,slot)=>{const h=n=>Math.abs(hashStr((tag||"nat")+"|"+nm+"|"+slot+"|"+n))%10;let w=0,d=0,l=0,gf=0,ga=0;for(let i=0;i<played;i++){const r=h(i*7+3);if(r<4){w++;gf+=h(i*3+1)+1;ga+=h(i*5);}else if(r<6){d++;gf+=h(i*3)+1;ga+=h(i*5)+1;}else{l++;gf+=h(i*3);ga+=h(i*5+2)+1;}}return{name:nm,w,d,l,gf,ga,pts:w*3+d,isPlayer:false};};
  return[{name:natName,w:_p.w,d:_p.d,l:_p.l,gf:_p.gf,ga:_p.ga,pts:_p.pts,isPlayer:true},...gopps.map((o,i)=>est(typeof o==='string'?o:(o?.n||o?.name||"?"),"g"+i))].sort((a,b)=>b.pts-a.pts||((b.gf-b.ga)-(a.gf-a.ga))||b.gf-a.gf);
};
/* Sprint 62 — Notizie della Lega · [7.31.1 collaudo PO «le notizie sono inventate! devono essere reali!»]
   RISCRITTE: niente più template con club a caso («FC Genova a due punti dalla vetta» quando non era vero) —
   ogni voce è DERIVATA dalla classifica REALE (player.standings) e dalla classifica marcatori REALE
   (generateLeagueScorers): capolista/lotta al titolo, miglior attacco/difesa, crisi dell'ultima, top scorer,
   la TUA posizione. 3 voci ruotate per settimana, tutte vere per costruzione. LEAGUE_NEWS_TEMPLATES resta
   inutilizzata come riferimento storico. */
const generateLeagueNews=(player)=>{
  const league=player.club?.lg;
  if(!league||(player.proStatus||"u18")==="u18")return[];
  const wk=player.week||1;if(wk<=2)return[];
  const sd=[...(player.standings||[])].sort((a,b)=>((b.pts||0)-(a.pts||0))||(((b.gf||0)-(b.ga||0))-((a.gf||0)-(a.ga||0))));
  if(sd.length<4||!((sd[0].played||0)>0))return[];
  const myId=player.club?.id||player.club?.n;
  const nm=t=>t.n||t.name||t.id||"—";
  const items=[];
  const lead=sd[0],sec=sd[1];
  const gap=Math.max(0,(lead.pts||0)-(sec.pts||0));
  items.push({e:"🏆",txt:gap<=2?`Lotta al titolo apertissima: ${nm(sec)} ${gap===0?"a pari punti con":`a ${gap===1?"un punto":gap+" punti"} da`} ${nm(lead)}.`:`${nm(lead)} capolista a quota ${lead.pts||0} punti: +${gap} su ${nm(sec)}.`});
  const bestAtk=[...sd].sort((a,b)=>(b.gf||0)-(a.gf||0))[0];
  if(bestAtk&&(bestAtk.gf||0)>0)items.push({e:"⚽",txt:`Miglior attacco della lega: ${nm(bestAtk)} con ${bestAtk.gf} gol fatti.`});
  const bestDef=[...sd].sort((a,b)=>(a.ga||0)-(b.ga||0))[0];
  if(bestDef)items.push({e:"🧤",txt:`La difesa più solida è del ${nm(bestDef)}: ${bestDef.ga||0} gol subiti in ${bestDef.played||0} giornate.`});
  const last=sd[sd.length-1];
  if(last&&last.id!==myId&&(last.played||0)>3)items.push({e:"📉",txt:`Momento nero per ${nm(last)}: ultimo posto a ${last.pts||0} punti dopo ${last.played||0} giornate.`});
  try{const sc=(typeof generateLeagueScorers==="function")?generateLeagueScorers(player):null;const top=sc&&sc[0];
    if(top&&top.name&&(top.goals||0)>0)items.push({e:"🎯",txt:(top.isPlayer||top.name===player.name)?`Classifica marcatori: in vetta ci sei TU con ${top.goals} reti!`:`${top.name} guida la classifica marcatori con ${top.goals} reti.`});
  }catch(_e){}
  const mineIx=sd.findIndex(t=>t.id===myId||(t.n||t.name)===player.club?.n);
  if(mineIx>=0){const m=sd[mineIx];items.push({e:"📊",txt:`${nm(m)} ${mineIx===0?"in vetta alla classifica":`al ${mineIx+1}° posto`} con ${m.pts||0} punti (${m.wins||0}V ${m.draws||0}N ${m.losses||0}P).`});}
  if(!items.length)return[];
  const s0=Math.abs(hashStr(`${player.season||1}_${wk}_ln731`));
  const out=[];for(let i=0;i<Math.min(3,items.length);i++)out.push(items[(s0+i*2)%items.length]);
  return out.filter((x,i)=>out.findIndex(y=>y.txt===x.txt)===i);
};
/* Sprint 128 — Risultati Internazionali (altri campionati, seeded) */
const generateWorldResults=(player)=>{
  const playerLg=player.club?.lg||"Lega A";
  const TOP_LGS=["Premier Division","Liga Ibérica","Deutsche Liga","Ligue Nationale","Lega A","Liga Oranje"].filter(lg=>lg!==playerLg).slice(0,3);
  const wk=player.week||1;const ss=player.season||1;
  const out=[];
  TOP_LGS.forEach(lg=>{
    const lc=CLUBS.filter(c=>c.lg===lg&&!c.isU18);
    if(lc.length<2)return;
    for(let mi=0;mi<2;mi++){
      let s=Math.abs(hashStr(`wr128_${ss}_${wk}_${lg}_${mi}`));
      const hi=s%lc.length;s=(s*1664525+1013904223)&0x7fffffff;
      const ai=(hi+1+s%Math.max(1,lc.length-1))%lc.length;
      const h=lc[hi];const a=lc[ai];
      s=(s*1664525+1013904223)&0x7fffffff;
      const pd=(h.p||60)/(((h.p||60)+(a.p||60))||120);
      const hg=Math.min(6,Math.round(pd*2.8+(s%4)*0.35));
      s=(s*1664525+1013904223)&0x7fffffff;
      const ag=Math.min(6,Math.round((1-pd)*2.8+(s%4)*0.35));
      out.push({lg,h:h.a||h.n,a:a.a||a.n,hg,ag});
    }
  });
  return out;
};
/* Sprint 129 (Vita dinamica 9.9) — Voci di Mercato settimanali, seeded (stabili per settimana, niente flicker su re-render) */
const MARKET_NEWS_TPL=[
  "💰 {A} prepara un'offerta importante per un big del {B}.",
  "🔄 Si scalda l'asse di mercato {A}–{B}: contatti in corso.",
  "✍️ {A} lavora al rinnovo del proprio capitano.",
  "🎯 {A} cerca un rinforzo per puntare in alto in {LG}.",
  "🔥 Colpo a sorpresa? {A} sogna il fuoriclasse del {B}.",
  "🔭 Gli osservatori del {A} seguono un giovane talento emergente.",
  "📈 {A} valuta una cessione pesante per finanziare il mercato.",
  "🤝 Summit di mercato tra {A} e l'entourage di un obiettivo dichiarato.",
  "⏳ {A} ha fretta di chiudere prima della sfida col {B}.",
];
const generateMarketNews=(player)=>{
  /* [7.31.1 collaudo PO «le notizie sono inventate! devono essere reali!»] via i template che INVENTAVANO
     trattative tra club a caso e l'interesse su di te senza nulla dietro. Ora: la voce PERSONALE esce SOLO
     con un segnale VERO (transferSaga della stagione — col club REALE della saga — o transferListed); le
     voci di lega sono LETTURE di mercato derivate dalla classifica reale (l'ultima cerca rinforzi, la
     capolista blinda, il miglior attacco fa gola) — opinioni fondate sui fatti, mai fatti inventati. */
  const ss=player.season||1,wk=player.week||1;
  const out=[];
  const sg=player.transferSaga;
  if(sg&&sg.season===ss&&sg.club)out.push({txt:`🔭 ${sg.club} ha chiesto informazioni su di te: contatti confermati dal tuo agente.`,col:"#f59e0b",personal:true});
  else if(player.transferListed)out.push({txt:`📋 Sei ufficialmente sulla lista di mercato: il tuo agente sta raccogliendo le proposte.`,col:"#f59e0b",personal:true});
  const sd=[...(player.standings||[])].sort((a,b)=>((b.pts||0)-(a.pts||0))||(((b.gf||0)-(b.ga||0))-((a.gf||0)-(a.ga||0))));
  if(sd.length>=6&&(sd[0].played||0)>0){
    const nm=t=>t.n||t.name||"—";
    const inWin=(wk>=1&&wk<=5)||(wk>=19&&wk<=23);
    const lead=sd[0],last=sd[sd.length-1],pen=sd[sd.length-2];
    const atk=[...sd].sort((a,b)=>(b.gf||0)-(a.gf||0))[0];
    const pool=[
      {txt:`💼 ${nm(last)}, ultimo a ${last.pts||0} punti: la piazza chiede rinforzi ${inWin?"in questa finestra":"per gennaio"}.`,col:"#64748b"},
      {txt:`🛡️ ${nm(lead)} capolista lavora per blindare i suoi titolari: nessuna cessione all'orizzonte.`,col:"#3b82f6"},
      {txt:`🔥 I bomber del ${nm(atk)} — miglior attacco con ${atk.gf||0} gol — fanno gola alle big.`,col:"#ef4444"},
      {txt:`📉 ${nm(pen)} in zona rossa (${pen.pts||0} punti): il DS valuta correttivi sul mercato.`,col:"#b45309"},
    ];
    const s0=Math.abs(hashStr(`mn731_${ss}_${wk}`));
    for(let i=0;i<3;i++)out.push(pool[(s0+i)%pool.length]);
  }
  return out.filter((x,i)=>out.findIndex(y=>y.txt===x.txt)===i).slice(0,4);
};
/* Sprint 66 — Striscia Vittorie helper */
const getWinStreak=(history)=>{
  const recent=[...(history||[])].filter(m=>!m.simulated).reverse();
  if(!recent.length)return{count:0,type:null};
  const t0=recent[0].won?'win':recent[0].drew?'draw':'loss';
  let count=0;
  for(const m of recent){const t=m.won?'win':m.drew?'draw':'loss';if(t!==t0)break;count++;}
  return{count,type:t0};
};
/* Sprint 60 — Verifica Trimestrale del Mister */
const MONTHLY_COACH_REVIEWS=[
  {perf:"excellent",lines:[/* [7.107.0 collaudo PO «dialoghi mister ripetitivi, sempre le stesse risposte»] battute ampliate + choicePool ruotato (3 su ~10) */
    "Sei in un momento di forma straordinaria. Continua così e questa stagione sarà memorabile.",
    "I numeri parlano chiaro: sei tra i migliori in questo momento. Il club è orgoglioso di te.",
    "Non potrei chiedere di meglio. Stai dimostrando ogni settimana chi sei davvero.",
    "Le altre squadre hanno iniziato a studiarti apposta. Nel calcio non esiste complimento più grande.",
    "Ti guardo in allenamento e vedo un altro passo. Chi lavora così trascina tutto lo spogliatoio.",
    "Il presidente mi ha chiesto di te. Gli ho detto una cosa sola: è il nostro faro.",
    "C'è poco da correggere e molto da custodire: gestisci le energie, al resto pensiamo noi.",
    "Quando il pallone scotta lo vuoi tu. È questa la differenza tra un buon giocatore e un leader.",
    "Gli osservatori delle grandi in tribuna ci sono per te. Ma la tua testa deve restare qui, su questa maglia.",
    "Ti dico una cosa da allenatore navigato: questi momenti durano se non smetti di lavorare. Mai.",
    "I compagni ti guardano diverso, ora. Il peso della squadra inizia a passare dai tuoi piedi.",
    "Non ricordo un giocatore così determinante da quando alleno. Godiamocelo, ma con la fame di sempre.",
    "La stampa ti incorona ogni domenica. Io ti chiedo solo di non leggere i giornali e di ascoltare me.",
    "Sei l'esempio che porto ai giovani del vivaio. Sappi che questo, per un tecnico, vale più di dieci gol.",
  ],choicePool:[
    {txt:"💪 Grazie, mister. Non mi fermo qui.",ef:{coachTrust:8,morale:9,form:4}},
    {txt:"😊 È il lavoro di squadra che fa la differenza.",ef:{coachTrust:6,morale:6,popularity:4}},
    {txt:"🔥 Voglio fare ancora meglio da qui alla fine.",ef:{coachTrust:4,morale:7,form:6}},/* [7.273.0 collaudo PO «la frase del girone di ritorno non ha senso se siamo già alla 28ª partita»] la verifica del mister esce a ogni trimestre: una risposta che nomina una FASE precisa della stagione è sbagliata in tre casi su quattro → formula valida sempre */
    {txt:"🎯 Merito anche del suo lavoro. Mi ha reso un giocatore migliore.",ef:{coachTrust:10,morale:5}},
    {txt:"😌 Resto coi piedi per terra: conta solo la prossima partita.",ef:{coachTrust:7,morale:4,form:3}},/* [7.273.0] stessa classe: «la stagione è ancora lunga» è falso alla 34ª */
    {txt:"🏆 Se continuo così, punto a qualcosa di grande quest'anno.",ef:{coachTrust:3,morale:8,popularity:5,form:4}},
    {txt:"🙏 I complimenti mi caricano, ma non voglio montarmi la testa.",ef:{coachTrust:8,morale:6}},
    {txt:"⚡ Sto benissimo fisicamente, posso reggere ritmi ancora più alti.",ef:{coachTrust:5,form:7,fatigue:4}},
    {txt:"🤝 Dedico tutto ai tifosi: senza di loro non spingerei così.",ef:{coachTrust:4,morale:5,popularity:7}},
    {txt:"🧊 Le voci di mercato non mi toccano. Penso solo alla prossima gara.",ef:{coachTrust:9,morale:3},cond:p=>{/* [7.470.0 collaudo PO «dopo un recente trasferimento e' fuori luogo»] NON SI RISPONDE ALLE VOCI DI MERCATO DUE SETTIMANE DOPO AVER FIRMATO. La risposta era sempre nel mazzo, quindi capitava anche a chi si era appena trasferito — e li' non ci sono voci a cui non farsi toccare: c'e' un giocatore che deve ancora ambientarsi. Serve almeno una stagione piena con questo club, la stessa misura d'anzianita' usata per l'impulso di leadership. */try{const _cid=p.club&&p.club.id;return (p.history||[]).filter(h=>h&&h.clubId===_cid).length>=1;}catch(_e){return true;}}},
  ]},
  {perf:"medium",lines:[
    "Non è il tuo momento migliore, ma vedo impegno. Dobbiamo lavorare insieme per sbloccarti.",
    "I numeri sono nella media. So che puoi fare di più — cosa ti frena in questo periodo?",
    "Sei solido, affidabile. Ma non possiamo accontentarci. Il prossimo mese voglio di più.",
    "Il potenziale lo vedo ogni giorno. Ma le partite si vincono con la continuità, non a sprazzi.",
    "Nessun dramma, ma nemmeno alibi: da te mi aspetto un gradino in più a ogni verifica.",
    "A tratti illumini, a tratti sparisci. Trova il modo di restare dentro la partita per 90 minuti.",
    "Ho difeso le tue scelte davanti alla squadra. Ora tocca a te ripagare la fiducia.",
    "La condizione va e viene, la testa no: voglio vederti comandare anche nelle giornate storte.",
    "Ti manca l'ultimo passo, quello che separa il buon giocatore dal titolare inamovibile. Cerchiamolo insieme.",
    "Non voglio l'assistman timido. Voglio quello che si prende la responsabilità di sbagliare per vincere.",
    "In allenamento sei tra i primi. In partita ti nascondi. Perché? Questa è la domanda della settimana.",
    "Ti sto valutando, come valuto tutti. Dammi tre buone gare di fila e cambia tutto, per te.",
    "La media è un posto comodo, ma pericoloso. Da lì si scivola in panchina senza accorgersene.",
    "Ho parlato col preparatore: le gambe ci sono. Manca la scintilla. Quella la metti solo tu.",
  ],choicePool:[
    {txt:"💪 Ha ragione. Alzo il ritmo da domani.",ef:{coachTrust:7,form:5,morale:4}},
    {txt:"😐 Sto trovando il ritmo giusto. Ci vuole pazienza.",ef:{coachTrust:3,morale:3}},
    {txt:"🧠 Ho idee per migliorare. Mi dia fiducia.",ef:{coachTrust:5,form:3,morale:5}},
    {txt:"🔧 Lavorerò sui dettagli che mi chiede. Voglio quel gradino in più.",ef:{coachTrust:8,form:4}},
    {txt:"🗣️ Se mi dà più responsabilità, le dimostro chi sono.",ef:{coachTrust:-2,morale:7,form:4}},
    {txt:"😤 So di poter fare di più. Non la deluderò.",ef:{coachTrust:6,morale:5}},
    {txt:"🤝 Mi metta dove serve alla squadra: io rispondo presente.",ef:{coachTrust:9,morale:2}},
    {txt:"⏳ Mi dia qualche partita e la musica cambia, glielo garantisco.",ef:{coachTrust:4,morale:6,form:3}},
    {txt:"🏋️ Resto dopo gli allenamenti a lavorare sui miei limiti.",ef:{coachTrust:7,form:6,fatigue:6}},
    {txt:"🎧 Ascolto tutto quello che mi dice. Voglio crescere qui.",ef:{coachTrust:8,morale:4}},
  ]},
  {perf:"bad",lines:[
    "Devo essere diretto: questo non è il tuo livello. Dobbiamo parlare seriamente.",
    "Non posso ignorare le ultime settimane. Sei lontano da ciò che mi aspetto. Cosa succede?",
    "Sono preoccupato. Se non cambia qualcosa, dovrò prendere decisioni difficili.",
    "Ti ho tolto dai titolari in qualche gara e non mi è piaciuto farlo. Dammi un motivo per rimetterti.",
    "Lo spogliatoio ha bisogno di te, ma io devo scegliere chi mi dà garanzie. Oggi non me ne dai.",
    "Non guardo il nome sulla maglia, guardo il campo. E il campo ultimamente dice poco.",
    "C'è qualcosa fuori dal campo che ti pesa? Se sì, parliamone. Se no, alza il livello.",
    "Le attenuanti sono finite. Da qui alla prossima verifica voglio fatti, non promesse.",
    "Il presidente mi chiede conto delle prestazioni. Non voglio fare il tuo nome in senso negativo.",
    "Ti ho voluto io in questa rosa. Non farmi passare per quello che ha sbagliato valutazione.",
    "In questo momento un ragazzo della Primavera mi darebbe le stesse garanzie. È dura da sentire, lo so.",
    "Il talento non basta più. Serve fame, corsa, sacrificio. Le tre cose che ultimamente non vedo.",
    "Non ti mollo, ma non posso nemmeno aspettarti in eterno. Il tempo nel calcio è tiranno.",
    "Guardami: io in te credo ancora. Ma devi darmi qualcosa a cui aggrapparmi, e presto.",
  ],choicePool:[
    {txt:"🙏 Ha ragione. Mi allenerò il doppio.",ef:{coachTrust:9,form:5,fatigue:8,morale:-4}},
    {txt:"😤 Sono in un momento difficile ma tornerò.",ef:{coachTrust:2,morale:5}},
    {txt:"🗣️ Ho bisogno di più spazio per esprimermi.",ef:{coachTrust:-4,morale:8,fatigue:-6}},
    {txt:"😔 Mi assumo le mie responsabilità. Cambio marcia.",ef:{coachTrust:8,morale:-2,form:4}},
    {txt:"💬 C'è qualcosa che mi pesa fuori dal campo. Ne parliamo?",ef:{coachTrust:5,morale:6}},
    {txt:"🔥 Mi dia una chance da titolare e le ricambio la fiducia.",ef:{coachTrust:-2,morale:7,form:3}},
    {txt:"🧊 Resto tranquillo: le difficoltà fanno parte del percorso.",ef:{coachTrust:-3,morale:4}},
    {txt:"🏋️ Lavoro extra in palestra e sul campo. Nessun alibi.",ef:{coachTrust:7,form:6,fatigue:10,morale:-3}},
    {txt:"🤝 Non voglio deluderla. Mi dica esattamente cosa cambiare.",ef:{coachTrust:10,morale:-2,form:3}},
    {txt:"😑 Il campo dirà chi ha ragione. Parlo con i fatti.",ef:{coachTrust:-2,morale:6,form:4}},
  ]},
];
// [7.93.0 collaudo PO «biografia non allineata con le vere statistiche + nuove considerazioni (bandiera e capitano
//   della squadra X, 8 stagioni unica squadra della carriera, ecc.)»] biografia DERIVATA dai FATTI REALI: numeri
//   esatti (gol/assist/presenze/stagioni) — via il «Cento gol» generico — + considerazioni identitarie dedotte:
//   BANDIERA (≥5 stagioni nello stesso club + contributo), CAPITANO (isCaptain), FEDELTÀ a un solo club, trofei,
//   presenze in Nazionale, valutazione tecnica. Puro/derivato, zero inventato.
/* [7.472.0 collaudo PO «le conversazioni sono molto ripetitive con il mister»] LA SCELTA DELLA VERIFICA
   TRIMESTRALE, ESTRATTA. Stava in linea dentro l'handler della settimana, quindi non era misurabile: si
   poteva solo GUARDARE il gioco e dire «sembra ripetitivo». Qui e' una funzione pura di (giocatore,
   fascia, settimana) → {battuta, tre risposte}, usata dall'handler VERO e chiamabile da una sonda che
   simula N verifiche di fila intrecciando la memoria. Il difetto, MISURATO cosi', non era il pool (14
   battute per fascia) ma DUE cose:
   (a) LA MEMORIA ERA PIU' CORTA DEL POOL. `recentCoachLines` teneva 10 battute su 14: alla quarta
       stagione il filtro «mai vista di recente» aveva 4 candidate e la finestra scorrevole rimetteva in
       gioco le piu' vecchie — con QUATTRO verifiche a stagione (W8/16/24/32) e' una battuta ripetuta
       ogni tre. Ora la memoria copre l'INTERO pool: prima di rivedere una battuta si esauriscono le
       altre tredici, cioe' tre stagioni e mezzo.
   (b) LA FASCIA ERA UNA SOLA PER TUTTA LA CARRIERA. `perf` nasce dalla FORMA: un titolare in salute sta
       sopra 72 per anni e vede SOLO la fascia «excellent» — due terzi delle battute scritte non gli
       arrivano mai. Non si tocca la fascia (e' il senso del dialogo: il mister commenta come stai
       andando), ma la battuta ora si sceglie dentro la fascia con la stessa regola delle risposte —
       ordine seedato dalla stagione+settimana invece che `pick` casuale — cosi' la sequenza e'
       riproducibile e la rotazione e' completa invece che casuale-con-ripescaggi. */
function pickCoachWeekMsg(p){
  if((p.proStatus||"u18")!=="pro")return null;
      const _f=p.fatigue||0;const _r=(p.matchHistory||[]).slice(-3);
      const _a=_r.length?_r.reduce((s,m)=>s+(m.rating||6.5),0)/_r.length:6.5;
      // [6.85.0 collaudo PO «dialoghi mister ripetitivi»] 3 varianti per fascia, ruotate DETERMINISTICAMENTE
      //   per settimana (stessa settimana ⇒ stessa frase, settimane diverse ⇒ voce diversa).
      /* [7.472.0 collaudo PO «ripetitivo» sulla voce del mister nel riquadro della settimana] ERA UN
         MODULO, NON UNA ROTAZIONE. `hash(stagione|settimana) % 7` e' un'estrazione CON REIMMISSIONE:
         sette frasi pescate a caso ogni settimana si ripetono in media ogni sette, e nulla vieta la
         stessa frase due settimane di fila — che e' esattamente cio' che si legge come «ripetitivo».
         Ora l'ordine e' una PERMUTAZIONE seedata per stagione e fascia, percorsa sull'asse delle
         settimane vere: dentro una fascia si esauriscono tutte e sette prima di rivederne una, e due
         settimane consecutive non possono mai coincidere. Nessun campo nuovo nel salvataggio: l'indice
         e' la settimana stessa. */
      const _lw=(((p.season||1)-1)*38+(p.week||1));
      const _no472=(typeof window!=='undefined'&&window.__CPM_NO472);/* prova del rosso: rimette il modulo con reimmissione */
      const _cmV=(arr,band)=>{if(_no472)return arr[Math.abs(hashStr("cm|"+(p.season||1)+"|"+(p.week||1)))%arr.length];const o=seededShuffle(arr,hashStr("cm|"+(p.season||1)+"|"+band));return o[((_lw%o.length)+o.length)%o.length];};/* [7.107.0] varianti ampliate 3→7 per fascia */
      return _f>85?_cmV(["Sei a pezzi. Riposo assoluto — non si allena in queste condizioni.","Ho visto i dati del GPS: sei in riserva. Questa settimana scarico totale.","Niente eroismi: le gambe vanno ricaricate. Ci penso io col preparatore.","Fermati. Un giocatore spremuto così si fa male: recupero e basta.","Ti guardo camminare e mi basta: questa settimana non tocchi il campo.","Il fisioterapista ti prende in cura. Voglio indietro il giocatore fresco, non l'eroe stanco.","Zero partitelle. Massaggi, sonno e alimentazione: il resto lo rimandiamo."],"kaput")
        :_f>65?_cmV(["Stai spingendo troppo. Lavoro leggero e poi recupero.","Gestiamo il carico: metà campo e piscina, la brillantezza va protetta.","Regime ridotto in settimana: mi servi fresco alla prossima.","Un po' di stanchezza si vede. Alleggeriamo, senza esagerare.","Meglio prevenire: settimana calibrata, niente strappi inutili.","Ti tengo a scartamento ridotto. Alla domenica devi arrivare pimpante.","Occhio ai carichi: la condizione è un tesoro, non la buttiamo via ora."],"stanco")
        :_a>=7.5?_cmV(["Stai volando — intensifico il lavoro tecnico per sfruttare il momento.","Il momento è d'oro: aggiungo rifinitura e palle inattive, cavalchiamolo.","Chi è in fiducia deve toccare più palloni: settimana ad alta intensità tecnica.","Sei in fiducia e si vede: lavoriamo sulle giocate che ti stanno riuscendo.","Non cambio nulla di quello che funziona, ci metto solo un po' di brillantezza in più.","Quando uno è così, va assecondato: più libertà negli esercizi offensivi.","Continua a fare quello che fai. Io aggiungo solo qualche schema per te."],"volo")
        :_a<=5.5?_cmV(["Dobbiamo migliorare. Doppio lavoro tecnico e fisico.","Ripartiamo dalle basi: possesso, movimenti, letture. Testa bassa.","Settimana di lavoro sporco: video, campo e ancora video. Ti rimetto in carreggiata.","Analisi degli errori e poi campo: voglio vederti reagire con i fatti.","Ti serve fiducia: lavoriamo su cose semplici che ti riescano bene.","Rivediamo insieme le ultime gare. Poi si suda per correggere.","Niente panico: torniamo all'essenziale e da lì risaliamo, passo dopo passo."],"crisi")
        :_cmV(["Questa settimana puntiamo su tecnica e fisico. Segui il piano.","Programma standard ma fatto bene: cura i dettagli, fanno la differenza.","Lavoro equilibrato: tattica, ritmo e un occhio al recupero.","Routine collaudata: qualità negli esercizi, testa sul pezzo.","Settimana normale, ma la normalità fatta bene è già tanto.","Manteniamo la barra dritta: allenamento pulito e concentrazione.","Nulla di speciale in programma, se non farlo tutto al 100%."],"norma");

}

function pickCoachReview(p,perf,week){
  const _rev=MONTHLY_COACH_REVIEWS.find(r=>r.perf===perf)||MONTHLY_COACH_REVIEWS[1];
  const _sd=hashStr("cmc|"+(p.season||1)+"|"+(week||1)+"|"+perf);
  const _seenL=(p.recentCoachLines||[]);
  const _lShuf=seededShuffle(_rev.lines,_sd);
  const _lFresh=_lShuf.filter(l=>!_seenL.includes(l));
  const line=(_lFresh.length?_lFresh:_lShuf)[0];
  const _cPool=_rev.choicePool||_rev.choices||[];
  const _seenC=(p.recentCoachChoices||[]);
  const _cShuf=seededShuffle(_cPool,_sd);
  const _cOk=_cShuf.filter(c=>{try{return !c.cond||c.cond(p);}catch(_e){return false;}});/* [7.470.0] le risposte possono avere una CONDIZIONE di contesto, come gia' l'hanno eventi e impulsi: una battuta giusta al momento sbagliato e' una battuta sbagliata */
  const _cFresh=_cOk.filter(c=>!_seenC.includes(c.txt));
  /* si COMPLETA con le meno recenti invece di buttare via la freschezza appena non bastano tre: prima,
     con `_cFresh.length<3`, si ricadeva sull'intero mazzo e le risposte fresche trovate andavano perse */
  const choices=[..._cFresh,..._cOk.filter(c=>_cFresh.indexOf(c)<0),..._cShuf].filter((c,i,a)=>a.indexOf(c)===i).slice(0,3);
  return {line,choices};
}

const generateBio=(p)=>{
  const cap1=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
  const name=p.name||"Il giocatore";
  const nation=p.nation||"Italia";
  const age=p.age||18;
  const pos=p.position||"Attaccante";
  const tg=p.totalGoals||0, ta=p.totalAssists||0, tm=p.totalMatches||0;
  const seasons=Math.max(0,(p.season||1)-1);
  const clubN=p.club?.n||p.club?.name||"–";
  const trophies=(p.trophies||[]).length;
  const ovr=p.ovr||60;
  const caps=p.nationalCaps||0, natG=p.nationalGoals||0;
  const isPro=p.proStatus==="pro";
  const isCap=p.isCaptain===true;
  if(seasons===0||tm===0){
    return `${name}, ${age} anni, ${nation} · ${pos}. Ai primi passi nel professionismo: la sua storia è tutta da scrivere.`;
  }
  // club distinti (storia + attuale, per NOME — così è coerente con come history salva `club`)
  const histNames=(p.history||[]).map(h=>h.club).filter(Boolean);
  const distinct=[...new Set([...histNames,clubN].filter(x=>x&&x!=="–"))];
  const curTenure=(p.history||[]).filter(h=>h.club===clubN).length+(isPro?1:0);/* stagioni nel club ATTUALE (+ quella in corso) */
  const oneClub=isPro&&seasons>=3&&distinct.length<=1;
  const isBandiera=isPro&&curTenure>=5&&(tg>=50||trophies>=1);
  let lines=[`${name}, ${age} anni, ${nation} · ${pos}.`];
  lines.push(`In carriera ${tg} gol e ${ta} assist in ${tm} presenze, ${seasons} stagion${seasons>1?"i":"e"} da professionista.`);
  // considerazioni identitarie (bandiera / capitano / una sola squadra)
  const tags=[];
  if(isBandiera)tags.push(`bandiera del ${clubN}`);
  if(isCap)tags.push(`capitano del ${clubN}`);
  if(oneClub)tags.push(`fedele a un solo club in ${seasons} stagioni`);
  if(tags.length)lines.push(cap1(tags.join(" · "))+".");
  // trofei (numero REALE)
  if(trophies>=3)lines.push(`In bacheca ${trophies} trofei: un vincente.`);
  else if(trophies>=1)lines.push(`Ha già alzato ${trophies===1?"un trofeo":trophies+" trofei"}: sa cosa significa vincere.`);
  else if(seasons>1)lines.push(`Ancora a caccia del primo grande titolo.`);
  // Nazionale
  if(caps>=25)lines.push(`Colonna della Nazionale con ${caps} presenze${natG?` e ${natG} gol`:""}.`);
  else if(caps>0)lines.push(`${caps} presenz${caps>1?"e":"a"} in Nazionale${natG?` (${natG} gol)`:""}.`);
  // valutazione tecnica
  lines.push(ovr>=90?`Valutazione tecnica ${ovr}/99: un fuoriclasse assoluto.`:ovr>=80?`Valutazione tecnica ${ovr}/99: tra i migliori in circolazione.`:ovr>=70?`Valutazione tecnica ${ovr}/99: giocatore solido e affidabile.`:`Valutazione tecnica ${ovr}/99: ampi margini di crescita.`);
  return lines.join(" ");
};
/* === SPRINT 56 — TUTORIAL ONBOARDING === */
const TUTORIAL_STEPS=[
  {icon:"🌟",title:"Benvenuto in Korward Elite!",text:"Sei {name}, un giovane talento con il sogno di diventare campione. Ogni settimana conta — allenati, gioca le partite e scrivi la tua storia."},
  {icon:"📋",title:"La Dashboard",text:"Qui trovi statistiche, obiettivi e la tua settimana. La barra in basso ti porta su Stagione (classifica, calendario e coppe), Club, Carriera, Agente e Opzioni."},/* [7.331.0 collaudo PO «il wizard va aggiornato»] via i nomi inglesi di tab che non esistono più */
  {icon:"⚽",title:"Gioca le Partite",text:"Quando in settimana c'è una partita, il tasto GIOCA ti porta in campo: vivi i momenti decisivi in 3D e decidi tu il risultato. Ogni gol, assist e trofeo resta nel tuo diario di carriera."},/* [7.331.0 collaudo PO «le partite non si possono saltare, non è corretta la scritta»] */
  {icon:"💪",title:"Allenamento Automatico",text:"Ogni settimana il mister prepara il piano di allenamento. Avanza la settimana per ricevere il suo feedback e far crescere i tuoi attributi."},
  {icon:"⚡",title:"Fatica & Infortuni",text:"Tieni d'occhio la barra FATICA: oltre 80 rischi un infortunio e salti le partite. Il mister inserisce sessioni di recupero quando serve — fidati del suo piano."},
  {icon:"💰",title:"Mercato & Offerte",text:"Ogni tanto arrivano offerte di trasferimento. Valuta minutaggio, crescita e prestigio del club prima di decidere. Puoi sempre rifiutare. Ora sei pronto — buona carriera!"},
];
function TutorialOverlay({name,step,onNext,onSkip}){
  const s=TUTORIAL_STEPS[step]||TUTORIAL_STEPS[0];
  const isLast=step===TUTORIAL_STEPS.length-1;
  const txt=s.text.replace(/\{name\}/g,name||"Campione");
  const ttl=s.title.replace(/\{name\}/g,name||"Campione");
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 12px 90px"}}>
      <div style={{background:TH.card,border:`2px solid ${TH.primary}`,borderRadius:20,padding:"26px 22px 20px",maxWidth:400,width:"100%",boxShadow:"0 10px 50px rgba(0,0,0,0.6)"}}>
        <div style={{fontSize:40,textAlign:"center",marginBottom:8}}>{s.icon}</div>
        <div style={{fontWeight:800,fontSize:18,color:TH.text,textAlign:"center",marginBottom:10}}>{ttl}</div>
        <div style={{fontSize:14,color:TH.muted,textAlign:"center",lineHeight:1.65,marginBottom:18}}>{txt}</div>
        {/* step dots */}
        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:16}}>
          {TUTORIAL_STEPS.map((_,i)=>(
            <div key={i} style={{width:i===step?22:8,height:8,borderRadius:4,background:i===step?TH.primary:i<step?TH.success:TH.cardBorder,transition:"width 0.2s"}}/>
          ))}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={onSkip} style={{background:"none",border:"none",color:TH.faint,fontSize:12,cursor:"pointer",padding:"8px 4px",textDecoration:"underline",whiteSpace:"nowrap"}}>Salta</button>
          <button onClick={onNext} style={{flex:1,background:TH.primary,color:"#fff",border:"none",borderRadius:12,padding:"13px 0",fontWeight:800,fontSize:15,cursor:"pointer",letterSpacing:"0.02em"}}>
            {isLast?"Inizia la carriera! 🚀":"Avanti →"}
          </button>
        </div>
      </div>
    </div>
  );
}
/* Sprint 217 — MilestoneCelebrationModal: overlay per milestone big (g50,g100,m100,ovr90) */
function MilestoneCelebrationModal({milestone,onDismiss}){
  React.useEffect(()=>{const t=setTimeout(onDismiss,4500);return()=>clearTimeout(t);},[]);
  const icon=milestone.txt.split(" ")[0];
  const title=milestone.txt.split(" ").slice(1).join(" ");
  return(
    <div onClick={onDismiss} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}}>
      <div style={{textAlign:"center",maxWidth:320,width:"100%"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:68,marginBottom:10,filter:`drop-shadow(0 0 18px ${milestone.color}aa)`}}>{icon}</div>
        <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:8,lineHeight:1.25,textShadow:`0 2px 20px ${milestone.color}`}}>{title}</div>
        {milestone.sub&&<div style={{fontSize:13,color:"rgba(255,255,255,0.72)",marginBottom:20,lineHeight:1.6,padding:"0 8px"}}>{milestone.sub}</div>}
        <div style={{width:72,height:3,background:milestone.color,borderRadius:2,margin:"0 auto 20px",boxShadow:`0 0 14px ${milestone.color}`}}/>
        <button onClick={onDismiss} style={{background:milestone.color,color:"#fff",border:"none",borderRadius:14,padding:"13px 32px",fontWeight:800,fontSize:15,cursor:"pointer",letterSpacing:"0.02em",fontFamily:"inherit"}}>🎉 Fantastico!</button>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:10}}>Tocca per chiudere</div>
      </div>
    </div>
  );
}
/* Sprint 140 — TrainPanel: auto-executes coach plan on mount, shows only feedback */
const TrainPanel=({player,setPlayer,notify})=>{
  const _TT={
    fisico:{id:"fisico",e:"💪",l:"Fisico",a:"fisico",b:"velocità",col:"#16a34a"},
    tecnico:{id:"tecnico",e:"⚽",l:"Tecnico",a:"tecnica",b:"tiro",col:"#2563eb"},
    tattico:{id:"tattico",e:"🎯",l:"Tattico",a:"passaggio",b:"posizionamento",col:"#d97706"},
    mentale:{id:"mentale",e:"🧠",l:"Mentale",a:"mentalità",b:"dribbling",col:"#7c3aed"},
  };
  const fat=player.fatigue||0;
  const allDone=(player.sessionsThisWeek||0)>=3;
  const slog=player.sessionLog||[];
  const streak=player.trainingStreak||0;
  const week=player.week||1;
  const _s2t=(k)=>({"velocità":"fisico","fisico":"fisico","tecnica":"tecnico","tiro":"tecnico","passaggio":"tattico","posizionamento":"tattico","mentalità":"mentale","dribbling":"mentale"})[k]||"fisico";
  const _sorted=Object.entries(player.stats||{}).sort((a,b)=>a[1]-b[1]);
  const _t0=_s2t(_sorted[0]?.[0]||"fisico");
  const _t1_raw=_s2t(_sorted[1]?.[0]||"tecnica");
  const _t1=_t1_raw!==_t0?_t1_raw:_s2t(_sorted[2]?.[0]||"mentale");
  /* [7.160.0 super-test · ECO-F1] il fix fatica 7.152.0 era stato applicato SOLO al chokepoint weeklyGrowthFields:
     chi apriva il tab Allenamento eseguiva ANCORA il piano vecchio (soglie 85/65, 3 sessioni piene a fatica ≤65 =
     +30) → il bug «quasi sempre affaticato» rientrava dalla porta del TrainPanel e la crescita era path-dependent
     (3 roll vs 2). Ora IDENTICO al chokepoint: soglie 72/50/28, recupero graduale "rec" (−18 fatica · +6 morale). */
  const veryTired=fat>72;const highFat=fat>50;const medFat=fat>28;
  const _plan=veryTired?["rec","rec","rec"]:highFat?[_t0,"rec","rec"]:medFat?[_t0,_t1,"rec"]:[_t0,_t1,_t0];
  const _recent=(player.matchHistory||[]).slice(-3);
  const _avgRating=_recent.length?_recent.reduce((s,m)=>s+(parseFloat(m.rating)||6.5),0)/_recent.length:6.5;
  // Sprint 2 (9.3): il vice-mister (assistantCoachRel) affina il lavoro → modula l'efficacia del training (±~12%)
  const _acR=player.assistantCoachRel||50;const _acMult=_acR>=75?1.12:_acR>=60?1.04:_acR<=35?0.90:1.0;
  const _mult=(_avgRating>=7.5?1.20:_avgRating>=6.5?1.0:_avgRating>=5.5?0.88:0.75)*((player.form||60)>=75?1.10:(player.form||60)<=35?0.90:1.0)*((player.coachTrust||60)>=80?1.12:(player.coachTrust||60)>=65?1.0:0.92)*_acMult*TRAIN_BASE_EFF*trainAgeMult(player.age)*archGrowthMult(player)*(player.perkTrainer?1.10:1)/*[5.80.0 BIL-1/MIN-8 · 5.81.0 perk]*/;
  const _dim=(sv)=>{const v=sv||60;return v>=92?0.015:v>=90?0.03:v>=88?0.05:v>=84?0.11:v>=80?0.18:v>=75?0.28:v>=70?0.35:v>=65?0.45:0.55;};/* [7.9.1 collaudo PO «ritara»] rendimento decrescente INDURITO nella fascia élite (84+ ridotto, 90+ quasi piatto): con la crescita ora attiva su tutti i path (7.9.0) il profilo top toccava 93 a 28 anni — il tetto converge a ~90-92 (picco di progetto 5.80); fasce ≤80 INVARIATE → criterio §10 (50→85 in 8-10 stagioni) intatto */
  const _t0name=_TT[_t0]?.l||_t0;const _t1name=_TT[_t1]?.l||_t1;
  const _coachMsg=veryTired?"Sei a pezzi. Riposo assoluto — non si allena in queste condizioni.":highFat?`Stai spingendo troppo. Lavoro leggero su ${_t0name}, poi recupero totale.`:_avgRating>=7.5?`Stai giocando bene — intensifico su ${_t0name} e ${_t1name} per sfruttare questo momento.`:_avgRating<=5.5?`Dobbiamo migliorare. Doppio lavoro su ${_t0name} e poi ${_t1name}.`:`Questa settimana puntiamo su ${_t0name} e ${_t1name}. Segui il piano.`;
  const _fitMsg=veryTired?"⚠️ Il preparatore ti ferma: rischio infortuni.":highFat?"💧 Il preparatore inserisce sessioni di recupero.":streak>=3?"🔥 Stai mantenendo continuità — il preparatore è soddisfatto.":"";
  // [5.86.0 · DIRETTIVA PO] TRAINING AUTOMATICO by design: l'eroe è un CALCIATORE, non l'allenatore —
  //   il piano settimanale lo decidono mister e preparatori (le 2 stat più deboli; recupero automatico a
  //   fatica alta) e si esegue da solo all'apertura del tab. La scelta manuale del focus (5.82.0 BIL-4)
  //   è stata RIMOSSA su feedback del proprietario: frizione noiosa, non una decisione interessante.
  //   Restano: curve d'età (BIL-1), perk personal trainer, moltiplicatori forma/voti/fiducia, auto-training
  //   all'avanzamento se il tab non viene aperto.
  const _planEff=_plan;
  React.useEffect(()=>{
    if(allDone)return;
    if(player.injured){notify("🏥 Sei in riabilitazione: niente allenamento questa settimana.",TH.warning);return;}/* [7.8.28 QA] aprire il tab Allenamento da INFORTUNATO eseguiva il piano completo (+fatica 30 → alzava il rischio ricaduta del roll 18380) — l'auto-training di doAdvanceWeek era già correttamente irraggiungibile da infortunati */
    let ns={...player.stats};let fatD=0;let morD=0;let formD=0;
    const newLog=[...(player.sessionLog||[])];const gained={};
    _planEff.forEach(tid=>{
      const isRec=tid==="rec"||tid==="rec_attivo"||tid==="rec_completo";
      if(isRec){if(tid==="rec"){fatD-=18;morD+=6;newLog.push({id:"rec",e:"🧘",l:"Recupero",col:"#0284c7"});}else{const full=tid==="rec_completo";fatD-=(full?26:13);morD+=(full?10:5);formD+=(full?2:1);newLog.push({id:tid,e:full?"🛌":"🧘",l:full?"Riposo":"Recupero",col:"#0284c7"});}/* [7.160.0] "rec" = STESSI numeri del chokepoint (−18/+6, no form) → fatica identica su entrambi i path */}
      else{const s=_TT[tid];if(!s)return;const pA=Math.min(0.85,_dim(ns[s.a])*_mult);const pB=Math.min(0.55,_dim(ns[s.b])*0.5*_mult);const gA=Math.random()<pA?1:0;const gB=Math.random()<pB?1:0;if(gA){ns[s.a]=clamp((ns[s.a]||60)+1,1,99);gained[s.a]=(gained[s.a]||0)+1;}if(gB){ns[s.b]=clamp((ns[s.b]||60)+1,1,99);gained[s.b]=(gained[s.b]||0)+1;}fatD+=10;newLog.push({id:s.id,e:s.e,l:s.l,col:s.col,gainA:gA,gainB:gB,statA:s.a,statB:s.b});}
    });
    setPlayer(p=>({...p,stats:ns,ovr:calcOvr(ns),fatigue:clamp((p.fatigue||0)+fatD,0,100),morale:clamp((p.morale||70)+morD,0,100),form:clamp((p.form||60)+formD,30,95),sessionsThisWeek:3,sessionLog:newLog,trainingStreak:(p.trainingStreak||0)+1,lastTrainingType:_planEff[0],weeklyFocusType:_t0,
      // Sprint D2 + Sprint 2 (9.3): piccola crescita relazioni per settimana di allenamento (ora include il vice-mister)
      fitnessCoachRel:clamp((p.fitnessCoachRel||50)+(Math.random()<0.3?1:0),0,100),
      assistantCoachRel:clamp((p.assistantCoachRel||50)+(Math.random()<0.28?1:0),0,100),
      teamChemistry:clamp((p.teamChemistry||60)+(Math.random()<0.25?1:0),0,100)}));
    const gkeys=Object.keys(gained);
    notify(`✅ W.${week}: ${gkeys.length?gkeys.map(k=>`+${gained[k]} ${k}`).join(" · "):"nessuna crescita questa settimana"}`,gkeys.length?TH.success:TH.muted);
  },[]);// eslint-disable-line — auto-esecuzione al mount (direttiva PO 5.86.0)
  return(
    <Card>
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10,padding:"8px 10px",background:TH.surface2,borderRadius:8,border:"1px solid "+TH.cardBorder}}>
        <div style={{fontSize:22,flexShrink:0}}>🧑‍🏫</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:TH.faint,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Mister · Piano W.{week}</div>
          <div style={{fontSize:12,color:TH.text,fontStyle:"italic"}}>"{_coachMsg}"</div>
          {_fitMsg&&<div style={{fontSize:10,color:TH.txBlue,marginTop:4}}>{_fitMsg}</div>}
        </div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {_planEff.map((tid,i)=>{
          const isRec=tid==="rec"||tid==="rec_attivo"||tid==="rec_completo";
          const t=isRec?{e:tid==="rec_completo"?"🛌":"🧘",l:tid==="rec_completo"?"Riposo":"Recupero",col:"#0284c7"}:_TT[tid];
          const done=slog[i];
          return(<div key={i} style={{flex:1,padding:"8px 4px",borderRadius:8,border:`1.5px solid ${t?.col+(done?"88":"44")}`,background:t?.col+(done?"22":"0a"),textAlign:"center"}}>
            <div style={{fontSize:18}}>{done?"✅":t?.e||"?"}</div>
            <div style={{fontSize:10,fontWeight:700,color:t?.col,marginTop:2}}>{t?.l||tid}</div>
          </div>);
        })}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
        <div style={{fontSize:10,padding:"3px 8px",borderRadius:6,fontWeight:700,background:fat>70?"#fee2e2":fat>45?"#fef3c7":"#f0fdf4",color:fat>70?TH.danger:fat>45?"#92400e":"#166534"}}>💧 {fat}/100</div>
        <div style={{fontSize:10,padding:"3px 8px",borderRadius:6,fontWeight:700,background:TH.bgBlue,color:TH.txBlue}}>⭐ Forma {player.form||60}</div>
        {_recent.length>0&&<div style={{fontSize:10,padding:"3px 8px",borderRadius:6,fontWeight:700,background:_avgRating>=7?"#f0fdf4":_avgRating<=5.5?"#fee2e2":"#f8fafc",color:_avgRating>=7?TH.success:_avgRating<=5.5?TH.danger:TH.faint}}>📊 Voto {_avgRating.toFixed(1)}</div>}
        {_mult!==1.0&&<div style={{fontSize:10,padding:"3px 8px",borderRadius:6,fontWeight:700,background:_mult>1?"#f0fdf4":"#fff7ed",color:_mult>1?"#166534":"#92400e"}}>{_mult>1?`↑ ${Math.round((_mult-1)*100)}% efficacia`:`↓ ${Math.round((1-_mult)*100)}% efficacia`}</div>}
        {streak>=3&&<div style={{fontSize:10,padding:"3px 8px",borderRadius:6,fontWeight:700,background:TH.bgAmber,color:TH.txAmber}}>🔥 {streak} sett.</div>}
      </div>
      {allDone?(
        <div style={{textAlign:"center",padding:"10px 0",color:TH.success,fontSize:12,fontWeight:700}}>
          ✅ Allenamento completato
          <div style={{fontSize:10,color:TH.muted,fontWeight:400,marginTop:3}}>
            {(()=>{const g=(slog||[]).filter(s=>s.gainA||s.gainB);return g.length?g.map(s=>[s.gainA?`+1 ${s.statA}`:null,s.gainB?`+1 ${s.statB}`:null].filter(Boolean).join(" · ")).join(" · "):"Nessuna crescita questa settimana.";})()}
          </div>
        </div>
      ):(
        <div style={{textAlign:"center",padding:"10px 0",color:TH.faint,fontSize:11}}>⏳ Allenamento in corso…</div>
      )}
    </Card>
  );
};
// MIGRAZIONE SAVE (estratta da CareerApp, A1/#50): pura, testabile, byte-identica al blocco originale.
//   player -> {player, changed}. Backfill per-campo. Esposta come window.__CPM_MIGRATE per il test save-compat.
function migratePlayer(player){
    let changed=false;
    let newP={...player};
    // Sprint 174 (moved first): refresh U18 club data before getLeagueClubs runs
    if((newP.proStatus||"u18")==="u18"&&newP.club&&!["Primavera 1","Primavera 2"].includes(newP.club.lg)){
      const _fc=ALL_U18_CLUBS.find(c=>c.id===newP.club.id);
      if(_fc){newP={...newP,club:_fc};changed=true;}
    }
    // [6.28.0 collaudo PO «primavera 2 con 36 squadre»] REPAIR save PRO rotto: la transizione U18→pro poteva
    //   lasciare la LEGA U18 ("Primavera 1/2") sul club senior → getLeagueClubs cadeva sul fallback nazionale
    //   (lega a 36 squadre, divisioni mescolate: "Modena con l'Inter", "calendario contro l'Inter"). Rimappa alla
    //   lega SENIOR reale (dall'id: P1→Lega A, P2→Lega B) e rigenera il calendario coerente (il vecchio aveva
    //   avversari di altre divisioni). Le standings le ricostruisce già il blocco sotto (length ≠ lc.length).
    if((newP.proStatus||"u18")==="pro"&&newP.club&&["Primavera 1","Primavera 2"].includes(newP.club.lg)){
      const _scFix=CLUBS.find(c=>c.id===newP.club.id);
      const _lgFix=(_scFix&&_scFix.lg)||(newP.club.lg==="Primavera 1"?"Lega A":"Lega B");
      newP={...newP,club:{...newP.club,lg:_lgFix,isU18:false}};
      const _seedFix28=((newP.season||1)*777+hashStr(newP.club.id||"club"))>>>0;
      const _lcFix28=getLeagueClubs(newP);
      newP={...newP,standings:initStandings(_lcFix28),calendar:generateSeasonCalendar(newP.club,_lcFix28,_seedFix28)};
      changed=true;
    }
    const lc=getLeagueClubs(newP);
    // [6.36.0 STAB-12] RICONCILIA la classifica invece di AZZERARLA: prima un semplice mismatch di dimensione
    //   del pool (es. getLeagueClubs cambia conteggio tra versioni) resettava a zero tutta la stagione IN CORSO
    //   (classifica irraggiungibile, progresso perso). Ora preserva le righe esistenti per id (played/pts/gf/ga…),
    //   crea a zero SOLO i club nuovi del pool e scarta gli extra → la stagione in corso sopravvive. Idempotente
    //   (dopo la riconciliazione length===lc.length e il club è presente → non riscatta). Se non c'è NULLA da
    //   preservare (nessuna riga, o il club dell'eroe assente = pool completamente diverso) l'esito coincide con
    //   una ricostruzione pulita.
    const _clubInStandings=(newP.standings||[]).some(s=>s.id===newP.club?.id);
    if(!newP.standings||newP.standings.length===0||newP.standings.length!==lc.length||!_clubInStandings){
      const _stById={};(newP.standings||[]).forEach(s=>{if(s&&s.id!=null)_stById[s.id]=s;});
      const _reconciled=lc.map(c=>_stById[c.id]||{...c,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,pts:0});
      newP={...newP,standings:_reconciled};
      changed=true;
    }
    if(!newP.calendar||newP.calendar.length===0){
      const seed=(newP.season||1)*777+hashStr(newP.club?.id||newP.club?.n||"u18");
      newP={...newP,calendar:generateSeasonCalendar(newP.club||{id:"u18",n:"U18"},lc,seed)};
      changed=true;
    }
    // Sprint 176: fix calendar with old "U18" names or wrong-pool opponents (e.g. P1 clubs in P2 league)
    if(newP.calendar&&newP.calendar.length>0&&(newP.proStatus||"u18")==="u18"){
      const _lcIds176=new Set(lc.map(c=>c.id));
      const _calWrong176=(newP.calendar||[]).some(m=>!m.played&&!m.type&&m.opponentId&&(!_lcIds176.has(m.opponentId)||(m.opponentName||"").includes(" U18")));
      if(_calWrong176){
        const _seed176=(newP.season||1)*777+hashStr(newP.club?.id||"u18");
        const _freshCal176=generateSeasonCalendar(newP.club||{id:"u18"},lc,_seed176);
        const _keepCal176=(newP.calendar||[]).filter(m=>m.played||m.type==="cup"||m.type==="euro"||m.type==="euro_group");
        const _keptWks176=new Set(_keepCal176.map(m=>m.week));
        const _newLeague176=_freshCal176.filter(m=>!_keptWks176.has(m.week));
        newP={...newP,calendar:[..._keepCal176,..._newLeague176].sort((a,b)=>(a.week||0)-(b.week||0))};
        changed=true;
      }
    }
    // [6.28.0 collaudo PO «duplicazione partita, l'ho giocata poco prima»] REPAIR calendari ESISTENTI (generati
    //   prima del fix 6.27.0): riordina la parte NON giocata per non affrontare lo STESSO avversario in due
    //   giornate consecutive (andata+ritorno adiacenti). SOLO riordino degli slot week futuri: preserva le gare
    //   giocate, il set di fixture e il bilancio casa/trasferta. Verificato standalone (multiset+H/A preservati).
    if(Array.isArray(newP.calendar)&&newP.calendar.length){
      const _cal28=newP.calendar,_isLg28=m=>!m.type;
      const _futIdx28=[];_cal28.forEach((m,i)=>{if(_isLg28(m)&&!m.played)_futIdx28.push(i);});
      if(_futIdx28.length>2){
        let _lastOpp28=null;for(let i=0;i<_cal28.length;i++){if(_isLg28(_cal28[i])&&_cal28[i].played)_lastOpp28=_cal28[i].opponentId;}
        let _prob28=false,_pv28=_lastOpp28;for(const i of _futIdx28){if(_cal28[i].opponentId===_pv28){_prob28=true;break;}_pv28=_cal28[i].opponentId;}
        if(_prob28){
          const _fx28=_futIdx28.map(i=>({opponentId:_cal28[i].opponentId,opponentName:_cal28[i].opponentName,isHome:_cal28[i].isHome}));
          const _used28=new Array(_fx28.length).fill(false),_ord28=[];let _p28=_lastOpp28;
          for(let s=0;s<_futIdx28.length;s++){let pick=_fx28.findIndex((f,k)=>!_used28[k]&&f.opponentId!==_p28);if(pick<0)pick=_used28.findIndex(u=>!u);_used28[pick]=true;_p28=_fx28[pick].opponentId;_ord28.push(pick);}
          const _nc28=_cal28.slice();_futIdx28.forEach((ci,s)=>{const f=_fx28[_ord28[s]];_nc28[ci]={..._nc28[ci],opponentId:f.opponentId,opponentName:f.opponentName,isHome:f.isHome};});
          newP={...newP,calendar:_nc28};changed=true;
        }
      }
    }
    if(!newP.aiData){
      newP={...newP,aiData:{lastOpponentTactic:null,scoutReports:{},pressReports:{}}};
      changed=true;
    }
    if(!newP.trophies){
      newP={...newP,trophies:[]};
      changed=true;
    }
    if(!('transferListed' in newP)){
      newP={...newP,transferListed:false};
      changed=true;
    }
    if(!('trainedThisWeek' in newP)&&!('sessionsThisWeek' in newP)){
      newP={...newP,sessionsThisWeek:0,sessionLog:[]};
      changed=true;
    }
    if('trainedThisWeek' in newP&&!('sessionsThisWeek' in newP)){ // Sprint 50: migrate old flag
      newP={...newP,sessionsThisWeek:newP.trainedThisWeek?1:0,sessionLog:[]};
      changed=true;
    }
    if(!('diary' in newP)){ // Sprint 51
      newP={...newP,diary:[]};
      changed=true;
    }
    if(!('trainingStreak' in newP)){
      newP={...newP,trainingStreak:0,lastTrainingType:null};
      changed=true;
    }
    if(!('windowOfferUsed' in newP)){
      newP={...newP,windowOfferUsed:false};
      changed=true;
    }
    // [6.79.0 collaudo PO «ricompare la finale di coppa + loop della giornata di lega»] BONIFICA COPPA ZOMBIE:
    //   uno stato corrotto (round>4 con active e champion=false, classe pre-6.74) faceva rischedulare la FINALE
    //   a ogni mount (il repair S41 qui sotto usa min(round,4) → sempre la finale) e la voce di coppa pendente
    //   teneva in OSTAGGIO l'avanzamento settimana (_pendingOther) → la giornata di lega si riproponeva in loop.
    //   (a) round>4 ⇒ la coppa è FINITA: chiudila onestamente (campione se la finale risulta vinta nei results);
    //   (b) coppa chiusa (champion/eliminated/non attiva) ⇒ NESSUNA gara di coppa non giocata può restare in calendario.
    if((newP.proStatus||"u18")==="pro"&&newP.cup&&newP.cup.active&&(newP.cup.round||1)>4){
      const _zcWon=(newP.cup.results||[]).some(r=>(r.round||0)>=4&&r.won);
      newP={...newP,cup:{...newP.cup,active:false,champion:_zcWon,eliminated:!_zcWon}};changed=true;
    }
    if((newP.proStatus||"u18")==="pro"&&(newP.calendar||[]).some(m=>m.type==="cup"&&!m.played)&&newP.cup&&(!newP.cup.active||newP.cup.eliminated||newP.cup.champion)){/* cup ASSENTE ⇒ conservativo: non toccare (INV-CALHEAL) */
      newP={...newP,calendar:(newP.calendar||[]).filter(m=>!(m.type==="cup"&&!m.played))};changed=true;
    }
    // [6.91.0 collaudo PO «di nuovo ripetizione nel calendario, l'ho già giocata!»] FIXTURE DI LEGA DUPLICATA:
    //   in un girone andata/ritorno corretto ogni coppia (avversario, sede) esiste UNA volta sola → una voce di
    //   LEGA non giocata che duplica una fixture GIÀ GIOCATA (stesso avversario, stessa sede, stessa stagione)
    //   è corruzione (desync di marcatura/repair storici) e non va MAI ri-servita: bonificata qui.
    {const _lgPlayed91=(newP.calendar||[]).filter(m=>!m.type&&m.played);
     if(_lgPlayed91.length){
       const _pk91=new Set(_lgPlayed91.map(m=>(m.opponentId||m.opponentName||"?")+"|"+(m.isHome?"H":"A")));
       const _cal91=(newP.calendar||[]).filter(m=>!(!m.type&&!m.played&&_pk91.has((m.opponentId||m.opponentName||"?")+"|"+(m.isHome?"H":"A"))));
       if(_cal91.length!==(newP.calendar||[]).length){newP={...newP,calendar:_cal91};changed=true;}
     }}
    // [6.98.0 collaudo PO «di nuovo il loop nelle ultime partite»] HEAL 2: se lo STORICO stagionale ha già 2 gare
    //   di lega contro un avversario (andata+ritorno giocati), qualsiasi voce di LEGA non giocata contro di lui
    //   è stantia (fixture giocata ma mai marcata, classe pre-6.91) → rimossa. matchHistory è stagionale ⇒ il
    //   conteggio riparte pulito a ogni rollover.
    {const _mh98=(newP.matchHistory||[]).filter(h=>!h.cup&&!h.euro);
     if(_mh98.length){
       const _cnt98={};_mh98.forEach(h=>{const k=h.opponent||"?";_cnt98[k]=(_cnt98[k]||0)+1;});
       const _cal98=(newP.calendar||[]).filter(m=>!(!m.type&&!m.played&&(_cnt98[m.opponentName||"?"]||0)>=2));
       if(_cal98.length!==(newP.calendar||[]).length){newP={...newP,calendar:_cal98};changed=true;}
     }}
    /* [7.210.0 collaudo PO «bug partita già giocata, pareggiata 2 a 2!»] HEAL 3: la voce di LEGA non giocata
       la cui gara risulta GIÀ NELLO STORICO stagionale (stessa settimana + stesso avversario, oppure stesso
       avversario + stessa sede per le entry che portano la sede) è stantia — giocata e mai marcata — e va
       rimossa dal calendario, non solo saltata a runtime. Completa HEAL 1 (gemella nel calendario) e HEAL 2
       (due gare contro lo stesso club), che non vedevano il PRIMO incrocio. */
    {const _sn210=newP.season||1;
     const _h210=(newP.matchHistory||[]).filter(h=>h&&!h.cup&&!h.euro&&!h.national&&(h.season||1)===_sn210);
     if(_h210.length){
       const _wk210=new Set(_h210.map(h=>(h.week||0)+"|"+(h.opponent||"?")));
       const _sd210=new Set(_h210.filter(h=>h.isHome!=null).map(h=>(h.opponent||"?")+"|"+(h.isHome?"H":"A")));
       const _c210=(newP.calendar||[]).filter(m=>!(!m.type&&!m.played&&(
         _wk210.has((m.week||0)+"|"+(m.opponentName||"?"))||_sd210.has((m.opponentName||"?")+"|"+(m.isHome?"H":"A")))));
       if(_c210.length!==(newP.calendar||[]).length){newP={...newP,calendar:_c210};changed=true;}
     }}
    /* [7.302.0 collaudo PO «bug grave! partita già giocata. bug già segnalato diverse volte!»] HEAL 4 —
       l'invariante che non dipende da nessuna chiave sporcabile: il calendario ha UNA voce per numero di
       GIORNATA, quindi una voce di lega NON giocata che porta un numero di giornata GIÀ giocato è un
       duplicato, punto. Bonifica il save invece di limitarsi a saltarlo a runtime (guardia D). */
    {const _pmd302=new Set((newP.calendar||[]).filter(m=>m&&m.played&&!m.type&&m.matchday!=null).map(m=>m.matchday));
     if(_pmd302.size){
       const _c302=(newP.calendar||[]).filter(m=>!(!m.type&&!m.played&&m.matchday!=null&&_pmd302.has(m.matchday)));
       if(_c302.length!==(newP.calendar||[]).length){newP={...newP,calendar:_c302};changed=true;}
     }}
    /* [7.312.0 collaudo PO «un'altra volta stesso bug… le partite possono essere simulate, giocate NON deve
       piu' ricapitare. E' grave»] SEED del registro persistente delle giornate giocate. Il registro nasce
       vuoto sui salvataggi esistenti: qui viene riempito con tutto cio' che il save gia' sa di aver giocato —
       le voci di calendario marcate (qualunque competizione) — cosi' la guardia (F) e' attiva dal primo
       caricamento e non solo dalla prima gara successiva all'aggiornamento. Campo lazy, nessun bump. */
    {const _sn312=newP.season||1;
     const _seed312=(newP.calendar||[]).filter(m=>m&&m.played&&m.matchday!=null).map(m=>m.matchday);
     const _cur312=(newP.playedMd&&newP.playedMd.s===_sn312&&Array.isArray(newP.playedMd.md))?newP.playedMd.md:[];
     const _mrg312=[...new Set([..._cur312,..._seed312])];
     if(_mrg312.length!==_cur312.length||!newP.playedMd||newP.playedMd.s!==_sn312){newP={...newP,playedMd:{s:_sn312,md:_mrg312}};changed=true;}}
    // S41: migrate old saves — add current cup round to calendar if missing
    if((newP.proStatus||"u18")==="pro"&&newP.cup?.active&&!newP.cup?.eliminated&&!newP.cup?.champion&&(newP.cup.round||1)<=4&&!(newP.calendar||[]).some(md=>md.type==="cup"&&!md.played)){
      const _m41RW=[0,9,19,28,35];const _m41RN=["","Ottavi di Finale","Quarti di Finale","Semifinale","FINALE"];
      const _m41cr=Math.min(newP.cup.round||1,4);const _m41wk=_m41RW[_m41cr];
      /* [7.473.0] e la sorgente si tappa dove nasce: se il turno ha gia' il suo risultato, non c'e'
         niente da ricreare — la coppa e' semplicemente finita e lo stato va chiuso, non riaperto. */
      if(!(typeof window!=='undefined'&&window.__CPM_NO473)&&(newP.cup.results||[]).some(r=>r&&r.round===_m41cr)){
        const _w41=(newP.cup.results||[]).find(r=>r&&r.round===_m41cr);
        newP={...newP,cup:{...newP.cup,active:false,champion:!!(_w41&&_w41.won&&_m41cr>=4),eliminated:!(_w41&&_w41.won)}};changed=true;
      }else{
      // [5.93.0 BIL-7] la week standard del turno può essere GIÀ PASSATA (save post-trasferimento pre-5.93):
      //   fallback sulla prima week libera ≤37; niente spazio → la coppa si chiude onestamente.
      const _m41wkEff=(function(){const u=new Set((newP.calendar||[]).filter(m=>!m.played).map(m=>m.week));let w=Math.max(_m41wk||9,(newP.week||1)+1)-1;do{w++;}while(w<=37&&u.has(w));return w<=37?w:null;})();
      if(_m41wkEff){
        const _m41lc=getLeagueClubs(newP);
        const _m41bc=(newP.cup.bracket||[]).map(id=>_m41lc.find(c=>c.id===id||c.n===id)).filter(Boolean);
        const _m41used=(newP.cup.results||[]).map(r=>r.opponent);
        const _m41opp=pick(_m41bc.filter(c=>c.id!==newP.club?.id&&c.n!==newP.club?.n&&!_m41used.includes(c.n)))||pick(_m41bc.filter(c=>c.id!==newP.club?.id))||pick(_m41lc.filter(c=>c.id!==newP.club?.id&&c.n!==newP.club?.n));// [5.93.0 BIL-7] bracket di un'altra lega → ri-pesca nel pool corrente
        if(_m41opp){newP={...newP,calendar:[...(newP.calendar||[]),{matchday:990+_m41cr/* [7.473.0] era un 990 PIATTO, uguale per tutti e quattro i turni — mentre ogni altro ramo che crea una voce di coppa scrive `990+turno` (r.~29698, ~30176). Col numero piatto il registro delle giornate committate, che indicizza per `matchday`, vedeva UN SOLO numero per l'intera coppa: bastava aver giocato gli ottavi perche' ogni turno successivo risultasse gia' committato. Allineato agli altri rami. */,week:_m41wkEff,opponentId:_m41opp.id,opponentName:_m41opp.n||_m41opp.name,isHome:true,played:false,result:null,type:"cup",competition:"Coppa Nazionale",cupRound:_m41cr,cupRoundName:_m41RN[_m41cr]}]};changed=true;}
      }else{newP={...newP,cup:{...newP.cup,active:false,eliminated:true}};changed=true;}
      }
    }
    // [7.108.0 collaudo PO «è la semifinale, non la finale»] HEAL: le voci euro KO auto-simulate pre-7.108 avevano
    //   cupRoundName sfasato (es. i QUARTI etichettati «Semifinale») per il binario final?"Finale":"Semifinale".
    //   Ricalcola l'etichetta dal campo AFFIDABILE euroPhase (invariata la programmazione: solo il nome del turno).
    {const _EPN={r16:"Ottavi di Finale",quarti:"Quarti di Finale",sf:"Semifinale",final:"Finale"};let _relbl=false;
     const _calR=(newP.calendar||[]).map(m=>(m&&m.type==="euro"&&m.euroPhase&&_EPN[m.euroPhase]&&m.cupRoundName!==_EPN[m.euroPhase])?(_relbl=true,{...m,cupRoundName:_EPN[m.euroPhase]}):m);
     if(_relbl){newP={...newP,calendar:_calR};changed=true;}}
    // [6.64.0 collaudo PO «mi ripropone la semifinale di UCL»] CLEAN dei duplicati/voci euro KO STANTIE: in un save
    //   con la Coppa Europea in fase KO, rimuovi le voci euro NON giocate di un turno GIÀ SUPERATO (euroPhase prima
    //   di euro.phase nell'ordine r16<quarti<sf<final) → una carriera lunga poteva accumularle e farle ripresentare.
    if((newP.proStatus||"u18")==="pro"&&newP.euro?.active&&newP.euro?.phase&&["quarti","sf","final","champion","eliminated"].includes(newP.euro.phase)){
      const _koOrd={r16:0,quarti:1,sf:2,final:3,champion:4,eliminated:4};
      const _curIdx=_koOrd[newP.euro.phase];
      const _before=(newP.calendar||[]).length;
      const _cleaned=(newP.calendar||[]).filter(m=>!(m.type==="euro"&&!m.played&&(_koOrd[m.euroPhase]!=null)&&_koOrd[m.euroPhase]<_curIdx));
      if(_cleaned.length!==_before){newP={...newP,calendar:_cleaned};changed=true;}
    }
    /* [7.291.0 collaudo PO «ho cambiato squadra, la classifica di Champions e' sbagliata, una delle due e'
       proprio la mia ex squadra»] BONIFICA: girone che contiene il TUO STESSO CLUB. Chi ha gia' cambiato
       maglia con la campagna in corso si ritrova nel salvataggio un avversario omonimo — la classifica mostra
       due volte la stessa squadra e l'ex sparisce. Al posto suo entra la squadra che hai appena lasciato
       (dalla cronologia); se la cronologia non basta, un club dello stesso tier pescato in modo seedato.
       Riscrive anche le gare non giocate e i risultati archiviati che portavano quel nome. */
    if((newP.proStatus||"u18")==="pro"&&newP.club&&newP.euro&&(newP.euro.groupOpponents||[]).length){
      const _mc=newP.club,_go=(newP.euro.groupOpponents||[]).slice();
      const _self=_go.findIndex(o=>o&&((o.id&&o.id===_mc.id)||(o.n&&o.n===_mc.n)));
      if(_self>=0){
        const _prev=[...(newP.history||[])].reverse().find(h=>h&&h.clubId&&h.clubId!==_mc.id);
        let _sub=_prev?CLUBS.find(c=>c.id===_prev.clubId):null;
        if(!_sub){/* nessuna cronologia utile: un avversario dello stesso livello, seedato e mai duplicato */
          const _used=new Set([_mc.id,..._go.map(o=>o&&o.id)]);
          const _pool=CLUBS.filter(c=>!c.isU18&&!_used.has(c.id)&&c.lg!==_mc.lg&&Math.abs((c.p||60)-(_mc.p||60))<=12);
          if(_pool.length)_sub=_pool[Math.abs(hashStr((_mc.id||"x")+"|euroself|"+(newP.season||1)))%_pool.length];
        }
        if(_sub){
          const _so={id:_sub.id,n:_sub.n,a:_sub.a,p:_sub.p,c:_sub.c,c2:_sub.c2,nat:_sub.nat,lg:_sub.lg};
          _go[_self]=_so;
          newP={...newP,euro:{...newP.euro,groupOpponents:_go,
              groupResults:(newP.euro.groupResults||[]).map(r=>(r&&r.opp===_mc.n)?{...r,opp:_so.n}:r)},
            calendar:(newP.calendar||[]).map(m=>(m&&(m.type==="euro_group"||m.type==="euro")&&!m.played&&((m.opponentId&&m.opponentId===_mc.id)||(m.opponentName&&m.opponentName===_mc.n)))
              ?{...m,opponentId:_so.id,opponentName:_so.n,opponentData:_so}:m),
            log:[`🌍 Girone corretto: nella tua ex casella entra il ${_so.n} — non si gioca contro se stessi.`,...(newP.log||[])].slice(0,60)};
          changed=true;
        }
      }
    }
    /* [7.292.0 collaudo PO «continuo a vedere il cammino della coppa nazionale sbagliato!»] BONIFICA della
       COPPA che appartiene a un'ALTRA squadra. Il 7.291.0 corregge il cammino al momento del TRASFERIMENTO,
       ma chi aveva gia' cambiato maglia prima si porta dietro nel salvataggio il tabellone dell'ex club —
       senza nessun timbro, quindi il pannello non poteva nemmeno dichiararlo. Il segnale e' netto: se il
       TABELLONE non contiene il club attuale, quel cammino non e' suo. Allora si timbra col club che l'ha
       davvero disputato (dalla cronologia) e il pannello lo dice; se invece il club c'e', si timbra col suo
       id e nulla cambia a schermo. Non si RICREA il cammino al caricamento: su un salvataggio in corso
       sarebbe una manomissione, e dal prossimo trasferimento ci pensa il 7.291.0. */
    if((newP.proStatus||"u18")==="pro"&&newP.club&&newP.cup&&!newP.cup.club){
      const _cid=newP.club.id,_br=newP.cup.bracket||[];
      let _own=_cid;
      if(_br.length&&_br.indexOf(_cid)<0){
        const _pv=[...(newP.history||[])].reverse().find(h=>h&&h.clubId&&h.clubId!==_cid&&_br.indexOf(h.clubId)>=0)
          ||[...(newP.history||[])].reverse().find(h=>h&&h.clubId&&h.clubId!==_cid);
        if(_pv)_own=_pv.clubId;
      }
      newP={...newP,cup:{...newP.cup,club:_own}};changed=true;
      /* [7.293.0 #117 collaudo PO «continuo a vedere il cammino della coppa nazionale sbagliato!»] Il solo TIMBRO
         non bastava: chi aveva gia' cambiato maglia continuava a vedere, sotto «Coppa Nazionale — S.N», il
         cammino di un'altra squadra (per giunta di un'altra nazione) con tanto di tabellone. Il 7.292.0 si era
         fermato al timbro per non «manomettere» un salvataggio in corso — il collaudo dice che la prudenza qui
         produce solo una schermata che non e' tua. Quindi si fa lo STESSO di `acceptTransfer`: se il cammino e'
         di un'altra squadra e a calendario c'e' ancora spazio, la Coppa RIPARTE col club attuale dal turno che
         ci sta; se spazio non ce n'e', resta timbrato e il pannello lo dichiara senza mostrare il tabellone. */
      if(_own!==_cid){
        const _wk=newP.week||1,_CW=[0,9,19,28,35],_CN=["","Ottavi di Finale","Quarti di Finale","Semifinale","FINALE"];
        let _rd=0;for(let r=1;r<=4;r++){if(_CW[r]>_wk){_rd=r;break;}}
        const _busy=new Set((newP.calendar||[]).filter(m=>!m.played).map(m=>m.week));
        let _w=0;if(_rd){for(let d=0;d<3;d++){const c=_CW[_rd]+d;if(c<=37&&!_busy.has(c)){_w=c;break;}}}
        let _pool=[];try{_pool=(getLeagueClubs(newP)||[]).filter(c=>c&&c.id!==_cid);}catch(_e){}
        if(_rd&&_w&&_pool.length){
          const _opp=_pool[Math.abs(hashStr(String(_cid)+"cupHeal293"+(newP.season||1)+_rd))%_pool.length];
          const _brNew=[_cid,..._pool.slice(0,15).map(c=>c.id)];
          newP={...newP,cup:{active:true,round:_rd,champion:false,eliminated:false,results:[],bracket:_brNew,
              cupSurvivors:_brNew.slice(0,Math.max(2,16>>(_rd-1))),nextWeek:_w,club:_cid},
            calendar:[...(newP.calendar||[]),{matchday:990+_rd,week:_w,isHome:(Math.abs(hashStr(String(_cid)+"cupHealH293"+(newP.season||1)))>>>2)%2===0,
              played:false,result:null,type:"cup",competition:"Coppa Nazionale",cupRound:_rd,cupRoundName:_CN[_rd],
              opponentId:_opp.id,opponentName:_opp.n}].sort((x,y)=>(x.week||0)-(y.week||0)),
            log:[`🏆 Coppa Nazionale: col nuovo club riparti dai ${_CN[_rd]}`,...(newP.log||[])].slice(0,60)};
        }
      }
    }
    /* [7.295.0 collaudo PO «continuo a vedere solo gli obiettivi della squadra corrente»] Il 7.293/7.294 agisce
       AL MOMENTO del trasferimento: chi la maglia l'aveva gia' cambiata resta col bersaglio pieno di un anno
       intero («Segna 20 gol» a 13/20 alla 36ª) e non vede nulla di nuovo — stessa lezione della Coppa (7.292 →
       7.293): una correzione agganciata all'evento non raggiunge chi l'evento l'ha gia' passato.
       ⚠️ Il bottino della prima parte NON e' ricostruibile da questi salvataggi: il vecchio codice azzerava
       gol/assist/presenze, `worldMemory` registra il club lasciato ma non i suoi numeri, e i gol dei provini
       stanno dentro `totalGoals` senza traccia separata — quindi qualunque «recupero» sarebbe un numero
       inventato. Qui si ripara l'unica cosa riparabile con dati veri: l'OBIETTIVO. I contatori del salvataggio
       gia' ripartono da questa maglia (li aveva azzerati il trasferimento), quindi sono per definizione
       club-scoped: basta dichiararlo e riscalare il bersaglio sulla quota di stagione giocata qui, misurata
       sulle giornate di campionato disputate dall'eroe contro quelle disputate dal club. */
    if((newP.proStatus||"u18")==="pro"&&newP.club&&(newP.seasonObjectives||[]).length&&!newP.seasonCarry
       &&(newP.offerHistory||[]).some(o=>o&&o.accepted&&o.season===(newP.season||1))
       &&(newP.seasonObjectives||[]).some(o=>o&&o.target&&o.type!=="standing"&&!o.clubScoped)){
      const _mhL=(newP.matchHistory||[]).filter(m=>m&&!m.cup&&!m.euro&&!m.national).length;
      const _row=[...(newP.standings||[])].find(t=>t&&(t.id===(newP.club.id)||(t.n||t.name)===(newP.club.n)));
      const _pl=(_row&&_row.played)||0;
      if(_pl>0&&_mhL>0&&_mhL<_pl){
        const _sh=clamp(_mhL/_pl,0.2,1);
        newP={...newP,seasonObjectives:(newP.seasonObjectives||[]).map(o=>{
          if(!o||o.type==="standing"||!o.target||o.clubScoped)return o;
          const t=Math.max(2,Math.round(o.target*_sh));
          return{...o,target:t,clubScoped:true,label:String(o.label||"").replace(/\d+/,String(t))+" col nuovo club"};})};
        changed=true;
      }
    }
    // [5.93.0 BIL-7] repair EURO: stato attivo ma NESSUNA gara in calendario (save post-trasferimento pre-5.93,
    //   es. girone 0/6 a W33) → si ri-aggiungono le gare mancanti a week libere; senza spazio → chiusura onesta.
    if((newP.proStatus||"u18")==="pro"&&newP.euro?.active&&!newP.euro?.eliminated&&!newP.euro?.champion&&!(newP.calendar||[]).some(md=>(md.type==="euro_group"||md.type==="euro")&&!md.played)){
      const _e93used=new Set((newP.calendar||[]).filter(m=>!m.played).map(m=>m.week));
      let _e93w=(newP.week||1);const _e93free=()=>{do{_e93w++;}while(_e93w<=37&&_e93used.has(_e93w));if(_e93w<=37){_e93used.add(_e93w);return _e93w;}return null;};
      const _e93=newP.euro;let _e93cal=[...(newP.calendar||[])];let _e93ok=true;
      if(_e93.phase==="group"){
        // [6.8.2] indicizza dalle voci euro_group GIÀ presenti nel calendario (non solo da groupResults)
        //   → il girone non può MAI superare groupOpponents*2 gare (niente più 7ª gara da desync).
        const _e93pl=Math.max((_e93.groupResults||[]).length,(newP.calendar||[]).filter(m=>m.type==="euro_group").length);
        const _e93tot=((_e93.groupOpponents||[]).length*2)||6;
        for(let i=_e93pl;i<_e93tot;i++){
          const opp=(_e93.groupOpponents||[])[Math.floor(i/2)];const w=opp?_e93free():null;
          if(!opp||w==null){_e93ok=false;break;}
          _e93cal.push({matchday:900+i,week:w,opponentId:opp.id,opponentName:opp.n,isHome:i%2===0,played:false,result:null,type:"euro_group",competition:_e93.competition,opponentData:opp});
        }
      }else if(_e93.phase==="r16"||_e93.phase==="quarti"||_e93.phase==="sf"||_e93.phase==="final"){
        const w=_e93free();
        const _e93minP=_e93.competition==="UCL"?82:_e93.competition==="UEL"?65:52;
        const _e93faced=[...(_e93.groupOpponents||[]).flatMap(o=>[o.id,o.n]),...(_e93.koResults||[]).flatMap(r=>[r.oppId,r.opp,r.opponent])].filter(Boolean);// [6.52.0] anche il repair KO esclude gli avversari già affrontati
        const _e93pool=CLUBS.filter(c=>((((newP.leagueOverrides||{})[c.id])||c.lg)!==(newP.club?.lg))&&!c.isU18&&c.p>=_e93minP&&!_e93faced.includes(c.id)&&!_e93faced.includes(c.n))/* [7.162.0 CAL-F9] */;
        const opp=_e93pool.length?_e93pool[Math.abs(hashStr((newP.club?.id||"x")+"eufix"+(newP.season||1)))%_e93pool.length]:null;
        const _e93phN={r16:"Ottavi di Finale",quarti:"Quarti di Finale",sf:"Semifinale",final:"Finale"}[_e93.phase];
        if(w!=null&&opp)_e93cal.push({matchday:995,week:w,opponentId:opp.id,opponentName:opp.n,isHome:true,played:false,result:null,type:"euro",competition:_e93.competition,euroPhase:_e93.phase,cupRoundName:_e93phN,opponentData:opp});
        else _e93ok=false;
      }else _e93ok=false;
      if(_e93ok)newP={...newP,calendar:_e93cal};
      else newP={...newP,euro:{..._e93,active:false,eliminated:true,phase:"eliminated"}};
      changed=true;
    }
    // [7.15.0 BUG PESANTE collaudo PO «ottavi di finale mai giocati!»] HEAL: save con girone COMPLETO (6/6) ma
    //   fase ancora "group" (zombie da frammentazione dei path pre-7.15) → applica la STESSA transizione condivisa
    //   euroGroupKOPatch: qualificato → R16 programmato (se c'è spazio ≤W37), eliminato → chiusura onesta.
    if((newP.proStatus||"u18")==="pro"&&newP.euro?.active&&newP.euro?.phase==="group"){
      const _koHeal=euroGroupKOPatch(newP);
      if(_koHeal){newP={...newP,..._koHeal};changed=true;}
    }
    // [5.95.0 QW audit CP-2/CP-3] i tornei nazionali completati lasciavano active:true PER SEMPRE
    //   → il trigger (!active) falliva e si giocava UN solo Europeo/Mondiale (e una sola Coppa delle
    //   Nazioni) per carriera. Repair dei save esistenti; i nuovi completamenti settano active:false.
    if(newP.euroMondiale?.active&&(newP.euroMondiale?.done||newP.euroMondiale?.phase==="done")){newP={...newP,euroMondiale:{...newP.euroMondiale,active:false}};changed=true;}
    // [7.41.0] host per i tornei GIÀ attivi nei save pre-7.41 (stessa formula seedata del trigger).
    //   ⚠️ migratePlayer è TOP-LEVEL: natOppPool/NAT_POOL_* vivono in CareerApp → pool INLINE (specchio 1:1
    //   delle const di CareerApp — se cambiano lì, cambiare anche qui).
    if(newP.euroMondiale?.active&&!newP.euroMondiale.host){
      const _hp41=(newP.euroMondiale.type==="Mondiale")?["Italia","Spagna","Francia","Germania","Inghilterra","Portogallo","Olanda","Belgio","Brasile","Argentina"]:["Italia","Spagna","Francia","Germania","Inghilterra","Portogallo","Olanda","Belgio"];
      newP={...newP,euroMondiale:{...newP.euroMondiale,host:_hp41[hashStr((newP.nation||"Italia")+(newP.euroMondiale.type||"Europeo")+(newP.euroMondiale.season||newP.season||1)+"|host")%Math.max(1,_hp41.length)]||"Italia"}};
      changed=true;
    }
    if(newP.nationsCupQueue?.active&&newP.nationsCupQueue?.done){newP={...newP,nationsCupQueue:{...newP.nationsCupQueue,active:false}};changed=true;}
    // [6.50.0 collaudo PO «è andato in loop sulla stessa partita» / «dopo due giornate rigioco contro la stessa
    //   squadra» / «non riesco ad andare avanti»] SELF-HEAL del calendario di LEGA. Dopo N stagioni di rebuild
    //   (acceptTransfer) + repair coppa/euro, la classe round-robin poteva accumulare (a) DUE gare di lega nella
    //   STESSA settimana e (b) lo STESSO fixture avversario+sede duplicato → l'utente rigiocava la stessa squadra
    //   e, con la doppia gara a settimana, la giornata sembrava «in loop». Heal IDEMPOTENTE e SICURO:
    //     • tocca SOLO le voci di LEGA (type assente/"league") — coppa/euro INTATTE (e una gara di lega PUÒ
    //       legittimamente condividere la settimana con una di coppa/euro: la collisione vietata è SOLO lega↔lega);
    //     • non muove MAI le partite GIÀ GIOCATE (la storia è sacra);
    //     • deduplica i fixture (avversario+sede è UNICO in un doppio round-robin) e spinge in avanti le collisioni
    //       di settimana lega↔lega a una week libera ≤38.
    //   Su un calendario sano è un NO-OP → zero regressione. Guardiano: career-invariants (INV calendario lega).
    {
      const _cal50=newP.calendar||[];
      const _isLeague50=(m)=>!m.type||m.type==="league";
      const _lg50=_cal50.filter(_isLeague50);
      if(_lg50.length){
        const _fixKey50=(m)=>`${m.opponentId||m.opponentName||"?"}|${m.isHome?"H":"A"}`;
        // 1) DEDUP fixture (opp+sede): tieni la GIOCATA se c'è, altrimenti la prima per matchday; scarta le altre.
        const _seen50=new Set();let _dupRemoved50=0;
        const _lgDedup50=[..._lg50].sort((a,b)=>((a.played?0:1)-(b.played?0:1))||((a.matchday||0)-(b.matchday||0)))
          .filter(m=>{const k=_fixKey50(m);if(_seen50.has(k)){_dupRemoved50++;return false;}_seen50.add(k);return true;});
        // 2) COLLISIONI di settimana lega↔lega tra voci NON giocate: spingi le successive a una week libera ≤38.
        const _usedLgWk50=new Set();let _weekMoved50=0;
        _lgDedup50.filter(m=>m.played).forEach(m=>_usedLgWk50.add(m.week));
        const _lgClean50=[..._lgDedup50].sort((a,b)=>(a.matchday||0)-(b.matchday||0)).map(m=>{
          if(m.played)return m;
          let w=m.week||1;
          if(_usedLgWk50.has(w)){let nw=w;while(nw<=38&&_usedLgWk50.has(nw))nw++;if(nw<=38){w=nw;_weekMoved50++;}}
          _usedLgWk50.add(w);
          return w===(m.week||1)?m:{...m,week:w};
        });
        if(_dupRemoved50>0||_weekMoved50>0){
          newP={...newP,calendar:[..._cal50.filter(m=>!_isLeague50(m)),..._lgClean50]};
          changed=true;
        }
      }
    }
    if(!('seasonObjectives' in newP)){
      newP={...newP,seasonObjectives:generateSeasonObjectives(newP)};
      changed=true;
    }
    // [7.40.1 collaudo PO «valore troppo basso»] RIVALUTAZIONE una tantum dei save esistenti: la curva
    //   7.40.1 alza la scala del mercato — senza ri-àncora lo smoothing settimanale 70/30 impiegherebbe
    //   ~9 settimane a convergere. Si porta subito all'80% del ricalcolo (il resto lo fa la smoothing),
    //   con voce nelle Notizie; il piano del procuratore si rigenera sulla nuova baseline (il blocco sotto).
    if((newP.proStatus||"u18")==="pro"){
      const _cmv41=calcMarketValue(newP);
      if((newP.value||0)<_cmv41*0.5){
        const _nv41=Math.round(_cmv41*0.8*100)/100;
        const _nvS41=_nv41>=1?(Math.round(_nv41*10)/10)+"M":Math.round(_nv41*1000)+"k";
        newP={...newP,value:_nv41,agentPlan:null,log:[`📈 Rivalutazione di mercato: il tuo cartellino ora vale €${_nvS41} — le tue stagioni e i tuoi gol pesano.`,...(newP.log||[])].slice(0,60)};
        changed=true;
      }
    }
    // [7.40.0 §9.7] piano del procuratore per i save esistenti/pre-7.40: baseline = valore corrente (una tantum;
    //   dalle prossime stagioni lo scrive il rollover). Solo pro — l'U18 non ha un procuratore con un piano.
    if((newP.proStatus||"u18")==="pro"&&newP.hasAgent&&(!newP.agentPlan||newP.agentPlan.season!==(newP.season||1))){
      const _v740=Math.max(0.1,newP.value||0.5);const _a740=newP.age||20;const _m740=_a740<=23?1.35:_a740<=27?1.2:_a740<=30?1.08:1.0;
      newP={...newP,agentPlan:{season:newP.season||1,base:Math.round(_v740*100)/100,target:Math.round(_v740*_m740*100)/100,hold:_m740===1.0}};
      changed=true;
    }
    if(!('nationalCaps' in newP)){
      newP={...newP,nationalCaps:0,lastNationalSeason:0};
      changed=true;
    }
    if(!('clubPrestigeShifts' in newP)){
      newP={...newP,clubPrestigeShifts:{}};
      changed=true;
    }
    if(!('clubEvo' in newP)){/* [7.6.0 FASE 2] evoluzione del club del giocatore */
      newP={...newP,clubEvo:{fanbase:0,stadiumTier:0,budget:0,seasonsTop:0,seasonsLow:0,clubId:(newP.club&&(newP.club.id||newP.club.n))||null}};
      changed=true;
    }
    if(!('clubSponsor' in newP)&&(newP.proStatus||"u18")==="pro"&&newP.club&&typeof genClubSponsor==="function"){/* [7.131.0] sponsor di maglia (lazy, no bump SAVE) */
      newP={...newP,clubSponsor:genClubSponsor(newP.club,newP.season||1,((newP.clubPrestigeShifts||{})[newP.club.id||newP.club.n]||0)+(newP.club.p||60))};
      changed=true;
    }
    if(!('cup' in newP)){
      newP={...newP,cup:null};
      changed=true;
    }
    if(!('coach' in newP)){
      newP={...newP,coach:{name:"Mister "+pick(COACH_NAMES),style:"Bilanciato",trustMod:0}};
      changed=true;
    }
    if(!('archetype' in newP)){
      newP={...newP,archetype:ARCHETYPES[0]};
      changed=true;
    }
    if(!('goldenBoys' in newP)){
      newP={...newP,goldenBoys:[]};
      changed=true;
    }
    if(!('records' in newP)){
      newP={...newP,records:{topSeasonGoals:0,topSeasonAssists:0,topOvr:newP.ovr||60}};
      changed=true;
    }
    if(!('playerAwards' in newP)){ // Sprint 49
      newP={...newP,playerAwards:{palloneOros:[],scarpaOros:[],youngYears:[],seasonRecords:[]}};
      changed=true;
    }
    if(!('milestones' in newP)){
      // Pre-populate already-reached milestones to avoid notification spam on old saves
      newP={...newP,milestones:CAREER_MILESTONES.filter(m=>m.check(newP)).map(m=>m.id)};
      changed=true;
    }
    if(!('achievements' in newP)){newP={...newP,achievements:[]};changed=true;}
    if(!('rivalries' in newP)){newP={...newP,rivalries:[]};changed=true;}
    if(!('worldMemory' in newP)){newP={...newP,worldMemory:[]};changed=true;}
    if(!('dreamClub' in newP)){newP={...newP,dreamClub:null};changed=true;}
    // Generate rival when pro and none exists yet
    if(!('rival' in newP)||(newP.proStatus==="pro"&&!newP.rival&&newP.club)){
      newP={...newP,rival:(newP.proStatus==="pro"&&newP.club)?generateRival(newP):null};
      changed=true;
    }
    // Sprint 24 migrations
    if(!('teammates' in newP)){newP={...newP,teammates:generateTeammates(newP)};changed=true;}
    // [7.106.3 collaudo PO «Nino non lo vedo in rosa»] ri-sincronizza i nomi dei compagni alla rosa CORRENTE (real players)
    else{const _syncT=syncTeammateNames(newP);if(_syncT!==newP.teammates){newP={...newP,teammates:_syncT};changed=true;}}
    if(newP.isCaptain&&(newP.teammates||[]).some(t=>t&&t.archetype==="capitano")){newP={...newP,teammates:newP.teammates.map(t=>t&&t.archetype==="capitano"?{...t,archetype:"ex_capitano",icon:"🎖️"}:t)};changed=true;}/* [7.179.0 HEAL] save con DUE capitani (eroe + compagno): il compagno cede la fascia */
    {/* [7.184.0 HEAL collaudo PO «troppi ex capitano!»] ex_capitano usciva anche dal pool casuale → save con 2+ «L'Ex Capitano»
        (o con un ex_capitano senza che l'eroe abbia MAI preso la fascia = «ti ha ceduto la fascia» falso). Tiene al massimo
        UN ex_capitano (solo se l'eroe è capitano); gli spuri vengono rimappati al primo archetipo LIBERO (se capitano è
        libero e l'eroe non ha la fascia, torna «Il Capitano» — il ruolo più naturale). Deterministico, idempotente. */
      const _tms84=newP.teammates||[];const _exN84=_tms84.filter(t=>t&&t.archetype==="ex_capitano").length;
      if(_exN84>1||(_exN84>0&&!newP.isCaptain)){
        const _keep84=newP.isCaptain?1:0;let _seen84=0;
        const _used84=new Set(_tms84.map(t=>t&&t.archetype));
        const _free84=TEAMMATE_ARCHETYPES.map(a=>a.id).filter(id=>id!=="ex_capitano"&&!_used84.has(id)&&!(newP.isCaptain&&id==="capitano"));/* con la fascia all'eroe niente rimappa a «capitano» (ricreerebbe i due capitani → oscillazione col heal 7.179) */
        newP={...newP,teammates:_tms84.map(t=>{
          if(!t||t.archetype!=="ex_capitano")return t;
          _seen84++;if(_seen84<=_keep84)return t;
          const _nid84=_free84.shift()||"amico";const _na84=TEAMMATE_ARCHETYPES.find(a=>a.id===_nid84);
          return {...t,archetype:_nid84,icon:(_na84&&_na84.icon)||"😄"};
        })};changed=true;
      }
    }
    if(!('journalists' in newP)){newP={...newP,journalists:generateJournalists()};changed=true;}
    // Sprint 25 migrations
    if(!('momentsFired' in newP)){newP={...newP,momentsFired:[]};changed=true;}
    if(!('isCaptain' in newP)){newP={...newP,isCaptain:false};changed=true;}
    if(!('captainSince' in newP)){newP={...newP,captainSince:null};changed=true;}
    if(!('fanLegend' in newP)){newP={...newP,fanLegend:[]};changed=true;}
    /* [7.338.0 HEAL] il rifiuto di un'offerta importante (7.307.0) faceva `(p.fanLegend||0)+2` su un campo che
       e' un ARRAY: il salvataggio si ritrovava con la stringa "2" e ogni lettura successiva (curva, achievement
       bandiera, numeri di maglia liberi) lanciava. I save gia' colpiti si bonificano al caricamento. */
    if(!Array.isArray(newP.fanLegend)){newP={...newP,fanLegend:[]};changed=true;}
    // Sprint 26 migrations
    if(!('hasAgent' in newP)){newP={...newP,hasAgent:false};changed=true;}
    /* [7.374.0 Procuratore R1] chi ha GIA' un agente riceve la RELAZIONE senza cambiare procuratore:
       il nome resta quello che il gioco derivava dal nome del giocatore (stesso hash, stesso pool),
       cosi' chi ha una carriera in corso ritrova la stessa persona. L'archetipo si deduce dallo
       `agentStyle` gia' scelto (boutique = cura del rapporto → prudente; global = porte aperte →
       commerciale), senza inventare nulla. Additivo: nessun bump di SAVE_VERSION, e ogni consumatore
       tollera l'assenza del campo — se manca, il gioco e' identico a prima. */
    if(!Array.isArray(newP.agentHistory)){newP={...newP,agentHistory:[]};changed=true;}/* [7.379.0 R6] additivo: storico dei procuratori */
    if(!('agentInit' in newP)){newP={...newP,agentInit:{k:null,s:0,w:0,open:false}};changed=true;}/* [7.378.0 R5] additivo */
    if(!('agentCheckin' in newP)){newP={...newP,agentCheckin:{due:false}};changed=true;}/* [7.377.0 R4] additivo: se manca, nessun confronto in sospeso */
    if(!('agentHint' in newP)){newP={...newP,agentHint:{n:0,s:0,w:0,due:null}};changed=true;}/* [7.375.0 R2] additivo: se manca, nessun reminder e' mai stato mostrato — comportamento identico a prima */
    if(newP.hasAgent&&!newP.agent){try{
      const _nm=agentNameFor(newP);
      const _ar=newP.agentStyle==="global"?"commerciale":"prudente";
      newP={...newP,agent:agentInit({id:_ar,arch:_ar,name:_nm,season:newP.season||1,week:newP.week||1})};changed=true;
    }catch(_e){}}
    if(!('bankBalance' in newP)){newP={...newP,bankBalance:0};changed=true;}// v8 [5.81.0] economia
    if(!('perkTrainer' in newP)){newP={...newP,perkTrainer:false};changed=true;}
    if(!('perkNutrition' in newP)){newP={...newP,perkNutrition:false};changed=true;}
    if(!('nationalGoals' in newP)){newP={...newP,nationalGoals:0};changed=true;}
    if(!('presidentModalSeason' in newP)){newP={...newP,presidentModalSeason:0};changed=true;}
    if(!('justRecovered' in newP)){newP={...newP,justRecovered:false};changed=true;}
    // Sprint 119 migrations
    if(!('injurySeverity' in newP)){newP={...newP,injurySeverity:null};changed=true;}
    if(!('originalInjuryWeeks' in newP)){newP={...newP,originalInjuryWeeks:newP.injuryWeeks||0};changed=true;}
    if(!('returnPenaltyWeeks' in newP)){newP={...newP,returnPenaltyWeeks:0};changed=true;}
    // Sprint 120 migrations
    if(!('teamChemistry' in newP)){newP={...newP,teamChemistry:60};changed=true;}
    // F8 (5.29.0): piede preferito (~22% mancini, deterministico da nome+nazione)
    if(!('foot' in newP)){newP={...newP,foot:(Math.abs(hashStr((newP.name||"")+(newP.nation||"")))%100)<22?"L":"R"};changed=true;}
    // Sprint 28 migrations
    if(!('leagueArchive' in newP)){newP={...newP,leagueArchive:[]};changed=true;}
    // Sprint 42 migrations
    if(!('euro' in newP)){newP={...newP,euro:null};changed=true;}
    // Sprint 43 migrations
    if(!('nationsCupQueue' in newP)){newP={...newP,nationsCupQueue:null};changed=true;}
    if(!('euroMondiale' in newP)){newP={...newP,euroMondiale:null};changed=true;} // Sprint 53
    if(newP.rival&&!('history' in newP.rival)){ // Sprint 57: rival career history
      newP={...newP,rival:{...newP.rival,history:[],awards:{palloneOros:[],scarpaOros:[]},trophies:newP.rival.trophies||0}};
      changed=true;
    }
    if(!('tutorialDone' in newP)){ // Sprint 56: skip tutorial for existing saves
      newP={...newP,tutorialDone:(newP.totalMatches||0)>0||(newP.season||1)>1};
      changed=true;
    }
    if(!('goalStreak' in newP)){ // Sprint 59: goal streak tracking
      newP={...newP,goalStreak:0,bestGoalStreak:0};changed=true;
    }
    if(!('lastMonthlyReview' in newP)){ // Sprint 60: quarterly coach review
      newP={...newP,lastMonthlyReview:0};changed=true;
    }
    if(!('weeklyFocusType' in newP)){ // Sprint 65: weekly training focus
      newP={...newP,weeklyFocusType:null};changed=true;
    }
    if(!('coachHistory' in newP)){ // Sprint 70: coach career history
      newP={...newP,coachHistory:[]};changed=true;
    }
    if(!('jerseyNum' in newP)){newP={...newP,jerseyNum:10,jerseyNumSeason:0};changed=true;} // Sprint 74
    if(!('yellAccum' in newP)){newP={...newP,yellAccum:0,isSuspended:false,seasonCards:{y:0,r:0}};changed=true;} // Sprint 75
    if(!('leagueOverrides' in newP)){newP={...newP,leagueOverrides:{}};changed=true;} // Sprint 84
    // [7.0.2 collaudo PO «la Salernitana è ANCORA marrone, anche in partita»] REFRESH identità visiva del club:
    //   il save porta uno SNAPSHOT del club (copiato alla firma) → i colori sociali corretti in CLUBS (7.0.0)
    //   non arrivavano mai ai save esistenti. Risincronizza SOLO n/a/c/c2/nat per id — MAI lg (le promozioni
    //   vivono nel save + leagueOverrides) né p (il prestigio evolve). Vale anche per il club madre del prestito.
    {const _syncClub70=(c)=>{if(!c||!c.id)return c;
       const _pool=(c.isU18&&typeof ALL_U18_CLUBS!=="undefined")?ALL_U18_CLUBS:CLUBS;
       const src=_pool.find(k=>k.id===c.id);if(!src)return c;
       if(c.c!==src.c||c.c2!==src.c2||c.n!==src.n||c.a!==src.a||c.nat!==src.nat){changed=true;return{...c,n:src.n,a:src.a,c:src.c,c2:src.c2,nat:src.nat};}
       return c;};
     const _nc70=_syncClub70(newP.club);if(_nc70!==newP.club)newP={...newP,club:_nc70};
     /* [7.263.0 collaudo PO «FC Hornets con lo stemma WAT»] la CLASSIFICA salvata e' uno snapshot dei club
        (initStandings fa lo spread di ogni club): senza questa bonifica un save in corso avrebbe continuato a
        mostrare le SIGLE VECCHIE nella tabella mentre il resto del gioco usa quelle nuove. Stesso pattern di
        _syncClub70, per id, solo campi di DISPLAY (mai punti/partite/gol). */
     if(Array.isArray(newP.standings)&&newP.standings.length){let _stCh=false;
       const _st70=newP.standings.map(r=>{const q=_syncClub70(r);if(q!==r)_stCh=true;return q;});
       if(_stCh){newP={...newP,standings:_st70};changed=true;}}
     if(newP.loan&&newP.loan.parentClub){const _pc70=_syncClub70(newP.loan.parentClub);if(_pc70!==newP.loan.parentClub)newP={...newP,loan:{...newP.loan,parentClub:_pc70}};}}
    if(!('lastLeagueShift' in newP)){newP={...newP,lastLeagueShift:null};changed=true;} // Sprint 110
    if(!('skillPoints' in newP)||newP.skillPoints==null){newP={...newP,skillPoints:0};changed=true;} // Sprint 104B
    if(!('u18Goals' in newP)){newP={...newP,u18Goals:0,u18Assists:0,u18Matches:0};changed=true;} // Sprint 105
    if(!('primaveraAwards' in newP)){newP={...newP,primaveraAwards:[]};changed=true;} // Sprint 105
    if(!('mvpMonthAwards' in newP)){newP={...newP,mvpMonthAwards:[]};changed=true;} // Sprint 130
    // Sprint 134: nuovi premi di lega in playerAwards
    if(newP.playerAwards&&!('leagueMvpYears' in newP.playerAwards)){newP={...newP,playerAwards:{...newP.playerAwards,leagueMvpYears:[],leagueTopScorerYears:[],teamOfYearYears:[]}};changed=true;}
    // [6.37.0 STAB-17] normalizza sul valore GREZZO: con la vecchia guardia (newP.form||70) un form===0 (falsy)
    //   diventava 70 → la condizione non scattava mai e lo 0 (o altri valori corrotti) restava non corretto.
    if(typeof newP.form!=='number'||!isFinite(newP.form)||newP.form<30||newP.form>95){newP={...newP,form:clamp((typeof newP.form==='number'&&isFinite(newP.form))?newP.form:70,30,95)};changed=true;} // Sprint 150 + 6.37.0: normalize form to canonical [30,95]
    // [6.74.0 QA-P0] de-branding: risincronizza nei save esistenti i 4 club rinominati (id stabili)
    {const _rn74={psv:["FC Brabantia","BRB"],club:["FC Fiandria","FIA"],and:["FC Bruxella","BRX"],soch:["FC Doubs","FCD"]};
     const _rnFix74=(c)=>{if(!c||!c.id||!_rn74[c.id]||c.n===_rn74[c.id][0])return c;const[_n,_a]=_rn74[c.id];return{...c,n:_n,a:_a,...(c.name?{name:_n+(c.isU18?" U18":"")}:{})};};
     if(newP.club&&_rn74[newP.club.id]&&newP.club.n!==_rn74[newP.club.id][0]){newP={...newP,club:_rnFix74(newP.club)};changed=true;}
     if((newP.standings||[]).some(t=>_rn74[t.id]&&t.n!==_rn74[t.id][0])){newP={...newP,standings:newP.standings.map(t=>_rn74[t.id]&&t.n!==_rn74[t.id][0]?{...t,n:_rn74[t.id][0]}:t)};changed=true;}
     if((newP.calendar||[]).some(m=>_rn74[m.opponentId]&&m.opponentName!==_rn74[m.opponentId][0])){newP={...newP,calendar:newP.calendar.map(m=>_rn74[m.opponentId]&&m.opponentName!==_rn74[m.opponentId][0]?{...m,opponentName:_rn74[m.opponentId][0]}:m)};changed=true;}}
    // [6.74.0 QA-18] sanifica le 8 stat: una chiave mancante/NaN (save corrotto parzialmente) produceva
    //   calcOvr=NaN che propagava a ingaggi/valore senza MAI auto-ripararsi. Backfill difensivo + ricalcolo ovr.
    {const _SK74=["velocità","tecnica","fisico","mentalità","tiro","passaggio","dribbling","posizionamento"];
     const _st74=newP.stats||{};let _stBad74=!newP.stats;
     _SK74.forEach(k=>{const v=_st74[k];if(typeof v!=='number'||!isFinite(v)||v<1||v>99)_stBad74=true;});
     if(_stBad74){const _fix74={..._st74};_SK74.forEach(k=>{const v=_fix74[k];_fix74[k]=(typeof v==='number'&&isFinite(v))?clamp(Math.round(v),1,99):60;});newP={...newP,stats:_fix74,ovr:calcOvr(_fix74)};changed=true;}
     else if(typeof newP.ovr!=='number'||!isFinite(newP.ovr)){newP={...newP,ovr:calcOvr(_st74)};changed=true;}}
    if(!('totalGoals' in newP)){newP={...newP,totalGoals:0};changed=true;} // Sprint 152
    if(!('totalAssists' in newP)){newP={...newP,totalAssists:0};changed=true;} // Sprint 152
    if(!('totalMatches' in newP)){newP={...newP,totalMatches:0};changed=true;} // Sprint 152
    // Sprint 216: normalize history entries — fill missing clubId by name-lookup in CLUBS/U18_CLUBS
    if((newP.history||[]).some(h=>!h.clubId)){
      const _allC=[...CLUBS,...U18_CLUBS];
      newP={...newP,history:(newP.history||[]).map(h=>{
        if(h.clubId)return h;
        const _found=_allC.find(c=>c.n===h.club||c.name===h.club);
        return{...h,clubId:_found?_found.id:(h.club||"unknown")};
      })};
      changed=true;
    }
    // Sprint D2: rapporti staff
    if(!('assistantCoachRel' in newP)){newP={...newP,assistantCoachRel:50};changed=true;}
    if(!('matchStatus' in newP)){newP={...newP,matchStatus:null};changed=true;}
    if(!('fitnessCoachRel' in newP)){newP={...newP,fitnessCoachRel:50};changed=true;}
    // Sprint D1: gerarchia di squadra
    if(!('squadRole' in newP)){newP={...newP,squadRole:calcSquadRole(newP)};changed=true;}
    // Sprint E-1: promessa del mister
    if(!('coachPromise' in newP)){newP={...newP,coachPromise:null};changed=true;}
    // Sprint C: ritiro pre-campionato — save in corso a metà stagione non lo rivede
    if(!('campDone' in newP)){newP={...newP,campDone:(newP.week||1)>1};changed=true;}
    // Sprint E-3: prestiti reali
    if(!('loan' in newP)){newP={...newP,loan:null};changed=true;}
    // Fase 1 copyright: league rename migration (real names + 4.x intermediate fictional names → current)
    const _lgMap={"Serie A":"Lega A","Serie B":"Lega B","Premier League":"Premier Division","EFL Championship":"Championship","La Liga":"Liga Ibérica","Bundesliga":"Deutsche Liga","2. Bundesliga":"Deutsche Liga 2","Ligue 1":"Ligue Nationale","Ligue 2":"Ligue Nationale 2","1. Liga":"Deutsche Liga","2. Liga":"Deutsche Liga 2","Primera División":"Liga Ibérica","Segunda División":"Liga Ibérica 2","Eredivisie":"Liga Oranje","Pro League":"Liga Belga","Süper Lig":"Liga Anatolica","Primeira Liga":"Liga Lusitana"};
    if(newP.club?.lg&&_lgMap[newP.club.lg]){newP={...newP,club:{...newP.club,lg:_lgMap[newP.club.lg]}};changed=true;}
    if((newP.proStatus||"u18")==="pro"&&newP.club?.id){const _fc=CLUBS.find(c=>c.id===newP.club.id&&(c.lg===newP.club.lg||c.n===newP.club.n));if(_fc){
      // [7.0.2] il repair di rinomina NON deve rivertire le PROMOZIONI: la lega effettiva del club è quella
      //   degli override (promozioni/retrocessioni) quando presente, altrimenti quella statica del DB.
      const _lgEff70=(newP.leagueOverrides||{})[newP.club.id]||_fc.lg;
      if(_fc.n!==newP.club.n||_fc.a!==newP.club.a||_lgEff70!==newP.club.lg){newP={...newP,club:{...newP.club,n:_fc.n,a:_fc.a,lg:_lgEff70}};changed=true;}}}
    // Fix-A: reconcile standings to full current league size (repairs old saves with 14-club leagues)
    if((newP.proStatus||"u18")==="pro"&&Array.isArray(newP.standings)&&newP.standings.length>0){
      const _lcA=getLeagueClubs(newP);
      if(_lcA.length>newP.standings.length){
        const _have=new Set(newP.standings.flatMap(t=>[t.id,t.n]));
        const _add=_lcA.filter(c=>!_have.has(c.id)&&!_have.has(c.n)).map(c=>({...c,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,pts:0}));
        if(_add.length){newP={...newP,standings:[...newP.standings,..._add].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf)};changed=true;}
      }
    }
    // Fix-D: refresh stale opponent/standings club names after club rename (cosmetic, keeps ids)
    if(Array.isArray(newP.standings)&&newP.standings.length){const _ns=newP.standings.map(t=>{const _c=CLUBS.find(c=>c.id===t.id);return _c&&_c.n!==t.n?{...t,n:_c.n,a:_c.a}:t;});if(_ns.some((t,i)=>t!==newP.standings[i])){newP={...newP,standings:_ns};changed=true;}}
    // Fix-Cal: ripara calendario desincronizzato dalla lega corrente (avversari di un altro campionato — es. squadra di Lega A nel calendario di Lega B)
    if((newP.proStatus||"u18")==="pro"&&Array.isArray(newP.calendar)&&newP.calendar.length){
      const _lcCal=getLeagueClubs(newP);
      const _lcIds=new Set(_lcCal.map(c=>c.id));
      const _lcNames=new Set(_lcCal.map(c=>c.n));
      const _pool=_lcCal.filter(c=>c.id!==newP.club?.id&&c.n!==newP.club?.n);
      if(_pool.length){
        let _calChanged=false;
        const _ncal=newP.calendar.map(md=>{
          if(md.type||md.played)return md;                        // coppe/euro e gare già giocate intatte
          if((md.opponentId&&_lcIds.has(md.opponentId))||(md.opponentName&&_lcNames.has(md.opponentName)))return md;  // avversario già valido (per id o per nome)
          const _oi=Math.abs(hashStr((newP.season||1)+"_"+(md.matchday||md.week||0)+"_fixcal"))%_pool.length;
          const _opp=_pool[_oi];
          _calChanged=true;
          return{...md,opponentId:_opp.id,opponentName:_opp.n};
        });
        if(_calChanged){newP={...newP,calendar:_ncal};changed=true;}
      }
    }
  /* [7.53.1 BL-13 — SAVE_VERSION come gate di migrazione REALE] a valle di TUTTE le riparazioni il save
     viene TIMBRATO alla versione corrente e ricorda la sua ORIGINE (migratedFrom = la prima versione da cui
     è stato migrato, scritta una sola volta): (a) un save v7 riparato non resta marcato v7 per sempre —
     lo stamp rende possibile la migrazione VERSIONED (if saveVersion<N) oltre che per-presenza-campo;
     (b) migratedFrom è diagnostica permanente per i bug report («questo save nasce v7»). Lazy, no bump. */
  if((newP.saveVersion||0)!==SAVE_VERSION){
    newP={...newP,...(newP.migratedFrom==null?{migratedFrom:(newP.saveVersion||0)}:{}),saveVersion:SAVE_VERSION};
    changed=true;
  }
  return {player:newP,changed};
}
if(typeof window!=='undefined'){window.__CPM_MIGRATE=migratePlayer;}
/* [7.55.0 ONDA 7 — LA RISONANZA] helper PURI/derivati top-level (accessibili sia dal chokepoint
   weeklyGrowthFields sia dal render di CareerApp), display/effetti bounded, zero campi salvati nuovi salvo
   il puro-lazy stanceSeen (pattern clubProjSeen, no bump SAVE, no migration):
   (1) DRIVER_MORALE — la CARICA emotiva del driver della settimana (mindDriver) come micro-effetto morale
       bounded, NET-NEUTRO sulla distribuzione (costanza=0 modale, altri ±: dopo una sconfitta pesa, dopo una
       grande gara solleva) → l'equilibrio morale resta ~60 (il drift 5% verso 60 non viene sbilanciato);
   (2) deriveStances — le stance CORRENTI di presidente/mister/curva con le STESSE soglie di clubVoices/curvaView
       (sorgente unica, deterministica sullo stato, mai Math.random), null finché lo stato non è valido;
   (3) stanceShift — rileva la TRANSIZIONE verso uno stato FORTE rispetto a stanceSeen (baseline), priorità
       pres>mister>curva, cid-gated (reset a cambio club) → l'evento «cambio di clima» una-tantum. */
const DRIVER_MORALE={rivincita:-1,conferma:2,orgoglio:1,storia:2,futuro:-1,vetrina:1,fame:-2,riscatto:-1,costanza:0};
function deriveStances(p){try{
  if(!p||(p.proStatus||"u18")!=="pro"||!p.club)return null;
  const cid=p.club.id||p.club.n;
  const st=[...(p.standings||[])].sort((a,b)=>(b.pts||0)-(a.pts||0));
  const my=st.findIndex(r=>r&&r.id===cid);const pos=my>=0?my+1:null;
  const objPos=(p.seasonObjectives&&p.seasonObjectives.position)||Math.ceil((st.length||18)/2);
  let pres=null;if(pos!=null&&(p.week||1)>=6){const d=objPos-pos;pres=d>=3?"contento":d<=-4?"freddo":"neutro";}
  const tr=p.coachTrust||70;const mister=tr>=85?"esempio":tr<50?"freddo":"neutro";
  let curva=null;
  if((p.standings||[]).length){const fl=(p.fanLegend||[]).find(f=>f&&f.clubId===cid);const seasons=(fl&&fl.seasons)||0;
    const clubGoals=(p.history||[]).filter(h=>h&&h.clubId===cid).reduce((s,h)=>s+(h.goals||0),0)+(p.goals||0);
    const score=Math.round(seasons*10+clubGoals*0.5+(p.isCaptain?8:0)+(p.popularity||0)*0.15);
    const lg7=(p.matchHistory||[]).filter(m=>m&&!m.cup&&!m.euro&&!m.injured).slice(-7);
    const contest=lg7.length>=7&&lg7.reduce((s,m)=>s+(m.goals||0),0)===0;
    curva=score>=60?"idolo":contest?"contestazione":score>=32?"beniamino":"osservazione";}
  return{cid,pres,mister,curva};
}catch(_e){return null;}}
const STANCE_EVENT={
  pres:{contento:{e:"🤝",who:"Il presidente",t:"È tornato a sorridere in tribuna: il tuo rendimento gli dà ragione davanti ai soci.",fx:{morale:2,popularity:2}},
        freddo:{e:"🥶",who:"Il presidente",t:"Ha smesso di rilasciare dichiarazioni: la classifica non è quella promessa, e il silenzio pesa.",fx:{morale:-3}}},
  mister:{esempio:{e:"🎯",who:"Il mister",t:"Ti ha promosso a ESEMPIO in sala video: «Guardate come si muove». Nello spogliatoio se ne accorgono.",fx:{morale:2}},
          freddo:{e:"🧊",who:"Il mister",t:"Qualcosa si è raffreddato: ti parla meno, ti corregge di più. La fiducia si riconquista sul campo.",fx:{morale:-2}}},
  curva:{idolo:{e:"👑",who:"La curva",t:"Il tuo nome è ora un CORO fisso: la Sud ti ha eletto suo idolo. Uno di loro, per sempre.",fx:{morale:2,popularity:3}},
         contestazione:{e:"📢",who:"La curva",t:"Il digiuno ha spento i cori: mugugni e uno striscione secco. «Un gol e torniamo a cantare».",fx:{morale:-3}}},
};
function stanceShift(p){try{
  const cur=deriveStances(p);if(!cur)return null;
  const seen=p&&p.stanceSeen;
  if(!seen||seen.cid!==cur.cid)return null;/* baseline non ancora fissato per questo club (lo seeda l'effect) → niente fire */
  for(const who of ["pres","mister","curva"]){
    const c=cur[who],s=seen[who],ev=c&&STANCE_EVENT[who]&&STANCE_EVENT[who][c];
    if(c&&c!==s&&ev)return{who,to:c,e:ev.e,label:ev.who,t:ev.t,fx:ev.fx,cur};
  }
  return null;
}catch(_e){return null;}}
if(typeof window!=='undefined'&&!window.__CPM_STORE_BUILD){window.__CPM_ONDA7={deriveStances,stanceShift,DRIVER_MORALE};}
