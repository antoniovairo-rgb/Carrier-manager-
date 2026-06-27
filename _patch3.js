// _patch3.js — Live Match sync: ball position, player names, stats, trail, camera follow
const fs = require('fs');
const path = 'C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html';
let html = fs.readFileSync(path, 'utf8');

// ─── STEP 1: Replace BG_MATCH with version that has bpos, name templates, and stat effects ───
const OLD_BG = `const BG_MATCH=[
  // Goals (very rare — primary scoring comes from interactive highlights)
  {txt:"⚽ Gol del compagno! Squadra avanti.",ef:"team_goal",w:0.4},
  {txt:"😨 Rete avversaria. Situazione complicata.",ef:"opp_goal",w:0.4},
  // Possession
  {txt:"🔵 La squadra controlla bene il possesso.",ef:null,w:4,poss:+2},
  {txt:"🏃 Scambio rapido in centrocampo. Palla conservata.",ef:null,w:3,poss:+1},
  {txt:"🔄 Cambio di gioco sulla fascia opposta.",ef:null,w:3,poss:+1},
  {txt:"😤 L'avversario recupera palla e riparte.",ef:null,w:3,poss:-2},
  {txt:"⚡ Contropiede avversario sventato in extremis.",ef:null,w:2,poss:-1},
  // Attacks
  {txt:"💥 Tiro da fuori area, para il portiere.",ef:null,w:3},
  {txt:"🔥 Il compagno sfiora il vantaggio! Palo!",ef:null,w:2},
  {txt:"🎯 Cross pericoloso, respinto dalla difesa.",ef:null,w:3},
  {txt:"⚡ Azione veloce sulla fascia. Corner guadagnato.",ef:null,w:2},
  {txt:"💪 Combinazione riuscita in area! Difesa salva.",ef:null,w:2},
  {txt:"🌀 Dribbling netto! Ottima posizione.",ef:null,w:2},
  // Defense
  {txt:"🧤 Grande parata del portiere!",ef:null,w:2},
  {txt:"🛡️ Tackle in scivolata! Palla recuperata.",ef:null,w:3,poss:+2},
  {txt:"⚠️ Pericolo! L'avversario entra in area.",ef:null,w:2},
  {txt:"🚧 Fuorigioco! Liberazione della difesa.",ef:null,w:3},
  // Set pieces
  {txt:"🟡 Fallo pericoloso. Punizione guadagnata.",ef:null,w:2},
  {txt:"🟡 Ammonito un avversario.",ef:null,w:2},
  {txt:"🏳️ Calcio d'angolo per noi.",ef:null,w:2},
  {txt:"🏳️ Corner avversario. Difesa attenta.",ef:null,w:2},
  // Tactical / atmosphere
  {txt:"📢 Il mister urla istruzioni dalla panchina.",ef:null,w:2},
  {txt:"🔥 La squadra spinge forte! Intensità alta.",ef:null,w:3},
  {txt:"😤 L'avversario alza il ritmo. Attenzione.",ef:null,w:2},
  {txt:"📊 Partita equilibrata. Entrambe le squadre ci credono.",ef:null,w:3},
  {txt:"🏃 La squadra avversaria si chiude in difesa.",ef:null,w:2},
  {txt:"✨ Grande combinazione sulla fascia.",ef:null,w:2},
  {txt:"🔄 Cambio tattico avversario. Più pressing.",ef:null,w:2},
  // Late game events
  {txt:"⏱️ Il tempo stringe. Occorre sbloccarla!",ef:null,w:4,minClock:70},
  {txt:"🔥 Pressione massima! Tifosi scatenati.",ef:null,w:3,minClock:75},
  {txt:"💊 Sostituzione avversaria. Cambio fresco.",ef:null,w:2,minClock:60},
  {txt:"😓 Le gambe pesano. Bisogna reggere.",ef:null,w:2,minClock:80},
];`;

const NEW_BG = `const BG_MATCH=[
  // Goals (very rare)
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
  {txt:"😓 Le gambe pesano. {H} deve reggere.",ef:null,w:2,minClock:80,bpos:{x:50,y:50}},
];`;

