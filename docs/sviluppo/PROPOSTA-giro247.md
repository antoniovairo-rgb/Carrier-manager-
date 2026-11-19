# Proposta giro 247 — nomi dei club per città o zona (PO-511)

Versione di riferimento: 7.999.197 · ramo `sviluppo/giro247-nomi-club` (da `lavoro/197`).
**Solo proposta: `src/` non è stato toccato.** La scelta è del PO; il giro 248 applica i nomi scelti.

Richiesta del PO (17/11): «Valmora che squadra è?» … «Un minimo devono essere associabili alle squadre reali!».
Decisione PO: «Città o zona, poi li approvo io», «Tutto nella 197».

## Criterio usato

- Stesso stile degli altri club del gioco: prefisso + città, zona, quartiere o aggettivo di città
  (come `FC Bergamo`, `FC Madrid Este`, `FC Lisboa Ovest`, `FC Coruñés`, `FC Modenese`).
- **Proposta A** = più riconoscibile (di solito contiene la città). **Proposta B** = solo la zona o il
  quartiere (meno riconoscibile, più distante dal club reale).
- Squadre della stessa città distinte per quartiere o zona: Milano (inter/milan), Roma (lazio; la roma
  è già `FC Capitale`), Torino (tor; la juve è già `Torino Athletic`), Genova (sam; il genoa è già
  `FC Genova`), Siviglia (bet; il siviglia è già `FC Hispalense`), Madrid (get; ci sono già `CF Madrid`
  e `FC Madrid Este`), Barcellona (esp; il barça è già `FC Catalunya`), Lisbona (spo; ci sono già
  `FC Lisboa` e `FC Lisboa Ovest`).
