# VALIDATORS.md — Remaining Validators

Validator **pianificati** del catalogo LMQP (complemento di `VALIDATORS.md`, che contiene quelli già specificati). Per ciascuno si userà la **stessa struttura** dei validator `LMV-001..LMV-013`.

> ⚠️ **Gap noto:** in `VALIDATORS.md` sono specificati **LMV-001…LMV-012**; **LMV-013 non è ancora stato fornito** (referenziato qui sotto ma assente dal catalogo).
>
> ℹ️ **LMV-018 (Protezione del Pallone)** è già coperto da **LMV-011** (stessa Situation, ora specificato in `VALIDATORS.md` come *Tentativo di Protezione del Pallone*) → da considerare **assorbito/ridondante** in questa lista.

## Planned Validators

| ID | Nome | Categoria (presunta) |
|---|---|---|
| **LMV-013** | *(non ancora fornito)* | — |
| **LMV-014** | Tentativo di Lancio Lungo | Costruzione del gioco |
| **LMV-015** | Tentativo di Cambio di Gioco | Costruzione del gioco |
| **LMV-016** | Tentativo di Triangolazione | Costruzione offensiva |
| **LMV-017** | Tentativo di Uno-Due | Costruzione offensiva |
| **LMV-018** | ~~Tentativo di Protezione del Pallone~~ → assorbito da **LMV-011** | Possesso |
| **LMV-019** | Tentativo di Smarcamento | Movimento offensivo |
| **LMV-020** | Tentativo di Inserimento | Movimento offensivo |
| **LMV-021** | Tentativo di Attacco della Profondità | Movimento offensivo |
| **LMV-022** | Tentativo di Finalizzazione Ravvicinata | Finalizzazione |
| **LMV-023** | Tentativo di Conclusione dalla Distanza | Finalizzazione |
| **LMV-024** | Tentativo di Pressing Alto | Transizione difensiva |
| **LMV-025** | Tentativo di Calcio di Punizione | Palla inattiva |
| **LMV-026** | Tentativo di Calcio di Rigore | Palla inattiva |
| **LMV-027** | Tentativo di Calcio d'Angolo | Palla inattiva |
| **LMV-028** | Tentativo di Rimessa Laterale | Palla inattiva |
| **LMV-029** | Tentativo di Lancio del Portiere (NPC) | Palla inattiva / NPC |
| **LMV-030** | Tentativo di Salvataggio Difensivo (NPC) | Fase difensiva / NPC |

Per ciascun validator utilizzare la stessa struttura dei validator `LMV-001..LMV-013` (Identificativo · Categoria · Priorità · Scopo · Definizione · Situazioni compatibili/non · Timeline · Outcome · Ball/Player/Camera/Motion/Semantic/Football-Intelligence/Narrative Validator · Errori critici · Suggerimenti automatici · Definition of Done).

---

## Note di copertura (intenti già nel motore)

Diversi validator pianificati hanno già un **intento** corrispondente in `deriveIntent` (sorgente unica dell'intenzione) o un'esecuzione nel Decision Engine — utile come punto di partenza:

- LMV-014 Lancio Lungo → intento `through`/`switch` (lancio) · LMV-015 Cambio di Gioco → `switch` · LMV-016/017 Triangolazione/Uno-Due → `onetwo` (give_and_go/wall_pass) · LMV-020/021 Inserimento/Profondità → `insertion`/`through` · LMV-024 Pressing Alto → `recover` + AI off-ball (F2/F3/F11) · LMV-025/026 Punizione/Rigore → `freekick`/`penalty` (F6) · LMV-027 Corner → insertion aerea.
- Senza mappatura diretta (da progettare): LMV-018 Protezione · LMV-019 Smarcamento · LMV-028 Rimessa laterale · LMV-029/030 NPC (lancio portiere / salvataggio difensivo) — questi ultimi richiedono highlight con **protagonista NPC**, oggi non previsti dal flusso (l'highlight è incentrato sull'eroe).
