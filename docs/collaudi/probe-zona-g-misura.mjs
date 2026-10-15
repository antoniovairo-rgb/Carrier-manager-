#!/usr/bin/env node
/* COLLAUDO ZONA G — SOLO MISURA (PO 15/10: «Solo misura, niente correzioni»).
   Nessuna modifica a src/ né a CARRIER-MANAGER-AV.html. Gli handler sono quelli VERI
   esposti da window.__CPM_CAREER (test-only, ?cpmtest=1). Lo stato persistito si legge da
   localStorage 'cpm-v3' (autosave): è ciò che il giocatore ritrova al ricaricamento.
   Uso:  node probe-zona-g-misura.mjs po222   |   node probe-zona-g-misura.mjs po223
   Richiede CPM_CHROME=/opt/pw-browsers/chromium e PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../../tests/visual/lib/harness.mjs';

const WHICH = process.argv[2] || 'po222';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const baseSave = (extra) => ({ phase: 'career', player: { name: 'Collaudo Zona G', nation: 'Italia', avatarId: 0, proStatus: 'pro',
  season: 2, week: 1, age: 20, ovr: 70, tutorialDone: true, club: CLUB,
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 },
  matches: 0, totalMatches: 0, goals: 0, totalGoals: 0, matchHistory: [], bankBalance: 0, ...extra } });

async function openCareer(save) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  await page.addInitScript((s) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(1000);
  // risolve le interazioni d'apertura come le risolverebbe il giocatore (stesso handler del banco)
  for (let i = 0; i < 12; i++) {
    const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length);
    if (!n) break;
    await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300);
  }
  return { ctx, page, errors };
}

const persisted = (page) => page.evaluate(() => {
  const p = (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player) || {};
  const h = (p.matchHistory || []);
  const last = h[h.length - 1] || null;
  return { season: p.season, week: p.week, weekLived: !!p.weekLived, matches: p.matches || 0, totalMatches: p.totalMatches || 0,
    injured: !!p.injured, injuryWeeks: p.injuryWeeks || 0, histN: h.length, lastHist: last && { s: last.season, w: last.week,
      opp: last.opponent, simulated: !!last.simulated, injured: !!last.injured, svincolato: !!last.svincolato, rating: last.rating },
    bank: p.bankBalance || 0, screen: null, log0: (p.log || [])[0] || null, inv: !!p.investmentPending, invest24: p.invest24 ? p.invest24.amt : null, logInv: (p.log || []).filter(x => /nvestiment/i.test(x)).slice(0, 3) };
});

// trova la prima settimana di LEGA con una partita (scansione con patch della sola settimana)
async function findLeagueWeek(page) {
  for (let w = 1; w <= 38; w++) {
    const md = await page.evaluate((w) => { window.__CPM_CAREER.patch({ week: w, weekLived: false }); return null; }, w);
    await sleep(260);
    const t = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
    if (t && t.type !== 'national' && t.type !== 'cup' && t.type !== 'euro' && t.type !== 'euro_group') return { w, t };
  }
  return null;
}

async function runPO222() {
  const out = {};
  const arms = [
    { id: 'simula-INFORTUNATO', injured: true, path: 'simula' },
    { id: 'simula-sano (controllo)', injured: false, path: 'simula' },
    { id: 'gioca-INFORTUNATO', injured: true, path: 'gioca' },
    { id: 'avanza-INFORTUNATO', injured: true, path: 'avanza' },
    { id: 'avanza-sano (controllo)', injured: false, path: 'avanza' },
    { id: 'simula-SQUALIFICATO', injured: false, extra: { isSuspended: true }, path: 'simula' },
    { id: 'simula-SVINCOLATO', injured: false, extra: { contractExpired: true }, path: 'simula' },
  ];
  // la settimana scelta è la stessa per tutti i bracci (calendario deterministico della stagione)
  let target = null;
  {
    const { ctx, page } = await openCareer(baseSave({}));
    target = await findLeagueWeek(page);
    await ctx.close();
  }
  if (!target) return { errore: 'nessuna settimana di lega trovata nella stagione' };
  out.settimana = { week: target.w, avversario: target.t.opp, tipo: target.t.type || 'league' };

  for (const arm of arms) {
    // «Avanza Settimana» (handleContinua) con infortunato va a doAdvanceWeek SOLO se la settimana è già vissuta
    const save = baseSave({ week: target.w, weekLived: arm.path === 'avanza',
      ...(arm.injured ? { injured: true, injuryWeeks: 4, injuryType: 'stiramento' } : {}), ...(arm.extra || {}) });
    const { ctx, page, errors } = await openCareer(save);
    await sleep(400);
    const before = await persisted(page);
    let azione = '';
    if (arm.path === 'simula') {
      // flusso reale dell'harness: «Vivi la settimana» (liveCurrentWeek) poi «Simula» (simulateAndAdvance)
      for (let i = 0; i < 4; i++) {
        const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
        azione += r + ' › '; await sleep(300);
        if (r === 'simulated' || r === 'advanced') break;
      }
    } else if (arm.path === 'gioca') {
      azione = await page.evaluate(() => window.__CPM_CAREER.playMatch(true));
      await sleep(900);
      azione += ' · schermata: ' + (await page.evaluate(() => window.__CPM_CAREER.get().screen));
    } else if (arm.path === 'avanza') {
      // il pulsante vero del cruscotto (non esposto dall'harness): «Avanza» e poi la conferma, se chiede
      await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(600);
      // il testo del pulsante è «⏭️ Avanza Settimana» (IT, riga 43506): cerco il testo, non il ruolo
      // con una partita in programma il pulsante principale è la PARTITA («⚽ …», riga ~48216): e' lui a chiamare handleContinua.
      // Per un infortunato con settimana vissuta handleContinua va dritto a doAdvanceWeek (salta il prompt Gioca/Simula/Annulla).
      const hit = await page.evaluate(() => { const bs = [...document.querySelectorAll('button')]
        .filter(b => /^\s*(⚽|🏳️|🏆|🌍)/.test(b.textContent || '') || /Avanza Settimana/.test(b.textContent || ''));
        if (!bs.length) return 'nessuno'; bs[0].click(); return (bs[0].textContent || '').slice(0, 60); });
      azione = hit === 'nessuno' ? 'nessun pulsante principale trovato' : 'click «' + hit + '»';
      await sleep(600);
      // conferma SOLO se compare la domanda vera (riga 43513)
      const asks = await page.evaluate(() => /Avanzare alla settimana successiva\?/.test(document.body.innerText || ''));
      if (asks) {
        await page.evaluate(() => { const el = [...document.querySelectorAll('button')].filter(b => /Avanza|Conferma|Sì/i.test(b.textContent || '')).pop(); if (el) el.click(); });
        azione += ' + conferma (domanda di avanzamento)';
      }
      await sleep(1600);
    }
    await sleep(500);
    const after = await persisted(page);
    after.screen = await page.evaluate(() => window.__CPM_CAREER.get().screen);
    out[arm.id] = { azione, prima: before, dopo: after, errori: errors };
    await ctx.close();
  }
  return out;
}

async function runPO223() {
  const out = {};
  // Stato «dopo la scelta» dell'evento wi_investimento / wi_cripto (-20.000): il saldo è già ridotto dallo
  // stesso effetto `ef.bank` (riga 48814) e il flag è quello che la scelta scrive (riga 48815).
  const arms = [
    { id: 'con flag investmentPending (scelta «Ci punto una fetta» -20.000)', flag: true, bank: 80000 },
    { id: 'controllo senza flag (stesso saldo)', flag: false, bank: 80000 },
  ];
  for (const arm of arms) {
    const save = baseSave({ week: 36, weekLived: false, bankBalance: arm.bank,
      ...(arm.flag ? { investmentPending: true } : {}) });
    const { ctx, page, errors } = await openCareer(save);
    await sleep(400);
    const before = await persisted(page);
    // chiude la stagione con il flusso reale del banco (stesso ciclo del collaudo carriera)
    let seasonEnd = false;
    for (let i = 0; i < 400 && !seasonEnd; i++) {
      const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
      if (r === 'seasonEnd') { seasonEnd = true; break; }
      if (r && String(r).startsWith('error')) break;
      if (r && String(r).startsWith('blocked')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); }
    }
    const endSeason = await persisted(page);
    endSeason.screen = await page.evaluate(() => window.__CPM_CAREER.get().screen);
    // osservatore DOM: registra ogni nodo comparso con «investimento» (il toast è a slot unico e breve,
    // il campionamento a intervalli se lo perdeva)
    await page.evaluate(() => {
      window.__invObs = [];
      // legge il testo VISIBILE a ogni mutazione (childList E characterData): il toast viene riusato da React
      // e il suo testo cambia in place, senza nodo aggiunto
      new MutationObserver(() => { const t = document.body.innerText || '';
        for (const line of t.split('\n')) if (/nvestimento|rende|Nuova stagione/.test(line) && line.length < 200) window.__invObs.push(line.trim()); })
        .observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    // rollover: l'handler vero di inizio stagione
    await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
    // notify è una CODA con drenaggio temporizzato (riga ~45291): l'avviso può uscire dopo parecchi secondi
    await sleep(25000);
    const toasts = new Set(await page.evaluate(() => window.__invObs || []));
    const afterRoll = await persisted(page);
    out[arm.id] = { fineStagione: seasonEnd, stagione_fine: endSeason.season, banca_fine_stagione: endSeason.bank, flag_fine_stagione: endSeason.inv, log_fine: endSeason.logInv,
      banca_dopo_rollover: afterRoll.bank, flag_dopo_rollover: afterRoll.inv, log_dopo: afterRoll.logInv, stagione_dopo: afterRoll.season, avvisi_investimento: [...toasts], errori: errors };
    await ctx.close();
  }
  return out;
}

const res = WHICH === 'po223' ? await runPO223() : await runPO222();
console.log(JSON.stringify(res, null, 2));
await browser.close(); srv.close();
