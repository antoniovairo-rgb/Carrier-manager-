#!/usr/bin/env node
/* [giro 271] SONDA DI MISURA (non e' un guardiano): il «salto di camera» di post-highlight su una scena, fotogramma per fotogramma.
   Rifa' le condizioni del gate (corpi 3D spenti, scena precedente risolta e assestata, poi samplePostHighlight: forzatura, attesa
   fissa, risoluzione, 1,1 s di finestra) su una PAGINA NUOVA per prova, e registra DENTRO la pagina ogni fotogramma: posizione della
   camera, stacco nero vivo (__CPM_CUTLIVE), fase, pallone, eroe; alla fine il testimone degli snap del gioco (__CPM_CAM471).
   Uso: node misura-271.mjs            (CPM_N=prove per braccio, default 6 · CPM_GI=scena, default 0 · CPM_PRIMA=scena precedente,
        default 184 · CPM_ESITO=success|fail|naturale · CPM_SETTLE=ms dell'attesa fissa, default 600 · CPM_FLAG=interruttori) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, waitBallSettle, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_N || 6), GI = +(process.env.CPM_GI || 0), PRIMA = +(process.env.CPM_PRIMA || 184), SETTLE = +(process.env.CPM_SETTLE || 600);
const ESITI = (process.env.CPM_ESITO || 'fail,success').split(','), FLAG = (process.env.CPM_FLAG || '').split(',').filter(Boolean);
/* CPM_MODO=gate: il campionatore VERO del gate (samplePostHighlight, lettura da node ogni 110 ms) sulle sei scene di post-highlight,
   pagina nuova per prova; CPM_APRI=0 = attesa fissa di prima (braccio rosso dello strumento). Stampa il numero che il check giudica. */
