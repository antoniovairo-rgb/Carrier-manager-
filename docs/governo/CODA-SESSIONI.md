# Coda delle sessioni parallele (letta dalla routine oraria)

La routine `trig_0151Hi6Bgbec84nyWuU48Qcz` legge questo file a ogni giro. Per ogni ramo: sessione attiva, compito in corso, prossimi compiti in ordine. Quando una sessione è ferma e ha consegnato, la routine:
1. legge la consegna sul ramo e la registra in CODA-CODEX.md;
2. integra quello che va integrato;
3. archivia la sessione;
4. la ricrea dal suo ramo con il primo compito «prossimo», spostandolo in «in corso».

Ramo principale del team: `poc/marioprada-character-system`. Promozione su `main` solo dalla sessione principale, a catene verdi.

## Regole di integrazione dei rami (decisione PO 11/10: «il coordinamento dei rami deve essere una routine»)
- **Rami di collaudo e rilascio** (`collaudo/sessione-collaudatrice`, `collaudo/partite-vere`, `rilascio/consolidamento`): non si uniscono al ramo principale. Si leggono i rapporti e i rilievi entrano nel BACKLOG o in CODA-CODEX. Sonde utili si copiano in `tests/visual` solo se diventano guardiani.
- **Ramo di sviluppo** (`sviluppo/haiku-l7-pulizia-l8`):
  - si unisce al ramo principale con `git merge --no-ff` solo se:
    - il rapporto del giro dichiara la catena grafica verde;
    - il ramo è già allineato al ramo principale (rebase fatto dalla sviluppatrice);
    - non tocca il motore della partita.
  - Dopo l'unione: build, `check-src`, catena carriera, catena completa in primo piano, poi promozione nei rituali.
  - Conflitti: non si risolvono alla cieca. La sviluppatrice viene ricreata con l'istruzione di riallinearsi.
- **Mai durante una catena in corsa** sul ramo principale: l'unione aspetta la fine della catena.

## Stato al 11/10 pomeriggio (routine 13:20)

| Ramo | Sessione | In corso | Prossimi |
|---|---|---|---|
| sviluppo/haiku-l7-pulizia-l8 | session_01Fdz5JvKvHGc626fpAgbWu4 | giro 7 (dal 11/10 sera, base 7.999.159): L7 schermate a 360/375/412 px, solo presentazione, guardiano l7-schermate | giro 8: da decidere dopo la consegna |
| collaudo/sessione-collaudatrice | session_018kvYnJ5sfmW6ZRE1VYykto | giro 7 (base 7.999.159): PO-227 fila dell'ingresso (zona B, prima) e PO-226 censimento delle interazioni in partita (zona A) | giro 8: collaudo delle correzioni PO-226/227 |
| collaudo/partite-vere | session_01XGv117bHVAJtE92cW7UabR | giro 4 (base 7.999.159): PO-228 statistiche di fine partita su 20 partite vere, come nasce ogni voce | giro 5: ri-misura dopo la ritaratura |
| rilascio/consolidamento | session_01AKVcV43WsiJFJQFUf2KXMX | giro 4b (base 7.999.159; il giro 4 si era fermato a 5/60 con 4 crash del browser girando 4 partite in parallelo: ora 2 alla volta, browser nuovo per partita): PO-221 T3 su 60 partite (scene, gol, assist, punizioni), MATCH_TICK_MS 1700 contro 900 | giro 5: prontezza finale per il 17/10 |
