# Rapporto giro 28 — PO-259: schede del mister «Poche ma decisive»

Ramo `sviluppo/schede-259`, base 7.999.169 pubblicata. `GAME_VERSION` **non** cambiata. Zona G (carriera,
economia) non toccata. Toccati: `src/14-motore-possesso.jsx` (regola e leve del motore), `src/15-live-match.jsx`
(scheda, scelta, racconto, riepilogo), il guardiano nuovo `tests/visual/schede-259.mjs` e tre guardiani vecchi
(vedi «Cosa cambia per i guardiani»).

Interruttore rosso: **`__CPM_NO_SCHEDE259`** — rimette il sistema PO-226/234 della 7.999.169 (misurato: con il
rosso escono le stesse schede delle partite «prima», compresa quella sul 3-0).

## La richiesta, in breve

Foto del 15/10: al 63', sul 3-0, la scheda «gestiamo» con tre scelte generiche. Decisione PO «Poche ma decisive»:
1-2 schede a partita, solo quando conta; premio e rischio scritti sotto ogni pulsante; effetto vero sul motore;
dopo circa 5 minuti il gioco racconta cosa è successo; una riga nel riepilogo di fine partita.

## Le misure: 20 partite vere prima e dopo

Condizioni uguali per i due bracci: salvataggio `fixtures/save-194-primavera-w38.json`, partita vera di carriera
(`playMatch`), pilota automatico seedato, velocità 4, GLB spento, `?cpmtest=1`, 20 nomi diversi (quindi 20 semi
di partita diversi), la scelta della scheda alterna l'opzione 1/2/3. Stesso strumento per «prima» e «dopo»:
`CPM_CENSIMENTO=1 node schede-259.mjs`. File: `docs/sviluppo/dati-giro28/censimento-prima.json` e
`censimento-dopo.json` (con i log; la cartella `tests/visual/out/` non va in git).

| | **prima** (7.999.169) | **dopo** (giro 28) |
|---|---|---|
| partite finite | 20/20 | 20/20 |
| schede in tutto | 45 | 18 |
| schede a partita | **2,25** (massimo 3) | **0,90** (massimo 2) |
| partite con 0 / 1 / 2 / 3 schede | 0 / 2 / 11 / 7 | 8 / 6 / 6 / 0 |
| schede senza posta in gioco (scarto di 2 gol o più) | **8** (3-0 al 63', 2-0 al 60', 0-3 al 70'…) | **0** |
| minuti (minimo · mediana · massimo) | 25' · 70' · 88' | 13' · 75' · 82' |
| scarto al momento della scheda | 0:16 · +1:9 · −1:12 · +2:6 · +3:1 · −3:1 | 0:13 · +1:1 · −1:4 |
| la scelta cambia davvero un dato del motore | 45/45 | 18/18 |
| racconto dopo ~5' | non esisteva (0) | 18/18, tutti corrispondenti a un fatto del motore |
| riga nel riepilogo (partite con almeno una scheda) | non esisteva (0/20) | 12/12 |

Quali schede, prima e dopo:

- **prima:** «fiato corto» 17 volte, quasi sempre **al 55'** (anche sul 2-0 e sul 3-0) · «pari al 75'» 10 ·
  «sotto dopo il 70'» 8 (una sullo 0-3) · «vantaggio di misura dall'85'» 4 · «avanti di due» 4 · «perdi i duelli» 2.
- **dopo:** «pari dopo il 75'» 8 · «fiato corto» 5 (57', 57', 62', 69', 82' — nel minuto del calo) · «sotto di
  uno nel finale» 3 · «siamo in dieci» 1 (13') · «loro in dieci» 1 (55').
- In 20 partite **non è uscito nessun rigore contro**: il motore ne fischia pochi. La regola è provata a banco
  (parte A del guardiano), ma **in partita vera non posso confermarlo**.

Una nota onesta sul «prima»: anche il sistema 226 cambiava un dato del motore (la voglia di tirare), 45 volte su
45. Il difetto non era l'effetto mancante: erano troppe schede, spesso senza posta, con un solo effetto e senza
che il gioco dicesse poi cosa era successo.

## Le scelte di design, spiegate semplici

**1. Quando esce una scheda.** Solo se la partita è aperta (al massimo un gol di differenza) e succede una di
queste cose: siamo sotto di uno dal 70', è pari dal 75', siamo avanti di uno dall'82', un'espulsione (nostra o
loro) negli ultimi 3 minuti, un rigore contro negli ultimi 3 minuti, il fiato dell'eroe che crolla (scende sotto
40) dal 55' in poi, o l'eroe in panchina con la squadra sotto di uno o in pari dal 50'. Al massimo **due** a
partita, almeno **12 minuti** fra l'una e l'altra, mai dopo l'84' (così il racconto ha il tempo di arrivare).
Ogni scheda esce una volta sola.

