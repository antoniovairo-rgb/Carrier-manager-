# PACKAGING — Korward Elite → Google Play (AAB via Capacitor)

Pipeline per trasformare il gioco (singolo file `CARRIER-MANAGER-AV.html`) in un **Android App Bundle (.aab)** pubblicabile. Il **sorgente di lavoro non cambia mai**: il packaging produce solo artefatti derivati.

> Stato roadmap: **1.1 precompila JSX** ✅ · **1.2 bundle locale/offline** ✅ · **1.6 build store (AI off)** ✅ · **1.3 Capacitor** ✅ scaffold. Manca solo la build dell'AAB su una macchina con Android SDK (qui in cloud `dl.google.com` è bloccato).

## Cosa c'è nel repo

| File | Ruolo |
|---|---|
| `tools/build-dist.mjs` | Build di produzione → `dist/` **offline**: precompila il JSX (niente Babel-in-browser) e inlina React/Three/Phaser dai `node_modules` del gate. |
| `tools/validate-dist.mjs` | Verifica che `dist/` monti e giri **senza rete** (blocca ogni CDN). |
| `package.json` | Dipendenze Capacitor + script npm. |
| `capacitor.config.json` | `appId=com.korward.elite`, `appName=Korward Elite`, `webDir=dist`, splash. |

`dist/` e `android/` **non sono versionati** (build-output riproducibile).

## Prerequisiti (sulla TUA macchina)

- **Node 18+** e **npm**.
- **JDK 17+** (`java -version`). *(In questo ambiente cloud è già presente JDK 21.)*
- **Android SDK** — il modo più semplice è installare **Android Studio** (include SDK, build-tools, platform-tools e un device/emulatore). In alternativa solo le *command-line tools* + `sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"`.
- Variabile `ANDROID_HOME` (o `ANDROID_SDK_ROOT`) che punta all'SDK, oppure `android/local.properties` con `sdk.dir=/percorso/Android/Sdk`.

## Build dell'AAB — passo per passo

```bash
# 1. dipendenze di packaging
npm install

# 2. build web di produzione (offline) + verifica
npm run build:web
npm run validate:web          # atteso: "✅ DIST OFFLINE FUNZIONANTE"

# 3. genera il progetto nativo Android (solo la PRIMA volta)
npx cap add android

# 4. sincronizza dist/ dentro il progetto Android (ad ogni nuova build web)
npx cap sync android          # = npm run package fa build:web + questo

# 5a. build dell'AAB di release
npm run android:aab           # → android/app/build/outputs/bundle/release/app-release.aab
# 5b. oppure apri in Android Studio e usa Build > Generate Signed Bundle
npm run android:open
```

> Da qui in poi, dopo ogni modifica al gioco: `npm run package` (rifà `dist/` + `cap sync`) e poi `npm run android:aab`.

## Salvataggi: storage nativo anti-eviction

Il wrapper `storage` del gioco usa già `window.storage` se presente, con fallback a `localStorage`. La build (`tools/build-dist.mjs`) inietta — **solo in app Capacitor nativa** — un `window.storage` basato su **`@capacitor/preferences`** (storage nativo, **non** soggetto a eviction come il `localStorage` della WebView). Nel browser/gate è un no-op (Capacitor assente → resta `localStorage`). Niente da fare a mano: è automatico nel pacchetto. *(Plugin già in `dependencies`; registrato via `cap sync`.)*

## Firma (Play App Signing)

Google firma l'app per te; tu carichi un **upload key**. Crea il keystore **una volta** e conservalo (se lo perdi, il recupero è macchinoso):

```bash
keytool -genkey -v -keystore elevora-upload.jks -keyalg RSA -keysize 2048 \
        -validity 10000 -alias elevora
```

