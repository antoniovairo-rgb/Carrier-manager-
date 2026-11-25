#!/usr/bin/env node
/* [giro 356 · PO-557] GUARDIANO «LO STAFF DI LIVELLO ALTO E' UN TRAGUARDO» — non-gate, carriera/economia.
 * Funzioni VERE della pagina (staffCost24, staffIngaggio356, __CPM_CAREER.weeklyEconomyFields) e l'Ufficio vero (pulsante «+»).
 * Gli stati del giocatore medio vengono dalla misura misura-356.mjs (OVR iniziale 63, carriera di 14 stagioni sugli handler veri):
 *   S1 prima stagione da pro (stip. 3.808, conto 130k) · S4 21 anni (3.808, 262k) · S5 22 anni (33.462, 1,42 mln) · S9 26 anni (84.615, 9,31 mln)
 *   T1 traguardo  tutti e tre al livello 3 NON alla portata in S1/S4/S5, alla portata in S9 (meta' carriera)
 *   T2 sentito    a meta' carriera tutti e tre al livello 3 costano almeno il 45% dello stipendio a settimana
 *   T3 Ufficio    conto 130k: «+» dal livello 1 al 2 disabilitato col motivo; conto 3 mln: L1→L2→L3 scala 300k + 2 mln (decisione PO 25/11, giro 361), registra staffIng356
 *   T4 economia   la settimana addebita il costo nuovo (weeklyEconomyFields: conto = conto + stipendio − procuratore − staff)
 *   T5 salvataggi save vecchio con trainer/preparatore/mental al livello 3 e nessun registro: lo tiene, nessun ingaggio, prezzo di prima
 * Uso: node staff-356.mjs → verde (uscita 0 se 5/5). CPM_PROVA_ROSSO=1 → in piu' accende __CPM_NO_G356 e pretende T1+T2+T3 rossi. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const BASE = { name: 'Sim Staff', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 3, age: 19, ovr: 68, tutorialDone: true, club: CLUB, hasAgent: true,
  stats: { 'velocità': 68, tecnica: 68, fisico: 68, 'mentalità': 68, tiro: 69, passaggio: 68, dribbling: 68, posizionamento: 68 },
  form: 70, morale: 72, fatigue: 10, popularity: 20, coachTrust: 60, contract: { duration: 3, wage: 3808, expiresAtSeason: 5 }, bankBalance: 130226,
  perkTrainer: true, perkTrainerLv: 1 };
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();

async function apri(save, rosso) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 140)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G356 = true; localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: s })); }, { s: save, rosso });
  for (let t = 0; t < 3; t++) { try { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); break; } catch (e) { if (t === 2) throw e; } }
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(800);
  return { page, ctx, err };
}
async function alUfficio(page) {
  await page.evaluate(() => { window.__CPM_CAREER.goTab('ufficio'); }); await sleep(900);
  return page.waitForSelector('[data-cpm="staff24-perkTrainer"]', { timeout: 8000 }).then(() => true).catch(() => false);
}
const piu = (page) => page.evaluate(() => { const r = document.querySelector('[data-cpm="staff24-perkTrainer"]'); const b = r && r.querySelector('button[aria-label^="Alza"]'); return b ? { dis: b.disabled, ing: (r.querySelector('[data-cpm="staff356-ingaggio"]') || {}).textContent || null } : null; });

async function giro(rosso) {
  const o = {};
  // T1/T2/T4: funzioni pure + economia vera
  { const { page, ctx, err } = await apri(BASE, rosso);
    const r = await page.evaluate(() => { const K = ['perkTrainer', 'perkNutrition', 'perkMental'];
      const vuoto = { perkTrainer: false, perkNutrition: false, perkMental: false, perkTrainerLv: null, perkNutritionLv: null, perkMentalLv: null, staffIng356: null };
      const st = (w, b, ag) => ({ ...window.__CPM_CAREER.snapshot(), ...vuoto, contract: { duration: 3, wage: w, expiresAtSeason: 9 }, bankBalance: b, hasAgent: ag });
      const ok = (p, L) => { const c = K.reduce((a, k) => a + staffCost24(p, k, L), 0), i = K.reduce((a, k) => a + (typeof staffIngaggio356 === 'function' ? staffIngaggio356(p, k, L) : 0), 0), net = p.contract.wage * (p.hasAgent ? 0.9 : 1);
        return p.bankBalance >= i && (c <= net || (p.bankBalance - i) >= 38 * (c - net)); };
      const S = { S1: st(3808, 130226, true), S4: st(3808, 261686, true), S5: st(33462, 1421446, true), S9: st(84615, 9309298, true) };
      const T1 = Object.fromEntries(Object.entries(S).map(([n, p]) => [n, ok(p, 3)]));
      const mid = S.S9, quota = K.reduce((a, k) => a + staffCost24(mid, k, 3), 0) / mid.contract.wage;
      // T4: settimana vera col trainer comprato al 3 (registro) e procuratore
      const p4 = { ...S.S9, perkTrainer: true, perkTrainerLv: 3, staffIng356: { perkTrainer: 3 } };
      const e4 = window.__CPM_CAREER.weeklyEconomyFields(p4), atteso = p4.bankBalance + 84615 - Math.round(84615 * 0.10) - staffCost24(p4, 'perkTrainer');
      return { T1, quota, T4: { bank: e4 && e4.bankBalance, atteso, costo: staffCost24(p4, 'perkTrainer') } }; });
    o.T1 = { ...r.T1, ok: !r.T1.S1 && !r.T1.S4 && !r.T1.S5 && r.T1.S9 };
    o.T2 = { quota: Math.round(r.quota * 100), ok: r.quota >= 0.45 };
    o.T4 = { ...r.T4, ok: r.T4.bank === r.T4.atteso && r.T4.costo >= 0.20 * 84615 };
    o.err1 = err.length; await ctx.close(); }
  // T3: l'Ufficio vero
  { const { page, ctx, err } = await apri(BASE, rosso); const vis = await alUfficio(page);
    const a = await piu(page);
    await page.evaluate(() => window.__CPM_CAREER.patch({ bankBalance: 3000000 })); await sleep(500);
    const b0 = await piu(page);
    await page.locator('[data-cpm="staff24-perkTrainer"] button[aria-label^="Alza"]').click(); await sleep(500);
    const s2 = await page.evaluate(() => { const P = window.__CPM_CAREER.snapshot(); return { lv: P.perkTrainerLv, bank: P.bankBalance, reg: P.staffIng356 || null }; });
    const b1 = await piu(page);
    if (b1 && !b1.dis) { await page.locator('[data-cpm="staff24-perkTrainer"] button[aria-label^="Alza"]').click(); await sleep(500); }
    const s3 = await page.evaluate(() => { const P = window.__CPM_CAREER.snapshot(); return { lv: P.perkTrainerLv, bank: P.bankBalance, reg: P.staffIng356 || null }; });
    o.T3 = { vis, primo: a, dopo3mln: b0, s2, s3, ok: vis && !!a && a.dis && /servono/.test(a.ing || '') && b0 && !b0.dis && s2.lv === 2 && s2.bank === 2700000 && s2.reg && s2.reg.perkTrainer === 2
      && s3.lv === 3 && s3.bank === 700000 && s3.reg && s3.reg.perkTrainer === 3 };
    o.err2 = err.length; await ctx.close(); }
  // T5: salvataggio vecchio (nessun registro) con tutto al livello 3
  { const old = { ...BASE, perkTrainerLv: 3, perkNutrition: true, perkNutritionLv: 3, perkMental: true, perkMentalLv: 3, prep281: 1 };
    const { page, ctx, err } = await apri(old, rosso);
    const r = await page.evaluate(() => { const P = window.__CPM_CAREER.snapshot(), K = ['perkTrainer', 'perkNutrition', 'perkMental'];
      return { lv: K.map(k => staffLv24(P, k)), ing: K.map(k => (typeof staffIngaggio356 === 'function' ? staffIngaggio356(P, k, 3) : 0)), costo: K.map(k => staffCost24(P, k, 3)), bank: P.bankBalance }; });
    o.T5 = { ...r, ok: r.lv.join() === '3,3,3' && r.ing.join() === '0,0,0' && r.costo.join() === '1960,1400,1120' && r.bank === BASE.bankBalance };
    o.err3 = err.length; await ctx.close(); }
  return o;
}
const PROVA = !!process.env.CPM_PROVA_ROSSO;
const v = await giro(false);
console.log('══ STAFF-356 · VERDE ══');
for (const t of ['T1', 'T2', 'T3', 'T4', 'T5']) console.log(`  ${v[t].ok ? 'ok ' : 'NO '} ${t} ${JSON.stringify({ ...v[t], ok: undefined })}`);
const errV = v.err1 + v.err2 + v.err3; console.log('  pageerror: ' + errV);
let pass = ['T1', 'T2', 'T3', 'T4', 'T5'].every(t => v[t].ok) && errV === 0;
if (PROVA) { const r = await giro(true);
  console.log('══ STAFF-356 · ROSSO (__CPM_NO_G356 = prezzi di prima) ══');
  for (const t of ['T1', 'T2', 'T3']) console.log(`  ${r[t].ok ? 'NO (passa ancora) ' : 'ok (cade)'} ${t} ${JSON.stringify({ ...r[t], ok: undefined })}`);
  const cade = !r.T1.ok && !r.T2.ok && !r.T3.ok; if (!cade) pass = false;
  console.log(cade ? '  il rosso cade come atteso' : '  ROSSO NON GIUDICATO: il guardiano non vede la differenza'); }
console.log(pass ? '\n✅ STAFF-356 OK' : '\n❌ STAFF-356 FAIL');
await browser.close(); srv.close(); process.exit(pass ? 0 : 1);
