# Prompt per Codex — Completare la fase 1 delle carriere (PO-153, base per PO-154…157)

Decisione del PO del 01/10: **Codex completa ora la fase 1**. Il tuo collaudo del 01/10 (`reports/codex/2026-10-collaudo-carriere.md`, ramo `codex/2026-10-collaudo-carriere`, su 7.999.86) ha coperto 14 carriere × 10 stagioni e ha dichiarato non eseguiti diversi punti. Questo giro chiude quei buchi sulla build attuale. La scheda completa resta `reports/codex/PROMPT-2026-09-30-collaudo-carriere.md`: metriche, invarianti e formato del rapporto sono quelli. Qui c'è solo cosa manca.

## Base
- Ramo `main`, ultimo commit (deve essere ≥ 7.999.94: contiene le correzioni su fine prestito `parentClub` e lega del club dopo prestito + promozione/retrocessione). Scrivi commit e `GAME_VERSION`.
- Scrivi SOLO in `reports/codex/` e `tests/codex/`; pusha SOLO sul ramo `codex/2026-10-01-carriere-fase1`. Non toccare `src/`, `tools/`, altri test, `main`.
- Riusa il tuo `tests/codex/career-matrix.mjs` (dal ramo `codex/2026-10-collaudo-carriere`).

## Cosa manca e va fatto
1. **Campione**: arrivare ad almeno **30 carriere × 10 stagioni** (le 14 di prima più 16 nuove, oppure 30 nuove sulla build attuale: dichiara quale). Copri tutti i ruoli, compresi **portiere e difensore** (prima: 2 difensori, 0 portieri).
2. **Percorso naturale**: almeno 10 carriere create dal **percorso normale di creazione** (nessun ruolo o valore iniziale iniettato), per misurare la difficoltà vera. Le altre possono restare sintetiche: dichiara per ognuna.
3. **6 carriere fino al ritiro** (2 deboli, 2 medie, 2 forti).
4. **20 coppie biforcate**: stesso salvataggio, una scelta diversa (intervista, offerta, investimento), poi 2 stagioni: cosa cambia (morale, fiducia, popolarità, offerte, ruolo in rosa, eventi).
5. **Gemelli economici**: 5 coppie, stessa carriera, una con staff/accademia/investimenti attivi e una senza; differenze di OVR, infortuni, popolarità, conto a fine 5 stagioni.
6. **Impulsi ed eventi (per PO-154)**: per ogni impulso/evento mostrato, registra id, condizione dichiarata (se c'è), stagione/settimana, e se si ripete; conta quanti si ripetono identici, quanti non hanno condizione, quanti hanno un seguito nelle settimane dopo.
7. **Nazionale (per PO-155)**: età e OVR alla prima convocazione, presenze per stagione, convocazioni con OVR alto e presenze 0 (prima: seme 8, OVR 96, 0 presenze). Il test usava `__CPM_SIM_NAT=1`: dichiara se lo usi e cosa cambia senza.
8. **Difficoltà (per PO-156)**: per fascia (gavetta 17-20, affermazione 21-25, élite 26-30, declino 31+): voto medio, gol+assist per partita, titolare %, trofei, quante carriere diventano «dominanti» e quando.
9. **Economia e Ufficio (per PO-157)**: per ogni voce dell'Ufficio, se ha un effetto misurabile entro 2 stagioni (sì/no/non verificato), e quali voci non vengono mai usate.
10. **Ricontrolla** sulle carriere nuove: errori JS `parentClub` (dovrebbero essere 0) e scarti GF/GA in classifica (dovrebbero essere 0; se ne trovi, prima settimana e squadre come nel rapporto `2026-10-01-classifica-gol`).

## Rapporto
`reports/codex/2026-10-01-carriere-fase1.md`, stessa struttura del rapporto del 01/10, più: una sezione per ciascuno dei punti 4-9 con tabella e le 3 osservazioni più importanti; il confronto con il rapporto su 7.999.86 per le anomalie già viste. Grezzo in `tests/codex/carriere-fase1.json.gz`.

## Regole
Italiano. Non inventare: «non verificato» se un dato manca o se il campione non basta. Le cause restano ipotesi finché il team non le riproduce; nessuna patch al gioco. Niente credenziali di terzi. Nessuna conclusione su fluidità o FPS.
