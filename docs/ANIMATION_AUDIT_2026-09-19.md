# Korward Elite — audit animazione e gestualità

**Data:** 19 settembre 2026  
**Branch:** `poc/marioprada-character-system`  
**Stato:** baseline di audit — nessuna modifica a match engine, telecronaca o event engine in questa fase.

## Metodo e limiti della verifica

Questo documento distingue rigorosamente tre livelli di evidenza:

| Evidenza | Significato |
|---|---|
| **Verificato su file** | GLB presente, con clip e scheletro retargettato compatibile. |
| **Collegato nel renderer** | Il codice carica la clip e può selezionarla per una famiglia di highlight. |
| **Da provare in partita** | Biomeccanica, contatto reale, timing, transizioni, varietà e prestazioni. Non sono deducibili dalla sola presenza di un file. |

La build web e il caricamento offline della home sono passati; non costituiscono un test di animazione né un benchmark mobile. Il match deve ancora essere registrato e misurato su un dispositivo mobile reale.

## 1. Inventario effettivo

### Modello e rig

- `assets/korward-regular-player.glb`: modello Regular Male, rig a 65 ossa, base comune per hero e giocatori.
- Varianti di corporatura disponibili: `slim`, `regular`, `stocky`.
- Capelli e sorriso/sopracciglia sono geometria nel GLB; selezione di stile e colore è data-driven dal profilo del giocatore.
- Questo asset è in POC e non è ancora approvato artisticamente: le verifiche del PO hanno già evidenziato necessità di una revisione estetica di testa, capelli e kit.

### Clip disponibili — verificate su file

35 clip retargettate: `idle`, `walk`, `jog`, `jogging`, `running`, `running-to-turn`, `change-direction`, `recovery-run`, `jog-back`, `strafe-left`, `strafe-right`, `run-look-back`, `look-over-shoulder`, `opening`, `receive`, `pass`, `kick`, `penalty`, `header`, `volley`, `dribble`, `tackle`, `slide-tackle`, `throwin`, `missed-chance`, `sit-clap`, `sit-to-stand`, `gk-idle`, `gk-ready`, `gk-catch`, `gk-high-catch`, `gk-block`, `gk-dive`, `gk-goal-kick`, `gk-throw`.

Le clip principali controllate (`pass`, `dribble`, `change-direction`, `missed-chance`, `kick`, `header`, `volley`, `tackle`, `receive`, `throwin`, `gk-dive`, `gk-catch`, `gk-block`) hanno 65 joint e 195 canali. Questo prova l'integrità del retarget, non la qualità della recitazione.

### Clip caricate dall'incontro

Il match carica idle/jog, kick, penalty, header, tackle, volley, ricezione, rimessa, movimento indietro e laterale, tre parate, e le nuove clip `pass`, `dribble`, `change-direction`, `missed-chance`. Altre clip presenti nel catalogo non sono ancora parte della mappa operativa del match.

### Mappa attuale dei gesti di highlight

| Famiglia | Clip effettiva oggi | Valutazione di copertura |
|---|---|---|
| Tiro normale, potente, piazzato, a giro, primo/secondo palo | `kick` | Parziale: una sola interpretazione per molte varianti. |
| Tiro al volo/rovesciata dichiarata | `volley`, con fallback `kick` | Parziale; va verificato visivamente caso per caso. |
| Rigore | `penalty` | Presente, senza varianti di rincorsa/errore. |
| Colpo di testa | `header` | Parziale: manca separazione offensivo/difensivo/tuffo/sponda. |
| Passaggio corto, lungo, lancio, uno-due | `pass` | Parziale: l'arco palla cambia, il corpo no. |
| Tacco | `pass` | **Assente come gesto reale**: il nome esiste, la clip dedicata no. |
| Cross | `pass` (o `change-direction` per rabona) | **Assente come gesto reale**: non esiste clip di cross. |
| Dribbling | `dribble` | Parziale: stessa clip per conduzione e molte situazioni. |
| Doppio passo/step-over | `dribble` | **Assente come gesto reale**. |
| Finta/elastico | `change-direction` | **Assente come gesto reale**. |
| Tackle/scivolata | `tackle` | Parziale: la clip `slide-tackle` è presente ma non collegata alla mappa corrente. |
| Parata | `gk-dive`, `gk-catch`, `gk-block` | Parziale: mancano direzione, quota e recupero espliciti. |