if (process.env.CPM_MODO === 'gate') { const { samplePostHighlight } = await import('./lib/harness.mjs');
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const APRI = process.env.CPM_APRI !== '0'; let sopra = 0, tot = 0, nonAperte = 0;
  for (const gi of (process.env.CPM_GI || '0,2,30,60,79,120').split(',').map(Number)) for (let n = 0; n < N; n++) {
    const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page); await page.addInitScript(() => { window.__CPM_GLB = false; });
    await openMatch(page, port);
    await forceSituation(page, PRIMA, { settle: 550, choose: true }); await page.evaluate(() => window.__CPM_RESOLVE(0)); await sleep(700);
    await waitBallSettle(page, { maxMs: 9000, quietMs: 700, pollMs: 110 }); await sleep(300);
    if (process.env.CPM_ESITO && process.env.CPM_ESITO !== 'naturale') await page.evaluate(e => { window.__CPM_FORCE_OUTCOME = e; }, process.env.CPM_ESITO);
    const s = await samplePostHighlight(page, gi, { windowMs: 1100, pollMs: 110, apri: APRI });
    const out = await page.evaluate(() => window.__CPM_OUTCOME ? (window.__CPM_OUTCOME.ok ? 'ok' : 'ko') + '/' + window.__CPM_OUTCOME.outKey : '?'); await page.close();
    let maxCam = 0, coppie = 0; for (let i = 1; i < s.frames.length; i++) { const a = s.frames[i - 1], c = s.frames[i]; if (c.t - a.t > 110 * 2.2) continue; coppie++; if (a.cam && c.cam && !(a.cut || c.cut)) maxCam = Math.max(maxCam, Math.hypot(c.cam.x - a.cam.x, c.cam.y - a.cam.y, c.cam.z - a.cam.z)); }
    tot++; if (maxCam > 30) sopra++; if (s.aperta && !s.aperta.ok && !s.aperta.settled) nonAperte++;
    console.log(`gi${gi} #${n + 1} ${APRI ? 'evento' : 'attesa fissa'} · esito ${out} · apertura ${s.aperta ? (s.aperta.settled ? 'pallone fermo dopo ' : 'TETTO a ') + s.aperta.ms + ' ms' : '—'} · coppie ${coppie} · salto camera scoperto ${maxCam.toFixed(1)}${maxCam > 30 ? ' ❌ > 30' : ''}`); }
  console.log(`TOTALE ${APRI ? 'evento' : 'attesa fissa'}: ${sopra} salti > 30 su ${tot} prove · ${nonAperte} aperture al tetto`);
  await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close(); setTimeout(() => process.exit(0), 100); await new Promise(() => {}); }
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const esito of ESITI) for (let n = 0; n < N; n++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(f => { window.__CPM_GLB = false; for (const k of f) window[k] = 1;
    window.__M271 = { on: false, fr: [] };
    const loop = () => { try { const M = window.__M271; if (M.on && M.fr.length < 4000) { const p = window.__CPM_PROBE && window.__CPM_PROBE();
      M.fr.push({ t: performance.now(), c: p && p.camera ? [p.camera.x, p.camera.y, p.camera.z] : null, n: window.__CPM_CUTLIVE ? !!window.__CPM_CUTLIVE() : false, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null,
        b: p && p.ball ? [p.ball.world.x, p.ball.world.z] : null, h: p && p.hero ? [p.hero.world.x, p.hero.world.z] : null, s: typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null }); } } catch (e) {} requestAnimationFrame(loop); };
    requestAnimationFrame(loop); }, FLAG);
  await openMatch(page, port);
  /* la scena di prima, come nella passata «stato finale» del gate */
  await forceSituation(page, PRIMA, { settle: 550, choose: true }); await page.evaluate(() => window.__CPM_RESOLVE(0)); await sleep(700);
  await waitBallSettle(page, { maxMs: 9000, quietMs: 700, pollMs: 110 }); await sleep(300);
  /* samplePostHighlight, uguale al gate, col registratore di pagina acceso */
  await page.evaluate(() => { window.__CPM_CAM471 = []; window.__M271.fr = []; window.__M271.on = true; });
  await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [GI, true]);
  await sleep(SETTLE);
  const tRis = await page.evaluate(([e]) => { if (e !== 'naturale') window.__CPM_FORCE_OUTCOME = e; const t = performance.now(); window.__CPM_RESOLVE(0); return t; }, [esito]);
  await sleep(1100 + 400);
  const r = await page.evaluate(() => { window.__M271.on = false; return { fr: window.__M271.fr, c471: (window.__CPM_CAM471 || []).slice(), out: window.__CPM_OUTCOME ? { ok: window.__CPM_OUTCOME.ok, k: window.__CPM_OUTCOME.outKey, kd: window.__CPM_OUTCOME.outKind } : null }; });
  await page.close();
  const fr = r.fr.filter(f => f.c); let max = 0, maxS = 0, quando = null, scoperto = null; const passi = [];
  for (let i = 1; i < fr.length; i++) { const a = fr[i - 1], c = fr[i]; const d = Math.hypot(c.c[0] - a.c[0], c.c[1] - a.c[1], c.c[2] - a.c[2]);
    if (d > 3) passi.push(`${(c.t - tRis).toFixed(0)}ms:${d.toFixed(1)}${(a.n || c.n) ? 'N' : ''}${c.ph !== 'hl_result' ? '(' + c.ph + ')' : ''}`);
    if (c.t >= tRis && c.t <= tRis + 1100) { if (d > max) max = d; if (!(a.n || c.n) && d > maxS) { maxS = d; quando = c.t - tRis; scoperto = { da: a.c.map(x => +x.toFixed(1)), a: c.c.map(x => +x.toFixed(1)), dt: +(c.t - a.t).toFixed(0) }; } } }
  const alR = fr.find(f => f.t >= tRis) || fr[fr.length - 1] || {}; const dt = fr.slice(1).map((f, i) => f.t - fr[i].t).sort((x, y) => x - y);
  const dBH = alR.b && alR.h ? Math.hypot(alR.b[0] - alR.h[0], alR.b[1] - alR.h[1]) : null;
  console.log(`${esito.padEnd(8)} #${n + 1} esito ${r.out ? (r.out.ok ? 'ok' : 'ko') + '/' + r.out.k + '/' + r.out.kd : '?'} · fotogrammi ${fr.length} (mediana ${dt.length ? dt[dt.length >> 1].toFixed(0) : '?'} ms, max ${dt.length ? dt[dt.length - 1].toFixed(0) : '?'} ms) · pallone-eroe alla risoluzione ${dBH == null ? '?' : dBH.toFixed(1)} u · salto max nella finestra ${max.toFixed(1)} · SCOPERTO ${maxS.toFixed(1)}${maxS > 30 ? ' ❌ a ' + quando.toFixed(0) + ' ms ' + JSON.stringify(scoperto) : ''}`);
  { const f0 = fr[0] || {}, fN = fr[fr.length - 1] || {}; const q = f => `pallone ${f.b ? f.b.map(x => x.toFixed(1)) : '?'} eroe ${f.h ? f.h.map(x => x.toFixed(1)) : '?'} scena ${f.s == null ? '?' : f.s.toFixed(2)}`;
    console.log(`           alla forzatura: ${q(f0)} · alla risoluzione: ${q(alR)} · alla fine: ${q(fN)}`); }
  const neri = []; { let da = null; for (const f of fr) { if (f.n && da == null) da = f.t; if (!f.n && da != null) { neri.push(`${(da - tRis).toFixed(0)}→${(f.t - tRis).toFixed(0)}`); da = null; } } if (da != null) neri.push(`${(da - tRis).toFixed(0)}→fine`); }
  console.log(`           stacco nero vivo (ms dalla risoluzione): [${neri.join(' ')}]`);
  console.log(`           passi > 3 u (ms dalla risoluzione): [${passi.join(' ')}] · snap del gioco: ${JSON.stringify(r.c471)}`);
}
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close(); setTimeout(() => process.exit(0), 100);
