# Collaudo 184 — altezza delle schermate, video iniziale, provini, creazione

Richieste PO 07/11: «Sfrutta tutta l'altezza nelle schermate!» (foto del pre-partita al telefono,
`origin/poc/marioprada-character-system:docs/collaudo-po/183-prepartita-altezza-merseyside.jpg`: sotto «Torna alla home» restano
~270 px vuoti) e «Sistemiamo anche il video iniziale, la gestione dei provini, il wizard».
Base: `lavoro/184` = `main` = 7.999.183. **Codice del gioco non modificato** su questo ramo (`collaudo/184-altezza-flussi`).
Sessione figlia: le correzioni sono **proposte**, le decisioni restano al PO. Contesto: uscita su Play Store fra 2-3 giorni.

## Tabella riassuntiva

Gravità: **alto** = blocca l'uscita store o rompe il flusso · **medio** = visibile e brutto · **basso** = rifinitura.
Nessun rilievo è risultato **alto**: niente blocca l'uscita; i medi più visibili sono G184-01…04 (le schermate della foto del PO) e
G184-20 (il terzo provino che non si vede).

| ID | area | gravità | misura | proposta (file:riga probabile) |
|---|---|---|---|---|
| G184-01 | A · pre-partita | medio | vuoto sotto «Torna alla home»: **310 px = 33,9%** a 412 · 177 px = 22,1% a 360 · 308 px = 34,2% a PC (è la foto del PO) | regola «schermata piena» (sotto): carta partita + consiglio del mister crescono, azioni ancorate in basso — `src/13-prepartita-formazioni.jsx` r.570-646 (`MatchdayCard`) |
| G184-02 | A · provini (pre e post) | medio | post-provino **43% / 50% / 51%** (360/412/PC); pre provino 2 e 3 **46% / 53% / 54%**; pre provino 1 13% / 26% / 33% | stessa regola; il tasto «Inizia il provino» / «Vai al Provino N» in basso — `src/17-menu-creazione-pannelli.jsx` r.667-696 (post), r.697-735 (pre) |
| G184-03 | A · offerte dei club | medio | **62% / 67% / 75%** vuoto (2 offerte in alto, il resto nero) | carte delle offerte più alte (stemma, prestigio, durata) distribuite sull'altezza — `src/17` r.546-610 (`OffersScreen`) |
| G184-04 | A · menu iniziale | medio | **32% / 44% / 47%** fra «Crediti» e la barra | blocco marchio + «Nuova carriera» centrato verticalmente nell'area utile, o slot salvataggi a tutta altezza — `src/17` r.222 (`HomeScreen`) |
| G184-05 | A · Opzioni | medio | **43% / 50% / 49%** sotto «Le impostazioni si salvano…» | contenuto breve: centrarlo o dare respiro ai cursori (righe più alte, ≥44 px) — `src/19-app-root.jsx` r.~598-630 (`SettingsScreen`) |
| G184-06 | A · finestre della settimana e della partita | medio | finestra centrata: sotto la carta **23-28%** (360), **28-31%** (412), 29-32% (PC), e altrettanto sopra | sul telefono foglio ancorato in basso (azioni sotto il pollice), centrata solo da 900 px — `src/18-career-app.jsx` r.~6890-6930 |
| G184-07 | A · momenti e feste | basso | «Telefonata del CT» 22% / 27% / 31%; festa della Nazionale 30% / 32% / 32% | per le feste il vuoto è scenografia: tenerlo; per il «momento» ancorare l'azione in basso |
| G184-08 | A · Coppe (vuota), passaggio pro (PC) | basso | Coppe 19,7% a 412; passaggio ai professionisti 32,9% a PC | stessa regola, priorità bassa |
| G184-10 | B · intro · micro-tutorial | medio | le tre istruzioni del live match restano a schermo **1,3 s · 0,75 s · 0,2 s** (comparsa a 0,3/0,85/1,4 s dentro una battuta di 2,1 s, t=6,3→8,4); la foto a t=7,6 mostra solo due delle tre | battuta di ~5 s, o un'istruzione per battuta — `src/19` r.226-234 (`CAPS`) e r.585 (ritardi) |
| G184-11 | B · intro · leggibilità | medio | chiusura a 360: «Dalla Primavera al Trofeo d'Oro.» **2,50:1** e «Tre provini ti separano…» **2,02:1** sopra una bandiera bianca dello stadio (soglia 3:1; ombra non contata); «d'Oro.» va a capo da sola | velo scuro dietro le didascalie (gradiente in alto) o didascalie in una fascia — `src/19` r.579-583 |
| G184-12 | B · intro · tasto Salta | medio | **77x33 px** (sotto i 44 px), corpo 12 px, `top:14` senza `safe-area-inset-top` | ≥44 px di altezza, area di tocco `cpm-t40`, `top: calc(14px + env(safe-area-inset-top))` — `src/19` r.591 |
| G184-13 | B · intro · audio | medio | **nessun suono**: il componente non chiama mai `AudioMgr` (verificato nel sorgente, r.221-591) — 30 s di trailer muto, gol compreso | stacco musicale + boato al gol, rispettando il «muto totale» delle Opzioni |
| G184-14 | B · intro · fluidità | da verificare sul telefono | headless (rendering software): 17-21 fps a 360/412, **7,5 fps a 1440x900**; 3-7 blocchi lunghi per giro, il più lungo **769 ms** alla prima apertura (poi 420-500 ms); apertura 0,3-1,5 s | gli fps headless non sono il telefono (lezione 7.475/PO-237): collaudo sul dispositivo; se scatta, precaricare il GLB prima del tasto |
| G184-15 | B · intro · finale | basso | la CTA «🎬 Comincia dal provino →» appare a 16,3 s e resta **13 s** prima della chiusura automatica (29,4 s); riaperta da Home o carriera dice ancora «Comincia dal provino» ma chiude e basta | etichetta «Chiudi» quando è un riascolto; chiudere 3-4 s dopo la CTA |
| G184-16 | B · intro · PC | basso | a 1440x900 le didascalie restano al corpo del telefono (17 px) in un quadro largo 1440 | corpo delle didascalie in `clamp()` sulla larghezza |
| G184-17 | B · intro · coerenza | basso | l'eroe dell'intro è sempre «Giovanni Pisano. Numero 9.»; al primo avvio l'intro arriva **dopo** la creazione, quando il giocatore ha già un nome | decisione PO 7.37 (eroe con un nome): proporre il nome del giocatore quando esiste — `src/19` r.226 |
| G184-20 | C · provini · terzo provino | medio | dopo il terzo provino la schermata dei risultati resta **300 ms** (`setTimeout(()=>onComplete(nr),300)`) e il tasto «⏳ Calcolo delle offerte…» non fa nulla (`onClick={()=>{}}`): il voto del provino decisivo non si vede mai (dal sorgente; il terzo provino non è stato giocato dalla sonda) | mostrare il riepilogo dei tre provini e far partire le offerte dal tasto — `src/17` r.641 e r.695 |
| G184-21 | C · provini · contrasto | medio | numero del passo nel cerchio «1 / 2 / 3» bianco su ambra **1,67:1** (soglia 4,5), in tutti i formati | cifra scura su ambra, o cerchio scuro con bordo ambra — `src/17` r.701 |
| G184-22 | C · provini · ritmo del primo provino | medio | **42 s** di gioco fluido dal calcio d'inizio alla prima scelta (misurato sotto `?cpmtest=1`, i tre formati: 24,7→66,8 s); al 2' compare la carta del mister «🟥 Siamo rimasti in dieci al 2'» (seme fisso 4242: la frequenza reale **non posso confermarla**) | primo highlight entro ~10 s nel provino 1; niente espulsione come primo evento del primo provino — `src/14-motore-possesso.jsx` r.135, selezione HL in `src/15` |
| G184-23 | C · provini · fine partita | basso | a 360 i nomi delle squadre troncati: «SELEZIONE GRANA…», «POLISPORTIVA …» | sigla o due righe sul telefono |
| G184-24 | C · provini · coerenza V2 | basso | la squadra dei provini è granata #7a1f2b (r.614, r.704); il cartellino «🎯 PROVINO 1/3» in partita ha il bordo **#bfdbfe** cablato (azzurro chiaro della V1) su `TH.bgBlue` | tinte del tema unico (`TINTE`/`TH`) — `src/17` r.665 |
| G184-25 | C · arrivo in carriera | medio | tutorial «Benvenuto»: tasto **«Salta» 38x34 px** a 360 e 412; «Avanti →» in granata #8e1f33 (resto V1, cfr. G180-22) | `cpm-t40` sul «Salta» — `src/17` r.1968 (`TutorialOverlay`) |
| G184-26 | C · ripresa dopo chiusura | nessuno | ricaricando la pagina dopo il provino 1 il gioco riapre **«Il provino · Passo 2 di 3»** con l'avversario salvato (ripresa spenta sotto `?cpmtest=1`, misurata senza) | — |
| G184-30 | D · creazione · nome | medio | il campo nome ha `maxLength=22` e **tronca in silenzio**: «Massimiliano Bartolomucci» (25) diventa «Massimiliano Bartolomu», la figurina dice «BARTOLOMU» | contatore «22/22» o limite più alto con il cognome che va a capo — `src/17` r.464 |
| G184-31 | D · creazione · Invio | medio | **Invio nel campo nome avvia subito i provini** (`onKeyDown={e=>e.key==="Enter"&&go()}`): 460 ms dopo si è al provino, senza aver visto nazionalità, club dei sogni e sfida; sul telefono è il tasto «Vai» della tastiera | Invio porta il fuoco al campo successivo; `enterKeyHint="next"` — `src/17` r.464 |
| G184-32 | D · creazione · telefono | basso | a 360 la pagina è alta 1157 px: campo nome a y=732-779 (al bordo della prima vista), «INIZIA I PROVINI» a y=1102; con la tastiera simulata (vista 500 px) né campo né tasto sono in vista — headless **non** scorre al campo come fa il telefono, quindi da verificare sul dispositivo | campo nome sopra la griglia degli aspetti, o `scrollIntoView` al fuoco |
| G184-33 | D · «wizard» | da chiarire | la Creazione **non è a passi**: una pagina sola, nessun Avanti/Indietro (solo «← Home» in alto); il «wizard» del gioco è quello d'apertura stagione (ritiro, raduno, presidente, maglia — 7.491), **non coperto** qui | chiedere al PO quale dei due intendeva |
| G184-34 | tocco · Opzioni | medio | chiusura **✕ 34x34** sul telefono (la regola dei 44 px vale solo da 640 px: `_tocco292`, `src/15` r.37); interruttori 42x24 | 44 px anche sotto i 640 px — `src/19` r.~605 |
| G184-35 | tocco · pre-partita, calendario | basso | «Analisi dell'avversario», «Salta e gioca», «Torna alla home» e «Gioca ›» (calendario) alti **40 px** | 44 px, o `cpm-t40` — `src/13` r.646 e dintorni |

