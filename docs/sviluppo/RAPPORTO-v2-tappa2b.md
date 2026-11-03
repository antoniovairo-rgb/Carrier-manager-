# Grafica V2 «Notte da stadio» — tappa 2b (PO-302)

Ramo `sviluppo/v2-tappa2b` (da `lavoro/179`, 9cad24dc). Riferimento: `docs/design/grafica-v2/` (V2Intervista, V2Offerta,
V2FineStagione, V2FineCarriera, V2Stagione). Non toccati: `src/12`, `src/14`, `src/15`, `GAME_VERSION`, `docs/governo/*`.
File di gioco toccati: `src/07` (una costante), `src/11` (mattone `TagV2`), `src/16` (fine stagione), `src/17` (fine carriera),
`src/18` (intervista, offerta, calendario, hook di sonda).

**Regola PO 03/11 «grafica unica»**: il markup nuovo **sostituisce** quello di prima, senza rami doppi. Dove serve il rosso di
un guardiano, la differenza col tema di prima passa solo dai **token** (`TH.*`, e due scelte di colore `TH.v2?…:…`: i toni
delle risposte e il tasto della controproposta). `__CPM_NO_V2` quindi non riporta i vecchi blocchi: riporta il tema.

## 1. Finestre e momenti

| | cosa cambia | dati: niente tolto |
|---|---|---|
| **Intervista** (`intervista231`) | occhiello in oro (`iv-occhiello-v2`); **domanda grande** in carattere TV 24 px senza riquadro (`iv-domanda-v2`); risposte a riquadro `#1a1e27` raggio 16, alte ≥ 60 px, con la **barra del tono** a sinistra e il tono in maiuscolo (umile verde, ambizioso oro, diplomatico blu: i colori di prima su fondo notte erano ~3:1) | scenografia 2D della sala stampa, figurine, «In sala», prima pagina e rilancio invariati |
| **Offerta** (`offerta23`) | **fascia del club** che offre (`offerta-v2`: colore del club, righe diagonali, stemma su piastrella, «Offerta ufficiale»/«Proposta di rinnovo», nome in TV); **confronto oggi → nuovo** (`confronto-v2`): stipendio, durata, ruolo, prestigio, **in verde ciò che migliora**; riquadro dell'offerta neutro (non più blu) | stipendio/durata/prestigio passano dal riquadro al confronto (il prestigio resta nel riquadro se manca quello di oggi); riscatto, minutaggio, morale, crescita, situazione del club, ultime 5, mister invariati |
| **Fine stagione** (`SeasonEndScreen`) | **bilancio** (`finestagione-v2`): «Stagione N · bilancio» in oro, «N° in Lega» in TV 32 px, club · traguardo · posizione su N, titolo del giornale, festeggiamenti; **quattro numeri** (`finestagione-numeri-v2`: partite, gol in oro, assist, OVR); tasto «Inizia Stagione N+1» chiaro in carattere TV, 54 px | sostituisce l'intestazione pastello e il riquadro stato+numeri (stessi dati); mister, presidente, film, obiettivi, galà invariati |
| **Fine carriera** (`CareerEndScreen`, pagina dopo la cerimonia) | «Fine di un'era» in oro, nome e **cognome grande** (TV 44 px), «N stagioni · N club · ritirato a N anni», giudizio + Legacy Score con barra oro; **totali a tessere** (gol e trofei in oro); **il percorso club per club** (`percorso-v2`): stagioni consecutive nello stesso club = un tratto, «St. a–b» e barra proporzionale nel colore del club | sostituisce intestazione, riquadro Legacy e «Statistiche Carriera» (stesse 6-7 voci + miglior stagione); eredità, premi, Hall of Fame, momenti, stampa invariati |

- **Effetto della risposta nell'intervista: NON scritto.** La tavola mostra «tono · effetto»; il gioco conosce l'effetto ma una
  direttiva PO (6.5.4) lo tiene **nascosto apposta** («l'esito non deve condizionare la risposta»), e la frase in fondo lo dice.
  Scelta prudente: solo il tono. Da decidere col PO se la V2 debba superare la 6.5.4.
- **Consiglio del procuratore nell'offerta**: il gioco non ha una frase di consiglio; ha la **controproposta** (stipendio +20%,
  una stagione in più), che resta. Non inventato.
- **Galà dei premi**: la cerimonia (`SeasonAwardsScreen`) non è stata ridisegnata.

## 2. Calendario a blocchi

