#!/usr/bin/env node
/* GUARDIANO — UN HIGHLIGHT MOSTRA CHI LO STA FACENDO.

   DA DOVE VIENE. Il censimento del 7.482 ha misurato che su nove scene l'eroe sta fuori dal quadro per
   oltre meta' della conclusione, due al 100%: il gioco scrive «Grande intervento!» e il giocatore non si
   vede mai fare l'intervento. La famiglia e' quasi tutta DIFENSIVA, e la causa era strutturale: dopo un
   recupero il pallone se ne va lontano, la regia passa il soggetto ALLA PALLA (`_subjBall50`) e con lui
   cadono sia il richiamo-eroe a livello target sia la rete anti-fuoriquadro. Il 7.483 ha escluso gli
   highlight difensivi da quel passaggio di soggetto.

   COSA GIUDICA. La QUOTA di fotogrammi della conclusione con l'eroe fuori dal quadro (testimone
   `__CPM_FRAME480`) sulle scene difensive che il censimento ha nominato. E' un rapporto, quindi headless
   e telefono dicono lo stesso numero.

   ⚠️ LA BANDA E' SCELTA PER SEPARARE, NON PER PASSARE — E LA PRIMA ERA SBAGLIATA. La prima stesura fissava
   la soglia al 75% sui numeri raccolti su pagina STANCA (vecchia 100/100/100/45 contro nuova 43/35/50/0).
   Su pagina nuova quei numeri non esistono: le scene che si separano davvero sono DUE, e si separano piu'
   stretto — gi138 58% contro 18%, gi133 46% contro 0%. Con la soglia al 75% il guardiano sarebbe rimasto
   verde anche tornando alla regia vecchia, cioe' non avrebbe guardato niente. Ora sta al 35%, che nessuna
   delle misure attraversa in nessuno dei due bracci.

   ⚠️ E LE ALTRE SCENE DEL CENSIMENTO SONO CONTROLLI, NON TESTIMONI: gi168, gi33 e gi146 stanno a 0-2% con
   ENTRAMBE le regie. Il censimento le aveva nominate al 92-100%, ma quello era il suo strumento (191
   conclusioni di fila sulla stessa pagina), non il gioco. Qui servono a dire che il rimedio non le ha
   rotte.

   ⚠️ SI MISURA LA MEDIANA DI PIU' PASSATE, OGNUNA SU UNA PAGINA NUOVA. La quota varia molto fra run col
   fps headless (la stessa scena sulla stessa regia ha dato 100% e 58%), quindi una passata sola non
   regge un confronto: questa probe e' nata proprio da un'attribuzione sbagliata fatta su una passata
   sola. Ma la prima stesura forzava le scene in sequenza sulla STESSA pagina, e misurava soprattutto
   quella: la prima passata di ogni scena dava 0-37% e le successive 38-100% sulla stessa identica regia.
   Una pagina che ha gia' recitato dieci conclusioni non e' la pagina su cui gioca il giocatore. Una
   pagina nuova per ogni misura costa qualche minuto e toglie di mezzo un'intera classe di dubbi.

   PROVA DEL ROSSO: `__CPM_NO482` rimette il passaggio di soggetto di prima. Con `CPM_ROSSO=1` il
   guardiano lo accende e PRETENDE di fallire: se non fallisce, non sta guardando quello che dice.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node hero-in-frame-test.mjs [CPM_ROSSO=1]              */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';

const SCENE = [138, 133];                  /* i due testimoni veri: 58%->18% e 46%->0% su pagina nuova */
const CONTROLLI = [168, 33, 146, 0, 94];   /* sane con entrambe le regie: il rimedio non deve romperle */
const SOGLIA = 35;                         /* vecchio 58/46 · nuovo 18/0: nessuna misura attraversa il 35 */
const RIP = +(process.env.CPM_RIP || 3);
const ROSSO = !!process.env.CPM_ROSSO;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

async function misura(gi) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = true; });
  try {
    await openMatch(page, port);
    await sleep(700);
    await forceSituation(page, gi, { settle: 400, choose: true });
    await page.evaluate(r => { window.__CPM_NO482 = r ? 1 : null; window.__CPM_FRAME480 = null; window.__CPM_FORCE_OUTCOME = 'success'; }, ROSSO);
    await page.evaluate(() => { try { window.__CPM_RESOLVE(0); } catch (e) {} });
    await sleep(2400);
    const f = await page.evaluate(() => window.__CPM_FRAME480 || {});
    return f && f.n ? 100 * (f.fuori || 0) / f.n : null;
  } catch (e) { return null; } finally { await page.close().catch(() => {}); }
}

const quote = {};
for (let rip = 0; rip < RIP; rip++) {
  for (const gi of [...SCENE, ...CONTROLLI]) {
    const q = await misura(gi);
    if (q != null) (quote[gi] = quote[gi] || []).push(q);
  }
}
await b.close(); srv.close();

const med = a => { const v = [...a].sort((x, y) => x - y); return v[Math.floor(v.length / 2)]; };
let rossi = 0, ciechi = 0;
console.log(`\n=== L'EROE E' IN QUADRO NEL SUO HIGHLIGHT · mediana su ${RIP} passate${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO482)' : ''} ===`);
for (const gi of SCENE) {
  const q = quote[gi];
  if (!q || !q.length) { console.log(`  gi${String(gi).padStart(3)} · ⚠ nessuna misura (scena non forzata)`); ciechi++; continue; }
  const m = med(q), ko = m > SOGLIA;
  if (ko) rossi++;
  console.log(`  gi${String(gi).padStart(3)} · fuori quadro ${String(m.toFixed(0) + '%').padStart(5)} ${ko ? '❌ non mostra il protagonista' : '✅'}   (passate ${q.map(v => v.toFixed(0)).join('/')})`);
}
for (const gi of CONTROLLI) {
  const q = quote[gi]; if (!q || !q.length) { ciechi++; continue; }
  const m = med(q), ko = m > 20;
  if (ko) rossi++;
  console.log(`  gi${String(gi).padStart(3)} · CONTROLLO ${String(m.toFixed(0) + '%').padStart(4)} ${ko ? '❌ regressione su una scena che era sana' : '✅'}`);
}
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

/* ⚠️ Un guardiano che non ha misurato nulla non e' verde: e' cieco, ed e' la trappola che questo repo ha
   gia' pagato («zero salti» da un varco che non guardava). */
if (ciechi) { console.log(`\n❌ CIECO su ${ciechi} scene: nessuna misura raccolta`); process.exit(2); }
if (ROSSO) {
  if (rossi) { console.log(`\n✅ prova del rosso riuscita: con la regia vecchia ${rossi} scene falliscono`); process.exit(0); }
  console.log('\n❌ PROVA DEL ROSSO FALLITA: con la regia vecchia il guardiano resta verde — non sta misurando cio\' che dichiara'); process.exit(2);
}
if (rossi) { console.log(`\n❌ ${rossi} scene non mostrano il protagonista`); process.exit(2); }
console.log('\n✅ nessuna scena difensiva nasconde il protagonista per quasi tutta la conclusione');
