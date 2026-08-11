#!/usr/bin/env node
/* [7.399.0] GUARDIANO — LA SCENA SI APRE CON IL PALLONE DI QUALCUNO
   (collaudo PO codice 002 «l'eroe non e' gia' posizionato nella posizione giusta, con il pallone
    tra i piedi ad inizio scena»)

   PERCHE' E' UNA MISURA E NON UN'IMPRESSIONE. Alla prima lettura — intro percorsa davvero, palla
   assestata — una scena OFFENSIVA al piede deve avere il pallone ADDOSSO a un giocatore di casa:
   e' cio' che la situazione dichiara (ballState `feet`), e un pallone nello spazio vuoto con
   l'eroe in marcia verso di lui e' esattamente la nota del PO. MISURATO PRIMA DEL FIX (96
   aperture, 7.398.0): 17 scene offensive con la palla di NESSUNO — palla esatta sul bersaglio
   logico e mesh dell'eroe a 6-22 unita', in cammino — perche' la continuita' 4.86 ri-scattava
   alla transizione intro→move e spostava il punto di partenza DOPO lo snap.

   RESIDUI DICHIARATI, non giudicati qui:
     · scene AEREE (gi6/gi50/gi76): consegna al punto geometrico su corner/cross — thread aperto
       dal 7.391, va chiuso capendo perche' la spinta del renderer non arriva su quel ramo;
     · gi96/gi98 (dribbling): un driver ancora ignoto trascina palla ed eroe all'indietro durante
       l'intro — in coda con questa nota.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node scene-open-owner-test.mjs [--verbose]           */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const VERB = process.argv.includes('--verbose');
/* le 13 rosse della misura pre-fix (famiglia «al piede») + controlli sani */
const SCENE = (process.env.CPM_SCENE || '').length ? process.env.CPM_SCENE.split(',').map(Number)
  : [92, 152, 148, 12, 120, 142, 144, 106, 110, 114, 158, 182, 188, 0, 26, 74, 168, 132];/* 168/132: scene del criterio «scivolata» (7.400) */
const NOTI = new Set([96, 98]);   /* dribbling: driver ignoto, residuo dichiarato — 168/132 rientrate col
   ri-armo dello snap sul commit di staging (7.401) e col conteggio ripulito dall'errore di attribuzione */
const ADDOSSO = 3.5;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; });
await openMatch(page, port); await sleep(900);

