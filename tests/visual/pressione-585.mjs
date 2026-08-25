#!/usr/bin/env node
/* CENSIMENTO — QUANTO STA ADDOSSO LA DIFESA A CHI HA IL PALLONE.
   E' la domanda «i ventidue giocano» ridotta a un numero che si puo' misurare: col pallone nella meta'
   offensiva, quanto dista il difensore piu' vicino al portatore. Nel calcio vero, palla in area, sta a
   uno o due metri; a ventiquattro non gli sta addosso nessuno.

   PERCHE' UNA SONDA A PARTE E NON UN CANCELLO PIU' SEVERO. Il controllo `motion` del gate misura la
   stessa cosa ma su ~8 scene, e la sua stessa nota racconta che «tre giri sullo stesso identico codice
   davano ❌ ❌ ✅»: con otto scene una sola decide il verdetto, e infatti e' fallito e ripassato su codice
   identico durante questa sessione. La cura non e' spostare la soglia — che sarebbe aggiustare il metro —
   ne' rendere il gate piu' lento: e' guardare MOLTE piu' scene qui, e lasciare il cancello dov'e'.
   Stampa la DISTRIBUZIONE, non una percentuale a soglia: mediana e quartili non dipendono da dove si
   mette il taglio, e sono l'unica cosa su cui si possa decidere qualcosa. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sampleMotion } from './lib/harness.mjs';
const PRESS_HALF = 55;   /* palla nella meta' offensiva: sotto questa x il pressing non e' in questione */
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
const { total } = await openMatch(page, port);
const N = Math.min(+(process.env.CPM_SCENE || 40), total || 40);
const righe = [];
for (let gi = 0; gi < N; gi++) {
  try { const m = await sampleMotion(page, gi, { settle: 400, windowMs: 2600 }); if (m) righe.push(m); } catch (_e) {}
}
await b.close(); srv.close();

const press = righe.filter(r => r.defMinEver != null && r.ballX != null && r.ballX > PRESS_HALF);
console.log('\n=== QUANTO STA ADDOSSO LA DIFESA A CHI HA IL PALLONE ===\n');
console.log('  scene campionate ' + righe.length + ' su ' + N + ' forzate  ·  di queste, col pallone nella meta\' offensiva: ' + press.length);
if (!press.length) { console.log('\n  ⚠ nessuna scena giudicabile: la sonda non sta misurando niente.\n'); process.exit(1); }
const d = press.map(r => r.defMinEver).sort((a, x) => a - x);
const q = p => d[Math.min(d.length - 1, Math.floor(p * d.length))];
console.log('\n  distanza del difensore piu\' vicino al portatore (metri):');
console.log('    minimo ' + d[0].toFixed(1) + '  ·  primo quarto ' + q(0.25).toFixed(1) + '  ·  MEDIANA ' + q(0.5).toFixed(1) + '  ·  terzo quarto ' + q(0.75).toFixed(1) + '  ·  massimo ' + d[d.length - 1].toFixed(1));
console.log('    difensori entro 15 m, in media: ' + (press.reduce((a, r) => a + (r.defNear || 0), 0) / press.length).toFixed(2));
for (const s of [10, 15, 24]) {
  const n = d.filter(v => v > s).length;
  console.log('    scene in cui il piu\' vicino sta oltre ' + String(s).padStart(2) + ' m: ' + String(n).padStart(3) + '/' + press.length + ' = ' + (100 * n / press.length).toFixed(0) + '%');
}
console.log('\n  (il gate usa 24 m e ~8 scene: qui la stessa grandezza su ' + press.length + ' scene, e senza soglia)');
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
