#!/usr/bin/env node
/* [PO-223 · giro 33, eccezione PO 15/10 «Sì, solo questi due»] GUARDIANO: LA RESA DELL'INVESTIMENTO DIPENDE DA PUNTATA E SCELTA.
 *
 * A) FLUSSO VERO (handler __CPM_CAREER, stato da localStorage 'cpm-v3'): carriera S2 W36 con 80.000€; si apre il pop-up VERO
 *    dell'impulso (apriImpulso: stesse scelte del catalogo) e si clicca la scelta d'investimento; si chiude la stagione con step()
 *    e si fa il rollover con startNewSeason(). Si misura: quanto esce dal conto alla scelta, quanto rientra al rollover, e il testo
 *    dell'avviso (deve contenere la cifra che rientra davvero). Tre scelte × due carriere (semi diversi).
 * B) TABELLA puntata × scelta × esito su 12 semi di carriera, calcolata dalla stessa funzione che usa il rollover (invEsito223):
 *    determinismo (stesso seme → stesso esito), prudente sempre in attivo, rischioso con almeno una perdita E un guadagno.
 * Verde: nessun rientro e' 55.000 fissi; il rientro e' quello del registro; l'avviso (testo accodato da notify) dice la cifra;
 * la cripto puo' perdere. La messa a schermo e' solo informativa: un modale «UN MOMENTO» la rimanda (PO-256).
 * Prova del rosso: CPM_ROSSO=1 arma window.__CPM_NO_INV223 → 55.000 fissi qualunque scelta: il guardiano DEVE uscire 1.
 * Uso: CPM_CHROME=/opt/pw-browsers/chromium node investimento-223.mjs   (CPM_JSON=1 stampa i numeri grezzi)
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const guasti = []; const righe = [];
const ok = (c, m) => { righe.push((c ? '✓ ' : '✗ ') + m); if (!c) guasti.push(m); };
const eur = (v) => String(Math.round(Math.abs(v))).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '€';

const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const baseSave = (name, extra) => ({ phase: 'career', player: { name, nation: 'Italia', avatarId: 0, proStatus: 'pro',
  season: 2, week: 36, weekLived: false, age: 20, ovr: 70, tutorialDone: true, club: CLUB,
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 }, yellAccum: 0, seasonCards: { y: 0, r: 0 },
  matches: 0, totalMatches: 0, goals: 0, totalGoals: 0, matchHistory: [], bankBalance: 80000, ...extra } });

async function apri(save) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_INV223 = true;
    localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s: save, rosso: ROSSO });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(800);
  for (let i = 0; i < 12; i++) {
    const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length);
    if (!n) break;
    await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300);
  }
  return { ctx, page, errori };
}
const salvato = (page) => page.evaluate(() => { const p = (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player) || {};
  return { season: p.season, week: p.week, bank: p.bankBalance || 0, flag: !!p.investmentPending, reg: p.investimenti223 || null }; });

const SCELTE = [
  { id: 'wi_investimento', prof: 'prudente', btn: 'Investo metà del conto' },
  { id: 'wi_ristorante_socio', prof: 'bilanciato', btn: 'Investo e ci metto la faccia' },
  { id: 'wi_cripto', prof: 'rischioso', btn: 'Ci punto una fetta' },
];
const NOMI = ['Collaudo Zona G', 'Marco Ferri'];

// ---------------- A) flusso vero
const A = [];
for (const nome of NOMI) for (const sc of SCELTE) {
  if (process.env.CPM_UNO && (nome !== NOMI[0] || sc.prof !== process.env.CPM_UNO)) continue;
  if (process.env.CPM_TRACCIA) console.error('braccio', nome, sc.prof);
  const { ctx, page, errori } = await apri(baseSave(nome, {}));
  if (process.env.CPM_TRACCIA) page.on('console', m => { if (m.type() === 'error') console.error('  console:', m.text().slice(0, 160)); });
  const s0 = await salvato(page);
  await page.evaluate((id) => window.__CPM_CAREER.apriImpulso(id), sc.id); await sleep(600);
  const clic = await page.evaluate((t) => { const b = [...document.querySelectorAll('button')].filter(x => (x.textContent || '').includes(t));
    if (!b.length) return false; b[b.length - 1].click(); return true; }, sc.btn);
  await sleep(900);
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  const s1 = await salvato(page);
  let fine = false;
  for (let i = 0; i < 60 && !fine; i++) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
    if (r === 'seasonEnd') fine = true;
    else if (String(r).startsWith('blocked')) await page.evaluate(() => window.__CPM_CAREER.clearTournaments());
    await sleep(250);
  }
  const s2 = await salvato(page);
  const atteso = await page.evaluate(() => { try { const p = window.__CPM_CAREER.snapshot(); return invEsiti223(p); } catch (e) { return 'err:' + e.message; } });
  // l'avviso si legge ALLA SORGENTE: __CPM_NOTIFQ223 = cio' che il gioco accoda, __CPM_TOAST223 = cio' che va a schermo (il DOM perdeva i toast brevi)
  await page.evaluate(() => { window.__CPM_TOAST223 = []; window.__CPM_NOTIFQ223 = []; });
  await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
  await sleep(1500);
  const s3 = await salvato(page);/* letto PRIMA di risolvere l'apertura di stagione (ritiro/mercato possono muovere il conto) */
  await sleep(3500);/* l'avviso parte 3 s dopo il rollover (src/18 setTimeout 3000) */
  const accodati = await page.evaluate(() => (window.__CPM_NOTIFQ223 || []).filter(l => /nvestimento|cripto|ristorante/i.test(l)));
  // messa a schermo: SOLO informativa. Se un modale («UN MOMENTO …») e' aperto, i toast aspettano la sua chiusura (PO-256) e il
  // giocatore li vede dopo aver risposto. Cliccare la risposta in headless, o chiamare dismiss() in ciclo, fa crollare il renderer
  // (misurato: 6 crolli in 8 giri): non si fa. Il verdetto sull'avviso e' sul testo ACCODATO (__CPM_NOTIFQ223).
  for (let t = 0; t < 16; t++) { if (await page.evaluate(() => (window.__CPM_TOAST223 || []).some(l => /puntati|55\.000/.test(l)))) break; await sleep(500); }
  await sleep(500);
  const avvisi = [...new Set(await page.evaluate(() => (window.__CPM_TOAST223 || []).filter(l => /nvestimento|cripto|ristorante/i.test(l))))];
  const tuttiToast = await page.evaluate(() => (window.__CPM_TOAST223 || []).map(x => x.slice(0, 50)));
  const modali = await page.evaluate(() => ({ sc: window.__CPM_CAREER.screen(), txt: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 300) }));
  A.push({ nome, ...sc, clic, fine, puntata: s0.bank - s1.bank, registro: s1.reg, flag: s1.flag, bancaFine: s2.bank, bancaDopo: s3.bank,
    rientro: s3.bank - s2.bank, stagioneDopo: s3.season, atteso, accodati, avvisi, tuttiToast, modali, errori });
  await ctx.close();
}

