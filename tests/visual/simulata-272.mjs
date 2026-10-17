#!/usr/bin/env node
/* [PO-272 · giro 51] GUARDIANO: NESSUNA NOTA TECNICA «(simulata)» NEL TESTO DELLA CARRIERA.
   Dopo una settimana simulata la riga del risultato in dashboard e il messaggio a comparsa dicevano «… vs X (simulata)».
   Handler VERI (?cpmtest=1), salvataggio sintetico 'cpm-v3' in stagione 2: il guardiano cerca una settimana con giornata di lega,
   apre la partita (apriPartita) e preme il vero bottone «Simula». Un osservatore armato PRIMA del caricamento registra ogni testo
   che compare nella pagina (anche i messaggi a comparsa che spariscono), poi si legge il testo della dashboard.
   VERDE: la riga del risultato c'e' (Vittoria/Pareggio/Sconfitta … vs) e in nessun testo della carriera compare «simulata».
   ROSSO: CPM_ROSSO=1 arma window.__CPM_NO_SIM272 → torna «(simulata)»: il guardiano DEVE uscire 1.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node simulata-272.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const SAVE = { phase: 'career', player: { name: 'Collaudo Settimana', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 22, ovr: 72,
  tutorialDone: true, club: CLUB, coachTrust: 80, stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 }, matches: 0, totalMatches: 0, goals: 0, totalGoals: 0,
  matchHistory: [], bankBalance: 0, sessionsThisWeek: 3, yellAccum: 0, seasonCards: { y: 0, r: 0 } } };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ko = [];
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
await page.addInitScript(({ s, r }) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_SIM272 = 1; localStorage.setItem('cpm-v3', JSON.stringify(s));
  window.__T272 = []; const arma = () => { new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) { const t = (n.textContent || ''); if (/simulat/i.test(t) || /(Vittoria|Pareggio|Sconfitta) \d+–\d+/.test(t)) window.__T272.push(t.replace(/\s+/g, ' ').trim().slice(0, 200)); } }).observe(document.documentElement, { childList: true, subtree: true, characterData: true }); };
  if (document.documentElement) arma(); else document.addEventListener('DOMContentLoaded', arma); }, { s: SAVE, r: ROSSO });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(600);
for (let i = 0; i < 12; i++) { const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length); if (!n) break; await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300); }
let W = null;
for (let w = 2; w <= 20 && !W; w++) { await page.evaluate((w) => window.__CPM_CAREER.patch({ week: w, weekLived: false }), w); await sleep(220);
  const t = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd()); if (t && !t.type) W = w; }
if (!W) ko.push('nessuna settimana con giornata di lega: misura cieca');
await page.evaluate(() => window.__T272.length = 0);
await page.evaluate(() => window.__CPM_CAREER.apriPartita('starter')); await sleep(500);
const azione = await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].filter(x => /Simula/.test(x.textContent || '') && !/Non puoi/.test(x.textContent || ''));
  if (!bt.length) return null; bt[bt.length - 1].click(); return (bt[bt.length - 1].textContent || '').trim(); });
if (!azione) ko.push('bottone «Simula» non trovato');
await sleep(1500);
await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); } catch (e) {} }); await sleep(900);
const r = await page.evaluate(() => { const t = document.body.innerText; const riga = (t.match(/(Vittoria|Pareggio|Sconfitta) \d+–\d+ vs [^\n]*/) || [])[0] || null;
  const p = (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player) || {}; const h = (p.matchHistory || []).slice(-1)[0] || null;
  const _ix = t.search(/simulat/i); return { riga, simulataInPagina: _ix >= 0, ctxS: _ix >= 0 ? t.slice(Math.max(0, _ix - 120), _ix + 40).replace(/\s+/g, ' ') : '', visti: window.__T272.filter(x => /simulat/i.test(x)).slice(0, 5), esiti: window.__T272.filter(x => /(Vittoria|Pareggio|Sconfitta) \d+–\d+/.test(x)).slice(0, 3), simulated: h && !!h.simulated, settimana: p.week }; });
console.log(`  settimana ${W} · bottone «${azione}» · ultima partita simulated=${r.simulated} · riga «${r.riga}» · «simulata» in pagina ${r.simulataInPagina} · contesto «${r.ctxS}» · esito «${r.esiti[0] || ''}» · comparsi ${r.visti.length}${r.visti.length ? ': ' + r.visti.join(' | ') : ''}`);
if (!r.simulated) ko.push('la partita non risulta simulata: misura cieca');
if (!r.esiti.length) ko.push('messaggio del risultato della settimana simulata non visto');
// Riga del risultato in dashboard (r.~7496): si mostra quando la partita della settimana corrente e' giocata. Si mette la settimana
// appena simulata come corrente (stessa voce di matchHistory, simulated:true) e si legge il testo.
await page.evaluate((w) => { const C = window.__CPM_CAREER; C.patch({ week: w }); }, W); await sleep(300);
await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); window.__CPM_CAREER.goTab('dashboard'); } catch (e) {} }); await sleep(800);
const d = await page.evaluate(() => { const t = document.body.innerText; return { riga: (t.match(/(Vittoria|Pareggio|Sconfitta) \d+–\d+ vs [^\n]*/) || [])[0] || null, sim: /simulat/i.test(t) }; });
console.log(`  dashboard, settimana ${W} giocata: riga «${d.riga}» · «simulata» ${d.sim}`);
if (!d.riga) ko.push('riga del risultato non trovata nella dashboard');
if (d.sim) ko.push(`«simulata» nella riga della dashboard: ${d.riga}`);
if (r.simulataInPagina || r.visti.length) ko.push(`«simulata» nel testo della carriera: ${r.riga || ''} ${r.visti.join(' | ')}`);
if (errs.length) ko.push('pageerror ' + errs[0]);
await ctx.close(); await b.close(); srv.close();
console.log(`simulata-272 · ${ROSSO ? 'ROSSO __CPM_NO_SIM272' : 'verde'}`);
if (ko.length) { ko.forEach(k => console.log('  ✗ ' + k)); console.log('❌ ROSSO'); process.exit(1); }
console.log('✅ VERDE — dopo una settimana simulata nessun «(simulata)» nel testo della carriera'); process.exit(0);
