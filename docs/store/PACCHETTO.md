# Pacchetto Android (AAB/APK) — come si costruisce, firma esclusa

> Giro 236 · PO-322 · 17/11/2026. Nessuna chiave generata o committata, nessun account usato, nulla inviato a Google.

## Due pacchetti, stessa identità `com.korward.elite` — se ne carica UNO

| | **Capacitor (offline)** | **TWA (come PLINTO)** |
|---|---|---|
| Dove sta il gioco | dentro l'app (`dist/`, JSX precompilato, nessun CDN) | sul sito GitHub Pages, aperto da Chrome a tutto schermo |
| Rete | non serve per giocare | serve al primo avvio; poi regge senza rete (service worker, giro 120) |
| Aggiornare il gioco | nuovo AAB caricato sullo store | si pubblica il sito; nuovo AAB solo se cambiano icona, nome, permessi |
| Progetto | `android/` generato da `npx cap add android` (non versionato) | `twa/android/` (versionato, scritto a mano) |
| Target API | 36 (Capacitor `^8.6.0`: default compileSdk/targetSdk 36, minSdk 24 — letto nei pacchetti npm al giro 116) | 36 esplicito in `twa/android/app/build.gradle` (minSdk 24) |
| Ultima build misurata | giro 116 (07/11): `app-release.aab` **109.731.296 byte**, non firmato, manifest fuso targetSdk 36 | giro 120 (08/11): AAB **3.798.657 byte**, non firmato |
| Workflow CI | `.github/workflows/android-build.yml` | `.github/workflows/twa-build.yml` |

Il mandato chiede il pacchetto **offline, API 36**: è il **Capacitor**. La scelta finale fra i due è del PO (vedi checklist).

## Cosa ho verificato in questo giro (17/11/2026)

- `node tools/build-dist.mjs` → `dist/` rifatta dal guardiano `store-236` (controllo S7: `dist/index.html` senza script da CDN).
- Configurazioni: `capacitor.config.json` (`appId` `com.korward.elite`, `webDir` `dist`), `package.json` (`@capacitor/android ^8.6.0`),
  `twa/android/app/build.gradle` (`applicationId 'com.korward.elite'`, `targetSdk 36`), `twa/twa-manifest.json` — controllo S1.
- **Non** ho compilato l'AAB in questo giro: l'installazione dell'SDK Android in sessione (`sdkmanager`, `platforms;android-36`)
  è stata **negata dal controllo dei permessi** della sessione e non l'ho aggirata. Le misure dell'AAB qui sopra sono quelle dei giri
  116/120, su versioni precedenti del gioco (7.999.183/184): per la 7.999.197 **non posso confermarle**.

## Costruire l'AAB Capacitor (sul PC del PO o in CI)

Prerequisiti: Node ≥ 22, JDK 21, Android SDK con `platforms;android-36` e `build-tools;36.0.0` (Android Studio li installa).

```bash
npm install
cd tests/visual && npm install && cd ../..      # la build web prende React/Three/Babel da qui
npm run build:web && npm run validate:web       # atteso: «DIST OFFLINE FUNZIONANTE»
npx cap add android                             # solo la prima volta
npx cap sync android
npm run android:apk                             # APK di prova  → android/app/build/outputs/apk/debug/app-debug.apk
npm run android:aab                             # AAB di release → android/app/build/outputs/bundle/release/app-release.aab
```

Controllo del livello API dopo la build (senza bundletool):
`grep -o 'targetSdkVersion="[0-9]*"' android/app/build/intermediates/merged_manifest/release/*/AndroidManifest.xml` → atteso `36`.

## Firma — SEGNAPOSTO (solo il PO)

Nel repository **non c'è e non deve esserci** nessuna chiave. Il PO:

1. crea la **chiave di caricamento** sul suo PC (Android Studio → *Build › Generate Signed Bundle* → *Create new…*, oppure `keytool`)
   e ne tiene una copia fuori dal PC. Una sola chiave per `com.korward.elite`, qualunque pacchetto scelga;
2. al primo caricamento attiva **Play App Signing** (Google custodisce la chiave dell'app; il PO solo quella di caricamento);
3. per la CI mette i segreti nel repository GitHub (Settings › Secrets): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
   `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` (nomi letti in `.github/workflows/android-build.yml`, non modificato).

```
# segnaposto — NON compilare qui, NON committare
storeFile=<percorso della chiave sul PC del PO>
storePassword=<solo il PO>
keyAlias=<solo il PO>
keyPassword=<solo il PO>
```

## versionCode e versionName

- `versionCode` deve crescere a ogni caricamento (anche le bozze cancellate «bruciano» il numero). TWA: 2000 in locale, la CI lo
  calcola. Capacitor: 1 in locale, la CI lo sovrascrive.
- `versionName` della TWA è fermo a `7.999.184` in `twa/android/app/build.gradle`: **non l'ho cambiato** (regola: non toccare
  `GAME_VERSION` e le versioni). Da allineare alla versione che si carica.
