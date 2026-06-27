// _patch4.js — Atmospheric graphics: pitch, stands, fans, walkout + player drift from BG_MATCH
const fs = require('fs');
const path = 'C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html';
let html = fs.readFileSync(path, 'utf8');

// ─── STEP 1: Add playerDrift field to BG_MATCH entries ───
// Each event describes where groups of players should drift:
// home/away arrays of {idx:player_index, tx:target_x, ty:target_y} in game coords
const OLD_BG_FIRST = `  // Goals (very rare)
  {txt:"⚽ {H} segna! Squadra in vantaggio!",ef:"team_goal",w:0.4,bpos:{x:85,y:50}},
  {txt:"😨 Gol avversario. {A} buca la nostra difesa.",ef:"opp_goal",w:0.4,bpos:{x:15,y:50}},
  // Possession
  {txt:"🔵 {H} controlla bene il gioco a centrocampo.",ef:null,w:4,poss:+2,bpos:{x:52,y:50}},
  {txt:"🏃 Scambio rapido tra {H} e {H2}. Palla conservata.",ef:null,w:3,poss:+1,bpos:{x:55,y:60}},
  {txt:"🔄 {H} cambia gioco sulla fascia opposta.",ef:null,w:3,poss:+1,bpos:{x:60,y:80}},
  {txt:"😤 {A} recupera palla e riparte in contropiede.",ef:null,w:3,poss:-2,bpos:{x:35,y:50}},
  {txt:"⚡ Contropiede di {A} sventato in extremis.",ef:null,w:2,poss:-1,bpos:{x:25,y:45}},
  // Attacks
  {txt:"💥 Tiro da fuori area di {H}, para il portiere.",ef:null,w:3,bpos:{x:78,y:50},ms:{shots:1}},
  {txt:"🔥 {H} sfiora il vantaggio! Palo!",ef:null,w:2,bpos:{x:90,y:52},ms:{shots:1}},
  {txt:"🎯 Cross di {H} pericoloso, respinto dalla difesa.",ef:null,w:3,bpos:{x:82,y:85},ms:{shots:1}},
  {txt:"⚡ Azione veloce sulla fascia. Corner guadagnato da {H}.",ef:null,w:2,bpos:{x:88,y:90},ms:{corners:1}},
  {txt:"💪 Combinazione tra {H} e {H2} in area! Difesa salva.",ef:null,w:2,bpos:{x:85,y:55},ms:{shots:1}},
  {txt:"🌀 Dribbling netto di {H}! Ottima posizione.",ef:null,w:2,bpos:{x:70,y:65}},
  // Defense
  {txt:"🧤 Grande parata del portiere su {A}!",ef:null,w:2,bpos:{x:8,y:50},ms:{oppShots:1}},
  {txt:"🛡️ Tackle in scivolata! {H} recupera palla.",ef:null,w:3,poss:+2,bpos:{x:38,y:48}},
  {txt:"⚠️ Pericolo! {A} entra in area.",ef:null,w:2,bpos:{x:18,y:52},ms:{oppShots:1}},
  {txt:"🚧 Fuorigioco di {A}! Liberazione della difesa.",ef:null,w:3,bpos:{x:22,y:50}},
  // Set pieces
  {txt:"🟡 Fallo di {A}. Punizione guadagnata.",ef:null,w:2,bpos:{x:60,y:55},ms:{fouls:1}},
  {txt:"🟡 {A} ammonito. Squadra in inferiorità numerica per un possesso.",ef:null,w:2,bpos:{x:55,y:50},ms:{fouls:1}},
  {txt:"🏳️ Calcio d'angolo per noi. {H} va al traversone.",ef:null,w:2,bpos:{x:90,y:95},ms:{corners:1}},
  {txt:"🏳️ Corner avversario da {A}. Difesa attenta.",ef:null,w:2,bpos:{x:8,y:5},ms:{oppShots:1}},
  // Tactical
  {txt:"📢 Il mister urla istruzioni. {H} si sistema.",ef:null,w:2,bpos:{x:50,y:50}},
  {txt:"🔥 {H} spinge forte! Intensità altissima.",ef:null,w:3,bpos:{x:65,y:55}},
  {txt:"😤 L'avversario alza il ritmo. {A} pressa alto.",ef:null,w:2,bpos:{x:40,y:48}},
  {txt:"📊 Partita equilibrata. {H} cerca gli spazi.",ef:null,w:3,bpos:{x:50,y:50}},
  {txt:"🏃 {A} si chiude in difesa. Possesso sterile.",ef:null,w:2,bpos:{x:55,y:52}},
  {txt:"✨ Grande combinazione sulla fascia tra {H} e {H2}.",ef:null,w:2,bpos:{x:72,y:88}},
  {txt:"🔄 Cambio tattico avversario. {A} pressa di più.",ef:null,w:2,bpos:{x:42,y:50}},
  // Late game
  {txt:"⏱️ Il tempo stringe. {H} deve sbloccarla!",ef:null,w:4,minClock:70,bpos:{x:65,y:50}},
  {txt:"🔥 Pressione massima di {H}! Tifosi scatenati.",ef:null,w:3,minClock:75,bpos:{x:75,y:50}},
  {txt:"💊 Sostituzione avversaria. {A} entra fresco.",ef:null,w:2,minClock:60,bpos:{x:50,y:50}},
  {txt:"😓 Le gambe pesano. {H} deve reggere.",ef:null,w:2,minClock:80,bpos:{x:50,y:50}},`;

