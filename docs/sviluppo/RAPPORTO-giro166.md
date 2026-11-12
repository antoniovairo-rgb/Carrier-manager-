# RAPPORTO giro 166 — Partita a soli highlight per le gare senza posta (PO-364, opzione C)

Ramo `sviluppo/giro166-solo-highlight`, partito da `main` 7.999.190 (`6e995b9`). `GAME_VERSION` non toccata.
Decisione PO: «B e C insieme». Questo giro fa la **C**; la B (tasto «Vai al prossimo momento» e regola di posta
allargata) è del giro 165. Qui la regola di posta è **quella che il gioco ha già**, non allargata.

## 0. In breve

- **Cosa c'è di nuovo.** Nel prompt della partita, accanto a «Gioca la partita» e «Simula e avanza la settimana»,
  compare **«Gioca solo i momenti salienti»** — solo per le partite di **campionato** della carriera da
  **professionista** con peso `calcMatchWeight` **< 5**, e solo da titolare. Si salta il gioco fluido; restano
  prepartita, scene con le loro scelte, esito, schermata finale e intervista.
- **Non è un secondo motore.** È lo stesso battito della partita intera (stesso corpo di codice, stessi sorteggi,
  stessi sotto-tick del motore), fatto correre a lotti invece che a orologio. Le scene restano a tempo reale.
- **Durata misurata** (pilota automatico, 1x, telefono 412 px, senza corpi 3D): partita intera **188-211 s**,
  a soli highlight **43-64 s** (0,7-1,1 min). Il giro 164 stimava ≈ 0,8 min (non misurato): la misura lo conferma
  come ordine di grandezza; il tempo dipende quasi solo dal numero di scene (5-8 nelle partite misurate).
- **Stesso seme → stessa partita:** sulla partita del guardiano **288/288 voci del libro mastro identiche**,
  stesso risultato (2-0), stessa schermata finale (tabellino, pagella, statistiche: 1.625 caratteri uguali), stessa
  voce di carriera, intervista chiesta in entrambe.
- **⚠️ Limite misurato e dichiarato (importante).** Con altri due nomi di giocatore la **partita intera non è
  riproducibile nemmeno contro se stessa** (tre partite intere identiche per costruzione hanno dato tre risultati
  diversi). Dove la partita intera è stabile, i soli highlight le sono identici; dove non lo è, il confronto
  **non è giudicabile**. È una variabilità che esisteva prima di questo giro (§4.3) e che non ho corretto.
- Rosso `window.__CPM_NO_G166` · guardiano `npm run solo-highlight-166` (verde col verde, rosso col rosso).

## 1. Misura prima

Dal giro 164 (`docs/collaudo/GIRO164-STAGIONE-PRO.md`, ramo `collaudo/giro164-stagione-pro`, §5, §6.3, §8-C):
una partita ha posta se è fuori dal campionato oppure ha `calcMatchWeight ≥ 5`; con questa regola un club di
metà classifica gioca 35-36 partite senza posta su ~40; la durata di una partita a soli highlight era
**stimata ≈ 0,8 min, non misurata**.

Misura di base di questo giro (sonda `tests/visual/lib/partita-166.mjs`: carriera vera, salvataggio sintetico
professionista, stagione 2, settimana 2, prompt vero → bottone «Gioca la partita» → pilota automatico seedato,
seme 7300, velocità 1x, `?cpmtest=1`, corpi 3D spenti):

| Partita intera «Collaudo Salienti» | giro 1 | giro 2 |
|---|---|---|
| Durata reale dal prepartita al fischio | 188,4 s | 188,3 s |
| di cui gioco fluido (`playing`) | 148,5 s | 150,4 s |
| di cui scene (`hl_intro`+`hl_move`+`hl_choose`+`hl_result`) | 34,5 s | 32,5 s |
| di cui prepartita (`matchday`) | 5,4 s | 5,4 s |
| Scene | 5 | 5 |
| Voci del libro mastro | 288 | 288 |
| Risultato | 2-0 | 2-0 |

Verde contro verde (le due partite intere fra loro): **288/288 voci identiche**, stessa voce di carriera.
Quindi il 79% del tempo di una partita intera è gioco fluido.

## 2. Cosa ho cambiato

### `src/15-live-match.jsx`
- **r. 1783** — `LiveMatch` riceve la proprietà `soloHL` (default `false`).
- **r. 2856-2862** — `_solo166`: la modalità è attiva se chiesta (`soloHL`, o il gancio di sola sonda
  `__CPM_SOLO166` sotto `?cpmtest=1`) **e** il rosso `__CPM_NO_G166` è spento. Testimone di collaudo `__CPM_LM166`.
