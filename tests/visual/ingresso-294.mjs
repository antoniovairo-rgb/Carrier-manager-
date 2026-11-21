#!/usr/bin/env node
/* [giro 294 — PO-556 · PO-567 · PO-566] GUARDIANO DEL PASSAGGIO pre-partita → Formazioni → ingresso in campo. Tre bracci, ognuno verde
   col verde e rosso col rosso (window.__CPM_NO_G294).
   A · PALLONE (PO-556): ingresso vero coi corpi GLB; la sonda PROVOCA il difetto che il gioco sul banco non produce — manda il pallone
       LOGICO sui piedi dell'eroe che cammina (__CPM_PALLA294) per tutta la finestra. Testimone __CPM_PAL294W (un campione per fotogramma,
       DOPO tutti gli scrittori). Verde: il pallone resta sul dischetto (entro 0,05 u, a terra) e nessun corpo gli arriva a meno di 1,5 u.
       Rosso: il pallone lascia il dischetto e arriva a meno di 1,5 u dall'eroe.
   B · AUDIO (PO-567): nell'ingresso il tasto della barra c'e', apre il pannello della partita, «Silenzia tutto» cambia lo stato condiviso
       (AudioMgr e 'cpm-audio'), l'icona lo dice; lo stesso tasto c'e' nella cerimonia (premiazione/parata). Rosso: nell'ingresso non c'e'.
   C · INDIETRO (PO-566): dalle Formazioni «Indietro» (e Esc) riporta al pre-partita; rientrando formazioni, numero di highlight, stato
       salvato e la cronaca fino al primo highlight sono IDENTICI a una partita aperta senza tornare indietro. Rosso: il tasto non c'e'.
   «Non giudicato» = rosso. Uso: node ingresso-294.mjs   (CPM_SOLO=A|B|C per un braccio) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SOLO = process.env.CPM_SOLO || '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ph = page => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
async function apri(o) {
  const page = await b.newPage({ viewport: { width: o.w || 412, height: o.h || 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = !!o.glb; window.__CPM_PRESENT = 1; if (o.glb) window.__CPM_WALKTEST74 = 1; window.__CPM_PAL294W = []; if (o.r) window.__CPM_NO_G294 = 1;
    if (!sessionStorage.getItem('g294')) { sessionStorage.setItem('g294', '1'); localStorage.setItem('cpm-v3', JSON.stringify(o.s)); } }, { s: SAVE, r: !!o.rosso, glb: !!o.glb });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  return { page, errs };
}
const premi = (page, re, no) => page.evaluate(([a, n]) => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => new RegExp(a, 'i').test(b.textContent || '') && !(n && new RegExp(n, 'i').test(b.textContent || ''))); if (x) { x.click(); return true; } return false; }, [re, no || '']);
async function fino(page, fase, re, no, giri = 60) { for (let k = 0; k < giri; k++) { if ((await ph(page)) === fase) return true; await premi(page, re, no); await sleep(700); } return (await ph(page)) === fase; }
const visibile = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return (r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden') ? { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y), txt: (e.textContent || '').trim() } : null; }, sel);

/* ---------- A · pallone ---------- */
async function braccioA(rosso) {
  const { page, errs } = await apri({ rosso, glb: true }); const out = { rosso };
  try {
    out.walk = await fino(page, 'walkout', 'Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua', 'Salta');
    let prov = 0; const t0 = Date.now();
    while (Date.now() - t0 < 60000 && (await ph(page)) === 'walkout') {
      const ok = await page.evaluate(() => { const W = window.__CPM_PAL294W || []; const u = W[W.length - 1]; if (!u || !u.h || !window.__CPM_PALLA294) return false; return window.__CPM_PALLA294(u.h[0] + 50, u.h[1] / 0.68 + 50); });
      if (ok) prov++; await sleep(300); }
    const W = await page.evaluate(() => window.__CPM_PAL294W || []);
    const dopo = W.slice(Math.min(W.length, 8));/* i primi fotogrammi precedono la prima provocazione */
    out.n = dopo.length; out.provocazioni = prov;
    if (dopo.length) { out.fuoriDischetto = dopo.filter(x => Math.hypot(x.b[0], x.b[2]) > 0.05 || Math.abs(x.b[1] - 0.22) > 0.05).length;
      out.dMin = Math.min(...dopo.map(x => x.d)); out.dMinEroe = Math.min(...dopo.map(x => x.de)); out.invisibile = dopo.filter(x => !x.vis).length;
      out.eroeMosso = +Math.hypot(dopo[dopo.length - 1].h[0] - dopo[0].h[0], dopo[dopo.length - 1].h[1] - dopo[0].h[1]).toFixed(1); }
    await page.screenshot({ path: new URL('./out/ingresso-294-A' + (rosso ? '-rosso' : '') + '.png', import.meta.url).pathname }).catch(() => {});
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
/* ---------- B · audio ---------- */
async function braccioB(rosso) {
  const { page, errs } = await apri({ rosso, glb: false, w: 1366, h: 768 }); const out = { rosso };
  try {
    out.walk = await fino(page, 'walkout', 'Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua', 'Salta');
    await sleep(600); out.tasto = await visibile(page, '[data-cpm="audio-partita"]');
    const muto = () => page.evaluate(() => { let l = null; try { l = JSON.parse(localStorage.getItem('cpm-audio') || 'null'); } catch (e) {} return { mgr: !!AudioMgr.getCfg().mute, ls: l ? !!l.mute : null }; });
    if (out.tasto) { out.prima = await muto();
      await page.click('[data-cpm="audio-partita"]'); await sleep(500); out.pannello = !!(await visibile(page, '[data-cpm="audio-pannello"]'));
      if (out.pannello) { await page.click('[data-cpm="audio-muto"]'); await sleep(300); out.dopo = await muto(); await page.click('[data-cpm="audio-chiudi"]'); await sleep(500); }
      out.pannelloChiuso = !(await visibile(page, '[data-cpm="audio-pannello"]')); out.icona = ((await visibile(page, '[data-cpm="audio-partita"]')) || {}).txt || null; out.faseDopo = await ph(page);
      await page.screenshot({ path: new URL('./out/ingresso-294-B.png', import.meta.url).pathname }).catch(() => {}); }
    /* lo stesso stato in partita: si salta l'ingresso e si guarda l'icona della barra */
    await page.evaluate(() => { const x = document.querySelector('[data-cpm="salta-ingresso-v2"]'); if (x) x.click(); });
    for (let k = 0; k < 40 && (await ph(page)) === 'walkout'; k++) await sleep(500);
    out.inPartita = { fase: await ph(page), icona: ((await visibile(page, '[data-cpm="audio-partita"]')) || {}).txt || null };
    /* cerimonia dentro la partita (premiazione/parata: fase `ceremony`) */
    await page.evaluate(() => window.__CPM_FORCE_CEREMONY && window.__CPM_FORCE_CEREMONY({}));
    for (let k = 0; k < 20 && (await ph(page)) !== 'ceremony'; k++) await sleep(300);
    await sleep(500); out.cerimonia = { fase: await ph(page), tasto: !!(await visibile(page, '[data-cpm="audio-partita"]')) };
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
/* ---------- C · indietro ---------- */
const impronta = page => page.evaluate(() => { const f = document.querySelector('[data-cpm="formazioni23"]'); const pulisci = s => { try { const o = JSON.parse(s); delete o.savedAt; return JSON.stringify(o); } catch (e) { return s; } };
  let h = 0; const sv = pulisci(localStorage.getItem('cpm-v3') || ''); for (let i = 0; i < sv.length; i++) h = (h * 31 + sv.charCodeAt(i)) | 0;
  return { formazioni: f ? f.innerText.replace(/\s+/g, ' ').replace(/← Indietro ?/, '').trim() : null, numHL: window.__CPM_NUMHL ? window.__CPM_NUMHL() : null, salvato: h, lung: sv.length }; });
async function cronaca(page) { /* dalle Formazioni: salta l'ingresso e gioca fino al primo highlight (il minuto e' fermo negli highlight) */
  await premi(page, "Salta l'ingresso"); const t0 = Date.now(); let f = null;
  while (Date.now() - t0 < 150000) { f = await ph(page); if (f && f !== 'playing' && f !== 'formations' && f !== 'walkout') break; await sleep(250); }
  const ev = await page.evaluate(() => { const E = (window.__CPM_EV && window.__CPM_EV()) || []; return E.map(e => { const o = { ...e }; delete o.t; delete o.ts; delete o.at; return JSON.stringify(o); }); });
  const o = await page.evaluate(() => ({ score: window.__CPM_SCORE ? window.__CPM_SCORE() : null, numHL: window.__CPM_NUMHL ? window.__CPM_NUMHL() : null, own: window.__CPM_OWN ? window.__CPM_OWN() : null }));
  return { fase: f, ev, minuto: o.own ? o.own.c : null, score: JSON.stringify(o.score), numHL: o.numHL }; }
async function braccioC(rosso, quadro) {
  const out = { rosso, quadro: quadro.w + 'x' + quadro.h };
  const { page, errs } = await apri({ rosso, glb: false, ...quadro });
  try {
    out.formazioni = await fino(page, 'formations', 'Vedi le formazioni|Diplomatico|Siamo pronti|Continua', 'Salta|Ingresso');
    await sleep(900); out.tasto = await visibile(page, '[data-cpm="indietro294"]'); const A = await impronta(page);
    if (out.tasto) {
      await page.click('[data-cpm="indietro294"]'); await sleep(700); out.dopoIndietro = await ph(page);
      out.rientro = await fino(page, 'formations', 'Vedi le formazioni|Diplomatico|Siamo pronti|Continua', 'Salta|Ingresso'); await sleep(900);
      await page.keyboard.press('Escape'); await sleep(700); out.dopoEsc = await ph(page);
      out.rientro2 = await fino(page, 'formations', 'Vedi le formazioni|Diplomatico|Siamo pronti|Continua', 'Salta|Ingresso'); await sleep(900);
      const B = await impronta(page); out.uguali = { formazioni: A.formazioni === B.formazioni && !!A.formazioni, numHL: A.numHL === B.numHL, salvato: A.salvato === B.salvato && A.lung === B.lung };
      await page.screenshot({ path: new URL('./out/ingresso-294-C-' + quadro.w + '.png', import.meta.url).pathname }).catch(() => {});
      if (quadro.partita) { out.conIndietro = await cronaca(page);
        const k = await apri({ rosso, glb: false, ...quadro });
        try { await fino(k.page, 'formations', 'Vedi le formazioni|Diplomatico|Siamo pronti|Continua', 'Salta|Ingresso'); await sleep(900); const K = await impronta(k.page);
          out.uguali.formazioniControllo = K.formazioni === B.formazioni; out.senzaIndietro = await cronaca(k.page); } finally { await k.page.close(); }
        const a = out.conIndietro, c = out.senzaIndietro;
        out.partita = { eventi: a.ev.length, eventiControllo: c.ev.length, identica: a.ev.length > 0 && a.ev.length === c.ev.length && a.ev.every((x, i) => x === c.ev[i]), minuto: [a.minuto, c.minuto], fase: [a.fase, c.fase], score: a.score === c.score, numHL: a.numHL === c.numHL };
        if (!out.partita.identica) out.diff = a.ev.map((x, i) => x === c.ev[i] ? null : [i, x.slice(0, 160), (c.ev[i] || '').slice(0, 160)]).filter(Boolean).slice(0, 3);
        delete out.conIndietro; delete out.senzaIndietro; }
    }
  } catch (e) { out.errore = String(e.message).slice(0, 160); }
  out.errori = errs.slice(0, 3); await page.close(); return out;
}
const g = []; const R = {};
if (!SOLO || SOLO === 'A') {
  const V = await braccioA(false); console.log('A VERDE ' + JSON.stringify(V)); const Ro = await braccioA(true); console.log('A ROSSO ' + JSON.stringify(Ro));
  if (!V.walk || !(V.n >= 30) || !(V.provocazioni >= 5) || !(V.eroeMosso >= 2)) g.push('A verde: non giudicato ' + JSON.stringify(V));
  else { if (V.fuoriDischetto) g.push('A verde: il pallone lascia il dischetto in ' + V.fuoriDischetto + ' fotogrammi su ' + V.n);
    if (!(V.dMin >= 1.5)) g.push('A verde: un corpo arriva a ' + V.dMin + ' u dal pallone (minimo 1,5)'); if (V.invisibile) g.push('A verde: pallone non disegnato in ' + V.invisibile + ' fotogrammi'); }
  if (V.errori.length) g.push('A verde: errori di pagina ' + V.errori.join(' | '));
  if (!Ro.walk || !(Ro.n >= 30) || !(Ro.dMinEroe < 1.5) || !Ro.fuoriDischetto) g.push('A rosso: il difetto provocato non si vede ' + JSON.stringify(Ro));
}
if (!SOLO || SOLO === 'B') {
  const V = await braccioB(false); console.log('B VERDE ' + JSON.stringify(V)); const Ro = await braccioB(true); console.log('B ROSSO ' + JSON.stringify(Ro));
  if (!V.walk) g.push('B verde: non giudicato (ingresso non raggiunto) ' + JSON.stringify(V));
  else { if (!V.tasto) g.push('B verde: nell\'ingresso il tasto audio non c\'e\'');
    else { if (!V.pannello) g.push('B verde: il tasto non apre il pannello audio');
      if (!(V.prima && V.dopo && V.dopo.mgr === !V.prima.mgr && V.dopo.ls === V.dopo.mgr)) g.push('B verde: «Silenzia tutto» non cambia lo stato condiviso ' + JSON.stringify([V.prima, V.dopo]));
      if (!V.pannelloChiuso) g.push('B verde: il pannello non si chiude'); if (V.icona !== '🔇') g.push('B verde: l\'icona nell\'ingresso non dice «muto» (' + V.icona + ')');
      if (V.faseDopo !== 'walkout' && V.faseDopo !== 'playing') g.push('B verde: dopo il pannello la fase e\' ' + V.faseDopo); }
    if (!(V.inPartita && V.inPartita.icona === '🔇')) g.push('B verde: in partita lo stato non e\' lo stesso ' + JSON.stringify(V.inPartita));
    if (!(V.cerimonia && V.cerimonia.fase === 'ceremony')) g.push('B verde: cerimonia non raggiunta (non giudicato)'); else if (!V.cerimonia.tasto) g.push('B verde: nella cerimonia il tasto audio non c\'e\''); }
  if (V.errori.length) g.push('B verde: errori di pagina ' + V.errori.join(' | '));
  if (!Ro.walk || Ro.tasto) g.push('B rosso: il difetto non si vede ' + JSON.stringify(Ro));
}
if (!SOLO || SOLO === 'C') {
  for (const q of [{ w: 412, h: 915, partita: true }, { w: 375, h: 667 }, { w: 1366, h: 768 }]) {
    const V = await braccioC(false, q); console.log('C VERDE ' + JSON.stringify(V));
    if (!V.formazioni) { g.push('C verde ' + V.quadro + ': non giudicato (Formazioni non raggiunte)'); continue; }
    if (!V.tasto) { g.push('C verde ' + V.quadro + ': il tasto Indietro non c\'e\''); continue; }
    if (Math.min(V.tasto.w, V.tasto.h) < 44) g.push('C verde ' + V.quadro + ': tasto Indietro sotto 44 px (' + V.tasto.w + 'x' + V.tasto.h + ')');
    if (V.tasto.x < 0 || V.tasto.y < 0 || V.tasto.x + V.tasto.w > q.w) g.push('C verde ' + V.quadro + ': tasto Indietro fuori dallo schermo ' + JSON.stringify(V.tasto));
    if (V.dopoIndietro !== 'matchday') g.push('C verde ' + V.quadro + ': Indietro non riporta al pre-partita (' + V.dopoIndietro + ')');
    if (V.dopoEsc !== 'matchday') g.push('C verde ' + V.quadro + ': Esc non riporta al pre-partita (' + V.dopoEsc + ')');
    if (!V.rientro || !V.rientro2) g.push('C verde ' + V.quadro + ': dal pre-partita non si rientra nelle Formazioni');
    if (!V.uguali || !V.uguali.formazioni || !V.uguali.numHL || !V.uguali.salvato) g.push('C verde ' + V.quadro + ': dopo il rientro qualcosa e\' cambiato ' + JSON.stringify(V.uguali));
    if (q.partita) { if (!V.partita || !(V.partita.eventi >= 3)) g.push('C verde: partita non giudicata ' + JSON.stringify(V.partita || V.errore));
      else if (!V.partita.identica || !V.partita.score || !V.partita.numHL || !V.uguali.formazioniControllo) g.push('C verde: la partita dopo il rientro NON e\' identica ' + JSON.stringify([V.partita, V.diff]));
      if (V.errori.length) g.push('C verde: errori di pagina ' + V.errori.join(' | ')); }
  }
  const Ro = await braccioC(true, { w: 412, h: 915 }); console.log('C ROSSO ' + JSON.stringify(Ro));
  if (!Ro.formazioni || Ro.tasto) g.push('C rosso: il difetto non si vede ' + JSON.stringify(Ro));
}
await b.close(); srv.close();
if (g.length) { console.log('❌ ingresso-294'); g.forEach(x => console.log('  · ' + x)); console.log('braccio e motivo: ' + g[g.length - 1]); process.exit(1); }
console.log('✅ ingresso-294' + (SOLO ? ' (solo ' + SOLO + ')' : '') + ': pallone fermo sul dischetto anche provocato, tasto audio in ingresso e cerimonia con lo stato della partita, Indietro ed Esc che tornano e partita identica; i tre rossi si vedono');
