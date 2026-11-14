#!/usr/bin/env node
/* [giro 191 PO-403] LA LOTTERIA DEI RIGORI FRA UN RIGORE E L'ALTRO — sonda e guardiano.
   Parole del PO: «deve esserci un cambio scena tra un rigore ed un altro e chi calcia deve essere gia' rivolto verso la porta prima
   della rincorsa ed il portiere del rigore precedente non deve esserci nella scena!». Stacco deciso dal PO: «breve col tabellone».
   Serie vera di Coppa coi corpi 3D (CH38, direttiva PO 29/07), forzata dal varco __CPM_SO_FORCE come rigori-58. Dentro la pagina, ogni
   50 ms: l'ultimo fotogramma del testimone __CPM_SO191 (src/12: rigore, tempo dal suo avvio, angolo sguardo del rigorista -> centro
   porta, portieri NON di turno visibili nel quadro) e se il nero dello stacco e' in pagina (data-cpm="stacco191").
   Per ogni CAMBIO di rigore (dal secondo in poi) tre giudizi:
     B stacco   — almeno un campione col nero dello stacco prima della rincorsa del nuovo rigorista;
     C sguardo  — fuori dal nero e prima della rincorsa (tempo del rigore < 0,55 s dopo lo stacco) l'angolo massimo <= 15 gradi;
     D portiere — fuori dal nero, fino alla fine del tiro, nessun campione con un portiere non di turno dentro il quadro.
   Un cambio senza campioni utili per un giudizio = NON GIUDICATO = rosso.
   Uso: node lotteria-191.mjs                    guardiano: verde telefono 375x812 + verde PC 1280x800 + i tre rossi (telefono)
        CPM_FOTO=<cartella> CPM_ROSSI=BCD|''     sonda con foto (telefono e PC) del braccio indicato (default: verde)
        CPM_SOLO=telefono|pc                       un solo schermo */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const SCHERMI = { telefono: { width: 375, height: 812 }, pc: { width: 1280, height: 800 } };
const SOGLIA_ANG = 15, RINCORSA = 0.55, FINE_TIRO = 1.4;
const mkSave = () => ({ phase: 'career', player: { name: 'Lotteria Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: true, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, coachPactSeason: 4, bondEv: { s: 4, w: 11 }, sponsorDecl: { tier: 'tecnico', season: 4 }, matches: 8, goals: 5,
  cup: { active: true, round: 2, eliminated: false, champion: false, results: [{ round: 1, name: 'Sedicesimi', opponent: 'FC Rovigo', homeScore: 2, awayScore: 0, won: true }] },
  calendar: [{ matchday: 992, week: 12, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 2, cupRoundName: 'Ottavi' }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 70, fatigue: 10, morale: 68, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 } } });

async function braccio(schermo, rossi, foto) {
  const pg = await browser.newPage({ viewport: SCHERMI[schermo] }); await installCdnRoutes(pg);
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await pg.addInitScript(([sv, r]) => { window.__CPM_GLB = true; window.__CPM_SO191 = [];
    for (const c of r) window['__CPM_NO_G191' + c] = 1; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, [mkSave(), rossi]);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1500);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break;
    await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); }
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 8080, policy: 'seeded', tickMs: 300 }));
  await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false));
  await pg.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await pg.evaluate(() => { window.__CPM_SO_FORCE && window.__CPM_SO_FORCE(); const C = (window.__CPM_C191 = []); const t0 = performance.now();
    window.__CPM_C191T = setInterval(() => { const W = window.__CPM_SO191 || []; const w = W[W.length - 1]; if (!w || C.length > 4000) return;
      C.push({ t: +(performance.now() - t0).toFixed(0), key: w.key, u: w.u, sh: w.sh, ang: w.ang, altri: w.altri.length, gkT: w.gkT, st: !!document.querySelector('[data-cpm="stacco191"]') }); }, 50); });
  const scatti = []; let ultimaK = null; const fatti = new Set(); const t0 = Date.now();
  while (Date.now() - t0 < 60000) {
    const s = await pg.evaluate(() => { const C = window.__CPM_C191 || []; return { c: C[C.length - 1] || null, ph: window.__CPM_PHASE && window.__CPM_PHASE() }; });
    if (s.ph && s.ph !== 'shootout' && Date.now() - t0 > 5000) break;
    const c = s.c;
    if (foto && c && c.key != null && c.key >= 1 && c.key <= 2) {
      const ur = c.u - c.sh; const tag = (nome) => `${foto}/${schermo}-${rossi.length ? 'rosso' + rossi.join('') : 'verde'}-r${c.key}-${nome}.png`;
      const prova = async (nome, ok) => { if (!ok || fatti.has(c.key + nome)) return; fatti.add(c.key + nome); const f = tag(nome); await pg.screenshot({ path: f }); scatti.push(f); };
      if (c.key !== ultimaK) await prova('a-cambio', true);
      await prova('b-pronto', !c.st && ur >= 0.15 && ur < RINCORSA);
      await prova('c-tiro', !c.st && ur >= 0.95 && ur < FINE_TIRO);
    }
    if (c && c.key != null) ultimaK = c.key;
    await sleep(foto ? 30 : 250);
  }
  const C = await pg.evaluate(() => { clearInterval(window.__CPM_C191T); return window.__CPM_C191 || []; });
  await pg.close();
  const chiavi = [...new Set(C.map(c => c.key).filter(k => k != null && k >= 1))];
  const cambi = chiavi.map(k => { const S = C.filter(c => c.key === k && c.u != null);
    const stacco = S.some(c => c.st);
    const fermo = S.filter(c => !c.st && c.u - c.sh >= 0 && c.u - c.sh < RINCORSA && c.ang != null);
    const tiro = S.filter(c => !c.st && c.u - c.sh < FINE_TIRO);
    const finito = S.some(c => c.u - c.sh >= FINE_TIRO);
    return { k, campioni: S.length, stacco, angMax: fermo.length ? Math.max(...fermo.map(c => c.ang)) : null, nFermo: fermo.length,
      portiereAltro: tiro.filter(c => c.altri > 0).length, nTiro: tiro.length, finito }; }).filter(x => x.finito);
  return { schermo, rossi: rossi.join(''), errs: errs.length, cambi, scatti };
}

