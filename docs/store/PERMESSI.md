# Permessi Android e motivazione

> Giro 236 · PO-322 · 17/11/2026. Fonti: i manifest del repository e le misure dei giri 116/120 (citate). Dove non ho misurato oggi lo scrivo.

## TWA (`twa/android/app/src/main/AndroidManifest.xml`)

| Permesso | Dichiarato da noi | Motivazione |
|---|---|---|
| — | **nessuno** (commento nel manifest: «Nessun permesso: il contenuto lo carica il browser di sistema») | il gioco gira dentro Chrome, che ha già i suoi permessi |

Permessi aggiunti dalla libreria `androidbrowserhelper` 2.7.3 al **manifest fuso**: **non misurati in questo giro** (serve la build,
vedi `PACCHETTO.md`). Da leggere dopo la build in `app/build/intermediates/merged_manifest/release/…/AndroidManifest.xml`, oppure
nella Console (*Esplora app bundle*), prima di compilare la sezione «Sicurezza dei dati».

## Capacitor (`android/` generato)

| Permesso | Fonte | Motivazione |
|---|---|---|
| `android.permission.INTERNET` | manifest fuso della release, **misurato al giro 116** (`USCITA-STORE-184.md` §9.7) | lo mette il modello di progetto di Capacitor. Il gioco nella build store non chiama la rete (AI spenta, 0 richieste esterne: `validate-dist`, `twa-120`); il permesso serve solo ad aprire link esterni (crediti, pagina della privacy, pulsante «Sostieni il progetto») — **da confermare dal PO** se tenerlo |

Plugin usati: `@capacitor/preferences` (salvataggi sul dispositivo), `@capacitor/splash-screen` (schermata d'avvio). Che non aggiungano
permessi l'ho letto solo nei documenti del giro 116: **non posso confermarlo** per le versioni installate oggi.

## Cosa l'app NON chiede (in entrambi i pacchetti)

Posizione, contatti, fotocamera, microfono, archiviazione esterna, identificatore pubblicitario. È la stessa frase di
`privacy.html` §3: se la build fusa mostrasse altro, va corretta la pagina prima della pubblicazione.
