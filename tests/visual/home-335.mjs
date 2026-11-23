#!/usr/bin/env node
/* [giro 335 · PO-623 + PO-615] GUARDIANO home-335 — la Home ha UN SOLO tasto primario pieno e le decisioni in sospeso in cima.
   Gioco vero (?cpmtest=1), salvataggio sintetico del giro 199 (FC Merseyside, rosso del club = il caso della foto del PO),
   nessuna partita nella settimana (il tasto «Avanza settimana» e' quello appiccicato in cima, come nella foto 202).
   Al telefono 412x915 e al PC 1366x768:
     T) tasti — fra i tasti larghi (>= 60% della colonna, >= 44 px) dei primi due schermi uno solo e' PIENO (fondo opaco che si
        stacca dal riquadro); «Avanza settimana» (avanza23) e' pieno; il tasto del momento (salta163-tasto) NON e' pieno, ha un filo
        visibile (contrasto >= 3:1 col fondo della pagina), un'icona diversa da quella di «Avanza», e il tocco apre ancora il pannello
        di conferma;
     D) decisioni — con l'offerta di sponsor aperta (popolarita' 40 → fascia «locale»): la sezione «Da decidere» (scelte199) c'e',
        il contatore e' uguale al numero di decisioni dentro, l'offerta e' DENTRO la sezione e aperta (pulsante «Firmo» visibile),
        la sezione comincia sopra la piega e sopra il tasto «Avanza settimana», nessuna finestra in piu'.
   Rosso window.__CPM_NO_G335 (= Home di oggi: due tasti pieni, offerta in fondo chiusa) → DEVE essere bocciato su T e su D.
   «Non giudicato» (un elemento non trovato) = rosso. Zero errori di pagina. Foto prima/dopo in docs/sviluppo/giro335/.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node home-335.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { salva, apri } from './misura-199.mjs';

const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro335'); fs.mkdirSync(FOTO, { recursive: true });
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const VISTE = [['telefono', 412, 915], ['pc', 1366, 768]];

/* nessuna partita nella settimana corrente: il comando e' il tasto appiccicato in cima (foto del PO) */
async function senzaPartita(page) {
  await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const wk = p.week;
    window.__CPM_CAREER.patch({ calendar: (p.calendar || []).filter(m => m.week !== wk) }); window.__CPM_CAREER.goTab('dashboard'); });
  await sleep(900);
  await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} });
  await sleep(400);
}

async function misura(page) {
  return page.evaluate(() => {
    for (const el of document.querySelectorAll('*')) if (el.scrollTop) el.scrollTop = 0; window.scrollTo(0, 0);
    const H = window.innerHeight;
    const rgb = (s) => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(x => +x); return { r: p[0], g: p[1], b: p[2], a: p[3] == null ? 1 : p[3] }; };
    const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
    const contr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    /* fondo effettivo dietro un elemento: il primo antenato con fondo opaco */
    const fondo = (el) => { let e = el && el.parentElement; while (e) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c.a > 0.9) return c; e = e.parentElement; } return { r: 13, g: 15, b: 20, a: 1 }; };
    const pagina = rgb(getComputedStyle(document.body).backgroundColor) || { r: 13, g: 15, b: 20, a: 1 };
    const info = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); const bg = rgb(cs.backgroundColor) || { r: 0, g: 0, b: 0, a: 0 };
      const dietro = fondo(el); const pieno = bg.a > 0.9 && contr(bg, dietro) >= 1.6;
      const bw = parseFloat(cs.borderTopWidth) || 0, bc = rgb(cs.borderTopColor);
      return { top: Math.round(r.top), bot: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height), pieno, bgA: bg.a,
        filo: bw >= 0.5 /* lo zoom della pagina rende 1 px come 0,89 */ && bc && bc.a > 0.5 ? +contr(bc, pagina).toFixed(2) : 0, testo: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 90) }; };
    const av = [...document.querySelectorAll('[data-cpm="avanza23"]')].filter(x => x.offsetParent !== null)[0];
    const mo = document.querySelector('[data-cpm="salta163-tasto"]');
    const col = av ? av.getBoundingClientRect().width : Math.min(window.innerWidth, 900);
    const larghi = [...document.querySelectorAll('button')].filter(b => { if (b.offsetParent === null) return false; const r = b.getBoundingClientRect();
      return r.width >= 0.6 * col && r.height >= 44 && r.top < 2 * H && r.bottom > 0; }).map(info);
    const sez = document.querySelector('[data-cpm="scelte199"]');
    const spo = document.querySelector('[data-cpm="sponsor335"]');
    const firmo = [...document.querySelectorAll('button')].filter(b => /Firmo l/.test(b.innerText || '') && b.offsetParent !== null)[0];
    const segno = document.querySelector('[data-cpm="scelta199-segno"]');
    return { H, W: window.innerWidth, avanza: info(av), momento: info(mo), larghi, pieni: larghi.filter(x => x.pieno).length,
      sez: info(sez), sezN: sez ? +sez.getAttribute('data-n') : null, sezFigli: sez ? sez.querySelectorAll('[data-cpm^="scelta199-"]:not([data-cpm="scelta199-segno"])').length : null,
      contatore: segno ? (segno.innerText.match(/\d+/) || [null])[0] : null, sponsorDentro: !!(sez && spo && sez.contains(spo)), sponsor: info(spo), firmo: info(firmo),
      finestre: document.querySelectorAll('[data-cpm="pop224"],[role="dialog"]').length };
  });
}
const icona = (t) => (String(t || '').match(/\p{Extended_Pictographic}/u) || [''])[0];

