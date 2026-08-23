/* ========================================================================
 * KORWARD ELITE — frammento n° 15  (dei 20, numerati da 00 a 19)
 * src/15-scene-3d-cerimonie.jsx
 *
 * SCENE 3D · CERIMONIE · FINE STAGIONE
 *
 * ProTransitionScreen, InterviewStage3D, PresentationStage3D, ParataBus3D,
 * GalaStage3D, SeasonAwardsScreen, SeasonEndScreen e ClubPresentationScreen.
 *
 * ----------------------------------------------------------------------
 * RIGHE DELL'ORIGINALE: 24672-27154   ·   2483 righe di 41427
 * La prima riga dopo questa intestazione è la riga 24672 di CARRIER-MANAGER-AV.html.
 * CONVERSIONE: riga N di questo file  =  riga N + 24649 del file generato.
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
   PRO TRANSITION SCREEN  (U18 → professionismo)
======================================== */
function ProTransitionScreen({player,onChoose}){
  const _dk=window.innerWidth>=640;
  const{offers,forced,perf}=React.useMemo(()=>generateProContracts(player),[player.name,player.season,player.club?.id,player.u18Seasons,player.ovr,player.hasAgent,player.squadRole]);/* [7.262.0] doppia rete: il seed rende le offerte stabili anche dopo un reload, il memo evita di rigenerarle a ogni render */
  const u18S=player.u18Seasons||0;
  const[selIdx,setSelIdx]=useState(0);
  useEffect(()=>{
    const h=e=>{
      if(_scrive386(e))return;/* [7.386.0] chi scrive tiene la tastiera */
      if(e.key==="ArrowDown"||e.key==="ArrowRight"){e.preventDefault();setSelIdx(i=>Math.min(offers.length-1,i+1));return;}
      if(e.key==="ArrowUp"||e.key==="ArrowLeft"){e.preventDefault();setSelIdx(i=>Math.max(0,i-1));return;}
      if(e.key==="Enter"){e.preventDefault();if(offers[selIdx])onChoose(offers[selIdx]);return;}
      if(["1","2","3"].includes(e.key)){const i=parseInt(e.key)-1;if(offers[i])onChoose(offers[i]);}
    };
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[offers,selIdx,onChoose]);// eslint-disable-line
  return(
    <div style={{width:"100%"}}>
      <div style={{textAlign:"center",marginBottom:14,paddingTop:6}}>
        {(()=>{const _lg=player.club?.lg||"Primavera 1";const _isP2=_lg==="Primavera 2";return(<><div style={{fontSize:44,marginBottom:6}}>{_isP2?"🥈":"🎓"}</div><h1 style={{fontSize:19,fontWeight:900,margin:"0 0 4px",color:TH.text}}>Fine stagione {_lg}</h1><p style={{color:TH.muted,fontSize:12,margin:0}}>Stagione {u18S+1} completata · {_lg}</p></>);})()}
      </div>
      {/* Primavera awards */}
      {(()=>{const _aws=(player.primaveraAwards||[]).filter(a=>a.season===player.season);if(!_aws.length)return null;return(<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10,justifyContent:"center"}}>{_aws.map((a,i)=><span key={i} style={{fontSize:11,padding:"4px 10px",borderRadius:12,background:a.type==="campione_primavera"?"#fef9c3":"#eff6ff",color:a.type==="campione_primavera"?"#92400e":TH.primary,fontWeight:700,border:`1px solid ${a.type==="campione_primavera"?"#fde68a":"#bfdbfe"}`}}>{a.type==="campione_primavera"?`🏆 Campione ${a.league}`:`⚽ Capocannoniere ${a.league} (${a.goals} gol)`}</span>)}</div>);})()}
      {/* Player status card */}
      <Card style={{marginBottom:12,padding:"12px 14px"}} bg={forced?"#fff1f2":"#eff6ff"} border={forced?"#fecaca":"#bfdbfe"}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <AvatarSVG id={player.avatarId||0} size={46}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:14,color:TH.text}}>{player.name} · Livello {player.ovr}</div>
            <div style={{fontSize:11,color:TH.muted}}>{player.club?.lg||"Primavera"} · Età {player.age} · {player.nation} · Piede {player.foot==="L"?"sinistro":"destro"}</div>
            <div style={{fontSize:11,color:TH.warning,marginTop:2}}>⚽ {player.goals} gol · 🎯 {player.assists} assist · {player.matches} gare</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:26,fontWeight:900,color:forced?TH.danger:TH.primary,lineHeight:1}}>{u18S+1}<span style={{fontSize:11,color:TH.faint,fontWeight:400}}>/2</span></div>
            <div style={{fontSize:10,color:TH.faint}}>stagioni U18</div>
          </div>
        </div>
        {forced&&<div style={{marginTop:10,padding:"8px 10px",background:TH.lossBg,borderRadius:8,fontSize:11,color:TH.danger,fontWeight:600}}>⚠️ Limite massimo raggiunto: non puoi restare in Under 18. Scegli il prossimo passo.</div>}
        {!forced&&u18S>=1&&<div style={{marginTop:8,fontSize:11,color:TH.warning,background:TH.bgAmber,padding:"6px 10px",borderRadius:7}}>⏳ Questa è la tua ultima stagione U18 disponibile.</div>}
      </Card>
      {/* Progress bar U18 */}
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:TH.muted,marginBottom:3}}>
          <span>Stagioni Under 18: {u18S+1}/2</span>
          <span style={{color:forced?TH.danger:TH.primary}}>{forced?"Limite raggiunto":"Ancora disponibile"}</span>
        </div>
        <div style={{height:6,background:"#e2e8f0",borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(u18S+1)*50}%`,background:forced?"#ef4444":TH.warning,borderRadius:3,transition:"width .5s"}}/>
        </div>
      </div>
      {/* Offers */}
      <div style={{fontSize:11,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Le tue opzioni</div>
      {_dk&&<div style={{fontSize:10,color:TH.faint,textAlign:"center",marginBottom:8}}>↑↓ seleziona · Enter / 1·2·3 scegli</div>}
      <div className="cpm-proto">
        {offers.map((o,oi)=>{const isSel=oi===selIdx;return(
          <Card key={o.id} style={{marginBottom:8,padding:"12px 14px",outline:isSel?"2px solid "+TH.primary:"none",transition:"outline .1s"}}
          border={isSel?TH.primary:o.isMain?"#bfdbfe":o.isStayU18?"#fef9c3":TH.cardBorder}
          bg={o.isMain?"#eff6ff":o.isStayU18?"#fefce8":TH.card}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <TeamBadge team={o.club||{col:"#888",col2:"#fff",n:"?"}} size={46}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:13,color:TH.text}}>{o.club?.n||o.club?.name}</div>
              <div style={{fontSize:11,color:o.isMain?TH.primary:o.isStayU18?TH.warning:TH.muted,fontWeight:600}}>{o.contractType}</div>
              <div style={{fontSize:10,color:TH.muted,marginTop:1}}>
                {o.role} · {o.wage?_fmtWageY133(o.wage)+"/anno":"–"} · {o.duration} stagion{o.duration===1?"e":"i"}
              </div>
              <div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap"}}>
                <span style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:o.moralBonus>=0?"#dcfce7":"#fee2e2",color:o.moralBonus>=0?TH.success:TH.danger}}>
                  😄{o.moralBonus>=0?"+":""}{o.moralBonus}
                </span>
                <span style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:"#f3e8ff",color:TH.accent}}>📈+{o.growthBonus}</span>
                {o.isLastChance&&<span style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:TH.bgAmber,color:TH.warning}}>⚠️ Ultima chance U18</span>}
                {o.isMain&&<span style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:TH.bgBlue,color:TH.primary}}>⭐ Consigliato</span>}
                {o.isNonConfirmed&&<span style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:TH.lossBg,color:TH.danger}}>❌ Non confermato</span>}
              </div>
            </div>
            <Btn onClick={()=>onChoose(o)} v={o.isMain?"primary":o.isStayU18?"secondary":"ghost"} style={{flexShrink:0,padding:"9px 12px",fontSize:12}}>
              {o.isStayU18?"Resta →":"Accetta →"}
            </Btn>
          </div>
        </Card>
      );})}
      <div style={{fontSize:10,color:TH.faint,textAlign:"center",marginTop:10}}>Scegli con cura — questa decisione definirà la tua carriera professionale.</div>
      </div>{/* end cpm-proto */}
    </div>
  );
}

/* ========================================
   CAREER PHASE + SEASON NARRATIVE HELPERS (Sprint 37)
======================================== */
function getCareerPhase(age){
  if(age<=21)return{label:"Giovane Promessa",e:"🌱",desc:"Stai costruendo le basi. Il tuo meglio è ancora davanti.",col:"#16a34a",bg:"#f0fdf4",border:"#bbf7d0"};
  if(age<=26)return{label:"Titolare Affermato",e:"⭐",desc:"Hai trovato la tua dimensione. Ora è il momento di importi.",col:"#2563eb",bg:"#eff6ff",border:"#bfdbfe"};
  if(age<=30)return{label:"Nel Pieno della Forma",e:"🔥",desc:"Questo è il tuo picco. Ogni stagione conta doppio.",col:"#d97706",bg:"#fff7ed",border:"#fed7aa"};
  if(age<=34)return{label:"Veterano",e:"🎖️",desc:"L'esperienza vale oro. Guida i giovani con il tuo esempio.",col:"#7c3aed",bg:"#f5f3ff",border:"#ddd6fe"};
  return{label:"Fine Carriera",e:"👟",desc:"Ogni partita potrebbe essere l'ultima. Goditi il momento.",col:"#64748b",bg:"#f8fafc",border:"#e2e8f0"};
}
function getSeasonNarrative(goals,assists,matches,playerPos,numTeams,isChampion,isRelegated,extra){
  // extra: {coachStyle, clubPrestige, season, isPromoted, euroChamp, cupChamp}
  const e=extra||{};
  const isTop4=playerPos<=3;
  const isSurvival=playerPos>=numTeams-4&&playerPos<numTeams-3&&!isRelegated;
  if(isChampion&&goals>=20)return"Stagione da leggenda. Titolo, record gol e leadership — hai scritto la storia di questo club.";
  if(isChampion&&(goals>=15||assists>=12))return"Stagione da campione assoluto. Il titolo, i numeri, la presenza — hai avuto tutto. Questa si ricorda.";
  if(isChampion&&e.season>=5)return"Campione ancora. Con l'esperienza di questi anni non ci si accontenta — si vince. Ed è quello che hai fatto.";
  if(isChampion)return"Stagione da campione. Il trofeo parla per te. Adesso difendilo.";
  if(e.euroChamp)return"Campione d'Europa. Pochi nella storia di questo club ci sono riusciti. Ora lo sanno tutti chi sei.";
  if(e.cupChamp&&goals>=10)return"Coppa alzata e numeri da protagonista. Stagione doppiamente memorabile — il tuo nome è scolpito in questa stagione.";
  if(e.cupChamp)return"Coppa conquistata. Non era il campionato, ma un trofeo è un trofeo — e tu c'eri quando contava.";
  if(isRelegated&&goals>=12)return"Hai fatto la tua parte — i numeri lo dimostrano. Ma il calcio è collettivo, e la retrocessione brucia lo stesso.";
  if(isRelegated)return"Una stagione difficile. La retrocessione fa male — ma è da lì che i grandi si rialzano.";
  if(e.isPromoted&&goals>=10)return"Promosso con numeri da protagonista. Hai trascinato questa squadra verso la categoria superiore. Meriti ogni applauso.";
  if(e.isPromoted)return"Promozione. Costruita settimana dopo settimana, senza mollare. Ora si sale.";
  if(goals>=35)return`Stagione IRRIPETIBILE: ${goals} gol. Numeri che riscrivono i libri dei record — di stagioni così se ne vedono una per generazione.`;/* [7.162.0 collaudo PO «frase incoerente, ne ho fatti oltre 40!»] il top-tier diceva «Venti gol» hardcodato anche a 42 → ora fasce più alte col NUMERO VERO */
  if(goals>=28)return`${goals} gol in una stagione: dominio totale. Non sei più un punto di riferimento — sei la misura con cui si giudicano gli altri.`;
  if(goals>=20)return`Stagione da bomber puro. ${goals} gol sono un'altra dimensione — stai diventando un punto di riferimento assoluto.`;
  if(goals>=15&&assists>=8)return"Stagione da trascinatore completo. Gol, assist, presenza — la squadra gira attorno a te.";
  if(goals>=12||assists>=12)return"Numeri importanti, contributo determinante. La squadra ti ha sentito ogni settimana.";
  if(isTop4&&e.clubPrestige>=80)return"Top 4 in una lega di altissimo livello. Non è scontato — è un risultato di cui essere fieri.";
  if(isTop4)return"Hai sfiorato la vetta. Con questo rendimento, il salto è solo questione di tempo.";
  if(isSurvival)return"Salvezza in extremis. Non è bello da dire, ma ci vuole carattere per restare in piedi quando tutto va storto.";
  if(matches<10&&e.season<=2)return"Poco spazio in questa prima fase. Il calcio professionistico chiede pazienza — continua a lavorare.";
  if(matches<10)return"Pochi minuti quest'anno. Che sia il segnale per alzare il livello e non lasciare più spazio ai dubbi.";
  if(e.coachStyle==="Offensivo"&&goals>=8)return"Il tuo mister vuole gol — e tu li hai portati. Un'intesa perfetta.";
  if(e.season>=6)return"Stagione di esperienza e maturità. Non sempre i numeri raccontano tutto — ma chi ti ha visto giocare sa cosa hai dato.";
  return"Una stagione di crescita silenziosa. Il lavoro invisibile di oggi è il risultato di domani.";
}

function getSeasonHeadline(goals,assists,playerPos,isChampion,isRelegated,extra){
  const e=extra||{};
  if(isChampion&&goals>=20)return"\"L'anno del dominatore\"";
  if(isChampion&&e.euroChamp)return"\"Doppia corona: campione e d'Europa\"";
  if(isChampion)return"\"Campioni. Punto.\"";
  if(e.euroChamp)return"\"Notte magica in Europa\"";
  if(e.cupChamp&&isChampion)return"\"Il Double è realtà\"";
  if(e.cupChamp)return"\"La Coppa è sua\"";
  if(isRelegated&&goals>=12)return"\"Ha lottato fino in fondo — non basta\"";
  if(isRelegated)return"\"Retrocessione amara\"";
  if(e.isPromoted&&goals>=10)return"\"Trascinatore e promosso: stagione da ricordare\"";
  if(e.isPromoted)return"\"Il salto di categoria è realtà\"";
  if(goals>=20)return"\"Macchina da gol\"";
  if(goals>=15)return"\"Stagione da protagonista\"";
  if(assists>=12)return"\"Il regista dei record\"";
  if(playerPos===1&&!isChampion)return"\"Sfiorata la gloria\"";
  if(playerPos<=3)return"\"Stagione di alto livello\"";
  return"\"Stagione completata\"";
}
function getBestSeasonMatch(matchHistory){
  if(!matchHistory||!matchHistory.length)return null;
  return[...matchHistory].sort(function(a,b){
    var sa=(a.goals||0)*3+(a.assists||0)*2+(a.rating||6)+(a.won?2:0);
    var sb=(b.goals||0)*3+(b.assists||0)*2+(b.rating||6)+(b.won?2:0);
    return sb-sa;
  })[0];
}

/* ========================================
   SEASON AWARDS SCREEN  (Sprint 49)
======================================== */
/* [7.24.0 GALA SUL PALCO 3D — direttiva PO] scena Three.js DEDICATA dietro l'overlay del gala (7.19):
   teatro buio, coni-spotlight che ondeggiano, podio col Trofeo d'Oro, figura in smoking che lo ALZA tra i
   coriandoli al reveal del vincitore. Montata SOLO durante il gala (dispose completo all'unmount, pattern
   BUG-4), try/catch sul WebGL con fallback al fondale piatto (pattern BUG-5), spenta con reduced-motion.
   Il gate non visita mai la schermata premi → additiva e gate-safe. */
/* [7.43.0 Sprint 5 parte 2 «interviste post-partita in 3D»] MIXED ZONE dietro il modal dell'intervista
   POST-PARTITA: fondale sponsor Korward, eroe in maglia + giornalista col microfono teso, flash dei
   fotografi, camera che respira. Pattern GalaStage3D: try/catch WebGL con fallback al fondale piatto,
   dispose profondo su unmount, spento con prefers-reduced-motion, pixelRatio cap 1.6. Gate-safe (il gate
   non apre mai un'intervista); montato SOLO su matchCtx win/draw/loss. */
/* [7.50.0 direttiva PO «la scena intervista deve valere un titolo premium»] MIXED ZONE 2.0 — riscrittura completa:
   EROE = il VERO avatar della carriera (AVATARS[avatarId] pelle/capelli + altezza/corporatura con la STESSA formula
   del match + kit del club con pattern reale) · GIORNALISTA DINAMICO dal motore narrativo (uomo/donna seedati, blazer
   elegante, pantaloni lunghi = shorts+calzettoni in tinta, tesserino stampa, auricolare — MAI in divisa) · MICROFONO
   IN MANO (osso RightHand, pattern trofeo 7.24.1) orientato verso l'eroe · animazioni da INTERVISTA (idle a 0.16 +
   respiro + annuiti seedati + gaze reciproco — niente riscaldamento) · postura emotiva dal risultato (win mento su ·
   loss capo chino) · luci key/fill/rim tintate dal contesto · transenna + fotografi in silhouette + moquette + blob
   shadow (mixed zone vera) · camera TV busto-su con variazione seedata. ⚠️ CH38: volto/occhi/palpebre BAKATI nella
   texture → niente blendshape/blink: l'espressività è POSTURALE. Fallback procedurale mantenuto (mai scena vuota). */
/* [7.299.0 collaudo PO «l'intervistatrice non e' una donna! occhio alla coerenza!»] Il nome nel modal e la
   FIGURA in mixed zone venivano da due sorgenti scollegate: il nome dal pool dei giornalisti («Anna Lombardi»),
   il genere della figura 3D da un lancio di moneta sul seed — quindi una volta su due la giornalista era resa
   come uomo. Ora il genere e' un DATO del pool (`f:true`) e la scena lo riceve: una sola fonte, coerente per
   costruzione. Se il nome non e' nel pool si torna al seed, come prima. */
