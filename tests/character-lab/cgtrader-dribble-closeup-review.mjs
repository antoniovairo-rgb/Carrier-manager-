/* Review-only close-up of the real CGTrader dribble contacts. Does not alter the runtime. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from '../visual/lib/harness.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const evidence=path.join(here,'evidence','cgtrader-dribble-closeup-review');
const server=await startServer(); const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:412,height:915}}); const errors=[];
page.on('pageerror',e=>errors.push(e.message));
try {
  await installCdnRoutes(page);
  await page.addInitScript(()=>{window.__CPM_REC=true;});
  await openMatch(page,server.address().port,{name:'CGTrader dribble close-up review',query:{hyperCharacter:'cgtrader-mixed-lod-benchmark'}});
  await page.waitForFunction(()=>window.__CPM_HYPER_CASUAL_STATUS==='ready-cgtrader-mixed-lod-benchmark',{timeout:90000});
  await forceSituation(page,18,{settle:250,choose:false}); await sleep(3500);
  const rig=await page.evaluate(()=>window.__CPM_CGTRADER_CONTACT_AUDIT?window.__CPM_CGTRADER_CONTACT_AUDIT():null);
  const start=await page.evaluate(()=>{
    const p=window.__CPM3D.hero.position;
    window.__CPM_CAM904={x:p.x-3.55,y:p.y+1.55,z:p.z+3.05,lx:p.x,ly:p.y+0.82,lz:p.z+0.35};
    window.__CPM_CGTRADER_DRIBBLE_CONTACTS=[]; delete window.__CPM_CGTRADER_DRIBBLE_TOUCH; delete window.__CPM_CGTRADER_DRIBBLE_FROZEN;
    window.__CPM_CGTRADER_DRIBBLE_FREEZE_AT=0.270;
    window.__CPM_FORCE_SIT(18,false);
    return {hero:{x:p.x,y:p.y,z:p.z},camera:window.__CPM_CAM904};
  });
  fs.mkdirSync(evidence,{recursive:true});
  const steps=[{contact:'left',u:0.270},{contact:'right',u:0.370},{contact:'left',u:0.740}]; const frames=[];
  for(const step of steps){
    if(frames.length>0)await page.evaluate(target=>{window.__CPM_CGTRADER_DRIBBLE_FREEZE_AT=target;delete window.__CPM_CGTRADER_DRIBBLE_FROZEN;return window.__CPM_CGTRADER_DRIBBLE_CONTROL&&window.__CPM_CGTRADER_DRIBBLE_CONTROL('resume');},step.u);
    await page.waitForFunction(expected=>{const f=window.__CPM_CGTRADER_DRIBBLE_FROZEN;return !!f&&f.contact===expected.contact&&Math.abs(f.u-expected.u)<=0.035;},step,{timeout:10000});
    const frozen=await page.evaluate(()=>window.__CPM_CGTRADER_DRIBBLE_FROZEN);
    /* The animation is paused at the exact authored contact frame. */
    await page.evaluate(()=>{const p=window.__CPM3D.hero.position;window.__CPM_CAM904={x:p.x-3.55,y:p.y+1.55,z:p.z+3.05,lx:p.x,ly:p.y+0.82,lz:p.z+0.35};});
    const pose=await page.evaluate(()=>({hero:{...window.__CPM3D.hero.position},ball:{...window.__CPM3D.ball.position},audit:window.__CPM_CGTRADER_CONTACT_AUDIT?window.__CPM_CGTRADER_CONTACT_AUDIT():null}));
    const png=path.join(evidence,`contact-${String(frames.length+1).padStart(2,'0')}-${step.contact}.png`);
    await page.screenshot({path:png});
    const foot=step.contact==='left'?pose.audit&&pose.audit.left:pose.audit&&pose.audit.right; const footDistance=foot?+Math.hypot(pose.ball.x-foot.x,pose.ball.z-foot.z).toFixed(3):null;
    frames.push({contact:step.contact,u:frozen.u,lod:frozen.lod,anchor:frozen.anchor||null,pose,foot,footDistance,file:path.basename(png)});
  }
  const report={status:await page.evaluate(()=>window.__CPM_HYPER_CASUAL_STATUS),rig,start,frames,errors};
  fs.writeFileSync(path.join(evidence,'report.json'),JSON.stringify(report,null,2));
  assert.equal(report.status,'ready-cgtrader-mixed-lod-benchmark');
  assert.deepEqual(frames.map(f=>f.contact),['left','right','left'],'close-up did not capture the full dribble contact sequence');
  assert.ok(frames.every(f=>f.lod==='lod0'),'close-up contacts must render Hero at LOD0');
  assert.ok(frames.every(f=>f.anchor==='foot-bone'),'every captured touch must use the animated foot bone');
  assert.ok(frames.every(f=>f.footDistance!==null&&f.footDistance<=0.25),'the ball must remain within 25 cm of the active foot at each frozen contact');
  assert.deepEqual(errors,[]);
  console.log('CGTRADER DRIBBLE CLOSEUP REVIEW PASS');
} finally { await browser.close(); server.close(); }