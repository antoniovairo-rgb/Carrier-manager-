# assets/audio/

Cartella predisposta per i **file audio reali** (royalty-free) che in futuro
sostituiranno le sorgenti procedurali del comparto audio (`AudioMgr`).

**Oggi è VUOTA di proposito**: tutti i suoni del gioco sono sintetizzati in
tempo reale via Web Audio API (zero peso, offline, zero copyright). Vedi
`docs/AUDIO_LAYER.md` per l'architettura completa.

## Struttura prevista

```
music/
  menu/      # loop rilassanti dei menu (home/hub)
  career/    # tema della carriera
  awards/    # cerimonie/premi
sfx/
  ui/        # click, hover, popup, conferma, errore, chiusura, tab
  ball/      # calcio, passaggio, cross, testa, stop, contrasto, rete, palo
  crowd/     # boato, ohh, applausi, cori, fischi
  referee/   # fischietto (inizio, fallo, intervallo, finale)
  career/    # firma, convocazione, trofeo, record, livello
  notifications/
```

## Come aggiungere un file reale (senza toccare il codice del sistema)

1. Metti il file (es. `sfx/ball/kick01.ogg`) in questa cartella.
2. Nel catalogo `SFX` di `AudioMgr` (in `CARRIER-MANAGER-AV.html`) cambia la
   voce da `()=>synth(...)` a un descrittore `{url:'assets/audio/sfx/ball/kick01.ogg'}`.
3. L'associazione all'evento resta invariata; `sw.js` va aggiornato per
   cachare i nuovi asset (offline/PWA).

## Boato del GOL con un campione REALE (7.70.0, drop-in a 1 riga)

Il boato del gol (`crowdRoar`) **preferisce un campione reale** se presente.
Passi (nessun'altra modifica al codice):

1. Metti un file royalty-free (Pixabay/Freesound CC0/Kenney) in
   `sfx/crowd/` — es. `goal-roar.ogg` (un boato di stadio di ~3s).
2. In `CARRIER-MANAGER-AV.html`, nel blocco `AudioMgr`, togli il commento alla
   riga del registro `URL_SFX`:
   ```js
   const URL_SFX={ 'crowd.roar':'assets/audio/sfx/crowd/goal-roar.ogg' };
   ```
3. Aggiungi l'URL alla precache di `sw.js` (offline/PWA).

Al primo gesto (`unlock`) il file viene scaricato e decodificato; da lì il gol
suona il **campione reale** invece del synth (fallback automatico al synth se
il file manca o non si decodifica). Registrare l'asset e la sua licenza in un
manifest.

Sorgenti consigliate con licenza compatibile: Pixabay, Freesound (CC0),
OpenGameArt, Kenney. Registrare ogni asset e la sua licenza in un manifest.
