#!/usr/bin/env node
/* [collaudo 7.999.170 — carriera, NON 3D] Tre settimane di carriera da un salvataggio reale (S12 OVR93), a una
   larghezza di telefono (uso: node collaudo-170-carriera.mjs 412 | 360). Misura, senza modificare il gioco:
   - settimana per settimana: classifica (gol fatti == subiti, V/N/P e punti coerenti), tabellino vs tabellone;
   - scritte tecniche vietate nel testo visibile (PO-249) su dashboard, calendario, classifica, home;
   - home: badge d'avvio «v x.y.z» senza PROD/TEST (PO-255), pulsante Crediti con 16 voci e fonti (PO-254);
   - procuratore «Il confronto» in finestra standard (PO-253) e toast mai sopra un Modal aperto (PO-256);
   - copia di riserva degli slot (PO-167) e riquadri home (PO-066);
   Scrive docs/collaudi/foto-170-carriera/dati-<larghezza>.json e le foto. Non modifica il gioco. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const W = Number(process.argv[2] || 412);
const H = W === 360 ? 800 : 915;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'docs/collaudi/foto-170-carriera');
fs.mkdirSync(OUT, { recursive: true });
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SETTIMANE = Number(process.env.CPM_SETTIMANE || 3);

const srv = await startServer();
const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await installCdnRoutes(page);
await page.addInitScript(s => {
  window.__CPM_GLB = false; window.__CPM_REC = true;
  localStorage.setItem('cpm-v3', JSON.stringify(s));
}, SAVE);
const errori = [];
page.on('pageerror', e => errori.push('pageerror: ' + e.message));
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 });
await sleep(1200);
let log0 = {};
log0.badge = await page.evaluate(() => { const el = document.querySelector('[data-cpm="badge255"]'); return { trovato: !!el, testo: el ? el.textContent : null }; });
const btnCred0 = page.getByRole('button', { name: /^Crediti$/ }).first();
if (await btnCred0.count()) {
  await btnCred0.click({ timeout: 4000 }).catch(() => {}); await sleep(700);
  await page.screenshot({ path: path.join(OUT, `${W}-00-crediti.png`) });
  log0.crediti = await page.evaluate(() => {
    const voci = [...document.querySelectorAll('[data-cpm="crediti238-voce"]')];
    const txt = (document.querySelector('[data-cpm="crediti238-pannello"]') || {}).innerText || document.body.innerText || '';
    return { voci: voci.length, sezioni: document.querySelectorAll('[data-cpm="crediti238-sez"]').length, daCompletare: (txt.match(/da completare/gi) || []).length, nonPosso: (txt.match(/Non posso confermarlo/g) || []).length, testo: txt.slice(0, 900) };
  });
  await page.keyboard.press('Escape').catch(() => {}); await sleep(300);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^Chiudi$/.test((x.innerText || '').trim())); if (b) b.click(); }); await sleep(300);
}
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
await sleep(1500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}

const aspetta = async (testo, ms = 3000) => {
  for (let t = 0; t < ms; t += 150) {
    if (await page.evaluate(x => (document.body.innerText || '').includes(x), testo)) return true;
    await sleep(150);
  }
  return false;
};
const shot = async nome => page.screenshot({ path: path.join(OUT, `${W}-${nome}.png`) });
const VIETATI = /\bfps\b|\bundefined\b|\bNaN\b|\[object [A-Za-z]+\]|\bnull\b|\bInfinity\b/g;
const testoVietato = () => page.evaluate(src => {
  const t = document.body.innerText || '';
  const re = new RegExp(src, 'g');
  const hits = []; let m;
  while ((m = re.exec(t)) && hits.length < 20) hits.push(t.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\n/g, ' ⏎ '));
  return hits;
}, VIETATI.source);
const abs = () => page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return (p.season || 1) * 38 + (p.week || 1); });
const snapStand = () => page.evaluate(() => {
  const st = window.__CPM_CAREER.snapshot().standings || [];
  const gf = st.reduce((s, r) => s + (r.gf || 0), 0), ga = st.reduce((s, r) => s + (r.ga || 0), 0);
  const incoerenti = st.filter(r => (r.pts || 0) !== 3 * (r.wins || 0) + (r.draws || 0) || (r.played || 0) !== (r.wins || 0) + (r.draws || 0) + (r.losses || 0)).map(r => r.n || r.name || r.id);
  return { squadre: st.length, gf, ga, uguali: gf === ga, incoerenti };
});
const snapCal = () => page.evaluate(() => {
  const p = window.__CPM_CAREER.snapshot();
  const cal = p.calendar || [];
  const sto = (p.matchHistory || []).slice(-1)[0] || null;
  const cs = sto ? cal.find(c => c.played && c.week === sto.week && (!c.type || c.type === 'league')) : null;
  return { voci: cal.length, giocate: cal.filter(c => c.played).length, ultima: cs || null, storia: sto, storiaN: (p.matchHistory || []).length };
});

const log = { larghezza: W, settimane: [], errori, vietati: {}, consegne: {}, nonConfermato: [] };
const start = await abs();
let steps = 0, esiti = {};
let ultimaSett = start;
while ((await abs()) < start + SETTIMANE && steps < 300) {
  let r = await page.evaluate(() => window.__CPM_CAREER.step());
  if (String(r) === 'seasonEnd') {
    await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); await sleep(800);
    await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goScreen('dashboard'); });
    log.fineStagioneForzata = (log.fineStagioneForzata || 0) + 1;
    await sleep(500);
    r = 'seasonEnd-gestita';
  }
  steps++; esiti[String(r).split(':')[0]] = (esiti[String(r).split(':')[0]] || 0) + 1;
  const sNow = await abs();
  if (sNow !== ultimaSett || String(r).startsWith('seasonEnd')) {
    /* controllo a ogni cambio di settimana: classifica e tabellino */
    await page.evaluate(() => window.__CPM_CAREER.dismiss());
    log.settimane.push({ settimana: sNow, classifica: await snapStand(), calendario: await snapCal() });
    ultimaSett = sNow;
  }
  if (String(r).startsWith('error')) { log.errori.push('step: ' + r); break; }
  if (String(r).startsWith('blocked')) { log.errori.push('step bloccato: ' + r); break; }
  await sleep(120);
}
log.step = { n: steps, esiti };
log.stato = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { season: p.season, week: p.week, club: p.club && (p.club.n || p.club.name), proStatus: p.proStatus, nationsCupActive: !!(p.nationsCupQueue && p.nationsCupQueue.active && !p.nationsCupQueue.done) }; });