const NEW_BG_FIRST = `  // Goals (very rare)
  {txt:"⚽ {H} segna! Squadra in vantaggio!",ef:"team_goal",w:0.4,bpos:{x:85,y:50},pd:"attack_goal"},
  {txt:"😨 Gol avversario. {A} buca la nostra difesa.",ef:"opp_goal",w:0.4,bpos:{x:15,y:50},pd:"opp_goal"},
  // Possession
  {txt:"🔵 {H} controlla bene il gioco a centrocampo.",ef:null,w:4,poss:+2,bpos:{x:52,y:50},pd:"midfield"},
  {txt:"🏃 Scambio rapido tra {H} e {H2}. Palla conservata.",ef:null,w:3,poss:+1,bpos:{x:55,y:60},pd:"midfield"},
  {txt:"🔄 {H} cambia gioco sulla fascia opposta.",ef:null,w:3,poss:+1,bpos:{x:60,y:80},pd:"wide_right"},
  {txt:"😤 {A} recupera palla e riparte in contropiede.",ef:null,w:3,poss:-2,bpos:{x:35,y:50},pd:"retreat"},
  {txt:"⚡ Contropiede di {A} sventato in extremis.",ef:null,w:2,poss:-1,bpos:{x:25,y:45},pd:"retreat"},
  // Attacks
  {txt:"💥 Tiro da fuori area di {H}, para il portiere.",ef:null,w:3,bpos:{x:78,y:50},ms:{shots:1},pd:"attack"},
  {txt:"🔥 {H} sfiora il vantaggio! Palo!",ef:null,w:2,bpos:{x:90,y:52},ms:{shots:1},pd:"attack_goal"},
  {txt:"🎯 Cross di {H} pericoloso, respinto dalla difesa.",ef:null,w:3,bpos:{x:82,y:85},ms:{shots:1},pd:"wide_right"},
  {txt:"⚡ Azione veloce sulla fascia. Corner guadagnato da {H}.",ef:null,w:2,bpos:{x:88,y:90},ms:{corners:1},pd:"wide_right"},
  {txt:"💪 Combinazione tra {H} e {H2} in area! Difesa salva.",ef:null,w:2,bpos:{x:85,y:55},ms:{shots:1},pd:"attack_goal"},
  {txt:"🌀 Dribbling netto di {H}! Ottima posizione.",ef:null,w:2,bpos:{x:70,y:65},pd:"attack"},
  // Defense
  {txt:"🧤 Grande parata del portiere su {A}!",ef:null,w:2,bpos:{x:8,y:50},ms:{oppShots:1},pd:"defend_goal"},
  {txt:"🛡️ Tackle in scivolata! {H} recupera palla.",ef:null,w:3,poss:+2,bpos:{x:38,y:48},pd:"midfield"},
  {txt:"⚠️ Pericolo! {A} entra in area.",ef:null,w:2,bpos:{x:18,y:52},ms:{oppShots:1},pd:"defend_goal"},
  {txt:"🚧 Fuorigioco di {A}! Liberazione della difesa.",ef:null,w:3,bpos:{x:22,y:50},pd:"retreat"},
  // Set pieces
  {txt:"🟡 Fallo di {A}. Punizione guadagnata.",ef:null,w:2,bpos:{x:60,y:55},ms:{fouls:1},pd:"attack"},
  {txt:"🟡 {A} ammonito. Squadra in inferiorità numerica per un possesso.",ef:null,w:2,bpos:{x:55,y:50},ms:{fouls:1},pd:"midfield"},
  {txt:"🏳️ Calcio d'angolo per noi. {H} va al traversone.",ef:null,w:2,bpos:{x:90,y:95},ms:{corners:1},pd:"attack_goal"},
  {txt:"🏳️ Corner avversario da {A}. Difesa attenta.",ef:null,w:2,bpos:{x:8,y:5},ms:{oppShots:1},pd:"defend_goal"},
  // Tactical
  {txt:"📢 Il mister urla istruzioni. {H} si sistema.",ef:null,w:2,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🔥 {H} spinge forte! Intensità altissima.",ef:null,w:3,bpos:{x:65,y:55},pd:"attack"},
  {txt:"😤 L'avversario alza il ritmo. {A} pressa alto.",ef:null,w:2,bpos:{x:40,y:48},pd:"retreat"},
  {txt:"📊 Partita equilibrata. {H} cerca gli spazi.",ef:null,w:3,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"🏃 {A} si chiude in difesa. Possesso sterile.",ef:null,w:2,bpos:{x:55,y:52},pd:"midfield"},
  {txt:"✨ Grande combinazione sulla fascia tra {H} e {H2}.",ef:null,w:2,bpos:{x:72,y:88},pd:"wide_right"},
  {txt:"🔄 Cambio tattico avversario. {A} pressa di più.",ef:null,w:2,bpos:{x:42,y:50},pd:"retreat"},
  // Late game
  {txt:"⏱️ Il tempo stringe. {H} deve sbloccarla!",ef:null,w:4,minClock:70,bpos:{x:65,y:50},pd:"attack"},
  {txt:"🔥 Pressione massima di {H}! Tifosi scatenati.",ef:null,w:3,minClock:75,bpos:{x:75,y:50},pd:"attack"},
  {txt:"💊 Sostituzione avversaria. {A} entra fresco.",ef:null,w:2,minClock:60,bpos:{x:50,y:50},pd:"midfield"},
  {txt:"😓 Le gambe pesano. {H} deve reggere.",ef:null,w:2,minClock:80,bpos:{x:50,y:50},pd:"retreat"},`;

html = html.replace(OLD_BG_FIRST, NEW_BG_FIRST);
console.log('Step 1 done');

// ─── STEP 2: Add playerDrift + waveEvent state in LiveMatch, and a DRIFT_PRESETS map ───
const OLD_BALLPOS_STATE = `  const [ballPos,setBallPos]=useState({x:50,y:50});   // game coords 0-100, synced from BG_MATCH
  const [mxStats,setMxStats]=useState({shots:0,oppShots:0,fouls:0,corners:0}); // live match stats`;

