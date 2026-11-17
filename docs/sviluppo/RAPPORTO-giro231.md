# RAPPORTO — giro 231 (riparazione, versione 7.999.196)

Ramo `sviluppo/giro231-rinnovo-momento`, partito da `lavoro/196` (f9005d3). **Nessuna modifica al gioco** (`src/` e
`CARRIER-MANAGER-AV.html` intatti, `GAME_VERSION` non toccata): avevano ragione il gioco e le decisioni registrate, i guardiani
erano rimasti indietro. Quindi niente `__CPM_NO_G231`; i tre guardiani sono stati aggiornati e qui sotto spiego ogni riga.

## 1. Misura: da quale commit sono rossi

`momento-173` sezione 2 (`CPM_SOLO173=2`), stesso banco, commit diversi in un worktree separato:

| Commit | Versione | Punto 2 «tasto spento col motivo» | Punto 2 «dopo il rifiuto torna normale» |
|---|---|---|---|
| `dab34a7` (lavoro/194, prima del giro 198) | 7.999.193 | ✅ «Prima rispondi al rinnovo» | ✅ tasto normale, fermate `["partita chiave"]` |
| `8142761` (giro 198) | 7.999.193 | ❌ «Prima rispondi al rinnovo → vai all'Agente» | ❌ spento, «chiudi prima la finestra aperta», `[]` |
| `7f42411a` | 7.999.195 | ❌ identico | ❌ identico |
| `f9005d3` (lavoro/196) | 7.999.196 | ❌ identico | ❌ identico |

Il commit esatto è **`8142761` — «Giro 198: … il tasto del momento porta al rinnovo, richiami del presidente …»**. L'ipotesi del
giro 221 è esclusa: il rosso c'è già in 7.999.195, che il 221 non contiene. `momento-165` (2 rossi) e `momento-165b` (2 rossi) su
`lavoro/196` hanno la stessa origine (vedi sotto).

## 2. Causa: tre cose del giro 198 (e una del 194) che i guardiani non conoscevano

Tutti e tre i guardiani aprono la stessa carriera di prova: professionista, **settimana 28**, contratto all'ultimo anno, fiducia 80.

1. **La finestra del presidente (PO-432, `richiamo198`).** Dal giro 198, con contratto all'ultimo anno, dalla sett. 19 il
   presidente richiama una volta in una finestra (`dismissable={false}`) che copre la Home. Una carriera caricata alla 28 senza
   `player.richiamo198` la riceve subito al caricamento. Con la finestra aperta `_saltaMotivo163` dice «chiudi prima la finestra
   aperta» (src/18 r. 1661) e la corsa non parte. Il banco di `momento-173` toccava il tasto con un `click()` da script, che passa
   *sotto* la finestra; la trattativa si apriva e la finestra si nascondeva (`richiamo198&&!negoModal`); al rifiuto la finestra
   tornava. In `momento-165b` il clic vero sulla card del rinnovo andava in timeout proprio perché la finestra intercetta il tocco.
   **Nel gioco vero questo non succede:** il giocatore vede la finestra e risponde («Parliamo del rinnovo» o «Ci penso») prima di
   poter toccare altro.
2. **Il motivo è un collegamento (PO-446).** Dal giro 198, da professionista, la riga del motivo «Prima rispondi al rinnovo» è un
   pulsante che porta alla scheda Agente: testo «Prima rispondi al rinnovo → vai all'Agente», `data-g198="vai"`. Il 173 confrontava
   la stringa esatta di prima.
3. **Il riepilogo della fermata «rinnovo» (PO-446 + giro 194 PO-410).** Dal 194 il riepilogo non ha più «Ok» e sparisce alla
   prossima azione; dal 198 sulla fermata «rinnovo» il suo unico pulsante è «📋 Vai al rinnovo →». I banchi di 165 e 165b
   «chiudevano il riepilogo» toccando l'ultimo pulsante dentro: cioè andavano alla scheda Agente, la Home spariva e la seconda
   corsa non partiva.

Regole registrate: DECISIONI.md (ramo `poc/marioprada-character-system`), 14/11 ~18:50 «giro 198 unito in lavoro/195 … 10/10
controlli verdi», PO-432/446/456 scelti dal PO (riga 1548-1549, «G193-16 tasto che dice dove andare (PO-446)», «G193-01 svincolato
(PO-432)»). Le regole del 165b («il rinnovo ferma finché non è risolto», r. 1292) e del 173 («rinnovo aperto = tasto spento con
"Prima rispondi al rinnovo" che apre la card», r. 1317) restano valide e restano giudicate.

## 3. Le modifiche ai guardiani, riga per riga

**Tutti e tre** — nuova funzione `chiudiRichiamo198(page)`: aspetta fino a 3 s il pulsante vero `[data-cpm="richiamo198-dopo"]`
(«Ci penso») e lo tocca con un clic Playwright (quindi solo se è davvero toccabile), restituisce se la finestra c'era. Il risultato
va nelle note del guardiano («finestra del presidente (giro 198) aperta al caricamento, chiusa con «Ci penso»» oppure «assente»).
È il gesto del giocatore vero; non salta nessuna regola, e il richiamo stesso resta giudicato da `svincolato-198` (parte A).

