/* Probe regia CROSS (non-gate): trova le situation cross, forza la conclusione e MISURA
   se il ricevente/pallone restano in inquadratura + cattura frame della conclusione. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/cross-probe'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage({ viewport:{width:420,height:760} });
const errs=[]; page.on('pageerror',e=>errs.push(e.message));
await installCdnRoutes(page);
await page.addInitScript(()=>{ window.__CPM_GLB = true; });
const { total } = await openMatch(page, port);
console.log('situations',total,'GLB ON');
await sleep(2500);

// 1) find cross situations by intent
const crosses=[];
for(let gi=0; gi<total; gi++){
  await page.evaluate((g)=>{ window.__CPM_LOAD_ALL(); window.__CPM_FORCE_SIT(g, false, {x:80,y:50}); }, gi);
  await sleep(90);
  const it = await page.evaluate(()=>{ const s=window.__CPM_STATE&&window.__CPM_STATE(); return s&&s.sitSig&&s.sitSig.it; });
  if(String(it||'').toLowerCase().includes('cross')) crosses.push(gi);
}
console.log('cross intents:', crosses.slice(0,20).join(','), '· total', crosses.length);

// 2) for the first few crosses, resolve success and sample the conclusion framing
const pick = crosses.slice(0,4);
for(const gi of pick){
  await page.evaluate((g)=>{ window.__CPM_LOAD_ALL(); window.__CPM_FORCE_SIT(g, true, {x:82,y:38}); }, gi);
  await sleep(360);
  await page.evaluate(()=>{ window.__CPM_FORCE_OUTCOME='ok'; window.__CPM_RESOLVE(0); });
  // sample every 250ms across the conclusion
  const samples=[];
  for(let t=0;t<8;t++){
    await sleep(250);
    const s = await page.evaluate(()=>{ const st=window.__CPM_STATE&&window.__CPM_STATE(); if(!st)return null;
      const homeOn = st.players.filter(p=>p.team==='home'&&!p.gk&&p.onScreen).length;
      const homeTot = st.players.filter(p=>p.team==='home'&&!p.gk).length;
      // nearest home teammate to ball (the likely finisher) + its onScreen
      let best=null,bd=1e9; st.players.forEach(p=>{if(p.team==='home'&&!p.gk){const d=Math.hypot(p.x-st.ball.x,p.y-st.ball.y);if(d<bd){bd=d;best=p;}}});
      return { phase:st.phase, ballX:st.ball.x, ballY:st.ball.y, ballWY:st.ball.worldY, ballOn:st.ball.onScreen,
        heldBy:st.ball.heldBy, homeOn, homeTot, finisherOn: best&&best.onScreen, finisherDist:+bd.toFixed(1), finisherNdc: best&&best.ndc };
    });
    samples.push(s);
    if(t===2||t===4) await page.screenshot({ path: path.join(OUT, `cross-gi${gi}-t${t}.png`) });
  }
  console.log(`\n=== gi ${gi} ===`);
  samples.forEach((s,i)=>{ if(s) console.log(`  t${i} ph=${s.phase} ball(${s.ballX},${s.ballY},h${s.ballWY}) on=${s.ballOn} | finisher on=${s.finisherOn} d=${s.finisherDist} | homeOn ${s.homeOn}/${s.homeTot}`); });
}
console.log('\npageerrors', errs.length? errs.slice(0,4):'(none)');
await browser.close(); srv.close(); process.exit(0);
