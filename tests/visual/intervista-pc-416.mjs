#!/usr/bin/env node
/* [giro 416 · PO-680 «da PC l'intervista si vede male»] GUARDIANO intervista-pc-416 (non-gate).
   Foto PO 216 (sito su PC, 1895 px): la scena della sala stampa era una FASCIA in alto a tutta larghezza (tavolo piccolo,
   marchi del pannello radi e sfalsati, striscia tagliata sul bordo), la home si vedeva sotto il velo e la finestra della domanda
   galleggiava a meta' della home. Si apre l'intervista post partita (gancio di prova forceIv183, salvataggio S12, corpi accesi)
   su PC (1920x1080 · 1895x950 · 1366x768) e telefono (390x844) e si misura dai rettangoli del DOM.
   SOGLIE (dichiarate PRIMA della correzione, solo PC):
   · S1 QUOTA: la scena copre almeno il 30% dello schermo (il telefono oggi: ~31%).
   · S2 PROPORZIONI: larghezza/altezza della scena visibile fra 1,3 e 1,7 (il telefono: ~1,49).
   · S3 TAVOLO: nome sulla targa alto almeno 16 px; tavolo largo almeno il 60% della scena.
   · S4 SFONDO: nessuno dei 160 punti della griglia lascia vedere la home (copertura dello strato dell'intervista < 0,9).
   · S5 COMPOSIZIONE: la finestra della domanda sta tutta nello schermo, a non piu' di 32 px dalla scena, affiancata o sovrapposta
     per almeno il 60% dell'altro asse, e l'insieme scena+finestra e' centrato (scarti sinistra/destra e sopra/sotto <= 24 px).
   · S6 MARCHI: nessun marchio del pannello o della striscia tagliato (dalla sua riga, dalla scena o dallo schermo); il vuoto
     piu' largo fra due marchi vicini di una riga non supera la larghezza media dei marchi della riga.
   TELEFONO: le stesse misure sono stampate e devono essere IDENTICHE fra verde e rosso (telefono invariato).
   ROSSO: window.__CPM_NO_G416 = l'impaginazione di prima → ogni formato PC deve cadere. «Non giudicato» = rosso.
   Uso: node intervista-pc-416.mjs   ·   CPM_FOTO416=prima|dopo salva le foto in docs/collaudo-po/416-<tag>-<formato>.png */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const FOTO = process.env.CPM_FOTO416 || '';
const DOCS = new URL('../../docs/collaudo-po/', import.meta.url).pathname;
const FORMATI = [
  { k: 'pc1920', w: 1920, h: 1080, pc: true },
  { k: 'pc1895', w: 1895, h: 950, pc: true },
  { k: 'pc1366', w: 1366, h: 768, pc: true },
  { k: 'tel390', w: 390, h: 844, pc: false },
];
const BRACCI = (process.env.CPM_BRACCI416 || 'verde,rosso').split(',');
const S1 = 0.30, S2 = [1.3, 1.7], S3_TARGA = 16, S3_TAVOLO = 0.60, S4_COPRI = 0.9, S5_GAP = 32, S5_SOVR = 0.60, S5_CENTRO = 24, S6_VUOTO = 1.0;

