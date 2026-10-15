#!/usr/bin/env node
/* [PO-265 · giro 37, eccezione PO 15/10 «Correggi tutte e tre»] GUARDIANO: «INVESTO META' DEL CONTO» TOGLIE LA META' DEL CONTO.
 *
 * Flusso vero (handler __CPM_CAREER, ?cpmtest=1; stato da localStorage 'cpm-v3'): per ogni saldo si apre il pop-up VERO
 * dell'impulso wi_investimento (apriImpulso), si legge il bottone «Investo meta' del conto» (acceso/spento e cosa dice) e lo si
 * clicca. Si misura quanto esce dal conto e cosa registra investimenti223 (PO-223), da cui dipende il rientro a fine stagione.
 *   150.000€ → escono 75.000€ · 60.000€ → 30.000€ · 30.000€ → 15.000€ · 8.000€ → scelta spenta («serve almeno 10.000€»)
 * Prova del rosso: CPM_ROSSO=1 arma window.__CPM_NO_META265 → torna il bank fisso -40.000: il guardiano DEVE uscire 1.
 * Uso: CPM_CHROME=/opt/pw-browsers/chromium node meta-conto-265.mjs   (CPM_JSON=1 stampa i numeri grezzi)
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const guasti = []; const righe = [];
const ok = (c, m) => { righe.push((c ? '✓ ' : '✗ ') + m); if (!c) guasti.push(m); };

const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const baseSave = (bank) => ({ phase: 'career', player: { name: 'Collaudo Zona G', nation: 'Italia', avatarId: 0, proStatus: 'pro',
  season: 2, week: 12, weekLived: false, age: 20, ovr: 70, tutorialDone: true, club: CLUB,
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 }, yellAccum: 0, seasonCards: { y: 0, r: 0 },
  matches: 0, totalMatches: 0, goals: 0, totalGoals: 0, matchHistory: [], bankBalance: bank } });

async function apri(save) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_META265 = true;
    localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s: save, rosso: ROSSO });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(800);
  for (let i = 0; i < 12; i++) {
    const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length);
    if (!n) break;
    await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300);
  }
  return { ctx, page, errori };
}
const salvato = (page) => page.evaluate(() => { const p = (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player) || {};
  return { bank: p.bankBalance || 0, flag: !!p.investmentPending, reg: p.investimenti223 || [] }; });

const SALDI = [{ bank: 150000, esce: 75000 }, { bank: 60000, esce: 30000 }, { bank: 30000, esce: 15000 }, { bank: 8000, esce: null }];
const R = [];
for (const sa of SALDI) {
  const { ctx, page, errori } = await apri(baseSave(sa.bank));
  const s0 = await salvato(page);
  const ap = await page.evaluate(() => window.__CPM_CAREER.apriImpulso('wi_investimento')); await sleep(700);
  const btn = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(x => (x.textContent || '').includes('Investo metà del conto'));
    if (!b.length) return null; const x = b[b.length - 1]; const r = { testo: (x.textContent || '').trim(), spento: !!x.disabled }; if (!x.disabled) x.click(); return r; });
  await sleep(900);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const s1 = await salvato(page);
  const ultima = s1.reg[s1.reg.length - 1] || null;
  R.push({ ...sa, ap, btn, prima: s0.bank, dopo: s1.bank, uscito: s0.bank - s1.bank, flag: s1.flag, reg: ultima, nReg: s1.reg.length, errori });
  await ctx.close();
}
if (process.env.CPM_JSON === '1') console.log(JSON.stringify(R, null, 1));
const eur = (v) => String(Math.round(Math.abs(v))).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '€';
console.log(`PO-265 · «Investo metà del conto»${ROSSO ? ' · ROSSO (__CPM_NO_META265)' : ''}`);
console.log('saldo       bottone        uscito      registro   flag');
for (const r of R) console.log(`${eur(r.bank).padEnd(11)} ${(r.btn ? (r.btn.spento ? 'spento' : 'acceso') : 'assente').padEnd(14)} ${eur(r.uscito).padEnd(11)} ${(r.reg ? eur(r.reg.amt) + ' ' + r.reg.prof : '—').padEnd(10)} ${r.flag}  ${r.btn && r.btn.spento ? '«' + r.btn.testo.slice(0, 70) + '»' : ''}`);

for (const r of R) {
  ok(!!r.btn, `${eur(r.bank)}: il pop-up vero mostra la scelta (misura non cieca)`);
  ok(!r.errori.length, `${eur(r.bank)}: nessun errore di pagina ${r.errori.join(' | ')}`);
  if (r.esce != null) {
    ok(r.btn && !r.btn.spento, `${eur(r.bank)}: scelta accesa`);
    ok(r.uscito === r.esce, `${eur(r.bank)}: esce la metà del conto (${eur(r.uscito)} contro ${eur(r.esce)} attesi)`);
    ok(!!r.reg && r.reg.amt === r.uscito && r.reg.prof === 'prudente', `${eur(r.bank)}: il registro investimenti223 dice la cifra vera`);
    ok(r.flag, `${eur(r.bank)}: investimento in corso`);
  } else {
    ok(r.btn && r.btn.spento && /almeno 10\.000/.test(r.btn.testo), `${eur(r.bank)}: scelta spenta e dice il minimo («serve almeno 10.000€»)`);
    ok(r.uscito === 0 && !r.flag && r.nReg === 0, `${eur(r.bank)}: nessuna uscita, nessun investimento`);
  }
}
console.log(righe.join('\n'));
console.log(guasti.length ? `\n✗ ROSSO meta-conto-265: ${guasti.length} controlli falliti` : '\n✅ VERDE meta-conto-265');
await browser.close(); srv.close();
process.exit(guasti.length ? 1 : 0);
