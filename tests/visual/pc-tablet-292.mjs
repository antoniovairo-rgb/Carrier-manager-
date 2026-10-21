#!/usr/bin/env node
/* [giro 90 PO-292 guardiano, collaudo PC e tablet 7.999.177 — decisione PO «Partita a tutto schermo»] PC 1366x768 e 1920x1080 (mouse e tastiera),
   tablet 768x1024 e 1024x768 (tocco, pointer coarse) e telefono 412x915 (controllo di non regressione). Su ogni formato, con il salvataggio
   fixtures/save-194-primavera-w38.json, dal tasto «Continua» fino alla partita di carriera (pre-partita → ingresso → 2D → highlight forzati):
   1) LARGHEZZA: la scheda della partita (da pausa a canvas) usa >= 85% della larghezza (PC e tablet); il campo (2D e 3D) >= 55% su PC/tablet
      orizzontale e >= 88% sul tablet verticale; su PC/tablet orizzontale le statistiche stanno nella colonna a destra, FUORI dal campo;
   2) PRE-PARTITA: la colonna e' centrata (margini sinistro/destro entro 30 px) — niente spazio riservato alla barra laterale che non c'e';
   3) TOCCO (solo tablet): ogni pulsante visibile in ingresso, in 2D e negli highlight (movimento, scelta, piazzati) >= 40 x 40 px, e niente
      suggerimenti da tastiera ([0], WASD) negli highlight a tocco;
   4) INQUADRATURA: a camera assestata, in movimento e in scelta, l'eroe e' dentro il canvas (|ndc| <= 0,92) e, nelle scene di tiro, i due pali
      della porta sono dentro (|x|,|y| <= 0,97) e l'eroe e' alto almeno il 4% del canvas;
   5) TASTIERA (solo PC): sul rigore il tasto 2 sceglie; sulla punizione Tab + Invio sceglie (nella 177 servivano il mouse);
   6) NESSUNA SOVRAPPOSIZIONE timbro/statistiche: su PC e tablet orizzontale la striscia delle statistiche non entra nel campo; sul tablet
      verticale il timbro dell'esito (pillola) parte sotto la striscia;
   7) nessuno scorrimento orizzontale in nessuna fase misurata;
   8) TELEFONO INVARIATO: a 412x915 scheda, canvas e pulsanti sono identici con e senza gli interruttori (impronta delle misure).
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_LARGO292 e __CPM_NO_PCTAB292 (la 177) e pretende che 1, 2, 3, 5 e 6 cadano sui formati che li
   riguardano; CPM_FORMATI=pc1920,tabV restringe i formati; CPM_FOTO_292=<prefisso> salva home, partita e highlight di ogni formato;
   CPM_SOLO_ROSSO=1 gira solo il braccio rosso e NON giudica (foto «prima»). Il giudizio sull'inquadratura e' dato a camera ferma (la camera
   insegue con una costante di tempo: nel banco a 5 fps servono secondi); non prova dispositivi veri. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const FORMATI = {
  pc1366: { nome: 'PC 1366x768', w: 1366, h: 768, touch: false, tab: false },
  pc1920: { nome: 'PC 1920x1080', w: 1920, h: 1080, touch: false, tab: false },
  tabV: { nome: 'Tablet 768x1024', w: 768, h: 1024, touch: true, tab: true },
  tabO: { nome: 'Tablet 1024x768', w: 1024, h: 768, touch: true, tab: true },
  tel: { nome: 'Telefono 412x915', w: 412, h: 915, touch: true, tab: false },
};
const SCELTI = (process.env.CPM_FORMATI || 'pc1366,pc1920,tabV,tabO,tel').split(',').filter(k => FORMATI[k]);
const ROSSO_ON = !!process.env.CPM_PROVA_ROSSO, SOLO_ROSSO = !!process.env.CPM_SOLO_ROSSO, FOTO = process.env.CPM_FOTO_292 || '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const IN_PAGINA = {
  /* misure della schermata: scheda (antenato comune di pausa e canvas), canvas, pulsanti visibili, striscia statistiche, scorrimento orizzontale */
  stato: () => {
    const W = document.documentElement.clientWidth, H = innerHeight, r2 = r => [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    const vis = e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.1 && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < H && r.right > 0 && r.left < W; };
    const cvs = [...document.querySelectorAll('canvas')].filter(vis).sort((a, c) => c.getBoundingClientRect().width * c.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height);
    const pausa = [...document.querySelectorAll('button')].find(x => /^(⏸|▶)$/.test((x.textContent || '').trim()) && vis(x));
    let card = null; if (pausa && cvs[0]) { let a = pausa; while (a && !a.contains(cvs[0])) a = a.parentElement; if (a) card = r2(a.getBoundingClientRect()); }
    const btn = [...document.querySelectorAll('button,[role=button]')].filter(vis).map(x => { const r = x.getBoundingClientRect(); return { t: (x.textContent || '').trim().slice(0, 28), r: r2(r) }; });
    const st = document.querySelector('[data-cpm="striscia918"]');
    const testo = (document.body.innerText || '');
    return { W, H, hs: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - W, card, cv: cvs[0] ? r2(cvs[0].getBoundingClientRect()) : null, btn,
      striscia: st && vis(st) ? r2(st.getBoundingClientRect()) : null, suggerimento: /\[0\]|WASD/.test(testo), fase: window.__CPM_PHASE ? window.__CPM_PHASE() : null };
  },
  colonna: () => { /* il riquadro piu' grande e piu' stretto dello schermo (pre-partita): margini sinistro/destro */
    const W = document.documentElement.clientWidth, H = innerHeight; let best = null, ba = 0;
    for (const e of document.body.querySelectorAll('div,section,main')) { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue; if (r.width < 300 || r.width > W * 0.97 || r.height < 150 || r.top > H * 0.6 || r.right < 0 || r.left > W) continue;
      const deco = parseFloat(cs.borderTopLeftRadius) > 4 || cs.boxShadow !== 'none' || (cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor)); if (!deco) continue; const a = r.width * Math.min(r.height, H); if (a > ba) { ba = a; best = r; } }
    return best ? { sx: Math.round(best.left), dx: Math.round(W - best.right), w: Math.round(best.width), W } : null;
  },
  eroe: () => { const c = __CPM3D.camera, h = __CPM3D.hero; const a = h.position.clone().project(c), t = h.position.clone().add(new THREE.Vector3(0, 1.8, 0)).project(c);
    const g = [[100, 50], [100, 45], [100, 55]].map(p => __CPM_INQ74(p[0], p[1])); const cp = c.position;
    return { fase: __CPM_PHASE(), cp: [cp.x, cp.y, cp.z], hh: +((t.y - a.y) / 2).toFixed(3), hx: +a.x.toFixed(3), hy: +a.y.toFixed(3), porta: g[0], pali: [g[1], g[2]] }; },
};
async function apri(f, rosso) {
  const opt = { viewport: { width: f.w, height: f.h }, serviceWorkers: 'block' }; if (f.touch) { opt.hasTouch = true; opt.isMobile = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  if (rosso) await page.addInitScript(() => { window.__CPM_NO_LARGO292 = true; window.__CPM_NO_PCTAB292 = true; });
  await page.addInitScript(s => { try { if (!localStorage.getItem('cpm-v3')) localStorage.setItem('cpm-v3', JSON.stringify(s)); } catch (e) {} }, SAVE);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua/.test(x.textContent || '')), null, { timeout: 90000 }); await sleep(800);
  return { ctx, page, errs };
}
const tocca = async (page, f, x, y) => { if (f.touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); };
async function assesta(page, maxMs = 60000, scatta = null) { /* ultimo fotogramma delle fasi in cui il giocatore DECIDE (movimento, scelta) prima dell'esito, o camera ferma in quelle fasi */
  const t0 = Date.now(); let prev = null, calmi = 0, pres = null, ult = null, fatta = false;
  while (Date.now() - t0 < maxMs) { await sleep(600); ult = await page.evaluate(IN_PAGINA.eroe);
    if (/^hl_(move|choose)$/.test(ult.fase)) pres = ult;
    if (ult.fase === 'hl_result' && pres) break;
    if (prev && ult.fase === prev.fase && /^hl_(move|choose)$/.test(ult.fase)) { const d = Math.hypot(ult.cp[0] - prev.cp[0], ult.cp[1] - prev.cp[1], ult.cp[2] - prev.cp[2]); calmi = d < 0.08 ? calmi + 1 : 0; } else calmi = 0;
    if (scatta && !fatta && pres === ult && (calmi >= 2 || Date.now() - t0 > 9000)) { fatta = true; await scatta(); }
    prev = ult; if (calmi >= 3) break; }
  return pres || ult;
}
const forza = (page, gi, scelta) => page.evaluate(([g, c]) => { window.__CPM_FORCE_INTRO = 1; window.__CPM_FORCE_INTRO_MS = 2500; window.__CPM_FORCE_SIT(g, c); }, [gi, scelta]);
const faseDi = page => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
async function attendiFase(page, rx, ms = 20000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const p = await faseDi(page); if (rx.test(p || '')) return p; await sleep(250); } return await faseDi(page); }
const piccoli = (st, min = 40) => st.btn.filter(x => x.r[2] < min || x.r[3] < min).map(x => `${x.t}@${x.r[2]}x${x.r[3]}`);

