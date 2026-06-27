// _patch6.js — 2D avatar + UI screen improvements
const fs = require('fs');
const p = 'C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html';
let html = fs.readFileSync(p, 'utf8');

// ─── STEP 1: New 2D AvatarSVG ───
const OLD_AV = `function AvatarSVG({id=0, size=60, border=false}) {
  const p = AVATARS[id%AVATARS.length];
  const Hair = () => {
    const f = p.hair;
    switch(p.style){
      case "bald": return null;
      case "short": return <ellipse cx="50" cy="24" rx="28" ry="16" fill={f}/>;
      case "long": return <><ellipse cx="50" cy="24" rx="28" ry="16" fill={f}/><path d="M23 32 Q17 62 24 80" stroke={f} strokeWidth="10" fill="none" strokeLinecap="round"/><path d="M77 32 Q83 62 76 80" stroke={f} strokeWidth="10" fill="none" strokeLinecap="round"/></>;
      case "afro": return <circle cx="50" cy="20" r="32" fill={f}/>;
      case "curly": return <><ellipse cx="50" cy="22" rx="30" ry="18" fill={f}/><circle cx="28" cy="34" r="10" fill={f}/><circle cx="72" cy="34" r="10" fill={f}/></>;
      case "slick": return <path d="M22 18 Q50 8 78 18 Q80 38 76 34 Q50 22 24 34 Z" fill={f}/>;
      case "medium": return <><ellipse cx="50" cy="24" rx="29" ry="16" fill={f}/><path d="M22 32 Q20 54 26 66" stroke={f} strokeWidth="8" fill="none" strokeLinecap="round"/><path d="M78 32 Q80 54 74 66" stroke={f} strokeWidth="8" fill="none" strokeLinecap="round"/></>;
      case "straight": default: return <ellipse cx="50" cy="24" rx="28" ry="14" fill={f}/>;
    }
  };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{borderRadius:"50%",display:"block",overflow:"hidden",border:border?"2px solid "+TH.primary:"none"}}>
      <circle cx="50" cy="50" r="50" fill="#dbeafe"/>
      <path d="M10 100 Q10 72 32 68 Q50 78 68 68 Q90 72 90 100Z" fill="#3b82f6"/>
      <rect x="44" y="65" width="12" height="12" rx="3" fill={p.skin}/>
      <ellipse cx="50" cy="50" rx="27" ry="30" fill={p.skin}/>
      <Hair/>
      <ellipse cx="23" cy="50" rx="4" ry="7" fill={p.skin}/>
      <ellipse cx="77" cy="50" rx="4" ry="7" fill={p.skin}/>
      <path d="M33 38 Q40 35 45 38" stroke={p.hair} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M55 38 Q60 35 67 38" stroke={p.hair} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="39" cy="46" rx="5.5" ry="5" fill="white"/>
      <circle cx="39" cy="46" r="3.2" fill={p.eye}/>
      <circle cx="40" cy="45" r="1.2" fill="black"/>
      <ellipse cx="61" cy="46" rx="5.5" ry="5" fill="white"/>
      <circle cx="61" cy="46" r="3.2" fill={p.eye}/>
      <circle cx="62" cy="45" r="1.2" fill="black"/>
      <ellipse cx="50" cy="56" rx="2.5" ry="2" fill={p.skin==="fad5c0"?"#c09080":"#7c4030"} opacity="0.5"/>
      <path d="M41 64 Q50 71 59 64" stroke={p.skin==="%f5c5a3"?"#c08070":"#8b4040"} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      {p.beard && <ellipse cx="50" cy="68" rx="22" ry="10" fill={p.hair} opacity="0.42"/>}
    </svg>
  );
}`;

