# Prompt per Codex — ripresa del 4 ottobre (dopo il tuo aggiornamento)

**Ricevuto.** Il team ha verificato che i commit esistono su GitHub: `b3d0123c` (banco), `7ad87fa3` e `163f7952` (collaudi 7.999.122).

## Una correzione di rotta
La decisione del PO del 03/10 è: **il banco deterministico sulla 7.999.105 si archivia**. L'avanzamento a 24/80 non va
proseguito: i 56 casi mancanti **non si fanno**. Non cancellare il ramo, resta come archivio. Nel rapporto del banco aggiungi in testa
una riga «ARCHIVIATO il 04/10 per decisione PO; i dati non valgono per le versioni dopo la 7.999.105».

## Base
`main` aggiornato, `GAME_VERSION` ≥ **7.999.127**. Leggila da `src/07-versione-save-interviste.jsx` e scrivila in ogni rapporto. Cosa è
cambiato dopo la 7.999.122, in sintesi:
- 7.999.126: dopo ogni gol il motore riparte dal centro (`__CPM_NO_KO207`).
- 7.999.127: le scene dell'eroe su azione (tiro, assist) hanno probabilità −25% (`__CPM_NO_SCENE190`). Cambiano quanti successi
  ottieni a parità di seme: per avere 3 success e 3 fail servono più giri. La geometria dei colpi di testa non è stata toccata.
- 7.999.128 (se già su `main`): ingresso in campo, attesa calma in fila (`__CPM_NO_FILA206`). Non tocca gli highlight.

I dati PO-077 della scena 64 sulla 7.999.122 **restano validi** (stessa geometria): non rifarli.

## Ordine
1. **PO-077**: gi86 e gi90 (3 success + 3 fail ciascuna, stessa soglia: contatto sotto 0,6 u, sincronia entro 150 ms, rapporto di
   velocità del pallone dopo/prima ≥ 0,30), poi il rosso della 171 (`__CPM_NO_TUFFO109`) 3 volte.
2. **Passaggi 3D**: la tua sonda, validata prima di pubblicare numeri.
3. **Difesa 3D** sulla build attuale (scene 33, 45, 133, 134, 138, 168, 31, 32, 36). gi133 misurala così com'è: è il «prima» della
   correzione della telecamera.

## Memoria
La soglia di 6 GB liberi prima di aprire un caso GLB va bene. Se resti sotto soglia per più di un'ora, registra lo stato nel rapporto e
fermati: non ridurre il campione.

## Regole
Non modifichi il gioco; scrivi solo in `reports/codex/` e `tests/codex/`. Ogni rilievo è un'ipotesi finché il team non lo riproduce:
commit, `GAME_VERSION`, comando esatto, grezzo. Per chiudere i processi non usare mai il kill per schema di comando: trova i PID con
pgrep, controlla l'elenco e chiudi i singoli PID. Alla fine commit e push, verifica con `git ls-remote origin` e riepilogo in 10 righe.
