#!/usr/bin/env node
/* CENSIMENTO — QUANTE MANI TOCCANO L'INQUADRATURA, per fotogramma. F6, fase di SOLA OSSERVAZIONE.

   DA DOVE VIENE. L'audit aveva scritto «31 scrittori sulla camera in sequenza sullo stesso fotogramma».
   Rileggendo il blocco quella frase e' risultata IMPRECISA, e la correzione conta piu' del numero: la
   SELEZIONE della regia e' pulita — una catena `if/else if` MUTUAMENTE ESCLUSIVA (walkout · rigore ·
   punizione · testa · tackle · cross · tiro · filtrante · dribbling), quindi un solo ramo scrive.
   Il problema sta DOPO: una serie di passate correttive INDIPENDENTI, ognuna nata in una release diversa
   per chiudere un sintomo diverso, che si sommano nello stesso fotogramma e possono disfare il lavoro
   l'una dell'altra. Due di esse — `bordo-lift` (r.16264) e `bordo-tanh` (r.16275) — scattano sulla
   STESSA condizione `isHL && tPx < -46`: due correzioni allo stesso sintomo, scritte in momenti diversi.

   COSA MISURA. Per fotogramma di highlight: quante passate ingaggiano, quante volte piu' d'una insieme,
   e QUALI in coppia. E' il numero che serve prima di mettere le passate sotto un arbitro con priorita'
   dichiarate — perche' «si pestano i piedi» senza un conteggio e' un'impressione, non una diagnosi.

   ⚠️ ORA SONO STRUMENTATE TUTTE E OTTO (7.503.1): `porta` · `gk` · `bordo-lift` · `bordo-tanh` ·
   `guinzaglio` · `bisezione` · `snap` · `vista-reale`. La prima stesura ne copriva cinque, perche' il
   testimone era una `const` locale al ramo degli highlight e raccoglieva prima che le ultime tre
   girassero: i suoi numeri (1,85 passate per fotogramma · 48,4% con piu' d'una) erano un PAVIMENTO.
   Ora il testimone vive su `sr.current`, si azzera una volta per fotogramma e si raccoglie a fine
   blocco, quando tutte hanno parlato.

   ⚠️ La fase si legge da `__CPM_PHASE` (7.494/7.495/7.496), mai da `__CPM_STATE`.

   PROVA DEL ROSSO: `__CPM_NO503` spegne il conteggio; il censimento deve dichiararsi CIECO.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node camera-hands-test.mjs [CPM_ROSSO=1]                 */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, forceSituation } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const SCENE = +(process.env.CPM_SCENE || 30);
const PASSO = +(process.env.CPM_PASSO || 6);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
const BAND = process.env.CPM_BANDIERA || null;/* [7.580.0] una bandiera qualunque, per confrontare quante mani tocchino lo sguardo con un rimedio acceso e spento */
await page.addInitScript(([r, b]) => { window.__CPM_GLB = false; if (b) window[b] = 1; if (r) window.__CPM_NO503 = 1; }, [ROSSO, BAND]);
const { total } = await openMatch(page, port);

const gi = [];
for (let i = 0; i < total && gi.length < SCENE; i += PASSO) gi.push(i);
for (const g of gi) { try { await forceSituation(page, g, { settle: 420, choose: true }); await sleep(220); } catch (_e) {} }

const d = await page.evaluate(() => window.__CPM_CAM503 || null);
/* [7.584.0] LE COMMUTAZIONI DELLA BISEZIONE. Un interruttore che sfarfalla non si vede dalla FREQUENZA
   (3 inversioni al secondo contro 7fps headless: Nyquist le nasconde), ma si CONTA: quante volte la rete
   passa da ingaggiata a mollata e viceversa, sui fotogrammi osservati. E' la misura giusta per giudicare
   un'isteresi, ed e' immune al frame rate perche' e' un conteggio e non una frequenza. */
const B584 = await page.evaluate(() => window.__CPM_BIS584 || null);
await page.close().catch(() => {}); await b.close(); srv.close();

console.log(`\n=== QUANTE MANI TOCCANO L'INQUADRATURA${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NO503)' : ''} ===`);
if (!d || !d.f) {
  console.log('  nessun fotogramma osservato');
  if (ROSSO) { console.log('\n✅ prova del rosso riuscita: col conteggio spento il censimento non vede nulla'); process.exit(0); }
  console.log('\n❌ CIECO: nessun fotogramma di highlight osservato — non c\'e\' misura'); process.exit(2);
}
if (ROSSO) { console.log(`\n❌ PROVA DEL ROSSO FALLITA: ${d.f} fotogrammi contati col conteggio spento`); process.exit(2); }

console.log(`  fotogrammi di highlight     ${d.f}   su ${gi.length} scene`);
console.log(`  tocchi totali               ${d.tocchi}   (media ${(d.tocchi / d.f).toFixed(2)} passate per fotogramma)`);
console.log(`  con PIU' d'una insieme      ${d.multi}   ${(100 * d.multi / d.f).toFixed(1)}%`);
console.log('\n  quante volte ingaggia ciascuna:');
for (const [k, v] of Object.entries(d.per || {}).sort((a, c) => c[1] - a[1]))
  console.log(`    ${k.padEnd(13)} ${String(v).padStart(6)}   ${(100 * v / d.f).toFixed(1)}% dei fotogrammi`);
const combo = Object.entries(d.combo || {}).sort((a, c) => c[1] - a[1]).slice(0, 8);
if (combo.length) {
  console.log('\n  chi si somma a chi:');
  for (const [k, v] of combo) console.log(`    ${String(v).padStart(6)}×  ${k}`);
}
const dup = Object.entries(d.combo || {}).filter(([k]) => k.includes('bordo-lift') && k.includes('bordo-tanh')).reduce((a, [, v]) => a + v, 0);
console.log(`\n  le DUE correzioni sullo stesso sintomo (bordo-lift + bordo-tanh) insieme: ${dup} fotogrammi`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
console.log('\n✅ baseline F6 misurata — nessun comportamento cambiato, solo contato');
if (B584 && B584.frame) console.log('\n  bisezione: ' + B584.comm + ' commutazioni su ' + B584.frame + ' fotogrammi = ' + (100 * B584.comm / B584.frame).toFixed(1) + '% dei fotogrammi cambia stato');
else console.log('\n  bisezione: nessun dato di commutazione (il contatore non ha girato)');
