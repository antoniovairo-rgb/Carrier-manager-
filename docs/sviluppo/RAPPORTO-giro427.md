# Rapporto giro 427 · PO-690 — audio al primo avvio

Base: `main` (7.999.217). Ramo: `sviluppo/giro427-audio-avvio`. GAME_VERSION e `docs/governo` non toccati.

## La voce del PO
«all'avvio la prima volta del gioco l'audio nella schermata iniziale non è gestibile» (7.999.217).

## Misura (prima della correzione)
Sonda/guardiano `tests/visual/audio-avvio-427.mjs`, pagina vera **senza** `?cpmtest=1` (sotto il banco l'audio è muto per
costruzione), corpi 3D accesi, telefono 390×844 (tocco) e PC 1920×1080. L'AudioContext della pagina è strumentato: ogni sorgente
che parte viene annotata con la schermata e col guadagno del bus generale in quell'istante.

| | Primo avvio (localStorage vuoto) | Avvio successivo (video già visto) |
|---|---|---|
| Prima del primo tocco | 0 contesti audio, 0 suoni (politica di autoplay rispettata) | uguale |
| Primo tocco («Nuova carriera») | si sblocca l'audio: brusio di stadio + un suono sintetico | uguale |
| Creazione | brusio; **nessun comando audio** | uguale |
| Video iniziale | fischio, tiro, rete, boato, applauso (2-3 sorgenti misurate in 12 s); **solo «Salta»** | — |
| Provino (prima della partita) | brusio; **nessun comando audio** | uguale |
| Offerte | brusio; **nessun comando audio** | — |
| Home | solo «Opzioni» nella barra (pannello completo, due tocchi) | uguale |

- **Preferenza «muto» già salvata:** rispettata dal primo suono già prima di questo giro (il bus generale nasce a 0 in
  `AudioMgr.ensureCtx`). Misurato: 6 sorgenti (390) e 7 (1920) fra Home, Creazione e video, **0** col bus aperto.
- Quindi il difetto non è il suono che parte da solo (non parte prima di un tocco), ma che **dopo il primo tocco** in
  Creazione, video, Provino e Offerte non c'era un modo di spegnerlo o regolarlo.

## Correzione (alla fonte, riuso)
- `src/19-app-root.jsx`: `Altoparlante427` = lo **stesso** altoparlante della partita e della serata (giro 172/299: 🔊/🔇,
  area di tocco ≥ 44 px, stessa tinta) che apre lo **stesso** `PannelloAudio172` (Muto + Pubblico/Effetti/Musica → `AudioMgr` →
  `'cpm-audio'`). Nessuna seconda interfaccia, nessun secondo salvataggio, `AudioMgr` non toccato.
- Montato in **Home, Creazione, Offerte** (App), nel **Provino fuori dalla partita** (`provino-pre`/`provino-post`, src/17: nella
  partita del provino resta quello della barra di partita) e nel **video iniziale** (in alto a sinistra, perché a destra c'è «Salta»).
- Nel video, col pannello aperto **la scena si ferma** (orologio e clip), come la partita si mette in pausa col suo pannello; alla
  chiusura riprende da dove era.
- Posizione: in alto a destra; in Home al telefono in alto a **sinistra** (a destra c'è il numero di versione), al PC a destra (a
  sinistra c'è la colonna della barra).
- Rosso `window.__CPM_NO_G427` = nessun tasto, com'era.

## Dopo (misurato)
- Tasto presente, da 44×44 a 49×49 px, dentro lo schermo, non coperto, senza sovrapporsi a comandi
  o testi su tutte le schermate, a 390 e 1920, primo avvio e successivo.
- Nel video: pannello sopra la scena; didascalia identica dopo 6 s col pannello aperto; muto → `cfg.mute=true`, salvato in
  `cpm-audio`, bus generale a 0; 3 suoni partiti dopo il muto, 0 col bus aperto; l'icona diventa 🔇 e resta 🔇 su Provino e Offerte.
- Rosso: 8 controlli bocciati («nessun comando audio» su ogni schermata).

Foto: `docs/collaudo-po/427-prima-*-390.png` (rosso) e `427-dopo-*-{390,1920}.png` (`3b-pannello` = pannello aperto sul video).

## Guardiano
`npm run audio-avvio-427` (verde + rosso, ~5 min), nella riga MAPPA di `src/19` in `ci-runner.mjs`. Rituale:
`node ci-runner.mjs giro audio-avvio-427 primo-avvio-401` → **19/19 verdi** (audio-avvio-427 136 s, primo-avvio-401 53 s + 17 sentinelle, fra cui griglia-mobile, design-system, career-critical, partita-vera, replay, save-compat).

## Non coperto / dichiarato
- Il mixer delle clip del video è fermo col pannello aperto; non ho misurato a occhio la ripresa sul telefono (headless lento).
- L'intensità percepita dei suoni non è misurata (solo il guadagno del bus generale).
- La Home di carriera ha già «Opzioni» nella sua barra: non toccata.

## Dubbi per il PO (la prima opzione è quella applicata)
1. **Dove sta il tasto nelle schermate del primo avvio?**
   a) Altoparlante fisso in alto (destra; sinistra nel video e nella Home al telefono) — *applicata*;
   b) una voce «Audio» nella barra della Home e un tasto in fondo alle altre schermate;
   c) solo un avviso al primo tocco («L'audio è acceso · tocca per spegnerlo»).
2. **Il video iniziale si ferma col pannello aperto?**
   a) Sì, come la partita — *applicata*;
   b) No, continua e si chiude da solo a fine video;
   c) Aprire il pannello chiude il video (come «Salta»).
3. **Primo avvio con audio acceso?**
   a) Acceso come oggi, ma governabile da subito col tasto — *applicata*;
   b) Primo avvio muto, l'audio si accende dal tasto;
   c) Al primo tocco una domanda «Vuoi l'audio?» (Sì/No) che salva la scelta.
4. **Il tasto anche in Home, dove c'è già «Opzioni»?**
   a) Sì, stesso tasto ovunque fuori dalla carriera — *applicata*;
   b) No, in Home basta «Opzioni»;
   c) In Home, «Opzioni» apre direttamente la sezione Audio.
