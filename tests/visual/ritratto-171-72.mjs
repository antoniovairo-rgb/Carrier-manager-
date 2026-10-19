#!/usr/bin/env node
/* [giro 72 — collaudo 7.999.173 carriera D1, PO-171: «il diff 172→173 toglie il blocco FOTO PROFILO CH38: verificare il ritratto
   dell'eroe in tre schermate»] SONDA/GUARDIANO a 412x915, GLB ACCESO (direttiva PO 29/07), contesto nuovo per ogni schermata.
   Il ritratto dell'eroe oggi e' una FIGURINA del catalogo volti (src/01: voltoEroeId23 → _fileVolto23, file in assets/portraits/), non piu' un render CH38.
   Per ogni schermata (creazione, home della carriera, tab Carriera) si cerca nel DOM l'immagine il cui src e' il file del volto
   dell'eroe e si giudica: presente, caricata (naturalWidth > 0), visibile (box >= 24 px, dentro la viewport orizzontale).
   Si contano anche le <img> rotte della schermata e le richieste di file CH38 veri (assets/footballer… e anim-…: devono essere 0).
   ROSSO (CPM_ROSSO=1, rosso di STRUMENTO): le richieste dei file dei volti falliscono — il guardiano deve vedere il ritratto rotto.
   Foto in out/ritratto-171-72-<braccio>-<schermata>.png. Uso: node ritratto-171-72.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
async function schermata(nome, rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
  const ch38 = []; ctx.on('request', r => { if (/assets\/(footballer[^/]*|anim-[^/]*)\.glb/.test(r.url())) ch38.push(r.url().split('/').pop()); });
  let voltiNegati = 0;
  if (rosso) await ctx.route(/assets\/portraits\//, r => { voltiNegati++; return r.abort(); });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = true; if (o.save) localStorage.setItem('cpm-v3', JSON.stringify(o.save)); }, { save: nome === 'creazione' ? null : SAVE });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1500);
  if (nome === 'creazione') {
    await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => /Nuova carriera/i.test(b.textContent || '')); if (x) x.click(); });
    await sleep(2500);
    /* il volto dell'eroe compare al passo dell'aspetto: si avanza finche' non c'e' (tetto 6 passi), scrivendo un nome se serve */
    for (let k = 0; k < 6; k++) {
      const c = await page.evaluate(() => [...document.querySelectorAll('img')].some(i => /portraits/i.test(i.getAttribute('src') || '')));
      if (c) break;
      const inp = await page.$('input[type="text"],input:not([type])'); if (inp) { const v = await inp.inputValue().catch(() => ''); if (!v) await inp.fill('Mario Prova').catch(() => {}); }
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null && !b.disabled); const x = bs.find(b => /Avanti|Continua|Prosegui|Conferma/i.test(b.textContent || '')); if (x) x.click(); }); await sleep(1500);
    }
  } else {
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    if (nome === 'carriera') await page.evaluate(() => window.__CPM_CAREER.goTab('profile')).catch(() => {});
    await sleep(2500);
    if (nome === 'carriera') await page.waitForFunction(() => (document.body.innerText || '').length > 800, null, { timeout: 15000 }).catch(() => {});
  }
  const r = await page.evaluate(() => {
    let atteso = null; try { atteso = (typeof _fileVolto23 === 'function' && typeof voltoEroeId23 === 'function') ? _fileVolto23(voltoEroeId23()) : null; } catch (e) {}
    const imgs = [...document.querySelectorAll('img')];
    const volti = imgs.filter(i => /portraits/i.test(i.getAttribute('src') || ''));
    /* in creazione l'eroe non esiste ancora: il ritratto e' la carta grande del volto scelto (la piu' larga fra le immagini dei volti) */
    const eroe = atteso ? imgs.filter(i => (i.src || '').endsWith(atteso.replace(/^\.?\//, ''))) : volti.slice().sort((a, c) => c.getBoundingClientRect().width - a.getBoundingClientRect().width).slice(0, 1);
    const vis = eroe.map(i => { const q = i.getBoundingClientRect(); return { w: Math.round(q.width), h: Math.round(q.height), x: Math.round(q.left), y: Math.round(q.top), nat: i.naturalWidth, ok: i.complete && i.naturalWidth > 0 }; });
    return { atteso, testo: (document.body.innerText || '').length, volti: volti.length, eroe: vis, rotte: imgs.filter(i => i.complete && i.getAttribute('src') && i.naturalWidth === 0).length };
  });
  r.ch38 = ch38; r.errori = errs; r.voltiNegati = voltiNegati;
  await page.screenshot({ path: new URL(`./out/ritratto-171-72-${rosso ? 'rosso' : 'verde'}-${nome}.png`, import.meta.url).pathname, fullPage: false }).catch(() => {});
  await ctx.close(); return r;
}
const g = []; const SCH = (process.env.CPM_SCH || 'creazione,home,carriera').split(',');
const buono = r => r.eroe.some(e => e.ok && e.w >= 24 && e.h >= 24 && e.x >= 0 && e.x + e.w <= 412);
for (const [br, ro] of [['verde', false], ['rosso', true]]) for (const s of SCH) {
  const r = await schermata(s, ro);
  console.log(`${br} ${s}: volto atteso ${r.atteso} · img dei volti ${r.volti} · testo ${r.testo} · ritratto eroe ${JSON.stringify(r.eroe)} · img rotte ${r.rotte} · CH38 ${r.ch38.length} · errori ${r.errori.length}${ro ? ' · volti negati ' + r.voltiNegati : ''}`);
  if (!ro) { if (!buono(r)) g.push(`verde ${s}: ritratto dell'eroe assente o non caricato`); if (r.rotte) g.push(`verde ${s}: ${r.rotte} img rotte`); if (r.ch38.length) g.push(`verde ${s}: richieste CH38 ${r.ch38.join(',')}`); if (r.errori.length) g.push(`verde ${s}: errori ${r.errori.join(' | ')}`); }
  else if (buono(r)) g.push(`rosso ${s}: coi volti negati il ritratto risulta ancora buono (strumento cieco)`);
}
await b.close(); srv.close();
console.log(g.length ? '❌ ritratto-171-72\n  · ' + g.join('\n  · ') : '✅ ritratto-171-72 verde (ritratto dell\'eroe caricato in tre schermate, zero CH38) e il rosso si vede');
process.exit(g.length ? 1 : 0);
