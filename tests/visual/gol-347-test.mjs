/* [giro 347 PO-599] GUARDIANO: I GOL DEL MOTORE DELLA SIMULAZIONE RAPIDA, TARATI. Pagina senza grafica, 840 partite a semi fissi
   (60 per lega su 14 leghe, avversari della stessa lega, casa/trasferta alterne, percorso Simula: simulateMatch {motore:true}).
   A · verde: gol a partita in 2,6-2,9 (bersaglio PO) · pareggi 18-34% (banda di sim-motore) · la piu' forte di 10+ punti vince piu'
       della piu' debole come prima (punti forte > punti debole + 0,9).
   B · stesso seme ⇒ stessa partita (determinismo) e __CPM_GOL347_K=1 ⇒ partita IDENTICA al rosso: l'unica differenza e' il fattore.
   C · rosso nella stessa pagina (window.__CPM_NO_G347 = taratura di oggi): gol < 2,5, come misurato prima (2,33).
   D · statico: gol347 si accende in un punto solo (simulaPartitaMotore); la partita vissuta non lo riceve.
   CPM_NO_G347=1 → il verde nasce spento: il guardiano DEVE uscire rosso. */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
import fs from 'node:fs';
const ROSSO = process.env.CPM_NO_G347 === '1';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G347 = 1; }, ROSSO);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => typeof window.__CPM_SIM_MOTORE === 'function' && typeof window.__CPM_simMatch === 'function', { timeout: 90000 });
const R = await page.evaluate(() => {
  const leghe = [...new Set(CLUBS.map(c => c.lg))].filter(lg => CLUBS.filter(c => c.lg === lg).length >= 10);
  const casi = []; for (const lg of leghe) { const cl = CLUBS.filter(c => c.lg === lg);
    for (let k = 0; k < 60; k++) { const a = cl[k % cl.length], b = cl[(k * 7 + 3) % cl.length]; if (a === b) continue; casi.push([a, b, k % 2 === 0, (347000 + casi.length * 131) >>> 0]); } }
  const gioca = () => casi.map(([a, b, h, sd]) => { const r = window.__CPM_simMatch(a, b, Math.max(50, Math.min(90, a.p)), h, sd, {}, { motore: true }); return [r.homeScore, r.awayScore, a.p - b.p]; });
  const st = rr => { let g = 0, x = 0, pf = 0, pd = 0, n = 0; for (const [h, a, d] of rr) { g += h + a; if (h === a) x++;
      if (Math.abs(d) >= 10) { n++; const f = d > 0 ? h : a, w = d > 0 ? a : h; pf += f > w ? 3 : f === w ? 1 : 0; pd += w > f ? 3 : f === w ? 1 : 0; } }
    return { N: rr.length, gol: g / rr.length, pari: 100 * x / rr.length, pf: pf / n, pd: pd / n }; };
  const base = window.__CPM_NO_G347;
  const v1 = gioca(), v2 = gioca();
  window.__CPM_GOL347_K = 1; const k1 = gioca(); delete window.__CPM_GOL347_K;
  window.__CPM_NO_G347 = 1; const ro = gioca(); window.__CPM_NO_G347 = base;
  return { leghe: leghe.length, v: st(v1), r: st(ro), det: JSON.stringify(v1) === JSON.stringify(v2), k1: JSON.stringify(k1) === JSON.stringify(ro) };
});
const f2 = x => x.toFixed(2).replace('.', ',');
console.log(`A · verde ${R.v.N} partite (${R.leghe} leghe): gol ${f2(R.v.gol)} · pareggi ${R.v.pari.toFixed(1)}% · forte di 10+ ${f2(R.v.pf)} punti contro ${f2(R.v.pd)}`);
console.log(`B · stesso seme stessa partita: ${R.det} · fattore 1 = rosso bit per bit: ${R.k1}`);
console.log(`C · rosso (taratura di oggi): gol ${f2(R.r.gol)} · pareggi ${R.r.pari.toFixed(1)}% · forte ${f2(R.r.pf)} contro ${f2(R.r.pd)}`);
const src = fs.readFileSync('../../src/14-motore-possesso.jsx', 'utf8'); const acc = (src.match(/gol347:true/g) || []).length;
const altrove = fs.readdirSync('../../src').filter(f => f !== '14-motore-possesso.jsx' && /gol347/.test(fs.readFileSync('../../src/' + f, 'utf8')));
console.log(`D · gol347 acceso in ${acc} punto/i di src/14 · citato in altri frammenti: ${altrove.length ? altrove.join(',') : 'nessuno'}`);
const fails = [];
if (R.v.N < 800) fails.push(`A: non giudicato, solo ${R.v.N} partite`);
if (!(R.v.gol >= 2.6 && R.v.gol <= 2.9)) fails.push(`A: gol ${f2(R.v.gol)} fuori da 2,6-2,9`);
if (!(R.v.pari >= 18 && R.v.pari <= 34)) fails.push(`A: pareggi ${R.v.pari.toFixed(1)}% fuori da 18-34%`);
if (!(R.v.pf > R.v.pd + 0.9)) fails.push(`A: la forte non si distingue dalla debole (${f2(R.v.pf)} contro ${f2(R.v.pd)})`);
if (!R.det) fails.push('B: lo stesso seme non da\' la stessa partita');
if (!R.k1) fails.push('B: col fattore 1 la partita non e\' quella del rosso');
if (!(R.r.gol < 2.5)) fails.push(`C: il rosso non riproduce la taratura di oggi (gol ${f2(R.r.gol)})`);
if (acc !== 1 || altrove.length) fails.push('D: gol347 non e\' acceso in un punto solo');
if (errors.length) fails.push('errori di pagina: ' + errors.slice(0, 2).join(' | '));
await browser.close(); srv.close();
console.log(fails.length ? '❌ FAIL gol-347' + (ROSSO ? ' (braccio rosso CPM_NO_G347=1)' : '') + '\n  ' + fails.join('\n  ') : '✅ PASS gol-347'); process.exit(fails.length ? 1 : 0);