**2. Il «fiato corto» nasce dal calo, non dal livello.** Col 226 usciva al 55' in quasi tutte le partite, perché
a quell'ora l'energia è quasi sempre sotto 55. Ho provato una soglia più bassa: usciva sempre al 60', di nuovo un
orario fisso (misura interrotta, `dopo-v1`). Ora la scheda nasce nel minuto in cui l'energia scende sotto 40:
il minuto cambia da partita a partita.

**3. Tre opzioni, tre modi di giocare — e premio e rischio sono misurati, non scritti a sentimento.** Prima di
scrivere le frasi ho misurato al banco (192 partite per braccio, i 15 minuti dopo la scheda) cosa fa davvero ogni
leva del motore:

| profilo | cosa cambia nel motore | premio misurato | rischio misurato |
|---|---|---|---|
| **«spingiamo»** | voglia di tirare su, pressing su, linea alta | tiri nostri **+28,9%** | pericolo dei loro tiri (xG subito) **+72,5%**: i contropiedi alle spalle della linea |
| **«teniamo palla»** | gioco palla a terra, meno voglia di tirare | tiri subiti **−22,1%** | tiri nostri **−8,0%** |
| **«la risolvo io»** | la prossima occasione dell'eroe arriva prima | prossima occasione dell'eroe **3,4 minuti prima** | tiri della squadra **−9,9%** |

(confronto con la stessa partita senza nessuna scelta applicata; stessi semi)

Due scoperte del banco hanno cambiato il progetto:
- **Spingere non costava niente.** Nel motore com'era, pressing e linea alta (prima stesura delle opzioni)
  davano +22% di tiri e −14% di tiri subiti rispetto alla stessa partita senza scelta: una scelta senza prezzo
  non è una scelta. Ho aggiunto il prezzo dove il calcio lo mette: quando la
  scheda alza la squadra, chi ci ruba palla cerca subito il compagno più avanzato (contropiede) e i loro tiri
  nascono da posizioni migliori. Vale **solo** mentre l'effetto della scheda è vivo; fuori dalle schede il
  motore è quello di prima.
- **«Difesa bassa» in questo motore non protegge:** abbassare la squadra faceva tirare di più l'avversario.
  Per questo le opzioni prudenti dicono «teniamo palla» (che misurato funziona) e non «chiudiamoci dietro».

Le frasi sotto i pulsanti dicono solo ciò che questi numeri confermano (esempio: «Premio: più tiri nel finale ·
Rischio: un contropiede può costare il punto»). L'effetto dura fino alla fine per le schede del finale, 15-20
minuti per espulsioni, rigore e fiato corto, poi la squadra torna com'era.

