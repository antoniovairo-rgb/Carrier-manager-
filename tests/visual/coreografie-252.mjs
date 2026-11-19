#!/usr/bin/env node
/* [giro 252, seguito di PO-509 (giro 244); decisione PO 17/11 «Sì, piccole»] GUARDIANO delle coreografie nelle partite NORMALI.
   Percorso vero (salvataggio → partita → ingresso in campo), corpi 3D accesi, un solo contesto del browser (= un dispositivo: la memoria
   della rotazione «cpm-coreo244» passa da una partita all'altra come sul telefono; ogni partita e' una pagina nuova).
   SALVATAGGIO DI PROVA (dubbio 2 del giro 244): lo stesso salvataggio del 244 trasformato in un club di META' CLASSIFICA (FC Craven, ful)
   a INIZIO STAGIONE (settimane 4→, classifica azzerata, gare di campionato): cosi' le gare escono «normali» per conto del gioco, senza
   forzare il tipo. In mezzo, quattro gare forzate col banco di prova (derby, coppa europea, big, Nazionale) per vedere le taglie 2 e 3
   nella STESSA rotazione.
   Per ogni partita: tipo d'ingresso dichiarato dal gioco (__CPM_ING206.tipo), cancelli del tifo, firma della coreografia letta dalla SCENA
   (forma della tela + pezzi, curva di casa e curva ospite), taglia dichiarata, foto della curva di casa.
   VERDE: >= 20 partite normali giudicate · ogni partita normale con tifo di casa ha la coreografia accesa in curva di casa, taglia 1, e
   nulla in curva ospite · una partita normale senza tifo di casa non ha coreografia · taglie 1, 2 e 3 viste almeno una volta · mai lo
   stesso nome due partite di fila (fra TUTTE le taglie) · nessun errore di pagina · fps dell'ingresso normale (coreografia animata piu'
   pesante forzata, telefono 375x667 CPU x2) >= 85% del rosso.
   ROSSO (__CPM_NO_G252): le partite normali tornano senza coreografia (come prima del giro) — il guardiano pretende 0 normali accese.
   «Non giudicato» = rosso (ingresso mai raggiunto, meno partite normali del minimo).
   CPM_PROVA_ROSSO=1 gira 6 partite normali col rosso · CPM_N=partite · CPM_SOLO_MISURA=1 non giudica · CPM_FPS=0 salta gli fps ·
   CPM_FOTO_DIR=cartella foto (predefinita tests/visual/out/giro252) · CPM_TAG=prefisso.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node coreografie-252.mjs */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const ROSSO = !!process.env.CPM_PROVA_ROSSO, MISURA = !!process.env.CPM_SOLO_MISURA, TAG = process.env.CPM_TAG || (ROSSO ? 'rosso' : 'dopo');
const DIR = process.env.CPM_FOTO_DIR || path.join(ROOT, 'tests', 'visual', 'out', 'giro252'); fs.mkdirSync(DIR, { recursive: true });
const NORMALI_MIN = ROSSO ? 6 : 20, TIFO_MIN = ROSSO ? 1 : 15, FPSK = 0.85;/* TIFO_MIN: partite normali col tifo di casa da giudicare (misura prima: 18 su 20, le altre due a stadio freddo) */
/* le quattro gare forzate, nelle posizioni del piano (indice 0-based) */
const SPECIALI = ROSSO ? {} : { 3: 'derby', 8: 'europea', 13: 'big', 18: 'nazionale' };
const N = +(process.env.CPM_N || (ROSSO ? 6 : 24));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const AVV = ['bre', 'eve', 'cry', 'lei', 'bha', 'avl', 'whu', 'bou', 'wat', 'swn', 'tot', 'new'];
function partita(i) { const sv = JSON.parse(JSON.stringify(SAVE)); const pl = sv.player;
  const st = pl.standings.map(t => ({ ...t, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, pts: 0 }));
  const me = st.find(t => t.id === 'ful'); pl.standings = st;
  pl.club = { id: me.id, n: me.n, a: me.a, p: me.p, c: me.c, c2: me.c2, nat: me.nat, lg: me.lg, transferType: 'trasferimento definitivo', isU18: false };
  const w = 4 + i, casa = (i % 3) !== 1, stagione = 13 + Math.floor(i / 8); pl.season = stagione; pl.week = w;
  const avvId = AVV[i % AVV.length], avv = st.find(t => t.id === avvId);
  pl.calendar = [{ matchday: w, week: w, opponentName: avv.n, opponentId: avv.id, isHome: casa, played: false }];
  pl.goals = 0; pl.assists = 0; pl.matches = 0; pl.matchHistory = [];
  return { i, forza: SPECIALI[i] || null, casa, stagione, avv: avvId, save: sv }; }