const journalistIsFemale=(nm)=>{try{const j=(JOURNALIST_POOL||[]).find(x=>x&&x.name===nm);return j?!!j.f:null;}catch(_e){return null;}};
if(_CPM_TEST&&typeof window!=="undefined"){window.journalistIsFemale=journalistIsFemale;window.JOURNALIST_POOL=JOURNALIST_POOL;}/* [7.299.0] hook test-only per la probe intervista (spento in store build) */
function InterviewStage3D({avatarId=0,club=null,ctx="win",seed=7,jName=null}){
  const ref=React.useRef(null);
  React.useEffect(()=>{
    const host=ref.current;if(!host)return;
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(_e){return;}
    const W=()=>host.clientWidth||360,H=()=>host.clientHeight||640;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setSize(W(),H());renderer.setClearColor(0x07080d,1);
    host.appendChild(renderer.domElement);renderer.domElement.style.cssText="position:absolute;inset:0;width:100%;height:100%;";
    const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x07080d,6.5,17);
    // ── varietà SEEDATA dal motore narrativo: genere/aspetto giornalista, blazer, taglio di camera ──
    const _s=(seed>>>0)||7;const R=salt=>(((Math.imul((_s+Math.imul(salt,2654435761))>>>0,1664525)+1013904223)>>>0)/4294967296);
    const _jf=(typeof journalistIsFemale==="function")?journalistIsFemale(jName):null;
    const female=(typeof _jf==="boolean")?_jf:(R(1)<0.5);/* [7.299.0] il genere lo dice il NOME mostrato, non il seed (nel Gala la presentatrice non ha nome a schermo: li' il seed resta corretto) */
    const BLZ=[0x22304a,0x26282e,0x40222e,0x21322b][Math.floor(R(2)*4)];
    const jSkin=(typeof SKIN_TONES!=='undefined'&&SKIN_TONES[Math.floor(R(3)*SKIN_TONES.length)])||'#e8c39e';
    const jHair=female?['#171008','#3a2410','#6b4a1e','#8a6530'][Math.floor(R(4)*4)]:['#171008','#3a2410','#4d5157'][Math.floor(R(4)*3)];
    const jH=female?1.64+R(5)*0.09:1.72+R(5)*0.09;
    const camVX=(R(6)-0.5)*0.5,camVY=1.42+R(7)*0.12;
    // ── eroe: identità della CARRIERA (stessa fonte/formule del live match → riconoscibile) ──
    const hAv=(typeof AVATARS!=='undefined'&&AVATARS[(((avatarId|0)%AVATARS.length)+AVATARS.length)%AVATARS.length])||{skin:'#f0c8a0',hair:'#3a2410'};
    const heroH=1.86+((avatarId*73)%100)/100*0.16,heroG=0.97+((avatarId*131)%100)/100*0.10;
    const heroShirt=(club&&club.c)||'#8e1f33',heroC2=(club&&club.c2)||'#f0f0f0';
    const heroPat=(club&&typeof kitPatternFor==='function'&&kitPatternFor(club))||null;
    const heroShorts=(typeof hexLum==='function'&&hexLum(heroShirt)>=0.5)?'#16181d':'#e8e8ea';
    // ── luci mixed zone (key/fill/rim) tintate dal contesto emotivo ──
    const _keyC=ctx==="loss"?0xccd5e8:ctx==="draw"?0xffeedd:0xffe2ba;
    scene.add(new THREE.AmbientLight(0x8d97b5,0.42));
    const key=new THREE.PointLight(_keyC,ctx==="loss"?1.05:1.3,26);key.position.set(-2.3,3.3,3.6);scene.add(key);
    const fill=new THREE.PointLight(0x9fb2d8,0.5,22);fill.position.set(2.7,2.1,3.1);scene.add(fill);
    const rim=new THREE.PointLight(0xdce6ff,0.9,20);rim.position.set(0.4,3.4,-3.0);scene.add(rim);
    // ── fondale sponsor con VIGNETTA + pannelli laterali angolati (profondità reale, non «texture piatta») ──
    const cv=document.createElement('canvas');cv.width=1024;cv.height=384;const cx=cv.getContext('2d');
    const bgG=cx.createLinearGradient(0,0,0,384);bgG.addColorStop(0,'#151a29');bgG.addColorStop(1,'#0c0f18');cx.fillStyle=bgG;cx.fillRect(0,0,1024,384);
    cx.strokeStyle='rgba(255,255,255,0.045)';for(let x=0;x<1024;x+=64){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,384);cx.stroke();}
    cx.textAlign='center';
    for(let r2=0;r2<4;r2++){const off=(r2%2)?128:0;for(let c=-1;c<5;c++){const X=off+c*256+128;
      cx.fillStyle=(r2+c)%2?'#8e1f33':'#d4a017';cx.font='900 34px Arial';cx.fillText('K⚽RWARD',X,70+r2*88);
      cx.fillStyle='rgba(255,255,255,0.5)';cx.font='italic 700 20px Arial';cx.fillText((r2+c)%2?'MIXED ZONE':'ELITE',X,98+r2*88);}}
    const vg=cx.createRadialGradient(512,192,150,512,192,560);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.55)');cx.fillStyle=vg;cx.fillRect(0,0,1024,384);
    const bt=new THREE.CanvasTexture(cv);
    const board=new THREE.Mesh(new THREE.PlaneGeometry(9.5,3.6),new THREE.MeshBasicMaterial({map:bt}));board.position.set(0,1.9,-2.6);scene.add(board);
    const sideL=new THREE.Mesh(new THREE.PlaneGeometry(3.6,3.6),new THREE.MeshBasicMaterial({map:bt}));sideL.position.set(-5.4,1.9,-1.4);sideL.rotation.y=0.62;scene.add(sideL);
    const sideR=new THREE.Mesh(new THREE.PlaneGeometry(3.6,3.6),new THREE.MeshBasicMaterial({map:bt}));sideR.position.set(5.4,1.9,-1.4);sideR.rotation.y=-0.62;scene.add(sideR);
    // ── moquette con grana (noise seedato) + battiscopa LED ──
    const fcv=document.createElement('canvas');fcv.width=256;fcv.height=256;const fx2=fcv.getContext('2d');
    fx2.fillStyle='#10131b';fx2.fillRect(0,0,256,256);
    {let ns=_s;for(let i=0;i<1400;i++){ns=(ns*1664525+1013904223)>>>0;const xx=ns%256;ns=(ns*1664525+1013904223)>>>0;const yy=ns%256;ns=(ns*1664525+1013904223)>>>0;const l=16+(ns%16);fx2.fillStyle='rgb('+l+','+(l+2)+','+(l+9)+')';fx2.fillRect(xx,yy,2,2);}}
    const ftx=new THREE.CanvasTexture(fcv);ftx.wrapS=ftx.wrapT=THREE.RepeatWrapping;ftx.repeat.set(7,4);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(26,12),new THREE.MeshStandardMaterial({map:ftx,roughness:0.93,metalness:0.04}));floor.rotation.x=-Math.PI/2;scene.add(floor);
    const skirt=new THREE.Mesh(new THREE.BoxGeometry(9.5,0.06,0.06),new THREE.MeshBasicMaterial({color:0x3a4763}));skirt.position.set(0,0.06,-2.55);scene.add(skirt);
    // ── blob shadow morbide sotto le figure (niente shadow map: Android-friendly) ──
    const shcv=document.createElement('canvas');shcv.width=64;shcv.height=64;const sx2=shcv.getContext('2d');
    const sg=sx2.createRadialGradient(32,32,4,32,32,30);sg.addColorStop(0,'rgba(0,0,0,0.55)');sg.addColorStop(1,'rgba(0,0,0,0)');sx2.fillStyle=sg;sx2.fillRect(0,0,64,64);
    const shTex=new THREE.CanvasTexture(shcv);
    const mkShadow=(x,z,sc)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(sc,sc*0.7),new THREE.MeshBasicMaterial({map:shTex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,0.012,z);scene.add(m);return m;};
    mkShadow(0.50,0.18,1.2);mkShadow(-0.5,0.35,1.05);
    // ── transenna della mixed zone + fotografi in silhouette (dietro, nella nebbia) ──
    const railM=new THREE.MeshStandardMaterial({color:0x3a4152,roughness:0.35,metalness:0.7});
    const rail=new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.028,8.0,8),railM);rail.rotation.z=Math.PI/2;rail.position.set(0,0.92,-1.7);scene.add(rail);
    const rail2=new THREE.Mesh(new THREE.CylinderGeometry(0.024,0.024,8.0,8),railM);rail2.rotation.z=Math.PI/2;rail2.position.set(0,0.52,-1.7);scene.add(rail2);
    for(let px=-3;px<=3;px+=1.5){const post=new THREE.Mesh(new THREE.CylinderGeometry(0.032,0.038,0.95,8),railM);post.position.set(px,0.47,-1.7);scene.add(post);}
    const phM=new THREE.MeshStandardMaterial({color:0x14161d,roughness:0.9});
    [[-2.7,-2.15],[-1.9,-2.3],[2.2,-2.15],[3.0,-2.35]].forEach((pp,pi)=>{const g=new THREE.Group();
      const b=new THREE.Mesh(new THREE.CylinderGeometry(0.20,0.25,1.05,8),phM);b.position.y=0.9;g.add(b);
      const h=new THREE.Mesh(new THREE.SphereGeometry(0.125,10,8),phM);h.position.y=1.56;g.add(h);
      const camb=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.10,0.17),phM);camb.position.set(0,1.47,0.17);g.add(camb);
      g.position.set(pp[0],0,pp[1]);g.rotation.y=(pi%2?-0.2:0.25);scene.add(g);});
    // ── fallback PROCEDURALE (mai scena vuota): eroe in kit, giornalista in BLAZER (mai da calciatore) ──
    const mkFig=(shirtC,pantC,skinC,hairC,elegant)=>{const g=new THREE.Group();
      const legs=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.17,elegant?0.86:0.76,10),new THREE.MeshStandardMaterial({color:pantC,roughness:0.85}));legs.position.y=elegant?0.43:0.38;g.add(legs);
      const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.155,0.6,10),new THREE.MeshStandardMaterial({color:shirtC,roughness:elegant?0.6:0.85}));torso.position.y=1.06;g.add(torso);
      if(elegant){const vst=new THREE.Mesh(new THREE.BoxGeometry(0.075,0.30,0.02),new THREE.MeshStandardMaterial({color:0xf0f2f6,roughness:0.7}));vst.position.set(0,1.16,0.165);g.add(vst);}
      const head=new THREE.Mesh(new THREE.SphereGeometry(0.145,14,12),new THREE.MeshStandardMaterial({color:skinC,roughness:0.62}));head.position.y=1.55;g.add(head);
      const hair=new THREE.Mesh(new THREE.SphereGeometry(0.148,14,10,0,Math.PI*2,0,Math.PI*0.5),new THREE.MeshStandardMaterial({color:hairC,roughness:0.55}));hair.position.y=1.585;g.add(hair);
      const aM=new THREE.MeshStandardMaterial({color:shirtC,roughness:elegant?0.6:0.85});
      const aL=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.045,0.52,8),aM);aL.position.set(-0.24,1.1,0);aL.rotation.z=0.22;g.add(aL);
      const aR=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.045,0.52,8),aM);aR.position.set(0.24,1.1,0);aR.rotation.z=-0.22;g.add(aR);g._aR=aR;
      scene.add(g);return g;};
    /* [7.167.0 direttiva PO «nelle interviste e nelle scene 3D MAI far vedere i burattini come anteprima»]
       pattern kickoff-hold (7.9.3/7.32.1): i procedurali nascono INVISIBILI e compaiono SOLO come ultima
       risorsa se il CH38 non aggancia entro 6s (mai scena vuota, mai burattini-anteprima). Il gala è già
       pulito dal 7.85.0 (nessuna figura procedurale in scena finché gli attori non caricano). */
    const heroF=mkFig(new THREE.Color(heroShirt).getHex(),new THREE.Color(heroShorts).getHex(),new THREE.Color(hAv.skin||'#f0c8a0').getHex(),new THREE.Color(hAv.hair||'#2a1a0c').getHex(),false);
    heroF.position.set(0.50,0,0.15);heroF.rotation.y=-0.55;
    const jPant=new THREE.Color(BLZ).multiplyScalar(0.78).getHex();
    const journo=mkFig(BLZ,jPant,new THREE.Color(jSkin).getHex(),new THREE.Color(jHair).getHex(),true);
    journo.position.set(-0.5,0,0.35);journo.rotation.y=0.68;
    journo._aR.rotation.z=-1.5;journo._aR.rotation.x=-0.3;
    heroF.visible=false;journo.visible=false;/* [7.167.0] invisibili finché il CH38 non decide (aggancio o fallback a 6s) */
    // ── microfono con anello brand: in mano alla giornalista (osso RightHand quando il GLB aggancia) ──
    const mic=new THREE.Group();
    const mg=new THREE.Mesh(new THREE.CylinderGeometry(0.017,0.023,0.20,10),new THREE.MeshStandardMaterial({color:0x1b1c22,roughness:0.35,metalness:0.55}));mic.add(mg);
    const mh=new THREE.Mesh(new THREE.SphereGeometry(0.048,12,10),new THREE.MeshStandardMaterial({color:0x2e323b,roughness:0.85}));mh.position.y=0.14;mic.add(mh);
    const mring=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.022,10),new THREE.MeshStandardMaterial({color:0x8e1f33,roughness:0.4}));mring.position.y=0.055;mic.add(mring);
    mic.position.set(-0.32,1.18,0.5);mic.rotation.z=-0.12;scene.add(mic);mic.visible=false;/* [7.57.1] fallback quasi-verticale · [7.167.0] anche il mic parte nascosto (un mic sospeso senza figure = anteprima rotta) */
    let _bad483=null;/* [7.483.0] riferimenti della credenziale: dichiarati QUI perche' il tesserino si
      costruisce dentro il caricamento GLB mentre il tick vive in questo scope (prima stesura: ReferenceError). */
    let _glbUp167=false;setTimeout(()=>{try{if(!disposed&&!_glbUp167){heroF.visible=true;journo.visible=true;mic.visible=true;}}catch(_e){}},6000);/* ultima risorsa: mai scena vuota */
    // ── flash dei fotografi ──
    const flashes=[];for(let i=0;i<6;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffffff,transparent:true,opacity:0}));
      sp.position.set(-2.9+i*1.15,1.75+((i*37)%3)*0.45,-1.9+((i*53)%2)*0.35);sp.scale.setScalar(0.4);scene.add(sp);flashes.push({sp,t:-1});}
    const flashLight=new THREE.PointLight(0xffffff,0,10);flashLight.position.set(0,2.4,1.6);scene.add(flashLight);
    let raf=null,disposed=false;const t0=Date.now();let fseed=_s;const rnd=()=>{fseed=(fseed*1664525+1013904223)>>>0;return fseed/4294967296;};
    // ── avatar CH38 (identità vera) + rig ossa per gaze/annuiti/postura/mic-in-mano ──
    const _glbRoots=[];const _mixers=[];let heroAv=null,jAv=null;
    const _hV=new THREE.Vector3(),_hV2=new THREE.Vector3(),_hV3=new THREE.Vector3(),_hUp=new THREE.Vector3(0,1,0),_hV4=new THREE.Vector3(),_shf=new THREE.Vector3(),_hHer=new THREE.Vector3();
    const _qPar=new THREE.Quaternion(),_qDes=new THREE.Quaternion();// [7.128.0] mic parentato all'osso mano
    const _pV=new THREE.Vector3(),_pV2=new THREE.Vector3(),_pFing=new THREE.Vector3(),_pAway=new THREE.Vector3(),_pN=new THREE.Vector3(),_pRt=new THREE.Vector3(),_pOff=new THREE.Vector3(),_pCam=new THREE.Vector3();
    const _qP2=new THREE.Quaternion(),_qD2=new THREE.Quaternion(),_m4=new THREE.Matrix4();/* [7.338.0] taccuino orientato in world (mai di taglio) */
    if(typeof loadGLB==="function"&&window.__CPM_GLB!==false){
      /* [7.302.0 collaudo PO «Davide Ricci ma e' un'intervistatrice, occhio gia' te lo avevo segnalato»]
         il fix 7.299.0 (genere dal NOME mostrato) governava SOLO il fallback procedurale CH38: l'actor GLB
         era `actor-journalist.glb` — un modello FEMMINILE — caricato incondizionatamente, quindi ogni
         giornalista con l'asset in cache appariva donna qualunque nome dicesse la scheda. Ora si SCARICA
         l'actor del genere giusto (donna → journalist · uomo → presenter, stesso rig Biped del Gala):
         una sola richiesta, e la richiesta stessa e' l'osservabile su cui la probe verifica il genere.
         Asset mancante ⇒ fallback CH38 del genere GIUSTO, mai di quello sbagliato. */
      const _actorURL=female?'./assets/actor-journalist.glb':'./assets/actor-presenter.glb';
      Promise.all([loadGLB('./assets/footballer.glb'),loadGLB('./assets/anim-idle.glb').catch(()=>null),loadGLB(_actorURL).catch(()=>null)]).then(([body,idle,actorJ])=>{
        if(disposed||!body||!THREE.SkeletonUtils||!THREE.SkeletonUtils.clone)return;
        // [7.141.0 task #108 — direttiva PO «il CH38 extra campo ha troppi limiti su acconciature, vestiti»] DROP-IN
        //   modello dedicato: se esiste assets/actor-journalist.glb (personaggio Mixamo "vestito" — capelli/abiti REALI
        //   modellati, rig mixamorig, idle inclusa nel file) la GIORNALISTA usa quello; altrimenti fallback CH38 attuale.
        //   Stesso pattern drop-in dell'audio (7.70.0): quando il PO carica l'asset non si tocca una riga di codice.
        //   Filiera verificata in sessione: FBX Mixamo → FBX2glTF (npm) → GLB con rig mixamorig completo.
        const mkActor=(g,o)=>{try{
          const av=THREE.SkeletonUtils.clone(g.scene);
          /* [7.141.0] ALTEZZA DALLE OSSA, non dalla geometria: sui SkinnedMesh il bbox di setFromObject misura la
             geometria in BIND-SPACE (per Michelle ~0 → modello di 6cm, invisibile). Le world-position delle ossa
             (HeadTop→piedi) danno l'altezza vera in ogni unità di export. */
          av.updateMatrixWorld(true);
          let _yMin=Infinity,_yMax=-Infinity;const _bv=new THREE.Vector3();
          av.traverse(b=>{if(!b.isBone)return;b.getWorldPosition(_bv);if(_bv.y<_yMin)_yMin=_bv.y;if(_bv.y>_yMax)_yMax=_bv.y;});
          let hh=_yMax-_yMin;
          if(!(hh>0.01)){const bb=new THREE.Box3().setFromObject(av);hh=Math.max(0.1,bb.max.y-bb.min.y);}/* fallback bbox se rig assente */
          const sc=(o.height||1.7)/hh;av.scale.setScalar(sc);
          av.traverse(m=>{if(m.isMesh)m.frustumCulled=false;});
          av.position.copy(o.at);av.rotation.y=o.rotY;scene.add(av);_glbRoots.push(av);
          /* RICENTRA dal baricentro delle ossa: alcuni export hanno il mesh OFFSET dal root (Michelle sborda a sinistra)
             → piedi a y=0 e baricentro orizzontale ESATTO su o.at (misura post-scale/rotazione, correzione una tantum). */
          av.updateMatrixWorld(true);
          {let xm=Infinity,xM=-Infinity,ym=Infinity,zm=Infinity,zM=-Infinity;
           av.traverse(b=>{if(!b.isBone)return;b.getWorldPosition(_bv);if(_bv.x<xm)xm=_bv.x;if(_bv.x>xM)xM=_bv.x;if(_bv.y<ym)ym=_bv.y;if(_bv.z<zm)zm=_bv.z;if(_bv.z>zM)zM=_bv.z;});
           if(isFinite(xm)){av.position.x+=o.at.x-(xm+xM)/2;av.position.z+=o.at.z-(zm+zM)/2;av.position.y+=-ym;av.updateMatrixWorld(true);}}
          const rec={root:av,bones:{},actor:true};av.updateMatrixWorld(true);
          av.traverse(b=>{if(!b.isBone)return;const bn=(b.name||"").replace(/[:_. ]/g,"").toLowerCase();/* [7.142.0] matcher TOLLERANTE mixamo+Biped: "mixamorig:Head" E "Bip01 R Forearm" (Rocketbox) — normalizza [:_. ]+lowercase, forearm PRIMA di arm */
            if(/head$/.test(bn))rec.bones.head=b;
            else if(/spine2$/.test(bn))rec.bones.spine=b;
            else if(/rightforearm$|rforearm$/.test(bn))rec.bones.rFore=b;
            else if(/leftforearm$|lforearm$/.test(bn))rec.bones.lFore=b;
            else if(/rightarm$|rupperarm$/.test(bn))rec.bones.rArm=b;
            else if(/leftarm$|lupperarm$/.test(bn))rec.bones.lArm=b;
            else if(/righthand$|rhand$/.test(bn))rec.bones.rHand=b;
            else if(/lefthand$|lhand$/.test(bn))rec.bones.lHand=b;});/* [7.335.0] serve per il taccuino nella mano libera */
          /* [7.142.0] POSA WORLD-SPACE rig-agnostica: gli Euler per-rig (mixamo) NON valgono sul Biped Rocketbox →
             si ruota attorno agli assi del PERSONAGGIO (frontale/laterale derivati da rotY). Parametri CONVERGIUTI
             sul viewer rb-tune (aL=1.22 · aR=0.55 · bend=1.25 · lbend=0.32): braccio sx giù lungo il fianco con la
             mano leggermente avanti (via dalla gonna), braccio dx alzato col gomito piegato (terrà il mic). */
          rec.rotQ=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),o.rotY);
          const _axF=new THREE.Vector3(0,0,1).applyQuaternion(rec.rotQ),_axL=new THREE.Vector3(1,0,0).applyQuaternion(rec.rotQ);
          rec.axisRot=(bone,axis,ang)=>{if(!bone||!bone.parent)return;av.updateMatrixWorld(true);
            const pw=new THREE.Quaternion();bone.parent.getWorldQuaternion(pw);
            const rq=new THREE.Quaternion().setFromAxisAngle(axis,ang);
            bone.quaternion.copy(pw.clone().invert().multiply(rq).multiply(pw).multiply(bone.quaternion.clone()));};
          rec.axisRot(rec.bones.lArm,_axF,-1.22);rec.axisRot(rec.bones.lFore,_axL,-0.32);
          rec.axisRot(rec.bones.rArm,_axF,0.55);rec.axisRot(rec.bones.rFore,_axL,-1.25);
          /* [7.340.0 collaudo PO «la mano dell'intervistatore non è collegata al braccio, sembra incollata al
             corpo in una posizione a caso»] IL BRACCIO LIBERO SI PUNTA, NON SI INDOVINA. Gli Euler/axisRot qui
             sopra sono tarati su un rig e sull'altro cadono male: MISURATO sul modello vero, la mano sinistra
             finiva sulla LINEA MEDIANA del corpo e 19 cm DAVANTI al petto — appoggiata sulla pancia, col gomito
             rientrato dietro il busto: da qui la lettura «mano staccata, incollata a caso».
             Ora la posa si costruisce dalla GEOMETRIA DELLO SCHELETRO, quindi vale su qualunque rig: l'asse
             laterale è la congiungente spalla-spalla (per definizione), il frontale è il suo perpendicolare, e
             ogni osso viene PUNTATO verso una direzione voluta (`aimBone`) invece che ruotato di tot radianti.
             Braccio giù lungo il fianco, gomito appena flesso, mano FUORI dalla sagoma del busto. */
          rec.aimBone=(bone,child,dir)=>{if(!bone||!bone.parent||!child)return;av.updateMatrixWorld(true);
            const jp=new THREE.Vector3(),cp=new THREE.Vector3();bone.getWorldPosition(jp);child.getWorldPosition(cp);
            const cur=cp.sub(jp);if(cur.lengthSq()<1e-8)return;cur.normalize();
            const q=new THREE.Quaternion().setFromUnitVectors(cur,dir.clone().normalize());
            const pw=new THREE.Quaternion();bone.parent.getWorldQuaternion(pw);
            bone.quaternion.copy(pw.clone().invert().multiply(q).multiply(pw).multiply(bone.quaternion.clone()));
            av.updateMatrixWorld(true);};
          try{if(rec.bones.lArm&&rec.bones.rArm&&rec.bones.lFore&&rec.bones.lHand){
            av.updateMatrixWorld(true);
            const _pl=new THREE.Vector3(),_pr=new THREE.Vector3();
            rec.bones.lArm.getWorldPosition(_pl);rec.bones.rArm.getWorldPosition(_pr);
            const _lat=_pl.clone().sub(_pr);_lat.y=0;/* spalla destra → spalla sinistra: l'asse laterale VERO del modello */
            if(_lat.lengthSq()>1e-6){_lat.normalize();
              const _fwd=new THREE.Vector3(0,1,0).cross(_lat).normalize();/* perpendicolare orizzontale */
              /* il verso «avanti» lo dice la mano col MICROFONO, che il giornalista tiene davanti a sé */
              if(rec.bones.rHand){const _rh=new THREE.Vector3();rec.bones.rHand.getWorldPosition(_rh);
                const _sp=new THREE.Vector3();(rec.bones.spine||rec.bones.lArm).getWorldPosition(_sp);
                if(_rh.clone().sub(_sp).dot(_fwd)<0)_fwd.negate();}
              const _dn=new THREE.Vector3(0,-1,0);
              /* omero: giù lungo il fianco, appena aperto verso l'esterno */
              rec.aimBone(rec.bones.lArm,rec.bones.lFore,_dn.clone().multiplyScalar(0.94).addScaledVector(_lat,0.30).addScaledVector(_fwd,0.06));
              /* avambraccio: prosegue giù e resta FUORI dal busto, con un filo di flessione in avanti */
              rec.aimBone(rec.bones.lFore,rec.bones.lHand,_dn.clone().multiplyScalar(0.88).addScaledVector(_lat,0.26).addScaledVector(_fwd,0.34));
              rec.axes2={lat:_lat.clone(),fwd:_fwd.clone()};}
          }}catch(_e){}
          /* [7.142.0 collaudo PO «occhio alle dita (devono essere 5) e mani/braccia al loro posto»] le 5 dita del rig
             Biped (Bip01 R/L Finger0..4 + falangi) restano in T-pose = mano APERTA e rigida → CURL naturale trovato
             empiricamente sul viewer (asse LOCALE z, positivo per entrambe le mani; pollice ×0.3): destra 0.42 = pugno
             morbido che avvolge il mic, sinistra 0.30 = mano rilassata lungo il fianco. I rig mixamo (dita HandIndex…)
             non matchano "finger" → nessun effetto, compat intatta. */
          /* [7.148.0 collaudo PO ×4 «il mic NON è stretto in mano, dita ancora strane»] raccolgo le ossa-dita con la
             LORO base-pose (quaternion T-pose) e le riposo via metodo RI-APPLICABILE → poseFingers(curlR,curlL,add)
             ricostruisce sempre dalla base (niente accumulo) e può essere ri-chiamato dal tuner. curl forte = PUGNO. */
          rec._fings=[];
          av.traverse(b=>{if(!b.isBone)return;const fn=(b.name||"").replace(/[^a-zA-Z0-9]/g,"").toLowerCase();
            if(fn.indexOf('finger')<0)return;const isTh=/finger0\d?$/.test(fn);
            const isL=fn.indexOf('lfinger')>=0||fn.indexOf('leftfinger')>=0;
            const fi=(!isTh&&/finger\d$/.test(fn))?parseInt(fn.slice(-1),10):-1;
            rec._fings.push({b,isTh,isL,fi,bq:b.quaternion.clone()});});
          rec.poseFingers=(cr,cl,ad)=>{rec._fings.forEach(f=>{f.b.quaternion.copy(f.bq);
            f.b.rotation.z+=(f.isL?cl:cr)*(f.isTh?0.35:1);/* curl attorno all'asse locale z (pollice ridotto) */
            if(f.fi>=0){const _fac=({1:1.0,2:0.35,3:-0.25,4:-0.9})[f.fi]||0;f.b.rotation.y+=ad*_fac;}});};/* ADduzione: chiude il ventaglio */
          rec.poseFingers(1.5,0.86,0.6);/* [7.340.0] sinistra 0.42→0.86: col braccio disteso lungo il fianco la mano deve STRINGERE il blocchetto, non tenerlo in equilibrio a dita aperte *//* [7.148.0] destra 1.5 = pugno VERAMENTE chiuso attorno al mic (tuner config H); sinistra 0.42 mano rilassata; adduzione 0.6 chiude il ventaglio */
          /* [7.335.0 collaudo PO «l'intervistatore non è disegnato bene — vedi la mano senza microfono»] la mano
             LIBERA (sinistra, lungo il fianco) regge un TACCUINO da cronista: copertina scura + block chiaro,
             agganciato all'osso mano col world-scale (pattern busta gala 7.143) → le dita semichiuse stringono
             davvero qualcosa. Se il rig non espone la mano, nessun taccuino (mai un oggetto flottante). */
          /* [7.338.0 collaudo PO «sistema la mano dell'intervistatore, sembra un film horror»] IL TACCUINO ERA UNA
             LAMA. Il 7.335.0 lo posizionava in spazio-OSSO (position.set(0,0.05·u,…) + rotation.x=0.28): ma gli assi
             locali dell'osso mano non sono quelli del mondo — misurato sul rig vero, il blocchetto (progettato
             7,5 × 1,2 × 10,5 cm) usciva con un ingombro verticale di 12,8 cm e uno spessore di 4 cm, cioè IN PIEDI e
             visto DI TAGLIO: un coltello nel pugno. Ora la geometria è a misura reale (scala dell'oggetto compensata
             come il mic, non bakata nella geometria) e l'orientamento si calcola OGNI FRAME in WORLD nel tick: la
             faccia del blocchetto guarda in alto verso la camera → non può MAI essere vista di taglio, per costruzione. */
          try{if(rec.bones.lHand){const hb=rec.bones.lHand;av.updateMatrixWorld(true);const _ws5=new THREE.Vector3();hb.getWorldScale(_ws5);
            const pad=new THREE.Group();
            const pc5=new THREE.Mesh(new THREE.BoxGeometry(0.088,0.009,0.124),new THREE.MeshStandardMaterial({color:0x232830,roughness:0.68}));pad.add(pc5);
            const pw5=new THREE.Mesh(new THREE.BoxGeometry(0.080,0.010,0.114),new THREE.MeshStandardMaterial({color:0xf2efe4,roughness:0.85}));pw5.position.y=0.007;pad.add(pw5);
            const pb5=new THREE.Mesh(new THREE.BoxGeometry(0.084,0.014,0.010),new THREE.MeshStandardMaterial({color:0x8a1a2c,roughness:0.6}));pb5.position.set(0,0.007,-0.058);pad.add(pb5);/* rilegatura: dà il verso e dice «blocchetto» a colpo d'occhio */
            pad.scale.setScalar(1/(_ws5.x||1));pad._ws=(_ws5.x||1);
            hb.add(pad);rec.pad=pad;}}catch(_e){}
          rec.axes={left:_axL,up:new THREE.Vector3(0,1,0)};
          /* base-pose QUATERNION per il tick: l'actor non ha mixer che azzera le ossa ogni frame → un += per-frame
             ACCUMULEREBBE (testa riversa all'indietro, visto in collaudo). Il tick fa copy(base)+axisRot(delta). */
          rec.pose0={hq:rec.bones.head?rec.bones.head.quaternion.clone():null,sq:rec.bones.spine?rec.bones.spine.quaternion.clone():null};
          if(_CPM_TEST){try{const b2=new THREE.Box3().setFromObject(av);window.__CPM_ACTOR={hh:hh,sc:sc,pos:av.position.toArray(),min:b2.min.toArray(),max:b2.max.toArray(),bones:Object.keys(rec.bones)};}catch(_e){}}/* hook diagnostico test-only */
          /* NIENTE clip sull'actor: le bind pose differiscono dal CH38 (la clip idle CH38 lo DEFORMAVA — arti storti,
             fianchi fluttuanti da position-track non trasferibili). Posa statica sopra + respiro/annuiti del tick. */
          return rec;
        }catch(_e){return null;}};
        const mkAv=(o)=>{
          const av=THREE.SkeletonUtils.clone(body.scene);
          const bb=new THREE.Box3().setFromObject(av);const hh=Math.max(0.1,bb.max.y-bb.min.y);const sc=(o.height||1.8)/hh;av.scale.set(sc*(o.girth||1),sc,sc*(o.girth||1));
          av.traverse(m=>{if(!m.isMesh)return;m.frustumCulled=false;const n=(m.name||"").toLowerCase();
            const setStd=(hex,rough)=>{m.material=new THREE.MeshStandardMaterial({color:new THREE.Color(hex),roughness:(rough!=null?rough:0.88),metalness:0.03,skinning:true});m.material.emissive=new THREE.Color(hex).multiplyScalar(0.055);};
            if(n.indexOf('shirt')>=0){if(o.pattern&&typeof kitPatternTex==='function'){const t=kitPatternTex(o.shirt,o.c2||'#f0f0f0',o.pattern);m.material=new THREE.MeshStandardMaterial({map:t,roughness:0.88,metalness:0.02,skinning:true});}else setStd(o.shirt,o.elegant?0.58:0.88);}
            else if(n.indexOf('shorts')>=0)setStd(o.pants,0.82);
            else if(n.indexOf('socks')>=0)setStd(o.socksAsPants?o.pants:(o.socks||o.pants),0.86);
            else if(n.indexOf('shoes')>=0)setStd(o.shoes!=null?o.shoes:0x141418,0.3);
            else if(n.indexOf('hair')>=0){if(o.bald){m.visible=false;}else{m.material=new THREE.MeshStandardMaterial({color:new THREE.Color(o.hair||'#221408'),roughness:0.5,metalness:0.1,skinning:true});}}
            else if(n.indexOf('body')>=0&&m.material){m.material=m.material.clone();const sk=new THREE.Color(o.skin||'#e8c39e');m.material.color=sk;if('emissive'in m.material)m.material.emissive=sk.clone().multiplyScalar(0.09);if('roughness'in m.material)m.material.roughness=0.78;if('metalness'in m.material)m.material.metalness=0.0;}});
          av.position.copy(o.at);av.rotation.y=o.rotY;scene.add(av);_glbRoots.push(av);
          const rec={root:av,bones:{},base:{}};
          av.updateMatrixWorld(true);
          av.traverse(b=>{if(!b.isBone)return;const bn=b.name||"";
            if(/mixamorig\d*Head$/i.test(bn))rec.bones.head=b;
            else if(/mixamorig\d*Spine2$/i.test(bn))rec.bones.spine=b;
            else if(/mixamorig\d*RightArm$/i.test(bn))rec.bones.rArm=b;
            else if(/mixamorig\d*RightForeArm$/i.test(bn))rec.bones.rFore=b;
            else if(/mixamorig\d*RightHand$/i.test(bn))rec.bones.rHand=b;});
          if(idle&&idle.animations&&idle.animations[0]){const mx=new THREE.AnimationMixer(av);const a=mx.clipAction(idle.animations[0]);a.play();a.timeScale=0.16;mx.setTime(R(31)*1.7);_mixers.push(mx);rec.mx=mx;}
          return rec;};
        heroAv=mkAv({shirt:heroShirt,pants:heroShorts,socks:heroShirt,shoes:0x17181c,skin:hAv.skin,hair:hAv.hair,bald:hAv.style==='bald',at:heroF.position,rotY:heroF.rotation.y,height:heroH,girth:heroG,pattern:heroPat,c2:heroC2});
        jAv=(actorJ&&actorJ.scene?mkActor(actorJ,{at:journo.position,rotY:journo.rotation.y,height:jH}):null)||mkAv({shirt:BLZ,pants:jPant,socksAsPants:true,shoes:0x101014,skin:jSkin,hair:jHair,bald:false,at:journo.position,rotY:journo.rotation.y,height:jH,girth:0.92+R(8)*0.06,elegant:true});/* [7.141.0] actor drop-in con fallback CH38 */
        // tesserino stampa con laccetto + auricolare + (donna) chioma professionale a 3 masse con riflesso
        /* [7.483.0] TESTIMONE DELLA CREDENZIALE (test-only): il tesserino e' alla TERZA segnalazione del PO
           (7.133.0 la texture, 7.466.0 il codice a barre, oggi) e le prime due volte e' stato corretto
           guardando immagini in cui e' largo quindici pixel. Qui si tengono i riferimenti per misurarne la
           GEOMETRIA in spazio mondo — dove finiscono i cordoni rispetto al collo, quanto la card e'
           staccata dal petto — che e' cio' che un'immagine piccola non puo' dire. */
        try{if(jAv&&jAv.bones.spine){const b=jAv.bones.spine;b.getWorldScale(_hV);const u=1/(_hV.y||1);
          const bad=new THREE.Group();
          // [7.133.0 collaudo PO «il tesserino del giornalista è disegnato male»] era un rettangolo bianco piatto
          //   + una banda granata → sembrava un cartoncino vuoto. Ora TEXTURE canvas di un vero pass stampa:
          //   header granata «PRESS/STAMPA», foto-sagoma, nome/testata, e un codice a barre → credenziale leggibile.
          const bcv=document.createElement('canvas');bcv.width=128;bcv.height=176;const bx=bcv.getContext('2d');
          bx.fillStyle='#f4f5f8';bx.fillRect(0,0,128,176);bx.strokeStyle='#c7ccd6';bx.lineWidth=3;bx.strokeRect(2,2,124,172);
          bx.fillStyle='#8e1f33';bx.fillRect(2,2,124,40);// header granata
          bx.fillStyle='#ffffff';bx.textAlign='center';bx.font='900 22px Arial';bx.fillText('PRESS',64,29);
          bx.fillStyle='#f4c04a';bx.font='800 11px Arial';bx.fillText('K⚽RWARD ELITE',64,15);
          // foto-sagoma (busto) su fondo azzurrino
          /* [7.483.0] EQUILIBRIO INTERNO. Guardata a 4x (`out/tesserino/petto.png`) la credenziale ha il
             peso visivo rovesciato: il CODICE A BARRE occupava 34 righe su 176 ed era l'elemento piu'
             marcato, piu' della foto e del nome. Su un pass vero il codice e' una striscia sottile in
             fondo e il blocco identificativo comanda. Foto e testa/spalle crescono, il codice dimagrisce. */
          bx.fillStyle='#dfe4ee';bx.fillRect(13,50,48,62);
          bx.fillStyle='#9aa6bd';bx.beginPath();bx.arc(37,73,13,0,Math.PI*2);bx.fill();// testa
          bx.beginPath();bx.moveTo(19,112);bx.quadraticCurveTo(37,86,55,112);bx.closePath();bx.fill();// spalle
          // nome/testata a destra
          bx.textAlign='left';bx.fillStyle='#1b2436';bx.font='800 15px Arial';bx.fillText('STAMPA',66,66);
          bx.fillStyle='#5a6478';bx.font='600 11px Arial';bx.fillText('MIXED ZONE',66,84);
          bx.fillStyle='#8e1f33';bx.fillRect(66,93,50,3);
          bx.fillStyle='#7a8398';bx.font='600 10px Arial';bx.fillText('ACCREDITO',66,108);
          // codice a barre in basso
          /* [7.466.0 collaudo PO «tesserino del giornalista mal disegnato»] IL CODICE A BARRE USCIVA DALLA CARD.
             26 barre a passo medio ~4,5px partendo da x=14 arrivano a ~131 su una texture larga 128, con il
             bordo del cartoncino a 126: le ultime barre finivano oltre il filo e la credenziale sembrava
             tagliata. Ora le barre stanno dentro una fascia dichiarata (14→114) e ci si ferma al bordo. */
          {const _b0=14,_b1=114;let bxp=_b0;for(let i=0;i<26&&bxp<_b1;i++){bx.fillStyle=(i%3===0||i%5===0)?'#1b2436':'#f4f5f8';const w2=Math.min((i%4===0)?4:2,_b1-bxp);bx.fillRect(bxp,132,w2,18);bxp+=w2+2;}}
          bx.fillStyle='#8b93a6';bx.textAlign='center';bx.font='600 9px Arial';bx.fillText('KWD-2049-STAMPA',64,164);
          const btex=new THREE.CanvasTexture(bcv);
          /* [7.483.0] MISURATO IN MONDO col testimone `__CPM_BADGE483`: la card stava 0,112 unita' davanti
             all'osso del petto, su una distanza petto-testa di 0,243 — mezza testa di stacco, ed e' il
             «galleggia» che si vede nel ritaglio a 4x. Rientra verso il petto e cala di un quinto: il
             confronto e' fra due immagini ingrandite, non fra due impressioni.
             ⚠️ E IL RIMPICCIOLIMENTO E' STATO REVOCATO DOPO AVERLO GUARDATO: portando la card a 0,070 x
             0,096 la scritta PRESS smetteva di leggersi e la credenziale diventava un rettangolo bianco —
             un difetto scambiato con un altro. La taglia resta quella di prima; cambia solo quanto e'
             appoggiata al petto. Una misura che migliora (stacco 0,112 -> 0,094) non autorizza una
             modifica che peggiora cio' che si vede. */
          const card=new THREE.Mesh(new THREE.PlaneGeometry(0.086*u,0.118*u),new THREE.MeshBasicMaterial({map:btex,side:THREE.DoubleSide}));card.position.set(0.015*u,-0.026*u,0.132*u);card.rotation.x=-0.12;bad.add(card);
          const lan1=new THREE.Mesh(new THREE.CylinderGeometry(0.0045*u,0.0045*u,0.17*u,6),new THREE.MeshBasicMaterial({color:0x8e1f33}));lan1.position.set(-0.030*u,0.092*u,0.122*u);lan1.rotation.z=0.42;bad.add(lan1);
          const lan2=new THREE.Mesh(new THREE.CylinderGeometry(0.0045*u,0.0045*u,0.17*u,6),new THREE.MeshBasicMaterial({color:0x8e1f33}));lan2.position.set(0.058*u,0.092*u,0.122*u);lan2.rotation.z=-0.42;bad.add(lan2);
          if(jAv.actor&&jAv.rotQ){/* [7.142.0] su rig Biped gli assi locali dell'osso NON sono il frame mixamo (petto/avanti):
               il tesserino va in un GRUPPO riallineato al FACING (world = rotQ) → resta sul petto su ogni rig. */
            jAv.root.updateMatrixWorld(true);const _qb=new THREE.Quaternion();b.getWorldQuaternion(_qb);
            const wr=new THREE.Group();wr.quaternion.copy(_qb).invert().multiply(jAv.rotQ);wr.add(bad);b.add(wr);}
          else b.add(bad);
          _bad483={card:card,lan1:lan1,lan2:lan2,spine:b,head:(jAv.bones&&jAv.bones.head)||null};}}catch(_e){}
        try{if(jAv&&jAv.bones.head&&!jAv.actor){/* [7.142.0] actor: capelli VERI coprono l'orecchio + assi Biped ≠ mixamo → niente auricolare */
          const b=jAv.bones.head;b.getWorldScale(_hV);const u=1/(_hV.y||1);
          const ep=new THREE.Mesh(new THREE.SphereGeometry(0.017*u,8,6),new THREE.MeshStandardMaterial({color:0x15161a,roughness:0.4}));ep.position.set(0.088*u,0.028*u,0.012*u);b.add(ep);
          if(female&&!(jAv&&jAv.actor)){/* [7.141.0] il modello actor ha capelli VERI modellati → mai chioma procedurale sopra *//* [7.133.1 collaudo PO «voglio sperare che non siano questi i capelli, terribili!»] LEZIONE 7.53.4
               (capelli intro): su un CH38 con capigliatura BAKED, ogni geometria di correzione su corona/lati/fronte
               legge come «casco/colla» e finisce per COPRIRE il viso (era il mushroom sulla fronte). RISOLUZIONE
               DEFINITIVA: NIENTE geometria davanti/sopra — si tiene la capigliatura CH38 (mesh Hair tinta jHair, pulita,
               come eroe e 21 giocatori) e si aggiunge SOLO una massa DIETRO la nuca che scende sulle spalle (z<0, sotto
               la corona → impossibile che tocchi fronte/viso PER COSTRUZIONE): capelli raccolti/lunghi dietro, femminili. */
            const hm=new THREE.MeshStandardMaterial({color:new THREE.Color(jHair),roughness:0.62,metalness:0.05});
            const bk=new THREE.Mesh(new THREE.SphereGeometry(0.075*u,18,16),hm);bk.scale.set(0.98,1.75,0.78);bk.position.set(0,-0.050*u,-0.088*u);b.add(bk);// SOLO dietro: top ~+0.08 (sotto corona +0.10), tutto z<0 → mai sul viso
          }}}catch(_e){}
        heroF.visible=false;journo.visible=false;_glbUp167=true;mic.visible=true;/* [7.167.0] CH38 agganciato: mic in mano, procedurali mai mostrati */
      }).catch(()=>{});
    }
    // ── animazione: quasi-fermi, respiro, annuiti, gaze, postura emotiva, mic in mano ──
    const _nod=(t,per,ph,amp)=>{const u2=((t+ph)%per)/per;return u2<0.10?Math.sin(u2/0.10*Math.PI)*amp:0;};
    const _ctxPitch=ctx==='loss'?0.15:ctx==='win'?-0.13:0.02;/* [7.133.0] postura EROE: sconfitta capo chino, vittoria mento CHIARAMENTE su (era -0.05 → leggeva ancora basso) */
    let _tkLast=0;
    const tick=()=>{if(disposed)return;const el=(Date.now()-t0)/1000;
      const _mdt=Math.min(0.06,el-_tkLast||0.016);_tkLast=el;_mixers.forEach(m=>m.update(_mdt));
      // fallback procedurale: solo respiro leggero (niente dondolii)
      heroF.position.y=Math.sin(el*1.05)*0.008;journo.position.y=Math.sin(el*0.92+1)*0.007;
      // micro-regia sulle OSSA (post-mixer): gaze reciproco + annuiti + respiro + emozione dal risultato
      if(heroAv&&heroAv.bones.head){const b=heroAv.bones.head;
        b.rotation.x+=_ctxPitch+_nod(el,7.0,R(11)*5,0.09);
        b.rotation.y+=0.24+Math.sin(el*0.33)*0.05+((el%9)<1.6?-0.34:0);/* ogni ~9s guarda verso la camera per ~1.6s */
      }
      if(heroAv&&heroAv.bones.spine)heroAv.bones.spine.rotation.x+=Math.sin(el*1.05)*0.012+(ctx==='loss'?0.045:0);
      /* [7.483.0] la geometria della credenziale, letta in MONDO e non sugli euler locali: la lezione del
         7.479 e' che un valore scritto su un osso non e' una posizione finche' non si guarda dove finisce. */
      if(typeof window!=='undefined'&&window.__CPM_BADGE483!==undefined&&_bad483){try{
        const _P=o=>{o.updateMatrixWorld(true);const v=new THREE.Vector3();o.getWorldPosition(v);return {x:+v.x.toFixed(4),y:+v.y.toFixed(4),z:+v.z.toFixed(4)};};
        /* ⚠️ l'estremo del cilindro sta a meta' della SUA altezza, non a 0,5: il cilindro unitario e'
           un'assunzione, e la prima stesura di questa sonda l'ha fatta (misurando cordoni piu' lunghi
           del vero). Si legge la geometria invece di darla per scontata. */
        const _cap=(m,segno)=>{m.updateMatrixWorld(true);const h=(m.geometry&&m.geometry.parameters&&m.geometry.parameters.height)||1;
          const v=new THREE.Vector3(0,segno*h*0.5,0);v.applyMatrix4(m.matrixWorld);return {x:+v.x.toFixed(4),y:+v.y.toFixed(4),z:+v.z.toFixed(4)};};
        window.__CPM_BADGE483={card:_P(_bad483.card),spina:_P(_bad483.spine),testa:_bad483.head?_P(_bad483.head):null,
          l1alto:_cap(_bad483.lan1,1),l1basso:_cap(_bad483.lan1,-1),l2alto:_cap(_bad483.lan2,1),l2basso:_cap(_bad483.lan2,-1),
          cardH:+(_bad483.card.geometry.parameters.height*_bad483.card.scale.y).toFixed(4),cardW:+(_bad483.card.geometry.parameters.width*_bad483.card.scale.x).toFixed(4)};
      }catch(_e){}}
      // [7.133.0 collaudo PO «l'intervistatore non deve stare col capo chinato perché l'eroe ha perso»] la giornalista
      //   è NEUTRALE al risultato: postura professionale FISSA (mento LEVATO verso l'eroe più alto, mai _ctxPitch),
      //   che NON dipende da ctx → non condivide la dejection dell'eroe. Solo annuiti d'ascolto.
      if(jAv&&jAv.bones.head){const b=jAv.bones.head;const _dhx=-0.11+_nod(el,5.4,R(12)*4,0.09);
        if(jAv.actor&&jAv.pose0&&jAv.pose0.hq){b.quaternion.copy(jAv.pose0.hq);jAv.axisRot(b,jAv.axes.left,_dhx-0.03+_nod(el,5.4,R(12)*4,0.05));jAv.axisRot(b,jAv.axes.up,0.32+Math.sin(el*0.5)*0.03);}/* [7.142.0] actor: base QUATERNION + delta world-space · [7.147.0 collaudo PO «espressione disinteressata»] il volto è BAKED → INGAGGIO posturale: più girata sull'eroe (0.24→0.32 con micro-oscillazione) + annuiti d'ascolto più presenti */
        else{b.rotation.x+=_dhx;b.rotation.y+=-0.26;}}
      if(jAv&&jAv.bones.spine){const _dsx=-0.03+Math.sin(el*0.9+1.3)*0.010;
        if(jAv.actor&&jAv.pose0&&jAv.pose0.sq){const b=jAv.bones.spine;b.quaternion.copy(jAv.pose0.sq);jAv.axisRot(b,jAv.axes.left,_dsx);}else jAv.bones.spine.rotation.x+=_dsx;}
      // [7.128.0 collaudo PO «il microfono ATTRAVERSA la mano, risolvi DEFINITIVAMENTE»] CAUSA vera: il mic era una mesh
      //   TRACCIATA in world-space sull'osso → ogni minimo scarto con la mano SKINNATA lo faceva compenetrare. FIX
      //   STRUTTURALE: il mic è ora PARENTATO come FIGLIO dell'osso rHand → segue ESATTAMENTE la mano, impossibile che
      //   passi attraverso (è nel frame della mano). Scala compensata (getWorldScale, lezione 7.37.0). Il grip è nelle
      //   DITA (offset lungo avambraccio→mano) e la capsula è tenuta VERTICALE in world (+ lieve virata verso l'eroe),
      //   ricalcolando l'orientamento locale ogni frame → mai "verso di lei", mai dentro il corpo.
      if(jAv&&!jAv.actor&&jAv.bones.rArm&&jAv.bones.rFore){jAv.bones.rArm.rotation.set(0.98,-0.30,-0.98);jAv.bones.rFore.rotation.set(0.05,0.38,-0.26);}/* [7.142.0] Eulers per-rig SOLO sul CH38 fallback; l'actor è posato una volta in mkActor (world-space) */
      if(jAv&&jAv.bones.rHand&&jAv.bones.rFore){
        if(!mic._parented){jAv.bones.rHand.add(mic);const _ws=new THREE.Vector3();jAv.bones.rHand.getWorldScale(_ws);mic._ws=(_ws.x||1);mic.scale.setScalar(1/mic._ws);mic._parented=true;}
        jAv.root.updateMatrixWorld(true);
        jAv.bones.rHand.getWorldPosition(_hV);// polso (world)
        jAv.bones.rFore.getWorldPosition(_hV2);// avambraccio (world)
        _hV3.copy(_hV).sub(_hV2).normalize();// direzione avambraccio→mano = verso le DITA
        jAv.bones.rHand.getWorldQuaternion(_qPar);
        // [7.148.0] tuner test-only: sweep di posizione (fwd/her/up), lean e curl dita in una sola sessione
        const _MT=(_CPM_TEST&&window.__CPM_MICT)||null;
        if(_MT&&jAv.actor&&jAv.poseFingers)jAv.poseFingers(_MT.fcR??1.05,_MT.fcL??0.42,_MT.fadd??0.42);
        const _ac=jAv.actor;/* [7.148.0] valori CONVERGIUTI sul tuner (config H, screenshot): mic DENTRO il pugno */
        const _lean=_MT?(_MT.lean??(_ac?0.10:0.24)):(_ac?0.10:0.24);
        const _fwd=_MT?(_MT.fwd??(_ac?0.04:0.085)):(_ac?0.04:0.085);
        const _her=_MT?(_MT.her??(_ac?0.08:0)):(_ac?0.08:0);/* componente palmo-interno: il crossover che porta l'asta nel pugno */
        const _upo=_MT?(_MT.up??(_ac?0.01:0.015)):(_ac?0.01:0.015);
        // dir-verso-eroe ORIZZONTALE (proxy del lato-palmo, davanti al petto) → riusata per orientamento E posizione
        _hHer.set(0,0,0);
        if(heroAv&&heroAv.bones.head){heroAv.bones.head.getWorldPosition(_hV4);_hV4.sub(_hV);_hV4.y=0;if(_hV4.lengthSq()>1e-4)_hHer.copy(_hV4).normalize();}
        // capsula VERTICALE in world (+ virata verso l'eroe) → orientamento locale = qPar⁻¹·qDes
        _shf.copy(_hUp).addScaledVector(_hHer,_lean).normalize();
        _qDes.setFromUnitVectors(_hUp,_shf);
        mic.quaternion.copy(_qPar).invert().multiply(_qDes);
        // grip: offset lungo forearm→dita (_hV3) + verso il palmo/eroe (_hHer) + verticale → bone-LOCAL (÷scala, ·qPar⁻¹)
        _hV4.copy(_hV3).multiplyScalar(_fwd).addScaledVector(_hHer,_her).addScaledVector(_hUp,_upo);/* [7.148.0] +componente palmo-interno: il mic era FUORI dalle dita (a lato), ora passa DENTRO il pugno */
        _hV4.applyQuaternion(_qPar.clone().invert()).multiplyScalar(1/mic._ws);
        mic.position.copy(_hV4);
      }
      /* [7.338.0] IL TACCUINO SI TIENE PIATTO, MAI DI TAGLIO. Stesso mestiere del mic (7.128.0): l'oggetto è figlio
         dell'osso mano — quindi lo segue sempre — ma posizione e assetto si ricalcolano in WORLD ogni frame:
         · faccia (asse corto) verso l'ALTO inclinata verso la CAMERA → si vede sempre la superficie, mai il bordo;
         · lato lungo lungo la direzione busto→mano (fuori dal corpo) → il blocchetto non entra nel maglione;
         · posizione = mano + un filo verso le dita e verso l'esterno → appoggiato sul pugno, non infilzato dentro. */
      if(jAv&&jAv.pad&&jAv.bones.lHand&&jAv.bones.lFore&&jAv.bones.spine){
        const pd=jAv.pad;jAv.root.updateMatrixWorld(true);
        jAv.bones.lHand.getWorldPosition(_pV);jAv.bones.lFore.getWorldPosition(_pV2);
        _pFing.copy(_pV).sub(_pV2).normalize();/* polso→dita */
        jAv.bones.spine.getWorldPosition(_pV2);
        _pAway.copy(_pV).sub(_pV2);_pAway.y=0;if(_pAway.lengthSq()<1e-5)_pAway.set(0,0,1);_pAway.normalize();/* busto→mano, orizzontale = via dal corpo */
        _pCam.copy(cam.position).sub(_pV).normalize();
        /* [7.340.0] col braccio disteso lungo il fianco il blocchetto si PORTA, non si regge su un vassoio:
           lato lungo lungo il braccio (verso le dita), faccia girata verso la CAMERA — così resta un rettangolo
           leggibile da ogni inquadratura e nasce DENTRO il pugno, non accanto alla mano. */
        const _pLong=_pFing.clone();if(_pLong.lengthSq()<1e-6)_pLong.copy(_hUp).negate();_pLong.normalize();
        _pN.copy(_pCam).multiplyScalar(0.86).addScaledVector(_hUp,0.30);
        _pN.addScaledVector(_pLong,-_pN.dot(_pLong));/* ortogonale al lato lungo (che resta esatto) */
        if(_pN.lengthSq()<1e-5)_pN.copy(_hUp);_pN.normalize();
        _pRt.crossVectors(_pN,_pLong).normalize();/* base destrorsa: x = y × z */
        _m4.makeBasis(_pRt,_pN,_pLong);_qD2.setFromRotationMatrix(_m4);
        jAv.bones.lHand.getWorldQuaternion(_qP2);
        pd.quaternion.copy(_qP2).invert().multiply(_qD2);
        /* [7.340.0] il blocchetto PENDE sotto la presa e sta FUORI dal piano del palmo: centrato ~7 cm oltre il
           pugno lungo il braccio (la mano ne stringe il bordo alto) e staccato di ~3 cm lungo la propria normale,
           altrimenti le dita lo attraversano (compenetrazione vista a schermo). */
        _pOff.copy(_pLong).multiplyScalar(0.072).addScaledVector(_pN,0.030);
        _pOff.applyQuaternion(_qP2.clone().invert()).multiplyScalar(1/(pd._ws||1));
        pd.position.copy(_pOff);
      }
      /* [7.338.0] SONDA test-only: posizioni/ingombri VERI di mani, mic e taccuino (in world) + distanza del
         taccuino dall'asse del busto → la mano si misura, non si giudica a occhio (lezione 7.206/7.246). */
      if(_CPM_TEST&&jAv&&typeof window!=='undefined'){try{
        const _P=(o)=>{const v=new THREE.Vector3();o.getWorldPosition(v);return[+v.x.toFixed(3),+v.y.toFixed(3),+v.z.toFixed(3)];};
        const _B=(o)=>{const b=new THREE.Box3().setFromObject(o);return{min:b.min.toArray().map(n=>+n.toFixed(3)),max:b.max.toArray().map(n=>+n.toFixed(3))};};
        const _o={actor:!!jAv.actor,female:!!female,rotY:+((jAv.root&&jAv.root.rotation.y)||0).toFixed(3),
          lFore:jAv.bones.lFore?_P(jAv.bones.lFore):null,lArm:jAv.bones.lArm?_P(jAv.bones.lArm):null,rFore:jAv.bones.rFore?_P(jAv.bones.rFore):null,rArm:jAv.bones.rArm?_P(jAv.bones.rArm):null,
          rHand:jAv.bones.rHand?_P(jAv.bones.rHand):null,lHand:jAv.bones.lHand?_P(jAv.bones.lHand):null,
          spine:jAv.bones.spine?_P(jAv.bones.spine):null,head:jAv.bones.head?_P(jAv.bones.head):null,
          mic:mic?{p:_P(mic),bb:_B(mic)}:null,pad:jAv.pad?{p:_P(jAv.pad),bb:_B(jAv.pad)}:null};
        if(jAv.pad&&jAv.bones.lHand){const a=new THREE.Vector3().fromArray(_o.pad.p),h=new THREE.Vector3().fromArray(_o.lHand);_o.padFromHand=+a.distanceTo(h).toFixed(3);
          /* [7.340.0] L'INVARIANTE VERO non è «il taccuino è orizzontale» (col braccio disteso PENDE dal pugno,
             ed è giusto così) ma «non lo si vede DI TAGLIO»: quanto la sua faccia è girata verso la camera.
             1 = faccia piena in vista · 0 = solo il bordo, cioè la lama del collaudo «film horror». */
          const _pq=new THREE.Quaternion();jAv.pad.getWorldQuaternion(_pq);
          const _nn=new THREE.Vector3(0,1,0).applyQuaternion(_pq);
          const _tc=cam.position.clone().sub(a).normalize();
          _o.padFace=+Math.abs(_nn.dot(_tc)).toFixed(3);}
        /* [7.340.0] misure in SPAZIO PERSONAGGIO derivate dallo scheletro (asse laterale = congiungente spalla-spalla):
           «la mano è fuori dal busto?» si risponde con un numero, non a occhio — e la risposta vale su ogni rig. */
        if(jAv.axes2&&_o.spine){const _L=jAv.axes2.lat,_F=jAv.axes2.fwd,_sp=new THREE.Vector3().fromArray(_o.spine);
          const _pj=(arr)=>{if(!arr)return null;const d=new THREE.Vector3().fromArray(arr).sub(_sp);
            return{lat:+d.dot(_L).toFixed(3),fwd:+d.dot(_F).toFixed(3),dy:+d.y.toFixed(3)};};
          _o.body={lHand:_pj(_o.lHand),lFore:_pj(_o.lFore),lArm:_pj(_o.lArm),rHand:_pj(_o.rHand),pad:_o.pad?_pj(_o.pad.p):null};}
        /* proiezione su schermo (px del canvas): la probe ritaglia ESATTAMENTE attorno alle mani */
        const _cv=renderer.domElement,_wpx=_cv.clientWidth||W(),_hpx=_cv.clientHeight||H();
        const _prj=(arr)=>{if(!arr)return null;const v=new THREE.Vector3().fromArray(arr).project(cam);return[Math.round((v.x*0.5+0.5)*_wpx),Math.round((-v.y*0.5+0.5)*_hpx)];};
        _o.px={w:_wpx,h:_hpx,rHand:_prj(_o.rHand),lHand:_prj(_o.lHand),mic:_o.mic?_prj(_o.mic.p):null,pad:_o.pad?_prj(_o.pad.p):null};
        window.__CPM_IVRIG=_o;}catch(_e){}}
      flashes.forEach(f=>{if(f.t<0&&rnd()<0.010)f.t=0;if(f.t>=0){f.t+=0.05;const o=Math.max(0,1-f.t*3.2);f.sp.material.opacity=o;if(o>0.6)flashLight.intensity=1.5;if(f.t>0.4)f.t=-1;}});
      flashLight.intensity*=0.86;
      cam.position.x=camVX+Math.sin(el*0.13)*0.10;cam.lookAt(0.08,0.62,0);
      renderer.render(scene,cam);raf=requestAnimationFrame(tick);};
    // ── camera TV busto-su (variazione seedata del taglio) ──
    const cam=new THREE.PerspectiveCamera(44,W()/H(),0.1,50);cam.position.set(camVX,camVY,4.7);cam.lookAt(0.08,0.62,0);
    raf=requestAnimationFrame(tick);
    return()=>{disposed=true;if(raf)cancelAnimationFrame(raf);
      try{_glbRoots.forEach(r=>{try{scene.remove(r);}catch(_e){}});/* geometrie GLB condivise con _glbCache → fuori dalla scena PRIMA del dispose */
        scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m.map)m.map.dispose();m.dispose();});}});renderer.dispose();host.removeChild(renderer.domElement);}catch(_e){}};
  },[]);
  /* [7.302.0] host OPACO (come PresentationStage3D): se il canvas manca o è più corto, l'area resta
     scura invece di lasciar vedere la pagina sotto. */
  return <div ref={ref} style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden",background:"#07080d"}}/>;
}
/* [7.52.0 direttiva PO «la premiazione deve valere un Pallone d'Oro»] GALA 3.0 — riscrittura completa:
   PRESENTATORE/PRESENTATRICE dinamici dal motore (uomo in SMOKING con camicia+papillon · donna in TAILLEUR con
   chioma professionale — mai abiti sportivi), animazioni da CERIMONIA (idle 0.15 + respiro + gesti di mano quando
   parla + gaze platea/busta — niente riscaldamento) · BUSTA 3D VERA in mano (si APRE al reveal: aletta + cartoncino
   dorato che scivola fuori, con pausa di suspense) · VINCITORE = l'avatar della CARRIERA (pelle/capelli/altezza/
   corporatura dalle stesse formule del match) che ENTRA sul palco, riceve il TROFEO nelle mani (pattern 7.24.1) e
   posa per la foto mentre il presentatore applaude · REGIA TV a beat (largo → presentatore → dettaglio busta →
   vincitore/trofeo → panoramica) con stacchi dt-corretti morbidi · PALCO da evento internazionale (colonne luminose,
   LED laterali, tappeto, fondale a pannelli, spot dinamici) + PUBBLICO in silhouette con applauso e flash dei
   fotografi · trofeo PBR oro (metalness 1) sotto spot dedicato · VARIETÀ seedata (genere/outfit/tema luci/taglio) ·
   cue AUDIO predisposte via cpmEmit("GalaCue") per il futuro audio layer. ⚠️ CH38: volto/occhi bakati → niente
   blink/espressioni facciali: l'espressività è POSTURALE. Fallback procedurale elegante (mai scena vuota). */
