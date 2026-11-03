# Grafica V2 «Notte da stadio» — tappa 2 (PO-302)

Ramo `sviluppo/v2-tappa2` (da `lavoro/179`, bf2d42eb). Riferimento: `docs/design/grafica-v2/` (V2Home, V2Stagione, V2Club,
V2Agente, V2Ufficio e versioni PC). Tutto dietro `v2On()` / `TH.v2`; l'interruttore rosso `__CPM_NO_V2` riporta la 178.
Non toccati: `src/12`, `src/14`, `src/15`, `GAME_VERSION`, `docs/governo/*`. File di gioco toccati: `src/11` (due mattoni
nuovi `TitoloV2`, `TaccheV2`) e `src/18`.

## 1. Testata compatta e Simula (decisioni PO 02/11)

**Testata** (`data-cpm="testata-v2"`): stemma su piastrella chiara, nome del club in carattere TV, riga
«lega · St. N · Sett. N/38 · N° posto · salvato HH:MM», **Salva** e **Opzioni** come icone 44×44 con `aria-label`
(«Salva carriera, ultimo salvataggio HH:MM», «Opzioni»; `title="Impostazioni"` resta per le sonde che lo cercano).
La barra torna a **6 voci** (Home, Stagione, Club, Carriera, Agente, Ufficio).

Valori della testata di prima **ricollocati, non tolti** — scelte:
| prima nella testata | ora |
|---|---|
| Forma, Morale | anelli della card dell'eroe in Home (come V2Home) |
| **Fatica** | **terzo anello** accanto a Forma e Morale (colore al contrario: bassa = verde, 36-65 giallo, oltre rosso) |
| nome, nazione, ruolo | card dell'eroe in Home (riga «nazione · ruolo · età · ruolo in squadra») |
| OVR | figurina piccola della card dell'eroe (c'era già) e figurina grande in Carriera |
| ritratto che apre la figurina completa | la figurina piccola della card dell'eroe è ora un pulsante (`data-cpm="figurina-testata"`) che apre la stessa figurina completa |
| ora dell'ultimo salvataggio | riga sotto il club («salvato HH:MM») e `aria-label` dell'icona |
| versione | resta in testata (stesso componente `VersioneTestata269`, che sfuma da solo) |
| lega, stagione, settimana, posto | riga sotto il club |
| marchio Korward | non ripetuto in testata (la V2Home non lo ha; resta nel menu e nella home fuori carriera) |

Scostamento dichiarato: fuori dalle schede Home, nome/OVR dell'eroe non stanno più in alto (la V2 li vuole in Home e Carriera).

