#!/usr/bin/env node
/* GUARDIANO giro 325 (PO-377) — UN GOL, UN MARCATORE: la riga di cronaca, il badge, i momenti chiave e l'avviso del gol
   nominano la stessa persona.

   DA DOVE VIENE. Collaudo PO (giro 173, telefono): la riga dice «GOL! Jung (WRK) … su assist di Vogt», badge e avviso dicono
   Riedel. Misurato qui: quando la riga nasce dal narratore del motore (narra870) il nome e' gia' nel testo, ma le altre voci
   prendevano l'ultima battuta di un piano o un sorteggio dalla rosa.

   COSA MISURA. Partite VERE (nomi diversi = partite diverse; autoplay a seme fisso), giocate a soli highlight (il modo del PO, quello
   con l'avviso: stesso battito e stesso gestore dei gol della partita intera, che sul banco non arriva al fischio in 300 s —
   misurato 2 su 2; CPM_INTERE=1 CPM_TETTO=600000 ne gioca una su quattro intera). Per ogni gol ambientale il testimone __CPM_M325 da', alla sorgente: la riga risolta,
   il testo dato a badge / momenti chiave / avviso, e marcatore e assist decisi dal motore. Discordanza =
     a) il motore ha deciso un marcatore e una voce ne nomina un altro;
     b) la riga nomina qualcuno della rosa ma non il nome di badge/avviso;
     c) badge, momenti chiave e avviso non portano lo stesso nome; l'avviso apparso a schermo (__CPM_GOL173) ne porta un altro;
     d) l'assist del motore non compare nella riga che lo racconta.
   Un gol senza voci registrate, una partita non arrivata al fischio, un conto dei gol che non torna col libro mastro: NON
   GIUDICATO = rosso.

   [giro 437 PO-628, decisione PO del 22/11] ANCHE I GOL DELL'EROE IN SCENA, voce per voce. Per ogni gol o assist dell'eroe
   giocato in un highlight: la riga «X segna su assist di Y» (alla sorgente, __CPM_CRO802), il momento chiave (__CPM_MOM437,
   alla sorgente), il fatto del motore (__CPM_G437: chi segna e chi serve nell'evento che conta tabellino e pagelle) e, a fine
   partita, la pagella del motore. Discordanza =
     e) riga e momento chiave non nominano lo stesso marcatore o lo stesso assist (o manca l'uno o l'altro);
     f) il motore ha un altro marcatore o un altro assist della riga;
     g) in pagella chi la riga fa segnare (o servire) ha meno gol (o assist) di quelli raccontati in scena.
   Senza gol dell'eroe a sufficienza (CPM_MIN_EROE, di cui CPM_MIN_ASS «su assist di»): NON GIUDICATO = rosso.
   Corpi accesi (GLB), come chiede la direttiva del 29/07 per le prove sul gioco vero.

   DUE BRACCI nello stesso giro: verde (0 discordanze) e rosso `__CPM_NO_G325` + `__CPM_NO_G437` (le discordanze ricompaiono,
   quelle dei gol ambientali e quelle dei gol dell'eroe, ognuna giudicata da se').
     CPM_PARTITE=16 (per braccio; 8 fino al giro 437) · CPM_PAR325=2 pagine insieme · CPM_BRACCIO=verde|rosso per girarne uno solo.                                              */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';

const PARTITE = +(process.env.CPM_PARTITE || 16);/* [giro 437] 16: con 8 i gol dell'eroe erano 4-5 per braccio, sotto la copertura */
const TETTO_MS = +(process.env.CPM_TETTO || 300000);
const INTERE = !!process.env.CPM_INTERE;
const BRACCI = process.env.CPM_BRACCIO ? [process.env.CPM_BRACCIO] : ['verde', 'rosso'];
const MIN_GOL = +(process.env.CPM_MIN_GOL || 6), MIN_MOTORE = +(process.env.CPM_MIN_MOTORE || 3);
const MIN_EROE = +(process.env.CPM_MIN_EROE || 6), MIN_ASS = +(process.env.CPM_MIN_ASS || 1);
const GLB = process.env.CPM_GLB !== '0';
const PAR = Math.max(1, +(process.env.CPM_PAR325 || 2));/* partite aperte insieme: due pagine dimezzano il giro a corpi accesi */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const N = (s) => String(s || '').trim().toUpperCase();

