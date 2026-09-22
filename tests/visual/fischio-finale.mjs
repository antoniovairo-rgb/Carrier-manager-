/* [G16 · 22/09] PERCHE' IL POST-PARTITA A VOLTE NON ARRIVA (voce A18).
   Il ramo PARTITA della griglia misura tre schermate; la terza, il tabellino, aspetta la fase
   `ended`/`ceremony` entro 300 s e in due corse su tre non la vede. Prima di allungare quel numero
   a caso bisogna sapere QUANTO ci mette davvero il fischio finale e DOVE si ferma.
   Questa sonda apre una partita in autoplay con le stesse identiche opzioni della griglia
   (seed, policy seeded, tickMs 300) e stampa ogni 5 s: secondi a muro, minuto di gioco, fase.
   Non misura pixel, non tocca il gioco: guarda l'orologio. */
import fs from 'node:fs';
import path from 'node:path';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const { startServer, launchBrowser, installCdnRoutes, sleep, openMatch } = await import('./lib/harness.mjs');

const SEME = Number(process.env.CPM_SEME || 959);
const TETTO = Number(process.env.CPM_TETTO || 900);   /* secondi a muro concessi al fischio */
const PASSO = 5;

const srv = await startServer();
const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errori = [];
page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
await installCdnRoutes(page);

console.log('=== QUANTO CI METTE IL FISCHIO FINALE ===');
console.log(`  seme ${SEME} · tetto ${TETTO} s · lo stesso autoplay della griglia (tickMs 300, policy seeded)\n`);

await openMatch(page, port, { skipLoadAll: true, name: 'Fischio Probe' });
const t0 = Date.now();
try { await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), SEME); } catch (_e) {}

const righe = [];
let finito = null, ultimoMin = -1, fermoDa = 0;
for (let t = 0; t <= TETTO; t += PASSO) {
  const st = await page.evaluate(() => {
    let min = null, ph = null;
    try { min = window.__CPM_CLOCK ? (window.__CPM_CLOCK() | 0) : null; } catch (_e) {}
    try { ph = window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (_e) {}
    return { min, ph };
  }).catch(() => ({ min: null, ph: 'ERRORE' }));
  const sec = Math.round((Date.now() - t0) / 1000);
  righe.push({ sec, min: st.min, ph: st.ph });
  if (st.min === ultimoMin) fermoDa += PASSO; else { fermoDa = 0; ultimoMin = st.min; }
  console.log(`  ${String(sec).padStart(4)} s · minuto ${String(st.min).padStart(3)} · fase ${st.ph}${fermoDa >= 30 ? `   ← l'orologio e' fermo da ${fermoDa} s` : ''}`);
  if (st.ph === 'ended' || st.ph === 'ceremony') { finito = sec; break; }
  await sleep(PASSO * 1000);
}

console.log('');
if (finito != null) {
  console.log(`✅ IL FISCHIO E' ARRIVATO a ${finito} s dall'avvio dell'autoplay (il tetto della griglia e' 300 s dopo la schermata della scelta).`);
} else {
  const ult = righe[righe.length - 1];
  console.log(`❌ NIENTE FISCHIO entro ${TETTO} s: ultimo minuto ${ult.min}, fase ${ult.ph}.`);
}
/* il ritmo vero: quanti secondi a muro per minuto di gioco, sui tratti in cui l'orologio cammina */
const camm = righe.filter((r, i) => i > 0 && r.min != null && righe[i - 1].min != null && r.min > righe[i - 1].min);
if (camm.length) {
  const dmin = righe[righe.length - 1].min - righe[0].min;
  const dsec = righe[righe.length - 1].sec - righe[0].sec;
  console.log(`   ritmo medio: ${dmin} minuti di gioco in ${dsec} s = ${(dsec / Math.max(1, dmin)).toFixed(2)} s per minuto.`);
  /* la sosta piu' lunga */
  let peg = 0, pegMin = null, run = 0;
  for (let i = 1; i < righe.length; i++) {
    if (righe[i].min === righe[i - 1].min) { run += PASSO; if (run > peg) { peg = run; pegMin = righe[i].min; } } else run = 0;
  }
  console.log(`   sosta piu' lunga dell'orologio: ${peg} s, al minuto ${pegMin}.`);
}
if (errori.length) console.log('\n   errori di pagina: ' + errori.slice(0, 3).join(' · '));

const fuori = path.join(process.cwd(), 'docs', 'collaudo-grafico', 'g0', 'fischio-finale.json');
try { fs.mkdirSync(path.dirname(fuori), { recursive: true }); fs.writeFileSync(fuori, JSON.stringify({ seme: SEME, tetto: TETTO, finito, righe, errori }, null, 1)); console.log(`\n→ ${fuori}`); } catch (_e) {}

await page.close(); await browser.close(); srv.close();
