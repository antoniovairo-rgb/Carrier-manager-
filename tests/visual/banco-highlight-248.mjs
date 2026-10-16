#!/usr/bin/env node
/* BANCO UNICO DEGLI HIGHLIGHT DELL'EROE — PO-248 (direttiva PO 14/10: «Puntiamo molto alla fluidità, credibilità degli
   highlights dell'eroe a tutto tondo!»). STRUMENTO DI MISURA, NON GUARDIANO DI GATE: non corregge niente e non tocca src/.

   PERCHE' UN BANCO SOLO. Le sonde esistenti misurano un pezzo ciascuna, su pagine e configurazioni diverse (molte GLB spento):
   hero-framing-census (taglia e fuori quadro, 191 scene sulla STESSA pagina → «pagina stanca», 7.483), hero-in-frame-test
   (fuori quadro difensivo, pagina nuova), gk-dive-sync-test (tuffo sulle parate), gk-miss-229 (portiere sui tiri sbagliati),
   esiti-218 (riquadro ↔ motore su partite vere). Qui si leggono gli STESSI testimoni del gioco — nessun testimone nuovo — tutti
   insieme, GLB ACCESO (direttiva PO 29/07: le verifiche percettive si fanno col CH38), per famiglia di highlight e per esito.

   TESTIMONI LETTI (tutti gia' nel gioco, test-only):
     __CPM_FRAME480  altezza apparente dell'eroe, fotogrammi fuori quadro, prime 12 letture (apertura)      src/12 ~r.10817
     __CPM_GK229     portiere e pallone fotogramma per fotogramma in TEMPO DI SCENA (ck)                       src/12 ~r.7311
     __CPM_PIEDI     pattinamento dei piedi (definizione OmniControl: piede a terra che scorre > 0,5 m/s)       src/12 ~r.10353
     __CPM_GST       stato del gesto GLB dell'eroe (clip, peso, tempo clip)                                    src/12 ~r.10541
     __CPM_BJ478     salti del pallone ≥ 6u con la sorgente e la maschera dello stacco nero                     src/12 ~r.10904
     __CPM_REA519    reazioni del reparto avversario (tiro/testa/cross)                                         src/12 ~r.5278
     __CPM_ORF516    fotogrammi di gesto orfano (avatar fuori dal ramo gesti con peso > 0,5)                    src/12 ~r.10472
     __CPM_RES218    riquadro d'esito ↔ eventi del motore per ogni azione risolta                               src/15 ~r.9036
     __CPM_OWN / __CPM_STATE / __CPM_PROBE / __CPM_CUTLIVE  (pallone e corpi dalle mesh, stacco nero vivo)
   Il solo pezzo nuovo e' un CAMPIONATORE in pagina (requestAnimationFrame, `__B248`): a ogni fotogramma del browser annota il
   tempo REALE, il tempo di SCENA (ck dell'ultimo campione __CPM_GK229), la fase, lo stacco nero vivo, eroe/pallone/camera dalle
   mesh e il gesto GLB. Ogni confronto fra due campioni porta il suo tempo (lezione 7.360/7.478/7.502: senza, si misura
   velocita' x intervallo).

   ⚠️ LIMITI DICHIARATI (si ripetono nel rapporto):
     · headless con GL software: GLB acceso, fps bassi; il tempo di scena e' tappato a 0,05 s per fotogramma (src/12, _rdt) →
       la FLUIDITA' vera (fotogrammi lunghi, scatti) la giudica il telefono del PO. Qui i tempi reali si stampano, ma i difetti
       di fluidita' si giudicano in TEMPO DI SCENA (spostamento / dt di scena), che non dipende dal frame-rate.
     · pagina nuova ogni CPM_PER_PAGINA esecuzioni (default 4): mai 191 scene sulla stessa pagina (7.483).
     · `__CPM_FORCE_KIND` cambia 3D e motore ma NON il riquadro (il riquadro nasce a src/15 ~r.8994, il gancio vale da ~r.9168):
       sulle esecuzioni a esito FORZATO la coerenza riquadro↔3D NON si giudica (sarebbe lo strumento). Si giudica solo sulle
       esecuzioni a esito NATURALE (successo / fallimento senza tipo forzato).

   USO (dalla cartella tests/visual):
     CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node banco-highlight-248.mjs <famiglia>
       famiglie: tiro testa volee cross passaggio dribbling contrasto rigore punizione difesa  (oppure CPM_GRUPPO=…)
     node banco-highlight-248.mjs rapporto     → aggrega out/banco-248/*.json in tabella; esce ≠0 se una famiglia e' cieca
     CPM_SCENE=n (scene per famiglia) · CPM_PER_PAGINA=n · CPM_SCENA_S=4 (secondi di SCENA osservati dopo la scelta) · --verbose
   USCITA: 0 misura valida · 2 cieca (sotto la copertura minima della famiglia) · 3 errore d'uso.                          */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, __dirname as LIBDIR } from './lib/harness.mjs';

const OUT = path.join(LIBDIR, '..', 'out', 'banco-248');
const FAMIGLIE = ['tiro', 'testa', 'volee', 'cross', 'passaggio', 'dribbling', 'contrasto', 'rigore', 'punizione', 'difesa'];
const TIRO_LIKE = new Set(['tiro', 'testa', 'volee', 'rigore', 'punizione']);
const VERB = process.argv.includes('--verbose');
const ARG = (process.argv.slice(2).find(a => !a.startsWith('--')) || process.env.CPM_GRUPPO || '').toLowerCase();

