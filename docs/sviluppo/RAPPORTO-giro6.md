# Rapporto giro 6 — copyright: rinomina e allarga

Decisione PO 11/10: «rinomina e allarga». Bloccante per la pubblicazione sul sito del 17/10.
Ramo: `sviluppo/haiku-l7-pulizia-l8`. Nessun bump di `GAME_VERSION`, nessuna promozione su `main`.

## 1. Rinomine

Id interni invariati (`inter`, `milan`, `psg`…): non si vedono a schermo.

### Derby reali (14) — `src/08-panchina-derby-meteo-cori.jsx`

| Vecchio | Nuovo | File:riga | Migration |
|---|---|---|---|
| Derby d'Italia | Derby del Monte Alto | 08:116 | no — non salvato |
| Derby di Milano | Derby del Naviglio Breve | 08:117 | no — non salvato |
| Derby della Capitale | Derby dell'Antica Via | 08:118 | no — non salvato |
| Derby di Torino | Derby della Collina Verde | 08:119 | no — non salvato |
| Derby del Sole | Derby della Costa Chiara | 08:120 | no — non salvato |
| Derby della Lanterna | Derby del Faro Vecchio | 08:122 | no — non salvato |
| Derby della Campania | Derby del Golfo Basso | 08:123 | no — non salvato |
| Derby della Lombardia orientale | Derby della Pianura Est | 08:124 | no — non salvato |
| Derby dell'Appennino | Derby del Crinale Lungo | 08:125 | no — non salvato |
| Derby delle Isole | Derby dell'Arcipelago Minore | 08:126 | no — non salvato |
| Manchester Derby | Derby del Fiume Grigio | 08:129 | no — non salvato |
| North-West Derby | Derby dell'Ovest Lontano | 08:130 | no — non salvato |
| North London Derby | Derby della Città Alta | 08:131 | no — non salvato |
| Istanbul Derby | Derby del Canale Scuro | 08:134 | no — non salvato |

Perché nessuna migration: `isDerby(aId,bId)` (08:137) ricalcola il derby dagli id dei club a ogni uso; il nome non entra in nessun campo salvato.

### Club con nome reale o soprannome da colori (16) — `src/02-club-leghe-albo.jsx`

| Vecchio | Nuovo | Sigla vecchia → nuova | File:riga | Migration |
|---|---|---|---|---|
| FC Nerazzurri | FC Valmora | NRZ → VAL | 02:27 | sì |
| AC Rossoneri | AC Dorvelli | ACR (invariata: resta sottosequenza del nuovo nome) | 02:28 | sì |
| FC Partenope | FC Vellamare | PRT → VEL | 02:29, 02:338 (record) | sì |
| FC Biancoceleste | FC Alcavera | BIA → ALC | 02:31 | sì |
| FC Paris | FC Lumeranza | PRS → LUM | 02:102, 02:369 (record) | sì |
| FC Granata | FC Torvelle | GRA → TRV | 02:34 | sì |
| FC Viola | FC Brenvar | VIO → BRN | 02:33 | sì |
| FC Blucerchiati | FC Marnesi | BLU → MAR | 02:39 | sì |
| FC Neroverde | FC Caldoran | NER → CAL | 02:37 | sì |
| FC Verdiblanco | FC Ventrana | VER (invariata) | 02:70 | sì |
| FC Celeste | FC Oriolan | CEL → ORI | 02:73, 02:330 (record) | sì |
| FC Leões | FC Rendalto | LEO → RDL | 02:123 | sì |
| FC Perico | FC Pelvanni | PER → PEL | 02:81, 02:329 (record) | sì |
| FC Azulón | FC Dalvora | AZU → DAL | 02:78 | sì |
| FC München | FC Valdenau | FCM → VLD | 02:83, 02:361, 02:451 (record/storico) | sì |
| FC Köln | FC Ravelmund | KOL → RVM | 02:96 | sì |

