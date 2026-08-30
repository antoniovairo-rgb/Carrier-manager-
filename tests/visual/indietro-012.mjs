/* [STRUMENTO] IL PALLONE TORNA INDIETRO DURANTE L'ESITO? — codice 012 del taccuino PO.
   Note [KE 7.678] SIT #115 («tornato INDIETRO di 12.8 unita'») e [KE 7.681] SIT #109 («16.5 unita',
   massimo arretramento a 13,1s, passo peggiore 1,0u in 25ms, scrittore: 16»).
   Lo scrittore 16 ha un nome nel codice: `esito:<tipo>`, la cinematica che muove il pallone DOPO la
   scelta. Il passo peggiore segnalato dal PO (1,0 u in 25 ms) non e' un teletrasporto: e' la palla che
   ROTOLA indietro. Qui si misura, scena per scena e con l'esito forzato a RIUSCITO: di quanto il
   pallone arretra dal suo punto piu' avanzato, verso la propria porta. */
/* ⚠️ COSA HA TROVATO, e cosa NON ha trovato (misurato 30/08):
   - con esito RIUSCITO: arretramento mediano 0,0 u su 18 scene, massimo 4,6;
   - con esito FALLITO, sulle due scene delle note PO (gi109 e gi115) e su tutte le loro azioni:
     massimo 8,9 u, a 5 secondi dall'esito.
   Le note del PO dicono 12,8 e 16,5 unita', con il massimo a 13,1 secondi: NON si riproduce qui.
   E il calcolo della bozza sul dispositivo ha gia' i filtri giusti — drawdown dal punto piu' avanzato
   (7.466, non la somma dei decrementi), solo campioni della scena, solo con arco o post-arco VIVI,
   solo dopo un progresso reale — quindi non ho nessuna prova che sia un falso positivo. Come per il
   codice 001, il fenomeno vive nel flusso del dispositivo e non in laboratorio: il 012 resta APERTO.
   ⚠️ E la prima stesura di questa sonda mentiva: campionava 3,6 s e TUTTI i massimi cadevano
   sull'ultimo campione — la finestra finiva mentre il fenomeno cresceva. Ora sono 11,4 s, e i picchi
   cadono a 5 s, cioe' dentro. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(([g, rosso]) => { window.__CPM_GLB = !!g; window.__CPM_PRESENT = 1; if (rosso) String(rosso).split(',').forEach(r => { window[r.trim()] = 1; }); }, [!!process.env.CPM_GLBON, process.env.CPM_ROSSO || null]);
await openMatch(page, port, { skipLoadAll: true, name: 'Ind' });
const tot = await page.evaluate(() => (window.__CPM_SITS || []).length);
const PASSO = Number(process.env.CPM_PASSO || 10);
const GIs = process.env.CPM_GI ? [Number(process.env.CPM_GI)] : Array.from({ length: tot }, (_, i) => i).filter(i => i % PASSO === 0);
await page.evaluate(() => window.__CPM_FORCE_SIT(81, true)); await sleep(1800);/* warm-up dichiarato (lezione 7.660/7.684) */
const righe = [];
for (const gi of GIs) {
  const S = await page.evaluate(g => { const s = (window.__CPM_SITS || [])[g] || {}; return { t: String(s.text || '').slice(0, 40), ty: String(s.type || ''), n: (s.actions || []).length }; }, gi);
  if (!S.n || S.ty === 'def') continue;
  try { await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]); } catch (_e) { continue; }
  await sleep(700);
  await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); });
  let maxX = -1e9, peggio = 0, quando = 0, ws = null;
  for (let k = 0; k < 190; k++) {
    const q = await page.evaluate(() => { try { const o = window.__CPM_BALL && window.__CPM_BALL(); return o ? { x: o.x, w: (window.__CPM_STATE && window.__CPM_STATE().act) || null } : null; } catch (_e) { return null; } });
    if (q) { if (q.x > maxX) maxX = q.x; const arr = maxX - q.x; if (arr > peggio) { peggio = arr; quando = k * 60; } }
    await sleep(60);
  }
  righe.push({ gi, arretr: +peggio.toFixed(1), ms: quando, t: S.t });
}
await b.close(); srv.close();
righe.sort((a, c) => c.arretr - a.arretr);
console.log('\n=== IL PALLONE TORNA INDIETRO DURANTE L\'ESITO? (codice 012) ===\n');
console.log(`  scene misurate: ${righe.length}`);
const q2 = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
console.log(`  arretramento mediano: ${q2(righe.map(r => r.arretr)).toFixed(1)} u`);
const gravi = righe.filter(r => r.arretr > 10);
console.log(`  scene in cui il pallone arretra di oltre 10 u su un esito RIUSCITO: ${gravi.length}/${righe.length}\n`);
for (const r of righe.slice(0, 10)) console.log(`    gi${String(r.gi).padStart(3)} arretra ${String(r.arretr).padStart(5)} u (a ${r.ms} ms dall'esito) · ${r.t}`);
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: misura.\n');
