#!/usr/bin/env node
/* [giro 259 · dubbio 4 del giro 253] GUARDIANO: la stessa posizione in classifica in TUTTE le schermate quando due squadre
   hanno pari punti e pari differenza reti (spareggio: gol fatti, poi l'ordine salvato — funzione unica ordinaClassifica259, src/09).
   Classifica di prova: noi (FC Werkstadt) e una rivale a pari punti e pari differenza reti, noi con PIU' gol fatti ma salvati
   DOPO la rivale (ordine salvato ≠ ordine dei gol fatti: e' il caso in cui gli spareggi diversi si vedono).
   Schermate lette: (1) schermata finale della partita, riga della tabella «classifica200-io»; (2) stessa schermata, riga
   dell'obiettivo «Finisci nei primi N · X° ora» («obiettivo224»); (3) testata della carriera «N° posto»; (4) scheda Classifica,
   riga «riga-mia-v2». Parte statica: nessun ordinamento della classifica per punti fuori dalla funzione unica (5 esenti dichiarati).
   Bracci: verde (gioco di oggi) e rosso __CPM_NO_G259 (ogni sito col suo ordinamento di prima). Verde = tutte e quattro uguali
   alla posizione attesa (3°) e statico pulito; il rosso deve dare posizioni DIVERSE fra le schermate. Una schermata non letta =
   non giudicato = rosso. */
import fs from 'node:fs';
import { apriCarriera166, apriPrompt166, gioca166, chiudi166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });

/* --- parte statica --- */
const src = fs.readdirSync(new URL('../../src/', import.meta.url)).filter(f => f.endsWith('.jsx'));
/* esenti: i due ordinamenti del simulatore (src/09, gia' punti·differenza·gol fatti, restituiscono l'ordine salvato), le due
   tabelle dei gironi delle nazionali (src/17, righe costruite sul momento), la riparazione della classifica (src/17) e la funzione unica */