function giudicaT(m) {
  if (!m.avanza) return [false, 'non giudicato: «Avanza settimana» non trovato'];
  if (!m.momento) return [false, 'non giudicato: tasto del momento non trovato'];
  if (m.pieni !== 1) return [false, `tasti pieni ${m.pieni} (attesi 1): ` + m.larghi.filter(x => x.pieno).map(x => '«' + x.testo.slice(0, 28) + '»').join(' ')];
  if (!m.avanza.pieno) return [false, '«Avanza settimana» non e\' pieno'];
  if (m.momento.pieno) return [false, 'il tasto del momento e\' pieno'];
  if (m.momento.filo < 3) return [false, `filo del tasto del momento ${m.momento.filo}:1 < 3`];
  if (m.momento.h < 44) return [false, `tasto del momento alto ${m.momento.h} px`];
  if (icona(m.momento.testo) && icona(m.momento.testo) === icona(m.avanza.testo)) return [false, 'stessa icona sui due tasti'];
  return [true, `avanza pieno · momento filo ${m.momento.filo}:1 h${m.momento.h} «${m.momento.testo.slice(0, 60)}»`];
}
function giudicaD(m, base) {
  if (!m.avanza) return [false, 'non giudicato: «Avanza settimana» non trovato'];
  if (!m.sponsor) return [false, 'non giudicato: offerta di sponsor non trovata'];
  if (!m.sez) return [false, 'sezione «Da decidere» assente'];
  if (!m.sponsorDentro) return [false, 'l\'offerta di sponsor non e\' nella sezione'];
  if (String(m.sezN) !== String(m.contatore) || m.sezN !== m.sezFigli) return [false, `contatore ${m.contatore} · data-n ${m.sezN} · decisioni ${m.sezFigli}`];
  if (!m.firmo) return [false, 'pulsante «Firmo» non visibile (riquadro chiuso)'];
  if (!(m.sez.top < m.H)) return [false, `sezione sotto la piega (${m.sez.top} >= ${m.H})`];
  if (!(m.sez.top < m.avanza.top)) return [false, `sezione (${m.sez.top}) non sopra «Avanza» (${m.avanza.top})`];
  if (m.finestre !== base) return [false, `finestre ${m.finestre} contro ${base}`];
  return [true, `sezione@${m.sez.top} · ${m.contatore} da decidere · Firmo@${m.firmo.top} · avanza@${m.avanza.top}`];
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
try {
  for (const [rosso, flags] of [[false, []], [true, ['__CPM_NO_G335']]]) {
    console.log(rosso ? '\nROSSO __CPM_NO_G335 (Home di oggi): deve essere bocciato' : 'VERDE');
    for (const [nome, w, h] of VISTE) {
      /* T: senza decisioni (offerta declinata per la stagione) */
      const a = await apri(browser, port, salva({ sponsorDecl: { tier: 'locale', season: 3 } }), flags, w, h); await senzaPartita(a.page);
      const mt = await misura(a.page); const base = mt.finestre;
      await a.page.screenshot({ path: path.join(FOTO, `${rosso ? 'prima' : 'dopo'}-tasti-${nome}.png`) });
      let [vt, mtt] = giudicaT(mt);
      if (vt && !rosso) { /* il tocco apre ancora il pannello di conferma */
        await a.page.click('[data-cpm="salta163-tasto"]'); await sleep(700);
        const conf = await a.page.evaluate(() => !!document.querySelector('[data-cpm="salta163-conferma"]'));
        if (!conf) { vt = false; mtt = 'il tocco sul tasto del momento non apre la conferma'; }
      }
      console.log(`    ${nome} T: pieni ${mt.pieni} · avanza «${mt.avanza?.testo.slice(0, 30)}» · momento «${mt.momento?.testo.slice(0, 50)}» filo ${mt.momento?.filo} · errori ${a.errors.length}`);
      if (!rosso) ok(vt && !a.errors.length, `${nome} T verde: ${mtt}`); else ok(!vt, `${nome} T rosso bocciato (${mtt})`);
      await a.page.close();
      /* D: con l'offerta di sponsor aperta */
      const b = await apri(browser, port, salva(), flags, w, h); await senzaPartita(b.page);
      const md = await misura(b.page);
      await b.page.screenshot({ path: path.join(FOTO, `${rosso ? 'prima' : 'dopo'}-decidere-${nome}.png`) });
      const [vd, mdd] = giudicaD(md, base);
      console.log(`    ${nome} D: sezione ${md.sez ? md.sez.top : '-'} · sponsor@${md.sponsor?.top} dentro ${md.sponsorDentro} · Firmo ${md.firmo ? md.firmo.top : '-'} · avanza@${md.avanza?.top} · H ${md.H}`);
      if (!rosso) ok(vd && !b.errors.length, `${nome} D verde: ${mdd}`); else ok(!vd, `${nome} D rosso bocciato (${mdd})`);
      await b.page.close();
    }
  }
} finally { await browser.close(); srv.close(); }
console.log(fails.length ? `\n❌ home-335 ROSSO (${fails.length}): ${fails.join(' · ')}` : '\n✅ home-335 VERDE — un solo tasto pieno, «Da decidere» in cima; rosso __CPM_NO_G335 bocciato');
process.exit(fails.length ? 1 : 0);
