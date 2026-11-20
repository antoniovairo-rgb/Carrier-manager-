/* [giro 304] SONDA, e con CPM_GUARDIANO=1 GUARDIANO (npm run tunnel-304: braccio verde + CPM_PROVA_ROSSO=1): la sostituzione «esce» di tunnel-245, scenario sost-comunale, con la traccia intera.
   Stesso percorso del guardiano (partita vera, «Salta ingresso», ingresso e uscita forzati dal banco con le stesse varianti), piu':
   · CPM_NO=293,295  accende window.__CPM_NO_G<n> per ogni numero (un interruttore alla volta, o piu' insieme)
   · per ogni uscita: punto di partenza dell'eroe, variante, fotogrammi dentro un oggetto, distanza minima dallo spigolo del nastro
     (x -4,77 · z -34,9), ritardo massimo dell'eroe sul bersaglio (ricostruito dalla formula della spezzata: stessa del gioco).
   · CPM_PARTENZE="x,z[,variante];x,z…"  (provocazione) mette l'eroe in quel punto del mondo prima di ogni uscita, col gancio di
     collaudo __CPM_DA304 (solo ?cpmtest=1), e fa un'uscita per punto. · CPM_USCITE=n  n uscite dal punto in cui la partita lascia l'eroe.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node misura-304.mjs   → una riga JSON per uscita + riga «ESITO». */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const GUARD = process.env.CPM_GUARDIANO === '1', ROSSO = !!process.env.CPM_PROVA_ROSSO;
const NO = (process.env.CPM_NO || (ROSSO ? '304' : '')).split(',').filter(Boolean), PART = GUARD ? [[-40, -20, 0], [15, -30, 3], [-35, -10, 1], [-38, -22, 0]] : process.env.CPM_PARTENZE ? process.env.CPM_PARTENZE.split(';').map(a => a.split(',').map(Number)) : null;
const NUSC = PART ? PART.length : +(process.env.CPM_USCITE || 0);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx);
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(o => { window.__CPM_GLB = false; window.__CPM_TOD = 'night'; window.__CPM_PRESENT = 1; window.__CPM_WALKTEST74 = 1; window.__CPM_G245W = []; window.__CPM_G255W = [];
  window.__CPM_TIPO206 = 'normale'; window.__CPM_STADIUM_TPL_FORCE = 'comunale'; window.__CPM_STADIUM_CAP_FORCE = 15000; o.no.forEach(n => { window['__CPM_NO_G' + n] = true; });
  localStorage.setItem('cpm-v3', JSON.stringify(o.s)); }, { s: SAVE, no: NO });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 180000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 120000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 60000 }); await sleep(2000);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
const ph = () => page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
for (let k = 0; k < 70; k++) { const p = await ph(); if (p === 'walkout') break;
  await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null); const x = bs.find(b => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua/i.test(b.textContent || '') && !/Salta/i.test(b.textContent || '')); if (x) x.click(); }).catch(() => {});
  await sleep(700); }
const t0 = Date.now(); let p = await ph();
while (p === 'walkout' && Date.now() - t0 < 120000) { await page.evaluate(() => { window.__CPM_SKIPWALK277 = true; }); await sleep(600); p = await ph(); }
const conta = v => page.evaluate(v => (window.__CPM_G255W || []).filter(e => e.sub === v).length, v).catch(() => 0);
const fine = async (v, n0) => { const t1 = Date.now(); let last = -1, fermo = 0; while (Date.now() - t1 < 150000) { const n = await conta(v); if (n > n0 && n === last) { if (++fermo >= 4) break; } else fermo = 0; last = n; await sleep(400); } };
const DUR = [4.6, 4.0, 4.4, 5.2, 5.0], SX = -3.9, VZ = -33.6, DZ = -36.2;
const bers = (x0, z0, t, V) => { const r = Math.min(1, t / (DUR[V] * 0.82)), pp = r * r * (3 - 2 * r); if (z0 <= VZ) return [x0 + (SX - x0) * pp, z0 + (DZ - z0) * pp];
  const d1 = Math.hypot(SX - x0, VZ - z0), d2 = Math.abs(DZ - VZ), q = d1 / (d1 + d2); if (pp < q) { const k = pp / q; return [x0 + (SX - x0) * k, z0 + (VZ - z0) * k]; } const k = (pp - q) / (1 - q); return [SX, VZ + (DZ - VZ) * k]; };
