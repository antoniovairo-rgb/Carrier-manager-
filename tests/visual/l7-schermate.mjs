#!/usr/bin/env node
/* [L7 · giro 7 — SCHERMATE FUORI STANDARD SUL TELEFONO]
   Apre la carriera con tre salvataggi (inizio · meta · fine stagione) e misura, a tre larghezze di
   telefono (360 · 375 · 412), la home (dashboard) e l'analisi pre-partita. Per ogni schermata:
     S1  sforamento orizzontale — elementi visibili il cui bordo destro supera la larghezza del
         telefono e NON sono ritagliati da un antenato con overflow (quelli sono contati a parte);
     S2  testo tagliato in orizzontale — nodi con testo e overflow nascosto/ellissi che hanno
         scrollWidth > clientWidth (il testo esce dal riquadro e viene ritagliato);
     S3  testo tagliato in verticale — nodi con testo in contenitore a altezza fissa che hanno
         scrollHeight > clientHeight (il testo e' cucito dentro un'altezza che non lo contiene);
     S4  testo sotto gli 11 px (leggibilita' sul telefono).
   + foto per fase/larghezza/schermata in docs/sviluppo/foto-l7/ e numeri in misura.json.

   Modalita':
     node l7-schermate.mjs                 → misura + foto (non esce ≠0 per i difetti: li dichiara)
     CPM_L7_GUARDIA=1 node l7-schermate.mjs → guardiano: esce 1 se una schermata toccata sfora o taglia
     CPM_L7_ROSSO=<id> node l7-schermate.mjs → prova del rosso: reintroduce il difetto <id> nella pagina
                                              e il guardiano DEVE uscire 1.

   Salvataggi: quelli reali in fixtures/ (save-190 = fine stagione 12). Inizio e meta' sono DERIVATI
   dal save-190 (settimana riscritta, partite giocate azzerate/dimezzate): sono sintetici e lo
   dichiarano il nome della fase nel report. Non sono una carriera vera.

   NON MODIFICA IL GIOCO: solo misura e foto. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import { INIT } from './lib/banco-g0.mjs';

const GUARDIA = process.env.CPM_L7_GUARDIA === '1';
const ROSSO = (process.env.CPM_L7_ROSSO || '').trim();
const LARGHEZZE = (process.env.CPM_L7_LARG || '360,375,412').split(',').map(Number);
const OUT = path.join(ROOT, 'docs', 'sviluppo', 'foto-l7');
const FIX = path.join(ROOT, 'tests', 'visual', 'fixtures');
const SEME = 4242;

/* Prova del rosso: CPM_L7_ROSSO=__CPM_NO_L7_SUB accende l'interruttore nel gioco (window.<id>=true prima del
   caricamento), che riporta il difetto com'era. Il guardiano DEVE allora uscire 1. */

const load = f => JSON.parse(fs.readFileSync(path.join(FIX, f), 'utf8'));
const fine = load('save-190-s12-ovr93.json');
/* Derivazione sintetica: stessa carriera, settimana e partite giocate cambiate. */
function derivato(giocate) {
  const s = JSON.parse(JSON.stringify(fine));
  const cal = s.player.calendar || [];
  /* la settimana corrente è quella della prossima partita da giocare, presa dal calendario */
  s.player.week = (cal[giocate] || cal[cal.length - 1]).week;
  cal.forEach((m, i) => { m.played = i < giocate; if (i >= giocate) m.result = null; });
  return s;
}
const FASI = [
  { id: 'inizio', nome: 'Inizio stagione (sintetico: nessuna partita giocata)', save: derivato(0) },
  { id: 'meta', nome: 'Meta stagione (sintetico: 20 partite giocate)', save: derivato(20) },
  { id: 'fine', nome: 'Fine stagione (reale, fixtures save-190)', save: fine },
];

/* La misura gira DENTRO la pagina. */
const MISURA = (larg) => {
  const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.05; };
  const clippa = el => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'hidden' || o === 'auto' || o === 'scroll' || o === 'clip') return true; } return false; };
  const testoProprio = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
  const etichetta = el => (el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '') + ' «' + (el.textContent || '').trim().slice(0, 36) + '»');
  const tutti = [...document.querySelectorAll('body *')].filter(vis);
  const sfora = tutti.filter(el => el.getBoundingClientRect().right > larg + 0.5 && !clippa(el));
  const sforaClip = tutti.filter(el => el.getBoundingClientRect().right > larg + 0.5 && clippa(el));
  const troncoH = tutti.filter(el => testoProprio(el) && (getComputedStyle(el).overflowX !== 'visible' || getComputedStyle(el).textOverflow === 'ellipsis') && el.scrollWidth > el.clientWidth + 1);
  const troncoV = tutti.filter(el => testoProprio(el) && getComputedStyle(el).overflowY === 'hidden' && el.scrollHeight > el.clientHeight + 1);
  const piccoli = tutti.filter(el => testoProprio(el) && parseFloat(getComputedStyle(el).fontSize) < 11);
  /* S5 sovrapposizioni: due blocchi di testo visibili che si incrociano senza essere l'uno dentro l'altro */
  /* esclusi: la barra d'ambiente di collaudo («TEST» · «KE versione», src/19 r.879) e il contenuto che
     scorre SOTTO una barra fissa/appiccicata (nav, strisce «Sostieni»/«Idee»): non e' sovrapposizione, e' scorrimento. */
  const badge = document.querySelector('[title="Ambiente di esecuzione"]');
  const escluso = el => !!(badge && badge.parentElement && badge.parentElement.contains(el));
  const inFissa = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { const p = getComputedStyle(a).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
  const testi = tutti.filter(testoProprio).filter(el => !escluso(el)).slice(0, 700);
  const sovrap = [];
  for (let i = 0; i < testi.length; i++) for (let j = i + 1; j < testi.length; j++) {
    const a = testi[i], b = testi[j];
    if (a.contains(b) || b.contains(a)) continue;
    if (inFissa(a) !== inFissa(b)) continue;
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    if (w > 2 && h > 2) sovrap.push(etichetta(a) + ' ⟂ ' + etichetta(b));
  }
  return {
    nSovrap: sovrap.length, esempiSovrap: sovrap.slice(0, 4),
    larghezza: larg,
    scrollW: document.documentElement.scrollWidth,
    sforamentoPx: Math.max(0, document.documentElement.scrollWidth - larg),
    nSfora: sfora.length, esempiSfora: sfora.slice(0, 4).map(etichetta),
    nSforaClip: sforaClip.length,
    nTroncoH: troncoH.length, esempiTroncoH: troncoH.slice(0, 4).map(etichetta),
    nTroncoV: troncoV.length, esempiTroncoV: troncoV.slice(0, 4).map(etichetta),
    nPiccoli: piccoli.length, minFont: piccoli.length ? Math.min(...piccoli.map(el => parseFloat(getComputedStyle(el).fontSize))) : null,
  };
};

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const errori = []; const DATI = {};
fs.mkdirSync(OUT, { recursive: true });

