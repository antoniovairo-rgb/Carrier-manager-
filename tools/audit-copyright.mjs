#!/usr/bin/env node
/* CPM — GATE COPYRIGHT/DE-BRANDING (roadmap Play Store 1.5) — BLOCCANTE.
   Carica il gioco ed esegue window._auditCopyright() (scan di club/leghe/competizioni/record/nomi
   contro le blocklist _CR_BRANDS/_CR_PLAYERS). Esce con codice ≠0 se trova riferimenti al mondo reale
   → usabile come step CI bloccante prima di pubblicare sullo store. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../tests/visual/lib/harness.mjs';

const srv = await startServer();
const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage();
await installCdnRoutes(page);
let exitCode = 1;
try {
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => typeof window._auditCopyright === 'function', { timeout: 40000 });
  await sleep(300);
  const hits = await page.evaluate(() => { try { return window._auditCopyright(); } catch (e) { return ['ERRORE audit: ' + (e && e.message)]; } });
  console.log('=== GATE COPYRIGHT / DE-BRANDING ===');
  if (!hits || hits.length === 0) { console.log('✅ OK — nessun riferimento al mondo reale (club/leghe/competizioni/record/nomi).'); exitCode = 0; }
  else { console.log(`❌ ${hits.length} riferimento/i potenzialmente reale/i (vanno rinominati prima del rilascio):`); hits.slice(0, 40).forEach(h => console.log('  - ' + h)); exitCode = 2; }
} catch (e) {
  console.error('FATAL: impossibile eseguire l\'audit:', e && e.message);
  exitCode = 1;
} finally {
  await browser.close(); srv.close();
}
process.exit(exitCode);
