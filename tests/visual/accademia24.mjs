/* [7.990.0 Patrimonio F2] Sonda dell'ACCADEMIA COL TUO NOME.
   Misura: (1) UI Agente: FONDA scala il costo di fondazione e porta lo stato ad «attiva»; (2) economia: la gestione
   settimanale si paga, a fondi finiti l'accademia va in pausa da sola; (3) fine stagione VERA (startNewSeason):
   esce un ragazzo, popolarita' +2/+4, riga nel log; (4) determinismo: due fine stagione dallo stesso save danno lo
   stesso ragazzo; (5) in pausa nessun ragazzo. CPM_ROSSO=1 → __CPM_NO_ACCADEMIA24: deve andare in rosso. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const pageErrs=[]; const fails=[]; const out={};
const F=(c,m)=>{ if(!c) fails.push(m); };
async function boot(extra){
  const page = await browser.newPage({ viewport:{ width:414, height:896 } });
  await installCdnRoutes(page); page.on('pageerror', e => pageErrs.push(String(e.message).slice(0,140)));
  await page.addInitScript(([rosso,extra]) => {
    window.__CPM_GLB = false; if (rosso) window.__CPM_NO_ACCADEMIA24 = true;
    const save = { phase:'career', player:{ name:'Test Uno', nation:'Italia', avatarId:0, proStatus:'pro',
      season:3, week:38, age:25, ovr:78, tutorialDone:true, hasAgent:true, bankBalance:900000, popularity:40,
      club:{ id:'juve', n:'Torino Athletic', a:'TAT', p:88, c:'#111', c2:'#fff', nat:'🇮🇹', lg:'Lega A' },
      stats:{ 'velocità':78, tecnica:78, fisico:78, 'mentalità':78, tiro:78, passaggio:78, dribbling:78, posizionamento:78 },
      calendar:[], standings:[], matchHistory:[], worldMemory:[],
      contract:{ duration:3, wage:40000, expiresAtSeason:6 }, log:[], ...extra } };
    localStorage.setItem('cpm-v3', JSON.stringify(save));
  }, [ROSSO, extra||{}]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil:'load', timeout:30000 });
  await page.waitForFunction(()=>{const r=document.getElementById('root');return r&&r.children.length>0;},{timeout:40000});
  await sleep(1500);
  try{ await page.getByText('Continua',{exact:false}).first().click({timeout:5000}); }catch(e){}
  await page.waitForFunction(()=>!!window.__CPM_CAREER&&typeof window.__CPM_CAREER.startNewSeason==='function',{timeout:15000}).catch(()=>{});
  await sleep(600);
  return page;
}
// (1) UI
{ const page=await boot();
  await page.evaluate(()=>window.__CPM_CAREER.goTab('agente')); await sleep(900);
  const b0=await page.evaluate(()=>window.__CPM_CAREER.get().bank);
  const st0=await page.getAttribute('[data-cpm="accademia24"]','data-stato').catch(()=>null);
  await page.click('[data-cpm="accademia24-fonda"]').catch(()=>{}); await sleep(500);
  const P=await page.evaluate(()=>window.__CPM_CAREER.get());
  out.fondazione={prima:st0,dopo:P.academy24&&(P.academy24.paused?'pausa':'attiva'),costo:b0-P.bank};
  F(st0==='assente'&&P.academy24&&!P.academy24.paused&&b0-P.bank===320000, `fondazione: ${JSON.stringify(out.fondazione)} (atteso 320000 = 8 stipendi)`);
  await page.screenshot({ path:'/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/accademia24.png' });
  // (2) economia
  const eco=await page.evaluate(()=>{const C=window.__CPM_CAREER;const pro=(o)=>({proStatus:'pro',contractExpired:false,contract:{wage:40000},bankBalance:0,hasAgent:false,...o});
    const a={name:'Accademia Uno',founded:1,grads:[],tot:0,paused:false};
    return {conAcc:C.weeklyEconomyFields(pro({academy24:a})).bankBalance,inPausa:C.weeklyEconomyFields(pro({academy24:{...a,paused:true}})).bankBalance,
      rotto:C.weeklyEconomyFields(pro({academy24:a,contract:{wage:100},bankBalance:-5000})).academy24};});
  out.economia=eco;
  F(eco.conAcc===40000-800&&eco.inPausa===40000, `gestione settimanale: ${JSON.stringify(eco)} (atteso 39200 / 40000)`);
  F(eco.rotto&&eco.rotto.paused===true, `a fondi finiti l'accademia deve andare in pausa`);
  await page.close(); }
// (3)(4) fine stagione vera, due volte dallo stesso save
const acc={name:'Accademia Uno',founded:1,grads:[],tot:0,paused:false};
const run=async(extra)=>{const page=await boot(extra);const r=await page.evaluate(async()=>{const C=window.__CPM_CAREER;const e=C.startNewSeason();for(let i=0;i<40&&window.__CPM_CAREER.get().season===3;i++)await new Promise(r=>setTimeout(r,250));const P=window.__CPM_CAREER.get();return{e,season:P.season,pop:P.popularity,acc:P.academy24,log:(P.logTop||[]).filter(l=>/🏫/.test(l))};});await page.close();return r;};
const r1=await run({academy24:acc}), r2=await run({academy24:acc}), rp=await run({academy24:{...acc,paused:true}});
out.stagione1=r1; out.pausa={tot:rp.acc&&rp.acc.tot,log:rp.log};
const g1=r1.acc&&r1.acc.grads&&r1.acc.grads[0], g2=r2.acc&&r2.acc.grads&&r2.acc.grads[0];
F(r1.season===4&&r1.acc&&r1.acc.tot===1&&g1&&g1.s===3&&g1.r>=55&&g1.r<=77, `fine stagione: nessun ragazzo o dati errati ${JSON.stringify(r1.acc)}`);
F(r1.log.length===1, `fine stagione: manca la riga nel log`);
F(g1&&g2&&JSON.stringify(g1)===JSON.stringify(g2), `determinismo: ${JSON.stringify(g1)} vs ${JSON.stringify(g2)}`);
F(rp.acc&&(rp.acc.tot|0)===0&&rp.log.length===0, `in pausa non deve uscire nessuno`);
out.pageErrs=pageErrs;
console.log(JSON.stringify(out,null,1)); console.log('fails',JSON.stringify(fails,null,1));
await browser.close(); srv.close();
const ok=fails.length===0&&pageErrs.length===0; console.log(ok?'✅ PASS accademia24':'❌ FAIL accademia24'); process.exit(ok?0:1);
