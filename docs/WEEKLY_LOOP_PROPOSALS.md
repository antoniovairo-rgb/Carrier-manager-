# Proposte — rendere la settimana avvincente e non ripetitiva

> Documento di proposta (2026-07-31), su richiesta del proprietario: «proponi nuove storie settimanali,
> funzionalità per rendere più avvincente, coinvolgente, meno ripetitivo il gioco nell'avanzare delle
> settimane». **Stato: P1, P2, P3, P4 e P6 realizzate (7.269.0 → 7.271.0). P5 RESPINTA.**

## 1. La diagnosi

Il ciclo settimanale aveva già **venticinque produttori** di contenuto (tema della settimana, meteo
interiore, driver motivazionale, voci del club, spogliatoio, aspettative, patto col mister, impulsi,
interviste, sponsor, vita privata, esonero, progetto club, lista del CT, curva, panchina, irripetibili,
allenamento, obiettivi personali, piano del procuratore, saga di mercato, sorteggi, deadline day,
apertura di stagione, archi di `storyChapter`).

**Il problema non era la quantità.** Erano tre difetti strutturali:

- **D1 — tutto one-shot e senza memoria.** Ogni card nasceva e moriva nella stessa settimana: nessuna
  attesa fra una settimana e l'altra, quindi la stagione restava un *elenco* di momenti, non una storia.
- **D2 — dodici archi con chiave per stagione.** Dalla terza stagione il giocatore li aveva visti tutti e
  li rivedeva identici ogni anno.
- **D3 — il mondo non ti attraversava.** Rivale, ex compagni, ex club, CT esistevano nel salvataggio e
  vivevano la loro stagione, ma incrociavano il giocatore quasi solo dentro i novanta minuti.

## 2. Le proposte e il loro esito

### P1 — Mini-serie a puntate ✅ realizzata in 7.269.0
Motore generico di archi a 3-6 puntate (`serialView` + tabella `SERIALS`): una serie alla volta, episodi
distanziati di almeno due settimane, **scelte che si compongono** (la puntata N legge quella N-1). Tre
serie al lancio: *il caso disciplinare*, *il ragazzo della Primavera*, *la corsa al capocannoniere*.
Chiusura garantita entro la stagione, decadenza al cambio maglia. Attacca D1.

### P2 — Il mondo ti attraversa ✅ realizzata in 7.270.0
`worldTouch`: il rivale ti cita in conferenza coi numeri veri, un ex compagno ti telefona col nome reale
preso dalla rosa di quel club, il club dove sei cresciuto è raccontato con la sua posizione vera, il CT
era in tribuna. Una voce alla volta, mai due settimane di fila. Attacca D3.

### P3 — Archi per fase di carriera ✅ realizzata in 7.271.0
Tre età con capitoli propri (esordiente, titolare, veterano), one-shot per carriera e uno per stagione,
derivati dai fatti. Attacca D2.

### P4 — Il ledger si riscuote ✅ realizzata in 7.270.0
`ledgerDue`: ogni promessa o torto torna dopo almeno sei settimane, col nome di chi se l'era segnata, e il
verdetto guarda i fatti successivi.

### P5 — La settimana ha un costo ❌ RESPINTA DAL PROPRIETARIO (2026-08-01)

> **Decisione definitiva: «p5 assolutamente niente!».** Non va implementata — né in variante leggera né in
> variante piena — e **non va ri-proposta**. Resta qui solo come traccia di ciò che è stato valutato e
> scartato.

Era: due slot settimanali da assegnare fra carico extra, scarico, studio dell'avversario, media, famiglia,
mentoring. Le tre ragioni per cui era stata sottoposta al proprietario invece che realizzata — e che oggi
sono la motivazione del no:
1. confinava con la **scelta del focus di allenamento**, rimossa su direttiva del proprietario nel 5.86.0
   («funzionalità noiosa»);
2. toccava il **bilanciamento della crescita**, tarata su un allenamento automatico e costante (picco di
   progetto ~90-92 OVR a 29-31 anni);
3. rischiava la **scelta dominante**, cioè esattamente la noia che si voleva curare.

### P6 — La voce locale ✅ realizzata in 7.271.0
`piazzaVoice`: la curva si chiama come si chiama davvero (la Sud, la Kop, il Fondo Sur, la Südtribüne, il
Virage, la Bancada Sul, la F-Side, la Kale Ardı) e parla come si parla lì.

### P7 — La pagina del mese ⏸️ non richiesta
Ogni quattro settimane un bilancio impaginato come una pagina di giornale. Mai approvata, resta a backlog.

## 3. Guardiani permanenti introdotti

`serial-arc-test` (P1) · `mondo-ledger-test` (P2+P4) · `fase-piazza-test` (P3+P6).