const NEW_AV = `function AvatarSVG({id=0,size=60,border=false,clubCol=null}){
  const av=AVATARS[id%AVATARS.length];
  const jc=clubCol||"#2563eb";
  const HairEl=()=>{
    const f=av.hair;
    switch(av.style){
      case "bald":   return null;
      case "short":  return <ellipse cx="50" cy="22" rx="24" ry="14" fill={f}/>;
      case "long":   return(<><ellipse cx="50" cy="22" rx="24" ry="14" fill={f}/><path d="M27 34 Q22 58 28 74" stroke={f} strokeWidth="9" fill="none" strokeLinecap="round"/><path d="M73 34 Q78 58 72 74" stroke={f} strokeWidth="9" fill="none" strokeLinecap="round"/></>);
      case "afro":   return <circle cx="50" cy="18" r="28" fill={f} opacity="0.95"/>;
      case "curly":  return(<><ellipse cx="50" cy="20" rx="26" ry="17" fill={f}/><circle cx="26" cy="30" r="9" fill={f}/><circle cx="74" cy="30" r="9" fill={f}/></>);
      case "slick":  return <path d="M26 16 Q50 6 74 16 Q76 36 72 32 Q50 20 28 32 Z" fill={f}/>;
      case "medium": return(<><ellipse cx="50" cy="22" rx="25" ry="15" fill={f}/><path d="M26 32 Q24 52 30 62" stroke={f} strokeWidth="7" fill="none" strokeLinecap="round"/><path d="M74 32 Q76 52 70 62" stroke={f} strokeWidth="7" fill="none" strokeLinecap="round"/></>);
      default:       return <ellipse cx="50" cy="22" rx="24" ry="13" fill={av.hair}/>;
    }
  };
  const bgId="avbg"+id,jId="avj"+id;
  return(
    <svg viewBox="0 0 100 100" width={size} height={size} style={{borderRadius:Math.round(size*0.2),display:"block",overflow:"hidden",border:border?"2px solid "+TH.primary:"none",flexShrink:0}}>
      <defs>
        <radialGradient id={bgId} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#1e2d45"/>
          <stop offset="100%" stopColor="#080d18"/>
        </radialGradient>
        <linearGradient id={jId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={jc} stopOpacity="1"/>
          <stop offset="100%" stopColor={jc} stopOpacity="0.55"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={"url(#"+bgId+")"}/>
      <ellipse cx="50" cy="96" rx="26" ry="4" fill="rgba(0,0,0,0.4)"/>
      {/* Jersey */}
      <rect x="27" y="54" width="46" height="38" rx="10" fill={"url(#"+jId+")"}/>
      <rect x="29" y="56" width="42" height="7" rx="7" fill="rgba(255,255,255,0.18)"/>
      <rect x="27" y="65" width="46" height="3" fill="rgba(255,255,255,0.2)"/>
      <ellipse cx="31" cy="64" rx="5" ry="7" fill={jc} opacity="0.85"/>
      <ellipse cx="69" cy="64" rx="5" ry="7" fill={jc} opacity="0.85"/>
      <rect x="44" y="46" width="12" height="10" rx="4" fill={av.skin}/>
      {/* Head */}
      <circle cx="50" cy="38" r="22" fill={av.skin}/>
      <HairEl/>
      <ellipse cx="29" cy="40" rx="4" ry="5.5" fill={av.skin}/>
      <ellipse cx="71" cy="40" rx="4" ry="5.5" fill={av.skin}/>
      {/* Eyebrows */}
      <path d="M34 31 Q40 27 45 30" stroke={av.hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M55 30 Q60 27 66 31" stroke={av.hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Eyes */}
      <ellipse cx="40" cy="37" rx="5.5" ry="4.5" fill="white"/>
      <circle cx="40" cy="37" r="3" fill={av.eye}/>
      <circle cx="41" cy="36" r="1.2" fill="#000"/>
      <ellipse cx="60" cy="37" rx="5.5" ry="4.5" fill="white"/>
      <circle cx="60" cy="37" r="3" fill={av.eye}/>
      <circle cx="61" cy="36" r="1.2" fill="#000"/>
      <ellipse cx="50" cy="45" rx="2.5" ry="2" fill="rgba(0,0,0,0.1)"/>
      <path d="M43 51 Q50 55 57 51" stroke="#7c4040" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.65"/>
      {av.beard&&<ellipse cx="50" cy="53" rx="17" ry="7" fill={av.hair} opacity="0.38"/>}
      {/* Number */}
      <text x="50" y="84" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="10" fontWeight="bold" fontFamily="Arial">{id+1}</text>
    </svg>
  );
}`;

if(!html.includes(OLD_AV.slice(0,50))){console.error('STEP 1 FAILED');process.exit(1);}
html = html.replace(OLD_AV, NEW_AV);
console.log('Step 1 done');