if (!html.includes(OLD_BG.slice(0,60))) {
  console.error('STEP 1 FAILED: BG_MATCH not found');
  process.exit(1);
}
html = html.replace(OLD_BG, NEW_BG);
console.log('Step 1 done');

// ─── STEP 2: Add ballPos and matchStats states in LiveMatch ───
// Find after const [pressureBar,setPressureBar]=useState(1);
const OLD_STATES = `  const pressureRef=useRef(1);                        // 0..1 depleting during hl_move
  const [pressureBar,setPressureBar]=useState(1);`;

const NEW_STATES = `  const pressureRef=useRef(1);                        // 0..1 depleting during hl_move
  const [pressureBar,setPressureBar]=useState(1);
  const [ballPos,setBallPos]=useState({x:50,y:50});   // game coords 0-100, synced from BG_MATCH
  const [mxStats,setMxStats]=useState({shots:0,oppShots:0,fouls:0,corners:0}); // live match stats`;

html = html.replace(OLD_STATES, NEW_STATES);
console.log('Step 2 done');

// ─── STEP 3: In the clock tick, inject name resolution + ballPos + mxStats update ───
const OLD_PICK = `          const eligible=BG_MATCH.filter(e=>!e.minClock||nx>=e.minClock);
          const ev=wPick(eligible);
          if(ev.ef==="team_goal")setScore(s=>({...s,home:s.home+1}));
          if(ev.ef==="opp_goal"){setScore(s=>({...s,away:s.away+1}));setPossession(p=>clamp(p-4,20,80));}
          if(ev.poss)setPossession(p=>clamp(p+(ev.poss||0),20,80));
          const cColor=ev.ef==="team_goal"?"#16a34a":ev.ef==="opp_goal"?"#dc2626":TH.faint;
          addCom(ev.txt,cColor,nx);`;

const NEW_PICK = `          const eligible=BG_MATCH.filter(e=>!e.minClock||nx>=e.minClock);
          const ev=wPick(eligible);
          if(ev.ef==="team_goal")setScore(s=>({...s,home:s.home+1}));
          if(ev.ef==="opp_goal"){setScore(s=>({...s,away:s.away+1}));setPossession(p=>clamp(p-4,20,80));setScreenFlash({col:"rgba(239,68,68,0.22)",dur:500});}
          if(ev.poss)setPossession(p=>clamp(p+(ev.poss||0),20,80));
          if(ev.bpos)setBallPos(ev.bpos);
          if(ev.ms)setMxStats(s=>({shots:s.shots+(ev.ms.shots||0),oppShots:s.oppShots+(ev.ms.oppShots||0),fouls:s.fouls+(ev.ms.fouls||0),corners:s.corners+(ev.ms.corners||0)}));
          // Resolve {H},{H2},{A} name tokens from rosters
          const hN=homeRoster[Math.floor(Math.random()*(homeRoster.length-1))].name.split(" ").pop();
          const hN2=homeRoster[Math.floor(Math.random()*(homeRoster.length-1))].name.split(" ").pop();
          const aN=awayRoster[Math.floor(Math.random()*awayRoster.length)].name.split(" ").pop();
          const evTxt=ev.txt.replace(/\{H2\}/g,hN2).replace(/\{H\}/g,hN).replace(/\{A\}/g,aN);
          const cColor=ev.ef==="team_goal"?"#16a34a":ev.ef==="opp_goal"?"#dc2626":TH.faint;
          addCom(evTxt,cColor,nx);`;

html = html.replace(OLD_PICK, NEW_PICK);
console.log('Step 3 done');

// ─── STEP 4: Pass ballPos to PitchCanvas ───
const OLD_PC_TAG = `            <PitchCanvas playerX={pPos.x} playerY={pPos.y} zone={zone}
              homeCol={player.club?.col||player.club?.c||"#22c55e"} oppCol={opponent?.col||opponent?.c||"#ef4444"}
              opponents={opponents.current} matchPhase={matchPhase3D} avatarId={player.avatarId||0}
              actionZoom={phase==="hl_move"||phase==="hl_choose"||phase==="hl_result"}
              allPlayers={matchPlayers}
              homeClub={player.club||opponent}
              onWalkoutDone={()=>setPhase("playing")}/>`;

