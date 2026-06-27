const fs=require('fs');
let html=fs.readFileSync('C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html','utf8');

// ─── 1. Aggiorna S() per includere intro e type ────────────────────────────
html=html.replace(
`const S=(text,zones,mz,sz,actions,lock=false,maxMoves)=>{
  if(lock)maxMoves=0;
  else if(maxMoves===undefined){
    const z=zones[0];
    if(z==="area")maxMoves=1;
    else if(z==="bordo")maxMoves=2;
    else if(z==="trequarti")maxMoves=3;
    else maxMoves=2; // centro, difesa, propria
  }
  return{text,zones,moveZone:mz,startZone:sz,actions,lockMovement:lock,maxMoves};
};`,
`const S=(text,zones,mz,sz,actions,lock=false,maxMoves,intro="",type="off")=>{
  if(lock)maxMoves=0;
  else if(maxMoves===undefined){
    const z=zones[0];
    if(z==="area")maxMoves=1;
    else if(z==="bordo")maxMoves=2;
    else if(z==="trequarti")maxMoves=3;
    else maxMoves=2;
  }
  return{text,zones,moveZone:mz,startZone:sz,actions,lockMovement:lock,maxMoves,intro,type};
};`
);
console.log('Step 1 done');

// ─── 2. Aggiungi intro ai situazioni esistenti (rigore, fascia, solo davanti) ─
html=html.replace(
`S("🔴 RIGORE! Sul dischetto.",["area"],{x:[88,89],y:[48,52]},{x:[88,89],y:[49,51]},[
  A("💥 Angolato rasoterra","tiro",10,"goal","miss",10),A("🎯 Cucchiaio","tecnica",-4,"goal","miss_easy",8),A("⚡ Centro-alto","tiro",5,"goal","miss",10)],true),`,
`S("🔴 RIGORE! Sul dischetto.",["area"],{x:[88,89],y:[48,52]},{x:[88,89],y:[49,51]},[
  A("💥 Angolato rasoterra","tiro",10,"goal","miss",10),A("🎯 Cucchiaio","tecnica",-4,"goal","miss_easy",8),A("⚡ Centro-alto","tiro",5,"goal","miss",10)],true,0,"🤫 Il silenzio dello stadio è assordante. Tutto fermo. Solo tu e il portiere.",`+"`"+`off`+"`"+`),`
);

html=html.replace(
`S("⚡ Solo davanti al portiere!",["area"],{x:[80,98],y:[25,75]},{x:[82,92],y:[30,70]},[`,
`S("⚡ Solo davanti al portiere!",["area"],{x:[80,98],y:[25,75]},{x:[82,92],y:[30,70]},[`
);

// Add intro to cross situations
html=html.replace(
`S("⚡ Cross dalla fascia sinistra!",["bordo","trequarti"],{x:[62,88],y:[3,28]},{x:[64,80],y:[5,22]},[
  A("↗️ Cross teso","passaggio",6,"assist","intercept",10),A("↗️ Cross a rientrare","tecnica",4,"assist","miss",10),A("🦵 Tiro a giro","tiro",3,"goal","miss",13)],false,4),`,
`S("⚡ Cross dalla fascia sinistra!",["bordo","trequarti"],{x:[62,88],y:[3,28]},{x:[64,80],y:[5,22]},[
  A("↗️ Cross teso","passaggio",6,"assist","intercept",10),A("↗️ Cross a rientrare","tecnica",4,"assist","miss",10),A("🦵 Tiro a giro","tiro",3,"goal","miss",13)],false,4,"🏃 Il terzino è in ritardo! Hai la fascia libera, metti il cross!"),`
);
html=html.replace(
`S("⚡ Cross dalla fascia destra!",["bordo","trequarti"],{x:[62,88],y:[72,97]},{x:[64,80],y:[78,93]},[
  A("↗️ Cross teso","passaggio",6,"assist","intercept",10),A("↗️ Cross a rientrare","tecnica",4,"assist","miss",10),A("🦵 Tiro a giro","tiro",3,"goal","miss",13)],false,4),`,
`S("⚡ Cross dalla fascia destra!",["bordo","trequarti"],{x:[62,88],y:[72,97]},{x:[64,80],y:[78,93]},[
  A("↗️ Cross teso","passaggio",6,"assist","intercept",10),A("↗️ Cross a rientrare","tecnica",4,"assist","miss",10),A("🦵 Tiro a giro","tiro",3,"goal","miss",13)],false,4,"🏃 Palla sulla fascia! Il terzino si sbilancia, hai spazio per crossare."),`
);
console.log('Step 2 done');

