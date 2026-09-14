#!/usr/bin/env node
/* [7.358.0] GUARDIANO DELLA LETTURA DEL DRIBBLING — collaudo PO #18/#93/#104/#154
   «dribbling confusionario» · «doppio passo sul posto senza palla» · «effetto elastico, l'eroe sembra smarrito».

   Tre difetti distinti, tutti nello stesso blocco d'esito, tutti misurati prima del fix:
     D1  RIENTRO — finita la finestra del gesto `actType` torna null e il bersaglio ricade su `P.playerX`,
         congelato al resolve: l'eroe avanzava e poi CAMMINAVA ALL'INDIETRO fino al punto di partenza
         (gi18 riuscito: 70,0 → 73,0 → 70,0). Ora l'ultimo bersaglio dell'azione resta latchato.
     D2  IL DRIBBLING FALLITO NON ERA UN DRIBBLING — il ramo «conduzione persa» lo rimappava su `build`,
         che vale 2,5u di avanzamento e manda il CH38 sulla clip `dribble` lo stesso: corpo che dribbla,
         gambe che fanno due passi. Ora resta `dribble` (10u se riuscito, 4u se fallito).
     D3  IL TETTO IN AVANTI — il bersaglio della mesh era tappato a 9 unita' mondo dalla porta = x 87.
         gi104 PARTE a 87: 0,0u di spostamento su 186 fotogrammi. Durante l'esito il tetto scende a 4.

   ⚠️ Il campionamento e' a FOTOGRAMMA (rAF dentro la pagina): i round-trip di page.evaluate saltano i
   cambi di `actType` e fanno leggere il valore della scena PRECEDENTE — ci sono cascato, ed e' il motivo
   per cui la prima misura diceva «max aT 0.58» su finestre che non erano mai arrivate a meta'.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node dribble-read-test.mjs                              */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const issues = [];
let misurate = 0, nonMisurate = 0;
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await sleep(900);

/* le quattro scene delle note PO + tutte le altre con intento `dribble`, fino a 8 in totale */
const NOTE = [18, 93, 104, 154];
const tutte = await page.evaluate(() => (window.__CPM_SITS || []).map((s, i) => [i, s && s.intent]).filter(r => r[1] === 'dribble').map(r => r[0]));
const GIS = [...new Set([...NOTE, ...tutte])].slice(0, 8);
console.log(`scene di dribbling collaudate: ${GIS.join(', ')}`);

for (const gi of GIS) {
  for (const ok of [true, false]) {
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(650);
    await page.evaluate(o => {
      window.__SMP = [];
      const tick = () => { try { const s = window.__CPM_STATE(); if (s && s.act) window.__SMP.push([s.phase, s.act.t, s.hero.x, s.hero.y]); } catch (e) {} if (window.__SMP.length < 400) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      window.__CPM_FORCE_OUTCOME = o ? 'success' : 'fail'; window.__CPM_RESOLVE(0);
    }, ok);
    await sleep(3400);
    const smp = (await page.evaluate(() => window.__SMP)).filter(s => s[0] === 'hl_result');
    if (smp.length < 20) { issues.push(`gi${gi} ok=${ok}: solo ${smp.length} fotogrammi d'esito, misura non valida`); continue; }
    const tipi = [...new Set(smp.map(s => s[1]).filter(Boolean))];
    const x0 = smp[0][2], y0 = smp[0][3];
    let avanti = 0, rientro = 0, max = x0;
    for (const s of smp) { avanti = Math.max(avanti, Math.hypot(s[2] - x0, s[3] - y0)); max = Math.max(max, s[2]); rientro = Math.max(rientro, max - s[2]); }
    /* alcune scene di dribbling risolvono l'azione 0 in una CONCLUSIONE differita da una timeline di
       build-up: la finestra del gesto cade oltre il campionamento e non c'e' niente da misurare. Si
       contano e si stampano, ma non si giudica cio' che non e' stato osservato. */
    if (!tipi.length) { nonMisurate++; console.log(`  gi${String(gi).padStart(3)} ok=${ok ? 'SI' : 'NO'} · nessuna finestra d'azione nel campionamento (conclusione differita) — non misurata`); continue; }
    misurate++;
    const bad = tipi.filter(t => t !== 'dribble');
    if (bad.length) issues.push(`gi${gi} ok=${ok}: l'azione si chiama ${bad.join('/')} invece di dribble — avanzamento e clip GLB sbagliati`);
    /* 0,8u e' la soglia che separa «si muove» da «e' congelato»: le scene ancorate a fine build-up
       (_anch51) hanno il follow-through dimezzato di proposito, e pretendere 2u le boccerebbe a torto.
       Prima del fix i quattro casi del PO stavano a 0,0-2,0u CON un rientro pari all'avanzamento. */
    if (avanti < 0.8) issues.push(`gi${gi} ok=${ok}: l'eroe si sposta ${avanti.toFixed(1)}u durante il dribbling — e' un doppio passo sul posto`);
    if (rientro > 1.5) issues.push(`gi${gi} ok=${ok}: l'eroe RIENTRA di ${rientro.toFixed(1)}u dopo l'azione (effetto elastico)`);
    console.log(`  gi${String(gi).padStart(3)} ok=${ok ? 'SI' : 'NO'} · ${smp.length} fotogrammi · actType ${tipi.join('/')} · avanti ${avanti.toFixed(1)}u · rientro ${rientro.toFixed(1)}u`);
  }
}

console.log(`\nfinestre d'azione misurate ${misurate} · differite (non misurabili) ${nonMisurate}`);
/* il guardiano non deve poter passare a vuoto: se NESSUNA scena ha prodotto una finestra, la misura
   non e' stata fatta e questo e' un fallimento, non un successo. */
if (misurate < 6) issues.push(`solo ${misurate} finestre d'azione osservate su ${GIS.length * 2} tentativi: il guardiano e' cieco, non verde`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ DRIBBLING OK — si chiama dribbling, l\'eroe avanza davvero e non torna sui suoi passi');
