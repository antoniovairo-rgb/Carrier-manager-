/* [giro 158 PO-360] GUARDIANO DELLE PARTITE SIMULATE: SQUADRA DELL'EROE E VOTO DALLA PAGELLA DEL MOTORE.
   G1 · squadra (difetto B del giro 157). Percorso vero della carriera: simulateMatch col motore (__CPM_simMatch, quindi con la tattica
        persona dell'avversario), 70 contro 70, eroe OVR 70, avversari diversi, casa e trasferta alternate, semi fissi. Due bracci sulla
        stessa pagina di prova: A = il gioco com'e', B = __CPM_NO_G158 (l'occasione simulata dell'eroe come prima: tiro con la resa di un tiro
        qualunque, passaggio qualunque anche col compagno in area, dribbling riuscito che non porta a niente). Giudicati: (a) punti a partita di A nella banda del fondo classifica a
        forza pari (valore esatto dalla curva di updateStandings, lambda 1,42 / 1,26, +-0,08); (b) A fa almeno 0,08 punti piu' di B;
        (c) A segna almeno 0,15 gol piu' di B e non ne subisce meno di B oltre 0,06 (la correzione sta nei gol fatti, non in un avversario
        indebolito); (d) gol totali a partita di A nella banda di sim-motore 2,3-3,5. Il motore e' seedato: stessi semi, stessi numeri.
   G2 · voto (opzione C, decisione PO 11/11). Griglia OVR della sonda sim-voto-156 (Primavera p25 OVR 55-70, prima squadra 19 anni OVR
        60-70), semi del percorso vero. Giudicati: (a) ogni simulata porta la pagella del motore (base158) e la base e' la pagella SENZA
        la quota gol/assist del motore, compressa coi minuti; (b) un gol registrato vale nel voto una volta sola, con la scala della
        pagella (1 gol = +0,80 sulla base); (c) voto medio della griglia >= 6,15 (prima: 5,77-5,99 in questi gruppi).
   Dichiarati, non giudicati: motore con tattica neutra (__CPM_SIM_MOTORE) a 70 contro 70 e Primavera 40 contro 40 con eroe OVR 65.
   CPM_ROSSO=1 → __CPM_NO_G158 anche sul braccio A: il guardiano deve uscire con codice 1.
   «Non giudicato» = rosso. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const ROSSO = process.env.CPM_ROSSO === '1';
const N1 = +(process.env.CPM_N1 || 2000), N2 = +(process.env.CPM_N2 || 120);
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const errors = [];
async function pagina(no158, save) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ no, S }) => { window.__CPM_GLB = false; if (no) window.__CPM_NO_G158 = 1;
    if (S) for (const k of Object.keys(S)) { try { localStorage.setItem(k, typeof S[k] === 'string' ? S[k] : JSON.stringify(S[k])); } catch (e) {} } }, { no: no158, S: save || null });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => typeof window.__CPM_SIM_MOTORE === 'function' && typeof window.__CPM_simMatch === 'function', null, { timeout: 90000 });
  return { ctx, page };
}
const fails = [];
const f2 = x => isFinite(x) ? x.toFixed(2) : '-';

/* ── G1 · squadra ── */
const carriera = (page, N) => page.evaluate(({ N }) => {
  let pt = 0, gf = 0, gs = 0;
  for (let k = 0; k < N; k++) { const r = window.__CPM_simMatch({ id: 'a', n: 'A', p: 70 }, { id: 'b' + k, n: 'B' + k, p: 70 }, 70, k % 2 === 0, (7000 + k * 41) >>> 0, {}, { motore: true });
    gf += r.homeScore; gs += r.awayScore; pt += r.won ? 3 : r.drew ? 1 : 0; }
  return { pt: pt / N, gf: gf / N, gs: gs / N };
}, { N });
const neutra = (page, F, ovr, N) => page.evaluate(({ F, ovr, N }) => {
  let pt = 0, gf = 0, gs = 0;
  for (let k = 0; k < N; k++) { const r = window.__CPM_SIM_MOTORE({ seed: (9001 + k * 7919) >>> 0, forzaH: F, forzaA: F, stadio: k % 2 ? 'away' : 'home', ovr });
    gf += r.home; gs += r.away; pt += r.home > r.away ? 3 : r.home === r.away ? 1 : 0; }
  return { pt: pt / N, gf: gf / N, gs: gs / N };
}, { F, ovr, N });
const t0 = Date.now();
const A = await pagina(ROSSO), B = await pagina(true);
const gA = await carriera(A.page, N1), gB = await carriera(B.page, N1);/* un braccio alla volta */
/* il fondo classifica a forza pari: la stessa curva di updateStandings (src/09), valore esatto dalla Poisson */
const fondo = await A.page.evaluate(() => { const pmf = (l) => { const p = []; let v = Math.exp(-l); for (let k = 0; k < 15; k++) { p.push(v); v *= l / (k + 1); } return p; };
  const h = pmf(1.42), a = pmf(1.26); let ptC = 0, ptT = 0; for (let i = 0; i < 15; i++) for (let j = 0; j < 15; j++) { const q = h[i] * a[j]; ptC += q * (i > j ? 3 : i === j ? 1 : 0); ptT += q * (j > i ? 3 : i === j ? 1 : 0); }
  return { pt: (ptC + ptT) / 2, gol: 1.42 + 1.26 }; });