/* [7.292.0 direttiva PO «la presentazione della squadra la cambierei, non mi piace che e' alla prima giornata
   del campionato ma organizzerei un evento allo stadio (anche primavera) prima dell'avvio del campionato»]
   LA SERATA DI PRESENTAZIONE, scena a se'. Dal 7.13.0 la presentazione era un OVERLAY sul walkout della prima
   gara casalinga: nasceva quindi DENTRO una giornata di campionato, che e' esattamente cio' che il PO non
   voleva. Ora e' un evento suo, allo stadio, PRIMA che il campionato cominci — e vale anche in Primavera.
   Scena standalone (pattern GalaStage3D/InterviewStage3D): stadio vero via `buildStadium`, prato, squadra
   schierata a centrocampo, fari, fuochi d'artificio sul finale, camera che gira attorno alla fila.
   I calciatori sono i CH38 clonati (SkeletonUtils) e restano INVISIBILI finche' il modello non e' agganciato
   — regola «mai burattini in campo» (7.9.3/7.8.19); senza GLB la scena mostra lo stadio e basta. */
function PresentationStage3D({club,beat=0,total=6,seed=7,youth=false,avatarId=0,heroNum=0,gkIdx=[]}){
  const ref=React.useRef(null);const st=React.useRef({beat:0,total:6});
  st.current.beat=beat|0;st.current.total=Math.max(1,total|0);
  React.useEffect(()=>{
    const host=ref.current;if(!host)return;
    const sr470={};/* [7.470.0] contenitore persistente degli oggetti di appoggio dell'orientamento del palmo: quaternioni e vettori si allocano UNA volta, non a ogni fotogramma */
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch(_e){return;}
    const W=()=>host.clientWidth||360,H=()=>host.clientHeight||640;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setSize(W(),H());renderer.setClearColor(0x050810,1);
    host.appendChild(renderer.domElement);renderer.domElement.style.cssText="position:absolute;inset:0;width:100%;height:100%;";
    const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x070b16,120,300);
    const cam=new THREE.PerspectiveCamera(42,W()/H(),0.5,600);
    const _s=(seed>>>0)||7;const R=n=>(((Math.imul((_s+Math.imul(n,2654435761))>>>0,1664525)+1013904223)>>>0)/4294967296);
    const homeHex=(club&&club.c)||"#6c1f2e",awayHex=(club&&club.c2)||"#f5f5f5";
    /* suolo oltre il campo: senza, sotto gli spalti si vede il cielo (lezione 5.99.0) */
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(320,240),new THREE.MeshBasicMaterial({color:0x0a0f18}));
    ground.rotation.x=-Math.PI/2;ground.position.y=-0.06;scene.add(ground);
    const pitch=new THREE.Mesh(new THREE.PlaneGeometry(104,68),new THREE.MeshStandardMaterial({color:0x1e4a0a,roughness:0.98}));
    pitch.rotation.x=-Math.PI/2;scene.add(pitch);
    /* diagnostica (test-only, spenta in store build): e' la sonda che ha smascherato il prato CIANO — i fari li
       installa gia' `buildStadium`, non serviva un secondo impianto. Enumerare luci/materiali batte il tirare a
       indovinare sulle intensita'. */
    if(typeof _CPM_TEST!=="undefined"&&_CPM_TEST)window.__CPM_PRES_SCENE=scene;
    {const lm=new THREE.MeshBasicMaterial({color:0xdfe8ee,side:THREE.DoubleSide,transparent:true,opacity:0.85});
      const mid=new THREE.Mesh(new THREE.PlaneGeometry(0.3,68),lm);mid.rotation.x=-Math.PI/2;mid.position.y=0.02;scene.add(mid);
      const circ=new THREE.Mesh(new THREE.RingGeometry(9.0,9.3,64),lm);circ.rotation.x=-Math.PI/2;circ.position.y=0.02;scene.add(circ);}
    try{const _cfg=(typeof stadiumConfigFor==="function")?stadiumConfigFor(club||{p:60,lg:"Lega A"},null):{prestige:(club&&club.p)||60,style:0};
      buildStadium(scene,homeHex,awayHex,_cfg);}catch(_e){}
    /* notturna da presentazione. ⚠️ La prima versione aggiungeva QUATTRO PointLight da 0.9 sopra l'ambiente e il
       direzionale: il prato verde andava in saturazione e si leggeva CIANO (verificato a schermo). Qui si usa la
       taratura NOTTURNA del match (7.278.0). E soprattutto: `buildStadium` INSTALLA GIA' I FARI (4 SpotLight da 1.4
       + 4 PointLight da 0.5, misurati sulla scena) — qui servono solo luci di RIEMPIMENTO, non un secondo impianto,
       e il verde del prato e' quello della palette di lega (0x1e4a0a) invece di un verde chiaro inventato. */
    scene.add(new THREE.AmbientLight(0xd0e4ff,0.30));
    const sun=new THREE.DirectionalLight(0xfff2d8,0.34);sun.position.set(30,85,-24);scene.add(sun);
    scene.add(new THREE.HemisphereLight(0x0c2050,0x1e4a0a,0.22));
    /* La fila della squadra a centrocampo, rivolta alla tribuna principale. Sono CH38 clonati e NON esiste una
       controfigura procedurale: la direttiva PO e' «mai burattini in campo» (task #80) — senza modello la scena
       resta lo stadio illuminato, che con la voce dello speaker regge lo stesso.
       ⚠️ Un clone SENZA clip resta in BIND POSE, cioe' a braccia larghe: sullo screenshot sembrava esattamente un
       burattino. Ogni giocatore ha quindi il suo mixer con l'idle, sfasato per non farli respirare all'unisono. */
    const line=new THREE.Group();scene.add(line);
    /* [7.297.0 collaudo PO «i giocatori sono tutti uguali, l'eroe e' vestito da portiere, la maglia della Juve
       deve essere a strisce bianche e nere»] La prima stesura si era costruita un guardaroba e un'anagrafica
       tutti suoi: kit a tinta unita (maglia = 1° colore sociale, pantaloncini = 2°) e cloni identici a meno di
       due centimetri d'altezza. Il gioco ha gia' gli strumenti giusti e vanno usati QUELLI, altrimenti la
       presentazione mostra una squadra che in campo non esiste:
         · `kitPatternFor` + `kitPatternTex` → il kit VERO del club (Torino Athletic e' a strisce, non bianco);
         · `appearanceFromSeed` → statura, corporatura, incarnato, capelli e calvizie per giocatore, seedati sul
           club+slot come nel match (stessa formula ⇒ chi vedi qui e' chi scende in campo);
         · l'eroe indossa la DIVISA DELLA SQUADRA con il suo numero sul dorso — l'ambra della prima stesura era
           il colore che il match usa per FARLO RISALTARE, ma qui, in fila con gli altri, leggeva come un portiere.
       Chi viene presentato lo decide `presBeats`: il numero di beat comanda la lunghezza della fila. */
    const N=Math.max(2,Math.min(9,(st.current.total|0)-1)),SP=4.6,HERO=N-1,LZ=6,STEP=10.4;
    const men=[];const mixers=[];
    const _pat=(typeof kitPatternFor==="function")?kitPatternFor(club||{}):"solid";
    const _num=heroNum|0;
    /* l'eroe e' il SUO avatar di carriera, con la stessa formula del match (9405): incarnato/capelli da AVATARS */
    const heroAppr=(function(){try{const av=(typeof AVATARS!=="undefined")&&AVATARS[((avatarId|0)%AVATARS.length+AVATARS.length)%AVATARS.length];
      return av?{height:1.86+((avatarId*73)%100)/100*0.16,girth:0.97+((avatarId*131)%100)/100*0.10,skin:av.skin,hair:av.hair,bald:av.style==='bald'}:null;}catch(_e){return null;}})();
    if(window.__CPM_GLB!==false&&typeof loadGLB==="function"&&THREE.SkeletonUtils&&THREE.SkeletonUtils.clone){
      Promise.all([loadGLB('./assets/footballer.glb'),loadGLB('./assets/anim-idle.glb').catch(()=>null)]).then(([glb,idle])=>{
        if(!glb||!glb.scene)return;
        for(let i=0;i<N;i++){
          const root=THREE.SkeletonUtils.clone(glb.scene);
          const isHero=(i===HERO);
          /* [7.302.0] il PORTIERE non veste come gli altri: divisa a tinta unita dalla stessa palette del
             match (GK_POOL), scelta per contrasto con la maglia di squadra, e niente pattern del club. */
          const isGk=!isHero&&(gkIdx||[]).indexOf(i)>=0;
          const _GKP=['#1d1d1f','#facc15','#16a34a','#db2777','#e5e7eb','#06b6d4','#f97316'];
          /* il contrasto va tenuto con ENTRAMBI i colori sociali: contro una maglia a strisce bianco/nere
             il piu' lontano dal solo bianco sarebbe il NERO — cioe' l'altra meta' delle strisce. */
          const _gkCol=(function(){try{const cs=[new THREE.Color(homeHex),new THREE.Color(awayHex)];
            let best=_GKP[0],bd=-1;_GKP.forEach(c=>{const q=new THREE.Color(c);
              const d=Math.min.apply(null,cs.map(h=>Math.abs(q.r-h.r)+Math.abs(q.g-h.g)+Math.abs(q.b-h.b)));
              if(d>bd){bd=d;best=c;}});
            return best;}catch(_e){return '#16a34a';}})();
          const ap=(isHero&&heroAppr)?heroAppr:((typeof appearanceFromSeed==="function")?appearanceFromSeed(hashStr(String((club&&club.id)||"x")+"|pres|"+i)):{height:1.82,girth:1});
          root.traverse(o=>{if(!o.isMesh||!o.material)return;o.frustumCulled=false;const n=(o.name||"").toLowerCase();
            if(n.indexOf('joint')>=0){o.visible=false;return;}
            const set=(c)=>{const col=new THREE.Color(c);o.material=new THREE.MeshLambertMaterial({color:col,emissive:col.clone().multiplyScalar(0.14),skinning:true});};
            if(n.indexOf('shirt')>=0){let t=null;
              if(isGk){set(_gkCol);return;}
              if(typeof kitPatternTex==="function")t=kitPatternTex(homeHex,awayHex,_pat||'solid',(isHero&&_num)?_num:undefined);
              if(t)o.material=new THREE.MeshLambertMaterial({map:t,emissive:new THREE.Color(homeHex).multiplyScalar(0.12),skinning:true});
              else set(homeHex);}
            else if(n.indexOf('shorts')>=0)set(isGk?_gkCol:awayHex);
            else if(n.indexOf('socks')>=0)set(isGk?_gkCol:homeHex);
            else if(n.indexOf('shoes')>=0)set(0x222222);
            else if(n.indexOf('hair')>=0){if(ap.bald)o.visible=false;else o.material=new THREE.MeshLambertMaterial({color:new THREE.Color(ap.hair||'#2d1800'),skinning:true});}
            else if(n.indexOf('body')>=0&&o.material.map){o.material=o.material.clone();const sk=new THREE.Color(ap.skin||0xffffff);o.material.color=sk;if('emissive'in o.material)o.material.emissive=sk.clone().multiplyScalar(0.24);}});
          const bb=new THREE.Box3().setFromObject(root),hh=Math.max(0.001,bb.max.y-bb.min.y);
          const sc=(ap.height||1.82)/hh,gi=ap.girth||1;root.scale.set(sc*gi,sc,sc*gi);
          root.position.set((i-(N-1)/2)*SP,0,LZ);root.rotation.y=0;/* verso la tribuna della camera */
          line.add(root);men.push(root);
          /* [7.419.0 collaudo PO «secondo me dovrebbero stare fermi, al massimo alzare un braccio per
             salutare rispettivamente i tifosi»] LA FILA STA FERMA. La clip idle in LOOP faceva
             ondeggiare tutta la fila (pesi che si spostano, gambe che si allargano): in una
             presentazione vera i giocatori stanno SULL'ATTENTI. La clip resta ma IN PAUSA su un
             fotogramma diverso per uomo (pose naturali e variate, non un plotone di manichini
             identici); il mixer continua a riapplicare la posa ferma a ogni frame — e' la base su
             cui il saluto additivo (nel tick) puo' scrivere senza accumulare. */
          if(idle&&idle.animations&&idle.animations[0]){const mx=new THREE.AnimationMixer(root);
            const a=mx.clipAction(idle.animations[0]);a.play();mx.setTime(R(70+i)*2.4);a.paused=true;mixers.push(mx);}
          /* le ossa del braccio destro per il SALUTO del chiamato (rig mixamorig, come 7.24.2)
             [7.430.0] + le ossa di POSTURA (colonna/collo/testa): il raddrizzamento scrive li' */
          {let _wa=null,_wf=null,_wh=null,_whL=null;const _ps=[];root.traverse(o=>{if(!o.isBone)return;const n=o.name||"";if(!_wa&&/RightArm$/i.test(n))_wa=o;if(!_wf&&/RightForeArm$/i.test(n))_wf=o;if(!_wh&&/RightHand$/i.test(n))_wh=o;if(!_whL&&/LeftHand$/i.test(n))_whL=o;if(/Spine$|Spine1$|Spine2$|Neck$|Head$/i.test(n))_ps.push(o);});root._wv={aR:_wa,fR:_wf,hR:_wh,hL:_whL,ps:_ps};}/* [7.462.0 collaudo PO «il braccio e la mano sono storte»] ANCHE LA MANO SINISTRA, E PER TUTTA LA FILA. Il 7.438 aveva raddrizzato il polso — ma solo il DESTRO e solo per il giocatore che sta salutando. Tutti gli altri restavano col polso del fotogramma congelato della clip idle in pausa: misurato sui provini GLB-ON del beat «NUOVO ACQUISTO», entrambe le mani piegate di netto verso l'esterno su ogni uomo schierato. E' la stessa causa del 7.430 (la clip in PAUSA congela un fotogramma di passaggio, non una posa), applicata a un osso che era rimasto fuori dall'elenco. *//* [7.438.0 collaudo PO «la mano e' storta, sembra un contorsionista»] +RightHand: il polso teneva la rotazione del fotogramma congelato mentre il braccio si alzava */
        }
      }).catch(()=>{});
    }
    /* ⚠️ `size` e' in UNITA' MONDO con sizeAttenuation: 1.5 a ~35u di distanza sono ~50px a punto — i 90 punti
       ancora raccolti a inizio scoppio si fondevano in un DISCO azzurro pieno (visto a schermo). Scintille piccole,
       piu' numerose e additive: leggono come fuochi anche nel primo fotogramma del burst. */
    const fw=[];for(let k=0;k<3;k++){
      const n=150,pos=new Float32Array(n*3),vel=[];
      for(let i=0;i<n;i++){const th=Math.random()*Math.PI*2,ph=Math.random()*Math.PI*0.62,sp=11+Math.random()*7;
        vel.push([Math.sin(ph)*Math.cos(th)*sp,Math.cos(ph)*sp,Math.sin(ph)*Math.sin(th)*sp]);pos[i*3]=0;pos[i*3+1]=0;pos[i*3+2]=0;}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const p=new THREE.Points(geo,new THREE.PointsMaterial({color:[0xffd24a,0x7dd3fc,0xf472b6][k],size:0.42,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
      p.position.set((k-1)*20,12,-14);p.visible=false;scene.add(p);fw.push({p,vel,t:0});/* quota/profondita' scelte per restare NEL quadro della camera finale (verificato a schermo) */
    }
    let raf=0,t0=performance.now(),alive=true,tPrev=t0;
    const aim=new THREE.Vector3(0,2.2,LZ);
    const tick=()=>{
      if(!alive)return;raf=requestAnimationFrame(tick);
      const now=performance.now(),el=(now-t0)/1000,dt=Math.min(0.06,(now-tPrev)/1000);tPrev=now;
      if(mixers.length)mixers.forEach(m=>m.update(dt));
      const b=st.current.beat,tot=st.current.total;
      /* Beat 0 = lo stadio · beat 1 = la squadra · dal 2 in poi lo speaker chiama UN giocatore per volta (i beat
         di testo sono costruiti cosi' in `presBeats`). In verticale la fila intera non ci sta nell'inquadratura
         (fov orizzontale ~15°): invece di allargare all'infinito, si stringe su CHI viene chiamato — che e' poi
         come funziona una presentazione vera. */
      const pi=b-2,called=(pi>=0&&pi<N),lx=(called?pi:(N-1)/2)-(N-1)/2;
      const hx=lx*SP;
      /* il chiamato fa un passo avanti verso i tifosi, gli altri restano in fila */
      for(let i=0;i<men.length;i++){const tz=(called&&i===pi)?STEP:LZ;men[i].position.z+=(tz-men[i].position.z)*Math.min(1,dt*3.2);}
      /* [7.419.0] IL CHIAMATO SALUTA I SUOI TIFOSI: braccio destro su con rampa morbida e un
         ondeggio di avambraccio — additivo DOPO il mixer (pattern 7.24.2/gk: il mixer riapplica la
         posa base a ogni frame, quindi l'offset non accumula). Gli altri restano sull'attenti. */
      /* [7.424.0 collaudo PO «braccio bionico che ruota in maniera impazzita»] POSA ASSOLUTA, MAI
         ADDITIVA: con la clip in PAUSA il mixer non riscrive le ossa a ogni frame, quindi l'offset
         `-=` del 7.419 si ACCUMULAVA — il braccio diventava un'elica. Ora la base dell'osso viene
         campionata UNA volta e ogni frame si scrive base+offset: per quanto giri il tick, il
         braccio sta dove deve — alzato a salutare, e basta. */
      /* [7.430.0 collaudo PO «migliora la dinamica di movimento del braccio che saluta e la postura,
         sono aggobbati e tristi»] DUE CAUSE MISURATE SUL RIPRODOTTO: (1) la clip idle in PAUSA congela
         anche i fotogrammi di TRASFERIMENTO DI PESO — spalle avanti, testa bassa: l'«aggobbato triste»
         dello screenshot; (2) il saluto era un OFFSET CIECO dalla posa congelata (base.z-1.95): a
         seconda del fotogramma la mano finiva IN FRONTE (il facepalm dello screenshot) invece che in
         alto. Ora: la POSTURA si raddrizza in assoluto dopo il mixer (colonna/collo/testa scalati verso
         l'eretto — il mixer in pausa riscrive la stessa posa a ogni frame, quindi niente accumulo), e il
         braccio del saluto va a un BERSAGLIO CANONICO (blend base→alzato su x e z, gomito che si
         distende) con l'ondeggio sull'avambraccio: un saluto ai tifosi, non un grattacapo. */
      for(let i=0;i<men.length;i++){const _m=men[i];if(!_m._wv)continue;
        const _aB=_m._wv.aR,_fB=_m._wv.fR;
        if(_aB&&!_aB._base419)_aB._base419={x:_aB.rotation.x,y:_aB.rotation.y,z:_aB.rotation.z};
        if(_fB&&!_fB._base419)_fB._base419={x:_fB.rotation.x,y:_fB.rotation.y,z:_fB.rotation.z};
        if(_m._wv.ps)for(const _pb of _m._wv.ps){if(!_pb._base419)_pb._base419={x:_pb.rotation.x,y:_pb.rotation.y,z:_pb.rotation.z};
          _pb.rotation.set(_pb._base419.x*0.35,_pb._base419.y,_pb._base419.z*0.6);}
        /* [7.462.0] IL POLSO SI RADDRIZZA PRIMA DEL SALUTO, E PER CHIUNQUE. Scritto qui — prima del blocco
           del saluto, che per la mano destra sovrascrive con la propria rampa — cosi' chi saluta non viene
           toccato due volte e chi sta fermo smette di avere le mani piegate. Stessa disciplina del resto
           del tick: base campionata UNA volta, poi si scrive base*fattore (mai `-=`, che si accumula). */
        for(const _hb of [_m._wv.hR,_m._wv.hL]){if(!_hb)continue;
          if(!_hb._base419)_hb._base419={x:_hb.rotation.x,y:_hb.rotation.y,z:_hb.rotation.z};
          _hb.rotation.set(_hb._base419.x*0.2,_hb._base419.y*0.2,_hb._base419.z*0.2);}
        if(called&&i===pi){_m._wvT=(_m._wvT||0)+dt;const _s=Math.min(1,_m._wvT*2.4);
          const _hB=_m._wv.hR;if(_hB){if(!_hB._base419)_hB._base419={x:_hB.rotation.x,y:_hB.rotation.y,z:_hB.rotation.z};
            _hB.rotation.set(_hB._base419.x*(1-_s*0.85),_hB._base419.y*(1-_s*0.85),_hB._base419.z*(1-_s*0.85));}/* polso in asse con l'avambraccio */
          const _ov=(typeof window!=="undefined"&&window.__CPM_WVSET)||null;/* sweep test-only degli euler (collaudo posa) */
          if(_aB&&typeof window!=="undefined"&&!window.__CPM_WVDBG)window.__CPM_WVDBG={base:{x:_aB._base419.x,y:_aB._base419.y,z:_aB._base419.z},fore:_fB?{x:_fB._base419.x,y:_fB._base419.y,z:_fB._base419.z}:null};
          if(_aB){if(_ov)_aB.rotation.set(_ov.x,_ov.y!=null?_ov.y:_aB._base419.y,_ov.z);/* [7.462.0] lo sweep copre anche la TORSIONE del braccio (Y, l'asse dell'osso): e' quella che decide dove guarda il palmo, e finora era l'unica lasciata alla posa di riposo */
            else if(typeof THREE!=='undefined'&&!(typeof window!=='undefined'&&window.__CPM_NO479)){
            /* [7.479.0 collaudo PO «braccio storto» — QUINTA comparsa, e la prima MISURATA] IL BRACCIO SI
               PUNTA, NON SI INDOVINA. Le quattro release precedenti hanno scelto euler guardando provini;
               la probe `wave-arm-geometry.mjs` legge invece spalla/gomito/polso in spazio MONDO, e il
               verdetto e' che nessun giunto e' fuori range — il polso sta a 1,8-14° contro un limite umano
               di ~70, il gomito piega in avanti come deve. Cio' che e' fuori posto e' l'ELEVAZIONE: gomito
               0,13u sopra la spalla su un omero di 0,30 vuol dire ~26 gradi sopra l'orizzontale, con il
               gomito a 158-168 gradi, cioe' bloccato. Il codice CREDEVA di alzare (l'euler -1,95 e' l'81%
               della verticale sulla scala misurata dal 7.430) e il mondo diceva un'altra cosa: un euler
               scritto su un osso non e' una direzione finche' non si guarda dove finisce l'osso.
               Ora si usa il pattern che per il PALMO ha funzionato (7.470): si CALIBRA una volta quale asse
               locale corre lungo l'osso — prendendo il vettore che va dalla spalla al gomito, vero per
               costruzione per qualunque rig — e poi si RUOTA in spazio mondo perche' quell'asse punti dove
               deve. Bersagli da un saluto umano, non da un numero simpatico: omero quasi di lato e appena
               sopra l'orizzontale, avambraccio VERTICALE. Ne esce un gomito intorno ai 110 gradi e la mano
               sopra la testa — che e' come saluta una persona. `__CPM_NO479` rimette la posa di prima. */
              const _K=(sr470._k479||(sr470._k479={q:new THREE.Quaternion(),q2:new THREE.Quaternion(),qp:new THREE.Quaternion(),m:new THREE.Matrix4(),v:new THREE.Vector3(),t:new THREE.Vector3(),o:new THREE.Vector3(),a:new THREE.Vector3(),b:new THREE.Vector3()}));
              const _AXI=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
              /* ⚠️ TRAPPOLA PAGATA E ANNOTATA: la prima stesura scriveva la differenza dentro `_K.a`, che
                 per l'omero E' ANCHE il punto di partenza — `copy(pTo).sub(pFrom)` con pFrom===_K.a da'
                 il vettore nullo, e la calibrazione cadeva in silenzio sul valore di ripiego. Misurato:
                 gomito chiuso a 67-90 gradi e polso ancora sotto la spalla, cioe' il braccio puntato con
                 un asse mai misurato. Ora la differenza ha un vettore suo. */
              const _cal=(bone,pFrom,pTo)=>{/* quale asse locale corre lungo l'osso: si misura, non si assume */
                _K.m.extractRotation(bone.matrixWorld);_K.d479=_K.d479||new THREE.Vector3();
                _K.d479.copy(pTo).sub(pFrom);
                if(_K.d479.lengthSq()<1e-8)return [0,-1,0];_K.d479.normalize();
                let _bd=-2,_be=null;for(const ax of _AXI){_K.v.set(ax[0],ax[1],ax[2]).applyMatrix4(_K.m).normalize();const d=_K.v.dot(_K.d479);if(d>_bd){_bd=d;_be=ax;}}
                return _be||[0,-1,0];};
              const _punta=(bone,axLoc,tgt)=>{/* ruota l'osso in MONDO perche' il suo asse guardi il bersaglio */
                bone.updateWorldMatrix(true,false);_K.m.extractRotation(bone.matrixWorld);
                _K.v.set(axLoc[0],axLoc[1],axLoc[2]).applyMatrix4(_K.m).normalize();
                _K.q2.setFromUnitVectors(_K.v,tgt);
                if(_s<1)_K.q2.slerp(sr470._id||(sr470._id=new THREE.Quaternion()),1-_s);/* stessa rampa del resto */
                _K.q.setFromRotationMatrix(_K.m).premultiply(_K.q2);
                if(bone.parent){bone.parent.getWorldQuaternion(_K.qp);_K.qp.invert();_K.q.premultiply(_K.qp);}
                bone.quaternion.copy(_K.q);};
              _aB.updateWorldMatrix(true,false);_fB&&_fB.updateWorldMatrix(true,false);
              _aB.getWorldPosition(_K.a);if(_fB)_fB.getWorldPosition(_K.b);else _K.b.copy(_K.a);
              if(!_aB._ax479)_aB._ax479=_cal(_aB,_K.a,_K.b);
              /* «di lato» non si deduce da una convenzione (il 7.470 ha pagato mezzo giro per averlo fatto):
                 e' il vettore che va dal CORPO alla SPALLA, appiattito sull'orizzontale — vero per qualunque
                 rig e per entrambe le braccia. */
              _m.getWorldPosition(_K.o);_K.o.subVectors(_K.a,_K.o);_K.o.y=0;
              if(_K.o.lengthSq()<1e-6)_K.o.set(1,0,0);_K.o.normalize();
              const _EL=0.34;/* seno dell'elevazione dell'omero: ~20 gradi sopra l'orizzontale */
              _K.t.set(_K.o.x*0.94,_EL,_K.o.z*0.94).normalize();
              _punta(_aB,_aB._ax479,_K.t);
              if(_fB){_fB.updateWorldMatrix(true,false);
                _aB.getWorldPosition(_K.a);_fB.getWorldPosition(_K.b);
                if(!_fB._ax479){const _hh=_m._wv.hR;if(_hh){_hh.updateWorldMatrix(true,false);_hh.getWorldPosition(_K.v);_fB._ax479=_cal(_fB,_K.b,_K.v);}else _fB._ax479=_aB._ax479;}
                /* avambraccio VERTICALE, con l'ondeggio del saluto che sposta il bersaglio invece di
                   sommarsi a un euler: cosi' la mano oscilla senza che il gomito cambi apertura. */
                const _sw=Math.sin(el*5.2)*0.16*_s;
                _K.t.set(_K.o.x*_sw,1,_K.o.z*_sw).normalize();
                _punta(_fB,_fB._ax479,_K.t);}
              _aB._done479=true;}
            else {_aB._done479=false;_aB.rotation.set(_aB._base419.x*(1-_s)+(-1.95)*_s,_aB._base419.y,_aB._base419.z*(1-_s)+(-0.25)*_s);}}/* [7.470.0 collaudo PO «la mano e' ok, e' rimasto il braccio storto»] TOLTA LA TORSIONE -0,8 DEL BRACCIO. Il 7.462 l'aveva baked per girare il PALMO, che era l'unico comando disponibile allora; da quando la mano si orienta da sola in spazio mondo (blocco qui sopra) quel mezzo giro non serve piu' a niente — e cio' che resta e' solo un braccio ritorto sul proprio asse. Il braccio torna alla sua torsione naturale e si limita ad alzarsi: un comando, un compito. *//* [7.462.0 collaudo PO «la mano deve essere rivolta in avanti come gesto di saluto»] LA TORSIONE DEL BRACCIO. Il 7.430 aveva portato il braccio al bersaglio canonico su X e Z ma lasciava Y — la rotazione attorno all'ASSE DELL'OSSO — al valore della posa di riposo (-0,087: un braccio che pende col palmo verso la coscia). Alzato cosi', il palmo guarda di lato e si vede il taglio della mano: la «mano storta». Il valore e' MISURATO coi provini GLB-ON dello sweep (`wave-pose-sweep.mjs`, hook `__CPM_WVSET.y`) sul beat «NUOVO ACQUISTO», che e' quello che il PO ha fotografato: a -0,087 la mano e' di taglio, a +0,8 il braccio si chiude contro la testa, a -0,8 il palmo guarda la camera — il saluto. *//* [7.430.0] sweep misurato: il rig alza su X (base 0,79=giu', -2,6=verticale) — l'offset su Z del 7.419 portava la mano in fronte */
          /* [7.470.0 collaudo PO «il palmo della mano deve essere in direzione dello sguardo del calciatore»]
             IL PALMO SI CALCOLA, NON SI CERCA A TENTONI. Il 7.462 aveva sweeppato la torsione del braccio e
             baked -0,8 sui provini: sul dispositivo del PO la mano restava storta, e due passate di sweep
             successive non hanno saputo deciderlo — a quella distanza il palmo e' quindici pixel, e stavo
             misurando la mia capacita' di guardare un francobollo. Il criterio del PO invece e' esatto e si
             traduce in geometria: il palmo deve puntare dove punta lo SGUARDO. Quindi si CALIBRA una volta
             quale asse locale dell'osso-mano e' la normale del palmo — a riposo il braccio pende e il palmo
             guarda la coscia, cioe' verso il corpo — e poi, al saluto, si ruota la mano in spazio MONDO
             perche' quella normale coincida con la direzione in cui il modello guarda. Niente euler
             indovinati: l'orientamento e' una conseguenza della posa, a qualunque angolo stia il giocatore.
             Oggetti di appoggio riusati (nessuna allocazione per fotogramma). */
          if(_hB&&typeof THREE!=='undefined'){try{
            const _S=(sr470._s||(sr470._s={q:new THREE.Quaternion(),q2:new THREE.Quaternion(),qp:new THREE.Quaternion(),m:new THREE.Matrix4(),v:new THREE.Vector3(),f:new THREE.Vector3(),b:new THREE.Vector3()}));
            _hB.updateWorldMatrix(true,false);_S.m.extractRotation(_hB.matrixWorld);
            if(!_hB._pal470){
              /* [7.470.0 correzione dopo il collaudo PO «la mano e' ancora storta di 180 gradi»] LA DIREZIONE
                 «VERSO IL CORPO» NON SI DEDUCE, SI MISURA. La prima stesura la assumeva pari a -x del modello,
                 e ha sbagliato di mezzo giro: con la figura che guarda +z, la mano DESTRA sta a -x, quindi
                 verso il corpo e' +x — l'opposto. Dedurre un verso da una convenzione e' esattamente il modo
                 di sbagliare di 180 gradi. Ora si prende il vettore che va dalla MANO al CORPO e lo si
                 appiattisce sull'orizzontale: e' vero per costruzione, per qualunque mano e qualunque rig. */
              _m.getWorldPosition(_S.b);_hB.getWorldPosition(_S.v);_S.b.sub(_S.v);_S.b.y=0;
              if(_S.b.lengthSq()<1e-6){_m.getWorldQuaternion(_S.q);_S.b.set(1,0,0).applyQuaternion(_S.q);}
              _S.b.normalize();
              const _AX=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];let _bd=-2,_be=null;
              for(const a of _AX){_S.v.set(a[0],a[1],a[2]).applyMatrix4(_S.m).normalize();const d=_S.v.dot(_S.b);if(d>_bd){_bd=d;_be=a;}}
              _hB._pal470=_be||[0,-1,0];
            }
            _m.getWorldQuaternion(_S.q);_S.f.set(0,0,1).applyQuaternion(_S.q).normalize();/* lo SGUARDO del modello */
            _S.v.set(_hB._pal470[0],_hB._pal470[1],_hB._pal470[2]).applyMatrix4(_S.m).normalize();
            _S.q2.setFromUnitVectors(_S.v,_S.f);
            if(_s<1)_S.q2.slerp(sr470._id||(sr470._id=new THREE.Quaternion()),1-_s);/* entra con la stessa rampa del braccio */
            _S.q.setFromRotationMatrix(_S.m).premultiply(_S.q2);
            if(_hB.parent){_hB.parent.getWorldQuaternion(_S.qp);_S.qp.invert();_S.q.premultiply(_S.qp);}
            _hB.quaternion.copy(_S.q);
          }catch(_e470){}}
          if(_fB&&!(_aB&&_aB._done479)){if(_ov)_fB.rotation.set(_ov.fx!=null?_ov.fx:_fB._base419.x,_ov.fy!=null?_ov.fy:_fB._base419.y,_ov.fz!=null?_ov.fz:_fB._base419.z);
            else _fB.rotation.set(_fB._base419.x*(1-_s*0.6)+Math.sin(el*5.2)*0.35*_s,_fB._base419.y,_fB._base419.z*(1-_s*0.85));}}/* [7.479.0] col puntamento in mondo l'avambraccio e' gia' orientato: questo ramo resta per lo sweep e per `__CPM_NO479` *//* gomito quasi disteso: il residuo del -0,57 di base piegava la mano sopra la testa */
        else{_m._wvT=0;
          if(_aB)_aB.rotation.set(_aB._base419.x,_aB._base419.y,_aB._base419.z);
          if(_fB)_fB.rotation.set(_fB._base419.x,_fB._base419.y,_fB._base419.z);}}
      let cx,cy,cz,ax,ay,az;
      if(b<=0){const a=-0.5+el*0.055;cx=Math.sin(a)*92;cz=Math.cos(a)*92;cy=40;ax=0;ay=9;az=0;}         /* la panoramica del catino */
      else if(b===1){cx=-22;cy=9.0;cz=40;ax=0;ay=2.0;az=LZ;}                                             /* la squadra schierata */
      else{const d=(b>=tot-1)?11.4:9.6;cx=hx+d*0.38;cy=1.62;cz=(called?STEP:LZ)+d;ax=hx;ay=1.15;az=(called?STEP:LZ);}
      const k=Math.min(1,dt*2.6);
      cam.position.x+=(cx-cam.position.x)*k;cam.position.y+=(cy-cam.position.y)*k;cam.position.z+=(cz-cam.position.z)*k;
      aim.x+=(ax-aim.x)*k;aim.y+=(ay+Math.sin(el*0.5)*0.06-aim.y)*k;aim.z+=(az-aim.z)*k;
      cam.lookAt(aim);
      if(b>=tot-1){fw.forEach((f,i)=>{f.p.visible=true;f.t+=0.016;
        const tt=Math.max(0,f.t-i*0.35);if(tt<=0)return;const ex=tt+0.22;/* mai raggio zero: i punti non si sovrappongono in un disco */
        const a=f.p.geometry.attributes.position;
        for(let j=0;j<f.vel.length;j++){a.array[j*3]=f.vel[j][0]*ex;a.array[j*3+1]=f.vel[j][1]*ex-9.8*ex*ex*0.5;a.array[j*3+2]=f.vel[j][2]*ex;}
        a.needsUpdate=true;f.p.material.opacity=Math.max(0,1-tt*0.5);
        if(tt>2.2){f.t=i*0.35;f.p.material.opacity=0;}});}
      /* [7.479.0 «braccio storto» — QUARTA comparsa (7.419 · 7.430 · 7.462 · 7.470), quindi una PROBE NUOVA
         e non un altro numero indovinato sui provini] LA GEOMETRIA DEL BRACCIO, IN SPAZIO MONDO. Le tre
         release precedenti hanno scelto euler guardando fotogrammi in cui la mano e' larga quindici pixel:
         si stava misurando la propria capacita' di guardare un francobollo, e il PO ha rimandato indietro
         ogni volta. Qui si leggono le POSIZIONI di spalla, gomito e polso dopo che la posa e' stata scritta
         e le matrici aggiornate — da cui l'angolo del gomito e IL VERSO IN CUI PIEGA rispetto allo sguardo
         del modello. Un gomito che piega all'indietro non e' un'opinione estetica: e' un braccio che nessun
         essere umano ha. Solo strumenti accesi, e solo per chi sta salutando. */
      if(typeof window!=='undefined'&&(window.__CPM_REC||_CPM_TEST||_SIT_TEST)&&called&&men[pi]&&men[pi]._wv){try{
        const _mw=men[pi],_w=_mw._wv,_g=(window.__CPM_WVGEO=window.__CPM_WVGEO||{});
        if(_w.aR&&_w.fR&&_w.hR){
          const _P=(_g._p||(_g._p={a:new THREE.Vector3(),f:new THREE.Vector3(),h:new THREE.Vector3(),q:new THREE.Quaternion(),d:new THREE.Vector3()}));
          _w.aR.updateWorldMatrix(true,false);_w.fR.updateWorldMatrix(true,false);_w.hR.updateWorldMatrix(true,false);
          _w.aR.getWorldPosition(_P.a);_w.fR.getWorldPosition(_P.f);_w.hR.getWorldPosition(_P.h);
          _mw.getWorldQuaternion(_P.q);_P.d.set(0,0,1).applyQuaternion(_P.q).normalize();/* lo sguardo del modello */
          _g.spalla={x:+_P.a.x.toFixed(3),y:+_P.a.y.toFixed(3),z:+_P.a.z.toFixed(3)};
          _g.gomito={x:+_P.f.x.toFixed(3),y:+_P.f.y.toFixed(3),z:+_P.f.z.toFixed(3)};
          _g.polso={x:+_P.h.x.toFixed(3),y:+_P.h.y.toFixed(3),z:+_P.h.z.toFixed(3)};
          _g.sguardo={x:+_P.d.x.toFixed(3),y:+_P.d.y.toFixed(3),z:+_P.d.z.toFixed(3)};
          /* [7.479.0] E IL POLSO. Dal 7.470 la mano viene ruotata in spazio MONDO perche' il palmo punti
             dove punta lo sguardo: e' corretto come intenzione, ma NESSUNO ha mai misurato che angolo
             costi al polso. Con l'arto alzato di lato quella condizione puo' chiedere una rotazione che un
             polso umano non ha, e un polso spezzato a distanza si legge come un braccio storto — che e'
             esattamente la nota che tre release non sono riuscite a chiudere guardando i provini. Qui si
             portano fuori i tre assi MONDO dell'osso-mano: quale sia il verso delle dita lo decide la
             sonda confrontandoli con l'avambraccio, senza convenzioni dedotte (la lezione dei 180 gradi
             sbagliati del 7.470). */
          const _MM=(_g._m2||(_g._m2=new THREE.Matrix4()));_MM.extractRotation(_w.hR.matrixWorld);
          const _ax=(a)=>{_P.d.set(a[0],a[1],a[2]).applyMatrix4(_MM).normalize();return {x:+_P.d.x.toFixed(3),y:+_P.d.y.toFixed(3),z:+_P.d.z.toFixed(3)};};
          _g.manoX=_ax([1,0,0]);_g.manoY=_ax([0,1,0]);_g.manoZ=_ax([0,0,1]);
          _g.palmo=_w.hR._pal470?_ax(_w.hR._pal470):null;
          _mw.getWorldQuaternion(_P.q);_P.d.set(0,0,1).applyQuaternion(_P.q).normalize();
          _g.t=+(+(_mw._wvT||0)).toFixed(2);_g.n=(_g.n||0)+1;
        }
      }catch(_e479){}}
      renderer.render(scene,cam);
    };
    cam.position.set(Math.sin(-0.5)*80,34,Math.cos(-0.5)*80);tick();
    const onR=()=>{try{cam.aspect=W()/H();cam.updateProjectionMatrix();renderer.setSize(W(),H());}catch(_e){}};
    window.addEventListener('resize',onR);
    return()=>{alive=false;cancelAnimationFrame(raf);window.removeEventListener('resize',onR);
      try{scene.traverse(o=>{if(o.geometry)o.geometry.dispose();
        if(o.material){const m=Array.isArray(o.material)?o.material:[o.material];m.forEach(x=>{if(x.map)x.map.dispose();x.dispose&&x.dispose();});}});}catch(_e){}
      try{renderer.dispose();}catch(_e){}
      try{if(renderer.domElement&&renderer.domElement.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);}catch(_e){}};
  },[]);
  return <div ref={ref} style={{position:"absolute",inset:0,overflow:"hidden",background:"#050810"}}/>;
}
/* ════════════════════════════════════════════════════════════════════════
   [7.423.0 evolutiva PO «dopo la cerimonia alla vittoria di uno scudetto o coppa europea farei
   vedere anche scene 3d con il pullman scoperto e tifosi e squadra in festa»] LA PARATA.
   Scena 3D autonoma (modello Serata 7.292): la via della citta' di notte, due ali di folla nei
   colori del club, il PULLMAN SCOPERTO che avanza con la squadra sul tetto a salutare e l'eroe a
   prua con la coppa. Coriandoli nei colori del club (oro se Champions). GLB-ON: uomini veri
   (cloni footballer, posa ferma + saluto additivo, pattern 7.419); GLB-OFF: omini low-poly.
   Si apre da Fine Stagione quando c'e' scudetto o coppa europea; «Continua» la chiude.
   ════════════════════════════════════════════════════════════════════════ */
