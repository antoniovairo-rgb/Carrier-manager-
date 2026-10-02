# PO-077 / PO-079 — risultati parziali prima del banco 7.999.105

Base verificata: `2208f4cb707d42bd25854ab710584e5c8f79f4fa`, `GAME_VERSION=7.999.103`. Dati: `tests/codex/collaudo-testa-conduzione.json.gz`; elaborazione riproducibile: `node tests/codex/testa-conduzione-analisi.mjs`, che produce `reports/codex/2026-10-02-testa-conduzione-misure.json`. Pagina nuova per caso, 412×915, GLB/presentazione/cinema attivi. Sono risultati **parziali**: 12 casi di testa e un caso etichettato dribbling, non l'intera matrice richiesta.

| Caso | Fatto misurato | Giudizio limitato |
| --- | --- | --- |
| gi171, testa, success, ripetizioni 0–2 | Distanza minima pallone–testa 0,566 / 0,565 / 0,563 u; picco dello stacco 591 ms dopo il minimo, 3/3. | Oltre la soglia di 150 ms richiesta: **sincronia non superata** in questi tre casi. La causa resta un'ipotesi finché il team non riproduce. Foto: [contatto r0](collaudo-testa-conduzione/gi171-a0-success-r0-04-contatto.png). |
| gi18, azione «🌀 Dribbling netto», success, ripetizione 0 | L'esito forzato coincide con `ActionResolved`, ma il tipo derivato dall'applicazione è `pass`, non `dribble`. | Questo caso non misura la conduzione né prova che l'eroe perda il pallone durante un dribbling. L'incoerenza fra etichetta e tipo è verificata nei dati del caso. |

Per gi6, 7, 55, 64, 86 e 90 sono disponibili solo parte delle ripetizioni/esiti: nessun verdetto complessivo. Il gi39 non offriva un'azione di testa nel catalogo runtime e non è stato sostituito. I passi del pallone oltre 2 u per campione nel JSON sono movimenti grezzi, non automaticamente teletrasporti. PO-077, PO-079 e l'aggiunta restano **non conclusi**.
