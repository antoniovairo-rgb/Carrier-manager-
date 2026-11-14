#!/usr/bin/env node
/* [giro 197 · PO-452] GUARDIANO delle SCELTE DELL'EROE sui telefoni bassi.
   Misura dal collaudo 195: a 375x667 la terza scelta stava a 631-683 px (16 px fuori dallo schermo), a 360x640 28 px fuori,
   le scelte in un riquadro che scorre (141 px su 168); il titolo dell'azione mentre muovi l'eroe tagliato coi puntini.
   Per ogni taglia (360x640 · 375x667 · 390x844 · 412x915) apre la carriera del collaudo (stagione 5, settimana 20), gioca la
   partita senza toccare nulla e, per i primi CPM_N highlight (default 2), misura:
     - in hl_move: il titolo dell'azione (righe, tagliato si/no);
     - in hl_choose, a scelte armate: per ogni scelta top/bottom/altezza, dentro lo schermo si/no, il riquadro che scorre
       (altezza visibile/contenuto), il titolo della scheda (tagliato si/no), la durata del tempo limite (animazione della barra).
   VERDE: ogni scelta misurata sta dentro lo schermo, alta >= 44 px, il riquadro non scorre, i titoli interi su <= 2 righe,
          e ogni taglia ha almeno una scheda di scelte misurata (una taglia non misurata = rosso: «non giudicato»).
   Uso: node scelte-197.mjs [verde|rosso|misura]   (rosso = window.__CPM_NO_G197: deve uscire rosso; misura = stampa e non giudica)
        CPM_FOTO=<cartella> salva le foto di hl_move/hl_choose per taglia. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const BRACCIO = process.argv[2] || 'verde';
const TAGLIE = (process.env.CPM_TAGLIE || '360x640,375x667,390x844,412x915').split(',').map(s => s.split('x').map(Number));
const N = +(process.env.CPM_N || 2);
const FOTO = process.env.CPM_FOTO || '';
const FX = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url)));
const LS = FX['cpm-v3'] ? { ...FX } : { 'cpm-v3': JSON.stringify(FX) };
delete LS['cpm-v3-riserva']; delete LS['cpm-match-resume'];
LS['cpm-match-speed'] = '2';
if (FOTO) fs.mkdirSync(FOTO, { recursive: true });

const MISURA_TITOLO = (sel) => {
  const el = document.querySelector(sel); if (!el) return null;
  const cs = getComputedStyle(el); const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
  const r = el.getBoundingClientRect();
  return { testo: el.textContent.trim().slice(0, 90), righe: Math.round(el.scrollHeight / lh), alto: Math.round(r.height),
    tagliatoV: el.scrollHeight > el.clientHeight + 1, tagliatoO: el.scrollWidth > el.clientWidth + 1, top: Math.round(r.top), bottom: Math.round(r.bottom) };
};

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = []; const errori = [];
for (const [W, H] of TAGLIE) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: FOTO ? 2 : 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errori.push(`${W}x${H} ${String(e).slice(0, 160)}`));
  await page.addInitScript(([o, rosso]) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G197 = 1; for (const k in o) localStorage.setItem(k, o[k]); }, [LS, BRACCIO === 'rosso']);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
  await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  const t0 = Date.now(); let fatte = 0, mosse = 0, ultima = '', fotoM = false;
  const taglia = { taglia: `${W}x${H}`, mossa: [], scelte: [] };
  while (Date.now() - t0 < 240000 && fatte < N) {
    const ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    if (ph === 'ended' || ph === 'ceremony') break;
    if (!ph) { await sleep(300); continue; }
    if (ph === 'matchday' || ph === 'formations' || ph === 'walkout') {/* il prepartita si salta come un giocatore: «Salta e gioca» / «Salta l'ingresso» */
      await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Salta e gioca|Salta l.ingresso|Salta/i.test(x.innerText || '')); if (b) b.click(); }).catch(() => {});
      await sleep(600); ultima = ph; continue; }
    if (ph === 'hl_move' && ultima !== 'hl_move') {
      await sleep(400);
      const m = await page.evaluate(MISURA_TITOLO, '[data-cpm="mossa"] [data-cpm="titolo-mossa"]').catch(() => null)
        || await page.evaluate(MISURA_TITOLO, '[data-cpm="mossa"] > div > div').catch(() => null);
      if (m) { taglia.mossa.push(m); mosse++; }
      if (FOTO && !fotoM) { await page.screenshot({ path: path.join(FOTO, `${BRACCIO}-${W}x${H}-mossa.png`) }); fotoM = true; }
    }
    if (ph === 'hl_choose' && ultima !== 'hl_choose') {
      const pronte = await page.waitForFunction(() => { const bs = [...document.querySelectorAll('[data-cpm="scelta-v2"]')]; return bs.length && bs.every(x => !x.disabled && getComputedStyle(x).visibility === 'visible'); }, null, { timeout: 5000 }).then(() => true).catch(() => false);
      const s = await page.evaluate(([MT]) => {
        const f = new Function('return (' + MT + ')')();
        const VH = innerHeight, VW = innerWidth;
        const card = document.querySelector('[data-cpm="scelte"]'); const lista = document.querySelector('[data-cpm="scelte-righe"]');
        if (!card || !lista) return null;
        const bs = [...card.querySelectorAll('[data-cpm="scelta-v2"]')].map(x => { const r = x.getBoundingClientRect();
          const t = x.querySelector('div:nth-child(2) > div'); const lr = lista.getBoundingClientRect();
          return { testo: x.innerText.replace(/\s+/g, ' ').trim().slice(0, 60), top: Math.round(r.top), bottom: Math.round(r.bottom), alto: Math.round(r.height), largo: Math.round(r.width),
            dentro: r.top >= 0 && r.bottom <= VH + 0.5 && r.left >= 0 && r.right <= VW + 0.5 && r.top >= lr.top - 0.5 && r.bottom <= lr.bottom + 0.5,
            testoTagliato: t ? t.scrollWidth > t.clientWidth + 1 || t.scrollHeight > t.clientHeight + 1 : null }; });
        const cr = card.getBoundingClientRect();
        const bar = document.querySelector('[data-cpm="tempo-hl-v2"] > div'); const dur = bar ? getComputedStyle(bar).animationDuration : null;
        return { VH, card: [Math.round(cr.top), Math.round(cr.bottom)], lista: [lista.clientHeight, lista.scrollHeight], scorre: lista.scrollHeight > lista.clientHeight + 1,
          bs, titolo: f('[data-cpm="scelte"] [data-cpm="titolo-hl-v2"]'), tempo: dur };
      }, [MISURA_TITOLO.toString()]).catch(e => ({ errore: String(e).slice(0, 120) }));
      if (s) { s.pronte = pronte; taglia.scelte.push(s); fatte++; }
      if (FOTO && fatte === 1) await page.screenshot({ path: path.join(FOTO, `${BRACCIO}-${W}x${H}-scelte.png`) });
    }
    ultima = ph; await sleep(120);
  }
  ris.push(taglia); await ctx.close();
}
await b.close(); srv.close();

