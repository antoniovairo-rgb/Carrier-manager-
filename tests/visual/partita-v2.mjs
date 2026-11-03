#!/usr/bin/env node
/* [PO-302 · grafica V2, tappa 3] GUARDIANO DELLA PARTITA V2: ingresso in campo, partita 2D, highlight in scelta, post partita.
   Formati: telefono 360x780 (tocco), tablet 820x1180 (tocco), PC 1440x900 (mouse). Banco: lib/partita-v2.mjs (save-194, partita di carriera).
   FORMA  gli elementi V2 ci sono (tabellone a strisce: blocchi delle squadre nel colore del club, risultato su piastrella chiara, minuto
          in oro; nell'highlight occhiello «La tua giocata», titolo in carattere TV, barra del tempo, scelte; nel post partita risultato
          grande in carattere TV e tasto chiaro; all'ingresso nomi in carattere TV);
   PAL    i colori sono quelli V2 (fondo #0d0f14, superfici #1a1e27, testo #f4f1ea, oro #e8b44a);
   TOCCO  scelte dell'highlight e tasto finale >= 44 px di altezza;  TXT nessuno scorrimento orizzontale;
   CON    contrasto WCAG >= 4,5:1 (3:1 sui testi grandi) sui riquadri V2 della schermata (lib/misura-v2.mjs).
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_V2 e pretende che PAL cada su ogni schermata in ogni formato.
   CPM_FORMATI=tel360,pc per un sottoinsieme. Chromium headless, GLB spento: nessun dispositivo vero. */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriPartitaV2, forzaHL, finePartita } from './lib/partita-v2.mjs';
