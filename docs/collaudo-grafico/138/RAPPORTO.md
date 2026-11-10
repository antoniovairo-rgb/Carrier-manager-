# Giro 138 — lotto strumenti (decisione PO 10/11: «Lotto strumenti nella 189»)

Ramo `collaudo/giro138-strumenti` da `lavoro/188` (04a62ae, 7.999.188). Solo strumenti in `tests/visual`: `src/` e
`CARRIER-MANAGER-AV.html` NON toccati, `GAME_VERSION` invariata. Un controllo alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`,
`free -m` / `df -h` prima di ogni corsa (memoria libera 14,6-15,5 GB, disco 29 GB liberi in tutte le corse).

## Tabella prima/dopo

| strumento | voce | prima (com'era) | causa | dopo | esito |
|---|---|---|---|---|---|
| `festa-57` | PO-336 | 2 corse, **uscita 1** entrambe: rosso 57 fermo **3** e **1** campioni (serve ≥4); nella 1ª anche rosso 61 «non si distingue» (0 campioni) | **strumento** | 2 corse sulla versione finale, **uscita 0** entrambe: verde fino a 4,39 / 4,43 (clip ripartita), rosso 57 **4 campioni fermi a 2,04**, rosso 61 distinto | chiuso |

## 1 · `festa-57` (PO-336) — strumento, non la festa

**Misura prima** (script com'era, 7.999.188):

| corsa | verde | rosso `__CPM_NO_FESTA57` | rosso `__CPM_NO_FESTA61` | uscita |
|---|---|---|---|---|
| prima 1 | 12 campioni 0,05→1,78, fermo 1 | 0,07→2,04, poi **2,04 ×3** (fine dei 12 campioni) | **0 campioni** (clip `mx-fist-pump`, non contiene «victory») | 1 |
| prima 2 | 12 campioni 0,05→1,88, fermo 1 | 0,07→**2,04 all'ultimo campione**, fermo 1 | `mx-victory-jump` | 1 |

**Causa misurata.** La festa NON è cambiata nel senso del difetto: col rosso la clip `mx-victory` si congela davvero a 2,04 s
(= 45% di una clip da ~4,5 s, il tetto della posa 191 in `src/12` r.~11826). Lo strumento campionava **12 volte ogni 600 ms di
parete** e la clip arrivava al congelamento al 9°-12° campione: restavano 1-3 campioni fermi contro i 4 richiesti. La finestra
era stata tarata quando la clip era il salto (`mx-victory-jump`, giro 57) e il congelamento era al 34%; col giro 61 (clip
`mx-victory`, più lunga) e il giro 118 (congelamento al 45%) la stessa finestra non bastava più. Seconda causa: il rosso 61 cercava
solo clip col nome «victory», ma con `__CPM_NO_FESTA61` il gioco suona `mx-victory-jump` **oppure** `mx-fist-pump` (dipende da
`_PUGNO32`, lasciato dall'ultima esultanza di gol: src/12 r.140 e r.8949) — nella prima corsa la clip c'era ma non veniva vista.

**Correzione (solo `tests/visual/festa-57.mjs`).**
- si campiona fino all'**evento** che decide: clip ferma 4 campioni di fila (rosso) oppure clip **ripartita da capo** (ha superato
  ogni punto di congelamento), tetto 90 campioni; se la festa finisce prima, il braccio è non giudicato;
- la festa leggera si chiude a **9,5 s di parete** (src/15 r.~2243) e a fps headless la clip non arriva in fondo: la sonda la tiene
  aperta con `__CPM_CER_HOLD` (meccanismo già del gioco, attivo solo sotto `?cpmtest=1`) — senza, il verde arrivava a 2,37 contro
  il 2,04 del rosso (corsa intermedia «dopo 1», uscita 0 ma margine stretto);
- la clip campionata è il **gesto `mx-*` di peso massimo** e si giudica la clip dominante (al primo campione può pesare ancora
  `mx-disappunto`); il fermo si conta sulla stessa clip;
- il verde deve **superare il punto in cui il rosso si ferma** (altrimenti passerebbe a vuoto); soglie invariate (verde ≤2 di fila,
  rosso ≥4); braccio e motivo stampati per ultimi; `CPM_BRACCI` per corse parziali, che escono sempre 1.

**Dopo:**

| corsa | verde | rosso 57 | rosso 61 | uscita | durata |
|---|---|---|---|---|---|
| dopo 2 | 0,05→**4,39**, poi 0,24 (ripartita), fermo 1 | 0,07→2,04, **2,04 ×4** (clip ferma) | `mx-fist-pump`, ripartita | 0 | 481 s |
| dopo 3 | 0,05→**4,43**, poi 0,29 (ripartita), fermo 1 | 0,07→2,04, **2,04 ×4** (clip ferma) | `mx-fist-pump`, ripartita | 0 | 482 s |

Nota per il PO (non decisa qui): col rosso 61 il gioco oggi non torna sempre al «salto rannicchiato» che il commento del giro 61
descrive, ma anche al pugno (`mx-fist-pump`), secondo l'ultima esultanza della partita. Il guardiano ora accetta qualunque clip
diversa da `mx-victory` come prova che il rosso si distingue.
