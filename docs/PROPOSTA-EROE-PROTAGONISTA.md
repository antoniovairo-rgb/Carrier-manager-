# PROPOSTA TECNICA — EROE PROTAGONISTA DELLA PARTITA RACCONTATA

Direttiva PO (28/08, notte): l'eroe deve essere un protagonista ATTIVO della telecronaca —
interagisce con mister, compagni e avversari, reagisce, prende iniziative, influenza le azioni
successive, subisce conseguenze. Requisiti fondamentali: **VARIETÀ + CONTESTO + CONSEGUENZE +
PROTAGONISMO**. Niente ripetitività, 2-4 momenti significativi a partita, mai un GDR di dialoghi.

Questa è la proposta chiesta («prima del codice, descrivete»), nei 10 punti richiesti.
Si innesta nella roadmap narrativa come **FASE 6b** (dopo il catalogo azioni salienti F6,
prima del collaudo spettatore F9): le conseguenze delle interazioni agiscono sui *pesi* del
catalogo, quindi il catalogo deve esistere prima.

## 1 · Modello dello stato narrativo

Un oggetto leggero, un solo ref (`narrRef`, src/14, accanto al direttore di partita), aggiornato
da microsim/direttore/salienti/HL — mai letto dal microsim (l'autorità del punteggio resta
intoccabile). Esposto in collaudo come `window.__CPM_NARR`.

```
narr = {
  mn, score: [h,a],                 // minuto e risultato (specchio, mai fonte)
  ritmo: 0..3, pressione: 0..3,     // dal direttore di partita (scene correnti)
  dominio: -2..+2,                  // chi comanda (media mobile delle scene)
  morale: -2..+2,                   // squadra nostra (gol, occasioni, duelli)
  tatt: {stile, modulo, consegne:[]},// situazione tattica percepita
  zone: {sx,cn,dx},                 // contatori d'uso delle corsie
  eroe: {forma, coinvolgimento, fiducia, zona, duelliV, duelliP, ultimaGiocata},
  rapporti: {
    compagni:  {pid: {intesa, fiducia}},     // -3..+3, parte da 0
    avversari: {pid: {tensione, duelli:[v,p], marcatura}} // marcatura: 0=normale 1=stretta
  },
  recenti: [ultimi 8 eventi salienti],       // per la selezione contestuale
  intxLog: [],                               // registro anti-ripetizione (punto 4)
  cooldown: {categoria: minuto-di-sblocco}
}
```

Tutto deterministico: nessun `Math.random`, solo hash di stato (`dir648|…`-style) come già
fanno direttore e piano-gol.

## 2 · Categorie di interazione

Ogni interazione è una **scheda confezionata** (stesso principio del catalogo azioni): beat
scritti a mano, slot riempiti dal contesto (nomi veri, minuti, punteggio, zona). Quattro famiglie:

- **MISTER** (bordocampo): indicazione tattica, richiamo, incoraggiamento, cambio consegna,
  «sfrutta quel lato» (debolezza rilevata). L'eroe può rispondere: chiedere chiarimento o
  proporre — e la risposta CAMBIA la consegna risultante.
- **COMPAGNI**: richiesta/offerta di palla, proposta di triangolo, copertura chiesta, richiamo
  dopo errore, incoraggiamento dopo occasione fallita, discussione, suggerimento, intesa che nasce.