**4. Il racconto dopo 5 minuti nasce dai fatti.** Al momento della scelta il gioco fotografa punteggio e
tabellino del motore (tiri, palloni recuperati, contropiedi subiti, occasione dell'eroe); cinque minuti dopo
rifà la foto e mette davanti il fatto più importante: gol fatto, gol subito, contropiedi subiti, la palla buona
arrivata all'eroe, tiri concessi, pressing che recupera palloni, tiri fatti, «tiene», oppure «partita bloccata».
La frase va in cronaca e il mister la commenta in panchina (`addCoach`). Nessun sorteggio: stessi fatti, stessa
frase. Esempi veri dalle partite misurate:
- «❌ Ci siamo sbilanciati e ci hanno puniti: gol subito dopo «Andiamo a vincerla».» — mister: «Troppo alti, ci
  hanno presi alle spalle!»
- «✅ «Approfittiamone, tutti su» ha pagato: gol nei 5 minuti dopo la scelta.» — mister: «Così! È questa la strada!»
- «⚠️ Dopo «Aspetto la palla giusta» abbiamo concesso 3 tiri in 5 minuti, noi nessuno.» — mister: «Stiamo
  concedendo troppo, stringete!»

**Come so che il racconto corrisponde a un fatto del motore:** per ogni racconto il guardiano (1) ricalcola il
fatto dalle due foto e controlla che sia lo stesso numero, (2) controlla che il numero sia scritto nel testo,
(3) controlla che le foto siano letture vere del motore: mai all'indietro, mai oltre il tabellino finale e il
punteggio finale. 18/18 in partita vera, 411/411 al banco.

Nota: il censimento «dopo» è stato girato prima di due ritocchi che toccano **solo** il racconto (la grammatica
delle frasi e la soglia «palloni recuperati» da 3 a 2). Selezione delle schede ed effetti sul motore sono gli
stessi della build finale; il guardiano finale (8 partite) gira sulla build esatta del commit.

**5. Il riepilogo.** Nel giornale di fine partita, sopra «Il tuo tabellino», una riga per ogni scelta:
«🧠 La tua scelta al 83': «Andiamo a vincerla» → ci hanno puniti: gol subito».

**6. La finestra resta quella standard (PO-230).** Ho solo aggiunto, dentro ogni pulsante, le due righe «Premio»
e «Rischio». Foto: `docs/sviluppo/foto/po259/scheda-412-1.png`, `scheda-360-1.png` (a 360 px il rischio va a capo
su due righe, si legge tutto) e `riepilogo-412.png`. La foto del riepilogo a 360 px non c'è: quella partita
non è arrivata al fischio entro il tempo della sonda.

**7. Determinismo.** Nessun `Math.random` nuovo. La scheda è funzione dello stato della partita; i fatti rari
(espulsioni, rigori) si leggono dal tabellino del motore; il contropiede usa il generatore seedato del motore
(e solo mentre una scheda è attiva); il racconto è una funzione pura.

## Cosa cambia per i guardiani

- **Nuovo `schede-259`** (`npm run schede-259`, registrato nella catena completa e nella mirata per src/14 e
  src/15). Tre parti: (A) regola pura — 9 momenti senza posta restano muti, 7 momenti decisivi aprono la scheda
  giusta, nessuna opzione senza premio e rischio; (B) banco del motore — premio e rischio di ogni profilo veri,
  racconti coerenti; (C) 4 partite vere verdi + 4 rosse. Uscita 0 solo se il rosso viene riconosciuto.
  Esito: **verde**; rosso con 2,50 schede a partita, 2 senza posta, 0 racconti (= la 169).
- **`interazioni-226`, `schede-234`, `schede-246`:** custodiscono le schede del sistema 226, che ora vivono solo
  sotto il rosso del 259. La loro parte in partita vera accende `__CPM_NO_SCHEDE259`; le parti a banco sono
  invariate. Senza questo, `schede-234` avrebbe cercato schede 226 che non escono più.
- Strumento di collaudo (non guardiano): `tests/visual/foto-schede-259.mjs` per le foto.

## Esiti della catena

Tutti eseguiti dentro il turno, sulla build del giro (log in `docs/sviluppo/dati-giro28/`):

| guardiano | esito |
|---|---|
| `schede-259` (nuovo) | ✅ verde · rosso riconosciuto |
| `tempo-138` | ✅ verde |
| `schede-234` | ✅ verde (parte in partita sotto `__CPM_NO_SCHEDE259`) |
| `interazioni-226` | ✅ verde (idem) |
| `partita-vera` | ✅ verde — «le bande d'accettazione tengono» |
| `career-critical` | ✅ verde (tutte le sotto-suite) |
| `test:logic` | ✅ 43/43 |
| `design-system` | ✅ verde |
| `match-sequence` (determinismo) | ❌ **rosso, ma identico sulla base 169** — vedi sotto |

**`match-sequence`: il rosso c'era già.** Il guardiano gioca quattro volte la stessa partita (due a 1x, due a
2x) e confronta la cronaca. Sulla mia build e sulla base 169 (stessa macchina, stesse condizioni) succede la
stessa cosa: una delle coppie diverge alla riga 5-6, intorno al 9', e la coppia che diverge cambia da un giro
all'altro.

| build | condizioni | 1x/1x | 2x/2x | 1x/2x |
|---|---|---|---|---|
| giro 28 | con altri test in corso | ❌ pos. 5 | ✅ 100% | ❌ pos. 6 |
| base 169 | con altri test in corso | ❌ pos. 5 | ✅ 100% | ❌ pos. 6 |
| giro 28 | da sola | ✅ 100% | ❌ pos. 6 | ❌ pos. 5 |
| base 169 | da sola | ❌ pos. 5 | ✅ 100% | ❌ pos. 6 |

La divergenza arriva **prima di qualunque scheda**: il codice del giro 28, fino alla prima scheda, legge
soltanto (tabellino del motore ed energia). Il guardiano non è in nessuna catena di `ci-runner`, quindi
nessuno lo stava rigiocando. La causa del rosso **non l'ho cercata** in questo giro (fuori ambito): va aperta
una voce a parte.

## Cosa resta aperto

- **Il «pari dopo il 75'» esce quasi sempre esattamente al 75'** (7 volte su 8): il pari c'era già e la scheda
  nasce al primo minuto ammesso. È il momento chiesto dal PO, ma il minuto è prevedibile. Una possibile modifica
  (da decidere): farla nascere su un fatto del finale (un tiro pericoloso loro, un'occasione nostra) invece che
  sull'orologio.
- **8 partite su 20 senza nessuna scheda** (risultati 4-1, 2-0 ×3, 1-3, 1-4, 4-3, 2-1). È coerente con «niente
  schede senza posta»; per il 4-3 e il 2-1 **non posso confermare** il motivo preciso (non ho registrato
  l'andamento del punteggio minuto per minuto: probabilmente i gol del bilico sono arrivati dopo l'84').
- **Rigore contro mai visto in partita vera** (vedi sopra).
- I valori degli effetti (quanto si alza la linea, quanto pesa il contropiede) sono **scelte di progetto tarate
  al banco**, non vengono da una fonte esterna. Il «quanto si sente» va collaudato in partita dal PO.
- Le misure sono headless con pilota automatico: sotto pilota il cronometro non si ferma con la scheda aperta,
  quindi il minuto della scelta può essere qualche minuto dopo il minuto della scheda (è successo nella foto a 412
  px: scheda al 75', scelta al 83'). In partita giocata il cronometro si ferma finché non si sceglie.
