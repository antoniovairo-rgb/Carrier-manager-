# Rapporto giro 16 — PO-228 (statistiche) e PO-220 (chiusure difensive)

Ramo `sviluppo/statistiche-difesa-228`, creato da `poc/marioprada-character-system` 8c88f61 (7.999.165).
`GAME_VERSION` **non** cambiata. Zona G (carriera/classifica) non toccata. Dati grezzi di tutte le sonde in
`docs/sviluppo/dati-giro16/`.

Condizioni delle partite vere: salvataggio `fixtures/save-190-s12-ovr93.json`, `playMatch()`, autoplay
`{policy:'seeded', tickMs:150}`, `cpm-match-speed` 4, GLB spento, `?cpmtest=1`, `__CPM_PRESENT=1`, una pagina
nuova per partita, **un browser alla volta e nient'altro in esecuzione** (macchina libera).

## 1. PO-228 — ritaratura passaggi e cross

### Porting
`git cherry-pick` di `5f59075` e `018c3a6` (ramo `sviluppo/ritaratura-228`) sopra la 7.999.165: **nessun
conflitto**; il lavoro successivo in src/14 e src/15 (PO-226 compreso) è intatto. `CARRIER-MANAGER-AV.html`
ricomposto con `tools/build-src.mjs`, `tools/check-src.mjs` identico byte per byte.

### Banco (motore da solo, `tests/visual/statistiche-228.mjs`), 7.999.165 + ritaratura

| serie di semi | N per braccio | passaggi rosso → verde | cross | tiri | gol eroe rosso → verde | tiri eroe |
|---|---|---|---|---|---|---|
| 1000 | 4000 | 429,6 → 805,1 | 42,6 → 28,8 | +2,6 % | 0,127 → 0,126 (−0,6 %) | −3,3 % |
| 777 | 4000 | 428,7 → 806,7 | 42,8 → 28,8 | +1,3 % | 0,128 → 0,129 (+0,4 %) | −0,6 % |
| 5000 | 4000 | 429,4 → 806,1 | 42,9 → 28,8 | +0,7 % | 0,121 → 0,141 (+16,4 %) | +5,8 % |

Media delle tre serie (12.000 partite per braccio): gol dell'eroe 0,125 → 0,132 (+5 %), gol −0,8…+1,6 %,
xG −0,8…+0,2 %, possesso della squadra dell'eroe −3,4…−3,5 %.

### Perché il guardiano era «al limite» e com'è ora
Misurato il rumore (`statistiche-228.mjs`, riga di dispersione): a N=1000 l'errore standard della differenza
relativa è **±12,9 % sui gol dell'eroe** e ±10,1 % sul suo xG (sd per partita 0,34 e 0,27 su una media di 0,13).
La soglia fissa ±10 % a N=1000 era quindi una moneta: sullo stesso motore quattro serie da 1000 hanno dato
−9,9 % · −14,0 % · −12,3 % · +23,2 %.

Il guardiano ora (`tests/visual/statistiche-228.mjs`):
- N=4000 di default (~3 minuti, 4 worker);
- tiri dell'eroe entro ±8 % (molto meno rumorosi; il primo taglio li portava da 0,51 a 0,41);
- gol dell'eroe entro ±(10 % + 2,5 errori standard), con l'errore calcolato sulle partite stesse (~±26 % a N=4000);
- il resto invariato (passaggi 800-950, cross 20-30, tiri ±5, gol ±8, xG ±6, possesso ±5).

Esiti: **verde sulle tre serie** (tabella sopra). **Prova del rosso nuova**: `CPM_NOEROE=1` accende
`__CPM_NO_EROE228` (src/14, `_eroeDavanti228`) nel braccio verde → tiri dell'eroe **−36,3 %**, gol eroe −27,4 %
→ ❌ FAIL. Il rosso storico `CPM_ROSSO=1` (`__CPM_NO_PASS228`, passaggi < 500) resta. In catena: aggiunto a
`completa` e alla mappa `src/14-` della mirata.

