#!/usr/bin/env node
/* [giro 206 PO-412 «ingresso in campo piu' scenico nelle partite importanti» — questionario PO: coreografia, fumogeni e coriandoli,
   inno coi bambini per mano, regia per tipo; nelle partite normali ingresso BREVE] GUARDIANO sul percorso vero
   (salvataggio → partita → ingresso), corpi 3D accesi. Il tipo di partita si provoca dalla sonda (__CPM_TIPO206, solo banco di prova)
   tranne la FINALE, che e' una finale di coppa vera nel salvataggio (campo neutro, tifo sui due lati).
   Parte 1 (tabella): tipoIngresso206 su contesti enumerati.
   Parte 2 (scena): per ogni tipo un registratore per fotogramma legge il testimone __CPM_ING206 (inquadrature attraversate e loro
   durata in TEMPO DI SCENA, coreografia/fumogeni/coriandoli visibili, secondi di inno), la scritta dell'inno nel DOM, la distanza
   dei corpi dal posto a fine ingresso e i fotogrammi al secondo reali.
   VERDE: regia giusta per tipo · normale: scena <= 10,5 s, niente coreografia/fumogeni/coriandoli/inno · importanti: coreografia sulla
   curva di casa (finale: due lati), fumogeni e coriandoli entro la dose del dispositivo · inno >= 6 s solo in finale/europea/Nazionale ·
   squadra schierata · nessun corpo fuori scala (scheletro piu' alto di 2,4 u: i guardalinee erano 27 u) · fps del verde >= 85% del rosso sullo stesso ingresso (telefono 375x667 con CPU x2, PC 1280x720).
   ROSSO (__CPM_NO_G206): l'ingresso torna uguale per tutti (finale: nessuna panoramica lunga, niente inno, niente coreografia).
   CPM_FORZA_ROSSO=1 applica il rosso ai bracci verdi (prova del guardiano). CPM_SOLO=tipo1,tipo2 · CPM_FOTO=0 senza foto.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node ingresso-206.mjs */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const FORZA = !!process.env.CPM_FORZA_ROSSO, FOTO = process.env.CPM_FOTO !== '0', TAG = process.env.CPM_TAG || (FORZA ? 'rosso' : 'dopo');
/* foto e misure: fuori dal repo (tests/visual/out e' ignorato da git) salvo CPM_FOTO_DIR, cosi' un giro del guardiano non sporca docs/ */
const DIR = process.env.CPM_FOTO_DIR || path.join(ROOT, 'tests', 'visual', 'out', 'giro206'); fs.mkdirSync(DIR, { recursive: true });
const ALTO = +(process.env.CPM_ALTO || 2.4), BREVE = +(process.env.CPM_BREVE || 10.5), INNO = +(process.env.CPM_INNO || 6), FPSK = +(process.env.CPM_FPSK || 0.85), SCH = 0.6;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
function finaleDiCoppa() { const sv = JSON.parse(JSON.stringify(SAVE)); const pl = sv.player || sv; const w = pl.week | 0;
  pl.cup = Object.assign({}, pl.cup || {}, { active: true, eliminated: false, champion: false, results: [], round: 4 });
  const opp = (pl.calendar || []).find(m => m.opponentId);
  pl.calendar = [{ matchday: 1300 + w, week: w, opponentName: opp.opponentName, opponentId: opp.opponentId, isHome: true, played: false, type: 'cup', cupRound: 4, cupRoundName: 'Finale' }].concat(pl.calendar || []); return sv; }
