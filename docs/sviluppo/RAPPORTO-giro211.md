# Rapporto — giro 211 (versione 7.999.195), PO-472 e PO-473

Ramo `sviluppo/giro211-nomi-interviste`, partito da `origin/lavoro/195` (3143062). `GAME_VERSION` non toccato.
Rosso unico per le due parti: `window.__CPM_NO_G211`. Foto in `docs/sviluppo/giro211/`.
Dopo ogni modifica a `src/`: `node tools/build-src.mjs` + `node tools/check-src.mjs` → IDENTICO BYTE PER BYTE.

---

## A) PO-472 — il nome corto nella scala dei nomi delle squadre

Decisione del PO (15/11): fra il nome con la categoria e la sigla, il gradino del NOME CORTO del club, quando entra.
Origine: dubbio 9 del rapporto 203 («Torino Athletic Primavera» → «Torino Athletic U19» → sigla, senza «Torino Athletic»).

### Misura prima (braccio rosso del guardiano nuovo `nomi-211`, gioco vero, barra della partita del provino)

**Scala (funzione unica `candidatiSquadra182`, `src/11`)** su tutti i **259 club** del gioco (CLUBS + Primavera 1 e 2 + avversari
del provino): **36** hanno la categoria nel nome («… Primavera»); **35** hanno già un gradino senza categoria prima della sigla
(cominciano tutti con «FC …»: la scala del giro 190 dà già «Valmora U19» → «Valmora»); **1 solo** no: **Torino Athletic Primavera**
(nessuna sigla societaria in testa).

**Barra della partita** — ogni club sulla barra, spazio e larghezza dei testi misurati sul DOM; «salto» = sulla barra c'è la sigla
mentre il nome corto (senza categoria, anche col dizionario o senza FC/AC in testa) ci starebbe con almeno 1 px di margine:

| Vista | nomi misurati | in sigla | **salti del nome corto** |
|---|---|---|---|
| 360×640 touch | 260 | 169-171 | **0** |
| 375×667 touch | 260 | 124-127 | **0** |
| 390×844 touch | 260 | 230-236 | **0** |
| 1366×768 PC | 260 | 0 | **0** |

Cioè: **oggi nessun nome passa alla sigla saltando il nome corto alle quattro viste**, perché «Torino Athletic» (l'unico caso) non
entra mai sulla barra a quelle larghezze (a 360/375 lo spazio del nome nella striscia a colonna è di ~41-45 px). Il difetto c'è nella
scala e si vede solo dove il nome corto entra e il nome con «U19» no. Per giudicarlo la sonda lo **provoca**: scorre le larghezze touch
360→640 (passo 4 px) col club sulla barra. Braccio rosso: **22 salti** (da 520-524 px in su: «TAT» dove ci stava «Torino Athletic»),
nome corto mostrato **0** volte.

(I conteggi «in sigla» variano di qualche unità fra due esecuzioni: club al confine di 1 px, vedi Dubbi.)

### Correzione (`src/11`, `candidatiSquadra182`)
Per i club **senza** sigla societaria in testa, due gradini nuovi: il nome con la categoria tolta («Torino Athletic») subito dopo il
nome «U19», e la stessa cosa sul nome abbreviato col dizionario («Sel. Granata» da «Sel. Granata U19»). La scala resta dal più lungo
al più corto, la sigla resta l'ultima, i club «FC …» non cambiano (il loro nome corto «Valmora» c'era già). Vale ovunque passa la
funzione unica (barra della partita, `NomeSquadra182`, classifiche e simili). Rosso `__CPM_NO_G211` = scala di prima.

Scala del caso del PO, dopo: «Torino Athletic Primavera» → «Torino Athletic U19» → «Torino Athletic» → «TAT».

### Misura dopo
Scala: club con la categoria senza nome corto prima della sigla **1 → 0** su 36. Barra alle quattro viste: salti 0, nome mostrato =
primo gradino che ci sta su tutti i 260 nomi per vista. Scansione: salti **22 → 0**, nome corto mostrato **0 → 20** volte.
Foto: `barra-scansione-520-prima.png` («TAT · TAT») / `barra-scansione-520-dopo.png` («TORINO ATHLETIC»), stessa larghezza 520 px touch.
`barra-375-nome-corto-prima/dopo.png` sono **uguali**: a 375 il nome corto non entra, e la sigla resta giusta.

