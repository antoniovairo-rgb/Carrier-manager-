#!/usr/bin/env node
/* CENSIMENTO DEL SALTO DEL PALLONE — «SALTO del pallone di 7.0 unità in 21 ms (a x 44.9), 330 u/s».

   PERCHE' QUESTA NOTA VALE PIU' DELLE ALTRE. Il taccuino del PO l'ha riportata TRE VOLTE, su tre
   situations diverse (#139 recover, #162 progression, #120 through) e in due partite diverse — con
   numeri IDENTICI: 7,0 unita', 21 ms, x 44,9. Un numero identico fra scene diverse non e' un evento,
   e' una transizione fissa: e' la stessa firma che nel 7.463 ha smascherato una soglia che scattava da
   sola, e nel 7.471 la transizione di camera. Quindi non e' un caso limite da inseguire: e' un unico
   punto di codice che salta sempre allo stesso modo.

   COSA FA. Gioca partite VERE, lascia accumulare le scene nel testimone di bordo e poi cerca il salto
   con la STESSA matematica del detector (`draftBugNote`), scena per scena, riportando ANCHE la fase e
   lo stato dell'azione al momento del salto (il bitfield `f`: arco in volo, post-arco vivo, build-up,
   dentro la scena). E' quell'informazione — non la dimensione del salto — che dice CHI lo fa.

   ⚠️ PRIMA PASSATA, E VA SCRITTA: la terna del PO (7,0u · 21ms · x 44,9) NON si e' riprodotta. Quello
   che si e' trovato e' un fenomeno DIVERSO e piu' largo — su otto scene giocate davvero, OTTO hanno un
   salto del pallone oltre le 6 unita' (da 6,5 a 39u), e cinque di questi avvengono con NESSUN arco in
   volo: e' il riposizionamento della palla all'apertura di scena, che e' legittimo solo se sta dentro
   uno stacco. E' la stessa forma del teletrasporto di camera chiuso nel 7.471 — un movimento istantaneo
   che deve vivere dentro un taglio — ed e' probabilmente il motivo per cui questa riga continua a
   comparire nelle note. Non e' ancora un rimedio: e' la pista, misurata.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node ball-jump-census.mjs                             */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const TARGET = +(process.env.CPM_SCENES || 26);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
/* il testimone di bordo esiste solo coi DEVTOOLS accesi: senza questa riga la sonda gira e non guarda */
await page.addInitScript(m => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = true; if (m) window.__CPM_BJMIN = m; try { localStorage.setItem('cpm-devtools', '1'); } catch (e) {} }, +(process.env.CPM_BJMIN || 0));
await openMatch(page, port, { skipLoadAll: true });
await sleep(700);

const salti = [];
let secchi = 0, scene = 0;
for (let round = 0; round < TARGET * 4 && scene < TARGET; round++) {
  const inPlay = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; });
  if (!inPlay) {
    if (++secchi >= 12) { secchi = 0; try { await openMatch(page, port, { skipLoadAll: true }); await sleep(700); } catch (e) { break; } }
    else await sleep(700);
    continue;
  }
  secchi = 0;
  await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  const ok = await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'hl_choose'; } catch (e) { return false; } }, { timeout: 30000 }).then(() => true).catch(() => false);
  if (!ok) { await sleep(600); continue; }
  await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)).catch(() => {});
  await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase !== 'hl_result'; } catch (e) { return true; } }, { timeout: 25000 }).catch(() => {});
  scene++;
  await sleep(250);
  const r = await page.evaluate(() => {
    const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP();
    if (!snap || !snap.samples || !snap.samples.length) return null;
    const S = snap.samples, ks = S.map(s => s.sk).filter(k => k != null && k >= 0);
    if (!ks.length) return null;
    const k = Math.max(...ks), W = S.filter(s => s.sk === k);
    if (W.length < 8) return null;
    const out = [];
    for (let i = 1; i < W.length; i++) {
      const a = W[i - 1], b2 = W[i], dt = (b2.t - a.t) / 1000;
      /* ⚠️ IL PALLONE NELL'ANELLO SI CHIAMA `x,y,z` — NON `bx,bz`. La prima stesura leggeva `bx`, che
         non esiste, e saltava ogni campione in silenzio: zero salti su quattro scene, cioe' un verde
         che non voleva dire niente. Verificato stampando le chiavi di un campione prima di fidarsi. */
      if (dt <= 0 || dt > 0.5 || a.x == null || b2.x == null) continue;
      const d = Math.hypot(b2.x - a.x, (b2.z - a.z) || 0);
      if (d >= 6) out.push({ d: +d.toFixed(1), dt: Math.round(dt * 1000), x: +b2.x.toFixed(1), z: +(b2.z || 0).toFixed(1),
        fa: a.f | 0, fb: b2.f | 0, hx: +(b2.hx || 0).toFixed(1) });
    }
    return { k, n: W.length, out };
  });
  if (r && r.out.length) for (const s of r.out) salti.push({ scena: r.k, ...s });
}
/* [7.478.0] LA SORGENTE, non la dimensione. L'anello del testimone dice QUANTO salta il pallone ma non chi
   lo sposta, e la sua finestra (una sola chiave-scena) esclude proprio l'apertura di scena a cui la prima
   passata aveva attribuito i salti. Il varco `__CPM_BJ478` e' scritto dal render-loop accanto a ogni
   riassegnazione secca del pallone e letto a fine fotogramma, con lo stato dello stacco nero. */
