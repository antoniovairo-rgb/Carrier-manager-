/* Verifica 6.38.0: la griglia di mira a 6 celle (Alto/Basso × SX/CTR/DX) NON deve uscire per la situation
   rovesciata-su-cross (intent="insertion", lockMovement) — deve mostrare i bottoni azione. Rigore e punizione
   devono INVECE mostrare la griglia. Usa l'harness reale (provino → forceSituation). */
import { startServer, launchBrowser, installCdnRoutes, sleep, openMatch, forceSituation } from './lib/harness.mjs';
const OUT='/tmp/claude-0/-home-user-Carrier-manager-/2f559cb2-4a90-52cc-818f-c4a2700303e9/scratchpad';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 402, height: 900 } });
await installCdnRoutes(page);
page.on('pageerror', e => console.log('PAGEERR', String(e.message).slice(0,160)));
await openMatch(page, port);

const idxs = await page.evaluate(()=>({
  rovesciata: SITUATIONS.findIndex(s=>s.lockMovement&&s.intent==='insertion'),
  penalty:    SITUATIONS.findIndex(s=>s.intent==='penalty'),
  freekick:   SITUATIONS.findIndex(s=>s.lockMovement&&s.intent==='freekick'),
}));
console.log('indici', JSON.stringify(idxs));

async function probe(gi,label){
  await forceSituation(page, gi, { choose:true });
  await sleep(1000);
  const r = await page.evaluate(()=>{
    // conta SOLO i bottoni VISIBILI (offsetParent!=null) → esclude il ramo desktop nascosto a viewport mobile
    const vis=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean);
    const hasGrid = vis.some(t=>/Alto CTR|Alto SX|Basso DX/.test(t));
    return { hasGrid, sampleBtns: vis.slice(0,8) };
  });
  console.log(`\n[${label}] gi=${gi} · grigliaMira=${r.hasGrid}`);
  console.log('   bottoni:', JSON.stringify(r.sampleBtns));
  await page.screenshot({ path:`${OUT}/dpad-${label}.png` });
  return r.hasGrid;
}

const gRov = await probe(idxs.rovesciata,'rovesciata');
const gPen = await probe(idxs.penalty,'rigore');
const gFk  = await probe(idxs.freekick,'punizione');

console.log('\n=== ESITO ===');
console.log(`rovesciata (insertion) → griglia ${gRov?'PRESENTE ❌ (atteso: assente)':'ASSENTE ✅'}`);
console.log(`rigore (penalty)       → griglia ${gPen?'PRESENTE ✅':'ASSENTE ❌ (atteso: presente)'}`);
console.log(`punizione (freekick)   → griglia ${gFk?'PRESENTE ✅':'ASSENTE ❌ (atteso: presente)'}`);
const ok = !gRov && gPen && gFk;
console.log(ok?'\n✅ FIX OK':'\n❌ FIX NON CORRETTO');
await browser.close(); srv.close(); process.exit(ok?0:1);
