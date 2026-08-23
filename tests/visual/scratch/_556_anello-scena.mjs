#!/usr/bin/env node
/* NELLA SCENA: i compagni stanno sull'ANELLO del tick di pressing (r.20815) o dove li ha messi lo staging?
   Anello dichiarato: raggio 11+(idx%4)*4 attorno all'EROE, sempre ALLE SPALLE (-|cos|).
   DIF: eroe-26, con tetto x<=55 (r.20801).                                                        */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(p); await p.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; });
await openMatch(p, port, { skipLoadAll: true, name: 'Anello' });
await p.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 5561, policy: 'seeded', tickMs: 300 }));
const LEGGI = () => {
  const S = window.__CPM_STATE && window.__CPM_STATE(); const MP = window.__CPM_MP && window.__CPM_MP();
  const ph = window.__CPM_PHASE && window.__CPM_PHASE();
  if (!S || !MP || !/^hl_/.test(ph||'')) return null;
  const h = S.heroTarget; if (h.x == null) return null;
  return { ph, hx:h.x, hy:h.y, bx:S.ball.x, by:S.ball.y,
    log: MP.map((q,i)=>q&&q.t==='home'&&!q.gk?{i,x:q.x,y:q.y}:null).filter(Boolean),
    mesh: S.players.map((q,i)=>q.team==='home'&&!q.gk?{i,x:q.x,y:q.y}:null).filter(Boolean) };
};
const D=[]; const t0=Date.now();
while(Date.now()-t0<110000){ await sleep(180); const r=await p.evaluate(LEGGI); if(r)D.push(r); }
srv.close(); await b.close();
const cl=(v,a,c)=>Math.max(a,Math.min(c,v));
const laneY=[38,62,50,26,74,44,56,32,68,50];
const med=a=>{const s=a.filter(Number.isFinite).slice().sort((x,y)=>x-y);return s.length?s[Math.floor(s.length/2)]:NaN;};
const dAnello=[],dLog=[],dMesh=[],raggioLog=[],raggioMesh=[];const perIdx={};
for(const s of D){
  for(const q of s.log){
    const i=q.i;
    let tx,ty;
    if(i>=1&&i<=4){ tx=cl(s.hx-26+((i%2)*4),6,55); ty=cl(laneY[i-1]*0.75+s.hy*0.25,3,97); }
    else { const a=i*0.9+1.2,r=11+(i%4)*4; tx=cl(s.hx-Math.abs(Math.cos(a))*r,3,85); ty=cl(s.hy+Math.sin(a)*r,3,97); }
    dAnello.push(Math.hypot(q.x-tx,q.y-ty));
    const _rr=Math.hypot(q.x-s.hx,q.y-s.hy);raggioLog.push(_rr);(perIdx[i]=perIdx[i]||[]).push(_rr);
    dLog.push(Math.hypot(q.x-s.bx,q.y-s.by));
  }
  for(const q of s.mesh){ raggioMesh.push(Math.hypot(q.x-s.hx,q.y-s.hy)); dMesh.push(Math.hypot(q.x-s.bx,q.y-s.by)); }
}
console.log(`\n=== NELLA SCENA — ${D.length} letture in fase hl_* ===`);
console.log(`  distanza del LOGICO dal bersaglio dichiarato dal tick di pressing (anello r.20815 / linea r.20801): mediana ${med(dAnello).toFixed(1)} m`);
console.log(`  raggio dall'eroe — logico ${med(raggioLog).toFixed(1)} m · mesh ${med(raggioMesh).toFixed(1)} m   (l'anello dichiarato parte da 11 m)`);
console.log(`  distanza dal pallone — logico ${med(dLog).toFixed(1)} m · mesh ${med(dMesh).toFixed(1)} m`);
const ANELLO={1:'DIF~26',2:'DIF~26',3:'DIF~26',4:'DIF~26',5:15,6:19,7:23,8:11,9:15};
for(const k of Object.keys(perIdx).sort())console.log(`   idx ${k}: raggio logico misurato ${med(perIdx[k]).toFixed(1)} m   ·  anello dichiarato ${ANELLO[k]}`);
const vicini=raggioLog.filter(v=>v<11).length;
console.log(`  compagni LOGICI entro 11 m dall'eroe: ${(100*vicini/raggioLog.length).toFixed(0)}%  (il modello non chiede MAI meno di 11 m, salvo il battitore)`);
