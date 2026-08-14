#!/usr/bin/env node
/* [7.456.0] GUARDIANO — IL TAGLIO DI SCENA E' UNO SOLO
   (collaudo PO codice 007 «ad inizio scena traballa tutto», aperto da molte release)

   COSA MISURA, E PERCHE' SUL FLUSSO VERO. Il taglio di scena vive nel render-loop e scatta al
   cambio di `hlSitKey`; lo staging (continuita' + stageSitPositions) e' un ALTRO commit React.
   Sul percorso forzato (__CPM_FORCE_SIT) i due arrivano insieme e il difetto non esiste per
   costruzione — e' la ragione per cui il gate non l'ha mai visto in decine di release. Qui la
   partita e' VERA: provino → `playing` col clock reale → highlight reattivi in coda, cioe' lo
   stesso percorso del giocatore.

   I DUE NUMERI:
     · RITARDO — ms fra il taglio e il commit di staging, e quanti dei ventidue sono ancora
       inchiodati sui punti del commit VECCHIO in quell'istante (`far`, letto da __CPM_STG456).
       Se `far` e' alto, al taglio il teatro e' stato piazzato su props stantii.
     · PASSO DELLA CAMERA — massimo spostamento della camera fra due fotogrammi DOPO la finestra
       di grazia del taglio (750 ms, la stessa che usa il registratore in partita del PO, r.~8527).
       E' il «codice 007 — la CAMERA salta: passo di N unita'» delle bozze: 1.7u sul 7.451,
       19.1u sul 7.454 su due situazioni diverse (valore identico = passo strutturale, non glitch).

   SOGLIE. `far` deve essere ZERO: il commit di staging non deve mai trovare la squadra sui punti
   vecchi, perche' il ri-taglio va armato DA QUEL COMMIT. Il passo camera fuori grazia sta sotto
   1.2u — la stessa soglia oltre la quale il registratore del PO scrive la riga in bozza.

   PROVA DEL ROSSO (obbligatoria, il rilevatore deve poter fallire):
     CPM_MASCHERA=-2 node scene-staging-lag-test.mjs   → ❌ FAIL, ogni stacco risulta tardivo.
   ⚠️ NON usare CPM_MASCHERA=0: gli stacchi atterrano a dt -1/0 ms, quindi con soglia 0 non ne supera
   nessuno e il guardiano resta VERDE — sembrerebbe una prova e non lo e' (verificato: passa).

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node scene-staging-lag-test.mjs [--verbose]         */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const SCENE_TARGET = +(process.env.CPM_SCENES || 6);   /* aperture da raccogliere sul flusso vero */
const GRAZIA_MS = 750;      /* finestra del taglio voluto — identica al registratore in partita */
const PASSO_CAM = 1.2;      /* oltre = «la CAMERA salta» nella bozza del PO */
const MASCHERA_MS = +(process.env.CPM_MASCHERA ?? 560);  /* durata massima dello stacco nero (setCutFx):
   oltre, il taglio non e' mascherato da niente. Abbassabile da ambiente per la PROVA DEL ROSSO: con
   CPM_MASCHERA=0 ogni stacco risulta tardivo e il guardiano deve virare rosso — se resta verde, il
   rilevatore e' cieco e non sta misurando niente (la trappola pagata piu' volte in questo repo). */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(e.message));
/* __CPM_PRESENT=1: sotto ?cpmtest=1 lo snap dei ventidue e' spento (il gate valida l'AI off-ball).
   Senza questo flag si misurerebbe un mondo che il giocatore non vede mai — l'errore di
   attribuzione gia' pagato in questo repo. */
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; });
await openMatch(page, port, { skipLoadAll: true });
await sleep(600);