const NEW_BALLPOS_STATE = `  const [ballPos,setBallPos]=useState({x:50,y:50});   // game coords 0-100, synced from BG_MATCH
  const [mxStats,setMxStats]=useState({shots:0,oppShots:0,fouls:0,corners:0}); // live match stats
  const [waveEvent,setWaveEvent]=useState(null);       // triggers fan wave animation
  // Drift presets: for each pd key, describe target positions for home/away groups
  // Each entry: array of {i:player_index_in_allPlayers, x:game_x, y:game_y}
  const DRIFT_PRESETS={
    attack:      [{i:8,x:72,y:42},{i:9,x:65,y:58},{i:6,x:58,y:50},{i:14,x:55,y:45},{i:15,x:48,y:55}],
    attack_goal: [{i:8,x:88,y:45},{i:9,x:85,y:55},{i:6,x:72,y:50},{i:7,x:68,y:38},{i:14,x:62,y:48}],
    wide_right:  [{i:9,x:75,y:82},{i:8,x:68,y:75},{i:6,x:58,y:62},{i:7,x:52,y:70},{i:15,x:45,y:60}],
    midfield:    [{i:5,x:48,y:38},{i:6,x:52,y:50},{i:7,x:48,y:62},{i:14,x:45,y:42},{i:15,x:42,y:58}],
    retreat:     [{i:5,x:32,y:35},{i:6,x:30,y:50},{i:7,x:32,y:65},{i:8,x:42,y:45},{i:9,x:42,y:55}],
    defend_goal: [{i:1,x:12,y:30},{i:2,x:10,y:50},{i:3,x:12,y:70},{i:4,x:20,y:42},{i:5,x:22,y:58}],
    opp_goal:    [{i:10,x:15,y:42},{i:11,x:18,y:50},{i:12,x:15,y:58},{i:13,x:25,y:40},{i:14,x:25,y:60}],
  };
  const driftTargetsRef=useRef(null); // current drift targets passed to PitchCanvas`;

html = html.replace(OLD_BALLPOS_STATE, NEW_BALLPOS_STATE);
console.log('Step 2 done');

// ─── STEP 3: In clock tick, apply pd drift and fan wave on goals ───
const OLD_BALL_UPDATE = `          if(ev.bpos)setBallPos(ev.bpos);
          if(ev.ms)setMxStats(s=>({shots:s.shots+(ev.ms.shots||0),oppShots:s.oppShots+(ev.ms.oppShots||0),fouls:s.fouls+(ev.ms.fouls||0),corners:s.corners+(ev.ms.corners||0)}));`;

const NEW_BALL_UPDATE = `          if(ev.bpos)setBallPos(ev.bpos);
          if(ev.ms)setMxStats(s=>({shots:s.shots+(ev.ms.shots||0),oppShots:s.oppShots+(ev.ms.oppShots||0),fouls:s.fouls+(ev.ms.fouls||0),corners:s.corners+(ev.ms.corners||0)}));
          if(ev.pd&&DRIFT_PRESETS[ev.pd])driftTargetsRef.current=DRIFT_PRESETS[ev.pd];
          if(ev.ef==="team_goal"||ev.ef==="opp_goal")setWaveEvent({t:Date.now(),home:ev.ef==="team_goal"});`;

html = html.replace(OLD_BALL_UPDATE, NEW_BALL_UPDATE);
console.log('Step 3 done');

// ─── STEP 4: Pass waveEvent and driftTargets to PitchCanvas ───
const OLD_PC_TAG2 = `            <PitchCanvas playerX={pPos.x} playerY={pPos.y} zone={zone}
              homeCol={player.club?.col||player.club?.c||"#22c55e"} oppCol={opponent?.col||opponent?.c||"#ef4444"}
              opponents={opponents.current} matchPhase={matchPhase3D} avatarId={player.avatarId||0}
              actionZoom={phase==="hl_move"||phase==="hl_choose"||phase==="hl_result"}
              allPlayers={matchPlayers}
              homeClub={player.club||opponent}
              ballX={ballPos.x} ballY={ballPos.y}
              onWalkoutDone={()=>setPhase("playing")}/>`;

const NEW_PC_TAG2 = `            <PitchCanvas playerX={pPos.x} playerY={pPos.y} zone={zone}
              homeCol={player.club?.col||player.club?.c||"#22c55e"} oppCol={opponent?.col||opponent?.c||"#ef4444"}
              opponents={opponents.current} matchPhase={matchPhase3D} avatarId={player.avatarId||0}
              actionZoom={phase==="hl_move"||phase==="hl_choose"||phase==="hl_result"}
              allPlayers={matchPlayers}
              homeClub={player.club||opponent}
              ballX={ballPos.x} ballY={ballPos.y}
              waveEvent={waveEvent}
              driftTargets={driftTargetsRef.current}
              onWalkoutDone={()=>setPhase("playing")}/>`;

html = html.replace(OLD_PC_TAG2, NEW_PC_TAG2);
console.log('Step 4 done');

// ─── STEP 5: Update PitchCanvas signature ───
const OLD_PC_SIG2 = `function PitchCanvas({playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX,ballY}){`;
const NEW_PC_SIG2 = `function PitchCanvas({playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX,ballY,waveEvent,driftTargets}){`;
html = html.replace(OLD_PC_SIG2, NEW_PC_SIG2);
console.log('Step 5 done');

// ─── STEP 6: Update propsRef to include waveEvent and driftTargets ───
const OLD_PROPSREF2 = `  const propsRef=useRef({playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX:ballX||50,ballY:ballY||50});
  useEffect(()=>{propsRef.current={playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX:ballX||50,ballY:ballY||50};},[playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX,ballY]);`;

const NEW_PROPSREF2 = `  const propsRef=useRef({playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX:ballX||50,ballY:ballY||50,waveEvent,driftTargets});
  useEffect(()=>{propsRef.current={playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX:ballX||50,ballY:ballY||50,waveEvent,driftTargets};},[playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX,ballY,waveEvent,driftTargets]);`;

html = html.replace(OLD_PROPSREF2, NEW_PROPSREF2);
console.log('Step 6 done');

// ─── STEP 7: Add livePositions to stateRef (smooth player positions) ───
const OLD_STATEREF2 = `  const stateRef=useRef({
    camX:PC_FCX,camY:PC_FCY,camZ:1,
    ballCx:PC_FCX,ballCy:PC_FCY,
    prevPX:50,prevPY:50,isMoving:false,movT:0,
    walkP:0,walkDone:false,
    particles:[],fid:null,
    ballHistory:[]   // trail: last 8 {x,y} positions
  });`;