- **r. 5001** — il corpo del battito della partita, che era la funzione anonima dentro `setInterval`, ora ha un
  nome (`_batt166`). **Il corpo non è cambiato di una riga.**
- **r. 9158-9167** — `_lotto166`: nella modalità a soli highlight l'intervallo (ogni 16 ms) chiama lo stesso
  battito in un ciclo, ciascuno dentro `ReactDOM.flushSync` (un render per battito, come quando fra due battiti
  passa un fotogramma), per al più 12 ms o 66 battiti; il ciclo si ferma appena la fase esce da `playing`
  (scena, fischio) o l'effetto si smonta (pausa, scelta del mister aperta). Nella partita intera l'intervallo è
  quello di prima (`_per115`). Testimone di collaudo `__CPM_G166` (battiti, lotti, ms).
- **r. 9168** — `_solo166` fra le dipendenze dell'effetto.
- **r. 2342** — l'istantanea di ripresa (`cpm-match-resume`) porta `s166`, così una partita ripresa dopo il
  background rientra nella stessa modalità.
- **r. 11582-11587** — il **velo** (`data-cpm="solo-166-velo"`): durante il gioco fluido copre il campo e dice
  «Momenti salienti · minuto · Si va al prossimo momento». Tabellone e minuto restano visibili sopra. Solo token
  del tema (`TINTE`, `FS`, `FW`, `SP`, `FONT_TV`).

### `src/18-career-app.jsx`
- **r. 450-459** — `soloHL166Ref` (modalità della partita in corso), `soloChiesta166Ref` (scelta appena fatta nel
  prompt) e `senzaPosta166(md)`: vero solo se `proStatus==="pro"`, tipo di gara campionato e
  `calcMatchWeight(...) < 5`. È la soglia a cui il gioco stesso aggiunge un highlight (`src/15`, r. ~1811).
- **r. 1135** — `startMatch` consuma la scelta: ogni altro ingresso (tasto «Gioca», tastiera) apre la partita
  intera; la ripresa rilegge `s166`.
- **r. 6988-6992** — il bottone `data-cpm="solo-166"` e la nota che lo spiega, nel prompt nuovo (quello con
  `data-cpm="partita23"`), dopo «Gioca la partita» e prima di «Simula».
- **r. 6285** — `LiveMatch` riceve `soloHL` solo nel contesto `career` (mai coppa, Europa, Nazionale).
- **r. 1540-1543** — ganci di sola sonda: `avv166()` (avversario e peso del prompt di collaudo) e secondo
  argomento di `apriPartita` (tipo di gara).

### `tests/visual`
- `solo-highlight-166.mjs` — il guardiano (script `npm run solo-highlight-166`).
- `lib/partita-166.mjs` — libreria: apre la carriera, apre il prompt, gioca la partita, misura i tempi per fase.
- `foto-166.mjs` — le foto (non è un guardiano).
- `ci-runner.mjs` — `solo-highlight-166` aggiunto alla catena completa, alla mappa di `src/15` e `src/18`, e ai
  passi lenti.
- `package.json` — lo script.

Dopo ogni modifica a `src/`: `node tools/build-src.mjs` e `node tools/check-src.mjs` → «IDENTICO BYTE PER BYTE —
7190384 byte ricomposti da 21 frammenti».

## 3. Perché lo stesso battito e non un salto

Il giro 164 chiedeva una «modalità di partita che oggi non esiste». Le strade erano due: (a) saltare i minuti
calcolandoli col motore senza grafica (`simulaPartitaMotore`), (b) far correre il battito della partita vera.
Ho scelto (b) perché è l'unica in cui risultato, tabellino, pagella e statistiche escono **dallo stesso codice**
della partita intera, comprese le parti che vivono solo in `LiveMatch` (cronaca, schede del mister, sostituzione,
voto). Il costo è che il gioco fluido non sparisce del tutto: dura **6-9 s** (1.857-1.901 battiti in 160-166 lotti,
≈ 2,2 s di calcolo), e in quel tempo si vede il velo col minuto che corre.

## 4. Misure dopo

### 4.1 Stessa partita, due modalità (partita del guardiano)

