#!/usr/bin/env node
/* [7.374.0] GUARDIANO ESITO↔REALTA' — collaudo PO: «l'esito dichiarato è "chance" ma la palla è
   finita IN RETE» (#97 «Scarta il portiere in uscita», dribbling) e la stessa cosa con «save»
   (#13 «Punizione dal limite — tiro diretto»).

   PERCHE' IL GATE NON LO VEDEVA. Il check `timeline` (LMQP-6) valida la SEMANTICA della decisione:
   che la outcome key sia nota e che `ok` sia coerente con la key. E' un controllo logico, e su
   queste scene passa — «chance» è una key valida e `ok:true` è coerente. Quello che nessuno
   confrontava è la key DICHIARATA con dove la palla è FISICAMENTE finita. La regola esiste già nel
   gioco (`draftBugNote`, il taccuino che il PO usa) ma vive solo lì: qui la si porta nella suite,
   con la STESSA geometria, così taccuino e guardiano non possono dire due cose diverse.

   GEOMETRIA: dentro = oltre la linea di porta (48.6), |z| < 3.66 (semi-larghezza REALE dei pali)
   e quota < 2.44 (traversa).

   ⚠️ SI GIUDICA DOVE LA PALLA SI FERMA, NON DOVE PASSA — e questa e' una lezione pagata proprio
   qui. Il primo criterio prendeva la penetrazione MASSIMA di tutto il volo con semi-larghezza 3,9:
   un tiro che sfiora il palo dall'esterno, o che ci rimbalza sopra, attraversa quella zona per un
   fotogramma e veniva denunciato come «gol dichiarato miss». Ha prodotto due allarmi su due, gi13
   (un `post` che finisce a x 34,6) e gi51 (che finisce a z -5,8, fuori dai pali). Campionamento a
   frequenza di fotogramma DENTRO la pagina, ma il giudizio sull'ultimo campione a palla ferma.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node outcome-reality-test.mjs                     */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const STEP = +(process.env.OR_STEP || 4);
const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
/* [7.388.0] ⚠️ CON O SENZA LA COSTRUZIONE DELL'AZIONE. Questo guardiano e' stato verde per tutta la sua
   vita mentre il PO segnalava dal vivo, tre volte, «l'esito dichiarato e' goal ma la palla non e' mai
   arrivata in porta». La ragione e' la stessa gia' pagata nel 7.381 e nel 7.384: sotto `?cpmtest=1`
   l'executor cinematografico e' spento, quindi la conclusione parte da uno stato che nel gioco vero non
   esiste. `--cine` lo riaccende (opt-in `__CPM_CINE`) e misura la scena che il giocatore vede davvero. */
const CINE = process.argv.includes('--cine');
await page.addInitScript(c => { window.__CPM_GLB = false; if (c) { window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; } }, CINE);
const { total } = await openMatch(page, port);
await sleep(800);