### Guardiano `npm run nomi-211` (≈ 3,5 min)
Scala pura su tutti i club + caso del PO esatto + club «FC …» invariato + ordine; barra a 360/375/390 touch e 1366 PC; scansione
touch 360→640. «Non giudicato» = rosso (meno di 250 club, meno del 95% dei nomi, una vista mancante, nome corto mai mostrato nella
scansione). Verde **22 ok · 0 ko**; rosso (`CPM_ROSSO211=1`) **4 ko** (scala, caso del PO, scansione: mai mostrato e 22 salti).
`nomi-190` aggiornato: il caso puro «Torino Athletic Primavera» ora pretende il gradino del nome corto (era la scala vecchia scritta
come attesa); nessuna soglia toccata. Verde 23/0, rosso `CPM_ROSSO190=1` 10 ko come prima.

---

## B) PO-473 — domande del dopo-partita coerenti con risultato ed esito del turno

La foto del PO (`docs/collaudo-po/194-intervista-serata-europea-dopo-eliminazione.jpg`, letta dal ramo
`poc/marioprada-character-system` senza copiarla): tabellino **0-0** contro FC Valdenau, voto 5,6, e la domanda «Serata europea. Che
sensazione dà giocare in questo palcoscenico?» con tre risposte di festa. È un ottavo europeo **pareggiato e perso ai rigori**: il
risultato registrato è «pareggio», l'eliminazione la decidono i rigori (`koShootoutWin`), e la domanda non guardava né l'uno né l'altra.

### Causa (`src/07`, `scegliPost183`)
1. La domanda `f_europa` non aveva alcun vincolo sul risultato.
2. **Nessuna** domanda conosceva l'esito del turno: a eliminazione diretta (coppa, KO europeo, KO di Europeo/Mondiale, finale della
   Coppa delle Nazioni) il pareggio si decide ai rigori, e la scelta non lo sapeva.
3. Fuori dal campionato uscivano domande sui punti e sulla classifica («Tre punti importanti», «Un punto in trasferta»).

### Misura prima — catalogo (braccio rosso del guardiano nuovo `interviste-211`)
**128 domande** possono uscire dopo una partita (37 sui fatti + 91 del risultato): **neutre 20** · **vittoria 51** · **pareggio 12** ·
**sconfitta 39** · **più risultati 6** · **con l'esito del turno (eliminazione, passaggio, finale) 0**.

### Misura prima — con quali partite escono oggi
3.600 partite simulate (120 stagioni da 30, seme fisso, memoria della stagione vera): campionato (posta qualunque), coppa nazionale,
coppa europea (girone e KO), Europeo/Mondiale (girone e KO), finale della Coppa delle Nazioni, amichevole. Risultato ed esito li
calcola la sonda da sola (stessi semi dei rigori del gioco); un **giudice indipendente** legge domanda e risposte (festa dopo sconfitta
o eliminazione, eliminazione dopo un passaggio, «avanti» dopo una finale vinta, turno inesistente, punti/classifica fuori dal
campionato, «punto»/«pareggio» a eliminazione diretta, risultato dichiarato diverso).

| Partita | partite | con domanda | **scelte incoerenti** | possibili incoerenti |
|---|---|---|---|---|
| eliminazione | 431 | 388 | **56** | 400 |
| eliminazione ai rigori | 142 | 124 | **69** | 416 |
| passaggio del turno | 364 | 337 | **25** | 350 |
| passaggio del turno ai rigori | 144 | 127 | **73** | 402 |
| finale vinta | 210 | 194 | **37** | 217 |
| finale vinta ai rigori | 85 | 73 | **37** | 232 |
| finale persa | 209 | 187 | **30** | 184 |
| finale persa ai rigori | 76 | 67 | **34** | 224 |
| vittoria (coppa/Europa/Nazionale, senza eliminazione) | 368 | 334 | **26** | 361 |
| pareggio (coppa/Europa/Nazionale, senza eliminazione) | 245 | 218 | **99** | 304 |
| sconfitta (coppa/Europa/Nazionale, senza eliminazione) | 403 | 346 | **68** | 372 |
| vittoria (campionato) | 326 | 249 | 0 | 0 |
| pareggio (campionato) | 231 | 177 | 0 | 0 |
| sconfitta (campionato) | 366 | 274 | **37** | 59 |
| **totale** | 3.600 | 3.095 | **591** | 3.521 (66 domande distinte) |

Esempi: «Serata europea…» dopo l'eliminazione; «La coppa si è fatta in salita. Cosa non ha funzionato?» dopo un **passaggio** ai
rigori; «Avanti in coppa… fino in fondo?» dopo la **finale vinta**; «Tre punti importanti» dopo un turno di coppa; «Un punto
guadagnato o due persi?» dopo un pareggio a eliminazione diretta; «I giornali ti daranno un voto altissimo… ti sei sentito il
migliore?» («Oggi mi riusciva tutto») dopo una sconfitta.

Copertura a memoria vuota (Europa, coppa nazionale, Nazionale × 8 esiti): **19 casi su 24 senza una domanda che parli dell'esito**,
e il caso del PO riprodotto (Europa · eliminato ai rigori → «Serata europea…»).

