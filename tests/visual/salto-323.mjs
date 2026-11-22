#!/usr/bin/env node
/* [giro 323 · PO-356 proposta B] GUARDIANO salto-323 — il salto a gennaio per merito in Primavera.
   Giudica sul gioco vero (?cpmtest=1):
   A) LA REGOLA PURA (__CPM_CAREER.salto323 = saltoGennaio323, src/08): deterministica per seme · nessun Math.random
      (Math.random sostituito da una funzione che lancia durante la chiamata) · Indice basso → nessun salto · Indice alto →
      offerta esterna (senza esordio) · con un esordio → promozione nel club madre mostrata per prima, l'esterna in coda ·
      settimana 22 solo con esordio · fuori finestra e da professionista → nulla · mai un prestito.
   B) IL FLUSSO VERO alla chiusura della settimana 19 (Avanza, doAdvanceWeek): Indice basso con Math.random()=0 → nessuna
      offerta e nessuna saga (il vecchio dado avrebbe prodotto il mercato) · Indice alto → l'offerta si apre, accettata porta
      tra i professionisti con la riga di diario «Promosso a gennaio», la Primavera contata a parte (storia giovanile,
      primavera323) e nessun premio Primavera assegnato a fine stagione.
   C) TRI-PATH: i tre percorsi settimana chiamano lo stesso chokepoint applySaltoGennaio323.
   Braccio rosso: CPM_ROSSO323=1 accende __CPM_NO_G323 (= 7.999.202) → il guardiano DEVE uscire 1.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node salto-323.mjs */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
import fs from 'fs';

const ROSSO = process.env.CPM_ROSSO323 === '1';
const fails = [], oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };

function mh(n, { rating = 6.8, goals = 0, assists = 0 } = {}) {
  return Array.from({ length: n }, (_, i) => ({ season: 1, week: i + 2, opponent: 'FC Prova ' + i, homeScore: 1, awayScore: 0, goals, assists, rating, won: true, drew: false, simulated: true }));
}
function savePlayer(over = {}) {
  const s = over.ovr || 70;
  return { name: 'Guardiano Salto', nation: 'Italia', avatarId: 0, proStatus: 'u18', season: 1, week: 19, weekLived: true, age: 17, ovr: s, tutorialDone: true, position: 'Attaccante',
    campDone: true, presidentModalSeason: 1, jerseyNumSeason: 1, drawSeen: 1, mercatoSeen: 1, presentSeason: 1,
    club: { id: 'milan', n: 'FC Rossoneri Primavera', a: 'RSN', p: 78, c: '#dc2626', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Primavera 1', isU18: true },
    stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
    form: 74, morale: 72, fatigue: 10, coachTrust: 62, contract: { duration: 1, wage: 200 }, matchHistory: mh(16, { rating: 6.6 }), goals: 3, assists: 2, matches: 16, ...over };
}
const ALTO = { matchHistory: mh(16, { rating: 8.2, goals: 1, assists: 1 }), goals: 16, assists: 16, matches: 16, form: 92, coachTrust: 85, ovr: 74 };
const BASSO = { matchHistory: mh(16, { rating: 5.6 }), goals: 0, assists: 0, matches: 16, form: 45, coachTrust: 40, ovr: 60 };

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function apri(player, { rnd0 = false } = {}) {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, rosso]) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G323 = 1; if (!sessionStorage.getItem('g323')) { sessionStorage.setItem('g323', '1'); localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); } }, [player, ROSSO]);/* al ricarico il salvataggio NON si riscrive */
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER && !!window.__CPM_CAREER.get, { timeout: 30000 });
  if (rnd0) await page.evaluate(() => { Math.random = () => 0; });
  return { page, errors };
}

