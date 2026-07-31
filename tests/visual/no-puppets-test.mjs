#!/usr/bin/env node
/* [7.264.0 direttiva PO «burattini non ne voglio mai vedere in campo, piuttosto messaggio di errore/warning»]
   GUARDIANO — con il CH38 ATTESO ma IRRAGGIUNGIBILE (richiesta abortita, come una rete che cade):
   (1) in campo NON deve comparire nessun modello procedurale (i mesh restano nascosti);
   (2) al posto del fischio d'inizio deve comparire l'AVVISO «Modelli 3D non caricati» con ↻ Riprova;
   (3) il clock NON deve avanzare (la partita non parte coi modelli di ripiego);
   (4) l'uscita dichiarata «Gioca comunque senza modelli 3D» deve esistere e, se scelta, far ripartire il gioco.
   Il service worker va BLOCCATO: servirebbe i GLB dalla cache bypassando le route.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node no-puppets-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 900 }, serviceWorkers: 'block' });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
// il corpo del modello e' IRRAGGIUNGIBILE (le clip passano: e' il caso peggiore realistico)
let glbReqs = 0;
await page.route('**/footballer.glb*', async (route) => { glbReqs++; try { await route.abort(); } catch (e) {} });

await page.addInitScript(() => {
  const save = { phase: 'career', player: { name: 'Puppet Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 2, age: 21, ovr: 74, tutorialDone: true, weekLived: true, campDone: true, presidentModalSeason: 2, jerseyNumSeason: 2, drawSeen: 2, seasonPledge: { season: 2, tone: 'equilibrato' },
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
    stats: { 'velocità': 74, tecnica: 73, fisico: 72, 'mentalità': 74, tiro: 76, passaggio: 73, dribbling: 75, posizionamento: 74 },
    form: 72, morale: 74, fatigue: 12, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
  localStorage.setItem('cpm-intro-seen', '1');
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 });
await sleep(1800);

const click = async (rx) => page.evaluate((s) => { const r = new RegExp(s, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return (el.textContent || '').trim().slice(0, 40); } return null; }, rx);
for (const step of ['^CONTINUA', 'Vivi la Settimana|Gioca vs|Gioca la partita', 'Gioca la partita|Gioca vs', 'Entra in campo|^Salta', '^Salta']) { await click(step); await sleep(1000); }

// ───── campionamento: burattini visibili? avviso? clock?
const probe = () => page.evaluate(() => {
  const vis = el => el && el.offsetParent !== null;
  const txt = document.body.innerText || '';
  let min = null;
  for (const el of document.querySelectorAll('div,span')) { const t = (el.textContent || '').trim(); const m = /^(\d{1,2})'$/.exec(t); if (m) { min = +m[1]; break; } }
  // conteggio dei mesh PROCEDURALI realmente visibili nella scena 3D (hook interno del render-loop)
  let procVis = null;
  try { if (typeof window.__CPM_PROCVIS === 'function') procVis = window.__CPM_PROCVIS(); } catch (e) {}
  return { warn: /Modelli 3D non caricati/i.test(txt), retry: /Riprova il caricamento/i.test(txt), escape: /Gioca comunque senza modelli 3D/i.test(txt), hold: /Verso il fischio/i.test(txt), min, procVis, fail: window.__CPM_GLB_FAIL, ready: window.__CPM_GLB_READY };
});

const samples = [];
for (let i = 0; i < 30; i++) { samples.push(await probe()); await sleep(700); }
const last = samples[samples.length - 1];
const sawWarn = samples.some(s => s.warn);
const mins = samples.filter(s => s.min != null).map(s => s.min);
const clockFroze = mins.length === 0 || (Math.max(...mins) - Math.min(...mins) <= 1);
const puppetsSeen = samples.filter(s => s.procVis > 0).length;

console.log(`richieste GLB abortite: ${glbReqs} · fail=${last.fail} ready=${last.ready}`);
console.log(`avviso «Modelli 3D non caricati»: ${sawWarn} · ↻ Riprova: ${last.retry} · uscita dichiarata: ${last.escape}`);
console.log(`clock congelato: ${clockFroze} (minuti visti: ${[...new Set(mins)].join(',') || 'nessuno'})`);
console.log(`campioni con modelli procedurali VISIBILI in campo: ${puppetsSeen}/${samples.length}` + (last.procVis === null ? ' (hook scena non disponibile → si valuta il resto)' : ''));

const issues = [];
if (!sawWarn) issues.push('con il modello irraggiungibile NON è comparso l\'avviso di errore');
if (!last.retry) issues.push('manca il pulsante «↻ Riprova il caricamento»');
if (!last.escape) issues.push('manca l\'uscita dichiarata «Gioca comunque senza modelli 3D»');
if (!clockFroze) issues.push('la partita è PARTITA lo stesso (clock avanzato) invece di fermarsi sull\'avviso');
if (puppetsSeen > 0) issues.push(`i modelli procedurali sono comparsi in campo in ${puppetsSeen} campioni (la direttiva li vieta)`);
if (!samples.some(s => typeof s.procVis === 'number' && s.procVis >= 0)) issues.push('il conteggio dei modelli procedurali non è misurabile (hook __CPM_PROCVIS assente): l\'asserzione sarebbe vuota');
if (errors.length) issues.push('pageerror: ' + errors[0]);

// ───── (4) l'uscita dichiarata riparte davvero
if (last.escape) {
  await click('Gioca comunque senza modelli 3D'); await sleep(2600);
  const after = await probe();
  console.log(`dopo l'uscita dichiarata — avviso: ${after.warn} · clock: ${after.min}`);
  if (after.warn) issues.push('l\'uscita dichiarata non chiude l\'avviso');
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ PASS — nessun burattino in campo: al loro posto un avviso esplicito con Riprova');
