// _restore.js — Apply all missing atmospheric/gameplay features
// Verified anchor strings from current file (319162 bytes)
const fs=require('fs');
const path='C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html';
let html=fs.readFileSync(path,'utf8');
let ok=0,fail=0;

function rep(label,old,neu){
  if(!html.includes(old)){
    console.log('FAIL:',label);
    console.log('  anchor:',JSON.stringify(old.slice(0,80)));
    fail++;return false;
  }
  html=html.replace(old,neu);
  console.log('OK:',label);ok++;return true;
}

// ─── 1. Add livePos, fogPhase, photoFlashT to PitchCanvas stateRef ───
rep('stateRef + livePos/fogPhase',
`const stateRef=useRef({
    camX:PC_FCX,camY:PC_FCY,camZoom:1,
    walkProgress:0,walkDone:false,
    ballX:50,ballY:50,
    prevPX:50,prevPY:50,isMoving:false,movingTimer:0,
    particles:[],frameId:null,lastT:0
  });`,
`const stateRef=useRef({
    camX:PC_FCX,camY:PC_FCY,camZoom:1,
    walkProgress:0,walkDone:false,
    ballX:50,ballY:50,
    prevPX:50,prevPY:50,isMoving:false,movingTimer:0,
    particles:[],frameId:null,lastT:0,
    livePos:[],fogPhase:0,photoFlashT:0
  });`
);

// ─── 2. Replace drawStadium background + stands with team-colored version ───
rep('drawStadium team-colored stands + atmosphere',
`function drawStadium(ctx,t){
      // Background
      ctx.fillStyle="#0a0e1a";ctx.fillRect(0,0,PW,PH);
      // Stands behind goals
      const topGrad=ctx.createLinearGradient(0,0,0,FY);`,
`function drawStadium(ctx,t){
      var p=propsRef.current;
      var hCol=p.homeCol||"#2563eb",oCol=p.oppCol||"#dc2626";
      // Background bowl
      ctx.fillStyle="#02040b";ctx.fillRect(0,0,PW,PH);
      var bowlG=ctx.createRadialGradient(FCX,FCY,40,FCX,FCY,260);
      bowlG.addColorStop(0,"rgba(20,80,40,0.14)");bowlG.addColorStop(1,"rgba(0,0,0,0.6)");
      ctx.fillStyle=bowlG;ctx.fillRect(0,0,PW,PH);
      // Team-colored fans: top=75% home, bottom=30% home, sides=65%
      function bakeStandDyn(x,y,w,h,homeRatio){
        if(w<3||h<3)return;
        var cw=4,rh=4,cols=Math.ceil(w/cw),rows=Math.ceil(h/rh);
        for(var r=0;r<rows;r++){
          ctx.fillStyle=r%2===0?"#12142a":"#0e1020";ctx.globalAlpha=1;
          ctx.fillRect(x,y+r*rh,w,rh);
        }
        for(var r=0;r<rows;r++){
          var isHome=r<rows*homeRatio;
          var base=isHome?hCol:oCol;
          var da=Math.max(0.15,0.55-r*(0.35/Math.max(rows,1)));
          for(var c=0;c<cols;c++){
            var sc=((r*17+c*13)^(r*7+c*3))%7;
            ctx.fillStyle=base;ctx.globalAlpha=da*(0.5+sc*0.05);
            ctx.fillRect(x+c*cw,y+r*rh+1,cw-1,rh-2);
            if(sc===0){ctx.fillStyle="#e5e7eb";ctx.globalAlpha=da*0.35;ctx.fillRect(x+c*cw,y+r*rh+1,cw-1,rh-2);}
          }
          if(r%2===0){ctx.fillStyle="#000";ctx.globalAlpha=0.15;ctx.fillRect(x,y+r*rh+rh-1,w,1);}
        }
        ctx.globalAlpha=1;
      }
      bakeStandDyn(FX,2,FW,FY-3,0.75);
      bakeStandDyn(FX,FY+FH+2,FW,PH-FY-FH-4,0.30);
      bakeStandDyn(0,FY,FX-1,FH,0.65);
      bakeStandDyn(FX+FW+1,FY,PW-FX-FW-1,FH,0.65);
      // Ola wave top+bottom stands
      var waveSpd=t*0.0012;
      for(var wi=0;wi<Math.ceil(FW/5);wi++){
        var wx2=FX+wi*5,wh2=Math.max(0,Math.sin(waveSpd+wi*0.22)*4.5);
        if(wh2>0.5){ctx.save();ctx.globalAlpha=0.22;ctx.fillStyle="#fff";ctx.fillRect(wx2,2,5,Math.min(wh2,FY-3));ctx.fillRect(wx2,FY+FH+2,5,Math.min(wh2,PH-FY-FH-4));ctx.restore();}
      }
      // Random photo flashes in stands
      if(Math.random()<0.012){
        var fx2=FX+Math.random()*FW,fy2=2+Math.random()*(FY-5);
        var fgrd=ctx.createRadialGradient(fx2,fy2,0,fx2,fy2,8);
        fgrd.addColorStop(0,"rgba(255,255,255,0.7)");fgrd.addColorStop(1,"rgba(255,255,255,0)");
        ctx.fillStyle=fgrd;ctx.fillRect(fx2-8,fy2-8,16,16);
      }
      // Stands behind goals
      const topGrad=ctx.createLinearGradient(0,0,0,FY);`
);

