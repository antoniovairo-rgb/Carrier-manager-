// _fix_highlights.js — Fix highlight view, penalty arc, camera zoom, pressure bar, hl_intro
const fs=require('fs');
const path='C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html';
let html=fs.readFileSync(path,'utf8');
let ok=0,fail=0;

function rep(label,old,neu){
  if(!html.includes(old)){console.log('FAIL:',label,'\n  anchor:',JSON.stringify(old.slice(0,70)));fail++;return false;}
  html=html.replace(old,neu);console.log('OK:',label);ok++;return true;
}

// ─── 1. Remove shoulder cam from highlights — actionZoom always false ───
rep('actionZoom always false',
  `actionZoom={phase==="hl_move"||phase==="hl_choose"||phase==="hl_result"}`,
  `actionZoom={false}`
);

// ─── 2. Camera zoom in top-down view for highlights (focus on player) ───
rep('camera zoom for highlights',
  `        // --- Top-down full pitch view with smooth camera ---
        const targetX=FCX,targetY=FCY;
        const lerpS=0.06;
        s.camX+=(targetX-s.camX)*lerpS;
        s.camY+=(targetY-s.camY)*lerpS;
        s.camZoom+=(1.0-s.camZoom)*lerpS;`,
  `        // --- Top-down full pitch view with smooth camera ---
        const isHL=["hl_move","hl_choose","hl_result","hl_intro"].includes(p.matchPhase);
        const targetZoom=isHL?1.65:1.0;
        const targetCX=isHL?gx(p.playerY):FCX;
        const targetCY=isHL?gy(p.playerX):FCY;
        const lerpS=isHL?0.05:0.06;
        s.camX+=(targetCX-s.camX)*lerpS;
        s.camY+=(targetCY-s.camY)*lerpS;
        s.camZoom+=(targetZoom-s.camZoom)*lerpS;`
);

// ─── 3. Add penalty arc (lunetta) to drawPitch ───
rep('penalty arc lunetta',
  `      // Goals (nets) outside field`,
  `      // Penalty arc (lunetta) — arc OUTSIDE penalty box
      const arcR=FH*0.095;
      ctx.beginPath();ctx.arc(FCX,FY+paH,arcR,Math.PI,0,true);ctx.stroke();  // top arc
      ctx.beginPath();ctx.arc(FCX,FY+FH-paH,arcR,0,Math.PI,true);ctx.stroke(); // bottom arc
      // Goals (nets) outside field`
);

// ─── 4. Add hl_intro overlay before hl_move overlay ───
rep('hl_intro overlay',
  `            {/* HL_MOVE overlay */}
            {phase==="hl_move"&&curSit&&(`,
  `            {/* HL_INTRO overlay — situazione narrativa, auto-avanza dopo 2.5s */}
            {phase==="hl_intro"&&curSit&&(
              <div style={{position:"absolute",inset:0,background:"rgba(5,8,20,0.88)",backdropFilter:"blur(6px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:8,padding:"0 20px"}} onClick={()=>{const mm=situations[hlIdx]?.maxMoves??1;movesLeftRef.current=mm;setMovesLeft(mm);moveCoolRef.current=0;pressureRef.current=1;setPressureBar(1);setPhase("hl_move");}}>
                <div style={{fontSize:24,marginBottom:10}}>{"⚽"}</div>
                <div style={{fontSize:17,fontWeight:900,color:"#f59e0b",textAlign:"center",marginBottom:10,textShadow:"0 0 20px #f59e0b"}}>{curSit.text}</div>
                {introText&&<div style={{fontSize:12,color:"rgba(255,255,255,0.8)",textAlign:"center",fontStyle:"italic",marginBottom:16,lineHeight:1.45}}>{introText}</div>}
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>
                  {curSit.type==="def"?"🛡️ FASE DIFENSIVA":"⚔️ OCCASIONE OFFENSIVA"}
                </div>
                <div style={{width:110,height:3,background:"rgba(255,255,255,0.15)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",background:"#f59e0b",animation:"shrinkBar 2.5s linear forwards",borderRadius:2}}/>
                </div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:8}}>Tocca per iniziare subito</div>
              </div>
            )}

            {/* HL_MOVE overlay */}
            {phase==="hl_move"&&curSit&&(`
);

// ─── 5. Add pressure bar inside hl_move overlay (after dots counter) ───
rep('pressure bar in hl_move overlay',
  `                    {curSit.maxMoves>0&&<span style={{marginLeft:8,color:"#60a5fa",fontWeight:700}}>
                        {"●".repeat(movesLeft)}{"○".repeat(Math.max(0,curSit.maxMoves-movesLeft))} {movesLeft} rimasti
                      </span>}`,
  `                    {curSit.maxMoves>0&&<span style={{marginLeft:8,color:"#60a5fa",fontWeight:700}}>
                        {"●".repeat(movesLeft)}{"○".repeat(Math.max(0,curSit.maxMoves-movesLeft))} {movesLeft} mov
                      </span>}
                      {curSit.maxMoves>0&&<div style={{marginTop:3,height:3,background:"rgba(255,255,255,0.15)",borderRadius:2}}>
                        <div style={{height:"100%",width:(pressureBar*100)+"%",background:pressureBar>0.4?"#f59e0b":pressureBar>0.2?"#f97316":"#ef4444",borderRadius:2,transition:"width 0.1s linear"}}/>
                      </div>}`
);

// ─── 6. Opponent counter-move useEffect during hl_move ───
// Inject after the pressure timer useEffect
rep('opponent counter-move useEffect',
  `  // Flash cleanup`,
  `  // Opponent counter-move during hl_move — opponents converge on player after 2s
  useEffect(()=>{
    if(phase!=="hl_move")return;
    const t=setTimeout(()=>{
      // Move away players toward player position (pressure)
      setMatchPlayers(prev=>prev.map(pl=>{
        if(pl.team!=="away")return pl;
        const dx=pPos.x-pl.x,dy=pPos.y-pl.y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<20)return pl; // already close enough
        const step=Math.min(8,dist*0.25);
        return{...pl,x:pl.x+dx/dist*step,y:pl.y+dy/dist*step};
      }));
    },2200);
    return()=>clearTimeout(t);
  },[phase,pPos.x,pPos.y]);// eslint-disable-line

  // Flash cleanup`
);

// Brace check + save
let b=0;for(const c of html){if(c==='{')b++;else if(c==='}')b--;}
console.log('\n=== RESULT ===');
console.log('Applied:',ok,'Failed:',fail,'Brace balance:',b);
if(b!==0){console.error('BRACE IMBALANCE — not saving');process.exit(1);}
fs.writeFileSync(path,html,'utf8');
console.log('Saved.',html.length,'bytes');
