#!/usr/bin/env node
/* CRONACA: logico (drift tick) contro mesh (render-loop), stessa lettura, stesso pallone. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const p2 = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(p2); await p2.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(p2, port, { skipLoadAll: true, name: 'Cron' });
await p2.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 9100, policy: 'seeded', tickMs: 300 }));
const LEGGI = () => {
  const S = window.__CPM_STATE && window.__CPM_STATE(); if (!S || !S.ball) return null;
  const MP = window.__CPM_MP && window.__CPM_MP(); if (!MP) return null;
  const bx = S.ball.x, by = S.ball.y;
  const mesh = []; (S.players || []).forEach((p, i) => { if (p.gk || p.team !== 'home') return; mesh.push({ i, d: Math.hypot(p.x-bx,p.y-by), x:p.x, y:p.y }); });
  if (S.hero) mesh.push({ i:-1, d: Math.hypot(S.hero.x-bx,S.hero.y-by), x:S.hero.x, y:S.hero.y });
  const log = []; MP.forEach((q,i)=>{ if(!q||q.t!=='home'||q.gk) return; log.push({ i, d: Math.hypot(q.x-bx,q.y-by), x:q.x, y:q.y }); });
  const hT=S.heroTarget; if(hT&&hT.x!=null) log.push({i:-1,d:Math.hypot(hT.x-bx,hT.y-by),x:hT.x,y:hT.y});
  mesh.sort((a,c)=>a.d-c.d); log.sort((a,c)=>a.d-c.d);
  if (mesh.length<4||log.length<4) return null;
  const rep={DIF:[1,2,3,4],CEN:[5,6,7],ATT:[8,9]}; const R={};
  for(const [k,ix] of Object.entries(rep)){ const L=log.filter(z=>ix.includes(z.i)).map(z=>z.d), M=mesh.filter(z=>ix.includes(z.i)).map(z=>z.d);
    R['L'+k]=L.length?L.reduce((a,c)=>a+c,0)/L.length:null; R['M'+k]=M.length?M.reduce((a,c)=>a+c,0)/M.length:null; }
  const sc = log.filter(z=>z.i>=0).map(z=>{const m=mesh.find(w=>w.i===z.i);return m?Math.hypot(m.x-z.x,m.y-z.y):null;}).filter(Number.isFinite);
  return { ph:S.phase, Ld1:log[1].d, Md1:mesh[1].d, Ld2:log[2].d, Md2:mesh[2].d,
    Lvic:log.slice(1).filter(z=>z.d<=12).length, Mvic:mesh.slice(1).filter(z=>z.d<=12).length,
    scarto: sc.reduce((a,c)=>a+c,0)/sc.length, ...R };
};
const D=[]; const t0=Date.now();
while(Date.now()-t0<60000){ await sleep(400); const r=await p2.evaluate(LEGGI); if(r&&r.ph==='playing')D.push(r); }
srv.close(); await b.close();
const med=a=>{const s=a.filter(Number.isFinite).slice().sort((x,y)=>x-y);return s.length?s[Math.floor(s.length/2)]:NaN;};
console.log(`\n=== CRONACA — ${D.length} campioni ===`);
console.log(`  LOGICO (drift tick) 1º ${med(D.map(r=>r.Ld1)).toFixed(1)} m · 2º ${med(D.map(r=>r.Ld2)).toFixed(1)} m · entro 12 m ${med(D.map(r=>r.Lvic))} · vuote ${(100*D.filter(r=>r.Lvic===0).length/D.length).toFixed(0)}%`);
console.log(`  MESH   (render-loop) 1º ${med(D.map(r=>r.Md1)).toFixed(1)} m · 2º ${med(D.map(r=>r.Md2)).toFixed(1)} m · entro 12 m ${med(D.map(r=>r.Mvic))} · vuote ${(100*D.filter(r=>r.Mvic===0).length/D.length).toFixed(0)}%`);
console.log(`  scarto medio per uomo logico→mesh: ${med(D.map(r=>r.scarto)).toFixed(1)} m`);
for(const k of ['DIF','CEN','ATT']) console.log(`  ${k}: logico ${med(D.map(r=>r['L'+k])).toFixed(1)} m → mesh ${med(D.map(r=>r['M'+k])).toFixed(1)} m`);
