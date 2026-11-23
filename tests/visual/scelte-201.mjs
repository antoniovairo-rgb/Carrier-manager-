#!/usr/bin/env node
/* [giro 201 · PO-428 (G189-16)] GUARDIANO scelte-201 — nessuna scelta si perde chiudendo l'app.
   Gioco vero (?cpmtest=1), salvataggio sintetico, handler veri. Per ogni finestra o riquadro con una scelta:
   1) la si apre come la apre il gioco (o con il varco di collaudo gia' esistente in __CPM_CAREER);
   2) si aspetta 1,5 s (l'autosave ha un ritardo di 600 ms) e si RICARICA la pagina senza rispondere;
   3) dopo «CONTINUA» si guarda se la stessa scelta e' di nuovo a schermo, con i suoi tasti, senza errori di pagina.
   Il salvataggio di partenza si scrive UNA volta per scheda (sessionStorage), cosi' il ricaricamento legge cio' che il gioco ha salvato.
   In piu' (parte B, offerta in Agente): «Ci penso» sull'offerta la lascia nella scheda Agente con la scadenza; «Rivedi» la riapre;
   passata la scadenza sparisce con una riga nel registro.
   Rosso window.__CPM_NO_G201 (come prima del giro 201) → DEVE essere bocciato.
   Uscita 0 solo se il verde passa E il rosso e' bocciato. Stampa la tabella per il rapporto.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node scelte-201.mjs   (CPM_SOLO201=offerta,richiamo… · CPM_BRACCI=verde|rosso) */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO332 = process.env.CPM_ROSSO332 === '1'; /* [giro 332] braccio rosso della correzione dell'intervista: __CPM_NO_G332 sul VERDE del caso intervista-cond → DEVE uscire 1 */
const SOLO = ROSSO332 ? ['intervista-cond'] : (process.env.CPM_SOLO201 || '').split(',').filter(Boolean);
const BRACCI = ROSSO332 ? ['verde'] : (process.env.CPM_BRACCI || 'verde,rosso').split(',');
const FOTO = path.join(ROOT, 'docs', 'sviluppo', 'giro201'); fs.mkdirSync(FOTO, { recursive: true });
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const CLUB = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 90, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
const OFF_CLUB = { id: 'che', n: 'FC Stamford', a: 'STA', p: 92, c: '#1d4ed8', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
const OFFERTA = { club: OFF_CLUB, type: 'trasferimento definitivo', minutaggio: 70, moralBonus: 10, growthBonus: 10, prestigeRatio: 1.02, wage: 14000, duration: 3 };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3 };
function salva(over = {}) {
  const s = 80;
  return { name: 'Guardiano Scelte', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 30, weekLived: false, age: 25, ovr: s, tutorialDone: true, position: 'ATT',
    club: CLUB, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, coachTrust: 80, popularity: 40, contract: { duration: 3, wage: 9000, expiresAtSeason: 5 }, matchHistory: [], bankBalance: 80000, u18Seasons: 1,
    hasAgent: true, agent: { id: 'ag1', name: 'Marco Gestini', style: 'boutique', rapport: 60 }, agentTask: 'immagine', agentStyleSeen: 3, renewWarn94: 3,
    history: [], worldMemory: [], rival: null, totalMatches: 61, totalGoals: 31, log: [], ...AP, ...over };
}
const SCAD = { contract: { duration: 1, wage: 9000, expiresAtSeason: 3 } };

/* i casi: apri(page) apre la scelta, vedi(page) dice se e' a schermo (testo breve o null) */
const sel = (s) => (page) => page.evaluate((s) => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 90) : null; }, s);
const txt = (re) => (page) => page.evaluate((src) => { const r = new RegExp(src, 'i'); const t = document.getElementById('root').innerText; const m = t.match(r); return m ? m[0] : null; }, re);
const ev = (f, a) => (page) => page.evaluate(f, a);
const ivCond = (page) => page.evaluate(() => { const e = document.querySelector('[data-cpm="intervista231"]'); if (!e) return null; const t = e.innerText.replace(/\s+/g, ' ');
  const q = INTERVIEW_QS.find(q => q.cond && typeof q.q === 'string' && t.includes(q.q.slice(0, 40))); return q ? 'domanda condizionata: ' + q.q.slice(0, 50) : null; });