// ---------------- A2) salvataggio in volo: flag della versione vecchia, senza registro → la promessa vecchia (55.000, una volta)
let V = null;
{ const { ctx, page, errori } = await apri(baseSave('Collaudo Zona G', { investmentPending: true, bankBalance: 60000 }));
  const s1 = await salvato(page); let fine = false;
  for (let i = 0; i < 60 && !fine; i++) { const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
    if (r === 'seasonEnd') fine = true; else if (String(r).startsWith('blocked')) await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); await sleep(250); }
  const s2 = await salvato(page);
  await page.evaluate(() => { window.__CPM_NOTIFQ223 = []; window.__CPM_CAREER.startNewSeason(); }); await sleep(5000);
  const s3 = await salvato(page);
  V = { caricato: s1.flag && !s1.reg, rientro: s3.bank - s2.bank, flagDopo: s3.flag, avviso: await page.evaluate(() => (window.__CPM_NOTIFQ223 || []).filter(l => /nvestimento/.test(l))), errori };
  await ctx.close(); }
console.log(`salvataggio in volo (flag senza registro): rientro ${V && V.rientro} · avviso ${V && JSON.stringify(V.avviso)}`);

// ---------------- B) tabella puntata × scelta × esito (stessa funzione del rollover)
const { ctx: ctxB, page: pB } = await apri(baseSave('Tabella', {}));
const B = await pB.evaluate(() => {
  const out = []; const semi = ['Collaudo Zona G', 'Marco Ferri', 'Luca Neri', 'Ana Ruiz', 'Tom Berg', 'Ivo Sala', 'Kenji Mori', 'Paolo Riva', 'Elio Costa', 'Dario Fumo', 'Nico Pace', 'Sara Vela'];
  for (const amt of [20000, 28000, 40000]) for (const prof of ['prudente', 'bilanciato', 'rischioso']) for (const nome of semi) {
    const p = { name: nome, nation: 'Italia' }, inv = { amt, prof, s: 2, w: 12 };
    const e1 = invEsito223(p, inv, 0), e2 = invEsito223(p, inv, 0);
    out.push({ amt, prof, nome, mult: e1.mult, ret: e1.ret, det: e1.ret === e2.ret && e1.mult === e2.mult });
  }
  return out;
});
await ctxB.close();
if (process.env.CPM_JSON === '1') console.log(JSON.stringify({ A, B }, null, 1));

