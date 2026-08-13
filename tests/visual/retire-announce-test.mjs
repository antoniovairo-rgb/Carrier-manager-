#!/usr/bin/env node
/* [7.432.0] GUARDIANO — L'ANNUNCIO DEL RITIRO A INIZIO STAGIONE
   (evolutiva PO «la funzionalita' annuncio del ritiro ad inizio stagione sei riuscito a farla?»)

   COSA MISURA, sul flusso VERO (wizard d'apertura + fine stagione con gli handler reali):
   (A) a 34+ anni il wizard d'apertura propone la card «l'ultima stagione?»; annunciando, il flag
       `retireAnnounced` viene PERSISTITO nel save (e' il segnale che tutta la stagione d'addio legge);
   (B) a 28 anni la card NON esiste (niente ritiro proposto a un ragazzo);
   (C) con l'annuncio fatto, la fine stagione NON offre «Nuova stagione»: il bottone primario e'
       «Il giorno dell'addio» e porta alla pagina celebrativa (retired persistito — lezione 7.258).
   PROVA DEL ROSSO: eseguito sul build pre-cablaggio, (A) non trova la card e (C) trova ancora
   «Nuova stagione» — fallimento atteso e osservato prima del fix.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node retire-announce-test.mjs                        */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const mkSave = (age, extra) => ({ phase: 'career', player: {
  name: 'Probe Addio', nation: 'Italia', avatarId: 1, proStatus: 'pro', season: 5, week: 1, age, ovr: 86,
  campDone: true, presidentModalSeason: 5, jerseyNumSeason: 5, drawSeen: 5, mercatoSeen: 5, presentSeason: 5, tutorialDone: true,
  seasonPledge: { season: 5, tone: 'equilibrato' },
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 60, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 84, tecnica: 85, fisico: 82, 'mentalità': 85, tiro: 86, passaggio: 85, dribbling: 84, posizionamento: 85 },
  form: 78, morale: 80, fatigue: 10, popularity: 70, value: 30, bankBalance: 90000, goals: 12, assists: 6, matches: 20,
  history: [{ season: 4, club: 'FC Salernum', clubId: 'sal', goals: 18, assists: 7, matches: 34, ovr: 85, league: 'Lega A' }],
  contract: { duration: 2, wage: 30000, expiresAtSeason: 7 },
  ...extra } });

async function apri(save) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(sv => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1600);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await sleep(1200);
  return page;
}
const guasti = [];

