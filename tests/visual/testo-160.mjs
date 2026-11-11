#!/usr/bin/env node
/* [giro 160 · D20 «pavimento del testo a 12 px»] GUARDIANO testo-160 (non-gate, catena grafica).
   Decisione PO 11/11 (D20): il pavimento del testo passa da 11 a 12 px alzando il TOKEN FS.caption (non a mano nei singoli punti);
   e il taglio di 3-4 px delle finestre sul telefono lasciato aperto dal giro 150 (zoom 1,12 di .cpm-scroll) va chiuso.
   Per ogni formato (telefono 360x800 e 390x844, tablet 768x1024, PC 1366x768) e per ogni schermata (home e schede della carriera,
   piu' tre finestre: offerta, privacy, intervista settimanale) misura DENTRO LA PAGINA, sulla parte visibile (overlay se aperto):
     · CORPO MINIMO: font-size calcolato dei nodi di testo visibili (px CSS, senza lo zoom 1,12) — minimo e quanti sotto 12;
     · RIGHE: numero di righe rese dai nodi di testo (Range.getClientRects, righe distinte) e righe tagliate dal line-clamp;
     · ROTTURE: scorrimento orizzontale della pagina, elementi fuori schermo, testi tagliati senza ellissi, testi sovrapposti
       (rilevatore comune D di c178-graf-lib, lo stesso del collaudo 178);
     · FINESTRA: pannello dentro lo schermo (top >= 0, fondo <= altezza), in px reali (con lo zoom).
   Bracci: verde = gioco com'e'; rosso = banco di prova dei token (lib/tema-prova.mjs → __CPM_TEMA_PROVA {fs:{caption:11},noG160:true}),
   cioe' il pavimento a 11 e il taglio del telefono di prima — DEVE cadere. anteprima = {fs:{caption:12}} (misura prima della modifica).
   VERDE se: nessun testo visibile sotto 12 px · nessuna finestra fuori schermo · scorrimento orizzontale 0 · testi tagliati, fuori
   schermo e sovrapposti NON in aumento rispetto al rosso (stessa sequenza di pagine). «Non giudicato» (schermata non aperta,
   nessun testo misurato, finestra non trovata) = rosso. Verde e rosso stampati per ultimi.
   Uso: T160_BRACCI=verde,rosso  T160_FORMATI=tel360,...  T160_SCHERMATE=dashboard,...  T160_FOTO=<cartella>  T160_SOLO_MISURA=1
        T160_JSON=<file> (scrive le misure grezze) */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, SAVE, INIT, D } from './c178-graf-lib.mjs';
import { armaTemaRosso } from './lib/tema-prova.mjs';

