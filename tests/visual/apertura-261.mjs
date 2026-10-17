#!/usr/bin/env node
/* [giro 40 — PO-261 «Prima apertura vuota»] SONDA dell'apertura del PRIMO highlight sul flusso vero.
   Pagina nuova per partita, GLB ACCESO, __CPM_PRESENT=1 (teatro attivo), nessun highlight forzato: si lascia giocare la cronaca
   finche' il calendario apre la prima scena dell'eroe. Da hl_intro si registra ogni fotogramma (__CPM_FR73: proiezione dell'eroe,
   camera, pallone) per le prime CPM_SCENE261 scene (2). Grandezze per scena: fotogrammi d'apertura (primi 12) con l'eroe fuori
   quadro, altezza apparente mediana, distanza camera→eroe al primo fotogramma. */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_PARTITE261 || 4), SC = +(process.env.CPM_SCENE261 || 2);
const ROSSO = process.env.CPM_ROSSO || '';
const DTREAL = process.env.CPM_DTREAL261 !== '0', NOPRES = process.env.CPM_NOPRESENT === '1';/* tempo di scena reale di default (__CPM_DTREAL); CPM_NOPRESENT=1 = regime del collaudo 169 (teatro spento) */
const NOMI = ['Aldo Brenta', 'Cesare Dolfi', 'Ettore Fanti', 'Ivo Mansi', 'Nando Orsi', 'Piero Quaglia', 'Rocco Sala', 'Tullio Vanni', 'Ugo Zanetti', 'Dario Bellini'];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = [], bjTot = [], snapTot = [];
for (let i = 0; i < N; i++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript(([r, dr, np]) => { if (!np) window.__CPM_PRESENT = 1; window.__CPM_GLB = true; if (r) window[r] = 1; if (dr) window.__CPM_DTREAL = 1; }, [ROSSO, DTREAL, NOPRES]);
  await openMatch(page, port, { skipLoadAll: true, name: NOMI[i % NOMI.length] });
  const sc = []; let ph = null; const t0 = Date.now();
  while (Date.now() - t0 < 240000 && sc.length <= SC) {
    const p = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    if (p === 'playing') await page.evaluate(() => { window.__CPM_FR73 = []; window.__CPM_FRAME480 = null; }).catch(() => {});/* il giro 3D e' sospeso in cronaca: cosi' il registro parte dal PRIMO fotogramma della scena */
    if (p !== ph) {
      if (p === 'hl_intro') { sc.push({ ck: await page.evaluate(() => window.__CPM_CLOCK && window.__CPM_CLOCK()), t: Date.now() - t0 }); }
      if (ph === 'hl_intro' || (p === 'hl_result' && sc.length)) {
        const d = await page.evaluate(() => ({ fr: (window.__CPM_FR73 || []).slice(), g: window.__CPM_FRAME480 ? JSON.parse(JSON.stringify(window.__CPM_FRAME480)) : null, glb: !!window.__CPM_GLB_READY, sit: (()=>{try{return JSON.stringify(window.__CPM_SITCTX&&window.__CPM_SITCTX()).slice(0,80);}catch(e){return null;}})() }));
        const s = sc[sc.length - 1]; if (!s.intro && ph === 'hl_intro') s.intro = d; if (p === 'hl_result') s.res = d;
      }
      ph = p;
      if (p === 'hl_result' && sc.length >= SC) break;
      if (p === 'hl_choose' || p === 'hl_move') await page.evaluate(() => { try { window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 7, policy: 'seeded', tickMs: 200 }); } catch (e) {} });
    }
    await sleep(120);
  }
  for (const [k, s] of sc.slice(0, SC).entries()) {
    const fr = (s.res || s.intro || {}).fr || [];
    const ap = fr.slice(0, 12); const fuoriAp = ap.filter(f => Math.abs(f.ax) > 1 || Math.abs(f.ay) > 1).length;
    const f0 = fr[0] || {}; const dcam = f0.cx != null ? Math.hypot(f0.cx - f0.hx, f0.cz - f0.hz).toFixed(1) : '?';
    const g = (s.res || s.intro || {}).g || {};
    console.log(`p${i} scena${k + 1} min ${s.ck} fot ${fr.length} · apertura fuori ${fuoriAp}/${ap.length} · tot fuori ${g.fuori}/${g.n} · h ${g.ultimo} · cam→eroe al 1° ${dcam} · cam0 (${f0.cx},${f0.cy},${f0.cz}) eroe0 (${f0.hx},${f0.hz}) · ${(s.res||s.intro||{}).sit}`);
    out.push({ p: i, k, ck: s.ck, fr, g });
  }
  { const bj = await page.evaluate(() => (window.__CPM_BJ478 || []).slice()); const sc = bj.filter(x => !x.mask && !x.nascosto && /^hl_/.test(String(x.ph || '')));
    const nasc = bj.filter(x => x.nascosto).length; console.log(`p${i} salti del pallone in scena: ${bj.length} · coperti ${bj.filter(x => x.mask).length} · nascosti (dopo il 2D) ${nasc} · SCOPERTI ${sc.length}: ${sc.slice(0, 6).map(x => `${x.src}${x.tutti ? '[' + x.tutti + ']' : ''}:${x.d}@${x.ph}`).join(' ')}`); bjTot.push(...sc); }
  { const sn = await page.evaluate(() => (window.__CPM_SNAP261 || []).slice()); console.log(`p${i} snap di scena: ${sn.length} · scarto dello sguardo a fine fotogramma ${sn.map(x => x.scarto + (x.nasc ? '*' : '')).join(' ')} (* = dopo il 2D)`); snapTot.push(...sn); }
  if (errs.length) console.log('pageerror', errs.slice(0, 3));
  await ctx.close();
}
fs.mkdirSync('out', { recursive: true }); fs.writeFileSync('out/apertura-261.json', JSON.stringify(out));
/* Tempo A SCHERMO con l'eroe fuori quadro nei primi FIN ms reali della scena (CPM_FIN261, default: tutta la scena). Il testimone
   registra il fotogramma PRIMA del render e proietta con la matrice del disegno PRECEDENTE (la matrice si aggiorna dentro render):
   la riga j descrive quindi l'immagine j-1, che resta a schermo dalla fine del suo render (~t_j) alla fine del render dopo (~t_j+1).
   ⚠️ La prima stesura abbinava la riga j+1 all'intervallo t_j→t_j+1 e attribuiva all'immagine «in tribuna» il blocco del primo
   render, durante il quale a schermo c'era ancora l'immagine precedente: 87,7% di fuori quadro che in realta' durava 18 ms. */