// ─── 3. Aggiungi situazioni difensive + schema dopo la fine di SITUATIONS ───
const DEFENSIVESIT=`
/* === DIFESA — INTERCETTI E TACKLE === */
S("🛡️ Tackle in scivolata! Recupera palla.",["difesa","centro"],{x:[20,55],y:[15,85]},{x:[25,45],y:[30,70]},[
  A("🛡️ Scivolata netta","fisico",6,"recovery","foul",16),A("✋ Intercetta di piede","tecnica",4,"recovery","through",12),A("📣 Copri la linea","velocità",2,"recovery","through",8)],false,2,"⚠️ L'avversario punta la porta! Sei l'ultimo ostacolo prima della difesa.","def"),
S("✋ Anticipa il passaggio filtrante!",["centro","difesa"],{x:[25,58],y:[20,80]},{x:[30,50],y:[32,68]},[
  A("✋ Anticipo di posizione","tecnica",7,"recovery","through",10),A("🏃 Sprint di copertura","velocità",5,"recovery","through",14),A("💪 Contrasto fisico","fisico",3,"recovery","foul",12)],false,2,"👁️ Vedi il passaggio prima che parta. Anticipalo!","def"),
S("🧱 Muro in area! Blocca il tiro.",["propria","difesa"],{x:[5,25],y:[25,75]},{x:[8,20],y:[35,65]},[
  A("🧱 Blocca con il corpo","fisico",8,"save","goal_against",14),A("✋ Devia col piede","tecnica",5,"save","goal_against",12),A("📣 Chiama il portiere","tecnica",2,"save","goal_against",6)],false,1,"💥 Tiro in arrivo! Buttati sulla traiettoria!","def"),
S("🏃 Pressing alto! Ostacola la costruzione.",["trequarti","centro"],{x:[45,72],y:[20,80]},{x:[50,65],y:[30,70]},[
  A("🏃 Pressing aggressivo","velocità",6,"recovery","through",18),A("✋ Intercetta il retropassaggio","tecnica",4,"recovery","through",12),A("🌀 Finta e agganci","tecnica",3,"assist","nothing",10)],false,2,"😤 Il portiere ha palla! Pressa, costringilo all'errore!","def"),
S("⚡ Contropiede avversario! Torna in difesa.",["centro","difesa"],{x:[15,50],y:[20,80]},{x:[20,40],y:[30,70]},[
  A("⚡ Sprint di rientro","velocità",8,"recovery","through",22),A("🛡️ Posizione preventiva","fisico",5,"recovery","through",14),A("📣 Organizza la difesa","tecnica",3,"recovery","through",8)],false,3,"🚨 Contropiede! Tre avversari puntano la porta, rientra!","def"),
S("💪 Duello aereo su corner avversario!",["propria","difesa"],{x:[5,22],y:[25,75]},{x:[8,18],y:[35,65]},[
  A("✈️ Stacco di testa","fisico",7,"save","goal_against",16),A("🤼 Contrasto fisico","fisico",4,"save","goal_against",12),A("📣 Guida i compagni","tecnica",5,"save","goal_against",8)],false,1,"🏳️ Corner avversario! Attacca il pallone in area!","def"),
/* === SCHEMA — INSERIMENTI E COMBINAZIONI === */
S("📐 Schema! Inserimento da centrocampo in area.",["trequarti","bordo"],{x:[38,88],y:[28,72]},{x:[40,52],y:[38,62]},[
  A("⚡ Taglio in profondità","velocità",8,"goal","intercept",22),A("🎯 Taglio sul secondo palo","tecnica",6,"goal","miss",18),A("↩️ Dai e vai corto","passaggio",5,"assist","intercept",10)],false,4,"📐 Schema di movimento! Parti da centrocampo e taglia verso l'area in diagonale."),
S("🔄 Dai e vai! Schema rapido in trequarti.",["trequarti","bordo"],{x:[55,85],y:[22,78]},{x:[58,68],y:[32,68]},[
  A("↩️ Dai e vai preciso","passaggio",8,"assist","intercept",12),A("⚡ Accelera in profondità","velocità",6,"goal","intercept",18),A("🎯 Tiro al volo","tiro",-2,"goal","miss",14)],false,3,"🔄 Dai e vai! Scarica e rilanciati immediatamente nello spazio."),
S("⚡ Corsa di inserimento sul cross!",["trequarti","bordo"],{x:[55,90],y:[18,82]},{x:[58,68],y:[25,40]},[
  A("✈️ Colpo di testa","fisico",7,"goal","miss",16),A("🦵 Tiro di prima","tiro",4,"goal","miss",14),A("🌀 Controllo e tiro","tecnica",3,"goal","miss",12)],false,4,"🏃 Il cross sta per arrivare! Inserisciti con i tempi giusti per attaccare il pallone."),
`;

