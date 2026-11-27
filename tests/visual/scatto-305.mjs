/* [giro 305] GUARDIANO «nella scena forzata il pallone nasce sul punto dello staging nello stesso commit del timbro».
   Il difetto (corpi-073 braccio 284f, seme 29: codice 001 in tutti i campioni di un'apertura) sul banco capita circa 1 volta su 20:
   qui si PROVOCA con __CPM_RIT305 (il piazzamento dell'effetto «Ball attachment» arriva 400 ms dopo il timbro di staging).
   · braccio VERDE: provocazione accesa, correzione accesa → corpi-073 284f verde (0 aperture col codice 001).
   · braccio ROSSO: provocazione accesa, window.__CPM_NO_G305 → corpi-073 284f rosso col codice 001.
   Le soglie sono quelle di corpi-073 (non cambiano). Uscita 0 = verde e rosso visibile · 1 = rosso · 2 = cieco.
   Uso: node scatto-305.mjs   (CPM_RIT305=<ms>, default 400; SEMI, default 29) */
import { spawnSync } from 'node:child_process';
/* [giro 406] provocazione di default 400 -> 1200 ms. Misurato: col ritardo di 400 ms il braccio rosso ha due modi, uno netto (001 in
   21/21) e uno al limite (16-17/21 in locale su base e punta, 13-14/23 sul treno della 217: sotto il 75% di corpi-073, rosso «non
   visibile»). Il ritardo e' tempo di PARETE, quindi la quota dipende dalla velocita' della macchina. A 1200 ms: rosso 23/23 e 23/23,
   verde 0/20 e 0/21. La soglia (75% delle aperture) non cambia: cambia solo quanto forte si provoca il difetto. */
const RIT = process.env.CPM_RIT305 || '1200', SEMI = process.env.SEMI || '29';
function braccio(nome, spenti) {
  const r = spawnSync(process.execPath, ['corpi-073.mjs', '284f'], { env: { ...process.env, SEMI, CPM_RIT073: RIT, CPM_SPENTI073: spenti, CPM_ROSSO073: '' }, encoding: 'utf8', timeout: 900000 });
  const out = (r.stdout || '') + (r.stderr || ''); const righe = out.split('\n').filter(l => /^284f seme/.test(l));
  const c001 = righe.filter(l => { const m = l.match(/001 in (\d+)\/(\d+)/); return m && +m[2] >= 4 && +m[1] >= +m[2] * 0.75; }).length;
  console.log(`— braccio ${nome} (ritardo ${RIT} ms${spenti ? ', ' + spenti : ''}): uscita ${r.status}, aperture misurate ${righe.length}, col codice 001 ${c001}`);
  righe.forEach(l => console.log('   ' + l));
  return { st: r.status, n: righe.length, c001 };
}
const V = braccio('verde', ''), R = braccio('rosso', '__CPM_NO_G305');
const G = [], CIECO = [];
if (V.st === 2 || V.n < 2) CIECO.push('braccio verde non misurato'); if (R.st === 2 || R.n < 2) CIECO.push('braccio rosso non misurato');
if (V.st !== 0 || V.c001 > 0) G.push(`verde: codice 001 in ${V.c001}/${V.n} aperture (uscita ${V.st})`);
if (!(R.st === 1 && R.c001 >= 1)) G.push(`rosso non visibile: codice 001 in ${R.c001}/${R.n} aperture (uscita ${R.st})`);
if (CIECO.length) { console.log('⚠️ scatto-305 CIECO: ' + CIECO.join(' · ')); process.exit(2); }
if (G.length) { console.log('❌ scatto-305\n  · ' + G.join('\n  · ')); process.exit(1); }
console.log('✅ scatto-305 verde (rosso di prova visibile)');
