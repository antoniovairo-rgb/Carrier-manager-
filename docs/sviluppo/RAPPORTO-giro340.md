# Rapporto giro 340 — albo d'oro e marcatori della lega scelta, storico delle coppe (PO-616, PO-569, PO-570)

Base: `lavoro/201` = `d681977` (7.999.206). Ramo: `sviluppo/giro340-albo`. `GAME_VERSION` non toccata.
Banco: sessione cloud, `CPM_CHROME=/opt/pw-browsers/chromium`. File toccati: `src/17-menu-creazione-pannelli.jsx`,
`src/18-career-app.jsx` (+ `CARRIER-MANAGER-AV.html` ricomposto con `build-src`, `check-src` coerente).

## Cosa ha chiesto il PO

- **PO-616** (22/11, foto `201-albo-tuoi-titoli.jpg` e `201-albo-leghe-della-carriera.jpg`): «Nell'albo storico campioni i miei
  titoli non c'entrano nulla» e «Anche sta roba deve sparire. Deve mostrare solo lo storico / almanacco della lega selezionata
  in quel momento».
- **PO-569** (19/11, foto `198-albo-marcatori-campionato.png`): «albo e marcatori storici devono cambiare in base al campionato
  selezionato».
- **PO-570** (19/11): «manca la classifica marcatori della stagione in corso e lo storico delle stagioni giocate per tutti i
  campionati»; poi «idem per le coppe»; poi «anche per la nazionale» (vedi *Cosa resta fuori*).

## Cosa cambia (scheda Stagione)

Il selettore è la tendina **«Lega»** già in cima alla scheda Classifica (`select[data-cpm="lega23"]`). Ora comanda anche:

| riquadro | prima | dopo |
|---|---|---|
| Albo d'oro | in cima «I tuoi titoli» (campionati, Coppe, Coppe europee dell'eroe), poi una sezione per ogni lega della **carriera** dell'eroe, sempre le stesse qualunque lega fosse scelta | **una sola lega, quella della tendina**: etichette dei club più titolati, riga «in corso» (chi è in testa, podio, capocannoniere ora), poi ogni stagione chiusa con campione, 2° e 3°, capocannoniere, retrocesse se note. Nessun titolo dell'eroe: il suo club è solo segnato con ⭐ quando compare |
| Capocannonieri (stagione in corso) | solo per la lega dell'eroe (con un'altra lega scelta il riquadro spariva) | per **ogni** lega della tendina; titolo «⚽ Capocannonieri — <lega>» quando non è la tua |
| Marcatori storici | sempre la lega dell'eroe, con l'eroe dentro | la lega della tendina; l'eroe compare solo nella sua lega attuale |

I trofei dell'eroe restano dove già stavano: **Carriera → Bacheca trofei** (non toccata).

## Cosa cambia (scheda Coppe)

Nuovo riquadro **«📜 Storico delle coppe»** con la sua tendina «Coppa»: Coppa nazionale (della lega dell'eroe) · Korward
Champions Cup · Korward Europa Cup · Korward Conference Cup. Per la coppa scelta: **marcatori dell'edizione in corso** (se la
stai giocando) e **edizioni passate** con vincitore, finale e capocannoniere.

## Foto prima/dopo (telefono 412×915; anche 360×800 e PC nella stessa cartella)

Cartella `docs/sviluppo/foto-giro340/` (scattate dal guardiano con `A340_FOTO=1`, salvataggio di banco Lega B stagione 12):

- prima: `prima-albo-legaB-t412.png` — «I tuoi titoli» in cima, sezioni «Lega B 3 stag.» e «Liga Oranje 3 stag.»
- prima: `prima-albo-premier-t412.png` — scelta «Premier Division» nella tendina: l'albo resta quello della carriera
- dopo: `dopo-albo-legaB-t412.png` — albo della Lega B, niente titoli dell'eroe
- dopo: `dopo-albo-premier-t412.png` — scelta «Premier Division»: albo, capocannoniere e marcatori storici della Premier
- dopo: `dopo-coppe-t412.png` — Storico delle coppe, Korward Champions Cup scelta

## Da dove vengono i dati (e cosa manca)

Verificato nel codice, non supposto:

1. **Prima di questa versione il salvataggio conservava solo il campionato dell'eroe**: `player.leagueArchive` (una riga per
   stagione: lega, campione, retrocesse, piazzamento e gol dell'eroe). **Delle altre leghe nessuna stagione chiusa è salvata.**
   Le classifiche delle altre leghe sono ricalcolate al volo da `calcWorldStandings(lega, stagione, settimana, leagueOverrides)`,
   che però dipende dagli spostamenti promozione/retrocessione **di quella stagione**, che il salvataggio non tiene per le stagioni
   passate: ricalcolare il passato con gli spostamenti di oggi darebbe classifiche non vere. **Non l'ho fatto.**
2. **Da ora in avanti** il cambio di stagione scrive due campi **facoltativi**:
   - `player.albo340`: per **ogni lega** podio (1°-2°-3°), numero di squadre e capocannoniere, dalle stesse sorgenti che il gioco
     mostra (la classifica vera dell'eroe; `calcWorldStandings` a G38 con gli spostamenti della stagione per le altre — gli stessi
     che il rollover usa per promozioni e retrocessioni). Misurato sul banco: **14 leghe su 14**, tutte con podio e capocannoniere,
     **1,8 KB per stagione** (tetto 30 stagioni ≈ 54 KB).
   - `player.alboCoppe340`: coppa nazionale (vincitore, finale e capocannoniere dal tabellone vero `cup.cupBracketMatches`, che il
     simulatore completa anche quando l'eroe esce) e le tre europee (vedi punto 4).
   Salvataggi vecchi: campo assente = lista vuota, **nessuna migration e nessun `SAVE_VERSION`** (lettura sempre con `|| []`).
3. Per le stagioni chiuse prima di questa versione l'albo mostra ciò che c'è: per i campionati giocati dall'eroe il campione (e le
   retrocesse); per gli altri niente. La schermata lo **dichiara** in una nota («N stagioni di questa lega senza dati»).
