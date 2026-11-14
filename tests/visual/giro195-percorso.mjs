#!/usr/bin/env node
/* [giro 195 — collaudo usabilita'] SOLO MISURA. Esegue un PERCORSO di tocchi sulla carriera e conta i tocchi.
   Ogni passo e' il testo (o parte) di un bersaglio visibile; «@tab:nome» usa goTab del banco; «@attendi:ms» aspetta;
   «@misura» esegue la misura di giro195-schermate sulla vista corrente; «@js:codice» valuta in pagina.
   Dopo ogni passo stampa i bersagli visibili (cosi' si scopre il passo successivo) e scatta una foto.
   Uso: node giro195-percorso.mjs nome "passo1" "passo2" ...   [CPM_W=375 CPM_H=667 CPM_SAVE=... CPM_Q=?cpmtest=1 CPM_ZITTO=1] */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apri, entraCarriera, MISURA } from './giro195-schermate.mjs';

const [nome, ...passi] = process.argv.slice(2);
const W = +(process.env.CPM_W || 375), H = +(process.env.CPM_H || 667);
const OUT = path.join(ROOT, 'docs', 'collaudo', 'giro195', 'percorsi', nome); fs.mkdirSync(OUT, { recursive: true });
const SAVEF = process.env.CPM_SAVE || 'save-c177-s5w20.json';
const DUMP = JSON.parse(fs.readFileSync(new URL('./fixtures/' + SAVEF, import.meta.url)));
const LS = process.env.CPM_VUOTO ? null : (DUMP['cpm-v3'] ? DUMP : { 'cpm-v3': JSON.stringify(DUMP) });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const { ctx, page, errs } = await apri(b, W, H, { ls: LS, init: process.env.CPM_INIT ? new Function(process.env.CPM_INIT) : null });
if (process.env.CPM_VUOTO) { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${process.env.CPM_Q || '?cpmtest=1'}`, { waitUntil: 'load', timeout: 120000 }); await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1500); }
else await entraCarriera(page, port, process.env.CPM_Q || '?cpmtest=1');

const visibili = () => page.evaluate(() => {
  const VW = innerWidth, VH = innerHeight; const out = [];
  const rk = el => Object.keys(el).find(k => k.startsWith('__reactProps$'));
  for (const el of document.querySelectorAll('button,a,[role=button],input,select,div,span')) {
    const k = rk(el); const cl = ['BUTTON', 'A', 'INPUT', 'SELECT'].includes(el.tagName) || (k && el[k] && typeof el[k].onClick === 'function'); if (!cl) continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > VH || r.right < 0 || r.left > VW) continue;
    const cx = Math.min(VW - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(VH - 1, Math.max(0, r.top + r.height / 2)); const top = document.elementFromPoint(cx, cy);
    const libero = top && (el.contains(top) || top.contains(el));
    out.push(((el.getAttribute('aria-label') || el.innerText || el.value || '').replace(/\s+/g, ' ').trim().slice(0, 44) || '∅') + ` [${Math.round(r.width)}x${Math.round(r.height)}${libero ? '' : ' COPERTO'}${el.disabled ? ' SPENTO' : ''}]`);
  }
  return out;
});
async function tocca(testo) {
  /* il bersaglio cliccabile PIU' INTERNO che contiene il testo e non e' coperto */
  const ok = await page.evaluate((t) => {
    const VW = innerWidth, VH = innerHeight; const rk = el => Object.keys(el).find(k => k.startsWith('__reactProps$'));
    const c = [...document.querySelectorAll('button,a,[role=button],div,span,label')].filter(el => { const k = rk(el); const cl = ['BUTTON', 'A'].includes(el.tagName) || (k && el[k] && typeof el[k].onClick === 'function'); if (!cl || el.disabled) return false; const s = ((el.getAttribute('aria-label') || '') + ' ' + (el.innerText || '')).replace(/\s+/g, ' '); if (!s.toLowerCase().includes(t.toLowerCase())) return false; const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2; });
    if (!c.length) return null;
    c.sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length);
    for (const el of c) { el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (top && (el.contains(top) || top.contains(el))) { el.setAttribute('data-g195', '1'); return { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.top) }; } }
    return 'coperto';
  }, testo);
  if (!ok || ok === 'coperto') return ok;
  await page.locator('[data-g195="1"]').first().tap({ timeout: 4000 }).catch(async () => { await page.locator('[data-g195="1"]').first().click({ timeout: 4000, force: true }).catch(() => {}); });
  await page.evaluate(() => document.querySelectorAll('[data-g195]').forEach(e => e.removeAttribute('data-g195')));
  return ok;
}
let n = 0, tocchi = 0; const diario = [];
const foto = async (et) => { n++; const f = path.join(OUT, `${String(n).padStart(2, '0')}-${et.replace(/[^a-z0-9]+/gi, '_').slice(0, 30)}.png`); await page.screenshot({ path: f }); return path.basename(f); };
await foto('inizio');
if (!process.env.CPM_ZITTO) console.log('INIZIO:', (await visibili()).join(' | '));
for (const p of passi) {
  let esito;
  if (p.startsWith('@tab:')) esito = await page.evaluate(x => window.__CPM_CAREER.goTab(x), p.slice(5));
  else if (p.startsWith('@attendi:')) { await sleep(+p.slice(9)); esito = 'ok'; }
  else if (p.startsWith('@js:')) esito = await page.evaluate(p.slice(4)).catch(e => 'ERR ' + e.message);
  else if (p.startsWith('@auto:')) { /* @auto:max:fermati-quando-libero — tocca il primo bersaglio LIBERO (non barra, non testata) finche' il testo-meta e' libero */
    const [, mx, meta, evita] = p.split(':'); const fatti = [];
    for (let i = 0; i < +mx; i++) { const v = await visibili(); const lib = v.filter(x => !/COPERTO|SPENTO/.test(x));
      if (meta && lib.some(x => x.toLowerCase().includes(meta.toLowerCase()))) break;
      const c = lib.find(x => { const m = /\[(\d+)x(\d+)\]$/.exec(x); return m && +m[2] <= 200; } ) && lib.filter(x => { const m = /\[(\d+)x(\d+)\]$/.exec(x); return m && +m[2] <= 200; }).find(x => !/^(HOME|STAGIONE|CLUB|CARRIERA|AGENTE|UFFICIO|Salva carriera|Opzioni|☕|💡|∅)/.test(x) && !(evita && new RegExp(evita, 'i').test(x)));
      if (!c) { fatti.push('(nessun bersaglio libero)'); break; }
      const t = c.replace(/ \[\d+x\d+\]$/, ''); const r = await tocca(t.slice(0, 30)); if (r && r !== 'coperto') tocchi++; fatti.push(c + (r && r !== 'coperto' ? '' : ' !' + r)); await sleep(+(process.env.CPM_PAUSA || 900)); await foto('auto' + i); }
    esito = fatti; }
  else if (p === '@misura') { const m = await page.evaluate(MISURA); fs.writeFileSync(path.join(OUT, `misura-${n}.json`), JSON.stringify(m, null, 1)); esito = `bersagli ${m.T.n} <48:${m.T.sotto48} <44:${m.T.sotto44} <32:${m.T.sotto32} vicini ${m.V.n} tagliati ${m.C.n} schermi ${m.S.schermi} sfum ${m.G.n} senzaNome ${m.A.senzaNome} nonSem ${m.A.nonSemantici} titoli ${m.A.titoli} dialog ${m.A.dialog} live ${m.A.live}`; }
  else { esito = await tocca(p); if (esito && esito !== 'coperto') tocchi++; }
  await sleep(+(process.env.CPM_PAUSA || 900));
  const f = await foto(p);
  diario.push({ passo: p, esito, foto: f });
  console.log(`\n→ ${p} :: ${JSON.stringify(esito)} :: ${f}`);
  if (!process.env.CPM_ZITTO) console.log('   ', (await visibili()).join(' | ').slice(0, 1500));
}
console.log(`\nTOCCHI riusciti: ${tocchi} su ${passi.filter(p => !p.startsWith('@')).length} · pageerror: ${errs.length ? errs.slice(0, 2).join(' / ') : 0}`);
fs.writeFileSync(path.join(OUT, 'diario.json'), JSON.stringify({ nome, W, H, save: SAVEF, tocchi, diario }, null, 1));
await ctx.close(); await b.close(); srv.close();