async function avanza(page) { const w0 = await page.evaluate(() => window.__CPM_CAREER.snapshot().week); for (let i = 0; i < 4; i++) { await page.evaluate(() => window.__CPM_CAREER.step()); await sleep(900); const w = await page.evaluate(() => window.__CPM_CAREER.snapshot().week); if (w !== w0) return w; } return null; }
const CASI = [
  { id: 'saga-tono', nome: 'Saga di mercato, episodio 2 (cosa rispondi ai media)', save: salva(),
    apri: ev(() => { const w = window.__CPM_CAREER.snapshot().week; window.__CPM_CAREER.patch({ transferSaga: { season: 3, week: w - 1, club: 'FC Stamford', offer: null, tone: null } }); }),
    vedi: txt('Nel calcio mai dire mai') },
  { id: 'saga-offerta', nome: 'Saga di mercato, episodio 3 → «Ascolta l\'offerta» (offerta ufficiale)', save: salva(),
    apri: async (page) => { await page.evaluate((o) => { const w = window.__CPM_CAREER.snapshot().week; window.__CPM_CAREER.patch({ transferSaga: { season: 3, week: w - 2, club: 'FC Stamford', offer: o, tone: 'apri' } }); }, OFFERTA); await sleep(900);
      await page.getByText('Ascolta l\'offerta', { exact: false }).first().click({ timeout: 5000 }).catch(() => {}); },
    vedi: sel('[data-cpm="offerta23"]') },
  { id: 'offerta', nome: 'Offerta di trasferimento diretta (finestra)', save: salva(),
    apri: ev((o) => window.__CPM_CAREER.setOffer(o), OFFERTA), vedi: sel('[data-cpm="offerta23"]') },
  { id: 'richiamo', nome: 'Richiamo del presidente (giro 198)', save: salva({ ...SCAD, week: 18, weekLived: true }),
    apri: async (page) => { await avanza(page); }, vedi: sel('[data-cpm="richiamo198"]') },
  { id: 'rinnovo', nome: 'Trattativa del rinnovo (aperta dal richiamo)', save: salva({ ...SCAD, week: 18, weekLived: true }),
    apri: async (page) => { await avanza(page); await page.click('[data-cpm="richiamo198-tratta"]', { timeout: 5000 }).catch(() => {}); },
    vedi: txt('Accetta l\'offerta del club') },
  { id: 'svincolato', nome: 'Schermata «Sei svincolato» (giro 198)', save: salva({ ...SCAD, week: 38, weekLived: true, richiamo198: { s: 3, n: 2 } }),
    apri: async (page) => { await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); await sleep(1800); }, vedi: sel('[data-cpm="svincolato198"]') },
  { id: 'impulso', nome: 'Impulso della settimana (scelta)', save: salva(),
    apri: ev(() => window.__CPM_CAREER.apriSettimana('impulso')), vedi: sel('[data-cpm="settimana23"]') },
  { id: 'spogliatoio', nome: 'Spogliatoio (scelta con un compagno)', save: salva(),
    apri: ev(() => window.__CPM_CAREER.apriSettimana('spogliatoio')), vedi: sel('[data-cpm="settimana23"]') },
  { id: 'intervista', nome: 'Intervista', save: salva(),
    apri: ev(() => window.__CPM_CAREER.forceInterview('win')), vedi: sel('[data-cpm="intervista231"]') },
  /* [giro 332 · PO-620] l'intervista con una domanda CONDIZIONATA (q.cond e' una funzione: 8,8 % delle estrazioni sul salvataggio del
     guardiano). Era la causa del rosso del treno 45050383306: qui il caso si provoca invece di aspettarlo dal sorteggio. */
  { id: 'intervista-cond', nome: 'Intervista con domanda condizionata (voci di mercato, Nazionale, capitano…)', save: salva(),
    apri: async (page) => { for (let i = 0; i < 120; i++) { await page.evaluate(() => window.__CPM_CAREER.forceInterview('win')); await sleep(120); if (await ivCond(page)) return; } },
    vedi: (page) => ivCond(page) },
  { id: 'verifica', nome: 'Verifica trimestrale del mister (sett. 8)', save: salva({ week: 8, weekLived: false, lastMonthlyReview: 0 }),
    apri: async (page) => { await page.evaluate(() => window.__CPM_CAREER.step()); await sleep(900); }, vedi: txt('Verifica Trimestrale[^\\n]{0,20}') },
  { id: 'momento', nome: 'Momento di carriera (finestra)', save: salva(),
    apri: ev(() => window.__CPM_CAREER.forceMoment('cm_rigore_vita')), vedi: sel('[data-cpm="finestra230"]') },
  { id: 'procuratore', nome: 'Primo incontro col procuratore', save: salva({ hasAgent: false, agent: null }),
    apri: ev(() => window.__CPM_CAREER.apriIntro253()), vedi: txt('Ci penso ancora') },
  { id: 'patto', nome: 'Patto col mister (verdetto da accogliere)', save: salva({ coachPact: { season: 3, fromWeek: 20, target: 2, games: 5, kind: 'gol', status: 'active' }, matchHistory: [{ week: 21, goals: 1, assists: 0, rating: 7 }, { week: 22, goals: 1, assists: 0, rating: 7 }] }),
    apri: async () => {}, vedi: txt('Il patto col mister') },
  { id: 'da-decidere', nome: 'Scelte «Da decidere» della Home (giro 199: campo d\'allenamento)', save: salva({ fatigue: 80 }),
    apri: async () => {}, vedi: sel('[data-cpm="scelta199-allenamento"]') },
  { id: 'convocazione', nome: 'Convocazione in Nazionale (amichevole in calendario)', save: salva({ week: 30, weekLived: true }),
    apri: async (page) => { await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); window.__CPM_CAREER.patch({ calendar: [...(p.calendar || []).filter(m => m.week !== 30), { matchday: 98, week: 30, type: 'national', opponentId: 'fra', opponentName: 'Francia', isHome: true, played: false }] }); }); await sleep(900);
      await page.evaluate(() => window.__CPM_CAREER.playMatch()); await sleep(900); },
    vedi: async (page) => page.evaluate(() => { const sc = window.__CPM_CAREER.screen(); const md = window.__CPM_CAREER.thisWeekMd();
      return sc === 'nationalCallup' ? 'lobby convocazione' : (md && md.type === 'national' ? 'Home: partita della Nazionale ancora da giocare (' + md.opp + ')' : null); }) },
].filter(c => !SOLO.length || SOLO.includes(c.id));

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
async function apriPagina(player, flag) {
  const page = await browser.newPage({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2 });
  await installCdnRoutes(page);
  if (+process.env.CPM_CPU > 1) { const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: +process.env.CPM_CPU }); }/* [giro 332] banco lento simulato */
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.addInitScript(([pl, f]) => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (f) window[f] = 1;
    if (!sessionStorage.getItem('g201')) { localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); sessionStorage.setItem('g201', '1'); } }, [player, flag]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await entra(page);
  return { page, errors };
}
async function entra(page) {
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(1500);
}
/* [giro 332 · PO-620] RICARICA SOLO A SALVATAGGIO ARRIVATO. Prima: 1,5 s fissi e poi il ricaricamento (regola 4 violata). Sul runner
   conteso l'autosave (debounce 600 ms + coda asincrona di storage) poteva non essere ancora sul disco: la scelta «non tornava» per
   colpa della sonda, non del gioco (rosso del treno 45050383306, intervista). Ora si aspetta che i campi che portano le scelte siano
   UGUALI in memoria e nello slot salvato, per due letture a 800 ms l'una dall'altra (oltre il debounce). Tetto 25 s: se scade si
   ricarica comunque e lo si dichiara (il controllo che segue giudica). */
