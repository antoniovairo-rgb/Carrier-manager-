/* [7.909 — D7 REVOCATA] Metro della revoca: il campo torna al corpo PIENO, l'interruttore del menu di pausa
   non c'e' piu', il contatore dei fotogrammi resta (serve ai prossimi metri, D12 e C11).
   Due bracci: VERDE (default = pieno) e ROSSO (__CPM_NO909 = leggeri, com'era nella 7.907). Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const server = await startServer();
const port = server.address().port;
const out = {};
for (const braccio of ['verde', 'rosso']) {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  let errori = 0; page.on('pageerror', () => { errori++; });
  await page.addInitScript((rosso) => { window.__CPM_GLB = true; if (rosso) window.__CPM_NO909 = true; }, braccio === 'rosso');
  await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
  await page.evaluate(() => { if (window.__CPM_LOAD_ALL) window.__CPM_LOAD_ALL(); }).catch(() => {});
  await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
  try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 }); } catch (_e) {}
  await sleep(5000);
  const r = await page.evaluate(() => {
    let tri = 0, corpo = null, fps = null, contatore = false;
    try { tri = window.__CPM_TRI907 ? window.__CPM_TRI907() : 0; } catch (_e) {}
    try { corpo = window.__CPM_BODY909 ? window.__CPM_BODY909() : null; } catch (_e) {}
    try { const f = window.__CPM_FPS907 && window.__CPM_FPS907(); if (f) fps = f.fps5s; } catch (_e) {}
    contatore = !!document.querySelector('[data-cpm="fps907"]');
    return { tri, corpo, fps, contatore };
  });
  // l'interruttore: si apre la pausa e si cerca il bottone «Corpi:»
  let interruttore = null;
  try {
    const pausa = page.locator('button[title^="Pausa"]').first();
    if (await pausa.count()) {
      await pausa.click({ timeout: 4000 }); await sleep(700);
      interruttore = (await page.locator('button:has-text("Corpi:")').count()) > 0;
      const ripr = page.locator('button[title^="Riprendi"]').first();
      if (await ripr.count()) await ripr.click({ timeout: 4000 }).catch(() => {});
    }
  } catch (_e) {}
  out[braccio] = { ...r, interruttore, errori };
  console.log(`${braccio.toUpperCase()}: corpo=${r.corpo} · triangoli in scena=${r.tri} · contatore a schermo=${r.contatore ? 'sì' : 'NO'} · interruttore nel menu di pausa=${interruttore === null ? 'pausa non trovata' : (interruttore ? 'PRESENTE' : 'assente')} · fps banco=${r.fps} · errori=${r.errori}`);
  await browser.close();
}
const v = out.verde, r = out.rosso;
const esiti = [
  ['il campo usa il corpo PIENO', v.corpo === 'pieni'],
  ['il rosso torna al corpo alleggerito (7.907)', r.corpo === 'leggeri'],
  ['i triangoli del verde sono quelli del corpo pieno (> 1,0 M)', v.tri > 1000000],
  ['i triangoli del rosso sono quelli alleggeriti (< 0,8 M)', r.tri > 0 && r.tri < 800000],
  ['il contatore dei fotogrammi resta', v.contatore === true],
  ["l'interruttore del menu di pausa non c'è più", v.interruttore === false],
  ['nessun errore di pagina', v.errori === 0 && r.errori === 0],
];
console.log('\n=== VERDETTO REVOCA 7.909 ===');
for (const [t, ok] of esiti) console.log(`  ${ok ? '✅' : '❌'} ${t}`);
const tutti = esiti.every(([, ok]) => ok);
console.log(tutti ? '\n✅ REVOCA OK' : '\n❌ REVOCA: qualcosa non torna (vedi sopra).');
server.close();
process.exit(tutti ? 0 : 1);
