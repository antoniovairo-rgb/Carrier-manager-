#!/usr/bin/env node
/* [7.999.161 SEME-a — GUARDIANO «stesso salvataggio, stesso seme, stessa partita»] Bloccante (a) della prontezza 17/10.
   Gioca N giri della STESSA partita (salvataggio save-190-s12-ovr93, autoplay seedato) su pagine nuove e confronta:
     · gli INGRESSI del motore del possesso (registratore __CPM_REG202), esclusi `scenaMuovi` (ripristina lo stato nel suo
       finally) e `probEroe` (percentuale d'interfaccia calcolata a ogni render);
     · i sorteggi del motore per minuto (__CPM_RND14);
     · il punteggio finale.
   VERDE: tutto identico in tutti i giri.  ROSSO (prova del rosso, CPM_ROSSO=1 accende window.__CPM_NO_SEME): il primo
   ingresso divergente deve comparire entro il 15' (CPM_ROSSO_MAX) — se non diverge, il guardiano e' CIECO ed esce ≠0.
   Variabili: SEME (2311) · GIRI (3; rosso 2) · STOPMIN (verde 0 = partita intera; rosso 20) · CPM_ROSSO=1 · FLAGS=a,b.
   Diagnosi: docs/governo/riferimenti/SEME-a-diagnosi.md · rapporto: docs/sviluppo/RAPPORTO-giro9.md */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const ROSSO = process.env.CPM_ROSSO === '1';
const SEME = +(process.env.SEME || 2311), GIRI = +(process.env.GIRI || (ROSSO ? 2 : 3));
const STOPMIN = +(process.env.STOPMIN || (ROSSO ? 20 : 0)), ROSSO_MAX = +(process.env.CPM_ROSSO_MAX || 15);
const FLAGS = (process.env.FLAGS || '').split(',').filter(Boolean).concat(ROSSO ? ['__CPM_NO_SEME'] : []);
const ESCL = /scenaMuovi|probEroe/;
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(n) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e && e.message).slice(0, 160)));
  await page.addInitScript(([s, fl]) => {
    window.__CPM_GLB = false; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s));
    window.__CPM_REG202 = {}; window.__CPM_RND14 = {};
    for (const f of fl) window[f] = 1;
  }, [save, FLAGS]);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => { try { return window.__CPM_CAREER.playMatch(); } catch (e) { return 'err ' + e.message; } });
  for (let k = 0; k < 14; k++) { const ph0 = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph0 === 'playing') break;
    await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null);
      const x = bs.find(b => /Diplomatico|Siamo pronti|Continua|Chiudi|Prosegui|Avanti|Salta e gioca/i.test(b.textContent || '') && !/Chiudi la stagione|Vivi la Settimana/i.test(b.textContent || '')); if (x) x.click(); });
    await sleep(900); }
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), SEME);
  const tA = Date.now(); let ph;
  while (Date.now() - tA < 480000) { ph = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph === 'ended' || ph === 'ceremony') break;
    if (STOPMIN && (await page.evaluate(() => window.__CPM_CLOCK())) >= STOPMIN) break; await sleep(700); }
  const r = await page.evaluate(() => ({ sc: window.__CPM_SCORE && window.__CPM_SCORE(), clock: window.__CPM_CLOCK && window.__CPM_CLOCK(),
    log: (window.__CPM_REG202 && window.__CPM_REG202.log) || [], rnd14: window.__CPM_RND14 || {}, rip: window.__CPM_SEME161 || [] }));
  await ctx.close();
  return { giro: n, fine: ph, durataMs: Date.now() - tA, errs, ...r };
}
/* normalizzazione: si esclude cio' che non entra nel motore; numeri a 4 decimali; ogni voce porta il minuto dell'ultimo tick */
const norm = g => { let m = 0; const L = [];
  for (const e of g.log) { if (e[0] === 'tick' && e[1] && e[1][0]) m = e[1][0].min | 0; if (ESCL.test(e[0])) continue;
    L.push({ m, k: e[0] + ' ' + JSON.stringify(e[1], (kk, v) => typeof v === 'number' ? +v.toFixed(4) : v) }); }
  return L; };
