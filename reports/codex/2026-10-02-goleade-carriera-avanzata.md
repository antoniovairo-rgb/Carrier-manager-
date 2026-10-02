# PO-190 — goleade in carriera avanzata, checkpoint

Base: `origin/main` 8cef5317, `GAME_VERSION="7.999.112"`. **Non ci sono ancora tre carriere naturali misurate** sulla nuova base. I 2,51–3,39 GB liberi osservati durante la preparazione erano sotto la soglia di 3,5 GB per avviare Chromium. I valori del PO (stagione 12, 2,90 GF/partita, 48 gol dell'eroe) sono il motivo del collaudo, non un risultato di questa sonda.

Ho preparato `tests/codex/goleade-carriera-avanzata.mjs` per creare tre attaccanti dal percorso UI senza iniettare salvataggi o attributi iniziali, superare i provini e conservare a ogni passo salvataggio, stagione, settimana, stato del contratto, classifica e cronologia delle partite. Il comando di avvio è:

```powershell
$env:CPM_SEEDS='0,1,2'; node tests/codex/goleade-carriera-avanzata.mjs
```

Il percorso UI dopo le offerte e le stagioni ≥6 è **non verificato** sulla 7.999.112. La sonda, allo stato attuale, registra solo il percorso simulato; manca ancora il braccio di partita vissuta con `__CPM_CAREER.playMatch()` e gli eventi `__CPM_EV()`. Quindi gol per fonte, quota dell'eroe, partite con 6+ gol e scarti ≥5 sono **non verificati**. Le medie non verranno stimate finché non sarà chiara, nei record, la prospettiva casa/trasferta del club dell'eroe. Eventuali riferimenti al calcio reale richiederanno una fonte verificata nel rapporto finale.
