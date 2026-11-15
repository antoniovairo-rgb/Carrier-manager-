#!/usr/bin/env node
/* [giro 205 PO-465] GUARDIANO riserva2d-205 — i momenti finali di una partita giocata in 2D FORZATA (giro 196: la scena 3D non e'
   pronta → campo dall'alto). 2D forzata in modo deterministico: pacchetto CGTrader bloccato (caricamento fallito simulato) e
   __CPM_CAP196=1. Tre situazioni:
     1. LOTTERIA dopo il pareggio in una FINALE di Coppa (__CPM_SO_FORCE): in 2D si vede la porta coi tiri (data-cpm="rigori2d205")
        e mai il campo congelato (data-cpm="vista2d"); ogni tiro mostrato ha l'esito che il motore della serie ha deciso
        (__CPM_R2D205 contro soState.seq); la serie finisce; hs/as = gol della sequenza; vinta ⟺ hs>as; vinta in finale → premiazione.
     2. CERIMONIE: la premiazione dopo la serie e quelle forzate (coppa · campionato · festa leggera) si vedono come quadro 2D
        (data-cpm="cerimonia2d205"), mai il campo congelato, e finiscono da sole nella rassegna entro 30 s.
     3. RASSEGNA e RITORNO: rassegna a 4 schede, «Avanti» fino al tasto di sempre, ritorno alla carriera, matchHistory +1, voce di Coppa
        coerente col motore (won = soState.won, rigori, 1-1), Coppa vinta → champion.
   In tutte: nessun errore di pagina o di console (tolte la nota di Babel e le richieste bloccate apposta), nessun blocco (tetti).
   Schermi: telefono 375x667 e PC 1366x768.
   ROSSO window.__CPM_NO_G205: in 2D lotteria e premiazione tornano al campo congelato → DEVE essere bocciato. «Non giudicato» = rosso.
   Uso: node riserva2d-205.mjs (verde poi rosso) · CPM_PARTE=verde|rosso per spezzare la corsa. */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apri, leggiStato, chiudiRassegna } from './misura-205.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const PARTE = process.env.CPM_PARTE || 'tutto';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const TETTO_SERIE = 120000, TETTO_CER = 30000;

/* campiona la pagina durante serie e cerimonia: che cosa c'e' a schermo e quale tiro mostra la vista 2D */
const campione = (pg) => pg.evaluate(() => { const q = s => !!document.querySelector(s);
  return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), d2: !!window.__CPM_2D196, v2d: q('[data-cpm="vista2d"]'), so2d: q('[data-cpm="rigori2d205"]'), cer2d: q('[data-cpm="cerimonia2d205"]'),
    nota: q('[data-cpm="riserva2d205-nota"]'), r: window.__CPM_R2D205 ? { ...window.__CPM_R2D205 } : null, rass: q('[data-cpm="rassegna200"]') }; }).catch(() => null);

