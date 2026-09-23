# Consegna a Claude Code — continuazione POC Character System

Stato del 22/09/2026, 22:38 Europe/Rome. Lavorare esclusivamente sul branch `poc/marioprada-character-system`. Non modificare, fondere o pubblicare `main`; la GitHub Pages ufficiale usa `main` e non e' una preview del POC. Non dichiarare il sistema completo finche' i gate animazione, sincronismo palla, transizioni e performance mobile non sono superati.

## Stato e fatti verificati

- Base 3D: Soccer Player – Rigged Low-poly 3D model di Hisenberg (CGTrader), pacchetto acquistato. CH38 e Quaternius sono esclusi. Il ramo contiene LOD, rig, clip retargettate e materiali di review; usare solo clip e asset approvati.
- Il sorgente `CARRIER-MANAGER-AV.html` e' stato ripristinato dopo una corruzione locale. La copia di recupero `tests/character-lab/recovery/2026-09-22-source-recovery/CARRIER-MANAGER-AV.compacted-before-recovery.html` contiene funzionalita' non presenti nel sorgente attuale; **non sostituire** il file attuale con la copia compattata. Estrarre e verificare modifiche selezionate.
- La review `cgtrader-highlight-optimized` e' riconosciuta dal sorgente attuale, ma non rende piu' solo cinque corpi, non carica il trio LOD0/1/2 e non espone `__CPM_CGTRADER_CINEMA_ROSTER`/`__CPM_CGTRADER_RENDER_BUDGET`. Nel browser headless della situazione difensiva 33 compare `corpi pieni` a 1–2 FPS. Questo e' un FAIL del provino locale, **non** un valore mobile.
- `tests/character-lab/keeper-catch-sequence-review.mjs` apre deterministicamente `Muro in area` (indice 33) e trova `Chiama il portiere` (terza azione). Va ripetuto dopo il ripristino del roster ottimizzato; le schermate attuali non certificano mani-palla o possesso dopo la presa.
- In `CARRIER-MANAGER-AV.html` la presa alta approvata e' `gk-high-catch`; `gk-dive` e `gk-block` non sono nel package attivo e non vanno promosse senza retarget e verifica. La traiettoria `gkClaim` converge nell'ultimo tratto verso il punto medio delle mani CGTrader, ma il contatto non e' ancora validato su una sequenza animata.
- I 40 ritratti 2D e il mock-up figurina 5:7 esistono; l'integrazione runtime dei ritratti e' attualmente assente. Contratto completo in `tests/character-lab/FIGURINE_MERGE_HANDOFF.md`. Il target 1000 volti e' aperto.

## Ordine di lavoro per un merge credibile

1. Ricostruire **solo sul branch POC** la review ottimizzata dalla copia di recupero: caricamento LOD0/1/2, Hero LOD0, contesto attivo (portiere + tre giocatori), altri attori fuori rendering/skinning dell'highlight, budget pixel ratio/ombre e telemetria del roster. Verificare che il gioco normale non cambi.
2. Ripetere il test deterministico della presa con CGTrader realmente pronto; catturare apertura, contatto e recupero. Verificare corpo/braccia, distanza palla-mani, possesso finale, assenza di T-pose e direzione porta.
3. Eseguire lo stesso controllo per dribbling, passaggio e tiro; non assumere che un fermo immagine o la presenza della clip equivalgano a gesto superato. Ogni gesto deve coinvolgere postura, braccia, piede d'appoggio, impatto, follow-through e transizione.
4. Riesaminare kit e dimensioni in camera, poi misurare FPS/frame time/memoria su un telefono reale. Le precedenti misure dell'utente 11–16 FPS sono un FAIL aperto. Un FPS desktop non chiude il gate mobile.
5. Reintegrare le figurine seguendo il loro handoff, mantenendo i dati di identita' nel gioco e il ritratto stabile fra tutte le scene. Questo e' lavoro separato dalle clip 3D e non deve aumentare il costo WebGL del match.

## Confini di sicurezza

Non includere nel merge ZIP di ricerca, backup `.blend1`, trial Human Generator, asset rifiutati o file scaricati non verificati. Il branch di salvataggio contiene prove e documenti: selezionare soltanto asset runtime e sorgenti necessari al prodotto finale. Non modificare il Match Engine per risolvere un difetto della regia 3D senza una riproduzione causale. Conservare la distinzione fra test locali, ipotesi e gate superati nella roadmap `tests/character-lab/POC_ROADMAP.md (pagina corta; storico in POC_STORICO.md)`.