const NEW_STATEREF2 = `  const stateRef=useRef({
    camX:PC_FCX,camY:PC_FCY,camZ:1,
    ballCx:PC_FCX,ballCy:PC_FCY,
    prevPX:50,prevPY:50,isMoving:false,movT:0,
    walkP:0,walkDone:false,
    particles:[],fid:null,
    ballHistory:[],  // trail: last 8 {x,y} positions
    livePos:[],      // smooth player positions [{cx,cy}] mirroring allPlayers with drift
    prevDriftKey:null,
    photoFlashT:0,   // timestamp of last camera flash
    fogPhase:0       // fog animation phase
  });`;

html = html.replace(OLD_STATEREF2, NEW_STATEREF2);
console.log('Step 7 done');

// ─── STEP 8: Replace standsOff baking with richer version (sciarpe, settori home/away, torri fari) ───
const OLD_STANDS_BAKE = `    const standsOff=document.createElement("canvas");standsOff.width=PW;standsOff.height=PH;
    const sc=standsOff.getContext("2d");
    sc.fillStyle="#060911";sc.fillRect(0,0,PW,PH);
    var pitchGlow=sc.createRadialGradient(FCX,FCY,50,FCX,FCY,230);
    pitchGlow.addColorStop(0,"rgba(20,90,40,0.22)");pitchGlow.addColorStop(1,"rgba(0,0,0,0)");
    sc.fillStyle=pitchGlow;sc.fillRect(0,0,PW,PH);
    var fanPal=["#dc2626","#1e40af","#f59e0b","#166534","#7c3aed","#db2777","#e5e7eb","#ea580c","#0e7490","#4d7c0f","#1e293b","#7f1d1d"];
    function bakeStand(x,y,w,h,nearPitch){
      if(w<3||h<3)return;
      var cw=4.5,rh=4.5,cols=Math.ceil(w/cw),rows=Math.ceil(h/rh);
      for(var r=0;r<rows;r++){
        var da=nearPitch?0.6-r*(0.35/Math.max(rows,1)):0.28+r*(0.3/Math.max(rows,1));
        for(var c=0;c<cols;c++){
          var ci=((r*17+c*13)^(r*c+7))%fanPal.length;
          sc.fillStyle=fanPal[ci];sc.globalAlpha=da*0.72;
          sc.fillRect(x+c*cw,y+r*rh,cw-1,rh-1);
        }
        if(r%2===0){sc.fillStyle="#000";sc.globalAlpha=0.22;sc.fillRect(x,y+r*rh+rh-1,w,1);}
      }
      sc.globalAlpha=1;
    }
    bakeStand(FX,2,FW,FY-3,true);
    bakeStand(FX,FY+FH+2,FW,PH-FY-FH-4,true);
    bakeStand(0,FY,FX-1,FH,true);
    bakeStand(FX+FW+1,FY,PW-FX-FW-1,FH,true);
    [[FX-4,FY-2],[FX+FW+4,FY-2],[FX-4,FY+FH+2],[FX+FW+4,FY+FH+2]].forEach(function(m){
      sc.strokeStyle="#6b7280";sc.lineWidth=1.5;sc.beginPath();sc.moveTo(m[0],m[1]+16);sc.lineTo(m[0],m[1]);sc.stroke();
      sc.fillStyle="#9ca3af";sc.fillRect(m[0]-4,m[1]-2,8,3);
    });`;

const NEW_STANDS_BAKE = `    const standsOff=document.createElement("canvas");standsOff.width=PW;standsOff.height=PH;
    const sc=standsOff.getContext("2d");
    // Dark stadium background with subtle blue tint
    sc.fillStyle="#04060f";sc.fillRect(0,0,PW,PH);
    // Concrete structure — stadium bowl shadow
    var bowlGrad=sc.createRadialGradient(FCX,FCY,40,FCX,FCY,240);
    bowlGrad.addColorStop(0,"rgba(30,120,55,0.18)");bowlGrad.addColorStop(0.6,"rgba(10,20,40,0.3)");bowlGrad.addColorStop(1,"rgba(0,0,0,0.7)");
    sc.fillStyle=bowlGrad;sc.fillRect(0,0,PW,PH);
    // Home sector (top half of each stand) vs Away sector (bottom half) — color split
    // homeCol / oppCol not available here — use neutral palette with home/away split
    var HOME_COL="#2563eb",AWAY_COL="#dc2626"; // will look fine for most clubs
    function bakeStand(x,y,w,h,nearPitch,homeTop){
      if(w<3||h<3)return;
      var cw=4,rh=4,cols=Math.ceil(w/cw),rows=Math.ceil(h/rh);
      // Concrete steps
      for(var r=0;r<rows;r++){
        var conc=r%2===0?"#16182a":"#121525";
        sc.fillStyle=conc;sc.globalAlpha=1;
        sc.fillRect(x,y+r*rh,w,rh);
      }
      // Fan seats
      for(var r=0;r<rows;r++){
        var isHome=homeTop?(r<rows*0.55):(r>=rows*0.45);
        var da=nearPitch?Math.max(0.15,0.65-r*(0.45/Math.max(rows,1))):Math.min(0.5,0.2+r*(0.3/Math.max(rows,1)));
        for(var c=0;c<cols;c++){
          // Home section: team color mix; Away: opponent color mix
          var base=isHome?HOME_COL:AWAY_COL;
          var scatter=(((r*17+c*13)^(r*7+c*3))%7);
          var alpha=da*(0.55+scatter*0.05);
          sc.fillStyle=base;sc.globalAlpha=alpha;
          sc.fillRect(x+c*cw,y+r*rh+1,cw-1,rh-2);
          // Occasional white shirt tifoso
          if(scatter===0){sc.fillStyle="#e5e7eb";sc.globalAlpha=alpha*0.6;sc.fillRect(x+c*cw,y+r*rh+1,cw-1,rh-2);}
        }
        // Row shadow
        if(r%2===0){sc.fillStyle="#000";sc.globalAlpha=0.18;sc.fillRect(x,y+r*rh+rh-1,w,1);}
      }
      // Sciarpa strip: top row of stand
      var scarpW=6,scarpCount=Math.floor(w/scarpW);
      for(var s2=0;s2<scarpCount;s2++){
        var sc2col=(s2%2===0)?HOME_COL:AWAY_COL;
        sc.fillStyle=sc2col;sc.globalAlpha=nearPitch?0.55:0.3;
        sc.fillRect(x+s2*scarpW,y,scarpW-1,2);
      }
      sc.globalAlpha=1;
    }
    bakeStand(FX,2,FW,FY-3,true,true);        // top stand: home top
    bakeStand(FX,FY+FH+2,FW,PH-FY-FH-4,true,false);  // bottom: away top
    bakeStand(0,FY,FX-1,FH,true,true);         // left
    bakeStand(FX+FW+1,FY,PW-FX-FW-1,FH,true,false);   // right
    // Floodlight towers — 4 corners, tall metallic pylons
    var towers=[[FX-6,FY-4],[FX+FW+6,FY-4],[FX-6,FY+FH+4],[FX+FW+6,FY+FH+4]];
    towers.forEach(function(m){
      // Pylon
      sc.strokeStyle="#4b5563";sc.lineWidth=2.5;
      sc.beginPath();sc.moveTo(m[0],m[1]+22);sc.lineTo(m[0],m[1]-2);sc.stroke();
      // Top crossbar
      sc.strokeStyle="#6b7280";sc.lineWidth=1.5;
      sc.beginPath();sc.moveTo(m[0]-5,m[1]-2);sc.lineTo(m[0]+5,m[1]-2);sc.stroke();
      // Light head glow
      var lg=sc.createRadialGradient(m[0],m[1]-2,0,m[0],m[1]-2,9);
      lg.addColorStop(0,"rgba(255,252,200,0.65)");lg.addColorStop(1,"rgba(255,252,200,0)");
      sc.fillStyle=lg;sc.fillRect(m[0]-9,m[1]-11,18,9);
      // Light panel
      sc.fillStyle="#fefce8";sc.globalAlpha=0.8;sc.fillRect(m[0]-4,m[1]-5,8,3);sc.globalAlpha=1;
    });`;

