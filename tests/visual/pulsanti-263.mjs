#!/usr/bin/env node
/* [giro 263 · PO-514 «Pulsanti tra di loro sproporzionati»] GUARDIANO pulsanti-263 (e sonda di misura prima/dopo).
   Foto del PO (docs/collaudo-po/196-home-pulsanti-sproporzionati.jpg): nella scheda «Prossima» della Home, Mondiale vs Belgio, il pulsante
   principale era stretto e alto (testo su 9 righe) e «SIMULA / prima il torneo della Nazionale» largo quasi il doppio.
   Decisione della madre (notte): i due pulsanti hanno STESSA larghezza e STESSA altezza in ogni caso; il titolo del principale sta in al
   piu' 2 righe, il dettaglio in UNA riga che puo' troncare con «…»; niente «poi: …» nel pulsante (c'e' gia' la riga «Poi:» sopra); il
   motivo del pulsante spento resta leggibile.
   Casi: club · nazionale (Mondiale, girone) · coppa · settimana (da vivere: Simula spento) · infortunio (Simula spento).
   Larghezze 360 · 375 · 412 · 1366. Per ogni caso e larghezza (verde):
     - rapporto larghezze principale/Simula in [0,95 · 1,05]; altezze uguali entro 2 px;
     - titolo del principale <= 2 righe (righe distinte dei rettangoli del testo); dettaglio <= 1 riga;
     - nessun «poi:» dentro il pulsante principale; ogni testo troncato porta il testo intero nel title (data-tronca263); motivo del pulsante spento presente, corpo >= 11 px, contrasto >= 4,5:1, mai troncato;
     - zero errori di pagina. Un pulsante o un caso che non si trova = non giudicato = rosso.
   BRACCIO ROSSO: window.__CPM_NO_G263 (com'era) — deve cadere (almeno il caso nazionale a 360/375/412).
   Foto (dpr 2) in docs/sviluppo/giro263/ (prima = braccio rosso, dopo = verde). Uscita 0 solo se il verde passa E il rosso cade.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node pulsanti-263.mjs   (P263_BRACCI=verde,rosso · P263_LARGHEZZE=360,375) */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, SAVE, INIT, entraInCarriera } from './c178-graf-lib.mjs';
import { preparaCalendario } from './c180-lib.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro263'); fs.mkdirSync(FOTO, { recursive: true });
const BRACCI = (process.env.P263_BRACCI || 'verde,rosso').split(',');
const LARGHE = (process.env.P263_LARGHEZZE || '360,375,412,1366').split(',').map(Number);
const ALTEZZA = { 360: 800, 375: 667, 412: 915, 1366: 768 };
const S = SAVE.player.season;
const CASI = [
  { id: 'club', patch: { nationsCupQueue: null, euroMondiale: null, injured: false, weekLived: true }, spento: false },
  { id: 'nazionale', patch: { nationsCupQueue: null, injured: false, weekLived: true, euroMondiale: { active: true, done: false, type: 'Mondiale', phase: 'group', qualDone: true, groupOpponents: ['Belgio', 'Croazia', 'Svezia'], groupMatchIdx: 0, groupPts: 0, season: S } }, spento: true },
  { id: 'coppa', coppa: true, patch: { nationsCupQueue: null, euroMondiale: null, injured: false, weekLived: true }, spento: false },
  { id: 'settimana', patch: { nationsCupQueue: null, euroMondiale: null, injured: false, weekLived: false }, spento: true },
  { id: 'infortunio', patch: { nationsCupQueue: null, euroMondiale: null, injured: true, injuryWeeks: 3, injuryType: 'stiramento', weekLived: true }, spento: true },
];
/* coppa: la gara del club di questa settimana diventa un turno di coppa (come lo scrive il gioco: type "cup", cupRoundName) */
const PREP_COPPA = () => { const C = window.__CPM_CAREER; const p = C.snapshot(); const wk = p.week; const cal = (p.calendar || []).filter(m => !(m.week === wk && !m.played));
  C.patch({ calendar: [...cal, { matchday: 990 + wk, week: wk, type: 'cup', competition: 'Coppa', cupRoundName: 'Ottavi di finale', opponentId: 'x-cup', opponentName: 'Real Castilla Atlético', isHome: false, played: false, result: null }] }); return wk; };
const CHIUDI_OVL = () => { const W = innerWidth, H = innerHeight; let o = null; for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none') continue; const r = e.getBoundingClientRect(); if (r.width * r.height >= 0.4 * W * H && (parseInt(c.zIndex) || 0) >= 50 && e.querySelector('button')) o = e; }
  if (!o) return false; const bt = [...o.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0); if (!bt.length) return false; (bt.find(x => /chiudi|continua|ok|✕/i.test(x.textContent || '')) || bt[0]).click(); return true; };
