# Giro 281 — riparazione di `render-3d-023` (rosso nato nella 7.999.197)

- **Base:** `lavoro/197` a `51862a1e`; ramo `sviluppo/giro281-render3d`. Base 196: worktree `../w196` su `3076a1b7`, `node_modules` collegato.
- **Toccato:** solo `tests/visual/render-3d-023.mjs` (righe 41-46). `src/` e `GAME_VERSION` intatti; soglie invariate.

## Misura prima della correzione

Sonda usa-e-getta (scratchpad, non committata) sulla 197:
- al `DOMContentLoaded` `#root` ha **già 1 figlio** (`div.cpm-root`): l'app monta prima del DCL;
- dopo 15 s i pulsanti in pagina sono `Nuova carriera`, `Crediti`, `Home`, `Rivedi intro`, `Importa`, `Opzioni`.

**Causa:** la sonda armava il `MutationObserver` su `#root` solo al DCL. Sulla 197 il figlio c'è già e non arriva più nessuna mutazione: `__T023.home` non veniva mai scritto e la sonda si fermava dopo 120 s.

**Secondo inciampo (le maiuscole): non c'è.** Il testo del DOM è «Nuova carriera»; il maiuscolo viene dal CSS. In ogni caso `clickByText` (`lib/harness.mjs:160`) usa `new RegExp(s, 'i')`, che non bada alle maiuscole. Non serviva cambiarlo e non l'ho cambiato.

## Correzione

All'arrivo del DCL la sonda controlla subito se `#root` ha figli. Se li ha, segna la home in quel momento. Se non li ha, arma l'osservatore come prima. Sulla 196 (`#root` vuoto al DCL) il percorso è identico a quello di prima.

## Esiti

| Build | Sonda | Esito | home | corpi pronti | fps medi · p95 | heap (MB) | crescita |
|---|---|---|---|---|---|---|---|
| 196 (V1d) | vecchia | rosso | 8131 ms | — | — | 1498,6 al 1° campione | — |
| 197 prima (V1d, 2 prove) | vecchia | rosso 2/2 | timeout 120 s (r. 54) | — | — | — | — |
| 197 dopo, 1ª | nuova | **verde** | 371 ms | 8378 ms | 19,2 · 150 ms | 202,9 → 189,4 | −13,5 |
| 197 dopo, 2ª | nuova | **verde** | 383 ms | 7834 ms | 19,3 · 167 ms | 198,8 → 191,3 | −7,5 |
| 196 | nuova | **verde** | 9003 ms | 8180 ms | 18,3 · 217 ms | 480,7 → 369,9 | −110,8 |
| 197 braccio rosso (`CPM_ROSSO023=1`) | nuova | rosso (uscita 1, atteso) | — | — | 1,8 · 1900 ms | — | +124,8 |

Righe di verdetto: 197 `✅ RENDER 3D entro i pavimenti headless (caricamento, fps, memoria, Three r128)` (2/2). 196 stessa riga. Braccio rosso `❌ RENDER 3D (braccio rosso) — 3 problemi` (fps, p95, crescita heap).

Altri controlli sulla 197 (`tests/visual`, `CPM_CHROME=/opt/pw-browsers/chromium`, uno alla volta):
- `test:logic`: 51 pass, 0 fail;
- `save-compat`: 12 pass, 0 fail, ✅ PASS.

**Classificazione:** il rosso della 197 era della **sonda**, non del gioco. Con la sonda nuova `render-3d-023` arriva alla misura sulla 197 ed è verde 2/2. Non c'è quindi nessun «heap > 700» da dichiarare.

## Dubbi per il PO

1. **Heap della 196 non riprodotto.** In V1d la 196 era rossa per «heap 1498,6 MB > 700» al primo campione. In questo giro, con la stessa build, il primo campione è 480,7 MB. La sonda nuova non cambia nulla sul percorso della 196 (`#root` vuoto al DCL). Il picco di V1d sembra quindi variabile fra le prove, ma con una prova sola **non posso confermarlo**.
2. **Il «caricamento home» della 197 è ora 371-383 ms contro 9003 ms della 196.** È coerente con la pagina già tradotta in node (invariante giro 237: niente Babel nel browser). Il numero misura però dall'inizio della navigazione al DCL, e con l'app montata prima del DCL una parte del tempo di montaggio potrebbe non essere contata. Il pavimento (60 s) resta comunque lontanissimo.
3. **Texture e geometrie:** la 197 ha 932 texture e 929 geometrie, la 196 ne ha 1968 e 1093, con lo stesso numero di corpi (23). L'ho solo osservato, non l'ho indagato. È un calo, non una crescita, e nessuna soglia lo giudica.