function ParataBus3D({club,euroWin,avatarId=0,heroNum=10}){/* [7.469.0] esposto come `__CPM_PARATA` (test-only, riga sotto la dichiarazione): la parata vive dentro SeasonEndScreen dietro un titolo vinto, quindi per GUARDARLA servirebbe una carriera intera — e «migliora la grafica» non si fa a occhio chiuso. */
  /* [7.424.0 direttiva PO «migliorala e consolidala»] SECONDA STESURA. (1) CONSOLIDATA: il bus non
     viaggia piu' nel mondo (il loop da 80u tagliava la scena ogni ~19s con uno scatto visibile dei
     palazzi) — ora il bus resta in scena e IL MONDO GLI SCORRE INCONTRO con periodo modulare 96
     (palazzi/lampioni/folla ripetono il pattern ogni 96 unita': il wrap e' invisibile per
     costruzione, la corsa e' infinita). (2) SCENOGRAFIA: tre INQUADRATURE di regia che si alternano
     con blend morbido (tre-quarti da telegiornale · laterale bassa in mezzo alla folla · alta da
     dietro con la via che si apre), FUMOGENI nei colori del club dalle ali di folla, BANDIERE che
     sventolano, la scritta CAMPIONI sulla fiancata (CanvasTexture), ruote che girano, sospensioni
     che respirano, coppa con i MANICI. GLB-ON: squadra vera sul tetto (posa ferma + saluto additivo
     7.419); GLB-OFF: omini low-poly. */
  const ref=React.useRef(null);
  React.useEffect(()=>{
    const el=ref.current;if(!el||typeof THREE==="undefined")return;
    const W=()=>el.clientWidth||360,H=()=>el.clientHeight||640;
    const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(W(),H());renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));el.appendChild(renderer.domElement);
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x141b30);scene.fog=new THREE.Fog(0x141b30,70,170);/* [7.453.0] il fondo era quasi nero (0x070a16) e la nebbia mangiava il viale gia' a 55u: la citta' in festa spariva nel buio */
    const cam=new THREE.PerspectiveCamera(52,W()/H(),0.1,400);
    /* [7.453.0 collaudo PO «l'atmosfera/scena è troppo troppo buia»] La via era illuminata da una sola
       direzionale alta e da un ambiente piatto: tutto cio' che non guardava in su restava nero, e la festa
       si perdeva nel buio. Resta una scena NOTTURNA — non si accende il giorno — ma con le luci che una
       via in festa ha davvero: cielo urbano che rimanda il rosa dei lampioni da sopra e il riflesso
       dell'asfalto da sotto, e due lampioni caldi ai lati del viale che staccano il pullman dal fondo. */
    scene.add(new THREE.AmbientLight(0xffffff,0.78));
    scene.add(new THREE.HemisphereLight(0xffd9b0,0x2a3350,0.55));
    const dl=new THREE.DirectionalLight(0xfff2d0,1.05);dl.position.set(20,40,10);scene.add(dl);
    for(const _lx of [-16,16]){const _pt=new THREE.PointLight(0xffc98a,0.85,60,2);_pt.position.set(_lx,11,6);scene.add(_pt);}
    const homeHex=(club&&club.c)||"#dc2626",awayHex=(club&&club.c2)||"#ffffff";
    const R=(n)=>{let x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x);};
    const PERIOD=96,SPEED=4.6;
    /* la via: asfalto con strisce, marciapiedi */
    const road=new THREE.Mesh(new THREE.PlaneGeometry(24,340),new THREE.MeshLambertMaterial({color:0x23262e}));road.rotation.x=-Math.PI/2;scene.add(road);
    for(const side of [-1,1]){const sw=new THREE.Mesh(new THREE.BoxGeometry(6,0.25,340),new THREE.MeshLambertMaterial({color:0x2e323c}));sw.position.set(side*15,0.12,0);scene.add(sw);}
    /* [7.469.0 collaudo PO «migliora anche la grafica»] LA VIA ERA UN PIANO GRIGIO E BASTA: nessun
       cordolo, nessuna segnaletica, nessuno stacco fra carreggiata e marciapiede — a schermo il corteo
       sfilava dentro un vuoto grigio, e tutto il colore stava nei coriandoli. Tre aggiunte, tutte
       geometria piatta e senza costo per frame (statiche o dentro `worldGrp`, che gia' scorre):
       il CORDOLO che separa marciapiede e strada, la STRISCIA di mezzeria tratteggiata — che e' anche
       cio' che rende LEGGIBILE il movimento, perche' il moto si vede se qualcosa lo misura — e la
       BANDA CHIARA a bordo carreggiata. */
    for(const side of [-1,1]){
      const kerb=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.42,340),new THREE.MeshLambertMaterial({color:0x4a505e}));
      kerb.position.set(side*12.15,0.21,0);scene.add(kerb);
      const edge=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.02,340),new THREE.MeshLambertMaterial({color:0xcdd3dd}));
      edge.position.set(side*11.5,0.03,0);scene.add(edge);}
    /* IL MONDO CHE SCORRE: palazzi, lampioni, bandiere, folla — pattern modulare (periodo 96) */
    const worldGrp=new THREE.Group();scene.add(worldGrp);
    /* [7.469.0] MEZZERIA TRATTEGGIATA dentro `worldGrp`: scorre con la via, quindi e' il riferimento che
       rende visibile la marcia — e senza un riferimento «a marcia indietro» non si vedrebbe nemmeno. */
    {const _dm=new THREE.MeshLambertMaterial({color:0xe8e2c8});
     for(let z=-PERIOD;z<PERIOD*2;z+=8){const d=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.02,3.6),_dm);d.position.set(0,0.03,z);worldGrp.add(d);}}
    for(const side of [-1,1]){for(let rep=-2;rep<=2;rep++){for(let i=0;i<4;i++){
      const h=10+R(i*3+side)*15,w=9+R(i*7+side)*5,z=rep*PERIOD+i*24-36;
      const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,15),new THREE.MeshLambertMaterial({color:0x141824}));
      b.position.set(side*(27+R(i*11+side)*5),h/2,z);worldGrp.add(b);
      const wn=8+((R(i*13+side)*8)|0),wp=new Float32Array(wn*3);
      for(let k=0;k<wn;k++){wp[k*3]=side*(27+R(i*11+side)*5)-side*(w/2+0.06);wp[k*3+1]=1.5+R(k*3+i)*(h-2.5);wp[k*3+2]=z+(R(k*7+i)-0.5)*12;}
      const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.BufferAttribute(wp,3));
      worldGrp.add(new THREE.Points(wg,new THREE.PointsMaterial({color:0xffe9a8,size:0.55,sizeAttenuation:true})));
      /* lampione per blocco */
      const lp=new THREE.Group();
      const palo=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.12,6.4,8),new THREE.MeshLambertMaterial({color:0x3a3f4c}));palo.position.y=3.2;lp.add(palo);
      const luce=new THREE.Mesh(new THREE.SphereGeometry(0.3,10,8),new THREE.MeshLambertMaterial({color:0xffe9a8,emissive:0xd9b45a}));luce.position.y=6.4;lp.add(luce);
      lp.position.set(side*13.6,0,z+8);worldGrp.add(lp);
      /* bandiera del club che sventola */
      const fg=new THREE.Group();
      const fpalo=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,4.6,7),new THREE.MeshLambertMaterial({color:0x4a4f5c}));fpalo.position.y=2.3;fg.add(fpalo);
      const tela=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.1),new THREE.MeshLambertMaterial({color:new THREE.Color(i%2===0?homeHex:awayHex),side:THREE.DoubleSide}));
      tela.position.set(0.98,4.0,0);fg.add(tela);fg._tela=tela;
      fg.position.set(side*11.6,0,z-4);worldGrp.add(fg);}}}
    const flags=[];worldGrp.traverse(o=>{if(o._tela)flags.push(o);});
    /* due ali di FOLLA (geometria lunga 2 periodi, wrap via worldGrp) */
    const crowds=[];
    for(const side of [-1,1]){const n=1100,cp=new Float32Array(n*3),base=new Float32Array(n),col=new Float32Array(n*3);
      const c1=new THREE.Color(homeHex),c2=new THREE.Color(awayHex);
      for(let i=0;i<n;i++){cp[i*3]=side*(9.8+R(i*2+side)*3.4);base[i]=0.8+R(i*5)*0.9;cp[i*3+1]=base[i];cp[i*3+2]=-PERIOD*2+R(i*9+side)*PERIOD*4;
        const c=R(i*4)<0.55?c1:(R(i*6)<0.5?c2:new THREE.Color(0xf1e8d8));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(cp,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
      worldGrp.add(new THREE.Points(g,new THREE.PointsMaterial({vertexColors:true,size:1.05,sizeAttenuation:true})));crowds.push({g,cp,base,n});}
    /* FUMOGENI nei colori del club (4 pennacchi che salgono dalle ali) */
    const smokes=[];
    for(let si=0;si<4;si++){const n=90,sp=new Float32Array(n*3),sv=[];
      const sx=(si%2===0?-1:1)*11.5,sz=-30+si*22;
      for(let i=0;i<n;i++){sp[i*3]=sx+(Math.random()-0.5)*1.2;sp[i*3+1]=Math.random()*7;sp[i*3+2]=sz+(Math.random()-0.5)*1.2;sv.push(0.8+Math.random()*1.4);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(sp,3));
      const m=new THREE.PointsMaterial({color:new THREE.Color(si%2===0?homeHex:awayHex).lerp(new THREE.Color(0xffffff),0.35),size:1.5,transparent:true,opacity:0.5,depthWrite:false});
      const pts=new THREE.Points(g,m);worldGrp.add(pts);smokes.push({g,sp,sv,n,sx,sz});}
    /* IL PULLMAN SCOPERTO (fermo in scena: il mondo gli scorre incontro) */
    const bus=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(6.4,4.6,16),new THREE.MeshLambertMaterial({color:new THREE.Color(homeHex)}));body.position.y=3.1;bus.add(body);
    const band=new THREE.Mesh(new THREE.BoxGeometry(6.45,1.1,16.05),new THREE.MeshLambertMaterial({color:0x1c2230}));band.position.y=3.4;bus.add(band);
    /* [7.429.0 collaudo PO «pullman scoperto che sembra uno scatolo di scarpe»] IL MUSETTO E I DETTAGLI:
       parabrezza inclinato, mascherina e fari a prua, paraurti, MONTANTI sulla fascia finestrini (la
       banda scura da sola leggeva come una riga di vernice), specchietti, minigonna nel secondo colore
       del club, coprimozzi. Tutta geometria lambert low-poly: nessun costo percettibile. */
    try{
      const _glass=new THREE.MeshLambertMaterial({color:0x2a3646,emissive:0x0e1622});
      const _ws=new THREE.Mesh(new THREE.PlaneGeometry(5.6,2.1),_glass);_ws.position.set(0,3.6,8.03);_ws.rotation.x=-0.16;bus.add(_ws);
      const _rw=new THREE.Mesh(new THREE.PlaneGeometry(5.6,1.8),_glass);_rw.position.set(0,3.7,-8.03);_rw.rotation.y=Math.PI;bus.add(_rw);
      const _mask=new THREE.Mesh(new THREE.BoxGeometry(6.0,1.0,0.12),new THREE.MeshLambertMaterial({color:0x1a1f2a}));_mask.position.set(0,1.75,8.02);bus.add(_mask);
      for(const _hx of [-2.2,2.2]){const _hl=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.38,0.1),new THREE.MeshLambertMaterial({color:0xfff4c8,emissive:0xd9c26a}));_hl.position.set(_hx,1.75,8.09);bus.add(_hl);}
      const _bum=new THREE.Mesh(new THREE.BoxGeometry(6.5,0.5,0.3),new THREE.MeshLambertMaterial({color:0x11151d}));_bum.position.set(0,1.1,8.05);bus.add(_bum);
      const _bum2=_bum.clone();_bum2.position.z=-8.05;bus.add(_bum2);
      for(let _pi=0;_pi<5;_pi++){for(const _sx of [-3.24,3.24]){const _pl2=new THREE.Mesh(new THREE.BoxGeometry(0.02,1.14,0.22),new THREE.MeshLambertMaterial({color:new THREE.Color(homeHex)}));_pl2.position.set(_sx,3.4,-6.4+_pi*3.2);bus.add(_pl2);}}
      for(const _sx of [-3.3,3.3]){const _mir=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.5,0.3),new THREE.MeshLambertMaterial({color:0x1a1f2a}));_mir.position.set(_sx,4.3,7.6);bus.add(_mir);}
      const _skirt=new THREE.Mesh(new THREE.BoxGeometry(6.5,0.35,16.1),new THREE.MeshLambertMaterial({color:new THREE.Color(awayHex)}));_skirt.position.y=0.95;bus.add(_skirt);
    }catch(_e429p){}
    /* la scritta CAMPIONI sulla fiancata (CanvasTexture, lato camera) */
    /* [7.453.0 collaudo PO «la scritta non si vede bene»] DUE guasti indipendenti, entrambi aritmetici.
       (a) «CAMPIONI D'EUROPA» a 62px non entra in una tela da 512: veniva TAGLIATA ai due lati. Ora il
       corpo si adatta alla tela invece che sperare che ci stia, su una tela doppia per non impastare.
       (b) Il testo era scritto coi COLORI SOCIALI su fondo bianco: un club che gioca in bianco — il CF
       Madrid — scriveva bianco su bianco, contrasto 1:1, scritta inesistente. Ora il fondo lo decide la
       luminosita' della maglia (chiara ⇒ fondo scuro), con un filetto di contorno nel secondo colore
       perche' la fiancata si legga anche di sbieco e a distanza. */
    try{const cv=document.createElement('canvas');cv.width=1024;cv.height=192;const cx=cv.getContext('2d');
      const _txt453=euroWin?'CAMPIONI D\'EUROPA':'CAMPIONI';
      const _lum453=(h)=>{try{const v=String(h).replace('#','');return (parseInt(v.slice(0,2),16)*0.2126+parseInt(v.slice(2,4),16)*0.7152+parseInt(v.slice(4,6),16)*0.0722)/255;}catch(_e){return 0.5;}};
      const _chiara=_lum453(homeHex)>0.6;
      cx.fillStyle=_chiara?'#12151c':'#ffffff';cx.fillRect(0,0,1024,192);
      /* [7.474.0 collaudo PO «la scritta strasborda»] la scritta stava dentro la TELA (944 di 1024) ma
         riempiva tutta la fiancata: nell'inquadratura laterale ravvicinata, che e' quella dello
         screenshot, il pannello e' piu' largo del quadro e la scritta finisce tagliata. Una livrea vera
         ha margini — il testo occupa il 70% del pannello, non il 92 — e il corpo di partenza scende di
         conseguenza. */
      let _fs453=96;cx.font='bold '+_fs453+'px sans-serif';
      while(cx.measureText(_txt453).width>716&&_fs453>34){_fs453-=4;cx.font='bold '+_fs453+'px sans-serif';}/* il corpo si adatta: la scritta resta dentro il pannello, coi suoi margini */
      cx.textAlign='center';cx.textBaseline='middle';
      cx.lineJoin='round';cx.lineWidth=Math.max(4,_fs453*0.09);cx.strokeStyle=_chiara?'#ffffff':(awayHex||'#ffffff');cx.strokeText(_txt453,512,100);
      cx.fillStyle=homeHex;cx.fillText(_txt453,512,100);
      const tx=new THREE.CanvasTexture(cv);
      const strip=new THREE.Mesh(new THREE.PlaneGeometry(13,1.6),new THREE.MeshBasicMaterial({map:tx}));
      strip.position.set(3.24,2.0,0);strip.rotation.y=Math.PI/2;bus.add(strip);}catch(_e){}
    const wheels=[];
    for(const [wx,wz] of [[-2.9,-5.6],[2.9,-5.6],[-2.9,5.6],[2.9,5.6]]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,0.8,18),new THREE.MeshLambertMaterial({color:0x0c0e14}));wh.rotation.z=Math.PI/2;wh.position.set(wx,1.05,wz);bus.add(wh);wheels.push(wh);
      const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.84,14),new THREE.MeshLambertMaterial({color:0x9aa2ae}));wh.add(hub);}/* [7.429.0] coprimozzo (gira col cerchione) */
    for(const rz of [-7.9,7.9]){const rail=new THREE.Mesh(new THREE.BoxGeometry(6.4,0.5,0.18),new THREE.MeshLambertMaterial({color:0xe8e8e8}));rail.position.set(0,5.6,rz);bus.add(rail);}
    for(const rx of [-3.1,3.1]){const rail=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.5,16),new THREE.MeshLambertMaterial({color:0xe8e8e8}));rail.position.set(rx,5.6,0);bus.add(rail);}
    scene.add(bus);
    /* [7.429.0 collaudo PO «sul pullman c'e' un trofeo che gira ma non e' lo scudetto vinto»] IL TROFEO
       A PRUA E' QUELLO DELLA COMPETIZIONE: prima girava sempre la coppetta generica. Scudetto = il
       PIATTO d'oro con bordo e fregio (lo stesso vocabolario della cerimonia 7.425), leggermente
       inclinato verso la camera perche' il disco si legga; Champions = la coppa GRANDE dalle orecchie
       larghe. Scala raddoppiata: da lontano la coppetta era un puntino giallo. */
    /* [7.453.0 collaudo PO «la coppa è disegnata male ed è enorme»] Nel 7.429 la scala fu RADDOPPIATA
       perche' da lontano il trofeo era un puntino giallo: la cura e' diventata il sintomo — accanto a
       uomini alti 1,84 il gruppo arrivava a ~1,4 unita', cioe' tre quarti di una persona, mentre un
       trofeo vero sta sotto il mezzo busto. Ora la proporzione e' quella giusta (_TSC453) e la
       leggibilita' a distanza la da' la LUCE, non la mole: oro piu' acceso e una lampada calda
       agganciata al trofeo, che a prua del pullman lo fa brillare invece di ingigantirlo. */
    const _TSC453=0.62;
    const gold=new THREE.MeshLambertMaterial({color:0xffdf6b,emissive:0xb98a14});
    const cup=new THREE.Group();
    const cped=new THREE.Mesh(new THREE.BoxGeometry(1.15,0.4,1.15),new THREE.MeshLambertMaterial({color:0x2a2f3a}));cup.add(cped);
    const _spin429=new THREE.Group();_spin429.position.y=0.2;cup.add(_spin429);cup._spin429=_spin429;
    if(euroWin){
      const cb=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.4,0.75,14),gold);cb.position.y=0.6;_spin429.add(cb);
      const cs=new THREE.Mesh(new THREE.SphereGeometry(0.38,14,10),gold);cs.position.y=1.2;_spin429.add(cs);
      /* [7.474.0] la coppa della parata e' quella dello screenshot del PO: gli attacchi stavano a 0,62 mentre la sfera, a quelle quote, e' larga 0,15-0,29 — fino a 0,47u di aria fra manico e coppa. Con centro a 0,277 e raggio 0,26 sul piano della sfera (y=1,20) gli estremi dell'arco cadono ESATTAMENTE sulla superficie: sqrt(0,38^2 - 0,26^2) = 0,277. */
      for(const hx of [-0.277,0.277]){const hd=new THREE.Mesh(new THREE.TorusGeometry(0.26,0.055,10,16,Math.PI),gold);hd.position.set(hx,1.20,0);hd.rotation.z=hx<0?Math.PI/2:-Math.PI/2;_spin429.add(hd);}
    } else {
      const pl=new THREE.Mesh(new THREE.CylinderGeometry(0.72,0.72,0.09,26),gold);pl.rotation.x=Math.PI/2+0.4;pl.position.y=0.95;_spin429.add(pl);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(0.72,0.06,10,28),gold);rim.rotation.x=0.4;rim.position.y=0.95;_spin429.add(rim);
      const hub=new THREE.Mesh(new THREE.SphereGeometry(0.2,12,9),gold);hub.position.set(0,0.98,0.1);_spin429.add(hub);
    }
    _spin429.scale.setScalar(_TSC453);/* [7.453.0] proporzione umana: il trofeo torna sotto il mezzo busto */
    try{const _gl453=new THREE.PointLight(0xffd88a,1.15,14,2);_gl453.position.set(0,1.1,0.5);cup.add(_gl453);}catch(_e){}
    /* la SQUADRA sul tetto */
    const men=[];const mixers=[];const NM=8;/* [7.429.0] otto uomini: sei lasciavano il tetto mezzo vuoto */
    const slots=[];for(let i=0;i<NM;i++){slots.push({x:(i%2===0?-1.7:1.7),z:6.0-i*1.9});}
    const mkFallback=(i)=>{const g=new THREE.Group();
      const torso=new THREE.Mesh(new THREE.BoxGeometry(0.85,1.15,0.5),new THREE.MeshLambertMaterial({color:new THREE.Color(homeHex)}));torso.position.y=1.35;g.add(torso);
      const _skins429=[0xf0c8a0,0xe8b890,0xc8956a,0xa9743f,0x7c4a1e,0xf5d2b3];/* [7.429.0] spettro carnagioni (come AVATARS): mai un plotone identico */
      const head=new THREE.Mesh(new THREE.SphereGeometry(0.3,10,8),new THREE.MeshLambertMaterial({color:_skins429[i%_skins429.length]}));head.position.y=2.25;g.add(head);
      const aR=new THREE.Mesh(new THREE.BoxGeometry(0.22,1.0,0.22),new THREE.MeshLambertMaterial({color:new THREE.Color(homeHex)}));aR.position.set(0.6,1.95,0);aR.geometry.translate(0,-0.5,0);g.add(aR);g._waveArm=aR;
      const legs=new THREE.Mesh(new THREE.BoxGeometry(0.8,1.0,0.45),new THREE.MeshLambertMaterial({color:0x22262e}));legs.position.y=0.5;g.add(legs);
      return g;};
    const placeMen=(mk)=>{for(let i=0;i<NM;i++){const m=mk(i);m.position.set(slots[i].x,5.35,slots[i].z);m.rotation.y=(slots[i].x<0?-1:1)*Math.PI/2;bus.add(m);men.push(m);}
      cup.position.set(0,5.75,7.0);bus.add(cup);};
    if(window.__CPM_GLB!==false&&typeof loadGLB==="function"&&THREE.SkeletonUtils&&THREE.SkeletonUtils.clone){
      Promise.all([loadGLB('./assets/footballer.glb'),loadGLB('./assets/anim-idle.glb').catch(()=>null)]).then(([glb,idle])=>{
        if(!glb||!glb.scene){placeMen(mkFallback);return;}
        try{if(typeof window!=="undefined"&&window.__CPM_PARATA)window.__CPM_PARATA.glb=true;}catch(_e){}
        for(let i=0;i<NM;i++){
          const root=THREE.SkeletonUtils.clone(glb.scene);
          /* [7.429.0 collaudo PO «i calciatori sono tutti di colore, non sono i reali giocatori della
             squadra»] la parata clonava il GLB nudo: stessa pelle per tutti, niente capelli ricolorati,
             maglia in tinta unita. Ora si RIUSA la ricetta della Serata di Presentazione (7.30):
             appearanceFromSeed per carnagione/capelli/calvizie/altezza per uomo (seed club+indice, come
             il roster), kitPatternTex per la maglia vera del club — la squadra sul pullman e' la squadra. */
          const ap=(typeof appearanceFromSeed==="function")?appearanceFromSeed(hashStr(String((club&&club.id)||"x")+"|pres|"+i)):{height:1.82,girth:1};
          root.traverse(o=>{if(!o.isMesh||!o.material)return;o.frustumCulled=false;const n=(o.name||"").toLowerCase();
            if(n.indexOf('joint')>=0){o.visible=false;return;}
            const set=(c)=>{const col=new THREE.Color(c);o.material=new THREE.MeshLambertMaterial({color:col,emissive:col.clone().multiplyScalar(0.14),skinning:true});};
            if(n.indexOf('shirt')>=0){let t=null;
              try{if(typeof kitPatternTex==="function")t=kitPatternTex(homeHex,awayHex,(club&&club.kitPattern)||'solid');}catch(_e){}
              if(t)o.material=new THREE.MeshLambertMaterial({map:t,emissive:new THREE.Color(homeHex).multiplyScalar(0.12),skinning:true});
              else set(homeHex);}
            else if(n.indexOf('shorts')>=0)set(awayHex);else if(n.indexOf('socks')>=0)set(homeHex);else if(n.indexOf('shoes')>=0)set(0x222222);
            else if(n.indexOf('hair')>=0){if(ap.bald)o.visible=false;else o.material=new THREE.MeshLambertMaterial({color:new THREE.Color(ap.hair||'#2d1800'),skinning:true});}
            else if(n.indexOf('body')>=0&&o.material.map){o.material=o.material.clone();const sk=new THREE.Color(ap.skin||0xffffff);o.material.color=sk;if('emissive'in o.material)o.material.emissive=sk.clone().multiplyScalar(0.24);}});
          const bb=new THREE.Box3().setFromObject(root),hh=Math.max(0.001,bb.max.y-bb.min.y);const sc=(ap.height||1.84)/hh;root.scale.set(sc*(ap.girth||1),sc,sc*(ap.girth||1));
          root.position.set(slots[i].x,5.35,slots[i].z);root.rotation.y=(slots[i].x<0?-1:1)*Math.PI/2;
          bus.add(root);men.push(root);
          if(idle&&idle.animations&&idle.animations[0]){const mx=new THREE.AnimationMixer(root);const a=mx.clipAction(idle.animations[0]);a.play();mx.setTime(R(70+i)*2.4);a.paused=true;mixers.push(mx);}
          {let _wa=null,_wf=null;root.traverse(o=>{if(!o.isBone)return;const n=o.name||"";if(!_wa&&/RightArm$/i.test(n))_wa=o;if(!_wf&&/RightForeArm$/i.test(n))_wf=o;});root._wv={aR:_wa,fR:_wf};}
        }
        cup.position.set(0,5.75,7.0);bus.add(cup);
      }).catch(()=>{placeMen(mkFallback);});
    } else placeMen(mkFallback);
    /* coriandoli: colori del club, ORO se Champions */
    const CN=560,cpv=new Float32Array(CN*3),cvv=[];
    for(let i=0;i<CN;i++){cpv[i*3]=(Math.random()-0.5)*44;cpv[i*3+1]=6+Math.random()*22;cpv[i*3+2]=(Math.random()-0.5)*90;cvv.push([(Math.random()-0.5)*1.5,-1.2-Math.random()*2,(Math.random()-0.5)*1.5]);}
    /* ⚠️ TRE GEOMETRIE, NON TRE MATERIALI SULLA STESSA. La prima stesura montava tre `Points` sopra la
       STESSA geometria: ogni coriandolo veniva disegnato tre volte, concentrico, e a schermo diventava un
       BERSAGLIO a cerchi invece che un coriandolo — visibile nei provini, ed e' il motivo per cui questa
       verifica si fa GUARDANDO. Le particelle vanno DIVISE: tre geometrie che sono viste (`subarray`) sullo
       stesso buffer gia' animato, quindi nessuna copia e nessun costo per frame. */
    const _cgS=[0,Math.floor(CN/3),Math.floor(CN*2/3),CN];
    const cgs=[];for(let _k=0;_k<3;_k++){const _g=new THREE.BufferGeometry();
      _g.setAttribute('position',new THREE.BufferAttribute(cpv.subarray(_cgS[_k]*3,_cgS[_k+1]*3),3));cgs.push(_g);}
    const cg=cgs[0];
    /* [7.469.0 collaudo PO «migliora anche la grafica»] I CORIANDOLI ERANO TUTTI DELLO STESSO COLORE E
       TROPPO GRANDI. Due difetti in uno: (a) `PointsMaterial` ha `sizeAttenuation`, quindi un coriandolo
       che passa vicino alla lente diventa un quadrone che copre mezzo pullman — si vede nel provino, un
       riquadro giallo grande quanto una ruota; (b) il colore era UNO solo, quindi la festa era una nevicata
       monocroma. Ora la taglia scende (0.5→0.3) e la pioggia e' divisa in TRE sistemi che condividono le
       stesse posizioni ma hanno colore e taglia diversi — i due colori del club piu' il bianco — cosi' la
       via ha la tavolozza della squadra invece di una tinta piatta. Sempre `Points`: nessun costo nuovo
       per frame, e le posizioni restano quelle gia' animate. */
    const _cfCols=euroWin?[0xffd34d,0xffffff,0x8ec5ff]:[new THREE.Color(homeHex),new THREE.Color(awayHex),0xffffff];
    for(let _ci=0;_ci<3;_ci++){
      const cm=new THREE.PointsMaterial({color:_cfCols[_ci],size:0.34-_ci*0.07,transparent:true,opacity:0.95,depthWrite:false});
      const _pts=new THREE.Points(cgs[_ci],cm);_pts.renderOrder=2;scene.add(_pts);}
    try{if(typeof window!=="undefined")window.__CPM_PARATA={men:NM,glb:false,euro:!!euroWin,v:2};}catch(_e){}
    /* REGIA: tre inquadrature che si alternano con blend morbido */
    const SHOTS=[
      {p:[8.5,9.6,24],a:[0,4.3,-8]},      /* tre-quarti frontale «da telegiornale» */
      /* [7.474.0 collaudo PO «la scritta strasborda»] LA SCRITTA NON USCIVA DALLA TELA: NON CI STAVA IL
         PULLMAN. Su un quadro verticale 412x820 con fov 46 il campo ORIZZONTALE e' ~24 gradi: da 20,6
         unita' si vedono 8,8 unita' di larghezza, mentre la fiancata ne misura 16 — meno di meta'. Il
         taglio che il PO ha fotografato e' questo, e nessun ritocco al corpo del testo poteva chiuderlo.
         Portata la stessa inquadratura a ~28 unita' lungo la STESSA direzione (nessun cambio di regia,
         solo distanza): il campo diventa 11,9 unita' e il pannello della livrea, che ne occupa 9,1, ci
         sta coi suoi margini. */
      {p:[20.6,5.3,17.7],a:[-1.2,5.8,0]},   /* laterale dalla folla: il pullman passa, la squadra saluta sopra la spalla della gente */
      {p:[-6,13.5,-24],a:[0,4.8,10]},     /* alta da dietro: la via si apre davanti al corteo */
    ];
    const SHOT_T=7.5,BLEND=1.6;
    let raf=0,alive=true,t0=performance.now(),tPrev=t0;
    const cpos=new THREE.Vector3(...SHOTS[0].p),caim=new THREE.Vector3(...SHOTS[0].a);
    const tick=()=>{if(!alive)return;raf=requestAnimationFrame(tick);
      const now=performance.now(),el2=(now-t0)/1000,dt=Math.min(0.06,(now-tPrev)/1000);tPrev=now;
      if(mixers.length)mixers.forEach(m=>m.update(dt));
      /* il mondo scorre incontro al bus, wrap invisibile sul periodo */
      /* [7.469.0 collaudo PO «il pullman cammina a marcia indietro»] IL MONDO SCORREVA DALLA PARTE
         SBAGLIATA. Il pullman e' costruito con la FACCIA a +z (parabrezza, fari e paraurti a z=+8) e la
         regia lo conferma: lo shot frontale sta a z=+24 («tre-quarti da telegiornale») e quello alto sta a
         z=-24 («da dietro: la via si apre davanti al corteo»). Quindi il corteo avanza verso +z. Ma
         `worldGrp.position.z` CRESCEVA, cioe' la via scorreva verso +z insieme al pullman: nel sistema
         del mondo il pullman andava verso -z — di muso avanti e di marcia indietro, esattamente cio' che
         il PO ha visto. Ora la via scorre verso -z (stesso periodo, stesso ciclo, nessun salto) e il
         pullman avanza dove guarda. */
      worldGrp.position.z=PERIOD-((el2*SPEED)%PERIOD);
      /* bus: sospensioni che respirano + ruote che girano */
      bus.position.y=Math.sin(el2*1.7)*0.06;bus.rotation.z=Math.sin(el2*1.1)*0.008;
      wheels.forEach(w=>{w.rotation.x+=SPEED*dt/1.05;});/* [7.469.0] con l'asse ruota su x, avanzare verso +z vuol dire rotazione CRESCENTE: col segno vecchio le ruote giravano al contrario del moto — coerenti con la marcia indietro, non col rotolamento */
      men.forEach((m,i)=>{const ph=Math.sin(el2*1.4+i*1.05);
        /* [7.424.0 collaudo PO «braccio bionico»] posa ASSOLUTA base+offset (vedi Serata): con la
           clip in pausa l'offset additivo si accumulava e il braccio girava come un'elica */
        if(m._wv){const s=0.55+0.45*ph;const _aB=m._wv.aR,_fB=m._wv.fR;
          if(_aB){if(!_aB._base419)_aB._base419={x:_aB.rotation.x,y:_aB.rotation.y,z:_aB.rotation.z};const _k430=Math.max(0,s);_aB.rotation.set(_aB._base419.x*(1-_k430)+(-1.9)*_k430,_aB._base419.y,_aB._base419.z*(1-_k430)+(-0.3)*_k430);}/* [7.430.0] stesso sweep della Serata: si alza su X, non su Z */
          if(_fB){if(!_fB._base419)_fB._base419={x:_fB.rotation.x,y:_fB.rotation.y,z:_fB.rotation.z};_fB.rotation.set(_fB._base419.x+Math.sin(el2*5+i)*0.3*Math.max(0,s),_fB._base419.y,_fB._base419.z);}}
        else if(m._waveArm){m._waveArm.rotation.x=-2.4-0.35*ph;}});
      if(cup._spin429)cup._spin429.rotation.y+=dt*1.1;else cup.rotation.y+=dt*1.4;/* [7.429.0] gira il trofeo, non il piedistallo */
      flags.forEach((f,i)=>{f._tela.rotation.y=Math.sin(el2*2.2+i)*0.45;});
      crowds.forEach(cr=>{for(let i=0;i<cr.n;i+=3){cr.cp[i*3+1]=cr.base[i]+Math.abs(Math.sin(el2*3+i))*0.5;}cr.g.attributes.position.needsUpdate=true;});
      smokes.forEach((sm,si)=>{for(let i=0;i<sm.n;i++){sm.sp[i*3+1]+=sm.sv[i]*dt;sm.sp[i*3]+=Math.sin(el2+i)*0.15*dt;
        if(sm.sp[i*3+1]>9+ (si%3)){sm.sp[i*3+1]=0.3;sm.sp[i*3]=sm.sx+(Math.random()-0.5)*1.2;sm.sp[i*3+2]=sm.sz+(Math.random()-0.5)*1.2;}}
        sm.g.attributes.position.needsUpdate=true;});
      for(let i=0;i<CN;i++){cpv[i*3]+=cvv[i][0]*dt;cpv[i*3+1]+=cvv[i][1]*dt;cpv[i*3+2]+=cvv[i][2]*dt;if(cpv[i*3+1]<0.2){cpv[i*3+1]=16+Math.random()*10;cpv[i*3]=(Math.random()-0.5)*44;cpv[i*3+2]=(Math.random()-0.5)*70;}}
      for(const _g of cgs)_g.attributes.position.needsUpdate=true;
      /* la regia: quale inquadratura tocca, e con che peso di transizione */
      const si=Math.floor(el2/SHOT_T)%SHOTS.length,ni=(si+1)%SHOTS.length;
      const ph2=(el2%SHOT_T),w2=ph2>SHOT_T-BLEND?( (ph2-(SHOT_T-BLEND))/BLEND ):0;
      const A=SHOTS[si],B=SHOTS[ni],ww=w2*w2*(3-2*w2);
      cpos.set(A.p[0]+(B.p[0]-A.p[0])*ww+Math.sin(el2*0.35)*1.4,A.p[1]+(B.p[1]-A.p[1])*ww+Math.sin(el2*0.5)*0.5,A.p[2]+(B.p[2]-A.p[2])*ww);
      caim.set(A.a[0]+(B.a[0]-A.a[0])*ww,A.a[1]+(B.a[1]-A.a[1])*ww,A.a[2]+(B.a[2]-A.a[2])*ww);
      cam.position.copy(cpos);cam.lookAt(caim);
      renderer.render(scene,cam);};
    tick();
    const onR=()=>{try{cam.aspect=W()/H();cam.updateProjectionMatrix();renderer.setSize(W(),H());}catch(_e){}};
    window.addEventListener('resize',onR);
    return()=>{alive=false;cancelAnimationFrame(raf);window.removeEventListener('resize',onR);
      try{scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const m=Array.isArray(o.material)?o.material:[o.material];m.forEach(x=>{if(x.map)x.map.dispose();x.dispose&&x.dispose();});}});}catch(_e){}
      try{renderer.dispose();}catch(_e){}
      try{if(renderer.domElement&&renderer.domElement.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);}catch(_e){}};
  },[]);
  return <div ref={ref} style={{position:"absolute",inset:0,overflow:"hidden",background:"#070a16"}}/>;
}
function GalaStage3D({beat,heroWins,avatarId=0,seed=7,act=0}){
  const ref=React.useRef(null);const st=React.useRef({beat:0,heroWins:false,act:0});
  st.current.beat=beat;st.current.heroWins=!!heroWins;st.current.act=act|0;/* [7.144.0] atto corrente → alternanza presentatori */
  React.useEffect(()=>{
    const host=ref.current;if(!host)return;
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(_e){return;}
    const W=()=>host.clientWidth||360,H=()=>host.clientHeight||640;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setSize(W(),H());renderer.setClearColor(0x07060c,1);
    try{renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;}catch(_e){}
    host.appendChild(renderer.domElement);renderer.domElement.style.cssText="position:absolute;inset:0;width:100%;height:100%;";
    const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x07060c,10,26);
    const cam=new THREE.PerspectiveCamera(46,W()/H(),0.1,60);cam.position.set(0,2.2,8.6);
    // ── varietà SEEDATA: genere/outfit del presentatore, tema luci, taglio di camera ──
    const _s=(seed>>>0)||7;const R=n=>(((Math.imul((_s+Math.imul(n,2654435761))>>>0,1664525)+1013904223)>>>0)/4294967296);
    const female=R(1)<0.5;
    const OUT=female?[0x2a1420,0x1a2236,0x141821][Math.floor(R(2)*3)]:[0x14161c,0x181d2c][Math.floor(R(2)*2)];/* tailleur bordeaux/navy/nero · smoking nero/blu notte */
    const pSkin=(typeof SKIN_TONES!=='undefined'&&SKIN_TONES[Math.floor(R(3)*SKIN_TONES.length)])||'#d9a77f';
    const pHair=female?['#171008','#3a2410','#6b4a1e','#8a6530'][Math.floor(R(4)*4)]:['#171008','#3a2410','#4d5157'][Math.floor(R(4)*3)];
    const pH=female?1.66+R(5)*0.08:1.74+R(5)*0.08;
    const warmTheme=R(6)<0.7;/* oro caldo vs platino freddo */
    const camVX=(R(7)-0.5)*0.5;
    const _cue=(c)=>{try{if(typeof cpmEmit==="function")cpmEmit("GalaCue",{cue:c});}catch(_e){}};/* predisposizione audio layer */
    // ── luci da gala (key/fill/rim + spot trofeo) ──
    scene.add(new THREE.AmbientLight(0x8090b0,0.4));
    const key=new THREE.PointLight(warmTheme?0xffd9a0:0xdfe8ff,1.25,32);key.position.set(-2.5,6,5);scene.add(key);
    const fill=new THREE.PointLight(0x9fb2d8,0.45,24);fill.position.set(3,3.4,4);scene.add(fill);
    const rim=new THREE.PointLight(0xcfe0ff,0.8,22);rim.position.set(0,5.5,-4.5);scene.add(rim);
    const tSpot=new THREE.PointLight(warmTheme?0xffd24a:0xe8f0ff,1.0,7);tSpot.position.set(0,3.2,-0.6);scene.add(tSpot);
    // ── palco: pedana + tappeto + anello + fondale a pannelli + colonne luminose + LED laterali ──
    const floor=new THREE.Mesh(new THREE.CylinderGeometry(6.8,6.8,0.22,48),new THREE.MeshStandardMaterial({color:0x14161f,roughness:0.32,metalness:0.5}));floor.position.y=-0.11;scene.add(floor);
    {const cc=document.createElement('canvas');cc.width=128;cc.height=128;const cx2=cc.getContext('2d');cx2.fillStyle='#3a0f1c';cx2.fillRect(0,0,128,128);let ns=_s;for(let i=0;i<420;i++){ns=(ns*1664525+1013904223)>>>0;const xx=ns%128;ns=(ns*1664525+1013904223)>>>0;const yy=ns%128;cx2.fillStyle='rgba(0,0,0,0.18)';cx2.fillRect(xx,yy,2,2);}
      const ct=new THREE.CanvasTexture(cc);ct.wrapS=ct.wrapT=THREE.RepeatWrapping;ct.repeat.set(3,3);
      const carpet=new THREE.Mesh(new THREE.CircleGeometry(4.6,40),new THREE.MeshStandardMaterial({map:ct,roughness:0.95}));carpet.rotation.x=-Math.PI/2;carpet.position.y=0.005;scene.add(carpet);}
    const ring=new THREE.Mesh(new THREE.TorusGeometry(4.62,0.04,10,72),new THREE.MeshBasicMaterial({color:warmTheme?0xd4a017:0xbcd2ff}));ring.rotation.x=Math.PI/2;ring.position.y=0.03;scene.add(ring);
    const back=new THREE.Mesh(new THREE.PlaneGeometry(34,15),new THREE.MeshBasicMaterial({color:0x0a0d16}));back.position.set(0,6,-8);scene.add(back);
    for(let i=0;i<5;i++){const pn=new THREE.Mesh(new THREE.PlaneGeometry(3.3,9),new THREE.MeshStandardMaterial({color:0x111524,roughness:0.4,metalness:0.4}));pn.position.set(-6.6+i*3.3,4.6,-7.4+((i%2)?0.5:0));scene.add(pn);}
    {const g=new THREE.BufferGeometry();const n=90;const arr=new Float32Array(n*3);for(let i=0;i<n;i++){arr[i*3]=((i*97)%320)/10-16;arr[i*3+1]=1.5+((i*61)%120)/10;arr[i*3+2]=-7.3;}g.setAttribute('position',new THREE.BufferAttribute(arr,3));scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:warmTheme?0xd4a017:0xbcd2ff,size:0.05,transparent:true,opacity:0.7})));}
    const colMs=[];[[-5.2],[-3.2],[3.2],[5.2]].forEach((cx3,i)=>{const cm=new THREE.MeshStandardMaterial({color:0x141828,roughness:0.35,metalness:0.3,emissive:warmTheme?0xd4a017:0x9fc5ff,emissiveIntensity:0.28});
      const c=new THREE.Mesh(new THREE.BoxGeometry(0.28,7.2,0.28),cm);c.position.set(cx3[0],3.6,-6.4);scene.add(c);colMs.push(cm);});
    // LED laterali «GALA»
    {const lc=document.createElement('canvas');lc.width=512;lc.height=96;const lx=lc.getContext('2d');lx.fillStyle='#0c0f1a';lx.fillRect(0,0,512,96);lx.fillStyle=warmTheme?'#d4a017':'#bcd2ff';lx.font='900 52px Arial';lx.textAlign='center';lx.textBaseline='middle';lx.fillText('★ GALA ★',256,48);
      const lt=new THREE.CanvasTexture(lc);[[-6.2,0.9],[6.2,-0.9]].forEach(pp=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(4.2,0.8),new THREE.MeshBasicMaterial({map:lt}));m.position.set(pp[0],2.6,-5.6);m.rotation.y=pp[1]*0.5;scene.add(m);});}
    // coni spot dinamici
    const cones=[];[[-2.6,0x9fc5ff],[0,0xffe2ad],[2.6,0x9fc5ff]].forEach((cd,i)=>{
      const cone=new THREE.Mesh(new THREE.ConeGeometry(1.15,7.5,20,1,true),new THREE.MeshBasicMaterial({color:cd[1],transparent:true,opacity:0.10,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));
      cone.position.set(cd[0],3.75,-1.2);scene.add(cone);cones.push(cone);});
    // ── podio + TROFEO PBR sotto spot ──
    const podMat=new THREE.MeshStandardMaterial({color:0x232838,roughness:0.35,metalness:0.4});
    const p1=new THREE.Mesh(new THREE.BoxGeometry(2.6,0.35,1.7),podMat);p1.position.set(0,0.175,-1.2);scene.add(p1);
    const p2=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.35,1.3),podMat);p2.position.set(0,0.52,-1.2);scene.add(p2);
    const col=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.2,0.9,14),new THREE.MeshStandardMaterial({color:0x2e3448,roughness:0.28,metalness:0.55}));col.position.set(0,1.15,-1.2);scene.add(col);
    const gold=new THREE.MeshStandardMaterial({color:0xe8b428,emissive:0x6a4d0a,emissiveIntensity:0.35,roughness:0.16,metalness:1.0});
    const trophy=new THREE.Group();
    const tb=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.2,0.09,14),gold);trophy.add(tb);
    const tq=new THREE.Mesh(new THREE.BoxGeometry(0.30,0.05,0.30),new THREE.MeshStandardMaterial({color:0x1a1d29,roughness:0.3,metalness:0.5}));tq.position.y=-0.06;trophy.add(tq);
    const ts=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.07,0.3,10),gold);ts.position.y=0.19;trophy.add(ts);
    const tc=new THREE.Mesh(new THREE.SphereGeometry(0.19,16,12,0,Math.PI*2,0,Math.PI*0.62),gold);tc.scale.y=1.25;tc.position.y=0.46;trophy.add(tc);
    [[-1],[1]].forEach(sx=>{const h=new THREE.Mesh(new THREE.TorusGeometry(0.1,0.022,8,18,Math.PI*1.25),gold);h.position.set(sx[0]*0.2,0.5,0);h.rotation.z=sx[0]*-0.5;trophy.add(h);});
    trophy.position.set(0,1.62,-1.2);scene.add(trophy);
    // ── PUBBLICO in silhouette (3 file oltre il bordo palco) + fotografi con flash ──
    const crowd=[];{const cm=new THREE.MeshStandardMaterial({color:0x10121c,roughness:0.95});
      for(let r2=0;r2<3;r2++)for(let i2=0;i2<9;i2++){const g=new THREE.Group();
        const b=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.22,0.8,7),cm);b.position.y=0.4;g.add(b);
        const h=new THREE.Mesh(new THREE.SphereGeometry(0.115,8,7),cm);h.position.y=0.95;g.add(h);
        g.position.set(-5.8+i2*1.45+((r2%2)?0.5:0),0,4.7+r2*0.95);g._ph=(i2*37+r2*53)%97;scene.add(g);crowd.push(g);}}
    const flashes=[];for(let i=0;i<7;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffffff,transparent:true,opacity:0}));
      sp.position.set(-4.6+i*1.5,1.35+((i*37)%3)*0.35,4.5+((i*53)%2)*0.8);sp.scale.setScalar(0.38);scene.add(sp);flashes.push({sp,t:-1});}
    const flashLight=new THREE.PointLight(0xffffff,0,12);flashLight.position.set(0,2.6,3.4);scene.add(flashLight);
    // ── fallback PROCEDURALE elegante (mai scena vuota, mai tenuta sportiva) ──
    const fig=new THREE.Group();
    {const suit=new THREE.MeshStandardMaterial({color:OUT,roughness:0.55});
     const shirtM=new THREE.MeshStandardMaterial({color:0xf0eee6,roughness:0.7});
     const skinM=new THREE.MeshStandardMaterial({color:new THREE.Color(pSkin),roughness:0.78});
     const legs=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.18,0.84,10),suit);legs.position.y=0.42;fig.add(legs);
     const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.16,0.62,10),suit);torso.position.y=1.1;fig.add(torso);
     const chest=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.32,0.05),shirtM);chest.position.set(0,1.18,0.15);fig.add(chest);
     const bow=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.035,0.03),new THREE.MeshStandardMaterial({color:0x0d0d10,roughness:0.5}));bow.position.set(0,1.33,0.16);fig.add(bow);
     const head=new THREE.Mesh(new THREE.SphereGeometry(0.148,14,12),skinM);head.position.y=1.6;fig.add(head);
     const hair=new THREE.Mesh(new THREE.SphereGeometry(0.15,14,10,0,Math.PI*2,0,Math.PI*0.5),new THREE.MeshStandardMaterial({color:new THREE.Color(pHair),roughness:0.55,metalness:0.08}));hair.position.y=1.63;fig.add(hair);
     const aM=suit;[[-1],[1]].forEach(sx=>{const a=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.045,0.52,8),aM);a.position.set(sx[0]*0.235,1.12,0);a.rotation.z=sx[0]*0.18;fig.add(a);});
     fig.position.set(1.62,0,-0.62);fig.rotation.y=-0.5;/* [7.85.0 collaudo PO opzione 2] figura procedurale NON aggiunta: cerimonia SENZA persone
       [7.328.0 collaudo PO «le gambe dei cerimonieri sono all'interno del palco»] x 1.05→1.72: il podio p1 è un
       box 2.6×1.7 centrato in (0,-1.2) → footprint x∈[-1.3,1.3], z∈[-2.05,-0.35], alto 0.35 — i presentatori a
       x=±1.05/-1.15 stavano DENTRO quel footprint e le gambe compenetravano la pedana fino allo stinco. Ora i
       lati del podio sono davvero AI LATI (|x|=1.62 = bordo 1.3 + ~0.32 di margine corpo/abito; il wide beat-0 arretra a z 9.3 per tenerli in frame). */}
    // ── coriandoli ──
    const confSys=[];[[0xd4a017,60],[0xffffff,40],[0xa3263a,40]].forEach(cd=>{
      const g=new THREE.BufferGeometry();const n=cd[1];const arr=new Float32Array(n*3);const vel=new Float32Array(n);
      for(let i=0;i<n;i++){arr[i*3]=((i*73)%140)/20-3.5;arr[i*3+1]=4+((i*37)%80)/20;arr[i*3+2]=-2.5+((i*53)%60)/20;vel[i]=0.35+((i*29)%40)/55;}
      g.setAttribute('position',new THREE.BufferAttribute(arr,3));
      const m=new THREE.PointsMaterial({color:cd[0],size:0.075,transparent:true,opacity:0});
      const pts=new THREE.Points(g,m);pts._vel=vel;scene.add(pts);confSys.push(pts);});
    // ── BUSTA 3D (in mano al presentatore quando il CH38 aggancia; sennò al petto del fallback) ──
    const env=new THREE.Group();
    const envM=new THREE.MeshStandardMaterial({color:0xf4f1e8,roughness:0.6});
    const envBody=new THREE.Mesh(new THREE.BoxGeometry(0.20,0.13,0.012),envM);env.add(envBody);
    const envFlap=new THREE.Mesh(new THREE.PlaneGeometry(0.20,0.085),new THREE.MeshStandardMaterial({color:0xe9e5d8,roughness:0.6,side:THREE.DoubleSide}));
    envFlap.position.set(0,0.065,0.008);envFlap.geometry.translate(0,-0.0425,0);env.add(envFlap);
    const envCard=new THREE.Mesh(new THREE.PlaneGeometry(0.165,0.105),new THREE.MeshStandardMaterial({color:warmTheme?0xd4a017:0xbcd2ff,emissive:warmTheme?0x8a6a10:0x5a70a0,emissiveIntensity:0.4,side:THREE.DoubleSide}));
    envCard.position.set(0,0.01,-0.012);env.add(envCard);
    env.position.set(0.78,1.28,-0.72);env.rotation.y=-0.5;scene.add(env);env.visible=false;/* [7.85.0 opzione 2] busta nascosta: era pensata in mano al presentatore → senza persone floaterebbe orfana; la cerimonia resta trofeo + podio + faretti + coriandoli + pubblico in silhouette */
    // ── avatar CH38: PRESENTATORE elegante + (al reveal) VINCITORE = avatar carriera ──
    const _glbRootsG=[];const _mixersG=[];let presM=null,presF=null,heroAv=null,_heroLift=null,_heroLiftOn=false;
    const _gv=new THREE.Vector3(),_gv2=new THREE.Vector3();
    const _gq=new THREE.Quaternion(),_gq2=new THREE.Quaternion(),_ge=new THREE.Euler();/* [7.143.0] busta bone-parented */
    let _bodyG=null,_idleG=null,_liftG=null;
    const hAv=(typeof AVATARS!=='undefined'&&AVATARS[(((avatarId|0)%AVATARS.length)+AVATARS.length)%AVATARS.length])||{skin:'#f0c8a0',hair:'#3a2410'};
    const heroH=1.86+((avatarId*73)%100)/100*0.16,heroG=0.97+((avatarId*131)%100)/100*0.10;
    const mkElegant=(o)=>{/* CH38 in abito: giacca=shirt · pantaloni=shorts+socks in tinta · scarpe eleganti · camicia V + papillon su Spine2 · (donna) chioma 3 masse */
      const av=THREE.SkeletonUtils.clone(_bodyG.scene);
      const bb=new THREE.Box3().setFromObject(av);const hh=Math.max(0.1,bb.max.y-bb.min.y);const sc=(o.height||1.76)/hh;av.scale.set(sc*(o.girth||0.96),sc,sc*(o.girth||0.96));
      av.traverse(m=>{if(!m.isMesh)return;m.frustumCulled=false;const n=(m.name||"").toLowerCase();
        const setStd=(hex,rough)=>{m.material=new THREE.MeshStandardMaterial({color:new THREE.Color(hex),roughness:(rough!=null?rough:0.6),metalness:0.04,skinning:true});m.material.emissive=new THREE.Color(hex).multiplyScalar(0.05);};
        if(n.indexOf('shirt')>=0)setStd(o.suit,0.55);
        else if(n.indexOf('shorts')>=0)setStd(o.suit,0.62);
        else if(n.indexOf('socks')>=0)setStd(o.suit,0.66);
        else if(n.indexOf('shoes')>=0)setStd(0x0d0d10,0.25);
        else if(n.indexOf('hair')>=0){m.material=new THREE.MeshStandardMaterial({color:new THREE.Color(o.hair||'#221408'),roughness:0.5,metalness:0.1,skinning:true});}
        else if(n.indexOf('body')>=0&&m.material){m.material=m.material.clone();const sk=new THREE.Color(o.skin||'#d9a77f');m.material.color=sk;if('emissive'in m.material)m.material.emissive=sk.clone().multiplyScalar(0.09);if('roughness'in m.material)m.material.roughness=0.78;if('metalness'in m.material)m.material.metalness=0.0;}});
      av.position.copy(o.at);av.rotation.y=o.rotY;scene.add(av);_glbRootsG.push(av);
      const rec={root:av,bones:{}};av.updateMatrixWorld(true);
      av.traverse(b=>{if(!b.isBone)return;const bn=b.name||"";
        if(/mixamorig\d*Head$/i.test(bn))rec.bones.head=b;
        else if(/mixamorig\d*Spine2$/i.test(bn))rec.bones.spine=b;
        else if(/mixamorig\d*LeftArm$/i.test(bn))rec.bones.lArm=b;
        else if(/mixamorig\d*LeftForeArm$/i.test(bn))rec.bones.lFore=b;
        else if(/mixamorig\d*LeftHand$/i.test(bn))rec.bones.lHand=b;
        else if(/mixamorig\d*RightArm$/i.test(bn))rec.bones.rArm=b;
        else if(/mixamorig\d*RightForeArm$/i.test(bn))rec.bones.rFore=b;
        else if(/mixamorig\d*RightHand$/i.test(bn))rec.bones.rHand=b;
        else if(/mixamorig\d*Hips$/i.test(bn))rec.bones.hips=b;});
      // [7.68.0 collaudo PO «non sono vestiti da cerimonia»] PANTALONI da cerimonia: due cilindri scuri appesi
      //   all'osso HIPS (stesso orientamento noto della camicia sullo Spine2: +Y su → -Y giù) → coprono
      //   shorts+gambe nude+calzettoni del CH38 (che leggono come una TUTA). Bone-space u=1/scale (pattern vest 7.50.0).
      try{if(rec.bones.hips){const hb=rec.bones.hips;hb.getWorldScale(_gv);const u=1/(_gv.y||1);
        const trM=new THREE.MeshStandardMaterial({color:new THREE.Color(o.suit),roughness:0.6,metalness:0.04});
        [[-0.075],[0.075]].forEach(sx=>{const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.085*u,0.066*u,1.02*u,12),trM);tr.position.set(sx[0]*u,-0.52*u,0.01*u);hb.add(tr);});}}catch(_e){}
      try{if(rec.bones.spine){const b=rec.bones.spine;b.getWorldScale(_gv);const u=1/(_gv.y||1);
        const vst=new THREE.Mesh(new THREE.PlaneGeometry(0.055*u,0.16*u),new THREE.MeshBasicMaterial({color:0xf2efe6,side:THREE.DoubleSide}));vst.position.set(0,0.02*u,0.152*u);vst.rotation.x=-0.1;b.add(vst);
        if(!o.female){const bw=new THREE.Mesh(new THREE.BoxGeometry(0.055*u,0.02*u,0.015*u),new THREE.MeshBasicMaterial({color:0x0d0d10}));bw.position.set(0,0.115*u,0.15*u);b.add(bw);}}}catch(_e){}
      try{if(o.female&&rec.bones.head){const hd=rec.bones.head;hd.getWorldScale(_gv);const u=1/(_gv.y||1);
        const hm=new THREE.MeshStandardMaterial({color:new THREE.Color(o.hair),roughness:0.5,metalness:0.12});
        const g=new THREE.Group();
        const cp=new THREE.Mesh(new THREE.SphereGeometry(0.112*u,18,14,0,Math.PI*2,0,Math.PI*0.58),hm);cp.scale.set(1.0,0.92,1.06);cp.position.set(0,0.118*u,-0.030*u);g.add(cp);
        const fl=new THREE.Mesh(new THREE.CylinderGeometry(0.078*u,0.048*u,0.28*u,16,1),hm);fl.rotation.x=0.18;fl.position.set(0,-0.05*u,-0.105*u);g.add(fl);
        const tip=new THREE.Mesh(new THREE.SphereGeometry(0.046*u,12,8),hm);tip.position.set(0,-0.195*u,-0.13*u);g.add(tip);
        hd.add(g);}}catch(_e){}
      if(_idleG&&_idleG.animations&&_idleG.animations[0]){const mx=new THREE.AnimationMixer(av);const a=mx.clipAction(_idleG.animations[0]);a.play();a.timeScale=0.15;mx.setTime(R(31)*1.6);_mixersG.push(mx);rec.mx=mx;}
      return rec;};
    /* [7.143.0 task #108] PRESENTATORE REALISTICO (Rocketbox Male_Adult_03, giacca) — SOLO l'actor: il CH38
       «disegnato malissimo» resta rimosso (7.85.0 opzione 2); se il file manca la cerimonia resta senza persone.
       Stesso pattern rig-agnostico dell'intervista (7.142.0): scala/ricentraggio dalle ossa, matcher tollerante
       Biped+mixamo, posa world-space, curl delle 5 dita, tick su base-quaternion. La BUSTA torna visibile e
       viene tenuta al petto nella mano sinistra (tracking world-space già esistente). */
    const mkActorG=(g,o)=>{try{
      const av=THREE.SkeletonUtils.clone(g.scene);
      av.updateMatrixWorld(true);
      let _yMin=Infinity,_yMax=-Infinity;const _bv=new THREE.Vector3();
      av.traverse(bb=>{if(!bb.isBone)return;bb.getWorldPosition(_bv);if(_bv.y<_yMin)_yMin=_bv.y;if(_bv.y>_yMax)_yMax=_bv.y;});
      let hh=_yMax-_yMin;if(!(hh>0.01)){const bb2=new THREE.Box3().setFromObject(av);hh=Math.max(0.1,bb2.max.y-bb2.min.y);}
      const sc=(o.height||1.76)/hh;av.scale.setScalar(sc);
      av.traverse(m=>{if(m.isMesh)m.frustumCulled=false;});
      av.position.copy(o.at);av.rotation.y=o.rotY;scene.add(av);_glbRootsG.push(av);
      av.updateMatrixWorld(true);
      {let xm=Infinity,xM=-Infinity,ym=Infinity,zm=Infinity,zM=-Infinity;
       av.traverse(bb=>{if(!bb.isBone)return;bb.getWorldPosition(_bv);if(_bv.x<xm)xm=_bv.x;if(_bv.x>xM)xM=_bv.x;if(_bv.y<ym)ym=_bv.y;if(_bv.z<zm)zm=_bv.z;if(_bv.z>zM)zM=_bv.z;});
       if(isFinite(xm)){av.position.x+=o.at.x-(xm+xM)/2;av.position.z+=o.at.z-(zm+zM)/2;av.position.y+=-ym;av.updateMatrixWorld(true);}}
      const rec={root:av,bones:{},actor:true};
      av.traverse(bb=>{if(!bb.isBone)return;const bn=(bb.name||"").replace(/[:_. ]/g,"").toLowerCase();
        if(/head$/.test(bn))rec.bones.head=bb;
        else if(/spine2$/.test(bn))rec.bones.spine=bb;
        else if(/rightforearm$|rforearm$/.test(bn))rec.bones.rFore=bb;
        else if(/leftforearm$|lforearm$/.test(bn))rec.bones.lFore=bb;
        else if(/rightarm$|rupperarm$/.test(bn))rec.bones.rArm=bb;
        else if(/leftarm$|lupperarm$/.test(bn))rec.bones.lArm=bb;
        else if(/righthand$|rhand$/.test(bn))rec.bones.rHand=bb;
        else if(/lefthand$|lhand$/.test(bn))rec.bones.lHand=bb;});
      rec.rotQ=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),o.rotY);
      const _axF=new THREE.Vector3(0,0,1).applyQuaternion(rec.rotQ),_axL=new THREE.Vector3(1,0,0).applyQuaternion(rec.rotQ);
      rec.axisRot=(bone,axis,ang)=>{if(!bone||!bone.parent)return;av.updateMatrixWorld(true);
        const pw=new THREE.Quaternion();bone.parent.getWorldQuaternion(pw);
        const rq=new THREE.Quaternion().setFromAxisAngle(axis,ang);
        bone.quaternion.copy(pw.clone().invert().multiply(rq).multiply(pw).multiply(bone.quaternion.clone()));};
      /* [7.147.0 collaudo PO «braccio monco»] adduzione destra 1.10→0.88 + gomito avanti 0.45: a 1.10 il braccio
         si INFILAVA nella mesh del torso (maglione/giacca larghi) e l'avambraccio spariva = «monco». Sinistro più
         ALZATO (0.55/1.35): la busta sta davanti al petto, chiaramente in mano. Convergiuto sul viewer con M02. */
      rec.axisRot(rec.bones.rArm,_axF,0.88);rec.axisRot(rec.bones.rFore,_axL,-0.45);/* destro giù, mano avanti dal fianco */
      rec.axisRot(rec.bones.lArm,_axF,-0.55);rec.axisRot(rec.bones.lFore,_axL,-1.35);/* sinistro piegato: busta al petto */
      av.traverse(bb=>{if(!bb.isBone)return;const fn=(bb.name||"").replace(/[^a-zA-Z0-9]/g,"").toLowerCase();
        if(fn.indexOf('finger')<0)return;const isTh=/finger0\d?$/.test(fn);
        const isL=fn.indexOf('lfinger')>=0||fn.indexOf('leftfinger')>=0;
        bb.rotation.z+=(isL?0.42:0.30)*(isTh?0.3:1);});/* sx pugno morbido (regge la busta), dx rilassato */
      rec.axes={left:_axL,up:new THREE.Vector3(0,1,0)};
      rec.pose0={hq:rec.bones.head?rec.bones.head.quaternion.clone():null,sq:rec.bones.spine?rec.bones.spine.quaternion.clone():null};
      if(typeof _CPM_TEST!=='undefined'&&_CPM_TEST){try{(window.__CPM_ACTOR_G=window.__CPM_ACTOR_G||[]).push({hh:hh,sc:sc,bones:Object.keys(rec.bones)});}catch(_e){}}/* [7.144.0] array: uomo+donna */
      return rec;
    }catch(_e){return null;}};
    if(typeof loadGLB==="function"&&window.__CPM_GLB!==false){
      /* [7.144.0 collaudo PO «la cerimonia sia con DONNA che UOMO che si alternano all'apertura delle buste»]
         DUE presentatori Rocketbox ai lati del podio: uomo (Male_Adult_03, giacca) a destra + donna
         (Female_Adult_11, abito da cerimonia) a sinistra. L'atto PARI apre la donna, il dispari l'uomo;
         la busta passa di mano ad ogni atto (re-parent). Se un file manca presenta l'altro da solo. */
      Promise.all([loadGLB('./assets/actor-presenter.glb').catch(()=>null),loadGLB('./assets/actor-presenter-f.glb').catch(()=>null)]).then(([aM,aF])=>{
        if(!THREE.SkeletonUtils||!THREE.SkeletonUtils.clone)return;
        if(aM&&aM.scene)presM=mkActorG(aM,{at:fig.position,rotY:fig.rotation.y,height:pH});
        if(aF&&aF.scene)presF=mkActorG(aF,{at:{x:-1.62,y:0,z:-0.62},rotY:0.55,height:1.70});/* [7.328.0] fuori dal footprint del podio (era -1.15 = gambe nella pedana) */
        if(presM||presF)env.visible=true;/* la busta torna in scena SOLO con chi la regge */
      }).catch(()=>{});
    }
    // ── loop: beat → regia + busta + reazioni ──
    let raf=0,t0=performance.now(),_tPrevG=0,openT=0,heroIn=0,_cued={};
    const _nodG=(t,per,ph,amp)=>{const u2=((t+ph)%per)/per;return u2<0.10?Math.sin(u2/0.10*Math.PI)*amp:0;};
    const loop=()=>{
      raf=requestAnimationFrame(loop);
      const t=(performance.now()-t0)/1000;const b=st.current.beat,winB=b>=3;
      const dt=Math.min(0.06,t-_tPrevG||0.016);_tPrevG=t;_mixersG.forEach(m=>m.update(dt));
      // spot/colonne: si accendono al reveal
      cones.forEach((c,i)=>{c.rotation.z=Math.sin(t*0.5+i*2.1)*0.16;c.material.opacity=winB?0.16+Math.sin(t*2+i)*0.05:0.10+Math.sin(t*0.8+i)*0.03;});
      colMs.forEach((m2,i)=>{m2.emissiveIntensity=(winB?0.55:0.28)+Math.sin(t*1.4+i)*0.06;});
      trophy.rotation.y=t*0.45;
      // ── PRESENTATORI (actor Rocketbox, 7.144.0): DONNA e UOMO ai lati del podio che si ALTERNANO
      //    all'apertura delle buste (atto PARI → donna · dispari → uomo; se uno manca presenta l'altro).
      //    Base-QUATERNION + delta world-space (niente mixer → un += per-frame accumulerebbe, lezione 7.141.0). ──
      const actP=(((st.current.act|0)%2===0)?presF:presM)||presF||presM;
      [presM,presF].forEach(P=>{if(!P)return;const isAct=P===actP;const ph=(P===presF?1.7:0);
        if(P.pose0&&P.pose0.hq&&P.bones.head){const hd=P.bones.head;hd.quaternion.copy(P.pose0.hq);
          P.axisRot(hd,P.axes.left,(isAct?(b===2?0.30:0.04):0.02)+_nodG(t,6.2,ph*3+R(11)*4,0.08));/* l'ATTIVO al beat busta GUARDA giù (legge) */
          P.axisRot(hd,P.axes.up,Math.sin(t*0.3+ph)*0.06+(isAct&&winB?(P===presF?0.30:-0.30):0));/* al reveal si volta verso il podio (specchiato per lato) */
        }
        if(P.pose0&&P.pose0.sq&&P.bones.spine){const sp=P.bones.spine;sp.quaternion.copy(P.pose0.sq);P.axisRot(sp,P.axes.left,Math.sin(t*1.0+ph)*0.011);}});
      // ── BUSTA: PARENTATA alla mano sinistra di CHI PRESENTA (lezione mic 7.128.0) e PASSA DI MANO
      //    al cambio atto (re-parent); grip oltre le dita, faccia alla camera. Al reveal si APRE. ──
      if(actP&&actP.bones.lHand&&actP.bones.lFore){
        if(env._holder!==actP){
          if(env._holder&&env._holder.bones.lHand){try{env._holder.bones.lHand.remove(env);}catch(_e){}}
          actP.bones.lHand.add(env);actP.bones.lHand.getWorldScale(_gv);env._ws=(_gv.x||1);env.scale.setScalar(1/env._ws);env._holder=actP;}
        actP.root.updateMatrixWorld(true);
        actP.bones.lHand.getWorldPosition(_gv);actP.bones.lFore.getWorldPosition(_gv2);
        _gv2.subVectors(_gv,_gv2).normalize();/* avambraccio→mano = verso le dita */
        actP.bones.lHand.getWorldQuaternion(_gq);
        _gv2.multiplyScalar(0.085);_gv2.y+=0.02;_gv2.z+=0.03;
        _gv2.applyQuaternion(_gq2.copy(_gq).invert()).multiplyScalar(1/env._ws);
        env.position.copy(_gv2);
        _gq2.setFromEuler(_ge.set(-0.35,actP.root.rotation.y+0.3,0));
        env.quaternion.copy(_gq).invert().multiply(_gq2);
      }
      if(winB){openT=Math.min(1,openT+dt*0.9);if(!_cued.open){_cued.open=true;_cue("envelope_open");}}
      envFlap.rotation.x=-2.4*(openT<0.5?openT*2:1);/* prima metà: aletta */
      envCard.position.y=0.01+0.11*Math.max(0,(openT-0.45)/0.55);/* poi il cartoncino scivola su */
      // ── VINCITORE (solo se vince l'eroe): entra, riceve il trofeo, posa foto ──
      if(winB&&st.current.heroWins&&!heroAv&&_bodyG){heroAv=mkElegant({suit:0x14151c,skin:hAv.skin,hair:hAv.hair,female:false,at:{x:3.6,y:0,z:0.4},rotY:-1.1,height:heroH,girth:heroG});/* [7.68.0] smoking quasi-nero */
        if(_liftG&&_liftG.animations&&_liftG.animations[0]&&heroAv.mx){_heroLift=heroAv.mx.clipAction(_liftG.animations[0]);_heroLift.setLoop(THREE.LoopOnce);_heroLift.clampWhenFinished=true;}
        _cue("winner_enter");}
      if(heroAv){heroIn=Math.min(1,heroIn+dt*0.32);const e2=heroIn*heroIn*(3-2*heroIn);
        heroAv.root.position.x=3.6+(-0.95-3.6)*e2;heroAv.root.position.z=0.4+(-0.02-0.4)*e2;heroAv.root.rotation.y=-1.1+(0.15+1.1)*e2*0.9;/* [7.68.0] finale ACCANTO al podio (x=-0.95): il volto NON è più coperto dal trofeo · [7.328.0] z -0.35→-0.02: -0.35 è ESATTAMENTE la faccia frontale della pedana p1 → i polpacci del vincitore ci entravano; ora il corpo resta davanti con ~0.33 di margine */
        if(heroIn>=1){
          if(_heroLift){if(!_heroLiftOn){_heroLiftOn=true;_heroLift.reset().fadeIn(0.35).play();_cue("trophy_lift");}const ap=_heroLift.getClip().duration*0.34;if(_heroLift.time>=ap){_heroLift.time=ap;_heroLift.paused=true;}}
          else if(heroAv.bones.lArm&&heroAv.bones.rArm){/* [7.68.0] niente clip lift → posa MANUALE: braccia alzate che reggono il trofeo (prima restava sul podio) */
            heroAv.bones.lArm.rotation.set(-1.9,0,0.55);heroAv.bones.rArm.rotation.set(-1.9,0,-0.55);
            if(heroAv.bones.lFore)heroAv.bones.lFore.rotation.set(0,0,0.5);if(heroAv.bones.rFore)heroAv.bones.rFore.rotation.set(0,0,-0.5);}
          if(heroAv.bones.lHand&&heroAv.bones.rHand){heroAv.root.updateMatrixWorld(true);heroAv.bones.lHand.getWorldPosition(_gv);heroAv.bones.rHand.getWorldPosition(_gv2);trophy.position.set((_gv.x+_gv2.x)/2,(_gv.y+_gv2.y)/2+0.06,(_gv.z+_gv2.z)/2);}/* [7.68.0] trofeo SEMPRE nelle mani (indipendente dalla clip lift — era la causa del "trofeo sul podio davanti al volto") */
        } else if(heroIn>0.7){trophy.position.y=1.62;}
      }
      // ── PUBBLICO: applauso (bob) + flash più fitti al reveal ──
      crowd.forEach(g=>{g.position.y=(winB?Math.abs(Math.sin(t*5+g._ph))*0.05:Math.sin(t*1.1+g._ph)*0.012);});
      flashes.forEach(f=>{if(f.t<0&&Math.sin(t*13+f.sp.position.x*7)>(winB?0.86:0.985))f.t=0;if(f.t>=0){f.t+=0.05;const o=Math.max(0,1-f.t*3.2);f.sp.material.opacity=o;if(o>0.6)flashLight.intensity=1.4;if(f.t>0.4)f.t=-1;}});
      flashLight.intensity*=0.86;
      // ── REGIA a beat (stacchi dolci dt-corretti); i beat 1-2 inquadrano il LATO di chi presenta (7.144.0) ──
      const _psgn=actP===presF?-1:1;
      const tgt=b===0?[camVX,2.2,9.3,0,1.4,-0.8]
        :b===1?[camVX+1.35*_psgn,1.72,5.4,1.25*_psgn,1.35,-0.72]/* [7.328.0] presentatori spostati a |x|=1.72 → il lookAt li segue */
        :b===2?[camVX+1.15*_psgn,1.5,3.6,1.15*_psgn,1.25,-0.62]
        :st.current.heroWins?[camVX,1.95,5.0,0,1.55,-1.05]/* [7.85.0 opzione 2] niente vincitore in scena → push-in sul TROFEO sul podio */
        :[camVX,2.0,6.6,0,1.5,-1.0];
      const k2=1-Math.exp(-dt*2.2);
      cam.position.x+=(tgt[0]-cam.position.x)*k2;cam.position.y+=(tgt[1]-cam.position.y)*k2;cam.position.z+=(tgt[2]-cam.position.z)*k2;
      cam.lookAt(tgt[3],tgt[4],tgt[5]);
      if(winB&&!_cued.win){_cued.win=true;_cue("winner_reveal");}
      confSys.forEach(ps=>{ps.material.opacity+=((winB?0.95:0)-ps.material.opacity)*0.05;
        if(ps.material.opacity>0.02){const a=ps.geometry.attributes.position.array,v=ps._vel;for(let i=0;i<v.length;i++){a[i*3+1]-=v[i]*0.033;a[i*3]+=Math.sin(t*2+i)*0.004;if(a[i*3+1]<0){a[i*3+1]=4.4;}}ps.geometry.attributes.position.needsUpdate=true;}});
      renderer.render(scene,cam);
    };
    loop();
    const onRs=()=>{try{renderer.setSize(W(),H());cam.aspect=W()/H();cam.updateProjectionMatrix();}catch(_e){}};
    window.addEventListener('resize',onRs);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',onRs);
      try{_glbRootsG.forEach(r=>{try{scene.remove(r);}catch(_e){}});
        scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.map)m.map.dispose();m.dispose();});}});renderer.dispose();host.removeChild(renderer.domElement);}catch(_e){}};
  },[]);
  return <div ref={ref} style={{position:"absolute",inset:0,overflow:"hidden"}}/>;
}
function SeasonAwardsScreen({awards,player,season,club,onContinue}){
  const{palloneOro,scarpaOro,leagueMvp,leagueTopScorer,leagueYoung,leagueTeamOfYear,youngPlayer,seasonRecord,allTime,rival}=awards;
  const lg=club?.lg||"Pro";
  const pWinsBoth=palloneOro.playerWins&&scarpaOro.playerWins;
  const anyLeaguePrize=(leagueMvp?.playerWins||leagueTopScorer?.playerWins||leagueYoung?.playerWins||leagueTeamOfYear);
  const anyRecord=seasonRecord.beaten||allTime.beaten;

  const SectionLabel=({children})=>(
    <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:8}}>{children}</div>
  );
  const ScoreRow=({rank,name,val,label,isPlayer,extra})=>(
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"7px 8px",borderRadius:8,
      background:isPlayer?"#eff6ff":"transparent",
      borderLeft:isPlayer?"3px solid "+TH.primary:"3px solid transparent",marginBottom:3}}>
      <div style={{fontSize:13,fontWeight:900,color:rank===0?TH.warning:rank===1?"#94a3b8":"#b0b8c1",minWidth:18}}>{rank===0?"🥇":rank===1?"🥈":"🥉"}</div>
      <div style={{flex:1,fontSize:12,fontWeight:isPlayer?800:400,color:isPlayer?TH.primary:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}{isPlayer?" 👈":""}</div>
      <div style={{fontSize:13,fontWeight:700,color:isPlayer?TH.primary:TH.text}}>{val} <span style={{fontSize:10,color:TH.muted}}>{label}</span></div>
      {extra&&<div style={{fontSize:10,color:TH.muted}}>{extra}</div>}
    </div>
  );

  /* [7.19.0 LA NOTTE DEL GALA — backlog favola] cerimonia TV a buste sopra la schermata premi (che resta
     identica sotto); solo stato locale, zero save. [7.33.0 direttiva PO «estendere la cerimonia 3D anche
     alle altre classifiche individuali (cannonieri, MVP, ecc)»] il gala è ora una SEQUENZA di premi sullo
     stesso palco 3D, in CRESCENDO: Giovane dell'Anno → Capocannoniere → MVP → Re dei Bomber → Trofeo d'Oro.
     Atti DERIVATI dai dati veri di generateSeasonAwards (top3 dove esiste, vincitore singolo altrove). */
  const _galaSeq=React.useMemo(()=>{try{const seq=[];
    const _t3=(o)=>(o&&Array.isArray(o.top3)&&o.top3.length===3)?o.top3.slice(0,3):null;
    if(leagueYoung&&leagueYoung.winner&&leagueYoung.isYoungEligible)seq.push({key:"young",e:"💎",title:"Giovane dell'Anno",sub:`Il talento U23 della ${lg}`,rows:[leagueYoung.winner],single:true});
    const _ts=_t3(leagueTopScorer);if(_ts)seq.push({key:"capo",e:"⚽",title:"Capocannoniere",sub:`I bomber della ${lg}`,rows:_ts});
    const _mv=_t3(leagueMvp);if(_mv)seq.push({key:"mvp",e:"🏅",title:"MVP della Stagione",sub:`Il migliore della ${lg}`,rows:_mv});
    const _sc=_t3(scarpaOro);if(_sc)seq.push({key:"scarpa",e:"👟",title:"Re dei Bomber",sub:"Top scorer nei campionati europei",rows:_sc});
    const _po=_t3(palloneOro);if(_po)seq.push({key:"oro",e:"🌍",title:"Trofeo d'Oro",sub:"I migliori calciatori d'Europa — smoking, riflettori, una busta.",rows:_po});
    return seq;}catch(_e){return[];}},[]);// eslint-disable-line
  const [galaAct,setGalaAct]=React.useState(0);
  const [galaN,setGalaN]=React.useState(0);// 0 busta chiusa · 1 rivela 3° · 2 rivela 2° · 3 rivela 1°
  const [galaOff,setGalaOff]=React.useState(false);
  const _actG=_galaSeq[galaAct]||null;
  const _galaLast=galaAct>=_galaSeq.length-1;
  const _galaTop3=_actG?_actG.rows:[];
  const _galaOn=!galaOff&&!!_actG;
  const _galaNext=()=>{if(_galaLast)setGalaOff(true);else{setGalaAct(a=>a+1);setGalaN(0);}};
  const _galaRow=(idx,medal,big)=>{const c=_galaTop3[idx];if(!c)return null;const _me=!!c.isPlayer;return(
    <div key={idx} style={{display:"flex",alignItems:"center",gap:10,padding:big?"12px 14px":"9px 12px",borderRadius:12,marginBottom:6,background:_me?"linear-gradient(135deg,#3b2a07,#5b420c)":"rgba(255,255,255,0.06)",border:`1px solid ${_me?"#d4a017":"rgba(255,255,255,0.12)"}`,animation:"logoIn 0.5s ease-out"}}>
      <span style={{fontSize:big?26:18}}>{medal}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:big?15:12.5,fontWeight:900,color:_me?"#fde68a":"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}{_me?" — SEI TU!":""}</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.55)"}}>{c.club||c.league||""}{c.goals!=null?` · ${c.goals} gol`:""}</div>
      </div>
    </div>);};
  return(
    <div style={{width:"100%"}}>
      {_galaOn&&(
        <div style={{position:"fixed",inset:0,zIndex:9997,background:"radial-gradient(circle at 50% 18%, #1c1408 0%, #07060c 62%)",display:"flex",alignItems:"center",justifyContent:"center",padding:18}}>
          {/* [7.24.0] PALCO 3D dietro il gala (fallback = il gradiente qui sopra se WebGL non parte) — [7.33.0] beat/heroWins per ATTO: luci e coriandoli si riaccendono a ogni premio */}
          <GalaStage3D beat={galaN} act={galaAct} heroWins={!!(_galaTop3[0]&&_galaTop3[0].isPlayer)} avatarId={player.avatarId||0} seed={typeof hashStr==="function"?hashStr((player.name||"H")+"|gala|"+(season||1)):7}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(7,6,12,0.30) 0%,rgba(7,6,12,0.06) 34%,rgba(7,6,12,0.62) 78%,rgba(7,6,12,0.82) 100%)",pointerEvents:"none"}}/>
          <div style={{maxWidth:420,width:"100%",textAlign:"center",position:"relative"}}>
            <div style={{fontSize:10,color:"#d4a017",textTransform:"uppercase",letterSpacing:3,marginBottom:6}}>🎩 La notte del Gala · Stagione {season}</div>
            <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:8}}>
              {_galaSeq.map((a,i)=>(<span key={a.key} style={{width:i===galaAct?18:7,height:7,borderRadius:4,background:i<galaAct?"#d4a017":i===galaAct?"#fde68a":"rgba(255,255,255,0.18)",transition:"all .3s"}}/>))}
            </div>
            <div key={"t"+galaAct} style={{fontSize:20,fontWeight:900,color:"#fff",marginBottom:2,animation:"logoIn 0.5s ease-out"}}>{_actG.e} {_actG.title}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",marginBottom:16}}>{_actG.sub}</div>
            {galaN===0&&(<div style={{animation:"logoIn 0.5s ease-out"}}>
              <div style={{fontSize:56,marginBottom:8}}>✉️</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.8)",fontStyle:"italic",marginBottom:16}}>«La busta, per favore…»</div>
              <Btn v="primary" fw onClick={()=>setGalaN(_actG.single?3:1)}>Apri la busta</Btn>
            </div>)}
            {galaN>=1&&(<div style={{textAlign:"left"}}>
              {!_actG.single&&galaN>=1&&_galaRow(2,"🥉",false)}
              {!_actG.single&&galaN>=2&&_galaRow(1,"🥈",false)}
              {galaN>=3&&_galaRow(0,"🥇",true)}
              {galaN>=3&&_galaTop3[0]&&_galaTop3[0].isPlayer&&(<div style={{textAlign:"center",fontSize:13,color:"#fde68a",fontWeight:900,margin:"8px 0 2px",animation:"logoIn 0.6s ease-out"}}>{_actG.key==="oro"?"🎉 Il Trofeo d'Oro è TUO — la notte che sognavi da bambino.":`🎉 ${_actG.title}: il premio è TUO!`}</div>)}
              <div style={{marginTop:12}}>
                {galaN<3&&<Btn v="primary" fw onClick={()=>setGalaN(n=>n+1)}>{galaN===1?"Il secondo posto…":"…e il vincitore è"}</Btn>}
                {galaN>=3&&<Btn v="primary" fw onClick={_galaNext}>{_galaLast?"Vai alla cerimonia dei premi →":"Il prossimo premio →"}</Btn>}
              </div>
            </div>)}
            <button onClick={()=>setGalaOff(true)} style={{display:"block",margin:"14px auto 0",background:"none",border:"none",color:"rgba(255,255,255,0.35)",fontSize:10.5,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Salta il gala</button>
          </div>
        </div>
      )}
      {/* Header */}
      <div style={{textAlign:"center",marginBottom:16,paddingTop:4}}>
        <div style={{fontSize:46,marginBottom:6}}>🏅</div>
        <h1 style={{fontSize:18,fontWeight:900,margin:"0 0 4px",color:TH.text}}>Premi Stagione {season}</h1>
        <p style={{color:TH.muted,fontSize:12,margin:"0 0 4px"}}>{lg} · Cerimonia di Fine Stagione</p>
        {pWinsBoth&&<div style={{display:"inline-block",marginTop:6,background:"linear-gradient(135deg,#fef08a,#fde047)",color:TH.txAmber,fontWeight:900,fontSize:12,padding:"4px 14px",borderRadius:20}}>🌟 STAGIONE LEGGENDARIA!</div>}
        {anyLeaguePrize&&!pWinsBoth&&<div style={{display:"inline-block",marginTop:6,background:"linear-gradient(135deg,#dbeafe,#bfdbfe)",color:TH.txBlue,fontWeight:900,fontSize:12,padding:"4px 14px",borderRadius:20}}>⭐ STAGIONE STRAORDINARIA!</div>}
      </div>

      {/* PREMI DI LEGA (Sprint 134) */}
      <Card style={{marginBottom:10,padding:"14px 16px"}}>
        <SectionLabel>🏅 PREMI DI LEGA — {lg}</SectionLabel>

        {/* Capocannoniere */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:800,color:TH.text,marginBottom:4}}>⚽ Capocannoniere del Campionato</div>
          {(leagueTopScorer?.top3||[]).map((c,i)=>(
            <ScoreRow key={i} rank={i} name={c.name} val={c.goals} label="gol" isPlayer={!!c.isPlayer} extra={c.club}/>
          ))}
          {leagueTopScorer?.playerWins&&<div style={{marginTop:4,padding:"6px 10px",background:TH.winBg,borderRadius:8,fontSize:11,fontWeight:800,color:TH.txGreen}}>🥇 Sei il capocannoniere della {lg}!</div>}
          {!leagueTopScorer?.playerWins&&(leagueTopScorer?.playerPos||0)>2&&<div style={{fontSize:10,color:TH.muted,marginTop:3,textAlign:"right"}}>La tua posizione: {(leagueTopScorer?.playerPos||0)+1}ª · {(typeof leagueGoalsOf==="function"?leagueGoalsOf(player):(player.goals||0))} gol</div>}{/* [7.9.2] gol di LEGA (player.goals somma tutte le competizioni) */}
        </div>

        {/* MVP della Stagione */}
        <div style={{borderTop:"1px solid "+TH.cardBorder,paddingTop:10,marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:800,color:TH.text,marginBottom:4}}>🏆 MVP della Stagione</div>
          {(leagueMvp?.top3||[]).map((c,i)=>(
            <ScoreRow key={i} rank={i} name={c.name} val={c.goals} label="⚽" isPlayer={!!c.isPlayer} extra={c.club}/>
          ))}
          {leagueMvp?.playerWins&&<div style={{marginTop:4,padding:"6px 10px",background:TH.bgAmber,borderRadius:8,fontSize:11,fontWeight:800,color:TH.txAmber}}>🏆 Miglior calciatore della {lg}!</div>}
        </div>

        {/* Giovane dell'Anno + Squadra dell'Anno */}
        <div style={{display:"flex",gap:8,borderTop:"1px solid "+TH.cardBorder,paddingTop:10}}>
          {(leagueYoung||youngPlayer)?.isYoungEligible&&(
            <div style={{flex:1,background:(leagueYoung||youngPlayer)?.playerWins?"#ede9fe":"#f8fafc",borderRadius:8,padding:"8px 10px",border:"1px solid "+((leagueYoung||youngPlayer)?.playerWins?"#c4b5fd":TH.cardBorder)}}>
              <div style={{fontSize:10,color:TH.muted,marginBottom:2}}>💎 GIOVANE DELL'ANNO</div>
              <div style={{fontSize:11,fontWeight:700,color:(leagueYoung||youngPlayer)?.playerWins?"#5b21b6":TH.text}}>{(leagueYoung||youngPlayer)?.winner?.name||"–"}</div>
              <div style={{fontSize:10,color:TH.muted}}>{(leagueYoung||youngPlayer)?.winner?.goals||0}⚽ {(leagueYoung||youngPlayer)?.winner?.assists||0}🎯</div>
            </div>
          )}
          {leagueTeamOfYear&&(
            <div style={{flex:1,background:TH.bgBlue,borderRadius:8,padding:"8px 10px",border:"1px solid #bae6fd"}}>
              <div style={{fontSize:10,color:TH.muted,marginBottom:2}}>📋 SQUADRA DELL'ANNO</div>
              <div style={{fontSize:11,fontWeight:700,color:TH.txBlue}}>Selezionato!</div>
              <div style={{fontSize:10,color:TH.muted}}>{player.name} nell'XI ideale</div>
            </div>
          )}
          {!leagueTeamOfYear&&!(leagueYoung||youngPlayer)?.isYoungEligible&&(
            <div style={{fontSize:11,color:TH.muted}}>Continua a crescere per entrare nell'XI ideale della lega.</div>
          )}
        </div>
      </Card>

      {/* PREMI EUROPEI */}
      <Card style={{marginBottom:10,padding:"14px 16px",background:palloneOro.playerWins?thPastel("#fefce8","rgba(245,158,11,0.13)"):TH.card,border:palloneOro.playerWins?("1.5px solid "+thPastel("#fde68a","rgba(245,158,11,0.5)")):"1px solid "+TH.cardBorder}}>
        <SectionLabel>🌍 TROFEO D'ORO {season}</SectionLabel>
        <div style={{fontSize:10,color:TH.muted,marginBottom:6}}>Migliori calciatori d'Europa</div>
        {palloneOro.top3.map((c,i)=>(
          /* [7.289.0] la bacheca accanto al nome: senza, un campione con 30 gol che batte un bomber da 39
             sembra un errore del gioco invece che il verdetto (giusto) di un premio che non è la classifica
             marcatori — quella è il Re dei Bomber, qui sotto. */
          <ScoreRow key={i} rank={i} name={c.name} val={c.goals} label="⚽" isPlayer={!!c.isPlayer} extra={c.trofei?`${c.league||c.club} · 🏆 ${c.trofei}`:(c.league||c.club)}/>
        ))}
        <div style={{fontSize:9.5,color:TH.muted,marginTop:4,fontStyle:"italic"}}>Non è la classifica marcatori: pesano gol, assist, rendimento e trofei vinti.</div>
        {palloneOro.playerWins&&(
          <div style={{marginTop:10,padding:"10px 12px",background:"linear-gradient(135deg,#fef08a,#fde047)",borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:14,fontWeight:900,color:TH.txAmber}}>🏆 Hai vinto il Trofeo d'Oro!</div>
            <div style={{fontSize:11,color:TH.txAmber,marginTop:2}}>Il riconoscimento più prestigioso del calcio europeo.</div>
          </div>
        )}
        {!palloneOro.playerWins&&rival&&palloneOro.winner.name===rival.name&&(
          <div style={{marginTop:8,padding:"8px 12px",background:TH.lossBg,borderRadius:8,fontSize:11,color:TH.lossFg,fontWeight:700}}>😤 {rival.name} ti ha battuto per il Trofeo d'Oro. Risponderai il prossimo anno?</div>
        )}
      </Card>

      <Card style={{marginBottom:10,padding:"14px 16px",background:scarpaOro.playerWins?thPastel("#f0fdf4","rgba(34,197,94,0.12)"):TH.card,border:scarpaOro.playerWins?("1.5px solid "+thPastel("#bbf7d0","rgba(34,197,94,0.45)")):"1px solid "+TH.cardBorder}}>
        <SectionLabel>👟 RE DEI BOMBER {season}</SectionLabel>
        <div style={{fontSize:10,color:TH.muted,marginBottom:6}}>Top scorer nei campionati europei</div>
        {scarpaOro.top3.map((c,i)=>(
          <ScoreRow key={i} rank={i} name={c.name} val={c.goals} label="gol" isPlayer={!!c.isPlayer} extra={c.league||c.club}/>
        ))}
        {!scarpaOro.playerWins&&scarpaOro.playerPos>2&&(
          <div style={{marginTop:6,fontSize:11,color:TH.muted,textAlign:"right"}}>La tua posizione europea: {scarpaOro.playerPos+1}ª · {scarpaOro.playerGoals??(player.goals||0)} gol di campionato</div>
        )}
        {scarpaOro.playerWins&&<div style={{marginTop:8,padding:"8px 12px",background:TH.winBg,borderRadius:8,fontSize:12,fontWeight:800,color:TH.txGreen,textAlign:"center"}}>🥇 Capocannoniere d'Europa! La Re dei Bomber è tua!</div>}
      </Card>

      {/* Record check */}
      {(seasonRecord.beaten||seasonRecord.near)&&(
        <Card style={{marginBottom:10,padding:"12px 16px",background:seasonRecord.beaten?"#fff7ed":TH.card,border:seasonRecord.beaten?"1.5px solid #fed7aa":"1px solid "+TH.cardBorder}}>
          <SectionLabel>📈 RECORD STAGIONALE</SectionLabel>
          {seasonRecord.beaten?(
            <div>
              <div style={{fontSize:14,fontWeight:900,color:TH.txAmber,marginBottom:4}}>🏅 NUOVO RECORD! {player.goals||0} gol in una stagione!</div>
              <div style={{fontSize:11,color:TH.muted}}>Record precedente: {seasonRecord.record.goals} gol — {seasonRecord.record.name}{/^S\./.test(seasonRecord.record.season||"")?`, ${seasonRecord.record.season}`:""}</div>{/* [7.35.1 collaudo PO «eviterei riferimenti agli anni passati»] l'anno si mostra solo se è una stagione di GIOCO (S.N) */}
            </div>
          ):(
            <div>
              <div style={{fontSize:12,fontWeight:700,color:TH.text,marginBottom:2}}>Vicino al record stagionale!</div>
              <div style={{fontSize:11,color:TH.muted}}>Solo {seasonRecord.record.goals-(player.goals||0)} gol ti separavano dal record di {seasonRecord.record.name} ({seasonRecord.record.goals}{/^S\./.test(seasonRecord.record.season||"")?`, ${seasonRecord.record.season}`:""})</div>
            </div>
          )}
        </Card>
      )}

      {/* All-time */}
      {allTime.beaten&&(
        <Card style={{marginBottom:10,padding:"12px 16px",background:"#fdf4ff",border:"1.5px solid #e9d5ff"}}>
          <div style={{fontSize:14,fontWeight:900,color:"#7c3aed",marginBottom:4}}>👑 SEI IL MIGLIOR MARCATORE DI SEMPRE!</div>
          <div style={{fontSize:11,color:TH.muted}}>{player.totalGoals||0} gol in carriera — hai superato {allTime.record.name} ({allTime.record.goals} gol)</div>{/* [7.35.1] niente ere in anni reali */}
        </Card>
      )}
      {!allTime.beaten&&allTime.position<3&&(allTime.playerCareerGoals>0)&&(
        <Card style={{marginBottom:10,padding:"10px 14px"}}>
          <div style={{fontSize:11,fontWeight:700,color:TH.text}}>📊 Marcatori storici della {lg}: sei {allTime.position===0?"vicino al record all-time":allTime.position+1+"° di tutti i tempi"}</div>
          <div style={{fontSize:10,color:TH.muted,marginTop:2}}>Gol in carriera: {allTime.playerCareerGoals} · Record all-time: {allTime.record.name} ({allTime.record.goals})</div>
        </Card>
      )}

      {/* Young Player — ora mostrato nel blocco PREMI DI LEGA (Sprint 134) */}

      {/* Rival */}
      {rival&&(
        <Card style={{marginBottom:10,padding:"14px 16px",background:"linear-gradient(135deg,#1e1b4b,#312e81)",border:"1px solid rgba(99,102,241,0.3)"}}>
          <div style={{fontSize:10,color:"rgba(165,180,252,0.7)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>🆚 TU VS {rival.name.toUpperCase()} — {rival.relLabel}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",marginBottom:8}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:900,color:rival.tie?"#fbbf24":(rival.playerWins?"#4ade80":"#f87171")}}>{rival.playerGoals}</div>
              <div style={{fontSize:10,color:"rgba(165,180,252,0.7)",marginTop:2}}>{player.name}</div>
              <div style={{fontSize:10,color:"rgba(165,180,252,0.5)"}}>gol stagione</div>
            </div>
            <div style={{textAlign:"center",fontSize:18,color:"rgba(165,180,252,0.5)"}}>⚽</div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:900,color:rival.tie?"#fbbf24":(!rival.playerWins?"#4ade80":"#f87171")}}>{rival.goals}</div>
              <div style={{fontSize:10,color:"rgba(165,180,252,0.7)",marginTop:2}}>{rival.name}</div>
              <div style={{fontSize:10,color:"rgba(165,180,252,0.5)"}}>gol stagione</div>
            </div>
          </div>
          <div style={{textAlign:"center",fontSize:12,fontWeight:700,color:rival.tie?"#fbbf24":(rival.playerWins?"#4ade80":"#f87171"),padding:"6px",background:"rgba(0,0,0,0.2)",borderRadius:8}}>
            {rival.tie?"🤝 Parità con "+rival.name+": "+rival.goals+" gol a testa. Si decide la prossima stagione.":rival.playerWins?"✅ Stagione migliore del rivale! Dominanza.":"😤 "+rival.name+" ti ha superato. Stagione prossima la storia cambia."}
          </div>
        </Card>
      )}

      <Btn onClick={onContinue} v="primary" fw style={{padding:"16px",fontSize:15,marginTop:4}}>
        Continua alla Fine Stagione →
      </Btn>
    </div>
  );
}

