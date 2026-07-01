# Plugin & Skill per Elevora (Claude Code)

Come installare/attivare le skill richieste. **L'installazione dei plugin avviene nel client Claude Code
LOCALE** (una sessione remota/web non può scaricarli). La config `.claude/settings.json` di questo repo
*dichiara* i marketplace e i plugin: quando apri il progetto in locale, Claude Code ti chiede il "trust" e
poi te li propone/attiva automaticamente. Dopo modifiche: `/reload-plugins`.

## 1) Già INTEGRATI in Claude Code — nessuna installazione
- **`/code-review`** — review del diff corrente (bug + pulizia). Già disponibile.
- **`/security-review`** — review di sicurezza delle modifiche pendenti. Già disponibile.

## 2) Dichiarati in `.claude/settings.json` (marketplace GitHub) — attivazione 1-clic in locale
| Plugin | Repo marketplace | Cosa fa |
|--------|------------------|---------|
| **superpowers** | `obra/superpowers` | Framework di skill agentiche componibili (TDD, debug, brainstorming). |
| **claude-mem** | `thedotmack/claude-mem` | Memoria persistente tra sessioni (osservazioni compresse, su disco locale). |
| **gstack** | `garrytan/gstack` | Setup di Garry Tan: ~28 slash-command (modalità CEO/Designer/QA…). |

Se il client non li attiva da solo, installali a mano:
```
/plugin marketplace add obra/superpowers
/plugin install superpowers@superpowers

/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem@claude-mem

/plugin marketplace add garrytan/gstack
/plugin install gstack@gstack
```
> Nota: i nomi esatti di marketplace/plugin possono differire nel manifest di ciascun repo — se il client
> segnala un nome diverso, adegua la stringa (o correggi `.claude/settings.json`).

## 3) Dal marketplace ufficiale Anthropic — installa dal client
Non li ho messi in settings.json perché non ho verificato il repo esatto del marketplace ufficiale.
Cerca e installa dal client:
```
/plugin                      # apre il browser dei marketplace/plugin
/plugin install frontend-design@<marketplace-ufficiale>
/plugin install security-guidance@<marketplace-ufficiale>
```
- **frontend-design** — specialista UI/UX (React/Vue/Svelte).
- **security-guidance** — review di sicurezza inline a tre livelli (l'alternativa "plugin" di `/security-review`).

## Fonti
- https://code.claude.com/docs/en/discover-plugins
- https://code.claude.com/docs/en/settings
- https://github.com/obra/superpowers · https://github.com/thedotmack/claude-mem · https://github.com/garrytan/gstack
