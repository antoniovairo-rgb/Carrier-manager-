# Rapporto di collaudo — CPM 7.999.169, carriera (non 3D)

**Collaudatrice:** sessione di collaudo (misura, nessuna modifica al gioco)
**Oggetto:** release 7.999.169 pubblicata su `main`, ramo di collaudo `collaudo/release-7.999.169-carriera`
**Salvataggio:** `tests/visual/fixtures/save-190-s12-ovr93.json` (S12, FC Merseyside, Premier Division, ovr 93)
**Viewport:** 412×915 e 360×800 (px)
**Strumenti:** `tests/visual/collaudo-169-carriera.mjs` (carriera, 3 settimane) e `tests/visual/collaudo-169-home.mjs` (home, crediti)

## 1. Esito in sintesi

- **Verificato con numeri:** classifica (gol fatti = subiti), coerenza interna delle righe, tabellino contro tabellone, scritte tecniche vietate, overflow orizzontale, crediti in home. Tutto a 412 e a 360 px.
- **Trovati 2 difetti di grado ALTO e 1 di grado MEDIO** (tabella §3). Nessuno è bloccante.
- **Non verificato:** interviste dopo la Nazionale (PO-243), giornale (PO-244), finestre modali una per una. Il percorso di 3 settimane non ha raggiunto né una convocazione né il giornale. Su questi punti scrivo «Non posso confermarlo».
- **Limite della prova:** il giro è stato eseguito a stagione conclusa con il bottone di inizio stagione dell'hook di collaudo (`startNewSeason`), non col percorso del giocatore. Il giro ha richiesto più tentativi per via di un ciclo di fine stagione nella sonda, risolto nella sonda stessa (non nel gioco).

## 2. Misure

| # | Controllo | 412 px | 360 px | Esito |
|---|---|---|---|---|
| 1 | Calendario: partite giocate / storia partite | 2 / 2 | 2 / 2 | OK, coerente |
| 2 | Classifica: somma gol fatti = somma gol subiti | 41 = 41 | 41 = 41 | OK |
| 2b | Classifica: punti = 3V+N, giocate = V+N+P, per riga | 0 incoerenti su 18 | 0 su 18 | OK |
| 3 | Tabellino (calendario) contro tabellone (storia), settimana 2 | 0-1 / 0-1 | 0-1 / 0-1 | OK, coincidono |
| 7 | Overflow orizzontale (scrollWidth − clientWidth) | 0 px | 0 px | OK |
| 8 | Crediti in home (PO-238) | presenti | presenti | OK (vedi difetto D2) |
| 10 | Scritte vietate nel testo visibile (fps, undefined, NaN, [object], null, Infinity), 4 schermate | 0 occorrenze | 0 occorrenze | OK |

Fonti: `docs/collaudi/foto-169-carriera/dati-412.json`, `dati-360.json`, `dati-home.json`. Il controllo 10 è un filtro su testo visibile, non copre i messaggi che compaiono solo in un'interazione non percorsa.

## 3. Difetti trovati

| Grado | ID | Viewport | Schermata | Descrizione | Prova |
|---|---|---|---|---|---|
| **ALTA** | D1 | 412 (visto solo qui) | Home (prima schermata) | Il badge «TEST · KE 7.999.169» è visibile al giocatore in basso a destra. È l'etichetta di build di test, non un testo di gioco. Non posso confermare se sia voluto nella build di collaudo o se finisca anche nella store build. | `docs/collaudi/foto-169-carriera/412-00b-crediti.png` (angolo in basso a destra) · testo home in `dati-home.json` |
| **ALTA** | D2 | 412 (visto solo qui) | Crediti (home) | La voce «Fonte da completare» è mostrata in rosso al giocatore per due risorse: «autore/venditore, pagina del prodotto e conferma del listino Royalty Free» (calciatori 3D) e «origine, autore e licenza» (corpo di ripiego). Inoltre la legenda «Le voci segnate «fonte da completare» sono in verifica». Sono note di lavorazione, non testo di prodotto (PO-238 chiede di completare le fonti prima della pubblicazione). | `412-00b-crediti.png` · `dati-home.json` (campo `apertura`) |
| **MEDIA** | D3 | 412 | Modale «Il confronto» (procuratore) | Il toast «L'investimento immobiliare rende: +55.000€ sul conto!» copre l'ultima scelta del modale: «Voglio cambiare completamente aria.» è tagliata a metà sotto il toast e non si legge per intero. | `docs/collaudi/foto-169-carriera/412-01-dashboard.png` (in basso) |

Il rapporto non segnala difetti bassi perché non ho misurato abbastanza da stabilire gravità minori.

## 4. Punti non verificati

- **4 · Interviste dopo la Nazionale (PO-243):** Non posso confermarlo. Il percorso di 3 settimane non ha convocato la Nazionale e non ha aperto l'intervista post-Nazionale.
- **5 · Giornale (PO-244):** Non posso confermarlo. Non ho aperto la schermata del giornale.
- **6 · Finestre e modali, una alla volta:** coperto solo in parte. Ho fotografato il modale «CAMPIONI!» (fine stagione) e il modale «Il confronto», in grafica standard. Non ho catalogato tutti i modali.
- **7 · Schermate allineate al kit:** giudizio visivo fatto solo su dashboard, calendario, classifica, crediti; le foto di dashboard/calendario/classifica del primo giro mostravano il modale di fine stagione, non la schermata. Le foto rifatte mostrano il modale «Il confronto» sopra la dashboard. Non posso confermare l'allineamento della dashboard senza modale.
- **8 · Testi e numeri in italiano:** verifica solo sulle schermate catturate. Non ho controllato il lessico degli eventi di partita.
- **360 px visivo:** le foto a 360 px sono state prese col vecchio giro (prima della chiusura del modale di fine stagione), quindi mostrano il modale «CAMPIONI!». Non le ho riviste con l'occhio.

## 5. Foto e file

- `docs/collaudi/foto-169-carriera/412-00-home-gioco.png`, `412-00b-crediti.png`, `412-01-dashboard.png` (mostra il modale «Il confronto»), `412-02-calendario.png`, `412-03-classifica.png`, `412-04-home.png`
- Foto 360 px: `360-00-home-gioco.png`, `360-00b-crediti.png`, `360-01-dashboard.png`, `360-02-calendario.png`, `360-03-classifica.png`, `360-04-home.png`. Le foto `360-01..03` del giro vecchio mostrano il modale «CAMPIONI!»: da rifare col giro nuovo.
- Dati: `dati-412.json`, `dati-360.json`, `dati-home.json`

## 6. Prossimi passi proposti

1. Confermare col PO se il badge «TEST · KE 7.999.169» deve restare nella build che arriva al giocatore (D1).
2. Completare le fonti dei crediti o togliere la nota di lavorazione dal testo visibile (D2).
3. Spostare il toast finanziario sopra o sotto il modale, o alzare il modale, in modo che l'ultima scelta resti leggibile a 412 px (D3).
4. Un secondo giro che passi per la convocazione in Nazionale e per il giornale, per chiudere i punti 4 e 5.
