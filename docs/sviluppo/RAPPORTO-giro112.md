# Rapporto — giro 112b, lotto 7.999.182 · PO-314 «moduli veri»

Ramo `sviluppo/giro112b-moduli` (base `lavoro/182`). `GAME_VERSION` non toccata. Sessione figlia: nessuna decisione di
prodotto; le scelte prudenti sono scritte in fondo.

PO, 07/11: «Ma giocano tutti con il 4-3-3??» · «Ma anche nell'anteprima della partita è sempre 433».

## 1. Misura «prima» (codice 7.999.181, build di `lavoro/182`)

Sonda `tests/visual/moduli-112.mjs` con `CPM_PRIMA=1`: salvataggio di prova `fixtures/save-190-s12-ovr93.json`, club
dell'eroe e avversario della prossima giornata sostituiti da coppie di club veri di Lega A, percorso vero
«Gioca» → pre-partita → formazioni → «Salta l'ingresso». Su ogni coppia è stato acceso anche il gancio
`__CPM_FORCE_FORM538` con due moduli diversi (i 5 moduli coperti).

| formato | club (casa · ospiti) | moduli forzati col gancio | rosa | anteprima | campo 2D (x dei ventidue) |
|---|---|---|---|---|---|
| 360x800 | juve · inter | 4-3-3 · 4-4-2 | 4-3-3 · 4-3-3 | 4-3-3 · 4-3-3 | 4-3-3 · 4-3-3 |
| 1440x900 | juve · inter | 4-3-3 · 4-4-2 | 4-3-3 · 4-3-3 | 4-3-3 · 4-3-3 | 4-3-3 · 4-3-3 |
| 360x800 | milan · napoli | 4-4-2 · 3-5-2 | 4-3-3 · 4-3-3 | 4-3-3 · 4-3-3 | 4-3-3 · 4-3-3 |
| 360x800 | roma · lazio | 3-5-2 · 4-2-3-1 | 4-3-3 · 4-3-3 | 4-3-3 · 4-3-3 | 4-3-3 · 4-3-3 |
| 360x800 | ata · fio | 4-2-3-1 · 5-3-2 | 4-3-3 · 4-3-3 | 4-3-3 · 4-3-3 | 4-3-3 · 4-3-3 |
| 360x800 | tor · bol | 5-3-2 · 4-3-3 | 4-3-3 · 4-3-3 | 4-3-3 · 4-3-3 | 4-3-3 · 4-3-3 |

Confermata la misura della madre, con due cose in più:

- **10 club veri, 5 moduli forzati: sempre 4-3-3 in rosa, anteprima e campo.** Il gancio cambia solo la trama.
- **A 360 px la riga da 4 va a capo** (foto `docs/sviluppo/foto-giro112/prima-tel-x-x-anteprima.png`): 4 maglie con 84 px
  d'etichetta non entrano, e il 4-3-3 si leggeva 3-3-3-1. Era già così nella 181, e con i moduli veri le righe da 5 (5-3-2,
  3-5-2) sarebbero andate peggio.
- **La trama della squadra dell'eroe era 4-4-2, non 4-3-3** (lettura del codice, `_formFromRoster538` src/15): la regex dei
  reparti non riconosce «Centravanti» come attaccante e lo conta fra i centrocampisti (d4 · m4 · a2 → «4-4-2»).
- Il modulo «dichiarato» dell'avversario senza AI veniva dalla fascia di prestigio (`generateOpponentTactic`): p 40-59 →
  3-5-2, 60-79 → 4-2-3-1, 80-99 → 5-3-2; nel campo non valeva niente.

## 2. Cosa cambia

Un'unica fonte, `moduloClub(club)` (src/09): hash dell'identità del club (`id`, o il nome), stabile fra le stagioni,
nessun campo nel salvataggio. I dati dei club non hanno indizi di stile (`mkT` porta id, nome, sigla, prestigio, colori,
nazione, lega), quindi è hash puro. Le nazionali seguono la stessa regola sulla loro identità (`NAT_CLUB_DATA[...].id`),
le U18 hanno lo stesso id del club maggiore e quindi lo stesso modulo.

