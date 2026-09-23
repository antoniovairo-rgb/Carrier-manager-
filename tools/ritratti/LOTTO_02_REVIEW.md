# Revisione LOTTO-02 — 23 settembre 2026

Sul ramo `poc/marioprada-character-system`, 25 richieste API riuscite hanno prodotto 25 fogli 1024×1024. Da questi sono stati ritagliati 100 WebP 512×512: 93 giocatori e 7 staff. Il manifest conta ora 208 file complessivi, inclusi il pilota e il LOTTO-01. I PNG grezzi sono conservati fuori dal repository in `C:\Users\a.vairo\ritratti-grezzi\lotto-02`.

Verifiche: 100/100 file WebP nel formato e nella dimensione previsti; ID unici, 100/100 maglie neutre, zero copie quasi identiche segnalate dal controllo combinato pHash/colore. Otto fondali sono leggermente grigi secondo la soglia automatica: `ai-0120`, `ai-0126`, `ai-0138`, `ai-0144`, `ai-0158`, `ai-0160`, `ai-0168`, `ai-0200`. Restano nel manifest con `fondaleBianco: false`. La tavola `C:\Users\a.vairo\ritratti-grezzi\lotto-02\anteprima-lotto-02.jpg` è stata esaminata visivamente; non mostra anomalie anatomiche evidenti o copie identiche manifeste alla dimensione dell'anteprima. Una lieve somiglianza tra figurine è accettata dal Product Owner. Il controllo non prova l'unicità biometrica.

I 52 fogli con uso registrato da inizio progetto (2 pilota, 25 LOTTO-01, 25 LOTTO-02) riportano 22.421 token d'ingresso. Ai prezzi pubblicati di `gpt-image-1-mini` medium quadrato, la stima cumulata è **$0,6168**, più un eventuale addebito non verificato del primo tentativo interrotto sul foglio 18 del LOTTO-01. Il billing effettivo e la conversione in euro non sono stati verificati; il budget dell'utente resta €5.

Nessun volto è stato marcato `scartato`. Nessun PNG grezzo, file di gioco, `main` o `assets/portraits/cast-*.jpg` è stato modificato. Il LOTTO-03 resta una bozza fino al controllo preventivo del budget e alla copia del suo JSON in `lotti/`.
