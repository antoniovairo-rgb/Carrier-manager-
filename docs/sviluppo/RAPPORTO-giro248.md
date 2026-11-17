# Rapporto giro 248 — nomi dei club associabili alle squadre reali (PO-511)

Versione di riferimento: 7.999.197 (GAME_VERSION non toccata) · ramo `sviluppo/giro248-nomi-club` (da `lavoro/197`).
Proposta di partenza: `docs/sviluppo/PROPOSTA-giro247.md` (copiata dal ramo `sviluppo/giro247-nomi-club`).

## Cosa è cambiato

Scelta del PO del 17/11 (questionari), applicata così com'è:

| id | nome del giro 6 (sigla) | nome nuovo (sigla) | stadio |
|---|---|---|---|
| inter | FC Valmora (VAL) | **FC Milano Brera (MBR)** | Stadio Milano Ovest (condiviso con milan) |
| milan | AC Dorvelli (ACR) | **FC Milano Sempione (MSE)** | Stadio Milano Ovest |
| napoli | FC Vellamare (VEL) | **FC Napoli Fuorigrotta (NFG)** | Stadio di Fuorigrotta |
| lazio | FC Alcavera (ALC) | **FC Flaminio (FLM)** | Stadio del Foro (condiviso con roma, che usava «Stadio Alcavera») |
| psg | FC Lumeranza (LUM) | **FC Parigi Ovest (PGO)** | Parc Royal (resta) |
| tor | FC Torvelle (TRV) | **FC Torino Santa Rita (TSR)** | Stadio Santa Rita |
| fio | FC Brenvar (BRN) | **FC Firenze (FRZ)** | Stadio Toscano (resta) |
| sam | FC Marnesi (MAR) | **FC Genova Ponente (GPO)** | Stadio Ligure (resta) |
| sas | FC Caldoran (CAL) | **FC Sassolese (SSL)** | Emilia Stadium (resta) |
| bet | FC Ventrana (VER) | **FC Heliópolis (HEL)** | Estadio de Heliópolis |
| cel | FC Oriolan (ORI) | **FC Vigués (VGS)** | Estadio de la Ría |
| get | FC Dalvora (DAL) | **FC Getafense (GTF)** | nessuna voce, dal pool |
| esp | FC Pelvanni (PEL) | **FC Sarrià (SRR)** | nessuna voce, dal pool |
| bay | FC Valdenau (VLD) | **FC Isar (ISR)** | München Arena (resta) |
| kol | FC Ravelmund (RVM) | **FC Domstadt (DMS)** | nessuna voce, dal pool |
| spo | FC Rendalto (RDL) | **FC Lisboa Norte (LNO)** | Estádio Lisboa Norte |