const fonti = await page.evaluate(() => (window.__CPM_BJ478 || []).slice()).catch(() => []);
const visti = await page.evaluate(() => window.__CPM_BJN478 || 0).catch(() => 0);
await b.close(); srv.close();

const bit = f => [(f & 1) ? 'arco' : '', (f & 2) ? 'post-arco' : '', (f & 4) ? 'build-up' : '', (f & 8) ? 'in-scena' : ''].filter(Boolean).join('+') || '—';
console.log(`\n=== ${salti.length} salti (>=6u in un fotogramma) su ${scene} scene ===`);
for (const s of salti.slice(0, 30)) console.log(`  ${String(s.d).padStart(5)}u in ${String(s.dt).padStart(3)}ms → x ${String(s.x).padStart(6)} z ${String(s.z).padStart(6)} · prima: ${bit(s.fa).padEnd(22)} dopo: ${bit(s.fb)}`);
if (salti.length) {
  const perX = {};
  for (const s of salti) { const k = Math.round(s.x); perX[k] = (perX[k] || 0) + 1; }
  const top = Object.entries(perX).sort((a, b2) => b2[1] - a[1]).slice(0, 6);
  console.log(`\ndove atterrano: ${top.map(([x, n]) => `x≈${x} (${n})`).join(' · ')}`);
  const dd = [...new Set(salti.map(s => s.d))];
  console.log(`dimensioni distinte del salto: ${dd.slice(0, 12).join(', ')}${dd.length > 12 ? '…' : ''}`);
  console.log(dd.length <= 3 ? '→ POCHE dimensioni distinte: e\' una transizione fissa, non rumore.' : '→ molte dimensioni distinte: guardare gli stati, non il numero.');
} else console.log('nessun salto osservato in questa passata.');
console.log(`\n=== ${fonti.length} salti ATTRIBUITI su ${visti} fotogrammi VISTI dal varco ===`);
if (!visti) console.log('  ⚠️  il varco non ha guardato nessun fotogramma: la misura non vale (strumenti spenti o codice non raggiunto).');
if (fonti.length) {
  const per = {};
  for (const f of fonti) { const k = f.src + (f.mask ? ' [dentro lo stacco]' : ' [SCOPERTO]'); (per[k] = per[k] || []).push(f.d); }
  for (const [k, ds] of Object.entries(per).sort((a, b2) => b2[1].length - a[1].length))
    console.log(`  ${String(ds.length).padStart(3)}x ${k.padEnd(30)} · da ${Math.min(...ds).toFixed(1)} a ${Math.max(...ds).toFixed(1)} u`);
  const scoperti = fonti.filter(f => !f.mask);
  console.log(`\n${scoperti.length}/${fonti.length} salti avvengono SENZA stacco nero vivo: sono quelli che il giocatore vede.`);
} else console.log('  nessun salto attribuito (varco vuoto: strumenti spenti o pallone continuo).');
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
