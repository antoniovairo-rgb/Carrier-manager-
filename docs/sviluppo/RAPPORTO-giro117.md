# Rapporto giro 117 — PO-323 (angolo, eroe lontano e girato) · PO-324 (tabellone ≠ motore)

Ramo `sviluppo/giro117-angolo-tabellone`, base `lavoro/184`. `GAME_VERSION` non toccata (7.999.183 nel codice).
Perimetri dei giri 114/115/116 non toccati: le modifiche stanno in `src/04` (costruttore della scena di cross/angolo),
`src/10` (riga della bozza del taccuino), `src/12` (testimone `__CPM_CONT53`, sola lettura), `src/15` (istantanea di
ripresa, ripristino alla ripresa, testo della nota 216).

## PO-323 — «Calcio d'angolo di HOWARD: attacca il pallone!» · stacco in corsa · 159° · «troppo distante»

**Misura prima del rimedio** (sonda `angolo-117`, GLB acceso, pagina nuova per ogni caso). La scena d'angolo/cross dal
motore (`scenaDalMotoreCross`, src/04) si costruiva sulla posizione dell'eroe che il motore dichiara con l'occasione
(`occ.x/occ.y` = dove sta il ricevente). Il motore sceglie l'eroe come ricevente anche quando è a centrocampo: la nota
del PO ha l'eroe a x 3D −2,1, cioè x logico ≈ 48. Riprodotto con l'occasione dichiarata a (48,50):

| caso (braccio rosso = codice di prima) | angolo al contatto | eroe↔porta | eroe↔pallone |
|---|---|---|---|
| angolo dal centro, fallito | **73°** | 39,5 u | 2,0 u |
| angolo dal centro, riuscito | 4° | 39,5 u | 2,0 u |
| angolo lato basso (y 22), fallito | 12° | 35,4 u | 0,5 u |
| angolo lato alto (y 80), fallito | **72°** | 36,4 u | 1,9 u |
| angolo lato alto, riuscito | 1° | 36,5 u | 2,0 u |
| cross da lontano (62,30), fallito | 7° | 31,4 u | 0,2 u |

Il pallone partiva dalla bandierina giusta e andava a cercare l'eroe a 31-40 unità dalla porta: lo stacco avveniva fuori
area e, nel fallito, col corpo girato. Il 159° del telefono non l'ho riprodotto in headless (qui 72-73°): stesso
difetto, ampiezza diversa — il numero del telefono resta il giudice del residuo.

**Causa.** Il titolo dice «attacca il pallone» in area, ma l'ancora della scena (zona di partenza e di movimento) era il
punto dell'eroe nel motore, ovunque fosse.

**Rimedio** (`src/04`, rosso `__CPM_NO_G117A`). Se l'ancora è fuori, entra fra il dischetto e l'area piccola: x 87-93,
y 38-62 (logico). Dentro quella finestra l'ancora resta identica, quindi le scene già in area non cambiano di un decimo
(verificato: `angolo-area-*` e il gate). Nessun sorteggio in più: il generatore locale della scena consuma gli stessi
numeri, si sposta solo un punto. Il motore non è toccato.

**Testimone** `__CPM_CONT53` (src/12, sola lettura): ora annota anche `db` (distanza eroe↔pallone, unità logiche) e `gx`
(distanza dalla linea di porta); la bozza del taccuino li scrive («pallone a … u, porta a … u»), così la prossima nota
«troppo distante» porta il numero.

**Guardiano `npm run angolo-117`** (8 casi verdi + 6 rossi, ~8 min). Casi: centro/lati/area, le due bandierine (y<50 →
2,5; y>50 → 97,5), riuscito e fallito, semi diversi, un cross da lontano.
- Verde misurato: **0 girati**, angoli 3-20°, porta 4,5-6,6 u, pallone 0,1-0,5 u.
- Rosso misurato: 6/6 casi lontani con porta ≥ 31 u (due girati a 72-73°).
- Soglie fissate dopo la misura: angolo ≤ 35° (quella del testimone), porta ≤ 10,5 u (il dischetto, 11 m), pallone
  ≤ 1,0 u (il doppio del verde peggiore; il rosso arriva a 2,0); rosso: porta ≥ 25 u su tutti i casi lontani.

