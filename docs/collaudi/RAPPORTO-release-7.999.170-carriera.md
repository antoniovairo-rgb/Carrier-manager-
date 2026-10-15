# Rapporto di collaudo — CPM 7.999.170, carriera (non 3D)

**Collaudatrice:** sessione di collaudo (sola misura, nessuna modifica a `src/` né a `CARRIER-MANAGER-AV.html`)
**Oggetto:** release 7.999.170 pubblicata su `main`; ramo di collaudo `collaudo/release-7.999.170-carriera` (creato da `origin/main` a `12f46bd`)
**Confronto:** collaudo 7.999.169 carriera (`origin/collaudo/release-7.999.169-carriera`, `docs/collaudi/RAPPORTO-release-7.999.169-carriera.md`)
**Salvataggio:** `tests/visual/fixtures/save-190-s12-ovr93.json` (FC Merseyside, Premier Division, ovr 93)
**Viewport:** 412×915 e 360×800 px
**Strumento:** `tests/visual/collaudo-170-carriera.mjs <412|360>` (sola lettura, Playwright con `CPM_CHROME=/opt/pw-browsers/chromium`)
**Dati:** `docs/collaudi/foto-170-carriera/dati-412.json`, `dati-360.json`; foto nella stessa cartella

## 1. Esito in sintesi

- **Non ho giocato tre settimane piene.** Il passo automatico ha chiuso la stagione S12 (con la gestione forzata di `startNewSeason`, come nel 169), poi ha giocato una sola partita della stagione nuova. Il calendario e la classifica sono quindi verificati su poche partite, non su tre settimane. Lo dichiaro come limite della prova, non come risultato.
- **Verificato con numeri, a 412 e 360 px:** tabellino = tabellone (1 partita); classifica con gol fatti = gol subiti (si chiude sempre in una lega chiusa: è un controllo debole); righe coerenti (punti = 3V+N, giocate = V+N+P); nessuna scritta tecnica vietata nel testo visibile; nessun overflow orizzontale; badge «v 7.999.170»; Crediti con 16 voci e 5 sezioni; copia di riserva `cpm-v3-riserva` presente.
- **Verificato con occhio sulle foto:** modale «Il confronto» del procuratore in finestra standard a 412 px, con l'ultima scelta leggibile per intero.
- **Verificato con controllo comportamentale:** un toast non compare sopra un modale aperto (PO-256). Un toast su pagina senza modale compare (controllo di riferimento).
- **Non verificato:** intervista dopo la Nazionale (PO-243) e premi dopo l'intervista (PO-247, timing), giornale (PO-244), analisi pre-partita (PO-217), riquadri della home nel kit (PO-066), avviso di salvataggio fallito (PO-167, seconda parte). **Non posso confermarlo** per questi punti: il percorso di tre settimane non ha portato alla Nazionale né al giornale, e non ho forzato questi flussi.
- **Trovati 3 difetti: 1 ALTO (D1), 1 MEDIO (D2), 1 BASSO (D3).** Nessuno è bloccante.

## 2. Misure

| # | Controllo | 412 px | 360 px | Esito |
|---|---|---|---|---|
| 1 | Calendario: partita giocata vs storia (S38 0-1 FC Tyneside; S1 3-0 FC Sussex) | coincidono | coincidono | OK |
| 2 | Classifica: gol fatti = gol subiti (ogni snapshot) | uguali, 0 incoerenti | uguali, 0 incoerenti | OK |
| 3 | Overflow orizzontale (scrollWidth − clientWidth) | 0 px | 0 px | OK |
| 4 | Scritte vietate nel testo visibile (fps, undefined, NaN, [object], null, Infinity): dashboard, calendario, classifica, home | 0 | 0 | OK |
| 5 | Badge d'avvio (PO-255): testo `v 7.999.170`, nessun PROD/TEST | «v 7.999.170» | «v 7.999.170» | OK |
| 6 | Crediti (PO-254): voci | 16 in 5 sezioni | 16 in 5 sezioni | OK sul numero |
| 6b | Crediti: «da completare» | 0 | 0 | OK |
| 6c | Crediti: «Non posso confermarlo» visibile al giocatore | 2 | 2 | **ALTA**, vedi D1 |
| 7 | Procuratore «Il confronto» (PO-253), finestra standard, ultima scelta leggibile | leggibile per intero (foto) | foto non ancora giudicata | OK a 412; 360 non visto |
| 8 | Toast sopra un Modal aperto (PO-256): toast con procuratore aperto | non compare | non compare | OK (soppresso, non sovrapposto) |
| 8b | Toast di controllo su pagina senza modale (dopo ricarica) | compare | compare | OK (il controllo funziona) |
| 9 | Copia di riserva degli slot (PO-167): chiave `<slot>-riserva` | presente | presente | OK |

Fonti: `dati-412.json` e `dati-360.json` (campi `settimane`, `badge`, `iniziale.crediti`, `procuratore`, `toastConModale`, `toastControllo`, `backup`, `overflow`, `vietati`).

**Nota sui numeri:** la classifica è verificata solo nello stato di fine stagione S12 e nell'inizio di S13. Il controllo «gol fatti = gol subiti» vale per costruzione in una lega chiusa: lo riporto perché richiesto, ma non prova molto da solo.

## 3. Difetti trovati