const out = [];
for (let i = 0; i < GIRI; i++) { const g = await giro(i); out.push(g);
  const dMax = g.rip.reduce((a, r) => Math.max(a, r.d || 0), 0), fonti = g.rip.reduce((a, r) => (a[r.fonte] = (a[r.fonte] | 0) + 1, a), {});
  console.log(`giro ${i}: fine=${g.fine} min=${g.clock} punteggio=${g.sc ? g.sc.home + '-' + g.sc.away : '?'} ingressi=${g.log.length} durata=${g.durataMs}ms errori=${g.errs.length} · riprese ${g.rip.length} ${JSON.stringify(fonti)} eroe consegnato↔visto max ${dMax.toFixed(1)}u`); }
await b.close(); srv.close();
const base = norm(out[0]); let primaMin = null, diverge = false, motivi = [];
for (let i = 1; i < out.length; i++) { const L = norm(out[i]);
  let k = 0; while (k < Math.min(L.length, base.length) && L[k].k === base[k].k) k++;
  if (k < L.length || k < base.length) { diverge = true; const m = (base[k] || L[k]).m; primaMin = primaMin == null ? m : Math.min(primaMin, m);
    motivi.push(`giro ${i}: primo ingresso divergente #${k} al ${m}'\n     0: ${(base[k] || { k: '(fine)' }).k.slice(0, 200)}\n     ${i}: ${(L[k] || { k: '(fine)' }).k.slice(0, 200)}`); }
  const r0 = out[0].rnd14, r = out[i].rnd14; const ms = [...new Set([...Object.keys(r0), ...Object.keys(r)])].map(Number).sort((a, b) => a - b);
  const mr = ms.find(m => r0[m] !== r[m]); if (mr !== undefined) { diverge = true; primaMin = primaMin == null ? mr : Math.min(primaMin, mr); motivi.push(`giro ${i}: sorteggi del motore diversi dal ${mr}'`); }
  const s0 = JSON.stringify(out[0].sc), s = JSON.stringify(out[i].sc); if (s0 !== s) { diverge = true; motivi.push(`giro ${i}: punteggio ${s} contro ${s0}`); }
}
const errTot = out.reduce((a, g) => a + g.errs.length, 0), corti = out.filter(g => !STOPMIN && g.fine !== 'ended' && g.fine !== 'ceremony').length;
console.log(motivi.length ? motivi.join('\n') : 'ingressi del motore, sorteggi per minuto e punteggio IDENTICI in tutti i giri');
if (errTot) console.log(`errori di pagina: ${errTot} — ${out.flatMap(g => g.errs).slice(0, 3).join(' | ')}`);
if (out.some(g => (g.log || []).length < 50)) { console.log('❌ CIECO: il registratore del motore non ha registrato (meno di 50 ingressi)'); process.exit(1); }
if (ROSSO) {
  const ok = diverge && primaMin != null && primaMin <= ROSSO_MAX;
  console.log(ok ? `✅ PROVA DEL ROSSO: con __CPM_NO_SEME la partita diverge al ${primaMin}' (entro il ${ROSSO_MAX}')` : `❌ PROVA DEL ROSSO FALLITA: ${diverge ? 'divergenza al ' + primaMin + "'" : 'nessuna divergenza'} — il guardiano non separa`);
  process.exit(ok ? 0 : 1);
}
if (corti) console.log(`⚠️ ${corti} giri non arrivati al fischio finale nel tetto di tempo`);
const ok = !diverge && !errTot && !corti;
console.log(ok ? `✅ SEME-a VERDE: ${GIRI} giri, seme ${SEME}, stessa partita` : '❌ SEME-a ROSSO');
process.exit(ok ? 0 : 1);
