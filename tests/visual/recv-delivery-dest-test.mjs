#!/usr/bin/env node
/* [7.428.0] GUARDIANO — LA CONSEGNA D'APERTURA ARRIVA ALL'EROE CHE SI VEDE
   (collaudo PO gi86 «codice 001 MISURATO: compagno piu' vicino 11.7u, eroe ≥31.5u per 66 campioni»
    + «CAMERA salta 9.7u»)

   LA LEZIONE: la consegna delle scene di RICEZIONE (7.350/7.383) spediva il pallone al `pPos`
   catturato dalla CHIUSURA dell'effetto — che gira PRIMA del clamp di continuita' 4.86 allo
   startZone. Un commit dopo l'eroe sta anche 30-48u piu' in la', la guardia «una consegna per
   scena» (giusta) blocca la ri-esecuzione, e il timer a 520ms consegna al bersaglio VECCHIO:
   palla in hover aereo su un punto VUOTO per tutta l'intro, poi 60 unita' di deriva lenta a
   mezz'aria in piena finestra di lettura quando la sync palla→eroe la strattona — il 001 e il
   salto camera del dispositivo.

   COSA MISURA (vivo EMULATO: ppos lontano dallo startZone + intro percorsa, cioe' esattamente la
   continuita' vera fra una scena e l'altra): alla lettura assestata il pallone deve essere
   DELL'EROE (≤4,5u dalla sua mesh) e non deve DERIVARE durante la scelta (viaggio <8u in 1,2s).

   PROVA DEL ROSSO, permanente: la FASE A riesegue le stesse scene con `__CPM_NO428` (ripristina
   la chiusura stantia) e PRETENDE che lo strumento veda il difetto — se non lo vede, lo strumento
   e' cieco e il verde della fase B non vale niente.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node recv-delivery-dest-test.mjs                     */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; });
await openMatch(page, port); await sleep(1000);

/* scene di RICEZIONE scoperte dal catalogo: gi86 (la nota del PO) + le prime recv aeree/rasoterra */
const RECV = await page.evaluate(() => {
  const out = [];
  (window.__CPM_SITS || []).forEach((S, i) => { if (S && S.type !== 'def' && S.recv) out.push({ gi: i, bs: S.ballState || 'feet' }); });
  return out;
});
const SCELTE = [86, 86, ...RECV.filter(r => r.gi !== 86).slice(0, 4).map(r => r.gi)];
if (!RECV.some(r => r.gi === 86)) { console.log('❌ FAIL — gi86 non e\' piu\' una scena recv: il guardiano va aggiornato'); process.exit(2); }

async function misura(stantia) {
  await page.evaluate(on => { window.__CPM_NO428 = on ? 1 : 0; }, stantia);
  const righe = [];
  for (const gi of SCELTE) {
    let ok = false;
    try { ok = await page.evaluate(g => { window.__CPM_FORCE_INTRO = 1; window.__CPM_FORCE_INTRO_MS = 2400; return window.__CPM_FORCE_SIT(g, true, { x: 40, y: 40 }); }, gi); } catch (e) {}
    if (!ok) continue;
    await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase !== 'hl_intro'; } catch (e) { return false; } }, { timeout: 20000 }).catch(() => {});
    await sleep(1100);
    const m1 = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s ? { x: s.ball.x, y: s.ball.y, dHero: +Math.hypot(s.hero.x - s.ball.x, s.hero.y - s.ball.y).toFixed(1) } : null; });
    await sleep(1200);
    const m2 = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s ? { x: s.ball.x, y: s.ball.y, dHero: +Math.hypot(s.hero.x - s.ball.x, s.hero.y - s.ball.y).toFixed(1) } : null; });
    if (!m1 || !m2) continue;
    const drift = +Math.hypot(m2.x - m1.x, m2.y - m1.y).toFixed(1);
    righe.push({ gi, dHero: Math.max(m1.dHero, m2.dHero), drift });
  }
  return righe;
}

/* FASE A — rosso provato: con la chiusura stantia lo strumento DEVE vedere il difetto */
const rosse = await misura(true);
const visto = rosse.filter(r => r.dHero > 8 || r.drift > 8);
console.log('FASE A (chiusura stantia __CPM_NO428): ' + rosse.map(r => `gi${r.gi} eroe↔palla ${r.dHero}u drift ${r.drift}u`).join(' · '));
if (rosse.length < 3 || !visto.length) { console.log(`\n❌ FAIL — lo strumento non vede il difetto ripristinato (${rosse.length} scene, ${visto.length} rosse): il verde della fase B non varrebbe niente`); await b.close(); srv.close(); process.exit(2); }

/* FASE B — il fix: consegna all'eroe che si vede, niente deriva in lettura */
const verdi = await misura(false);
console.log('FASE B (fix attivo): ' + verdi.map(r => `gi${r.gi} eroe↔palla ${r.dHero}u drift ${r.drift}u`).join(' · '));
await b.close(); srv.close();
const guasti = verdi.filter(r => r.dHero > 4.5 || r.drift > 8).map(r => `gi${r.gi}: eroe↔palla ${r.dHero}u, deriva ${r.drift}u — la consegna non arriva all'eroe che si vede`);
if (verdi.length < 3) { console.log(`\n❌ FAIL — solo ${verdi.length} scene misurate: la sonda e' cieca`); process.exit(2); }
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log(`\n✅ PASS — su ${verdi.length} ricezioni (rosso provato in fase A) la palla apre ADDOSSO all'eroe e non deriva in lettura`);
