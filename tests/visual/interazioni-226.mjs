#!/usr/bin/env node
/* [PO-226, decisione PO 12/10 «Sì, avvia il piano»] GUARDIANO DELLE INTERAZIONI IN PARTITA. Rosso __CPM_NO_INT226.
   Il sistema nuovo: al massimo tre scelte a partita, ognuna aperta da un FATTO del motore (src/14, INT226.FATTI), con un effetto
   vero — l'ordine del mister seguito o no cambia l'atteggiamento del motore; la panchina sposta il minuto d'ingresso, col seme.
   Tre parti:
   (A) node, banco del motore sulle 24 configurazioni vere della vissuta S12 (fixtures/cfg-202-s12.json, come brain-202) x CPM_SEMI
       semi = almeno 312 partite per braccio. Le schede nascono da INT226.scegli sul punteggio vero del motore; tre bracci con gli
       STESSI semi: «seguo» (opzione 0), «di testa mia» (1), ROSSO (__CPM_NO_INT226, opzione 0). Si contano tiri e gol della squadra
       dell'eroe DOPO la scheda. VERDE: sulle schede d'attacco «seguo» tira almeno il 10% in piu' di «di testa mia», su quelle di
       difesa almeno il 10% in meno; ROSSO: la differenza sparisce (|scarto| < 3%), cioe' la scelta non arriva al motore.
   (B) node, panchina: INT226.ingresso su 400 casi. VERDE: «resto concentrato» lascia il minuto del mister, «chiedo di entrare» lo
       anticipa di 4-10' (mai prima di due minuti da adesso), stesso seme → stesso minuto.
   (C) browser, partite vere di carriera (fixtures/save-194-primavera-w38.json, come la sonda della collaudatrice PO-226), CPM_PARTITE
       per braccio (default 2). VERDE: <= 3 schede a partita, tutte del sistema nuovo, ognuna col suo fatto vero al minuto in cui e'
       uscita (punteggio e minuto registrati dal gioco), nessuna scheda INTX669 a orologio, e la scelta arriva al motore
       (att226 letto dal motore uguale a quello dichiarato). ROSSO (__CPM_NO_INT226): tornano le schede a orologio, zero schede nuove.
   Uscita 0 solo se il verde passa E il rosso viene riconosciuto (prova del rosso dentro il guardiano).
   Uso: node interazioni-226.mjs   ·   CPM_SOLO_NODE=1 salta (C) · CPM_SOLO_BROWSER=1 solo (C)   ·   CPM_SEMI=13   ·   CPM_PARTITE=2 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const src = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = src.slice(src.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
const carica = (W) => Function('decideExecution', 'window', code + '\nreturn {crea:creaMotorePossesso,INT226};')(undefined, W);
const CFG = JSON.parse(fs.readFileSync(new URL('./fixtures/cfg-202-s12.json', import.meta.url)));
const SEMI = +(process.env.CPM_SEMI || 13);
const ATTACCO = new Set(['sotto_70', 'pari_75', 'eroe_marcato']), DIFESA = new Set(['misura_85', 'avanti_2', 'eroe_stanco']);
let fail = [];

/* ---------- (A) il motore sente la scelta ---------- */
function braccio(W, idx) {
  const { crea, INT226 } = carica(W);
  const T = { att: { tiri: 0, gol: 0, min: 0, n: 0 }, dif: { tiri: 0, gol: 0, min: 0, n: 0 }, schede: 0, partite: 0, golCasa: 0, tiriCasa: 0, perPartita: [] };
  for (let s = 0; s < CFG.length * SEMI; s++) {
    const c0 = CFG[s % CFG.length];
    const M = crea(Object.assign({}, c0, { occasioniV2: true, brainLive: false, fin202: null, seed: (((c0.seed >>> 0) ^ ((1 + Math.floor(s / CFG.length)) * 2654435761)) >>> 0) }));
    const B = 22; const fatte = []; let ultima = null; let lato = null; let tiri = 0, gol = 0, tiriTot = 0;
    const gioca = (m) => { for (let b = 0; b < B; b++) { const ev = M.tick({ min: Math.min(m, 90), dt: 1 / B, dec: true }) || [];
      for (const e of ev) { const l = (e.chi && e.chi.team) || e.per || e.lato; if (l !== 'home') continue; if (e.t === 'tiro') { tiriTot++; if (lato) tiri++; } if (e.t === 'gol' && lato) gol++; } } };
    for (let m = 1; m <= 93; m++) {
      if (m === 46) M.chiedi.riprendi({ centro: true, lato: 'away' });
      const G = M._S.conta.gol; const d = (G.home | 0) - (G.away | 0);
      const attDi = (dd) => (m >= 70 && dd <= 0) ? 1 : (m >= 60 && dd >= 2) ? -0.6 : (dd < 0 ? 0.4 : 0);/* come il live (src/15, atteggiamento dal punteggio) */
      M.chiedi.atteggiamento('home', attDi(d)); M.chiedi.atteggiamento('away', attDi(-d));
      const f = INT226.scegli({ mn: Math.min(m, 90), diff: d, energia: null, duelliP: 0, panchina: false, ingresso: 0, fatte, ultima });
      if (f) { fatte.push(f); ultima = Math.min(m, 90); T.schede++; M.chiedi.ordine226('home', INT226.att(f, idx));
        if (!lato) { lato = ATTACCO.has(f) ? 'att' : DIFESA.has(f) ? 'dif' : null; if (lato) { T[lato].n++; T[lato].min += (93 - m); } } }
      gioca(m);
    }
    if (lato) { T[lato].tiri += tiri; T[lato].gol += gol; }
    T.partite++; T.golCasa += M._S.conta.gol.home | 0; T.tiriCasa += tiriTot; T.perPartita.push(fatte.length);
  }
  const r = (o) => ({ schede: o.n, tiriAlMin: o.min ? +(o.tiri / o.min).toFixed(4) : 0, golAlMin: o.min ? +(o.gol / o.min).toFixed(4) : 0, tiri: o.tiri, gol: o.gol });
  return { partite: T.partite, schedeAPartita: +(T.schede / T.partite).toFixed(2), maxSchede: Math.max(...T.perPartita), golCasa: +(T.golCasa / T.partite).toFixed(3), tiriCasa: +(T.tiriCasa / T.partite).toFixed(2), att: r(T.att), dif: r(T.dif) };
}
const scarto = (a, b) => b ? (a - b) / b : 0;
if (!process.env.CPM_SOLO_BROWSER) {
const A = { seguo: braccio({}, 0), testa: braccio({}, 1), rossoSeguo: braccio({ __CPM_NO_INT226: true }, 0), rossoTesta: braccio({ __CPM_NO_INT226: true }, 1) };
const sA = scarto(A.seguo.att.tiriAlMin, A.testa.att.tiriAlMin), sD = scarto(A.seguo.dif.tiriAlMin, A.testa.dif.tiriAlMin);
const rA = scarto(A.rossoSeguo.att.tiriAlMin, A.rossoTesta.att.tiriAlMin), rD = scarto(A.rossoSeguo.dif.tiriAlMin, A.rossoTesta.dif.tiriAlMin);
const gA = scarto(A.seguo.att.golAlMin, A.testa.att.golAlMin), gD = scarto(A.seguo.dif.golAlMin, A.testa.dif.golAlMin);
console.log('(A) motore, ' + A.seguo.partite + ' partite per braccio');
for (const k of Object.keys(A)) console.log('   ' + k.padEnd(11) + JSON.stringify(A[k]));
console.log(`   scarto «seguo» contro «di testa mia» — tiri: attacco ${(100 * sA).toFixed(1)}% · difesa ${(100 * sD).toFixed(1)}% | gol: attacco ${(100 * gA).toFixed(1)}% · difesa ${(100 * gD).toFixed(1)}%`);
console.log(`   rosso (__CPM_NO_INT226) — tiri: attacco ${(100 * rA).toFixed(1)}% · difesa ${(100 * rD).toFixed(1)}%`);
const verdeA = A.seguo.partite >= 300 && A.seguo.maxSchede <= 3 && sA >= 0.10 && sD <= -0.10;
const rossoA = Math.abs(rA) < 0.03 && Math.abs(rD) < 0.03;
if (!verdeA) fail.push('A verde: effetto della scelta sotto soglia o troppe schede');
if (!rossoA) fail.push('A rosso: col sistema vecchio la scelta muove ancora il motore');

}
/* ---------- (B) panchina: il minuto d'ingresso ---------- */
if (!process.env.CPM_SOLO_BROWSER) { const { INT226 } = carica({}); let ok = 0, n = 0, dSum = 0, det = 0;
  for (let i = 0; i < 400; i++) { const base = 46 + (i * 7) % 37, mn = 20 + (i * 3) % Math.max(1, base - 24), seme = (i * 2654435761) >>> 0;
    const c0 = INT226.ingresso(base, 0, seme, mn), c1 = INT226.ingresso(base, 1, seme, mn), c1b = INT226.ingresso(base, 1, seme, mn);
    n++; if (c1 === c1b) det++; const d = base - c1; dSum += d;
    if (c0 === base && c1 <= base && c1 >= mn + 2 && (d >= 4 && d <= 10 || c1 === mn + 2)) ok++; }
  console.log(`(B) panchina: ${ok}/${n} casi corretti · anticipo medio «chiedo di entrare» ${(dSum / n).toFixed(1)}' · deterministico ${det}/${n}`);
  if (ok !== n || det !== n) fail.push('B panchina');
}

