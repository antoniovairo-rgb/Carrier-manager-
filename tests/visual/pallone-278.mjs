#!/usr/bin/env node
/* [giro 55 PO-278] GUARDIANO DEL PALLONE: TAGLIA E NITIDEZZA IN TUTTE LE FASI.
   Nota PO (foto dal telefono, ingresso in campo): «Pallone troppo grosso e non ben definito graficamente»,
   precisata «il pallone in tutte le partite» (anche in gioco e negli highlight).
   Misura, a 412x915 con i GLB accesi, in tre fasi — INGRESSO (carriera vera, __CPM_WALKTEST74), PARTITA
   (primo highlight del flusso in autoplay col pallone nel quadro, fuori da hl_intro che ha il velo sfocato; in `playing` il campo e' la lavagna 2D) e HIGHLIGHT (scena forzata, congelata):
   · RAPPORTO pallone/uomo alla stessa profondita' (gancio test-only __CPM_PALL278: diametro a schermo lungo il
     vettore destro della camera, quindi senza scorcio, / altezza a schermo di un uomo di 1,75u in piedi sul punto
     del pallone). Calcio vero: 22 cm su 180 = 0,12. E' una grandezza geometrica: vale anche col pallone fuori
     dal quadro (succede nell'ingresso in headless, dove il tempo di scena scorre lento e la camera resta sul tunnel).
   · NITIDEZZA sulla foto: attorno al punto proiettato si contano i pixel CHIARI (pallone) e quelli ALONATI
     (piu' chiari del prato attorno ma non pallone): quota alone = alonati / (chiari+alonati). Un alone
     bianco semitrasparente (ballHalo, depthTest spento, raggio 1,45 volte il pallone) alza questa quota.
   VERDE: rapporto in [0,08 ; 0,19] in tutte le fasi misurate (in camera larga, uomo sotto i 30 px, fino a 0,27:
   li' il pallone vero sarebbe di 2 px e vale il pavimento di leggibilita' di 4 px) e quota alone <= 0,45. ROSSO (__CPM_NO_PALL278):
   torna il pallone di prima — rapporto 0,25 in gioco e l'alone — e almeno una delle due soglie deve cadere.
   Uso: node pallone-278.mjs   (CPM_SOLO=verde|rosso per un braccio solo; foto in out/pallone-278/) */
import fs from 'node:fs'; import path from 'node:path'; import { PNG } from 'pngjs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'out', 'pallone-278'); fs.mkdirSync(OUT, { recursive: true });
const RMIN = +(process.env.CPM_RMIN || 0.08), RMAX = +(process.env.CPM_RMAX || 0.19), AMAX = +(process.env.CPM_AMAX || 0.45); const RMAX_LARGO = +(process.env.CPM_RMAX_LARGO || 0.27);
const HL_GI = (process.env.CPM_HL || '0,40').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();

