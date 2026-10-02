# PO-191 — premiazione 3D, checkpoint

Base preparata: `origin/main` 8cef5317, `GAME_VERSION="7.999.112"`. **Nessuna cerimonia misurata**: memoria disponibile 2,51–2,89 GB nei controlli iniziali, inferiore alla soglia di 3,5 GB. Attraversamento del palco, eroe in volo e trofeo davanti al volto sono **non verificati**.

Sonda: `node tests/codex/premiazione-3d.mjs` dalla radice del ramo. Apre una pagina nuova per `kind` `league`, `cup` ed `euro`, aspetta il montaggio dei GLB, forza la premiazione, raccoglie fino a 201 campioni in 10 s nominali e scatta a 0, 2, 5, 8 s. Salva il tempo reale di ogni campione: se la macchina non mantiene 20 Hz, il campionamento effettivo va dichiarato con i dati. Grezzo: `tests/codex/premiazione-3d.json`.

Il codice espone `__CPM_STATE()` per le posizioni dei corpi procedurali, `__CPM_CER476` per eroe/mister/podio/trofeo, `__CPM_FOOT77()` per il piede GLB dell'eroe e `__CPM_GST` per la sua clip. Non espone le ossa dei piedi e la clip di **ogni** compagno: quel confronto è **non verificabile con questi testimoni**, e non verrà sostituito con la posizione della mesh procedurale. Il tipo `league/cup/euro` compare nella logica di `src/12-three-match-view.jsx`; l'accettazione effettiva di ciascun `kind` resta **non verificata** finché la sonda non gira.