// ─── 3. Add fog + inject before floodlight towers ───
rep('fog effect at pitch edges',
`      // Floodlight towers`,
`      // Fog at pitch edges
      var s0=stateRef.current;
      s0.fogPhase=(s0.fogPhase||0)+0.003;
      var fogAlpha=0.05+Math.sin(s0.fogPhase)*0.02;
      var fogTop=ctx.createLinearGradient(FX,FY,FX,FY+24);
      fogTop.addColorStop(0,"rgba(200,230,200,0)");fogTop.addColorStop(0.5,"rgba(200,230,200,"+fogAlpha+")");fogTop.addColorStop(1,"rgba(200,230,200,0)");
      ctx.fillStyle=fogTop;ctx.fillRect(FX,FY-4,FW,26);
      var fogBot=ctx.createLinearGradient(FX,FY+FH-22,FX,FY+FH+4);
      fogBot.addColorStop(0,"rgba(200,230,200,0)");fogBot.addColorStop(0.5,"rgba(200,230,200,"+fogAlpha+")");fogBot.addColorStop(1,"rgba(200,230,200,0)");
      ctx.fillStyle=fogBot;ctx.fillRect(FX,FY+FH-24,FW,28);
      // Floodlight towers`
);

// ─── 4. Add confetti to walkout ───
rep('confetti burst at walkout end',
`      if(s.walkProgress>=1&&!s.walkDone){s.walkDone=true;onWalkoutDoneRef.current&&onWalkoutDoneRef.current();}`,
`      // Confetti burst at end of walkout
      if(s.walkProgress>0.88){
        var cProg=(s.walkProgress-0.88)/0.12;
        var cPal=["#f59e0b","#22c55e","#3b82f6","#ef4444","#a855f7","#fff","#fbbf24"];
        for(var ci=0;ci<22;ci++){
          var cSeed=((ci*137)%100)/100;
          var cX=FCX-90+cSeed*180,cY=(FCY-30)-(cProg*100+ci*4)%90;
          ctx.save();ctx.globalAlpha=Math.max(0,0.9-cProg*0.6);ctx.fillStyle=cPal[ci%cPal.length];
          ctx.translate(cX,cY);ctx.rotate(cSeed*Math.PI);ctx.fillRect(-2,0,4,7);ctx.restore();
        }
      }
      if(s.walkProgress>=1&&!s.walkDone){s.walkDone=true;onWalkoutDoneRef.current&&onWalkoutDoneRef.current();}`
);