| Dove | Prima | Ora |
|---|---|---|
| `generateTeamRoster` (src/09) | ruoli 4-3-3 per tutti | i ruoli degli 11 titolari seguono il modulo, più il campo `ln` (linea); **nomi per indice di slot invariati**, slot 0 portiere, slot 10 sempre una punta (eroe o rivale), panchina invariata |
| `generateOpponentTactic` senza AI | modulo dalla fascia di prestigio | `moduloClub(avversario)`; con AI resta l'AI |
| anteprima (`rosterRows`, `_fmtOf`, src/13) | righe per nome del ruolo | righe per linea vera (il 4-2-3-1 ha quattro righe); l'etichetta delle maglie si stringe quanto serve perché la riga non vada a capo (mai sotto 58 px) |
| nascita dei ventidue (`matchPlayers`, src/15) | sagoma 4-3-3 fissa | `sagoma112(modulo,"mpH"/"mpA")`; **stessi 21 scarti `j()` nello stesso ordine**; reparto `rl` del motore dal modulo |
| preset di movimento (`DRIFT_PRESETS`) | 4-3-3 | `presetModulo112`: altezza e spostamento medio di ciascun reparto del preset, applicati alla sagoma del modulo (cache per preset, nessuna allocazione per tick); `DRIFT_PRESETS` resta la tabella, così chi cerca il preset attivo per identità continua a trovarlo |
| ospiti negli highlight (`FORMATION_AWAY`) | 4-3-3 | sagoma `hlA` del modulo |
| posti del motore del possesso (src/14) | `SLOT_H`/`SLOT_A` 4-3-3 | `cfg.slot` dalla partita (sagoma `motH`/`motA`), senza `cfg.slot` il 4-3-3 storico |
| trama (`_prof538`) | eroe: dedotta dai ruoli (4-4-2); avversario: tattica | lo stesso modulo del campo |
| tattica AI con modulo diverso dal club | — | il modulo dell'avversario diventa quello dichiarato: anteprima (`rosaConModulo112`), motore, preset e trama lo seguono |

Il 4-3-3 restituisce **esattamente** le tabelle storiche (nascita, motore, highlight, preset): un club 4-3-3 gioca come
prima. Interruttore rosso **`__CPM_NO_G112`** = comportamento 181 (tutti 4-3-3 in rosa, anteprima e campo; avversario per
prestigio; trama dedotta dai ruoli; etichette a 84 px).

## 3. Distribuzione dei moduli sui club (misurata su tutti i 252 club di `CLUBS`)

| modulo | club | quota |
|---|---|---|
| 4-4-2 | 59 | 23,4% |
| 3-5-2 | 56 | 22,2% |
| 4-3-3 | 53 | 21,0% |
| 4-2-3-1 | 42 | 16,7% |
| 5-3-2 | 42 | 16,7% |

Atteso con 5 moduli: 50,4 a testa. Nazionali (10 in `NAT_CLUB_DATA`): 4-2-3-1 5 · 3-5-2 2 · 5-3-2 2 · 4-3-3 1.

Per lega (è un hash per club, non un sorteggio per lega: alcune leghe sono sbilanciate e la Lega A non ha 5-3-2):

| Lega | 4-3-3 | 4-4-2 | 3-5-2 | 4-2-3-1 | 5-3-2 |
|---|---|---|---|---|---|
| Lega A | 7 | 3 | 4 | 4 | 0 |
| Premier Division | 4 | 5 | 2 | 4 | 3 |
| Liga Ibérica | 4 | 4 | 4 | 4 | 2 |
| Deutsche Liga | 3 | 9 | 2 | 1 | 3 |
| Ligue Nationale | 1 | 6 | 4 | 5 | 2 |
| Liga Lusitana | 4 | 3 | 4 | 4 | 3 |
| Liga Oranje | 8 | 2 | 4 | 1 | 3 |
| Liga Belga | 3 | 5 | 3 | 3 | 4 |
| Liga Anatolica | 3 | 2 | 7 | 1 | 5 |
| Lega B | 4 | 7 | 2 | 3 | 2 |
| Championship | 4 | 3 | 6 | 4 | 1 |
| Deutsche Liga 2 | 2 | 3 | 6 | 2 | 5 |
| Ligue Nationale 2 | 5 | 4 | 3 | 3 | 3 |
| Liga Ibérica 2 | 1 | 3 | 5 | 3 | 6 |

## 4. Misura «dopo» — guardiano `npm run moduli-112`

Per 10 club veri (Lega A e Lega B) che coprono i 5 moduli, casa e ospiti, su 360x800 (e la prima coppia anche 1440x900):
rosa (linee `ln`) = anteprima (maglie per riga nel DOM, nessuna riga a capo) = campo (posti di nascita del testimone
`__CPM_G112`, raggruppati per x; i ventidue misurati in `__CPM_MP` prima del fischio entro 4,6u dal loro posto) = preset
(tutti e 7) = posti del motore (`__CPM_MOTORE_OBJ()._slot`) = modulo del club. Verde col codice nuovo, rosso con
`__CPM_NO_G112`; braccio e motivo stampati per ultimi. Il guardiano prende i club **veri** della gara dal testimone: il
calendario sceglie l'avversario da sé (in Lega B la gara chiesta contro `par` è uscita contro `udi`).

