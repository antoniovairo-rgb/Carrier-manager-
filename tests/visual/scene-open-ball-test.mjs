#!/usr/bin/env node
/* [7.389.0] GUARDIANO — LA SCENA SI APRE CON IL PALLONE ALL'ALTEZZA GIUSTA
   (collaudo PO #87 «il pallone deve essere a terra, tra i piedi dell'eroe, e non a mezza altezza
    all'inizio della scena»)

   PERCHE' E' UNA MISURA E NON UN'IMPRESSIONE. Il gioco SA gia' dichiarare come nasce una scena:
   `hlBallState` distingue una situazione che parte da palla AEREA — un cross che sta arrivando, una
   sponda — da una che parte dal PIEDE. Se la dichiarazione dice «al piede» e il pallone all'apertura
   sta a mezza altezza, non e' un'opinione sul realismo: e' il 3D che contraddice il proprio dato.

   COSA MISURA: apre ogni scena passando davvero da `hl_intro` (serve `__CPM_FORCE_INTRO`, altrimenti
   il collaudo entra diretto nella fase di lettura e l'apertura non la vede nessuno) e campiona la
   QUOTA del pallone nei primi decimi, confrontandola con lo stato dichiarato dalla situazione.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node scene-open-ball-test.mjs [--verbose]                */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
const N = +(process.env.CPM_N || 191);
const PASSO = +(process.env.CPM_STEP || 4);   /* una scena ogni quattro: il campione resta una popolazione */
const TERRA = 0.95;   /* il pallone a terra sta a 0,65: sopra un metro non e' piu' «tra i piedi» */
const RUN_MIN = 6;    /* fotogrammi consecutivi: sotto, e' il rallentamento naturale di una parabola */

/* LA REGOLA, in un posto solo e senza browser attorno: la corsa piu' lunga di fotogrammi in cui il
   pallone e' ALTO, VICINO a un compagno e IMMOBILE. E' la forma del difetto della nota #87 — un pallone
   appeso a mezz'aria accanto a chi deve giocarlo. Un pallone in volo, anche lentissimo, si muove. */
export function sospeso(campioni) {
  let run = 0, fermoRun = 0, fermoQuota = 0;
  for (let i = 1; i < (campioni || []).length; i++) {
    const a = campioni[i - 1], b = campioni[i];
    const immobile = Math.abs(b.y - a.y) < 0.02 && Math.abs(b.x - a.x) < 0.05 && Math.abs(b.z - a.z) < 0.05;
    if (b.dm <= 3 && b.y > TERRA && immobile) { run++; if (run > fermoRun) { fermoRun = run; fermoQuota = b.y; } }
    else run = 0;
  }
  return { fermoRun, fermoQuota };
}

/* ⚠️ PROVA DEL ROSSO: PERCHE' E' SINTETICA, E VA DETTO. La strada naturale sarebbe congelare una scena
   aerea a meta' volo (`__CPM_FROZEN`, dt=0) per fabbricare un pallone alto e immobile. E' stata provata,
   e NON funziona: misurato su gi76, il congelamento SCATTA nel punto giusto (quota 1,76, compagno a 0)
   ma il pallone continua a scendere — 1,76 → 1,41 → 1,06 → 0,65. Cioe' `__CPM_FROZEN` ferma le
   animazioni del render-loop ma NON la grandezza che questo guardiano campiona: `worldY` non viene dal
   percorso governato da `dt`. Con gli interruttori esistenti il difetto non e' sintetizzabile nel gioco,
   quindi il rosso si prova sulla REGOLA con una serie costruita — piu' debole di un rosso vivo, e chi
   legge deve saperlo. Per un rosso vivo servirebbe un iniettore test-only nel gioco che inchiodi la
   quota del pallone: e' il prossimo passo se questa regola dovesse mai diventare bloccante. */
if (process.env.CPM_SELFTEST) {
  const fermo = []; for (let i = 0; i < 10; i++) fermo.push({ y: 1.6, dm: 1.2, x: 40, z: 30 });
  const volo = [];  for (let i = 0; i < 10; i++) volo.push({ y: 1.8 - i * 0.12, dm: 1.0, x: 40 + i * 0.9, z: 30 });
  const a = sospeso(fermo), b = sospeso(volo);
  const ok = a.fermoRun >= RUN_MIN && b.fermoRun < RUN_MIN;
  console.log(`autoprova della regola: pallone APPESO → corsa ${a.fermoRun} (deve essere >= ${RUN_MIN}) · pallone in VOLO → corsa ${b.fermoRun} (deve essere < ${RUN_MIN})`);
  console.log(ok ? '✅ la regola separa i due casi' : '❌ la regola NON separa i due casi');
  process.exit(ok ? 0 : 1);
}

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 380, height: 300 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; });
await openMatch(page, port); await sleep(900);

