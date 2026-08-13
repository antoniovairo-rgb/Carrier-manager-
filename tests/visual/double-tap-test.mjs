#!/usr/bin/env node
/* [P0 #4 — audit forense] UNA SOLA INTENZIONE DELL'UTENTE = UNA SOLA APPLICAZIONE.
 *
 * ROOT CAUSE: nessuna guardia di rientranza sugli handler che cambiano lo stato. Due tocchi ravvicinati
 * passavano entrambi prima che React richiudesse il modal. Misurato prima del fix: «Conferma
 * avanzamento» → due settimane in un colpo (economia doppia, partita della settimana auto-simulata
 * senza poterla giocare); scelta d'evento → effetti raddoppiati.
 *
 * Casi (piano di messa in sicurezza, FASE 4):
 *   1 click singolo → una applicazione (nessuna regressione)
 *   2 doppio click rapidissimo (stesso tick) → una sola applicazione
 *   3 click dopo il completamento → funziona ancora (nessun blocco permanente)
 *   4 evento scelto due volte → effetti applicati una volta sola
 *   5 il gioco resta usabile dopo l'operazione
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const guasti = [];

const mkSave = (extra = {}) => ({ phase: 'career', player: {
  name: 'Probe Tap', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, age: 25, ovr: 80,
  campDone: true, presidentModalSeason: 4, jerseyNumSeason: 4, drawSeen: 4, mercatoSeen: 4, presentSeason: 4,
  tutorialDone: true, weekLived: true, seasonPledge: { season: 4, tone: 'equilibrato' },
  club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 88, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 80, tecnica: 80, fisico: 80, 'mentalità': 80, tiro: 80, passaggio: 80, dribbling: 80, posizionamento: 80 },
  form: 60, morale: 60, fatigue: 30, popularity: 50, coachTrust: 50, value: 20, bankBalance: 100000,
  goals: 5, assists: 2, matches: 10, contract: { duration: 3, wage: 30000, expiresAtSeason: 8 }, ...extra } });

async function apri(save, rompi = false) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => guasti.push('pageerror: ' + String(e.message).slice(0, 120)));
  await page.addInitScript(cfg => {
    window.__CPM_GLB = false;
    if (cfg.rompi) window.__CPM_NO_P0_4 = 1;   // toglie i lock (prova del rosso)
    localStorage.setItem('cpm-v3', JSON.stringify(cfg.sv));
  }, { sv: save, rompi });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
  await sleep(1200);
  return page;
}
const st = (page) => page.evaluate(() => { const g = window.__CPM_CAREER.get(); return { week: g.week, bank: g.bank }; });

/* apre la conferma d'avanzamento e clicca N volte nello STESSO tick */
async function avanza(page, volte) {
  await page.evaluate(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' })); });
  await sleep(800);
  const n = await page.evaluate((v) => {
    const b2 = Array.from(document.querySelectorAll('button')).find(x => /Conferma avanzamento/i.test(x.textContent || ''));
    if (!b2) return 0;
    for (let i = 0; i < v; i++) b2.click();
    return v;
  }, volte);
  await sleep(3000);
  return n;
}

/* ── ROSSO: senza lock il doppio tap avanza di due settimane ── */
{
  const page = await apri(mkSave(), true);
  const pre = await st(page);
  await avanza(page, 2);
  const post = await st(page);
  await page.close();
  const d = post.week - pre.week;
  console.log(`ROSSO) con __CPM_NO_P0_4: doppio tap → settimana ${pre.week}→${post.week} (Δ${d}) · saldo Δ${post.bank - pre.bank}`);
  if (d !== 2) guasti.push(`(ROSSO) senza lock il difetto non si riproduce (Δ${d}): il guardiano non dimostra di proteggere nulla`);
}

/* ── 1: click singolo → una sola settimana ── */
{
  const page = await apri(mkSave());
  const pre = await st(page);
  await avanza(page, 1);
  const post = await st(page);
  await page.close();
  console.log(`1) click singolo → settimana ${pre.week}→${post.week} (atteso +1) · saldo Δ${post.bank - pre.bank}`);
  if (post.week - pre.week !== 1) guasti.push(`(1) REGRESSIONE: il click singolo non avanza di 1 (Δ${post.week - pre.week})`);
}

/* ── 2 + 3 + 5: doppio tap → una sola applicazione, e il gioco resta usabile ── */
{
  const page = await apri(mkSave());
  const pre = await st(page);
  await avanza(page, 2);
  const dopoDoppio = await st(page);
  const d = dopoDoppio.week - pre.week;
  console.log(`2) doppio tap → settimana ${pre.week}→${dopoDoppio.week} (Δ${d}, atteso 1) · saldo Δ${dopoDoppio.bank - pre.bank}`);
  if (d !== 1) guasti.push(`(2) il doppio tap ha applicato ${d} avanzamenti invece di 1`);
  /* dopo il completamento il gioco deve restare usabile: si prosegue col percorso REALE
     (vivi la settimana → gioca/simula → avanza), non riaprendo la conferma — dopo un avanzamento
     `weekLived` torna falso e il CTA diventa «Vivi la Settimana»: ripremere «A» non e' il flusso vero. */
  let passi = 0;
  for (let i = 0; i < 4; i++) {
    const r = await page.evaluate(() => window.__CPM_CAREER.step());
    await page.evaluate(() => window.__CPM_CAREER.dismiss());
    await sleep(1800);
    if (String(r).startsWith('error:')) { guasti.push(`(3) il percorso reale va in errore dopo il doppio tap: ${r}`); break; }
    passi++;
  }
  const dopoTerzo = await st(page);
  await page.close();
  console.log(`3+5) il gioco prosegue dopo il doppio tap: ${passi} passi del percorso reale → settimana ${dopoDoppio.week}→${dopoTerzo.week}`);
  if (dopoTerzo.week <= dopoDoppio.week) guasti.push(`(3) dopo il doppio tap la carriera non avanza piu' (${dopoDoppio.week} → ${dopoTerzo.week}): blocco permanente`);
}

/* ── 4: scelta d'evento cliccata due volte → effetti applicati una volta sola ── */
async function evento(rompi) {
  const page = await apri(mkSave({ weekLived: false }), rompi);
  const leggi = () => page.evaluate(() => { try { const p = JSON.parse(localStorage.getItem('cpm-v3')).player; return { fatigue: p.fatigue, pop: p.popularity, trust: p.coachTrust, morale: p.morale }; } catch (e) { return null; } });
  await page.evaluate(() => { const b2 = Array.from(document.querySelectorAll('button')).find(x => /Vivi la Settimana/i.test(x.textContent || '')); if (b2) b2.click(); });
  await page.waitForFunction(() => /IMPULSO|SPOGLIATOIO|SETTIMANA \d+ —/i.test(document.body.innerText || ''), { timeout: 15000 }).catch(() => {});
  await sleep(1200);
  const pre = await leggi();
  await page.evaluate(() => { window.__CPM_TAP449 = { adv: 0, evt: 0 }; });
  const info = await page.evaluate(() => {
    const inModal = (el) => { let n = el; while (n && n !== document.body) { const s = getComputedStyle(n); if (s.position === 'fixed' && (parseInt(s.zIndex) || 0) > 1000) return true; n = n.parentElement; } return false; };
    const c = Array.from(document.querySelectorAll('button')).filter(x => { const t = (x.textContent || '').trim(); return t.length > 6 && t.length < 90 && inModal(x) && !/Home|Stagione|Club|Carriera|Agente|Opzioni|Salva|Sostieni|Idee|Gioca vs|Vivi la/i.test(t); });
    if (!c.length) return null;
    c[0].click(); c[0].click();           // DOPPIO tap nello stesso tick
    return (c[0].textContent || '').trim().slice(0, 40);
  });
  await sleep(2500);
  const post = await leggi();
  const n = await page.evaluate(() => (window.__CPM_TAP449 || {}).evt);
  await page.close();
  if (!info || !pre || !post) return null;
  return { scelta: info, n, delta: Object.fromEntries(Object.keys(pre).map(k => [k, (post[k] ?? 0) - (pre[k] ?? 0)])) };
}
/* la cascata di «Vivi la Settimana» puo' mostrare un impulso oppure un momento di spogliatoio, che ha
   un handler diverso: si riprova finche' non si incontra davvero una scelta d'impulso (n>0), altrimenti
   si misurerebbe un modal che non c'entra. */
async function eventoConImpulso(rompi) {
  for (let i = 0; i < 5; i++) { const r = await evento(rompi); if (r && r.n > 0) return r; }
  return null;
}
{
  const rosso = await eventoConImpulso(true);
  const verde = await eventoConImpulso(false);
  console.log(`\n4) scelta d'evento cliccata DUE volte (l'invariante si misura sulle APPLICAZIONI, non sui valori:
   quale evento viene estratto e' casuale, il numero di applicazioni no)`);
  console.log(`   senza lock: ${rosso ? rosso.n + ' applicazioni · ' + JSON.stringify(rosso.delta) : '(scelta non trovata)'}`);
  console.log(`   con lock:   ${verde ? verde.n + ' applicazione/i · ' + JSON.stringify(verde.delta) : '(scelta non trovata)'}`);
  if (!rosso || !verde) guasti.push('(4) la scelta d\'evento non e\' stata raggiunta: sonda cieca');
  else {
    if (rosso.n !== 2) guasti.push(`(4-ROSSO) senza lock le applicazioni sono ${rosso.n} invece di 2: il difetto non si riproduce`);
    if (verde.n !== 1) guasti.push(`(4) col lock le applicazioni sono ${verde.n} invece di 1`);
  }
}

await b.close(); srv.close();
console.log(guasti.length ? `\n❌ FAIL — ${guasti.length}\n` + guasti.map(g => '  ✗ ' + g).join('\n')
  : '\n✅ DOPPIO TAP OK (un tocco = una applicazione · nessun blocco permanente · gli eventi non raddoppiano)');
process.exit(guasti.length ? 1 : 0);
