# Collaudo Codex — salvataggio e ricarica (07/10/2026)

RUOLO: collaudatore in sola lettura del gioco «Carrier manager» (repo antoniovairo-rgb/Carrier-manager-).

REGOLE (invariate)
1. Non modifichi codice, test o documenti. Niente commit, niente push, niente PR. Produci solo un rapporto testuale (con foto e JSON allegati se servono).
2. Base fissa: commit `2262940519ae074dc84ddbc4e068453bff79b4e6` di main (GAME_VERSION 7.999.145). Resti su questo commit anche se main avanza.
3. Collaudi SOLO le zone E ed F qui sotto. Tutto il resto è fuori perimetro, senza giudizio. In particolare, il team sta lavorando su:
   - highlight, gesti e camera;
   - esiti dell'eroe;
   - scena generata dal motore;
   - difesa 3D.
   Se noti un difetto fuori perimetro, solo una riga in «Fuori perimetro».
4. Ogni rilievo deve essere riproducibile: salvataggio di partenza, passi esatti, seme, settimana, valori prima e dopo, file:riga se citi codice. Ciò che non puoi confermare lo scrivi come «Non posso confermarlo».
5. Nessuna proposta di correzione. Al più un'ipotesi sull'origine, marcata come ipotesi.
6. Pagina nuova per ogni prova. Dichiara in testa browser e versione; se usi il fallback Chrome dell'harness, scrivilo (risultati esplorativi).

ZONE

E) PO-176 — Che cosa cambia dopo il ricaricamento
   Nel collaudo carriere del 01/10 `playedMd` e `cup.club` cambiavano dopo il ricaricamento (56 confronti su 56). Dalla 7.999.120 rivale e sponsor di club nascono all'accettazione dell'offerta pro, non più alla ricarica.
   Da fare: almeno 10 cicli «salva → ricarica la pagina → confronta» in momenti diversi della carriera:
   - prima e dopo una partita;
   - a metà settimana;
   - dopo un trasferimento o un prestito;
   - in una fase di coppa.
   Per ogni campo che cambia, dì se è una **rigenerazione prevista** (dato derivato e ricalcolato uguale per il giocatore) oppure una **perdita visibile al giocatore** (classifica, calendario, risultati, coppe, contratto, statistiche che cambiano a schermo). Allega i valori prima e dopo.

F) PO-183 — Nessuna partita rigiocata
   Il gioco proponeva di rigiocare una partita già giocata. Dalla 7.999.103 la riproposta documentata è chiusa; va riverificata.
   Da fare: almeno 10 partite in cui il gioco viene interrotto nei momenti delicati, poi riaperto. Momenti da coprire:
   - durante la partita;
   - subito dopo il fischio finale;
   - durante la conferenza o il discorso del mister;
   - con la pagina in background e poi ricaricata.
   Dopo ogni ripresa verifica:
   - che la partita giocata non venga riproposta;
   - che il risultato resti quello giocato;
   - che classifica e calendario avanzino di una sola giornata.

FORMATO DEL RAPPORTO
- Intestazione: commit, GAME_VERSION, data, browser e versione.
- Per ogni zona:
  - campione;
  - esito: «nessun difetto riprodotto» oppure l'elenco dei rilievi, con passi, atteso contro osservato e frequenza;
  - allegati.
- «Fuori perimetro»: solo un elenco.
- Chiusura: per ogni zona CHIUSO oppure NON CHIUSO, con il motivo in una riga. Il team interviene su una zona solo dopo il CHIUSO.
