# Verifica della 7.999.198 — parte V2d

Ramo `sviluppo/verifica198-v2d`, partito da `prova/198-finale` (0f0b13d8 = lavoro/198 + giri 293–296, 298–302).
Controlli eseguiti uno alla volta (`CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), tetto 30 minuti l'uno.
Nessuna correzione: solo esiti. Base di confronto per i rossi: `lavoro/198` (b3b75b9d).

| controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|
| rassegna-232 | VERDE (27/27, rossi G232 e G239 bocciati 2/2) | — | — | 653 s, exit 0 |
| carriera3-94 | VERDE | — | — | 161 s, exit 0 |
| contatto-103 | VERDE (4 parate, 0 difetti; rosso di prova visibile: 2 D3 su 4) | — | — | 827 s, exit 0 |
| colori-286 | VERDE (rosso di prova visibile: 7 difetti) | — | — | 882 s, exit 0 |
| corpi-073 | INSTABILE: corsa 1 ROSSA (braccio 284f, seme 29: codice 001 in 14/18 campioni di 1 apertura su 6, «primo scatto del pallone a 35,8 u»), corsa 2 VERDE (282, 283, 284f) | VERDE 2/2 (solo braccio 284f, quello rosso; 282 e 283 non rieseguiti perché verdi su finale) | non attribuito: su 2 corse la base non lo riproduce, ma anche finale è verde 1 volta su 2; interruttori G293–G302 non provati (servirebbero molte corse per braccio) | La misura «primo scatto del pallone a 35,8 u dal punto» (seme 29, 1/6) compare anche sulla base (corsa 1): l'apertura lontana esiste già prima dell'unione; il codice 001 visto solo su finale corsa 1. 433 s + 441 s |
| stat-279 | VERDE (20 partite, teste distinte 19/20, numeri incoerenti 0) | — | — | 41 s, exit 0 |
| cross-218 | VERDE (40 azioni-cross, 0 contraddizioni su 200; rosso di prova visibile) | — | — | 178 s, exit 0 |
| ripresa-202 | VERDE (14 riprese, all'eroe 0; rosso di prova visibile) | — | — | 599 s, exit 0 |
| interazioni-226 | ROSSO: braccio C, le due partite verdi NON FINITE entro il tetto di 300 s (p0 0-1, p1 4-2; schede, fatti e motore a posto). Bracci A (motore, 312 partite) e B (panchina 400/400) a posto | ROSSO IDENTICO (solo braccio C, `CPM_SOLO_BROWSER=1`): verde p0 0-1 e p1 4-2 NON FINITE, stessi punteggi e stesse schede | nessuno: non nasce dall'unione (la base lo riproduce uguale) | 1463 s, exit 1 su finale; anche il rosso p1 non finita. Una sola corsa per lato: esito identico al dettaglio, non trattato come instabile |
| conduci-242 | VERDE (saved/wide/blocked; rosso di prova visibile) | — | — | 84 s, exit 0 |
| esiti-241 | VERDE (chance e fallo cercato concordi; rossi di prova visibili, compreso G102) | — | — | 332 s, exit 0 |
| spazio-270 | VERDE (telefono e pc; rosso di prova visibile: 14 px) | — | — | 587 s, exit 0 |
| camera-241 | NON ESEGUITO (tetto di tempo) | — | — | da eseguire |
| rassegna-202 | NON ESEGUITO (tetto di tempo) | — | — | da eseguire |
| avviso3d-209 | NON ESEGUITO (tetto di tempo) | — | — | da eseguire |
| riproduci-187 | NON ESEGUITO (tetto di tempo) | — | — | da eseguire |

## Riepilogo

- Tutti i 16 nomi esistono in `tests/visual/package.json`.
- Eseguiti 12 su 16 in circa 2 ore e 25 minuti: **10 verdi, 1 instabile (corpi-073), 1 rosso (interazioni-226)**.
- **interazioni-226**: rosso su finale e rosso identico sulla base `lavoro/198` (stesse due partite non finite entro 300 s, stessi punteggi) → **non nasce dall'unione**. Nessun controllo oltre i 30 minuti (questo è arrivato a 24 min 23 s).
- **corpi-073**: su finale 1 corsa rossa e 1 verde; sulla base 2 corse verdi del solo braccio 284f. Con così poche corse non si può dire se l'unione lo peggiora: l'origine resta **non attribuita** e gli interruttori `__CPM_NO_G293…G302` non sono stati provati.
- Quattro controlli non eseguiti per il tetto di tempo: camera-241, rassegna-202, avviso3d-209, riproduci-187. «Non giudicato» = rosso.
- Nessuna correzione fatta, nessuna soglia toccata, `GAME_VERSION` invariata. Nessuna foto di altri giri rigenerata in `docs/`.

## Verdetto

**V2d pronto: NO** — un rosso (già presente sulla base), un instabile da attribuire e quattro controlli ancora da eseguire.
