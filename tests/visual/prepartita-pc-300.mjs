#!/usr/bin/env node
/* [giro 300 · PO-565 / PO-551 / PO-552 / PO-553] GUARDIANO prepartita-pc-300 — `npm run prepartita-pc-300`.
   Gioca, non legge soltanto il sorgente. Tre misure di schermo: telefono 375x667 · telefono 412x915 · PC 1366x768.
   A  (PO-565) pre-partita vera del provino: il tasto «Gioca solo i momenti salienti» ha il bordo d'accento (>= 2 px, colore diverso
      dal bordo degli altri tasti secondari e dal fondo), il titolo nello stesso colore del bordo (contrasto >= 4,5:1 sul fondo), il fondo
      scuro uguale a quello di «Salta e gioca», l'icona ⚡ nel titolo e la nota DENTRO il tasto (giro 287); tasto alto >= 44 px.
   B  (PO-551) schermata «Inizia il provino»: da PC il tasto e' attaccato al contenuto (vuoto <= ATTACCO_MAX px); al telefono resta in
      fondo (la pagina scorre, oppure sotto il tasto e la sua riga d'avviso restano <= FONDO_MAX px).
   C  (PO-552) Home da PC con un salvataggio nello slot 1: i tre tasti «1 2 3» sono pulsanti >= 44x44; il clic su «1» apre la carriera
      salvata, il clic su «2» (slot libero) apre la creazione; i tasti 1 e 2 della tastiera fanno lo stesso. Al telefono (< 640 px) i
      tasti non ci sono, come prima (non c'e' tastiera): si giudica la loro assenza.
   D  (PO-553) nessuna scritta con suggerimenti di tasti: statico su src/ (WASD · «due frecce insieme» · «Premi P» · numero accanto a
      «Scegli» nelle offerte: ogni riga che li contiene passa da _g300()) + a schermo, in tre scene vere dell'highlight (movimento ·
      scelta · piazzato) e in pausa: nessun testo visibile con quei suggerimenti e nessun numero-tasto 1-3 dentro i pulsanti.
      Le scorciatoie funzionano ancora: W/A/S/D spostano l'eroe, 1 fa partire la giocata e lo stile del piazzato, P mette e toglie la pausa.
   Rosso window.__CPM_NO_G300 (la 7.999.198): DEVE cadere su A, B (PC), C (PC) e D. «Non giudicato» = rosso. Verde e rosso per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node prepartita-pc-300.mjs
        (CPM_PARTE=verde|rosso · CPM_FOTO=<cartella> · CPM_MISURE=1366x768,375x667) */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, clickByText, openMatch, sleep, ROOT } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PARTE = process.env.CPM_PARTE || 'tutto'; const FOTO = process.env.CPM_FOTO || null;
const ATTACCO_MAX = 24, FONDO_MAX = 24;/* px: il margine fra due riquadri della schermata e' 9 px; misure del giro in RAPPORTO-giro300.md */
const TUTTE = [[375, 667, 'tel'], [412, 915, 'tel'], [1366, 768, 'pc']];
const MISURE = process.env.CPM_MISURE ? TUTTE.filter(m => process.env.CPM_MISURE.split(',').includes(m[0] + 'x' + m[1])) : TUTTE;
const SALVA = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/visual/fixtures/save-c177-s1w15.json'), 'utf8'))['cpm-v3'];
const out = []; const log = s => { out.push(s); console.log(s); }; const J = x => JSON.stringify(x);
const HINT = /WASD|due frecce insieme|Premi (il tasto )?[A-Z0-9]\b|\[[0-9A-Z]\]|\bInvio\b|\bEnter\b/;

