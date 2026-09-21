/* Exercises real dribble contacts through the local mixed-LOD renderer route.
   Each measured marker gets a fresh forced scene so a short authored clip cannot
   be missed by a slow software renderer between observer polls. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from '../visual/lib/harness.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const evidence=path.join(here,'evidence');
const server=await startServer();
const browser=await launchBrowser();
const context=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:1});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
try {
  await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_REC=true;});
  await openMatch(page,server.address().port,{name:'CGTrader mixed LOD dribble probe',query:{hyperCharacter:'cgtrader-mixed-lod-benchmark'}});
  await page.waitForFunction(()=>window.__CPM_HYPER_CASUAL_STATUS==='ready-cgtrader-mixed-lod-benchmark',{timeout:90000});
  /* Warm the renderer and settle the initial React match turn before measuring a forced technical scene. */
  await forceSituation(page,18,{settle:250,choose:false});
  await sleep(4000);
  const contactProbes=[];
  for(const expected of [{contact:'left',u:0.27},{contact:'right',u:0.36},{contact:'left',u:0.79}]){
    await page.evaluate(u=>{window.__CPM_CGTRADER_DRIBBLE_TEST_TIME=u;},expected.u);
    const forced=await forceSituation(page,18,{settle:250,choose:false});
    /* The roster holds 69 visuals: wait for the first useful frame after the React scene update. */
    await sleep(3000);
    const actual=await page.evaluate(()=>({
      state:window.__CPM_STATE?window.__CPM_STATE():null,
      probe:window.__CPM_PROBE?window.__CPM_PROBE():null,
      runtime:window.__CPM_GST||null,
      touch:window.__CPM_CGTRADER_DRIBBLE_TOUCH||null,
      lod:window.__CPM_CGTRADER_LOD_AUDIT?window.__CPM_CGTRADER_LOD_AUDIT():null,
      debug:window.__CPM_CGTRADER_MIXED_DRIBBLE_DEBUG||null
    }));
    contactProbes.push({expected,forced,actual});
  }
  await page.evaluate(()=>{delete window.__CPM_CGTRADER_DRIBBLE_TEST_TIME;});
  const report={status:await page.evaluate(()=>window.__CPM_HYPER_CASUAL_STATUS),animations:await page.evaluate(()=>window.__CPM_HYPER_ANIMATIONS||[]),contactProbes,errors};
  fs.mkdirSync(evidence,{recursive:true});
  fs.writeFileSync(path.join(evidence,'cgtrader-mixed-lod-dribble-probe.json'),JSON.stringify(report,null,2));
  assert.equal(report.status,'ready-cgtrader-mixed-lod-benchmark');
  assert.deepEqual(errors,[],`browser errors: ${errors.join(' | ')}`);
  assert.ok(report.animations.includes('dribble'),'dribble clip missing');
  assert.ok(contactProbes.every(({actual})=>actual.touch?.gesture==='dribble'&&actual.touch?.lod==='lod0'),'each contact must be emitted by the active Hero dribble clip at LOD0');
  assert.ok(contactProbes.every(({expected,actual})=>actual.touch?.contact===expected.contact&&Math.abs(actual.touch.u-expected.u)<0.002),'ball contact markers do not follow clip time');
  assert.ok(contactProbes.every(({actual})=>actual.lod?.active?.lod0===1),'Hero lost LOD0 during dribble');
  console.log('CGTRADER MIXED LOD DRIBBLE PROBE PASS');
} finally {await browser.close();server.close();}
