#!/usr/bin/env node
/* [giro 159b · PO-338, decisioni PO 11/11 sera] GUARDIANO: CIO' CHE SI LEGGE SULLA SCADENZA E' CIO' CHE SUCCEDE, ANCHE NEI RINNOVI
   E NELLA FINESTRA ESTIVA.
   (1) «Stessa regola» per il rinnovo: scadenza = stagione + durata - 1 (firma in stagione 2, durata 3 → «fine stagione 4», e vale
       fino a fine stagione 4). La durata resta quella di PO-270 (max(residua,1) + anni firmati).
   (2) Finestra estiva W1-5 = inizio stagione: un «1 stagione» firmato li' scade a fine della stagione in corso.
   Ogni prova di flusso usa gli handler VERI (?cpmtest=1, salvataggio sintetico 'cpm-v3'): firma, poi cambi di stagione con
   startNewSeason finche' il contratto non scade. Il giudizio e' uno solo e vale per tutte: L'ULTIMA STAGIONE SOTTO CONTRATTO
   E' LA STAGIONE SCRITTA NELLA SCADENZA (e la scheda Agente dice «Scade a fine stagione <quella>» subito dopo la firma).
   Prove:
     logica   · scadenzaRinnovo159b(2,3)=4, (2,2)=3, (5,1)=5
     rinNego  · «Negozia rinnovo» → «Accetta l'offerta del club» (stesso percorso di rinnovo-270; nome seedato a 2 anni)
     rinOff   · offerta isRenewal di 2 anni posata con setOffer e accettata con acceptOffer
     estiva   · trasferimento definitivo «1 stagione» accettato in stagione 2, settimana 3
   Due bracci: A verde · B rosso window.__CPM_NO_G159B dal caricamento (la 7.999.190 su questi tre punti): ogni prova deve cadere.
   «Non giudicato» conta come ROSSO in A e come NON caduto in B. Soglie fisse.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node seguiti-159b-test.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROOT = new URL('../../', import.meta.url).pathname;
const HTML = fs.readFileSync(ROOT + 'CARRIER-MANAGER-AV.html', 'utf8');

/* 0 · la regola deve essere USATA in tutti i punti in cui un rinnovo scrive la scadenza, e nel ramo della finestra estiva */
const statico = {
  rinNego: HTML.includes('expiresAtSeason:scadenzaRinnovo159b(p.season,_durRin270(p))'),
  rinOff: HTML.includes('expiresAtSeason:scadenzaRinnovo159b(p.season,_durRin270b(p))'),
  momenti: HTML.includes('expiresAtSeason:scadenzaRinnovo159b(p.season,(p.contract?.duration||1)+(ef.contractYears||0))'),
  estiva: HTML.includes(':contrattoFirma159(p.season||1,_newDur98,(p.week||1)>5))'),
  vecchieScritture: !HTML.includes('expiresAtSeason:(p.season||1)+_durRin270') && !HTML.includes('expiresAtSeason:(p.season||1)+(p.contract?.duration||1)+(ef.contractYears||0)'),
};
const staticoOk = Object.values(statico).every(Boolean);

const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const save = (name, week, contract) => ({ phase: 'career', player: { name, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week, age: 22, ovr: 72,
  tutorialDone: true, club: CLUB, coachTrust: 85, stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract, matches: 0, totalMatches: 0, goals: 0, totalGoals: 0,
  matchHistory: [], bankBalance: 0, sessionsThisWeek: 3, yellAccum: 0, seasonCards: { y: 0, r: 0 } } });

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const errs = [];
const apri = async (s, rosso) => {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ s, r }) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G159B = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s, r: rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(600);
  for (let i = 0; i < 12; i++) { const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length); if (!n) break; await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300); }
  return { ctx, page };
};
const contratto = (page) => page.evaluate(() => { const p = window.__CPM_CAREER.snapshot();
  return { season: p.season, week: p.week, club: p.club && p.club.id, duration: p.contract && p.contract.duration, exp: p.contract && p.contract.expiresAtSeason, svincolato: !!p.contractExpired }; });