const casi = [], guasti = [];
for (let gi = 0; gi < N; gi += PASSO) {
  let ok = false;
  try {
    ok = await page.evaluate(g => {
      window.__CPM_FORCE_INTRO = 1; window.__CPM_FORCE_INTRO_MS = 2600;
      return window.__CPM_FORCE_SIT(g, true);
    }, gi);
  } catch (e) { }
  if (!ok) break;

  /* si campiona DENTRO l'intro, a frequenza di fotogramma: la quota d'apertura dura poco e un poll
     da node la manca (trappola gia' pagata piu' volte in questo repo) */
  await page.evaluate(() => {
    window.__CPM_QY = [];
    if (!window.__CPM_QTICK) {
      window.__CPM_QTICK = () => {
        try { const s = window.__CPM_STATE && window.__CPM_STATE();
          if (s && s.ball && s.phase === 'hl_intro' && window.__CPM_QY && window.__CPM_QY.length < 400) {
            let dm = 1e9; (s.players || []).forEach(p => { if (p.team !== 'home' || p.gk) return; const d = Math.hypot(p.x - s.ball.x, p.y - s.ball.y); if (d < dm) dm = d; });
            window.__CPM_QY.push({ y: s.ball.worldY, dm, x: s.ball.x, z: s.ball.y });
          }
        } catch (e) {}
        requestAnimationFrame(window.__CPM_QTICK);
      };
      requestAnimationFrame(window.__CPM_QTICK);
    }
  });
  /* PROVA DEL ROSSO (`CPM_FREEZE=1`): `__CPM_FROZEN` mette dt=0, cioe' congela animazioni e lerp. Una
     scena aerea congelata a meta' volo E' la forma esatta del difetto della nota #87 — pallone alto,
     accanto a un uomo, immobile. Se il criterio non vira qui, non sta guardando niente.
     ⚠️ IL CONGELAMENTO NON PUO' ESSERE A TEMPO FISSO, e la prima stesura lo era: su gi76 la fase aerea
     dura CINQUE fotogrammi (1,75 → 0,65) e a +260 ms il pallone e' gia' a terra, cioe' si congelava
     una scena sana e il rosso non arrivava. Non era il criterio cieco: era la prova a fotografare il
     momento sbagliato — la stessa trappola del cronometro che questo repo paga da sempre. Ora si
     aspetta la CONDIZIONE (pallone alto E vicino a un uomo) e si congela li'. */
  if (process.env.CPM_FREEZE) {
    await page.waitForFunction(() => {
      try {
        const s = window.__CPM_STATE && window.__CPM_STATE();
        if (!s || !s.ball || s.phase !== 'hl_intro') return false;
        let dm = 1e9; (s.players || []).forEach(p => { if (p.team !== 'home' || p.gk) return; const d = Math.hypot(p.x - s.ball.x, p.y - s.ball.y); if (d < dm) dm = d; });
        if (s.ball.worldY > 1.2 && dm <= 3) { window.__CPM_FROZEN = true; return true; }
        return false;
      } catch (e) { return false; }
    }, null, { timeout: 2200 }).catch(() => {});
  }
  await sleep(900);
  if (process.env.CPM_FREEZE) await page.evaluate(() => { window.__CPM_FROZEN = false; });
  const m = await page.evaluate(() => {
    const s = window.__CPM_STATE && window.__CPM_STATE();
    const q = window.__CPM_QY || [];
    /* la quota si giudica NEI FOTOGRAMMI IN CUI IL PALLONE E' AI PIEDI DI QUALCUNO: un pallone in volo
       alto e' giusto che sia alto, un pallone appoggiato a un compagno no. */
    const ai = q.filter(z => z.dm <= 3);
    /* la pagina RACCOGLIE, non giudica: la regola vive in node in una copia sola, cosi' e' esercitabile
       su una serie costruita apposta (vedi `sospeso()` e `CPM_SELFTEST`) */
    return { sig: s && s.sitSig ? s.sitSig : null, n: q.length, max: q.length ? Math.max(...q.map(z => z.y)) : null,
      nPiedi: ai.length, maxPiedi: ai.length ? Math.max(...ai.map(z => z.y)) : null, campioni: q, ph: s ? s.phase : null };
  });
  if (!m.sig || !m.n) continue;

  const aerea = m.sig.bs === 'aerial';
  const alto = m.max != null && m.max > TERRA;
  const problemi = [];
  if (!aerea && alto) problemi.push(`la situazione dichiara palla ${m.sig.bs} ma all'apertura il pallone sta a ${m.max.toFixed(2)}u di quota`);
  /* ⚠️ CRITERIO CORRETTO NEL 7.480, DOPO UN ROSSO CHE ERA SUO E NON DEL GIOCO. La prima stesura diceva:
     «se il pallone sta a meno di 3u da un compagno, dev'essere ai suoi piedi». Giusta come intenzione —
     nasce dalla nota #87, un pallone appeso a mezz'aria accanto a chi deve giocarlo — ma senza esenzione
     per le scene AEREE, dove avere un compagno a tre metri non e' un'anomalia: e' lo scopo di un cross.
     Bocciava gi56 («Lancio lungo millimetrico») e gi76 («Corner sul primo palo»), e la misura ha assolto
     entrambe: su gi56 la palla parte a terra ai piedi di un compagno, si alza a 1,77 e percorre 5,6
     unita'; su gi76 scende da 1,78 a 0,88 addosso a chi deve girarla. Volano tutte e due.
     E LA CORREZIONE NON E' ESENTARE LE SCENE AEREE — sarebbe fidarsi di una dichiarazione. E' misurare il
     fenomeno: un pallone in VOLO si muove, un pallone APPESO sta fermo. Il difetto della nota #87 e' un
     pallone alto, vicino a un uomo, e IMMOBILE. */
  const sos = sospeso(m.campioni);
  if (sos.fermoRun >= RUN_MIN) problemi.push(`il pallone resta FERMO a ${sos.fermoQuota.toFixed(2)}u di quota accanto a un compagno per ${sos.fermoRun} fotogrammi consecutivi (in volo si muove, appeso no)`);
  if (problemi.length) guasti.push(`gi${gi}: ` + problemi.join(' · '));
  casi.push({ gi, bs: m.sig.bs, aerea, max: m.max, n: m.n, nPiedi: m.nPiedi, maxPiedi: m.maxPiedi, fermoRun: sos.fermoRun });
  if (VERB || problemi.length) console.log(`${problemi.length ? '❌' : '✅'} gi${String(gi).padStart(3)} · stato dichiarato ${String(m.sig.bs).padEnd(7)} · quota massima all'apertura ${m.max == null ? ' — ' : m.max.toFixed(2)}u · ai piedi di un compagno ${m.nPiedi} fr, quota max ${m.maxPiedi == null ? ' — ' : m.maxPiedi.toFixed(2)}u · FERMO in alto ${sos.fermoRun} fr · campioni ${m.n}`);
}
await b.close(); srv.close();

