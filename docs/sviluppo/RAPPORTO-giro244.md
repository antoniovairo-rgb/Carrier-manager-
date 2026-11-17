# Rapporto giro 244 — PO-509 «coreografie sempre diverse»

Ramo `sviluppo/giro244-coreografie`, partito da `lavoro/197` (7.999.197). `GAME_VERSION` non toccata.

## La richiesta

Foto del PO (7.999.196, `docs/collaudo-po/196-coreografia-sempre-uguale.jpg`): ingresso in campo FC Rotterdam – FC Merseyside, in curva il
telo a cartoncini con la croce. «Creare coreografie sempre diverse, non sempre la stessa». Decisione PO 17/11: «Anche in movimento».

## Misura prima (sul codice di partenza, `lavoro/197`)

Sonda `tests/visual/coreografie-244.mjs` in sola misura: **30 ingressi veri** (salvataggio → partita → ingresso, corpi 3D accesi), nello
stesso dispositivo, variando avversario, casa/trasferta, stagione (12→16) e tipo di gara (cartello, derby, coppa europea, Nazionale, finale).
La firma è letta **dalla scena** (forma del disegno della tela a 32×16 caselle, indipendente dai colori; numero di pezzi; geometria a due
istanti del tempo di scena).

| | prima |
|---|---|
| partite con coreografia | 30 su 30 |
| disegni distinti | **1** (firma `c5eaf48c/1` 30 volte) |
| stessa coreografia due partite di fila | **29 coppie su 29** |
| coreografie che si muovono | **0** |

Cosa cambiava fra una partita e l'altra: **solo i colori del club di casa** (e la grana dei cartoncini, che dipende da club+stagione).
Il disegno — otto strisce verticali e una fascia orizzontale, cioè la «croce» della foto — era scritto una volta sola in `_mkCoreo`
(src/12, giro 206). Il «seme per partita» del 7.125 è in realtà club+stagione+nazione (`adSeed`), quindi costante per tutta la stagione,
e muoveva solo la scritta di un altro oggetto (il drappo `teloMs` del 7.124), non i cartoncini dell'ingresso.

Foto: `docs/sviluppo/giro244/prima-30-partite.jpg`, `prima-partita-01.jpg`; numeri: `misura-coreografie-prima.json`.

## Cosa è cambiato