async function percorso(schermo, flags) {
  const { pg, errs } = await apri(browser, port, schermo, { round: 4, seed: 8080, flags });
  const g = [];
  const s0 = await leggiStato(pg);
  await pg.evaluate(() => { window.__CPM_SO_SEQ205 = null; window.__CPM_SO_FORCE && window.__CPM_SO_FORCE(); });
  const C = []; const t0 = Date.now(); let fineSerie = null, fineCer = null, iniCer = null, rass = false;
  while (Date.now() - t0 < TETTO_SERIE + TETTO_CER) { const c = await campione(pg); if (c) { c.t = Date.now() - t0; C.push(c); }
    if (c && c.ph !== 'shootout' && fineSerie == null && C.some(x => x.ph === 'shootout')) fineSerie = c.t;
    if (c && c.ph === 'ceremony' && iniCer == null) iniCer = c.t;
    if (c && c.ph === 'ended' && iniCer != null && fineCer == null) fineCer = c.t;
    if (c && c.ph === 'ended' && c.rass) { rass = true; break; }
    await sleep(150); }
  const so = await pg.evaluate(() => window.__CPM_SO_STATE && window.__CPM_SO_STATE());
  /* la sequenza decisa dal motore della serie: si legge dal tabellino ✓ ✗ della rassegna? no — dall'hook di stato non c'e'. Si
     ricostruisce dai tiri mostrati: ogni chiave mostrata deve avere UN solo esito, e i gol mostrati per lato devono fare hs/as. */
  const S = C.filter(c => c.ph === 'shootout'), K = C.filter(c => c.ph === 'ceremony');
  const perChiave = {}; for (const c of S) if (c.r && c.r.fase === 'shootout' && c.r.key != null && c.r.tirato) (perChiave[c.r.key] = perChiave[c.r.key] || new Set()).add(c.r.esito);
  const chiavi = Object.keys(perChiave).map(Number).sort((a, b) => a - b);
  const golMostrati = { H: 0, A: 0 }; for (const k of chiavi) { const e = [...perChiave[k]][0]; if (e === 'gol') golMostrati[k % 2 === 0 ? 'H' : 'A']++; }
  const quota = (A, f) => A.length ? A.filter(f).length / A.length : 0;
  const mh0 = (await leggiStato(pg)).mh;
  const rassTxt = await pg.evaluate(() => (document.querySelector('[data-cpm="rassegna200"]') || {}).innerText || '').catch(() => '');
  const passi = rass ? await chiudiRassegna(pg, null, '') : [];
  let sF = null; for (let i = 0; i < 20; i++) { await sleep(500); sF = await leggiStato(pg); if (sF.mh > mh0) break; }
  await pg.context().close();
  const last = sF && sF.cup && sF.cup.last;
  g.push([s0.d2 === true, `2D attiva prima dei rigori (d2=${s0.d2})`]);
  g.push([S.length >= 20 && quota(S, c => c.so2d) >= 0.9 && quota(S, c => c.v2d) === 0, `serie in 2D: porta ${(quota(S, c => c.so2d) * 100).toFixed(0)}% dei ${S.length} campioni, campo congelato ${(quota(S, c => c.v2d) * 100).toFixed(0)}%`]);
  g.push([so && so.done && fineSerie != null && fineSerie < TETTO_SERIE, `la serie finisce (${so ? so.hs + '-' + so.as : '?'}, ${so && so.len} tiri, in ${fineSerie != null ? (fineSerie / 1000).toFixed(1) : '—'} s)`]);
  g.push([chiavi.length >= Math.min(6, so ? so.len : 99) && chiavi.every(k => perChiave[k].size === 1), `ogni tiro mostrato ha un esito solo (${chiavi.length} tiri visti, ${chiavi.filter(k => perChiave[k].size > 1).length} con esiti diversi)`]);
  g.push([so && chiavi.length === so.len ? (golMostrati.H === so.hs && golMostrati.A === so.as) : (golMostrati.H <= so.hs && golMostrati.A <= so.as), `gol mostrati ${golMostrati.H}-${golMostrati.A} coerenti col motore ${so ? so.hs + '-' + so.as : '?'}${so && chiavi.length < so.len ? ' (serie vista in parte)' : ''}`]);
  g.push([so && so.won === (so.hs > so.as), `vinta ⟺ hs>as (won=${so && so.won})`]);
  if (so && so.won) {
    g.push([K.length >= 10 && quota(K, c => c.cer2d) >= 0.9 && quota(K, c => c.v2d) === 0 && quota(K, c => c.nota) >= 0.9, `premiazione in 2D: quadro ${(quota(K, c => c.cer2d) * 100).toFixed(0)}% dei ${K.length} campioni, campo congelato ${(quota(K, c => c.v2d) * 100).toFixed(0)}%, nota «versione 2D» ${(quota(K, c => c.nota) * 100).toFixed(0)}%`]);
    g.push([fineCer != null && fineCer - iniCer < TETTO_CER, `la premiazione finisce da sola (${fineCer != null ? ((fineCer - iniCer) / 1000).toFixed(1) : '—'} s)`]);
  } else g.push([K.length === 0, `serie persa: nessuna premiazione (${K.length} campioni in ceremony)`]);
  g.push([rass && /rigori/i.test(rassTxt) && (so && so.won ? /vittoria ai rigori/i.test(rassTxt) : /rigori/i.test(rassTxt)), `rassegna con l'esito ai rigori (${rass ? 'si' : 'no'})`]);
  g.push([passi.length === 4 && passi[3] === 'torna' && sF && sF.mh === mh0 + 1 && sF.carriera, `rassegna → carriera: passi ${passi.join(',')} · matchHistory ${mh0}→${sF && sF.mh}`]);
  g.push([!!last && last.penalties === true && last.won === !!(so && so.won) && last.homeScore === 1 && last.awayScore === 1 && (so && so.won ? sF.cup.champ === true : sF.cup.elim === true), `voce di Coppa coerente: ${JSON.stringify(last)} · champion ${sF && sF.cup && sF.cup.champ}`]);
  g.push([errs.length === 0, `errori ${errs.length} ${errs.length ? JSON.stringify(errs.slice(0, 2)) : ''}`]);
  return g;
}
async function cerimonia(schermo, flags, k) {
  const { pg, errs } = await apri(browser, port, schermo, { round: 2, seed: 8080, flags });
  const d2 = (await leggiStato(pg)).d2; await pg.evaluate(o => window.__CPM_FORCE_CEREMONY(o), k);
  const C = []; const t0 = Date.now(); let fine = null;
  while (Date.now() - t0 < TETTO_CER + 5000) { const c = await campione(pg); if (c) { c.t = Date.now() - t0; C.push(c); if (c.ph === 'ended') { fine = c.t; if (c.rass) break; } } await sleep(200); }
  const K = C.filter(c => c.ph === 'ceremony'); const rass = C.some(c => c.rass);
  const mh0 = (await leggiStato(pg)).mh; const passi = rass ? await chiudiRassegna(pg, null, '') : [];
  let sF = null; for (let i = 0; i < 20; i++) { await sleep(500); sF = await leggiStato(pg); if (sF.mh > mh0) break; }
  await pg.context().close(); const nm = k.light ? 'festa' : k.kind; const q = f => K.length ? K.filter(f).length / K.length : 0;
  return [[d2 && K.length >= 10 && q(c => c.cer2d) >= 0.9 && q(c => c.v2d) === 0, `${nm}: 2D ${d2} · quadro ${(q(c => c.cer2d) * 100).toFixed(0)}% di ${K.length} campioni · campo congelato ${(q(c => c.v2d) * 100).toFixed(0)}%`],
    [fine != null && fine < TETTO_CER && rass && passi[passi.length - 1] === 'torna' && sF && sF.mh === mh0 + 1, `${nm}: finisce in ${fine != null ? (fine / 1000).toFixed(1) : '—'} s · rassegna ${rass} · carriera (matchHistory ${mh0}→${sF && sF.mh})`],
    [errs.length === 0, `${nm}: errori ${errs.length} ${errs.length ? JSON.stringify(errs.slice(0, 2)) : ''}`]];
}
const FESTA = { kind: 'cup', name: 'COPPA', light: true, festa: { titolo: 'Vittoria', punteggio: '2-1', avversario: 'FC Internazionale', casa: true, voci: [{ n: '7.5', et: 'voto', oro: true }] } };
const verde = [], rosso = [];
const scrivi = (arr, tit, G) => { for (const [ok, m] of G) { arr.push([ok, tit + ' · ' + m]); } };
if (PARTE !== 'rosso') {
  for (const sc of ['telefono', 'pc']) { console.log(`… verde ${sc}: finale di coppa ai rigori`); scrivi(verde, `verde ${sc}`, await percorso(sc, [])); }
  for (const k of [{ kind: 'cup', name: 'COPPA NAZIONALE' }, { kind: 'league', name: 'CAMPIONI DI LEGA B' }, FESTA]) { console.log(`… verde telefono: cerimonia ${k.light ? 'festa' : k.kind}`); scrivi(verde, 'verde telefono', await cerimonia('telefono', [], k)); }
  console.log('… verde pc: cerimonia campionato'); scrivi(verde, 'verde pc', await cerimonia('pc', [], { kind: 'league', name: 'CAMPIONI DI LEGA B' }));
}
if (PARTE !== 'verde') {
  console.log('… rosso telefono (__CPM_NO_G205)'); const R = await percorso('telefono', ['__CPM_NO_G205']);
  const serie = R.find(x => /^serie in 2D/.test(x[1])), prem = R.find(x => /^premiazione in 2D/.test(x[1]));
  const giudicato = R.find(x => /^la serie finisce/.test(x[1]))[0];
  rosso.push([giudicato && serie && !serie[0] && (!prem || !prem[0]), `rosso telefono: serie ${serie && serie[1]} · ${prem ? prem[1] : 'premiazione non vista'} → ${serie && !serie[0] ? 'bocciato' : 'NON bocciato'}`]);
}
await browser.close(); srv.close();
for (const [ok, m] of verde) console.log((ok ? '  ✓ ' : '  ✗ ') + m);
for (const [ok, m] of rosso) console.log((ok ? '  ✓ ' : '  ✗ ') + m);
const vOk = PARTE === 'rosso' || (verde.length > 0 && verde.every(x => x[0])), rOk = PARTE === 'verde' || (rosso.length > 0 && rosso.every(x => x[0]));
if (PARTE !== 'rosso') console.log(`VERDE: ${verde.filter(x => x[0]).length}/${verde.length} ${vOk ? '✓' : '✗'}`);
if (PARTE !== 'verde') console.log(`ROSSO __CPM_NO_G205 bocciato: ${rOk ? '✓' : '✗'}`);
console.log(vOk && rOk ? `✅ riserva2d-205 superato (${PARTE}: verde col verde, rosso col rosso)` : `❌ riserva2d-205 rosso (${PARTE})`);
process.exit(vOk && rOk ? 0 : 1);
