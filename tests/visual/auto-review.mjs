#!/usr/bin/env node
/* [7.223.0 direttiva PO «non c'è altro modo per testare come me dal wizard in maniera automatica, con lo stesso
   occhio critico e note?»] IL CRITICO AUTOMATICO.
   ----------------------------------------------------------------------------------------------------------
   Percorre le STESSE combinazioni del wizard di revisione (situazione × azione visibile × esito riuscito/fallito),
   le gioca davvero e le giudica con CRITERI MISURABILI, scrivendo le bocciature nel formato dell'export del
   wizard — così una regressione si legge esattamente come la leggerebbe il proprietario.
   Non sostituisce l'occhio umano: sostituisce la PAZIENZA. Su 1096 combinazioni una persona si stanca alla
   trecentesima, e i difetti di questa sessione (il pallonetto universale, la palla nell'erba sulle aeree, il
   protagonista fuori inquadratura, il compagno del filtrante a 26 metri) erano tutti misurabili con un numero.
   Quello che NON sa giudicare — «non si capisce che è un dribbling» — resta al secondo passaggio (AI Vision)
   e a te.
   ----------------------------------------------------------------------------------------------------------
   ⚠️ STATO DEI CRITERI. Quattro sono FIDATI: poggiano su misure che in questa sessione sono state verificate
   nei due sensi (rotte prima del fix, sane dopo). Due sono ANCORA IN CALIBRAZIONE e vengono emessi come
   «sospetti» finché non superano la stessa controprova: LOB e RETE misurano oggi valori che non tornano con
   la geometria nota (apici di 6-8 m dove il modello analitico ne calcola 3.5, e gol in cui il pallone si ferma
   a 4 unità dalla linea) — o c'è un difetto vero non ancora capito, o la finestra di campionamento include
   ancora una fase che non è la conclusione. Finché non è chiaro quale delle due, NON vanno usati per aprire
   correzioni: un numero che non si sa spiegare non è una prova.

   CRITERI (i primi quattro nascono da una segnalazione reale e sono verificati in negativo):
     AER  azione aerea giocata con il pallone sull'erba          (rovesciata/stacco/volée)
     CAM  il protagonista non è in inquadratura                   (dribbling «non si vede l'eroe»)
     ATT  gli attori dichiarati dall'azione non sono in scena     (dai e vai / filtrante / cross senza nessuno)
     TEC  la tecnica nominata dall'azione non è quella resa       («piazzato basso» che esce come pallonetto)
     LOB  conclusione con apice sopra la traversa                  («sembra sempre un pallonetto»)
     RETE gol in cui il pallone non supera mai la linea di porta
     ERR  errore JavaScript durante la scena
   Uso:  node auto-review.mjs                    (tutte le situazioni, 1ª azione, entrambi gli esiti)
         AR_ACTS=3 AR_GI=0-40 node auto-review.mjs
         AR_FULL=1 node auto-review.mjs          (tutte le combinazioni: lungo)
   Output: elenco bocciature nel formato del wizard + riepilogo per criterio + out/auto-review.json */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const OUT = new URL('./out/auto-review.json', import.meta.url);
const ACTS = Math.max(1, +(process.env.AR_ACTS || (process.env.AR_FULL ? 9 : 1)));
const RANGE = (process.env.AR_GI || '').match(/^(\d+)-(\d+)$/);
const CROSSBAR = 2.44, GOAL_X = 48.6;
const G2X = gx => gx - 50, G2Z = gy => (gy - 50) * 0.68;

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 800, height: 700 } });
await installCdnRoutes(page);
let pageErr = null;
page.on('pageerror', e => { pageErr = String(e.message).slice(0, 120); });
/* __CPM_REVIEW abilita la forzatura dell'esito SENZA toccare la presentazione (a differenza di ?cpmtest=1):
   è la stessa modalità in cui gira il wizard, quindi si giudica ciò che il proprietario vedrebbe. */
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REVIEW = true; });
const { total } = await openMatch(page, port);
await page.evaluate(() => { window.__CPM_REC = true; });

