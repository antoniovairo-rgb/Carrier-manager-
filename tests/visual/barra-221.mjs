#!/usr/bin/env node
/* [giro 221 · PO-480 + PO-486] GUARDIANO barra-221.
   A (PO-480) negli highlight dell'eroe la barra «Pressione» dura QUANTO IL TIMER VERO dell'anticipo del marcatore in hl_choose.
      Per ognuno dei tre livelli di distanza del marcatore (lontano / medio / addosso: 16 / 12 / 9 s dal 7.916) e per le due barre
      — scheda delle giocate (data-cpm="tempo-hl-v2", scena forzata in hl_choose) e scheda del movimento in hl_choose del giro 210
      (aria-label «Pressione», dopo la prima mossa col pad sul telefono) — misura:
        timer  = il setTimeout che ha davvero prodotto ActionTimeout: istante d'armo → istante in cui e' scattato (setTimeout avvolto
                 dalla sonda, identificato dall'evento ActionTimeout nato DENTRO la sua callback);
        barra  = durata dell'animazione CSS della barra (getAnimations) e istante previsto in cui si svuota.
      Giudizio: |durata barra − durata misurata del timer| ≤ 300 ms, in tutti e tre i livelli, per entrambe le barre.
   B (PO-486) tasti SPENTI: tocco (dito) e clic (mouse) su «Simula — prima vivi la settimana». Giudizio: entro il PRIMO fotogramma
      dopo il pointerdown la scritta del motivo ha un'animazione (vibrazione orizzontale: keyframe con translate; col moto ridotto solo
      colore, nessun translate), nessuna azione (settimana, weekLived, partite salvate e scheda invariati, nessun click arrivato al
      tasto, nessuna rotellina, guardia del doppio tocco invariata).
   ROSSO window.__CPM_NO_G221 (barre 9/6/4 s, tasti spenti muti): DEVE essere bocciato su A in tutti e tre i livelli e su B.
   «Non giudicato» = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node barra-221.mjs   (CPM_PARTE=verde|rosso) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { apriCarriera166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const PARTE = process.env.CPM_PARTE || 'tutto';
const TOLL = 300;
const LIVELLI = [['lontano', 85], ['medio', 40], ['addosso', 5]];

/* sonda dentro la pagina: setTimeout avvolto + lettura della barra al primo fotogramma in hl_choose */
const SONDA = () => {
  window.__T221 = [];
  const _st = window.setTimeout.bind(window);
  window.setTimeout = function (fn, d, ...a) {
    if (typeof fn !== 'function' || !(d >= 3000 && d <= 20000)) return _st(fn, d, ...a);
    const rec = { d, tArm: performance.now(), tFire: null, timeout: false }; window.__T221.push(rec); if (window.__T221.length > 400) window.__T221.shift();
    return _st(function () { rec.tFire = performance.now(); const conta = () => { try { return (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).filter(e => e && (e.type === 'ActionTimeout' || e.t === 'ActionTimeout' || e.ev === 'ActionTimeout' || e.name === 'ActionTimeout')).length; } catch (e) { return 0; } };
      const n0 = conta(); try { return fn.apply(this, a); } finally { if (conta() > n0) rec.timeout = true; } }, d);
  };
};
const leggiBarra = (p, sel) => p.evaluate((sel) => new Promise(res => requestAnimationFrame(() => {
  const el = document.querySelector(sel); if (!el) return res(null);
  const L = el.getAnimations ? el.getAnimations({ subtree: true }) : []; const an = L.find(a => /cpmPress905/.test(a.animationName || '')) || L[0];
  if (!an) return res({ senza: true });
  const T = an.effect.getComputedTiming(); const dur = an.effect.getTiming().duration;
  res({ dur, fine: performance.now() + (T.endTime - (an.currentTime || 0)), stato: an.playState });
})), sel).catch(() => null);
const fase = (p) => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
async function aspettaFase(p, f, ms) { const t = Date.now(); while (Date.now() - t < ms) { if (await fase(p) === f) return true; await sleep(60); } return false; }
async function timerScattato(p, ms) {
  const t = Date.now(); while (Date.now() - t < ms) { const r = await p.evaluate(() => (window.__T221 || []).filter(x => x.timeout).pop() || null).catch(() => null); if (r) return r; await sleep(150); }
  return null;
}