const giudica = (r) => { const g = r.cambi; const n = g.length;
  return { n, stacco: g.filter(x => x.stacco).length, sguardoOk: g.filter(x => x.angMax != null && x.angMax <= SOGLIA_ANG).length, sguardoNG: g.filter(x => x.angMax == null).length,
    angMax: g.length ? Math.max(...g.map(x => x.angMax == null ? -1 : x.angMax)) : null, portiereOk: g.filter(x => x.nTiro > 0 && x.portiereAltro === 0).length, portiereNG: g.filter(x => !x.nTiro).length,
    portiereFot: g.reduce((a, x) => a + x.portiereAltro, 0) }; };
const stampa = (r) => { console.log(`${r.schermo} ${r.rossi ? 'ROSSO ' + r.rossi : 'VERDE'} errs=${r.errs} ` + JSON.stringify(giudica(r)));
  for (const x of r.cambi) console.log(`   r${x.k}: campioni ${x.campioni} · stacco ${x.stacco ? 'si' : 'no'} · sguardo max ${x.angMax}° su ${x.nFermo} · portiere altrui ${x.portiereAltro}/${x.nTiro}`); };

if (process.env.CPM_FOTO) {
  const dir = process.env.CPM_FOTO; fs.mkdirSync(dir, { recursive: true }); const rossi = (process.env.CPM_ROSSI || '').split('').filter(Boolean);
  for (const sc of (process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['telefono', 'pc'])) { const r = await braccio(sc, rossi, dir); stampa(r); console.log('   foto: ' + r.scatti.length); }
  await browser.close(); srv.close(); process.exit(0);
}

const esiti = []; let ok = true;
const vT = await braccio('telefono', []); stampa(vT); const vP = await braccio('pc', []); stampa(vP);
for (const v of [vT, vP]) { const g = giudica(v);
  const pass = v.errs === 0 && g.n >= 3 && g.stacco === g.n && g.sguardoOk === g.n && g.portiereOk === g.n;
  esiti.push(`${pass ? '✅' : '❌'} verde ${v.schermo}: ${g.n} cambi · stacco ${g.stacco}/${g.n} · sguardo <=${SOGLIA_ANG}° ${g.sguardoOk}/${g.n} (max ${g.angMax}°, non giudicati ${g.sguardoNG}) · senza portiere altrui ${g.portiereOk}/${g.n} (non giudicati ${g.portiereNG})`); ok = ok && pass; }
for (const c of ['B', 'C', 'D']) { const r = await braccio('telefono', [c]); stampa(r); const g = giudica(r);
  const visto = g.n >= 3 && (c === 'B' ? g.stacco === 0 : c === 'C' ? g.sguardoOk < g.n && g.sguardoNG === 0 : g.portiereOk < g.n && g.portiereNG === 0);
  esiti.push(`${visto ? '✅' : '❌'} rosso __CPM_NO_G191${c}: ${visto ? 'il difetto si vede' : 'rosso NON visto'} (${JSON.stringify(g)})`); ok = ok && visto; }
await browser.close(); srv.close();
for (const e of esiti) console.log(e);
console.log(ok ? '✅ lotteria-191 verde (e i tre rossi si vedono)' : '❌ lotteria-191 rosso');
process.exit(ok ? 0 : 1);
