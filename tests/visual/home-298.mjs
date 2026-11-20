#!/usr/bin/env node
/* [giro 298 · blocco 2 «Pulizia Home e schermate» · DECISIONI 20/11 13:20] GUARDIANO home-298.
   Cinque giudizi, a 375x667, 412x915 e 1366x768, dal salvataggio del PO (fixtures/save-c177-s5w20, professionista, Deutsche Liga):
     A (PO-558) nessun riquadro Classifica in Home;
     B (PO-559) un solo riquadro «Notizie»: dentro ci sono TUTTE le voci che prima stavano in «Notizie della settimana» e in
       «Ultime notizie» (lette sulla stessa pagina col rosso acceso, stessa risoluzione), la settimana sopra, le tue sotto,
       le tue nello stesso ordine del registro (piu' recenti prima);
     C (PO-568) nella scheda Classifica non c'e' «Dagli altri campionati»;
     D (PO-571) la riga sotto la testata della Classifica segue l'obiettivo del club: 4 club veri di prestigio diverso (obiettivo
       titolo · Europa · meta' classifica · salvezza, dato da generateSeasonObjectives) x 4 posizioni in classifica, piu' una seconda
       divisione e una lega senza seconda serie; il testo atteso lo calcola QUI il guardiano, con la sua copia della regola.
       A classifica ferma (nessuna giornata giocata) la riga resta quella di prima (la 1ª giornata e' di PO-420, 199);
     E (PO-572) in Opzioni, con gli Strumenti di collaudo accesi, non c'e' «Tempo della partita simulata».
   «Non giudicato» = rosso: ogni giudizio dichiara cosa ha guardato. Rosso: __CPM_NO_G298 (CPM_ROSSO=1) deve riprodurre TUTTI e cinque.
   Uso: node home-298.mjs · CPM_ROSSO=1 node home-298.mjs · CPM_FOTO=1 salva la Home in docs/sviluppo/giro298/ (prima = rosso, dopo = verde) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO === '1';
const FOTO = process.env.CPM_FOTO === '1';
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'sviluppo', 'giro298');
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url)));
const RIS = [[375, 667], [412, 915], [1366, 768]];
const M = '−';
const norm = s => String(s || '').replace(/\s+/g, ' ').trim();

/* la regola di PO-571 riscritta dal guardiano (non importa quella del gioco) */
function atteso({ target, tipo, pts, io }) {
  const N = pts.length, me = pts[io];
  const nAlta = tipo === 'seconda' ? 3 : tipo === 'prima' ? 7 : 2, zona = tipo === 'seconda' ? 'zona promozione' : 'zona Europa';
  const nRetro = tipo === 'prima' && N > 6 ? 3 : 0;
  let ob = target <= 3 ? 'titolo' : target <= 6 ? 'europa' : target <= 9 ? 'meta' : 'salvezza';
  if ((ob === 'meta' || ob === 'salvezza') && !nRetro) ob = 'europa';
  if (ob === 'titolo') return io === 0 ? `In testa, +${me - pts[1]}` : `${M}${pts[0] - me} dalla vetta`;
  if (ob === 'europa') return io < nAlta ? `+${me - pts[nAlta]} sulla ${zona}` : `${M}${pts[nAlta - 1] - me} dalla ${zona}`;
  if (io >= N - 3) return `In zona retrocessione, ${M}${pts[N - 4] - me}`;
  return `+${me - pts[N - 3]} ${ob === 'meta' ? 'sulla salvezza' : 'sulla zona retrocessione'}`;
}
const vecchio = ({ pts, io }) => io === 0 ? `+${pts[0] - pts[1]} sulla seconda` : `${M}${pts[0] - pts[io]} dalla vetta`;

async function apri(browser, port, w, h, rosso) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e && e.message || e).slice(0, 160)));
  await page.addInitScript(([S, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G298 = 1; for (const k of Object.keys(S)) { try { localStorage.setItem(k, S[k]); } catch (e) {} }
    try { localStorage.removeItem('cpm-match-resume'); localStorage.setItem('cpm-devtools', '1'); } catch (e) {} }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(900);
  await page.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); C.goTab('dashboard'); });
  await sleep(1200); await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(400);
  return { ctx, page, err };
}