const PIANO = []; for (let i = 0; i < N; i++) PIANO.push(partita(i));
const LEGGI = () => { const T = window.__CPM3D; if (!T) return null; const out = { casa: null, ospiti: null };
  const h = (s, v) => { s = (s ^ v) >>> 0; return Math.imul(s, 16777619) >>> 0; };
  const pezzi = { casa: [], ospiti: [] }; T.scene.traverse(o => { const k = o.userData && o.userData.coreo206; if (k && o.isMesh) pezzi[k].push(o); });
  for (const k of ['casa', 'ospiti']) { const P = pezzi[k]; if (!P.length) continue; let dis = 2166136261, vis = 0, op = 0, lx = 1e9, hx = -1e9; const visti = new Set();
    for (const m of P) { if (m.visible) { vis++; op = Math.max(op, m.material.opacity); }
      const mp = m.material.map, cv = mp && mp.image;
      if (cv && cv.getContext && !visti.has(cv)) { visti.add(cv); const W = cv.width, H = cv.height, d = cv.getContext('2d').getImageData(0, 0, W, H).data;
        const q = (x, y) => { const i = ((y | 0) * W + (x | 0)) * 4; return [d[i], d[i + 1], d[i + 2]]; }; const cnt = new Map(); const cel = [];
        for (let cy = 0; cy < 16; cy++) for (let cx = 0; cx < 32; cx++) { const c = q((cx + 0.5) * W / 32, (cy + 0.5) * H / 16); cel.push(c); const kk = (c[0] >> 5) + '|' + (c[1] >> 5) + '|' + (c[2] >> 5); const e = cnt.get(kk) || { n: 0, c }; e.n++; cnt.set(kk, e); }
        const top = [...cnt.values()].sort((a, b2) => b2.n - a.n); const A = top[0].c, B = (top[1] || top[0]).c; const dd = (a, c) => (a[0] - c[0]) ** 2 + (a[1] - c[1]) ** 2 + (a[2] - c[2]) ** 2;
        const bit = cel.map(c => dd(c, A) <= dd(c, B) ? 0 : 1); const inv = bit[0]; for (const v of bit) dis = h(dis, v ^ inv); }
      m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox; lx = Math.min(lx, bb.min.z + m.position.z); hx = Math.max(hx, bb.max.z + m.position.z); }
    out[k] = { disegno: (h(dis, P.length)).toString(16), pezzi: P.length, visibili: vis, op: +op.toFixed(2), largo: +(hx - lx).toFixed(1) }; }
  return out; };
const FOTO = () => { const T = window.__CPM3D; if (!T) return null; const c = T.camera, p0 = c.position.clone(), q0 = c.quaternion.clone(), f0 = c.fov;
  let sx = 60; T.scene.traverse(o => { if (o.userData && o.userData.coreo206 === 'casa' && o.isMesh) { o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox; sx = Math.max(sx, (bb.min.x + bb.max.x) / 2 + o.position.x); } });
  c.position.set(sx - 96, 19, 0); c.fov = 60; c.updateProjectionMatrix(); c.lookAt(sx, 8, 0); T.renderer.render(T.scene, c); const u = T.renderer.domElement.toDataURL('image/jpeg', 0.82);
  c.position.copy(p0); c.quaternion.copy(q0); c.fov = f0; c.updateProjectionMatrix(); return u; };