/* le combinazioni del WIZARD: solo le azioni VISIBILI (non si giudica ciò che il giocatore non vedrà) */
const combos = await page.evaluate((nAct) => {
  const out = [];
  (window.__CPM_SITS || []).forEach((s, gi) => {
    const acts = (window.filterSitActions ? window.filterSitActions(s, 70, {}) : null) || s.actions || [];
    const idx = (acts.length ? acts : s.actions).map(a => s.actions.indexOf(a)).filter(i => i >= 0);
    idx.slice(0, nAct).forEach(ai => {
      const d = window.deriveHL(s, s.actions[ai]);
      out.push({ gi, ai, txt: s.text, lbl: s.actions[ai].label, type: d.type, variant: d.variant,
                 ball: window.hlBallState(s), rew: s.actions[ai].rew, sup: (s.tactic && s.tactic.support) || 0,
                 ndef: (s.tactic && s.tactic.nearby_def) || 0 });
    });
  });
  return out;
}, ACTS);
const sel = combos.filter(c => !RANGE || (c.gi >= +RANGE[1] && c.gi <= +RANGE[2]));
console.log(`situazioni ${total} · combinazioni da giudicare ${sel.length * 2} (${sel.length} × 2 esiti)\n`);

/* la tecnica NOMINATA dall'azione e la variante che deve renderla */
const TEC = [
  [/pallonett|cucchiaio|scavin/, ['shot_chip', 'penalty_panenka'], 'un pallonetto'],
  [/piazzat.*(bass|raso)|rasoterra/, ['shot_one_on_one', 'freekick_cross_low', 'freekick_direct'], 'una conclusione rasoterra'],
  [/a giro|giro\b/, ['shot_curled', 'freekick_direct'], 'un tiro a giro'],
  [/vol[eé]e|al volo|rovesciat|sforbiciat/, ['shot_volley'], 'una giocata al volo'],
  [/di testa|incornat|stacco/, ['header_diving', 'header_near_post', 'header_far_post'], 'un colpo di testa'],
];
const rows = [];
const add = (c, ok, code, nota) => rows.push({ ...c, ok, code, nota });

