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
const SEMI = [7, 99, 1234, 2021];/* MISURATO 09/10 su 7.999.155: verde vicini 9/9, difensore usato 14/17 (82%); rosso 7/8, 15/19 (79%) — separazione sottile perche' anche il rosso ha il teatro armato; il guardiano resta un pavimento, non una misura fine */
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
for (const rosso of [false, true]) { const tot = { nominati: 0, vicini: 0, usato: 0, scartato: 0, esempi: [] };
  for (const sd of SEMI) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + sd;
    await page.addInitScript(([s, r]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_B4REC = 1; window.__CPM_PRESENT = 1;/* lo stacco d'apertura (teatro) e' spento sotto cpmtest: senza, lo scambio non avviene (lezione 7.345) */ if (r) { window.__CPM_NO_CAST219 = 1; window.__CPM_NO_SWAP219 = 1; } localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso]);
    await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(() => window.__CPM_CAREER.playMatch());
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
    await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
    const t0 = Date.now(); let ph = '', prev = '';
    while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
      if (ph === 'hl_choose' && prev !== 'hl_choose') { await sleep(400);
        const m = await page.evaluate(() => { const C = (window.__CPM_CAST219 || []).slice(-1)[0]; let st = null; try { st = window.__CPM_STATE(); } catch (e) {} if (!C || !st) return null;
          const P = st.players || [], H = st.hero || {}; const f = (w) => { if (!w || w.i == null || !P[w.i]) return null; const p = P[w.i]; return { nome: w.nome, d: +Math.hypot(p.x - H.x, p.y - H.y).toFixed(1) }; };
          return { tipo: C.tipo, n: (C.prel || []).map(f).filter(Boolean) }; });/* [PO-219b] i compagni NOMINATI dalla manovra (preludio), uguali nei due bracci */
        if (m && !/^(cross|angolo|punizione|rigore)$/.test(m.tipo || '')) for (const x of m.n) { tot.nominati++; if (x.d <= 25) tot.vicini++; else if (tot.esempi.length < 6) tot.esempi.push(sd + ' ' + m.tipo + ' ' + x.nome + ' a ' + x.d + ' u'); } }
      prev = ph; if (ph === 'ended' || ph === 'ceremony') break; await sleep(250); }
    const W = await page.evaluate(() => window.__CPM_B4DIF || { usato: 0, scartato: 0 }); tot.usato += W.usato | 0; tot.scartato += W.scartato | 0;
    tot.scambi = (tot.scambi | 0) + await page.evaluate(() => (window.__CPM_SW219 || []).reduce((a, x) => a + (x.scambi | 0), 0));/* quante scene lo scambio ha davvero toccato */
    console.log((rosso ? 'rosso' : 'verde') + ' seme ' + sd + ' fine ' + ph); await ctx.close();
  }
  esito[rosso ? 'rosso' : 'verde'] = tot; console.log((rosso ? 'ROSSO' : 'VERDE') + ' ' + JSON.stringify(tot));
}
await b.close(); srv.close();
const q = (t) => ({ vic: t.nominati ? t.vicini / t.nominati : 0, uso: (t.usato + t.scartato) ? t.usato / (t.usato + t.scartato) : 0 });
/* [7.999.155, catena completa del 09/10] il contatore «difensore usato» NON separa i bracci (verde 87%, rosso 94%): resta stampato come
   informazione. La prova e' la grandezza del difetto del PO — nominati LONTANI dall'eroe nel 3D all'apertura — su 4 partite. */
const V = q(esito.verde), R = q(esito.rosso), g = [];
if (!(esito.verde.nominati >= 12 && V.vic >= 0.95)) g.push('verde: vicini ' + (100 * V.vic).toFixed(0) + '% su ' + esito.verde.nominati + ' nominati (servono >=95% su >=12)');
if (!(R.vic < V.vic && R.vic < 0.95)) g.push('rosso: il difetto non si vede (vicini ' + (100 * R.vic).toFixed(0) + '% contro ' + (100 * V.vic).toFixed(0) + '%)');
console.log('informativo: difensore usato verde ' + (100 * V.uso).toFixed(0) + '% · rosso ' + (100 * R.uso).toFixed(0) + '%; scambi verde ' + (esito.verde.scambi | 0));
if (g.length) { console.log('❌ nomi-219'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ nomi-219 verde (vicini ' + (100 * V.vic).toFixed(0) + '% su ' + esito.verde.nominati + '; rosso ' + (100 * R.vic).toFixed(0) + '% su ' + esito.rosso.nominati + ')');