async function ingresso(ctx, P, { rosso = false, forzaCoreo = null, cpu = 1, fps = false, foto = true } = {}) {
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_GLB = true; window.__CPM_TOD = 'night'; if (o.tipo) window.__CPM_TIPO206 = o.tipo; if (o.r) window.__CPM_NO_G252 = true; if (o.fc) window.__CPM_FORZA244 = o.fc; localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: P.save, r: rosso, tipo: P.forza, fc: forzaCoreo });
  const out = { i: P.i, forza: P.forza, casa: P.casa, stagione: P.stagione, avv: P.avv, rosso };
  try {
    if (cpu > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu }); }
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 120000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    if (fps) await page.evaluate(() => { const R = window.__REC252 = { n: 0, t0: 0, t1: 0 }; const f = () => { try { if (window.__CPM_PHASE && window.__CPM_PHASE() === 'walkout' && !window.__CPM_WALKHOLD74) { const now = performance.now(); if (!R.t0) R.t0 = now; R.t1 = now; R.n++; } } catch (_) {} requestAnimationFrame(f); }; requestAnimationFrame(f); });
    out.playMatch = await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 70; k++) { const p = await ph(); if (p === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
      await sleep(600); }
    out.walk = (await ph()) === 'walkout';
    out.tifo = await page.evaluate(() => (window.__CPM_TIFO ? window.__CPM_TIFO().cancelli : null)).catch(() => null);
    /* si aspetta l'EVENTO: la coreografia accesa, oppure la fine dell'ingresso (una partita senza coreografia non si accende mai) */
    const t0 = Date.now(); let a = null, visto = false;
    while (Date.now() - t0 < 420000) { const p = await ph(); if (p !== 'walkout') break; a = await page.evaluate(LEGGI).catch(() => null);
      const I = await page.evaluate(() => window.__CPM_ING206 || null).catch(() => null); if (I && I.tipo) out.tipo = I.tipo;
      if (a && a.casa && a.casa.visibili && a.casa.op >= 0.9) { visto = true; break; } await sleep(300); }
    out.a = a; out.accesa = visto;
    if (!out.tipo) { const I = await page.evaluate(() => window.__CPM_ING206 || null).catch(() => null); out.tipo = I && I.tipo || null; }
    if (visto) { out.firma = a.casa.disegno + '/' + a.casa.pezzi; out.largo = a.casa.largo; out.firmaOspiti = a.ospiti && a.ospiti.visibili ? a.ospiti.disegno : null;
      if (foto) { const u = await page.evaluate(FOTO).catch(() => null); if (u) fs.writeFileSync(path.join(DIR, `${TAG}-${String(P.i + 1).padStart(2, '0')}-${out.tipo}-${P.casa ? 'casa' : 'trasferta'}.jpg`), Buffer.from(u.split(',')[1], 'base64')); } }
    out.W = await page.evaluate(() => window.__CPM_COREO244 || null).catch(() => null);
    if (fps) { const t2 = Date.now(); while (Date.now() - t2 < 1200000) { const p = await ph(); if (p !== 'walkout') break; await sleep(400); }
      const R = await page.evaluate(() => window.__REC252); out.fps = (R && R.t1 > R.t0) ? +(R.n / ((R.t1 - R.t0) / 1000)).toFixed(2) : null; out.fotogrammi = R ? R.n : 0; }
    out.err206 = await page.evaluate(() => window.__CPM_ING206ERR || null).catch(() => null);
  } catch (e) { out.errore = String(e.message).slice(0, 200); }
  out.errori = errs.slice(0, 3); await page.close();
  console.log(JSON.stringify({ ...out, a: out.a ? { casa: out.a.casa, ospiti: out.a.ospiti } : null })); return out; }