File toccati: `src/12-three-match-view.jsx` (catalogo, scelta, costruzione, animazione nel passo dell'ingresso), `src/15-live-match.jsx`
(una sola prop: l'identità della partita), più guardiano, `package.json`, `ci-runner.mjs`. Zona tunnel/panchine **non toccata** (giro 245).

1. **Catalogo `COREO244` di 12 coreografie**, tutte procedurali, nessun asset nuovo, coi due colori sociali del club di casa dello stadio
   (gli stessi `_tHCol`/`_hc2` di prima):
   - ferme (8): `croce` (quella di ieri), `pali`, `scacchi`, `diagonali`, `raggi`, `sigla` (sigla del club a tutta curva), `stemma`
     (scudo con croce), `scritta` (nome del club su fascia);
   - in movimento (4): `gira` (cartoncini che girano: un fronte volta le colonne da un disegno all'altro, avanti e indietro), `scorre`
     (frecce bicolori che corrono lungo la curva), `bandieroni` (5/7/9 grandi bandiere che sventolano), `srotola` (telone col rombo e la
     sigla che si srotola dal basso e poi ondeggia).
2. **Scelta a rotazione** (`coreo244Scegli`): fra le coreografie **non viste nelle ultime quattro partite con coreografia** si pesca col
   seme della partita (stagione, settimana, competizione, squadre) → mai la stessa due partite di fila. La **stessa partita riaperta**
   (salvataggio e ripresa, «Riprova» della scena 3D) mostra la stessa coreografia.
3. **Memoria nel dispositivo**, chiave `cpm-coreo244` (una voce per giocatore, al massimo 6), **fuori dal salvataggio** come la velocità
   di partita: nessun campo nuovo nel save, nessun cambio di `SAVE_VERSION`. Senza archivio del browser resta la pesca col seme.
4. **Taglia** dal tier esistente: 3 = finali, derby e gare a tier 3 (più larga e più alta di ieri: 56 u × pendenza 0,08–0,92) · 2 = coppe
   europee, Nazionale, tier 2 (la misura di ieri: 50 u × 0,14–0,86) · 1 = le altre gare di cartello (38 u × 0,20–0,80). I bandieroni
   sono 9/7/5. Le quattro righe del tier (`_impo`…`_ctier`) sono state **spostate** sopra la scena dell'ingresso, senza cambiarle.
5. **Lato ospite**: regola esistente invariata (solo nelle finali e solo se c'è tifo ospite); prende una coreografia **ferma diversa** da
   quella di casa, con le scritte specchiate per leggersi dal campo.
6. Le partite «normali» restano **senza** coreografia (regola del giro 206, non toccata).
7. **Rosso `window.__CPM_NO_G244`**: torna il disegno unico di ieri (`_mkCoreo` è rimasto com'era).

### Budget dichiarato (telefono)

Tutto si costruisce una volta al montaggio della partita; le animazioni girano **solo durante l'ingresso, a coreografia accesa**.

| coreografia | lavoro per fotogramma | disegni in più rispetto a ieri |
|---|---|---|
| ferme, `scorre` | nessun ricalcolo (per `scorre` solo lo scorrimento della tela) | 0 |
| `gira` | riscrive le uv delle sole colonne che cambiano (al più 32 colonne) | 0 |
| `srotola` | 99 punti (una sinusoide a punto) | 0 |
| `bandieroni` (la più pesante) | 28 punti di **una** geometria condivisa + 9 trasformazioni | +8 chiamate di disegno, 324 triangoli, 2 tele 128×96 |

Nessuna luce, nessun materiale nuovo per tipo oltre a quelli elencati, nessuna tela ridisegnata dopo il montaggio.

## Misura dopo

Stesse 30 partite, stesso dispositivo (guardiano `coreografie-244`):

| | prima | dopo |
|---|---|---|
| coreografie distinte | 1 | **12** nomi del catalogo (14 forme: sigla e scritta cambiano forma col club) |
| stessa due partite di fila | 29 su 29 | **0** |
| che si muovono | 0 | **4** (`gira`, `scorre`, `bandieroni`, `srotola`) — dichiarate animate = mosse in scena, 30 su 30 coerenti |
| partita riaperta | — | stessa coreografia (`gira` → `gira`) |
| lato ospite | solo finali | solo finali (3 finali, tre coppie casa+ospiti diverse fra loro) |
| fps dell'ingresso, telefono 375×667 CPU×2, stesso derby | 2,53 (rosso) | 2,46 con `bandieroni` forzata = **97%** (soglia 85%) |

Sequenza vista: sigla · croce · diagonali · scritta · stemma · sigla · scacchi · gira · bandieroni · raggi · croce · sigla · pali · gira ·
scorre · scritta · stemma · diagonali · croce · scorre · bandieroni · scritta · scacchi · stemma · srotola · bandieroni · scorre · pali ·
raggi · gira.

**Prova del rosso** (`CPM_PROVA_ROSSO=1`, 8 partite con `__CPM_NO_G244`): 1 disegno, 7 coppie uguali su 7, 0 in movimento → il guardiano
riconosce il difetto.

Foto: `docs/sviluppo/giro244/dopo-30-partite.jpg` (le 30 partite), `dopo-catalogo-12.jpg` (le dodici coreografie forzate sulla stessa
curva); numeri: `misura-coreografie-dopo.json`, `misura-coreografie-rosso.json`.

⚠️ Gli fps sono del banco senza scheda grafica (2-3 fps): vale il **rapporto** fra i due bracci, non il valore. Sul telefono vero non ho
misurato nulla.

## Guardiano nuovo

`npm run coreografie-244` (= verde + prova del rosso). Verde: almeno 8 distinte su 30, mai la stessa due di fila (per forma **e** per nome),
almeno 3 in movimento, animate dichiarate = animate misurate, partita riaperta uguale, ospiti solo in finale e diversi dalla casa,
finali/derby a taglia 3, fps ≥ 85% del rosso, nessun errore di pagina; una partita senza coreografia accesa = rosso («non giudicato»).
Registrato una volta in `completa`, nella prima voce `src/12|13` della mappa e in `LENTI` (`node --check` verde).
Durata misurata: verde ~35 minuti (33 ingressi veri), rosso ~8 minuti.

## Controlli

Uno alla volta (`CPM_CI_PAR=0`), `CPM_CHROME=/opt/pw-browsers/chromium`, sul build finale (`check-src`: identico).

| controllo | esito |
|---|---|
| `coreografie-244` verde (30 partite + riapertura + fps) | ✅ 12 distinte, 0 di fila, 4 in movimento, fps 2,46/2,53 |
| `coreografie-244` rosso (`__CPM_NO_G244`, 8 partite) | ✅ il difetto si vede (1 disegno, fermo) |
| `ingresso-206` (11 ingressi, verde + rossi) | ✅ verde; fps big telefono 2,49 contro 2,53 senza le novità del 206, PC 1,20 contro 1,16 |
| `notte-206` | ✅ verde e rosso |
| `fps-249` | ✅ verde e rosso |
| `tpose-196` | ✅ verde (0 T-pose su 4 scenari) e rosso atteso |
| `gigante-212` | ✅ verde e rosso |
| `test:logic` | ✅ 51 pass · 0 fail |
| `save-compat` | ✅ 12 pass · 0 fail |
| `node --check ci-runner.mjs`, `package.json` valido | ✅ |

Nota: la regola aggiunta al guardiano dopo il giro verde («stesso nome due di fila», «due nomi con la stessa forma») è stata verificata
a tavolino sui dati salvati del giro verde (0 casi), non con un secondo giro da 35 minuti.

Non eseguiti: `highlight-95`, `career-critical` e il resto della mappa mirata di `src/12`/`src/15` (vedi dubbio 9). All'inizio del lavoro
ho lanciato per errore `node ci-runner.mjs mirata lavoro/197` credendo che elencasse soltanto: è partito il nucleo, l'ho fermato dopo circa
due minuti; nessun file del repo ne è rimasto modificato.

## Dubbi per il PO

1. **Dove sta la memoria.** «Mai la stessa due partite di fila, anche tra salvataggio e ripresa» è garantito sullo **stesso dispositivo**
   (chiave propria, fuori dal salvataggio: nessun cambio al formato del save). Se un salvataggio viene esportato e ripreso su un altro
   telefono, la prima partita lì può ripetere l'ultima vista. Per chiuderlo servirebbe un campo nuovo nel salvataggio: non l'ho fatto
   perché è una scelta di formato.
2. **Taglie 1 e 2 non viste nelle 30 partite.** Col salvataggio di prova (club di vertice, ultima giornata) tutte le gare escono a tier 3,
   quindi taglia 3. Le taglie minori sono nel codice ma non hanno una foto né un giudizio del guardiano.
3. **Il drappo del 7.124 (`teloMs`, scritta ULTRAS/sigla) non è toccato**: è un altro oggetto (in partita, si accende al gol), cambia
   ancora solo per club+stagione. Fuori dalla consegna.
4. **Partite normali senza coreografia**: regola del giro 206 lasciata com'è. Chi gioca solo gare «normali» non vede il catalogo.
5. **«Stemma»** è uno scudo generico con croce nei colori del club, non lo stemma vero del club (che nel gioco è un SVG di interfaccia).
6. **Nomi lunghi**: `scritta` usa il nome del club senza prefisso (FC, AC…) se sta in 13 lettere, altrimenti la sigla.
7. **Finale in campo neutro**: nelle foto 6, 16 e 26 il tabellone copre parte della coreografia dalla camera fissa della sonda; non ho
   verificato come appare dalle inquadrature vere della regia della finale.
8. **Durata del guardiano**: ~43 minuti fra verde e rosso, perché le 30 partite sono 30 ingressi veri. È oltre i 20 minuti.
9. **Mappa mirata di `src/12` e `src/15`**: conta decine di guardiani (fra cui `validate-situations`, `partita-vera`, `highlight-95`).
   Ho eseguito solo quelli elencati nella consegna (sotto); gli altri restano alla verifica di rilascio.
10. **Telefono vero**: fps e resa delle quattro animate vanno guardati sul dispositivo; il banco dice solo che il costo relativo è ~3%.
