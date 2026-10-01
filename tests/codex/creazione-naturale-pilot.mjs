#!/usr/bin/env node
// Pilota la creazione UI e i tre provini reali. Non inserisce valori nel salvataggio.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '../visual/node_modules/playwright/index.mjs';
import {startServer,installCdnRoutes,sleep} from '../visual/lib/harness.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const output=path.join(root,'tests/codex/creazione-naturale-pilot.json');
const screenshot=path.join(root,'reports/codex/creazione-naturale-pilot-stallo.png');
const seed=Number(process.env.CPM_SEED||30);
const command='node tests/codex/creazione-naturale-pilot.mjs';
const run={command,seed,startedAt:new Date().toISOString(),trials:[],errors:[]};
const save=()=>fs.writeFileSync(output,JSON.stringify(run,null,2));
const server=await startServer();let browser,context,page,memoryAbort=false;
const guard=setInterval(()=>{if(!memoryAbort&&os.freemem()<1.5*2**30){memoryAbort=true;browser?.close().catch(()=>{});}},250);
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CPM_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--headless=new','--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist','--renderer-process-limit=1','--disable-extensions','--disable-background-networking','--no-sandbox']});
  context=await browser.newContext({viewport:{width:360,height:640},deviceScaleFactor:1,serviceWorkers:'block'});
  page=await context.newPage();page.setDefaultTimeout(30000);
  page.on('pageerror',e=>run.errors.push(String(e.message)));
  await installCdnRoutes(page);
  await page.addInitScript(n=>{window.__CPM_GLB=false;window.__CPM_SIM_NAT=1;localStorage.setItem('cpm-match-speed','2');let x=(n+1)>>>0;Math.random=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};},seed);
  await page.goto(`http://localhost:${server.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'load',timeout:90000});
  await page.getByRole('button',{name:/Nuova carriera/i}).first().click();
  await page.getByPlaceholder('Es. Giovanni Pisano').fill(`QA Naturale ${seed}`);
  await page.getByRole('button',{name:/Inizia i provini/i}).click();
  run.create={name:`QA Naturale ${seed}`,source:'interfaccia; nessun attributo o ruolo iniettato'};save();
  for(let i=0;i<3;i++){
    const trial={number:i+1,phases:[],continued:0,startedAt:new Date().toISOString()};run.trials.push(trial);save();
    await page.getByRole('button',{name:/Inizia il provino/i}).click();
    await page.waitForFunction(()=>typeof window.__CPM_AUTOPLAY==='function',null,{timeout:60000});
    await page.evaluate(n=>window.__CPM_AUTOPLAY(true,{seed:n,policy:'seeded',tickMs:150}),seed*100+i);
    const t0=Date.now();let last='',lastLog=0;
    while(Date.now()-t0<180000){
      const phase=await page.evaluate(()=>window.__CPM_PHASE?.()||null).catch(()=>null);
      if(phase!==last||Date.now()-lastLog>10000){trial.phases.push({ms:Date.now()-t0,phase});console.log(JSON.stringify({trial:i+1,ms:Date.now()-t0,phase}));last=phase;lastLog=Date.now();save();}
      if(phase==='hl_result'){
        const b=page.getByRole('button',{name:'Continua',exact:true});
        if(await b.count()) {await b.last().click({timeout:3000}).catch(()=>{});trial.continued++;}
      }
      if(phase==='ended'){
        await page.getByRole('button',{name:/Risultati provino/i}).click();trial.ended=true;break;
      }
      await sleep(200);
    }
    trial.elapsedMs=Date.now()-t0;save();
    if(!trial.ended)throw Error(`Provino ${i+1} non concluso entro 180000 ms`);
    if(i<2)await page.getByRole('button',{name:new RegExp(`Vai al Provino ${i+2}`,'i')}).click();
  }
  await page.getByText('Offerte ricevute',{exact:false}).first().waitFor({timeout:30000});
  run.offersText=(await page.locator('body').innerText()).slice(0,1500);
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>!!window.__CPM_CAREER,null,{timeout:30000});
  run.career=await page.evaluate(()=>{const s=window.__CPM_CAREER.snapshot();return{name:s.name,age:s.age,season:s.season,week:s.week,position:s.position,ovr:s.ovr,stats:s.stats,club:s.club?.n,league:s.club?.lg};});
}catch(e){run.failure=String(e.stack||e);await page?.screenshot({path:screenshot}).catch(()=>{});run.failureScreenshot=path.relative(root,screenshot).replaceAll('\\','/');}
finally{clearInterval(guard);run.memoryAbort=memoryAbort;run.elapsedMs=Date.now()-Date.parse(run.startedAt);save();await context?.close().catch(()=>{});await browser?.close().catch(()=>{});server.closeAllConnections?.();server.close();console.log(JSON.stringify({elapsedMs:run.elapsedMs,career:run.career,failure:run.failure?.slice(0,300),memoryAbort}));}