/* chiusura dei modali di fine partita/stagione con i bottoni VERI, poi fotografia delle schermate */
await page.evaluate(() => window.__CPM_CAREER.dismiss());
for (let k = 0; k < 4; k++) { const f = await page.getByRole('button', { name: /festeggia|chiudi|continua/i }).first().click({ timeout: 1500 }).then(() => true, () => false); if (!f) break; await sleep(500); }
await sleep(600);
await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(800);
await shot('01-dashboard'); log.vietati.dashboard = await testoVietato(VIETATI.source);
await page.evaluate(() => window.__CPM_CAREER.goTab('calendar')); await sleep(800);
await shot('02-calendario'); log.vietati.calendario = await testoVietato(VIETATI.source);
await page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await sleep(800);
await shot('03-classifica'); log.vietati.classifica = await testoVietato(VIETATI.source);

/* home: badge d'avvio (PO-255) e riquadri (PO-066) */
await page.evaluate(() => window.__CPM_CAREER.goScreen('home')); await sleep(900);
await shot('04-home');
log.badge = await page.evaluate(() => {
  const el = document.querySelector('[data-cpm="badge255"]');
  const box = [...document.querySelectorAll('div')].find(d => d.style.position === 'fixed' && d.style.bottom === '6px');
  return { trovato: !!el, testo: el ? el.textContent : null, testoBox: box ? box.innerText : null };
});
log.vietati.home = await testoVietato(VIETATI.source);

/* Crediti (PO-254): pulsante del kit in home, 16 voci attese, fonti non lasciate come nota di lavorazione */
const btnCred = page.getByRole('button', { name: /^Crediti$/ }).first();
if (await btnCred.count()) {
  await btnCred.click({ timeout: 4000 }).catch(() => {}); await sleep(700);
  await shot('05-crediti');
  log.crediti = await page.evaluate(() => {
    const voci = [...document.querySelectorAll('[data-cpm="crediti238-voce"]')];
    const t = document.querySelector('[data-cpm="crediti238-pannello"]');
    const txt = (t && t.innerText) || document.body.innerText || '';
    return {
      voci: voci.length,
      fonteDaCompletare: (txt.match(/da completare/gi) || []).length,
      nonPosso: (txt.match(/Non posso confermarlo/g) || []).length,
      sezioni: [...document.querySelectorAll('[data-cpm="crediti238-sez"]')].length,
    };
  });
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(400);
} else {
  log.nonConfermato.push('PO-254: pulsante Crediti non trovato in home');
}

