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
   - Stato 07/10: il motore emette `passaggio` (da, a, tipo, origine, arrivo) ma non conosce le manovre.
   - Prima si misura su partite S12: negli ultimi passaggi prima di ogni occasione, quante sequenze sono già uno-due (A→B→A), terzo uomo (A→B→C con C in corsa) o sovrapposizione.
   - Poi due interventi, ciascuno con interruttore rosso e guardiano:
     - (a) la costruzione della scena ripercorre quei passaggi veri, non uno schema scritto;
     - (b) se la misura dice che le manovre sono rare, il motore impara a sceglierle quando la posizione lo permette, con il controllo che tiri, gol e possesso restino nei limiti del banco.
   - **Misura 08/10 (48 partite S12, 306 occasioni dell'eroe, sonda node):** nessuna occasione nasce a centrocampo (il motore apre occasioni solo dalla metà campo avversaria); il 91,8% arriva dopo almeno un passaggio della stessa squadra (media 2,7; ≥3 nel 35,9%); uno-due nel 21% (37% fra le linee, 13% in area/limite). Le manovre **non sono rare**: l'intervento (b) non serve. Effetto collaterale della misura: le occasioni «fascia» sono l'1,3% (4 su 306), per questo lo strato 3 non si era visto in due partite.
   - **Fatto in 7.999.150 (intervento a):** il motore consegna con ogni occasione gli ultimi 4 passaggi del possesso (`preludio`, sola lettura, gol e tiri identici fra i bracci) e l'introduzione della scena racconta la manovra vera coi nomi veri (uno-due, giro a tre, il passaggio che ti ha servito). Rosso `__CPM_NO_P6M`; guardiani `manovre-150` (node: preludio 93,8%, uno-due 29,8%) e `scena-motore-147`. **Resta fuori:** la costruzione 3D che ripercorre quei passaggi (oggi la manovra è nel testo e nei dati della scena, non ancora nei movimenti del 3D).
6. **Cross e angolo** (origine dichiarata dal motore): oggi scheda dal catalogo intero, da generare.
   - **Fatto in 7.999.151:** `scenaDalMotoreCross` (src/04) per `cross` e `angolo`; nel live la scena generata si tiene e l'origine `_ORIG26` viaggia con lei. Rosso `__CPM_NO_P6X`. Angolo generato non ancora osservato in partita.
7. **Difesa:** occasione difensiva emessa dal motore (oggi le scene difensive vengono dal calendario).
   - **Fatto in 7.999.152:** occasione `difesa` emessa dal motore (portatore avversario entro 4 u dall'eroe, dal 5', una sola a partita — decisione PO 08/10: al massimo una, in aggiunta) e `scenaDalMotoreDifesa` (type def). Rosso `__CPM_NO_P6D`.
8a. **Piazzati** (decisione PO 08/10): rigori e punizioni dell'eroe nascono dal motore come le altre scene — oggi sono il 29% delle sue azioni e vengono dal catalogo (`schedePiazzato`).
   - **Fatto in 7.999.153:** `scenaDalMotorePiazzato` (punizione e rigore), rosso `__CPM_NO_P6P`.
8b. **Chiusura:** le schede diventano solo modelli di testo; si adeguano `validate-situations`, le firme golden e il salvataggio a metà partita; si toglie il ripiego.
