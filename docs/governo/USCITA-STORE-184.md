# USCITA-STORE-184 — Verifica di preparazione a Google Play (PO-322)

> Base: `lavoro/184` = main = **7.999.183** · ramo `collaudo/184-store` · data: 07/11/2026.
> Sessione figlia di **sola lettura** sul gioco (`src/` non toccato). Nessuna credenziale usata, nessun account creato, nulla inviato a Google, nessuna firma.
> Le pagine Google sono state lette il **07/11/2026** (URL sotto). Dove non ho potuto verificare: «Non posso confermarlo».

## 0. Sintesi per il PO (in 6 righe)

1. **Il gioco impacchettato funziona**: `build-dist` e `validate-dist` verdi, offline, AI spenta, zero richieste esterne, versione 7.999.183.
2. **Manca il guscio Android generato** (`android/` non esiste nel repo, per scelta: lo crea `npx cap add android` — in CI o sul PC). **Nessun AAB è mai stato prodotto/verificato in questa sessione** (rete a `dl.google.com` non provata/documentata come bloccata; SDK Android assente).
3. **BLOCCO TECNICO NUOVO: livello API.** Il repo usa Capacitor `^6.2.0`, che per default punta a **API 34**. Google, dal **31/08/2026**, richiede per le nuove app **API 36 o superiore** (proroga fino al 01/11/2026 solo per chi la chiedeva: è già scaduta). Con Capacitor 6 l'upload verrebbe rifiutato. Serve passare a Capacitor 8 (default API 36) o forzare `targetSdkVersion=36`. `PACKAGING.md` e `PLAY_STORE_READINESS.md` dicono «API 35»: **sono superati**.
4. **BLOCCO DI PESO/PULIZIA:** `dist/` pesa **336 MB** (298 MB compresso) perché include `assets/source/` (142 MB: FBX originali, `TEXTURES.zip`, modello CGTrader sorgente), che il gioco **non referenzia** (0 occorrenze in `index.html`). Senza quella cartella: **194 MB / 157 MB compresso**. Il limite Google del base module è 500 MB compressi, quindi entra comunque, ma oltre 200 MB l'utente su rete mobile vede un avviso; e distribuire i file sorgente di un modello acquistato è un **rischio di licenza** (da verificare, vedi §4).
5. **Test chiuso**: se l'account Play è personale e creato dopo il 13/11/2023, servono **≥12 tester per 14 giorni consecutivi** prima della produzione → **«fra 2-3 giorni» in produzione non è raggiungibile** per questo percorso. Non so se l'account esista né di che tipo: «Non posso confermarlo».
6. **Il PO deve decidere/fare 14 cose** (§7); le prime tre sbloccano tutto.

## 1. Cosa è già stato preparato e quando

Fonti: `PLAY_STORE_READINESS.md` (studio, v5.45.2), `PACKAGING.md`, `STORE_LISTING.md`, `PRIVACY_POLICY.md` + `privacy.html`, `TESTER_ONBOARDING.md`, `capacitor.config.json`, `.github/workflows/android-build.yml`, `store-assets/`, `resources/`, CLAUDE.md. Date: i commit visibili nella cronologia attuale di questi file sono `71d4edf9` e `e1fc7fd7` del 21/10/2026 e `29b6b6c7` del 02/11/2026; le date originali di creazione di ciascun file non le ho ricostruite (**non posso confermarle**). Il testo di `PRIVACY_POLICY.md` porta «6 agosto 2026».

| Roadmap | Cosa | Stato dichiarato nei documenti |
|---|---|---|
| 1.1 | Precompilazione JSX (`tools/build-dist.mjs`) | fatto, **riverificato oggi** |
| 1.2 | Bundle locale, zero CDN | fatto, **riverificato oggi** |
| 1.3 | Capacitor: `package.json`, `capacitor.config.json`, `resources/`, CI `android-build.yml` | scaffold; «resta compilare l'AAB su PC/CI» |
| 1.4 | Storage nativo (`@capacitor/preferences`) + export/import salvataggio | fatto (in build) |
| 1.5 | De-branding + `tools/audit-copyright.mjs` | fatto (tecnico) — **non rieseguito oggi** (vedi §2) |
| 1.6 | AI spenta in build store (`__CPM_STORE_BUILD`) | fatto, **riverificato oggi** |
| 1.6b | Bottone donazione (PayPal) | fatto in codice — **vedi rischio §4** |
| 1.7 | Privacy policy (bozza) | `privacy.html` **online (HTTP 200 oggi)**; data «6 agosto 2026» |
| 1.8 | Account Play, keystore, Play App Signing | **non fatto** (solo PO) |
| 1.9 | Testi scheda, icona 512, feature graphic, 3 screenshot | grafiche presenti; screenshot «grezzi» |
| 1.10 | Error boundary globale | fatto |
| 1.11 | Test su device entry-level reale | **non fatto** |

## 2. Esecuzione degli strumenti (oggi, uno alla volta)

Prerequisito: in questa sessione mancava `tests/visual/node_modules`; ho eseguito `npm install` in `tests/visual` (come da PACKAGING.md). Il modulo `playwright` cercava una build browser assente → ho usato `CPM_CHROME=/opt/pw-browsers/chromium` (regola CLAUDE.md), senza `playwright install`.

