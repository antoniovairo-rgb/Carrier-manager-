/* [7.999.127 PO-190 terza parte] GUARDIANO: le occasioni su azione dell'eroe (tiro e assist) valgono il 25% in meno, dopo i
   modificatori di contesto; rigore e punizione diretta restano il loro xG. Decisione PO 03/10 «scene dell'eroe un po' meno decisive».
   Verde: tiro e assist al 75% del rosso, rigore uguale. Rosso (__CPM_NO_SCENE190): tiro e assist come nella 7.999.122. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/harness.mjs';
const load = (W) => { const src = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8'); const i = src.indexOf('/* CMAV-SRC-HEADER-END */'); const code = src.slice(i + '/* CMAV-SRC-HEADER-END */'.length); return Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, W); };
const giocatori=()=>{const h=[[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]].map((p,i)=>({team:'home',gk:!!p[2],name:'CASA'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));const a=[[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]].map((p,i)=>({team:'away',gk:!!p[2],name:'OSP'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));return h.concat(a);};
const casi = { tiro: { fam: 'tiro', x: 84, y: 48, oppForza: 70 }, assist: { fam: 'assist', x: 78, y: 40, oppForza: 70 }, tiroMods: { fam: 'tiro', x: 84, y: 48, oppForza: 70, mods: 0.05, mult: 1.1 }, rigore: { fam: 'tiro', x: 89, y: 50, intent: 'penalty', oppForza: 70 } };
const misura = (W) => { const m = load(W)({ seed: 190, v2: true, giocatori: giocatori(), eroe: { name: 'EROE', x: 80, y: 50, attivo: true, ovr: 90 }, forza: { home: 80, away: 66 } }); const o = {}; for (const [k, c] of Object.entries(casi)) { const r = m.probEroe(c); o[k] = r ? r.p : null; } return o; };
const verde = misura({}), rosso = misura({ __CPM_NO_SCENE190: true });
console.log(JSON.stringify({ verde, rosso }));
const err = [];
for (const k of ['tiro', 'assist', 'tiroMods']) { if (verde[k] == null || rosso[k] == null) { err.push(k + ': probEroe nullo'); continue; } const r = verde[k] / rosso[k]; if (Math.abs(r - 0.75) > 0.01) err.push(k + ': verde/rosso ' + r.toFixed(3) + ' (atteso 0,75)'); }
if (verde.rigore == null || Math.abs(verde.rigore - rosso.rigore) > 1e-9) err.push('rigore: verde ' + verde.rigore + ' rosso ' + rosso.rigore + ' (devono coincidere)');
if (err.length) { console.error('❌ scene-190: ' + err.join(' · ')); process.exit(1); }
console.log('✅ scene-190 verde (tiro e assist al 75%, rigore invariato; il rosso si vede)');