function MISURA() {
  const W = innerWidth, H = innerHeight; const ov = document.querySelector('[data-cpm="intervista231"]');
  const sc = document.querySelector('[data-cpm-scena="intervista2d"]'); const card = ov && ov.querySelector('.cpm-pan150');
  if (!ov || !sc || !card) return { err: 'manca ' + (!ov ? 'intervista' : !sc ? 'scena' : 'finestra') };
  const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
  const clip = (a, b) => ({ l: Math.max(a.l, b.l), t: Math.max(a.t, b.t), r: Math.min(a.r, b.r), b: Math.min(a.b, b.b) });
  const VP = { l: 0, t: 0, r: W, b: H };
  /* la scena VISIBILE: il rettangolo della scena tagliato dallo schermo e dai contenitori che tagliano */
  let rs = clip(R(sc), VP); for (let p = sc.parentElement; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (/hidden|clip|auto|scroll/.test(cs.overflow)) rs = clip(rs, R(p)); }
  const sw = Math.max(0, rs.r - rs.l), sh = Math.max(0, rs.b - rs.t);
  const quota = sw * sh / (W * H), aspetto = sh > 0 ? sw / sh : 0;
  /* il tavolo: svg 400x130 con «meet» → larghezza disegnata = 400·min(w/400, h/130) */
  const tv = sc.querySelector('[data-cpm="tavolo24"]'); let tavolo = 0, targa = 0;
  if (tv) { const q = R(tv); const k = Math.min(q.w / 400, q.h / 130); tavolo = sw > 0 ? 400 * k / sw : 0;
    const tx = [...tv.querySelectorAll('text')].find(t => t.getAttribute('data-cpm') !== 'marchio144t' && t.closest('g') && (t.textContent || '').trim().length > 1 && t.getAttribute('font-weight') === '900' && !t.closest('g[transform^="rotate"]'));
    if (tx) targa = tx.getBoundingClientRect().height; }
  /* lo sfondo: copertura dello strato dell'intervista su 16x10 punti */
  const alpha = e => { const cs = getComputedStyle(e); if (cs.backgroundImage && cs.backgroundImage !== 'none') return 1; const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/); if (!m) return 0; const v = m[1].split(',').map(Number); return v.length > 3 ? v[3] : 1; };
  let homeVista = 0, punti = 0;
  for (let i = 0; i < 16; i++) for (let j = 0; j < 10; j++) { const x = (i + 0.5) * W / 16, y = (j + 0.5) * H / 10; punti++;
    let cop = 0; for (const e of document.elementsFromPoint(x, y)) { if (!ov.contains(e)) break; cop = 1 - (1 - cop) * (1 - alpha(e)); if (cop >= 0.999) break; }
    if (cop < 0.9) homeVista++; }
  /* la composizione: finestra + scena */
  const rc = R(card); const rsv = { l: rs.l, t: rs.t, r: rs.r, b: rs.b };
  const dentro = rc.t >= -0.5 && rc.l >= -0.5 && rc.b <= H + 0.5 && rc.r <= W + 0.5;
  const gx = Math.max(0, Math.max(rc.l, rsv.l) - Math.min(rc.r, rsv.r)), gy = Math.max(0, Math.max(rc.t, rsv.t) - Math.min(rc.b, rsv.b));
  const affiancate = gx > 0 && gy === 0; const gap = affiancate ? gx : gy;
  const sovr = affiancate ? (Math.min(rc.b, rsv.b) - Math.max(rc.t, rsv.t)) / Math.min(rc.b - rc.t, rsv.b - rsv.t) : (Math.min(rc.r, rsv.r) - Math.max(rc.l, rsv.l)) / Math.min(rc.r - rc.l, rsv.r - rsv.l);
  const u = { l: Math.min(rc.l, rsv.l), t: Math.min(rc.t, rsv.t), r: Math.max(rc.r, rsv.r), b: Math.max(rc.b, rsv.b) };
  const scartoX = Math.abs(u.l - (W - u.r)), scartoY = Math.abs(u.t - (H - u.b));
  /* i marchi: righe del pannello (non coperte dal tabellino) e striscia */
  const pan = sc.firstElementChild; const tab = sc.querySelector('[data-cpm="tabellino24"]'); const rt = tab ? R(tab) : null;
  let tagliati = 0, vuotoMax = 0, tessere = 0; const dett = [];
  for (const row of pan ? [...pan.children] : []) { if (getComputedStyle(row).display !== 'flex') continue; const rr = R(row); if (rr.h <= 0) continue;
    const coperta = rt && !(rr.b <= rt.t || rr.t >= rt.b); const ts = [...row.children].map(R).filter(q => q.w > 0).sort((a, b) => a.l - b.l); if (!ts.length) continue;
    for (const q of ts) { tessere++; const lim = clip(clip(rr, rsv), VP); if (q.l < lim.l - 0.5 || q.r > lim.r + 0.5) { tagliati++; dett.push('riga ' + Math.round(q.l) + '..' + Math.round(q.r)); } }
    if (!coperta && ts.length > 1) { const lm = ts.reduce((s, q) => s + q.w, 0) / ts.length; for (let i = 1; i < ts.length; i++) vuotoMax = Math.max(vuotoMax, (ts[i].l - ts[i - 1].r) / lm); } }
  for (const m of sc.querySelectorAll('[data-cpm="marchio142"]')) { const q = R(m); tessere++; const lim = clip(rsv, VP); if (q.l < lim.l - 0.5 || q.r > lim.r + 0.5) { tagliati++; dett.push('striscia ' + Math.round(q.l) + '..' + Math.round(q.r)); } }
  const r2 = x => Math.round(x * 1000) / 1000;
  return { W, H, scena: [Math.round(rs.l), Math.round(rs.t), Math.round(sw), Math.round(sh)], quota: r2(quota), aspetto: r2(aspetto), tavolo: r2(tavolo), targa: Math.round(targa * 10) / 10,
    homeVista, punti, finestra: [Math.round(rc.l), Math.round(rc.t), Math.round(rc.w), Math.round(rc.h)], dentro, affiancate, gap: Math.round(gap), sovr: r2(sovr), scartoX: Math.round(scartoX), scartoY: Math.round(scartoY),
    tessere, tagliati, vuotoMax: r2(vuotoMax), dett: dett.slice(0, 4), comp: !!ov.querySelector('[data-cpm="composizione416"]') };
}

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = {};
for (const br of BRACCI) {
  ris[br] = {};
  for (const f of FORMATI) {
    const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: f.pc ? 1 : 2 }; if (!f.pc) { opt.isMobile = true; opt.hasTouch = true; }
    const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = [];
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    await page.addInitScript(([s, rosso]) => { window.__CPM_GLB = true;/* verifiche percettive a corpi accesi */ if (rosso) window.__CPM_NO_G416 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, br === 'rosso']);
    let m = null, motivo = [];
    try {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
      try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(2000);
      try { await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163 && window.__CPM_CAREER.chiudi163(); }); } catch (e) {}
      await sleep(600);
      const q = await page.evaluate(() => window.__CPM_CAREER.forceIv183(0, 'win', { hs: 2, as: 1, casa: true, voto: 7.6, gol: 1 }));
      const ok = await page.waitForSelector('[data-cpm="intervista231"]', { timeout: 10000 }).then(() => true).catch(() => false);
      if (!ok) motivo.push('non giudicato (intervista non aperta: ' + JSON.stringify(q) + ')');
      else { await sleep(1800); m = await page.evaluate(MISURA);
        if (FOTO) await page.screenshot({ path: DOCS + '416-' + FOTO + '-' + (br === 'rosso' ? 'rosso-' : '') + f.k + '.png' }); }
    } catch (e) { motivo.push('non giudicato (' + String(e.message).slice(0, 120) + ')'); }
    if (errs.length) motivo.push('errori di pagina: ' + errs.slice(0, 2).join(' | '));
    if (m && m.err) motivo.push('non giudicato (' + m.err + ')');
    else if (m && f.pc) {
      if (!(m.quota >= S1)) motivo.push(`S1 scena al ${Math.round(m.quota * 100)}% dello schermo (< ${S1 * 100}%)`);
      if (!(m.aspetto >= S2[0] && m.aspetto <= S2[1])) motivo.push(`S2 proporzioni ${m.aspetto} fuori da ${S2[0]}..${S2[1]}`);
      if (!(m.targa >= S3_TARGA)) motivo.push(`S3 nome sulla targa alto ${m.targa} px (< ${S3_TARGA})`);
      if (!(m.tavolo >= S3_TAVOLO)) motivo.push(`S3 tavolo al ${Math.round(m.tavolo * 100)}% della scena (< ${S3_TAVOLO * 100}%)`);
      if (m.homeVista > 0) motivo.push(`S4 home visibile in ${m.homeVista}/${m.punti} punti`);
      if (!m.dentro) motivo.push('S5 finestra fuori dallo schermo ' + JSON.stringify(m.finestra));
      if (!(m.gap <= S5_GAP)) motivo.push(`S5 finestra a ${m.gap} px dalla scena (> ${S5_GAP})`);
      if (!(m.sovr >= S5_SOVR)) motivo.push(`S5 finestra e scena allineate solo al ${Math.round(m.sovr * 100)}%`);
      if (m.scartoX > S5_CENTRO || m.scartoY > S5_CENTRO) motivo.push(`S5 composizione non centrata (scarti ${m.scartoX}/${m.scartoY} px)`);
      if (m.tagliati > 0) motivo.push(`S6 ${m.tagliati} marchi tagliati ${JSON.stringify(m.dett)}`);
      if (!(m.vuotoMax <= S6_VUOTO)) motivo.push(`S6 vuoto fra i marchi ${m.vuotoMax} x la loro larghezza (> ${S6_VUOTO})`);
    }
    ris[br][f.k] = { m, motivo };
    console.log(`[${br}] ${f.k}: ${JSON.stringify(m)}${motivo.length ? '\n    → ' + motivo.join(' · ') : ''}`);
    await ctx.close();
  }
}
await b.close(); srv.close();
if (process.env.CPM_SOLO_MISURA416) process.exit(0);
const g = [];
for (const f of FORMATI.filter(x => x.pc)) {
  const v = ris.verde && ris.verde[f.k], r = ris.rosso && ris.rosso[f.k];
  if (v && v.motivo.length) g.push(`verde ${f.k}: ${v.motivo.join(' · ')}`);
  if (r && (!r.m || r.m.err)) g.push(`rosso ${f.k}: non giudicato (${r.motivo.join(' · ')})`);
  else if (r && !r.motivo.length) g.push(`rosso ${f.k}: il difetto non si vede (__CPM_NO_G416 passa tutte le soglie)`);
}
const tv = ris.verde && ris.verde.tel390, tr = ris.rosso && ris.rosso.tel390;
if (tv && tr) { const imp = x => x && x.m && !x.m.err ? JSON.stringify({ ...x.m, dett: undefined }) : null;
  if (!imp(tv) || !imp(tr)) g.push('telefono: non giudicato ' + JSON.stringify([tv.motivo, tr.motivo]));
  else if (imp(tv) !== imp(tr)) g.push('telefono cambiato: verde ' + imp(tv) + ' · rosso ' + imp(tr)); }
if (g.length) { console.log('❌ intervista-pc-416'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ intervista-pc-416 verde: su PC (1920x1080 · 1895x950 · 1366x768) scena e domanda composte, sfondo coperto, tavolo leggibile, marchi interi; telefono identico al rosso; il rosso __CPM_NO_G416 cade su ogni formato PC');
