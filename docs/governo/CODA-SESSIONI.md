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

## Stato al 11/10 mattina

| Ramo | Sessione | In corso | Prossimi |
|---|---|---|---|
| sviluppo/haiku-l7-pulizia-l8 | session_01TWi2N2kwUYkRxctMCmEej1 | giro 6: copyright (derby e soprannomi reali, blocklist, migration nomi) | giro 7: finestre anche per gli altri riquadri con scelta del censimento PO-224 (procuratore boutique/global, «La tua storia», risposte «Sono pronto») SOLO dopo che la 7.999.158 è su main · PO-072 pulizia · L8 cerimonie |
| collaudo/sessione-collaudatrice | session_018YWJuye6oyJrHkpk1dSm6R | giro 5: finestre PO-224, ingresso PO-225, «Finta e tiro» PO-218 sulla 7.999.158 | giro 6: collaudo della correzione PO-218 quando esce · PO-222 «non convocato» solo misura |
| collaudo/partite-vere | session_017Kakyh6bnZh5mBCNR1bSpv | T2 PO-221 su 7.999.158 (60 partite + rosso) e PO-220 clip | giro 3: PO-220 dopo la correzione del gesto difensivo · PO-218 cross in partita vera |
| rilascio/consolidamento | session_013YLrzJPhyhbyc9u9wq17qs | giro 2: bloccanti B-E, prontezza su 7.999.158 | giro 3: prontezza finale sul candidato al rilascio del 17/10 (stesse 5 voci) |
