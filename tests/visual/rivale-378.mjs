#!/usr/bin/env node
/* [giro 378 · PO-656 + PO-657, decisioni PO «Sempre il numero» / «Riscriverle col numero»]
 * GUARDIANO «IL RIVALE DICE LE STAGIONI VERE» — non-gate, carriera/testi. Funzioni VERE del gioco su carriere sintetiche
 * (48 rivali x 6 stagioni da professionista, un rivale su tre con piu' stagioni di quelle da pro = vale il minore):
 *   I  intervista dopo la partita col club del rivale (intervista183 vera, posta165 vera, vittoria e pareggio): mai «di sempre»;
 *      dalla terza «il tuo rivale da N stagioni» con N vero, in seconda «dalla scorsa stagione», in prima nessuna frase sugli anni;
 *      la memoria della stagione resta sul testo del catalogo (la stessa domanda non torna due volte);
 *   S  capitolo del rivale della «Tua storia» (storyChapter vera, rivali «amico» e «rispettato»): mai «ormai» / «col tempo»;
 *      frase dell'amicizia/rispetto col numero vero (stessa regola);
 *   C  copertura: almeno 40 interviste del rivale e 40 frasi amico/rispetto giudicate, almeno 15 col numero; nulli/errori = rosso.
 * Rosso: window.__CPM_NO_G378 = testi di prima (I e S devono cadere). Uso: CPM_PROVA_ROSSO=1 node rivale-378.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const CLUB = { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 82, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' };
const SAVE = { phase: 'career', player: { name: 'Probe Storia', nation: 'Italia', avatarId: 0, proStatus: 'pro', proSeason: 3, season: 3, week: 5, age: 20, ovr: 70,
  campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3, tutorialDone: true, weekLived: false, seasonPledge: { season: 3, tone: 'equilibrato' },
  club: CLUB, stats: { 'velocità': 70, tecnica: 70, fisico: 70, 'mentalità': 70, tiro: 70, passaggio: 70, dribbling: 70, posizionamento: 70 },
  form: 70, morale: 70, fatigue: 10, popularity: 30, value: 5, bankBalance: 9000, goals: 2, assists: 1, matches: 4, calendar: [], contract: { duration: 3, wage: 3000, expiresAtSeason: 6 } } };


const SIM = ({ rosso, club }) => {
  delete window.__CPM_NO_G355; delete window.__CPM_NO_G362; if (rosso) window.__CPM_NO_G378 = true; else delete window.__CPM_NO_G378;
  const C = window.__CPM_CAREER; if (!C || typeof C.storyChapter !== 'function') return { cieco: 'storyChapter non esposta' };
  if (typeof intervista183 !== 'function' || typeof memIv183 !== 'function') return { cieco: 'intervista183 non raggiungibile' };
  const RV = { id: 'rvc', n: 'Atletico Norte', p: 78, lg: club.lg };
  const out = { iv: [], st: [], nulliSt: 0, errori: [], ripetute: 0, memProvate: 0 };
  for (let r = 0; r < 48; r++) {
    const name = 'Rivale' + String.fromCharCode(65 + (r % 26)) + ' ' + ['Bauer', 'Costa', 'Wolf', 'Greco'][r % 4] + r;
    for (let anni = 1; anni <= 6; anni++) {
      const proSeason = 2 + (r % 2), sn = proSeason + anni - 1, wk = 10;
      const rel = ['amico', 'rispettato'][r % 2];
      const rival = { name, club: RV, totalGoals: 30, goals: 3, seasons: anni + (r % 3 === 1 ? 2 : 0), ovr: 70, age: 19 + anni, relationship: anni >= 2 ? rel : 'sconosciuto', trophies: 0 };
      const mh = []; for (let i = 0; i < wk - 2; i++) mh.push({ week: i + 1, opponent: 'Squadra ' + i, goals: 0, won: true });
      const base = { ...window.__CPM_P355, name: 'Probe ' + r, season: sn, week: wk, proStatus: 'pro', proSeason, age: 19 + anni, club, totalGoals: 30, goals: 3,
        matches: wk - 1, history: [], matchHistory: mh, arcSeen: {}, nationalCaps: 0, isCaptain: false, trophies: [], standings: [], ivMem183: null,
        calendar: [{ matchday: 9, week: wk, opponentId: RV.id, opponentName: RV.n, isHome: true, played: false }], rival };
      /* I · intervista dopo la gara col rivale */
      for (const esito of ['win', 'draw']) {
        const res = { opponent: RV.n, goals: 1, assists: 0, rating: 7, won: esito === 'win', drew: esito === 'draw', isHome: true, context: 'career' };
        const md = { type: 'league', opponentId: RV.id, opponentName: RV.n, matchday: 9, isHome: true };
        let d; try { d = intervista183(base, md, res); } catch (e) { out.errori.push('iv ' + String(e).slice(0, 80)); continue; }
        if (!d || !d.si || !d.q) { out.errori.push('iv nulla: ' + (d && d.motivo)); continue; }
        const t = String(d.q.q || '');
        if (!/rivale/.test(t)) continue; /* un'altra domanda della posta: non giudicata qui, contata nella copertura */
        out.iv.push({ anni: Math.min(rival.seasons, anni), t });
        /* memoria: registrata la domanda, la stessa partita non deve rifarla */
        if (/Di fronte c'era il tuo rivale/.test(t)) { out.memProvate++; const p2 = memIv183(base, d.q); const d2 = intervista183(p2, md, res);
          if (d2 && d2.q && /Di fronte c'era il tuo rivale/.test(String(d2.q.q || ''))) out.ripetute++; }
      }
      /* S · capitolo della «Tua storia» */
      if (anni >= 2) for (const w of [10, 13, 16, 19, 22, 25]) {
        const mh2 = []; for (let i = 0; i < w - 2; i++) mh2.push({ week: i + 1, opponent: 'Squadra ' + i, goals: (i % 2) ? 1 : 0, won: true });
        mh2.push({ week: w - 1, opponent: 'Squadra Z', goals: 1, won: true });
        const hist = []; for (let s = proSeason; s < sn; s++) hist.push({ season: s, club: club.n, clubId: club.id, goals: 3, matches: 3 });
        const p = { ...base, week: w, matches: w - 1, matchHistory: mh2, history: hist, rival: { ...rival },
          calendar: [{ matchday: w - 1, week: w, opponentId: RV.id, opponentName: RV.n, isHome: w % 2 === 0, played: false }] };
        let ch; try { ch = C.storyChapter(p); } catch (e) { out.errori.push('st ' + String(e).slice(0, 80)); continue; }
        if (!ch || !/^rivw1/.test(ch.key || '')) { out.nulliSt++; (out.altri = out.altri || {})[ch ? String(ch.key).replace(/_.*$/, '') : 'null'] = 1; continue; }
        out.st.push({ anni: Math.min(rival.seasons, anni), rel, t: (ch.title || '') + ' ¦ ' + (ch.body || '') });
      }
    }
  }
  /* il capitolo pesca UN angolo fra i tanti: la frase amico/rispetto si giudica anche direttamente, forzando l'angolo */
  return out;
};

