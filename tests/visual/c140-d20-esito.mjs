#!/usr/bin/env node
/* [giro 140 · PO-337 D20] Dimensione del testo nel riquadro d'esito di un highlight (telefono 412x915).
   Forza alcune scene, risolve l'azione, censisce le foglie di testo visibili sotto 10 px e fra 10 e 11,5 px. Non tocca src/. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, resolveAction, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const ROOT = new URL('../../', import.meta.url).pathname; const FOTO = path.join(ROOT, 'docs/collaudo-grafico/140/foto');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true }); const page = await ctx.newPage(); await installCdnRoutes(page);
const { total } = await openMatch(page, port, {}); const R = { total, scene: [] };
const conta = () => page.evaluate(() => { const o = { sotto10: 0, da10a11: 0, tot: 0, min: 99, piccoli: [] }; const W = document.createTreeWalker(document.getElementById('root'), NodeFilter.SHOW_TEXT); let n;
  while ((n = W.nextNode())) { const t = n.textContent.trim(); if (t.length < 1) continue; const p = n.parentElement; const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.1) continue; const g = document.createRange(); g.selectNodeContents(n); const r = g.getBoundingClientRect(); if (r.width < 3 || r.height < 3 || r.bottom < 0 || r.top > innerHeight) continue;
    const fs = parseFloat(c.fontSize); o.tot++; if (fs < o.min) o.min = fs; if (fs < 10) { o.sotto10++; if (o.piccoli.length < 10) o.piccoli.push(fs + 'px «' + t.slice(0, 26) + '»'); } else if (fs < 11.5) o.da10a11++; } return o; });
for (const gi of [0, 12, 40, 80, 120]) { if (gi >= total) continue;
  await forceSituation(page, gi, { settle: 900 }); const a = await conta();
  await resolveAction(page, 0, { wait: 1300 }); const e = await conta();
  let foto = null; if (gi === 0 || gi === 40) { foto = path.join(FOTO, `d20-tel-esito-gi${gi}.jpg`); await page.screenshot({ path: foto, type: 'jpeg', quality: 70 }); foto = path.relative(ROOT, foto); }
  R.scene.push({ gi, scelta: a, esito: e, foto }); console.log(gi, JSON.stringify({ scelta: a, esito: e }).slice(0, 600)); }
fs.writeFileSync(path.join(ROOT, 'docs/collaudo-grafico/140/misure-d20-esito.json'), JSON.stringify(R, null, 1));
await ctx.close(); await b.close(); srv.close();