import { MISURA } from './lib/misura-v2.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO;
const FORMATI = { tel360: { k: 'tel360', w: 360, h: 780, touch: true }, tabv: { k: 'tabv', w: 820, h: 1180, touch: true }, pc: { k: 'pc', w: 1440, h: 900, touch: false } };
const SCELTI = (process.env.CPM_FORMATI || 'tel360,tabv,pc').split(',').map(k => FORMATI[k]).filter(Boolean);
const C = { BG: '13, 15, 20', SUP: '26, 30, 39', TESTO: '244, 241, 234', ORO: '232, 180, 74' };
const GIUDICI = {
  ingresso: ({ C }) => { const n = [...document.querySelectorAll('[data-cpm="ingresso-nome-v2"]')], sk = document.querySelector('[data-cpm="salta-ingresso-v2"]');
    return [[n.length < 2 ? 'nomi delle squadre: ' + n.length : null, n[0] && !/Barlow Condensed/.test(getComputedStyle(n[0]).fontFamily) ? 'nomi non in carattere TV' : null, !sk ? 'manca Salta ingresso' : null],
      [n[0] && !getComputedStyle(n[0]).color.includes(C.TESTO) ? 'nomi non in #f4f1ea' : null, sk && !getComputedStyle(sk).backgroundColor.includes(C.BG) ? 'Salta ingresso non sul fondo V2' : null], []]; },
  partita2d: ({ C }) => { const ba = [...document.querySelectorAll('[data-cpm="barra"]')].find(x => x.offsetParent), sc = ba && ba.querySelector('[data-cpm="scudo-casa"]'), so = ba && ba.querySelector('[data-cpm="scudo-ospiti"]'),
      ri = ba && ba.querySelector('[data-cpm="risultato-v2"]'), mi = ba && ba.querySelector('[data-cpm="minuto-v2"]'), st = document.querySelector('[data-cpm="striscia918"]');
    const tr = c => /rgba\(0, 0, 0, 0\)|transparent/.test(c);
    return [[!ba ? 'manca il tabellone' : null, !ri ? 'manca il risultato' : null, !mi ? 'manca il minuto' : null],
      [ba && !getComputedStyle(ba).backgroundColor.includes(C.BG) ? 'tabellone non sul fondo V2' : null,
       sc && tr(getComputedStyle(sc).backgroundColor) ? 'blocco di casa senza il colore del club' : null, so && tr(getComputedStyle(so).backgroundColor) ? 'blocco ospite senza il colore del club' : null,
       ri && !getComputedStyle(ri).backgroundColor.includes(C.TESTO) ? 'risultato non su piastrella #f4f1ea' : null, mi && !getComputedStyle(mi).color.includes(C.ORO) ? 'minuto non in oro' : null,
       st && !getComputedStyle(st).backgroundColor.includes(C.SUP) ? 'striscia statistiche non su superficie V2' : null], []]; },
  highlight: ({ C }) => { const sc = document.querySelector('[data-cpm="scelte"]');
    if (sc) { const o = sc.querySelector('[data-cpm="occhiello-hl-v2"]'), t = sc.querySelector('[data-cpm="titolo-hl-v2"]'), r = [...sc.querySelectorAll('[data-cpm="scelta-v2"]')], tb = sc.querySelector('[data-cpm="tempo-hl-v2"]');
      return [[!o ? 'manca l\'occhiello «La tua giocata»' : null, !t || !/Barlow Condensed/.test(getComputedStyle(t).fontFamily) ? 'titolo non in carattere TV' : null, r.length < 2 ? 'scelte: ' + r.length : null],
        [o && !getComputedStyle(o).color.includes(C.ORO) ? 'occhiello non in oro' : null, r.some(x => !getComputedStyle(x).backgroundColor.includes(C.SUP)) || !r.length ? 'scelte non su superficie V2' : null, tb && !getComputedStyle(tb).backgroundColor.includes(C.ORO) ? 'barra del tempo non in oro' : null],
        [r.filter(x => x.getBoundingClientRect().height < 44).map(x => 'scelta ' + Math.round(x.getBoundingClientRect().height) + 'px')[0] || null]]; }
    const col = document.querySelector('[data-cpm="colonna-partita-v2"]');
    return [[!col ? 'né scheda né colonna delle scelte' : null], [col && !getComputedStyle(col).backgroundColor.includes(C.BG) ? 'colonna non sul fondo V2' : null], []]; },
  post: ({ C }) => { const h = document.querySelector('[data-cpm="post-v2"]'), r = document.querySelector('[data-cpm="post-risultato-v2"]'), b = document.querySelector('[data-cpm="post-continua-v2"]');
    return [[!h ? 'manca la testata del risultato' : null, !r || !/Barlow Condensed/.test(getComputedStyle(r).fontFamily) || parseFloat(getComputedStyle(r).fontSize) < 44 ? 'risultato non grande in carattere TV' : null, !b ? 'manca il tasto finale' : null],
      [h && !getComputedStyle(h).backgroundColor.includes(C.BG) ? 'testata non sul fondo V2' : null, b && !getComputedStyle(b).backgroundColor.includes(C.TESTO) ? 'tasto finale non chiaro #f4f1ea' : null, r && !getComputedStyle(r).color.includes(C.TESTO) ? 'risultato non in #f4f1ea' : null],
      [b && b.getBoundingClientRect().height < 44 ? 'tasto finale ' + Math.round(b.getBoundingClientRect().height) + 'px' : null]]; },
};
const SEL = { ingresso: '[data-cpm="tv225"],[data-cpm="salta-ingresso-v2"]', partita2d: '[data-cpm="barra"],[data-cpm="striscia918"]', highlight: '[data-cpm="scelte"],[data-cpm="colonna-partita-v2"]', post: '[data-cpm="post-v2"],[data-cpm="post-continua-v2"],[data-cpm="motm23"]' };
const srv = await startServer(); const b = await launchBrowser(); const port = srv.address().port;
const fail = { FORMA: [], PAL: [], TOCCO: [], TXT: [], CON: [] }, errs = [], mancanti = []; let conMin = 99, visti = 0;
const KO = (k, f, sc, m) => fail[k].push(`${f.k}:${sc}: ${m}`);
async function giudica(page, f, sc) {
  visti++; const [fo, pa, to] = await page.evaluate(GIUDICI[sc], { C });
  fo.filter(Boolean).forEach(m => KO('FORMA', f, sc, m)); pa.filter(Boolean).forEach(m => KO('PAL', f, sc, m)); (to || []).filter(Boolean).forEach(m => KO('TOCCO', f, sc, m));
  const ms = await page.evaluate(MISURA, SEL[sc]);
  const ox = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (ox > 1) KO('TXT', f, sc, 'scorrimento orizzontale ' + ox + ' px');
  if (ms.n) { conMin = Math.min(conMin, ms.min); if (ms.peggiori.length) KO('CON', f, sc, ms.peggiori.slice(0, 3).join(' | ')); } else KO('FORMA', f, sc, 'nessun testo misurato');
  console.log(`  ${f.k.padEnd(6)} ${sc.padEnd(10)} testi ${ms.n} · contrasto min ${ms.min}`);
}
for (const f of SCELTI) {
  try { const { ctx, page } = await apriPartitaV2(b, port, f, { rosso: ROSSO, errs, ingresso: true }); await sleep(2500);
    if (await page.evaluate(() => window.__CPM_PHASE()) === 'walkout') await giudica(page, f, 'ingresso'); else mancanti.push(f.k + ' ingresso'); await ctx.close(); } catch (e) { mancanti.push(f.k + ' ingresso: ' + e.message.slice(0, 80)); }
  try { const { ctx, page } = await apriPartitaV2(b, port, f, { rosso: ROSSO, errs }); await sleep(1500); await giudica(page, f, 'partita2d');
    await forzaHL(page, 4); if (await page.evaluate(() => window.__CPM_PHASE()) === 'hl_choose') await giudica(page, f, 'highlight'); else mancanti.push(f.k + ' highlight'); await ctx.close(); } catch (e) { mancanti.push(f.k + ' partita: ' + e.message.slice(0, 80)); }
  try { const { ctx, page } = await apriPartitaV2(b, port, f, { rosso: ROSSO, errs }); if (await finePartita(page)) { await sleep(1500); await giudica(page, f, 'post'); } else mancanti.push(f.k + ' post'); await ctx.close(); } catch (e) { mancanti.push(f.k + ' post: ' + e.message.slice(0, 80)); }
}
await b.close(); srv.close();
if (errs.length) console.log('errori di pagina: ' + errs.slice(0, 4).join(' | ')); if (mancanti.length) console.log('non raggiunte: ' + mancanti.join(', '));
for (const [k, v] of Object.entries(fail)) v.forEach(x => console.log(`  ✗ ${k} ${x}`));
let esito; const SCH = Object.keys(GIUDICI);
if (ROSSO) { const cade = SCELTI.every(f => SCH.every(sc => fail.PAL.some(x => x.startsWith(`${f.k}:${sc}:`))));
  esito = cade && !errs.length; console.log(esito ? 'ROSSO ATTESO OK: con __CPM_NO_V2 cade PAL su ogni schermata in ogni formato' : 'ROSSO NON RIUSCITO');
} else { esito = Object.values(fail).every(v => !v.length) && !errs.length && !mancanti.length && visti === SCELTI.length * SCH.length;
  console.log(esito ? `partita-v2 VERDE: ${SCELTI.length} formati x ${SCH.length} schermate · contrasto minimo ${conMin.toFixed(2)}:1` : 'partita-v2 ROSSO'); }
process.exit(esito ? 0 : 1);
