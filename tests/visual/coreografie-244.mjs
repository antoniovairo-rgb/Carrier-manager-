#!/usr/bin/env node
/* [giro 244 PO-509, foto PO 7.999.196 «Creare coreografie sempre diverse, non sempre la stessa»; decisione PO 17/11 «Anche in movimento»]
   GUARDIANO sul percorso vero (salvataggio → partita → ingresso in campo), corpi 3D accesi.
   TRENTA PARTITE DI FILA nello stesso dispositivo (un solo contesto del browser: la memoria del dispositivo passa da una partita alla
   successiva come sul telefono; ogni partita e' una pagina nuova = «salvataggio e ripresa»): stesso club in casa, club diversi in
   trasferta, campionato di cartello, derby, coppa europea, Nazionale, finale di coppa; stagioni diverse. Le partite «normali» non hanno
   coreografia per regola del giro 206 e qui non si contano.
   Per ogni partita, a coreografia accesa: (1) la FIRMA di cio' che c'e' in curva — letta dalla SCENA, non dal testimone del gioco:
   disegno della tela (punti del canvas) + numero di pezzi — (2) se SI MUOVE: la firma della geometria (posizioni + uv + scorrimento
   della tela) presa due volte a distanza di tempo di scena, (3) una foto della curva di casa da una camera fissa.
   VERDE: almeno 8 coreografie distinte su 30 · mai la stessa due partite di fila · la partita riaperta mostra la stessa di prima ·
   almeno 3 coreografie che si muovono, e quelle che il gioco dichiara animate si muovono davvero · la curva ospite ne ha una solo in finale ·
   fps dell'ingresso col verde >= 85% del rosso (telefono 375x667, CPU x2, stessa partita, la coreografia animata piu' pesante forzata).
   ROSSO (__CPM_NO_G244): torna la coreografia di oggi — una sola firma, ferma.
   CPM_PROVA_ROSSO=1 gira le prime 8 partite col rosso e pretende il difetto. CPM_N=numero di partite · CPM_SOLO_MISURA=1 non giudica ·
   CPM_FOTO_DIR=cartella delle foto (predefinita tests/visual/out/giro244) · CPM_TAG=prefisso dei file · CPM_FPS=0 salta il confronto fps.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node coreografie-244.mjs */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const ROSSO = !!process.env.CPM_PROVA_ROSSO, MISURA = !!process.env.CPM_SOLO_MISURA, TAG = process.env.CPM_TAG || (ROSSO ? 'rosso' : 'dopo');
const DIR = process.env.CPM_FOTO_DIR || path.join(ROOT, 'tests', 'visual', 'out', 'giro244'); fs.mkdirSync(DIR, { recursive: true });
const N = +(process.env.CPM_N || (ROSSO ? 8 : 30)), DISTINTE = 8, ANIMATE = 3, FPSK = 0.85;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
/* ---- le trenta partite: variazioni del salvataggio vero (ultima giornata, settimana 38) ---- */
const AVV = [['new', 'FC Tyneside'], ['tot', 'FC Lilywhite'], ['avl', 'FC Villa Park'], ['mcy', 'FC Etihad'], ['eve', 'FC Goodison'], ['mun', 'FC Trafford'], ['che', 'FC Stamford'], ['ars', 'FC Highbury'], ['whu', 'FC Irons'], ['ful', 'FC Cottage']];
function partita(i) { const sv = JSON.parse(JSON.stringify(SAVE)); const pl = sv.player; const w = pl.week | 0;
  const TIPI = ['big', 'derby', 'big', 'europea', 'big', 'finale', 'derby', 'big', 'nazionale', 'big'];
  const tipo = TIPI[i % TIPI.length], casa = (i % 3) !== 1/* due su tre in casa: lo stesso club, la stessa curva */, stagione = 12 + Math.floor(i / 6);
  pl.season = stagione; const a = AVV[i % AVV.length];
  /* la partita si mette in calendario come gara di coppa della settimana (una gara di campionato con avversario+sede gia' giocati il gioco la
     scarta come doppione): quarti per le gare qualunque, finale (campo neutro, tifo sui due lati) per la finale. Il TIPO d'ingresso lo provoca la sonda. */
  const fin = tipo === 'finale';
  pl.cup = Object.assign({}, pl.cup || {}, { active: true, eliminated: false, champion: false, results: [], round: fin ? 4 : 2 });
  pl.calendar = [{ matchday: 1300 + w, week: w, opponentName: a[1], opponentId: a[0], isHome: fin ? true : casa, played: false, type: 'cup', cupRound: fin ? 4 : 2, cupRoundName: fin ? 'Finale' : 'Quarti di Finale' }].concat(pl.calendar);
  return { i, tipo, casa: tipo === 'finale' ? true : casa, stagione, avv: a[0], save: sv }; }