async function ingresso({ nome, tipo, save, rosso, vw = 375, vh = 667, cpu = 2, tod = 'night', foto = false }) {
  rosso = rosso || FORZA;
  const ctx = await b.newContext({ viewport: { width: vw, height: vh }, serviceWorkers: 'block', ...(vw < 600 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 1 } : {}) }); await installCdnRoutes(ctx);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_GLB = true; window.__CPM_TOD = o.tod; if (o.tipo) window.__CPM_TIPO206 = o.tipo; if (o.r) { window.__CPM_NO_G206 = true; window.__CPM_NO_G212 = true; }/* [7.999.195 madre] il gigante dei guardalinee ha due correzioni (206 rete di sicurezza, 212 causa): il braccio rosso le spegne entrambe, altrimenti non puo' piu' vederlo */ localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: save || SAVE, r: rosso, tipo, tod });
  const out = { nome, rosso: !!rosso, vista: vw + 'x' + vh };
  try {
    if (cpu > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu }); }
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 120000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 }); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => {
      const R = window.__REC206 = { n: 0, t0: 0, t1: 0, s0: null, s1: null, innoDom: 0, resid: null, wFrames: 0, altoMax: 0, corpi: 0 }; let lastT = -1;
      const f = () => { try {
        if (window.__CPM_PHASE && window.__CPM_PHASE() === 'walkout' && !window.__CPM_WALKHOLD74) {
          const now = performance.now(); if (!R.t0) R.t0 = now; R.t1 = now; R.n++;
          const W = window.__CPM_WALK245 || []; if (W.length) { const e = W[W.length - 1]; if (e.t !== lastT) { lastT = e.t; R.wFrames++; if (R.s0 == null) R.s0 = e.s; R.s1 = e.s; } }
          if (R.n % 6 === 0 && document.querySelector('[data-cpm="inno206"]')) R.innoDom++;
          const T = window.__CPM3D;
          if (T && R.n % 40 === 5) { /* corpi fuori scala: altezza dello scheletro (ossa) di ogni corpo visibile */ const V = new T.camera.position.constructor(); let nb = 0; T.scene.traverse(o => { if (!o.isSkinnedMesh || !o.skeleton) return; let a = o, vis = true; while (a) { if (a.visible === false) { vis = false; break; } a = a.parent; } if (!vis) return; let lo = 1e9, hi = -1e9; for (const bo of o.skeleton.bones) { bo.getWorldPosition(V); if (V.y < lo) lo = V.y; if (V.y > hi) hi = V.y; } if (hi > lo) { nb++; if (hi - lo > R.altoMax) R.altoMax = +(hi - lo).toFixed(2); } }); R.corpi = Math.max(R.corpi, nb); }
          if (T) { let r = 0; for (const m of [...(T.players || []).map(q => q && (q.mesh || q)), T.hero]) if (m && m._wx != null) r = Math.max(r, Math.hypot(m.position.x - m._wx, m.position.z - m._wz)); R.resid = r; }
        } } catch (_) {} requestAnimationFrame(f); }; requestAnimationFrame(f); window.__CPM_WALK245 = [];
    });
    const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 70; k++) { const p = await ph(); if (p === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
      await sleep(700); }
    out.walk = (await ph()) === 'walkout'; out.playMatch = pm;
    const t0 = Date.now(); let visto = false; const fatte = new Set();
    while (Date.now() - t0 < +(process.env.CPM_TMAX || 1200000)) {
      const p = await ph(); if (p === 'walkout') visto = true; else if (visto) break;
      if (foto && FOTO) { /* una foto per inquadratura, a meta' della sua durata in TEMPO DI SCENA (in headless il tempo reale e' ~8 volte piu' lento) */
        const q = await page.evaluate(() => { const W = window.__CPM_ING206; if (W && W.regie.length) { const r = W.regie[W.regie.length - 1]; return [r, W.durate[r] || 0]; } const K = window.__CPM_WALK245 || []; return (!window.__CPM_WALKHOLD74 && K.length) ? ['ingresso', K[K.length - 1].s] : null; }).catch(() => null);
        const SOGLIA = { tunnel: 2.3, panoramica: 3.5, bandiere: 2.8, fila: 1.4, schierati: 3, inno: 3.5, ingresso: 9 };
        if (q && !fatte.has(q[0]) && q[1] >= (SOGLIA[q[0]] || 2)) { fatte.add(q[0]); await page.screenshot({ path: path.join(DIR, `${TAG}-ingresso-${nome}-${q[0]}-${vw}x${vh}.png`) }).catch(() => {}); } }
      await sleep(300); }
    const D = await page.evaluate(() => ({ R: window.__REC206, W: window.__CPM_ING206 || null, vero: window.__CPM_TIPOVERO206 || null, err: window.__CPM_ING206ERR || null, scena: window.__CPM_WALKSCENE285 || null, dur: window.__CPM_WALKDUR245 || null, cut: window.__CPM_CUT285 || 0, tifo: (window.__CPM_TIFO ? window.__CPM_TIFO().cancelli : null) }));
    const R = D.R || {}; out.tipoVero = D.vero; out.W = D.W; out.err = D.err; out.scenaDich = D.scena; out.coreografia = D.dur; out.stacchi = D.cut; out.tifo = D.tifo;
    out.durataScena = (R.s0 != null && R.s1 != null) ? +(R.s1 - R.s0).toFixed(2) : null; out.realeS = R.t0 ? +((R.t1 - R.t0) / 1000).toFixed(1) : null;
    out.fps = (R.t1 > R.t0) ? +(R.n / ((R.t1 - R.t0) / 1000)).toFixed(2) : null; out.innoDom = R.innoDom || 0; out.resid = R.resid != null ? +R.resid.toFixed(2) : null; out.frames = R.wFrames || 0; out.altoMax = R.altoMax; out.corpi = R.corpi; out.guarda = await page.evaluate(() => window.__CPM_GUARDA206 || null);
  } catch (e) { out.errore = String(e.message).slice(0, 200); }
  out.errori = errs.slice(0, 3); await ctx.close(); console.log(JSON.stringify(out)); return out;
}
/* ---- parte 1: la tabella ---- */
const g = [];
{ const ctx = await b.newContext(); await installCdnRoutes(ctx); const page = await ctx.newPage();
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => typeof window.__CPM_TIPOING206 === 'function', null, { timeout: 120000 });
  const casi = [[{ context: 'career', mw: 3 }, 'normale'], [{ context: 'trial', mw: 1 }, 'normale'], [{ context: 'cup', mw: 4 }, 'normale'], [{ context: 'career', mw: 7 }, 'big'], [{ context: 'career', mw: 9, isDerby: true }, 'derby'],
    [{ context: 'euro_group', mw: 3 }, 'europea'], [{ context: 'euro_ko', mw: 3 }, 'europea'], [{ context: 'euro_ko', isFinal: true }, 'finale'], [{ context: 'cup', isFinal: true, isDerby: true }, 'finale'],
    [{ context: 'national', isNat: true, mw: 2 }, 'nazionale'], [{ context: 'euroMondiale_group', isNat: true }, 'nazionale'], [{ context: 'euroMondiale_ko', isNat: true, isFinal: true }, 'finale'], [{ context: 'nationsCup', isNat: true }, 'nazionale']];
  const T = await page.evaluate(c => ({ r: c.map(x => window.__CPM_TIPOING206(x[0])), tab: window.__CPM_INGRESSO206 }), casi);
  casi.forEach((c, i) => { if (T.r[i] !== c[1]) g.push(`tabella: ${JSON.stringify(c[0])} da' «${T.r[i]}», atteso «${c[1]}»`); });
  const tb = T.tab || {}; for (const k of ['finale', 'nazionale', 'derby', 'europea', 'big', 'normale']) if (!tb[k]) g.push('tabella: manca il tipo ' + k);
  if (tb.normale && (tb.normale.coreo || tb.normale.fumo || tb.normale.coriandoli || tb.normale.inno)) g.push('tabella: la partita normale ha coreografia/fumogeni/coriandoli/inno');
  for (const k of ['finale', 'nazionale', 'europea']) if (tb[k] && !(tb[k].inno > 0)) g.push('tabella: ' + k + ' senza inno');
  for (const k of ['derby', 'big']) if (tb[k] && tb[k].inno) g.push('tabella: ' + k + ' con inno');
  console.log('TABELLA ' + JSON.stringify(T.r)); await ctx.close(); }