/* ========================================
   SEASON END SCREEN  (Sprint 2 — B06/B05)
======================================== */
function SeasonEndScreen({data,player,onNewSeason,onRetire,notifBusy,farewell}){/* [7.432.0] farewell = ritiro ANNUNCIATO a inizio stagione: la fine stagione onora l'annuncio */
  const{season,club,finalStandings,playerStats,champion,playerPos,isChampion,awards,seasonObjectives,rival,euro,leagueOverrides}=data;
  /* [7.423.0 evolutiva PO] LA PARATA DEL PULLMAN SCOPERTO: su scudetto o coppa europea, prima del
     resoconto la citta' fa festa. Stato locale (non tocca il salvataggio), si chiude con Continua. */
  const[parata423,setParata423]=React.useState(()=>!!(isChampion||euro?.champion));
  if(parata423)return(
    <div style={{position:"fixed",inset:0,zIndex:400}}>
      <ParataBus3D club={club} euroWin={!!euro?.champion} avatarId={player?.avatarId||0} heroNum={player?.jerseyNum||10}/>
      <div style={{position:"absolute",top:26,left:0,right:0,textAlign:"center",pointerEvents:"none"}}>
        <div style={{fontSize:11,fontWeight:800,letterSpacing:3,color:"#ffd34d",textShadow:"0 2px 10px rgba(0,0,0,0.8)"}}>🚌 LA PARATA</div>
        <div style={{fontSize:22,fontWeight:900,color:"#fff",textShadow:"0 2px 12px rgba(0,0,0,0.85)",marginTop:4}}>{euro?.champion?"CAMPIONI D'EUROPA!":"CAMPIONI!"}</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.85)",textShadow:"0 1px 8px rgba(0,0,0,0.8)",marginTop:2}}>{club?.n||""} · la città in festa</div>
      </div>
      <button onClick={()=>setParata423(false)} style={{position:"absolute",bottom:26,left:"50%",transform:"translateX(-50%)",padding:"12px 34px",borderRadius:14,border:"none",background:"#7f1d2d",color:"#fff",fontWeight:800,fontSize:15,boxShadow:"0 4px 18px rgba(0,0,0,0.5)"}}>Continua →</button>
    </div>
  );
  // Find LEAGUE_PAIRS for current league to show destination labels
  const _curLg99=club?.lg||"";
  const _pair99=LEAGUE_PAIRS.find(([u,l])=>u===_curLg99||l===_curLg99)||null;
  const _isUpperLg99=_pair99?_pair99[0]===_curLg99:null;
  const _promoDestLg99=_pair99?(_isUpperLg99?null:_pair99[0]):null;  // lower→upper
  const _relegDestLg99=_pair99?(_isUpperLg99?_pair99[1]:null):null;  // upper→lower
  // Sprint 132: detect top-flight (upper league or no pair found → no promotion possible)
  // [6.99.0 collaudo PO «anche i campionati Primavera riportano riferimenti alle coppe europee»] le leghe
  //   GIOVANILI (Primavera 1/2) non hanno zone europee né retrocessioni: solo il titolo conta.
  const _isYouth99=/^Primavera/i.test(_curLg99);
  const _isTopFlight132=!_isYouth99&&(_pair99===null||_isUpperLg99===true);
  const trophies=player.trophies||[];
  const numTeams=finalStandings?.length||18;
  const isRelegated=!_isYouth99&&playerPos>=numTeams-3;/* [6.99.0] in Primavera non si retrocede */
  const isPromoted=!_isTopFlight132&&playerPos<=2&&!isChampion;
  // Sprint 132: European zone flags for top-flight leagues
  const _isCL132=_isTopFlight132&&playerPos>=1&&playerPos<=3&&!isChampion;
  const _isEL132=_isTopFlight132&&playerPos>=4&&playerPos<=5;
  const _isConL132=_isTopFlight132&&playerPos===6;
  const _isEuroZone132=_isCL132||_isEL132||_isConL132;
  // [7.157.0 collaudo PO «qualificato in Conference ma la competizione non è partita»] AUDIT: il motore è corretto
  //   (top-7 → Europa: 1-4 Champions · 5-6 Europa · 7° Conference), ma la Salernum aveva chiuso 8° = un posto
  //   SOTTO lo spot Conference → nessuna Europa, e la schermata non lo diceva. Scelta PO: regola invariata +
  //   AVVISO trasparente quando si manca l'Europa per un soffio (8°, subito sotto il 7° Conference).
  const _justMissedEuro132=_isTopFlight132&&!isChampion&&!isRelegated&&!_isEuroZone132&&playerPos===7;
  const bgColor=isChampion?thPastel("#fef9c3","rgba(245,158,11,0.14)"):(isPromoted||_isEuroZone132)?thPastel("#f0fdf4","rgba(34,197,94,0.12)"):isRelegated?thPastel("#fff1f2","rgba(239,68,68,0.12)"):thPastel("#f8fafc",TH.surface2);/* [7.178.0 RC-15] */
  const borderColor=isChampion?"#fde68a":(isPromoted||_isEuroZone132)?"#bbf7d0":isRelegated?"#fecaca":TH.cardBorder;
  const statusEmoji=isChampion?"🏆":_isCL132?"🌍":_isEL132?"🟠":_isConL132?"🟢":isPromoted?"⬆️":isRelegated?"⬇️":"🏁";
  const statusLabel=isChampion?"CAMPIONE!":_isCL132?"COPPA CAMPIONI":_isEL132?"COPPA EUROPA":_isConL132?"COPPA CONFERENCE":isPromoted?"PROMOZIONE":isRelegated?"RETROCESSIONE":"Fine stagione";// 5.49.3: nomi competizioni di fantasia (de-branding)
  const phase=getCareerPhase(player.age||17);
  const _extraNarr100={coachStyle:player.coach?.style,clubPrestige:club?.p||60,season:season||1,isPromoted,euroChamp:euro?.champion,cupChamp:player.cup?.champion};
  const narrative=getSeasonNarrative(playerStats.goals||0,playerStats.assists||0,playerStats.matches||0,playerPos,numTeams,isChampion,isRelegated,_extraNarr100);
  const headline=getSeasonHeadline(playerStats.goals||0,playerStats.assists||0,playerPos,isChampion,isRelegated,_extraNarr100);
  // Sprint 100: pick contextual coach dialog
  const _coachResult100=isChampion?"champion":euro?.champion?"euro":isRelegated?"relegated":isPromoted?"promoted":playerPos<=numTeams/2?"good":"survival";/* [7.421.0 collaudo PO — screenshot fine S.19] IL MISTER NON SAPEVA DELL'EUROPA: la classificazione non aveva la voce «euro» — dopo una CHAMPIONS VINTA (senza scudetto) cadeva su «good» e diceva «Stagione discreta... puntiamo piu' in alto». Il presidente celebrava, il mister sminuiva: due voci dalla stessa serata che non si erano parlate. */
  const _ct100=player.coachTrust||50;
  const _cs100=player.coach?.style||null;
  const _coachPool100=SEASON_END_COACH.filter(d=>(d.result===_coachResult100||(d.result==="any"&&_ct100>=(d.trustMin||0)))&&(!d.style||d.style===_cs100));
  const _coachLine100=(_coachPool100.length>0?_coachPool100:SEASON_END_COACH.filter(d=>d.result===_coachResult100||d.result==="any"))[hashStr((player.name||"x")+String(season||1))%Math.max(1,(_coachPool100.length||1))];
  // Sprint 100: pick president dialog
  const _objsMet100=(player.seasonObjectives||[]).length>0&&(player.seasonObjectives||[]).filter(o=>/* [7.294.0] stesso metro degli altri siti */
    objDone(o,objCurrent(o,{g:playerStats.goals||0,a:playerStats.assists||0,m:playerStats.matches||0},(typeof _objSpent==="function")?_objSpent(player):{g:0,a:0,m:0},playerPos+1))
  ).length>=(player.seasonObjectives||[]).length;
  /* [7.285.0 #107 collaudo PO «presidente troppo severo o mi sbaglio?» — 2° di 18, qualificato in Coppa dei
     Campioni, 26 gol, e il presidente rispondeva «Stagione sufficiente — ma sufficiente non è quello per cui
     questo club paga»] Aveva ragione. Fuori dal titolo, TUTTO finiva in un unico secchio «good» (il ternario
     finiva perfino con `_objsMet100?"good":"good"`, cioè non guardava niente): un secondo posto con l'Europa
     in tasca e un quindicesimo posto salvo per un soffio ricevevano la stessa scaletta, e bastava un obiettivo
     personale mancato per sentirsi dire che «sufficiente non basta». Ora il piazzamento REALE conta: chi porta
     il club in Europa ha la sua voce, la metà bassa della classifica riapre il secchio «survival» che esisteva
     nei dati ed era irraggiungibile, e la metà alta resta «good». Stessa soglia del mister (metà classifica),
     così presidente e allenatore non si contraddicono nella stessa schermata. */
  const _presResult100=isChampion?"champion":isRelegated?"relegated":isPromoted?"promoted":euro?.champion?"euro":player.cup?.champion?"cup":_isEuroZone132?"europe":(playerPos<numTeams/2?"good":"survival");
  const _presRet445=player.retireAnnounced===(player.season||1)&&!(typeof window!=="undefined"&&window.__CPM_NO445);/* [collaudo PO «il presidente spara solo cazzate, mi sto ritirando»] all'addio annunciato parlano SOLO le righe di congedo (retire:true) — niente promesse di futuro; fuori dall'addio le righe di congedo non entrano mai. __CPM_NO445: interruttore test-only per riprodurre il rosso nel guardiano */
  const _presPool100=(function(){const _all=SEASON_END_PRESIDENT.filter(d=>(!!d.retire)===_presRet445&&(_presRet445?(d.result===_presResult100||d.result==="any"):d.result===_presResult100)&&(d.objMet===undefined||d.objMet===_objsMet100)&&(!d.prestige||(d.prestige==="high")===(club?.p>=80)));
    /* [7.421.0 collaudo PO «il presidente dice cose non realistiche, al Real Madrid non ci sono coppe europee?»] LA VARIANTE SPECIFICA BATTE LA GENERICA: la riga «in questa bacheca una coppa europea non c'era mai stata» e' scritta dal punto di vista del club piccolo, ma passava il filtro anche per una corazzata (p 88) e l'hash la sceglieva una volta su due, con la variante da big gia' pronta accanto. Se nel pool esiste una riga scritta PER il prestigio del club, le generiche si fanno da parte. Nell'addio, la riga del RISULTATO batte la generica «any». */
    if(_presRet445){const _sp=_all.filter(d=>d.result===_presResult100);return _sp.length?_sp:_all;}
    const _spec=_all.filter(d=>d.prestige);return _spec.length?_spec:_all;})();
  const _presLine100=(_presPool100.length>0?_presPool100:SEASON_END_PRESIDENT.filter(d=>_presRet445?d.retire:(d.result===_presResult100&&!d.retire)))[hashStr((player.name||"x")+"p"+String(season||1))%Math.max(1,(_presPool100.length||1))];
  const bestMatch=getBestSeasonMatch(player.matchHistory||[]);
  const contractYearsLeft=(player.contract?.duration||0);
  const contractExpiredNow=contractYearsLeft<=0;

  // sorted standings already from doAdvanceWeek
  const sorted=finalStandings||[];
  const playerClubId=club?.id||club?.n;
  const isPlayerRow=t=>t.id===playerClubId||(t.n||t.name)===(club?.n||club?.name);

  const renderRow=(t,i)=>(
    <div key={t.id||i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:6,
      background:isPlayerRow(t)?"#eff6ff":i>=numTeams-3?"#fff1f2":i<3?"#fefce8":"transparent",
      borderLeft:i===0?"3px solid #fde68a":i>=numTeams-3?"3px solid #fca5a5":"3px solid transparent",
      marginBottom:2}}>
      <div style={{fontSize:11,fontWeight:700,color:i<3?TH.warning:TH.muted,width:18,textAlign:"right"}}>{i+1}</div>
      <div style={{flex:1,fontSize:11,fontWeight:isPlayerRow(t)?700:400,color:isPlayerRow(t)?TH.primary:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
        {t.n||t.name}{isPlayerRow(t)?" 👈":""}
      </div>
      <div style={{fontSize:10,color:TH.muted,minWidth:60,textAlign:"right"}}>{t.played}G {t.gf}-{t.ga}</div>
      <div style={{fontSize:12,fontWeight:900,color:TH.text,minWidth:28,textAlign:"right"}}>{t.pts}</div>
    </div>
  );

  // Show top-3, player row if outside top-3, bottom-3 (with ellipsis separators)
  let rows=[];
  if(sorted.length>0){
    const topN=sorted.slice(0,3);
    const botN=sorted.slice(-3);
    const playerInTop=playerPos<3;
    const playerInBot=playerPos>=sorted.length-3;
    rows=[...topN.map((t,i)=>renderRow(t,i))];
    if(!playerInTop&&!playerInBot){
      rows.push(<div key="sep1" style={{textAlign:"center",fontSize:10,color:TH.faint,padding:"2px 0"}}>…</div>);
      rows.push(renderRow(sorted[playerPos],playerPos));
    }
    if(!playerInBot||(sorted.length<=6)){
      if(!playerInTop&&!playerInBot)rows.push(<div key="sep2" style={{textAlign:"center",fontSize:10,color:TH.faint,padding:"2px 0"}}>…</div>);
      botN.forEach((t,i)=>{ const ri=sorted.length-3+i; if(ri>2&&ri!==playerPos)rows.push(renderRow(t,ri)); });
    }else if(sorted.length>3){
      rows.push(<div key="sep2" style={{textAlign:"center",fontSize:10,color:TH.faint,padding:"2px 0"}}>…</div>);
      botN.forEach((t,i)=>{ const ri=sorted.length-3+i; if(ri>2)rows.push(renderRow(t,ri)); });
    }
  }

  // Sprint 87: obiettivi progress
  const _spEnd=(typeof _objSpent==="function")?_objSpent(player||{}):{g:0,a:0,m:0};/* [7.294.0] obiettivi del club: al netto delle maglie precedenti */
  const objs=(seasonObjectives||[]).map(obj=>{
    const cur=objCurrent(obj,{g:playerStats.goals,a:playerStats.assists,m:playerStats.matches},_spEnd,playerPos>=0?playerPos+1:99);
    const done=objDone(obj,cur);
    const pct=obj.type==="standing"?Math.min(100,Math.round((obj.target/Math.max(cur,1))*100)):Math.min(100,Math.round((cur/obj.target)*100));
    return{...obj,cur,done,pct};
  });

  // Sprint 87: promo/retro dalla lega
  const promoTeams=sorted.length>=6?sorted.slice(0,3):[];
  const relegTeams=sorted.length>=6?sorted.slice(-3):[];

  // Sprint 87: awards summary rows
  const awardRows=awards?[
    /* [7.289.0] il Trofeo d'Oro è EUROPEO (l'etichetta diceva «della lega») e i numeri sono quelli delle
       classifiche europee — gol di campionato — non il totale di tutte le competizioni, che rendeva la riga
       incoerente col podio subito sopra. */
    awards.palloneOro?.playerWins&&{e:"🏆",label:"Trofeo d'Oro",sub:`${awards.playerLeagueGoals??playerStats.goals}⚽ ${awards.playerLeagueAssists??playerStats.assists}🎯 · miglior giocatore d'Europa`},
    awards.scarpaOro?.playerWins&&{e:"👟",label:"Re dei Bomber",sub:`Capocannoniere d'Europa con ${awards.playerLeagueGoals??playerStats.goals} gol`},
    awards.youngPlayer?.playerWins&&{e:"🌟",label:"Astro Nascente",sub:`Miglior giovane U23 · ${playerStats.goals}⚽ ${playerStats.assists}🎯`},
    awards.seasonRecord?.beaten&&{e:"📈",label:"Record stagionale!",sub:`${playerStats.goals} gol — nuovo primato di lega`},
    isChampion&&{e:"🥇",label:"Campione di lega",sub:`${club?.lg||"lega"} — trofeo conquistato`},
  ].filter(Boolean):[];

  // Sprint 87: euro recap
  const euroActive=euro&&euro.active&&(euro.groupResults||[]).length>0;
  const euroPhaseLabel=euro?.phase==="group"?"Fase a gironi":euro?.phase==="r16"?"Ottavi di finale":euro?.phase==="quarti"?"Quarti di finale":euro?.phase==="sf"?"Semifinale":euro?.phase==="final"?"Finale":euro?.phase==="eliminated"?"Eliminato":euro?.phase==="champion"?"Campione":"";/* [6.45.0 RC] mancava il caso "quarti" (tornava "") + fallback champion */
  const euroChamp=euro?.champion;
  const euroElim=euro?.eliminated&&!euro?.champion;

  // [7.25.0 collaudo PO «la vittoria delle coppe EUROPEE o con la NAZIONALE deve avere maggiore enfasi: una
  //   Champions è molto più prestigiosa di un campionato!»] GERARCHIA DEI TROFEI: il trionfo europeo di club
  //   e quello in Nazionale (Mondiale/Europeo/Coppa Nazioni, da worldMemory della stagione) aprono il fine
  //   stagione con un BANNER PREMIUM dedicato, SOPRA il titolo di lega — colori della competizione, copy epico.
  const _natWin25=(player.worldMemory||[]).find(m=>m&&m.season===season&&m.won&&(m.type==="euro_mondiale"||m.type==="nations_cup"))||null;
  const _celebrate83=isChampion||isPromoted||_isEuroZone132||euroChamp||!!_natWin25;/* [7.8.3] coriandoli sui traguardi positivi · [7.25.0] +trionfi europei/nazionali */
  return(
    <div style={{width:"100%"}}>
      {_celebrate83&&(<div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:60}}>
        {Array.from({length:44}).map((_,i)=>{const _cc=["#f59e0b","#22c55e","#60a5fa","#f472b6","#facc15","#ef4444",club?.c||"#22c55e"];return <span key={i} style={{position:"absolute",left:((i*47)%100)+"%",top:"-8%",width:8,height:13,borderRadius:2,background:_cc[i%_cc.length],animation:`confettiFall ${(2.6+(i%5)*0.7).toFixed(1)}s linear ${((i%9)*0.4).toFixed(2)}s infinite`,opacity:0.92}}/>;})}
      </div>)}
      {/* [7.25.0] BANNER PREMIUM — trionfo europeo di club / trionfo in Nazionale: PRIMA di tutto il resto */}
      {(euroChamp||_natWin25)&&(()=>{
        const _CFG={UCL:{bg:"linear-gradient(150deg,#0a1c46,#1d4ed8 45%,#0a1c46)",fg:"#dbeafe",title:"CAMPIONI D'EUROPA!",sub:"Il tetto d'Europa: la notte più prestigiosa che il calcio conosca."},
          UEL:{bg:"linear-gradient(150deg,#431c03,#ea7c1a 45%,#431c03)",fg:"#ffedd5",title:"L'EUROPA È VOSTRA!",sub:"Un trofeo continentale: vale più di qualsiasi campionato."},
          UECL:{bg:"linear-gradient(150deg,#26103f,#7c3aed 45%,#26103f)",fg:"#ede9fe",title:"CAMPIONI DI CONFERENCE!",sub:"La prima stella europea: una notte che vale una storia intera."}};
        const _isNat=!!_natWin25&&!euroChamp;
        const _natTitle=_natWin25?(_natWin25.type==="nations_cup"?"COPPA DELLE NAZIONI!":(_natWin25.type_em==="Mondiale"?"CAMPIONI DEL MONDO!":"CAMPIONI D'EUROPA!")):"";
        const _cfg=euroChamp?(_CFG[euro?.competition]||_CFG.UCL):null;
        return(
        <div style={{marginTop:4,marginBottom:12,borderRadius:18,padding:"22px 14px 20px",textAlign:"center",background:_isNat?"linear-gradient(150deg,#3b2a07,#d4a017 45%,#3b2a07)":_cfg.bg,boxShadow:"0 10px 34px rgba(0,0,0,0.35)"}}>
          <div style={{fontSize:56,lineHeight:1,animation:"pulse87 1.2s ease-in-out infinite"}}>🏆</div>
          <div style={{fontSize:10.5,letterSpacing:4,fontWeight:800,color:"rgba(255,255,255,0.72)",marginTop:8,textTransform:"uppercase"}}>{_isNat?((player.nation||"Nazionale")+" · Nazionale"):(euro?.competition==="UCL"?"Korward Champions Cup":euro?.competition==="UEL"?"Korward Europa Cup":"Korward Conference Cup")}</div>
          <div style={{fontSize:24,fontWeight:900,color:"#fff",marginTop:3,letterSpacing:0.5,textShadow:"0 2px 12px rgba(0,0,0,0.4)"}}>{_isNat?_natTitle:_cfg.title}</div>
          <div style={{fontSize:12.5,color:_isNat?"#fde68a":_cfg.fg,marginTop:6,fontStyle:"italic",lineHeight:1.5}}>{_isNat?"Con la maglia della tua nazione sul tetto del torneo: da oggi sei leggenda.":_cfg.sub}</div>
          {!_isNat&&<div style={{marginTop:8,fontSize:11.5,fontWeight:800,color:"rgba(255,255,255,0.88)"}}>{(club?.n||club?.name||"Il club")} entra nella storia — nessun campionato vale una notte così.</div>}
          {euroChamp&&_natWin25&&<div style={{marginTop:8,fontSize:12,fontWeight:900,color:"#fde68a"}}>… e in Nazionale: {_natTitle} Una stagione irripetibile.</div>}
        </div>);})()}
      {/* Header cinematico Sprint 87 */}
      <div style={{textAlign:"center",marginBottom:14,paddingTop:6,
        background:isChampion?"linear-gradient(160deg,#fef9c3,#fef08a,#fef9c3)":(isPromoted||_isEuroZone132)?"linear-gradient(160deg,#f0fdf4,#bbf7d0,#f0fdf4)":isRelegated?"linear-gradient(160deg,#fff1f2,#fecaca,#fff1f2)":"transparent",
        borderRadius:16,padding:"16px 8px 12px",marginTop:4}}>
        <div style={{fontSize:isChampion?52:44,marginBottom:6,display:"inline-block",
          animation:isChampion||isPromoted||_isEuroZone132?"pulse87 1.2s ease-in-out infinite":"none"}}>
          {statusEmoji}
        </div>
        <h1 style={{fontSize:20,fontWeight:900,margin:"0 0 4px",color:TH.text}}>Fine Stagione {season}</h1>
        <p style={{color:TH.muted,fontSize:12,margin:"0 0 6px"}}>{club?.n||club?.name} · {club?.lg||"Pro"}</p>
        <div style={{fontSize:13,fontWeight:800,fontStyle:"italic",color:isChampion?"#713f12":isRelegated?"#9f1239":(isPromoted||_isEuroZone132)?"#166534":TH.muted}}>{headline}</div>
        {isChampion&&<div style={{marginTop:8,fontSize:13,fontWeight:800,color:TH.txAmber,letterSpacing:0.5}}>🎊 Campioni! La lega è vostra! 🎊</div>}
        {/* [7.8.3 collaudo PO «la qualificazione in Europa va festeggiata, soprattutto per una piccola come la Salernitana!»] festeggiamento dedicato per la qualificazione europea (e la promozione), con enfasi per le piazze piccole (prestigio basso) */}
        {!isChampion&&_isEuroZone132&&(()=>{const _small=(club?.p||60)<62;const _comp=_isCL132?"Coppa dei Campioni":_isEL132?"Coppa Europa":"Coppa Conference";return(
          <div style={{marginTop:8}}>
            <div style={{fontSize:15,fontWeight:900,color:TH.txGreen,letterSpacing:0.4}}>{_small?"🎉 IMPRESA STORICA! 🎉":"🎉 IN EUROPA! 🎉"}</div>
            <div style={{marginTop:3,fontSize:12.5,fontWeight:800,color:TH.txGreen}}>{club?.n||club?.name} qualificato in {_comp}!</div>
            {_small&&<div style={{marginTop:2,fontSize:11,fontWeight:700,color:TH.txGreen,fontStyle:"italic"}}>Una notte che questa piazza ricorderà per sempre.</div>}
          </div>);})()}
        {!isChampion&&isPromoted&&<div style={{marginTop:8,fontSize:15,fontWeight:900,color:TH.txGreen,letterSpacing:0.4}}>🎉 PROMOSSI! Si sale di categoria! 🎉</div>}
        {/* [7.157.0] «a un soffio dall'Europa»: 8° = subito sotto lo spot Conference (7°) → l'Europa non parte. Chiarisce PERCHÉ, così non sembra un bug. */}
        {_justMissedEuro132&&<div style={{marginTop:8}}>
          <div style={{fontSize:13.5,fontWeight:900,color:TH.txAmber,letterSpacing:0.3}}>🎯 A un soffio dall'Europa!</div>
          <div style={{marginTop:3,fontSize:11.5,fontWeight:700,color:TH.muted,fontStyle:"italic"}}>8° posto — la zona Conference chiude al 7°. Bastava una posizione: l'anno prossimo l'Europa è a un passo.</div>
        </div>}
      </div>
      {/* Sprint 100: narrative + coach dialog */}
      <Card style={{marginBottom:8,padding:"12px 14px"}}>
        <div style={{fontSize:11,color:TH.text,lineHeight:1.55,marginBottom:_coachLine100?10:0,fontStyle:"italic"}}>{narrative}</div>
        {_coachLine100&&<div style={{borderTop:"1px solid "+TH.cardBorder,paddingTop:10}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
            <NpcFaceCoach coachName={player.coach?.name||"Mister"} size={38}/>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:TH.muted,marginBottom:4}}>{player.coach?.name||"Il Mister"} · fine stagione</div>
              <div style={{fontSize:12,color:TH.text,fontStyle:"italic",lineHeight:1.5}}>{_coachLine100.txt}</div>
            </div>
          </div>
        </div>}
      </Card>
      {/* Sprint 100: president dialog */}
      {_presLine100&&<Card style={{marginBottom:8,padding:"12px 14px",background:"linear-gradient(135deg,#1c0d04,#2d1507)",border:"1px solid rgba(234,179,8,0.3)"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{fontSize:26,lineHeight:1}}>🏛️</div>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:"#fde68a",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Il Presidente — fine stagione</div>
            <div style={{fontSize:12,color:"#fef3c7",fontStyle:"italic",lineHeight:1.5}}>{_presLine100.txt}</div>
          </div>
        </div>
      </Card>}
      <style>{`@keyframes pulse87{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}`}</style>

      {/* Status banner + stats */}
      <Card style={{marginBottom:12,padding:"12px 16px"}} bg={bgColor} border={borderColor}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:900,color:TH.text}}>{statusEmoji} {statusLabel}</div>
          <div style={{fontSize:10,color:TH.muted}}>Pos. {playerPos+1}/{numTeams}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,textAlign:"center"}}>
          {[{l:"Partite",v:playerStats.matches,e:"📅"},{l:"Gol",v:playerStats.goals,e:"⚽"},{l:"Assist",v:playerStats.assists,e:"🎯"},{l:"Livello",v:playerStats.ovr,e:"⭐"}].map(s=>(
            <div key={s.l}>
              <div style={{fontSize:20}}>{s.e}</div>
              <div style={{fontSize:22,fontWeight:900,color:TH.text}}>{s.v}</div>
              <div style={{fontSize:10,color:TH.muted}}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* [7.11.0 Sprint «Emozioni»] IL FILM DELLA STAGIONE — i momenti VERI dal diario + la miglior partita */}
      {(()=>{
        const _sn=player.season||1;
        const _prio={cup_trophy:0,first_national:1,first_national_goal:1,story:1,milestone:2,pledge:3};/* [7.14.0] i capitoli della storia entrano nel film */
        const _mo=(player.diary||[]).filter(d=>d&&d.season===_sn).sort((a,b)=>((_prio[a.type]!=null?_prio[a.type]:4)-(_prio[b.type]!=null?_prio[b.type]:4))).slice(0,6).sort((a,b)=>(a.week||0)-(b.week||0));
        const _best=(player.matchHistory||[]).filter(m=>m&&m.rating).sort((a,b)=>(b.rating||0)-(a.rating||0))[0];
        if(_mo.length===0&&!_best)return null;
        return(
        <Card style={{marginBottom:12,padding:"14px 16px"}}>
          <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>🎬 Il film della stagione</div>
          {_best&&<div style={{fontSize:11,color:TH.text,padding:"6px 0",borderBottom:`1px dashed ${TH.cardBorder}`}}><strong>⭐ La partita dell'anno:</strong> {_best.homeScore}-{_best.awayScore} vs {_best.opponent} — voto {_best.rating}{(_best.goals||0)>0?` · ${_best.goals}⚽`:""}{(_best.assists||0)>0?` · ${_best.assists}🎯`:""}</div>}
          {_mo.map((d,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"6px 0",borderBottom:i<_mo.length-1?`1px dashed ${TH.cardBorder}`:"none"}}>
            <span style={{fontSize:14}}>{d.e||"📌"}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:800,color:d.color||TH.text}}>{d.headline}</div>
              {d.body&&<div style={{fontSize:10,color:TH.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{String(d.body).slice(0,90)}</div>}
            </div>
            <span style={{fontSize:9,color:TH.faint,flexShrink:0}}>W{d.week||"–"}</span>
          </div>))}
        </Card>);})()}

      {/* Sprint 87: Premiazioni */}
      {awardRows.length>0&&(
        <Card style={{marginBottom:12,padding:"12px 14px",background:TH.bgAmber,border:"1px solid #fde68a"}}>
          <div style={{fontSize:10,color:TH.txAmber,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,fontWeight:700}}>🎖 Premiazioni stagione {season}</div>
          {awardRows.map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:i<awardRows.length-1?"1px solid #fde68a":"none"}}>
              <span style={{fontSize:22}}>{a.e}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:800,color:TH.txAmber}}>{a.label}</div>
                <div style={{fontSize:10,color:TH.txAmber}}>{a.sub}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Sprint 87: Obiettivi stagione */}
      {objs.length>0&&(
        <Card style={{marginBottom:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>🎯 Obiettivi stagione</div>
          {objs.map((obj,i)=>(
            <div key={i} style={{marginBottom:i<objs.length-1?10:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:15}}>{obj.done?"✅":"❌"}</span>
                  <span style={{fontSize:11,fontWeight:obj.done?700:400,color:obj.done?TH.text:TH.muted}}>{obj.label}</span>
                </div>
                <span style={{fontSize:10,color:obj.done?"#16a34a":"#dc2626",fontWeight:700}}>
                  {obj.type==="standing"?`${obj.cur}°/${obj.target}°`:`${obj.cur}/${obj.target}`}
                </span>
              </div>
              <div style={{height:5,borderRadius:3,background:TH.cardBorder,overflow:"hidden"}}>
                <div style={{height:"100%",width:obj.pct+"%",background:obj.done?"#22c55e":"#f97316",borderRadius:3,transition:"width 0.6s ease"}}/>
              </div>
              {obj.done&&obj.bonus&&(
                <div style={{fontSize:10,color:"#16a34a",marginTop:2}}>
                  +{[obj.bonus.morale&&`${obj.bonus.morale} morale`,obj.bonus.coachTrust&&`${obj.bonus.coachTrust} fiducia`,obj.bonus.popularity&&`${obj.bonus.popularity} popolarità`].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
          ))}
        </Card>
      )}

      {/* Fase carriera + narrativa */}
      <Card style={{marginBottom:12,padding:"12px 14px",background:phase.bg,border:"1px solid "+phase.border}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <span style={{fontSize:22}}>{phase.e}</span>
          <div>
            <div style={{fontSize:12,fontWeight:800,color:phase.col}}>{phase.label} · {player.age} anni</div>
            <div style={{fontSize:10,color:TH.muted}}>{phase.desc}</div>
          </div>
        </div>
        <div style={{fontSize:11,color:TH.text,lineHeight:1.55,fontStyle:"italic",borderTop:"1px solid "+phase.border,paddingTop:8,marginTop:2}}>"{narrative}"</div>
      </Card>

      {/* Momento della stagione */}
      {bestMatch&&(bestMatch.goals>0||bestMatch.assists>0||(bestMatch.rating||0)>=8)&&(
        <Card style={{marginBottom:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>⚡ Momento della stagione</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:26,lineHeight:1}}>{bestMatch.goals>=2?"🔥":bestMatch.goals>=1?"⚽":bestMatch.assists>=1?"🎯":"⭐"}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:TH.text}}>vs {bestMatch.opponent||bestMatch.oppAbbr||"?"} · {bestMatch.homeScore}-{bestMatch.awayScore}</div>
              <div style={{fontSize:10,color:TH.muted}}>{bestMatch.goals>0?bestMatch.goals+"⚽ ":""}{bestMatch.assists>0?bestMatch.assists+"🎯 ":""}{bestMatch.rating?"★ "+bestMatch.rating:""} · {bestMatch.won?"Vittoria":bestMatch.drew?"Pareggio":"Sconfitta"}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Sprint 87: Europa recap */}
      {euroActive&&(
        <Card style={{marginBottom:12,padding:"12px 14px",background:euro.competition==="UCL"?"#eff6ff":euro.competition==="UEL"?"#fff7ed":"#f5f3ff",border:"1px solid "+(euro.competition==="UCL"?"#bfdbfe":euro.competition==="UEL"?"#fed7aa":"#ddd6fe")}}>
          <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>
            {euro.competition==="UCL"?"⭐ Korward Champions Cup":euro.competition==="UEL"?"🟡 Korward Europa Cup":"🟣 Korward Conference Cup"}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:700,color:TH.text}}>{euroPhaseLabel}</span>
            <span style={{fontSize:11,color:TH.muted}}>{euro.pts||0} pt nel girone</span>
          </div>
          {(euro.groupResults||[]).length>0&&(
            <div style={{fontSize:10,color:TH.muted,marginBottom:6}}>
              {(euro.groupResults||[]).map((r,i)=>{
                const opp=r.opp||r.opponent||"?";
                const hs=r.hs??r.homeScore??"-"; const as=r.as??r.awayScore??"-";
                const res=r.won?"V":r.drew?"P":"S";
                return <span key={i} style={{marginRight:8,color:r.won?"#16a34a":r.drew?"#d97706":"#dc2626"}}>{res} vs {opp} ({hs}-{as})</span>;
              })}
            </div>
          )}
          {euroChamp&&<div style={{fontSize:11,fontWeight:700,color:TH.txAmber,background:"#fef08a",padding:"4px 8px",borderRadius:6,textAlign:"center"}}>🏆 Campione {euroSig(euro.competition)}!</div>}
          {euroElim&&(()=>{
            /* [7.302.0 collaudo PO «frase sgrammaticata e ripetitiva sull'eliminazione dalla KCC»]
               la riga componeva «Eliminati in fase {label}» con label = «Eliminato» quando `euro.phase`
               vale già "eliminated" (uscita dal girone) → «Eliminati in fase eliminato.», sgrammaticata e
               ripetitiva del titolo qui sopra. Ora dice DOVE si è usciti, derivandolo dai fatti: l'ultimo
               turno KO disputato, oppure il girone (col bilancio vero: punti e gare). */
            const _ko=(euro.koResults||[]);
            const _last=_ko.length?String(_ko[_ko.length-1].phase||""):"";
            const _OUT={r16:"agli ottavi di finale",quarti:"ai quarti di finale",sf:"in semifinale",final:"in finale"};
            const _gp=(euro.groupResults||[]).length;
            const _txt=_OUT[_last]
              ? `Corsa finita ${_OUT[_last]}.`
              : (_gp?`Fuori nella fase a gironi: ${euro.pts||0} punti in ${_gp} gare.`:"Corsa finita nella fase a gironi.");
            return <div style={{fontSize:12,color:TH.muted,fontStyle:"italic"}}>{_txt}</div>;
          })()}
          {euro.qualified&&!euroChamp&&!euroElim&&<div style={{fontSize:12,color:"#16a34a",fontWeight:700}}>✅ Qualificati alla fase successiva</div>}
        </Card>
      )}

      {/* Sprint 87: Rivale */}
      {rival&&(
        <Card style={{marginBottom:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>⚔️ Il tuo rivale — {rival.name}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:4,alignItems:"center",textAlign:"center"}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:TH.primary}}>{player.name}</div>
              <div style={{fontSize:10,color:TH.muted}}>{club?.n||"–"}</div>
              <div style={{fontSize:20,fontWeight:900,color:TH.text,margin:"4px 0"}}>{playerStats.goals}<span style={{fontSize:11}}>⚽</span></div>
              <div style={{fontSize:10,color:TH.muted}}>OVR {playerStats.ovr}</div>
            </div>
            <div style={{fontSize:13,fontWeight:900,color:TH.muted}}>VS</div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#dc2626"}}>{rival.name}</div>
              <div style={{fontSize:10,color:TH.muted}}>{rival.club?.n||"–"}</div>
              <div style={{fontSize:20,fontWeight:900,color:TH.text,margin:"4px 0"}}>{rival.goals||0}<span style={{fontSize:11}}>⚽</span></div>
              <div style={{fontSize:10,color:TH.muted}}>OVR {rival.ovr||"–"}</div>
            </div>
          </div>
          <div style={{textAlign:"center",marginTop:6,fontSize:10,color:TH.muted,fontStyle:"italic"}}>
            {rival.relationship==="amico"?"🤝 Siete diventati amici nel tempo":rival.relationship==="rispettato"?"🫡 Si rispettano a vicenda":"⚡ La rivalità continua"}
          </div>
        </Card>
      )}

      {/* Champion banner */}
      {champion&&!isChampion&&(
        <Card style={{marginBottom:12,padding:"10px 14px",textAlign:"center"}} bg={TH.bgAmber} border="#fde68a">
          <div style={{fontSize:12,fontWeight:700,color:TH.txAmber}}>🏆 Campione: <strong>{champion.n||champion.name}</strong> · {champion.pts} pt</div>
        </Card>
      )}

      {/* Standings */}
      {sorted.length>0&&(
        <Card style={{marginBottom:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>📊 Classifica finale</div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:12,fontSize:10,color:TH.faint,marginBottom:4,paddingRight:4}}>
            <span>PG GF-GA</span><span style={{minWidth:28,textAlign:"right"}}>PT</span>
          </div>
          {rows}
          <div style={{display:"flex",gap:10,marginTop:8,fontSize:10,flexWrap:"wrap"}}>
            {_isYouth99?<span style={{color:"#f59e0b"}}>🏆 Campione Primavera</span>:_isTopFlight132?(
              <>
                <span style={{color:"#f59e0b"}}>🏆 Campione</span>
                <span style={{color:"#3b82f6"}}>🌍 CL (1-4)</span>
                <span style={{color:"#f97316"}}>🟠 EL (5-6)</span>
                <span style={{color:"#22c55e"}}>🟢 Conf. (7)</span>
              </>
            ):<span style={{color:TH.warning}}>🟡 Top 3 · promozione</span>}
            {!_isYouth99&&<span style={{color:TH.danger}}>🔴 Ultimi 3 · retrocessione</span>}
          </div>
        </Card>
      )}

      {/* Sprint 87/132: Movimenti lega — differenziato per top-flight vs lower · [6.99.0] MAI per le Primavera (niente coppe europee né movimenti) */}
      {sorted.length>0&&!_isYouth99&&(
        <Card style={{marginBottom:12,padding:"12px 14px"}}>
          {_isTopFlight132?(
            <>
              <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>🌍 Qualificazioni Europee</div>
              {[{label:`🏆/🌍 Champions Cup`,color:"#3b82f6",teams:sorted.slice(0,4)},{label:"🟠 Europa Cup",color:"#f97316",teams:sorted.slice(4,6)},{label:"🟢 Conference Cup",color:"#22c55e",teams:sorted.slice(6,7)}].map(({label,color,teams})=>(
                <div key={label} style={{marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color,marginBottom:3}}>{label}</div>
                  {teams.map((t,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"2px 0",fontSize:11}}>
                      <span style={{color,fontWeight:700,width:20,textAlign:"right"}}>{sorted.indexOf(t)+1}°</span>
                      <span style={{flex:1,color:isPlayerRow(t)?TH.primary:TH.text,fontWeight:isPlayerRow(t)?700:400}}>{t.n||t.name}{isPlayerRow(t)?" 👈":""}</span>
                      <span style={{color:TH.muted,fontSize:10}}>{t.pts}pt</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{borderTop:"1px solid "+TH.cardBorder,paddingTop:8}}>
                <div style={{fontSize:12,fontWeight:700,color:"#dc2626",marginBottom:3}}>⬇️ {_relegDestLg99?`Retrocesse in ${_relegDestLg99}`:"Retrocesse"}</div>
                {relegTeams.map((t,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"2px 0",fontSize:11}}>
                    <span style={{color:"#dc2626",fontWeight:700,width:20,textAlign:"right"}}>{sorted.length-2+i}°</span>
                    <span style={{flex:1,color:isPlayerRow(t)?TH.primary:TH.text,fontWeight:isPlayerRow(t)?700:400}}>{t.n||t.name}{isPlayerRow(t)?" 👈":""}</span>
                    <span style={{color:TH.muted,fontSize:10}}>{t.pts}pt</span>
                  </div>
                ))}
              </div>
            </>
          ):(
            promoTeams.length>0&&(
              <>
                <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>🔀 Movimenti di lega</div>
                <div style={{marginBottom:6}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#16a34a",marginBottom:4}}>⬆️ {_promoDestLg99?`Promosse in ${_promoDestLg99}`:"Promosse alla lega superiore"}</div>
                  {promoTeams.map((t,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",fontSize:11}}>
                      <span style={{color:"#16a34a",fontWeight:700,width:16,textAlign:"right"}}>{i+1}°</span>
                      <span style={{flex:1,color:isPlayerRow(t)?TH.primary:TH.text,fontWeight:isPlayerRow(t)?700:400}}>{t.n||t.name}{isPlayerRow(t)?" 👈":""}</span>
                      <span style={{color:TH.muted,fontSize:10}}>{t.pts}pt</span>
                    </div>
                  ))}
                </div>
                <div style={{borderTop:"1px solid "+TH.cardBorder,paddingTop:8}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#dc2626",marginBottom:4}}>⬇️ {_relegDestLg99?`Retrocesse in ${_relegDestLg99}`:"Retrocesse alla lega inferiore"}</div>
                  {relegTeams.map((t,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",fontSize:11}}>
                      <span style={{color:"#dc2626",fontWeight:700,width:16,textAlign:"right"}}>{sorted.length-2+i}°</span>
                      <span style={{flex:1,color:isPlayerRow(t)?TH.primary:TH.text,fontWeight:isPlayerRow(t)?700:400}}>{t.n||t.name}{isPlayerRow(t)?" 👈":""}</span>
                      <span style={{color:TH.muted,fontSize:10}}>{t.pts}pt</span>
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </Card>
      )}

      {/* Albo d'oro */}
      {trophies.length>0&&(
        <Card style={{marginBottom:12,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>🏆 Albo d'oro</div>
          {trophies.map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:i<trophies.length-1?"1px solid "+TH.cardBorder:"none"}}>
              <span style={{fontSize:16}}>🏆</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:TH.text}}>Stagione {t.season}</div>
                <div style={{fontSize:10,color:TH.muted}}>{t.club} · {compLbl(t.league)}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Contract status */}
      <div style={{marginBottom:8,padding:"8px 12px",borderRadius:8,background:contractExpiredNow?"#fff1f2":contractYearsLeft===1?"#fff7ed":"#f0fdf4",border:"1px solid "+(contractExpiredNow?"#fca5a5":contractYearsLeft===1?"#fed7aa":"#bbf7d0"),display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:16}}>{contractExpiredNow?"❌":contractYearsLeft===1?"⚠️":"📄"}</span>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:contractExpiredNow?"#dc2626":contractYearsLeft===1?"#d97706":"#16a34a"}}>
            {contractExpiredNow?"Contratto scaduto — tratta il rinnovo o trova una squadra":contractYearsLeft===1?"Ultimo anno di contratto — occhio alle offerte":"Contratto attivo · "+contractYearsLeft+" ann"+(contractYearsLeft===1?"o":"i") + " rimanent"+(contractYearsLeft===1?"e":"i")}
          </div>
          {(player.contract?.wage||0)>0&&<div style={{fontSize:10,color:TH.muted}}>{_fmtWageY133(player.contract.wage||0)} / anno</div>}
        </div>
      </div>

      {onRetire&&(player.age||17)>=35&&(
        <div style={{marginBottom:8,padding:"10px 14px",borderRadius:10,background:TH.bgAmber,border:"1px solid #fde68a",textAlign:"center"}}>
          <div style={{fontSize:11,color:TH.txAmber,marginBottom:6}}>Hai {player.age} anni. Vuoi concludere qui la tua carriera con una cerimonia d'addio?</div>
          <Btn onClick={onRetire} v="danger" fw>👟 Ritirati — Fine di un'era</Btn>
        </div>
      )}
      {/* [7.286.0 direttiva PO «i messaggi toast a inizio stagione che arrivano a cascata non devono permettere
          di avviare subito la nuova stagione altrimenti si mischia tutto»] il rollover accoda una raffica di
          notifiche (premi, crescita, economia, movimenti): partendo prima che finisca, quelle della stagione
          CHIUSA finivano sopra la schermata di quella NUOVA. Ora il pulsante aspetta che il riepilogo sia
          scorso — e la coda 7.286.0, che comprime le raffiche, fa sì che l'attesa duri pochi secondi. */}
      {farewell&&onRetire?(
        <Btn onClick={onRetire} v="danger" fw disabled={!!notifBusy} style={{padding:"16px",fontSize:15,marginTop:4,...(notifBusy?{opacity:.55}:{})}}>
          {notifBusy?"📣 Riepilogo in corso…":"🏁 Il giorno dell'addio →"}
        </Btn>
      ):(
      <Btn onClick={onNewSeason} v="primary" fw disabled={!!notifBusy} style={{padding:"16px",fontSize:15,marginTop:4,...(notifBusy?{opacity:.55}:{})}}>
        {notifBusy?"📣 Riepilogo in corso…":`🆕 Inizia Stagione ${season+1} →`}
      </Btn>
      )}
    </div>
  );
}

/* ========================================
   CLUB PRESENTATION SCREEN  (Sprint 3 — S3-A)
   Shown after any new signing (transfer or first pro contract)
======================================== */
function ClubPresentationScreen({club,contractType,playerName,onContinue}){
  const col=club?.col||club?.c||TH.primary;
  const stadiumName=getStadiumName(club);
  const COACH_QUOTES=[
    "Sei esattamente il profilo che cercavamo. Benvenuto in famiglia.",
    "Ho visto le tue partite. So già che farai grandi cose con noi.",
    "Qui troverai il campo che meriti. Dai il massimo ogni giorno.",
    "Questo club ha bisogno di giocatori con la tua mentalità. Vai.",
    "Punta a diventare il protagonista di questa stagione. Ci conto.",
    "Non deludermi. So che ne sei capace. Buona fortuna.",
  ];
  const ATMOS=[
    "📸 I fotografi dei media ti attendono fuori dal centro sportivo.",
    "📣 La curva ha già lanciato un coro con il tuo nome.",
    "🤝 Il presidente ti stringe la mano davanti alle telecamere.",
    "🏟️ Il tuo numero di maglia è già in vendita allo store del club.",
    "📰 I giornalisti fanno a gara per farti le prime domande.",
    "👥 Decine di tifosi aspettavano fuori dal centro sportivo.",
  ];
  const qIdx=hashStr((club?.id||"x")+(playerName||""))%COACH_QUOTES.length;
  const aIdx=hashStr((club?.n||"x")+(contractType||""))%ATMOS.length;
  const type=(contractType||"").toLowerCase();
  const verb=type.includes("prest")?"in prestito al":type.includes("primo")||type.includes("profess")?"firma il primo contratto con":"firma per";
  const headline=`${playerName} ${verb} ${club?.n||"il club"}!`;
  const[tick,setTick]=useState(0);
  useEffect(()=>{if(tick>=60)return;const t=setTimeout(()=>setTick(n=>n+1),70);return()=>clearTimeout(t);},[tick]);
  const pct=Math.round((tick/60)*100);
  return(
    <div style={{width:"100%"}}>
      {/* Club hero banner */}
      <div style={{width:"100%",background:`linear-gradient(135deg,${col}28,${col}0a)`,border:`1px solid ${col}55`,borderRadius:16,padding:"18px 16px",textAlign:"center",marginBottom:12}}>
        <div style={{fontSize:10,color:TH.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>🎉 Ufficiale</div>
        <TeamBadge team={club} size={64}/>
        <h1 style={{fontSize:20,fontWeight:900,margin:"10px 0 2px",color:TH.text}}>{club?.n||club?.name}</h1>
        <div style={{fontSize:11,color:TH.muted,marginBottom:6}}>{club?.lg||club?.nat||"Professionismo"}</div>
        <div style={{fontSize:11,color:col,fontWeight:700,padding:"3px 10px",background:`${col}22`,borderRadius:8,display:"inline-block"}}>{contractType}</div>
      </div>
      {/* Headline */}
      <Card bg={TH.bgGreen} border="#bbf7d0" style={{marginBottom:10,padding:"10px 14px"}}>
        <div style={{fontSize:10,color:TH.success,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>📰 Manchette</div>
        <div style={{fontSize:13,fontWeight:700,color:TH.text,lineHeight:1.4}}>{headline}</div>
      </Card>
      {/* Stadium + prestige */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <Card style={{padding:"10px 12px"}}>
          <div style={{fontSize:10,color:TH.muted,marginBottom:3}}>🏟️ Stadio</div>
          <div style={{fontSize:11,fontWeight:700,color:TH.text,lineHeight:1.3}}>{stadiumName}</div>
        </Card>
        <Card style={{padding:"10px 12px",textAlign:"center"}}>
          <div style={{fontSize:10,color:TH.muted,marginBottom:3}}>Prestigio</div>
          <div style={{fontSize:22,fontWeight:900,color:col,lineHeight:1}}>{club?.p||60}</div>
        </Card>
      </div>
      {/* Coach quote */}
      <Card style={{marginBottom:10,padding:"12px 14px"}}>
        <div style={{fontSize:10,color:TH.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>💬 Il mister dice</div>
        <div style={{fontSize:12,color:TH.text,lineHeight:1.6,fontStyle:"italic"}}>"{COACH_QUOTES[qIdx]}"</div>
      </Card>
      {/* Atmosphere */}
      <Card bg={TH.bgAmber} border="#fde68a" style={{marginBottom:14,padding:"10px 14px"}}>
        <div style={{fontSize:12,color:TH.txAmber}}>{ATMOS[aIdx]}</div>
      </Card>
      {/* Progress */}
      <div style={{height:2,background:TH.cardBorder,borderRadius:2,marginBottom:14,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${col},#f59e0b)`,transition:"width .07s"}}/>
      </div>
      <Btn onClick={onContinue} v="primary" fw style={{padding:"16px",fontSize:15}}>
        🏟️ Inizia la tua storia a {club?.n||"questo club"} →
      </Btn>
    </div>
  );
}

