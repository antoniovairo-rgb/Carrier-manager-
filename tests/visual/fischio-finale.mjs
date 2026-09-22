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

/* [G16 c] LA PROVA APPAIATA DEL 7.976. Il blocco scatta SOLO quando la partita merita la festa di fine
   gara (gol, oppure voto >= 7,5, oppure colpo fuori casa), quindi una partita qualunque non lo mostra:
   CPM_FESTA=1 usa il varco di collaudo gia' esistente (__CPM_FESTA942_FORCE) per iniettare le statistiche
   e rendere la festa certa. CPM_ROSSO=1 riaccende il comportamento di prima (__CPM_NO977): stessa partita,
   stesso seme, una sola differenza. Se il rosso non fischia e il verde si', il rimedio ha il suo numero. */
const FESTA = process.env.CPM_FESTA === '1';
const ROSSO = process.env.CPM_ROSSO === '1';
if (FESTA || ROSSO) await page.addInitScript(({ f, r }) => {
  if (f) { try { window.__CPM_FESTA942_FORCE = { goals: 2, assists: 1, rb: 20 }; } catch (_e) {} }
  if (r) { try { window.__CPM_NO977 = true; } catch (_e) {} }
}, { f: FESTA, r: ROSSO });
if (FESTA) console.log('  · festa di fine gara FORZATA (varco __CPM_FESTA942_FORCE)');
if (ROSSO) console.log('  · ROSSO __CPM_NO977 acceso: la fine partita puo\' essere richiamata a ogni battito, come prima del 7.976');

await openMatch(page, port, { skipLoadAll: true, name: 'Fischio Probe' });
const t0 = Date.now();
try { await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), SEME); } catch (_e) {}

/* [G16 b] LA DIFFERENZA FRA LA SONDA E IL BANCO. In corsa libera il fischio arriva a 163 s; dentro la
   griglia la partita resta ferma al 90' in fase playing. L'unica cosa che la griglia fa in piu' e' il
   RITUALE DI MISURA: cinque cambi di viewport, il congelamento delle animazioni e uno scatto per taglia.
   Con CPM_RESIZE=1 la sonda lo replica nei due punti in cui la griglia lo esegue (al minuto 8 e alla
   prima hl_choose): se il blocco si riproduce, la causa e' il rituale, non il gioco. */
const RESIZE = process.env.CPM_RESIZE === '1';
const TAGLIE = [{ w: 360, h: 800 }, { w: 375, h: 812 }, { w: 390, h: 844 }, { w: 412, h: 915 }, { w: 430, h: 932 }];
const rituale = async (etichetta) => {
  if (!RESIZE) return;
  console.log(`      · rituale di misura (${etichetta}): cinque viewport + congelamento`);
  for (const t of TAGLIE) {
    await page.setViewportSize({ width: t.w, height: t.h });
    await sleep(220);
    await page.evaluate(() => {
      if (!document.getElementById('__g0_freeze')) {
        const st = document.createElement('style'); st.id = '__g0_freeze';
        st.textContent = '*,*::before,*::after{transition:none!important}';
        document.head.appendChild(st);
      }
      (document.getAnimations ? document.getAnimations() : []).forEach(a => {
        try { const tt = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
          if (tt && (tt.iterations === Infinity || tt.duration === Infinity)) { a.currentTime = 0; a.pause(); } else { a.finish(); } } catch (_e) {}
      });
      window.scrollTo(0, 0);
    }).catch(() => {});
    await sleep(160);
    try { await page.screenshot({ animations: 'disabled', caret: 'hide', timeout: 40000 }); } catch (_e) {}
  }
  await page.setViewportSize({ width: 412, height: 915 });
  await sleep(220);
};
let fattoMin8 = false, fattoScelta = false;

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
  if (!fattoMin8 && (st.min | 0) >= 8) { fattoMin8 = true; await rituale("minuto 8"); }
  else if (!fattoScelta && st.ph === 'hl_choose') { fattoScelta = true; await rituale('hl_choose'); }
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