// ─── STEP 2: Replace Player3DViewer with 2D canvas preview ───
const P3D_START = html.indexOf('function Player3DViewer(');
const P3D_END_MARKER = '\n/* ========================================\n   CROWD + STADIUM';
const P3D_END = html.indexOf(P3D_END_MARKER);
if(P3D_START<0||P3D_END<0){console.error('STEP 2 FAILED');process.exit(1);}

const NEW_P3D = `function Player3DViewer({avatarData,clubColor,width,height}){
  const av=avatarData||AVATARS[0];
  const jc=clubColor||"#2563eb";
  const w=width||"100%",h=height||"280px";
  return(
    <div style={{width:w,height:h,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0a0f1e,#0d1a2e)",borderRadius:18,overflow:"hidden",position:"relative",border:"1px solid rgba(255,255,255,0.08)"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 80%,rgba(30,130,60,0.22),transparent 70%)"}}/>
      <div style={{position:"absolute",top:0,left:"0%",width:"50%",height:"100%",background:"linear-gradient(-45deg,rgba(255,250,200,0.06),transparent)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:0,left:"50%",width:"50%",height:"100%",background:"linear-gradient(45deg,rgba(255,250,200,0.06),transparent)",pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:2,filter:"drop-shadow(0 8px 28px rgba(0,0,0,0.8))"}}>
        <AvatarSVG id={av.id||0} size={160} clubCol={jc}/>
      </div>
      <div style={{position:"relative",zIndex:2,marginTop:12,textAlign:"center"}}>
        <div style={{color:jc,fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",textShadow:"0 0 12px "+jc}}>{av.label}</div>
        <div style={{color:"rgba(255,255,255,0.3)",fontSize:8,marginTop:2,letterSpacing:1.5}}>ATTACCANTE</div>
      </div>
      <div style={{position:"absolute",bottom:14,width:70,height:7,background:"rgba(0,0,0,0.4)",borderRadius:"50%",filter:"blur(4px)"}}/>
    </div>
  );
}

`;
html = html.slice(0, P3D_START) + NEW_P3D + html.slice(P3D_END);
console.log('Step 2 done');

// ─── STEP 3: HomeScreen hero banner ───
const OLD_HERO = `      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:60,marginBottom:6}}>⚽</div>
        <h1 style={{fontSize:24,fontWeight:900,letterSpacing:-1,margin:"0 0 4px",color:TH.text}}>CAREER PLAYER MANAGER</h1>
        <p style={{color:TH.muted,fontSize:12,margin:0}}>Serie A Primavera · Carriera calciatore</p>
      </div>`;

const NEW_HERO = `      <div style={{textAlign:"center",marginBottom:20,background:"linear-gradient(135deg,#0a0f1e,#0e1a2e)",borderRadius:20,padding:"22px 16px 18px",position:"relative",overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{position:"absolute",inset:0,opacity:0.08,pointerEvents:"none"}}>
          <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice">
            <rect x="20" y="10" width="260" height="100" rx="4" stroke="white" strokeWidth="1.5" fill="none"/>
            <line x1="150" y1="10" x2="150" y2="110" stroke="white" strokeWidth="1"/>
            <circle cx="150" cy="60" r="22" stroke="white" strokeWidth="1" fill="none"/>
            <rect x="20" y="35" width="45" height="50" rx="2" stroke="white" strokeWidth="1" fill="none"/>
            <rect x="235" y="35" width="45" height="50" rx="2" stroke="white" strokeWidth="1" fill="none"/>
          </svg>
        </div>
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:200,height:80,background:"radial-gradient(ellipse,rgba(34,197,94,0.18),transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontSize:44,marginBottom:6,filter:"drop-shadow(0 0 16px rgba(34,197,94,0.6))"}}>⚽</div>
          <h1 style={{fontSize:22,fontWeight:900,letterSpacing:-0.5,margin:"0 0 4px",color:"#f1f5f9"}}>CAREER PLAYER MANAGER</h1>
          <p style={{color:"rgba(255,255,255,0.45)",fontSize:11,margin:0,letterSpacing:1}}>SERIE A PRIMAVERA · CARRIERA CALCIATORE</p>
        </div>
      </div>`;

html = html.replace(OLD_HERO, NEW_HERO);
console.log('Step 3 done');

