# PO-228 zona B — giro 6: statistiche a 86' con la tabella, k1–k10

Collaudatrice 2 · sola lettura sul gioco · build `main` 7.999.160 (`CARRIER-MANAGER-AV.html` non committato) · salvataggio `save-190-s12-ovr93.json`, nomi PO228-1…10, autoplay seedato, velocità 4×.

## 1. Cosa è cambiato rispetto al giro 5

- **Causa della lettura incompleta:** il pannello «linguette918» nasce **chiuso** (chevron con `aria-label="Mostra"`, `src/15-live-match.jsx`, riga ~27985 del build). Il tab «Statistiche» cambia solo la vista: senza aprire il pannello il contenitore `data-cpm="stat77"` (la tabella con PASSAGGI e CROSS) non esiste nel DOM. Il giro 5 cliccava il tab e basta.
- **Correzione:** il pannello viene aperto (chevron) e si sceglie il tab Statistiche prima dell'86'. Alle 86' uno **snapshot dentro la pagina** (`window.__PO228_86`, polling a 5 ms) legge orologio, tabella (`stat77.innerText`), punteggio e riepilogo nello stesso istante.
- **Prova su una partita:** la prima versione (polling da 400 ms) ha letto a **89'**, non a 86' (a velocità 4× il minuto dura 150 ms). Quella lettura è scartata e non è nei dati. Nella versione finale `min` vale 86 su tutte e dieci le partite.

## 2. Dati grezzi e metodo

