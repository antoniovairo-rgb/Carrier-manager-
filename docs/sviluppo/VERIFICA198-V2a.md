# Verifica della 7.999.198 — parte V2a

- Ramo: `sviluppo/verifica198-v2a`, partito da `prova/198-finale` (`0f0b13d8`).
- Base di confronto per i rossi: `lavoro/198` (`b3b75b9d`).
- Regole: un controllo alla volta (`CPM_CI_PAR=0`), `CPM_CHROME=/opt/pw-browsers/chromium`, tetto 30 minuti per controllo, nessuna correzione.
- Ambiente: 16 GB di memoria (15,5 GB liberi), 59 GB di disco liberi all'avvio.

| controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|
| esito-282 | VERDE | — | — | 391 s. Braccio verde: 3 scene, esito a schermo 1722/2023/1892 ms, 0 sotto 1200 ms. Braccio rosso visto (3 su 3 sotto 1200 ms). |
| barra-221 | VERDE | — | — | 211 s. Difetti 0, non giudicati 0; i due bracci rossi (`__CPM_NO_G221`, `__CPM_NO_G229`) bocciati come devono. |

Verdetto: in corso.