const FIN = +(process.env.CPM_FIN261 || 1e9), SOLOFASI = process.env.CPM_FASI261 ? new RegExp(process.env.CPM_FASI261) : null;
const fuoriT = fr => { let tot = 0, fuori = 0; if (fr.length < 3) return null; const t1 = fr[1].t;
  for (let j = 1; j + 1 < fr.length; j++) { if (fr[j].t - t1 >= FIN) break; if (SOLOFASI && !SOLOFASI.test(fr[j].ph || '')) continue; const d = fr[j + 1].t - fr[j].t; tot += d; const f = fr[j]; if (Math.abs(f.ax) > 1 || Math.abs(f.ay) > 1) fuori += d; }
  return { tot, fuori }; };
const giud = arr => { let T = 0, F = 0, vuote = 0, n = 0; for (const o of arr) { const r = fuoriT(o.fr); if (!r || r.tot < 200) continue; n++; T += r.tot; F += r.fuori; if (r.fuori >= r.tot / 2) vuote++; } return { n, quota: T ? +(F / T * 100).toFixed(1) : null, vuote }; };
const prime = giud(out.filter(o => o.k === 0)), seconde = giud(out.filter(o => o.k === 1));
for (const o of out) { const r = fuoriT(o.fr); console.log(`  p${o.p} scena${o.k + 1}: a schermo ${r ? `${r.fuori}/${r.tot} ms con l'eroe fuori` : 'n.d.'}`); }
console.log(`PRIME scene giudicate ${prime.n}: aperture vuote (eroe fuori >= meta' del tempo) ${prime.vuote} · quota di tempo fuori ${prime.quota}% · SECONDE ${seconde.n}: vuote ${seconde.vuote} · quota ${seconde.quota}%`);
await b.close(); srv.close();
const GIUDICA = process.argv.includes('--guardiano') || process.env.CPM_GIUDICA === '1';
/* Tre misure. (1) PRIMA IMMAGINE della prima scena (riga 1 del registro = immagine 0): eroe nel quadro? Col rosso e' la camera rimasta
   dov'era prima del campo 2D (nascita in tribuna alla prima scena). (2) SCARTO dello sguardo dal bersaglio dello snap a fine fotogramma
   (__CPM_SNAP261), su ogni snap: indipendente dagli fps. (3) aperture vuote a tempo d'occhio (sopra). */
const pi = out.filter(o => o.k === 0 && o.fr.length >= 2); const primaFuori = pi.filter(o => { const f = o.fr[1]; return Math.abs(f.ax) > 1 || Math.abs(f.ay) > 1; }).length;
const scMax = snapTot.length ? Math.max(...snapTot.map(x => x.scarto)) : null; const scGrandi = snapTot.filter(x => x.scarto > 3).length;
console.log(`prima immagine della prima scena con l'eroe fuori: ${primaFuori}/${pi.length} · snap di scena ${snapTot.length}, scarto massimo ${scMax}u, oltre 3u: ${scGrandi}`);
if (GIUDICA) {
  const MAXQ = +(process.env.CPM_MAXQ261 || 20);
  if (pi.length < Math.max(2, Math.ceil(N / 2)) || !snapTot.length) { console.log(`❌ sonda cieca: ${pi.length} prime scene su ${N}, ${snapTot.length} snap`); process.exit(2); }
  if (ROSSO) { const ok = primaFuori >= Math.ceil(pi.length / 2) || scGrandi >= 1; console.log(ok ? `✅ ROSSO come atteso (${ROSSO}): prima immagine fuori ${primaFuori}/${pi.length}, scarti oltre 3u ${scGrandi}` : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
  const fails = []; if (primaFuori) fails.push(`prima immagine con l'eroe fuori in ${primaFuori}/${pi.length} prime scene`); if (scGrandi) fails.push(`${scGrandi} snap con lo sguardo oltre 3u dal bersaglio (max ${scMax})`);
  if (prime.n && (prime.vuote > 0 || prime.quota > MAXQ)) fails.push(`${prime.vuote} aperture vuote, quota ${prime.quota}%`);
  console.log(fails.length ? '❌ FAIL apertura-261\n  ' + fails.join('\n  ') : `✅ PASS apertura-261 (prima immagine sull'eroe ${pi.length}/${pi.length}, scarto max ${scMax}u, aperture vuote 0)`); process.exit(fails.length ? 1 : 0);
}
