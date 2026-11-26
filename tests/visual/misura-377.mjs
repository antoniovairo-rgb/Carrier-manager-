#!/usr/bin/env node
/* [giro 377 · PO-646] SONDA: QUANTO ESCONO GLI IMPULSI E COSA SUCCEDE DOPO LA SCELTA.
 * Fa girare N carriere vere (handler __CPM_CAREER: liveCurrentWeek → simulateAndAdvance/doAdvanceWeek → rollover), con
 * nomi diversi (= semi diversi), e a ogni settimana vissuta sceglie la prima opzione dell'impulso uscito (scegli(0), lo stesso
 * gestore del bottone). Conta quante volte esce ciascun impulso (contatore a vita `impulseSeen` + registro per settimana) e,
 * per gli impulsi che PROMETTONO un club (tabella ATTESE377), se il club si e' fatto vivo davvero (testimone __CPM_ATT377,
 * scritto in entrambi i bracci quando c'e'; senza il testimone la promessa risulta «mai mantenuta» per costruzione).
 * Uso: CPM_CHROME=/opt/pw-browsers/chromium node misura-377.mjs   (CPM_CARRIERE=4 CPM_STAGIONI=3 CPM_ROSSO=1 CPM_JSON=1)
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const N = +(process.env.CPM_CARRIERE || 4), STAG = +(process.env.CPM_STAGIONI || 3), ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const NOMI = ['Marco Lenti', 'Luca Ferrandi', 'Ivo Sarti', 'Dario Penna', 'Ugo Valli', 'Remo Casti', 'Elio Bassi', 'Nino Rota'];
const tot = {}, eventi = [], promesse = []; const errori = [];

for (let k = 0; k < N; k++) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ nome, rosso, k }) => {
    window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G377 = true;
    const save = { phase: 'career', player: { name: nome, nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 20 + k, ovr: 66 + k * 2, tutorialDone: true,
      club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' }, hasAgent: true,
      stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
      form: 70, morale: 72, fatigue: 10, popularity: 40, bankBalance: 90000, history: [{ clubId: 'zz1', season: 1 }],
      contract: { duration: 4, wage: 6000, expiresAtSeason: 9 } } };
    localStorage.setItem('cpm-v3', JSON.stringify(save));
  }, { nome: NOMI[k % NOMI.length], rosso: ROSSO, k });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(1000);
  let stag = 0, iter = 0, prevSum = 0;
  while (iter++ < 160 * STAG && stag < STAG) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); return { res, st: C.get() }; });
    if (r.res === 'lived') {
      await sleep(120);
      const ev = await page.evaluate(() => { const C = window.__CPM_CAREER; const p = C.snapshot();
        const seen = p.impulseSeen || {}; const sum = Object.values(seen).reduce((a, b) => a + b, 0);
        const last = (p.recentImpulses || []).slice(-1)[0] || null;
        const md = (p.calendar || []).find(m => m && m.week === (p.week || 1) && !m.played) || null;
        const ch = C.scegli(0); C.dismiss();
        return { sum, last, s: p.season, w: p.week, pro: p.proStatus, role: p.squadRole || null, md: md ? { opp: md.opponentId, home: md.isHome } : null,
          exClubs: (p.history || []).map(h => h && h.clubId).filter(Boolean), jersey: p.jerseyNum || null, ch };
      });
      if (ev.sum > prevSum && ev.last) { tot[ev.last] = (tot[ev.last] || 0) + 1; eventi.push({ k, id: ev.last, s: ev.s, w: ev.w, pro: ev.pro, role: ev.role, md: ev.md, ex: ev.exClubs, jersey: ev.jersey }); }
      prevSum = ev.sum;
    } else if (r.res === 'seasonEnd') {
      await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); stag++; await sleep(900);
      await page.evaluate(() => window.__CPM_CAREER.dismiss());
    } else if (r.res && r.res.startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); }
    else { await page.evaluate(() => window.__CPM_CAREER.dismiss()); }
    await sleep(60);
  }
  const fine = await page.evaluate(() => ({ att: window.__CPM_ATT377 || null, mem: (window.__CPM_CAREER.snapshot().impMem) || {}, s: window.__CPM_CAREER.get().season }));
  promesse.push({ k, att: fine.att, mem: Object.fromEntries(Object.entries(fine.mem).filter(([id]) => /procuratore$|dirigente_idolo|prestito_inverno/.test(id))) });
  console.log(`carriera ${k} (${NOMI[k % NOMI.length]}): fino a S${fine.s}, impulsi ${eventi.filter(e => e.k === k).length}`);
  await ctx.close();
}
await browser.close(); srv.close();

const SOTTO = ['wi_procuratore', 'wi_dirigente_idolo', 'wi_prestito_inverno', 'wi_maglia_dieci', 'wi_ex_compagno_cena', 'wi_amichevole', 'wi_nazionale_b', 'wi_sponsor', 'wi_addio_cambio'];
const nEv = eventi.length;
console.log(`\nimpulsi usciti: ${nEv} su ${N} carriere x ${STAG} stagioni · voci distinte ${Object.keys(tot).length}`);
for (const id of SOTTO) {
  const ev = eventi.filter(e => e.id === id);
  const fuori = ev.filter(e => (id === 'wi_ex_compagno_cena' && !(e.md && e.ex.includes(e.md.opp))) || (id === 'wi_nazionale_b' && e.md)
    || (id === 'wi_maglia_dieci' && e.jersey === 10) || ((id === 'wi_procuratore' || id === 'wi_dirigente_idolo') && !((e.w >= 1 && e.w <= 3) || (e.w >= 13 && e.w <= 21) || e.w >= 33))
    || (id === 'wi_prestito_inverno' && !(e.w >= 13 && e.w <= 21)));
  console.log(`  ${id.padEnd(22)} uscito ${String(ev.length).padStart(3)} (${(100 * ev.length / Math.max(1, nEv)).toFixed(1)}%) · in condizione irrealistica ${fuori.length}` + (ev.length ? ` · settimane ${ev.map(e => 'S' + e.s + 'W' + e.w).join(' ')}` : ''));
}
const att = promesse.flatMap(p => (p.att && p.att.log) || []);
console.log(`\npromesse di un club (scelta «aspetto/ascolto/vado»): ${att.filter(a => a.ev === 'scelta').length || '— (nessun testimone: nessun fatto collegato)'} · arrivate ${att.filter(a => a.ev === 'arrivo').length} · sfumate ${att.filter(a => a.ev === 'sfumata').length}`);
for (const a of att) console.log('   ', JSON.stringify(a));
if (process.env.CPM_JSON === '1') console.log(JSON.stringify({ tot, eventi, promesse }, null, 1));
console.log(errori.length ? `pageerror: ${errori.length} → ${errori.slice(0, 3).join(' | ')}` : 'pageerror: 0');