**Foto per rilievo** (in `foto/`): G184-01 `prepartita-360/412/pc-rosso` · G184-02 `provino-pre-1-360/412-prov`, `provino-pre-3-412-prov`,
`provino-post-1-360/412-prov` · G184-03 `offerte-360/412/pc-prov` · G184-04 `menu-412-rosso` · G184-05 `menu-opzioni-360/412-rosso` ·
G184-06 `settimana-vissuta-412-rosso`, `partita-titolare-412-rosso` · G184-07 `auto-la-telefonata-del-ct-412-rosso`,
`festa-nazionale-412-rosso` · G184-08 `stagione-coppe-412-rosso`, `sch-proTransition-pc-rosso` · G184-10 `intro-360-t7_6`,
`intro-412-t7_6` · G184-11 `intro-360-t17_4`, `intro-360-t26` · G184-12 `intro-360-t1_2` (in alto a destra) · G184-15 `intro-360-t26` ·
G184-16 `intro-pc-t4_8`, `intro-pc-t17_4` · G184-17 `intro-360-t4_8` · G184-21 `provino-pre-1-412-prov` · G184-22
`partita-in-gioco-360-prov` · G184-23 `partita-x-ended-360-prov` · G184-24 `partita-x-hl_choose-360-prov`, `provino-pre-1-360-prov` ·
G184-25 `carriera-arrivo-360-prov` · G184-30 `creazione-nome-360-prov` · G184-32 `creazione-vuota-360-prov` · G184-34
`menu-opzioni-360-rosso` · G184-35 `prepartita-360-rosso`. Senza foto: G184-13 (audio), G184-14 (tempi), G184-20 (dal sorgente),
G184-26, G184-31, G184-33.

