#!/usr/bin/env node
/* [giro 169 PO-365 + PO-366 — guardiano] Foto PO docs/collaudo-po/190-fischio-finale-box.jpg: al fischio finale il riquadro
   bianco «in casa contro FC Hispalense · 1 gol · 7,4 voto» ha punteggio e voto quasi invisibili, e la barra in basso dice ★ 7.1.
   A) CONTRASTO DEL RIQUADRO (PO-365). Su pagina vera (partita aperta, fase ceremony leggera forzata con __CPM_FORCE_CEREMONY e i
      numeri della festa) in tre formati (telefono 375x812 tocco · tablet 820x1180 tocco · PC 1440x900) e tre esiti (vittoria,
      pareggio, sconfitta; voto normale e voto «oro»). Per ogni testo del riquadro due misure:
        - STILI: colore calcolato del testo contro il fondo del riquadro composto (alfa) sopra SETTE fondi possibili dietro di lui
          (bianco, nero e i colori sociali di club chiari e scuri: il riquadro sta sopra la scena 3D, quindi sopra maglie e stadi);
          si prende il peggiore;
        - PIXEL: foto del riquadro, fondo = mediana dei pixel della fascia di imbottitura, testo = il pixel del rettangolo del testo
          col contrasto massimo contro quel fondo (il colore pieno del glifo).
      Criterio: testi informativi >= 4,5:1, punteggio grande >= 3:1, su ENTRAMBE le misure. Un testo non trovato = rosso.
   B) UNA SOLA FONTE DEL VOTO (PO-366). Telefono, gioco fluido: si legge il ★ della barra (data-cpm="voto-barra") e, nello stesso
      istante, il voto che la partita registra (__CPM_ENDRESULT20().rating = pagella del motore, lo stesso del riquadro della festa).
      Verde: coincidono in tutte le letture (si ritenta la singola lettura su un render non ancora arrivato). Meno di 6 letture = rosso.
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_G169 + __CPM_NO_G169_VOTO e pretende che A e B cadano entrambe.
   CPM_FOTO_169=<cartella> salva le foto del riquadro. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = !!process.env.CPM_PROVA_ROSSO, FOTO = process.env.CPM_FOTO_169 || '';
const FORMATI = { telefono: { width: 375, height: 812, touch: true }, tablet: { width: 820, height: 1180, touch: true }, pc: { width: 1440, height: 900, touch: false } };
const ESITI = [
  { id: 'vittoria', festa: { titolo: 'Vittoria pesante', punteggio: '1 – 0', avversario: 'FC Hispalense', casa: true, voci: [{ n: 1, et: 'gol', oro: true }, { n: '7,4', et: 'voto', oro: false }], facce: [] } },
  { id: 'pareggio', festa: { titolo: 'Prestazione da campione', punteggio: '2 – 2', avversario: 'FC Craven', casa: false, voci: [{ n: 2, et: 'gol', oro: true }, { n: 1, et: 'assist' }, { n: '8,1', et: 'voto', oro: true }], facce: [] } },
  { id: 'sconfitta', festa: { titolo: 'Colpo mancato', punteggio: '0 – 2', avversario: 'FC Merseyside', casa: true, voci: [{ n: '5,9', et: 'voto', oro: false }], facce: [] } },
];
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const lum = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const A = lum(...a), B = lum(...b); return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05); };
const righe = []; let cadutaA = 0, nonGiudicatiA = 0, giudicatiA = 0; let esitoB = null;
for (const [fid, F] of Object.entries(FORMATI)) {
  const ctx = await browser.newContext({ viewport: { width: F.width, height: F.height }, hasTouch: F.touch, isMobile: F.touch && F.width < 600 });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  let errori = 0; page.on('pageerror', () => { errori++; });
  await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) { window.__CPM_NO_G169 = true; window.__CPM_NO_G169_VOTO = true; } try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Fischio169' });
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 1690, policy: 'seeded', tickMs: 300 }));
  for (let i = 0; i < 200; i++) { const f = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (f === 'playing') break; await sleep(300); }
  /* B: una sola fonte del voto (solo telefono: la barra vive sotto i 600 px) */
  if (fid === 'telefono') {
    let letture = 0, uguali = 0; const diff = [];
    for (let i = 0; i < 60 && letture < 12; i++) {
      await sleep(900);
      let v = null;
      for (let k = 0; k < 4; k++) {
        v = await page.evaluate(() => { const e = document.querySelector('[data-cpm="voto-barra"]'); const r = window.__CPM_ENDRESULT20 && window.__CPM_ENDRESULT20();
          return { fase: window.__CPM_PHASE && window.__CPM_PHASE(), barra: e ? parseFloat(e.innerText.replace(/[^0-9.,]/g, '').replace(',', '.')) : null, reg: r ? r.rating : null }; }).catch(() => null);
        if (!v || v.fase !== 'playing' || v.barra == null || v.reg == null || Math.abs(v.barra - v.reg) < 0.05) break; await sleep(150);
      }
      if (!v || v.fase !== 'playing' || v.barra == null || v.reg == null) continue;
      letture++; if (Math.abs(v.barra - v.reg) < 0.05) uguali++; else if (diff.length < 4) diff.push(`barra ${v.barra} · registrato ${v.reg}`);
    }
    esitoB = { letture, uguali, diff };
  }
  for (const E of ESITI) {
    /* [giro 186] FOTO E MISURA DELLO STESSO ISTANTE. Misurato (sonda 186, PC): la cerimonia leggera forzata dura ~7 s e poi la
       partita passa a «ended», dove al posto del riquadro c'e' la schermata finale con le statistiche. La vecchia sequenza
       (trova il riquadro → 400 ms → rettangolo → foto) poteva scattare la foto DOPO quel passaggio: era il «pixel 1,15» con
       «Passaggi»/«Precisione passaggi» nella foto (DECISIONI 13/11 00:40). Ora: si aspetta il riquadro di QUESTO esito (il suo
       punteggio) in fase ceremony con il rettangolo fermo su due letture; lo si marca; misura e foto; poi si ricontrolla che lo
       stesso nodo marcato sia ancora montato, in ceremony, con lo stesso rettangolo. Se no si rifà la cerimonia (3 tentativi);
       mai coerente = non giudicato = rosso. */
    const stato = (tag) => page.evaluate(({ tag, pun }) => { const el = document.querySelector('[data-cpm="festa47"] > div:nth-child(2)'); const f = window.__CPM_PHASE && window.__CPM_PHASE();
      if (!el || f !== 'ceremony' || !(el.textContent || '').includes(pun)) return null; if (tag) el.setAttribute('data-g186', tag); const R = el.getBoundingClientRect();
      return { tag: el.getAttribute('data-g186') || '', r: [R.left, R.top, R.width, R.height].map(v => Math.round(v * 10) / 10).join(',') }; }, { tag, pun: E.festa.punteggio });
    let box = null, mis = null, shot = null, tentativi = 0, perche = '';
    for (; tentativi < 3 && !mis; tentativi++) {
      await page.evaluate((festa) => window.__CPM_FORCE_CEREMONY({ name: festa.titolo, kind: 'bigwin', light: true, festa }), E.festa);
      let prima = null, fermo = false; const tag = `${fid}-${E.id}-${tentativi}`;
      for (let i = 0; i < 30 && !fermo; i++) { await sleep(200); const a = await stato(null); if (a && prima && a.r === prima.r) fermo = true; prima = a; }
      if (!fermo) { perche = 'riquadro mai fermo in ceremony'; continue; }
      const a0 = await stato(tag); box = await page.$('[data-g186="' + tag + '"]'); if (!a0 || !box) { perche = 'riquadro sparito prima della misura'; continue; }
      const m0 = await box.evaluate((el, clubs) => {
      const parse = (s) => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
      const hex = (h) => { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
      const fondiDietro = [[255, 255, 255], [0, 0, 0]];
      for (const id of clubs) { const c = (typeof CLUBS !== 'undefined') && CLUBS.find(x => x.id === id); if (c) { if (/^#/.test(c.c || '')) fondiDietro.push(hex(c.c)); if (/^#/.test(c.c2 || '')) fondiDietro.push(hex(c.c2)); } }
      const bg = parse(getComputedStyle(el).backgroundColor);
      const R = el.getBoundingClientRect();
      const testi = [];
      const walk = (n) => { for (const ch of n.childNodes) { if (ch.nodeType === 3 && ch.textContent.trim()) { const p = ch.parentElement; const rg = document.createRange(); rg.selectNodeContents(ch); const r = rg.getBoundingClientRect();
            testi.push({ t: ch.textContent.trim(), col: parse(getComputedStyle(p).color), fs: parseFloat(getComputedStyle(p).fontSize), r: { x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height } }); }
          else if (ch.nodeType === 1) walk(ch); } };
      walk(el);
      return { bg, fondiDietro, testi, rect: { x: R.left, y: R.top, w: R.width, h: R.height } };
    }, ['ful', 'liv', 'new', 'wol', 'tot']);
      const s0 = await page.screenshot({ clip: { x: m0.rect.x, y: m0.rect.y, width: m0.rect.w, height: m0.rect.h } });
      const a1 = await stato(null);
      if (!a1 || a1.tag !== tag || a1.r !== a0.r) { perche = `layout cambiato fra misura e foto (${a0.r} → ${a1 ? a1.r + ' ' + a1.tag : 'riquadro assente o fuori da ceremony'})`; continue; }
      mis = m0; shot = s0;
    }
    if (!mis) { righe.push(`  ${fid}/${E.id}: NON GIUDICATO dopo ${tentativi} tentativi — ${perche}`); nonGiudicatiA++; continue; }
    if (tentativi > 1) righe.push(`  ${fid}/${E.id}: misura coerente al tentativo ${tentativi} (prima: ${perche})`);
    if (FOTO) { fs.mkdirSync(FOTO, { recursive: true }); fs.writeFileSync(`${FOTO}/${ROSSO ? 'prima' : 'dopo'}-${fid}-${E.id}.png`, shot); }
    const px = await page.evaluate(async ({ b64, testi }) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const x = cv.getContext('2d'); x.drawImage(img, 0, 0);
      const D = x.getImageData(0, 0, cv.width, cv.height).data; const W = cv.width, H = cv.height; const k = W / testi.box.w;
      const at = (i, j) => { const o = (j * W + i) * 4; return [D[o], D[o + 1], D[o + 2]]; };
      const fondo = []; for (let i = Math.round(6 * k); i < W - 6 * k; i += 3) { fondo.push(at(i, Math.round(3 * k))); fondo.push(at(i, H - 1 - Math.round(3 * k))); }
      const med = [0, 1, 2].map(c => fondo.map(p => p[c]).sort((a, b) => a - b)[fondo.length >> 1]);
      const L = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const Lb = L(...med);
      return { fondo: med, testi: testi.t.map(t => { let best = 1, bp = null;
        for (let j = Math.max(0, Math.round(t.r.y * k)); j < Math.min(H, Math.round((t.r.y + t.r.h) * k)); j++) for (let i = Math.max(0, Math.round(t.r.x * k)); i < Math.min(W, Math.round((t.r.x + t.r.w) * k)); i++) {
          const p = at(i, j); const Lp = L(...p); const c = (Math.max(Lp, Lb) + 0.05) / (Math.min(Lp, Lb) + 0.05); if (c > best) { best = c; bp = p; } }
        return { c: best, p: bp }; }) };
    }, { b64: shot.toString('base64'), testi: { t: mis.testi, box: mis.rect } });
    for (let i = 0; i < mis.testi.length; i++) {
      const t = mis.testi[i]; const punteggio = t.fs >= 24;
      const soglia = punteggio ? 3 : 4.5;
      let peggiore = Infinity;
      for (const d of mis.fondiDietro) { const a = mis.bg[3]; const fondo = [0, 1, 2].map(c => mis.bg[c] * a + d[c] * (1 - a)); const ta = t.col[3]; const col = [0, 1, 2].map(c => t.col[c] * ta + fondo[c] * (1 - ta)); peggiore = Math.min(peggiore, ratio(col, fondo)); }
      const cp = px.testi[i].c; giudicatiA++;
      const ok = peggiore >= soglia && cp >= soglia; if (!ok) cadutaA++;
      righe.push(`  ${fid}/${E.id} «${t.t}»${punteggio ? ' (punteggio)' : ''}: stili ${peggiore.toFixed(2)} · pixel ${cp.toFixed(2)} (soglia ${soglia}) ${ok ? 'ok' : 'SOTTO'}`);
    }
    if (!mis.testi.length) { righe.push(`  ${fid}/${E.id}: nessun testo nel riquadro`); nonGiudicatiA++; }
  }
  if (errori) righe.push(`  ${fid}: errori di pagina ${errori}`);
  await ctx.close();
}
await browser.close(); srv.close();
console.log(`\n=== BOX DEL FISCHIO FINALE (giro 169) === ${ROSSO ? '[ROSSO __CPM_NO_G169 + __CPM_NO_G169_VOTO]' : '[VERDE]'}`);
console.log('A) contrasto dei testi del riquadro (peggiore fra 7 fondi dietro · pixel della foto)'); righe.forEach(r => console.log(r));
console.log(`   giudicati ${giudicatiA} · sotto soglia ${cadutaA} · non giudicati ${nonGiudicatiA}`);
console.log(`B) voto della barra contro voto registrato (pagella): ${esitoB ? `${esitoB.uguali}/${esitoB.letture} uguali${esitoB.diff.length ? ' · ' + esitoB.diff.join(' | ') : ''}` : 'NON MISURATO'}`);
const aVerde = giudicatiA >= 9 && cadutaA === 0 && nonGiudicatiA === 0;
const bGiudicato = !!esitoB && esitoB.letture >= 6, bVerde = bGiudicato && esitoB.uguali === esitoB.letture;
const ok = ROSSO ? (giudicatiA >= 9 && cadutaA > 0 && bGiudicato && esitoB.uguali < esitoB.letture) : (aVerde && bVerde);
console.log(ok ? (ROSSO ? '\n✅ difetto riprodotto — senza il giro 169 il riquadro non si legge e la barra ha un altro voto' : '\n✅ PASS — ogni testo del riquadro si legge e la barra ha il voto della pagella') : '\n❌ FAIL');
process.exit(ok ? 0 : 1);