const CAMPI332 = ['season', 'week', 'scelte201', 'transferSaga', 'calendar', 'offerta201', 'coachPact', 'contract', 'richiamo198', 'hasAgent'];
async function salvato(page) {
  const t0 = Date.now(); let prec = null;
  while (Date.now() - t0 < 25000) {
    const r = await page.evaluate((campi) => { try { const m = window.__CPM_CAREER.snapshot(); const raw = localStorage.getItem('cpm-v3'); const d = raw ? JSON.parse(raw).player : null;
      const pick = (o) => JSON.stringify(campi.map(k => o ? (o[k] === undefined ? null : o[k]) : '∅')); const a = pick(m), b = pick(d); return a === b ? a : null; } catch (e) { return null; } }, CAMPI332);
    if (r && prec === r) return Date.now() - t0;
    prec = r; await sleep(800);
  }
  console.log('    (salvataggio non allineato alla memoria entro 25 s: si ricarica comunque)'); return null;
}
/* dopo il ricaricamento si aspetta la scelta (evento), con tetto: niente piu' «1,5 s e poi guardo» */
async function attendi(page, vedi, tetto) { const t0 = Date.now(); let v = null; while (Date.now() - t0 < tetto) { v = await vedi(page).catch(() => null); if (v) return v; await sleep(250); } return v; }
async function ricarica(page) { if (process.env.CPM_SUBITO332) await sleep(+process.env.CPM_SUBITO332); else await salvato(page);/* CPM_SUBITO332=<ms>: misura della causa (ricarica dopo un tempo fisso, come prima) */ await page.reload({ waitUntil: 'load', timeout: 60000 }); await entra(page); }

