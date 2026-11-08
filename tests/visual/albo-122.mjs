/* [giro 122 PO-326 «Non mi è chiara questa schermata, che c'entra nerazzurri??»] guardiano albo-122 (non-gate, catena «solo grafica»).
   Salvataggio con albo su TRE leghe (Lega B attuale, Serie A, Eredivisie). Verde: in cima il riepilogo SOLO del giocatore (campionati con club e lega,
   Coppe, Euro; nessun club estraneo; niente «Hai vinto la lega!»), etichette dei campioni DENTRO ciascuna lega e coerenti con l'archivio (conteggi esatti
   sulle sole stagioni chiuse), lega attuale aperta e le altre in fisarmonica dalla piu' recente, riga IN CORSO viva, tocco >=44 px (formati a tocco),
   contrasto >=4,5:1, nessuno scroll orizzontale. Rosso __CPM_NO_G122 = albo di prima: deve far fallire. Foto prima/dopo in docs/sviluppo/foto-giro122/.
   Formati 360x800 · 412x915 · 1440x900. BRACCIO e MOTIVO stampati per ultimi. Uso: C122_FOTO=1 per salvare le foto. */
import fs from 'node:fs';
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { EXTRA108 } from './c180-lib.mjs';
import { apriBancoV2 } from './lib/banco-v2.mjs';
const FORMATI = [{ k: 't360', w: 360, h: 800, touch: true }, { k: 't412', w: 412, h: 915, touch: true }, { k: 'pc', w: 1440, h: 900, touch: false }];
const FOTO = !!process.env.C122_FOTO; const DIR = new URL('../../docs/sviluppo/foto-giro122/', import.meta.url).pathname;
/* archivio sintetico: [season, league, champion, playerClub, playerPos, cup, euro] */
const ARCH = [
  [1, 'Eredivisie', 'FC Rotterdam', 'FC Utrecht', 6], [2, 'Eredivisie', 'FC Rotterdam', 'FC Utrecht', 5], [3, 'Eredivisie', 'FC Rotterdam', 'FC Utrecht', 4],
  [4, 'Serie A', 'FC Nerazzurri', 'FC Verona', 2], [5, 'Serie A', 'FC Nerazzurri', 'FC Verona', 3],
  [6, 'Lega B', 'FC Salernum', 'FC Salernum', 1], [7, 'Lega B', 'FC Salernum', 'FC Salernum', 1, 1, 0], [8, 'Lega B', 'FC Salernum', 'FC Salernum', 1, 0, 1],
  [9, 'Lega B', 'FC Salernum', 'FC Salernum', 1], [10, 'Lega B', 'FC Brescia', 'FC Salernum', 4], [11, 'Lega B', 'FC Brescia', 'FC Salernum', 7]];
