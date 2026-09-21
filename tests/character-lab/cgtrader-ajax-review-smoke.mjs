/* Technical route smoke for the isolated animated CGTrader Ajax-kit GLB. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from '../visual/lib/harness.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const evidence=path.join(here,'evidence','cgtrader-ajax-review');
const server=await startServer();
const browser=await launchBrowser();
const context=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:1});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
try {
  await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_REC=true;});
  await openMatch(page,server.address().port,{name:'CGTrader Ajax review',query:{hyperCharacter:'cgtrader-ajax-review'}});
  await page.waitForFunction(()=>window.__CPM_HYPER_CASUAL_STATUS==='ready-cgtrader-ajax-review',{timeout:90000});
  await forceSituation(page,18,{settle:300,choose:false});
  await sleep(950);
  const report=await page.evaluate(()=>({
    status:window.__CPM_HYPER_CASUAL_STATUS,
    animations:window.__CPM_HYPER_ANIMATIONS||[],
    gestures:window.__CPM_CGTRADER_REVIEW_GESTURES||{},
    metrics:window.__CPM_CGTRADER_REVIEW_METRICS||null,
    state:window.__CPM_STATE?window.__CPM_STATE():null,
    contacts:window.__CPM_CGTRADER_DRIBBLE_CONTACTS||[],
  }));
  fs.mkdirSync(evidence,{recursive:true});
  await page.screenshot({path:path.join(evidence,'highlight-mobile.png')});
  fs.writeFileSync(path.join(evidence,'report.json'),JSON.stringify({report,errors},null,2));
  assert.equal(report.status,'ready-cgtrader-ajax-review');
  assert.deepEqual(errors,[],`browser errors: ${errors.join(' | ')}`);
  for(const clip of ['idle','dribble','pass','kick']) assert.ok(report.animations.includes(clip),`missing ${clip}`);
  assert.equal(report.gestures.dribble,true,'dribble gesture missing');
  assert.ok(report.metrics?.skeletonHeight>0.5,'CGTrader skeleton was not measured');
  console.log('CGTRADER AJAX REVIEW SMOKE PASS');
} finally {await browser.close();server.close();}