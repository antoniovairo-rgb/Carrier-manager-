#!/usr/bin/env node
/* [collaudo PO-292 · 7.999.177] ALLINEAMENTO DELLE COLONNE: per ogni formato misura sinistra/destra del CONTENITORE PRINCIPALE (la card piu' grande
   piu' stretta dello schermo) sulle schermate home, creazione, pre-partita, formazioni, ingresso in campo, partita 2D, partita 3D (highlight),
   e le dimensioni del canvas 3D. Serve a documentare i margini sbilanciati e lo spazio sprecato. NON modifica il gioco. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep, formatiScelti, nuovoContesto, premiTesto, scatta, salvaLog, log, bottoniVisibili, fase, tocca } from './c177-pctab-lib.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const colonna = (page) => page.evaluate(() => {
  const W = document.documentElement.clientWidth, H = innerHeight; let best = null, ba = 0;
  for (const e of document.body.querySelectorAll('div,section,main')) { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue; if (r.width < 300 || r.width > W * 0.96 || r.height < 150) continue; if (r.top > H * 0.6 || r.right < 0 || r.left > W) continue; if (cs.position === 'fixed') continue; const deco = (parseFloat(cs.borderTopLeftRadius) > 4) || cs.boxShadow !== 'none' || (cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor)); if (!deco) continue; const a = r.width * Math.min(r.height, H); if (a > ba) { ba = a; best = r; } }
  const cv = [...document.querySelectorAll('canvas')].map(c => { const r = c.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), l: Math.round(r.left) }; }).filter(c => c.w > 50);
  if (!best) return { W, H, nessuna: true, cv };
  return { W, H, sx: Math.round(best.left), dx: Math.round(W - best.right), larg: Math.round(best.width), cv };
});
for (const [sigla, f] of formatiScelti()) {
  console.log('=== ' + f.nome);
  const { ctx, page, errs } = await nuovoContesto(b, f, { fn: s => { try { if (!localStorage.getItem('cpm-v3')) localStorage.setItem('cpm-v3', JSON.stringify(s)); } catch (e) {} }, arg: SAVE }); await installCdnRoutes(page);
  const mis = {}; const M = async (nome) => { mis[nome] = await colonna(page); console.log('  ' + nome, JSON.stringify(mis[nome])); };
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(x => /Continua/.test(x.textContent || '')), null, { timeout: 90000 }); await sleep(1000);
  await M('home');
  await premiTesto(page, f, '^\\s*Nuova carriera\\s*$'); await sleep(1000); await M('creazione');
  await premiTesto(page, f, '← Home|Home'); await sleep(900);
  await premiTesto(page, f, 'Continua'); await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).catch(() => {}); await sleep(2500);
  await M('carriera-home');
  await page.evaluate(() => window.__CPM_CAREER.playMatch()); await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE(), null, { timeout: 30000 }).catch(() => {}); await sleep(1500);
  await M('prepartita'); await page.keyboard.press('Enter'); await sleep(1500); await M('formazioni');
  await page.keyboard.press('Enter'); await sleep(4000); await M('ingresso-in-campo');
  const sk = (await bottoniVisibili(page)).find(x => /Salta ingresso/.test(x.t)); if (sk) await tocca(page, f, sk.x + sk.w / 2, sk.y + sk.h / 2);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {}); await sleep(2500);
  await M('partita-2D');
  /* attende un highlight e misura il 3D */
  const t0 = Date.now(); while (Date.now() - t0 < 120000) { const p = await fase(page); if (/hl_(move|choose)/.test(p)) break; if (p === 'hl_intro') { if (f.touch) await tocca(page, f, 200, 300); else await page.keyboard.press('Space'); } await sleep(500); }
  await sleep(1200); await M('highlight-3D');
  log.push({ fmt: sigla, nome: 'colonne', mis });
  salvaLog('layout-' + sigla); await ctx.close();
}
await b.close(); srv.close();
