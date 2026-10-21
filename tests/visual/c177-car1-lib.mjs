/* Collaudo 177 carriera 1 — libreria comune: apre il gioco a 412x915, foto, testo, registro */
import { startServer, launchBrowser, installCdnRoutes, sleep, clickByText } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
export { sleep, clickByText };
export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
export const FOTO = path.join(ROOT, 'docs/collaudi/foto-carriera-177-1');
export const DATI = path.join(ROOT, 'docs/collaudi/dati-carriera-177-1');
export async function apri({ save = null, glb = false, test = true } = {}) {
  const srv = await startServer(ROOT); const port = srv.address().port; const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push('PAGEERROR ' + String(e.message).slice(0, 300)));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 300)); });
  await page.addInitScript(([s, g]) => { if (!g) window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (s) { for (const k of Object.keys(s)) localStorage.setItem(k, s[k]); } }, [save, glb]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${test ? '?cpmtest=1' : ''}`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500);
  return { srv, b, ctx, page, errs, close: async () => { await b.close(); srv.close(); } };
}
export const shot = async (page, name) => { const f = path.join(FOTO, name + '.png'); await page.screenshot({ path: f }); return f; };
export const testo = page => page.evaluate(() => document.body.innerText);
export const snap = page => page.evaluate(() => window.__CPM_CAREER && window.__CPM_CAREER.snapshot());
export const dumpLS = page => page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
export const log = (obj) => fs.appendFileSync(path.join(DATI, 'registro.jsonl'), JSON.stringify(obj) + '\n');
export const dif = (obj) => fs.appendFileSync(path.join(DATI, 'difetti-grezzi.jsonl'), JSON.stringify(obj) + '\n');

/* ---- giocatore di partita dal vivo ---- */
const FISSI = /^(⏸|▶|1×|1,5×|2×|⚠️|Statistiche|Pagelle|▴|▾|⚙️|🔊|🔇)/;
export async function leggiMatch(page) {
  return page.evaluate(() => {
    const ph = window.__CPM_PHASE ? window.__CPM_PHASE() : null;
    const btns = [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => (b.textContent || '').trim());
    const txt = document.body.innerText;
    const m = txt.match(/(\d+)[–-](\d+)\n?\s*(\d+)'/) || null;
    return { ph, btns, txt };
  });
}
/* Gioca una partita viva fino al fischio finale e oltre (post-partita non incluso).
   politica: funzione (n, scelte[]) -> indice. Ritorna elenco di highlight registrati. */
export async function giocaPartita(page, { politica, tag, maxMs = 900000, foto = 0, onHL } = {}) {
  const hls = []; const t0 = Date.now(); let n = 0; let ultimoFine = null;
  let stallo = 0, ultimaChiave = '', nMove = 0;
  while (Date.now() - t0 < maxMs) {
    const st = await page.evaluate(() => {
      const ph = window.__CPM_PHASE ? window.__CPM_PHASE() : null;
      const btns = [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => (b.textContent || '').trim());
      return { ph, btns, txt: document.body.innerText.slice(0, 1800) };
    });
    const chiave = st.ph + '|' + st.btns.join(',');
    if (st.ph === 'hl_move') {
      if (foto && nMove < foto) { await shot(page, `${tag}-move${nMove}`); }
      nMove++;
      const bt = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => (b.textContent || '').trim()));
      /* una mossa con le frecce ogni tanto, poi Scegli */
      if (nMove % 2 === 0) { const fr = bt.find(t => /^[←→↑↓⬅➡⬆⬇]/.test(t)); if (fr) { await page.evaluate(f => { const b = [...document.querySelectorAll('button')].find(b => b.offsetParent && (b.textContent || '').trim() === f); if (b) b.click(); }, fr); await sleep(900); } }
      await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.offsetParent && /^Scegli/.test((b.textContent || '').trim())); if (b) b.click(); });
      await sleep(700); continue;
    }
    if (st.ph === 'hl_choose') {
      const sc = st.btns.filter(b => !FISSI.test(b));
      if (sc.length) {
        const i = politica ? politica(n, sc, st.txt) : 0;
        const scena = await page.evaluate(() => window.__CPM_STATE ? (() => { const s = window.__CPM_STATE(); return { ball: s.ball && { x: s.ball.x, y: s.ball.y }, hero: s.hero && { x: s.hero.x, y: s.hero.y } }; })() : null).catch(() => null);
        const rec = { n, min: (st.txt.match(/(\d+)'/) || [])[1], scena: st.txt.split('\n').slice(0, 14).join(' / ').slice(0, 500), scelte: sc, scelta: sc[i], posPrima: scena };
        if (foto && n < foto) await shot(page, `${tag}-hl${n}-scelta`);
        await page.evaluate(idx => { const FISSI = /^(⏸|▶|1×|1,5×|2×|⚠️|Statistiche|Pagelle|▴|▾)/; const b = [...document.querySelectorAll('button')].filter(b => b.offsetParent && !FISSI.test((b.textContent || '').trim())); if (b[idx]) b[idx].click(); }, i);
        hls.push(rec); ultimoFine = rec; n++; await sleep(600); continue;
      }
    }
    if (st.ph === 'hl_result') {
      /* l'esito resta a schermo pochi secondi: lo si legge SUBITO, poi si campiona il pallone finche' dura */
      const leggi = () => page.evaluate(() => { const s = window.__CPM_STATE ? window.__CPM_STATE() : null; return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, txt: document.body.innerText.slice(0, 1500), ball: s && s.ball && { x: s.ball.x, y: s.ball.y, h: s.ball.worldY }, act: s && s.act && { t: s.act.t, ok: s.act.ok, kind: s.act.kind }, hero: s && s.hero && { x: s.hero.x, y: s.hero.y } }; }).catch(() => null);
      let r = await leggi(); const primo = r; let ultimo = r; let fotoFatta = false; let conVoto = (r && /voto/i.test(r.txt)) ? r : null;
      for (let k = 0; k < 14; k++) {
        if (foto && ultimoFine && hls.length <= foto && !fotoFatta && k === 3) { await shot(page, `${tag}-hl${hls.length - 1}-esito`); fotoFatta = true; }
        await sleep(300); const q = await leggi(); if (!q || q.ph !== 'hl_result') break; ultimo = q; if (!conVoto && /voto/i.test(q.txt)) conVoto = q;
      }
      if (ultimoFine && primo) {
        ultimoFine.esitoTxt = ((conVoto || primo).txt).split('\n').slice(0, 26).join(' / ').slice(0, 800);
        ultimoFine.ball = ultimo.ball; ultimoFine.act = primo.act; ultimoFine.heroDopo = ultimo.hero;
      }
      if (onHL && ultimoFine) await onHL(ultimoFine, page);
      await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.offsetParent && /^Continua/.test((b.textContent || '').trim())); if (b) b.click(); });
      await sleep(600); continue;
    }
    if (!['playing','hl_intro','hl_choose','hl_result','hl_move'].includes(st.ph)) {
      /* fine partita o altro: esce al chiamante */
      return { hls, ph: st.ph, btns: st.btns, txt: st.txt, ms: Date.now() - t0 };
    }
    if (chiave === ultimaChiave) stallo++; else { stallo = 0; ultimaChiave = chiave; }
    await sleep(700);
  }
  return { hls, ph: 'timeout', ms: Date.now() - t0 };
}

export async function caricaCarriera(page) {
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  await sleep(1200);
}
export const bottoni = page => page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.textContent.trim().slice(0, 60)));
export const clic = (page, rx) => page.evaluate(src => { const r = new RegExp(src); const e = [...document.querySelectorAll('button')].find(b => b.offsetParent && r.test(b.textContent.trim())); if (e) { e.click(); return e.textContent.trim().slice(0, 60); } return null; }, rx.source || rx);

export const scrollFondo = page => page.evaluate(() => { const els = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 40 && ['auto', 'scroll'].includes(getComputedStyle(e).overflowY)); els.forEach(e => { e.scrollTop = e.scrollHeight; }); return els.length; });
export const scrollSu = page => page.evaluate(() => { const els = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 40 && ['auto', 'scroll'].includes(getComputedStyle(e).overflowY)); els.forEach(e => { e.scrollTop = 0; }); return els.length; });

/* finestra in primo piano (modale/foglio): testo e bottoni, o null */
export const overlay = page => page.evaluate(() => {
  const els = [...document.querySelectorAll('div')].filter(e => { const cs = getComputedStyle(e); if (cs.position !== 'fixed') return false; const r = e.getBoundingClientRect(); return r.height > 180 && r.width > 250 && e.querySelector('button') && !e.querySelector('[data-cpm="avanza23"]') && !e.classList.contains('cpm-nav-tabs') && !(e.querySelector('.cpm-nav-tabs')); });
  if (!els.length) return null;
  const top = els.sort((a, b) => (parseInt(getComputedStyle(b).zIndex) || 0) - (parseInt(getComputedStyle(a).zIndex) || 0))[0];
  return { txt: top.innerText.slice(0, 1500), btns: [...top.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.innerText.trim().slice(0, 90)) };
});
export const clicIn = (page, idx) => page.evaluate(i => { const els = [...document.querySelectorAll('div')].filter(e => { const cs = getComputedStyle(e); if (cs.position !== 'fixed') return false; const r = e.getBoundingClientRect(); return r.height > 180 && r.width > 250 && e.querySelector('button') && !e.querySelector('[data-cpm="avanza23"]') && !(e.querySelector('.cpm-nav-tabs')); }); if (!els.length) return null; const top = els.sort((a, b) => (parseInt(getComputedStyle(b).zIndex) || 0) - (parseInt(getComputedStyle(a).zIndex) || 0))[0]; const bs = [...top.querySelectorAll('button')].filter(b => b.offsetParent); if (!bs[i]) return null; const t = bs[i].innerText.trim(); bs[i].click(); return t; }, idx);
export const cta = page => page.evaluate(() => { const b = document.querySelector('[data-cpm="avanza23"]'); return b ? { t: b.innerText.replace(/\n/g, ' · '), dis: b.disabled } : null; });
