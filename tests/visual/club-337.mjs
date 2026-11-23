#!/usr/bin/env node
/* [giro 337 · PO-606 + PO-617] GUARDIANO club-337. Dal salvataggio del PO (fixtures/save-c177-s5w20, professionista, giornate giocate):
     A (PO-606) nella scheda Club c'e' il riquadro «La stagione» SOPRA LA PIEGA a 412x915: titolo, ambizione e obiettivo dentro lo schermo
       senza scorrere (e anche a 375x667 e 1366x768 il riquadro sta in cima, prima di Stadio);
     B (PO-617) nella scheda Club non c'e' la riga «Contratto: … · Dettagli in Agente ›»;
     C (PO-606, una fonte sola) per 3 club veri di prima divisione con prestigio diverso (obiettivo «primi 3 / 6 / 9»), in due posizioni
       di classifica ciascuno: l'ambizione e l'obiettivo del riquadro Club sono quelli della Home (riquadro «Obiettivi della stagione») e
       quelli che il guardiano ricalcola con la SUA copia della regola del giro 298; la riga di posizione e' quella della scheda Classifica;
       il colore dice verde se la posizione centra l'obiettivo, rosso se no;
     D (PO-606) obiettivi personali con avanzamento: almeno una riga con la sua barra.
   «Non giudicato» = rosso. Rosso: __CPM_NO_G337 (CPM_ROSSO=1) deve riprodurre A, B, C e D.
   Uso: node club-337.mjs · CPM_ROSSO=1 node club-337.mjs · CPM_FOTO=1 salva le foto in docs/sviluppo/giro337/ (prima = rosso, dopo = verde) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO === '1';
const FOTO = process.env.CPM_FOTO === '1';
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'sviluppo', 'giro337');
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url)));
const RIS = [[412, 915], [375, 667], [1366, 768]];
const norm = s => String(s || '').replace(/\s+/g, ' ').trim();

/* la regola del giro 298 riscritta dal guardiano: club di PRIMA divisione con seconda serie e piu' di 6 squadre */
const usatoAtteso = t => t <= 3 ? 'titolo' : t <= 6 ? 'europa' : t <= 9 ? 'meta' : 'salvezza';

async function apri(browser, port, w, h, rosso) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: FOTO ? 2 : 1 });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e && e.message || e).slice(0, 160)));
  await page.addInitScript(([S, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G337 = 1; for (const k of Object.keys(S)) { try { localStorage.setItem(k, S[k]); } catch (e) {} }
    try { localStorage.removeItem('cpm-match-resume'); } catch (e) {} }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(900);
  await page.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); C.goTab('club'); });
  await sleep(1200); await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(400);
  return { ctx, page, err };
}
/* scorre in cima ogni contenitore che scorre (la pagina vive dentro un contenitore) */
const inCima = page => page.evaluate(() => { window.scrollTo(0, 0); for (const e of document.querySelectorAll('*')) if (e.scrollTop) e.scrollTop = 0; });