## 2. Matrice di copertura

Legenda: **P** presente ma da prova visiva; **Parz.** presente solo nominalmente o con una clip condivisa; **No** assente. Qualità, contesto, palla, ingresso, uscita e varietà restano `DA VERIFICARE` salvo i difetti indicati esplicitamente.

| Area | Presente / parziale | Mancante o non collegato | Qualità e priorità baseline |
|---|---|---|---|
| 1. Locomozione | P: idle, walk, jog, jogging, running, cambio direzione, corsa indietro, strafe L/R, recovery-run, salto implicito in header/volley. | No: camminata lenta/veloce distinte, sprint, start, stop, freno, accelerazione/decelerazione, curva, pivot, 45/90/180, corsa laterale e cross-step verificati, caduta/rialzata/perdita-recupero equilibrio. | P0 transizioni start-stop e curve; P1 varietà locomozione. |
| 2. Preparazione ricezione | P: receive, look-over-shoulder, opening. | No: scansione contestuale, smarcamento, contromovimento, attacco profondità, protezione preventiva, anticipazione traiettoria. | P1. |
| 3. Controllo palla | P: receive generico. | No: interno/esterno/pianta/collo/punta, orientato 3 direzioni, prima, alto, coscia/petto/testa, rimbalzo, pressione, errore. | P0 contatto e controllo orientato. |
| 4. Conduzione | P: dribble generico. | No: velocità/tocchi/interior-exterior/diagonale/protezione/cambio ritmo/linea-centro/allungo. | P1. |
| 5. Passaggi | P: pass generico; arco rasoterra o alto; uno-due nominale. | No: piede dominante, esterno, punta, no-look, tacco reale, testa/petto, pressione, errore/intercetto/deviazione come gesto. | P0 cross/tacco/lancio condividono pass; P1 resto. |
| 6. Cross | P: traiettorie near/far/low/cutback nel profilo palla. | No: cross da fondo/trequarti/in corsa/esterno/prima/frenata/murato/impreciso come corpo. | P0. |
| 7. Tiri | P: kick, penalty, volley; profili teso/campana. | No: interno/esterno/punta distinti, giro reale, chip dedicato, mezza rovesciata/rovesciata verificata, sbilanciato/caduta, deviato/murato/sporco. | P0 impatto palla; P1 varietà. |
| 8. Colpi di testa | P: header generico. | No: offensivo/difensivo, tuffo, schiacciato, spizzata, liberazione, duello, errore. | P1. |
| 9. Dribbling e finte | P: dribble/change-direction. | No: doppio passo, elastico, croqueta, drag-back, stop-go, finte tiro/pass/cross, Cruyff, chop, tunnel, roulette, sombrero, esiti riuscito/perso. | P0 doppio passo/finta solo nominali; P1 resto. |
| 10. Protezione palla | No clip specifica collegata. | Corpo fra uomo/palla, braccia, schermatura, spalle porta, contatto/rotazione/perdita. | P1. |
| 11. Contrasti | P: tackle; source `slide-tackle` non collegata. | Frontale/laterale, spallata, pressing/contenimento/anticipo/raddoppio, esiti pulito/perso/mancato/ritardo. | P0 scivolata e caduta; P1 resto. |
| 12. Difesa senza palla | Movimento procedurale del match, nessun set locomotorio mirato. | Tutte le posture difensive, marcature, linee e ricomposizione come gesti. | P1. |
| 13. Attacco senza palla | Movimento procedurale del match. | Tagli, overlap/underlap, inserimenti, attacchi palo, contro-movimenti come gesti. | P1. |
| 14. Duelli fisici | No. | Spalla/spalla, corpo a corpo, collisioni, salti con contatto, liberarsi marcatura. | P0. |
| 15–16. Falli e falli subiti | No set dedicato. | Tutte le tipologie, cadute, dolore, richiesta fallo, rialzata. | P1. |
| 17. Rimesse | P: throwin. | No: preparazione/prendere palla, corta/media/lunga/sui piedi/nello spazio, ricezione/movimento. | P2. |
| 18. Corner | No clip specifica. | Posizionamento, rincorsa, calci, blocchi, attacco seconda palla. | P1. |
| 19. Punizioni | P: kick riusato. | Rincorse, giro/potenza/sotto barriera, due uomini, barriera/salto. | P1. |
| 20. Rigori | P: penalty. | Rincorse, stop, cucchiaio, reazioni gol/errore. | P2. |
| 21. Calcio d'inizio | Movimento di scena. | Primo tocco/passaggio/movimento compagni specifici. | P2. |
| 22. Comunicazione | No clip specifica. | Tutti i richiami, indicazioni, applausi e feedback. | P2. |
| 23. Reazioni emotive | P: missed-chance; alzata/coro da clip riusate. | Abbraccio/gruppo/scivolata ginocchia/protesta/frustrazione/interazione mister. | P1. |
| 24–25. Arbitro e fuorigioco | No set specifico. | Fermarsi, protesta, cartellini, segnali e rientro. | P2. |
| 26–27. Fatica e infortuni | No. | Tutta la lista richiesta. | P3 per fatica, P2 infortuni. |
| 28. Sostituzioni | P: sit-to-stand, sit-clap per panchina. | Uscita/ingresso/saluti/mister/cinque. | P2. |
| 29. Panchina | P: seduto, applaudire, alzarsi. | Protesta, reazione occasione, riscaldamento, dialogo, esultanza. | P2. |
| 30. Ingresso | P: opening come base. | Tunnel/fila/bambini/stretta mano/foto/sorteggio. | P2. |
| 31. Fine partita | Nessun set dedicato verificato. | Saluti, abbracci, celebrazioni, delusione, premiazione. | P2. |
| 32. Micro-gestualità | Braccia e movimento testa dipendono dalle clip; nessun layer additivo contestuale verificato. | Look-at palla/compagno, appoggio, caricamento/follow-through/recupero coerenti per ogni gesto. | P0 sui gesti tecnici. |
| 33. Errori realistici | P: missed-chance solo come reazione. | Controllo lungo, passaggio/cross/tiro sporco, inciampo, deviazione, rimbalzo e correzioni corporali. | P1. |

