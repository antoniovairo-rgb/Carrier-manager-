import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from '../visual/lib/harness.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const evidence=path.join(here,'evidence');
const server=await startServer();
const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:412,height:915}});
const errors=[]; page.on('pageerror',error=>errors.push(error.message));
try {
  await installCdnRoutes(page);
  await openMatch(page,server.address().port,{name:'CGTrader close-up review',query:{hyperCharacter:'cgtrader-mixed-lod-benchmark'}});
  await page.waitForFunction(()=>window.__CPM_HYPER_CASUAL_STATUS==='ready-cgtrader-mixed-lod-benchmark',{timeout:90000});
  await forceSituation(page,18,{settle:650,choose:false});
  const metrics=await page.evaluate(()=>{
    const sizeOf=node=>{const b=new THREE.Box3().setFromObject(node),s=new THREE.Vector3();b.getSize(s);return {x:s.x,y:s.y,z:s.z};};
    const ball=window.__CPM3D.ball, hero=window.__CPM3D.hero;
    return {ball:{size:sizeOf(ball),position:{...ball.position}},heroRoot:{size:sizeOf(hero),position:{...hero.position}},lod:window.__CPM_CGTRADER_LOD_AUDIT&&window.__CPM_CGTRADER_LOD_AUDIT()};
  });
  const camera=await page.evaluate(()=>{
    const p=window.__CPM3D.hero.position, ball=window.__CPM3D.ball;
    /* Preview-only: lateral portrait angle; ball is hidden solely to avoid covering the torso. */
    ball.visible=false;
    window.__CPM_CAM904={x:p.x+3.05,y:p.y+1.56,z:p.z+1.55,lx:p.x,ly:p.y+1.05,lz:p.z};
    return {hero:{x:p.x,y:p.y,z:p.z},camera:window.__CPM_CAM904,reviewOnly:{ballHidden:true,angle:'lateral'}};
  });
  await sleep(500);
  fs.mkdirSync(evidence,{recursive:true});
  await page.screenshot({path:path.join(evidence,'cgtrader-closeup-review.png')});
  const report={status:await page.evaluate(()=>window.__CPM_HYPER_CASUAL_STATUS),camera,metrics,errors};
  fs.writeFileSync(path.join(evidence,'cgtrader-closeup-review.json'),JSON.stringify(report,null,2));
  if(report.status!=='ready-cgtrader-mixed-lod-benchmark')throw new Error('CGTrader roster did not initialize');
  if(!report.metrics.lod.heights.every(sample=>sample.skeletonHeight>1.4&&sample.skeletonHeight<2.6))throw new Error('CGTrader skeleton scale is out of footballer range');
  if(errors.length)throw new Error(errors.join(' | '));
  console.log('CGTRADER CLOSEUP REVIEW PASS');
} finally { await browser.close(); server.close(); }