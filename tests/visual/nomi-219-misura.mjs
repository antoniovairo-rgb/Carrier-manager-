#!/usr/bin/env node
/* [7.999.155 PO-219 «nella scena ci sono A, B, C ma dice che gliela passa D»] GUARDIANO su partite vere dal salvataggio S12 (autoplay,
   semi fissi). In scelta azione, per ogni giocatore nominato dalla scena (ricevente, difensore/portatore) misura dove lo disegna il 3D
   (__CPM_STATE) rispetto all'eroe, e conta quante volte il 3D usa davvero il difensore nominato (__CPM_B4DIF). MISURATO prima (7.999.154):
   nominati a 15-50 u da dove li crede il motore, difensore del cast scartato dal 3D 18 volte su 34. VERDE: almeno l'85% dei nominati
   entro 25 u dall'eroe nel 3D e il difensore nominato usato dal 3D in almeno l'80% dei casi. ROSSO (__CPM_NO_CAST219 + __CPM_NO_SWAP219): sotto almeno una. Il teatro va armato (__CPM_PRESENT=1): lo scambio avviene allo stacco.
   Uso: node nomi-219.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SEMI = [7, 99, 1234, 2021, 5, 42, 77, 314];/* [7.999.158] otto partite: col tetto di 7 scene a partita (decisione PO 11/10) i compagni nominati scendono (verde 11 su 6 partite, sotto il pavimento di 12): si allarga il campione, il pavimento non si abbassa *//* [09/10] sei partite: con quattro la copertura variava fra corse (15 nominati, poi 9) e il pavimento di 12 cadeva per mancanza di campione, non per difetto *//* [PO-219b, 09/10] SI MISURANO I COMPAGNI NOMINATI DAL TESTO DELLA MANOVRA (preludio: «Uno-due con X», «A apre per B, che ti serve», «Passaggio di X per te»), letti dal preludio e non dal cast: stessi uomini nei due bracci. La misura precedente (ricevente/difensore del cast) NON separava: rosso 100% contro verde 96%, perche' nel rosso il cast nomina un altro uomo. MISURATO su 7.999.155: verde 14/15 vicini (l'unico lontano era il PORTIERE che apre dal fondo, ora contato a parte), rosso 6/14. Soglie fissate su questa misura: verde >=90% su >=12, rosso <70% e almeno 20 punti sotto il verde. */
const SEMI2 = (process.env.SEMI || '7,99,1234,2021,5,42,77,314').split(',').map(Number);
const BR = (process.env.BRACCI || 'verde').split(',');
const PAR = +(process.env.PAR || 2), TMAX = +(process.env.TMAX || 420000);
const srv = await startServer(); const b = await launchBrowser();
async function partita(sd, rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + sd;
  await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_B4REC = 1; window.__CPM_PRESENT = 1; if (r) { window.__CPM_NO_CAST219 = 1; window.__CPM_NO_SWAP219 = 1; } localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
  const t0 = Date.now(); let ph = '', prev = ''; const rec = [];
  const leggi = () => page.evaluate(() => { const C = (window.__CPM_CAST219 || []).slice(-1)[0]; let st = null; try { st = window.__CPM_STATE(); } catch (e) {} if (!C || !st) return null;
    const P = st.players || [], H = st.hero || {}; return { ph: window.__CPM_PHASE(), tipo: C.tipo, k: (window.__CPM_CAST219 || []).length, n: (C.prel || []).filter(w => !w.gk).map(w => (w && w.i != null && P[w.i]) ? { nome: w.nome, i: w.i, d: +Math.hypot(P[w.i].x - H.x, P[w.i].y - H.y).toFixed(1) } : null).filter(Boolean) }; });
  while (Date.now() - t0 < TMAX) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
    if (ph === 'hl_choose' && prev !== 'hl_choose') { const tc = Date.now(); const serie = [];
      for (const w of [0, 400, 900]) { const dt = w - (Date.now() - tc); if (dt > 0) await sleep(dt); const m = await leggi(); serie.push({ t: Date.now() - tc, m }); }
      rec.push({ min: await page.evaluate(() => window.__CPM_CLOCK ? window.__CPM_CLOCK() : null), serie }); }
    prev = ph; if (ph === 'ended' || ph === 'ceremony') break; await sleep(250); }
  await ctx.close(); return { sd, rosso, rec, s: Math.round((Date.now() - t0) / 1000) };
}
const lav = []; for (const br of BR) for (const sd of SEMI2) lav.push([sd, br !== 'verde']);
let ix = 0; await Promise.all(Array.from({ length: PAR }, async () => { while (ix < lav.length) { const [sd, r] = lav[ix++]; try { const o = await partita(sd, r); console.log('SEME ' + JSON.stringify(o)); } catch (e) { console.log('ERR ' + sd + ' ' + String(e).slice(0, 200)); } } }));
await b.close(); srv.close();
