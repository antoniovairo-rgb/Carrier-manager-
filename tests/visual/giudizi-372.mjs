#!/usr/bin/env node
/* [giro 372 · PO-421 «Giudizi che non si contraddicono: mister, barre e schede coerenti (visto fiducia 93/100 e "più panchina")»]
 * GUARDIANO «I GIUDIZI PARLANO COME LE BARRE» — non-gate, carriera. Legge i testi di giudizio dalle funzioni VERE del gioco
 * (__CPM_CAREER.giudizi372, solo ?cpmtest=1: esame del nuovo mister, convocazione, verifica trimestrale con le tre risposte,
 * voce della settimana) e li confronta coi numeri delle barre (fiducia del mister col suo gradino, forma). Il giudice e'
 * INDIPENDENTE dal gioco: riconosce le frasi con espressioni proprie, non con le liste del gioco.
 *   T- una frase che dice sfiducia/panchina («più panchina», «ti ho tolto dai titolari», «un ragazzo della Primavera…»)
 *      con la barra da Fiducioso in su (>= 70) = contraddizione;
 *   T+ una frase che dice fiducia piena («il posto è tuo», «nostro faro», «uomo di fiducia») con la barra sotto Neutro (< 50);
 *   T* «uomo di fiducia · titolare inamovibile» / «nome per primo» con la barra sotto «Fiducia totale» (< 85): soglia diversa;
 *   F- «appannamento» / «non è il tuo livello» con forma >= 72 · F+ «forma straordinaria» con forma < 55;
 *   R  la risposta «mi dia una chance da titolare» quando la scheda dice titolare/leader;
 *   S  la barra (GRADINI235) e i testi usano la stessa sorgente di soglie.
 * Due misure: N = carriere simulate sugli handler veri (piu' semi, piu' stagioni, giudizi letti ogni settimana);
 *             G = griglia provocata (fiducia x forma x settimana x stagione, piu' l'esame del nuovo mister chiuso con
 *                 media 6,0 e 7,2), perche' l'esame nasce solo dopo un esonero e le carriere simulate lo producono di rado.
 * Copertura (non giudicato = rosso): ogni fonte deve aver prodotto testi, l'esame tutti e quattro i verdetti in G.
 * Rosso: window.__CPM_NO_G372 = testi di prima; la griglia deve trovare contraddizioni T-.
 * Uso: node giudizi-372.mjs  ·  CPM_PROVA_ROSSO=1 (gira anche il rosso)  ·  CPM_N372=<carriere> CPM_S372=<stagioni>. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const N_CAR = +(process.env.CPM_N372 || 3), N_STAG = +(process.env.CPM_S372 || 2);
const CLUBS = [
  { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
  { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 82, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
];
const NOMI = ['Sim Giudizi', 'Luca Ferraro', 'Marco Vitale', 'Dario Esposito'];
const save = (i) => ({ phase: 'career', player: { name: NOMI[i % NOMI.length], nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20 + i * 3, ovr: 66 + i * 5, tutorialDone: true,
  club: CLUBS[i % CLUBS.length], stats: { 'velocità': 66 + i * 5, tecnica: 66 + i * 5, fisico: 66 + i * 5, 'mentalità': 66 + i * 5, tiro: 66 + i * 5, passaggio: 66 + i * 5, dribbling: 66 + i * 5, posizionamento: 66 + i * 5 },
  form: 70, morale: 72, fatigue: 10, coachTrust: [60, 80, 45, 70][i % 4], contract: { duration: 3, wage: 6000, expiresAtSeason: 6 } } });

const REG = [
  { k: 'T-', re: /più panchina|retrovie|non sei ancora quello che cerco|ti ho tolto dai titolari|primavera mi darebbe|aspettarti in eterno|decisioni difficili|oggi non me ne dai|sbagliato valutazione|ti sto valutando|si scivola in panchina|non ha fiducia in te|qualcuno davanti a te|preferisce chi c'è davanti/i, bad: (s) => s.trust >= 70 },
  { k: 'T+', re: /il posto è tuo|nostro faro|così determinante|l'esempio che porto|uomo di fiducia|nome per primo|ripagare la fiducia/i, bad: (s) => s.trust < 50 },
  { k: 'T*', re: /uomo di fiducia|Titolare inamovibile|nome per primo/, bad: (s) => s.trust < 85 },
  { k: 'F-', re: /appannamento|non è il tuo livello|lontano da ciò che mi aspetto/i, bad: (s) => s.form >= 72 },
  { k: 'F+', re: /forma straordinaria/i, bad: (s) => s.form < 55 },
  { k: 'R', re: /chance da titolare/i, bad: (s) => s.role === 'titolare' || s.role === 'leader' },
];
const giudica = (righe) => {
  const viol = [], fonti = {}, esami = {};
  for (const s of righe) for (const t of s.testi) {
    fonti[t.f] = (fonti[t.f] || 0) + 1; if (t.f === 'esame') esami[t.k] = (esami[t.k] || 0) + 1;
    for (const g of REG) if (g.re.test(t.t) && g.bad(s)) viol.push({ k: g.k, f: t.f, trust: s.trust, form: s.form, role: s.role, t: t.t.slice(0, 150) });
  }
  return { viol, fonti, esami };
};
const conta = (v) => v.reduce((o, x) => { const c = x.k + ' ' + x.f; o[c] = (o[c] || 0) + 1; return o; }, {});

const GRIGLIA = () => {
  const C = window.__CPM_CAREER, out = [];
  for (const trust of [20, 35, 45, 55, 65, 72, 80, 84, 86, 93]) for (const form of [40, 50, 60, 75, 90]) for (const week of [8, 16, 24, 32]) for (const season of [2, 3, 4]) {
    const r = C.giudizi372({ coachTrust: trust, form, week, season, recentCoachLines: [], recentCoachChoices: [], squadRole: trust >= 80 ? 'titolare' : trust >= 55 ? 'rotazione' : 'riserva' });
    if (typeof r === 'string') return { err: r }; out.push(r);
  }
  for (const trust of [20, 35, 45, 55, 65, 72, 86, 93]) for (const rat of [6.0, 7.2]) {
    const mh = [2, 3, 4, 5].map(w => ({ season: 3, week: w, opponent: 'Squadra ' + w, rating: rat, goals: 0, won: rat > 6.5 }));
    const r = C.giudizi372({ coachTrust: trust, form: 65, season: 3, week: 6, newCoachExam: { season: 3, fromWeek: 1, games: 4 }, matchHistory: mh });
    if (typeof r === 'string') return { err: r }; out.push(r);
  }
  return { righe: out, stessa: (typeof GRADINI235 !== 'undefined' && typeof SOGLIE_FIDUCIA372 !== 'undefined') ? GRADINI235.fiducia.s === SOGLIE_FIDUCIA372 : null };
};

const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const apri = async (i, rosso) => {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(([sv, ro]) => { window.__CPM_GLB = false; if (ro) window.__CPM_NO_G372 = true; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, [save(i), rosso]);
  for (let t = 0; t < 3; t++) {
    try {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
      await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
      await page.waitForFunction(() => window.__CPM_CAREER && typeof window.__CPM_CAREER.giudizi372 === 'function', { timeout: 30000 });
      return { page, errs };
    } catch (e) { console.log('  · caricamento ' + (t + 1) + ' fallito: ' + String(e.message).slice(0, 80)); }
  }
  await page.close(); return null;
};
const carriera = async (i, rosso) => {
  const a = await apri(i, rosso); if (!a) return { cieco: 'carriera non montata' };
  const { page, errs } = a; const righe = []; let stag = 0, iter = 0;
  while (iter++ < 60 * N_STAG + 40 && stag < N_STAG) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); C.dismiss(); const g = C.giudizi372(); return { res, g }; });
    if (typeof r.g === 'string') return { cieco: r.g };
    if (r.g && r.g.testi) righe.push(r.g);
    if (r.res === 'seasonEnd') { await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); stag++; await sleep(600); await page.evaluate(() => window.__CPM_CAREER.dismiss()); continue; }
    if (r.res && r.res.startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
    if (r.res && r.res.startsWith('error:')) { await page.close(); return { cieco: r.res }; }
  }
  const G = i === 0 ? await page.evaluate(GRIGLIA) : null;
  await page.close(); return { righe, G, errs, stag };
};

const braccio = async (rosso) => {
  const N = [], G = []; let errs = [], cieco = null, stagTot = 0, stessa = null;
  for (let i = 0; i < N_CAR; i++) {
    const c = await carriera(i, rosso); if (c.cieco) { cieco = c.cieco; break; }
    N.push(...c.righe); errs.push(...c.errs); stagTot += c.stag;
    if (c.G) { if (c.G.err) { cieco = c.G.err; break; } G.push(...c.G.righe); stessa = c.G.stessa; }
  }
  return { N, G, errs, cieco, stagTot, stessa };
};

const ROSSO = process.env.CPM_PROVA_ROSSO === '1';
let esito = true; const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) esito = false; };
const stampa = (nome, B) => {
  const gN = giudica(B.N), gG = giudica(B.G);
  const tr = B.N.map(r => r.trust); const hi = B.N.filter(r => r.trust >= 85).length;
  console.log(`  ${nome}: carriere ${N_CAR} · stagioni chiuse ${B.stagTot} · settimane lette ${B.N.length} (fiducia ${Math.min(...tr)}–${Math.max(...tr)}, da «Fiducia totale» ${hi}) · fonti ${JSON.stringify(gN.fonti)}`);
  console.log(`    N contraddizioni ${gN.viol.length} ${JSON.stringify(conta(gN.viol))}`);
  console.log(`    G stati ${B.G.length} · fonti ${JSON.stringify(gG.fonti)} · esami ${JSON.stringify(gG.esami)} · contraddizioni ${gG.viol.length} ${JSON.stringify(conta(gG.viol))}`);
  for (const v of [...gN.viol, ...gG.viol].slice(0, 6)) console.log(`     · [${v.k} ${v.f}] fiducia ${v.trust} forma ${v.form} ruolo ${v.role}: ${v.t}`);
  return { gN, gG };
};
console.log('── giudizi-372 · braccio VERDE');
const V = await braccio(false);
if (V.cieco) ok(false, 'non giudicato: ' + V.cieco);
else {
  const { gN, gG } = stampa('verde', V);
  ok(V.errs.length === 0, `nessun errore di pagina (${V.errs.length}${V.errs.length ? ': ' + V.errs[0] : ''})`);
  ok(V.stessa === true, 'S la barra della fiducia (GRADINI235) usa le soglie dei testi (SOGLIE_FIDUCIA372)');
  ok(V.stagTot >= N_STAG && V.N.length >= 30 * N_CAR, `copertura N: almeno ${30 * N_CAR} settimane lette e ${N_STAG} stagioni chiuse per carriera`);
  ok(['convocazione', 'verifica', 'risposta', 'settimana'].every(f => (gN.fonti[f] || 0) > 0), 'copertura N: ogni fonte ha prodotto testi');
  ok(['pass', 'pass_dub', 'fail', 'fail_fid'].every(k => (gG.esami[k] || 0) > 0), 'copertura G: l\'esame del nuovo mister ha dato i quattro verdetti');
  ok(gN.viol.length === 0, `N nessuna contraddizione sulle carriere simulate (${gN.viol.length})`);
  ok(gG.viol.length === 0, `G nessuna contraddizione sulla griglia provocata (${gG.viol.length})`);
}
if (ROSSO) {
  console.log('── giudizi-372 · braccio ROSSO (__CPM_NO_G372 = testi di prima)');
  const R = await braccio(true);
  if (R.cieco) ok(false, 'rosso non giudicato: ' + R.cieco);
  else {
    const { gG } = stampa('rosso', R);
    ok(gG.viol.some(v => v.k === 'T-' && v.f === 'esame' && /più panchina/.test(v.t)), 'il rosso rimette «Ti aspetta più panchina» con la fiducia da Fiducioso in su (il caso del PO)');
    ok(gG.viol.some(v => v.k === 'T-' && v.f === 'verifica'), 'il rosso rimette la sfiducia nella verifica trimestrale con la fiducia alta');
  }
}
console.log(esito ? '\n✅ giudizi-372 VERDE' : '\n❌ giudizi-372 ROSSO');
await browser.close(); srv.close(); process.exit(esito ? 0 : 1);