// ─── STEP 4: HomeScreen slot avatar with club color ───
html = html.replace('<AvatarSVG id={s.avatarId} size={46}/>',
  '<AvatarSVG id={s.avatarId} size={46} clubCol={s.clubCol||"#2563eb"}/>');
console.log('Step 4 done');

// ─── STEP 5: CreateScreen — 4-step wizard ───
const OLD_CREATE_START = `function CreateScreen({onCreate}){
  const[name,setName]=useState(""),[nation,setNation]=useState("Italia"),[avatarId,setAvatarId]=useState(0),[page,setPage]=useState(0);`;
const OLD_CREATE_END = `  });
}`;
// Find exact bounds
const CS_START = html.indexOf(OLD_CREATE_START);
// CreateScreen ends before OffersScreen
const CS_END_MARKER = '\n/* ========================================\n   OFFERS SCREEN';
const CS_END = html.indexOf(CS_END_MARKER);
if(CS_START<0||CS_END<0){console.error('STEP 5 FAILED: '+CS_START+','+CS_END);process.exit(1);}

const NEW_CREATE = `function CreateScreen({onCreate}){
  const[name,setName]=useState("");
  const[nation,setNation]=useState("Italia");
  const[avatarId,setAvatarId]=useState(0);
  const[step,setStep]=useState(0);
  const inp={background:"#f8fafc",border:"1px solid "+TH.cardBorder,borderRadius:10,color:TH.text,padding:"10px 14px",fontFamily:"inherit",fontSize:14,width:"100%",boxSizing:"border-box"};
  const lbl={display:"block",fontSize:11,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6};
  const STEPS=["Nome","Nazione","Aspetto","Conferma"];
  const go=()=>{if(!name.trim())return;const stats=baseStats();const age=17;onCreate({name:name.trim(),nation,avatarId,position:"Attaccante",age,stats,ovr:calcOvr(stats),club:null,trialsDone:0,trialStats:[],season:1,week:1,weekLived:false,u18Seasons:0,isU18:true,proStatus:"u18",goals:0,assists:0,matches:0,totalGoals:0,totalAssists:0,totalMatches:0,morale:70,fatigue:0,popularity:20,skillPoints:2,log:[],history:[],matchHistory:[],value:0.8,coachTrust:60,form:70,transferOffers:[],offerHistory:[],contract:{duration:1,wage:rng(200,500),expiresAtSeason:2},aiData:{lastOpponentTactic:null,scoutReports:{},pressReports:{}},saveVersion:SAVE_VERSION});};
  const next=()=>{if(step<3)setStep(s=>s+1);else go();};
  useEffect(()=>{
    const onK=e=>{
      if(e.key==="Enter"&&(step!==0||name.trim())){e.preventDefault();next();return;}
      if(e.key==="ArrowLeft"&&step>0){e.preventDefault();setStep(s=>s-1);}
    };
    window.addEventListener("keydown",onK);return()=>window.removeEventListener("keydown",onK);
  },[step,name]);// eslint-disable-line
  return(
    <div style={{width:"100%"}}>
      <div style={{textAlign:"center",marginBottom:18,background:"linear-gradient(135deg,#0a0f1e,#0e1a2e)",borderRadius:18,padding:"18px 16px 14px",border:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{fontSize:32,marginBottom:4,filter:"drop-shadow(0 0 12px rgba(245,158,11,0.5))"}}>🌟</div>
        <h1 style={{fontSize:18,fontWeight:900,margin:0,color:"#f1f5f9"}}>Crea il tuo calciatore</h1>
        <p style={{color:"rgba(255,255,255,0.4)",fontSize:10,margin:"4px 0 0",letterSpacing:1}}>ATTACCANTE · CARRIERA PROFESSIONISTICA</p>
      </div>
      <div style={{display:"flex",gap:0,marginBottom:16,borderRadius:12,overflow:"hidden",border:"1px solid "+TH.cardBorder}}>
        {STEPS.map((s,i)=>(
          <div key={i} onClick={()=>i<step&&setStep(i)} style={{flex:1,textAlign:"center",padding:"8px 4px",fontSize:10,fontWeight:i===step?800:400,cursor:i<step?"pointer":"default",background:i===step?"#2563eb":i<step?"#dbeafe":"#f8fafc",color:i===step?"#fff":i<step?TH.primary:TH.faint,transition:"all .2s",borderRight:i<3?"1px solid "+TH.cardBorder:"none"}}>
            {i<step?"✓ ":""}{s}
          </div>
        ))}
      </div>
      <div style={{marginBottom:16}}>
        {step===0&&(
          <Card>
            <div style={{textAlign:"center",marginBottom:14}}>
              <AvatarSVG id={avatarId} size={72} clubCol={TH.primary}/>
              <div style={{fontSize:11,color:TH.muted,marginTop:6}}>Sceglierai aspetto al passo 3</div>
            </div>
            <label style={lbl}>Come ti chiami?</label>
            <input autoFocus style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="Es. Luca Conti" maxLength={22} onKeyDown={e=>e.key==="Enter"&&name.trim()&&next()}/>
          </Card>
        )}
        {step===1&&(
          <Card>
            <div style={{textAlign:"center",marginBottom:14}}>
              <AvatarSVG id={avatarId} size={72} clubCol={TH.primary}/>
              <div style={{fontSize:13,fontWeight:700,color:TH.text,marginTop:6}}>{name}</div>
            </div>
            <label style={lbl}>Nazionalità</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {NATIONS.map(n=>(
                <button key={n} onClick={()=>setNation(n)} style={{padding:"9px 8px",borderRadius:9,border:"2px solid "+(nation===n?TH.primary:TH.cardBorder),background:nation===n?"#eff6ff":"transparent",cursor:"pointer",fontSize:12,fontWeight:nation===n?700:400,color:nation===n?TH.primary:TH.text,textAlign:"left"}}>
                  {n}
                </button>
              ))}
            </div>
          </Card>
        )}
        {step===2&&(
          <Card>
            <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
              <Player3DViewer avatarData={AVATARS[avatarId]} clubColor={TH.primary} width="200px" height="200px"/>
            </div>
            <label style={lbl}>Scegli aspetto</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {AVATARS.map(av=>(
                <button key={av.id} onClick={()=>setAvatarId(av.id)} style={{padding:6,borderRadius:12,border:"2px solid "+(avatarId===av.id?TH.primary:"transparent"),background:avatarId===av.id?"#eff6ff":"#f8fafc",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <AvatarSVG id={av.id} size={52} clubCol={TH.primary}/>
                  <div style={{fontSize:8,color:avatarId===av.id?TH.primary:TH.faint,textAlign:"center",lineHeight:1.2}}>{av.label.split(",")[0]}</div>
                </button>
              ))}
            </div>
          </Card>
        )}
        {step===3&&(
          <Card>
            <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
              <Player3DViewer avatarData={AVATARS[avatarId]} clubColor={TH.primary} width="180px" height="180px"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {[{l:"Nome",v:name},{l:"Nazione",v:nation},{l:"Ruolo",v:"Attaccante"},{l:"Età",v:"17 anni"}].map(s=>(
                <div key={s.l} style={{background:"#f8fafc",borderRadius:9,padding:"8px 10px",border:"1px solid "+TH.cardBorder}}>
                  <div style={{fontSize:9,color:TH.faint,textTransform:"uppercase",letterSpacing:1}}>{s.l}</div>
                  <div style={{fontSize:13,fontWeight:700,color:TH.text,marginTop:2}}>{s.v}</div>
                </div>
              ))}
            </div>
            <Card style={{padding:"10px 12px",background:"#eff6ff",border:"1px solid #bfdbfe"}} shadow={false}>
              <div style={{fontSize:11,color:TH.primary,fontWeight:700,marginBottom:2}}>📋 Percorso</div>
              <div style={{fontSize:10,color:TH.muted}}>3 provini → U18 → Serie A Primavera → Europa</div>
            </Card>
          </Card>
        )}
      </div>
      <div style={{display:"flex",gap:8}}>
        {step>0&&<Btn onClick={()=>setStep(s=>s-1)} v="secondary" style={{padding:"12px 16px"}}>← Indietro</Btn>}
        <Btn onClick={next} disabled={step===0&&!name.trim()} fw style={{padding:"14px",fontSize:15,flex:1}}>
          {step<3?"Avanti →":"⚡ INIZIA I PROVINI"}
        </Btn>
      </div>
      <div style={{textAlign:"center",marginTop:8,fontSize:10,color:TH.faint}}><span className="kbd">Enter</span> avanti · <span className="kbd">←</span> indietro</div>
    </div>
  );
}
`;
html = html.slice(0, CS_START) + NEW_CREATE + html.slice(CS_END);
console.log('Step 5 done');