const NEW_PC_TAG = `            <PitchCanvas playerX={pPos.x} playerY={pPos.y} zone={zone}
              homeCol={player.club?.col||player.club?.c||"#22c55e"} oppCol={opponent?.col||opponent?.c||"#ef4444"}
              opponents={opponents.current} matchPhase={matchPhase3D} avatarId={player.avatarId||0}
              actionZoom={phase==="hl_move"||phase==="hl_choose"||phase==="hl_result"}
              allPlayers={matchPlayers}
              homeClub={player.club||opponent}
              ballX={ballPos.x} ballY={ballPos.y}
              onWalkoutDone={()=>setPhase("playing")}/>`;

html = html.replace(OLD_PC_TAG, NEW_PC_TAG);
console.log('Step 4 done');

// ─── STEP 5: Update PitchCanvas signature to accept ballX, ballY ───
const OLD_PC_SIG = `function PitchCanvas({playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub}){`;
const NEW_PC_SIG = `function PitchCanvas({playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX,ballY}){`;
html = html.replace(OLD_PC_SIG, NEW_PC_SIG);
console.log('Step 5 done');

// ─── STEP 6: Update propsRef in PitchCanvas to include ballX, ballY ───
const OLD_PROPSREF = `  const propsRef=useRef({playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub});
  useEffect(()=>{propsRef.current={playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub};},[playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub]);`;

const NEW_PROPSREF = `  const propsRef=useRef({playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX:ballX||50,ballY:ballY||50});
  useEffect(()=>{propsRef.current={playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX:ballX||50,ballY:ballY||50};},[playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX,ballY]);`;

html = html.replace(OLD_PROPSREF, NEW_PROPSREF);
console.log('Step 6 done');

// ─── STEP 7: Add ballHistory to stateRef ───
const OLD_STATEREF = `  const stateRef=useRef({
    camX:PC_FCX,camY:PC_FCY,camZ:1,
    ballCx:PC_FCX,ballCy:PC_FCY,
    prevPX:50,prevPY:50,isMoving:false,movT:0,
    walkP:0,walkDone:false,
    particles:[],fid:null
  });`;

const NEW_STATEREF = `  const stateRef=useRef({
    camX:PC_FCX,camY:PC_FCY,camZ:1,
    ballCx:PC_FCX,ballCy:PC_FCY,
    prevPX:50,prevPY:50,isMoving:false,movT:0,
    walkP:0,walkDone:false,
    particles:[],fid:null,
    ballHistory:[]   // trail: last 8 {x,y} positions
  });`;

html = html.replace(OLD_STATEREF, NEW_STATEREF);
console.log('Step 7 done');

// ─── STEP 8: Update render loop — ball target from ballX/ballY when not zoomed, camera follows ball, trail ───
const OLD_BALL_LERP = `      s.ballCx+=(hcx+(iz?6:2)-s.ballCx)*0.12;
      s.ballCy+=(hcy+(iz?3:1)-s.ballCy)*0.12;`;

const NEW_BALL_LERP = `      // Ball target: follow player when zoom active, else follow ballX/ballY prop
      var tBx=iz?hcx+6:toX(p.ballY||50);
      var tBy=iz?hcy+3:toY(p.ballX||50);
      s.ballHistory.push({x:s.ballCx,y:s.ballCy});
      if(s.ballHistory.length>8)s.ballHistory.shift();
      s.ballCx+=(tBx-s.ballCx)*(iz?0.12:0.06);
      s.ballCy+=(tBy-s.ballCy)*(iz?0.12:0.06);
      // Camera: during non-zoom gently drift toward ball
      if(!iz){s.camX+=(s.ballCx-s.camX)*0.012;s.camY+=(s.ballCy-s.camY)*0.012;}`;

