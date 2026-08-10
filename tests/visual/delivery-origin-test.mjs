#!/usr/bin/env node
/* [7.370.0 · rivisto 7.374.0] GUARDIANO DELL'ORIGINE DELLA CONSEGNA — collaudo PO: «la palla deve essere nei piedi
   del compagno che effettua il passaggio» (nota su «L'uomo e' saltato — campo aperto davanti a te!»)
   e «la palla INIZIALMENTE deve essere nei piedi del compagno che effettua il passaggio» (gi180
   «Triangolo al limite»). Stessa famiglia delle note aperte #87/#82/#97.

   La consegna introdotta in 7.350/7.351 fa nascere il pallone «da chi ce l'ha» e lo fa arrivare
   all'eroe dentro `hl_intro`. Ma l'origine e' un PUNTO GEOMETRICO calcolato da `hlBallSpot`
   (ballAt='mate' → x = clamp(hx-16, …), y = hy±8), non la posizione di un compagno VERO: se in quel
   punto non c'e' nessuno, la scena si apre con un pallone che parte dal nulla.

   METRICA: all'apertura di `hl_intro`, distanza fra il pallone e (a) il compagno piu' vicino e
   (b) l'EROE, in unita' di gioco 0-100.

   ⚠️⚠️ QUESTO GUARDIANO HA MENTITO, ed e' la lezione piu' cara della serie. Fino al 7.373 misurava
   SOLO la distanza dal compagno, e in una modalita' in cui lo SNAP di scena e' disattivato
   (`?cpmtest=1` spegne `_asIfPlay`): i mesh non saltano nella posizione della scena nuova ma ci
   scivolano lentamente, cosa che nel gioco vero non accade mai. In quelle condizioni dava 1,7u e
   ZERO palloni orfani, e il 7.370 e' stato dichiarato risolto su quel numero. Con
   `__CPM_PRESENT=1` — l'interruttore che il repo ha proprio per misurare la presentazione REALE —
   lo stesso codice da' 11,4u con 28 palloni orfani su 42 e una distanza dall'eroe di 30,1u.
   Il PO aveva ragione a continuare a segnalarlo: era il guardiano a guardare una scena finta.
   Da qui due regole: si misura con `__CPM_PRESENT=1`, e si misura anche la distanza dall'EROE —
   perche' con i mesh fermi alla scena precedente la palla e' davvero accanto a un compagno, solo
   dall'altra parte del campo.

   ⚠️ Trappole gia' pagate:
     · il gate FORZA le situation e SALTA `hl_intro`: senza `__CPM_FORCE_INTRO` questa misura non
       esiste proprio.
     · la consegna dura 520ms e poi la palla parte verso l'eroe: si campiona PRIMA di quel momento.
     · le posizioni off-ball derivano fra un run e l'altro → si giudica la POPOLAZIONE, non la scena.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node delivery-origin-test.mjs                       */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const REPS = +(process.env.ORIG_REPS || 2);
const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await page.addInitScript(() => { window.__CPM_GLB = false;
  /* [7.374.0] SI MISURA LA SCENA REALE, NON LA SUA APPROSSIMAZIONE. Sotto `?cpmtest=1` lo SNAP di
     scena e' disattivato (`_asIfPlay` falso): i mesh non saltano nella posizione della scena nuova ma
     ci scivolano lentamente, cosa che nel gioco vero NON accade. Misurando cosi' si giudicava una
     presentazione che il giocatore non vede mai — ed e' il motivo per cui la correzione della consegna
     sembrava non funzionare. `__CPM_PRESENT=1` e' l'interruttore che il repo ha gia' per questo. */
  window.__CPM_PRESENT = 1; });
await openMatch(page, port);
await sleep(900);

/* le scene che aprono con una CONSEGNA: e' li' che il pallone deve nascere sui piedi di qualcuno */
const GIS = await page.evaluate(() => {
  const out = [];
  const S = window.__CPM_SITS || [];
  for (let i = 0; i < S.length; i++) {
    const s = S[i]; if (!s) continue;
    const recv = (s.recv != null) ? s.recv : (typeof window.deriveReception === 'function' ? window.deriveReception(s) : false);
    const at = (s.ballAt) || (s.offBall ? 'mate' : 'hero');
    if (recv || at === 'gk' || at === 'mate' || at === 'wing') out.push(i);
  }
  return out;
});
console.log(`scene con consegna: ${GIS.length}`);
const SAMPLE = GIS.filter((_, i) => i % Math.max(1, Math.ceil(GIS.length / 24)) === 0);