/* ---------- D statico ---------- */
function statico() {
  const dir = path.join(ROOT, 'src'); const hit = []; let rami = 0;
  const PAT = [/WASD/, /due frecce insieme/, /Premi P\b/, /className="kbd">\{i\+1\}/];
  for (const f of fs.readdirSync(dir).filter(f => /\.jsx$/.test(f))) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' ')).replace(/(^|\s)\/\/[^\n]*/g, c => c.replace(/[^\n]/g, ' '));
    s.split('\n').forEach((riga, i) => { for (const p of PAT) { if (!p.test(riga)) continue; if (/_g300\(\)/.test(riga)) rami++; else hit.push(`${f}:${i + 1} ${p}`); } });
  }
  return { hit, rami };
}

const nuovaPagina = async (b, W, H, rosso, extra) => {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block' }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(({ r, extra }) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G300 = true; if (extra.prep) window.__CPM_PREP246 = true;
    try { if (!sessionStorage.getItem('g300')) { localStorage.clear(); localStorage.setItem('cpm-intro-seen', '1'); if (extra.salva) localStorage.setItem('cpm-v3', extra.salva); sessionStorage.setItem('g300', '1'); } } catch (e) {} }, { r: rosso, extra: extra || {} });
  return { ctx, page, errs };
};
const apriHome = async (page, port) => { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0 && /Nuova carriera|Crea il tuo calciatore|salvatagg/i.test(document.body.innerText); }, null, { timeout: 60000 }); await sleep(900); };
const foto = async (page, nome) => { if (!FOTO) return; fs.mkdirSync(FOTO, { recursive: true }); await page.screenshot({ path: path.join(FOTO, nome + '.png') }).catch(() => {}); };
const attendi = async (page, fn, arg, n = 60, passo = 250) => { for (let i = 0; i < n; i++) { if (await page.evaluate(fn, arg).catch(() => false)) return true; await sleep(passo); } return false; };
const inCarriera = () => !!document.querySelector('.cpm-nav-bar') && !document.querySelector('.cpm-home284,.cpm-tasti284');
const inCreazione = () => !!document.querySelector('input[type="text"],input:not([type])') && /INIZIA I PROVINI/i.test(document.body.innerText);

/* ---------- C: Home ---------- */
async function parteC(b, port, W, H, tipo, rosso, et) {
  const r = { tasti: [], n284: null };
  { const { ctx, page, errs } = await nuovaPagina(b, W, H, rosso, { salva: SALVA }); await apriHome(page, port);
    Object.assign(r, await page.evaluate(() => { const z = e => { const q = e.getBoundingClientRect(); return { w: Math.round(q.width), h: Math.round(q.height), tag: e.tagName, t: (e.textContent || '').trim() }; };
      return { n284: document.querySelectorAll('.cpm-tasti284').length, tasti: [...document.querySelectorAll('.cpm-tasti284 .kbd')].map(z) }; }));
    await foto(page, `${et}-home-${W}x${H}`);
    if (tipo === 'pc') {
      const k1 = page.locator('.cpm-tasti284 .kbd').nth(0); if (await k1.count()) await k1.click({ timeout: 3000 }).catch(() => {});
      r.clic1 = await attendi(page, inCarriera, null, 40);
    }
    r.errs = errs.slice(); await ctx.close().catch(() => {}); }
  if (tipo === 'pc') {
    { const { ctx, page } = await nuovaPagina(b, W, H, rosso, { salva: SALVA }); await apriHome(page, port);
      const k2 = page.locator('.cpm-tasti284 .kbd').nth(1); if (await k2.count()) await k2.click({ timeout: 3000 }).catch(() => {});
      r.clic2 = await attendi(page, inCreazione, null, 24); await ctx.close().catch(() => {}); }
    { const { ctx, page } = await nuovaPagina(b, W, H, rosso, { salva: SALVA }); await apriHome(page, port);
      await page.keyboard.press('1'); r.tasto1 = await attendi(page, inCarriera, null, 40); await ctx.close().catch(() => {}); }
    { const { ctx, page } = await nuovaPagina(b, W, H, rosso, { salva: SALVA }); await apriHome(page, port);
      await page.keyboard.press('2'); r.tasto2 = await attendi(page, inCreazione, null, 24); await ctx.close().catch(() => {}); }
  }
  return r;
}

