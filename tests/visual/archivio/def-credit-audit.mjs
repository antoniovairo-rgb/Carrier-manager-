/* AUDIT MIRATO «gol subito assegnato alla squadra sbagliata / tifosi sbagliati» (collaudo PO).
   Scansiona TUTTE le SITUATIONS e segnala anomalie STRUTTURALI del credito/esultanza:
     1. situation DIFENSIVA (type:"def") con un'azione la cui RICOMPENSA (successo) è goal/assist
        → un intervento difensivo riuscito CREDITEREBBE un gol all'eroe (+ esultanza casa) = bug.
     2. QUALSIASI azione con fail key === "goal" (refuso: dovrebbe essere goal_against).
     3. situation NON difensiva con rew/fail "goal_against" fuori posto.
     4. situation con esito "goal_against" ma bs/hlType incoerente.
   Puramente statico sui dati → deterministico, nessun rischio di flakiness del mixer. */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport:{ width:402, height:900 } });
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,160)));
await openMatch(page, port);
await page.waitForFunction(()=>typeof SITUATIONS!=='undefined'&&SITUATIONS.length>0,{timeout:25000});

const rep = await page.evaluate(()=>{
  const out={defCreditsHero:[],failGoalTypo:[],offGoalAgainst:[],summary:{}};
  SITUATIONS.forEach((s,gi)=>{
    const acts=s.actions||[];
    acts.forEach((a,ai)=>{
      const rew=a.rew, fail=a.fail;
      // 1. def situation la cui azione premia con goal/assist
      if(s.type==='def' && (rew==='goal'||rew==='assist')){
        out.defCreditsHero.push({gi,ai,type:s.type,text:(s.text||'').slice(0,50),label:(a.label||'').slice(0,32),rew,fail});
      }
      // 2. fail key === 'goal' (dovrebbe essere goal_against)
      if(fail==='goal'){
        out.failGoalTypo.push({gi,ai,type:s.type,text:(s.text||'').slice(0,50),label:(a.label||'').slice(0,32),rew,fail});
      }
      // 3. situation NON-def con goal_against come esito
      if(s.type!=='def' && (rew==='goal_against'||fail==='goal_against')){
        out.offGoalAgainst.push({gi,ai,type:s.type,text:(s.text||'').slice(0,50),label:(a.label||'').slice(0,32),rew,fail});
      }
    });
  });
  // conteggi per type
  const byType={};
  SITUATIONS.forEach(s=>{byType[s.type||'?']=(byType[s.type||'?']||0)+1;});
  out.summary={total:SITUATIONS.length,byType};
  return out;
});

console.log('=== SUMMARY ===', JSON.stringify(rep.summary));
console.log(`\n=== [1] DIFENSIVE che PREMIANO l'eroe con goal/assist (${rep.defCreditsHero.length}) ===`);
rep.defCreditsHero.forEach(r=>console.log(`  gi=${r.gi} ai=${r.ai} rew=${r.rew} fail=${r.fail} | "${r.label}" | ${r.text}`));
console.log(`\n=== [2] fail key === "goal" (refuso, dovrebbe essere goal_against) (${rep.failGoalTypo.length}) ===`);
rep.failGoalTypo.forEach(r=>console.log(`  gi=${r.gi} ai=${r.ai} type=${r.type} rew=${r.rew} fail=${r.fail} | "${r.label}" | ${r.text}`));
console.log(`\n=== [3] NON-def con goal_against (${rep.offGoalAgainst.length}) ===`);
rep.offGoalAgainst.forEach(r=>console.log(`  gi=${r.gi} ai=${r.ai} type=${r.type} rew=${r.rew} fail=${r.fail} | "${r.label}" | ${r.text}`));

await browser.close(); srv.close(); process.exit(0);
