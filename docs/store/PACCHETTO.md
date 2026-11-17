# Pacchetto Android (AAB) per il test chiuso — la TWA, firma esclusa

> Giro 236 · PO-322 · 17/11/2026, allineato al giro 260 sulla **decisione PO del 17/11 (A) «TWA, come PLINTO»**.
> Nessuna chiave generata o committata, nessun account usato, nulla inviato a Google.

## Il pacchetto è la TWA (decisione PO 17/11)

Si carica **un solo** pacchetto: la **Trusted Web Activity** in `twa/android/`, identità `com.korward.elite`, scritta a mano sullo
stampo di PLINTO (decisione PO dell'08/11, giro 120). Il progetto Capacitor (`capacitor.config.json`, workflow `android-build.yml`)
resta nel repository ma **non** è il pacchetto del test chiuso: non va caricato (stesso `applicationId`, Play ne accetta uno solo).

| | **TWA** |
|---|---|
| Dove sta il gioco | sul sito GitHub Pages, aperto da Chrome a tutto schermo con `?app=twa` |
| Rete | serve al primo avvio; poi regge senza rete (service worker, giro 120) |
| Aggiornare il gioco | si pubblica il sito; nuovo AAB solo se cambiano icona, nome, permessi o configurazione Android |
| Progetto | `twa/android/` (versionato) · configurazione Bubblewrap equivalente in `twa/twa-manifest.json` |
| Target API | 36 esplicito in `twa/android/app/build.gradle` (minSdk 24) |
| Versione | `versionName '7.999.197'`, `versionCode 2001` (giro 260); stessi valori in `twa/twa-manifest.json` |
| Ultima build misurata | giro 120 (08/11): AAB **3.798.657 byte**, non firmato, sulla 7.999.184 |
| Workflow CI | `.github/workflows/twa-build.yml` (a mano o con un tag `twa-v*`) |

Dentro l'app il gioco si riconosce (`window.__CPM_APP_TWA`, `src/00-head.html`, giro 120): funzione AI spenta, sonde di collaudo
spente e — dal giro 260, decisione PO (B) «Toglierlo nell'app store» — **nessun pulsante «Sostieni il progetto»**, che resta sul sito.

## Cosa ho verificato (giro 260, 17/11/2026)

- `twa/android/app/build.gradle`: `applicationId 'com.korward.elite'`, `targetSdk 36`, `versionName '7.999.197'`, `versionCode 2001`;
  `twa/twa-manifest.json`: `packageId`, `appVersionName`, `appVersion` e `appVersionCode` uguali — guardiano `store-236`, controlli S1 e S8.
- **Non** ho compilato l'AAB: l'installazione dell'SDK Android in sessione era stata negata al giro 236 e non l'ho riprovata. Per la
  7.999.197 la dimensione dell'AAB **non posso confermarla**.
- `GAME_VERSION` nel gioco è ancora `7.999.196` (regola del giro: non si tocca). Il workflow scrive `versionName` = `GAME_VERSION`:
  finché il gioco non passa alla 7.999.197, un AAB costruito dalla CI porta `7.999.196`.

## Costruire l'AAB (sul PC del PO o in CI)

Prerequisiti (gli stessi del workflow): JDK 21, Gradle 8.14.3, Android SDK con `platforms;android-36` (Android Studio li installa).

```bash
gradle -p twa/android --no-daemon bundleRelease
ls -la twa/android/app/build/outputs/bundle/release/      # app-release.aab, NON firmato
```

Oppure: GitHub › Actions › «Android AAB (TWA)» › *Run workflow*. Senza i segreti esce un AAB non firmato (artefatto
`korward-elite-twa-aab`); con i segreti lo firma.

Dopo il primo caricamento: leggere in Play Console l'impronta SHA-256 della firma dell'app e pubblicare `assetlinks.json`
(proposta in `docs/governo/USCITA-STORE-184.md` §10.5), altrimenti il gioco si apre con la barra dell'indirizzo.

## Firma — SEGNAPOSTO (solo il PO)

Nel repository **non c'è e non deve esserci** nessuna chiave. Il PO:

1. crea la **chiave di caricamento** sul suo PC (Android Studio → *Build › Generate Signed Bundle* → *Create new…*, oppure `keytool`)
   e ne tiene una copia fuori dal PC. Una sola chiave per `com.korward.elite`;
2. al primo caricamento attiva **Play App Signing** (Google custodisce la chiave dell'app; il PO solo quella di caricamento);
3. per la CI mette i segreti nel repository GitHub (Settings › Secrets): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
   `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` (nomi letti in `.github/workflows/twa-build.yml`).

```
# segnaposto — NON compilare qui, NON committare
storeFile=<percorso della chiave sul PC del PO>
storePassword=<solo il PO>
keyAlias=<solo il PO>
keyPassword=<solo il PO>
```

## versionCode e versionName

- `versionCode` deve crescere a ogni caricamento (anche le bozze cancellate «bruciano» il numero). In locale **2001** (giro 260,
  era 2000); il workflow lo riscrive con **2000 + numero della corsa**. Le due serie possono incontrarsi (la corsa n. 1 stampa 2001):
  se si carica a mano un AAB locale, il caricamento successivo dalla CI deve avere un numero più alto.
- `versionName`: `7.999.197` in `build.gradle` e in `twa-manifest.json`; il workflow lo riscrive con `GAME_VERSION`.
