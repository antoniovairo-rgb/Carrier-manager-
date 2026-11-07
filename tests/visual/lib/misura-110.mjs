/* [giro 110 · PO-309] strumenti condivisi dal guardiano collaudo-110: apertura della carriera su un club di prova nei tre formati,
   contrasto analitico (colore del testo composto sui fondi degli antenati) e misure delle aree di tocco. Non tocca src/. */
import { startServer, launchBrowser, installCdnRoutes, sleep, SAVE, INIT, entraInCarriera } from './../c178-graf-lib.mjs';
import { saveDi, preparaCalendario, ROSSI } from './../c180-lib.mjs';
export { startServer, launchBrowser, sleep, SAVE, INIT, entraInCarriera, saveDi, preparaCalendario };
export const FORMATI = [{ k: 't360', w: 360, h: 800, touch: true }, { k: 't412', w: 412, h: 915, touch: true }, { k: 'pc', w: 1440, h: 900, touch: false }];
/* apre la pagina con la carriera del club di prova; flags = interruttori rossi accesi PRIMA del caricamento */
export async function apriCarriera(b, port, f, club, { flags = [], errs = [], anim = false } = {}) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(`${f.k} · ${String(e.message).slice(0, 140)}`));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: [...ROSSI, ...flags], save: saveDi(SAVE, club) });
  if (!anim) await page.addInitScript(() => { const s = document.createElement('style'); s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s)); });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  if (!(await entraInCarriera(page, errs))) return { ctx, page: null };
  await preparaCalendario(page, saveDi(SAVE, club));
  await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); }); await sleep(600);
  return { ctx, page };
}
/* funzioni da eseguire DENTRO la pagina (page.evaluate): serializzabili, senza chiusure */
export const IN_PAGINA = `
  window.__m110 = {
    rgb: s => (s.match(/[\\d.]+/g) || []).map(Number),
    lum: c => { const v = c.slice(0,3).map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2]; },
    cr(a, b) { const A = this.lum(a), B = this.lum(b); return (Math.max(A,B)+0.05)/(Math.min(A,B)+0.05); },
    fondo(el) { const pile = []; for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; const v = this.rgb(c); if (v.length >= 3 && (v.length < 4 || v[3] > 0)) { pile.push(v); if (v.length < 4 || v[3] >= 1) break; } }
      let base = [13,15,20]; for (let i = pile.length - 1; i >= 0; i--) { const v = pile[i], a = v.length > 3 ? v[3] : 1; base = [0,1,2].map(k => v[k]*a + base[k]*(1-a)); } return base; },
    testo(el) { const f = this.fondo(el), t = this.rgb(getComputedStyle(el).color); const a = t.length > 3 ? t[3] : 1; const tc = [0,1,2].map(k => t[k]*a + f[k]*(1-a)); return { col: getComputedStyle(el).color, fondo: 'rgb(' + f.map(Math.round).join(',') + ')', cr: +this.cr(tc, f).toFixed(2) }; },
    vis(e) { const r = e.getBoundingClientRect(), c = getComputedStyle(e); if (!(r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none')) return false; for (let p = e; p && p !== document.body; p = p.parentElement) if (parseFloat(getComputedStyle(p).opacity) < 0.05) return false; return true; }
  };`;
export async function armaMisure(page) { await page.evaluate(IN_PAGINA); }
export const premiTesto = (page, rx) => page.evaluate(([src]) => { const re = new RegExp(src); const c = [...document.querySelectorAll('button,[role=button],div,span')].filter(e => re.test((e.textContent || '').trim()) && e.getBoundingClientRect().width > 0);
  c.sort((a, b) => a.textContent.length - b.textContent.length); const t = c[0]; if (!t) return false; t.click(); return true; }, [rx.source]);
/* ── partita ── */
export const fase = p => p.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null);
export const aspettaFase = async (p, rx, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const f = await fase(p); if (f && rx.test(f)) return f; await sleep(250); } return null; };
const premiB = (page, rx) => page.evaluate(s => { const r = new RegExp(s); const x = [...document.querySelectorAll('button')].find(y => r.test((y.textContent || '').trim())); if (x) { x.click(); return true; } return false; }, rx);
/* dalla carriera aperta (apriCarriera) alla fase richiesta: 'formations' | 'walkout' | 'playing' */
export async function portaPartita(page, fino, hooks = {}) {
  for (let i = 0; i < 4; i++) { await page.evaluate(() => window.__CPM_CAREER.dismiss()); const ov = await page.evaluate(() => { for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (c.position === 'fixed' && (parseInt(c.zIndex) || 0) >= 50 && e.getBoundingClientRect().width * e.getBoundingClientRect().height > 0.5 * innerWidth * innerHeight && e.querySelector('button')) { const b = [...e.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0); if (b[0]) { b[0].click(); return true; } } } return false; }); if (!ov) break; await sleep(700); }
  await page.evaluate(() => window.__CPM_CAREER.playMatch(true)); await sleep(1500);
  if (!(await fase(page))) { await page.evaluate(() => window.__CPM_CAREER.dismiss()); await page.evaluate(() => window.__CPM_CAREER.playMatch()); }
  await aspettaFase(page, /./, 30000); await sleep(1200);
  if (fino === 'prepartita') return true;
  await premiB(page, 'Vedi le formazioni'); await sleep(1500);
  if (hooks.formations && /formations/.test(await fase(page) || '')) await hooks.formations();
  if (fino === 'formations') return /formations/.test(await fase(page) || '');
  await page.keyboard.press('Enter'); await sleep(1200); if (/formations/.test(await fase(page) || '')) { await page.keyboard.press('Enter'); await sleep(1200); }
  if (hooks.walkout && /walkout/.test(await fase(page) || '')) await hooks.walkout();
  if (fino === 'walkout') return /walkout/.test(await fase(page) || '');
  for (let i = 0; i < 40; i++) { const ok = await premiB(page, 'Salta ingresso'); if (ok) break; await sleep(500); }
  await aspettaFase(page, /^playing$/, 60000);
  await page.evaluate(() => window.__CPM_SET_NUMHL && window.__CPM_SET_NUMHL(0)); await sleep(800);
  return /playing/.test(await fase(page) || '');
}
/* porta la partita alla scelta di un highlight forzato (hl_choose) e poi la risolve (gol o parata) */
export async function portaScelta(page) {
  const gi = await page.evaluate(() => { const i = SITUATIONS.findIndex(s => s.type !== 'def' && (s.actions || []).some(a => /tir|calci/i.test(a.label || ''))); return i < 0 ? 0 : i; });
  await page.evaluate(g => { window.__CPM_FORCE_INTRO = 1; window.__CPM_FORCE_INTRO_MS = 300; window.__CPM_FORCE_SIT(g, true); }, gi);
  const ok = await aspettaFase(page, /hl_choose/, 12000); await sleep(900); return !!ok;
}
export async function risolvi(page, esito = 'gol') {
  await page.evaluate(([e]) => { window.__CPM_FORCE_OUTCOME = e === 'gol' ? 'success' : 'fail'; window.__CPM_FORCE_KIND = e === 'gol' ? 'goal' : 'saved'; window.__CPM_RESOLVE(0); }, [esito]);
  return !!(await aspettaFase(page, /hl_result/, 20000));
}
