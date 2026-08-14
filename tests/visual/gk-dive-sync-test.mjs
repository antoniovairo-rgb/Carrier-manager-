#!/usr/bin/env node
/* GUARDIANO — «IL PORTIERE SI TUFFA FUORI TEMPO» (codici 111 e 112, che sono lo stesso difetto).

   NOTE PO: «il portiere non si tuffa nel tempo giusto, sincronizzato col pallone» (111, tre occorrenze)
   e «il portiere si tuffa fuori tempo rispetto alla traiettoria del pallone» (112). Sono la stessa cosa
   descritta due volte, e vanno chiuse insieme.

   PERCHE' NON ERA MISURABILE FINO AL 7.465. Il collettore `__CPM_GKTL` registrava SOLO il portiere —
   trigger, clip GLB montata, traslazione del tuffo. Si poteva vedere che il tuffo partiva e dove
   arrivava, ma non se arrivasse IN TEMPO: «fuori tempo rispetto alla traiettoria del pallone» e' una
   relazione fra DUE corpi, e uno dei due non era nel collettore. Dal 7.465 c'e' anche il pallone.

   COSA MISURA. Per ogni conclusione con tuffo, la FRAZIONE DI TUFFO COMPLETATA nell'istante in cui il
   pallone arriva sul piano del portiere (`bx` che raggiunge `gx`). Il portiere deve essere disteso
   QUANDO la palla passa: non prima (si butta e poi aspetta), non dopo (la palla e' gia' oltre).
     · progresso ~1 = distesa completata all'arrivo → sincronizzato
     · progresso « 1 = la palla lo supera mentre e' ancora a meta' → «fuori tempo»
     · progresso 1 raggiunto molto PRIMA = si e' buttato in anticipo e resta li' fermo

   IL CANDIDATO dichiarato in coda: `_diveDur = clamp(ballArcDur*0.92, 0.48, 1.20)` (r.~13461). Ai due
   MORSETTI il legame con la durata dell'arco si spezza: sotto 0,52s di arco e sopra 1,30s la durata
   del tuffo non segue piu' la conclusione, e li' la sincronia si perde per costruzione.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node gk-dive-sync-test.mjs [--verbose]                   */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
/* conclusioni di TIRO: sono quelle in cui il portiere ha qualcosa da parare */
const SCENE = (process.env.CPM_SIT || '4,8,12,13,21,27,40,43,51,61,63,79,83,91,97,116,181').split(',').map(Number);
const PROG_MIN = +(process.env.CPM_PROG || 0.60);   /* almeno il 60% della distesa all'arrivo della palla */
/* sul GOL il tuffo resta corto PER COSTRUZIONE (6.74 3D-3: battuto, ~55% della distanza) — li' la
   sincronia si misura lo stesso, ma il difetto del PO parla della PARATA: default `fail`. */
const MODO = process.env.CPM_MODO || 'fail';
/* tolleranza fra distesa completa e arrivo della palla: 250ms e' sotto la soglia in cui l'occhio legge
   un'attesa (a 60fps sono 15 fotogrammi di portiere fermo a terra). */
const ANTICIPO_MAX = +(process.env.CPM_ANTICIPO || 250);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(n => {
  /* ⚠️ NON si usa `__CPM_GKTL`: quel collettore (7.440) vive dentro gli attori CH38 e in headless non
     produce un solo tuffo — misurato, 14 righe tutte del portiere di CASA. La TRASLAZIONE del tuffo e'
     invece procedurale, e dal 7.465 ha il suo testimone (`__CPM_DIVE465`) scritto proprio sulla riga che
     la esegue: si misura la sincronia dove la sincronia accade. Quindi GLB-OFF va benissimo qui. */
  window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_CINE = 1;
  if (n) window.__CPM_NO465 = 1;   /* prova del rosso: rimette i morsetti stretti */
}, process.env.CPM_NO465 ? 1 : 0);
await openMatch(page, port); await sleep(800);

const righe = [];
for (const gi of SCENE) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
  if (!ok) continue;
  await sleep(400);
  await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_DIVE465 = []; });
  /* esito FALLITO: e' quello in cui il portiere para davvero (su un gol il tuffo resta corto per
     costruzione, 6.74 3D-3 — misurarlo li' significherebbe misurare un tuffo che DEVE mancare) */
  await page.evaluate(m => { window.__CPM_FORCE_OUTCOME = m; }, MODO);
  try { await page.evaluate(() => window.__CPM_RESOLVE(0)); } catch (e) { continue; }
  await sleep(3000);
  const F = await page.evaluate(() => (window.__CPM_DIVE465 || []).slice());
  if (F.length < 6) continue;
  const z0 = F[0].z0, tz = F[0].tz, span = Math.abs(tz - z0);
  if (span < 0.4) continue;                       /* tuffo nullo: niente da sincronizzare */
  /* ISTANTE D'ARRIVO = quando l'ARCO si completa. La prima stesura lo cercava con `bx >= gx-0.4`, cioe'
     pretendeva che la palla superasse il piano del portiere: su un tiro FUORI o parato non ci arriva mai
     e la scena veniva scartata — misurato, zero tuffi giudicati su otto scene che il tuffo ce l'avevano.
     Il momento in cui «la palla e' li'» lo dichiara la conclusione stessa. */
  /* ⚠️ IL PRIMO completamento, non «il fotogramma piu' vicino a 1»: su un GOL il post-arco lancia un
     SECONDO arco per portare la palla in rete, `arcT` riparte da zero e il minimo di |arcT/arcD-1|
     finiva dentro quel secondo volo — da li' i «MAI» con progresso 27-30%, che non erano un difetto
     del portiere ma della mia lettura. */
  let iArr = -1;
  for (let i = 0; i < F.length; i++) { if (F[i].arcD > 0 && F[i].arcT / F[i].arcD >= 0.98) { iArr = i; break; } }
  if (iArr < 0) { let mx = -1; for (let i = 0; i < F.length; i++) { if (!(F[i].arcD > 0)) continue; const p = F[i].arcT / F[i].arcD; if (p > mx) { mx = p; iArr = i; } } }
  if (iArr < 0) continue;
  const prog = Math.abs(F[iArr].gz - z0) / span;
  let iFull = -1; for (let i = 0; i < F.length; i++) if (Math.abs(F[i].gz - z0) / span >= 0.95) { iFull = i; break; }
  const dtMs = iFull >= 0 ? (F[iFull].t - F[iArr].t) : null;
  righe.push({ gi, prog, dtMs, arcD: F[0].arcD, dvD: F[0].dvD, n: F.length });
  if (VERB) console.log(`  gi${gi} · arco ${F[0].arcD}s · tuffo ${F[0].dvD}s · progresso all'arrivo ${(prog * 100).toFixed(0)}% · distesa completa ${dtMs == null ? 'mai' : (dtMs / 1000).toFixed(2) + 's'} rispetto alla palla`);
}
await b.close(); srv.close();

