#!/usr/bin/env node
/* [giro 409 · PO-675] GUARDIANO: DOPO UN TRASFERIMENTO NESSUNO TI CHIEDE SUBITO SE STAI BENE NEL CLUB.
   Parole del PO 26/11: «Dopo che mi sono trasferito in un club, la gente non può chiedermi se sto bene in quel club, è troppo prematuro».
   Handler VERI (?cpmtest=1), salvataggio sintetico 'cpm-v3' (mai un salvataggio del PO), procuratore che non ti sente da mesi
   (il confronto e' gia' maturo). Tre carriere seedate:
     A · trasferimento d'estate (stagione 2, settimana 2: offerta vera di generateTransferOffer accettata con acceptTransfer);
     B · trasferimento d'inverno (stagione 2, settimana 20);
     C · nessun trasferimento (controllo contro il freno di troppo: il confronto deve arrivare come prima).
   Per ogni settimana avanzata col tasto vero (__CPM_CAREER.step) si legge: il confronto col procuratore in sospeso (agentCheckin.due,
   «Dimmi sinceramente: sei felice qui?»), e se le due domande di gradimento sono in palio (intervista «Come ti trovi a {club}?» e
   evento «Ti mancano i vecchi tempi? — Sì, ma sono felice qui»: la loro cond, valutata sul giocatore vero).
   VERDE: in A e B nessuna delle tre prima di 10 settimane E 6 partite col club, o prima di 16 settimane; ciascuna arriva entro 20
   settimane (nessun silenzio per sempre); in C il confronto arriva entro 3 settimane. Nessun errore di pagina. Ogni misura mancante
   e' rossa (non giudicato = rosso).
   ROSSO: CPM_ROSSO=1 arma window.__CPM_NO_G409 (la regola non frena): il guardiano DEVE uscire 1.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node dopo-trasferimento-409.mjs   (npm run dopo-trasferimento-409) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const SETT = 22;
const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 70, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const save = (name, week, lastW) => ({ phase: 'career', player: { name, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week, age: 22, ovr: 74,
  tutorialDone: true, club: CLUB, coachTrust: 70, stats: { 'velocità': 72, tecnica: 71, fisico: 70, 'mentalità': 72, tiro: 74, passaggio: 71, dribbling: 73, posizionamento: 72 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 4 }, matches: 0, totalMatches: 30, goals: 0, totalGoals: 8,
  matchHistory: [], bankBalance: 50000, sessionsThisWeek: 3, yellAccum: 0, seasonCards: { y: 0, r: 0 }, popularity: 40, value: 6,
  history: [{ season: 1, club: CLUB.n, clubId: CLUB.id, goals: 8, assists: 3, matches: 30, ovr: 72, league: CLUB.lg }],
  hasAgent: true } });
const CASI = [
  { tag: 'A estate', name: 'Collaudo Arrivo A', week: 2, lastW: 20, trasf: true },
  { tag: 'B inverno', name: 'Collaudo Arrivo B', week: 20, lastW: 30, trasf: true },
  { tag: 'C senza trasferimento', name: 'Collaudo Arrivo C', week: 2, lastW: 20, trasf: false },
];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ko = []; const righe = [];
for (const K of CASI) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ s, r }) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G409 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s: save(K.name, K.week, K.lastW), r: ROSSO });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(600);
  for (let i = 0; i < 12; i++) { const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length); if (!n) break; await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300); }
  /* il procuratore: gia' firmato da una stagione, ultimo confronto mesi fa (il confronto e' maturo) */
  const ag = await page.evaluate((lastW) => { const C = window.__CPM_CAREER; const a = agentInit({ id: 'prudente', name: 'Collaudo', season: 1, week: 1 }); a.lastCheckin = { s: 1, w: lastW };
    C.patch({ hasAgent: true, agent: a, agentCheckin: null }); return true; }, K.lastW); await sleep(500);
  let arrivo = null;
  if (K.trasf) {
    let acc = null;
    for (let t = 0; t < 3; t++) {/* si attende l'evento (club cambiato), mai un tempo fisso: il gancio acceptOffer vede l'offerta solo dopo il render */
      await page.evaluate(() => { const C = window.__CPM_CAREER; const o = generateTransferOffer(C.snapshot()); o.type = 'trasferimento'; o.minutaggio = 70; C.setOffer(o); }); await sleep(1200);
      acc = await page.evaluate(() => window.__CPM_CAREER.acceptOffer());
      try { await page.waitForFunction((id) => { const p = window.__CPM_CAREER.snapshot(); return p.club && p.club.id !== id && p.clubArrivo409 !== undefined; }, CLUB.id, { timeout: 8000 }); break; } catch (e) {}
    }
    await sleep(800);
    arrivo = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { club: p.club && p.club.id, s: p.season, w: p.week, timbro: p.clubArrivo409 || null }; });
    if (acc !== true || !arrivo.club || arrivo.club === CLUB.id) { ko.push(`${K.tag}: il trasferimento non e' avvenuto (${acc}, club ${arrivo && arrivo.club})`); await ctx.close(); continue; }
    if (!ROSSO && !(arrivo.timbro && arrivo.timbro.id === arrivo.club && arrivo.timbro.s === arrivo.s && arrivo.timbro.w === arrivo.w)) ko.push(`${K.tag}: timbro d'arrivo assente o sbagliato ${JSON.stringify(arrivo.timbro)}`);
  }
  const S0 = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot(); return { s: p.season, w: p.week }; });
  const prima = { confronto: null, intervista: null, evento: null }; let ultima = null; let passi = 0;
  for (let i = 0; i < SETT * 3 && passi < SETT; i++) {
    const r = await page.evaluate(() => window.__CPM_CAREER.step()); await sleep(250);
    if (/^error/.test(String(r))) { ko.push(`${K.tag}: step ${r}`); break; }
    if (r === 'seasonEnd') break;
    if (r !== 'advanced' && r !== 'simulated') continue;
    passi++;
    await sleep(150);
    const m = await page.evaluate(() => { const p = window.__CPM_CAREER.snapshot();
      const iv = ((window.__CPM_Q409 && window.__CPM_Q409().iv) || []).find(q => /Come ti trovi a \{club\}/.test(q.q));
      const ev = ((window.__CPM_Q409 && window.__CPM_Q409().ev) || []).find(e => e.id === 'wi_ex_club');
      const g = window.gradimento409(p);
      return { s: p.season, w: p.week, conf: !!(p.agentCheckin && p.agentCheckin.due), iv: iv ? (!iv.cond || !!iv.cond(p)) : null, ev: ev ? !!ev.cond({ ...p, history: [...(p.history || []), { clubId: 'altro', season: 1 }] }) : null, sett: g.sett, partite: g.partite }; });
    ultima = m;
    const off = (m.s - S0.s) * 38 + (m.w - S0.w);
    for (const [k, v] of [['confronto', m.conf], ['intervista', m.iv], ['evento', m.ev]]) {
      if (v === null) { ko.push(`${K.tag}: ${k} non misurabile (gancio assente)`); continue; }
      if (v && !prima[k]) prima[k] = { off, sett: m.sett, partite: m.partite };
    }
  }
  if (passi < 12) ko.push(`${K.tag}: avanzate solo ${passi} settimane (non giudicato)`);
  righe.push(`  ${K.tag}: arrivo ${arrivo ? `S${arrivo.s} W${arrivo.w} ${arrivo.club}` : '—'} · settimane avanzate ${passi} · prima comparsa (settimane dall'arrivo / partite col club): `
    + Object.entries(prima).map(([k, v]) => `${k} ${v ? `${v.off} sett./${v.partite ?? '-'} part.` : 'mai'}`).join(' · '));
  for (const [k, v] of Object.entries(prima)) {
    if (K.trasf) {
      if (!v) { ko.push(`${K.tag}: ${k} non arriva mai in ${passi} settimane (silenzio per sempre?)`); continue; }
      const presto = v.off < 16 && !(v.off >= 10 && (v.partite || 0) >= 6);
      if (presto) ko.push(`${K.tag}: ${k} chiede il gradimento dopo ${v.off} settimane e ${v.partite ?? '?'} partite col club (minimo 10 sett. + 6 partite, o 16 sett.)`);
    } else if (k === 'confronto' && (!v || v.off > 3)) ko.push(`${K.tag}: senza trasferimento il confronto e' arrivato ${v ? `dopo ${v.off} settimane` : 'mai'} (freno di troppo)`);
  }
  if (errs.length) ko.push(`${K.tag}: pageerror ${errs[0]}`);
  await ctx.close();
}
/* regola pura: salvataggio senza timbro */
{
  const ctx = await b.newContext(); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => typeof window.timbroArrivo409 === 'function', null, { timeout: 60000 });
  const R = await page.evaluate(() => { const T = window.timbroArrivo409; const club = { id: 'x' };
    return { vecchio: T({ club, season: 3, week: 12, history: [{ season: 2, clubId: 'x' }] }), cambiato: T({ club, season: 3, week: 12, history: [{ season: 3, clubId: 'y' }] }),
      vivo: T({ club, season: 3, week: 12, clubArrivo409: { id: 'y', s: 1, w: 1 } }), fermo: T({ club, season: 3, week: 12, clubArrivo409: { id: 'x', s: 2, w: 4 } }) }; });
  righe.push('  regola sui salvataggi senza timbro: ' + JSON.stringify(R));
  if (!(R.vecchio && R.vecchio.s === 0)) ko.push('salvataggio senza timbro e stesso club: deve valere «arrivo sconosciuto» (nessun freno)');
  if (!(R.cambiato && R.cambiato.s === 3 && R.cambiato.w === 1)) ko.push('salvataggio senza timbro col club cambiato in stagione: arrivo atteso a settimana 1');
  if (!(R.vivo && R.vivo.s === 3 && R.vivo.w === 12)) ko.push('cambio di club dal vivo: timbro atteso alla settimana corrente');
  if (R.fermo !== null) ko.push('timbro gia\' giusto: non va riscritto');
  await ctx.close();
}
await b.close(); srv.close();
console.log(`dopo-trasferimento-409 (${ROSSO ? 'ROSSO __CPM_NO_G409' : 'verde'})`);
righe.forEach(r => console.log(r));
if (ko.length) { console.log('❌ ' + ko.length + ' problemi:'); ko.forEach(k => console.log('   - ' + k)); process.exit(1); }
console.log('✅ nessuna domanda sul gradimento prima del tempo, e nessun silenzio per sempre');