### Correzione (`src/07`)
- **`esitoTurno211(p, r)`**, pura: `nessuno` (partita senza eliminazione) · `passa` · `eliminato` · `campione` · `finale_persa`, con
  gli **stessi semi** dei rigori della risoluzione e della rassegna (`euroko|stagione|fase`, `cupko|stagione|turno`,
  `natko|stagione|fase`, `natcup|stagione|final`, come `_koPen85` in `src/18`). Nessuna modifica a `src/18`: la funzione legge il
  salvataggio prima dell'aggiornamento, come già fa la rassegna.
- **`coerente211(q, risultato, esito)`**: una domanda dichiara il risultato (`r`, e `r211` a gioco corretto) e l'esito che presuppone
  (`e211`); quelle che non lo dichiarano non parlano di punti e classifica fuori dal campionato e, in un pareggio a eliminazione
  diretta, non presuppongono il pareggio; quelle con risposte di festa (`festa211`) non escono dopo un'eliminazione.
- **Vincoli** su nove domande esistenti (attivi solo a gioco corretto): «Serata europea» solo con vittoria/pareggio e senza
  eliminazione; «Avanti in coppa» solo col passaggio (anche ai rigori); «La coppa si è fatta in salita» solo con l'eliminazione;
  «Un gol con la Nazionale» mai dopo sconfitta o eliminazione; rivale ed ex club (risposte «volevo dimostrare chi è il più forte»,
  «credo di esserci riuscito») mai dopo una sconfitta; tripletta mai dopo sconfitta o eliminazione; doppietta e voto alto generici
  solo dopo una vittoria (le loro varianti per sconfitta/pareggio esistevano già).
- **Quindici domande nuove**, almeno una per ogni esito: Europa (sconfitta nel girone, eliminazione ×2, passaggio, coppa vinta,
  finale persa), coppa nazionale (coppa vinta, finale persa), rigori (passati / fuori ai rigori, per coppa, Europa e Nazionale),
  Nazionale (eliminata, passa, campione, finale persa). Le domande di coppa e dei rigori sono adatte anche alla Primavera (`y:1`).
- A eliminazione diretta, fra i fatti della posta, **prima** le domande che parlano dell'esito del turno.
- `poolPost183` espone i livelli della scelta (stessa logica di prima, `scegliPost183` la usa) per poter giudicare anche le domande
  che potevano uscire.

Rosso `__CPM_NO_G211`: niente esito, niente vincoli nuovi, niente domande nuove → scelta identica a prima.

### Misura dopo (stesse 3.600 partite)
Catalogo: 142 domande (51 sui fatti) · neutre 24 · vittoria 52 · pareggio 14 · sconfitta 40 · più risultati 12 · **con l'esito
del turno 18**. Domande **scelte incoerenti 591 → 0**, domande **possibili incoerenti 3.521 → 0**, su tutte le 14 classi di partita.
Copertura: **24/24** casi con una domanda che parla dell'esito. Caso del PO: «Fuori dall'Europa. Cosa è mancato per passare il turno?»
(foto `intervista-eliminazione-europea-prima.png` / `-dopo.png`, `confronto-intervista-prima-dopo.png`; la foto la apre il varco di
collaudo `forceIv183` con la domanda scelta dalla decisione vera, strumento `tests/visual/interviste-211-foto.mjs`).

Effetto collaterale misurato: le partite con un'intervista scendono da **3.095 a 3.044** su 3.600 (−51), quasi tutte nei pareggi a
eliminazione diretta (finale vinta ai rigori 73 → 58): con meno domande adatte, la memoria della stagione esaurisce il catalogo prima e
l'intervista salta (regola del giro 183: mai una domanda ripetuta).

### Guardiano `npm run interviste-211` (≈ 15 s)
Catalogo + 3.600 partite simulate + copertura 24 casi. «Non giudicato» = rosso (meno partite, una classe di partita mai vista con una
domanda, funzione `poolPost183` assente). Verde **30 ok · 0 ko**; rosso (`CPM_ROSSO211=1`) **23 ko**.
Nota di stesura: la prima versione del giudice leggeva «fuori» da solo come eliminazione e condannava «tu sei sembrato fuori dal
gioco» dopo una finale vinta (falso positivo); ora cerca «fuori dall'Europa», «fuori ai rigori», «esce dal torneo», «eliminat…».

---

## Catene
`nomi-211` e `interviste-211` aggiunti **una volta sola** alle catene `completa` e `carriera` di `tests/visual/ci-runner.mjs`
(`nomi-211` anche fra i LENTI), script in `package.json`; `node --check ci-runner.mjs` ok, conteggio delle occorrenze verificato.
⚠️ Durante la verifica ho fatto per errore un `import` di `ci-runner.mjs`, che ha avviato la catena completa: l'ho fermata dopo il
primo passo (`interviste-211` verde); nessun file modificato (`STABILITA.json` invariato), nessun processo rimasto.

