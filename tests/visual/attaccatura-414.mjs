#!/usr/bin/env node
/* [giro 414 · PO-678] GUARDIANO dell'ATTACCATURA dei capelli: nei primi piani nessuna fascia chiara fra capelli e fronte.
   Gira la sonda misura-414 (ingresso in campo, GLB acceso, ora CONGELATA, 22 corpi con nome × 3 direzioni del viso) di NOTTE e di GIORNO,
   nel braccio verde e nel rosso (window.__CPM_NO_G414 = composizione della maschera del giro 240), due pagine alla volta.
   Per ogni scatto: ECCESSO = quota di pixel chiari (L* oltre la mediana della pelle interna + 15) nella fascia di pelle a ridosso dei
   capelli MENO la stessa quota nella pelle lontana dai capelli (riflessi veri della fronte, luce di lato).
   SOGLIA DICHIARATA (giro 414, prima di scrivere il guardiano): nessuno scatto verde con eccesso > 5 punti; ogni ora con 66/66 scatti
   giudicati (uno non giudicato = rosso). Il ROSSO deve mostrare il difetto: almeno uno scatto con eccesso > 5 punti per ora, altrimenti
   la misura e' cieca e il guardiano esce rosso. */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const SOGLIA = 0.05, ATTESI = 66;
fs.mkdirSync('out/g414', { recursive: true });
const corsa = (tod, rosso) => new Promise(res => { const J = `out/g414/guardiano-${tod}-${rosso ? 'rosso' : 'verde'}.json`; try { fs.unlinkSync(J); } catch (e) {}
  const c = spawn(process.execPath, ['misura-414.mjs', ...(rosso ? ['--rosso'] : [])], { env: { ...process.env, CPM_TOD: tod, CPM_JSON: J }, stdio: ['ignore', 'pipe', 'pipe'] }); let out = '';
  c.stdout.on('data', d => out += d); c.stderr.on('data', d => out += d);
  c.on('close', code => { let r = null; try { r = JSON.parse(fs.readFileSync(J, 'utf8')); } catch (e) {} res({ tod, rosso, code, r, out }); }); });
/* due pagine alla volta (notte, poi giorno). Con quattro insieme, nel giro del 26/11 aspetto-412 accanto e' uscito rosso due volte (Daniel White 193 cm, fuori ±3%); da solo, e accanto a questo guardiano a due pagine, verde */
const esiti = [...await Promise.all([corsa('night', false), corsa('night', true)]), ...await Promise.all([corsa('day', false), corsa('day', true)])];
let ok = true; const righe = [];
for (const e of esiti) {
  const nome = `${e.tod} ${e.rosso ? 'ROSSO' : 'verde'}`;
  if (!e.r || !e.r.righe) { ok = false; righe.push(`${nome}: NON GIUDICATO (sonda uscita ${e.code})\n${e.out.slice(-600)}`); continue; }
  const G = e.r.righe.filter(x => x.giudicato), ecc = G.map(x => ({ n: x.nome, a: x.ang, e: x.quota - x.quotaInt, q: x.quota }));
  const fuori = ecc.filter(x => x.e > SOGLIA), mx = ecc.reduce((m, x) => x.e > m.e ? x : m, { e: -1 });
  const msg = `${nome}: scatti giudicati ${G.length}/${e.r.righe.length} · eccesso massimo ${(mx.e * 100).toFixed(1)} punti (${mx.n} ${mx.a}) · scatti oltre ${SOGLIA * 100} punti: ${fuori.length}`;
  if (G.length < ATTESI) { ok = false; righe.push(msg + ' — NON GIUDICATO: scatti mancanti'); continue; }
  if (!e.rosso && fuori.length) { ok = false; righe.push(msg + ' — ROSSO: fascia chiara all\'attaccatura ' + fuori.map(x => `${x.n} ${x.a} ${(x.e * 100).toFixed(1)}`).join(' · ')); continue; }
  if (e.rosso && !fuori.length) { ok = false; righe.push(msg + ' — il braccio rosso non mostra il difetto: misura CIECA'); continue; }
  righe.push(msg + (e.rosso ? ' — il rosso vede il difetto' : ' — verde'));
}
righe.forEach(r => console.log(r));
console.log(ok ? '✅ attaccatura-414 VERDE (verde pulito, rosso vede la fascia)' : '❌ attaccatura-414 ROSSO');
process.exit(ok ? 0 : 1);
