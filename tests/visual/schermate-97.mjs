#!/usr/bin/env node
/* [giro 97 PO-299 guardiano — difetti di SCHERMATE e LAYOUT dal collaudo grafico 7.999.178, docs/collaudi/RAPPORTO-grafica-178.md]
   Quattro formati: telefono 412x915 (tocco), tablet verticale 820x1180 (tocco), tablet orizzontale 1180x820 (tocco), PC 1440x900 (mouse).
   D1  barra inferiore: dove NON c'e' la sidebar (sotto i 900 px) la barra (strisce + navigazione) copre tutta la larghezza del contenuto,
       cosi' le card che scorrono sotto non si vedono ai suoi lati. Misurato sulla 178 a 820 px: barra 74..746, contenuto 16..805.
   D16 area di tocco >= 40 px: su ogni formato a tocco, ogni tasto/campo visibile delle schede di carriera, dei Crediti e della creazione
       riceve il tocco su almeno 40x40 px (misura VERA: elementFromPoint lungo la verticale e l'orizzontale del suo centro, quindi conta
       l'area allargata e scala chi la copre). Sulla 178 al telefono: Salva 24, strisce 27, Licenzia 24, testate delle fisarmoniche 31-36,
       linguette 32, - e + dello staff 34.
   D17 strisce Sostieni/Idee: in nessun formato il loro testo e' troncato; dove c'e' la sidebar (>= 900 px) ognuna e' larga quasi quanto
       la sidebar (sulla 178: 122 px su 246, «Sostieni il pro…»).
   D14 fischio finale: nei primi secondi della cerimonia il campo 3D si vede (luminosita' media dell'area di gioco e quota di pixel neri),
       misurato a 150, 500, 1000 e 2000 ms dall'ingresso in cerimonia su una partita vera (provino) con la cerimonia LEGGERA forzata.
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_G97D1, __CPM_NO_G97D16, __CPM_NO_G97D17 e pretende che D1, D16 e D17 CADANO (ognuno in almeno
   un formato). D14 non ha interruttore: la sua causa non sta nei file di questo giro (vedi la nota in fondo al rapporto del giro 97)
   e il guardiano la DICHIARA (misura stampata, giudizio solo nel verde).
   CPM_FORMATI=tel,tabv,... per un sottoinsieme; CPM_SENZA_D14=1 salta la partita. Non prova dispositivi veri: Chromium headless. */
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
import { SAVE, INIT } from './lib/banco-g0.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO;
const ROSSI = ROSSO ? ['__CPM_NO_G97D1', '__CPM_NO_G97D16', '__CPM_NO_G97D17'] : [];
const FORMATI = {
  tel: { k: 'tel', nome: 'Telefono 412x915', w: 412, h: 915, touch: true },
  tabv: { k: 'tabv', nome: 'Tablet 820x1180 verticale', w: 820, h: 1180, touch: true },
  tabo: { k: 'tabo', nome: 'Tablet 1180x820 orizzontale', w: 1180, h: 820, touch: true },
  pc: { k: 'pc', nome: 'PC 1440x900', w: 1440, h: 900, touch: false },
};
const SCELTI = (process.env.CPM_FORMATI || 'tel,tabv,tabo,pc').split(',').filter(k => FORMATI[k]).map(k => FORMATI[k]);

