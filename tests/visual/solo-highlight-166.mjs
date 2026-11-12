#!/usr/bin/env node
/* [giro 166 · PO-364 opzione C, decisione PO «B e C insieme»] GUARDIANO della partita a SOLI HIGHLIGHT — `npm run solo-highlight-166`.
   La modalita' si sceglie nel prompt della partita (accanto a «Gioca» e «Simula») SOLO per le gare senza posta della carriera da
   professionista: si salta il gioco fluido, restano prepartita, scene con le loro scelte, esito, schermata finale e intervista.
   Non e' un secondo motore: e' lo stesso battito della partita intera fatto correre a lotti (src/15, _lotto166).
   A. STATICO (dal repo)
      1. un solo lotto (_lotto166) che chiama lo stesso battito della partita intera dentro flushSync; nessun Math.random nel blocco;
      2. il bottone del prompt dipende da senzaPosta166, che dal giro 173 usa la posta allargata posta165 (rosso: calcMatchWeight < 5).
   B. PROMPT (carriera vera, salvataggio sintetico, ?cpmtest)
      3. professionista, campionato, peso < 5 → il bottone c'e' (e la nota che lo spiega);
      4. Coppa → non c'e';   5. campionato con peso >= 5 (ex club + rivale) → non c'e';   6. Primavera (u18) → non c'e'.
   C. PARTITA (stesso salvataggio, stessa settimana, stesso pilota seedato nei bracci)
      7. il bottone apre la partita in modalita' soli highlight (testimone __CPM_LM166) e il velo copre il campo nel gioco fluido;
      8. il gioco fluido e' saltato: tempo reale di `playing` per minuto di gioco <= 400 ms (intera: ~1600) e il lotto ha battuto;
      9. la partita arriva al fischio (>= 90') con almeno una scena giocata (zero scene = NON GIUDICATO = rosso);
     10. LIBRO MASTRO identico alla partita INTERA, voce per voce (senza ts/t/npd, come il giro 161), e risultato identico;
     11. tabellino, pagella e statistiche identici: testo della schermata finale e voce di matchHistory uguali alla partita intera;
     12. l'intervista post-partita e' chiesta (testimone __CPM_IV231) come nella partita intera;
     13. durata reale: la partita a soli highlight dura meno della meta' di quella intera (la misura e' stampata).
   Bracci: VERDE deve passare. ROSSO (`__CPM_NO_G166`): il bottone sparisce (3) e, forzando la modalita' dal gancio di sonda
   (__CPM_SOLO166), la partita resta intera (7, 8 cadono; la partita rossa si ferma al 20' di gioco: basta a misurare il passo).
   «Non giudicato» (pagina che non monta, partita non finita, zero scene, sonda assente) = rosso. Verde e rosso stampati per ultimi.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node solo-highlight-166.mjs   ·   CPM_G166_NOME / CPM_G166_SEME cambiano la partita. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apriCarriera166, apriPrompt166, gioca166, seq166, chiudi166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const QUI = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(QUI, '../..');
const NOME = process.env.CPM_G166_NOME || 'Collaudo Salienti', SEME = +(process.env.CPM_G166_SEME || 7300);

/* ---------------- A. statico ---------------- */
const st = []; const ok = (nome, cond, info) => st.push({ nome, ok: !!cond, info: info || '' });
const s15 = fs.readFileSync(path.join(ROOT, 'src/15-live-match.jsx'), 'utf8'), s18 = fs.readFileSync(path.join(ROOT, 'src/18-career-app.jsx'), 'utf8');
const lotto = (s15.match(/const _lotto166=\(\)=>\{[\s\S]*?\n    const iv=setInterval\([^\n]*/) || [''])[0];
ok('1 un solo lotto, stesso battito in flushSync, nessun Math.random', (s15.match(/const _lotto166=/g) || []).length === 1 && (s15.match(/const _batt166=/g) || []).length === 1 && /ReactDOM\.flushSync\(_batt166\)/.test(lotto) && /setInterval\(_solo166\?_lotto166:_batt166/.test(lotto) && !/Math\.random/.test(lotto),
  `lotto ${lotto.length} car. · definizioni ${(s15.match(/const _lotto166=/g) || []).length}`);
const sp = (s18.match(/const senzaPosta166=[\s\S]*?\n  const matchResumeRef/) || [''])[0];
/* [giro 173 punto 1] la regola e' la posta allargata posta165 (giro 165); la vecchia (calcMatchWeight < 5, solo campionato) resta nel rosso __CPM_NO_G173 */
ok('2 il bottone dipende da senzaPosta166 = niente posta per posta165 (rosso 173: calcMatchWeight < 5), solo professionisti', /if\(_g173\(\)\)return !posta165\(player,md\)/.test(sp) && /calcMatchWeight\([^)]*\)<5/.test(sp) && /proStatus!=="pro"/.test(sp) && /md\.type!=="league"/.test(sp) && /senzaPosta166\(showMatchPrompt\)&&\(<>\s*<Btn data-cpm="solo-166"/.test(s18), `regola ${sp.length} car.`);

/* ---------------- B. prompt ---------------- */
async function prompt(rosso) {
  const passi = []; const init = rosso ? { __CPM_NO_G166: true } : {};
  const A = await apriCarriera166({ init, nome: NOME });
  try {
    const a = A.W ? await A.page.evaluate(() => window.__CPM_CAREER.avv166 ? window.__CPM_CAREER.avv166() : null) : null;
    const p3 = A.W ? await apriPrompt166(A.page) : { bottoni: [], solo: false, nota: '' };
    passi.push({ nome: '3 professionista, campionato senza posta → il bottone c\'e\'', ok: !!A.W && !!a && a.peso < 5 && p3.solo && /momenti salienti/i.test(p3.bottoni.join('|')) && p3.nota.length > 20 && p3.bottoni.some(x => /^Gioca la partita/.test(x)) && p3.bottoni.some(x => /^Simula/.test(x)),
      info: `settimana ${A.W} · peso ${a ? a.peso : 'sonda assente'} · bottoni ${JSON.stringify(p3.bottoni)}` });
    await A.page.evaluate(() => window.__CPM_CAREER.dismiss && window.__CPM_CAREER.dismiss()); await A.page.keyboard.press('Escape').catch(() => {}); await sleep(300);
    const p4 = await apriPrompt166(A.page, 'cup');
    passi.push({ nome: '4 Coppa → nessun bottone dei soli highlight', ok: p4.bottoni.length >= 2 && !p4.solo, info: `bottoni ${JSON.stringify(p4.bottoni)}` });
    await A.page.keyboard.press('Escape').catch(() => {}); await sleep(300);
    if (a) await A.page.evaluate((id) => window.__CPM_CAREER.patch({ history: [{ clubId: id, club: id, season: 1 }], rival: { name: 'Rivale', club: { id } } }), a.id); await sleep(400);
    const a5 = await A.page.evaluate(() => window.__CPM_CAREER.avv166 ? window.__CPM_CAREER.avv166() : null);
    const p5 = await apriPrompt166(A.page);
    passi.push({ nome: '5 campionato con peso >= 5 → nessun bottone', ok: !!a5 && a5.peso >= 5 && p5.bottoni.length >= 2 && !p5.solo, info: `peso ${a5 ? a5.peso : 'sonda assente'} · bottoni ${JSON.stringify(p5.bottoni)}` });
    await A.page.keyboard.press('Escape').catch(() => {}); await sleep(300);
    await A.page.evaluate(() => window.__CPM_CAREER.patch({ history: [], rival: null, proStatus: 'u18' })); await sleep(400);
    const a6 = await A.page.evaluate(() => window.__CPM_CAREER.avv166 ? window.__CPM_CAREER.avv166() : null);
    const p6 = await apriPrompt166(A.page);
    passi.push({ nome: '6 Primavera (u18) → nessun bottone', ok: p6.bottoni.length >= 2 && !p6.solo, info: `peso ${a6 ? a6.peso : '—'} · bottoni ${JSON.stringify(p6.bottoni)}` });
    passi.push({ nome: '  errori di pagina (prompt)', ok: A.errs.length === 0, info: JSON.stringify(A.errs.slice(0, 3)) });
  } catch (e) { passi.push({ nome: '  flusso del prompt', ok: false, info: String(e.message).slice(0, 160) }); }
  await A.b.close(); A.srv.close(); return passi;
}

/* ---------------- C. partita ---------------- */
async function partita(modo, init, opz) {
  const A = await apriCarriera166({ init: init || {}, nome: NOME }); let r = { modo, finita: false, fasi: {}, ev: [], note: ['non aperta'] }, c = {}, lm = null, velo = false;
  try {
    if (!A.W) throw new Error('nessuna settimana con giornata di lega');
    await apriPrompt166(A.page);
    r = await gioca166(A.page, modo, { seme: SEME, ...(opz || {}) }); velo = !!r.velo; lm = r.lm || null;
    if (r.finita) c = await chiudi166(A.page);
    r.errs = A.errs.slice(0, 3);
  } catch (e) { r.note = [...(r.note || []), 'flusso: ' + String(e.message).slice(0, 140)]; r.errs = A.errs.slice(0, 3); }
  await A.b.close(); A.srv.close();
  return { ...r, c, lm, velo, seq: seq166(r.ev || []) };
}
const passo = P => ((P.fasi.playing || 0) / Math.max(1, P.minMax || 0));
const sec = ms => (ms / 1000).toFixed(1) + ' s';
const tempi = P => `partita ${sec(P.tPartita || 0)} · gioco fluido ${sec(P.fasi.playing || 0)} · scene ${sec((P.fasi.hl_intro || 0) + (P.fasi.hl_move || 0) + (P.fasi.hl_choose || 0) + (P.fasi.hl_result || 0))} · prepartita ${sec((P.fasi.matchday || 0) + (P.fasi.formations || 0) + (P.fasi.walkout || 0))}`;

const verdeB = await prompt(false), rossoB = await prompt(true);
const intera = await partita('intera', {});
const solo = await partita('solo', {});
/* rosso: il bottone non esiste, quindi la modalita' si forza dal gancio di sonda e si preme «Gioca»; ci si ferma al 20' */
const rosso = await partita('intera', { __CPM_NO_G166: true, __CPM_SOLO166: true }, { fermaAlMinuto: 20 });
if (process.env.CPM_G166_DUMP) fs.writeFileSync(process.env.CPM_G166_DUMP, JSON.stringify({ intera, solo, rosso }));

let div = -1; for (let i = 0; i < Math.max(intera.seq.length, solo.seq.length); i++) if (JSON.stringify(intera.seq[i]) !== JSON.stringify(solo.seq[i])) { div = i; break; }
let uguali = 0; for (let i = 0; i < Math.min(intera.seq.length, solo.seq.length); i++) if (JSON.stringify(intera.seq[i]) === JSON.stringify(solo.seq[i])) uguali++;
const tipi = {}; intera.seq.forEach(e => { tipi[e.ev] = (tipi[e.ev] || 0) + 1; });
const giudicabile = intera.finita && solo.finita && intera.seq.length > 100;
const passiC = (P, eRosso) => {
  const pa = passo(P);
  return [
    { nome: '7 la partita e\' in modalita\' soli highlight e il velo copre il gioco fluido', ok: !!P.lm && P.lm.attiva === true && P.velo, info: `testimone ${JSON.stringify(P.lm)} · velo visto ${P.velo} · bottone «${P.bottone || ''}»` },
    { nome: '8 gioco fluido saltato (<= 400 ms reali per minuto di gioco)', ok: (P.minMax || 0) >= 15 && pa <= 400 && !!P.g166 && P.g166.battiti > 100, info: `${pa.toFixed(0)} ms/minuto (minuto raggiunto ${P.minMax}) · lotto ${JSON.stringify(P.g166 ? { battiti: P.g166.battiti, lotti: P.g166.lotti, ms: Math.round(P.g166.ms) } : null)} · intera ${passo(intera).toFixed(0)} ms/minuto` },
    ...(eRosso ? [] : [
      { nome: '9 fischio finale oltre il 90\' con almeno una scena', ok: P.finita && P.minMax >= 90 && P.scene >= 1, info: `finita=${P.finita} · minuto ${P.minMax} · scene ${P.scene}${P.scene ? '' : ' · NON GIUDICATO'} · ${(P.note || []).join(' ')}` },
      { nome: '10 libro mastro e risultato identici alla partita intera', ok: giudicabile && div < 0 && intera.seq.length === P.seq.length && JSON.stringify(intera.score) === JSON.stringify(P.score) && !!P.score,
        info: `voci uguali ${uguali}/${intera.seq.length} (soli highlight ${P.seq.length}) · risultato ${JSON.stringify(intera.score)} vs ${JSON.stringify(P.score)} · ${JSON.stringify(tipi)}${div >= 0 ? ' · prima differenza alla voce ' + div + ': ' + JSON.stringify(intera.seq[div]).slice(0, 140) + ' ≠ ' + JSON.stringify(P.seq[div]).slice(0, 140) : ''}${giudicabile ? '' : ' · NON GIUDICATO'}` },
      { nome: '11 tabellino, pagella e statistiche identici (schermata finale e voce di carriera)', ok: giudicabile && (intera.finale || '').length > 400 && intera.finale === P.finale && !!intera.c.voce && JSON.stringify(intera.c.voce) === JSON.stringify(P.c.voce),
        info: `schermata finale ${(intera.finale || '').length} vs ${(P.finale || '').length} car., uguale ${intera.finale === P.finale} · voce ${JSON.stringify(P.c.voce || null).slice(0, 200)}` },
      { nome: '12 intervista post-partita chiesta, come nella partita intera', ok: (P.c.iv231 | 0) >= 1 && (intera.c.iv231 | 0) === (P.c.iv231 | 0), info: `interviste chieste: soli highlight ${P.c.iv231 | 0} · intera ${intera.c.iv231 | 0}` },
      { nome: '13 dura meno della meta\' della partita intera', ok: giudicabile && P.tPartita > 0 && P.tPartita < intera.tPartita * 0.5, info: `soli highlight: ${tempi(P)} || intera: ${tempi(intera)}` }]),
    { nome: '  errori di pagina (partita)', ok: (P.errs || []).length === 0, info: JSON.stringify(P.errs || []) }];
};
const V = [...verdeB, ...passiC(solo, false)], R = [...rossoB, ...passiC(rosso, true)];
console.log('A. STATICO'); for (const x of st) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
console.log(`B+C. braccio VERDE (partita «${NOME}», seme del pilota ${SEME})`); for (const x of V) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
console.log('B+C. braccio ROSSO (__CPM_NO_G166: niente bottone, partita intera anche forzando la modalita\')'); for (const x of R) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome} — ${x.info}`);
console.log(`MISURA — durata reale: intera ${sec(intera.tPartita || 0)} · soli highlight ${sec(solo.tPartita || 0)} (${solo.scene} scene) · ${tempi(solo)}`);
const statico = st.every(x => x.ok), verde = statico && V.every(x => x.ok);
const cade = n => { const x = R.find(y => y.nome.startsWith(n + ' ')); return !!x && !x.ok; };
const rossoCade = cade('3') && cade('7') && cade('8') && R.filter(x => /^(4|5|6) /.test(x.nome)).every(x => x.ok) && R.filter(x => /errori/.test(x.nome)).every(x => x.ok);
console.log(`VERDE: ${verde ? 'PASSA' : 'NON PASSA'}`);
console.log(`ROSSO: ${rossoCade ? 'CADE (come deve) su 3, 7 e 8' : 'NON CADE come deve — il guardiano e\' cieco'}`);
process.exit(verde && rossoCade ? 0 : 1);
