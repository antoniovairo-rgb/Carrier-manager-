#!/usr/bin/env node
/* [7.425.0] GUARDIANO — OGNI COPPA HA LA SUA CERIMONIA
   (evolutiva PO «una Coppa deve sembrare una Coppa, uno Scudetto uno Scudetto, una promozione una
    promozione — NON usare la stessa cerimonia per tutto»)
   COSA MISURA: per ogni kind (league/cup/promo/int/bigwin) forza la premiazione col gancio
   __CPM_FORCE_CEREMONY e legge lo SCRIPT vero (__CPM_CER425): (1) gli script devono essere DIVERSI
   fra loro (la prova del rosso e' incorporata: se tornasse una cerimonia unica per tutto, l'assert
   di diversita' fallisce); (2) la promozione NON ha podio ne' sollevamento (festeggia senza coppa:
   il premio e' la categoria) ma HA il mister e la curva; (3) la coppa HA la consegna e il
   sollevamento; (4) il MISTER esiste in ogni cerimonia; (5) zero pageerror sul giro completo. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = [];
page.on('pageerror', e => errs.push(String(e).slice(0, 160)));
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; });
await openMatch(page, port); await sleep(1200);
const scripts = {};
for (const kind of ['league', 'cup', 'promo', 'int', 'bigwin']) {
  const ok = await page.evaluate(k => window.__CPM_FORCE_CEREMONY && window.__CPM_FORCE_CEREMONY({ name: 'T ' + k, kind: k }), kind);
  if (!ok) { console.log('❌ FAIL — force cerimonia non disponibile'); process.exit(2); }
  await sleep(2200);
  scripts[kind] = await page.evaluate(() => window.__CPM_CER425 || null);
  await page.evaluate(() => { try { window.__CPM_RESOLVE ? null : null; } catch (e) {} });
  await page.keyboard.press('Enter'); await sleep(900);
}
await b.close(); srv.close();
const guasti = [];
for (const [k, sc] of Object.entries(scripts)) {
  if (!sc || !sc.beats || !sc.beats.length) { guasti.push(`${k}: script assente`); continue; }
  if (!sc.coach) guasti.push(`${k}: il MISTER non c'e'`);
}
const sigs = Object.entries(scripts).filter(([k, s]) => s && s.beats).map(([k, s]) => [k, s.beats.join('>')]);
for (let i = 0; i < sigs.length; i++) for (let j = i + 1; j < sigs.length; j++) if (sigs[i][1] === sigs[j][1]) guasti.push(`${sigs[i][0]} e ${sigs[j][0]} hanno la STESSA cerimonia: ${sigs[i][1]}`);
const pr = scripts.promo && scripts.promo.beats || [];
if (pr.includes('present') || pr.includes('lift')) guasti.push('la PROMOZIONE ha podio/sollevamento: deve festeggiare senza coppa');
if (!(pr.includes('coach') && pr.includes('curva'))) guasti.push('la PROMOZIONE non ha mister+curva: ' + pr.join('>'));
const cu = scripts.cup && scripts.cup.beats || [];
if (!(cu.includes('present') && cu.includes('lift'))) guasti.push('la COPPA non ha consegna+sollevamento: ' + cu.join('>'));
if (errs.length) guasti.push('pageerror: ' + errs[0]);
console.log(Object.entries(scripts).map(([k, s]) => `${k}: ${s && s.beats ? s.beats.join('>') : '—'}`).join('\n'));
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log('\n✅ PASS — ogni coppa ha la sua cerimonia, il mister c\'e\' sempre, la promozione festeggia a modo suo');
