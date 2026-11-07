# Giro 110 — lotto 7.999.182, solo PO-309 (nove difetti BASSI del collaudo grafico 180)

Decisione PO 07/11 «Prosegui». Base: `lavoro/182` (= main, 7.999.181). Ramo: `sviluppo/giro110-grafica`.
`GAME_VERSION` **non toccata** (la bumpa la sessione madre). Rapporto di partenza: `docs/collaudo-grafico/180/RAPPORTO.md`.

## Come si misura

- Guardiano nuovo **`npm run collaudo-110`** (`tests/visual/collaudo-110.mjs`, strumenti in `lib/misura-110.mjs`): carriera aperta sul club
  di prova (rosso = FC Merseyside, giallo = FC Wolverhampton, letti da `src/02`), tre formati **360x800 · 412x915 · 1440x900**, braccio
  **verde** (codice nuovo) e braccio **rosso** (tutti gli interruttori `__CPM_NO_G110_<NN>` accesi = comportamento della 181).
  Un difetto è «chiuso» solo se il verde passa **e** il rosso cade in almeno un formato. Braccio e motivo sono le ultime due righe stampate.
- Contrasto **analitico** (colore del testo composto sui fondi degli antenati, mai su gradienti), soglie invariate: 4,5:1 testi, tocco 44 px,
  mouse 36 px. Nessuna soglia abbassata.
- Foto prima/dopo: `docs/sviluppo/foto-giro110/` (script `tests/visual/foto-110.mjs`; prima = interruttori accesi, dopo = codice nuovo).
- Prima di ogni controllo della catena: `free -m` e `df -h` nel registro (sotto). Un controllo alla volta.

## Tabella difetto · misura prima · misura dopo · interruttore · esito

| difetto | misura PRIMA (braccio rosso) | misura DOPO (verde) | interruttore | esito |
|---|---|---|---|---|
| **G180-11** posizioni in classifica | «17°» #ef4444 su #1a1e27 = **4,43:1** (360, 412, 1440) | peggiore «3°» 5,02:1 (tutte le posizioni ≥ 4,5:1): il numero usa `TINTE.blu/giallo/verde/rosso/oro` (colori di stato V2) invece della tinta di zona alzata a caso (`legCol944`) | `__CPM_NO_G110_11` | **chiuso** |
| **G180-17** banner d'esito | `pillola-esito` esce dal campo: 381/346 (360, +17 px), 450/410 (412, +20), 1047/953 (PC, +47) — è la scatola a tutta larghezza scalata a 1,1 da `floatUp`; il disegno interno non era tagliato | 0 campioni su 25 fuori dal campo (scatola al 90 % → 99 % dopo la scala) | `__CPM_NO_G110_17` | **chiuso** |
| **G180-20** sottoschede e fisarmoniche col mouse | 31 px (righe-fisarmonica 31-33, sottoschede 32) a 1440 | minimo 40 px (pavimento 36 col puntatore preciso, `_mouse110()`; il tocco non cambia) | `__CPM_NO_G110_20` | **chiuso** (pavimento 36 px, non 44: regola «36 col mouse») |
| **G180-23** resti ardesia V1 | colonna di cronaca `rgb(15,23,42)` (360, 412); «Salta» della presentazione `rgba(15,23,42,.72)`; 1 testo in inchiostro `#0f172a` nell'ingresso (da `inkSu945`) in 3 formati | colonna `rgb(13,15,20)` = `TINTE.bg`; «Salta» `rgba(13,15,20,.72)`; 0 testi in ardesia | `__CPM_NO_G110_23` | **chiuso** per i tre punti misurati; «Salta» di **notifica e saga** non riprodotti: non portano `rgba(15,23,42,…)` nel codice (solo la presentazione) |
| **G180-24** nomi in Arial nelle formazioni | **44** nodi SVG in Arial (i numeri di maglia) su 46 (3 formati) | 0 in Arial, 46 in Barlow | `__CPM_NO_G110_24` | **chiuso** |
| **G180-25** raggi fuori dalle tavole | riquadri di primo livello con raggio < 14 px: **17 su 26 (65 %)** a 360 e 412, 13 su 24 (54 %) a 1440 | 1 su 26 (4 %) e 1 su 30 (3 %): il riquadro-carta (`Card`) passa da `RAD.md` 12 a `RAD.lg` 16; pillole e tasti piccoli restano a 6-8 | `__CPM_NO_G110_25` | **chiuso** (solo `Card`; le tessere dentro una carta e i raggi scritti a mano non sono toccati) |
| **G180-27** possesso 100%·0% al 1'-2' | al 1' «53% · 47%» (360), «30% · 70%» (412, PC); misurati in sonda anche 86%·14% al 1', 90%·10% al 3' | «– · –» e barra a metà finché i passaggi sono < 40 (soglia già usata dal motore per passare dal tempo ai passaggi) | `__CPM_NO_G110_27` | **chiuso** |
| **G180-31** tasti e numeri delle giocate (PC) | tasti **36 px**; numero «1» bianco su #2563eb / «3» `TINTE.sec`: **4,87:1** | tasti 44 px; numero selezionato su #1d4ed8, gli altri `TINTE.testo`: peggiore **6,7:1** | `__CPM_NO_G110_31` | **chiuso** |
| **G180-33** nome sul giallo nell'ingresso | **non riproducibile** nei tre formati: la misura a pixel del collaudo 180 (`misura180`, `ingresso`, giallo, 360/412/PC) non trova nessuna riga sotto soglia (0 su 11/12/22 righe); il testo del tabellone sul giallo è `#0f172a` su #f59e0b = 8,31:1 (WLV) e il nome intero sta ora in sigla a 360 (giro 109). Il 3,76:1 (#9b6917) era il fondo oscurato dal velo dell'ingresso in una fase che non si ripresenta | peggiore del tabellone 6,7:1 (SUS su blu) in tutti e tre i formati; con G180-23 l'inchiostro scuro è `TINTE.bg` (più scuro, contrasto più alto) | nessuno (non toccato di proposito) | **non riproducibile, non toccato** (il guardiano lo misura e resta verde) |