/* ── SOGLIE, dichiarate PRIMA di misurare e giustificate (si ristampano nel rapporto) ─────────────────────────────────────── */
const S = {
  FR_LUNGO: 50,      // ms reali: sotto 20 fps il movimento si legge a scatti (telefono di fascia media: 30-60 fps)
  FR_PICCO: 100,     // ms reali: un fotogramma da 1/10 s e' un «inciampo» visibile a chiunque
  V_EROE: 20,        // u/s di scena: cap del modello di movimento 15 u/s (5.47.9) + margine per affondi/tuffi dei gesti
  D_EROE: 1.0,       // u: sotto, uno spostamento non si vede come salto anche se veloce
  V_PALLA: 60,       // u/s di scena: un tiro di potenza vero sta a ~30 m/s; oltre il doppio e' un riposizionamento
  D_PALLA: 3.0,      // u
  V_CAM: 60,         // u/s di scena: oltre, la camera «salta» (il check post-highlight usa 30u fra due campioni a 110 ms)
  D_CAM: 2.5,        // u: la soglia del testimone __CPM_CAMSTEP93
  DW: 0.5,           // peso clip che cambia di oltre meta' in UN passo di scena (≤ 0,05 s) = dissolvenza sotto 0,1 s → scatto
  FERMO_Q: 0.8,      // quota dei fotogrammi d'esito con eroe immobile E senza gesto oltre la quale l'eroe e' «congelato»
  SKATE: 0.10,       // quota di fotogrammi col piede a terra che scivola: in letteratura (OmniControl, ICLR 2024) i metodi buoni
                     // stanno a 0,05-0,10; oltre 0,10 il pattinamento si vede
  APERTURA_D: 3.0,   // u logiche: pallone a piu' di 3u dal corpo piu' vicino all'apertura = «ai piedi di nessuno» (001)
  POS_D: 3.0,        // u logiche: eroe a piu' di 3u dal suo posto logico all'apertura = «non in posizione» (002)
  H_FIGURINA: 0.08,  // altezza apparente (frazione del quadro): sotto 0,08 e' una figurina (censimento 7.480). NON 0,15: il PO ha
                     // bocciato la regia stretta sul telefono (7.509, «zoom troppo stretto») e oggi la mediana voluta sta a ~0,14
  FUORI_Q: 0.30,     // quota di fotogrammi della conclusione con l'eroe fuori quadro oltre la quale il gesto «non si vede»
  GK_TARDI: 0.05,    // s di scena: corpo del portiere che parte oltre 0,05 s DOPO il passaggio del pallone sul suo piano (gk-miss-229)
  GK_REAZ: 0.20,     // s di scena: pallone sul portiere prima di 0,20 s dal calcio = bruciapelo, non si giudica (gk-miss-229)
  GK_PORTATA: 4.5,   // u: distanza laterale entro cui un tuffo arriva al pallone (morsetto ±4,5 dei siti del tuffo)
  COPERTURA: 2,      // esecuzioni GIUDICATE minime per famiglia: sotto, la famiglia e' cieca e il banco esce 2
};
const GLX = 48.6, PALO = 3.35; // linea di porta (src/12 r.536) e mezza luce della porta: «in rete» pretende anche i pali (7.478)

function famigliaDi(sit, a) {
  const l = String(a.l || '').toLowerCase();
  if (a.t === 'penalty') return 'rigore';
  if (a.t === 'freekick') return 'punizione';
  if (sit.type === 'def') return /contrast|scivolat|tackle|raddoppi|fallo|pressing|corpo|blocc|chiusura/.test(l) ? 'contrasto' : 'difesa';
  if (a.t === 'header') return 'testa';
  if (a.t === 'shot') return a.v === 'shot_volley' ? 'volee' : 'tiro';
  if (a.t === 'cross') return 'cross';
  if (a.t === 'dribble' || ((a.t === 'pass' || a.t === 'build') && /dribbl|finta|sterzat|spunto|conduc|tunnel/.test(l))) return 'dribbling';
  if (a.t === 'pass' || a.t === 'build') return 'passaggio';
  return null;
}
/* Esiti per famiglia. «nat» = esito NATURALE del gioco (solo successo/fallimento forzati, il tipo lo decide il motore): su queste
   si giudica la coerenza riquadro↔3D↔motore. «kind» = tipo forzato: solo portiere, 3D e fluidita'. */
function esitiDi(fam) {
  if (TIRO_LIKE.has(fam)) return [{ id: 'gol', out: 'success', rew: 'goal' }, { id: 'sbaglia', out: 'fail' }, { id: 'parata', out: 'fail', kind: 'saved' }, { id: 'fuori', out: 'fail', kind: 'wide' }, { id: 'murata', out: 'fail', kind: 'blocked' }];
  if (fam === 'cross' || fam === 'passaggio') return [{ id: 'riesce', out: 'success' }, { id: 'sbaglia', out: 'fail' }, { id: 'intercetto', out: 'fail', kind: 'intercepted' }];
  return [{ id: 'riesce', out: 'success' }, { id: 'sbaglia', out: 'fail' }];
}

/* ════════════════════════════════════ RAPPORTO (aggregazione) ════════════════════════════════════ */
if (ARG === 'rapporto') { rapporto(); process.exit(process.exitCode || 0); }
if (!FAMIGLIE.includes(ARG)) { console.log(`uso: node banco-highlight-248.mjs <${FAMIGLIE.join('|')}|rapporto>`); process.exit(3); }

/* ════════════════════════════════════ MISURA di una famiglia ════════════════════════════════════ */
const T0 = Date.now();
const SCENE_N = +(process.env.CPM_SCENE || (TIRO_LIKE.has(ARG) ? 3 : 4)); // tarato sul tetto di 10 minuti per gruppo (misurato: ~25 s a esecuzione, ~40 s a pagina)
const PER_PAGINA = Math.max(1, +(process.env.CPM_PER_PAGINA || 4));
const SCENA_S = +(process.env.CPM_SCENA_S || 4);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();

