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
/* [giro 391, PO-523 «Entrambi», DECISIONI 18/11 16:40] PARTITA INTERA NELLA VERIFICA DEL TRENO, SALTO NEI GIRI.
   Il treno (verifica-guardiani.yml, job delle parti) accende CPM_PARTITA_INTERA=1: niente salto all'85', la partita si gioca tutta
   fino al fischio naturale. I giri (`ci-runner.mjs giro`, banco locale) non la accendono: salto come prima (veloce).
   Eccezione: una chiamata con `punteggio` usa il salto per PROVOCARE un momento (non per accorciare): il salto resta.
   Le soglie di giudizio non cambiano; cambia solo il tetto di sicurezza della parete (una partita intera sul banco costa di piu').
   CPM_NO_G391=1 = comportamento di prima (salto sempre, anche col treno): braccio rosso di `npm run dopo-partita-391`. */
export const partitaIntera391 = () => process.env.CPM_PARTITA_INTERA === '1' && process.env.CPM_NO_G391 !== '1';
export const TETTO_INTERA391_MS = 2400000;/* 40 min di parete per la sola attesa del fischio a partita intera (misura nel RAPPORTO-giro391) */
const stato = (page) => page.evaluate(() => { try { return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, m: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null }; } catch (e) { return { ph: null, m: null }; } }).catch(() => ({ ph: null, m: null }));
export async function aspettaFischio270(page, { daMin = 10, primaMs = 90000, aMin = 85, punteggio = null, fermoMs = 120000, tettoMs = 900000, passoMs = 1000 } = {}) {
  const intera = partitaIntera391() && punteggio == null;/* con `punteggio` il salto PROVOCA un momento (spazio-270: pari dopo il 75'): resta anche nel treno */ if (intera) tettoMs = Math.max(tettoMs, TETTO_INTERA391_MS);
  const t0 = Date.now(); let saltoDa = null, ultimoMin = null, tMin = Date.now(), s = await stato(page);
  while (Date.now() - t0 < tettoMs) {
    s = await stato(page);
    if (s.ph === 'ended' || s.ph === 'ceremony') return { fine: true, fase: s.ph, minuto: s.m, ms: Date.now() - t0, saltoDa, intera };
    if (s.m !== ultimoMin || s.ph !== 'playing') { ultimoMin = s.m; tMin = Date.now(); }/* negli highlight l'orologio e' fermo per regola */
    if (!intera && saltoDa == null && s.ph === 'playing' && ((s.m | 0) >= daMin || Date.now() - t0 >= primaMs)) {
      saltoDa = s.m;
      if ((s.m | 0) < aMin) await page.evaluate(([a, pt]) => { const sc = pt || (window.__CPM_SCORE ? window.__CPM_SCORE() : null); window.__CPM_SALTA297(a, sc ? sc.home : null, sc ? sc.away : null); }, [aMin, punteggio]).catch(() => {});/* punteggio {home,away}: solo per provocare un momento (es. pari dopo il 75') */
      tMin = Date.now();
    }
    if (s.ph === 'playing' && Date.now() - tMin > fermoMs) break;/* orologio fermo in gioco fluido: niente fischio, rosso vero */
    await sleep(passoMs);
  }
  return { fine: false, fase: s.ph, minuto: s.m, ms: Date.now() - t0, saltoDa, intera };
}