for (const fase of FASI) {
  const page = await browser.newPage({ viewport: { width: LARGHEZZE[0], height: 800 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  page.on('pageerror', e => errori.push(`${fase.id} · ${String(e.message).slice(0, 120)}`));
  await installCdnRoutes(page);
  await page.addInitScript(INIT, { seme: SEME, tema: 'chiaro', rossi: [], save: fase.save });
  if (ROSSO) await page.addInitScript(k => { window[k] = true; }, ROSSO);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) { errori.push(`${fase.id}: «Continua» non trovato`); }
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).catch(() => errori.push(`${fase.id}: __CPM_CAREER assente`));
  await sleep(900);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {}
  await sleep(400);
  const schermate = [];
  await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(400);
  schermate.push(['dashboard', null]);
  for (const w of LARGHEZZE) {
    await page.setViewportSize({ width: w, height: 800 }); await sleep(300);
    await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(350);
    const m = await page.evaluate(MISURA, w);
    (DATI[fase.id] = DATI[fase.id] || {})[`dashboard@${w}`] = m;
    await page.screenshot({ path: path.join(OUT, `${fase.id}-dashboard-${w}.png`), animations: 'disabled', caret: 'hide', fullPage: true, timeout: 60000 });
  }
  /* pre-partita: la stessa via del giocatore, senza giocare */
  const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
  if (pm === true) {
    await page.waitForFunction(() => /VS|OSPITE|CASA/.test(document.body.innerText || ''), null, { timeout: 40000 }).catch(() => errori.push(`${fase.id}: prepartita non aperta`));
    for (const w of LARGHEZZE) {
      await page.setViewportSize({ width: w, height: 800 }); await sleep(350);
      const m = await page.evaluate(MISURA, w);
      (DATI[fase.id] = DATI[fase.id] || {})[`prepartita@${w}`] = m;
      await page.screenshot({ path: path.join(OUT, `${fase.id}-prepartita-${w}.png`), animations: 'disabled', caret: 'hide', fullPage: true, timeout: 60000 });
    }
  } else errori.push(`${fase.id}: playMatch → ${pm}`);
  await page.close();
}

fs.writeFileSync(path.join(OUT, 'misura.json'), JSON.stringify({ rosso: ROSSO || null, larghezze: LARGHEZZE, fasi: FASI.map(f => ({ id: f.id, nome: f.nome })), dati: DATI, errori: [...new Set(errori)] }, null, 1) + '\n');
let righe = 0;
for (const [fase, sc] of Object.entries(DATI)) for (const [k, m] of Object.entries(sc)) {
  righe++;
  console.log(`${fase.padEnd(7)} ${k.padEnd(20)} sfora ${String(m.nSfora).padStart(2)} (+${m.sforamentoPx}px) · clip-H ${String(m.nTroncoH).padStart(2)} · clip-V ${String(m.nTroncoV).padStart(2)} · sovrap ${String(m.nSovrap).padStart(2)} · <11px ${String(m.nPiccoli).padStart(3)}${m.minFont != null ? ` (min ${m.minFont})` : ''}`);
  if (m.esempiSovrap.length) console.log('    sovrap: ' + m.esempiSovrap.join(' | '));
  if (m.esempiSfora.length) console.log('    sfora: ' + m.esempiSfora.join(' | '));
  if (m.esempiTroncoH.length) console.log('    tronco-H: ' + m.esempiTroncoH.join(' | '));
  if (m.esempiTroncoV.length) console.log('    tronco-V: ' + m.esempiTroncoV.join(' | '));
}
if (errori.length) console.log('errori: ' + [...new Set(errori)].join(' · '));

/* Guardiano: solo nelle schermate toccate e' bloccante; per ora raccoglie tutto. */
let rossi = 0;
if (GUARDIA) {
  for (const [fase, sc] of Object.entries(DATI)) for (const [k, m] of Object.entries(sc)) {
    if (m.nSfora > 0 || m.sforamentoPx > 0 || m.nTroncoH > 0 || m.nTroncoV > 0) { rossi++; console.log(`✗ ${fase} ${k}: sforo/tagliato`); }
  }
  console.log(rossi ? `✗ GUARDIANO L7: ${rossi} schermate con difetti` : '✓ GUARDIANO L7: nessuno sforamento né testo tagliato');
}
await browser.close(); srv.close();
process.exit(GUARDIA && rossi ? 1 : 0);
