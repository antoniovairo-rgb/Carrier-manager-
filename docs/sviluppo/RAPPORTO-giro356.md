# RAPPORTO — giro 356 · PO-557 «troppo facile comprare lo staff personale»

**Base:** `lavoro/201` (7.999.209 pubblicata) · **Ramo:** `sviluppo/giro356-staff` · **GAME_VERSION non toccato.**
**Economia riaperta dal PO il 24/11 alle 19:50** («Apri 557») solo per questa voce.

PO (19/11): «troppo facile "comprare" il mental coach, il preparatore di terzo livello ed il personal trainer».

## 1. Misura prima (No Blind Fix)

**Strumento:** `tests/visual/misura-356.mjs` (nuova sonda). Carriera di 14 stagioni sugli handler veri
(`__CPM_CAREER.step` → `liveCurrentWeek` / `simulateAndAdvance` / `doAdvanceWeek` → `startNewSeason`), dai 19 anni,
club FC Werkstadt (prestigio 74), primo contratto da professionista alla stima del gioco (`_ovrToWageWeekly133`).
A ogni settimana registra età, OVR, stipendio, conto e il costo dello staff a ogni livello, calcolato con la funzione
vera del gioco (`staffCost24`) sullo stipendio di quella settimana. Tre profili: OVR iniziale 58 (debole), 63 (medio), 68 (buono).

⚠️ **Dichiarato:** il rinnovo vive in un modale (flusso fuori ambito, giro 354 in parallelo). Quando il contratto
scade la sonda rinnova per 3 anni alla stima di mercato del gioco, la stessa che mostra il procuratore. Le offerte di
trasferimento si chiudono. Il procuratore lo assume il gioco da solo (commissione del 10%).

**Prezzario di prima** (src/08, `STAFF24_281` + `STAFF_COSTX24`): costo settimanale = max(minimo, quota dello stipendio)
× 1 / 1,8 / 2,8. Minimi 700 / 500 / 400 €, quote 5% / 4% / 3% (trainer / preparatore / mental). **Nessun ingaggio e
nessun requisito:** il «+» dell'Ufficio porta al livello 3 in tre tocchi.

**Criterio «se lo può permettere»** (lo stesso prima e dopo): ha sul conto l'eventuale ingaggio, **e** il costo
settimanale non supera lo stipendio netto della commissione, oppure i risparmi rimasti coprono una stagione (38
settimane) di disavanzo.

| Profilo | Un livello 3 (es. trainer) | Tutti e tre al livello 2 | Tutti e tre al livello 3 |
|---|---|---|---|
| debole (58) | 19 anni, settimana 8 | 19 anni, settimana 29 | 20 anni (2ª stagione) |
| **medio (63)** | **19 anni, settimana 1** | **19 anni, settimana 1** | **19 anni, settimana 13** |
| buono (68) | 19 anni, settimana 1 | 19 anni, settimana 1 | 19 anni, settimana 1 |

**Perché:** il costo è una **quota fissa dello stipendio**. Tutti e tre al livello 3 costano il **34%** dello stipendio
(il solo trainer il 14%) a qualunque età e in qualunque lega, mentre il conto cresce: il giocatore medio ha 1,4 milioni a
22 anni, 9,3 milioni a 26 e 38 milioni a 32. Con un prezzo che segue lo stipendio, il livello 3 non diventa mai un traguardo.

## 2. Taratura applicata (opzione A)