const INIT = () => {
  window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_CINE = 1;
  window.__CPM_PIEDI_REC = 1; window.__CPM_REC229 = 1;
  window.__CPM_CAMSTEP93ON = 1; // passi di camera > 2,5u con snap/taglio di scena dichiarati (PO-144)
  if (window.__CPM_CAMJ42_ON) window.__CPM_CAMJ42 = [];
  window.__CPM_BJMIN = 3; // il varco del 7.478 attribuisce gia' da 3u (default 6): serve a dare un NOME allo scrittore dei salti misurati qui
  window.__B248 = { on: false, fr: [] };
  const loop = () => {
    try {
      const B = window.__B248;
      if (B.on && B.fr.length < 5000) {
        const p = window.__CPM_PROBE && window.__CPM_PROBE();
        const g = window.__CPM_GST;
        B.fr.push({
          t: performance.now(), ck: typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null,
          cut: window.__CPM_CUTLIVE ? !!window.__CPM_CUTLIVE() : false,
          h: p && p.hero ? [p.hero.world.x, p.hero.world.y, p.hero.world.z, p.hero.onScreen ? 1 : 0] : null,
          b: p && p.ball ? [p.ball.world.x, p.ball.world.y, p.ball.world.z] : null,
          c: p && p.camera ? [p.camera.x, p.camera.y, p.camera.z] : null,
          g: g ? [g.cur || null, g.w == null ? null : g.w, g.ct == null ? null : g.ct] : null,
        });
      }
    } catch (e) {}
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};

async function nuovaPagina() {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page._errs = []; page.on('pageerror', e => page._errs.push(String(e.message).slice(0, 140)));
  if (process.env.CPM_CAMJ42) await page.addInitScript(() => { window.__CPM_CAMJ42_ON = 1; });
  await page.addInitScript(INIT);
  await openMatch(page, port);
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
  page._glb = await page.evaluate(() => ({ ready: window.__CPM_GLB_READY === true, fail: window.__CPM_GLB_FAIL || null }));
  await sleep(600);
  return page;
}

/* catalogo: famiglia di ogni azione di ogni scena, da deriveHL (la stessa funzione che decide tipo e variante dell'highlight) */
let page = await nuovaPagina();
const TOTALE = await page.evaluate(() => SITUATIONS.length);
const catalogo = await page.evaluate(() => SITUATIONS.map((s, gi) => ({ gi, type: s.type, acts: (s.actions || []).map((a, k) => { let h = {}; try { h = deriveHL(s, a) || {}; } catch (e) {} return { k, l: a.label, rew: a.rew, t: h.type || null, v: h.variant || null }; }) })));
const candidati = [];
for (const s of catalogo) { const azs = s.acts.filter(a => famigliaDi(s, a) === ARG); if (azs.length) candidati.push({ gi: s.gi, azs }); }
const scelte = [];
for (let i = 0; i < Math.min(SCENE_N, candidati.length); i++) scelte.push(candidati[Math.floor(i * candidati.length / Math.min(SCENE_N, candidati.length))]);
console.log(`[${ARG}] ${candidati.length} scene candidate nel repertorio · misurate: ${scelte.map(c => 'gi' + c.gi).join(', ')} · GLB ${page._glb.ready ? 'acceso' : 'NON PRONTO ' + (page._glb.fail || '')}`);

const esecuzioni = [];
for (const sc of scelte) for (const e of esitiDi(ARG)) {
  let az = sc.azs[0];
  if (e.rew) { az = sc.azs.find(a => a.rew === e.rew); if (!az) { esecuzioni.push({ gi: sc.gi, esito: e.id, saltata: 'nessuna azione con ricompensa ' + e.rew }); continue; } }
  esecuzioni.push({ gi: sc.gi, k: az.k, label: az.l, e });
}

const righe = [];
let usate = 0;
for (const ex of esecuzioni) {
  if (ex.saltata) { righe.push(ex); continue; }
  if (usate >= PER_PAGINA) { await page.close().catch(() => {}); page = await nuovaPagina(); usate = 0; }
  usate++;
  const t = Date.now();
  let r;
  try { r = await esegui(page, ex); } catch (err) { r = { gi: ex.gi, esito: ex.e.id, errore: String(err.message || err).slice(0, 160) }; }
  r.pagina = usate; r.realeMs = Date.now() - t; r.glb = page._glb.ready;
  righe.push(r);
  if (VERB) console.log('  ', JSON.stringify(sintesiBreve(r)));
  else console.log(`  gi${ex.gi} ${ex.e.id.padEnd(10)} ${r.errore ? '⚠ ' + r.errore : (r.giudicata ? 'misurata' : 'NON giudicata: ' + r.nonGiud)} · ${(r.realeMs / 1000).toFixed(0)}s`);
}
const errsPag = page._errs.slice(0, 5);
await page.close().catch(() => {}); await b.close(); srv.close();

const giudicate = righe.filter(r => r.giudicata);
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, `${ARG}.json`), JSON.stringify({ famiglia: ARG, quando: new Date().toISOString(), durataS: Math.round((Date.now() - T0) / 1000), soglie: S, candidati: candidati.length, scene: scelte.map(c => c.gi), righe, errori: errsPag }, null, 1));
stampaFamiglia(ARG, righe);
console.log(`\n[${ARG}] ${giudicate.length}/${righe.length} esecuzioni giudicate · ${Math.round((Date.now() - T0) / 1000)} s · → out/banco-248/${ARG}.json`);
if (giudicate.length < S.COPERTURA) { console.log(`❌ BANCO CIECO su «${ARG}»: ${giudicate.length} esecuzioni giudicate, minimo ${S.COPERTURA}`); process.exit(2); }
process.exit(0);

/* ───────────────────────────── una esecuzione: apertura → scelta → conclusione ───────────────────────────── */
async function esegui(page, ex) {
  const { gi, k, e } = ex;
  await page.evaluate(() => { window.__CPM_FORCE_INTRO = 1; delete window.__CPM_FORCE_KIND; delete window.__CPM_FORCE_OUTCOME; window.__CPM_FROZEN = false; window.__CPM_FRAME480 = null; });
  /* APERTURA (001/002). Prima si forza una scena-ESCA diversa: ripetere la stessa scena la troverebbe gia' schierata (misurato
     nella prima prova: 3,3u sulla prima esecuzione della pagina, 0 su tutte le ripetizioni — era lo strumento). Poi pallone e
     corpi dalle mesh, sulla stessa sorgente (7.322/7.538), nella finestra di SCENA [0,3 ; 1,0] s dall'ingresso. */
  const scena = () => page.evaluate(() => window.__CPM_SCENET || 0).catch(() => 0);
  const attendiScena = async (ds, capMs) => { const s0 = await scena(); const t0 = Date.now(); while (Date.now() - t0 < capMs) { if ((await scena()) - s0 >= ds) break; await sleep(80); } };
  const esca = (gi + 61) % TOTALE;
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), esca).catch(() => false);
  await attendiScena(0.6, 8000);
  const ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => false);
  if (!ok) return { gi, esito: e.id, nonGiud: 'forzatura fallita' };
  const sA = await scena();
  const ap = []; const tA = Date.now();
  while (Date.now() - tA < 12000) {
    const o = await page.evaluate(() => ({ o: window.__CPM_OWN && window.__CPM_OWN(), s: window.__CPM_SCENET || 0 })).catch(() => null);
    if (o && o.o) { const ds = o.s - sA; if (ds >= 0.3 && ds <= 1.0) ap.push(o.o); if (ds > 1.0) break; }
    await sleep(60);
  }
  const st0 = await page.evaluate(() => window.__CPM_STATE()).catch(() => null);
  const f0 = await page.evaluate(() => { const o = window.__CPM_FRAME480; return o ? { a12: o.a12 || 0, afuori: o.afuori || 0, abfuori: o.abfuori || 0, n: o.n } : null; }).catch(() => null);
  const apertura = {
    nCampioni: ap.length,
    dPalla: ap.length ? +median(ap.map(o => o.d)).toFixed(2) : null,
    dPallaMax: ap.length ? +Math.max(...ap.map(o => o.d)).toFixed(2) : null,
    dEroe: st0 && st0.hero && st0.heroTarget && st0.heroTarget.x != null ? +Math.hypot(st0.hero.x - st0.heroTarget.x, st0.hero.y - st0.heroTarget.y).toFixed(2) : null,
    eroeFuori12: f0 && f0.a12 ? +(f0.afuori / f0.a12).toFixed(2) : null,
    pallaFuori12: f0 && f0.a12 ? +(f0.abfuori / f0.a12).toFixed(2) : null,
  };
  /* CONCLUSIONE: si azzerano i testimoni e si risolve. */
  await page.evaluate(([o, kd]) => {
    window.__CPM_FORCE_OUTCOME = o; if (kd) window.__CPM_FORCE_KIND = kd; else delete window.__CPM_FORCE_KIND;
    window.__CPM_FRAME480 = null; window.__CPM_GK229 = []; window.__CPM_BJ478 = []; window.__CPM_REA519 = []; window.__CPM_ORF516 = []; window.__CPM_CAMSTEP93 = [];
    window.__CPM_PIEDI = null; if (window.__CPM_CAMJ42) window.__CPM_CAMJ42 = []; window.__B248.fr = []; window.__B248.on = true; window.__B248_RES0 = (window.__CPM_RES218 || []).length;
  }, [e.out, e.kind || null]);
  const okR = await page.evaluate(kk => window.__CPM_RESOLVE(kk), k).catch(() => false);
  if (!okR) return { gi, esito: e.id, nonGiud: 'risoluzione fallita' };
  /* si osservano SCENA_S secondi di TEMPO DI SCENA (ck), non un tempo reale fisso: a fps bassi il reale non dice dove e' la scena
     (lezione 7.460). Tetto reale 45 s. */
  const tR = Date.now(); let ck0 = null, ckU = 0;
  while (Date.now() - tR < 45000) {
    await sleep(400);
    const c = await page.evaluate(() => (typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null)).catch(() => null);
    if (c != null) { if (ck0 == null) ck0 = c; ckU = c - ck0; if (ckU >= SCENA_S) break; }
  }
  const dati = await page.evaluate(() => ({
    fr: window.__B248.fr.slice(), gk: (window.__CPM_GK229 || []).slice(), f480: window.__CPM_FRAME480 || null, piedi: window.__CPM_PIEDI || null,
    bj: (window.__CPM_BJ478 || []).slice(), cam93: (window.__CPM_CAMSTEP93 || []).slice(), rea: (window.__CPM_REA519 || []).slice(), orf: (window.__CPM_ORF516 || []).length,
    res: (window.__CPM_RES218 || []).slice(window.__B248_RES0 || 0), out: (function () { const o = window.__CPM_OUTCOME; return o ? { text: o.text || null, ok: o.ok, outKey: o.outKey || null, overlay: o.overlay || null, outKind: o.outKind || null, wood: o.woodwork || null } : null; })(), act: (window.__CPM_STATE() || {}).act || null, fps: window.__CPM_FPS708 || null,
  }));
  /* [giro 42] attribuzione dei passi di camera (> 2,5u) alle mani del fotogramma, testimone __CPM_CAMJ42 (CPM_CAMJ42=1) */
  if (process.env.CPM_CAMJ42) { const j = await page.evaluate(() => window.__CPM_CAMJ42 || []); for (let i = 1; i < j.length; i++) { const a = j[i - 1], z = j[i]; const d = Math.hypot(z.p[0] - a.p[0], z.p[1] - a.p[1], z.p[2] - a.p[2]); const dT = Math.hypot(z.t[0] - a.t[0], z.t[2] - a.t[2]); if (dT > 15) console.log(`  [cam42-T] gi${gi} ${e.id} bersaglio ${dT.toFixed(1)}u sc ${a.sc}→${z.sc} ph ${z.ph}\n     prima: ${a.tr}\n     dopo:  ${z.tr}`); if (d > 2.5) console.log(`  [cam42] gi${gi} ${e.id} passo ${d.toFixed(2)}u sc ${a.sc}→${z.sc} ph ${z.ph} mani[${z.h}] prima[${a.h}] cs ${z.cs} sc2 ${z.sc2} bersaglio ${a.t}→${z.t} pos ${a.p}→${z.p}`); } }
  await page.evaluate(() => { window.__B248.on = false; });
  return analizza({ gi, k, label: ex.label, e, apertura, dati, ckOss: +ckU.toFixed(2) });
}