/* la scadenza come la legge il giocatore: riga «Contratto: scade a fine stagione N» o cella «Scadenza · Fine stagione N»; si cercano
   tutte le schede e devono dire tutte la stessa stagione (due numeri diversi = non giudicato) */
const scrittaAgente = async (page) => { const visti = new Set();
  for (const t of ['agente', 'dashboard', 'profile']) { try { await page.evaluate((t) => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} window.__CPM_CAREER.goTab(t); }, t); await sleep(700);
    const tx = await page.evaluate(() => document.body.innerText);
    for (const m of tx.matchAll(/scade a fine stagione (\d+)|Scadenza\s+Fine stagione (\d+)/gi)) visti.add(+(m[1] || m[2])); } catch (e) {} }
  return visti.size === 1 ? [...visti][0] : null; };
/* dopo la firma: cambi di stagione finche' il contratto non scade (tetto 6) → ultima stagione sotto contratto */
const finoAllaScadenza = async (page) => { const passi = []; let ultima = null;
  const c0 = await contratto(page); if (!c0.svincolato) ultima = c0.season;
  for (let i = 0; i < 6; i++) {
    const n = await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} return window.__CPM_CAREER.startNewSeason(); }); await sleep(1600);
    const c = await contratto(page); passi.push({ n, ...c }); if (n !== true) return { ultima: null, passi };
    if (c.svincolato) return { ultima, passi }; ultima = c.season;
  }
  return { ultima: null, passi };/* mai scaduto in 6 stagioni: non giudicato */ };
const giudica = (firma, scritta, fine, extra) => {
  const dato = { firma, scritta, ultimaStagioneSottoContratto: fine.ultima, passi: fine.passi.map(p => `S${p.season}:d${p.duration}/e${p.exp}${p.svincolato ? '/svinc' : ''}`) };
  if (fine.ultima == null || firma.exp == null || extra === null) return { ok: null, dato };
  return { ok: fine.ultima === firma.exp && scritta === firma.exp && extra !== false, dato };
};

