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
| sviluppo/haiku-l7-pulizia-l8 | session_01TWi2N2kwUYkRxctMCmEej1 | giro 6: copyright (catena grafica 29/29 verde, career-critical in corsa) | giro 7: finestre per gli altri riquadri con scelta del censimento PO-224 (procuratore, «La tua storia», risposte «Sono pronto»), e la finestra non deve aprirsi sotto un altro dialogo · PO-072 pulizia · L8 cerimonie |
| collaudo/sessione-collaudatrice | session_015a5h1EPvMCRD1YrHGLjcmz | giro 6: PO-222 su carriere naturali (solo misura), dialoghi che coprono la finestra PO-224 | giro 7: collaudo della correzione PO-218 (7.999.159) |
| collaudo/partite-vere | session_0125jiks7a4pgkJe2Gbc3FBj | giro 3: PO-220 clip del gesto difensivo (25 scene GLB), PO-218 cross in partita vera | giro 4: T3 PO-221 gol dell'eroe dopo la ritaratura (7.999.159) |
| rilascio/consolidamento | session_01Mz5Dm5tYpjta6BaUzsoN8a | giro 3: esiti diversi con lo stesso seme, contesto grafico perso, classifica 194, bozza di prontezza finale | giro 4: prontezza finale sul candidato al rilascio del 17/10 |
