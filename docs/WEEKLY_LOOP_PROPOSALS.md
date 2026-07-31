# Proposte — rendere la settimana avvincente e non ripetitiva

> Documento di proposta (2026-07-31), su richiesta del proprietario: «proponi nuove storie
> settimanali, funzionalità per rendere più avvincente, coinvolgente, meno ripetitivo il gioco
> nell'avanzare delle settimane». Nessuna implementazione: qui c'è la diagnosi e il piano.

## 1. Che cosa produce oggi una settimana

Il ciclo settimanale ha già **venticinque produttori** distinti, quasi tutti derivati dai fatti:

| Categoria | Produttori |
|---|---|
| Cornice | `weekTheme` (tema della settimana), `innerWeather` (meteo interiore), `mindDriver` (driver motivazionale) |
| Persone | `clubVoices` (presidente/mister/curva/procuratore), `mateEcho` (spogliatoio), `bondEvent` (legame con un compagno), `curvaView` (legame con la curva) |
| Pressione | `expectationView` (attese vs rendimento), `pactView` (patto col mister), `persGoals`, piano del procuratore |
| Mondo | `clubProject`, `sackView` (esonero), `ctListView` (lista del CT), `sponsorView`, `lifeView` (vita privata) |
| Eventi | `WEEKLY_EVENTS`, `WEEKLY_IMPULSES` (60 voci, battito garantito), `SPOGLIATOIO_MOMENTS`, interviste |
| Archi | `storyChapter` (12 chiavi one-shot), saga mercato, apertura di stagione, sorteggi, deadline day |

**Il problema non è la quantità.** È strutturale, e sono tre difetti precisi.

### D1 — Quasi tutto è one-shot e senza memoria
Ogni card nasce e muore nella stessa settimana. Le uniche eccezioni sono la **saga mercato**
(3 puntate) e il **patto col mister** (a scadenza). Tutto il resto è un evento isolato: nessuna
tensione che cresce, nessuna attesa di «come va a finire». Una stagione è un *elenco* di momenti,
non una *storia*.

### D2 — Gli archi narrativi sono 12 e ripartono ogni stagione
`storyChapter` ha dodici chiavi one-shot con chiave **per stagione**: «la piazza dubita», «il
ritorno da ex», «gli eterni rivali», «la volata», «le parole di agosto»… Dalla terza stagione il
giocatore li ha visti tutti, e li rivede identici ogni anno. (Il duello col rivale è stato appena
variato — 7.267.0 — ma resta un caso isolato.)

### D3 — Il mondo non ti attraversa
Il rivale, gli ex compagni, gli ex club, il CT, il giovane della Primavera **esistono già nel
salvataggio** e vivono la loro stagione, ma incrociano il giocatore quasi solo dentro la partita.
Fuori dai novanta minuti il mondo è muto.

---

## 2. Proposte, in ordine di rapporto impatto/rischio

### P1 — Mini-serie a puntate (il feuilleton settimanale) ⭐ la più importante
**Cosa.** Un motore generico `serialArc` per archi a **3-6 puntate** distribuite su alcune
settimane, con stato salvato (`p.serials`, campo lazy) e **scelte che si compongono**: la puntata
N legge quello che hai scelto alla N-1, e il finale dipende dal percorso, non da un dado.

Serie al lancio, tutte innescate da fatti già tracciati:
- **Il caso disciplinare** — cartellino rosso o fatica cronica → convocazione dal DS → multa,
  scuse pubbliche o silenzio → verdetto dello spogliatoio (chimica/fiducia).
- **Il ragazzo della Primavera** — un giovane VERO del roster ti sceglie come modello → lo segui o
  lo ignori → il suo esordio → diventa il tuo erede o se ne va altrove.
- **Il rinnovo che non arriva** — quattro puntate di pressione crescente (media, procuratore,
  curva) prima del modale di rinnovo che oggi appare dal nulla.
