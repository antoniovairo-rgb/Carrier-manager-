const fs=require('fs');
const path='C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html';
let html=fs.readFileSync(path,'utf8');
let ok=0,fail=0;
function rep(label,o,n){if(!html.includes(o)){console.log('SKIP (not found):',label);fail++;return;}html=html.replace(o,n);console.log('OK:',label);ok++;}

// 1. Add ballPos, mxStats, waveEvent, driftTargetsRef, DRIFT_PRESETS after possession state
rep('add missing states',
`    return clamp(Math.round(50+diff*0.28+rng(-5,5)),22,78);
  });`,
`    return clamp(Math.round(50+diff*0.28+rng(-5,5)),22,78);
  });
  const [ballPos,setBallPos]=useState({x:50,y:50});
  const [mxStats,setMxStats]=useState({shots:0,oppShots:0,fouls:0,corners:0});
  const [waveEvent,setWaveEvent]=useState(null);
  const driftTargetsRef=useRef(null);
  const DRIFT_PRESETS={
    attack:[[22,18],[22,38],[22,62],[22,82],[42,25],[42,75],[62,22],[62,50],[62,78]],
    attack_goal:[[22,18],[22,38],[22,62],[22,82],[38,20],[38,80],[55,15],[65,50],[55,85]],
    wide_right:[[22,18],[22,38],[22,62],[22,82],[42,25],[42,75],[60,85],[68,70],[72,90]],
    midfield:[[22,18],[22,38],[22,62],[22,82],[42,25],[42,50],[42,75],[55,30],[55,70]],
    retreat:[[12,25],[12,50],[12,75],[25,15],[25,50],[25,85],[35,30],[35,55],[35,70]],
    defend_goal:[[8,20],[8,45],[8,55],[8,80],[18,30],[18,50],[18,70],[28,38],[28,62]],
    opp_goal:[[72,18],[72,38],[72,62],[72,82],[62,25],[62,75],[50,22],[50,50],[50,78]],
  };`
);

// 2. Fix ball lerp in render loop
rep('fix ball lerp',
`          // Ball
          s.ballX+=(p.playerX+(s.isMoving?1:0.5)-s.ballX)*0.10;
          s.ballY+=(p.playerY+(s.isMoving?0.5:0)-s.ballY)*0.10;
          drawBall(ctx,gx(s.ballY),gy(s.ballX),t);`,
`          // Ball — lerp toward BG_MATCH synced position
          var tBX=p.ballX!=null?p.ballX:p.playerX;
          var tBY=p.ballY!=null?p.ballY:p.playerY;
          s.ballX+=(tBX-s.ballX)*0.04;
          s.ballY+=(tBY-s.ballY)*0.04;
          drawBall(ctx,gx(s.ballY),gy(s.ballX),t);`
);

// 3. Fix ball spin speed
rep('fix ball spin',`const spin=t*0.025;`,`const spin=t*0.004;`);

// 4. Wire setBallPos, setMxStats, setWaveEvent in BG_MATCH tick handler
rep('wire ballPos in tick',
`          if(ev.bpos)setBallPos(ev.bpos);
          if(ev.ms)setMxStats(s=>({shots:s.shots+(ev.ms.shots||0),oppShots:s.oppShots+(ev.ms.oppShots||0),fouls:s.fouls+(ev.ms.fouls||0),corners:s.corners+(ev.ms.corners||0)}));
          if(ev.pd&&DRIFT_PRESETS[ev.pd])driftTargetsRef.current=DRIFT_PRESETS[ev.pd];`,
`          if(ev.bpos)setBallPos(ev.bpos);
          if(ev.ms)setMxStats(s=>({shots:s.shots+(ev.ms.shots||0),oppShots:s.oppShots+(ev.ms.oppShots||0),fouls:s.fouls+(ev.ms.fouls||0),corners:s.corners+(ev.ms.corners||0)}));
          if(ev.pd&&DRIFT_PRESETS[ev.pd])driftTargetsRef.current=DRIFT_PRESETS[ev.pd];
          if(ev.ef==="team_goal"||ev.ef==="opp_goal")setWaveEvent({t:Date.now(),home:ev.ef==="team_goal"});`
);

// 5. Pass waveEvent and driftTargets to PitchCanvas (if not already there)
if(!html.includes('waveEvent={waveEvent}')){
  rep('pass waveEvent/driftTargets to PitchCanvas',
    `ballX={ballPos.x} ballY={ballPos.y}`,
    `ballX={ballPos.x} ballY={ballPos.y}\n              waveEvent={waveEvent}\n              driftTargets={driftTargetsRef.current}`
  );
  console.log('Added waveEvent/driftTargets props');
}

console.log('\nOK:',ok,'FAIL:',fail);
// brace check
let b=0;for(const c of html){if(c==='{')b++;else if(c==='}')b--;}
console.log('Brace balance:',b);
fs.writeFileSync(path,html,'utf8');
console.log('File size:',html.length);
