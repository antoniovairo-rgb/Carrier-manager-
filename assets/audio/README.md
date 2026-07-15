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

Sorgenti consigliate con licenza compatibile: Pixabay, Freesound (CC0),
OpenGameArt, Kenney. Registrare ogni asset e la sua licenza in un manifest.
