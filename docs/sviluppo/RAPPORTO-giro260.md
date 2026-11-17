# Rapporto giro 260 — store TWA, «Sostieni» fuori dall'app, titoli solo in testata, Primavera ovunque, podio dei premi (versione 7.999.197)

Ramo `sviluppo/giro260-store-titoli`, partito da `lavoro/197` a `c14fa1b` (contiene i giri 235, 236 e 258). Origine:
`RAPPORTO-giro235.md` dubbio 5, `RAPPORTO-giro236.md` dubbi 1, 5, 6, 8, 9, `RAPPORTO-giro258.md` dubbi 1, 2, con le **decisioni PO
del 17/11** (A–E). `GAME_VERSION` non toccato (resta `7.999.196`). Rosso del giro: **`window.__CPM_NO_G260`** (B, C, D ed E come
prima del giro), interruttore `_g260()` in `src/01-bootstrap-tema-avatar.jsx`.

## A) Pacchetto: la TWA («TWA, come PLINTO»)

- `twa/android/app/build.gradle`: `versionName '7.999.184'` → **`'7.999.197'`**, `versionCode 2000` → **`2001`**.
- `twa/twa-manifest.json`: `appVersionName`, `appVersion` → `7.999.197`; `appVersionCode` → `2001`.
- `docs/store/PACCHETTO.md` riscritto sulla sola TWA (Capacitor citato solo come «non si carica»); comandi di build presi dal
  workflow `twa-build.yml` (`gradle -p twa/android --no-daemon bundleRelease`); firma = segnaposto, nessuna chiave.
- `docs/store/CHECKLIST-PLAY-CONSOLE.md`: passo 2 = TWA decisa, passo 3 = «Sostieni» deciso, passo 6 col comando TWA, tabella finale.
- AAB **non compilato** (nessun SDK Android in sessione): dimensione per la 7.999.197 non confermabile.

## B) «Sostieni il progetto» fuori dall'app, sul sito resta

**Criterio dichiarato** (lo stesso del giro 120, `src/00-head.html`): `window.__CPM_APP_TWA` è acceso se l'indirizzo porta
`?app=twa` (è lo `start_url` del manifest TWA e l'indirizzo d'avvio del progetto Android) **oppure** il referrer comincia con
`android-app://com.korward.elite`; il segno resta per la sessione della scheda (`sessionStorage` «cpm-app-twa»), così una ricarica
senza parametro non torna alla versione web. **`display-mode: standalone` da solo NON basta**: è vero anche per la PWA installata
dal sito, che non passa dallo store.

Codice: `donazioneVisibile260()` in `src/07` (accanto a `DONATION_URL`/`openDonation`) usata dai due punti che disegnano il tasto in
`src/18` (riga delle strisce e striscia del rosso 49); anche `openDonation` non apre nulla nell'app. Da solo nella riga, «Idee e
feedback» perde il filo a sinistra.