**Scelte prudenti.** (1) Ho applicato il rimedio anche al cross (non solo all'angolo): stesso costruttore, stesso titolo
«attacca il pallone in area», stesso difetto misurato (31,4 u). (2) Non ho toccato il motore (la scelta del ricevente):
spostarla avrebbe cambiato i sorteggi del motore. (3) La finestra 87-93 × 38-62 è una scelta mia di geometria (dischetto
≈ 89,5, area piccola ≈ 94,8): se il PO vuole stacchi più vicini alla porta si stringe lì.

## PO-324 — «tabellone 1-2, motore 0-0. Gol del motore: —. Gol del tabellone: —. Scene: 56'»

**Ipotesi misurate.** Elenchi entrambi vuoti con tabellone 1-2 e una sola scena al 56' = partita ripresa dopo un
riavvio. Verificato nel codice: l'istantanea `cpm-match-resume` (src/15, scritta ogni 4 s e all'uscita) portava punteggio,
minuto, momentum, statistiche dell'eroe e cartellini, ma **non** il tabellino del motore né il registro `MATCH_EV`. Alla
ripresa il componente rinasce: il motore si crea da zero (tabellino 0-0, `_golLog` vuoto), `MATCH_EV` è vuoto (pagina
nuova), il tabellone torna dal salvataggio.

**Riproduzione sul percorso vero** (sonda `tabellone-117`): salvataggio S12, autoplay seedato (seme 4) fino al primo gol
del tabellone (11'), istantanea periodica, pagina chiusa senza pagehide e riaperta nello stesso profilo, rientro in campo,
autoplay fino al fischio. Rosso (codice di prima): **tabellone 4-0, motore 3-0**, gol del motore e del tabellone senza
quello dell'11' — la stessa forma della nota del PO. Quindi la causa è la ripresa; non ho trovato altri percorsi che la
producano (vedi sotto).

**Rimedio** (src/15, rosso `__CPM_NO_G117B`). L'istantanea porta anche `g117` = tabellino del motore (gol e assist per
lato), `_golLog` e i gol di `MATCH_EV`. Alla ripresa, appena il motore nasce, i gol di prima tornano nel suo tabellino, nel
suo registro (marcati `ripresa:true`), nelle pagelle dei marcatori quando l'indice è noto, e in `MATCH_EV`. Istantanea di
una versione precedente (senza `g117`): i gol si ricavano dal punteggio salvato, al minuto della ripresa. Nessun sorteggio:
si scrivono contatori ed elenchi di lettura. **Non** ho toccato `S.conta.gol` (il conteggio che il motore usa per le sue
decisioni di gestione del risultato): dopo una ripresa il motore continua a «credere» 0-0 per la tattica come prima. È una
scelta prudente per non cambiare il comportamento del motore; resta aperta se il PO la vuole.

**Testimone rafforzato.** La nota 216 ora termina con «Ripresa dopo riavvio: sì, al N', punteggio salvato a-b, gol del
motore ripristinati: sì/no» oppure «Ripresa dopo riavvio: no» (campo `ripresa117` nel record).

**Guardiano `npm run tabellone-117`** (3 bracci in parallelo, ~5 min):
- ripresa verde: tabellone 4-0 = motore 4-0 = 4 gol in elenco, nessuna nota 216;
- ripresa rosso: tabellone 4-0, motore 3-0, nota 216 con «Ripresa dopo riavvio: sì, al 11'»;
- percorso normale (senza riavvio) verde: 1-1 = 1-1 = 2 gol in elenco.

**Percorsi provati / non provati.** Provati: partita intera senza riavvio; riavvio a metà partita (chiusura e
riapertura della pagina). Non provati in questo giro: app in sfondo senza riavvio (il JS resta vivo, nessuna ripresa: per
costruzione non può perdere il motore); «Salta» alla fine; ripresa di una gara della Nazionale (stesso codice di ripresa,
non esercitato dal guardiano). Il ramo «istantanea vecchia senza g117» non è esercitato dal guardiano.