| Strumento | Esito | Uscita significativa |
|---|---|---|
| `node tools/build-dist.mjs` | **OK** (exit 0, 7,2 s) | JSX 6582 KB → 5439 KB transpilato; «CH38 escluso dal pacchetto: 10,99 MB»; `dist/index.html` 6528 KB (6.684.939 byte); «CDN residue: nessuna · Babel-in-browser rimosso» |
| `node tools/validate-dist.mjs` | **OK** (exit 0) | React montato ✅ · home con «Nuova carriera» ✅ · richieste esterne **nessuna** ✅ · errori console **nessuno** ✅ · flag build store attivo ✅ → «DIST OFFLINE FUNZIONANTE» |
| `node tools/gen-store-graphics.mjs` | **OK** | rigenera `play-icon-512.png` e `feature-graphic.png`; i file rigenerati differivano dai versionati (binari non deterministici): **ripristinati con `git checkout`**, nessuna modifica committata |
| `node tools/audit-copyright.mjs` | **NON ESEGUITO** | non richiesto dal mandato; CLAUDE.md lo dichiara «obbligatorio, 0 hit» prima di pubblicare → da rilanciare dal team (§7, T4) |

## 3. Verifiche sulla build store (`dist/`)

Sonda scritta nello scratchpad, caricando `dist/` con rete esterna bloccata e una chiave finta `cpm-api-key` in `localStorage`, su 4 URL (`""`, `?cpmtest=1`, `?cpmtest=1&sit=5`, `?glb=0&debug=1`).

| Verifica | Risultato | Prova |
|---|---|---|
| Funzione AI spenta | **OK** | `window.__CPM_STORE_BUILD===true`; `callClaudeAPI()` con chiave presente → `{success:false,error:"disabled_store_build"}` (`src/09-audio-scout-anagrafiche.jsx:521-523`). Il solo riferimento a `api.anthropic.com` nel bundle è nel ramo non raggiungibile |
| Nessuna chiamata di rete esterna | **OK** | 0 richieste esterne su tutti e 4 gli URL (rete bloccata, `ext=[]`) |
| `GAME_VERSION` | **OK** | sorgente `7.999.183`; la UI della build mostra «7.999.183» |
| Ganci di collaudo | **PARZIALE / da verificare** | `_CPM_TEST` è escluso nella build store (`!window.__CPM_STORE_BUILD && cpmtest`) e `?cpmtest=1` da solo non cambia nulla (37 globali `__CPM_*` in entrambi i casi). Ma **37 globali `__CPM_*` esistono sempre** (es. `__CPM_TIMELINE`, `__CPM_EV`, `__CPM_MIGRATE`, `__CPM_PERSIST167`, `__CPM_ERRLOG`, `__CPM_SITS`) e con `?cpmtest=1&sit=5` salgono a **141** e la pagina entra in scena di prova (la UI non mostra la versione). In app Capacitor l'utente non può digitare un URL con parametri, quindi il rischio pratico è **basso**; lo dichiaro perché l'obiettivo «niente ganci esposti» è **soddisfatto per l'utente finale ma non per chi ispeziona la WebView** |
| Peso pacchetto | **ATTENZIONE** | vedi tabella sotto |
| Icone/grafiche | **OK** | vedi tabella sotto |
| Manifest PWA (`dist/manifest.webmanifest`) | OK | 192, 512, maskable 512; nome «Korward Elite: Football Career Simulator» |

Peso (misurato oggi):

| Contenuto | Non compresso | Compresso (tar.gz, indicativo) |
|---|---|---|
| `dist/` completa | 336 MB, 1.122 file | **298 MB** |
| senza `assets/source/` | **194 MB** | **157 MB** |
| `assets/source/` (inutilizzata dal gioco) | 142 MB | ~141 MB |
| `index.html` | 6,4 MB | — |

Il limite Google è sulla «dimensione compressa del download» calcolata da Play Console (non uguale al tar.gz): la cifra vera si saprà solo alla prima build dell'AAB. **Non posso confermarla** da qui.

Grafiche (misurate con `file`) contro i requisiti letti su Google:

| Asset | Nel repo | Requisito Google | Esito |
|---|---|---|---|
| Icona | `store-assets/play-icon-512.png` 512×512, **RGB (senza alfa)** | «32-bit PNG (with alpha)», 512×512, max 1024 KB | **da correggere**: manca il canale alfa. Peso da controllare (≤1024 KB) |
| Feature graphic | `store-assets/feature-graphic.png` 1024×500, RGB | JPEG o PNG 24 bit senza alfa, 1024×500 | OK |
| Screenshot | 3 PNG 1080×1920, RGB (`01-home`, `02-create`, `03-match`) | min **2**, max 8 per tipo di dispositivo, 24 bit senza alfa, lato 320–3840, rapporto ≤2:1; portrait ≥1080×1920 per i formati grandi | OK per dimensioni; sono catture headless |
| Icone launcher Android | `resources/` 1024² (foreground con alfa + background) + `icon-*.png` | generate da `npm run assets:android` dopo `cap add android` | non verificabile qui (`sharp` bloccato) |

## 4. Come diventa un'app Android — e cosa manca

**Scelta già fatta e documentata: Capacitor** (WebView di sistema che carica `dist/` offline). Cordova/TWA non sono implementati: TWA è «piano B» nel documento (richiede hosting HTTPS + Digital Asset Links). Nel repo: `capacitor.config.json` (`appId com.korward.elite`), dipendenze `@capacitor/*` `^6.2.0`, workflow `.github/workflows/android-build.yml` (JDK 17, `cap add android`, versionCode da numero di run, `bundleRelease`, firma da secret, upload su Play facoltativo).

**Manca / da correggere (tutto verificato nel repo):**

