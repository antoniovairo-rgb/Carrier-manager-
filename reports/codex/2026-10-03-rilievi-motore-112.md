# Ricontrollo dei rilievi 26-A e 27-A — motore CPM 7.999.112

Base letta da `src/07-versione-save-interviste.jsx`: `GAME_VERSION="7.999.112"`. Commit di partenza: `c6f68eab036372aaf4988158d6ab7f7ef8ddac34`. Il controllo è isolato nel motore, senza browser e senza modifiche al gioco. Comando completo dalla radice del repository: `node --check tests/codex/rilievi-motore-112.mjs; node tests/codex/rilievi-motore-112.mjs`. Dati per seme: `tests/codex/rilievi-motore-112.json`.

| Rilievo | Campione e risultato misurato | Conclusione e limite |
| --- | --- | --- |
| 26-A, ricevente del cross | 100 semi con corner sintetico: 42 occasioni con origine destinate all'eroe; in **42/42** `cast.ricevente` coincide con il battitore, in **0/42** con l'eroe, mentre in **42/42** l'evento `cross.a` indica l'eroe. | La discordanza dei dati del motore persiste sulla 7.999.112. Il corpo che anima il cross nel 3D e l'effetto visibile sono **non verificati**. |
| 27-A, punizione diretta | 100 semi per braccio, punizione sintetica centrale `(85,50)`: ramo attivo **100/100** `occasione_eroe` prima della battuta e **0/100** battute; con `__CPM_NO_PIAZ27=1`, **100/100** battute, di cui **45/100** tiri diretti. | L'ordine della decisione nel motore persiste sulla 7.999.112. La frequenza e la coerenza della scheda in partite naturali sono **non verificate**. |

Il campione ripete i parametri delle sonde del rapporto `reports/codex/2026-10-01-rilievi-26-27.md` sulla 7.999.96. I risultati coincidono numericamente con quel banco, ma non dimostrano che il giocatore veda un difetto. Le due prove restano separate dal ricollaudo grafico e non chiudono gli altri quattro rilievi.
