#!/usr/bin/env node
/* [PO-234, 14/10 «Segui indicazioni, non ordine e dai almeno 3 opzioni!»] GUARDIANO DELLE SCHEDE DEL MISTER. Rosso __CPM_NO_234.
   Tre parti:
   (A) node, testi: le schede SCHEDE226 (src/15) COME LE VEDE il giocatore (schedaVista234): ogni scheda ha almeno 3 opzioni, nessuna
       parola «ordine/ordini» nel testo della scheda, nelle etichette e negli esiti; la prima opzione delle schede del mister dice
       «indicazioni». ROSSO: la scheda torna quella di prima (2 opzioni, «Seguo l'ordine") e la parte deve accorgersene.
   (B) node, banco del motore (stesse 24 configurazioni S12 e stessi semi di interazioni-226): un braccio per opzione (0/1/2), tiri e
       gol della squadra dell'eroe DOPO la scheda, separati per schede d'attacco e di difesa. VERDE: i tre bracci sono DIVERSI e
       ordinati come gli atteggiamenti dichiarati (INT226.FATTI[].att): fra due opzioni vicine almeno il 3% di tiri al minuto.
       Panchina: le tre opzioni danno tre minuti d'ingresso diversi (0 = mister, 2 = 1-3' prima, 1 = 4-10' prima) su 400 casi.
       ROSSO: la terza opzione non sposta niente (tiri identici al braccio senza effetto, minuto = quello del mister).
   (C) browser, una partita vera (save-194 come interazioni-226; la scheda vive sulla vista 2D, GLB spento salvo CPM_GLB=1): la prima scheda del mister mostra >= 3 bottoni e nessuna
       parola «ordine»; il timer sceglie la terza opzione e il motore la riceve. Foto in out/schede-234/. ROSSO: 2 bottoni.
   Uso: node schede-234.mjs · CPM_SOLO_NODE=1 salta (C) · CPM_SOLO_BROWSER=1 salta (B) · CPM_SEMI=13 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const fail = [];
const s15 = fs.readFileSync(path.join(ROOT, 'src', '15-live-match.jsx'), 'utf8');
const pezzo = s15.slice(s15.indexOf('const SCHEDE226={'), s15.indexOf('const INTX669=['));
const caricaSchede = (W) => Function('window', pezzo + '\nreturn {SCHEDE226,schedaVista234};')(W);
const PAROLA = /\bordin[ei]\b/i;
const C = { mn: 72, diff: -1, eroe: 'Vairo', duelliP: 3 };

/* ---------- (A) testi ---------- */
function testi(W) {
  const { SCHEDE226, schedaVista234 } = caricaSchede(W);
  const r = { schede: 0, min3: 0, conOrdine: [], senzaIndicazioni: [] };
  for (const [id, S0] of Object.entries(SCHEDE226)) {
    const S = schedaVista234(S0, W); r.schede++;
    if ((S.sc || []).length >= 3) r.min3++;
    const pezzi = [S.txt(C), ...S.sc.flatMap(o => [o.et, o.es(C)])];
    for (const t of pezzi) if (PAROLA.test(t)) r.conOrdine.push(id + ': ' + t.slice(0, 60));
    if (S.ordine && !/indicazion/i.test(S.sc[0].et)) r.senzaIndicazioni.push(id);
  }
  return r;
}
const tV = testi({}), tR = testi({ __CPM_NO_234: 1 });
console.log(`(A) testi verde: ${tV.min3}/${tV.schede} schede con >=3 opzioni · «ordine» ${tV.conOrdine.length} · prima opzione senza «indicazioni» ${tV.senzaIndicazioni.length}`);
console.log(`(A) testi rosso: ${tR.min3}/${tR.schede} schede con >=3 opzioni · «ordine» ${tR.conOrdine.length}`);
if (tV.min3 !== tV.schede || tV.conOrdine.length || tV.senzaIndicazioni.length) fail.push('A verde: ' + JSON.stringify(tV.conOrdine.concat(tV.senzaIndicazioni)).slice(0, 200));
if (tR.min3 === tR.schede || !tR.conOrdine.length) fail.push('A rosso non riconosciuto');