## Controlli eseguiti (uno alla volta, `CPM_CI_PAR=0`, `free -m`/`df -h` prima di ognuno)

| Controllo | Esito |
|---|---|
| interviste-211 | VERDE 30/0 (rosso 23 ko) |
| interviste-183 | VERDE (e il rosso si vede), 293 s |
| conferenza-192 | VERDE (e il rosso si vede) |
| nomi-211 | VERDE 22/0 (rosso 4 ko) |
| nomi-190 | VERDE 23/0; rosso `CPM_ROSSO190=1` 10 ko |
| nomi-salvati-190 | VERDE 19/0 |
| cronaca-nomi-190 | VERDE |
| sigle-203 | telefono VERDE 18/0 · PC VERDE 8/0 · rosso «il difetto si vede» (5 ko) — in tre chiamate separate |
| testi-190 | VERDE 14/0 |
| griglia-mobile | uscita 0, misura completa 14 schermate × 5 larghezze (foto di `docs/collaudo-grafico/g0/` rimesse com'erano) |
| career-critical | VERDE (uscita 0, 26 PASS; 732 s, oltre il tetto di una chiamata: eseguito nel turno in sottofondo con riga `FINE` e attesa in primo piano) |
| test:logic | VERDE 51/51 |
| save-compat | VERDE 12 pass · 0 fail |

## Dubbi per il PO

1. **Il nome corto non si vede sulla barra alle viste misurate**: a 360/375/390 touch «Torino Athletic» non entra (striscia del nome
   ~41-45 px a 360/375), quindi sul telefono il cambiamento si vede solo da ~520 px touch in su (tablet, telefono in orizzontale) e
   nei posti dove la funzione unica ha più spazio. È l'unico club su 259 toccato.
2. **«Sel. Granata»**: per i club senza sigla in testa ho aggiunto anche il nome corto abbreviato col dizionario dopo quello col «U19»
   abbreviato (oggi nessun club Primavera senza «FC» ha parole del dizionario: nessun effetto misurabile). Da confermare l'ordine.
3. **Fascia di confine di 1 px in `nomi-211`**: la sonda misura larghezze frazionarie, il componente `scrollWidth` intero; al confine
   i due criteri dissentono per arrotondamento (es. «FC Navarro» a 360 px: «Navarro» 45,5 px in una casella da 45). Il guardiano giudica
   solo fuori da ±1 px e lo dichiara; non è una soglia abbassata ma l'allineamento al criterio del gioco. I conteggi «in sigla» variano
   di qualche unità fra esecuzioni (larghezza del centro della barra che cambia di pochi px col cronometro).
4. **Ultima partita del girone** (europeo e Europeo/Mondiale): se fa uscire dal torneo, `esitoTurno211` la tratta come partita senza
   eliminazione (`nessuno`), perché l'eliminazione dipende dalla classifica del girone calcolata dopo. Una sconfitta lì riceve oggi
   «Serata europea amara… il girone è ancora aperto» anche quando il girone è chiuso. Non deciso.
5. **Il «rilancio»** (seconda domanda dopo la prima risposta, `rilancio24`) non guarda il risultato: può chiedere «E la classifica? Ci
   pensi?» dopo un'eliminazione europea. Fuori ambito di PO-473 (non è una domanda del dopo-partita scelta da `scegliPost183`), non
   toccato.
6. **Meno interviste nei pareggi a eliminazione diretta** (−51 su 3.600 partite, vedi Misura dopo): conseguenza della regola «mai la
   stessa domanda nella stagione». Si possono aggiungere altre domande per i rigori se il PO le vuole più frequenti.
7. **Tono delle domande nuove**: testi scritti da me (15 domande, 45 risposte, effetti su morale/popolarità/fiducia in linea con le
   vicine). Da rileggere.
8. Il percorso rosso del giro 183 (`__CPM_NO_G183`) e quello di PO-231 (`__CPM_NO_IV231`) usano ancora `pickInterviewByCtx`, che
   non conosce l'esito del turno: lì il difetto resta (sono bracci di prova, non il gioco).
9. `nomi-211` è nelle catene `completa` e `carriera` come chiesto; non l'ho messo nella `mappa` per file di `mirata` (src/11 e src/07):
   spetta al PO. Durate: nomi-211 ≈ 3,5 min, interviste-211 ≈ 15 s.
10. Roadmap (`docs/governo/ROADMAP.md`) non aggiornata: è un giro sul ramo di sviluppo, `GAME_VERSION` invariato, nessun rilascio.