html = html.replace(OLD_BALL_LERP, NEW_BALL_LERP);
console.log('Step 8 done');

// ─── STEP 9: Draw ball trail before ball ───
const OLD_DRAW_BALL = `        drawSpr(ctx,hcx,hcy,p.homeCol||"#22c55e",true,10,t);
        drawBall(ctx,s.ballCx,s.ballCy,t);`;

const NEW_DRAW_BALL = `        drawSpr(ctx,hcx,hcy,p.homeCol||"#22c55e",true,10,t);
        // Ball trail
        for(var ti=0;ti<s.ballHistory.length;ti++){
          var th=s.ballHistory[ti];
          var ta=(ti+1)/s.ballHistory.length*0.38;
          var tr=2.5*(ti+1)/s.ballHistory.length;
          ctx.save();ctx.globalAlpha=ta;ctx.fillStyle="#fffde4";
          ctx.beginPath();ctx.arc(th.x,th.y,tr,0,Math.PI*2);ctx.fill();ctx.restore();
        }
        drawBall(ctx,s.ballCx,s.ballCy,t);`;

html = html.replace(OLD_DRAW_BALL, NEW_DRAW_BALL);
console.log('Step 9 done');

// ─── STEP 10: Replace match stats strip UI (goals/assists/energy/zone) with expanded version ───
const OLD_STATS_STRIP = `      {/* Match stats strip */}
      {show3D&&(
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          {[{l:"⚽ Gol",v:mStats.goals},{l:"🎯 Assist",v:mStats.assists}].map(s=>(
            <Card key={s.l} style={{flex:1,padding:"7px",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:900,color:TH.text}}>{s.v}</div>
              <div style={{fontSize:10,color:TH.muted}}>{s.l}</div>
            </Card>
          ))}
          <Card style={{flex:1,padding:"7px",textAlign:"center"}}>
            <div style={{fontSize:12,fontWeight:700,color:energy>50?TH.success:energy>25?TH.warning:TH.danger}}>{energy}%</div>
            <div style={{fontSize:10,color:TH.muted}}>⚡ Energ.</div>
          </Card>
          <Card style={{flex:2,padding:"7px",textAlign:"center"}}>
            <div style={{fontSize:10,color:TH.primary,fontWeight:700}}>{ZONES[zone]?.label||zone}</div>
            <div style={{fontSize:9,color:TH.faint}}>zona</div>
          </Card>
        </div>
      )}`;

const NEW_STATS_STRIP = `      {/* Match stats strip */}
      {show3D&&(
        <div style={{marginBottom:8}}>
          {/* Row 1: player stats */}
          <div style={{display:"flex",gap:5,marginBottom:5}}>
            {[{l:"⚽ Gol",v:mStats.goals,c:TH.success},{l:"🎯 Assist",v:mStats.assists,c:TH.primary}].map(s=>(
              <Card key={s.l} style={{flex:1,padding:"6px",textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:9,color:TH.muted,marginTop:2}}>{s.l}</div>
              </Card>
            ))}
            <Card style={{flex:1,padding:"6px",textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:800,color:energy>50?TH.success:energy>25?TH.warning:TH.danger,lineHeight:1}}>{energy}%</div>
              <div style={{fontSize:9,color:TH.muted,marginTop:2}}>⚡ Energia</div>
            </Card>
            <Card style={{flex:1.5,padding:"6px",textAlign:"center"}}>
              <div style={{fontSize:9,color:TH.primary,fontWeight:700,lineHeight:1.2}}>{ZONES[zone]?.label||zone}</div>
              <div style={{fontSize:8,color:TH.faint,marginTop:2}}>📍 zona</div>
            </Card>
          </div>
          {/* Row 2: match stats */}
          <Card style={{padding:"7px 10px"}} shadow={false} bg="#f8fafc">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:4}}>
              {[
                {l:"Tiri",hv:mxStats.shots,av:mxStats.oppShots,icon:"💥"},
                {l:"Falli",hv:mxStats.fouls,av:Math.max(0,mxStats.fouls-1),icon:"🟡"},
                {l:"Corner",hv:mxStats.corners,av:Math.max(0,mxStats.corners-1),icon:"🏳️"},
              ].map(st=>(
                <div key={st.l} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:8,color:TH.faint,marginBottom:2}}>{st.icon} {st.l}</div>
                  <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6}}>
                    <span style={{fontSize:12,fontWeight:800,color:TH.success}}>{st.hv}</span>
                    <span style={{fontSize:8,color:TH.faint}}>–</span>
                    <span style={{fontSize:12,fontWeight:800,color:TH.danger}}>{st.av}</span>
                  </div>
                </div>
              ))}
              <div style={{flex:1,textAlign:"center"}}>
                <div style={{fontSize:8,color:TH.faint,marginBottom:2}}>🏃 Poss.</div>
                <div style={{fontSize:9,fontWeight:700,color:TH.primary}}>{possession}%</div>
              </div>
            </div>
          </Card>
        </div>
      )}`;