/* misura dentro la pagina */
const MISURA = () => {
  const a = document.querySelector('button[data-cpm="avanza23"]'), s = document.querySelector('button[data-cpm="simula-v2"]');
  if (!a || !s) return { motivo: 'pulsanti assenti' };
  const righe = (el) => { if (!el) return 0; const r = document.createRange(); r.selectNodeContents(el); const t = []; for (const q of r.getClientRects()) { if (q.width < 0.5 || q.height < 2) continue; if (!t.some(x => Math.abs(x - q.top) < 3)) t.push(q.top); } return t.length; };
  const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  /* fondo effettivo: risale finche' trova un colore opaco; un fondo semitrasparente si compone sopra quello del genitore */
  const fondo = (el) => { const pila = []; for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c.length >= 3) { const al = c.length > 3 ? c[3] : 1; if (al > 0) { pila.push([c[0], c[1], c[2], al]); if (al >= 1) break; } } }
    let base = [255, 255, 255]; for (let i = pila.length - 1; i >= 0; i--) { const [r, g, b, al] = pila[i]; base = [r * al + base[0] * (1 - al), g * al + base[1] * (1 - al), b * al + base[2] * (1 - al)]; } return base; };
  const ra = a.getBoundingClientRect(), rs = s.getBoundingClientRect();
  const sp = [...a.children];
  const tit = a.querySelector('[data-p263="titolo"]') || sp[0] || null; const det = a.querySelector('[data-p263="dettaglio"]') || sp[1] || null;
  const mot = s.querySelector('[data-cpm="simula-motivo"]');
  let motivo = null; if (mot) { const cs = getComputedStyle(mot); const fg = rgb(cs.color), bg = fondo(mot); const L1 = lum(fg), L2 = lum(bg);
    motivo = { testo: mot.textContent, px: parseFloat(cs.fontSize), contrasto: +(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05))).toFixed(2), troncato: mot.scrollWidth > mot.clientWidth + 1 || cs.textOverflow === 'ellipsis' && cs.overflow === 'hidden', righe: righe(mot) }; }
  return { wA: +ra.width.toFixed(1), hA: +ra.height.toFixed(1), wS: +rs.width.toFixed(1), hS: +rs.height.toFixed(1), rTit: righe(tit), rDet: det ? righe(det) : 0, testoA: (a.textContent || '').trim(), titolo: tit ? tit.textContent : null, dettaglio: det ? det.textContent : null,
    tronchi: [a, s].flatMap(b => [...b.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map(e => { const t = e.closest('[data-tronca263]'); return { testo: (e.textContent || '').trim(), title: t ? t.getAttribute('title') : null }; })),
    sDis: !!s.disabled, motivo, poiNelPulsante: /poi:/i.test(a.textContent || ''), righeA: righe(a) };
};
function giudica(m, c) {
  if (!m || m.motivo === 'pulsanti assenti' || m.wA == null) return 'non giudicato (pulsanti assenti)';
  const out = [];
  const rap = m.wA / m.wS; if (!(rap >= 0.95 && rap <= 1.05)) out.push(`rapporto larghezze ${rap.toFixed(2)} (${m.wA}/${m.wS})`);
  if (Math.abs(m.hA - m.hS) > 2) out.push(`altezze ${m.hA}/${m.hS}`);
  if (!(m.rTit >= 1 && m.rTit <= 2)) out.push(`titolo su ${m.rTit} righe`);
  if (m.rDet > 1) out.push(`dettaglio su ${m.rDet} righe`);
  if (m.poiNelPulsante) out.push('«poi:» ripetuto nel pulsante');
  /* [giro 263] un testo troncato con «…» porta il testo intero nel title (data-tronca263), altrimenti e' un taglio non voluto */
  for (const t of (m.tronchi || [])) if (!t.title || t.title.trim() !== t.testo) out.push(`troncato senza testo intero: «${t.testo.slice(0, 30)}»`);
  if (c.spento !== m.sDis) out.push(`Simula ${m.sDis ? 'spento' : 'acceso'} (atteso ${c.spento ? 'spento' : 'acceso'})`);
  if (c.spento) { if (!m.motivo) out.push('motivo del pulsante spento assente'); else { if (m.motivo.px < 11) out.push(`motivo a ${m.motivo.px}px`); if (m.motivo.contrasto < 4.5) out.push(`motivo contrasto ${m.motivo.contrasto}`); if (m.motivo.troncato) out.push('motivo troncato'); } }
  return out.join('; ');
}
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const esiti = {};
try {
  for (const braccio of BRACCI) {
    const fl = braccio === 'rosso' ? ['__CPM_NO_G263'] : []; const R = esiti[braccio] = [];
    console.log(`\n== braccio ${braccio}${fl.length ? ' (' + fl.join(',') + ')' : ''}`);
    for (const w of LARGHE) {
      const errs = []; const mob = w < 900;
      const ctx = await b.newContext({ viewport: { width: w, height: ALTEZZA[w] || 800 }, deviceScaleFactor: 2, serviceWorkers: 'block', ...(mob ? { isMobile: true, hasTouch: true } : {}) });
      const page = await ctx.newPage(); await installCdnRoutes(page); page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
      await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: fl, save: SAVE });
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
      const dentro = await entraInCarriera(page, errs);
      const cal = dentro ? await preparaCalendario(page, SAVE) : { md: null };
      for (const c of CASI) {
        let m = null, tipo = null, mot;
        if (dentro && cal.md) {
          await page.evaluate(pt => { const C = window.__CPM_CAREER; C.dismiss(); C.patch(pt); }, c.patch); await sleep(400);
          if (c.coppa) { await page.evaluate(PREP_COPPA); await sleep(400); }
          await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(900);
          await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(300);
          for (let i = 0; i < 4; i++) { const ch = await page.evaluate(CHIUDI_OVL).catch(() => false); if (!ch) break; await sleep(700); }
          tipo = await page.evaluate(() => { const m = window.__CPM_CAREER.thisWeekMd(); return m && (m.type || 'lega'); }).catch(() => null);
          await page.evaluate(() => { const e = document.querySelector('section[data-cpm="prossima-v2"]'); if (e) e.scrollIntoView({ block: 'center' }); }); await sleep(300);
          m = await page.evaluate(MISURA).catch(e => ({ motivo: 'misura fallita ' + String(e).slice(0, 60) }));
          if (w !== 1366 || c.id === 'nazionale') { const sec = await page.$('section[data-cpm="prossima-v2"]'); if (sec) await sec.screenshot({ path: path.join(FOTO, `${braccio === 'rosso' ? 'prima' : 'dopo'}-${c.id}-${w}.png`) }).catch(() => {}); }
        }
        mot = !dentro || !cal.md ? 'non giudicato (carriera o calendario non pronti)' : giudica(m, c);
        if (c.coppa && tipo !== 'cup') mot = (mot ? mot + '; ' : '') + `non giudicato (gara della settimana di tipo ${tipo}, attesa coppa)`;
        if (errs.length) mot = (mot ? mot + '; ' : '') + 'errori pagina: ' + errs.slice(0, 2).join(' | ');
        const ok = !mot; R.push({ w, caso: c.id, ok, mot, m });
        console.log(`  ${ok ? '✓' : '✗'} ${w} ${c.id}: A ${m?.wA}x${m?.hA} · S ${m?.wS}x${m?.hS} · titolo ${m?.rTit} righe «${(m?.titolo || '').slice(0, 40)}» · dettaglio ${m?.rDet} «${(m?.dettaglio || '').slice(0, 50)}» · righe pulsante ${m?.righeA}${m?.motivo ? ` · motivo «${m.motivo.testo}» ${m.motivo.px}px c${m.motivo.contrasto} ${m.motivo.righe}r` : ''}${ok ? '' : ' → ' + mot}`);
      }
      await ctx.close();
    }
  }
} finally { await b.close(); srv.close(); }
fs.writeFileSync(path.join(FOTO, 'misure-263.json'), JSON.stringify(esiti, null, 1));
let fallito = false; console.log('\n=== pulsanti-263');
if (esiti.verde) { const r = esiti.verde.filter(x => !x.ok).length, n = esiti.verde.length, ok = r === 0 && n === CASI.length * LARGHE.length; if (!ok) fallito = true; console.log(`  VERDE: ${n} controlli, ${r} rossi → ${ok ? 'PASSA' : 'FALLISCE'}`); }
if (esiti.rosso) { const naz = esiti.rosso.filter(x => x.caso === 'nazionale' && x.w < 900); const caduti = naz.filter(x => !x.ok && !/non giudicato/.test(x.mot));
  const ok = naz.length > 0 && caduti.length === naz.length; if (!ok) fallito = true; console.log(`  ROSSO (__CPM_NO_G263): nazionale al telefono caduto ${caduti.length}/${naz.length}, rossi totali ${esiti.rosso.filter(x => !x.ok).length}/${esiti.rosso.length} → ${ok ? 'CADE COME DEVE' : 'NON CADE: il guardiano e\' cieco'}`); }
if (!esiti.verde || !esiti.rosso) { console.log('  (un braccio non eseguito: guardiano non completo)'); fallito = true; }
console.log(fallito ? '\n✗ pulsanti-263 ROSSO' : '\n✓ pulsanti-263 VERDE');
process.exit(fallito ? 1 : 0);