const AMICO = /siete diventati amici|vi sentite/, RISP = /rispetto, quello vero/;
const giudica = (d) => {
  const viol = []; let numIv = 0, numSt = 0, frasi = 0;
  for (const s of d.iv) {
    if (/di sempre|da anni|eterni/.test(s.t)) viol.push({ k: 'iv-vago', anni: s.anni, t: s.t });
    for (const x of s.t.matchAll(/(\d+) stagion([ei])\b/g)) { numIv++; if (+x[1] !== s.anni || +x[1] < 3) viol.push({ k: 'iv-numero', anni: s.anni, t: s.t }); }
    if (/scorsa stagione/.test(s.t) && s.anni !== 2) viol.push({ k: 'iv-scorsa', anni: s.anni, t: s.t });
    if (/Di fronte c'era il tuo rivale/.test(s.t)) { const atteso = s.anni >= 3 ? `il tuo rivale da ${s.anni} stagioni.` : s.anni === 2 ? 'il tuo rivale dalla scorsa stagione.' : 'il tuo rivale.';
      if (s.t.indexOf(atteso) < 0) viol.push({ k: 'iv-atteso', anni: s.anni, t: 'atteso «' + atteso + '»: ' + s.t }); }
  }
  for (const s of d.st) {
    if (/\bormai vi sentite|Col tempo tra voi/i.test(s.t)) viol.push({ k: 'st-vago', anni: s.anni, t: s.t.slice(0, 160) });
    const m = s.t.match(/[^.:]*(siete diventati amici|vi sentite|rispetto, quello vero)[^.]*/); if (!m) continue;
    frasi++; const f = m[0];
    for (const x of f.matchAll(/(\d+) stagion([ei])\b/g)) { numSt++; if (+x[1] !== s.anni || +x[1] < 3) viol.push({ k: 'st-numero', anni: s.anni, t: f }); }
    if (s.anni >= 3 && !/\d+ stagioni/.test(f)) viol.push({ k: 'st-senza-numero', anni: s.anni, t: f });
    if (s.anni === 2 && !/Dalla scorsa stagione/.test(f)) viol.push({ k: 'st-senza-numero', anni: s.anni, t: f });
  }
  return { viol, numIv, numSt, frasi };
};