const difetti = [];
for (const t of ris) {
  console.log(`\n== ${t.taglia}`);
  for (const m of t.mossa) console.log(`  mossa  titolo «${m.testo}» righe ${m.righe} alto ${m.alto} tagliato ${m.tagliatoV || m.tagliatoO ? 'SI' : 'no'}`);
  for (const s of t.scelte) {
    if (s.errore) { console.log('  scelte ERRORE', s.errore); difetti.push(`${t.taglia}: misura fallita`); continue; }
    console.log(`  scelte scheda ${s.card[0]}-${s.card[1]} (VH ${s.VH}) · riquadro ${s.lista[0]}/${s.lista[1]} ${s.scorre ? 'SCORRE' : 'non scorre'} · tempo ${s.tempo} · armate ${s.pronte}`);
    if (s.titolo) console.log(`         titolo «${s.titolo.testo}» righe ${s.titolo.righe} tagliato ${s.titolo.tagliatoV || s.titolo.tagliatoO ? 'SI' : 'no'}`);
    for (const x of s.bs) console.log(`         ${x.top}-${x.bottom} (${x.alto}x${x.largo}) ${x.dentro ? 'dentro' : 'FUORI'} ${x.testoTagliato ? 'testo-tagliato ' : ''}«${x.testo}»`);
    if (!s.pronte) difetti.push(`${t.taglia}: scelte mai armate`);
    if (s.bs.length < 2) difetti.push(`${t.taglia}: meno di due scelte (${s.bs.length})`);
    if (s.scorre) difetti.push(`${t.taglia}: il riquadro scorre ${s.lista[0]}/${s.lista[1]}`);
    s.bs.forEach((x, i) => { if (!x.dentro) difetti.push(`${t.taglia}: scelta ${i + 1} fuori (${x.top}-${x.bottom})`); if (x.alto < 44) difetti.push(`${t.taglia}: scelta ${i + 1} alta ${x.alto} < 44`); });
    if (!s.titolo) difetti.push(`${t.taglia}: titolo della scheda non trovato`);
    else if (s.titolo.tagliatoV || s.titolo.tagliatoO || s.titolo.righe > 2) difetti.push(`${t.taglia}: titolo della scheda tagliato/oltre 2 righe`);
  }
  for (const m of t.mossa) if (m.tagliatoV || m.tagliatoO || m.righe > 2) difetti.push(`${t.taglia}: titolo della mossa tagliato («${m.testo}»)`);
  if (!t.scelte.length) difetti.push(`${t.taglia}: NON GIUDICATO (nessuna scheda di scelte misurata)`);
  if (!t.mossa.length) difetti.push(`${t.taglia}: NON GIUDICATO (nessun passo di movimento misurato)`);
}
if (errori.length) difetti.push(...errori.slice(0, 3).map(e => 'pageerror ' + e));
fs.writeFileSync(new URL('./out/scelte-197-' + BRACCIO + '.json', import.meta.url), JSON.stringify(ris, null, 1));
console.log(`\nbraccio ${BRACCIO} · difetti ${difetti.length}`); difetti.slice(0, 20).forEach(d => console.log('  - ' + d));
if (BRACCIO === 'misura') process.exit(0);
const rossoOk = BRACCIO === 'rosso' ? difetti.some(d => !/NON GIUDICATO|pageerror|misura fallita|mai armate/.test(d)) : difetti.length === 0;
console.log(rossoOk ? `ESITO: ${BRACCIO === 'rosso' ? 'il rosso vede il difetto' : 'VERDE'}` : `ESITO: ROSSO (${BRACCIO})`);
process.exit(rossoOk ? 0 : 1);