/* ---------- B + A: provino e pre-partita ---------- */
async function parteBA(b, port, W, H, tipo, rosso, et) {
  const r = {}; const { ctx, page, errs } = await nuovaPagina(b, W, H, rosso, { prep: true });
  try {
    await apriHome(page, port);
    if (!await clickByText(page, 'Nuova carriera')) throw new Error('"Nuova carriera" non trovato');
    await sleep(700);
    await page.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, 'Collaudo Giro 300');
    if (!await clickByText(page, 'INIZIA I PROVINI')) throw new Error('"INIZIA I PROVINI" non trovato');
    if (!await attendi(page, () => !!document.querySelector('[data-cpm="provino-pre"]'), null, 40)) throw new Error('schermata del provino mai raggiunta');
    await sleep(700);
    r.B = await page.evaluate(() => { const pp = document.querySelector('[data-cpm="provino-pre"]'); const sc = pp.closest('.cpm-scroll') || document.scrollingElement; sc.scrollTop = 0;
      const vis = el => { const cs = getComputedStyle(el); const q = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && q.width > 0 && q.height > 0; };
      const btn = [...pp.querySelectorAll('button')].find(x => /Inizia il provino/.test(x.textContent || '')); if (!btn) return null;
      const blocco = pp.firstElementChild; const figli = [...blocco.children].filter(vis); const ult = figli[figli.length - 1].getBoundingClientRect(); const qb = btn.getBoundingClientRect();
      const coda = [...pp.children].filter(vis).pop().getBoundingClientRect(); const qs = sc.getBoundingClientRect(); const cs = getComputedStyle(sc);
      const fondoUtile = qs.bottom - (parseFloat(cs.paddingBottom) || 0);
      return { testo: (btn.textContent || '').trim(), vuoto: Math.round(qb.top - ult.bottom), scorre: sc.scrollHeight > sc.clientHeight + 2, sottoCoda: Math.round(fondoUtile - coda.bottom), hBtn: Math.round(qb.height), hint: /Enter|Invio|\[/.test(btn.textContent || '') }; });
    await foto(page, `${et}-provino-${W}x${H}`);
    await clickByText(page, 'Inizia il provino');
    if (!await attendi(page, () => !!document.querySelector('[data-cpm="prepartita23"] [data-cpm="solo-243"]'), null, 80, 400)) throw new Error('pre-partita col tasto dei salienti mai raggiunta');
    await sleep(900);
    r.A = await page.evaluate(() => { const pp = document.querySelector('[data-cpm="prepartita23"]'); document.querySelectorAll('.cpm-scroll').forEach(s => { s.scrollTop = 0; });
      const t = pp.querySelector('[data-cpm="solo-243"]'); t.scrollIntoView({ block: 'center' });
      const altro = [...pp.querySelectorAll('button')].find(x => /Salta e gioca/.test(x.textContent || '')); const cs = getComputedStyle(t), ca = altro ? getComputedStyle(altro) : null;
      const tit = t.querySelector('[data-cpm="solo-300-titolo"]'); const nota = pp.querySelector('[data-cpm="solo-243-nota"]'); const q = t.getBoundingClientRect(), qn = nota ? nota.getBoundingClientRect() : null;
      const rgb = s => (String(s).match(/[\d.]+/g) || []).slice(0, 3).map(Number); const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
      const rap = (a, b) => { const x = lum(rgb(a)), y = lum(rgb(b)); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const colTit = tit ? getComputedStyle(tit).color : cs.color;
      return { testo: (t.textContent || '').trim().slice(0, 60), bordoPx: parseFloat(cs.borderTopWidth) || 0, bordo: cs.borderTopColor, fondo: cs.backgroundColor, fondoAltro: ca && ca.backgroundColor, bordoAltro: ca && ca.borderTopColor,
        titolo: !!tit, colTit, contrasto: +rap(colTit, cs.backgroundColor).toFixed(2), contrastoBordo: +rap(cs.borderTopColor, cs.backgroundColor).toFixed(2), icona: /⚡/.test(tit ? tit.textContent : ''), h: Math.round(q.height),
        notaDentro: !!(nota && t.contains(nota) && qn.top >= q.top - 0.5 && qn.bottom <= q.bottom + 0.5 && qn.left >= q.left - 0.5 && qn.right <= q.right + 0.5), intero: q.left >= 0 && q.right <= innerWidth + 0.5 }; });
    await foto(page, `${et}-prepartita-${W}x${H}`);
  } catch (e) { r.err = String(e.message || e); }
  r.errs = errs.slice(); await ctx.close().catch(() => {}); return r;
}

/* ---------- D: highlight e pausa ---------- */
const leggi = () => { const vis = el => { const cs = getComputedStyle(el); const q = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && q.width > 0 && q.height > 0; };
  const HINT = /WASD|due frecce insieme|Premi (il tasto )?[A-Z0-9]\b|\[[0-9A-Z]\]|\bInvio\b|\bEnter\b/;
  const testi = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { const p = n.parentElement; if (!p || /SCRIPT|STYLE/.test(p.tagName)) continue; const t = (n.nodeValue || '').trim(); if (t && HINT.test(t) && vis(p)) testi.push(t.slice(0, 70)); }
  const numeri = []; document.querySelectorAll('button').forEach(bt => { if (!vis(bt)) return; bt.querySelectorAll('*').forEach(el => { if (el.children.length === 0 && /^[1-3]$/.test((el.textContent || '').trim()) && vis(el)) numeri.push((bt.textContent || '').trim().slice(0, 28)); }); });
  return { testi, numeri }; };
async function parteD(b, port, W, H, tipo, rosso, et) {
  const r = { scene: {}, testi: [], numeri: [] }; const { ctx, page, errs } = await nuovaPagina(b, W, H, rosso, {});
  const fase = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  const eroe = () => page.evaluate(() => { try { const s = window.__CPM_STATE(); return s && s.hero ? [s.hero.tx != null ? s.hero.tx : s.hero.x, s.hero.tz != null ? s.hero.tz : (s.hero.z != null ? s.hero.z : s.hero.y)] : null; } catch (e) { return null; } }).catch(() => null);
  const somma = v => { r.testi.push(...v.testi); r.numeri.push(...v.numeri); };
  try {
    await openMatch(page, port); await sleep(800);
    const liste = await page.evaluate(() => { const mov = [], aim = []; for (let i = 0; i < SITUATIONS.length; i++) { const s = SITUATIONS[i]; const a = typeof isAimSit === 'function' && isAimSit(s);
      if (a) aim.push(i); else if (!s.lockMovement && cappedMM(s) >= 1) mov.push(i); } return { mov, aim }; });
    /* scena di movimento: hl_move → suggerimenti, WASD, poi scelta e tasto 1 */
    for (let t = 0; t < Math.min(liste.mov.length, 15) && !r.scene.mov; t++) {
      const gi = liste.mov[(t * 7) % liste.mov.length]; await page.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
      let ph = null; for (let i = 0; i < 40 && (ph = await fase()) !== 'hl_move'; i++) { if (ph === 'hl_choose' && i > 6) break; await sleep(150); }
      if (ph !== 'hl_move') continue;
      await sleep(400); const v = await page.evaluate(leggi); somma(v); await foto(page, `${et}-highlight-mossa-${W}x${H}`);
      const p0 = await eroe(); let mosso = false;
      for (const k of ['d', 'w', 'a', 's']) { await page.keyboard.press(k); for (let i = 0; i < 12 && !mosso; i++) { await sleep(200); const p1 = await eroe(); if (p0 && p1 && (Math.abs(p1[0] - p0[0]) + Math.abs(p1[1] - p0[1])) > 0.3) mosso = k; }/* l'eroe raggiunge il passo in qualche fotogramma: si attende lo spostamento, non un tempo fisso */ if (mosso || (await fase()) !== 'hl_move') break; }
      let ph2 = await fase(); if (ph2 === 'hl_move') { const pr = page.locator('button', { hasText: 'Pronto' }).first(); if (await pr.count()) await pr.click({ timeout: 2000 }).catch(() => {}); for (let i = 0; i < 20 && (ph2 = await fase()) === 'hl_move'; i++) await sleep(120); }
      let scelta = null;
      if (ph2 === 'hl_choose') { await sleep(350); scelta = await page.evaluate(leggi); somma(scelta); await foto(page, `${et}-highlight-scelta-${W}x${H}`); await page.keyboard.press('1'); }
      let ph3 = ph2; for (let i = 0; i < 60 && (ph3 = await fase()) === 'hl_choose'; i++) await sleep(100);
      r.scene.mov = { gi, p0, mosso, sceltaVista: !!scelta, dopo1: ph3 };
    }
    /* piazzato: stili senza numero, tasto 1 */
    for (let t = 0; t < Math.min(liste.aim.length, 8) && !r.scene.aim; t++) {
      const gi = liste.aim[(t * 3) % liste.aim.length]; await page.evaluate(g => window.__CPM_FORCE_SIT(g, false), gi).catch(() => {});
      let ph = null; for (let i = 0; i < 50 && (ph = await fase()) !== 'hl_choose'; i++) { if (ph === 'hl_move' && i > 6) { const pr = page.locator('button', { hasText: 'Pronto' }).first(); if (await pr.count()) await pr.click({ timeout: 2000 }).catch(() => {}); } await sleep(150); }
      if (ph !== 'hl_choose') continue;
      if (!await page.evaluate(() => !!document.querySelector('button[data-sp292]')).catch(() => false)) continue;/* la scelta dello STILE, non una giocata normale */
      await sleep(400); const v = await page.evaluate(leggi); somma(v); await foto(page, `${et}-highlight-piazzato-${W}x${H}`);
      await page.keyboard.press('1'); let ph3 = ph; for (let i = 0; i < 60 && (ph3 = await fase()) === 'hl_choose'; i++) await sleep(100);
      r.scene.aim = { gi, dopo1: ph3 };
    }
  } catch (e) { r.err = String(e.message || e); }
  r.errs = errs.slice(); await ctx.close().catch(() => {});
  /* pausa: partita vera in `playing`, tasto P */
  { const { ctx: c2, page: p2 } = await nuovaPagina(b, W, H, rosso, {});
    try { await openMatch(p2, port, { skipLoadAll: true }); await attendi(p2, () => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, 60);
      const pausaVista = () => /per riprendere/i.test(document.body.innerText);
      await p2.keyboard.press('p'); const su = await attendi(p2, pausaVista, null, 20, 150);
      const v = su ? await p2.evaluate(leggi) : { testi: [], numeri: [] }; r.testi.push(...v.testi);
      const riga = await p2.evaluate(() => { const m = document.body.innerText.match(/[^\n]*per riprendere[^\n]*/i); return m ? m[0].trim() : null; });
      await foto(p2, `${et}-pausa-${W}x${H}`);
      await p2.keyboard.press('p'); const giu = await attendi(p2, () => !/per riprendere/i.test(document.body.innerText), null, 20, 150);
      r.scene.pausa = { su, riga, giu };
    } catch (e) { r.scene.pausa = { err: String(e.message || e) }; }
    await c2.close().catch(() => {}); }
  return r;
}

const S = statico();
log(`D statico: ${S.hit.length} righe con suggerimenti di tasti fuori da _g300() · rami guardati ${S.rami}`); S.hit.forEach(h => log('   ' + h));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let esito = 0; const fatte = []; const righeFinali = [];
for (const rosso of [false, true]) {
  if ((PARTE === 'verde' && rosso) || (PARTE === 'rosso' && !rosso)) continue;
  const nome = rosso ? 'ROSSO' : 'VERDE'; const et = rosso ? 'prima' : 'dopo'; const ko = []; const cade = new Set();
  for (const [W, H, tipo] of MISURE) {
    const m = `${W}x${H}`; const giu = (lettera, cond, msg) => { if (!cond) { ko.push(`${lettera}@${m}: ${msg}`); cade.add(lettera + (tipo === 'pc' ? 'pc' : 'tel')); } };
    const C = await parteC(b, port, W, H, tipo, rosso, et);
    log(`${nome} ${m} C Home: ${J(C)}`);
    if (tipo === 'pc') { giu('C', C.tasti.length === 3 && C.tasti.every(k => k.tag === 'BUTTON' && k.w >= 44 && k.h >= 44), `i tasti 1 2 3 non sono tre pulsanti >= 44x44 (${C.tasti.map(k => k.tag + ' ' + k.w + 'x' + k.h).join(' · ') || 'non trovati: non giudicato'})`);
      giu('C', C.clic1 === true, 'il clic su «1» non apre la carriera salvata'); giu('C', C.clic2 === true, 'il clic su «2» (slot libero) non apre la creazione');
      if (!C.tasto1) ko.push(`C@${m}: SCORCIATOIA ROTTA, il tasto 1 non apre la carriera`); if (!C.tasto2) ko.push(`C@${m}: SCORCIATOIA ROTTA, il tasto 2 non apre la creazione`); }
    else if (C.n284 !== 0) ko.push(`C@${m}: al telefono compaiono i tasti dei salvataggi (${C.n284})`);
    if (C.errs && C.errs.length) ko.push(`C@${m}: errori di pagina ${C.errs[0]}`);
    const BA = await parteBA(b, port, W, H, tipo, rosso, et);
    log(`${nome} ${m} B provino: ${J(BA.B)} · A pre-partita: ${J(BA.A)}${BA.err ? ' · ERR ' + BA.err : ''}`);
    if (!BA.B) ko.push(`B@${m}: non giudicato (${BA.err || 'tasto non trovato'})`);
    else { if (tipo === 'pc') giu('B', BA.B.vuoto <= ATTACCO_MAX, `«Inizia il provino» staccato dal contenuto di ${BA.B.vuoto} px (max ${ATTACCO_MAX})`);
      else if (!(BA.B.scorre || BA.B.sottoCoda <= FONDO_MAX)) ko.push(`B@${m}: al telefono il tasto non e' in fondo (sotto restano ${BA.B.sottoCoda} px, max ${FONDO_MAX})`);
      if (BA.B.hint) ko.push(`B@${m}: il tasto del provino porta un suggerimento di tasto «${BA.B.testo}»`); }
    if (!BA.A) ko.push(`A@${m}: non giudicato (${BA.err || 'pre-partita non raggiunta'})`);
    else { const a = BA.A;
      giu('A', a.bordoPx >= 2 && a.bordo !== a.fondo && a.bordo !== a.bordoAltro, `niente bordo d'accento (${a.bordoPx} px ${a.bordo}; altri tasti ${a.bordoAltro})`);
      giu('A', a.titolo && a.colTit === a.bordo, `il titolo non ha il colore del bordo (${a.colTit} / ${a.bordo})`);
      giu('A', a.icona, 'manca l\'icona ⚡ nel titolo');
      if (a.titolo && a.contrasto < 4.5) ko.push(`A@${m}: titolo a ${a.contrasto}:1 sul fondo (min 4,5)`);
      if (a.fondo !== a.fondoAltro) ko.push(`A@${m}: il fondo del tasto non e' piu' quello scuro degli altri (${a.fondo} / ${a.fondoAltro})`);
      if (!a.notaDentro) ko.push(`A@${m}: la nota non e' dentro il tasto (giro 287)`);
      if (a.h < 44 || !a.intero) ko.push(`A@${m}: tasto alto ${a.h} px o fuori dallo schermo`); }
    if (BA.errs && BA.errs.length) ko.push(`A/B@${m}: errori di pagina ${BA.errs[0]}`);
    const D = await parteD(b, port, W, H, tipo, rosso, et);
    log(`${nome} ${m} D highlight: scene ${J(D.scene)} · testi ${J([...new Set(D.testi)])} · numeri-tasto ${J([...new Set(D.numeri)])}${D.err ? ' · ERR ' + D.err : ''}`);
    const sm = D.scene.mov, sa = D.scene.aim, sp = D.scene.pausa;
    if (!sm || !sm.sceltaVista) ko.push(`D@${m}: non giudicato, nessuna scena di movimento arrivata alla scelta`);
    else { if (!sm.mosso) ko.push(`D@${m}: SCORCIATOIA ROTTA, W/A/S/D non spostano l'eroe (gi${sm.gi})`); if (sm.dopo1 !== 'hl_result') ko.push(`D@${m}: SCORCIATOIA ROTTA, il tasto 1 non fa partire la giocata (gi${sm.gi} → ${sm.dopo1})`); }
    if (!sa) ko.push(`D@${m}: non giudicato, nessun piazzato arrivato alla scelta dello stile`);
    else if (sa.dopo1 !== 'hl_result') ko.push(`D@${m}: SCORCIATOIA ROTTA, il tasto 1 non sceglie lo stile del piazzato (gi${sa.gi} → ${sa.dopo1})`);
    if (!sp || !sp.su) ko.push(`D@${m}: non giudicato, la pausa col tasto P non compare (${J(sp)})`); else if (!sp.giu) ko.push(`D@${m}: SCORCIATOIA ROTTA, P non toglie la pausa`);
    giu('D', D.testi.length === 0, `scritte con suggerimenti di tasti: ${J([...new Set(D.testi)])}`);
    giu('D', D.numeri.length === 0, `numeri-tasto nei pulsanti: ${J([...new Set(D.numeri)].slice(0, 4))}`);
    if (D.errs && D.errs.length) ko.push(`D@${m}: errori di pagina ${D.errs[0]}`);
  }
  if (!rosso) { if (S.hit.length) ko.push('D statico: scritte con suggerimenti di tasti in src/ fuori da _g300()'); if (S.rami < 4) ko.push(`D statico: rami _g300() trovati ${S.rami} (attesi >= 4): non giudicato`);
    righeFinali.push(`VERDE: ${ko.length ? 'ROSSO VERO ✗ ' + ko.join(' · ') : 'VERDE ✓'}`); if (ko.length) esito = 1; }
  else { const rotte = ko.filter(k => /SCORCIATOIA ROTTA|non giudicato|errori di pagina/.test(k));
    const attesi = [...(MISURE.some(x => x[2] === 'pc') ? ['Apc', 'Bpc', 'Cpc', 'Dpc'] : []), ...(MISURE.some(x => x[2] === 'tel') ? ['Atel', 'Dtel'] : [])]; const manca = attesi.filter(x => !cade.has(x));
    righeFinali.push(`ROSSO: cade su ${[...cade].sort().join(' ')} (${ko.length} rilievi)${manca.length ? ' · NON CADE su ' + manca.join(' ') + ': il guardiano non vede il difetto ✗' : ''}${rotte.length ? ' · ' + rotte.join(' · ') + ' ✗' : ''}${(!manca.length && !rotte.length) ? ' · il guardiano vede i difetti e le scorciatoie funzionano ✓' : ''}`);
    ko.slice(0, 14).forEach(k => log('   rosso: ' + k)); if (manca.length || rotte.length) esito = 1; }
  fatte.push(nome);
}
await b.close(); srv.close();
righeFinali.forEach(log);
fs.mkdirSync(path.join(ROOT, 'tests/visual/out'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'tests/visual/out/prepartita-pc-300.txt'), out.join('\n') + '\n');
console.log(esito ? `prepartita-pc-300: ✗ (${fatte.join('+')})` : `prepartita-pc-300: ✓ (${fatte.join('+')})`);
process.exit(esito);