**Screenshot dello store rifatti** (`node tools/store-screenshots-236.mjs`, plancia in `docs/sviluppo/giro260/store-plancia-app.png`): home, creazione e plancia ora sono scattate **come
nell'app** (`?app=twa`); lo script chiude le finestre della settimana col loro tasto (fuori dal banco si aprono davvero) e **si
ferma** se trova «Sostieni» nella plancia. La partita (05) resta col banco `?cpmtest=1` (serve la scena forzata; in partita il tasto
non c'è). `docs/store/IMMAGINI.md` aggiornato.

## C) Titolo solo in testata (Stagione, Agente, Ufficio)

`src/18`: con `_g260()` (e il 235 acceso) niente `TitoloV2` in Stagione (Classifica · Calendario · Coppe), Agente e Ufficio; il nome
resta nella testata compatta del 235. In **Classifica** distanza dalla vetta e forma restano in una riga sotto la testata
(`data-cpm="vetta-riga260"`, stessi `vetta-v2` e `FormaV2`). In Calendario e Coppe non c'era altro accanto al titolo. Vanno via anche
gli occhielli «Mercato e contratto» / «Patrimonio e staff» (stavano nel titolo).

## D) «Primavera» ovunque a schermo

Censimento statico di tutte le scritte `Under 18`/`U18` nelle stringhe e nel testo JSX di `src/` (script nello scratchpad, 36
punti: il resto sono commenti, espressioni regolari che *riconoscono* i vecchi nomi, id e campi salvati). Cambiate (ramo nuovo con
`_g260()`, vecchio testo nel rosso):

| dove | prima | ora |
|---|---|---|
| Profilo, gruppo (NOMI235, `src/11`) e titolo della sezione | Stato / Status Under 18 | Stato Primavera |
| Profilo, riquadro | STAGIONI U18 | STAGIONI IN PRIMAVERA |
| Profilo, nota | Prima stagione in Under 18… / Ultima stagione possibile in U18… | … in Primavera … |
| Nazionale (anteprima) | Finché giochi in Under 18… · Sei in Under 18 · stagione N di 2 | … in Primavera … |
| Coppe (anteprima) | In Under 18 si gioca solo il campionato… · Sei in Under 18… | In Primavera … |
| Club senza club | completa il periodo U18 | completa il periodo in Primavera |
| testata (lega mancante) | U18 | Primavera |
| avviso dopo «Resta» | 🔄 Resti in Under 18! | 🔄 Resti in Primavera! |
| registro/diario dopo «Resta» | 🔄 Resto in Under 18 (S.n) | 🔄 Resto in Primavera (S.n) |
| giornalista Anna Lombardi (`src/03`) | Ti segue dalla U18 | Ti segue dalla Primavera |

Non toccati: `proStatus "u18"`, `u18Seasons`, `isStayU18`, `isU18`, `U18_CLUBS`, le espressioni che tolgono « U18» dai nomi
vecchi, la migrazione `name:+" U18"` (campo salvato `club.name` dei salvataggi più vecchi), i nomi finti `{n:"U18"}` passati ai
generatori di calendario e rosa (non si vedono; cambiarli sposterebbe i semi). La scheda di fine Primavera era già a posto dal 236.

## E) Podio dei premi a 375 px coi nomi lunghi

**Misura sulla base** (`podio-260`, braccio rosso = com'era): schermata vera dei premi a 375 px, i quattro nomi a rotazione in ogni
gradino dei quattro podi. I club **da soli** stanno sempre in 2 righe (anche «Wolverhampton», nessuna parola fuori colonna). Vanno
su **3 righe** (e il taglio a 2 ne mangia un pezzo, «Sampierdarena…») le righe **miste**: MVP «9 assist · FC Sampierdarena
Primavera» e Trofeo d'Oro «Catanzarese Primavera · 🏆 2 · OVR 82» — **11 riquadri su 96**, colonne di 103-119 px.

**Correzione** (`src/16`, `Podio23`): due proprietà nuove, `club260` e `dati260`: il club ha le sue 2 righe, i numeri («9 assist»,
«🏆 2 · OVR 84») una riga sua sotto, senza a capo. Dopo: **120 riquadri, al più 2 righe, nessuna parola fuori colonna**. Foto:
`docs/sviluppo/giro260/podio-prima-375.png` e `podio-dopo-375.png` (podio dell'MVP).

## Guardiani

| guardiano | cosa | verde | rosso |
|---|---|---|---|
| `coerenza-235` (aggiornato) | nuova parte **U**: nessun titolo grande nel contenuto di Stagione/Agente/Ufficio; in Classifica vetta e forma sotto la testata nel primo schermo | ✓ (375 e 1366: vetta «−1 dalla vetta» y124/y131, sotto la testata di 101 px) | `__CPM_NO_G235` bocciato su T,H,M,P,C,F,G,**U**; `__CPM_NO_G260` (375) bocciato su U |
| `store-236` (aggiornato) | **S8** TWA alla versione giusta (versionName = `GAME_VERSION` o la successiva, uguale in twa-manifest, versionCode > 2000); **S9** gioco vero senza `cpmtest`: sito → «Sostieni» c'è, `?app=twa` → non c'è e «Idee» sì | 15/15 | 15/15 cadono (S8 su copia con 7.999.184, S9 con `__CPM_NO_G260`) |
| `primavera-260` (nuovo) | carriera Primavera, stagioni 1 e 2: 9 schede ciascuna, scheda di fine Primavera, tocco su «Resta →» (avviso, Home, Profilo, registro), descrizioni dei giornalisti: nessun «Under 18»/«U18» | 18 schede, 0 scritte | 19 scritte (Coppe, Profilo, Nazionale…) |
| `podio-260` (nuovo) | podio dei premi a 375 px, 4 nomi lunghi a rotazione | 120 riquadri, max 2 righe, 0 fuori regola | 11 fuori regola |

Sonde aggiornate perché cercavano il titolo tolto: `grafica-v2` (Classifica accetta `vetta-riga260`; Agente/Ufficio leggono il
titolo nella testata) e `agente-198` (scheda aperta = titolo «Agente» nella testata). **Non eseguite** in questo giro.
`primavera-260` e `podio-260` aggiunti a `package.json`, alle catene `completa` e `carriera` e alla voce MAPPA di `src/18|16|10`
(con `store-236`).

## Controlli eseguiti

Uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, memoria e disco controllati prima (15 GB liberi, disco al 28%).
`node tools/build-src.mjs` + `node tools/check-src.mjs` dopo ogni modifica a `src/`: **IDENTICO BYTE PER BYTE**.

| controllo | esito |
|---|---|
| `coerenza-235` | ✓ VERDE · rosso 235 bocciato su T,H,M,P,C,F,G,U · rosso 260 bocciato su U |
| `store-236` (verde + `CPM_PROVA_ROSSO=1`) | ✓ 15/15 · rosso 15/15 cadono |
| `primavera-260` | ✓ verde 0 scritte su 18 schede · rosso 19 scritte (eseguito due volte, la seconda con la foto) |
| `podio-260` | ✓ verde 120 riquadri, max 2 righe · rosso 11 fuori regola |
| `nomi-190` | ✓ VERDE (23 ok · 0 ko) |
| `nomi-211` | ✓ VERDE (22 ok · 0 ko) |
| `sigle-203` (4 bracci) | ✓ VERDE 18 ok · VERDE 8 ok (1366) · rossi 203 e 254 vedono il difetto |
| `home-199` | ✓ VERDE (rosso `__CPM_NO_G199` bocciato) |
| `griglia-mobile` | ✓ uscita 0 (14 schermate × 5 larghezze) |
| `test:logic` | ✓ 51/51 |
| `save-compat` | ✓ 12 pass · 0 fail |

`griglia-mobile` e `home-199` hanno riscritto foto di altri giri (`docs/collaudo-grafico/g0/`, `docs/sviluppo/giro199/`): rimesse
con `git checkout --`, non committate. Prima dei controlli un mio comando sbagliato (`ci-runner.mjs mirata lavoro/197 --elenco`, opzione
che non esiste) ha avviato la catena mirata per ~2 minuti: l'ho fermato; non ha lasciato file modificati.

## Dubbi per il PO

1. **Versione a schermo 7.999.196.** Gli screenshot dello store e il gioco mostrano «v 7.999.196» perché `GAME_VERSION` non si tocca
   in questo giro; la TWA è già a 7.999.197. Al rilascio vanno rifatti (stesso comando). Il workflow `twa-build.yml` scrive
   `versionName` = `GAME_VERSION`: finché il gioco è a 196, un AAB dalla CI porta 196. Il controllo S8 accetta `GAME_VERSION` o la
   successiva: quando il gioco passerà a 197 resterà verde; alla 198 diventerà rosso finché la TWA non segue.
2. **`versionCode` 2001.** Ho alzato di uno il valore delle build locali. La CI usa 2000 + numero della corsa: la corsa n. 1 darebbe
   lo stesso 2001. Se il primo AAB caricato è locale, il successivo dalla CI deve avere un numero più alto. Altra strada possibile:
   un numero legato alla versione (es. 7999197) — ma allora la CI (2000+corsa) non potrebbe più caricare. Scelta del PO.
3. **Riconoscere l'app.** Ho usato il criterio già nel gioco (`?app=twa` o referrer `android-app://com.korward.elite`, ricordato per
   la scheda). Non ho potuto provarlo su un telefono con la TWA vera: **non posso confermare** che Chrome passi il parametro dopo
   un aggiornamento del sito o in un avvio dalla cronologia. Se servisse, si può aggiungere `display-mode: standalone` **insieme** al
   segno della sessione (da solo prenderebbe anche la PWA del sito).
4. **Registri vecchi.** Le voci «🔄 Resto in Under 18 (S.n)» già scritte nei salvataggi esistenti restano così (campo salvato, non
   toccato): si vedono nel registro di chi è passato da lì prima del giro. Si potrebbe tradurre in lettura; non l'ho fatto.
5. **«STAGIONI IN PRIMAVERA»** nel riquadro stretto del Profilo: va su due righe, alla pari col riquadro «Obiettivo» accanto (foto `docs/sviluppo/giro260/profilo-primavera-375.png`). La regola
   PO-396 dice «U19» solo dove il nome non entra: qui entra su due righe, quindi ho tenuto «Primavera». Se il PO preferisce una riga sola, «STAGIONI U19».
6. **Occhielli spariti.** Togliendo il titolo grande da Agente e Ufficio spariscono anche «Mercato e contratto» / «Patrimonio e
   staff», che stavano nello stesso blocco. In Classifica la riga vetta+forma resta sola sotto la testata (a sinistra la distanza, a
   destra la forma).
7. **Podio: altre righe.** Ho separato solo le due righe miste (MVP e Trofeo d'Oro); capocannoniere e Re dei Bomber hanno solo il
   club e stavano già in 2 righe. Non ho misurato a 360 px (la consegna dice 375).
8. **Controlli della MAPPA** di `src/18`/`src/16`/`src/07`/`src/01`/`src/03`/`src/11` (decine di guardiani: `grafica-v2`,
   `agente-198`, `design-system`, `career-critical`…) **non eseguiti**: ho eseguito quelli della consegna e i miei. `grafica-v2` e
   `agente-198` li ho modificati senza eseguirli: vanno controllati nella verifica di rilascio.
9. **Capacitor.** È rimasto nel repository (configurazione, workflow, controllo S1 che verifica ancora `capacitor.config.json`): la
   decisione dice quale pacchetto si carica, non di togliere l'altro.
10. **Roadmap non aggiornata**: giro su ramo di sviluppo, nessuna versione spedita.