const uscite = []; let rosse = 0;
for (const [verso, gancio] of [['entra', '__CPM_FORCE_SUBENTRY'], ['esce', '__CPM_FORCE_SUBEXIT']]) { let buone = 0;
  for (let k = 0, giro = 0; k < (verso === 'esce' && NUSC ? NUSC : 5) && (buone < 2 || (verso === 'esce' && NUSC)); k++) { const n0 = await conta(verso); const V = PART && PART[k] && PART[k][2] != null ? PART[k][2] : (k % 2 ? 3 : 0);
    if (verso === 'esce' && NUSC && (k > 0 || giro > 0)) { const m0 = await conta('entra'); await page.evaluate(() => { window.__CPM_FORCE_SUBENTRY = 0; }); await fine('entra', m0); }/* rimette l'eroe in campo prima di un'altra uscita */
    if (verso === 'esce' && PART) await page.evaluate(d => { window.__CPM_DA304 = d; }, PART[k]);
    await page.evaluate(a => { window[a[0]] = a[1]; }, [gancio, V]); await fine(verso, n0);
    const F = await page.evaluate(a => (window.__CPM_G255W || []).filter(e => e.sub === a[0]).slice(a[1]), [verso, n0]).catch(() => []);
    const Z = F.filter(e => e.vis).map(e => e.z);
    if (Z.length >= 10 && (verso === 'esce' ? Math.min(...Z) <= -35.8 : (Math.min(...Z) <= -34.3 && Math.max(...Z) >= -33.2))) buone++;
    if (verso === 'esce' && F.length) { const f0 = F[0]; let lag = 0, dmin = 99, pen = 0, es = null, vmax = 0;
      F.forEach((e, i) => { if (!e.vis) return; const B = bers(f0.x, f0.z, e.t, V); lag = Math.max(lag, Math.hypot(B[0] - e.x, B[1] - e.z)); dmin = Math.min(dmin, Math.hypot(Math.max(0, e.x - -4.77), Math.max(-35.175 - e.z, 0, e.z - -34.625))); if (e.pen.length) { pen++; if (!es) es = [e.x, e.z, e.t, e.pen[0]]; }
        if (i) { const a = F[i - 1], dt = e.t - a.t; if (dt > 0) vmax = Math.max(vmax, Math.hypot(e.x - a.x, e.z - a.z) / dt); } });
      const u = { k, V, da: [f0.x, f0.z], zmin: Math.min(...Z), fr: F.filter(e => e.vis).length, pen, es, dmin: +dmin.toFixed(2), lagMax: +lag.toFixed(2), vmax: +vmax.toFixed(1), fase: await ph(), tr: process.env.CPM_TRACCIA ? F.map(e => [e.t, e.x, e.z]) : undefined };
      if (GUARD && u.fr < 40 && giro < 2) { giro++; k--; console.log(`  (uscita ${u.k} interrotta dalla partita dopo ${u.fr} fotogrammi: riprovo, tentativo ${giro + 1} di 3)`); continue; }/* cio' che la partita interrompe si riprova, al massimo 3 volte per partenza */
      giro = 0; if (pen) rosse++; uscite.push(u); console.log(JSON.stringify(u)); } } }
console.log(`ESITO no=[${NO.join(',')}] uscite ${uscite.length} · con l'eroe dentro un oggetto ${rosse} · errori ${JSON.stringify(errs.slice(0, 2))}`);
await ctx.close(); await b.close(); srv.close();
if (!GUARD) process.exit(0);
/* GUARDIANO (npm run tunnel-304): partenze provocate dal lato da cui l'eroe tagliava lo spigolo. Giudicata = l'uscita non e' stata interrotta (almeno 40 fotogrammi) ed e' arrivata alla
   linea della fascia degli oggetti (z <= -33,7: il punto davanti al varco e' a -33,6, la striscia LED a -34,4); ne servono almeno 2, altrimenti «non giudicato» = rosso. */
const G = uscite.filter(u => u.fr >= 40 && u.zmin <= -33.7), dentro = G.filter(u => u.pen).length;
if (G.length < 2) { console.log(`non giudicato: ${G.length} uscite arrivate alla fascia degli oggetti (minimo 2)`); console.log(ROSSO ? 'ROSSO NON VISTO: guardiano cieco.' : 'ROSSO: non giudicato'); process.exit(1); }
if (ROSSO) { console.log(`BRACCIO ROSSO (__CPM_NO_G304) — uscite giudicate ${G.length} · con l'eroe dentro un oggetto ${dentro}`); console.log(dentro ? 'ROSSO VISTO: senza il vincolo l\'eroe taglia lo spigolo dentro gli oggetti di bordo campo.' : 'ROSSO NON VISTO: guardiano cieco.'); process.exit(dentro ? 0 : 1); }
console.log(`BRACCIO VERDE — uscite giudicate ${G.length} · con l'eroe dentro un oggetto ${dentro}`); console.log(!dentro && !errs.length ? 'VERDE: uscendo da lontano l\'eroe passa dal varco senza toccare nastro, striscia LED e cartelloni.' : 'ROSSO: ' + (dentro ? `${dentro} uscite con l'eroe dentro un oggetto` : 'errori di pagina ' + JSON.stringify(errs.slice(0, 2)))); process.exit(!dentro && !errs.length ? 0 : 1);
