#!/usr/bin/env node
/* [giro 407 · PO-673 «C'è il rischio che si perda la presentazione alla nuova squadra. Troppo nascosta»] SONDA (non guardiano):
   salvataggio di prova S12 (fixture, mai salvataggi del PO) con presentedClub azzerato = appena firmato; misura sulla Home
   a 412x915 e 1280x900 dove sta la card della presentazione, il suo tasto, il tasto principale e le statistiche (figurina con
   forma/morale), e cosa sta sopra di lei. Uso: node misura-407.mjs [rosso] [foto-prefisso] */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const rosso = process.argv[2] === 'rosso'; const foto = process.argv[3] || '';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser(); const out = [];
for (const [w, h] of [[412, 915], [1280, 900]]) for (const week of [38, 3]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(s => { window.__CPM_GLB = false; if (s.r) window.__CPM_NO_G407 = 1; const c = { ...s }; delete c.r; localStorage.setItem('cpm-v3', JSON.stringify(c)); }, { ...save, r: rosso });
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate((wk) => window.__CPM_CAREER.patch({ presentedClub: '', week: wk }), week);
  await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll("*").forEach(e => { if (e.scrollTop > 0) e.scrollTop = 0; }); }); await sleep(500);
  const m = await page.evaluate(() => {
    const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), bot: Math.round(r.bottom + scrollY), vis: r.top >= 0 && r.bottom <= innerHeight && r.height > 0 }; };
    const btn = [...document.querySelectorAll('button')].find(x => /Vai in sala stampa/i.test(x.innerText));
    let card = btn; while (card && !(card.innerText || '').match(/PRESENTAZIONE ·|Presentazione ·/i)) card = card.parentElement; while (card && card.parentElement && (card.parentElement.innerText || '').length < 400 && /Presentazione/i.test(card.parentElement.innerText)) card = card.parentElement;
    const sopra = []; if (btn) { const yb = btn.getBoundingClientRect().top; document.querySelectorAll('[data-cpm]').forEach(e => { const r = e.getBoundingClientRect(); if (r.height > 20 && r.bottom < yb && e.offsetParent) sopra.push(e.getAttribute('data-cpm')); }); }
    const cta = document.querySelector('[data-cpm="avanza23"]');
    return { vh: innerHeight, card: R(card), tasto: R(btn), stats: R(document.querySelector('[data-cpm="eroe-v2"]')), cta: R(cta), ctaTesto: cta ? cta.innerText.replace(/\s+/g, ' ').slice(0, 80) : null,
      prossima: R(document.querySelector('[data-cpm="prossima-v2"]')), decidere: R(document.querySelector('[data-cpm="scelte199"]')), decidereN: (document.querySelector('[data-cpm="scelte199"]') || {}).dataset?.n || 0,
      pres407: !!document.querySelector('[data-cpm="scelta199-presentazione"]'), sopra: [...new Set(sopra)].slice(0, 20), wiz: !!document.querySelector('[data-cpm^="wiz"]'), pagina: document.documentElement.scrollHeight };
  });
  const r = { w, h, week, ...m }; out.push(r); console.log(JSON.stringify(r));
  if (foto) await page.screenshot({ path: `${foto}-${w}x${h}-w${week}.png` }).catch(() => {});
  await ctx.close();
}
await b.close(); srv.close();
fs.writeFileSync(new URL(`./out/misura-407${rosso ? '-rosso' : ''}.json`, import.meta.url), JSON.stringify(out, null, 1));