/* --- dentro la pagina --- */
function BARRA() {
  const r = x => { if (!x) return null; const b = x.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
  const nb = document.querySelector('.cpm-nav-bar'), sc = document.querySelector('.cpm-scroll');
  const cont = sc && sc.firstElementChild;
  const tronco = e => [e, ...e.querySelectorAll('*')].some(k => k.scrollWidth > k.clientWidth + 1 && getComputedStyle(k).overflow !== 'visible');
  const strisce = [...document.querySelectorAll('.cpm-nav-bar button')].filter(x => /Sostieni|Idee/.test(x.textContent || '')).map(x => ({ t: (x.textContent || '').trim().slice(0, 24), r: r(x), tronco: tronco(x) }));
  return { W: innerWidth, H: innerHeight, nav: r(nb), cont: r(cont), strisce };
}
function TOCCO() {
  const H = innerHeight, W = innerWidth, out = [];
  const cand = [...document.querySelectorAll('button,input:not([type=hidden]),select,textarea,a[href],[role=button]')];
  for (const e of cand) {
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1 || e.disabled && e.tagName !== 'BUTTON') continue;
    let r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    e.scrollIntoView({ block: 'center', inline: 'nearest' }); r = e.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 0 || cx >= W || cy < 0 || cy >= H) continue;
    const dentro = (x, y) => { const k = document.elementFromPoint(x, y); return !!k && (k === e || e.contains(k)); };
    const t = (e.textContent || e.placeholder || e.getAttribute('aria-label') || e.title || e.type || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    if (!dentro(cx, cy)) { out.push({ t, w: Math.round(r.width), h: Math.round(r.height), coperto: true }); continue; }
    let su = 0, giu = 0, sx = 0, dx = 0;
    while (su < 30 && cy - su - 1 >= 0 && dentro(cx, cy - su - 1)) su++; while (giu < 30 && cy + giu + 1 < H && dentro(cx, cy + giu + 1)) giu++;
    while (sx < 30 && cx - sx - 1 >= 0 && dentro(cx - sx - 1, cy)) sx++; while (dx < 30 && cx + dx + 1 < W && dentro(cx + dx + 1, cy)) dx++;
    out.push({ t, w: Math.round(r.width), h: Math.round(r.height), hw: sx + dx + 1, hh: su + giu + 1 });
  }
  const s = document.querySelector('.cpm-scroll'); if (s) s.scrollTop = 0; window.scrollTo(0, 0);
  return out;
}

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const errs = [], mancanti = [], fail = { D1: [], D16: [], D17: [], D14: [] }, visti = { D1: 0, D16: 0, D17: 0, D14: 0 };
async function apri(f, init, query) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(`${f.k} · ${String(e.message).slice(0, 120)}`));
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: ROSSI, ...init });
  await page.addInitScript(() => { const s = document.createElement('style'); s.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s)); });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  return { ctx, page };
}
const premi = (page, rx) => page.evaluate(s => { const r = new RegExp(s); const x = [...document.querySelectorAll('button')].find(y => r.test((y.textContent || '').trim())); if (x) { x.click(); return true; } return false; }, rx);
function giudicaTocco(f, id, lista) {
  visti.D16++;
  const piccoli = lista.filter(x => !x.coperto && (x.hh < 40 || x.hw < 40));
  const coperti = lista.filter(x => x.coperto).length;
  console.log(`  ${f.k.padEnd(4)} D16 ${id.padEnd(20)} controlli ${String(lista.length).padStart(3)} · sotto 40: ${piccoli.length}${coperti ? ' · coperti (non giudicati) ' + coperti + ' [' + lista.filter(x => x.coperto).slice(0, 4).map(x => x.t).join(' | ') + ']' : ''}${piccoli.length ? '  [' + piccoli.slice(0, 5).map(x => `${x.t} ${x.w}x${x.h}→${x.hw}x${x.hh}`).join(' | ') + ']' : ''}`);
  if (f.touch && piccoli.length) fail.D16.push(`${f.k} ${id}: ${piccoli.length} sotto 40 (${piccoli.slice(0, 3).map(x => `${x.t} ${x.hw}x${x.hh}`).join('; ')})`);
}
const luma = async (page, f) => {
  const buf = await page.screenshot({ clip: { x: 0, y: Math.round(f.h * 0.12), width: f.w, height: Math.round(f.h * 0.5) } }); const png = PNG.sync.read(buf);
  let s = 0, n = 0, neri = 0; for (let i = 0; i < png.data.length; i += 16) { const l = 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]; s += l; n++; if (l < 12) neri++; }
  return { media: s / n, neri: neri / n };
};