/* Procuratore «Il confronto» (PO-253) e toast sopra il Modal (PO-256) */
await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(900);
await page.evaluate(() => window.__CPM_CAREER.apriIntro253()); await sleep(900);
await shot('06-procuratore');
log.procuratore = await page.evaluate(() => {
  const t = document.body.innerText || '';
  const modali = [...document.querySelectorAll('[role="dialog"], [data-cpm*="modal"], div')].filter(d => /Il confronto/.test((d.innerText || '').slice(0, 60)) && d.getBoundingClientRect().height > 200).length;
  return { titoloTrovato: /Il primo incontro/.test(t), titoloConfronto: /Il confronto/.test(t), finestre: modali };
});
/* toast durante un Modal aperto: deve restare sotto il Modal o non comparire */
await page.evaluate(() => window.__CPM_CAREER.notify247('💪 Prova toast 256'));
log.toastConModale = { comparso: await aspetta('Prova toast 256') };
await shot('07-toast-su-modale');
log.toastSuModale = await page.evaluate(() => {
  const nodo = [...document.querySelectorAll('div,span')].find(d => (d.innerText || '').trim() === 'Prova toast 256' || /Prova toast 256/.test(d.textContent || '') && d.children.length === 0);
  if (!nodo) return { toast: false, nota: 'toast non trovato a schermo: nessuna sovrapposizione' };
  const r = nodo.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const top = document.elementFromPoint(cx, cy);
  return { toast: true, sopraModale: !!(top && nodo.contains(top)), elemento: top ? (top.tagName + ' ' + (top.innerText || '').slice(0, 40).replace(/\n/g, ' ')) : null };
});
/* il modale «Il primo incontro» non si chiude da script (ne' dismiss() ne' i bottoni): si ricarica la pagina
   sullo stesso salvataggio, e il controllo del toast si misura su una pagina senza modale */
log.procuratoreChiuso = 'non chiudibile da script: pagina ricaricata';
await page.reload({ waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 });
await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
await sleep(1200);
await page.evaluate(() => window.__CPM_CAREER.dismiss()); await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(900);
await page.evaluate(() => window.__CPM_CAREER.notify247('💪 Controllo toast 256'));
log.toastControllo = { visibile: await aspetta('Controllo toast 256') };
await sleep(3500);

/* copia di riserva (PO-167): la chiave <slot>-riserva esiste dopo i salvataggi della carriera */
log.backup = await page.evaluate(() => {
  const chiavi = Object.keys(localStorage);
  return { chiavi: chiavi.filter(k => k.startsWith('cpm-v3')), riserva: chiavi.filter(k => /riserva/.test(k)) };
});

/* giornale (PO-244) e interviste (PO-243/247): sono nei flussi di Nazionale e post-partita, non nelle 3 settimane */
log.giornaleVisibile = await page.evaluate(() => /giornale/i.test(document.body.innerText || ''));
log.nazionaleAttiva = log.stato.nationsCupActive;
if (!log.nazionaleAttiva) log.nonConfermato.push('PO-243 intervista post-Nazionale: nessuna Nazionale attiva nelle 3 settimane → non verificabile senza forzatura');

log.overflow = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));

log.iniziale = log0;
fs.writeFileSync(path.join(OUT, `dati-${W}.json`), JSON.stringify(log, null, 2));
console.log(JSON.stringify({
  larghezza: W, stato: log.stato, step: log.step,
  settimane: log.settimane.map(s => ({ s: s.settimana, uguali: s.classifica.uguali, incoerenti: s.classifica.incoerenti.length, giocate: s.calendario.giocate })),
  toastConModale: log.toastConModale, procuratoreChiuso: log.procuratoreChiuso, badge: log0.badge, crediti: log0.crediti && { voci: log0.crediti.voci, sezioni: log0.crediti.sezioni, daCompletare: log0.crediti.daCompletare, nonPosso: log0.crediti.nonPosso }, toastControllo: log.toastControllo, procuratore: log.procuratore, toastSuModale: log.toastSuModale,
  backup: log.backup, overflow: log.overflow, nonConfermato: log.nonConfermato,
  vietati: Object.values(log.vietati).flat().length, errori: errori.length,
}, null, 2));
await b.close(); srv.close();