Migration sì: il nome del club si salva in `player.club.n`, `player.standings[].n`, `calendar[].opponentName`, `matchHistory[].opponent`. La rimappatura è in `src/17-menu-creazione-pannelli.jsx` (blocco «giro 6», dopo `// Sprint 28 migrations`), con l'helper `_renameClub6` in `src/09-audio-scout-anagrafiche.jsx` (mappa `CLUB_RENAME_6`). È idempotente, nessun bump di `SAVE_VERSION`.

Sigle: l'audit (regola SIGLA, 09 «LE SIGLE») pretende che la sigla sia una sottosequenza delle lettere del nome mostrato. Dopo la rinomina le sigle vecchie non lo erano più: ricalcolate dove serviva (sopra). Nessuna collisione con sigle esistenti (verificato con grep).

### Stadi che portano il soprannome del club (3) — `src/05-cronaca-stadi-formazioni.jsx`

| Vecchio | Nuovo | File:riga | Migration |
|---|---|---|---|
| Stadio Granata | Stadio Torvelle | 05:460 | no — nome di stadio per id club, non salvato |
| Estadio Verdiblanco | Estadio Ventrana | 05:470 | no — come sopra |
| Estadio Celeste | Estadio Oriolan | 05:449 (lista generica), 05:471 | no — come sopra |

`Estadio Verdiblanco` è stato trovato dall'audit (STADIUM): la mia ricerca iniziale non copriva i prefissi «Estadio».

### Testi visibili (comuni)

- `src/07-versione-save-interviste.jsx` (commento 439): esempio «FC Paris» → «FC Lumeranza», solo commento.
- `src/18-career-app.jsx:5505`: testo di un commento con «FC München» → «FC Valdenau», solo commento.

## 2. Blocklist e audit

- `src/09-audio-scout-anagrafiche.jsx` (`_CR_BRANDS`): aggiunti i nomi vecchi (`Nerazzurri`, `Rossoneri`, `Partenope`, `Biancoceleste`, `Blucerchiati`, `Verdiblanco`, `FC Paris`, `FC München`, `FC Köln`, `FC Perico`, `FC Leões`, `FC Azulón`) e i derby (`Derby d'Italia`, `Derby di Milano`, `Derby della Capitale`, `Derby del Sole`, `Derby di Torino`, `Derby della Lanterna`, `Manchester Derby`, `North-West Derby`, `North London Derby`, `Istanbul Derby`).
- Nuova scansione `subScan("DERBY", DERBIES…)`: prima l'audit non leggeva `DERBIES`, quindi un derby reale reinserito non sarebbe stato segnalato.
- Prova del rosso: reinserito `FC Nerazzurri` a mano in `02` → `node tools/audit-copyright.mjs` esce con **2** e segnala `CLUB: "FC Nerazzurri" ~ Nerazzurri`. Ripristinato da git → audit **0 hit**.
- Scelta sui termini: le singole parole `Granata`, `Viola`, `Celeste`, `Perico` NON sono in blocklist, perché sono parole comuni (`Perico` compare in «pericolo») e «Selezione Granata» è una squadra provini, non un club. In blocklist entrano le forme composte (`FC Perico`, `FC Paris`…) e i soprannomi univoci (`Nerazzurri`, `Rossoneri`…).

## 3. Casi valutati e NON cambiati (decisione del PO)

Il criterio applicato: soprannome da colori/simboli di un club reale, o nome reale in forma abbreviata. I nomi di sola città o aggettivi di regione non sono stati toccati.