const PIANO = []; for (let i = 0; i < N; i++) PIANO.push(partita(i));
/* la firma letta dalla scena: non si fida del testimone del gioco */
const LEGGI = () => { const T = window.__CPM3D; if (!T) return null; const out = { casa: null, ospiti: null };
  const h = (s, v) => { s = (s ^ v) >>> 0; return Math.imul(s, 16777619) >>> 0; };
  const pezzi = { casa: [], ospiti: [] }; T.scene.traverse(o => { const k = o.userData && o.userData.coreo206; if (k && o.isMesh) pezzi[k].push(o); });
  for (const k of ['casa', 'ospiti']) { const P = pezzi[k]; if (!P.length) continue; let dis = 2166136261, geo = 2166136261, vis = 0, op = 0; const visti = new Set();
    for (const m of P) { if (m.visible) { vis++; op = Math.max(op, m.material.opacity); }
      const mp = m.material.map, cv = mp && mp.image;
      if (cv && cv.getContext && !visti.has(cv)) { visti.add(cv); const W = cv.width, H = cv.height, d = cv.getContext('2d').getImageData(0, 0, W, H).data;
        /* FORMA, non colore: 32x16 caselle, ognuna «colore A» o «colore B» (i due colori piu' presenti), normalizzata sulla prima casella.
           Cosi' lo stesso disegno coi colori di un altro club, o con un'altra grana, ha la stessa firma. */
        const q = (x, y) => { const i = ((y | 0) * W + (x | 0)) * 4; return [d[i], d[i + 1], d[i + 2]]; }; const cnt = new Map(); const cel = [];
        for (let cy = 0; cy < 16; cy++) for (let cx = 0; cx < 32; cx++) { const c = q((cx + 0.5) * W / 32, (cy + 0.5) * H / 16); cel.push(c); const k = (c[0] >> 5) + '|' + (c[1] >> 5) + '|' + (c[2] >> 5); const e = cnt.get(k) || { n: 0, c }; e.n++; cnt.set(k, e); }
        const top = [...cnt.values()].sort((a, b2) => b2.n - a.n); const A = top[0].c, B = (top[1] || top[0]).c; const dd = (a, c) => (a[0] - c[0]) ** 2 + (a[1] - c[1]) ** 2 + (a[2] - c[2]) ** 2;
        const bit = cel.map(c => dd(c, A) <= dd(c, B) ? 0 : 1); const inv = bit[0]; for (const v of bit) dis = h(dis, v ^ inv); }
      const pa = m.geometry.attributes.position.array, ua = m.geometry.attributes.uv.array; const dr = m.geometry.drawRange;
      for (let i = 0; i < pa.length; i++) geo = h(geo, Math.round(pa[i] * 50)); for (let i = 0; i < ua.length; i++) geo = h(geo, Math.round(ua[i] * 500));
      geo = h(geo, Math.round((mp ? mp.offset.x : 0) * 500)); geo = h(geo, dr ? (dr.count === Infinity ? -1 : dr.count) : -1); geo = h(geo, Math.round(m.rotation.x * 200) + Math.round(m.rotation.z * 200) * 7); }
    out[k] = { disegno: (h(dis, P.length)).toString(16), geo: geo.toString(16), pezzi: P.length, visibili: vis, op: +op.toFixed(2) }; }
  return out; };
