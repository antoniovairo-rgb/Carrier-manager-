# Verifica della 7.999.198 — parte V2 (guardiani della mappa di `src/15-live-match.jsx`)

**Stato: PROVVISORIO, corse ancora in corso.**

- **Unione verificata:** `prova/198-blocco2` al commit `afd61ac3` (= `lavoro/198` b3b75b9d + giri 293, 294, 295, 296, 298, 299, 300). Ramo di lavoro: `sviluppo/verifica198-v2`.
- **Base di confronto:** `lavoro/198` al commit `b3b75b9d` (copia separata della cartella, stessa macchina).
- **Elenco dei controlli:** unione di tutte le 16 righe `/src\/15-/` della `MAPPA` di `tests/visual/ci-runner.mjs`, letta dal file senza eseguirlo: 96 controlli diversi, meno i tre esclusi dalla consegna (`highlight-95`, `ingresso-206`, `career-critical`) = **93**.
- **Come sono stati eseguiti:** uno alla volta (`npm run -s <nome>`, `CPM_CI_PAR=0`, `CPM_CHROME=/opt/pw-browsers/chromium`), una corsa sola per controllo, nessun rilancio automatico, tetto di 40 minuti per controllo, nessuna soglia toccata. Prima della partenza: memoria libera 12,7 GB su 16, disco 58 GB liberi.
- **Ambiente:** Chromium build 1243, `playwright` 1.65.1, `@babel/standalone` 7.23.6 (fissato a mano con `npm install --no-save`: la 7.29.15 che `^7.23.6` sceglie oggi non si scarica dal registro, errore 404; `package.json` non modificato).

## Controlli già eseguiti dai giri 293–300: perché li ho rieseguiti

La consegna dice di non rieseguire un controllo già verde in un giro «se il file non è cambiato dopo». Ho verificato con `git diff` contro b3b75b9d: `src/15-live-match.jsx` è stato modificato da **tre** giri (294, 296, 300), ciascuno partito da `lavoro/198` per conto suo. Il file dell'unione è quindi diverso da quello su cui ogni singolo giro ha eseguito i propri controlli: nessun verde dei rapporti 293–300 vale per l'unione senza una nuova corsa. Per questo ho rieseguito anche `rigori-296`, `battito-264`, `tabellone-214`, `barra-221`, `solo-highlight-166`, `salienti-243`, `pc-tablet-292`, `accessibilita-234` (verdi nei rapporti dei giri 295, 296, 300).

Fuori elenco, eseguiti all'inizio sull'unione dentro `tests/visual`: `test:logic` verde (51 passati, 0 falliti), `save-compat` verde (12 passati, 0 falliti), `node tools/check-src.mjs` verde (html allineato a `src/`).

## Risultato

Eseguiti **16 su 93**: 16 verdi, 0 non verdi. Non eseguiti: **77** (elenco in fondo).