for (const f of SCELTI) {
  console.log(`\n=== ${f.nome}`);
  /* 1) carriera: barra (D1, D17) e schede (D16) */
  { const { ctx, page } = await apri(f, { save: SAVE }, '?cpmtest=1');
    await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { mancanti.push(f.k + ' Continua'); }
    const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
    if (!vivo) mancanti.push(f.k + ' carriera'); else {
      await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {} await sleep(400);
      await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(600);
      const m = await page.evaluate(BARRA);
      const sidebar = m.nav && m.nav.h > 0.8 * m.H && m.nav.w < 320;
      if (!m.nav || !m.cont) mancanti.push(f.k + ' barra/contenuto'); else {
        if (!sidebar) { visti.D1++; const ok = m.nav.l <= m.cont.l + 1 && m.nav.r >= m.cont.r - 1;
          console.log(`  ${f.k.padEnd(4)} D1  barra ${Math.round(m.nav.l)}..${Math.round(m.nav.r)} · contenuto ${Math.round(m.cont.l)}..${Math.round(m.cont.r)} → ${ok ? 'copre' : 'NON copre'}`);
          if (!ok) fail.D1.push(`${f.k}: barra ${Math.round(m.nav.l)}..${Math.round(m.nav.r)} contro contenuto ${Math.round(m.cont.l)}..${Math.round(m.cont.r)}`); }
        else console.log(`  ${f.k.padEnd(4)} D1  sidebar (${Math.round(m.nav.w)} px): non si applica`);
        visti.D17++;
        const tr = m.strisce.filter(s => s.tronco), strette = sidebar ? m.strisce.filter(s => s.r.w < 0.9 * m.nav.w) : [];
        console.log(`  ${f.k.padEnd(4)} D17 strisce ${m.strisce.map(s => `${s.t} ${Math.round(s.r.w)}x${Math.round(s.r.h)}@${Math.round(s.r.l)},${Math.round(s.r.t)}${s.tronco ? ' TRONCA' : ''}`).join(' · ')}`);
        if (m.strisce.length < 2) fail.D17.push(`${f.k}: strisce trovate ${m.strisce.length}`);
        if (tr.length) fail.D17.push(`${f.k}: testo troncato (${tr.map(s => s.t).join(', ')})`);
        if (strette.length) fail.D17.push(`${f.k}: strisce strette nella sidebar (${strette.map(s => Math.round(s.r.w)).join(', ')} px su ${Math.round(m.nav.w)})`);
      }
      for (const tab of ['dashboard', 'standings', 'calendar', 'coppe', 'club', 'profile', 'nazionale', 'agente', 'ufficio']) {
        const r = await page.evaluate(x => window.__CPM_CAREER.goTab(x), tab); if (r !== true) { mancanti.push(f.k + ' ' + tab); continue; } await sleep(500);
        giudicaTocco(f, tab, await page.evaluate(TOCCO)); }
    }
    await ctx.close(); }
  /* 2) fuori carriera: Crediti (la x della finestra) e creazione (campi, «Altra variante») */
  { const { ctx, page } = await apri(f, {}, '?cpmtest=1');
    await sleep(600);
    if (await premi(page, 'Crediti')) { await sleep(700); giudicaTocco(f, 'crediti', await page.evaluate(TOCCO)); await page.keyboard.press('Escape').catch(() => {}); await premi(page, '^×$|^✕$'); await sleep(500); } else mancanti.push(f.k + ' crediti');
    if (await premi(page, 'Nuova carriera')) { await sleep(900); giudicaTocco(f, 'creazione', await page.evaluate(TOCCO)); } else mancanti.push(f.k + ' creazione');
    await ctx.close(); }
}
/* 3) D14: cerimonia leggera dopo una partita vera (una sola volta, al telefono: la scena 3D e' la stessa in ogni formato) */
if (!process.env.CPM_SENZA_D14 && SCELTI.some(f => f.k === 'tel')) {
  const f = FORMATI.tel;
  const { ctx, page } = await apri(f, {}, '?cpmtest=1').catch(e => ({}));
  if (page) { let ok = false; try { await openMatch(page, port, { skipLoadAll: true, name: 'Grafica Probe' }); ok = true; } catch (e) { mancanti.push('D14 apertura partita'); }
    if (ok) { await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {}); await sleep(2500);
      await page.evaluate(() => { window.__CPM_CER_HOLD = true; return window.__CPM_FORCE_CEREMONY({ light: true, name: 'Colpo fuori casa', festa: { titolo: 'Colpo fuori casa', punteggio: '2 – 3', avversario: 'FC Prova', casa: false, voci: [{ n: 1, et: 'gol', oro: true }] } }); });
      const t0 = Date.now();
      for (const ms of [150, 500, 1000, 2000]) { while (Date.now() - t0 < ms) await sleep(20); visti.D14++;
        const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); const l = await luma(page, f);
        console.log(`  tel  D14 cerimonia +${String(ms).padStart(4)} ms · fase ${ph} · luminosita' ${l.media.toFixed(1)} · neri ${(100 * l.neri).toFixed(0)}%`);
        if (ph !== 'ceremony' || l.media < 40 || l.neri > 0.5) fail.D14.push(`+${ms} ms: fase ${ph}, luminosita' ${l.media.toFixed(1)}, neri ${(100 * l.neri).toFixed(0)}%`); } }
    await ctx.close(); }
}

if (errs.length) console.log('errori di pagina: ' + errs.slice(0, 4).join(' | '));
if (mancanti.length) console.log('non raggiunte: ' + mancanti.join(', '));
for (const [k, v] of Object.entries(fail)) v.forEach(s => console.log(`  ✗ ${k} ${s}`));
let esito;
if (ROSSO) {
  const cadute = ['D1', 'D16', 'D17'].filter(k => fail[k].length > 0);
  esito = cadute.length === 3;
  console.log(esito ? 'ROSSO ATTESO OK: con __CPM_NO_G97D1/D16/D17 cadono D1, D16 e D17' : `ROSSO NON RIUSCITO: cadono solo ${cadute.join(', ') || 'nessuno'}`);
} else {
  const ciechi = Object.entries(visti).filter(([k, n]) => n === 0 && !(k === 'D14' && (process.env.CPM_SENZA_D14 || !SCELTI.some(f => f.k === 'tel')))).map(([k]) => k);
  esito = !fail.D1.length && !fail.D16.length && !fail.D17.length && !fail.D14.length && !ciechi.length && !mancanti.length && !errs.length;
  console.log(esito ? `schermate-97 VERDE: D1 ${visti.D1} · D16 ${visti.D16} · D17 ${visti.D17} · D14 ${visti.D14} misure` : `schermate-97 ROSSO${ciechi.length ? ' (ciechi: ' + ciechi.join(', ') + ')' : ''}`);
}
await b.close(); srv.close(); process.exit(esito ? 0 : 1);
