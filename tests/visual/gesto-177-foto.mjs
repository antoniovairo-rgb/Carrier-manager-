#!/usr/bin/env node
/* [giro 177 PO-367] FOTOGRAMMI DEL RIGORE, prima e dopo la correzione — strumento, non guardiano.
   Stessa scena e stesso seme nei due bracci (prima = interruttore rosso __CPM_NO_G177; dopo = gioco com'e'), tempo virtuale: si avanza
   di UN fotogramma alla volta e si fotografa ogni fotogramma dal montaggio del gesto; la partenza del pallone e' rilevata in diretta
   (__CPM_CONT121). Da quella serie si prendono: prima (−12 fotogrammi = −0,20 s), contatto (pallone parte), dopo (+12), e la sequenza
   di 10 fotogrammi attorno al contatto (da −5 a +4). Telefono 412x915 e PC 1280x800, scala 2. Ritaglio centrato fra eroe e pallone.
   Scrive le tavole in docs/sviluppo/giro177/.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node gesto-177-foto.mjs [gi] [az]   (default gi5 az.0)
        CPM_FLAGS='{"__CPM_SI_PUN177":1}' CPM_NOME=punizione-prova node gesto-177-foto.mjs 13 0 */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, __dirname as LIBDIR } from './lib/harness.mjs';
import { pagina170, avanti } from './lib/gesti-170b.mjs';

const DOC = path.join(LIBDIR, '..', '..', '..', 'docs', 'sviluppo', 'giro177'); fs.mkdirSync(DOC, { recursive: true });
const gi = +(process.argv[2] || 5), k = +(process.argv[3] || 0), NOME = process.env.CPM_NOME || 'rigore'; const EXTRA = process.env.CPM_FLAGS ? JSON.parse(process.env.CPM_FLAGS) : {};
const DEV = [['telefono', 412, 915, 240], ['pc', 1280, 800, 300]];
const srv = await startServer(); const b = await launchBrowser(); const T = {};
const stato = page => page.evaluate(() => { const G = window.__G170; const p = window.__CPM_PROBE && window.__CPM_PROBE(); const g = window.__CPM_GST; const cv = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0]; const r = cv ? cv.getBoundingClientRect() : null;
  return { f: G.f, na: (window.__CPM_CONT121 || []).length, g: g ? [g.cur, g.w, g.ct] : null, hero: p && p.hero ? p.hero.ndc : null, ball: p && p.ball ? p.ball.ndc : null, r: r ? [r.left, r.top, r.width, r.height] : null }; });
