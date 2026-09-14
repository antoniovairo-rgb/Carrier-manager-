#!/usr/bin/env node
/* [7.361.0] GUARDIANO DELLA FAMIGLIA DEL GESTO DIFENSIVO — collaudo PO #136 «non prova a deviare»,
   #138 «azione difensiva indefinita».

   `defGesto` (slide / lunge / press / aerial / call) e' bakato in S() leggendo l'ETICHETTA dell'azione:
   un'azione difensiva che non incrocia nessuna regex resta senza famiglia, e chi non ce l'ha cade sul
   default a valle — la clip `tackle`, cioe' una SCIVOLATA A TERRA. Misurato prima del fix: 21 azioni su
   90 (23%) senza famiglia, fra cui gi136 k2 «📣 Chiama il portiere» — una chiamata che a schermo
   diventava un tuffo, letteralmente la nota del PO. Gli scoperti erano tre gruppi che il classificatore
   non prevedeva: le chiamate (8), gli stacchi di testa (4) e le letture di posizione (4).

   Il guardiano e' STRUTTURALE: non giudica quale famiglia sia la piu' giusta (e' un giudizio percettivo,
   da fare dal vivo GLB-ON), pretende che NESSUNA azione difensiva resti senza — perche' «senza» non
   significa «neutro», significa «scivolata».
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node def-gesture-test.mjs                               */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { readFileSync } from 'node:fs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port); await sleep(900);
const r = await page.evaluate(() => {
  const out = { def: 0, senza: [], perFam: {} };
  (window.__CPM_SITS || []).forEach((s, gi) => {
    if (!s || s.type !== 'def') return;
    (s.actions || []).forEach((a, k) => {
      out.def++; const g = a && a.defGesto;
      out.perFam[g || '(nessuna)'] = (out.perFam[g || '(nessuna)'] || 0) + 1;
      if (!g) out.senza.push({ gi, k, lbl: String((a && a.label) || '') });
    });
  });
  return out;
});
console.log(`azioni difensive: ${r.def} · per famiglia ${JSON.stringify(r.perFam)}`);
if (r.def < 60) issues.push(`solo ${r.def} azioni difensive lette: la misura non e' stata fatta`);
if (r.senza.length) {
  issues.push(`${r.senza.length} azioni difensive senza famiglia: a schermo diventano una scivolata a terra`);
  r.senza.slice(0, 12).forEach(x => console.log(`  · gi${x.gi} k${x.k} «${x.lbl}»`));
}
/* le due famiglie nuove devono ARRIVARE ai loro consumatori: senza la mappa GLB e la posa procedurale
   sarebbero etichette che non cambiano niente a schermo — il modo piu' silenzioso di non correggere. */
{
  const src = readFileSync(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf8');
  for (const [fam, ancora, dove] of [
    ['call', "_dgG==='call'", 'la mappa delle clip GLB'],
    ['aerial', "_dgG==='aerial'", 'la mappa delle clip GLB'],
    ['call', '_dg42==="call"', 'la posa procedurale'],
    ['aerial', '_dg42==="aerial"', 'la posa procedurale'],
  ]) if (!src.includes(ancora)) issues.push(`la famiglia \`${fam}\` non e' letta da ${dove}: e' un'etichetta che non cambia niente a schermo`);
  /* e le tre famiglie storiche non devono essere state riscritte: il quarto passaggio doveva coprire il
     buco, non ridisegnare la mappa (69 azioni gia' classificate). */
  if (!/if\(\/scivolat\|disperat\/i\.test\(_l\)\)a\.defGesto="slide";/.test(src))
    issues.push('la regex storica di `slide` e\' cambiata: il ripiego doveva essere additivo, non una riscrittura');
}
await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ GESTO DIFENSIVO OK — ogni azione difensiva ha una famiglia, e le famiglie arrivano a schermo');
