/* [7.689.0 GUARDIANO] LE AZIONI SALIENTI EXTRA-EROE SI VEDONO IN 3D.
   Direttiva PO: «le azioni salienti extra eroe devono essere visualizzate in 3D non solo in telecronaca
   — azioni da gol pericolose, espulsioni, rigori — logica stile The Manager 1991», e poi «mostrale con
   camera orizzontale dalla tribuna est».
   COSA ASSERISCE, in una partita giocata dall'inizio alla fine:
     (a) la finestra saliente si apre almeno una volta (il gol in costruzione e' l'azione);
     (b) DENTRO la finestra i corpi sono in campo — fuori restano spenti, come il PO ha chiesto nel 7.660;
     (c) DENTRO la finestra la camera e' in tribuna est (z alto) e BASSA (quota ~9), non il dirigibile.
   PROVA DEL ROSSO (`__CPM_NO689`): senza la finestra i corpi devono restare zero, altrimenti questo
   test non sta guardando niente. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
async function partita(rosso) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  await page.addInitScript((r) => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window.__CPM_NO689 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Sal' });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
  let finestre = 0, dentro = 0, corpiDentro = 0, camOk = 0, corpiFuori = 0, fuori = 0, dettagli = [];
  let eraDentro = false;
  for (let k = 0; k < 300; k++) {
    await sleep(500);
    const s = await page.evaluate(() => { try {
      const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st) return null;
      const vis = (st.players || []).filter(p => p && p.visible).length;
      return { sal: !!window.__CPM_SAL689_ON, vis, cy: st.camera.y, cz: st.camera.z, clock: st.clock };
    } catch (_e) { return null; } });
    if (!s) continue;
    if (s.sal) { if (!eraDentro) { finestre++; eraDentro = true; }
      dentro++; if (s.vis >= 10) corpiDentro++;
      if (s.cz >= 20 && s.cy <= 14) camOk++;
      if (dettagli.length < 4) dettagli.push(`corpi ${s.vis} · camera y=${s.cy} z=${s.cz}`);
    } else { eraDentro = false; fuori++; if (s.vis === 0) corpiFuori++; }
    if (s.clock != null && s.clock >= 89) break;
  }
  await ctx.close();
  return { finestre, dentro, corpiDentro, camOk, fuori, corpiFuori, dettagli };
}
console.log('\n=== LE AZIONI SALIENTI SI VEDONO IN 3D (tribuna est, orizzontale) ===\n');
const R = await partita(true);
console.log(`  FASE A (senza la finestra, __CPM_NO689): finestre ${R.finestre} · campioni con corpi in campo ${R.corpiDentro}`);
if (R.finestre > 0) { console.log('\n❌ FAIL — la finestra si apre anche col rimedio spento: il flag non e\' quello.\n'); await b.close(); srv.close(); process.exit(1); }
const V = await partita(false);
console.log(`  FASE B (con la finestra):`);
console.log(`    finestre aperte nella partita: ${V.finestre}`);
console.log(`    dentro:  campioni ${V.dentro} · con i ventidue in campo ${V.corpiDentro} · con camera in tribuna est bassa ${V.camOk}`);
console.log(`    fuori:   campioni ${V.fuori} · con il campo vuoto (come dev'essere) ${V.corpiFuori}`);
for (const d of V.dettagli) console.log(`      · ${d}`);
await b.close(); srv.close();
const ok = V.finestre >= 1 && V.corpiDentro >= V.dentro * 0.7 && V.camOk >= V.dentro * 0.7 && V.corpiFuori >= V.fuori * 0.9;
console.log(ok ? '\n✅ PASS — l\'azione saliente si vede, e solo lei.\n' : '\n❌ FAIL — la scena non regge le bande.\n');
process.exit(ok ? 0 : 1);
