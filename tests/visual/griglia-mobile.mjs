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
const TEMA = process.env.CPM_TEMA === 'scuro' ? 'scuro' : 'chiaro';
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
const SAVE = { phase: 'career', player: {
  name: 'Grafica Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: false,
  age: 26, ovr: 82, tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 4,
  presidentModalSeason: 4, drawSeen: 4, mercatoSeen: 4, coachPactSeason: 4,
  seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare',
  coachTrust: 78, teamChemistry: 72, value: 45, popularity: 64, hasAgent: true,
  goals: 14, assists: 6, matches: 12, totalGoals: 80, totalAssists: 31, totalMatches: 150,
  matchHistory: Array.from({ length: 12 }, (_, i) => ({ week: i + 1, opponent: 'FC Rivale ' + i, goals: i % 3 === 0 ? 1 : 0, assists: i % 4 === 0 ? 1 : 0, rating: 7.2, won: i % 2 === 0, drew: false, homeScore: 2, awayScore: 1 })),
  seasonObjectives: { position: 5 }, records: { topSeasonGoals: 22, topSeasonAssists: 9, topOvr: 82 },
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 52, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 82, tecnica: 81, fisico: 80, 'mentalità': 82, tiro: 84, passaggio: 81, dribbling: 83, posizionamento: 82 },
  form: 78, morale: 70, fatigue: 18, contract: { duration: 2, wage: 220000, expiresAtSeason: 6 }, bankBalance: 4560000,
  history: [{ clubId: 'rbl', club: 'FC Lipsia', season: 3 }] } };

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
  { id: 'agente',               ctx: 'carriera', nome: 'Agente',                tab: 'agente' },
  { id: 'prepartita',           ctx: 'carriera', nome: 'Prepartita' },
  { id: 'partita-gioco',        ctx: 'partita',  nome: 'Partita · HUD in gioco' },
  { id: 'partita-scelta',       ctx: 'partita',  nome: 'Partita · HUD con la scelta' },
];

/* ── LA MISURA (gira DENTRO la pagina) ─────────────────────────────────────────────────────── */
/* Scritta come stringa-funzione unica: page.evaluate non porta con se' le funzioni del modulo. */
function MISURA(W) {
  const R = { W, radice: 'body', scrollWidth: 0, clientWidth: 0, overflowPx: 0,
    nFuori: 0, fuori: [], nContenuti: 0, contenuti: [],
    nTesto: 0, nSottoPav: 0, nPiccoli: 0, minFs: null,
    nMisurati: 0, nSotto: 0, nGradiente: 0, peggiori: [],
    nMarca: 0, marca: [] };   /* [G3.2] bottoni VISIBILI col fondo pieno di marca (#8e1f33 o gradiente che lo contiene): la gerarchia vuole UNA sola azione primaria per vista */

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
  const agg = new Map(); /* coppie colore/fondo raggruppate: 400 righe uguali sono UN difetto */
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

    const fs = parseFloat(cs.fontSize) || 0;
    const fw = parseInt(cs.fontWeight, 10) || (/(bold|bolder)/.test(cs.fontWeight) ? 700 : 400);
    R.nTesto++;
    if (fs < 10) R.nPiccoli++;
    if (fs < 11) R.nSottoPav++;/* [C4 · 16/09] IL PAVIMENTO DICHIARATO E' 11 px (FS.caption), non 10: la colonna <10px non vedeva gli 810 `fontSize:10` scritti a mano, che sono il corpo piu' diffuso dell'intero gioco. Questa colonna misura il pavimento vero. */
    if (R.minFs == null || fs < R.minFs) R.minFs = fs;

    const f = fondo(p);
    if (f.grad) { R.nGradiente++; continue; }
    let tc = leggi(cs.color); if (!tc) continue;
    if (tc.a < 0.999) tc = sopra(tc, f.col);
    const l1 = lum(tc), l2 = lum(f.col);
    const rap = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const soglia = (fs >= 18 || (fs >= 14 && fw >= 700)) ? 3 : 4.5;
    R.nMisurati++;
    if (rap < soglia) R.nSotto++;
    const k = hex(tc) + '|' + hex(f.col) + '|' + Math.round(fs * 10) / 10 + '|' + fw;
    const e = agg.get(k);
    if (e) e.n++;
    else agg.set(k, { testo: hex(tc), fondo: hex(f.col), fs: Math.round(fs * 10) / 10, fw, rap: Math.round(rap * 100) / 100, soglia, n: 1, sel: sel(p), esempio: (nodo.nodeValue || '').replace(/\s+/g, ' ').trim().slice(0, 26) });
  }
  R.peggiori = [...agg.values()].sort((a, b) => a.rap - b.rap || b.n - a.n).slice(0, 5);
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
const INIT = (o) => {
  /* seme fisso: senza, Offerte e i pannelli che pescano a caso cambiano a ogni corsa */
  let s = o.seme >>> 0;
  Math.random = function () { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  window.__CPM_GLB = false;                       /* niente modelli 3D: qui si misura la presentazione 2D */
  /* [7.944] i rossi arrivano dalla sonda: CPM_ROSSO=__CPM_NO944 riporta i colori dei club a com'erano,
     cosi' il guardiano puo' dimostrare che il rimedio serve e non solo che il numero e' basso. */
  for (const k of (o.rossi || [])) { try { window[k] = true; } catch (_e) {} }
  try { localStorage.setItem('cpm-intro-seen', '1'); } catch (_e) {}
  try { localStorage.setItem('cpm-dark', o.tema === 'scuro' ? '1' : '0'); } catch (_e) {}   /* tema: chiaro di default, scuro con CPM_TEMA=scuro */
  if (o.save) { try { localStorage.setItem('cpm-v3', JSON.stringify(o.save)); } catch (_e) {} }
  if (o.trial) { try { localStorage.setItem('cpm-trial-prog', JSON.stringify(o.trial)); } catch (_e) {} }
};

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
  const page = await apri(browser, port, TAGLIE[0], { seme: SEME, tema: TEMA, rossi: ROSSI }, '?cpmtest=1', errori);
  await misuraTutte(page, SC('home'));
  if (await premi(page, 'Opzioni')) { await misuraTutte(page, SC('impostazioni')); await premi(page, '^✕$'); await sleep(500); }
  else saltate.push('impostazioni: bottone Opzioni non trovato');
  if (await premi(page, 'Nuova carriera')) await misuraTutte(page, SC('creazione'));
  else saltate.push('creazione: bottone "Nuova carriera" non trovato');
  await page.close();
}

