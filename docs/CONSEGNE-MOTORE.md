# Passaggio di consegne — il motore del possesso (7.870, branch `claude/motore-possesso`)

Scritto il 10/09 sera perche' il lavoro possa continuare con qualunque modello, senza rileggere
tremila righe. Le regole del PO restano quelle di `docs/ROADMAP-CREDIBILITA.md` (§20 mai VAR/replay/
autogol; numeri non impressioni; una misura alla volta; rosso appaiato; nessun «puoi collaudare»
finche' la scheda da telefono non fa media 8 su 12 aree, nessuna area < 7; produzione = `main`,
allineata di notte dal branch QA `claude/korward-elite-qa-season-jwcbj1` solo in fast-forward).

## Dove sta il lavoro

- Worktree `/home/user/cm-motore` (branch `claude/motore-possesso`, spinto su origin). Il checkout
  principale `/home/user/Carrier-manager-` resta sul branch QA (7.866 + revoca 7.868), pulito.
- `src/14-motore-possesso.jsx` — il motore (puro, seme, senza React). `src/15-live-match.jsx` — il live
  match (era `14-`): l'innesto sta sotto `MOTORE870` (rosso `__CPM_NO870`), cerca «[7.870]».
- `tests/visual/test/logic/motore-possesso.test.mjs` — 8 test node (secondi). `npm run test:logic`.
- `tests/visual/partita-vera-guardian.mjs` — bande della Fase 3 giudicate sui fatti del motore
  quando le righe hanno `rk:'motore'`; stampa il censimento dei fatti e le righe senza cognome.
- Sonde nello scratchpad della sessione (copie con i percorsi del worktree): `banco-motore.mjs`
  (16 partite in node, un secondo), `smoke870.mjs` (una partita headless: errori, tick reale,
  archi, righe), `padroni-m.mjs`, `geo865-m.mjs`, `telefono-m.mjs` (scheda), `telefono-m-noglb.mjs`.
  Se lo scratchpad non c'e' piu': `tests/visual/collaudo-telefono.mjs` e' la scheda ufficiale.

## Come si lavora sul motore (il ciclo corto)

1. Regola nel motore (o frase nel narratore `narra870` in src/15).
2. `node banco-motore.mjs` → tenuta/volo/fermo, passaggi/conduzioni/tiri/falli per partita,
   decreti segnati, passo massimo dei ventidue. `npm run test:logic`.
3. `node tools/build-src.mjs && node tools/check-src.mjs | grep -c IDENTICO` (=1). Mai ricostruire
   mentre una sonda sta per aprire l'HTML.