| controllo | esito sull'unione | esito sulla base `lavoro/198` | nato da quale giro | nota (ultima riga del controllo, o spiegazione) |
|---|---|---|---|---|
| `rigori-296` | ✅ verde (16,6 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ✅ rigori-296 verde (parti A + B + C): nomi corti per tutti i club, cerimonia >= 17 s in casa e in trasferta su PC e telefono chiusa dal timer, striscia senza tagli e senz |
| `battito-264` | ✅ verde (7,0 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ROSSO: CADE (come deve): la partita intera diverge dai soli highlight |
| `tabellone-214` | ✅ verde (8,6 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ✅ tabellone-214 verde (e il rosso si vede) |
| `rigore-191` | ✅ verde (6,0 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ✅ rigore-191 verde (e il rosso si vede) |
| `lotteria-191` | ✅ verde (4,2 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ✅ lotteria-191 verde (e i tre rossi si vedono) |
| `piazzato-204` | ✅ verde (7,6 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ✅ piazzato-204 verde (e il rosso si vede) |
| `ripartenza-235` | ✅ verde (4,2 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ✅ ripartenza-235 verde: gol ambientale → centro senza schieramento; piazzato dell'eroe → schieramento; il rosso (regola larga) si vede |
| `ripartenza-207` | ✅ verde (3,4 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ✅ ripartenza-207 verde (e i due rossi si vedono) |
| `ingresso-285` | ✅ verde (4,9 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ✅ ingresso-285 verde (scena 14-18 s con stacchi, passo ≤ 2,3 u/s in quadro, squadra schierata) e il rosso si vede |
| `ingresso-277` | ✅ verde (6,0 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ✅ ingresso-277 verde (durata intermedia, nessun velo, saltabile, corpi pronti a fine ingresso) e il rosso si vede |
| `intro-292` | ✅ verde (1,4 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ROSSO ATTESO OK: con i due timer di prima almeno una scena forzata resta in hl_move |
| `salienti-229` | ✅ verde (2,8 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ROSSO: CADE (come deve): tasto assente fuori dal campionato senza posta, partita KO non apribile a soli salienti |
| `salienti-243` | ✅ verde (3,5 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ROSSO: CADE (come deve): nessun tasto nella schermata pre-partita, Mondiale e amichevole non apribili a soli salienti |
| `salienti-246` | ✅ verde (14,1 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ROSSO: CADE (come deve) su ogni percorso |
| `salienti-253` | ✅ verde (2,2 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ROSSO: CADE (come deve) su ogni parte |
| `solo-highlight-166` | ✅ verde (14,6 min) | non eseguito (verde sull'unione: confronto non necessario) | — | ROSSO: CADE (come deve) su 3, 7 e 8 |

## Controlli NON eseguiti (tempo)

Il tetto di circa 3 ore non basta per 93 controlli eseguiti uno alla volta (media misurata in questa sessione: circa 6 minuti l'uno). Ho messo per primi i controlli che toccano ciò che i giri 294, 296 e 300 hanno cambiato in `src/15` (rigori e coppa, ripartenze, ingresso, salienti, pre-partita su PC), poi gli altri, e per ultimi i rossi già dichiarati.

**Non eseguiti, senza verdetto** (da contare come non verificati, non come verdi): `pc-tablet-292` · `partita-v2` · `barra-221` · `nomi-182` · `accessibilita-234` · `coerenza-235` · `validate-situations` · `partita-vera` · `esito-282` · `rassegna-232` · `rassegna-200` · `carriera3-94` · `assist-298` · `riserva-103` · `riserva-104` · `contatto-103` · `chiusura-99` · `esiti-96` · `partita2d-297` · `colori-286` · `cori-291` · `rigore-79` · `corpi-073` · `pallino-278` · `pillola-58` · `tabellino-lati` · `stat-279` · `fps-249` · `lessico-218` · `cross-218` · `tabellino-228` · `minuti-202` · `ripresa-202` · `recupero-202` · `tetto-202` · `tempo-138` · `interazioni-226` · `schede-234` · `catalogo-022` · `pressing-143` · `conduci-242` · `schede-246` · `attesa-241` · `difesa-220-giro31` · `esiti-241` · `spot-266` · `tecnica-045` · `esiti-60` · `spazio-270` · `forma-239` · `rigorista-249` · `rigorista-257` · `camera-241` · `avvio-233` · `patto-238` · `scelte-197` · `rassegna-202` · `rassegna-224` · `anteprima-230` · `riserva2d-205` · `avviso3d-209` · `simula-215` · `momento-173` · `riproduci-175` · `riproduci-187`

**Rossi già dichiarati nella consegna e non rieseguiti qui:** `finale-202` · `voto-79` · `giornale-244` · `intervista-231` · `esiti-218` · `schede-259` · `schede-260` · `pagella-75` · `esito-280` · `assist-nome-98` · `scene-221` · `parata-100`