html = html.replace(OLD_STANDS_BAKE, NEW_STANDS_BAKE);
console.log('Step 8 done');

// ─── STEP 9: Enhance drawBg — add reflector beams, fog layer, photo flashes, animated ola wave ───
const OLD_DRAWBG = `    function drawBg(ctx,t){
      ctx.drawImage(standsOff,0,0);
      var wave=Math.sin(t*0.0009)*2.5;
      ctx.save();ctx.globalAlpha=0.07;ctx.fillStyle="#fff";
      ctx.fillRect(FX,2+(wave>0?wave:0),FW,Math.abs(wave));
      ctx.fillRect(FX,FY+FH+2+(wave<0?Math.abs(wave):0),FW,Math.abs(wave));
      ctx.restore();
      var flicker=0.9+Math.sin(t*0.063)*0.05+Math.sin(t*0.11)*0.05;
      [[FX,FY],[FX+FW,FY],[FX,FY+FH],[FX+FW,FY+FH]].forEach(function(pt){
        var g=ctx.createRadialGradient(pt[0],pt[1],0,pt[0],pt[1],72);
        g.addColorStop(0,"rgba(255,252,210,"+(0.2*flicker)+")");g.addColorStop(1,"rgba(255,252,210,0)");
        ctx.fillStyle=g;ctx.fillRect(pt[0]-72,pt[1]-72,144,144);
      });
    }`;

const NEW_DRAWBG = `    function drawBg(ctx,t){
      ctx.drawImage(standsOff,0,0);
      // --- Floodlight beams from 4 tower corners ---
      var flicker=0.85+Math.sin(t*0.063)*0.08+Math.sin(t*0.11)*0.07;
      var towers2=[[FX-6,FY-4],[FX+FW+6,FY-4],[FX-6,FY+FH+4],[FX+FW+6,FY+FH+4]];
      var pitchCorners=[[FX+FW*0.15,FY+FH*0.12],[FX+FW*0.85,FY+FH*0.12],[FX+FW*0.15,FY+FH*0.88],[FX+FW*0.85,FY+FH*0.88]];
      towers2.forEach(function(tw,idx){
        var pc=pitchCorners[idx];
        var beam=ctx.createLinearGradient(tw[0],tw[1],pc[0],pc[1]);
        beam.addColorStop(0,"rgba(255,252,200,"+(0.18*flicker)+")");
        beam.addColorStop(1,"rgba(255,252,200,0)");
        ctx.save();ctx.globalAlpha=0.6;ctx.fillStyle=beam;
        ctx.beginPath();ctx.moveTo(tw[0],tw[1]);
        ctx.lineTo(pc[0]-14,pc[1]);ctx.lineTo(pc[0]+14,pc[1]);ctx.closePath();ctx.fill();
        ctx.restore();
        // Lens flare dot
        var lg=ctx.createRadialGradient(tw[0],tw[1]-2,0,tw[0],tw[1]-2,12);
        lg.addColorStop(0,"rgba(255,252,220,"+(0.55*flicker)+")");lg.addColorStop(1,"rgba(255,252,220,0)");
        ctx.fillStyle=lg;ctx.fillRect(tw[0]-12,tw[1]-14,24,12);
      });
      // --- Animated OLA wave across top and bottom stands ---
      var waveSpeed=t*0.0012;
      var topStH=FY-3,botStH=PH-FY-FH-4;
      for(var wi=0;wi<Math.ceil(FW/5);wi++){
        var wx=FX+wi*5;
        var wh=Math.max(0,Math.sin(waveSpeed+wi*0.22)*4.5);
        if(wh>0){
          ctx.save();ctx.globalAlpha=0.28;ctx.fillStyle="#fff";
          ctx.fillRect(wx,2,5,Math.min(wh,topStH));
          ctx.fillRect(wx,FY+FH+2,5,Math.min(wh,botStH));
          ctx.restore();
        }
      }
      // --- Random photo flashes on stands ---
      if(Math.random()<0.012){
        var fx2=FX+Math.random()*FW,fy2=2+Math.random()*(FY-5);
        var fg=ctx.createRadialGradient(fx2,fy2,0,fx2,fy2,8);
        fg.addColorStop(0,"rgba(255,255,255,0.7)");fg.addColorStop(1,"rgba(255,255,255,0)");
        ctx.fillStyle=fg;ctx.fillRect(fx2-8,fy2-8,16,16);
      }
      if(Math.random()<0.008){
        var fx3=FX+Math.random()*FW,fy3=FY+FH+2+Math.random()*(PH-FY-FH-4);
        var fg3=ctx.createRadialGradient(fx3,fy3,0,fx3,fy3,8);
        fg3.addColorStop(0,"rgba(255,255,255,0.7)");fg3.addColorStop(1,"rgba(255,255,255,0)");
        ctx.fillStyle=fg3;ctx.fillRect(fx3-8,fy3-8,16,16);
      }
      // --- Fog layer at pitch level (near goals) ---
      s.fogPhase=(s.fogPhase||0)+0.003;
      var fogAlpha=0.055+Math.sin(s.fogPhase)*0.025;
      var fogT=ctx.createLinearGradient(FX,FY,FX,FY+30);
      fogT.addColorStop(0,"rgba(220,240,220,0)");fogT.addColorStop(0.5,"rgba(220,240,220,"+fogAlpha+")");fogT.addColorStop(1,"rgba(220,240,220,0)");
      ctx.fillStyle=fogT;ctx.fillRect(FX,FY-4,FW,28);
      var fogB=ctx.createLinearGradient(FX,FY+FH-26,FX,FY+FH+4);
      fogB.addColorStop(0,"rgba(220,240,220,0)");fogB.addColorStop(0.5,"rgba(220,240,220,"+fogAlpha+")");fogB.addColorStop(1,"rgba(220,240,220,0)");
      ctx.fillStyle=fogB;ctx.fillRect(FX,FY+FH-26,FW,30);
    }`;

