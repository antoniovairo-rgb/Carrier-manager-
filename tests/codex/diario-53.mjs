import fs from 'node:fs';
import path from 'node:path';
import {chromium} from '../visual/node_modules/playwright/index.mjs';
import {startServer,installCdnRoutes} from '../visual/lib/harness.mjs';
const ROOT=path.resolve(import.meta.dirname,'../..');
const out=path.join(ROOT,'tests/codex/diario-53-results.json');
const diary=Array.from({length:8},(_,i)=>({season:i+1,week:1,type:'story',headline:`Voce QA stagione ${i+1}`,body:`Evento stagione ${i+1}`}));
const names=['Mister Alfa','Mister Alfa','Mister Alfa','Mister Beta','Mister Beta','Mister Gamma','Mister Gamma','Mister Gamma'];
const coachHistory=names.map((name,i)=>({name,style:'Bilanciato',season:i+1,goals:1,assists:0,coachTrust:60}));
const player={name:'QA Diario 53',nation:'Italia',avatarId:0,proStatus:'pro',season:9,week:1,age:24,ovr:75,tutorialDone:true,club:{id:'sal',n:'FC Salernum',a:'SAL',p:70,c:'#6c1f2e',c2:'#f5f5f5',nat:'🇮🇹',lg:'Lega B'},stats:{'velocità':75,tecnica:75,fisico:75,'mentalità':75,tiro:75,passaggio:75,dribbling:75,posizionamento:75},form:70,fatigue:0,morale:70,contract:{duration:3,wage:10000,expiresAtSeason:12},diary,coachHistory,coach:{name:'Mister Delta',style:'Bilanciato'},coachTrust:60};
const result={version:'7.999.53',kind:'synthetic-UI-fixture',command:'node tests/codex/diario-53.mjs',viewport:[412,915],deviceScaleFactor:2,fixture:{diarySeasons:diary.map(x=>x.season),coachSeasons:coachHistory.length,uniqueHistoricCoaches:3,currentCoach:'Mister Delta'},observed:{},errors:[]};
const server=await startServer();const port=server.address().port;let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CPM_CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--headless=new','--use-gl=angle','--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist','--no-sandbox']});
 const page=await browser.newPage({viewport:{width:412,height:915},deviceScaleFactor:2});await installCdnRoutes(page);
 page.on('pageerror',e=>result.errors.push(String(e.message)));
 await page.addInitScript(save=>{localStorage.setItem('cpm-v3',JSON.stringify(save));window.__CPM_FIS_APERTE=1;},{phase:'career',player});
 await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`,{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>document.getElementById('root')?.children.length>0,null,{timeout:120000});
 await page.getByRole('button',{name:/CONTINUA/i}).first().click({timeout:15000});
 await page.waitForFunction(()=>!!window.__CPM_CAREER,null,{timeout:40000});
 await page.evaluate(()=>window.__CPM_CAREER.goTab('profile'));
 const card=page.locator('[data-cpm="diario-sfoglia"]');await card.waitFor({timeout:15000});
 const getSeason=async()=>{const t=await card.innerText();return Number((t.match(/Stagione\s+(\d+)/)||[])[1]);};
 result.observed.backward=[await getSeason()];for(let i=0;i<7;i++){await card.getByRole('button',{name:'Stagione precedente'}).click();result.observed.backward.push(await getSeason());}
 result.observed.forward=[await getSeason()];for(let i=0;i<7;i++){await card.getByRole('button',{name:'Stagione successiva'}).click();result.observed.forward.push(await getSeason());}
 const btn=page.getByRole('button',{name:/Storico allenatori/i}).first();result.observed.coachTitle=await btn.innerText();result.observed.coachText=await btn.evaluate(el=>el.parentElement?.innerText||'');
 result.observed.coachCounts=Object.fromEntries([...new Set([...names,'Mister Delta'])].map(name=>[name,result.observed.coachText.split(name).length-1]));
 result.observed.diaryEntries=await card.locator('div').filter({hasText:/Voce QA stagione/}).count();
 await page.close();
}catch(e){result.errors.push(String(e?.stack||e));}
finally{if(browser)await browser.close().catch(()=>{});server.close();fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({backward:result.observed.backward,forward:result.observed.forward,coachTitle:result.observed.coachTitle,coachCounts:result.observed.coachCounts,errors:result.errors,output:out},null,2));}
process.exit(result.errors.length?1:0);
