#!/usr/bin/env node
/* [giro 258] SONDA (non guardiano): la riga «▶ vs <avversario>» del calendario (riga-cal-v2) con TUTTI i nomi di squadra.
   Carriera in Primavera / pro; per ogni riga vista si prova ogni nome (CLUBS, U18, nazionali) nello stesso elemento e si
   conta quanti non ci stanno. Uso: CPM_VW=375 node sonda-cal-258.mjs  (CPM_ROSSO258=1 → __CPM_NO_G258) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const VW = +(process.env.CPM_VW || 375);
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: VW, height: 812 } }); await installCdnRoutes(page);
await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO_G258 = 1; }, process.env.CPM_ROSSO258 === '1');
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => typeof U18_CLUBS !== 'undefined', null, { timeout: 60000 });
await page.evaluate(() => { const club = [...U18_CLUBS].sort((a, b) => a.n.length - b.n.length)[0]; const s = 64;
  const pl = { name: 'Max Blond', nation: 'Italia', avatarId: 0, proStatus: 'u18', isU18: true, season: 1, week: 3, weekLived: false, age: 17, position: 'Attaccante', club,
    stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s }, ovr: s, form: 70, morale: 70, fatigue: 0, coachTrust: 60, popularity: 20,
    contract: { duration: 1, wage: 577, expiresAtSeason: 2 }, matchHistory: [], u18Seasons: 0, campDone: true, presidentModalSeason: 1, jerseyNumSeason: 1, drawSeen: 1, mercatoSeen: 1, presentSeason: 1, tutorialDone: true };
  localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); });
await page.reload({ waitUntil: 'load' }); await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
await page.evaluate(() => { try { window.__CPM_CAREER.resolveOpening(); } catch (e) {} });
await page.evaluate(() => window.__CPM_CAREER.goTab('calendar')); await sleep(1500);
const r = await page.evaluate(() => {
  const nomi = new Set(); try { for (const c of [...CLUBS, ...U18_CLUBS, ...U18_CLUBS_P2]) nomi.add(c.n); } catch (e) {}
  const out = { righe: [], fuori: [] };
  for (const riga of document.querySelectorAll('[data-cpm="riga-cal-v2"]')) {
    const el = riga.querySelector('[data-cpm="cal-avv-258"]') || riga.children[1].children[0];
    out.righe.push({ testo: el.innerText, cpm: el.getAttribute('data-cpm'), w: el.clientWidth, sw: el.scrollWidth });
  }
  out.scala = [...document.querySelectorAll('[data-cpm="cal-avv-258"]')].map(el => { const rg = document.createRange(); rg.selectNodeContents(el); return { intero: el.getAttribute('data-intero182'), mostrato: el.innerText, liv: el.getAttribute('data-nome182'), w: +el.getBoundingClientRect().width.toFixed(1), t: +rg.getBoundingClientRect().width.toFixed(1) }; });
  /* prova di TUTTI i nomi nella prima riga corrente e in una riga normale, a testo semplice come oggi */
  const cur = [...document.querySelectorAll('[data-cpm="riga-cal-v2"]')].slice(0, 2);
  for (const [i, riga] of cur.entries()) { const el = riga.children[1].children[0]; const orig = el.innerHTML;
    const r0 = el.getBoundingClientRect(); const box = r0.width; out['box' + i] = { box: +box.toFixed(1), cw: el.clientWidth, testo: el.innerText };
    for (const n of nomi) { el.textContent = (i === 0 ? '▶ ' : '') + 'vs ' + n; const rg = document.createRange(); rg.selectNodeContents(el); const w = rg.getBoundingClientRect().width;
      (out.tutti = out.tutti || []).push({ riga: i, n, w: +w.toFixed(1), box: +box.toFixed(1) }); if (w > box + 0.05) out.fuori.push({ riga: i, n, w: +w.toFixed(1), box: +box.toFixed(1) }); }
    el.innerHTML = orig; }
  out.nomi = nomi.size; return out; });
console.log(`${VW}px · righe viste ${r.righe.length} · nomi provati ${r.nomi}`);
for (const x of r.righe.slice(0, 6)) console.log(`  riga «${x.testo}» cpm=${x.cpm} ${x.sw}/${x.w}`);
console.log(JSON.stringify([r.box0,r.box1]));
for (const x of r.scala||[]) console.log(`  scala «${x.intero}» → «${x.mostrato}» liv ${x.liv} testo ${x.t}/${x.w}`);
console.log(`  nomi che NON ci stanno a testo semplice: riga corrente ${r.fuori.filter(x => x.riga === 0).length} · riga normale ${r.fuori.filter(x => x.riga === 1).length}`);
for (const x of (r.tutti||[]).filter(x=>x.riga===0).sort((a,b)=>b.w-a.w).slice(0,8)) console.log(`   max [0] ${x.n} ${x.w}/${x.box}`);
for (const x of r.fuori.slice(0, 40)) console.log(`   ✗ [${x.riga}] ${x.n} ${x.w}>${x.box}`);
await browser.close(); srv.close();
