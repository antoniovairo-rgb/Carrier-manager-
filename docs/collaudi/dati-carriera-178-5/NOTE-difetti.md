# Note di lavoro del collaudo (non e' il rapporto): candidati-difetto con prove, in ordine di scoperta
- N1 ruolo: la creazione mostra «ATTACCANTE» fisso (foto 01). Il ruolo non e' sceglibile; `position:"Attaccante"` e' cablato in src/17 (newPlayerBase). Il gioco da' comunque scene difensive (act.ht='tackle') a un attaccante.
- N2 scelta non registrata: s1w5 hl5 (provino/lega), tocco a 0,22 s dall'apertura del pannello, bottone `disabled=true` al momento del tocco (sceltePronte falso, opacita' 0,45). Rivisto (noto).
- N3 «Contrasto pulito senza fallo» -> FALLO + cartellino meritato (s1w14 hl2, key foul). Nome opzione ≠ esito.
- N4 esito assente su scene di assist (Lancio smarcante / Uno-due / Filtrante): il pannello d'esito non compare mai (esito null, outcome null) ma il punteggio sale (+1). s1w14 hl5, s1w24 hl7, s1w29 hl5, s2w7... (banner senza esito: noto)
- N5 assist del tabellino ≠ scena: s1w24 la scena nomina ORLANDO (min 90 clock), matchHistory.assistLinks.given = Stanco min 83; s2w7 hl4 GAILLARD (62') vs Berger (54'); minuto di Brunet 14' vs 9'.
- N6 dopo il wizard d'apertura il CTA resta «Avvia Stagione — ritiro, raduno e presentazioni» (nessun «Vivi la Settimana») anche con openingPending() vuoto; il testo dei passi dice «riprendi col tasto Avanza» ma il tasto Avanza non esiste. (basso)
- N7 al ricaricamento di un salvataggio dopo una settimana SIMULATA appare «Risultato recuperato: la partita era finita quando l'app si e' chiusa» (da verificare in isolamento).
- N8 salva/ricarica S1->S2: differenze su rival, playedMd, cup, presentedClub (da verificare con la finestra di diff).
