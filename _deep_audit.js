const fs=require('fs');
const html=fs.readFileSync('C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html','utf8');
const v16=fs.readFileSync('C:/Users/a.vairo/CMP/versions/cpm-game_16.html','utf8');

console.log('=== FILE SIZES ===');
console.log('Current:',html.length,'bytes');
console.log('v16:',v16.length,'bytes');
console.log('Diff:',html.length-v16.length,'bytes added\n');

// Check key features from each patch
const checks=[
  // _patch2 additions
  {label:'[P2] movesLeftRef system',marker:'movesLeftRef'},
  {label:'[P2] pressureRef system',marker:'pressureRef.current=1'},
  {label:'[P2] moveCoolRef',marker:'moveCoolRef'},
  {label:'[P2] floatGoal animation',marker:'floatGoal'},
  {label:'[P2] DRIFT_PRESETS in LiveMatch',marker:'DRIFT_PRESETS'},
  {label:'[P2] screenFlash',marker:'screenFlash'},
  {label:'[P2] addCom helper',marker:'function addCom('},

  // _patch3 additions
  {label:'[P3] BG_MATCH bpos field',marker:'bpos:{x:85,y:50}'},
  {label:'[P3] Player names {H}/{A} in BG_MATCH',marker:'{H} segna!'},
  {label:'[P3] setBallPos in tick',marker:'if(ev.bpos)setBallPos'},
  {label:'[P3] setMxStats in tick',marker:'if(ev.ms)setMxStats'},
  {label:'[P3] ballHistory in stateRef',marker:'ballHistory:[]'},
  {label:'[P3] ball trail draw',marker:'ballHistory'},
  {label:'[P3] camera follow ball',marker:'s.camX+=(s.ballCx-s.camX)'},

  // _patch4 additions
  {label:'[P4] pd field in BG_MATCH',marker:"pd:'attack'"},
  {label:'[P4] livePos in stateRef',marker:'livePos:[]'},
  {label:'[P4] player drift lerp',marker:'livePos[i]'},
  {label:'[P4] team-colored fans bakeStand',marker:'homeRatio'},
  {label:'[P4] fog effect',marker:'fogPhase'},
  {label:'[P4] floodlight beams',marker:'floodlight'},
  {label:'[P4] photoFlashT',marker:'photoFlashT'},
  {label:'[P4] ola wave',marker:'olaWave'},
  {label:'[P4] night sky stars',marker:'drawStars'},
  {label:'[P4] walkout arch/confetti',marker:'confetti'},

  // _patch5 additions
  {label:'[P5] timeOfDay state',marker:'const [timeOfDay]'},
  {label:'[P5] timeOfDay in PitchCanvas sig',marker:'timeOfDay}){'},
  {label:'[P5] homeRatio in standsOff',marker:'homeRatio'},

  // Manual fixes applied
  {label:'[FIX] ballPos state declared',marker:'const [ballPos,setBallPos]'},
  {label:'[FIX] mxStats state declared',marker:'const [mxStats,setMxStats]'},
  {label:'[FIX] waveEvent state declared',marker:'const [waveEvent,setWaveEvent]'},
  {label:'[FIX] screenFlash declared',marker:'const [screenFlash,setScreenFlash]'},
  {label:'[FIX] floatGoal declared',marker:'const [floatGoal,setFloatGoal]'},
  {label:'[FIX] ball lerp fix (tBX)',marker:'var tBX=p.ballX'},
  {label:'[FIX] spin fix 0.004',marker:'spin=t*0.004'},
];

let missing=[];
checks.forEach(c=>{
  const found=html.includes(c.marker);
  console.log((found?'  ✓':'  ✗'),c.label);
  if(!found)missing.push(c);
});

console.log('\n=== MISSING ('+missing.length+') ===');
missing.forEach(c=>console.log('  MISSING:',c.label,'[marker:',c.marker+']'));
