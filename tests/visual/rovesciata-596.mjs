/* [7.596.0 STRUMENTO] LA ROVESCIATA E' GIRATA COME DEVE?
   COLLAUDO PO, SESTA segnalazione (SIT #167, appunti 7.584): «Rovesciata al contrario, va girata di 180
   gradi». Nel 7.569 avevo gia' aggiunto mezzo giro di imbardata, e il PO la rivede storta: aggiungerne un
   altro darebbe zero, ed e' il rattoppo che non voglio fare. Prima si misura.
   Il criterio e' quello che il PO ha dettato e che sta scritto nel codice: nella rovesciata il giocatore
   ha le SPALLE ALLA PORTA. Quindi l'angolo fra la direzione in cui e' voltato e la direzione della porta
   deve stare vicino a 180 gradi. Questa sonda lo misura fotogramma per fotogramma durante l'acrobazia,
   e salva le immagini: se il numero e' giusto e l'occhio dice il contrario, allora il difetto non e'
   l'imbardata e va cercato altrove — ed e' un'informazione, non un fallimento. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const GI = Number(process.env.CPM_GI || 167);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const NO569 = !!process.env.CPM_NO569B;/* [7.596.0] prova del rosso sul mezzo giro del 7.569 */
await page.addInitScript((no) => { if (no) window.__CPM_NO569B = true; window.__CPM_GLB = false; window.__CPM_ROV = []; }, NO569);
await openMatch(page, port, { skipLoadAll: true, name: 'Rv' });
await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [GI, true]);
await sleep(700);
await page.evaluate(() => { window.__CPM_FROZEN = false; });
const intent = await page.evaluate(g => (window.__CPM_SITS && window.__CPM_SITS[g] && window.__CPM_SITS[g].intent) || null, GI);
console.log(`  intento della scena #${GI}: ${intent || '(non dichiarato)'}`);
await page.evaluate(() => { window.__CPM_ROVT = setInterval(() => { try {
  const v = window.__CPM_VOLLEY; const st = window.__CPM_STATE && window.__CPM_STATE();
  if (!v || !v.acro || !st || !st.hero) return;
  /* [7.611.0] SOLO fotogrammi in cui il gesto ha scritto DAVVERO in questo giro: il registro __CPM_VOLLEY
     resta stantio dopo il gesto, e la sonda misurava l'imbardata post-gesto spacciandola per acrobazia —
     e' il motivo per cui tre rimedi diversi davano lo stesso angolo. */
  if (v.t611 == null || (performance.now() - v.t611) > 300) return;
  const R = window.__CPM_ROV; if (R.length > 60) return;
  /* l'eroe attacca la porta a gx=100: la direzione della porta e' quella dal giocatore verso x=100. */
  const dx = 100 - st.hero.x, dy = 50 - st.hero.y;
  R.push({ u: v.u, ry: st.hero.ry, ry0: v.ry0, ryF: v.ryF, rx: v.rx, gx: st.hero.x, gy: st.hero.y, gdx: +dx.toFixed(1), gdy: +dy.toFixed(1) });
} catch (_e) {} }, 60); });
await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0));/* [7.596.0] l'acrobazia esiste solo se la scena arriva alla CONCLUSIONE: senza questo la sonda guardava una scena che non tirava mai */
const shots = [];
for (let k = 0; k < 6; k++) { await sleep(220); const p = `out/rov596-${k}.png`; await page.screenshot({ path: p }); shots.push(p); }
await page.evaluate(() => clearInterval(window.__CPM_ROVT));
const R = await page.evaluate(() => window.__CPM_ROV || []);
await b.close(); srv.close();

console.log(`\n=== LA ROVESCIATA DI SIT #${GI} E' GIRATA COME DEVE? ===\n`);
if (!R.length) { console.log('  ⚠ nessun fotogramma di acrobazia catturato: NON GIUDICABILE (la scena forse non e\' una rovesciata).\n'); process.exit(1); }
const g2 = (a) => { let d = a * 180 / Math.PI; while (d > 180) d -= 360; while (d < -180) d += 360; return d; };
console.log(`  fotogrammi di acrobazia: ${R.length}`);
console.log("  (l'angolo VERSO LA PORTA e' 0 quando il giocatore la guarda, ±180 quando le da' le spalle)\n");
/* ⚠️ [7.596.0] PRIMA STESURA SBAGLIATA, e l'ha detta il confronto: con e senza il mezzo giro davano 54° e
   23°, mentre due bracci che differiscono di mezzo giro DEVONO differire di 180. Il difetto era mio:
   mediavo i VALORI ASSOLUTI degli angoli su TUTTI i fotogrammi, compresi quelli a u=1 dove il gesto e'
   finito e l'imbardata salta (112°, 106°, -171° nella stessa scena). Una media di valori assoluti di
   angoli non e' un angolo, e i fotogrammi di coda non appartengono al gesto. Ora si guarda la MEDIANA sul
   solo corpo dell'acrobazia. */
