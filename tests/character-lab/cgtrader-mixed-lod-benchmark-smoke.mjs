/* Validates the local-only CGTrader mixed LOD roster benchmark. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const evidence=path.join(here,'evidence');
const server=await startServer();
const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:412,height:915}});
const errors=[],requests=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{if(/cgtrader-review-lod[012]-kit-adapter\.glb/.test(response.url()))requests.push({status:response.status(),url:response.url()});});
try {
  await installCdnRoutes(page);
  await openMatch(page,server.address().port,{skipLoadAll:true,name:'CGTrader mixed LOD benchmark',query:{hyperCharacter:'cgtrader-mixed-lod-benchmark'}});
  await page.evaluate(()=>window.__CPM_LOAD_ALL&&window.__CPM_LOAD_ALL());
  await page.waitForFunction(()=>window.__CPM_HYPER_CASUAL_STATUS==='ready-cgtrader-mixed-lod-benchmark'||String(window.__CPM_HYPER_CASUAL_STATUS||'').startsWith('fallback:'),{timeout:90000});
  await sleep(2500);
  const report=await page.evaluate(()=>({status:window.__CPM_HYPER_CASUAL_STATUS,lodMix:window.__CPM_CGTRADER_LOD_MIX||null,lodAudit:window.__CPM_CGTRADER_LOD_AUDIT?window.__CPM_CGTRADER_LOD_AUDIT():null,lodTest:window.__CPM_CGTRADER_LOD_TEST?window.__CPM_CGTRADER_LOD_TEST():null,lineup:window.__CPM_HYPER_LINEUP||null,animations:window.__CPM_HYPER_ANIMATIONS||[],animation:window.__CPM_ANIM_AUDIT?window.__CPM_ANIM_AUDIT():null,render:window.__CPM_RINFO769?window.__CPM_RINFO769():null}));
  report.requests=requests;report.errors=errors;
  fs.mkdirSync(evidence,{recursive:true});
  fs.writeFileSync(path.join(evidence,'cgtrader-mixed-lod-benchmark-smoke.json'),JSON.stringify(report,null,2));
  await page.screenshot({path:path.join(evidence,'cgtrader-mixed-lod-benchmark-smoke.png')});
  assert.equal(report.status,'ready-cgtrader-mixed-lod-benchmark');
  assert.ok(report.lineup&&report.lineup.avatars===23&&report.lineup.hyper===23,'roster replacement incomplete');
  assert.ok(report.lodMix&&report.lodMix.lod0===1&&report.lodMix.lod1>0&&report.lodMix.lod2>0,'mixed LOD assignment missing');
  assert.equal(report.lodMix.lod0+report.lodMix.lod1+report.lodMix.lod2,23,'LOD assignment does not cover the full roster');
  assert.ok(report.lodAudit&&report.lodAudit.avatars===23&&report.lodAudit.variants===69,'all three safe-swap LOD variants must be present per avatar');
  assert.equal(report.lodAudit.active.lod0+report.lodAudit.active.lod1+report.lodAudit.active.lod2,23,'active LOD inventory does not cover the roster');
  assert.equal(report.lodAudit.active.lod0,1,'the Hero must remain on LOD0 during dynamic selection');
  assert.ok(report.lodTest&&report.lodTest.ok&&report.lodTest.atGestureStart==='lod0'&&report.lodTest.held,'technical LOD0 promotion or gesture lock failed');
  assert.ok(report.animation&&report.animation.avatars===23&&report.animation.mixers===23,'avatar mixer inventory incomplete');
  assert.equal(new Set(requests.filter(r=>r.status===200).map(r=>r.url.split('/').pop())).size,3,'not all LOD packages were fetched');
  for(const clip of ['idle','jog','pass','kick','header','dribble'])assert.ok(report.animations.includes(clip),`missing ${clip}`);
  assert.deepEqual(errors,[]);
  console.log('CGTRADER MIXED LOD BENCHMARK PASS');
  console.log(JSON.stringify(report,null,2));
} finally {await browser.close();server.close();}
