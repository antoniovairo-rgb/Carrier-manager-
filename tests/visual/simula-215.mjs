#!/usr/bin/env node
/* [giro 215 PO-478] GUARDIANO simula-215 — decisione del PO (15/11): se il 3D smette di caricare A PARTITA INIZIATA (avviso «Riprova /
   Simula» del giro 209 prima di una scena dell'eroe a meta' gara), «Simula» deve CONTINUARE la partita col motore dal minuto e dal
   punteggio raggiunti, tenendo gol, cartellini, cambi, statistiche e presenze gia' accaduti. Nessun doppio conteggio.
   Percorso vero: salvataggio da professionista con una gara di Coppa in settimana (lo stesso del giro 209) → __CPM_CAREER.playMatch →
   pilota seedato. I file CGTrader arrivano: la partita parte in 3D. A meta' gara (almeno un gol e una scena dell'eroe giocata, oppure
   un minuto tetto) la sonda PROVOCA la perdita del 3D come la vive un telefono: i file CGTrader smettono di arrivare (richiesta
   abortita) e lo stato del caricatore diventa quello di un caricamento fallito (`__CPM_HYPER_CASUAL_STATUS='fallback:…'`, src/12).
   La scena rimontata non trova i corpi → avviso del 209 («fallito»). Allora «Simula».
   Casi: TITOLARE (telefono 375x667) · PANCHINA (benchStart: fatica 79 → il mister lo lascia fuori; avviso PRIMA dell'ingresso).
   Verde: avviso a meta' gara (minuto > 0); dopo Simula la partita finisce (rassegna → carriera) e il risultato registrato e':
     - punteggio finale >= parziale per ciascuna squadra (dal parziale letto all'avviso);
     - gol dell'eroe >= gol dell'eroe gia' segnati, gialli >= gialli gia' presi, espulsione conservata;
     - una sola voce: matchHistory +1, voce di Coppa +1, gara giocata, totale gol carriera = prima + gol registrati (nessun doppio);
     - panchina: matchStatus «bench», minuti = 90 - minuto d'ingresso, presenze +1 come nel percorso normale;
     - dopo 8 s e dopo il ricaricamento: stesso salvataggio, nessuna ripresa, nessuna partita riaperta; 0 errori di pagina.
   ROSSO window.__CPM_NO_G215 (= giro 209: la partita si rigioca da capo col motore): DEVE essere bocciato. «Non giudicato» = rosso.
   Uso: node simula-215.mjs · CPM_PARTE=verde|rosso · CPM_MISURA=1 (stampa e basta, esce 0) · CPM_CASI=titolare,panchina */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { SCHERMI, mkSave, chiudiRassegna } from './misura-205.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const PARTE = process.env.CPM_PARTE || 'tutto', MISURA = !!process.env.CPM_MISURA;
const CASI = (process.env.CPM_CASI || 'titolare,panchina').split(',');
const FOTO = process.env.CPM_FOTO || '', TAG = process.env.CPM_TAG || 'dopo';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();

const leggi = (pg) => pg.evaluate(() => { const q = s => document.querySelector(s); const P = JSON.parse(localStorage.getItem('cpm-v3') || '{}').player || {};
  const md = (P.calendar || []).find(m => m.matchday === 992); let er = null; try { er = window.__CPM_ENDRESULT20 ? window.__CPM_ENDRESULT20() : null; } catch (e) {}
  const ev = (window.__CPM_EV || []); const sc = window.__CPM_SCORE ? window.__CPM_SCORE() : null;
  return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, clock: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null, sc,
    avv: !!q('[data-cpm="avviso3d209"]'), mot: (q('[data-cpm="avviso3d209"]') || { getAttribute: () => null }).getAttribute('data-motivo'), nSim: window.__CPM_SIM209 | 0,
    er: er ? { g: er.goals | 0, a: er.assists | 0, h: er.homeScore, aw: er.awayScore, min: er.minutesPlayed, st: er.matchStatus, yc: er.yellowCards | 0, rc: !!er.redCard, r: er.rating } : null,
    lm: window.__CPM_LM215 ? window.__CPM_LM215() : null, s215: window.__CPM_S215 || null,
    mh: (P.matchHistory || []).length, last: (P.matchHistory || []).slice(-1)[0] || null, cupN: ((P.cup || {}).results || []).length, cupLast: ((P.cup || {}).results || []).slice(-1)[0] || null,
    mdPlayed: md ? !!md.played : null, mdRes: md ? md.result : null, week: P.week, goals: P.goals | 0, tg: P.totalGoals | 0, matches: P.matches | 0, tm: P.totalMatches | 0, ycS: P.yellowCards | 0,
    resume: localStorage.getItem('cpm-match-resume') || '', rass: !!q('[data-cpm="rassegna200"]'),
    corpo: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 300), carriera: !!window.__CPM_CAREER && !q('[data-cpm="vista3d-box"]') && !q('[data-cpm="rassegna200"]') && !q('[data-cpm="avviso3d209"]') };/* come il 209: __CPM_PHASE resta all'ultimo valore dopo lo smontaggio */ }).catch(e => ({ err: String(e.message).slice(0, 100) }));