// ─── STEP 6: Dashboard — forma recente 5 dots ───
const OLD_DASH = `          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[{l:"Morale",v:player.morale||70,e:"😄",c:((player.morale||70)>60)?TH.success:((player.morale||70)>30)?TH.warning:TH.danger},{l:"Forma",v:100-(player.fatigue||0),e:"💪",c:((player.fatigue||0)<40)?TH.success:((player.fatigue||0)<70)?TH.warning:TH.danger},{l:"Fiducia mister",v:player.coachTrust||60,e:"🤝",c:TH.primary},{l:"Popolarità",v:player.popularity||20,e:"⭐",c:TH.accent}].map(it=>(
              <Card key={it.l} style={{padding:"12px 14px"}}>
                <div style={{fontSize:18,marginBottom:3}}>{it.e}</div><div style={{fontSize:10,color:TH.muted,marginBottom:2}}>{it.l}</div>
                <div style={{fontSize:18,fontWeight:800,color:it.c}}>{it.v}</div>
                <div style={{height:3,background:"#e2e8f0",borderRadius:2,marginTop:5}}><div style={{height:"100%",width:\`\${it.v}%\`,background:it.c,borderRadius:2}}/></div>
              </Card>
            ))}
          </div>`;

const NEW_DASH = `          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[{l:"Morale",v:player.morale||70,e:"😄",c:((player.morale||70)>60)?TH.success:((player.morale||70)>30)?TH.warning:TH.danger},{l:"Forma",v:100-(player.fatigue||0),e:"💪",c:((player.fatigue||0)<40)?TH.success:((player.fatigue||0)<70)?TH.warning:TH.danger},{l:"Fiducia mister",v:player.coachTrust||60,e:"🤝",c:TH.primary},{l:"Popolarità",v:player.popularity||20,e:"⭐",c:TH.accent}].map(it=>(
              <Card key={it.l} style={{padding:"12px 14px"}}>
                <div style={{fontSize:18,marginBottom:3}}>{it.e}</div><div style={{fontSize:10,color:TH.muted,marginBottom:2}}>{it.l}</div>
                <div style={{fontSize:18,fontWeight:800,color:it.c}}>{it.v}</div>
                <div style={{height:3,background:"#e2e8f0",borderRadius:2,marginTop:5}}><div style={{height:"100%",width:it.v+"%",background:it.c,borderRadius:2}}/></div>
              </Card>
            ))}
          </div>
          {(player.matchHistory||[]).length>0&&(()=>{
            const last5=[...(player.matchHistory||[])].slice(-5);
            return(
              <Card style={{padding:"10px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5}}>Forma recente</div>
                  <div style={{fontSize:10,color:TH.faint}}>{last5.length} partite</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {last5.map((m,i)=>(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                      <div style={{width:"100%",height:32,borderRadius:8,background:m.won?"#dcfce7":m.drew?"#fefce8":"#fee2e2",border:"2px solid "+(m.won?TH.success:m.drew?TH.warning:TH.danger),display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:m.won?TH.success:m.drew?TH.warning:TH.danger}}>
                        {m.won?"V":m.drew?"P":"S"}
                      </div>
                      <div style={{fontSize:8,color:TH.faint,textAlign:"center",lineHeight:1}}>{m.goals>0?"⚽":""}{m.assists>0?"🎯":""}</div>
                    </div>
                  ))}
                  {Array.from({length:Math.max(0,5-last5.length)}).map((_,i)=>(
                    <div key={"e"+i} style={{flex:1,height:32,borderRadius:8,background:"#f1f5f9",border:"1px dashed "+TH.cardBorder}}/>
                  ))}
                </div>
              </Card>
            );
          })()}`;

