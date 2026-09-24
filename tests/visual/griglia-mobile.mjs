#!/usr/bin/env node
/* [G0 — LO STRUMENTO · overhaul grafico 2026-09] LA GRIGLIA MOBILE.
   Apre il gioco a CINQUE larghezze di telefono (360·375·390·412·430), percorre le schermate
   raggiungibili SENZA giocare una partita e per ognuna misura tre grandezze, con numeri:
     M5  overflow orizzontale — `documentElement.scrollWidth > clientWidth` (in px) + gli elementi
         il cui `getBoundingClientRect().right` supera la larghezza (i 5 peggiori, selettore e scarto).
         Gli elementi CONTENUTI da un antenato che li ritaglia o li fa scorrere (overflow-x
         hidden/auto/scroll/clip) sono contati a parte: non sono «fuori dallo schermo», e contarli
         dentro avrebbe gonfiato il numero con le liste a scorrimento orizzontale volute.
     M3  testo reso sotto i 10 px — nodi di TESTO VISIBILI (rettangolo reale via Range, opacita'
         effettiva > 0,1) con `font-size` calcolato < 10 px, piu' il minimo trovato.
     M6  contrasto WCAG — per ogni nodo di testo visibile: colore del testo composto sul FONDO
         EFFETTIVO (si risalgono i genitori componendo i fondi finche' non se ne trova uno opaco).
         Soglia 4,5:1, che scende a 3:1 se il corpo e' >= 18 px oppure >= 14 px in grassetto (>=700).
         I nodi il cui fondo e' un GRADIENTE/immagine sono ESCLUSI e contati a parte: non si puo'
         leggere un rapporto da un fondo che cambia colore sotto la riga, e dichiararlo e' meglio
         che inventarlo.
   + uno scatto PNG per schermata e per larghezza in docs/collaudo-grafico/g0/<larghezza>/.
   + la tabella a schermo e in docs/collaudo-grafico/g0/REPORT.md, e i numeri grezzi in dati.json.

   DICHIARATO: e' CHROMIUM HEADLESS alla taglia del telefono (la 412x915 e' quella del PO), NON un
   Android vero. Restano fuori: il rendering dei font di sistema Android, il tocco, la GPU, le
   prestazioni, la barra di sistema e il ritaglio del notch.

   RIPETIBILITA' (la sonda deve dare gli stessi numeri due volte di fila sullo stesso build):
     · Math.random e' sostituito da un generatore a seme fisso (CPM_SEME, default 4242) — senza,
       le Offerte estraggono club diversi a ogni corsa e i numeri ballano;
     · il salvataggio di prova e' cablato qui, non pescato dal disco;
     · prima di ogni misura le transizioni sono spente, le animazioni a durata finita sono portate
       alla fine e quelle infinite sono fermate a currentTime 0, e la pagina e' riportata in cima;
     · l'attesa non e' a tempo ma sul TESTO FERMO (due letture identiche), con l'orologio di testata
       normalizzato perche' cambia da solo ogni minuto;
     · REPORT.md e dati.json non contengono orari: due corse si confrontano con `diff`.

   TARATURA (obbligo prima di credere a uno zero): `CPM_TARATURA=1 node tests/visual/griglia-mobile.mjs`
   fa girare la stessa misura su due paginette di cui si conosce la risposta esatta — 13 controlli.
   Se questa non e' verde, i numeri della griglia non valgono niente.
   CONTROPROVA SUL GIOCO VERO: `CPM_LARG=320` misura sotto ogni telefono dell'elenco. Serve a sapere
   se uno zero di overflow e' del gioco o della sonda.

   NON MODIFICA IL GIOCO. Nessun file src/ e' toccato: questo e' solo il metro.

   Uso:  node tests/visual/griglia-mobile.mjs
         [CPM_SEME=4242] [CPM_LARG=412,430] [CPM_FOTO=0] [CPM_OUT=/altra/cartella]
         [CPM_TARATURA=1] [CPM_CHROME=/percorso/chrome]
   Chromium: si prende da solo il primo `chromium-<n>` con dentro `chrome-linux/chrome`, sotto PLAYWRIGHT_BROWSERS_PATH
   (default /opt/pw-browsers). Nessuna installazione di browser.
*/
import fs from 'node:fs';
import path from 'node:path';

/* Chromium: si usa quello gia' presente nella macchina (PLAYWRIGHT_BROWSERS_PATH), senza installare nulla. */
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
if (!process.env.CPM_CHROME) {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  try {
    const d = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort();
    for (const x of d.reverse()) { const p = path.join(base, x, 'chrome-linux', 'chrome'); if (fs.existsSync(p)) { process.env.CPM_CHROME = p; break; } }
  } catch (_e) {}
}

const { startServer, launchBrowser, installCdnRoutes, sleep, ROOT, openMatch } = await import('./lib/harness.mjs');

const SEME = +(process.env.CPM_SEME || 4242);
const FOTO = process.env.CPM_FOTO !== '0';
/* [7.944 — difetto mio, e l'ho gia' pagato] Girando con CPM_FOTO=0 nella cartella PREDEFINITA la sonda
   riscrive REPORT.md e dati.json senza le foto, e i 65 scatti gia' versionati restano orfani: me ne sono
   accorto solo vedendoli cancellati dentro un commit gia' spinto. Senza foto si scrive altrove, a meno che
   non sia stata chiesta una cartella esplicita. */
if (!FOTO && !process.env.CPM_OUT) { process.env.CPM_OUT = '/tmp/cpm-griglia-senza-foto'; }
const TEMA = process.env.CPM_TEMA === 'scuro' ? 'scuro' : 'chiaro';
const FIS_APERTE = process.env.CPM_FIS === 'aperte';   /* CPM_FIS=aperte: misura con TUTTE le fisarmoniche aperte (vedi G8.5) */
/* [G8.4 · 21/09] LA MANOPOLA DEL TEMA SCURO NON COMANDA PIU' NIENTE, e finche' non lo diceva
   era una sonda che mente: `CPM_TEMA=scuro` scrive cpm-dark=1, ma dalla 7.947 il gioco ha UN SOLO
   tema (chiaro) e all'avvio riporta indietro chi aveva acceso lo scuro. Due corse, una chiara e
   una «scura», davano lo stesso identico 49/2487 — e uno che confronta quei due numeri crede di
   aver misurato due temi. Qui si controlla il fondo VERO della radice e, se non e' scuro, lo si
   grida invece di far finta. */
let TEMA_TRADITO = false;
const _controllaTema = async (page) => {
  if (TEMA !== 'scuro' || TEMA_TRADITO) return;
  try {
    const l = await page.evaluate(() => {
      const el = document.querySelector('.cpm-root') || document.body;
      /* [correzione dello stesso giorno] NON il fondo: la radice ha una SFUMATURA, quindi
         `backgroundColor` e' trasparente e una soglia sulla luminanza lo prendeva per scuro.
         Si legge il COLORE DEL TESTO, che nei due temi e' opposto: #1e293b sul chiaro (scuro),
         #f1f5f9 sullo scuro (chiaro). Testo scuro = tema chiaro. */
      const m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(el).color || '');
      if (!m) return null;
      const p = m[1].split(',').map(Number);
      const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(p[0]) + 0.7152 * f(p[1]) + 0.0722 * f(p[2]);
    });
    if (l != null && l < 0.18) {   /* testo SCURO = tema chiaro */
      TEMA_TRADITO = true;
      console.log('\n  ⚠  CPM_TEMA=scuro NON HA EFFETTO: il testo della radice e\' scuro, cioe\' il tema e\' CHIARO (luminanza ' + l.toFixed(3) + ').');
      console.log('     Dalla 7.947 il gioco ha un tema solo. Questi numeri sono del tema CHIARO:');
      console.log('     non confrontarli con una corsa «chiara» credendo di avere due temi.\n');
    }
  } catch (_e) {}
};
const ROSSI = (process.env.CPM_ROSSO || '').split(',').map(x => x.trim()).filter(Boolean);/* [7.944] prova del rosso dentro la pagina: i flag si accendono prima del caricamento */
const PARTITA = process.env.CPM_PARTITA === '1';   /* CPM_PARTITA=1 misura anche la PARTITA (HUD in gioco e HUD con la scelta), opt-in: i totali cambiano, si confronta solo con corse uguali */   /* CPM_TEMA=scuro misura il tema scuro (cpm-dark=1); default chiaro */
const TAGLIE_TUTTE = [
  { w: 360, h: 800 },   // Android piccolo diffuso
  { w: 375, h: 667 },   // iPhone SE / 8
  { w: 390, h: 844 },   // iPhone 12/13/14
  { w: 412, h: 915 },   // Pixel — la taglia di riferimento del PO
  { w: 430, h: 932 },   // iPhone Pro Max
];
/* CPM_LARG restringe (o aggiunge) le larghezze: serve anche a PROVARE LO STRUMENTO sul gioco vero
   — a 320 px, sotto ogni telefono di elenco, l'overflow deve comparire; se non comparisse nemmeno
   li', lo zero delle cinque larghezze sarebbe della sonda, non del gioco. */
const _filtro = (process.env.CPM_LARG || '').split(',').map(x => +x).filter(Boolean);
const TAGLIE = _filtro.length ? _filtro.map(w => TAGLIE_TUTTE.find(t => t.w === w) || { w, h: 800 }) : TAGLIE_TUTTE;

const OUT = process.env.CPM_OUT ? path.resolve(process.env.CPM_OUT) : path.join(ROOT, 'docs', 'collaudo-grafico', 'g0');

/* ── SALVATAGGIO DI PROVA — cablato, cosi' due corse vedono la stessa carriera ─────────────── */
import { SAVE, INIT } from './lib/banco-g0.mjs';/* [G17] il salvataggio di prova e lo script d'avvio stanno in lib/banco-g0.mjs: cosi' le sonde partono dalla STESSA carriera del rapporto invece di copiarsela */

/* envelope dei provini conclusi: e' la via per aprire la schermata OFFERTE senza giocare i provini */
const TRIALPROG = { ph: 'offers', slot: 0, res: [{ goals: 2, assists: 1, rating: 7.4 }, { goals: 2, assists: 0, rating: 7.6 }, { goals: 3, assists: 1, rating: 8.1 }],
  p: { name: 'Grafica Probe', nation: 'Italia', avatarId: 0, ovr: 58, age: 16, proStatus: 'youth', archetype: 'finalizzatore',
       stats: { 'velocità': 60, tecnica: 58, fisico: 56, 'mentalità': 57, tiro: 62, passaggio: 56, dribbling: 60, posizionamento: 58 } } };