async function partita(i, rosso) {
  const solo = !(INTERE && i % 4 === 3); const t0 = Date.now();
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(([r, s, g]) => { window.__CPM_GLB = g; window.__CPM_REC = 1; window.__CPM_M325 = []; window.__CPM_G437 = []; window.__CPM_MOM437 = []; if (s) window.__CPM_SOLO166 = 1; if (r) { window.__CPM_NO_G325 = 1; window.__CPM_NO_G437 = 1; } }, [rosso, solo, GLB]);
  let finita = false, d = null;/* nome dell'eroe: una parola sola, cosi' il cognome della riga e' il nome intero */
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Marcatore' + (i * 13 + 5) });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 3250 + i * 41);
    await page.waitForFunction(() => { const p = window.__CPM_PHASE && window.__CPM_PHASE(); return p === 'ended' || p === 'ceremony'; }, null, { timeout: TETTO_MS, polling: 400 });
    finita = true; await page.waitForTimeout(1200);/* le righe di cronaca del gol escono 140 ms dopo l'esito */
  } catch (e) { errs.push('attesa: ' + String(e.message).slice(0, 90)); }
  try {
    d = await page.evaluate(() => ({ m: window.__CPM_M325 || [], ev: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal'),
      score: window.__CPM_SCORE ? window.__CPM_SCORE() : null, avv: window.__CPM_GOL173 || [], min: (window.__CPM_STATE && window.__CPM_STATE() || {}).clock,
      g437: window.__CPM_G437 || [], mom437: window.__CPM_MOM437 || [], cro: (window.__CPM_CRO802 || []).filter(r => !r.intro && / segna/.test(r.txt) && /^⚽ /.test(r.txt)).map(r => ({ t: r.t, txt: r.txt })),
      pag: (() => { try { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); return M ? M.pagelle().map(p => ({ n: p.nome, team: p.team, gol: p.gol | 0, assist: p.assist | 0, eroe: !!p.eroe })) : null; } catch (e) { return null; } })() }));
  } catch (e) { errs.push('lettura: ' + String(e.message).slice(0, 90)); }
  await page.close().catch(() => {});
  return { i, solo, finita, errs, sec: Math.round((Date.now() - t0) / 1000), eroe: 'Marcatore' + (i * 13 + 5), ...(d || { m: [], ev: [], score: null, avv: [], g437: [], mom437: [], cro: [], pag: null }) };
}

function giudica(g) {
  const out = { gol: 0, motore: 0, disc: [], nong: [], anonime: 0, assist: 0 };
  if (!g.finita) out.nong.push('partita non arrivata al fischio');
  if (g.errs.length) out.nong.push('errore: ' + g.errs[0]);
  const amb = g.ev.filter(e => e.src === 'microsim' || e.src === 'cronaca');
  if (amb.length !== g.m.length) out.nong.push(`gol ambientali del libro mastro ${amb.length} ≠ gol col testimone ${g.m.length}`);
  for (const x of g.m) {
    out.gol++; const v = x.voci, dove = `${x.m}' ${x.ef === 'team_goal' ? 'noi' : 'loro'} [${x.src}${x.motore ? '·motore' : ''}]`;
    if (!v || !v.nome) { out.nong.push(dove + ': nessuna voce registrata'); continue; }
    const nome = N(v.nome), riga = N(x.riga), motivi = [];
    if (x.motore && x.chi) { out.motore++; if (N(x.chi) !== nome) motivi.push(`motore «${x.chi}» ≠ badge «${v.nome}»`); }
    const inRiga = (x.rosa || []).filter(n => n && riga.includes(N(n)));
    if (!inRiga.length) out.anonime++;
    else if (!riga.includes(nome)) motivi.push(`la riga nomina ${inRiga.slice(0, 3).join(', ')} ≠ badge «${v.nome}»`);
    if (!N(v.badge).includes(nome) || !N(v.evento).includes(nome)) motivi.push('badge e momenti chiave non portano lo stesso nome');
    if (v.avviso != null && N(v.avviso) !== nome) motivi.push(`avviso «${v.avviso}» ≠ badge «${v.nome}»`);
    const a = g.avv.find(q => (q.min | 0) === (x.m | 0)); if (a && N(a.nome) !== nome) motivi.push(`avviso a schermo «${a.nome}» ≠ badge «${v.nome}»`);
    if (x.assist) { out.assist++; if (!riga.includes(N(x.assist)) && / SU ASSIST DI /.test(riga)) motivi.push(`assist del motore «${x.assist}» assente dalla riga`); }
    if (motivi.length) out.disc.push({ dove, motivi, riga: x.riga.slice(0, 90) });
  }
  return out;
}

