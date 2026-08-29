# TELECRONACA INTERATTIVA — l'eroe decide dentro il racconto

Direttiva PO [KE 7.678, SIT #22]: «L'eroe non interagisce per niente durante la telecronaca,
deve essere interattiva, a scelta!»

Questo documento sostituisce la parte «interazioni» della proposta EROE PROTAGONISTA: lì le
interazioni erano righe di testo da leggere, qui diventano **momenti in cui il giocatore decide**.

## 0. Il numero da cui parto (misurato, non stimato)

Una partita intera in regime di gioco, seed 7300:
- **26 righe di cronaca** in tutta la gara (una ogni ~3,5 minuti);
- **3 interazioni eroe** emesse — 20' MISTER, 32' COMPAGNI, 46' COMPAGNI;
- 6 righe di azione saliente (catena), 4 di manovra-gol.

Tre momenti a partita è **esattamente** la densità che il PO ha chiesto («2-4 momenti
significativi, senza trasformarsi in un GDR di dialoghi»). Non serve produrne di più: serve
renderli **decisioni**.

## 1. Cosa cambia, in una riga

Oggi: `📣 Il mister chiama Po a bordo campo e gli indica lo spazio alle spalle del terzino.`
Domani: la stessa riga, e sotto **due o tre bottoni**. Il giocatore sceglie. La partita ne tiene conto.

## 2. Anatomia di un momento interattivo

Ogni scheda INTX porta già `id`, `fam` (MISTER/COMPAGNI/AVVERSARI/ARBITRO), `cond`, `txt`, `cons`.
Si aggiunge un solo campo, `scelte`: da 2 a 3 opzioni, ognuna con
- **etichetta** breve (quello che il giocatore legge sul bottone),
- **esito** — una riga di cronaca che segue immediatamente, scritta come conseguenza,
- **cons** — l'effetto sullo stato narrativo (fiducia mister, intesa col compagno, morale,
  marcatura addosso, aggressività avversaria) e, dove ha senso, sui numeri della partita
  (probabilità che il prossimo highlight sia tuo, rischio di cartellino).

Nessuna scelta è «giusta»: ognuna apre e chiude qualcosa. Obbedire al mister alza la fiducia e
ti fa arrivare più palloni; disobbedire e riuscire alza morale e reputazione ma costa fiducia.

## 3. Dove appare, e come non rompe la partita

- Appare **nel feed**, dove già appare la riga: nessuna schermata nuova, nessuna modale.
- **Ha un tempo**: se il giocatore non sceglie entro il respiro della riga (la pausa d'enfasi che
  la cronaca già assegna agli eventi importanti), si applica l'opzione **neutra** dichiarata nella
  scheda. La partita non si blocca mai aspettando — regola non negoziabile: il PO gioca sul
  telefono, a volte guardando altro.
- **Mai dentro un highlight** e mai sopra una scena-gol: i cancelli 7.669 restano quelli.
- Il **punteggio non si tocca**: il microsim resta l'autorità. Le conseguenze agiscono su chi
  riceve palla, su chi ti marca, sul tuo morale — non sul risultato.

## 4. Anti-ripetitività (il requisito che il PO ha messo per primo)

Le regole già in esercizio nel 7.669 valgono anche per le scelte:
- una scheda non si ripete nella stessa partita (`fatte`), tetto 3, dodici minuti di distanza;
- **in più**: la chiave anti-ripetizione include la SCELTA fatta, così la stessa scheda ripresentata
  in una partita futura si apre su un ramo diverso da quello già giocato;
- gli esiti sono scritti a coppie divergenti: non esiste il ramo «va sempre bene».

## 5. Conseguenze che si vedono, non che si dichiarano

Una conseguenza che nessuno nota è una conseguenza che non esiste. Ogni effetto deve avere
**almeno un modo visibile** di manifestarsi entro pochi minuti di gioco:
- fiducia mister ↑ → una riga di cronaca in cui il mister ti cerca / il pallone ti arriva prima;
- intesa col compagno ↑ → quel compagno diventa il destinatario preferito del prossimo assist;
- marcatura addosso ↑ → il prossimo duello si apre con l'avversario più vicino;
- morale ↓ → il prossimo highlight si apre con una battuta di cronaca più dura.

## 6. Come lo misuro (prima di scriverlo)

- **densità**: 2-4 momenti a partita su 10 partite seedate, mai 0, mai 5;
- **scelta reale**: su 30 partite ogni opzione dev'essere scelta almeno una volta dal bot casuale,
  e nessun ramo deve valere più del 50% (altrimenti una delle opzioni è finta);
- **conseguenza visibile**: per ogni conseguenza, la quota di partite in cui si manifesta entro
  10 minuti — banda ≥70%, altrimenti l'effetto è dichiarato e non reale;
- **niente blocchi**: in 10 partite senza mai scegliere, la partita finisce sempre al 90';
- **anti-ripetizione**: su 4 partite consecutive, zero coppie (scheda, ramo) ripetute.

## 7. Consegna

R1 — il campo `scelte` e il rendering dei bottoni nel feed, con timer e opzione neutra (nessuna
     scheda nuova: si convertono le 19 esistenti, 6 per volta).
R2 — le conseguenze visibili del §5, una famiglia alla volta, ognuna con la sua misura.
R3 — la banda anti-ripetizione sul ramo e il guardiano di densità.

Nessuno di questi passi tocca carriera, salvataggi, classifiche o mercato.
