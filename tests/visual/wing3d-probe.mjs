/* Investigazione live-3D: la «sterzata d'esterno dalla fascia» e il «cross sul secondo palo da sinistra»
   (situazioni overlap_left) non sviluppano bene l'azione in 3D. Cattura frame DURANTE l'esito. */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch, forceSituation } from './lib/harness.mjs';
const OUT='/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 402, height: 900 } });
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,160)));
await openMatch(page, port);

// individua le situazioni target + l'indice dell'azione «giusta»
const cands = await page.evaluate(()=>{
  const out=[];
  SITUATIONS.forEach((s,gi)=>{
    const lanes=(s.tactic&&s.tactic.lanes)||[];
    const acts=(s.actions||[]).map(a=>a.label||'');
    const isLeft=lanes.includes('overlap_left');
    const sterzataAI=acts.findIndex(l=>/sterzat.*esterno|esterno.*fond|brucia il terzino/i.test(l));
    const fpCrossAI=acts.findIndex(l=>/cross.*secondo palo|secondo palo|palo lontano/i.test(l)&&/cross|palla/i.test(l));
    if(isLeft&&sterzataAI>=0) out.push({gi,kind:'sterzata',ai:sterzataAI,text:s.text,intent:s.intent,act:acts[sterzataAI]});
    if(isLeft&&fpCrossAI>=0) out.push({gi,kind:'fpcross',ai:fpCrossAI,text:s.text,intent:s.intent,act:acts[fpCrossAI]});
  });
  return out;
});
console.log('candidati:', JSON.stringify(cands,null,1));

async function capture(c){
  // forza la situation CON la posizione reale della startZone (come fa il gate: px in area attacco, y reale)
  await page.evaluate((gi)=>{
    const sit=SITUATIONS[gi]; const sz=sit&&sit.startZone;
    const sx0=(sz&&sz.x)?(sz.x[0]+sz.x[1])/2:70; const sy0=(sz&&sz.y)?(sz.y[0]+sz.y[1])/2:50;
    const px=Math.max(sx0,64);
    window.__CPM_LOAD_ALL&&window.__CPM_LOAD_ALL();
    window.__CPM_FORCE_SIT(gi,true,{x:px,y:sy0});
  }, c.gi);
  await sleep(900);
  const props0 = await page.evaluate(()=>{ try{return window.__CPM_PROBE?window.__CPM_PROBE():null;}catch(e){return 'err:'+e.message;} });
  await page.screenshot({ path:`${OUT}/wing-${c.kind}-${c.gi}-choose.png` });
  // risolvi l'azione mirata forzando SUCCESS
  await page.evaluate((k)=>{ window.__CPM_FORCE_OUTCOME='success'; window.__CPM_RESOLVE(k); }, c.ai);
  // cattura frame STRETTI durante lo sviluppo dell'esito (arco/cross/dribble), prima che il provino avanzi
  const ts=[180,420,700,1050,1500];
  let prev=0;
  for(let f=0;f<ts.length;f++){
    await sleep(ts[f]-prev); prev=ts[f];
    await page.screenshot({ path:`${OUT}/wing-${c.kind}-${c.gi}-t${ts[f]}.png` });
  }
  const props1 = await page.evaluate(()=>{ try{return window.__CPM_PROBE?window.__CPM_PROBE():null;}catch(e){return 'err:'+e.message;} });
  console.log(`\n[${c.kind} gi=${c.gi}] act="${c.act}" intent=${c.intent}`);
  console.log('  PROBE@choose:', JSON.stringify(props0));
  console.log('  PROBE@result:', JSON.stringify(props1));
}

// prendi la PRIMA sterzata e il PRIMO fpcross a sinistra
const sterz = cands.find(c=>c.kind==='sterzata');
const fp = cands.find(c=>c.kind==='fpcross');
if(sterz) await capture(sterz);
if(fp) await capture(fp);
console.log('\ndone');
await browser.close(); srv.close(); process.exit(0);