/* [giro 437] i gol dell'eroe in scena, voce per voce */
const U = (s) => N(s).split(/\s+/).pop();
const stesso = (a, b) => (a == null || a === '') ? (b == null || b === '') : (b != null && b !== '' && U(a) === U(b));
function giudicaEroe(g) {
  const out = { n: 0, gol: 0, ass: 0, conAss: 0, disc: [], nong: [] };
  const H = N(g.eroe), eroeN = (x) => x === '{EROE}' ? g.eroe : x;
  const usate = new Set(), conta = {};
  const piu = (nome, k) => { const u = U(nome); conta[u] = conta[u] || { gol: 0, assist: 0 }; conta[u][k]++; };
  for (const x of g.g437) {
    out.n++; if (x.key === 'goal') out.gol++; else out.ass++;
    const dove = `${x.min}' ${x.key === 'goal' ? 'gol dell\'eroe' : 'assist dell\'eroe'}`, motivi = [];
    const ri = g.cro.findIndex((r, k) => !usate.has(k) && Math.abs((r.t | 0) - x.min) <= 1);
    if (ri < 0) { out.nong.push(dove + ': nessuna riga «segna» in cronaca'); continue; }
    usate.add(ri); const riga = g.cro[ri].txt;
    const mr = riga.match(/^⚽ (.+?) segna(?: su assist di (.+?))?! /); if (!mr) { out.nong.push(dove + ': riga illeggibile «' + riga + '»'); continue; }
    const rMar = mr[1], rAss = mr[2] || null;
    const tipo = x.key === 'goal' ? 'player_goal' : 'player_assist';
    const mo = g.mom437.find(q => q.type === tipo && Math.abs((q.mc | 0) - x.min) <= 1);
    let mMar = null, mAss = null;
    if (!mo) motivi.push('nessun momento chiave');
    else if (x.key === 'goal') { mMar = g.eroe; const a = mo.txt.match(/\(assist di (.+?)\)/); mAss = a ? a[1] : null; }
    else { const a = mo.txt.match(/Assist per (.+?) al /); mMar = a ? a[1] : null; mAss = g.eroe; }
    if (x.key === 'goal' && !stesso(rMar, g.eroe)) motivi.push(`la riga fa segnare «${rMar}», non l'eroe`);
    if (x.key === 'assist' && !stesso(rAss, g.eroe)) motivi.push(`la riga da' l'assist a «${rAss}», non all'eroe`);
    if (mo && !stesso(rMar, mMar)) motivi.push(`marcatore: riga «${rMar}» ≠ momento chiave «${mMar}»`);
    if (mo && !stesso(rAss, mAss)) motivi.push(`assist: riga «${rAss || '—'}» ≠ momento chiave «${mAss || '—'}»`);
    if (!x.gol) motivi.push('il motore non ha scritto il gol');
    else {
      if (!stesso(rMar, eroeN(x.gol.chi))) motivi.push(`marcatore: riga «${rMar}» ≠ motore «${eroeN(x.gol.chi)}»`);
      if (!stesso(rAss, eroeN(x.gol.assist))) motivi.push(`assist: riga «${rAss || '—'}» ≠ motore «${eroeN(x.gol.assist) || '—'}»`);
    }
    if (rAss && x.key === 'goal') out.conAss++;
    piu(rMar, 'gol'); if (rAss) piu(rAss, 'assist');
    if (motivi.length) out.disc.push({ dove, motivi, riga });
  }
  if (out.n && !g.pag) out.nong.push('pagelle del motore non lette');
  else if (out.n) for (const [u, c] of Object.entries(conta)) {
    const lato = (g.pag.find(p => p.eroe) || {}).team;
    const rows = g.pag.filter(p => p.team === lato && (p.eroe ? u === U(H) : U(p.n) === u));
    const pg = rows.reduce((a, p) => a + p.gol, 0), pa = rows.reduce((a, p) => a + p.assist, 0);
    if (pg < c.gol || pa < c.assist) out.disc.push({ dove: 'pagella', motivi: [`«${u}»: in scena ${c.gol} gol e ${c.assist} assist, in pagella ${pg} gol e ${pa} assist`], riga: '' });
  }
  return out;
}

