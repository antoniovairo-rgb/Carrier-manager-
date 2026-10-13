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
| sviluppo/portiere-lato-229 | session_013RTfCkGDnzqzfsfXKpbfrg | giro 12 (Opus, base 7.999.164): PO-229 portiere che sceglie il lato sbagliato a pochi fotogrammi (gk-miss-229 rosso 2/2 in catena carica, 13/10). Giro 11 (PO-218 cross, PO-209/211) archiviato e integrato in b3c654f6 | 14/10 01:36 |
| collaudo/sessione-collaudatrice-161 | — | giro 9b consegnato (PO-230 finestre 6/10 per valori, PO-231 1 partita su 3); sessione archiviata | 13/10 |
| collaudo/partite-vere | — | giro 6 consegnato (64ec3f21, PO-228 k1-k10); sessione archiviata | 12/10 09:31 |
| rilascio/consolidamento | session_014HLUniWew7ZSpQGjqGXUDb | giro 5 (base 7.999.160): prontezza finale per il 17/10 (dist, copyright, sito, voci aperte del giro 3, partita completa senza errori) | giro 6: verifica sul sito dopo la pubblicazione |


Nota catene 13/10: il rilascio spostato a ~18:30 (decisione PO) scrive /tmp/claude-0/n163-mirata.out; prima /tmp/claude-0/n162-mirata.out (gli agenti in copia separata non lanciano browser dalle 10:00 UTC finché quel file non contiene FINE).