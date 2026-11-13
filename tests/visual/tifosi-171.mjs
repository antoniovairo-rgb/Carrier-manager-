#!/usr/bin/env node
/* [giro 171 PO-368 guardiano — «i tifosi devono mantenere il colore originale del club, non prendere il colore della maglia da trasferta»,
   foto PO docs/collaudo-po/191-tifosi-colore-trasferta.webp (ramo poc/marioprada-character-system): partita 2D su PC, FC Cesenate Primavera
   (casa, bianco) contro FC Leonessa Primavera (trasferta, maglia viola; club celeste): settore ospiti e cartelloni viola].
   PARTITA VERA dal salvataggio Primavera (fixtures/save-194-primavera-w38.json, giornata 34 in trasferta): per ogni coppia si cambia il club
   dell'eroe (ospite) e l'avversario di casa, si entra in partita con gli handler veri e, a gioco fluido, si legge:
   2D) i PIXEL del settore ospiti (curva ospiti fuori dai cartelloni, rettangolo dichiarato da __CPM_G141.ospRect) e il centro di ogni
       cartellone del settore ospiti (__CPM_G141.pan). Ogni pixel colorato si assegna alla tavolozza piu' vicina fra CLUB (la tavolozza che
       _spalti297 costruisce dai colori sociali c/c2) e MAGLIA (quella che costruisce dalla divisa del giorno), «smiscelando» il puntino sul
       fondo come spalti-109. Criterio verde: quota CLUB >= SOGLIA_CLUB sui pixel assegnati della curva E sui cartelloni ospiti, con almeno
       MIN_PX pixel assegnati (meno = «non giudicato» = rosso).
   3D) i colori con cui lo stadio ha COSTRUITO folla e scenografia (__CPM_TIFO().colori171): stadio.away (tela e sagome della folla ospite) =
       colore sociale c degli ospiti, mai la maglia; bandiere/sciarpe ospiti = [c, c2] del club ospite.
   Ogni coppia e' scelta perche' la maglia del giorno degli ospiti DISTA dal colore del club (redmean >= DIST_MIN): se no, la misura non
   distingue e la coppia e' «non giudicata» (rosso). Formati: telefono 375x812 (tocco) e PC 1440x900.
   ROSSO: CPM_PROVA_ROSSO=1 rigira tutto con __CPM_NO_G171 e pretende che il 2D cada su OGNI misura (tifosi con la maglia) e che le bandiere
   3D ospiti perdano il secondo colore dove il club non lo ha bianco. Stampati per ultimi: verde e rosso.
   CPM_FOTO_171=<cartella> salva le foto (prima = rosso, dopo = verde). Non prova dispositivi veri. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const FORMATI = { t375: { w: 375, h: 812, touch: true }, pc: { w: 1440, h: 900, touch: false } };
const SOGLIA_CLUB = 0.80, MIN_PX = 150, DIST_MIN = 150, N_COPPIE = +(process.env.CPM_N_171 || 4);
const ROSSO = !!process.env.CPM_PROVA_ROSSO, FOTO = process.env.CPM_FOTO_171 || '';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const URL0 = `http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`;

/* 0) le coppie: la foto del PO e altre in cui la maglia del giorno degli ospiti e' lontana dal colore del club */
async function scegliCoppie() {
  const ctx = await b.newContext({ serviceWorkers: 'block' }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.goto(URL0, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => typeof selectMatchKits === 'function' && typeof _spalti297 === 'function' && typeof U18_CLUBS !== 'undefined', null, { timeout: 90000 });
  const r = await page.evaluate(({ DIST_MIN, N }) => {
    const rgb = h => { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const dist = (a, b) => { a = rgb(a); b = rgb(b); const rm = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]; return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db); };
    const seen = new Set(), pool = (typeof U18_CLUBS_P2 !== 'undefined' ? U18_CLUBS_P2 : []).concat(U18_CLUBS).filter(c => !seen.has(c.id) && seen.add(c.id));
    const cand = [];
    for (const h of pool) for (const a of pool) { if (h.id === a.id || h.lg !== a.lg) continue; const K = selectMatchKits(h, a); /* la stessa regola della lettura: contano le TAVOLOZZE della tribuna (una maglia nera si schiarisce o cede al secondo colore) e, fra
         queste, le tinte sature che stanno ad almeno 60 da ogni tinta dell'altra; d = distanza fra le due prime tinte distintive */
      const P1 = _spalti297(h.c, h.c2, a.c, a.c2), P2 = _spalti297(h.c, h.c2, K.awayShirt, K.awayAccent), Pc = P1.osp, Pk = P2.osp;
      const sat = x => { x = rgb(x); const M = Math.max(...x), m = Math.min(...x); return M ? (M - m) / M : 0; };
      const all = P => P.osp.concat(P.cartO || []).filter(x => sat(x) >= 0.18), AC = all(P1), AK = all(P2);
      const rC = AC.filter(x => AK.every(k => dist(x, k) >= 60)), rK = AK.filter(x => AC.every(k => dist(x, k) >= 60));
      const okP = sat(Pc[0]) >= 0.18 && sat(Pk[0]) >= 0.18 && rC.includes(Pc[0]) && rK.includes(Pk[0]);/* la tinta PRINCIPALE di ciascuna non compare nell'altra: se la maglia e' il secondo colore del club (giallo/blu con maglia blu) le tavolozze sono la stessa a proporzioni diverse e la misura non distingue */
      const d = okP ? dist(Pc[0], Pk[0]) : 0;/* la prima tinta distintiva di ciascuna: in tribuna e' la piu' numerosa */
      if (K.awayKitName !== 'Home' && d >= DIST_MIN) cand.push({ casa: h.id, osp: a.id, d: Math.round(d), kit: K.awayShirt, c: a.c, nome: K.awayKitName, pc: Pc[0], pk: Pk[0] }); }
    const out = []; const po = cand.find(x => x.casa === 'ces' && x.osp === 'bres'); if (po) out.push({ ...po, po: true });
    /* poi le coppie con le tavolozze piu' lontane, ogni club al massimo una volta */
    const visti = new Set(out.flatMap(x => [x.osp, x.casa]));
    for (const x of cand.sort((p, q) => q.d - p.d)) { if (out.length >= N) break; if (visti.has(x.osp) || visti.has(x.casa)) continue;/* club tutti diversi fra le coppie */ visti.add(x.osp); out.push(x); }
    return { cand: cand.length, lg: [...new Set(pool.map(c => c.lg))].join('+'), n: pool.length, out, clubs: Object.fromEntries(pool.map(c => [c.id, c])) };
  }, { DIST_MIN, N: N_COPPIE });
  await ctx.close(); return r;
}