## 3. Concatenazioni obbligatorie

| Sequenza | Esito baseline |
|---|---|
| corsa → rallentamento → controllo → passaggio → recupero | **FAIL**: manca grafico di transizione e controllo/passaggio sono clip indipendenti. |
| ricezione → controllo orientato → conduzione → tiro | **FAIL**: receive/dribble/kick esistono, ma non come catena con marcatori palla. |
| smarcamento → ricezione → protezione → scarico | **FAIL**: protezione assente. |
| sprint → cross → frenata | **FAIL**: cross e frenata assenti come clip. |
| salto → testa → atterraggio → ripartenza | **FAIL**: header esiste, atterraggio/ripartenza non verificati. |
| tackle → caduta → rialzata → ritorno | **FAIL**: tackle esiste, recovery completo non è una catena. |
| dribbling → accelerazione → passaggio | **FAIL**: nessun timing/evento di contatto condiviso. |
| tiro → follow-through → osservazione → reazione | **DA PROVARE**: viene regolata la durata, senza marker esplicito di impatto/follow-through. |
| gol → reazione → esultanza → ritorno centrocampo | **FAIL**: reazioni e ritorno non hanno set dedicato. |
| perdita palla → contropressing/ripiegamento | **FAIL**: dinamica di gioco senza recitazione dedicata. |

## 4. Problemi di sincronismo e transizione