In `android/app/build.gradle` aggiungi una `signingConfigs.release` che legge il keystore (idealmente da variabili d'ambiente / `keystore.properties` **non** versionato), e collegala a `buildTypes.release`. In Android Studio puoi farlo da *Generate Signed Bundle* senza editare il gradle.

## Tester del test chiuso

Vedi **`TESTER_ONBOARDING.md`**: messaggio pronto da inoltrare, istruzioni di opt-in, cosa chiedere di
segnalare e come monitorare il contatore in Console. I 14 giorni partono dall'**iscrizione dei tester**,
non dalla fine dello sviluppo → gli inviti vanno mandati **subito**, in parallelo al lavoro sul gioco.

## Requisiti Play Console (una tantum)

- **Account Play Developer**: 25 $ una tantum. I nuovi account *personali* richiedono un **test chiuso con ≥12 tester per 14 giorni** prima della produzione → da pianificare.
- **Formato**: **AAB obbligatorio** (l'APK non è accettato per i nuovi upload).
- **Target API level**: i nuovi upload devono targettizzare un'API recente (al 2025 ≈ **API 35 / Android 15**). È una *moving target* annuale — verifica in Console al momento del rilascio e allinea `targetSdkVersion` in `android/variables.gradle`.
- **Versioning**: ad ogni upload incrementa `versionCode` (intero) in `android/app/build.gradle`; `versionName` è la stringa mostrata.

## Permessi

Il manifest generato include solo **`INTERNET`** (default Capacitor). Il gioco gira **offline** e la build store disabilita la feature AI: se non servono né AI né link esterni in-app puoi **rimuovere** `INTERNET` da `android/app/src/main/AndroidManifest.xml` per un profilo permessi a zero (meglio per la review privacy). Il link donazione apre il **browser di sistema** (intent), che non richiede il permesso in-app.

## Icona e splash (granata Korward Elite)

Le immagini **sorgente** sono versionate in **`resources/`** (generate dal marchio reale del gioco — barre + pallone, gradiente granata `#a3263a→#5e0f1d`):

| File | Uso |
|---|---|
| `resources/icon-only.png` (1024²) | icona legacy / fallback |
| `resources/icon-foreground.png` (1024², trasparente) | primo piano adaptive icon (marchio nel 64% safe-zone) |
| `resources/icon-background.png` (1024²) | sfondo adaptive icon (gradiente granata) |
| `resources/splash.png` (2732²) | splash chiaro (`#f0f7ff`) |
| `resources/splash-dark.png` (2732²) | splash scuro (`#0f172a`) |

Rigenerare le sorgenti (se cambia il marchio):

```bash
CPM_CHROME=<chrome> node tools/gen-assets.mjs       # oppure: npm run assets:gen
```

Espandere le sorgenti nelle risorse Android (mipmap + drawable, tutte le densità):

```bash
npm run assets:android       # = npx capacitor-assets generate --assetPath resources --android
```

> `@capacitor/assets` usa **sharp** (binario nativo): gira sul PC ma **non** in questo ambiente cloud (binario bloccato dal proxy). Le sorgenti `resources/*.png` sono comunque già pronte. Lo splash background (`#f0f7ff`) è anche in `capacitor.config.json`. Esegui `assets:android` **dopo** `npx cap add android`.

## Grafica del listing (Play Console)

In **`store-assets/`** (granata Korward Elite):

| File | Uso |
|---|---|
| `play-icon-512.png` (512²) | icona alta risoluzione del listing |
| `feature-graphic.png` (1024×500) | feature graphic obbligatoria |
| `screenshots/01-home.png · 02-create.png · 03-match.png` (1080×1920) | screenshot (grezzi) |

Rigenerare: `node tools/gen-store-graphics.mjs` (icona+feature) e `node tools/gen-screenshots.mjs` (screenshot, richiede `npm run build:web`). Gli screenshot sono catture headless: per il rilascio conviene **rifinirli o ricatturarli su un device reale**.

## Build in CI (GitHub Actions)

`.github/workflows/android-build.yml` compila l'AAB sui runner GitHub (dove l'Android SDK c'è), così non serve la toolchain locale. Si avvia **manualmente** (tab *Actions* → *Android AAB* → *Run workflow*) o su **tag** `v*` (es. `git tag v1.0.0 && git push --tags`). Fa: install → `build:web` → `cap add android` + `sync` → `gradlew bundleRelease` → carica l'`.aab` come **artifact**.

Per ottenere un AAB **firmato** col tuo upload key, aggiungi i secret (Settings → Secrets and variables → Actions):

| Secret | Valore |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 elevora-upload.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | password dello store |
| `ANDROID_KEY_ALIAS` | alias (es. `elevora`) |
| `ANDROID_KEY_PASSWORD` | password della chiave |

Senza secret il workflow produce comunque l'AAB **unsigned** (utile come smoke-test della toolchain; firmabile dopo).

**Release automatica sui tag:** se avvii il workflow con un **tag** `v*` (`git tag v1.0.0 && git push origin v1.0.0`), oltre all'artifact viene creata una **GitHub Release** "Korward Elite v1.0.0" con l'AAB allegato (`korward-elite-v1.0.0.aab`) — firmato se i secret sono presenti, altrimenti segnalato come unsigned nel corpo della release.

## Alternativa: TWA/Bubblewrap

Resta documentata come piano B in `PLAY_STORE_READINESS.md` §2.A (AAB più leggero, update senza ripubblicare, ma richiede hosting + Digital Asset Links e offline via service worker).