// ─── 5. Replace player render section with livePos drift version ───
rep('player drift with livePos',
`// All players
          const allP=p.allPlayers||[];
          // Sort by canvasY so players lower on field render on top
          const sorted=[...allP].sort((a,b)=>(a.x||0)-(b.x||0));
          sorted.forEach((pl,i)=>{
            if(!pl)return;
            const isHero=pl.isHero||pl.isPlayer;
            const col=pl.team==="home"?(p.homeCol||"#22c55e"):pl.team==="ref"?"#111111":(p.oppCol||"#ef4444");
            const col2=pl.team==="ref"?"#ffff00":"#fff";
            // canvas: game y→x, game x→y
            const pcx=gx(pl.y||50),pcy=gy(pl.x||50);
            drawPlayer(ctx,pcx,pcy,col,col2,isHero,i+1,s.isMoving&&isHero,true,t);
          });`,
`// All players with smooth livePos drift
          const allP=p.allPlayers||[];
          // Init or resize livePos array
          if(s.livePos.length!==allP.length){
            s.livePos=allP.map(function(pl){
              return{cx:gx(pl?pl.y||50:50),cy:gy(pl?pl.x||50:50)};
            });
          }
          // Apply drift targets from BG_MATCH pd field
          var dt=p.driftTargets;
          allP.forEach(function(pl,i){
            if(!pl||!s.livePos[i])return;
            var hasDrift=dt&&dt[i];
            if(hasDrift){
              s.livePos[i].cx+=(gx(dt[i].y)-s.livePos[i].cx)*0.018;
              s.livePos[i].cy+=(gy(dt[i].x)-s.livePos[i].cy)*0.018;
            }else{
              s.livePos[i].cx+=(gx(pl.y||50)-s.livePos[i].cx)*0.006;
              s.livePos[i].cy+=(gy(pl.x||50)-s.livePos[i].cy)*0.006;
            }
          });
          // Sort by canvasY for depth
          var sortedI=[...allP.map(function(pl,i){return{pl:pl,i:i};})];
          sortedI.sort(function(a,b){return(a.pl?a.pl.x||0:0)-(b.pl?b.pl.x||0:0);});
          sortedI.forEach(function(item){
            var pl=item.pl,i=item.i;
            if(!pl||!s.livePos[i])return;
            var isHero=pl.isHero||pl.isPlayer;
            var col=pl.team==="home"?(p.homeCol||"#22c55e"):pl.team==="ref"?"#111111":(p.oppCol||"#ef4444");
            var col2=pl.team==="ref"?"#ffff00":"#fff";
            drawPlayer(ctx,s.livePos[i].cx,s.livePos[i].cy,col,col2,isHero,i+1,s.isMoving&&isHero,true,t);
          });`
);

// ─── 6. Add addCom helper inside LiveMatch, before tick handler ───
rep('addCom helper in LiveMatch',
`    // ─── Tick handler ───`,
`    // ─── addCom helper ───
    function addCom(text){
      setComs(prev=>{const n=[...prev,{t:Date.now(),text}];return n.length>6?n.slice(n.length-6):n;});
    }
    // ─── Tick handler ───`
);

// ─── 7. Wire driftTargets prop to PitchCanvas (if not already) ───
if(!html.includes('driftTargets={driftTargetsRef.current}')){
  rep('pass driftTargets to PitchCanvas',
    `waveEvent={waveEvent}`,
    `waveEvent={waveEvent}\n              driftTargets={driftTargetsRef.current}`
  );
}

// ─── Summary + brace check + save ───
let b=0;for(const c of html){if(c==='{')b++;else if(c==='}')b--;}
console.log('\n=== RESULT ===');
console.log('Applied:',ok,'Failed:',fail,'Brace balance:',b);
if(b!==0){console.error('BRACE IMBALANCE — not saving!');process.exit(1);}
fs.writeFileSync(path,html,'utf8');
console.log('Saved.',html.length,'bytes');
