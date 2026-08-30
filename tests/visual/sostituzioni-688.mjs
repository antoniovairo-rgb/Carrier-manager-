/* [7.688.0 GUARDIANO] L'EROE SI VEDE QUANDO ENTRA E QUANDO ESCE.
   COLLAUDO PO: «non si vedono piu' le sostituzioni in ingresso ed uscita dell'eroe». E' una regressione
   del 7.660/7.665: quel blocco spegne i corpi durante la telecronaca — cio' che il PO aveva chiesto —
   ma nella lista degli spenti c'era anche l'eroe, e la cerimonia di ingresso/uscita si svolge proprio
   in fase `playing`. PROVA DEL ROSSO permanente (`__CPM_NO688`): col comportamento vecchio l'eroe
   dev'essere INVISIBILE, altrimenti questo test non sta guardando niente. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
async function misura(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  await page.addInitScript((r) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; if (r) window.__CPM_NO688 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Sub' });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
  await sleep(6000);
  const out = {};
  for (const [nome, flag] of [['ingresso', '__CPM_FORCE_SUBENTRY'], ['uscita', '__CPM_FORCE_SUBEXIT']]) {
    await page.evaluate(f => { window[f] = 1; }, flag);
    let visto = 0, campioni = 0;
    for (let k = 0; k < 22; k++) {
      const v = await page.evaluate(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.hero ? !!s.hero.visible : null; } catch (_e) { return null; } });
      if (v != null) { campioni++; if (v) visto++; }
      await sleep(160);
    }
    out[nome] = { visto, campioni };
  }
  await ctx.close();
  return out;
}
console.log('\n=== L\'EROE SI VEDE QUANDO ENTRA E QUANDO ESCE ===\n');
const rosso = await misura(true);
console.log(`  FASE A (comportamento vecchio, __CPM_NO688): ingresso ${rosso.ingresso.visto}/${rosso.ingresso.campioni} · uscita ${rosso.uscita.visto}/${rosso.uscita.campioni}`);
const vedeIlDifetto = rosso.ingresso.visto < rosso.ingresso.campioni * 0.5 || rosso.uscita.visto < rosso.uscita.campioni * 0.5;
if (!vedeIlDifetto) { console.log('\n❌ FAIL — con il comportamento vecchio l\'eroe risulta comunque visibile: lo strumento non vede il difetto, il verde non varrebbe niente.\n'); await b.close(); srv.close(); process.exit(1); }
const verde = await misura(false);
console.log(`  FASE B (con il rimedio):                     ingresso ${verde.ingresso.visto}/${verde.ingresso.campioni} · uscita ${verde.uscita.visto}/${verde.uscita.campioni}`);
await b.close(); srv.close();
const ok = verde.ingresso.visto >= verde.ingresso.campioni * 0.8 && verde.uscita.visto >= verde.uscita.campioni * 0.8;
console.log(ok ? '\n✅ PASS — l\'eroe resta in scena mentre entra e mentre esce.\n' : '\n❌ FAIL — l\'eroe non si vede abbastanza durante la sostituzione.\n');
process.exit(ok ? 0 : 1);