1. **Nessun progetto `android/`** (creato a ogni run dalla CI: voluto). Nessun AAB mai compilato qui.
2. **API di destinazione**: Capacitor 6.2.1 usa come default `targetSdk 34 / compileSdk 34 / minSdk 22` (letto oggi nel pacchetto npm `@capacitor/android@6.2.1`, file `build.gradle`); Capacitor 7.6.10: 35/23; **Capacitor 8.6.0: 36/24**. Sono i default della *libreria*; il valore finale dell'app lo fissa il template `variables.gradle` creato da `cap add android`: **da confermare dopo la prima generazione**. Opzioni: (a) aggiornare a Capacitor 8 (consigliata; richiede ritest di plugin e verifica di Node/JDK richiesti: **non verificati**); (b) restare su 6 e forzare `targetSdkVersion=36` (rischio: incompatibilità non testate con il plugin).
3. **Coerenza nomi/ID**: `TESTER_ONBOARDING.md` riga 17 usa il link `…/com.elevora.football` mentre l'appId è `com.korward.elite` → link sbagliato per i tester. Da correggere (documento, non codice).
4. **Permesso `INTERNET`**: il template lo include; PACKAGING.md suggerisce di toglierlo. Va deciso (vedi donazione).
5. **Pacchetto**: escludere `assets/source/` da `dist/` (modifica a `tools/build-dist.mjs`, fuori dal mio mandato di sola lettura). Controllare inoltre che `assets/source/cgtrader-soccer-player` (19 file tracciati in git, incl. `originals/*.fbx`, `TEXTURES.zip`) possa essere distribuito: la **licenza** del modello acquistato non l'ho letta → «Non posso confermarlo».
6. **Donazione PayPal** (`DONATION_URL="https://paypal.me/elevoraCPM"`, `src/07-versione-save-interviste.jsx:64`, bottone «☕ Sostieni il progetto» in `src/18-career-app.jsx:12141`, presente nella build store). La pagina Google «Payments» (answer/9858738, letta oggi) vieta di indirizzare gli utenti a un metodo di pagamento diverso da Google Play Billing; l'esenzione che ho letto cita le **«tax exempt donations»**, e non chiarisce il caso di mance a uno sviluppatore individuale. **Non posso confermare** che il bottone sia ammesso → rischio di rifiuto in revisione. Opzioni: toglierlo dalla build store (`DONATION_URL=""` nasconde il bottone, secondo il codice) o chiedere conferma al supporto Play.
7. **Test su dispositivo reale** (avvio, fps, memoria, WebView datata): mai fatto (1.11). La build è 194–336 MB e usa Three.js r128 + GLB: **rischio concreto** su telefoni di fascia bassa; nessun dato misurato.

## 5. Requisiti Google Play Console (pagine lette il 07/11/2026)

| Argomento | Cosa dice la fonte | Fonte (letta 07/11/2026) |
|---|---|---|
| Target API | Dal **31/08/2026** nuove app e aggiornamenti: **Android 16 (API 36) o superiore** (Wear/Auto: 35; TV/XR: 34). Proroga fino al 01/11/2026 su richiesta (scaduta). App esistenti: API 35 per restare visibili ai nuovi utenti su OS più recenti | https://developer.android.com/google/play/requirements/target-sdk |
| Livello API minimo (minSdk) | Google non impone un minSdk per le app normali nelle pagine lette; le app >1 GB richiedono minSdk ≥21. Il minSdk lo decide il template Capacitor (22/23/24 a seconda della versione) | https://support.google.com/googleplay/android-developer/answer/9859372 · pacchetti npm Capacitor |
| Formato AAB | La pagina «Manage your app and app bundles» descrive upload di un app bundle per release; il frammento letto **non dice esplicitamente «obbligatorio»** → «Non posso confermare» il testo letterale (PACKAGING.md lo dà per obbligatorio dal 2021: non verificato oggi) | https://support.google.com/googleplay/android-developer/answer/9859152 |
| Firma | «Android requires that all apps be digitally signed…»; si può usare chiave generata da Google (Play App Signing) o propria | stessa pagina |
| Dimensioni | Base module **500 MB** compressi; asset pack 1,5 GB; totale install-time 4 GB; sopra 200 MB avviso non bloccante su rete mobile; APK legacy 100 MB | https://support.google.com/googleplay/android-developer/answer/9859372 |
| Testi scheda | Titolo **30**, descrizione breve **80**, completa **4.000** caratteri | https://support.google.com/googleplay/android-developer/answer/9859152 |
| Icona | PNG 32 bit con alfa, **512×512**, max **1024 KB** | https://support.google.com/googleplay/android-developer/answer/9866151 |
| Feature graphic | JPEG o PNG 24 bit senza alfa, **1024×500** | stessa pagina |
| Screenshot | min **2**, max 8 per tipo di dispositivo; JPEG/PNG 24 bit senza alfa; lato 320–3840 px, lato lungo ≤2× il corto | stessa pagina |
| Classificazione contenuti (IARC) | La pagina answer/9859751 non tratta il questionario: **«Non posso confermarlo»** da fonte ufficiale. Per `Pubblicare` la Console mostra gli errori da risolvere | https://support.google.com/googleplay/android-developer/answer/9859751 |
| Data Safety | «All developers that have an app published on Google Play must complete the Data safety form» (esclusi test interni, servizi di sistema, app private); da compilare **anche se non si raccolgono dati**; il trattamento solo locale non va dichiarato come raccolta. Pagina aggiornata 05/12/2023 | https://support.google.com/googleplay/android-developer/answer/10787469 |
| Informativa privacy | Link obbligatorio **nella scheda e nell'app**, anche senza dati personali; URL pubblico http/https | https://support.google.com/googleplay/android-developer/answer/9859455 (letto: contenuto sul link nell'app) |
| Pubblico di destinazione | Dichiarazione obbligatoria (App content → Target audience and content) per nuove app e aggiornamenti, dopo aver dichiarato annunci/accesso e inserito la privacy policy; la dichiarazione errata può portare a rimozione/sospensione (sintesi da ricerca web su answer/9285070 e 9893335: **non letta direttamente la pagina**) | https://support.google.com/googleplay/android-developer/answer/9285070 |
| Test chiuso (account personali nuovi) | Account personali creati dopo il **13/11/2023**: closed test con **≥12 tester iscritti ininterrottamente per ≥14 giorni**; 14 giorni consecutivi (se un tester esce e rientra il conteggio riparte) | https://support.google.com/googleplay/android-developer/answer/14151465 |
| Pagamenti | vietato guidare verso metodi di pagamento diversi da Google Play Billing; eccezioni per «tax exempt donations» e programmi di fatturazione alternativa | https://support.google.com/googleplay/android-developer/answer/9858738 |
| Verifica identità, tempi di revisione | Solo fonti terze (blog): revisione dell'accesso alla produzione «di solito entro 7 giorni», identità con documento. **Non confermato da Google → «Non posso confermarlo»** | ricerca web, nessuna pagina ufficiale letta |