/* ───────────────────────────── analisi di una esecuzione ───────────────────────────── */
function analizza({ gi, k, label, e, apertura, dati, ckOss }) {
  const base = { gi, k, label, esito: e.id, forzato: e.kind || null, apertura, ckOss };
  const F = dati.fr.filter(f => f.ck != null);
  if (F.length < 10) return { ...base, nonGiud: `solo ${F.length} fotogrammi campionati col tempo di scena` };
  /* tempi reali dei fotogrammi del browser */
  const dtR = []; for (let i = 1; i < dati.fr.length; i++) dtR.push(dati.fr[i].t - dati.fr[i - 1].t);
  const tempi = { n: dtR.length, med: +median(dtR).toFixed(1), p95: +quant(dtR, 0.95).toFixed(1), max: +Math.max(...dtR).toFixed(1), lunghi: +(dtR.filter(x => x > S.FR_LUNGO).length / dtR.length).toFixed(3), picchi: dtR.filter(x => x > S.FR_PICCO).length, fps708: dati.fps ? +dati.fps.toFixed(1) : null };
  /* coppie consecutive con avanzamento di scena: il tempo nel campione, gli stacchi neri voluti scartati */
  /* Un SALTO e' un passo ISOLATO: oltre la soglia di distanza e di velocita' di scena E oltre 2,5 volte il piu' grande dei due passi
     vicini. Senza il confronto coi vicini un volo veloce ma continuo (5-6 passi uguali di fila) passava per teletrasporto: e'
     successo alla prima stesura sui colpi di testa (3,1-3,5u a passo per sei passi). La velocita' sostenuta si misura a parte
     (vPallaMax, arco). Le coppie dentro uno stacco nero vivo (__CPM_CUTLIVE) si scartano: e' regia voluta (7.471/7.504). */
  const passi = [];
  let scartateCut = 0, pesoSalti = 0, clipSecche = 0;
  for (let i = 1; i < F.length; i++) {
    const a = F[i - 1], c = F[i]; const ds = c.ck - a.ck; if (!(ds > 0)) continue;
    if (a.cut || c.cut) { scartateCut++; passi.push(null); continue; }
    const dist = (u, v, y) => (u && v) ? Math.hypot(v[0] - u[0], y ? v[1] - u[1] : 0, v[2] - u[2]) : null;
    passi.push({ ds, ph: c.ph, h: dist(a.h, c.h, false), b: dist(a.b, c.b, true), c: dist(a.c, c.c, true) });
    if (a.g && c.g && ds <= 0.051) {
      if (a.g[0] === c.g[0] && a.g[1] != null && c.g[1] != null && Math.abs(c.g[1] - a.g[1]) > S.DW) pesoSalti++;
      if (a.g[0] && c.g[0] && a.g[0] !== c.g[0] && (a.g[1] || 0) > 0.5 && (c.g[1] || 0) > 0.5) clipSecche++;
    }
  }
  const coppie = passi.filter(Boolean).length;
  const esempi = []; const vMax = { h: 0, b: 0, c: 0 }; const salti = { h: 0, b: 0, c: 0 };
  const SOG = { h: [S.D_EROE, S.V_EROE, 'eroe'], b: [S.D_PALLA, S.V_PALLA, 'palla'], c: [S.D_CAM, S.V_CAM, 'camera'] };
  for (let i = 0; i < passi.length; i++) {
    const p = passi[i]; if (!p) continue;
    for (const key of ['h', 'b', 'c']) {
      const d = p[key]; if (d == null) continue; const v = d / p.ds; if (v > vMax[key]) vMax[key] = v;
      const [D, V, nome] = SOG[key];
      const vic = Math.max(passi[i - 1] && passi[i - 1][key] != null ? passi[i - 1][key] : 0, passi[i + 1] && passi[i + 1][key] != null ? passi[i + 1][key] : 0);
      if (d > D && v > V && d > 2.5 * vic) { salti[key]++; if (esempi.length < 6) esempi.push(`${nome} ${d.toFixed(1)}u in ${p.ds.toFixed(3)}s (vicini ≤ ${vic.toFixed(1)}u, ${p.ph})`); }
    }
  }
  const eroeSalti = salti.h, pallaSalti = salti.b, camSalti = salti.c, vEroeMax = vMax.h, vPallaMax = vMax.b, vCamMax = vMax.c;
  /* eroe congelato: nei primi 2 s di scena dopo la scelta, quota di fotogrammi con eroe immobile e nessun gesto montato */
  const ck0 = F[0].ck; const R2 = F.filter(f => f.ck - ck0 <= 2.0);
  let fermi = 0, nR2 = 0; for (let i = 1; i < R2.length; i++) { const a = R2[i - 1], c = R2[i]; if (!(c.ck > a.ck) || !a.h || !c.h) continue; nR2++; const mv = Math.hypot(c.h[0] - a.h[0], c.h[2] - a.h[2]) > 0.005; const gesto = c.g && c.g[0] && (c.g[1] || 0) > 0.1; if (!mv && !gesto) fermi++; }
  const gestoMontato = F.some(f => f.g && f.g[0] && (f.g[1] || 0) > 0.3);
  const clips = [...new Set(F.filter(f => f.g && f.g[0] && (f.g[1] || 0) > 0.3).map(f => f.g[0]))];
  const bjVivi = dati.bj.filter(x => !x.mask && !x.nascosto && /^hl_/.test(String(x.ph || '')) && x.d >= 6).length; // >= 6: la soglia storica del varco
  const camSrc = (dati.cam93 || []).filter(x => /^hl_/.test(String(x.ph || '')) && !x.cut).map(x => `${x.st}u${x.snap ? ' snap' : ''}${x.sc ? ' cambio-scena' : ''}`).slice(0, 8);
  const bjSrc = dati.bj.filter(x => !x.mask && !x.nascosto && /^hl_/.test(String(x.ph || ''))).map(x => `${x.src}${x.tutti ? '[' + x.tutti + ']' : ''}:${x.d}`).slice(0, 8);
  const pd = dati.piedi;
  const piedi = pd ? { fr: pd.hl ? pd.hl.fr : 0, cont: pd.hl ? pd.hl.cont : 0, sk: pd.hl ? pd.hl.sk : 0, eroeFr: pd.perCorpo && pd.perCorpo[0] ? pd.perCorpo[0].fr : 0, eroeSk: pd.perCorpo && pd.perCorpo[0] ? pd.perCorpo[0].sk : 0, senzaOssa: pd.senzaOssa || 0 } : null;
  const fluid = {
    tempi, coppie, scartateCut, bjSrc, camSrc, eroeSalti, pallaSalti, camSalti, pesoSalti, clipSecche, bjVivi,
    vEroeMax: +vEroeMax.toFixed(1), vPallaMax: +vPallaMax.toFixed(1), vCamMax: +vCamMax.toFixed(1),
    fermoQ: nR2 ? +(fermi / nR2).toFixed(2) : null, gestoMontato, clips,
    skateHl: piedi && piedi.cont ? +(piedi.sk / piedi.cont).toFixed(3) : null,
    skateEroe: piedi && piedi.eroeFr ? +(piedi.eroeSk / piedi.eroeFr).toFixed(3) : null, esempi,
  };
  /* ─ CREDIBILITA' ─ */
  const G = dati.gk;
  const inRete = G.some(r => r.bx >= GLX && Math.abs(r.bz) <= PALO && r.by < 2.6);
  const inReteNostra = G.some(r => r.bx <= -GLX && Math.abs(r.bz) <= PALO && r.by < 2.6); // highlight difensivi: «gol subito» si verifica qui
  const act = dati.act || {};
  const out = dati.out || null;
  const res = dati.res[dati.res.length - 1] || null;
  const kindMot = (out && out.outKind) || act.kind || null;
  const gol = (out && out.outKey === 'goal') || act.kind === 'goal';
  const ovlTesto = (out && (out.overlay || out.text)) || (res && res.ovl) || '';
  const catRiq = categoriaTesto(ovlTesto);
  const catMot = gol ? 'gol' : categoriaKind(kindMot);
  const contr = [];
  const naturale = !e.kind;
  if (naturale) {
    if (gol && !inRete && TIRO_LIKE.has(ARG)) contr.push('gol dichiarato ma il pallone non entra nello specchio in 3D');
    if (out && out.ok === false && inRete) contr.push('esito fallito ma il pallone finisce IN RETE in 3D (falso gol)');
    if (catRiq && catRiq !== 'ambigua' && catMot && catRiq !== catMot && !(catRiq === 'fuori' && catMot === 'palo')) contr.push(`riquadro «${ovlTesto.slice(0, 50)}» (${catRiq}) ≠ motore ${kindMot || out && out.outKey} (${catMot})`);
    if (res) { const c = contraddizione218(res); if (c) contr.push('riquadro↔motore: ' + c); }
  } else if (out && out.ok === false && inRete) contr.push('esito forzato «' + e.kind + '» ma il pallone finisce IN RETE in 3D');
  /* VELOCITA' DEL VOLO: distanza percorsa dal pallone durante l'arco / durata dell'arco (tempo di scena del gioco stesso, aT/aD) */
  let arco = null;
  { const A = G.filter(r => r.at && r.aT >= 0); if (A.length >= 3) { const a0 = A[0], a1 = A[A.length - 1]; const dt = a1.aT - a0.aT; const dd = Math.hypot(a1.bx - a0.bx, a1.bz - a0.bz, a1.by - a0.by); if (dt > 0.05) arco = { dur: a0.aD, dist: +dd.toFixed(1), v: +(dd / dt).toFixed(1) }; } }
  const portiere = TIRO_LIKE.has(ARG) || ARG === 'cross' ? analizzaPortiere(G, { kind: kindMot }, e) : null;
  if (naturale && portiere && catRiq === 'parata' && !portiere.gesto) contr.push('riquadro «parata» ma il portiere non fa nessun gesto (PO-242)');
  const f = dati.f480 || {};
  const cred = {
    esitoMotore: kindMot, outKey: out ? out.outKey : null, ok: out ? out.ok : act.ok, riquadro: { testo: ovlTesto.slice(0, 90), cat: catRiq, fam218: res ? res.fam : null, ev: res ? res.ev : null }, catMotore: catMot,
    inRete, inReteNostra, contraddizioni: contr, giudicataCoerenza: naturale,
    portiere,
    hMax: f.max != null ? f.max : null, fuoriQ: f.n ? +(f.fuori / f.n).toFixed(3) : null, nFrame: f.n || 0,
    reazioni: dati.rea.length, orfani: dati.orf, arco,
  };
  return { ...base, giudicata: true, fluid, cred };
}

