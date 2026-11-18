/* [giro 270] ARRIVARE AL FISCHIO FINALE SUL BANCO SENZA UN TETTO DI PARETE.
   Misura (sonda probe-fischio-270, salvataggio save-194, autoplay): il minuto di gioco e' fatto di _SUB898 sotto-battiti da
   MATCH_TICK_MS/_SUB898 ms (setInterval, src/15 ~5453/9686) e sul banco ogni sotto-battito aspetta un fotogramma (mediana ~95 ms,
   p90 216-344 ms in Chromium headless con grafica software): un minuto costa 4-12 s invece di 1,7 e rallenta col passare della
   partita (7.999.190: 34' in 150 s; 7.999.196 e lavoro/197: 24'). Con un tetto fisso di 400-420 s il fischio non arrivava piu'
   (partita-rigiocata-194, spazio-296: «niente fischio»). Regola PO-311 (PROCESSO.md, controlli instabili): tempo di scena e non di
   parete, si attende un evento e non un tempo fisso.
   Qui: si lascia giocare la partita vera fino a `daMin` (o `primaMs`), poi l'orologio va a `aMin` col varco di collaudo
   __CPM_SALTA297 (stesso uso di partita-v2 / lib/partita-v2.mjs finePartita) tenendo il punteggio, e si aspetta il fischio NATURALE
   (fase ended/ceremony). L'attesa finisce solo se l'orologio resta fermo per `fermoMs` in `playing` (difetto vero: niente fischio)
   o al tetto di sicurezza `tettoMs`. Ritorna { fine, fase, minuto, ms, saltoDa }.
   ⚠️ Dipende dal battito del minuto: se il giro 264 lo cambia, rimisurare con probe-fischio-270. */
import { sleep } from './harness.mjs';
const stato = (page) => page.evaluate(() => { try { return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, m: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null }; } catch (e) { return { ph: null, m: null }; } }).catch(() => ({ ph: null, m: null }));
export async function aspettaFischio270(page, { daMin = 10, primaMs = 90000, aMin = 85, fermoMs = 120000, tettoMs = 900000, passoMs = 1000 } = {}) {
  const t0 = Date.now(); let saltoDa = null, ultimoMin = null, tMin = Date.now(), s = await stato(page);
  while (Date.now() - t0 < tettoMs) {
    s = await stato(page);
    if (s.ph === 'ended' || s.ph === 'ceremony') return { fine: true, fase: s.ph, minuto: s.m, ms: Date.now() - t0, saltoDa };
    if (s.m !== ultimoMin || s.ph !== 'playing') { ultimoMin = s.m; tMin = Date.now(); }/* negli highlight l'orologio e' fermo per regola */
    if (saltoDa == null && s.ph === 'playing' && ((s.m | 0) >= daMin || Date.now() - t0 >= primaMs)) {
      saltoDa = s.m;
      if ((s.m | 0) < aMin) await page.evaluate((a) => { const sc = window.__CPM_SCORE ? window.__CPM_SCORE() : null; window.__CPM_SALTA297(a, sc ? sc.home : null, sc ? sc.away : null); }, aMin).catch(() => {});
      tMin = Date.now();
    }
    if (s.ph === 'playing' && Date.now() - tMin > fermoMs) break;/* orologio fermo in gioco fluido: niente fischio, rosso vero */
    await sleep(passoMs);
  }
  return { fine: false, fase: s.ph, minuto: s.m, ms: Date.now() - t0, saltoDa };
}
