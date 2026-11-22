#!/usr/bin/env node
/* [giro 318 · PO-605] GUARDIANO testi-318 — `npm run testi-318`. Due testi decisi dal PO:
     1. riga AvvisoSalienti290 (finestra della settimana): «Vuoi giocare solo i momenti salienti? Lo scegli nel pre-partita»
     2. ultimo tasto della serata di presentazione: «🎉 Si comincia! →»
   Gioca, non legge il sorgente: telefono 360x800 (deviceScaleFactor 2), carriera vera, finestra della settimana da titolare
   (apriPartita), poi la serata aperta all'ultimo passo (apriPresentazione). Per ciascun testo:
     - TESTO     esattamente quello del PO, una volta sola, visibile;
     - MISURA    a 360 px dentro lo schermo e dentro la sua scatola (niente taglio), al massimo DUE righe, nessuno scorrimento orizzontale.
   Rosso window.__CPM_NO_G318 = i due testi vecchi: il controllo TESTO deve cadere su entrambi, con l'elemento trovato (giudicato).
   «Non giudicato» (elemento non trovato) = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node testi-318.mjs   (CPM_FOTO=1 scrive le foto in docs/sviluppo/giro318/) */
import fs from 'node:fs';
import { apriCarriera166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const FOTO = process.env.CPM_FOTO ? '../../docs/sviluppo/giro318' : null; if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const VP = { width: 360, height: 800 }; const J = x => JSON.stringify(x);
const NUOVO = { avviso: 'Vuoi giocare solo i momenti salienti? Lo scegli nel pre-partita', tasto: '🎉 Si comincia! →' };
const VECCHIO = { avviso: 'Nella pre-partita puoi giocare solo i momenti salienti', tasto: '🎉 Che la stagione cominci →' };

/* misura di un elemento: testo, bordi, taglio, numero di righe (altezza / interlinea) */
const MISURA = (els) => els.filter(e => e.offsetParent !== null).map(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
  /* righe: si contano i rettangoli dei nodi di testo (le righe davvero disegnate) */
  const rg = document.createRange(); rg.selectNodeContents(e); const tops = new Set([...rg.getClientRects()].filter(q => q.width > 0.5).map(q => Math.round(q.top)));
  return { t: (e.textContent || '').trim().replace(/\s+/g, ' '), l: Math.round(r.left), r: Math.round(r.right), w: e.scrollWidth, cw: e.clientWidth, h: e.scrollHeight, ch: e.clientHeight,
    righe: tops.size, lh: Math.round(lh), scorre: document.documentElement.scrollWidth > window.innerWidth + 1, vw: window.innerWidth }; });

async function settimana(page, W) {
  await page.evaluate((w) => { const C = window.__CPM_CAREER, p = C.snapshot(); const o = (p.calendar || []).find(m => m.week === w && !m.type);
    C.patch({ week: w, weekLived: false, nationsCupQueue: null, euroMondiale: null, calendar: [...(p.calendar || []).filter(m => m.week !== w), { ...o, matchday: 996, played: false, result: null }] }); }, W);
  for (let i = 0; i < 25; i++) { const ok = await page.evaluate((w) => { const C = window.__CPM_CAREER; return !!C.thisWeekMd() && C.snapshot().week === w; }, W).catch(() => false); if (ok) break; await sleep(200); }
}

async function braccio(rosso) {
  const A = await apriCarriera166({ init: rosso ? { __CPM_NO_G318: true } : {}, nome: 'Collaudo Testi 318', reseed: 4318, vp: VP, mobile: true });
  const O = { avviso: null, tasto: null, err: null }; const tag = rosso ? 'rosso' : 'verde';
  try {
    if (!A.W) throw new Error('nessuna settimana con giornata di lega');
    await settimana(A.page, A.W);
    await A.page.evaluate(() => window.__CPM_CAREER.apriPartita('starter')); await sleep(1000);
    O.avviso = await A.page.evaluate(`(${MISURA.toString()})([...document.querySelectorAll('[data-cpm="partita23"] [data-cpm="avviso-290"]')])`);
    if (FOTO) await A.page.screenshot({ path: `${FOTO}/${tag}-finestra-settimana.png` });
    await A.page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} }); await sleep(500);
    await A.page.evaluate(() => window.__CPM_CAREER.apriPresentazione(99)); await sleep(1500);
    O.tasto = await A.page.evaluate(`(${MISURA.toString()})([...document.querySelectorAll('button')].filter(b => /cominci/i.test(b.textContent || '')))`);
    if (FOTO) await A.page.screenshot({ path: `${FOTO}/${tag}-serata-ultimo-tasto.png` });
  } catch (e) { O.err = String(e.message).slice(0, 180); }
  O.errs = A.errs.slice(0, 3); await A.b.close().catch(() => {}); A.srv.close();
  return O;
}
function giudica(O, atteso) {
  const out = [];
  for (const k of ['avviso', 'tasto']) { const m = O[k];
    const ng = !m || !m.length ? `NON GIUDICATO: elemento non trovato ${O.err || ''}` : '';
    out.push({ k: `${k}: testo`, giud: !ng, ok: !ng && m.length === 1 && m[0].t === atteso[k], info: ng || J(m.map(x => x.t)) });
    out.push({ k: `${k}: a 360 px senza tagli, al massimo 2 righe`, giud: !ng, ok: !ng && m.length === 1 && m[0].l >= 0 && m[0].r <= m[0].vw && m[0].w <= m[0].cw + 1 && m[0].h <= m[0].ch + 1 && m[0].righe >= 1 && m[0].righe <= 2 && !m[0].scorre,
      info: ng || J(m.map(x => ({ l: x.l, r: x.r, w: x.w, cw: x.cw, h: x.h, ch: x.ch, righe: x.righe, scorre: x.scorre }))) });
  }
  out.push({ k: 'errori di pagina', giud: true, ok: !(O.errs || []).length && !O.err, info: J([O.errs, O.err]) });
  return out;
}
const V = giudica(await braccio(false), NUOVO);
const Rr = await braccio(true); const R = giudica(Rr, NUOVO);
/* rosso: entrambi gli elementi trovati, il testo NUOVO cade su entrambi e c'e' il testo vecchio */
const rossoOk = R[0].giud && R[2].giud && !R[0].ok && !R[2].ok && Rr.avviso[0] && Rr.avviso[0].t === VECCHIO.avviso && Rr.tasto[0] && Rr.tasto[0].t === VECCHIO.tasto;
const verdeOk = V.every(x => x.ok);
const st = (t, L) => { console.log(t); for (const x of L) console.log(`  ${x.ok ? '✓' : '✗'} ${x.k} — ${x.info}`); };
st('braccio VERDE', V); st('braccio ROSSO (__CPM_NO_G318)', R);
console.log(`VERDE: ${verdeOk ? 'PASSA' : 'NON PASSA'}`);
console.log(`ROSSO: ${rossoOk ? 'CADE (come deve): tornano i due testi vecchi' : 'NON CADE come deve — il guardiano e\' cieco'}`);
process.exit(verdeOk && rossoOk ? 0 : 1);