async function leggiClub(page) {
  await inCima(page); await sleep(300);
  return page.evaluate(() => {
    const q = s => document.querySelector(s), R = el => el ? el.getBoundingClientRect() : null;
    const box = q('[data-cpm="stagione337"]'), am = q('[data-cpm="ambizione337"]'), ob = q('[data-cpm="obiettivo337"]'), pos = q('[data-cpm="posizione337"]');
    const stadio = [...document.querySelectorAll('button[aria-expanded]')].find(b => /^stadio/i.test((b.innerText || '').trim()));
    const tuoi = box ? [...box.querySelectorAll('[data-cpm="tuoi337"] > div')].slice(1) : [];
    const txt = document.body.innerText || '';
    const club = q('[data-cpm="club-v2"]');
    return {
      club: !!club, box: !!box, boxTop: box ? R(box).top : null, amBottom: am ? R(am).bottom : null, obBottom: ob ? R(ob).bottom : null,
      primaDiStadio: !!(box && stadio && (box.compareDocumentPosition(stadio) & Node.DOCUMENT_POSITION_FOLLOWING)),
      usato: box ? box.getAttribute('data-amb337') : null, t: box ? +box.getAttribute('data-t337') : null,
      amTxt: am ? am.textContent : null, obTxt: ob ? ob.textContent : null,
      esito: pos ? pos.getAttribute('data-esito337') : null, col: pos ? getComputedStyle(pos).color : null,
      riga: (q('[data-cpm="riga337"]') || {}).textContent || null,
      tuoi: tuoi.length, barre: tuoi.filter(d => d.querySelector('div > div')).length,
      contratto: /Contratto:/.test(txt) || /Dettagli in Agente/.test(txt) || !!q('button[data-rimando235="club"]'),
      h: window.innerHeight,
    };
  });
}
async function leggiHome(page) {
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(700);
  await page.evaluate(() => { for (const b of document.querySelectorAll('button[aria-expanded="false"]')) if (/obiettivi della stagione/i.test(b.innerText || '')) b.click(); });
  await sleep(500);
  return page.evaluate(() => { const el = document.querySelector('[data-cpm="home-ambizione337"]');
    const card = [...document.querySelectorAll('button[aria-expanded]')].find(b => /obiettivi della stagione/i.test(b.innerText || ''));
    const lab = card ? (card.parentElement.innerText || '') : '';
    return { usato: el ? el.getAttribute('data-amb337') : null, t: el ? +el.getAttribute('data-t337') : null, txt: el ? el.textContent : null, card: !!card, lab }; });
}
async function leggiClassifica(page) {
  await page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await sleep(700);
  return page.evaluate(() => (document.querySelector('[data-cpm="vetta-v2"]') || {}).textContent || null);
}
/* C: 3 club veri di prima divisione, obiettivo 3 / 6 / 9, scelti nella pagina (CLUBS e generateSeasonObjectives del gioco) */
async function casi(page) {
  return page.evaluate(() => {
    const pri = LEAGUE_PAIRS.map(x => x[0]); const veri = CLUBS.filter(c => !c.isU18);
    const banda = p => p >= 80 ? 3 : p >= 65 ? 6 : p >= 50 ? 9 : 12; const out = [];
    for (const t of [3, 6, 9]) { const c = veri.filter(x => pri.includes(x.lg) && banda(x.p) === t).sort((a, b) => a.id < b.id ? -1 : 1)[0];
      if (c) out.push({ c: { id: c.id, n: c.n, a: c.a, p: c.p, c: c.c, c2: c.c2, nat: c.nat, lg: c.lg }, lega: veri.filter(x => x.lg === c.lg).map(x => ({ id: x.id, n: x.n, a: x.a, p: x.p, c: x.c, c2: x.c2, nat: x.nat, lg: x.lg })) }); }
    return out;
  });
}
async function metti(page, caso, io) {
  const altri = caso.lega.filter(x => x.id !== caso.c.id); const ord = [...altri.slice(0, io), caso.c, ...altri.slice(io)];
  return page.evaluate(async ([c, ord]) => {
    const C = window.__CPM_CAREER, p0 = C.snapshot(); const so = generateSeasonObjectives({ ...p0, club: c });
    const st = ord.map((x, i) => ({ ...x, pts: 70 - 3 * i - (i % 2), played: 20, wins: 0, draws: 0, losses: 0, gf: 30 - i, ga: 10 + i, gd: 20 - 2 * i }));
    C.patch({ club: c, seasonObjectives: so, standings: st, clubPrestigeShifts: {} }); C.goTab('club'); await new Promise(r => setTimeout(r, 600));
    return { target: (so.find(o => o.type === 'standing') || {}).target, label: (so.find(o => o.type === 'standing') || {}).label, N: st.length };
  }, [caso.c, ord]);
}
async function foto(page, file) { await inCima(page); await sleep(400); await page.screenshot({ path: file }); }

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const difetti = []; const visti = { A: 0, B: 0, C: 0, D: 0 }; const no = (k, m) => difetti.push(`[${k}] ${m}`);
if (FOTO) fs.mkdirSync(DIR, { recursive: true });
for (const [w, h] of RIS) {
  const R = `${w}x${h}`;
  if (FOTO) { const rif = await apri(browser, port, w, h, true); await foto(rif.page, path.join(DIR, `club-prima-${R}.png`)); await rif.ctx.close(); }
  const P = await apri(browser, port, w, h, ROSSO); const { page } = P;
  if (FOTO && !ROSSO) await foto(page, path.join(DIR, `club-dopo-${R}.png`));
  const c0 = await leggiClub(page);
  console.log(`\n${R} · ${ROSSO ? 'ROSSO' : 'verde'} · scheda Club ${c0.club ? 'vista' : 'NON vista'} · riquadro ${c0.box ? `in cima (top ${Math.round(c0.boxTop)}, ambizione fino a ${Math.round(c0.amBottom)} su ${c0.h})` : 'assente'}`);
  if (!c0.club) { no('X', `${R}: scheda Club non trovata (misura cieca)`); await P.ctx.close(); continue; }
  /* A */
  visti.A++;
  if (!c0.box) no('A', `${R}: riquadro «La stagione» assente`);
  else {
    if (!c0.primaDiStadio) no('A', `${R}: il riquadro non sta prima di Stadio`);
    if (w === 412 && !(c0.boxTop >= 0 && c0.obBottom != null && c0.obBottom <= c0.h)) no('A', `${R}: ambizione/obiettivo sotto la piega (fino a ${Math.round(c0.obBottom)} su ${c0.h})`);
  }
  /* B */
  visti.B++; if (c0.contratto) no('B', `${R}: riga «Contratto · Dettagli in Agente» nella scheda Club`);
  /* D */
  visti.D++; if (!c0.box || c0.tuoi < 1 || c0.barre < c0.tuoi) no('D', `${R}: obiettivi personali ${c0.tuoi} (barre ${c0.barre})`);
  /* C (solo a 412: e' la regola, non la misura dello schermo) */
  if (w === 412) {
    const cs = await casi(page);
    if (cs.length < 3) no('C', `${R}: solo ${cs.length} club con obiettivo 3/6/9 (misura cieca)`);
    let nC = 0, nOk = 0;
    for (const caso of cs) for (const io of [0, 9]) {
      const m = await metti(page, caso, io); nC++;
      const cl = await leggiClub(page); const hm = await leggiHome(page); const cla = await leggiClassifica(page);
      await page.evaluate(() => window.__CPM_CAREER.goTab('club')); await sleep(300);
      const att = usatoAtteso(m.target), centra = io + 1 <= m.target;
      const errs = [];
      if (cl.usato !== att) errs.push(`Club ${cl.usato} ≠ regola ${att}`);
      if (hm.usato !== att) errs.push(`Home ${hm.usato} ≠ regola ${att}`);
      if (norm(cl.amTxt) !== norm((hm.txt || '').replace(/^Ambizione del club:\s*/, ''))) errs.push(`testo Club «${norm(cl.amTxt)}» ≠ Home «${norm(hm.txt)}»`);
      if (cl.t !== m.target || hm.t !== m.target) errs.push(`obiettivo Club ${cl.t} / Home ${hm.t} ≠ salvataggio ${m.target}`);
      if (norm(cl.obTxt) !== norm(m.label)) errs.push(`obiettivo «${norm(cl.obTxt)}» ≠ «${m.label}»`);
      if (!hm.lab.includes(m.label)) errs.push(`la Home non mostra «${m.label}»`);
      if (norm(cl.riga) !== norm(cla)) errs.push(`riga «${norm(cl.riga)}» ≠ Classifica «${norm(cla)}»`);
      if (cl.esito !== (centra ? 'si' : 'no')) errs.push(`esito ${cl.esito} con ${io + 1}° e primi ${m.target}`);
      if (cl.col && !/(74, 222, 128|248, 113, 113)/.test(cl.col)) errs.push(`colore ${cl.col} non verde/rosso`);
      else if (cl.col && (centra ? !/74, 222, 128/.test(cl.col) : !/248, 113, 113/.test(cl.col))) errs.push(`colore ${cl.col} sbagliato`);
      if (errs.length) no('C', `${caso.c.n} (prestigio ${caso.c.p}, primi ${m.target}) ${io + 1}°: ${errs.join(' · ')}`); else nOk++;
      console.log(`   C: ${caso.c.n} p${caso.c.p} ${io + 1}° → Club «${norm(cl.amTxt)}» · Home «${norm(hm.txt)}» · ${norm(cl.riga)} · ${cl.esito}`);
    }
    visti.C += nC; console.log(`   C: ${nOk}/${nC} coerenti`);
  }
  if (P.err.length) no('X', `${R}: ${P.err.length} errori di pagina (${P.err[0]})`);
  await P.ctx.close();
}
await browser.close(); srv.close();
for (const k of Object.keys(visti)) if (!visti[k]) no(k, 'mai giudicato');
console.log(''); difetti.forEach(d => console.log('  · ' + d));
if (ROSSO) {
  const manca = ['A', 'B', 'C', 'D'].filter(k => !difetti.some(d => d.startsWith(`[${k}]`) && !/cieca|mai giudicato/.test(d)));
  const cieco = difetti.filter(d => /cieca|mai giudicato|errori di pagina/.test(d));
  const ok = !manca.length && !cieco.length;
  console.log(ok ? `✅ club-337 ROSSO come atteso: con __CPM_NO_G337 tornano A, B, C e D (${difetti.length} rilievi)` : `❌ club-337: il rosso non riproduce ${manca.join(', ') || '—'}${cieco.length ? ' · misure cieche: ' + cieco.length : ''}`);
  process.exit(ok ? 0 : 1);
}
const verde = difetti.length === 0;
console.log(verde ? `✅ club-337 verde: riquadro «La stagione» in cima (sopra la piega a 412), nessuna riga contratto, ambizione/obiettivo uguali a Home e regola, obiettivi personali con barra (${RIS.length} risoluzioni)` : '❌ club-337');
process.exit(verde ? 0 : 1);
