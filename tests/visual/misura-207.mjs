#!/usr/bin/env node
/* [giro 207 PO-401] SONDA DI MISURA — «negli highlight l'eroe si muove solo avanti/indietro/destra/sinistra: anche in diagonale».
   Giro di sola misura: il gioco NON cambia. Tre parti, ognuna stampa numeri e scrive un JSON in docs/sviluppo/giro207/:
     motore  (GLB spento) — per ogni scena che concede mosse: punto dell'eroe, zona di movimento, marcatore, e per le OTTO direzioni
             (4 di oggi + 4 diagonali, diagonale sia «grezza» 2,5+2,5 sia «normalizzata» 1,77+1,77) lo stacco dal marcatore
             (__CPM_MOVEGAIN, la funzione VERA del gioco), il punto dopo il passo (clamp sulla moveZone) e xG/probabilita' del motore
             (__CPM_MOTORE_OBJ().xgPunto / probEroe) in quel punto. Poi un passo VERO da tastiera con due frecce insieme: quante mosse
             consuma, di quanto si sposta il punto logico e la mesh dell'eroe.
     tocco   (GLB spento) — 360x640 · 375x667 · 390x844 · PC 1366x768: rettangoli del D-pad, celle d'angolo vuote, tasti d'azione,
             distanze, sovrapposizioni, margine dai bordi; foto.
     3d      (GLB ACCESO, direttiva PO 29/07) — passi nelle otto direzioni (diagonali da tastiera) e canale di locomozione scelto dal
             selettore 7.518 (contatore __CPM_LOCO518) + angolo moto/orientamento della mesh dell'eroe.
   Uso: CPM_PARTE=motore,tocco,3d node misura-207.mjs   (CPM_MAXSCENE=40, CPM_SCENE3D=4,12,22,40) */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const OUT = path.join(ROOT, 'docs', 'sviluppo', 'giro207'); fs.mkdirSync(OUT, { recursive: true });
const PARTI = (process.env.CPM_PARTE || 'motore,tocco,3d').split(',');
const MAXS = +(process.env.CPM_MAXSCENE || 40);
const D = 2.5, N = +(2.5 / Math.SQRT2).toFixed(3);
/* convenzione del gioco: dx = verso la porta avversaria (▲, W), dy = verso destra (▶, D) */
const DIR8 = [['avanti', D, 0], ['avanti-destra', D, D], ['destra', 0, D], ['indietro-destra', -D, D], ['indietro', -D, 0], ['indietro-sinistra', -D, -D], ['sinistra', 0, -D], ['avanti-sinistra', D, -D]];
const TASTI = { 'avanti': ['ArrowUp'], 'indietro': ['ArrowDown'], 'destra': ['ArrowRight'], 'sinistra': ['ArrowLeft'], 'avanti-destra': ['ArrowUp', 'ArrowRight'], 'indietro-destra': ['ArrowDown', 'ArrowRight'], 'indietro-sinistra': ['ArrowDown', 'ArrowLeft'], 'avanti-sinistra': ['ArrowUp', 'ArrowLeft'] };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const mean = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : null;
const f1 = v => v == null ? '—' : (+v).toFixed(1), f3 = v => v == null ? '—' : (+v).toFixed(3);

async function apri(vp, glb, touch) {
  const ctx = await b.newContext({ viewport: vp, serviceWorkers: 'block', hasTouch: !!touch, isMobile: !!touch }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(g => { window.__CPM_GLB = g; window.__CPM_REC = true; window.__CPM_LOCO518 = {}; if (g) { window.__CPM_PIEDI_REC = 1; window.__CPM_PIEDI_EROE = 1; } }, glb);/* testimone 7.999.7: per l'eroe, a ogni fotogramma, angolo moto/sguardo del CORPO e canale di locomozione VERO (_locoName) */
  await openMatch(page, port); await sleep(800);
  return { ctx, page, errs };
}
/* scene che concedono mosse (stessa regola del gioco: maxMoves capato, D-pad non nascosto in area) */
const sceneConMosse = (page) => page.evaluate(() => { const L = []; try { for (let i = 0; i < SITUATIONS.length; i++) { const s = SITUATIONS[i];
  const mm = (typeof cappedMM === 'function') ? cappedMM(s) : s.maxMoves; if (!s.lockMovement && mm > 0 && !hideDirCursor(s)) L.push({ gi: i, mm, mz: s.moveZone, type: s.type, intent: s.intent || null }); } } catch (e) { return { err: String(e) }; } return L; });
const leggi = (page) => page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE();
  return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, ht: s && s.heroTarget, hm: s && s.hero ? { x: s.hero.x, y: s.hero.y, ry: s.hero.ry } : null, moves: window.__CPM_MOVES, dd: window.__CPM_DEFDIST ? window.__CPM_DEFDIST() : null, mk: window.__CPM_MARKER ? window.__CPM_MARKER() : null }; });

