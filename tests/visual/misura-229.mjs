#!/usr/bin/env node
/* [giro 229 · PO-494] SONDA DI MISURA (non guardiano) — la partita a soli momenti salienti fuori dal campionato senza posta.
   Per ogni competizione (coppa nazionale · Europa girone · Europa eliminazione diretta · Europa eliminazione con pareggio → rigori ·
   amichevole della Nazionale) gioca la STESSA partita (stesso salvataggio, stessa settimana, stesso pilota seedato) due volte:
   intera e a soli salienti, poi chiude il dopo-partita e confronta lo stato della carriera salvato (localStorage cpm-v3) campo per campo.
   La modalita' si accende col bottone se c'e', altrimenti dal gancio di sonda __CPM_SOLO166 (misura prima della correzione).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node misura-229.mjs [casi separati da virgola]   ·   CPM_M229_JSON=<file> scrive il dettaglio */
import fs from 'node:fs';
import { apriCarriera166, apriPrompt166, gioca166, seq166, chiudi166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const SEME = +(process.env.CPM_M229_SEME || 7300), NOME = process.env.CPM_M229_NOME || 'Collaudo Coppe';
const CASI = (process.argv[2] || 'cup,euro_group,euro_ko,euro_ko_rigori,national').split(',');

/* il salvataggio della competizione: una sola gara nella settimana W, del tipo voluto */
async function inietta(page, W, caso) {
  return page.evaluate(({ w, caso }) => {
    const C = window.__CPM_CAREER, p = C.snapshot();
    const opp = CLUBS.find(c => c.lg !== 'Deutsche Liga' && !c.isU18 && c.p >= 72 && c.p <= 80);
    const tipo = caso === 'cup' ? 'cup' : caso === 'national' ? 'national' : caso === 'euro_group' ? 'euro_group' : 'euro';
    const cupOpp = CLUBS.find(c => c.lg === (p.club && p.club.lg) && c.id !== (p.club && p.club.id) && !c.isU18);/* un club del campionato: con un id fuori lega il gioco sorteggia l'avversario (pick) e le due partite non sono la stessa */
    const md = tipo === 'cup' ? { matchday: 991, week: w, opponentId: cupOpp.id, opponentName: cupOpp.n, isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 2, cupRoundName: 'Ottavi di Finale' }
      : tipo === 'national' ? { matchday: 995, week: w, opponentId: 'es-nt', opponentName: 'Spagna', isHome: true, played: false, result: null, type: 'national' }
      : { matchday: tipo === 'euro_group' ? 981 : 996, week: w, opponentId: opp.id, opponentName: opp.n, isHome: true, played: false, result: null, type: tipo, competition: 'UCL', ...(tipo === 'euro' ? { euroPhase: 'r16', cupRoundName: 'Ottavi di Finale' } : {}) };
    const cal = (p.calendar || []).filter(m => m.week !== w);
    C.patch({ week: w, weekLived: false, calendar: [...cal, md],
      cup: { active: true, round: 2, eliminated: false, champion: false, results: [{ round: 1, name: 'Sedicesimi', opponent: 'FC Rovigo', homeScore: 2, awayScore: 0, won: true }] },
      euro: { active: true, competition: 'UCL', phase: tipo === 'euro' ? 'r16' : 'group', groupOpponents: [{ id: opp.id, n: opp.n }], pts: 0, groupResults: [], qualified: tipo === 'euro', champion: false, eliminated: false, koResults: [], koRound: 0 } });
    return { tipo, opp: md.opponentName };
  }, { w: W, caso });
}

async function gioca(caso, modo) {
  const A = await apriCarriera166({ nome: NOME, reseed: +(process.env.CPM_M229_RESEED || 4242) }); const out = { caso, modo, finita: false };
  try {
    if (!A.W) throw new Error('nessuna settimana di lega');
    const inj = await inietta(A.page, A.W, caso); await sleep(600);
    out.md = await A.page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
    /* il prompt vero della settimana: apriPartita mette tipo e stato del mister */
    const pr = await apriPrompt166(A.page, inj.tipo); out.bottoni = pr.bottoni; out.tastoSolo = pr.solo; out.nota = pr.nota;
    const r = await gioca166(A.page, modo === 'solo' && pr.solo ? 'solo' : 'intera', { seme: SEME, forzaSolo: modo === 'solo' && !pr.solo, rigoriAllaScena: caso === 'euro_ko_rigori' ? 1 : 0 });
    Object.assign(out, { finita: r.finita, score: r.score, minMax: r.minMax, scene: r.scene, tPartita: r.tPartita, lm: r.lm, velo: r.velo, rigori: !!r.rigori, rigoriForzati: r.rigoriForzati || null, finale: r.finale, seq: seq166(r.ev || []), note: r.note });
    if (r.finita) { out.c = await chiudi166(A.page); await sleep(1500); }
    out.stato = await A.page.evaluate(() => (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player) || null);
    out.errs = A.errs.slice(0, 4);
  } catch (e) { out.err = String(e.message).slice(0, 200); out.errs = A.errs.slice(0, 4); }
  await A.b.close(); A.srv.close(); return out;
}

/* differenze campo per campo (percorso → valori), ignorando i timestamp da orologio da polso */
const IGN = /(^|\.)(t|ts|savedAt|lastSave|lastPlayed|_t\d*|time|createdAt|updatedAt)$/;
function diff(a, b, pre = '', out = []) {
  if (out.length > 60) return out;
  if (a === b) return out;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') { if (!IGN.test(pre)) out.push({ k: pre, intera: JSON.stringify(a)?.slice(0, 160), solo: JSON.stringify(b)?.slice(0, 160) }); return out; }
  const ks = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of ks) diff(a[k], b[k], pre ? pre + '.' + k : k, out);
  return out;
}