## 6. Tabella requisito · stato · prova · chi

Legenda: **pronto** / **manca** / **da verificare**. «Team» = fattibile da una sessione di lavoro; «PO» = solo il proprietario.

| # | Requisito | Stato | Prova | Chi |
|---|---|---|---|---|
| 1 | Build web offline, senza CDN | pronto | §2 `validate-dist` verde | team |
| 2 | AI spenta, nessuna chiamata esterna | pronto | §3 sonda: `disabled_store_build`, 0 richieste | team |
| 3 | `GAME_VERSION` coerente | pronto | 7.999.183 nel sorgente e nella UI della build | team |
| 4 | Ganci di collaudo non esposti | da verificare | 37 globali `__CPM_*` sempre presenti; `?cpmtest=1&sit=5` attiva scena di prova; rischio basso in app | team (decisione PO se chiuderli) |
| 5 | Peso del pacchetto | **pronto (giro 116)** | dist 348 MB/298 MB compr. → **138 MB/107 MB**; AAB 110 MB (§9) | team |
| 6 | File sorgente del modello 3D nel pacchetto | **pronto nel pacchetto** · licenza da verificare | `assets/source/` fuori da `dist/` e dall'AAB (0 file `assets/source` nel bundle); licenza del modello non letta | PO (licenza) |
| 7 | Guscio Android (progetto `android/`) | **pronto** | `npx cap add android` + `cap sync` eseguiti in sessione (Capacitor 8.6.0); `android/` resta non versionato | team |
| 8 | AAB compilato | **fatto (non firmato)** | `./gradlew bundleRelease` BUILD SUCCESSFUL, `app-release.aab` 109.731.296 byte (§9). Firma: solo PO | team / PO (firma) |
| 9 | Target API 36 | **pronto** | Capacitor `^8.6.0`; manifest fuso della release: `targetSdkVersion="36"` (§9) | team |
| 10 | minSdk | **pronto** | `minSdkVersion="24"` nel manifest fuso (§9) | team |
| 11 | Firma / keystore upload | manca | nessun keystore nel repo; workflow legge i secret | **PO** (crea e custodisce) |
| 12 | Play App Signing | manca | si attiva in Console al primo upload | **PO** |
| 13 | Account sviluppatore Play | da verificare | non so se esista né di che tipo: «Non posso confermarlo» | **PO** |
| 14 | Test chiuso 12 tester / 14 giorni | manca (solo PO) | requisito Google riletto il 07/11/2026; `TESTER_ONBOARDING.md` corretto (`com.korward.elite`, passi dalla pagina answer/14151465) | **PO** (tester) |
| 15 | Icona 512 | **pronto (giro 116)** | `file`: 512×512, 8-bit/color **RGBA**; 25.069 byte (≤1024 KB); generata da `tools/gen-store-graphics.mjs` corretto | team |
| 16 | Feature graphic 1024×500 | pronto | RGB 1024×500 | team |
| 17 | Screenshot ≥2 | pronto (qualità da valutare) | 3 × 1080×1920; catture headless | team / PO per scelta |
| 18 | Testi scheda | pronto | `STORE_LISTING.md`: titolo 30/30, breve 78/80, completa ~1.500/4.000 | PO (approva) |
| 19 | Disclaimer nomi di fantasia | pronto | nella descrizione completa | team |
| 20 | Audit de-branding (0 hit) | **pronto** | `node tools/audit-copyright.mjs` → «OK — nessun riferimento al mondo reale», exit 0 (07/11/2026) | team |
| 21 | Informativa privacy online | pronto | `privacy.html` HTTP 200; data 06/08/2026; email contatto presente | PO (conferma contenuto) |
| 22 | Link privacy anche dentro l'app | **manca nel gioco** | `grep -i privacy src/*.jsx`: 0 occorrenze di un link/URL all'informativa (solo commenti non correlati). Da aggiungere nel pannello Crediti (`Crediti238`, `src/17-menu-creazione-pannelli.jsx`) o in Opzioni, con `privacy.html`; **non aggiunto in questo giro** | team (giro successivo, tocca `src/`) |
| 23 | Data Safety | manca | si compila in Console: «nessun dato raccolto/condiviso» (compatibile con §3); da rivedere se si tiene `INTERNET`/donazione | **PO** |
| 24 | Classificazione contenuti IARC | manca | questionario in Console; atteso PEGI 3 (stima del repo, non verificata) | **PO** |
| 25 | Pubblico di destinazione | manca | dichiarazione in Console | **PO** |
| 26 | Donazione PayPal in app | da verificare | rischio policy pagamenti, §4.6 | **PO** (decide) |
| 27 | Prova su telefono reale | manca | mai misurato (1.11) | **PO** (device) + team |