function analizzaPortiere(R, act, e) {
  if (!R.length) return { nonGiud: 'nessun campione del portiere' };
  const ops = [...new Set(R.filter(r => r.op).map(r => r.op))];
  const i0 = R.findIndex(r => r.at); if (i0 < 0) return { ops, nonGiud: 'arco mai armato' };
  const iK = R.findIndex((r, i) => i >= i0 && r.at && r.aT >= 0); if (iK < 0) return { ops, nonGiud: 'calcio non campionato' };
  const ckKick = R[iK].ck - R[iK].aT; const gz0 = R[iK].gz;
  /* PIANO del portiere: il pallone raggiunge la x del portiere, interpolato fra i due fotogrammi a cavallo (gk-miss-229) */
  let piano = null;
  for (let i = iK; i < R.length; i++) {
    if (R[i].bx < R[i].gx) continue;
    if (i > iK) { const a = R[i - 1], c = R[i]; const da = a.gx - a.bx, dc = c.gx - c.bx; const w = da / Math.max(1e-6, da - dc); piano = { ck: a.ck + w * (c.ck - a.ck), z: a.bz + w * (c.bz - a.bz), y: a.by + w * (c.by - a.by), passo: c.ck - a.ck }; }
    else piano = { ck: R[i].ck, z: R[i].bz, y: R[i].by, passo: 0 };
    break;
  }
  /* il pallone puo' fermarsi prima del piano (parata in presa, respinta, murato): si giudica al massimo avvicinamento se e' entro 2u */
  if (!piano) { let iM = -1, dM = 1e9; for (let i = iK; i < R.length; i++) { const d = Math.abs(R[i].gx - R[i].bx); if (d < dM) { dM = d; iM = i; } } if (iM >= 0 && dM <= 2) piano = { ck: R[iM].ck, z: R[iM].bz, y: R[iM].by, passo: 0, avvicinamento: +dM.toFixed(2) }; }
  let iMov = -1; for (let i = iK; i < R.length; i++) if (Math.abs(R[i].gz - gz0) > 0.05) { iMov = i; break; }
  const iF = R.length - 1; const zFin = R[iF].gz;
  const out = { ops, gesto: ops.length > 0, kickToPiano: piano ? +(piano.ck - ckKick).toFixed(3) : null, dzPiano: piano ? +Math.abs(piano.z - gz0).toFixed(2) : null };
  if (!piano) { out.nonGiud = 'il pallone non arriva al portiere'; return out; }
  if (piano.avvicinamento != null) out.avvicinamento = piano.avvicinamento;
  if (piano.ck - ckKick < S.GK_REAZ) { out.nonGiud = 'bruciapelo (< ' + S.GK_REAZ + ' s)'; return out; }
  const aPortata = Math.abs(piano.z - gz0) <= S.GK_PORTATA && piano.y <= 2.6;
  out.aPortata = aPortata;
  out.partenza = iMov >= 0 ? +(R[iMov].ck - piano.ck).toFixed(3) : null; // negativo = prima che il pallone passi
  /* RIFLESSO (gk_block, src/12 r.~7439): per costruzione si sposta appena, il pallone gli arriva addosso. Il tempo si giudica
     sull'ARMO del gesto rispetto all'arrivo; lo spostamento solo se il pallone passa oltre 1,2u. TUFFO: il corpo deve partire
     prima che il pallone passi (gk-miss-229). */
  const iArm = R.findIndex((r, i) => i >= iK && r.op);
  out.armato = iArm >= 0 ? +(R[iArm].ck - piano.ck).toFixed(3) : null;
  const soloRiflesso = ops.length > 0 && ops.every(o => o === 'gk_block');
  out.riflesso = soloRiflesso;
  out.tardi = soloRiflesso
    ? ((iArm >= 0 && R[iArm].ck - piano.ck > S.GK_TARDI) || (Math.abs(piano.z - gz0) > 1.2 && iMov >= 0 && R[iMov].ck - piano.ck > S.GK_TARDI))
    : (iMov >= 0 && R[iMov].ck - piano.ck > S.GK_TARDI);
  out.fermo = aPortata && iMov < 0 && !out.gesto;
  const latoP = Math.sign(piano.z - gz0), latoG = Math.sign(zFin - gz0);
  out.verso = Math.abs(piano.z - gz0) > 0.6 && Math.abs(zFin - gz0) > 0.3 && latoP !== latoG;
  out.parataSenzaGesto = (e.kind === 'saved' || act.kind === 'saved') && !out.gesto;
  return out;
}

