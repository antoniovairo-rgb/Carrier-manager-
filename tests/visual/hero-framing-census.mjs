#!/usr/bin/env node
/* CENSIMENTO — QUANTO E' GRANDE L'EROE NEL QUADRO, su tutte le situations.

   DA DOVE VIENE, e perche' vale la pena. Il 15/08/2026 due revisori indipendenti hanno scritto la stessa
   riga senza sapere l'uno dell'altro: il modello di vista (gemma4, prima review vera) su gi0 — «la camera
   e' troppo lontana per apprezzare un uno-contro-uno» — e la lettura dei fogli-provini GLB-ON: «in
   sedici fotogrammi su sedici il gesto tecnico non e' leggibile». E' anche la famiglia piu' frequente nel
   taccuino del PO: «non si vede il gesto tecnico finale», che ha gia' prodotto correzioni su piu' release.

   MA «TROPPO LONTANA» NON SI CORREGGE. Si corregge un numero, e il numero c'era gia' sotto il naso:
   l'ALTEZZA APPARENTE dell'eroe nel quadro. Il testimone `__CPM_FRAME480` proietta l'eroe dai piedi alla
   testa nello spazio normalizzato della camera e riporta quell'altezza come FRAZIONE dell'altezza del
   quadro. E' adimensionale: non dipende da risoluzione, fps o dispositivo — quindi headless e telefono
   dicono lo stesso numero, ed e' confrontabile fra tutte e 191 le scene. E' la stessa mossa che oggi ha
   chiuso il «braccio storto»: si smette di guardare e si misura.

   RIFERIMENTI, dichiarati prima di misurare per non tarare la soglia sul risultato:
     · un piano AMERICANO da regia sportiva (busto e gambe leggibili) sta intorno a 0,35-0,60;
     · sotto 0,15 il giocatore e' alto meno di un sesto dello schermo: su un telefono da 6 pollici sono
       pochi millimetri, e nessun gesto di braccia o piedi e' distinguibile;
     · sotto 0,08 e' una figurina: si legge dove va la palla, non chi la gioca.
   Il censimento NON boccia: dichiara la distribuzione e nomina le scene peggiori, che sono quelle da
   guardare per prime.

   ⚠️ Si misura al momento della CONCLUSIONE (fase d'esito), non all'apertura: e' li' che vive il gesto
   che il PO dice di non vedere. E si aspetta l'uscita da `hl_result`, mai un tempo fisso — una sonda che
   dorme un tempo suo misura il proprio cronometro (lezione 7.460).

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node hero-framing-census.mjs [CPM_N=191]                */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
import fs from 'node:fs';

/* `CPM_TARGET` misura la REGIA CHE SI STA VALUTANDO, non quella di oggi: accende la manopola per taglia
   (`__CPM_FRAMET480`) e ri-censisce le 191 scene. Serve a rispondere alla sola domanda che conta prima di
   cambiare la regia di tutto il repertorio — «se scelgo 0,30, dove finisce davvero ognuna delle 191?» —
   perche' i provini dicono di tre scene, e tre scene non sono una decisione. */
const TARGET = +(process.env.CPM_TARGET || 0) || 0;
const PASSO = Math.max(1, +(process.env.CPM_STEP || 1));
const MAX = +(process.env.CPM_N || 191);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; window.__CPM_REC = true; });
const { total } = await openMatch(page, port);
await sleep(700);

