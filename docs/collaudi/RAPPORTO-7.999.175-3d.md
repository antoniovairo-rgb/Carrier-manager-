# Rapporto di collaudo 3D — CPM 7.999.175

- **Build:** `main` 6ba91d4e (GAME_VERSION 7.999.175), ramo `collaudo/7.999.175-3d`. GLB acceso, 412×915, Chromium headless. Nessun file di prodotto modificato.
- **Foto e dati:** `docs/collaudi/foto-7.999.175-3d/` (sonda `partite-175.mjs`, un `dati-<partita>.json` per partita, `corpi-073-corsa1.log`). Nomi: `nuova1..6`, `nuovadetA/B` = carriere nuove; `mig1`, `migk4/k12/k13` = salvataggio migrato.
- **Verdetto:** nessun difetto di gravità alta. Il giro 75 regge: 7 partite intere da carriera nuova (nessuna scelta di stile) e 4 da salvataggio migrato arrivano al fischio senza `pageerror`, e i gol dell'eroe coincidono fra risultato, pagella e tabellino dove l'eroe ha segnato. Due rilievi medi (non causati dal giro 75, per quanto posso dire) e alcuni bassi.

## Tabella dei rilievi

| # | Gravità | Rilievo | Prova |
|---|---|---|---|
| 1 | **Media** | PO-284 apertura dell'angolo: il codice 001 (nessun compagno entro 3,5 u dal pallone) non è stabile da una corsa all'altra e il guardiano resta cieco. Seme 3: **0/20** nella corsa 1, **17/22** (77%, sopra la soglia 75% = rosso) nella corsa 2. Seme 11: 0/18 in entrambe (174: 6/18). Seme 29: **0 campioni** in entrambe (cieco, uscita 2; in 174 erano 0/23). | `node corpi-073.mjs` (intero, uscita 2, «cieco: 284f meno di due aperture misurate», `corpi-073-corsa1.log`) e `SEMI=29,3,11 node corpi-073.mjs 284f` (uscita 2, seme 3 = 17/22). Gli altri due controlli (282 recupero, 283 stacco) verdi: inclinazione max 14-16°, piede più basso 0,15 m. Macchina carica (le corse da 9 min): non escludo che il seme 29 senza campioni dipenda dal carico; il seme 3 che oscilla fra 0 e 77% no. |
| 2 | **Media** (probabile preesistente) | La scheda del mister «📢 Rigore per loro al N': la squadra ha la testa bassa…» esce **dopo il rigore a favore dell'eroe**, con la squadra dell'eroe in vantaggio (0-1, 0-2). 3 partite su 3 col rigore dell'eroe: k4 15', k12 8', k13 34'. Compare sopra lo stesso minuto del gol dell'eroe. | `migk4-06-gol-17-home2away0.png`, `migk12-03-gol-10-home1away0.png`, `migk13-09-gol-36-home2away0.png`. Causa letta nel codice, non provata: `src/15-live-match.jsx:6188` alimenta `rigContro` con `_t.away.rigori` e `src/14-motore-possesso.jsx:106` apre `rigore_contro`. Non ho confrontato con la 174: **non posso dire se sia regressione**. |
| 3 | Bassa | Intestazione del 2° tempo con le squadre invertite (ancora presente, rilievo 6 della 174): all'81' «Polisportiva Cen… 0 – 2 Selezione Granata» mentre al 25' era «Selezione Granata 0–0 Polisportiva Cen…»; il tabellone 3D resta «GRA 2 - 1 POL» e la schermata finale «Selezione Granata 2–0». I numeri sono coerenti con le squadre. | `nuova1-13-gol-80-home2away0.png` contro il 25' (foto non allegata, vista in sessione), `nuova5-17-gol-80-home2away1.png` (HUD «Polisportiva Centro 1–2 Selezione Granata» sopra tabellone «GRA 2 - 1 POL»). Non so se sia voluto (cambio di campo). |
| 4 | Bassa | Due voti per la stessa partita (k12): pagella **8,1**, ma il titolo stampa «Cronaca di Sport … (voto 7.5)». Il giro 7.999.20 aveva unificato il voto registrato; la stampa potrebbe usare un'altra fonte (non letta). | `dati-migk12.json` (`schermate[1]`: «PAGELLA 8.1» e «…decide — 2 reti … (voto 7.5)»); partita con eroe sostituito al 78'. Una sola partita con la schermata completa. |
| 5 | Bassa | Minuti dei gol nei «Momenti chiave» sfasati rispetto al registro del motore: k12 «10' Gol», «19' Tuo gol» contro motore m8 e m18. La timeline marca il rigore dell'8' come `ok:false key miss` anche se il gol è nel punteggio e in pagella (registro dell'esito, non il risultato). | `dati-migk12.json` (`motoreFin.golLog`, `tlJson`, `schermate[1]`). Non indagato: può essere il ritardo di scena per progetto. |
| 6 | Bassa (nota) | Console «[BABEL] … exceeds the max of 500KB» in ogni partita; 0 `pageerror` in tutte. | campo `errs` di ogni `dati-*.json`. |

## Cosa ho provato

| Voce | Esito | Prova |
|---|---|---|
| **Giro 75 · creazione senza stile** | ✅ | Le 7 carriere nuove partono da «Nuova carriera» → nome → «INIZIA I PROVINI» senza passaggio di stile; guardiano `node stile-unico-75.mjs` verde (16 casi di migrazione idempotenti, rosso 48 violazioni). |
| **Giro 75 · salvataggio migrato** | ✅ | `save-190-s12-ovr93` (centravanti, 28 anni): dopo il caricamento archetipo `finalizzatore`, `tratti.enfant` false, `archetipoOrig` «centravanti» (`dati-mig*.json`, campo `dopoMig`). Quattro partite (mig1 seme 1642; k4, k12, k13 della sonda `pagella-75`) fino al fischio. |
| **Gol dell'eroe: pagella = risultato = tabellino** | ✅ dove l'eroe segna | k4: pagella 2 · registrato (`__CPM_GOLEROE228`) 2 · punteggio 2-1; k12: 2 · 2 · 0-2 con tabellino «IL TUO TABELLINO Gol 2», «SHOW: 2 GOL», «Tuo gol al 19'»; k13: 2 · 2 · 2-1; nuova5: pagella 1, tabellino «Gol 1», punteggio 2-1 (rigore dell'eroe all'80'); nuovadetA/B: pagella 1, punteggio 1-3 con gol dell'eroe da scena al 41'. Il testimone `__CPM_PAG75`=1 scatta nelle tre partite con gol fluido dell'eroe. Nelle 4 partite con 0 gol dell'eroe pagella e tabellino dicono 0 (nuova1,2,3,4,6; mig1). |
| **Highlight e esiti** | ✅ | 6-7 highlight per partita; per ognuno il riquadro d'esito (etichetta, «Riuscito/Anticipato/Murato…», chip «gol N», voto) coincide con la timeline (`ActionResolved`) nelle partite lette; esempi: `nuova5-17…` (rigore «Riuscito», «gol 1»). Assist del tabellino (nuova4, nuova6: 1) = highlight `assist` ok nella timeline. |
| **Cronaca e festa** | ✅ a vista | Righe di cronaca 2D coerenti (es. «Conclusione secca di Vallone (POL) dal limite!»); banner «GOL — nome» e tabellone 3D nelle foto `*-gol-*`; testo della premiazione «Fuochi d'artificio… alza il trofeo» (k12). |
| **Fine partita** | ✅ | Tutte arrivano a `ended`/`ceremony` (276-464 s reali). |
| **174-2 apertura dell'angolo** | ⚠️ riga 1 | sopra. |
| **174-6 ordine squadre nel 2° tempo** | ⚠️ riga 3 | sopra. |
| **174-5 stessa partita due volte** | ✅ determinismo | Una dopo l'altra (non in parallelo), carriera nuova «Coll175det», seme 1571: corse A e B **identiche** nel registro gol del motore (m19 away, m41 hero da scena, m70, m91), nei minuti dei 6 highlight (3,7,22,29,33,42), nelle 6 etichette/esiti, nel punteggio 1-3 e nella pagella. Differenza solo di fase: in B compare un `hl_move` al 3° highlight che in A non c'è (non cambia l'esito). Il 174 aveva la prima corsa in parallelo: l'ipotesi «CPU contesa» è coerente con questa misura, ma non provata. |

## Non verificato
- Schermata finale completa («IL TUO TABELLINO») per k4 e k13: letta per k12 e per nuova1-6 (prima schermata dopo il fischio); per k4/k13 il pulsante «Salta premiazione» non è stato premuto in tempo: valori da `__CPM_GOLEROE228` e pagella, non dalla schermata.
- Festa 3D dell'eroe (animazione dopo il gol, esultanza, fuochi) a occhio e a 60 fps: l'headless gira a pochi fps; foto singole soltanto. Cerimonia/trofeo solo come testo.
- Le foto della schermata di creazione carriera a 360/412 px: non fatte (coperta solo dal guardiano `stile-unico-75`).
- Quota gol dell'eroe da highlight (PO-190, chiusa dal PO): 1 gol dell'eroe su 7 carriere nuove, ma 24/26 esiti fallibili `ok:false` nelle prime 4; non misuro la quota.
- Colpi di scena rari (rigori contro, espulsioni, infortuni) non incontrati. Rigore contro: la scheda del mister non è stata vista nel caso giusto.
- Salvataggi con l'Enfant acceso e Regista/Fantasista: non giocati (solo il guardiano `stile-unico-75`).
- Dispositivo reale, fps, peso; corsetta→scatto e pattinamento (giro 76): non rilanciati.
- Causa della differenza `hl_move` fra le due corse e del seme 29 senza campioni (carico della macchina?): non indagata.

## Scelte
**Riga 1 (apertura angolo instabile):**
- **A (consigliata):** lasciare la 175; far girare `corpi-073 284f` su macchina scarica per separare carico da difetto; se il seme 3 oscilla ancora, un giro sul battitore dello staging (compagno logico scelto in modo fisso).
- B: abbassare la soglia/serrare il guardiano (≥4 campioni obbligatori) senza correggere: nasconde il difetto.
- C: ritirare l'estensione 284 per l'angolo (tornare al comportamento 173).

**Riga 2 (scheda «Rigore per loro» dopo il rigore a favore):**
- **A (consigliata):** giro piccolo: far leggere `rigContro` dal lato avversario del tabellino rigori (o dal lato che ha battuto), con guardiano su rigore dell'eroe e su rigore contro.
- B: spegnere la scheda `rigore_contro` finché non è corretta.
- C: lasciare e dichiarare nel backlog.
