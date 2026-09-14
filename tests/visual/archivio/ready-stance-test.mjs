#!/usr/bin/env node
/* [7.355.0] GUARDIANO DELLA POSIZIONE D'ATTESA — collaudo PO gi10: «sembra che stiano facendo
   riscaldamento, i giocatori non sono in posizione d'attesa».
   Il freeze di lettura ferma i 21 off-ball di proposito (~0,9s per far leggere la scena) ma li lasciava con
   l'orientamento che avevano: fermi E di spalle si legge come riscaldamento. Misurato prima del fix: errore
   mediano 64-85 gradi e 7-9 giocatori su 19 girati di piu' di 90 gradi. Ora in attesa si guarda la palla.

   ⚠️ Due condizioni SENZA le quali questa misura non vale niente, ed e' il motivo per cui il difetto e'
   sopravvissuto a lungo:
     · `__CPM_PRESENT=1` — sotto `?cpmtest=1` il freeze di lettura e' SPENTO: senza questo si misura una
       scena in cui i giocatori si muovono, e l'attesa non esiste proprio;
     · `__CPM_FORCE_INTRO` — la forzatura salta `hl_intro`, dove la scena si schiera.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node ready-stance-test.mjs                                */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; });
await openMatch(page, port);
await sleep(900);

let peggiorMed = 0, totSpalle = 0;
for (const gi of [10, 23, 87, 109, 145, 162]) {
  await page.evaluate(g => { window.__CPM_FORCE_INTRO = true; window.__CPM_FORCE_SIT(g, true); }, gi);
  await sleep(1700);
  const r = await page.evaluate(() => {
    const s = window.__CPM_STATE(); const b = s.ball;
    if (!b || !(s.players || []).length) return null;
    const bw = { x: b.x - 50, z: (b.y - 50) * 0.68 };
    const errs = s.players.filter(p => !p.gk).map(p => {
      if (p.ry == null) return null;
      const pw = { x: p.x - 50, z: (p.y - 50) * 0.68 };
      const want = Math.atan2(bw.x - pw.x, bw.z - pw.z);
      return +(Math.abs(((p.ry - want) + Math.PI * 3) % (Math.PI * 2) - Math.PI) * 180 / Math.PI).toFixed(0);
    }).filter(v => v != null);
    errs.sort((a, c) => a - c);
    return { n: errs.length, med: errs[errs.length >> 1], sp: errs.filter(e => e > 90).length, ph: s.phase };
  });
  if (!r) { issues.push(`gi${gi}: stato non leggibile`); continue; }
  if (r.n === 0) { issues.push('il campo `ry` non e\' esposto da __CPM_STATE: la misura dell\'orientamento non e\' stata fatta'); break; }
  peggiorMed = Math.max(peggiorMed, r.med); totSpalle += r.sp;
  console.log(`  gi${String(gi).padStart(3)} (${r.ph}) errore mediano ${r.med}° · di spalle (>90°) ${r.sp}/${r.n}`);
}
console.log(`peggior mediana ${peggiorMed}° · totale di spalle ${totSpalle}`);
/* soglia larga: non si pretende un allineamento perfetto (la rotazione e' smorzata e la palla si muove),
   si pretende che NESSUNO resti girato dall'altra parte mentre aspetta. */
if (peggiorMed > 30) issues.push(`(A) errore di orientamento mediano fino a ${peggiorMed}°: in attesa i giocatori non guardano la palla`);
if (totSpalle > 2) issues.push(`(B) ${totSpalle} giocatori girati di oltre 90° durante l'attesa: si legge come riscaldamento, non come una partita`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ ATTESA OK — durante la lettura i giocatori sono fermi ma rivolti al pallone');