/* categorie del riquadro dal TESTO (cio' che il giocatore legge) e del motore dal tipo d'esito (cio' che il 3D esegue) */
function categoriaTesto(t) {
  const x = String(t || '').toLowerCase(); if (!x) return null;
  /* repertorio del riquadro per la parata, src/05-cronaca-stadi-formazioni.jsx r.355: dal 7.999.154 «Tentativo respinto» sta SOLO li' */
  if (/tentativo respinto|conclusione centrale|il gol sembrava fatto/.test(x)) return 'parata';
  if (/sembrava|quasi|sfior|poteva|mancat|per poco|a un passo/.test(x)) return /parat|portiere/.test(x) ? 'parata' : null; // un'occasione mancata NON e' un gol
  if (/\bgo+l\b|in rete|la mette dentro|segna|insacca|rete!/.test(x)) return 'gol';
  if (/palo|traversa|legno/.test(x)) return 'palo';
  if (/parat|portiere|guant|tuff|in presa|para /.test(x)) return 'parata';
  if (/intercett|anticipat|palla persa|perde palla|lo chiude|chiuso|rubat|soffiat|fuorigioco/.test(x)) return 'intercetto';
  if (/murat|respint|deviat|barriera|blocc|corpo|ribatt|si oppone|oppost/.test(x)) return 'murata';
  if (/fuori|alto|larg|a lato|sopra la traversa|specchio|sfiora|di poco/.test(x)) return 'fuori';
  return null;
}
function categoriaKind(k) {
  if (!k) return null;
  if (k === 'goal') return 'gol';
  if (k === 'post') return 'palo';
  if (k === 'saved' || k === 'save') return 'parata';
  if (/intercepted|dispossessed|beaten|offside/.test(k)) return 'intercetto';
  if (/blocked|wall_blocked/.test(k)) return 'murata';
  if (/wide|out|overhit|missed|deflected_out|shielded_out|lost|stopped/.test(k)) return 'fuori';
  return null;
}

/* coerenza riquadro ↔ motore ↔ 3D, dai soli campi salvati: il rapporto la RICALCOLA, cosi' una correzione del classificatore di
   testo non obbliga a rimisurare. Solo sulle esecuzioni a esito NATURALE (vedi testa del file). */
