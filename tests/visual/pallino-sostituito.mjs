/* [7.953] «SE SONO SOSTITUITO IL PALLINO 2D DEVE USCIRE» — rilievo del PO dal suo telefono
   (foto 21/09 19:49: banner «SOSTITUITO AL 78'» e il pallino bianco 77 ancora a centrocampo).

   Il motore lo sapeva gia': `motore.stato().eroe.attivo` e' false da quando l'eroe esce
   (`_M.chiedi.eroe(...)` in src/15). Era la VISTA a non leggerlo — disegnava il pallino comunque.
   Questa sonda giudica il fatto, non il pixel: il testimone inerte `__CPM_E2D` dichiara, per ogni
   fotogramma del campo 2D, se l'eroe e' stato disegnato e cosa dice il motore.

   Due bracci: VERDE (il gioco com'e') e ROSSO (`__CPM_NO953`, che torna a disegnarlo sempre).
   Senza il rosso il verde non proverebbe niente: un testimone fermo a zero passerebbe comunque.

   Uso:  CPM_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
         PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node pallino-sostituito.mjs            */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const server = await startServer(); const port = server.address().port;
const ris = {};

for (const braccio of ['verde', 'rosso']) {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  let errori = 0;
  page.on('pageerror', () => { errori++; });
  await page.addInitScript((rosso) => { if (rosso) window.__CPM_NO953 = true; }, braccio === 'rosso');
  await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
  await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});

  /* il campo 2D vive in gioco fluido: si aspetta `playing`, non un tempo a caso */
  let fase = null;
  for (let i = 0; i < 40; i++) {
    fase = await page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (_e) { return null; } });
    if (fase === 'playing') break;
    await sleep(500);
  }
  await sleep(2000);

  const leggi = () => page.evaluate(() => { try { return window.__CPM_E2D ? JSON.parse(JSON.stringify(window.__CPM_E2D)) : null; } catch (_e) { return null; } });
  const azzera = () => page.evaluate(() => { try { if (window.__CPM_E2D) { window.__CPM_E2D.fotogrammi = 0; window.__CPM_E2D.disegnato = 0; window.__CPM_E2D.fuori = 0; window.__CPM_E2D.violazioni = 0; } } catch (_e) {} });

  await azzera(); await sleep(1500);
  const prima = await leggi();

  const uscito = await page.evaluate(() => { try { return window.__CPM_FORCE_SUBOFF ? !!window.__CPM_FORCE_SUBOFF() : false; } catch (_e) { return false; } });
  await sleep(1200);            /* il motore riceve `chiedi.eroe(false)` al tick successivo */
  await azzera(); await sleep(2000);
  const dopo = await leggi();

  ris[braccio] = { fase, uscito, prima, dopo, errori };
  await browser.close();
}
await new Promise(r => server.close(r));

const V = ris.verde, R = ris.rosso;
const q = (x) => (x && x.fotogrammi) ? (x.disegnato / x.fotogrammi) : null;
const stampa = (n, a) => {
  console.log(`\n${n.toUpperCase()}  fase ${a.fase} · sostituzione forzata: ${a.uscito ? 'si' : 'NO'} · errori di pagina ${a.errori}`);
  console.log(`  PRIMA  fotogrammi ${a.prima ? a.prima.fotogrammi : '?'} · eroe disegnato ${a.prima ? a.prima.disegnato : '?'} (${q(a.prima) == null ? '?' : (q(a.prima) * 100).toFixed(1) + ' %'}) · il motore dice attivo: ${a.prima ? a.prima.attivo : '?'}`);
  console.log(`  DOPO   fotogrammi ${a.dopo ? a.dopo.fotogrammi : '?'} · eroe disegnato ${a.dopo ? a.dopo.disegnato : '?'} (${q(a.dopo) == null ? '?' : (q(a.dopo) * 100).toFixed(1) + ' %'}) · il motore dice attivo: ${a.dopo ? a.dopo.attivo : '?'}`);
  console.log(`         il gioco lo sa in ${a.dopo ? a.dopo.fuori : '?'}/${a.dopo ? a.dopo.fotogrammi : '?'} fotogrammi · VIOLAZIONI (lo sa e lo disegna lo stesso): ${a.dopo ? a.dopo.violazioni : '?'}`);
};
console.log('\n=== IL PALLINO DELL\'EROE SOSTITUITO ===');
stampa('verde', V); stampa('rosso', R);

const guai = [];
if (!V.uscito || !R.uscito) guai.push('la sostituzione non e\' stata forzata: la sonda non ha misurato il caso del PO');
if (!V.prima || !V.prima.fotogrammi) guai.push('il testimone __CPM_E2D non ha contato fotogrammi nel verde: il campo 2D non era in scena');
if (V.prima && q(V.prima) < 0.9) guai.push(`nel verde, PRIMA della sostituzione l'eroe era disegnato solo nel ${(q(V.prima) * 100).toFixed(1)} % dei fotogrammi (atteso ~100)`);
if (V.dopo && V.dopo.violazioni > 0) guai.push(`VERDE: ${V.dopo.violazioni} fotogrammi in cui il gioco SA che l'eroe e' fuori e disegna il pallino lo stesso — e' il difetto fotografato dal PO`);
if (V.dopo && !V.dopo.fuori) guai.push('nel verde il motore non ha mai dichiarato l\'eroe fuori nella finestra di misura: la sonda non ha misurato il caso');
if (V.dopo && V.dopo.attivo !== false) guai.push('il motore non dichiara l\'eroe inattivo: il difetto non e\' (solo) della vista, va guardato prima li\'');
if (R.dopo && R.dopo.violazioni === 0) guai.push('il ROSSO non riproduce il difetto: senza prova del rosso il verde non dimostra niente');
if (V.errori || R.errori) guai.push(`errori di pagina: verde ${V.errori} · rosso ${R.errori}`);

if (guai.length) { console.log('\n❌ FAIL'); guai.forEach(g => console.log('  · ' + g)); process.exit(1); }
console.log('\n✅ PASS — sostituito, il pallino esce: violazioni verde ' + V.dopo.violazioni + ' · rosso ' + R.dopo.violazioni + '/' + R.dopo.fuori + ' (il difetto, riprodotto).');
console.log('   Dichiarato: fra la sostituzione e l\'uscita del pallino passa un tick del motore — nel verde ' + (V.dopo.fotogrammi - V.dopo.fuori) + ' fotogrammi su ' + V.dopo.fotogrammi + ' arrivano prima che il motore riceva `chiedi.eroe(false)`. E\' un ritardo A MONTE della vista, non il difetto.');
