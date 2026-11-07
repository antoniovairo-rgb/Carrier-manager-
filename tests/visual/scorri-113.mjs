/* [giro 113 PO-318 «quando cambio Tab del menù la posizione deve azzerarsi su»] guardiano dello scorrimento al cambio scheda.
   Scorre davvero `.cpm-scroll` (la finestra resta a 0). Verde: dopo OGNI cambio di scheda del menù lo scorrimento è 0; dopo ogni cambio
   di sottoscheda (Stagione/Carriera) le sottoschede sono in vista in cima e la parte sotto riparte da lì. Rosso __CPM_NO_G113 (= 182):
   resta in basso. Attese a evento (scheda attiva + due fotogrammi), mai tempi fissi. Misura prima/dopo in out/scorri-113.json. */
import fs from 'node:fs';
import { startServer, launchBrowser } from './lib/harness.mjs';
import { apriBancoV2 } from './lib/banco-v2.mjs';
const FORMATI = [{ k: 't360', w: 360, h: 800, touch: true }, { k: 't412', w: 412, h: 915, touch: true }, { k: 'pc', w: 1440, h: 900, touch: false }];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const frame2 = (page) => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const NAV = '.cpm-v2nav .cpm-nav-tabs button';
const stato = (page) => page.evaluate(() => { const el = document.querySelector('.cpm-scroll'); const tb = el && el.querySelector('.cpm-tabs40');
  const att = document.querySelector('.cpm-v2nav .cpm-nav-tabs button.cpm-tab-act');
  return { win: Math.round(window.scrollY), sc: el ? Math.round(el.scrollTop) : null, max: el ? Math.round(el.scrollHeight - el.clientHeight) : null, ch: el ? el.clientHeight : null,
    tabsTop: tb ? Math.round(tb.getBoundingClientRect().top - el.getBoundingClientRect().top) : null, att: att ? att.textContent.trim() : null }; });