html = html.replace(OLD_DRAWBG, NEW_DRAWBG);
console.log('Step 9 done');

// ─── STEP 10: Enhance drawPitch — glow lines, wet reflection patches ───
const OLD_DRAWPITCH_GRASS = `    function drawPitch(ctx){
      // Draw grass directly in world coords (zooms naturally with camera)
      for(var si=0;si<12;si++){
        ctx.fillStyle=si%2===0?"#1d7a32":"#247a38";
        ctx.fillRect(FX,FY+si*(FH/12),FW,FH/12+1.5);
      }
      // Diagonal sheen
      ctx.save();ctx.globalAlpha=0.045;ctx.fillStyle="#a8f5a8";`;

const NEW_DRAWPITCH_GRASS = `    function drawPitch(ctx){
      // Draw grass directly in world coords (zooms naturally with camera)
      for(var si=0;si<14;si++){
        var g1=si%2===0?"#1a7530":"#1f7a35";
        ctx.fillStyle=g1;
        ctx.fillRect(FX,FY+si*(FH/14),FW,FH/14+1);
      }
      // Subtle cross-diagonal texture variation
      ctx.save();ctx.globalAlpha=0.022;ctx.fillStyle="#5fd87a";
      for(var di2=0;di2<FW;di2+=18){
        ctx.fillRect(FX+di2,FY,3,FH);
      }
      ctx.restore();
      // Wet reflection patches (3 random areas, static positions)
      ctx.save();ctx.globalAlpha=0.07;
      [[FCX-60,FCY-20,80,18],[FCX+30,FCY+40,55,12],[FCX-20,FY+FH-30,70,10]].forEach(function(r){
        var wg=ctx.createLinearGradient(r[0],r[1],r[0]+r[2],r[1]+r[3]);
        wg.addColorStop(0,"rgba(255,255,255,0)");wg.addColorStop(0.5,"rgba(255,255,255,0.7)");wg.addColorStop(1,"rgba(255,255,255,0)");
        ctx.fillStyle=wg;ctx.fillRect(r[0],r[1],r[2],r[3]);
      });
      ctx.restore();
      // Diagonal sheen
      ctx.save();ctx.globalAlpha=0.038;ctx.fillStyle="#a8f5a8";`;

html = html.replace(OLD_DRAWPITCH_GRASS, NEW_DRAWPITCH_GRASS);
console.log('Step 10 done');

// ─── STEP 11: Add glow to pitch lines (after ctx.save/shadowColor block) ───
const OLD_LINE_GLOW = `      ctx.save();ctx.shadowColor="rgba(255,255,255,0.3)";ctx.shadowBlur=7;
      ctx.strokeStyle="#fff";ctx.lineWidth=2.2;ctx.strokeRect(FX,FY,FW,FH);ctx.restore();
      ctx.strokeStyle="rgba(255,255,255,0.85)";ctx.lineWidth=1.5;`;

const NEW_LINE_GLOW = `      ctx.save();ctx.shadowColor="rgba(180,255,180,0.55)";ctx.shadowBlur=11;
      ctx.strokeStyle="#e8fef0";ctx.lineWidth=2.4;ctx.strokeRect(FX,FY,FW,FH);ctx.restore();
      ctx.strokeStyle="rgba(255,255,255,0.88)";ctx.lineWidth=1.5;`;

html = html.replace(OLD_LINE_GLOW, NEW_LINE_GLOW);
console.log('Step 11 done');

