/* TEST DAL VIVO ESAUSTIVO — TUTTE le 179 Situations × {successo, fallimento}, GLB-ON.
   Verifica per ogni risoluzione: (1) nessun page-error; (2) outcome presente + overlay NON vuoto;
   (3) semantica ok⟺key (successo↔goal/assist/save/recovery, fallimento↔miss/…); (4) M1: su un tiro
   fallito (key="miss") il testo overlay appartiene alla FAMIGLIA dell'esito granulare (outKind).
   Report di coverage + anomalie. Non-gate (collaudo). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out/live-full'); fs.mkdirSync(OUT, { recursive: true });

const MISS_OVL = {
  post:["Palo!","Traversa!","Ci è andato vicinissimo","A un passo dal gol"],
  saved:["Grande parata del portiere","Il portiere dice di no","Tentativo respinto","Conclusione centrale","Il gol sembrava fatto"],
  blocked:["Murato dalla difesa","Tentativo respinto","Conclusione murata"],
  wide:["Tiro fuori di poco","Non trova lo specchio","Che peccato!","Occasione mancata","Sfiora il vantaggio"],
};
const norm = k => !k ? null : k==='post'?'post':(['saved','save','corner'].includes(k)?'saved':(['blocked','intercepted','wall_blocked'].includes(k)?'blocked':(['wide','out','overhit','missed','deflected_out','shielded_out','lost','stopped'].includes(k)?'wide':null)));
const OK_KEYS = new Set(['goal','assist','save','recovery']);
const FAIL_KEYS = new Set(['miss','miss_easy','intercept','goal_against','nothing','through','foul','loose']);

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; });
const { total } = await openMatch(page, port);
console.log(`situations: ${total} · GLB ON · test ${total*2} risoluzioni`);
await sleep(2800);

const res = { checked:0, semanticFail:[], emptyOverlay:[], m1Checked:0, m1Fail:[], noOutcome:[], outKeys:{}, outKinds:{} };
async function resolveOne(gi, forceStr){
  await page.evaluate((g)=>{ window.__CPM_LOAD_ALL(); window.__CPM_FORCE_SIT(g,true,{x:78,y:50}); }, gi);
  await sleep(300);
  await page.evaluate((f)=>{ window.__CPM_FORCE_OUTCOME=f; window.__CPM_RESOLVE(0); }, forceStr);
  await sleep(430);
  const o = await page.evaluate(()=>window.__CPM_OUTCOME);
  res.checked++;
  if(!o){ res.noOutcome.push({gi,forceStr}); return; }
  res.outKeys[o.outKey]=(res.outKeys[o.outKey]||0)+1;
  if(o.outKind) res.outKinds[o.outKind]=(res.outKinds[o.outKind]||0)+1;
  if(!o.overlay || !String(o.overlay).trim()) res.emptyOverlay.push({gi,forceStr,outKey:o.outKey});
  // semantica ok⟺key
  if(o.ok===true && !OK_KEYS.has(o.outKey)) res.semanticFail.push({gi,forceStr,ok:o.ok,key:o.outKey});
  if(o.ok===false && !FAIL_KEYS.has(o.outKey)) res.semanticFail.push({gi,forceStr,ok:o.ok,key:o.outKey});
  // M1: miss con outKind mappato → overlay nella famiglia giusta
  if(o.outKey==='miss'){ const fam=norm(o.outKind); if(fam){ res.m1Checked++; if(!MISS_OVL[fam].includes(o.overlay)) res.m1Fail.push({gi,outKind:o.outKind,fam,overlay:o.overlay}); } }
}

const t0=Date.now();
for(let gi=0; gi<total; gi++){
  try{ await resolveOne(gi,'fail'); await resolveOne(gi,'success'); }
  catch(e){ res.noOutcome.push({gi,err:String(e).slice(0,60)}); }
  if((gi+1)%40===0) console.log(`  …${gi+1}/${total} (${Math.round((Date.now()-t0)/1000)}s)`);
}

// screenshot su un set VARIO (attacco/difesa/set-piece/dribbling)
for(const gi of [0,30,60,90,120,150,178].filter(g=>g<total)){
  await page.evaluate((g)=>{ window.__CPM_LOAD_ALL(); window.__CPM_FORCE_SIT(g,true,{x:80,y:50}); }, gi);
  await sleep(350); await page.evaluate(()=>window.__CPM_RESOLVE(0)); await sleep(850);
  await page.screenshot({ path: path.join(OUT, `hl-${String(gi).padStart(3,'0')}.png`) });
}

console.log(`\n=== REPORT ESAUSTIVO (${res.checked} risoluzioni su ${total} situations) ===`);
console.log(`pageerrors:        ${errs.length}`);
console.log(`outcome mancante:  ${res.noOutcome.length}`);
console.log(`overlay vuoto:     ${res.emptyOverlay.length}`);
console.log(`semantica ok⟺key:  ${res.semanticFail.length} fail`);
console.log(`M1 overlay⟺esito:  ${res.m1Checked} miss verificati · ${res.m1Fail.length} incoerenti`);
console.log(`outKeys visti:     ${JSON.stringify(res.outKeys)}`);
console.log(`outKinds visti:    ${JSON.stringify(res.outKinds)}`);
if(errs.length) console.log('ERRORI:', errs.slice(0,8));
for(const s of res.semanticFail.slice(0,10)) console.log('  ✗ SEMANTICA', JSON.stringify(s));
for(const s of res.emptyOverlay.slice(0,10)) console.log('  ✗ OVERLAY VUOTO', JSON.stringify(s));
for(const s of res.m1Fail.slice(0,10)) console.log('  ✗ M1', JSON.stringify(s));
for(const s of res.noOutcome.slice(0,10)) console.log('  ? NO-OUTCOME', JSON.stringify(s));
const pass = errs.length===0 && res.noOutcome.length===0 && res.emptyOverlay.length===0 && res.semanticFail.length===0 && res.m1Fail.length===0;
console.log(pass ? '\n✅ LIVE-FULL OK — tutte le situations coerenti' : '\n⚠️ ANOMALIE (vedi sopra)');
fs.writeFileSync(path.join(OUT,'report.json'), JSON.stringify({errs,...res},null,1));
await browser.close(); srv.close();