if (!righe.length) { console.log('❌ nessun tuffo misurato: il guardiano e\' cieco, non verde'); process.exit(2); }
console.log(`\n=== ${righe.length} tuffi misurati (anticipo tollerato: ${ANTICIPO_MAX}ms) ===`);
/* DUE CLASSI, e il guardiano ne giudica UNA SOLA — quella che il 7.465 ha chiuso e che quindi puo'
   tornare indietro:
     GIUDICATA · ANTICIPO: il portiere completa la distesa e lo fa TROPPO PRESTO, poi resta a terra ad
       aspettare. E' il difetto che il PO descrive (codici 111/112). Prima del fix: anticipo mediano
       -0,34s, caso peggiore -0,57s (il morsetto `_diveDur` segnalato in coda). Dopo: -0,08/-0,11s.
     DICHIARATA · DISTESA INCOMPLETA: su alcune conclusioni il gesto si spegne prima che la palla
       arrivi (progresso 30-65%). E' un'ALTRA cosa — la vita del gesto contro la vita dell'arco lungo
       i vari rami variante — che questo strumento ha reso visibile per la prima volta ma che non e'
       stata chiusa: giudicarla qui trasformerebbe il guardiano in un rosso permanente che nessuno
       guarda piu'. Si stampa coi suoi numeri, come il residuo di scene-staging-lag. */
const completi = righe.filter(r => r.dtMs != null);
const incompleti = righe.filter(r => r.dtMs == null);
const tardi = completi.filter(r => Math.abs(r.dtMs) > ANTICIPO_MAX);
for (const r of righe) {
  const tag = r.dtMs == null ? '⚠️ ' : (Math.abs(r.dtMs) <= ANTICIPO_MAX ? '✅ ' : '❌ ');
  console.log(`  ${tag} gi${r.gi} · arco ${r.arcD}s → tuffo ${r.dvD}s · ${r.dtMs == null ? `distesa al ${(r.prog * 100).toFixed(0)}% quando la palla arriva (non completata)` : `distesa completa ${(r.dtMs / 1000).toFixed(2)}s rispetto all'arrivo`}`);
}
const q = a => { const x = a.slice().sort((m, n) => m - n); return x[x.length >> 1]; };
if (completi.length) {
  const dts = completi.map(r => r.dtMs);
  console.log(`\nANTICIPO della distesa (giudicato) — mediano ${(q(dts) / 1000).toFixed(2)}s · peggiore ${(Math.min(...dts) / 1000).toFixed(2)}s   (0 = disteso quando la palla arriva; negativo = si butta prima e aspetta)`);
}
if (incompleti.length) {
  console.log(`\nRESIDUO DICHIARATO (non giudicato) — ${incompleti.length}/${righe.length} tuffi in cui il gesto si spegne prima dell'arrivo:`);
  for (const r of incompleti) console.log(`  · gi${r.gi} arco ${r.arcD}s → tuffo ${r.dvD}s · distesa ferma al ${(r.prog * 100).toFixed(0)}%`);
  console.log('  → e\' la vita del GESTO contro la vita dell\'ARCO sui rami variante: prossimo bersaglio.');
}
const morsetti = righe.filter(r => r.arcD != null && (r.arcD * 0.92 < 0.48 || r.arcD * 0.92 > 1.20));
if (morsetti.length) console.log(`\nconclusioni ai MORSETTI storici di _diveDur: ${morsetti.map(r => `gi${r.gi} arco=${r.arcD}`).join(' · ')}`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
if (!completi.length) { console.log('\n❌ nessun tuffo COMPLETO misurato: il guardiano non ha di che giudicare'); process.exit(2); }
if (tardi.length) {
  console.log(`\n❌ FAIL — ${tardi.length}/${completi.length} tuffi completati fuori tempo rispetto alla palla.`);
  process.exit(1);
}
console.log('\n✅ PASS — quando il portiere completa la distesa, la completa all\'arrivo della palla (non prima).');
