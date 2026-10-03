/* [7.999.122 PO-190 seconda parte] GUARDIANO: quanto pesa sul motore una scena dell'eroe. Ogni scena aggiunge i suoi gol attesi al
   «debito» che i tiri successivi dei compagni scontano. Debito pieno: compagni a 0,19 gol a partita dal salvataggio S12 (quota eroe
   86%); al 25%: 0,67 (quota 67%), decisione PO 03/10. Verde: una scena da 0,4 addebita 0,1. Rosso (__CPM_NO_DEB190): addebita 0,4. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/harness.mjs';
const load = (W) => { const src = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8'); const i = src.indexOf('/* CMAV-SRC-HEADER-END */'); const code = src.slice(i + '/* CMAV-SRC-HEADER-END */'.length); return Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, W); };
const giocatori=()=>{const h=[[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]].map((p,i)=>({team:'home',gk:!!p[2],name:'CASA'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));const a=[[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]].map((p,i)=>({team:'away',gk:!!p[2],name:'OSP'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));return h.concat(a);};
const misura = (W) => { const m = load(W)({ seed: 190, giocatori: giocatori(), eroe: { name: 'EROE', x: 58, y: 50, attivo: true, ovr: 90 }, forza: { home: 80, away: 66 } }); m.addebita(0.4); return m.stato().conta.addebitato36; };
const verde = misura({}), rosso = misura({ __CPM_NO_DEB190: true });
console.log(JSON.stringify({ verde, rosso }));
if (Math.abs(verde - 0.1) > 0.001) { console.error('❌ debito-190: una scena da 0,4 addebita ' + verde + ' (atteso 0,1)'); process.exit(1); }
if (Math.abs(rosso - 0.4) > 0.001) { console.error('❌ debito-190: il rosso non si vede (' + rosso + ')'); process.exit(1); }
console.log('✅ debito-190 verde (e il rosso si vede)');
