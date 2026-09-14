#!/usr/bin/env node
/* [7.159.0 A+B+C] PROBE momenti esclusivi per fase + tier + anti-ripetizione impulsi.
   (A) careerPhase classifica correttamente i profili. (B) i momenti epico hanno tier="epico".
   (A) i momenti sono phase-gated: un ASTRO vede solo momenti astro-compatibili, non quelli da bandiera/veterano.
   (C) l'anti-ripetizione a lungo termine incrementa impulseSeen e non ricicla finché il pool non è esaurito. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => typeof window.__CPM_careerPhase === 'function' && Array.isArray(window.__CPM_MOMENTS), null, { timeout: 40000 });

// ── (A) careerPhase ──
const phase = (p) => page.evaluate((q) => window.__CPM_careerPhase(q), p);
const club = { id: 'sal', n: 'FC Salernum', lg: 'Lega A' };
const mk = (o) => ({ proStatus: 'pro', age: 26, popularity: 40, squadRole: 'titolare', coachTrust: 65, club, season: 5, ...o });
const cases = [
  ['astro', mk({ age: 20 }), 'astro'],
  ['lotta', mk({ age: 24, squadRole: 'riserva', coachTrust: 45 }), 'lotta'],
  ['stella', mk({ age: 28, popularity: 88 }), 'stella'],
  ['bandiera', mk({ age: 30, popularity: 60, fanLegend: [{ clubId: 'sal', seasons: 6 }] }), 'bandiera'],
  ['veterano', mk({ age: 33, popularity: 55 }), 'veterano'],
  ['titolare', mk({ age: 27, popularity: 50 }), 'titolare'],
];
for (const [label, p, exp] of cases) {
  const got = await phase(p);
  console.log(`fase ${label}: ${got}${got === exp ? ' ✓' : ' ✗ (atteso ' + exp + ')'}`);
  if (got !== exp) issues.push(`careerPhase(${label}) = ${got}, atteso ${exp}`);
}

// ── (B) tier + (A) phase-gating: eleggibilità per un ASTRO vs un VETERANO ──
const elig = (p) => page.evaluate((q) => window.__CPM_eligibleMoments(q), p);
const astroP = mk({ age: 19, ovr: 76, totalMatches: 20, season: 3 });
const astroElig = await elig(astroP);
console.log('ASTRO eleggibili:', JSON.stringify(astroElig));
const astroIds = astroElig.map(m => m.id);
if (!astroIds.includes('cm_astro_predestinato')) issues.push('ASTRO non vede cm_astro_predestinato');
if (astroIds.some(id => ['cm_bandiera_murale', 'cm_vet_ultimo_ballo', 'cm_stella_brand_globale'].includes(id))) issues.push('ASTRO vede momenti di altra fase (leak)');
const epic = astroElig.find(m => m.id === 'cm_astro_predestinato');
if (!epic || epic.tier !== 'epico') issues.push('cm_astro_predestinato non è tier epico');

const vetP = mk({ age: 34, popularity: 60, season: 8 });
const vetElig = (await elig(vetP)).map(m => m.id);
console.log('VETERANO eleggibili:', JSON.stringify(vetElig));
if (!vetElig.includes('cm_vet_ultimo_ballo')) issues.push('VETERANO non vede cm_vet_ultimo_ballo');
if (vetElig.includes('cm_astro_predestinato')) issues.push('VETERANO vede momento astro (leak)');

// pool ampliato ≥ 21
const poolN = await page.evaluate(() => window.__CPM_MOMENTS.length);
console.log('pool CAREER_MOMENTS:', poolN);
if (poolN < 21) issues.push(`pool momenti ${poolN} < 21 (ampliamento C mancato)`);

// ── (C) anti-ripetizione a LUNGO termine: esercita il codice VERO (impulseFreshBucket) in modo deterministico ──
//   simula N estrazioni: pesca dal bucket «più freschi», incrementa seen, aggiorna recent(40).
//   PROPRIETÀ attesa: tutti gli impulsi (senza cond) escono UNA volta prima che uno qualsiasi si ripeta.
const cRes = await page.evaluate(() => {
  const POOL = window.__CPM_IMPULSES.filter(im => !im.cond); // solo quelli sempre eleggibili (no cond contestuale)
  const bucket = window.__CPM_impulseFreshBucket;
  const seen = {}, recent = []; const order = [];
  let firstRepeatAt = -1;
  const N = POOL.length + 5;
  for (let i = 0; i < N; i++) {
    const b = bucket(POOL, recent, seen, () => true);
    if (!b.length) break;
    const pickId = b[0].id; // determinismo: primo del bucket
    if ((seen[pickId] || 0) > 0 && firstRepeatAt < 0) firstRepeatAt = i;
    seen[pickId] = (seen[pickId] || 0) + 1;
    recent.push(pickId); if (recent.length > 40) recent.shift();
    order.push(pickId);
  }
  const distinct = Object.keys(seen).length;
  const maxCount = Math.max(...Object.values(seen));
  return { poolN: POOL.length, distinct, maxCount, firstRepeatAt };
});
console.log('C: pool no-cond', cRes.poolN, '· distinti', cRes.distinct, '· max', cRes.maxCount, '· 1ª ripetizione all\'estrazione', cRes.firstRepeatAt);
if (cRes.distinct < cRes.poolN) issues.push(`anti-ripetizione: solo ${cRes.distinct}/${cRes.poolN} impulsi estratti prima di ripetere`);
if (cRes.firstRepeatAt >= 0 && cRes.firstRepeatAt < cRes.poolN) issues.push(`anti-ripetizione: un impulso si è ripetuto all'estrazione ${cRes.firstRepeatAt} < pool ${cRes.poolN} (bucket non rispettato)`);

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ MOMENTI ESCLUSIVI OK (fase · tier · phase-gating · pool≥21 · anti-ripetizione impulsi)');
process.exit(issues.length ? 1 : 0);
