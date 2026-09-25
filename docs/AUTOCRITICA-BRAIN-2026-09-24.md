# Brain «partita vera» — verifica di allineamento e autocritica (24/09/2026)

Risposta scritta al prompt del PO. Base: build 7.999.1 + lavoro 7.999.2 (motore unico, passo 1).
Ogni affermazione cita file e righe del codice o una misura. Dove non ho verificato: «Non posso confermarlo».

## 1. Sintesi

- **Allineati sull'impianto**: 2D principale + highlight 3D dell'eroe. Il prototipo con partita 3D continua è stato ritirato su indicazione del PO (tolto dal sito, commit 6ad769cb).
- **Allineati sul «motore unico» per i gol**: dalla 7.999.2 i gol della partita 2D li decide solo il motore del possesso. Il microsim è spento con `V2L` (src/15-live-match.jsx:4030, 4529).
- **Non allineati su B (tattiche)**: il motore non riceve modulo, mentalità, pressing, linea né ampiezza (chiamata src/15:5028). Le personas NPC agiscono solo sui gol della simulazione rapida (src/10:861-864).
- **In parte su A**: il motore ha stati del pallone, non fasi di gioco. Le parole «triangolo», «terzo uomo», «uno-due» e simili hanno 0 occorrenze nel motore (src/14): sono cronaca ed etichette.
- **In parte su C**: le occasioni dell'eroe sono in buona parte fabbricate. Bonus +26 al ricevente, corpo spostato su punti fissi, possesso tenuto (src/14:247-255, 793-800, 486-495).
- **In parte su D**: ogni evento del brain dà un gesto a un solo corpo, l'attore (src/12:3015-3033). Non c'è foot-lock e nessuna misura del pattinamento dei piedi.
- **Taratura contro struttura**: nelle release 7.980-7.987 ho contato 9 correzioni di coefficienti contro 4 comportamenti nuovi.
- **Le misure guardano le medie di fine partita.** Le catene di passaggi esistono (`npm run catene`), PPDA e zona di recupero no. `tests/brain/pagella.mjs` stampa ma non ha soglie.
- **Due verità residue**:
  - la simulazione rapida (`simulateMatch`, src/10:851-871) è ancora un Poisson a parte;
  - il gol dell'eroe in highlight è deciso da un dado in LiveMatch (src/15:8298-8306), non da `risolviEroe` del motore.
- **Rotta**: prima struttura (tattiche nel motore, occasioni dal gioco, misure di manovra e di fluidità), poi di nuovo taratura.

## 2. Tabella A-B-C-D

