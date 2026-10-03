# Checkpoint collaudi 7.999.122 — 3 ottobre 2026

- Base verificata: `origin/main` e `HEAD` `9632ef5e389d1f673b8b8c54e3d9c2f8015a1dde`; `GAME_VERSION="7.999.122"` letto in `src/07-versione-save-interviste.jsx` con `rg -n -m 1 'const GAME_VERSION=' src/07-versione-save-interviste.jsx`.
- Ramo: `codex/2026-10-03-collaudi-7999122`. Il checkout è stato completato con Git LFS smudge disattivato; nessun file del gioco modificato.
- Preparazione: verificata la presenza di `tests/visual/fixtures/save-190-s12-ovr93.json`, `tests/visual/rigori-190.mjs` e `tests/visual/debito-190.mjs`. I compiti A–E della nuova scheda **non sono stati ancora eseguiti** su questo ramo.
- Arresto per risorse: `node -p "(require('os').freemem()/1073741824).toFixed(2)"` ha dato 3,37 GB e poi 3,35 GB; la soglia richiesta è 3,5 GB. Nessun Chromium aperto per la nuova scheda, nessun campione ridotto.
- Ripresa: quando la memoria torna sopra soglia con margine, avviare per primo il confronto PO-190 sulle 30 partite vissute, braccio normale e rosso, salvando ogni partita nel grezzo. Il risultato della fase A è **non verificato**.
