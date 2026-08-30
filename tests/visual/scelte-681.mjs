/* [STRUMENTO] LE SCELTE COMPAIONO, E LA PARTITA NON SI FERMA.
   Metri dichiarati in docs/TELECRONACA-INTERATTIVA.md §6:
   (a) densita': 2-4 momenti con scelta a partita, mai 0;
   (b) niente blocchi: senza mai toccare nulla la partita arriva comunque in fondo;
   (c) i bottoni sono nel DOM e cliccabili quando la riga li porta;
   (d) cliccando, l'esito viene scritto e le conseguenze applicate. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const CLICCA = process.env.CPM_CLICCA === '1';
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_INTX669 = []; window.__CPM_SC681 = []; window.__CPM_SCFREEZE_TEST = 1;/* [7.682.0] in autoplay il freeze e' spento (vedi nota nel gioco): questa sonda DEVE misurarlo, quindi lo riaccende esplicitamente */ });
await openMatch(page, port, { skipLoadAll: true, name: 'Po' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
let bottoniVisti = 0, click = 0, opzMax = 0, freezeOk = 0, freezeCampioni = 0;
for (let k = 0; k < 250; k++) {
  await sleep(900);
  const n = await page.evaluate(() => document.querySelectorAll('button').length);
  /* ⚠️ [7.682.0] i bottoni si contano DENTRO IL BANNER, non con una regex sui loro testi: la prima
     stesura elencava i prefissi delle etichette e, appena ne ho aggiunte ventotto nuove, ha riportato
     «2 opzioni» dove ce n'erano tre. Un elenco di stringhe invecchia alla prima riga di contenuto. */
  const info = await page.evaluate(() => {
    const d = document.querySelector('[data-cpm="com661"]'); if (!d) return { n: 0, testi: [] };
    const bs = [...d.querySelectorAll('button')];
    return { n: bs.length, testi: bs.map(x => (x.textContent || '').trim().slice(0, 30)) };
  });
  if (info.n > 0) {
    bottoniVisti++;
    /* [7.682.0 direttiva PO «devono freezare la partita per almeno 20 secondi»] SI MISURA CHE IL
       TEMPO DI GIOCO NON AVANZI mentre la scelta e' a schermo, e QUANTE opzioni ci sono. */
    if (opzMax < info.n) opzMax = info.n;
    const m1 = await page.evaluate(() => { try { return window.__CPM_STATE().clock; } catch (_e) { return null; } });
    await sleep(3000);
    const m2 = await page.evaluate(() => { try { return window.__CPM_STATE().clock; } catch (_e) { return null; } });
    if (m1 != null && m2 != null) { freezeCampioni++; if (m2 === m1) freezeOk++; else console.log(`    ⚠ il tempo e' avanzato durante la scelta: ${m1}' -> ${m2}'`); }
    if (CLICCA && click < 3) { await page.evaluate(() => { const bs = [...document.querySelectorAll('button')]; const t = bs.find(x => /^(Vado|Ci sto|Gli tengo|Me la prendo|Alzo|Gestisco|Testa|Cambio|Continuo|Mi prendo|Andiamo|Chiedo|Lo porto|Non rispondo|Ringrazio|Mi rialzo|Vado a prendermela|Cambio zona|La chiamo)/.test((x.textContent || '').trim())); if (t) t.click(); }); click++;
      await sleep(700);
      const dopo = await page.evaluate(() => { const d = document.querySelector('[data-cpm="com661"]'); return d ? (d.textContent || '').trim().slice(0, 120) : null; });
      console.log(`    dopo il click il banner dice: ${dopo}`); }
  }
  const fine = await page.evaluate(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.clock; } catch (_e) { return null; } });
  if (fine != null && fine >= 90) break;
}
const INTX = await page.evaluate(() => window.__CPM_INTX669 || []);
const SC = await page.evaluate(() => window.__CPM_SC681 || []);
const clock = await page.evaluate(() => { try { return window.__CPM_STATE().clock; } catch (_e) { return null; } });
const coms = await page.evaluate(() => { try { return document.body.innerText.slice(0, 0); } catch (_e) { return ''; } });
await b.close(); srv.close();
console.log('\n=== LE SCELTE NELLA TELECRONACA ===\n');
console.log(`  minuto raggiunto: ${clock} (banda: la partita arriva in fondo anche senza toccare nulla)`);
console.log(`  interazioni emesse: ${INTX.length} (banda 2-4)`);
console.log(`  scelte registrate: ${SC.length} · di cui automatiche (nessuno ha toccato) ${SC.filter(x => x.auto).length}`);
for (const x of SC) console.log(`    ${String(x.min).padStart(2)}' ${x.id} → ramo ${x.idx}${x.auto ? ' (scelta da sola)' : ' (CLICCATA)'}`);
console.log(`  opzioni per scheda a schermo: ${opzMax} (banda: 3)`);
console.log(`  FREEZE: su ${freezeCampioni} verifiche il tempo di gioco e' rimasto fermo ${freezeOk} volte (banda: tutte)`);
console.log(`  fotogrammi in cui i bottoni erano a schermo: ${bottoniVisti}${CLICCA ? ` · click effettuati ${click}` : ''}`);
console.log('');
