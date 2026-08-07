# Plugin & Skill per Korward Elite

## Prima di aggiungere qualcosa: guarda cosa c'è già

Le capacità di sviluppo di questo progetto vivono in **10 Project Skill** in `.claude/skills/`, versionate col
repo e ancorate agli strumenti reali (gate, guardiani carriera, live-validator, action-sweep, analyzer…):

`architect` · `minimal-context` · `token-optimizer` · `patch-only` · `game-qa` · `auto-regression` ·
`performance-analyzer` · `production-ready` · `realism-reviewer` · `ui-reviewer`

Si caricano **su richiesta**: non pesano sul contesto finché non servono. L'indice sta in `CLAUDE.md`.

## Già integrati in Claude Code — nessuna installazione
- **`/code-review`** — review del diff corrente.
- **`/security-review`** — review di sicurezza delle modifiche pendenti.

## Plugin dichiarati in `.claude/settings.json`

| Plugin | Repo | Perché |
|---|---|---|
| **claude-mem** | `thedotmack/claude-mem` | memoria persistente tra sessioni. **Complementare**: le skill dicono *come* lavorare, la memoria ricorda *cosa* è successo. |

L'installazione avviene nel client Claude Code **locale** (una sessione remota non può scaricare i plugin).
Aprendo il progetto in locale ti viene chiesto il *trust* e poi l'attivazione. A mano:
```
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem@claude-mem
```

## Rimossi il 2026-08-07 (duplicavano le Project Skill)

- **`gstack`** (`garrytan/gstack`) — ~28 slash-command generici (modalità CEO/Designer/QA…). Coprono a grandi
  linee lo stesso terreno delle 10 skill, ma senza sapere nulla di questo repo: nessun comando del gate,
  nessun guardiano, nessuna delle trappole di misura già pagate. Due sistemi che dicono cose simili in modo
  diverso rendono ambigua la scelta e fanno perdere l'aggancio a quello giusto.
- **`superpowers`** (`obra/superpowers`) — framework di skill agentiche generiche (TDD, debug, brainstorming).
  Stesso motivo: diluisce la selezione fra molte skill generiche e dieci specifiche.

Non è un giudizio sui due progetti: è che qui il lavoro è troppo particolare (un file da 33.902 righe, un gate
da 25 minuti, un motore di partita 3D con invarianti propri) perché un set generico aggiunga qualcosa.

**Rimetterli è banale** se cambi idea — due voci in `extraKnownMarketplaces` e due in `enabledPlugins`; la
versione precedente del file sta nella storia git di `.claude/settings.json`.

## Fonti
- https://code.claude.com/docs/en/discover-plugins · https://code.claude.com/docs/en/settings
