#!/usr/bin/env node
/* [P0 #2 — audit forense] UN SALVATAGGIO PIU' VECCHIO NON DEVE POTER SOVRASCRIVERE UNO PIU' RECENTE.
 *
 * ROOT CAUSE: `storage.save` e' `async` e non ha ne' coda ne' numero di sequenza. Nel browser non si
 * vede (localStorage e' sincrono), ma la build pubblicata su Play Store gira su `window.storage` =
 * @capacitor/preferences, iniettato da tools/build-dist.mjs: li' la scrittura passa da un bridge
 * asincrono e due salvataggi concorrenti possono completare FUORI ORDINE. `savedAt` viene scritto ma
 * mai riletto, quindi nulla se ne accorge. Sequenza reale: stato A → parte l'autosave (bridge occupato)
 * → stato B → l'app va in background → il flush salva B → il salvataggio di A completa DOPO e riscrive
 * il disco con lo stato vecchio. Dimostrato a runtime prima del fix.
 *
 * Scenari (piano di messa in sicurezza, FASE 2):
 *   A) A vecchio lento + B nuovo veloce → sul disco deve restare B
 *   B) A → B → C con latenze decrescenti → sul disco deve restare C
 *   C) salvataggio normale senza concorrenza → deve funzionare (nessun blocco introdotto dal fix)
 *   D) ramo browser (localStorage sincrono) → invariato
 *   E) ramo window.storage / Android → e' il ramo del difetto
 *   F) reload dopo salvataggio → si rilegge davvero l'ultimo stato
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const guasti = [];

const SAVE = { phase: 'career', player: {
  name: 'Probe Monotono', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, age: 25, ovr: 80,
  campDone: true, presidentModalSeason: 4, jerseyNumSeason: 4, drawSeen: 4, mercatoSeen: 4, presentSeason: 4,
  tutorialDone: true, weekLived: true, seasonPledge: { season: 4, tone: 'equilibrato' },
  club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 88, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 80, tecnica: 80, fisico: 80, 'mentalità': 80, tiro: 80, passaggio: 80, dribbling: 80, posizionamento: 80 },
  form: 70, morale: 70, fatigue: 10, popularity: 50, value: 20, bankBalance: 1000, goals: 5, assists: 2, matches: 10,
  contract: { duration: 3, wage: 30000, expiresAtSeason: 8 } } };

/* apre il gioco con un bridge nativo FINTO (stessa forma di @capacitor/preferences) a latenza pilotabile */
async function apri({ nativo = true, rompi = false } = {}) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => guasti.push('pageerror: ' + String(e.message).slice(0, 120)));
  await page.addInitScript(cfg => {
    window.__CPM_GLB = false;
    if (cfg.rompi) window.__CPM_NO_P0_2 = 1;   // ripristina le scritture concorrenti (prova del rosso)
    if (cfg.nativo) {
      const disco = { 'cpm-v3': JSON.stringify(cfg.sv) };
      window.__RACE = { log: [], prossimoRitardo: 0, attivo: false };
      window.storage = {
        set: (k, v) => {
          const d = window.__RACE.attivo ? (window.__RACE.prossimoRitardo || 0) : 0;
          window.__RACE.prossimoRitardo = 0;
          let et = '?'; try { et = String(JSON.parse(v).player.bankBalance); } catch (e) {}
          window.__RACE.log.push('inizio(' + et + ') ritardo=' + d);
          return new Promise(res => setTimeout(() => { disco[k] = v; window.__RACE.log.push('FINE(' + et + ')'); res(); }, d));
        },
        get: (k) => Promise.resolve({ value: disco[k] }),
        delete: (k) => { delete disco[k]; return Promise.resolve(); },
      };
      window.__RACE.disco = () => { try { return JSON.parse(disco['cpm-v3']).player.bankBalance; } catch (e) { return null; } };
    } else {
      localStorage.setItem('cpm-v3', JSON.stringify(cfg.sv));
    }
  }, { sv: SAVE, nativo, rompi });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
  await sleep(2500);
  return page;
}
const disco = (page) => page.evaluate(() => window.__RACE ? window.__RACE.disco() : (function () { try { return JSON.parse(localStorage.getItem('cpm-v3')).player.bankBalance; } catch (e) { return null; } })());

/* ── PROVA DEL ROSSO: con le scritture concorrenti il difetto DEVE riprodursi ── */
{
  const page = await apri({ rompi: true });
  await page.evaluate(() => { window.__RACE.attivo = true; window.__RACE.prossimoRitardo = 2500; window.__CPM_CAREER.patch({ bankBalance: 1111 }); });
  await sleep(900);
  await page.evaluate(() => { window.__CPM_CAREER.patch({ bankBalance: 2222 }); });
  await sleep(120);
  await page.evaluate(() => { window.dispatchEvent(new Event('pagehide')); });
  await sleep(4500);
  const d = await disco(page);
  await page.close();
  console.log(`ROSSO) con __CPM_NO_P0_2 (scritture concorrenti): disco ${d} ${d === 1111 ? '— il vecchio ha sovrascritto il nuovo, difetto riprodotto ✓' : ''}`);
  if (d !== 1111) guasti.push(`(ROSSO) la logica pre-fix non riproduce il difetto (disco ${d}): il guardiano non dimostra di proteggere nulla`);
}

