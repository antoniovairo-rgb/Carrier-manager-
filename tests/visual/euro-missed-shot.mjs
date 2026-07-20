/* [7.157.0] SHOT avviso «a un soffio dall'Europa» al SeasonEndScreen: rollover da 8° → schermata fine stagione
   deve mostrare l'avviso; da 7° (Conference) NON deve mostrarlo (mostra la festa euro). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const LEGA_A = ['int','juv','mil','nap','rom','laz','ata','fio','tor','bol','sas','udi','gen','cag','ver','lec','mon','sal'];
const mkStandings = (pos) => { const others = LEGA_A.filter(id => id !== 'sal'); const ranks = []; let oi = 0; for (let i = 0; i < 18; i++){ if(i===pos-1) ranks.push({id:'sal',n:'FC Salernum'}); else { ranks.push({id:others[oi],n:others[oi].toUpperCase()}); oi++; } } return ranks.map((r,i)=>({...r,pts:(18-i)*3,gd:18-i,gf:40-i,ga:20})); };
const save = (pos) => ({ phase:'career', player:{ name:'Euro Probe', nation:'Italia', avatarId:0, proStatus:'pro', season:5, week:39, weekLived:true, age:25, ovr:82, tutorialDone:true, campDone:true, jerseyNumSeason:5, presidentModalSeason:5, drawSeen:5, mercatoSeen:5, seasonPledge:{season:5,tone:'equilibrato'}, club:{id:'sal',n:'FC Salernum',a:'SAL',p:55,c:'#6c1f2e',c2:'#f5f5f5',nat:'🇮🇹',lg:'Lega A'}, stats:{'velocità':82,tecnica:81,fisico:80,'mentalità':82,tiro:84,passaggio:81,dribbling:83,posizionamento:82}, form:72, fatigue:20, morale:70, coachTrust:75, contract:{duration:3,wage:12000,expiresAtSeason:8}, standings:mkStandings(pos), calendar:[], matchHistory:[], history:[], goals:15, assists:8, matches:34, seasonObjectives:[], leagueOverrides:{ sal:'Lega A' } } });

const run = async (pos, out) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
  await installCdnRoutes(page);
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save(pos));
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 40000 });
  await sleep(1400);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  // forza la schermata fine stagione impostando screen via il flusso: chiama startNewSeason NON serve — serve SeasonEndScreen.
  // Il SeasonEndScreen appare quando advanceWeek supera W38. Qui siamo a W38 weekLived: un doAdvanceWeek chiude la stagione.
  await sleep(400);
  // avanza fino al SeasonEndScreen (passa da dashboard → seasonAwards → seasonEnd)
  for (let k = 0; k < 8; k++) {
    const sc = await page.evaluate(() => { try { return window.__CPM_CAREER.get().screen; } catch (e) { return null; } });
    if (sc === 'seasonEnd') break;
    if (sc === 'seasonAwards') { // prima salta il GALA (overlay), poi «Continua alla Fine Stagione →»
      for (const lbl of ['Salta il gala', 'Salta']) { try { await page.getByText(lbl, { exact: false }).first().click({ timeout: 800 }); await sleep(300); } catch (e) {} }
      try { await page.getByText('Continua alla Fine Stagione', { exact: false }).first().click({ timeout: 1500 }); } catch (e) {}
    } else {
      await page.evaluate(() => { try { window.__CPM_CAREER.step(); } catch (e) {} });
    }
    await sleep(900);
  }
  await sleep(1000);
  const txt = await page.evaluate(() => document.body.innerText);
  const missed = /a un soffio dall'europa/i.test(txt);
  const euroFesta = /IN EUROPA|qualificato in/i.test(txt);
  await page.screenshot({ path: out, fullPage: true });
  await page.close();
  return { missed, euroFesta };
};

const r8 = await run(8, 'out/euro-missed-8th.png');
const r7 = await run(7, 'out/euro-conf-7th.png');
console.log('8°:', JSON.stringify(r8), '· 7°:', JSON.stringify(r7));
await browser.close(); srv.close();
const ok = r8.missed && !r8.euroFesta && r7.euroFesta && !r7.missed;
console.log(ok ? '✅ AVVISO OK (8° → «a un soffio» · 7° → festa Conference)' : '❌ avviso incoerente');
process.exit(ok ? 0 : 1);
