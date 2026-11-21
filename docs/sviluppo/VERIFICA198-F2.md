# Verifica FINALE della 7.999.198 — parte F2

**Verdetto: IN CORSO** (si scrive in fondo, a controlli finiti).

- Build verificato: `prova/198-finale`, commit `6b79812c` (giri 293–296, 298–302 + correzioni 304 tunnel, 305 scatto del pallone, 306 sonda testi-190).
- Ramo di lavoro: `sviluppo/verifica198-f2`. Il ramo esisteva già sul remoto (rapporto del 19/11 su highlight-95, build `086cdba9`): niente force push, il build di partenza è stato portato dentro con un'unione (commit `1ced46d`). L'albero dei file è identico a `6b79812c` salvo questo rapporto (`git diff --stat 6b79812c HEAD` = solo `docs/sviluppo/VERIFICA198-F2.md`). Il rapporto del 19/11 resta nella storia del ramo (commit `d665d1e`).
- Base per i confronti dei rossi: `lavoro/198`, commit `b3b75b9d`.
- Banco: sessione cloud, 16 GB di memoria, 59 GB liberi su disco; controlli uno alla volta (`CPM_CI_PAR=0`), `CPM_CHROME=/opt/pw-browsers/chromium`, da `tests/visual`. Orari in UTC, notte fra 20 e 21/11/2026.

## Tabella

| controllo | esito | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|
| test:logic | VERDE | — | — | 51 prove su 51, 0 fallite, 3 s |
| save-compat | VERDE | — | — | 12 passati, 0 falliti, 9 s; nota informativa dello strumento sulla seconda migrazione (dichiarata benigna dallo strumento stesso) |
| testi-190 (2 corse) | VERDE · VERDE | — | — | entrambe 15 ok · 0 ko, 132 s e 133 s; sottotitoli letti 39 su 45 (soglia dello strumento: al più 7 mancanti), consigli tagliati 0 |
| rosa-angoli-299 | VERDE | — | — | braccio verde: 0 controlli falliti su 24; braccio rosso: cade su A, B e C; non giudicati 0; 632 s |
| ritocchi-302 | VERDE | — | — | verde: A, B (contrasto 14,79), C 756/756; rosso: cade su A (1), B (31), C (7); 62 s. Ha rigenerato foto in `docs/sviluppo/giro302/`: rimesse con `git restore` |
| home-298 | VERDE | — | — | verde sulle 3 risoluzioni; rosso con `__CPM_NO_G298`: tornano tutti e cinque i difetti (63 rilievi); 121 s |
| prepartita-pc-300 | VERDE | — | — | braccio verde verde; braccio rosso: cade su Apc, Atel, Bpc, Cpc, Dpc, Dtel (15 rilievi); 130 s |
| rigori-296 | VERDE | — | — | parti A + B + C verdi, i rossi si vedono; cerimonie chiuse dal timer a 18,5–20,2 s (previsto 17,5 s), «salta» 3,8 s; 1014 s. Nella parte C il braccio rosso «compagno» ha avuto bisogno di più tentativi interni allo strumento (dichiarati nel registro) |
