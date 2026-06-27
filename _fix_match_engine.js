// _fix_match_engine.js — Complete match engine + highlights AI fix
// Fixes: S() maxMoves, introText, duplicate hl_intro, keyboard RAF, AI movement, clock→hl_intro
const fs=require('fs');
const path='C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html';
let html=fs.readFileSync(path,'utf8');
let ok=0,fail=0;
function rep(label,old,neu){
  if(!html.includes(old)){console.log('FAIL:',label,'\n  anchor:',JSON.stringify(old.slice(0,90)));fail++;return false;}
  html=html.replace(old,neu);console.log('OK:',label);ok++;return true;
}

// ══════════════════════════════════════════════════════════════════════════
// FIX 1: S() helper — add maxMoves (7th param), intro (8th), type (9th)
//        + smart inference from zones when mm not explicitly set
// ══════════════════════════════════════════════════════════════════════════
rep('S() helper with maxMoves + intro + type',
  `const S=(text,zones,mz,sz,actions,lock=false)=>({text,zones,moveZone:mz,startZone:sz,actions,lockMovement:lock});`,
  `const S=(text,zones,mz,sz,actions,lock=false,mm=-1,intro="",type="off")=>{
  // Infer maxMoves from first zone when not explicitly passed (mm=-1)
  const z0=zones[0];
  const inferredMM=mm>=0?mm:z0==="area"?2:z0==="bordo"?2:3;
  return{text,zones,moveZone:mz,startZone:sz,actions,lockMovement:lock,maxMoves:lock?0:inferredMM,intro,type};
};`
);

// ══════════════════════════════════════════════════════════════════════════
// FIX 2: introText undeclared — replace with curSit?.intro in both overlays
// ══════════════════════════════════════════════════════════════════════════
rep('introText → curSit.intro (overlay 1)',
  `{introText&&<div style={{fontSize:13,color:"rgba(255,255,255,0.8)",textAlign:"center",fontStyle:"italic",marginBottom:18,lineHeight:1.4}}>{introText}</div>}`,
  `{curSit.intro&&<div style={{fontSize:13,color:"rgba(255,255,255,0.8)",textAlign:"center",fontStyle:"italic",marginBottom:18,lineHeight:1.4}}>{curSit.intro}</div>}`
);
rep('introText → curSit.intro (overlay 2)',
  `{introText&&<div style={{fontSize:12,color:"rgba(255,255,255,0.8)",textAlign:"center",fontStyle:"italic",marginBottom:16,lineHeight:1.45}}>{introText}</div>}`,
  `{curSit.intro&&<div style={{fontSize:12,color:"rgba(255,255,255,0.8)",textAlign:"center",fontStyle:"italic",marginBottom:16,lineHeight:1.45}}>{curSit.intro}</div>}`
);

// ══════════════════════════════════════════════════════════════════════════
// FIX 3: Remove duplicate hl_intro overlay (first one, no onClick/tap handler)
// ══════════════════════════════════════════════════════════════════════════
rep('remove duplicate hl_intro overlay (no onClick)',
  `            {/* HL_INTRO overlay — narrative screen */}
            {phase==="hl_intro"&&curSit&&(
              <div style={{position:"absolute",inset:0,background:"rgba(5,8,20,0.88)",backdropFilter:"blur(6px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:8,padding:"0 20px"}}>
                <div style={{fontSize:22,marginBottom:12}}>{"⚽"}</div>
                <div style={{fontSize:16,fontWeight:900,color:"#f59e0b",textAlign:"center",marginBottom:10,textShadow:"0 0 20px #f59e0b"}}>{curSit.text}</div>
                {curSit.intro&&<div style={{fontSize:13,color:"rgba(255,255,255,0.8)",textAlign:"center",fontStyle:"italic",marginBottom:18,lineHeight:1.4}}>{curSit.intro}</div>}
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>
                  {curSit.type==="def"?"🛡️ FASE DIFENSIVA":"⚔️ OCCASIONE OFFENSIVA"}
                </div>
                <div style={{width:120,height:3,background:"rgba(255,255,255,0.15)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",background:"#f59e0b",animation:"shrinkBar 2.5s linear forwards",borderRadius:2}}/>
                </div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:8}}>Tocca per iniziare subito</div>
              </div>
            )}

            {/* HL_INTRO overlay — situazione narrativa, auto-avanza dopo 2.5s */}`,
  `            {/* HL_INTRO overlay — narrative, auto-advance after 2.5s, tap/click to skip */}`
);

// ══════════════════════════════════════════════════════════════════════════
// FIX 4: Clock tick → hl_intro (narrative phase) instead of directly hl_move
// ══════════════════════════════════════════════════════════════════════════
rep('clock tick → hl_intro instead of hl_move',
  `if(hlIdx<hlTimes.length&&nx>=hlTimes[hlIdx]){setPhase("hl_move");return nx;}`,
  `if(hlIdx<hlTimes.length&&nx>=hlTimes[hlIdx]){setPhase("hl_intro");return nx;}`
);

