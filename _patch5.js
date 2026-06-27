// _patch5.js — Day/night matches + team-colored fans
const fs = require('fs');
const path = 'C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html';
let html = fs.readFileSync(path, 'utf8');

// ─── STEP 1: Add timeOfDay state in LiveMatch ───
const OLD_STADIUM = `  const [stadium]=useState(()=>pick(STADIUMS));
  // context-aware realistic attendance
  const [attendance]=useState(()=>calcAttendance(context==="trial"?null:(player.club||opponent),context));`;

const NEW_STADIUM = `  const [stadium]=useState(()=>pick(STADIUMS));
  // day or night — seeded by week so same match is always same time
  const [timeOfDay]=useState(()=>(player.week||1)%2===0?"night":"day");
  // context-aware realistic attendance
  const [attendance]=useState(()=>calcAttendance(context==="trial"?null:(player.club||opponent),context));`;

html = html.replace(OLD_STADIUM, NEW_STADIUM);
console.log('Step 1 done');

// ─── STEP 2: Pass timeOfDay to PitchCanvas ───
const OLD_PC_DAY = `            <PitchCanvas playerX={pPos.x} playerY={pPos.y} zone={zone}
              homeCol={player.club?.col||player.club?.c||"#22c55e"} oppCol={opponent?.col||opponent?.c||"#ef4444"}
              opponents={opponents.current} matchPhase={matchPhase3D} avatarId={player.avatarId||0}
              actionZoom={phase==="hl_move"||phase==="hl_choose"||phase==="hl_result"}
              allPlayers={matchPlayers}
              homeClub={player.club||opponent}
              ballX={ballPos.x} ballY={ballPos.y}
              waveEvent={waveEvent}
              driftTargets={driftTargetsRef.current}
              onWalkoutDone={()=>setPhase("playing")}/>`;

const NEW_PC_DAY = `            <PitchCanvas playerX={pPos.x} playerY={pPos.y} zone={zone}
              homeCol={player.club?.col||player.club?.c||"#22c55e"} oppCol={opponent?.col||opponent?.c||"#ef4444"}
              opponents={opponents.current} matchPhase={matchPhase3D} avatarId={player.avatarId||0}
              actionZoom={phase==="hl_move"||phase==="hl_choose"||phase==="hl_result"}
              allPlayers={matchPlayers}
              homeClub={player.club||opponent}
              ballX={ballPos.x} ballY={ballPos.y}
              waveEvent={waveEvent}
              driftTargets={driftTargetsRef.current}
              timeOfDay={timeOfDay}
              onWalkoutDone={()=>setPhase("playing")}/>`;

html = html.replace(OLD_PC_DAY, NEW_PC_DAY);
console.log('Step 2 done');

// ─── STEP 3: Update PitchCanvas signature ───
const OLD_SIG = `function PitchCanvas({playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX,ballY,waveEvent,driftTargets}){`;
const NEW_SIG = `function PitchCanvas({playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX,ballY,waveEvent,driftTargets,timeOfDay}){`;
html = html.replace(OLD_SIG, NEW_SIG);
console.log('Step 3 done');

// ─── STEP 4: Update propsRef to include timeOfDay ───
const OLD_PROPS = `  const propsRef=useRef({playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX:ballX||50,ballY:ballY||50,waveEvent,driftTargets});
  useEffect(()=>{propsRef.current={playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX:ballX||50,ballY:ballY||50,waveEvent,driftTargets};},[playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX,ballY,waveEvent,driftTargets]);`;

const NEW_PROPS = `  const propsRef=useRef({playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX:ballX||50,ballY:ballY||50,waveEvent,driftTargets,timeOfDay:timeOfDay||"night"});
  useEffect(()=>{propsRef.current={playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX:ballX||50,ballY:ballY||50,waveEvent,driftTargets,timeOfDay:timeOfDay||"night"};},[playerX,playerY,zone,homeCol,oppCol,opponents,matchPhase,onWalkoutDone,avatarId,actionZoom,allPlayers,homeClub,ballX,ballY,waveEvent,driftTargets,timeOfDay]);`;

html = html.replace(OLD_PROPS, NEW_PROPS);
console.log('Step 4 done');