// ---------------- stampa
console.log(`PO-223 · flusso vero${ROSSO ? ' · ROSSO (__CPM_NO_INV223)' : ''}`);
console.log('carriera           scelta        puntata   rientro   netto      avviso');
for (const a of A) console.log(`${a.nome.padEnd(18)} ${a.prof.padEnd(12)} ${eur(a.puntata).padStart(9)} ${eur(a.rientro).padStart(9)} ${((a.rientro - a.puntata >= 0 ? '+' : '−') + eur(a.rientro - a.puntata)).padStart(10)}  ${(a.accodati[0] || '—').slice(0, 90)}${a.avvisi.length ? '' : '  (non ancora a schermo: modale aperto)'}`);
console.log('\nPO-223 · tabella (12 semi): puntata × scelta → rientro min / medio / max · perdite');
const gruppi = {};
for (const r of B) { const k = r.amt + '|' + r.prof; (gruppi[k] = gruppi[k] || []).push(r); }
for (const [k, rs] of Object.entries(gruppi)) { const [amt, prof] = k.split('|'); const v = rs.map(r => r.ret);
  const med = v.reduce((a, b) => a + b, 0) / v.length;
  console.log(`  ${eur(+amt).padStart(8)} ${prof.padEnd(11)} min ${eur(Math.min(...v)).padStart(8)} · medio ${eur(med).padStart(8)} · max ${eur(Math.max(...v)).padStart(8)} · in perdita ${rs.filter(r => r.ret < r.amt).length}/12`); }

// ---------------- giudizio
for (const a of A) {
  const tag = `${a.nome}/${a.prof}`;
  ok(a.clic && a.fine && a.stagioneDopo === 3 && !a.errori.length, `${tag}: scelta cliccata, stagione chiusa, rollover a S3, nessun errore ${a.errori.join(' | ')}`);
  ok(a.puntata > 0 && a.flag, `${tag}: la scelta toglie ${eur(a.puntata)} dal conto e lascia l'investimento pendente`);
  ok(a.rientro !== 55000, `${tag}: il rientro non e' l'accredito fisso di 55.000€ (${eur(a.rientro)})`);
  const att = Array.isArray(a.atteso) ? a.atteso.reduce((s, e) => s + e.ret, 0) : null;
  ok(att != null && a.rientro === att && Array.isArray(a.registro) && a.registro.length === 1 && a.registro[0].amt === a.puntata && a.registro[0].prof === a.prof,
    `${tag}: rientro = registro (puntata ${eur(a.puntata)}, profilo ${a.prof}, atteso ${att == null ? '?' : eur(att)})`);
  ok(a.accodati.some(t => t.includes(eur(a.rientro === 0 ? a.puntata : a.rientro))), `${tag}: l'avviso dice la cifra vera`);
}
ok(V && V.caricato && V.rientro === 55000 && !V.flagDopo && !V.errori.length, 'salvataggio in volo: si carica e incassa la promessa vecchia (55.000, una volta, flag azzerato)');
const tutti = (prof) => B.filter(r => r.prof === prof);
ok(B.every(r => r.det), 'tabella: stesso seme → stesso esito (determinismo)');
ok(tutti('prudente').every(r => r.ret > r.amt), 'tabella: prudente sempre in attivo');
ok(tutti('rischioso').some(r => r.ret < r.amt) && tutti('rischioso').some(r => r.ret > r.amt), 'tabella: rischioso puo\' perdere E guadagnare (esito incerto davvero)');
ok(tutti('bilanciato').some(r => r.ret < r.amt) && tutti('bilanciato').some(r => r.ret > r.amt), 'tabella: bilanciato puo\' perdere E guadagnare');
ok(new Set(B.map(r => r.ret)).size > 20, 'tabella: la resa dipende da puntata, scelta e seme (non un valore fisso)');
ok(new Set(A.map(a => a.rientro)).size >= 4, `flusso vero: rientri diversi fra scelte e carriere (${[...new Set(A.map(a => a.rientro))].map(eur).join(', ')})`);

console.log('\n' + righe.join('\n'));
console.log(guasti.length ? `\n✗ ROSSO investimento-223: ${guasti.length} controlli falliti` : '\n✅ VERDE investimento-223');
await browser.close(); srv.close();
process.exit(guasti.length ? 1 : 0);
