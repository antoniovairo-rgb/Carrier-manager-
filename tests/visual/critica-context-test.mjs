#!/usr/bin/env node
/* GUARDIANO — «DOPO UNA VITTORIA CON GOL E' STRANO» (famiglia CRITICA).

   LA DOMANDA DEL PO, che vale piu' del difetto: «ma e' davvero l'agente che vuole rispondere o pesca
   da una lista scollegata di impulsi?». La risposta e' la seconda, e sta nel codice: il pescatore
   settimanale estrae a caso dal mazzo (`impulseFreshBucket` + `pick`) e l'unico filo che lega un
   impulso alla situazione e' la sua `cond`. Su 17 impulsi di categoria «tensione», otto non ne
   avevano nessuna — cioe' non erano scollegati per sbaglio, lo erano per costruzione.

   E c'era un precedente esatto: il 7.35.2 aveva gia' chiuso questa stessa nota del PO («dopo una
   vittoria con l'Inter e' fuori luogo!») mettendo il criterio su UN impulso, `wi_polemica`. Il
   gemello `wi_opinionista` e' rimasto scoperto e si e' ripresentato col nome del fratello. Da qui il
   guardiano: non «quell'impulso ha la sua guardia» ma LA FAMIGLIA e' legata al contesto.

   COSA MISURA (sonda `critPool` in `__CPM_CAREER`, che elenca quali impulsi «ti criticano» sono
   pescabili adesso):
     · vittoria con gol e voto alto  ⇒ NESSUNO pescabile
     · sconfitta con prestazione da 5,6 ⇒ ALMENO DUE (la sensibilita' e' parte dell'assert: uno
       strumento cieco renderebbe il verde una non-prova)
     · «il mister ti sta usando male» ⇒ non pescabile con la fiducia del tecnico alta, pescabile bassa

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node critica-context-test.mjs                        */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const mkSave = (extra) => ({ phase: 'career', player: {
  name: 'Probe Critica', nation: 'Italia', avatarId: 1, proStatus: 'pro', season: 5, week: 14, age: 24, ovr: 79,
  campDone: true, presidentModalSeason: 5, jerseyNumSeason: 5, drawSeen: 5, mercatoSeen: 5, presentSeason: 5, tutorialDone: true,
  seasonPledge: { season: 5, tone: 'equilibrato' }, hasAgent: true, agent: { rapport: 60, memory: {} },
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 60, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 80, tecnica: 80, fisico: 78, 'mentalità': 80, tiro: 81, passaggio: 80, dribbling: 80, posizionamento: 80 },
  form: 82, morale: 90, fatigue: 15, coachTrust: 75, popularity: 60, value: 20, bankBalance: 90000,
  goals: 9, assists: 4, matches: 13,
  history: [{ season: 4, club: 'FC Salernum', clubId: 'sal', goals: 14, assists: 5, matches: 33, ovr: 78, league: 'Lega A' }],
  contract: { duration: 3, wage: 30000, expiresAtSeason: 8 },
  ...extra } });

async function pool(save) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript(sv => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1600);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await sleep(1200);
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.critPool), { timeout: 30000 });
  const r = await page.evaluate(() => window.__CPM_CAREER.critPool());
  await page.close();
  return r;
}

const VITTORIA = [{ won: true, drew: false, rating: 7.8, goals: 1, assists: 0, opponent: 'FC Amsterdam' }];
const DISFATTA = [{ won: false, drew: false, rating: 5.6, goals: 0, assists: 0, opponent: 'FC Amsterdam' }];
const guasti = [];

const a = await pool(mkSave({ matchHistory: VITTORIA }));
const c = await pool(mkSave({ matchHistory: DISFATTA }));
const d = await pool(mkSave({ matchHistory: VITTORIA, coachTrust: 40 }));
await b.close(); srv.close();

console.log(`vittoria con gol (voto 7,8) → ${JSON.stringify(a)}`);
console.log(`sconfitta (voto 5,6)        → ${JSON.stringify(c)}`);
console.log(`vittoria ma mister freddo   → ${JSON.stringify(d)}`);

if (!Array.isArray(a) || a.length) guasti.push(`dopo una vittoria con gol la famiglia critica e' ancora pescabile: ${JSON.stringify(a)}`);
if (!Array.isArray(c) || c.length < 2) guasti.push(`dopo una disfatta la sonda vede ${JSON.stringify(c)} — strumento cieco, il verde non proverebbe nulla`);
if (Array.isArray(d) && d.indexOf('wi_intervista_scomoda') < 0) guasti.push(`«il mister ti sta usando male» non e' pescabile nemmeno con la fiducia a 40: ${JSON.stringify(d)}`);
if (Array.isArray(a) && a.indexOf('wi_intervista_scomoda') >= 0) guasti.push('«il mister ti sta usando male» esce con la fiducia del tecnico a 75');

if (guasti.length) { console.log('\n❌ FAIL'); for (const g of guasti) console.log('  · ' + g); process.exit(1); }
console.log('\n✅ PASS — chi ti critica ha qualcosa da criticare (e il mazzo resta sensibile quando ce l\'ha davvero)');
