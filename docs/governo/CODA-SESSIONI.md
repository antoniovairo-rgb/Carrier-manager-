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
| lavoro/170 (catene) | — (archiviata) | catena notte 7.999.170: 72 verdi, rosso crediti-238 (test archiviato rimesso per errore nell'unione); catena composta 72/72 dopo averlo tolto; pubblicata | 15/10 18:46 |
| sviluppo/difesa-220-giro31 | — (archiviata, consegnato 224500ad) | giro 31 (Opus, base lavoro/170): PO-220 «Correggi tutto in un giro» — eroe dove dice il motore, arriva sull'uomo, tiene palla dopo il recupero | 15/10 18:47 |
| sviluppo/passaggi-228-giro32 | — (archiviata, consegnato 35c9b86f) | giro 32 (Opus, base lavoro/170): PO-228 passaggi 739 → ~814 senza toccare gol, tiri, xG | 15/10 18:47 |
| sviluppo/zona-g-222-223-giro33 | — (archiviata, consegnato a4714015) | giro 33 (Opus, base lavoro/170): eccezione zona G solo PO-222 (squalificato su Simula) e PO-223 (resa investimento legata a puntata e scelta) | 15/10 18:47 |
| sviluppo/nomi-219-giro34 | — (archiviata, consegnato a6aa9e79) | giro 34 (Opus, base lavoro/170): riparare il guardiano nomi-219 instabile due volte (85/88/95% attorno al 90%), regola PO 13/10; solo test | 15/10 19:04 |
| sviluppo/ripartenza-228-giro35 | session_01UjkGXjmfF4yMqNQ1WwXhiB | giro 35 (Opus, base sviluppo/passaggi-228-giro32): decisione PO «Restringi, poi ritara» — ripartenza del giro 27 solo dopo gol da piazzato/scena, poi passaggi a ~814 | 15/10 22:18 |
| sviluppo/determinismo-262-giro36 | session_01Lha8HDT2FDFmoebjAGvpsY | giro 36 (Opus, base lavoro/170): PO-262 match-sequence rosso — punto di divergenza, release colpevole, correzione con rosso e guardiano | 15/10 22:29 |
| sviluppo/zona-g-263-265-giro37 | — (archiviata, consegnato 605dd0e0) | giro 37 (Opus, base giro 33): eccezione zona G PO-263, PO-264, PO-265 | 15/10 22:32 |
| analisi/proposta-l6-giro38 | session_013Uuw4ZJ9TrrKt74bNoSmGB | giro 38 (Opus, solo documento, base collaudo/carriere-l6): docs/governo/PROPOSTA-L6.md per PO-154…157 e PO-098, con domande per il questionario | 15/10 22:32 |
| sviluppo/via-ch38-171-giro39 | — (archiviata, consegnato) | giro 39 (Opus, base lavoro/170): PO-171 via CH38 da cerimonie, ritratto dei menu e download | 15/10 22:32 |
| sviluppo/apertura-261-giro40 | session_0165RCS3kyu1Tjad3Z4HSy8Y | giro 40: PO-261 prima apertura vuota, poi PO-258 portiere sulla punizione (Opus, base lavoro/171-base, consegna entro 06:00 UTC 16/10) | 15/10 22:43 |
| sviluppo/esiti-218-giro41 | session_01JYMJD9ftMjBCKDvWpiu2U8 | giro 41: esiti bugiardi PO-218, PO-240, PO-250 (Opus, base lavoro/171-base, consegna entro 06:00 UTC 16/10) | 15/10 22:43 |
| sviluppo/highlight-252b-giro42 | session_01ACWkQcTwWuPRYKH6BSZmBy | giro 42: PO-252 residui (piedi, voci 7-10) e banco finale per PO-229/248 (Opus, base lavoro/171-base, consegna entro 06:00 UTC 16/10) | 15/10 22:43 |
| sviluppo/cross-143-nomi-266-giro43 | session_01UfUrazsgUSyjqybpJQ8xQa | giro 43: PO-143 cross #64/#126 e PO-266 cronaca (Opus, base lavoro/171-base, consegna entro 06:00 UTC 16/10) | 15/10 22:43 |
| sviluppo/interazioni-226-giro44 | session_016ZytVyWcsJ54iBxQ144iTA | giro 44: PO-226/246/260 interazioni in partita, schede-246 rosso (Opus, base lavoro/171-base, consegna entro 06:00 UTC 16/10) | 15/10 22:43 |
| sviluppo/motore-gesti-022-giro45 | session_01GXY4NWAw2nR4mZg8neLT8g | giro 45: PO-022/068 motore unico e gesti, misura e chiusura (Opus, base lavoro/171-base, consegna entro 06:00 UTC 16/10) | 15/10 22:43 |
| sviluppo/stadi-071-giro46 | session_01Qq2deyGNw5eMHcxxKdsXo8 | giro 46: stadi 3D PO-071 fase 3, pubblico, cartelloni, ingresso (Opus, base lavoro/171-base, consegna entro 06:00 UTC 16/10) | 15/10 22:43 |
| sviluppo/cerimonie-137-giro47 | session_01M9GhufweMkMRyfggPgHy11 | giro 47: cerimonie PO-137/002 (Opus, base lavoro/171-base, consegna entro 06:00 UTC 16/10) | 15/10 22:43 |
| sviluppo/kit-061-giro48 | — (archiviata, consegnato fc63796) | giro 48: kit grafico PO-061 (Opus, base lavoro/171-base, consegna entro 06:00 UTC 16/10) | 15/10 22:43 |
| lavoro/171 (catene) | session_01WYG4vgC3wYLWbC6Vk9droG | catena notte 7.999.171 (Haiku), mega rilascio del 16/10 | 16/10 06:08 |
| collaudo/carriere-l6-bis-giro49 | — (archiviata, 6507a3b) | giro 49 (Opus, sola misura): L6 fase 1-bis col banco corretto (decisione PO 16/10) | 15/10 22:52 |
| collaudo/release-7.999.170-3d | — (archiviata, 815e968) | collaudo 3D della 7.999.170 (Sonnet) | 15/10 22:54 |
| collaudo/release-7.999.170-carriera | — (archiviata, 882f41a) | collaudo non 3D della 7.999.170: 1 alto (PO-267 crediti «Non posso confermarlo»), 1 medio (PO-268 numero d'ordine CGTrader), 1 basso (PO-269 badge sopra Modal); tre settimane non giocate per intero, PO-243/244/217/066 non verificati | 15/10 22:54 |
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
- 15/10 20:50 — CONSEGNATO giro 34 (a6aa9e79): nomi-219 su lavoro/170 è già stabile (forma del giro 18): 5/5 corse verdi (92,3% su 194), rosso rilevato 5/5, rossi falsi stimati ~0,1% per corsa; soglie invariate, solo righe per seme e lo strumento nomi-219-ricampiona. Il rosso del giro 22 veniva dalla forma VECCHIA del guardiano sul suo ramo (base 168, senza 118d553): correzione della mia lettura delle 19:05. Residuo registrato come PO-266. Il ramo (solo test) entra nella 7.999.171.
- 15/10 22:20 — CONSEGNATO giro 32 (35c9b86f, solo misure e patch non adottata): passaggi 811,3 sulla 170 (bersaglio ~814 già raggiunto). Spostamento 169→170 di tiri −17 %, xG −17 %, cross −22 % attribuito con misura alla regola del giro 27 (riprendi schiera:true a ogni gol fuori scena, src/15 ~5554; con __CPM_NO_SCHIERA27 torna il profilo 169). Domanda al PO.
- 15/10 22:30 — Briefing L1: avviato giro 36 (PO-262). In coda dopo la 7.999.171 (giri 22, 31, 33, 34, 35): giro highlight con PO-261 (prima apertura vuota), poi PO-258, poi esiti PO-218/240/250.
- 15/10 22:45 — Mega rilascio 16/10 ore 16 (decisione PO): creata lavoro/171-base (5eb55003 = lavoro/170 + giro 22, liste catena coi guardiani 252, crediti-238 tolto); avviati i giri 40-48. Consegnato giro 38 (proposta L6, analisi/proposta-l6-giro38 7bb83a54): questionario da portare al PO. Unione della 7.999.171 alle 06:00 UTC: giri 31, 33, 34, 35, 36, 37, 39, 40-48 consegnati e verdi; il resto slitta, dichiarato.
- 15/10 22:55 — PUBBLICATA 7.999.170 (main 12f46bdf). La guardia di promozione aveva fermato main per il rosso crediti-238: tolto il nome dalle liste (20dfe60b) e registrato un giro composto 72/72 sulla stessa build coi passi verdi della catena (nessun passo rigiocato, nessuna deroga). Avviati i due collaudi e il giro 49 (L6 banco corretto). Consegnato il giro 48 (kit, 41010e0f): entra nell'unione delle 06:00.
- 15/10 23:10 — CONSEGNATO giro 31 (224500ad): PO-220 contatto 5,1→1,8 u, (A) 88%→9%, (B) 18%→5%; guardiano nuovo verde/rosso, gate verde. Rossi preesistenti misurati anche sulla 170 intatta: seme-a (diverge al 17', ingresso #486 chiedi.riprendi: stessa famiglia di PO-262, segnalato al giro 36 tramite il rapporto) e difesa-220-scena («contrasto mai partito» a GLB spento; in catena 170 verde alla seconda prova). Entra nella 7.999.171.
- 15/10 23:45 — Container principale riavviato (uptime 2 min), nessuna catena in corso sul ramo principale. CONSEGNATI: giro 39 (PO-171) e collaudo carriera 170 (PO-267/268/269 registrati). PO-267 si corregge all'unione della 171 con la decisione PO «Senza riga licenza».
- 16/10 00:40 — CONSEGNATI: giro 37 (PO-263/264/265, 605dd0e0), giro 48 (kit maglie 3D, fc63796), collaudo 3D 170 (815e968): R01 alta PO-260 schede sopra highlight e cerimonia (nel giro 44), R02 eroe piccolo 0,057, R03 prima partita 1,14× (169: 1,6×), R06 PO-261 1/7 (169: 5/10). Nessun bloccante.
- 16/10 01:40 — CONSEGNATO giro 49 (L6 fase 1-bis, 6507a3b): con il banco corretto svincolato 4/300 stagioni (fase 1: 210/300); Nazionale da svincolato 0 presenze su 846 settimane (difetto di codice confermato ma raro); impulsi senza condizione 47% stabile, catalogo esaurito in 4-5 stagioni (60% ripetizioni); Ufficio: trainer +21%, fisio −24%, investimenti +3% medi funzionano. Nuovo difetto verificato PO-270 (rinnovo di 1 anno nell'ultimo anno = svincolato). Numeri per le eccezioni da portare al PO.
- 16/10 06:08 — UNIONE 7.999.171 su lavoro/171 (d4ea9020): giri 22 (base), 31, 34, 36, 33+37, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48 + PO-267 (Crediti senza «Non posso confermarlo», rosso __CPM_NO_CRED267). Due conflitti nel codice 3D risolti a mano (src/12: driver dell'eroe giro 22+31; snap d'apertura giro 40+43). Liste della catena unite a tre vie (aggiunte e rimozioni); difesa-252 tolto dalla completa (braccio rosso cieco, misurato identico sulla base dai giri 40/42/46). NON entra: giro 35 (non consegnato). Rossi preesistenti fuori catena notte: seme-a (giro 36 tocca la stessa radice), framing-guard (soglia vecchia), testa-76/146, gala-3d. Catena notte avviata sulla sessione Haiku.

- 16/10 06:40 UTC — archiviate le sessioni dei giri 36, 40, 41, 42, 43, 44, 45, 46, 47: tutte unite in lavoro/171 (d4ea9020). Residui dichiarati dalle sessioni: giro 43 cross #126 ancora aperto (PO-143); giro 44 proposta «schede a fatto del finale» in attesa del PO; giro 45 mirata 43/48, i 5 passi mancanti girano nella catena notte 171; rossi preesistenti difesa-252 (PO-271), framing-guard, seme-a. Restano attive: catena notte 171 (Haiku) e giro 35 (→ 7.999.172).

- 16/10 09:58 UTC — catena notte 171 (session_01WYG4vgC3wYLWbC6Vk9droG) ferma su recupero-202 dalle 07:29 (di solito ~8 min). Misurato qui sulla build 171 (d4ea9020): il passo non si blocca ma è ROSSO, braccio rosso al 91' invece del 90' (il motore segna fra l'89' e il 90' e la regola del gol al 90', 7.999.6, allunga di un minuto; con __CPM_NO_GOL90 torna 90). Corretto il guardiano (il rosso spegne anche __CPM_NO_GOL90): verde 93 / rosso 90, commit 10c3c4f0 su lavoro/171. Interruzione della vecchia sessione negata dal classificatore: resta attiva, da archiviare. Nuova catena notte su Haiku: session_01NqGYyKxZb9URGzuF1SkB2N. Durata storica della notte 260-435 min: il rilascio delle 16 non è raggiungibile, si applica la decisione PO «correggo e rilascio alle 00».
- Giro 35 (session_01UjkGXjmfF4yMqNQ1WwXhiB) chiuso: ripartenza ristretta ai gol dell'eroe, ritarata a 807 passaggi; 46/47 guardiani verdi (crediti-238 rosso: guardiano archiviato, non va nella catena). Entra nella 7.999.172.

- 16/10 12:36 UTC — catena notte 171 bis (session_01NqGYyKxZb9URGzuF1SkB2N): runner morto a 44/94 verdi (container spento dopo la fine del turno, la catena era in background); log non raggiungibile da qui, quindi niente giro composto. Sessione archiviata. Catena notte rilanciata per intero nella sessione principale sulla build 171 (lavoro/171 @10c3c4f0), seguita dentro il turno; rilascio previsto alle 00 di Roma (decisione PO).

- 16/10 15:55 UTC — catena notte 171 nella sessione principale: 60 passi verdi, poi riavvio del container dopo rinvio-252. Rossi misurati: backup-167 (service worker che scavalca le copie locali delle librerie al ricaricamento, uguale sulla 170: guardiano corretto, bd80736d, verde e rosso visibile) e rinvio-252 (braccio rosso cieco, fuori dalla completa per decisione PO, a9b0f25d). Ripresa in giro composto (CPM_CI_FATTI = 60 passi verdi della stessa build) per i passi mancanti.

- 17/10 04:07 UTC — 7.999.171 pubblicata (main 39776cdc), catena notte 89/89. Collaudi avviati da main: 3D Sonnet session_01SYyd6S9dhhkHemC4WVeRno (collaudo/release-7.999.171-3d), carriera Haiku session_01DeWmr56xWWxprzpLkk1wvu (collaudo/release-7.999.171-carriera). Vecchia sessione catene session_01WYG4vgC3wYLWbC6Vk9droG: ha consegnato la sua catena (942fe280, unita), da archiviare.

- 17/10 05:36 UTC — collaudo carriera 171 consegnato (ef6ca1c): 4 rilievi (PO-268 confermato, chip versione visibile, PO-269 a 360 px nei Crediti, nuovo PO-272 «(simulata)»); classifica GF=GS, PO-249 e PO-267 superati; non verificati: tabellino di partita giocata, giornale, modali a 360 px. Collaudo 3D in corso (6 partite chiuse a 90', 0 errori di pagina).

- 17/10 06:36 UTC — collaudo 3D 171 consegnato (c8e194e): 9 partite fino al fischio, 0 errori di pagina, nessun difetto alto; nuovi PO-273 (volée, eroe fuori quadro), PO-274 (salti del pallone scoperti), PO-275 (memoria 507 MB), PO-276 (walkout e HUD). Verificati: apertura-261, esiti-218 verde, gk-dive-sync, ripartenza-207, passaggio-coppa-137, ingresso-245. Sessioni dei due collaudi archiviate.

- 17/10 07:34 UTC — 7.999.172 (L1-bis) avviata da lavoro/172-base (= main 39776cdc), sessioni Opus:
  - giro 50 guardiani rossi/ciechi (PO-271, PO-266) — session_01Pau7qy6t7iM6TeAHAFgj2C — sviluppo/guardiani-271-giro50
  - giro 51 PO-270, PO-268, PO-255/269, PO-272 — session_01WZ3GM57m6FSp3UspJvCAj9 — sviluppo/piccole-268-giro51
  - giro 52 schede a fatto del finale + PO-260/246/234/226 — session_01KBA1Vi9aWXn6bDmeW2E6He — sviluppo/schede-finale-giro52
  - giro 53 PO-273/274/275 highlight e memoria — session_01YZKnQsSZz8ah1egVPJmjQF — sviluppo/highlight-273-giro53
  - giro 54 PO-277 ingresso dal tunnel + PO-276 — session_01VRiPAZWRMfdCEvTiRgtMv9 — sviluppo/ingresso-277-giro54
  - giro 35 (sviluppo/ripartenza-228-giro35) entra all'unione.
  - giro 55 PO-278 pallone — session_014Qo7zTDiQ1QX3H4YZuVYjo — sviluppo/pallone-278-giro55
  - giro 56 PO-279 statistiche d inizio partita — session_01Ph8MSXmZPVLJEkvPHNPudA — sviluppo/statistiche-279-giro56
