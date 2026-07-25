/* [7.192.0] PROBE conflitto divise su TUTTI gli accoppiamenti reali (stessa lega, andata e ritorno):
   (A) dopo selectMatchKits la maglia di casa e quella ospite non devono MAI essere confondibili
       (kitsClash: RGB vicini · stessa famiglia di tinta · entrambe chiare · entrambe SCURE con poca differenza
       di luminanza — il caso «granata vs nero» segnalato dal PO);
   (B) regressione esplicita sui casi segnalati (FC Salernum vs FC Laguna);
   (C) l ospite gioca coi PROPRI colori quando può (la divisa neutra d emergenza resta l eccezione). */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage();
await installCdnRoutes(page);
const issues = [];
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 150)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await page.waitForFunction(() => typeof window.__CPM_kitSel === 'function', null, { timeout: 20000 });

const res = await page.evaluate(() => {
  const sel = window.__CPM_kitSel, clash = window.__CPM_kitsClash;
  const C = (window.__CPM_CLUBS || []).filter(c => !c.isU18);
  const byLg = {}; for (const c of C) (byLg[c.lg] = byLg[c.lg] || []).push(c);
  let pairs = 0, bad = 0, neutral = 0; const hits = [];
  for (const lg of Object.keys(byLg)) {
    const L = byLg[lg];
    for (const h of L) for (const a of L) {
      if (h.id === a.id) continue;
      pairs++;
      const k = sel(h, a);
      if (clash(k.homeShirt, k.awayShirt)) { bad++; if (hits.length < 8) hits.push(`${h.n}(${k.homeShirt}) vs ${a.n}(${k.awayShirt})`); }
      if (k.awayKitName === 'Third' && /^#(f2f1ec|15151c)$/i.test(k.awayShirt)) neutral++;
    }
  }
  const sal = C.find(c => c.id === 'sal'), ven = C.find(c => c.id === 'ven');
  const regr = (sal && ven) ? sel(sal, ven) : null;
  return { pairs, bad, neutral, hits, regr, regrClash: regr ? clash(regr.homeShirt, regr.awayShirt) : null };
});

console.log(`accoppiamenti testati: ${res.pairs} · conflitti residui: ${res.bad} · divisa neutra d'emergenza: ${res.neutral} (${(res.neutral / res.pairs * 100).toFixed(1)}%)`);
if (res.regr) console.log(`caso PO — FC Salernum vs FC Laguna: casa ${res.regr.homeShirt} · ospite ${res.regr.awayShirt} (${res.regr.awayKitName}) · conflitto: ${res.regrClash}`);
if (res.bad) issues.push(`(A) conflitti divisa non risolti: ${res.bad} → ${res.hits.join(' | ')}`);
if (res.regrClash) issues.push('(B) REGRESSIONE: Salernum vs Laguna ancora confondibili');
if (res.neutral / Math.max(1, res.pairs) > 0.35) issues.push(`(C) divisa neutra d'emergenza troppo frequente (${(res.neutral / res.pairs * 100).toFixed(1)}%): gli ospiti perdono la propria identità`);
await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ DIVISE OK (nessun accoppiamento confondibile · caso PO risolto · identità ospite preservata)');
process.exit(issues.length ? 1 : 0);