| «Collaudo Salienti», seme 7300 | Intera | Soli highlight |
|---|---|---|
| Durata reale | 188,7 s | **43,0 s** |
| Gioco fluido | 149,6 s | **7,7 s** |
| Scene | 33,6 s (5) | 29,9 s (5) |
| Prepartita | 5,5 s | 5,4 s |
| Tempo reale per minuto di gioco fluido | 1.626 ms | **85 ms** |
| Voci del libro mastro | 288 | 288 — **288/288 identiche** |
| Risultato | 2-0 | 2-0 |
| Schermata finale (testo) | 1.625 car. | 1.625 car., **uguale** |
| Voce di `matchHistory` | 2-0, 1 gol, voto 7,3, 85' | **uguale** |
| Interviste post-partita chieste (`__CPM_IV231`) | 1 | 1 |

Tipi di voce confrontati: 106 `turn`, 79 `recita`, 79 `chronicle`, 7 `scena`, 5 `candidate`, 5 `fonte022`,
4 `esito`, 2 `goal`, 1 `fine`. Come nel giro 161, dal confronto sono esclusi solo `ts`/`t` (orologio da polso) e
`npd` (distanza letta da `matchPlayers`, non seedata).

Ripetizioni su questo nome: 3 partite intere e 2 a soli highlight, tutte identiche fra loro.

### 4.2 Durata reale di una partita a soli highlight

| Partita | Scene | Durata reale | Gioco fluido | Scene (tempo) |
|---|---|---|---|---|
| Collaudo Salienti (4 giri) | 5 | 43,0-43,7 s | 7,7-8,1 s | 29,9 s |
| Tobia Ferrante (3 giri) | 7 | 55,6-56,8 s | 6,2 s | ≈ 44 s |
| Marco Bellandi (3 giri) | 7-8 | 56,8-63,7 s | 6,2-9,1 s | ≈ 52 s |

Cioè **0,7-1,1 minuti**, contro 3,1-3,5 minuti della partita intera (188-211 s). La stima del giro 164 (≈ 0,8 min)
regge per le partite con 5 scene; con 7-8 scene si sale a circa un minuto. **Non misurato:** il telefono del PO,
i corpi 3D accesi (le sonde girano con `__CPM_GLB=false`), una persona che legge le scelte (il pilota sceglie in
0,3 s; una persona impiega di più, quindi le durate reali saranno più lunghe di queste).

### 4.3 ⚠️ La partita intera non è sempre riproducibile (variabilità di base, esisteva prima)

Per provare il «stesso seme → stessa partita» su altre partite ho ripetuto intera e soli highlight con altri due
nomi di giocatore (il seme della partita nasce da avversario + stagione + settimana + nome). Risultato:

| Nome | Partite intere (3) | Soli highlight (3) | Coppie identiche |
|---|---|---|---|
| Collaudo Salienti | 2-0 · 2-0 · 2-0 | 2-0 · 2-0 | tutte |
| Tobia Ferrante | 3-2 · 3-2 · **1-0** | 1-0 · 1-0 · 1-0 | intera n.3 = tutte le soli highlight; intere n.1 e n.2 uguali fra loro |
| Marco Bellandi | 1-1 · 3-0 · 0-0 | 2-1 · 0-0 · 2-0 | solo intera n.3 = soli highlight n.2 (316 voci, 0-0) |

Cioè: **la stessa partita intera, rigiocata identica, dà risultati diversi** («Marco»: tre partite, tre
risultati). I soli highlight non sono né meglio né peggio: variano allo stesso modo, e quando capitano sullo
stesso ramo della partita intera sono identici voce per voce (316/316 su «Marco», 280/280 su «Tobia»).

Dove nascono le differenze (misurato, non corretto):
1. **Al calcio d'inizio.** Su «Tobia» ho rigiocato 8 volte i primi 3 minuti della partita intera coi testimoni
   del motore (`__CPM_PASSI959`, `__CPM_RNDM959`, `__CPM_POS959`): 7 volte su 8 la variante «1-0», 1 su 8 la
   variante «3-2». Nei due rami i passi del motore al minuto 0 sono gli stessi (21), ma **l'impronta delle
   posizioni all'ingresso del 1' è diversa** (247145935 contro 1745412981): la partita parte da uno stato
   iniziale diverso. Su «Marco» lo stesso succede con una voce in più al minuto 0 (`turn`,
   `motore-calcio_inizio`) in 2 giri su 6.