// Find end of SITUATIONS array
const SIT_END='];';
const sitIdx=html.indexOf('\n];\n\nconst ZONES=');
if(sitIdx<0){console.error('SITUATIONS END NOT FOUND');process.exit(1);}
html=html.slice(0,sitIdx)+DEFENSIVESIT+html.slice(sitIdx);
console.log('Step 3 done');

// ─── 4. Aggiorna OUTCOME_TX con esiti difensivi ────────────────────────────
html=html.replace(
`const OUTCOME_TX={
  goal:["💥 GOOOOOL! Folla in delirio!","⚽ Rete spettacolare!","🔥 Imparabile!","🌟 Fenomenale!"],
  assist:["🎯 Assist perfetto!","🤝 Passaggio da manuale!","🎯 Visione assoluta!"],
  miss_easy:["😱 Porta aperta, fuori!","💔 Errore imperdonabile..."],
  miss:["😬 Tiro fuori!","😔 Para il portiere.","❌ Tiro debole."],
  intercept:["❌ Intercettato.","😔 Passaggio impreciso."],
  nothing:["😐 Situazione non sfruttata."],
  goal_against:["😨 Gol avversario.","💔 Supera e segna."],
};`,
`const OUTCOME_TX={
  goal:["💥 GOOOOOL! Folla in delirio!","⚽ Rete spettacolare!","🔥 Imparabile!","🌟 Fenomenale!"],
  assist:["🎯 Assist perfetto!","🤝 Passaggio da manuale!","🎯 Visione assoluta!"],
  miss_easy:["😱 Porta aperta, fuori!","💔 Errore imperdonabile..."],
  miss:["😬 Tiro fuori!","😔 Para il portiere.","❌ Tiro debole."],
  intercept:["❌ Intercettato.","😔 Passaggio impreciso."],
  nothing:["😐 Situazione non sfruttata."],
  goal_against:["😨 Gol avversario.","💔 Supera e segna."],
  recovery:["💪 Pallone recuperato!","🛡️ Grande intervento!","✋ Anticipo perfetto!"],
  through:["😬 L'avversario passa.","❌ Non ce la fai.","😔 Supera la pressione."],
  foul:["🟡 Fallo! Sei stato ammonito.","⚠️ Rischio fallo! Punizione concessa."],
  save:["🧤 SALVATO! Che intervento!","🛡️ Blocchi la conclusione! Grande difesa."],
};`
);
console.log('Step 4 done');