const LEGGI2D = () => {
  const cv = window.__CPM_CAMPO2D_CV && window.__CPM_CAMPO2D_CV(); const G = window.__CPM_G141, T = window.__CPM_G171;
  if (!cv || !G || !G.on || !G.ospRect || !T || !T.tifo) return { ko: '2D: testimoni assenti (' + [!cv && 'canvas', !(G && G.on) && '__CPM_G141', !(T && T.tifo) && '__CPM_G171'].filter(Boolean).join(',') + ')' };
  const x = cv.getContext('2d'), D = x.getImageData(0, 0, cv.width, cv.height).data, dpr = cv.width / cv.clientWidth;
  const rgb = h => { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const dist = (a, b) => { const rm = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]; return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db); };
  const club = T.club, kit = T.kit;
  const Pc = _spalti297(club.casa[0], club.casa[1], club.osp[0], club.osp[1]), Pk = _spalti297(kit.casa[0], kit.casa[1], kit.osp[0], kit.osp[1]);
  const BASE = rgb(Pc.base);
  const sat = p => { const M = Math.max(...p), m = Math.min(...p); return M ? (M - m) / M : 0; };
  /* solo le tinte che DISTINGUONO le due tavolozze: un secondo colore bianco comune, o il grigio d'una maglia scura schiarita, non dice nulla */
  const all = (P) => P.osp.concat(P.cartO || []).map(rgb).filter(r => sat(r) >= 0.18);
  const AC = all(Pc), AK = all(Pk), refC = AC.filter(r => AK.every(k => dist(r, k) >= 60)), refK = AK.filter(r => AC.every(k => dist(r, k) >= 60));
  if (!refC.length || !refK.length) return { ko: '2D: tavolozze club e maglia non distinguibili (' + refC.length + '/' + refK.length + ')' };
  const vic = (p, r) => { let best = 1e9; for (const k of [1, 0.9, 0.8]) for (let a = 0.35; a <= 1.001; a += 0.08) { const c = [0, 1, 2].map(i => k * (BASE[i] + a * (r[i] - BASE[i]))); const d0 = dist(p, c); if (d0 < best) best = d0; } return Math.min(best, dist(p, r.map(v => v + (255 - v) * 0.22))); };
  const fam = (p) => { if (dist(p, BASE) <= 28 || Math.max(...p) < 45) return 'base'; if (sat(p) < 0.18) return 'pari';/* neutri: sedili vuoti, bianchi, grigi */ const dc = Math.min(...refC.map(r => vic(p, r))), dk = Math.min(...refK.map(r => vic(p, r))); if (Math.min(dc, dk) > 60) return 'altro'; if (Math.abs(dc - dk) < 25) return 'pari'; return dc < dk ? 'club' : 'maglia'; };/* pari: il puntino sta a uguale distanza dalle due tavolozze (es. secondo colore nero contro maglia grigio-scura) — non dice nulla */
  const [e0, e1, e2, e3] = G.erba, sp = G.sp || 3, R = G.ospRect;
  const cart = [e0 - sp, e1 - sp, e2 + sp, e3 + sp];
  const C = { club: 0, maglia: 0, base: 0, altro: 0, pari: 0 };
  for (let py = 0; py < cv.height; py++) for (let px = 0; px < cv.width; px++) {
    const xx = px / dpr, yy = py / dpr; if (!(xx >= R[0] && xx <= R[0] + R[2] && yy >= R[1] && yy <= R[1] + R[3])) continue;
    if (xx >= cart[0] && xx <= cart[2] && yy >= cart[1] && yy <= cart[3]) continue;
    const i = (py * cv.width + px) * 4; C[fam([D[i], D[i + 1], D[i + 2]])]++; }
  const P = { club: 0, maglia: 0, base: 0, altro: 0, pari: 0 };
  for (const q of (G.pan || [])) { if (q[5] !== 'osp') continue; const px = Math.round((q[0] + q[2] / 2) * dpr), py = Math.round((q[1] + q[3] * 0.6) * dpr); const i = (py * cv.width + px) * 4; P[fam([D[i], D[i + 1], D[i + 2]])]++; }
  return { curva: C, cart: P, rov: !!G.rov, club, kit, pal: { club: Pc.osp, maglia: Pk.osp }, distinte: { club: refC.length, maglia: refK.length } };
};

