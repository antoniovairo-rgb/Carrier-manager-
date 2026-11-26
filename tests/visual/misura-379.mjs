/* [giro 379] sonda (non guardiano): la pagella della simulata su molti semi, con la pagella del motore accanto. Cerca le goleade vinte
   con voto < 6 e ne stampa la causa (voto del motore, gol del motore, gol registrati, cartellini, quota di minuti). Uso: N=3000 node misura-379.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const N = +(process.env.N || 3000);
const srv = await startServer(); const b = await launchBrowser(); const page = await b.newPage(); await installCdnRoutes(page);
await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G379A = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, process.env.CPM_ROSSO === '1']);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1000);
const R = await page.evaluate((N) => {
  const p = window.__CPM_CAREER.snapshot(); const lc = CLUBS.filter(c => c.lg === p.club.lg && c.id !== p.club.id);
  const out = { n: 0, gol: 0, viol: [], hist: {} };
  for (let i = 0; i < N; i++) {
    const opp = lc[i % lc.length], seed = (i * 2654435761 + 12345) >>> 0;
    const q = { ...p, week: 1 + (i % 30) };
    const sim = simulateMatch(p.club, opp, p.ovr, i % 2 === 0, seed, {}, { motore: true, giocatore: q, stileEroe: (typeof stileMotore === 'function' ? stileMotore(q) : null), stile: (q.coach && q.coach.style) || null });
    const ps = _pSimStats(sim, p.ovr, p.archetype?.id || p.archetype || '', seededRng(hashStr('psim|' + seed) >>> 0));
    const v = votoSimEroe(sim, ps); out.n++; if (sim.cart310 && sim.cart310.r) (out.esp = out.esp || []).push({ i, ris: sim.homeScore + '-' + sim.awayScore, v, ps, riga: _heroSimLine(ps, v) });
    const d = sim.homeScore - sim.awayScore;
    if (d >= 3) { out.gol++; const k = Math.floor(v * 2) / 2; out.hist[k] = (out.hist[k] || 0) + 1;
      if (v < 6.0) out.viol.push({ i, ris: sim.homeScore + '-' + sim.awayScore, v, base: sim.base158, rating: sim.rating, pag: sim.pag158 && { voto: sim.pag158.voto, gol: sim.pag158.gol, ass: sim.pag158.assist, amm: sim.pag158.amm, esp: sim.pag158.esp, tiri: sim.pag158.tiri }, ps, q: sim.quota156, st: sim.stato156, cart: sim.cart310 }); }
  }
  return out;
}, N);
console.log(`simulate ${R.n} · goleade vinte ${R.gol} · voto < 6: ${R.viol.length} (${(100 * R.viol.length / Math.max(1, R.gol)).toFixed(2)}%)`);
console.log(`  di cui con l'eroe espulso dal motore: ${R.viol.filter(x => x.cart && x.cart.r).length} · senza espulsione: ${R.viol.filter(x => !(x.cart && x.cart.r)).length}`);
console.log('istogramma voti goleade vinte: ' + Object.keys(R.hist).sort((a, b) => a - b).map(k => k + ':' + R.hist[k]).join(' '));
console.log(`espulsioni dell'eroe: ${(R.esp || []).length} su ${R.n}`); (R.esp || []).slice(0, 8).forEach(x => console.log('  esp ' + JSON.stringify(x)));
R.viol.slice(0, 15).forEach(x => console.log('  ' + JSON.stringify(x)));
await b.close(); srv.close();