// ══════════════════════════════════════════════════════════════════════════
// FIX 5: Keyboard RAF — add movesLeft check + cooldown (prevent infinite moves)
//        Also: remove auto-advance to hl_choose on first move (was wrong)
// ══════════════════════════════════════════════════════════════════════════
rep('keyboard RAF with movesLeft check + cooldown',
  `  // Movement RAF — req #3: movement limited by situation moveZone
  useEffect(()=>{
    if(phase!=="hl_move"&&phase!=="hl_choose"){if(moveRef.current)cancelAnimationFrame(moveRef.current);return;}
    const sit=situations[hlIdx];
    const mz=sit?.moveZone||{x:[0,100],y:[0,100]};
    const loop=()=>{
      const k=keysRef.current;let dx=0,dy=0;
      if(k.has("ArrowUp")   ||k.has("w"))dx=+1.8;
      if(k.has("ArrowDown") ||k.has("s"))dx=-1.8;
      if(k.has("ArrowRight")||k.has("d"))dy=+1.8;
      if(k.has("ArrowLeft") ||k.has("a"))dy=-1.8;
      // rigori e punizioni: input di movimento ignorati
      if(sit?.lockMovement){moveRef.current=requestAnimationFrame(loop);return;}
      // clamp movement to situation moveZone; auto-show actions on first move
      if(dx||dy){
        setPPos(p=>({x:clamp(p.x+dx,mz.x[0],mz.x[1]),y:clamp(p.y+dy,mz.y[0],mz.y[1])}));
        if(phase==="hl_move")setPhase("hl_choose");
      }
      moveRef.current=requestAnimationFrame(loop);
    };
    moveRef.current=requestAnimationFrame(loop);
    return()=>{if(moveRef.current)cancelAnimationFrame(moveRef.current);};
  },[phase,hlIdx,situations]);`,
  `  // Movement RAF — keyboard input with movesLeft check, 400ms cooldown per move
  const lastKbdMoveRef=useRef(0);
  useEffect(()=>{
    if(phase!=="hl_move"&&phase!=="hl_choose"){if(moveRef.current)cancelAnimationFrame(moveRef.current);return;}
    const sit=situations[hlIdx];
    const mz=sit?.moveZone||{x:[0,100],y:[0,100]};
    const loop=()=>{
      const k=keysRef.current;let dx=0,dy=0;
      if(k.has("ArrowUp")   ||k.has("w"))dx=+2.5;
      if(k.has("ArrowDown") ||k.has("s"))dx=-2.5;
      if(k.has("ArrowRight")||k.has("d"))dy=+2.5;
      if(k.has("ArrowLeft") ||k.has("a"))dy=-2.5;
      if(!sit?.lockMovement&&(dx||dy)&&phase==="hl_move"){
        const now=Date.now();
        if(now-lastKbdMoveRef.current>400){
          lastKbdMoveRef.current=now;
          if(sit?.maxMoves>0){
            if(movesLeftRef.current<=0){setTimeout(()=>setPhase("hl_choose"),50);moveRef.current=requestAnimationFrame(loop);return;}
            movesLeftRef.current=Math.max(0,movesLeftRef.current-1);
            setMovesLeft(movesLeftRef.current);
            setPPos(p=>({x:clamp(p.x+dx,mz.x[0],mz.x[1]),y:clamp(p.y+dy,mz.y[0],mz.y[1])}));
            if(movesLeftRef.current<=0){setTimeout(()=>setPhase("hl_choose"),350);moveRef.current=requestAnimationFrame(loop);return;}
          }else{
            setPPos(p=>({x:clamp(p.x+dx,mz.x[0],mz.x[1]),y:clamp(p.y+dy,mz.y[0],mz.y[1])}));
          }
        }
      }
      moveRef.current=requestAnimationFrame(loop);
    };
    moveRef.current=requestAnimationFrame(loop);
    return()=>{if(moveRef.current)cancelAnimationFrame(moveRef.current);};
  },[phase,hlIdx,situations]);`
);

