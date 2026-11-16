# Giro 227 — PO-492 «Il patto col mister» (versione 7.999.196)

**Foto del PO** (7.999.195, `docs/collaudo-po/195-patto-vicecapitano-al-capitano.jpg` sul ramo `poc/marioprada-character-system`):
«…Nelle prossime 4 di campionato ti voglio a inventare per gli altri: 2 assist. Se ci riesci, la fascia da vice-capitano è tua.»
Il PO: «Ma sono il capitano!».

## Misura prima della correzione

Cosa dice il gioco, per ciascuna delle cinque ricompense, se il giocatore ce l'ha già, e se viene data a patto riuscito
(lettura del codice in `src/18-career-app.jsx`, `src/08-panchina-derby-meteo-cori.jsx`):

| Ricompensa promessa | Dato che dice «ce l'ha già» | Data a patto riuscito? |
|---|---|---|
| «il rigorista sei tu» | **nessuno** (nessun campo rigorista nel giocatore) | no, solo testo |
| «i piazzati li batti tu» | **nessuno** | no, solo testo |
| «quella maglia non te la toglie più nessuno» | `squadRole` / `calcSquadRole` (titolare, leader) | no, solo testo |
| «la fascia da vice-capitano è tua» | `isCaptain` dice capitano; **nessun campo vice** | no, solo testo |
| «in questo spogliatoio parli tu» | `isCaptain` o `squadRole==="leader"` (lettura vicina) | no, solo testo |

A patto riuscito il verdetto dava sempre e solo **+8 fiducia del mister e +5 morale**, qualunque cosa fosse stata promessa.
La frase si sceglieva con `PACT_REW[(seed>>>5)%5]` senza guardare il giocatore.

**Quante promesse incoerenti oggi** (braccio rosso del guardiano = comportamento di prima, 3000 carriere sintetiche):
**1252 su 3000** promettono una cosa che il giocatore ha già; **al capitano la fascia da vice-capitano in 133 casi su 765
capitani** (17%, cioè una volta su cinque, come la frase sorteggiata); a patto riuscito **nessuna** delle cinque ricompense
diventa un dato. ⚠️ Il 1252/3000 dipende dal miscuglio di carriere che il guardiano costruisce (30% capitani, ruoli a caso,
premi già avuti al 35%): è un ordine di grandezza dello strumento, non la frequenza sulle carriere vere dei giocatori.

## Correzione (`src/18-career-app.jsx`)

- `haPremio227(p,id)` legge i dati: fascia/vice = `isCaptain` o premio vice già dato nel club; voce = capitano, ruolo `leader`
  o premio già dato; maglia = ruolo titolare/leader (anche da `calcSquadRole`) o maglia già promessa questa stagione;
  rigori/piazzati = premio già dato nel club.
- `scegliPremio227(p,seed)` promette, col seme, solo fra ciò che **non** ha; se non resta nulla, **la fiducia del mister**
  («Se ci riesci, avrai tutta la mia fiducia: e la vedrai in campo.»), che è sempre disponibile — quindi c'è sempre un patto.
- Il premio scelto viaggia nel patto (`coachPact.rew`, campo pigro: nessun bump SAVE).
- `assegnaPremio227` a patto riuscito **dà** il premio: `premiPatto227[id] = id del club` (vale nel club in cui è stato
  promesso: cambiando squadra si riparte); la maglia diventa `ruoloPromesso94 {r:"titolare", s:stagione}` + `squadRole`
  almeno titolare (il meccanismo già esistente del giro 94 la tiene fino a fine stagione finché la media voti regge ≥ 6,0);
  la fiducia diventa +5 in più (totale +13). Riga nel diario «La parola del mister» e nel registro. Se nel frattempo il
  giocatore ha ottenuto da sé la cosa promessa (es. è diventato capitano), il premio diventa la fiducia.
- Testi: il verdetto aggiunge la frase del premio dato («E come promesso: il rigorista sei tu.»). La frase della maglia ora
  dice «per il resto della stagione», perché è quello che il gioco dà davvero.
- Rosso `window.__CPM_NO_G227`: le cinque frasi a seme di prima, nessun premio salvato né dato.

## Guardiano `patto-227` (nuovo, nelle catene `completa` e `carriera` di `ci-runner.mjs`, una volta ciascuna)

