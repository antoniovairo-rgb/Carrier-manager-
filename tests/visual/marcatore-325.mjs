#!/usr/bin/env node
/* GUARDIANO giro 325 (PO-377) — UN GOL, UN MARCATORE: la riga di cronaca, il badge, i momenti chiave e l'avviso del gol
   nominano la stessa persona.

   DA DOVE VIENE. Collaudo PO (giro 173, telefono): la riga dice «GOL! Jung (WRK) … su assist di Vogt», badge e avviso dicono
   Riedel. Misurato qui: quando la riga nasce dal narratore del motore (narra870) il nome e' gia' nel testo, ma le altre voci
   prendevano l'ultima battuta di un piano o un sorteggio dalla rosa.

   COSA MISURA. Partite VERE (nomi diversi = partite diverse; autoplay a seme fisso), tre su quattro a soli highlight (il modo del PO,
   quello con l'avviso) e una su quattro intera. Per ogni gol ambientale il testimone __CPM_M325 da', alla sorgente: la riga risolta,
   il testo dato a badge / momenti chiave / avviso, e marcatore e assist decisi dal motore. Discordanza =
     a) il motore ha deciso un marcatore e una voce ne nomina un altro;
     b) la riga nomina qualcuno della rosa ma non il nome di badge/avviso;
     c) badge, momenti chiave e avviso non portano lo stesso nome; l'avviso apparso a schermo (__CPM_GOL173) ne porta un altro;
     d) l'assist del motore non compare nella riga che lo racconta.
   Un gol senza voci registrate, una partita non arrivata al fischio, un conto dei gol che non torna col libro mastro: NON
   GIUDICATO = rosso. I gol dell'eroe in scena (percorsi highlight/setpiece del libro mastro) hanno un solo autore per
   costruzione e sono solo contati.

   DUE BRACCI nello stesso giro: verde (0 discordanze) e rosso `__CPM_NO_G325` (= 7.999.203: le discordanze ricompaiono).
     CPM_PARTITE=8 (per braccio) · CPM_BRACCIO=verde|rosso per girarne uno solo.                                              */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';

const PARTITE = +(process.env.CPM_PARTITE || 8);
const TETTO_MS = +(process.env.CPM_TETTO || 300000);
const BRACCI = process.env.CPM_BRACCIO ? [process.env.CPM_BRACCIO] : ['verde', 'rosso'];
const MIN_GOL = +(process.env.CPM_MIN_GOL || 6), MIN_MOTORE = +(process.env.CPM_MIN_MOTORE || 3);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const N = (s) => String(s || '').trim().toUpperCase();

async function partita(i, rosso) {
  const solo = i % 4 !== 3; const t0 = Date.now();/* tre a soli highlight (il modo del PO, con l'avviso), una intera */
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(([r, s]) => { window.__CPM_GLB = false; window.__CPM_M325 = []; if (s) window.__CPM_SOLO166 = 1; if (r) window.__CPM_NO_G325 = 1; }, [rosso, solo]);
  let finita = false, d = null;
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Marcatore' + (i * 13 + 5) });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 3250 + i * 41);
    await page.waitForFunction(() => { const p = window.__CPM_PHASE && window.__CPM_PHASE(); return p === 'ended' || p === 'ceremony'; }, null, { timeout: TETTO_MS, polling: 400 });
    finita = true;
  } catch (e) { errs.push('attesa: ' + String(e.message).slice(0, 90)); }
  try {
    d = await page.evaluate(() => ({ m: window.__CPM_M325 || [], ev: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal'),
      score: window.__CPM_SCORE ? window.__CPM_SCORE() : null, avv: window.__CPM_GOL173 || [], min: (window.__CPM_STATE && window.__CPM_STATE() || {}).clock }));
  } catch (e) { errs.push('lettura: ' + String(e.message).slice(0, 90)); }
  await page.close().catch(() => {});
  return { i, solo, finita, errs, sec: Math.round((Date.now() - t0) / 1000), ...(d || { m: [], ev: [], score: null, avv: [] }) };
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

const esiti = {};
for (const br of BRACCI) {
  const T = { gol: 0, motore: 0, disc: 0, nong: 0, anonime: 0, assist: 0, valide: 0, scena: 0, perSrc: {} };
  console.log(`\n=== MARCATORE 325 · braccio ${br.toUpperCase()}${br === 'rosso' ? ' (__CPM_NO_G325 = 7.999.203)' : ''} · ${PARTITE} partite ===`);
  for (let i = 0; i < PARTITE; i++) {
    const g = await partita(i, br === 'rosso'); const r = giudica(g);
    if (g.finita) T.valide++;
    for (const e of g.ev) { T.perSrc[e.src || '?'] = (T.perSrc[e.src || '?'] || 0) + 1; if (e.src === 'highlight' || e.src === 'setpiece') T.scena++; }
    T.gol += r.gol; T.motore += r.motore; T.disc += r.disc.length; T.nong += r.nong.length; T.anonime += r.anonime; T.assist += r.assist;
    console.log(`  partita ${i + 1} (${g.solo ? 'soli highlight' : 'intera'}) ${g.score ? (g.score.home | 0) + '-' + (g.score.away | 0) : '—'} · gol ambientali ${r.gol} (dal motore ${r.motore}) · discordanze ${r.disc.length} · ${g.sec} s${r.nong.length ? ' · NON GIUDICATO: ' + r.nong.join(' | ') : ''}`);
    for (const x of r.disc) console.log(`     ✗ ${x.dove}: ${x.motivi.join(' · ')}\n       «${x.riga}»`);
  }
  console.log(`  totale: ${T.gol} gol ambientali (${T.motore} col marcatore del motore, ${T.assist} con assist, ${T.anonime} righe senza nomi) · gol in scena dell'eroe ${T.scena} (solo contati) · percorsi: ${Object.entries(T.perSrc).map(([k, v]) => k + ' ' + v).join(' · ') || '—'}`);
  console.log(`  DISCORDANZE: ${T.disc} su ${T.gol} gol · non giudicati: ${T.nong} · partite al fischio ${T.valide}/${PARTITE}`);
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
}
console.log(`\n${codice ? '❌' : '✅'} marcatore-325 [${BRACCI.join('+')}] — ${motivi.join(' · ')}`);
process.exit(codice);