let n = 0;
for (const c of sel) {
  for (const ok of [true, false]) {
    n++;
    pageErr = null;
    await page.evaluate(() => { try { window.__CPM_REC_DRAIN(); } catch (e) {} });
    await page.evaluate(([gi, ai, okk]) => {
      const s = window.__CPM_SITS[gi], sz = s.startZone || s.zones;
      window.__CPM_FORCE_SIT(gi, true);
      setTimeout(() => { try { window.__CPM_FORCE_OUTCOME = okk ? 'success' : 'fail'; window.__CPM_RESOLVE(ai); } catch (e) {} }, 420);
    }, [c.gi, c.ai, ok]);
    await sleep(2600);/* [calibrazione] 1.5s non bastavano: a ~6 fps headless il post-arco dell ingresso in rete veniva TAGLIATO a meta e ogni gol risultava «mai entrato». Verificato tracciando la x del pallone frame per frame. */
    const st = await page.evaluate(() => { try { const s = window.__CPM_STATE(); return { hOn: !!s.hero.onScreen, hx: s.hero.ndc.x, bx: s.ball.x, by: s.ball.y }; } catch (e) { return null; } });
    const fr = await page.evaluate(() => (window.__CPM_REC_DRAIN ? window.__CPM_REC_DRAIN() : []));
    if (pageErr) { add(c, ok, 'ERR', `errore JavaScript nella scena: ${pageErr}`); continue; }
    if (!fr.length || !st) { add(c, ok, 'ERR', 'scena non campionabile'); continue; }

    /* — AER: una giocata aerea non può avvenire con il pallone sull'erba — */
    if (c.ball === 'aerial' && /header|shot/.test(c.type)) {
      /* [7.227.0] servono ≥2 frame CONSECUTIVI bassi: il primissimo frame dopo il force può ancora leggere i
         prop della scena precedente (React non ha committato) e produce un singolo 0.65 fantasma — misurato
         su gi9, dove tutti i frame successivi tengono la quota aerea. Un pallone davvero a terra ci RESTA. */
      const pre = fr.slice(1, Math.max(4, Math.floor(fr.length * 0.45))).map(f => f.b && f.b[2]).filter(v => typeof v === 'number');
      let low = 0, lowMax = 0, lowMin = null;
      pre.forEach(v => { if (v < 1.0) { low++; lowMax = Math.max(lowMax, low); if (lowMin == null || v < lowMin) lowMin = v; } else low = 0; });
      if (lowMax >= 2) add(c, ok, 'AER', `giocata aerea con il pallone a ${lowMin.toFixed(2)} m — è praticamente a terra`);
    }
    /* — CAM: il protagonista deve stare in quadro (il difetto «non si vede l'eroe») — */
    const offN = fr.filter(f => f.h && Math.abs(f.h[0]) > 900).length; // guardia difensiva, non usata
    if (st.hOn === false || Math.abs(st.hx) > 1) add(c, ok, 'CAM', `il protagonista è fuori inquadratura (bordo schermo ${st.hx.toFixed(2)}, il limite è 1.00)`);
    /* — ATT: gli attori dichiarati dall'azione devono essere in scena — */
    {
      const f = fr[Math.floor(fr.length * 0.6)] || fr[fr.length - 1];
      /* [7.224.0] ATT misura lo strato LOGICO (lp/ht), non i mesh: sotto ?cpmtest=1 lo snap di scena dei mesh
         è volutamente spento, quindi qui i mesh restano dove stavano anche quando la regia è corretta — nel
         WIZARD (la presentazione che giudica il PO) i mesh snappano proprio sulle posizioni logiche, verificato
         con la probe in condizioni reali (2.6-3.9u). Misurare i mesh sotto test = bocciare la modalità test. */
      if (f && f.ht && f.ht[0] != null && f.lp && f.lp.length) {
        const W = (x, y) => [x - 50, (y - 50) * 0.68];
        const hw = W(f.ht[0], f.ht[1]);
        let nm = 1e9, no = 1e9;
        f.lp.forEach((q, i) => { if (!q || i === 0 || i === 10) return; const w = W(q[0], q[1]); const d = Math.hypot(w[0] - hw[0], w[1] - hw[1]); if (i < 10) { if (d < nm) nm = d; } else if (d < no) no = d; });
        const needMate = (c.rew === 'assist') || /pass|cross|build/.test(c.type) || /dai e vai|servi|scarico|appoggio|corta/.test(c.lbl.toLowerCase());
        const needFoe = (c.type === 'dribble') || (c.ndef >= 2) || /dribbl|supera|duello|salta/.test(c.lbl.toLowerCase());
        if (needMate && nm > 18) add(c, ok, 'ATT', `l'azione serve un compagno ma il più vicino è a ${nm.toFixed(0)} m`);
        if (needFoe && no > 12) add(c, ok, 'ATT', `l'azione serve un avversario da superare ma il più vicino è a ${no.toFixed(0)} m`);
      }
    }
    /* — TEC: la tecnica nominata deve essere quella resa — */
    for (const [rx, vars, nome] of TEC) {
      if (!rx.test(c.lbl.toLowerCase())) continue;
      if (c.variant && !vars.includes(c.variant)) add(c, ok, 'TEC', `l'azione annuncia ${nome} ma la traiettoria resa è «${c.variant}»`);
      break;
    }
    /* — LOB / RETE: la traiettoria della conclusione — */
    const ys = fr.map(f => f.b && f.b[2]).filter(v => typeof v === 'number');
    const xs = fr.map(f => f.b && f.b[0]).filter(v => typeof v === 'number');
    if (/shot|header|penalty|freekick/.test(c.type) && ys.length) {
      /* [calibrazione] l'apice va misurato sulla CONCLUSIONE, non sulla costruzione: il build-up ha segmenti
         propri (un cross di costruzione arriva a ~4.9 m ed è legittimo) e includerli faceva risultare
         «pallonetto» ogni azione che nasce da un traversone. Si guarda perciò la seconda metà della scena. */
      const pk = Math.max(...ys.slice(Math.floor(ys.length * 0.5)));
      if (pk > CROSSBAR + 1.6 && !/pallonett|cucchiaio|scavin/.test(c.lbl.toLowerCase()))
        add(c, ok, 'LOB', `la conclusione tocca ${pk.toFixed(1)} m contro una traversa di ${CROSSBAR} m — legge come un pallonetto`);
    }
    /* [7.227.0 — spiegato, esce dalla calibrazione] la valanga di falsi RETE era la FINESTRA: a ~6 fps headless
       col bullet-time dell'esito (0.28×) l'arco del gol parte ~1.3s dopo il resolve e attraversa la linea OLTRE
       i 2.6s campionati — il pallone «non supera mai la linea» solo perché il campione finisce prima. Coi campi
       arc/pa nel frame (strumentazione 7.227.0) il criterio distingue: se a fine finestra il volo è ANCORA in
       corso (arc attivo, o executor in build-up, o post-arco d'ingresso in rete) il gol sta semplicemente
       arrivando — flag solo quando la scena è FERMA e la palla non ha mai superato la linea. */
    if (ok && c.rew === 'goal' && xs.length && Math.max(...xs) < GOAL_X - 1.5) {
      const tailFly = fr.slice(-3).some(f => f && (f.arc || f.tl || /in_net/.test(f.pa || '')));
      if (!tailFly) add(c, ok, 'RETE', `gol assegnato ma il pallone non supera mai la linea (arriva a ${(Math.max(...xs)).toFixed(1)}, la linea è ${GOAL_X}) e la scena è ferma`);
    }

    if (n % 40 === 0) console.log(`  …${n}/${sel.length * 2} · bocciature finora ${rows.length}`);
  }
}
await browser.close(); srv.close();

