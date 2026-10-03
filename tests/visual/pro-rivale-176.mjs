#!/usr/bin/env node
/* [7.999.120 guardiano — collaudo Codex PO-176 «salvataggio/ricarica», 6 differenze visibili al giocatore]
   Rivale (Profilo) e sponsor del club (Club) nascevano solo dalla migrazione al CARICAMENTO: passando professionista in sessione
   mancavano e comparivano alla prima ricarica. Salvataggio del PO a fine Primavera (fixtures/save-195-primavera-w39.json): si arriva
   alle offerte, si accetta il primo contratto e si legge lo stato SENZA ricaricare.
   VERDE → professionista con rivale e sponsor del club del nuovo club. ROSSO (__CPM_NO_PRO176) → professionista senza i due campi. */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-195-primavera-w39.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_PRO176 = 1; if (!sessionStorage.getItem('x176')) { sessionStorage.setItem('x176', '1'); localStorage.setItem('cpm-v3', JSON.stringify(s)); } }, [save, rosso]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  for (let k = 0; k < 30; k++) { if (await page.locator('text=LE TUE OPZIONI').first().isVisible().catch(() => false)) break;
    await page.evaluate(() => { const x = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).find(b => /Capito|Vivi la Settimana|Chiudi la stagione|Continua|Avanti|Prosegui|Aspettiamo|Ho capito|Vedi le offerte|Scegli|Salta|Chiudi$/i.test(b.textContent || '')); if (x) x.click(); }); await sleep(1500); }
  const opz = await page.locator('text=LE TUE OPZIONI').first().isVisible().catch(() => false);
  const prima = await page.evaluate(() => { try { const s = window.__CPM_CAREER.snapshot(); return { pro: s.proStatus, rival: !!s.rival, sponsor: !!s.clubSponsor }; } catch (e) { return null; } });
  await page.locator('button', { hasText: 'Accetta' }).first().click().catch(() => {}); await sleep(3000);
  const dopo = await page.evaluate(() => { try { const s = window.__CPM_CAREER.snapshot(); return { pro: s.proStatus, club: s.club && s.club.n, rival: s.rival ? s.rival.name : null, sponsor: s.clubSponsor ? s.clubSponsor.name + '/' + s.clubSponsor.clubId : null, clubId: s.club && (s.club.id || s.club.n) }; } catch (e) { return null; } });
  await ctx.close(); return { opzioni: opz, prima, dopo };
}
const v = await braccio(false), r = await braccio(true);
console.log('VERDE:', JSON.stringify(v)); console.log('ROSSO (__CPM_NO_PRO176):', JSON.stringify(r));
const ok = v.opzioni && v.dopo && v.dopo.pro === 'pro' && !!v.dopo.rival && !!v.dopo.sponsor && v.dopo.sponsor.endsWith('/' + v.dopo.clubId)
  && r.dopo && r.dopo.pro === 'pro' && !r.dopo.rival && !r.dopo.sponsor;
await b.close(); srv.close();
console.log(ok ? '✅ pro-rivale-176 verde (e il rosso si vede)' : '❌ pro-rivale-176 ROSSO'); process.exit(ok ? 0 : 1);
