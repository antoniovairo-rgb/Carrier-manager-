# Verifica di rilascio 7.999.197 — blocco V1c

**Sintesi: 14 controlli su 21 eseguiti · 11 verdi · 1 instabile 1 su 2 (`scena3d-96`) · 2 dichiarati, rossi anche sulla 196
(`buildup-sync`, `difesa-220-scena`) · nessun rosso NATO nella 197 · 7 non eseguiti per il tetto del blocco (§4).**

Sola esecuzione e classificazione: nessun file di `src/` o `tests/` modificato. Build verificato: `lavoro/197` a **30a456b3**
(staccato, «Unione sviluppo/giro271-portiere252-esiti in lavoro/197»), `node tools/build-src.mjs` → byte identici,
`node tools/check-src.mjs` → allineato a HEAD. Confronto: copia della 7.999.196 pubblicata (`origin/main` **3076a1b7**) in
`../w196`, stesso modo.

Modo: ogni controllo una volta, uno alla volta, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`,
`npm run -s <nome>` in `tests/visual`, tetto 40 minuti (`timeout 2400`). Rosso o «non giudicato» → una riprova; rosso 2 su 2 →
una corsa sulla 196 (tetto 40 min); oltre tetto 2 su 2 → una corsa sulla 196 col tetto di 60 min. Dopo ogni corsa
`git checkout -- docs/` (foto rigenerate rimesse, mai committate). Memoria libera e disco registrati prima di ogni controllo
(15,5 GB / 27 GB all'avvio).

Regola di classificazione (PO-516): rosso già sulla 196 = **dichiarato**; verde sulla 196 e rosso 2 su 2 sulla 197 = **NATO nella 197**.
«Non giudicato» = rosso. Lo script marca «non giudicato» anche un'uscita 0 che nelle ultime 5 righe dice «non giudicato» o «cieca/cieco»;
in tabella l'ultima riga è riportata per intero, così si può ricontrollare.

## 1 · Come ho ricavato l'elenco

- `MAPPA` in `tests/visual/ci-runner.mjs`: la prima riga che `MAPPA.find` trova per un file `src/12-…` è
  `[/src\/12-|src\/13-/, [...]]` (76 guardiani). **La stessa riga è anche la prima per `src/13-…`**: la regex le copre entrambe.
- **Parte src/12**: i guardiani di quella riga che il giro 265 elenca come «Non eseguiti» al §5 del suo rapporto, nell'ordine della riga.
  Il rapporto dice «64», ma i nomi elencati sono **63** (contati). Tolti gli esclusi (sotto) restano **57**.
- **Parte src/13**: i guardiani della stessa riga che il giro 262 non ha eseguito (lui ha eseguito `formazioni-262`, `rigorista-257`,
  `sigle-203`, `ingresso-245`, `nomi-182` + nucleo), non già nella parte src/12 e non esclusi: restano **8**, nell'ordine della riga.
- Esclusi come da consegna: `highlight-95`, `ingresso-206`, `career-critical` e i guardiani dei giri del lotto (fra quelli della riga:
  `portiere-223`, `portiere-252`, `parata-100`, `esiti-241`, `validate-situations`, `formazioni-262`, `coreografie-244`, `lotteria-191`,
  `spazio-296`, `giornale-244`, `stadi-071`, `camera-241`, `sigle-203`).

Elenco completo numerato (65); la mia parte è una posizione ogni tre (3, 6, 9, … 63 = **21 controlli**):

1. `rigorista-257` (src/12)
2. `tunnel-245` (src/12)
3. `salienti-243` (src/12) — **V1c**
4. `guardalinee-222` (src/12)
5. `tocco3d-219` (src/12)
6. `piazzato-204` (src/12) — **V1c**
7. `pullman-204` (src/12)
8. `nomi-182` (src/12)
9. `chiusura-99` (src/12) — **V1c**
10. `consegna-103` (src/12)
11. `colla-103` (src/12)
12. `contatto-103` (src/12) — **V1c**
13. `carriera3-94` (src/12)
14. `assist-298` (src/12)
15. `scena3d-96` (src/12) — **V1c**
16. `panchina-293` (src/12)
17. `pc-tablet-292` (src/12)
18. `ingresso-285` (src/12) — **V1c**
19. `corpi-073` (src/12)
20. `ingresso-276` (src/12)
21. `stadi-064` (src/12) — **V1c**
22. `render-3d-023` (src/12)
23. `avvicinamento-61` (src/12)
24. `linee-61` (src/12) — **V1c**
25. `pallone-278` (src/12)
26. `ingresso-277` (src/12)
27. `inquadra-273` (src/12) — **V1c**
28. `salti-274` (src/12)
29. `memoria-275` (src/12)
30. `buildup-sync` (src/12) — **V1c**
31. `po229-gi38` (src/12)
32. `esiti-218` (src/12)
33. `cross-218` (src/12) — **V1c**
34. `scene-221` (src/12)
35. `fila-227` (src/12)
36. `bambini-294` (src/12) — **V1c**
37. `partita-vera` (src/12)
38. `bambini-236` (src/12)
39. `pressing-143` (src/12) — **V1c**
40. `conduci-242` (src/12)
41. `ingresso-245` (src/12)
42. `difesa-220-scena` (src/12) — **V1c**
43. `ingresso-camminata-245` (src/12)
44. `analisi-217` (src/12)
45. `piedi-252` (src/12) — **V1c**
46. `difesa-252` (src/12)
47. `aereo-252` (src/12)
48. `difesa-220-giro31` (src/12) — **V1c**
49. `apertura-261` (src/12)
50. `camera-252` (src/12)
51. `reazione-252` (src/12) — **V1c**
52. `spot-266` (src/12)
53. `testa-143` (src/12)
54. `cerimonie` (src/12) — **V1c**
55. `passaggio-coppa-137` (src/12)
56. `kit-061` (src/12)
57. `strisce-corpo` (src/12) — **V1c**
58. `portiere-265` (src/13)
59. `dribbling-226` (src/13)
60. `gk-dive-sync` (src/13) — **V1c**
61. `gk-miss-229` (src/13)
62. `goal-postarc` (src/13)
63. `rete-252` (src/13) — **V1c**
64. `rinvio-252` (src/13)
65. `parata-258` (src/13)


## 2 · Esiti (14 su 21 eseguiti)

| # | Controllo | Esito 1ª | Esito 2ª | Esito sulla 196 | Classificazione | Ultima riga del controllo |
|---|---|---|---|---|---|---|
| 3 | `salienti-243` | verde (219 s) | — | — | **verde** | 1ª: «ROSSO: CADE (come deve): nessun tasto nella schermata pre-partita, Mondiale e amichevole non apribili a soli salienti» |
| 6 | `piazzato-204` | verde (460 s) | — | — | **verde** | 1ª: «✅ piazzato-204 verde (e il rosso si vede)» |
| 9 | `chiusura-99` | verde (2102 s) | — | — | **verde** | 1ª: «✓ chiusura-99 VERDE» |
| 12 | `contatto-103` | verde (769 s) | — | — | **verde** | 1ª: «BRACCIO verde+rosso · MOTIVO nessuno» |
| 15 | `scena3d-96` | rosso(rc=1) (1194 s) | verde (1210 s) | — | **instabile 1 su 2** | 1ª: «✗ scena3d-96 ROSSO (1)» · 2ª: «✓ scena3d-96 VERDE» |
| 18 | `ingresso-285` | verde (274 s) | — | — | **verde** | 1ª: «✅ ingresso-285 verde (scena 14-18 s con stacchi, passo ≤ 2,3 u/s in quadro, squadra schierata) e il rosso si vede» |
| 21 | `stadi-064` | verde (21 s) | — | — | **verde** | 1ª: «✅ PASS stadi-064 (etichetta tipologia, cartelloni per tipologia, fondale del palco)» |
| 24 | `linee-61` | verde (691 s) | — | — | **verde** | 1ª: «✅ PASS linee-61» |
| 27 | `inquadra-273` | verde (667 s) | — | — | **verde** | 1ª: «✅ PASS inquadra-273 (0.0%)» |
| 30 | `buildup-sync` | rosso(rc=2) (162 s) | rosso(rc=2) (163 s) | rosso(rc=2) (170 s) | **dichiarato (rosso anche sulla 196: rosso(rc=2))** | 1ª: «  · gi83/az0: salto del pallone di 26.7u in 43ms (a x 18.76) al passaggio di beat INGRESSO→carry» · 2ª: «  · gi91/az0: salto del pallone di 27.9u in 57ms (a x 45) al passaggio di beat INGRESSO→carry» · 196: «  · gi96/az0: salto del pallone di 22.3u in 49ms (a x 36.69) al passaggio di beat INGRESSO→carry» |
| 33 | `cross-218` | verde (174 s) | — | — | **verde** | 1ª: «✅ cross-218 verde (riquadro, motore e 3D concordi sul cross sbagliato) e il rosso si vede» |
| 36 | `bambini-294` | verde (340 s) | — | — | **verde** | 1ª: «✅ bambini-294 verde (e il rosso si vede)» |
| 39 | `pressing-143` | verde (23 s) | — | — | **verde** | 1ª: «✅ pressing-143 verde (e il rosso si vede)» |
| 42 | `difesa-220-scena` | rosso (2355 s) | rosso (2391 s) | rosso (verdetto stampato; corsa chiusa a ~2400 s, vedi dubbio 5) (2401 s) | **dichiarato (rosso anche sulla 196)** | 1ª: «❌ difesa-220-scena · verde: 5 scene col contrasto mai partito nella sua scena (attesa del pallone, tetto 0,5 s)» · 2ª: «❌ difesa-220-scena · verde: 6 scene col contrasto mai partito nella sua scena (attesa del pallone, tetto 0,5 s)» · 196: «❌ difesa-220-scena · verde: 4 scene col contrasto mai partito nella sua scena (attesa del pallone, tetto 0,5 s)» |
| 45 | `piedi-252` | **non eseguito** (tetto del blocco) | | | | |
| 48 | `difesa-220-giro31` | **non eseguito** (tetto del blocco) | | | | |
| 51 | `reazione-252` | **non eseguito** (tetto del blocco) | | | | |
| 54 | `cerimonie` | **non eseguito** (tetto del blocco) | | | | |
| 57 | `strisce-corpo` | **non eseguito** (tetto del blocco) | | | | |
| 60 | `gk-dive-sync` | **non eseguito** (tetto del blocco) | | | | |
| 63 | `rete-252` | **non eseguito** (tetto del blocco) | | | | |


## 3 · Dubbi (scritti, non decisi)

1. **Parte src/13 letta alla lettera.** Gli 8 della parte src/13 (`portiere-265`, `dribbling-226`, `gk-dive-sync`, `gk-miss-229`,
   `goal-postarc`, `rete-252`, `rinvio-252`, `parata-258`) **il giro 265 li ha eseguiti** sul suo build (verdi, §5). Il giro 262 no.
   Ho seguito la consegna alla lettera («non eseguiti dal giro 262») e li ho tenuti: tocca a me `gk-dive-sync` e `rete-252`.
   Con la lettura «solo ciò che oggi nessuno ha eseguito» la parte src/13 sarebbe vuota e l'elenco sarebbe di 57.
2. **`nomi-182` e `ingresso-245`** stanno nella parte src/12 (non eseguiti dal 265) ma il giro 262 li ha eseguiti (verdi). Tenuti
   per la stessa lettura alla lettera; nessuno dei due è nella mia parte.
3. **63 contro 64.** Il §5 del giro 265 dichiara 64 non eseguiti ma ne nomina 63; ho usato i nomi.
4. Le altre due sessioni del blocco V1 devono ricavare lo stesso elenco: se il loro differisce, la numerazione qui sopra è quella che
   ho usato io.
5. **`difesa-220-scena`, durate al limite.** Le tre corse sono durate 2355 · 2391 · ~2401 s contro un tetto di 2400. Tutte e tre hanno
   stampato il verdetto «❌ … scene col contrasto mai partito» (5 · 6 · 4 scene), quindi il rosso è un rosso vero e non un tetto;
   la terza (sulla 196) è finita a ridosso del tetto e il suo codice d'uscita non l'ho registrato (la sequenza era stata fermata,
   vedi §4). Il braccio rosso del guardiano si vede in tutte le corse (fuori 9 · 9 · 6). Classificato **dichiarato**: rosso sulla
   196 con lo stesso difetto.
6. **`buildup-sync` dichiarato**: stesso difetto sulla 197 (2 e 3 salti del pallone 19-28 u al passaggio INGRESSO→carry) e sulla 196
   (3 salti + gi24 «si muove solo la palla»). Le scene colpite cambiano da corsa a corsa (gi40, gi83, gi84, gi91, gi92, gi96).
7. **`scena3d-96` instabile 1 su 2**: alla prima un solo rosso (D11, un salto del pallone 3,1 u in 0,05 s su tabo-gi64, scrittore
   `buildup-volo`, 31/31 scene giudicate); alla riprova verde. Non rifatto sulla 196 (la regola lo chiede solo per i rossi 2 su 2).

## 4 · Tetto del blocco: 7 controlli non eseguiti

La sequenza è partita alle 17:08; alle 21:10 (4 ore) restavano `piedi-252`, `difesa-220-giro31`, `reazione-252`, `cerimonie`,
`strisce-corpo`, `gk-dive-sync`, `rete-252`. Ho lasciato finire la corsa in volo (`difesa-220-scena` sulla 196, chiusa alle 21:32) e
ho fermato la sequenza per rispettare il tetto «circa 4 ore» della consegna. **Questi 7 non sono stati eseguiti da questo blocco**:
vanno assegnati da chi coordina. `gk-dive-sync` e `rete-252` il giro 265 li ha eseguiti verdi sul suo build (vedi dubbio 1).

Nessun file di `src/` o `tests/` toccato; nessuna foto rigenerata committata (`git checkout -- docs/` dopo ogni corsa, albero pulito
sia qui sia nella copia della 196).