`src/08-panchina-derby-meteo-cori.jsx` (prezzi) e `src/18-career-app.jsx` (solo il blocco «Staff privato» dell'Ufficio).

1. **Ingaggio una tantum, fisso**, pagato dal conto quando si sale a un livello mai pagato: livello 2 **€300.000**,
   livello 3 **€2.500.000** per figura. Il «+» resta disabilitato finché il conto non basta, e la riga dice quanto manca
   («Livello 2: ingaggio €300 mila una tantum · €2,8 mila a settimana — servono €170 mila in più sul conto»).
   L'ingaggio va nel registro e in `staffIng356` (il livello più alto pagato per ogni figura). Se abbassi il livello e
   poi lo rialzi, l'ingaggio non si paga di nuovo.
2. **Costo settimanale più alto ai livelli 2 e 3:** il minimo fisso diventa ×4 al livello 2 e ×12 al livello 3, la quota
   dello stipendio ×2,2 e ×4 (prima ×1,8 e ×2,8). Tutti e tre al livello 3 costano il **48%** dello stipendio (prima 34%),
   il solo trainer il 20%. **Il livello 1 non cambia** (stessi prezzi), quindi non cambiano nemmeno gli eventi
   settimanali che ingaggiano al livello 1 (`wi_mental_coach`, `wi_personal_chef`).
3. **Salvataggi:** nessun campo obbligatorio, nessuna migration, nessun aumento di SAVE_VERSION. Il livello già tenuto
   (`perk*Lv`) conta come pagato e **resta al prezzo di prima** («chi ha già lo staff lo tiene»). Il prezzo nuovo vale
   solo per i livelli comprati con l'ingaggio.

Il rosso `window.__CPM_NO_G356` riporta i prezzi di prima, senza ingaggio.

### Misura dopo (stessa sonda, stesso criterio)

| Profilo | Un livello 3 | Tutti e tre al livello 2 | Tutti e tre al livello 3 |
|---|---|---|---|
| debole (58) | 27 anni (stagione 9) | 25 anni | 30 anni |
| **medio (63)** | **25 anni (stagione 7)** | **22 anni** | **28 anni (stagione 10)** |
| buono (68) | 23 anni | 22 anni | 25 anni |

Un livello 2 singolo: debole a 22 anni, medio a 21, buono a 19 (fine della prima stagione).

⚠️ **Le carriere simulate non sono identiche fra un giro e l'altro:** il passo della carriera ha parti casuali, e il
giocatore medio arriva a OVR 76 a 25 anni nel giro «dopo», contro 80 nel giro «prima». Gli anni qui sopra hanno quindi
un margine di circa una stagione. La sonda non compra lo staff, quindi il conto «dopo» non è eroso dai costi: misura
quando il giocatore *può* comprare, non cosa succede quando compra.

## 3. Dubbi per il PO (le scelte di taratura sono sue)

**D1. Prezzo fisso o legato allo stipendio?** Ho confrontato offline le tre opzioni sulle stesse traiettorie del giro «prima»:

| Opzione | Medio: un livello 3 / tutti e tre al livello 3 | Tutti e tre al livello 3, quota dello stipendio a fine carriera |
|---|---|---|
| **A — ingaggio fisso (300k / 2,5 mln) + costo settimanale più alto** ✅ *consigliata e applicata* | 24 / 26 anni | 48% |
| B — ingaggio legato allo stipendio (8 / 40 settimane di stipendio, minimo 50k / 200k) + stesso costo settimanale | 21 / 27 anni | 48% |
| C — solo costo settimanale fisso e alto (×6 / ×20 del minimo), nessun ingaggio | 22 / 22 anni | 18% (il buono 13%) |

- **A** lega il traguardo alla carriera (i risparmi), è uguale in ogni lega e si legge subito («€2,5 milioni»). Il
  difetto: a fine carriera un campione da 250k a settimana lo paga senza accorgersene. Ma a quel punto il traguardo è
  raggiunto, e il costo settimanale (48%) resta sentito.
- **B** scala da sola con la lega, però il singolo livello 3 torna presto (21 anni): lo stipendio cresce a scatti ai
  rinnovi, e subito dopo un rinnovo i risparmi bastano.
- **C** scarta il problema dei risparmi, che è proprio quello segnalato. Per un giocatore ricco diventa di nuovo un
  acquisto da nulla (13-18% dello stipendio a fine carriera).

**D2. Gli importi.** Con l'opzione A il giocatore medio ha tutto al livello 3 a 28 anni, quindi un po' dopo la metà
della carriera (dai 19 ai 33 anni, la metà è a 26). Alternative: livello 3 a **€2 milioni** (medio: tutto a circa 26-27
anni) oppure a **€3 milioni** (circa 29 anni). Ho tenuto **€2,5 milioni** perché il singolo livello 3 cade a 25 anni,
cioè a metà carriera.

**D3. I livelli già tenuti nei salvataggi esistenti.** Le tre opzioni:

1. ✅ *consigliata e applicata:* li tengono al **prezzo di prima**, senza ingaggio.
2. Li tengono senza ingaggio, ma pagano il **costo settimanale nuovo**. Rischio: chi ha un conto basso finisce a fondi
   esauriti e lo staff viene sospeso (lo sblocco a fondi finiti esiste già).
3. Riportarli al livello 1. Questo romperebbe la promessa «chi ha già lo staff lo tiene».

## 4. Guardiano

`tests/visual/staff-356.mjs` · `npm run staff-356` (verde, poi rosso con `__CPM_NO_G356`). È nella riga della MAPPA che
esiste già sia per `src/0[0-8]-` sia per `src/18-|src/16-|src/10-` (`ci-runner.mjs`). `npm run mappa-unica` è verde.

| | Controllo | Verde | Rosso `__CPM_NO_G356` |
|---|---|---|---|
| T1 | traguardo: tutti e tre al livello 3 alla portata solo a metà carriera (stati misurati del medio: 19 / 21 / 22 anni no, 26 sì) | ok | **cade** (alla portata a 19 anni) |
| T2 | sentito: tutti e tre al livello 3 ≥ 45% dello stipendio | 48% | **cade** (34%) |
| T3 | Ufficio vero: con un conto da 130k il «+» verso il livello 2 è disabilitato e dice quanto manca; con 3 milioni L1→L2→L3 scala 300k + 2,5 milioni e scrive `staffIng356` | ok | **cade** (nessun ingaggio) |
| T4 | la settimana vera (`weeklyEconomyFields`) addebita il costo nuovo | ok | — |
| T5 | salvataggio vecchio con tutto al livello 3 e nessun registro: tiene i livelli, nessun ingaggio, prezzi di prima (1960 / 1400 / 1120) | ok | — |

Pageerror: 0.

**Guardiani dello staff rigiocati sul ramo:** acquisti-281, trainer-288, impulsi-289, fisarmonica-341, livello-79 e
carriera3-94 sono tutti verdi.

## 5. Catena del giro

`node ci-runner.mjs giro staff-356 career-critical save-compat` (+ 17 sentinelle, 18 passi) su 7.999.209 + questo ramo:
**18/18 verdi, nessuna ripetizione** — staff-356 (25 s), save-compat, mappa-unica, test:logic, replay, migrazione-194,
design-system, tema-unico, griglia-mobile, render-3d-023, tunnel-285, home-298, web-237, career-critical (316 s),
battito-264, partita-vera (684 s), gk-dive-sync, schermate-97. Le foto di `docs/collaudo-grafico` riscritte dal giro sono
state rimesse com'erano (sottoprodotto, non parte della modifica).

## Fuori ambito (non toccato)

Il flusso della settimana e del rinnovo del contratto (giro 354), «la Tua storia» (giro 355), src/03, src/14, src/12 e
src/16, GAME_VERSION. Il registro di governo (BACKLOG / ROADMAP) si aggiorna al rilascio, sul ramo di lavoro.