const esiti = {};
for (const br of BRACCI) {
  const T = { gol: 0, motore: 0, disc: 0, nong: 0, anonime: 0, assist: 0, valide: 0, scena: 0, perSrc: {}, e: { n: 0, gol: 0, ass: 0, conAss: 0, disc: 0, nong: 0 } };
  console.log(`\n=== MARCATORE 325 · braccio ${br.toUpperCase()}${br === 'rosso' ? ' (__CPM_NO_G325 = 7.999.203)' : ''} · ${PARTITE} partite ===`);
  const giocate = new Array(PARTITE);
  for (let k = 0; k < PARTITE; k += PAR) await Promise.all(Array.from({ length: Math.min(PAR, PARTITE - k) }, (_, j) => partita(k + j, br === 'rosso').then(g => { giocate[k + j] = g; })));
  for (let i = 0; i < PARTITE; i++) {
    const g = giocate[i]; const r = giudica(g); const re = giudicaEroe(g);
    T.e.n += re.n; T.e.gol += re.gol; T.e.ass += re.ass; T.e.conAss += re.conAss; T.e.disc += re.disc.length; T.e.nong += re.nong.length;
    if (g.finita) T.valide++;
    for (const e of g.ev) { T.perSrc[e.src || '?'] = (T.perSrc[e.src || '?'] || 0) + 1; if (e.src === 'highlight' || e.src === 'setpiece') T.scena++; }
    T.gol += r.gol; T.motore += r.motore; T.disc += r.disc.length; T.nong += r.nong.length; T.anonime += r.anonime; T.assist += r.assist;
    console.log(`  partita ${i + 1} (${g.solo ? 'soli highlight' : 'intera'}) ${g.score ? (g.score.home | 0) + '-' + (g.score.away | 0) : '—'} · gol ambientali ${r.gol} (dal motore ${r.motore}) · discordanze ${r.disc.length} · ${g.sec} s${r.nong.length ? ' · NON GIUDICATO: ' + r.nong.join(' | ') : ''}`);
    for (const x of r.disc) console.log(`     ✗ ${x.dove}: ${x.motivi.join(' · ')}\n       «${x.riga}»`);
    console.log(`     eroe in scena: ${re.gol} gol (${re.conAss} su assist) · ${re.ass} assist · discordanze ${re.disc.length}${re.nong.length ? ' · NON GIUDICATO: ' + re.nong.join(' | ') : ''}`);
    for (const x of re.disc) console.log(`     ✗ ${x.dove}: ${x.motivi.join(' · ')}${x.riga ? `\n       «${x.riga}»` : ''}`);
  }
  console.log(`  totale: ${T.gol} gol ambientali (${T.motore} col marcatore del motore, ${T.assist} con assist, ${T.anonime} righe senza nomi) · gol in scena dell'eroe ${T.scena} (solo contati) · percorsi: ${Object.entries(T.perSrc).map(([k, v]) => k + ' ' + v).join(' · ') || '—'}`);
  console.log(`  DISCORDANZE: ${T.disc} su ${T.gol} gol · non giudicati: ${T.nong} · partite al fischio ${T.valide}/${PARTITE}`);
  console.log(`  EROE IN SCENA: ${T.e.gol} gol (${T.e.conAss} su assist) + ${T.e.ass} assist · DISCORDANZE ${T.e.disc} · non giudicati ${T.e.nong}`);
  esiti[br] = T;
}
await b.close(); srv.close();

let codice = 0; const motivi = [];
for (const br of BRACCI) {
  const T = esiti[br];
  if (T.nong || T.valide < PARTITE) { codice = 2; motivi.push(`${br}: NON GIUDICATO (${T.nong} voci, ${T.valide}/${PARTITE} partite al fischio)`); continue; }
  if (T.gol < MIN_GOL || T.motore < MIN_MOTORE) { codice = 2; motivi.push(`${br}: copertura insufficiente (${T.gol} gol, ${T.motore} dal motore; servono ${MIN_GOL} e ${MIN_MOTORE})`); continue; }
  if (br === 'verde' && T.disc) { codice = 2; motivi.push(`verde: ${T.disc} discordanze su ${T.gol} gol (attese 0)`); }
  if (br === 'rosso' && !T.disc) { codice = 2; motivi.push(`rosso: 0 discordanze su ${T.gol} gol — il braccio rosso non fa ricomparire il difetto`); }
  if (br === 'verde' && !T.disc) motivi.push(`verde: 0 discordanze su ${T.gol} gol (${T.motore} dal motore)`);
  if (br === 'rosso' && T.disc) motivi.push(`rosso: ${T.disc} discordanze su ${T.gol} gol, come atteso`);
  /* [giro 437] i gol dell'eroe, giudicati da se' */
  const E = T.e;
  if (E.nong) { codice = 2; motivi.push(`${br} eroe: NON GIUDICATO (${E.nong} voci)`); }
  else if (E.n < MIN_EROE || E.conAss < MIN_ASS) { codice = 2; motivi.push(`${br} eroe: copertura insufficiente (${E.n} gol/assist dell'eroe, ${E.conAss} gol su assist; servono ${MIN_EROE} e ${MIN_ASS})`); }
  else if (br === 'verde' && E.disc) { codice = 2; motivi.push(`verde eroe: ${E.disc} discordanze su ${E.n} (attese 0)`); }
  else if (br === 'rosso' && !E.disc) { codice = 2; motivi.push(`rosso eroe: 0 discordanze su ${E.n} — __CPM_NO_G437 non fa ricomparire il difetto`); }
  else motivi.push(`${br} eroe: ${E.disc} discordanze su ${E.n} gol/assist (${E.conAss} gol su assist)${br === 'rosso' ? ', come atteso' : ''}`);
}
console.log(`\n${codice ? '❌' : '✅'} marcatore-325 [${BRACCI.join('+')}] — ${motivi.join(' · ')}`);
process.exit(codice);