const BANCHI = { verde: null, rosso: { fs: { caption: 11 }, noG160: true }, anteprima: { fs: { caption: 12 } } };
const BRACCI = (process.env.T160_BRACCI || 'verde,rosso').split(',').filter(k => k in BANCHI);
const FOTO = process.env.T160_FOTO || ''; if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const SOLO_MISURA = !!process.env.T160_SOLO_MISURA;
const PAVIMENTO = 12;
const FORMATI = {
  tel360: { w: 360, h: 800, touch: true },
  tel390: { w: 390, h: 844, touch: true },
  tab768: { w: 768, h: 1024, touch: true },
  pc1366: { w: 1366, h: 768, touch: false },
};
const SCELTI = (process.env.T160_FORMATI || Object.keys(FORMATI).join(',')).split(',').filter(k => FORMATI[k]);
const tab = t => async p => p.evaluate(x => window.__CPM_CAREER.goTab(x), t);
const SCHERMATE = {
  menu: { menu: true, fresca: true, apri: async () => true },
  opzioni: { fresca: true, apri: async p => { const bt = await p.$('button[title="Impostazioni"]'); if (!bt) return 'tasto Opzioni assente'; await bt.click(); return true; } },
  dashboard: { apri: tab('dashboard') },
  classifica: { apri: tab('standings') },
  calendario: { apri: tab('calendar') },
  coppe: { apri: tab('coppe') },
  club: { apri: tab('club') },
  profilo: { apri: tab('profile') },
  nazionale: { apri: tab('nazionale') },
  agente: { apri: tab('agente') },
  ufficio: { apri: tab('ufficio') },
  offerta: { finestra: true, apri: p => p.evaluate(() => { window.__CPM_CAREER.forceOffer(); return true; }) },
  privacy: { finestra: true, apri: async p => { const bt = await p.$('button[title="Impostazioni"]'); if (!bt) return 'tasto Opzioni assente'; await bt.click(); await sleep(700); const v = await p.$('[data-cpm="privacy118"]'); if (!v) return 'voce privacy assente'; await v.click(); await sleep(700); return (await p.$('[data-cpm="privacy134-pannello"]')) ? true : 'finestra privacy assente'; } },
  ivSett: { finestra: true, apri: p => p.evaluate(() => { window.__CPM_CAREER.forceInterview('weekly'); return true; }) },
};
const SCELTE_S = (process.env.T160_SCHERMATE || Object.keys(SCHERMATE).join(',')).split(',').filter(k => SCHERMATE[k]);