/* ================= PARTE 1: MOTORE ================= */
async function parteMotore() {
  const { ctx, page, errs } = await apri({ width: 412, height: 915 }, false);
  let lista = await sceneConMosse(page); if (!Array.isArray(lista)) { console.log('❌ elenco scene illeggibile', lista); return null; }
  const tot = lista.length; const passo = Math.max(1, Math.floor(tot / MAXS)); lista = lista.filter((_, i) => i % passo === 0).slice(0, MAXS);
  console.log(`\n== MOTORE == scene che concedono mosse: ${tot} (misurate ${lista.length})`);
  const righe = [];
  for (let k = 0; k < lista.length; k++) { const sc = lista[k];
    const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, false), sc.gi).catch(() => false); if (!ok) continue; await sleep(550);
    const pre = await leggi(page); if (!pre.ht || pre.ht.x == null) continue;
    /* le otto direzioni, analitiche ma con le funzioni VERE del gioco (nessun passo fatto) */
    const an = await page.evaluate(([dirs, n, mz, pt]) => { /* nelle scene forzate il motore della partita non nasce (si crea nel gioco fluido): se manca se ne crea uno a parte con la funzione del gioco, v2 acceso (solo lettura di xgPunto/probEroe) */
      let M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); let srcM = 'partita'; if (!M || !M.v2) { try { M = window.__M207 || (window.__M207 = creaMotorePossesso({ v2: true })); srcM = 'a-parte'; } catch (e) { M = null; srcM = 'nessuno:' + String(e).slice(0, 60); } } const out = {};
      const cl = (v, a, b) => Math.max(a, Math.min(b, v)); const z = mz || { x: [0, 100], y: [0, 100] };
      const xg = (x, y) => { try { return M && M.xgPunto ? M.xgPunto(x, y, null, 3) : null; } catch (e) { return null; } };
      const pt0 = (x, y) => { try { return M && M.probEroe ? M.probEroe({ fam: 'tiro', stat: 'tiro', x, y, stats: {} }) : null; } catch (e) { return null; } };
      const xg0 = xg(pt.x, pt.y);
      for (const [nm, dx, dy] of dirs) { const diag = dx && dy; const ndx = diag ? Math.sign(dx) * n : dx, ndy = diag ? Math.sign(dy) * n : dy;
        const g = window.__CPM_MOVEGAIN ? window.__CPM_MOVEGAIN(dx, dy) : null, gN = diag && window.__CPM_MOVEGAIN ? window.__CPM_MOVEGAIN(ndx, ndy) : g;
        const p1 = { x: cl(pt.x + dx, z.x[0], z.x[1]), y: cl(pt.y + dy, z.y[0], z.y[1]) }, p1n = { x: cl(pt.x + ndx, z.x[0], z.x[1]), y: cl(pt.y + ndy, z.y[0], z.y[1]) };
        const pr = pt0(p1.x, p1.y);
        out[nm] = { gain: g, gainN: gN, len: +Math.hypot(p1.x - pt.x, p1.y - pt.y).toFixed(2), lenN: +Math.hypot(p1n.x - pt.x, p1n.y - pt.y).toFixed(2),
          bloccato: p1.x === pt.x && p1.y === pt.y, xg: xg(p1.x, p1.y), dxg: xg0 != null ? +(xg(p1.x, p1.y) - xg0).toFixed(4) : null, pTiro: pr && isFinite(pr.p) ? +pr.p.toFixed(4) : (typeof pr === 'number' ? pr : null) }; }
      return { xg0, srcM, out }; }, [DIR8, N, sc.mz, pre.ht]);
    /* un passo VERO da tastiera: diagonale a rotazione sulle quattro, poi (se c'e' una seconda mossa) il cardinale di confronto */
    const dNm = ['avanti-destra', 'indietro-destra', 'indietro-sinistra', 'avanti-sinistra'][k % 4];
    const vero = [];
    for (const nm of (sc.mm >= 2 ? [dNm, ['avanti', 'destra', 'indietro', 'sinistra'][k % 4]] : [dNm])) {
      const a = await leggi(page); if (!(a.moves > 0)) break;
      for (const t of TASTI[nm]) await page.keyboard.down(t); await sleep(300); for (const t of TASTI[nm]) await page.keyboard.up(t);
      await sleep(1300); const c = await leggi(page);
      vero.push({ nm, dxL: +((c.ht.x - a.ht.x)).toFixed(2), dyL: +((c.ht.y - a.ht.y)).toFixed(2), mosse: (a.moves - c.moves), dd: c.dd != null && a.dd != null ? +(c.dd - a.dd).toFixed(1) : null,
        mesh: (a.hm && c.hm) ? { dx: +(c.hm.x - a.hm.x).toFixed(2), dy: +(c.hm.y - a.hm.y).toFixed(2) } : null, ph: c.ph });
      await sleep(450); }
    righe.push({ gi: sc.gi, mm: sc.mm, type: sc.type, intent: sc.intent, mz: sc.mz, pt: pre.ht, dd0: pre.dd, mk: pre.mk, ...an, vero });
  }
  /* riepilogo */
  console.log('\ndirezione            | stacco medio (grezzo/norm.) | min..max | passo bloccato dalla zona | Δx G medio (tiri) ');
  const agg = {};
  for (const [nm] of DIR8) { const g = righe.map(r => r.out[nm].gain).filter(v => v != null), gn = righe.map(r => r.out[nm].gainN).filter(v => v != null);
    const bl = righe.filter(r => r.out[nm].bloccato).length, dx = righe.map(r => r.out[nm].dxg).filter(v => v != null);
    agg[nm] = { gain: mean(g), gainN: mean(gn), min: Math.min(...g), max: Math.max(...g), bloccate: bl, n: righe.length, dxg: mean(dx), len: mean(righe.map(r => r.out[nm].len)) };
    console.log(`${nm.padEnd(20)} | ${f1(agg[nm].gain)} / ${f1(agg[nm].gainN)}`.padEnd(52) + `| ${f1(agg[nm].min)}..${f1(agg[nm].max)} | ${bl}/${righe.length} | ${agg[nm].dxg == null ? '—' : (agg[nm].dxg * 100).toFixed(2) + ' pt'} · passo medio ${f1(agg[nm].len)}u`); }
  const V = righe.flatMap(r => r.vero.map(v => ({ ...v, gi: r.gi })));
  const vd = V.filter(v => v.nm.includes('-')), vc = V.filter(v => !v.nm.includes('-'));
  const diagPiene = vd.filter(v => Math.abs(v.dxL) > 1 && Math.abs(v.dyL) > 1 && v.mosse === 1).length;
  console.log(`\npassi VERI da tastiera: diagonali ${vd.length} (di cui con x E y spostati e UNA mossa: ${diagPiene}) · cardinali ${vc.length}`);
  for (const v of V) console.log(`  gi${v.gi} ${v.nm.padEnd(18)} logico Δ(${v.dxL},${v.dyL}) mosse ${v.mosse} stacco ${v.dd} mesh Δ(${v.mesh ? v.mesh.dx + ',' + v.mesh.dy : '—'}) fase ${v.ph}`);
  fs.writeFileSync(path.join(OUT, 'motore.json'), JSON.stringify({ totScene: tot, righe, agg }, null, 1));
  console.log(`errori di pagina: ${errs.length}`); await ctx.close();
  return { tot, agg, V, diagPiene, errs: errs.length };
}

