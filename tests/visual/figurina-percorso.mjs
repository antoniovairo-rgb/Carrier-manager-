/* [7.975 · 22/09] IL PERCORSO DELL'ARTE, PROVATO PRIMA CHE L'ARTE ARRIVI.
   Direttiva PO: «dove ci sono le faccine ora ci andranno le figurine», con una figurina d'esempio.
   Il contratto (docs/FIGURINE-VOLTI.md) dice che basta pubblicare il manifesto `window.__CPM_VOLTI` e le
   figurine compaiono senza toccare una schermata. Finora era una PROMESSA: qui si prova.

   La sonda accende il manifesto con una carta di prova 5:7 (fixtures/figurina-prova.svg, con la stessa
   struttura dell'esempio: cornice, marchio, fascia col nome a filo del bordo) e verifica quattro cose:
     1. il riquadro monta DAVVERO l'immagine (non il ripiego bianco);
     2. il rapporto reso resta 5:7 — l'arte non si deforma;
     3. il riquadro NON sovrappone niente sopra l'arte (nessun nome del componente sopra quello disegnato);
     4. l'arte non viene RITAGLIATA: `object-fit` deve essere `contain`, perche' la fascia col nome sta a
        filo del bordo basso e `cover` la taglierebbe.
   Uso:  CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node figurina-percorso.mjs                              */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const QUI = path.dirname(fileURLToPath(import.meta.url));
const SVG = fs.readFileSync(path.join(QUI, 'fixtures', 'figurina-prova.svg'), 'utf8');
const DATA = 'data:image/svg+xml;base64,' + Buffer.from(SVG, 'utf8').toString('base64');

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 });
const err = []; page.on('pageerror', e => err.push(String(e.message).slice(0, 120)));
await installCdnRoutes(page);
await page.addInitScript((url) => {
  window.__CPM_VOLTI = new Proxy({}, { get: () => url, has: () => true });/* ogni chiave risolve alla carta di prova */
  const save = { phase: 'career', player: { name: 'Grafica Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro',
    season: 12, week: 11, age: 28, ovr: 82, tutorialDone: true, squadRole: 'titolare', hasAgent: true,
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 52, c: '#6c1f2e', c2: '#f5f5f4', nat: '🇮🇹', lg: 'Lega A' },
    stats: { 'velocità': 82, tecnica: 81, fisico: 80, 'mentalità': 82, tiro: 84, passaggio: 81, dribbling: 83, posizionamento: 82 },
    form: 78, morale: 70, fatigue: 18, goals: 14, assists: 6, matches: 12, totalGoals: 240, totalAssists: 90, totalMatches: 380 } };
  try { localStorage.setItem('cpm-v3', JSON.stringify(save)); } catch (e) {}
}, DATA);
await page.goto(`http://127.0.0.1:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 60000 }).catch(() => {});
await sleep(1800);

const m = await page.evaluate(() => {
  const figs = [...document.querySelectorAll('[data-cpm-figurina]')];
  let conArte = 0, senzaArte = 0, sovrapposti = 0, ritagliate = 0, peggioScarto = 0;
  for (const f of figs) {
    const r = f.getBoundingClientRect(); if (r.width < 2) continue;
    const sc = Math.abs((r.height / r.width) - 7 / 5) / (7 / 5); if (sc > peggioScarto) peggioScarto = sc;
    const img = f.querySelector('img');
    if (img) {
      conArte++;
      if (getComputedStyle(img).objectFit !== 'contain') ritagliate++;
      /* qualunque nodo del riquadro che NON sia l'immagine e porti testo e' una sovrapposizione */
      if ((f.innerText || '').trim().length) sovrapposti++;
    } else senzaArte++;
  }
  return { n: figs.length, conArte, senzaArte, sovrapposti, ritagliate, scarto: Math.round(peggioScarto * 1000) / 10 };
});
await page.screenshot({ path: '/tmp/claude-0/figurina-percorso.png', fullPage: false });
await b.close(); srv.close();

console.log('\n=== IL PERCORSO DELL\'ARTE, DAL MANIFESTO AL RIQUADRO ===');
console.log(`  riquadri trovati       ${m.n}`);
console.log(`  con l'arte montata     ${m.conArte}`);
console.log(`  ancora col bianco      ${m.senzaArte}`);
console.log(`  con qualcosa SOPRA     ${m.sovrapposti}   (deve essere 0: nome e ruolo stanno nell'arte)`);
console.log(`  ritagliate (cover)     ${m.ritagliate}   (deve essere 0: la fascia col nome e' a filo del bordo)`);
console.log(`  scarto dal 5:7         ${m.scarto} %`);
console.log(`  errori di pagina       ${err.length}${err.length ? ' → ' + err[0] : ''}`);
const ok = m.n > 0 && m.conArte === m.n && m.sovrapposti === 0 && m.ritagliate === 0 && m.scarto <= 2 && err.length === 0;
console.log(ok ? "\n✅ PASS — il manifesto accende le figurine, l'arte non si deforma, non si ritaglia e non ci si scrive sopra"
               : '\n❌ FAIL');
process.exit(ok ? 0 : 1);