const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const giro = async (rosso) => {
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(sv => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); window.__CPM_P355 = sv.player; }, SAVE);
  let pronto = false;
  for (let t = 0; t < 3 && !pronto; t++) {
    try {
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
      await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
      await page.waitForFunction(() => window.__CPM_CAREER && typeof window.__CPM_CAREER.storyChapter === 'function' && typeof intervista183 === 'function', { timeout: 30000 }); pronto = true;
    } catch (e) { console.log('  · caricamento ' + (t + 1) + ' fallito: ' + String(e.message).slice(0, 80)); }
  }
  if (!pronto) { await page.close(); return { cieco: 'carriera non montata' }; }
  const d = await page.evaluate(SIM, { rosso, club: CLUB });
  d.pageerr = errs; await page.close(); return d;
};


const ROSSO = process.env.CPM_PROVA_ROSSO === '1';
let esito = true; const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) esito = false; };
const conta = (g, k) => g.viol.filter(v => v.k.startsWith(k)).length;
const V = await giro(false);
console.log('── rivale-378 · braccio VERDE (le stagioni vere)');
if (V.cieco) ok(false, 'non giudicato: ' + V.cieco);
else {
  const g = giudica(V);
  console.log(`  interviste del rivale ${V.iv.length} · capitoli ${V.st.length} (nulli ${V.nulliSt} ${JSON.stringify(V.altri||{})}) · frasi amico/rispetto ${g.frasi} · numeri giudicati intervista ${g.numIv} storia ${g.numSt} · errori ${V.errori.length} · pageerror ${V.pageerr.length}`);
  ok(V.errori.length === 0 && V.pageerr.length === 0 && V.nulliSt === 0, `C nessun errore (non giudicato = rosso)${V.errori.length ? ': ' + V.errori[0] : ''}`);
  ok(V.iv.length >= 40 && g.frasi >= 40, 'C almeno 40 interviste del rivale e 40 frasi amico/rispetto giudicate');
  ok(g.numIv >= 15 && g.numSt >= 15, `C almeno 15 «N stagioni» giudicati in intervista e in storia (${g.numIv} · ${g.numSt})`);
  ok(conta(g, 'iv') === 0, `I l'intervista dice le stagioni vere, mai «di sempre» (${conta(g, 'iv')})`);
  ok(V.memProvate >= 20 && V.ripetute === 0, `I la memoria della stagione tiene: ${V.ripetute} ripetute su ${V.memProvate}`);
  ok(conta(g, 'st') === 0, `S la storia non dice «ormai»/«col tempo» e dice il numero vero (${conta(g, 'st')})`);
  for (const v of V.errori.slice(0, 3)) console.log('     · ' + v);
  for (const v of g.viol.slice(0, 6)) console.log(`     · [${v.k}] stagioni ${v.anni}: ${v.t}`);
}
if (ROSSO) {
  const R = await giro(true);
  console.log('── rivale-378 · braccio ROSSO (__CPM_NO_G378 = testi di prima)');
  if (R.cieco) ok(false, 'rosso non giudicato: ' + R.cieco);
  else {
    const g = giudica(R);
    const prima = R.iv.filter(s => s.anni === 1 && /di sempre/.test(s.t)).length;
    console.log(`  violazioni ${g.viol.length} · intervista ${conta(g, 'iv')} (di cui «di sempre» in prima stagione ${prima}) · storia ${conta(g, 'st')}`);
    ok(prima > 0, 'il rosso rimette «il tuo rivale di sempre» alla prima stagione');
    ok(conta(g, 'st-vago') > 0, 'il rosso rimette «ormai»/«col tempo» nella storia');
  }
}
console.log(esito ? '\n✅ rivale-378 VERDE' : '\n❌ rivale-378 ROSSO');
await browser.close(); srv.close(); process.exit(esito ? 0 : 1);
