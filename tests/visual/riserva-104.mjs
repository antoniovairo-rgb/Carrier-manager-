#!/usr/bin/env node
/* [giro 104] GUARDIANO — la riserva dell'esito vale solo per il riquadro della SUA scena (rosso __CPM_NO_G104A).
   Difetto (highlight-95 D3 nella catena 178-finale, «Uno-due con LUZI»: esito «Anticipato dall'avversario» rivelato dalla riserva
   mentre il 3D mostrava ancora la conclusione): revealRiserva95 leggeva sempre il riquadro CORRENTE; un suo richiamo tardivo
   programmato per la scena precedente poteva arrivare sul riquadro nuovo prima del pavimento minAt, scrivere o.via='riserva' e
   rimandare — e alla scadenza del pavimento l'esito usciva col 3D ancora sulla conclusione (pallone ai piedi dell'eroe).
   Riproduzione deterministica: gancio di sola prova __CPM_G104STALE (con __CPM_REC) che, a ogni risoluzione, rimanda il richiamo
   della riserva della scena precedente (suo riquadro, suo orologio di risoluzione) 60 ms dopo. Si gioca highlight-95 su s1/1234
   (politica passaggio, pagina nuova) due volte:
     VERDE  gancio acceso: i richiami altrui devono essere INTERCETTATI (testimone __CPM_G104X > 0) e nessun D3.
     ROSSO  gancio + __CPM_NO_G104A: deve comparire almeno un D3 «rivelato dalla riserva» con la scena occupata.
   Uso: node riserva-104.mjs (circa 10 minuti). */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
const env0 = { ...process.env };
if (!env0.CPM_CHROME && fs.existsSync('/opt/pw-browsers/chromium')) env0.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!env0.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync('/opt/pw-browsers')) env0.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const base = { CPM_ARMI: 'verde', CPM_SALVA: 's1', CPM_SEMI: process.env.CPM_G104_SEME || '1234', CPM_POL: 'pass', CPM_NO_SENZA: '1', CPM_RIGHE: '1' };
function gioca(flag) {
  const r = spawnSync(process.execPath, [new URL('./highlight-95.mjs', import.meta.url).pathname], { env: { ...env0, ...base, CPM_FLAG: flag }, encoding: 'utf8', maxBuffer: 64 << 20, timeout: 900000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const x = (out.match(/riserva su riquadro altrui (\d+)/) || [])[1] | 0;
  const d3 = out.split('\n').filter(l => /^\s*· D3 .*rivelato dalla riserva/.test(l));
  const hl = +((out.match(/VERDE highlight (\d+)/) || [])[1] || 0);
  return { x, d3, hl, out };
}
const V = gioca('__CPM_G104STALE');
console.log(`VERDE  highlight ${V.hl} · richiami altrui intercettati ${V.x} · D3 riserva ${V.d3.length}`); V.d3.forEach(l => console.log('   ' + l.trim().slice(0, 300)));
const R = gioca('__CPM_G104STALE,__CPM_NO_G104A');
console.log(`ROSSO  highlight ${R.hl} · richiami altrui ${R.x} · D3 riserva ${R.d3.length}`); R.d3.slice(0, 4).forEach(l => console.log('   ' + l.trim().slice(0, 300)));
const g = [];
if (V.hl < 3) g.push(`verde: solo ${V.hl} highlight (partita non giocata?)`);
if (V.x < 1) g.push('verde: nessun richiamo altrui da intercettare — il gancio non ha agito, passata cieca');
if (V.d3.length) g.push(`verde: ${V.d3.length} D3 «rivelato dalla riserva»`);
if (R.hl < 3) g.push(`rosso: solo ${R.hl} highlight`);
if (!R.d3.length) g.push('rosso: nessun D3 — il difetto non si vede, il guardiano non giudica');
if (g.length) { g.forEach(x => console.log('✗ ' + x)); console.log('✗ riserva-104 ROSSO'); process.exit(1); }
console.log('✓ riserva-104 VERDE'); process.exit(0);
