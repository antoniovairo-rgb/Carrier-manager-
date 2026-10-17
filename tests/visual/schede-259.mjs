#!/usr/bin/env node
/* [PO-259, decisione PO 15/10 «Poche ma decisive»] GUARDIANO DELLE SCHEDE DEL MISTER. Rosso __CPM_NO_SCHEDE259 (= comportamento 7.999.169).
   Censimento e guardiano nello stesso file, cosi' «prima» e «dopo» si misurano con lo stesso strumento.
   (A) node, regola pura INT259.scegli: nessuna scheda senza posta in gioco (3-0, 2-0 al 63', 0-3 nel finale), tetto 2 a partita,
       una scheda per ognuno dei momenti dichiarati dal PO (sotto nel finale, pari dopo il 75', espulsione, rigore contro, fiato corto
       in bilico). Ogni opzione ha la sua riga rischio/premio. ROSSO: col rosso la regola cede a INT226 (si apre la scheda sul 3-0).
   (B) node, banco del motore (24 configurazioni S12 x CPM_SEMI): la scelta cambia DATI del motore (voglia di tirare, pressing, linea,
       attesa della prossima occasione dell'eroe) e i bracci «spingo» / «gestisco» producono tiri e recuperi diversi dopo la scheda.
   (C) browser, partite vere di carriera con autoplay e nomi diversi (CPM_PARTITE per braccio, default 4; CPM_CENSIMENTO=1 = 20):
       schede per partita, minuto e punteggio, scelta che cambia il motore, racconto dopo ~5' che corrisponde a un fatto del motore,
       riga nel riepilogo. VERDE: <=2 schede, mai senza posta, racconti tutti coerenti, riga di riepilogo per ogni partita con scheda.
       ROSSO (__CPM_NO_SCHEDE259): tornano le schede 226 (anche sul 3-0 / al 63'), zero racconti.
   Uso: node schede-259.mjs · CPM_SOLO_NODE=1 · CPM_SOLO_BROWSER=1 · CPM_PARTITE=4 · CPM_PAR=4 (pagine in parallelo) · CPM_BRACCI=verde,rosso
        CPM_CENSIMENTO=1 (20 partite, stampa la tabella e scrive out/schede-259/censimento-<etichetta>.json; CPM_ETICHETTA=prima|dopo) */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const fail = [];
