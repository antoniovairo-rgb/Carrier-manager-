#!/usr/bin/env node
/* CHI VINCE fra i due driver posizionali della CRONACA:
   A3 = «Formation drift during playing phase» r.20831, ogni 300 ms, scala fissa homeDepth-4/+12/+26
   A4 = «Formation micro-drift» r.21929, ogni 3 tick, slot DRIFT_PRESETS traslato col pallone, guadagno 0,04
   Per ogni uomo si calcola la distanza dal bersaglio di A3 e da quello di A4: vince chi lo tiene piu' vicino. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(p); await p.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; });
await openMatch(p, port, { skipLoadAll: true, name: 'Chi' });
await p.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 5561, policy: 'seeded', tickMs: 300 }));
const LEGGI = () => {
  const S = window.__CPM_STATE && window.__CPM_STATE(); const MP = window.__CPM_MP && window.__CPM_MP();
  const ph = window.__CPM_PHASE && window.__CPM_PHASE();
  if (!S || !MP || ph !== 'playing') return null;
  const bt = S.ballTarget; if (bt.x == null) return null;
  return { bx: bt.x, by: bt.y, log: MP.map((q,i)=>q&&q.t==='home'&&!q.gk?{i,x:q.x,y:q.y}:null).filter(Boolean) };
};
const D=[]; const t0=Date.now();
while(Date.now()-t0<50000){ await sleep(350); const r=await p.evaluate(LEGGI); if(r)D.push(r); }
srv.close(); await b.close();
const cl=(v,a,c)=>Math.max(a,Math.min(c,v));
const LN_B=[24,42,58,76],LN_M=[30,50,70],LN_F=[26,50,74];
const MIDF=[{x:5,y:50},{x:22,y:18},{x:22,y:38},{x:22,y:62},{x:22,y:82},{x:44,y:25},{x:44,y:50},{x:44,y:75},{x:57,y:30},{x:57,y:70}];
const med=a=>{const s=a.filter(Number.isFinite).slice().sort((x,y)=>x-y);return s.length?s[Math.floor(s.length/2)]:NaN;};
const rA3=[],rA4=[]; const perLinea={DIF:[],CEN:[],ATT:[]};
for(const s of D){
  for(const poss of [50]){
    const hd=cl(38+(poss-50)*0.3+(s.bx-50)*0.18,8,55), bSh=s.by-50, cH=1.02;
    const lane=(a,k)=>cl(50+(a-50)*cH+bSh*k,6,94);
    for(const q of s.log){
      const hi=q.i;
      let tx,ty;
      if(hi<=4){tx=hd-4;ty=lane(LN_B[hi-1],0.34);}
      else if(hi<=7){tx=hd+12;ty=lane(LN_M[hi-5],0.34);}
      else{tx=hd+26;ty=lane(LN_F[hi-8],0.18);}
      const sl=MIDF[Math.min(hi,9)];
      const av=cl(s.bx-50,-46,46);
      const sx=cl(sl.x+av*0.62,4,96), sy=cl(sl.y+(s.by-50)*0.28,4,96);
      const dA3=Math.hypot(q.x-tx,q.y-ty), dA4=Math.hypot(q.x-sx,q.y-sy);
      rA3.push(dA3); rA4.push(dA4);
      const L=hi<=4?'DIF':hi<=7?'CEN':'ATT';
      perLinea[L].push({x:q.x,tx,sx});
    }
  }
}
console.log(`\n=== CHI VINCE IN CRONACA — ${D.length} letture · ${rA3.length} uomini-lettura ===`);
console.log(`  distanza dal bersaglio di A3 (scala fissa r.20831): mediana ${med(rA3).toFixed(1)} m`);
console.log(`  distanza dal bersaglio di A4 (preset tattico r.21929): mediana ${med(rA4).toFixed(1)} m`);
console.log(`  l'uomo sta piu' vicino al bersaglio di A3 nel ${(100*rA3.filter((v,i)=>v<rA4[i]).length/rA3.length).toFixed(0)}% dei casi`);
for(const [L,v] of Object.entries(perLinea))
  console.log(`  ${L}: x reale ${med(v.map(o=>o.x)).toFixed(1)} · bersaglio A3 ${med(v.map(o=>o.tx)).toFixed(1)} · bersaglio A4 (preset) ${med(v.map(o=>o.sx)).toFixed(1)}`);
