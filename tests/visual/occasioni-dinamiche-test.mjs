#!/usr/bin/env node
/* [7.999.28 guardiano — OCCASIONI DELL'EROE DINAMICHE. Decisione PO 26/09: forbice 2-6 a partita, media ~4, dai fattori e dalla partita]
   A) il ritmo (funzione pura `tassoOccasioni28`) risponde ai fattori: condizioni favorevoli > neutre > sfavorevoli, sempre in [2,6],
      e sotto nel punteggio nel finale il ritmo sale.
   B) partite vere col pilota automatico: il bersaglio si ricalcola a partita in corso (testimone `__CPM_OCC28.storia`), resta in [2,6],
      e le scene giocate che contano (catene e piazzati esclusi) non superano 6.
   Rosso: CPM_RED=1 accende `__CPM_NO_OCC28` e il guardiano deve fallire. CPM_N=1 gioca solo la partita favorevole. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_N || 2); const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const errori = []; const ok = (c, m) => { if (!c) errori.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
const perPartita = [];
/* B) partite di CAMPIONATO vere (il provino resta a 2-3 fisso): un eroe in gran forma in una big e uno stanco in una piccola */
const SAVE = (v) => ({ phase: 'career', player: { name: 'Probe Occ' + v.k, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, age: 25, ovr: v.ovr,
  campDone: true, presidentModalSeason: 4, jerseyNumSeason: 4, drawSeen: 4, mercatoSeen: 4, presentSeason: 4, tutorialDone: true, weekLived: true, seasonPledge: { season: 4, tone: 'equilibrato' },
  club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: v.clubP, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': v.ovr, tecnica: v.ovr, fisico: v.ovr, 'mentalità': v.ovr, tiro: v.ovr, passaggio: v.ovr, dribbling: v.ovr, posizionamento: v.ovr },
  form: v.form, morale: v.morale, fatigue: v.fatigue, popularity: 50, value: 25, bankBalance: 90000, goals: 6, assists: 3, matches: 11, contract: { duration: 3, wage: 30000, expiresAtSeason: 8 } } });
