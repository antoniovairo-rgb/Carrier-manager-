/* [22/09 · caccia al determinismo rotto della cronaca]
   QUALE MINUTO CONSUMA UN SORTEGGIO DIVERSO NEI DUE GIRI.

   Il guardiano `match-sequence` ha portato la diagnosi fin qui: due partite identiche divergono al
   minuto 35, dove la STESSA riga esce con un protagonista diverso. Ma il nome e' gia' seedato dal 7.489
   (`pool[Math.floor(_rndM()*pool.length)]`): se cambia, non e' l'estrazione ad essere rotta, e' il
   NUMERO di estrazioni consumate prima — `_rndM` e' un generatore CON STATO, per minuto, e un ramo
   condizionale che in un giro passa e nell'altro no sposta tutto il resto.

   Questa sonda non giudica: conta. Gioca due partite identiche col contatore `__CPM_RNDM959` acceso e
   stampa il PRIMO minuto in cui i conteggi divergono, con l'intorno. Quel minuto nomina il ramo.

   Uso:  CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node rndm-conteggio.mjs                              */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const server = await startServer(); const port = server.address().port;
const giro = async (browser, etichetta) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  let errori = 0; page.on('pageerror', () => { errori++; });
  await page.addInitScript(() => { window.__CPM_RNDM959 = {}; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Determinismo' });
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 12345, policy: 'seeded', tickMs: 300 })).catch(() => {});
  for (let i = 0; i < 80; i++) {
    const fin = await page.evaluate(() => { try { return window.__CPM_PHASE && window.__CPM_PHASE() === 'ended'; } catch (_e) { return false; } });
    if (fin) break;
    await sleep(1000);
  }
  const r = await page.evaluate(() => { try { return JSON.parse(JSON.stringify(window.__CPM_RNDM959 || {})); } catch (_e) { return {}; } });
  await ctx.close();
  return { etichetta, conteggi: r, errori };
};

const browser = await launchBrowser();
const A = await giro(browser, 'A');
const B = await giro(browser, 'B');
await browser.close();
await new Promise(r => server.close(r));

const minuti = [...new Set([...Object.keys(A.conteggi), ...Object.keys(B.conteggi)])].map(Number).sort((a, b) => a - b);
console.log('\n=== ESTRAZIONI DI _rndM, MINUTO PER MINUTO ===');
console.log(`  minuti coperti ${minuti.length} · errori di pagina A ${A.errori} · B ${B.errori}`);
let primo = null;
for (const m of minuti) {
  const a = A.conteggi[m] || 0, b = B.conteggi[m] || 0;
  if (a !== b && primo == null) primo = m;
}
if (primo == null) {
  console.log('\n  i due giri consumano lo STESSO numero di sorteggi in ogni minuto.');
  console.log('  → la divergenza non nasce dal conteggio: guardare gli ARGOMENTI dei sorteggi, non quanti sono.');
} else {
  console.log(`\n  PRIMO MINUTO CHE DIVERGE: ${primo}`);
  console.log('  intorno (minuto: A vs B):');
  for (const m of minuti.filter(x => x >= primo - 3 && x <= primo + 3)) {
    const a = A.conteggi[m] || 0, b = B.conteggi[m] || 0;
    console.log(`    ${String(m).padStart(3)}'  ${String(a).padStart(3)} vs ${String(b).padStart(3)}  ${a !== b ? '≠' : ''}`);
  }
  console.log('\n  → in quel minuto un ramo condizionale passa in un giro e non nell\'altro: e\' li\' il generatore non seedato.');
}
if (!minuti.length) { console.log('\n❌ nessun conteggio raccolto: il contatore non si e\' acceso'); process.exit(1); }