const ESENTI = [/return s\.sort\(\(a,b\)=>b\.pts-a\.pts\|\|b\.gd-a\.gd\|\|b\.gf-a\.gf\)/, /return\[\.\.\.st\]\.sort\(\(a,b\)=>b\.pts-a\.pts\|\|b\.gd-a\.gd\|\|b\.gf-a\.gf\)/, /return\[me,\.\.\.rows\]\.sort/, /"g"\+i\)\)\]\.sort/, /standings:\[\.\.\.newP\.standings,\.\.\._add\]\.sort/, /return a\.sort\(\(x,y\)=>\(\(y\.pts/];
const residui = [];
for (const f of src) { const L = fs.readFileSync(new URL('../../src/' + f, import.meta.url), 'utf8').split('\n');
  L.forEach((l, i) => { const re = /\.sort\(\(([a-z]),([a-z])\)=>/g; let m; while ((m = re.exec(l))) { const seg = l.slice(m.index, m.index + 60);
    if (!/pts/.test(seg)) continue; const pre = l.slice(Math.max(0, m.index - 90), m.index + 70); if (ESENTI.some(r => r.test(pre))) continue; residui.push(`${f.slice(0, 2)}:${i + 1}`); } }); }
const statOk = residui.length === 0;

const POS_ATTESA = 3;
function classificaProva(st) {
  const altri = st.filter(t => t.id !== 'b04');
  const riv = altri[0]; const resto = altri.slice(1);
  const mk = (t, pts, gf, ga) => ({ ...t, played: 10, wins: Math.floor(pts / 3), draws: pts % 3, losses: 10 - Math.floor(pts / 3) - (pts % 3), pts, gf, ga, gd: gf - ga });
  const noi = st.find(t => t.id === 'b04');
  const out = [mk(resto[0], 26, 22, 8), mk(resto[1], 24, 20, 10), mk(riv, 20, 15, 10), mk(noi, 20, 20, 15)];
  resto.slice(2).forEach((t, i) => out.push(mk(t, Math.max(0, 18 - i), 10, 12 + i)));
  return { st: out, riv: riv.id };
}
const OBJ = [{ type: 'standing', target: 4, label: 'Finisci nei primi 4', bonus: { popularity: 15, value: 0.25 } }];
const posTesto = s => { const m = /(\d+)\s*°/.exec(s || ''); return m ? +m[1] : null; };

async function braccio(rosso) {
  const init = rosso ? { __CPM_NO_G259: true } : {};
  const A = await apriCarriera166({ init, nome: 'Collaudo Classifica' }); const r = { rosso, note: [] };
  try {
    if (!A.W) throw new Error('nessuna settimana con giornata di lega');
    const st0 = await A.page.evaluate(() => window.__CPM_CAREER.snapshot().standings);
    const P = classificaProva(st0); r.riv = P.riv;
    await apriPrompt166(A.page);
    const g = await gioca166(A.page, 'solo', { seme: 7300 }); r.finita = g.finita;
    if (g.finita) {
      await A.page.evaluate(({ st, o }) => window.__CPM_CAREER.patch({ standings: st, seasonObjectives: o }), { st: P.st, o: OBJ });
      for (let i = 0; i < 30 && r.fineTab == null; i++) { await sleep(300);
        const d = await A.page.evaluate(() => ({ io: (document.querySelector('[data-cpm="classifica200-io"]') || {}).textContent || null,
          ob: [...document.querySelectorAll('[data-cpm="obiettivo224"]')].map(x => ((x.lastElementChild || {}).textContent) || '').find(t => /ora/.test(t)) || null }));
        if (d.io) { r.fineTab = posTesto(d.io); r.fineObj = posTesto(d.ob); r.fineTxt = (d.ob || '').trim().slice(0, 60); } }
      await chiudi166(A.page);
    }
    await A.page.evaluate(({ st, o }) => window.__CPM_CAREER.patch({ standings: st, seasonObjectives: o }), { st: P.st, o: OBJ });
    await A.page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(900);
    r.testata = await A.page.evaluate(() => { const t = document.body.innerText || ''; const m = /(\d+)°\s*posto/.exec(t); return m ? +m[1] : null; });
    await A.page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await sleep(900);
    r.tabella = await A.page.evaluate(() => { const row = document.querySelector('[data-cpm="riga-mia-v2"]'); if (!row) return null; const rows = [...row.parentNode.children]; return rows.indexOf(row) + 1; });
    r.errs = A.errs.slice(0, 3);
  } catch (e) { r.note.push(String(e.message).slice(0, 160)); r.errs = A.errs.slice(0, 3); }
  await A.b.close(); A.srv.close(); return r;
}

const V = await braccio(false), R = await braccio(true);
const pos = r => [r.fineTab, r.fineObj, r.testata, r.tabella];
const letto = r => pos(r).every(x => Number.isInteger(x));
const verdeOk = letto(V) && pos(V).every(x => x === POS_ATTESA) && !(V.errs || []).length;
const rossoDiverge = letto(R) && new Set(pos(R)).size > 1;
console.log(`statico: ${statOk ? 'pulito' : 'residui ' + residui.join(', ')}`);
for (const r of [V, R]) console.log(`${r.rosso ? 'ROSSO __CPM_NO_G259' : 'VERDE'}: finale tabella ${r.fineTab} · finale obiettivo ${r.fineObj} («${r.fineTxt || ''}») · testata ${r.testata} · scheda Classifica ${r.tabella} · attesa ${POS_ATTESA} · finita ${r.finita}${r.note.length ? ' · note ' + r.note.join(' | ') : ''}${(r.errs || []).length ? ' · errori ' + r.errs.join(' | ') : ''}`);
const ok = statOk && verdeOk && rossoDiverge;
console.log(`${ok ? '✅' : '❌'} classifica-259: verde ${verdeOk ? 'stessa posizione ovunque' : 'NO'} · rosso ${rossoDiverge ? 'posizioni diverse (il rosso vede)' : 'NON GIUDICATO o uguale'} · statico ${statOk ? 'ok' : 'NO'}`);
fs.writeFileSync(new URL('./out/classifica-259.json', import.meta.url), JSON.stringify({ ok, statOk, residui, V, R }, null, 1));
process.exit(ok ? 0 : 1);