async function apri(caso, flags, seed) {
  const ctx = await browser.newContext({ viewport: SCHERMI.telefono, serviceWorkers: 'block', isMobile: true, hasTouch: true });
  const pg = await ctx.newPage(); await installCdnRoutes(pg);
  const rete = { rotta: false, richieste: 0 };
  await pg.route('**/assets/cgtrader-*.glb', async r => { rete.richieste++; if (rete.rotta) return r.abort().catch(() => {}); return r.fallback().catch(() => {}); });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  pg.on('console', m => { if (m.type() === 'error' && !/\[BABEL\] Note|Failed to load resource|ERR_FAILED|net::/.test(m.text())) errs.push('console: ' + m.text().slice(0, 160)); });
  const sv = mkSave(2, seed); if (caso === 'panchina') { sv.player.fatigue = 79; sv.player.coachTrust = 60; } else { sv.player.coachTrust = 75; }
  await pg.addInitScript(([sv, f]) => { window.__CPM_GLB = true; window.__CPM_T196ON = 1; for (const k of f) window[k] = 1;
    if (!sessionStorage.getItem('g215')) { sessionStorage.setItem('g215', '1'); localStorage.setItem('cpm-v3', JSON.stringify(sv)); } }, [sv, flags]);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await pg.waitForFunction(() => document.getElementById('root')?.children.length > 0, null, { timeout: 90000 }); await sleep(1500);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  const s0 = await leggi(pg);
  for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break;
    await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); }
  await pg.evaluate(s => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seed);
  return { pg, ctx, errs, rete, s0 };
}