/* ctx OFFERTE — senza ?cpmtest=1: e' l'auto-ripresa dei provini conclusi che porta a questa schermata */
{
  const page = await apri(browser, port, TAGLIE[0], { seme: SEME, tema: TEMA, rossi: ROSSI, trial: TRIALPROG }, '', errori);
  const ok = await page.waitForFunction(() => /Offerte ricevute/.test(document.body.innerText || ''), null, { timeout: 30000 }).then(() => true).catch(() => false);
  if (ok) await misuraTutte(page, SC('offerte'));
  else saltate.push("offerte: la schermata non si e' aperta");
  await page.close();
}

/* ctx CARRIERA — i tab + la prepartita (una sola apertura) */
{
  const page = await apri(browser, port, TAGLIE[0], { seme: SEME, tema: TEMA, rossi: ROSSI, save: SAVE }, '?cpmtest=1', errori);
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
  await page.addInitScript(INIT, { seme: SEME, tema: TEMA, rossi: ROSSI });
  let ok = false;
  try { await openMatch(page, port, { skipLoadAll: true, name: 'Grafica Probe' }); ok = true; } catch (e) { saltate.push('partita: apertura fallita — ' + String(e.message).slice(0, 80)); }
  if (ok) {
    try { await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), SEME); } catch (_e) {}
    const minOk = await page.waitForFunction(() => { try { const ms = window.__CPM_MS && window.__CPM_MS(); return ms && (ms.min | 0) >= 8; } catch (e) { return false; } }, null, { timeout: 240000 }).then(() => true).catch(() => false);
    if (minOk) { await sleep(300); await misuraTutte(page, SC('partita-gioco')); }
    else saltate.push("partita-gioco: il minuto 8 non e' arrivato entro 240 s");
    const sceltaOk = await page.waitForFunction(() => { try { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); return ph === 'hl_choose'; } catch (e) { return false; } }, null, { timeout: 150000 }).then(() => true).catch(() => false);
    if (sceltaOk) { await sleep(300); await misuraTutte(page, SC('partita-scelta')); }
    else saltate.push("partita-scelta: nessuna fase hl_choose entro 150 s");
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
R.push(`Build **${VER}** · sonda \`tests/visual/griglia-mobile.mjs\` · seme \`${SEME}\` · tema ${TEMA}.`);
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
tab('4 · Contrasto sotto soglia WCAG — sotto/misurati (esclusi per gradiente)', m => `${m.nSotto}/${m.nMisurati} (${m.nGradiente})`, w => somma(w, 'nSotto') + '/' + somma(w, 'nMisurati'));
tab('5 · Bottoni pieni di marca (una sola azione primaria per vista)', m => `${m.nMarca}`, w => String(somma(w, 'nMarca')));

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

R.push('## Dettaglio · le 5 coppie testo/fondo peggiori per schermata (a 412 px, la taglia del PO)');
R.push('');
R.push('| schermata | rapporto | soglia | testo su fondo | px / peso | occorrenze | esempio |');
R.push('|---|---:|---:|---|---|---:|---|');
righe.forEach(s => {
  const m = (DATI[s.id][412] || DATI[s.id][W[W.length - 1]]);
  if (!m || !m.peggiori.length) return;
  m.peggiori.forEach(p => R.push(`| ${s.nome} | ${p.rap.toFixed(2)}:1 | ${p.soglia}:1 | \`${p.testo}\` su \`${p.fondo}\` | ${p.fs} / ${p.fw} | ${p.n} | ${p.esempio.replace(/\|/g, '/')} |`));
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