## Come è stato misurato

- **Formati**: 360x800 e 412x915 con tocco (`isMobile`, `hasTouch`), 1440x900 col mouse. Club **FC Merseyside** (il caso della foto),
  giocatore **Massimiliano Bartolomucci** (25 caratteri). Banco di carriera del collaudo 180 (stagione 12, Premier Division, calendario
  generato dalla funzione vera del gioco). GLB spento per le schermate, **acceso** per l'intro.
- **Sonde** (solo lettura, nel ramo): `tests/visual/c184-altezza.mjs` (schermate, finestre, partita), `c184-provini.mjs` (percorso
  creazione → provini → offerte → carriera, con linea del tempo), `c184-intro.mjs` (intro: tempi, memoria, foto), `c184-lib.mjs`
  (misura dell'altezza), `c184-sintesi.py` (tabella). Riusano `c180-lib.mjs`: **contrasto sui pixel** (fondo = mediana dei pixel della
  riga nello screenshot, soglia WCAG 4,5:1 o 3:1 per corpo grande; l'ombra del testo non è contata) e **area di tocco effettiva**
  (rettangolo ∪ `::after`, `EXTRA108`). Dati grezzi in `docs/collaudo-grafico/184/dati/`, foto in `foto/` (128 colori; il PC dimezzato).
- **Altezza vuota** (`ALTEZZA()` in `c184-lib.mjs`): radice = la finestra fissa più alta che copre ≥60% della vista, altrimenti la
  pagina; si toglie la **barra di navigazione** (fissa in basso, ≥3 tasti); **contenuto** = elementi visibili con testo proprio, tasti,
  campi, immagini, svg, tele, o carte con fondo/bordo pieno più basse dell'85% dell'area; **vuoto** = top della barra − fondo
  dell'ultimo contenuto; **scorre** = c'è contenuto oltre il bordo utile (un padding di fondo non conta: la prima stesura della sonda
  dichiarava «scorre» la scheda Coppe per i 80 px di padding di `.cpm-scroll`, corretta). Classi: >25% medio, 12-25% basso.
- **Tempi**: la partita del provino è stata accorciata (`__CPM_SALTA297(88)` dopo il primo highlight), quindi i suoi minuti **non** sono
  quelli reali; quelli delle schermate sì. L'intro è aperta col **tasto vero «🎬 Rivedi intro»** della home (89x56 px), tre giri per
  formato; memoria dal CDP dopo GC.

## A — Altezza

### Censimento (vuoto sotto l'ultimo contenuto, pagina che non scorre)

| schermata | 360x800 | 412x915 | 1440x900 | foto |
|---|---|---|---|---|
| **Pre-partita** | 177 px · 22,1% (basso) | **310 px · 33,9% (medio)** | 308 px · 34,2% (medio) | `prepartita-360/412/pc-rosso.png` |
| Analisi dell'avversario | 28 px · 3,5% | 28 px · 3,1% | 20 px · 2,2% | `analisi-avversario-412-rosso.png` |
| Formazioni | 18 px · 2,3% | 29 px · 3,2% | 20 px · 2,2% | — |
| Post-partita | scorre | scorre | scorre | — |
| Menu iniziale | 232 px · 32,1% (medio) | 364 px · 43,8% (medio) | 423 px · 47% (medio) | `menu-412-rosso.png` |
| Opzioni | 344 px · 43% (medio) | 459 px · 50,2% (medio) | 444 px · 49,3% (medio) | `menu-opzioni-360/412-rosso.png` |
| Crediti | scorre | scorre | scorre | — |
| Creazione | scorre | scorre | 0 px | `creazione-vuota-360/pc-prov.png` |
| Provino 1 (pre) | 107 px · 13,4% (basso) | 242 px · 26,4% (medio) | 294 px · 32,7% (medio) | `provino-pre-1-360/412-prov.png` |
| Provino 2 e 3 (pre) | 370 px · 46,3% (medio) | 485 px · 53% (medio) | 484 px · 53,8% (medio) | `provino-pre-3-412-prov.png` |
| Provino (post) | 344 px · 43% (medio) | 459 px · 50,2% (medio) | 455 px · 50,6% (medio) | `provino-post-1-360/412-prov.png` |
| Fine partita del provino | scorre | scorre | scorre | `partita-x-ended-360-prov.png` |
| **Offerte** | 497 px · 62,1% (medio) | 612 px · 66,9% (medio) | 679 px · 75,4% (medio) | `offerte-360/412/pc-prov.png` |
| Tutorial d'arrivo in carriera | 101 px · 12,6% (basso) | 101 px · 11% | 101 px · 11,2% | `carriera-arrivo-360-prov.png` |
| Home e schede di carriera (Classifica, Calendario, Club, Profilo, Nazionale, Agente, Ufficio) | scorre | scorre | scorre | — |
| Stagione · Coppe (nessuna coppa) | 30 px · 4,3% | 157 px · 19,7% (basso) | 18 px · 2% | `stagione-coppe-412-rosso.png` |
| Settimana · impulso / spogliatoio / vissuta | 23,4 / 27,3 / 28,3% | 27,8 / 31,3 / 31% | 28,7 / 31 / 31,9% | `settimana-vissuta-412-rosso.png` |
| Settimana · partita (titolare e panchina) | 204 px · 25,5% | 272 px · 29,7% | 265 px · 29,4% | `partita-titolare-412-rosso.png` |
| Momento «Telefonata del CT» | 180 px · 22,5% | 250 px · 27,3% | 279 px · 31% | `auto-la-telefonata-del-ct-412-rosso.png` |
| Festa della Nazionale | 240 px · 30% | 297 px · 32,5% | 290 px · 32,2% | `festa-nazionale-412-rosso.png` |
| Offerta di mercato | scorre | scorre | scorre | — |
| Passaggio ai professionisti | scorre | scorre | 296 px · 32,9% (medio) | `sch-proTransition-pc-rosso.png` |

**Non misurabili con questo metro (dichiarato):** presentazione del club, galà, saga del capitano, premi di stagione e intervista
sono scene a tutto schermo con la tela 3D/illustrata (il fondo è la scena, «vuoto» 0 per costruzione); **«presentazione del
procuratore» e «notifica»** riaprivano la schermata precedente (intervista, presentazione) — il gancio di collaudo non chiude la
finestra prima, come già nel collaudo 180: **non giudicate**. Le finestre «settimana»/«partita» sono carte centrate: il loro vuoto
è sopra **e** sotto la carta (la colonna `primoTop` nei dati).

**Lettura.** Il difetto della foto è riprodotto: sul formato del telefono del PO (412) il pre-partita lascia 310 px. Non è un caso
isolato: le schermate **brevi e a colonna** (pre-partita, provini, offerte, menu, Opzioni) mettono tutto in alto e lasciano dal 33% al
75% dell'altezza nera; le schermate **lunghe** (Home e schede di carriera) scorrono e non hanno il problema; le **scene** lo evitano
perché il fondo è un'illustrazione. Il vuoto cresce col formato: 360 → 412 aggiunge ~115 px a ogni schermata (lo stesso contenuto,
più vista), e il PC è come il 412 perché le colonne hanno larghezza massima.

