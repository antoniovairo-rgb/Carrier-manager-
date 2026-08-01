#!/usr/bin/env node
/* [7.269.0 P1 — MINI-SERIE A PUNTATE] GUARDIANO del nuovo motore narrativo seriale.
   Il difetto che chiude: la settimana aveva 25 produttori di contenuto ma tutti ONE-SHOT — nessuna
   attesa fra una settimana e l'altra, quindi la stagione restava un elenco di momenti.
   Asserzioni: (1) la serie PARTE dai fatti veri (espulsione in storico → caso disciplinare); (2) le
   puntate AVANZANO e si distanziano di almeno due settimane; (3) le scelte SI COMPONGONO — due percorsi
   opposti sulla stessa serie danno finali diversi; (4) la serie si CHIUDE (serialDone) e non riparte nella
   stessa stagione; (5) niente archi appesi: a W36+ va all'epilogo; (6) mai due serie in parallelo;
   (7) i campi sono LAZY (un save senza `serial` non si rompe) e la serie decade al cambio maglia.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node serial-arc-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const club = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 66, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const lg = (w, o = {}) => ({ week: w, opponent: 'FC Rivale', goals: 0, assists: 0, rating: 6.6, won: false, ...o });
const mk = (x = {}) => ({ phase: 'career', player: {
  name: 'Serial Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 10, age: 25, ovr: 70,/* <72 → la serie del giovane non è candidata: lo scenario isola il caso disciplinare */
  tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, drawSeen: 4, coachPactSeason: 4,
  seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare', coachTrust: 70, teamChemistry: 60,
  club, stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
  form: 74, morale: 72, fatigue: 30, popularity: 45, bankBalance: 400000, contract: { duration: 3, wage: 9000, expiresAtSeason: 8 },
  ...x } });

const boot = async (save) => {
  const pg = await browser.newPage({ viewport: { width: 480, height: 1400 } });
  await installCdnRoutes(pg);
  pg.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await pg.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, save);
  await pg.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await pg.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1000);
  try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await pg.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(1100);
  return pg;
};
const getP = (pg) => pg.evaluate(() => JSON.parse(localStorage.getItem('cpm-v3')).player);
const txt = (pg) => pg.evaluate(() => document.body.innerText);
const cardTitle = (pg) => pg.evaluate(() => {
  const cards = [...document.querySelectorAll('div')].filter(d => /PUNTATA \d+ DI \d+/.test(d.textContent || '') && d.querySelectorAll('button').length > 0);
  const card = cards[cards.length - 1]; if (!card) return '';
  const t = [...card.querySelectorAll('div')].find(d => (d.style.fontSize === '13px' || d.style.fontWeight === '900') && (d.textContent || '').length > 6 && !/PUNTATA/.test(d.textContent));
  return (t && t.textContent.trim()) || '';
});
const clickN = async (pg, n) => pg.evaluate((i) => {
  const cards = [...document.querySelectorAll('div')].filter(d => /PUNTATA \d+ DI \d+/.test(d.textContent || '') && d.querySelectorAll('button').length > 0);
  const card = cards[cards.length - 1]; if (!card) return false;
  const bs = [...card.querySelectorAll('button')].filter(b => b.offsetParent !== null);
  if (!bs[i]) return false; bs[i].click(); return true;
}, n);

const RED = [lg(6), lg(7, { redCard: true }), lg(8), lg(9)];

// ───── (1) la serie parte dai FATTI (espulsione reale) ─────
{
  const pg = await boot(mk({ matchHistory: RED }));
  const t = await txt(pg);
  const started = /PUNTATA 1 DI/.test(t) && /caso disciplinare/i.test(t);
  console.log('(1) serie avviata dall\'espulsione reale:', started);
  if (!started) issues.push('nessuna serie avviata con un\'espulsione in storico');
  // (2) avanzamento + distanza minima fra puntate
  if (!(await clickN(pg, 0))) issues.push('scelta della puntata 1 non cliccabile');
  await sleep(900);
  let p = await getP(pg);
  const ok1 = p.serial && p.serial.k === 'disciplina' && p.serial.ep === 1 && (p.serial.ch || []).length === 1;
  console.log('(2) stato dopo la scelta:', JSON.stringify(p.serial));
  if (!ok1) issues.push('la puntata non è avanzata correttamente: ' + JSON.stringify(p.serial));
  const t2 = await txt(pg);
  if (/PUNTATA 2 DI/.test(t2)) issues.push('la puntata successiva esce nella STESSA settimana: manca l\'attesa fra un episodio e l\'altro');
  else console.log('(2) attesa fra le puntate rispettata: la 2ª non esce subito');
  await pg.close();
}