async function pagina(rosso, save, extra) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(o => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; if (o.r) window.__CPM_NO_PALL278 = true; if (o.s) localStorage.setItem('cpm-v3', JSON.stringify(o.s)); for (const k of o.x) window[k] = true; }, { r: rosso, s: save || null, x: extra || [] });
  return { ctx, page, errs };
}
/* foto della sola tela + lettura del gancio nello STESSO fotogramma congelato */
async function misura(page, nome) {
  await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(900);
  const h = await page.evaluate(() => { const c = document.querySelector('canvas'); const r = c && c.getBoundingClientRect();
    const P = window.__CPM_PALL278 ? window.__CPM_PALL278() : null;
    return { out: P && P.dpx, hb: P && P.uomo, ndc: P && P.on ? P.ndc : null, P, rect: P && P.rect ? P.rect : (r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null) }; });
  const foto = await page.screenshot(); fs.writeFileSync(path.join(OUT, nome + '.png'), foto);
  await page.evaluate(() => { window.__CPM_FROZEN = false; });
  let alone = null, chiari = 0;
  if (h.ndc && h.rect && h.out) {
    const png = PNG.sync.read(foto); const W = png.width, H = png.height;
    const sx = Math.round(h.rect.x + (h.ndc[0] + 1) / 2 * h.rect.w), sy = Math.round(h.rect.y + (1 - h.ndc[1]) / 2 * h.rect.h);
    const L = (x, y) => { const i = (y * W + x) * 4; return 0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2]; };
    const R = Math.max(4, Math.round(h.out * 0.85)); /* finestra: 1,7 raggi del pallone (l alone storico arriva a 1,3-2) */
    /* prato di riferimento: mediana della corona esterna (fra 2,2 e 3 raggi) */
    const ring = []; for (let y = sy - 3 * R; y <= sy + 3 * R; y++) for (let x = sx - 3 * R; x <= sx + 3 * R; x++) { if (x < 0 || y < 0 || x >= W || y >= H) continue; const d = Math.hypot(x - sx, y - sy); if (d >= 2.2 * R && d <= 3 * R) ring.push(L(x, y)); }
    ring.sort((a, c) => a - c); const bg = ring.length ? ring[ring.length >> 1] : 60;
    let al = 0; for (let y = sy - R; y <= sy + R; y++) for (let x = sx - R; x <= sx + R; x++) { if (x < 0 || y < 0 || x >= W || y >= H || Math.hypot(x - sx, y - sy) > R) continue; const l = L(x, y);
      if (l > 170) chiari++; else if (l > bg + 12) al++; }
    alone = (chiari + al) ? +(al / (chiari + al)).toFixed(2) : null;
    /* ritaglio ingrandito x6 per l'occhio */
    const C = 14, Z = 6, cr = new PNG({ width: (2 * C + 1) * Z, height: (2 * C + 1) * Z });
    for (let y = 0; y < cr.height; y++) for (let x = 0; x < cr.width; x++) { const X = Math.min(W - 1, Math.max(0, sx - C + Math.floor(x / Z))), Y = Math.min(H - 1, Math.max(0, sy - C + Math.floor(y / Z))); const i = (Y * W + X) * 4, o = (y * cr.width + x) * 4; for (let k = 0; k < 4; k++) cr.data[o + k] = png.data[i + k]; }
    fs.writeFileSync(path.join(OUT, nome + '-zoom.png'), PNG.sync.write(cr));
  }
  /* fuori dal quadro la proiezione degenera (punto vicino al piano camera: uomo di 1.283 px misurato): vale la
     geometria, diametro reso / 1,75u, che a camera frontale e' lo stesso numero */
  const rap = !h.P ? null : (h.P.on ? h.P.rap : +((2 * h.P.reff) / 1.75).toFixed(3));
  return { fase: nome, px: h.out, hb: h.hb, rap, alone, chiari, P: h.P };
}

