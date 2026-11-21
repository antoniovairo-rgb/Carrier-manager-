# Giro 310 — Correzioni di bilanciamento (vagone 3 del treno 7.999.200)

Ramo `sviluppo/giro310-bilanciamento`, partito da `sviluppo/giro309-bilanciamento` (= `lavoro/200` 7.999.199 + sonde del giro 309).
`GAME_VERSION` non toccato. Sei correzioni decise dal PO il 21/11 (11:30, `docs/governo/DECISIONI.md` su
`poc/marioprada-character-system`), ciascuna con il suo interruttore rosso, misurata prima e dopo, e un guardiano nuovo
`npm run bilancio-310` che giudica i dodici bracci (verde col verde, rosso col rosso).

Sonde di misura (cartella `tests/visual/`, uscite in `tests/visual/out/misura-310/`, non versionate):

| sonda | cosa misura |
|---|---|
| `misura-310-stampo.mjs` | A: 120 arrivi a stagione in corso (settimana 20), verde contro rosso nella stessa pagina |
| `misura-310-infortuni.mjs` | D: `simInjuryRoll` vera (esposta da `__CPM_CAREER`), 4.000 stagioni da 38 partite per fatica |
| `misura-310-motore.mjs` | E/F: gialli dell'eroe e della squadra nel motore senza grafica, voto simulato per OVR |
| `misura-310-carriera.mjs` + `misura-310-yoyo.mjs` | C/D/E: le stesse 5 carriere da bandiera del giro 309 (+1 con fatica trascurata), 14 stagioni, verde contro rosso |
| `bilancio-310.mjs` | il guardiano (A, C, D, E, F in pagina senza grafica; B in una partita di carriera 2D, GLB spento) |

---

## Tabella prima / dopo

«Prima» = braccio rosso (interruttore acceso = comportamento del 7.999.199), «dopo» = braccio verde, stessa pagina o stesse carriere.

| # | decisione PO | interruttore | misura | prima | dopo |
|---|---|---|---|---|---|
| A | PO-597 stampo → motore della simulazione | `__CPM_NO_G310A` | punteggi distinti (120 arrivi, 2.040 giornate) | **5** | **34** |
| | | | striscia più lunga di esiti identici, media (atteso indipendente 3,4) | **10,24** | **3,55** |
| | | | arrivi con striscia ≥ 5 | 100% | 20% |
| | | | vittorie mostrate al rovescio («V 0-2») | 299 / 592 | **0 / 710** |
| | | | riga del club in classifica ≠ somma del calendario | 114 / 120 | **0 / 120** |
| | | | anteprima dell'offerta = accettazione | 120 / 120 | 120 / 120 |
| | | | tempo alla firma (prima chiamata, headless) | 0 ms | mediana **1.137 ms**, massimo 1.668 ms |
| | | | foto del PO (FC Augusta, stagione 1, arrivo sett. 20) | 7× «N 1-1», poi V 2-0 / V 0-2 alterne, **35 punti** | 17 risultati vari, **7 punti** |
| B | forza unica dal vivo | `__CPM_NO_G310B` | forza passata al motore dal vivo, save-194 con spostamenti +9 (club) / +15 (avversario) | casa 36 · ospiti 25 (prestigio puro) | casa **45** · ospiti **40** |
| C | meno yo-yo | `__CPM_NO_G310C` | neopromossa 15ª su 18 in Lega A, spostamento +8 prima del rinnovo | 8 → **3,8** | 8 → **8** |
| | | | 5 carriere × 14 stagioni: retrocessioni l'anno dopo la promozione | **4 su 10** promozioni | **1 su 8** |
| | | | … entro due stagioni | **5 su 10** | **2 su 8** |
| D | infortuni ~0,6 a stagione | `__CPM_NO_G310D` | infortuni a stagione, fatica a inizio partita 38 (curata) | **0** | **0,60** (48% stagioni senza) |
| | | | fatica 30 / 55 / 70 / 78 | 0 / 0,92 / 1,81 / 1,86 | 0,49 / 0,84 / 1,58 / 1,66 |
| | | | chi non gioca (quota 0), 3.000 tiri a fatica 60 | 93 infortuni | **0** |
| | | | 5 carriere gestite (70 stagioni), infortuni dell'eroe | 6 (giro 309) | **21** (0,30 a stagione) |
| | | | carriera con fatica trascurata (8 stagioni) | 14 infortuni, 68 sett. fuori | 7 infortuni, 33 sett. fuori |
| E | gialli dell'eroe vicini al medio + squalifiche | `__CPM_NO_G310E` | gialli dell'eroe a partita (300 partite del motore, OVR 70) | **0,303** | **0,157** |
| | | | gialli della squadra / dell'avversario a partita | 2,263 / 2,067 | 2,267 / 2,067 |
| | | | squalifiche nelle simulate | impossibili (cartellini buttati) | 5° giallo e rosso squalificano |
| | | | squalifiche dell'eroe, 5 carriere gestite (70 stagioni) | 0 (giro 309) | **37** (0,53 a stagione) |
| | | | proiezione dal motore, 20 stagioni da 34 (regola 5 gialli/rosso) | — | 0,95 a stagione* |
| F | voto simulato +0,3 sotto OVR 72 | `__CPM_NO_G310F` | voto simulato medio, OVR 60 / 66 / 71 (150 partite) | 6,10 / 6,12 / 6,15 | **6,40 / 6,42 / 6,45** |
| | | | OVR 72 / 78 | 6,16 / 6,14 | 6,16 / 6,14 (invariato) |