if (casi.length < 10) { console.log(`❌ FAIL — solo ${casi.length} aperture misurate: la sonda e' cieca`); process.exit(2); }
const alPiede = casi.filter(c => !c.aerea);
const alti = alPiede.filter(c => c.max > TERRA).length;
/* il conteggio segue il CRITERIO, non la sua versione superata: «sospeso» e' alto+vicino+IMMOBILE.
   Prima contava «alto e vicino» e stampava 3 accanto a un PASS — un riepilogo che contraddice il
   verdetto costringe chi legge a scegliere a chi credere, ed e' il modo in cui un numero smette di
   essere letto. Il vicino-e-alto resta stampato a parte, come contesto. */
const sospesi = casi.filter(c => c.fermoRun >= 6).length;
const vicinoAlto = casi.filter(c => c.nPiedi >= 3 && c.maxPiedi != null && c.maxPiedi > TERRA).length;
const qs = alPiede.map(c => c.max).sort((x, y) => x - y);
console.log(`\naperture misurate ${casi.length} (al piede ${alPiede.length}) · quota mediana all'apertura ${qs.length ? qs[qs.length >> 1].toFixed(2) : '—'}u · aperture a mezz'aria ${alti} · palloni SOSPESI (alti, vicini e IMMOBILI) ${sospesi} · di cui solo alti-e-vicini, in volo legittimo ${vicinoAlto}`);
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.slice(0, 20).forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log(`\n✅ PASS — ogni scena si apre col pallone all'altezza che la situazione dichiara`);