const FOTO = () => { const T = window.__CPM3D; if (!T) return null; const c = T.camera, p0 = c.position.clone(), q0 = c.quaternion.clone(), f0 = c.fov;
  let sx = 60; T.scene.traverse(o => { if (o.userData && o.userData.coreo206 === 'casa' && o.isMesh) { o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox; sx = Math.max(sx, (bb.min.x + bb.max.x) / 2 + o.position.x); } });
  c.position.set(sx - 96, 19, 0); c.fov = 60; c.updateProjectionMatrix(); c.lookAt(sx, 8, 0); T.renderer.render(T.scene, c); const u = T.renderer.domElement.toDataURL('image/jpeg', 0.82);
  c.position.copy(p0); c.quaternion.copy(q0); c.fov = f0; c.updateProjectionMatrix(); return u; };
async function ingresso(ctx, P, { rosso = false, forza = null, cpu = 1, vw = 375, vh = 667, fps = false, foto = true } = {}) {
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_GLB = true; window.__CPM_TOD = 'night'; if (o.tipo && o.tipo !== 'finale') window.__CPM_TIPO206 = o.tipo; if (o.r) window.__CPM_NO_G244 = true; if (o.forza) window.__CPM_FORZA244 = o.forza; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: P.save, r: rosso, tipo: P.tipo, forza });
  const out = { i: P.i, tipo: P.tipo, casa: P.casa, stagione: P.stagione, avv: P.avv, rosso };
  try {
    if (cpu > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu }); }
    await page.setViewportSize({ width: vw, height: vh });
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 120000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    if (fps) await page.evaluate(() => { const R = window.__REC244 = { n: 0, t0: 0, t1: 0 }; const f = () => { try { if (window.__CPM_PHASE && window.__CPM_PHASE() === 'walkout' && !window.__CPM_WALKHOLD74 && window.__CPM_ING206 && window.__CPM_ING206.coreoMax.length) { const now = performance.now(); if (!R.t0) R.t0 = now; R.t1 = now; R.n++; } } catch (_) {} requestAnimationFrame(f); }; requestAnimationFrame(f); });
    await page.evaluate(() => { window.__CPM_WALK245 = []; });/* l'orologio di scena dell'ingresso (il gioco lo scrive solo se la sonda lo apre) */
    out.playMatch = await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 70; k++) { const p = await ph(); if (p === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
      await sleep(600); }
    out.walk = (await ph()) === 'walkout';
    /* si aspetta l'EVENTO (coreografia accesa nella scena), non un tempo */
    const t0 = Date.now(); let a = null;
    while (Date.now() - t0 < 420000) { if ((await ph()) !== 'walkout') break; a = await page.evaluate(LEGGI).catch(() => null); if (a && a.casa && a.casa.visibili && a.casa.op >= 0.9) break; await sleep(250); }
    out.a = a; out.accesa = !!(a && a.casa && a.casa.visibili && a.casa.op >= 0.9);
    if (out.accesa) { const s0 = await page.evaluate(() => { const K = window.__CPM_WALK245 || []; return K.length ? K[K.length - 1].s : null; });
      /* seconda lettura dopo almeno 0,8 s di TEMPO DI SCENA (in headless il tempo reale e' molto piu' lento) */
      const t1 = Date.now(); let b2 = a; while (Date.now() - t1 < 120000) { await sleep(300); const s1 = await page.evaluate(() => { const K = window.__CPM_WALK245 || []; return K.length ? K[K.length - 1].s : null; }); if ((await ph()) !== 'walkout') break; if (s0 == null || s1 == null) { out.orologio = false; break; } if (s1 - s0 >= 0.8) { b2 = await page.evaluate(LEGGI).catch(() => a); break; } }
      out.b = b2; out.simuove = !!(b2 && b2.casa && b2.casa.geo !== a.casa.geo);
      out.firma = a.casa.disegno + '/' + a.casa.pezzi; out.firmaOspiti = a.ospiti && a.ospiti.visibili ? a.ospiti.disegno + '/' + a.ospiti.pezzi : null;
      if (foto) { const u = await page.evaluate(FOTO).catch(() => null); if (u) fs.writeFileSync(path.join(DIR, (P.nomeFoto || `${TAG}-${String(P.i + 1).padStart(2, '0')}-${P.tipo}-${P.casa ? 'casa' : 'trasferta'}-s${P.stagione}`) + '.jpg'), Buffer.from(u.split(',')[1], 'base64')); } }
    out.W = await page.evaluate(() => window.__CPM_COREO244 || null).catch(() => null);
    out.tifo = await page.evaluate(() => (window.__CPM_TIFO ? window.__CPM_TIFO().cancelli : null)).catch(() => null);
    if (fps) { const t2 = Date.now(); let visto = true; while (Date.now() - t2 < 1200000) { const p = await ph(); if (p !== 'walkout') break; await sleep(400); }
      const R = await page.evaluate(() => window.__REC244); out.fps = (R && R.t1 > R.t0) ? +(R.n / ((R.t1 - R.t0) / 1000)).toFixed(2) : null; out.fotogrammi = R ? R.n : 0; }
    out.err206 = await page.evaluate(() => window.__CPM_ING206ERR || null).catch(() => null);
  } catch (e) { out.errore = String(e.message).slice(0, 200); }
  out.errori = errs.slice(0, 3); await page.close();
  console.log(JSON.stringify({ ...out, a: undefined, b: undefined })); return out; }
