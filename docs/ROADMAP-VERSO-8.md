# ROADMAP VERSO LA MEDIA 8 — tutte le dodici aree

**Direttiva del PO, 12/09:** «la roadmap e gli interventi di reingegnerizzazione devono essere completi e
non solo sugli highlight dell'eroe finche' non si arriva almeno alla media di 8».

**Punto di partenza: scorecard n° 15 (build 7.886), media 7,17.**
Il cancello del PO: **media >= 8 con nessuna area sotto 7**. Le dodici aree sommano oggi **86 punti**;
il cancello ne chiede **96**. Servono **+10 punti**, e l'area 11 deve comunque arrivare almeno a 7.

| # | area | oggi | serve | il divario, in una riga |
|---|---|---|---|---|
| 1 | Realismo | 8 | 8-9 | margine sottile: piedi al 64 % e palla a terra al 76 % nei casi peggiori |
| 2 | Credibilita' da attaccante | 7 | 8 | la misura attuale e' un test VUOTO (0/0 casi) |
| 3 | Causalita' | 7 | 8 | nessun difetto aperto, ma neanche una misura che la promuova |
| 4 | Varieta' | 7 | 8 | cross in gioco aperto ZERO su 4 partite RESE |
| 5 | Ritmo | 8 | 8 | in banda 4/4: tenere |
| 6 | Azioni extra-eroe | 7 | 8 | misurata solo come «gol nati / gol mangiati» |
| 7 | Highlight dell'eroe | 8 | 9 | i punti 3 e 4 del piano (esito nel motore, calendario come vincolo) |
| 8 | Telecronaca | 7 | 8 | 2 battute su 4 partite nominavano un gesto assente (7.885+7.887 da ri-misurare) |
| 9 | Interazioni | 7 | 8 | nessuna misura propria: si vota per inerzia |
| 10 | Coerenza fra i sistemi | 8 | 8-9 | rituali verdi: tenere |
| 11 | Immersione | **5** | **7** | **senza strumento valido: tre colonne smontate l'11/09** |
| 12 | Carriera | 7 | 8 | misurata solo come «career-critical exit 0» |

## Il conto, e cosa dice

- **area 11 da 5 a 7** = +2 (obbligatorio: e' il vincolo «nessuna area sotto 7»)
- **sei aree da 7 a 8** (2, 3, 4, 6, 8, 9 oppure 12) = +6
- **area 7 da 8 a 9** = +1 · **area 1 o 10 da 8 a 9** = +1

Totale +10. **Nessuna singola area basta**: e' questo il punto della direttiva del PO. Anche portando
l'area 11 a 10 la media arriverebbe a 7,5.

## Il difetto strutturale che attraversa MEZZA scheda

Sei aree su dodici (2, 3, 6, 9, 11, 12) sono ferme non perche' il gioco sia cattivo, **ma perche' non ho
una misura che possa promuoverle**. Le voto per inerzia, con la riga «invariata». E una scheda dove meta'
delle voci non puo' muoversi non arrivera' mai a 8, qualunque codice io scriva.

**Quindi il primo lavoro della roadmap non e' sul gioco: e' sul metro.** Per ognuna di quelle sei aree
serve una misura che (a) abbia una banda con un fondamento, (b) separi un rosso appaiato da un verde,
(c) non scali con gli fps della mia macchina. Le lezioni di ieri notte dicono esattamente quali trappole
evitare: una banda inventata (lo scarto <= 8u), uno strumento non ripetibile (il banco con Math.random),
un rosso che non puo' essere denso quanto il verde, un cancello che interroga un valore che indovina.

## Le tredici voci di lavoro, in ordine di punti per ora spesa

**A — il metro (senza questo il resto non conta)**
1. **Area 11: un metro che non scali con gli fps.** Smettere di misurare il MOVIMENTO (tutto cio' che
   scala) e misurare cio' che l'occhio vede in un FOTOGRAMMA FERMO: il pallone e' in quadro? quanto e'
   grande in pixel? l'azione dichiarata e' inquadrata? Due di queste esistono gia' (7.862 taglia del
   pallone, 7.865 campo vuoto). **+2, ed e' obbligatorio.**
2. **Area 2: una misura vera.** Oggi «frasi del tiro smentite dal campo» da 0/0, cioe' zero casi. La
   misura giusta esiste gia' al banco: **quota dei tiri dall'area** (17 % → 28 % con la 7.888) e tiri da
   posizione impossibile. Portarla nella scheda. **+1.**
3. **Area 9: una misura propria delle interazioni.** Candidata: l'esito scelto dal giocatore si vede poi
   in campo? (la 7.886 ha tolto le promesse false; manca il controllo positivo). **+1.**
4. **Area 12: oltre l'exit 0.** Il career gira, ma la scheda non misura NULLA della carriera vissuta
   (progressione, minuti, coerenza del calendario). **+1.**
5. **Area 6: oltre «gol nati / gol mangiati».** Le azioni extra-eroe vanno misurate come si misurano
   quelle dell'eroe: nascono da un fatto? sono leggibili? **+1.**
6. **Area 3: la causalita' ha gia' i contatori** (turni causali, contrasto→possesso, decreto→azione→rete)
   ma non una banda dichiarata. Scriverla. **+1.**

**B — il gioco (difetti aperti e misurati)**
7. **Area 4: il cross deve esistere nella partita RESA.** Al banco 0,81 a partita, a schermo ZERO su
   quattro. Prima capire perche' (minuti ambientali consumati dalle scene?), poi rimediare. **+1.**
8. **Area 8: ri-misurare dopo 7.885+7.887** (il cancello ora guarda il gesto vero). Se e' 0 su quattro
   partite, l'8 e' guadagnato. **+1.**
9. **Area 1: alzare i minimi** — palla a terra al 76 % e piedi al 64 % nei casi peggiori. **+1 (a 9).**
10. **Area 7: i punti 3 e 4 del piano** — l'esito eseguito DENTRO il motore con ripresa continua, e il
    calendario come vincolo di frequenza. **+1 (a 9).** ⚠️ Il PO l'ha dichiarato **il cuore del gioco**:
    va fatto, ma non e' il piu' economico.
11. **Area 5 e 10: tenere.** Non regredire e' lavoro anch'esso: ogni versione passa dal rituale completo.
12. **La squadra non sale (nota #44):** ridotta dalla 7.884 (decisioni oltre avanzamento 90 da 11 a 22) e
    dalla 7.888 (tiri dall'area 17 → 28 %), **non chiusa**: il 28 % resta sotto la meta' di una partita
    vera.
13. **Il residuo di strumento:** il container di questa sessione si riavvia ogni 1-3 ore e ha ucciso SEI
    catene. Le misure lunghe vanno spezzate in corse singole.

## La regola che tiene insieme tutto

Nessuna area sale senza: **una banda fondata, un rosso appaiato che la separa, e la stessa sonda per
rosso e verde.** Ieri notte questo metodo ha fatto cadere sei ipotesi sull'area 11, ha fatto revocare due
rimedi (7.879, 7.883 v1) e ha fatto **scendere** una scheda (n° 15, Telecronaca 8 → 7) perche' un voto
era stato preso senza essere guadagnato. La media sale piu' lentamente, ma sale su cose vere.