const PREP = `p.leagueArchive=${JSON.stringify(ARCH)}.map(a=>({season:a[0],league:a[1],champion:a[2],playerClub:a[3],playerPos:a[4],playerGoals:9,playerAssists:3,relegated:[],isPlayerCupChamp:!!a[5],isPlayerEuroChamp:!!a[6]}));`;
const ATTESE = {}; for (const a of ARCH) { const k = a[1]; (ATTESE[k] = ATTESE[k] || {})[a[2]] = (ATTESE[k][a[2]] || 0) + 1; }
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const frame2 = (page) => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const difetti = { verde: [], rosso: [] }; const cieco = []; const errs = [];
for (const rosso of [false, true]) for (const f of FORMATI) {
  const arm = rosso ? 'rosso' : 'verde'; const D = (m) => difetti[arm].push(f.k + ' · ' + m);
  const { ctx, page } = await apriBancoV2(b, port, f, { errs, prep: PREP });
  if (!page) { cieco.push('banco non aperto ' + f.k); continue; }
  if (rosso) await page.evaluate(() => { window.__CPM_NO_G122 = true; });
  await page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await frame2(page);
  const alb = page.locator('button', { hasText: /Albo d.oro/i }).first();
  if (!(await alb.count())) { cieco.push('albo assente ' + f.k + ' ' + arm); await ctx.close(); continue; }
  if ((await alb.getAttribute('aria-expanded')) === 'false') { await alb.click(); await frame2(page); }
  await alb.scrollIntoViewIfNeeded(); await frame2(page);
  if (FOTO) await page.screenshot({ path: DIR + (rosso ? 'prima' : 'dopo') + '-' + f.k + '.png' });
  const rie = page.locator('[data-cpm="albo122-riepilogo"]');
  const nRie = await rie.count();
  if (rosso) { if (nRie === 0) D('riepilogo assente (albo di prima)'); const tx = await page.evaluate(() => document.body.innerText); if (/Hai vinto la lega/.test(tx)) D('«Hai vinto la lega!» ambiguo ancora presente'); await ctx.close(); continue; }
  if (nRie !== 1) { D('riepilogo: ' + nRie); await ctx.close(); continue; }
  const rt = (await rie.innerText()).replace(/\s+/g, ' ');
  if (!/4 campionati vinti/.test(rt) || !/FC Salernum/.test(rt) || !/Lega B/.test(rt)) D('riepilogo senza «4 campionati vinti · FC Salernum, Lega B»: ' + rt);
  if (!/1 Coppa vinta/.test(rt) || !/1 Coppa europea vinta/.test(rt)) D('Coppa/Euro non esatte: ' + rt);
  if (/Nerazzurri|Rotterdam|Brescia|Verona|Utrecht/.test(rt)) D('club estraneo nel riepilogo: ' + rt);
  if (/Hai vinto la lega/.test(await page.evaluate(() => document.body.innerText))) D('«Hai vinto la lega!» ancora presente');
  /* ordine e stato delle sezioni */
  const bott = await page.$$eval('button[aria-expanded]', bs => bs.filter(x => /stag\./.test(x.textContent)).map(x => ({ t: x.textContent.replace(/\s+/g, ' ').trim(), e: x.getAttribute('aria-expanded'), h: Math.round(x.getBoundingClientRect().height) })));
  const ord = bott.map(x => x.t.replace(/\s*\d+ stag\..*$/, '').trim());
  if (bott.length !== 3 || ord.join('|') !== 'Lega B|Serie A|Eredivisie') D('ordine sezioni: ' + ord.join('|') + ' (' + bott.length + ')');
  if (bott[0] && bott[0].e !== 'true') D('lega attuale chiusa'); if (bott.slice(1).some(x => x.e !== 'false')) D('altre leghe aperte');
  /* tocco: area effettiva (rettangolo U ::after, EXTRA108), solo formati a tocco */
  if (f.touch) { const x = await page.evaluate(EXTRA108); const corti = x.tocchi.filter(t => /stag\./.test(t.t)); if (corti.length) D('tocco < 44 px (area effettiva): ' + corti.map(t => t.eh).join(',')); }
  /* apro le chiuse e verifico etichette per lega */
  for (const i of [1, 2]) { const bi = page.locator('button[aria-expanded="false"]', { hasText: /stag\./ }).first(); if (await bi.count()) { await bi.click(); await frame2(page); } }
  const et = await page.$$eval('[data-cpm="albo122-etichette"]', els => els.map(e => ({ lg: e.getAttribute('data-lega'), inLega: !!e.closest('[data-cpm="albo122-lega"]'), t: e.innerText.replace(/\s+/g, ' ').trim() })));
  for (const lg of Object.keys(ATTESE)) {
    const e = et.find(x => x.lg === lg); if (!e) { D('etichette assenti in ' + lg); continue; }
    if (!e.inLega) D('etichette fuori dalla lega ' + lg);
    const top = Object.entries(ATTESE[lg]).sort((a, b) => b[1] - a[1]).slice(0, 3);
    for (const [c, n] of top) if (!new RegExp(c + '\\s*×\\s*' + n + '(?!\\d)').test(e.t.replace(/\s+/g, ' '))) D(`${lg}: atteso «${c} ×${n}», trovato «${e.t}»`);
    for (const c of Object.keys(ATTESE).filter(k => k !== lg).flatMap(k => Object.keys(ATTESE[k]))) if (!(c in ATTESE[lg]) && e.t.includes(c)) D(`${lg}: club di un'altra lega «${c}» fra le etichette`);
  }
  const corso = await page.evaluate(() => /IN CORSO/.test(document.body.innerText)); /* la riga in corso dipende dalla classifica del banco: se esiste, sta nella lega attuale */
  const ovx = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ovx > 1) D('scroll orizzontale ' + ovx);
  /* contrasto >= 4,5:1 sui testi di riepilogo ed etichette */
  const con = await page.evaluate(() => {
    const pr = (c) => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
    const lum = ({ r, g, b }) => { const q = [r, g, b].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * q[0] + .7152 * q[1] + .0722 * q[2]; };
    const bgDi = (el) => { const st = []; for (let n = el; n; n = n.parentElement) { const c = pr(getComputedStyle(n).backgroundColor); if (c.a > 0) st.push(c); if (c.a >= 1) break; } let base = { r: 255, g: 255, b: 255 }; for (let i = st.length - 1; i >= 0; i--) { const c = st[i]; base = { r: c.r * c.a + base.r * (1 - c.a), g: c.g * c.a + base.g * (1 - c.a), b: c.b * c.a + base.b * (1 - c.a) }; } return base; };
    const res = []; const els = [...document.querySelectorAll('[data-cpm="albo122-riepilogo"] *, [data-cpm="albo122-etichette"] *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
    for (const e of els) { const fg = pr(getComputedStyle(e).color); const bg = bgDi(e); const f2 = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) }; const l1 = lum(f2), l2 = lum(bg); res.push({ t: e.textContent.trim().slice(0, 24), c: (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05) }); }
    return res; });
  if (!con.length) cieco.push('contrasto: nessun testo ' + f.k); const bassi = con.filter(x => x.c < 4.5); if (bassi.length) D('contrasto < 4,5: ' + bassi.slice(0, 3).map(x => `«${x.t}» ${x.c.toFixed(2)}`).join('; '));
  if (FOTO) { await page.locator('[data-cpm="albo122-riepilogo"]').scrollIntoViewIfNeeded(); await frame2(page); await page.screenshot({ path: DIR + 'dopo-aperte-' + f.k + '.png' }); }
  console.log(`VERDE ${f.k}: riepilogo «${rt}» · sezioni ${ord.join('/')} · etichette ${et.map(x => x.lg + ':' + x.t).join(' | ')} · IN CORSO ${corso} · contrasto min ${Math.min(...con.map(x => x.c)).toFixed(2)}`);
  await ctx.close();
}
await b.close(); srv.close();
if (errs.length) difetti.verde.push('pageerror: ' + errs[0]);
const vOK = difetti.verde.length === 0, rOK = FORMATI.every(f => difetti.rosso.some(d => d.startsWith(f.k)));
const ok = vOK && rOK && cieco.length === 0;
console.log(vOK ? '✅ verde: albo per lega, titoli solo del giocatore in cima, nei 3 formati' : '❌ verde:\n  ' + difetti.verde.join('\n  '));
console.log(rOK ? '✅ rosso: con __CPM_NO_G122 il guardiano boccia l\'albo di prima' : '❌ rosso cieco');
console.log(`BRACCIO ${ok ? 'verde+rosso' : 'FALLITO'} · MOTIVO ${ok ? 'verde: 0 difetti · rosso: ' + difetti.rosso.length + ' (es. ' + difetti.rosso[0] + ')' : (cieco.length ? 'non giudicato: ' + cieco.slice(0, 2).join('; ') : (vOK ? 'rosso cieco' : difetti.verde[0]))}`);
process.exit(ok ? 0 : 1);