const lo = fondo.pt - 0.08, hi = fondo.pt + 0.08;
console.log(`G1 · carriera simulata 70 contro 70, ${N1} partite per braccio (${Math.round((Date.now() - t0) / 1000)} s)`);
console.log(`     fondo classifica a forza pari: ${f2(fondo.pt)} punti a partita (banda ${f2(lo)}-${f2(hi)}), ${f2(fondo.gol)} gol`);
console.log(`     A (gioco${ROSSO ? ', ROSSO' : ''}): ${f2(gA.pt)} punti · gol ${f2(gA.gf)}-${f2(gA.gs)} (totale ${f2(gA.gf + gA.gs)})`);
console.log(`     B (__CPM_NO_G158): ${f2(gB.pt)} punti · gol ${f2(gB.gf)}-${f2(gB.gs)} (totale ${f2(gB.gf + gB.gs)})`);
if (!(isFinite(gA.pt) && isFinite(gB.pt))) fails.push('G1 non giudicato: misura mancante');
else {
  if (gA.pt < lo || gA.pt > hi) fails.push(`G1a: punti a partita ${f2(gA.pt)} fuori dalla banda del fondo classifica ${f2(lo)}-${f2(hi)}`);
  if (gA.pt - gB.pt < 0.08) fails.push(`G1b: la squadra dell'eroe non migliora rispetto alla simulata di prima (${f2(gA.pt)} contro ${f2(gB.pt)}, serve +0,08)`);
  if (gA.gf - gB.gf < 0.15) fails.push(`G1c: gol fatti non in aumento (${f2(gA.gf)} contro ${f2(gB.gf)}, serve +0,15)`);
  if (gB.gs - gA.gs > 0.06) fails.push(`G1c: i gol subiti calano (${f2(gA.gs)} contro ${f2(gB.gs)}): la correzione non deve indebolire l'avversario`);
  if (gA.gf + gA.gs < 2.3 || gA.gf + gA.gs > 3.5) fails.push(`G1d: gol totali a partita ${f2(gA.gf + gA.gs)} fuori da 2,3-3,5`);
}
/* dichiarati: motore con tattica neutra, 70 contro 70 e Primavera 40 contro 40 con eroe OVR 65 (il caso Leonessa del giro 157) */
const nA = await neutra(A.page, 70, 70, 600), nB = await neutra(B.page, 70, 70, 600);
console.log(`     dichiarato · tattica neutra 70 contro 70, 600 partite: A ${f2(nA.pt)} punti (gol ${f2(nA.gf)}-${f2(nA.gs)}) · B ${f2(nB.pt)} (gol ${f2(nB.gf)}-${f2(nB.gs)})`);
const pA = await neutra(A.page, 40, 65, 600), pB = await neutra(B.page, 40, 65, 600);
console.log(`     dichiarato · 40 contro 40, eroe OVR 65, 600 partite: A ${f2(pA.pt)} punti (gol ${f2(pA.gf)}-${f2(pA.gs)}) · B ${f2(pB.pt)} (gol ${f2(pB.gf)}-${f2(pB.gs)})`);
await B.ctx.close();

