/* [7.942] LA FESTA DI FINE PARTITA — c'e', quando deve esserci, e si passa con un tocco?
   Si forza il fine partita e si guarda: compare il riquadro, porta i visi, e il tocco lo chiude
   lasciando la card di fine gara. Rosso __CPM_NO942: niente festa, si va dritti alla card. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const rosso = process.argv.includes('--rosso');
const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
let errori = 0; const msg = [];
page.on('pageerror', (e) => { errori++; if (msg.length < 3) msg.push(String(e).slice(0, 160)); });
await page.addInitScript((r) => { window.__CPM_GLB = true; if (r) window.__CPM_NO942 = true;
  /* il festeggiamento scatta su una gara MERITATA: una partita qualunque non lo mostra (misurato:
     gol 0, voto 6,28). Il varco inietta due gol e un assist, cosi' la sonda giudica la SCENA. */
  window.__CPM_FESTA942_FORCE = { goals: 2, assists: 1, rb: 18 }; }, rosso);
await openMatch(page, port, { skipLoadAll: true, name: 'Festa' });
try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 60000 }); } catch (_e) {}
await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 60 }); }).catch(() => {});
/* si aspetta la fine: o compare la festa, o compare la card di fine gara */
let visto = null;
for (let i = 0; i < 150; i++) {
  await sleep(2000);
  visto = await page.evaluate(() => ({
    festa: !!document.querySelector('[data-cpm="festa942"]'),
    fase: (window.__CPM_PHASE ? window.__CPM_PHASE() : null),
  }));
  if (visto.festa || visto.fase === 'ended') break;
}
const dettaglio = await page.evaluate(() => {
  const el = document.querySelector('[data-cpm="festa942"]');
  if (!el) return null;
  const b = el.getBoundingClientRect();
  return { w: Math.round(b.width), h: Math.round(b.height),
    testo: String(el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160),
    visi: el.querySelectorAll('svg').length + el.querySelectorAll('[data-cpm-figurina]').length, /* [23/09] le figurine hanno sostituito le faccine SVG */ coriandoli: el.querySelectorAll('span').length,
    /* [difetto della prima stesura] contavo i coriandoli nel DOM e li dichiaravo presenti: erano 26 e non
       se ne vedeva uno, perche' il loro fotogramma chiave era annidato dentro un altro e non esisteva.
       Un CONTEGGIO non e' un AVVISTAMENTO: qui si chiede quanti stanno davvero dentro lo schermo. */
    coriandoliVisti: Array.prototype.filter.call(el.querySelectorAll('span'), (q) => {
      const r = q.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight && r.width > 0; }).length };
});
if (dettaglio) await page.screenshot({ path: '/tmp/claude-0/festa-942.png' });
/* il tocco la chiude e porta alla card? */
let dopoTocco = null;
if (dettaglio) { await page.click('[data-cpm="festa942"]').catch(() => {}); await sleep(1200);
  dopoTocco = await page.evaluate(() => ({ festa: !!document.querySelector('[data-cpm="festa942"]'),
    fase: (window.__CPM_PHASE ? window.__CPM_PHASE() : null) })); }
/* [difetto mio] questa lettura stava DOPO browser.close(): il try/catch la inghiottiva e la
   sonda diceva «niente testimone» quando il testimone non era mai stato CHIESTO. Si misura
   finche' la pagina e' viva. */
let testimone=null; try{testimone=await page.evaluate(()=>window.__CPM_FESTA942||null);}catch(_e){}
await browser.close();
console.log(`\n=== FESTA DI FINE PARTITA === ${rosso ? '[ROSSO __CPM_NO942]' : '[VERDE]'}`);
console.log(`  compare: ${dettaglio ? 'SI · ' + dettaglio.w + 'x' + dettaglio.h : 'no'} · fase raggiunta ${visto && visto.fase}`);
if (dettaglio) { console.log(`  visi ${dettaglio.visi} · coriandoli ${dettaglio.coriandoli} nel DOM, ${dettaglio.coriandoliVisti} DENTRO lo schermo`); console.log(`  a schermo: ${dettaglio.testo}`); }
if (dopoTocco) console.log(`  dopo il tocco: festa ${dopoTocco.festa ? 'ANCORA LI' : 'chiusa'} · fase ${dopoTocco.fase}`);
console.log('  testimone: '+(testimone?JSON.stringify(testimone):'MAI SCRITTO — il blocco non e\' stato raggiunto'));
console.log(`  errori di pagina ${errori}${msg.length ? ' → ' + msg[0] : ''}`);
const ok = rosso ? (!dettaglio && errori === 0) : (!!dettaglio && dettaglio.visi >= 1 && dettaglio.coriandoliVisti >= 5 && dopoTocco && !dopoTocco.festa && dopoTocco.fase === 'ended' && errori === 0);
console.log(ok ? (rosso ? '\n✅ difetto riprodotto — senza la festa si va dritti alla card' : '\n✅ PASS — la festa c\'e\', porta i visi, e il tocco la chiude sulla card di fine gara')
               : '\n❌ FAIL');
process.exit(ok ? 0 : 1);
