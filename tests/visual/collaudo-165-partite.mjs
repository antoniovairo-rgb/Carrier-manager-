#!/usr/bin/env node
/* [collaudo release 7.999.165] Copiata dalla sonda della collaudatrice 164 (ramo collaudo/release-164, collaudo-164-partite.mjs) con
   aggiunte 165: ripartenza dopo il gol (PO-207, pallone 3D e motore campionati in pagina ogni 100 ms per 10 s), bambini per squadra
   nell'ingresso (PO-236), calendario a ogni settimana (PO-233: righe Nazionale/coppa, codici >=990 in tutto il testo), rifiuto delle
   offerte di trasferimento (CPM_RIFIUTA=1, per restare nel club e giocare la coppa), longtask con la fase in cui cadono (PO-237),
   durata dei messaggi d'attesa (PO-241).
   ORIGINALE 164: PARTITE VERE IN CARRIERA, GIOCATE COME UN GIOCATORE.
   Una sola pagina, carriera continua dal salvataggio S12 (fixtures/save-190-s12-ovr93.json, settimana 38), GLB ACCESO, schermo 412x915.
   Il giocatore clicca i pulsanti VISIBILI (Continua / Vivi la Settimana / Gioca / Vedi le formazioni / Ingresso in campo ...), chiude le
   finestre in primo piano con un loro pulsante (mai dismiss), entra in campo coi bambini; in campo le scelte dell'eroe le fa il pilota
   seedato del gioco (__CPM_AUTOPLAY, politica «seeded»), che e' l'unica parte non cliccata a mano.
   Leve di collaudo DICHIARATE (non sono il flusso di un giocatore, servono a portare la carriera dove serve):
     · PANCHINA: prima della partita CPM_BENCH_AT si abbassa la fiducia del mister (patch coachTrust/form/fatigue) perche' il mister
       lo lasci fuori: la decisione la prende il gioco (calcCoachDecision), non la sonda.
     · NAZIONALE: prima della partita CPM_NAT_AT si apre una Coppa delle Nazioni (patch nationsCupQueue con la stessa forma di
       natTournamentPatch); il «Continua» del gioco la instrada da solo (startNationsCupMatch).
   Misure per partita (testimoni del gioco, solo ?cpmtest=1):
     · ingresso: fasi viste, bambini (__CPM_MASCOT911: corpi/attivi/distanza dal calciatore), foto;
     · ogni scena dell'eroe: all'apertura prontezza corpi (__CPM_CORPI232, __CPM_GLB232W: CGTrader, T-pose, teste), chi ha il pallone
       (__CPM_STATE().ball.heldBy), foto; all'esito riquadro (fam/testo) contro fatti del motore (__CPM_RES218) contro pallone 3D a
       fine scena (__CPM_BALL) e gesto del portiere (__CPM_GK229/ARM);
     · interazioni in partita (__CPM_INT226) e finestre (scanOverlays: cornice, uscita dallo schermo, testo tagliato);
     · fine: tabellone (__CPM_SCORE) contro tabellino del motore (__CPM_MOTORE_OBJ().tabellino()) contro schermata, nota auto216;
     · dopo il fischio: finestre in ordine, intervista [data-cpm=intervista231] e sua testata, foto;
     · fluidita': longtask (PerformanceObserver) e intervalli fra fotogrammi (rAF), messaggi «Caricamento...» e loro durata.
   Carriera, a ogni settimana nuova: calendario (giornate assurde), classifica (gol fatti = gol subiti, partite giocate), foto home.
   Uscita: docs/collaudi/release-164/dati/partite.jsonl (una riga per partita), settimane.jsonl, finestre.jsonl, foto in docs/collaudi/release-164/.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node collaudo-164-partite.mjs
        CPM_NPARTITE (8) · CPM_BENCH_AT (3) · CPM_NAT_AT (5) · CPM_MAXMIN (110, minuti reali) · CPM_SPEED (2) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { scanOverlays, closeTop, clickAdvance, clickGiocatore, avanzaTop } from './lib/collaudo165.mjs';

const W = 412, H = 915;
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(REPO, 'docs', 'collaudi', 'release-165'); const DATI = path.join(OUT, 'dati', process.env.CPM_TAG || 'a');
fs.mkdirSync(DATI, { recursive: true });
const NP = +(process.env.CPM_NPARTITE || 8), BENCH_AT = +(process.env.CPM_BENCH_AT || 3), NAT_AT = +(process.env.CPM_NAT_AT || 5);
const MAXMS = +(process.env.CPM_MAXMIN || 110) * 60000, SPEED = process.env.CPM_SPEED || '2';
const TAG = process.env.CPM_TAG || 'a';
const jl = (f, o) => fs.appendFileSync(path.join(DATI, f), JSON.stringify(o) + '\n');
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
/* CPM_SAVE: riparte da un salvataggio scritto a fine giro (dati/<tag>/salvataggio-fine-<tag>.json), altrimenti S12 settimana 38 */
const save = JSON.parse(fs.readFileSync(process.env.CPM_SAVE || new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));