**Simula** (`data-cpm="simula-v2"`), accanto a **Gioca** nel riquadro della prossima partita; «Calendario» scende sotto,
a tutta larghezza (44 px). Simula **non salta le regole**: chiama lo stesso `handleContinua` del tasto principale con un
parametro, che arriva allo stesso `setShowMatchPrompt(md)` (stesse guardie: finestre aperte, freno ai tocchi ripetuti,
interazioni d'apertura) e segna `simula302`. Il prompt è lo stesso (decisione del mister titolare/panchina/non convocato,
squalifica, infortunio) con la scelta già fatta: riga «Hai scelto Simula…», niente «Gioca», tasto di conferma Simula in
evidenza, «Non ora» per tornare indietro. Quando non è possibile resta **spento con il motivo** scritto nel tasto:
«prima vivi la settimana», «sei infortunato» (l'infortunio passa dal percorso di recupero del tasto principale), «prima la
Nazionale», «prima il torneo della Nazionale», o il motivo del tasto principale se è spento.

## 2. Stagione

- Titolo V2 (`data-cpm="stagione-v2"`) sopra le sotto-schede: «lega · St. N», «CLASSIFICA / CALENDARIO / COPPE».
- Sulla classifica a destra: **«−N dalla vetta»** (in vetta: «+N sulla seconda», in oro) e la **forma V/N/P** della tua squadra.
  La forma per le altre squadre **non c'è**: il gioco non tiene i risultati delle altre (solo i totali); inventarla sarebbe
  un dato falso. Scostamento dalla tavola dichiarato.
- La tua riga è nel colore del club (velo 0,28). Restano tutte le colonne (G V N P Gf Gs Diff Pt), le medaglie, la
  legenda e le fasce: Coppa/promozione/retrocessione erano già **solo dove esistono** (giro 98 D7) e non sono cambiate.
- Calendario e Coppe: stesso titolo V2; il contenuto era già sul tema V2 dalla tappa 1. Un ridisegno più profondo
  (righe a blocchi della tavola) resta alla tappa 3.

## 3. Club

- **Fascia del club** (`data-cpm="club-v2"`): colore del club con righe diagonali, stemma su piastrella chiara, nome in TV,
  «lega · N° su M · punti», progetto, curva (con la contestazione), staff, **prestigio** in TV. Inchiostro calcolato per
  contrasto (`inkSu945`) come la testata di prima: niente velo sul testo.
- **Anelli** (`data-cpm="club-anelli-v2"`): **Fiducia del mister** (verde) e **Popolarità** (oro). La tavola dice «Amore dei
  tifosi»: il gioco non ha un valore su 100 con quel nome (la curva è un giudizio a parole, che resta nella fascia); ho usato la
  popolarità con la sua etichetta vera.
- **Rosa**: OVR su piastrella in carattere TV, **oro da 85** (inchiostro scuro), grigio sotto.

## 4. Agente e Ufficio

- **Agente**: titolo V2 «Mercato e contratto / AGENTE»; nel riquadro «Il tuo contratto» la **barra della durata**
  (`data-cpm="contratto-v2"`: quanto è trascorso, «N stagioni» in verde/giallo/rosso, «scaduto»); nelle **voci di mercato**
  l'**indicatore d'interesse a 3 tacche** (trattativa/forte 3 verdi, moderato 2 gialle, sondaggio 1) accanto alla parola, che resta.
  I tasti del procuratore erano già nella scheda e non sono stati spostati.
- **Ufficio**: titolo V2 «Patrimonio e staff / UFFICIO»; patrimonio in carattere TV 44 px; **staff privato a tacche** (tre barre
  oro al posto dei pallini, `aria-label` «livello N di 3»), con valore/resa/costo/consiglio del trainer già presenti (PO-281/288).
- **Andamento del patrimonio**: **non fatto**. Il gioco non conserva una serie storica del saldo; aggiungerla vuol dire un campo
  nuovo nel salvataggio (con migrazione), fuori da una tappa di sola grafica. Punto aperto.

## 5. Momenti e finestre

**Non fatti in questa tappa** (consumo da contenere). Ordine proposto per la tappa 3: intervista (V2Intervista), offerta
(V2Offerta), fine stagione/galà (V2FineStagione), fine carriera (V2FineCarriera), poi creazione, Nazionale, ingresso e festa
(solo DOM). Oggi queste finestre hanno già il tema V2 (colori e tasti) ma non il disegno delle tavole.

## Misure (Chromium headless, 412×915 · 820×1180 · 1180×820 · 1440×900)

| | valore |
|---|---|
| contrasto minimo WCAG (home, testata, barra, Stagione, Club, Agente, Ufficio) | **4,99:1** (Home, invariato); carriera 6,56:1 |
| icone della testata | 44×44 px |
| tasto Simula | 150×70 px a 412 (spento, col motivo) |
| voci della barra | 6; a 360 px il tasto più stretto 48,5 px (era 40,3 con 7 voci); spazio fra etichette 28,9 px a 412 |
| spazio fra i riquadri V2 della home | 7,8 px |
| scorrimento orizzontale | 0 px in tutte le schede misurate nei 4 formati |
| testi tagliati | 0 |

## Guardiani

**Nuovi / estesi**
- `grafica-v2` esteso: **TEST** (testata, icone ≥44 con aria-label, barra a 6 voci senza Opzioni, Simula nel riquadro) e
  **SCH** (Stagione, Club, Agente, Ufficio: elementi V2 + contrasto, tagli, scorrimento); la card dell'eroe ora vuole 3 anelli.
  **Verde** 4 formati; **rosso** (`__CPM_NO_V2`): cadono PAL, NAV, HOME, TEST e SCH in ogni formato. Verificati entrambi.
  Correzione dello strumento: il giro SCH era finito prima della misura della Carriera, che veniva così presa sull'Ufficio
  (0 testi): spostato dopo.
- `simula-v2` (nuovo): settimana da vivere → Simula spento con «prima vivi la settimana», ≥44 px; settimana vissuta → Simula
  apre il prompt con la decisione del mister, senza «Gioca», e la conferma avanza la settimana (12 → 13). **Verde**; **rosso**
  (`__CPM_NO_V2`): il tasto non c'è. In `package.json` e in `ci-runner.mjs` (catene `completa`, `carriera`, `grafica`; MAPPA `src/18`).
- `lib/banco-v2.mjs`: il banco di `grafica-v2` estratto per le sonde nuove (con `prep` per ritoccare il salvataggio).
- `foto-v2-tappa2.mjs`: strumento delle foto (non guardiano).

**Esistenti, uno alla volta**

| guardiano | esito | note |
|---|---|---|
| `design-system` | **verde** | nessun raggio a mano, nessun corpo sotto 11 px |
| `griglia-mobile` (360-430, 13 schermate) | **verde**, contrasto sotto soglia **0** ovunque | primo giro: 1 nodo su ogni scheda di carriera (2 nel Club) = la sigla SVG dello stemma misurata sulla piastrella chiara (1:1) → stemma della testata senza piastrella, piastrella scura nella fascia del Club (correzione del gioco). Artefatti `docs/collaudo-grafico/g0` riportati a com'erano |
| `spazio-296` | **verde** + rosso | 44 schermate, distanze 6-10 px |
| `schermate-97` | **verde** + rosso | D1 · D16 · D17 · D14 |
| `pc-tablet-292` | **verde** + rosso al 2° giro | 1° giro rosso solo sul punto 5 («con Tab il fuoco non arriva a una scelta della punizione», partita, `src/15` non toccato): stesso punto instabile già segnalato in tappa 1 → **da riparare** (instabile due volte) |
| `barra-360-72` | **verde** + rosso | rosso aggiornato alla barra di prima intera (vedi sotto) |
| `home-066` | **verde** | 127 riquadri in 7 situazioni, 0 fuori standard (censimento aggiornato) |
| `classifica-102` | **verde** | |
| `trainer-288` | **verde** + rosso | |
| `procuratore-253` | **verde** + rosso | |
| `piccoli-85` | **verde** + rosso | |
| `stile-unico-75` | **verde** + rosso | |
| `crea-home-295` | **verde** + rosso | |
| `impulsi-289` | **verde** + rosso | |
| `acquisti-281` | **verde** + rosso | |

Non lanciati: catena intera, gate 14/14, guardiani di partita (`src/12/14/15` non toccati), `intervista-231`, `finestra-230`,
`popup-224`, `rinnovo-270`, `livello-79` (finestre del punto 5, non toccate in questa tappa).

Sonde adattate all'icona Opzioni (non soglie): `griglia-mobile` e `spazio-296` (la funzione `premi` legge anche
`aria-label`), `pc-tablet-292` (cerca Opzioni anche nella testata).
`barra-360-72`: il braccio rosso (`__CPM_NO_BARRA72`, larghezze uguali) a **6 voci** non riproduce più il difetto (spazio minimo
>15 px anche a larghezze uguali): il rosso ora accende anche `__CPM_NO_V2`, cioè la barra di prima per intero (7 voci) — che dà
di nuovo 12,6 px a 360. **Soglia invariata (15 px).**

