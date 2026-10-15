# Rapporto collaudo mirato 169 — PO-228 (statistiche), PO-243 (intervista Nazionale), PO-244 (giornale)

Data: 15/10/2026 · Gioco: 7.999.169 · Ramo: `collaudo/mirato-169` · Misura, nessuna modifica a `src/` né a `CARRIER-MANAGER-AV.html`.
Dati grezzi: `docs/collaudi/dati-mirato-169/` · Foto: `docs/collaudi/foto-mirato-169/`.

## Metodo (comune)

- Salvataggio `tests/visual/fixtures/save-190-s12-ovr93.json`, GLB spento (`__CPM_GLB=false`), velocità 4, autoplay seedato fino al fischio.
- Seme della partita = avversario + stagione + settimana + nome: ogni gara ha un nome diverso (`Collaudo169 Atleta 01…20`).
- Una partita alla volta (non in parallelo), perché il ritmo dei sotto-tick dipende dalla cadenza del browser (vedi nota in `statistiche-228-vivo.mjs`).
- Il tabellino è letto da `__CPM_MOTORE_OBJ().tabellino()`, lo stesso oggetto che il pannello scrive a schermo.
- Script: `tests/visual/collaudo-169-stats.mjs`, `collaudo-169-intervista.mjs`, `collaudo-169-giornale.mjs`.

---

## A. PO-228 — statistiche di 20 partite vere complete

Tutte le 20 partite sono arrivate al fischio (`fine = ceremony`). Controlli interni: il tabellino dei gol coincide con il punteggio in 20/20 partite; `tiri in porta ≤ tiri` in 20/20; il possesso delle due squadre somma 100 in 20/20. Tempo totale 5.467 s (circa 273 s a partita).

Le voci sono **due squadre insieme** salvo dove indicato. Le medie sono su 20 partite; sd = deviazione standard campionaria.

| Voce | Media | Sd | Min | Max | Riferimento | Esito |
|---|---|---|---|---|---|---|
| Passaggi (due squadre) | **739,1** | 63,3 | 650 | 883 | Banco giro 16: obiettivo ~814 (rapporto giro 16, §1) · guardiano banco 800-950 · Premier League 2024/25: 893,4 per partita, «between both teams» (The Analyst, theanalyst.com/articles/premier-league-2025-26-more-direct-football; Premier League, premierleague.com/news/4323030) | **Fuori fascia**: 18 partite su 20 sotto 800; nessuna sopra 950 |
| Passaggi riusciti % (due squadre) | 90,8 % | 1,4 | 87,8 | 93,2 | Non posso confermarlo (nessun riferimento nel repo) | — |
| Cross (due squadre) | **26,7** | 6,2 | 18 | 39 | Fascia del guardiano giro 16: 20-30 (rapporto giro 16, §1). Nessun totale pubblicato per la Premier League (`docs/governo/riferimenti/PO228-riferimenti.md`) | **Media dentro, dispersione alta**: 9 partite su 20 fuori (3 sotto 20, 6 sopra 30) |
| Tiri (due squadre) | 22,5 | 3,0 | 15 | 28 | Non posso confermarlo | — |
| Tiri in porta (due squadre) | 8,0 | 2,7 | 3 | 13 | Non posso confermarlo | — |
| Dribbling riusciti % (due squadre) | 50,9 % | 11,1 | 18,2 | 68,4 | Non posso confermarlo | — |
| Contrasti (due squadre) | 24,5 | 9,0 | 9 | 43 | Non posso confermarlo | — |
| Falli (due squadre) | 22,8 | 4,5 | 14 | 31 | Non posso confermarlo | — |
| Ammonizioni (due squadre) | 4,2 | 1,6 | 1 | 6 | Non posso confermarlo | — |
| Possesso squadra di casa | 51,2 % | 2,7 | 48 | 56 | Non posso confermarlo (somma 100 in 20/20) | — |
| Gol (due squadre) | 2,4 | 1,9 | 0 | 6 | Non posso confermarlo | — |
| xG (due squadre) | 1,68 | 0,55 | 0,98 | 3,49 | Non posso confermarlo | — |
| Calci d'angolo (due squadre) | 5,6 | 2,1 | 2 | 8 | Non posso confermarlo | — |
| Intercetti (due squadre) | 22,6 | 4,5 | 14 | 33 | Non posso confermarlo | — |
| Dribbling tentati (due squadre) | 24,2 | 11,2 | 11 | 54 | Non posso confermarlo | — |

**Lettura.**
- **Passaggi**: la media (739) è sotto il valore del banco (~814) e sotto la fascia 800-950 che il guardiano usa per il banco. Il rapporto giro 16 aveva già misurato 760 dal vivo contro 805 al banco e aveva lasciato la decisione al PO. Questa misura conferma il dato con 20 partite: la partita vera passa meno palloni del banco. Rispetto alla Premier League 2024/25 (893,4 per partita, due squadre insieme) siamo circa il 17 % sotto. Il riferimento della Premier League è della stessa grandezza («due squadre insieme»), secondo The Analyst; la lettura per squadra è una deduzione del repo, non una frase della fonte.
- **Cross**: la media sta nella fascia del banco, ma su 20 partite la dispersione è ampia (18-39). Non esiste un totale pubblicato per la Premier League da confrontare: il dato di ~24-25 nel file di riferimento è una stima derivata, non un valore pubblicato.
- **Voci senza riferimento nel repo** (tiri, tiri in porta, dribbling, falli, ammonizioni, possesso, gol, xG e le altre): non posso confermare se siano credibili. Il rapporto giro 16 dichiara che «tiri, falli, corner, recuperi, rimesse laterali a partita» non sono stati trovati con fonte primaria.

---

## B. PO-243 — intervista dopo la Nazionale

