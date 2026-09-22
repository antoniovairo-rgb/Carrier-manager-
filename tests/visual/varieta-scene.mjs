/* [7.958 · rilievo PO: «aumenta le varianti di interazione dell'eroe durante la partita, sono molto
   ripetitive»] QUANTE SCENE DIVERSE VEDE DAVVERO CHI GIOCA.

   Il catalogo ha 185 schede e 573 azioni: non e' povero. Quindi «ripetitivo» puo' voler dire due cose
   opposte, che vogliono rimedi opposti:
     (a) il catalogo e' piccolo        -> si scrivono schede nuove;
     (b) la SELEZIONE ne pesca sempre le stesse -> si sorteggia meglio, e scrivere schede non serve.
   Questa sonda separa le due. Gioca N partite VERE (seed diverso per partita: il seed nasce da
   avversario+stagione+settimana+NOME, quindi si cambia il nome) e legge dal registro eventi quale
   scheda ha vestito ogni scena. Poi riporta: scene totali, schede DISTINTE, quota della scheda piu'
   frequente e quota delle prime tre — che e' la forma vera della ripetitivita'.

   Uso:  CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… [CPM_PARTITE=6] node varieta-scene.mjs            */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const N = +(process.env.CPM_PARTITE || 6);
const server = await startServer(); const port = server.address().port;
const scene = []; const cand = [];
let errori = 0;

const browser = await launchBrowser();
for (let k = 0; k < N; k++) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  page.on('pageerror', () => { errori++; });
  /* nome diverso = seed di partita diverso (lezione 7.496: variare il seed dell'autoplay da' N volte
     la stessa partita, perche' il seed nasce da avversario+stagione+settimana+NOME) */
  await openMatch(page, port, { skipLoadAll: true, name: 'Probe' + k });
  await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 120 }); }).catch(() => {});
  for (let i = 0; i < 75; i++) {
    const fin = await page.evaluate(() => { try { return window.__CPM_PHASE && window.__CPM_PHASE() === 'ended'; } catch (_e) { return false; } });
    if (fin) break;
    await sleep(1000);
  }
  const dati = await page.evaluate(() => { try {
    const reg = (typeof window.__CPM_EV === "function" ? window.__CPM_EV() : []);
    return { scene: reg.filter(e => e && e.ev === 'scena').map(e => e.sk || '(senza titolo)'),
             cand: reg.filter(e => e && e.ev === 'candidate').map(e => ({ f: e.fresche, d: e.dentro, z: e.zona })) };
  } catch (_e) { return { scene: [], cand: [] }; } });
  scene.push(...dati.scene); cand.push(...dati.cand);
  await ctx.close();
}
await browser.close();
await new Promise(r => server.close(r));

const conta = {};
for (const s of scene) conta[s] = (conta[s] || 0) + 1;
const ord = Object.entries(conta).sort((a, b) => b[1] - a[1]);
const tot = scene.length, distinte = ord.length;
const q1 = tot ? ord[0][1] / tot : 0;
const q3 = tot ? ord.slice(0, 3).reduce((a, x) => a + x[1], 0) / tot : 0;

console.log(`\n=== QUANTE SCENE DIVERSE VEDE CHI GIOCA === ${N} partite`);
console.log(`  scene giocate ${tot} · schede DISTINTE ${distinte} su 185 del catalogo (${tot ? (distinte / tot * 100).toFixed(0) : 0} % di varieta' sulle scene viste)`);
console.log(`  la piu' frequente copre il ${(q1 * 100).toFixed(1)} % delle scene · le prime tre il ${(q3 * 100).toFixed(1)} %`);
console.log(`  errori di pagina ${errori}`);
console.log('\n  le dieci piu' + "' frequenti:");
ord.slice(0, 10).forEach(([s, n]) => console.log(`    ${String(n).padStart(3)}×  ${s}`));

if (!tot) { console.log('\n❌ FAIL — nessuna scena registrata: la sonda non ha misurato niente'); process.exit(1); }
if (cand.length) {
  const med = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
  console.log(`\n  QUANTE CANDIDATE arrivano alla scelta (mediana su ${cand.length} scene):`);
  console.log(`    fresche dal selettore contestuale ${med(cand.map(c => c.f))} · dentro la zona dell'eroe ${med(cand.map(c => c.d))} · compatibili di zona ${med(cand.map(c => c.z))}`);
  console.log(`    → se «dentro la zona» e' 1, non c'e' niente da sorteggiare: il collo di bottiglia e' il FILTRO, non la scelta.`);
}
console.log('\n(censimento, senza soglia: serve a scegliere il rimedio, non a bocciare)');
