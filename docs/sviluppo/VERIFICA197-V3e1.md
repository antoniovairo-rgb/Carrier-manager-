# Verifica di rilascio 7.999.197 — blocco V3e1

- Build verificato: `a81ebb10` (lavoro/197, build finale del lotto), ricomposto con `tools/build-src.mjs` e confermato da `tools/check-src.mjs` («IDENTICO BYTE PER BYTE», allineato a HEAD).
- Confronto: 7.999.196 pubblicata (`3076a1b7`) in un worktree separato `../w196`, stessa procedura.
- Modo: `npm run -s <nome>` in `tests/visual`, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`, un controllo alla volta, tetto 40 min (`timeout 2400`), sulla 196 tetto 60 min dopo un «oltre tetto». `free -m` e `df -h` prima di ogni corsa (memoria libera ≥ 10,9 GB, disco 26-27 GB liberi in tutte le corsa).
- Nessun file di `src/` o `tests/` modificato. Foto in `docs/` rimesse con `git checkout -- docs/` dopo ogni controllo.

## Esiti

| controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga del controllo |
|---|---|---|---|---|---|
| riserva-103 | verde (688 s) | — | — | **verde** | `✓ riserva-103 VERDE (e il rosso si vede)` |
| riserva-104 | rosso (671 s) | rosso (673 s) | verde | **NATO nella 197** | `✗ riserva-104 ROSSO` |
| assist-nome-98 | oltre tetto (2400 s) | oltre tetto (2400 s) | oltre tetto (3600 s) | **oltre tetto** (anche sulla 196) | 2ª: `verde d4 seme 77 fine ceremony scene 10` · 196: `rosso assist seme 1234 fine playing scene 3` |

## Note per controllo

### riserva-104 — NATO nella 197
Sulla 197, in entrambe le corse, il braccio VERDE passa ma il braccio ROSSO non fa più comparire il difetto, quindi il guardiano si dichiara cieco:
```
VERDE  highlight 5 · richiami altrui intercettati 1 · D3 riserva 0
ROSSO  highlight 5 · richiami altrui 33 · D3 riserva 0
✗ rosso: nessun D3 — il difetto non si vede, il guardiano non giudica
✗ riserva-104 ROSSO
```
(2ª corsa identica salvo «richiami altrui 32».) Sulla 196 lo stesso controllo giudica 7 highlight e il rosso produce 2 casi D3 («Contrasto pulito senza fallo», «Punizione a giro»), esito `✓ riserva-104 VERDE`.
Osservazione, non diagnosi: sulla 197 gli highlight giocati sono 5 contro 7 sulla 196. Non posso confermare se il rosso sia dovuto a un difetto del gioco o alla sonda che non provoca più la situazione; per la regola «non giudicato = rosso» resta un rosso nato nella 197.

### assist-nome-98 — oltre tetto, anche sulla 196
- 197, 1ª e 2ª corsa: uccise dal tetto a 40 min ancora dentro la parte A del braccio verde (la 2ª era arrivata a `verde d4 seme 77`, cioè la 197 prova più semi per il caso D4 rispetto alla 196).
- 196: a 60 min aveva finito il braccio verde (A e B) e la parte C del rosso, ed era alla prima partita della parte A del rosso. Nel braccio verde della 196 la parte B riporta già `D7: «Chiudi la stagione» non raggiunto`: il controllo sarebbe probabilmente finito rosso anche sulla 196, ma non arrivando alla fine non posso confermarlo.
- Nota di metodo: la prima corsa sulla 196 è stata interrotta dal limite di 2 ore del processo in sottofondo che conteneva l'intera catena (non dal tetto del controllo); è stata rifatta da capo, da sola, col tetto di 60 min. Il numero riportato è quello della corsa rifatta.
- Scelta lasciata al PO: con un tetto di 40-60 min questo controllo non si può giudicare in una sessione cloud; serve un tetto più lungo o le parti separate (`CPM_PARTI`).
