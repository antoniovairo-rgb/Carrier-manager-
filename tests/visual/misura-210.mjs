#!/usr/bin/env node
/* [giro 210 PO-401/PO-471] SONDA DI MISURA (non guardiano). Due parti:
     foto    — 360x640 · 375x667 · 390x844 (tocco) e PC 1366x768: scena con >=2 mosse in hl_move (foto «mossa»), un tocco su ▲, foto
               «dopo-mossa» (sul telefono: prima del giro 210 il pad spariva, dopo resta). Uscita docs/sviluppo/giro210/<etichetta>-*.png.
     tocchi  — rischio dei 4 px fra tasti vicini: per ogni tasto del pad, punti a distanza r dal centro (16 angoli) e tocchi con errore
               gaussiano (sigma 4/6/8 px, 1000 per tasto, seme fisso); per ogni punto quale tasto lo riceve (document.elementFromPoint,
               lo stesso bersaglio di pointerdown). Conta: tasto giusto · tasto SBAGLIATO (un vicino) · a vuoto (fessura o fuori pad).
               Una parte dei punti e' rifatta con tocchi VERI (touchscreen.tap) per verificare che elementFromPoint dica il vero.
   Uso: CPM_ETICHETTA=prima|dopo CPM_PARTE=foto,tocchi node misura-210.mjs  (CPM_ROSSO=1 accende __CPM_NO_G210) */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ET = process.env.CPM_ETICHETTA || 'dopo', PARTI = (process.env.CPM_PARTE || 'foto,tocchi').split(','), ROSSO = !!process.env.CPM_ROSSO;
const OUT = process.env.CPM_OUT || path.join(ROOT, 'docs', 'sviluppo', 'giro210'); fs.mkdirSync(OUT, { recursive: true });
const VPS = [['360x640', { width: 360, height: 640 }], ['375x667', { width: 375, height: 667 }], ['390x844', { width: 390, height: 844 }], ['pc1366x768', { width: 1366, height: 768 }]];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = { etichetta: ET, foto: {}, tocchi: {} };
async function apri(vp, touch) {
  const ctx = await b.newContext({ viewport: vp, serviceWorkers: 'block', hasTouch: !!touch, isMobile: !!touch }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G210 = 1; }, ROSSO);
  await openMatch(page, port); await sleep(800); return { ctx, page };
}
const scena = async (page) => { const L = await page.evaluate(() => { const L = []; for (let i = 0; i < SITUATIONS.length; i++) { const s = SITUATIONS[i]; const mm = cappedMM(s); if (!s.lockMovement && mm >= 2 && !hideDirCursor(s)) L.push(i); } return L; });
  for (const gi of L.slice(0, 4)) { await page.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {}); for (let i = 0; i < 40; i++) { if (await page.evaluate(() => window.__CPM_PHASE()) === 'hl_move') break; await sleep(150); } await sleep(700);
    if (await page.evaluate(() => window.__CPM_PHASE() === 'hl_move' && window.__CPM_MOVES >= 2)) return gi; } return null; };
const tasti = (page) => page.evaluate(() => [...document.querySelectorAll('button')].filter(e => /^[▲▼◀▶◤◥◣◢]$/.test(e.getAttribute('aria-label') || (e.textContent || '').trim())).map(e => { const r = e.getBoundingClientRect(); return { lab: e.getAttribute('aria-label') || (e.textContent || '').trim(), x: r.left, y: r.top, w: r.width, h: r.height }; }).filter(t => t.w > 0));/* nel commit base i tasti del PC non hanno aria-label: si riconoscono dal testo */

