#!/usr/bin/env node
/* SONDA giro 366 (PO-649 «i giocatori volano sul campo») — non giudica: stampa. GLB ACCESO, partita vera col pilota automatico.
   Una sorgente sola: il testimone __CPM_VOLA366 (src/12) = ossa del piede dei corpi disegnati nel mondo + il prato a y 0, e l'ombra
   DISEGNATA sul prato sotto ogni corpo (vista a piombo, sole acceso/spento).
   Per ogni corpo visibile e ogni fotogramma registrato:
     quota  = quota dell'osso piu' basso fra i due avampiedi (ball_l/ball_r) sopra il prato, in unita' di mondo;
   a intervalli (pagina congelata) per ogni corpo visibile:
     piede  = scurimento medio del prato entro 0,30 u dal punto a terra del piede piu' basso (0 = nessuna ombra li');
     picco  = 95° percentile dello scurimento nel riquadro di 4 u attorno al corpo;
     stacco = distanza in pianta fra il piede piu' basso e il primo pixel con scurimento >= meta' del picco.
   Uso: node misura-366.mjs   CPM_VISTA=pc|tel · CPM_TOD=day|dusk|night · CPM_SEC=150 · CPM_FLAG=__CPM_NO_G366 · CPM_NOME=Vola366
        CPM_FOTO=percorso.png (uno scatto a deviceScaleFactor 2 al primo campione d'ombra in gioco fluido) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';

/* [giro 366, PO-649] attrezzi condivisi fra la sonda misura-366 e il guardiano volano-366: registratore per fotogramma della quota dei
   piedi (testimone __CPM_VOLA366 di src/12) e misura dell'ombra disegnata sul prato. Una sorgente sola: le ossa dei corpi disegnati. */

/* registratore nella pagina: a ogni fotogramma, per ogni corpo VISIBILE, la quota dell'avampiede piu' basso sopra il prato.
   Righe compatte: [classe di fase, corpo, quota, quota caviglia piu' bassa, y radice, gesto, peso gesto, corsa, velocita' in pianta] */
async function registra366(page) {
  await page.evaluate(() => {
    const R = window.__CPM_REC366 = { fr: 0, righe: [], prev: {}, t: performance.now() };
    const L = () => { try { const s = window.__CPM_VOLA366 && window.__CPM_VOLA366(); const now = performance.now(); const dt = (now - R.t) / 1000; R.t = now;
      if (s && s.corpi && !window.__CPM_FROZEN && window.__CPM_REC366 === R && String(s.fase || '').indexOf('hl_') === 0) {/* in gioco fluido il campo e' 2D: il 3D non si disegna e le ossa sono ferme all'ultimo highlight */ R.fr++; const cl = String(s.fase || '').indexOf('hl_') === 0 ? s.fase : (s.fase || '?');
        for (const c of s.corpi) { if (!c.vis || !c.bl || !c.br) continue; const q = c.su != null ? c.su : Math.min(c.bl[1], c.br[1]), qc = Math.min(c.fl ? c.fl[1] : 9, c.fr ? c.fr[1] : 9);
          const p = R.prev[c.i]; const v = (p && dt > 0) ? Math.hypot(c.r[0] - p[0], c.r[2] - p[1]) / dt : 0; R.prev[c.i] = [c.r[0], c.r[2]];
          if (R.righe.length < 60000) R.righe.push([cl, c.i, +q.toFixed(3), +qc.toFixed(3), c.r[1], c.gw > 0.3 ? c.g : '', c.gw, c.run, +v.toFixed(1), c.gk ? 1 : 0, c.arb ? 1 : 0, c.eroe ? 1 : 0, s.sk, c.py, c.cl, c.vy, c.g, c.sq, c.lod]); } }
    } catch (e) { R.err = String(e); } if (window.__CPM_REC366 === R) requestAnimationFrame(L); };
    requestAnimationFrame(L);
  });
}

/* ombra disegnata sotto ogni corpo visibile, a pagina congelata. Restituisce {fase, righe:[{i,fase,quota,piede,picco,stacco,...}]} */
async function ombra366(page, { soloCorpi = null, max = 23 } = {}) {
  await page.evaluate(() => { window.__CPM_FROZEN = true; }); await sleep(250);
  const s = await page.evaluate(() => window.__CPM_VOLA366 && window.__CPM_VOLA366());
  if (!s || !s.corpi) return null;
  const righe = [];
  for (const c of s.corpi) { if (!c.vis || !c.bl || !c.br) continue; if (soloCorpi && !soloCorpi.includes(c.i)) continue; if (righe.length >= max) break;
    const g = await page.evaluate((i) => window.__CPM_VOLA366({ prato: i, lato: 4, px: 96 }), c.i);
    if (!g || g.errore) continue;
    righe.push(Object.assign({ i: c.i, fase: s.fase, sk: s.sk, gk: c.gk, arb: c.arb, eroe: c.eroe, gett: c.gett, disco: c.disco, g: c.gw > 0.3 ? c.g : '', quota: c.su != null ? c.su : Math.min(c.bl[1], c.br[1]) }, leggi366(g)));
  }
  return { fase: s.fase, sole: s.sole, desktop: s.desktop, righe };
}

