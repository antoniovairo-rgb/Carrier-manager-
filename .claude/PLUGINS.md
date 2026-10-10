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

## Valutazione del 10/10/2026 (richiesta PO): plugin «claude-code-setup» e skill dell'immagine «Build Your Team»

Metodo: ho applicato a mano la skill `claude-automation-recommender` del plugin (testo pubblico in
`anthropics/claude-plugins-official/plugins/claude-code-setup`), perché il plugin non è attivo sull'account.
Profilo rilevato: gioco in file unico (React 18.2 UMD, Three r128, Babel 7.23 nel browser), 21 frammenti `src/*.jsx`,
banco Playwright con 335 sonde/guardiani in `tests/visual`, 3 workflow GitHub, 10 Project Skill, hook di Stop sul git.

| Proposta del metodo | Esito per questo progetto |
|---|---|
| MCP **Playwright** | NO: il banco Playwright del repo c'e' gia' ed e' ancorato ai testimoni del gioco. |
| MCP **context7** (documentazione per versione) | FORSE: utile per le API di Three r128 e React 18.2, che sono vecchie. Server remoto: non posso confermare che la rete della sessione cloud lo raggiunga. Da provare solo se serve. |
| MCP **GitHub** | NO: `gh api` basta per quello che facciamo. |
| Skill **frontend-design** (Anthropic) | SI', da provare: per la sessione sviluppatrice sulle schermate L7 (home, analisi pre-partita). Deve restare sotto le regole di `ui-reviewer` (token TH/FS/FW/RAD, 412×915). |
| Skill nuova di progetto **coordina-sessioni** | SI' (da scrivere): i testi d'incarico di collaudatrice e sviluppatrice, le regole di consegna (push dopo ogni commit, commit fisso, «Non posso confermarlo»), la ricreazione delle sessioni. Oggi stanno solo nei prompt. |
| Hook **PostToolUse** dopo un Edit su `src/*.jsx` | SI' (da valutare): controllo di sintassi del solo frammento toccato, molto piu' rapido della build. Oggi un errore si vede solo a `build-src`. |
| Subagent code-reviewer / performance / ui | NO: gia' coperti da `/code-review`, `performance-analyzer`, `ui-reviewer`. |
| **Superpowers** e varianti | NO: rimosso il 07/08 per lo stesso motivo (duplica le Project Skill). |

Immagine «Build Your Team»: marketing, social e piccola impresa non riguardano il progetto. Fra sviluppo e design:
Superpowers (no, vedi sopra), Context7 (forse), MCP Builder (no: non costruiamo server MCP), Skill Creator (gia'
disponibile come skill di sistema), Claude-Mem (gia' dichiarato qui sopra), Frontend Design (si', da provare),
UI UX Pro Max / Taste / Brand Guidelines / Web Artifacts: non posso confermarne il contenuto (non sono nel catalogo
Anthropic che ho consultato) e il progetto ha gia' token e guardiano `design-system`.