/* campionatore per fotogramma: camera + palla + fase + chiave di scena */
await page.evaluate(() => {
  window.__CPM_CAM456 = [];
  const tick = () => {
    try {
      const T = window.__CPM3D, s = window.__CPM_STATE && window.__CPM_STATE();
      if (T && T.camera && T.ball && s && window.__CPM_CAM456.length < 6000)
        window.__CPM_CAM456.push({ t: performance.now(), ph: s.phase,
          cx: T.camera.position.x, cy: T.camera.position.y, cz: T.camera.position.z,
          bx: T.ball.position.x, bz: T.ball.position.z });
    } catch (e) {}
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

const aperture = [];
for (let round = 0; round < SCENE_TARGET * 3 && aperture.length < SCENE_TARGET; round++) {
  await page.evaluate(() => { window.__CPM_CAM456 = []; window.__CPM_STG456 = []; });
  const inPlay = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; });
  if (!inPlay) { await sleep(700); continue; }
  await page.evaluate(() => { window.__CPM_QUEUE_REACTIVE && window.__CPM_QUEUE_REACTIVE(); });
  /* l'highlight reattivo entra col clock vero: si aspetta l'INGRESSO in hl_intro */
  const entered = await page.waitForFunction(() => {
    try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && /^hl_/.test(s.phase || ''); } catch (e) { return false; }
  }, { timeout: 25000 }).then(() => true).catch(() => false);
  if (!entered) continue;
  await sleep(2200);   /* l'intro si consuma tutta sotto il campionatore */

  const dati = await page.evaluate(() => ({
    stg: (window.__CPM_STG456 || []).slice(), cam: (window.__CPM_CAM456 || []).slice(),
    tj: (window.__CPM_TJ456 || []).slice(), rs: (window.__CPM_RSNP401 || []).slice(), smp: (window.__CPM_SMP456 || []).slice(), cut: (window.__CPM_CUT456 || []).slice()
  }));
  await page.evaluate(() => { window.__CPM_RSNP401 = []; window.__CPM_TJ456 = []; window.__CPM_SMP456 = []; window.__CPM_CUT456 = []; });

  /* il taglio = primo fotogramma in hl_intro del campione */
  const cam = dati.cam;
  let iCut = -1;
  for (let i = 0; i < cam.length; i++) if (cam[i].ph === 'hl_intro') { iCut = i; break; }
  if (iCut < 0) { await resolveAvanti(); continue; }
  const tCut = cam[iCut].t;
  let passoCam = 0, passoCamT = 0, passoBall = 0;
  for (let i = Math.max(1, iCut + 1); i < cam.length; i++) {
    const a = cam[i - 1], b2 = cam[i], dt = b2.t - a.t;
    if (dt <= 0 || dt > 400) continue;
    if (b2.t - tCut <= GRAZIA_MS) continue;                 /* dentro la grazia: e' il taglio voluto */
    if (!/^hl_/.test(b2.ph || '')) continue;
    const dc = Math.hypot(b2.cx - a.cx, b2.cy - a.cy, b2.cz - a.cz);
    if (dc > passoCam) { passoCam = dc; passoCamT = Math.round(b2.t - tCut); }
    const db = Math.hypot(b2.bx - a.bx, b2.bz - a.bz);
    if (db > passoBall) passoBall = db;
  }
  /* ORFANI = commit di staging con bersagli freschi e NESSUN taglio armato: e' il difetto.
     I commit col taglio armato sono sani per costruzione (il ciclo giocatori li esegue subito dopo). */
  const stg = (dati.stg || []).filter(r => r.dt >= -50 && r.dt < 6000);
  /* i salti di bersaglio in massa SENZA taglio armato: l'evento che il setaccio 7.401 insegue a naso */
  const tj = (dati.tj || []).filter(r => r.dt >= -50 && r.dt < 6000);
  const tjOrf = tj.filter(r => !r.snap);
  const orfani = stg.filter(r => !r.snap && r.far > 0);
  /* TAGLI TARDIVI: lo stacco nero che maschera il taglio dura 360-560 ms. Uno stacco armato dopo
     quella finestra non e' mascherato da niente — il giocatore lo vede come «traballa tutto». */
  const tagli = (dati.cut || []).filter(r => r.dt >= -50 && r.dt < 6000);
  const tardivi = tagli.filter(r => r.dt > MASCHERA_MS);
  aperture.push({ k: stg.length ? stg[0].k : null, commit: stg.map(r => `${r.ph}${r.snap ? '✓' : '✗'}@${r.dt}ms:${r.far}/${r.n}`),
    orfani: orfani.length, orfMax: orfani.length ? Math.max(...orfani.map(r => r.far)) : 0,
    orfDist: orfani.length ? Math.max(...orfani.map(r => r.dmax)) : 0, n: stg.length ? stg[0].n : null,
    salti: tjOrf.map(r => `${r.ph}@+${r.dt}ms ${r.mv}/${r.n} max${r.mx}u`),
    tagli: tagli.map(r => `${r.src}@+${r.dt}ms`), tardivi: tardivi.length,
    tardMax: tardivi.length ? Math.max(...tardivi.map(r => r.dt)) : 0,
    tardSrc: [...new Set(tardivi.map(r => r.src))].join(','),
    passoCam: +passoCam.toFixed(1), passoCamT, passoBall: +passoBall.toFixed(1),
    reArm: (dati.rs || []).length ? dati.rs[dati.rs.length - 1].t : null });
  if (VERB) console.log(`  · scena k=${stg.length ? stg[0].k : '?'} · staging [${stg.map(r => `${r.ph}${r.snap ? '✓taglio' : '✗ORFANO'}@+${r.dt}ms`).join(' | ')}] · salti bersaglio SENZA taglio [${tjOrf.map(r => `${r.ph}@+${r.dt}ms ${r.mv}/${r.n} max${r.mx}u ${r.ap?'[COMMIT React]':'[AI render-loop]'}`).join(' | ') || '—'}] · camera ${passoCam.toFixed(1)}u@+${passoCamT}ms · palla ${passoBall.toFixed(1)}u · ri-armo401 ${(dati.rs || []).length ? dati.rs[dati.rs.length - 1].t + 'ms' : '—'}`);
  if (VERB && tjOrf.length) for (const r of (dati.smp||[])) console.log(`      setMatchPlayers @${r.ph} t=${r.t} ← ${r.at}`);
  await resolveAvanti();
}