/* CPM_CATALOGO=1: una foto per coreografia del catalogo (forzata dal banco di prova), stessa partita; CPM_CATALOGO=id1,id2 solo quelle. Non giudica. */
if (process.env.CPM_CATALOGO) { const c0 = await b.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block', isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await installCdnRoutes(c0);
  const IDS = process.env.CPM_CATALOGO === '1' ? ['croce', 'pali', 'scacchi', 'diagonali', 'raggi', 'sigla', 'stemma', 'scritta', 'gira', 'scorre', 'bandieroni', 'srotola'] : process.env.CPM_CATALOGO.split(',');
  const tp = process.env.CPM_TIPO || 'big'; let k = 0; for (const id of IDS) { const P = partita(tp === 'finale' ? 5 : tp === 'derby' ? 6 : 0); P.i = k++; P.tipo = tp === 'finale' ? 'finale' : tp; const r = await ingresso(c0, { ...P, nomeFoto: `${TAG}-catalogo-${id}-${tp}` }, { forza: id }); }
  await c0.close(); await b.close(); srv.close(); process.exit(0); }
/* ---- le trenta partite, un solo dispositivo ---- */
const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block', isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await installCdnRoutes(ctx);
const S = []; for (const P of PIANO) S.push(await ingresso(ctx, P, { rosso: ROSSO }));
/* la partita riaperta (stessa partita dell'ultima, pagina nuova): deve mostrare la stessa coreografia */
let riaperta = null; if (!ROSSO && S.length) riaperta = await ingresso(ctx, PIANO[PIANO.length - 1], { foto: false });
await ctx.close();
/* ---- fps: stessa partita (derby in casa), telefono con CPU x2, la coreografia animata piu' pesante forzata contro il rosso ---- */
let F = null;
if (!ROSSO && process.env.CPM_FPS !== '0') { F = {};
  for (const [nome, o] of [['verde', { forza: 'bandieroni' }], ['rosso', { rosso: true }]]) { const c2 = await b.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block', isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await installCdnRoutes(c2);
    F[nome] = await ingresso(c2, PIANO[1 % PIANO.length].tipo === 'derby' ? PIANO[1] : partita(1), { ...o, cpu: 2, fps: true, foto: false }); await c2.close(); } }