- `po228-giro6.mjs` (sonda), `po228-giro6-a/b/c/d.jsonl` (dati grezzi per partita, con `lettura86.tab` e `tabellinoFine`), `po228-giro6-analisi.mjs` (lettura e controllo), `po228-giro6-aggregato.json` (risultato).
- **Lettura della tabella.** Ogni riga è `valore · etichetta · valore`: il valore PRIMA dell'etichetta è il lato sinistro, quello DOPO il lato destro. Verificato sui tabellini finali (es. k1: `210 Passaggi 202`, `26 Cross 5`).
- **Orientamento (il punto che poteva ingannare).** All'86' la barra in alto mette a sinistra **FC Tyneside (TYN)** e a destra **FC Merseyside (MER)**, cioè la nostra squadra (il protagonista segna «per FC Merseyside» in tutte e dieci le partite, dalla cronaca finale). Nel tabellino finale invece MER sta a sinistra. Non ho assunto l'orientamento: ho verificato la **monotonia**. Un contatore non scende da 86' alla fine, quindi l'orientamento giusto è quello che la rispetta per ogni riga e ogni squadra. Risultato: l'ipotesi «MER a destra all'86'» regge su **10/10** partite, l'altra su 0/10. Lo strumento dichiara l'ipotesi scelta per ogni partita.
- **Riga per riga:** all'86' ci sono 10 righe-conteggio (Azioni dalle fasce, Cross, Passaggi, Recuperi, Parate, Calci d'angolo, Falli, Ammonizioni, Espulsioni, Rimesse laterali). Dribbling e precisione sono percentuali e restano fuori dal controllo.
- Il tabellone (`__CPM_SCORE`) e il tabellino (riga «Gol») sono letti entrambi a fine partita.

## 3. Risultati, k1–k10 (MER = FC Merseyside, nostra squadra · TYN = FC Tyneside)

| k | Passaggi 86' MER–TYN | Passaggi fine MER–TYN | Cross 86' MER–TYN | Cross fine MER–TYN | Tabellone 86' → fine | Gol tabellino fine |
|---|---|---|---|---|---|---|
| 1 | 198–182 (380) | 210–202 (**412**) | 24–5 (29) | 26–5 (31) | 4-2 → 4-2 | 4-2 |
| 2 | 207–167 (374) | 228–195 (**423**) | 8–27 (35) | 11–30 (41) | 2-0 → 2-0 | 2-0 |
| 3 | 206–187 (393) | 229–196 (**425**) | 22–24 (46) | 25–26 (51) | 2-1 → 2-1 | 2-1 |
| 4 | 203–193 (396) | 225–217 (**442**) | 35–17 (52) | 37–20 (57) | 0-0 → 0-0 | **1-0** ⚠️ |
| 5 | 181–175 (356) | 204–182 (**386**) | 24–18 (42) | 32–18 (50) | 2-0 → 2-0 | 2-0 |
| 6 | 172–201 (373) | 186–217 (**403**) | 19–30 (49) | 21–32 (53) | 2-0 → 2-0 | 2-0 |
| 7 | 215–185 (400) | 252–193 (**445**) | 16–26 (42) | 16–26 (42) | 5-0 → 5-0 | 5-0 |
| 8 | 200–206 (406) | 213–227 (**440**) | 30–10 (40) | 34–10 (44) | 0-1 → 0-1 | 0-1 |
| 9 | 192–178 (370) | 199–194 (**393**) | 17–9 (26) | 18–16 (34) | 2-1 → 2-1 | 2-1 |
| 10 | 182–169 (351) | 196–184 (**380**) | 32–20 (52) | 35–20 (55) | 3-0 → 3-0 | 3-0 |

**Medie (10 partite), per squadra e per somma delle due squadre:**

| Voce | MER (nostra) | TYN | Somma (due squadre) | Intervallo della somma |
|---|---|---|---|---|
| Passaggi all'86' | 195,6 | 184,3 | **379,9** | 351–406 |
| Passaggi a fine | 214,2 | 200,7 | **414,9** | 380–445 |
| Cross all'86' | 22,7 | 18,6 | **41,3** | 26–52 |
| Cross a fine | 25,5 | 20,3 | **45,8** | 31–57 |

**Il caso k4:** a fine partita il tabellino dà «Gol 1» per MER, il tabellone resta 0-0 e il zona mista dice «finisce 0-0». È il difetto già documentato in `PO228-k4.md`; non lo rianalizzo qui.

## 4. Confronto con la foto del PO e con il riferimento

**La foto (86', 0-0, FC Merseyside – FC Brabantia):** passaggi **218 · 212** (somma **430**), cross **29 · 14** (somma **43**). È un'altra partita, quindi il confronto è di intervallo, non di valore puntuale.

- **Passaggi a 86':** la somma della foto (430) è **sopra il massimo** delle dieci partite (406). Nessuna delle dieci arriva a 430 all'86'. Il dato della foto non è un caso raro dentro il nostro intervallo: è fuori.
- **Cross a 86':** la somma della foto (43) cade **dentro** l'intervallo nostro (26–52).

**Il riferimento (`docs/governo/riferimenti/PO228-riferimenti.md`):** per i passaggi il documento indica **893,4 per partita, due squadre insieme**, citando The Analyst e la Premier League 2024/25. Ho verificato le due fonti:
- **Premier League** (premierleague.com/news/4323030): la tabella è intitolata «Average number of passes per match» e riporta 893. **Non dice** se il dato conti una squadra o entrambe. Non posso confermare il «due squadre insieme».
- **The Analyst** (theanalyst.com/articles/premier-league-2025-26-more-direct-football): la frase citata dal documento («941.0 passes per game (between both teams)…») **non compare** nel testo che ho recuperato. Non posso confermarla.

**Per squadra o per partita?** Il riferimento è scritto come **per partita, due squadre insieme**, ma la fonte che lo dichiarerebbe così non l'ho potuta verificare. Dico quindi: **non posso confermare la base del riferimento**.

Con la lettura del documento (893,4 per partita, due squadre), la nostra somma a fine partita (media **414,9**) è circa il **46%** del riferimento; per squadra, la media delle due squadre (207) contro 447 è anch'essa il 46% circa. Con l'altra lettura possibile (893 per squadra) lo scarto sarebbe ancora più grande, ma quella lettura non è sostenuta da nulla che io abbia verificato.

**Cross:** il documento non ha un riferimento pubblicato per partita. La sua stima («circa 24–25 per le due squadre») è un calcolo dello stesso documento da una percentuale della Premier League e non è un dato pubblicato. Con la nostra media a fine partita (45,8) siamo circa il doppio di quella stima. Non posso confermare né che il nostro valore sia sbagliato, né che sia giusto: manca un riferimento verificato.

## 5. Risposta alla domanda del PO

- **Le misure sono chiuse:** dieci partite, passaggi e cross letti dalla tabella all'86' e a fine, con la monotonia che fissa l'orientamento. Il punto dove ho sbagliato nel giro 5 è corretto.
- **Il giudizio di realismo non si chiude:** su passaggi, la lettura del riferimento dice che siamo a circa la metà, ma la base (per partita o per squadra, due squadre o una) non è verificata; sui cross un riferimento verificato non c'è.
- **Ciò che si può dire con sicurezza:** la foto del PO (430 passaggi all'86') sta sopra tutte e dieci le nostre partite a quell'istante; la somma dei passaggi a fine partita oscilla fra 380 e 445 (media 415).

## 6. Limiti

- Dieci partite, un solo salvataggio, un solo avversario (FC Tyneside in tutte e dieci), autoplay seedato: il campione non copre il ventaglio di squadre della lega.
- Il punteggio di k4 nel tabellino non coincide con il tabellone (vedi §3).
- L'orientamento sinistra/destra è dedotto dalla monotonia e dalla barra in alto, non da un'etichetta esplicita della tabella: la prova è la monotonia su 10/10 partite.
- Le letture sono alla fase `playing`, minuto 86 esatto (campo `min` = 86 su tutte e dieci).

STATO: NON CHIUSO — motivo: le misure di passaggi e cross sono complete su k1–k10, ma il riferimento per il passaggio non ha una base verificata (per partita o per squadra, e due squadre o una: la frase di The Analyst citata dal documento non l'ho ritrovata), e per i cross non esiste un riferimento verificato. Per chiudere serve una fonte primaria che dichiari la base del dato (per partita, due squadre) e un riferimento pubblicato per i cross.