const nuovoCtx = async () => { const c = await b.newContext({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block', isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await installCdnRoutes(c); return c; };
const ctx = await nuovoCtx(); const S = []; for (const P of PIANO) S.push(await ingresso(ctx, P, { rosso: ROSSO })); await ctx.close();
/* fps: una partita NORMALE in casa (la prima del piano), telefono CPU x2; verde con la coreografia animata piu' pesante forzata, rosso = come prima */
let F = null;
if (!ROSSO && process.env.CPM_FPS !== '0') { F = {}; const P0 = PIANO.find(p => !p.forza && p.casa);
  for (const [nome, o] of [['verde', { forzaCoreo: 'bandieroni' }], ['rosso', { rosso: true }]]) { const c2 = await nuovoCtx(); F[nome] = await ingresso(c2, P0, { ...o, cpu: 2, fps: true, foto: false }); await c2.close(); } }
await b.close(); srv.close();
const norm = S.filter(x => x.tipo === 'normale'), normTifo = norm.filter(x => x.tifo && x.tifo.home), normAcc = norm.filter(x => x.accesa);
const nomi = S.map(x => x.accesa && x.W ? x.W.id : null), taglie = [...new Set(S.filter(x => x.accesa && x.W).map(x => x.W.taglia))].sort();
const R = { partite: S.length, normali: norm.length, normaliConTifoCasa: normTifo.length, normaliConCoreografia: normAcc.length, tipi: S.map(x => x.tipo), nomi, taglie,
  tagliaPerTipo: S.filter(x => x.accesa && x.W).map(x => x.tipo + ':' + x.W.taglia + ':' + x.largo), fps: F ? { verde: F.verde.fps, rosso: F.rosso.fps, fotogrammi: [F.verde.fotogrammi, F.rosso.fotogrammi], idVerde: F.verde.W && F.verde.W.id } : null };
console.log('MISURA ' + JSON.stringify(R));
fs.writeFileSync(path.join(DIR, `misura-coreografie252-${TAG}.json`), JSON.stringify({ R, S: S.map(x => ({ ...x, a: undefined })), F: F && { verde: { ...F.verde, a: undefined }, rosso: { ...F.rosso, a: undefined } } }, null, 1));
if (MISURA) process.exit(0);
const g = [];
const nonG = S.filter(x => !x.walk || !x.tipo || x.errore); if (nonG.length) g.push(`non giudicato: ${nonG.length} partite senza ingresso o senza tipo (${nonG.map(x => (x.i + 1) + (x.errore ? ' ' + x.errore : '')).join(', ')})`);
if (norm.length < NORMALI_MIN) g.push(`non giudicato: solo ${norm.length} partite normali (minimo ${NORMALI_MIN})`);
const errP = S.filter(x => (x.errori && x.errori.length) || x.err206); if (errP.length) g.push('errori di pagina o di scena: ' + JSON.stringify(errP.slice(0, 3).map(x => [x.i + 1, x.errori, x.err206])));
if (ROSSO) {
  if (normTifo.length < 1) g.push('rosso non giudicato: nessuna partita normale col tifo di casa');
  if (normAcc.length) g.push(`rosso: ${normAcc.length} partite normali hanno la coreografia (il difetto di prima non si vede)`);
  if (g.length) { console.log('❌ coreografie-252 (prova del rosso)'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
  console.log(`✅ coreografie-252: col rosso ${norm.length} partite normali senza coreografia, come prima del giro`); process.exit(0); }
if (normTifo.length < TIFO_MIN) g.push(`non giudicato: solo ${normTifo.length} partite normali col tifo di casa (minimo ${TIFO_MIN})`);
for (const x of norm) { const tag = `partita ${x.i + 1} (normale)`;
  if (x.tifo && x.tifo.home) { if (!x.accesa) g.push(`${tag}: tifo di casa ma nessuna coreografia accesa`);
    else { if (!x.W || x.W.taglia !== 1) g.push(`${tag}: taglia ${x.W && x.W.taglia} invece di 1`); if (x.firmaOspiti) g.push(`${tag}: coreografia anche in curva ospite`); } }
  else if (x.accesa) g.push(`${tag}: coreografia senza tifo di casa`); }
for (const t of [1, 2, 3]) if (!taglie.includes(t)) g.push(`taglia ${t} mai vista (${JSON.stringify(R.tagliaPerTipo)})`);
for (let k = 1; k < S.length; k++) if (nomi[k] && nomi[k - 1] && nomi[k] === nomi[k - 1]) g.push(`la stessa coreografia due partite di fila: ${k}→${k + 1} «${nomi[k]}»`);
if (S.some(x => x.tipo !== 'normale' && x.accesa && x.W && x.W.taglia < 2 && (x.tipo === 'derby' || x.tipo === 'europea' || x.tipo === 'nazionale'))) g.push('derby/coppa/Nazionale con la taglia piccola ' + JSON.stringify(R.tagliaPerTipo));
if (F) { if (!(F.verde.fps > 0 && F.rosso.fps > 0 && F.verde.fotogrammi > 20 && F.rosso.fotogrammi > 20)) g.push(`fps non misurati ${JSON.stringify(R.fps)}`);
  else if (F.verde.fps < F.rosso.fps * FPSK) g.push(`fps: ${F.verde.fps} con la coreografia piccola animata contro ${F.rosso.fps} senza (minimo ${(FPSK * 100) | 0}%)`);
  if (!(F.verde.W && F.verde.W.id === 'bandieroni' && F.verde.accesa)) g.push('fps: la coreografia forzata non e\' quella misurata ' + JSON.stringify(F.verde.W)); }
if (g.length) { console.log('❌ coreografie-252'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(`✅ coreografie-252 verde: ${normAcc.length}/${norm.length} normali con coreografia taglia 1, taglie ${taglie.join('/')} viste, mai la stessa due di fila, fps ${R.fps ? R.fps.verde + ' contro ' + R.fps.rosso : 'non chiesti'}`);
