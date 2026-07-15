# assets/audio/sfx/crowd/ — boato del gol (drop-in)

Metti qui il file del **boato della folla al gol** e il gioco lo userà
automaticamente al posto del suono sintetizzato. **Nessuna modifica al codice.**

## Cosa fare (1 passo)

1. Scarica un boato di stadio che ti piace (puoi ascoltarlo prima) da una fonte
   con licenza chiara — es. **Pixabay** o **Mixkit** (royalty-free) o **Freesound**
   (filtra su **CC0**). Durata consigliata ~**2–4 secondi**, un vero *boato + esultanza*.
2. Rinominalo **`goal-roar.ogg`** (oppure `goal-roar.mp3` / `goal-roar.wav`) e
   caricalo in **questa cartella** (`assets/audio/sfx/crowd/`).
   - Da GitHub web: apri questa cartella → **Add file → Upload files** → trascina il file.
3. Fatto. Al primo gol dopo il caricamento suonerà il **campione reale**.

## Come funziona

- Il registro `URL_SFX['crowd.roar']` (in `CARRIER-MANAGER-AV.html`, blocco `AudioMgr`)
  è già puntato a `goal-roar.ogg|mp3|wav` in questa cartella.
- Al primo gesto dell'utente il file viene scaricato e decodificato; se c'è, il boato
  del gol usa **quello**; se manca, si ricade automaticamente sul synth (com'è ora).
- Il **service worker** cachea il file al primo caricamento riuscito → funziona anche
  **offline** (nessuna modifica a `sw.js` necessaria).

## Licenza

Registra sempre **fonte + licenza** del file che carichi (per il rilascio store).
Consigliato **CC0** (nessuna attribuzione richiesta) o royalty-free con licenza che
consenta l'uso in un'app pubblicata.

## Estendibile

Lo stesso meccanismo vale per altri suoni: aggiungi la voce a `URL_SFX` con l'evento
corrispondente e metti il file nella sottocartella giusta.
