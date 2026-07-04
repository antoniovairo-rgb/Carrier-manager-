/* AUDIT 3D DI MASSA (GLB ON, come nel gioco reale) — invece della «caccia alle streghe» su singole situazioni,
   scansiona OGNI situation × OGNI azione e misura oggettivamente:
     - il GESTO dell'eroe parte? (GLB gName attivo durante l'esito, oppure escursione arti procedurale)
     - la palla si MUOVE? (spostamento world > soglia)
   Segnala tutte le combinazioni dove il gesto NON parte o la palla NON si muove → i bug reali, tutti insieme.
   Uso:  node hl-3d-audit.mjs            (tutte le situazioni)
         AUDIT_MAX=40 node hl-3d-audit.mjs  (prime 40, per un giro veloce) */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
import fs from 'fs';
const OUT='/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad';
const MAX=+(process.env.AUDIT_MAX||0)||0;
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport:{ width:402, height:900 } });
await installCdnRoutes(page);
const pageErrs=[]; page.on('pageerror', e => pageErrs.push(String(e.message).slice(0,120)));
await openMatch(page, port); // GLB ON di default
await page.waitForFunction(()=>typeof window.__CPM_GESTURE==='function'&&typeof window.__CPM_FORCE_SIT==='function',{timeout:25000});
// attendi il rig GLB (le clip caricano async); se non arriva, si prosegue (misura solo procedurale)
await page.waitForFunction(()=>{const g=window.__CPM_GESTURE&&window.__CPM_GESTURE();return g&&g.glb;},{timeout:20000}).catch(()=>console.log('WARN: GLB non pronto — misuro solo arti procedurali'));

const meta = await page.evaluate(()=>{
  const total=SITUATIONS.length;
  const rows=[];
  SITUATIONS.forEach((s,gi)=>{ (s.actions||[]).forEach((a,ai)=>{
    rows.push({gi,ai,text:(s.text||'').slice(0,42),act:(a.label||'').slice(0,34),stat:a.stat,rew:a.rew});
  }); });
  return {total, rows};
});
console.log(`AUDIT 3D — ${meta.total} situazioni · ${meta.rows.length} azioni · GLB ${(await page.evaluate(()=>{const g=window.__CPM_GESTURE();return !!(g&&g.glb);}))?'ON':'OFF'}`);

const list = MAX ? meta.rows.filter(r=>r.gi<MAX) : meta.rows;
const results=[];
for(let i=0;i<list.length;i++){
  const r=list[i];
  try{
    await page.evaluate(({gi})=>{ const sz=SITUATIONS[gi].startZone; const sx=(sz&&sz.x)?(sz.x[0]+sz.x[1])/2:70; const sy=(sz&&sz.y)?(sz.y[0]+sz.y[1])/2:50;
      window.__CPM_LOAD_ALL&&window.__CPM_LOAD_ALL(); window.__CPM_FORCE_SIT(gi,true,{x:Math.max(sx,60),y:sy}); }, {gi:r.gi});
    await sleep(650);
    const ball0=await page.evaluate(()=>{const p=window.__CPM_PROBE();return p&&p.ball&&p.ball.world;});
    await page.evaluate((k)=>{ window.__CPM_FORCE_OUTCOME='success'; window.__CPM_RESOLVE(k); }, r.ai);
    // [refined] finestra LUNGA (copre il build-up delle conclusioni) con EARLY-STOP appena il gesto GLB parte
    //   → immediate finiscono subito, solo shot/cross/header usano l'intera finestra. Segnale RELIABLE = solo GLB.
    let gNames=new Set(), maxGw=0, hlType=null, hlVariant=null, maxBall=0;
    for(let f=0;f<30;f++){
      const g=await page.evaluate(()=>window.__CPM_GESTURE());
      if(g){ hlType=hlType||g.hlType; hlVariant=hlVariant||g.hlVariant;
        if(g.glb){ if(g.glb.gName)gNames.add(g.glb.gName); if(g.glb.gw>maxGw)maxGw=g.glb.gw; } }
      const b=await page.evaluate(()=>{const p=window.__CPM_PROBE();return p&&p.ball&&p.ball.world;});
      if(b&&ball0){const dd=Math.hypot(b.x-ball0.x,b.z-ball0.z);if(dd>maxBall)maxBall=dd;}
      if(maxGw>0.35)break; // gesto GLB chiaramente partito → basta
      await sleep(90);
    }
    const ballMove=+maxBall.toFixed(1);
    const glbGesture=[...gNames].filter(n=>n).join(',')||null;
    const gestureFired = maxGw>0.2; // SOLO il gesto GLB VISIBILE (niente più mesh procedurale nascosto)
    const ballMoved = ballMove>2;
    results.push({...r, hlType, hlVariant, glbGesture, maxGw:+maxGw.toFixed(2), ballMove, gestureFired, ballMoved});
  }catch(e){ results.push({...r, error:String(e.message).slice(0,60)}); }
  if(i%40===0)console.log(`  …${i}/${list.length}`);
}

// ---- REPORT ----
const noGesture=results.filter(r=>!r.error&&!r.gestureFired);
const noBall=results.filter(r=>!r.error&&!r.ballMoved);
const errs=results.filter(r=>r.error);
// aggregato per hlType
const byType={};
results.forEach(r=>{ if(r.error)return; const t=r.hlType||'?'; byType[t]=byType[t]||{n:0,gest:0,ball:0}; byType[t].n++; if(r.gestureFired)byType[t].gest++; if(r.ballMoved)byType[t].ball++; });

console.log('\n=== AGGREGATO per hlType (gesto/palla su totale) ===');
Object.entries(byType).sort((a,b)=>b[1].n-a[1].n).forEach(([t,v])=>console.log(`  ${t.padEnd(9)} n=${String(v.n).padStart(3)} · gesto ${v.gest}/${v.n} · palla ${v.ball}/${v.n}`));

console.log(`\n=== ⚠️ AZIONI SENZA GESTO EROE (${noGesture.length}) ===`);
noGesture.slice(0,60).forEach(r=>console.log(`  gi=${String(r.gi).padStart(3)} [${(r.hlType||'?').padEnd(8)}] "${r.act}"  (glb=${r.glbGesture||'—'} gw=${r.maxGw} limb=${r.limbMax})  — ${r.text}`));
if(noGesture.length>60)console.log(`  … +${noGesture.length-60} altre`);

console.log(`\n=== ⚠️ AZIONI SENZA MOTO PALLA (${noBall.length}) ===`);
noBall.slice(0,40).forEach(r=>console.log(`  gi=${String(r.gi).padStart(3)} [${(r.hlType||'?').padEnd(8)}] "${r.act}" (Δpalla=${r.ballMove})  — ${r.text}`));
if(noBall.length>40)console.log(`  … +${noBall.length-40} altre`);

if(errs.length)console.log(`\n=== ERRORI (${errs.length}) ===\n`+errs.slice(0,10).map(r=>`  gi=${r.gi} ${r.error}`).join('\n'));
console.log(`\npageerror: ${pageErrs.length}`);
fs.writeFileSync(`${OUT}/hl-3d-audit.json`, JSON.stringify({byType,noGesture,noBall,errs,pageErrs,total:results.length},null,1));
console.log(`\nreport → ${OUT}/hl-3d-audit.json`);
await browser.close(); srv.close(); process.exit(0);