html = html.replace(OLD_DASH, NEW_DASH);
console.log('Step 6 done');

// ─── STEP 7: Profile radar chart ───
const OLD_PROF = `          <Card>
            <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Attributi</div>
            {Object.entries(player.stats).map(([k,v])=><StatBar key={k} label={k} value={v}/>)}
          </Card>`;

const NEW_PROF = `          <Card>
            <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>Attributi</div>
            {(()=>{
              const attrs=Object.entries(player.stats);
              const N=attrs.length,CX=130,CY=115,R=82;
              const pts=attrs.map(([,v],i)=>{const a=(i/N)*Math.PI*2-Math.PI/2;const r=R*(v/99);return[CX+r*Math.cos(a),CY+r*Math.sin(a)];});
              const rings=[0.25,0.5,0.75,1].map(f=>attrs.map((_,i)=>{const a=(i/N)*Math.PI*2-Math.PI/2;return[CX+R*f*Math.cos(a),CY+R*f*Math.sin(a)];}));
              const pStr=pts.map(pt=>pt.join(",")).join(" ");
              return(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <svg width="260" height="230" viewBox="0 0 260 230">
                    {rings.map((ring,ri)=><polygon key={ri} points={ring.map(pt=>pt.join(",")).join(" ")} fill="none" stroke={ri===3?"#94a3b8":"#e2e8f0"} strokeWidth={ri===3?1.5:1}/>)}
                    {attrs.map((_,i)=>{const a=(i/N)*Math.PI*2-Math.PI/2;return<line key={i} x1={CX} y1={CY} x2={CX+R*Math.cos(a)} y2={CY+R*Math.sin(a)} stroke="#e2e8f0" strokeWidth="1"/>;})}
                    <polygon points={pStr} fill={TH.primary+"33"} stroke={TH.primary} strokeWidth="2.5" strokeLinejoin="round"/>
                    {pts.map((pt,i)=><circle key={i} cx={pt[0]} cy={pt[1]} r="4" fill={TH.primary} stroke="white" strokeWidth="1.5"/>)}
                    {attrs.map(([k,v],i)=>{
                      const a=(i/N)*Math.PI*2-Math.PI/2;
                      const lx=CX+(R+20)*Math.cos(a),ly=CY+(R+20)*Math.sin(a);
                      const anchor=lx<CX-5?"end":lx>CX+5?"start":"middle";
                      return<g key={i}>
                        <text x={lx} y={ly-3} textAnchor={anchor} fontSize="8" fill="#64748b" fontFamily="Arial">{k.slice(0,7)}</text>
                        <text x={lx} y={ly+8} textAnchor={anchor} fontSize="9" fontWeight="bold" fill={TH.primary} fontFamily="Arial">{v}</text>
                      </g>;
                    })}
                    <circle cx={CX} cy={CY} r="20" fill="white" stroke={TH.primary} strokeWidth="1.5"/>
                    <text x={CX} y={CY-2} textAnchor="middle" fontSize="13" fontWeight="bold" fill={TH.primary} fontFamily="Arial">{player.ovr}</text>
                    <text x={CX} y={CY+10} textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="Arial">OVR</text>
                  </svg>
                </div>
              );
            })()}
          </Card>`;

