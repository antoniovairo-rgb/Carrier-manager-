/* [giro 340 PO-616/569/570] guardiano albo-340 (non-gate). Scheda Stagione → «Albo d'oro — storico campioni», «Capocannonieri»,
   «Marcatori storici», e scheda Coppe → «Storico delle coppe».
   Salvataggio di banco (Lega B, stagione 12) con: leagueArchive su DUE leghe della carriera (Lega B e Liga Oranje, con titoli
   dell'eroe, Coppa ed Euro), almanacco albo340 sintetico per Lega B e Premier Division (capocannonieri riconoscibili), alboCoppe340
   per la stagione 11.
   VERDE: nessun «I tuoi titoli» e nessuna sezione «N stag.» per le leghe della carriera; albo, capocannonieri della stagione
   (>= 3 righe) e marcatori storici dichiarano la lega della tendina (Lega B); si sceglie «Premier Division» nella tendina →
   albo, capocannonieri e marcatori storici passano a Premier Division e il loro contenuto cambia (capocannoniere sintetico
   della Premier presente, quello della Lega B assente); nella scheda Coppe lo storico esiste e cambiando coppa nella sua
   tendina cambia l'edizione mostrata; nessuno scroll orizzontale. Formati 360x800 · 412x915 · 1440x900.
   ROSSO window.__CPM_NO_G340 = schermata di oggi: deve far fallire in OGNI formato. «Non giudicato» = rosso.
   BRACCIO e MOTIVO stampati per ultimi. Uso: A340_FOTO=1 salva le foto in docs/sviluppo/foto-giro340/. */
import fs from 'node:fs';
import { startServer, launchBrowser } from './lib/harness.mjs';
import { apriBancoV2 } from './lib/banco-v2.mjs';
const FORMATI = [{ k: 't360', w: 360, h: 800, touch: true }, { k: 't412', w: 412, h: 915, touch: true }, { k: 'pc', w: 1440, h: 900, touch: false }];
const FOTO = !!process.env.A340_FOTO; const DIR = new URL('../../docs/sviluppo/foto-giro340/', import.meta.url).pathname;
if (FOTO) fs.mkdirSync(DIR, { recursive: true });
const ARCH = [[6, 'Liga Oranje', 'FC Rotterdam', 'FC Rotterdam', 1, 1, 0], [7, 'Liga Oranje', 'FC Rotterdam', 'FC Rotterdam', 1], [8, 'Liga Oranje', 'FC Eindhoven', 'FC Rotterdam', 2],
  [9, 'Lega B', 'FC Brescia', 'FC Salernum', 3], [10, 'Lega B', 'FC Salernum', 'FC Salernum', 1, 0, 1], [11, 'Lega B', 'FC Brescia', 'FC Salernum', 2]];
const ALBO = [];
for (const s of [9, 10, 11]) {
  ALBO.push({ s, lg: 'Lega B', podio: ['FC Brescia', 'FC Salernum', 'FC Palermo'], n: 18, cap: ['Bomber Lega' + s, 'FC Brescia', 20 + s, 0] });
  ALBO.push({ s, lg: 'Premier Division', podio: ['FC Merseyside', 'FC Manchester', 'FC Islington'], n: 20, cap: ['Bomber Prem' + s, 'FC Merseyside', 25 + s, 0] });
}
const COPPE = [{ s: 11, cup: { lg: 'Lega B', w: 'FC Coppa340', f: ['FC Coppa340', 'FC Brescia', 2, 1], cap: ['Bomber Coppa', 'FC Coppa340', 6, 0] }, eu: { UCL: { w: 'FC Euro340', f: null, cap: null }, UEL: { w: 'FC Europa340', f: null, cap: null }, UECL: { w: 'FC Conf340', f: null, cap: null } } }];
const PREP = `p.leagueArchive=${JSON.stringify(ARCH)}.map(a=>({season:a[0],league:a[1],champion:a[2],playerClub:a[3],playerPos:a[4],playerGoals:9,playerAssists:3,relegated:[],isPlayerCupChamp:!!a[5],isPlayerEuroChamp:!!a[6]}));p.albo340=${JSON.stringify(ALBO)};p.alboCoppe340=${JSON.stringify(COPPE)};`;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const frame2 = (page) => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const difetti = { verde: [], rosso: [] }; const cieco = []; const errs = []; const righe = [];
const apri = async (page, re) => { const bt = page.locator('button[aria-expanded]', { hasText: re }).first(); if (!(await bt.count())) return false; if ((await bt.getAttribute('aria-expanded')) === 'false') { await bt.click(); await frame2(page); } return true; };
const leggi = (page) => page.evaluate(() => { const q = (s) => document.querySelector(s); const t = (e) => e ? e.innerText.replace(/\s+/g, ' ').trim() : null;
  const m = q('[data-cpm="marcatori340"]'); return {
    albo: q('[data-cpm="albo340"]') ? { lg: q('[data-cpm="albo340"]').getAttribute('data-lega'), t: t(q('[data-cpm="albo340"]')) } : null,
    marc: m ? { lg: m.getAttribute('data-lega'), n: m.children.length, t: t(m) } : null,
    stor: q('[data-cpm="storici340"]') ? { lg: q('[data-cpm="storici340"]').getAttribute('data-lega'), t: t(q('[data-cpm="storici340"]')) } : null,
    titoli: /I tuoi titoli/i.test(document.body.innerText) || !!q('[data-cpm="albo122-riepilogo"]'),
    sezStag: [...document.querySelectorAll('button[aria-expanded]')].filter(x => /\d+\s*stag\./.test(x.textContent)).map(x => x.textContent.replace(/\s+/g, ' ').trim()),
    ovx: document.documentElement.scrollWidth - window.innerWidth }; });