const OUT = path.join(ROOT, 'tests', 'visual', 'out', 'schede-259'); fs.mkdirSync(OUT, { recursive: true });
const s14 = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = s14.slice(s14.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
const carica = (W) => Function('decideExecution', 'window', code + '\nreturn {crea:creaMotorePossesso,INT226,INT259:(typeof INT259!=="undefined"?INT259:null)};')(undefined, W);
const CENS = !!process.env.CPM_CENSIMENTO;
const haINT259 = !!carica({}).INT259;

/* ---------- (A) regola pura ---------- */
if (!process.env.CPM_SOLO_BROWSER && haINT259) {
  const { INT259 } = carica({});
  const base = { energia: 80, panchina: false, ingresso: 0, fatte: [], ultima: null, espNoi: 0, espLoro: 0, rigContro: 0 };
  const caso = (o) => INT259.scegli(Object.assign({}, base, o));
  const NO = [['3-0 al 63', { mn: 63, diff: 3 }], ['2-0 al 63', { mn: 63, diff: 2 }], ['0-3 all 80', { mn: 80, diff: -3 }], ['pari al 30', { mn: 30, diff: 0 }],
    ['sotto di 1 al 40', { mn: 40, diff: -1 }], ['fiato corto sul 3-0', { mn: 70, diff: 3, energia: 38, caloMin: 69 }], ['fiato calato da tempo al 60 sull 1-1', { mn: 60, diff: 0, energia: 30, caloMin: 41 }], ['3-0 e loro in dieci', { mn: 50, diff: 3, espLoro: 1, espLoroMin: 49 }],
    ['tetto raggiunto', { mn: 80, diff: 0, fatte: ['pari_finale', 'espulsione_noi'], ultima: 60 }]];
  const SI = [['sotto di 1 al 72', { mn: 72, diff: -1 }, 'sotto_finale'], ['pari al 77', { mn: 77, diff: 0 }, 'pari_finale'], ['espulso dei nostri al 40 sull 1-1', { mn: 40, diff: 0, espNoi: 1, espNoiMin: 39 }, 'espulsione_noi'],
    ['espulso dei loro al 55 sullo 0-1', { mn: 55, diff: -1, espLoro: 1, espLoroMin: 54 }, 'espulsione_loro'], ['rigore contro al 33 sull 1-0', { mn: 33, diff: 1, rigContro: 1, rigControMin: 32 }, 'rigore_contro'],
    ['fiato corto al 62 sull 1-1', { mn: 62, diff: 0, energia: 38, caloMin: 61 }, 'eroe_stanco'], ['vantaggio di misura all 84', { mn: 84, diff: 1 }, 'misura_finale']];
  const errNo = NO.filter(([, c]) => caso(c)), errSi = SI.filter(([, c, id]) => caso(c) !== id);
  let senzaRP = []; for (const id of Object.keys(INT259.SCHEDE)) for (const o of INT259.SCHEDE[id].sc) if (!o.rischio || !o.premio) senzaRP.push(id + ':' + o.et);
  console.log(`(A) regola: ${NO.length - errNo.length}/${NO.length} momenti senza posta restano muti · ${SI.length - errSi.length}/${SI.length} momenti decisivi aprono la scheda giusta · opzioni senza rischio/premio ${senzaRP.length}`);
  if (errNo.length) fail.push('A: scheda senza posta ' + errNo.map(x => x[0]).join(', '));
  if (errSi.length) fail.push('A: momento decisivo muto ' + errSi.map(x => x[0] + '→' + caso(x[1])).join(', '));
  if (senzaRP.length) fail.push('A: opzioni senza rischio/premio ' + senzaRP.join(', '));
  const R = carica({ __CPM_NO_SCHEDE259: 1 }).INT259; const rossoApre = R.attivo() === false;
  console.log(`(A) rosso: INT259.attivo() = ${R.attivo()} (col rosso decide INT226, che apre la scheda sul 3-0: ${carica({ __CPM_NO_SCHEDE259: 1 }).INT226.scegli({ mn: 63, diff: 3, fatte: [], panchina: false, energia: 80 })})`);
  if (!rossoApre) fail.push('A rosso non riconosciuto');
}

/* ---------- (B) banco del motore ---------- */
if (!process.env.CPM_SOLO_BROWSER && haINT259) {
  const CFG = JSON.parse(fs.readFileSync(new URL('./fixtures/cfg-202-s12.json', import.meta.url)));
  const SEMI = +(process.env.CPM_SEMI || 8);
  /* braccio: alla prima scheda si sceglie l'opzione idx; si contano, nei 15' dopo, tiri e recuperi della squadra dell'eroe, tiri subiti
     e minuti fino alla prossima occasione dell'eroe (evento occasione_eroe, motore in modo vissuta) */
  function braccio(W, tipo) {
    const { crea, INT259 } = carica(W);
    const idxDi = (f) => { if (tipo == null) return -1; const k = INT259.SCHEDE[f].sc.findIndex(o => o.tipo === tipo); return k; };
    const T = { schede: 0, tiri: 0, subiti: 0, recuperi: 0, gol: 0, golSub: 0, xg: 0, xgSub: 0, min: 0, attesa: [], cambiati: 0, applicate: 0, racconti: 0, coerenti: 0, fatti: {} };
    for (let s = 0; s < CFG.length * SEMI; s++) {
      const c0 = CFG[s % CFG.length];
      const M = crea(Object.assign({}, c0, { occasioniV2: true, brainLive: false, fin202: null, seed: (((c0.seed >>> 0) ^ ((1 + Math.floor(s / CFG.length)) * 2654435761)) >>> 0) }));
      const B = 22; const fatte = []; let aperta = null; let occPrima = null; const esp = { n: 0, m: null }, espL = { n: 0, m: null }, rig = { n: 0, m: null };
      for (let m = 1; m <= 93; m++) {
        if (m === 46) M.chiedi.riprendi({ centro: true, lato: 'away' });
        const G = M._S.conta.gol; const d = (G.home | 0) - (G.away | 0);
        const attDi = (dd) => (m >= 70 && dd <= 0) ? 1 : (m >= 60 && dd >= 2) ? -0.6 : (dd < 0 ? 0.4 : 0);
        M.chiedi.atteggiamento('home', attDi(d)); M.chiedi.atteggiamento('away', attDi(-d));
        const tb = M.tabellino();
        if ((tb.home.espulsioni | 0) > esp.n) { esp.n = tb.home.espulsioni | 0; esp.m = m; } if ((tb.away.espulsioni | 0) > espL.n) { espL.n = tb.away.espulsioni | 0; espL.m = m; } if ((tb.away.rigori | 0) > rig.n) { rig.n = tb.away.rigori | 0; rig.m = m; }
        const f = (!aperta) ? INT259.scegli({ mn: Math.min(m, 90), diff: d, energia: 60, panchina: false, ingresso: 0, fatte, ultima: null, espNoi: esp.n, espNoiMin: esp.m, espLoro: espL.n, espLoroMin: espL.m, rigContro: rig.n, rigControMin: rig.m }) : null;
        if (f) { fatte.push(f); T.schede++; const k = idxDi(f);
          if (k >= 0) { const r = INT259.applica(M, f, k, m); T.applicate++; if (r && JSON.stringify(r.prima) !== JSON.stringify(r.dopo)) T.cambiati++; }
          aperta = { m, f, k, applicata: k >= 0, foto: INT259.foto(M) }; occPrima = M._S._ultOccV2; if (k >= 0 || tipo == null) T.min += 15; }
        if (aperta && aperta.applicata && !aperta.raccontato && m >= aperta.m + INT259.ATTESA) { aperta.raccontato = true; const dopo = INT259.foto(M);
          const r = { fatto: aperta.f, idx: aperta.k, m0: aperta.m, m1: m, prima: aperta.foto, dopo, occ: (dopo.occ != null && dopo.occ >= aperta.m && dopo.occ !== occPrima) ? dopo.occ : null, eroe: 'Vairo' };
          const es = INT259.racconta(r); T.racconti++; if (INT259.verifica(r, es)) T.coerenti++; T.fatti[es.k] = (T.fatti[es.k] || 0) + 1; }
        for (let b = 0; b < B; b++) { const ev = M.tick({ min: Math.min(m, 90), dt: 1 / B, dec: true }) || [];
          if (!aperta || m >= aperta.m + 15 || !(aperta.applicata || tipo == null)) continue;
          for (const e of ev) { const l = (e.chi && e.chi.team) || e.per || e.lato;
            if (e.t === 'tiro') { const x = typeof e.xg === 'number' ? e.xg : 0; if (l === 'home') { T.tiri++; T.xg += x; } else { T.subiti++; T.xgSub += x; } }
            if (e.t === 'gol') { if (l === 'home') T.gol++; else T.golSub++; }
            if ((e.t === 'contrasto' || e.t === 'recupero' || e.t === 'intercetto') && l === 'home') T.recuperi++; } }
        if (aperta && (aperta.applicata || tipo == null) && aperta.occ == null && M._S._ultOccV2 != null && M._S._ultOccV2 !== occPrima && M._S._ultOccV2 >= aperta.m) { aperta.occ = M._S._ultOccV2 - aperta.m; T.attesa.push(aperta.occ); }
      }
    }
    const k = (x) => T.min ? +(100 * x / T.min).toFixed(2) : 0;
    const att = T.attesa.length ? +(T.attesa.reduce((a, b) => a + b, 0) / T.attesa.length).toFixed(1) : null;
    return { schede: T.schede, applicate: T.applicate, cambiati: T.cambiati, tiri100: k(T.tiri), subiti100: k(T.subiti), recuperi100: k(T.recuperi), gol100: k(T.gol), golSub100: k(T.golSub), xg100: k(T.xg), xgSub100: k(T.xgSub), xgPerTiroSub: T.subiti ? +(T.xgSub / T.subiti).toFixed(3) : 0, attesaOccEroe: att, occ: T.attesa.length, racconti: T.racconti, coerenti: T.coerenti, fatti: T.fatti };
  }
  const W44 = process.env.CPM_NO_PROM44 ? { __CPM_NO_PROM44: 1 } : {};
  const SPI = braccio({}, 'spinta'), PAL = braccio({}, 'palla'), ERO = braccio(W44, 'eroe'), NEU = braccio({}, null);
  /* [giro 44 PO-226] «la risolvo io»: i compagni cercano l'eroe finche' l'occasione promessa non arriva (rosso __CPM_NO_PROM44). Stessi semi:
     con la leva l'eroe deve avere piu' occasioni nei 15' dopo la scelta che senza. Misurato: 130 contro 117 (attesa 3,3' contro 3,7'). */
  { const E0 = braccio({ __CPM_NO_PROM44: 1 }, 'eroe');
    console.log(`   «eroe» con i compagni che cercano l'eroe: occasioni ${ERO.occ} (attesa ${ERO.attesaOccEroe}') contro ${E0.occ} (${E0.attesaOccEroe}') senza la leva`);
    if (!(ERO.occ >= E0.occ * 1.05)) fail.push('B: «la risolvo io» non porta piu\' occasioni all\'eroe (' + ERO.occ + ' contro ' + E0.occ + ')'); }
  console.log('(B) banco, ' + (24 * SEMI) + ' partite per braccio, nei 15\' dopo la scheda (valori per 100 minuti; attesa = minuti fino alla prossima occasione dell\'eroe)');
  for (const [n, x] of [['«spinta»', SPI], ['«palla»', PAL], ['«eroe»', ERO], ['nessuna scelta', NEU]]) console.log('   ' + n.padEnd(15) + JSON.stringify(x));
  const sep = (a, b) => b ? (a - b) / b : 0, pc = (x) => (100 * x).toFixed(1) + '%';
  const chk = {
    spintaTiri: sep(SPI.tiri100, NEU.tiri100), spintaRischio: sep(SPI.xgSub100, NEU.xgSub100),
    pallaSubiti: sep(PAL.subiti100, NEU.subiti100), pallaTiri: sep(PAL.tiri100, NEU.tiri100),
    eroeAttesa: (ERO.attesaOccEroe != null && NEU.attesaOccEroe != null) ? ERO.attesaOccEroe - NEU.attesaOccEroe : null, eroeTiri: sep(ERO.tiri100, NEU.tiri100) };
  console.log(`   contro «nessuna scelta» — spinta: tiri ${pc(chk.spintaTiri)} (premio) · pericolo dei loro tiri, xG subito ${pc(chk.spintaRischio)} (rischio)`);
  console.log(`                            palla : tiri subiti ${pc(chk.pallaSubiti)} (premio) · tiri nostri ${pc(chk.pallaTiri)} (rischio)`);
  console.log(`                            eroe  : prossima occasione dell'eroe ${chk.eroeAttesa == null ? '?' : chk.eroeAttesa.toFixed(1)}' (premio) · tiri della squadra ${pc(chk.eroeTiri)} (rischio)`);
  const RAC = [SPI, PAL, ERO].reduce((a, b) => [a[0] + b.racconti, a[1] + b.coerenti], [0, 0]);
  console.log(`   racconti dopo ${5}': ${RAC[1]}/${RAC[0]} corrispondono ai fatti del motore · fatti messi davanti: spinta ${JSON.stringify(SPI.fatti)} palla ${JSON.stringify(PAL.fatti)} eroe ${JSON.stringify(ERO.fatti)}`);
  const tutteCambiano = [SPI, PAL, ERO].every(b => b.cambiati === b.applicate && b.applicate > 0);
  if (!tutteCambiano) fail.push('B: una scelta non cambia il motore');
  if (!(chk.spintaTiri >= 0.05 && chk.spintaRischio >= 0.10)) fail.push('B: «spinta» premio/rischio non veri');
  /* [giro 44 PO-226] ogni PREMIO scritto deve essere vero al banco: una scheda che promette «palloni recuperati» con un profilo che li fa calare
     mente al giocatore (era «Stringo i denti e pressing»: recuperi 23,9 contro 27,4 ogni 100'). Rosso __CPM_NO_PREMIO44. */
  { const W44 = process.env.CPM_NO_PREMIO44 ? { __CPM_NO_PREMIO44: 1 } : {}; const I44 = carica(W44).INT259; const bugie = [];
    for (const [id, S] of Object.entries(I44.SCHEDE)) S.sc.forEach(o => { const t = String(o.premio || '');
      if (/recuperat/i.test(t) && !(sep(({ spinta: SPI, palla: PAL, eroe: ERO })[o.tipo].recuperi100, NEU.recuperi100) > 0)) bugie.push(id + ': «' + t + '»');
      if (/più tiri/i.test(t) && !(sep(({ spinta: SPI, palla: PAL, eroe: ERO })[o.tipo].tiri100, NEU.tiri100) > 0)) bugie.push(id + ': «' + t + '»'); });
    console.log(`   premi scritti smentiti dal banco: ${bugie.length}${bugie.length ? ' ' + JSON.stringify(bugie) : ''}`);
    if (bugie.length) fail.push('B: premio scritto smentito dal banco (' + bugie.join(' · ') + ')'); }
  if (!(chk.pallaSubiti <= -0.05 && chk.pallaTiri <= -0.03)) fail.push('B: «palla» premio/rischio non veri');
  if (!(chk.eroeAttesa != null && chk.eroeAttesa <= -1.5 && chk.eroeTiri <= 0)) fail.push('B: «eroe» premio/rischio non veri');
  if (RAC[1] !== RAC[0] || RAC[0] === 0) fail.push('B: racconti non coerenti coi fatti');
}

/* ---------- (C) partite vere ---------- */
if (!process.env.CPM_SOLO_NODE) {
  const N = +(process.env.CPM_PARTITE || (CENS ? 20 : 4)), PAR = +(process.env.CPM_PAR || 4), TETTO = +(process.env.CPM_TETTO_MS || 420000);
  const BRACCI = (process.env.CPM_BRACCI || (CENS ? 'verde' : 'verde,rosso')).split(',');
  const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
  const NOMI = ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Galli', 'Conti', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Costa', 'Fontana', 'Moretti', 'Barbieri', 'Lombardi', 'Rinaldi', 'Caruso', 'Ferrara', 'Serra', 'Fabbri', 'Villa'];
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const partita = async (i, rosso) => {
    const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
    const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = 'Prova ' + NOMI[i % NOMI.length] + ' ' + i;
    await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_SCMS681 = 1500; window.__CPM_INT226_IDX = o.idx; if (o.rosso) window.__CPM_NO_SCHEDE259 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save, rosso, idx: i % 3 });
    let out = { i, rosso, finita: false, nome: save.player.name };
    try {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
      await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
      await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      await page.evaluate(() => window.__CPM_CAREER.playMatch());
      await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
      await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2590 + i * 37);
      const t1 = Date.now(); const motore = []; let ultN = 0, ultA = null;
      while (Date.now() - t1 < TETTO) { await sleep(500);
        const d = await page.evaluate(() => { let a = null; try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); a = M && M._S ? M._S.richieste.att226.home : null; } catch (e) {}
          return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, a, n: ((window.__CPM_INT226 || {}).scelte || []).length }; });
        if (d.n !== ultN) { motore.push({ n: d.n, a: d.a }); ultN = d.n; } ultA = d.a;
        if (d.ph === 'ended') { out.finita = true; break; }
        if (d.ph === 'ceremony') { out.finita = true; await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'ended', null, { timeout: 20000 }).catch(() => {}); break; } }
      await sleep(800);
      const dati = await page.evaluate(() => ({ tab: (() => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); return M && M.tabellino ? M.tabellino() : null; } catch (e) { return null; } })(), w: window.__CPM_INT226 || { schede: [], scelte: [] }, s259: window.__CPM_S259 || null, intx: (window.__CPM_INTX669 || []).map(x => ({ min: x.min, id: x.id })), score: window.__CPM_SCORE ? window.__CPM_SCORE() : null,
        riep: (() => { const el = document.querySelector('[data-cpm="riep259"]'); return el ? el.innerText : null; })() }));
      out = Object.assign(out, dati, { motore, errori: errs.slice(0, 3) });
    } catch (e) { out.errore = String(e.message).slice(0, 160); }
    await page.close(); return out;
  };
  const corri = async (rosso) => { const res = new Array(N); let next = 0;
    const lav = async () => { while (next < N) { const i = next++; res[i] = await partita(i, rosso); const p = res[i]; const g = giudica(p);
      console.log(`(C) ${rosso ? 'rosso' : 'verde'} p${i} ${p.finita ? 'finita' : 'NON FINITA'} ${JSON.stringify(p.score)} schede=${g.schede} [${g.dove}] cambia=${g.cambia}/${g.scelte} racconti=${g.racconti} coerenti=${g.coerenti} riep=${p.riep ? 'si' : 'no'}${p.errori && p.errori.length ? ' ERR ' + p.errori[0] : ''}${p.errore ? ' ERRORE ' + p.errore : ''}`); } };
    await Promise.all(Array.from({ length: Math.min(PAR, N) }, lav)); return res; };
  /* giudizio di una partita: lo stesso «prima» e «dopo». La scheda e' «con posta» se nel finale (>=70') il punteggio e' in bilico (|diff|<=1),
     o se e' nata da un fatto del motore (espulsione, rigore contro), o dal fiato corto in una partita in bilico */
  function giudica(p) {
    const S = (p.s259 && p.s259.schede) || (p.w && p.w.schede || []).map(s => ({ min: s.min, diff: s.diff, fatto: s.fatto }));
    const sc = (p.s259 && p.s259.scelte) || (p.w && p.w.scelte) || [];
    let cambia = 0; if (p.s259 && p.s259.scelte) cambia = p.s259.scelte.filter(x => x.cambiato).length;
    else { let prev = 0; for (const x of sc) { if (x.ingresso != null) { if (x.ingresso !== x.ingressoPrima) cambia++; } else if (x.att != null) { if (Math.abs(x.att - prev) > 1e-9) cambia++; prev = x.att; } } }
    const senzaPosta = S.filter(s => Math.abs(s.diff | 0) >= 2 && !/espulsione|rigore/.test(s.fatto || '')).length;
    const R = (p.s259 && p.s259.racconti) || [];
    /* il racconto corrisponde a un fatto del motore se: (1) il fatto dichiarato si ricalcola uguale dai due fotogrammi (INT259.verifica, nel
       gioco), (2) il numero sta nel testo, (3) i fotogrammi sono letture del motore vero: mai oltre il tabellino finale, mai all'indietro */
    const fin = p.tab, scF = p.score || {};
    const ok = (r) => { if (!r.coerente) return false; if (r.panca) return true; const a = r.prima || {}, d = r.dopo || {};
      for (const k of ['tiriNoi', 'tiriLoro', 'recNoi', 'gNoi', 'gLoro', 'contro']) if ((d[k] | 0) < (a[k] | 0)) return false;
      if (fin && ((d.tiriNoi | 0) > (fin.home.tiri | 0) || (d.tiriLoro | 0) > (fin.away.tiri | 0))) return false;
      if ((d.gNoi | 0) > (scF.home | 0) || (d.gLoro | 0) > (scF.away | 0)) return false; return true; };
    return { schede: S.length, dove: S.map(s => s.min + "'" + (s.diff > 0 ? '+' : '') + s.diff + ' ' + s.fatto).join(' | '), scelte: sc.length, cambia, senzaPosta, racconti: R.length, coerenti: R.filter(ok).length, testi: R.map(r => r.m0 + "'→" + r.m1 + "' " + (r.esito && r.esito.testo) + ' | mister: ' + r.voce) };
  }
  const report = {};
  for (const br of BRACCI) {
    const rosso = br === 'rosso'; const res = await corri(rosso); const G = res.map(giudica);
    const fin = res.filter(p => p.finita).length, tot = G.reduce((a, g) => a + g.schede, 0), maxS = Math.max(0, ...G.map(g => g.schede));
    const sP = G.reduce((a, g) => a + g.senzaPosta, 0), sc = G.reduce((a, g) => a + g.scelte, 0), ca = G.reduce((a, g) => a + g.cambia, 0);
    const ra = G.reduce((a, g) => a + g.racconti, 0), co = G.reduce((a, g) => a + g.coerenti, 0);
    const conScheda = res.filter((p, k) => G[k].schede > 0), riep = conScheda.filter(p => p.riep && /scelta/i.test(p.riep)).length;
    const hist = {}; G.forEach(g => { hist[g.schede] = (hist[g.schede] || 0) + 1; });
    const errori = res.filter(p => (p.errori && p.errori.length) || p.errore).length;
    report[br] = { partite: N, finite: fin, schedeTot: tot, schedePerPartita: +(tot / N).toFixed(2), distribuzione: hist, max: maxS, senzaPosta: sP, scelte: sc, sceltaCambiaMotore: ca, racconti: ra, raccontiCoerenti: co, riepilogo: riep + '/' + conScheda.length, errori, dettaglio: G.map((g, k) => ({ p: k, score: res[k].score, dove: g.dove, racconti: g.testi, riepilogo: res[k].riep })) };
    console.log(`(C) ${br}: ${fin}/${N} finite · schede ${tot} (${(tot / N).toFixed(2)}/partita, max ${maxS}, distribuzione ${JSON.stringify(hist)}) · senza posta ${sP} · scelta che cambia il motore ${ca}/${sc} · racconti coerenti ${co}/${ra} · riepilogo ${riep}/${conScheda.length} · errori ${errori}`);
    if (!rosso && !CENS) {
      if (fin !== N || errori) fail.push('C verde: partite non finite o errori');
      if (maxS > 2 || sP > 0) fail.push('C verde: troppe schede o schede senza posta');
      if (ca !== sc) fail.push('C verde: scelte senza effetto sul motore');
      if (co !== ra || ra < sc - G.filter(g => g.scelte).length) fail.push('C verde: racconti mancanti o non coerenti');
      if (riep !== conScheda.length) fail.push('C verde: riga di riepilogo mancante');
    }
    if (rosso && !CENS) { if (ra > 0 || !G.some(g => g.schede > 0)) fail.push('C rosso non riconosciuto'); }
  }
  if (CENS) fs.writeFileSync(path.join(OUT, 'censimento-' + (process.env.CPM_ETICHETTA || 'misura') + '.json'), JSON.stringify(report, null, 1));
  await b.close(); srv.close();
}
console.log(fail.length ? '❌ ROSSO — ' + fail.join(' · ') : (CENS ? '📋 censimento scritto' : '✅ VERDE — schede poche e decisive, effetto vero sul motore, racconto dai fatti, riga nel riepilogo, prova del rosso riconosciuta'));
process.exit(fail.length ? 1 : 0);
