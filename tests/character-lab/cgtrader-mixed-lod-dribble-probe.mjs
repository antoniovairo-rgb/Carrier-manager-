/* Exercises the real CGTrader dribble contacts through the local mixed-LOD renderer route.
   The probe observes one complete body clip: it never injects synthetic clip time. */
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
  await forceSituation(page,18,{settle:250,choose:false});
  await sleep(3500);
  /* Start observation and scene activation in the same browser task: the first left-foot event
     can otherwise occur during a harness settle delay and produce a false negative. */
  const forced=await page.evaluate(()=>{
    window.__CPM_CGTRADER_DRIBBLE_CONTACTS=[];
    delete window.__CPM_CGTRADER_DRIBBLE_TOUCH;
    window.__CPM_FORCE_SIT(18,false);
    return window.__CPM_STATE?window.__CPM_STATE():null;
  });
  let observed=[];
  for(let poll=0;poll<120;poll++){
    await sleep(25);
    observed=await page.evaluate(()=>window.__CPM_CGTRADER_DRIBBLE_CONTACTS||[]);
    if(observed.filter(x=>x.contact==='left').length>=2&&observed.some(x=>x.contact==='right'))break;
  }
  await page.screenshot({path:path.join(evidence,'cgtrader-mixed-lod-dribble-sequence.png')});
  await page.waitForFunction(()=>window.__CPM_STATE&&window.__CPM_STATE().phase==='hl_choose',{timeout:5000});
  const preResolve=await page.evaluate(()=>window.__CPM_STATE?window.__CPM_STATE():null);
  const resolved=await page.evaluate(()=>{window.__CPM_FORCE_OUTCOME='success';return !!(window.__CPM_RESOLVE&&window.__CPM_RESOLVE(0));});
  const transitionSamples=[];
  for(let i=0;i<12;i++){await sleep(250);transitionSamples.push(await page.evaluate(()=>({state:window.__CPM_STATE?window.__CPM_STATE():null,lod:window.__CPM_CGTRADER_LOD_AUDIT?window.__CPM_CGTRADER_LOD_AUDIT():null})));}
  const report={status:await page.evaluate(()=>window.__CPM_HYPER_CASUAL_STATUS),forced,preResolve,resolved,contacts:observed,transitionSamples,errors};
  fs.mkdirSync(evidence,{recursive:true});
  fs.writeFileSync(path.join(evidence,'cgtrader-mixed-lod-dribble-probe.json'),JSON.stringify(report,null,2));
  assert.equal(report.status,'ready-cgtrader-mixed-lod-benchmark');
  assert.deepEqual(errors,[],`browser errors: ${errors.join(' | ')}`);
  assert.equal(resolved,true,'dribble action did not accept resolution from hl_choose');
  const touches=observed.filter(x=>x.contact==='left'||x.contact==='right');
  assert.deepEqual(touches.map(x=>x.contact),['left','right','left'],'the authored left-right-left contact order is incomplete');
  assert.ok(Math.abs(touches[0].u-0.27)<0.06&&Math.abs(touches[1].u-0.36)<0.08&&Math.abs(touches[2].u-0.79)<0.10,'contact moments do not match the authored clip');
  assert.ok(touches.every(x=>x.gesture==='dribble'&&x.lod==='lod0'),'each authored touch must be made by the Hero dribble clip at LOD0');
  assert.ok(report.transitionSamples.some(sample=>sample.state?.phase==='hl_result'),'dribble did not transition into the result phase');
  assert.ok(report.transitionSamples.every(sample=>sample.lod?.heroLod==='lod0'),'Hero lost LOD0 during the post-dribble transition');
  console.log('CGTRADER MIXED LOD DRIBBLE PROBE PASS');
} finally {await browser.close();server.close();}