async function misura(coppia, clubs, fk, rosso) {
  const f = FORMATI[fk], H = clubs[coppia.casa], A = clubs[coppia.osp];
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 2, serviceWorkers: 'block' }; if (f.touch) { opt.hasTouch = true; opt.isMobile = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const s = JSON.parse(JSON.stringify(SAVE)); const p = s.player;
  /* il salvataggio si carica com'e' (la migrazione all'avvio ricostruisce il calendario se cambia il club); DOPO il caricamento, con l'hook di
     collaudo __CPM_CAREER.patch, l'eroe passa al club ospite della coppia (la voce vera della tabella U18) e la giornata diventa la trasferta
     in casa del club di casa. Calendario ridotto a quella giornata e storico vuoto: le guardie anti-loop (al massimo due gare con lo stesso
     club, gemella gia' giocata) non hanno nulla da confrontare. Gli id restano quelli veri, quindi la maglia del giorno e' quella della partita vera. */
  const md0 = s.player.calendar.find(m => !m.played);
  if (rosso) await page.addInitScript(() => { window.__CPM_NO_G171 = true; });
  await page.addInitScript(sv => { try { localStorage.setItem('cpm-v3', JSON.stringify(sv)); } catch (e) {} window.__CPM_W297 = {}; window.__CPM_G141 = {}; window.__CPM_G171 = {}; }, s);
  const m = { formato: fk, coppia: `${H.a}(${H.c}) v ${A.a}(${A.c}/${A.c2}) maglia ${coppia.kit} [${coppia.nome}]`, po: !!coppia.po };
  try {
    await page.goto(URL0, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua/.test(x.textContent || '')), null, { timeout: 90000 }); await sleep(800);
    await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /Continua/.test(x.textContent || '')).click());
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(2000);
    await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(500);
    m.kit = await page.evaluate(({ HID, AID, MD }) => { const L = (typeof U18_CLUBS_P2 !== 'undefined' ? U18_CLUBS_P2 : []).concat(U18_CLUBS); const H = L.find(c => c.id === HID), A = L.find(c => c.id === AID);
      window.__CPM_CAREER.patch({ club: { ...A }, calendar: [{ ...MD, opponentId: H.id, opponentName: H.n || H.name, isHome: false, played: false }], matchHistory: [] }); return selectMatchKits(H, A); }, { HID: H.id, AID: A.id, MD: md0 }); await sleep(800);
    m.play = await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE(), null, { timeout: 30000 }); await sleep(1500);
    await page.keyboard.press('Enter'); await sleep(1500); await page.keyboard.press('Enter');
    for (let i = 0; i < 40; i++) { await sleep(500); const ok = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => /Salta ingresso/.test(q.textContent || '')); if (x) { x.click(); return true; } return false; }); if (ok) break; }
    await page.waitForFunction(() => window.__CPM_PHASE() === 'playing' && window.__CPM_W297 && window.__CPM_W297.campo && window.__CPM_G141 && window.__CPM_G141.on, null, { timeout: 60000 });
    await page.evaluate(() => { const x = document.querySelector('[data-cpm="linguette918"] button[aria-label="Nascondi"]'); if (x) x.click(); }); await sleep(1500);
    m.d2 = await page.evaluate(LEGGI2D);
    m.d3 = await page.evaluate(() => { try { const t = window.__CPM_TIFO && window.__CPM_TIFO(); return t ? t.colori171 || { ko: 'colori171 assente' } : { ko: '__CPM_TIFO assente' }; } catch (e) { return { ko: String(e.message) }; } });
    m.nomi = await page.evaluate(() => window.__CPM_G171 && window.__CPM_G171.nomi);
    if (FOTO && coppia.po) { fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: `${FOTO}/${rosso ? 'prima' : 'dopo'}-2d-${fk}.png` });
      /* il 3D: il campo dall'alto si toglie (solo foto) e resta lo stadio caldo sotto */
      await page.evaluate(() => { const v = document.querySelector('[data-cpm="vista2d"]'); if (v) v.style.visibility = 'hidden'; }); await sleep(900);
      await page.screenshot({ path: `${FOTO}/${rosso ? 'prima' : 'dopo'}-3d-${fk}.png` });
      await page.evaluate(() => { const v = document.querySelector('[data-cpm="vista2d"]'); if (v) v.style.visibility = ''; }); }
  } catch (e) { m.ko = 'eccezione (playMatch=' + m.play + '): ' + String(e && e.message || e).slice(0, 160); }
  if (errs.length) m.ko = (m.ko || '') + ' pageerror: ' + errs.slice(0, 2).join(' | ');
  await ctx.close(); return m;
}
const low = h => String(h || '').toLowerCase();
const q = (o) => { const n = o.club + o.maglia; return { n, club: n ? o.club / n : 0 }; };
function giudica(m, clubs, coppia) {
  if (m.ko) return [m.ko]; const k = [];
  if (!m.d2 || m.d2.ko) k.push((m.d2 && m.d2.ko) || '2D non letto');
  else { const c = q(m.d2.curva), p = q(m.d2.cart);
    if (c.n < MIN_PX) k.push(`2D curva ospiti non giudicata (${c.n} px assegnati < ${MIN_PX})`); else if (c.club < SOGLIA_CLUB) k.push(`2D curva ospiti club ${(c.club * 100).toFixed(0)}% < ${SOGLIA_CLUB * 100}%`);
    if (p.n < 2) k.push(`2D cartelloni ospiti non giudicati (${p.n})`); else if (p.club < SOGLIA_CLUB) k.push(`2D cartelloni ospiti club ${(p.club * 100).toFixed(0)}% < ${SOGLIA_CLUB * 100}%`);
    if (low(m.d2.club.osp[0]) !== low(clubs[coppia.osp].c)) k.push(`testimone: club ospite ${m.d2.club.osp[0]} != ${clubs[coppia.osp].c}`); }
  if (!m.d3 || m.d3.ko) k.push('3D ' + ((m.d3 && m.d3.ko) || 'non letto'));
  else { const A = clubs[coppia.osp];
    if (low(m.d3.stadio.away) !== low(A.c)) k.push(`3D folla ospite ${m.d3.stadio.away} != club ${A.c}`);
    if (low(m.d3.scenografia.away[0]) !== low(A.c)) k.push(`3D bandiere ospiti ${m.d3.scenografia.away[0]} != club ${A.c}`);
    if (A.c2 && low(m.d3.scenografia.away[1]) !== low(A.c2)) k.push(`3D secondo colore bandiere ospiti ${m.d3.scenografia.away[1]} != club ${A.c2}`);
    if (low(m.d3.stadio.away) === low(m.d3.kit.away) && low(A.c) !== low(m.d3.kit.away)) k.push('3D folla con la maglia'); }
  return k;
}
const stampa = (r, tag, clubs, cp) => { for (const m of r) { const co = cp.find(x => m.coppia.startsWith(clubs[x.casa].a + '(') && m.coppia.includes(' v ' + clubs[x.osp].a + '('));
  const c = m.d2 && !m.d2.ko ? q(m.d2.curva) : null, p = m.d2 && !m.d2.ko ? q(m.d2.cart) : null;
  console.log(`${tag} ${m.formato.padEnd(4)} ${m.coppia.padEnd(58)} ${m.po ? 'FOTO-PO ' : ''}2D curva club ${c ? (c.club * 100).toFixed(0).padStart(3) + '% su ' + c.n + 'px' : '—'} cart club ${p ? (p.club * 100).toFixed(0) + '% su ' + p.n : '—'} | 3D folla ${m.d3 && m.d3.stadio ? m.d3.stadio.away : '—'} band ${m.d3 && m.d3.scenografia ? m.d3.scenografia.away.join('/') : '—'} | ${giudica(m, clubs, co).join(' · ') || 'OK'}`); } };