const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const page = await ctx.newPage(); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push({ t: Date.now(), m: String(e.message).slice(0, 200) }));
await page.addInitScript(([s, sp]) => {
  window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REC = true; window.__CPM_WALKTEST74 = 1; window.__CPM_GLB232W = []; window.__CPM_REC229 = 1;
  /* [giro B] interruttori del TELEFONO: sotto ?cpmtest=1 la scena si chiude prima che l'arco finisca (nota 7.460/7.461) */
  if (window.__C164_TEL !== false) { window.__CPM_CINE = 1; window.__CPM_REALWAIT = 1; }
  /* [giro B] pallone registrato DENTRO la pagina ogni 80 ms durante le scene dell'eroe (la sonda legge ogni 1-2 s, troppo rado) */
  window.__G164 = []; setInterval(() => { try { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); if (!/^hl_/.test(ph || '')) return; const bl = window.__CPM_BALL && window.__CPM_BALL(); if (bl && window.__G164.length < 60000) window.__G164.push([Date.now(), ph, bl.x, bl.y]); } catch (e) {} }, 80);
  try { localStorage.setItem('cpm-v3', JSON.stringify(s)); localStorage.setItem('cpm-match-speed', sp); } catch (e) {}
  /* [165 PO-207] ripartenza: a ogni aumento del punteggio, 10 s di pallone 3D (__CPM_BALL), pallone logico (__CPM_STATE) e motore ogni 100 ms */
  window.__G165K = []; let _sc0 = null, _rec = null;
  setInterval(() => { try { const sc = window.__CPM_SCORE && window.__CPM_SCORE(); if (!sc) return; const tot = (sc.home | 0) + (sc.away | 0);
    const ph = window.__CPM_PHASE && window.__CPM_PHASE();
    if (_sc0 != null && tot > _sc0 && window.__G165K.length < 40) { _rec = { t0: Date.now(), min: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null, ph0: ph, score: [sc.home | 0, sc.away | 0], s: [] }; window.__G165K.push(_rec); }
    _sc0 = tot;
    if (_rec && Date.now() - _rec.t0 < 10000) { let b3 = null, bl = null, mo = null; try { const b = window.__CPM_BALL(); b3 = [+b.x.toFixed(1), +b.y.toFixed(1)]; } catch (e) {}
      try { const x = window.__CPM_STATE(); bl = x.ball ? [Math.round(x.ball.x), Math.round(x.ball.y)] : null; } catch (e) {}
      try { const st = window.__CPM_MOTORE_OBJ().stato(); mo = [st.poss && st.poss.stato, st.palla ? Math.round(st.palla.x) : null, st.palla ? Math.round(st.palla.y) : null]; } catch (e) {}
      _rec.s.push([Date.now() - _rec.t0, ph, b3, bl, mo]); } else _rec = null; } catch (e) {} }, 100);
  /* fluidita': longtask e intervalli fra fotogrammi, svuotati dalla sonda */
  window.__C164 = { lt: [], d: [] };
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__C164.lt.push([Math.round(e.startTime), Math.round(e.duration), (window.__CPM_PHASE && window.__CPM_PHASE()) || null]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  let last = 0; const f = t => { if (last) { const d = t - last; if (window.__C164.d.length < 20000) window.__C164.d.push(Math.round(d)); } last = t; requestAnimationFrame(f); }; requestAnimationFrame(f);
}, [save, SPEED]);
const URL0 = `http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`;
await page.goto(URL0, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
await sleep(1500);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
await sleep(1500);

const foto = async (nome) => { const f = `${TAG}-${nome}.jpg`; try { await page.screenshot({ path: path.join(OUT, f), type: 'jpeg', quality: 72 }); return f; } catch (e) { return null; } };
const ev = (fn, arg) => page.evaluate(fn, arg).catch(e => ({ __err: String(e.message).slice(0, 120) }));

const carriera = () => ev(() => { try { const c = window.__CPM_CAREER; const s = c.snapshot(); return { scr: c.screen(), season: s.season, week: s.week, lived: !!s.weekLived, matches: s.matches | 0, club: s.club && s.club.n, md: c.thisWeekMd(), nc: s.nationsCupQueue ? { a: !!s.nationsCupQueue.active, d: !!s.nationsCupQueue.done, i: s.nationsCupQueue.matchIdx | 0 } : null }; } catch (e) { return { err: e.message }; } });
/* in partita = schermata «match» della carriera: __CPM_PHASE resta definita (e ferma su «ended») anche dopo lo smontaggio */
const fase = () => ev(() => { try { if (!window.__CPM_CAREER || window.__CPM_CAREER.screen() !== 'match') return null; } catch (e) { return null; } return window.__CPM_PHASE ? window.__CPM_PHASE() : null; });

/* controllo di carriera a ogni settimana nuova: calendario e classifica dal salvataggio vivo */
async function controllaSettimana(tagSett) {
  const r = await ev(() => { const s = window.__CPM_CAREER.snapshot(); const st = s.standings || []; const cal = s.calendar || [];
    const gf = st.reduce((a, x) => a + (x.gf | 0), 0), ga = st.reduce((a, x) => a + (x.ga | 0), 0);
    const pl = st.map(x => x.played != null ? x.played : (x.w | 0) + (x.d | 0) + (x.l | 0));
    const wdl = st.filter(x => x.played != null && x.played !== (x.w | 0) + (x.d | 0) + (x.l | 0)).map(x => x.n || x.name);
    const ptsBad = st.filter(x => x.pts != null && x.w != null && x.pts !== 3 * (x.w | 0) + (x.d | 0)).map(x => (x.n || x.name) + ' ' + x.pts + '≠3·' + x.w + '+' + x.d);
    const lega = cal.filter(c => !c.type); const mdLega = lega.map(c => c.matchday);
    const dup = mdLega.filter((m, i) => mdLega.indexOf(m) !== i);
    const settDoppie = (() => { const w = {}; cal.forEach(c => { w[c.week] = (w[c.week] || 0) + 1; }); return Object.entries(w).filter(([, n]) => n > 1).map(([k, n]) => k + '×' + n); })();
    return { season: s.season, week: s.week, squadre: st.length, gf, ga, golPari: gf === ga, giocate: { min: Math.min(...pl), max: Math.max(...pl), somma: pl.reduce((a, x) => a + x, 0) }, wdl, ptsBad,
      giornateLega: { n: lega.length, min: Math.min(...mdLega), max: Math.max(...mdLega), doppie: dup }, settimaneConPiuGare: settDoppie,
      prossime: cal.filter(c => !c.played).slice(0, 4).map(c => [c.week, c.type || 'lega', c.matchday, c.opponentName]) }; });
  /* testo «Giornata N» a schermo sulla home: un numero oltre le giornate di lega e' assurdo */
  r.testiGiornata = await ev(() => { const t = document.body.innerText || ''; return [...new Set((t.match(/(Giornata|G\.|GIORNATA)\s*\d+(\s*\/\s*\d+)?/g) || []))].slice(0, 8); });
  r.foto = await foto('settimana-' + tagSett);
  /* [165 PO-233] Calendario come lo apre un giocatore: barra in basso «Stagione» → pillola «Calendario» (ripiego dichiarato: goTab) */
  try {
    const homeTxt = await ev(() => document.body.innerText || '');
    r.homeCodici = (String(homeTxt).match(/\b\d{3,4}\s*ª\s*giornata|G\.\s*\d{3,4}\b|Giornata\s+\d{3,4}\b/gi) || []);
    let via = await clickGiocatore(page, [/^Stagione$/]); await sleep(900);
    let v2 = await clickGiocatore(page, [/^Calendario$/]); await sleep(1100);
    let ok = await ev(() => /Prossime partite/i.test(document.body.innerText || ''));
    if (!ok) { await ev(() => window.__CPM_CAREER.goTab('calendar')); await sleep(1200); via = 'goTab'; ok = await ev(() => /Prossime partite/i.test(document.body.innerText || '')); }
    const cal = await ev(() => { const t = document.body.innerText || ''; const i = t.search(/Prossime partite/i); const blocco = i >= 0 ? t.slice(i, i + 1800) : '';
      const righe = blocco.split('\n').map(x => x.trim()).filter(Boolean);
      const speciali = righe.map((x, k) => /Nazionale|Coppa|Amichevole|Internazional|Fase|Champions|Europa/i.test(x) ? righe.slice(Math.max(0, k - 1), k + 2).join(' | ') : null).filter(Boolean);
      return { codici: (t.match(/\b\d{3,4}\s*ª\s*giornata|G\.\s*\d{3,4}\b|Giornata\s+\d{3,4}\b/gi) || []), giornate: [...new Set(t.match(/\d+\s*ª\s*giornata/g) || [])].slice(0, 12), speciali: speciali.slice(0, 8), testa: righe.slice(0, 26).join(' | ') }; });
    r.calendario = { via: via + '/' + v2, ok, ...cal };
    const datiCal = await ev(() => { const s = window.__CPM_CAREER.snapshot(); return (s.calendar || []).filter(c => !c.played && c.type).map(c => [c.week, c.type, c.matchday, c.opponentName, c.competition || c.cupRoundName || null]); });
    r.calendario.vociSpecialiNonGiocate = datiCal;
    if (cal.speciali.length || cal.codici.length) r.calendario.foto = await foto('calendario-' + tagSett);
    await clickGiocatore(page, [/^Home$/]); await sleep(700);
    if (await ev(() => window.__CPM_CAREER.screen()) !== 'dashboard') { await ev(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(700); }
  } catch (e) { r.calendario = { err: String(e.message).slice(0, 120) }; }
  jl('settimane.jsonl', r); log('calendario', tagSett, JSON.stringify(r.calendario && { via: r.calendario.via, ok: r.calendario.ok, codici: r.calendario.codici, speciali: r.calendario.speciali, voci: r.calendario.vociSpecialiNonGiocate, home: r.homeCodici }));
  log('settimana', tagSett, 'gf', r.gf, 'ga', r.ga, 'giocate', JSON.stringify(r.giocate), 'giornate', JSON.stringify(r.giornateLega), 'testi', JSON.stringify(r.testiGiornata));
  return r;
}

/* finestre: una foto per tipo (dc+titolo) la prima volta che compaiono */
const visteFinestre = new Set();
async function registraFinestre(ov, dove) {
  for (const o of ov) { const k = o.dc + '|' + o.titolo.slice(0, 30);
    if (visteFinestre.has(k)) continue; visteFinestre.add(k);
    const f = await foto('finestra-' + visteFinestre.size + '-' + o.dc.replace(/[^a-z0-9]/gi, ''));
    jl('finestre.jsonl', { dove, ...o, foto: f }); }
}

const t0 = Date.now();
let m = null; const partite = []; let ultimaSett = ''; let ultimaFase = null; let stuck = 0; let hlCount = 0; let benchFatto = false, natFatto = false;
let sceneAperta = null; let bloccati = 0; let benchOrig = null; let preFaseT = 0; let lastAdvT = Date.now(); let ripetiK = '', ripetiN = 0;

async function apriScena(ph) {
  const n = hlCount++;
  const s = await ev(() => { let st = null; try { const x = window.__CPM_STATE(); st = { held: x.ball && x.ball.heldBy, ball: x.ball && { x: x.ball.x, y: x.ball.y, wy: x.ball.worldY }, hero: x.hero && { x: x.hero.x, y: x.hero.y } }; } catch (e) {}
    const c = window.__CPM_CORPI232 ? window.__CPM_CORPI232() : null; const w = (window.__CPM_GLB232W || []).slice(-1)[0] || null;
    const tx = (document.body.innerText || '').split('\n').filter(l => l.trim().length > 12).slice(0, 6);
    return { st, corpi: c, w232: w && { ph: w.ph, st: w.st, pronti: w.pronti, proc: w.proc, n: (w.corpi || []).length, noCg: (w.corpi || []).filter(q => !q.cg).length, tpose: (w.corpi || []).filter(q => q.w <= 0.05).length, senzaTesta: (w.corpi || []).filter(q => q.teste > q.testeOk).length }, testo: tx, clock: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null }; });
  const sc = { n, ph, apertura: s, foto: null, esito: null, t0: Date.now(), nRes: await ev(() => (window.__CPM_RES218 || []).length) };
  if (m && m.scene.length < 3) sc.foto = await foto(`p${m.n}-scena${m.scene.length + 1}-apertura`);
  return sc;
}

/* a quota raggiunta si resta fino a 60 s per l'intervista dell'ultima partita (attesaIntervista), poi si esce */
while (Date.now() - t0 < MAXMS && (partite.length < NP || (partite.length && partite[partite.length - 1].attesaIntervista && Date.now() - partite[partite.length - 1].fineT < 62000))) {
  const ph = await fase();
  if (ph && ph.__err) { await sleep(800); continue; }
  /* === IN PARTITA === */
  if (ph) {
    if (!m) {
      const c = await carriera();
      m = { n: partite.length + 1, inizio: Date.now(), season: c.season, week: c.week, md: c.md, scr: c.scr, fasi: [], walk: [], walkFoto: null, scene: [], finestre: [], caricamenti: {}, autoplay: false, perf: { lt: [], d: [] }, panchina: false };
      await ev(() => { window.__C164.lt.length = 0; window.__C164.d.length = 0; window.__CPM_RES218 = []; window.__CPM_GLB232W = []; window.__CPM_INT226 = { schede: [], scelte: [] }; window.__CPM_T216 = null; window.__CPM_FILA227 = null; window.__G165K.length = 0; });
      log('partita', m.n, 'S', c.season, 'W', c.week, JSON.stringify(c.md));
    }
    if (ph !== ultimaFase) { m.fasi.push([ph, Math.round((Date.now() - m.inizio) / 1000)]); preFaseT = Date.now(); }
    /* messaggi d'attesa a schermo */
    const car = await ev(() => { const t = document.body.innerText || ''; const r = t.match(/(Caricamento[^\n]{0,40}|Attendere[^\n]{0,30}|In attesa[^\n]{0,30})/); return r ? r[1] : null; });
    if (car && typeof car === 'string') { m.caricamenti[car] = (m.caricamenti[car] || 0) + 1; m.attese = m.attese || []; const L = m.attese[m.attese.length - 1]; const now = Date.now(); if (L && L.txt === car && now - L.fine < 1500) L.fine = now; else m.attese.push({ txt: car, ph, ini: now, fine: now }); }
    /* drenaggio fluidita' */
    const pf = await ev(() => { const o = { lt: window.__C164.lt.splice(0), d: window.__C164.d.splice(0) }; return o; });
    if (pf && pf.d) { m.perf.lt.push(...pf.lt); m.perf.d.push(...pf.d); }
    if (ph === 'matchday' || ph === 'formations') {
      if (Date.now() - preFaseT > 2500) {
        const ov = await scanOverlays(page); await registraFinestre(ov, 'prepartita');
        const a = await clickAdvance(page, [/Vedi le formazioni/, /Ingresso in campo/, /Formazioni →/]);
        if (!a && Date.now() - preFaseT > 30000) { const a2 = await clickAdvance(page, [/^Gioca/, /^Continua/, /Salta/]); m.fasi.push(['clic-forzato', a2]); }
        preFaseT = a ? Date.now() : preFaseT;
      }
    } else if (ph === 'walkout') {
      const k = await ev(() => { const x = window.__CPM_MASCOT911 ? window.__CPM_MASCOT911() : null; const f = window.__CPM_FILA227 || null; const hy = window.__CPM_HYPER_MASCOTS || null; const L = window.__CPM_HYPER_MASCOT_LIST || null; const _vis = q => q && q.glb911 && q.glb911.root && q.glb911.root.visible; const _d = q => (q && q.glb911 && q.glb911.root && q.p) ? Math.hypot(q.glb911.root.position.x - q.p.position.x, q.glb911.root.position.z - q.p.position.z) : null;
        const _med = a => { a = a.filter(v => v != null).sort((x, y) => x - y); return a.length ? +a[Math.floor(a.length / 2)].toFixed(2) : null; };
        const _pv = q => q && q.p && q.p.visible !== false; return { x, f, hy, lista: L ? { n: L.length, casa: L.filter(q => q && q.casa).length, vis: L.filter(_vis).length, visCasa: L.filter(q => q && q.casa && _vis(q)).length, visOsp: L.filter(q => q && !q.casa && _vis(q)).length,
          distCasa: _med(L.filter(q => q && q.casa && _vis(q)).map(_d)), distOsp: _med(L.filter(q => q && !q.casa && _vis(q)).map(_d)), legacyOsp: L.filter(q => q && !q.casa && q.c && q.c.visible).length, calcOspVis: L.filter(q => q && !q.casa && _pv(q)).length } : null }; });
      if (k && (k.hy || k.lista)) m.walkHy = { hy: k.hy, lista: k.lista, t: Math.round((Date.now() - preFaseT) / 1000) };
      if (k && k.lista && (!m.walkHyMax || k.lista.vis > m.walkHyMax.vis)) m.walkHyMax = { ...k.lista, t: Math.round((Date.now() - preFaseT) / 1000) };
      if (k && k.lista) { m.walkSide = m.walkSide || { letture: 0, ospZero: 0, casaZero: 0 }; m.walkSide.letture++; if (!k.lista.visOsp) m.walkSide.ospZero++; if (!k.lista.visCasa) m.walkSide.casaZero++; }
      if (k && k.x) m.walk.push({ t: Math.round((Date.now() - preFaseT) / 100) / 10, corpi: k.x.corpi, totale: k.x.totale, attivi: k.x.attivi, distMax: k.x.dist && k.x.dist.length ? Math.max(...k.x.dist) : null, distN: k.x.dist ? k.x.dist.length : 0, lontani: (k.x.dist || []).filter(d => d > 1.5).length });
      m.fila = k && k.f;
      /* foto dell'ingresso a 3, 9, 16, 24, 34, 46 s: le prime partite ne tengono tutte, le altre due */
      m.walkFoto = m.walkFoto || []; const tW = (Date.now() - preFaseT) / 1000; const soglie = [3, 9, 16, 24, 34, 46];
      const kW = soglie.filter(x => tW > x).length; if (kW > m.walkFoto.length && (m.n <= 2 || kW <= 2 || kW === 4)) { m.walkFoto.push(await foto(`p${m.n}-ingresso-${Math.round(tW)}s`)); } else if (kW > m.walkFoto.length) m.walkFoto.push(null);
      if (Date.now() - preFaseT > 90000) { await clickAdvance(page, [/Salta l'ingresso/]); m.fasi.push(['ingresso-saltato-dopo-90s', 1]); }
    } else if (ph === 'playing' || /^hl_/.test(ph)) {
      if (!m.autoplay) { await ev(sd => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: sd, policy: 'seeded', tickMs: 400 }), 1640 + m.n); m.autoplay = true;
        m.panchina = await ev(() => { const t = document.body.innerText || ''; return /A DISPOSIZIONE|RISCALDAMENTO|In panchina|panchina/i.test(t.slice(0, 3000)); }); }
      /* apertura di una scena dell'eroe */
      if (/^hl_(intro|move|choose)$/.test(ph) && !sceneAperta) { sceneAperta = await apriScena(ph); await ev(() => { window.__CPM_GK229 = []; window.__CPM_GK229ARM = null; }); }
      if (ph === 'hl_result' && sceneAperta) {
        if (!sceneAperta.esito) { await sleep(300);
          sceneAperta.esito = await ev(n0 => { const R = window.__CPM_RES218 || []; const r = R.length > n0 ? R[R.length - 1] : null; if (!r) return { nonRegistrato: true, giocata: (document.body.innerText.match(/LA GIOCATA\n([^\n]+)/) || [])[1] || null }; return r ? { label: r.label, key: r.key, ok: r.ok, fam: r.fam, ovl: r.ovl, outKind: r.outKind, tipo: r.tipo, variante: r.variante, ev: r.ev } : null; }, sceneAperta.nRes);
          sceneAperta.balls = [];
          if (m.scene.length < 3) sceneAperta.fotoEsito = await foto(`p${m.n}-scena${m.scene.length + 1}-esito`);
        }
        const bl = await ev(() => window.__CPM_BALL ? window.__CPM_BALL() : null); if (bl && !bl.__err) sceneAperta.balls.push(bl);
      }
      if (sceneAperta && sceneAperta.esito && !/^hl_/.test(ph)) {
        /* chiusura scena: pallone finale e portiere */
        const g = await ev(() => { const R = window.__CPM_GK229 || []; const arm = window.__CPM_GK229ARM || null; let gest = null, dzMax = 0; const z0 = R.length ? R[0].gz : 0; R.forEach(f => { if (f.op) gest = f.op; dzMax = Math.max(dzMax, Math.abs(f.gz - z0)); }); const L = R[R.length - 1] || null; return { arm, gest, dzMax: +dzMax.toFixed(2), fr: R.length, ultimo: L && { bx: L.bx, bz: L.bz, by: L.by, gx: L.gx, gz: L.gz } }; });
        sceneAperta.g164 = await ev(t1 => { const G = window.__G164.filter(q => q[0] >= t1); window.__G164.length = 0; return { n: G.length, maxX: G.length ? Math.max(...G.map(q => q[2])) : null, inRete: G.some(q => q[2] >= 98.6 && Math.abs(q[3] - 50) <= 3.35 / 0.68), campioniInRete: G.filter(q => q[2] >= 98.6 && Math.abs(q[3] - 50) <= 3.35 / 0.68).length, fine: G.length ? G[G.length - 1].slice(1) : null }; }, sceneAperta.t0);
        sceneAperta.gk = g; sceneAperta.ballFine = sceneAperta.balls.slice(-1)[0] || null; sceneAperta.ballMaxX = sceneAperta.balls.length ? Math.max(...sceneAperta.balls.map(q => q.x)) : null; delete sceneAperta.balls;
        m.scene.push(sceneAperta); sceneAperta = null;
      }
      /* finestre in partita (schede delle interazioni) */
      const ov = await scanOverlays(page);
      if (ov.length) { await registraFinestre(ov, 'partita'); for (const o of ov) m.finestre.push({ min: await ev(() => window.__CPM_CLOCK ? window.__CPM_CLOCK() : null), dc: o.dc, titolo: o.titolo, cornice: o.cornice, fuori: o.fuori, trunc: o.trunc.length });
        if (ov.some(o => o.pulsanti)) { await sleep(1200); const e = await closeTop(page); m.finestre.push({ clic: e }); } }
    } else if (ph === 'ended' || ph === 'ceremony') {
      if (!m.fine) {
        await sleep(1500);
        m.fine = await ev(() => { const sc = window.__CPM_SCORE ? window.__CPM_SCORE() : null; let tab = null; try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); tab = M && M.tabellino ? M.tabellino() : null; } catch (e) {}
          const pick = q => q ? { gol: q.gol, tiri: q.tiri, inPorta: q.inPorta != null ? q.inPorta : q.tiriPorta, possesso: q.possesso, passaggi: q.passaggi, cross: q.cross, corner: q.corner, falli: q.falli, gialli: q.gialli, rossi: q.rossi, parate: q.parate, xg: q.xg } : null;
          return { score: sc, tab: tab ? { home: pick(tab.home), away: pick(tab.away), chiavi: Object.keys(tab.home || {}) } : null, t216: window.__CPM_T216 || null, int226: window.__CPM_INT226 || null, clock: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null, fila: window.__CPM_FILA227 || null }; });
        m.fine.testo = await ev(() => (document.body.innerText || '').split('\n').filter(x => x.trim()).slice(0, 60).join(' | ').slice(0, 2500));
        m.fotoFine = await foto(`p${m.n}-fine`);
        m.ripartenze = await ev(() => window.__G165K.map(r => ({ ...r })));
        await ev(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(false));
        m.corpi = await ev(() => (window.__CPM_GLB232W || []).map(w => ({ ph: w.ph, pronti: w.pronti && w.pronti.pronti, motivo: w.pronti && w.pronti.motivo, proc: w.proc, n: (w.corpi || []).length, noCg: (w.corpi || []).filter(q => !q.cg).length, tpose: (w.corpi || []).filter(q => q.w <= 0.05).length, senzaTesta: (w.corpi || []).filter(q => q.teste > q.testeOk).length })));
        log('  fine', JSON.stringify(m.fine.score), 'tab', JSON.stringify(m.fine.tab && [m.fine.tab.home && m.fine.tab.home.gol, m.fine.tab.away && m.fine.tab.away.gol]), 'scene', m.scene.length);
        m.dopo = []; m.fineT = Date.now();
      }
      const ov = await scanOverlays(page);
      if (ov.length) { await registraFinestre(ov, 'fine-partita'); for (const o of ov) { const k = o.dc + ' / ' + o.titolo.slice(0, 40); if (!m.dopo.includes(k)) m.dopo.push(k); } await sleep(900); await closeTop(page); }
      else { const a = await clickAdvance(page, [/Torna alla dashboard/, /^Continua/, /Prosegui/, /Avanti/, /Chiudi/, /Fine/]); if (!a) await sleep(600); }
    }
    ultimaFase = ph; await sleep(450); continue;
  }
  /* === FUORI DALLA PARTITA (carriera) === */
  if (m) { /* partita appena chiusa: si registra quando la LiveMatch e' smontata */
    m.durS = Math.round((Date.now() - m.inizio) / 1000);
    if (m.attese) m.attese = m.attese.map(a => ({ txt: a.txt, ph: a.ph, s: +((a.fine - a.ini) / 1000).toFixed(1) }));
    const d = m.perf.d.filter(x => x > 0).sort((a, b) => a - b); const q = p => d.length ? d[Math.min(d.length - 1, Math.floor(p * d.length))] : null;
    m.fluidita = { fotogrammi: d.length, mediana: q(0.5), p95: q(0.95), max: d.length ? d[d.length - 1] : null, sopra250: d.filter(x => x > 250).length, sopra1000: d.filter(x => x > 1000).length,
      longtask: m.perf.lt.length, longtaskPerFase: m.perf.lt.reduce((o, x) => { const k = x[2] || '?'; o[k] = o[k] || [0, 0, 0]; o[k][0]++; o[k][1] += x[1]; o[k][2] = Math.max(o[k][2], x[1]); return o; }, {}), longtaskOltre2s: m.perf.lt.filter(x => x[1] > 2000).map(x => [x[1], x[2]]), longtaskSommaMs: m.perf.lt.reduce((a, x) => a + x[1], 0), longtaskMax: m.perf.lt.reduce((a, x) => Math.max(a, x[1]), 0) };
    delete m.perf; m.errori = errs.filter(e => e.t >= m.inizio).map(e => e.m); m.dopoFineIntervista = null;
    partite.push(m); m.intervista = null; m.attesaIntervista = true; jl('partite.jsonl', m);
    log('partita', m.n, 'registrata', m.durS + 's', 'fluidita', JSON.stringify(m.fluidita));
    if (m.n === BENCH_AT && benchOrig) { await ev(o => window.__CPM_CAREER.patch(o), benchOrig); log('leva panchina tolta: valori originali ripristinati', JSON.stringify(benchOrig)); }
    m = null; ultimaFase = null; sceneAperta = null;
  }
  const c = await carriera();
  if (c.err || c.__err) { await sleep(800); continue; }
  const sk = c.season + '-' + c.week;
  if (sk !== ultimaSett) { ultimaSett = sk; await controllaSettimana(sk); }
  /* leve di collaudo dichiarate */
  if (!benchFatto && partite.length + 1 === BENCH_AT && !c.lived) { benchOrig = await ev(() => { const s = window.__CPM_CAREER.snapshot(); return { coachTrust: s.coachTrust, form: s.form, fatigue: s.fatigue, squadRole: s.squadRole }; }); await ev(() => window.__CPM_CAREER.patch({ coachTrust: 18, form: 35, fatigue: 70, squadRole: 'riserva' })); benchFatto = true; log('leva panchina armata'); }
  if (!natFatto && partite.length + 1 === NAT_AT && !c.lived) { await ev(() => { const s = window.__CPM_CAREER.snapshot(); window.__CPM_CAREER.patch({ nationalCaps: Math.max(2, s.nationalCaps | 0), nationsCupQueue: { active: true, opponents: ['Francia', 'Portogallo', 'Olanda'].filter(n => n !== s.nation), matchIdx: 0, pts: 0, matches: [], done: false, season: s.season } }); }); natFatto = true; log('leva nazionale armata'); }
  if (benchFatto && partite.length + 1 > BENCH_AT && !c.lived && !natFatto) { /* dopo la panchina si torna normali */ }
  const ov = await scanOverlays(page);
  if (ov.length) {
    await registraFinestre(ov, 'carriera ' + c.scr);
    /* intervista dopo l'ultima partita */
    const iv = ov.find(o => o.dc === 'intervista231');
    const last = partite[partite.length - 1];
    if (last && last.attesaIntervista) { for (const o of ov) { const k = o.dc + ' / ' + o.titolo.slice(0, 40); if (!last.dopo.includes(k)) last.dopo.push(k); }
      if (iv) { last.attesaIntervista = false; last.intervista = { titolo: iv.titolo, ctx: await ev(() => { const el = document.querySelector('[data-cpm="intervista231"]'); return el ? { ctx: el.getAttribute('data-ctx'), testo: (el.innerText || '').slice(0, 400) } : null; }), foto: await foto(`p${last.n}-intervista`) };
        jl('interviste.jsonl', { partita: last.n, week: last.week, ...last.intervista, dopo: last.dopo }); log('  intervista partita', last.n); } }
    const k = ov.map(o => o.dc + o.titolo.slice(0, 20)).join(';'); ripetiN = k === ripetiK ? ripetiN + 1 : 0; ripetiK = k;
    if (ripetiN > 8) { log('finestra che non si chiude:', k); jl('blocchi.jsonl', { k, c }); ripetiN = 0; await ev(() => window.__CPM_CAREER.dismiss()); }
    const nonConv = ov.find(o => o.etichette.some(e => /Simula e avanza/.test(e)) && !o.etichette.some(e => /Gioca/.test(e)));
    if (nonConv) { const t = await ev(() => (document.body.innerText.match(/Non convocato[^\n]*\n?[^\n]*/) || [''])[0]); jl('non-convocato.jsonl', { c, t, etichette: nonConv.etichette }); log('  NON CONVOCATO, simulo la settimana:', String(t).slice(0, 80)); await clickAdvance(page, [/Simula e avanza/]); lastAdvT = Date.now(); await sleep(1500); continue; }
    if (process.env.CPM_RIFIUTA === '1') { const rf = await ev(() => { const t = document.body.innerText || ''; if (!/offert|prestito|trasferiment/i.test(t)) return null;
        const bs = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && !b.disabled); const b = bs.find(x => /^(\W*)(Rifiuta|Resto|Rimango|Declina|No grazie)/i.test((x.textContent || '').trim()));
        if (!b) return null; const e = (b.textContent || '').trim().slice(0, 40); b.click(); return e; });
      if (rf && typeof rf === 'string') { jl('offerte.jsonl', { c, clic: rf, testo: await ev(() => (document.body.innerText || '').slice(0, 500)) }); log('  offerta rifiutata:', rf); await sleep(1200); continue; } }
    if (ov.some(o => o.pulsanti)) { await sleep(700); const e = await avanzaTop(page); if (e) { lastAdvT = Date.now(); await sleep(700); continue; } }
    /* finestre senza pulsanti (avvisi, gala'): si lascia scorrere e si prova l'avanzamento sotto */
  }
  const last = partite[partite.length - 1];
  if (last && last.attesaIntervista && Date.now() - last.fineT > 60000) { last.attesaIntervista = false; jl('interviste.jsonl', { partita: last.n, week: last.week, intervista: null, dopo: last.dopo, nota: 'nessuna intervista entro 60 s dalla fine' }); log('  NESSUNA intervista partita', last.n); }
  if (process.env.CPM_RIFIUTA === '1') { const rf = await ev(() => { const t = document.body.innerText || ''; if (!/offert|prestito|trasferiment/i.test(t)) return null;
        const bs = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && !b.disabled); const b = bs.find(x => /^(\W*)(Rifiuta|Resto|Rimango|Declina|No grazie)/i.test((x.textContent || '').trim()));
        if (!b) return null; const e = (b.textContent || '').trim().slice(0, 40); b.click(); return e; });
      if (rf && typeof rf === 'string') { jl('offerte.jsonl', { c, clic: rf, testo: await ev(() => (document.body.innerText || '').slice(0, 500)) }); log('  offerta rifiutata:', rf); await sleep(1200); continue; } }
  const a = await clickGiocatore(page, [/^Gioca la partita/, /^Gioca\b/, /Torna alla dashboard/, /Vivi la Settimana/, /Chiudi la stagione/, /Vai al bilancio/, /Salta premiazione/, /Salta il gal/, /Siamo pronti/, /Continua/, /Avanti/, /Prosegui/, /^Inizia/, /Scendi in campo/, /Accetta/, /Nuova stagione/, /Avvia Stagione/, /^Avvia/, /^Conferma/, /^Andiamo/, /^Partiamo/, /^Completa/, /^Firma/, /^Prosegui/, /^Chiudi/, /^Fatto/, /^Ok\b/, /Che la stagione cominci/, /cominci/i, /Avanza Settimana/, /→\s*$/]);
  if (a) { lastAdvT = Date.now(); stuck = 0; await sleep(900); continue; }
  stuck++;
  if (Date.now() - lastAdvT > 45000) {
    const f = await foto('bloccato-' + c.season + '-' + c.week + '-' + c.scr); jl('blocchi.jsonl', { stuckS: Math.round((Date.now() - lastAdvT) / 1000), c, foto: f, testo: await ev(() => (document.body.innerText || '').slice(0, 600)) });
    log('nessun pulsante utile da 45 s su', c.scr); lastAdvT = Date.now(); bloccati++;
    if (bloccati >= 4) { log('carriera ferma: esco'); break; }
  }
  await sleep(700);
}
const fin = await carriera();
try { const sv = await page.evaluate(() => localStorage.getItem('cpm-v3')); if (sv) fs.writeFileSync(path.join(DATI, `salvataggio-fine-${TAG}.json`), sv); } catch (e) {}
log('FINE', partite.length, 'partite in', Math.round((Date.now() - t0) / 1000), 's', JSON.stringify(fin));
jl('fine.jsonl', { partite: partite.length, s: Math.round((Date.now() - t0) / 1000), fin, errori: errs.slice(0, 20) });
await ctx.close(); await b.close(); srv.close();
