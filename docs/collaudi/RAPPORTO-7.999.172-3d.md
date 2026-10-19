# Rapporto collaudo 3D — CPM 7.999.172 (ramo `collaudo/7.999.172-3d`)

Collaudo eseguito il 19/10/2026 sul build di `main` (a8f7fb3, `GAME_VERSION` 7.999.172), headless Chromium, foto a 412×915, GLB-ON dove la sonda lo prevede. Nessun codice di prodotto modificato.
Strumenti: i guardiani nominati nelle righe del BACKLOG (`ingresso-277`, `pallone-278`, `inquadra-273`, `salti-274`, `memoria-275`, `pillola-58`, `match-full`, `esiti-241-partite`). Log grezzi riportati sotto in sintesi.

## Esito per punto

| Punto | Esito | Prova |
|---|---|---|
| PO-277 salta ingresso | OK | `ingresso-277` bracci SALTA: clic a 5,4 s → uscita a 5,8 s, corpi pronti alla fine; SALTA-SECCO: uscita 5,4 s, attesa dopo 7,8 s; pulsante presente. Foto `ingresso-277-pulsante.png` |
| PO-277 durata ~24 s | NON VERIFICABILE in headless | durata dichiarata 23,96 s (rosso 38,51 s); durata misurata 319,9 s perché il tempo di scena headless scorre a una frazione del reale (nota CLAUDE.md) |
| PO-277 corpi durante l'ingresso | DIFETTO (vedi D1) | braccio verde: «a fine ingresso i corpi non sono pronti (la partita aspetta)», corpiS 22,2 |
| PO-278 pallone più piccolo/nitido | PARZIALE (D2) | rapporto pallone/uomo: ingresso 0,142 · partita 0,193 · hl0 0,139 · hl40 0,151 (rosso 0,25/0,26/0,17/0,19); il verde-partita supera il limite 0,19 di 0,003 |
| PO-273 eroe in quadro sulla volée | NON CONCLUSO | `inquadra-273` fermato dal tetto dei 580 s; sulla scena volée (p2 32') hl_intro 0/1 e hl_choose 0/2 fuori quadro, ma hl_result 22/86 fotogrammi fuori (25%, h 0,053) |
| PO-274 pallone senza salti | OK | `salti-274`: salti scoperti in conclusione 0, non spiegati 0 (3 conclusioni col pallone lontano, vmax 34,5 u/s) |
| PO-275 memoria dalla 2ª partita | OK | `memoria-275` PASS: scene 1, renderer 2→2, corpi animati 830→830, heap dopo GC 374 MB. Residuo dichiarato dal guardiano: 395→483 MB, Object3D 11819→23256 con gli agganci `__CPM*` presenti (col collaudo attivo) |
| PO-276 file all'ingresso | NON VERIFICATO | nessuna sonda dedicata eseguita |
| Giro 58 pillola d'esito | OK | `pillola-58` verde e rosso visibile: «⚽ GOL!» a 915 e 740 px, distanza dal tabellone 19 px (rosso: 0 / −12) |
| 3 partite intere | PARZIALE | `match-full`: partite 1 e 2 fischio al 90', ultimo highlight 86', fine per clock, 177 e 188 s reali; la 3ª non conclusa per il tetto di tempo (vedi D3) |
| Esiti/cronaca (`esiti-241-partite`) | OK | exit 0; coppie esito↔testo↔3D coerenti sulle righe lette |

## Difetti per gravità

| # | Gravità | Descrizione | Prova |
|---|---|---|---|
| D1 | media | Ingresso (PO-277): a fine ingresso i corpi GLB non risultano pronti e la partita attende (corpiS 22,2). Da confermare su dispositivo: in headless il tempo di scena è lento | `ingresso-277` ❌ «verde: a fine ingresso i corpi non sono pronti» |
| D2 | bassa | Pallone in partita a 0,193 del giocatore, 0,003 oltre la soglia [0,08; 0,19]; il giocatore è piccolo (50 px) e il pallone 9,7 px | `pallone-278` ❌ `verde-partita`; foto `verde-partita.png` |
| D3 | bassa (non confermata) | 3ª partita di `match-full` non conclusa: il tetto di 590 s è stato raggiunto con due sonde in parallelo su 4 core. Non è provato che sia un difetto del gioco | `match-full` partita 3 «non conclusa», exit 124 |
| D4 | bassa | Volée (PO-273): in hl_result l'eroe è fuori quadro nel 25% dei fotogrammi sulla scena osservata | `inquadra-273` riga p2 32' |

## Non verificato

- Durata reale dell'ingresso (~24 s) su dispositivo: headless non è giudicabile.
- PO-276 (file all'ingresso): nessuna prova eseguita.
- PO-273: la sonda non è arrivata alla chiusura (timeout); verdetto solo parziale.
- Terza partita intera e festa finale (gol/cerimonia): non osservate; nessun giro con tre partite complete sullo stesso build.
- Foto percettive GLB-ON dei gesti: non prodotte oltre quelle in `foto-7.999.172-3d/`.
- Memoria su telefono: misurata solo in headless con GC forzato dalla sonda.