2. **Attorno alle scene.** Su «Marco» i giri che partono uguali si separano al 13' e al 16'-17', dove ci sono
   scene. Le scene durano tempo reale in entrambe le modalità e il pilota automatico sceglie a orologio (ogni
   300 ms): non posso confermare se la causa sia il gioco o lo strumento.

Non posso confermare che i soli highlight non aggiungano variabilità propria: con 3+3 ripetizioni per nome il
campione non basta a separarla da quella di base. Quello che la misura dice è: nessuna differenza fra le due
modalità che non compaia anche fra due partite intere.

**Conseguenza per il guardiano:** confronta sulla partita «Collaudo Salienti» (stabile 5 giri su 5). Se un giorno
quella partita diventasse instabile, il controllo 10 andrebbe rosso senza colpa della modalità: è scritto qui
perché chi lo vede rosso sappia dove guardare (`CPM_G166_NOME` cambia partita, `CPM_G166_DUMP` salva le sequenze).

### 4.4 Quando c'è il bottone

| Caso (prompt vero, carriera) | Peso | Bottone |
|---|---|---|
| Professionista, campionato, senza posta | 1 | **c'è** |
| Coppa nazionale | — | non c'è |
| Campionato contro ex club e rivale | 5 | non c'è |
| Primavera (u18) | 1 | non c'è |
| Rosso `__CPM_NO_G166` | 1 | non c'è |

Dalla panchina il bottone non c'è (regola nel codice, r. 6989: solo `status==="starter"`): **non provato dal
vivo** — il gancio di collaudo non riesce a forzare la panchina, perché il prompt ricalcola la decisione del mister.

## 5. Guardiano `solo-highlight-166`

`cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium npm run solo-highlight-166` (≈ 6,5 minuti).
13 controlli: 2 statici, 4 sul prompt, 7 sulla partita (modalità attiva e velo · gioco fluido ≤ 400 ms reali per
minuto · fischio oltre il 90' con almeno una scena · libro mastro e risultato identici alla partita intera ·
schermata finale e voce di carriera identiche · intervista chiesta · durata sotto la metà dell'intera).
«Non giudicato» (pagina che non monta, partita non finita, zero scene, sonda assente) = rosso.

Esito (build del commit `8838681`):

```
VERDE: PASSA      (13/13 + errori di pagina 0)
ROSSO: CADE (come deve) su 3, 7 e 8
  ✗ 3 il bottone non c'è — bottoni ["Gioca la partita","Simula e avanza la settimana","Non ora"]
  ✗ 7 testimone {"chiesta":false,"attiva":false} · velo visto false
  ✗ 8 1646 ms/minuto (minuto raggiunto 20) · lotto null · intera 1626 ms/minuto
```

Nel braccio rosso il bottone non esiste, quindi la modalità si forza dal gancio di sonda (`__CPM_SOLO166`) e si
preme «Gioca»: la partita resta intera (1.646 ms per minuto). La partita rossa si ferma al 20' di gioco: basta a
misurare il passo.

## 6. Controlli

Controlli lanciati uno alla volta (`CPM_CI_PAR=0`), memoria libera 12,3-15,5 GB e disco libero 29 GB registrati ogni
minuto per tutta la catena. Build provata: commit `8838681` (`check-src`: IDENTICO BYTE PER BYTE, 7190384 byte).

**Stato: catena COMPLETA in corso** (98 passi in sequenza pura; aggiornato il 12/11 alle 02:10). Il contenitore si è
riavviato una volta alle 23:42 dell'11/11 durante `highlight-95`: la catena è ripartita come giro composto
(`CPM_CI_FATTI`, 8 passi già verdi sulla stessa build non rigiocati).

| Controllo | Esito | Numeri |
|---|---|---|
| `solo-highlight-166` (da solo, prima della catena) | ✅ verde · rosso cade su 3, 7, 8 | vedi §5 |
| `design-system` (da solo) | ✅ | «SISTEMA GRAFICO OK» |
| `test:logic` (da solo) | ✅ | 0 falliti, 2,7 s |
| `grafica-v2` | ❌ rosso 6 prove su 6 | «classifica: la tua riga non nel colore del club» su telefono, tablet e PC. Schermata che questo giro non tocca: **da confrontare con `main`** (non ancora fatto) |
| `simula-v2` | ✅ | 104 s |
| `momenti-v2` | ✅ | 470 s |
| `partita-v2` | ✅ | 573 s |
| `patrimonio-303` | ✅ | 202 s |
| `intro-292` | ✅ | 105 s |
| `tema-unico` | ✅ | 52 s |
| `carriera3-94` | ✅ | 217 s |
| `assist-298` | ✅ | 1.905 s |
| `highlight-95` (con `CPM_D3DIAG=1`) | ⚠️ instabile: rosso alla prima prova, verde alla seconda completa | prima prova: verde 101 highlight, D4 0, **1 difetto D3** (s1/2021 «Stacco in corsa potente», pallone a 6,3 dal portiere, soglia 6); il braccio rosso si vede (D4 7). Seconda prova (interrotta dal riavvio a 57 minuti) non vale. Terza prova: ✅ 5.165 s |
| `parata-100` | prima prova ❌ «non giudicato» | verde: 8 parate, tutte su tiro del compagno, 0 sul ramo `cross_goal`, 0 difetti. In riprova |
| gli altri 85 passi | in corso | — |
| `gol-eroe` | non esiste | nessun file né script con questo nome in `tests/visual` |


## 7. Foto (`docs/sviluppo/giro166/`)

Telefono 375 × 812 e PC 1366 × 768, `?cpmtest=1`, corpi 3D spenti (sono schermate di interfaccia, non gesti).

| | 375 px | PC |
|---|---|---|
| Prompt **prima** (rosso `__CPM_NO_G166`) | `375-prompt-prima.png` | `pc-prompt-prima.png` |
| Prompt **dopo** | `375-prompt-dopo.png` | `pc-prompt-dopo.png` |
| Velo durante il gioco fluido | `375-velo.png` | `pc-velo.png` |
| Una scena | `375-scena.png` | `pc-scena.png` |
| Esito di una scena | `375-esito.png` | `pc-esito.png` |
| Schermata finale | `375-finale.png` | `pc-finale.png` |
| Scheda del mister a tempo fermo, sopra il velo | `375-scelta-tempo-fermo.png` | — |

Nota: nelle foto del prompt l'avversario è «FC Valdenau» perché il gancio di collaudo `apriPartita` mette nel
prompt il primo club della lega; la partita che poi si gioca è quella vera della settimana (FC Ravelmund).

## 8. Cosa non ho verificato

- **Telefono del PO**: tutte le misure sono headless.
- **Corpi 3D accesi** durante i lotti: non misurato (le sonde girano a corpi spenti).
- **Audio**: in 6-9 s scorrono tutti gli eventi di 90 minuti. Non ho misurato quanti suoni partono né come suonano
  (sotto `?cpmtest=1` l'audio non è quello vero).
- **Ripresa dopo il background** (`s166` nell'istantanea): scritta, non provata dal vivo.
- **Partenza dalla panchina**: vedi §4.4.
- **Una persona al posto del pilota**: la scheda del mister ferma il tempo anche in questa modalità e si vede sopra
  il velo (foto), ma non ho giocato una partita intera a mano.
- `gol-eroe`: non esiste un guardiano con questo nome in `tests/visual` (cercato per nome di file e di script).

## 9. Domande per la sessione madre

1. **Variabilità di base (§4.3).** La partita intera, rigiocata identica, dà risultati diversi su 2 nomi su 3
   (stato iniziale diverso già al 1'; rami attorno alle scene). Va aperta una voce a parte? Tocca ogni guardiano
   che confronta due partite «uguali» (compreso `audio-161`).
2. **Gol dei compagni e degli avversari durante il velo.** Oggi cambiano il tabellone mentre il minuto corre e si
   ritrovano nel tabellino finale; non c'è una pausa né una riga dedicata. Serve fermarsi un attimo sul gol?
3. **Tasto della velocità (1× · 1,5× · 2×)** resta visibile sotto il velo ma in questa modalità non ha effetto sul
   gioco fluido. Lo nascondo?
4. **Dalla panchina** il bottone non compare. È la scelta giusta, o chi parte dalla panchina in una partita senza
   posta deve poterla giocare a soli highlight dal suo ingresso?
5. **Dove sta la scelta.** L'ho messa solo nel prompt della carriera. La scheda prepartita («Vedi le formazioni ·
   Salta e gioca») non ha il bottone: serve anche lì?
6. **Unione col giro 165.** `senzaPosta166` (src/18, r. 456) è il punto unico da sostituire con la regola di
   posta allargata; il testo della nota sotto il bottone dice «senza posta in palio».
7. **Nome a schermo.** Ho scritto «Gioca solo i momenti salienti» e, sul velo, «Momenti salienti · Si va al
   prossimo momento». Vanno bene questi testi?
