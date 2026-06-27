const fs=require('fs');
const html=fs.readFileSync('C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html','utf8');

// Extract LiveMatch function body
const LM_START=html.indexOf('function LiveMatch(');
const LM_END=html.indexOf('\nfunction ', LM_START+20);
const lm=html.slice(LM_START,LM_END);

// Find all useState/useRef declarations
const declared=new Set();
const decRe=/const\s+\[(\w+)[,\]]/g;
let m;
while((m=decRe.exec(lm))!==null) declared.add(m[1]);
const refRe=/const\s+(\w+)=useRef/g;
while((m=refRe.exec(lm))!==null) declared.add(m[1]);
const constRe=/const\s+(\w+)\s*=/g;
while((m=constRe.exec(lm))!==null) declared.add(m[1]);
const letRe=/let\s+(\w+)/g;
while((m=letRe.exec(lm))!==null) declared.add(m[1]);

console.log('Declared in LiveMatch:','\n  '+[...declared].sort().join('\n  '));

// Check specific vars that were added by patches
const checkVars=['screenFlash','setScreenFlash','floatGoal','setFloatGoal',
  'ballPos','setBallPos','mxStats','setMxStats','waveEvent','setWaveEvent',
  'driftTargetsRef','DRIFT_PRESETS','screenFlash','movesLeftRef',
  'pressureRef','pressureBar','setPressureBar','movesLeft','setMovesLeft',
  'moveCoolRef','addCom','homeRoster','awayRoster','matchPlayers',
  'numHL','hlTimes','situations','stadium','timeOfDay','attendance',
  'oppTactic','scoutReport','aiCommentary','possession','setPossession',
  'clock','score','phase','hlIdx','pPos','mStats','energy','coms',
  'outcome','chosenAct','selectedActionIdx','keysRef','moveRef','zone',
  'oppPrestige','opponents','tick','curSit','matchPhase3D','show3D'];

console.log('\nChecking critical vars:');
checkVars.forEach(v=>{
  const used=lm.includes(v);
  const dec=declared.has(v)||lm.includes('const '+v+'=')||lm.includes('let '+v+'=')||lm.includes('var '+v+'=');
  if(used&&!dec) console.log('  MISSING:',v);
  else if(used&&dec) console.log('  ok:',v);
  else console.log('  (unused):',v);
});