/* ── LE SCHERMATE ──────────────────────────────────────────────────────────────────────────── */
const SCHERMATE = [
  { id: 'home',                 ctx: 'menu',     nome: 'Home fuori carriera' },
  { id: 'impostazioni',         ctx: 'menu',     nome: 'Impostazioni' },
  { id: 'creazione',            ctx: 'menu',     nome: 'Creazione' },
  { id: 'offerte',              ctx: 'offerte',  nome: 'Offerte' },
  { id: 'dashboard',            ctx: 'carriera', nome: 'Dashboard' },
  { id: 'stagione-classifica',  ctx: 'carriera', nome: 'Stagione · Classifica', tab: 'standings' },
  { id: 'stagione-calendario',  ctx: 'carriera', nome: 'Stagione · Calendario', tab: 'calendar' },
  { id: 'stagione-coppe',       ctx: 'carriera', nome: 'Stagione · Coppe',      tab: 'coppe' },
  { id: 'club',                 ctx: 'carriera', nome: 'Club',                  tab: 'club' },
  { id: 'carriera-profilo',     ctx: 'carriera', nome: 'Carriera · Profilo',    tab: 'profile' },
  { id: 'carriera-nazionale',   ctx: 'carriera', nome: 'Carriera · Nazionale',  tab: 'nazionale' },
  { id: 'agente',               ctx: 'carriera', nome: 'Staff',                 tab: 'agente' },
  { id: 'prepartita',           ctx: 'carriera', nome: 'Prepartita' },
  { id: 'partita-gioco',        ctx: 'partita',  nome: 'Partita · HUD in gioco' },
  { id: 'partita-scelta',       ctx: 'partita',  nome: 'Partita · HUD con la scelta' },
  /* [G15 · 22/09] LA SCHERMATA DI FINE PARTITA ENTRA NEL METRO. Era fra le «non nel conto» insieme
     alla partita e alle cinematiche — cioe' proprio dove vivono i rilievi del PO («migliora anche
     questa»). Una schermata che nessuno misura non si puo' ne' peggiorare ne' migliorare a numeri. */
  { id: 'post-partita',         ctx: 'partita',  nome: 'Post-partita · tabellino' },
];

