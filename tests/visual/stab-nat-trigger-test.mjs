/* STAB-2 — invariante del trigger tornei Nazionali (natTournamentPatch).
   Verifica che l'helper condiviso (usato da doAdvanceWeek / onMatchEnd / simulateAndAdvance) sia:
   - deterministico (stesso input → stessi avversari),
   - corretto per settimana/stagione (W20 · %4→Euro/Mondiale · %2→Coppa Nazioni · %8→Mondiale),
   - idempotente (torneo già attivo o già giocato quella stagione → null),
   - gated su U18 e caps minimi.
   Nasce dal bug HIGH: l'Europeo/Mondiale partiva SOLO da doAdvanceWeek → simulando/giocando W20 non partiva mai.
   Exit != 0 se un invariante fallisce. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
const pageErrs=[]; page.on('pageerror', e => pageErrs.push(String(e.message).slice(0,140)));
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = { phase:'career', player:{ name:'Test Uno', nation:'Italia', avatarId:0, proStatus:'pro',
    season:4, week:20, age:24, ovr:82, tutorialDone:true,
    club:{ id:'juve', n:'Torino Athletic', a:'TAT', p:88, c:'#111', c2:'#fff', nat:'🇮🇹', lg:'Lega A' },
    stats:{ 'velocità':82, tecnica:82, fisico:80, 'mentalità':80, tiro:82, passaggio:80, dribbling:80, posizionamento:80 },
    nationalCaps:8, nationalGoals:5, worldMemory:[], calendar:[], standings:[], matchHistory:[],
    contract:{ duration:3, wage:40000, expiresAtSeason:7 }, log:[] } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000});
await sleep(1500);
try{ await page.getByText('Continua',{exact:false}).first().click({timeout:5000}); }catch(e){}
await page.waitForFunction(()=>!!window.__CPM_CAREER&&typeof window.__CPM_CAREER.natTournamentPatch==='function',{timeout:15000}).catch(()=>{});
await sleep(600);

const R = await page.evaluate(()=>{
  const fails=[]; const F=(cond,msg)=>{ if(!cond) fails.push(msg); };
  const npt=window.__CPM_CAREER&&window.__CPM_CAREER.natTournamentPatch;
  if(typeof npt!=='function') return { fails:['STAB-NT: hook natTournamentPatch non disponibile'] };
  const base=(o)=>({proStatus:'pro',week:20,season:4,nation:'Italia',nationalCaps:8,worldMemory:[],euroMondiale:null,nationsCupQueue:null,...o});
  // 1) Europeo a season%4===0 (non %8) — tipo Europeo, qualificazioni
  const e4=npt(base({season:4}));
  F(e4&&e4.patch&&e4.patch.euroMondiale&&e4.patch.euroMondiale.type==='Europeo'&&e4.patch.euroMondiale.phase==='qualificazioni', `STAB-NT: season4 non avvia Europeo (got ${JSON.stringify(e4&&e4.patch&&Object.keys(e4.patch))})`);
  // 2) Mondiale a season%8===0
  const m8=npt(base({season:8}));
  F(m8&&m8.patch&&m8.patch.euroMondiale&&m8.patch.euroMondiale.type==='Mondiale', `STAB-NT: season8 non avvia Mondiale`);
  // 3) Coppa Nazioni a season%2===0 && %4!==0 (caps>=2)
  const c2=npt(base({season:2}));
  F(c2&&c2.patch&&c2.patch.nationsCupQueue&&c2.patch.nationsCupQueue.active===true, `STAB-NT: season2 non avvia Coppa Nazioni`);
  // 4) settimana != 20 → null
  F(npt(base({season:4,week:19}))===null, `STAB-NT: week19 dovrebbe essere null`);
  F(npt(base({season:4,week:21}))===null, `STAB-NT: week21 dovrebbe essere null`);
  // 5) U18 → null
  F(npt(base({season:4,proStatus:'u18'}))===null, `STAB-NT: U18 dovrebbe essere null`);
  // 6) caps insufficienti → null (Euro serve >=3, Nazioni >=2)
  F(npt(base({season:4,nationalCaps:1}))===null, `STAB-NT: Euro con caps<3 dovrebbe essere null`);
  F(npt(base({season:2,nationalCaps:1}))===null, `STAB-NT: Nazioni con caps<2 dovrebbe essere null`);
  // 7) idempotenza: torneo già attivo → null
  F(npt(base({season:4,euroMondiale:{active:true}}))===null, `STAB-NT: Euro già attivo dovrebbe essere null`);
  F(npt(base({season:2,nationsCupQueue:{active:true}}))===null, `STAB-NT: Nazioni già attive dovrebbe essere null`);
  // 8) idempotenza: già giocato quella stagione (worldMemory) → null
  F(npt(base({season:4,worldMemory:[{type:'euro_mondiale',season:4}]}))===null, `STAB-NT: Euro già in worldMemory dovrebbe essere null`);
  F(npt(base({season:2,worldMemory:[{type:'nations_cup',season:2}]}))===null, `STAB-NT: Nazioni già in worldMemory dovrebbe essere null`);
  // 9) determinismo: stesso input → stessi avversari
  const a=npt(base({season:4})), b=npt(base({season:4}));
  F(JSON.stringify(a.patch.euroMondiale.qualOpponents)===JSON.stringify(b.patch.euroMondiale.qualOpponents)&&JSON.stringify(a.patch.euroMondiale.groupOpponents)===JSON.stringify(b.patch.euroMondiale.groupOpponents), `STAB-NT: avversari NON deterministici`);
  // 10) avversari validi: mai la propria nazione, no overlap qual/group, 2+3 nazioni distinte
  const q=a.patch.euroMondiale.qualOpponents, g=a.patch.euroMondiale.groupOpponents, all=[...q,...g];
  F(q.length===2&&g.length===3, `STAB-NT: qualOpponents ${q.length}/2, groupOpponents ${g.length}/3`);
  F(!all.includes('Italia'), `STAB-NT: la propria nazione tra gli avversari`);
  F(new Set(all).size===all.length, `STAB-NT: avversari duplicati tra qual/group`);

  // ---- [6.35.0 STAB-7/8] ECONOMIA settimanale (weeklyEconomyFields): stipendio − costi, gating pro ----
  const eco=window.__CPM_CAREER&&window.__CPM_CAREER.weeklyEconomyFields;
  if(typeof eco==='function'){
    const pro=(o)=>({proStatus:'pro',contractExpired:false,contract:{wage:40000},bankBalance:0,hasAgent:false,perkTrainer:false,perkNutrition:false,...o});
    // pro senza agente/perk → +wage pieno
    F(eco(pro({})).bankBalance===40000, `STAB-ECO: wage pieno non accreditato (got ${eco(pro({})).bankBalance})`);
    // agente 10% → +36000
    F(eco(pro({hasAgent:true})).bankBalance===36000, `STAB-ECO: costo agente 10% errato (got ${eco(pro({hasAgent:true})).bankBalance})`);
    // agente + trainer 5% + nutrizione 4% = 19% → +32400
    F(eco(pro({hasAgent:true,perkTrainer:true,perkNutrition:true})).bankBalance===32400, `STAB-ECO: costi staff (19%) errati (got ${eco(pro({hasAgent:true,perkTrainer:true,perkNutrition:true})).bankBalance})`);
    // U18 → nessun campo (no stipendio)
    F(Object.keys(eco(pro({proStatus:'u18'}))).length===0, `STAB-ECO: U18 non deve accreditare stipendio`);
    // svincolato → nessun campo
    F(Object.keys(eco(pro({contractExpired:true}))).length===0, `STAB-ECO: svincolato non deve accreditare stipendio`);
    // saldo già negativo tale che wage non lo copre → sospende i perk e non va sotto zero
    const broke=eco(pro({hasAgent:true,perkTrainer:true,perkNutrition:true,contract:{wage:1000},bankBalance:-50000}));
    F(broke.perkTrainer===false&&broke.perkNutrition===false, `STAB-ECO: perk non sospesi a fondi insufficienti`);
    F(broke.bankBalance>=0, `STAB-ECO: bankBalance negativo (${broke.bankBalance})`);
  } else { fails.push('STAB-ECO: hook weeklyEconomyFields non disponibile'); }
  return { fails };
});

console.log('=== STAB-NAT-TRIGGER ===');
console.log(`pageerror: ${pageErrs.length}`);
if(pageErrs.length) pageErrs.slice(0,5).forEach(e=>console.log('  PAGEERR', e));
if(R.fails.length){
  console.log(`\n❌ ${R.fails.length} INVARIANTI VIOLATI:`);
  R.fails.forEach(f=>console.log('  ✗ '+f));
} else {
  console.log('\n✅ trigger tornei Nazionali coerente da tutti i path');
}
await browser.close(); srv.close();
process.exit((R.fails.length||pageErrs.length)?1:0);
