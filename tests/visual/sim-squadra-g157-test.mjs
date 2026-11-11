/* [giro 157 PO-360] GUARDIANO: LA SQUADRA DELL'EROE SIMULATA RISPETTA LA SUA FORZA.
   Segnalazione PO: Primavera 2, FC Leonessa Primavera (forza 35, quinta del girone), dieci partite col tasto Simula
   1V-3N-6P e 2 gol fatti, da -1 a -13 dalla vetta. Misura: il motore (creaMotorePossesso, src/14 r.~257) porta ogni forza
   sotto 40 a 40, e in Primavera 2 i club vanno da 20 a 38: tutte le partite simulate dell'eroe diventavano 40 contro 40.
   Il guardiano gioca la Leonessa contro le 17 avversarie del girone, in casa e fuori, su semi fissi, col percorso VERO
   (window.__CPM_simMatch con {motore:true}) e la confronta col fondo classifica (updateStandings, Poisson delle altre squadre)
   sulle stesse coppie.
   G1 · la forza conta: la STESSA avversaria (stessa persona/tattica) a forza 25 e a forza 38, sugli stessi 120 semi, deve dare
         risultati diversi (identici <= SOGLIA_UGUALI %) e piu' punti contro la 25. Col pavimento le due diventano 40: 100% identici.
   Dichiarato: classifica per fasce del girone (rumorosa: errore standard ~0,15 punti a partita con 12 semi).
   (Un secondo controllo «gol fatti deboli > forti» e' stato tolto: era verde anche nel braccio rosso, non discrimina.)
   Dichiarato (non giudicato): punti a partita dell'eroe simulato contro il fondo classifica (residuo B del rapporto).
   CPM_ROSSO=1 → window.__CPM_NO_G157: torna il pavimento che appiattisce, il guardiano deve andare ROSSO. */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const K = +(process.env.CPM_K || 8);