// ─── 5. Aggiungi nuovi stati a LiveMatch ─────────────────────────────────────
html=html.replace(
`  const keysRef=useRef(new Set());
  const moveRef=useRef(null);
  const movesLeftRef=useRef(0);
  const moveCoolRef=useRef(0);
  const [movesLeft,setMovesLeft]=useState(0);`,
`  const keysRef=useRef(new Set());
  const moveRef=useRef(null);
  const movesLeftRef=useRef(0);
  const moveCoolRef=useRef(0);
  const [movesLeft,setMovesLeft]=useState(0);
  const [introText,setIntroText]=useState("");
  const [screenFlash,setScreenFlash]=useState(null); // {col,dur}
  const [floatGoal,setFloatGoal]=useState(null);     // {text,col,key}
  const pressureRef=useRef(1);                        // 0..1 depleting during hl_move
  const [pressureBar,setPressureBar]=useState(1);`
);
console.log('Step 5 done');

// ─── 6. Clock trigger: va a hl_intro invece di hl_move ────────────────────────
html=html.replace(
`if(hlIdx<hlTimes.length&&nx>=hlTimes[hlIdx]){const mm=situations[hlIdx]?.maxMoves??1;movesLeftRef.current=mm;setMovesLeft(mm);moveCoolRef.current=0;setPhase("hl_move");return nx;}`,
`if(hlIdx<hlTimes.length&&nx>=hlTimes[hlIdx]){setIntroText(situations[hlIdx]?.intro||"");setPhase("hl_intro");return nx;}`
);
// Also key 0 trigger
html=html.replace(
`else if(phase==="playing"&&hlIdx<hlTimes.length){const mm=situations[hlIdx]?.maxMoves??1;movesLeftRef.current=mm;setMovesLeft(mm);moveCoolRef.current=0;setClock(hlTimes[hlIdx]);setPhase("hl_move");}`,
`else if(phase==="playing"&&hlIdx<hlTimes.length){setIntroText(situations[hlIdx]?.intro||"");setClock(hlTimes[hlIdx]);setPhase("hl_intro");}`
);
console.log('Step 6 done');

// ─── 7. hl_move trigger ora parte da hl_intro ─────────────────────────────────
html=html.replace(
`    if(phase==="hl_move"){
      const sp=getStartPos(situations[hlIdx]);`,
`    if(phase==="hl_move"||phase==="hl_intro"){
      const sp=getStartPos(situations[hlIdx]);`
);
console.log('Step 7 done');

// ─── 8. handleAction: aggiungi screen flash + followup commentary ──────────────
html=html.replace(
`    addCom(txt,ok?"#16a34a":"#dc2626",clock);
    setAiCommentary(null);
    setOutcome({text:txt,ok,actionLabel:action.label});setChosenAct(action);setPhase("hl_result");`,
`    addCom(txt,ok?"#16a34a":"#dc2626",clock);
    setAiCommentary(null);
    // Visual feedback
    if(ok&&key==="goal"){
      setScreenFlash({col:"rgba(255,255,255,0.45)",dur:400});
      setFloatGoal({text:"⚽ GOL!",col:"#f59e0b",key:Date.now()});
    } else if(ok&&key==="assist"){
      setScreenFlash({col:"rgba(34,197,94,0.3)",dur:350});
      setFloatGoal({text:"🎯 ASSIST!",col:"#22c55e",key:Date.now()});
    } else if(ok&&key==="recovery"){
      setScreenFlash({col:"rgba(59,130,246,0.3)",dur:300});
    } else if(!ok&&(key==="miss_easy"||key==="goal_against")){
      setScreenFlash({col:"rgba(239,68,68,0.35)",dur:400});
    }
    setOutcome({text:txt,ok,actionLabel:action.label});setChosenAct(action);setPhase("hl_result");`
);
console.log('Step 8 done');

