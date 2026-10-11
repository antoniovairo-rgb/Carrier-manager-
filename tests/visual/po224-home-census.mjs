#!/usr/bin/env node
/* [PO-224] CENSIMENTO dei riquadri della home (sola misura, nessuna modifica al gioco).
 * Avanza una stagione intera settimana per settimana con gli handler VERI (__CPM_CAREER.step,
 * come career-sim-test.mjs). Ad ogni settimana, PRIMA di chiudere la finestra della settimana,
 * fotografa la dashboard a 375 px e registra per ogni riquadro/finestra:
 *   - titolo (testo in maiuscolo o titolo noto), posizione verticale in px (documento),
 *   - sopra o sotto la piega (915 px di viewport),
 *   - se e' una FINESTRA modale (weekLiveModal ecc.) o un RIQUADRO in home,
 *   - se contiene pulsanti (= chiede una scelta al giocatore; approssimazione dichiarata).
 * Uso: CPM_CHROME=/opt/pw-browsers/chromium node po224-home-census.mjs
 *      CPM_PRO=1 per la carriera pro (default: U18 come l'avvio di gioco).
 * Output: docs/sviluppo/foto/po224/censimento.json + screenshot delle prime settimane. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const out = path.join(ROOT, 'docs', 'sviluppo', 'foto', 'po224'); fs.mkdirSync(out, { recursive: true });
const PRO = process.env.CPM_PRO === '1';
const W = 375, H = 915, MAX_ITER = 700;
const TITOLI_NOTI = ['La tua storia', 'Il progetto del club', 'Sponsor', 'Vita privata', 'Il tuo procuratore', 'Non mi era mai successo', 'Il mondo fuori', 'La tua settimana', 'Duello capocannoniere', 'Obiettivi della stagione', 'Notizie della settimana', 'Voci di mercato', 'Classifica', 'Ultime notizie', 'Impulso della settimana', 'Impulso settimana', 'Riabilitazione', 'Questa settimana', 'Intervista', 'Spogliatoio', 'Offerta', 'Risposta', 'Storia'];
const server = await startServer(); const port = server.address().port; const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const errori = []; page.on('pageerror', e => errori.push(String(e).slice(0, 160)));
await page.addInitScript((pro) => { window.__CPM_CAMT767ON = true;
  const save = { phase: 'career', player: { name: 'Samuel Francisco', nation: 'Spagna', avatarId: 3, proStatus: pro ? 'pro' : 'u18', season: 1, week: 1, age: 17, ovr: 66, jerseyNum: 77, tutorialDone: true,
    club: pro ? { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' } : { id: 'cio', n: 'FC Ciociaro Primavera', a: 'CIO', p: 60, c: '#f59e0b', c2: '#1d4ed8', nat: '🇮🇹', lg: 'Primavera 2' },
    teammates: [{ name: 'Rocco Landi', archetype: 'mentor', icon: '🧠' }],
    stats: { 'velocità': 66, tecnica: 66, fisico: 66, 'mentalità': 66, tiro: 66, passaggio: 66, dribbling: 66, posizionamento: 66 },
    form: 70, morale: 73, fatigue: 0, popularity: 20, value: 1, bankBalance: 1000, contract: { duration: 3, wage: 1000, expiresAtSeason: 4 } } };
  try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (_e) {} }, PRO);
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }).catch(() => {});
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.goTab), { timeout: 25000 }).catch(() => {});
await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')).catch(() => {}); await sleep(1000);

// Misura la dashboard: riquadri noti + etichette in maiuscolo, con posizione e pulsanti.
const misura = () => page.evaluate((noti) => {
  const root = document.querySelector('#root') || document.body;
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const top = (el) => Math.round(el.getBoundingClientRect().top + window.scrollY);
  const voci = []; const visti = new Set();
  const modale = !!document.querySelector('[role="dialog"]') || [...root.querySelectorAll('div')].some(d => { const s = getComputedStyle(d); return s.position === 'fixed' && parseInt(s.zIndex || '0', 10) >= 50 && d.getBoundingClientRect().height > 200 && vis(d); });
  const cerca = (testo, el) => {
    // risale al contenitore-riquadro: il primo antenato con bordo o sfondo, al massimo 6 livelli
    let c = el; for (let i = 0; i < 6 && c.parentElement && c.parentElement !== root; i++) { const p = c.parentElement; if (p.getBoundingClientRect().height > 600) break; const s = getComputedStyle(p); if ((s.borderStyle !== 'none' && s.borderStyle !== '') || (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)')) { c = p; break; } c = p; }
    if (c.getBoundingClientRect().height > 600) c = el;
    const fixed = (() => { let x = c; while (x && x !== document.body) { if (getComputedStyle(x).position === 'fixed') return true; x = x.parentElement; } return false; })();
    return { titolo: testo.slice(0, 60), top: top(c), altezza: Math.round(c.getBoundingClientRect().height), finestra: fixed, bottoni: c.querySelectorAll('button').length, dentro915: top(c) + Math.round(c.getBoundingClientRect().height) <= window.innerHeight };
  };
  const tutti = [...root.querySelectorAll('div,span,p,h1,h2,h3,div')];
  const best = {};
  for (const el of tutti) {
    if (el.childElementCount > 2 || !vis(el)) continue;
    const t = (el.innerText || '').trim(); if (!t || t.length > 70) continue;
    const trova = noti.find(n => t.toLowerCase().startsWith(n.toLowerCase()));
    if (!trova) continue;
    if (!best[trova] || t.length < best[trova].len) best[trova] = { el, len: t.length };
  }
  for (const k of Object.keys(best)) voci.push(cerca(k, best[k].el));
  const testi = [];
  for (const el of root.querySelectorAll('*')) {
    if (el.childElementCount > 0 || !vis(el)) continue;
    const t = (el.innerText || '').trim(); if (t.length < 3 || t.length > 120) continue;
    testi.push({ t: t.replace(/\s+/g, ' ').slice(0, 120), top: top(el), dentro915: el.getBoundingClientRect().bottom <= window.innerHeight, bottone: !!el.closest('button') });
  }
  return { modale, testi, voci, scrollH: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth };
}, TITOLI_NOTI);

const R = { versione: PRO ? 'pro' : 'u18', settimane: [], errori };
const testiUnici = new Map();
let prev = null, iter = 0, fine = false, ripetuti = 0, ultimaSett = -1;
while (iter++ < MAX_ITER && !fine) {
  const r = await page.evaluate(() => { const C = window.__CPM_CAREER; if (!C) return null; const res = C.step(); return { res, st: C.get(), scr: C.screen() }; });
  // step() puo' aprire finestre: la prima misura e' CON finestra, la seconda a finestra chiusa (= home)
  if (!r) break;
  const { res, st, scr } = r;
  R.traccia = R.traccia || []; R.traccia.push([iter, res, st.season, st.week, !!st.lived]);
  if (res === 'seasonEnd') { fine = true; break; }
  if (res && res.startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
  if (res && res.startsWith('error:')) { R.errori.push(`step ${iter}: ${res}`); break; }
  // stallo: 'advanced' ripetuto sulla stessa settimana = la stagione non si chiude col solo passo del banco
  if (res === 'advanced' && st.week === ultimaSett && ++ripetuti >= 6) { R.stallo = `S${st.season}W${st.week}: step 'advanced' ripetuto ${ripetuti}x senza rollover`; break; }
  if (res !== 'advanced' || st.week !== ultimaSett) ripetuti = 0; ultimaSett = st.week;
  await sleep(120);
  // misura PRIMA di chiudere le finestre: qui si vede cio' che il giocatore ha davanti
  const mFin = await misura();
  const chiave = `S${st.season}W${st.week}`;
  await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(120);
  const mHome = await misura();
  // conteggio PER SETTIMANA: piu' passi e due ambiti nella stessa settimana contano una volta sola
  for (const [ambito, mis] of [['home', mHome], ['finestra', mFin]]) for (const x of mis.testi) { const k = x.t + ' [' + ambito + ']'; const e = testiUnici.get(k) || { testo: x.t, ambito, prima: chiave, settimane: 0, topMin: x.top, sopraPiegaSett: 0, bottone: false, _ult: null, _ultSopra: null }; if (e._ult !== chiave) { e.settimane++; e._ult = chiave; } if (x.dentro915 && e._ultSopra !== chiave) { e.sopraPiegaSett++; e._ultSopra = chiave; } e.topMin = Math.min(e.topMin, x.top); if (x.bottone) e.bottone = true; testiUnici.set(k, e); }
  if (!prev || prev !== chiave) {
    R.settimane.push({ sett: chiave, fase: res, screen: scr, conFinestra: { voci: mFin.voci, modale: mFin.modale }, home: { voci: mHome.voci, modale: mHome.modale } });
    if (R.settimane.length <= 3 || st.week === 19 || st.week === 36) await page.screenshot({ path: path.join(out, `home-${chiave}.png`) });
    prev = chiave;
  }
}
// Tabella riassuntiva: per titolo, in quante settimane compare e dove
const conta = {};
for (const s of R.settimane) for (const [ambito, mis] of [['home', s.home], ['finestra', s.conFinestra]]) for (const v of mis.voci) { const k = v.titolo + ' [' + ambito + ']'; conta[k] = conta[k] || { settimane: 0, finestra: v.finestra, sopra: 0, sotto: 0, conBottoni: 0, altezze: [], tops: [] }; const c = conta[k]; c.settimane++; if (v.bottoni > 0) c.conBottoni++; if (v.dentro915) c.sopra++; else c.sotto++; c.altezze.push(v.altezza); c.tops.push(v.top); }
R.riepilogo = Object.entries(conta).map(([titolo, c]) => ({ titolo, ...c, altezzaMed: Math.round(c.altezze.reduce((a, b) => a + b, 0) / c.altezze.length), topMed: Math.round(c.tops.reduce((a, b) => a + b, 0) / c.tops.length), altezze: undefined, tops: undefined }));
R.testi = [...testiUnici.values()].map(({ _ult, _ultSopra, ...e }) => e).sort((a, b) => b.settimane - a.settimane); R.settimaneViste = R.settimane.length; R.iterazioni = iter; R.stagioneChiusa = fine; delete R.traccia;
fs.writeFileSync(path.join(out, `censimento-${R.versione}.json`), JSON.stringify(R, null, 2));
console.log(`══ PO-224 censimento home (${R.versione}, ${W}px) · settimane misurate ${R.settimaneViste} · stagione chiusa ${fine} ══`);
for (const v of R.riepilogo.sort((a, b) => b.settimane - a.settimane)) console.log(`  ${v.titolo.padEnd(34)} sett=${String(v.settimane).padStart(2)} finestra=${v.finestra} bottoni=${v.conBottoni} sopraPiega=${v.sopra} sotto=${v.sotto} topMed=${v.topMed} altMed=${v.altezzaMed}`);
console.log(`  errori pagina: ${errori.length}${errori.length ? ' → ' + errori[0] : ''}`);
await browser.close(); server.close();
