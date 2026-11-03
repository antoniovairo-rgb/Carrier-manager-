#!/usr/bin/env node
/* [PO-302 · grafica V2, tappa 2b] GUARDIANO DEI MOMENTI V2: intervista, offerta, fine stagione, fine carriera, calendario.
   Quattro formati (412x915, 820x1180, 1180x820, 1440x900), banco di grafica-v2 (lib/banco-v2.mjs). Per ogni schermata:
   FORMA  gli elementi V2 ci sono (domanda in carattere TV, risposte a riquadro con la barra del tono; fascia del club e confronto
          oggi → nuovo; bilancio e quattro numeri; nome, totali e percorso; righe compatte con etichette CASA/FUORI);
   PAL    le superfici sono quelle V2 (#1a1e27 riquadri, #11141b etichette), il gol in oro;
   TOCCO  risposte, tasti della finestra e righe del calendario >= 40 px di altezza;
   TXT    nessun testo tagliato, nessuno scorrimento orizzontale;  CON  contrasto WCAG >= 4,5:1 (3:1 sui testi grandi).
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_V2 (tema di prima) e pretende che PAL cada su ogni schermata in ogni formato.
   CPM_FORMATI=tel,pc per un sottoinsieme. Chromium headless: nessun dispositivo vero. */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriBancoV2 } from './lib/banco-v2.mjs';
import { MISURA } from './lib/misura-v2.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO;
const FORMATI = { tel: { k: 'tel', w: 412, h: 915, touch: true }, tabv: { k: 'tabv', w: 820, h: 1180, touch: true }, tabo: { k: 'tabo', w: 1180, h: 820, touch: true }, pc: { k: 'pc', w: 1440, h: 900, touch: false } };
const SCELTI = (process.env.CPM_FORMATI || 'tel,tabv,tabo,pc').split(',').map(k => FORMATI[k]).filter(Boolean);
const SUP = '26, 30, 39', INC = '17, 20, 27', ORO = '232, 180, 74';
/* giudizi dentro la pagina: [forma[], pal[], tocco[]] */
const GIUDICI = {
  calendario: ({ SUP, INC }) => { const r = [...document.querySelectorAll('[data-cpm="riga-cal-v2"]')], t = [...document.querySelectorAll('[data-cpm="riga-cal-v2"] [data-cpm="tag-v2"]')];
    return [[r.length < 3 ? 'righe compatte: ' + r.length : null, t.length < 3 ? 'etichette CASA/FUORI: ' + t.length : null],
      [t.filter(x => getComputedStyle(x).backgroundColor.includes(INC)).length < t.length || !t.length ? 'etichette non sull\'incasso V2' : null],
      [r.filter(x => x.getBoundingClientRect().height < 40).length ? 'riga sotto 40 px' : null]]; },
  offerta: ({ SUP }) => { const f = document.querySelector('[data-cpm="offerta-v2"]'), c = document.querySelector('[data-cpm="confronto-v2"]'), bs = [...document.querySelectorAll('[data-cpm="offerta23"] button')].filter(b => b.offsetParent);
    return [[!f ? 'manca la fascia del club' : null, !c ? 'manca il confronto oggi → nuovo' : (c.querySelectorAll('.cpm-num').length < 6 ? 'confronto con meno di 3 righe' : null)],
      [!f || /26, 30, 39|13, 15, 20|255, 255, 255/.test(getComputedStyle(f).backgroundColor) ? 'fascia non nel colore del club' : null, !c || !getComputedStyle(c).backgroundColor.includes(SUP) ? 'confronto non su superficie V2' : null],
      [bs.filter(b => b.getBoundingClientRect().height < 40 && (b.textContent || '').trim().length > 2).map(b => 'tasto ' + b.textContent.trim().slice(0, 14) + ' ' + Math.round(b.getBoundingClientRect().height) + 'px')[0] || null]]; },
  intervista: ({ SUP }) => { const q = document.querySelector('[data-cpm="iv-domanda-v2"] div'), a = [...document.querySelectorAll('[data-cpm="risposta24"]')];
    return [[!q ? 'manca la domanda' : (!/Barlow Condensed/.test(getComputedStyle(q).fontFamily) || parseFloat(getComputedStyle(q).fontSize) < 22 ? 'domanda non grande in carattere TV' : null), a.length < 2 ? 'risposte: ' + a.length : null,
        a.some(x => !x.firstElementChild || Math.round(x.firstElementChild.getBoundingClientRect().width) !== 4) ? 'manca la barra del tono' : null],
      [a.some(x => !getComputedStyle(x).backgroundColor.includes(SUP)) || !a.length ? 'risposte non su superficie V2' : null],
      [a.filter(x => x.getBoundingClientRect().height < 40).length ? 'risposta sotto 40 px' : null]]; },
  finestagione: ({ SUP, ORO }) => { const h = document.querySelector('[data-cpm="finestagione-v2"] h1'), n = document.querySelector('[data-cpm="finestagione-numeri-v2"]');
    const t = n ? [...n.querySelectorAll('.cpm-num')] : [];
    return [[!h ? 'manca il bilancio' : (!/Barlow Condensed/.test(getComputedStyle(h).fontFamily) ? 'bilancio non in carattere TV' : null), t.length !== 4 ? 'numeri della stagione: ' + t.length : null],
      [!n || !getComputedStyle(n).backgroundColor.includes(SUP) ? 'numeri non su superficie V2' : null, t[1] && !getComputedStyle(t[1]).color.includes(ORO) ? 'gol non in oro' : null], []]; },
  finecarriera: ({ SUP }) => { const h = document.querySelector('[data-cpm="finecarriera-v2"] h1'), t = [...document.querySelectorAll('[data-cpm="finecarriera-totali-v2"] > div')], b = document.querySelectorAll('[data-cpm="barra-percorso-v2"]');
    return [[!h ? 'manca il nome' : null, t.length < 6 ? 'totali: ' + t.length : null, !b.length ? 'manca il percorso' : null],
      [t.some(x => !getComputedStyle(x).backgroundColor.includes(SUP)) || !t.length ? 'totali non su superficie V2' : null], []]; },
};
const SEL = { calendario: '[data-cpm="riga-cal-v2"]', offerta: '[data-cpm="offerta23"]', intervista: '[data-cpm="intervista231"] [data-cpm="risposta24"],[data-cpm="iv-domanda-v2"],[data-cpm="iv-occhiello-v2"]',
  finestagione: '[data-cpm="finestagione-v2"],[data-cpm="finestagione-numeri-v2"]', finecarriera: '[data-cpm="finecarriera-v2"],[data-cpm="finecarriera-totali-v2"],[data-cpm="percorso-v2"]' };
