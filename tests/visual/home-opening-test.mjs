#!/usr/bin/env node
/* GUARDIANO — LE INTERAZIONI D'APERTURA VIVONO SOLO NEL WIZARD.

   DA DOVE VIENE. Direttiva PO: «tutti questi eventi pre stagionali non devono comparire come box nella
   home ma solo nel wizard al click vivi settimana». Ritiro, raduno/mercato/maglie/conferenza, presidente
   e numero di maglia esistevano in DUE posti — card impilate sulla home e passi del wizard — e la home
   di inizio stagione diventava un muro di riquadri prima ancora di vedere la squadra.

   COSA GIUDICA. Due cose insieme, perche' una senza l'altra non basta: che sulla home non compaia
   NESSUNO dei quattro riquadri, e che cliccando «Vivi la Settimana» il wizard si apra davvero. Togliere
   le card senza il secondo controllo renderebbe irraggiungibile mezza apertura di stagione.

   ⚠️ SI CLICCA L'ELEMENTO CLICCABILE PIU' INTERNO col testo della CTA: prendere l'ultimo nodo che
   contiene quel testo colpiva un contenitore senza handler, e il click «riusciva» senza aprire nulla.

   PROVA DEL ROSSO: `__CPM_HOMECARDS` riaccende le card sulla home — servono, perche' la prima stesura di
   questa sonda dava 0 riquadri anche col rimedio spento (non aveva cablato l'interruttore) e non
   distingueva «card tolte» da «card mai attivate».

   LA HOME DI INIZIO STAGIONE, e la prova che il wizard resta raggiungibile. Si carica una carriera alla
   settimana 1 di una stagione >=2 con tutte le interazioni d'apertura pendenti, si fotografa la home e
   si conta quanti riquadri pre-stagionali compaiono; poi si clicca «Vivi la Settimana» e si verifica che
   il wizard si apra. `__CPM_HOMECARDS` riaccende le card (prova del rosso). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from '/home/user/Carrier-manager-/tests/visual/lib/harness.mjs';
import fs from 'node:fs';
let ko = 0, verdi = {};
fs.mkdirSync('out/home', { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const save = { phase: 'career', player: { name: 'Probe Uno', nation: 'Italia', avatarId: 3, proStatus: 'pro', season: 6, week: 1, weekLived: false, age: 24, ovr: 78, tutorialDone: true,
  campDone: false, mercatoSeen: 4, presidentModalSeason: 4, jerseyNumSeason: 4, presentSeason: 4, drawSeen: 4,
  squadRole: 'titolare', coachTrust: 80, value: 30, popularity: 55, goals: 0, assists: 0, matches: 0, matchHistory: [],
  seasonObjectives: [{ t: 'Segna 20 gol', n: 20, v: 0 }, { t: 'Finisci nei primi 3', n: 3, v: 0 }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
  form: 75, morale: 70, fatigue: 5, contract: { duration: 3, wage: 20000, expiresAtSeason: 9 } } };
const TITOLI = ['APERTURA STAGIONE', 'IL PRESIDENTE TI CONVOCA', 'NUMERO DI MAGLIA', 'Parti per il ritiro'];
for (const rosso of [false, true]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
  await installCdnRoutes(page);
  page.on('pageerror', e => console.log('PE', String(e.message).slice(0, 120)));
  await page.addInitScript(o => { localStorage.setItem('cpm-v3', JSON.stringify(o.s)); if (o.r) window.__CPM_HOMECARDS = 1; }, { s: save, r: rosso });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  await sleep(2500);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 3000 }); } catch (e) {}
  await sleep(1500);
  const testo = await page.evaluate(() => document.body.innerText || '');
  const presenti = TITOLI.filter(t => testo.includes(t));
  console.log(`\n${rosso ? 'PROVA DEL ROSSO (card riaccese)' : 'HOME ATTUALE'} → riquadri pre-stagionali visibili: ${presenti.length}/4 ${presenti.length ? '[' + presenti.join(' · ') + ']' : ''}`);
  verdi[rosso ? 'rosso' : 'verde'] = presenti.length;
  if (!rosso) {
    await page.screenshot({ path: 'out/home/apertura.png', fullPage: false });
    /* ⚠️ si clicca l'elemento CLICCABILE piu' interno che contiene il testo: prendere l'ultimo nodo con
       quel testo colpiva un contenitore senza handler, e il click «riusciva» senza fare nulla. */
    const aperto = await page.evaluate(() => {
      const cand = [...document.querySelectorAll('button,[role=button],div,a')].filter(x => /Vivi la Settimana/i.test(x.textContent || ''));
      const clic = cand.filter(x => x.tagName === 'BUTTON' || x.getAttribute('role') === 'button' || getComputedStyle(x).cursor === 'pointer');
      const t = clic.length ? clic[clic.length - 1] : null;
      if (!t) return 'nessun elemento cliccabile con quel testo';
      t.click(); return 'cliccato <' + t.tagName.toLowerCase() + '>';
    });
    await sleep(1800);
    const dopo = await page.evaluate(() => document.body.innerText || '');
    const nelWiz = TITOLI.filter(t => dopo.includes(t));
    console.log(`  «Vivi la Settimana»: ${aperto} → contenuti d'apertura ora a schermo: ${nelWiz.length ? nelWiz.join(' · ') : 'NESSUNO'}`);
    verdi.wizard = /SETTIMANA DI APERTURA|Passo 1 di/i.test(dopo) || nelWiz.length > 0;
    console.log('  primi 200 caratteri dopo il click: ' + dopo.replace(/\s+/g, ' ').slice(0, 200));
    await page.screenshot({ path: 'out/home/wizard.png' });
  }
  await page.close();
}
await b.close(); srv.close();

console.log('');
if (verdi.verde !== 0) { console.log(`❌ la home mostra ancora ${verdi.verde} riquadri pre-stagionali`); ko++; }
else console.log('✅ la home non mostra nessun riquadro pre-stagionale');
if (!verdi.wizard) { console.log('❌ «Vivi la Settimana» non apre il wizard d\'apertura: i contenuti sarebbero irraggiungibili'); ko++; }
else console.log('✅ «Vivi la Settimana» apre il wizard d\'apertura');
/* ⚠️ senza il rosso questo guardiano non prova nulla: 0 riquadri e' anche il risultato di una carriera
   che non ha interazioni pendenti. */
if (verdi.rosso !== 4) { console.log(`❌ PROVA DEL ROSSO FALLITA: riaccendendo le card se ne vedono ${verdi.rosso}/4 — il caso di prova non attiva l'apertura, quindi il verde non significa niente`); ko++; }
else console.log('✅ prova del rosso: riaccendendo le card se ne vedono 4/4');
process.exit(ko ? 2 : 0);