// ───── (3) le scelte SI COMPONGONO: due percorsi opposti → finali diversi ─────
const finale = async (path) => {
  let ch = [], ep = 0, out = '';
  for (let step = 0; step < 3; step++) {
    const pg = await boot(mk({ week: 10 + step * 3, matchHistory: RED, serial: step === 0 ? undefined : { k: 'disciplina', ep, s: 4, w: 6 + step * 3, ch, club: 'b04' }, serialDone: {} }));
    const body = await txt(pg);
    if (!/PUNTATA/.test(body)) { out = '(nessuna puntata)'; await pg.close(); break; }
    out = await cardTitle(pg);
    const idx = Math.min(path[step] || 0, 2);
    if (!(await clickN(pg, idx))) { issues.push('scelta non cliccabile allo step ' + step); await pg.close(); break; }
    await sleep(800);
    const p = await getP(pg);
    ch = (p.serial && p.serial.ch) || [...ch, 'fine']; ep = (p.serial && p.serial.ep) || ep + 1;
    if (!p.serial) { await pg.close(); break; }
    await pg.close();
  }
  return { out, ch };
};
{
  const a = await finale([0, 0, 0]);   // scuse → doppie sedute → …
  const b = await finale([1, 1, 0]);   // silenzio → profilo basso → …
  console.log('(3) percorso A:', a.ch.join('>'), '→', a.out);
  console.log('(3) percorso B:', b.ch.join('>'), '→', b.out);
  if (a.out === b.out) issues.push('due percorsi opposti danno lo STESSO finale: le scelte non si compongono');
}

// ───── (4)+(6) chiusura + niente seconda serie nella stessa stagione ─────
{
  const pg = await boot(mk({ week: 22, matchHistory: RED, serial: { k: 'disciplina', ep: 2, s: 4, w: 18, ch: ['scuse', 'campo'], club: 'b04' } }));
  const t = await txt(pg);
  if (!/PUNTATA 3 DI 3/.test(t)) issues.push('l\'ultima puntata non compare');
  if (!(await clickN(pg, 0))) issues.push('scelta finale non cliccabile');
  await sleep(900);
  const p = await getP(pg);
  const chiusa = !p.serial && p.serialDone && p.serialDone.disciplina === 4 && p.serialSeenSeason === 4;
  console.log('(4) serie chiusa:', chiusa, JSON.stringify({ done: p.serialDone, seen: p.serialSeenSeason }));
  if (!chiusa) issues.push('la serie non si è chiusa correttamente');
  const t2 = await txt(pg);
  if (/PUNTATA 1 DI/.test(t2)) issues.push('una NUOVA serie parte subito dopo la chiusura: due archi nella stessa stagione');
  else console.log('(6) nessuna seconda serie nella stessa stagione');
  if (!(p.diary || []).some(d => d.type === 'story')) issues.push('la puntata non finisce nel diario (Film della stagione)');
  await pg.close();
}

// ───── (5) niente archi appesi: a W36 si va all'epilogo ─────
{
  const pg = await boot(mk({ week: 37, matchHistory: RED, serial: { k: 'disciplina', ep: 0, s: 4, w: 12, ch: ['scuse'], club: 'b04' } }));
  const t = await txt(pg);
  const epi = /PUNTATA 3 DI 3/.test(t);
  console.log('(5) epilogo forzato a fine stagione:', epi);
  if (!epi) issues.push('a fine stagione la serie resta appesa invece di andare all\'epilogo');
  await pg.close();
}

// ───── (7) campi lazy + decadenza al cambio maglia ─────
{
  const pg = await boot(mk({ week: 12, matchHistory: [lg(6), lg(7)] }));   // nessun fatto → nessuna serie, nessun crash
  const p = await getP(pg);
  console.log('(7) save senza fatti: serial =', JSON.stringify(p.serial || null));
  await pg.close();
  const pg2 = await boot(mk({ week: 14, matchHistory: RED, serial: { k: 'disciplina', ep: 1, s: 4, w: 10, ch: ['scuse'], club: 'ALTRO' } }));
  const t2 = await txt(pg2);
  if (/PUNTATA 2 DI/.test(t2)) issues.push('la serie sopravvive al cambio maglia: doveva decadere');
  else console.log('(7) la serie decade al cambio maglia: sì');
  await pg2.close();
}

// ───── (8) copertura: ognuna delle tre serie deve poter partire dal proprio innesco ─────
{
  const casi = [
    ['disciplina', 'caso disciplinare', { week: 10, ovr: 70, matchHistory: RED }],
    /* [7.273.0] il mentore ha un'età: 25 anni, 3ª stagione, OVR 74+, 100 presenze — a 18 anni no */
    ['giovane', 'ragazzo della Primavera', { week: 10, ovr: 78, age: 27, season: 5, totalMatches: 160,
      jerseyNumSeason: 5, presidentModalSeason: 5, drawSeen: 5, coachPactSeason: 5, seasonPledge: { season: 5, tone: 'equilibrato' },
      serialDone: {}, matchHistory: [lg(6), lg(7)],
      teammates: [{ name: 'Luca Ferrante', archetype: 'giovane', icon: '🌱', bond: 40 }] }],
    ['bomber', 'capocannoniere', { week: 22, ovr: 70,
      matchHistory: Array.from({ length: 10 }, (_, i) => lg(6 + i, { goals: 1 })) }],
  ];
  for (const [k, lab, extra] of casi) {
    const pg = await boot(mk(extra));
    const t = await txt(pg);
    const ok = /PUNTATA 1 DI/.test(t) && new RegExp(lab, 'i').test(t);
    console.log(`(8) serie «${k}» innescabile:`, ok);
    if (!ok) issues.push(`la serie «${k}» non parte dal suo innesco`);
    await pg.close();
  }
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ SERIE A PUNTATE OK (avvio dai fatti · attesa fra puntate · scelte che si compongono · chiusura senza archi appesi)');
