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
| sviluppo/fluidita-crediti-237 | — (archiviata) | giro 15 consegnato, integrato in 7.999.167; fonti dei Crediti chiuse in CREDITI-fonti.md, brusio passato al giro 20 | 14/10 19:13 |
| sviluppo/brusio-238 | — (archiviata) | giro 20 consegnato (3828d526, mirata 44/44), unito nella 7.999.169 | 15/10 01:38 |
| sviluppo/banco-highlight-248 | — (archiviata) | giro 21 consegnato: banco highlight e classifica dei 10 difetti → PO-252 | 14/10 22:10 |
| lavoro/168 (catene) | — (archiviata) | catena 168 fermata: la 168 confluisce nella 169 (DECISIONI 15/10 notte) | 15/10 01:38 |
| sviluppo/highlight-252 | session_01Brq2HExZZsPfAD63PGKF1M | giro 22 (Opus, base lavoro/168): correzioni PO-252 dal banco (piedi, pallone in rete, difesa, rinvio, portiere, build-up aereo) | 14/10 22:09 |
| lavoro/169 (catene) | — (archiviata) | catena notte 7.999.169: 66/67 verdi, rosso tabellino-228 (il braccio rosso non provoca più lo scarto: prova gol 0, coda 0; il verde coincide) | 15/10 07:37 |
| lavoro/169 (tabellino-228) | session_01J6cRx9Wa2M2uRA2MNQmhGh | riparazione del guardiano tabellino-228 e catena composta della 7.999.169 | 15/10 07:37 |
| sviluppo/decisioni-245 | session_012QkaFPeC79ueNDxWA7Dm5k | giro 23 (Opus, base lavoro/169): ingresso camminata vera, coppa resta dopo il prestito (eccezione zona G), avviso premi dopo l'intervista, oro da festa — **CONSEGNATO 15/10 08:26** (6689f739, mirata 79/81: i due rossi tabellino-228 e schede-246 preesistenti, verificati A/B sul build di partenza; RAPPORTO-giro23.md). Sessione archiviata. Si integra nella 7.999.170 dopo la pubblicazione della 169 | 15/10 02:18 |
| collaudo/release-7.999.169-3d | session_01Ls38GfasSgtV4p3WVarpfn | collaudo 3D della 7.999.169 (Sonnet): 6 partite vere GLB acceso, rapporto docs/collaudi/RAPPORTO-release-7.999.169-3d.md | 15/10 11:19 |
| collaudo/release-7.999.169-carriera | session_01Q2NhzGpzj95iBD5bxC8WBR | collaudo non 3D della 7.999.169 (Haiku): 3 settimane di carriera, rapporto docs/collaudi/RAPPORTO-release-7.999.169-carriera.md | 15/10 11:19 |
| sviluppo/procuratore-253 | session_019ikTfX6zSSZTa3h32kZsUT | giro 24 (Opus, base main 7.999.169): PO-253 cornice standard (ModalPannello) per «Il confronto» e «Il primo incontro» col procuratore, guardiano procuratore-253 | 15/10 12:03 |
| collaudo/difesa-220 | session_019Qtg7UiF1QCwk4U7VVyzEi | collaudo mirato PO-220 (Sonnet, sola misura, 7.999.169): eroe che non arriva sull'uomo ed esito che non torna col 3D, rapporto docs/collaudi/RAPPORTO-difesa-220.md | 15/10 12:33 |
| sviluppo/crediti-254 | session_01T3Fg6V1xKqjcahLVWg5Vqv | giro 25 (Opus, base 7.999.169): PO-254 pulsante del kit «Crediti» in home e contenuto allineato a CREDITI-fonti.md | 15/10 12:35 |
| sviluppo/statistiche-difesa-228 | — (archiviata) | giro 16 consegnato (3c969fb7): PO-228 + PO-220, mirata 50/52 (nomi-219 rosso per campione, riparato dal giro 18); da unire nella 7.999.169 | 14/10 23:37 |
| sviluppo/scene-gesti-022 | — (archiviata) | giro 17 consegnato (7239fb2), unito in lavoro/169; resta aperto il cross #64/#126 | 14/10 22:20 |
| collaudo/release-164 | — (archiviata) | collaudo 164 consegnato → PO-242…247 | 14/10 17:55 |
| collaudo/release-165 | — (archiviata) | collaudo 165 consegnato → PO-242…247; PO-233 verificata | 14/10 17:55 |
| collaudo/release-166 | — (archiviata) | collaudo 166 consegnato: PO-239 verificata, PO-240(a) verificata, nuove PO-250/251 | 14/10 22:10 |
| sviluppo/ripartenza-207 | — (archiviata) | giro 18 consegnato (eab20b3c): PO-207 ripartenza dal centro + nomi-219 riparato, mirata 21/21 verde; da riunire nella 7.999.169 (toglie la deroga) | 15/10 00:37 |
| sviluppo/rilievi-collaudo-242 | — (archiviata) | giro 19 consegnato (7dbc7207), unito nella 7.999.169 | 15/10 01:38 |
| sviluppo/classifica-194-migrazione | — (archiviata) | giro 13 consegnato, integrato in 7.999.167 (lavoro/167) | 14/10 17:55 |
| collaudo/sessione-collaudatrice-161 | — | giro 9b consegnato (PO-230 finestre 6/10 per valori, PO-231 1 partita su 3); sessione archiviata | 13/10 |
| collaudo/partite-vere | — | giro 6 consegnato (64ec3f21, PO-228 k1-k10); sessione archiviata | 12/10 09:31 |
| rilascio/consolidamento | session_014HLUniWew7ZSpQGjqGXUDb | giro 5 (base 7.999.160): prontezza finale per il 17/10 (dist, copyright, sito, voci aperte del giro 3, partita completa senza errori) | giro 6: verifica sul sito dopo la pubblicazione |


7.999.169 in costruzione su lavoro/169 (5c065d90): giro 17 unito; giri 18-20 uniti ma con catena ancora in corso sulle loro sessioni, da riunire alle consegne finali prima della build. Giro 18 sviluppo/ripartenza-207 (PO-207 + nomi-219: toglie la deroga), giro 19 sviluppo/rilievi-collaudo-242, giro 20 sviluppo/brusio-238; giro 16 sviluppo/statistiche-difesa-228 ancora in catena. Nota catene 14/10: catena notte della 7.999.167 interrotta da due riavvii del container (15:59, 17:36 UTC), rilanciata come giro composto (20 passi già verdi, CPM_CI_FATTI) in /tmp/claude-0/n167-notte3.out; prima parte in /tmp/claude-0/n167-notte.out (worktree /home/user/cm-167). Nota catene 13/10: il rilascio spostato a ~18:30 (decisione PO) scrive /tmp/claude-0/n163-mirata.out; prima /tmp/claude-0/n162-mirata.out (gli agenti in copia separata non lanciano browser dalle 10:00 UTC finché quel file non contiene FINE).