/* ---- parte 2: le scene ---- */
const SOLO = process.env.CPM_SOLO ? process.env.CPM_SOLO.split(',') : null; const vuole = n => !SOLO || SOLO.includes(n);
const S = {};
const PIANO = [
  { nome: 'normale', tipo: 'normale', tod: 'day', foto: true },
  { nome: 'big', tipo: 'big', foto: true },
  { nome: 'derby', tipo: 'derby', foto: true },
  { nome: 'europea', tipo: 'europea', foto: true },
  { nome: 'nazionale', tipo: 'nazionale', tod: 'day', foto: true },
  { nome: 'finale', save: finaleDiCoppa(), foto: true },
  { nome: 'finale-rosso', save: finaleDiCoppa(), rosso: true, foto: true },
  { nome: 'big-rosso', tipo: 'big', rosso: true },
  { nome: 'big-pc', tipo: 'big', vw: 1280, vh: 720, cpu: 1 },
  { nome: 'big-pc-rosso', tipo: 'big', vw: 1280, vh: 720, cpu: 1, rosso: true },
  { nome: 'finale-pc', save: finaleDiCoppa(), vw: 1280, vh: 720, cpu: 1, foto: true },
];
for (const p of PIANO) if (vuole(p.nome)) S[p.nome] = await ingresso(p);
await b.close(); srv.close();
fs.writeFileSync(path.join(DIR, `misura-ingresso-${TAG}.json`), JSON.stringify(S, null, 1));
if (process.env.CPM_SOLO_MISURA) process.exit(0);
const ok = X => X && X.walk && X.frames > 30 && X.durataScena != null && X.W;
const ATT = { normale: { regia: 'breve', scena: 9, inno: 0, coreo: 0 }, big: { regia: 'standard', scena: 16, inno: 0, coreo: 1 }, derby: { regia: 'tunnel', scena: 19, inno: 0, coreo: 1 }, europea: { regia: 'standard', scena: 16, inno: 7, coreo: 1 }, nazionale: { regia: 'bandiere', scena: 19, inno: 7, coreo: 1 }, finale: { regia: 'panoramica', scena: 23, inno: 7, coreo: 2 } };
function verde(nome, tipo) { const X = S[nome]; if (!X) return; const A = ATT[tipo];
  if (!ok(X)) { g.push(`${nome}: ingresso non misurato ${JSON.stringify(X).slice(0, 300)}`); return; }
  const W = X.W, d = W.durate || {};
  if (W.tipo !== tipo) g.push(`${nome}: tipo «${W.tipo}», atteso «${tipo}»`);
  if (W.regia !== A.regia) g.push(`${nome}: regia «${W.regia}», attesa «${A.regia}»`);
  const tot = A.scena + A.inno; if (Math.abs(X.durataScena - tot) > 1.5) g.push(`${nome}: scena di ${X.durataScena} s, attesa ${tot} ± 1,5`);
  if (tipo === 'normale') { if (X.durataScena > BREVE) g.push(`${nome}: l'ingresso normale dura ${X.durataScena} s (tetto «breve» ${BREVE})`);
    if (W.regie.some(r => r === 'panoramica' || r === 'bandiere' || r === 'inno')) g.push(`${nome}: regia non breve ${W.regie.join('>')}`); }
  if (tipo === 'derby' && !((d.tunnel || 0) >= 6)) g.push(`${nome}: tunnel in quadro ${d.tunnel || 0} s (minimo 6)`);
  if (tipo === 'finale' && !((d.panoramica || 0) >= 8)) g.push(`${nome}: panoramica ${d.panoramica || 0} s (minimo 8)`);
  if (tipo === 'nazionale' && !((d.bandiere || 0) >= 4)) g.push(`${nome}: bandiere in quadro ${d.bandiere || 0} s (minimo 4)`);
  if (tipo !== 'finale' && (d.panoramica || 0) > 6.5) g.push(`${nome}: panoramica lunga (${d.panoramica} s) fuori dalle finali (tetto 6,5: il giro di oggi ne ha 5,8)`);
  if (tipo !== 'nazionale' && d.bandiere) g.push(`${nome}: inquadratura delle bandiere fuori dalla Nazionale`);
  if (A.inno) { if (!(W.innoS >= INNO)) g.push(`${nome}: inno di ${W.innoS} s (minimo ${INNO})`); if (!X.innoDom) g.push(`${nome}: la scritta dell'inno non si e' vista`); }
  else { if (W.innoS > 0 || X.innoDom) g.push(`${nome}: inno dove non e' previsto (${W.innoS} s, scritta ${X.innoDom})`); }
  const dose = X.vista === '375x667' ? { f: 8, c: 80 } : { f: 14, c: 180 };
  if (A.coreo === 0) { if (W.coreoMax.length || W.fumoMax || W.coriMax) g.push(`${nome}: coreografia/fumogeni/coriandoli in una partita normale ${JSON.stringify([W.coreoMax, W.fumoMax, W.coriMax])}`); }
  else { if (!W.coreoMax.includes('casa')) g.push(`${nome}: nessuna coreografia sulla curva di casa`);
    if (A.coreo === 2 && !W.coreoMax.includes('ospiti')) g.push(`${nome}: nella finale manca la coreografia sul lato ospite`);
    if (A.coreo === 1 && W.coreoMax.includes('ospiti')) g.push(`${nome}: coreografia sui due lati fuori dalle finali`);
    if (!(W.fumoMax > 0 && W.fumoMax <= dose.f * A.coreo)) g.push(`${nome}: fumogeni ${W.fumoMax} (dose 1..${dose.f * A.coreo})`);
    if (W.coriMax !== dose.c) g.push(`${nome}: coriandoli ${W.coriMax} (dose ${dose.c})`); }
  if (X.resid > SCH) g.push(`${nome}: la squadra non arriva schierata (scarto ${X.resid} u)`);
  if (!(X.corpi >= 22)) g.push(`${nome}: corpi misurati ${X.corpi} (attesi almeno 22: misura cieca)`); else if (X.altoMax > ALTO) g.push(`${nome}: un corpo in scena e' alto ${X.altoMax} u (tetto ${ALTO}: i calciatori sono ~1,65)`);
  if (X.err) g.push(`${nome}: errore nella scena ${X.err}`); if (X.errori.length) g.push(`${nome}: errori di pagina ${X.errori.join(' | ')}`);
}
for (const [n, t] of [['normale', 'normale'], ['big', 'big'], ['derby', 'derby'], ['europea', 'europea'], ['nazionale', 'nazionale'], ['finale', 'finale'], ['big-pc', 'big'], ['finale-pc', 'finale']]) verde(n, t);
if (S.finale && S.finale.tipoVero && S.finale.tipoVero.tipo !== 'finale' && !FORZA) g.push('finale: la finale di coppa del salvataggio non e\' stata riconosciuta ' + JSON.stringify(S.finale.tipoVero));
for (const [v, r] of [['big', 'big-rosso'], ['big-pc', 'big-pc-rosso']]) { const V = S[v], Z = S[r]; if (!V || !Z) continue;
  if (!(V.fps > 0 && Z.fps > 0)) g.push(`${v}: fps non misurati (${V && V.fps} / ${Z && Z.fps})`);
  else if (V.fps < Z.fps * FPSK) g.push(`${v}: ${V.fps} fps contro ${Z.fps} senza le novita' (minimo ${(FPSK * 100) | 0}%)`); }
if (S['finale-rosso'] && !FORZA) { const Z = S['finale-rosso'];
  if (!(Z.walk && Z.frames > 30)) g.push('rosso: non misurato ' + JSON.stringify(Z).slice(0, 200));
  else if (Z.W || Z.innoDom || Math.abs(Z.durataScena - 16) > 1.5) g.push('rosso: il difetto non si vede ' + JSON.stringify(Z).slice(0, 300));
  if (S['big-rosso'] && !(S['big-rosso'].altoMax > ALTO)) g.push('rosso: i guardalinee giganti non si vedono piu\' col rosso (altezza massima ' + S['big-rosso'].altoMax + ')'); }
if (g.length) { console.log('❌ ingresso-206'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ ingresso-206 verde (regia per tipo, ingresso breve nelle normali, coreografia/fumogeni/coriandoli/inno solo dove previsti, squadra schierata, fps tenuti) e il rosso si vede');
