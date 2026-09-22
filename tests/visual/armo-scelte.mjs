/* [7.956 · rilievo PO «il freeze dei pulsanti azioni post scegli ridicolo, troppo lungo»]

   QUANTO restano spenti i bottoni della scelta, misurato nel DOM e non nel sorgente: dal momento in cui
   compaiono a quello in cui il primo bottone smette di essere `disabled`. Due bracci appaiati —
   VERDE (com'e' spedito) e ROSSO (`__CPM_NO956`, il comportamento di ieri a 1.200 ms).

   Perche' dal DOM e non leggendo la costante: la costante dice cosa ho scritto, il DOM dice cosa vede
   il dito del giocatore — e in mezzo ci sono React, il render e il telefono. (Lezione 7.487: dove il
   dato nasce si misura li'; qui il dato NASCE nell'attributo `disabled`.)

   Uso:  CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node armo-scelte.mjs                                */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const TETTO = +(process.env.CPM_ARMO_MAX || 450);   /* il dito non deve aspettare piu' di questo */
const PAVIMENTO = +(process.env.CPM_ARMO_MIN || 120); /* ne' meno: sotto, il tocco di rimbalzo passa */
const server = await startServer(); const port = server.address().port;
const ris = {};

for (const braccio of ['verde', 'rosso']) {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  let errori = 0; page.on('pageerror', () => { errori++; });
  await page.addInitScript((rosso) => {
    if (rosso) window.__CPM_NO956 = true;
    /* testimone: annota quando i bottoni della scelta compaiono e quando si armano */
    window.__CPM_ARMO = { visti: 0, armati: 0, ritardi: [] };
    const osserva = () => {
      try {
        const box = document.querySelector('[data-cpm="scelte"], [data-cpm="pop919"]');
        if (!box) { window.__CPM_ARMO._t0 = null; return; }
        const b = box.querySelector('button');
        if (!b) return;
        if (window.__CPM_ARMO._t0 == null) { window.__CPM_ARMO._t0 = performance.now(); window.__CPM_ARMO.visti++; window.__CPM_ARMO._fatto = false; }
        if (!b.disabled && !window.__CPM_ARMO._fatto) {
          window.__CPM_ARMO._fatto = true; window.__CPM_ARMO.armati++;
          window.__CPM_ARMO.ritardi.push(Math.round(performance.now() - window.__CPM_ARMO._t0));
        }
      } catch (_e) {}
    };
    setInterval(osserva, 16);
  }, braccio === 'rosso');

  await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
  await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
  /* si aspettano parecchie scelte: l'autoplay le risolve da solo, il testimone le conta tutte */
  for (let i = 0; i < 90; i++) {
    const n = await page.evaluate(() => { try { return window.__CPM_ARMO ? window.__CPM_ARMO.armati : 0; } catch (_e) { return 0; } });
    if (n >= 4) break;
    await sleep(1000);
  }
  ris[braccio] = { ...(await page.evaluate(() => { try { return JSON.parse(JSON.stringify(window.__CPM_ARMO)); } catch (_e) { return null; } })), errori };
  await browser.close();
}
await new Promise(r => server.close(r));

const med = (a) => { if (!a || !a.length) return null; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const V = ris.verde, R = ris.rosso;
console.log('\n=== QUANTO RESTANO SPENTI I BOTTONI DELLA SCELTA ===');
for (const [n, a] of [['verde', V], ['rosso (__CPM_NO956, ieri)', R]]) {
  console.log(`  ${n.padEnd(26)} scelte viste ${a.visti} · armate ${a.armati} · ritardi ${JSON.stringify(a.ritardi)} ms · mediana ${med(a.ritardi)} ms · errori ${a.errori}`);
}

const guai = [];
const mv = med(V.ritardi), mr = med(R.ritardi);
if (!V.armati) guai.push('nel verde non si e\' armata nessuna scelta: la sonda non ha misurato il caso del PO');
if (!R.armati) guai.push('nel rosso non si e\' armata nessuna scelta: senza il braccio di ieri non c\'e\' confronto');
if (mv != null && mv > TETTO) guai.push(`VERDE: i bottoni restano spenti ${mv} ms, sopra il tetto di ${TETTO} — e' il difetto del PO`);
if (mv != null && mv < PAVIMENTO) guai.push(`VERDE: solo ${mv} ms, sotto il pavimento di ${PAVIMENTO}: il tocco di rimbalzo del D-pad tornerebbe a scegliere da solo`);
if (mv != null && mr != null && !(mv < mr)) guai.push(`il verde non e' piu' pronto del rosso (${mv} contro ${mr} ms)`);
if (V.errori || R.errori) guai.push(`errori di pagina: verde ${V.errori} · rosso ${R.errori}`);

if (guai.length) { console.log('\n❌ FAIL'); guai.forEach(g => console.log('  · ' + g)); process.exit(1); }
console.log(`\n✅ PASS — i bottoni si armano in ${mv} ms (ieri ${mr}), dentro [${PAVIMENTO}, ${TETTO}].`);
