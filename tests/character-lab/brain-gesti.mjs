/* [23/09] IL 3D PARLA COL BRAIN: GESTI DEL GIOCO VIVO. Partita vera (highlight risolti via hook, «Continua»), testimone
   `__CPM_BRAIN23` acceso con `__CPM_BRAIN_REC`: eventi del motore letti dal 3D, richieste di gesto per indice, gesti
   MONTATI davvero (per ruolo:gesto), quanti sul corpo con l'indice dichiarato dal motore, e i montaggi del gioco vivo
   che NON vengono dal brain (cronaca/scena). CPM_BASE=1 partita normale CH38, altrimenti review CGTrader.
   CPM_ROSSO=__CPM_NO_BRAINGESTI per il rosso appaiato. CPM_SEC durata reale, CPM_NOME seed della partita. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '../visual/lib/harness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.CPM_BASE === '1', ROSSO = process.env.CPM_ROSSO || '';
const server = await startServer();
const browser = await launchBrowser();
const page = await (await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 })).newPage();
const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 200)));
try {
  await page.addInitScript(r => { window.__CPM_BRAIN_REC = 1; window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; window.__CPM_REC = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} if (r) window[r] = true; }, ROSSO);
  await installCdnRoutes(page);
  await openMatch(page, server.address().port, { skipLoadAll: true, name: process.env.CPM_NOME || 'Brain Gesti', query: BASE ? {} : { hyperCharacter: 'cgtrader-highlight-optimized' } });
  if (!BASE) await page.waitForFunction(() => window.__CPM_HYPER_CASUAL_STATUS === 'ready-lineup', null, { timeout: 180000 }).catch(() => {});
  const t0 = Date.now(); let hl = 0, fasi = {};
  while (Date.now() - t0 < Number(process.env.CPM_SEC || 150) * 1000) {
    const f = await page.evaluate(() => window.__CPM_PHASE?.() || null).catch(() => null);
    fasi[f] = (fasi[f] | 0) + 1;
    if (f === 'ended') break;
    if (f === 'hl_choose') { await page.evaluate(k => window.__CPM_RESOLVE && window.__CPM_RESOLVE(k % 3), hl++).catch(() => {}); await sleep(2000); }
    if (f === 'hl_result') { await sleep(2500); await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Continua/i.test(x.textContent || '')); if (b) b.click(); }).catch(() => {}); }
    await sleep(500);
  }
  const W = await page.evaluate(() => { const w = window.__CPM_BRAIN23 || null; return w ? { ...w, log: (w.log || []).slice(0, 40) } : null; });
  const min = await page.evaluate(() => window.__CPM_STATE?.()?.minute ?? null).catch(() => null);
  const sintesi = { modo: BASE ? 'CH38' : 'CGTrader', rosso: ROSSO || null, minuto: min, fasi, highlight: hl,
    eventiLetti: W?.ev ?? 0, perTipo: W?.perTipo || {}, richieste: W?.richieste ?? 0, fuoriGioco: W?.fuoriGioco ?? 0, senzaCorpo: W?.senzaCorpo ?? 0,
    montatiBrain: W?.montati ?? 0, attoreGiusto: W?.attoreGiusto ?? 0, perGesto: W?.perGesto || {},
    montatiAltri: W?.altri ?? 0, perGestoAltri: W?.perGestoAltri || {}, errori };
  const out = path.join(here, 'brain-gesti'); fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, `${BASE ? 'ch38' : 'cgtrader'}${ROSSO ? '-rosso' : ''}.json`), JSON.stringify({ sintesi, log: W?.log || [] }, null, 1));
  console.log(JSON.stringify(sintesi, null, 1));
} finally { await browser.close(); server.close(); }