- **La fascia ad interim** — il capitano si ferma → guidi tu per N gare → verdetto sulla leadership.
- **La corsa al capocannoniere** — il duello (che oggi è una card statica) diventa una serie con
  sorpassi, controsorpassi e l'ultima giornata.

**Perché funziona.** La serialità è ciò che trasforma una stagione in una storia: dà attesa fra una
settimana e l'altra, che è esattamente ciò che manca. E riusa tutto — `ledgerPush`, il diario, le
card esistenti, il Film della stagione.
**Rischio.** Basso: additivo, campo lazy, nessun bump SAVE. Serve un guardiano sulla varietà e
sulla chiusura garantita delle serie (mai una serie che resta appesa a fine stagione).

### P2 — Il mondo ti attraversa
Nuovi produttori che usano **entità già vive nel salvataggio**, fuori dalla partita:
- il **rivale** parla di te in un'intervista, ti scavalca in classifica marcatori, cambia squadra;
- un **ex compagno** che è andato via ti chiama (da `p.history` + roster passati);
- il **club dove sei cresciuto** vive una crisi o una festa e la stampa ti chiede un commento;
- il **CT** viene a vederti in tribuna (e lo scopri dopo).

**Perché funziona.** Attacca D3 direttamente e non costa contenuto nuovo: sono relazioni che il
gioco già simula, oggi invisibili.
**Rischio.** Molto basso (display + micro-effetti bounded).

### P3 — Archi scalati sulla fase di carriera
Oggi lo stesso pool serve il diciottenne e il trentatreenne. Tre fasi con archi propri:
- **l'esordiente** — la paura, la prima volta, il posto da conquistare, il primo errore pubblico;
- **il titolare** — la leadership, la gestione, il peso delle attese, la concorrenza che arriva;
- **il veterano** — il corpo che parla, l'eredità, la panchina, la scelta del momento giusto.

**Perché funziona.** Attacca D2 alla radice: le stagioni 1-3 e 12-15 smettono di somigliarsi.
**Rischio.** Basso, ma è il pezzo che richiede più scrittura.

### P4 — Le conseguenze del ledger si riscuotono
`p.ledger` registra promesse e torti, ma ha pochissimi consumatori. Regola: **ogni voce del ledger
torna entro 6-10 settimane**, in bene o in male, con il nome di chi se l'è segnata.
**Perché funziona.** Dà peso alle scelte già prese: il giocatore impara che le parole contano.
**Rischio.** Basso.

### P5 — La settimana ha un costo (bilanciamento)
Oggi una settimana senza partita è quasi identica a ogni altra. Un **budget settimanale** con due
scelte reali (allenamento extra, recupero, media, vita privata) che compongono nel medio periodo.
**Rischio.** Medio — tocca il bilanciamento della crescita: va misurato su una carriera intera
prima di rilasciarlo, e va deciso dal proprietario perché cambia il ritmo del gioco.

### P6 — Voce locale
Lo stesso evento raccontato con la voce della piazza: Napoli, Londra e Istanbul non parlano allo
stesso modo. Variante di testo per nazione/piazza sui pool già esistenti.
**Rischio.** Basso, effetto percepito alto sulla ripetitività dei testi.

### P7 — La pagina del mese
Ogni quattro settimane una card impaginata come una pagina di giornale: la tua traiettoria, la
classifica, il tuo rendimento, una frase della piazza. Un punto di respiro e di bilancio.
**Rischio.** Nullo (display).

---

## 3. Ordine consigliato

1. **P1 — mini-serie** (il salto vero: dalla settimana-elenco alla settimana-storia)
2. **P2 — il mondo ti attraversa** (massimo effetto per il costo più basso)
3. **P3 — archi per fase di carriera** (chiude la ripetitività fra stagioni)
4. **P4 — ledger che si riscuote**, **P6 — voce locale**, **P7 — pagina del mese**
5. **P5 — budget settimanale**: solo su decisione esplicita del proprietario, perché cambia il
   bilanciamento.
