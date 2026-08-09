# Sistema Procuratore — analisi e piano d'evoluzione

> Regola #2 della direttiva PO: **prima analisi, poi implementazione**. Questo documento è
> l'inventario di ciò che esiste davvero, la mappa di cosa va esteso e cosa manca, e il piano
> incrementale. Nessuna riga di gioco è stata toccata prima di scriverlo.

## 1. Cosa esiste GIÀ (e non va riscritto)

L'inventario contraddice in parte la premessa «l'attuale Procuratore è troppo funzionale»: non è
poco — è **molto**, ma è tutto meccanico e niente è relazione.

| Cosa | Dove / come | Stato |
|---|---|---|
| **Esistenza dell'agente** | `player.hasAgent` (bool), con migration additiva già presente | ✅ da riusare come sorgente di verità |
| **Costo d'ingaggio** | card «Nessun agente»: `fee = max(500, stipendio settimanale)`, pagato da `bankBalance` | ✅ **il gate economico della §2 esiste già** |
| **Commissione ricorrente** | ledger settimanale: 10% dello stipendio, **8%** con agenzia boutique | ✅ |
| **Identità** | `AGENT_NAMES` (8 nomi), scelto in modo deterministico da `hashStr(player.name)` | ⚠️ c'è un nome, non una scelta |
| **Stile agenzia** | `player.agentStyle` ∈ `boutique` \| `global`, scelto una volta (`agentStyleView`) | ⚠️ è un perk, non una personalità |
| **Piano stagionale** | `agentPlanFor(p)` → obiettivo di valutazione; `agentPlanOutcome(p)` → esito narrativo + popolarità | ✅ da riusare |
| **Incarichi settimanali** | `player.agentTask` ∈ `rinnovo` \| `immagine` \| `silenzio` \| `cerca_offerte`, con effetti reali | ✅ da riusare |
| **Effetti sul mercato** | `agentSearchBoost` +0.15 sulla probabilità d'offerta; `agentMult` +15% sullo stipendio offerto; clausola ×1.12 | ✅ |
| **Bonus rinnovo** | `agentRenewalBonus`, accumula fino a +30% | ✅ |
| **Eventi che citano l'agente** | ~6 voci in `WEEKLY_EVENTS` con `cond: p=>!!p.hasAgent` | ✅ **event engine riusabile: non ne serve un secondo** |
| **Sponsor** | `player.sponsors[]` `{tier,brand,weekly,season}`, proposte a fasce, servizi fotografici, `sponsorEvS` | ✅ **esiste: va collegato, non ricreato** |
| **Reputazione** | `popularity` (sorgente unica, ~330 riferimenti) | ✅ **niente seconda reputazione** |
| **Umore** | `morale`, `form`, `coachTrust` | ✅ **niente secondo sistema umore** |
| **Diario / notifiche** | `player.diary[]`, `notify(...)` | ✅ |
| **Persistenza** | migration additiva in `CareerApp` (`if(!('campo' in newP))…`) | ✅ pattern già stabilito |

## 2. Cosa MANCA davvero

Sette cose, e sono tutte *relazionali*, non meccaniche:

1. **Scelta e catalogo** (§19, §20) — il procuratore non si sceglie: il nome è derivato.
2. **Rapporto** (§17, §22, §23) — nessuno stato di relazione, quindi non può deteriorarsi né valere.
3. **Memoria** (§10) — nessuna dichiarazione conservata.
4. **Ambizioni** (§9) — il gioco non sa cosa vuole l'Eroe.
5. **Confronto periodico** (§6, §7, §8) — non esiste un dialogo.
6. **Iniziativa narrativa** (§12–§16) — le opportunità arrivano, ma senza voce e senza le tre fasi
   della §14 (si informa → l'interesse è concreto → c'è un'offerta).
7. **Cambio procuratore** (§21, §23, §25, §26).

E una che il PO chiede ma che **esiste già a metà**: il **reminder di sblocco** (§2–§4). La
condizione economica c'è (`fee` vs `bankBalance`), ma è passiva: la card sta lì e non ti avvisa.

## 3. Vincoli d'architettura

- **File unico**, nessun file JS separato.
- `hasAgent` resta la **sorgente di verità** per tutta la logica esistente: il nuovo oggetto
  relazione gli sta **accanto**, non al posto. Se il nuovo oggetto manca, il gioco si comporta
  esattamente come oggi.
- Persistenza **additiva** con migration, come `foot`/`bankBalance`: nessun campo obbligatorio
  nuovo che rompa i salvataggi esistenti.
- I pezzi decisionali (chi propone cosa, che consiglio dare) vanno scritti **puri e testabili in
  node**, come `goalContext`/`pickCelebration` del Celebration System: è ciò che rende il sistema
  estendibile senza rimettere le mani nell'UI.
- Il gate visivo è **cieco sulla carriera**: ogni release qui richiede anche
  `career-invariants.mjs`, `stab-nat-trigger-test.mjs`, `career-sim-test.mjs` e
  `tripath-chokepoint-test.mjs`.

## 4. Piano incrementale

Sei release, ognuna autonoma, ognuna con il suo guardiano. Nessuna rompe la precedente.

| # | Contenuto | Direttiva | Rischio regressione |
|---|---|---|---|
| **R1** | `player.agent = {id,name,archetype,since,rapport,memory:{ambitions,statements},lastCheckin}` + migration da `hasAgent`/`agentStyle` + funzioni pure `agentRoster`/`agentAdvice` | §17, §18 (dati) | basso — additivo |
| **R2** | Reminder di sblocco: rilevazione della prima disponibilità, evento una-tantum, ri-proposta intelligente sui trigger (mercato, interesse, rinnovo, primo sponsor) | §2, §3, §4 | basso |
| **R3** | Ingaggio narrativo + domanda sulle ambizioni → memoria | §5, §9, §10 | medio (tocca il flusso d'ingaggio) |
| **R4** | Confronto periodico ogni 4-5 mesi, che legge morale/minuti/ruolo/contratto già esistenti | §6, §7, §8, §11 | basso |
| **R5** | Iniziativa: sponsor, mercato a tre fasi, contratto — tutti sopra i sistemi esistenti | §12–§16 | medio (tocca il mercato) |
| **R6** | Catalogo, cambio procuratore, rapporto che si deteriora, memoria che NON passa al successore | §19–§27 | medio |

**R1 parte per prima** perché tutto il resto vi si appoggia, ed è la sola che non cambia
nessun comportamento osservabile: se il giocatore non fa nulla di nuovo, il gioco è identico.

## 5. Cosa NON farò

- Nessuna seconda economia, reputazione, mercato, contratti, umore, event engine.
- Nessuna riscrittura di `agentPlanFor` / `agentTask` / ledger: funzionano.
- Nessun costo artificiale sul cambio procuratore (§24) — la struttura contrattuale dell'agente
  non esiste e non serve inventarla.