// ─── 9. Aggiungi useEffects per hl_intro, pressure timer, flash cleanup ────────
// Insert after the existing "reset position + selectedActionIdx" useEffect
html=html.replace(
`  // Clock — more commentary, possession updates`,
`  // hl_intro auto-advance → hl_move after 2.5s (tap/key to skip)
  useEffect(()=>{
    if(phase!=="hl_intro")return;
    const mm=situations[hlIdx]?.maxMoves??1;
    const go=()=>{movesLeftRef.current=mm;setMovesLeft(mm);moveCoolRef.current=0;pressureRef.current=1;setPressureBar(1);setPhase("hl_move");};
    const t=setTimeout(go,2500);
    const onKey=e=>{if(e.key===" "||e.key==="Enter"){clearTimeout(t);go();}};
    document.addEventListener("keydown",onKey);
    return()=>{clearTimeout(t);document.removeEventListener("keydown",onKey);};
  },[phase,hlIdx,situations]);// eslint-disable-line

  // Pressure timer during hl_move — depletes over ~8s, auto-advances on expiry
  useEffect(()=>{
    if(phase!=="hl_move")return;
    const sit=situations[hlIdx];
    if(sit?.lockMovement||sit?.maxMoves===0)return; // no pressure on penalty/free kick
    const TOTAL=8000,STEP=100;
    const iv=setInterval(()=>{
      pressureRef.current=Math.max(0,pressureRef.current-STEP/TOTAL);
      setPressureBar(pressureRef.current);
      if(pressureRef.current<=0){clearInterval(iv);setPhase("hl_choose");}
    },STEP);
    return()=>clearInterval(iv);
  },[phase,hlIdx,situations]);// eslint-disable-line

  // Flash cleanup
  useEffect(()=>{
    if(!screenFlash)return;
    const t=setTimeout(()=>setScreenFlash(null),screenFlash.dur+100);
    return()=>clearTimeout(t);
  },[screenFlash]);

  // Float label cleanup
  useEffect(()=>{
    if(!floatGoal)return;
    const t=setTimeout(()=>setFloatGoal(null),1400);
    return()=>clearTimeout(t);
  },[floatGoal]);

  // Clock — more commentary, possession updates`
);
console.log('Step 9 done');

// ─── 10. Keyboard: hl_intro tap-to-skip + hl_result on Enter/Space already ok ──
html=html.replace(
`      if(phase==="hl_result"&&(e.key==="Enter"||e.key===" ")){e.preventDefault();handleContinue();return;}`,
`      if(phase==="hl_intro"&&(e.key===" "||e.key==="Enter")){e.preventDefault();return;} // handled in useEffect above
      if(phase==="hl_result"&&(e.key==="Enter"||e.key===" ")){e.preventDefault();handleContinue();return;}`
);
console.log('Step 10 done');

// ─── 11. show3D deve includere hl_intro ───────────────────────────────────────
html=html.replace(
`  const show3D=["playing","hl_move","hl_choose","hl_result"].includes(phase);`,
`  const show3D=["playing","hl_move","hl_choose","hl_result","hl_intro"].includes(phase);`
);
console.log('Step 11 done');

// ─── 12. Position bonus indicator in hl_choose ────────────────────────────────
// After succRate calculation add a position bonus description
// We'll add it to the action card subtitle area
// Find the action rendering to add position quality indicator
html=html.replace(
`              const curSit=situations[hlIdx];`,
`              const curSit=situations[hlIdx];
              // Position quality: how well positioned is the player (0..1)
              const posMZ=curSit?.moveZone||{x:[0,100],y:[0,100]};
              const posQuality=curSit&&curSit.maxMoves>0?clamp(1-Math.abs((pPos.y-((posMZ.y[0]+posMZ.y[1])/2))/(posMZ.y[1]-posMZ.y[0]+1)),0,1):0.5;`
);
console.log('Step 12 done');

