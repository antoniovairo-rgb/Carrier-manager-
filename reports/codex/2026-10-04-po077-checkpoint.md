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

### Velocità del cross e passi del pallone, scena 64

Dai campioni ogni 50 ms nel medesimo grezzo ho calcolato la distanza 3D fra le posizioni a contatto−200 ms, contatto e contatto+200 ms. Conversione del campo logico: `x` mondiale = `ball.x−50`, `z` mondiale = `(ball.y−50)×0,68`, `y` = `ball.worldY`; è la conversione del gioco in `src/12-three-match-view.jsx:248` e l'inverso del testimone `__CPM_BALL` alla riga 2701. Velocità qui = distanza fra gli estremi / 0,2 s, quindi media nell'intervallo, non velocità istantanea. Riproduzione dal grezzo: per ogni `run.valid`, prendere `contactWitness.ms` e `samples` ai tre tempi indicati, applicare questa conversione e la distanza euclidea.

| Esito/giro | Prima (u/s) | Dopo (u/s) | Dopo/prima | Passi >2 u/50 ms fino al contatto |
| --- | ---: | ---: | ---: | ---: |
| success 0 | 7,67 | 3,77 | 0,49 | 9 |
| success 1 | 7,32 | 3,86 | 0,53 | 8 |
| success 2 | 9,08 | 3,36 | 0,37 | 9 |
| fail 0 | 7,89 | 4,04 | 0,51 | 5 |
| fail 1 | 7,32 | 3,85 | 0,53 | 8 |
| fail 2 | 8,89 | 3,40 | 0,38 | 10 |

Il rapporto minimo è 0,37: in questi sei casi **non** è misurato un rallentamento sotto il 30% della velocità precedente. I passi sopra 2 u rispettano la regola di segnalazione della scheda, ma alcuni sono consecutivi durante il volo veloce del cross (success r0: 1150–1400 ms); una soglia di distanza senza controllo della continuità della velocità non prova da sola un teletrasporto. La classificazione visiva dei salti resta **non verificata**.

### Guardia di memoria per la ripresa

Dopo i sei casi validi, il tentativo successivo è partito con circa 4,01 GiB liberi ed è stato interrotto perché la memoria è scesa sotto 1,8 GiB. La sonda richiede ora 6 GiB liberi prima di ogni pagina GLB e chiude la pagina se scende sotto 3,5 GiB durante il caso. È un margine basato sul calo osservato di oltre 2,2 GiB, non una misura delle prestazioni del gioco. `node --check tests/codex/collaudo-testa-conduzione.mjs` passa; `CPM_KIND=header CPM_GI=86 CPM_BATCH=1 node tests/codex/collaudo-testa-conduzione.mjs` si ferma prima di Chromium con `Pausa: RAM libera sotto 6 GB per la sonda GLB`. Nessun caso gi86 è stato eseguito da questo controllo.

### Soglia aggiornata dal PO e due tentativi della scena 86

Il PO ha sostituito la soglia preventiva di 6 GiB con **3 GiB** il 04/10. La sonda ora controlla 3 GiB prima del caso e ogni 250 ms durante il caso; il valore precedente resta sopra come cronologia del metodo, non come regola attuale. Con circa 4,05 GiB liberi, il tentativo gi86 azione 0 success r0 in modalità SwiftShader è stato interrotto durante `page.goto`, prima di qualunque foto o fotogramma utile (`lowMemory:true`). Un secondo tentativo con `CPM_GPU_MODE=d3d11`, partito sopra 3 GiB, è stato interrotto da `openMatch` prima della scena, sempre con `lowMemory:true`. Entrambi sono `valid:false` nel grezzo e non contano come prove del gesto.

Comandi dalla radice (PowerShell):

```powershell
$env:CPM_KIND='header'; $env:CPM_GI='86'; $env:CPM_BATCH='1'; $env:CPM_ACTIONS='0,1,2'; node tests/codex/collaudo-testa-conduzione.mjs
$env:CPM_GPU_MODE='d3d11'; $env:CPM_KIND='header'; $env:CPM_GI='86'; $env:CPM_BATCH='1'; $env:CPM_ACTIONS='0,1,2'; node tests/codex/collaudo-testa-conduzione.mjs
```

La sonda annota `gpuMode` per i nuovi tentativi; nessuna conclusione su FPS o fedeltà visiva deriva da questi due avvii. La macchina torna sopra 4 GiB dopo la chiusura di Chromium, ma questo non basta a mantenere 3 GiB **durante** il caricamento.
