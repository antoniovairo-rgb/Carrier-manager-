#!/usr/bin/env node
/* [PO] Ingresso in campo con GLB acceso (__CPM_GLB=true): posizione della card «Primavera 2» nel quadro
 * (terzo inferiore = centro oltre 2/3 dell'altezza) su 6 fotogrammi dell'ingresso. Solo misura, nessuna modifica.
 * I giocatori NON sono misurati qui: la camera e la proiezione dei corpi non sono esposte fuori dal render-loop.
 * Uso: CPM_CHROME=/opt/pw-browsers/chromium node ingresso-glb-card-test.mjs
 * Foto in docs/sviluppo/foto/ingresso-glb/. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
const out = path.join(ROOT, 'docs', 'sviluppo', 'foto', 'ingresso-glb'); fs.mkdirSync(out, { recursive: true });
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const W = 412, H = 915;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: W, height: H } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const errori = []; page.on('pageerror', e => errori.push(String(e).slice(0, 160)));
await page.addInitScript((s) => { window.__CPM_GLB = true; localStorage.setItem('cpm-v3', JSON.stringify(s)); }, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }).catch(() => {});
await sleep(1200); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2000);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
const pm = await page.evaluate(() => window.__CPM_CAREER.playMatch());
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
await page.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {});
await page.evaluate(() => window.__CPM_FORCE_WALKOUT && window.__CPM_FORCE_WALKOUT());
// la card «Primavera 2»: testo visibile, la piu' interna; misura posizione nel quadro
const misura = () => page.evaluate((h) => {
  const el = [...document.querySelectorAll('div,span,p')].filter(d => d.childElementCount === 0 && /primavera 2/i.test(d.innerText || '') && d.getBoundingClientRect().width > 0);
  if (!el.length) return null;
  const e = el[0]; const r = e.getBoundingClientRect();
  return { testo: e.innerText.trim().slice(0, 50), top: Math.round(r.top), bottom: Math.round(r.bottom), centro: Math.round((r.top + r.bottom) / 2), fasciaInferiore: (r.top + r.bottom) / 2 >= (2 / 3) * h, fase: window.__CPM_PHASE && window.__CPM_PHASE() };
}, H);
const fotogrammi = [];
for (let k = 0; k < 6; k++) {
  await sleep(700);
  const m = await misura();
  await page.screenshot({ path: path.join(out, `ingresso-${k + 1}.png`) });
  fotogrammi.push({ n: k + 1, ...m });
}
await ctx.close(); await b.close(); srv.close();
fs.writeFileSync(path.join(out, 'misure.json'), JSON.stringify({ W, H, pm, fotogrammi, errori }, null, 2));
console.log(`playMatch=${pm} · viewport ${W}×${H} · GLB on`);
for (const f of fotogrammi) console.log(f.n === undefined ? '' : `  f${f.n}: ${f ? (f.testo ? `«${f.testo}» top ${f.top}–${f.bottom}, centro ${f.centro} (${(f.centro / H * 100).toFixed(0)}% dell'altezza), fascia inferiore ${f.fasciaInferiore ? 'sì' : 'no'}, fase ${f.fase}` : 'card non trovata') : ''}`);
console.log(`  errori pagina: ${errori.length}${errori.length ? ' → ' + errori[0] : ''}`);
