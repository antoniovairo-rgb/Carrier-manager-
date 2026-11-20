# Rapporto giro 294 — pre-partita → Formazioni → ingresso in campo

Ramo `sviluppo/giro294-ingresso`, partito da `lavoro/198` (7.999.198). `GAME_VERSION` non toccata.
Voci del PO: **PO-556** (pallone ai piedi dell'eroe all'ingresso), **PO-567** (niente tasto audio all'ingresso; riquadro 3D nero),
**PO-566** (dalle Formazioni non si torna indietro). Interruttore rosso unico: `window.__CPM_NO_G294`.
Guardiano nuovo: `npm run ingresso-294` (tre bracci, ognuno verde col verde e rosso col rosso).

## In breve

| Voce | Esito | Nota |
|---|---|---|
| PO-556 pallone | **Non riprodotto sul banco.** Messa una regola di scena e un guardiano che la prova con una provocazione | vedi «Dubbi» n. 1 |
| PO-567 tasto audio | **Fatto**: stesso tasto e stesso pannello della partita, anche in premiazione/parata | la presentazione di inizio stagione resta fuori, vedi «Dubbi» n. 3 |
| PO-567 riquadro nero | **Non riprodotto sul banco**, scena non cambiata | numeri in fondo e «Dubbi» n. 2 |
| PO-566 Indietro | **Fatto**: tasto in testata + Esc; partita identica dopo il rientro (misurato) | il tasto indietro del browser non è usato dal gioco: non aggiunto |

## Tabella «196 / 198 rapida prima / dopo»

«Letto dal codice» = costanti lette dal sorgente di quel commit, **non** misurate in esecuzione. «Misurato» = sonda `misura-294.mjs`
o guardiano `ingresso-294.mjs` su questo ramo (banco, grafica software, corpi veri accesi dove serve).

| Grandezza | 7.999.196 (3076a1b7) | 7.999.197 (69f16315) | 198 rapida, prima | dopo (questo ramo) |
|---|---|---|---|---|
| Dove sta il pallone durante l'ingresso | non misurato | non misurato | **misurato**: fermo sul dischetto di centrocampo (50,50), a terra, per tutti i 124-125 campioni dell'ingresso intero e i 7 dell'ingresso saltato | fermo sul dischetto per regola di scena (0 fotogrammi fuori su 143, anche provocato) |
| Chi lo mette lì | — | — | nessuno «lo mette»: è il punto logico iniziale della partita (`ballPos` 50,50); nessuno scrittore del pallone guarda la fase d'ingresso | la scena d'ingresso, a valle di tutti gli scrittori (`src/12`, ramo `isWalk`) |
| File schierate (x) | letto dal codice: casa −15, ospiti −7; uscita dal tunnel a x −23,6 / −20,4 | letto dal codice: casa −4, ospiti +4; uscita a x ∓1,3 (giri 245 + 255) | come la 197 | invariato |
| Distanza minima eroe ↔ pallone lungo la camminata | calcolato dalle costanti: ~16,6 u | calcolato: 3,41 u | **misurato**: 3,41 u (soglia della «colla» dell'eroe: 3,2 u → margine 0,21 u) | misurato senza provocazione: 3,41 u (la regola non sposta i corpi) |
| Colla dell'eroe scattata nell'ingresso | non misurato | non misurato | **misurato**: 0 fotogrammi su 322; la velocità che la colla legge (`_hvx`) vale 0 per tutto l'ingresso | invariato |
| Pallone logico spostato sui piedi dell'eroe (provocazione della sonda) | — | — | braccio rosso: il pallone lascia il dischetto in 148 fotogrammi su 148 e arriva a **0,06 u** dall'eroe | braccio verde: 0 fotogrammi fuori dal dischetto su 143, corpo più vicino a 14,55 u |
| Tasto audio nell'ingresso | assente (letto dal codice: solo le 5 fasi di gioco) | assente (idem) | **misurato**: assente (braccio rosso) | presente; apre il pannello; «Silenzia tutto» cambia AudioMgr e `cpm-audio`; l'icona diventa 🔇 e resta 🔇 in partita |
| Tasto audio in premiazione/parata (fase `ceremony`) | assente (codice) | assente (codice) | **misurato**: assente | presente |
| Tasto Indietro nelle Formazioni | assente (codice) | assente (codice) | **misurato**: assente | presente a 412×915, 375×667 e 1366×768 (81×44 px, in testata) |
| Esc nelle Formazioni | — | — | riportava direttamente alla home (scorciatoia globale della carriera) | un passo indietro: pre-partita |

### Risposta alla domanda «nato nella 198 rapida o prima?» (PO-556)

Non posso confermarlo: il difetto non si è riprodotto, quindi non c'è un «prima» e un «dopo» da confrontare in esecuzione.
Quello che è verificabile dal codice:

- i giri della 198 rapida (285 nastro, 286 portatore fermo, 291 intercetto) **non toccano** né la fase d'ingresso né gli scrittori del
  pallone fuori dagli highlight (`git diff 69f16315 HEAD -- src/12-three-match-view.jsx`: sei blocchi, tutti dentro highlight o stadio);
- l'unico cambiamento che avvicina i corpi al pallone durante l'ingresso è **della 197** (giri 245 + 255: tunnel a metà campo e file a
  cavallo del centrocampo): l'eroe passa a 3,41 u dal pallone invece di ~16,6 u.

Le versioni 196 e 197 **non** sono state eseguite (solo lette): il tempo del giro è andato nella ricerca del difetto sulla 198.

## Cosa è cambiato

### PO-556 — pallone all'ingresso (`src/12-three-match-view.jsx`)
- **Regola di scena**: per tutta la fase `walkout` il pallone sta fermo sul dischetto di centrocampo, a terra (x 0, z 0, y 0,22), scritto
  **dopo** tutti gli altri scrittori; un eventuale arco in volo viene spento. Decisione di scena presa qui: **centrocampo** (è dove il
  pallone già stava; l'arbitro non lo porta — vedi «Dubbi» n. 4).
- Testimone di sola lettura `__CPM_PAL294W` (solo banco): pallone e corpo più vicino per fotogramma, dopo la regola.
- Aggancio di sola prova `__CPM_PALLA294(x,y)` in `src/15` (sposta il pallone logico: serve al braccio rosso).

### PO-567 — tasto audio (`src/15-live-match.jsx`)
- L'altoparlante della barra (giro 172) ora compare anche nelle fasi `walkout` e `ceremony`. Stesso tasto, stesso pannello, stesso stato
  (`AudioMgr` → `cpm-audio`): nessun secondo salvataggio.

### PO-566 — Indietro (`src/13-prepartita-formazioni.jsx`, `src/15-live-match.jsx`)
- Tasto «← Indietro» nella testata delle Formazioni (in fondo, su telefono, tre pulsanti in riga non ci stanno): riporta al pre-partita.
- Esc nelle Formazioni fa lo stesso. Prima lo stesso tasto riportava alla home (gestore globale della carriera): ora si ferma al
  pre-partita. Nel pre-partita Esc continua a riportare alla home, come prima.
- Rientrando, la tattica avversaria **non** viene rigenerata (con un'AI configurata la risposta potrebbe cambiare): vale quella già caricata.

## Guardiano `npm run ingresso-294`

| Braccio | Verde (misurato) | Rosso `__CPM_NO_G294` (misurato) |
|---|---|---|
| A · pallone (corpi veri, provocazione: pallone logico sui piedi dell'eroe, 72-75 volte) | 143 fotogrammi, 0 fuori dal dischetto, corpo più vicino 14,55 u, eroe mosso di 21,5 u | 148 fotogrammi su 148 fuori dal dischetto, pallone a 0,06 u dall'eroe |
| B · audio (1366×768) | tasto presente, pannello aperto, muto: AudioMgr falso→vero e `cpm-audio` vero, icona 🔇 nell'ingresso e in partita, tasto presente in cerimonia | tasto assente nell'ingresso e in cerimonia |
| C · Indietro (412×915 con partita; 375×667; 1366×768) | Indietro → pre-partita; Esc → pre-partita; rientro riuscito; formazioni, numero di highlight e stato salvato uguali; **cronaca fino al primo highlight identica** a una partita aperta senza tornare indietro (16 eventi su 16, minuto 7, stesso tabellino) | tasto assente |

«Non giudicato» è rosso in tutti e tre i bracci (ingresso o Formazioni non raggiunti, meno di 30 fotogrammi, meno di 5 provocazioni,
eroe fermo, meno di 3 eventi di cronaca). Nessuna soglia abbassata.

Limite dichiarato del braccio A: il verde dimostra che la regola tiene contro **uno** scrittore (l'inseguitore del punto logico); non
dimostra quale scrittore abbia prodotto quello che ha visto il PO.

## Riquadro 3D nero all'apertura (PO-567) — solo misura, scena non toccata

Sonda `tests/visual/nero-294.mjs` (corpi veri, attesa vera `__CPM_WALKTEST74`): dal clic su «Ingresso in campo», luminanza media del
riquadro 3D; «nero» = sotto 12/255.

| Schermo | Prima lettura dopo il clic | Luminanza alla prima lettura | Letture nere | Velo «Si accendono i riflettori» visto |
|---|---|---|---|---|
| PC 1366×768 | 2,47 s | 99,8 | 0 su 3 | no |
| PC 1920×1080 | 2,67 s | 99,4 | 0 su 3 | no |
| Telefono 375×667 | 2,28 s | 99,8 | 0 su 3 | no |

Limiti della misura, da leggere prima dei numeri:
- sul banco ogni fotografia del riquadro costa 8-19 s: **tre letture in tutto** per schermo. Un nero più corto di quell'intervallo non si vede;
- nei primi 2,3-2,7 s dopo il clic la pagina non risponde (montaggio della scena): **quel tratto non è misurato**;
- è la grafica software del banco, non il PC del PO con l'app installata.

Quindi: **non posso confermare né escludere** un tempo di nero sul PC del PO.

## Controlli eseguiti (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`)

| Controllo | Esito |
|---|---|
| `node tools/build-src.mjs` + `node tools/check-src.mjs` | ricomposto; l'unica differenza segnalata è rispetto all'ultimo commit (poi committata) |
| `ingresso-294` braccio A, B, C eseguiti separatamente (`CPM_SOLO`) | verdi, rossi visibili (numeri sopra) |
| `ingresso-294` intero | vedi riga in fondo al rapporto |
| `test:logic` | verde |
| `save-compat` | verde |
| `prepartita-287` | verde, rosso visibile |
| `avviso-290` | verde, rosso visibile |
| `pc-289` | verde |
| `audio-172` | **non concluso**: fermato dal mio tetto di tempo a 185 s e poi a 420 s (costruisce anche il sito); nessuna riga di esito |
| `griglia-mobile` | **non concluso**: fermato a 185 s mentre stampava righe senza difetti; nessun verdetto finale |
| `ingresso-camminata-245`, `tunnel-285`, `render-3d-023` | **non eseguiti** (tempo) |
| Guardiani della MAPPA di `src/12`, `src/13`, `src/15` (decine: `portiere-265`, `tunnel-245`, `validate-situations`, `partita-vera`, `battito-264`, `solo-highlight-166`, …) | **non eseguiti** (tempo): solo `prepartita-287` |

Le foto di altri giri rigenerate da `griglia-mobile` (`docs/collaudo-grafico/`) e da `audio-172` (`docs/sviluppo/giro172/foto/`) sono
state rimesse con `git restore`.

**Conseguenza**: questo ramo **non è pronto per l'unione** finché non girano almeno i guardiani della MAPPA di `src/12` e `src/15`
e non si chiudono `audio-172` e `griglia-mobile`.

## Dubbi per il PO

1. **PO-556 non riprodotto.** Sul banco, con l'eroe attaccante in trasferta, il pallone resta sul dischetto per tutto l'ingresso (intero e
   saltato) e l'eroe non gli passa mai a meno di 3,41 u. La regola messa (pallone fermo sul dischetto durante l'ingresso) copre **la sola
   fase d'ingresso**. Se quello che hai visto è successo **subito dopo** — le squadre che dalla fila vanno a prendere posizione, prima
   del fischio — questa correzione non lo tocca: lì il banco non mi ha dato fotogrammi misurabili. Servirebbe sapere: era durante la
   camminata dal tunnel, in fila, o mentre le squadre si disponevano? Avevi premuto «Salta ingresso»? Telefono o PC? Era la prima partita
   della sessione o ne avevi già giocate altre senza chiudere l'app?
2. **Riquadro nero (foto da PC).** Non riprodotto e misura grossolana (tabella sopra). Nella tua foto non c'è il velo «Si accendono i
   riflettori» ma c'è «Salta ingresso»: quanto è durato il nero, e poi l'ingresso è comparso o hai dovuto saltare?
3. **Presentazione di inizio stagione** (serata fuori dalla partita, `src/18`): non ha la barra della partita e quindi non ha il tasto
   audio. Non l'ho toccata: vuoi il tasto anche lì?
4. **Dove sta il pallone all'ingresso.** Ho lasciato il dischetto di centrocampo (dove già stava). L'alternativa «lo porta l'arbitro» è
   una scena nuova: non l'ho decisa io.
5. **Esc nelle Formazioni** ora torna al pre-partita invece che alla home. Il tasto indietro del browser non è usato in nessun punto del
   gioco: non l'ho aggiunto.
6. **Tasto audio nell'ingresso**: come in partita, aprire il pannello mette in pausa; l'area visibile del tasto è 23×34 px, la stessa
   del tasto in partita (non l'ho ingrandita).