| formato | casa (modulo) | ospiti (modulo) | rosa | anteprima | campo | motore | preset |
|---|---|---|---|---|---|---|---|
| 360x800 | inter 4-3-3 | juve 3-5-2 | 4-3-3 · 3-5-2 | 4-3-3 · 3-5-2 | 4-3-3 · 3-5-2 | 4-3-3 · 3-5-2 | — · 3-5-2 |
| 1440x900 | inter 4-3-3 | juve 3-5-2 | 4-3-3 · 3-5-2 | 4-3-3 · 3-5-2 | 4-3-3 · 3-5-2 | 4-3-3 · 3-5-2 | — · 3-5-2 |
| 360x800 | roma 4-4-2 | napoli 4-2-3-1 | 4-4-2 · 4-2-3-1 | idem | idem | idem | 7×4-4-2 · 4-2-3-1 |
| 360x800 | ven 5-3-2 | udi 4-3-3 | 5-3-2 · 4-3-3 | idem | idem | idem | 7×5-3-2 · — |
| 360x800 | milan 4-3-3 | lazio 4-2-3-1 | 4-3-3 · 4-2-3-1 | idem | idem | idem | — · 4-2-3-1 |
| 360x800 | ata 4-2-3-1 | fio 3-5-2 | 4-2-3-1 · 3-5-2 | idem | idem | idem | 7×4-2-3-1 · 3-5-2 |

Righe a capo: 0 su tutte le misure. Rosso: tutte le coppie tornano 4-3-3 · 4-3-3 in rosa, anteprima, campo e motore.
Due difetti veri trovati dal guardiano durante il lavoro e corretti: l'eroe nel 4-2-3-1 finiva nella riga dei trequartisti
(anteprima 4-2-4: lo slot 10 perdeva la linea quando ci si metteva l'eroe) e la riga da 5 andava a capo a 360 px.

Foto prima/dopo (anteprima e campo, telefono e PC, 3+ moduli): `docs/sviluppo/foto-giro112/`. I file `prima-…-<moduli>`
sono il braccio rosso (`__CPM_NO_G112` = comportamento 181) della stessa coppia; `prima-tel-x-x-*` e `prima-pc-x-x-*` sono la
build vera di `lavoro/182`.

## 5. Controlli (uno alla volta, `CPM_CI_PAR=0`; memoria e disco registrati prima di ognuno)

RISULTATI_CONTROLLI

## 6. Scelte prudenti e cose rimaste fuori

- **Hash puro sull'identità**, nessun bilanciamento per lega (una lega può non avere un modulo: la Lega A non ha 5-3-2).
  Bilanciare per lega vorrebbe dire far dipendere il modulo dalla composizione della lega: non è la regola chiesta.
- **L'eroe resta la punta centrale (slot 10, posto del motore 60,50) in tutti i moduli.** Nei moduli a due punte il compagno
  di reparto sta a y 36; non ho spostato il posto dell'eroe per non toccare la sua cinematica.
- **I preset 4-3-3 restano quelli storici**, che non sono tutti linee 4-3-3 pure (`retreat` è 3-3-3 per x, `opp_goal` ha la
  difesa più alta del centrocampo): il guardiano controlla i preset solo per i moduli nuovi.
- **`simulaPartitaMotore` (sim rapida, src/14) non è toccata**: non disegna niente e cambierebbe i risultati delle partite
  simulate. Resta 4-3-3.
- **Con tattica AI diversa dal modulo del club** la nascita dei ventidue (prima del fischio) resta nel modulo del club; dal
  calcio d'inizio motore, preset, trama e anteprima seguono l'AI. Senza chiave AI (tutti i test) la questione non si pone.
- `FORMATION_AWAY` usava `idx-11` per gli ospiti (difensore 1 mandato sul posto del portiere): nel 4-3-3 l'ho lasciato com'è
  (comportamento storico), nei moduli nuovi l'indice è quello giusto (`idx-10`).
- La riga dell'anteprima a 360 px andava a capo già nella 181: corretta qui perché il guardiano la conta (è una linea del
  modulo), con lo stesso interruttore rosso.
- Sonda `partita2d-297`: il lampo del gol ora si misura a partita in pausa. Col modulo vero del club di prova un highlight
  partiva dentro la finestra di 2,2 s (fase `hl_intro` misurata), il campo 2D smetteva di disegnare e `spento` non arrivava
  mai; la base `lavoro/182` passava perché lì l'highlight non cadeva in quella finestra. Nessuna soglia cambiata, il rosso
  resta visibile.
