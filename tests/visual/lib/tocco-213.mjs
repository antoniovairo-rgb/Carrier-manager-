/* [giro 213 · PO-475] Strumento comune di misura del TOCCO su un tasto: lo usano la sonda misura-213 e il guardiano tocco-213.
   Un tocco vero: sul telefono emulato (isMobile + hasTouch, pointer:coarse) touchStart → TIENI ms → touchEnd via CDP
   (Input.dispatchTouchEvent), su PC mouse giu' → TIENI ms → su. Il tempo zero e' il timeStamp del pointerdown (orologio
   della pagina, performance.now). Dentro la pagina un anello requestAnimationFrame legge ogni fotogramma:
     riscontro  = primo fotogramma in cui l'aspetto del tasto (transform · filter · box-shadow · sfondo · opacita' · outline)
                  differisce da quello a riposo;
     rotellina  = primo fotogramma con [data-rotella213] sul tasto;
     effetto    = primo fotogramma in cui il predicato dell'azione (stringa: corpo di funzione con `el` a disposizione) e' vero;
     layout     = offsetWidth/Height/Left/Top del tasto e rettangolo del genitore: devono restare quelli di riposo;
     area       = elementFromPoint a 2 px dai quattro bordi del rettangolo DI RIPOSO, mentre il tasto e' premuto: deve
                  restare il tasto (o un suo discendente).
   Un fotogramma che non arriva (lavoro sincrono) ritarda tutto: e' esattamente cio' che si vuole misurare.
   Event Timing (PerformanceObserver 'event'): elaborazione piu' lunga di pointerdown/pointerup/click (ms di lavoro sincrono). */
import { sleep } from './harness.mjs';

export const PREPARA = () => {
  if (window.__T213) return;
  const T = window.__T213 = { ev: [] };
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) T.ev.push({ n: e.name, s: e.startTime, ps: e.processingStart, pe: e.processingEnd, d: e.duration }); })
    .observe({ type: 'event', buffered: true, durationThreshold: 16 }); } catch (e) {}
  document.addEventListener('pointerdown', e => { if (T.el && (T.el === e.target || T.el.contains(e.target))) { if (T.t0 == null) { T.t0 = e.timeStamp; T.tg = performance.now(); T.fg = T.fot; } T.giu = (T.giu || 0) + 1; } }, true);
  document.addEventListener('click', e => { if (T.el && (T.el === e.target || T.el.contains(e.target))) { T.click = (T.click || 0) + 1; if (T.tc == null) { T.tc = e.timeStamp; T.tce = performance.now(); } } }, true);
};

/* arma la misura sul tasto trovato da `trova` (corpo di funzione che ritorna l'elemento) */
export const ARMA = ({ trova, effetto, finestra }) => {
  const T = window.__T213; let el = (new Function(trova))(); if (!el) return null;
  const vis = () => { const c = getComputedStyle(el); return [c.transform, c.filter, c.boxShadow, c.backgroundColor, c.opacity, c.outlineStyle + c.outlineColor, c.scale || ''].join('|'); };
  const lay = () => [el.offsetWidth, el.offsetHeight, el.offsetLeft, el.offsetTop].join(',');
  const par = el.parentElement; const pr = () => { if (!par) return ''; const r = par.getBoundingClientRect(); return [r.width, r.height, r.left, r.top].map(Math.round).join(','); };
  const r0 = el.getBoundingClientRect(); const riposo0 = vis(), lay00 = lay();/* prima della prova sintetica: al rilascio filtro e scala tornano con la transizione del tasto */
  /* punti a 2 px dai bordi che A RIPOSO colpiscono il tasto (un bordo coperto da altro non e' un difetto del tocco) */
  const P = [[r0.left + 2, (r0.top + r0.bottom) / 2], [r0.right - 2, (r0.top + r0.bottom) / 2], [(r0.left + r0.right) / 2, r0.top + 2], [(r0.left + r0.right) / 2, r0.bottom - 2]]
    .filter(([x, y]) => { const h = document.elementFromPoint(x, y); return !!h && (h === el || el.contains(h)); });
  const colpisce = () => P.map(([x, y]) => { const h = document.elementFromPoint(x, y); return !!h && (h === el || el.contains(h)); });
  /* prova d'area sintetica (non clicca): pointerdown → i punti di riposo colpiscono ancora il tasto? → pointercancel */
  let areaSint = null; try { el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, isPrimary: true, pointerType: 'touch' }));
    areaSint = { premuto: el.getAttribute('data-premuto213'), punti: colpisce() }; el.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }));
    el.removeAttribute('data-premuto213'); el.removeAttribute('data-pos213'); } catch (e) {}
  Object.assign(T, { el, durFot: null, tFot: null, fotEff: null, traccia: [], sostituito: 0, t0: null, tce: null, tg: null, fg: 0, fotRisc: null, dopoGestore: null, tc: null, giu: 0, click: 0, ev: [], riscontro: null, rotella: null, effetto: null, layoutMosso: false, rr: null, area: null, fot: 0,
    riposo: riposo0, lay0: lay00, punti: P.length, areaSint, layPremuto: null, par0: pr(), rect0: { l: r0.left, t: r0.top, r: r0.right, b: r0.bottom, w: r0.width, h: r0.height }, fine: false, premuto: null, txt0: document.body.innerText });
  const eff = new Function('el', effetto || 'return false');
  const t1 = performance.now(); const gettone = T.gettone = (T.gettone || 0) + 1;/* un anello per misura: quello della misura precedente si ferma */
  const giro = () => {
    if (T.gettone !== gettone) return;
    /* il tasto puo' essere sostituito da React dopo il tocco (stesso posto, nodo nuovo): si segue il tasto che sta al centro */
    if (!el.isConnected) { const h = document.elementFromPoint((r0.left + r0.right) / 2, (r0.top + r0.bottom) / 2); const b = h && h.closest ? h.closest('button,[role="button"]') : null; if (b) { el = b; T.el = b; T.sostituito = (T.sostituito || 0) + 1; } }
    const t = performance.now(); T.fot++; const tPrec = T.tFot; T.tFot = t;
    if (T.t0 != null) {
      const v = vis(); if ((T.traccia = T.traccia || []).length < 24) T.traccia.push([Math.round(t - T.t0), el.getAttribute('data-premuto213'), v === T.riposo ? '=' : 'D', el.isConnected ? 1 : 0]);
      if (T.riscontro == null && el.isConnected && v !== T.riposo) { T.riscontro = t - T.t0; T.premuto = v; T.fotRisc = T.fot - T.fg; T.dopoGestore = t - T.tg; T.durFot = tPrec == null ? null : t - tPrec; }
      if (T.rotella == null && (el.hasAttribute('data-rotella213') || el.querySelector('[data-rotella213]'))) T.rotella = t - T.t0;
      if (T.effetto == null) { let x = false; try { x = !!eff(el); } catch (e) {} if (x) { T.effetto = t - T.t0; T.fotEff = T.fot - T.fg; } }
      if (T.effetto == null && el.isConnected && v !== T.riposo && T.layPremuto == null) { T.layPremuto = lay(); if (T.layPremuto !== T.lay0) T.layoutMosso = true; }/* solo sul fotogramma premuto e prima dell'effetto: dopo, la schermata cambia di diritto */
      /* area di tocco sul fotogramma premuto, prima che l'azione cambi la schermata */
      if (T.area == null && T.effetto == null && el.isConnected && v !== T.riposo) T.area = colpisce();
    }
    if (t - t1 < (finestra || 4000)) requestAnimationFrame(giro); else T.fine = true;
  };
  requestAnimationFrame(giro);
  return { w: Math.round(r0.width), h: Math.round(r0.height), x: r0.left + r0.width / 2, y: r0.top + r0.height / 2, testo: (el.textContent || '').trim().slice(0, 40) };
};

