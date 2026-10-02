#!/usr/bin/env node
/* [7.999.113 guardiano — collaudo PO-194 «partita gia' giocata, un'altra volta sempre alla 34esima giornata»]
   Salvataggio del PO riportato alla 38a settimana con la 34a giornata da giocare (fixtures/save-194-primavera-w38.json).
   Si gioca la gara con l'autoplay, al fischio si preme Invio a raffica come da tastiera.
   Si gioca la gara come il giocatore (playMatch(true): conferenza pre-partita lasciata aperta), al fischio si preme Invio solo per uscire da fine partita/cerimonia; sulla home della 39a non si tocca nulla per 5 s.
   Causa misurata: la conferenza si apriva INSIEME alla partita, compariva dopo il fischio e il discorso del mister che la segue
   riapriva la gara appena giocata (testimone __CPM_SM194: una sola chiamata a startMatch).
   VERDE → la conferenza compare PRIMA del campo; dopo il fischio nessuna conferenza ne' pre-partita; nello storico della stagione 1 l'Altoadige c'e' 2 volte (nessun doppione).
   ROSSO (__CPM_NO_CONF194) → si entra in campo subito e la conferenza pre-partita ricompare dopo il fischio. Uso: node partita-rigiocata-194.mjs */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_CONF194 = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  const pm = await page.evaluate(() => { try { return window.__CPM_CAREER.playMatch(true); } catch (e) { return 'err ' + e.message; } });
  await sleep(1500);
  const confPrima = await page.evaluate(() => /PRE-PARTITA/i.test(document.body.innerText || '') && !(window.__CPM_PHASE && window.__CPM_PHASE() === 'playing'));
  for (let k = 0; k < 14; k++) { const ph0 = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph0 === 'playing') break;
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null);
      const x = bs.find(b => /Diplomatico|Siamo pronti|Continua|Chiudi|Prosegui|Avanti/i.test(b.textContent || '') && !/Chiudi la stagione|Vivi la Settimana/i.test(b.textContent || '')); if (x) x.click(); });
    await sleep(900); }
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 1941, policy: 'seeded', tickMs: 150 }));
  const t0 = Date.now(); let ph; while (Date.now() - t0 < 400000) { ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph === 'ended' || ph === 'ceremony') break; await sleep(800); }
  let riaperta = false, quando = null;
  const settimana = () => page.evaluate(() => { try { return window.__CPM_CAREER.snapshot().week; } catch (e) { return null; } });
  for (let k = 0; k < 20 && (await settimana()) !== 39; k++) { await page.keyboard.press('Enter'); await sleep(400); }/* solo per uscire da fine partita e cerimonia */
  for (let k = 0; k < 10 && !riaperta; k++) { await sleep(500);/* sulla home non si tocca nulla: si guarda se la gara si ripresenta da sola */
    const t = await page.evaluate(() => document.body.innerText || ''); if (/PRE-PARTITA|Vedi le formazioni|Salta e gioca/i.test(t)) { riaperta = true; quando = k; } }
  if (riaperta) await page.screenshot({ path: new URL('./out/partita-rigiocata-194-' + (rosso ? 'rosso' : 'verde') + '.png', import.meta.url).pathname }).catch(() => {});
  await sleep(1500);
  const sn = await page.evaluate(() => { try { const s = window.__CPM_CAREER.snapshot(); const m = (s.calendar || []).find(x => !x.type && x.matchday === 34); return { week: s.week, season: s.season, giocata: !!(m && m.played), alto: (s.matchHistory || []).filter(h => (h.season || 1) === 1 && /Altoadige/.test(h.opponent || '') && !h.cup).length }; } catch (e) { return {}; } });
  await ctx.close(); return { pm, confPrima, fine: ph, riaperta, quando, ...sn };
}
const v = await braccio(false), r = await braccio(true);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_CONF194):', JSON.stringify(r));
const ok = v.pm === true && v.confPrima && !v.riaperta && v.week === 39 && v.giocata && v.alto === 2 && !r.confPrima && r.riaperta;
await b.close(); srv.close();
console.log(ok ? '✅ partita-rigiocata-194 verde (e il rosso si vede)' : '❌ partita-rigiocata-194 ROSSO'); process.exit(ok ? 0 : 1);
