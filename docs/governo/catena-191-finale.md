# Verbale catena finale 7.999.191 (ramo catena/191-finale, da lavoro/191 ec86cf71)

**ESITO: NON CONCLUSO — misura parziale. Nessun rosso NUOVO dimostrato; ma catene carriera, grafica, mirata e gran parte della completa NON sono state giocate.**
(Nessun «VERDE salvo preesistenti» può essere dichiarato su questa misura.)

## Perché non è conclusa
La catena `completa` ha ~110 passi, molti da 10–50 minuti (gol-eroe-154 47 min, assist-298 32 min, parata-100 ~50 min a tentativo, ×3 se rosso).
Il container è stato riavviato **tre volte** (circa ogni 1–2 h) e il tetto delle attività in sottofondo è 2 h: ogni riavvio ha ucciso la catena in corso
(compresa una prova di parata-100 sulla base). In ~5 h di misura sono stati chiusi 15 passi + i 4 controlli lunghi. Servono molte altre ore, a pezzi con `CPM_CI_FATTI`.

## Tabella (CPM_CI_PAR=0, free -m/df -h prima di ognuno, CPM_CHROME=/opt/pw-browsers/chromium)
| controllo | esito | numeri / note | durata | tentativi |
|---|---|---|---|---|
| build-src + check-src | VERDE | IDENTICO BYTE PER BYTE, 7.252.479 byte, 21 frammenti; privacy allineata; HTML allineato a HEAD | <1 min | 1 |
| box-fischio-169 (completa) | INSTABILE | rosso 3/3 al 1° giro (contrasto pixel 1,25 «5,9»/«voto» tablet/sconfitta; riquadro pc/sconfitta NON TROVATO); rosso 3/3 al 2° (crash `page.screenshot clip.width`, stesso riquadro non trovato); verde alla prova 3 al 3° giro | 315–430 s/giro | 3+3+3 |
| gol-eroe-154 | VERDE | | 2804 s | 1 |
| grafica-168 · grafica-v2 · simula-v2 · momenti-v2 · partita-v2 · patrimonio-303 · intro-292 · tema-unico · carriera3-94 | VERDE | | 454 · 254 · 113 · 508 · 592 · 249 · 115 · 59 · 222 s | 1 |
| assist-298 | VERDE | | 1905 s | 1 |
| highlight-95 (a mano, `env CPM_CHROME=… CPM_D3DIAG=1 node highlight-95.mjs`, partito davvero) | VERDE | «highlight-95 verde (e il rosso si vede)», 103 highlight nella 1ª sezione, difetti 0 | 83 min (00:14→01:37) | 1 |
| distanze-126 (a mano, `CPM_TMAX=20000000`) | VERDE | 12+ partite concluse (`ended`/`ceremony`), «nessun tiro > 30 m, nessun “dal limite” > 22 m, nessuna testa > 16,5 m» | 59 min (01:37→02:36) | 1 |
| validate-situations | VERDE | PASS, fingerprint 00001505, 0 failure | 10 min | 1 |
| partita-vera | VERDE | «tutte le 12 bande giudicate e tenute (partite finite 2/2)» | 6 min | 1 |
| parata-100 (completa) | ROSSO 2/2, 3° tentativo interrotto dal tetto | verde: «nessuna parata sul ramo cross_goal (il ramo corretto dal giro 100 non è stato guardato)»; rosso: «il difetto non si vede (1 parate)» (log in out/ci-rossi, 03:44 e 04:35) | ~50 min/tentativo | 2 (+1 killed) |
| tutti gli altri passi di `completa` (da riserva-103 in poi) | NON GIOCATI | | | |
| catena carriera · catena grafica · mirata src/14 (base 6e995b91) | NON GIOCATE | | | |

I passi highlight-95, partita-vera, validate-situations sono stati fatti a mano (sopra) e inseriti in `CPM_CI_FATTI` per riprendere la completa: la STABILITA.json non è stata scritta (il runner la scrive solo a fine catena, mai arrivata).

## Rossi e confronto con la base 6e995b91 (= 7.999.190)
- **box-fischio-169** — **NON CONFRONTABILE / di fatto NUOVO**: il guardiano e la funzione (riquadro del fischio finale leggibile, PO-365/366) sono del giro 169, quindi dentro la 191; sulla base `box-fischio-169.mjs` non esiste (MODULE_NOT_FOUND). Il rapporto del giro 169 lo dava verde (54/54, 12/12 su 3 corse); qui rosso 6 volte su 6 al primo e secondo giro, poi verde alla 3ª prova al terzo. Sintomi: riquadro non trovato su pc/sconfitta, contrasto 1,25 su tablet/sconfitta. **Instabile da scrivere**; sospetto di dipendenza dall'esito generato (sconfitta) o dal formato, non verificato.
- **parata-100** — noto preesistente, **non confermato sulla base**: la prova sulla base 190 è stata avviata ma uccisa dal riavvio del container. Rosso con lo stesso motivo (copertura: ramo cross_goal non guardato, braccio rosso cieco), tipico di partita giocata in tempo reale non riproducibile.
- Gli altri rossi noti (finale-202, ripartenza-207, trama, bg-*, ball-alive, spazio-296, calendario-offerte-195, palco-corpi-191, figurine-208, piede-cross-p1b2, doppio-gesto-148, testa-146, home-066, festa-3d) **non sono stati raggiunti**: nessuna conferma sulla base.

## Dubbi per la sessione madre
1. Tempi: la sola `completa` richiede >10 h con retry; con riavvii ogni 1–2 h serve una pianificazione a blocchi (CPM_CI_FATTI) o runner più veloci/paralleli (`CPM_CI_PAR` attivo, che qui ho spento come richiesto).
2. box-fischio-169: decidere se è instabile (da scrivere) o regressione dei giri 170–173; sulla base non c'è nulla da confrontare, serve il commit del giro 169 stesso.
3. Il tetto di 2 h su sottofondo uccide parata-100 (3 tentativi ≈ 2,5 h) da solo.