1. L'arco della palla è programmato dalla famiglia gesto, ma le clip non espongono un `contactAt` per il frame di impatto. Perciò non esiste una garanzia che piede e palla coincidano.
2. Varianti di palla (rasoterra, campana, tesa) possono cambiare senza una diversa meccanica del corpo.
3. Cross e tacco hanno una chiave nella tabella, ma puntano a clip generiche. È una copertura nominale, non una soluzione visiva.
4. Non c'è selezione esplicita per destro/sinistro, mirroring o angolo d'approccio; direzione verso target è applicata dopo il fatto e va verificata.
5. Il sistema possiede fade in/out per action, ma non un animation graph con stati di start, stop, recovery e contatto. Le concatenazioni restano fragili.
6. Il movimento di molti non-hero è ancora derivato dalla posizione e dalla velocità; un loop procedurale può sovrapporsi alla posa e dare effetto burattino.
7. Il recupero da tackle, salti, stop e miss non ha una semantica unica: è il maggiore rischio di pop o scivolamento.

## 5. Top 20 problemi P0/P1

| # | Priorità | Problema | Evidenza |
|---:|---|---|---|
| 1 | P0 | Nessun marker temporale piede-palla per passaggi, tiri, cross e controlli. | Codice orchestra arco e clip separatamente. |
| 2 | P0 | Cross usa passaggio: non c'è gesto di cross. | Mappa `cross → pass`. |
| 3 | P0 | Tacco usa passaggio: non c'è gesto di tacco. | Mappa `heel → pass`. |
| 4 | P0 | Step-over/doppio passo riusano dribble. | Nessuna clip dedicata. |
| 5 | P0 | Finta/elastico riusano cambio direzione. | Nessuna clip dedicata. |
| 6 | P0 | Controllo palla non ha direzione, superficie o pressione. | Solo `receive` generico. |
| 7 | P0 | Start, freno, stop, pivot e curve non esistono come stati. | Catalogo e mappa incompleti. |
| 8 | P0 | Nessun sistema di catene tecniche completo. | Sequenze obbligatorie tutte FAIL. |
| 9 | P0 | Piede dominante e mirroring non governano i gesti. | Nessun dato/selector nella mappa. |
| 10 | P0 | Duelli e contatto non hanno animazioni né sincronizzazione tra due attori. | Assenti. |
| 11 | P1 | Tiro normale accorpa troppo: piatto, potenza, giro, chip e debole. | Una clip `kick`. |
| 12 | P1 | Header accorpa attacco, liberazione, tuffo e sponda. | Una clip `header`. |
| 13 | P1 | Slide tackle source non è usata; recovery/caduta non sono collegate. | Mappa corrente usa `tackle`. |
| 14 | P1 | Gesti senza palla sono solo posizione, non recitazione. | Nessun set per marking/runs. |
| 15 | P1 | Errori realistici non hanno recitazione tecnica. | Solo `missed-chance`. |
| 16 | P1 | Portiere non usa un vocabolario per lato, altezza e recupero. | Tre clip generiche. |
| 17 | P1 | Reazioni, comunicazione e celebrazioni non hanno copertura credibile. | Clip riusate/non dedicate. |
| 18 | P1 | Kit e geometria del nuovo modello non sono ancora validati in partita. | Rilievi PO sul rendering. |
| 19 | P1 | Nessun benchmark mobile di mixer, draw call, frame time o memoria. | Test effettuato solo su home offline. |
| 20 | P1 | Asset e mapping attuali non bastano a evitare ripetizioni fra 22 giocatori. | Poche clip, nessun chooser di variante/piede. |

## 6. Piano di implementazione, senza toccare il match engine

### Fase 0 — fondazioni e misure

1. Congelare una scena di test per ciascun gesto: camera, velocità, piede, direzione, posizione palla e risultato atteso.
2. Introdurre metadati animazione separati dal match engine: `contactAt`, piede, direzione consentita, fase di ingresso/uscita, velocità consigliata, variante e costo.
3. Aggiungere telemetria renderer: frame time, FPS, mixer, action attive, skeleton update, draw calls, memoria; hero e altri 21 separati.
4. Registrare baseline video/screenshot desktop e Android.