async function scorriGiu(page) { await page.evaluate(() => { const el = document.querySelector('.cpm-scroll'); el.scrollTo({ top: Math.min(900, el.scrollHeight), behavior: 'instant' }); }); await frame2(page); }
async function cliccaEAttendi(page, loc, prima) { await loc.click({ timeout: 8000 }); await page.waitForFunction((p) => { const a = document.querySelector('.cpm-v2nav .cpm-nav-tabs button.cpm-tab-act'); return a && a.textContent.trim() !== p || true; }, prima, { timeout: 4000 }).catch(() => {}); await frame2(page); await frame2(page); }
const out = { verde: {}, rosso: {} }; const difetti = { verde: [], rosso: [] }; let cieco = [];
for (const rosso of [false, true]) for (const f of FORMATI) {
  const { ctx, page } = await apriBancoV2(b, port, f, { errs: [] });
  if (!page) { cieco.push('banco non aperto ' + f.k); continue; }
  if (rosso) await page.evaluate(() => { window.__CPM_NO_G113 = true; });
  const nomi = await page.$$eval(NAV, bs => bs.map(x => x.textContent.trim()));
  const rig = []; let alte = 0;
  for (let i = 0; i < nomi.length; i++) {
    /* parto da una scheda alta diversa dalla meta: la scheda dopo l'attuale nel giro, scorsa in basso */
    const src = (i + 1) % nomi.length; const bt = page.locator(NAV);
    await cliccaEAttendi(page, bt.nth(src), ''); await scorriGiu(page); const s0 = await stato(page);
    await cliccaEAttendi(page, bt.nth(i), s0.att); const s1 = await stato(page);
    const alta = s1.max > 150; if (alta) alte++;
    rig.push({ da: nomi[src], a: nomi[i], partenza: s0.sc, maxPartenza: s0.max, dopo: s1.sc, finestra: s1.win, maxDopo: s1.max });
  }
  /* sottoschede: Stagione (Classifica/Calendario/Coppe) e Carriera (Profilo/Nazionale) */
  const sub = [];
  for (const [cont, destinazioni] of [['stagione', ['Calendario', 'Coppe', 'Classifica']], ['carriera', ['Nazionale', 'Profilo']]]) {
    await page.evaluate((c) => window.__CPM_CAREER.goTab(c === 'stagione' ? 'standings' : 'profile'), cont); await frame2(page);
    for (const d of destinazioni) {
      const tb = page.locator('.cpm-tabs40 button', { hasText: d }).first(); if (!(await tb.count())) { sub.push({ cont, d, nonGiudicato: 'sottoscheda assente' }); continue; }
      await scorriGiu(page); const s0 = await stato(page);
      await cliccaEAttendi(page, tb, s0.att); const s1 = await stato(page);
      sub.push({ cont, d, partenza: s0.sc, maxPartenza: s0.max, dopo: s1.sc, tabsTop: s1.tabsTop, ch: s1.ch, maxDopo: s1.max });
    }
  }
  const arm = rosso ? 'rosso' : 'verde'; out[arm][f.k] = { rig, sub };
  for (const r of rig) { const ok = r.dopo === 0 && r.finestra === 0; console.log(`${arm.toUpperCase()} ${f.k} menù «${r.da}»→«${r.a}»: partenza ${r.partenza}/${r.maxPartenza} · dopo ${r.dopo} (max ${r.maxDopo}) win ${r.finestra} ${ok ? 'in cima' : 'RESTA GIÙ'}`); if (!ok && r.maxPartenza > 150) difetti[arm].push(`${f.k} menù ${r.da}→${r.a}: ${r.dopo}`); }
  for (const r of sub) { if (r.nonGiudicato) { console.log(`${arm.toUpperCase()} ${f.k} sotto ${r.cont}/${r.d}: non giudicato (${r.nonGiudicato})`); cieco.push(`${f.k} ${r.cont}/${r.d}: ${r.nonGiudicato}`); continue; }
    const ok = r.tabsTop != null && r.tabsTop >= -2 && r.tabsTop <= 0.6 * r.ch && r.dopo <= Math.max(0, r.partenza); console.log(`${arm.toUpperCase()} ${f.k} sotto ${r.cont}/${r.d}: partenza ${r.partenza}/${r.maxPartenza} · dopo ${r.dopo} · sottoschede a ${r.tabsTop}px dalla cima ${ok ? 'ok' : 'NON in cima'}`); if (!ok && r.maxPartenza > 150) difetti[arm].push(`${f.k} sotto ${r.cont}/${r.d}: tabs a ${r.tabsTop}, scroll ${r.dopo}`); }
  if (alte === 0) cieco.push(`${f.k}: nessuna scheda abbastanza alta da giudicare`);
  await ctx.close();
}
await b.close(); srv.close(); fs.mkdirSync('out', { recursive: true }); fs.writeFileSync('out/scorri-113.json', JSON.stringify(out, null, 1));
const vOK = difetti.verde.length === 0, rOK = difetti.rosso.length > 0 && FORMATI.every(f => difetti.rosso.some(d => d.startsWith(f.k)));
const ok = vOK && rOK && cieco.length === 0;
console.log(vOK ? '✅ verde: dopo ogni cambio di scheda/sottoscheda lo scorrimento è in cima nei 3 formati' : '❌ verde: restano posizioni in basso');
console.log(rOK ? '✅ rosso: con __CPM_NO_G113 resta in basso (il guardiano lo vede)' : '❌ rosso cieco');
console.log(`BRACCIO ${ok ? 'verde+rosso' : 'FALLITO'} · MOTIVO ${ok ? 'verde: 0 difetti · rosso: ' + difetti.rosso.length + ' (es. ' + difetti.rosso[0] + ')' : (cieco.length ? 'non giudicato: ' + cieco.slice(0, 2).join(' | ') : 'verde ' + difetti.verde.slice(0, 2).join(' | ') + ' · rosso ' + difetti.rosso.length)}`);
process.exit(ok ? 0 : 1);
