#!/usr/bin/env node
/* [7.381.0] GUARDIANO — IL PALLONE NON RESTA INDIETRO NELLA CORSA DELL'AZIONE
   (collaudo PO #83 «Il pallone in corsa rimane dietro all'eroe» · #40 «Il pallone rimane indietro
    all'eroe» · #96 «si perde un po' il pallone per strada durante la corsa»)

   PERCHE' NON BASTAVA `carry-ball-test.mjs`. Quel guardiano e' verde dal 7.323.0, ma misura una
   conduzione DIVERSA: quella MANUALE, in `hl_choose`, col tasto premuto — dove un clamp esplicito
   tiene il pallone un passo davanti al corpo. Le tre note del PO parlano della corsa che il gioco fa
   DA SOLO: il build-up cinematografico che porta l'azione fino alla conclusione.

   ⚠️ E QUEL BUILD-UP NESSUN COLLAUDO L'AVEVA MAI VISTO. L'executor e' spento sotto `?cpmtest=1` —
   scelta giusta per il gate, che deve vedere la conclusione partire subito — e siccome ogni harness
   di questo repo apre il match con quel parametro, in 380 versioni nessuna sonda ci e' mai entrata:
   misurate 140 combinazioni scena/azione, ZERO frame con l'executor vivo. Da qui l'opt-in
   `window.__CPM_CINE`, spento di default.

   COSA MISURA. Nei frame in cui l'executor sta facendo CONDURRE il pallone a qualcuno, la PROIEZIONE
   CON SEGNO del vettore portatore→pallone sulla sua direzione di marcia reale: negativa = il pallone
   e' dietro il corpo. E la distanza, perche' «si perde il pallone per strada» non e' «dietro», e'
   «lontano».

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node carry-run-ball-test.mjs [--glb] [--verbose]        */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const GLB = process.argv.includes('--glb');
const VERB = process.argv.includes('--verbose');
/* il build-up nasce sulle conclusioni di tiro/cross/incornata: queste sono le scene che ce l'hanno */
const SCENE = (process.env.CPM_SCENE || '').length ? process.env.CPM_SCENE.split(',').map(Number)
  : [4, 8, 12, 13, 21, 27, 40, 43, 51, 56, 63, 79, 83, 91, 96, 97, 103, 116, 150, 181];
const PROJ_MIN = -0.10;   /* il pallone non sta MAI dietro il piano del corpo in marcia */
const DIST_MAX = 2.2;     /* e non si allontana mai piu' di un tocco di conduzione */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 360, height: 260 } });
await installCdnRoutes(page);
await page.addInitScript(g => { window.__CPM_GLB = g; window.__CPM_REC = true; window.__CPM_CINE = 1; }, GLB);
await openMatch(page, port); await sleep(800);

const righe = [], guasti = [];
for (const gi of SCENE) {
  for (const k of [0, 1]) {
    let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) { }
    if (!ok) break;
    await sleep(420);
    await page.evaluate(() => { window.__CPM_FROZEN = false; });
    await sleep(160);
    await page.evaluate(() => window.__CPM_REC_DRAIN());
    let r = false; try { r = await page.evaluate(kk => window.__CPM_RESOLVE(kk), k); } catch (e) { }
    if (!r) continue;
    await sleep(2800);
    let fr = []; try { fr = await page.evaluate(() => window.__CPM_REC_DRAIN()); } catch (e) { }

    let tl = 0, n = 0, worst = 99, wd = 0, dietro = 0, lontano = 0; const traccia = [];
    for (let i = 2; i < fr.length; i++) {
      /* SOLO i beat di CONDUZIONE: in un beat di passaggio il pallone corre da solo, ed e' giusto cosi'.
         E il PORTATORE lo dichiara il renderer (`tc`) — dedurlo dal mesh piu' vicino al pallone significa
         misurare sul corpo di un avversario in pressing appena l'offset si accorcia. */
      const c = fr[i]; if (c.tl !== 1 || c.tk !== 'carry' || !c.tc) continue; tl++;
      const a = fr[i - 2]; if (!a.tc) continue;
      const mx = c.tc[0] - a.tc[0], mz = c.tc[1] - a.tc[1], ml = Math.hypot(mx, mz);
      if (ml < 0.06) continue;                       /* fermo: nessuna direzione di marcia */
      if ((c.b[2] || 0) > 1.6) continue;             /* in volo: non e' conduzione */
      const bd = Math.hypot(c.b[0] - c.tc[0], c.b[1] - c.tc[1]);
      n++;
      const proj = ((c.b[0] - c.tc[0]) * mx + (c.b[1] - c.tc[1]) * mz) / ml;
      if (proj < worst) worst = proj;
      if (bd > wd) wd = bd;
      if (proj < PROJ_MIN) dietro++;
      if (bd > DIST_MAX) lontano++;
      /* la traccia dei fotogrammi vive sempre: un guardiano che dice «e' rosso» senza dire DOVE
         costringe a riprodurre a mano un difetto intermittente, ed e' la parte piu' cara */
      traccia.push({ t: c.t, proj: +proj.toFixed(2), d: +bd.toFixed(2), passo: +ml.toFixed(3), tc: c.tc, b: [c.b[0], c.b[1], c.b[2]] });
    }
    if (!tl) continue;
    const pass = n === 0 || (dietro === 0 && lontano === 0);
    if (!pass) guasti.push(`gi${gi}/az${k}: ${dietro}/${n} frame col pallone DIETRO il portatore (peggio ${worst.toFixed(2)}u) · ${lontano} frame oltre ${DIST_MAX}u (max ${wd.toFixed(2)}u)`);
    righe.push({ gi, k, tl, n, worst, wd, dietro, lontano });
    if (!pass && traccia.length) { console.log(`   traccia gi${gi}/az${k} (primi 20 dei ${traccia.length} campioni):`);
      traccia.slice(0, 20).forEach(q => console.log(`     proj ${(q.proj >= 0 ? '+' : '') + q.proj}u · d ${q.d}u · passo ${q.passo}u · portatore [${q.tc}] · palla [${q.b[0]},${q.b[1]},y${q.b[2]}]`)); }
    if (VERB || !pass) console.log(`${pass ? '✅' : '❌'} gi${String(gi).padStart(3)}/az${k} · frame build-up ${String(tl).padStart(3)} · campioni ${String(n).padStart(3)} · proiezione peggiore ${worst === 99 ? '   —' : (worst >= 0 ? '+' : '') + worst.toFixed(2) + 'u'} · dietro ${String(dietro).padStart(3)} · distanza max ${wd.toFixed(2)}u`);
  }
}
await b.close(); srv.close();

if (!righe.length) { console.log('❌ FAIL — l\'executor non si e\' mai acceso: la sonda e\' cieca, non il gioco sano'); process.exit(2); }
const con = righe.filter(r => r.n > 0);
const wp = con.map(r => r.worst).sort((x, y) => x - y), wdd = con.map(r => r.wd).sort((x, y) => x - y);
console.log(`\nscene col build-up vivo ${righe.length} · con conduzione misurabile ${con.length} · campioni ${con.reduce((s, r) => s + r.n, 0)}`);
if (con.length) console.log(`mediana proiezione peggiore ${wp[wp.length >> 1].toFixed(2)}u · mediana distanza max ${wdd[wdd.length >> 1].toFixed(2)}u · frame dietro ${con.reduce((s, r) => s + r.dietro, 0)} · frame lontani ${con.reduce((s, r) => s + r.lontano, 0)}`);
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log(`\n✅ PASS — nel build-up il pallone resta davanti al corpo di chi lo conduce`);