/* ── report nel formato dell'export del wizard ── */
const LBL = { AER: 'palla non aerea', CAM: 'protagonista fuori quadro', ATT: 'attori assenti', TEC: 'tecnica non resa', LOB: 'pallonetto involontario ⚠️ in calibrazione', RETE: 'gol senza rete ⚠️ in calibrazione', ERR: 'errore' };
const TRUST = new Set(['AER', 'CAM', 'ATT', 'TEC', 'ERR']);// gli altri restano sospetti finché non superano la controprova
const byCode = {};
for (const r of rows) (byCode[r.code] = byCode[r.code] || []).push(r);
const firm = rows.filter(r => TRUST.has(r.code)), susp = rows.filter(r => !TRUST.has(r.code));
console.log(`\n— bocciature su criteri VERIFICATI: ${firm.length} su ${sel.length * 2} combinazioni —`);
for (const r of firm) console.log(`gi${r.gi} · ${r.txt} · azione: ${r.lbl} · esito: ${r.ok ? 'RIUSCITO' : 'FALLITO'} · nota: [${r.code}] ${r.nota}`);
if (susp.length) { console.log(`\n— segnalazioni SOSPETTE (criteri in calibrazione, da non usare per correggere): ${susp.length} —`);
  for (const r of susp.slice(0, 12)) console.log(`gi${r.gi} · azione: ${r.lbl} · esito: ${r.ok ? 'RIUSCITO' : 'FALLITO'} · [${r.code}] ${r.nota}`); }
console.log('\n— riepilogo per criterio —');
for (const k of Object.keys(byCode).sort((a, b) => byCode[b].length - byCode[a].length))
  console.log(`  ${k.padEnd(5)} ${String(byCode[k].length).padStart(4)}  ${LBL[k] || ''}`);
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ combos: sel.length * 2, rows }, null, 1));
console.log(`\ndettaglio → tests/visual/out/auto-review.json`);
process.exit(0);