/* dentro la pagina: corpi, righe, finestra */
function TESTO(finestra) {
  const W = document.documentElement.clientWidth, H = innerHeight;
  const cs = e => getComputedStyle(e);
  const vis = e => { for (let a = e; a && a !== document.documentElement; a = a.parentElement) { const c = cs(a); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.1) return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const zoomDi = e => { let z = 1; for (let a = e; a; a = a.parentElement) { const v = parseFloat(cs(a).zoom); if (v && isFinite(v)) z *= v; } return z; };
  /* overlay a tutto campo (come D): se c'e', si misura solo quello */
  let ROOT = document.body, ovl = null;
  for (const e of document.body.querySelectorAll('*')) { const c = cs(e); if (c.position !== 'fixed' || c.display === 'none' || +c.opacity < 0.1) continue; const r = e.getBoundingClientRect(); if (r.width * r.height < 0.5 * W * H) continue; const z = parseInt(c.zIndex) || 0; if (z >= 50 && (!ovl || z >= ovl.z)) ovl = { e, z }; }
  if (ovl) ROOT = ovl.e;
  let n, nTesto = 0, minFs = 99, sotto = [], righe = 0; const tw = document.createTreeWalker(ROOT, NodeFilter.SHOW_TEXT);
  while ((n = tw.nextNode())) {
    const t = n.textContent.trim(); if (!t) continue; const p = n.parentElement; if (!p || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.tagName) || !vis(p)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const rr = [...rg.getClientRects()].filter(r => r.width > 0.5 && r.height > 0.5); if (!rr.length) continue;
    nTesto++; const f = parseFloat(cs(p).fontSize); if (f < minFs) minFs = f;
    if (f < 12 - 0.01) sotto.push({ fs: f, t: t.slice(0, 30), s: p.tagName.toLowerCase() + (p.getAttribute('data-cpm') ? '[' + p.getAttribute('data-cpm') + ']' : '') });
    const tops = new Set(rr.map(r => Math.round(r.top))); righe += tops.size;
  }
  /* line-clamp: righe nascoste */
  let clamp = 0; const clampEl = [];
  for (const e of ROOT.querySelectorAll('*')) { const c = cs(e); if (!/-webkit-box/.test(c.display) || !c.webkitLineClamp || c.webkitLineClamp === 'none') continue; if (!vis(e)) continue; if (e.scrollHeight > e.clientHeight + 2) { clamp++; clampEl.push((e.textContent || '').trim().slice(0, 30)); } }
  /* finestra: il pannello (classe cpm-pan150, o il figlio opaco piu' grande dell'overlay) in px reali */
  let pan = null;
  if (finestra) {
    const c = [...document.querySelectorAll('.cpm-pan150,[data-cpm="privacy134-pannello"]')].filter(vis);
    let el = c.sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return rb.width * rb.height - ra.width * ra.height; })[0] || null;
    if (el) { const r = el.getBoundingClientRect(); const z = zoomDi(el.parentElement) || 1;
      /* getBoundingClientRect e' gia' in px di schermo nei Chromium con zoom standard; per sicurezza si misura anche con la z degli antenati */
      pan = { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width), H, zoom: +z.toFixed(3), fuoriSopra: Math.max(0, Math.round(-r.top)), fuoriSotto: Math.max(0, Math.round(r.bottom - H)) }; }
  }
  /* testi sovrapposti FRA CONTENUTI: come il rilevatore D, ma esclusi i nodi dentro un elemento fixed/sticky diverso dall'overlay
     (barra delle schede, «Sostieni il progetto»): il contenuto scorre SOTTO quelle barre per costruzione, e quale riga ci capiti
     sotto cambia a ogni ritocco del corpo — misurato al 360: 1 → 8 «sovrapposizioni» su Nazionale solo per questo. */
  const fisso = e => { for (let a = e; a && a !== ROOT && a !== document.body; a = a.parentElement) { const p = cs(a).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
  const fo = []; const tw2 = document.createTreeWalker(ROOT, NodeFilter.SHOW_TEXT); let n2;
  while ((n2 = tw2.nextNode())) { const t = n2.textContent.trim(); if (t.length < 2) continue; const p = n2.parentElement; if (!p || !vis(p) || fisso(p)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n2); const r = rg.getBoundingClientRect(); if (r.width < 6 || r.height < 6) continue; fo.push({ p, r, t: t.slice(0, 24) }); if (fo.length > 2500) break; }
  const sov = [];
  for (let i = 0; i < fo.length && sov.length < 12; i++) for (let j = i + 1; j < fo.length; j++) { const a = fo[i], c = fo[j];
    if (a.p === c.p || a.p.contains(c.p) || c.p.contains(a.p)) continue;
    const ox = Math.min(a.r.right, c.r.right) - Math.max(a.r.left, c.r.left), oy = Math.min(a.r.bottom, c.r.bottom) - Math.max(a.r.top, c.r.top);
    if (ox <= 2 || oy <= 2) continue; if (ox * oy / Math.min(a.r.width * a.r.height, c.r.width * c.r.height) < 0.35) continue;
    sov.push({ a: a.t, b: c.t, ox: Math.round(ox), oy: Math.round(oy) }); if (sov.length >= 12) break; }
  return { nTesto, minFs: nTesto ? minFs : null, nSotto: sotto.length, sotto: sotto.slice(0, 6), righe, clamp, clampEl: clampEl.slice(0, 4), pan, nSov: sov.length, sov: sov.slice(0, 3) };
}

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const R = {};
/* una pagina per (braccio, formato) per le schede della carriera — si cambia scheda con goTab, come griglia-mobile —
   e una pagina nuova per ciascuna finestra (offerta, privacy, intervista), che si apre su una home pulita. I due bracci
   girano in parallelo, formato per formato: la sequenza dentro ciascun braccio resta identica, quindi il confronto regge. */
async function apri(braccio, f, errs, menu) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  if (BANCHI[braccio]) await armaTemaRosso(page, BANCHI[braccio]);
  await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: [], save: SAVE });
  let ng = null;
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
    await sleep(1200);
    if (menu) { await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' }); await sleep(800); return { ctx, page, ng }; }
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { ng = 'non giudicato (Continua non trovato)'; }
    const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
    if (!vivo) ng = 'non giudicato (carriera non montata)';
    else { await sleep(1500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' }); await sleep(400); }
  } catch (e) { ng = 'non giudicato (' + String(e.message).slice(0, 80) + ')'; }
  return { ctx, page, ng };
}
async function misuraUna(braccio, fk, sk, pg, errs) {
  const f = FORMATI[fk], S = SCHERMATE[sk]; const motivo = []; let m = null, d = null;
  if (pg.ng) motivo.push(pg.ng);
  else try {
    const ok = await S.apri(pg.page).catch(e => 'err ' + e.message);
    await sleep(S.finestra ? 1500 : 1100);
    if (ok !== true) motivo.push(`non giudicato (apertura: ${JSON.stringify(ok)})`);
    else {
      try { await pg.page.evaluate(() => { for (const e of document.querySelectorAll('*')) if (e.scrollTop) e.scrollTop = 0; window.scrollTo(0, 0); }); } catch (e) {}
      await sleep(150);
      m = await pg.page.evaluate(TESTO, !!S.finestra); d = await pg.page.evaluate(D, f.touch);
      if (FOTO) await pg.page.screenshot({ path: path.join(FOTO, `${braccio}-${fk}-${sk}.png`) });
      if (!m.nTesto) motivo.push('non giudicato (nessun testo misurato)');
      if (S.finestra && !m.pan) motivo.push('non giudicato (finestra non trovata)');
    }
  } catch (e) { motivo.push('non giudicato (' + String(e.message).slice(0, 80) + ')'); }
  if (errs.length) motivo.push('errori di pagina: ' + errs.slice(0, 2).join(' | '));
  const riga = { braccio, fk, sk, m, d: d ? { hs: d.hs, nFuori: d.nFuori, fuori: d.fuori.slice(0, 3), nTagliati: d.nTagliati, tagliati: d.tagliati.slice(0, 3), nEllissi: d.nEllissi } : null, motivo };
  const mm = m ? `min ${m.minFs} sotto12 ${m.nSotto} righe ${m.righe} clamp ${m.clamp}` : '—';
  const dd = riga.d ? ` hs ${riga.d.hs} fuori ${riga.d.nFuori} tagl ${riga.d.nTagliati} sov ${m ? m.nSov : '-'}` : '';
  const pp = m && m.pan ? ` pan ${m.pan.w}x${m.pan.h} top ${m.pan.top} bot ${m.pan.bottom}/${m.pan.H}` : '';
  console.log(`${braccio.padEnd(9)} ${fk.padEnd(6)} ${sk.padEnd(10)} ${mm}${dd}${pp}${motivo.length ? ' ✗ ' + motivo.join('; ') : ''}`);
  return riga;
}
async function braccioFormato(braccio, fk) {
  const out = [];
  const schede = SCELTE_S.filter(k => !SCHERMATE[k].fresca && !SCHERMATE[k].finestra), fin = SCELTE_S.filter(k => SCHERMATE[k].fresca || SCHERMATE[k].finestra);
  if (schede.length) { const errs = []; const pg = await apri(braccio, FORMATI[fk], errs);
    for (const sk of schede) out.push(await misuraUna(braccio, fk, sk, pg, errs));
    await pg.ctx.close(); }
  for (const sk of fin) { const errs = []; const pg = await apri(braccio, FORMATI[fk], errs, !!SCHERMATE[sk].menu); out.push(await misuraUna(braccio, fk, sk, pg, errs)); await pg.ctx.close(); }
  return out;
}
for (const braccio of BRACCI) R[braccio] = [];
for (const fk of SCELTI) {
  const rr = await Promise.all(BRACCI.map(br => braccioFormato(br, fk)));
  BRACCI.forEach((br, i) => R[br].push(...rr[i]));
}
await b.close(); srv.close();
if (process.env.T160_JSON) fs.writeFileSync(process.env.T160_JSON, JSON.stringify(R, null, 1));
if (SOLO_MISURA) process.exit(0);

/* giudizio */
const giud = rr => rr.map(r => {
  const k = [...r.motivo];
  if (r.m) {
    if (r.m.nSotto) k.push(`${r.m.nSotto} testi sotto ${PAVIMENTO} px (min ${r.m.minFs}): ${r.m.sotto.slice(0, 2).map(x => x.fs + '«' + x.t + '»').join(' ')}`);
    if (r.m.pan && (r.m.pan.fuoriSopra > 0 || r.m.pan.fuoriSotto > 0)) k.push(`finestra fuori schermo: ${r.m.pan.fuoriSopra} px sopra, ${r.m.pan.fuoriSotto} px sotto`);
  }
  if (r.d && r.d.hs > 0) k.push(`scorrimento orizzontale ${r.d.hs} px`);
  return { ...r, ko: k };
});
const V = giud(R.verde || []), Rr = giud(R.rosso || []);
/* non in aumento rispetto al rosso, schermata per schermata */
for (const v of V) { const r = Rr.find(x => x.fk === v.fk && x.sk === v.sk); if (!r || !r.d || !v.d) continue;
  if (v.d.nTagliati > r.d.nTagliati) v.ko.push(`testi tagliati in aumento: ${r.d.nTagliati} → ${v.d.nTagliati} ${JSON.stringify(v.d.tagliati[0] || '')}`);
  if (v.d.nFuori > r.d.nFuori) v.ko.push(`elementi fuori schermo in aumento: ${r.d.nFuori} → ${v.d.nFuori} ${JSON.stringify(v.d.fuori[0] || '')}`);
  if (v.m && r.m && v.m.nSov > r.m.nSov) v.ko.push(`testi sovrapposti in aumento: ${r.m.nSov} → ${v.m.nSov} ${JSON.stringify(v.m.sov[0] || '')}`);
}
const vKo = V.filter(x => x.ko.length);
const rCade = Rr.filter(x => x.ko.some(y => !/non giudicato|errori di pagina/.test(y)));
const rNg = Rr.filter(x => x.motivo.length);
const rCadeTesto = Rr.filter(x => x.ko.some(y => /sotto 12/.test(y))).length, rCadeFin = Rr.filter(x => x.ko.some(y => /finestra fuori/.test(y))).length;
const sum = (rr, f) => rr.reduce((a, r) => a + (r.m ? f(r.m) : 0), 0);
console.log('');
if (V.length && Rr.length) console.log(`righe di testo rese: rosso ${sum(Rr, m => m.righe)} → verde ${sum(V, m => m.righe)} · righe nascoste dal line-clamp: rosso ${sum(Rr, m => m.clamp)} → verde ${sum(V, m => m.clamp)}`);
vKo.forEach(x => console.log(`  ✗ verde ${x.fk} ${x.sk}: ${x.ko.join('; ')}`));
const g = [];
if (V.length && vKo.length) g.push(`verde: ${vKo.length}/${V.length} misure fuori regola`);
if (Rr.length && rNg.length) g.push(`rosso: ${rNg.length} misure non giudicate`);
if (Rr.length && !rCadeTesto) g.push('rosso: il pavimento a 11 non si vede (nessun testo sotto 12)');
if (Rr.length && !rCadeFin && SCELTE_S.some(s => SCHERMATE[s].finestra) && SCELTI.some(k => k.startsWith('tel'))) g.push('rosso: il taglio delle finestre sul telefono non si vede');
console.log(`ROSSO (banco fs.caption=11 + noG160): ${Rr.length ? `cade su ${rCade.length}/${Rr.length} misure (testo sotto 12: ${rCadeTesto} · finestre fuori schermo: ${rCadeFin})` : 'non eseguito'}`);
console.log(`VERDE: ${V.length ? (vKo.length ? `${vKo.length} fuori regola` : `${V.length}/${V.length} in regola`) : 'non eseguito'}`);
if (g.length) { console.log('❌ testo-160'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ testo-160 verde e il rosso cade');