async function percorso(caso, flags, seed) {
  const g = []; const info = { caso, seed };
  const { pg, ctx, errs, rete, s0 } = await apri(caso, flags, seed);
  /* 1) partita in 3D fino a meta' gara: gol + almeno una scena dell'eroe (titolare) · prima dell'ingresso (panchina) */
  const t0 = Date.now(); let s = null, scene = 0, ultPh = null, avvPre = false;
  const tettoMin = caso === 'panchina' ? 30 : 62;
  while (Date.now() - t0 < 300000) { s = await leggi(pg);
    if (s.ph !== ultPh) { if (ultPh && /^hl_/.test(ultPh) && s.ph === 'playing') scene++; ultPh = s.ph; }
    if (s.avv) { avvPre = true; break; }
    const gol = s.sc ? (s.sc.home + s.sc.away) : 0;
    if (s.ph === 'playing' && (s.clock | 0) > 3 && ((caso === 'titolare' && gol >= 1 && scene >= 1 && (s.clock | 0) >= 20) || (s.clock | 0) >= tettoMin)) break;
    if (s.ph === 'ended' || s.err) break; await sleep(400); }
  info.prima = { min: s && s.clock, sc: s && s.sc, scene, er: s && s.er, lm: s && s.lm, ph: s && s.ph };
  if (avvPre || !s || s.ph !== 'playing') { g.push([false, `${caso}: non giudicato — la partita non e' arrivata a meta' gara in 3D (fase ${s && s.ph}, avviso precoce ${avvPre})`]); await ctx.close(); return { g, info }; }
  /* 2) il 3D cade: file CGTrader abortiti e scena rimontata (come dopo la perdita del contesto grafico) */
  rete.rotta = true; const r0 = rete.richieste;
  /* lo stato che il caricatore CGTrader scrive quando il pacchetto non arriva (src/12, .catch del caricamento): il controllo di
     prontezza del 196 lo legge a ogni battito di 'playing'. Il rimontaggio ('cpm-gl-restored') da solo non basta: il pacchetto e'
     gia' in memoria e non si richiede (misurato: 0 richieste). */
  await pg.evaluate(() => { window.__CPM_HYPER_CASUAL_STATUS = 'fallback:sonda215 rete persa'; });
  let a = null; const t1 = Date.now(); while (Date.now() - t1 < 60000) { a = await leggi(pg); if (a.avv || a.ph === 'ended') break; await sleep(250); }
  await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false)).catch(() => {});
  /* sotto l'avviso decide il giocatore: il cronometro deve restare fermo. Si campiona per CPM_ATTESA ms (default 4 s) */
  const sotto = []; const t3 = Date.now(); while (Date.now() - t3 < (+process.env.CPM_ATTESA || 4000)) { const q = await leggi(pg); sotto.push(q.clock); await sleep(500); }
  a = await leggi(pg); info.sottoAvviso = sotto;
  info.avviso = { min: a.clock, sc: a.sc, er: a.er, lm: a.lm, mot: a.mot, rich: rete.richieste - r0, t: Date.now() - t1 };
  if (FOTO) await pg.screenshot({ path: `${FOTO}/${TAG}-${caso}-avviso.png` }).catch(() => {});
  g.push([sotto.length >= 4 && sotto.every(c => c === sotto[0]) && a.clock === sotto[0], `${caso}: sotto l'avviso il cronometro resta fermo (${sotto.join(',')} → ${a.clock})`]);
  g.push([a.avv && (a.clock | 0) > 0, `${caso}: avviso a meta' gara ${a.avv ? 'si' : 'no'} (motivo ${a.mot}) al ${a.clock}' sul ${a.sc ? a.sc.home + '-' + a.sc.away : '?'} · scene dell'eroe giocate ${scene} · richieste CGTrader dopo la caduta ${rete.richieste - r0}`]);
  if (!a.avv) { g.push([false, `${caso}: non giudicato (nessun avviso)`]); await ctx.close(); return { g, info }; }
  const P = { h: a.sc.home | 0, a: a.sc.away | 0, g: a.er ? a.er.g : 0, as: a.er ? a.er.a : 0, yc: a.er ? a.er.yc : 0, rc: a.er ? a.er.rc : false, onBench: a.lm ? a.lm.onBench : null, benchMin: a.lm ? a.lm.benchMinute : null, benchStart: a.lm ? a.lm.benchStart : null };
  info.parziale = P;
  /* 3) Simula */
  await pg.click('[data-cpm="avviso3d209-simula"]');
  let x = null, passi = null; const t2 = Date.now(); let toast = '';
  while (Date.now() - t2 < 60000) { x = await leggi(pg);
    if (x.rass) { passi = await chiudiRassegna(pg, FOTO, `${TAG}-${caso}`); }
    if (/\(sim\)|PASSA|ELIMINATO/.test(x.corpo)) toast = (x.corpo.match(/[^.·]{0,40}(\(sim\)|PASSA|ELIMINATO)[^·]{0,60}/) || [''])[0];
    if (x.mh > s0.mh && x.carriera) break; await sleep(400); }
  if (FOTO) await pg.screenshot({ path: `${FOTO}/${TAG}-${caso}-dopo.png` }).catch(() => {});
  await sleep(8000); const y = await leggi(pg);
  const L = y.last || {}; const cl = y.cupLast || {};
  info.dopo = { s215: x && x.s215, last: { goals: L.goals, assists: L.assists, rating: L.rating, minutesPlayed: L.minutesPlayed, matchStatus: L.matchStatus, score: L.homeScore + '-' + L.awayScore, simulated: L.simulated, yc: L.yellowCards }, cup: cl, md: y.mdRes, toast, passi, mh: s0.mh + '→' + y.mh, cupN: s0.cupN + '→' + y.cupN, goals: s0.goals + '→' + y.goals, tg: s0.tg + '→' + y.tg, matches: s0.matches + '→' + y.matches, tm: s0.tm + '→' + y.tm, week: s0.week + '→' + y.week };
  /* punteggio registrato nella voce (homeScore/awayScore = squadra dell'eroe / avversario nella voce di matchHistory? si legge anche la Coppa) */
  const fh = +L.homeScore, fa = +L.awayScore;
  g.push([x && x.nSim === 1 && y.carriera, `${caso}: Simula premuto una volta (${x && x.nSim}), partita chiusa, carriera a schermo (${y.carriera})`]);
  g.push([Number.isFinite(fh) && fh >= P.h && fa >= P.a, `${caso}: punteggio finale ${fh}-${fa} >= parziale ${P.h}-${P.a} per ciascuna squadra`]);
  /* il controllo che separa: con la partita rigiocata da capo il «finale >= parziale» puo' capitare per caso (misurato: 0-1 → 1-2 di una
     partita nuova). Il risultato registrato deve essere quello costruito DAL parziale: testimone del gioco con minuto e parziale
     dell'avviso, e la voce di carriera uguale al suo finale. */
  const W = x && x.s215;
  g.push([!!W && W.min0 === (a.clock | 0) && W.parziale.home === P.h && W.parziale.away === P.a && W.finale.home === fh && W.finale.away === fa && (L.goals | 0) === W.eroe.gol,
    `${caso}: la partita prosegue dal ${W ? W.min0 : '—'}' sul ${W ? W.parziale.home + '-' + W.parziale.away : '—'} (avviso al ${a.clock}' sul ${P.h}-${P.a}) e la voce registrata e' il suo finale ${W ? W.finale.home + '-' + W.finale.away : '—'} (voce ${fh}-${fa}, gol eroe ${W ? W.eroe.gol : '—'}/${L.goals})`]);
  g.push([(L.goals | 0) >= P.g && (L.assists | 0) >= P.as && (L.yellowCards == null ? P.yc === 0 : (L.yellowCards | 0) >= P.yc), `${caso}: eventi dell'eroe conservati (gol ${P.g}→${L.goals}, assist ${P.as}→${L.assists}, gialli ${P.yc}→${L.yellowCards})`]);
  g.push([y.mh === s0.mh + 1 && y.cupN === (s0.cupN | 0) + 1 && y.mdPlayed === true && y.tg === s0.tg + (L.goals | 0) && y.tm === s0.tm + 1, `${caso}: conta una volta (matchHistory ${s0.mh}→${y.mh}, Coppa ${s0.cupN}→${y.cupN}, gara giocata ${y.mdPlayed}, gol carriera ${s0.tg}→${y.tg} con ${L.goals} nella gara, presenze ${s0.tm}→${y.tm})`]);
  if (caso === 'panchina') {
    g.push([P.benchStart === true && L.matchStatus === 'bench' && L.minutesPlayed === Math.max(0, 90 - (P.benchMin || 60)), `panchina: partita dalla panchina (benchStart ${P.benchStart}, in panchina all'avviso ${P.onBench}), voce «${L.matchStatus}» con ${L.minutesPlayed}' (atteso 90-${P.benchMin} = ${90 - (P.benchMin || 60)})`]);
  }
  g.push([!y.resume, `${caso}: nessuna ripresa della partita lasciata a meta' («${(y.resume || '').slice(0, 30)}»)`]);
  await pg.reload({ waitUntil: 'load' }); await sleep(4000); try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {} await sleep(3000);
  const z = await leggi(pg);
  g.push([z.mh === y.mh && z.cupN === y.cupN && z.tg === y.tg && z.tm === y.tm && !z.avv && !(z.ph && /^(playing|walkout|hl_)/.test(z.ph)), `${caso}: dopo il ricaricamento stesso salvataggio (matchHistory ${z.mh}, Coppa ${z.cupN}, gol ${z.tg}, presenze ${z.tm}) e nessuna partita riaperta (fase ${z.ph})`]);
  g.push([errs.length === 0, `${caso}: errori ${errs.length} ${errs.length ? JSON.stringify(errs.slice(0, 2)) : ''}`]);
  await ctx.close(); return { g, info };
}
const SEED = { titolare: +(process.env.CPM_SEED_T || 2153), panchina: +(process.env.CPM_SEED_P || 2152) };
const verde = [], rosso = [], infos = [];
if (PARTE !== 'rosso') for (const c of CASI) { console.log(`… verde ${c}`); const R = await percorso(c, [], SEED[c]); infos.push(R.info); R.g.forEach(v => verde.push(v)); }
if (PARTE !== 'verde') { console.log('… rosso titolare (__CPM_NO_G215)'); const R = await percorso('titolare', ['__CPM_NO_G215'], SEED.titolare); infos.push({ rosso: true, ...R.info });
  const giud = R.g.filter(v => !/non giudicato/.test(v[1]));
  const boc = giud.length > 1 && giud.some(v => !v[0]); rosso.push([boc, `rosso: ${giud.filter(v => !v[0]).map(v => v[1]).join(' | ') || 'nessun controllo fallito'} → ${boc ? 'bocciato' : 'NON bocciato'}`]); }
await browser.close(); srv.close();
for (const i of infos) console.log('INFO ' + JSON.stringify(i));
for (const [ok, m] of verde) console.log((ok ? '  ✓ ' : '  ✗ ') + m);
for (const [ok, m] of rosso) console.log((ok ? '  ✓ ' : '  ✗ ') + m);
const vOk = PARTE === 'rosso' || (verde.length > 0 && verde.every(x => x[0])), rOk = PARTE === 'verde' || (rosso.length > 0 && rosso.every(x => x[0]));
if (PARTE !== 'rosso') console.log(`VERDE: ${verde.filter(x => x[0]).length}/${verde.length} ${vOk ? '✓' : '✗'}`);
if (PARTE !== 'verde') console.log(`ROSSO __CPM_NO_G215 bocciato: ${rOk ? '✓' : '✗'}`);
console.log(vOk && rOk ? `✅ simula-215 superato (${PARTE}: verde col verde, rosso col rosso)` : `❌ simula-215 rosso (${PARTE})`);
process.exit(MISURA ? 0 : (vOk && rOk ? 0 : 1));