// ─── STEP 12: Enhance drawWalkout — tunnel entrance + confetti burst ───
const OLD_WALKOUT = `    function drawWalkout(ctx,t){
      var p=propsRef.current;
      s.walkP=Math.min(1,s.walkP+0.005);
      ctx.fillStyle="rgba(3,6,16,0.74)";ctx.fillRect(0,0,PW,PH);
      var tX=FCX,tY=FY+FH-10;
      var tBeam=ctx.createRadialGradient(tX,tY,0,tX,tY,55);
      tBeam.addColorStop(0,"rgba(255,242,150,0.32)");tBeam.addColorStop(1,"rgba(255,242,150,0)");
      ctx.fillStyle=tBeam;ctx.fillRect(tX-55,tY-55,110,65);
      ctx.fillStyle="#040810";ctx.beginPath();ctx.ellipse(tX,tY,20,26,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#f59e0b";ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(tX,tY,20,26,0,0,Math.PI*2);ctx.stroke();
      var np=Math.min(11,Math.floor(s.walkP*14));
      for(var i=0;i<np;i++){
        var pr=Math.min(1,(s.walkP*14-i)/10);
        var isH=i%2===0;
        var col=isH?(p.homeCol||"#22c55e"):(p.oppCol||"#ef4444");
        drawSpr(ctx,tX+(isH?-14:14),tY+(FCY-tY)*pr-2,col,false,i+1,t);
      }
      if(s.walkP>0.55){
        var pp2=Math.min(1,(s.walkP-0.55)/0.45);
        var heroWY=tY+(FCY-tY)*pp2;
        var spot=ctx.createRadialGradient(tX,heroWY,0,tX,heroWY,42);
        spot.addColorStop(0,"rgba(255,242,100,0.2)");spot.addColorStop(1,"rgba(255,242,100,0)");
        ctx.fillStyle=spot;ctx.fillRect(tX-42,heroWY-42,84,84);
        drawSpr(ctx,tX,heroWY,p.homeCol||"#22c55e",true,10,t);
      }
      var hN=(p.homeClub&&(p.homeClub.n||p.homeClub.name))||"HOME";
      var oN=(p.opponents&&p.opponents[0]&&p.opponents[0].name)||"AWAY";
      ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.shadowColor="#f59e0b";ctx.shadowBlur=22;
      ctx.fillStyle="#f59e0b";ctx.font="bold 15px sans-serif";ctx.fillText(hN+"  ⚽  "+oN,PW/2,20);
      ctx.shadowBlur=0;ctx.fillStyle="rgba(255,255,255,0.38)";ctx.font="10px sans-serif";ctx.fillText("KICK OFF",PW/2,34);
      ctx.restore();
      if(s.walkP>=1&&!s.walkDone){s.walkDone=true;if(propsRef.current.onWalkoutDone)propsRef.current.onWalkoutDone();}
    }`;

const NEW_WALKOUT = `    function drawWalkout(ctx,t){
      var p=propsRef.current;
      s.walkP=Math.min(1,s.walkP+0.005);
      // Dark overlay over pitch
      ctx.fillStyle="rgba(2,4,12,0.82)";ctx.fillRect(0,0,PW,PH);
      var tX=FCX,tY=FY+FH-10;
      // --- Tunnel entrance: dark arch at bottom center ---
      ctx.save();
      ctx.fillStyle="#06080f";
      ctx.beginPath();ctx.ellipse(tX,tY+8,28,34,0,Math.PI,Math.PI*2);ctx.fill();
      // Tunnel glow ring
      var tRing=ctx.createRadialGradient(tX,tY,18,tX,tY,38);
      tRing.addColorStop(0,"rgba(245,158,11,0.0)");tRing.addColorStop(0.7,"rgba(245,158,11,0.22)");tRing.addColorStop(1,"rgba(245,158,11,0)");
      ctx.fillStyle=tRing;ctx.beginPath();ctx.ellipse(tX,tY,38,46,0,0,Math.PI*2);ctx.fill();
      // Spotlight cone from tunnel opening
      var cone=ctx.createLinearGradient(tX,tY,tX,tY-120);
      cone.addColorStop(0,"rgba(255,248,180,0.28)");cone.addColorStop(1,"rgba(255,248,180,0)");
      ctx.fillStyle=cone;ctx.beginPath();ctx.moveTo(tX-28,tY);ctx.lineTo(tX+28,tY);ctx.lineTo(tX+70,tY-130);ctx.lineTo(tX-70,tY-130);ctx.closePath();ctx.fill();
      ctx.strokeStyle="rgba(245,158,11,0.7)";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(tX,tY,28,Math.PI,Math.PI*2);ctx.stroke();
      ctx.restore();
      // Players walking out
      var np=Math.min(11,Math.floor(s.walkP*14));
      for(var i=0;i<np;i++){
        var pr=Math.min(1,(s.walkP*14-i)/10);
        var isH=i%2===0;
        var col=isH?(p.homeCol||"#22c55e"):(p.oppCol||"#ef4444");
        var px2=tX+(isH?-16:16);
        var py2=tY+(FCY-60-tY)*pr;
        // Individual spotlight per player as they emerge
        if(pr>0.05){
          var pspot=ctx.createRadialGradient(px2,py2,0,px2,py2,22);
          pspot.addColorStop(0,"rgba(255,248,180,"+(0.12*pr)+")");pspot.addColorStop(1,"rgba(255,248,180,0)");
          ctx.fillStyle=pspot;ctx.fillRect(px2-22,py2-22,44,44);
        }
        drawSpr(ctx,px2,py2,col,false,i+1,t);
      }
      // Hero player with big spotlight
      if(s.walkP>0.55){
        var pp2=Math.min(1,(s.walkP-0.55)/0.45);
        var heroWY=tY+(FCY-55-tY)*pp2;
        var heroSpot=ctx.createRadialGradient(tX,heroWY,0,tX,heroWY,60);
        heroSpot.addColorStop(0,"rgba(255,242,100,0.28)");heroSpot.addColorStop(0.6,"rgba(255,242,100,0.08)");heroSpot.addColorStop(1,"rgba(255,242,100,0)");
        ctx.fillStyle=heroSpot;ctx.fillRect(tX-60,heroWY-60,120,120);
        drawSpr(ctx,tX,heroWY,p.homeCol||"#22c55e",true,10,t);
      }
      // Confetti burst when walkP near 1
      if(s.walkP>0.9){
        var cProgress=(s.walkP-0.9)/0.1;
        var confPal=["#f59e0b","#22c55e","#3b82f6","#ef4444","#a855f7","#fff"];
        for(var ci=0;ci<20;ci++){
          var cSeed=(ci*137.508)%1;
          var cx2=tX-80+cSeed*160;
          var cy2=(FCY-40)-(cProgress*90+ci*3)%80;
          var cCol=confPal[ci%confPal.length];
          ctx.save();ctx.globalAlpha=Math.max(0,0.9-cProgress*0.5);ctx.fillStyle=cCol;
          ctx.fillRect(cx2,cy2,3,6);ctx.restore();
        }
      }
      // Club names header
      var hN=(p.homeClub&&(p.homeClub.n||p.homeClub.name))||"HOME";
      var oN=(p.opponents&&p.opponents[0]&&p.opponents[0].name)||"AWAY";
      ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.shadowColor="#f59e0b";ctx.shadowBlur=28;
      ctx.fillStyle="#fef3c7";ctx.font="bold 14px sans-serif";
      ctx.fillText(hN,PW/2-55,22);ctx.fillText("⚽",PW/2,22);ctx.fillText(oN,PW/2+55,22);
      ctx.shadowBlur=0;
      ctx.fillStyle="rgba(255,255,255,0.3)";ctx.font="9px sans-serif";
      ctx.letterSpacing="3px";ctx.fillText("INGRESSO IN CAMPO",PW/2,36);
      ctx.restore();
      if(s.walkP>=1&&!s.walkDone){s.walkDone=true;if(propsRef.current.onWalkoutDone)propsRef.current.onWalkoutDone();}
    }`;

