/* AUDIT DAL VIVO «gol assegnato alla squadra giusta?» — la caccia-alle-streghe LIVE (collaudo PO).
   Per OGNI situazione × OGNI azione risolve SUCCESS e FAIL sugli handler VERI (__CPM_FORCE_SIT + __CPM_RESOLVE),
   legge dal bus timeline (__CPM_TIMELINE → ActionResolved) la CHIAVE d'esito REALE (post-remap chance/deflect/…)
   e ne classifica il LATO ACCREDITATO:
     • goal / assist  → CASA (squadra dell'eroe) segna  → esultanza lato-casa
     • goal_against   → OSPITE segna (gol subito)        → esultanza lato-avversario
     • altri          → nessun credito al tabellone
   FLAG (bug del tipo segnalato dal PO):
     [A] situazione DIFENSIVA (type:def) il cui SUCCESS accredita CASA (goal/assist) → "rete all'eroe" in un HL difensivo
     [B] situazione OFFENSIVA il cui esito accredita l'OSPITE su un SUCCESS (assurdo)
     [C] chiave d'esito sconosciuta / non classificabile
   Copre i remap runtime (chance/deflect/dribbling-duel) che l'audit statico non vede. */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } from './lib/harness.mjs';
import fs from 'fs';
const OUT='/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport:{ width:402, height:900 } });
await installCdnRoutes(page);
const pageErrs=[]; page.on('pageerror', e => pageErrs.push(String(e.message).slice(0,120)));
await openMatch(page, port);
await page.waitForFunction(()=>typeof window.__CPM_FORCE_SIT==='function'&&typeof window.__CPM_RESOLVE==='function'&&typeof window.__CPM_TIMELINE==='function',{timeout:25000});

const meta = await page.evaluate(()=>SITUATIONS.map((s,gi)=>({gi,type:s.type||'?',text:(s.text||'').slice(0,44),nact:(s.actions||[]).length})));
console.log(`AUDIT CREDITO LIVE — ${meta.length} situazioni · ${meta.reduce((a,b)=>a+b.nact,0)} azioni × 2 esiti`);

const HERO=new Set(['goal','assist']);       // accredita CASA
const OPP =new Set(['goal_against']);         // accredita OSPITE
// chiavi note d'esito (successo+fallimento) → tutto il resto va segnalato come sconosciuto
const KNOWN=new Set(['goal','assist','recovery','save','chance','intercept','miss','miss_easy','goal_against','through','foul','nothing','win_freekick','corner','block','beaten','offside','deflect','dispossessed','lost','stopped']);

async function resolveOnce(gi,ai,outcome){
  await page.evaluate(({gi})=>{ const sz=SITUATIONS[gi].startZone; const sx=(sz&&sz.x)?(sz.x[0]+sz.x[1])/2:70; const sy=(sz&&sz.y)?(sz.y[0]+sz.y[1])/2:50;
    window.__CPM_TIMELINE_RESET&&window.__CPM_TIMELINE_RESET(); window.__CPM_FORCE_SIT(gi,true,{x:Math.max(sx,60),y:sy}); }, {gi});
  await sleep(70);
  await page.evaluate(({ai,outcome})=>{ window.__CPM_FORCE_OUTCOME=outcome; window.__CPM_RESOLVE(ai); }, {ai,outcome});
  await sleep(70);
  const tl=await page.evaluate(()=>window.__CPM_TIMELINE());
  const ar=[...tl].reverse().find(e=>e.type==='ActionResolved');
  return ar?{ok:ar.ok,key:ar.key,intent:ar.intent,hlType:ar.hlType}:null;
}

const flags={A:[],B:[],C:[]}; let n=0;
for(const m of meta){
  for(let ai=0; ai<m.nact; ai++){
    for(const oc of ['success','fail']){
      let r=null; try{ r=await resolveOnce(m.gi,ai,oc); }catch(e){ r={key:'__err:'+String(e.message).slice(0,40)}; }
      n++;
      if(!r||!r.key){ continue; }
      const key=r.key; const creditsHero=HERO.has(key); const creditsOpp=OPP.has(key);
      // [A] difensiva che accredita l'eroe su questo esito
      if(m.type==='def' && creditsHero){ flags.A.push({gi:m.gi,ai,oc,key,type:m.type,text:m.text}); }
      // [B] offensiva che accredita l'ospite su un successo
      if(m.type!=='def' && creditsOpp && r.ok){ flags.B.push({gi:m.gi,ai,oc,key,type:m.type,text:m.text}); }
      // [C] chiave sconosciuta
      if(!KNOWN.has(key) && !String(key).startsWith('__err')){ flags.C.push({gi:m.gi,ai,oc,key,type:m.type,text:m.text}); }
    }
  }
  if(m.gi%30===0)console.log(`  …${m.gi}/${meta.length}`);
}

console.log(`\n=== [A] DIFENSIVE che accreditano l'EROE (gol/assist in un HL difensivo) — ${flags.A.length} ===`);
flags.A.forEach(f=>console.log(`  gi=${f.gi} ai=${f.ai} [${f.oc}] key=${f.key} | ${f.text}`));
console.log(`\n=== [B] OFFENSIVE che accreditano l'OSPITE su un successo — ${flags.B.length} ===`);
flags.B.forEach(f=>console.log(`  gi=${f.gi} ai=${f.ai} [${f.oc}] key=${f.key} | ${f.text}`));
console.log(`\n=== [C] chiavi d'esito SCONOSCIUTE — ${flags.C.length} ===`);
[...new Set(flags.C.map(f=>f.key))].forEach(k=>console.log(`  key="${k}" ×${flags.C.filter(f=>f.key===k).length} (es. gi=${flags.C.find(f=>f.key===k).gi})`));
console.log(`\nrisolti: ${n} · pageerror: ${pageErrs.length}${pageErrs.length?' → '+pageErrs.slice(0,3).join(' | '):''}`);
const verdict=(flags.A.length===0&&flags.B.length===0)?'✅ PASS — nessun credito sul lato sbagliato':'❌ ANOMALIE TROVATE';
console.log(`\n${verdict}`);
fs.writeFileSync(`${OUT}/credit-live-audit.json`,JSON.stringify({flags,resolved:n,pageErrs},null,1));
await browser.close(); srv.close(); process.exit(0);