### Partite vere (`tests/visual/statistiche-228-vivo.mjs`, 12 partite per braccio, semi 1-12)
Verde = gioco com'è; rosso = `__CPM_NO_PASS228`. Tabellino del motore (due squadre), pagella dell'eroe e
testimone dei gol registrati `__CPM_GOLEROE228` (src/15 `_buildEndResult`, solo con `__CPM_REC`). 24/24 partite
arrivate alla cerimonia, zero errori.

| braccio | passaggi (sd) | cross | tiri (sd) | gol | tiri eroe | gol eroe (pagella / registrati) |
|---|---|---|---|---|---|---|
| verde | 759,8 (51,4) | 28,2 | 25,0 (4,1) | 2,33 | 3,92 | 0,42 / 0,33 |
| rosso | 393,8 (17,1) | 41,3 | 21,8 (4,7) | 2,75 | 4,33 | 0,58 / 0,58 |

Lettura:
- **tiri**: +3,2 a partita (+15 %), errore standard della differenza 1,8 → 1,8 σ, **non significativo** a N=12.
  Il timore delle 4 partite di conferma del 12/10 (27-31 contro 17-18) non si riproduce in questa misura: le
  singole partite verdi vanno da 16 a 31, le rosse da 16 a 31.
- **gol dell'eroe**: 4 contro 7 gol registrati su 12 partite; con conteggi così piccoli la differenza non è
  misurabile (P≈0,27). Il banco su 12.000 partite dice +5 %.
