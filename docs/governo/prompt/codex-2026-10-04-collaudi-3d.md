# Prompt per Codex — collaudi 3D sulla 7.999.12x (4 ottobre)

**Decisione del PO (03/10, questionario):** alla ripresa, priorità ai **collaudi 3D sulla versione attuale**. Il banco deterministico sulla
7.999.105 (`codex/2026-10-02-banco-deterministico`, commit `cb32ceaa`, 15 casi validi su 80) **si archivia**: i suoi casi non valgono per
la versione attuale e non vanno completati.

**Base:** `main` aggiornato, `GAME_VERSION` ≥ **7.999.126** (commit `ef171376` o successivo). Lavora sul ramo
`codex/2026-10-03-collaudi-7999122` (commit `82debed6`) dopo averlo aggiornato da `main`, oppure su un ramo nuovo
`codex/2026-10-04-collaudi-3d`. Leggi la versione dal file `src/07-versione-save-interviste.jsx` e scrivila in ogni rapporto.

**Memoria:** apri Chromium solo con più di 3,5 GB liberi. Sotto soglia fermati, registra lo stato e riprendi dopo. Non ridurre il
campione senza dirlo.

## Ordine
1. **Difesa 3D** (le scene del tuo banco: 33, 45, 133, 134, 138, 168, 31, 32, 36): stessa sonda, base nuova. Per ogni caso: eroe in
   quadro, pallone in quadro (letture su totale), GLB sì/no, `ActionResolved` concorde. Dal team: **gi133 è riprodotto** (pallone fuori
   quadro 100% con orologio virtuale e seme, controllo gi33 0%); la correzione della telecamera è in lavorazione. Misura gi133 così com'è,
   ci serve come «prima».
2. **Colpi di testa PO-077**: gi64, gi86, gi90 (3 success + 3 fail), rosso della 171 (`__CPM_NO_TUFFO109`) 3 volte.
3. **Passaggi**: la tua sonda, validata prima di pubblicare numeri.

## Cosa è cambiato nel gioco dopo la 7.999.122
- 7.999.123-125: cerimonie (parata con corpi CGTrader, presentazione «da televisione», busta del galà a tocchi e per tutti i premi).
- 7.999.126: guanti dei portieri (`__CPM_NO_GUANTI_PO201`), formazioni a tutta altezza, **dopo ogni gol il motore riparte dal centro**
  (`__CPM_NO_KO207`): i conteggi di possesso e pallone dopo un gol cambiano rispetto alla 7.999.122.

## Regole
Non modifichi il gioco; scrivi solo in `reports/codex/` e `tests/codex/`. Ogni rilievo è un'ipotesi finché il team non lo riproduce: per
ciascuno commit, `GAME_VERSION`, comando esatto e grezzo. Per chiudere i processi non usare mai il kill per schema di comando: trova i
PID con pgrep, controlla l'elenco e chiudi i singoli PID. Alla fine commit e push, verifica con `git ls-remote origin` e riepilogo in 10
righe.