async function apri(rosso) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G221 = 1; }, rosso);
  await page.addInitScript(SONDA);
  await openMatch(page, port); await sleep(800);
  return { page, ctx, b, srv, errs };
}
const scene = (p) => p.evaluate(() => { const A = [], M = []; for (let i = 0; i < SITUATIONS.length; i++) { const s = SITUATIONS[i]; if (s.lockMovement || (window.isAimSit && isAimSit(s))) continue; const mm = cappedMM(s);
  A.push(i); if (mm >= 2 && !hideDirCursor(s)) M.push(i); } return { A, M }; });

/* A1: scheda delle giocate */
async function provaScheda(H, gi, dd) {
  const p = H.page; await p.evaluate(() => { window.__T221.length = 0; });
  await p.evaluate(v => window.__CPM_DD221(v), dd);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi);
  if (!await aspettaFase(p, 'hl_choose', 6000)) return { ng: 'hl_choose non raggiunto' };
  const dd0 = await p.evaluate(() => window.__CPM_DEFDIST());
  const bar = await leggiBarra(p, '[data-cpm="tempo-hl-v2"]');
  const tm = await timerScattato(p, 22000);
  if (!bar || bar.senza) return { ng: 'barra della scheda delle giocate assente', dd0 };
  if (!tm) return { ng: 'timer dell\'esitazione non scattato', dd0, bar };
  return { dd0, bar, tm };
}
/* A2: scheda del movimento in hl_choose (giro 210): forza in hl_move, porta il marcatore al livello, una mossa col pad */
async function provaPad(H, gi, dd) {
  const p = H.page; await p.evaluate(() => { window.__T221.length = 0; });
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi);
  if (!await aspettaFase(p, 'hl_move', 5000)) return { ng: 'hl_move non raggiunto', riapri: true };
  await p.evaluate(v => window.__CPM_DD221(v), dd); await sleep(80);
  const t = await p.evaluate(() => { const b = [...document.querySelectorAll('button[aria-label]')].find(e => e.getAttribute('aria-label') === '▶' && e.getBoundingClientRect().width > 0); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  if (!t) return { ng: 'tasto ▶ del pad assente', riapri: true };
  await p.touchscreen.tap(t.x, t.y);
  if (!await aspettaFase(p, 'hl_choose', 3000)) return { ng: 'hl_choose non raggiunto dopo la mossa', riapri: true };
  const dd0 = await p.evaluate(() => window.__CPM_DEFDIST());
  const bar = await leggiBarra(p, '[data-cpm="pressione"][aria-label="Pressione"]');
  const tm = await timerScattato(p, 22000);
  if (!bar || bar.senza) return { ng: 'barra della scheda del movimento assente (pad non rimasto?)', dd0, riapri: true };
  if (!tm) return { ng: 'timer dell\'esitazione non scattato', dd0, bar };
  return { dd0, bar, tm };
}
async function parteA(rosso) {
  const D = [], NG = [], N = []; let H = await apri(rosso);
  const S = await scene(H.page);
  const riapri = async () => { await H.b.close().catch(() => {}); H.srv.close(); H = await apri(rosso); };
  const tipi = rosso ? [['scheda delle giocate', provaScheda, S.A]] : [['scheda delle giocate', provaScheda, S.A], ['scheda del movimento', provaPad, S.M]];
  let k = 0;
  for (const [nome, fn, L] of tipi) for (const [liv, dd] of LIVELLI) {
    let r = null; for (let t = 0; t < 4; t++) { r = await fn(H, L[(k++) % L.length], dd); if (!r.ng || !r.riapri) break; await riapri(); }
    if (r.ng) { NG.push(`A ${nome} ${liv}: ${r.ng}`); continue; }
    const durT = r.tm.tFire - r.tm.tArm; const diff = r.bar.dur - durT; const fineGap = r.bar.fine - r.tm.tFire;
    N.push(`A ${nome} ${liv}: marcatore ${Math.round(r.dd0)} · timer armato ${r.tm.d} ms, scattato dopo ${Math.round(durT)} ms · barra ${Math.round(r.bar.dur)} ms (scarto ${Math.round(diff)} ms) · la barra si svuota ${Math.round(fineGap)} ms ${fineGap < 0 ? 'prima' : 'dopo'} lo scatto`);
    if (!(Math.abs(diff) <= TOLL)) D.push(`A ${nome} ${liv}: barra ${Math.round(r.bar.dur)} ms contro timer ${Math.round(durT)} ms (scarto ${Math.round(diff)} > ${TOLL})`);
  }
  if (H.errs.length) D.push('errori di pagina: ' + H.errs.slice(0, 3).join(' | '));
  await H.b.close().catch(() => {}); H.srv.close();
  return { D, NG, N };
}

/* B: tasto spento */
async function provaSpento(rosso, mobile, ridotto) {
  const D = [], NG = [], N = []; const dove = (mobile ? 'telefono' : 'PC') + (ridotto ? ' moto ridotto' : '');
  const A = await apriCarriera166({ vp: mobile ? { width: 375, height: 667 } : { width: 1366, height: 768 }, mobile, init: rosso ? { __CPM_NO_G221: 1 } : {} });
  const p = A.page; if (ridotto) await p.emulateMedia({ reducedMotion: 'reduce' });
  try {
    const b0 = await p.evaluate(() => { const b = document.querySelector('[data-cpm="simula-v2"]'); if (!b) return null; b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); const m = b.querySelector('[data-cpm="simula-motivo"]');
      return { dis: b.disabled, motivo: m ? m.textContent : null, x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    if (!b0 || !b0.dis || !/vivi la settimana/.test(b0.motivo || '')) { NG.push(`B ${dove}: «Simula — prima vivi la settimana» spento non trovato (${JSON.stringify(b0)})`); return { D, NG, N }; }
    await sleep(300);
    await p.evaluate(() => { const C = window.__CPM_CAREER; const P = C && C.snapshot ? C.snapshot() : null;
      window.__B221 = { sett: P ? P.week : null, vissuta: P ? P.weekLived : null, partite: P ? (P.matchHistory || []).length : null, txt: document.body.innerText, click: 0, rot: window.__CPM_ROT213 | 0, dop: window.__CPM_DOPPIO213 | 0, fot: null };
      const b = document.querySelector('[data-cpm="simula-v2"]'); b.addEventListener('click', () => { window.__B221.click++; });
      document.addEventListener('pointerdown', (e) => { if (!(e.target.closest && e.target.closest('[data-cpm="simula-v2"]'))) return; const t0 = performance.now();
        requestAnimationFrame(() => { const m = document.querySelector('[data-cpm="simula-motivo"]'); const L = m.getAnimations ? m.getAnimations() : [];
          const kf = L.map(a => { try { return a.effect.getKeyframes(); } catch (er) { return []; } }).flat();
          window.__B221.fot = { dt: Math.round(performance.now() - t0), anim: L.map(a => a.animationName || '?'), translate: kf.some(k => k.translate && k.translate !== '0' && k.translate !== 'none' && k.translate !== '0px'), colore: kf.some(k => k.color) }; }); }, true); });
    if (mobile) await p.touchscreen.tap(b0.x, b0.y); else await p.mouse.click(b0.x, b0.y);
    await sleep(900);
    const r = await p.evaluate(() => { const C = window.__CPM_CAREER; const P = C && C.snapshot ? C.snapshot() : null; const B = window.__B221;
      return { fot: B.fot, sett: P ? P.week : null, vissuta: P ? P.weekLived : null, partite: P ? (P.matchHistory || []).length : null, txtUguale: document.body.innerText === B.txt, click: B.click, rot: (window.__CPM_ROT213 | 0) - B.rot, dop: (window.__CPM_DOPPIO213 | 0) - B.dop, B }; });
    const f = r.fot;
    N.push(`B ${dove}: primo fotogramma dopo ${f ? f.dt : '—'} ms · animazioni ${f ? JSON.stringify(f.anim) : '—'} · translate ${f && f.translate} · colore ${f && f.colore} · settimana ${r.B.sett}→${r.sett} · vissuta ${r.B.vissuta}→${r.vissuta} · partite ${r.B.partite}→${r.partite} · testo invariato ${r.txtUguale} · click ${r.click} · rotelline ${r.rot} · doppi ${r.dop}`);
    if (!f) NG.push(`B ${dove}: fotogramma dopo il tocco non osservato`);
    else if (!f.anim.length) D.push(`B ${dove}: nessun segnale nel primo fotogramma dopo il tocco`);
    else if (ridotto ? (f.translate || !f.colore) : !f.translate) D.push(`B ${dove}: segnale sbagliato (${ridotto ? 'col moto ridotto ci vuole solo colore' : 'manca la vibrazione orizzontale'})`);
    if (r.sett !== r.B.sett || r.vissuta !== r.B.vissuta || r.partite !== r.B.partite || !r.txtUguale || r.click || r.rot || r.dop) D.push(`B ${dove}: il tocco ha fatto qualcosa (settimana/partite/testo/click/rotellina/doppio)`);
    if (r.B.sett == null) NG.push(`B ${dove}: stato della carriera non leggibile`);
    if (A.errs.length) D.push('errori di pagina: ' + A.errs.slice(0, 3).join(' | '));
  } finally { await A.b.close().catch(() => {}); A.srv.close(); }
  return { D, NG, N };
}
async function braccio(rosso) {
  console.log(`\n== ${rosso ? 'ROSSO (__CPM_NO_G221)' : 'VERDE'} ==`);
  const R = [await parteA(rosso), await provaSpento(rosso, true, false), await provaSpento(rosso, false, false)];
  if (!rosso) R.push(await provaSpento(rosso, true, true));
  const D = R.flatMap(r => r.D), NG = R.flatMap(r => r.NG), N = R.flatMap(r => r.N);
  for (const n of N) console.log('   ' + n); for (const n of NG) console.log('   ⚠️ non giudicato: ' + n); for (const d of D) console.log('   ❌ ' + d);
  return { D, NG };
}
let V = null, Rr = null; const righe = [];
if (PARTE !== 'rosso') { V = await braccio(false); righe.push(`VERDE: difetti ${V.D.length} · non giudicati ${V.NG.length} → ${V.D.length || V.NG.length ? '✗ bocciato' : '✓ promosso'}`); }
if (PARTE !== 'verde') { Rr = await braccio(true);
  const visteA = LIVELLI.every(([liv]) => Rr.D.some(d => d.startsWith(`A scheda delle giocate ${liv}:`)));
  const visteB = ['telefono', 'PC'].every(w => Rr.D.some(d => d.startsWith(`B ${w}: nessun segnale`)));
  righe.push(`ROSSO __CPM_NO_G221: barra corta vista nei tre livelli ${visteA} · tasto spento muto visto ${visteB} · non giudicati ${Rr.NG.length} → ${visteA && visteB && !Rr.NG.length ? '✓ bocciato come deve' : '✗ NON bocciato (o non giudicato)'}`);
  Rr.ok = visteA && visteB && !Rr.NG.length; }
console.log(''); for (const r of righe) console.log(r);
const ok = (!V || (!V.D.length && !V.NG.length)) && (!Rr || Rr.ok);
console.log(ok ? '✓ barra-221 VERDE' : '✗ barra-221 ROSSO');
process.exit(ok ? 0 : 1);
