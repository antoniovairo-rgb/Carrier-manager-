#!/usr/bin/env node
/* [7.999.114 guardiano — collaudo PO-195 «nel calendario fai vedere le avversarie!» e PO-196 «non si capisce in che serie giocano
   le squadre offerenti»] Salvataggio del PO a fine stagione Primavera 2 (fixtures/save-195-primavera-w39.json), 412x915.
   VERDE → nella griglia del calendario 34 caselle con la sigla dell'avversaria (la 38a dice «ALT · t»), e nelle offerte di fine U18
   ogni scheda dice lega e bandiera («Lega B · prima squadra» per il primo contratto, «Primavera 2 · giovanili» per restare).
   ROSSO (__CPM_NO_AVV195 + __CPM_NO_LEGA196) → nessuna delle due. Uso: node calendario-offerte-195.mjs */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-195-primavera-w39.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) { window.__CPM_NO_AVV195 = 1; window.__CPM_NO_LEGA196 = 1; } localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.getByText('Stagione', { exact: true }).first().click().catch(() => {}); await sleep(800);
  await page.locator('button', { hasText: 'Calendario' }).first().click().catch(() => {}); await sleep(800);
  const avv = await page.locator('[data-cpm="avv195"]').allInnerTexts();
  await page.getByText('Home', { exact: true }).first().click().catch(() => {}); await sleep(800);
  for (let k = 0; k < 30; k++) { if (await page.locator('text=LE TUE OPZIONI').first().isVisible().catch(() => false)) break;
    await page.evaluate(() => { const x = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).find(b => /Capito|Vivi la Settimana|Chiudi la stagione|Continua|Avanti|Prosegui|Aspettiamo|Ho capito|Vedi le offerte|Scegli|Salta|Chiudi$/i.test(b.textContent || '')); if (x) x.click(); }); await sleep(1500); }
  const opz = await page.locator('text=LE TUE OPZIONI').first().isVisible().catch(() => false);
  const leghe = await page.locator('[data-cpm="lega196"]').allInnerTexts();
  await ctx.close(); return { caselle: avv.length, ultima: avv[avv.length - 1] || null, opzioni: opz, leghe };
}
const v = await braccio(false), r = await braccio(true);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO:', JSON.stringify(r));
const ok = v.caselle === 34 && /ALT · t/.test(v.ultima || '') && v.opzioni && v.leghe.length >= 3 && v.leghe.some(t => /Lega B · prima squadra/.test(t)) && v.leghe.some(t => /giovanili/.test(t))
  && r.caselle === 0 && r.opzioni && r.leghe.length === 0;
await b.close(); srv.close();
console.log(ok ? '✅ calendario-offerte-195 verde (e il rosso si vede)' : '❌ calendario-offerte-195 ROSSO'); process.exit(ok ? 0 : 1);
