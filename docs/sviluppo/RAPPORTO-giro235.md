# Rapporto giro 235 — profilo chiaro e grafica coerente (7.999.197)

Voci: **PO-457** (G195-09, Profilo in pochi gruppi, contratto in un posto solo) e **PO-458** (G195-11+12+13: un solo stile per il
tasto principale, stessa testata e stesso menu, fiducia e popolarità con la stessa forma). In più la **decisione PO del 17/11** sui dubbi
del giro 234: «Testo grande» a **due gradini, +15% e +30%**.
Ramo `sviluppo/giro235-profilo-grafica`, partito da `lavoro/197`. `GAME_VERSION` non toccato.

Fonti lette: `docs/collaudo/GIRO195-USABILITA.md` (ramo `collaudo/giro195-usabilita`, punti a.2/a.3 e G195-09/11/12/13),
`docs/governo/BACKLOG.md` e `DECISIONI.md` (ramo `poc/marioprada-character-system`: PO-457, PO-458, PO-411, PO-391, PO-409).

## Come ho misurato

- **Sonda `tests/visual/misura-235.mjs`** (nuova). Gioco vero (`?cpmtest=1`), carriera di prova del giro 195
  (`fixtures/save-c177-s5w20.json`: FC Frankfurt, colore sociale **#0f0f0f**, St. 5 sett. 20), telefono con tocco **375×667** e PC
  **1366×800**. Misura scheda per scheda: i tasti pieni e «forti» (fondo, inchiostro, carattere, maiuscolo, se stanno sul riquadro del
  club), il titolo della scheda, le fisarmoniche/gruppi del Profilo e le parole inglesi nei titoli, dove si legge il contratto per intero,
  la barra del menu fuori e dentro la carriera, la forma di fiducia e popolarità in Home e Club, le scelte di «Testo grande» e il corpo
  minimo della Classifica per ogni gradino. Più le due finestre della settimana e della partita.
- **Foto** in `docs/sviluppo/giro235/`: `prima/` (build di partenza, 7.999.196) e `dopo/` (questo ramo), a 375 e 1366: ogni scheda,
  le due finestre, le Opzioni, il menu fuori carriera; `foto/` (sonda `foto-235.mjs`): il Profilo dove cominciano i gruppi (prima: le
  fisarmoniche), i cinque gruppi chiusi, Agente, la scheda «Lettura» delle Opzioni, per i due bracci (prima = rosso `__CPM_NO_G235`).

## Prima → dopo (numeri misurati)

| Punto | Prima (7.999.196) | Dopo (ramo) |
|---|---|---|
| Stili del tasto principale (375, 8 schede + 2 finestre) | **4**: crema in carattere TV («Vivi la settimana»), crema in carattere normale («Gioca la partita», «Una stretta di mano»), verde («Fai girare il nome»), colore del club («Vai al prossimo momento», nero #0f0f0f su fondo nero) — più il bordeaux di «Scegli» in partita | **1 regola**: pieno nel colore del club, carattere TV maiuscolo; 5 tasti censiti, tutti in regola (2 fondi: colore del club; crema dove il tasto sta sul riquadro già nel colore del club) |
| Titolo della scheda | Stagione, Agente e Ufficio nel contenuto (Agente sotto il riquadro del procuratore, a 301 px); Home, Club e Carriera **nessuno** | Il titolo di **ogni** scheda nella testata compatta, stesso posto e corpo nelle 8 schede; testata **98 → 101 px** (+3) |
| Menu fuori / dentro carriera | fuori: icona sopra e parola sotto (2 righe), minuscolo, voce attiva non dichiarata; dentro: una riga, maiuscolo | **stessa voce**: una riga, Barlow Condensed, maiuscolo, stesso corpo e altezza minima, voce attiva dichiarata (`aria-current`) |
| Profilo | **20 fisarmoniche** in fila; inglese nei titoli: Milestone, Achievement, Timeline, MVP | **5 gruppi** (Numeri · Premi e traguardi · Storia · Persone · Contratto e attributi), **0** fisarmoniche fuori dai gruppi, **19 sezioni**, **0** parole inglesi |
| Contratto per intero (stipendio + durata/scadenza) | Profilo **e** Agente | **solo Agente**; in Profilo e in Club una riga «Contratto: scade … · Dettagli in Agente ›» |
| Fiducia del mister / popolarità | barre in Home, anelli in Club | **gradini** (5 tacche + parola + numero) in Home **e** Club |
| Testo grande | un gradino (×1,3): corpo minimo 12 → 16 | **due gradini**: normale 12 · **+15% 14** · **+30% 16**; il vecchio valore salvato «1» resta +30% (16) |

## Cosa ho cambiato

**PO-457 — Profilo (src/11 + src/18).**
- `GruppoProfilo235` (src/11): il gruppo è l'unica cosa che si apre e si chiude (un `<button>` con `aria-expanded`, la scelta resta per
  id come le fisarmoniche, il cappello dice quante sezioni ha). Dentro un gruppo, ogni vecchia `Fisarmonica` diventa una **sezione fissa**
  col suo titolo (`role=heading`, livello 3) e il nome nuovo da `NOMI235`. Un gruppo senza sezioni non si disegna.
- I blocchi del Profilo sono stati **spostati** (non riscritti) nei cinque gruppi; «Record di carriera», che stava fuori dal contenitore
  del Profilo, è entrato in «Numeri».
  - **Numeri** (aperto all'avvio): Questa stagione · Andamento negli anni · Massimi di carriera · Piazzamenti e titoli.
  - **Premi e traguardi**: Bacheca dei trofei · Premi individuali · Corsa ai premi della stagione · Migliore del mese · Traguardi
    (era «Milestone») · Imprese (era «Achievement», col conto 4/34) · La tua sfida.
  - **Storia**: Biografia · Stagione per stagione (era «Timeline Stagioni») · Diario di carriera · Memoria della carriera · Partita del
    cuore · La città ti ricorda.
  - **Persone**: Rivale · I tuoi allenatori · La stampa.
  - **Contratto e attributi**: Attributi · Stile di gioco · Stato Under 18 · contratto (rimando) · Club dei sogni · lista trasferimenti,
    prestito, squalifica, ritiro anticipato.
  - In cima restano la figurina, il badge del ruolo, la fascia e i premi del patto (sono stato del giocatore, non sezioni da consultare).
- Contratto: in Profilo la fisarmonica «Contratto» diventa la stessa riga di rimando che il Club aveva già (giro 49), con «Dettagli in
  Agente ›»; nel Club la scritta «Procuratore ›» diventa «Dettagli in Agente ›» (la scheda si chiama AGENTE).
- Il messaggio «Achievement: …» del toast diventa «Impresa: …».

**PO-458 — tasto principale (src/11, src/15, src/18, src/19).** La regola, scritta partendo da PO-411 (il tasto del momento del giro 194):
**pieno nel colore del club, carattere TV maiuscolo nero-grassetto, inchiostro scelto dal contrasto** (`inkSu945`). Due casi della stessa
regola: se il colore del club si confonde col fondo (contrasto < 3:1, come il nero #0f0f0f del salvataggio di prova) il fondo resta quello
e **un filo chiaro** (`TINTE.sec`) ne disegna il bordo; se il tasto sta **sopra il riquadro già nel colore del club** (la «Prossima» della
Home) è il **negativo crema**. Senza club (menu iniziale, creazione, provino) è crema. Un solo punto: `tasto235` / `stileTasto235` in src/11,
usato da `Btn` (varianti `primary` e `green`), dal tasto appiccicato della Home, dal tasto del momento (solo il filo) e da «Scegli» in
partita. `_TP235.c` lo scrive `CareerApp` a ogni disegno, `App` lo azzera fuori dalla carriera.

**PO-458 — testata.** Il titolo della scheda (Home · Classifica · Calendario · Coppe · Club · Profilo · Nazionale · Agente · Ufficio) sta
nella **riga 2 della testata compatta**, accanto all'ora del salvataggio; la riga 1 (lega · stagione · settimana · posto) fa da
occhiello. Per i lettori di schermo il titolo c'era già (h1 del giro 234), quindi quello visibile è `aria-hidden`.
*Prima stesura scartata, misurata:* un `TitoloV2` (occhiello + titolo grande) in cima al contenuto di Home, Club e Carriera. A 375×667
spingeva «Vivi la settimana» da 460-548 px a **524-612 px**, sotto la barra (che comincia a 556): `tocco-213` è diventato rosso perché il
tocco finiva sulla barra. È anche contro la decisione 02/11 («il titolo va aggiunto senza ingrossarla»). Ora la testata cresce di 3 px.

**PO-458 — menu.** La barra della Home fuori dalla carriera usa la stessa voce della barra di carriera (`_NAV235` = la misura di
`_NAV954`): solo parola, una riga, maiuscolo, voce attiva col filo e `aria-current`. Le azioni restano quelle (Home, Rivedi intro,
Importa, Opzioni).

**PO-458 / PO-391 — fiducia e popolarità.** `GradiniV235` (src/11), lo stesso in Home e Club: 5 tacche, la parola del gradino e il numero
piccolo. Le soglie della fiducia sono quelle del giudizio «Allenatore» già nel Club (85/70/50/30: In crisi · In dubbio · Neutro · Fiducioso
· Fiducia totale), così tacche e parole non si contraddicono; la popolarità sale per quinti (Poco conosciuto · Conosciuto · Apprezzato ·
Popolare · Idolo).

**Testo grande a due gradini (src/01, src/19).** In Opzioni › Lettura un gruppo di tre scelte «Normale · +15% · +30%»
(`role=radiogroup`, nome «Testo grande»). La scelta resta nella stessa chiave del browser `cpm-testo-grande` (`15`, `30`, `0`); il vecchio
`1` del giro 234 era il ×1,3 e resta +30%. Nessun SAVE bump.

## Guardiani

- **Nuovo `coerenza-235`** (`npm run coerenza-235`, nella catena completa e nella MAPPA di src/01, src/11, src/15, src/18, src/19).
  Giudica a 375 e 1366: **T** ogni tasto principale in regola (almeno 3 censiti) · **H** titolo nella testata in tutte e 8 le schede,
  stesso posto e corpo · **V** la testata non ingrossa (testata e quota di «Vivi la settimana» entro 4 px dal braccio rosso) · **M** stesso
  menu fuori/dentro · **P** 4-5 gruppi, 0 fisarmoniche fuori, 0 parole inglesi, ≥10 sezioni · **C** contratto per intero solo in Agente e
  rimando in Profilo e Club · **F** stessa forma a gradini · **G** due gradini in Opzioni e corpi 12 < +15% (≥13,5) < +30% (≥15,5), il
  vecchio «1» = +30%. Rosso `window.__CPM_NO_G235` (i quattro stili, nessun titolo, menu con icone, 20 fisarmoniche, contratto anche in
  Profilo, barre e anelli, un gradino solo): **deve** essere bocciato su T, H, M, P, C, F e G. «Non giudicato» = rosso.
- **`accessibilita-234` aggiornato**: giudica il testo grande **nei due gradini** (+15% a 360/375 con corpo ≥ 13,5 e diverso dal +30%;
  +30% come prima) e il gruppo «Testo grande» con le due scelte. La prova del rosso di M (manifest) confrontava coi file di `lavoro/197`,
  che dal giro 234 unito hanno già i manifest corretti: passava sempre e il guardiano era rosso per costruzione. Ora confronta con
  `ea02adf0^` (la base prima del giro 234).

## Esiti dei controlli (uno alla volta, CPM_CI_PAR=0)

Tre build del ramo: **A** `5fe24f5e` (prima stesura, titolo nel contenuto), **B** `e8fb1646` (titolo nella testata), **C** `60fd4122`
(finale: col testo grande l'ora del salvataggio va a capo invece di troncarsi). Da B a C cambia solo l'andare a capo di quella riga
col testo grande; dichiaro su quale build ha girato ogni controllo.

| Controllo | Build | Esito |
|---|---|---|
| `coerenza-235` (nuovo) | C (anche A e B) | ✓ verde: 5 tasti in regola a 375 e 1366, titolo nello stesso posto nelle 8 schede, testata 98 → 101 px e «Vivi la settimana» +3 px, menu uguale, 5 gruppi · 0 fisarmoniche · 19 sezioni, contratto solo in Agente, gradini in Home e Club, corpi 12 / 14 / 16 (vecchio «1» = 16). Rosso `__CPM_NO_G235` ✓ bocciato su T, H, M, P, C, F, G |
| `accessibilita-234` (aggiornato) | C | ✓ verde (+15%: corpo 14, colonna Pt 19/19 a 360 e 375; +30%: corpo 16, 37/37 e 19/19); rosso `__CPM_NO_G234` bocciato (25 motivi); manifest bocciato sulla base prima del 234. Su B era rosso: «salvato 18:36» tagliato di 7 px a 360 col +30% → corretto in C |
| `design-system` | C | ✓ sistema grafico OK (nessun raggio a mano, nessun corpo sotto 12) |
| `tema-unico` | C | ✓ verde, rosso atteso col tema di prova |
| `griglia-mobile` | B | ✓ 14 schermate × 5 larghezze, 70/70 senza scorrimento, testi fuori, corpi sotto pavimento né contrasti sotto soglia |
| `home-199` | B | ✓ verde |
| `agente-198` | B | ✓ verde, rossi bocciati |
| `figurina-199` | B | ✓ verde, rosso bocciato |
| `tocco-213` | B | ✓ verde, rosso bocciato. **Su A era rosso**: a 375×667 «Vivi la settimana» finiva sotto la barra (misura sopra) |
| `barra-221` | A | ✓ verde, rossi bocciati (la parte toccata, «Scegli» in src/15, non è cambiata dopo A) |
| `sigle-203` | C | ✓ verde a 360/375/390 (18 ok) e 1366 (8 ok); rosso con 5 ko |
| `test:logic` | C | ✓ 51/51 |
| `save-compat` | C | ✓ 12/12 |

Non eseguiti (fuori dalla consegna e dalla mia parte): highlight-95, ingresso-206, career-critical, la completa. La riga di roadmap la
scrive il rilascio (questo è un giro su ramo di sviluppo).

## Dubbi per il PO

Non ho deciso queste cose: ho scelto la strada più vicina a quello che è già deciso e la scrivo qui perché il PO la confermi o la cambi.

1. **La regola del tasto principale ha due colori.** Partendo da PO-411 il tasto è pieno nel colore del club. Ma il «Gioca / Vivi la
   settimana» sta dentro il riquadro della «Prossima», che è già nel colore del club: lì un tasto dello stesso colore sparirebbe, quindi è
   crema (il negativo). Fuori dalla carriera (senza club) è crema. In una Home ci sono quindi un tasto crema (dentro la Prossima) e uno
   nel colore del club (il momento). Alternativa: tutti crema (era lo stile V2 di PO-302), ma andrebbe contro PO-411. Va bene così?
2. **Club scuri.** Col colore sociale nero (#0f0f0f, il salvataggio di prova) il tasto era nero su fondo nero (vedi
   `prima/375-dashboard.png`). Ho tenuto il fondo esattamente nel colore del club (il guardiano `momento-194` lo pretende) e ho aggiunto
   un filo chiaro attorno. Alternativa: usare il secondo colore del club quando il primo non si legge (per FC Frankfurt il rosso #dc2626).
3. **Un solo tasto forte per vista** (G195-11) non l'ho imposto: in Home, quando c'è il riquadro delle parole che tornano indietro
   (il «ledger» del 7.270, tasto «Una stretta di mano →»), restano due tasti pieni (quello e il momento). Ho uniformato lo stile, non il numero.
4. **Le scelte con contorno oro** («Vediamo», «Ci sto», «Il gruppo prima di tutto») le ho lasciate così: sono scelte alla pari, non il
   tasto principale. Il giro 195 le contava come quarto stile.
5. **Titolo nella testata, non nel contenuto.** Ho messo il titolo della scheda nella testata compatta (misura sopra: nel contenuto
   spingeva «Vivi la settimana» sotto la barra a 375×667). Stagione, Agente e Ufficio hanno ancora anche il loro titolo grande nel
   contenuto, quindi lì il nome si legge due volte. Toglierlo? (In Stagione accanto al titolo ci sono la distanza dalla vetta e la forma.)
6. **I nomi.** Gruppi: Numeri · Premi e traguardi · Storia · Persone · Contratto e attributi. Sezioni rinominate: Questa stagione,
   Andamento negli anni, Massimi di carriera, Piazzamenti e titoli, Bacheca dei trofei, Premi individuali, Corsa ai premi della stagione,
   Migliore del mese, Traguardi, Imprese, La tua sfida, Stagione per stagione, Partita del cuore, I tuoi allenatori, Stato Under 18. Sono
   miei: da confermare.
7. **Dove stanno alcune sezioni.** «Club dei sogni» l'ho messo in «Contratto e attributi» (guarda al futuro della carriera), «Stile di
   gioco» lì con gli attributi, «La stampa» in «Persone». Solo «Numeri» è aperto la prima volta; poi ogni gruppo ricorda se l'hai aperto.
8. **Le parole dei gradini.** Per la fiducia ho usato le soglie e le parole che il Club già usava nel giudizio «Allenatore»; per la
   popolarità (Poco conosciuto · Conosciuto · Apprezzato · Popolare · Idolo, per quinti) le ho scelte io. Ho tenuto il numero piccolo
   accanto (es. 61/100). Considero PO-391 fatta per la forma; PO-421 (giudizi che non si contraddicono) resta aperta.
9. **Il menu fuori carriera ha perso le icone** (🏠 🎬 📂 ⚙️) per avere lo stesso disegno della barra di carriera, che le aveva già
   tolte nel 7.954. Alternativa: rimettere le icone in tutte e due.
10. **«Scegli» in partita** segue la regola nel codice, ma il guardiano non lo misura (servirebbe una partita in corso nella stessa
    corsa): non ho una foto né un numero.
11. **`accessibilita-234`: prova del rosso del manifest.** Ora confronta con il commit prima del giro 234 (`ea02adf0^`). In un clone
    poco profondo (CI) quel commit potrebbe mancare: in quel caso la prova dichiara «non giudicato» e il guardiano è rosso, come prima
    succedeva con `lavoro/197` assente.
12. **Testo grande, valori salvati.** Nel browser restano `15`, `30` o `0`; chi aveva acceso il giro 234 (valore `1`) ritrova il +30%.
