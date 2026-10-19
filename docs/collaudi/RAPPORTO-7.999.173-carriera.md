# Collaudo carriera 7.999.173

- Versione collaudata: **7.999.173** (`GAME_VERSION` in `CARRIER-MANAGER-AV.html`, commit `60c227d` su `origin/main`)
- Ramo di collaudo: `collaudo/7.999.173-carriera`
- Ambiente: Chromium headless (`/opt/pw-browsers/chromium`), tests/visual, Playwright dalle devDependencies
- Foto: `docs/collaudi/foto-7.999.173-carriera/` (home 412 px e 360 px, scenari U18/PRO)

## Gravità dei difetti

| Gravità | Numero | Note |
|---|---|---|
| Bloccante | 0 | — |
| Alta | 0 | — |
| Media | 1 | Ritratto dell'eroe: verifica su schermo non fatta (vedi «Non verificato») |
| Bassa | 2 | Guardiano di pulizia PO-072 non eseguibile di default e rosso sul numero di versione; griglia mobile con un punto non misurato |

Nessun difetto confermato di gioco o di interfaccia. I due punti bassi riguardano gli strumenti di collaudo, non il gioco.

## Esiti per riga

| # | Verifica | Comando | Esito | Prova |
|---|---|---|---|---|
| 1 | PO-066 riquadri home, 412 px | `CPM_LARG=412 CPM_FOTO=1 node home-066.mjs` | VERDE | 112 riquadri in 7 situazioni, 0 fuori standard, nessun errore. `censimento-verde-412.json`, foto `*-verde-412.png` |
| 2 | PO-066 riquadri home, 360 px | `CPM_LARG=360 CPM_FOTO=1 node home-066.mjs` | VERDE | 112 riquadri in 7 situazioni, 0 fuori standard, nessun errore. `censimento-verde-360.json`, foto `*-verde-360.png` |
| 3 | Foto home PRO inizio 412 px (lettura visiva) | — | OK | Colonna pulita, nessuno sforamento, ritratto dell'eroe presente in alto, riquadri a raggio coerente |
| 4 | PO-267 crediti DiceBear | `node crediti-254.mjs` | VERDE | 16 righe, 0 «non confermabili», 0 «Fonte da completare», pulsante 394 px a 412 e 347 px a 360, orizzontale 0 |
| 5 | PO-071 etichetta tipologia stadio e cartelloni | `node stadi-064.mjs` | PASS | Etichette «Campo di paese», «Catino», «Storico in mattoni», «Arena»; cartelloni distinti per tipologia; fondale del palco presente; nessun errore |
| 6 | PO-071 tipologia in MatchdayCard e Club | lettura codice | Parziale | `data-cpm="tipo-stadio"` presente alle righe 25289 (MatchdayCard) e 55346 (Club). Lo schermo non è stato verificato (vedi «Non verificato») |
| 7 | PO-072 pulizia | `CPM_BASE=a8f7fb3 node pulizia-072.mjs` | ROSSO (basso) | Il guardiano trova come primo scarto il numero di versione 172→173. Il confronto `origin/main`–`a8f7fb3`: 149 righe aggiunte, 530 eliminate, quindi la 173 non è una pulizia pura |
| 8 | PO-171 cerimonie | `node cerimonie-test.mjs` | PASS | Ogni coppa ha la sua cerimonia, il mister c'è sempre, la promozione festeggia a modo suo |
| 9 | Invarianti carriera | `node career-invariants.mjs` | VERDE | 252 club, 0 errori di pagina |
| 10 | Due stagioni sugli handler | `node career-sim-test.mjs` | VERDE | Rollover 2→3 e 3→4, stato finale S4 W1, 0 errori di pagina |
| 11 | Nazionale | `node career-nat-sim-test.mjs` | PASS | 6 partite di Nazionale simulate dal passo, fine stagione raggiunta, 0 errori |
| 12 | Salvataggi e ricaricamento | `npm run save-compat` | PASS | 12 pass, 0 fail. Nota del test: la seconda migrazione riscrive calendario e classifica per un club sintetico fuori dal pool (benigno, come dichiarato dal test) |
| 13 | Griglia mobile | `node griglia-mobile.mjs` | VERDE, con un punto non misurato | 65 scatti. «NON misurato: prepartita: playMatch → nomatch» |
| 14 | Intro, menu, cerimonie (regressione visibile) | `cerimonie-test.mjs` + foto home | Parziale | Cerimonie verdi. Intro e menu non hanno un guardiano dedicato in questo giro |

## Difetti

### D1 — Ritratto dell'eroe (media, non verificato)
Il diff 172→173 elimina il blocco «FOTO PROFILO CH38» (ritratto dell'eroe renderizzato dal modello CH38, `_heroPhotoCache`, `_ensureHeroPhotoAssets`). Il registro 171 dichiara il ritratto già senza CH38. Non ho prodotto un'immagine del ritratto nei menu per confermare cosa lo sostituisce. Nelle foto home il ritratto in alto è presente, ma non ho confermato la fonte.
Azione proposta: foto del ritratto in tre schermate (home, creazione, profilo) a 412 px, GLB-ON, prima di chiudere PO-171.

### D2 — Guardiano di pulizia PO-072 (bassa)
- Il default di `pulizia-072.mjs` è `origin/lavoro/172`, ramo che non esiste nel repo: il guardiano non gira senza `CPM_BASE`.
- Il confronto con `a8f7fb3` si ferma al numero di versione: il guardiano non ignora `GAME_VERSION` e non distingue la pulizia dalle funzioni nuove della 173.

Opzioni per la sessione principale:
1. **Consigliata:** base del guardiano su un tag `pre-173` (o su un commit fissato) e ignorare la riga `GAME_VERSION` nel confronto. Costo: piccolo, un tag e una riga.
2. Mantenere il default e documentare il comando con `CPM_BASE`. Costo: nullo, ma il guardiano resta fragile a ogni nuova release.
3. Togliere il guardiano dalla catena di pulizia. Costo: si perde l'unico controllo che la pulizia non cambi il comportamento.

### D3 — Griglia mobile, prepartita non misurato (bassa)
La sonda dichiara «NON misurato: prepartita: playMatch → nomatch». Il dato mancante è la schermata prepartita nel percorso di misura.

## Non verificato

- **Tipologia dello stadio a schermo** (PO-071 in MatchdayCard e Club): il codice è presente e la funzione di etichetta è verificata da `stadi-064`, ma non ho una foto o un DOM letto dalla schermata. Non posso confermarne la resa visiva.
- **Ritratto dell'eroe** nei menu (D1).
- **Intro e menu** come regressione visibile: non c'è un guardiano dedicato in questo giro e non ho fotografato queste schermate.
- **Telefono reale**: tutto è stato misurato in headless. Non posso confermare fps, resa su dispositivo o safe-area reali.
- **Scenari a 360 px** oltre la home: non fotografati.
- **Partite della simulazione a due stagioni**: lo stato finale «0 gol/0 presenze» a S4 W1 è coerente con l'inizio di stagione, ma non l'ho confrontato con un valore atteso.

## Limiti del metodo

- I censimenti della home usano stati di prova costruiti (`base()`/`pro()` nella sonda), non un salvataggio reale del PO.
- Il guardiano crediti legge `CREDITI-fonti.md` e la schermata a 412/360 px; non legge i testi di gioco con un'altra fonte.
- Headless non è un dispositivo: non cambia la misura dei riquadri (che è in CSS) ma cambia tutto ciò che dipende da fps o GPU.