async function ingresso(rosso) {
  const { ctx, page, errs } = await pagina(rosso, SAVE);/* nota: l'ingresso vero richiede il salvataggio di carriera */
  try {
    await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(2000);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    for (let k = 0; k < 60; k++) { if ((await ph()) === 'walkout') break;
      await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {}); await sleep(700); }
    if ((await ph()) !== 'walkout') return { fase: 'ingresso', errore: 'walkout non raggiunto' };
    /* l'ingresso apre sul tunnel: si aspetta che il pallone (a centrocampo) entri nel quadro, come nella foto del PO */
    { const t0 = Date.now(); while (Date.now() - t0 < +(process.env.CPM_ING_MS || 150000)) { const q = await page.evaluate(() => window.__CPM_PALL278 && window.__CPM_PALL278()).catch(() => null); if ((await ph()) !== 'walkout') break; if (q && q.on && q.vis) break; await sleep(800); } }
    await sleep(1500);
    if ((await ph()) !== 'walkout') return { fase: 'ingresso', errore: 'ingresso finito prima che il pallone entrasse nel quadro' };
    const m = await misura(page, (rosso ? 'rosso' : 'verde') + '-ingresso'); m.errori = errs.slice(0, 2); return m;
  } catch (e) { return { fase: 'ingresso', errore: String(e.message).slice(0, 140) }; } finally { await ctx.close(); }
}
async function giocoEHighlight(rosso) {
  /* in `playing` il gioco mostra la lavagna 2D (7.917, decisione PO 15/09) e il 3D resta sospeso: il pallone 3D
     della partita vera si misura nel primo highlight del FLUSSO (autoplay, camera vera), poi su scene forzate */
  const { ctx, page, errs } = await pagina(rosso, null); const R = [];
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }));
    let ok = false; const t0 = Date.now();
    while (Date.now() - t0 < 200000) { await sleep(400); const s = await page.evaluate(() => ({ min: (window.__CPM_CLOCK && window.__CPM_CLOCK()) | 0, ph: (window.__CPM_PHASE && window.__CPM_PHASE()) || '?', w: (window.__CPM_WS && window.__CPM_WS()) || null, q: window.__CPM_PALL278 ? window.__CPM_PALL278() : null }));
      if (s.ph === 'ended') break; if (s.min >= 5 && /^hl_(choose|result)$/.test(s.ph) && s.q && s.q.on && s.q.vis && Math.abs(s.q.ndc[0]) < 0.8 && Math.abs(s.q.ndc[1]) < 0.8) { ok = true; break; } }
    if (ok) R.push(await misura(page, (rosso ? 'rosso' : 'verde') + '-partita')); else R.push({ fase: 'partita', errore: 'highlight del flusso col pallone nel quadro non raggiunto' });
    await page.evaluate(() => window.__CPM_AUTOPLAY(false)).catch(() => {});
    await page.evaluate(() => window.__CPM_LOAD_ALL()); await sleep(500);
    for (const gi of HL_GI) { await page.evaluate(i => window.__CPM_FORCE_SIT(i, true), gi); await sleep(2200); R.push(await misura(page, (rosso ? 'rosso' : 'verde') + '-hl' + gi)); }
    R.forEach(m => { m.errori = errs.slice(0, 2); });
  } catch (e) { R.push({ fase: 'gioco/hl', errore: String(e.message).slice(0, 140) }); } finally { await ctx.close(); }
  return R;
}
async function braccio(rosso) { const r = [await ingresso(rosso), ...(await giocoEHighlight(rosso))]; r.forEach(m => console.log((rosso ? 'ROSSO ' : 'VERDE ') + JSON.stringify(m))); return r; }
const SOLO = process.env.CPM_SOLO || '';
const V = SOLO === 'rosso' ? [] : await braccio(false);
const Ro = SOLO === 'verde' ? [] : await braccio(true);
await b.close(); srv.close();
const giudica = (A, nome) => { const g = []; for (const m of A) { if (m.errore) { g.push(`${nome} ${m.fase}: ${m.errore}`); continue; }
  const rmax = (m.hb != null && m.hb < 30) ? RMAX_LARGO : RMAX;/* camera larga: sotto i 30 px d'uomo vale il pavimento di leggibilita' (4 px) */
  if (m.rap == null || m.rap < RMIN || m.rap > rmax) g.push(`${nome} ${m.fase}: rapporto pallone/uomo ${m.rap} fuori da [${RMIN};${rmax}] (uomo ${m.hb} px)`);
  if (m.px != null && m.px < 7 && m.P && m.P.on) m.nonGiudicata = 'alone: pallone sotto i 7 px, il bordo e\' solo antialias';
  else if (m.alone == null) { if (m.P && m.P.on) g.push(`${nome} ${m.fase}: pallone nel quadro ma non trovato nella foto`); else m.nonGiudicata = 'alone: pallone fuori dal quadro (in headless l ingresso resta sul tunnel)'; }
  else if (m.alone > AMAX) g.push(`${nome} ${m.fase}: quota alone ${m.alone} > ${AMAX}`);
  if (m.errori && m.errori.length) g.push(`${nome} ${m.fase}: errori di pagina ${m.errori[0]}`); } return g; };
const gV = giudica(V, 'verde'), gR = giudica(Ro, 'rosso');
for (const m of [...V, ...Ro]) console.log(`  ${m.fase}: rapporto ${m.rap} · pallone ${m.px} px · uomo ${m.hb} px · alone ${m.alone}` + (m.nonGiudicata ? ` (non giudicata: ${m.nonGiudicata})` : ''));
const fall = []; if (!SOLO || SOLO === 'verde') fall.push(...gV);
if ((!SOLO || SOLO === 'rosso') && !gR.some(x => /rapporto|alone/.test(x))) fall.push('rosso: il difetto non si vede (nessuna soglia cade col pallone di prima)');
if (fall.length) { console.log('❌ pallone-278'); fall.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(`✅ pallone-278 verde (rapporto in [${RMIN};${RMAX}], alone <= ${AMAX} in ingresso/gioco/highlight)` + (SOLO ? '' : ` e il rosso si vede (${gR.length} soglie cadute)`));