const S = await scegliCoppie();
console.log(`coppie (${S.lg}, ${S.n} club, ${S.cand} candidate giudicabili): ` + S.out.map(x => `${x.casa}-${x.osp} maglia ${x.kit} (${x.nome}) vs club ${x.c}, tribuna ${x.pk} vs ${x.pc} d=${x.d}${x.po ? ' FOTO-PO' : ''}`).join(' · '));
let esito = 0;
if (S.out.length < 3) { console.log(`❌ solo ${S.out.length} coppie con la maglia lontana dal club: non giudicato`); esito = 1; }
const giro = async (rosso) => { const r = []; for (const cp of S.out.slice(0, +(process.env.CPM_SOLO_171 || 99))) for (const fk of Object.keys(FORMATI).filter(x => !process.env.CPM_FMT_171 || x === process.env.CPM_FMT_171)) { const m = await misura(cp, S.clubs, fk, rosso); m.cp = cp; r.push(m); } return r; };
const V = await giro(false);
const R = ROSSO ? await giro(true) : [];
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true }); fs.writeFileSync(new URL('./out/tifosi-171.json', import.meta.url), JSON.stringify({ coppie: S.out, verde: V, rosso: R }, null, 1));
const kv = V.filter(m => giudica(m, S.clubs, m.cp).length);
if (ROSSO) {
  stampa(R, 'ROSSO', S.clubs, S.out);
  const r2 = R.filter(m => !m.ko && m.d2 && !m.d2.ko && q(m.d2.curva).n >= MIN_PX && q(m.d2.curva).club < 0.5);
  const r3 = R.filter(m => !m.ko && m.d3 && m.d3.scenografia && low(S.clubs[m.cp.osp].c2) !== '#f0f0f0' && low(m.d3.scenografia.away[1]) !== low(S.clubs[m.cp.osp].c2));
  if (r2.length !== R.length) { console.log(`❌ rosso: con __CPM_NO_G171 la curva ospiti 2D ha la maglia solo su ${r2.length}/${R.length} misure — il guardiano non vede la foto 191`); esito = 1; }
  else console.log(`✅ rosso: __CPM_NO_G171 rimette la maglia del giorno sulla curva ospiti 2D in ${r2.length}/${R.length} misure (foto PO compresa); bandiere 3D ospiti senza il secondo colore del club in ${r3.length}/${R.length}`);
}
stampa(V, 'VERDE', S.clubs, S.out);
if (kv.length) { console.log(`❌ verde: ${kv.length}/${V.length} misure fuori criterio`); esito = 1; } else console.log(`✅ verde: ${V.length} misure (${S.out.length} coppie x ${Object.keys(FORMATI).length} formati) — tifosi, cartelloni e folla 3D coi colori del club`);
srv.close(); await b.close(); process.exit(esito);
