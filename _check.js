const fs=require('fs');
const t=fs.readFileSync('C:/Users/a.vairo/CMP/CARRIER-MANAGER-AV.html','utf8');
const mustExist=[
  'SAVE_VERSION','NATIONS','STADIUMS','FORMATION_HOME','BG_MATCH','SITUATIONS','ZONES',
  'WEEKLY_EVENTS','OUTCOME_TX','NAME_BY_NAT','generateTeamRoster',
  'generateSeasonCalendar','initStandings','updateStandings','simulateMatch',
  'calcAttendance','generateTransferOffer','generateProContracts','storage',
  'hashStr','seededShuffle','succRate','wPick','baseStats','calcOvr',
  'rng','pick','shuffle','getLeagueClubs'
];
let b=0;for(const c of t){if(c==='{')b++;else if(c==='}')b--;}
console.log('Brace balance:',b,'| Size:',Math.round(t.length/1024),'KB\n');
const missing=mustExist.filter(v=>!['const '+v,'let '+v,'var '+v,'function '+v].some(p=>t.includes(p)));
console.log(missing.length===0?'ALL GLOBALS OK':'MISSING: '+missing.join(', '));
