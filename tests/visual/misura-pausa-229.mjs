#!/usr/bin/env node
/* [giro 229 · PO-495] SONDA DI MISURA (non guardiano): pausa durante la scelta dell'highlight. Scena forzata in hl_choose, si aspetta
   ATTESA ms, si mette in pausa (tasto P, lo stesso del giocatore), si aspetta PAUSA ms, si riprende; poi si misurano
   - il timer: il setTimeout (3..20 s) che ha prodotto ActionTimeout — durata con cui e' stato riarmato alla ripresa;
   - la barra «Pressione» della scheda delle giocate (data-cpm="tempo-hl-v2"): tempo che le resta alla ripresa (getAnimations);
   e lo scarto fra l'istante in cui la barra si svuota e quello in cui il timer scatta.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node misura-pausa-229.mjs   (CPM_ROSSO=1 accende __CPM_NO_G229) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ATTESA = +(process.env.CPM_ATTESA || 5000), PAUSA = +(process.env.CPM_PAUSA || 3000);
const SONDA = () => {
  window.__T229 = [];
  const _st = window.setTimeout.bind(window);
  window.setTimeout = function (fn, d, ...a) {
    if (typeof fn !== 'function' || !(d >= 250 && d <= 20000)) return _st(fn, d, ...a);
    const rec = { d, tArm: performance.now(), tFire: null, timeout: false }; window.__T229.push(rec); if (window.__T229.length > 400) window.__T229.shift();
    return _st(function () { rec.tFire = performance.now(); const conta = () => { try { return (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).filter(e => e && (e.type === 'ActionTimeout' || e.t === 'ActionTimeout' || e.ev === 'ActionTimeout' || e.name === 'ActionTimeout')).length; } catch (e) { return 0; } };
      const n0 = conta(); try { return fn.apply(this, a); } finally { if (conta() > n0) rec.timeout = true; } }, d);
  };
};
const leggiBarra = (p) => p.evaluate(() => new Promise(res => requestAnimationFrame(() => {
  const el = document.querySelector('[data-cpm="tempo-hl-v2"]'); if (!el) return res(null);
  const L = el.getAnimations ? el.getAnimations({ subtree: true }) : []; const an = L.find(a => /cpmPress905/.test(a.animationName || '')) || L[0];
  if (!an) return res({ senza: true });
  const T = an.effect.getComputedTiming(); const dur = an.effect.getTiming().duration;
  /* il tempo rimasto si legge dal progresso: con animation-delay negativo (giro 210) endTime − currentTime non lo e' */
  const pr = T.progress == null ? (T.endTime - (an.currentTime || 0) <= 0 ? 1 : 0) : T.progress; const resto = dur * (1 - pr);
  res({ dur, progresso: pr, resto, fine: performance.now() + resto, stato: an.playState, ora: performance.now() });
}))).catch(() => null);
const fase = (p) => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
async function aspettaFase(p, f, ms) { const t = Date.now(); while (Date.now() - t < ms) { if (await fase(p) === f) return true; await sleep(60); } return false; }
export async function misuraPausa(rosso, { attesa = ATTESA, pausa = PAUSA, dd = 85 } = {}) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G229 = 1; }, rosso);
  await page.addInitScript(SONDA);
  const out = { rosso, attesa, pausa };
  try {
    await openMatch(page, port); await sleep(800);
    const gi = await page.evaluate(() => { for (let i = 0; i < SITUATIONS.length; i++) { const s = SITUATIONS[i]; if (s.lockMovement || (window.isAimSit && isAimSit(s))) continue; return i; } return -1; });
    await page.evaluate(() => { window.__T229.length = 0; });
    await page.evaluate(v => window.__CPM_DD221 && window.__CPM_DD221(v), dd);
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi);
    if (!await aspettaFase(page, 'hl_choose', 6000)) { out.ng = 'hl_choose non raggiunto'; throw new Error(out.ng); }
    const tIn = await page.evaluate(() => performance.now());
    out.barraIngresso = await leggiBarra(page);
    await sleep(attesa);
    out.barraPrimaPausa = await leggiBarra(page);
    await page.keyboard.press('p'); await sleep(300);
    out.barraPausa = await leggiBarra(page);
    out.timerPrima = await page.evaluate(() => (window.__T229 || []).map(x => ({ d: x.d, tArm: Math.round(x.tArm), tFire: x.tFire && Math.round(x.tFire) })));
    await sleep(pausa);
    await page.keyboard.press('p'); const tRip = await page.evaluate(() => performance.now()); await sleep(150);
    out.faseRipresa = await fase(page);
    out.barraRipresa = await leggiBarra(page);
    const t0 = Date.now(); let tm = null;
    while (Date.now() - t0 < 22000) { tm = await page.evaluate(() => (window.__T229 || []).filter(x => x.timeout).pop() || null).catch(() => null); if (tm) break; await sleep(100); }
    out.timer = tm;
    out.rimastoAtteso = (out.barraIngresso && out.barraIngresso.dur) ? out.barraIngresso.dur - attesa - 300 : null;/* il tempo intero meno quello passato in scelta prima della pausa (300 ms fra il tasto e la lettura) */
    if (tm) { out.timerRiarmo = { d: tm.d, dopoRipresa: Math.round(tm.tArm - tRip), scattoDopoRipresa: Math.round(tm.tFire - tRip) }; }
    if (tm && out.barraRipresa && !out.barraRipresa.senza) out.scarto = Math.round(out.barraRipresa.fine - tm.tFire);
    out.p229 = await page.evaluate(() => (window.__CPM_P229 || []).slice(-8));
    out.tIn = Math.round(tIn); out.tRip = Math.round(tRip);
  } catch (e) { out.err = String(e.message).slice(0, 160); }
  out.errs = errs.slice(0, 3);
  await b.close().catch(() => {}); srv.close();
  return out;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await misuraPausa(process.env.CPM_ROSSO === '1');
  console.log(JSON.stringify(r, null, 1));
}