| Nome | Dove | Perché non cambiato |
|---|---|---|
| Torino Athletic (id `juve`) | 02:26 e comuni | Non è un soprannome: è il club-stand-in con maglia a strisce. Contiene «Torino» (città reale) e la maglia richiama un club reale. **Da decidere dal PO.** |
| FC Istanbul (`gal`) | 02:178 | Nome di città. |
| FC Marseille, FC Monaco, FC Lyon, FC Nizza, FC Frankfurt, FC Berlin, FC Lisboa, FC Amsterdam, FC Rotterdam, FC Friburgo, FC Stuttgart, FC Mainz, FC Augsburg, FC Leipzig, FC Bergamo, FC Genova | 02 | Nomi di città. Alcuni coincidono con la città del club reale. Non verificato se costituiscono un rischio: **decisione PO**. |
| FC Felsineo, FC Friulano, FC Sardo, FC Scaligero | 02, 05:461-463 (`Stadio Felsineo`, `Stadio Friulano`, `Stadio Scaligero`) | Aggettivi di regione/città («bolognese», «friulano», «sardo», «veronese»). **Non verificato** che siano soprannomi ufficiali dei club reali: non rinominati. |
| Estadio Naranja, Estadio Amarillo, Estadio Hispalense | 05:470-471 | Colori generici o nome latino di Siviglia. Non verificato come soprannome reale: non rinominati. |
| Selezione Granata | 17:471 | Nome di squadra provini, non di un club. |
| `_TOK_CLASS` `GRANATA`, `NERAZZURRI`, `SCALIGERO`… | 12:2240-2243 | Mappa del coro. Dopo la rinomina le voci sono inerti (i nuovi nomi restano nomi propri, classe di default «P»). Lasciate per non toccare il file di grafica. |
| Commenti storici con i nomi vecchi | 01:143, 12:2229-2243, 13:1068, 13:1164-1165 | Descrivono bug storici (7.191, 7.8.3…). Lasciati invariati per non riscrivere la storia del codice. |

## 4. Salvataggi

- Campi controllati: `player.club.n`, `player.standings[].n`, `calendar[].opponentName`, `matchHistory[].opponent`.
- Campi NON rimappati: testo libero (`diary`, `log`, notizie generate). Non sono riletti dal gioco come identificatori: restano come storia narrata.
- Probe sulla fixture reale: `tests/visual/probe-rename6.mjs` (nuovo, non in `npm`). Sulla fixture `save-190-s12-ovr93.json` la migration reale (`window.__CPM_MIGRATE`):
  - nomi vecchi in calendario: **1 → 0**
  - classifica: 0 → 0 (nessun nome vecchio nella fixture)
  - club della fixture (`FC Merseyside`): invariato (non rinominato)
  - seconda applicazione: **nessuna modifica** (idempotente)
- Helper: `_renameClub6` verificato in Node su casi con `U18`, nomi già nuovi, nomi non nella mappa e `undefined`.

## 5. Catene (tests/visual)

Ambiente: `npm install` in `tests/visual` (il pacchetto `playwright` non era installato: la prima esecuzione è fallita per questo, non per il codice). `CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`.

| Catena | Esito | Note |
|---|---|---|
| Build + check-src | ✅ allineato a HEAD | `CPM_FORZA_BUILD=1 node tools/build-src.mjs` |
| `node ci-runner.mjs grafica` (1ª esecuzione, prima delle sigle) | ✅ 29/29 | 1ª chiamata in primo piano: scaduta a 580 s (rilanciata in sottofondo nel turno) |
| `node ci-runner.mjs grafica` (finale, dopo sigle e stadi) | ✅ **29/29** | griglia-mobile, design-system, career-critical, test:logic, save-compat, 24 scene grafiche |
| `npm run career-critical` (esplicito, build finale) | ✅ PASS | 5 PASS nel log, 0 ❌ |
| `npm run save-compat` (esplicito, build finale) | ✅ 12 pass · 0 fail | |
| `node tools/audit-copyright.mjs` (build finale) | ✅ 0 hit (exit 0) | |

Passi rossi: nessuno sul codice. Il primo giro è rosso per l'ambiente (pacchetto mancante) e la regola SIGLA dell'audit ha trovato le sigle non più derivabili dal nome: entrambi corretti. Il rilancio singolo previsto dalla regola «rosso → rilancia due volte» non è stato necessario sul build finale.

## 6. Cosa resta fuori da questo giro

- Decisioni del PO elencate al punto 3 (Torino Athletic, nomi di città, aggettivi regionali, `Estadio Naranja/Amarillo/Hispalense`).
- Testo libero dei salvataggi (diario, log): non rimappato.
- Foto del collaudo grafico (`docs/collaudo-grafico/`): rigenerate dal giro, quindi committate con il rapporto.
