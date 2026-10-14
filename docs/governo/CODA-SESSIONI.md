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
| sviluppo/portiere-lato-229 | — (archiviata) | giro 12 CONSEGNATO (rapporto docs/sviluppo/RAPPORTO-giro12.md, mirata 48/49, nomi-219 rosso da verificare): da integrare dopo la catena della 7.999.165 | 14/10 08:32 |
| sviluppo/schede-convocazione-234 | — (archiviata) | giro 14 consegnato, integrato in 7.999.167 (lavoro/167) | 14/10 17:55 |
| sviluppo/fluidita-crediti-237 | session_01ExgJwjbt3LXJiv3DywYD3K (in attesa delle fonti dei crediti dal PO) | giro 15 consegnato, integrato in 7.999.167; 8 fonti dei Crediti da completare dal PO; prossimo: PO-241 | 14/10 17:55 |
| sviluppo/statistiche-difesa-228 | session_01QMZrKUvYLkvfzuhdFecwAv | giro 16 (Opus, base 7.999.165): PO-228 ritaratura dal ramo sviluppo/ritaratura-228 + verifica dal vivo, PO-220 chiusure difensive | 14/10 10:02 |
| sviluppo/scene-gesti-022 | session_01AcPBcxRGtnHXYkP1AXshuf | giro 17 (Opus, base 7.999.165): PO-022 scene dal motore, PO-068 gesti, PO-123/143 | 14/10 10:02 |
| collaudo/release-164 | — (archiviata) | collaudo 164 consegnato → PO-242…247 | 14/10 17:55 |
| collaudo/release-165 | — (archiviata) | collaudo 165 consegnato → PO-242…247; PO-233 verificata | 14/10 17:55 |
| sviluppo/ripartenza-207 | session_01NcXJF4S452JcXzff5Wq76G | giro 18 (Opus, base lavoro/166): PO-207 ripartenza dal centro rotta dal seme (7.999.162), guardiano nomi-219 instabile da riparare | 14/10 17:51 |
| sviluppo/rilievi-collaudo-242 | session_012sqMa4vt2dahDVE1YdbPjV | giro 19 (Opus, base lavoro/167): PO-242…247 dai collaudi 164/165 | 14/10 17:56 |
| sviluppo/classifica-194-migrazione | — (archiviata) | giro 13 consegnato, integrato in 7.999.167 (lavoro/167) | 14/10 17:55 |
| collaudo/sessione-collaudatrice-161 | — | giro 9b consegnato (PO-230 finestre 6/10 per valori, PO-231 1 partita su 3); sessione archiviata | 13/10 |
| collaudo/partite-vere | — | giro 6 consegnato (64ec3f21, PO-228 k1-k10); sessione archiviata | 12/10 09:31 |
| rilascio/consolidamento | session_014HLUniWew7ZSpQGjqGXUDb | giro 5 (base 7.999.160): prontezza finale per il 17/10 (dist, copyright, sito, voci aperte del giro 3, partita completa senza errori) | giro 6: verifica sul sito dopo la pubblicazione |


Nota catene 14/10: catena notte della 7.999.167 in /tmp/claude-0/n167-notte.out (worktree /home/user/cm-167). Nota catene 13/10: il rilascio spostato a ~18:30 (decisione PO) scrive /tmp/claude-0/n163-mirata.out; prima /tmp/claude-0/n162-mirata.out (gli agenti in copia separata non lanciano browser dalle 10:00 UTC finché quel file non contiene FINE).