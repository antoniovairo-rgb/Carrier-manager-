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
| sviluppo/haiku-l7-pulizia-l8 | session_0116kmELic75jmWxmFs7UWE3 | giro 8 (OPUS 5.5, base 7.999.160): PO-229 uno-due gi38 dichiarato assist ma non giocato; ripresa di L7 (giro 7 non unito: movimento-147 rosso 3/3 sulla build contro 1/2 su main) | giro 9: salti del build-up gi12/gi21, passaggio→consegna gi79 |
| collaudo/sessione-collaudatrice | session_016rUizzrTBXKfvAYsaDHBmK | giro 9 (Haiku, base 7.999.161 sul ramo poc): PO-230 tutte le finestre in primo piano a 360/412 px con o senza cornice standard; PO-231 intervista in 3 partite giocate come un giocatore | 12/10 08:56 |
| collaudo/partite-vere | session_01FLeQryE3KJBRcDzuy1aqsB | giro 6 (Haiku, build main 7.999.160): PO-228 righe Passaggi/Cross all'86' su k1-k10 e confronto col riferimento | 12/10 08:56 |
| rilascio/consolidamento | session_014HLUniWew7ZSpQGjqGXUDb | giro 5 (base 7.999.160): prontezza finale per il 17/10 (dist, copyright, sito, voci aperte del giro 3, partita completa senza errori) | giro 6: verifica sul sito dopo la pubblicazione |