await b.close(); srv.close();
const con = S.filter(x => x.accesa), firme = con.map(x => x.firma), distinte = [...new Set(firme)];
let diFila = 0; const coppie = []; for (let k = 1; k < S.length; k++) if (S[k].accesa && S[k - 1].accesa && S[k].firma === S[k - 1].firma) { diFila++; coppie.push((k) + '→' + (k + 1)); }
const mosse = [...new Set(con.filter(x => x.simuove).map(x => x.firma))];
const conta = {}; firme.forEach(f => conta[f] = (conta[f] || 0) + 1);
const R = { partite: S.length, conCoreografia: con.length, distinte: distinte.length, ugualiDiFila: diFila, coppie, cheSiMuovono: mosse.length, conta, nomi: [...new Set(con.map(x => x.W && x.W.id).filter(Boolean))], fps: F ? { verde: F.verde.fps, rosso: F.rosso.fps, fotogrammi: [F.verde.fotogrammi, F.rosso.fotogrammi] } : null };
console.log('MISURA ' + JSON.stringify(R));
fs.writeFileSync(path.join(DIR, `misura-coreografie-${TAG}.json`), JSON.stringify({ R, S: S.map(x => ({ ...x, a: undefined, b: undefined })), riaperta: riaperta && { firma: riaperta.firma, W: riaperta.W }, F }, null, 1));
if (MISURA) process.exit(0);
const g = [];
if (con.length < S.length) g.push(`non giudicato: ${S.length - con.length} partite su ${S.length} senza coreografia accesa (${S.filter(x => !x.accesa).map(x => (x.i + 1) + ':' + x.tipo + (x.errore ? ' ' + x.errore : '')).join(', ')})`);
const errP = S.filter(x => x.errori && x.errori.length || x.err206); if (errP.length) g.push('errori di pagina o di scena: ' + JSON.stringify(errP.slice(0, 3).map(x => [x.i + 1, x.errori, x.err206])));
if (ROSSO) {
  if (!(distinte.length <= 1 + new Set(con.map(x => (x.casa ? 'c' : x.avv) + x.stagione)).size && mosse.length === 0)) g.push(`rosso: il difetto non si vede (${distinte.length} firme, ${mosse.length} che si muovono)`);
  /* col rosso il disegno e' UNO: cambiano solo i colori del club e la grana del seme. Lo stesso club nella stessa stagione = stessa firma */
  const perCurva = {}; con.forEach(x => { const k = (x.casa ? 'casa' : x.avv) + '|' + x.stagione; (perCurva[k] = perCurva[k] || new Set()).add(x.firma); });
  if (Object.values(perCurva).some(s => s.size > 1)) g.push('rosso: la stessa curva nella stessa stagione ha mostrato disegni diversi ' + JSON.stringify(Object.entries(perCurva).map(([k, s]) => [k, s.size])));
  if (con.some(x => x.W && x.W.id !== 'oggi')) g.push('rosso: il gioco dichiara una coreografia del catalogo ' + JSON.stringify(con.map(x => x.W && x.W.id)));
  if (g.length) { console.log('❌ coreografie-244 (prova del rosso)'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
  console.log('✅ coreografie-244: col rosso torna la coreografia di oggi (un disegno solo per curva e stagione, ferma)'); process.exit(0); }
/* distinte = il minore fra le forme lette dalla scena e i nomi dichiarati dal gioco (sigla e scritta cambiano forma col club: non contano due volte) */
const nDist = Math.min(distinte.length, R.nomi.length);
if (nDist < DISTINTE) g.push(`solo ${nDist} coreografie distinte su ${con.length} partite (minimo ${DISTINTE}; forme ${distinte.length}, nomi ${R.nomi.length})`);
{ const fn = {}; con.forEach(x => { if (x.W) (fn[x.firma] = fn[x.firma] || new Set()).add(x.W.id); }); const dop = Object.entries(fn).filter(([, v]) => v.size > 1); if (dop.length) g.push('due nomi del catalogo hanno la stessa forma in scena ' + JSON.stringify(dop.map(([k, v]) => [k, [...v]]))); }
for (let k = 1; k < S.length; k++) if (S[k].W && S[k - 1].W && S[k].W.id === S[k - 1].W.id) g.push(`lo stesso nome di coreografia due partite di fila: ${k}→${k + 1} «${S[k].W.id}»`);
if (diFila) g.push(`la stessa coreografia due partite di fila: ${coppie.join(', ')}`);
if (mosse.length < ANIMATE) g.push(`solo ${mosse.length} coreografie che si muovono (minimo ${ANIMATE})`);
for (const x of con) { if (!x.W) { g.push(`partita ${x.i + 1}: il gioco non dichiara la coreografia`); continue; }
  if (x.W.anim && !x.simuove) g.push(`partita ${x.i + 1}: «${x.W.id}» e' dichiarata animata ma in scena e' ferma`);
  if (!x.W.anim && x.simuove) g.push(`partita ${x.i + 1}: «${x.W.id}» e' dichiarata ferma ma in scena si muove`);
  if (x.tipo !== 'finale' && x.firmaOspiti) g.push(`partita ${x.i + 1} (${x.tipo}): coreografia sul lato ospite fuori dalle finali`);
  if (x.tipo === 'finale' && x.tifo && x.tifo.away && !x.firmaOspiti) g.push(`partita ${x.i + 1}: finale col tifo ospite ma senza coreografia ospite`);
  if (x.tipo === 'finale' && x.firmaOspiti && x.firmaOspiti === x.firma) g.push(`partita ${x.i + 1}: le due curve della finale hanno lo stesso disegno`); }
{ const perNome = {}; con.forEach(x => { if (x.W) (perNome[x.W.id] = perNome[x.W.id] || new Set()).add(x.firma.split('/')[1]); });/* un nome = una forma (i colori cambiano col club) */
  const taglie = con.filter(x => x.W).map(x => [x.tipo, x.W.taglia]); const tg = t => taglie.filter(x => x[0] === t).map(x => x[1]);
  if (tg('finale').some(v => v < 3) || tg('derby').some(v => v < 3)) g.push('finali e derby non hanno la taglia piu\' grande ' + JSON.stringify(taglie));
  if (tg('big').length && tg('finale').length && !(Math.max(...tg('big')) <= Math.min(...tg('finale')))) g.push('una gara di cartello ha la coreografia piu\' grande di una finale ' + JSON.stringify(taglie)); }
if (riaperta) { const u = S[S.length - 1]; if (!(riaperta.accesa && riaperta.firma === u.firma)) g.push(`la partita riaperta mostra un'altra coreografia (${u.W && u.W.id} → ${riaperta.W && riaperta.W.id})`); }
if (F) { if (!(F.verde.fps > 0 && F.rosso.fps > 0 && F.verde.fotogrammi > 20 && F.rosso.fotogrammi > 20)) g.push(`fps non misurati ${JSON.stringify(R.fps)}`);
  else if (F.verde.fps < F.rosso.fps * FPSK) g.push(`fps: ${F.verde.fps} con la coreografia animata contro ${F.rosso.fps} con quella di oggi (minimo ${(FPSK * 100) | 0}%)`);
  if (F.verde.W && F.verde.W.id !== 'bandieroni') g.push('fps: la coreografia forzata non e\' quella misurata ' + JSON.stringify(F.verde.W)); }
if (g.length) { console.log('❌ coreografie-244'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(`✅ coreografie-244 verde: ${nDist} coreografie distinte su ${con.length} partite, mai la stessa due di fila, ${mosse.length} si muovono, partita riaperta uguale, fps ${R.fps ? R.fps.verde + ' contro ' + R.fps.rosso : 'non chiesti'}`);