Due parti sul gioco vero: censimento su 3000 carriere sintetiche con un giudice scritto nel guardiano (non le funzioni del
gioco) + due partite d'interfaccia (capitano titolare con rigori e piazzati già suoi; riserva senza nulla): proposta →
«Ci sto» → gare finte che rispettano il patto → «Una stretta di mano» → controllo dei dati.

| Braccio | Promesse incoerenti | Al capitano «vice» | Premi non dati | Capitano (UI) | Riserva (UI) |
|---|---|---|---|---|---|
| verde | 0 / 3000 | 0 / 765 | 0 | promette la fiducia, fiducia 82→95 (+13) | promette i piazzati, `premiPatto227.piaz="liv"` |
| rosso `__CPM_NO_G227` | 1252 / 3000 | 133 / 765 | 1748 | promette i piazzati (li ha già), +8 | nessun premio salvato né dato |

Ogni premio (rigori, piazzati, maglia, vice, voce, fiducia) è promesso almeno una volta nel verde («non giudicato» = rosso).

## Controlli eseguiti (uno alla volta)

Build: `node tools/build-src.mjs` + `node tools/check-src.mjs` → **IDENTICO BYTE PER BYTE** (7.544.194 byte, 21 frammenti).
`node --check tests/visual/ci-runner.mjs` ok; `patto-227` compare una volta in `completa` e una in `carriera`.

| Controllo | Esito |
|---|---|
| `patto-227` | ✅ verde (0/3000 incoerenti, 0 non dati, UI ok) · rosso `__CPM_NO_G227` bocciato |
| `career-critical` | ✅ PASS, uscita 0 (prima corsa troncata dal mio tetto di 590 s, uscita 143: **non valida**, rifatta da capo intera) |
| `rifiniture-200` | ✅ verde 10/10 · rosso `__CPM_NO_G200` 10/10 bocciato (foto di `docs/sviluppo/giro200/` rimesse con `git checkout`) |
| `home-199` | ✅ verde · rosso bocciato (foto di `docs/sviluppo/giro199/` rimesse con `git checkout`) |
| `save-compat` | ✅ 12 pass · 0 fail |
| `test:logic` | ✅ 51 pass · 0 fail |

Nota di metodo: per aspettare la prima corsa di `career-critical` avevo armato un ciclo d'attesa con `pgrep -f`, vietato dalle
regole fisse; l'ho fermato subito (nessun effetto sui controlli) e le attese successive sono passate dall'avviso di fine.

## Dubbi per il PO

1. **Rigorista, piazzati, vice-capitano e «voce nello spogliatoio» ora sono dati veri (`premiPatto227`), ma il resto del
   gioco non li legge ancora**: in partita il rigore e le punizioni non vanno all'eroe per questo, la fascia da vice non
   compare nel profilo, la «voce» non cambia la chimica. Vanno collegati (e come)? Oggi il premio è registrato, scritto nel
   diario e nel registro, e impedisce di riprometterlo.
2. **I premi valgono nel club in cui sono stati promessi**: cambiando squadra il giocatore torna promettibile. Va bene, o
   alcuni (es. rigorista) dovrebbero sparire anche a fine stagione?
3. **La maglia da titolare** vale fino a fine stagione (riuso di `ruoloPromesso94`, che cede se la media voti scende sotto
   6,0). Il vecchio testo diceva «non te la toglie più nessuno»: l'ho cambiato in «per il resto della stagione» perché è
   ciò che il gioco dà. Va bene o il PO vuole una garanzia più lunga?
4. **Patti già in corso nei salvataggi** (accettati prima di questa versione) non hanno `coachPact.rew`: a patto riuscito
   danno come prima +8 fiducia e +5 morale, senza premio (la frase che avevano letto non era stata salvata).
5. **Fiducia come ripiego**: quando non resta nulla da promettere il mister promette la fiducia (+5 oltre al +8) — non ho
   tolto il patto, perché il patto ha anche gli altri effetti (registro, diario, morale). Il compito lasciava aperte le due
   strade («ricompensa diversa coerente … o nessun patto»): ho scelto la prima; il rinnovo non l'ho usato perché tocca il
   contratto e il mercato.
6. **Vice-capitano e capitano dello spogliatoio**: il gioco ha un compagno con archetipo «capitano»; la fascia da vice non
   tocca quel compagno né altri. Da decidere se serve un riflesso nello spogliatoio.