/* ── A + E: il vecchio lento non deve vincere sul nuovo veloce (ramo nativo/Android) ── */
{
  const page = await apri();
  await page.evaluate(() => { window.__RACE.attivo = true; window.__RACE.prossimoRitardo = 2500; window.__CPM_CAREER.patch({ bankBalance: 1111 }); });
  await sleep(900);                                            // l'autosave di A e' partito, lento
  await page.evaluate(() => { window.__CPM_CAREER.patch({ bankBalance: 2222 }); });
  await sleep(120);
  await page.evaluate(() => { window.dispatchEvent(new Event('pagehide')); });  // il flush salva B, veloce
  await sleep(4500);                                           // lascia completare il lento
  const d = await disco(page);
  const mem = await page.evaluate(() => window.__CPM_CAREER.get().bank);
  const log = await page.evaluate(() => window.__RACE.log.slice(-6));
  await page.close();
  console.log(`A/E) vecchio lento vs nuovo veloce → disco ${d} · memoria ${mem}`);
  console.log(`     bridge: ${log.join(' | ')}`);
  if (d !== 2222) guasti.push(`(A/E) sul disco e' rimasto ${d} invece di 2222: un salvataggio piu' VECCHIO ha sovrascritto il piu' recente`);
  if (mem !== 2222) guasti.push(`(A/E) la memoria non ha lo stato atteso (${mem})`);
}

/* ── B: tre salvataggi a latenza decrescente → deve restare l'ultimo ── */
{
  const page = await apri();
  await page.evaluate(() => { window.__RACE.attivo = true; });
  await page.evaluate(() => { window.__RACE.prossimoRitardo = 3000; window.__CPM_CAREER.patch({ bankBalance: 111 }); });
  await sleep(800);
  await page.evaluate(() => { window.__RACE.prossimoRitardo = 1500; window.__CPM_CAREER.patch({ bankBalance: 222 }); });
  await sleep(800);
  await page.evaluate(() => { window.__RACE.prossimoRitardo = 10; window.__CPM_CAREER.patch({ bankBalance: 333 }); });
  await sleep(6000);
  const d = await disco(page);
  await page.close();
  console.log(`B) A→B→C con latenze decrescenti → disco ${d} (atteso 333)`);
  if (d !== 333) guasti.push(`(B) stato finale sul disco ${d} invece di 333`);
}

/* ── C: salvataggio normale, nessuna concorrenza → il fix non deve bloccare nulla ── */
{
  const page = await apri();
  await page.evaluate(() => { window.__CPM_CAREER.patch({ bankBalance: 4242 }); });
  await sleep(2500);
  const d = await disco(page);
  await page.close();
  console.log(`C) salvataggio normale → disco ${d} (atteso 4242)`);
  if (d !== 4242) guasti.push(`(C) REGRESSIONE: il salvataggio normale non funziona piu' (disco ${d})`);
}

/* ── D: ramo browser (localStorage sincrono) → invariato ── */
{
  const page = await apri({ nativo: false });
  await page.evaluate(() => { window.__CPM_CAREER.patch({ bankBalance: 777 }); });
  await sleep(2500);
  const d = await disco(page);
  await page.close();
  console.log(`D) ramo browser (localStorage) → disco ${d} (atteso 777)`);
  if (d !== 777) guasti.push(`(D) REGRESSIONE nel ramo browser: disco ${d} invece di 777`);
}

/* ── F: RIAPERTURA dell'app dopo un salvataggio → si rilegge davvero l'ultimo stato ──
   Non si usa page.reload(): al secondo caricamento il service worker registrato dal gioco intercetta
   le richieste e le route CDN del harness non lo attraversano, quindi la pagina non rimonta (limite
   dello strumento, non del gioco). Si riapre invece una seconda pagina nello STESSO contesto, che
   conserva localStorage: e' esattamente ciò che accade quando il giocatore riapre l'app. */
{
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' });
  const prep = async (p) => {
    await installCdnRoutes(p);
    await p.addInitScript(sv => { window.__CPM_GLB = false; if (!localStorage.getItem('cpm-v3')) localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, SAVE);
    await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
    await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
    await sleep(1500);
    try { await p.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
    await p.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 25000 });
    await sleep(1500);
  };
  const p1 = await ctx.newPage(); await prep(p1);
  await p1.evaluate(() => { window.__CPM_CAREER.patch({ bankBalance: 9090 }); });
  await sleep(2500);
  await p1.close();                                   // l'app si chiude
  const p2 = await ctx.newPage(); await prep(p2);      // e viene riaperta
  const dopo = await p2.evaluate(() => window.__CPM_CAREER.get().bank);
  await p2.close(); await ctx.close();
  console.log(`F) riapertura dopo salvataggio → saldo riletto ${dopo} (atteso 9090)`);
  if (dopo !== 9090) guasti.push(`(F) dopo la riapertura lo stato riletto e' ${dopo} invece di 9090`);
}

await b.close(); srv.close();
console.log(guasti.length ? `\n❌ FAIL — ${guasti.length}\n` + guasti.map(g => '  ✗ ' + g).join('\n')
  : '\n✅ PERSISTENZA MONOTONA OK (il piu\' recente vince sempre · nessun blocco del salvataggio normale · browser e bridge nativo coerenti)');
process.exit(guasti.length ? 1 : 0);