/* (A) 35 anni → card «ultima stagione» nel wizard; annuncio → flag persistito */
{
  const page = await apri(mkSave(35));
  try { await page.getByText('Vivi la Settimana', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(1600);
  /* attraversa le card del wizard che la migrazione del save sintetico puo' riarmare */
  for (let i = 0; i < 8; i++) {
    const here = await page.evaluate(() => /ultima stagione|ultima danza/i.test(document.body.innerText || ''));
    if (here) break;
    const hit = await page.evaluate(() => {
      const bs = Array.from(document.querySelectorAll('button'));
      const b2 = bs.find(x => /^Tieni #/i.test((x.textContent || '').trim())) || bs.find(x => /Basso profilo|Vai allo stadio|Ho capito|Avanti/i.test(x.textContent || ''));
      if (b2) { b2.click(); return true; } return false;
    });
    if (!hit) break;
    await sleep(1400);
  }
  const card = await page.evaluate(() => /ultima stagione|ultima danza/i.test(document.body.innerText || ''));
  if (!card) guasti.push('(A) a 35 anni il wizard non propone la card del ritiro');
  else {
    const hit = await page.evaluate(() => {
      const b2 = Array.from(document.querySelectorAll('button')).find(x => /Annuncio|annuncio il ritiro/i.test(x.textContent || ''));
      if (b2) { b2.click(); return true; } return false;
    });
    await sleep(1500);
    const flag = await page.evaluate(() => { try { const sv = JSON.parse(localStorage.getItem('cpm-v3') || '{}'); return sv.player && sv.player.retireAnnounced; } catch (e) { return null; } });
    if (!hit) guasti.push('(A) bottone dell\'annuncio non trovato');
    else if (flag !== 5) guasti.push(`(A) l'annuncio non persiste il flag (retireAnnounced=${flag})`);
    console.log(`(A) card presente · annuncio cliccato ${hit} · flag persistito ${flag}`);
  }
  await page.close();
}
/* (B) 28 anni → nessuna card ritiro */
{
  const page = await apri(mkSave(28));
  try { await page.getByText('Vivi la Settimana', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(1600);
  const card = await page.evaluate(() => /ultima stagione\?|ultima danza/i.test(document.body.innerText || ''));
  if (card) guasti.push('(B) a 28 anni viene proposto il ritiro');
  console.log(`(B) a 28 anni card ritiro assente: ${!card}`);
  await page.close();
}
/* (C) annunciato + W.38 → fine stagione senza «Nuova stagione», bottone d'addio → pagina celebrativa */
{
  const save = mkSave(35, { week: 38, weekLived: true, retireAnnounced: 5, retireAskedSeason: 5,
    standings: Array.from({ length: 18 }, (_, i) => ({ id: i === 0 ? 'sal' : 'c' + i, n: i === 0 ? 'FC Salernum' : 'Club ' + i, pts: 40 - i, played: 34, gf: 40, ga: 30, w: 12, d: 4, l: 10 })), calendar: [] });
  const page = await apri(save);
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
  for (let i = 0; i < 5; i++) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); C.dismiss(); return res; });
    if (r === 'seasonEnd') break;
    await sleep(500);
  }
  await sleep(2500);
  /* attraversa gala/premi fino alla schermata di Fine Stagione */
  for (let i = 0; i < 6; i++) {
    const done = await page.evaluate(() => Array.from(document.querySelectorAll('button')).some(x => /giorno dell'addio|Inizia Stagione/i.test(x.textContent || '')));
    if (done) break;
    const hit = await page.evaluate(() => {
      const bs = Array.from(document.querySelectorAll('button'));
      const b2 = bs.find(x => /Salta il gala/i.test(x.textContent || '')) || bs.find(x => /Continua alla Fine Stagione|Riepilogo/i.test(x.textContent || '')) || bs.find(x => /^Continua/.test((x.textContent || '').trim()));
      if (b2) { b2.click(); return (b2.textContent || '').trim().slice(0, 24); } return null;
    });
    if (!hit) break;
    await sleep(2200);
  }
  const st = await page.evaluate(() => ({
    fine: /Fine Stagione|Riepilogo/i.test(document.body.innerText || ''),
    nuova: Array.from(document.querySelectorAll('button')).some(x => /Inizia Stagione/i.test(x.textContent || '')),
    addio: Array.from(document.querySelectorAll('button')).some(x => /giorno dell'addio/i.test(x.textContent || '')),
  }));
  console.log(`(C) fine-stagione ${st.fine} · «Inizia Stagione» presente ${st.nuova} · «giorno dell'addio» presente ${st.addio}`);
  if (!st.addio) console.log('(C) bottoni:', await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(x => (x.textContent || '').trim().slice(0, 26)).filter(Boolean).slice(0, 14).join(' | ')));
  if (!st.fine) guasti.push('(C) la sonda non ha raggiunto la fine stagione: cieca');
  else {
    if (st.nuova) guasti.push('(C) con l\'annuncio fatto il gioco offre ancora «Inizia Stagione»');
    if (!st.addio) guasti.push('(C) manca il bottone «Il giorno dell\'addio»');
    else {
      await page.evaluate(() => { const b2 = Array.from(document.querySelectorAll('button')).find(x => /giorno dell'addio/i.test(x.textContent || '')); if (b2) b2.click(); });
      await sleep(2500);
      const fine = await page.evaluate(() => { try { const sv = JSON.parse(localStorage.getItem('cpm-v3') || '{}'); return !!(sv.player && sv.player.retired); } catch (e) { return false; } });
      if (!fine) guasti.push('(C) il giorno dell\'addio non porta al ritiro persistito');
      console.log(`(C) ritiro persistito dopo l'addio: ${fine}`);
    }
  }
  await page.close();
}
await b.close(); srv.close();
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log('\n✅ PASS — l\'ultima stagione si annuncia, si vive da annunciata e finisce con l\'addio');