/* ── LA MISURA (gira DENTRO la pagina) ─────────────────────────────────────────────────────── */
/* Scritta come stringa-funzione unica: page.evaluate non porta con se' le funzioni del modulo. */
function MISURA(W) {
  const R = { W, radice: 'body', scrollWidth: 0, clientWidth: 0, overflowPx: 0,
    nFuori: 0, fuori: [], nContenuti: 0, contenuti: [],
    nTesto: 0, nSottoPav: 0, nPiccoli: 0, minFs: null, sottoPav: [],
    nMisurati: 0, nSotto: 0, nGradiente: 0, nEmoji: 0, peggiori: [],
    nMarca: 0, marca: [],
    /* [G1 · il censimento del reso] Quante tinte, quanti corpi e quanti raggi DIVERSI vengono
       dipinti davvero su questa schermata. Non e' il conto degli esadecimali nel sorgente
       (quello lo fa tavolozza.mjs, ed e' cieco: un colore scritto dieci volte e mai reso vale
       zero): e' quello che l'occhio riceve. E' il tabellone su cui si misura l'applicazione
       della direzione, schermata per schermata. Nessuna soglia: e' un CENSIMENTO, non un
       guardiano — un numero che sale o scende, non un rosso che si puo' abbassare. */
    nColTesto: 0, nFondi: 0, nCorpi: 0, nRaggi: 0, nPesi: 0,
    corpi: [], raggi: [],
    /* [G9 · 22/09, collaudo PO «la schermata iniziale e' rimasta completamente fuori standard»]
       QUALI CARATTERI VENGONO RESI DAVVERO. Il provino approvato dal PO ha UN carattere vero,
       Barlow (+ Barlow Condensed per i numerali): una schermata che ne rende altri e' fuori
       standard per costruzione, e finora nessun numero lo diceva. Si legge la PRIMA famiglia
       della `font-family` calcolata — quella che il browser usa davvero — su ogni nodo di testo
       visibile. Censimento, non guardiano. */
    famiglie: [], nFamiglie: 0,
    /* [G12 · 22/09, direttiva PO «predisponi lo spazio dei volti rettangolari in verticale»] LO SPAZIO
       DELLA FIGURINA HA UN CONTRATTO, E IL CONTRATTO SI MISURA: ogni riquadro `data-cpm-figurina` deve
       rendere il rapporto 5:7. Qui si contano le figurine per schermata e si registra lo SCARTO PEGGIORE
       dal rapporto dichiarato: se l'arte arriva e qualcuno la mette in un riquadro storto, il numero lo
       dice prima del PO. */
    nFigurine: 0, figScarto: 0, figTipi: [],
    /* [G14 · 22/09] LE TINTE DEL TESTO, UNA PER UNA. Il conteggio (`nColTesto`) dice che la Dashboard ne
       rende quattordici contro le cinque del provino, ma non dice QUALI — e la differenza e' tutta li':
       una tinta semantica (vittoria, sconfitta, allarme) e' un'informazione e deve restare, un grigio nato
       per sbaglio e' debito. Senza l'elenco col nodo d'esempio, unificare sarebbe indovinare. */
    tinteTesto: [], corpiDet: [], nSvgTesto: 0,/* [G13 · 22/09] e la stessa cosa per i CORPI: un elenco senza esempio non fa trovare il nodo — lezione G8.8 */
    /* [G8.3 · direttiva PO 17/09 «se una schermata e' troppo lunga valuta se mettere degli
       accordion»] QUANTO E' LUNGA. Prima di aprire e chiudere sezioni serve sapere quali
       schermate lo meritano davvero: `schermate` e' l'altezza del documento diviso l'altezza
       dello schermo del PO (915 px). 1,0 = tutto sopra la piega. 3,0 = tre schermate di
       scorrimento. Non e' un guardiano: e' il numero che dice DOVE serve un accordion. */
    altezzaPx: 0, schermate: 0, scorritore: '', blocchi: [], etichette: {}, nEmojiChar: 0, doveEmoji: [], hVoce: 0, hSostieni: 0, hFeedback: 0, nScuri: 0, scuri: [] };   /* [G3.2] bottoni VISIBILI col fondo pieno di marca (#8e1f33 o gradiente che lo contiene): la gerarchia vuole UNA sola azione primaria per vista */

  const de = document.documentElement;

  /* [G0 v2 · costo] getComputedStyle memoizzato: sulla Creazione (841 nodi di testo, ~3000 elementi)
     la misura chiamava lo stesso calcolo di stile decine di migliaia di volte e una schermata a
     cinque larghezze costava 3-4 minuti. Il risultato non cambia: nulla muta il DOM qui dentro. */
  const _cs = new WeakMap();
  const gcs = (el) => { let v = _cs.get(el); if (!v) { v = window.getComputedStyle(el); _cs.set(el, v); } return v; };

  /* selettore corto e leggibile: al massimo tre livelli */
  const sel = (el) => {
    const parts = []; let n = el;
    for (let i = 0; i < 3 && n && n.nodeType === 1 && n !== document.body; i++) {
      let s = n.tagName.toLowerCase();
      if (n.id) { parts.unshift(s + '#' + n.id); break; }
      const cls = (typeof n.className === 'string' ? n.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
      if (cls.length) s += '.' + cls.join('.');
      else { const p = n.parentElement; if (p) s += ':nth-child(' + ([].indexOf.call(p.children, n) + 1) + ')'; }
      parts.unshift(s); n = n.parentElement;
    }
    return parts.join('>').slice(0, 90);
  };

  /* opacita' effettiva accumulata sui genitori */
  const _opac = new WeakMap();
  const opac = (el) => { let v = _opac.get(el); if (v === undefined) { v = opacCalc(el); _opac.set(el, v); } return v; };
  const opacCalc = (el) => { let o = 1, n = el; while (n && n.nodeType === 1) { const v = parseFloat(gcs(n).opacity); if (!isNaN(v)) o *= v; if (o < 0.1) return o; n = n.parentElement; } return o; };

  /* un antenato ritaglia o fa scorrere in orizzontale? allora il figlio non e' «fuori dallo schermo» */
  const contenuto = (el) => { let n = el.parentElement; while (n && n.nodeType === 1 && n !== document.documentElement) { const ox = gcs(n).overflowX; if (ox === 'hidden' || ox === 'auto' || ox === 'scroll' || ox === 'clip') return true; n = n.parentElement; } return false; };

  /* ── colore: lettura, composizione, luminanza ────────────────────────────────────────────── */
  const leggi = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const sopra = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
  const lum = (c) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const hex = (c) => '#' + [c.r, c.g, c.b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

  /* ── LA RADICE DELLA MISURA ──────────────────────────────────────────────────────────────────
     Una schermata a tutto campo (le Impostazioni sono `position:fixed; inset:0; background:TH.bg`)
     COPRE la pagina sotto, che pero' resta nel DOM: misurandola da `body` si contavano anche i
     nodi della Home nascosti dietro — la prima corsa dava 60 nodi di testo alle Impostazioni,
     e quasi tutti erano della Home. Qui si cerca il velo opaco piu' alto che copre l'intero
     riquadro e, se c'e', la misura parte da li'. La composizione dei fondi risale comunque i
     genitori, quindi il colore resta quello vero. */
  const overlay = (() => {
    const vw = de.clientWidth, vh = de.clientHeight; let best = null, bz = -1;
    const el = document.body.querySelectorAll('*');
    for (let i = 0; i < el.length; i++) {
      const n = el[i], cs = gcs(n);
      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue;
      const bg = leggi(cs.backgroundColor);
      if (!((bg && bg.a >= 0.999) || (cs.backgroundImage && cs.backgroundImage !== 'none'))) continue;
      const r = n.getBoundingClientRect();
      if (r.width < vw * 0.98 || r.height < vh * 0.98 || r.left > 1 || r.top > 1) continue;
      const z = parseInt(cs.zIndex, 10) || 0;
      if (z >= bz) { bz = z; best = n; }
    }
    return best;
  })();
  const radice = overlay || document.body;
  R.radice = overlay ? sel(overlay) : 'body';
  R.scrollWidth = overlay ? overlay.scrollWidth : de.scrollWidth;
  R.clientWidth = overlay ? overlay.clientWidth : de.clientWidth;
  R.overflowPx = Math.max(0, Math.round(R.scrollWidth - R.clientWidth));
  /* [G8.3 · correzione dello stesso giorno] La prima stesura leggeva `document.scrollHeight` e
     rispondeva 915 px su TUTTE E TREDICI le schermate, cioe' esattamente l'altezza dello schermo:
     un numero impossibile, e infatti falso. Il gioco NON scorre sul documento — `#root` e' alto
     100% e lo scorrimento vive in un contenitore interno. Qui si cerca lo SCORRITORE VERO: fra
     tutti gli elementi visibili, quello con `scrollHeight` maggiore del proprio `clientHeight`
     e un `overflow-y` che scorre. Si tiene il piu' alto, e si dichiara QUALE e', perche' un
     numero senza il suo colpevole non si puo' controllare. */
  {
    let best = null, bh = 0;
    const cand2 = radice === document.body ? document.body.querySelectorAll('*') : radice.querySelectorAll('*');
    const guarda = (el) => {
      const cs = gcs(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const oy = cs.overflowY;
      if (!(oy === 'auto' || oy === 'scroll' || oy === 'overlay')) return;
      const r = el.getBoundingClientRect();
      /* [G8.3 · seconda correzione] Solo lo scorritore DELLA PAGINA, non una lista dentro una
         scatola. Senza questo filtro la Creazione rispondeva 11.576 px (12,65 schermate): era
         la lista dei 200 club dei sogni dentro un riquadro alto 220 px, cioe' uno scorrimento
         VOLUTO, non una schermata lunga. Il filtro: lo scorritore deve occupare almeno meta'
         dello schermo. */
      if (r.width < 40 || r.height < de.clientHeight * 0.5) return;
      if (el.scrollHeight <= el.clientHeight + 4) return;
      if (el.scrollHeight > bh) { bh = el.scrollHeight; best = el; }
    };
    for (let i = 0; i < cand2.length; i++) guarda(cand2[i]);
    const docH = Math.max(de.scrollHeight, document.body.scrollHeight);
    if (bh > docH) { R.altezzaPx = Math.round(bh); R.scorritore = sel(best); }
    else { R.altezzaPx = Math.round(docH); R.scorritore = best ? sel(best) : 'documento'; }
    R.schermate = Math.round(R.altezzaPx / 915 * 100) / 100;

    /* [21/09 · rilievo PO «il tab carriera e' lunghissimo»] DOVE STANNO I PIXEL.
       Sapere che una schermata e' lunga 3.575 px non dice quale pezzo la allunga, e senza quello
       si accorcia a caso. Qui si misurano i BLOCCHI di primo livello dello scorritore: altezza,
       quota sul totale e la prima riga di testo che portano (il loro cappello). Solo per le
       schermate sopra le due schermate: sotto, non c'e' niente da accorciare. */
    if (best && R.altezzaPx > 1830) {
      /* Si scende finche' i figli sono DAVVERO dei blocchi: un involucro con un figlio solo non lo e',
         e nemmeno un contenitore il cui figlio piu' alto vale da solo piu' dell'80 % della schermata
         (era il caso del Profilo: rispondeva «un blocco da 3.644 px», cioe' l'intera pagina). */
      const figli = (el) => {
        const out = [];
        for (let i = 0; el && i < el.children.length; i++) {
          const c = el.children[i], cs = gcs(c);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          const h = c.getBoundingClientRect().height;
          if (h < 24) continue;
          out.push({ el: c, h });
        }
        return out;
      };
      let cont = best, liv = [];
      for (let g = 0; g < 10 && cont; g++) {
        liv = figli(cont);
        if (!liv.length) break;
        const max = liv.reduce((a, b) => b.h > a.h ? b : a, liv[0]);
        if (liv.length === 1 || max.h > R.altezzaPx * 0.8) { cont = max.el; continue; }
        break;
      }
      const dentro = liv.map(x => ({ px: Math.round(x.h), quota: Math.round(x.h / R.altezzaPx * 1000) / 10,
        txt: (x.el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 42), sel: sel(x.el) }));
      dentro.sort((a, b) => b.px - a.px);
      R.blocchi = dentro.slice(0, 12);
    }
  }

  /* ── M5 · elementi che sporgono a destra ─────────────────────────────────────────────────── */
  const cand = [];
  const tutti = radice.querySelectorAll('*');
  for (let i = 0; i < tutti.length; i++) {
    const el = tutti[i]; const cs = gcs(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    const scarto = r.right - W;
    if (scarto > 0.5) cand.push({ el, scarto, cont: contenuto(el) });
  }
  const mappa = new Map(); cand.forEach(c => mappa.set(c.el, c));
  /* si tiene solo il colpevole PIU' ESTERNO: se un antenato sporge almeno quanto lui, il figlio e' un riflesso */
  const esterni = cand.filter(c => { let n = c.el.parentElement; while (n && n.nodeType === 1) { const a = mappa.get(n); if (a && a.scarto >= c.scarto - 0.5) return false; n = n.parentElement; } return true; });
  const cont5 = esterni.filter(c => c.cont).sort((a, b) => b.scarto - a.scarto);
  R.nContenuti = cont5.length;
  R.contenuti = cont5.slice(0, 5).map(c => ({ sel: sel(c.el), px: Math.round(c.scarto * 10) / 10, txt: (c.el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 34) }));
  const liberi = esterni.filter(c => !c.cont).sort((a, b) => b.scarto - a.scarto);
  R.nFuori = liberi.length;
  R.fuori = liberi.slice(0, 5).map(c => ({ sel: sel(c.el), px: Math.round(c.scarto * 10) / 10, txt: (c.el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 34) }));

  const _fondo = new WeakMap();
  const fondo = (el) => { let v = _fondo.get(el); if (!v) { v = fondoCalc(el); _fondo.set(el, v); } return v; };
  const fondoCalc = (el) => {
    const strati = []; let n = el, grad = false, opaco = false;
    while (n && n.nodeType === 1) {
      const cs = gcs(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') grad = true;
      const c = leggi(cs.backgroundColor);
      if (c && c.a > 0.004) { strati.push(c); if (c.a >= 0.999) { opaco = true; break; } }
      n = n.parentElement;
    }
    if (!opaco) strati.push({ r: 255, g: 255, b: 255, a: 1 }); /* il fondo ultimo del browser */
    let base = strati[strati.length - 1];
    for (let i = strati.length - 2; i >= 0; i--) base = sopra(strati[i], base);
    return { col: base, grad };
  };

  /* ── M3 + M6 · i nodi di testo visibili ──────────────────────────────────────────────────── */
  const _fam = new Map(); const _colT = new Set(), _fon = new Set(), _cor = new Set(), _pes = new Set(), _rag = new Set();
  const agg = new Map(); /* coppie colore/fondo raggruppate: 400 righe uguali sono UN difetto */
  /* [G8.8] IL PAVIMENTO DIRA' ANCHE DOVE. Il conteggio «8 nodi sotto gli 11 px» non basta a trovarli:
     e' la stessa cecita' della colonna selettore del contrasto (G8.7, «non li ho trovati»). Qui i nodi
     sotto il pavimento si raggruppano per corpo+peso+selettore e finiscono in una tabella di dettaglio. */
  const pav = new Map();
  const _pav = (el, nd, fs, fw) => {
    const k = Math.round(fs * 10) / 10 + '|' + fw + '|' + sel(el);
    const e = pav.get(k);
    if (e) e.n++;
    else pav.set(k, { fs: Math.round(fs * 10) / 10, fw, sel: sel(el), n: 1, esempio: (nd.nodeValue || '').replace(/\s+/g, ' ').trim().slice(0, 26) });
  };
  const tw = document.createTreeWalker(radice, NodeFilter.SHOW_TEXT, null);
  let nodo;
  while ((nodo = tw.nextNode())) {
    if (!/\S/.test(nodo.nodeValue || '')) continue;
    const p = nodo.parentElement; if (!p) continue;
    const tag = p.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TITLE') continue;
    const cs = gcs(p);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const rg = document.createRange(); rg.selectNodeContents(nodo);
    const rects = rg.getClientRects(); let vis = false, rr = null;
    for (let i = 0; i < rects.length; i++) { const r = rects[i]; if (r.width > 0.5 && r.height > 0.5) { vis = true; rr = r; break; } }
    if (!vis) continue;
    if (rr.right < -1 || rr.left > de.scrollWidth + 1) continue;  /* spinto fuori pagina a sinistra/destra: non e' letto da nessuno */
    if (opac(p) < 0.1) continue;

    /* [G13 · 22/09 — UN'UNITA' SVG NON E' UN PIXEL, E IL CENSIMENTO LA CONTAVA COME TALE.]
       Il dettaglio dei corpi (tabella 9-octies) ha nominato il colpevole del misterioso corpo «27» che
       compariva su Club e Dashboard e non stava in nessun token: e' la SIGLA DELLO STEMMA, `<text
       fontSize="27">` dentro un `<svg viewBox>`. Dentro un viewBox quel 27 e' un'unita' di disegno, non
       un pixel: lo stemma e' alto 18-40 px reali, quindi quella sigla RENDE a 6-11 px. `getComputedStyle`
       pero' restituisce 27, e il censimento la contava come un corpo tipografico in piu' su ogni
       schermata con uno stemma. Il testo dentro SVG esce quindi dal conto dei CORPI e dal pavimento (due
       grandezze in pixel) e viene contato a parte; resta invece nel contrasto, che e' un rapporto fra
       colori e non dipende dalla scala. */
    const _inSvg = !!(p && p.ownerSVGElement);
    if (_inSvg) R.nSvgTesto = (R.nSvgTesto | 0) + 1;
    const fs = parseFloat(cs.fontSize) || 0;
    const fw = parseInt(cs.fontWeight, 10) || (/(bold|bolder)/.test(cs.fontWeight) ? 700 : 400);
    if (!_inSvg) {
      R.nTesto++;
      if (fs < 10) R.nPiccoli++;
      if (fs < 11) { R.nSottoPav++; _pav(p, nodo, fs, fw); }
    }/* [C4 · 16/09] IL PAVIMENTO DICHIARATO E' 11 px (FS.caption), non 10: la colonna <10px non vedeva gli 810 `fontSize:10` scritti a mano, che sono il corpo piu' diffuso dell'intero gioco. Questa colonna misura il pavimento vero. */
    if (R.minFs == null || fs < R.minFs) R.minFs = fs;

    /* [G8.7] I GLIFI DI SOLE EMOJI SONO ESCLUSI, E DICHIARATI — non tolti di nascosto.
       Un'emoji si disegna coi PROPRI colori: la `color` CSS non la tocca, quindi il rapporto
       fra quella `color` e il fondo non dice niente sulla sua leggibilita'. Misurare li' ha
       prodotto un rosso permanente sul glifo «🥈» della classifica (#9ca3af su #ffffff,
       2,54:1) che nessuna correzione poteva chiudere. Stesso trattamento dei gradienti:
       si contano a parte, cosi' l'esclusione resta visibile nel rapporto invece di sparire. */
    if (!/[\p{L}\p{N}]/u.test(nodo.nodeValue || '')) { R.nEmoji++; continue; }
    const f = fondo(p);
    if (f.grad) { R.nGradiente++; continue; }
    let tc = leggi(cs.color); if (!tc) continue;
    if (tc.a < 0.999) tc = sopra(tc, f.col);
    const l1 = lum(tc), l2 = lum(f.col);
    const rap = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const soglia = (fs >= 18 || (fs >= 14 && fw >= 700)) ? 3 : 4.5;
    R.nMisurati++;
    if (rap < soglia) R.nSotto++;
    _colT.add(hex(tc)); _fon.add(hex(f.col)); if (!_inSvg) { _cor.add(Math.round(fs * 10) / 10); _pes.add(fw); }
    { const ff = String(cs.fontFamily || '').split(',')[0].replace(/["']/g, '').trim(); if (ff) _fam.set(ff, (_fam.get(ff) | 0) + 1); }
    const k = hex(tc) + '|' + hex(f.col) + '|' + Math.round(fs * 10) / 10 + '|' + fw;
    const e = agg.get(k);
    if (e) e.n++;
    else agg.set(k, { testo: hex(tc), fondo: hex(f.col), fs: Math.round(fs * 10) / 10, fw, rap: Math.round(rap * 100) / 100, soglia, n: 1, svg: _inSvg, sel: sel(p), esempio: (nodo.nodeValue || '').replace(/\s+/g, ' ').trim().slice(0, 26) });
  }
  /* i raggi: si guardano TUTTI gli elementi visibili con un angolo arrotondato, non solo il testo */
  for (let i = 0; i < tutti.length; i++) {
    const el = tutti[i], cs = gcs(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const br = parseFloat(cs.borderTopLeftRadius) || 0;
    if (br > 0.4 && br < 900) _rag.add(Math.round(br * 10) / 10);
  }
  /* [21/09 · richiesta PO «verifica anche eventuali ridondanze delle informazioni»]
     Si contano le ETICHETTE, non i numeri: un «14» si ripete per caso, un «Assist» no. Parola intera,
     solo nodi VISIBILI. Due letture con rimedi opposti: la stessa grandezza ripetuta DENTRO una
     schermata (da togliere) e la stessa grandezza in molte schermate (cruscotto o rumore, si decide). */
  try {
    const ETI = ['Gol','Assist','Presenze','Partite','Media voto','OVR','Forma','Morale','Fatica',
      'Stipendio','Valore','Contratto','Fiducia','Trofei','Punti','Stagione','Settimana','Obiettivi'];
    const testo = (radice.innerText || '');
    const conta = {};
    for (const e of ETI) {
      const re = new RegExp('(^|[^\\p{L}])' + e.replace(/ /g, '\\s+') + '([^\\p{L}]|$)', 'giu');
      let n = 0; while (re.exec(testo)) { n++; if (n > 99) break; }
      if (n) conta[e] = n;
    }
    R.etichette = conta;
    /* [21/09 · rilievo PO «vedo ancora emoji e non la grafica proposta per i menu'»]
       Il provino approvato (`docs/collaudo-grafico/proposta-schermate/`) non ha UNA emoji: i cappelli
       sono etichetta maiuscoletta + filo + azione, la barra in basso e' solo testo. Il gioco invece ne
       e' pieno. Qui si contano i CARATTERI emoji (non i glifi isolati, che erano gia' contati a parte
       per il contrasto): quante, e in quali testi — cosi' si sa da dove cominciare. */
    const RE_EMO = /\p{Extended_Pictographic}/gu;
    const emo = (testo.match(RE_EMO) || []).length;
    const dove = [];
    const tw2 = document.createTreeWalker(radice, NodeFilter.SHOW_TEXT, null);
    let n2, visti = new Set();
    while ((n2 = tw2.nextNode())) {
      const v = (n2.nodeValue || '').trim();
      if (!v || !RE_EMO.test(v)) { RE_EMO.lastIndex = 0; continue; }
      RE_EMO.lastIndex = 0;
      const pe = n2.parentElement; if (!pe) continue;
      const cs2 = gcs(pe); if (cs2.display === 'none' || cs2.visibility === 'hidden') continue;
      const k = v.slice(0, 30);
      if (visti.has(k)) continue; visti.add(k);
      if (dove.length < 10) dove.push(k);
    }
    R.nEmojiChar = emo; R.doveEmoji = dove;
  } catch (_e) { R.etichette = {}; R.nEmojiChar = -1; R.doveEmoji = []; }
  /* [21/09 · PO «aumenta un po' l'altezza dei pulsanti menu' e riduci in altezza il sostieni»]
     LE STRISCE DI FONDO hanno un'altezza, e va misurata: la voce di menu' e' un bersaglio per il dito
     (la soglia consigliata per il tocco e' 44 px), le strisce di servizio sono solo un invito. */
  try {
    const h = (sel2) => { const e = document.querySelector(sel2); if (!e) return 0; const r = e.getBoundingClientRect(); return Math.round(r.height); };
    const nav = document.querySelectorAll('button[title$="[M]"], button[title="Impostazioni"]');
    let hv = 0; nav.forEach(b => { const r = b.getBoundingClientRect(); if (r.height > hv) hv = Math.round(r.height); });
    let hd = 0, hf = 0;
    document.querySelectorAll('button[title^="Sostieni"]').forEach(b => { hd = Math.round(b.getBoundingClientRect().height); });
    document.querySelectorAll('button[title^="Invia idee"]').forEach(b => { hf = Math.round(b.getBoundingClientRect().height); });
    R.hVoce = hv; R.hSostieni = hd; R.hFeedback = hf;
  } catch (_e) { R.hVoce = -1; R.hSostieni = -1; R.hFeedback = -1; }
  /* [22/09 · rilievi PO in serie: «disomogenea dalle altre», «fuori standard», «terribile»]
     LE SUPERFICI SCURE DENTRO UN GIOCO CHE HA UN TEMA SOLO, CHIARO (dalla 7.947).
     Il PO ha segnalato sette schermate diverse in pochi minuti — formazioni, il mondo fuori,
     l'intervista, il rivale, il club dei sogni, la prepartita — e NON sono sette difetti: sono
     superfici rimaste scure quando il tema scuro e' stato ritirato. Qui si contano e si NOMINANO:
     riquadri visibili, larghi almeno mezzo schermo e alti almeno 40 px, con fondo di luminanza
     sotto 0,25. Cosi' la famiglia si chiude con una misura invece che a un rilievo per volta. */
  try {
    const scuri = [];
    for (let i = 0; i < tutti.length; i++) {
      const el = tutti[i], cs = gcs(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width < de.clientWidth * 0.5 || r.height < 40) continue;
      /* [22/09 · difetto MIO dello strumento, trovato alla prima corsa utile] I GRADIENTI NON SI SALTANO.
         La prima stesura escludeva ogni fondo a gradiente (copiando la regola del contrasto, dove
         l'esclusione e' giusta perche' il rapporto va letto su un fondo fermo). Ma le superfici che il
         PO ha segnalato — «il tuo rivale», «il club dei sogni», «il mondo fuori» — sono ESATTAMENTE
         gradienti scuri: il censimento rispondeva 10 e nominava solo la testata. Per dire «questa e'
         scura» non serve un fondo fermo: bastano le tinte dichiarate nel gradiente, e si prende la
         PIU' CHIARA (la piu' generosa: se anche quella e' sotto soglia, la superficie e' scura). */
      const cs2 = cs.backgroundImage || '';
      let L = null, hexF = null;
      const f = fondo(el);
      if (f.col && !f.grad) { L = lum(f.col); hexF = hex(f.col); }
      else if (/gradient/i.test(cs2)) {
        const tinte = (cs2.match(/rgba?\([^)]+\)|#[0-9a-f]{3,8}/gi) || []).map(x => leggi(x)).filter(Boolean);
        if (!tinte.length) continue;
        let best = null;
        for (const t of tinte) { const l = lum(t); if (best == null || l > best) { best = l; hexF = hex(t); } }
        L = best;
      }
      if (L == null || L >= 0.25) continue;
      /* solo il piu' esterno: un figlio scuro dentro un padre scuro non e' un secondo difetto */
      let dentro = false;
      for (const q of scuri) { if (q.el && q.el.contains(el)) { dentro = true; break; } }
      if (dentro) continue;
      scuri.push({ el, sel: sel(el), lum: Math.round(L * 1000) / 1000, fondo: hexF,
        px: Math.round(r.height), txt: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 34) });
    }
    R.nScuri = scuri.length;
    R.scuri = scuri.slice(0, 6).map(x => ({ sel: x.sel, lum: x.lum, fondo: x.fondo, px: x.px, txt: x.txt }));
  } catch (_e) { R.nScuri = -1; R.scuri = []; }
  R.nColTesto = _colT.size; R.nFondi = _fon.size; R.nCorpi = _cor.size; R.nPesi = _pes.size; R.nRaggi = _rag.size;
  try{
    const figs = [...radice.querySelectorAll('[data-cpm-figurina]')];
    const tipi = new Map(); let peggio = 0;
    for (const f of figs) {
      const r = f.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      const att = 7 / 5, vero = r.height / r.width;
      const sc = Math.abs(vero - att) / att; if (sc > peggio) peggio = sc;
      const t = f.getAttribute('data-cpm-figurina') || '?'; tipi.set(t, (tipi.get(t) | 0) + 1);
    }
    R.nFigurine = figs.length; R.figScarto = Math.round(peggio * 1000) / 10;
    R.figTipi = [...tipi.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => ({ t, n }));
  }catch(_e){ R.nFigurine = -1; }
  R.famiglie = [..._fam.entries()].sort((a, b) => b[1] - a[1]).map(([f, n]) => ({ f, n })); R.nFamiglie = _fam.size;
  R.corpi = [..._cor].sort((a, b) => a - b);
  R.raggi = [..._rag].sort((a, b) => a - b);
  { const per = new Map();
    for (const e of agg.values()) { const k = e.testo; const o = per.get(k);
      if (o) { o.n += e.n; if (e.fs > o.fs) { o.fs = e.fs; o.esempio = e.esempio; } }
      else per.set(k, { c: k, n: e.n, fs: e.fs, esempio: e.esempio }); }
    R.tinteTesto = [...per.values()].sort((a, b) => b.n - a.n); }
  { const perC = new Map();
    for (const e of agg.values()) { if (e.svg) continue; const k = e.fs; const o = perC.get(k);
      if (o) { o.n += e.n; } else perC.set(k, { fs: k, n: e.n, esempio: e.esempio, sel: e.sel }); }
    R.corpiDet = [...perC.values()].sort((a, b) => a.fs - b.fs); }
  R.peggiori = [...agg.values()].sort((a, b) => a.rap - b.rap || b.n - a.n).slice(0, 5);
  R.sottoPav = [...pav.values()].sort((a, b) => a.fs - b.fs || b.n - a.n).slice(0, 5);
  if (R.minFs != null) R.minFs = Math.round(R.minFs * 10) / 10;
  /* [G3.2] bottoni pieni di marca: <button> e [role=button] visibili il cui fondo calcolato e' il bordeaux di marca */
  try {
    const BR = 'rgb(142, 31, 51)';
    document.querySelectorAll('button,[role="button"]').forEach(b => {
      const r = b.getBoundingClientRect(); if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > window.innerHeight * 4) return;
      const cs = getComputedStyle(b); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.1) return;
      const pieno = cs.backgroundColor === BR || (cs.backgroundImage || '').indexOf('142, 31, 51') >= 0;
      if (pieno) { R.nMarca++; if (R.marca.length < 6) R.marca.push((b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)); }
    });
  } catch (_e) {}
  return R;
}

/* ── attese deterministiche ────────────────────────────────────────────────────────────────── */
/* [G0 v2 · costo] la stabilita' si legge da textContent, non da innerText: innerText forza il calcolo
   del layout a ogni sondaggio e sulla Creazione (lista dei 200 club) costava piu' della misura stessa.
   Per capire se la pagina si e' fermata basta il testo grezzo + quanti elementi ci sono. */
const testoNorm = p => p.evaluate(() => ((document.body.textContent || '').replace(/\d{1,2}:\d{2}/g, '·').replace(/\s+/g, ' ') + '|' + document.body.querySelectorAll('*').length));
async function attendiFermo(page, { min = 450, max = 7000, passo = 250 } = {}) {
  await sleep(min);
  let prev = null, uguali = 0; const t0 = Date.now();
  while (Date.now() - t0 < max) {
    let t = null; try { t = await testoNorm(page); } catch (_e) {}
    if (t != null && t === prev) { if (++uguali >= 2) return true; } else { uguali = 0; prev = t; }
    await sleep(passo);
  }
  return false;
}
async function congela(page) {
  await page.evaluate(() => {
    if (!document.getElementById('__g0_freeze')) {
      const st = document.createElement('style'); st.id = '__g0_freeze';
      st.textContent = '*,*::before,*::after{transition:none!important}';
      document.head.appendChild(st);
    }
    (document.getAnimations ? document.getAnimations() : []).forEach(a => {
      try { const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
        if (t && (t.iterations === Infinity || t.duration === Infinity)) { a.currentTime = 0; a.pause(); } else { a.finish(); } } catch (_e) {}
    });
    window.scrollTo(0, 0);
  });
  await sleep(160);
}

/* ── apertura delle pagine ─────────────────────────────────────────────────────────────────── */

async function apri(browser, port, taglia, initArg, query, errori) {
  const page = await browser.newPage({ viewport: { width: taglia.w, height: taglia.h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  page.on('pageerror', e => errori.push(`${taglia.w}px · ${String(e.message).slice(0, 120)}`));
  await installCdnRoutes(page);
  await page.addInitScript(INIT, initArg);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  return page;
}

const premi = (page, rx) => page.evaluate(s => { const r = new RegExp(s); const b = [...document.querySelectorAll('button')].find(x => r.test((x.textContent || '').trim())); if (b) { b.click(); return (b.textContent || '').trim().slice(0, 30); } return null; }, rx);

/* ── corsa ─────────────────────────────────────────────────────────────────────────────────── */
const HTML = path.join(ROOT, 'CARRIER-MANAGER-AV.html');
if (!fs.existsSync(HTML)) { console.error('manca CARRIER-MANAGER-AV.html: lancia prima `node tools/build-src.mjs`'); process.exit(2); }
const VER = (() => { const m = /GAME_VERSION\s*=\s*["']([^"']+)/.exec(fs.readFileSync(HTML, 'utf8').slice(0, 400000)); return m ? m[1] : '?'; })();

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

/* ── TARATURA DELLO STRUMENTO (CPM_TARATURA=1) ───────────────────────────────────────────────
   Prima di credere a uno zero bisogna sapere che lo strumento sa vedere l'uno. Qui la misura
   gira su due paginette costruite a mano, di cui si conosce la risposta esatta. Se questa
   taratura non passa, i numeri della griglia non valgono niente. */
if (process.env.CPM_TARATURA === '1') {
  const pg = await browser.newPage({ viewport: { width: 412, height: 800 }, deviceScaleFactor: 1 });
  const casi = [];
  await pg.setContent(`<!doctype html><html><body style="margin:0;font-family:sans-serif">
    <div id="largo" style="width:500px;height:20px;background:#ddd"></div>
    <div style="width:200px;overflow-x:auto"><div id="dentro" style="width:600px;height:12px;background:#eee"></div></div>
    <p style="font-size:8px;color:#000;background:#fff;margin:0">otto</p>
    <p style="font-size:12px;color:#777;background:#fff;margin:0">grigio</p>
    <p style="font-size:20px;color:#777;background:#fff;margin:0">grande</p>
    <p style="font-size:12px;color:#fff;background:linear-gradient(#000,#fff);margin:0">gradiente</p>
    <p style="font-size:12px;color:rgba(0,0,0,.5);background:#fff;margin:0">semi</p>
    <p style="display:none">nascosto</p>
  </body></html>`);
  const a = await pg.evaluate(MISURA, 412);
  const att = [
    ['overflow in px', a.overflowPx, 88],
    ['elementi fuori', a.nFuori, 1],
    ['scarto del piu\' esterno', a.fuori[0] && a.fuori[0].px, 88],
    ['elementi contenuti da un antenato', a.nContenuti, 1],
    ['nodi di testo visibili', a.nTesto, 5],
    ['nodi sotto i 10 px', a.nPiccoli, 1],
    ['nodi sotto il pavimento 11 px', a.nSottoPav, 1],
    ['font-size minimo', a.minFs, 8],
    ['nodi esclusi per gradiente', a.nGradiente, 1],
    ['nodi misurabili per il contrasto', a.nMisurati, 4],
    ['nodi sotto soglia di contrasto', a.nSotto, 2],
    ['radice della misura', a.radice, 'body'],
  ];
  await pg.setContent(`<!doctype html><html><body style="margin:0">
    <p style="font-size:12px">testo di sotto</p><p style="font-size:12px">altro testo di sotto</p>
    <div style="position:fixed;inset:0;background:#fff;z-index:50"><span style="font-size:12px;color:#000">solo io</span></div>
  </body></html>`);
  const b2 = await pg.evaluate(MISURA, 412);
  att.push(['con un velo a tutto schermo: nodi contati', b2.nTesto, 1]);
  att.push(['con un velo a tutto schermo: radice', b2.radice.startsWith('div'), true]);
  let ko = 0;
  att.forEach(([n, got, exp]) => { const ok = got === exp; if (!ok) ko++; console.log(`${ok ? 'ok  ' : 'KO  '} ${n}: ${JSON.stringify(got)}${ok ? '' : ' (atteso ' + JSON.stringify(exp) + ')'}`); });
  console.log(ko ? `TARATURA FALLITA — ${ko} su ${att.length}` : `TARATURA OK — ${att.length} su ${att.length}`);
  await pg.close(); await browser.close(); srv.close();
  process.exit(ko ? 1 : 0);
}

const errori = []; const saltate = [];
const DATI = {};   /* DATI[schermata][larghezza] = misura */

/* [G0 v2 — UNA APERTURA PER CONTESTO, CINQUE LARGHEZZE PER SCHERMATA]
   La prima stesura riapriva il gioco a ogni larghezza: 15 aperture, e ogni apertura costa la
   traspilazione Babel IN PAGINA di un file da 5,7 MB — 14-22 s a macchina scarica, molto di piu'
   quando un'altra catena occupa la CPU. Misurato: 17 misure in 17 minuti, cioe' 2,5 ore per una
   sola corsa e nessuna possibilita' di farne due per provare la ripetibilita'. Ora si apre TRE
   volte (una per contesto) e la larghezza si cambia con `setViewportSize`, rimisurando la stessa
   schermata. CONTROPROVA, riportata nel REPORT: i numeri a 412 px ottenuti ridimensionando devono
   coincidere con quelli della prima stesura, che a 412 px apriva il gioco da zero. */
const dirDi = (w) => { const d = path.join(OUT, String(w)); if (FOTO) fs.mkdirSync(d, { recursive: true }); return d; };
const misuraTutte = async (page, sc) => {
  for (const t of TAGLIE) {
    await page.setViewportSize({ width: t.w, height: t.h });
    await sleep(220);
    await attendiFermo(page); await congela(page);
    const m = await page.evaluate(MISURA, t.w);
    (DATI[sc.id] = DATI[sc.id] || {})[t.w] = m;
    if (FOTO) { try { await page.screenshot({ path: path.join(dirDi(t.w), sc.id + '.png'), animations: 'disabled', caret: 'hide', timeout: 40000 }); } catch (e) { saltate.push(`foto ${sc.id}@${t.w}: ${String(e.message).slice(0, 60)}`); } }
    process.stdout.write(`  ${String(t.w).padStart(3)}px ${sc.id.padEnd(22)} overflow ${String(m.overflowPx).padStart(3)}px · fuori ${String(m.nFuori).padStart(2)} (${m.nContenuti}) · <10px ${String(m.nPiccoli).padStart(3)} · <11px ${String(m.nSottoPav).padStart(3)}/${String(m.nTesto).padStart(3)} (min ${m.minFs}) · contrasto ${String(m.nSotto).padStart(3)}/${m.nMisurati}\n`);
  }
};
const SC = id => SCHERMATE.find(s => s.id === id);

/* ctx MENU — home · impostazioni · creazione (una sola apertura) */
{
  const page = await apri(browser, port, TAGLIE[0], { seme: SEME, tema: TEMA, rossi: ROSSI, fisAperte: FIS_APERTE }, '?cpmtest=1', errori);
  await misuraTutte(page, SC('home'));
  if (await premi(page, 'Opzioni')) { await misuraTutte(page, SC('impostazioni')); await premi(page, '^✕$'); await sleep(500); }
  else saltate.push('impostazioni: bottone Opzioni non trovato');
  if (await premi(page, 'Nuova carriera')) await misuraTutte(page, SC('creazione'));
  else saltate.push('creazione: bottone "Nuova carriera" non trovato');
  await page.close();
}

/* ctx OFFERTE — senza ?cpmtest=1: e' l'auto-ripresa dei provini conclusi che porta a questa schermata */
{
  const page = await apri(browser, port, TAGLIE[0], { seme: SEME, tema: TEMA, rossi: ROSSI, trial: TRIALPROG, fisAperte: FIS_APERTE }, '', errori);
  const ok = await page.waitForFunction(() => /Offerte ricevute/.test(document.body.innerText || ''), null, { timeout: 30000 }).then(() => true).catch(() => false);
  if (ok) await misuraTutte(page, SC('offerte'));
  else saltate.push("offerte: la schermata non si e' aperta");
  await page.close();
}

/* ctx CARRIERA — i tab + la prepartita (una sola apertura) */
{
  const page = await apri(browser, port, TAGLIE[0], { seme: SEME, tema: TEMA, rossi: ROSSI, save: SAVE, fisAperte: FIS_APERTE }, '?cpmtest=1', errori);
  await _controllaTema(page);
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) { saltate.push('carriera: "Continua" non trovato'); }
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
  if (!vivo) saltate.push('carriera: __CPM_CAREER mai comparso — nessuna schermata di carriera misurata');
  else {
    await sleep(900);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {}
    await sleep(400);
    for (const sc of SCHERMATE.filter(s => s.ctx === 'carriera' && s.id !== 'prepartita')) {
      const r = await page.evaluate(x => window.__CPM_CAREER.goTab(x), sc.tab || 'dashboard');
      if (r !== true) { saltate.push(`${sc.id}: goTab → ${r}`); continue; }
      await sleep(300);
      await misuraTutte(page, sc);
    }
    /* prepartita: la stessa via del giocatore (startMatch), senza giocare nulla */
    try { await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); } catch (_e) {}
    await sleep(400);
    const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
    if (pm === true) {
      const ok = await page.waitForFunction(() => /VS|OSPITE|CASA/.test(document.body.innerText || ''), null, { timeout: 40000 }).then(() => true).catch(() => false);
      if (ok) await misuraTutte(page, SC('prepartita'));
      else saltate.push("prepartita: la schermata non si e' aperta");
    } else saltate.push('prepartita: playMatch → ' + pm);
  }
  await page.close();
}

/* ctx PARTITA (opt-in, CPM_PARTITA=1) — la strada delle sonde di gioco: nuova carriera -> provino -> partita viva,
   autoplay a seme fisso; si misura l'HUD in gioco (minuto >= 8) e, se arriva entro 150 s, l'HUD con la scelta dell'eroe. */
if (PARTITA) {
  const page = await browser.newPage({ viewport: { width: TAGLIE[0].w, height: TAGLIE[0].h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  page.on('pageerror', e => errori.push(`partita · ${String(e.message).slice(0, 120)}`));
  await installCdnRoutes(page);
  await page.addInitScript(INIT, { seme: SEME, tema: TEMA, rossi: ROSSI, fisAperte: FIS_APERTE });
  let ok = false;
  try { await openMatch(page, port, { skipLoadAll: true, name: 'Grafica Probe' }); ok = true; } catch (e) { saltate.push('partita: apertura fallita — ' + String(e.message).slice(0, 80)); }
  if (ok) {
    try { await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), SEME); } catch (_e) {}
    /* [G15 · 22/09 — IL RAMO PARTITA ASPETTAVA UN TESTIMONE MORTO, E NESSUNO SE N'ERA ACCORTO.]
       `CPM_PARTITA=1` e' opt-in: non gira nella corsa normale, quindi il suo guasto e' rimasto invisibile.
       MISURATO con una sonda di diagnosi: la partita parte e vive (le fasi girano playing -> hl_intro ->
       hl_result), ma `__CPM_MS().min` torna SEMPRE null — il minuto non sta in quell'oggetto. Il minuto ha
       il suo hook, `__CPM_CLOCK`. Con quello vecchio le tre schermate della partita non sono MAI state
       misurate: il rapporto diceva «non nel conto» e sembrava una scelta, era un guasto. */
    const minOk = await page.waitForFunction(() => { try { const c = window.__CPM_CLOCK && window.__CPM_CLOCK(); return (c | 0) >= 8; } catch (e) { return false; } }, null, { timeout: 240000 }).then(() => true).catch(() => false);
    if (minOk) { await sleep(300); await misuraTutte(page, SC('partita-gioco')); }
    else saltate.push("partita-gioco: il minuto 8 non e' arrivato entro 240 s");
    const sceltaOk = await page.waitForFunction(() => { try { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); return ph === 'hl_choose'; } catch (e) { return false; } }, null, { timeout: 150000 }).then(() => true).catch(() => false);
    if (sceltaOk) { await sleep(300); await misuraTutte(page, SC('partita-scelta')); }
    else saltate.push("partita-scelta: nessuna fase hl_choose entro 150 s");
    /* [G15] e poi si lascia finire la partita: l'autoplay risolve gli highlight, il fischio arriva al 90'
       (7.500) e li' c'e' il tabellino — la schermata che il PO ha segnalato e che nessuno misurava. */
    /* [G16 · 22/09 — A18] «non e' arrivato entro 300 s» non dice NIENTE, e il post-partita saltava in due
       corse su tre. La sonda `fischio-finale.mjs` ha misurato che una partita in autoplay, da sola,
       ci mette 163 s per novanta minuti (1,79 s al minuto, sosta piu' lunga 5 s): il tetto di 300 s e'
       largo il doppio, quindi il colpevole NON e' il tetto — e' che la partita si ferma. Qui si smette
       di aspettare al buio: si campiona minuto e fase ogni 5 s e, se il fischio non arriva, il salto
       dichiara DOVE si e' fermata e DA QUANTO l'orologio non cammina. */
    let fineOk = false, ultMin = null, ultPh = null, fermoDa = 0, prevMin = -1;
    for (let _t = 0; _t < 300; _t += 5) {
      const st = await page.evaluate(() => {
        let min = null, ph = null;
        try { min = window.__CPM_CLOCK ? (window.__CPM_CLOCK() | 0) : null; } catch (_e) {}
        try { ph = window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (_e) {}
        return { min, ph };
      }).catch(() => ({ min: null, ph: 'ERRORE' }));
      ultMin = st.min; ultPh = st.ph;
      if (st.min === prevMin) fermoDa += 5; else { fermoDa = 0; prevMin = st.min; }
      if (st.ph === 'ended' || st.ph === 'ceremony') { fineOk = true; break; }
      await sleep(5000);
    }
    if (fineOk) { await sleep(900); await misuraTutte(page, SC('post-partita')); }
    else saltate.push(`post-partita: niente fischio entro 300 s — fermo al ${ultMin}' in fase ${ultPh}, orologio fermo da ${fermoDa} s (una partita sola ci mette 163 s)`);
  }
  await page.close();
}

await browser.close(); srv.close();

/* ── LA TABELLA ────────────────────────────────────────────────────────────────────────────── */
const W = TAGLIE.map(t => t.w);
const righe = SCHERMATE.filter(s => DATI[s.id]);
const cel = (id, w, f, vuoto = '—') => { const m = DATI[id] && DATI[id][w]; return m ? f(m) : vuoto; };
const somma = (w, k) => righe.reduce((a, s) => a + ((DATI[s.id][w] || {})[k] || 0), 0);

const R = [];
R.push('# G0 — Griglia mobile: la misura di partenza');
R.push('');
R.push(`Build **${VER}** · sonda \`tests/visual/griglia-mobile.mjs\` · seme \`${SEME}\` · tema ${TEMA}${TEMA_TRADITO ? ' **(CHIESTO SCURO, RESO CHIARO: dalla 7.947 il gioco ha un tema solo)**' : ''}.`);
R.push('');
R.push('**Dichiarato:** e\' **Chromium headless** alla taglia del telefono (la 412×915 e\' quella del PO), **non un Android vero**.');
R.push('Restano fuori dalla misura: il rendering dei font di sistema Android, il tocco, la GPU, le prestazioni, la barra di sistema e il ritaglio del notch.');
R.push('Lo scatto e\' la **prima schermata** (viewport), non la pagina intera: i numeri invece coprono **tutto il DOM**, anche sotto la piega.');
R.push('');
R.push('## Come si leggono i numeri');
R.push('');
R.push('- **overflow** — `documentElement.scrollWidth − clientWidth`, in px. `0` = la pagina non scorre in orizzontale.');
R.push('- **fuori** — elementi il cui `getBoundingClientRect().right` supera la larghezza dello schermo, contati solo nella loro versione **piu\' esterna** (un figlio che sporge perche\' sporge il padre non e\' un secondo difetto) e solo se **nessun antenato li ritaglia o li fa scorrere**. Quelli contenuti sono in una colonna a parte.');
R.push('- **<10px** — nodi di testo **visibili** con `font-size` reso sotto i 10 px, sul totale dei nodi di testo visibili; fra parentesi il minimo trovato.');
R.push('- **contrasto** — nodi sotto la soglia WCAG (4,5:1; 3:1 se il corpo e\' ≥18 px o ≥14 px in grassetto) sul totale dei nodi **misurabili**. I nodi su fondo a gradiente/immagine sono **esclusi** e contati a parte: un rapporto letto su un fondo che cambia sotto la riga sarebbe inventato.');
R.push('');
R.push('## Lo strumento e\' tarato');
R.push('');
R.push('`CPM_TARATURA=1 node tests/visual/griglia-mobile.mjs` fa girare la stessa misura su due paginette costruite a mano,');
R.push('di cui si conosce la risposta esatta (un elemento che sporge di 88 px, uno che sporge ma e\' contenuto da un antenato che scorre,');
R.push('un testo a 8 px, una coppia a 4,48:1, una a 3,94:1, una su gradiente da escludere, un nodo nascosto da non contare,');
R.push('e un velo a tutto schermo che deve far ignorare la pagina sotto): **13 controlli su 13**. Senza questa prova, uno zero qui sotto');
R.push('potrebbe essere della sonda invece che del gioco.');
R.push('');
R.push('Due dettagli di metodo che cambiano i numeri, e quindi vanno detti:');
R.push('');
R.push('- **Impostazioni** e\' un velo `position:fixed; inset:0` opaco sopra la Home. La misura riparte da quel velo, altrimenti');
R.push('  conterebbe anche i nodi della Home che nessuno vede (nella prima stesura erano 60 nodi invece di 32).');
R.push('- **Creazione** contiene la lista dei 200 club dei sogni dentro un riquadro alto 220 px: quei nodi sono **resi**, quindi contati.');
R.push('  E\' la ragione per cui quella schermata ha 841 nodi di testo contro i 176 del Cruscotto — il numero e\' vero, non gonfiato da un errore.');
R.push('');

const tab = (titolo, f, tot) => {
  R.push('### ' + titolo); R.push('');
  R.push('| schermata | ' + W.map(w => w + 'px').join(' | ') + ' |');
  R.push('|---|' + W.map(() => '---:').join('|') + '|');
  righe.forEach(s => R.push(`| ${s.nome} | ` + W.map(w => cel(s.id, w, f)).join(' | ') + ' |'));
  if (tot) R.push('| **TOTALE** | ' + W.map(w => '**' + tot(w) + '**').join(' | ') + ' |');
  R.push('');
};

R.push('> **Perche\' le colonne 2-4 sono identiche fra le cinque larghezze.** Il testo non cambia numero di nodi');
R.push('> quando va a capo, e nessuna `@media` di queste schermate cambia corpo o colore sotto i 640 px: cambia solo');
R.push('> l\'impaginazione. L\'unica grandezza che *puo\'* cambiare con la larghezza e\' l\'overflow (tabella 1-2).');
R.push('> La tabella 0 serve appunto a provare che le cinque corse sono davvero cinque larghezze diverse.');
R.push('');

tab('0 · Larghezza del riquadro letta DALLA PAGINA (prova che le cinque corse sono cinque larghezze)', m => m.clientWidth);
tab('1 · Overflow orizzontale (px di pagina che escono dallo schermo)', m => m.overflowPx, w => somma(w, 'overflowPx'));
tab('2 · Elementi fuori dallo schermo a destra (fra parentesi: contenuti da un antenato che li ritaglia/fa scorrere)', m => `${m.nFuori} (${m.nContenuti})`, w => somma(w, 'nFuori'));
tab('3 · Testo reso sotto i 10 px — sotto/totale (minimo)', m => `${m.nPiccoli}/${m.nTesto} (${m.minFs})`, w => somma(w, 'nPiccoli') + '/' + somma(w, 'nTesto'));
tab('3-bis · Testo SOTTO IL PAVIMENTO DICHIARATO (11 px = FS.caption) — sotto/totale', m => `${m.nSottoPav}/${m.nTesto}`, w => somma(w, 'nSottoPav') + '/' + somma(w, 'nTesto'));
tab('4 · Contrasto sotto soglia WCAG — sotto/misurati (fra parentesi: esclusi per gradiente · per glifo emoji)', m => `${m.nSotto}/${m.nMisurati} (${m.nGradiente} · ${m.nEmoji})`, w => somma(w, 'nSotto') + '/' + somma(w, 'nMisurati'));
tab('5 · Bottoni pieni di marca (una sola azione primaria per vista)', m => `${m.nMarca}`, w => String(somma(w, 'nMarca')));

/* [G1 · il censimento del reso] Non e' un guardiano e non ha una soglia: e' il TABELLONE su cui si
   misura, schermata per schermata, se la direzione grafica e' diventata un sistema o e' rimasta
   una collezione. Un valore che scende qui e' un valore in meno che l'occhio deve incassare.
   Il conto degli esadecimali nel sorgente (tavolozza.mjs) e' cieco: un colore scritto dieci volte
   e mai reso vale zero, e un colore calcolato a runtime non compare. Questo conta cio' che si vede. */
tab('5-bis · QUANTO E\' LUNGA — altezza dello scorritore in px (fra parentesi: schermate da 915 px del PO)', m => `${m.altezzaPx} (${m.schermate})`);
R.push('> Lo scorritore misurato a 412 px, schermata per schermata: ' + righe.map(s2 => { const m = DATI[s2.id][412]; return m ? s2.nome + ' `' + (m.scorritore || '?') + '`' : null; }).filter(Boolean).join(' · '));
R.push('');

tab('6 · Censimento del reso — TINTE DI TESTO diverse', m => `${m.nColTesto}`);
tab('7 · Censimento del reso — FONDI diversi', m => `${m.nFondi}`);
tab('8 · Censimento del reso — CORPI diversi', m => `${m.nCorpi}`);
tab('9 · Censimento del reso — RAGGI diversi', m => `${m.nRaggi}`);

R.push('> **Metro di paragone.** Il provino della direzione (`docs/collaudo-grafico/proposta-schermate/`,');
R.push('> misurato da `tests/visual/provino-schermate.mjs`) rende, su tutte e tre le schermate:');
R.push('> **5 tinte di testo · 6 corpi (11 · 12,5 · 14 · 16 · 19 · 26) · 3 raggi (3 · 6 · 50%)**, identici fra loro.');
R.push('> La coerenza fra schermate chiesta dal PO li' + "'" + ' e' + "'" + ' un fatto misurato, non una dichiarazione.');
R.push('');

R.push('## Dettaglio · gli elementi che sporgono (i 5 peggiori per schermata, alla larghezza in cui sporgono di piu\')');
R.push('');
R.push('| schermata | larghezza | selettore | px fuori | testo |');
R.push('|---|---:|---|---:|---|');
let nDett = 0;
righe.forEach(s => {
  let best = null;
  W.forEach(w => { const m = DATI[s.id][w]; if (m && m.nFuori && (!best || m.nFuori > best.m.nFuori || (m.nFuori === best.m.nFuori && m.overflowPx > best.m.overflowPx))) best = { w, m }; });
  if (!best) return;
  best.m.fuori.forEach(f => { nDett++; R.push(`| ${s.nome} | ${best.w} | \`${f.sel}\` | ${f.px} | ${f.txt.replace(/\|/g, '/')} |`); });
});
if (!nDett) R.push('| — | — | nessun elemento esce dallo schermo a nessuna delle larghezze misurate | — | — |');
R.push('');

R.push('## Dettaglio · il contenuto che sporge ma e\' CONTENUTO (si legge solo scorrendo in orizzontale dentro il riquadro)');
R.push('');
R.push('Non e\' overflow di pagina — la pagina non si sposta — ma e\' contenuto che sullo schermo del telefono **non si vede tutto in una volta**.');
R.push('');
R.push('| schermata | larghezza | selettore | px oltre il bordo | testo |');
R.push('|---|---:|---|---:|---|');
let nCont = 0;
righe.forEach(s => {
  let best = null;
  W.forEach(w => { const m = DATI[s.id][w]; if (m && m.nContenuti && (!best || m.nContenuti > best.m.nContenuti)) best = { w, m }; });
  if (!best) return;
  (best.m.contenuti || []).slice(0, 3).forEach(f => { nCont++; R.push(`| ${s.nome} | ${best.w} | \`${f.sel}\` | ${f.px} | ${f.txt.replace(/\|/g, '/')} |`); });
});
if (!nCont) R.push('| — | — | niente | — | — |');
R.push('');

tab('9-quater · SUPERFICI SCURE in un gioco a tema unico CHIARO (riquadri larghi mezzo schermo, alti >= 40 px, luminanza < 0,25)', m => `${m.nScuri}`, w => somma(w, 'nScuri'));
R.push('> [22/09] Il PO ha segnalato in pochi minuti sette schermate come «disomogenee» o «fuori standard».');
R.push('> Non sono sette difetti: sono superfici rimaste SCURE quando il tema scuro e\' stato ritirato (7.947).');
R.push('> Qui si contano e si nominano, cosi\' la famiglia si chiude con una misura invece che un rilievo per volta.');
R.push('');
R.push('| schermata | alt. px | luminanza | fondo | selettore | testo |');
R.push('|---|---:|---:|---|---|---|');
let nSc = 0;
righe.forEach(s => {
  const m = (DATI[s.id][412] || DATI[s.id][W[W.length - 1]]);
  if (!m || !(m.scuri || []).length) return;
  m.scuri.forEach((x, i) => { nSc++; R.push(`| ${i === 0 ? s.nome : ''} | ${x.px} | ${x.lum} | \`${x.fondo}\` | \`${x.sel}\` | ${x.txt.replace(/\|/g, '/')} |`); });
});
if (!nSc) R.push('| — | — | — | — | nessuna | — |');
R.push('');

tab('9-ter · ALTEZZA delle strisce di fondo — voce di menu\' / sostieni / idee (px)', m => `${m.hVoce} / ${m.hSostieni} / ${m.hFeedback}`);
R.push('> La voce di menu\' e\' un bersaglio per il dito: la soglia consigliata per il tocco e\' **44 px**.');
R.push('> Le due strisce di servizio sono un invito, non un comando, e possono stare piu\' basse.');
R.push('');

tab('9-bis · EMOJI rese (il provino approvato dal PO non ne ha nessuna)', m => `${m.nEmojiChar}`, w => somma(w, 'nEmojiChar'));
R.push('> Contati i CARATTERI emoji sul testo reso. Il provino (`docs/collaudo-grafico/proposta-schermate/`)');
R.push('> non ne usa **nessuna**: i cappelli sono etichetta maiuscoletta + filo + azione, la barra in basso');
R.push('> e\' solo testo. Questo numero e\' la distanza fra il gioco e la direzione approvata.');
R.push('');
R.push('| schermata | primi testi con emoji |');
R.push('|---|---|');
righe.forEach(s => {
  const m = (DATI[s.id][412] || DATI[s.id][W[W.length - 1]]);
  if (!m || !(m.doveEmoji || []).length) return;
  R.push(`| ${s.nome} | ${m.doveEmoji.slice(0, 6).map(x => '`' + x.replace(/\|/g, '/') + '`').join(' · ')} |`);
});
R.push('');

R.push('## Ridondanze · la stessa grandezza, quante volte e dove (412 px, fisarmoniche come le trova il giocatore)');
R.push('');
R.push('> [21/09 · richiesta PO] Si contano le ETICHETTE, non i numeri: un «14» si ripete per caso, un');
R.push('> «Assist» no. Due letture con rimedi opposti: **nella colonna** una grandezza ripetuta dentro la');
R.push('> stessa schermata (da togliere); **nella riga** la stessa grandezza in molte schermate — che non e\'');
R.push('> per forza un difetto (lo stipendio sta bene in Contratto e dall\'Agente), ma sopra le quattro');
R.push('> schermate o e\' un cruscotto voluto o e\' rumore. Nessuna soglia: e\' un censimento.');
R.push('>');
R.push('> **LIMITE DICHIARATO, e cambia la lettura**: le otto schermate di carriera condividono la TESTATA');
R.push('> dell\'eroe (OVR, forma, morale, fatica). Una grandezza che risulta su **8 schermate** e\' quasi');
R.push('> sempre quella — cioe\' un cruscotto VOLUTO, non una ridondanza. Finche\' lo strumento non separa');
R.push('> testata e corpo, la riga da 8 non accusa nessuno: si legge la COLONNA.');
R.push('');
{
  const eti = new Set();
  righe.forEach(s => { const m = DATI[s.id][412]; if (m) Object.keys(m.etichette || {}).forEach(k => eti.add(k)); });
  const cols = righe.filter(s => DATI[s.id][412]);
  R.push('| etichetta | ' + cols.map(s => s.nome.replace('Stagione · ', '').replace('Carriera · ', '')).join(' | ') + ' | schermate |');
  R.push('|---|' + cols.map(() => '---:').join('|') + '|---:|');
  const ord = [...eti].map(e => {
    const v = cols.map(s => (DATI[s.id][412].etichette || {})[e] || 0);
    return { e, v, sch: v.filter(x => x > 0).length, tot: v.reduce((a, b) => a + b, 0) };
  }).sort((a, b) => b.sch - a.sch || b.tot - a.tot);
  ord.forEach(r => R.push(`| ${r.e} | ${r.v.map(x => x || '').join(' | ')} | **${r.sch}** |`));
}
R.push('');

R.push('## Dettaglio · DOVE STANNO I PIXEL nelle schermate lunghe (a 412 px)');
R.push('');
R.push('> [21/09 · rilievo PO «il tab carriera e\' lunghissimo»] Sapere che una schermata e\' lunga non dice');
R.push('> quale pezzo la allunga. Qui i blocchi di primo livello dello scorritore, dal piu\' alto, con la');
R.push('> quota sul totale e il testo che portano. Solo sopra le due schermate: sotto non c\'e\' niente da accorciare.');
R.push('');
R.push('| schermata | blocco | px | quota | testo |');
R.push('|---|---:|---:|---:|---|');
let nBlk = 0;
righe.forEach(s => {
  const m = (DATI[s.id][412] || DATI[s.id][W[W.length - 1]]);
  if (!m || !(m.blocchi || []).length) return;
  m.blocchi.forEach((b, i) => { nBlk++; R.push(`| ${i === 0 ? s.nome + ' (' + m.altezzaPx + ' px)' : ''} | ${i + 1} | ${b.px} | ${b.quota} % | ${b.txt.replace(/\|/g, '/')} |`); });
});
if (!nBlk) R.push('| — | — | — | — | nessuna schermata sopra le due schermate |');
R.push('');

R.push('## 9-quinquies · I CARATTERI RESI (a 412 px, la taglia del PO)');
R.push('');
R.push('> [G9 · 22/09, collaudo PO «la schermata iniziale e\' rimasta completamente fuori standard»] Il provino');
R.push('> approvato ha UN carattere vero, **Barlow** (+ **Barlow Condensed** per i numerali incolonnati). Una');
R.push('> schermata che ne rende altri e\' fuori standard per costruzione — e finora nessun numero lo diceva:');
R.push('> si guardava il contrasto, il corpo, il raggio, mai la FAMIGLIA. Qui c\'e\' la prima famiglia della');
R.push('> `font-family` calcolata, cioe\' quella che il browser usa davvero, con quanti nodi la portano.');
R.push('');
R.push('| schermata | famiglie | dettaglio (famiglia x nodi) |');
R.push('|---|---:|---|');
righe.forEach(s2 => {
  const m = (DATI[s2.id][412] || DATI[s2.id][W[W.length - 1]]);
  if (!m) return;
  const fam = m.famiglie || [];
  const fuori = fam.filter(x => !/^Barlow/i.test(x.f));
  R.push(`| ${s2.nome} | ${fuori.length ? '**' + (m.nFamiglie || 0) + '**' : (m.nFamiglie || 0)} | ${fam.map(x => x.f + ' x' + x.n).join(' · ') || '—'} |`);
});
R.push('');

R.push('## 9-octies · I CORPI, UNO PER UNO, COL NODO CHE LI PORTA (a 412 px)');
R.push('');
R.push('> [G13 · 22/09] Stessa lezione delle tinte e del pavimento (G8.8): un elenco di numeri non fa');
R.push('> trovare il nodo. Qui ogni corpo reso, con quanti nodi lo portano e un esempio — cosi\' un corpo');
R.push('> fuori scala si va a prendere invece di cercarlo a mano nel sorgente.');
R.push('');
R.push('| schermata | corpi | dettaglio (px x nodi · esempio) |');
R.push('|---|---:|---|');
righe.forEach(s2 => {
  const m = (DATI[s2.id][412] || DATI[s2.id][W[W.length - 1]]);
  if (!m) return;
  const t = (m.corpiDet || []).map(x => `**${x.fs}** x${x.n} (${String(x.esempio || '').replace(/\|/g, '/').slice(0, 12)})`).join(' · ');
  R.push(`| ${s2.nome} | ${m.nCorpi || 0} | ${t || '—'} |`);
});
R.push('');

R.push('## 9-septies · LE TINTE DEL TESTO, UNA PER UNA (a 412 px, la taglia del PO)');
R.push('');
R.push('> [G14 · 22/09] Il conteggio dice che la Dashboard rende quattordici tinte contro le cinque del');
R.push('> provino, ma non dice QUALI — e la differenza e\' tutta li\': una tinta **semantica** (vittoria,');
R.push('> sconfitta, allarme) e\' un\'informazione e deve restare; un grigio nato per sbaglio e\' debito.');
R.push('> Qui ogni tinta col numero di nodi e un esempio, in ordine di diffusione.');
R.push('');
R.push('| schermata | tinte | dettaglio (tinta x nodi · esempio) |');
R.push('|---|---:|---|');
righe.forEach(s2 => {
  const m = (DATI[s2.id][412] || DATI[s2.id][W[W.length - 1]]);
  if (!m) return;
  const t = (m.tinteTesto || []).map(x => `\`${x.c}\` x${x.n} (${String(x.esempio || '').replace(/\|/g, '/').slice(0, 14)})`).join(' · ');
  R.push(`| ${s2.nome} | ${m.nColTesto || 0} | ${t || '—'} |`);
});
R.push('');

R.push('## 9-sexies · LO SPAZIO DELLE FIGURINE (a 412 px, la taglia del PO)');
R.push('');
R.push('> [G12 · 22/09, direttiva PO «predisponi lo spazio dei volti rettangolari in verticale, stile');
R.push('> panini»] Il riquadro del volto ha un contratto: **rapporto 5:7 verticale**. Qui, schermata per');
R.push('> schermata, quante figurine ci sono e qual e\' lo **scarto peggiore** dal rapporto dichiarato.');
R.push('> Finche\' l\'arte non arriva il riquadro mostra il ripiego, ma lo SPAZIO e\' gia\' quello giusto.');
R.push('');
R.push('| schermata | figurine | scarto dal 5:7 | tipi |');
R.push('|---|---:|---:|---|');
righe.forEach(s2 => {
  const m = (DATI[s2.id][412] || DATI[s2.id][W[W.length - 1]]);
  if (!m) return;
  R.push(`| ${s2.nome} | ${m.nFigurine || 0} | ${(m.nFigurine ? (m.figScarto || 0) + ' %' : '—')} | ${(m.figTipi || []).map(x => x.t + ' x' + x.n).join(' · ') || '—'} |`);
});
R.push('');

R.push('## Dettaglio · i nodi SOTTO IL PAVIMENTO di 11 px (a 412 px, la taglia del PO)');
R.push('');
R.push('> [G8.8] Stessa lezione della colonna selettore del contrasto: un conteggio non basta a trovare i nodi.');
R.push('> Qui ogni nodo reso sotto gli 11 px porta corpo, peso, selettore e il testo che mostra.');
R.push('');
R.push('| schermata | px / peso | occorrenze | selettore | esempio |');
R.push('|---|---|---:|---|---|');
let nPav = 0;
righe.forEach(s => {
  const m = (DATI[s.id][412] || DATI[s.id][W[W.length - 1]]);
  if (!m || !(m.sottoPav || []).length) return;
  m.sottoPav.forEach(p => { nPav++; R.push(`| ${s.nome} | ${p.fs} / ${p.fw} | ${p.n} | \`${p.sel}\` | ${p.esempio.replace(/\|/g, '/')} |`); });
});
if (!nPav) R.push('| — | — | 0 | nessuno | — |');
R.push('');

R.push('## Dettaglio · le 5 coppie testo/fondo peggiori per schermata (a 412 px, la taglia del PO)');
R.push('');
R.push('> [G8.7] La colonna **selettore** c\'era gia\' nel dato e non veniva stampata. Senza, un nodo che riceve');
R.push('> il colore come DATO da un componente condiviso non si trova cercando nel sorgente — e infatti un passo');
R.push('> si e\' chiuso con «non li ho trovati». Un metro che sa dove sta il difetto deve dirlo.');
R.push('');
R.push('| schermata | rapporto | soglia | testo su fondo | px / peso | occorrenze | selettore | esempio |');
R.push('|---|---:|---:|---|---|---:|---|---|');
righe.forEach(s => {
  const m = (DATI[s.id][412] || DATI[s.id][W[W.length - 1]]);
  if (!m || !m.peggiori.length) return;
  m.peggiori.forEach(p => R.push(`| ${s.nome} | ${p.rap.toFixed(2)}:1 | ${p.soglia}:1 | \`${p.testo}\` su \`${p.fondo}\` | ${p.fs} / ${p.fw} | ${p.n} | \`${p.sel}\` | ${p.esempio.replace(/\|/g, '/')} |`));
});
R.push('');

if (saltate.length) { R.push('## Cosa NON e\' stato misurato'); R.push(''); saltate.forEach(x => R.push('- ' + x)); R.push(''); }
if (errori.length) { R.push('## Errori di pagina raccolti durante la corsa'); R.push(''); [...new Set(errori)].slice(0, 20).forEach(x => R.push('- `' + x + '`')); R.push(''); }

R.push('## Fuori portata di questa sonda (dichiarato, non misurato)');
R.push('');
R.push('- Il **telefono vero** del PO: font di sistema, sub-pixel, tocco, GPU, fps, barra di sistema, notch.');
if (TEMA !== 'scuro') R.push('- Il **tema scuro**: questa corsa misura il tema chiaro (`cpm-dark=0`); si misura a parte con `CPM_TEMA=scuro`.');
R.push('- Tutto cio\' che si vede **giocando**: HUD di partita, telecronaca, highlight, scena 3D, fine partita, cerimonie.');
R.push('- Gli **stati** (premuto, attivo, disabilitato, focus) e le transizioni: le animazioni sono portate al termine prima di misurare.');
R.push('- I **fondi a gradiente/immagine**: il contrasto su quei nodi e\' escluso, non stimato.');
R.push('- L\'**altezza**: niente e\' misurato sull\'overflow verticale o sulla lunghezza della pagina.');
R.push('');

fs.writeFileSync(path.join(OUT, 'REPORT.md'), R.join('\n') + '\n');
fs.writeFileSync(path.join(OUT, 'dati.json'), JSON.stringify({ versione: VER, seme: SEME, tema: TEMA, taglie: W, schermate: righe.map(s => s.id), dati: DATI, saltate, errori: [...new Set(errori)] }, null, 1) + '\n');

console.log('');
console.log(R.slice(R.indexOf('### 0 · Larghezza del riquadro letta DALLA PAGINA (prova che le cinque corse sono cinque larghezze)') - 0).join('\n').split('## Dettaglio')[0]);
console.log(`→ ${path.relative(ROOT, path.join(OUT, 'REPORT.md'))} · ${path.relative(ROOT, path.join(OUT, 'dati.json'))}${FOTO ? ` · ${righe.length * W.length} scatti` : ' (senza scatti)'}`);
if (saltate.length) console.log('NON misurato: ' + saltate.join(' | '));
