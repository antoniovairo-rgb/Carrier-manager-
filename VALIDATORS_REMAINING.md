# VALIDATORS.md — Remaining Validators

Validator **pianificati** del catalogo LMQP (complemento di `VALIDATORS.md`, che contiene quelli già specificati). Per ciascuno si userà la **stessa struttura** dei validator `LMV-001..LMV-013`.

> ℹ️ In `VALIDATORS.md` sono ora specificati **LMV-001…LMV-019**.
>
> ℹ️ **Numerazione:** la "Protezione del Pallone" del backlog originale è stata assorbita in **LMV-011**; gli ID successivi sono quindi **scalati** (es. Smarcamento→LMV-018, Inserimento→LMV-019). Per evitare disallineamenti, il backlog qui sotto è **per nome**: l'ID definitivo viene assegnato dal proprietario alla fornitura del validator.

## Planned Validators (backlog per nome — ID assegnato alla fornitura)

Residui ancora da specificare (10):

- Tentativo di Attacco della Profondità *(movimento offensivo)*
- Tentativo di Finalizzazione Ravvicinata *(finalizzazione)*
- Tentativo di Conclusione dalla Distanza *(finalizzazione)*
- Tentativo di Pressing Alto *(transizione difensiva)*
- Tentativo di Calcio di Punizione *(palla inattiva)*
- Tentativo di Calcio di Rigore *(palla inattiva)*
- Tentativo di Calcio d'Angolo *(palla inattiva)*
- Tentativo di Rimessa Laterale *(palla inattiva)*
- Tentativo di Lancio del Portiere — NPC *(palla inattiva / NPC)*
- Tentativo di Salvataggio Difensivo — NPC *(fase difensiva / NPC)*

Già assorbiti/specificati dal backlog originale: Uno-Due → **LMV-017** · Protezione del Pallone → **LMV-011** · Smarcamento → **LMV-018** · Inserimento → **LMV-019** · Lancio Lungo → **LMV-014** · Cambio di Gioco → **LMV-015** · Triangolazione → **LMV-016**.

Per ciascun validator utilizzare la stessa struttura dei validator `LMV-001..LMV-019` (Identificativo · Categoria · Priorità · Scopo · Definizione · Situazioni compatibili/non · Timeline · Outcome · controlli per validator · Errori critici · Suggerimenti automatici · Definition of Done).

---

## Note di copertura (intenti già nel motore)

Diversi validator pianificati hanno già un **intento** corrispondente in `deriveIntent` (sorgente unica dell'intenzione) o un'esecuzione nel Decision Engine — utile come punto di partenza:

- LMV-014 Lancio Lungo → intento `through`/`switch` (lancio) · LMV-015 Cambio di Gioco → `switch` · LMV-016/017 Triangolazione/Uno-Due → `onetwo` (give_and_go/wall_pass) · LMV-020/021 Inserimento/Profondità → `insertion`/`through` · LMV-024 Pressing Alto → `recover` + AI off-ball (F2/F3/F11) · LMV-025/026 Punizione/Rigore → `freekick`/`penalty` (F6) · LMV-027 Corner → insertion aerea.
- Senza mappatura diretta (da progettare): LMV-018 Protezione · LMV-019 Smarcamento · LMV-028 Rimessa laterale · LMV-029/030 NPC (lancio portiere / salvataggio difensivo) — questi ultimi richiedono highlight con **protagonista NPC**, oggi non previsti dal flusso (l'highlight è incentrato sull'eroe).
