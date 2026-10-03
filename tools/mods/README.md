# Mod di Claude Code per Carrier Manager

`cpm-guardie` (richiesta PO 03/10: «installiamo / usiamo mod») trasforma regole di CLAUDE.md in controlli automatici:

- **promozione su `main`** solo se l'ultima catena (completa, grafica o carriera) registrata in `docs/governo/STABILITA.json` per la `GAME_VERSION` attuale è tutta verde **e** il gioco (`src/`, `CARRIER-MANAGER-AV.html`) non è cambiato dopo il commit che l'ha registrata;
- **niente ricompilazione** (`tools/build-src.mjs`) mentre `ci-runner` è in corsa;
- **niente `pkill -f`**;
- **niente identificativi tecnici del modello** (`claude-…-N`) nei messaggi di commit;
- **riga di stato** con l'avanzamento della catena (dal log `ci*.log` più recente dello scratchpad);
- **comando `/rituali`**: versione, esito della catena, gioco cambiato o no, `main` allineato, modifiche non salvate, righe di roadmap aperte.

Installazione in una sessione Claude Code: copiare la cartella in `~/.claude/dev-mods/<sessione>/` (o avviare con `claude --plugin-dir tools/mods/cpm-guardie`). Verifica: `claude plugin validate tools/mods/cpm-guardie` e `claude plugin test tools/mods/cpm-guardie`.