// ─── STEP 5: Replace standsOff baking with team-colored fans + day/night background ───
const OLD_STANDS = `    const standsOff=document.createElement("canvas");standsOff.width=PW;standsOff.height=PH;
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

const NEW_STANDS = `    var isDay=(timeOfDay||"night")==="day";
    const standsOff=document.createElement("canvas");standsOff.width=PW;standsOff.height=PH;
    const sc=standsOff.getContext("2d");
    // Background: sky for day, dark for night
    if(isDay){
      // Sky gradient
      var sky=sc.createLinearGradient(0,0,0,PH*0.35);
      sky.addColorStop(0,"#87ceeb");sky.addColorStop(0.6,"#b8e4f7");sky.addColorStop(1,"#d4eef8");
      sc.fillStyle=sky;sc.fillRect(0,0,PW,PH);
      // Subtle clouds
      sc.globalAlpha=0.55;sc.fillStyle="#fff";
      [[60,8,28,10],[180,14,38,12],[290,6,22,8]].forEach(function(c){sc.beginPath();sc.ellipse(c[0],c[1],c[2],c[3],0,0,Math.PI*2);sc.fill();});
      sc.globalAlpha=1;
      // Sun glow top-right
      var sun=sc.createRadialGradient(PW*0.82,12,0,PW*0.82,12,55);
      sun.addColorStop(0,"rgba(255,230,80,0.55)");sun.addColorStop(1,"rgba(255,230,80,0)");
      sc.fillStyle=sun;sc.fillRect(PW*0.82-55,0,110,70);
      // Concrete stands base (lighter for day)
      sc.fillStyle="#d1d5db";sc.fillRect(0,0,PW,FY-2);
      sc.fillStyle="#d1d5db";sc.fillRect(0,FY+FH+2,PW,PH-FY-FH-2);
      sc.fillStyle="#d1d5db";sc.fillRect(0,FY,FX-1,FH);
      sc.fillStyle="#d1d5db";sc.fillRect(FX+FW+1,FY,PW-FX-FW-1,FH);
    } else {
      sc.fillStyle="#04060f";sc.fillRect(0,0,PW,PH);
      var bowlGrad=sc.createRadialGradient(FCX,FCY,40,FCX,FCY,240);
      bowlGrad.addColorStop(0,"rgba(30,120,55,0.18)");bowlGrad.addColorStop(0.6,"rgba(10,20,40,0.3)");bowlGrad.addColorStop(1,"rgba(0,0,0,0.7)");
      sc.fillStyle=bowlGrad;sc.fillRect(0,0,PW,PH);
    }
    // Use actual team colors for fans: home = homeCol dominant, away = oppCol minority
    var HOME_COL=homeCol||"#2563eb";
    var AWAY_COL=oppCol||"#dc2626";
    // Darken for night, lighten for day
    function bakeStand(x,y,w,h,nearPitch,homeRatio){
      // homeRatio: 0.0-1.0 fraction of columns that are home fans (e.g. 0.75 = home section)
      if(w<3||h<3)return;
      var cw=4,rh=isDay?4.5:4,cols=Math.ceil(w/cw),rows=Math.ceil(h/rh);
      var concreteC=isDay?"#b0b8c4":"#16182a";
      var concreteC2=isDay?"#9ca8b4":"#121525";
      for(var r=0;r<rows;r++){
        sc.fillStyle=r%2===0?concreteC:concreteC2;sc.globalAlpha=1;
        sc.fillRect(x,y+r*rh,w,rh);
      }
      for(var r=0;r<rows;r++){
        var depthFactor=nearPitch?Math.max(0.2,0.75-r*(0.5/Math.max(rows,1))):Math.min(0.6,0.25+r*(0.35/Math.max(rows,1)));
        if(isDay)depthFactor=Math.min(0.85,depthFactor*1.3);
        for(var c=0;c<cols;c++){
          // Determine if this column is home or away fan
          var colFrac=c/cols;
          var isHomeFan=colFrac<homeRatio;
          var scatter=(((r*17+c*13)^(r*7+c*3))%9);
          var baseCol=isHomeFan?HOME_COL:AWAY_COL;
          var alpha=depthFactor*(0.5+scatter*0.045);
          sc.fillStyle=baseCol;sc.globalAlpha=alpha;
          sc.fillRect(x+c*cw,y+r*rh+1,cw-1,rh-2);
          // White shirt randomly scattered
          if(scatter===0){sc.fillStyle="#f9fafb";sc.globalAlpha=alpha*0.55;sc.fillRect(x+c*cw,y+r*rh+1,cw-1,rh-2);}
          // Black/dark seat visible between fans (empty seat feel)
          if(scatter===8){sc.fillStyle=isDay?"#9ca3af":"#0a0c14";sc.globalAlpha=alpha*0.4;sc.fillRect(x+c*cw,y+r*rh+2,cw-1,rh-3);}
        }
        if(r%2===0){sc.fillStyle="#000";sc.globalAlpha=isDay?0.08:0.18;sc.fillRect(x,y+r*rh+rh-1,w,1);}
      }
      // Sciarpe strip at front row (nearest pitch)
      var scarpW=5,scarpCount=Math.floor(w/scarpW);
      for(var sv=0;sv<scarpCount;sv++){
        var isSvHome=(sv/scarpCount)<homeRatio;
        sc.fillStyle=isSvHome?HOME_COL:AWAY_COL;sc.globalAlpha=nearPitch?0.7:0.4;
        sc.fillRect(x+sv*scarpW,nearPitch?y:y+Math.floor(rows*rh)-2,scarpW-1,2);
      }
      sc.globalAlpha=1;
    }
    // Top tribune: 75% home fans | Bottom tribune: mostly away (30% home)
    // Side stands: ~65% home
    bakeStand(FX,2,FW,FY-3,true,0.75);
    bakeStand(FX,FY+FH+2,FW,PH-FY-FH-4,true,0.30);
    bakeStand(0,FY,FX-1,FH,true,0.65);
    bakeStand(FX+FW+1,FY,PW-FX-FW-1,FH,true,0.62);
    // Floodlight towers — visible for both day and night (less prominent by day)
    var towers=[[FX-6,FY-4],[FX+FW+6,FY-4],[FX-6,FY+FH+4],[FX+FW+6,FY+FH+4]];
    towers.forEach(function(m){
      sc.strokeStyle=isDay?"#9ca3af":"#4b5563";sc.lineWidth=2.5;
      sc.beginPath();sc.moveTo(m[0],m[1]+22);sc.lineTo(m[0],m[1]-2);sc.stroke();
      sc.strokeStyle=isDay?"#d1d5db":"#6b7280";sc.lineWidth=1.5;
      sc.beginPath();sc.moveTo(m[0]-5,m[1]-2);sc.lineTo(m[0]+5,m[1]-2);sc.stroke();
      if(!isDay){
        var lg=sc.createRadialGradient(m[0],m[1]-2,0,m[0],m[1]-2,9);
        lg.addColorStop(0,"rgba(255,252,200,0.65)");lg.addColorStop(1,"rgba(255,252,200,0)");
        sc.fillStyle=lg;sc.fillRect(m[0]-9,m[1]-11,18,9);
        sc.fillStyle="#fefce8";sc.globalAlpha=0.8;sc.fillRect(m[0]-4,m[1]-5,8,3);sc.globalAlpha=1;
      }
    });`;

html = html.replace(OLD_STANDS, NEW_STANDS);
console.log('Step 5 done');

// ─── STEP 6: Update drawBg for day/night ───
const OLD_DRAWBG2 = `    function drawBg(ctx,t){
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

const NEW_DRAWBG2 = `    function drawBg(ctx,t){
      ctx.drawImage(standsOff,0,0);
      var isD=isDay;
      // --- Floodlights: only visible at night ---
      if(!isD){
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
          var lg=ctx.createRadialGradient(tw[0],tw[1]-2,0,tw[0],tw[1]-2,12);
          lg.addColorStop(0,"rgba(255,252,220,"+(0.55*flicker)+")");lg.addColorStop(1,"rgba(255,252,220,0)");
          ctx.fillStyle=lg;ctx.fillRect(tw[0]-12,tw[1]-14,24,12);
        });
      } else {
        // Day: sun ray from top-right corner
        var sunX=PW*0.82,sunY=12;
        var ray=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,90);
        ray.addColorStop(0,"rgba(255,230,80,0.22)");ray.addColorStop(1,"rgba(255,230,80,0)");
        ctx.fillStyle=ray;ctx.fillRect(sunX-90,0,180,100);
        // Day shadow under stands (natural shadow cast on pitch edge)
        ctx.save();ctx.globalAlpha=0.08;ctx.fillStyle="#000";
        ctx.fillRect(FX,FY,FW,12);ctx.restore();
      }
      // --- Animated OLA wave across top and bottom stands ---
      var waveSpeed=t*0.0012;
      var topStH=FY-3,botStH=PH-FY-FH-4;
      for(var wi=0;wi<Math.ceil(FW/5);wi++){
        var wx=FX+wi*5;
        var wh=Math.max(0,Math.sin(waveSpeed+wi*0.22)*4.5);
        if(wh>0){
          ctx.save();ctx.globalAlpha=isD?0.18:0.28;ctx.fillStyle="#fff";
          ctx.fillRect(wx,2,5,Math.min(wh,topStH));
          ctx.fillRect(wx,FY+FH+2,5,Math.min(wh,botStH));
          ctx.restore();
        }
      }
      // --- Photo flashes: prominent at night, subtle by day ---
      var flashProb=isD?0.004:0.012;
      if(Math.random()<flashProb){
        var fx2=FX+Math.random()*FW,fy2=2+Math.random()*(FY-5);
        var fg=ctx.createRadialGradient(fx2,fy2,0,fx2,fy2,isD?5:8);
        fg.addColorStop(0,"rgba(255,255,255,"+(isD?0.35:0.7)+")");fg.addColorStop(1,"rgba(255,255,255,0)");
        ctx.fillStyle=fg;ctx.fillRect(fx2-8,fy2-8,16,16);
      }
      // --- Fog: only at night ---
      if(!isD){
        s.fogPhase=(s.fogPhase||0)+0.003;
        var fogAlpha=0.055+Math.sin(s.fogPhase)*0.025;
        var fogT=ctx.createLinearGradient(FX,FY,FX,FY+30);
        fogT.addColorStop(0,"rgba(220,240,220,0)");fogT.addColorStop(0.5,"rgba(220,240,220,"+fogAlpha+")");fogT.addColorStop(1,"rgba(220,240,220,0)");
        ctx.fillStyle=fogT;ctx.fillRect(FX,FY-4,FW,28);
        var fogB=ctx.createLinearGradient(FX,FY+FH-26,FX,FY+FH+4);
        fogB.addColorStop(0,"rgba(220,240,220,0)");fogB.addColorStop(0.5,"rgba(220,240,220,"+fogAlpha+")");fogB.addColorStop(1,"rgba(220,240,220,0)");
        ctx.fillStyle=fogB;ctx.fillRect(FX,FY+FH-26,FW,30);
      }
    }`;

html = html.replace(OLD_DRAWBG2, NEW_DRAWBG2);
console.log('Step 6 done');

// ─── STEP 7: Update drawPitch for day grass (brighter greens) ───
const OLD_PITCH_DAY = `    function drawPitch(ctx){
      // Draw grass directly in world coords (zooms naturally with camera)
      for(var si=0;si<14;si++){
        var g1=si%2===0?"#1a7530":"#1f7a35";
        ctx.fillStyle=g1;
        ctx.fillRect(FX,FY+si*(FH/14),FW,FH/14+1);
      }`;

const NEW_PITCH_DAY = `    function drawPitch(ctx){
      // Draw grass directly in world coords — colors differ by day/night
      var gA=isDay?"#3a9e4a":"#1a7530";
      var gB=isDay?"#44aa54":"#1f7a35";
      for(var si=0;si<14;si++){
        ctx.fillStyle=si%2===0?gA:gB;
        ctx.fillRect(FX,FY+si*(FH/14),FW,FH/14+1);
      }`;

html = html.replace(OLD_PITCH_DAY, NEW_PITCH_DAY);
console.log('Step 7 done');

// ─── STEP 8: Update pitch line glow for day (no glow, cleaner white) ───
const OLD_LINE_DAY = `      ctx.save();ctx.shadowColor="rgba(180,255,180,0.55)";ctx.shadowBlur=11;
      ctx.strokeStyle="#e8fef0";ctx.lineWidth=2.4;ctx.strokeRect(FX,FY,FW,FH);ctx.restore();
      ctx.strokeStyle="rgba(255,255,255,0.88)";ctx.lineWidth=1.5;`;

const NEW_LINE_DAY = `      if(isDay){
        ctx.save();ctx.strokeStyle="#ffffff";ctx.lineWidth=2.2;ctx.strokeRect(FX,FY,FW,FH);ctx.restore();
      } else {
        ctx.save();ctx.shadowColor="rgba(180,255,180,0.55)";ctx.shadowBlur=11;
        ctx.strokeStyle="#e8fef0";ctx.lineWidth=2.4;ctx.strokeRect(FX,FY,FW,FH);ctx.restore();
      }
      ctx.strokeStyle=isDay?"rgba(255,255,255,0.92)":"rgba(255,255,255,0.88)";ctx.lineWidth=1.5;`;

html = html.replace(OLD_LINE_DAY, NEW_LINE_DAY);
console.log('Step 8 done');

// ─── STEP 9: Show 🌙/☀️ badge in scoreboard header ───
const OLD_SCORE_BADGE = `              <div style={{fontSize:7,color:"rgba(255,255,255,0.3)",marginTop:0,letterSpacing:1,textTransform:"uppercase"}}>{phase==="walkout"?"Ingresso in campo":phase==="ended"?"Fischio finale":\`Highlight \${hlIdx+1}/\${numHL}\`}</div>`;

const NEW_SCORE_BADGE = `              <div style={{fontSize:7,color:"rgba(255,255,255,0.3)",marginTop:0,letterSpacing:1,textTransform:"uppercase"}}>{phase==="walkout"?"Ingresso in campo":phase==="ended"?"Fischio finale":\`Highlight \${hlIdx+1}/\${numHL}\`} {timeOfDay==="day"?"☀️":"🌙"}</div>`;

html = html.replace(OLD_SCORE_BADGE, NEW_SCORE_BADGE);
console.log('Step 9 done');

fs.writeFileSync(path, html, 'utf8');
console.log('Patch complete. File size:', fs.statSync(path).size);
