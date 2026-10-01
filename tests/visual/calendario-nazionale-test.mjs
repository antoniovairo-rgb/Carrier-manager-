#!/usr/bin/env node
/* [7.999.35 guardiano — collaudo PO «calendario sbagliato»: settimana 28, girone dell'Europeo in corso, la home mostrava «Premier
   Division · PROSSIMA PARTITA · FC Merseyside vs Belgio · 1ª in classifica»; era l'amichevole della convocazione, programmata nella
   settimana di una partita dell'Europeo e presentata come gara di campionato.
   A) Europeo nella fase a gironi, amichevole non giocata in settimana 28: al caricamento la bonifica la toglie dal calendario e la card
      di campionato non mostra la Nazionale avversaria.
   B) nessun torneo, amichevole in questa settimana: la card dice «Amichevole Internazionale», mette in campo le due Nazionali
      (non il club) e nessuna posizione in classifica.
   Rosso: CPM_RED=1 accende __CPM_NO_CAL35 e il guardiano deve fallire. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const base = (w, extra) => ({ phase: 'career', player: Object.assign({ name: 'Probe Calendario', nation: 'Spagna', avatarId: 0, proStatus: 'pro', season: 12, week: w, age: 27, ovr: 90,
  campDone: true, presidentModalSeason: 12, jerseyNumSeason: 12, drawSeen: 12, mercatoSeen: 12, presentSeason: 12, tutorialDone: true, weekLived: false, seasonPledge: { season: 12, tone: 'equilibrato' },
  club: { id: 'mer', n: 'FC Merseyside', a: 'MER', p: 88, c: '#C8102E', c2: '#ffffff', nat: '🏴', lg: 'Premier Division' },
  stats: { 'velocità': 90, tecnica: 90, fisico: 90, 'mentalità': 90, tiro: 90, passaggio: 90, dribbling: 90, posizionamento: 90 },
  form: 90, morale: 90, fatigue: 20, popularity: 80, value: 80, bankBalance: 900000, goals: 20, assists: 8, matches: 24, nationalCaps: 20, contract: { duration: 3, wage: 90000, expiresAtSeason: 14 } }, extra || {}) });
async function apriCon(sv, rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(c => { window.__CPM_GLB = false; if (c.red) window.__CPM_NO_CAL35 = true; localStorage.setItem('cpm-v3', JSON.stringify(c.sv)); }, { red: rosso, sv });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }).catch(() => errs.push('pagina vuota'));
  await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {} await sleep(3000);
  return { page, errs };
}
/* il calendario vero lo genera il gioco al primo caricamento; poi, in una pagina NUOVA (una seconda navigazione nella stessa pagina
   resta vuota nel browser di prova), si carica il salvataggio con l'amichevole inserita */
async function carica(save, rosso, w) {
  const p1 = await apriCon(save, rosso); await sleep(1500);
  const sv = await p1.page.evaluate(() => JSON.parse(localStorage.getItem('cpm-v3') || '{}')); await p1.page.close();
  const pl = sv.player || sv; pl.week = w; pl.calendar = (pl.calendar || []).filter(m => m.week !== w);
  pl.calendar.push({ matchday: 1470 + w, week: w, opponentId: 'nt-bel', opponentName: 'Belgio', isHome: true, played: false, result: null, type: 'national', competition: 'Amichevole Internazionale' });
  const { page, errs } = await apriCon(sv, rosso); errs.push(...p1.errs); await sleep(1500);
  const R = await page.evaluate(() => {
    const sv = JSON.parse(localStorage.getItem('cpm-v3') || '{}'); const p = sv.player || sv; const cal = p.calendar || [];
    const lab = Array.from(document.querySelectorAll('div')).find(e => e.childElementCount === 0 && /^prossima partita$/i.test((e.textContent || '').trim()));
    let card = lab; for (let i = 0; i < 6 && card; i++) { card = card.parentElement; if (card && /VS/.test(card.innerText) && (/W\.\d/.test(card.innerText) || card.innerText.length < 300)) break; }/* [7.999.97 PO-178] la card non porta piu' «W.n»: senza il tetto di lunghezza la risalita arrivava alla pagina intera, intestazione col club compresa */
    return { amichevoli: cal.filter(m => m.type === 'national' && !m.played).map(m => m.opponentName + ' W' + m.week), card: card ? card.innerText.replace(/\s+/g, ' ').slice(0, 400) : null, week: p.week };
  });
  await page.screenshot({ path: '/tmp/cal35-' + (rosso ? 'r' : 'v') + '-' + w + '.png' });
  await page.close(); return { R, errs };
}
const EM = { euroMondiale: { active: true, type: 'Europeo', season: 12, phase: 'group', host: 'Germania', groupOpponents: ['Francia', 'Belgio', 'Olanda'], groupResults: [{ opp: 'Olanda', won: true, gf: 2, ga: 0 }], groupPts: 3, pts: 3, qualDone: true, qualQualified: true } };
const A = await carica(base(28, EM), RED, 28);
const B = await carica(base(20), RED, 20);
await b.close(); srv.close();
console.log('A (Europeo in corso):', JSON.stringify(A.R)); console.log('B (nessun torneo):', JSON.stringify(B.R));
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
ok(!A.errs.length && !B.errs.length, 'nessun errore di pagina ' + A.errs.concat(B.errs).join(' · '));
ok(A.R.amichevoli.length === 0, `A: nessuna amichevole nella fase finale dell'Europeo (${A.R.amichevoli.join(', ') || 'nessuna'})`);
ok(!(A.R.card && /Belgio/.test(A.R.card) && /Premier Division/.test(A.R.card)), `A: la card di campionato non mostra la Nazionale avversaria`);
ok(!!B.R.card && /Amichevole Internazionale/.test(B.R.card), `B: la card dice «Amichevole Internazionale»`);
ok(!!B.R.card && /Spagna/.test(B.R.card) && /Belgio/.test(B.R.card) && !/FC Merseyside/.test(B.R.card), `B: in campo le due Nazionali, non il club`);
ok(!!B.R.card && !/in classifica/.test(B.R.card), `B: nessuna posizione in classifica su un'amichevole`);
if (err.length) { console.log('\nCALENDARIO NAZIONALE: FALLITO (' + err.length + ')' + (RED ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nCALENDARIO NAZIONALE: PASS'); process.exit(0);