html = html.replace(OLD_WALKOUT, NEW_WALKOUT);
console.log('Step 12 done');

// ─── STEP 13: In render loop — update livePos with drift targets, then draw drifted players ───
const OLD_ALLPLAYERS_DRAW = `        if(iz){
          drawCtxPlayers(ctx,p,hcx,hcy,t);
        } else {
          var allP=p.allPlayers||[];
          allP.forEach(function(pl,i){
            if(!pl)return;
            var col=pl.team==="home"?(p.homeCol||"#22c55e"):pl.team==="ref"?"#0d0d0d":(p.oppCol||"#ef4444");
            drawSpr(ctx,toX(pl.y||50),toY(pl.x||50),col,false,i+1,t);
          });
        }`;

const NEW_ALLPLAYERS_DRAW = `        if(iz){
          drawCtxPlayers(ctx,p,hcx,hcy,t);
        } else {
          var allP=p.allPlayers||[];
          // Init livePos on first render
          if(s.livePos.length!==allP.length){
            s.livePos=allP.map(function(pl){return{cx:toX(pl?pl.y||50:50),cy:toY(pl?pl.x||50:50)};});
          }
          // Apply drift targets smoothly
          var dt2=p.driftTargets;
          if(dt2){
            dt2.forEach(function(dr){
              if(s.livePos[dr.i]){
                s.livePos[dr.i].cx+=(toX(dr.y)-s.livePos[dr.i].cx)*0.018;
                s.livePos[dr.i].cy+=(toY(dr.x)-s.livePos[dr.i].cy)*0.018;
              }
            });
          }
          // Lerp back toward base formation when no drift for other players
          allP.forEach(function(pl,i){
            if(!pl)return;
            if(!dt2||!dt2.find(function(d){return d.i===i;})){
              var bx=toX(pl.y||50),by=toY(pl.x||50);
              s.livePos[i].cx+=(bx-s.livePos[i].cx)*0.005;
              s.livePos[i].cy+=(by-s.livePos[i].cy)*0.005;
            }
          });
          allP.forEach(function(pl,i){
            if(!pl||!s.livePos[i])return;
            var col=pl.team==="home"?(p.homeCol||"#22c55e"):pl.team==="ref"?"#111":(p.oppCol||"#ef4444");
            drawSpr(ctx,s.livePos[i].cx,s.livePos[i].cy,col,false,i+1,t);
          });
        }`;

html = html.replace(OLD_ALLPLAYERS_DRAW, NEW_ALLPLAYERS_DRAW);
console.log('Step 13 done');

// ─── STEP 14: Mass photo flash burst on wave event (after stand ola) ───
// Insert after the fog drawing in drawBg, inject logic using s.photoFlashT
// We'll check waveEvent via propsRef inside drawBg
// Simpler: add a waveFlash effect inside render loop in screen space (after ctx.restore)
const OLD_VIGNETTE = `      if(p.matchPhase==="walkout")drawWalkout(ctx,t);
      var vg=ctx.createRadialGradient(PW/2,PH/2,PH*0.22,PW/2,PH/2,PH*0.72);
      vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,0.5)");
      ctx.fillStyle=vg;ctx.fillRect(0,0,PW,PH);`;

const NEW_VIGNETTE = `      if(p.matchPhase==="walkout")drawWalkout(ctx,t);
      var vg=ctx.createRadialGradient(PW/2,PH/2,PH*0.22,PW/2,PH/2,PH*0.72);
      vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,0.5)");
      ctx.fillStyle=vg;ctx.fillRect(0,0,PW,PH);
      // Wave event: mass photo flash across stands for 1.2s after goal
      var we=p.waveEvent;
      if(we){
        var wAge=(t-(we.t||0))/1000;
        if(wAge<1.2){
          var wAlpha=Math.max(0,(0.5-wAge*0.4));
          for(var wfi=0;wfi<28;wfi++){
            var wfx=FX+Math.random()*FW,wfy=Math.random()<0.5?(2+Math.random()*(FY-5)):(FY+FH+2+Math.random()*(PH-FY-FH-4));
            var wfg=ctx.createRadialGradient(wfx,wfy,0,wfx,wfy,10);
            wfg.addColorStop(0,"rgba(255,255,255,"+wAlpha+")");wfg.addColorStop(1,"rgba(255,255,255,0)");
            ctx.fillStyle=wfg;ctx.fillRect(wfx-10,wfy-10,20,20);
          }
        }
      }`;

html = html.replace(OLD_VIGNETTE, NEW_VIGNETTE);
console.log('Step 14 done');

// Write output
fs.writeFileSync(path, html, 'utf8');
console.log('Patch complete. File size:', fs.statSync(path).size);