Righe delle **prossime partite** compatte (≥ 50 px, `riga-cal-v2`) con le **etichette a blocchetto** (`TagV2`, mattone nuovo in
`src/11`): **CASA** (verde) / **FUORI**, **COPPA · turno** (oro), competizione europea, **Nazionale** (il `data-cpm="naz247"` resta).
Al posto di «· in casa / · in trasferta» e dei chip chiari di prima (`#ede9fe`, bordo `#fde68a`, illeggibili sul fondo notte).
Il nome della partita corrente era granata su blu (contrasto basso) → `TH.brandText`. Nelle **partite giocate** la stessa
etichetta CASA/FUORI e il punteggio in carattere TV. La scheda **Coppe** ha già il titolo V2 (tappa 2): le sue righe non sono
state ridisegnate.

## Misure (Chromium headless; 412×915 · 820×1180 · 1180×820 · 1440×900)

| | valore |
|---|---|
| contrasto minimo WCAG nelle 5 schermate | **4,83:1** (offerta; il tasto della controproposta era **2,13:1**); intervista, fine stagione, fine carriera 6,56:1; calendario 6,17:1 |
| tocco | risposte ≥ 60 px; tasti dell'offerta ≥ 44 px (controproposta era 27 px); righe del calendario ≥ 50 px |
| scorrimento orizzontale · testi tagliati | 0 · 0 in tutte e 5 le schermate nei 4 formati |
| spazio fra riquadri | `_sb(SP.sm)` → 7 px (SP.box) come il resto del gioco; `spazio-296` 6-10 px |

## Guardiani

**Nuovo: `momenti-v2`** (`npm run momenti-v2`, in `package.json` e in `ci-runner.mjs`: catene `completa`, `carriera`,
`grafica`; MAPPA `src/0x`, `src/11|17`, `src/16|18`). 4 formati × 5 schermate (intervista, offerta, fine stagione, fine carriera,
calendario): FORMA, PAL (superfici V2, gol in oro), TOCCO ≥ 40 px, TXT, CON WCAG. **Verde** 4 formati, contrasto minimo 4,83:1.
**Rosso** (`CPM_PROVA_ROSSO=1` → `__CPM_NO_V2`): cade PAL su ogni schermata in ogni formato. Verificati entrambi.
Primo giro **rosso su un difetto vero**: «Fai la controproposta» bianco con testo rosa (2,13:1, 27 px) → tasto secondario V2.
Misura WCAG estratta in `lib/misura-v2.mjs` (copia di quella di `grafica-v2`, che non è stato toccato).
Hook di sonda nuovo `__CPM_CAREER.apriFine302('stagione'|'carriera')` (dati dalla classifica corrente / stesso `doRetire`).

**Esistenti, uno alla volta** (tutti con `CPM_CHROME=/opt/pw-browsers/chromium`)

| guardiano | esito |
|---|---|
| `grafica-v2` | **verde** 4 formati, 4,99:1 (solo verde: non toccato) |
| `design-system` | **verde** |
| `griglia-mobile` | **verde**, contrasto sotto soglia **0** su tutte le schermate e larghezze (artefatti `g0` ripristinati) |
| `spazio-296` | **verde** + rosso (44 schermate, 6-10 px) |
| `schermate-97` | **verde** + rosso |
| `intervista-231` | **verde** + i due rossi (club e Nazionale) |
| `finestra-230` · `popup-224` · `rinnovo-270` · `procuratore-253` | **verde** + rosso |
| `calendario-247` | **verde** + rosso (riga Nazionale intera) |
| `crea-home-295` · `crediti-254` | **verde** |

Nessun guardiano ha dovuto essere aggiornato. **Non lanciati**: `livello-79`, `nazionale-155`, `convocazione-235`,
`festa-oro-251` (Nazionale, creazione e feste non toccate in questa sessione), catena intera, gate 14/14.

## Foto (`docs/sviluppo/foto-v2-tappa2b/`)

`prima-*` (9cad24dc) e `dopo-*`: telefono 412 e PC 1440 per intervista, offerta, fine stagione, fine carriera; calendario al
telefono. Strumento `tests/visual/foto-v2-tappa2b.mjs` (`CPM_FOTO_PREF`, `CPM_SCHERMI`, `CPM_FORMATI`).

## Punti aperti

1. **Creazione (V2Creazione) e torneo della Nazionale (V2Nazionale): non fatti** in questa sessione (consumo). Restano col tema V2.
2. Effetto della risposta nell'intervista: nascosto per la direttiva 6.5.4 (vedi sopra) — decisione PO.
3. Fine stagione: la card «Nel pieno della carriera» (fase di carriera) ha ancora un fondo chiaro pastello sul tema notte.
4. Scheda Coppe: righe non ridisegnate; galà dei premi non ridisegnato.
5. Con `__CPM_NO_V2` le nuove forme restano (regola «grafica unica»): il rosso cambia il tema, non il disegno; nel tema di prima
   il tono «Ambizioso» delle risposte misura 2,80:1 (colore storico `#f97316`, non usato in V2).
