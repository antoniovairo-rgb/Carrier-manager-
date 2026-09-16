/* [7.927 collaudo PO] «Di default pagelle e statistiche devono apparire CHIUSE e durante la partita
   deve MEMORIZZARE la scelta, non riaprire ad ogni fine highlight».
   Tre misure, tutte sul pannello vero, in un'unica partita:
     1) alla prima comparsa il pannello e' CHIUSO (nessuna riga di tabella a schermo);
     2) aperto a mano, dopo che un highlight lo ha SMONTATO e rimontato, e' ancora APERTO;
     3) richiuso a mano, dopo un altro smontaggio, e' ancora CHIUSO.
   Il difetto si riconosce dal RIMONTAGGIO: __CPM_SOSP917 va a false quando il campo 2D sparisce
   (fine highlight) e torna true al rientro — e' li' che la vecchia stesura riapriva il pannello. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'memoria927');
fs.mkdirSync(OUT, { recursive: true });

const stato = (page) => page.evaluate(() => {
  const mem = window.__CPM_MEM927 ? { aperto: !!window.__CPM_MEM927.aperto, vista: window.__CPM_MEM927.vista } : null;
  const el = document.querySelector('[data-cpm="pannello918"]');
  if (!el) return { montato: false, mem };
  const corpi = el.querySelectorAll(':scope > div').length;
  const frecce = Array.from(el.querySelectorAll('button')).map(b => String(b.textContent || '').trim());
  const testa = frecce.find(t => t === '▾' || t === '▴') || '';
  const b = el.getBoundingClientRect();
  return { montato: true, corpi, testa, h: Math.round(b.height), aperto: testa === '▾' };
});
/* il pannello esiste SOLO fra un highlight e l'altro: prima di leggerlo o toccarlo va atteso in campo */
const attendiMontato = async (page) => {
  /* il pop-up della scelta e' un MODALE con il velo a tutto schermo (zIndex 9998): finche' e' li'
     nessun tocco arriva al pannello — e' il comportamento voluto, non un difetto. Si aspetta la
     finestra libera, altrimenti la sonda misurerebbe il velo e non la memoria. */
  await page.waitForFunction(() => window.__CPM_SOSP917 === true
    && !!document.querySelector('[data-cpm="pannello918"]')
    && !document.querySelector('[data-cpm="pop919"]'), { timeout: 180000 }).catch(() => {});
  await sleep(400);
};
/* Il pannello vive a FINESTRE: fra due highlight puo' restare in campo pochi secondi, e un clic
   partito mezzo secondo dopo la lettura trova il nodo gia' sparito. Si riprova finche' la memoria
   (window.__CPM_MEM927, sola lettura) non dice che la scelta e' davvero cambiata. */
const clicFreccia = async (page) => {
  const pre = await page.evaluate(() => !!(window.__CPM_MEM927 && window.__CPM_MEM927.aperto));
  for (let t = 0; t < 14; t++) {
    await attendiMontato(page);
    const bb = await page.$$('[data-cpm="pannello918"] button');
    if (bb && bb[2]) await bb[2].click({ timeout: 2000 }).catch(() => {});
    else { /* nessun bottone: si riprova al giro dopo */ }
    await sleep(350);
    const ora = await page.evaluate(() => !!(window.__CPM_MEM927 && window.__CPM_MEM927.aperto));
    if (ora !== pre) return true;
    if (t === 3 || t === 13) { /* chi si prende il tocco al posto della freccia? */
      const chi = await page.evaluate(() => {
        const el = document.querySelector('[data-cpm="pannello918"]');
        if (!el) return 'pannello non in campo';
        const b = Array.from(el.querySelectorAll('button'))[2];
        if (!b) return 'freccia assente · bottoni ' + el.querySelectorAll('button').length;
        const r = b.getBoundingClientRect();
        const x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
        const top = document.elementFromPoint(x, y);
        const dentro = top === b || (b.contains && b.contains(top));
        const via = [];
        let n = top; for (let k = 0; k < 4 && n; k++) { via.push(n.tagName.toLowerCase() + (n.getAttribute('data-cpm') ? '[' + n.getAttribute('data-cpm') + ']' : '')); n = n.parentElement; }
        return `freccia a ${x},${y} ${Math.round(r.width)}x${Math.round(r.height)} · il tocco lo prende ${dentro ? 'LA FRECCIA' : via.join(' < ')}`;
      });
      console.log(`  [diagnosi clic, tentativo ${t + 1}] ${chi}`);
    }
  }
  return false;
};
/* aspetta che il campo 2D sparisca e ritorni: e' un highlight intero.
   Il conteggio dei cicli lo tiene la PAGINA (osservatore a 80 ms installato prima del gioco): una
   waitForFunction che guarda __CPM_SOSP917 puo' arrivare a valle di una sparizione gia' finita e
   restare appesa per sempre — e' quello che e' successo alla prima stesura di questa sonda. */