- Escluso ciò che è nome ufficiale, soprannome noto o già nella lista del controllo (`_CR_BRANDS`):
  per esempio niente `FC Napoli` da solo, niente `Laziale` (è il nome dei tifosi), niente `AC Milano`
  (contiene «AC Milan»), niente `München`/`Köln`/`Paris` dopo «FC» (bloccati dal giro 6), niente
  `Bavaria` (è la traduzione di «Bayern»), niente `Doria`, `Florentia`, `Ambrosiana`, `Milanello`,
  `Superga` (quest'ultimo per rispetto della tragedia del 1949).
- Sigla: deve essere una sottosequenza delle lettere del nome mostrato (regola SIGLA dell'audit,
  src/09 «LE SIGLE»); ho evitato le sigle che le leghe vere usano per quei club (INT, MIL, NAP, LAZ,
  TOR, FIO, SAM, SAS, BET…).

## Tabella

| id | Club reale evocato | Nome di oggi (sigla) | Proposta A (sigla) | Proposta B (sigla) | Stadio di oggi → proposta |
|---|---|---|---|---|---|
| `inter` | Inter (Milano) | FC Valmora (VAL) | **FC Milano Brera** (MBR) | **FC Porta Nuova** (PNU) | Stadio Valmora → **Stadio Milano Ovest** (condiviso con `milan`) |
| `milan` | Milan (Milano) | AC Dorvelli (ACR) | **FC Milano Sempione** (MSE) ¹ | **AC Sempione** (ACS) | Stadio Valmora → **Stadio Milano Ovest** (condiviso con `inter`) |
| `napoli` | Napoli | FC Vellamare (VEL) | **FC Napoli Fuorigrotta** (NFG) | **FC Fuorigrotta** (FGR) | Stadio Vellamare → **Stadio di Fuorigrotta** |
| `lazio` | Lazio (Roma) | FC Alcavera (ALC) | **FC Flaminio** (FLM) | **FC Ponte Milvio** (PMV) | Stadio Alcavera → **Stadio del Foro** (condiviso con `roma`) |
| `psg` | Paris Saint-Germain | FC Lumeranza (LUM) | **FC Parigi Ovest** (PGO) | **FC Île-de-France** (IDF) | Parc Royal (resta: non porta il nome inventato) |
| `tor` | Torino | FC Torvelle (TRV) | **FC Torino Santa Rita** (TSR) | **FC Santa Rita** (SRT) | Stadio Torvelle → **Stadio Santa Rita** |
| `fio` | Fiorentina (Firenze) | FC Brenvar (BRN) | **FC Firenze** (FRZ) | **FC Campo di Marte** (CDM) | Stadio Toscano (resta) |
| `sam` | Sampdoria (Genova) | FC Marnesi (MAR) | **FC Sampierdarena** (SPD) ² | **FC Genova Ponente** (GPO) | Stadio Ligure (resta, condiviso con `gen`) |
| `sas` | Sassuolo | FC Caldoran (CAL) | **FC Sassolese** (SSL) | **FC Secchia** (SEC) | Emilia Stadium (resta) |
| `bet` | Real Betis (Siviglia) | FC Ventrana (VER) | **FC Heliópolis** (HEL) | **FC Triana** (TRI) | Estadio Ventrana → **Estadio de Heliópolis** |
| `cel` | Celta (Vigo) | FC Oriolan (ORI) | **FC Vigués** (VGS) | **FC Ría de Vigo** (RDV) | Estadio Oriolan → **Estadio de la Ría** |
| `get` | Getafe (area di Madrid) | FC Dalvora (DAL) | **FC Getafense** (GTF) | **FC Madrid Sur** (MSR) | nessuna voce in `CLUB_STADIUMS` (stadio dal pool) |
| `esp` | Espanyol (Barcellona) | FC Pelvanni (PEL) | **FC Sarrià** (SRR) | **FC Cornellà** (CNL) | nessuna voce in `CLUB_STADIUMS` |
| `bay` | Bayern (Monaco di Baviera) | FC Valdenau (VLD) | **FC Isar** (ISR) | **FC Schwabing** (SWB) | München Arena (resta: è già un nome di città) |
| `kol` | Colonia | FC Ravelmund (RVM) | **FC Domstadt** (DMS) | **FC Müngersdorf** (MGD) | nessuna voce in `CLUB_STADIUMS` |
| `spo` | Sporting (Lisbona) | FC Rendalto (RDL) | **FC Alvalade** (ALV) ² | **FC Lisboa Norte** (LNO) | Estádio Rendalto → **Estádio Lisboa Norte** |

¹ Per `milan` la A perde il prefisso «AC» di proposito: «AC Milano…» contiene la stringa «AC Milan», cioè il
nome del club reale. Se il PO vuole tenere «AC», la B (`AC Sempione`) lo tiene.
² Più vicine al club reale delle altre: vedi «Rischi copyright».

### Perché quella zona (fatti di dominio pubblico, non verificati su una fonte in questo giro)

- `napoli`: lo stadio del Napoli è a Fuorigrotta. `fio`: lo stadio della Fiorentina è a Campo di Marte.
- `lazio`: Flaminio e Ponte Milvio sono la zona nord di Roma vicina allo Stadio Olimpico (Foro Italico).
- `tor`: Stadio Olimpico Grande Torino e Filadelfia sono nel quartiere Santa Rita — **non posso
  confermarlo con una fonte qui; da verificare** prima di sceglierlo.
- `sam`: la Sampdoria nasce dalla fusione di Sampierdarenese e Andrea Doria; Sampierdarena è il quartiere.
- `sas`: il Secchia è il fiume di Sassuolo; «sassolese» è l'aggettivo della città.
- `bet`: lo stadio del Betis è nel quartiere Heliópolis; Triana è il quartiere storico oltre il fiume.
- `cel`: «vigués» è l'aggettivo di Vigo; la ría è l'insenatura della città.
- `esp`: Sarrià è il quartiere del vecchio stadio dell'Espanyol; Cornellà è il comune dello stadio attuale.
- `bay`: l'Isar è il fiume di Monaco; Schwabing è un quartiere. `kol`: «Domstadt» (città del duomo) è un
  epiteto di Colonia, Müngersdorf il quartiere dello stadio.
- `psg`: il Parc des Princes è nella parte ovest di Parigi; il club francese del gioco usa nomi italiani
  come altri (`FC Nizza`, `FC Tolosa`, `FC Strasburgo`), da cui «Parigi».
- `spo`: Alvalade è il quartiere dello stadio dello Sporting.
- `get`: «getafense» è l'aggettivo di Getafe; «Madrid Sur» fa coppia con `FC Madrid Este` già nel gioco.

### Controlli fatti sulla proposta (script, nessun browser)

Su tutti i 32 nomi e i nuovi stadi, contro i dati di `src/02`, `src/05`, `src/09` di `lavoro/197`:

- **Lista del controllo (`_CR_BRANDS`, confronto per sottostringa come fa l'audit): 0 corrispondenze.**
- **Sigle: tutte sottosequenze del nome**, nessuna uguale a quella di un altro club del gioco, nessuna
  doppia fra le proposte.
- **Nomi: nessun doppione** con gli altri club. Tre somiglianze volute (stessa città, stile già usato):
  `FC Genova Ponente` ↔ `FC Genova`, `FC Madrid Sur` ↔ `CF Madrid`/`FC Madrid Este`,
  `FC Lisboa Norte` ↔ `FC Lisboa`/`FC Lisboa Ovest`. Se il PO le trova confondibili, la proposta
  alternativa della stessa riga non ne ha.
- Stadi nuovi: nessuno coincide con uno già esistente, nessuno tocca la lista del controllo.
- Non controllato: l'effetto delle lunghezze sullo schermo (es. `FC Napoli Fuorigrotta`, 21 caratteri,
  `FC Torino Santa Rita`, 20). La scala dei nomi corti del giro 190 dovrebbe accorciarli («Napoli
  Fuorigrotta» → sigla), ma lo dirà `nomi-190`/`sigle-203` nel giro 248.

## Rischi copyright

**Non sono un legale e non ho consultato registri dei marchi**: quanto segue è una valutazione di buon
senso, non un parere. Prima della pubblicazione sugli store la decisione resta del PO (eventualmente con
un consulto).

- **Toponimi puri** (nomi di città, quartieri, fiumi, regioni, aggettivi di città): Brera, Porta Nuova,
  Sempione, Fuorigrotta, Flaminio, Ponte Milvio, Santa Rita, Campo di Marte, Ponente, Secchia,
  Sassolese, Heliópolis, Triana, Vigués, Ría de Vigo, Getafense, Madrid Sur, Sarrià, Cornellà, Isar,
  Schwabing, Domstadt, Müngersdorf, Île-de-France, Lisboa Norte, Firenze, Parigi. Un nome di luogo in
  sé non è di proprietà di un club; il rischio, se esiste, viene dall'**insieme** di segni (nome + colori
  sociali, già presenti nel gioco + sigla + stadio) che rende il club reale riconoscibile — che è proprio
  quello che il PO chiede. Il gioco già oggi usa così `FC Bergamo`, `FC Genova`, `FC Marseille`,
  `FC Leipzig` (il giro 6 li aveva lasciati come «decisione PO»).
