# Collaudo carriera — CPM 7.999.172

Ramo: `collaudo/7.999.172-carriera` (creato da `origin/main` a `a8f7fb3`).
Versione collaudata: `GAME_VERSION="7.999.172"` (src/07-versione-save-interviste.jsx:35).
Ambiente: Chromium headless `/opt/pw-browsers/chromium`, CPM_CHROME impostato, viewport 412×915 e 360 px.
Metodo: esecuzione dei guardiani già presenti in `tests/visual/` per le voci della 172, più lettura del codice nei punti d'intervento. Nessun codice di prodotto modificato.

Legenda gravità: **alta** = blocca la carriera o falsa un dato al giocatore · **media** = informazione sbagliata o regola non garantita · **bassa** = cosmetica o processo.

## 1. Voci PO della 7.999.172

| Voce | Cosa dice il BACKLOG | Esito | Gravità se difetto | Prova |
|---|---|---|---|---|
| PO-279 | statistiche d'inizio partita diverse a ogni partita, vere | **VERDE**: 20 partite, teste distinte 19/20, ripetute nelle ultime 3: 0, numeri incoerenti 0, pageerror 0 | — | `npm run stat-279` → `tests/visual/out/` (riga `STAT-279 verde`) |
| PO-280 | esito della scelta del mister nel riepilogo vero fino al fischio; due scelte nella stessa partita; tabellino casa–ospite | **VERDE**: l'esito è vero dal minuto della scelta al fischio; prova del rosso riconosciuta; tabellino «FC Altoadige Primavera [1-0] FC Laguna» in ordine casa–ospite (2/2) | — | `node esito-280.mjs` (uscita 0) |
| PO-270 | rinnovo di 1 anno non svincola; rinnovo da offerta del club | **VERDE**: rinnovo 1 anno → stagione dopo `duration 2`, non svincolato; offerta durata 1 e 2 e assente: tutti non svincolati | — | `node rinnovo-270.mjs` |
| PO-269 / PO-255 | badge versione in testata, nessuna sovrapposizione | **VERDE**: 412 e 360 px, solo «v 7.999.172», nessuna sovrapposizione su Home, Carriera, Crediti (0 px²) | — | `node badge-255.mjs`, `node chip-269.mjs`; foto `carriera-360-testata.png`, `home-412-testata.png` |
| PO-268 | crediti senza numero d'ordine | **VERDE**: nel gioco normale la voce dice «Acquistati su CGTrader.»; il testo «Ordine CGTrader #…» compare nel file solo nel ramo del flag di rosso `__CPM_NO_CRED268` (src/17, riga 154). Verificato a occhio a 412 px | — | `node crediti-254.mjs`; foto `crediti-412.png` |
| PO-272 | niente «(simulata)» | **VERDE**: dopo settimana simulata, «simulata» assente in pagina e nel riepilogo | — | `node simulata-272.mjs` |
| schede del mister nel finale (pari al 75'+) | scheda del pari solo con un fatto del finale, rete all'81' | **Parte A VERDE** (regola pura): 5/5 pari senza fatto restano muti, 4/4 con fatto o rete aprono la scheda. **Parte B NON GIUDICATA**: su 1 partita vera nessuna scheda del pari | — | `CPM_PARTITE=0 node schede-finale.mjs` (verde); `CPM_PARTITE=1` (0 schede, il guardiano esce 0 dichiarando «non giudicato») |

## 2. Giro generale carriera

| Area | Esito | Prova |
|---|---|---|
| Invarianti (leghe, calendario, standings, pro, migration, prestito, forma) | **VERDE**: 252 club, pageerror 0 | `node career-invariants.mjs` |
| Simulazione 2 stagioni (142 step, rollover S2→S3 e S3→S4) | **VERDE**: invarianti tenuti, pageerror 0 | `node career-sim-test.mjs` |
| Salvataggi (compatibilità e migration) | **VERDE** 12/12 | `node run-save-compat.mjs` |
| Mercato, Nazionale, coppe, settimane come flusso di gioco | Coperti solo in parte dai due test sopra. **Non giocati a mano** | — |

## 3. Difetti per gravità

**Alta:** nessuno trovato nelle voci verificate.

**Media:**
- M1 — `schede-finale.mjs` parte B esce con codice 0 quando non giudica nulla («nessuna scheda del pari in queste partite: B non ha giudicato niente»). Un guardiano che non giudica non dovrebbe passare. *Tipo: processo di collaudo, non prodotto.* Prova: output di `CPM_PARTITE=1 node schede-finale.mjs`.

**Bassa:**
- B1 — A 360 px la barra di navigazione in basso mostra «CARRIERA AGENTE» quasi attaccate (etichette vicine, nessuna sovrapposizione misurata). Prova: `docs/collaudi/foto-7.999.172-carriera/home-360-testata.png`, `carriera-360-testata.png`.
- B2 — `esito-280.mjs` al primo giro è scaduto a 280 s (tetto mio); al secondo, con 540 s, è verde. *Processo, non prodotto.*
- B3 — `stat-279`: su 20 partite una testa è ripetuta (19/20 distinte). Sotto soglia del guardiano, da tenere d'occhio.

## 4. Non verificato

- Non ho giocato una carriera a mano dall'inizio: le voci sono state verificate con i guardiani e non con un percorso manuale completo.
- PO-279 e PO-280 sono verificati con output testuale dei guardiani, non con foto a 412/360 px della schermata del PO (`po279-punto-forte.jpg`, `po280-esito-scelta.jpg`).
- Schede del mister nel finale: la parte B non ha prodotto scheda in una partita; il giudizio sul flusso vero è assente.
- Mercato, Nazionale, coppe: non giocati a mano; `stab-nat-trigger-test` non lanciato in questo giro.
- Voci 3D della 172 (PO-273…PO-278): fuori ambito di questo collaudo carriera.
- Il BACKLOG non è stato aggiornato: la chiusura delle voci spetta alla sessione principale.

## 5. Scelte per la sessione principale

Nessun difetto richiede una scelta del PO in questo giro. Per M1 (guardiano che passa a vuoto) la scelta è questa:
- **A (consigliata):** far uscire ≠0 la parte B quando non giudica nulla, e lanciarla con più partite (`CPM_PARTITE=4`) nella catena.
- **B:** lasciare la parte B come informativa e fidarsi della parte A.
- **C:** rendere la parte B obbligatoria solo nei rilasci che toccano le schede del mister.