/* ================= PARTE 2: TOCCO ================= */
async function parteTocco() {
  const VPS = [['360x640', { width: 360, height: 640 }], ['375x667', { width: 375, height: 667 }], ['390x844', { width: 390, height: 844 }], ['pc1366x768', { width: 1366, height: 768 }]];
  const ris = {}; console.log('\n== TOCCO ==');
  for (const [nm, vp] of VPS) {
    const { ctx, page } = await apri(vp, false, vp.width < 800); const lista = await sceneConMosse(page);
    let m = null;
    const MMIN = +(process.env.CPM_MMIN || 1); /* CPM_MMIN=2: scene con almeno due mosse (il pad resta accanto alle giocate dopo il primo passo) */
    for (const sc of (Array.isArray(lista) ? lista : []).filter(s => s.mm >= MMIN).slice(0, 12)) {
      await page.evaluate(g => window.__CPM_FORCE_SIT(g, false), sc.gi).catch(() => {}); await sleep(900);
      m = await page.evaluate(() => { const r2 = e => { const r = e.getBoundingClientRect(); return { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
        const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
        let pads = [...document.querySelectorAll('[data-cpm="dpad"]')].filter(vis);
        if (!pads.length) { /* sul PC il D-pad non ha il marcatore data-cpm: si risale dal tasto ▲ alla sua griglia */
          const su = [...document.querySelectorAll('button')].find(e => vis(e) && ((e.getAttribute('aria-label') || e.textContent || '').trim() === '▲'));
          if (su && su.parentElement) pads = [su.parentElement]; }
        if (!pads.length) return null; const pad = pads[0];
        const grid = (getComputedStyle(pad).display === 'grid') ? pad : (pad.querySelector('div[style*="grid"]') || pad.firstElementChild);
        const tasti = [...pad.querySelectorAll('button')].map(e => ({ lab: e.getAttribute('aria-label') || e.textContent.trim(), ...r2(e) }));
        const angoli = grid ? [...grid.children].filter((c, i) => [0, 2, 6, 8].includes(i)).map(r2) : [];
        const centro = grid && grid.children[4] ? r2(grid.children[4]) : null;
        const azioni = [...document.querySelectorAll('button')].filter(e => vis(e) && !pad.contains(e)).map(e => ({ lab: (e.textContent || '').trim().slice(0, 28), ...r2(e) }))
          .filter(a => a.y + a.h > 0 && a.y < innerHeight && a.x < innerWidth);
        return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), moves: window.__CPM_MOVES, n: pads.length, pad: r2(pad), tasti, angoli, centro, azioni, vw: innerWidth, vh: innerHeight }; });
      if (m && m.tasti.length === 4) { m.gi = sc.gi; break; }
    }
    if (!m) { console.log(`${nm}: D-pad non trovato (non giudicato)`); ris[nm] = null; await ctx.close(); continue; }
    await page.screenshot({ path: path.join(OUT, `tocco-${nm}${MMIN > 1 ? '-mm' + MMIN : ''}.png`) }).catch(() => {});
    /* un TOCCO vero sul tasto ▲ (touchscreen se il contesto lo ha, altrimenti clic): la mossa scende e la scheda passa alla scelta */
    const su = m.tasti.find(t => t.lab === '▲'); let dopo = null;
    if (su) { try { if (vp.width < 800) await page.touchscreen.tap(su.x + su.w / 2, su.y + su.h / 2); else await page.mouse.click(su.x + su.w / 2, su.y + su.h / 2); } catch (e) { await page.mouse.click(su.x + su.w / 2, su.y + su.h / 2); }
      await sleep(900); dopo = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), moves: window.__CPM_MOVES,
        bottoni: [...document.querySelectorAll('button')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < innerHeight; }).map(e => { const r = e.getBoundingClientRect(); return { lab: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 26), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }) }));
      await page.screenshot({ path: path.join(OUT, `tocco-${nm}${MMIN > 1 ? '-mm' + MMIN : ''}-dopo-mossa.png`) }).catch(() => {}); }
    /* misure */
    const gap = (a, c) => { const dx = Math.max(0, Math.max(a.x, c.x) - Math.min(a.x + a.w, c.x + c.w)), dy = Math.max(0, Math.max(a.y, c.y) - Math.min(a.y + a.h, c.y + c.h)); return +Math.hypot(dx, dy).toFixed(1); };
    const over = (a, c) => a.x < c.x + c.w && c.x < a.x + a.w && a.y < c.y + c.h && c.y < a.y + a.h;
    const tmin = Math.min(...m.tasti.map(t => Math.min(t.w, t.h)));
    let gT = 1e9; for (let i = 0; i < m.tasti.length; i++) for (let j = i + 1; j < m.tasti.length; j++) gT = Math.min(gT, gap(m.tasti[i], m.tasti[j]));
    let gA = 1e9, gAlab = null, sov = 0; for (const t of m.tasti.concat(m.angoli)) for (const a of m.azioni) { const g = gap(t, a); if (g < gA) { gA = g; gAlab = a.lab; } if (over(t, a)) sov++; }
    /* diagonale nella cella d'angolo: distanza dal cardinale piu' vicino e dal tasto d'azione piu' vicino */
    let gDiagCard = 1e9; for (const c of m.angoli) for (const t of m.tasti) gDiagCard = Math.min(gDiagCard, gap(c, t));
    const bordo = { sx: m.pad.x, dx: +(m.vw - (m.pad.x + m.pad.w)).toFixed(1), giu: +(m.vh - (m.pad.y + m.pad.h)).toFixed(1) };
    const dentro = m.pad.x >= 0 && m.pad.y >= 0 && m.pad.x + m.pad.w <= m.vw && m.pad.y + m.pad.h <= m.vh;
    const cx = m.centro ? m.centro.x + m.centro.w / 2 : m.pad.x + m.pad.w / 2, cy = m.centro ? m.centro.y + m.centro.h / 2 : m.pad.y + m.pad.h / 2;
    const rCard = mean(m.tasti.map(t => Math.hypot(t.x + t.w / 2 - cx, t.y + t.h / 2 - cy))), rDiag = mean(m.angoli.map(t => Math.hypot(t.x + t.w / 2 - cx, t.y + t.h / 2 - cy)));
    const rEst = m.pad.w / 2; /* joystick: settori da 45 gradi su un cerchio grande quanto il pad */
    ris[nm] = { gi: m.gi, ph: m.ph, tasto: tmin, gapTasti: gT, gapAzione: gA, azioneVicina: gAlab, sovrapposti: sov, gapDiagCard: gDiagCard, bordo, dentro, pad: m.pad, rCard: +rCard.toFixed(1), rDiag: +rDiag.toFixed(1),
      arcoSettore8_aBordo: +(2 * Math.PI * rEst / 8).toFixed(1), arcoSettore8_aMeta: +(2 * Math.PI * rEst / 2 / 8).toFixed(1), azioni: m.azioni.length, tasti: m.tasti, angoli: m.angoli, mosse0: m.moves, dopo };
    console.log(`${nm}: gi${m.gi} fase ${m.ph} · tasto ${tmin}px · fra tasti ${gT}px · pad ${m.pad.w}x${m.pad.h} @(${m.pad.x},${m.pad.y}) · dentro lo schermo ${dentro} · bordi sx ${bordo.sx} dx ${bordo.dx} giu ${bordo.giu} · tasto d'azione piu' vicino ${gA}px («${gAlab}») · sovrapposizioni ${sov} · cella d'angolo↔cardinale ${gDiagCard}px · raggio cardinali ${rCard.toFixed(1)} diagonali ${rDiag.toFixed(1)} · settore 45° a bordo pad ${ris[nm].arcoSettore8_aBordo}px`);
    if (dopo) console.log(`   dopo un tocco su ▲: fase ${dopo.ph} · mosse ${m.moves}→${dopo.moves} · tasti a schermo: ${dopo.bottoni.map(t => t.lab + ' ' + t.w + 'x' + t.h + '@' + t.x + ',' + t.y).join(' | ')}`);
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'tocco' + (+(process.env.CPM_MMIN || 1) > 1 ? '-mm' + process.env.CPM_MMIN : '') + '.json'), JSON.stringify(ris, null, 1)); return ris;
}