/* due pagine per formato: (A) calendario → offerta → fine stagione; (B) intervista → fine carriera (il ritiro non si annulla) */
const GIRI = [[['calendario', () => window.__CPM_CAREER.goTab('calendar')], ['offerta', () => window.__CPM_CAREER.forceOffer()], ['finestagione', () => { window.__CPM_CAREER.dismiss(); return window.__CPM_CAREER.apriFine302('stagione'); }]],
  [['intervista', () => window.__CPM_CAREER.forceInterview('win')], ['finecarriera', () => window.__CPM_CAREER.apriFine302('carriera')]]];
const srv = await startServer(); const b = await launchBrowser();
const fail = { FORMA: [], PAL: [], TOCCO: [], TXT: [], CON: [] }, errs = [], mancanti = []; let conMin = 99, visti = 0;
const KO = (k, f, sc, m) => fail[k].push(`${f.k}:${sc}: ${m}`);
for (const f of SCELTI) for (const giro of GIRI) {
  const { ctx, page } = await apriBancoV2(b, srv.address().port, f, { rosso: ROSSO, errs, mancanti });
  if (!page) continue;
  for (const [sc, apri] of giro) {
    const r = await page.evaluate(apri).catch(e => 'err ' + e.message); await sleep(1600);
    if (sc === 'finecarriera') for (let k = 0; k < 4; k++) { const ok = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => /^(Continua|Rivivi la carriera)/.test((b.textContent || '').trim())); if (x) x.click(); return !!x; }); if (!ok) break; await sleep(800); }
    if (r !== true) { mancanti.push(`${f.k} ${sc} → ${JSON.stringify(r)}`); continue; }
    visti++;
    const [fo, pa, to] = await page.evaluate(GIUDICI[sc], { SUP, INC, ORO });
    fo.filter(Boolean).forEach(m => KO('FORMA', f, sc, m)); pa.filter(Boolean).forEach(m => KO('PAL', f, sc, m)); (to || []).filter(Boolean).forEach(m => KO('TOCCO', f, sc, m));
    const ms = await page.evaluate(MISURA, SEL[sc]);
    const ox = await page.evaluate(() => { const s = document.querySelector('.cpm-scroll'); return Math.max(s ? s.scrollWidth - s.clientWidth : 0, document.documentElement.scrollWidth - innerWidth); });
    if (ox > 1) KO('TXT', f, sc, 'scorrimento orizzontale ' + ox + ' px'); if (ms.tagliati.length) KO('TXT', f, sc, 'tagliati: ' + ms.tagliati.slice(0, 3).join(' | '));
    if (ms.n) { conMin = Math.min(conMin, ms.min); if (ms.peggiori.length) KO('CON', f, sc, ms.peggiori.slice(0, 3).join(' | ')); } else KO('FORMA', f, sc, 'nessun testo misurato');
    console.log(`  ${f.k.padEnd(4)} ${sc.padEnd(12)} testi ${ms.n} · contrasto min ${ms.min}`);
  }
  await ctx.close();
}
await b.close(); srv.close();
if (errs.length) console.log('errori di pagina: ' + errs.slice(0, 4).join(' | ')); if (mancanti.length) console.log('non raggiunte: ' + mancanti.join(', '));
for (const [k, v] of Object.entries(fail)) v.forEach(x => console.log(`  ✗ ${k} ${x}`));
let esito; const SCH = Object.keys(GIUDICI);
if (ROSSO) { const cade = SCELTI.every(f => SCH.every(sc => fail.PAL.some(x => x.startsWith(`${f.k}:${sc}:`))));
  esito = cade && !errs.length; console.log(esito ? 'ROSSO ATTESO OK: con __CPM_NO_V2 cade PAL su ogni schermata in ogni formato' : 'ROSSO NON RIUSCITO');
} else { esito = Object.values(fail).every(v => !v.length) && !errs.length && !mancanti.length && visti === SCELTI.length * SCH.length;
  console.log(esito ? `momenti-v2 VERDE: ${SCELTI.length} formati x ${SCH.length} schermate · contrasto minimo ${conMin.toFixed(2)}:1` : 'momenti-v2 ROSSO'); }
process.exit(esito ? 0 : 1);