const VARIANTI = [{ k: 0, nome: 'favorevole', ovr: 86, clubP: 90, form: 92, morale: 90, fatigue: 5 }, { k: 1, nome: 'sfavorevole', ovr: 74, clubP: 45, form: 48, morale: 40, fatigue: 80 }].slice(0, Math.max(1, N));
for (const v of VARIANTI) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript((c) => { window.__CPM_GLB = false; if (c.red) window.__CPM_NO_OCC28 = true; localStorage.setItem('cpm-v3', JSON.stringify(c.sv)); try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, { red: RED, sv: SAVE(v) });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await sleep(2500);
  await page.evaluate(() => { const b2 = Array.from(document.querySelectorAll('button')).find(x => /Gioca vs/i.test(x.textContent || '')); if (b2) b2.click(); }); await sleep(1500);
  await page.evaluate(() => { const b2 = Array.from(document.querySelectorAll('button')).find(x => /Gioca la partita/i.test(x.textContent || '')); if (b2) b2.click(); }); await sleep(2500);
  for (let i = 0; i < 30; i++) { const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (ph === 'playing') break; await page.keyboard.press('Enter'); await sleep(1500); }
  if (v.k === 0) {
    const A = await page.evaluate(() => { const f = window.__CPM_TASSO28; if (!f) return null;
      const base = { form: 70, morale: 70, fatigue: 20, energy: 90, ovr: 70, oppP: 70, clubP: 70, ment: 0, mw: 3, min: 30, dG: 0 };
      return { neutro: f(base).r,
        favorevole: f({ ...base, form: 92, morale: 92, ovr: 84, oppP: 55, clubP: 86, ment: 0.6, mw: 9 }).r,
        sfavorevole: f({ ...base, form: 45, morale: 40, fatigue: 90, energy: 25, ovr: 60, oppP: 88, clubP: 50, ment: -0.6, pitchFx: 'storm' }).r,
        sotto: f({ ...base, min: 70, dG: -1 }).r,
        estremi: [f({ form: 200, morale: 200, ovr: 200, oppP: 0, clubP: 200, ment: 5, mw: 10, oppRed: true, dG: -3, min: 80 }).r, f({ form: 0, morale: 0, fatigue: 200, energy: 0, ovr: 0, oppP: 200, clubP: 0, ment: -5, pitchFx: 'snow', giallo: true }).r] }; });
    console.log('ritmo', JSON.stringify(A));
    ok(!!A, 'A: la funzione del ritmo esiste');
    if (A) {
      ok(A.neutro >= 3.5 && A.neutro <= 4.5, `A: condizioni neutre ~4 (${A.neutro.toFixed(2)})`);
      ok(A.favorevole > A.neutro + 0.8, `A: favorevoli sopra le neutre (${A.favorevole.toFixed(2)})`);
      ok(A.sfavorevole < A.neutro - 0.8, `A: sfavorevoli sotto le neutre (${A.sfavorevole.toFixed(2)})`);
      ok(A.sotto > A.neutro, `A: sotto di un gol al 70' il ritmo sale (${A.sotto.toFixed(2)})`);
      ok(A.estremi[0] <= 6 && A.estremi[1] >= 2, `A: forbice 2-6 rispettata agli estremi (${A.estremi.join(', ')})`);
    }
  }
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 9400 + v.k);
  const seen = new Set(); const t0 = Date.now(); let ultimo = null;
  while (Date.now() - t0 < 360000) {
    const r = await page.evaluate(() => { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); let key = null;
      try { const s = window.__CPM_CURSIT && window.__CPM_CURSIT(); if (s) key = s.i + '#' + s.gi; } catch (e) {}
      const O = window.__CPM_OCC28; const st = (O && O.storia) || [];
      const o = O ? { T: O.T, esenti: O.esenti, n: st.length, Ts: [...new Set(st.map(x => x.T))], rs: st.map(x => x.r), rMed: st.length ? st.reduce((a, x) => a + x.r, 0) / st.length : null } : null;
      return { ph, key, o, err: window.__CPM_OCC28ERR || null }; }).catch(() => ({ ph: null }));
    if (r.o || r.err) ultimo = r;
    if (r.ph === 'ended' || r.ph === 'ceremony') break;
    if (r.ph && r.ph.startsWith('hl_') && r.key && !seen.has(r.key)) seen.add(r.key);
    await sleep(400);
  }
  const o = ultimo && ultimo.o; const scene = seen.size; const nette = scene - ((o && o.esenti) | 0);
  const rMin = o && o.rs.length ? Math.min(...o.rs) : null, rMax = o && o.rs.length ? Math.max(...o.rs) : null;
  perPartita.push({ k: v.k, nome: v.nome, scene, nette, T: o && o.T, Ts: o && o.Ts, rMin, rMax, rMed: o && o.rMed, minuti: o && o.n, err: ultimo && ultimo.err });
  console.log('partita', v.nome, JSON.stringify(perPartita[perPartita.length - 1]));
  await page.close();
}
await b.close(); srv.close();
for (const p of perPartita) {
  ok(!p.err, `B${p.k}: nessun errore nel ricalcolo`);
  ok(p.minuti >= 40, `B${p.k}: il bersaglio si ricalcola a partita in corso (${p.minuti} minuti registrati)`);
  ok(p.Ts && p.Ts.every(t => t >= 2 && t <= 6), `B${p.k}: bersaglio sempre in [2,6] (${p.Ts})`);
  ok(p.rMin != null && p.rMax - p.rMin > 0.05, `B${p.k}: il ritmo cambia durante la partita (${p.rMin}..${p.rMax})`);
  ok(p.nette <= 6, `B${p.k}: scene che contano <= 6 (${p.nette}, totali ${p.scene})`);
}
if (perPartita.length >= 2) ok(perPartita[0].rMed != null && perPartita[1].rMed != null && perPartita[0].rMed > perPartita[1].rMed + 0.5, `B: l'eroe favorito ha un ritmo piu' alto dello sfavorito (${perPartita[0].rMed && perPartita[0].rMed.toFixed(2)} vs ${perPartita[1].rMed && perPartita[1].rMed.toFixed(2)})`);
const media = perPartita.reduce((a, p) => a + p.nette, 0) / Math.max(1, perPartita.length);
console.log('media scene che contano', media.toFixed(2));
if (errori.length) { console.log('\nOCCASIONI DINAMICHE: FALLITO (' + errori.length + ')' + (RED ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nOCCASIONI DINAMICHE: PASS'); process.exit(0);