/* Home: riquadri di primo livello (Card con `momento`) e voci delle notizie (ogni nodo di testo, apre i riquadri delle notizie) */
async function leggiHome(page) {
  await page.evaluate(() => { for (const b of document.querySelectorAll('button[aria-expanded="false"]')) if (/notizi/i.test(b.innerText || '')) b.click(); });
  await sleep(500);
  return page.evaluate(() => {
    const cand = [...document.querySelectorAll('button[aria-expanded]')].map(b => b.parentElement).filter(el => el && el.firstElementChild && el.firstElementChild.matches('button[aria-expanded]'));
    const carte = cand.filter(el => !cand.some(o => o !== el && o.contains(el))).filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    const tit = el => ((el.firstElementChild.innerText || '').split('\n').map(s => s.trim()).filter(Boolean)[0] || '?');
    const titoli = carte.map(tit);
    const notizie = carte.filter(el => /notizi/i.test(tit(el))).map(el => {
      const voci = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { if (el.firstElementChild.contains(n)) continue; const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (t.length > 3) voci.push(t); }
      return { titolo: tit(el), voci, testo: (el.textContent || '').replace(/\s+/g, ' '),
        sett: [...el.querySelectorAll('[data-n298="s"]')].map(x => x.textContent.replace(/\s+/g, ' ').trim()), tue: [...el.querySelectorAll('[data-n298="t"]')].map(x => x.textContent.replace(/\s+/g, ' ').trim()),
        ordine: (() => { const a = el.querySelector('[data-cpm="notizie-298-sett"]'), b = el.querySelector('[data-cpm="notizie-298-tue"]'); return a && b ? !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) : null; })() };
    });
    return { titoli, notizie, pagina: (document.body.innerText || '') };
  });
}
/* foto dell'intera Home: la pagina scorre dentro un contenitore, quindi si allunga la finestra fino a contenerla (solo per la foto) */
async function foto(page, file, w, h) {
  await page.evaluate(() => { for (const b of document.querySelectorAll('button[aria-expanded="false"]')) if (/^classifica/i.test((b.innerText || '').trim())) b.click(); });
  const alt = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, ...[...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY)).map(e => e.scrollHeight + (window.innerHeight - e.clientHeight))));
  await page.setViewportSize({ width: w, height: Math.min(7000, Math.max(h, alt + 20)) }); await sleep(700);
  await page.screenshot({ path: file }); await page.setViewportSize({ width: w, height: h }); await sleep(500);
}
const CAPI = /^(notizie della settimana|ultime notizie|della settimana|le tue ultime)$/i;

/* D: i casi della riga. Scelti dentro la pagina (CLUBS e generateSeasonObjectives sono quelli del gioco), applicati con patch() */
async function casiRiga(page) {
  return page.evaluate(() => {
    const pri = LEAGUE_PAIRS.map(x => x[0]), sec = LEAGUE_PAIRS.map(x => x[1]);
    const veri = CLUBS.filter(c => !c.isU18);
    const banda = p => p >= 80 ? 3 : p >= 65 ? 6 : p >= 50 ? 9 : 12;
    const out = [];
    for (const t of [3, 6, 9, 12]) { const c = veri.filter(x => pri.includes(x.lg) && banda(x.p) === t).sort((a, b) => a.id < b.id ? -1 : 1)[0]; if (c) out.push({ c, tipo: 'prima', pos: ['primo', 'quarto', 'decimo', 'ultimo'] }); }
    /* misurato (giro 298): nessun club di prima divisione ha prestigio < 50, quindi «Finisci nei primi 12» con una zona retrocessione vera nasce solo
       da una NEOPROMOSSA (la carriera le cambia club.lg): il quarto club e' un club di seconda divisione con prestigio < 50 salito nella lega di sopra */
    if (!out.some(o => banda(o.c.p) === 12)) { const n = veri.filter(x => sec.includes(x.lg) && banda(x.p) === 12).sort((a, b) => a.id < b.id ? -1 : 1)[0];
      if (n) { const su = LEAGUE_PAIRS.find(x => x[1] === n.lg)[0], c = { ...n, lg: su }; const L = veri.filter(x => x.lg === su).sort((a, b) => b.p - a.p).slice(0, -1);
        out.push({ c, tipo: 'prima', pos: ['primo', 'quarto', 'decimo', 'ultimo'], legaFatta: [...L, c] }); } }
    const s = veri.filter(x => sec.includes(x.lg)).sort((a, b) => b.p - a.p)[0]; if (s) out.push({ c: s, tipo: 'seconda', pos: ['secondo', 'decimo'] });
    const u = veri.filter(x => !pri.includes(x.lg) && !sec.includes(x.lg)).sort((a, b) => a.p - b.p)[0]; if (u) out.push({ c: u, tipo: 'sola', pos: ['secondo', 'decimo'] });
    return out.map(o => ({ c: o.c, tipo: o.tipo, pos: o.pos, lega: (o.legaFatta || veri.filter(x => x.lg === o.c.lg)).map(x => ({ id: x.id, n: x.n, a: x.a, p: x.p, c: x.c, c2: x.c2, nat: x.nat, lg: x.lg })) }));
  });
}
async function leggiRiga(page, caso, posNome, fermo) {
  const N = caso.lega.length, io = { primo: 0, secondo: 1, quarto: 3, decimo: Math.min(9, N - 4), ultimo: N - 1 }[posNome];
  const altri = caso.lega.filter(x => x.id !== caso.c.id); const ord = [...altri.slice(0, io), caso.lega.find(x => x.id === caso.c.id), ...altri.slice(io)];
  const pts = ord.map((_, i) => fermo ? 0 : 70 - 3 * i - (i % 2));
  const r = await page.evaluate(async ([c, ord, pts, fermo]) => {
    const C = window.__CPM_CAREER, p0 = C.snapshot();
    const so = generateSeasonObjectives({ ...p0, club: c });
    const st = ord.map((x, i) => ({ ...x, pts: pts[i], played: fermo ? 0 : 20, wins: 0, draws: 0, losses: 0, gf: 30 - i, ga: 10 + i, gd: 20 - 2 * i }));
    C.patch({ club: c, seasonObjectives: so, standings: st }); C.goTab('standings');
    await new Promise(r => setTimeout(r, 450));
    const el = document.querySelector('[data-cpm="vetta-v2"]'); const rr = el && el.getBoundingClientRect();
    return { target: (so.find(o => o.type === 'standing') || {}).target, testo: el ? el.textContent : null, ob: el ? el.getAttribute('data-ob298') : null, vis: !!(rr && rr.width > 0 && rr.height > 0), dentro: !!(rr && rr.left >= -1 && rr.right <= window.innerWidth + 1) };
  }, [caso.c, ord, pts, !!fermo]);
  return { ...r, io, pts };
}