const unHighlight = async (page) => {
  const da = await page.evaluate(() => window.__CPM_CICLI927 || 0);
  const t0 = Date.now();
  const ok = await page.waitForFunction((n) => (window.__CPM_CICLI927 || 0) > n, da, { timeout: 180000 }).then(() => true).catch(() => false);
  if (!ok) return 0;
  await page.waitForFunction(() => window.__CPM_SOSP917 === true, { timeout: 180000 }).catch(() => {});
  return Math.round((Date.now() - t0) / 1000);
};

const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await installCdnRoutes(ctx);
const page = await ctx.newPage();
let errori = 0; const messaggi = [];
page.on('pageerror', (e) => { errori++; if (messaggi.length < 4) messaggi.push(String(e).slice(0, 200)); });
const ROSSO = process.argv.includes('--rosso');
await page.addInitScript((rosso) => { window.__CPM_GLB = true; if (rosso) window.__CPM_NO927 = true;
  window.__CPM_CICLI927 = 0; let _pre = null;
  setInterval(() => { const v = window.__CPM_SOSP917; if (_pre === true && v === false) window.__CPM_CICLI927++; _pre = v; }, 80);
}, process.argv.includes('--rosso'));
await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 }); } catch (_e) {}
await page.waitForFunction(() => window.__CPM_SOSP917 === true, { timeout: 120000 }).catch(() => {});
await sleep(2500);

const righe = [];
await attendiMontato(page);
const s1 = await stato(page);
righe.push(['1) alla prima comparsa', s1]);
await page.screenshot({ path: path.join(OUT, '1-nasce-chiuso.png') }).catch(() => {});

await attendiMontato(page);
await clicFreccia(page);
const s2 = await stato(page);
righe.push(['2) dopo un clic (aperto a mano)', s2]);
const hl1 = await unHighlight(page);
await attendiMontato(page);
const s3 = await stato(page);
righe.push(['3) dopo un highlight intero', s3]);
/* si clicca SUBITO, sullo stesso montaggio che s3 ha appena letto: una foto in mezzo basta a far
   sparire il pannello (arriva l'highlight seguente) e il clic non trova piu' niente da toccare. */
await clicFreccia(page);
const s4 = await stato(page);
await page.screenshot({ path: path.join(OUT, '3-resta-aperto.png') }).catch(() => {});
righe.push(['4) richiuso a mano', s4]);
const hl2 = await unHighlight(page);
await attendiMontato(page);
const s5 = await stato(page);
righe.push(['5) dopo un secondo highlight', s5]);
await page.screenshot({ path: path.join(OUT, '5-resta-chiuso.png') }).catch(() => {});
await browser.close();

console.log(`\n=== 7.927: il pannello ricorda la scelta del PO === ${ROSSO ? '[ROSSO __CPM_NO927: la stesura di prima]' : '[VERDE]'}`);
for (const [et, s] of righe) {
  console.log(`  ${et.padEnd(34)} ${s.montato ? (s.aperto ? 'APERTO' : 'chiuso') + ` · freccia ${s.testa} · corpi ${s.corpi} · alto ${s.h}px` : 'non in campo in questo istante' + (s.mem ? ' · memoria ' + (s.mem.aperto ? 'APERTO' : 'chiuso') : '')}`);
}
console.log(`  highlight attraversati: ${hl1 ? 'si (' + hl1 + 's)' : 'NO'} + ${hl2 ? 'si (' + hl2 + 's)' : 'NO'} · errori di pagina ${errori}${messaggi.length ? ' → ' + messaggi[0] : ''}`);
console.log(`  foto: ${OUT}`);

const ok1 = s1.montato && s1.aperto === false;
const ok2 = s2.montato && s2.aperto === true;
const ok3 = hl1 && s3.montato && s3.aperto === true;
const ok4 = s4.montato && s4.aperto === false;
/* la seconda conferma e' un DI PIU': se la partita non concede un altro highlight (intervallo, fine
   gara) la misura non e' giudicabile — non si fa passare per verde cio' che non si e' visto. */
const giud5 = !!(hl2 && s5.montato);
const ok5 = giud5 ? (s5.aperto === false) : true;
console.log(`\n  nasce chiuso ${ok1 ? '✅' : '❌'} · si apre ${ok2 ? '✅' : '❌'} · resta aperto dopo l'highlight ${ok3 ? '✅' : '❌'} · si richiude ${ok4 ? '✅' : '❌'} · resta chiuso dopo l'highlight ${giud5 ? (ok5 ? '✅' : '❌') : '· non giudicabile (nessun secondo highlight)'}`);
const tutto = ok1 && ok2 && ok3 && ok4 && ok5 && errori === 0;
if (ROSSO) {
  /* il rosso DEVE fallire: e' la prova che questa sonda sa vedere il difetto che ha corretto */
  console.log(tutto ? '\n❌ il rosso e\' passato: la sonda NON vede il difetto, non vale niente'
                    : '\n✅ difetto riprodotto — con __CPM_NO927 il pannello nasce aperto e/o dimentica la scelta');
  process.exit(tutto ? 1 : 0);
}
console.log(tutto ? '\n✅ PASS — il pannello nasce chiuso e non torna mai indietro sulla scelta del PO.'
                  : '\n❌ FAIL — la scelta non sopravvive al rimontaggio (o il pannello non nasce chiuso).');
process.exit(tutto ? 0 : 1);