for (const braccio of ['prima', 'dopo']) for (const [dev, vw, vh, lato] of DEV) {
  const flags = { ...EXTRA }; if (braccio === 'prima') { flags.__CPM_NO_G177 = true; delete flags.__CPM_SI_PUN177; }
  const page = await pagina170(b, srv.address().port, { vw, vh, scala: 2, flags });
  await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; window.__CPM_FROZEN = false; });
  const tot = await page.evaluate(() => SITUATIONS.length);
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), (gi + 61) % tot); await avanti(page, 700);
  await page.evaluate(() => window.__SEME170_RESET(1)); await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await avanti(page, 1400);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; delete window.__CPM_FORCE_KIND; const G = window.__G170; G.fr = []; G.on = true; G.f = 0; window.__CPM_CONT121 = []; });
  await avanti(page, 600); await page.evaluate(kk => window.__CPM_RESOLVE(kk), k);
  const scatti = []; let partenza = -1, centro = null;
  for (let n = 0; n < 220; n++) { await page.clock.runFor(17); const s = await stato(page); if (!s.hero || !s.r) continue;
    if (!(s.g && s.g[0]) && partenza < 0 && !scatti.length) continue;/* si comincia dal montaggio del gesto */
    if (!centro && s.ball) centro = s.ball;/* ritaglio FISSO sul punto di battuta: il confronto fra fotogrammi resta leggibile */
    const c = centro || s.hero; const cx = s.r[0] + (c.x + 1) / 2 * s.r[2], cy = s.r[1] + (1 - (c.y + 1) / 2) * s.r[3] - lato * 0.22;
    const x = Math.max(0, Math.min(vw - lato, cx - lato / 2)), y = Math.max(0, Math.min(vh - lato, cy - lato / 2));
    const buf = await page.screenshot({ clip: { x, y, width: lato, height: lato }, type: 'jpeg', quality: 88 });
    scatti.push({ f: s.f, na: s.na, g: s.g, b64: buf.toString('base64') });
    if (partenza < 0 && s.na > 0) partenza = scatti.length - 1;
    if (partenza >= 0 && scatti.length - 1 >= partenza + 14) break; }
  await page.context().close();
  T[braccio + '/' + dev] = { scatti, partenza };
  console.log(`${braccio} ${dev}: ${scatti.length} fotogrammi, partenza al ${partenza >= 0 ? 'fotogramma ' + scatti[partenza].f : 'MAI'}`);
}
const ctx = await b.newContext({ viewport: { width: 1240, height: 900 }, deviceScaleFactor: 1 }); const pg = await ctx.newPage();
const fig = (x, et, w, z = 1) => x ? `<figure><div style="width:${w}px;height:${w}px;overflow:hidden"><img style="width:${w * z}px;height:${w * z}px;margin-left:${-(w * z - w) / 2}px;margin-top:${-Math.min(w * z - w, Math.max(0, w * z * 0.72 - w * 0.62))}px" src="data:image/jpeg;base64,${x.b64}"></div><figcaption>${et}${x.g && x.g[0] ? ' · clip a ' + (+x.g[2]).toFixed(2) + ' s' : ''}</figcaption></figure>` : `<figure><div style="width:${w}px;height:${w}px;background:#222"></div><figcaption>${et} — non registrato</figcaption></figure>`;
const CSS = `<style>body{margin:0;background:#111;color:#eee;font:13px system-ui;padding:12px}h1{font-size:17px;margin:0 0 4px}h2{font-size:14px;margin:10px 0 4px}p{margin:0 0 8px;opacity:.8}.r{display:flex;gap:8px;margin-bottom:6px;flex-wrap:wrap}figure{margin:0}img{display:block}figcaption{font-size:11px;padding:3px 0}</style>`;
for (const [dev] of DEV) {
  const riga = br => { const t = T[br + '/' + dev]; const p = t.partenza; return `<h2>${br === 'prima' ? 'PRIMA (interruttore rosso __CPM_NO_G177)' : 'DOPO (correzione del giro 177)'}</h2><div class=r>${fig(p >= 12 ? t.scatti[p - 12] : t.scatti[0], 'prima: 0,20 s prima della partenza del pallone', 380)}${fig(t.scatti[p], 'contatto: il fotogramma in cui il pallone parte', 380)}${fig(t.scatti[p + 12], 'dopo: 0,20 s dopo', 380)}</div>`; };
  await pg.setContent(`${CSS}<h1>${NOME} — scena gi${gi} az.${k}, seme 1 — ${dev === 'telefono' ? 'TELEFONO 412×915' : 'PC 1280×800'}, scala 2</h1><p>Stessa scena e stesso seme nei due bracci. Ritaglio fisso sul punto di battuta.</p>${riga('prima')}${riga('dopo')}`);
  await pg.screenshot({ path: path.join(DOC, `${NOME}-${dev}.jpg`), type: 'jpeg', quality: 84, fullPage: true });
  for (const br of ['prima', 'dopo']) { const t = T[br + '/' + dev]; const p = t.partenza; const seq = []; for (let i = -5; i <= 4; i++) seq.push(fig(t.scatti[p + i], i === 0 ? 'PARTENZA del pallone' : (i > 0 ? '+' : '') + i + ' f (' + (i * 16.7).toFixed(0) + ' ms)', 232, 2.2));
    await pg.setContent(`${CSS}<h1>${NOME} — sequenza attorno al contatto — ${br.toUpperCase()}${br === 'prima' ? ' (interruttore rosso)' : ''} — ${dev}, scala 2</h1><p>10 fotogrammi consecutivi (1 fotogramma = 1/60 s di scena), da 5 prima a 4 dopo la partenza del pallone; ingrandimento 2,2 sul punto di battuta. Scena gi${gi} az.${k}, seme 1.</p><div class=r>${seq.slice(0, 5).join('')}</div><div class=r>${seq.slice(5).join('')}</div>`);
    await pg.screenshot({ path: path.join(DOC, `${NOME}-sequenza-${br}-${dev}.jpg`), type: 'jpeg', quality: 84, fullPage: true }); }
}
await b.close(); srv.close(); console.log('FINE tavole in docs/sviluppo/giro177/');