4. `smoke870.mjs` (3 min) → zero `ERR870`, righe per fatto, tick ~1,8 s.
5. `npm run partita-vera` (5 min) → bande; `npm run ci:live` (20 min) prima di ogni push del branch.
6. Scheda da telefono (4 partite: Vairo/Moretti in casa, Conti/Galli fuori, ~10 min l'una).
   ⚠️ A 5-6 fps headless con GLB i corpi 3D restano indietro (lezione 20ª): la stessa partita fa
   41-44 % con GLB e 57 % senza. Dichiararlo, non tararci sopra.

## Cosa fa oggi il motore (7.870)

Stati: tenuta · volo · libero · fermo · rete · kickoff · scena. Fatti emessi con nomi e luoghi:
passaggio, ricezione, controllo, conduzione, cross, tiro, parata, palo, murato, fuori, gol,
contrasto, intercetto, recupero, palla_persa, fallo, rigore, rimessa, corner, rinvio, battuta,
centro, calcio_inizio, spazzata, presa. Richieste: `gol(lato)` (decreto del microsim; tetto duro
9 tick; `urgenza()` dal 90'), `turno(lato)` (quota di possesso), `verso({x,y,lato})` (ponte alla
scena), `atteggiamento(lato,v)`, `eroe(on)`, `scena()`, `riprendi({x,y,lato,gioc,eroe,centro})`.
Il narratore sceglie il fatto piu' importante del tick; i passaggi rasoterra si raccontano
all'arrivo (ricezione col passatore), lanci/cambi/cross/tiri al lancio con l'arco 3D; il lessico dei
luoghi e' quello del metro geo865 («in area», «dal limite», «trequarti», «centrocampo»).

## Numeri dell'ultima sera (da battere, non da ripetere)

Banco node (16 partite): tenuta 53 %, passaggi 19, conduzioni 10, tiri 5, falli 2-4, decreti tutti
segnati (attesa media 6 tick). Gate 14/14. Guardiano: tutte le bande verdi tranne arbitro-esiste
(interruzioni raccontate 4 su banda 6 in 2 partite: in taratura). Scheda n° 10: 58/69/42/41-44 %
(57 senza GLB), media 6,3. Geografia 14/17.

## I prossimi passi, in ordine

1. **Ritmo della cronaca**: 40-70 righe contro 70-110. Il motore emette ~1 fatto al minuto (un tick
   e' un minuto): o piu' fatti per tick (due tocchi al minuto, con il pallone reso che li mostra
   entrambi) o il narratore dice anche i fatti minori senza respiro. Misura: righe per partita e
   «minuti muti» nella scheda.
2. **Tiri**: 2-5 a partita. Leve: `pTiro` per zona, la scelta del ricevente in trequarti (bonus
   avanzamento), le conduzioni in area. Misura: tiri per partita nel banco e nella scheda, «frasi
   del tiro smentite» sempre 0.
3. **Resa del volo**: scarto reso↔logico p90 12-25u e salti 16-39 (archi 3D a 80 u/s). Strada:
   arco con durata dal volo vero (~1,2-1,6 s) o nessun arco e inseguimento a 25-34 u/s. Misura:
   salti e scarto p90 nella scheda; «pallone a terra» ≥ 75 %.
4. **Interruzioni**: banda arbitro-esiste (≥ 3 a partita raccontate). Leve gia' nel motore.
5. **`ci:carriera` e rituale completo** prima di proporre il branch per `main`.
6. **Togliere le macchine spente** (piano/occasione/catena/libreria/ponte/contropiede/interruzioni
   da riga/schieramento/elezione/mover/mente 738-739) quando il motore batte la scheda.
7. **Gli highlight dell'eroe dal motore** (seconda fase, vedi sotto).

## Gli highlight dell'eroe: il piano

Oggi la scena dell'eroe nasce da una tabella di 191 situazioni a calendario (8'-84'), con posizioni
di scena, pallone e camera pre-autorati e l'esito da `decideExecution`; il motore si ferma
(`scena()`) e riprende dal punto d'uscita. Nella stessa logica «prima la simulazione, poi le parole»:
- la scena nasce da un FATTO del motore che riguarda l'eroe (riceve in zona pericolosa, e' lanciato
  in profondita', ha un avversario addosso al limite, va sul cross, deve difendere in area): il
  motore emette `occasione_eroe {tipo, pressione, compagni liberi, portiere}` e la scelta interattiva
  si presenta con QUELLA situazione (ventidue veri, pallone vero, pressione vera);
- l'esito scelto (tiro, dribbling, filtrante, cross, uno-due, contrasto) si esegue NEL motore con
  `decideExecution` (qualita' → esito) e la ripresa e' continua: niente snap, niente ponte;
- il livello di presentazione (camera, animazioni CH38, testi delle 191 situazioni) resta e viene
  scelto per famiglia d'intento, non per calendario;
- il calendario (8-84', 2-7 scene) diventa un vincolo di frequenza sul motore (bonus al pallone
  verso l'eroe quando e' ora di una scena), non un orologio che spezza il gioco.
Ordine: dopo i punti 1-4, perche' la scena dal motore ha senso solo se il gioco ambientale regge.

---

## Aggiornamento 11/09 (dopo la notte 7.871-7.877)

Fatto: (1) ritmo — righe 81-92 a partita, in banda 70-110 su 4/4; (2) tiri — il gol decretato si
costruisce fino all'area, tiri da dietro 81/130 -> 0/63; (4) interruzioni — arbitro-esiste verde con
misura ripetuta (8, 7, 12); (5) rituale completo verde sul branch (career 524 s, ci 1191 s). In piu',
due cose non previste e piu' grosse di tutte le altre: i RUOLI non arrivavano al motore in browser
(7.874) e le CORSIE erano rimaste accese sotto il motore, cioe' c'erano ancora due scrittori dei
ventidue (7.877: pallone ai piedi in React dal 18 % al 90 %).

Scheda n° 11 sulla 7.877: media 6,8 (era 6,3). Cancello del PO non raggiunto (serve 8, nessuna area
sotto 7). Le tre aree che la tengono ferma, in ordine di peso:

1. **11 Immersione (5)** — lo strato 3D. ⚠️ L'ipotesi scritta qui sopra al punto (3) — «e' la durata
   dell'arco» — e' SMENTITA dalla misura: lo scarto mesh<->motore e' 4,0u di mediana in TENUTA (dove la
   palla logica e' incollata ai piedi) contro 3,3u in volo. Non e' l'arco, e' l'inseguimento. Primo
   passo: attribuire chi scrive la mesh del pallone sotto il motore (`_ws524`, `npm run ball-owner`).
2. **4 Varieta' (6)** — rimesse laterali ~0 contro le ~40 vere, cross in gioco aperto 0,4 a partita.
   Il campo ora si usa piu' largo (7.876) ma il pallone non varca quasi mai la linea.
3. **7 Highlight dell'eroe (6)** — la seconda fase, il piano e' quello scritto qui sotto.