// ══════════════════════════════════════════════════════════════════════════
// FIX 6: Replace one-shot AI timeout with continuous pressing interval
//        + add hero player micro-drift during HL
// ══════════════════════════════════════════════════════════════════════════
rep('continuous AI pressing interval during HL',
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
  },[phase,pPos.x,pPos.y]);// eslint-disable-line`,
  `  // Continuous AI pressing during all HL phases — opponents and teammates always move
  useEffect(()=>{
    if(!["hl_intro","hl_move","hl_choose"].includes(phase))return;
    const sit=situations[hlIdx];
    const isDef=sit?.type==="def";
    const isNearGoal=["area","bordo"].includes(sit?.zones?.[0]);
    // pressing interval: shorter near goal, longer at midfield/defense
    const pressingMs=isNearGoal?550:isDef?700:650;
    const iv=setInterval(()=>{
      setMatchPlayers(prev=>prev.map((pl,idx)=>{
        if(pl.team==="ref")return pl;
        const r=(Math.random()-0.5)*3.5;
        if(pl.team==="away"){
          const dpx=pPos.x-pl.x,dpy=pPos.y-pl.y;
          const dist=Math.sqrt(dpx*dpx+dpy*dpy);
          if(dist>28){
            // converge toward player
            const step=Math.min(7,dist*0.2);
            return{...pl,x:clamp(pl.x+dpx/dist*step+r,isDef?5:40,97),y:clamp(pl.y+dpy/dist*step*0.6+r,3,97)};
          }else{
            // close: fan out around player to cut passing lanes
            const angle=(idx*1.57+Math.random()*0.8);
            const spread=10+Math.random()*10;
            return{...pl,x:clamp(pPos.x+Math.cos(angle)*spread+r,isDef?5:40,97),y:clamp(pPos.y+Math.sin(angle)*spread+r,3,97)};
          }
        }else{
          // home teammates: drift to support positions near player
          const supportX=clamp(pPos.x-(5+Math.random()*15)+r,3,85);
          const supportY=clamp(pPos.y+(Math.random()-0.5)*30+r,3,97);
          return{...pl,x:pl.x+(supportX-pl.x)*0.12,y:pl.y+(supportY-pl.y)*0.08};
        }
      }));
    },pressingMs);
    return()=>clearInterval(iv);
  },[phase,hlIdx,situations,pPos.x,pPos.y]);// eslint-disable-line`
);

// ══════════════════════════════════════════════════════════════════════════
// FIX 7: livePos — increase lerp + oscillation amplitude during HL phases
//        for more dynamic visual movement of all players on canvas
// ══════════════════════════════════════════════════════════════════════════
rep('livePos faster lerp + bigger oscillation during HL',
  `          allP.forEach(function(pl,i){
            if(!pl||!s.livePos[i])return;
            var hasDrift=dt&&dt[i];
            if(hasDrift){
              s.livePos[i].cx+=(gx(dt[i].y)-s.livePos[i].cx)*0.018;
              s.livePos[i].cy+=(gy(dt[i].x)-s.livePos[i].cy)*0.018;
            }else{
              var baseX2=gx(pl.y||50),baseY2=gy(pl.x||50);
              var osc2=(pl.team==="away"||pl.team==="ref")?Math.sin(t*0.0007+i*1.1)*3:Math.sin(t*0.0005+i*0.9)*1.5;
              s.livePos[i].cx+=(baseX2-s.livePos[i].cx)*0.004;
              s.livePos[i].cy+=((baseY2+osc2)-s.livePos[i].cy)*0.004;
            }
          });`,
  `          var isHLphase=["hl_move","hl_choose","hl_intro"].includes(p.matchPhase);
          allP.forEach(function(pl,i){
            if(!pl||!s.livePos[i])return;
            var hasDrift=dt&&dt[i];
            if(hasDrift){
              s.livePos[i].cx+=(gx(dt[i].y)-s.livePos[i].cx)*0.022;
              s.livePos[i].cy+=(gy(dt[i].x)-s.livePos[i].cy)*0.022;
            }else{
              var baseX2=gx(pl.y||50),baseY2=gy(pl.x||50);
              // HL: bigger oscillation (realistic micro-movement during action)
              var isHero=pl.isHero||pl.isPlayer;
              var oscAmp=isHLphase?(isHero?5:7):(pl.team==="away"||pl.team==="ref"?3:1.5);
              var oscFreq=isHLphase?(isHero?0.002:0.003):(pl.team==="away"?0.0007:0.0005);
              var oscPhase=isHero?0:(i*1.1);
              var osc2=Math.sin(t*oscFreq+oscPhase)*oscAmp;
              var oscX=Math.cos(t*oscFreq*0.7+oscPhase+1)*oscAmp*0.5;
              // faster lerp during HL so matchPlayers changes are visible quickly
              var lerpFactor=isHLphase?0.025:0.004;
              s.livePos[i].cx+=((baseX2+oscX)-s.livePos[i].cx)*lerpFactor;
              s.livePos[i].cy+=((baseY2+osc2)-s.livePos[i].cy)*lerpFactor;
            }
          });`
);

// ── Brace balance check + save ──
let b=0;for(const c of html){if(c==='{')b++;else if(c==='}')b--;}
console.log('\n=== RESULT ===');
console.log('Applied:',ok,'  Failed:',fail,'  Brace balance:',b);
if(b!==0){console.error('BRACE IMBALANCE — NOT saved!');process.exit(1);}
fs.writeFileSync(path,html,'utf8');
console.log('Saved.',Math.round(html.length/1024),'KB');
