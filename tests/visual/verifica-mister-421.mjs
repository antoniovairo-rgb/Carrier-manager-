#!/usr/bin/env node
/* GUARDIANO giro 421 · PO-684 — «la verifica trimestrale ascolta il rapporto col mister».

   Collaudo PO (7.999.217, FC Augusta S.2 W.24): «Il club è orgoglioso di te» da un mister nuovo che
   «non mi vedeva di buon occhio», con la risposta «Mi ha reso un giocatore migliore». La scelta
   (`pickCoachReview`, src/17) guardava solo il rendimento.

   MISURA: 3 rendimenti (alto/medio/basso) × fiducia (alta 75 / bassa 40) × mister (nuovo / di lunga
   data), 4 stagioni × 4 verifiche per combinazione con la memoria intrecciata come nel gioco
   (= 16 verifiche, cioe' l'intero mazzo di ogni fascia). Tre giocatori «nuovi», uno per ciascuna
   causa (esonero dell'anno, cambio di panchina all'ultimo cambio di stagione, primo anno nel club).
   Per ogni combinazione: battute calorose uscite, battute che presuppongono una storia, risposta
   «Mi ha reso un giocatore migliore».

   VERDE: mister freddo ⇒ 0 battute calorose; mister nuovo ⇒ 0 battute «storiche» e 0 «mi ha reso
   migliore»; rendimento alto + freddo ⇒ solo battute della fascia a denti stretti; mister caldo e di
   lunga data ⇒ il vecchio mazzo resta intero (almeno una calorosa e la risposta «reso migliore» compare).
   ROSSO (secondo braccio nella stessa corsa, `window.__CPM_NO_G421`): deve tornare a uscire almeno una battuta calorosa da
   un mister nuovo e diffidente; altrimenti la prova del rosso e' cieca e il guardiano esce ≠0.
   «Non giudicato» (sonda assente, combinazione vuota) = rosso.

     npm run verifica-mister-421            # verde + rosso
     CPM_FOTO=1 npm run verifica-mister-421 # + foto prima/dopo in docs/collaudo-po/421-*.png            */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const club = { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 60, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' };
const base = {
  name: 'Probe Mister', nation: 'Italia', avatarId: 1, proStatus: 'pro', season: 3, week: 8, age: 24, ovr: 79,
  campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3, tutorialDone: true,
  seasonPledge: { season: 3, tone: 'equilibrato' }, club, coach: { name: 'Mister Rossi', style: 'Bilanciato', trustMod: 0 },
  stats: { 'velocità': 80, tecnica: 80, fisico: 78, 'mentalità': 80, tiro: 81, passaggio: 80, dribbling: 80, posizionamento: 80 },
  form: 84, morale: 85, fatigue: 15, coachTrust: 72, popularity: 60, value: 20, bankBalance: 90000,
  history: [{ season: 1, club: 'FC Salernum', clubId: 'sal', goals: 9, assists: 3, matches: 30, ovr: 74, league: 'Lega A' },
            { season: 2, club: 'FC Salernum', clubId: 'sal', goals: 12, assists: 5, matches: 32, ovr: 77, league: 'Lega A' }],
  coachHistory: [{ name: 'Mister Rossi', season: 1, coachChanged: false }, { name: 'Mister Rossi', season: 2, coachChanged: false }],
  matchHistory: [{ won: true, drew: false, rating: 7.4, goals: 1, assists: 0 }],
  contract: { duration: 3, wage: 30000, expiresAtSeason: 6 } };
async function apri(rosso, p, vp) {
  const page = await b.newPage({ viewport: vp || { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(a => { window.__CPM_GLB = true; if (a.rosso) window.__CPM_NO_G421 = 1; localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: a.p })); }, { p, rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
  await sleep(1600);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.verifica421 && window.__CPM_CAREER.insiemi421), { timeout: 30000 });
  return page;
}
async function misura(rosso) {
  let esito;
  try {
    const page = await apri(rosso, base);
    esito = await page.evaluate((base) => {
      const C = window.__CPM_CAREER; const ins = C.insiemi421();
      const mister = {
        lunga: {},
        esonero: { coachSackSeason: base.season },
        panchina: { coachHistory: [...base.coachHistory, { name: 'Mister Bianchi', season: base.season - 1, coachChanged: true }] },
        club: { club: { ...base.club, id: 'aug', n: 'FC Augusta' } },
      };
      const perfF = { alto: 84, medio: 62, basso: 45 }; const fid = { alta: 75, bassa: 40 };
      const out = [];
      for (const [pk, form] of Object.entries(perfF)) for (const [fk, ct] of Object.entries(fid)) for (const [mk, extra] of Object.entries(mister)) {
        let q = { ...base, ...extra, form, coachTrust: ct, recentCoachLines: [], recentCoachChoices: [] };
        const perf = form >= 72 ? 'excellent' : form >= 55 ? 'medium' : 'bad';
        const righe = []; const W = [8, 16, 24, 32];
        for (let i = 0; i < 16; i++) {
          const w = W[i % 4]; q = { ...q, week: w };
          const r = C.verifica421(q, perf, w);
          if (typeof r === 'string') return { err: r };
          righe.push(r);
          q = { ...q, recentCoachLines: [...q.recentCoachLines, r.line].slice(-13), recentCoachChoices: [...q.recentCoachChoices, ...r.ch].slice(-7) };
        }
        out.push({ pk, fk, mk, righe });
      }
      return { ins, out };
    }, base);
    await page.close();
  } catch (e) { esito = { err: String(e && e.message || e) }; }
  return esito;
}

/* foto prima/dopo: il caso del PO (S.2 W.24, rendimento alto, mister nuovo dopo l'esonero, fiducia 40), vista da PC */
async function foto(rosso, file) {
  const p = { ...base, season: 2, week: 24, form: 84, coachTrust: 40, coachSackSeason: 2, presidentModalSeason: 2, jerseyNumSeason: 2, drawSeen: 2, mercatoSeen: 2, presentSeason: 2, seasonPledge: { season: 2, tone: 'equilibrato' },
    history: [base.history[0]], coachHistory: [base.coachHistory[0]], recentCoachLines: [], recentCoachChoices: [] };
  const page = await apri(rosso, p, { width: 1280, height: 800 });
  const r = await page.evaluate(() => window.__CPM_CAREER.apriVerifica421());
  await sleep(900);
  await page.screenshot({ path: file });
  await page.close();
  return r;
}

const verde = await misura(false);
const rossoE = await misura(true);
if (process.env.CPM_FOTO) {
  const dir = '../../docs/collaudo-po/';
  console.log('foto prima:', JSON.stringify(await foto(true, dir + '421-verifica-mister-prima.png')));
  console.log('foto dopo :', JSON.stringify(await foto(false, dir + '421-verifica-mister-dopo.png')));
}
await b.close(); srv.close();
function giudica(esito, ROSSO) {
const guasti = [];
if (esito.err) return { cieco: true, guasti: ['NON GIUDICATO: ' + esito.err], caldeNuovoFreddo: 0 };
const { ins, out } = esito;
const CALDE = new Set(ins.calde), STOR = new Set(ins.storiche), FREDDE = new Set(ins.fredde), TUTTE = new Set(ins.tutte);
for (const l of [...CALDE, ...STOR]) if (!TUTTE.has(l)) guasti.push(`insieme 421 con una battuta che non esiste nel mazzo: «${l.slice(0, 50)}»`);
const RESO = /Mi ha reso un giocatore migliore/;
console.log(`\n=== verifica del mister · ${out.length} combinazioni × 16 verifiche ${ROSSO ? '(ROSSO __CPM_NO_G421)' : ''} ===`);
console.log('rend.  fiducia mister    | calde storiche «reso migliore» | battute distinte');
let caldeNuovoFreddo = 0;
for (const c of out) {
  if (!c.righe.length) { guasti.push(`${c.pk}/${c.fk}/${c.mk}: non giudicato (nessuna verifica)`); continue; }
  const calde = c.righe.filter(r => CALDE.has(r.line)).length;
  const stor = c.righe.filter(r => STOR.has(r.line)).length;
  const reso = c.righe.filter(r => r.ch.some(t => RESO.test(t))).length;
  const dist = new Set(c.righe.map(r => r.line)).size;
  console.log(`${c.pk.padEnd(6)} ${c.fk.padEnd(7)} ${c.mk.padEnd(9)} | ${String(calde).padStart(5)} ${String(stor).padStart(8)} ${String(reso).padStart(15)} | ${dist}`);
  const nuovo = c.mk !== 'lunga', freddo = c.fk === 'bassa';
  if (nuovo && freddo) caldeNuovoFreddo += calde;
  if (ROSSO) continue;
  if (freddo && calde) guasti.push(`${c.pk}/${c.fk}/${c.mk}: ${calde} battute calorose da un mister freddo`);
  if (nuovo && stor) guasti.push(`${c.pk}/${c.fk}/${c.mk}: ${stor} battute «di lunga data» da un mister nuovo`);
  if (nuovo && reso) guasti.push(`${c.pk}/${c.fk}/${c.mk}: «Mi ha reso un giocatore migliore» offerta ${reso} volte a un mister nuovo`);
  if (c.pk === 'alto' && freddo && c.righe.some(r => !FREDDE.has(r.line))) guasti.push(`${c.pk}/${c.fk}/${c.mk}: rendimento alto e mister freddo fuori dalla fascia a denti stretti`);
  if (!nuovo && !freddo && c.pk === 'alto' && (!calde || !reso)) guasti.push(`alto/alta/lunga: il mazzo caloroso e' sparito (calde ${calde}, reso ${reso}) — il filtro e' troppo largo`);
  if (dist < 6) guasti.push(`${c.pk}/${c.fk}/${c.mk}: solo ${dist} battute distinte in 16 verifiche`);
}
return { guasti, caldeNuovoFreddo };
}

const gV = giudica(verde, false);
const gR = giudica(rossoE, true);
let rc = 0;
console.log(`\nROSSO (__CPM_NO_G421): battute calorose da un mister nuovo e diffidente = ${gR.caldeNuovoFreddo}`);
if (gR.cieco || !gR.caldeNuovoFreddo) { console.log('❌ prova del rosso CIECA: senza la regola 421 non esce nessuna battuta calorosa (o braccio non giudicato)'); rc = 1; }
if (gV.guasti.length) { console.log('\n❌ ROSSO (braccio verde)\n · ' + gV.guasti.join('\n · ')); rc = 1; }
if (!rc) console.log('\n✅ VERDE — mister nuovo e diffidente: 0 battute calorose, 0 «reso migliore», fascia a denti stretti su rendimento alto · rosso riprodotto (' + gR.caldeNuovoFreddo + ' calorose)');
process.exit(rc);