4. **Coppe europee**: il gioco non simula le coppe europee che l'eroe non gioca. Il vincitore di ogni edizione è già oggi una
   **derivazione seedata** (formula `hashStr(coppa|albo|stagione)` sul gruppo di club per prestigio, quella degli «Ultimi
   vincitori» del 7.35.1): l'ho riusata identica (`vincitoreEuro340`) così le due viste non divergono. **Finale e capocannoniere**
   esistono solo per la coppa giocata dall'eroe (finale solo se l'ha giocata). Per le altre la schermata scrive «il gioco ne simula
   solo il vincitore, non i marcatori».
5. **Coppe nazionali delle altre leghe**: non esistono nel gioco (c'è una sola coppa nazionale, quella della lega dell'eroe). Non
   compaiono nella tendina; nulla inventato.
6. I marcatori della stagione delle altre leghe sono una **stima deterministica** (stessa formula e stessi semi per club di
   `generateLeagueScorers`, prestigio × giornate): non c'è un motore che faccia segnare i singoli giocatori delle altre leghe.

## Guardiano

`npm run albo-340` (`tests/visual/albo-340.mjs`, non-gate), nelle righe della MAPPA già esistenti di `src/18|src/10` e `src/1[17]`.
Tre formati (360×800, 412×915, 1440×900). Verde: nessun «I tuoi titoli» né sezioni «N stag.» della carriera; albo, capocannonieri
(≥ 3 righe) e marcatori storici dichiarano la lega della tendina; si sceglie «Premier Division» → tutti e tre passano a Premier
e il contenuto cambia (capocannoniere sintetico della Premier presente, quello della Lega B assente); storico delle coppe presente
e la sua tendina cambia l'edizione; niente scroll orizzontale; fotografia di fine stagione completa su tutte le leghe.
Rosso `window.__CPM_NO_G340` = schermata di oggi. Esito:

```
VERDE t360/t412/pc: albo Lega B→Premier Division · capocannonieri 12→12 righe · storici Lega B→Premier Division · coppe si
FOTOGRAFIA pc: 14/14 leghe, 14 con podio+capocannoniere, lega dell'eroe = sua classifica, coppe true, 1.8 KB per stagione
BRACCIO verde+rosso · MOTIVO verde: 0 difetti · rosso: 24 (es. t360 · «I tuoi titoli» ancora nell'albo)
```

`albo-122` (giro 122) descriveva proprio la schermata che il PO ha fatto togliere: ora arma `__CPM_NO_G340` in entrambi i bracci e
custodisce quella schermata come rosso del 340 (verde+rosso, rieseguito: verde).

## Catena del giro

`node ci-runner.mjs giro albo-340 career-critical save-compat design-system` (= i quattro + 17 sentinelle, 18 passi):

ESITO_CATENA

## Dubbi per il PO

1. **Le stagioni passate delle altre leghe** (prima di questa versione non salvate). Opzioni:
   - **(consigliata) A — lasciarle vuote con la nota**: nulla di inventato; l'almanacco si riempie una stagione alla volta.
   - B — ricostruirle con `calcWorldStandings` sugli spostamenti di oggi, marcate «ricostruite»: piene subito, ma per le leghe che
     hanno cambiato squadre i campioni possono essere club che quell'anno non c'erano.
   - C — ricostruirle solo per le leghe la cui composizione non è mai cambiata nella carriera (verificabile), vuote le altre.
2. **L'eroe nell'albo**: oggi il suo club è solo segnato con ⭐ nel podio. Opzioni:
   - **(consigliata) A — così**: almanacco puro, come chiesto.
   - B — riga «la tua squadra: N°» sotto ogni stagione in cui ha giocato quella lega.
   - C — nessun segno.
3. **Coppe europee che l'eroe non gioca**: il vincitore è derivato (già oggi), marcatori e finale no. Opzioni:
   - **(consigliata) A — così, dichiarato in schermata.**
   - B — simulare un tabellone completo per ogni coppa europea a fine stagione (finale e marcatori stimati per tutte): lavoro di motore.
   - C — togliere dallo storico le coppe che l'eroe non ha mai giocato.
4. **«anche per la nazionale» (PO-570, terzo messaggio)**: non fatto in questo giro (il compito elencava campionati e coppe). Opzioni:
   - **(consigliata) A — giro a parte**, partendo da `player.euroMondiale`/`worldMemory` (cosa è salvato va verificato prima).
   - B — aggiungere Europeo/Mondiale alla stessa tendina delle coppe.
   - C — lasciarlo nella scheda Nazionale di Carriera.

## Cosa resta fuori

- Nazionale (vedi dubbio 4). Coppe nazionali di altre leghe: non esistono nel gioco.
- La lista dei marcatori storici di `LEAGUE_RECORDS` ha 5 nomi per lega (nota della foto 198, non chiesta): non toccata.
- Il riquadro «Dagli altri campionati» resta com'è (già spento dal giro 298).