### Regola di distribuzione proposta («schermata piena»)

Coerente col tema unico (`TINTE`/`TH`, nessun colore nuovo, solo disposizione):

1. **Colonna a tutta altezza.** Il contenitore della schermata è `display:flex; flex-direction:column; min-height:100%` dell'area
   utile (vista − barra − safe-area). Nessuna altezza in pixel scritta a mano.
2. **Azioni ancorate in basso.** Il blocco dei tasti (principale + secondari) ha `margin-top:auto` e
   `padding-bottom: env(safe-area-inset-bottom)`: sta sotto il pollice, e se la schermata è lunga torna semplicemente in coda.
   Sul pre-partita: «Vedi le formazioni» / «Analisi» · «Salta e gioca» / «Torna alla home» in fondo.
3. **Un blocco cresce.** Il blocco informativo principale prende lo spazio che avanza (`flex:1`) e lo usa per respirare: più
   spaziatura interna fra le righe dello stesso blocco (passo del tema), stemmi più grandi sopra una soglia di altezza
   (es. `min-height` della vista ≥ 820 px → stemmi da 64 a 88 px nel pre-partita, carte delle offerte più alte). Mai testo più
   piccolo per «farci stare» (il contrario del problema).
4. **Finestre sul telefono = foglio dal basso.** Sotto i 640 px le finestre della settimana/partita si attaccano al fondo (raggio solo
   in alto) con le azioni in fondo; centrate solo da tablet/PC.
