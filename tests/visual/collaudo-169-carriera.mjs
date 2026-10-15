#!/usr/bin/env node
/* [collaudo 7.999.169 — carriera, NON 3D] Tre settimane di carriera da un salvataggio reale (S12 OVR93), a una
   larghezza di telefono (uso: node collaudo-169-carriera.mjs 412 | 360). Per ogni settimana:
   - fotografa dashboard, calendario, classifica (cartelle docs/collaudi/foto-169-carriera/);
   - misura la classifica: somma gol fatti == somma gol subiti, e coerenza di V/N/P e punti;
   - confronta il calendario giocato con la storia partite (tabellino vs tabellone);
   - cerca nel testo visibile le scritte tecniche vietate (PO-249: fps, undefined, NaN, [object]).
   Scrive docs/collaudi/foto-169-carriera/dati-<larghezza>.json. Non modifica il gioco. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const W = Number(process.argv[2] || 412);
const H = W === 360 ? 800 : 915;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'docs/collaudi/foto-169-carriera');
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
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
await sleep(1500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}

const shot = async (nome) => { await page.screenshot({ path: path.join(OUT, `${W}-${nome}.png`) }); };
const testoVietato = () => page.evaluate(() => {
  const t = document.body.innerText || '';
  const re = /\bfps\b|\bundefined\b|\bNaN\b|\[object [A-Za-z]+\]|\bnull\b|\bInfinity\b/g;
  const hits = []; let m;
  while ((m = re.exec(t)) && hits.length < 20) hits.push(t.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\n/g, ' ⏎ '));
  return hits;
});
const abs = () => page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return (p.season || 1) * 38 + (p.week || 1); });
const snapStand = () => page.evaluate(() => {
  const st = window.__CPM_CAREER.snapshot().standings || [];
  const gf = st.reduce((s, r) => s + (r.gf || 0), 0), ga = st.reduce((s, r) => s + (r.ga || 0), 0);
  /* coerenza interna di ogni riga: punti = 3V + N, giocate = V + N + P (campi reali: wins/draws/losses) */
  const coerenza = st.filter(r => (r.pts || 0) !== 3 * (r.wins || 0) + (r.draws || 0) || (r.played || 0) !== (r.wins || 0) + (r.draws || 0) + (r.losses || 0)).map(r => r.n || r.name || r.id);
  return { squadre: st.length, gf, ga, uguali: gf === ga, incoerenti: coerenza, righe: st.slice(0, 3).map(r => ({ n: r.n || r.name, p: r.played, v: r.wins, n_: r.draws, s: r.losses, gf: r.gf, ga: r.ga, pts: r.pts })) };
});
const snapCal = () => page.evaluate(() => {
  const p = window.__CPM_CAREER.snapshot();
  const cal = p.calendar || [];
  const giocate = cal.filter(c => c.played);
  const sto = (p.matchHistory || []).slice(-1)[0] || null;
  /* la voce di calendario della STESSA settimana della storia (campionato): il tabellino deve dire lo stesso punteggio */
  const cs = sto ? cal.find(c => c.played && c.week === sto.week && (!c.type || c.type === 'league')) : null;
  return { voci: cal.length, giocate: giocate.length, perTipo: giocate.reduce((a, c) => ((a[c.type || 'league'] = (a[c.type || 'league'] || 0) + 1), a), {}), ultima: cs || null, storia: sto, storiaN: (p.matchHistory || []).length };
});

const log = { larghezza: W, settimane: [], errori, vietati: {}, consegne: {} };
const start = await abs();
let steps = 0, esiti = {};
while ((await abs()) < start + SETTIMANE && steps < 300) {
  let r = await page.evaluate(() => window.__CPM_CAREER.step());
  if (String(r) === 'seasonEnd') {
    /* fine stagione: si preme il bottone vero se c'e', altrimenti si torna alla home di carriera (annotato nel log) */
    await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); await sleep(800); await page.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goScreen('dashboard'); }); log.fineStagioneForzata = (log.fineStagioneForzata || 0) + 1;
    await sleep(500);
    r = 'seasonEnd-gestita';
  }
  if (steps % 10 === 0) console.log('passo ' + steps + ' sett ' + (await abs()) + ' ' + String(r));
  steps++; esiti[String(r).split(':')[0]] = (esiti[String(r).split(':')[0]] || 0) + 1;
  if (String(r).startsWith('error')) { log.errori.push('step: ' + r); break; }
  if (String(r).startsWith('blocked')) { log.errori.push('step bloccato: ' + r); break; }
  await sleep(120);
}
log.step = { n: steps, esiti };
const wk = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { season: p.season, week: p.week, club: p.club && (p.club.n || p.club.name), proStatus: p.proStatus }; });
log.stato = wk;

await page.evaluate(() => window.__CPM_CAREER.dismiss());
/* il modale di fine stagione (CAMPIONI!) resta sopra alla schermata: si chiude col bottone vero prima di fotografare */
for (let k = 0; k < 4; k++) { const f = await page.getByRole('button', { name: /festeggia|chiudi|continua/i }).first().click({ timeout: 1500 }).then(() => true, () => false); if (!f) break; await sleep(500); }
log.modaleChiuso = true;
await sleep(600);
await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(800);
await shot('01-dashboard'); log.vietati.dashboard = await testoVietato();
await page.evaluate(() => window.__CPM_CAREER.goTab('calendar')); await sleep(800);
await shot('02-calendario'); log.vietati.calendario = await testoVietato();
await page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await sleep(800);
await shot('03-classifica'); log.vietati.classifica = await testoVietato();
log.classifica = await snapStand();
log.calendario = await snapCal();
// tabellino vs tabellone: l'ultima partita giocata nel calendario deve avere lo stesso punteggio nella storia
const c = log.calendario;
log.consegne.tabellinoVsTabellone = c.ultima && c.storia
  ? { calendarioRisultato: c.ultima.result || null, storiaRisultato: c.storia.result || c.storia.score || null, storiaKeys: Object.keys(c.storia) }
  : { nota: 'Non posso confermarlo: nessuna partita giocata con storia' };

// Home: crediti (PO-238) e pagina iniziale
await page.evaluate(() => window.__CPM_CAREER.goScreen('home')); await sleep(800);
await shot('04-home');
log.consegne.creditiHome = await page.evaluate(() => /crediti/i.test(document.body.innerText || ''));
log.vietati.home = await testoVietato();

// Overflow orizzontale (no scroll orizzontale a 16px di gutter)
log.overflow = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));

fs.writeFileSync(path.join(OUT, `dati-${W}.json`), JSON.stringify(log, null, 2));
console.log(JSON.stringify({ larghezza: W, stato: log.stato, step: log.step, classifica: { uguali: log.classifica.uguali, gf: log.classifica.gf, ga: log.classifica.ga, incoerenti: log.classifica.incoerenti.length }, calendario: { giocate: log.calendario.giocate, storiaN: log.calendario.storiaN }, creditiHome: log.consegne.creditiHome, overflow: log.overflow, vietatiHits: Object.values(log.vietati).flat().length, errori: errori.length }, null, 2));
await b.close(); srv.close();