/* ---------- (B) banco del motore ---------- */
const s14 = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = s14.slice(s14.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
const carica = (W) => Function('decideExecution', 'window', code + '\nreturn {crea:creaMotorePossesso,INT226};')(undefined, W);
const CFG = JSON.parse(fs.readFileSync(new URL('./fixtures/cfg-202-s12.json', import.meta.url)));
const SEMI = +(process.env.CPM_SEMI || 13);
const ATTACCO = new Set(['sotto_70', 'pari_75', 'eroe_marcato']), DIFESA = new Set(['misura_85', 'avanti_2', 'eroe_stanco']);
function braccio(W, idx, senzaEffetto) {
  const { crea, INT226 } = carica(W);
  const T = { att: { tiri: 0, gol: 0, min: 0, n: 0 }, dif: { tiri: 0, gol: 0, min: 0, n: 0 }, partite: 0 };
  for (let s = 0; s < CFG.length * SEMI; s++) {
    const c0 = CFG[s % CFG.length];
    const M = crea(Object.assign({}, c0, { occasioniV2: true, brainLive: false, fin202: null, seed: (((c0.seed >>> 0) ^ ((1 + Math.floor(s / CFG.length)) * 2654435761)) >>> 0) }));
    const B = 22; const fatte = []; let ultima = null; let lato = null; let tiri = 0, gol = 0;
    const gioca = (m) => { for (let b = 0; b < B; b++) { const ev = M.tick({ min: Math.min(m, 90), dt: 1 / B, dec: true }) || [];
      for (const e of ev) { const l = (e.chi && e.chi.team) || e.per || e.lato; if (l !== 'home') continue; if (e.t === 'tiro' && lato) tiri++; if (e.t === 'gol' && lato) gol++; } } };
    for (let m = 1; m <= 93; m++) {
      if (m === 46) M.chiedi.riprendi({ centro: true, lato: 'away' });
      const G = M._S.conta.gol; const d = (G.home | 0) - (G.away | 0);
      const attDi = (dd) => (m >= 70 && dd <= 0) ? 1 : (m >= 60 && dd >= 2) ? -0.6 : (dd < 0 ? 0.4 : 0);
      M.chiedi.atteggiamento('home', attDi(d)); M.chiedi.atteggiamento('away', attDi(-d));
      const f = INT226.scegli({ mn: Math.min(m, 90), diff: d, energia: null, duelliP: 0, panchina: false, ingresso: 0, fatte, ultima });
      if (f) { fatte.push(f); ultima = Math.min(m, 90); if (!senzaEffetto) M.chiedi.ordine226('home', INT226.att(f, idx));
        if (!lato) { lato = ATTACCO.has(f) ? 'att' : DIFESA.has(f) ? 'dif' : null; if (lato) { T[lato].n++; T[lato].min += (93 - m); } } }
      gioca(m);
    }
    if (lato) { T[lato].tiri += tiri; T[lato].gol += gol; }
    T.partite++;
  }
  const r = (o) => ({ schede: o.n, tiriAlMin: o.min ? +(o.tiri / o.min).toFixed(4) : 0, golAlMin: o.min ? +(o.gol / o.min).toFixed(4) : 0 });
  return { partite: T.partite, att: r(T.att), dif: r(T.dif) };
}
const pct = (a, b) => b ? (100 * (a - b) / b) : 0;
const { INT226 } = carica({});
const famAtt = (fam, idx) => { const ids = [...(fam === 'att' ? ATTACCO : DIFESA)].filter(id => id !== 'eroe_marcato' && id !== 'eroe_stanco');
  return ids.reduce((a, id) => a + INT226.att(id, idx), 0) / ids.length; };/* il banco Node non apre le schede eroe_* (energia e duelli non esistono qui) */
const ordinati = (B3, fam) => { const o = [0, 1, 2].sort((a, b) => famAtt(fam, a) - famAtt(fam, b));
  let ok = true, minSep = 1e9; for (let k = 1; k < 3; k++) { const sep = pct(B3[o[k]][fam].tiriAlMin, B3[o[k - 1]][fam].tiriAlMin); minSep = Math.min(minSep, sep); if (sep < 3) ok = false; }
  return { ok, minSep: +minSep.toFixed(1), ordine: o.join('<') }; };
if (!process.env.CPM_SOLO_BROWSER) {
const B3 = [braccio({}, 0), braccio({}, 1), braccio({}, 2)];
const neutro = braccio({}, 0, true), rosso2 = braccio({ __CPM_NO_234: 1 }, 2);
console.log('(B) motore, ' + B3[0].partite + ' partite per braccio (stessi semi)');
['«seguo le indicazioni» (0)', '«di testa mia» (1)', '«via di mezzo» (2)'].forEach((n, i) => console.log('   ' + n.padEnd(28) + JSON.stringify(B3[i])));
console.log('   senza effetto'.padEnd(31) + JSON.stringify(neutro));
console.log('   rosso, opzione 2'.padEnd(31) + JSON.stringify(rosso2));
const oA = ordinati(B3, 'att'), oD = ordinati(B3, 'dif');
console.log(`   attacco: ordine atteggiamenti ${oA.ordine} · separazione minima ${oA.minSep}% di tiri al minuto · gol 0/1/2 ${B3.map(b => b.att.golAlMin).join(' / ')}`);
console.log(`   difesa : ordine atteggiamenti ${oD.ordine} · separazione minima ${oD.minSep}% di tiri al minuto · gol 0/1/2 ${B3.map(b => b.dif.golAlMin).join(' / ')}`);
if (!oA.ok || !oD.ok) fail.push('B verde: le tre opzioni non hanno effetti distinti e ordinati');
const rossoUguale = rosso2.att.tiriAlMin === neutro.att.tiriAlMin && rosso2.dif.tiriAlMin === neutro.dif.tiriAlMin;
console.log(`   rosso: opzione 2 ${rossoUguale ? 'identica al braccio senza effetto (riconosciuto)' : 'DIVERSA dal braccio senza effetto'}`);
if (!rossoUguale) fail.push('B rosso non riconosciuto');
{ let ok = 0, det = 0, n = 0; const W0 = carica({}).INT226, WR = carica({ __CPM_NO_234: 1 }).INT226; let rossoOk = 0;
  for (let i = 0; i < 400; i++) { const base = 46 + (i * 7) % 37, mn = 20 + (i * 3) % Math.max(1, base - 24), seme = (i * 2654435761) >>> 0;
    const c0 = W0.ingresso(base, 0, seme, mn), c1 = W0.ingresso(base, 1, seme, mn), c2 = W0.ingresso(base, 2, seme, mn); n++;
    if (c2 === W0.ingresso(base, 2, seme, mn)) det++;
    const d2 = base - c2, libero = (base - 10) >= mn + 2;/* se il tetto «mai prima di due minuti da adesso» non schiaccia le opzioni */
    if (c0 === base && d2 >= 1 && d2 <= 3 && (!libero || (c1 < c2 && c2 < c0)) || (c2 === mn + 2 && c2 <= base)) ok++;
    if (WR.ingresso(base, 2, seme, mn) === base) rossoOk++; }
  console.log(`(B) panchina: ${ok}/${n} casi con tre minuti d'ingresso coerenti · deterministico ${det}/${n} · rosso (minuto del mister) ${rossoOk}/${n}`);
  if (ok !== n || det !== n) fail.push('B panchina'); if (rossoOk !== n) fail.push('B panchina rosso'); }
}

/* ---------- (C) partita vera ---------- */
if (!process.env.CPM_SOLO_NODE) {
  const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
  const OUT = path.join(ROOT, 'tests', 'visual', 'out', 'schede-234'); fs.mkdirSync(OUT, { recursive: true });
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const partita = async (rosso, i) => {
    const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
    const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    const save = JSON.parse(JSON.stringify(SAVE)); save.player.name = 'Guard234 ' + ['Rossi', 'Bianchi', 'Verdi'][i % 3] + i;
    await page.addInitScript((o) => { window.__CPM_GLB = !!o.glb; window.__CPM_PRESENT = 1; window.__CPM_SCMS681 = 2500; window.__CPM_INT226_IDX = 2; if (o.rosso) window.__CPM_NO_234 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save, rosso, glb: !!process.env.CPM_GLB });
    const out = { rosso, bottoni: null, testo: '', foto: null, scelte: [], errori: errs };
    try {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
      await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
      await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {});
      await sleep(2500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
      await page.evaluate(() => window.__CPM_CAREER.playMatch());
      await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
      await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 2340 + i * 41);
      const t1 = Date.now();
      while (Date.now() - t1 < 300000) { await sleep(250);
        const d = await page.evaluate(() => { const p = document.querySelector('[data-cpm="pop919"]'); const W = window.__CPM_INT226 || {};
          const ul = (W.schede || []).slice(-1)[0];
          return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, pop: p ? { n: p.querySelectorAll('button').length, t: p.innerText } : null, i226: !!(ul && p) }; });
        if (d.pop && d.i226 && out.bottoni == null && /mister/i.test(d.pop.t)) { out.bottoni = d.pop.n; out.testo = d.pop.t;
          out.foto = path.join(OUT, (rosso ? 'rosso' : 'verde') + '-scheda.png'); await page.screenshot({ path: out.foto }); }
        if (out.bottoni != null) { const sc = await page.evaluate(() => ((window.__CPM_INT226 || {}).scelte || []).slice()); if (sc.length) { out.scelte = sc; break; } }
        if (d.ph === 'ended' || d.ph === 'ceremony') break; }
    } catch (e) { out.errore = String(e.message).slice(0, 160); }
    await page.close(); return out;
  };
  let v = null; for (let i = 0; i < 3 && !(v && v.bottoni != null); i++) v = await partita(false, i);
  let r = null; for (let i = 0; i < 3 && !(r && r.bottoni != null); i++) r = await partita(true, i);
  const sc = (v.scelte || [])[0] || {};
  console.log(`(C) verde: bottoni ${v.bottoni} · «ordine» ${PAROLA.test(v.testo) ? 'SI' : 'no'} · scelta ${JSON.stringify(sc)} · foto ${v.foto}${v.errori.length ? ' ERR ' + v.errori[0] : ''}${v.errore ? ' ERRORE ' + v.errore : ''}`);
  console.log(`(C) rosso: bottoni ${r.bottoni} · «ordine» ${PAROLA.test(r.testo) ? 'si' : 'no'} · foto ${r.foto}`);
  const attesa = sc.id ? (/^panca_/.test(sc.id) ? sc.ingresso != null : sc.att === INT226.att(sc.id, 2)) : false;
  if (v.bottoni == null || v.bottoni < 3 || PAROLA.test(v.testo) || sc.idx !== 2 || !attesa || v.errori.length) fail.push('C verde');
  if (r.bottoni == null || r.bottoni >= 3) fail.push('C rosso non riconosciuto');
  await b.close(); srv.close();
}
console.log(fail.length ? '❌ ROSSO — ' + fail.join(' · ') : '✅ VERDE — schede con almeno 3 opzioni, lessico «indicazioni», effetti distinti sul motore, prova del rosso riconosciuta');
process.exit(fail.length ? 1 : 0);
