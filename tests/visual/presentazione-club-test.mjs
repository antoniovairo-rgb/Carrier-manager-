#!/usr/bin/env node
/* [7.283.0 collaudo PO «in conferenza non ho detto nulla con questa squadra, organizza conferenza stampa e foto
   con la maglia ad ogni trasferimento»] GUARDIANO della PRESENTAZIONE AL NUOVO CLUB.
   (Da non confondere con `presentazione-test.mjs`, che è la serata di presentazione allo STADIO del 7.13.0.)
   (1) chi è appena arrivato trova la sala stampa: stemma, maglia col numero, tre toni;
   (2) scelto il tono, la card sparisce e resta una voce nel registro TIMBRATA sul club nuovo — così «Il conto delle
       parole» ha finalmente qualcosa di vero da citare in quella piazza;
   (3) chi è al club da anni NON viene convocato: sarebbe assurdo presentare una maglia indossata da tre stagioni
       (baseline silenzioso sui salvataggi esistenti).
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node presentazione-club-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

const CLUB = { id: 'rbl', n: 'FC Leipzig', a: 'FLZ', p: 88, c: '#f5f5f5', c2: '#dc2626', nat: '🇩🇪', lg: 'Deutsche Liga' };
const mk = (extra) => ({ phase: 'career', player: {
  name: 'Presenta Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 6, week: 7, age: 26, ovr: 83,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 6, presidentModalSeason: 6, drawSeen: 6, coachPactSeason: 6,
  seasonPledge: { season: 6, tone: 'equilibrato' }, squadRole: 'titolare', coachTrust: 70, teamChemistry: 60, popularity: 50,
  club: CLUB, stats: { 'velocità': 83, tecnica: 83, fisico: 80, 'mentalità': 82, tiro: 85, passaggio: 81, dribbling: 84, posizionamento: 83 },
  form: 90, morale: 90, fatigue: 40, totalMatches: 160, totalGoals: 70, matchHistory: [],
  contract: { duration: 3, wage: 900000, expiresAtSeason: 9 }, ...extra } });

const boot = async (save, tag) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1400 } });
  page.on('pageerror', e => issues.push(`pageerror(${tag}): ` + String(e.message).slice(0, 130)));
  await installCdnRoutes(page);
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1300);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(900);
  return page;
};

// ── (1) appena arrivato in prestito → la sala stampa c'è
{
  const page = await boot(mk({ loan: { parentClub: { id: 'bha', n: 'FC Sussex' }, weeks: 30 } }), 'nuovo');
  const t = await page.evaluate(() => document.body.innerText || '');
  const ok = /Presentazione/i.test(t) && /FC Leipzig/.test(t);
  const toni = ['Sono qui per vincere', 'ripagare la fiducia', 'imparare e mettermi a disposizione'].filter(x => t.includes(x));
  console.log(`(1) card presentazione: ${ok ? 'presente' : 'ASSENTE'} · toni offerti ${toni.length}/3`);
  if (!ok) issues.push('(1) chi è appena arrivato non trova nessuna conferenza di presentazione');
  if (toni.length !== 3) issues.push(`(1) toni disponibili ${toni.length}/3`);

  // ── (2) scelgo un tono → card via + voce nel registro col club NUOVO
  if (ok && toni.length) {
    try { await page.getByRole('button', { name: /ripagare la fiducia/i }).first().click({ timeout: 5000 }); }
    catch (e) { issues.push('(2) bottone del tono non cliccabile: ' + String(e.message).slice(0, 60)); }
    await sleep(1300);
    const dopo = await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('cpm-v3'));
      const led = (s.player.ledger || []);
      return { txt: (document.body.innerText || '').slice(0, 5000), pres: s.player.presentedClub, ultima: led[led.length - 1] || null, pop: s.player.popularity, trust: s.player.coachTrust };
    });
    const sparita = !/Presentazione ·/.test(dopo.txt);
    const voce = dopo.ultima;
    console.log(`(2) dopo la scelta — card ${sparita ? 'sparita' : 'ANCORA LÌ'} · presentedClub=${dopo.pres} · registro: ${voce ? `«${voce.what}» club=${voce.club}` : 'NESSUNA VOCE'} · fiducia ${dopo.trust}`);
    if (!sparita) issues.push('(2) la card resta dopo la conferenza');
    if (dopo.pres !== 'rbl') issues.push(`(2) presentedClub non aggiornato (${dopo.pres})`);
    if (!voce || voce.club !== 'rbl' || !/Presentazione a FC Leipzig/.test(voce.what || '')) issues.push('(2) il registro non ha la voce della presentazione timbrata sul club nuovo');
    if (!(dopo.trust > 70)) issues.push(`(2) il tono scelto non ha prodotto effetti (fiducia ${dopo.trust}, attesa > 70)`);
  }
  await page.close();
}

// ── (3) al club da anni → nessuna convocazione
{
  const page = await boot(mk({ history: [{ season: 3, club: 'FC Vecchio', clubId: 'x', matches: 30, goals: 10 }] }), 'storico');
  const t = await page.evaluate(() => document.body.innerText || '');
  const c = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cpm-v3')).player.presentedClub; } catch (e) { return null; } });
  const esce = /Presentazione ·/.test(t);
  console.log(`(3) veterano del club — card ${esce ? 'ESCE (difetto)' : 'non esce'} · baseline presentedClub=${c}`);
  if (esce) issues.push('(3) viene convocata la stampa per una maglia indossata da stagioni');
  if (c !== 'rbl') issues.push(`(3) il baseline silenzioso non ha fissato il club corrente (${c})`);
  await page.close();
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — ogni nuova maglia ha la sua conferenza, e la piazza vecchia resta al suo posto');