**Forzatura.** La gara è la Coppa delle Nazioni (girone). La convocazione è stata forzata come nella sonda `intervista-231`: `nationsCupQueue` attivo con tre avversari, poi `apriNC243()`. **Non ho aperto la schermata di convocazione** (`convocazione-235`), quindi la convocazione in sé non è verificata: il mio percorso è la coda della Nazionale.

| Gara | Partita apertasi | Fischio | Intervista dopo la gara | Foto |
|---|---|---|---|---|
| Naz #1 | sì | ceremony | **sì** (contesto «win») | `B-intervista-naz-1.png` |
| Naz #2 | sì | ended | **sì** (contesto «weekly») | `B-intervista-naz-2.png` |
| Naz #3 | sì | ceremony | **sì** (contesto «win») | `B-intervista-naz-3.png` |

**Esito B: verificato** (3 gare su 3, intervista presente). Nella foto Naz #1 si legge il banner «Nations Cup: Partita 1/3 del girone completata» e l'intervista con tre risposte, a 412 px. Non ho eseguito il braccio rosso di questa sonda: il difetto di PO-243 è già coperto dal guardiano `intervista-231` nel suo ramo Nazionale (rosso `__CPM_NO_IV243`), che non ho rilanciato.

---

## C. PO-244 — giornale del dopo partita

Le correzioni del giro 19 (`docs/sviluppo/RAPPORTO-giro19.md`, §4) verificate una per una. Le foto sono a 412 px e a 360 px.

| Correzione del giro 19 | Prova | Esito | Foto |
|---|---|---|---|
| **Campionato: «G.» è la giornata (34ª), non la settimana (38)** | Gara di campionato, settimana 38: testata «Stag. 12 · G. 34» (verde, 4 prove). Rosso non ripetuto: il guardiano `giornale-244` riporta «G. 38» come difetto. | **Verificato** | `C-giornale-lega-412.png`, `C-giornale-lega-360.png` |
| **Coppa delle Nazioni a gironi: «FASE A GIRONI · GIORNATA 1/3», mai «eliminazione»** | Gara di girone (verde, 2 prove): «COPPA DELLE NAZIONI · FASE A GIRONI · GIORNATA 1/3». **Rosso** (`__CPM_NO_GIORN244`, 1 prova): «COPPA DELLE NAZIONI · FASE A ELIMINAZIONE» e «G. 38». Il difetto si riproduce, la correzione lo elimina. | **Verificato** | `C-giornale-naz-412.png`, `C-giornale-naz-360.png`, `C-giornale-naz-rosso-412.png` |
| **Amichevole: «Amichevole internazionale», non «fase a eliminazione»** | Nessun percorso di collaudo trovato per forzare un'amichevole. Il codice (src/15:10033, 10090) è stato letto, non eseguito. | **Non verificato** | — |
| **Rassegna stampa (`PostMatchPress`, src/13): giornata dalla voce di campionato, altrimenti «Settimana N»** | La rassegna non è stata raggiunta. Dal pannello di fine partita l'unica uscita trovata è «Torna alla dashboard», che porta alla carriera senza passare dalla rassegna. Il rapporto giro 19 diceva già «non l'ho vista in gioco». | **Non verificato** | — |
| Uscita dal giornale | Dopo il pannello la carriera torna alla dashboard, con «Vivi la Settimana» e «Salva». | Osservazione | — |

**Osservazioni non giudicate** (fuori dal perimetro del giro 19):
- Il pannello di fine campionato (34ª giornata) mostra il riquadro «CAMPIONI! · Premier Division». Non ho verificato se la squadra abbia vinto il titolo nel salvataggio: non posso confermarlo dal solo banner.
- Nessuno scorrimento orizzontale a 360 px (`scrollOrizzontale360 = false` in tutte le prove).

**Esito C: parziale.** Verificate due correzioni su quattro (campionato e Coppa a gironi, con prova del rosso per la Coppa). Non verificate l'amichevole e la rassegna stampa.

---

## Tabella di gravità

| Gravità | Voce | Cosa si vede | Stato |
|---|---|---|---|
| Media | Passaggi bassi (A) | 739 di media, 18 partite su 20 sotto 800; ~17 % sotto la Premier League (893,4) | Noto dal giro 16. Decisione PO ancora aperta. |
| Media | Cross dispersi (A) | Media 26,7 nella fascia 20-30, ma 9 partite su 20 fuori (18-39) | Da decidere: il banco ha la fascia, la partita vera no |
| Media | Rassegna stampa non verificata (C) | Correzione del giro 19 non raggiunta in gioco | Serve un percorso di collaudo per la rassegna |
| Bassa | Amichevole non verificata (C) | Correzione solo letta nel codice | Serve un percorso di collaudo per l'amichevole |
| Bassa | Convocazione non aperta (B) | La coda Nazionale è forzata, la schermata di convocazione no | Coperta da `convocazione-235` (non rilanciato) |
| Nessuna | Intervista dopo la Nazionale (B) | Presente in 3/3 gare | Verificata |
| Nessuna | Coppa a gironi e campionato nel giornale (C) | Testate corrette; il rosso riproduce il difetto | Verificate |
| Da verificare | Banner «CAMPIONI!» (C) | Compare nel pannello di fine campionato | Non giudicato |

## Limiti del collaudo

- Le venti partite sono una sola serie con il salvataggio S12: la varianza tra salvataggi non è misurata.
- Per voce senza riferimento nel repo, la credibilità è «non posso confermarlo»: non ho cercato fonti esterne fuori dal file di riferimento già nel repo.
- Il rapporto giro 16 dichiara che la partita dal vivo non è riproducibile al tick: il confronto è sulle medie, non sulle singole partite.