for (const rosso of [false, true]) for (const f of FORMATI) {
  const arm = rosso ? 'rosso' : 'verde'; const D = (m) => difetti[arm].push(f.k + ' · ' + m);
  const { ctx, page } = await apriBancoV2(b, port, f, { errs, prep: PREP });
  if (!page) { cieco.push('banco non aperto ' + f.k + ' ' + arm); continue; }
  if (rosso) await page.evaluate(() => { window.__CPM_NO_G340 = true; });
  await page.evaluate(() => window.__CPM_CAREER.goTab('standings')); await frame2(page);
  if (!(await apri(page, /Albo d.oro/i))) { cieco.push('albo assente ' + f.k + ' ' + arm); await ctx.close(); continue; }
  await apri(page, /Capocannonieri/); await apri(page, /Marcatori storici/i);
  const a = await leggi(page);
  if (FOTO) { await page.locator('button', { hasText: /Albo d.oro/i }).first().scrollIntoViewIfNeeded(); await frame2(page); await page.screenshot({ path: DIR + (rosso ? 'prima' : 'dopo') + '-albo-legaB-' + f.k + '.png' }); }
  if (a.titoli) D('«I tuoi titoli» ancora nell\'albo');
  if (a.sezStag.length) D('sezioni per le leghe della carriera: ' + a.sezStag.join(' | '));
  if (!a.albo || a.albo.lg !== 'Lega B') D('albo non dichiara la lega della tendina (Lega B): ' + JSON.stringify(a.albo && a.albo.lg));
  else { if (!/Bomber Lega11/.test(a.albo.t)) D('albo Lega B senza il capocannoniere della S.11'); if (/Liga Oranje|FC Rotterdam/.test(a.albo.t)) D('albo Lega B con dati di un\'altra lega'); }
  if (!a.marc || a.marc.lg !== 'Lega B' || a.marc.n < 3) D('capocannonieri della stagione Lega B assenti o < 3: ' + JSON.stringify(a.marc && { lg: a.marc.lg, n: a.marc.n }));
  if (!a.stor || a.stor.lg !== 'Lega B') D('marcatori storici non dichiarano Lega B');
  /* cambio lega nella tendina */
  const sel = page.locator('select[data-cpm="lega23"]');
  if (!(await sel.count())) { cieco.push('tendina lega assente ' + f.k + ' ' + arm); await ctx.close(); continue; }
  await sel.selectOption('Premier Division'); await frame2(page);
  await apri(page, /Albo d.oro/i); await apri(page, /Capocannonieri/); await apri(page, /Marcatori storici/i);
  const p2 = await leggi(page);
  if (FOTO) { await page.locator('button', { hasText: /Albo d.oro/i }).first().scrollIntoViewIfNeeded(); await frame2(page); await page.screenshot({ path: DIR + (rosso ? 'prima' : 'dopo') + '-albo-premier-' + f.k + '.png' }); }
  if (!p2.albo || p2.albo.lg !== 'Premier Division') D('l\'albo non segue la tendina: ' + JSON.stringify(p2.albo && p2.albo.lg));
  else { if (!/Bomber Prem11/.test(p2.albo.t) || !/FC Merseyside/.test(p2.albo.t)) D('albo Premier senza campione/capocannoniere della Premier'); if (/Bomber Lega/.test(p2.albo.t)) D('albo Premier con il capocannoniere della Lega B'); if (a.albo && p2.albo.t === a.albo.t) D('albo identico dopo il cambio lega'); }
  if (!p2.marc || p2.marc.lg !== 'Premier Division' || p2.marc.n < 3) D('capocannonieri della stagione non seguono la tendina: ' + JSON.stringify(p2.marc && { lg: p2.marc.lg, n: p2.marc.n }));
  else if (a.marc && p2.marc.t === a.marc.t) D('capocannonieri identici dopo il cambio lega');
  if (!p2.stor || p2.stor.lg !== 'Premier Division') D('marcatori storici non seguono la tendina: ' + JSON.stringify(p2.stor && p2.stor.lg));
  else if (a.stor && p2.stor.t === a.stor.t) D('marcatori storici identici dopo il cambio lega');
  if (p2.ovx > 1 || a.ovx > 1) D('scroll orizzontale ' + Math.max(a.ovx, p2.ovx));
  /* coppe */
  await page.evaluate(() => window.__CPM_CAREER.goTab('coppe')); await frame2(page);
  await apri(page, /Storico delle coppe/);
  const c1 = await page.evaluate(() => { const e = document.querySelector('[data-cpm="coppe340"]'); return e ? { k: e.getAttribute('data-coppa'), t: e.innerText.replace(/\s+/g, ' ') } : null; });
  if (!c1) D('storico delle coppe assente');
  else {
    if (!/FC Coppa340/.test(c1.t) || !/Bomber Coppa/.test(c1.t)) D('coppa nazionale: edizione S.11 (vincitore/capocannoniere) assente');
    await page.locator('select[data-cpm="coppa340"]').selectOption('UCL'); await frame2(page);
    const c2 = await page.evaluate(() => { const e = document.querySelector('[data-cpm="coppe340"]'); return e ? { k: e.getAttribute('data-coppa'), t: e.innerText.replace(/\s+/g, ' ') } : null; });
    if (!c2 || c2.k !== 'UCL' || !/FC Euro340/.test(c2.t) || /FC Coppa340/.test(c2.t)) D('la tendina delle coppe non cambia lo storico');
    if (FOTO) { await page.locator('[data-cpm="coppe340"]').scrollIntoViewIfNeeded(); await frame2(page); await page.screenshot({ path: DIR + (rosso ? 'prima' : 'dopo') + '-coppe-' + f.k + '.png' }); }
  }
  if (!rosso && f.k === 'pc') { /* la fotografia di fine stagione (rollover) sul giocatore del banco: ogni lega con podio di 3 e capocannoniere */
    const fo = await page.evaluate(() => { try { const p = JSON.parse(localStorage.getItem('cpm-v3')).player; const st = ordinaClassifica259(p.standings || [], null);
      const l = fotoLeghe340(p, st); const c = fotoCoppe340(p); const leghe = [...new Set(CLUBS.filter(x => !x.isU18).map(x => x.lg))];
      return { n: l.length, leghe: leghe.length, buone: l.filter(x => x.podio.length === 3 && x.cap && x.cap[2] > 0).length, mia: (l.find(x => x.lg === p.club.lg) || {}).podio, primo: st[0] && st[0].n, coppe: !!(c && c.eu && c.eu.UCL && c.eu.UCL.w), kb: Math.round(JSON.stringify(l).length / 1024 * 10) / 10 }; } catch (e) { return { err: String(e) }; } });
    if (fo.err || fo.n < fo.leghe || fo.buone !== fo.n || !fo.mia || fo.mia[0] !== fo.primo || !fo.coppe) D('fotografia di fine stagione incompleta: ' + JSON.stringify(fo));
    righe.push(`FOTOGRAFIA pc: ${fo.n}/${fo.leghe} leghe, ${fo.buone} con podio+capocannoniere, lega dell'eroe = sua classifica (${fo.primo}), coppe ${fo.coppe}, ${fo.kb} KB per stagione`);
  }
  if (!rosso) righe.push(`VERDE ${f.k}: albo ${a.albo && a.albo.lg}→${p2.albo && p2.albo.lg} · capocannonieri ${a.marc && a.marc.n}→${p2.marc && p2.marc.n} righe · storici ${a.stor && a.stor.lg}→${p2.stor && p2.stor.lg} · coppe ${c1 ? 'si' : 'no'}`);
  await ctx.close();
}
await b.close(); srv.close();
if (errs.length) difetti.verde.push('pageerror: ' + errs[0]);
righe.forEach(r => console.log(r));
const vOK = difetti.verde.length === 0, rOK = FORMATI.every(f => difetti.rosso.some(d => d.startsWith(f.k)));
const ok = vOK && rOK && cieco.length === 0;
console.log(vOK ? '✅ verde: albo, capocannonieri e marcatori storici seguono la tendina, niente «I tuoi titoli», storico delle coppe, nei 3 formati' : '❌ verde:\n  ' + difetti.verde.join('\n  '));
console.log(rOK ? '✅ rosso: con __CPM_NO_G340 il guardiano boccia la schermata di prima (' + difetti.rosso.length + ' difetti)' : '❌ rosso cieco');
console.log(`BRACCIO ${ok ? 'verde+rosso' : 'FALLITO'} · MOTIVO ${ok ? 'verde: 0 difetti · rosso: ' + difetti.rosso.length + ' (es. ' + difetti.rosso[0] + ')' : (cieco.length ? 'non giudicato: ' + cieco.slice(0, 2).join('; ') : (vOK ? 'rosso cieco' : difetti.verde[0]))}`);
process.exit(ok ? 0 : 1);
