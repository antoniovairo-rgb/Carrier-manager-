# Passo 6 — la scena nasce dal motore (PO-022 + PO-030), piano a strati

Decisione PO 07/10: «Passo 6 completo» per chiudere L1. Riferimento: `tests/character-lab/SCENE_DISEGNABILI.md` §5.

## Cosa c'è oggi

Il motore (`src/14`) emette `occasione_eroe` con:
- tipo: conclusione · spalle · fascia · fra-le-linee · costruzione · cross · angolo · rigore · punizione;
- zona, pressione, posizione (x, y), compagni liberi (`liberi`);
- cast: ricevente, difensore, portiere.

Il gioco (`src/15`, ~r.4590) sceglie fra 16 schede scritte del catalogo `SITUATIONS` quella più coerente: tipo, poi posizione, poi zona.

## Obiettivo

La scena nasce dall'occasione:
- un **generatore** costruisce l'oggetto scena con la stessa fabbrica `S()`, così intent, ballState, cine e richiede restano derivati come oggi;
- le 2-3 opzioni dell'eroe escono da un registro di modelli di azione disegnabili, pesati da contesto e statistiche;
- testo e intro escono da modelli con i nomi del cast;
- il catalogo scritto resta come ripiego, finché ogni tipo non ha il suo generatore.

## Strati (una release ciascuno; ognuno con misura, interruttore rosso e guardiano)

1. **Conclusione** (area/limite, pressione < 3): generatore, modelli di testo e opzioni.
   Misura: scena dentro la posizione del motore (startZone che contiene x, y) 100%; opzioni disegnabili 100%; assist solo se c'è un ricevente libero; varietà: scene distinte per partita contro il catalogo.
2. **Spalle alla porta** (area/limite, pressione ≥ 3).
3. **Fascia** (trequarti esterno).
4. **Fra le linee** (trequarti centrale).
5. **Costruzione** (centrocampo), con le **manovre vere** del motore (PO-030): la sequenza di possesso che precede l'occasione (uno-due, terzo uomo, sovrapposizione) diventa la costruzione della scena.
6. **Cross e angolo** (origine dichiarata dal motore): oggi scheda dal catalogo intero, da generare.
7. **Difesa:** occasione difensiva emessa dal motore (oggi le scene difensive vengono dal calendario).
8. **Chiusura:** le schede diventano solo modelli di testo; si adeguano `validate-situations`, le firme golden e il salvataggio a metà partita; si toglie il ripiego.