/* ================= PARTE 3: 3D (GLB acceso) ================= */
async function parte3d() {
  console.log('\n== 3D (GLB acceso) ==');
  const { ctx, page, errs } = await apri({ width: 412, height: 915 }, true);
  await page.waitForFunction(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.ok; }, null, { timeout: 60000 }).catch(() => {});
  const lista = await sceneConMosse(page); const voluti = (process.env.CPM_SCENE3D || '').split(',').filter(Boolean).map(Number);
  const pool = (Array.isArray(lista) ? lista : []).filter(s => s.mm >= 2 && (!voluti.length || voluti.includes(s.gi)));
  const scelte = voluti.length ? pool : pool.filter((_, i) => i % Math.max(1, Math.floor(pool.length / 8)) === 0).slice(0, 8);
  const R = [];
  for (let k = 0; k < scelte.length; k++) { const sc = scelte[k];
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, false), sc.gi).catch(() => {}); await sleep(1500);
    for (const nm of [DIR8[(2 * k + 1) % 8][0], DIR8[(2 * k) % 8][0]]) {/* una diagonale + un cardinale per scena, a rotazione */
      const a = await leggi(page); if (!(a.moves > 0)) break;
      const c0 = await page.evaluate(() => { try { if (window.__CPM_PIEDI) window.__CPM_PIEDI.eroe = []; } catch (e) {} return JSON.stringify(window.__CPM_LOCO518 || {}); });
      for (const t of TASTI[nm]) await page.keyboard.down(t); await sleep(300); for (const t of TASTI[nm]) await page.keyboard.up(t);
      const camp = []; const t0 = Date.now();
      while (Date.now() - t0 < 3000) { const s = await page.evaluate(() => { const s = window.__CPM_STATE(); return s && s.hero ? { x: s.hero.x, y: s.hero.y, ry: s.hero.ry, t: performance.now() } : null; }); if (s) camp.push(s); await sleep(120); }
      const c1 = await page.evaluate(() => JSON.stringify(window.__CPM_LOCO518 || {}));
      /* il canale VERO dell'eroe e l'angolo misurato sul corpo (testimone __CPM_PIEDI_EROE: [1] velocita' del corpo m/s, [17] angolo, [18] canale) */
      const ero = await page.evaluate(() => { const E = (window.__CPM_PIEDI && window.__CPM_PIEDI.eroe) || []; const can = {}, ang = []; let nm = 0;
        for (const r of E) { if (!(r[1] > 0.3) || r[17] == null) continue; nm++; can[r[18]] = (can[r[18]] || 0) + 1; ang.push(r[17]); }
        return { fot: E.length, inMoto: nm, can, angMedio: ang.length ? Math.round(ang.reduce((a, b) => a + b, 0) / ang.length) : null }; });
      /* angolo moto/orientamento (stessa formula del selettore: atan2(dx_mondo, dz_mondo) - ry; dz_mondo = dy_logico*0.68) */
      const rel = []; let perc = 0;
      for (let i = 1; i < camp.length; i++) { const dxw = camp[i].x - camp[i - 1].x, dzw = (camp[i].y - camp[i - 1].y) * 0.68; const sp = Math.hypot(dxw, dzw); perc += sp;
        if (sp < 0.05) continue; const mv = Math.atan2(dxw, dzw); let r = ((mv - camp[i].ry + Math.PI * 3) % (Math.PI * 2)) - Math.PI; rel.push(r); }
      const can = rel.map(r => Math.abs(r) < 0.9 ? 'run' : Math.abs(r) > 2.35 ? 'back' : (r > 0 ? 'strL' : 'strR'));
      const conta = {}; can.forEach(c => conta[c] = (conta[c] || 0) + 1);
      const o0 = JSON.parse(c0), o1 = JSON.parse(c1); const dl = {}; for (const kk of new Set([...Object.keys(o0), ...Object.keys(o1)])) { const d = (o1[kk] || 0) - (o0[kk] || 0); if (d) dl[kk] = d; }
      const fin = camp[camp.length - 1] || {}, ini = camp[0] || {};
      R.push({ gi: sc.gi, nm, percorso: +perc.toFixed(2), dMesh: { x: +((fin.x || 0) - (ini.x || 0)).toFixed(2), y: +((fin.y || 0) - (ini.y || 0)).toFixed(2) }, campioniInMoto: rel.length, canaliStimati: conta, cambiCanale518: dl, relMedioGradi: rel.length ? +(mean(rel.map(Math.abs)) * 180 / Math.PI).toFixed(0) : null, eroe: ero });
      console.log(`  gi${sc.gi} ${nm.padEnd(18)} mesh Δ(${R.at(-1).dMesh.x},${R.at(-1).dMesh.y}) percorso ${R.at(-1).percorso} · campioni in moto ${rel.length} · |moto−sguardo| medio ${R.at(-1).relMedioGradi}° · canali stimati ${JSON.stringify(conta)} · cambi canale (518, tutti i 22) ${JSON.stringify(dl)} · EROE (corpo GLB): fotogrammi ${ero.fot}, in moto ${ero.inMoto}, angolo moto/sguardo medio ${ero.angMedio}°, canali ${JSON.stringify(ero.can)}`);
      await sleep(400);
    }
    if (k === 0) await page.screenshot({ path: path.join(OUT, '3d-glb-passo.png') }).catch(() => {});
  }
  const totLoco = await page.evaluate(() => window.__CPM_LOCO518 || {});
  console.log(`contatore canali di locomozione su tutti i 22 per tutta la prova: ${JSON.stringify(totLoco)} · errori di pagina ${errs.length}`);
  fs.writeFileSync(path.join(OUT, '3d.json'), JSON.stringify({ R, totLoco }, null, 1)); await ctx.close(); return { R, totLoco };
}

const RIS = {};
try {
  if (PARTI.includes('motore')) RIS.motore = await parteMotore();
  if (PARTI.includes('tocco')) RIS.tocco = await parteTocco();
  if (PARTI.includes('3d')) RIS['3d'] = await parte3d();
} finally { await b.close(); srv.close(); }
console.log('\nFINE misura-207');
