#!/usr/bin/env node
/* [7.999.162 PO-230, decisione PO 13/10 «la finestra standard e' il Modal del gioco»; foto PO sulla 7.999.160: «La tua storia» in finestra
   mostrava il titolo con la freccia della fisarmonica e poi «LA TUA STORIA» dentro] GUARDIANO esteso: oltre alla cornice, la STRUTTURA del
   Modal. Due finestre-impulso forzate sul salvataggio S12: (a) il verdetto del patto col mister (occhiello senza fisarmonica), (b) il
   procuratore «boutique o global?» (fisarmonica + occhiello: la stessa forma di «La tua storia»). Per ciascuna si contano dentro il pannello
   [data-cpm=finestra230] i titoli (riga della fisarmonica, occhielli maiuscoli, titolo del Modal) e le frecce della fisarmonica
   (button[aria-expanded]).
   VERDE: un solo titolo, nessuna freccia, testa del Modal [data-cpm=finestra-testa] con filo sotto, pulsanti nel piede [data-cpm=finestra-piede],
   cornice opaca con raggio >=16.
   ROSSO (__CPM_NO_MOD230, la Card clonata della 7.999.161): sul procuratore due titoli e la freccia, nessuna testa del Modal.
   ROSSO storico (__CPM_NO_FIN230): cornice trasparente. Uso: node finestra-230.mjs   (CPM_FOTO=<prefisso> per le foto, CPM_W/CPM_H viewport) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const W = +process.env.CPM_W || 375, H = +process.env.CPM_H || 812;
const srv = await startServer(); const b = await launchBrowser(); const esito = {};
const misura = () => {
  const fr = document.querySelector('[data-cpm="finestra230"]'); if (!fr) return null;
  const cs = getComputedStyle(fr); const tr = v => !v || v === 'transparent' || /rgba\(0, 0, 0, 0\)/.test(v);
  const frecce = fr.querySelectorAll('button[aria-expanded]').length;
  const testi = [];
  fr.querySelectorAll('button[aria-expanded] span:first-child').forEach(e => testi.push('fisarmonica:' + e.textContent.trim()));
  fr.querySelectorAll('div').forEach(e => { if (getComputedStyle(e).textTransform === 'uppercase' && e.textContent.trim() && !e.querySelector('div,button')) testi.push('occhiello:' + e.textContent.trim()); });
  fr.querySelectorAll('[data-cpm="finestra-titolo"]').forEach(e => testi.push('modal:' + e.textContent.trim()));
  const testa = fr.querySelector('[data-cpm="finestra-testa"]'); const piede = fr.querySelector('[data-cpm="finestra-piede"]');
  const card = fr.firstElementChild; const cc = card ? getComputedStyle(card) : null;
  return { titoli: testi.length, testi, frecce, testa: !!testa && parseFloat(getComputedStyle(testa).borderBottomWidth) > 0, piede: !!piede && !!piede.querySelector('button'),
    raggio: parseFloat(cs.borderTopLeftRadius) || 0, cornice: !tr(cs.backgroundColor), cardTrasp: cc ? tr(cc.backgroundColor) && !/gradient/.test(cc.backgroundImage) : null };
};
const CASI = {
  patto: p => ({ coachPact: { season: p.season || 1, fromWeek: 0, target: 0, games: 4, kind: 'gol', status: 'active' } }),
  procuratore: p => ({ hasAgent: true, agent: p.agent || { name: 'Procuratore di prova' }, agentStyle: null, agentCheckin: { ...(p.agentCheckin || {}), due: false }, agentInit: { ...(p.agentInit || {}), open: false }, agentHint: null,
    coachPact: null, coachPactSeason: p.season || 1 }),
};
for (const braccio of ['verde', 'rosso', 'rossoFin']) {
  esito[braccio] = {};
  for (const caso of Object.keys(CASI)) {
    const ctx = await b.newContext({ viewport: { width: W, height: H } }); const page = await ctx.newPage(); await installCdnRoutes(page);
    await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_POP224 = 1; if (s.r === 'rosso') window.__CPM_NO_MOD230 = 1; if (s.r === 'rossoFin') window.__CPM_NO_FIN230 = 1; try { localStorage.setItem('cpm-v3', JSON.stringify(s.save)); } catch (e) {} }, { r: braccio, save });
    await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
    try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
    await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
    try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
    await page.evaluate(src => { const p = window.__CPM_CAREER.get(); const f = eval(src); window.__CPM_CAREER.patch(f(p)); window.__CPM_CAREER.goTab && window.__CPM_CAREER.goTab('dashboard'); }, CASI[caso].toString());
    await sleep(1500);
    const m = await page.evaluate(misura);
    if (process.env.CPM_FOTO) await page.screenshot({ path: `${process.env.CPM_FOTO}-${caso}-${braccio === 'verde' ? 'dopo' : braccio === 'rosso' ? 'prima' : 'senzacornice'}.png` });
    esito[braccio][caso] = m; console.log(braccio + ' ' + caso + ' ' + JSON.stringify(m)); await ctx.close();
  }
}
await b.close(); srv.close();
const g = [];
for (const caso of Object.keys(CASI)) {
  const V = esito.verde[caso], R = esito.rosso[caso], F = esito.rossoFin[caso];
  if (!V) { g.push(`verde ${caso}: nessuna finestra`); continue; }
  if (!(V.titoli === 1 && V.frecce === 0 && V.testa && V.piede && V.cornice && V.raggio >= 16)) g.push(`verde ${caso}: non ha la struttura del Modal ` + JSON.stringify(V));
  if (F && F.cornice) g.push(`rosso __CPM_NO_FIN230 ${caso}: la cornice c'e' ancora ` + JSON.stringify(F));
  if (R && R.testa) g.push(`rosso __CPM_NO_MOD230 ${caso}: c'e' la testa del Modal ` + JSON.stringify(R));
}
const RP = esito.rosso.procuratore;
if (!(RP && (RP.titoli >= 2 || RP.frecce >= 1))) g.push('rosso __CPM_NO_MOD230: sul procuratore il titolo doppio/la freccia non si vedono ' + JSON.stringify(RP));
if (g.length) { console.log('❌ finestra-230'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ finestra-230 verde (un solo titolo, nessuna freccia, testa e piede del Modal, cornice standard) e i due rossi si vedono');