5. **Il vuoto voluto resta** dove è scenografia (feste, galà, intro): lì la regola non si applica.
6. **Guardiano**: `c184-lib.mjs` → `ALTEZZA()` è già pronto per diventare un controllo grafico (catena «solo grafica»): soglia proposta
   ≤ 12% di vuoto sulle schermate che non scorrono, eccetto le scene dichiarate. Ritirata/rosso come d'uso (`__CPM_NO_…`).

Ordine suggerito (impatto/sforzo): pre-partita (G184-01) → provini pre/post (G184-02) → offerte (G184-03) → menu (G184-04) → Opzioni →
finestre della settimana. Le prime tre sono il percorso di **ogni nuovo giocatore** nei primi minuti, cioè le schermate che un
recensore dello store vede per prime.

## B — Video iniziale (`IntroCinematic`, `src/19-app-root.jsx` r.221-591)

| misura | 360x800 | 412x915 | 1440x900 |
|---|---|---|---|
| durata fino alla chiusura da sola | 29,5-30,1 s | 29,5-30,1 s | 29,6-29,9 s |
| apertura (tasto → intro a schermo) | 1,2-1,6 s (1° giro) · 0,7 s | 1,3 s · 0,7-0,8 s | 1,1 s · 0,3-1,0 s |
| fps medi headless | 20,4-21,1 | 16,9-17,8 | **7,4-7,6** |
| fotogrammi > 100 ms | 11-30 | 25-37 | 185-205 |
| blocchi lunghi (n · più lungo) | 3-6 · 769 ms | 3-7 · 533 ms | 2-5 · 770 ms |
| memoria JS dopo GC (prima 103,6 MB) | 108,7 → 108,9 → 109,0 MB | 108,6 → 108,9 MB | 108,7 → 108,9 MB |
| tele WebGL dopo la chiusura | 0 (1 durante) | 0 | 0 |
| tasto «Salta» | 77x33 px, 12 px | 77x33 px | 77x33 px |

