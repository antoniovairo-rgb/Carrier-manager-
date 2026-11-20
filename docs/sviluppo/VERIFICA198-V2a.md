# Verifica della 7.999.198 — parte V2a

- Ramo: `sviluppo/verifica198-v2a`, partito da `prova/198-finale` (`0f0b13d8`).
- Base di confronto per i rossi: `lavoro/198` (`b3b75b9d`).
- Regole: un controllo alla volta (`CPM_CI_PAR=0`), `CPM_CHROME=/opt/pw-browsers/chromium`, tetto 30 minuti per controllo, nessuna correzione.
- Ambiente: 16 GB di memoria (15,5 GB liberi), 59 GB di disco liberi all'avvio.

| controllo | esito su finale | esito sulla base (se rosso) | nato da quale giro | nota |
|---|---|---|---|---|
| esito-282 | VERDE | — | — | 391 s. Braccio verde: 3 scene, esito a schermo 1722/2023/1892 ms, 0 sotto 1200 ms. Braccio rosso visto (3 su 3 sotto 1200 ms). |
| barra-221 | VERDE | — | — | 211 s. Difetti 0, non giudicati 0; i due bracci rossi (`__CPM_NO_G221`, `__CPM_NO_G229`) bocciati come devono. |
| assist-298 | NON GIUDICATO = ROSSO (fermato al tetto di 30 minuti) | da fare | da stabilire | Fermato a 1800 s. Era nel braccio verde: completati 4 semi su 5 (1234: 1 scena d'assist; 2021, 7, 99: 4 scene ciascuno), seme 5 in corso; braccio rosso (`__CPM_NO_ASSIST298`) mai iniziato. Nessun verdetto stampato. |
| chiusura-99 | NON GIUDICATO = ROSSO (fermato al tetto di 30 minuti) | da fare | da stabilire | Fermato a 1800 s. Bracci verdi passati tutti e due (D9: 6/6 gol, mediana contrasto 4,93, 0 sotto 3; RIC: servito = nominato 5/5). Braccio rosso D9 visto (mediana 1,48, 5 sotto 3). Era nel braccio rosso RIC, seme 2021 (seme 1234 fatto: 0/1). Nessun verdetto finale stampato. |
| pc-tablet-292 | VERDE | — | — | 721 s. PC 1366 e 1920, tablet nei due versi, telefono identico con e senza interruttori; il braccio rosso (la 177) fa cadere larghezza, tocco, tasti e striscia. |
| pallino-278 | VERDE | — | — | 72 s. Verde: 6 misure, rapporto 0,34, grigi 0,82, 0 errori; braccio rosso (`__CPM_NO_PALL2D`) visto (rapporto 0,52). |
| fps-249 | VERDE | — | — | 30 s. Nessuna scritta fps al giocatore in 3 campioni, misura viva (8/14/14); braccio rosso visto (scritta presente). |

Verdetto: in corso.
