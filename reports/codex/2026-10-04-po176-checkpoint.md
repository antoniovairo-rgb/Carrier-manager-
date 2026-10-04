# PO-176 — checkpoint ricarica sulla 7.999.122

Base: `9632ef5e389d1f673b8b8c54e3d9c2f8015a1dde`, `GAME_VERSION="7.999.122"`; ramo `codex/2026-10-03-collaudi-7999122`.

Il PO ha fissato il 04/10 la nuova soglia di memoria a 3 GiB. La sonda `tests/codex/salvataggio-ricarica.mjs` ora la controlla prima di Chromium e ogni 250 ms durante il browser, chiudendolo se viene superata verso il basso. `node --check tests/codex/salvataggio-ricarica.mjs` è riuscito.

Comando dalla radice del repository:

```powershell
$env:CPM_SEEDS='0'; node tests/codex/salvataggio-ricarica.mjs
```

Il seme 0 ha eseguito 19 passi, ma la memoria è scesa sotto 3 GiB durante `page.reload`. La pagina è stata chiusa dalla guardia; il tentativo ha stato `failed` e **zero checkpoint prima/dopo**. Il grezzo `tests/codex/salvataggio-ricarica-7999122.json.gz` contiene l'errore esatto e il punto d'arresto. Questo non dimostra una regressione del salvataggio: la differenza dopo ricarica è **non verificata**. I semi 1, 8, 13, 17 e 35 non sono stati avviati in questo lotto.

Sette scatti **prima** della ricarica S1/W10 sono conservati in `reports/codex/salvataggio-ricarica-7999122/`; non esistono gli scatti dopo, quindi non vengono usati per sostenere una differenza visiva.