const N = Math.min(MAX, total);
const righe = [];
for (let gi = 0; gi < N; gi += PASSO) {
  const ok = await forceSituation(page, gi, { settle: 400, choose: true }).then(() => true).catch(() => false);
  if (!ok) continue;
  await page.evaluate(t => { window.__CPM_FRAME480 = null; window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_FRAMET480 = t || null; }, TARGET);
  if (process.env.CPM_NO505) await page.evaluate(() => { window.__CPM_NO505 = 1; });/* [7.505.0] prova del rosso della taglia in regia */
  const info = await page.evaluate(() => {
    const s = window.__CPM_STATE && window.__CPM_STATE();
    const a = (window.__CPM_ACTS && window.__CPM_ACTS()) || [];
    return { tipo: (s && s.hlType) || null, azione: (a[0] && a[0].label) || null };
  }).catch(() => ({}));
  await page.evaluate(() => { try { window.__CPM_RESOLVE(0); } catch (e) {} });
  /* ⚠️ CONTROLLO DEL CONFONDENTE, non un tempo scelto a caso. In headless con GLB acceso il tempo di
     SCENA scorre a un decimo del reale: se la camera si avvicina progressivamente, una finestra corta
     misura una camera che non ha ancora finito di muoversi — e il censimento accuserebbe l'inquadratura
     di una lentezza che e' dello strumento. `CPM_WAIT` allarga la finestra: se l'altezza apparente NON
     cresce allargandola, il numero e' del gioco e non del cronometro. */
  await sleep(+(process.env.CPM_WAIT || 2400));
  const f = await page.evaluate(() => { const o = window.__CPM_FRAME480; return o ? { n: o.n, min: o.min, max: o.max, fuori: o.fuori, ultimo: o.ultimo } : null; }).catch(() => null);
  if (!f || !f.n) continue;
  righe.push({ gi, ...info, ...f });
  if (righe.length % 20 === 0) console.log(`  … ${righe.length} scene misurate`);
}
await b.close(); srv.close();

if (!righe.length) { console.log('❌ censimento cieco: nessuna scena misurata'); process.exit(2); }
const vals = righe.map(r => r.max).sort((x, y) => x - y);
const q = p => vals[Math.min(vals.length - 1, Math.floor(p * vals.length))];
const media = vals.reduce((a, c) => a + c, 0) / vals.length;

console.log(`\n=== ALTEZZA APPARENTE DELL'EROE su ${righe.length} scene (frazione dell'altezza del quadro, al MASSIMO della scena) ===`);
console.log(`  mediana ${q(0.5).toFixed(3)} · media ${media.toFixed(3)} · minimo ${vals[0].toFixed(3)} · massimo ${vals[vals.length - 1].toFixed(3)}`);
console.log(`  quartili: 25% ${q(0.25).toFixed(3)} · 75% ${q(0.75).toFixed(3)}`);
const sotto15 = righe.filter(r => r.max < 0.15), sotto08 = righe.filter(r => r.max < 0.08);
const fuori = righe.filter(r => r.fuori > 0);
console.log(`\n  sotto 0,15 (gesto non distinguibile): ${sotto15.length}/${righe.length} scene — ${(100 * sotto15.length / righe.length).toFixed(0)}%`);
console.log(`  sotto 0,08 (figurina):                ${sotto08.length}/${righe.length} scene — ${(100 * sotto08.length / righe.length).toFixed(0)}%`);
console.log(`  con l'eroe FUORI dal quadro in almeno un fotogramma: ${fuori.length}/${righe.length}`);

/* ⚠️ SECONDA DIMENSIONE, e non e' un raffinamento: e' un difetto DIVERSO. «Piccolo» e «non inquadrato»
   si correggono con due cose opposte — la distanza e la MIRA — e il criterio del 7.480 («fuori almeno un
   fotogramma») non li separava: un fotogramma su trenta e' un passaggio, ventotto su trenta e' una scena
   in cui il gesto non viene mai mostrato. Qui si misura la QUOTA di fotogrammi della conclusione con
   l'eroe fuori dal quadro, che e' un rapporto — quindi headless e telefono dicono lo stesso numero. */
