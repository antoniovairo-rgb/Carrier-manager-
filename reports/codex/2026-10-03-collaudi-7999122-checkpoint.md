# Checkpoint collaudi 7.999.122 — 3 ottobre 2026

- Base verificata: `origin/main` e `HEAD` `9632ef5e389d1f673b8b8c54e3d9c2f8015a1dde`; `GAME_VERSION="7.999.122"` letto in `src/07-versione-save-interviste.jsx` con `rg -n -m 1 'const GAME_VERSION=' src/07-versione-save-interviste.jsx`.
- Ramo: `codex/2026-10-03-collaudi-7999122`. Il checkout è stato completato con Git LFS smudge disattivato; nessun file del gioco modificato.
- Preparazione: verificata la presenza di `tests/visual/fixtures/save-190-s12-ovr93.json`, `tests/visual/rigori-190.mjs` e `tests/visual/debito-190.mjs`. I compiti A–E della nuova scheda **non sono stati ancora eseguiti** su questo ramo.
- Arresto per risorse: `node -p "(require('os').freemem()/1073741824).toFixed(2)"` ha dato 3,37 GB e poi 3,35 GB; la soglia richiesta è 3,5 GB. Nessun Chromium aperto per la nuova scheda, nessun campione ridotto.
- Ripresa: quando la memoria torna sopra soglia con margine, avviare per primo il confronto PO-190 sulle 30 partite vissute, braccio normale e rosso, salvando ogni partita nel grezzo. Il risultato della fase A è **non verificato**.
- Ricognizione a basso carico: la fixture è direttamente un oggetto `{phase,player,savedAt,saveVersion}` con `player.season=12`, `player.week=38`; la voce di lega da giocare è `calendar[{matchday:34,week:38,opponentId:'new',opponentName:'FC Tyneside',isHome:false,played:false}]`. Verifica: `node -e "const p=require('./tests/visual/fixtures/save-190-s12-ovr93.json').player;console.log(p.calendar.filter(x=>x.week===38))"`.
- Per variare l'avversario senza falsare l'anti-duplicato, lo script dovrà rinominare in ogni copia sia la voce di `calendar` W38 sia le voci corrispondenti di `matchHistory`; `getThisWeekMatchday` controlla anche storico stagionale, avversario e sede in `src/18-career-app.jsx:767-807`. Questa è preparazione del banco, non una misura dell'esito.
- Secondo controllo della memoria: `node -p "(require('os').freemem()/1073741824).toFixed(2)"` ha dato 3,26 GB. Nessun test con Chromium è stato lanciato.

## Preparazione successiva, sempre senza Chromium

Le dipendenze di `tests/visual` sono state installate con `npm install --offline --ignore-scripts --no-audit --no-fund` (12 pacchetti). I guardiani Node PO-190 hanno prodotto verde/rosso `0,10/0,40` per il debito e `0,11/0,53` rigori a squadra per partita; comandi e output sono in `reports/codex/2026-10-03-po190.{md,json}`. La sonda delle 30 coppie vissute ha passato il controllo a secco della fixture, ma nessuna partita è stata avviata.

Le tre sonde esterne per B (ricarica), C (passaggi) e D (testa) sono state adattate alla 7.999.122 in `tests/codex/`. `node --check` ha passato tutte e tre. Il comando `node tests/codex/collaudo-passaggi.mjs; node tests/codex/collaudo-testa-conduzione.mjs; node tests/codex/salvataggio-ricarica.mjs` ha prodotto rispettivamente `RAM 3.39 GiB prima del browser`, `Pausa: RAM libera sotto 3,5 GB`, `RAM libera sotto 3,5 GiB prima del browser`. Ogni sonda ha salvato un grezzo compresso con zero casi e non ha aperto Chromium. **B, C e D non sono misurati**; questi sono soltanto controlli di avvio.