Esito del guardiano: **G180-11/17/20/23/24/25/27/31 verdi col codice nuovo e rossi con l'interruttore; G180-33 solo verde (non riproducibile).**

## Cosa è cambiato (src/)

- `01`: `_g110(n)` (interruttore) · `inkSu945`/`inkVelo945` con `TINTE.bg` al posto dell'ardesia `#0f172a` (G23).
- `11`: `Card` raggio 16 (G25) · `_mouse110()` + pavimento 36 su righe-fisarmonica e `Tabs` (G20).
- `13`: numeri di maglia delle formazioni in Barlow (G24).
- `15`: striscia del possesso «–» sotto 40 passaggi (G27) · pillola d'esito al 90 % (G17) · giocate PC 44 px e numeri in token (G31) · fondo colonna di cronaca `TINTE.bg` (G23).
- `18`: posizione in classifica nei colori di stato V2 (G11) · «Salta» della presentazione `rgba(13,15,20,.72)` (G23).
- Fuori ambito, dichiarato: il tremolio `goalShake` (±5 px) del «GOOOOL!» resta (è voluto, il contenitore ha `overflow:hidden`); i raggi scritti a mano non sono toccati.

## Registro dei controlli (un controllo alla volta, `free -m` e `df -h` prima di ciascuno)

| controllo | avvio | fine | free -m (totale/usata/libera MB) | df -h (usato/libero) | esito |
|---|---|---|---|---|---|
| collaudo-108 | 09:14:45 | 09:46:56 | 16086/596/13629 | 9.8G/29G | verde |
| lineetta-181 | 09:46:56 | 09:49:31 | 16086/821/13371 | 9.8G/29G | verde |
| spalti-109 | 09:49:31 | 09:55:35 | 16086/888/13306 | 9.8G/29G | verde |
| partita-v2 | 09:55:35 | 10:04:54 | 16086/808/13385 | 9.8G/29G | verde |
| partita2d-297 | 10:04:54 | 10:07:43 | 16086/587/13605 | 9.8G/29G | verde |
| freccia-107 | 10:07:43 | 10:11:07 | 16086/616/13577 | 9.8G/29G | verde |
| home-colori-106 | 10:11:07 | 10:16:27 | 16086/761/13432 | 9.8G/29G | verde |
| pc-tablet-292 | 10:16:27 | 10:28:09 | 16086/853/13339 | 9.8G/29G | verde |
| tema-unico | 10:28:09 | 10:28:55 | 16086/604/13588 | 9.8G/29G | verde |
| design-system | 10:28:55 | 10:28:55 | 16086/855/13337 | 9.8G/29G | verde |
| griglia-mobile | 10:28:55 | 10:32:08 | 16086/778/13415 | 9.8G/29G | verde |
| test:logic | 10:32:08 | 10:32:11 | 16086/718/13475 | 9.8G/29G | verde |
| save-compat | 10:32:11 | 10:32:19 | 16086/762/13432 | 9.8G/29G | verde |
| career-critical | 10:32:40 | 10:42:27 | 16086/884/13309 | 9.8G/29G | verde |
| validate-situations | 10:42:27 | 10:52:48 | 16086/931/13261 | 9.8G/29G | verde |
| collaudo-110 | 10:52:48 | 10:58:02 | 16086/682/13499 | 9.8G/29G | verde |

Ordine: collaudo-108, lineetta-181, spalti-109, partita-v2, partita2d-297, freccia-107, home-colori-106, pc-tablet-292, tema-unico, design-system, griglia-mobile, test:logic, save-compat, poi career-critical, validate-situations (PASS) e **collaudo-110** (finale, dopo l'ultima modifica a src/: verde, 8 difetti rossi con l'interruttore, G180-33 non riproducibile). Un tentativo di catena partito con una variabile di log vuota e' stato fermato per PID (nessun controllo registrato da quel tentativo) e rifatto da capo, un controllo alla volta.

## Decisioni prudenti (sessione figlia)

- G180-20: pavimento **36 px** col mouse (regola dell'incarico), non i 44 proposti dal rapporto 180; col tocco le righe restano a 40 + area estesa (`cpm-t40`).
- G180-25: solo `Card` a 16 px; le tessere annidate (es. «Gol stagione» nel Profilo, 12 px) e i raggi scritti a mano restano com'erano, per non allargare il rischio; il guardiano giudica i riquadri di primo livello.
- G180-27: soglia 40 passaggi presa dal motore (`tabellino()`), nessun numero nuovo.
- G180-33: non toccato (non riproducibile); l'ardesia dell'inchiostro e' comunque sparita con G180-23.
- `GAME_VERSION` non toccata; roadmap/registro release lasciati alla sessione madre.