/* dal riquadro di scurimento: ombra al piede, picco, stacco. Camera a piombo con «su» = +x: riga -> x, colonna -> z. */
function leggi366(g) {
  const { px, lato, d, cx, cz, L, R } = g; const h = lato / 2, u = lato / px;
  const basso = L[1] <= R[1] ? L : R;
  const ord = [...d].sort((a, b) => a - b); const picco = ord[Math.floor(ord.length * 0.95)];
  const attorno = (P, r) => { let s = 0, n = 0; for (let ri = 0; ri < px; ri++) for (let ci = 0; ci < px; ci++) { const x = cx + (ri + 0.5) * u - h, z = cz + (ci + 0.5) * u - h; if (Math.hypot(x - P[0], z - P[2]) <= r) { s += d[ri * px + ci]; n++; } } return n ? s / n : 0; };
  const piede = attorno(basso, 0.30);
  let stacco = null; const soglia = Math.max(0.06, picco * 0.5);
  if (picco >= 0.06) { let m = 99; for (let ri = 0; ri < px; ri++) for (let ci = 0; ci < px; ci++) if (d[ri * px + ci] >= soglia) { const x = cx + (ri + 0.5) * u - h, z = cz + (ci + 0.5) * u - h; const dd = Math.min(Math.hypot(x - L[0], z - L[2]), Math.hypot(x - R[0], z - R[2])); if (dd < m) m = dd; } stacco = m < 99 ? +m.toFixed(2) : null; }
  return { piede: +piede.toFixed(3), picco: +picco.toFixed(3), stacco };
}

const med = a => { const s = [...a].sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : null; };
const f = (x, n = 2) => x == null ? '—' : (+x).toFixed(n);

/* riassunto: quota dei piedi per classe (gioco fluido / highlight · gesto) e ombre. SOGLIA = 0,15 u sopra il prato. */
function riassumi366(R, ombre, piedi, { stampa = false, soglia = 0.15 } = {}) {
  const righe = (R && R.righe) || []; const out = { fr: R ? R.fr : 0, n: righe.length, classi: {}, gesti: {}, ombre: {} };
  const agg = (o, k, r) => { const c = o[k] || (o[k] = { n: 0, alti: 0, q: [], corpi: new Set() }); c.n++; c.q.push(r[2]); c.corpi.add(r[1]); if (r[2] > soglia) c.alti++; };
  for (const r of righe) { const cl = r[0] === 'playing' ? 'gioco' : (String(r[0]).indexOf('hl_') === 0 ? 'highlight' : 'altro(' + r[0] + ')'); agg(out.classi, cl, r);
    agg(out.gesti, cl + ' · ' + (r[5] || (r[7] > 0.5 ? 'corsa' : 'fermo/cammino')) + (r[9] ? ' · portiere' : ''), r); }
  if (stampa) { console.log('QUOTA DELL\'AVAMPIEDE PIU\' BASSO SOPRA IL PRATO (u) — righe corpo×fotogramma, soglia ' + soglia);
    for (const [k, c] of Object.entries(out.classi)) console.log(`  ${k.padEnd(22)} n ${String(c.n).padStart(6)} · corpi ${c.corpi.size} · mediana ${f(med(c.q), 3)} · p95 ${f(pct(c.q, 0.95), 3)} · max ${f(Math.max(...c.q), 3)} · sopra soglia ${c.alti} (${f(100 * c.alti / c.n, 1)}%)`);
    console.log('  per gesto:');
    for (const [k, c] of Object.entries(out.gesti).sort((a, b) => b[1].alti - a[1].alti)) if (c.n >= 5) console.log(`    ${k.padEnd(44)} n ${String(c.n).padStart(6)} · mediana ${f(med(c.q), 3)} · p95 ${f(pct(c.q, 0.95), 3)} · max ${f(Math.max(...c.q), 3)} · sopra soglia ${f(100 * c.alti / c.n, 1)}%`); }
  for (const o of ombre || []) { const k = o.fase === 'playing' ? 'gioco' : (String(o.fase).indexOf('hl_') === 0 ? 'highlight' : 'altro'); const c = out.ombre[k] || (out.ombre[k] = { n: 0, piede: [], picco: [], stacco: [], senza: 0, staccate: 0, aTerra: 0, piedeTerra: [], staccoTerra: [] });
    c.n++; c.piede.push(o.piede); c.picco.push(o.picco); if (o.stacco == null) c.senza++; else { c.stacco.push(o.stacco); if (o.stacco > 0.30) c.staccate++; }
    if (o.quota <= soglia) { c.aTerra++; c.piedeTerra.push(o.piede); if (o.stacco != null) c.staccoTerra.push(o.stacco); } }
  if (stampa) { console.log('OMBRA DISEGNATA SUL PRATO (scurimento 0..1; stacco in u dal piede piu\' vicino)');
    for (const [k, c] of Object.entries(out.ombre)) console.log(`  ${k.padEnd(10)} corpi misurati ${c.n} · al piede mediana ${f(med(c.piede), 3)} (p10 ${f(pct(c.piede, 0.10), 3)}) · picco mediana ${f(med(c.picco), 3)} · stacco mediana ${f(med(c.stacco))} max ${f(c.stacco.length ? Math.max(...c.stacco) : null)} · staccate >0,30 u ${c.staccate} · senza ombra ${c.senza} · [piedi a terra: ${c.aTerra}, al piede mediana ${f(med(c.piedeTerra), 3)}, stacco mediana ${f(med(c.staccoTerra))}]`);
    if (piedi) console.log(`PATTINAMENTO (testimone __CPM_PIEDI, 7.999.7): fotogrammi ${piedi.fr} · con piede a terra ${piedi.cont} · che scorre ${piedi.sk} (${f(piedi.fr ? 100 * piedi.sk / piedi.fr : 0, 1)}%) · negli highlight ${piedi.hl.sk}/${piedi.hl.fr} (${f(piedi.hl.fr ? 100 * piedi.hl.sk / piedi.hl.fr : 0, 1)}%)`); }
  out.med = med; out.pct = pct; return out;
}