export const LEGGI = () => { const T = window.__T213; const ev = (T.ev || []).filter(e => /pointerdown|pointerup|click|touchstart|touchend|mousedown|mouseup/.test(e.n));
  return { riscontro: T.riscontro, rotella: T.rotella, effetto: T.effetto, layoutMosso: T.layoutMosso, area: T.area, areaSint: T.areaSint, punti: T.punti, giu: T.giu, click: T.click, t0: T.t0, fot: T.fot,
    lavoro: ev.length ? Math.round(Math.max(...ev.map(e => e.pe - e.ps))) : 0, ritardoIngresso: ev.length ? Math.round(Math.max(...ev.map(e => e.ps - e.s))) : 0,
    durata: ev.length ? Math.round(Math.max(...ev.map(e => e.d))) : 0, durFot: T.durFot == null ? null : Math.round(T.durFot), fotEff: T.fotEff, traccia: T.traccia, sostituito: T.sostituito, clickElab: (T.tce == null || T.t0 == null) ? null : Math.round(T.tce - T.t0), lay0: T.lay0, layPremuto: T.layPremuto, fotRisc: T.fotRisc, dopoGestore: T.dopoGestore == null ? null : Math.round(T.dopoGestore),
    eventi: ev.map(e => `${e.n}+${Math.round(e.s - (T.t0 || 0))}:attesa${Math.round(e.ps - e.s)}/lavoro${Math.round(e.pe - e.ps)}`).join(' '), riposo: T.riposo, premuto: T.premuto }; };

/* un tocco (o due, con `doppio`: secondo tocco `pausa` ms dopo la fine del primo) al centro del tasto */
export async function tocca(page, cdp, mobile, x, y, { tieni = 80, doppio = false, pausa = 90 } = {}) {
  const uno = async () => {
    if (mobile) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, radiusX: 4, radiusY: 4, id: 1 }] });
      await sleep(tieni);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else { await page.mouse.move(x, y); await page.mouse.down(); await sleep(tieni); await page.mouse.up(); }
  };
  await uno(); if (doppio) { await sleep(pausa); await uno(); }
}

/* misura completa di un tasto: arma, tocca, aspetta la finestra (o l'effetto + margine), legge */
export async function misura(page, cdp, mobile, { trova, effetto, finestra = 3500, tieni = 80, doppio = false, pausa = 90, dopo = 600 }) {
  await page.evaluate(PREPARA);
  const info = await page.evaluate(ARMA, { trova, effetto, finestra });
  if (!info) return null;
  await sleep(450);/* la prova d'area sintetica ha appena premuto e rilasciato: si lascia finire la transizione di ritorno */
  await tocca(page, cdp, mobile, info.x, info.y, { tieni, doppio, pausa });
  const t0 = Date.now(); let r = null;
  while (Date.now() - t0 < finestra + 3000) {
    await sleep(100);
    r = await page.evaluate(LEGGI).catch(() => null);
    if (r && r.effetto != null && Date.now() - t0 > (r.effetto + dopo)) break;
    if (r && await page.evaluate(() => window.__T213.fine).catch(() => true)) break;
  }
  return { ...info, ...(r || {}) };
}
