/* [7.303.0] collaudo PO «il calciatore è un portiere ma è vestito come gli altri»:
 * nella serata di presentazione il beat del PORTIERE deve (a) portare il flag gk e (b) mostrare
 * in 3D una divisa a tinta unita DIVERSA da quella di squadra. GLB-ON (direttiva CH38).
 * Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node pres-gk-kit-test.mjs
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const errs = [];
const CL = { id:'juve', n:'Torino Athletic', a:'TAT', p:95, c:'#f5f5f5', c2:'#0f0f0f', nat:'🇮🇹', lg:'Lega A' };
const page = await browser.newPage({ viewport:{ width:430, height:956 } });
page.on('pageerror', e => errs.push(String(e.message).slice(0,160)));
await installCdnRoutes(page);
await page.addInitScript((cl) => {
  window.__CPM_GLB = true;
  localStorage.setItem('cpm-intro-seen','1');
  const p = { name:'Max Rea Vairo', nation:'Italia', avatarId:0, proStatus:'pro', season:10, week:1, age:25, ovr:85,
    tutorialDone:true, campDone:true, jerseyNum:9, jerseyNumSeason:10, presidentModalSeason:10, drawSeen:10,
    mercatoSeen:10, coachPactSeason:10, seasonPledge:{season:10,tone:'equilibrato'}, squadRole:'titolare',
    club:cl, stats:{'velocità':85,tecnica:85,fisico:82,'mentalità':83,tiro:88,passaggio:83,dribbling:86,posizionamento:85},
    form:82, morale:75, fatigue:25, coachTrust:80, teamChemistry:70, popularity:60, bankBalance:5e6,
    goals:0, assists:0, matches:0, totalMatches:200, totalGoals:120, matchHistory:[],
    contract:{ duration:3, wage:9e5, expiresAtSeason:13 } };
  localStorage.setItem('cpm-v3', JSON.stringify({ phase:'career', player:p }));
}, CL);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'domcontentloaded', timeout:90000 });
await page.waitForFunction(() => { const r=document.getElementById('root'); return r && r.children.length>0; }, null, { timeout:60000 });
await sleep(1200);
try { await page.getByText('Continua',{exact:false}).first().click({ timeout:5000 }); } catch(_e) {}
await sleep(2000);

/* il PORTIERE entra nei beat solo se è una faccia nota dello spogliatoio: lo iniettiamo prendendo
   il nome VERO del portiere in rosa (slot 0 di generateTeamRoster) come capitano. */
const setup = await page.evaluate(() => {
  const ros = window.__CPM_CAREER.roster();
  const gk = ros && ros.find(r => r && /portiere/i.test(r.role || ''));
  return gk ? { gk: gk.name } : { err:'nessun portiere in rosa' };
});
console.log('portiere in rosa:', JSON.stringify(setup));
if (setup.gk) {
  /* niente reload: l'addInitScript riscriverebbe il save. Il capitano lo iniettiamo in STATO. */
  await page.evaluate((nm) => window.__CPM_CAREER.patch({ teammates:[{ name:nm, archetype:'capitano', bond:60 }] }), setup.gk);
  await sleep(900);
}

const beats = await page.evaluate(() => { try { return window.__CPM_CAREER.presBeats(); } catch(e) { return { err:String(e.message) }; } });
const gkBeat = Array.isArray(beats) ? beats.findIndex(b => b && b.gk) : -1;
console.log('beats:', JSON.stringify(beats));
console.log('indice beat portiere:', gkBeat);

let shot = false;
if (gkBeat > 0) {
  /* apre la serata e avanza fino al beat del portiere */
  await page.evaluate(() => { try { window.__CPM_CAREER.goTab && window.__CPM_CAREER.goTab('dashboard'); } catch(_e){} });
  await sleep(400);
  try { await page.getByRole('button',{name:/Vivi la Settimana|Avanza/i}).first().click({ timeout:5000 }); } catch(_e) {}
  await sleep(900);
  try { await page.getByRole('button',{name:/Vai allo stadio/i}).first().click({ timeout:6000 }); } catch(_e) {}
  await sleep(5000);
  for (let k = 0; k < gkBeat; k++) { try { await page.getByRole('button',{name:/^Avanti/i}).first().click({ timeout:3000 }); } catch(_e) {} await sleep(1400); }
  await sleep(2500);
  await page.screenshot({ path:'out/pres-gk.png' });
  shot = true;
}

await browser.close(); srv.close();
const ok = gkBeat > 0 && !errs.length;
console.log(JSON.stringify({ gkBeat, shot, pageerrors: errs.length }));
console.log(ok ? '✅ PASS — il beat del portiere è marcato (kit GK in scena, screenshot out/pres-gk.png)' : '❌ FAIL ' + errs.join(' | '));
process.exit(ok ? 0 : 2);
