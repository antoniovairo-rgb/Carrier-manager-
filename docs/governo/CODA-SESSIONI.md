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
| sviluppo/highlight-252 | — (archiviata) | giro 22 consegnato (69d5fb6): 6 voci PO-252 corrette (piedi, rete, difesa, rinvio, portiere, aereo) con interruttori e guardiani; piedi ancora sopra la soglia del banco (117/117); mirata 47/48, rosso nomi-219 misurato non suo (94,7% col fix, 84,6% coi rossi) → 7.999.171 | 14/10 22:09 |
| lavoro/169 (catene) | — (archiviata) | catena notte 7.999.169: 66/67 verdi, rosso tabellino-228 (il braccio rosso non provoca più lo scarto: prova gol 0, coda 0; il verde coincide) | 15/10 07:37 |
| lavoro/169 (tabellino-228) | session_01J6cRx9Wa2M2uRA2MNQmhGh | riparazione del guardiano tabellino-228 e catena composta della 7.999.169 | 15/10 07:37 |
| sviluppo/decisioni-245 | session_012QkaFPeC79ueNDxWA7Dm5k | giro 23 (Opus, base lavoro/169): ingresso camminata vera, coppa resta dopo il prestito (eccezione zona G), avviso premi dopo l'intervista, oro da festa — **CONSEGNATO 15/10 08:26** (6689f739, mirata 79/81: i due rossi tabellino-228 e schede-246 preesistenti, verificati A/B sul build di partenza; RAPPORTO-giro23.md). Sessione archiviata. Si integra nella 7.999.170 dopo la pubblicazione della 169 | 15/10 02:18 |
| collaudo/release-7.999.169-3d | session_01Ls38GfasSgtV4p3WVarpfn | collaudo 3D della 7.999.169 (Sonnet): 6 partite vere GLB acceso, rapporto docs/collaudi/RAPPORTO-release-7.999.169-3d.md | 15/10 11:19 |
| collaudo/release-7.999.169-carriera | session_01Q2NhzGpzj95iBD5bxC8WBR | collaudo non 3D della 7.999.169 (Haiku): 3 settimane di carriera, rapporto docs/collaudi/RAPPORTO-release-7.999.169-carriera.md — CONSEGNATO 15/10 12:02 (3233289): 2 alti (badge PROD/TEST → PO-255; Fonte da completare → PO-254), 1 medio (toast sopra «Il confronto» → PO-256); PO-243/244 non raggiunti. Sessione archiviata | 15/10 11:19 |
| sviluppo/procuratore-253 | session_019ikTfX6zSSZTa3h32kZsUT | giro 24 (Opus, base main 7.999.169): PO-253 cornice standard (ModalPannello) per «Il confronto» e «Il primo incontro» col procuratore, guardiano procuratore-253 — CONSEGNATO 15/10 12:35 (bb1097e4, guardiano e controlli verdi, catena completa da fare all'integrazione). Sessione archiviata | 15/10 12:03 |
| collaudo/difesa-220 | session_019Qtg7UiF1QCwk4U7VVyzEi | collaudo mirato PO-220 (Sonnet, sola misura, 7.999.169): eroe che non arriva sull'uomo ed esito che non torna col 3D, rapporto docs/collaudi/RAPPORTO-difesa-220.md | 15/10 12:33 |
| sviluppo/crediti-254 | session_01T3Fg6V1xKqjcahLVWg5Vqv | giro 25 (Opus, base 7.999.169): PO-254 pulsante del kit «Crediti» in home e contenuto allineato a CREDITI-fonti.md | 15/10 12:35 |
| sviluppo/badge-toast-255 | session_016CgyD1NFeY3QaTGeoHZ9L1 | giro 26 (Opus, base 7.999.169): PO-255 badge solo «v x.y.z» senza PROD/TEST; PO-256 i toast aspettano la chiusura dei Modal | 15/10 12:40 |
| sviluppo/taccuino-169 | session_01SySqniugzQPDaeLz9MDzqG | giro 27 (Opus, base 7.999.169): taccuino PO 15/10 — PO-207 rigore senza ripartenza dal centro, PO-257 finta 000, PO-258 punizione 111 (coordinato col giro 22) | 15/10 12:41 |
| collaudo/mirato-169 | session_01TEJ851pZn5jfY4EEQwUWCF | collaudo mirato 7.999.169 (Haiku, sola misura): A) statistiche su 20 partite (PO-228), B) intervista dopo la Nazionale (PO-243), C) giornale (PO-244); rapporto docs/collaudi/RAPPORTO-mirato-169.md | 15/10 12:57 |
| sviluppo/schede-259 | session_016rmHL7YmMNkGhq9YRhNhpi | giro 28 (Opus, base 7.999.169): PO-259 schede del mister «poche ma decisive» (1-2 a partita, rischio/premio, esito raccontato dopo 5', effetto vero sul motore) | 15/10 13:07 |
| sviluppo/crediti-254 (25b) | session_01CVGkMxbmRujV7SMwV8Q8zE | giro 25b: rimettere Rocketbox/Mixamo/CH38/GLTFLoader con fonte, niente riga licenza per Regular Male e ritratti OpenAI | 15/10 13:40 |
| collaudo/carriere-l6 | session_01BSHcYX8UajM747JYXqxgpx | L6 fase 1 (Haiku, sola misura): 30 carriere × 10 stagioni + PO-190 goleade; rapporto docs/collaudi/RAPPORTO-carriere-l6.md | 15/10 13:44 |
| collaudo/zona-g-misura | session_019KNcHwb2Qrt5hWEcEmed8b | zona G sola misura (Haiku): riproduzione PO-222 e PO-223, nessuna correzione | 15/10 13:44 |
| sviluppo/backup-167 | session_01CQiFQVArtH7SAawpnur9Xh | giro 29 (Opus): PO-167 copia di riserva degli slot e avviso di salvataggio fallito | 15/10 13:44 |
| sviluppo/grafica-217-066 | session_012vEkGqn532iVnmwkSidaj5 | giro 30 (Opus, sola grafica): PO-217 analisi pre-partita, PO-066 riquadri della home | 15/10 13:44 |
| lavoro/170 (catene) | session_01WVhPJq2q9dNVkcHxtWCZne | catena notte 7.999.170 (Haiku): giri 23-30 senza il 22 (decisione PO «Subito senza il 22») | 15/10 18:46 |
| sviluppo/difesa-220-giro31 | session_017bMPz8gmaDe4L7oJGAapAk | giro 31 (Opus, base lavoro/170): PO-220 «Correggi tutto in un giro» — eroe dove dice il motore, arriva sull'uomo, tiene palla dopo il recupero | 15/10 18:47 |
| sviluppo/passaggi-228-giro32 | session_01TvQgHSy6nzh6WLAi5kn4AS | giro 32 (Opus, base lavoro/170): PO-228 passaggi 739 → ~814 senza toccare gol, tiri, xG | 15/10 18:47 |
| sviluppo/zona-g-222-223-giro33 | — (archiviata, consegnato a4714015) | giro 33 (Opus, base lavoro/170): eccezione zona G solo PO-222 (squalificato su Simula) e PO-223 (resa investimento legata a puntata e scelta) | 15/10 18:47 |
| sviluppo/nomi-219-giro34 | session_01QjYD79AyjBEVXBnyQmMMdJ | giro 34 (Opus, base lavoro/170): riparare il guardiano nomi-219 instabile due volte (85/88/95% attorno al 90%), regola PO 13/10; solo test | 15/10 19:04 |
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
- 15/10 13:40 — CONSEGNATI: giro 25 (72ffe742), giro 26 (cbbc2563), collaudo 3D 169 (3b3859ac: R01 alta primo highlight su prato vuoto 5/10, R02-R05 medie, R06 bassa → PO-260, PO-261). Sessioni archiviate.
- 15/10 14:36 — CONSEGNATI: giro 25b (crediti-254), giro 29 (backup-167), collaudo zona G (PO-222 in parte, PO-223 importo fisso), L6 fase 1 + PO-190 (RAPPORTO-carriere-l6.md). Sessioni archiviate.
- 15/10 15:37 — CONSEGNATI: giro 27 (PO-207 rigore/punizione ripartenza, PO-257; PO-258 aperta), giro 30 (PO-217, PO-066), collaudo mirato 169 (passaggi 739, PO-243 verificata 3/3, PO-244 verificata salvo amichevole). Sessioni archiviate. In corso: giro 22, giro 28 (match-sequence rosso in esame), collaudo difesa-220.
- 15/10 16:35 — CONSEGNATI: giro 28 (PO-259 schede 2,25→0,90 a partita), collaudo difesa-220 (A 88%, B 18%, eroe che torna indietro). match-sequence rosso già sulla 169 → PO-262. Sessioni archiviate. In corso: giro 22 (43/48, rosso nomi-219).
- 15/10 18:47 — 7.999.170 unita su lavoro/170 (8fd95fef: giri 23-30, conflitti solo su liste della catena, STABILITA e coda dei toast 247+256), catena notte avviata su sessione Haiku. Avviati i giri 31 (PO-220), 32 (PO-228), 33 (PO-222/223). Giro 22 ancora in corso → 7.999.171.
- 15/10 19:05 — CONSEGNATO giro 22 (sviluppo/highlight-252): entra nella 7.999.171 insieme ai giri 31-33. nomi-219 instabile per la seconda volta (85/88/95% attorno alla soglia 90%): da riparare (regola PO 13/10).
- 15/10 19:10 — CONSEGNATO giro 33 (a4714015): PO-222 e PO-223 con interruttori e guardiani; save-compat, migrazione-194, replay, classifica-102, career-critical 11/11 verdi. Trovati e solo annotati (zona G ferma) PO-263, PO-264, PO-265. Entra nella 7.999.171.
- 15/10 19:40 — Catena 170: rosso crediti-238 «script mancante». Causa misurata: errore mio nell'unione della 170 — il giro 25 aveva archiviato crediti-238 (sostituito da crediti-254, già in catena) e tolto il nome dalle liste; la mia unione delle liste di ci-runner lo ha rimesso dagli altri rami. Non è un rosso del gioco. Correzione delle liste su lavoro/170 a catena finita (per non scontrarsi col push di STABILITA.json della sessione catene); script unisci_liste da non usare più senza confrontare le rimozioni.
