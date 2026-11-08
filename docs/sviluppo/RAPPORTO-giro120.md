# Rapporto giro 120 — Korward Elite come Trusted Web Activity (PO-322, «come PLINTO»)

Ramo `sviluppo/giro120-twa`, base `lavoro/184` (7.999.184). `GAME_VERSION` non toccata. Nessuna credenziale, nessun account,
nulla inviato a Google, nessuna chiave generata o committata. Nessun push fuori da `Carrier-manager-`: PLINTO e
`antoniovairo-rgb.github.io` solo letti (clone anonimo del repository pubblico di PLINTO; `add_repo` negato dalla sessione).
Dettaglio per il PO e proposta `assetlinks.json`: `docs/governo/USCITA-STORE-184.md` §10.

## 1. PLINTO studiato
Progetto Gradle **scritto a mano** (non Bubblewrap), un modulo, solo `androidbrowserhelper` 2.7.3, AGP 8.9.1, SDK 36/24,
compilato in Android Studio (nessun workflow AAB). Le lezioni dei primi giorni stanno nei commenti del suo
`AndroidManifest.xml` (ManageDataLauncherActivity, FileProvider dell'immagine d'avvio, orientamento nel manifest
Android, display `default` dopo i rifiuti in revisione, `appCategory=game`) e in `COME-PUBBLICARE.md` (impronta di Play
App Signing, `.nojekyll`). Indietro in pagina (`useTastoIndietro.js`), service worker con cache per versione.
assetlinks pubblicato oggi: 1 blocco, `io.github.antoniovairo_rgb.plinto`, 2 impronte.

## 2. Cosa ho fatto
| commit | cosa |
|---|---|
| modalità app | `src/00-head.html`: `?app=twa` o referrer `android-app://com.korward.elite` → `__CPM_APP_TWA` + `__CPM_STORE_BUILD` (segno tenuto per la scheda in `sessionStorage`); guardia di cronologia per il tasto Indietro. `src/19` `__CPM_BACK_APP` (creazione → Home, Home → esci, provini/offerte → resta), `src/18` `__CPM_BACK_CAREER` (riquadri si chiudono, scheda → Home carriera, partita/trasferimento → resta). `src/17` `AISettingsCard` nulla in build store. Rosso `__CPM_NO_G120`. |
| progetto TWA | `twa/android/` (stampo PLINTO, `com.korward.elite`, `?app=twa`, verticale, colori TINTE `#0d0f14`, icona adattiva entro il cerchio, intent-filter limitato a `/Carrier-manager-/`), `twa/manifest-twa.webmanifest`, `twa/twa-manifest.json` (Bubblewrap, alternativa), `.github/workflows/twa-build.yml`, deploy che pubblica il manifest web della TWA. `.gitignore`: esclusa solo la `android/` di Capacitor alla radice. |
| service worker | `sw.js?v=<GAME_VERSION>`: cache per versione, guscio precaricato, la pagina consegna l'elenco dei file già caricati, ripiego di navigazione senza rete. Registrato senza `?v=` (rosso `__CPM_NO_G120S`) = comportamento di prima. |

## 3. Misure
- **AAB TWA** compilato qui (SDK `platforms;android-36` + `build-tools;36.0.0` in `/opt/android-sdk`, Gradle 8.14.3, JDK 21):
  **3.798.657 byte**, non firmato. Manifest fuso: `com.korward.elite`, minSdk 24, targetSdk 36, `appCategory=game`,
  versionCode 2000. Primo tentativo: `Received status code 429 from server: Too Many Requests` su
  `repo.maven.apache.org/.../groovy-3.0.22.pom` (task `lintVitalAnalyzeRelease`); secondo: riuscito.
- **Primo avvio** (build del sito in locale, 25 s con intro): 63,0 MB (prima 56,0). **Seconda apertura senza rete**:
  prima non montava, ora monta; terza: 0 file persi.

## 4. Guardiani e rituali
- `twa-120` (nuovo, `npm run twa-120`): 12/12 — web invariato (app spenta, AI tenta la chiamata, PayPal, nessuna
  guardia) · app (= build store, AI `disabled_store_build`, 0 richieste esterne, PayPal, Indietro scheda → Home, Home →
  uscita) · rosso `__CPM_NO_G120` cade su modo/AI/rete/Indietro 4/4. Lezione presa per strada: le richieste del service
  worker **non passano da `page.route`** (la chiamata AI usciva da lì con 401 e la sonda contava 0) → nel guardiano il
  service worker è bloccato.
- `sw-cache-120` (nuovo, `npm run sw-cache-120`): verde + rosso. Stessa lezione al contrario: senza rete i tentativi
  di rete del service worker falliscono per costruzione e vanno esclusi dai «file persi».
- `test:logic` 43/43 · `save-compat` 12 pass / 0 fail · `altezza-114` PASS (verde+rosso) · `flussi-115` e
  `validate-situations`: vedi §5.
- `node tools/build-src.mjs` + `node tools/check-src.mjs`: identico byte per byte.

## 5. Esiti finali dei rituali lunghi (uno alla volta, sul build finale del ramo)
- `flussi-115`: verde **54/54**, rosso atteso (cade su 17/17 punti).
- `validate-situations`: **PASS**, fingerprint `00001505`.
- `validate-dist --web` (build del sito): verde, flag store assente · `validate-dist` (build store, riserva Capacitor):
  verde, flag store attivo · `audit-copyright`: 0 riferimenti.
- Non eseguiti: catena completa `npm run ci` / `notte` (giro di sviluppo, non rilascio); workflow `twa-build.yml` in CI
  (nessun tag e nessun avvio manuale da una sessione figlia).

## 6. Per la madre
1. Promuovere il ramo: senza `main` il sito non ha né la modalità app né `twa/manifest-twa.webmanifest`.
2. Pubblicare il blocco `assetlinks.json` di USCITA-STORE-184 §10.5 nel repository `antoniovairo-rgb.github.io` (con
   l'impronta di Play App Signing che solo il PO legge in Play Console), senza toccare il blocco di PLINTO.
3. Riga di roadmap: questo giro non e' un rilascio (nessun bump), la riga va scritta alla release che lo include.
4. Rischio dichiarato: il tasto Indietro e' provato in headless con `history.back()` dentro Chromium, **non** dentro
   una vera finestra TWA su Android — va confermato sul telefono.