- **Memoria**: stabile su tre aperture di fila (+0,1-0,2 MB per giro, dentro il rumore), la tela viene rimossa: nessuna perdita
  misurata. **Fluidità**: in headless il rendering è software, quindi i numeri assoluti non sono il telefono; il dato utile è il
  confronto (a 1440x900 gli fps headless sono un terzo di quelli dei telefoni: più pixel da disegnare; `setPixelRatio` è già limitato a 1,6) e i **blocchi lunghi
  all'apertura** (fino a 0,77 s: caricamento GLB/shader): da guardare sul dispositivo (G184-14).
- **Testi** (foto `intro-360-t*.png`, un fotogramma per didascalia): nessun testo fuori dalla vista a 360/412 (a PC tre righe
  risultano più larghe della vista **solo durante l'animazione d'ingresso** in scala: artefatto, non difetto). Contrasto: tutte le
  didascalie ≥ soglia **tranne la chiusura** a 360 (G184-11). Le tre istruzioni del live match sono illeggibili per tempo (G184-10).
- **Audio/autoplay**: nessun audio (G184-13), quindi nessun problema di autoplay; il tasto «Rivedi intro» sblocca l'audio
  (`AudioMgr.unlock()`) ma l'intro non lo usa. Con `prefers-reduced-motion` la scena 3D non parte e restano le didascalie sul nero
  (dal sorgente, r.249; non provato).