/* campionatore per-fotogramma: tiene l'ULTIMA posizione nota della palla (giudizio a palla ferma) */
await page.evaluate(() => {
  window.__ORLAST = null;
  window._inNet = () => { const L = window.__ORLAST; return !!(L && L.x >= 48.3 && Math.abs(L.z) < 3.66 && L.y < 2.44); };
  const tick = () => {
    try {
      const b = window.__CPM_BALL ? window.__CPM_BALL() : null;
      if (b && window.__ORON) {
        /* __CPM_BALL torna coordinate di GIOCO (0-100) + worldY; la geometria della porta è in
           coordinate mondo, quindi si riconverte come fa il gioco: wx = gx-50, wz = (gy-50)*0.68 */
        /* [7.374.0] SI GIUDICA DOVE LA PALLA SI FERMA, NON DOVE PASSA. Il primo criterio prendeva la
           penetrazione MASSIMA su tutto il volo con semi-larghezza 3,9 (i pali veri stanno a 3,66):
           un tiro che sfiora il palo dall'esterno, o che rimbalza sul montante, attraversa per un
           fotogramma quella zona e veniva denunciato come «gol dichiarato miss». Misurato: gi13 opt0
           e' un `post` che finisce a x 34,6, gi51 finisce a z -5,8 — due falsi allarmi su due.
           La regola giusta e' quella che il taccuino del gioco usa da sempre: conta la posizione a
           palla FERMA, con la geometria reale della porta. */
        window.__ORLAST = { x: b.x - 50, z: (b.y - 50) * 0.68, y: b.worldY };
      }
    } catch (e) {}
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

let misurati = 0; const mismatch = [];
for (let gi = 0; gi < total; gi += STEP) {
  for (const esito of ['success', 'fail']) {
    await page.evaluate(g => {
      window.__ORLAST = null; window.__ORON = 0;
      try { window.__CPM_TIMELINE_RESET && window.__CPM_TIMELINE_RESET(); } catch (e) {}
      window.__CPM_FORCE_SIT(g, true);
    }, gi);
    await sleep(520);
    await page.evaluate(e => { window.__ORON = 1; window.__CPM_FORCE_OUTCOME = e; try { window.__CPM_RESOLVE(0); } catch (x) {} }, esito);
    await sleep(3400);
    const r = await page.evaluate(() => {
      window.__ORON = 0;
      const tl = (typeof window.__CPM_TIMELINE === 'function' ? window.__CPM_TIMELINE() : []) || [];
      const ar = tl.filter(e => e.type === 'ActionResolved').pop();
      return { inNet: window._inNet(), key: ar ? (ar.key || null) : null, ok: ar ? ar.ok : null, intent: ar ? ar.intent : null };
    });
    if (!r.key) continue;
    misurati++;
    /* la palla in rete è LEGITTIMA su gol, in_net e assist (segna il compagno). Il falso si denuncia
       solo quando l'esito dichiarato non prevede in nessun modo il pallone dentro. */
    const netKey = /goal|in_net|assist/i.test(String(r.key));
    if (r.inNet && !netKey) mismatch.push({ gi, esito, key: r.key, ok: r.ok, intent: r.intent });
  }
}

/* I PIAZZATI VANNO COPERTI A PARTE, ed e' il motivo per cui la prima passata di questo guardiano
   diceva «tutto a posto» mentre il PO aveva visto il difetto proprio li': rigori e punizioni non
   passano da `__CPM_RESOLVE` — la scelta si fa da overlay. Un setaccio che salta un'intera strada
   non e' verde, e' cieco sulla meta' del gioco. */
const SPGIS = await page.evaluate(() => {
  const out = []; const S = window.__CPM_SITS || [];
  for (let i = 0; i < S.length && out.length < 6; i++) {
    const s = S[i]; if (!s) continue;
    const it = (typeof window.deriveIntent === 'function') ? window.deriveIntent(s) : null;
    if (it === 'penalty' || it === 'freekick') out.push(i);
  }
  return out;
});
let spMis = 0;
for (const gi of SPGIS) {
  for (let opt = 0; opt < 3; opt++) {
    await page.evaluate(g => {
      window.__ORLAST = null; window.__ORON = 0;
      try { window.__CPM_TIMELINE_RESET && window.__CPM_TIMELINE_RESET(); } catch (e) {}
      window.__CPM_FORCE_SIT(g, true);
    }, gi);
    await sleep(820);
    const cliccato = await page.evaluate(o => {
      window.__ORON = 1;
      const bs = [...document.querySelectorAll('button')].filter(b => /incrocio|potenza|angolo|cucchiaio|barriera|curva|rasoterra|forte|preciso|giro/i.test((b.textContent || '')));
      if (!bs.length || !bs[o]) return null;
      bs[o].click(); return true;
    }, opt);
    if (!cliccato) continue;
    await sleep(4000);
    const r = await page.evaluate(() => {
      window.__ORON = 0;
      const tl = (typeof window.__CPM_TIMELINE === 'function' ? window.__CPM_TIMELINE() : []) || [];
      const ar = tl.filter(e => e.type === 'ActionResolved').pop();
      return { inNet: window._inNet(), key: ar ? (ar.key || null) : null, ok: ar ? ar.ok : null, kind: ar ? ar.outKind : null };
    });
    if (!r.key) continue;
    misurati++; spMis++;
    const netKey = /goal|in_net|assist/i.test(String(r.key));
    if (r.inNet && !netKey) mismatch.push({ gi, esito: 'piazzato/' + (r.kind || '?'), key: r.key, ok: r.ok, intent: 'set_piece' });
  }
}

console.log(`azioni misurate ${misurati} (1 scena ogni ${STEP} + ${spMis} piazzati) · incoerenze ${mismatch.length}`);
mismatch.slice(0, 25).forEach(m => console.log(`  gi${String(m.gi).padStart(3)} [${m.esito}] esito dichiarato «${m.key}» (ok=${m.ok}, intent=${m.intent}) ma la palla è finita IN RETE`));

if (misurati < 20) issues.push(`solo ${misurati} azioni osservate: la misura non e' stata fatta`);
else if (mismatch.length) issues.push(`${mismatch.length} azioni su ${misurati} dichiarano un esito che la palla smentisce (palla in rete con esito non-gol)`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ ' + issues.length + ' problemi:'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log("\n✅ ESITO↔REALTA' OK — nessuna azione dichiara un esito che la palla smentisce");