- **AVVERSARI**: duello dichiarato (l'eroe salta due volte lo stesso terzino → il registro lo sa),
  provocazione, fallo cattivo con strascico, rispetto a fine duello, rivalità che monta.
- **INIZIATIVE DELL'EROE**: chiede palla, propone cambio di zona, si sposta sul lato debole,
  richiama la linea, decide un tiro da fuori contro la consegna (rischio: conseguenza doppia).

Set iniziale: ~16 schede (4 per famiglia), ognuna con 2-3 varianti di esito — scritte in un
`docs/CATALOGO-INTERAZIONI-EROE.md` che il PO corregge PRIMA che diventi codice, come per le
azioni salienti.

## 3 · Selezione contestuale

Ogni scheda dichiara **precondizioni sullo stato** e un **peso**. Il selettore gira nelle fasi
tranquille (scene `quiete`/`costruzione` del direttore) e nei punti di svolta (dopo gol, dopo
occasione fallita, all'intervallo, ultimi 15'):

- `0-0 al 75'+` → mister-accelerare pesa ×4; `+2 all'85'` → mister-gestione;
- occasione eroe fallita da <5' → compagno-incoraggia;
- `eroe.rapporti.avversari[x].duelli = [3,0]` → il difensore stringe la marcatura (avversario-duello),
  e SOLO DOPO può scattare mister-cambia-zona (le catene hanno ordine, non escono a caso);
- scheda mai eleggibile se le precondizioni non tengono: zero interazioni «a vuoto».

La scelta fra le eleggibili è hash-di-stato (deterministico, collaudabile con seed).

## 4 · Sistema anti-ripetizione

Il registro `intxLog` traccia per ogni interazione: `{tipo, attori, contestoKey, faseMn, esito, mn}`.
Regole dure (metri automatici, non stile):

1. stessa `(tipo, attore)` mai due volte nella stessa partita;
2. stessa **contestoKey** (situazione, non testo: es. `duello-stretto|terzinoX|fascia-dx`) mai
   ripetuta — cambiare le parole NON basta, deve cambiare la situazione (parola del PO);
3. cooldown per famiglia: ≥12' fra due interazioni della stessa famiglia;
4. tetto di partita: 2-4 momenti significativi (banda del guardiano), gli eventi rari max 1;
5. le varianti di una scheda ruotano su hash (mai la stessa variante in partite consecutive
   con lo stesso avversario — l'hash include matchday).

## 5 · Conseguenze

Ogni scheda dichiara nel proprio contratto gli **effetti sullo stato** (mai sul punteggio):

- incoraggiare un compagno → `intesa+1` → i pesi del catalogo preferiscono varianti che lo coinvolgono;
- proporre/subire cambio zona → `eroe.zona` cambia → il selettore SIT e le azioni salienti
  pescano dall'altra corsia;
- chiedere palla → `coinvolgimento+1` → più probabilità che la prossima saliente abbia l'eroe protagonista;
- duello perso → `avversario.marcatura=1` → i suoi contrasti nelle schede riescono di più,
  i dribbling dell'eroe su quel lato pesano di meno;
- grande giocata → i compagni «lo cercano»: le schede con slot-eroe pesano ×2 per 10'.

Catena obbligatoria e misurabile: **INTERAZIONE → CONSEGUENZA (delta di stato) → NUOVA
SITUAZIONE (una scheda/azione resa eleggibile o ripesata)**. Un'interazione senza effetto
registrato è un difetto (metro al punto 10).

## 6 · Collegamento con la cronaca

Le interazioni sono **righe di cronaca dedicate**, stile distinto (virgolettato, colore proprio,
prefisso bordocampo per il mister), emesse dal canale annunci-scena già esistente (7.653) —
quindi rispettano il turno di scrittura, la catena causale e il freno: zero righe rubate.
Un beat per battuta (regola 4 del catalogo). Sul testo grande centrale (7.661) le battute
di dialogo hanno il loro colore: si riconoscono a colpo d'occhio.

## 7 · Collegamento con le azioni salienti

Le conseguenze non generano azioni: **ripesano il catalogo**. Ogni scheda-azione del catalogo
guadagna slot opzionali (`attorePreferito`, `corsiaPreferita`, `duelloAttivo`) che il selettore
riempie dallo stato narrativo. Esempio del PO, per filo: eroe supera 2 volte il terzino →
scheda avversario-stringe → mister-cambia-zona → la prossima azione 2 («Fascia e taglio») esce
sull'ALTRA fascia con l'eroe nello slot dell'esterno. La rotazione del catalogo resta sovrana.

## 8 · Collegamento con gli highlights

Un'interazione NON produce mai un HL da sola (parola del PO). Quando la catena
interazione→azione culmina in una giocata dell'eroe, l'HL è quello dell'azione, e **eredita il
contesto**: la SIT scelta rispetta zona e avversario dello stato (il duello si VEDE: stesso
marcatore), e la cronaca d'ingresso dell'HL richiama l'interazione («come chiesto dal mister…»).
Pipeline completa: TELECRONACA → INTERAZIONE → AZIONE → CONSEGUENZA → HIGHLIGHT.

## 9 · Influenza sugli eventi successivi

Lo stato narrativo alimenta (in sola lettura) i tre selettori esistenti:
- **direttore di partita** (7.647/7.648): dominio e ritmo spostano le durate/probabilità delle scene;
- **selettore salienti** (F6): pesi per corsia/attori/duelli come al punto 7;
- **selettore SIT dell'eroe**: zona e marcatore coerenti con lo stato.
Confine invariabile: il microsim decide punteggio e marcatori PRIMA; lo stato narrativo decide
solo COME quel risultato viene raccontato e da chi. Zero regressioni su carriera/salvataggi.

## 10 · Test necessari

- **Registro** `__CPM_NARR` + `__CPM_INTX` (log interazioni) per le sonde.
- **Banda ritmo**: 2-4 interazioni significative a partita su 10 partite sonda (rosso se 0-1 o >5).
- **Anti-ripetizione**: zero violazioni delle regole 1-4 del punto 4 su 10 partite (metro sul registro).
- **Catena conseguenze**: ogni interazione ha un delta di stato registrato e almeno un ripeso
  osservabile entro 10' (metro automatico).
- **Determinismo**: stesso seed → stesse interazioni (entra nel check determinism del validatore).
- **Contestualità**: metro campionario — per ogni interazione, le precondizioni dichiarate erano
  vere al minuto d'emissione (si rilegge dallo stato loggato).
- **Guardiano partita-vera esteso** (F8): bande esistenti INTATTE (turno-causale, catena, arbitro),
  più la banda interazioni.
- **Fondatezza cronaca**: le righe di dialogo sono esenti dal giudice destinazioni ma non devono
  degradare la fondatezza delle righe di gioco (ri-misura appaiata).
- **Career-critical + rituale 8 passi** verdi a ogni release.
- **Collaudo PO**: il giudice finale del «questa è la MIA partita» resta lui.

## Ordine di consegna (release piccole, ognuna collaudabile)

1. **R1** — stato narrativo + registri (invisibile al giocatore, solo strumentazione e metri).
2. **R2** — catalogo interazioni scritto (`docs/CATALOGO-INTERAZIONI-EROE.md`) → correzioni PO.
3. **R3** — famiglia MISTER (2-3 schede) con conseguenze sui pesi + righe cronaca dedicate.
4. **R4** — COMPAGNI + iniziative eroe.
5. **R5** — AVVERSARI: duelli, marcatura, rivalità (il caso d'esempio del PO per intero).
6. **R6** — eventi rari (max 1 a partita) + eredità di contesto negli HL.
