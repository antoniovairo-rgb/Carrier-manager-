#!/usr/bin/env node
/* [7.292.0 direttiva PO «la presentazione della squadra la cambierei, non mi piace che è alla prima giornata
   del campionato ma organizzerei un evento allo stadio (anche primavera) prima dell'avvio del campionato»]
   GUARDIANO DELLA SERATA DI PRESENTAZIONE. Dal 7.13.0 la presentazione era un overlay sul walkout della prima
   gara casalinga: nasceva quindi DENTRO una giornata di campionato. Ora è un evento a sé, allo stadio, nella
   settimana d'apertura. Si verifica:
     (1) alla W1 il wizard d'apertura propone il passo «Presentazione della squadra»;
     (2) l'evento si apre, mostra lo stadio in 3D e chiama i giocatori uno alla volta, chiudendo sull'eroe;
     (3) alla fine lascia il segno (campo di stagione, diario, notizia) e non si ripropone;
     (4) vale anche in PRIMAVERA (era riservata ai pro dalla seconda stagione);
     (5) la prima gara casalinga NON ha più i beat della presentazione addosso.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node presentazione-stadio-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

const PRO = { id: 'tor', n: 'FC Granata', a: 'GRA', p: 70, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' };
const U18 = { id: 'tor-u18', n: 'FC Granata U18', a: 'GRA', p: 60, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Primavera 1', isU18: true };

const save = (club, pro, extra) => ({ phase: 'career', player: {
  name: 'Presenta Probe', nation: 'Italia', avatarId: 0, proStatus: pro ? 'pro' : 'u18', season: pro ? 4 : 1, week: 1, age: pro ? 24 : 17, ovr: pro ? 80 : 62,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: pro ? 4 : 1, presidentModalSeason: pro ? 4 : 1,
  drawSeen: pro ? 4 : 1, mercatoSeen: pro ? 4 : 1, coachPactSeason: pro ? 4 : 1, presentedClub: club.id,
  seasonPledge: { season: pro ? 4 : 1, tone: 'equilibrato' }, squadRole: 'titolare', club,
  stats: { 'velocità': 78, tecnica: 78, fisico: 76, 'mentalità': 76, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
  form: 80, morale: 72, fatigue: 25, coachTrust: 70, teamChemistry: 60, popularity: 45, bankBalance: 1e6,
  goals: 0, assists: 0, matches: 0, totalMatches: pro ? 90 : 0, totalGoals: pro ? 40 : 0, matchHistory: [],
  contract: { duration: 3, wage: 400000, expiresAtSeason: 8 }, ...extra } });

const boot = async (s, tag) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1400 } });
  page.on('pageerror', e => issues.push(`pageerror(${tag}): ` + String(e.message).slice(0, 130)));
  await installCdnRoutes(page);
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, s);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(900);
  return page;
};
const testo = (p) => p.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '));

// ── (1)(2)(3) il percorso completo da professionista
{
  const page = await boot(save(PRO, true, { presentSeason: 0 }), 'pro');
  const pend = await page.evaluate(() => window.__CPM_CAREER.openingPending());
  console.log(`(1) interazioni d'apertura alla W1: ${JSON.stringify(pend)}`);
  if (!Array.isArray(pend) || pend.indexOf('presentazione') < 0) issues.push('(1) la presentazione non è fra le interazioni d\'apertura');

  // il wizard si apre col tasto della settimana
  try { await page.getByRole('button', { name: /Vivi la Settimana|Avanza|Gioca/i }).first().click({ timeout: 5000 }); } catch (e) {}
  await sleep(900);
  let t = await testo(page);
  if (!/Presentazione della squadra/i.test(t)) {
    // il passo può non essere il primo: si avanza fino a trovarlo
    for (let i = 0; i < 6 && !/Presentazione della squadra/i.test(t); i++) {
      try { await page.getByRole('button', { name: /Vai allo stadio|Salta|Tieni #|Continua/i }).first().click({ timeout: 2500 }); } catch (e) { break; }
      await sleep(700); t = await testo(page);
    }
  }
  const wiz = /Presentazione della squadra/i.test(t);
  console.log(`(1b) passo del wizard visibile: ${wiz}`);
  if (!wiz) issues.push('(1b) il wizard non mostra il passo della presentazione');

  if (wiz) {
    try { await page.getByRole('button', { name: /Vai allo stadio/i }).first().click({ timeout: 5000 }); } catch (e) { issues.push('(2) «Vai allo stadio» non cliccabile'); }
    await sleep(1800);
    const ev = await page.evaluate(() => ({
      txt: (document.body.innerText || '').replace(/\s+/g, ' '),
      canvas: document.querySelectorAll('canvas').length,
    }));
    const inScena = /SERATA DI PRESENTAZIONE/i.test(ev.txt);
    console.log(`(2) evento aperto: ${inScena} · canvas 3D presenti: ${ev.canvas}`);
    if (!inScena) issues.push('(2) l\'evento della presentazione non si apre');
    if (ev.canvas < 1) issues.push('(2) nessuna scena 3D: lo stadio non viene disegnato');

    // si scorrono i beat fino all'ultimo (chiude sull'eroe)
    let beats = 0, heroSeen = false;
    for (let i = 0; i < 12; i++) {
      const cur = await testo(page);
      if (/PRESENTA PROBE/i.test(cur)) heroSeen = true;
      const last = /Che la stagione cominci/i.test(cur);
      try { await page.getByRole('button', { name: last ? /Che la stagione cominci/i : /^Avanti/i }).first().click({ timeout: 3000 }); } catch (e) { break; }
      beats++; await sleep(700);
      if (last) break;
    }
    console.log(`(2b) beat percorsi: ${beats} · l'eroe viene chiamato per ultimo: ${heroSeen}`);
    if (beats < 4) issues.push(`(2b) solo ${beats} beat: lo speaker non presenta la squadra`);
    if (!heroSeen) issues.push('(2b) il protagonista non viene mai annunciato');

    await sleep(1200);
    const dopo = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')).player;
      return { ps: s.presentSeason, diario: (s.diary || []).slice(-1)[0] || null, log: (s.log || [])[0] || '',
        // ⚠️ la chiusura si misura sulla SCENA (canvas) e sull'etichetta MAIUSCOLA dell'overlay: una regex
        // case-insensitive su «serata di presentazione» becca anche la voce di DIARIO appena scritta —
        // falso positivo mio, non un difetto del gioco.
        canvas: document.querySelectorAll('canvas').length,
        txt: (document.body.innerText || '') }; });
    console.log(`(3) chiusura — presentSeason=${dopo.ps} · diario «${(dopo.diario || {}).headline || '—'}» · notizia «${String(dopo.log).slice(0, 52)}»`);
    if (dopo.ps !== 4) issues.push(`(3) presentSeason non scritto (${dopo.ps})`);
    if (!dopo.diario || !/presentazione/i.test(dopo.diario.headline || '')) issues.push('(3) nessuna voce di diario della serata');
    if (dopo.canvas > 0 || dopo.txt.indexOf('SERATA DI PRESENTAZIONE') >= 0) issues.push(`(3) l'evento resta a schermo dopo la chiusura (canvas ${dopo.canvas})`);
    const pend2 = await page.evaluate(() => window.__CPM_CAREER.openingPending());
    if (Array.isArray(pend2) && pend2.indexOf('presentazione') >= 0) issues.push('(3) la presentazione resta pendente dopo averla vissuta');
  }
  await page.close();
}

// ── (4) anche in Primavera
{
  const page = await boot(save(U18, false, { presentSeason: 0 }), 'u18');
  const pend = await page.evaluate(() => window.__CPM_CAREER.openingPending());
  console.log(`\n(4) Primavera — interazioni d'apertura: ${JSON.stringify(pend)}`);
  if (!Array.isArray(pend) || pend.indexOf('presentazione') < 0) issues.push('(4) in Primavera la presentazione non viene proposta');
  await page.close();
}

// ── (5) la prima gara casalinga non porta più i beat della presentazione
{
  const src = await (await import('node:fs/promises')).readFile(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8');
  const off = /const _presNight=false;/.test(src);
  const legacy = /_presNight=context==="career"/.test(src);
  console.log(`(5) aggancio alla prima giornata: ${off && !legacy ? 'rimosso' : 'ANCORA PRESENTE'}`);
  if (!off || legacy) issues.push('(5) la presentazione è ancora agganciata alla prima gara casalinga');
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — la squadra si presenta allo stadio prima del campionato, Primavera compresa');