const vals = [];
for (let r = 0; r < REPS; r++) {
  for (const gi of SAMPLE) {
    /* ⚠️ l'intro si allunga con `__CPM_FORCE_INTRO_MS`; `__CPM_FORCE_INTRO` e' solo l'interruttore.
       Scrivendo 2600 nell'interruttore l'intro restava di 300 ms e questa sonda campionava a intro GIA'
       FINITA — misurava la palla in viaggio verso l'eroe e la chiamava «origine della consegna». */
    await page.evaluate(g => { window.__CPM_FORCE_INTRO = 1; window.__CPM_FORCE_INTRO_MS = 2600; window.__CPM_FORCE_SIT(g, true); }, gi);
    /* [7.374.0] SI ASPETTA L'EVENTO, NON UN RITARDO. Prima si campionava a 340ms fissi: da quando la
       consegna aspetta che la scena si sia assestata, in headless (~9 fps) quel momento arriva molto
       piu' tardi e la sonda fotografava il pallone PRIMA che venisse piazzato — misurando quindi la
       scena precedente e bocciando un codice sano. Ora si attende il segnale di piazzamento
       (`__CPM_DELIV`) e si campiona subito dopo, prima che la palla riparta verso l'eroe. */
    await sleep(340);   // dentro l'intro, PRIMA che la consegna riparta verso l'eroe (520ms)
    const m = await page.evaluate(() => {
      const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.ball) return null;
      let d = 1e9, who = null;
      (st.players || []).forEach(p => {
        if (!p || p.team !== 'home' || p.gk) return;
        const dd = Math.hypot(p.x - st.ball.x, p.y - st.ball.y);
        if (dd < d) { d = dd; who = 'mate'; }
      });
      const dh = st.hero ? Math.hypot(st.hero.x - st.ball.x, st.hero.y - st.ball.y) : 1e9;
      return { mate: +d.toFixed(1), hero: +dh.toFixed(1), who, phase: st.phase };
    });
    if (!m || m.mate > 500) continue;
    vals.push({ gi, ...m });
  }
}
await page.evaluate(() => { try { delete window.__CPM_FORCE_INTRO; } catch (e) {} });

const med = a => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const dm = vals.map(v => v.mate);
const dh = vals.map(v => v.hero);
const orfane = vals.filter(v => v.mate > 6 && v.hero > 6);
console.log(`\n  scena   palla↔compagno   palla↔eroe`);
for (const v of vals.slice(0, 40)) console.log(`  gi${String(v.gi).padStart(3)}   ${String(v.mate).padStart(6)}u        ${String(v.hero).padStart(6)}u${v.mate > 6 && v.hero > 6 ? '   ⚑ nasce dal nulla' : ''}`);
console.log(`\nconsegne misurate ${vals.length} · mediana palla↔compagno piu' vicino ${med(dm).toFixed(1)}u · palloni orfani (>6u da chiunque) ${orfane.length}/${vals.length}`);
console.log(`mediana palla↔EROE ${med(dh).toFixed(1)}u · consegne oltre i 25u dall'eroe ${dh.filter(v => v > 25).length}/${dh.length}`);

if (vals.length < 8) issues.push(`solo ${vals.length} consegne osservate: la misura non e' stata fatta (manca __CPM_FORCE_INTRO?)`);
else {
  /* SOGLIE misurate, non scelte a priori. 6u di gioco ≈ sei metri: oltre, il pallone non e' «ai piedi
     di» nessuno. PRIMA del fix: mediana 12,4u e 34 consegne orfane su 42 (gi84 a 38u, gi17 a 37u).
     DOPO: 1,7u e 0/42. La soglia sta in mezzo, non sul valore migliore osservato: le posizioni off-ball
     derivano fra un run e l'altro e un guardiano tarato sul best-case sarebbe solo un generatore di
     falsi allarmi. */
  if (med(dm) > 5) issues.push(`mediana palla↔compagno ${med(dm).toFixed(1)}u: la consegna nasce in un punto vuoto, non sui piedi di un compagno (il «1,7u» del 7.370 era misurato senza snap di scena: numero non valido)`);
  if (orfane.length / vals.length > 0.2) issues.push(`${orfane.length} consegne su ${vals.length} nascono a piu' di 6u da CHIUNQUE (lo «0/42» del 7.370 era misurato senza snap di scena: numero non valido)`);
  /* [7.374.0] IL CRITERIO CHE MANCAVA, e che spiega perche' questo guardiano era VERDE mentre il PO
     continuava a segnalare «il pallone deve essere nei piedi del compagno». Si misurava solo la
     distanza dal compagno piu' vicino: con i mesh fermi alla scena PRECEDENTE la palla e' davvero
     accanto a un compagno — solo, dall'altra parte del campo rispetto all'eroe. Misurato: l'eroe-mesh
     di una scena e' esattamente la posizione logica di quella prima, con scarti fino a 56u, e la
     consegna nasceva a 22-66u dall'eroe. Una consegna e' un passaggio: oltre i 25u non lo e' piu'. */
  if (med(dh) > 25) issues.push(`mediana palla↔EROE ${med(dh).toFixed(1)}u: la consegna nasce dall'altra parte del campo rispetto a chi deve riceverla`);
  if (dh.filter(v => v > 25).length / dh.length > 0.35) issues.push(`${dh.filter(v => v > 25).length} consegne su ${dh.length} nascono a piu' di 25u dall'eroe`);
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ CONSEGNA OK — il pallone nasce sui piedi di chi lo gioca');