const VISTA = process.env.CPM_VISTA || 'pc', TOD = process.env.CPM_TOD || 'day', SEC = +(process.env.CPM_SEC || 150);
const FLAG = process.env.CPM_FLAG || '', NOME = process.env.CPM_NOME || 'Vola366', FOTO = process.env.CPM_FOTO || '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: VISTA === 'tel' ? { width: 412, height: 915 } : { width: 1062, height: 549 }, deviceScaleFactor: FOTO ? 2 : 1 });
const page = await ctx.newPage(); await installCdnRoutes(page);
page.on('pageerror', e => console.log('  [pageerror] ' + String(e.message).slice(0, 200)));
await page.addInitScript(([tod, flag]) => { window.__CPM_GLB = true; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} window.__CPM_TOD = tod; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_PIEDI_REC = 1; if (flag) flag.split(',').forEach(f => { window[f] = 1; }); }, [TOD, FLAG]);
const SCENE = (process.env.CPM_SCENE || '0,1,16,14,67,93,168,138,161,103').split(',').map(Number), VERA = !!process.env.CPM_VERA;
const ombre = []; let fotoFatta = false;
const scatta = async (o) => { if (FOTO && !fotoFatta && o && o.righe.length >= 3) { fotoFatta = true; await page.screenshot({ path: FOTO, timeout: 60000 }).catch(() => {}); console.log('  foto: ' + FOTO + ' (' + o.fase + ')'); } };
if (VERA) {
  await openMatch(page, port, { skipLoadAll: true, name: NOME });
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => console.log('  (clip GLB non arrivate)'));
  await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true));
  await registra366(page);
  const t0 = Date.now(); let ultimo = 0;
  while (Date.now() - t0 < SEC * 1000) {
    await sleep(700);
    const fase = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
    if (fase === 'ended') break;
    if (String(fase).indexOf('hl_') === 0 && Date.now() - ultimo > 5000) { ultimo = Date.now(); const o = await ombra366(page); if (o) { ombre.push(...o.righe); await scatta(o); } await page.evaluate(() => { window.__CPM_FROZEN = false; }); }
  }
} else {
  await openMatch(page, port, { name: NOME });
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => console.log('  (clip GLB non arrivate)'));
  await registra366(page);
  for (const gi of SCENE) {
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    await forceSituation(page, gi, { settle: 900, choose: true });
    await sleep(2500);
    let o = await ombra366(page); if (o) { ombre.push(...o.righe); await scatta(o); }
    await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_RESOLVE(0); });
    await sleep(2200); o = await ombra366(page); if (o) ombre.push(...o.righe);
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    const t1 = Date.now(); while (Date.now() - t1 < 5000) { await sleep(300); if (await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()) !== 'hl_result') break; }
    console.log(`  scena gi${gi}: ombre misurate finora ${ombre.length}`);
  }
}
const rec = await page.evaluate(() => ({ R: window.__CPM_REC366, piedi: window.__CPM_PIEDI ? { fr: window.__CPM_PIEDI.fr, cont: window.__CPM_PIEDI.cont, sk: window.__CPM_PIEDI.sk, hl: window.__CPM_PIEDI.hl } : null, min: window.__CPM_STATE && window.__CPM_STATE().minute }));
console.log(`\n=== misura-366 · vista ${VISTA} · ora ${TOD} · ${FLAG || 'verde'} · ${rec.R ? rec.R.fr : 0} fotogrammi · minuto ${rec.min} ===`);
riassumi366(rec.R, ombre, rec.piedi, { stampa: true });
if (process.env.CPM_JSON) fs.writeFileSync(process.env.CPM_JSON, JSON.stringify({ R: rec.R, ombre, piedi: rec.piedi }));
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close(); setTimeout(() => process.exit(0), 200);