- **Nomi con la città del club** (`FC Milano …`, `FC Napoli Fuorigrotta`, `FC Torino Santa Rita`,
  `FC Firenze`): «Milano», «Napoli», «Torino» coincidono con il nome comune o ufficiale del club reale
  (SSC **Napoli**, **Torino** FC; «Milan» è sottostringa di «Milano»). Sono toponimi, ma sono la scelta
  più vicina al club vero: le proposte B esistono per questo.
- **Possibili segni distintivi** (luoghi che sono anche il nome di uno stadio o fortemente legati a un
  club):
  - `FC Alvalade`: Alvalade è un quartiere di Lisbona, ma lo stadio dello Sporting si chiama
    «Estádio José Alvalade». È la proposta più esposta della tabella.
  - `FC Sampierdarena`: è un quartiere, ma «Sampierdarenese» è il nome di un club storico confluito
    nella Sampdoria.
  - `FC Fuorigrotta` / `Stadio di Fuorigrotta`, `FC Flaminio` (esiste uno «Stadio Flaminio» reale a
    Roma), `FC Müngersdorf`, `FC Sarrià` (nome del vecchio stadio dell'Espanyol), `FC Heliópolis`:
    luoghi che i giornali usano per indicare lo stadio.
  - Non ho verificato se qualcuno di questi termini sia registrato come marchio: **non posso
    confermarlo né escluderlo**.
- **Sigle**: nessuna coincide con le abbreviazioni ufficiali che conosco, ma non ho una lista ufficiale
  da confrontare.

## Per il giro 248: punti del codice da toccare

(numeri di riga di `lavoro/197`, da riverificare con `grep -n`)

1. **`src/02-club-leghe-albo.jsx`** — le 16 righe `mkT(...)` (27, 28, 29, 31, 33, 34, 37, 39, 70, 73, 78,
   81, 83, 96, 102, 123): nome e sigla.
2. **Record e albo in `src/02`**: `LEAGUE_RECORDS` 329 (FC Pelvanni), 330 (FC Oriolan), 338 (FC Vellamare),
   361 (FC Valdenau), 369 (FC Lumeranza); albo europeo 451 (FC Valdenau).
3. **Stadi, `src/05-cronaca-stadi-formazioni.jsx`**: `CLUB_STADIUMS` 495-497 (inter, milan, napoli, roma,
   lazio, tor), 507 (bet), 508 (cel), 514 (spo); `STADIUM_POOLS` 484 («Stadio Valmora», «Stadio
   Alcavera», «Stadio Vellamare»), 485 («Estádio Rendalto»), 486 («Estadio Oriolan»). `bay` («München
   Arena»), `fio`, `sam`, `sas`, `psg` restano. Nota: «Stadio Alcavera» oggi è anche lo stadio della
   `roma`: la nuova voce va messa a entrambi.
4. **Derby, `src/08-panchina-derby-meteo-cori.jsx` ~271**: i nomi dei derby NON contengono i nomi dei club
   (nessuna modifica obbligatoria). Da valutare solo se il PO vuole derby coerenti coi quartieri
   (es. «Derby del Naviglio Breve» per Milano resta valido).
5. **`CLUB_RENAME_6`, `src/09-audio-scout-anagrafiche.jsx:1131`**: oggi mappa nome reale → nome del giro 6.
   Va aggiunta la catena verso i nomi nuovi in **due versi**: nome reale → nome nuovo **e** nome del
   giro 6 → nome nuovo (i salvataggi fatti dal 10/10 contengono già `FC Valmora` ecc.). `_renameClub6`
   (1133) gestisce già il suffisso («… U18», «… Primavera»): basta allargare la mappa, restando idempotente
   (un nome già nuovo non cambia). Attenzione all'ordine: nessun nome nuovo deve essere chiave della mappa.
6. **Migration dei salvataggi, `src/17-menu-creazione-pannelli.jsx:2668`** (blocco «giro 6»): campi
   `player.club.n`, `standings[].n`, `calendar[].opponentName`, `matchHistory[].opponent`. Con la mappa
   allargata il blocco funziona com'è; verificare che la sigla salvata (`player.club.a`) segua il nome
   (il giro 6 non la rimappava: oggi la sigla viene dal nome, ma un salvataggio con `a:"VAL"` sotto
   `FC Milano Brera` farebbe fallire la regola SIGLA se letto dall'audit — da misurare).
7. **Lista del controllo, `_CR_BRANDS` in `src/09:1115`**: aggiungere i nomi inventati del giro 6 che
   escono (perché non tornino per sbaglio) **solo se** il PO lo vuole; i nomi nuovi non vanno in lista.
   Valutare se aggiungere «AC Milan» e «SSC Napoli» come blocco esplicito (oggi non ci sono).
8. **Commenti ed esempi che citano i nomi del giro 6** (non funzionali): `src/09:869`, `src/11:200-212`,
   `src/18:75`, `src/18:6143`; mappa dei cori `_TOK_CLASS` in `src/12` (~2816: i nomi propri nuovi
   prendono la classe di default).
9. **Test con i nomi del giro 6 come dati** (vanno aggiornati solo dove il test legge i dati veri del
   gioco; dove il nome è un dato inventato dentro la sonda può restare): `nomi-190.mjs` (43-47),
   `nomi-211.mjs` (93-100), `convocazione-190.mjs`, `calendario-218.mjs`, `indice-163.mjs`,
   `momento-165.mjs`, `momento-165b.mjs`, `salta-163.mjs`, `stagione-pro-164.mjs`, `carriera3-94.mjs`,
   `interviste-211.mjs`, `interviste-211-foto.mjs`, `piccoli-85.mjs`, fixture
   `fixtures/save-c177-s5w20.json` (utile come prova della migration dal giro 6).

## Per il giro 248: controlli da eseguire

Dopo `node tools/build-src.mjs` e `node tools/check-src.mjs` (IDENTICO BYTE PER BYTE), uno alla volta
(`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), dalla cartella `tests/visual`:

- `npm run nomi-190` · `npm run cronaca-nomi-190` · `npm run sigle-203`
- `node tools/audit-copyright.mjs` (dalla radice) — deve dare **0 hit**; prova del rosso: reinserire a
  mano un nome bloccato e vedere uscita ≠0
- `npm run test:logic` · `npm run save-compat`
- in più la MAPPA mirata di `ci-runner.mjs` per i file `src` toccati (`node ci-runner.mjs mirata`)
- una sonda della migration sul salvataggio del giro 6 (`fixtures/save-c177-s5w20.json`): nomi del giro 6
  → 0, seconda applicazione senza modifiche (come `probe-rename6.mjs` del giro 6).
