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
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_INTX669 = []; window.__CPM_SC681 = []; });
await openMatch(page, port, { skipLoadAll: true, name: 'Po' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
let bottoniVisti = 0, click = 0;
for (let k = 0; k < 250; k++) {
  await sleep(900);
  const n = await page.evaluate(() => document.querySelectorAll('button').length);
  const info = await page.evaluate(() => {
    const bs = [...document.querySelectorAll('button')].filter(x => /^(Vado|Resto|Ci sto|Facciamo|Gli tengo|Mi allargo|Me la|Alzo|Gioco|Gestisco|Non ci sto|Testa|Scendo|Cambio|Insisto|Continuo|Mi prendo|Faccio giocare|Andiamo|Provo|Chiedo|Gliela|Lo porto|Cerco|Non rispondo|Rispondo|Ringrazio|Me la godo|Mi rialzo|La chiamo|Abbasso|Aspetto)/.test((x.textContent || '').trim()));
    return { n: bs.length, testi: bs.map(x => (x.textContent || '').trim().slice(0, 30)) };
  });
  if (info.n > 0) {
    bottoniVisti++;
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
console.log(`  fotogrammi in cui i bottoni erano a schermo: ${bottoniVisti}${CLICCA ? ` · click effettuati ${click}` : ''}`);
console.log('');