const righe = [], guasti = [];
for (const gi of SCENE) {
  if (NOTI.has(gi)) continue;
  /* [7.400.0] sonda della SCIVOLATA D'APERTURA: campiona la palla per fotogramma durante l'intro.
     Lo snap del taglio beveva dai props stantii e il pallone STRISCIAVA fino al punto vero — misurato
     38 unita' rasoterra in ~200 ms su gi168 («sembra un teletrasporto» + «traballa tutto», con la
     camera che insegue). Il fix riallinea UNA volta, mascherato dall'intro: quindi UN passo lungo e'
     ammesso, una scivolata CONTINUA (2+ passi oltre 5u) no. */
  /* ⚠️ SI GIUDICA SOLO IL MONDO DELLA SCENA NUOVA. Nel harness il commit React del force arriva
     centinaia di ms dopo la chiamata: i fotogrammi prima del commit appartengono alla scena
     PRECEDENTE (fase, bersagli, driver — tutto suo) e attribuirli alla nuova e' l'errore di
     attribuzione gia' pagato piu' volte in questo repo. Il commit si riconosce dal CAMBIO del
     bersaglio-palla dichiarato: da li' in poi si conta. */
  await page.evaluate(() => {
    window.__CPM_SLD = [];
    if (!window.__CPM_SLDTICK) {
      window.__CPM_SLDTICK = () => {
        try {
          const T = window.__CPM3D, s = window.__CPM_STATE && window.__CPM_STATE();
          if (T && T.ball && s && s.phase === 'hl_intro' && window.__CPM_SLD && window.__CPM_SLD.length < 400)
            window.__CPM_SLD.push({ t: performance.now(), x: T.ball.position.x, z: T.ball.position.z,
              bx: s.ballTarget ? s.ballTarget.x : null, by: s.ballTarget ? s.ballTarget.y : null });
        } catch (e) {}
        requestAnimationFrame(window.__CPM_SLDTICK);
      };
      requestAnimationFrame(window.__CPM_SLDTICK);
    }
  });
  let ok = false;
  try {
    ok = await page.evaluate(g => {
      window.__CPM_FORCE_INTRO = 1; window.__CPM_FORCE_INTRO_MS = 2600;
      return window.__CPM_FORCE_SIT(g, true);
    }, gi);
  } catch (e) {}
  if (!ok) continue;
  await page.waitForFunction(() => {
    try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.phase !== 'hl_intro'; } catch (e) { return false; }
  }, { timeout: 20000 }).catch(() => {});
  await sleep(1100);   /* la consegna d'apertura si assesta */
  const m = await page.evaluate((g) => {
    const s = window.__CPM_STATE && window.__CPM_STATE();
    if (!s || !s.hero || !s.ball) return null;
    const S = (window.__CPM_SITS || [])[g] || null;
    return { dHero: +Math.hypot(s.hero.x - s.ball.x, s.hero.y - s.ball.y).toFixed(1),
      held: s.ball.heldBy || null, bs: S ? (S.ballState || null) : null, type: S ? S.type : null };
  }, gi);
  const sld = await page.evaluate(() => { const a = window.__CPM_SLD || []; window.__CPM_SLD = []; return a; });
  /* il commit della scena nuova = primo cambio del bersaglio dichiarato rispetto al fotogramma zero */
  let i0 = 0;
  if (sld.length > 1 && sld[0].bx != null) {
    for (let i = 1; i < sld.length; i++) if (sld[i].bx !== sld[0].bx || sld[i].by !== sld[0].by) { i0 = i; break; }
  }
  let passiLunghi = 0, passoMax = 0;
  for (let i = Math.max(1, i0 + 1); i < sld.length; i++) {
    const dt = sld[i].t - sld[i - 1].t; if (dt <= 0 || dt > 400) continue;
    const d = Math.hypot(sld[i].x - sld[i - 1].x, sld[i].z - sld[i - 1].z);
    if (d > 5) passiLunghi++; if (d > passoMax) passoMax = d;
  }
  /* UN passo lungo e' il taglio di ri-staging (7.401), mascherato dall'intro: ammesso. Dal secondo
     in poi e' un viaggio. */
  if (passiLunghi >= 2) { guasti.push(`gi${gi}: il pallone SCIVOLA all'apertura — ${passiLunghi} passi oltre 5u nel mondo della scena nuova (max ${passoMax.toFixed(1)}u): il taglio e' UNO, questo e' un viaggio`); righe.push({ gi, dHero: null, held: null, slide: passiLunghi }); console.log(`❌ gi${String(gi).padStart(3)} · SCIVOLATA d'apertura: ${passiLunghi} passi >5u (max ${passoMax.toFixed(1)}u)`); continue; }
  if (!m || m.type === 'def' || m.bs === 'aerial') continue;
  const problemi = [];
  if (!m.held || m.held.dist > ADDOSSO) problemi.push(`palla di NESSUNO alla prima lettura (il piu' vicino sta a ${m.held ? m.held.dist : '?'}u, l'eroe a ${m.dHero}u)`);
  else if (m.held.team === 'away') problemi.push(`palla all'AVVERSARIO (${m.held.role || '?'} a ${m.held.dist}u) su scena offensiva`);
  if (problemi.length) guasti.push(`gi${gi}: ` + problemi.join(' · '));
  righe.push({ gi, dHero: m.dHero, held: m.held });
  if (VERB || problemi.length) console.log(`${problemi.length ? '❌' : '✅'} gi${String(gi).padStart(3)} · eroe↔palla ${String(m.dHero).padStart(5)}u · in possesso: ${m.held ? `${m.held.team}/${m.held.role || '—'} a ${m.held.dist}u` : 'nessuno'}`);
}
await b.close(); srv.close();

if (righe.length < 8) { console.log(`❌ FAIL — solo ${righe.length} aperture misurate: la sonda e' cieca`); process.exit(2); }
const ds = righe.map(r => r.dHero).filter(v => v != null).sort((a, b) => a - b);
console.log(`\naperture al piede misurate ${righe.length} · dist eroe↔palla mediana ${ds[ds.length >> 1].toFixed(1)}u · scene col pallone di nessuno/avversario ${guasti.length}`);
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log(`\n✅ PASS — ogni scena al piede si apre col pallone addosso a un giocatore di casa`);
