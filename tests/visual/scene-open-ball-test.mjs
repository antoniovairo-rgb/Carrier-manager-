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
            window.__CPM_QY.push({ y: s.ball.worldY, dm });
          }
        } catch (e) {}
        requestAnimationFrame(window.__CPM_QTICK);
      };
      requestAnimationFrame(window.__CPM_QTICK);
    }
  });
  await sleep(900);
  const m = await page.evaluate(() => {
    const s = window.__CPM_STATE && window.__CPM_STATE();
    const q = window.__CPM_QY || [];
    /* la quota si giudica NEI FOTOGRAMMI IN CUI IL PALLONE E' AI PIEDI DI QUALCUNO: un pallone in volo
       alto e' giusto che sia alto, un pallone appoggiato a un compagno no. */
    const ai = q.filter(z => z.dm <= 3);
    return { sig: s && s.sitSig ? s.sitSig : null, n: q.length, max: q.length ? Math.max(...q.map(z => z.y)) : null,
      nPiedi: ai.length, maxPiedi: ai.length ? Math.max(...ai.map(z => z.y)) : null, ph: s ? s.phase : null };
  });
  if (!m.sig || !m.n) continue;

  const aerea = m.sig.bs === 'aerial';
  const alto = m.max != null && m.max > TERRA;
  const problemi = [];
  if (!aerea && alto) problemi.push(`la situazione dichiara palla ${m.sig.bs} ma all'apertura il pallone sta a ${m.max.toFixed(2)}u di quota`);
  /* ⚠️ IL CRITERIO CHE MANCAVA, e che la nota #87 del PO ha reso evidente: un pallone che sta ADDOSSO a
     un compagno dev'essere ai suoi PIEDI. La quota di CONTATTO — quella a cui l'Eroe colpira' — vale
     all'ARRIVO, non alla partenza: applicata dal primo fotogramma tiene il pallone sospeso a mezz'aria
     accanto a chi deve ancora giocarlo, e da fuori si legge «non e' nei piedi di nessuno». */
  if (m.nPiedi >= 3 && m.maxPiedi != null && m.maxPiedi > TERRA) problemi.push(`il pallone sta a meno di 3u da un compagno ma fluttua a ${m.maxPiedi.toFixed(2)}u di quota (${m.nPiedi} fotogrammi)`);
  if (problemi.length) guasti.push(`gi${gi}: ` + problemi.join(' · '));
  casi.push({ gi, bs: m.sig.bs, aerea, max: m.max, n: m.n, nPiedi: m.nPiedi, maxPiedi: m.maxPiedi });
  if (VERB || problemi.length) console.log(`${problemi.length ? '❌' : '✅'} gi${String(gi).padStart(3)} · stato dichiarato ${String(m.sig.bs).padEnd(7)} · quota massima all'apertura ${m.max == null ? ' — ' : m.max.toFixed(2)}u · ai piedi di un compagno ${m.nPiedi} fr, quota max ${m.maxPiedi == null ? ' — ' : m.maxPiedi.toFixed(2)}u · campioni ${m.n}`);
}
await b.close(); srv.close();

if (casi.length < 10) { console.log(`❌ FAIL — solo ${casi.length} aperture misurate: la sonda e' cieca`); process.exit(2); }
const alPiede = casi.filter(c => !c.aerea);
const alti = alPiede.filter(c => c.max > TERRA).length;
const sospesi = casi.filter(c => c.nPiedi >= 3 && c.maxPiedi != null && c.maxPiedi > TERRA).length;
const qs = alPiede.map(c => c.max).sort((x, y) => x - y);
console.log(`\naperture misurate ${casi.length} (al piede ${alPiede.length}) · quota mediana all'apertura ${qs.length ? qs[qs.length >> 1].toFixed(2) : '—'}u · aperture a mezz'aria ${alti} · palloni SOSPESI accanto a un compagno ${sospesi}`);
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.slice(0, 20).forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log(`\n✅ PASS — ogni scena si apre col pallone all'altezza che la situazione dichiara`);
