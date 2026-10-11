# Giro 3 · Punto 2 — avviso «[CPM-GL] contesto grafico perso»

**Esito: 0 avvisi su 5 partite 3D.** Non riprodotto in questa misura. Non posso confermare né la frequenza sul telefono né il recupero automatico in background: questa sonda non lo copre.

## Metodo
- Base: `origin/main` 7.999.158, worktree `/tmp/cpm`, sorgente ricomposta. Nessun file del gioco modificato.
- Sonda: `docs/rilascio/giro3-probe-gl.mjs` (copia in `tests/visual/`). Pagina nuova per partita, salvataggio `save-190-s12-ovr93.json`, viewport 375×812, GLB di default (nessun `__CPM_GLB`), `?cpmtest=1`, autoplay `seeded` seme 2021, `tickMs` 150, fino alla fase `ceremony`.
- Registrato per partita: avvisi console che contengono `[CPM-GL]`, contatori `window.__CPM_GLLOST` e `window.__CPM_GLRESTORED`, errori di pagina, durata reale.
- Log: `docs/rilascio/giro3-gl-run.log`; riepilogo e screenshot finali in `docs/rilascio/giro3-gl-out/`.

## Risultati

| Partita | Fase finale | Durata reale | Punteggio | Avvisi `[CPM-GL]` | `__CPM_GLLOST` | `__CPM_GLRESTORED` | Errori di pagina |
|---|---|---|---|---|---|---|---|
| 1 | ceremony | 276 s | 3-1 | 0 | 0 | 0 | 0 |
| 2 | ceremony | 274 s | 1-0 | 0 | 0 | 0 | 0 |
| 3 | ceremony | 273 s | 0-0 | 0 | 0 | 0 | 0 |
| 4 | ceremony | 271 s | 1-0 | 0 | 0 | 0 | 0 |
| 5 | ceremony | 276 s | 2-0 | 0 | 0 | 0 | 0 |

## Riferimenti nel codice (verificati)
- Il gestore della perdita: `CARRIER-MANAGER-AV.html:13285-13286` (`webglcontextlost`, `preventDefault`, contatore `__CPM_GLLOST`, avviso `console.warn` con il testo «[CPM-GL] contesto grafico perso»).
- Il gestore del ripristino: `CARRIER-MANAGER-AV.html:13287` (`webglcontextrestored`, contatore `__CPM_GLRESTORED`, evento `cpm-gl-restored`).
- Il rimontaggio della scena al ripristino: `CARRIER-MANAGER-AV.html:29080-29088` (`setGlbTry` su `cpm-gl-restored`).

## Cosa NON è confermato
- **Frequenza sul telefono**: non misurata. Qui 0 su 5.
- **Recupero in background dopo 15 s** (la segnalazione del PO del 29/09): non testato. La sonda non porta la scheda in background né forza la perdita.
- **Perdita reale del contesto**: nessuna in 5 partite. Per provare il percorso di ripristino servirebbe la revoca forzata (`WEBGL_lose_context`), come nel rapporto del 7.535 (`docs/RELEASE_HISTORY.md`, voce «Il contesto grafico può morire»). Non è stata eseguita in questo giro.
- **Avviso comparso nel giro 2 su 375 px**: il rapporto del giro 2 (`docs/rilascio/PRONTEZZA.md`, punto 375 px) riporta un avviso `[CPM-GL]` in una partita, da una sonda diversa e su build già diversa. Non riprodotto qui; non posso confermare le condizioni di quel caso.