function coerenza(c, fam) {
  const out = [];
  if (!c.giudicataCoerenza) { if (c.ok === false && c.inRete) out.push('esito forzato fallito ma il pallone finisce IN RETE in 3D'); return out; }
  const testo = (c.riquadro && c.riquadro.testo) || '';
  const catRiq = categoriaTesto(testo); const gol = c.outKey === 'goal' || c.esitoMotore === 'goal';
  const catMot = gol ? 'gol' : categoriaKind(c.esitoMotore);
  if (gol && !c.inRete && TIRO_LIKE.has(fam)) out.push('gol dichiarato ma il pallone non entra nello specchio in 3D');
  if (c.ok === false && c.inRete) out.push('esito fallito ma il pallone finisce IN RETE in 3D (falso gol)');
  const difensiva = fam === 'contrasto' || fam === 'difesa';
  if (difensiva) { // il tipo d'esito difensivo (beaten, deflected_out…) non e' il lessico del tiro: si confronta solo il gol subito col 3D
    if (catRiq === 'gol' && c.inReteNostra === false) out.push(`riquadro «${testo.slice(0, 40)}» ma in 3D il pallone non entra nella nostra porta`);
    if (c.inReteNostra && catRiq !== 'gol' && c.ok !== false) out.push('pallone nella nostra porta in 3D su un intervento riuscito');
    return out;
  }
  if (catRiq && catMot && catRiq !== catMot && !(catRiq === 'fuori' && catMot === 'palo')) out.push(`riquadro «${testo.slice(0, 50)}» (${catRiq}) ≠ motore ${c.esitoMotore || c.outKey} (${catMot})`);
  if (c.riquadro && c.riquadro.fam218) { const x = contraddizione218({ fam: c.riquadro.fam218, ev: c.riquadro.ev || [] }); if (x) out.push('riquadro↔motore: ' + x); }
  if (catRiq === 'parata' && c.portiere && c.portiere.gesto === false) out.push('riquadro «parata» ma il portiere non fa nessun gesto (PO-242)');
  return out;
}

/* stessa regola di esiti-218.mjs (riquadro contro fatti del motore) */
function contraddizione218(r) {
  const ev = r.ev || [], fam = r.fam;
  const t = ev.find(x => x.startsWith('tiro:')); const es = t ? t.split(':')[1].split('(')[0] : null;
  if (ev.some(x => x.startsWith('intercetto')) && /^(blocked|wide|saved|post)$/.test(fam || '')) return 'passaggio intercettato raccontato come ' + fam;
  if (fam === 'foul' && !ev.some(x => x.startsWith('fallo'))) return 'fallo subito senza fallo nel motore';
  if (es && fam) { const m = { fuori: 'wide', saved: 'saved', blocked: 'blocked', post: 'post' }[es]; if (m && /^(wide|saved|blocked|post)$/.test(fam) && m !== fam) return 'tiro ' + es + ' raccontato come ' + fam; }
  return null;
}

function median(a) { if (!a.length) return 0; const v = [...a].sort((x, y) => x - y); return v[Math.floor(v.length / 2)]; }
function quant(a, p) { if (!a.length) return 0; const v = [...a].sort((x, y) => x - y); return v[Math.min(v.length - 1, Math.floor(p * v.length))]; }
function sintesiBreve(r) { if (!r.giudicata) return { gi: r.gi, esito: r.esito, nonGiud: r.nonGiud || r.errore }; return { gi: r.gi, esito: r.esito, ap: r.apertura, fl: { ...r.fluid, esempi: undefined }, cr: r.cred }; }

/* ───────────────────────────── difetti di una esecuzione (per la classifica) ───────────────────────────── */
function difettiDi(r) {
  const d = []; if (!r.giudicata) return d; const f = r.fluid, c = r.cred, a = r.apertura || {};
  if (f.eroeSalti) d.push('F1 salto del corpo dell\'eroe');
  if (f.pallaSalti || f.bjVivi) d.push('F2 salto del pallone (non mascherato)');
  if (f.camSalti) d.push('F3 salto della camera (non mascherato)');
  if (f.pesoSalti) d.push('F4 peso del gesto che salta');
  if (f.fermoQ != null && f.fermoQ >= S.FERMO_Q) d.push('F5 eroe congelato nella conclusione');
  if (!f.gestoMontato) d.push('F6 nessun gesto GLB montato sull\'eroe');
  if (f.skateEroe != null && f.skateEroe > S.SKATE) d.push('F7 piedi dell\'eroe che pattinano');
  if (coerenza(c, r.fam || ARG).length) d.push('C1 esito incoerente riquadro/3D/motore');
  if (c.esitoMotore !== 'blocked' && c.portiere && !c.portiere.nonGiud && (c.portiere.tardi || c.portiere.verso || c.portiere.fermo)) d.push('C2 portiere fuori tempo / lato / fermo (111/112)');
  if (c.portiere && c.portiere.parataSenzaGesto) d.push('C3 parata senza gesto del portiere (PO-242)');
  /* l'apertura si giudica SOLO sulla prima esecuzione di una pagina nuova, che entra dal gioco fluido come nel gioco vero: misurato
     nella prima passata, la stessa scena dava 0-1,1u da prima e 2-4u dopo altre conclusioni sulla stessa pagina (pagina stanca, 7.483) */
  const piazzato = ['rigore', 'punizione'].includes(r.fam || ARG); // palla ferma sul punto ed eroe alla rincorsa PER COSTRUZIONE (misurato: 3,2-4,3u costanti)
  if (!piazzato && r.pagina === 1 && a.dPalla != null && a.dPalla > S.APERTURA_D) d.push('C4 pallone ai piedi di nessuno all\'apertura (001)');
  if (!piazzato && r.pagina === 1 && a.dEroe != null && a.dEroe > S.POS_D) d.push('C5 eroe non in posizione all\'apertura (002)');
  if (c.hMax != null && c.hMax < S.H_FIGURINA) d.push('C6 eroe figurina (< 0,08): gesto non leggibile');
  if (c.fuoriQ != null && c.fuoriQ > S.FUORI_Q) d.push('C7 eroe fuori quadro nella conclusione');
  if (['tiro', 'testa', 'volee', 'cross'].includes(r.fam || ARG) && c.reazioni === 0) d.push('C8 nessuna reazione del reparto avversario');
  return d;
}

function stampaFamiglia(fam, righe) {
  const g = righe.filter(r => r.giudicata);
  console.log(`\n=== ${fam.toUpperCase()} · ${g.length} esecuzioni giudicate ===`);
  for (const r of g) {
    const f = r.fluid, c = r.cred, a = r.apertura;
    console.log(`  gi${String(r.gi).padStart(3)} ${r.esito.padEnd(10)} motore=${c.esitoMotore || '—'} riquadro=${c.riquadro.cat || '?'}«${(c.riquadro.testo || '').slice(0, 40)}» rete=${c.inRete ? 'sì' : 'no'} · dt med ${f.tempi.med}ms p95 ${f.tempi.p95} · salti e/p/c ${f.eroeSalti}/${f.pallaSalti}/${f.camSalti} · peso ${f.pesoSalti}+${f.clipSecche} · fermo ${f.fermoQ} · gesto ${f.gestoMontato ? f.clips.join('+') : 'NO'} · skate ${f.skateEroe} · h ${c.hMax} fuori ${c.fuoriQ} · ap ${a.dPalla}/${a.dEroe} · rea ${c.reazioni} · arco ${c.arco ? c.arco.v + 'u/s' : '—'} · pag ${r.pagina}${c.portiere ? ' · gk ' + JSON.stringify(c.portiere) : ''}`);
    const d = difettiDi({ ...r, fam }); if (d.length) console.log('        ↳ ' + d.join(' · '));
    if (c.contraddizioni.length) console.log('        ↳ ' + c.contraddizioni.join(' · '));
  }
}