html = html.replace(OLD_PROF, NEW_PROF);
console.log('Step 7 done');

// ─── STEP 8: OffersScreen summary with bar chart ───
const OLD_OFF_SUM = `      <Card style={{marginBottom:12,padding:"12px 14px"}}>
        <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Riepilogo provini</div>
        <div style={{display:"flex",gap:6}}>{trialStats.map((t,i)=><div key={i} style={{flex:1,background:"#f8fafc",borderRadius:8,padding:"7px",textAlign:"center",border:"1px solid "+TH.cardBorder}}><div style={{fontSize:9,color:TH.faint,marginBottom:2}}>Provino {i+1}</div><div style={{fontSize:12,fontWeight:700,color:TH.text}}>⚽{t.goals} 🎯{t.assists}</div><div style={{fontSize:11,color:TH.warning,fontWeight:700}}>{t.rating}</div></div>)}</div>
      </Card>`;

const NEW_OFF_SUM = `      <Card style={{marginBottom:12,padding:"12px 14px"}}>
        <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>Riepilogo provini</div>
        <div style={{display:"flex",gap:6,alignItems:"flex-end",marginBottom:10}}>
          {trialStats.map((t,i)=>{
            const barH=Math.round((t.rating/10)*60);
            return(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{fontSize:9,fontWeight:700,color:TH.warning}}>{t.rating}</div>
                <div style={{width:"100%",height:60,background:"#f1f5f9",borderRadius:6,overflow:"hidden",display:"flex",alignItems:"flex-end"}}>
                  <div style={{width:"100%",height:barH,background:"linear-gradient(180deg,"+TH.warning+","+TH.primary+")",borderRadius:4}}/>
                </div>
                <div style={{fontSize:9,color:TH.faint}}>P.{i+1}</div>
                <div style={{fontSize:9,color:TH.success,fontWeight:700}}>⚽{t.goals}</div>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",justifyContent:"space-around",padding:"8px 0",borderTop:"1px solid "+TH.cardBorder}}>
          {[{l:"Gol totali",v:total,c:TH.success},{l:"Rating medio",v:avg,c:TH.warning},{l:"Perf.",v:Math.round(perf),c:TH.primary}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div>
              <div style={{fontSize:9,color:TH.faint}}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>`;