## 7. Azioni che solo il PO può fare — in ordine, con tempi

Stime del **lavoro del PO**; i tempi di attesa di Google sono quelli che ho potuto o non potuto confermare.

| Ord. | Azione | Tempo PO | Attesa Google |
|---|---|---|---|
| 1 | **Decidere** il percorso di pubblicazione e dire al team: (a) Capacitor 8 con API 36; (b) togliere dalla build `assets/source/`; (c) togliere o tenere il bottone PayPal | 15 min | — |
| 2 | **Verificare la licenza** del modello CGTrader (se si possono distribuire i file sorgente/FBX) | 30 min | — |
| 3 | **Creare/verificare l'account Play Console** (25 $ una tantum secondo i documenti del repo — importo non riletto oggi) con la propria identità e capire se è «personale» o «organizzazione» | 30-60 min | verifica identità/pagamento: **non confermabile** |
| 4 | **Generare il keystore di upload** (`keytool`, comando in `PACKAGING.md`) e custodirlo (una copia fuori dal PC) | 15 min | — |
| 5 | **Inserire i 4 secret** nel repository GitHub (`ANDROID_KEYSTORE_BASE64`, `…_PASSWORD`, `…_KEY_ALIAS`, `…_KEY_PASSWORD`) e, se vuole l'upload automatico, `PLAY_SERVICE_ACCOUNT_JSON` | 20-40 min | — |
| 6 | **Lanciare il workflow «Android AAB»** (dopo i fix del team) e scaricare l'`.aab` | 10 min + durata CI (non misurata) | — |
| 7 | **Creare l'app in Console** e caricare il primo AAB **a mano** (il primo upload è manuale, secondo PACKAGING.md) in un test chiuso | 30-45 min | elaborazione AAB: **non confermabile** |
| 8 | **Compilare le sezioni «App content»**: Data Safety (nessun dato), IARC, pubblico di destinazione, annunci = no, privacy URL `https://antoniovairo-rgb.github.io/Carrier-manager-/privacy.html` | 45-60 min | eventuale revisione Google: **non confermabile** |
| 9 | **Compilare la scheda**: testi di `STORE_LISTING.md`, icona, feature graphic, screenshot | 30-45 min | — |
| 10 | **Reclutare almeno 12 tester** (meglio 15-20) con account Google e Android, mandare il link di opt-in (usare l'ID **corretto** `com.korward.elite`) | 1-2 giorni di solleciti | — |
| 11 | **Tenerli iscritti 14 giorni consecutivi** | 0 (attesa) | **14 giorni minimi** (Google, answer/14151465) |
| 12 | **Richiedere l'accesso alla produzione** in Console | 15 min | **Non posso confermarlo**: una fonte non ufficiale riporta «di solito entro 7 giorni» |
| 13 | **Provare l'app su un telefono Android vero** (anche non di fascia bassa) durante il test chiuso | 1-2 ore | — |
| 14 | **Promuovere a produzione** e pubblicare | 15 min | revisione della prima pubblicazione: **non confermabile** |

**Lettura onesta dei tempi:** se l'account è personale e nuovo, il percorso minimo è ~14 giorni di test + eventuale revisione, più il lavoro tecnico del team (Capacitor/API 36, peso, icona, prima build) di qualche giorno. «Fra 2-3 giorni» è realistico **solo** per arrivare a un **test chiuso/interno**, non alla produzione. Se l'account è di tipo organizzazione, il requisito dei 12 tester potrebbe non applicarsi (**non confermato da fonte ufficiale**).

## 8. Cosa ho e non ho fatto

- Fatto: lettura documenti, `npm install` in `tests/visual`, `build-dist`, `validate-dist`, `gen-store-graphics` (output ripristinato), sonda su `dist/`, lettura di 9 pagine Google, confronto con i default dei pacchetti Capacitor 6/7/8.
- **Non** fatto: `audit-copyright`, `cap add android`, compilazione AAB (SDK assente), prova su dispositivo, lettura diretta della pagina «Target audience» e della pagina IARC.
- Nessuna modifica a `src/`, a `tools/`, a `CARRIER-MANAGER-AV.html`; `dist/` e `node_modules` non versionati.


## 9. Aggiornamento giro 116 (07/11/2026) — parte tecnica di PO-322

Ramo `sviluppo/giro116-store`, base `lavoro/184` = 7.999.183. `src/`, `CARRIER-MANAGER-AV.html` e `GAME_VERSION` non toccati (`check-src` allineato). Nessuna credenziale, nessun account, nulla inviato a Google, nessuna chiave committata.

**9.1 Target API 36.** Passato a Capacitor 8.6.0 (`@capacitor/{cli,android,core}` `^8.6.0`, preferences `^8.0.1`, splash-screen `^8.0.2` — ultime versioni su npm il 07/11/2026). Letto sui pacchetti npm reali: `@capacitor/cli@8.6.0` richiede **Node ≥ 22**; `@capacitor/android@8.6.0` usa **JDK 21** (`VERSION_21`) e default compileSdk 36 / minSdk 24 / targetSdk 36; il template Android del CLI (`variables.gradle`) dà **minSdk 24 · compileSdk 36 · targetSdk 36**, AGP 8.13.0, Gradle 8.14.3. Workflow `android-build.yml`: Node 20→22, JDK 17→21. `PACKAGING.md` e `PLAY_STORE_READINESS.md` aggiornati. Esplicitamente **non** verificato in CI: il workflow non è stato eseguito (nessun push di tag).

**9.2 Pacchetto più leggero.** `tools/build-dist.mjs` esclude `assets/source/`, i `README.md` di `assets/` e 12 file il cui nome non compare in nessun sorgente (5 GLB `hyper-casual-korward-{animated,football,football-black|brown|red}`, `cgtrader-review-lod1/2.glb`, `cgtrader-unreal-axis-…glb`, `cgtrader-ajax-shirt-review.png`, `hero-highlight-portrait-v1.{png,webp}`). I file a nome costruito a runtime (`portraits/`, `avatar-N`, `anim-*`, `hair-colors/`, `korward-regular-*`) restano tutti. Rete di sicurezza: la build fallisce (exit 3) se un `./assets/…` letterale della pagina manca in `dist/`; `CPM_DIST_CON_SORGENTI=1` rimette tutto.

| | file | non compresso | tar.gz |
|---|---|---|---|
| prima (`CPM_DIST_CON_SORGENTI=1`) | 1.117 | 348.187.994 B (332 MB) | 297.577.757 B (284 MB) |
| dopo | 1.089 | 138.093.931 B (132 MB) | 106.587.713 B (102 MB) |

(Il «336 MB / 194 MB» di §3 era `du -sh` in MiB con altro conteggio; qui `du -sb`, byte esatti.) Prova che il gioco gira uguale: `validate-dist` verde prima e dopo (React montato · home · 0 richieste esterne · 0 richieste locali fallite — controllo aggiunto a `validate-dist` · 0 errori console · flag store). Poiché la home carica solo 2 richieste, in più la sonda **`tests/visual/dist-assets-probe.mjs`** (non-gate) gioca una partita vera sul sorgente a GLB acceso (70 s, autoplay): **45 asset richiesti, 45 presenti in dist, 0 mancanti**. Limite: una partita, non ogni scena.

**9.3 Icona.** `tools/gen-store-graphics.mjs` ora scrive `play-icon-512.png` come PNG RGBA (re-encode a colour type 6, alfa 255): 512×512, 8-bit RGBA, 25.069 B. Visivamente verificata. `feature-graphic.png` non modificata (RGB 1024×500, come richiesto).

**9.4 Tester.** `TESTER_ONBOARDING.md`: ID `com.korward.elite`, nome app «Korward Elite», passi del test chiuso dalla pagina Google answer/14151465, **riletta il 07/11/2026** (la pagina non riporta una data di aggiornamento; mostra «©2026 Google»; dice 12 tester · 14 giorni consecutivi · «Apply for production» con tre sezioni · «Review usually takes seven days or less»; non descrive i click per aggiungere i tester).

**9.5 Audit copyright:** 0 hit, exit 0.

**9.6 Privacy in app:** assente (riga 22 tabella). Punto consigliato: pannello Crediti (`Crediti238`) o Opzioni, link a `https://antoniovairo-rgb.github.io/Carrier-manager-/privacy.html`. Non aggiunto.

**9.7 Build AAB — riuscita (non firmata).** Rete: `dl.google.com`, `maven.google.com`, `services.gradle.org`, `plugins.gradle.org` → HTTP 200. Passi: `npm install` (radice e `tests/visual`), `npm run build:web`, `npx cap add android`, `npx cap sync android`, command-line tools Android (`commandlinetools-linux-13114758`) + `platforms;android-36`, `build-tools;36.0.0`, `platform-tools` in `/opt/android-sdk`, `./gradlew bundleRelease`. I primi due tentativi sono falliti per **HTTP 429 «Too Many Requests» da `repo.maven.apache.org`** (limite del proxy di sessione, es. `gson-2.11.0.pom`); il terzo ha completato — «BUILD SUCCESSFUL in 1m». Esito:
- `android/app/build/outputs/bundle/release/app-release.aab` = **109.731.296 byte (105 MB)**, 1.532 voci (146.188.520 B scompattati), 0 voci `assets/source`.
- Manifest fuso della release (`merged_manifest/release`): `package="com.korward.elite"`, **`minSdkVersion="24"`, `targetSdkVersion="36"`**, `versionCode=1` (la CI lo sovrascrive), permesso `INTERNET` presente. Letto dal manifest fuso e non dall'interno dell'AAB: **bundletool** non è stato scaricato (la richiesta di scaricare il jar da GitHub è stata negata dalla sessione) e `aapt2 dump` non legge il manifest in formato proto. Il manifest proto dentro l'AAB deriva da quello fuso, ma «non posso confermarlo» byte per byte.
- AAB **non firmato**, non committato (`android/` è in `.gitignore`); nessuna chiave generata.
- **Nota di peso:** 105 MB di AAB contro i 107 MB di tar.gz della dist: compatibile con il limite Google di 500 MB sul base module (§5); il valore compresso «ufficiale» lo calcola la Console.

**9.8 Verifiche di non-regressione:** `check-src` allineato byte per byte · `validate-dist` verde · `test:logic` 43/43 · `save-compat` 12 pass/0 fail.

## 10. TWA come PLINTO (giro 120, 08/11/2026)

Decisione PO dell'08/11: Korward Elite esce su Google Play **con lo stesso sistema di PLINTO** — una Trusted Web Activity che apre la versione web — invece del pacchetto Capacitor offline, che **resta come riserva** (cartella `android/` generata, workflow `android-build.yml`, invariati). Ramo `sviluppo/giro120-twa`, base `lavoro/184`. `GAME_VERSION` non toccata. Nessuna credenziale, nessun account, nulla inviato a Google, nessuna chiave generata o committata, nessun push fuori da questo repository.

### 10.1 Come è fatto PLINTO (letto, non copiato a memoria)
Fonte: clone pubblico in sola lettura di `antoniovairo-rgb/plinto`, commit `874b6f4` (`add_repo` mi è stato negato dalla sessione; il repository è pubblico e l'ho clonato anonimo, senza scrivere nulla).
- **Niente Bubblewrap, niente workflow AAB.** `android/` è un progetto Gradle scritto a mano: un modulo, nessun codice, l'unica dipendenza è `com.google.androidbrowserhelper:androidbrowserhelper:2.7.3`; AGP 8.9.1, `compileSdk`/`targetSdk` 36, `minSdk` 24, Java 17. Il PO compila in Android Studio (`android/COME-PUBBLICARE.md`). I workflow di PLINTO sono solo `pages.yml` e `verifica.yml`.
- **AndroidManifest**: `appCategory="game"`; `ManageDataLauncherActivity` dichiarata (senza, l'app moriva all'avvio — difetto del primo telefono vero); `FILE_PROVIDER_AUTHORITY` + `<provider>` per l'immagine d'avvio (senza, l'app si chiudeva all'avvio); `SCREEN_ORIENTATION=portrait` dichiarato **nel manifest Android** (il manifest web non basta); `DISPLAY_MODE=default` (le versioni con `sticky-immersive` sono state rifiutate in revisione); `DelegationService exported=true`; intent-filter `autoVerify` sull'host **senza percorso**.
- **URL d'avvio** con parametro (`?origine=play`) perché il sito sappia di essere nell'app.
- **Icona adattiva** con primo piano disegnato con margine (la «normale» veniva ritagliata).
- **Tasto Indietro** gestito **in pagina** (`src/ui/useTastoIndietro.js`: voci di cronologia proprie + `popstate`).
- **Manifest web**: `start_url "./"`, `scope "./"`, `display standalone`, `orientation portrait`, icone any + maskable 512.
- **Service worker**: cache col nome della versione (`sw.js?v=<versione>`), guscio precaricato all'installazione, documento in rete per primo, solo stessa origine.
- **assetlinks.json** su `https://antoniovairo-rgb.github.io/.well-known/assetlinks.json` (repository `antoniovairo-rgb.github.io`, con `.nojekyll`). Scaricato oggi: **1 blocco**, `android_app` · `io.github.antoniovairo_rgb.plinto` · **2 impronte** (non riportate). Il dominio è **condiviso**: lo stesso file deve dichiarare anche Korward Elite.

**Cosa riuso:** tutta la struttura del progetto Android (stesse versioni, stesse meta-data, stesse lezioni dei primi giorni), l'URL d'avvio con parametro, l'Indietro in pagina, il service worker con cache per versione. **In più rispetto a PLINTO:** `pathPrefix /Carrier-manager-/` sull'intent-filter (dominio condiviso), un workflow CI per l'AAB, un guardiano della modalità app.

### 10.2 Dove sta la versione web
`https://antoniovairo-rgb.github.io/Carrier-manager-/` → HTTP 200, 6.684.828 byte: è la build precompilata `dist-web/index.html` (stessa di `CARRIER-MANAGER-AV.html`, che il deploy copia identica). La TWA apre **`https://antoniovairo-rgb.github.io/Carrier-manager-/?app=twa`**. `manifest.webmanifest` e `sw.js` rispondono 200.

### 10.3 Cosa è pronto (in questo ramo)
| cosa | dove | stato |
|---|---|---|
| Progetto Android TWA | `twa/android/` | **compila**: `gradle bundleRelease` → `app-release.aab` **3.798.657 byte** (contro 105 MB del Capacitor), **non firmato**. Manifest fuso: `com.korward.elite`, minSdk 24, **targetSdk 36**, `appCategory=game`, versionCode 2000, versionName 7.999.184. Primo tentativo fallito per **HTTP 429 «Too Many Requests» da `repo.maven.apache.org`** (`groovy-3.0.22.pom`, limite del proxy di sessione), secondo riuscito. AAB non committato. |
| Manifest web dedicato | `twa/manifest-twa.webmanifest` (pubblicato in `/Carrier-manager-/twa/` dal deploy) | `start_url /Carrier-manager-/?app=twa`, scope `/Carrier-manager-/`, standalone, verticale, colori TINTE `#0d0f14`, icone 192/512 any + 192/512 maskable |
| Config Bubblewrap equivalente | `twa/twa-manifest.json` | alternativa documentata (packageId, host, startUrl, colori, firma con percorso **fuori dal repo**); non usata per la build |
| Workflow AAB | `.github/workflows/twa-build.yml` | manuale o tag `twa-v*`; versionCode = 2000 + corsa; firma coi **4 segreti già previsti** per Capacitor (stessa app, stessa chiave di caricamento); senza segreti → AAB non firmato. **Non eseguito in CI** (nessun tag, nessun avvio manuale da qui). |
| Modalità app nel gioco | `src/00-head.html`, `src/18`, `src/19`, `src/17` | `?app=twa` o referrer `android-app://com.korward.elite` → `__CPM_STORE_BUILD=true` (AI spenta, campo chiave nascosto), PayPal resta, Indietro gestito; rosso `__CPM_NO_G120`; guardiano **`twa-120` 12/12** |
| Apertura senza rete | `sw.js`, `src/00-head.html` | seconda apertura offline **ora monta** (prima: «This site can't be reached»); sonda `sw-cache-120` verde + rosso |

**Difetti dei primi giorni di PLINTO, uno per uno:**
| difetto PLINTO | qui |
|---|---|
| blocco all'avvio | `ManageDataLauncherActivity` + `FILE_PROVIDER_AUTHORITY`/`<provider>` presenti (verificato nel manifest fuso). Prova su telefono: **non posso confermarla da qui** |
| icona ritagliata dalla maschera | primo piano adattivo da `resources/icon-foreground.png`: disegno entro il **28%** del lato dal centro, dentro il cerchio visibile del 33%. L'icona maskable del sito arriva al **34%**: come primo piano sarebbe stata ritagliata (misura sui pixel) |
| barra dell'indirizzo visibile | dipende **solo** da `assetlinks.json` con l'impronta di Play App Signing → **manca, la può fare solo il PO** (10.5) |
| Indietro che chiude l'app | gestito in pagina: da una scheda → Home della carriera, riquadri si chiudono, in partita/provini/offerte non succede niente, dalla Home la pressione successiva esce (guardiano `twa-120`) |
| schermata iniziale che scorre | `html,body{overflow:hidden}` già nel gioco; scorre solo `.cpm-scroll` con `overscroll-behavior:contain`. `altezza-114` rigiocato. Sul telefono: **non posso confermarlo da qui** |
| orientamento non bloccato | `SCREEN_ORIENTATION=portrait` nel manifest Android + `appCategory=game` (Android 16 ignora il blocco su schermi ≥ 600 dp salvo i giochi; se l'eccezione valga per la finestra di Chrome **non posso confermarlo** — PLINTO dice lo stesso). Il gioco regge comunque l'orizzontale su tablet (formato `tabo` delle sonde c178) |

### 10.4 Primo avvio e rete (sonda `sw-cache-120`, build del sito servita in locale)
- Primo avvio con intro, 25 s: **63,0 MB** (GLB 39,6 · pagina 12,8 · immagini 10,6); col service worker di prima **56,0 MB**. I +7 MB sono la pagina riletta per metterla in cache. Il server locale non manda intestazioni di cache: su GitHub Pages (che ne manda) la rilettura può venire dalla cache HTTP del browser — **non posso confermare il numero reale**.
- **Prima:** seconda apertura senza rete → **non monta**. **Ora:** seconda e terza apertura senza rete montano, **0 file persi**.
- ⚠️ Strategia invariata **network-first**: con la rete ogni apertura ricontrolla tutto (in locale, senza intestazioni di cache, la seconda visita ha riscaricato 56 MB in entrambi i bracci — limite superiore, non misura del sito vero).

### 10.5 PROPOSTA per la madre: `assetlinks.json` (repository `antoniovairo-rgb.github.io`, NON toccato)
Il file vive su un dominio **condiviso con PLINTO**: si **aggiunge** un blocco, il blocco di PLINTO resta identico (stesse 2 impronte, da non toccare). Contenuto proposto per `.well-known/assetlinks.json`:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "io.github.antoniovairo_rgb.plinto",
      "sha256_cert_fingerprints": ["<IMPRONTA PLINTO 1, invariata>", "<IMPRONTA PLINTO 2, invariata>"]
    }
  },
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.korward.elite",
      "sha256_cert_fingerprints": [
        "IMPRONTA-SHA-256-DI-PLAY-APP-SIGNING-DI-com.korward.elite"
      ]
    }
  }
]
```
- L'impronta la legge **solo il PO**: Play Console → app Korward Elite → *Integrità dell'app* (Configurazione) → **certificato della chiave di firma dell'app**, SHA-256. **Non** quella di caricamento: con Play App Signing la firma vera la mette Google (lezione PLINTO, `COME-PUBBLICARE.md` passo 3).
- Per provare un APK firmato in locale prima dello store, si può aggiungere nella stessa lista anche l'impronta della chiave di caricamento.
- Il repository radice deve avere `.nojekyll` (o `_config.yml` con `include: [".well-known"]`, come fa PLINTO in `sito-radice/`).
- Nota per la madre su PLINTO (nessuna azione da qui): l'intent-filter di PLINTO non ha percorso, quindi un link a `…/Carrier-manager-/` sul telefono può proporre anche PLINTO. Nel prossimo pacchetto di PLINTO un `pathPrefix="/Plinto/"` lo evita.

### 10.6 Cosa manca, e chi
| # | cosa | chi |
|---|---|---|
| 1 | Chiave di caricamento (una sola per `com.korward.elite`: se il PO ne ha già una per il Capacitor, **la stessa**) + 4 segreti GitHub, oppure firma in Android Studio aprendo `twa/android` | **PO** |
| 2 | Creare l'app in Console, caricare il primo AAB della TWA a mano (test interno, poi test chiuso 12 tester · 14 giorni) | **PO** |
| 3 | Leggere l'impronta SHA-256 di Play App Signing | **PO** |
| 4 | Pubblicare il blocco di 10.5 in `antoniovairo-rgb.github.io` | madre / PO |
| 5 | Promuovere questo ramo su `main` (serve perché il sito pubblichi la modalità app, il service worker nuovo e `twa/manifest-twa.webmanifest`) | madre |
| 6 | Prova su telefono vero: avvio, icona, niente barra, Indietro, verticale, apertura senza rete | **PO** |
| 7 | Scheda Data Safety: la TWA non raccoglie dati, ma il **sito** è caricato dalla rete (GitHub Pages): da rileggere con la privacy policy | **PO** |
