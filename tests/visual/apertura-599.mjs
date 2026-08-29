/* [7.599.0 STRUMENTO] ALL'APERTURA DI UNA SCENA, IL PALLONE E' DI QUALCUNO?
   COLLAUDO PO su SIT #3 («Con palla in area - un difensore tra te e la porta!»):
   «codice 001 MISURATO: all'apertura il pallone non e' ai piedi di nessuno dei nostri
    (compagno piu' vicino 12.5u, eroe >= 9.0u per 45 campioni)».
   Una scena che si intitola «con palla in area» e si apre con il pallone a nove metri dall'eroe e dodici
   dal compagno piu' vicino non racconta cio' che dice. A differenza del codice 007 questo E' misurabile in
   laboratorio: e' una condizione all'apertura, non un fenomeno ad alta frequenza.
   NON e' un guardiano: misura su un campione ampio di scene e nomina le peggiori. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
/* ⚠️ [7.679.0 — LA SONDA MISURAVA UN REGIME CHE NEL GIOCO NON ESISTE.
   Senza `__CPM_PRESENT` il flag interno `_asIfPlay` e' FALSO sotto cpmtest, e con lui restano spenti
   lo SNAP e il FREEZE di presentazione: cioe' esattamente i blocchi che mettono gli uomini dove la
   scena dice. Misurato appaiato sulle quattro scene «peggiori» del censimento: gi8 passa da eroe a
   42,5 u a eroe a 0,0 u; gi76 da compagno a 42,6 u a compagno a 1,4 u. Il 10% di scene orfane era in
   buona parte un artefatto dello strumento, non un difetto del gioco. Da qui in poi si misura con la
   presentazione ACCESA, che e' il regime del giocatore. */
/* [7.679.0] CPM_GLBON=1 misura col ramo GLB ACCESO — il ramo del gioco vero. Tre difetti diversi di
   questa settimana avevano la stessa radice (curare il procedurale e credere di aver curato il gioco):
   questa sonda non deve poter mentire allo stesso modo. */
await page.addInitScript((g) => { window.__CPM_GLB = !!g; window.__CPM_PRESENT = 1; }, !!process.env.CPM_GLBON);
await openMatch(page, port, { skipLoadAll: true, name: 'Ap' });
const tot = await page.evaluate(() => (window.__CPM_SITS || []).length);
const PASSO = Number(process.env.CPM_PASSO || 4);
const GIs = process.env.CPM_GI ? [Number(process.env.CPM_GI)] : Array.from({ length: tot }, (_, i) => i).filter(i => i % PASSO === 0);
const out = [];
for (const gi of GIs) {
  try { await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]); } catch (_e) { continue; }
  /* ⚠️ [7.599.0] 260 ms non bastano: con quel tempo gi0, gi4, gi8 e gi12 davano numeri IDENTICI
     (17,3 · 13,8 · 1,3), e quattro scene diverse non possono coincidere - stavo leggendo lo stato
     residuo della scena precedente. Quando i numeri si ripetono, il sospetto va allo strumento. */
  /* ⚠️ [7.679.0 — 750 ms NON BASTANO NEMMENO ADESSO, e le ultime due «orfane» erano tempo, non gioco.
     gi0 e gi4 restavano nella lista delle peggiori con la stessa identica terna (17,1 · 13,8 · 0,9):
     leggendole a 1400 ms, gi4 ha il pallone ai piedi dell'EROE a 0,0 u e gi0 mostra il pallone a
     (50 · 53,9) mentre il suo bersaglio logico e' (90 · 59) — cioe' la palla e' ancora IN VIAGGIO.
     Un'attesa a tempo fisso misura il transitorio; qui si aspetta che il pallone ARRIVI dove la
     scena lo vuole (ballTarget), con un tetto di 3 s per non appendere il censimento. */
  await sleep(400);
  for (let k = 0; k < 26; k++) {
    const vicino = await page.evaluate(() => { try {
      const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.ballTarget || st.ballTarget.x == null) return true;
      return Math.hypot(st.ball.x - st.ballTarget.x, st.ball.y - st.ballTarget.y) < 2; } catch (_e) { return true; } });
    if (vicino) break;
    await sleep(100);
  }
  await sleep(150);
  const r = await page.evaluate((g) => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.ball || !st.hero) return null;
    const bx = st.ball.x, by = st.ball.y;
    const dEroe = Math.hypot(st.hero.x - bx, st.hero.y - by);
    let dComp = 1e9, dAvv = 1e9;
    for (const p of (st.players || [])) { if (!p || p.x == null || p.gk) continue;
      const d = Math.hypot(p.x - bx, p.y - by);
      if (p.team === 'home') { if (d < dComp) dComp = d; } else if (d < dAvv) dAvv = d; }
    const S = (window.__CPM_SITS || [])[g] || {};
    return { gi: g, eroe: +dEroe.toFixed(1), comp: +(dComp < 1e8 ? dComp : -1).toFixed(1), avv: +(dAvv < 1e8 ? dAvv : -1).toFixed(1),
             fase: String((window.__CPM_STATE_PHASE && window.__CPM_STATE_PHASE()) || st.phase || ''),
             tipo: String(S.type || ''), zona: String((S.zones && S.zones[0]) || '') };
  } catch (_e) { return null; } }, gi);
  if (r) out.push(r);
}
await b.close(); srv.close();