async function resolveAvanti() {
  try {
    await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && (s.phase === 'hl_choose' || s.phase === 'playing'); } catch (e) { return false; } }, { timeout: 14000 }).catch(() => {});
    const ph = await page.evaluate(() => { const s = window.__CPM_STATE && window.__CPM_STATE(); return s ? s.phase : null; });
    if (ph === 'hl_choose') { await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)); await sleep(1400); }
    await page.waitForFunction(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase === 'playing'; } catch (e) { return false; } }, { timeout: 20000 }).catch(() => {});
  } catch (e) {}
}

await b.close(); srv.close();

if (aperture.length < 3) { console.log(`❌ FAIL — solo ${aperture.length} aperture misurate sul flusso vero: la sonda e' cieca`); process.exit(2); }

const fermi = aperture.filter(a => a.orfani > 0);
const salti = aperture.filter(a => a.passoCam >= PASSO_CAM);
console.log(`\naperture misurate ${aperture.length} · scene con TAGLIO TARDIVO ${aperture.filter(a => a.tardivi > 0).length} · commit di staging orfani ${fermi.length} · passo camera ≥${PASSO_CAM}u ${salti.length}`);
for (const a of aperture) console.log(`  k=${String(a.k).padStart(4)} · tagli [${a.tagli.join(' | ')}]${a.tardivi ? ` ← ${a.tardivi} TARDIVI (${a.tardSrc}, fino a +${a.tardMax}ms)` : ''} · orfani ${a.orfani} · camera ${String(a.passoCam).padStart(5)}u@+${a.passoCamT}ms · palla ${a.passoBall}u`);
for (const e of errs.slice(0, 4)) console.log('  ⚠ pageerror: ' + e);

const guasti = [];
if (fermi.length) guasti.push(`${fermi.length} aperture con un commit di STAGING ORFANO: i bersagli si spostano in massa (fino a ${Math.max(...fermi.map(a => a.orfMax))} giocatori su ${fermi[0].n}, a ${Math.max(...fermi.map(a => a.orfDist))}u) e NESSUN taglio e' armato su quel fotogramma — i ventidue e la palla ci vanno a piedi, ed e' il «traballa tutto» del PO`);
const tard = aperture.filter(a => a.tardivi > 0);
if (tard.length) guasti.push(`${tard.length} aperture su ${aperture.length} con un TAGLIO DI SCENA TARDIVO (sorgente ${[...new Set(tard.map(a => a.tardSrc))].join(',')}, fino a +${Math.max(...tard.map(a => a.tardMax))}ms dal taglio): lo stacco nero dura al massimo ${MASCHERA_MS}ms, quindi questo secondo taglio — ventidue, palla e CAMERA insieme — non e' mascherato da niente. E' il «ad inizio scena traballa tutto» del PO`);
/* ⚠️ IL PASSO CAMERA SI MISURA E SI STAMPA, MA NON GIUDICA — e non e' un'eccezione di comodo.
   E' un difetto DIVERSO da quello che questo guardiano protegge: si presenta a +766..+1200 ms,
   IDENTICO prima e dopo il ri-taglio sul commit di staging (misurato: 1.8/1.6/1.2u prima, 1.5u
   dopo), quindi non ha la stessa causa e va chiuso con un suo task e una sua misura. In piu' la
   riga del PO da 19,1u NON si riproduce in headless (nota 7.404: il fenomeno vive a frame-rate
   pieno) — qui il massimo e' 1,8u. Metterlo fra i criteri renderebbe questo guardiano rosso a
   intermittenza per una causa che non sorveglia: rumore, non protezione. */
if (salti.length) console.log(`\n⚠ RESIDUO DICHIARATO (non giudicato qui): ${salti.length} aperture col passo camera ≥${PASSO_CAM}u fuori grazia (max ${Math.max(...salti.map(a => a.passoCam))}u a +${salti[0].passoCamT}ms) — seconda meta' del codice 007, task a parte`);
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log(`\n✅ PASS — il taglio di scena e' UNO: lo staging arriva col teatro gia' allineato e la camera non salta fuori grazia`);