Punti del codice (`src/`, poi `node tools/build-src.mjs` e `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE**):

- `src/02-club-leghe-albo.jsx` — le 16 righe `mkT(...)` (nome e sigla) e i record/albo che citavano i nomi del giro 6
  (`LEAGUE_RECORDS`: FC Sarrià, FC Vigués, FC Napoli Fuorigrotta, FC Isar, FC Parigi Ovest; albo europeo 2020: FC Isar).
  Interruttore `_g248(nuovo, vecchio)`: con `window.__CPM_NO_G248` tornano nomi, sigle e stadi del giro 6.
- `src/05-cronaca-stadi-formazioni.jsx` — `CLUB_STADIUMS` (inter, milan, napoli, roma, lazio, tor, bet, cel, spo) e
  `STADIUM_POOLS`: «Stadio Valmora», «Stadio Alcavera», «Stadio Vellamare», «Estádio Rendalto», «Estadio Oriolan» sostituiti nello
  stesso posto dai nomi nuovi (stesso indice: l'assegnazione dal pool per i club senza voce non cambia posizione).
- `src/09-audio-scout-anagrafiche.jsx`
  - `_CR_BRANDS`: entrano i 16 nomi del giro 6, i 7 stadi del giro 6 e i blocchi espliciti **«AC Milan»** e **«SSC Napoli»**
    (l'audit confronta per sottostringa: il blocco è sul nome intero, non su «Milan», sottostringa di «FC Milano Sempione» e di
    «Stadio Milano Ovest»).
  - `CLUB_RENAME_6`: porta **sia il nome reale di prima del giro 6 sia il nome del giro 6** al nome nuovo in un passo solo; nessun
    nome nuovo è chiave (idempotente). Rosso `__CPM_NO_G248` = la mappa del giro 6 com'era.
  - `_migraNomi248`: passata completa sul giocatore. **Misurato** sul salvataggio `fixtures/save-c177-s5w20.json`: i nomi non
    vivono solo nei quattro campi che il giro 6 rimappava, ma anche in `lastAwards…club` (Pallone/Scarpa d'oro), e le sigle in
    `standings[].a` e `matchHistory[].oppAbbr`. La passata (1) sostituisce dentro ogni stringa i nomi reali e del giro 6 (club e
    stadi, anche con suffisso U18/U19/Primavera o dentro un testo), (2) mette la sigla nuova accanto a ogni nome nuovo (campi
    `a`/`abbr`/`oppAbbr`/`clubAbbr` vicini a `n`/`name`/`club`/`opponent`/`opponentName`/`team`). Restituisce lo stesso oggetto se
    non cambia nulla.
- `src/17-menu-creazione-pannelli.jsx` — la migrazione di `CareerApp` chiama `_migraNomi248` subito dopo il blocco del giro 6.
  Nessun bump di `SAVE_VERSION`.
- `src/12-three-match-view.jsx` — `_TOK_CLASS` dei cori: classi grammaticali per i nuovi token che non sono nomi propri
  (SASSOLESE/GETAFENSE «E», VIGUÉS «M», ISAR/DOMSTADT «E»); gli altri prendono la classe di default (nome proprio).
- Commenti ed esempi coi nomi del giro 6: `src/09` (articoli dei club), `src/11` (scala dei nomi corti), `src/15` (cartellone LED),
  `src/18` (offerta rifiutata; la citazione del collaudo 177-3 resta com'era scritta dal PO, con la nota «dal giro 248 FC Lisboa
  Norte»).
- Derby: invariati (decisione della madre).
- `tools/audit-copyright.mjs`: `CPM_AUDIT_FLAG=<interruttore>` accende un interruttore del gioco prima del caricamento (serve alla
  prova del rosso).
- Test che usano i nomi come dati di un salvataggio (la migrazione ora li rinominerebbe sotto i loro occhi): aggiornati ai nomi e
  alle sigle nuove `calendario-218`, `carriera3-94`, `convocazione-190`, `indice-163`, `interviste-211`, `interviste-211-foto`,
  `momento-165`, `momento-165b`, `piccoli-85`, `salta-163`, `stagione-pro-164`; `nomi-190` e `nomi-211` (dati della funzione pura
  della scala dei nomi) passano a «FC Milano Brera»; il caso «AC …» di `nomi-190` diventa il dato inventato «AC Prova».

## Guardiano nuovo: `npm run nomi-248` (verde + rosso `__CPM_NO_G248`)

`tests/visual/nomi-248.mjs`, telefono 360 px, gioco vero (`?cpmtest=1`). In catena: `completa`, `carriera` e nella MAPPA mirata
per `src/02`, `src/05|09`, `src/11|17` (una sola volta per catena, `node --check ci-runner.mjs` ok).

| Parte | Verde (misurato) | Rosso `__CPM_NO_G248` (misurato) |
|---|---|---|
| A · dati | 16/16 club con nome e sigla del PO · 14/14 stadi · 0 nomi del giro 6 in club, U18, pool, stadi, record, albo | 16 club diversi · 9 stadi del giro 6 · 44 nomi del giro 6 |
| B · audit (`_auditCopyright`) | 0 hit | 31 hit |
| C · migrazione del salvataggio `save-c177-s5w20` | 11 nomi del giro 6 prima → **0** dopo, 0 nomi reali · seconda applicazione **senza modifiche** · sigle bay=ISR, kol=DMS, storico FC Domstadt/DMS · «AC Dorvelli Primavera/ACR» → «FC Milano Sempione Primavera/MSE», «FC Nerazzurri U18», «FC Valmora U19» → «FC Milano Brera U18/U19» | restano 11 nomi del giro 6, sigle VLD/RVM |
| D · schermo (home, classifica, calendario, anteprima partita, partita in corso, barra/tabellone) | nomi/sigle nuove presenti, 0 nomi/sigle del giro 6 in tutti e sei | nomi/sigle del giro 6 in tutti e sei |
| E · classifica di Lega A 360 px | 16 nomi/sigle nuove, 0 del giro 6 | 16 sigle del giro 6 |

Esito: **verde 20 ok · 0 ko** (uscita 0) · **rosso 20 ok · 0 ko** (vede il difetto, uscita 0).
Una cosa misurata strada facendo: a 360 px classifica e barra mostrano **solo le sigle**; la prima stesura contava solo i nomi e il
braccio rosso passava «a vuoto» (0 nomi del giro 6 a schermo perché c'erano solo VAL, ACR…). Ora le sigle contano come i nomi
(parole intere; «DAL» escluso, misurato: è la preposizione maiuscola di «DAL CAMPO D'ALLENAMENTO» in home).

## Foto (360 px) — `docs/sviluppo/giro248/`

- Classifica di Lega A: `classifica-lega-a-360-prima.png` (rosso = nomi del giro 6: VAL, ACR, VEL, ALC, BRN, TRV, CAL…) e
  `classifica-lega-a-360-dopo.png` (MBR, MSE, NFG, FLM, FRZ, TSR, SSL…).
- Deutsche Liga del salvataggio: `classifica-dl-360-prima.png` / `classifica-dl-360.png`; partita contro `bay`:
  `partita-anteprima-360-prima.png` / `partita-anteprima-360.png`, `partita-tabellone-360-prima.png` / `partita-tabellone-360.png`.
  (Le foto «prima» sono il braccio rosso `__CPM_NO_G248`, cioè i dati del giro 6 sul codice nuovo.)

## Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

Dopo ogni modifica a `src/`: `node tools/build-src.mjs` + `node tools/check-src.mjs` → **IDENTICO BYTE PER BYTE** (7.701.310 byte).

| Controllo | Esito | Note |
|---|---|---|
| `nomi-248` verde / rosso | ✅ 20/0 · ✅ 20/0 | vedi tabella sopra |
| `node tools/audit-copyright.mjs` (radice) | ✅ **0 hit**, uscita 0 | prova del rosso `CPM_AUDIT_FLAG=__CPM_NO_G248`: **31 hit**, uscita 2 |
| `nomi-190` | ✅ 23 ok · 0 ko | 47 s |
| `cronaca-nomi-190` | ✅ VERDE | due partite al 92', 121 righe, 0 segnaposto |
| `nomi-211` | ✅ 22 ok · 0 ko | |
| `sigle-203` | ❌ verde 360/375/390: 17 ok · 1 ko — ✅ 1366: 8/0 — ✅ rosso: atteso ROSSO | il ko è «FC Lyon» 0,7 px fuori a 360: **identico sulla base `lavoro/197`** (misurato in una copia di lavoro della base): preesistente, non toccato |
| `test:logic` | ✅ | |
| `save-compat` | ✅ 12 pass · 0 fail | |
| MAPPA (dati, migrazione, cronaca): `migrazione-194` 70 s · `classifica-194` 260 s · `classifica-102` · `lessico-218` · `brusio-238` | ✅ | |
| test aggiornati: `calendario-218` · `convocazione-190` · `indice-163` · `momento-165` · `momento-165b` · `piccoli-85` · `interviste-211` · `carriera3-94` · `salta-163` | ✅ | |
| `cori-291` (per `_TOK_CLASS`) | ✅ | |
| `esiti-96` 726 s · `esiti-241` 435 s · `cross-218` 215 s | ✅ | |
| `voto-79` | ❌ «cieco» (uscita 2), due volte | **identico sulla base `lavoro/197`** («B rosso senza render dopo l'interruttore»): preesistente |
| `nomi-219` · `assist-298` | ⏱ non completati | interrotti dal mio tetto di 20 minuti (nomi-219 dichiara ~50 minuti nel suo commento): **non giudicati**, da eseguire nella verifica di rilascio |

Nessuna foto di altri giri rigenerata in `docs/` (`git status` pulito dopo i controlli). `stagione-pro-164` non ha uno script npm:
aggiornato nei dati, non eseguito.

## Dubbi per il PO

1. **A 360 px la classifica non mostra i nomi**, solo le sigle (vale per tutti i club, da prima di questo giro): «FC Napoli
   Fuorigrotta» o «FC Torino Santa Rita» in classifica si leggono NFG e TSR. Il nome intero compare in calendario, anteprima della
   partita e (nome corto o sigla, secondo la scala del giro 190) nella barra. Nessun nome tagliato con ellissi misurato nella
   classifica di Lega A a 360 px. Se il PO vuole i nomi nuovi leggibili anche in classifica sul telefono, è un lavoro di layout a parte.
2. **Somiglianze volute** (stessa città, stile già usato): «FC Genova Ponente» accanto a «FC Genova», «FC Lisboa Norte» accanto a
   «FC Lisboa» e «FC Lisboa Ovest». Nessun doppione di nome o di sigla (controllato dall'audit SIGLA e dal guardiano).
3. **Copyright**: i nomi nuovi sono toponimi (quartieri, città, fiumi); l'audit è a 0 hit, ma non sono un legale e non ho
   consultato registri dei marchi — vedi «Rischi copyright» nella proposta del giro 247. In particolare «Stadio di Fuorigrotta» e
   «FC Flaminio»/«FC Sarrià» sono luoghi che i giornali usano per indicare gli stadi veri.
4. **La migrazione ora tocca anche i testi liberi** (diario, notizie salvate, premi): un testo salvato che citava «FC Valmora» diventa
   «FC Milano Brera». È ciò che serve per avere 0 nomi del giro 6, ma riscrive anche frasi «storiche» del salvataggio.
5. **I club Primavera / U18** prendono il nome dal club di Lega A (es. «FC Napoli Fuorigrotta Primavera», 31 caratteri): a 360 px
   va in U19 / nome corto / sigla secondo la scala esistente (`nomi-190`, `nomi-211` verdi sui nomi nuovi; `sigle-203` vedi punto 6).
6. **`sigle-203` è rosso a 360 px anche sulla base `lavoro/197`** (misurato sulla base, prima delle mie modifiche): «FC Lyon» esce
   di 0,7 px dalla casella della barra. Non è legato ai nomi nuovi (FC Lyon non è stato toccato) e non l'ho corretto (fuori ambito).
7. **Due rossi preesistenti** sulla base `lavoro/197`, fuori ambito e non corretti: `sigle-203` (punto 6) e `voto-79` «cieco».
8. **Controlli della MAPPA mirata non eseguiti**: i file toccati richiamano 204 guardiani, quasi tutti per ritocchi di soli commenti
   in `src/11`, `src/12`, `src/15`, `src/18` (e `_TOK_CLASS` in `src/12`). Ho eseguito quelli legati a dati, nomi, migrazione,
   cori e i test che ho aggiornato (elenco sopra); gli altri — fra cui `highlight-95`, `validate-situations`, `partita-vera`,
   oltre 20 minuti — li lascio alla verifica di rilascio.