- **cross**: 28,2, nell'obiettivo (~25, banda 20-30).
- **passaggi: 760 dal vivo contro 805 al banco.** Anche il rosso sta sotto il banco (394 contro 430): la partita
  vera produce ~6-8 % di passaggi in meno del banco in entrambi i bracci. L'obiettivo PO 814 era il valore del
  banco: **dal vivo non è raggiunto** (760, errore standard 15). Non ho ritarato: alzare il giro palla oltre
  avanzamento 70 tocca tiri e occasioni dell'eroe (nota 018c3a6: a 71-72 tiri −6/−18 %). **Decisione PO**: tenere
  814 come numero del banco, oppure chiedere ~814 dal vivo (servirebbe ~870 al banco, con nuova misura dei gol
  dell'eroe).
- Osservato una volta (k8 verde): la pagella del motore dà 2 gol all'eroe, il risultato registrato 1. Non
  indagato in questo giro; dato in `dati-giro16/statistiche-228-vivo.jsonl`.

## 2. PO-220 — «le chiusure difensive non sono per nulla precise»

### Strumento
- Testimone `__CPM_TK220` (src/12, armato solo da `__CPM_TK220ON`), nel ramo del gesto `tackle` difensivo: per
  scena registra fase e azione scelta, attesa prima del gesto (`att`, l'aggancio 7.415), distanza eroe-pallone e
  portatore-pallone quando la posa arriva a piena estensione (u=0,18 della vita 1,7 s = **contatto**, `dC`), il
  minimo eroe-pallone nella posa tenuta (`dMin`, `tMin`), il gesto effettivo, e a fine gesto le distanze dal
  pallone di eroe/nostri/loro. Unità logiche.
- Hook di sonda `__CPM_DIF220_OGNI` (src/14): una scena difensiva del motore ogni N minuti invece di una a
  partita, per avere un campione.
- Sonda `tests/visual/difesa-220-misura.mjs` (8 partite S12, `OGNI=5`).

### Misura prima (7.999.165 + PO-228, 8 partite, 24 scene) — `dati-giro16/difesa-220-prima.jsonl`
- **9 contrasti su 24 si giocavano nell'`hl_intro` della scena SEGUENTE**, prima di qualunque scelta (azione
  `null`, esito `null`): il gesto trattenuto dall'aggancio 7.415 (pallone oltre 5 u, tetto 1,4 s) o ancora in
  corsa quando l'esito si chiudeva passava intatto al cambio di scena. Nessuno lo resettava: entrando in
  `hl_intro` (src/12, blocco delle transizioni di fase) si annullava l'arco, non `actType`.
- contatto `dC` mediana 3,1 u, 13/24 oltre 3 u; minimo mediano 1,5 u, raggiunto a ~0,45 s, cioè **dopo** la
  piena estensione (0,31 s).

### Correzioni (src/12-three-match-view.jsx)
1. **Il contrasto non sopravvive alla sua scena** (rosso `__CPM_NO_INTRO220`): entrando in `hl_intro`, se il
   gesto è `tackle` va a fine vita (`actT = vita`); al fotogramma dopo u=1 l'inviluppo azzera la posa e
   `actType` muore per la strada solita. Il taglio coincide con lo stacco d'avvio dell'highlight.
2. **Tetto dell'attesa del pallone 1,4 → 0,5 s** (rosso `__CPM_NO_ATT220`, nella condizione `_hold415`): col
   punto 1 attivo, in 5 scene su 26 il contrasto non partiva **mai** dentro la sua scena (l'eroe aspettava il
   pallone fino alla chiusura dell'esito: è il «sembra disinteressato, lì per caso» del PO). Oltre 8 u il gesto
   degrada già a pressing (7.440).

### Misura dopo — `dati-giro16/difesa-220-scena-verde-rosso.jsonl`, `difesa-220-attesa05.jsonl`
| braccio | partite | scene | contrasti fuori scena | gesto mai partito | contatto dC mediana (oltre 3 u) | minimo mediano |
|---|---|---|---|---|---|---|
| prima (= entrambi i rossi) | 8 | 24 | **9** | — (finivano nell'intro) | 3,1 u (13/24) | 1,5 u |
| solo punto 1 | 8 | 21 | **0** | 5 / 26 | 3,1 u (11/21) | 1,0 u |
| rosso `__CPM_NO_INTRO220` | 4 | 11 | **4** | 0 | 3,2 u | 0,7 u |
| punti 1+2 (consegna) | 8 | 27 | **0** | **1 / 28** | 3,4 u (16/27) | 1,5 u |

**Costo dichiarato del punto 2**: le scene che prima non mostravano nessun gesto ora lo mostrano, ma alcune col
pallone lontano (dC 8-14 u in 6 scene, 4 delle quali su esiti falliti «beaten/deflected»); per questo contatto e
minimo peggiorano in mediana. Scelta: un intervento visibile e un po' impreciso è meglio di un eroe fermo per
tutta la scena, che è la segnalazione del PO. Se il collaudo sul dispositivo dice il contrario, `__CPM_NO_ATT220`
riporta il tetto a 1,4 s.

### Tentativo ritirato
«Il contatto aspetta il pallone»: nella sola salita della posa, oltre 1,6 u dal pallone il gesto avanzava a un
terzo, perché la piena estensione cadesse sul pallone. **Misurato peggio** (`dati-giro16/difesa-220-salita-ritirata.log`,
4 partite): in 6 scene su 12 la posa non arrivava mai a piena estensione prima che l'esito si chiudesse
(gesto troncato a u≈0,15). Ritirato dal sorgente.

### Cosa resta aperto (misurato, non corretto)
- **Contatto lontano**: alla piena estensione l'eroe è a 3,1-3,4 u mediana dal pallone; la spinta 7.420 è
  latchata una volta all'inizio del gesto e il driver dell'eroe ha inerzia, quindi su un portatore che si
  sposta la gamba tesa arriva dove il pallone era. Rimedio possibile (non provato): ri-mirare la spinta sul
  pallone vivo durante la salita sugli esiti riusciti.
- **Esito raccontato contro 3D**: la misura «a fine gesto chi è più vicino al pallone» **non è affidabile** (a
  fine gesto il pallone d'esito è spesso in volo e la scena chiude prima, u 0,2-0,7): 7/21 «incoerenti» prima,
  16/27 dopo il punto 2 solo perché la misura cade prima nel gesto. Non ne traggo conclusioni; serve leggere
  il padrone del pallone a fine `hl_result` (`__CPM_OWN`), non a fine gesto.
- Tutto il lavoro PO-220 è **GLB spento e headless**: la resa va collaudata sul dispositivo (direttiva CH38).

### Guardiano
`npm run difesa-220-scena` (= `GIUDICA=1 K=1,2,3 OGNI=5 node difesa-220-misura.mjs`, ~28 minuti): verde se su
almeno 3 scene nessun contrasto si gioca fuori dalla sua fase e le scene col gesto mai partito sono al più il
15 % (minimo 1); il braccio rosso (`__CPM_NO_INTRO220`) deve mostrare almeno un contrasto fuori scena, altrimenti
lo dichiara (dipende dalle catene di scene dell'autoplay, come `difesa-220`). In catena `completa` e nelle mappe
`src/12-` e `src/14-` della mirata.

## 3. File toccati
- `src/14-motore-possesso.jsx`: ritaratura PO-228 (cherry-pick), `__CPM_NO_EROE228` in `_eroeDavanti228`,
  `__CPM_DIF220_OGNI` nell'innesco della scena difensiva (strato 7).
- `src/12-three-match-view.jsx`: testimone `__CPM_TK220`, fine vita del contrasto in `hl_intro`, tetto attesa 0,5 s.
- `src/15-live-match.jsx`: testimone `__CPM_GOLEROE228`.
- `tests/visual/`: `statistiche-228.mjs` (stabile), `statistiche-228-vivo.mjs`, `difesa-220-misura.mjs`,
  `package.json`, `ci-runner.mjs` (catene).
- `docs/governo/BACKLOG.md` (stato PO-228, PO-220), questo rapporto, `docs/sviluppo/dati-giro16/`.

## 4. Catena mirata
`node ci-runner.mjs mirata` sul commit 6256aa6 (file toccati rispetto a main: src/07, 12, 14, 15, 18 → 52 passi),
registrata in `docs/governo/STABILITA.json`: **50/52 verdi**.

| passo | esito | nota |
|---|---|---|
| `validate-situations` | ❌ 2/2 → **✅ 14/14 dopo la riparazione** | `live-smoke`: «coda HL reattiva non processata (numHL 3→3)». **Causa misurata**: nel provino (partita seedata, deterministica) la ritaratura PO-228 fa nascere al 2' un'occasione dell'eroe dal motore (`scena`, `src: motore-occasione`, «Tiro da 30 metri»); senza una scelta il clock resta fermo e la coda reattiva del minuto dopo non viene servita nei 6 s. Col rosso `__CPM_NO_PASS228` la coda entra al 3' come sul commit di partenza (sonda su worktree 8c88f61, 3/3 identici). Non è il percorso reattivo rotto: il check ora, se dopo 6 s la fase è `hl_*` con numHL invariato, fa risolvere la scena all'autoplay e aspetta fino a 30 s; se la coda non viene servita resta FAIL (commit 0980205). Rilanciato da solo: **✅ PASS 14/14**, live-smoke clock 1'→3', numHL 3→4. |
| `nomi-219` | ❌ 2/2 | «verde: vicini **100 %** su **6** nominati (servono ≥90 % su ≥12)»: la qualità misurata è piena, manca il **campione** (pavimento di 12 compagni nominati in 8 partite). Il guardiano era verde sulla 7.999.164; è già stato rosso per campione il 09/10 e l'11/10. Causa probabile la ritaratura PO-228 (partite diverse, meno scene con un compagno nominato), **non verificata** (servono ~2×72 minuti). Rimedio già usato dal guardiano (7.999.158): allargare il campione, non abbassare il pavimento. Decisione aperta. |
| `buildup-sync` | ⚠️ instabile (verde alla 2ª prova) | prima prova: «gi4/az0: salto del pallone di 22,2u in 236ms al passaggio di beat INGRESSO→pass» — scena d'attacco forzata, fuori dal ramo del contrasto toccato qui; nessuno storico per confrontare (una sola corsa precedente nel registro). |
| `difesa-220-scena` | ⚠️ instabile (verde alla 2ª prova) | la prima prova girava in parallelo a `career-critical`; il motivo del rosso è andato perso perché l'ultima riga veniva tagliata dalla coda del runner (240 caratteri). Rilanciato da solo: **✅ verde** (verde 9 scene, 0 fuori scena; rosso 3 contrasti fuori scena su 3 partite). Uscita corretta: ora l'ultima riga porta esito e motivi. |
| tutti gli altri 48 | ✅ | fra questi `statistiche-228` (199 s), `tabellino-228`, `difesa-220`, `partita-vera`, `esiti-218`, `scene-221`, `interazioni-226`, `career-critical`, `save-compat`. |