\* misurata prima della taratura finale dei gialli (0,178 a partita invece di 0,157): con la taratura il numero scende di poco.

---

## 1. A — Stampo → motore della simulazione (PO-597)

**Dove.** `legaDopoTrasferimento212`, `src/09-audio-scout-anagrafiche.jsx` (blocco `[giro 310 · PO-597]`).

**Cosa cambia.** Ogni giornata di lega già passata quando l'eroe arriva la gioca `simulateMatch(club, avversario, 65, inCasa,
standingsSeed(club,stagione,settimana)+giornata·31+1, spostamenti, {motore:true})`: lo stesso seme della Simula, senza
`giocatore` (l'eroe non c'era: nessun bonus OVR, nessuna decisione del mister). Il risultato è scritto con `homeScore` = gol del
club, come in ogni altro percorso, **mai rovesciato in trasferta**. La classifica somma quei risultati e usa il seme di lega del
gioco (`standingsSeed(club,stagione,settimana)`, prima un hash a parte), lo stesso della riconciliazione
`rebuildStandingsFromCalendar`.

**Anteprima = accettazione.** L'anteprima dell'offerta (PO-212, `src/18` ~7604) chiama la stessa funzione **durante il disegno**:
per non rigiocare 17-19 partite a ogni disegno il risultato è tenuto in una piccola memoria (`legaDopoTrasferimento212._m310`,
massimo 12 voci) per club · lega · stagione · settimana · spostamenti. Misurato: 120 su 120 identiche, anche nel braccio rosso.

**Costo.** ~1,1 s in headless alla prima chiamata (la seconda è immediata). Sul telefono **non misurato**: vedi Dubbi.

## 2. B — Forza unica dal vivo («Crescita del club ovunque»)

**Dove.** `src/15-live-match.jsx`, creazione del motore del possesso (`_forza310`, accanto a `_heroP`).

**Cosa cambia.** La forza di entrambe le squadre passata a `creaMotorePossesso` è `prestigio + clubPrestigeShifts[id]`, con lo
stesso clamp 30-99 di `simulateMatch`. Le gare di Nazionale restano escluse (nessuno spostamento per le nazioni). Il bonus OVR
dell'eroe (`_fz156`) resta **solo** nella simulata, come deciso. Nessun sorteggio aggiunto: cambia un numero in ingresso, non
l'ordine dei sorteggi; `match-sequence` lo conferma (vedi Controlli). `__CPM_FORZA19` (solo collaudo) ha ancora la precedenza.

**Limite.** Il gioco fluido vecchio (`bgMicroTick`, solo senza `V2L`) legge ancora il prestigio puro: con il motore V2 non decide
i gol, quindi non l'ho toccato.

## 3. C — Meno yo-yo

**Dove.** Rinnovo di stagione, `src/18-career-app.jsx` (deriva degli spostamenti, `_prom310`, e campo `promo310`).

**Cosa cambia.** Il salto d'ufficio a 56 effettivi alla promozione resta. Nuovo campo additivo `promo310 = {id, season}` (stagione
della promozione; nessun bump di `SAVE_VERSION`: è assente nei salvataggi vecchi e la regola semplicemente non si attiva). Nelle
prime **due** stagioni dopo la promozione, se il club del giocatore **resta** nella divisione superiore, lo spostamento non scende
(niente deriva negativa né decadimento dell'8%); sale se merita. Retrocesso: la regola di prima. Ho scelto la prima delle due
varianti indicate dal PO («niente deriva negativa nelle prime 2 stagioni se il club si salva»).

**Misura.** Caso costruito (bilancio-310): neopromossa 15ª su 18 con +8 → verde 8, rosso 3,8. Sulle 5 carriere: retrocessioni
l'anno dopo la promozione 1 su 8 contro 4 su 10, entro due stagioni 2 su 8 contro 5 su 10.

⚠️ **Le carriere non sono appaiate.** Già nella prima stagione (prima di qualunque promozione) verde e rosso divergono: la
settimana vissuta usa sorteggi non seedati (crescita, eventi), quindi le due serie di 5 carriere sono due campioni diversi, non
la stessa carriera con e senza la regola. Con 8-10 promozioni per braccio il confronto è un ordine di grandezza. La prova
causale è il caso costruito del guardiano.

## 4. D — Infortuni (~0,6 a stagione)

**Dove.** `src/18-career-app.jsx`: `rischio310` + `simInjuryRoll` (simulata) e il percorso giocato (`onMatchEnd`, ~4340).

**Cosa cambia.** Per partita **giocata**: `1,0% + 0,04% × max(0, fatica di partita − 40) + 3% sopra 82`, moltiplicato per lo
sconto del preparatore (`_fx24`, invariato) e per la **quota di minuti** (simulata: `quota156` della decisione del mister; giocata:
minuti veri, minimo 0,35 come la fatica). Chi non scende in campo non si infortuna (PO-263): nella giocata con 0 minuti il tiro
non si fa; in «Avanza» (che prima tirava anche per lo svincolato) svincolato e squalificato non tirano più. Stesso numero e ordine
di sorteggi: cambia solo la soglia. Severità e durate invariate.

**Misura.** Con la funzione vera: fatica 38 → **0,60** a stagione (obiettivo del PO), contro 0 prima. Nelle 5 carriere gestite
**0,30** a stagione (21 in 70): meno della stima, vedi Dubbi.

**Guardiano esistente adattato.** `infortunio-263.mjs` cercava le settimane-controllo con la **copia** della regola vecchia
(tiro < 0,07 a fatica 90): con la regola nuova (6,4% a fatica 100, scalato dalla quota) il controllo «sano a fatica 90 si
infortuna» in coppa non scattava più. Ora la sonda sceglie solo i tiri sotto **0,02** (scattano anche a un terzo di partita), e
col rosso `__CPM_NO_G310D` la regola di prima. È più severa nella scelta, non più permissiva: se non trova una settimana esce
«misura cieca» (rosso). Verde verde, rosso rosso (11 controlli falliti).

## 5. E — Gialli dell'eroe e squalifiche

**Dove.** `src/14-motore-possesso.jsx` (`_cart913`), `src/10-folla-stadi-ritiro.jsx` (`simulateMatch`: `cart310` non
enumerabile, come `base158`), `src/18-career-app.jsx` (`cartellini310`, `_cartA310`, soglia del percorso giocato).

**Gialli dell'eroe nel motore.** Il primo giallo dell'eroe resta suo con probabilità 0,413 (hash di seme e passo, **nessun
`rnd()` in più**); altrimenti va al compagno di movimento più vicino ancora senza ammonizioni. Se nessun compagno è libero resta
all'eroe: per questo la soglia è 0,413 e non 0,545 (= 0,15/0,275); tarata con la misura (0,178 → 0,157). Squadra 2,263 → 2,267
gialli a partita (il compagno ammonito gioca poi col suo giallo: il secondo costa undici volte meno, quindi cambia di poco
l'andamento), avversari identici.

**Squalifiche.** `cartellini310` aggiorna gli stessi campi della giocata (`yellAccum`, `isSuspended`, `seasonCards`, già nel
salvataggio): **5 gialli = 1 giornata** (conto azzerato dopo la squalifica), **rosso = 1 giornata** (e, come dal vivo oggi, il
rosso azzera il conto dei gialli). Applicata nella Simula (lega, coppa, girone europeo) e in «Avanza» (lega, coppa, girone e KO
europei). Nel percorso giocato la soglia passa da **3 a 5** (testi «accumulo x/5», «5° giallo»). La squalifica si sconta alla
gara di club successiva: con il tasto «Simula» come prima (PO-222); in «Avanza», che prima la ignorava (l'eroe squalificato
giocava), ora l'eroe resta in tribuna (voce `squalificato`, nessuna presenza né voto) e la squalifica si azzera. Una Simula
chiamata senza il tasto (scorciatoia di `__CPM_CAREER.step`) ora azzera anch'essa la squalifica scontata: senza, la prima
misura di carriera aveva l'eroe «squalificato» per 33 giornate di fila.

**Nota sul giro 309.** Il rapporto 309 scriveva «non c'è squalifica per somma di gialli in nessun percorso»: nel percorso
giocato c'era (3 gialli, `src/18` ~4386, «Sprint 75»). Nelle simulate no.

**Non coperti.** Il KO europeo nella Simula (`simulateAndAdvance`, ramo `isEuroKO`) non conta i cartellini; il recupero di più
settimane in un colpo (`src/18` ~5377, `_xopp`) nemmeno. Le Nazionali sono escluse per scelta (la squalifica di club non vale lì).

## 6. F — Voto simulato +0,3 sotto OVR 72

**Dove.** `simulateMatch`, `src/10` (prima di costruire il risultato): +0,3 alla base (`base158` della pagella o formula), una
volta sola, prima dei gol e degli assist del tabellino (`votoSimEroe`). Misura: +0,30 esatto sotto 72, 0,00 da 72 in su.

---

## Controlli

Tutti uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, dopo `node tools/build-src.mjs` + `node tools/check-src.mjs`
(IDENTICO BYTE PER BYTE).

| controllo | esito |
|---|---|
| `bilancio-310` (nuovo) | **12/12** bracci con l'esito atteso |
| `test:logic` | 51/51 |
| `save-compat` | 12 pass · 0 fail |
| `career-invariants` | verde |
| `stab-nat-trigger-test` | verde |
| `career-sim-test` | verde |
| `tripath-chokepoint-test` | verde |
| `squalifica-222` | verde col verde, rosso col rosso (9 controlli falliti) |
| `infortunio-263` | verde col verde, rosso col rosso (11) — dopo l'adattamento descritto al §4 |
| `simula-v2` | verde + rosso atteso |
| `partita-v2` | verde + rosso atteso |
| `sim-motore` | **ROSSO**: B «gol a partita 2,29 fuori da 2,3-3,5» (vedi sotto) |
| `solo-highlight-166` | verde «PASSA», rosso «CADE su 3, 7 e 8» |
| `partita-vera` | verde, 12 bande su 12, partite finite 2/2 |
| `match-sequence` | verde («le tre velocità raccontano la stessa partita») |
| catena «sentinelle» | **non eseguita**: il giro 308 non è unito in `lavoro/200` (`1cbc414`, la catena sta solo su `sviluppo/giro308-metodo`) |
| `career-critical`, `highlight-95`, `ingresso-206` | non eseguiti, come richiesto |

**`sim-motore` rosso, dichiarato.** Il braccio B gioca 200 partite a pari forza con semi fissi: sulla base (309) dà **2,30**,
esattamente sulla soglia; con il giro 310 **2,29** (due gol in meno su 460). La causa è il punto E: spostare un giallo dall'eroe
a un compagno cambia chi può prendere il secondo giallo, e quindi la traiettoria della partita da lì in poi. Su un campione più
grande (1.200 partite, semi diversi) i due bracci sono uguali: **gol 2,357 contro 2,361, rossi 0,184 contro 0,185** a partita. Non
ho abbassato la soglia né cambiato i semi del guardiano. Il guardiano resta rosso finché il PO non decide (vedi Dubbi).

---

## Dubbi per il PO

1. **`sim-motore` rosso di un soffio (2,29 contro la soglia 2,3).** La base era già esattamente sulla soglia (2,30); su 1.200
   partite i gol non cambiano. Tre strade, tutte del PO: accettare il rosso fino a una taratura dei gol del motore (il giro 309
   lo segnalava già: il motore segna meno del calcio vero, 2,2-2,4 contro 3,2 della Bundesliga 2023/24); oppure togliere la
   correzione dei gialli dell'eroe (E, prima parte) e tenere solo le squalifiche; oppure assegnare il giallo tolto all'eroe senza
   darlo a nessuno (ma allora i gialli di squadra scendono del ~5%, contro «senza toccare i cartellini di squadra»).
2. **Costo dello stampo sostituito alla firma.** ~1,1 s in headless alla prima chiamata (anteprima o firma), poi la memoria la
   rende immediata. Sul telefono non l'ho misurato: se pesa, si può calcolare in un `setTimeout` dopo il primo disegno
   dell'anteprima, o usare il Poisson (immediato) come ripiego.
3. **Infortuni nelle carriere: 0,30 a stagione, non 0,6.** La funzione dà 0,60 a fatica 38 su 38 partite tutte da titolare;
   nelle carriere l'eroe gioca meno minuti (panchina decisa dal mister: la quota scala il rischio) e la fatica al momento della
   partita non è sempre quella media. Se l'obiettivo è 0,6 **in carriera**, la base va alzata (es. 1,8-2%); se è 0,6 a parità di
   partite intere, è giusto così.
4. **Squalifiche: 0,53 a stagione nelle carriere** (37 in 70), sotto l'«~1-2» atteso. La regola è quella decisa (5 gialli,
   rosso); il numero basso viene dal tasso di gialli dell'eroe portato a 0,157 e dai minuti non giocati. Con il tasso di prima
   (0,275) la proiezione era ~2,6 a stagione (rossi esclusi dal conto). Decidere se va bene così.
5. **Il rosso azzera il conto dei gialli.** L'ho tenuto anche nelle simulate perché è il comportamento di oggi dal vivo (Sprint
   75). Nel calcio vero di solito no: i gialli restano. Da decidere.
6. **Soglia dal vivo 3 → 5.** La decisione dice «5 gialli = 1 giornata in simulate e giocate»: l'ho applicata anche al percorso
   giocato, che usava 3. Se il PO voleva lasciare 3 dal vivo, è una riga (`_sg75`).
7. **Meno yo-yo, quale variante.** Ho applicato «niente deriva negativa nelle prime 2 stagioni se il club si salva». L'alternativa
   (decadimento ridotto) non è implementata. Il campione delle carriere è piccolo e non appaiato (§3).
8. **Coperture mancanti del punto E**: KO europeo nella Simula e recupero di più settimane (`_xopp`). Da completare se servono.
9. **Il voto +0,3 vale anche in Nazionale e nelle coppe simulate** (è nella funzione unica `simulateMatch`). Se doveva valere solo
   in lega, va spostato nei chiamanti.

## Limiti dichiarati

- Nessuna partita 3D; il punto B è verificato sul numero passato al motore (`__CPM_FORZA310`, testimone), non sull'esito di
  partite giocate dal vivo.
- Carriere: 5 + 5 da 14 stagioni (più 2 da 8 con fatica trascurata), non appaiate fra verde e rosso.
- Nessun bump di `GAME_VERSION` e nessuna riga di roadmap: è un giro su ramo di sviluppo, non un rilascio.
