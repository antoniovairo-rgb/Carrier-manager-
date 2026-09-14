#!/usr/bin/env node
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_FORCE_INTRO = 700; });
const { total } = await openMatch(page, port); await sleep(500);
const LEGGI = () => {
  const S = window.__CPM_STATE(); const MP = window.__CPM_MP();
  const F = window.__CPM_FOOTBALL_STATE ? window.__CPM_FOOTBALL_STATE() : null;
  return { ph:S.phase, ball:{x:S.ball.x,y:S.ball.y}, bt:S.ballTarget, ht:S.heroTarget,
    hero:{x:S.hero.x,y:S.hero.y},
    mesh: S.players.map((p,i)=>({i,t:p.team,gk:p.gk,x:p.x,y:p.y})).filter(p=>p.t==='home'),
    log: MP.map((q,i)=>q?{i,t:q.t,gk:q.gk,x:q.x,y:q.y}:null).filter(q=>q&&q.t==='home'),
    fs: F?{ah:F.attackingHome, ph:F.phase||null}:null };
};
const passo = Math.max(1, Math.floor(total/8));
for (let gi=0; gi<total; gi+=passo) {
  let ok=false; try{ok=await page.evaluate(g=>window.__CPM_FORCE_SIT(g,true),gi);}catch(e){}
  if(!ok)continue; await sleep(1100);
  const r = await page.evaluate(LEGGI);
  const bx=r.ball.x, by=r.ball.y;
  const d=(p)=>Math.hypot(p.x-bx,p.y-by).toFixed(1);
  console.log(`\ngi${gi} ${r.ph} palla(${bx},${by}) bt(${r.bt.x},${r.bt.y}) eroe(${r.hero.x},${r.hero.y}) fs=${JSON.stringify(r.fs)}`);
  console.log('  log :', r.log.filter(q=>!q.gk).map(q=>`${q.i}:(${q.x},${q.y})=${d(q)}`).join(' '));
  console.log('  mesh:', r.mesh.filter(q=>!q.gk).map(q=>`${q.i}:(${q.x},${q.y})=${d(q)}`).join(' '));
}
srv.close(); await b.close();