console.log("\n=== ALL'APERTURA, CHI HA IL PALLONE? ===\n");
if (!out.length) { console.log('  ⚠ nessuna scena misurata: NON GIUDICABILE.\n'); process.exit(1); }
const q = (arr) => { const s = arr.slice().sort((a, b2) => a - b2); return s[Math.floor(s.length / 2)]; };
/* [7.599.0] e si CONTROLLA che le scene siano davvero diverse fra loro: se le terne si ripetono, la
   sonda sta guardando lo stato di prima e il censimento non vale. */
{const chiavi = new Set(out.map(o => `${o.eroe}|${o.comp}|${o.avv}`));
 const rip = out.length - chiavi.size;
 if (rip > out.length * 0.3) console.log(`  ⚠ ${rip}/${out.length} scene hanno una terna DUPLICATA: la sonda legge lo stato precedente, NON GIUDICABILE`);
 else console.log(`  terne distinte ${chiavi.size}/${out.length} (le ripetizioni sono poche: le scene si sono davvero aperte)`);}
console.log(`  scene misurate: ${out.length}`);
console.log(`  distanza pallone-EROE all'apertura   · mediana ${q(out.map(o => o.eroe)).toFixed(1)} u · quarto alto ${out.map(o => o.eroe).sort((a, b2) => a - b2)[Math.floor(out.length * .75)].toFixed(1)}`);
console.log(`  distanza pallone-COMPAGNO piu' vicino · mediana ${q(out.filter(o => o.comp >= 0).map(o => o.comp)).toFixed(1)} u`);
console.log(`  distanza pallone-AVVERSARIO piu' vicino · mediana ${q(out.filter(o => o.avv >= 0).map(o => o.avv)).toFixed(1)} u`);
/* «di nessuno» con la stessa soglia usata dal gioco per dire «ai piedi»: due metri. */
/* ⚠️ [7.599.0] LE AZIONI DIFENSIVE NON SONO UN DIFETTO, e contarle gonfiava il numero: in una scena
   `def` il pallone ce l'ha l'AVVERSARIO, ed e' esattamente cio' che deve succedere. Le peggiori della
   prima stesura erano quasi tutte def/propria con l'avversario a 0,4-0,9 unita': il gioco faceva bene.
   Il difetto vero e' una scena OFFENSIVA che si apre senza che il pallone sia di nessuno dei nostri. */
const off = out.filter(o => o.tipo !== 'def');
const orfane = off.filter(o => o.eroe > 2 && (o.comp < 0 || o.comp > 2));
{const dif = out.filter(o => o.tipo === 'def');
 const difOk = dif.filter(o => o.avv >= 0 && o.avv <= 2).length;
 console.log(`\n  scene DIFENSIVE: ${dif.length} · con il pallone ai piedi di un avversario (come deve essere) ${difOk}`);}
console.log(`  scene OFFENSIVE: ${off.length}`);
console.log(`\n  scene OFFENSIVE che si aprono con il pallone di NESSUNO dei nostri (oltre 2 u da eroe e compagni): ${orfane.length}/${off.length} (${off.length ? (orfane.length / off.length * 100).toFixed(0) : '?'}%)`);
const peggio = orfane.slice().sort((a, b2) => Math.min(b2.eroe, b2.comp < 0 ? 99 : b2.comp) - Math.min(a.eroe, a.comp < 0 ? 99 : a.comp)).slice(0, 8);
if (peggio.length) { console.log('\n  le peggiori (nessuno vicino al pallone quando la scena comincia):');
  for (const o of peggio) console.log(`    gi${String(o.gi).padStart(3)} [${o.tipo}/${o.zona}] · eroe ${o.eroe} u · compagno ${o.comp} u · avversario ${o.avv} u`); }
console.log('\n  (in una scena che si intitola «con palla in area» il pallone dovrebbe essere ai piedi di qualcuno.)');
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