| Grado | ID | Viewport | Schermata | Descrizione | Prova |
|---|---|---|---|---|---|
| **ALTA** | D1 | 360 e 412 | Crediti (dalla home iniziale) | Due voci mostrano al giocatore «Licenza: Non posso confermarlo»: sono i due asset DiceBear («Avataaars» e «Micah»). È una nota di verifica interna, non un testo di prodotto. Stesso tipo del D2 del 169 («Fonte da completare»), ora in forma diversa. PO-254 chiede di completare le fonti prima della pubblicazione. | `docs/collaudi/foto-170-carriera/360-00-crediti.png` (in basso); `dati-*.json` → `iniziale.crediti.nonPosso = 2` |
| **MEDIA** | D2 | 360 | Crediti | La voce «Ordine CGTrader #17876008 del 20/09/2026» è un riferimento d'ordine d'acquisto mostrato al giocatore. Non so se sia voluto; da confermare col PO. | `360-00-crediti.png` (prima voce) |
| **BASSA** | D3 | 360 | Qualsiasi schermata sotto il badge | Il badge «v 7.999.170» (in basso a destra, `z-index` 9999) si sovrappone al contenuto del Modal. Svanisce dopo 9 secondi. | `360-00-crediti.png` (in basso a destra) |

Il 169 aveva un difetto D1 di grado ALTO (badge «TEST · KE 7.999.169»): **risolto** in 170 (badge «v 7.999.170», testo verificato). Il D3 del 169 (toast che copre l'ultima scelta del procuratore a 412 px): **non si ripresenta** nella foto 412 di «Il confronto», perché lì non c'è un toast. Non ho però fotografato toast e modale insieme a 412: il controllo PO-256 dice solo che il toast non compare sopra il modale.

## 4. Punti non verificati

- **PO-243 · intervista dopo la Nazionale:** **Non posso confermarlo.** Nessuna Nazionale attiva nelle tre settimane (`stato.nationsCupActive = false`). Il gioco ha l'hook `apriNC243` che avvia la partita di Coppa, ma non l'ho usato: sarebbe una forzatura.
- **PO-247 · avviso premi solo dopo l'intervista:** **Non posso confermarlo** sul timing. Ho verificato solo che il toast non compare sopra un modale aperto; non ho misurato se il toast accodato compaia dopo la chiusura del modale (la chiusura del procuratore non è riuscita da script: il modale «Il primo incontro» non si chiude con i bottoni testuali, quindi ho ricaricato la pagina).
- **PO-244 · giornale:** **Non posso confermarlo.** Il testo «giornale» non compare nelle schermate visitate e non ho trovato la schermata.
- **PO-217 · analisi pre-partita e PO-066 · riquadri home nel kit:** **Non posso confermarlo.** Non ho percorso una partita; non ho misurato la home di carriera nel kit.
- **PO-167 · avviso di salvataggio fallito:** la copia di riserva esiste (verificato), ma **non posso confermare** l'avviso di errore, che richiede un salvataggio che fallisce.
- **Fine stagione:** il bottone vero «CAMPIONI!» non è stato usato. Il passo automatico ha chiamato `startNewSeason` direttamente, come nel 169.
- **Foto dashboard, calendario e classifica (412 e 360):** nelle foto il modale «Il confronto» copre la schermata. Il giudizio visivo su queste tre schermate non è stato fatto.
- **Lessico degli eventi di partita:** non controllato.

## 5. Foto e file

- `docs/collaudi/foto-170-carriera/412-00-crediti.png`, `360-00-crediti.png` — Crediti dalla home iniziale (D1, D2, D3)
- `412-01-dashboard.png`, `360-01-dashboard.png` — mostrano il modale «Il confronto», non la dashboard
- `412-02-calendario.png`, `360-02-calendario.png`, `412-03-classifica.png`, `360-03-classifica.png` — idem, con modale
- `412-04-home.png`, `360-04-home.png` — mostrano il modale «Il confronto»
- `412-06-procuratore.png`, `360-06-procuratore.png` — modale «Il primo incontro» del procuratore
- `412-07-toast-su-modale.png`, `360-07-toast-su-modale.png` — con modale aperto, nessun toast
- `dati-412.json`, `dati-360.json` — misure grezze

## 6. Prossimi passi proposti

1. **D1 (alta):** sostituire «Non posso confermarlo» nella voce DiceBear con la licenza reale, o togliere la voce finché non è verificata. Stessa classe del D2 del 169: non far vedere note di verifica al giocatore.
2. **D2 (media):** il PO decide se il numero d'ordine CGTrader deve restare visibile.
3. **D3 (bassa):** alzare il badge sopra il Modal o nasconderlo quando un modale è aperto.
4. Un secondo giro che porti davvero alla Nazionale (PO-243/247) e al giornale (PO-244), e che usi il bottone «CAMPIONI!» vero, per chiudere i punti non verificati.
5. Fotografare le schermate dashboard, calendario e classifica con il modale chiuso, per giudicare il kit.
6. Il controllo del toast accodato dopo la chiusura del modale va fatto con un modale chiudibile da script (oggi non lo è «Il primo incontro»).

## 7. Tabella di gravità (riepilogo)

| Grado | Quanti | ID |
|---|---|---|
| ALTA | 1 | D1 |
| MEDIA | 1 | D2 |
| BASSA | 1 | D3 |
