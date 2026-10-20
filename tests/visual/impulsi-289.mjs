#!/usr/bin/env node
/* [PO-289 · giro 84, foto PO «scuola calcio col tuo nome: e' un impulso finto, e' gestito dall'ufficio»] GUARDIANO IMPULSI COLLEGATI ALL'UFFICIO — non-gate, carriera.
 * Ogni controllo gira sulle funzioni VERE della pagina (pop-up aperto col varco __CPM_CAREER.apriImpulso e scelta col gestore vero __CPM_CAREER.scegli):
 *   T1 accademia  «Ci metto faccia e soldi» scrive player.academy24 e toglie dal conto ESATTAMENTE academyCost24().found; il testo dice «Ufficio»;
 *                 «Presto solo il nome» e' una licenza (nessuna accademia, +6.000)
 *   T2 compare    l'impulso non esce con accademia gia' aperta, con patrimonio sotto il costo, ne' da Primavera
 *   T3 staff      mental coach e «specialista» (preparatore atletico) ingaggiati dall'impulso accendono perkMental / perkNutrition (livello 1); non escono se gia' attivi
 *   T4 beni       casa (impulso e vita) e auto (vita) scrivono beni24 al costo dell'Ufficio, non escono se gia' tuoi
 *   T5 sponsor    vita_agente_sponsor firma un contratto vero (player.sponsors) con l'offerta del Procuratore; non esce senza offerta o con uno sponsor gia' firmato
 *   T6 club       «preparatore atletico del club» nei testi che non sono lo staff privato
 * Rosso: window.__CPM_NO_IMP289 = comportamento 7.999.176 (deve far cadere T1..T6).
 * Uso: node impulsi-289.mjs            → verde (esce 0 se 6/6)
 *      CPM_PROVA_ROSSO=1 node impulsi-289.mjs → in piu' accende il rosso e pretende che ogni controllo cada. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const BASE = { name: 'Sim Impulsi', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 24, ovr: 72, tutorialDone: true, club: CLUB,
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 50, fatigue: 10, popularity: 60, coachTrust: 60, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 }, bankBalance: 5000000,
  hasAgent: true, agent: { name: 'Marco Bellini', rapport: 50 } };
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

async function giro(rosso) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 140)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_IMP289 = true;
    localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: s })); }, { s: BASE, rosso });
  for (let t = 0; t < 3; t++) { try { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); break; } catch (e) { if (t === 2) throw e; } }
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(800);
  // apre il pop-up di un impulso, ne legge i testi, sceglie, rilegge lo stato; poi rimette lo stato di partenza
  const prova = async (id, i, reset) => {
    await page.evaluate((reset) => { window.__CPM_CAREER.patch(reset); }, reset); await sleep(250);
    const aperto = await page.evaluate((id) => window.__CPM_CAREER.apriImpulso(id), id); await sleep(500);
    const testi = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(t => t.length > 3 && t.length < 220));
    const prima = await page.evaluate(() => window.__CPM_CAREER.snapshot());
    const esito = await page.evaluate((i) => window.__CPM_CAREER.scegli(i), i); await sleep(600);
    const dopo = await page.evaluate(() => window.__CPM_CAREER.snapshot());
    await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} });
    return { aperto, esito, testi, prima, dopo };
  };
  const NET = { academy24: null, perkMental: false, perkMentalLv: null, perkNutrition: false, perkNutritionLv: null, perkFisio: false, perkTrainer: false, beni24: [], sponsors: [], bankBalance: 5000000, popularity: 60 };
  const o = {};
  // T1
  { const a = await prova('wi_scuola_calcio', 0, NET); const b = await prova('wi_scuola_calcio', 1, NET);
    const costo = await page.evaluate((p) => academyCost24(p).found, { ...BASE });
    o.T1 = { aperto: a.aperto, accademia: !!(a.dopo.academy24 && a.dopo.academy24.name && a.dopo.academy24.paused === false && a.dopo.academy24.founded === a.prima.season),
      speso: (a.prima.bankBalance || 0) - (a.dopo.bankBalance || 0), costo, testoUfficio: a.testi.some(t => /Ufficio/.test(t) && /Accademia/.test(t)),
      licenzaAccademia: !!b.dopo.academy24, licenzaSoldi: (b.dopo.bankBalance || 0) - (b.prima.bankBalance || 0), licenzaTesto: b.testi.some(t => /nessuna scuola/.test(t)) }; }
  // T2
  { o.T2 = await page.evaluate((B) => { const im = WEEKLY_IMPULSES.find(x => x.id === 'wi_scuola_calcio'); const c = (o) => !!im.cond({ ...B, ...o });
      return { base: c({}), conAccademia: c({ academy24: { name: 'Accademia X', founded: 1, grads: [], tot: 0, paused: false } }), contoBasso: c({ bankBalance: academyCost24(B).found - 1 }),
        contoGiusto: c({ bankBalance: academyCost24(B).found }), primavera: c({ proStatus: 'u18' }) }; }, BASE); }
  // T3
  { const m = await prova('wi_mental_coach', 0, NET); const n = await prova('wi_personal_chef', 0, NET);
    const cond = await page.evaluate((B) => { const f = (id, o) => !!WEEKLY_IMPULSES.find(x => x.id === id).cond({ ...B, ...o });
      return { mental: f('wi_mental_coach', {}), mentalAttivo: f('wi_mental_coach', { perkMental: true, perkMentalLv: 1 }), chef: f('wi_personal_chef', {}), chefAttivo: f('wi_personal_chef', { perkNutrition: true, perkNutritionLv: 1 }) }; }, BASE);
    o.T3 = { mental: m.dopo.perkMental === true && m.dopo.perkMentalLv === 1, mentalTesto: m.testi.some(t => /Ufficio/.test(t)), mentalSpeso: (m.prima.bankBalance || 0) - (m.dopo.bankBalance || 0),
      prep: n.dopo.perkNutrition === true && n.dopo.perkNutritionLv === 1, prepTesto: n.testi.some(t => /Ufficio/.test(t)), cond }; }
  // T4
  { const c = await prova('wi_casa_citta', 0, NET);
    const v = await page.evaluate((B) => { const A = VITA_EVENTS.find(x => x.id === 'vita_auto'), C = VITA_EVENTS.find(x => x.id === 'vita_casa');
      const pa = vitaConto281({ ...B, beni24: [] }, A.ef), pc = vitaConto281({ ...B, beni24: [] }, C.ef);
      return { autoCond: !!A.cond({ ...B, beni24: [] }), autoGia: !!A.cond({ ...B, beni24: ['auto'] }), casaCond: !!C.cond({ ...B, beni24: [] }), casaGia: !!C.cond({ ...B, beni24: ['casa'] }),
        autoBeni: pa.beni24, autoBank: pa.bankBalance, casaBeni: pc.beni24, casaBank: pc.bankBalance, impCasaGia: !!WEEKLY_IMPULSES.find(x => x.id === 'wi_casa_citta').cond({ ...B, beni24: ['casa'] }) }; }, BASE);
    o.T4 = { casaImp: Array.isArray(c.dopo.beni24) && c.dopo.beni24.includes('casa'), casaSpeso: (c.prima.bankBalance || 0) - (c.dopo.bankBalance || 0), casaTesto: c.testi.some(t => /Compro/.test(t)), ...v }; }
  // T5
  { o.T5 = await page.evaluate((B) => { const E = VITA_EVENTS.find(x => x.id === 'vita_agente_sponsor'); const p = { ...B, sponsors: [] };
      const ef = E.ef, patch = vitaConto281(p, ef); const tx = typeof E.txt === 'function' ? E.txt(p) : E.txt;
      return { cond: !!E.cond(p), gia: !!E.cond({ ...p, sponsors: [{ tier: 'tecnico', brand: 'X', weekly: 1200, season: 1 }] }), senzaOfferta: !!E.cond({ ...p, popularity: 10 }),
        sponsors: (patch.sponsors || []).map(s => ({ tier: s.tier, w: s.weekly > 0 })), bankBalance: patch.bankBalance, testoBrand: !!(patch.sponsors && patch.sponsors[0] && tx.indexOf(patch.sponsors[0].brand) >= 0) }; }, BASE); }
  // T6
  { o.T6 = await page.evaluate(() => ['wi_ciclo_forza', 'wi_staff', 'wi_analisi_video', 'wi_crioterapia', 'wi_sosta_nazionali', 'wi_dieta_ferrea'].map(id => /del club/.test(WEEKLY_IMPULSES.find(x => x.id === id).txt))); }
  await ctx.close();
  const ok = {
    T1: o.T1.aperto === true && o.T1.accademia && o.T1.speso === o.T1.costo && o.T1.costo === 150000 && o.T1.testoUfficio && !o.T1.licenzaAccademia && o.T1.licenzaSoldi === 6000 && o.T1.licenzaTesto,
    T2: o.T2.base === true && o.T2.conAccademia === false && o.T2.contoBasso === false && o.T2.contoGiusto === true && o.T2.primavera === false,
    T3: o.T3.mental && o.T3.mentalTesto && o.T3.mentalSpeso === 0 && o.T3.prep && o.T3.prepTesto && o.T3.cond.mental === true && o.T3.cond.mentalAttivo === false && o.T3.cond.chef === true && o.T3.cond.chefAttivo === false,
    T4: o.T4.casaImp && o.T4.casaSpeso === 250000 && o.T4.autoCond && !o.T4.autoGia && o.T4.casaCond && !o.T4.casaGia && !o.T4.impCasaGia
      && (o.T4.autoBeni || []).includes('auto') && o.T4.autoBank === 5000000 - 150000 && (o.T4.casaBeni || []).includes('casa') && o.T4.casaBank === 5000000 - 250000,
    T5: o.T5.cond && !o.T5.gia && !o.T5.senzaOfferta && o.T5.sponsors.length === 1 && o.T5.sponsors[0].w && o.T5.bankBalance == null && o.T5.testoBrand,
    T6: o.T6.length === 6 && o.T6.every(Boolean),
  };
  return { o, ok, err };
}

let exitCode = 0;
const v = await giro(false);
console.log('VERDE', JSON.stringify(v.o, null, 0));
for (const k of Object.keys(v.ok)) console.log(`  ${v.ok[k] ? '✅' : '❌'} ${k}`);
if (v.err.length) console.log('  pageerror:', v.err.slice(0, 3).join(' | '));
if (!Object.values(v.ok).every(Boolean) || v.err.length) exitCode = 1;
if (process.env.CPM_PROVA_ROSSO) {
  const x = await giro(true);
  const cadute = Object.keys(x.ok).filter(k => !x.ok[k]);
  console.log(`ROSSO __CPM_NO_IMP289 → cadono ${cadute.join(',') || '-'} (${cadute.length}/${Object.keys(x.ok).length}) ${cadute.length === Object.keys(x.ok).length ? '✅' : '❌'}`);
  if (cadute.length !== Object.keys(x.ok).length) { exitCode = 1; console.log('  restano verdi:', Object.keys(x.ok).filter(k => x.ok[k]).join(',')); }
}
console.log(exitCode ? 'IMPULSI-289: ❌ ROSSO' : 'IMPULSI-289: ✅ VERDE');
await browser.close(); srv.close(); process.exit(exitCode);