fs.mkdirSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'out'), { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const difetti = []; const visti = { A: 0, B: 0, C: 0, D: 0, E: 0 }; const no = (k, m) => { difetti.push(`[${k}] ${m}`); };
const tabella = [];
for (const [w, h] of RIS) {
  const R = `${w}x${h}`;
  /* riferimento: la stessa pagina col rosso acceso (le notizie «di prima») */
  const rif = await apri(browser, port, w, h, true); const homeRif = await leggiHome(rif.page);
  if (FOTO) { fs.mkdirSync(DIR, { recursive: true }); await foto(rif.page, path.join(DIR, `home-prima-${R}.png`), w, h); }
  let P = rif, home = homeRif;
  if (!ROSSO) { await rif.ctx.close(); P = await apri(browser, port, w, h, false); home = await leggiHome(P.page);
    if (FOTO) await foto(P.page, path.join(DIR, `home-dopo-${R}.png`), w, h); }
  const { page } = P;
  console.log(`\n${R} · ${ROSSO ? 'ROSSO' : 'verde'} · riquadri Home: ${home.titoli.join(' | ')}`);
  if (home.titoli.length < 3) no('A', `${R}: Home con ${home.titoli.length} riquadri (misura cieca)`);
  /* A */
  const cl = home.titoli.filter(t => /^classifica/i.test(t)); visti.A++;
  if (cl.length || /Classifica\s*·\s*W\./i.test(home.pagina)) no('A', `${R}: riquadro Classifica in Home (${cl.length})`);
  /* B */
  const prima = homeRif.notizie.flatMap(n => n.voci).filter(v => !CAPI.test(v)); visti.B++;
  if (homeRif.notizie.length !== 2 || prima.length < 4) no('B', `${R}: riferimento cieco (riquadri notizie di prima: ${homeRif.notizie.length}, voci ${prima.length})`);
  if (home.notizie.length !== 1) no('B', `${R}: ${home.notizie.length} riquadri di notizie in Home (${home.notizie.map(n => n.titolo).join(' + ')})`);
  else {
    const u = home.notizie[0];
    if (u.titolo !== 'Notizie') no('B', `${R}: titolo «${u.titolo}»`);
    const perse = prima.filter(v => !u.testo.includes(v)); if (perse.length) no('B', `${R}: ${perse.length} notizie perse (${perse[0].slice(0, 50)}…)`);
    if (u.ordine !== true) no('B', `${R}: la settimana non sta sopra le tue ultime (${u.ordine})`);
    const log = (await page.evaluate(() => window.__CPM_CAREER.snapshot().log || [])).slice(0, 5).map(norm);
    if (JSON.stringify(u.tue) !== JSON.stringify(log)) no('B', `${R}: le tue ultime non sono le prime ${log.length} del registro nello stesso ordine`);
    console.log(`   B: ${prima.length} voci di prima, ${u.sett.length} della settimana + ${u.tue.length} tue nel riquadro unico, perse ${perse.length}`);
  }
  /* C */
  await page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await sleep(900);
  const txtS = await page.evaluate(() => document.body.innerText || ''); visti.C++;
  if (!/vetta|seconda|testa|zona|salvezza/i.test(txtS)) no('C', `${R}: scheda Classifica non riconosciuta (misura cieca)`);
  if (/Dagli altri campionati/i.test(txtS)) no('C', `${R}: «Dagli altri campionati» presente`);
  /* E (prima di D, che cambia club) */
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(500);
  try { await page.locator('button[aria-label="Opzioni"]').first().click({ timeout: 5000 }); } catch (e) {}
  await sleep(900);
  const txtO = await page.evaluate(() => document.body.innerText || '');
  if (!/Strumenti di collaudo/i.test(txtO)) no('E', `${R}: Strumenti di collaudo non trovati in Opzioni (misura cieca)`);
  else { visti.E++; if (/Tempo della partita simulata/i.test(txtO)) no('E', `${R}: «Tempo della partita simulata» presente`); }
  await page.keyboard.press('Escape').catch(() => {}); await sleep(300);
  if (/Strumenti di collaudo/i.test(await page.evaluate(() => document.body.innerText || ''))) { try { await page.getByText(/^(Chiudi|Indietro|←.*|✕|×)$/).first().click({ timeout: 2000 }); } catch (e) {} await sleep(400); }
  /* D */
  const casi = await casiRiga(page);
  const ob4 = new Set(casi.filter(c => c.tipo === 'prima').map(c => c.c.p >= 80 ? 3 : c.c.p >= 65 ? 6 : c.c.p >= 50 ? 9 : 12));
  if (ob4.size < 4) no('D', `${R}: solo ${ob4.size} obiettivi diversi fra i club di prima divisione (ne servono 4)`);
  let nD = 0, nOk = 0;
  for (const caso of casi) for (const pos of caso.pos) {
    const r = await leggiRiga(page, caso, pos, false); nD++;
    const att = atteso({ target: r.target, tipo: caso.tipo, pts: r.pts, io: r.io });
    const ok = r.testo != null && norm(r.testo) === att && r.vis && r.dentro; if (ok) nOk++;
    if (w === 375) tabella.push(`| ${caso.c.n} | ${caso.c.lg} | ${caso.c.p} | primi ${r.target} | ${r.io + 1}° | ${vecchio(r)} | ${r.testo} |`);
    if (!ok) no('D', `${R}: ${caso.c.n} (${caso.c.lg}, prestigio ${caso.c.p}, primi ${r.target}) ${r.io + 1}°: «${r.testo}» ≠ «${att}»${r.vis ? '' : ' · non visibile'}${r.dentro ? '' : ' · fuori schermo'}`);
  }
  const f = await leggiRiga(page, casi[1], 'quarto', true); nD++;
  if (norm(f.testo) !== vecchio(f)) no('D', `${R}: a classifica ferma «${f.testo}» ≠ regola di prima «${vecchio(f)}»`); else nOk++;
  visti.D += nD; console.log(`   D: ${nOk}/${nD} righe coerenti con l'obiettivo (${casi.length} club, ${ob4.size} obiettivi di prima divisione)`);
  if (P.err.length) no('X', `${R}: ${P.err.length} errori di pagina (${P.err[0]})`);
  await P.ctx.close();
}
await browser.close(); srv.close();
for (const k of Object.keys(visti)) if (!visti[k]) no(k, 'mai giudicato');
console.log(''); difetti.forEach(d => console.log('  · ' + d));
if (FOTO && !ROSSO) fs.writeFileSync(path.join(DIR, 'riga-571.md'), '| Club | Lega | Prestigio | Obiettivo | Posizione | Prima | Dopo |\n|---|---|---|---|---|---|---|\n' + tabella.join('\n') + '\n');
if (ROSSO) {
  const manca = ['A', 'B', 'C', 'D', 'E'].filter(k => !difetti.some(d => d.startsWith(`[${k}]`) && !/cieca|mai giudicato/.test(d)));
  const cieco = difetti.filter(d => /cieca|mai giudicato|errori di pagina/.test(d));
  const ok = !manca.length && !cieco.length;
  console.log(ok ? `✅ home-298 ROSSO come atteso: con __CPM_NO_G298 tornano tutti e cinque i difetti (${difetti.length} rilievi)` : `❌ home-298: il rosso non riproduce ${manca.join(', ') || '—'}${cieco.length ? ' · misure cieche: ' + cieco.length : ''}`);
  process.exit(ok ? 0 : 1);
}
const verde = difetti.length === 0;
console.log(verde ? `✅ home-298 verde: nessuna Classifica in Home, un solo riquadro Notizie senza voci perse, niente «Dagli altri campionati», riga coerente con l'obiettivo, niente misura del tempo (${RIS.length} risoluzioni)` : '❌ home-298');
process.exit(verde ? 0 : 1);
