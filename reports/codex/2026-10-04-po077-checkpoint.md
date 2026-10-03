# PO-077 — checkpoint colpi di testa sulla 7.999.122

Base verificata: `9632ef5e389d1f673b8b8c54e3d9c2f8015a1dde`, `GAME_VERSION="7.999.122"`. Ramo `codex/2026-10-03-collaudi-7999122`. Questa è una consegna **parziale**, non il verdetto su PO-077.

Comando eseguito dalla radice del repository, ripetuto per i casi rimanenti fino alla guardia di memoria:

```powershell
$env:CPM_KIND='header'; $env:CPM_GI='64,86,90'; $env:CPM_BATCH='1'; $env:CPM_ACTIONS='0,1,2'; node tests/codex/collaudo-testa-conduzione.mjs
```

La sonda usa una pagina nuova per caso, GLB acceso, 412×915, esito verificato tramite `__CPM_TIMELINE()` e sei foto. Il grezzo è `tests/codex/collaudo-testa-7999122.json.gz`; le foto sono in `reports/codex/collaudo-testa-7999122/`. Per il picco, il calcolo qui considera i record del testimone `__CPM_TESTA33.f` con gesto `header` o `header_diving` entro ±1 s dal contatto e prende il massimo `hy`. Il contatto è il minimo `d` degli stessi record, come registrato dalla sonda. I valori non sono una valutazione dei FPS su telefono.

| Scena | Azione | Esito | Giri validi | Distanza minima palla–testa (u), per giro | Differenza contatto–picco stacco (ms), per giro | Foto |
| --- | --- | --- | ---: | --- | --- | --- |
| 64 | `✈️ Testa potente angolato` (indice 0) | success | 3/3 | 0,043; 0,032; 0,032 | 0; 0; 0 | 6 per giro |
| 64 | stessa | fail | 3/3 | 0,032; 0,032; 0,039 | 0; 0; 0 | 6 per giro |

**Misurato:** nei sei casi validi della scena 64 il minimo è sotto la soglia di 0,6 u e il picco calcolato cade nello stesso record del contatto, quindi entro 150 ms. `ActionResolved` coincide con l'esito richiesto. Questo dato **non chiude PO-077** per le altre scene e non misura ancora il rapporto fra velocità del cross prima/dopo il contatto.

**Scarto:** il tentativo successivo, scena 64 azione 1 success r0, è stato interrotto dalla guardia di memoria (`lowMemory:true`, pagina chiusa, nessun frame utile). Rimane nel grezzo con `valid:false` e non entra nella tabella. Le scene 86, 90 e il braccio rosso 171 non sono ancora stati misurati su questa base. La memoria libera dopo la chiusura del browser era 4,088 GiB, ma durante il tentativo scartato è scesa sotto la soglia interna di 1,8 GiB: non è sicuro proseguire in un lotto continuo senza ulteriore margine.