const quota = r => (r.n ? r.fuori / r.n : 0);
const assenti = righe.filter(r => quota(r) >= 0.5).sort((a, c) => quota(c) - quota(a));
const totFuori = righe.reduce((a, c) => a + c.fuori, 0), totFr = righe.reduce((a, c) => a + c.n, 0);
console.log(`  quota di fotogrammi con l'eroe fuori dal quadro: ${totFuori}/${totFr} = ${(100 * totFuori / totFr).toFixed(1)}%`);
console.log(`\n=== SCENE IN CUI L'EROE NON E' IN QUADRO (oltre meta' dei fotogrammi della conclusione) ===`);
if (!assenti.length) console.log('  nessuna');
for (const r of assenti) console.log(`  gi${String(r.gi).padStart(3)} ${String((100 * quota(r)).toFixed(0)).padStart(4)}% dei fotogrammi · «${(r.azione || '—').slice(0, 46)}»`);

const peggiori = [...righe].sort((a, c) => a.max - c.max).slice(0, 15);
console.log(`\n=== le 15 scene in cui l'eroe e' piu' piccolo ===`);
for (const r of peggiori) console.log(`  gi${String(r.gi).padStart(3)} ${String(r.max.toFixed(3)).padStart(6)} · ${String(r.tipo || '—').padEnd(9)} · «${(r.azione || '—').slice(0, 46)}»`);

/* [7.505.0 F6/3] MODALITA' GUARDIANO — il censimento diventa anche il giudice, con soglie da env.
   PERCHE' QUI e non in un test separato: il primo guardiano della taglia era uno script NUOVO con un
   campionamento suo, e i suoi assoluti divergevano dal censimento SU ENTRAMBI I BRACCI (braccio rosso
   20,1% di fuori quadro dove questo strumento, sulla stessa configurazione, misura 4,7%). Uno strumento
   nuovo non e' un guardiano: e' una seconda opinione non calibrata. Le soglie si applicano ALLO
   strumento validato — zero duplicazione, stessi numeri dello sweep con cui la decisione e' stata presa.
   Uso: CPM_MED_MIN=0.14 CPM_FUORI_MAX=11 [CPM_ROSSO=1 con __CPM_NO505 gia' acceso via env CPM_NO505=1]. */
const MED_MIN = +(process.env.CPM_MED_MIN || 0);
const FUORI_MAX = +(process.env.CPM_FUORI_MAX || 0);
const G_ROSSO = !!process.env.CPM_ROSSO;
if (MED_MIN || FUORI_MAX) {
  const _med = q(0.5), _pf = totFr ? 100 * totFuori / totFr : 0;
  if (G_ROSSO) {
    if (_med < 0.10) { console.log(`\n✅ prova del rosso riuscita: senza la taglia in regia la mediana crolla a ${_med.toFixed(3)}`); }
    else { console.log(`\n❌ PROVA DEL ROSSO FALLITA: mediana ${_med.toFixed(3)} anche con la taglia spenta`); process.exitCode = 2; }
  } else {
    let _ko = false;
    if (MED_MIN && _med < MED_MIN) { console.log(`\n❌ la taglia si e' persa: mediana ${_med.toFixed(3)} sotto ${MED_MIN}`); _ko = true; }
    if (FUORI_MAX && _pf > FUORI_MAX) { console.log(`\n❌ la taglia e' stata comprata col fuori quadro: ${_pf.toFixed(1)}% > ${FUORI_MAX}%`); _ko = true; }
    if (_ko) process.exitCode = 2; else console.log(`\n✅ l'eroe si vede (mediana ${_med.toFixed(3)}) e resta nel quadro (${_pf.toFixed(1)}%)`);
  }
}
fs.mkdirSync('out/framing', { recursive: true });
fs.writeFileSync('out/framing/hero-framing.json', JSON.stringify({ generatedAt: null, target: TARGET || null, scene: righe.length, mediana: q(0.5), media, sotto15: sotto15.length, sotto08: sotto08.length, assenti: assenti.map(r => r.gi), righe }, null, 1));
console.log(`\ndettaglio → out/framing/hero-framing.json`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