/* ════════════════════════════════════ RAPPORTO ════════════════════════════════════ */
function rapporto() {
  if (!fs.existsSync(OUT)) { console.log('❌ nessuna misura in out/banco-248: lancia prima le famiglie'); process.exitCode = 2; return; }
  const tab = []; const conteggio = {}; const ciechi = [];
  for (const fam of FAMIGLIE) {
    const p = path.join(OUT, fam + '.json');
    if (!fs.existsSync(p)) { ciechi.push(fam + ' (non misurata)'); continue; }
    const J = JSON.parse(fs.readFileSync(p, 'utf8'));
    const g = J.righe.filter(r => r.giudicata);
    if (g.length < S.COPERTURA) ciechi.push(`${fam} (${g.length} giudicate)`);
    const q = (fn) => g.length ? g.filter(fn).length : 0;
    const gk = g.filter(r => r.cred.esitoMotore !== 'blocked').map(r => r.cred.portiere).filter(x => x && !x.nonGiud); // murato da un difensore: il portiere non e' chiamato in causa
    const nat = g.filter(r => r.cred.giudicataCoerenza);
    tab.push({ fam, n: g.length, tot: J.righe.length, durata: J.durataS,
      dtMed: median(g.map(r => r.fluid.tempi.med)), dtP95: median(g.map(r => r.fluid.tempi.p95)), picchi: g.reduce((s, r) => s + r.fluid.tempi.picchi, 0),
      eroeS: q(r => r.fluid.eroeSalti > 0), pallaS: q(r => r.fluid.pallaSalti > 0 || r.fluid.bjVivi > 0), camS: q(r => r.fluid.camSalti > 0), pesoS: q(r => r.fluid.pesoSalti > 0),
      fermo: q(r => r.fluid.fermoQ != null && r.fluid.fermoQ >= S.FERMO_Q), noGesto: q(r => !r.fluid.gestoMontato),
      skate: median(g.map(r => r.fluid.skateEroe).filter(x => x != null)),
      incoer: nat.filter(r => coerenza(r.cred, fam).length).length, incoerTesti: nat.filter(r => coerenza(r.cred, fam).length).map(r => `gi${r.gi} ${r.esito}: ${coerenza(r.cred, fam).join('; ')}`), nNat: nat.length,
      gkKo: gk.filter(x => x.tardi || x.verso || x.fermo).length, nGk: gk.length, parataNoGesto: g.filter(r => r.cred.portiere && r.cred.portiere.parataSenzaGesto).length,
      c001: q(r => r.pagina === 1 && r.apertura.dPalla != null && r.apertura.dPalla > S.APERTURA_D), c002: q(r => r.pagina === 1 && r.apertura.dEroe != null && r.apertura.dEroe > S.POS_D), nAp: q(r => r.pagina === 1),
      c001dopo: q(r => r.pagina > 1 && r.apertura.dPalla != null && r.apertura.dPalla > S.APERTURA_D), nDopo: q(r => r.pagina > 1),
      vArcoMed: median(g.map(r => r.cred.arco && r.cred.arco.v).filter(x => x != null)), vArcoMax: Math.max(0, ...g.map(r => r.cred.arco && r.cred.arco.v).filter(x => x != null)),
      ambigue: q(r => r.cred.riquadro && r.cred.riquadro.testo && !categoriaTesto(r.cred.riquadro.testo)),
      hMed: median(g.map(r => r.cred.hMax).filter(x => x != null)), fuoriMed: median(g.map(r => r.cred.fuoriQ).filter(x => x != null)), rea: q(r => r.cred.reazioni > 0) });
    for (const r of g) for (const d of difettiDi({ ...r, fam })) { (conteggio[d] = conteggio[d] || { n: 0, fam: {} }).n++; conteggio[d].fam[fam] = (conteggio[d].fam[fam] || 0) + 1; }
  }
  console.log('famiglia | giud. | dt med/p95 ms | picchi | salti eroe/palla/cam | peso | congelato | senza gesto | skate eroe | incoer. (nat) | portiere KO | 001 | 002 | h med | fuori med | reazioni | v arco med/max | riquadri non classificati');
  for (const t of tab) console.log(`${t.fam} | ${t.n}/${t.tot} | ${t.dtMed}/${t.dtP95} | ${t.picchi} | ${t.eroeS}/${t.pallaS}/${t.camS} | ${t.pesoS} | ${t.fermo} | ${t.noGesto} | ${t.skate} | ${t.incoer}/${t.nNat} | ${t.gkKo}/${t.nGk}${t.parataNoGesto ? ' (+' + t.parataNoGesto + ' parate senza gesto)' : ''} | ${['rigore', 'punizione'].includes(t.fam) ? 'n/a (rincorsa)' : `${t.c001}/${t.nAp} (dopo un altro HL ${t.c001dopo}/${t.nDopo})`} | ${['rigore', 'punizione'].includes(t.fam) ? 'n/a' : `${t.c002}/${t.nAp}`} | ${t.hMed} | ${t.fuoriMed} | ${t.rea}/${t.n} | ${t.vArcoMed}/${t.vArcoMax} | ${t.ambigue}`);
  console.log('\ndettaglio:');
  for (const fam of FAMIGLIE) {
    const p = path.join(OUT, fam + '.json'); if (!fs.existsSync(p)) continue;
    const g = JSON.parse(fs.readFileSync(p, 'utf8')).righe.filter(r => r.giudicata);
    for (const r of g) {
      const c = r.cred, inc = coerenza(c, fam), pk = c.esitoMotore !== 'blocked' && c.portiere && !c.portiere.nonGiud && (c.portiere.tardi || c.portiere.verso || c.portiere.fermo);
      const sal = r.fluid.esempi.filter(x => /vicini/.test(x)).concat(r.fluid.bjSrc && r.fluid.bjSrc.length && /palla/.test(r.fluid.esempi.join()) ? ['varco: ' + r.fluid.bjSrc.join(',')] : []).concat(r.fluid.camSrc && r.fluid.camSrc.length && /camera/.test(r.fluid.esempi.join()) ? ['camera93: ' + r.fluid.camSrc.join(',')] : []);
      if (inc.length || pk || sal.length) console.log(`  ${fam} gi${r.gi} ${r.esito} (pag ${r.pagina})${inc.length ? ' · ' + inc.join('; ') : ''}${pk ? ' · portiere ' + JSON.stringify(c.portiere) : ''}${sal.length ? ' · ' + sal.join(' | ') : ''}`);
    }
  }
  console.log('\nfrequenza dei difetti (esecuzioni giudicate):');
  for (const [d, v] of Object.entries(conteggio).sort((a, b) => b[1].n - a[1].n)) console.log(`  ${String(v.n).padStart(3)} · ${d} · ${Object.entries(v.fam).map(x => x.join(':')).join(' ')}`);
  fs.writeFileSync(path.join(OUT, 'rapporto.json'), JSON.stringify({ tab, conteggio, ciechi }, null, 1));
  if (ciechi.length) { console.log(`\n❌ BANCO CIECO su: ${ciechi.join(', ')}`); process.exitCode = 2; }
  else console.log('\n✅ tutte le famiglie hanno la copertura minima');
}