/* ── G2 · voto ── */
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s1w15.json', import.meta.url)));
const saveP = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url)));
const GRUPPI = [...[55, 60, 65, 70].map(o => ({ base: 'primavera', ovr: o, age: 17 })), ...[60, 65, 70].map(o => ({ base: 'pro', ovr: o, age: 19 }))];
const V = await A.page.evaluate(({ GRUPPI, N, pl }) => {
  const out = { n: 0, conBase: 0, baseOk: 0, golOk: 0, golProve: 0, somma: 0, gruppi: [] };
  const ga = (g, a) => { let v = 0; const G = [0.75, 0.55, 0.55]; for (let j = 0; j < g; j++) v += (j < 3 ? G[j] : 0.30) + 0.05; for (let j = 0; j < a; j++) v += (j < 1 ? 0.50 : 0.35); return v; };
  for (const G of GRUPPI) {
    const base = pl[G.base]; let p = { ...base, ovr: G.ovr, age: G.age, coachTrust: 60, form: 70, fatigue: 10, matchHistory: [], name: 'Sonda Voto' };
    const club = p.club; const pool = getLeagueClubs(p).filter(c => c && c.id !== club.id); if (!pool.length) return { err: 'pool vuoto ' + G.base };
    try { p.squadRole = calcSquadRole(p); } catch (e) {}
    let s = 0;
    for (let i = 0; i < N; i++) {
      const w = (i % 34) + 1, season = 1 + Math.floor(i / 34); p = { ...p, week: w, season };
      const opp = pool[i % pool.length]; const _aSd = standingsSeed(club.id || club.n, season, w); const seed = (_aSd + w * 31 + 1) >>> 0;
      const sim = simulateMatch(p.club, opp, p.ovr, (i % 2) === 0, seed, {}, { motore: true, giocatore: p, stileEroe: (typeof stileMotore === 'function' ? stileMotore(p) : null), stile: (p.coach && p.coach.style) || null });
      const ps = _pSimStats(sim, p.ovr, p.archetype?.id || p.archetype || '', seededRng((_aSd + 2) >>> 0));
      const voto = votoSimEroe(sim, ps); out.n++; s += voto;
      if (sim.base158 != null && sim.pag158) { out.conBase++; const q = sim.quota156 != null ? sim.quota156 : 1;
        const atteso = Math.round(Math.max(4, Math.min(9.5, 6 + (sim.pag158.voto - ga(sim.pag158.gol | 0, sim.pag158.assist | 0) - 6) * (0.3 + 0.7 * q))) * 10) / 10;
        if (Math.abs(atteso - sim.base158) < 0.101) out.baseOk++;/* un decimo: quota156 esposta e' arrotondata al centesimo, il gioco usa quella piena */
        if (sim.base158 <= 8.6) { out.golProve++; const d = votoSimEroe(sim, { goals: 1, assists: 0 }) - votoSimEroe(sim, { goals: 0, assists: 0 }); if (Math.abs(d - 0.80) < 0.051) out.golOk++; } }
      p = { ...p, matchHistory: [...p.matchHistory, { rating: voto, simulated: true }].slice(-5) };
    }
    out.gruppi.push({ g: G.base + ' OVR ' + G.ovr, media: s / N }); out.somma += s;
  }
  out.media = out.somma / out.n; return out;
}, { GRUPPI, N: N2, pl: { primavera: JSON.parse(save['cpm-v3']).player, pro: JSON.parse(saveP['cpm-v3']).player } });
if (V.err) fails.push('G2 non giudicato: ' + V.err);
else {
  console.log(`G2 · voto, ${V.n} partite simulate sulla griglia OVR: media ${f2(V.media)} (${V.gruppi.map(x => x.g + ' ' + f2(x.media)).join(' · ')})`);
  console.log(`     pagella del motore presente ${V.conBase}/${V.n} · base = pagella senza gol/assist del motore ${V.baseOk}/${V.conBase} · un gol registrato = +0,80 ${V.golOk}/${V.golProve}`);
  if (V.conBase < V.n) fails.push(`G2a: ${V.n - V.conBase} simulate su ${V.n} senza la pagella del motore`);
  else if (V.baseOk < V.conBase) fails.push(`G2a: base del voto diversa dalla pagella senza gol del motore in ${V.conBase - V.baseOk} casi`);
  if (!V.golProve) fails.push('G2b non giudicato: nessuna prova del gol');
  else if (V.golOk < V.golProve) fails.push(`G2b: il gol registrato non vale una volta sola con la scala della pagella (${V.golOk}/${V.golProve})`);
  if (!(V.media >= 6.15)) fails.push(`G2c: voto medio della griglia ${f2(V.media)} sotto 6,15`);
}
if (errors.length) fails.push('errori di pagina: ' + errors.slice(0, 2).join(' | '));
await A.ctx.close(); await browser.close(); srv.close();
if (ROSSO) { const ok = fails.some(f => f.startsWith('G1')) && fails.some(f => f.startsWith('G2'));
  console.log(ok ? '✅ ROSSO come atteso (sim-g158): senza il giro 158 G1 e G2 falliscono\n  ' + fails.join('\n  ') : '❌ il rosso non riproduce il comportamento di prima\n  ' + fails.join('\n  ')); process.exit(ok ? 1 : 2); }
console.log(fails.length ? '❌ FAIL sim-g158\n  ' + fails.join('\n  ') : '✅ PASS sim-g158'); process.exit(fails.length ? 1 : 0);
