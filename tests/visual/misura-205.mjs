#!/usr/bin/env node
/* [giro 205 PO-465] SONDA DI MISURA — momenti mai provati in 2D forzata (__CPM_CAP196=1 + __CPM_T196ON: la scena 3D «non e' pronta»
   e la partita passa al campo dall'alto). Coppa (finale o ottavi) → lotteria forzata (__CPM_SO_FORCE) → cerimonia se vinta → rassegna →
   ritorno alla carriera. In piu' le cerimonie forzate (coppa · campionato · festa leggera). Stampa cosa si vede/blocca, foto.
   Uso: CPM_FOTO=<cartella> CPM_TAG=prima node misura-205.mjs   (CPM_SOLO=telefono|pc, CPM_ROUND=4|2, CPM_FLAGS=__CPM_NO_G205) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
export const SCHERMI = { telefono: { width: 375, height: 667 }, pc: { width: 1366, height: 768 } };
export const mkSave = (round, seed) => ({ phase: 'career', player: { name: 'Riserva Probe' + (seed || ''), nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: true, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, coachPactSeason: 4, bondEv: { s: 4, w: 11 }, sponsorDecl: { tier: 'tecnico', season: 4 }, matches: 8, goals: 5,
  cup: { active: true, round, eliminated: false, champion: false, results: [{ round: 1, name: 'Sedicesimi', opponent: 'FC Rovigo', homeScore: 2, awayScore: 0, won: true }] },
  calendar: [{ matchday: 992, week: 12, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: round, cupRoundName: round >= 4 ? 'Finale' : 'Ottavi' }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 70, fatigue: 10, morale: 68, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 } } });
export const leggiStato = (pg) => pg.evaluate(() => { const q = s => document.querySelector(s); const P = JSON.parse(localStorage.getItem('cpm-v3') || '{}').player || {};
  const v2 = q('[data-cpm="vista2d"]'); const c = q('canvas');
  return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, d2: !!window.__CPM_2D196, vista2d: !!v2, so: window.__CPM_SO_STATE ? window.__CPM_SO_STATE() : null,
    rass: !!q('[data-cpm="rassegna200"]'), cer2d: !!q('[data-cpm="cerimonia2d205"]'), so2d: !!q('[data-cpm="rigori2d205"]'), salta: !!q('[data-cpm="salta"]'), att: !!q('[data-cpm="attesa196"]'),
    testo: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 260), mh: (P.matchHistory || []).length, cup: P.cup ? { round: P.cup.round, elim: P.cup.eliminated, champ: P.cup.champion, last: (P.cup.results || []).slice(-1)[0] || null } : null,
    carriera: !!window.__CPM_CAREER && !q('[data-cpm="rassegna200"]') && !(window.__CPM_PHASE && ['playing', 'shootout', 'ceremony', 'ended', 'walkout'].includes(window.__CPM_PHASE()) && q('[data-cpm="vista3d-box"]')) }; }).catch(e => ({ err: String(e.message).slice(0, 100) }));
export async function apri(browser, port, schermo, { round = 4, seed = 8080, flags = [] } = {}) {
  const ctx = await browser.newContext({ viewport: SCHERMI[schermo], serviceWorkers: 'block' }); const pg = await ctx.newPage(); await installCdnRoutes(pg);/* service worker bloccato: le sue richieste sfuggirebbero al blocco qui sotto */
  /* 2D forzata in modo deterministico: i corpi CGTrader non arrivano (caricamento fallito simulato) e il tetto d'attesa e' 1 ms.
     Col solo tetto, sul server locale il pacchetto puo' arrivare prima del primo controllo (misurato: PC 1366 restava in 3D). */
  if (!process.env.CPM_NOABORT) await pg.route('**/assets/cgtrader-*.glb', r => r.abort());
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160))); pg.on('console', m => { if (m.type() === 'error' && !/\[BABEL\] Note|Failed to load resource|ERR_FAILED/.test(m.text())) errs.push('console: ' + m.text().slice(0, 160)); });
  await pg.addInitScript(([sv, f]) => { window.__CPM_GLB = true; window.__CPM_T196ON = 1; window.__CPM_CAP196 = 1; for (const k of f) window[k] = 1;
    if (!sessionStorage.getItem('g205')) { sessionStorage.setItem('g205', '1'); localStorage.setItem('cpm-v3', JSON.stringify(sv)); } }, [mkSave(round, seed), flags]);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1500);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break;
    await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); }
  await pg.evaluate(s => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
  await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing' && window.__CPM_2D196, null, { timeout: 60000 }).catch(() => {});
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false)); await sleep(800);
  return { pg, errs };
}
/* dalla rassegna alla carriera: Avanti fino all'ultima scheda, poi il tasto di sempre */
export async function chiudiRassegna(pg, foto, tag) {
  const passi = [];
  for (let k = 1; k <= 4; k++) { if (foto) await pg.screenshot({ path: `${foto}/${tag}-rassegna${k}.png` }).catch(() => {});
    const a = await pg.evaluate(() => { const e = document.querySelector('[data-cpm="avanti200"]'); if (e) { e.click(); return 'avanti'; } const t = document.querySelector('[data-cpm="post-continua-v2"]'); if (t) { t.click(); return 'torna'; } return null; });
    passi.push(a); await sleep(700); if (a !== 'avanti') break; }
  return passi;
}
async function percorso(browser, port, schermo, foto, tag, opz) {
  const { pg, errs } = await apri(browser, port, schermo, opz); const L = []; const fasi = []; const so = []; let fotoN = 0;
  const shot = async (n) => { if (foto) { await pg.screenshot({ path: `${foto}/${tag}-${schermo}-${n}.png` }).catch(() => {}); fotoN++; } };
  let s = await leggiStato(pg); L.push('dopo il fischio d\'inizio: ' + JSON.stringify({ ph: s.ph, d2: s.d2, vista2d: s.vista2d, att: s.att })); await shot('a-playing2d');
  await pg.evaluate(() => window.__CPM_SO_FORCE && window.__CPM_SO_FORCE());
  const t0 = Date.now(); let ult = null, fShoot = 0, fCer = 0, fEnd = false;
  while (Date.now() - t0 < 120000) { s = await leggiStato(pg);
    if (s.ph !== ult) { fasi.push(`${s.ph}@${((Date.now() - t0) / 1000).toFixed(1)}s v2d=${s.vista2d} so2d=${s.so2d} cer2d=${s.cer2d}`); ult = s.ph; }
    if (s.so) so.push(s.so);
    if (s.ph === 'shootout') { if (fShoot === 0 || (fShoot < 3 && Date.now() - t0 > fShoot * 6000)) { await shot('b-rigori' + fShoot); fShoot++; } }
    if (s.ph === 'ceremony' && fCer < 2) { await sleep(fCer ? 4000 : 1500); await shot('c-cerimonia' + fCer); fCer++; }
    if (s.ph === 'ended' && s.rass) { fEnd = true; break; }
    await sleep(300); }
  const fin = so.length ? so[so.length - 1] : null;
  L.push('fasi: ' + fasi.join(' → '));
  L.push('lotteria finale: ' + JSON.stringify(fin));
  const mh0 = (await leggiStato(pg)).mh; let passi = [];
  if (fEnd) passi = await chiudiRassegna(pg, foto, `${tag}-${schermo}`);
  await sleep(2500); const sF = await leggiStato(pg); await shot('e-carriera');
  L.push(`rassegna ${fEnd ? 'si' : 'NO (bloccato?)'} · passi ${passi.join(',')} · matchHistory ${mh0}→${sF.mh} · carriera ${sF.carriera} · cup ${JSON.stringify(sF.cup)} · testo «${sF.testo.slice(0, 140)}»`);
  L.push('errori: ' + errs.length + (errs.length ? ' ' + JSON.stringify(errs.slice(0, 3)) : ''));
  await pg.context().close(); return { L, fin, sF, errs, fEnd, fasi };
}
async function cerimonie(browser, port, schermo, foto, tag, opz) {
  const out = [];
  for (const k of [{ kind: 'cup', name: 'COPPA NAZIONALE' }, { kind: 'league', name: 'CAMPIONI DI LEGA B' }, { kind: 'cup', name: 'COPPA', light: true, festa: { titolo: 'Vittoria', punteggio: '2-1', avversario: 'FC Internazionale', casa: true, voci: [{ n: '7.5', et: 'voto', oro: true }] } }]) {
    const { pg, errs } = await apri(browser, port, schermo, opz); const nm = k.light ? 'festa' : k.kind;
    await pg.evaluate(o => window.__CPM_FORCE_CEREMONY(o), k); await sleep(2500);
    const s0 = await leggiStato(pg); if (foto) await pg.screenshot({ path: `${foto}/${tag}-${schermo}-cer-${nm}.png` });
    let s = s0; const t0 = Date.now(); while (Date.now() - t0 < 40000) { s = await leggiStato(pg); if (s.ph === 'ended') break; await sleep(400); }
    const durata = ((Date.now() - t0) / 1000 + 2.5).toFixed(1);
    const passi = s.ph === 'ended' ? await chiudiRassegna(pg, null, '') : []; await sleep(2000); const sF = await leggiStato(pg);
    out.push(`${nm}: in cerimonia d2=${s0.d2} ph=${s0.ph} vista2d=${s0.vista2d} cer2d=${s0.cer2d} · fine dopo ${durata}s fase ${s.ph} · rassegna ${s.rass} · passi ${passi.join(',')} · carriera ${sF.carriera} · errori ${errs.length}${errs.length ? ' ' + JSON.stringify(errs.slice(0, 2)) : ''}`);
    await pg.context().close(); }
  return out;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const foto = process.env.CPM_FOTO || null; if (foto) fs.mkdirSync(foto, { recursive: true }); const tag = process.env.CPM_TAG || 'prima';
  const flags = (process.env.CPM_FLAGS || '').split(',').filter(Boolean);
  const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
  for (const sc of (process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['telefono', 'pc'])) {
    console.log(`== ${sc} (${tag}) — coppa round ${process.env.CPM_ROUND || 4}`);
    const r = await percorso(browser, port, sc, foto, tag, { round: +(process.env.CPM_ROUND || 4), seed: +(process.env.CPM_SEED || 8080), flags }); r.L.forEach(x => console.log('  ' + x));
    if (!process.env.CPM_NOCER) { console.log(`== ${sc} — cerimonie forzate`); (await cerimonie(browser, port, sc, foto, tag, { round: 2, flags })).forEach(x => console.log('  ' + x)); }
  }
  await browser.close(); srv.close();
}