### Fase 1 — core tecnico

- Locomotion graph: idle/start/jog/run/sprint/stop/turn/strafe/backpedal e recovery.
- Ricezione e controllo orientato con tre superfici minime (interno, esterno, pianta), marker di contatto e transizione verso passaggio/tiro.
- Passaggio corto/lungo, cross da fermo/in corsa, tiro piazzato/potente/volée e testa, ognuno con approccio, appoggio, impatto, follow-through e recovery.
- Prima quality gate: sincronismo piede-palla e sequenze fondamentali.

### Fase 2 — uno contro uno e difesa

- Conduzione, doppio passo, body feint, stop-go, drag-back, cambio esterno/interno, con esito riuscito/perso.
- Protezione palla e duelli a due attori; tackle in piedi, slide, mancato tackle, caduta e rialzata.
- Off-ball locomotion per marcatura, copertura, inserimento e smarcamento.

### Fase 3 — interruzioni e set piece

- Falli e cadute riusabili, rincorse/calci punizione e corner, rigori e rimesse.
- Portiere: ready, shuffle, catch/parry/dive per lato e altezza, get-up e distribuzione.

### Fase 4 — contesto umano

- Comunicazione, reazioni a errore/gol, panchina, sostituzioni, ingresso e fine partita. Le clip di scena devono restare lontane dal vocabolario tecnico.

### Fase 5 — qualità e variabilità

- Additive layer per testa/sguardo/braccia/respirazione.
- Seed di varietà per giocatore: piede dominante, stile, velocità, timing e piccoli errori, senza cambiare esito del match.
- LOD animazione, throttling fuori camera, pooling delle action e verifica mobile completa.

## 7. Quality gate baseline

| Area | Esito attuale |
|---|---|
| Locomozione | **FAIL** |
| Controllo | **FAIL** |
| Passaggi | **FAIL** |
| Cross | **FAIL** |
| Tiri | **FAIL** |
| Colpi di testa | **FAIL** |
| Dribbling | **FAIL** |
| Contrasti | **FAIL** |
| Falli/cadute | **FAIL** |
| Set pieces | **FAIL** |
| Movimenti senza palla | **FAIL** |
| Reazioni | **FAIL** |
| Comunicazione | **FAIL** |
| Micro-gestualità | **FAIL** |
| Transizioni | **FAIL** |
| Sincronismo palla | **FAIL** |
| Varietà | **FAIL** |
| Performance mobile | **FAIL — non misurata** |

### Numeri baseline

- Clip disponibili e parseabili: **35**.
- Famiglie tecniche con un gesto collegato: **circa 11** (locomozione base, receive, pass, shot, penalty, header, volley, dribble, tackle, throw-in, portiere).
- Gestualità richieste pienamente coperte: **0**: nessuna ha ancora superato la verifica combinata di contesto, contatto, transizione, varietà e performance.
- Problemi P0: **10**.
- Problemi P1: **10**.
- Performance del banco 3D: **23 avatar/mixer, 28–44 action attive, 23 skeleton update per frame, ~1,10 milioni di triangoli, ~182–183 draw call/frame, 597–604 texture e 277–294 geometrie**. Il browser software del banco registra **2,6–4,4 FPS**: è un dato di costo riproducibile, non una stima del telefono.
- Performance prima/dopo: **non confrontabile su mobile reale**. Il benchmark mobile fisico resta obbligatorio; il baseline del banco prova però che il budget 60 FPS non è ancora certificabile.
- Regressioni note: nessuna regressione funzionale osservata nella build/home offline; la qualità in partita e il costo mobile non sono ancora certificati.

## Decisione di audit

Il progetto possiede una buona base di rig e di clip retargettate, ma **non possiede ancora un sistema di calcio credibile**. Il prossimo intervento deve iniziare dalla Fase 0 e dalla Fase 1: metadati di contatto, locomotion graph e prime catene corpo-palla. Aggiungere altri nomi di eventi o riutilizzare la stessa clip non chiuderebbe nessuno dei P0.
