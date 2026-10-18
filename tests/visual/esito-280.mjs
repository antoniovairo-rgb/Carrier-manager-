#!/usr/bin/env node
/* [PO-280, giro 57] GUARDIANO «L'ESITO DELLA SCELTA E' VERO FINO AL FISCHIO». Rosso __CPM_NO_ESITO280 (= comportamento 7.999.171).
   Collaudo PO (Stag. 13 G. 21, FC Haringey 1-1 FC Merseyside): «La tua scelta al 82': «Teniamo palla nella loro metà» → nessun tiro
   concesso. Esito non vero, hanno pareggiato!». Il riepilogo di fine gara mostrava la riga breve del racconto detto 5' dopo la scelta.
   (A) node, banco del motore vero (24 configurazioni S12 x CPM_SEMI, default 4 = 96 partite): a ogni scheda si applica un'opzione (a rotazione),
       si registrano il fotogramma alla scelta, il racconto a +5' (quello di sempre) e il fotogramma al fischio. Per ogni scelta si giudica
       con INT259.smentito se la riga del riepilogo contraddice i fatti scelta→fischio (gol fatti o subiti non detti, tiri dichiarati
       diversi). ROSSO (riga a +5'): smentite > 0. VERDE (INT259.finale): smentite = 0. Si stampa a parte il sottoinsieme «scelta nel finale» (>=70').
   (B) browser, partite vere di carriera con autoplay (CPM_PARTITE per braccio, default 2, i due bracci in parallelo): la riga del riepilogo
       nel DOM e' quella calcolata al fischio (verde) / quella a +5' (rosso). Il «Tabellino della gara» (colonne «tua squadra — avversari»,
       7.999.10) lo giudica il guardiano tabellino-lati, in casa e in trasferta.
   Uso: node esito-280.mjs · CPM_SOLO_NODE=1 · CPM_SOLO_BROWSER=1 · CPM_SEMI=4 · CPM_PARTITE=2 · CPM_BRACCI=verde,rosso */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const fail = [];
