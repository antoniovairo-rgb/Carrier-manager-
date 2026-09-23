import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export function loadMotore() { const src = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
  const i = src.indexOf('/* CMAV-SRC-HEADER-END */'); const code = src.slice(i + 26);
  return Function('decideExecution', 'window', code + '\nreturn creaMotorePossesso;')(undefined, undefined); }
export const giocatori = () => {
  const h = [[8,50,1],[18,12],[18,38],[18,62],[18,88],[38,25],[38,50],[38,75],[55,22],[55,78]].map((p,i)=>({team:'home',gk:!!p[2],name:'CASA'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));
  const a = [[95,50,1],[82,12],[82,38],[82,62],[82,88],[62,25],[62,50],[62,75],[48,20],[48,50],[48,80]].map((p,i)=>({team:'away',gk:!!p[2],name:'OSP'+i,rl:i===0?'GK':i<=4?'DF':i<=7?'MF':'AT',x:p[0],y:p[1]}));
  return h.concat(a); };
export function gioca(crea, seed, dec = 22, ticks = 92) { const m = crea({ seed, giocatori: giocatori(), eroe: { name: 'EROE', x: 58, y: 50, attivo: true, ovr: 74 }, forza: { home: 70, away: 66 } }); const evs = [];
  for (let t = 1; t <= ticks; t++) for (let k = 0; k < dec; k++) for (const e of m.tick({ min: t, dt: 1 / dec, dec: true })) evs.push(e);
  return { m, evs }; }