html = html.replace(OLD_STATS_STRIP, NEW_STATS_STRIP);
console.log('Step 10 done');

// ─── STEP 11: Update possession bar in scoreboard — TV-style with team colors ───
const OLD_POSS_BAR = `              {show3D&&<div style={{marginTop:4,padding:"0 6px"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginBottom:2}}>
                  <span style={{color:TH.success,fontWeight:700}}>{possession}%</span>
                  <span style={{color:TH.faint,fontSize:8}}>poss.</span>
                  <span style={{color:TH.danger,fontWeight:700}}>{100-possession}%</span>
                </div>
                <div style={{height:3,background:"#e2e8f0",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:\`\${possession}%\`,background:\`linear-gradient(90deg,\${TH.success},\${TH.primary})\`,borderRadius:2,transition:"width .8s"}}/>
                </div>
              </div>}`;

const NEW_POSS_BAR = `              {show3D&&<div style={{marginTop:4,padding:"0 4px"}}>
                <div style={{height:7,background:"#e2e8f0",borderRadius:4,overflow:"hidden",display:"flex",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.12)"}}>
                  <div style={{width:\`\${possession}%\`,background:player.club?.c||player.club?.col||TH.success,transition:"width .8s",borderRadius:"4px 0 0 4px"}}/>
                  <div style={{flex:1,background:opponent?.c||opponent?.col||TH.danger,borderRadius:"0 4px 4px 0"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:8,marginTop:1,color:TH.faint}}>
                  <span style={{fontWeight:700}}>{possession}%</span>
                  <span>possesso</span>
                  <span style={{fontWeight:700}}>{100-possession}%</span>
                </div>
              </div>}`;

html = html.replace(OLD_POSS_BAR, NEW_POSS_BAR);
console.log('Step 11 done');

// ─── STEP 12: Enhance scoreboard header — TV broadcast style with live dot ───
const OLD_SCOREBOARD = `          {/* Scoreboard */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 18px",borderBottom:"1px solid "+TH.cardBorder,background:"#f8fafc"}}>
            <div style={{textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
              <TeamBadge team={player.club||opponent} size={28}/>
              <div><div style={{fontSize:9,color:TH.muted,fontWeight:700}}>{player.club?.abbr||player.club?.a||"TUA"}</div><div style={{fontSize:34,fontWeight:900,color:TH.success,lineHeight:1}}>{score.home}</div></div>
            </div>
            <div style={{textAlign:"center",flex:1}}>
              <div style={{display:"inline-block",padding:"3px 12px",borderRadius:20,fontSize:13,fontWeight:800,background:winning?"#dcfce7":losing?"#fee2e2":"#f1f5f9",color:winning?TH.success:losing?TH.danger:TH.muted,border:\`1px solid \${winning?"#bbf7d0":losing?"#fecaca":TH.cardBorder}\`}}>{phase==="walkout"?"🏃":phase==="ended"?"90'":phase==="matchday"||phase==="formations"?"–":\`\${clock}'\`}</div>
              <div style={{fontSize:8,color:TH.faint,marginTop:2}}>{phase==="walkout"?"Ingresso":phase==="ended"?"Fine":\`Azione \${hlIdx+1}/\${numHL}\`}</div>`;

