/* [giro 384 PO-524] GUARDIANO «la partita non rallenta dentro la stessa partita».
   Causa misurata (misura-384.mjs, RAPPORTO-giro384): il velo caldo del campo 2D (src/15, Campo2D, heat map 23/09) faceva UNA
   SFOCATURA PER CELLA a ogni fotogramma; le celle crescono col tempo di gioco e il fotogramma del banco passava da 17 a 396 ms in 28'.
   Correzione: una sola sfocatura per fotogramma (tela fuori schermo). Rosso __CPM_NO_G384 = una sfocatura per cella.
   SOGLIE SCRITTE PRIMA DELLA MISURA (non si abbassano):
     S1  fotogramma mediano in gioco fluido: mediana degli ultimi 8 minuti campionati / mediana dei primi 8 (dal 2') <= 1,5
     S2  secondi di parete per minuto di gioco (solo coppie di minuti consecutivi senza highlight in mezzo): ultimi 8 / primi 8 <= 1,5
     S3  sfocature per fotogramma del velo (testimone __CPM_SFOC384): massimo <= 1 per tutta la corsa (la cosa che cresceva resta piatta)
     copertura: 30' raggiunto, >= 16 minuti campionati, >= 8 coppie pulite, velo con >= 40 celle accese; altrimenti NON GIUDICATO = rosso.
   Bracci in fila (mai in parallelo: la contesa della CPU sporca i tempi): PC verde · telefono 412x915 verde · PC rosso (deve cadere su S1 o S3,
   con almeno il 20' raggiunto, altrimenti il rosso e' «non giudicato» e il guardiano esce rosso).
   Uso: npm run lentezza-384 */
import { spawnSync } from 'child_process'; import fs from 'fs';
const med = a => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : null; };
function braccio(nome, disp, rosso, minFine) {
  const out = `out/lentezza-384-${nome}.json`; try { fs.unlinkSync(out); } catch (e) {}
  const r = spawnSync('node', ['misura-384.mjs', disp], { env: { ...process.env, OUT: out, MIN_FINE: String(minFine), TETTO: '420000', CPM_ROSSO: rosso ? '1' : '0' }, encoding: 'utf8', timeout: 540000 });
  if (!fs.existsSync(out)) return { nome, ng: 'nessuna misura (' + String(r.stderr || r.error || '').slice(-200) + ')' };
  const d = JSON.parse(fs.readFileSync(out, 'utf8')); const S = d.out.filter(x => (x.m | 0) >= 2 && x.fmed != null);
  const minMax = d.out.length ? Math.max(...d.out.map(x => x.m | 0)) : 0;
  const f1 = med(S.slice(0, 8).map(x => x.fmed)), f2 = med(S.slice(-8).map(x => x.fmed));
  const cp = []; for (let i = 1; i < d.out.length; i++) { const a = d.out[i - 1], b = d.out[i]; if ((b.m | 0) - (a.m | 0) === 1 && !b.hl && (a.m | 0) >= 2) cp.push(b.wall - a.wall); }
  const w1 = med(cp.slice(0, 8)), w2 = med(cp.slice(-8)); const sfocMax = Math.max(0, ...d.out.map(x => x.sfocMax | 0)); const celle = Math.max(0, ...d.out.map(x => x.heat | 0));
  return { nome, minMax, n: S.length, coppie: cp.length, f1, f2, r1: f1 ? +(f2 / f1).toFixed(2) : null, w1, w2, r2: w1 ? +(w2 / w1).toFixed(2) : null, sfocMax, celle, errori: d.errs.length };
}
const righe = []; let ok = true;
for (const [nome, disp] of [['pc', 'pc'], ['tel', 'tel']]) {
  const b = braccio(nome, disp, false, 30); righe.push(b);
  const ng = b.ng || (b.minMax < 30 ? `30' non raggiunto (${b.minMax}')` : b.n < 16 ? `${b.n} minuti campionati` : b.coppie < 8 ? `${b.coppie} coppie pulite` : b.celle < 40 ? `velo con ${b.celle} celle` : null);
  if (ng) { ok = false; console.log(`✗ ${nome}: NON GIUDICATO — ${ng}`); continue; }
  const v = b.r1 <= 1.5 && b.r2 <= 1.5 && b.sfocMax <= 1 && !b.errori; if (!v) ok = false;
  console.log(`${v ? '✓' : '✗'} ${nome} verde: fotogramma ${b.f1}→${b.f2} ms (×${b.r1}, soglia 1,5) · s/minuto ${b.w1}→${b.w2} ms (×${b.r2}, soglia 1,5) · sfocature/fotogramma max ${b.sfocMax} (soglia 1) · celle ${b.celle} · ${b.minMax}' · errori ${b.errori}`);
}
{ const b = braccio('rosso', 'pc', true, 30); righe.push(b);
  const ng = b.ng || (b.minMax < 20 ? `20' non raggiunto (${b.minMax}')` : b.n < 10 ? `${b.n} minuti campionati` : null);
  if (ng) { ok = false; console.log(`✗ rosso: NON GIUDICATO — ${ng}`); }
  else { const cade = b.r1 > 1.5 || b.sfocMax > 1; if (!cade) ok = false;
    console.log(`${cade ? '✓' : '✗'} rosso (__CPM_NO_G384) ${cade ? 'cade come deve' : 'NON cade'}: fotogramma ${b.f1}→${b.f2} ms (×${b.r1}) · s/minuto ×${b.r2} · sfocature/fotogramma max ${b.sfocMax} · ${b.minMax}'`); } }
fs.writeFileSync('out/lentezza-384.json', JSON.stringify(righe, null, 1));
console.log(ok ? '✅ lentezza-384 VERDE' : '❌ lentezza-384 ROSSO'); process.exit(ok ? 0 : 1);