const corpo = R.filter(r => r.u >= 0.1 && r.u <= 0.9);
let somma = 0;
for (const r of R.filter((_, i) => i % Math.max(1, Math.round(R.length / 8)) === 0)) {
  /* THREE: rotation.y = 0 guarda verso -Z; l'asse di gioco x cresce verso destra. Si confronta il VERSORE
     in cui il corpo e' voltato con il versore verso la porta, in coordinate di gioco. */
  const fx = Math.sin(r.ry), fy = -Math.cos(r.ry);
  const gn = Math.hypot(r.gdx, r.gdy) || 1;
  const ang = g2(Math.atan2(fx * (r.gdy / gn) - fy * (r.gdx / gn), fx * (r.gdx / gn) + fy * (r.gdy / gn)));
  console.log(`    u=${String(r.u).padStart(4)}  imbardata ${g2(r.ry).toFixed(0).padStart(5)}°  ·  verso la porta ${ang.toFixed(0).padStart(5)}°  ·  ribaltamento ${g2(r.rx).toFixed(0).padStart(5)}°`);
}
const base = corpo.length ? corpo : R;
const angoli = base.map(r => { const fx = Math.sin(r.ry), fy = -Math.cos(r.ry); const gn = Math.hypot(r.gdx, r.gdy) || 1;
  return Math.abs(g2(Math.atan2(fx * (r.gdy / gn) - fy * (r.gdx / gn), fx * (r.gdx / gn) + fy * (r.gdy / gn)))); }).sort((a, b2) => a - b2);
const media = angoli[Math.floor(angoli.length / 2)];
console.log(`  fotogrammi del CORPO del gesto (u fra 0,1 e 0,9): ${corpo.length} su ${R.length}${corpo.length ? '' : "  ⚠ nessuno: si ripiega su tutti, e il numero vale meno"}`);
console.log(`\n  angolo MEDIO verso la porta: ${media.toFixed(0)}°  (deve stare vicino a 180: spalle alla porta)`);
/* [7.596.0] IL MEZZO GIRO SI VERIFICA DENTRO LA SCENA, non fra due run. */
{const c2 = (corpo.length ? corpo : R).filter(r => r.ry0 != null && r.ryF != null);
 if (!c2.length) console.log("  ⚠ imbardata di partenza non esposta: il mezzo giro NON e' verificabile");
 else { const d = c2.map(r => { let g = (r.ryF - r.ry0) * 180 / Math.PI; while (g > 180) g -= 360; while (g < -180) g += 360; return Math.abs(g); }).sort((a, b2) => a - b2);
   const md = d[Math.floor(d.length / 2)];
   console.log(`\n  mezzo giro applicato (rotation.y meno imbardata di partenza): ${md.toFixed(0)}°  — deve fare 180`);
   /* ⚠️ [7.597.0] QUESTO NUMERO NON DICE QUELLO CHE SEMBRA, e mi ha ingannato: `ry0` e `ryF` sono letti
      DENTRO il blocco della rovesciata, un istante dopo che il blocco stesso li ha scritti. Misurano la
      scrittura, non il risultato. La mesh vera e' `st.hero.ry`, letta a fine fotogramma — ed e' diversa.
      Serve solo a dire se il blocco fa il suo mestiere, non se l'effetto sopravvive. */
   console.log(`  ${md > 170 ? '~ il blocco SCRIVE il mezzo giro (ma questo non dice se sopravvive: vedi nota)' : '✘ il blocco non scrive nemmeno il mezzo giro'}`);
   console.log(`  imbardata di partenza (mediana): ${(c2.map(r => r.ry0 * 180 / Math.PI).sort((a, b2) => a - b2)[Math.floor(c2.length / 2)]).toFixed(0)}°`);
 }}
console.log(`  ${media > 135 ? "✔ l'imbardata e' quella giusta: se il gesto si vede storto, la causa NON e' questa" : media < 45 ? '✘ il giocatore GUARDA la porta: e\' voltato al contrario' : '~ imbardata di traverso: ne\' di spalle ne\' di fronte'}`);
console.log(`\n  immagini: ${shots.join(' · ')}\n`);
