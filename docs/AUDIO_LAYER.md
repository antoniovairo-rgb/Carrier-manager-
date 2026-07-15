# Comparto Audio — AudioManager (7.62.0)

Report di implementazione del comparto audio richiesto dalla direttiva PO
(«audio professionale, moderno, immersivo, completamente integrato»).

## Scelta architetturale: sorgenti PROCEDURALI + catalogo pronto per asset reali

Il gioco è **single-file, offline, store-ready (Play Store/PWA/Capacitor), zero-copyright**
— gli stessi vincoli per cui stadio e folla sono già **procedurali** (nessun asset 3D pesante).
Il comparto audio segue la stessa filosofia: **tutti i suoni sono sintetizzati in tempo reale
via Web Audio API** (oscillatori + rumore filtrato + inviluppi). Conseguenze:

- **0 KB** di peso store, **0 download**, funziona **offline** garantito;
- **0 rischio copyright** (nessun file di terzi);
- **regia sonora deterministica** e infinitamente variabile.

Il **catalogo è progettato per la sostituzione futura con file reali senza toccare il codice**
(requisito «asset temporanei → file originali»): ogni voce del catalogo può passare da
`{synth: fn}` a `{url: 'assets/audio/…'}` — basta registrare l'URL e associarlo all'evento.

## Architettura (tutto dentro `CARRIER-MANAGER-AV.html`, oggetto globale `AudioMgr`)

Nessun componente suona direttamente: **ogni richiesta passa da `AudioMgr`**.

| Sotto-sistema | Responsabilità |
|---|---|
| **Music** | musica dei menu — pad generativo (3 oscillatori detuned + filtro LFO + arpeggio), **loop perfetto per costruzione** (sintesi continua, mai un sample che riparte). Scene: `home` · `menu` (create/trial) · `career`. Crossfade in fade. |
| **Sfx** | effetti UI (click/nav/back/confirm/error/popup/close), jingle carriera (contratto/trofeo/record/convocazione/milestone/promozione), gala. Variazione anti-ripetizione (`pickVar`). |
| **Ambient (folla)** | letto continuo (rumore filtrato) a volume dinamico + reazioni one-shot (boato gol, ohh su palo/parata/corner, applausi). |
| **Referee** | fischietto parametrico (corto · doppio intervallo · triplice finale) = bandpass noise + FM warble. |
| **Settings** | categorie **INDIPENDENTI** (music · match · sfx · crowd · referee + tel/vibr predisposte) con ON/OFF + volume, master, **mute totale**, persistenza automatica (`safeLS` chiave `cpm-audio`). |
| **Dispatcher** | `AudioMgr.event(e)` mappa gli eventi di gioco → suoni. |
| **Cache/Preload** | no-op per le sorgenti synth (nulla da scaricare); diventa attivo quando si registrano `{url}`. |

## Integrazione NON invasiva (punti di aggancio)

- **Bus eventi (`cpmEmit`)** — 1 riga di fan-out → il dispatcher riceve **tutti** gli eventi
  narrativi: `ActionResolved` (whoosh per tipo d'azione), `CoherenceCheck` (esito palo/parata/
  corner/fuori/fallo/fuorigioco), `GalaCue` (cerimonia).
- **`fireGoalCeleb`** — boato **sincrono all'ingresso in rete** (non alla scelta).
- **45' / fine partita** — fischio d'intervallo / triplice fischio finale.
- **mount/unmount di `LiveMatch`** — crossfade musica-menu ↔ letto-folla.
- **`notify()`** — identità sonora derivata dal tipo di notifica (positivo/negativo/trofeo/info).
- **App `phase`** — musica per schermata (un solo `useEffect`).
- **listener `pointerdown` delegato** — unlock dell'`AudioContext` al **primo gesto** (autoplay
  policy) + click UI su **tutti** i bottoni (un solo listener, nessuna call-site toccata).

## Gate-safe / robustezza

- **No-op silenzioso** sotto `_CPM_TEST`/`_SIT_TEST` (gate headless, determinismo): l'AudioContext
  non viene nemmeno creato → 0 pageerror nel gate.
- **Tutto in try/catch**; l'`AudioContext` nasce **solo al primo gesto** (verificato: 0 context
  prima del gesto, 1 dopo).
- **Cleanup**: gli one-shot si auto-disconnettono a `onended`; il letto-folla e la musica si
  fermano/disconnettono su `exitMatch`/cambio scena.

## Impostazioni & Debug

Card **🎧 Audio** in coda al sotto-tab **Profilo**: slider per categoria + toggle indipendenti +
mute totale + pannello **🐞 Debug audio** (stato ctx/scena/folla + catalogo interamente suonabile a mano).

## Organizzazione asset (per la futura sostituzione)

Struttura prevista (quando si aggiungeranno file reali royalty-free — Pixabay/Freesound/Kenney,
licenze compatibili — cachati da `sw.js`):

```
assets/audio/
  music/   menu/ career/ awards/
  sfx/     ui/ ball/ crowd/ referee/ career/ notifications/
```

Per **aggiungere un suono reale** senza modificare il codice del sistema:
1. metti il file in `assets/audio/<categoria>/`;
2. nel catalogo `SFX` cambia la voce da `()=>synth(...)` a un descrittore `{url:'assets/audio/…'}`
   (loader/preload già predisposti);
3. l'associazione all'evento resta invariata.

## File

- **Modificato**: `CARRIER-MANAGER-AV.html` — blocco `AudioMgr` (~330 righe, dopo `safeLS`),
  componente `AudioSettings`, + 8 righe di aggancio (cpmEmit, fireGoalCeleb, 45', fine partita,
  LiveMatch mount, notify, App phase, click-listener).
- **Creato**: `docs/AUDIO_LAYER.md` (questo), `assets/audio/README.md`.

## QA

- Gate 14/14 (`00001505`, 0 failure) — audio muto sotto test.
- career-invariants OK (0 pageerror).
- Probe real-mode (no cpmtest): AudioContext **0 prima del gesto, 1 dopo**, **0 errori** reali.

## Miglioramenti futuri (non bloccanti)

- Coupling continuo del letto-folla a `momentum`/possesso/minuti finali (oggi event-driven + fasi).
- Suoni dedicati per `week.advance`/training sui 3 path settimanali frammentati.
- Sostituzione progressiva delle voci synth con campioni reali (catalogo già pronto).
- Telecronaca (predisposta: toggle presente, sorgente futura) e vibrazione (già attiva su mobile via `navigator.vibrate`).