const _VISTE = (process.env.CPM_VISTE || '').split(',').filter(Boolean);
for (const [nm, vp] of VPS.filter(([n]) => !_VISTE.length || _VISTE.some(v => n.startsWith(v) || n === 'pc' + v + 'x768'))) { const tel = vp.width < 800;
  const P = await apri(vp, tel); let { ctx, page } = P;
  /* le scene forzate non riazzerano la barra della pressione (solo startHL lo fa): dopo qualche secondo cumulato entrano a tempo scaduto e
     scena() non trova piu' hl_move. Allora si riapre la pagina (limite dello strumento, non del gioco). */
  const scenaR = async () => { let g = await scena(page); if (g == null) { await ctx.close().catch(() => {}); ({ ctx, page } = await apri(vp, tel)); g = await scena(page); } return g; };
  const gi = await scena(page);
  if (gi == null) { console.log(`${nm}: nessuna scena (non misurato)`); await ctx.close(); continue; }
  const T = await tasti(page);
  if (PARTI.includes('foto')) {
    await page.screenshot({ path: path.join(OUT, `${ET}-${nm}-mossa.png`) });
    const su = T.find(t => t.lab === '▲'); if (su) { if (tel) await page.touchscreen.tap(su.x + su.w / 2, su.y + su.h / 2); else await page.mouse.click(su.x + su.w / 2, su.y + su.h / 2); }
    await sleep(900); await page.screenshot({ path: path.join(OUT, `${ET}-${nm}-dopo-mossa.png`) });
    const d = await page.evaluate(() => ({ ph: window.__CPM_PHASE(), moves: window.__CPM_MOVES, pad: [...document.querySelectorAll('button')].filter(e => /^[▲▼◀▶◤◥◣◢]$/.test(e.getAttribute('aria-label') || (e.textContent || '').trim()) && e.getBoundingClientRect().width > 0).length, scelte: !!document.querySelector('[data-cpm="scelte"]') }));
    ris.foto[nm] = { gi, tasti: T.length, dopo: d };
    console.log(`${nm}: gi${gi} · tasti del pad ${T.length} · dopo un tocco su ▲: fase ${d.ph} · mosse ${d.moves} · tasti a schermo ${d.pad} · scheda giocate ${d.scelte}`);
  }
  if (PARTI.includes('tocchi') && tel) {
    if (PARTI.includes('foto')) { await scenaR(); }
    const T2 = await tasti(page);
    /* classificazione di un punto: quale tasto del pad lo riceve */
    const classifica = (pts) => page.evaluate((pts) => pts.map(([x, y]) => { const e = document.elementFromPoint(x, y); const btn = e && e.closest && e.closest('button[aria-label]'); const l = btn && btn.getAttribute('aria-label'); return /^[▲▼◀▶◤◥◣◢]$/.test(l || '') ? l : null; }), pts);
    const R = [0, 6, 10, 14, 18, 20, 22, 24, 26, 30], sweep = {};
    for (const r of R) { let giusto = 0, sbagliato = 0, vuoto = 0;
      for (const t of T2) { const cx = t.x + t.w / 2, cy = t.y + t.h / 2; const pts = []; for (let a = 0; a < 16; a++) pts.push([cx + r * Math.cos(a * Math.PI / 8), cy + r * Math.sin(a * Math.PI / 8)]);
        const c = await classifica(pts); for (const l of c) { if (l === t.lab) giusto++; else if (l) sbagliato++; else vuoto++; } }
      const n = giusto + sbagliato + vuoto; sweep[r] = { giusto: +(100 * giusto / n).toFixed(1), sbagliato: +(100 * sbagliato / n).toFixed(1), vuoto: +(100 * vuoto / n).toFixed(1) }; }
    /* errore gaussiano (Box-Muller su un generatore a seme fisso) */
    let s = 20210; const rnd = () => { s = (s * 1103515245 + 12345) >>> 0; return (s + 0.5) / 4294967296; };
    const gauss = {};
    for (const sig of [4, 6, 8]) { let giusto = 0, sbagliato = 0, vuoto = 0; const perTasto = {};
      for (const t of T2) { const cx = t.x + t.w / 2, cy = t.y + t.h / 2; const pts = []; for (let i = 0; i < 1000; i++) { const u1 = rnd(), u2 = rnd(); const m = Math.sqrt(-2 * Math.log(u1)); pts.push([cx + sig * m * Math.cos(2 * Math.PI * u2), cy + sig * m * Math.sin(2 * Math.PI * u2)]); }
        const c = await classifica(pts); let sb = 0; for (const l of c) { if (l === t.lab) giusto++; else if (l) { sbagliato++; sb++; } else vuoto++; } perTasto[t.lab] = +(sb / 10).toFixed(1); }
      const n = giusto + sbagliato + vuoto; gauss[sig] = { giusto: +(100 * giusto / n).toFixed(1), sbagliato: +(100 * sbagliato / n).toFixed(1), vuoto: +(100 * vuoto / n).toFixed(1), sbagliatoPerTasto: perTasto }; }
    /* verifica con tocchi VERI: punti a 20 e 24 px verso il vicino, il testimone __CPM_PASSO210 (o la mossa) dice quale direzione e' partita */
    const ver = []; const atteso = (x, y) => classifica([[x, y]]).then(r => r[0]);
    for (const [lab, dx, dy] of [['◥', -1, 0], ['◥', 0, 1], ['▲', 1, 0], ['▶', 0, -1]]) for (const r of [20, 24]) {
      if (await scenaR() == null) continue; const T3 = await tasti(page); const t = T3.find(q => q.lab === lab); if (!t) continue;
      const x = t.x + t.w / 2 + dx * r, y = t.y + t.h / 2 + dy * r; const at = await atteso(x, y);
      const n0 = await page.evaluate(() => (window.__CPM_PASSO210 || []).length); const m0 = await page.evaluate(() => window.__CPM_MOVES);
      await page.touchscreen.tap(x, y); await sleep(600);
      const q = await page.evaluate(() => { const P = window.__CPM_PASSO210 || []; return { n: P.length, u: P[P.length - 1] || null, m: window.__CPM_MOVES }; });
      const dir = q.n > n0 && q.u ? (q.u.dx > 0.1 ? 'avanti' : q.u.dx < -0.1 ? 'indietro' : '') + (q.u.dy > 0.1 ? '-destra' : q.u.dy < -0.1 ? '-sinistra' : '') : (q.m < m0 ? 'mossa senza testimone' : 'nessun passo');
      ver.push({ lab, r, verso: dx ? (dx < 0 ? 'sinistra' : 'destra') : (dy < 0 ? 'su' : 'giu'), atteso: at, partito: dir }); }
    /* TOCCHI VERI sulla linea fra il centro di un tasto diagonale e quello di un cardinale vicino (d px dal centro della diagonale; il bordo
       del tasto e' a 22 px, la fessura fra 22 e 26): quale direzione parte davvero. Chrome corregge il bersaglio di un tocco verso il tasto
       piu' vicino, quindi elementFromPoint (sopra) dice «a vuoto» dove il dito fa partire comunque un tasto: qui si misura il dito. */
    const linea = []; const VIC = { '◤': ['▲', '◀'], '◥': ['▲', '▶'], '◣': ['▼', '◀'], '◢': ['▼', '▶'] }; const DD = [16, 18, 20, 22, 24, 26, 28, 30];
    const nomeDir = (u) => { if (!u) return null; const a = Math.round(Math.atan2(u.dy, u.dx) * 180 / Math.PI); return { '0': '▲', '45': '◥', '90': '▶', '135': '◢', '180': '▼', '-180': '▼', '-135': '◣', '-90': '◀', '-45': '◤' }[String(a)] || ('?' + a); };
    if (T2.some(t => t.lab === '◥')) for (const dg of Object.keys(VIC)) for (const vc of VIC[dg]) for (const dd of DD) {
      let st = await page.evaluate(() => ({ m: window.__CPM_MOVES, ph: window.__CPM_PHASE() }));
      let T3 = await tasti(page); if (!(st.m > 0) || T3.length < 8) { if (await scenaR() == null) continue; T3 = await tasti(page); }
      const a = T3.find(q => q.lab === dg), c = T3.find(q => q.lab === vc); if (!a || !c) continue;
      const ax = a.x + a.w / 2, ay = a.y + a.h / 2, cx = c.x + c.w / 2, cy = c.y + c.h / 2, L = Math.hypot(cx - ax, cy - ay);
      const x = ax + (cx - ax) / L * dd, y = ay + (cy - ay) / L * dd; const at = (await classifica([[x, y]]))[0];
      const n0 = await page.evaluate(() => (window.__CPM_PASSO210 || []).length);
      await page.touchscreen.tap(x, y); await sleep(450);
      const q = await page.evaluate(() => { const P = window.__CPM_PASSO210 || []; return { n: P.length, u: P[P.length - 1] || null }; });
      linea.push({ da: dg, verso: vc, d: dd, punto: at || null, partito: q.n > n0 ? nomeDir(q.u) : null }); }
    const riass = {}; for (const r of linea) { const k = r.d; riass[k] = riass[k] || { n: 0, diag: 0, card: 0, nulla: 0 }; riass[k].n++; if (r.partito === r.da) riass[k].diag++; else if (r.partito === r.verso) riass[k].card++; else if (!r.partito) riass[k].nulla++; }
    ris.tocchi[nm] = { sweep, gauss, verifica: ver, linea, lineaRiassunto: riass };
    if (linea.length) console.log(`${nm} tocchi VERI sulla linea diagonale→cardinale (8 coppie): ` + DD.map(d => riass[d] ? `${d}px: diagonale ${riass[d].diag}/${riass[d].n} · cardinale ${riass[d].card} · niente ${riass[d].nulla}` : `${d}px: —`).join(' | '));
    console.log(`${nm} tocchi — a distanza r dal centro del tasto (16 angoli × ${T2.length} tasti): ` + R.map(r => `r${r}: giusto ${sweep[r].giusto}% sbagliato ${sweep[r].sbagliato}% a vuoto ${sweep[r].vuoto}%`).join(' · '));
    console.log(`${nm} tocchi — errore gaussiano: ` + [4, 6, 8].map(g => `σ${g}px: giusto ${gauss[g].giusto}% sbagliato ${gauss[g].sbagliato}% a vuoto ${gauss[g].vuoto}% (sbagliato per tasto ${JSON.stringify(gauss[g].sbagliatoPerTasto)})`).join(' · '));
    console.log(`${nm} verifica con tocchi veri: ` + ver.map(v => `${v.lab} r${v.r} verso ${v.verso}: atteso ${v.atteso || 'a vuoto'} · partito ${v.partito}`).join(' | '));
  }
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, `misura-${ET}${_VISTE.length ? '-' + _VISTE.join('-') : ''}.json`), JSON.stringify(ris, null, 1));
await b.close(); srv.close(); console.log('FINE misura-210');
