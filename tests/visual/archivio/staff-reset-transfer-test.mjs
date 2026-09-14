/* [7.325.0] GUARDIANO PERMANENTE — LO SPOGLIATOIO NON TI SEGUE NEL TRASLOCO
   (collaudo PO con screenshot «appena arrivato nel nuovo club e' impossibile»:
   Preparatore 100 · Vice-Mister 100 · Chimica Squadra 100 il giorno dell'arrivo)

   acceptTransfer azzerava SOLO coachTrust: preparatore, vice e chimica viaggiavano col giocatore.
   Ora al cambio club ripartono (50/50, chimica 42 = sei il nuovo arrivato). Tre scenari:
     (1) TRASFERIMENTO vero (setOffer+acceptOffer sul VERO acceptTransfer) → 50/50/42;
     (2) CONTROPROVA: il RINNOVO (stesso club) NON deve toccarli — senza questa il reset potrebbe
         scattare anche dove il club non cambia;
     (3) i valori NON vengono maceriati dal solo boot (migration non li tocca).
   I due siti gemelli (transizione pro, rientro dal prestito al rollover) usano lo stesso reset
   inline documentato nel sorgente.

     node staff-reset-transfer-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = []; const say = (ok, m) => { if (!ok) issues.push(m); console.log(`${ok ? '✅' : '❌'} ${m}`); };

const OLD = { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' };
const NEW = { id: 'fio', n: 'FC Viola', a: 'VIO', p: 77, c: '#7c3aed', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' };

const save = { phase: 'career', player: {
  name: 'Staff Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 6, week: 3, age: 26, ovr: 84,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 6, presidentModalSeason: 6, drawSeen: 6,
  coachPactSeason: 6, presentedClub: OLD.id, seasonPledge: { season: 6, tone: 'equilibrato' }, squadRole: 'titolare',
  club: OLD, stats: { 'velocità': 84, tecnica: 84, fisico: 82, 'mentalità': 84, tiro: 87, passaggio: 82, dribbling: 85, posizionamento: 85 },
  form: 85, morale: 85, fatigue: 30, coachTrust: 90, teamChemistry: 100, fitnessCoachRel: 100, assistantCoachRel: 100,
  popularity: 60, bankBalance: 4e6, goals: 8, assists: 3, matches: 6, totalMatches: 190, totalGoals: 100, matchHistory: [],
  contract: { duration: 3, wage: 1200000, expiresAtSeason: 9 } } };

const boot = async (tag) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1300 } });
  page.on('pageerror', e => issues.push(`pageerror(${tag}): ` + String(e.message).slice(0, 130)));
  await installCdnRoutes(page);
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1400);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) { }
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(900);
  return page;
};
const staff = (page) => page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')).player; return { fit: s.fitnessCoachRel, vice: s.assistantCoachRel, chem: s.teamChemistry, club: s.club && s.club.id }; });

/* (3) il boot da solo non li tocca */
{
  const page = await boot('boot');
  const st = await staff(page);
  say(st.fit === 100 && st.vice === 100 && st.chem === 100, `(3) il boot non macera i valori: ${st.fit}/${st.vice}/${st.chem} (attesi 100/100/100)`);

  /* (1) trasferimento vero */
  const a = await page.evaluate((c) => { const C = window.__CPM_CAREER; if (!C || !C.setOffer) return 'no-hook'; return C.setOffer({ club: c, type: 'Trasferimento', wage: 1500000, duration: 3, moralBonus: 8, fee: 25 }); }, NEW);
  say(a === true, `(1a) offerta iniettata sul flusso vero (${a})`);
  await sleep(800);
  const ok = await page.evaluate(() => window.__CPM_CAREER.acceptOffer());
  await sleep(2400);
  const st2 = await staff(page);
  say(ok === true && st2.club === NEW.id, `(1b) trasferimento eseguito → club ${st2.club}`);
  say(st2.fit === 50 && st2.vice === 50 && st2.chem === 42, `(1c) lo spogliatoio NON ti segue: preparatore ${st2.fit} (atteso 50) · vice ${st2.vice} (atteso 50) · chimica ${st2.chem} (atteso 42)`);
  await page.close();
}

/* (2) controprova: il RINNOVO non li tocca */
{
  const page = await boot('rinnovo');
  const a = await page.evaluate(() => { const C = window.__CPM_CAREER; if (!C || !C.setOffer) return 'no-hook'; return C.setOffer({ isRenewal: true, wage: 1500000, duration: 2, moralBonus: 5 }); });
  say(a === true, `(2a) offerta di rinnovo iniettata (${a})`);
  await sleep(800);
  await page.evaluate(() => window.__CPM_CAREER.acceptOffer());
  await sleep(1600);
  const st = await staff(page);
  say(st.club === OLD.id && st.fit === 100 && st.vice === 100 && st.chem === 100, `(2b) rinnovo = stesso club, rapporti INTATTI: ${st.fit}/${st.vice}/${st.chem} @ ${st.club}`);
  await page.close();
}

console.log(issues.length ? `\n❌ FAIL — ${issues.length}` : '\n✅ PASS — al cambio club lo spogliatoio riparte, al rinnovo resta');
await browser.close(); srv.close();
process.exit(issues.length ? 2 : 0);
