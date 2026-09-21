/* Renders a real coach card to prevent the NpcFaceCoach mobile crash from returning. */
import assert from 'node:assert/strict';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../visual/lib/harness.mjs';

const server=await startServer();
const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:412,height:915}});
const errors=[];
page.on('pageerror', error=>errors.push(error.message));
try {
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    localStorage.setItem('cpm-v3', JSON.stringify({phase:'career',player:{name:'Smoke Coach',nation:'Italia',avatarId:0,proStatus:'pro',season:2,week:5,age:21,ovr:74,club:{id:'mil',n:'AC Milanello',a:'ACM',p:82,c:'#dc2626',c2:'#111111',nat:'🇮🇹',lg:'Serie Alfa'},coach:{name:'Mister Bellandi',style:'Bilanciato',trustMod:0},stats:{velocità:74,tecnica:73,fisico:72,mentalità:73,tiro:74,passaggio:73,dribbling:74,posizionamento:73},form:70,morale:70,fatigue:10,popularity:40,value:10,bankBalance:50000,contract:{duration:3,wage:15000,expiresAtSeason:5}}}));
  });
  await page.goto(`http://localhost:${server.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'load',timeout:30000});
  await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,{timeout:40000});
  try { await page.getByText('CONTINUA',{exact:false}).first().click({timeout:8000}); } catch {}
  await page.waitForFunction(()=>!!(window.__CPM_CAREER&&window.__CPM_CAREER.goTab),{timeout:20000});
  await page.evaluate(()=>window.__CPM_CAREER.goTab('club'));
  await sleep(1000);
  const body=await page.locator('body').innerText();
  assert.doesNotMatch(body,/npcCoachAvOpts is not defined|ERRORE LiveMatch/i);
  assert.deepEqual(errors,[]);
  console.log('NPC COACH RUNTIME SMOKE PASS');
} finally { await browser.close(); server.close(); }
