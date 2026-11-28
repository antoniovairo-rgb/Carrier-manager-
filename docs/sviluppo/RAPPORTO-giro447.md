# Rapporto giro 447 — PO-661: la classifica dopo la firma è quella dell'anteprima

Base: `main` 7.999.219 · ramo `sviluppo/giro447-firma-anteprima` · GAME_VERSION e `docs/governo` non toccati.

## 1. Misura (prima della correzione)

Sonda nuova `tests/visual/misura-447.mjs`. Usa il percorso vero: modale OFFERTA → testimone `__CPM_ANTE212` → «Accetta» → classifica
salvata. Confronta **la tabella intera** (id:punti:giocate di ogni riga, in ordine), non solo la riga del club. Corpi GLB accesi.

| Caso | Salvataggio | Anteprima | Dopo la firma | Esito |
|---|---|---|---|---|
| lega diversa · trasferimento · metà stagione | S5 sett. 20 | juve 2ª, 35 pt | 2ª, 35 pt, tabella uguale | ✅ |
| lega diversa · prestito · metà stagione | S5 sett. 20 | juve 2ª, 35 pt | 2ª, 35 pt, tabella uguale | ✅ |
| lega diversa · trasferimento · inizio stagione | S5 riportato alla sett. 1 | 1ª, 0 pt | uguale | ✅ |
| lega diversa · trasferimento · fine stagione | S12 sett. 38 | juve 2ª, 69 pt | uguale | ✅ |
| **stessa lega** · trasferimento · metà stagione | S5 sett. 20 | bay **4ª**, 36 pt | bay **2ª**, 36 pt, **tutte le righe diverse** | ❌ |
| **stessa lega** · prestito · metà stagione | S5 sett. 20 | bay 4ª, 36 pt | 2ª, 36 pt, tabella diversa | ❌ |
| **stessa lega** · trasferimento · inizio stagione | S5 sett. 1 | bay 4ª, 0 pt | **1ª**, 0 pt (ordine cambiato) | ❌ |
| **stessa lega** · prestito · fine stagione | S12 sett. 38 | mcy **3ª, 61 pt** | **7ª, 57 pt**, tabella diversa | ❌ |

**Causa.** Quando il club è della tua stessa lega, l'anteprima mostra la classifica vera (`player.standings`). `acceptTransfer` (src/18),
invece, usava sempre `legaDopoTrasferimento212`, che ricostruisce l'intera classifica partendo dal calendario del club nuovo. Il
risultato inventato prendeva il posto del campionato che il giocatore stava già giocando. Il caso «lega diversa» era già a posto
(PO-212, 7.999.134). Il residuo stava tutto nella stessa lega.

## 2. Correzione (alla fonte, `acceptTransfer` in src/18)

- **Stessa lega**, con il club nuovo presente in classifica: resta `p.standings`, la classifica che c'era e che l'anteprima mostrava.
- **Effetto collaterale trovato e chiuso.** Dopo la prima correzione, a fine S12 il calendario del club nuovo diceva 17V-6N, ma la
  sua riga in classifica diceva 17V-10N. Il motivo: le giornate passate del calendario sono simulate. Ora quelle giornate si
  riallineano alle V/N/P della riga, cambiando il minor numero di esiti a partire dalla giornata più vecchia (homeScore = gol del
  club, regola del giro 310).
- **Lega diversa: invariato.**
- Rosso `window.__CPM_NO_G447`: la classifica e il calendario si ricostruiscono come prima.
- Testimone: `__CPM_ANTE212` ora porta anche `tab`, la tabella intera dell'anteprima, ed è attivo solo sotto `__CPM_REC`.

Dopo la correzione: **8/8 casi identici**, e calendario e riga coerenti in tutti gli 8.

## 3. Guardiano `npm run anteprima-212` (esteso)

- **Verde:** 8/8 casi con la tabella identica, e il calendario del club nuovo coerente con la sua riga. Un caso non firmato o senza
  testimone conta come «non giudicato», cioè rosso.
- **Rosso 1 (`__CPM_NO_ANTE212`):** il caso lega diversa deve risultare diverso. Misurato: anteprima 4ª 41 pt, dopo la firma 2ª 35 pt.
- **Rosso 2 (`__CPM_NO_G447`):** i 4 casi della stessa lega devono risultare diversi. Misurato: 4/4 diversi.
- Durata misurata: **2 min 02 s**, uscita 0.

## 4. Giro `node ci-runner.mjs giro anteprima-212`

ESITO_GIRO

## 5. Dubbi per il PO

**A. Nella stessa lega, che cosa vale come verità?**
1. *(consigliata, applicata)* La classifica vera resta; il calendario passato del club nuovo si riallinea alla sua riga (V/N/P).
   I gol del calendario sono approssimati: la differenza reti della riga non viene ricostruita giornata per giornata.
2. La classifica vera resta e il calendario passato resta quello simulato: meno codice, ma la riga e le «ultime partite» del club
   possono non coincidere (misurato: 4 pareggi di scarto a fine S12).
3. Tornare a ricostruire tutto (com'era prima) e far mostrare all'anteprima la classifica ricostruita: coerente con sé stessa,
   ma in quel caso è il campionato in corso a cambiare sotto gli occhi del giocatore.

**B. «Inizio stagione» è un salvataggio sintetico.** È il salvataggio S5 riportato alla settimana 1, con classifica a zero e
calendario non giocato.
1. *(consigliata, applicata)* Tenerlo così: è deterministico e veloce.
2. Aggiungere tra le fixture un vero salvataggio di inizio stagione, preso subito dopo il passaggio di stagione.
3. Generarlo dal banco facendo girare una stagione intera (`career-sim`): più fedele, ma qualche minuto in più a ogni corsa.

**C. Il prestito è stato misurato come offerta di prestito accettata.** Non è stato misurato il caso del giocatore *già* in
prestito che firma altrove.
1. *(consigliata)* Considerarlo coperto: la classifica passa dallo stesso punto (`acceptTransfer`) qualunque sia il contratto attuale.
2. Aggiungere un nono caso con un salvataggio che ha `player.loan` attivo.
3. Aprire una voce a parte sul rientro dal prestito (fine stagione), che è un percorso diverso (rollover).

**Proposta di chiusura:** PO-661 chiusa con i numeri sopra. 8/8 dopo la correzione, contro 4/8 prima.
