/* [7.122.0] verifica dark-mode dei pannelli pastello bonificati. */
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const save = { phase:'career', player:{ name:'Dark Probe', nation:'Italia', avatarId:0, proStatus:'pro', season:4, week:12, weekLived:false, age:26, ovr:82, tutorialDone:true, campDone:true, jerseyNumSeason:4, presidentModalSeason:4, drawSeen:4, squadRole:'titolare', coachTrust:78, value:45, popularity:64, goals:14, assists:6, matches:12, totalGoals:80, totalMatches:150,
  matchHistory:[{opponent:'FC Rivale',rating:7.4,goals:1,assists:0,won:true,drew:false,homeScore:2,awayScore:1,week:11}],
  seasonObjectives:{position:5}, records:{topSeasonGoals:22,topSeasonAssists:9,topOvr:82},
  club:{ id:'sal', n:'FC Salernum', a:'SAL', p:52, c:'#6c1f2e', c2:'#f5f5f4', nat:'🇮🇹', lg:'Lega A' },
  stats:{ 'velocità':82, tecnica:81, fisico:80, 'mentalità':82, tiro:84, passaggio:81, dribbling:83, posizionamento:82 },
  form:78, morale:70, fatigue:18, contract:{ duration:2, wage:22000, expiresAtSeason:6 }, bankBalance:456000 } };
const page = await browser.newPage({ viewport:{ width:480, height:1500 } });
await installCdnRoutes(page);
const errs=[]; page.on('pageerror', e=>errs.push(String(e.message).slice(0,120)));
await page.addInitScript((o)=>{ window.__CPM_GLB=false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-dark','1'); }, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:40000 });
await page.waitForFunction(()=>{ const r=document.getElementById('root'); return r && r.children.length>0; }, null, { timeout:60000 });
await sleep(1600);
try { await page.getByText('Continua',{exact:false}).first().click({timeout:2500}); } catch(e){}
await sleep(600);
try { await page.evaluate(()=>window.__CPM_CAREER && window.__CPM_CAREER.dismiss()); } catch(e){}
await sleep(500);
// dashboard
fs.writeFileSync(path.join(OUT,'darkmode-dashboard.png'), await page.screenshot({fullPage:false}));
// naviga: Carriera/Profilo (record pastello), Stagione (classifica/coppe)
const clickNav = async(re)=>{ try{ await page.evaluate((rs)=>{ const rx=new RegExp(rs,'i'); const el=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&rx.test(e.textContent||'')); if(el){ let t=el; for(let i=0;i<4&&t;i++){ if(t.onclick||t.getAttribute('role')==='button'){t.click();return;} t=t.parentElement; } el.click(); } }, re); }catch(e){} await sleep(700); };
await clickNav('Carriera'); fs.writeFileSync(path.join(OUT,'darkmode-carriera.png'), await page.screenshot({fullPage:false}));
await clickNav('Stagione'); await sleep(400); fs.writeFileSync(path.join(OUT,'darkmode-stagione.png'), await page.screenshot({fullPage:false}));
console.log('→ out/darkmode-*.png · pageerr', errs.length?errs.slice(0,3):0);
await browser.close(); srv.close();
