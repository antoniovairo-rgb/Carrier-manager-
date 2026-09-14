#!/usr/bin/env node
/* [collaudo PO «schermo sospeso in aria negli stadi piccoli!» — screenshot Primavera 2, FC Sicania]
 *
 * Il maxischermo stava a quota FISSA 15.5 per qualunque impianto, e il pilone era stato tolto su
 * richiesta nel 5.49.11 («resta sospeso sopra la curva, niente palo a vista»): giusto con una curva alta
 * alle spalle, sbagliato in provincia, dove la tribuna di fondo misura ~7 unita' e lo schermo galleggiava
 * piu' in alto del doppio, contro il cielo.
 *
 * Questo guardiano NON guarda una fotografia: legge la geometria della scena. Per ogni template di stadio
 * confronta il BORDO BASSO dello schermo con la SOMMITA' della tribuna di fondo. Se il bordo basso sta
 * sopra la tribuna, lo schermo e' appeso al nulla — ed e' un fatto, non un'opinione.
 *
 * La prova del rosso e' esplicita: si rimisura lo stesso template con la quota fissa di prima.
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const guasti = [];

/* dal piu' umile al piu' importante: il difetto vive in fondo a questa lista */
const TEMPLATES = ['provincia', 'comunale', 'storico_it', 'spagnolo'];
/* [7.895 C7] gli stessi template alla capienza PICCOLA (il provino del PO): senza forzare la capienza il banco misura solo impianti grandi */
const PICCOLI = [['provincia', 3000], ['comunale', 9000]];

async function misura(tpl, quotaFissa, cap, no895) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => guasti.push(`pageerror [${tpl}]: ` + String(e.message).slice(0, 110)));
  await page.addInitScript(cfg => {
    window.__CPM_GLB = false;
    window.__CPM_STADIUM_TPL_FORCE = cfg.tpl;
    if (cfg.cap) window.__CPM_STADIUM_CAP_FORCE = cfg.cap;
    if (cfg.fissa) window.__CPM_NO455 = 1;    // ripristina la quota fissa (prova del rosso)
    if (cfg.no895) window.__CPM_NO895 = 1;    // [C7] ripristina la quota del 7.455 (appoggiata alla tribuna di fondo, non alla Curva Sud)
  }, { tpl, fissa: !!quotaFissa, cap: cap || 0, no895: !!no895 });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&sit=4`, { waitUntil: 'load', timeout: 45000 });
  await page.waitForFunction(() => !!window.__CPM_JUMBO455, { timeout: 45000 }).catch(() => {});
  await sleep(1500);
  /* la sonda espone i numeri dal punto in cui lo schermo viene costruito: niente traversata della scena
     a tentoni, che sarebbe una sonda fragile e cieca al primo rinomino di una mesh. */
  const r = await page.evaluate(() => window.__CPM_JUMBO455 || null);
  await page.close();
  return r;
}

for (const tpl of TEMPLATES) {
  const r = await misura(tpl, false, 0, false);
  if (!r) { guasti.push(`[${tpl}] scena non leggibile: sonda cieca`); console.log(`${tpl.padEnd(12)} — scena non leggibile ✗`); continue; }
  const bordoBasso = r.y - r.h / 2;
  const stacco = +(bordoBasso - r.endH).toFixed(2);
  console.log(`${tpl.padEnd(12)} liv.${r.lvl} — schermo y ${r.y} (alto ${r.h}) · bordo basso ${bordoBasso.toFixed(2)} · sommita' tribuna ${r.endH} · stacco ${stacco > 0 ? '+' : ''}${stacco}`);
  /* stacco positivo = c'e' cielo fra la tribuna e lo schermo: e' la segnalazione del PO */
  if (stacco > 1.5) guasti.push(`[${tpl}] SCHERMO SOSPESO IN ARIA: il bordo basso sta ${stacco} unità SOPRA la sommità della tribuna`);
}

/* ── [7.895 C7 — nota PO «l'altezza va misurata stadio per stadio; nel provino il tabellone vola nel cielo»]
   IL BORDO ALTO CONTRO LA CIMA DELLA CURVA SUD, che e' cio' che sta davvero dietro il tabellone (x=55): gradoni o
   copertura. Il 7.455 guardava la tribuna di fondo (endH), sempre piu' alta della curva, e il bordo alto sporgeva nel
   cielo in ogni impianto (+1,2 … +2,1u misurati). Si giudica su template grandi E piccoli. ── */
for (const [tpl, cap] of [...TEMPLATES.map(t => [t, 0]), ...PICCOLI]) {
  const r = await misura(tpl, false, cap, false);
  const sud = r && r.sud;
  if (!r || !sud) { guasti.push(`[${tpl}${cap ? ' ' + cap : ''}] sagoma della Curva Sud non leggibile (sonda cieca)`); continue; }
  const cima = Math.max(sud.top, sud.roofTop || 0);
  const sporge = +((r.y + r.h / 2) - cima).toFixed(2);
  console.log(`${(tpl + (cap ? ' ' + cap : '')).padEnd(16)} bordo alto ${(r.y + r.h / 2).toFixed(2)} · cima Curva Sud ${cima.toFixed(2)} (${sud.roofTop != null ? 'copertura' : 'gradoni'}) · sporge ${sporge > 0 ? '+' : ''}${sporge} · taglia ${r.w}x${r.h}`);
  if (sporge > 0) guasti.push(`[${tpl}${cap ? ' ' + cap : ''}] IL BORDO ALTO SPORGE ${sporge}u SOPRA LA CURVA SUD: cielo dietro il tabellone`);
  if (r.h < 7.7 * 0.30 - 0.01) guasti.push(`[${tpl}] tabellone sotto la scala minima (${r.h})`);
}
{
  const r = await misura('provincia', false, 3000, true);
  const cima = r && r.sud ? Math.max(r.sud.top, r.sud.roofTop || 0) : null;
  const sporge = (r && cima != null) ? +((r.y + r.h / 2) - cima).toFixed(2) : null;
  console.log(`\nROSSO) provincia 3000 con la quota del 7.455 (__CPM_NO895): sporge ${sporge} ${sporge > 1 ? '— difetto riprodotto ✓' : '(non riprodotto)'}`);
  if (!(sporge > 1)) guasti.push('(ROSSO 895) con la quota del 7.455 il bordo alto non sporge: il guardiano non dimostra di proteggere nulla');
}

/* ── prova del rosso: la quota fissa di prima, sullo stadio piu' umile ── */
{
  const r = await misura('provincia', true, 0, false);
  if (!r) guasti.push('(ROSSO) scena non leggibile con la quota fissa');
  else {
    const stacco = +((r.y - r.h / 2) - r.endH).toFixed(2);
    console.log(`\nROSSO) provincia con la quota FISSA di prima: schermo y ${r.y} · stacco ${stacco > 0 ? '+' : ''}${stacco} ${stacco > 1.5 ? '— difetto riprodotto ✓' : '(non riprodotto)'}`);
    if (stacco <= 1.5) guasti.push('(ROSSO) con la quota fissa il difetto non si riproduce: il guardiano non dimostra di proteggere nulla');
  }
}

await b.close(); srv.close();
console.log(guasti.length ? `\n❌ FAIL — ${guasti.length}\n` + guasti.map(g => '  ✗ ' + g).join('\n')
  : '\n✅ MAXISCHERMO ANCORATO (in ogni impianto il bordo basso resta dentro la tribuna, non contro il cielo)');
process.exit(guasti.length ? 1 : 0);