const s14 = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = s14.slice(s14.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
const carica = (W) => Function('decideExecution', 'window', code + '\nreturn {crea:creaMotorePossesso,INT259};')(undefined, W);

/* ---------- (A) banco del motore ---------- */
if (!process.env.CPM_SOLO_BROWSER) {
  const CFG = JSON.parse(fs.readFileSync(new URL('./fixtures/cfg-202-s12.json', import.meta.url)));
  const SEMI = +(process.env.CPM_SEMI || 4);
  const { crea, INT259 } = carica({});
  const RF = carica({ __CPM_NO_FIN280: 1 }).INT259; /* rosso della decisione PO 17/10: tutte le finestre al fischio */
  const D2 = { partite2: 0, doppiV: 0, doppiR: 0, smentiteR: 0, esempi: [] };
  if (!INT259.finale || !INT259.smentito) { console.log('❌ INT259.finale/smentito assenti'); process.exit(1); }
  const T = { partite: 0, conScelta: 0, conSceltaFinale: 0, scelte: 0, finale: 0, rosso: 0, verde: 0, rossoF: 0, verdeF: 0, esempi: [], incoerenti: 0, classi: {}, finaleGolSubito: 0 };
  for (let s = 0; s < CFG.length * SEMI; s++) {
    const c0 = CFG[s % CFG.length];
    const M = crea(Object.assign({}, c0, { occasioniV2: true, brainLive: false, fin202: null, seed: (((c0.seed >>> 0) ^ ((1 + Math.floor(s / CFG.length)) * 2654435761)) >>> 0) }));
    const B = 22; const fatte = []; const aperte = []; const esp = { n: 0, m: null }, espL = { n: 0, m: null }, rig = { n: 0, m: null };
    for (let m = 1; m <= 93; m++) {
      if (m === 46) M.chiedi.riprendi({ centro: true, lato: 'away' });
      const G = M._S.conta.gol; const d = (G.home | 0) - (G.away | 0);
      const attDi = (dd) => (m >= 70 && dd <= 0) ? 1 : (m >= 60 && dd >= 2) ? -0.6 : (dd < 0 ? 0.4 : 0);
      M.chiedi.atteggiamento('home', attDi(d)); M.chiedi.atteggiamento('away', attDi(-d));
      const tb = M.tabellino();
      if ((tb.home.espulsioni | 0) > esp.n) { esp.n = tb.home.espulsioni | 0; esp.m = m; } if ((tb.away.espulsioni | 0) > espL.n) { espL.n = tb.away.espulsioni | 0; espL.m = m; } if ((tb.away.rigori | 0) > rig.n) { rig.n = tb.away.rigori | 0; rig.m = m; }
      const ult = aperte.length ? aperte[aperte.length - 1] : null;
      const f = (!ult || ult.detto) ? INT259.scegli({ mn: Math.min(m, 90), diff: d, energia: 60, panchina: false, ingresso: 0, fatte, ultima: ult ? ult.m0 : null, espNoi: esp.n, espNoiMin: esp.m, espLoro: espL.n, espLoroMin: espL.m, rigContro: rig.n, rigControMin: rig.m }) : null;
      if (f) { fatte.push(f); const idx = (s + fatte.length) % 3; INT259.applica(M, f, idx, m); const ft = INT259.foto(M); aperte.push({ fatto: f, idx, m0: m, foto: ft, occ0: ft.occ, detto: false }); }
      for (const a of aperte) if (!a.detto && m >= a.m0 + INT259.ATTESA) { a.detto = true; const dopo = INT259.foto(M);
        const r = { fatto: a.fatto, idx: a.idx, m0: a.m0, m1: m, prima: a.foto, dopo, occ: (dopo.occ != null && dopo.occ >= a.m0 && dopo.occ !== a.occ0) ? dopo.occ : null, eroe: 'Vairo' };
        a.es5 = INT259.racconta(r); a.occ = r.occ; if (!INT259.verifica(r, a.es5)) T.incoerenti++; }
      for (let b = 0; b < B; b++) M.tick({ min: Math.min(m, 90), dt: 1 / B, dec: true });
    }
    T.partite++; if (aperte.length) T.conScelta++; if (aperte.some(a => a.m0 >= 70)) T.conSceltaFinale++;
    const fF = INT259.foto(M);
    /* [PO-280 bis] «la prima finisce alla seconda»: gol contati da piu' scelte = somma dei gol nelle finestre - gol dalla prima scelta al fischio */
    const W = INT259.finestre(aperte, fF, 93), WR = RF.finestre(aperte, fF, 93);
    if (aperte.length >= 2) { D2.partite2++; const g = (w, a) => ((w.dopo.gNoi | 0) - (a.foto.gNoi | 0)) + ((w.dopo.gLoro | 0) - (a.foto.gLoro | 0));
      const tot = ((fF.gNoi | 0) + (fF.gLoro | 0)) - ((aperte[0].foto.gNoi | 0) + (aperte[0].foto.gLoro | 0));
      const sv = aperte.reduce((t, a, i) => t + g(W[i], a), 0), sr = aperte.reduce((t, a, i) => t + g(WR[i], a), 0);
      D2.doppiV += Math.max(0, sv - tot); D2.doppiR += Math.max(0, sr - tot);
      if (sr > tot && D2.esempi.length < 3) D2.esempi.push(aperte.map((a, i) => `${a.m0}' «${RF.finale(Object.assign({ fatto: a.fatto, idx: a.idx, m0: a.m0, prima: a.foto, eroe: 'Vairo' }, WR[i])).breve}» → ora «${INT259.finale(Object.assign({ fatto: a.fatto, idx: a.idx, m0: a.m0, prima: a.foto, eroe: 'Vairo' }, W[i])).breve}»`).join(' · ')); }
    for (const [ia, a] of aperte.entries()) {
      const r = Object.assign({ fatto: a.fatto, idx: a.idx, m0: a.m0, prima: a.foto, eroe: 'Vairo' }, W[ia]);
      const vecchia = a.es5 || { k: 'nessuno', n: 0, breve: "non c'è stato il tempo di vederne l'effetto" };
      const nuova = INT259.finale(r);
      const sR = INT259.smentito(r, vecchia), sV = INT259.smentito(r, nuova); const fin = a.m0 >= 70;
      T.scelte++; if (fin) T.finale++; if (sR) { T.rosso++; if (fin) T.rossoF++; const dd = (k) => (fF[k] | 0) - (a.foto[k] | 0); const cl = (dd('gNoi') > 0 || dd('gLoro') > 0) && !/gol/i.test(vecchia.breve) ? 'golTaciuti' : (dd('gLoro') > 0 ? 'golSubitoDopoHaPagato' : 'numeroDiverso'); T.classi[cl] = (T.classi[cl] || 0) + 1; if (fin && dd('gLoro') > 0) T.finaleGolSubito++; } if (sV) { T.verde++; if (fin) T.verdeF++; }
      if (sR && T.esempi.length < 6) { const dd = (k) => (fF[k] | 0) - (a.foto[k] | 0); T.esempi.push(`${a.m0}' «${INT259.opz(a.fatto, a.idx).et}» +5': «${vecchia.breve}» · al fischio: gol ${dd('gNoi')}-${dd('gLoro')}, tiri ${dd('tiriNoi')}-${dd('tiriLoro')} → «${nuova.breve}»`); }
    }
  }
  console.log(`(A) banco: ${T.partite} partite · con scelta ${T.conScelta} · con scelta nel finale (>=70') ${T.conSceltaFinale} · scelte ${T.scelte} (nel finale ${T.finale})`);
  console.log(`(A) riga del riepilogo smentita dai fatti scelta→fischio — ROSSO (riga a +5'): ${T.rosso}/${T.scelte} (nel finale ${T.rossoF}/${T.finale}) · VERDE (INT259.finale): ${T.verde}/${T.scelte} (nel finale ${T.verdeF}/${T.finale})`);
  console.log(`(A) classi delle smentite (rosso): ${JSON.stringify(T.classi)} · scelte nel finale con gol subito dopo e riga che non lo dice: ${T.finaleGolSubito}`);
  console.log(`(A) racconto a +5' coerente coi suoi 5' (comportamento approvato, invariato): incoerenti ${T.incoerenti}`);
  for (const e of T.esempi) console.log('    esempio rosso: ' + e);
  if (T.conSceltaFinale < 30) fail.push(`A: meno di 30 partite con scelta nel finale (${T.conSceltaFinale}): alzare CPM_SEMI`);
  console.log(`(A) due scelte nella stessa partita: ${D2.partite2} partite · gol contati da due scelte — VERDE (finestra fino alla scelta successiva): ${D2.doppiV} · ROSSO __CPM_NO_FIN280 (tutte al fischio): ${D2.doppiR}`);
  for (const e of D2.esempi) console.log('    esempio doppio (rosso → verde): ' + e);
  if (D2.partite2 < 10) fail.push(`A: meno di 10 partite con due scelte (${D2.partite2})`);
  if (D2.doppiV !== 0) fail.push(`A verde: ${D2.doppiV} gol contati da due scelte`);
  if (!(D2.doppiR > 0)) fail.push('A rosso NO_FIN280 cieco: nessun gol contato due volte');
  if (RF.attivoFin280() !== false) fail.push('A: interruttore __CPM_NO_FIN280 non riconosciuto');
  if (T.verde !== 0) fail.push(`A verde: ${T.verde} esiti del riepilogo smentiti`);
  if (!(T.rosso > 0)) fail.push('A rosso cieco: nessuna smentita con la riga a +5\'');
  if (T.incoerenti) fail.push('A: racconto a +5\' incoerente');
  const R = carica({ __CPM_NO_ESITO280: 1 }).INT259; if (R.attivo280() !== false) fail.push('A: interruttore rosso non riconosciuto');
}

/* ---------- (B) partite vere ---------- */
if (!process.env.CPM_SOLO_NODE) {
  const N = +(process.env.CPM_PARTITE || 2), PAR = +(process.env.CPM_PAR || 2), TETTO = +(process.env.CPM_TETTO_MS || 420000);
  const BRACCI = (process.env.CPM_BRACCI || 'verde,rosso').split(',');
  const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
  const NOMI = ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Galli', 'Conti', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Costa'];
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const partita = async (i, rosso) => {
    const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
    const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = 'Prova ' + NOMI[i % NOMI.length] + ' ' + (i + 280);
    await page.addInitScript((o) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_SCMS681 = 1500; window.__CPM_INT226_IDX = o.idx; if (o.rosso) window.__CPM_NO_ESITO280 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save, rosso, idx: i % 3 });
    let out = { i, rosso, finita: false };
    try {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
      await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }).catch(() => {});
      await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      await page.evaluate(() => window.__CPM_CAREER.playMatch());
      await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 90000 }).catch(() => {});
      await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2800 + i * 41);
      const t1 = Date.now();
      while (Date.now() - t1 < TETTO) { await sleep(500); const ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null);
        if (ph === 'ended') { out.finita = true; break; }
        if (ph === 'ceremony') { out.finita = true; await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'ended', null, { timeout: 20000 }).catch(() => {}); break; } }
      await sleep(1000);
      Object.assign(out, await page.evaluate(() => {
        const riep = (() => { const el = document.querySelector('[data-cpm="riep259"]'); return el ? el.innerText : null; })();
        const S = window.__CPM_S259 || { racconti: [] }; const E = window.__CPM_ESITO280 || {};
        const tab = (() => { const h = document.querySelector('[data-cpm="tab280"]'); if (!h) return null; const box = h.parentElement; const r1 = h.nextElementSibling;
          const nums = r1 ? [...r1.querySelectorAll('.cpm-num')].map(e => e.innerText.trim()) : [];
          return { eroe: h.getAttribute('data-eroe'), sx: h.querySelector('[data-cpm="tab280-sx"]').innerText, dx: h.querySelector('[data-cpm="tab280-dx"]').innerText, riga: r1 ? r1.innerText.replace(/\s+/g, ' ') : null, gol: nums }; })();
        return { tab, riep, racconti: S.racconti.map(r => ({ m0: r.m0, breve: r.esito && r.esito.breve })), esito280: Object.values(E).map(x => ({ m0: x.r.m0, breve: x.finale.breve, d: { gN: (x.r.dopo.gNoi | 0) - (x.r.prima.gNoi | 0), gL: (x.r.dopo.gLoro | 0) - (x.r.prima.gLoro | 0), tL: (x.r.dopo.tiriLoro | 0) - (x.r.prima.tiriLoro | 0) } })),
          score: window.__CPM_SCORE ? window.__CPM_SCORE() : null };
      }));
      out.errori = errs.slice(0, 3);
    } catch (e) { out.errore = String(e.message).slice(0, 160); }
    await page.close(); return out;
  };
  await Promise.all(BRACCI.map(async (br) => {
    const rosso = br === 'rosso'; const res = new Array(N); let next = 0;
    const lav = async () => { while (next < N) { const i = next++; res[i] = await partita(i, rosso); const p = res[i];
      console.log(`(B) ${br} p${i} ${p.finita ? 'finita' : 'NON FINITA'} ${JSON.stringify(p.score)} riep=${JSON.stringify(p.riep)} racconti+5=${JSON.stringify(p.racconti)} fischio=${JSON.stringify(p.esito280)}${p.errori && p.errori.length ? ' ERR ' + p.errori[0] : ''}${p.errore ? ' ERRORE ' + p.errore : ''}`); } };
    await Promise.all(Array.from({ length: Math.min(PAR, N) }, lav));
    const conRiep = res.filter(p => p.riep);
    if (!rosso) {
      if (res.some(p => !p.finita || (p.errori && p.errori.length) || p.errore)) fail.push('B verde: partite non finite o errori');
      /* ogni riga del riepilogo e' quella del fischio */
      const ok = conRiep.filter(p => p.esito280.length && p.esito280.every(e => p.riep.includes(e.breve))).length;
      console.log(`(B) verde: riepilogo dal fischio ${ok}/${conRiep.length}`); if (ok !== conRiep.length) fail.push('B verde: riga del riepilogo non calcolata al fischio');
      /* [PO-280 bis] tabellino della gara nel DOM: la colonna dichiarata dell'eroe porta i gol dell'eroe (score.home del motore) */
      const tabOk = res.filter(p => p.tab && p.score && /^Gol/.test(String(p.tab.riga || '').replace(/^\d+\s*/, '')) && +p.tab.gol[p.tab.eroe === 'sx' ? 0 : 1] === p.score.home && +p.tab.gol[p.tab.eroe === 'sx' ? 1 : 0] === p.score.away).length;
      console.log(`(B) verde: tabellino della gara con i gol sotto la squadra giusta ${tabOk}/${res.length} · ${res.map(p => p.tab ? `${p.tab.sx} [${p.tab.gol.join('-')}] ${p.tab.dx} eroe=${p.tab.eroe}` : 'assente').join(' | ')}`);
      if (tabOk !== res.length) fail.push('B verde: tabellino della gara con gol attribuiti male o assente');
      if (conRiep.length === 0) console.log('(B) ⚠️ nessuna partita con scelta: il ramo DOM non e\' giudicato (il banco A resta il giudice)');
    } else {
      const vec = conRiep.filter(p => p.racconti.length && p.racconti.every(r => p.riep.includes(r.breve)) && !p.riep.includes('fino al fischio')).length;
      console.log(`(B) rosso: riepilogo con la riga a +5' ${vec}/${conRiep.length}`); if (!conRiep.length || vec !== conRiep.length) fail.push('B rosso non riconosciuto');
    }
  }));
  await b.close(); srv.close();
}
console.log(fail.length ? '❌ ROSSO — ' + fail.join(' · ') : '✅ VERDE — l\'esito della scelta nel riepilogo e\' vero dal minuto della scelta al fischio; prova del rosso riconosciuta');
process.exit(fail.length ? 1 : 0);
