/* [7.991.0 Patrimonio F3] Sonda degli INVESTIMENTI.
   Misura: (1) UI: «Rischioso» vincola un quarto del saldo (arrotondato ai 10k) e lo toglie dal saldo; (2) fine
   stagione VERA: capitale + resa tornano sul saldo, riga nel log, storico; (3) determinismo fra due run; (4)
   distribuzione delle rese su 400 stagioni per profilo: dentro le bande e medie attese (+3,5% / +3% / +5%).
   CPM_ROSSO=1 → __CPM_NO_INVEST24: deve andare in rosso. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const pageErrs=[]; const fails=[]; const out={}; const F=(c,m)=>{ if(!c) fails.push(m); };
async function boot(extra){
  const page = await browser.newPage({ viewport:{ width:414, height:896 } });
  await installCdnRoutes(page); page.on('pageerror', e => pageErrs.push(String(e.message).slice(0,140)));
  await page.addInitScript(([rosso,extra]) => {
    window.__CPM_GLB = false; if (rosso) window.__CPM_NO_INVEST24 = true;
    const save = { phase:'career', player:{ name:'Test Uno', nation:'Italia', avatarId:0, proStatus:'pro',
      season:3, week:38, age:25, ovr:78, tutorialDone:true, hasAgent:true, bankBalance:1000000, popularity:40,
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
  await sleep(600); return page;
}
{ const page=await boot();
  await page.evaluate(()=>window.__CPM_CAREER.goTab('ufficio')); await sleep(900);
  const b0=await page.evaluate(()=>window.__CPM_CAREER.get().bank);
  await page.click('[data-cpm="invest24-rischioso"]').catch(()=>{}); await sleep(500);
  const P=await page.evaluate(()=>window.__CPM_CAREER.get());
  out.vincolo={tolti:b0-P.bank,iv:P.invest24};
  F(b0-P.bank===250000&&P.invest24&&P.invest24.amt===250000&&P.invest24.prof==='rischioso', `vincolo: ${JSON.stringify(out.vincolo)}`);
  await page.screenshot({ path:'/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad/investimenti24.png' });
  const dist=await page.evaluate(()=>{const C=window.__CPM_CAREER;const o={};for(const pr of ['prudente','bilanciato','rischioso']){let s=0,mn=9,mx=-9;for(let i=1;i<=400;i++){const r=C.investRate24({name:'Eroe '+i},i%20+1,pr);s+=r;mn=Math.min(mn,r);mx=Math.max(mx,r);}o[pr]={media:+(s/400*100).toFixed(2),min:+(mn*100).toFixed(1),max:+(mx*100).toFixed(1)};}return o;});
  out.distribuzione=dist;
  F(dist.prudente.min>=2&&dist.prudente.max<=5&&dist.rischioso.min>=-20&&dist.rischioso.max<=30, `bande violate ${JSON.stringify(dist)}`);
  F(Math.abs(dist.prudente.media-3.5)<0.5&&Math.abs(dist.bilanciato.media-3)<1.2&&Math.abs(dist.rischioso.media-5)<4, `medie lontane dall'atteso ${JSON.stringify(dist)}`);
  await page.close(); }
const run=async()=>{const page=await boot({bankBalance:750000,invest24:{prof:'bilanciato',amt:200000,s:3}});const r=await page.evaluate(async()=>{window.__CPM_CAREER.startNewSeason();for(let i=0;i<40&&window.__CPM_CAREER.get().season===3;i++)await new Promise(r=>setTimeout(r,250));const P=window.__CPM_CAREER.get();return{season:P.season,bank:P.bank,iv:P.invest24,hist:P.investHist24,log:(P.logTop||[]).filter(l=>/Investimento/.test(l))};});await page.close();return r;};
const r1=await run(), r2=await run(); out.fineStagione=r1;
const h=r1.hist&&r1.hist[0];
F(r1.season===4&&!r1.iv&&h&&h.amt===200000&&h.prof==='bilanciato'&&r1.log.length===1, `fine stagione: ${JSON.stringify(r1)}`);
F(h&&h.gain>=-8000&&h.gain<=20000, `resa bilanciato fuori banda: ${h&&h.gain}`);
F(JSON.stringify(r1.hist)===JSON.stringify(r2.hist), `determinismo: ${JSON.stringify(r1.hist)} vs ${JSON.stringify(r2.hist)}`);
out.pageErrs=pageErrs; console.log(JSON.stringify(out,null,1)); console.log('fails',JSON.stringify(fails,null,1));
await browser.close(); srv.close();
const ok=fails.length===0&&pageErrs.length===0; console.log(ok?'✅ PASS investimenti24':'❌ FAIL investimenti24'); process.exit(ok?0:1);
