#!/usr/bin/env node
/* [7.386.0] GUARDIANO — LE SCORCIATOIE NON RUBANO I TASTI A CHI STA SCRIVENDO
   (collaudo PO «la partita non va in pausa e la lettera P non funziona»)

   COME SI E' VISTO. Non da una sonda: dagli APPUNTI DI COLLAUDO del PO. In ogni nota mancava ogni
   singola «p» — «comagno con la alla tra i iedi» per «compagno con la palla tra i piedi». La
   scorciatoia della pausa intercetta «p» sul documento, chiama `preventDefault` e ferma la
   propagazione: la lettera non arrivava mai alla casella, e in piu' ogni «p» invertiva la pausa —
   due «p» nella stessa parola la rimettevano com'era, cioe' «la partita non va in pausa».
   Non era un difetto della sola pausa: anche i numeri delle azioni, WASD, Invio e le lettere di
   navigazione (P, A, S, N, M, H) erano catturati globalmente. Scrivere «senza» in un campo di testo
   cambiava scheda a meta' parola.

   COSA MISURA: apre la casella degli appunti dentro la partita, scrive una frase che contiene TUTTE
   le lettere pericolose, e verifica che arrivi intera. Poi controlla che la pausa non sia stata
   invertita dalla scrittura.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node typing-shortcuts-test.mjs                          */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

/* la frase contiene p (pausa), a s d w (movimento), 1 2 3 (azioni), n m h s (navigazione) */
const FRASE = 'passaggio ai piedi 123 wasd nmh';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 900, height: 800 } });
await installCdnRoutes(page);
const NOGUARD = process.argv.includes('--senza-guardia');/* prova che il guardiano sia ROSSO senza la correzione: un guardiano che non e' mai stato rosso non dimostra niente */
await page.addInitScript(ng => { window.__CPM_GLB = false; if (ng) window.__CPM_NOGUARD386 = 1; }, NOGUARD);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 140)));
await openMatch(page, port); await sleep(1200);

const issues = [];

/* si scrive in un campo di testo qualunque presente in scena; se la casella degli appunti non e'
   raggiungibile in modalita' di collaudo, se ne crea uno vero nel DOM: il difetto e' nei gestori
   GLOBALI, quindi qualunque campo con il fuoco basta a provarlo. */
await page.evaluate(() => {
  const ta = document.createElement('textarea');
  ta.id = '__prova386'; ta.style.cssText = 'position:fixed;left:8px;top:8px;z-index:99999;width:320px;height:60px';
  document.body.appendChild(ta); ta.focus();
});
await sleep(200);

const pausaPrima = await page.evaluate(() => (window.__CPM_PHASE ? window.__CPM_PHASE() : null));
await page.type('#__prova386', FRASE, { delay: 18 });
await sleep(300);
const scritto = await page.evaluate(() => { const t = document.getElementById('__prova386'); return t ? t.value : null; });

if (scritto == null) issues.push('la casella di prova non esiste piu\': misura non fatta');
else if (scritto !== FRASE) {
  const persi = [];
  for (const c of new Set(FRASE.replace(/ /g, ''))) {
    const a = (FRASE.match(new RegExp(c, 'g')) || []).length, bb = (scritto.match(new RegExp(c, 'g')) || []).length;
    if (bb < a) persi.push(`${c} (${a - bb} su ${a})`);
  }
  issues.push(`la scrittura e' stata mangiata: atteso «${FRASE}», arrivato «${scritto}»` + (persi.length ? ` · lettere perse: ${persi.join(', ')}` : ''));
}

/* e la partita non deve essere finita in pausa per aver scritto */
const inPausa = await page.evaluate(() => { try { return !!(document.body.innerText || '').match(/in pausa|PAUSA/i); } catch (e) { return false; } });
if (inPausa) issues.push('scrivere ha messo la partita in PAUSA: la scorciatoia ha reagito lo stesso');

await page.evaluate(() => { const t = document.getElementById('__prova386'); if (t) t.remove(); });
await b.close(); srv.close();

if (errors.length) issues.push(`${errors.length} pageerror: ${errors[0]}`);
console.log(`frase attesa   : «${FRASE}»`);
console.log(`frase arrivata : «${scritto}»`);
console.log(`fase all'inizio: ${pausaPrima}`);
if (issues.length) { console.log('\n❌ FAIL — ' + issues.length); issues.forEach(i => console.log('  · ' + i)); process.exit(2); }
console.log('\n✅ PASS — chi scrive tiene la tastiera: nessuna scorciatoia gli ruba i tasti');