const PROVE = {
  logica: async (rosso) => { const { ctx, page } = await apri(save('Collaudo 159b', 1, { duration: 1, wage: 6000, expiresAtSeason: 2 }), rosso);
    const v = await page.evaluate(() => { try { return { a: scadenzaRinnovo159b(2, 3), b: scadenzaRinnovo159b(2, 2), c: scadenzaRinnovo159b(5, 1) }; } catch (e) { return null; } });
    await ctx.close(); return v ? { ok: v.a === 4 && v.b === 3 && v.c === 5, dato: v } : { ok: null, dato: 'funzione assente' }; },
  rinNego: async (rosso) => { const { ctx, page } = await apri(save('Collaudo Rinnovo C', 1, { duration: 1, wage: 6000, expiresAtSeason: 2 }), rosso);
    try {
      await page.evaluate(() => window.__CPM_CAREER.goTab('agente')); await sleep(600);
      const btn = page.getByText('Negozia rinnovo', { exact: false }).first();
      try { await btn.scrollIntoViewIfNeeded({ timeout: 5000 }); await btn.click({ timeout: 5000 }); } catch (e) { return { ok: null, dato: 'pulsante «Negozia rinnovo» assente' }; }
      await sleep(500);
      try { await page.getByText("Accetta l'offerta del club", { exact: false }).first().click({ timeout: 5000 }); } catch (e) { return { ok: null, dato: 'opzione «Accetta l\'offerta del club» assente' }; }
      await sleep(800);
      const firma = await contratto(page); const scritta = await scrittaAgente(page); const fine = await finoAllaScadenza(page);
      /* esempio del PO: firma in stagione 2, durata 3 → mostra e vale fino a fine stagione 4 */
      return giudica(firma, scritta, fine, firma.duration === 3 ? firma.exp === 4 : null);
    } finally { await ctx.close(); } },
  rinOff: async (rosso) => { const { ctx, page } = await apri(save('Collaudo Rinnovo B', 1, { duration: 1, wage: 6000, expiresAtSeason: 2 }), rosso);
    try {
      const posata = await page.evaluate((c) => window.__CPM_CAREER.setOffer({ isRenewal: true, wage: 7000, moralBonus: 5, club: c, duration: 2 }), CLUB); await sleep(600);
      const acc = await page.evaluate(() => window.__CPM_CAREER.acceptOffer()); await sleep(800);
      if (posata !== true || acc !== true) return { ok: null, dato: { posata, acc } };
      const firma = await contratto(page); const scritta = await scrittaAgente(page); const fine = await finoAllaScadenza(page);
      return giudica(firma, scritta, fine, firma.duration === 3 ? firma.exp === 4 : null);
    } finally { await ctx.close(); } },
  estiva: async (rosso) => { const { ctx, page } = await apri(save('Collaudo Estiva', 3, { duration: 3, wage: 6000, expiresAtSeason: 4 }), rosso);
    try {
      const posata = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); let o = null; for (let i = 0; i < 40 && !o; i++) o = generateTransferOffer(p);
        if (!o || o.isRenewal) return 'nessuna offerta'; return window.__CPM_CAREER.setOffer({ ...o, type: 'trasferimento definitivo', duration: 1, buyClause: undefined, minMatches: undefined }); });
      await sleep(600);
      const acc = await page.evaluate(() => window.__CPM_CAREER.acceptOffer()); await sleep(900);
      const firma = await contratto(page);
      if (posata !== true || acc !== true || firma.club === 'b04' || firma.week > 5) return { ok: null, dato: { posata, acc, firma } };
      const scritta = await scrittaAgente(page); const fine = await finoAllaScadenza(page);
      /* PO: «1 stagione» firmato nella finestra estiva scade a fine della stagione in corso (2) */
      return giudica(firma, scritta, fine, firma.exp === 2 && firma.duration === 1);
    } finally { await ctx.close(); } },
};
const ORD = Object.keys(PROVE);
const braccio = async (nome, rosso) => { const R = {};
  for (const k of ORD) { try { R[k] = await PROVE[k](rosso); } catch (e) { R[k] = { ok: null, dato: 'non giudicato: ' + String(e.message).slice(0, 120) }; } }
  console.log(`\n── braccio ${nome}`); for (const [k, v] of Object.entries(R)) console.log(`  ${k.padEnd(8)} ${v.ok === true ? 'VERDE' : v.ok === false ? 'ROSSO' : 'NON GIUDICATO'}  ${JSON.stringify(v.dato).slice(0, 400)}`);
  return R; };

const A = await braccio('A · verde', false);
const B = await braccio('B · rosso (__CPM_NO_G159B)', true);
await b.close(); srv.close();

const guasti = [];
if (!staticoOk) guasti.push('uso nel codice mancante: ' + JSON.stringify(statico));
for (const k of ORD) {
  if (!A[k] || A[k].ok !== true) guasti.push(`${k}: verde non verde (${A[k] ? (A[k].ok === null ? 'non giudicato' : 'rosso') : 'assente'})`);
  if (!B[k] || B[k].ok !== false) guasti.push(`${k}: il rosso non cade (${B[k] ? (B[k].ok === null ? 'non giudicato' : 'verde') : 'assente'})`);
}
if (errs.length) guasti.push('errori di pagina: ' + errs.slice(0, 3).join(' | '));
fs.mkdirSync(ROOT + 'tests/visual/out', { recursive: true });
fs.writeFileSync(ROOT + 'tests/visual/out/seguiti-159b.json', JSON.stringify({ statico, A, B, guasti }, null, 1));
const riga = (R) => ORD.map(k => `${k}:${R[k] ? (R[k].ok === true ? 'V' : R[k].ok === false ? 'R' : '?') : '-'}`).join(' ');
console.log('\n════ seguiti-159b ════');
console.log('uso nel codice:', staticoOk ? 'ok' : 'MANCANTE ' + JSON.stringify(statico));
console.log('VERDE (A)  ', riga(A));
console.log('ROSSO (B)  ', riga(B));
if (guasti.length) { console.log('\n❌ SEGUITI-159b ROSSO —\n  ' + guasti.join('\n  ')); process.exit(1); }
console.log(`\n✅ SEGUITI-159b VERDE — ${ORD.length} prove: l'ultima stagione sotto contratto e' quella scritta, e ognuna cade con __CPM_NO_G159B`);
