# Collaudo Codex — carriere, fase 1 (PO-153, base per PO-154…157) — 07/10/2026

RUOLO: collaudatore in sola lettura del gioco «Carrier manager» (repo antoniovairo-rgb/Carrier-manager-).

REGOLE
1. Non modifichi il gioco, i test del repository o i documenti. Niente commit, niente push, niente PR. Gli script di prova li tieni nel tuo spazio di lavoro, fuori dal repository; consegni un rapporto testuale con JSON e script allegati.
2. Base fissa: commit `f7026f4fba00ca0b2be81edf1587a5b3949c7502` di main (GAME_VERSION 7.999.148). Resti su questo commit anche se main avanza.
3. Collaudi SOLO la zona G qui sotto: sistemi di carriera (stagioni, offerte, impulsi ed eventi, Nazionale, difficoltà, economia e Ufficio).
4. Fuori perimetro, senza giudizio: tutto ciò che accade DENTRO una partita (highlight, gesti, camera, esiti dell'eroe, scene generate dal motore, difesa 3D). Il team ci sta lavorando. Se le carriere girano con partite simulate, usale; se noti qualcosa nelle partite, una sola riga in «Fuori perimetro».
5. Ogni rilievo deve essere riproducibile: seme, salvataggio o profilo di partenza, stagione e settimana, valori, file:riga se citi codice. Ciò che non puoi confermare lo scrivi come «Non posso confermarlo». Un campione sotto il minimo si dichiara.
6. Nessuna proposta di correzione: al più un'ipotesi sull'origine, marcata come ipotesi.
7. Dichiara in testa browser e versione; se usi il fallback Chrome dell'harness, scrivilo (risultati esplorativi). Pagina nuova per ogni carriera.

ZONA G — PO-153, completare la fase 1 delle carriere
Nel tuo rapporto del 01/10 (su 7.999.86) le carriere erano 14 × 10 stagioni, sotto il minimo di 30. Le correzioni nate da quel rapporto (fine prestito `parentClub`, lega del club dopo prestito e promozione) sono in questa base.

1. Campione: almeno 30 carriere × 10 stagioni sulla base fissa. Copri tutti i ruoli, portiere e difensore compresi.
2. Percorso naturale: almeno 10 carriere create dalla creazione normale (nessun valore iniettato). Per le altre dichiara cosa è sintetico.
3. 6 carriere fino al ritiro: 2 deboli, 2 medie, 2 forti.
4. 20 coppie biforcate: stesso salvataggio, una scelta diversa (intervista, offerta, investimento), poi 2 stagioni. Registra cosa cambia: morale, fiducia, popolarità, offerte, ruolo in rosa, eventi.
5. Gemelli economici: 5 coppie, una con staff, accademia e investimenti attivi e una senza. Confronta OVR, infortuni, popolarità e conto a fine 5 stagioni.
6. Impulsi ed eventi (PO-154): per ogni impulso o evento mostrato registra id, condizione dichiarata (se c'è), stagione e settimana, e se si ripete. Conta quanti si ripetono identici, quanti non hanno condizione, quanti hanno conseguenze visibili.
7. Nazionale (PO-155): età e OVR alla prima convocazione, presenze per stagione, convocazioni con OVR alto e 0 presenze. Dichiara se usi `__CPM_SIM_NAT=1`.
8. Difficoltà (PO-156), per fascia d'età (gavetta 17-20, affermazione 21-25, élite 26-30, declino 31+): voto medio, gol più assist per partita, titolare in %, trofei. Indica quante carriere diventano «dominanti» e quando.
9. Economia e Ufficio (PO-157): per ogni voce dell'Ufficio dichiara se ha un effetto misurabile entro 2 stagioni (sì / no / non verificato) e quali voci non vengono mai usate.
10. Ricontrolli sulle carriere nuove:
   - errori JS (atteso 0);
   - scarti fra gol fatti e gol subiti nella stessa lega (atteso 0; se li trovi, prima settimana e squadre);
   - partite rigiocate (atteso 0).

FORMATO DEL RAPPORTO
- Intestazione: commit, GAME_VERSION, data, browser e versione, campione effettivo.
- Una sezione per ciascun punto 1-10, con tabella e le 3 osservazioni più importanti.
- Confronto con il rapporto del 01/10: cosa è cambiato, cosa no.
- «Fuori perimetro»: solo un elenco.
- Chiusura: zona G CHIUSO oppure NON CHIUSO, con il motivo in una riga. Il team interviene sui sistemi di carriera solo dopo il CHIUSO.