const RIS = [];
for (const caso of CASI) {
  /* CPM_M229_CONTROLLO=1: il secondo braccio e' ANCH'ESSO intero — misura quanto due partite intere differiscono gia' fra loro */
  const I = await gioca(caso, 'intera'), S = await gioca(caso, process.env.CPM_M229_CONTROLLO === '1' ? 'intera' : 'solo');
  let div = -1; for (let i = 0; i < Math.max(I.seq?.length || 0, S.seq?.length || 0); i++) if (JSON.stringify(I.seq[i]) !== JSON.stringify(S.seq[i])) { div = i; break; }
  const d = (I.stato && S.stato) ? diff(I.stato, S.stato) : [{ k: 'stato', intera: !!I.stato, solo: !!S.stato }];
  const r = { caso, tasto: { intera: I.tastoSolo, solo: S.tastoSolo, bottoni: I.bottoni }, modoSolo: S.lm, velo: S.velo,
    finite: [I.finita, S.finita], minuti: [I.minMax, S.minMax], scene: [I.scene, S.scene], rigori: [I.rigori, S.rigori], rigoriForzati: [I.rigoriForzati, S.rigoriForzati],
    score: [I.score, S.score], tempi: [I.tPartita, S.tPartita], ledger: { n: [I.seq?.length, S.seq?.length], primaDiff: div, voceI: div >= 0 ? JSON.stringify(I.seq[div]).slice(0, 200) : null, voceS: div >= 0 ? JSON.stringify(S.seq[div]).slice(0, 200) : null },
    finaleUguale: I.finale === S.finale, finaleLen: [I.finale?.length, S.finale?.length], iv: [I.c?.iv231 | 0, S.c?.iv231 | 0], iv183: [I.c?.iv183 || null, S.c?.iv183 || null],
    voce: [I.c?.voce || null, S.c?.voce || null], diffStato: d, errs: [I.errs, S.errs], err: [I.err || null, S.err || null], note: [I.note, S.note] };
  RIS.push(r);
  console.log(`\n== ${caso} ==`);
  console.log(`  tasto soli salienti nel prompt: ${r.tasto.intera} · bottoni ${JSON.stringify(r.tasto.bottoni)}`);
  console.log(`  modalita' nella partita «solo»: ${JSON.stringify(r.modoSolo)} · velo ${r.velo}`);
  console.log(`  finite ${r.finite} · minuto ${r.minuti} · scene ${r.scene} · rigori ${r.rigori} (forzati ${JSON.stringify(r.rigoriForzati)}) · risultato ${JSON.stringify(r.score)} · tempo ${r.tempi.map(x => ((x || 0) / 1000).toFixed(1) + 's')}`);
  console.log(`  libro mastro ${r.ledger.n} · prima differenza ${r.ledger.primaDiff}${r.ledger.primaDiff >= 0 ? ' ' + r.ledger.voceI + ' ≠ ' + r.ledger.voceS : ''}`);
  console.log(`  schermata finale uguale ${r.finaleUguale} (${r.finaleLen}) · interviste ${r.iv} · decisione ${JSON.stringify(r.iv183).slice(0, 200)}`);
  console.log(`  differenze nello stato salvato: ${d.length}`); for (const x of d.slice(0, 40)) console.log(`    ${x.k}: intera ${x.intera} · solo ${x.solo}`);
  console.log(`  errori ${JSON.stringify(r.errs)} ${JSON.stringify(r.err)} · note ${JSON.stringify(r.note)}`);
}
if (process.env.CPM_M229_JSON) fs.writeFileSync(process.env.CPM_M229_JSON, JSON.stringify(RIS, null, 1));