## Catena dei controlli (in sequenza, un controllo alla volta)

| controllo | esito |
|---|---|
| angolo-117 | ✅ verde 8/8, rosso visibile 6/6 |
| tabellone-117 | ✅ verde (ripresa + normale), rosso visibile |
| tabellino-228 | ✅ |
| replay | ✅ 8 highlight |
| validate-situations | ✅ 14/14, fingerprint 00001505, 0 failure |
| highlight-95 | ❌ **rosso nel verde: 1 difetto D3** (vedi sotto); braccio rosso fermato da me dopo 60 min (vedi sotto) |
| scena3d-96 | ⏳ incompleto: fermato al tetto delle 4 ore dopo 25 scene ✓ e 0 ✗ (corsa interrotta = non vale) |
| partita-vera | ⏳ non eseguito: tetto delle 4 ore |
| career-critical | ✅ catena intera, uscita 0 (la prima corsa, interrotta dal mio timeout a 9 min 40, non conta; rifatta da capo) |
| test:logic | ✅ 43 pass · 0 fail |
| save-compat | ✅ 12 pass · 0 fail |

### Il D3 aperto di `highlight-95` (difetto bloccante, non risolto in questo giro)

`D3 s1/2021 «⚽ Volée di collo potente»: «Grande parata del portiere» ma il pallone non arriva mai al portiere entro 1,5 s
dall'esito (minimo 6,8)`. Salvataggio s1 (Primavera), seme 2021, politica «pass».
- Si è presentato in **3 corse su 5** di quella partita (la partita stessa non è ripetibile: il motore dipende
  dall'orologio a parete, come già annotato in `tabellino-228`; nelle corse senza D3 la partita è uscita diversa, 3-1 con
  6 highlight invece di 4-2 con 7).
- Con `__CPM_NO_G117A` la partita è uscita diversa (3-1) e senza la volée: **non posso confermare né escludere** che il
  difetto dipenda dal mio rimedio. Il rimedio cambia la foto di fine scena che si consegna al motore, quindi la partita
  dopo una scena di cross/angolo spostata è un'altra (atteso; i sorteggi del motore non cambiano di numero né ordine —
  `replay` verde).
- Prima ipotesi (campionamento della sonda troppo rado): **smentita dalla misura**. Ho aggiunto un testimone per
  fotogramma del minimo portiere↔pallone nella scena (`__CPM_GKMIN117`, src/12, solo `__CPM_REC`), letto da D3 nella
  stessa finestra e con la stessa soglia: la corsa successiva ha dato di nuovo 6,8. Il pallone in quella scena non arriva
  davvero al portiere. Il testimone resta: rende D3 più severo, mai più indulgente.
- Nelle scene forzate equivalenti (volée su cross/angolo, esito «saved», sia in area sia spostate dal rimedio) il portiere
  arriva sul pallone: minimo 0,2-2,4 u. Il caso del flusso vero ha qualcosa che le scene forzate non hanno; la causa non è
  determinata.
- Strumento pronto per il prossimo giro: `CPM_D3DIAG=1` stampa nella riga del D3 tipo, chiave, posizione di eroe, pallone
  e portiere all'esito.
- ⚠️ Errore mio di processo: un giro mirato (s1,s5,s12 × seme 2021) l'ho lanciato mentre il braccio rosso del giro
  completo era ancora in corsa — due controlli insieme. Quel giro mirato (senza D3) non vale come prova. Il braccio rosso
  del giro completo, rallentato, l'ho fermato per PID dopo 60 minuti: il «rosso visibile» di `highlight-95` in questa
  corsa non è verificato (lo era nella prima corsa completa: D1/D3 visti nel rosso).

**Raccomandazione (decisione del PO, non mia):** finché il D3 non è spiegato, il lotto non è pronto per `main`. Se serve
spedire PO-324 da solo, è indipendente da PO-323 (commit separati: `dd42d99` è PO-324, il primo commit è PO-323).

`node tools/build-src.mjs` + `node tools/check-src.mjs`: identico byte per byte.
