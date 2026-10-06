# Ripresa collaudo Codex — zone ferme (06/10/2026)

RUOLO: collaudatore in sola lettura del gioco «Carrier manager» (repo antoniovairo-rgb/Carrier-manager-).

REGOLE (invariate)
1. Non modifichi codice, test o documenti. Niente commit, niente push, niente PR. Produci solo un rapporto testuale.
2. Resti sullo STESSO commit del primo giro: `6f35d47fcde8579f95f837d0ec589c6d47cbcec5` (GAME_VERSION 7.999.143), anche se main nel frattempo avanza. Così i due giri si sommano.
3. Collaudi SOLO le zone A-D qui sotto. Fuori perimetro, senza giudizio:
   - gesti degli highlight (PO-068);
   - movimento dei reparti (PO-123);
   - brain e manovre (PO-022/030).
   Se noti un difetto fuori perimetro, solo una riga in «Fuori perimetro».
4. Ogni rilievo deve essere riproducibile: passi o comando, partita o scena, istante, atteso contro osservato, frequenza (es. 2 su 30), file:riga se citi codice. Ciò che non puoi confermare lo scrivi come «Non posso confermarlo».
5. Nessuna proposta di correzione. Al più un'ipotesi sull'origine, marcata come ipotesi.
6. Una pagina nuova per ogni partita o scena. Misure sul tempo di scena.
7. Banco: dichiara in testa browser e versione. Se usi di nuovo il fallback Chrome dell'harness al posto del Chromium di Playwright, scrivilo: i numeri restano esplorativi.

COSA MANCA PER CHIUDERE (dal tuo rapporto del 06/10)

A) PO-209/216 — tabellino
   - Almeno altre 5 partite giocate scegliendo le azioni (non autoplay). Per ognuna leggi sempre il tabellino visibile e confrontalo con tabellone e gol del motore. Nel primo giro il tabellino della partita manuale non era stato letto.
   - Una prova VALIDA del testimone `auto216`: prima di dichiararla, dimostra che l'iniezione del disallineamento si è davvero attivata (stato prima e dopo) e che la nota compare in `cpm-bugnotes`. Se non riesci a farla scattare senza toccare il codice, scrivi esattamente dove si ferma e dichiara la prova non eseguibile.

B) PO-048/127 — camera
   - Foto (almeno 6 fotogrammi) attorno al gol della prima esecuzione della #3, dove il punto dei piedi dell'eroe usciva dal quadro (20 fotogrammi su 717). Dì se la SAGOMA è tagliata o fuori quadro, o se esce solo il punto dei piedi.
   - Allarga il campione: almeno 10 esecuzioni forzate su scene diverse (non solo #3 e #74), con esito sia riuscito sia fallito. Riporta i fotogrammi con eroe coperto o tagliato su quelli totali.

C) PO-210 — post-partita
   - Controllo visivo a 360, 375 e 412 px, con fisarmoniche aperte e chiuse: testi tagliati, sovrapposizioni, elementi fuori dal riquadro. Allega le foto di ogni larghezza.

D) PO-203 — piedi nell'esultanza
   - Almeno 5 esultanze su scene diverse. Misura la quota del prato nel punto dei piedi (non lo 0 teorico) e la quota del piede più basso, separando i fotogrammi con la clip `lift` (salto) dagli altri. Un piede è sotto il prato se la sua quota è inferiore a quella del prato.

FORMATO DEL RAPPORTO
- Intestazione: commit, GAME_VERSION, data, browser e versione.
- Per ogni zona A-D:
  - campione;
  - esito: «nessun difetto riprodotto» oppure l'elenco dei rilievi, con passi, atteso contro osservato e frequenza;
  - per ogni foto, il percorso.
- «Fuori perimetro»: solo un elenco.
- Chiusura: per ogni zona scrivi CHIUSO oppure NON CHIUSO, con il motivo in una riga. Il team interviene su una zona solo dopo il CHIUSO.