const SOGLIA_UGUALI = 60;/* % di partite identiche; misura dei due bracci nel rapporto docs/collaudo/GIRO157-SIMULATE-SQUADRA.md */
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage(); await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G157 = 1; }, ROSSO);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => typeof window.__CPM_simMatch === 'function' && typeof updateStandings === 'function', { timeout: 60000 });
const R = await page.evaluate((K) => {
  const L = U18_CLUBS_P2; const me = L.find(c => /Leonessa/.test(c.n));
  const opps = L.filter(c => c !== me).sort((a, b) => a.p - b.p);
  const deboli = new Set(opps.slice(0, 6).map(c => c.id)), forti = new Set(opps.slice(-6).map(c => c.id));
  const z = () => ({ n: 0, p: 0, gf: 0, ga: 0, w: 0, d: 0, hg: [0, 0, 0, 0, 0, 0, 0, 0] });
  const A = { sim: { tutte: z(), deboli: z(), forti: z() }, fondo: { tutte: z(), deboli: z(), forti: z() } };
  const add = (a, gf, ga) => { a.n++; a.hg[Math.min(gf, 7)]++; a.gf += gf; a.ga += ga; if (gf > ga) { a.w++; a.p += 3; } else if (gf === ga) { a.d++; a.p++; } };
  const put = (k, o, gf, ga) => { add(A[k].tutte, gf, ga); if (deboli.has(o.id)) add(A[k].deboli, gf, ga); if (forti.has(o.id)) add(A[k].forti, gf, ga); };
  opps.forEach((o, oi) => { for (let k = 0; k < K; k++) for (const h of [true, false]) {
    const seed = (157000 + oi * 7919 + k * 104729 + (h ? 1 : 0)) >>> 0;
    const r = window.__CPM_simMatch(me, o, 65, h, seed, {}, { motore: true, stile: null });
    put('sim', o, r.homeScore, r.awayScore);
    /* fondo classifica: la STESSA funzione delle altre squadre, con una riga fittizia per l'eroe (esclusa) */
    const st = initStandings([{ id: '__x', n: '__x', p: 30 }, me, o]);
    const out = updateStandings(st, '__x', null, {}, { seed });
    const rm = out.find(t => t.id === me.id); put('fondo', o, rm.gf, rm.ga);
  } });
  /* G1: stessa avversaria (stessa persona/tattica), stessi semi, solo la forza cambia: 25 contro 38 */
  const ox = opps[opps.length - 1]; let ug = 0, tot = 0, pDeb = 0, pFor = 0;
  for (let k = 0; k < 60; k++) for (const h of [true, false]) { const seed = (257000 + k * 104729 + (h ? 1 : 0)) >>> 0;
    const a1 = window.__CPM_simMatch(me, { ...ox, p: 25 }, 65, h, seed, {}, { motore: true, stile: null });
    const a2 = window.__CPM_simMatch(me, { ...ox, p: 38 }, 65, h, seed, {}, { motore: true, stile: null });
    tot++; if (a1.homeScore === a2.homeScore && a1.awayScore === a2.awayScore) ug++;
    pDeb += a1.won ? 3 : a1.drew ? 1 : 0; pFor += a2.won ? 3 : a2.drew ? 1 : 0; }
  const G1 = { ox: ox.n, uguali: +(100 * ug / tot).toFixed(1), tot, ppgDeb: +(pDeb / tot).toFixed(2), ppgFor: +(pFor / tot).toFixed(2) };
  const f = a => ({ n: a.n, ppg: +(a.p / a.n).toFixed(2), gf: +(a.gf / a.n).toFixed(2), ga: +(a.ga / a.n).toFixed(2), V: Math.round(100 * a.w / a.n), N: Math.round(100 * a.d / a.n), w: a.w / a.n, d: a.d / a.n, hg: a.hg.map(x => x / a.n) });
  const o = {}; for (const k in A) { o[k] = {}; for (const t in A[k]) o[k][t] = f(A[k][t]); }
  return { G1, me: [me.n, me.p], deboli: opps.slice(0, 6).map(c => c.p), forti: opps.slice(-6).map(c => c.p), ...o };
}, K);
const fails = [];
console.log(`Squadra: ${R.me[0]} (forza ${R.me[1]}) · deboli ${R.deboli.join(',')} · forti ${R.forti.join(',')} · ${K} semi x casa/fuori${ROSSO ? ' · BRACCIO ROSSO (__CPM_NO_G157)' : ''}`);
for (const k of ['sim', 'fondo']) for (const t of ['tutte', 'deboli', 'forti']) { const x = R[k][t]; console.log(`  ${k.padEnd(5)} ${t.padEnd(6)} n=${x.n} · punti/partita ${x.ppg} · gol ${x.gf}-${x.ga} · V ${x.V}% N ${x.N}%`); }
const gap = R.sim.deboli.ppg - R.sim.forti.ppg, gapF = R.fondo.deboli.ppg - R.fondo.forti.ppg;
console.log(`G1 · stessa avversaria (${R.G1.ox}) a forza 25 e 38, stessi semi: risultati identici ${R.G1.uguali}% di ${R.G1.tot} · punti/partita ${R.G1.ppgDeb} contro ${R.G1.ppgFor} · soglia identici <= ${SOGLIA_UGUALI}%`);
console.log(`Dichiarato · scarto punti deboli-forti del girone: simulata ${gap.toFixed(2)} (fondo ${gapF.toFixed(2)})`);
console.log(`Dichiarato · gol fatti deboli/forti: simulata ${R.sim.deboli.gf}/${R.sim.forti.gf}`);
console.log(`Dichiarato · punti/partita eroe simulato ${R.sim.tutte.ppg} contro fondo ${R.fondo.tutte.ppg} (residuo B, non giudicato)`);
/* probabilita' della serie del PO (10 partite: 6 punti, 2 gol fatti) con la distribuzione misurata, partite indipendenti */
const pSerie = (x) => { let P = new Map([[0, 1]]); for (let i = 0; i < 10; i++) { const Q = new Map(); for (const [k, v] of P) { const l = 1 - x.w - x.d; for (const [dp, pr] of [[3, x.w], [1, x.d], [0, l]]) Q.set(k + dp, (Q.get(k + dp) || 0) + v * pr); } P = Q; } let s = 0; for (const [k, v] of P) if (k <= 6) s += v; return s; };
const pGol = (x) => { let P = [1]; for (let i = 0; i < 10; i++) { const Q = new Array(P.length + 7).fill(0); P.forEach((v, k) => x.hg.forEach((pr, g) => { Q[k + g] += v * pr; })); P = Q; } return P[0] + P[1] + P[2]; };
console.log(`Dichiarato · serie del PO (<=6 punti in 10): simulata ${(100 * pSerie(R.sim.tutte)).toFixed(2)}% · fondo ${(100 * pSerie(R.fondo.tutte)).toFixed(2)}%`);
console.log(`Dichiarato · <=2 gol fatti in 10: simulata ${(100 * pGol(R.sim.tutte)).toFixed(3)}% · fondo ${(100 * pGol(R.fondo.tutte)).toFixed(4)}%`);
if (!(R.G1.uguali <= SOGLIA_UGUALI)) fails.push(`G1: la forza dell'avversaria non conta nella simulata (${R.G1.uguali}% di risultati identici fra forza 25 e 38 > ${SOGLIA_UGUALI}%)`);
if (!(R.G1.ppgDeb > R.G1.ppgFor)) fails.push(`G1: contro l'avversaria a 25 non si fanno piu' punti che contro la stessa a 38 (${R.G1.ppgDeb} contro ${R.G1.ppgFor})`);
if (errors.length) fails.push('pageerror: ' + errors[0]);
await browser.close(); srv.close();
if (fails.length) { console.log('❌ ROSSO\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('✅ VERDE'); process.exit(0);