**momento-173.mjs**
- costanti `MOT173 = "Prima rispondi al rinnovo → vai all'Agente"` e `VAI173 = true`, con commento che cita 173 e 198;
- `tasto()` legge anche `vai` (= la riga del motivo ha `data-g198="vai"`);
- sezione 2: `chiudiRichiamo198` subito dopo l'apertura della carriera;
- controllo del motivo: da `a.motivo === 'Prima rispondi al rinnovo'` a `a.motivo === MOT173 && a.vai === VAI173`. È **più
  stretto** di prima: pretende la frase del 173 *e* il collegamento del 198. Il messaggio stampa l'atteso.
- Il controllo «dopo il rifiuto il tasto torna normale e la corsa non si ferma sul rinnovo» **non è cambiato**.

**momento-165b.mjs**
- `chiudiRiepilogo` tocca l'ultimo pulsante del riepilogo **che non sia** `salta198-vai`; se non ce n'è nessuno non tocca niente
  (dal 194 il riepilogo si chiude da solo alla prossima azione);
- sezione 3: `chiudiRichiamo198` dopo l'apertura. I due controlli (due fermate «rinnovo» di fila; risolto il rinnovo, nessuna
  fermata «rinnovo») sono **invariati**.

**momento-165.mjs**
- sezione 4: `chiudiRichiamo198` dopo l'apertura;
- le due chiusure del riepilogo (r. ~211 nel giro della stagione, r. ~250 nella sezione 4) escludono `salta198-vai`, come sopra;
- controllo «ripartendo, il rinnovo non riferma nella stessa stagione»: **reso più stretto**. Prima bastava
  `L.filter(m=>m==='rinnovo').length===1`, che è vero anche se la seconda corsa non parte mai (con una sola fermata nell'elenco).
  Misurato: con il riepilogo che portava all'Agente il controllo sarebbe passato a vuoto. Ora pretende anche che tasto e «Vai»
  della seconda corsa siano stati toccati (`t2 && v2`) e che l'elenco abbia almeno due fermate (`L.length >= 2`).

Nessuna soglia abbassata, nessun controllo tolto.

## 4. Controlli (uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`)

| Controllo | Esito | Numeri |
|---|---|---|
| momento-165 | ✅ verde | 33 verdi, 0 rossi · seconda corsa avviata, fermate `["rinnovo","partita chiave"]` |
| momento-165 rosso (`CPM_ROSSO165=1`) | ✅ bocciato | 12 verdi, 2 rossi, esce 1 |
| momento-165b | ✅ verde | 22 verdi, 0 rossi · due fermate «rinnovo»; dopo «Rifiuta» `["scelta da fare"]` |
| momento-165b rosso (`CPM_ROSSO165B=1`) | ✅ bocciato | 16 verdi, 6 rossi (fra cui «due corse di fila» → `rinnovo, scelta da fare`), esce 1 |
| momento-173 | ✅ verde | 20 verdi, 0 rossi |
| momento-173 rosso (`CPM_ROSSO173=1`) | ✅ bocciato | 10 verdi, 10 rossi (punto 2: motivo null, tasto acceso), esce 1 |
| momento-185 | ✅ verde | 25 ok, 0 ko |
| momento-194 | ✅ verde | A · B · C verdi, rossi bocciati |
| barra-221 | ✅ verde | rossi `__CPM_NO_G221` e `__CPM_NO_G229` bocciati |
| agente-198 | ✅ verde | A · B verdi, rossi bocciati |
| svincolato-198 | ✅ verde | A due richiami · B schermata svincolato, rossi bocciati |
| test:logic | ✅ verde | 51 pass, 0 fail |
| save-compat | ✅ verde | 12 pass, 0 fail |
| career-critical | ✅ verde | esce 0, nessun ❌ (eseguito in sottofondo con attesa in primo piano: supera i 10 minuti) |

Le foto rigenerate da momento-194, agente-198 e svincolato-198 in `docs/sviluppo/giro194/` e `giro198/` sono state rimesse con
`git checkout --` e non committate.

## 5. Dubbi per il PO

1. **Motivo del tasto con la finestra del presidente aperta.** Il rapporto del giro 198 dice «il richiamo aperto ferma il tasto
   (motivo `rinnovo`, quindi con il tasto "Vai al rinnovo →")»: vale per la **corsa** (src/18 r. 1700, fermata «rinnovo»). Per il
   **tasto spento**, invece, con la finestra aperta il motivo è «chiudi prima la finestra aperta» (r. 1661). Il giocatore non lo
   vede (la finestra copre la Home), quindi non l'ho toccato; se il PO vuole la stessa parola nei due posti, è una riga.
2. **Richiamo che arriva caricando una carriera a metà stagione.** Una carriera salvata prima del 198 e riaperta dopo la sett. 19
   riceve il primo richiamo al caricamento (una volta). È la regola del 198 applicata a un salvataggio vecchio; lo segnalo perché è
   la prima cosa che vede chi riapre.
3. **Richiamo dopo un rifiuto.** Il 198 vuole i richiami «anche dopo un rifiuto della controfferta»; il 165b vuole che, rifiutato,
   la corsa non si fermi più sul rinnovo. I due si toccano alla sett. 33 (secondo richiamo): la corsa si ferma con motivo «rinnovo»
   anche dopo un rifiuto. Nei guardiani la corsa dopo il rifiuto si ferma prima (partita chiave / scelta), quindi oggi nessuno
   giudica quel caso. Non l'ho misurato in partita lunga: da decidere quale regola prevale.