/* ---------- (C) partite vere ---------- */
if (!process.env.CPM_SOLO_NODE) {
  const N = +(process.env.CPM_PARTITE || 2), TETTO = +(process.env.CPM_TETTO_MS || 300000);
  const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const partita = async (i, rosso) => {
    const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
    const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = 'Guard226 ' + ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Galli', 'Conti'][i % 6] + i;
    await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_NO_SCHEDE259 = 1;/* [PO-259] le schede 226/234 vivono sotto il rosso del 259: questo guardiano le custodisce li' */ window.__CPM_SCMS681 = 1500; window.__CPM_INT226_IDX = o.idx; if (o.rosso) window.__CPM_NO_INT226 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save, rosso, idx: i % 2 });
    let out = { i, rosso, finita: false };
    try {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
      await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {});
      await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      await page.evaluate(() => window.__CPM_CAREER.playMatch());
      await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
      await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2260 + i * 41);
      const t1 = Date.now(); const motore = [];
      while (Date.now() - t1 < TETTO) { await sleep(700);
        const d = await page.evaluate(() => { let a = null; try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); a = M && M._S ? M._S.richieste.att226 : null; } catch (e) {} return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, ck: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null, a, n: ((window.__CPM_INT226 || {}).scelte || []).length }; });
        if (d.a && d.n) motore.push({ n: d.n, home: d.a.home });
        if (d.ph === 'ended' || d.ph === 'ceremony') { out.finita = true; break; } }
      const dati = await page.evaluate(() => ({ w: window.__CPM_INT226 || { schede: [], scelte: [] }, intx: (window.__CPM_INTX669 || []).map(x => ({ min: x.min, id: x.id })), score: window.__CPM_SCORE ? window.__CPM_SCORE() : null }));
      out = Object.assign(out, dati, { motore, errori: errs.slice(0, 3) });
    } catch (e) { out.errore = String(e.message).slice(0, 160); }
    await page.close(); return out;
  };
  const { INT226 } = carica({});
  const giudica = (p) => { const sch = p.w.schede || []; const vecchie = (p.intx || []).filter(x => !/^i226_/.test(x.id));
    const conFatto = sch.filter(s => { const f = INT226.fatto(s.fatto); if (!f) return false; if (/^panca_/.test(s.fatto)) return s.panchina;
      const c = { mn: s.min, diff: s.diff, energia: s.energia, duelliP: s.duelliP, panchina: !!s.panchina, ingresso: 99 }; try { return !!f.quando(c); } catch (e) { return false; } });
    const ult = (p.w.scelte || []).filter(x => x.att != null).slice(-1)[0]; const arr = ult ? (p.motore || []).filter(m => m.n === (p.w.scelte || []).length).slice(-1)[0] : null;
    const arriva = !ult || (arr && Math.abs(arr.home - ult.att) < 1e-9);
    return { schede: sch.length, conFatto: conFatto.length, vecchie: vecchie.length, scelte: (p.w.scelte || []).length, arriva, fatti: sch.map(s => s.min + "'" + s.fatto).join(' '), scelteTxt: (p.w.scelte || []).map(s => s.id + '#' + s.idx + (s.att != null ? ' att' + s.att : '') + (s.ingresso != null ? ' in' + s.ingressoPrima + '>' + s.ingresso : '')).join(' ') }; };
  const V = [], R = [];
  for (let i = 0; i < N; i++) { const p = await partita(i, false); const g = giudica(p); V.push(g);
    console.log(`(C) verde p${i} ${p.finita ? 'finita' : 'NON FINITA'} ${JSON.stringify(p.score)} schede=${g.schede} conFatto=${g.conFatto} vecchie=${g.vecchie} scelte=${g.scelte} motore=${g.arriva ? 'ok' : 'NO'} | ${g.fatti} | ${g.scelteTxt}${p.errori && p.errori.length ? ' ERR ' + p.errori[0] : ''}${p.errore ? ' ERRORE ' + p.errore : ''}`);
    if (!p.finita || (p.errori && p.errori.length) || p.errore || g.schede > 3 || g.conFatto !== g.schede || g.vecchie > 0 || !g.arriva) fail.push('C verde p' + i); }
  for (let i = 0; i < N; i++) { const p = await partita(i, true); const g = giudica(p); R.push(g);
    console.log(`(C) rosso p${i} ${p.finita ? 'finita' : 'NON FINITA'} schede nuove=${g.schede} schede a orologio=${g.vecchie}`); }
  if (!R.some(g => g.vecchie > 0) || R.some(g => g.schede > 0)) fail.push('C rosso: il sistema vecchio non e\' riconoscibile');
  await b.close(); srv.close();
}
console.log(fail.length ? '❌ ROSSO — ' + fail.join(' · ') : '✅ VERDE — interazioni nate dai fatti del motore, effetto misurato, prova del rosso riconosciuta');
process.exit(fail.length ? 1 : 0);