async function giro(sigla, rosso, completo) {
  const f = FORMATI[sigla]; const ko = [], mis = {}; const { ctx, page, errs } = await apri(f, rosso);
  const foto = async nome => { if (FOTO && (!rosso || SOLO_ROSSO)) await page.screenshot({ path: `${FOTO}-${sigla}-${nome}.png` }).catch(() => {}); };
  try {
    if (!f.touch) { /* D8: Esc chiude i Crediti (home del gioco) */
      const ap = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => /Crediti/.test(q.textContent || '')); if (x) { x.click(); return true; } return false; });
      if (ap) { await sleep(900); const aperti = await page.evaluate(() => !!document.querySelector('[data-cpm="crediti238"]')); await page.keyboard.press('Escape'); await sleep(700); mis.crediti = { aperti, dopoEsc: await page.evaluate(() => !!document.querySelector('[data-cpm="crediti238"]')) }; if (mis.crediti.dopoEsc) await page.evaluate(() => { const x = document.querySelector('[data-cpm="crediti238-pannello"] button'); if (x) x.click(); }); await sleep(400); }
    }
    await page.evaluate(() => [...document.querySelectorAll('button')].find(x => /Continua/.test(x.textContent || '')).click());
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(2000);
    await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(500); await foto('home');
    if (!f.touch) { /* D9: scorciatoie delle schede (U Ufficio, L Club) e frecce fino all'Ufficio; D8: Esc chiude Opzioni */
      const attiva = () => page.evaluate(() => { const x = document.querySelector('.cpm-nav-tabs .cpm-tab-act'); return x ? (x.textContent || '').trim() : null; });
      const t = {}; await page.keyboard.press('u'); await sleep(900); t.u = await attiva(); await page.keyboard.press('l'); await sleep(900); t.l = await attiva();
      await page.keyboard.press('m'); await sleep(900); for (let i = 0; i < 5; i++) { await page.keyboard.press('ArrowRight'); await sleep(500); } t.frecce = await attiva(); await page.keyboard.press('m'); await sleep(700); mis.tab = t;
      const op = await page.evaluate(() => { const x = [...document.querySelectorAll('.cpm-nav-tabs button')].find(q => /Opzioni/.test(q.textContent || '')); if (x) { x.click(); return true; } return false; });
      if (op) { await sleep(900); const aperte = await page.evaluate(() => /⚙️ Opzioni/.test(document.body.innerText)); await page.keyboard.press('Escape'); await sleep(700); mis.opzioni = { aperte, dopoEsc: await page.evaluate(() => /⚙️ Opzioni/.test(document.body.innerText)) }; if (mis.opzioni.dopoEsc) await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(q => (q.textContent || '').trim() === '✕'); if (x) x.click(); }); await sleep(400); }
    }
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE(), null, { timeout: 30000 }); await sleep(1500);
    /* 2) pre-partita centrata */
    mis.colonna = await page.evaluate(IN_PAGINA.colonna);
    await page.keyboard.press('Enter'); await sleep(1500); await page.keyboard.press('Enter');
    /* 3) ingresso in campo: pulsanti */
    let sk = null; for (let i = 0; i < 40 && !sk; i++) { await sleep(500); const st = await page.evaluate(IN_PAGINA.stato); sk = st.btn.find(x => /Salta ingresso/.test(x.t)) ? st : null; if (sk) mis.walkout = st; }
    if (mis.walkout) { const x = mis.walkout.btn.find(q => /Salta ingresso/.test(q.t)).r; await tocca(page, f, x[0] + x[2] / 2, x[1] + x[3] / 2); }
    await page.waitForFunction(() => window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {}); await sleep(2500);
    mis.gioco = await page.evaluate(IN_PAGINA.stato); await foto('partita');
    mis.pillola = await page.evaluate(() => { const sl = document.querySelector('[data-cpm="fg-slot"]'), st = document.querySelector('[data-cpm="striscia918"]'); if (!sl) return null; const r = sl.getBoundingClientRect(), t = sl.getAttribute('data-pilla-top'); const m = /max\(([\d.]+)%,\s*([\d.]+)px\)/.exec(t || ''); const top = m ? Math.max(+m[1] / 100 * r.height, +m[2]) : (/^([\d.]+)%$/.test(t || '') ? parseFloat(t) / 100 * r.height : null); return { top, regola: t, striscia: st ? Math.round(st.getBoundingClientRect().bottom - r.top) : null }; });
    if (sigla === 'tel') { await forza(page, 7, true); await attendiFase(page, /hl_choose/, 20000); mis.sceltaRapida = await page.evaluate(IN_PAGINA.stato); }
    /* highlight: movimento (tiro dal limite, gi8) */
    await forza(page, 8, false); mis.mov = await assesta(page, completo ? 60000 : 12000, async () => { mis.movSt = await page.evaluate(IN_PAGINA.stato); await foto('highlight'); }); if (!mis.movSt) mis.movSt = await page.evaluate(IN_PAGINA.stato);
    if (completo) {
      await forza(page, 7, true); await attendiFase(page, /hl_choose/); await sleep(1200); mis.sceltaSt = await page.evaluate(IN_PAGINA.stato); mis.scelta = await assesta(page, 40000);
      if (!f.touch) { await forza(page, 7, true); await attendiFase(page, /hl_choose/); await sleep(600); await page.keyboard.press('2'); mis.tasti2 = await attendiFase(page, /^(?!hl_choose)/, 6000); }
      await forza(page, 5, true); await attendiFase(page, /hl_choose/); await sleep(1500); mis.rigSt = await page.evaluate(IN_PAGINA.stato);
      if (!f.touch) { await page.keyboard.press('2'); await sleep(2500); mis.rigTasto = await faseDi(page); }
      await forza(page, 13, true); await attendiFase(page, /hl_choose/); await sleep(1500); mis.punSt = await page.evaluate(IN_PAGINA.stato);
      if (!f.touch) {
        let fuoco = false; for (let i = 0; i < 20 && !fuoco; i++) { await page.keyboard.press('Tab'); fuoco = await page.evaluate(() => { const a = document.activeElement; return !!(a && a.getAttribute && a.getAttribute('data-sp292') != null); }); }
        mis.punFuoco = fuoco; if (fuoco) { await page.keyboard.press('Enter'); await sleep(2500); mis.punTasto = await faseDi(page); }
      }
      /* 1b) il 3D forzato sul rigore: eroe e porta a camera ferma */
      await forza(page, 5, false); mis.rig3d = await assesta(page, 60000);
    }
  } catch (e) { ko.push('eccezione: ' + String(e && e.message || e).slice(0, 160)); }
  if (errs.length) ko.push('pageerror: ' + errs.slice(0, 2).join(' | '));
  await ctx.close(); return { f, ko, mis };
}
const stR = (s, g) => s && s.card ? { card: s.card, cv: s.cv, btn: s.btn.map(x => x.t + ':' + x.r.join(',')).sort() } : null;
function giudica(sigla, r) {
  const f = FORMATI[sigla], m = r.mis, ko = [], pc = !f.touch, tab = f.tab, tel = sigla === 'tel';
  const g = m.gioco; if (!g || !g.card) { ko.push('1: scheda della partita non misurabile'); return ko; }
  if (!tel) {
    const pct = Math.round(g.card[2] / g.W * 100); if (g.card[2] < 0.85 * g.W) ko.push(`1: scheda della partita ${g.card[2]} px su ${g.W} (${pct}%, minimo 85%)`);
    const need = sigla === 'tabV' ? 0.88 : 0.55; if (!g.cv || g.cv[2] < need * g.W) ko.push(`1: campo ${g.cv ? g.cv[2] : '-'} px su ${g.W} (${g.cv ? Math.round(g.cv[2] / g.W * 100) : 0}%, minimo ${Math.round(need * 100)}%)`);
    if (sigla !== 'tabV') { if (!g.striscia) ko.push('6: striscia delle statistiche non trovata nella vista 2D'); else if (g.cv && g.striscia[0] < g.cv[0] + g.cv[2] - 2) ko.push(`6: la striscia delle statistiche (x ${g.striscia[0]}) entra nel campo (fino a ${g.cv[0] + g.cv[2]})`); }
    const c = m.colonna; if (c && g.W >= 900 && Math.abs(c.sx - c.dx) > 30) ko.push(`2: pre-partita non centrata, margini ${c.sx}/${c.dx}`);
  }
  if (!tel && m.walkout && m.walkout.cv) { const need = sigla === 'tabV' ? 0.88 : 0.55; if (m.walkout.cv[2] < need * m.walkout.W) ko.push(`1: campo all'ingresso ${m.walkout.cv[2]} px su ${m.walkout.W} (minimo ${Math.round(need * 100)}%)`); }
  if (sigla === 'tabV' && m.pillola) { const P = m.pillola; if (P.top == null || P.striscia == null) ko.push('6: pillola o striscia non misurabili'); else if (P.top - 30 < P.striscia + 2) ko.push(`6: la pillola dell'esito parte a ${Math.round(P.top)} px (sale di 30 px visibili) e la striscia delle statistiche arriva a ${P.striscia} px`); }
  const fasi = { walkout: m.walkout, gioco: m.gioco, movimento: m.movSt, scelta: m.sceltaSt, rigore: m.rigSt, punizione: m.punSt };
  for (const [k, st] of Object.entries(fasi)) if (st && st.hs > 2) ko.push(`7: scorrimento orizzontale ${st.hs} px in ${k}`);
  if (tab) {
    for (const [k, st] of Object.entries(fasi)) if (st) { const p = piccoli(st); if (p.length) ko.push(`3: zone di tocco < 40 px in ${k}: ${p.slice(0, 4).join(', ')}`); }
    for (const [k, st] of Object.entries({ movimento: m.movSt, scelta: m.sceltaSt })) if (st && st.suggerimento) ko.push(`3: suggerimento da tastiera ([0]/WASD) a tocco in ${k}`);
  }
  if (!tel) {
    for (const [k, e] of Object.entries({ movimento: m.mov, scelta: m.scelta, rigore: m.rig3d })) if (e) {
      const dentro = Math.abs(e.hx) <= 0.92 && Math.abs(e.hy) <= 0.92; if (!dentro) ko.push(`4: eroe fuori quadro in ${k} (ndc ${e.hx}, ${e.hy})`);
      if (e.hh < 0.04) ko.push(`4: eroe troppo piccolo in ${k} (${(e.hh * 100).toFixed(1)}% del canvas)`);
      if (k !== 'scelta') { const p = e.pali; if (!p || !p.every(q => q && Math.abs(q.x) <= 0.97 && Math.abs(q.y) <= 0.97)) ko.push(`4: porta non intera in quadro in ${k} (pali ${JSON.stringify(p && p.map(q => q && [q.x, q.y]))})`); }
    }
  }
  if (pc && m.crediti) { if (!m.crediti.aperti) ko.push('8: i Crediti non si aprono (sonda cieca)'); else if (m.crediti.dopoEsc) ko.push('8: Esc non chiude i Crediti'); }
  if (pc && m.opzioni) { if (!m.opzioni.aperte) ko.push('8: Opzioni non si apre (sonda cieca)'); else if (m.opzioni.dopoEsc) ko.push('8: Esc non chiude Opzioni'); }
  if (pc && m.tab) { if (!/Ufficio/i.test(m.tab.u || '')) ko.push(`9: il tasto U non apre l'Ufficio (scheda attiva: ${m.tab.u})`); if (!/Club/i.test(m.tab.l || '')) ko.push(`9: il tasto L non apre il Club (scheda attiva: ${m.tab.l})`); if (!/Ufficio/i.test(m.tab.frecce || '')) ko.push(`9: le frecce non arrivano all'Ufficio (scheda attiva: ${m.tab.frecce})`); }
  if (pc && m.tasti2 !== undefined) { if (m.tasti2 === 'hl_choose') ko.push('5: il tasto 2 non sceglie nella scelta numerata'); }
  if (pc && m.rigTasto !== undefined) { if (m.rigTasto === 'hl_choose') ko.push('5: il tasto 2 non sceglie sul rigore'); }
  if (pc && m.punFuoco !== undefined) { if (!m.punFuoco) ko.push('5: con Tab il fuoco non arriva a una scelta della punizione'); else if (m.punTasto === 'hl_choose') ko.push('5: Invio sulla punizione non sceglie'); }
  return ko;
}
const TUTTO = { ok: true };
const esiti = {};
if (!SOLO_ROSSO) {
  for (const s of SCELTI) { const r = await giro(s, false, true); r.ko.push(...giudica(s, r)); esiti[s] = r;
    const g = r.mis.gioco, m = r.mis.mov; console.log(`${FORMATI[s].nome}: scheda ${g && g.card ? g.card.join('x') : '-'} · campo ${g && g.cv ? g.cv[2] + 'x' + g.cv[3] : '-'} · eroe ${m ? `ndc ${m.hx},${m.hy} alto ${(m.hh * 100).toFixed(1)}%` : '-'} · pre-partita ${r.mis.colonna ? r.mis.colonna.sx + '/' + r.mis.colonna.dx : '-'} · tocco<40 ${r.mis.gioco ? piccoli(r.mis.gioco).length : '-'}`);
    r.ko.forEach(k => console.log('  ❌ ' + k)); if (r.ko.length) TUTTO.ok = false; }
  /* 8) telefono invariato: stesse misure con e senza interruttori */
  if (SCELTI.includes('tel')) { const v = esiti.tel; const r = await giro('tel', true, false); const a = [stR(v.mis.gioco), stR(v.mis.sceltaRapida)], c = [stR(r.mis.gioco), stR(r.mis.sceltaRapida)];
    const uguali = JSON.stringify(a) === JSON.stringify(c); console.log(`Telefono 412x915: ${uguali ? '✅ identico con e senza gli interruttori' : '❌ DIVERSO'}`);
    if (!uguali) { TUTTO.ok = false; a.forEach((x, i) => { if (JSON.stringify(x) !== JSON.stringify(c[i])) console.log('  ❌ 8: fase ' + i + ' verde ' + JSON.stringify(x).slice(0, 300) + ' | rosso ' + JSON.stringify(c[i]).slice(0, 300)); }); } }
}
if (ROSSO_ON || SOLO_ROSSO) {
  /* il rosso deve far cadere i controlli che lo riguardano (la 177) */
  const cade = { larghezza: 0, centrata: 0, tocco: 0, tasti: 0, striscia: 0, scorciatoie: 0 };
  for (const s of SCELTI.filter(x => x !== 'tel')) { const r = await giro(s, true, (SOLO_ROSSO || !FORMATI[s].touch) ? true : false); const ko = giudica(s, r); esiti['rosso-' + s] = { ko };
    { const g = r.mis.gioco, m = r.mis.mov; console.log(`  (177) ${FORMATI[s].nome}: scheda ${g && g.card ? g.card.join('x') : '-'} · campo ${g && g.cv ? g.cv[2] + 'x' + g.cv[3] : '-'} · eroe ${m ? `ndc ${m.hx},${m.hy} alto ${(m.hh * 100).toFixed(1)}%` : '-'} · pre-partita ${r.mis.colonna ? r.mis.colonna.sx + '/' + r.mis.colonna.dx : '-'} · piccoli ${r.mis.gioco ? piccoli(r.mis.gioco).join(',') : '-'}`); }
    console.log(`ROSSO ${FORMATI[s].nome}: ${ko.length ? ko.map(k => k.split(':')[0]).filter((v, i, a) => a.indexOf(v) === i).join(',') : 'nessun controllo cade'}`); if (SOLO_ROSSO) ko.forEach(k => console.log('   ' + k));
    if (ko.some(k => /^1:/.test(k))) cade.larghezza++; if (ko.some(k => /^2:/.test(k))) cade.centrata++; if (ko.some(k => /^3:/.test(k))) cade.tocco++; if (ko.some(k => /^5:/.test(k))) cade.tasti++; if (ko.some(k => /^(8|9):/.test(k))) cade.scorciatoie++; if (ko.some(k => /^6:/.test(k))) cade.striscia++; }
  if (!SOLO_ROSSO) {
    const n = SCELTI.filter(x => x !== 'tel').length, nT = SCELTI.filter(x => FORMATI[x].tab).length, nP = SCELTI.filter(x => FORMATI[x].touch === false).length;
    const attesi = []; if (cade.larghezza < n) attesi.push(`larghezza (cade su ${cade.larghezza}/${n})`); if (nT && cade.tocco < nT) attesi.push(`tocco (cade su ${cade.tocco}/${nT})`); if (nP && cade.tasti < nP) attesi.push(`tasti (cade su ${cade.tasti}/${nP})`); if (nP && cade.scorciatoie < nP) attesi.push(`Esc e scorciatoie (cade su ${cade.scorciatoie}/${nP})`);
    if (cade.striscia < Math.max(0, SCELTI.filter(x => ['pc1366', 'pc1920', 'tabO'].includes(x)).length)) attesi.push('striscia nel campo');
    if (attesi.length) { console.log('  ❌ il rosso NON fa cadere: ' + attesi.join('; ')); TUTTO.ok = false; } else console.log('  ✅ il rosso (la 177) fa cadere larghezza, tocco, tasti e striscia nel campo');
  }
}
await b.close(); srv.close();
if (SOLO_ROSSO) process.exit(0);
console.log(TUTTO.ok ? 'PC-TABLET-292: ✅ VERDE' : 'PC-TABLET-292: ❌ ROSSO'); process.exit(TUTTO.ok ? 0 : 1);