const tabella = {};
try {
  for (const braccio of BRACCI) {
    const flag = braccio === 'rosso' ? '__CPM_NO_G201' : (ROSSO332 ? '__CPM_NO_G332' : null);
    console.log(`A) ${braccio}: apri la scelta, ricarica senza rispondere, guarda se torna`);
    let tornate = 0, aperte = 0;
    for (const c of CASI) {
      const { page, errors } = await apriPagina(c.save, flag);
      await c.apri(page);
      const prima = await attendi(page, c.vedi, 8000);
      if (prima && braccio === 'verde') await page.screenshot({ path: path.join(FOTO, `aperta-${c.id}-375.png`) });
      await ricarica(page);
      const dopo = await attendi(page, c.vedi, 8000);
      if (braccio === 'verde' && prima) await page.screenshot({ path: path.join(FOTO, `dopo-ricarica-${c.id}-375.png`) });
      if (braccio === 'rosso' && prima) await page.screenshot({ path: path.join(FOTO, `prima-ricarica-${c.id}-375.png`) });
      (tabella[c.id] ||= { nome: c.nome })[braccio] = { aperta: !!prima, torna: !!dopo, dopo, err: errors.length };
      console.log(`    ${c.id}: aperta ${prima ? '«' + prima.slice(0, 50) + '»' : 'NO'} · dopo il ricaricamento ${dopo ? '«' + dopo.slice(0, 50) + '»' : 'NON TORNA'} · errori ${errors.length}${errors.length ? ' ' + errors[0] : ''}`);
      if (prima) aperte++; if (prima && dopo && !errors.length) tornate++;
      if (braccio === 'verde') ok(!!prima && !!dopo && !errors.length, `verde ${c.id}: aperta e di nuovo a schermo dopo il ricaricamento`);
      await page.close();
    }
    if (braccio === 'rosso') ok(aperte === CASI.length && tornate < aperte, `rosso bocciato: ${tornate} scelte su ${aperte} tornano (attese meno di tutte)`);
  }

  if (!SOLO.length || SOLO.includes('agente')) {
    console.log('B) l\'offerta resta in Agente fino alla scadenza');
    for (const braccio of BRACCI) {
      const flag = braccio === 'rosso' ? '__CPM_NO_G201' : null;
      const { page, errors } = await apriPagina(salva({ week: 20, weekLived: true }), flag);
      await page.evaluate((o) => window.__CPM_CAREER.setOffer(o), OFFERTA); await sleep(900);
      const btn = await page.$('[data-cpm="offerta201-dopo"]');
      if (btn) { await btn.click(); await sleep(700); }
      await ricarica(page);
      await page.evaluate(() => window.__CPM_CAREER.goTab('agente')); await sleep(900);
      const card = await page.evaluate(() => { const e = document.querySelector('[data-cpm="offerta201-agente"]'); return e ? e.innerText.replace(/\s+/g, ' ') : null; });
      if (card && braccio === 'verde') { await page.evaluate(() => document.querySelector('[data-cpm="offerta201-agente"]').scrollIntoView({ block: 'center' })); await sleep(300); await page.screenshot({ path: path.join(FOTO, 'dopo-offerta-in-agente-375.png') }); }
      let riapre = false;
      if (card) { await page.click('[data-cpm="offerta201-rivedi"]'); await sleep(700); riapre = !!(await page.$('[data-cpm="offerta23"]'));
        if (riapre) { await page.click('[data-cpm="offerta201-dopo"]'); await sleep(600); } }
      /* scadenza: sett. 23 (fine della finestra invernale). Si porta il calendario alla 24 coi gestori veri. */
      let w = await page.evaluate(() => window.__CPM_CAREER.snapshot().week);
      for (let i = 0; i < 6 && w < 24; i++) { const n = await avanza(page); if (n == null) break; w = n; await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.chiudi163(); } catch (e) {} }); }
      await page.evaluate(() => window.__CPM_CAREER.goTab('agente')); await sleep(900);
      const dopoScad = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { card: !!document.querySelector('[data-cpm="offerta201-agente"]'), log: (p.log || []).some(l => /offerta[^.]*scadut|scaduta l'offerta/i.test(l)), w: p.week, mem: p.offerta201 || null }; });
      console.log(`    ${braccio}: «Ci penso» ${!!btn} · in Agente dopo il ricaricamento «${card}» · «Rivedi» riapre ${riapre} · sett. ${dopoScad.w}: riquadro ${dopoScad.card} · riga di scadenza nel registro ${dopoScad.log} · errori ${errors.length}`);
      tabella.agente = tabella.agente || { nome: 'Offerta lasciata «in Agente» fino alla scadenza' };
      tabella.agente[braccio] = { aperta: !!btn, torna: !!card && riapre, dopo: card, err: errors.length };
      const v = !!btn && !!card && /FC Stamford/.test(card) && /23/.test(card) && riapre && dopoScad.w >= 24 && !dopoScad.card && dopoScad.log && !errors.length;
      if (braccio === 'verde') ok(v, 'verde B: «Ci penso» la lascia in Agente con la scadenza (sett. 23), «Rivedi» la riapre, dopo la scadenza sparisce con la riga nel registro');
      else ok(!v, 'rosso B bocciato (nessun «Ci penso», nessun riquadro in Agente)');
      await page.close();
    }
  }
  if ((!SOLO.length || SOLO.includes('risposta')) && BRACCI.includes('verde')) {
    console.log('C) verde: la scelta riaperta si risponde, e una volta risposta non torna piu\'');
    for (const [nome, apri, vedi, rispondi] of [
      ['impulso', ev(() => window.__CPM_CAREER.apriSettimana('impulso')), sel('[data-cpm="settimana23"]'), ev(() => window.__CPM_CAREER.scegli(0))],
      ['offerta', ev((o) => window.__CPM_CAREER.setOffer(o), OFFERTA), sel('[data-cpm="offerta23"]'), async (page) => { await page.getByRole('button', { name: 'Rifiuta', exact: true }).first().click({ timeout: 5000 }).catch(() => {}); await sleep(900); await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} }); }],
    ]) {
      const { page, errors } = await apriPagina(salva(), null);
      await apri(page); await sleep(900); await ricarica(page);
      const tornata = await vedi(page);
      await rispondi(page); await sleep(900);
      const chiusa = !(await vedi(page));
      await ricarica(page);
      const fantasma = await vedi(page);
      const mem = await page.evaluate(() => window.__CPM_CAREER.snapshot().scelte201 || null);
      console.log(`    ${nome}: riaperta ${!!tornata} · risposta e chiusa ${chiusa} · dopo un altro ricaricamento ${fantasma ? 'TORNA (fantasma)' : 'non torna'} · copia salvata ${JSON.stringify(mem)} · errori ${errors.length}`);
      ok(!!tornata && chiusa && !fantasma && !mem && !errors.length, `verde C ${nome}: riaperta, risposta, poi non torna piu' e la copia salvata e' vuota`);
      await page.close();
    }
  }
} finally { await browser.close(); srv.close(); }
console.log('\nTABELLA');
console.log('| Scelta | Aperta | Torna dopo il ricaricamento (rosso = prima) | Torna (verde = dopo) |');
for (const [id, r] of Object.entries(tabella)) console.log(`| ${r.nome} | ${(r.verde || r.rosso || {}).aperta ? 'sì' : 'no'} | ${r.rosso ? (r.rosso.torna ? 'sì' : 'NO') : '—'} | ${r.verde ? (r.verde.torna ? 'sì' : 'NO') + (r.verde.err ? ' (errori)' : '') : '—'} |`);
if (fails.length) { console.log(`\n❌ scelte-201${ROSSO332 ? ' [braccio rosso __CPM_NO_G332]' : ''}: ${fails.length} controlli falliti · ${fails.slice(0, 2).join(' · ')}`); process.exit(1); }
console.log('\n✅ scelte-201 verde'); process.exit(0);