| Punto | Stato | Motivazione e prove |
|---|---|---|
| A. Partita vera | in parte | Il possesso è una sequenza vera: `decidiTenuta` (src/14:464-642) sceglie tra tiro, cross, conduzione e passaggio; `scegliRicevente` (src/14:232-279) sceglie il compagno. Non ci sono però fasi (costruzione, transizione, difesa posizionale): solo stati del pallone kickoff/tenuta/volo/libero/fermo/rete (src/14:74, 933-936). Il tipo di passaggio (cambio, verticale, corto…) è classificato **dopo**, non scelto come intenzione (`tipoPassaggio`, src/14:282). Nessun contatore di passaggi per azione dentro il motore (c'è solo `S.poss.t`, src/14:190, 466). |
| B. Tattiche | **no** | `NPC_PERSONAS` ha solo `lambdaMod`/`trustMod` (src/06:823-828). Chi le usa: `simulateMatch` (src/10:861-864) e l'etichetta in UI (src/13:488, 574). Il motore legge solo le chiavi `decidi, eroe, forza, giocatori, k2, lato, occasioniV2, scelte, seed, stadio, v2`. Il modulo è fisso: `SLOT_H`/`SLOT_A` (src/14:63-64). Il movimento senza palla è uguale per tutti (`muoviTutti`, src/14:778-786). I pomelli tattici del live (`TRAMA_ID538`, src/15:2433-2439) agiscono sulla vecchia deriva e col motore attivo non arrivano (src/15:7465). |
| C. Eroe, compagni, avversari | in parte | I compagni cercano l'eroe per **decreto**: bonus base 2, più 26 quando la scena è chiesta (src/14:247, 255). Non lo cercano per fiducia o forma: né `coachTrust` né `form` entrano in `scegliRicevente`. Gli avversari non hanno una marcatura dedicata né un raddoppio sull'eroe: c'è solo il pressing generico (src/14:763, 879, 882). Le sue scelte cambiano il seguito solo dentro la scena; la scena poi rimette il possesso com'era (src/14:950-962). |
| D. Render guidato dal brain | in parte | `BRAIN_GESTI` (src/12:2460-2481) copre 21 eventi, ma dà l'intenzione a **un solo corpo** per evento, per 0,6 s (src/12:3015-3033). Gli altri 21 si muovono per posizioni del motore, non per intenzioni. La locomozione c'è ed è procedurale: inerzia, «frena per girarti» (src/12:2715-2723), canali direzionali con dissolvenza (src/12:9442-9465), cadenza della corsa legata alla velocità (src/12:9512). Mancano il foot-lock e l'IK dei piedi, e manca una misura del pattinamento. |

## 3. Autocritica, una risposta per domanda

1. **Taratura contro struttura.** Nelle release 7.980-7.987 ho fatto 9 correzioni di coefficienti:
   - tiro dal limite ×0,40 e dalla trequarti ×0,30 (src/14:566);
   - punizione diretta (src/14:738);
   - frequenza dei cross 0,55→0,40 (src/14:610);
   - colpo di testa immediato 0,62→0,38 e poi 0,24→0,16 (src/14:713);
   - peso del filo del fuorigioco -28 (src/14:275);
   - fallo di tenuta ×0,68 (src/14:537-538);
   - corsa verso il cross 40→20 (src/14:668);
   - mira ×1,2 (src/14:371).

   I comportamenti nuovi sono stati 4: il dribbling come duello, il cross verso un uomo, il ricevente che attacca il punto, il tetto al passo.

   **Se domani cambiasse una tattica quei coefficienti non reggerebbero.** Sono stati tarati su un solo modulo fisso e su un movimento senza palla uguale per tutti. Lo stesso vale per una correzione di oggi (7.999.2): la «grande occasione» dell'eroe (0,28 + 0,8 × xG) è una **scelta di gioco del PO** scritta come coefficiente, non un comportamento.

2. **Tattiche.** Sì, è così: le personas agiscono solo tramite `lambdaMod` in `simulateMatch` (src/10:861-864). `trustMod` non viene letto per le personas. Oggi una tattica **non cambia come si gioca** nella partita del motore.

3. **Manovre vere o parole.** Sono parole. Nel motore (src/14) ci sono 0 occorrenze per tutte e dieci:
   - triangolo, terzo uomo, uno-due, sovrapposizione, ventaglio;
   - cambio di gioco, contropiede, costruzione dal basso, giro palla, verticalizzazione.

   Vivono in cronaca e situations (src/15:2613-2615 racconta i tipi di passaggio), negli intenti degli highlight («onetwo», src/15:4349, 8330) e in macchine di recita della vecchia cronaca (contropiede, src/15:4017, 5331).

4. **L'eroe al centro per decreto.** Le occasioni sono fabbricate. Quando il live chiede una scena, il motore usa quattro leve:
   - dà +26 all'eroe come ricevente;
   - porta il suo corpo su punti fissi (conclusione x84, fascia x72, fra le linee x68…) a velocità 6 (src/14:793-800);
   - gli fa tenere palla per quel tick;
   - aspetta fino a 8 occasioni del tipo chiesto (src/14:486-495).

   I minuti degli highlight vengono da una griglia (src/15:1226-1229). Se la palla non arriva entro 14 minuti la scena si apre lo stesso (src/15:4292).

   Da fuori è credibile solo in parte: con tutti questi aiuti l'eroe riceve «sempre» nel posto giusto. Quanto spesso la scena parta senza un'occasione nata dal gioco **Non posso confermarlo**: oggi nessuno lo misura.

5. **Due verità.** La regola 7.756 («il microsim è l'autorità del punteggio», src/07:36) è **superata dal codice** della 7.999.2: con `V2L` il microsim è spento. Restano tre punti di possibile contraddizione:
   - **(a) simulazione rapida:** `simulateMatch` è un Poisson proprio (src/10:851-871). Lo chiude il passo 2.
   - **(b) gol dell'eroe e piazzati:** si decidono in LiveMatch (src/15:2008, 8298-8306, 8758) e non passano dal motore, quindi il tabellino del motore diverge dal tabellone. Lo chiude il passo 3.
   - **(c) ponte e scena:** il ponte cade al minuto della griglia (src/15:5049-5053), mentre la scena si apre sul fatto (src/15:4274-4297). Lo scarto reale **Non posso confermarlo**.

   La regola 7.756 va riscritta nei documenti.

6. **Cronaca e template.** Con il motore attivo e fuori dagli highlight, il pallone e i ventidue li muove solo il motore:
   - `setBallPos` da `stato().palla` (src/15:7465);
   - `_specchi898` (src/15:4007-4021);
   - la riga pescata non comanda il pallone (src/15:6443).

   Negli highlight (`_inHL77`) si riaccende la vecchia pesca da `BG_MATCH`, gol esclusi (src/15:5655). Misura: il guardiano `motore-unico` ora conta la quota di righe di cronaca nate dal motore. **Misura (7.999.2, 1 partita, `CPM_PARTITE=1 npm run motore-unico`): 78 righe su 82 (95%) nascono dal motore**; le altre 4 vengono da tabella o libreria, quasi tutte dentro gli highlight. Su più partite: da ripetere.

7. **Render.** `BRAIN_GESTI` non basta per movenze da gioco professionale. Mappa evento→gesto su un solo corpo; manca un livello di locomozione con appoggio dei piedi (foot-lock) e anticipazione del gesto per i non attori. `__CPM_BRAIN23` conta eventi e richieste (src/12:3019), non quanti dei 22 ricevono un'intenzione. Dal codice ne ricevono **uno per evento**.

8. **Cosa misuriamo.** Sì, abbiamo ottimizzato ciò che misuriamo:
   - i guardiani del motore misurano soprattutto medie di fine partita (banco, pagella, motore-unico);
   - per la manovra c'è `tests/visual/catene-possesso.mjs` (passaggi per catena), ma non è nella pagella e non ha soglie di riferimento;
   - PPDA e zona di recupero: 0 occorrenze;
   - fluidità 3D: esistono solo misure parziali (salti del pallone, yaw al rilascio del gesto, teletrasporto nell'esultanza), niente pattinamento dei piedi.

## 4. Tre decisioni da rivedere e tre priorità

**Decisioni che rivedrei**
1. Aver tarato 9 coefficienti sulle medie Premier prima di avere tattiche e fasi nel motore. Andranno ritarati dopo, e parte del lavoro è da rifare.
2. Aver costruito le occasioni dell'eroe con leve dirette (bonus, spostamento, attesa) invece che con ragioni di gioco (fiducia, posizione, marcatura). Funziona, ma è teatro.
3. Aver speso la Fase 2 su una partita 3D continua. Il PO l'ha bocciata. Un prototipo piccolo sui gesti degli highlight avrebbe risposto prima alla domanda giusta.

   Collegato: la richiesta di «turno» per inseguire la quota della vecchia cronaca è rimasta viva fino a oggi. L'ho trovata misurando nella 7.999.2: falli 8-9 → 20 a partita spegnendola.

**Priorità prima di altra taratura**
1. **Tattiche nel motore**: modulo, pressing, linea, ampiezza e mentalità come parametri per lato, con le personas mappate su di essi.
2. **Metriche di manovra e di fluidità con soglie citate**, nella pagella e in un guardiano.
3. **Occasioni dell'eroe dal gioco**: i compagni lo cercano per fiducia, forma e posizione, e gli avversari lo marcano. Con una misura della quota di scene nate senza aiuto.

**Rischi e alternative (parere tecnico)**
- **Rischio B.** Con le tattiche vere le medie si spostano e i guardiani statistici andranno ritarati: è voluto, ma costa release.
- **Rischio D.** Un foot-lock/IK sui corpi CH38/CGTrader costa prestazioni sul telefono (oggi 60 fps misurati dal PO). Alternativa che consiglio: intenzioni del brain e foot-lock **solo ai 3-5 corpi dentro l'inquadratura dell'highlight**, gli altri restano con la locomozione attuale. È coerente col vincolo «non rifare FIFA».
- **Rischio C.** Togliere del tutto il decreto può far sparire le scene dell'eroe nelle partite dove il gioco non lo cerca. Proposta: tenere un ripiego dichiarato e misurato («scena di ripiego») invece di nasconderlo.

## 5. Correzione di rotta nelle prossime release

| Release | Obiettivo misurabile | File | Guardiano | Rosso | Rischio / incertezze |
|---|---|---|---|---|---|
| 7.999.2 (ora) | Gol della 2D solo dal motore; niente turni forzati; tiro dell'eroe come «grande occasione» (mediana 0,20-0,55) | src/14, src/15, src/07 | `npm run motore-unico` (nuovo) | `__CPM_NO_V2` | Tiri 10,6 per squadra su 4 partite: dentro la banda del banco (9-16), sotto la media reale 12,7 |
| Passo 2 | Simulazione rapida = motore senza grafica, stesso seme ⇒ stesso tabellino | src/10, src/14, src/18 | nuovo `sim-rapida-motore` + `career-critical`, `save-compat` | `__CPM_NO_SIMV2` | Tempo di «avanza settimana» (circa 2.000 battiti per partita): da misurare |
| Passo 3 | Gol e piazzati dell'eroe risolti da `risolviEroe`; tabellino del motore = tabellone | src/15, src/14 | `motore-unico` esteso: tabellone = motore | `__CPM_NO_RISOLVI` | Coerenza con le scene già girate (gate 191) |
| T1 Tattiche | A parità di forza, le personas producono PPDA, possesso e passaggi lunghi diversi in modo misurabile | src/14 (`cfg.tattica`), src/15:5028, src/06 | banco esteso: 4 personas × 200 partite | `__CPM_NO_TATTICA` | Ritaratura dei coefficienti 7.980-7.987 |
| C1 Eroe dal gioco | Quota di scene nate dal gioco ≥ 70%; ripiego dichiarato | src/14 (`scegliRicevente`, marcatura), src/15 | nuovo `eroe-dal-gioco` | `__CPM_NO_EROEGIOCO` | Meno scene nelle partite in cui il gioco non cerca l'eroe |
| D1 Fluidità | Misurare il foot skating ratio sui corpi in scena (GLB-ON) e ridurlo | src/12, tests/visual | nuovo `fluidita-3d` (prima solo misura) | `__CPM_NO_FOOTLOCK` | Headless a basso fps: il giudice resta il telefono |
| D2 Gesti (passo 4) | Fallo con caduta, esultanza, cartellino, contatto piede-palla | src/12 | `gesto-vocabolario`, `frozen-mate` | per gesto | Durata delle clip contro la finestra `GESTURE_WIN` |

**Metriche da aggiungere alla pagella, con riferimenti reali**
- **Manovra, PPDA** (passaggi concessi all'avversario nella sua zona di costruzione per ogni azione difensiva). Riferimento della Premier League, stagione 2021/22: Liverpool 8,62 il più basso della lega, Wolverhampton 14,78 il più alto ([premierleague.com, 19/02/2025](https://www.premierleague.com/en/news/4250153/passes-per-defensive-action-explained)). Banda proposta per il motore: 8-16, con differenze fra personas.
- **Manovra, passaggi per catena**: già misurati da `npm run catene`. Un riferimento pubblico verificato per le catene **Non posso confermarlo** oggi: lo cerco prima di fissare la soglia.
- **Fluidità, foot skating ratio**: quota di fotogrammi in cui un piede a terra (altezza < 5 cm) scivola più di 2,5 cm. Riferimento: OmniControl, ICLR 2024 ([arXiv 2310.08580](https://arxiv.org/abs/2310.08580)). Il movimento reale vale 0,000 e i modelli pubblicati circa 0,05-0,10. Soglia proposta per i corpi in scena: ≤ 0,05.

## 6. Domande per il PO
Nessuna bloccante. La scelta sul gol dell'eroe è già stata presa («Occasione da gol»).