- **«Rivedi l'intro»**: funziona dalla home (tasto 89x56) e dal profilo di carriera (`src/18` r.6378); sopra a tutto (z 10050).
- **Primo avvio** (creazione → intro → provino): **non attraversato** dalla sonda — sotto `?cpmtest=1` l'intro è spenta e fuori da
  `cpmtest` i ganci della partita non ci sono. L'ordine è dal sorgente (`src/19` r.861-863, `cpm-intro-seen`).

Foto: `intro-360-t1_2` (marchio), `t4_8` (eroe), `t7_6` (istruzioni: due su tre), `t9`, `t10_6` (gol), `t13_6`, `t17_4` (CTA),
`t26` (CTA sopra la bandiera), `intro-412-t7_6`, `intro-pc-t4_8`, `intro-pc-t17_4`.

## C — Provini (`TrialFlow`, `src/17-menu-creazione-pannelli.jsx` r.612-736)

Linea del tempo misurata a 360 (gli altri formati entro ±2 s): home 10,7 s (avvio headless) → creazione → **11 s di compilazione**
(sonda) → «Il provino · Passo 1 di 3» → «⚡ Inizia il provino» → **in campo in 2,8 s** (niente pre-partita né formazioni: giusto per un
provino) → **42 s di gioco fluido** → prima scelta (G184-22) → esito → secondo highlight → fischio → «Zona mista» col tabellino
(scorre) → **«📋 RISULTATI PROVINO»** → «Provino 1 di 3 · completato» (voto, gol, assist, scout, tre pallini) → «Vai al Provino 2».

- **Chiarezza**: il pre-provino spiega bene cosa fare (guida dello scout + «Come si gioca», solo al primo); il post dice voto e
  quanti provini mancano. Il riepilogo finale dei tre provini non esiste come schermata (G184-20).
- **Pulsanti**: nessun tasto sotto i 44 px nelle schermate dei provini al telefono; l'unico testo troncato è nella fine partita a 360 (G184-23).
- **Ripresa dopo chiusura**: corretta (G184-26). **Offerte**: 2 offerte, «Scegli →» porta direttamente al tutorial d'arrivo e alla carriera
  (la sonda non ha trovato una richiesta di conferma: la scelta del club vale al primo tocco).
- **Coerenza V2**: titoli, carte e tasti sono nel tema; restano la squadra granata e il bordo azzurro chiaro cablato (G184-24).

## D — Creazione del giocatore (`CreateScreen`, `src/17` r.400-545)

- Validazione: «INIZIA I PROVINI» **disattivato** a nome vuoto, con la riga «Scrivi il nome per iniziare» (misurato) — bene.
- Nome: troncato in silenzio a 22 caratteri (G184-30); Invio avvia i provini (G184-31).
- Scorrimento a 360: pagina 1157 px su 800 (si scorre una volta); a PC sta tutta in una vista (due colonne).
- Fisarmoniche «Club dei sogni» e «Modalità Sfida» chiuse di default: aperte, la pagina cresce e scorre
  (foto `creazione-fisarmoniche-aperte-360-prov.png`).
- Tastiera: vedi G184-32 (simulazione dichiarata, non decisiva).
- Tempo dal tasto al primo provino: **460 ms**.

## Cosa non è stato coperto

- Il **wizard d'apertura stagione** (G184-33), il tutorial dopo il primo passo, le finestre di salvataggio/importazione.
- Il terzo provino giocato (G184-20 viene dal sorgente), i rigori, i club giallo/scuro (qui solo FC Merseyside: per i colori vale il
  collaudo 180).
- Il telefono vero: fluidità dell'intro (G184-14) e tastiera (G184-32) vanno provati sul dispositivo del PO.

## Come rifare le misure

```bash
cd tests/visual && export CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
export C180_FOTO=<cartella foto> C180_DATI=<cartella dati> C184_FOTO=<cartella foto>
C180_FORMATI=s412 node c184-altezza.mjs          # ~4,5 min per formato (C184_PARTE=fuori,carriera,finestre,partita)
C180_FORMATI=s360,s412 node c184-provini.mjs      # ~2,5 min per formato
C180_FORMATI=s360,s412,pc node c184-intro.mjs     # ~2,5 min per formato
python3 -I c184-sintesi.py <cartella dati>/x       # tabella dell'altezza
```