const NEW_SCOREBOARD = `          {/* Scoreboard */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",borderBottom:"1px solid "+TH.cardBorder,background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)"}}>
            <div style={{textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
              <TeamBadge team={player.club||opponent} size={28}/>
              <div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.5)",fontWeight:700,letterSpacing:1}}>{player.club?.abbr||player.club?.a||"TUA"}</div>
                <div style={{fontSize:36,fontWeight:900,color:winning?"#4ade80":"#f1f5f9",lineHeight:1,textShadow:winning?"0 0 20px #22c55e":""}}>{score.home}</div>
              </div>
            </div>
            <div style={{textAlign:"center",flex:1}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:2}}>
                {phase==="playing"&&<div style={{width:6,height:6,borderRadius:"50%",background:"#ef4444",animation:"pulse 1s infinite"}}/>}
                <div style={{padding:"2px 10px",borderRadius:14,fontSize:12,fontWeight:800,background:winning?"rgba(34,197,94,0.2)":losing?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.1)",color:winning?"#4ade80":losing?"#f87171":"#f1f5f9",border:\`1px solid \${winning?"rgba(34,197,94,0.4)":losing?"rgba(239,68,68,0.4)":"rgba(255,255,255,0.2)"}\`}}>{phase==="walkout"?"🏃":phase==="ended"?"FT":phase==="matchday"||phase==="formations"?"–":\`\${clock}'\`}</div>
              </div>
              <div style={{fontSize:7,color:"rgba(255,255,255,0.3)",marginTop:0,letterSpacing:1,textTransform:"uppercase"}}>{phase==="walkout"?"Ingresso in campo":phase==="ended"?"Fischio finale":\`Highlight \${hlIdx+1}/\${numHL}\`}</div>`;

html = html.replace(OLD_SCOREBOARD, NEW_SCOREBOARD);
console.log('Step 12 done');

// ─── STEP 13: Fix away score section to match dark theme ───
const OLD_AWAY = `            <div style={{textAlign:"right",display:"flex",alignItems:"center",gap:8,flexDirection:"row-reverse"}}>
              <TeamBadge team={opponent} size={28}/>
              <div><div style={{fontSize:9,color:TH.muted,fontWeight:700}}>{opponent?.abbr||opponent?.a}</div><div style={{fontSize:34,fontWeight:900,color:TH.danger,lineHeight:1}}>{score.away}</div></div>
            </div>`;

const NEW_AWAY = `            <div style={{textAlign:"right",display:"flex",alignItems:"center",gap:8,flexDirection:"row-reverse"}}>
              <TeamBadge team={opponent} size={28}/>
              <div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.5)",fontWeight:700,letterSpacing:1}}>{opponent?.abbr||opponent?.a}</div>
                <div style={{fontSize:36,fontWeight:900,color:losing?"#f87171":"#f1f5f9",lineHeight:1,textShadow:losing?"0 0 20px #ef4444":""}}>{score.away}</div>
              </div>
            </div>`;

html = html.replace(OLD_AWAY, NEW_AWAY);
console.log('Step 13 done');

// ─── STEP 14: Add @keyframes pulse to existing CSS animations ───
const OLD_CSS = `@keyframes shrinkBar{from{width:100%}to{width:0%}}
@keyframes fadeFlash{from{opacity:1}to{opacity:0}}
@keyframes floatUp{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-60px)}}`;

const NEW_CSS = `@keyframes shrinkBar{from{width:100%}to{width:0%}}
@keyframes fadeFlash{from{opacity:1}to{opacity:0}}
@keyframes floatUp{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-60px)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}`;

html = html.replace(OLD_CSS, NEW_CSS);
console.log('Step 14 done');

// Write output
fs.writeFileSync(path, html, 'utf8');
console.log('Patch complete. File size:', fs.statSync(path).size);