try {
  /* ---------- A) regola pura ---------- */
  console.log('A) regola pura saltoGennaio323');
  const { page, errors } = await apri(savePlayer(ALTO));
  const A = await page.evaluate(([alto, basso]) => {
    const C = window.__CPM_CAREER, base = C.snapshot();
    if (typeof C.salto323 !== 'function') return { manca: true };
    const r = {};
    const conRnd = f => { const m = Math.random; let usato = false; Math.random = () => { usato = true; throw new Error('Math.random nel percorso del salto'); }; try { return { v: f(), usato }; } catch (e) { return { v: 'ERR ' + e.message, usato }; } finally { Math.random = m; } };
    const hi = { ...base, ...alto }, lo = { ...base, ...basso };
    r.ipHi = (C.ip153(hi) || {}).valore; r.ipLo = (C.ip153(lo) || {}).valore;
    const nomi = Array.from({ length: 24 }, (_, i) => 'Seme ' + i);
    const hiN = nomi.map(n => conRnd(() => C.salto323({ ...hi, name: n }, 19)));
    r.rnd = hiN.some(x => x.usato) || conRnd(() => C.salto323({ ...lo }, 19)).usato || conRnd(() => C.salto323({ ...hi, ps153: { s: 1, presenze: 1 } }, 19)).usato;
    r.err = hiN.filter(x => typeof x.v === 'string').map(x => x.v).slice(0, 2);
    const v = hiN.map(x => x.v).filter(x => x && typeof x === 'object');
    r.hiSalti = v.filter(x => x.esito !== 'nessuno').length; r.hiTot = v.length;
    r.hiTipi = [...new Set(v.filter(x => x.esito !== 'nessuno').map(x => x.offerte.map(o => o.salto323.tipo + ':' + o.type).join('+')))];
    r.hiClubSenior = v.filter(x => x.esito !== 'nessuno').every(x => x.offerte.every(o => o.club && !o.club.isU18 && !/prest/i.test(o.type)));
    r.det = nomi.every(n => JSON.stringify(C.salto323({ ...hi, name: n }, 19)) === JSON.stringify(C.salto323({ ...hi, name: n }, 19)));
    r.loAll = nomi.map(n => C.salto323({ ...lo, name: n }, 19)).filter(x => x && x.esito !== 'nessuno').length;
    const promo = nomi.map(n => C.salto323({ ...hi, name: n, ps153: { s: 1, presenze: 1 } }, 19)).filter(x => x && x.esito !== 'nessuno');
    r.promoN = promo.length;
    r.promoPrima = promo.every(x => x.offerte[0].salto323.tipo === 'promozione' && x.offerte[0].club.id === base.club.id && !x.offerte[0].club.isU18 && x.offerte.length === 2 && x.offerte[1].salto323.tipo === 'esterna' && x.offerte[1].club.id !== base.club.id);
    r.w22senza = C.salto323(hi, 22); r.w22con = C.salto323({ ...hi, ps153: { s: 1, presenze: 1 } }, 22); r.w20 = C.salto323(hi, 20);
    r.pro = C.salto323({ ...hi, proStatus: 'pro' }, 19);
    r.gia = C.salto323({ ...hi, salto323: { s: 1, w: 19 } }, 19);
    r.puro = JSON.stringify(C.snapshot()) === JSON.stringify(base);
    /* il nome del flusso B: il primo seme con salto */
    r.nomeSalto = nomi.find((n, i) => v[i] && v[i].esito === 'esterna') || null;
    return r;
  }, [ALTO, BASSO]);
  if (A.manca) ok(false, 'la regola salto323 non e\' esposta nel banco (build senza il giro 323?)');
  else {
    ok(!A.rnd && A.err.length === 0, `nessun Math.random nel percorso della regola${A.err.length ? ' — ' + A.err[0] : ''}`);
    ok(A.det, 'deterministica: stesso seme, stessa scelta');
    ok(A.loAll === 0, `Indice basso (${A.ipLo}) → nessun salto su 24 semi (salti ${A.loAll})`);
    ok(A.hiSalti >= 12, `Indice alto (${A.ipHi}) → salto su ${A.hiSalti}/${A.hiTot} semi (attesa la maggioranza: probabilita' seedata, tetto 0,92)`);
    ok(A.hiTipi.length === 1 && A.hiTipi[0] === 'esterna:trasferimento definitivo' && A.hiClubSenior, `senza esordio solo offerta esterna definitiva verso un club senior (${A.hiTipi.join(' | ')})`);
    ok(A.promoN >= 12 && A.promoPrima, `con un esordio: promozione nel club madre per prima, l'esterna in coda (${A.promoN} salti)`);
    ok(A.w22senza === null && A.w22con && A.w22con.w === 22 && A.w20 === null, 'settimana 22 solo con esordio, fuori finestra nulla');
    ok(A.pro === null && A.gia === null, 'da professionista e a finestra gia\' valutata: nulla');
    ok(A.puro, 'la regola non modifica il salvataggio');
  }
  await page.close();

  /* ---------- B) flusso vero alla chiusura della settimana 19 ---------- */
  console.log('B) flusso vero: Avanza alla settimana 19');
  {
    const { page: P, errors: E } = await apri(savePlayer(BASSO), { rnd0: true });
    const s0 = await P.evaluate(() => window.__CPM_CAREER.get().week);
    const r = await P.evaluate(() => window.__CPM_CAREER.step());
    await P.waitForFunction(w => window.__CPM_CAREER.get().week !== w, s0, { timeout: 20000 }).catch(() => {});
    await P.waitForFunction(() => { const p = window.__CPM_CAREER.snapshot(); return !!p.salto323 || !!p.transferSaga || !!document.querySelector('[data-cpm="offerta23"]'); }, null, { timeout: 8000 }).catch(() => {});
    const b = await P.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { w: p.week, saga: !!p.transferSaga, off: !!document.querySelector('[data-cpm="offerta23"]'), s323: p.salto323 || null }; });
    ok(r === 'advanced' && b.w === 20, `la settimana 19 si chiude con Avanza (${r}, ora W${b.w})`);
    ok(!b.saga && !b.off, `Indice basso, dado forzato a 0: nessun mercato (saga ${b.saga}, offerta ${b.off}) — il vecchio tiro casuale e' sostituito`);
    ok(b.s323 && b.s323.w === 19 && b.s323.esito === 'nessuno', `decisione registrata in salto323: ${JSON.stringify(b.s323 && { w: b.s323.w, esito: b.s323.esito, ip: b.s323.ip })}`);
    ok(E.length === 0, `nessun errore di pagina${E.length ? ' — ' + E[0] : ''}`);
    await P.close();
  }
  {
    const nome = (A && A.nomeSalto) || 'Seme 0';
    const { page: P, errors: E } = await apri(savePlayer({ ...ALTO, name: nome }));
    const s0 = await P.evaluate(() => window.__CPM_CAREER.get().week);
    await P.evaluate(() => window.__CPM_CAREER.step());
    await P.waitForFunction(w => window.__CPM_CAREER.get().week !== w, s0, { timeout: 20000 }).catch(() => {});
    const apparsa = await P.waitForFunction(() => !!document.querySelector('[data-cpm="offerta23"]'), null, { timeout: 10000 }).then(() => true).catch(() => false);
    const t = apparsa ? await P.evaluate(() => document.querySelector('[data-cpm="offerta23"]').innerText.replace(/\s+/g, ' ').slice(0, 140)) : '';
    ok(apparsa, `Indice alto (seme «${nome}»): l'offerta di gennaio si apre — ${t}`);
    if (apparsa) {
      /* l'offerta vive nel salvataggio: dopo un ricarico e' ancora li' (prima un setTimeout la perdeva: comparsa alla W28) */
      await P.waitForFunction(() => { try { return JSON.parse(localStorage.getItem('cpm-v3')).player.salto323.aperta != null; } catch (e) { return false; } }, null, { timeout: 10000 }).catch(() => {});
      await P.reload({ waitUntil: 'load' });
      await P.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
      try { await P.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
      await P.waitForFunction(() => !!window.__CPM_CAREER && !!window.__CPM_CAREER.get, null, { timeout: 30000 });
      const dopoRic = await P.waitForFunction(() => !!document.querySelector('[data-cpm="offerta23"]'), null, { timeout: 15000 }).then(() => true).catch(() => false);
      ok(dopoRic, 'dopo un ricarico l\'offerta di gennaio e\' ancora aperta');
      await P.evaluate(() => window.__CPM_CAREER.acceptOffer());
      await P.waitForFunction(() => window.__CPM_CAREER.snapshot().proStatus === 'pro', null, { timeout: 15000 }).catch(() => {});
      const a = await P.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); const yh = (p.history || []).filter(h => h.youthHalf323);
        return { pro: p.proStatus, club: p.club && p.club.n, u18: p.club && p.club.isU18, lg: p.club && p.club.lg, loan: !!p.loan, diario: (p.diary || []).filter(d => d.headline === 'Promosso a gennaio').length, prim: p.primavera323, yh: yh.length, yhG: yh[0] && yh[0].goals, g: p.goals, m: p.matches, s323: p.salto323 && p.salto323.accettato, tot: p.totalGoals, pc: window.__CPM_CAREER ? null : null }; });
      ok(a.pro === 'pro' && !a.u18 && !/^Primavera/i.test(a.lg || '') && !a.loan, `accettata: professionista in ${a.club} (${a.lg}), nessun prestito`);
      ok(a.diario === 1, `una riga di diario «Promosso a gennaio» (${a.diario})`);
      ok(a.prim && a.prim.presenze === 16 && a.prim.gol === 16 && a.yh === 1 && a.yhG === 16 && a.g === 0 && a.m === 0, `Primavera contata a parte: primavera323 ${JSON.stringify(a.prim)} · riga di storia giovanile ${a.yh} · contatori della stagione ripartiti (gol ${a.g}, presenze ${a.m})`);
      ok(a.s323 === true, 'decisione chiusa (salto323.accettato)');
      /* fine stagione: nessun premio Primavera a chi e' uscito (D8) */
      await P.evaluate(() => { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goScreen('dashboard'); window.__CPM_CAREER.patch({ week: 38, weekLived: true, calendar: (window.__CPM_CAREER.snapshot().calendar || []).map(m => ({ ...m, played: true })) }); });
      await P.waitForFunction(() => window.__CPM_CAREER.get().week === 38, null, { timeout: 8000 }).catch(() => {});
      const r38 = [];
      for (let k = 0; k < 4; k++) { const sc = await P.evaluate(() => window.__CPM_CAREER.screen()); if (sc === 'seasonEnd' || sc === 'seasonAwards' || sc === 'proTransition') break; const w0 = await P.evaluate(() => window.__CPM_CAREER.get().week + '|' + window.__CPM_CAREER.get().lived + '|' + window.__CPM_CAREER.screen()); r38.push(await P.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); C.chiudi163(); return C.step(); })); await P.waitForFunction(w => (window.__CPM_CAREER.get().week + '|' + window.__CPM_CAREER.get().lived + '|' + window.__CPM_CAREER.screen()) !== w, w0, { timeout: 15000 }).catch(() => {}); }
      await P.waitForFunction(() => { const s = window.__CPM_CAREER.screen(); return s === 'seasonEnd' || s === 'seasonAwards' || s === 'proTransition'; }, null, { timeout: 20000 }).catch(() => {});
      const f = await P.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { scr: window.__CPM_CAREER.screen(), aw: (p.primaveraAwards || []).filter(x => (x.season || 1) === 1).length }; });
      ok((f.scr === 'seasonEnd' || f.scr === 'seasonAwards') && f.aw === 0, `fine stagione da professionista (${f.scr}, passi ${r38.join(',')}), nessun premio Primavera assegnato (${f.aw})`);
    }
    ok(E.length === 0, `nessun errore di pagina${E.length ? ' — ' + E[0] : ''}`);
    await P.close();
  }
  /* ---------- C) tri-path ---------- */
  console.log('C) tri-path');
  {
    const src = fs.readFileSync(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8').split('\n');
    const sig = [/^  const simulateAndAdvance=\(\)=>\{/, /^  const onMatchEnd=result=>\{/, /^  const doAdvanceWeek=\(\)=>\{/];
    const sib = [/^  const simulateAndAdvance=/, /^  const onMatchEnd=result=>/, /^  const doAdvanceWeek=/, /^  const doRetire=/, /^  const doStartNewSeason=/, /^  const startNationalMatch=/, /^  const handleEnd=/, /^  const startMatch=/, /^  const liveCurrentWeek=/];
    const res = sig.map(re => { const i = src.findIndex(l => re.test(l)); if (i < 0) return false; let e = src.length; for (let j = i + 1; j < src.length; j++) if (sib.some(r => r.test(src[j]))) { e = j; break; } return src.slice(i, e).join('\n').includes('applySaltoGennaio323(player)'); });
    ok(res.every(Boolean), `i tre percorsi chiamano applySaltoGennaio323 (${res.join(',')})`);
  }
} catch (e) { ok(false, 'eccezione: ' + (e && e.message)); }
await browser.close(); srv.close();
console.log(`\n${fails.length ? '❌ ROSSO' : '✅ VERDE'} salto-323${ROSSO ? ' (braccio rosso __CPM_NO_G323)' : ''}: ${oks.length} ok · ${fails.length} ko`);
if (fails.length) { console.log('  falliti: ' + fails.join(' | ')); process.exit(1); }
process.exit(0);