html = html.replace(OLD_OFF_SUM, NEW_OFF_SUM);
console.log('Step 8 done');

// ─── STEP 9: Offer card — prestige bar ───
const OLD_OFF_CARD = `            <Card key={club.id} border={isSel?"#2563eb":i===0?"#bfdbfe":undefined} bg={isSel?"#eff6ff":undefined} style={{outline:isSel?"2px solid #2563eb":"none",transition:"outline .1s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <TeamBadge team={club} size={44}/>
                  <div><div style={{fontWeight:700,fontSize:14,color:TH.text}}>{club.name}</div><div style={{fontSize:11,color:TH.muted,marginTop:1}}>{club.nat} · Prestigio {club.p}</div></div>
                </div>
                <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                  {i===0&&<div style={{fontSize:9,color:TH.primary,fontWeight:700}}>⭐ TOP</div>}
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <span className="kbd">{i+1}</span>
                    <Btn onClick={()=>onChoose(club)} v={isSel?"primary":i===0?"primary":"secondary"}>Scegli →</Btn>
                  </div>
                </div>
              </div>
            </Card>`;

const NEW_OFF_CARD = `            <Card key={club.id} border={isSel?(club.c||"#2563eb"):undefined} bg={isSel?"#f0f9ff":undefined} style={{outline:isSel?"2px solid "+(club.c||"#2563eb"):"none",transition:"all .15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <TeamBadge team={club} size={48}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                    <div style={{fontWeight:800,fontSize:14,color:TH.text}}>{club.name}</div>
                    {i===0&&<div style={{fontSize:8,background:"#fef3c7",color:"#d97706",padding:"1px 7px",borderRadius:8,fontWeight:700,border:"1px solid #fde68a"}}>⭐ TOP</div>}
                  </div>
                  <div style={{fontSize:10,color:TH.muted}}>{club.nat} · {club.lg||"U18 Primavera"}</div>
                  <div style={{marginTop:5,height:4,background:"#e2e8f0",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:club.p+"%",background:(club.c||TH.primary),borderRadius:2}}/>
                  </div>
                  <div style={{fontSize:8,color:TH.faint,marginTop:2}}>Prestigio {club.p}/99</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span className="kbd" style={{flexShrink:0}}>{i+1}</span>
                <Btn onClick={()=>onChoose(club)} v={isSel?"primary":"secondary"} fw>
                  {isSel?"✓ Scegli →":"Scegli →"}
                </Btn>
              </div>
            </Card>`;

html = html.replace(OLD_OFF_CARD, NEW_OFF_CARD);
console.log('Step 9 done');

// ─── STEP 10: Profile + dashboard avatar with club color ───
html = html.replace('<AvatarSVG id={player.avatarId||0} size={64}/>',
  '<AvatarSVG id={player.avatarId||0} size={64} clubCol={player.club?.c||player.club?.col||TH.primary}/>');
html = html.replace('<AvatarSVG id={player.avatarId||0} size={52}/>',
  '<AvatarSVG id={player.avatarId||0} size={52} clubCol={player.club?.c||player.club?.col||TH.primary}/>');
console.log('Step 10 done');

fs.writeFileSync(p, html, 'utf8');
console.log('Patch complete. File size:', fs.statSync(p).size);