## Foto (`docs/sviluppo/foto-v2-tappa2/`)

`prima-*` = tappa 1 (bf2d42eb), `dopo-*` = questa tappa; telefono 412 e PC 1440, schede Home, Classifica, Calendario, Club,
Agente, Ufficio. Banco `banco-g0` (lo storico gol è sintetico).

## Punti aperti

1. Andamento del patrimonio: serve un campo nuovo nel salvataggio (decisione PO).
2. Forma V/N/P delle altre squadre in classifica: il gioco non ha i dati.
3. «Amore dei tifosi» della tavola reso come Popolarità.
4. Testata a 360-412 px: la riga sotto il club va su 2-3 righe (con la versione accanto, che sfuma dopo 9 s); niente tagli.
5. La home **fuori carriera** (`src/19`) ha ancora Opzioni nella barra: non è la barra della carriera, non toccata.
6. Il prompt di prima (`__CPM_NO_MATCHPROMPT23`) non conosce la scelta Simula: con quel rosso il tasto Simula apre il prompt
   classico con Gioca e Simula.

## Tappa 3

Partita, highlight, post partita (`src/12/14/15`, dopo il rilascio della 178); momenti e finestre del punto 5 nell'ordine
sopra; calendario e coppe a blocchi come la tavola V2Stagione.