// ─── 13. Aggiungi UI: hl_intro overlay, pressure bar, screen flash, float label ─
// Add hl_intro overlay before the hl_move overlay
html=html.replace(
`            {/* HL_MOVE overlay */}
            {phase==="hl_move"&&curSit&&(`,
`            {/* HL_INTRO overlay — narrative screen */}
            {phase==="hl_intro"&&curSit&&(
              <div style={{position:"absolute",inset:0,background:"rgba(5,8,20,0.88)",backdropFilter:"blur(6px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:8,padding:"0 20px"}}>
                <div style={{fontSize:22,marginBottom:12}}>{"⚽"}</div>
                <div style={{fontSize:16,fontWeight:900,color:"#f59e0b",textAlign:"center",marginBottom:10,textShadow:"0 0 20px #f59e0b"}}>{curSit.text}</div>
                {introText&&<div style={{fontSize:13,color:"rgba(255,255,255,0.8)",textAlign:"center",fontStyle:"italic",marginBottom:18,lineHeight:1.4}}>{introText}</div>}
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>
                  {curSit.type==="def"?"🛡️ FASE DIFENSIVA":"⚔️ OCCASIONE OFFENSIVA"}
                </div>
                <div style={{width:120,height:3,background:"rgba(255,255,255,0.15)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",background:"#f59e0b",animation:"shrinkBar 2.5s linear forwards",borderRadius:2}}/>
                </div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:8}}>Tocca per iniziare subito</div>
              </div>
            )}

            {/* HL_MOVE overlay */}
            {phase==="hl_move"&&curSit&&(`
);

// Add pressure bar inside hl_move overlay
html=html.replace(
`                      {curSit.maxMoves>0&&<span style={{marginLeft:8,color:"#60a5fa",fontWeight:700}}>
                        {"●".repeat(movesLeft)}{"○".repeat(Math.max(0,curSit.maxMoves-movesLeft))} {movesLeft} rimasti
                      </span>}`,
`                      {curSit.maxMoves>0&&<span style={{marginLeft:8,color:"#60a5fa",fontWeight:700}}>
                        {"●".repeat(movesLeft)}{"○".repeat(Math.max(0,curSit.maxMoves-movesLeft))} {movesLeft} mov
                      </span>}
                      {curSit.maxMoves>0&&<div style={{marginTop:3,height:2,background:"rgba(255,255,255,0.15)",borderRadius:1}}>
                        <div style={{height:"100%",width:(pressureBar*100)+"%",background:pressureBar>0.4?"#f59e0b":pressureBar>0.2?"#f97316":"#ef4444",borderRadius:1,transition:"width 0.1s linear"}}/>
                      </div>}`
);
console.log('Step 13 done');

// Add screen flash + float goal overlay inside the relative position div
html=html.replace(
`            {phase==="walkout"&&<WalkoutOverlay homeTeam={player.club||opponent} onDone={()=>setPhase("playing")}/>}`,
`            {phase==="walkout"&&<WalkoutOverlay homeTeam={player.club||opponent} onDone={()=>setPhase("playing")}/>}
            {/* Screen flash */}
            {screenFlash&&<div style={{position:"absolute",inset:0,background:screenFlash.col,zIndex:20,pointerEvents:"none",animation:\`fadeFlash \${screenFlash.dur}ms ease-out forwards\`}}/>}
            {/* Floating goal/assist label */}
            {floatGoal&&<div key={floatGoal.key} style={{position:"absolute",top:"30%",left:0,right:0,textAlign:"center",fontSize:22,fontWeight:900,color:floatGoal.col,textShadow:"0 0 24px currentColor",animation:"floatUp 1.4s ease-out forwards",zIndex:21,pointerEvents:"none"}}>{floatGoal.text}</div>}`
);
console.log('Step 14 done');

// ─── 14. Aggiungi CSS animations nel <style> ───────────────────────────────────
html=html.replace(
`<style>`,
`<style>
@keyframes shrinkBar{from{width:100%}to{width:0%}}
@keyframes fadeFlash{0%{opacity:1}100%{opacity:0}}
@keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1)}60%{opacity:1;transform:translateY(-30px) scale(1.1)}100%{opacity:0;transform:translateY(-60px) scale(0.9)}}
`
);
console.log('Step 15 done');

fs.writeFileSync('C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html',html);
console.log('Patch complete. File size:',html.length);
