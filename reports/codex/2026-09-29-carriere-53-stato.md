# Stato del collaudo carriere 7.999.53 — 29 settembre 2026

Ramo: `codex/2026-09-29-carriere-53`. Base: commit `54e6047ed67042c25970af2ab050b3422404c914`, `GAME_VERSION="7.999.53"`. Nessun file del gioco è stato modificato.

| Punto | Risultato salvato | Stato |
|---|---|---|
| Zero presenze, rinnovo UI | Semi 0 e 3: 8 stagioni ciascuno, 5 stagioni complessive a zero presenze; seme 30: checkpoint a S3/W1; seme 33 non iniziato | parziale |
| Seme 30 S16/W1 | checkpoint a S3/W1 con RNG; apertura S16/W1 non raggiunta | non verificato |
| Reload seme 2 S3/W1 | 38 percorsi diversi nello snapshot; schermate contaminate da overlay | snapshot verificato, impatto UI non verificato |
| Diario e allenatori | due carriere di 8 stagioni; UI sintetica: 8 stagioni navigabili e 4 allenatori/4 righe | verifica mista, limiti nel rapporto |
| Ingresso in campo | 5 partite, GPU Intel D3D11, 17 intervalli rAF >50 ms | verificato con ingresso forzato |
| Rigori | 6/7 tiri catturati, 18 PNG; personaggi invisibili nel percorso forzato | parziale, serie naturale non verificata |

Le prove grafiche lunghe sono state spezzate in processi isolati: durante una serie con più partite la RAM libera era scesa a 0,64 GB; il seme 30 è stato fermato dopo il checkpoint a circa 1,19 GB. Non avviare simultaneamente altri Chrome di test su questa macchina. Per riprendere il seme 30 leggere `reports/codex/2026-09-29-seme30-apertura.md` e usare `tests/codex/career-seed30-checkpoint.json`.

Il comando `node tools/build-src.mjs --check` suggerito da `AGENTS.md` non è eseguibile in questa checkout: `tools/build-src.mjs` e la directory `tools/` sono assenti. Il controllo di allineamento HTML/sorgenti è quindi non verificato. La sintassi degli script e il parsing dei JSON sono stati verificati con `node --check tests/codex/*.mjs` sui quattro script usati e `ConvertFrom-Json` sui sei JSON di rapporto.
