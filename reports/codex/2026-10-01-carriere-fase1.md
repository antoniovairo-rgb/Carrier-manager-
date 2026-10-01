# Collaudo carriere — fase 1 (rapporto intermedio)

**Stato: NON COMPLETO.** 5 carriere nuove sulla 7.999.94, 43 stagioni concluse; 14 carriere precedenti sulla 7.999.86 (140 stagioni). Le 14 carriere precedenti non sono prove sulla nuova build. Mancano il campione di almeno 30 carriere, i percorsi naturali validi, i ritiri e le prove biforcate richieste dalla scheda.

## Fonti e riproduzione

| Grezzo | Versione | Commit | Carriere | Stagioni | Durata misurata | Comando |
| --- | --- | --- | --- | --- | --- | --- |
| carriere-fase1-sintetiche-a.json | 7.999.94 | d470b2a9ff2aa6318c77bb15f1c41e632963fe4d | 5 | 43 | 2527409 ms | $env:CPM_SEEDS='3,6,10,15,20,27'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7200000'; $env:CPM_OUTPUT='carriere-fase1-sintetiche-a.json'; node tests/codex/career-matrix.mjs |

Base precedente: `codex/2026-10-collaudo-carriere:tests/codex/collaudo-carriere.json.gz`, versione 7.999.86, commit `5f89267e970ea256f9917ff6c695e873969454d7`. Aggregazione: `$env:CPM_INPUTS='carriere-fase1-sintetiche-a.json'; node tests/codex/carriere-fase1-report.mjs`.

## Campione e stabilità

| Seme | Percorso | Ruolo | Stagioni/10 | Stato | Errori JS | Interventi harness |
| --- | --- | --- | --- | --- | --- | --- |
| 3 | sintetico | Difensore | 10 | target-reached | 0 | 42 |
| 6 | sintetico | Difensore | 7 | blocked | 0 | 19 |
| 10 | sintetico | Centrocampista | 10 | target-reached | 0 | 27 |
| 15 | sintetico | Difensore | 10 | target-reached | 0 | 36 |
| 20 | sintetico | Attaccante | 6 | running | 0 | 10 |

Totale con 10 stagioni: 3. Carriere dal percorso normale: 0. Fino al ritiro: 0. Portiere nel percorso normale: non verificato; il ruolo è fisso ad Attaccante nella creazione UI di questa build.

## Piloti non inclusi nel campione principale

| Grezzo | Carriere | Stagioni | Esito | Errore o limite osservato | Riproducibilità |
| --- | --- | --- | --- | --- | --- |
| carriere-fase1-portiere-pilot.json | 1 | 1 | target-reached | nessuno | $env:CPM_SEEDS='30'; $env:CPM_GOALKEEPER_SEEDS='30'; $env:CPM_MAX_SEASONS='1'; $env:CPM_OUTPUT='carriere-fase1-portiere-pilot.json'; node tests/codex/career-matrix.mjs |
| carriere-fase1-natural-pilot.json | 1 | 0 | command-failed | page.waitForFunction: Timeout 240000ms exceeded. | non ripetibile con il matrix attualmente salvato |
| carriere-fase1-natural-pilot2.json | 0 | 0 | nessuna carriera | causa non registrata | non ripetibile con il matrix attualmente salvato |

Il primo pilota naturale si è fermato per un timeout del banco nella creazione; il secondo ha prodotto zero carriere e non ha registrato la causa. Il file `career-matrix.mjs` conservato in questo ramo non legge `CPM_NATURAL_SEEDS`: le due esecuzioni naturali precedenti non sono oggi ripetibili con quel comando. Questi risultati non dimostrano un errore del percorso normale del gioco. Il pilota portiere ha completato una stagione sintetica: non soddisfa né il requisito di dieci stagioni né quello del percorso naturale.

Pilota UI separato: comando $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; $env:CPM_SEED='30'; node tests/codex/creazione-naturale-pilot.mjs. Creato il personaggio QA Naturale 30 dall’interfaccia, 0 provini conclusi. Il guardiano memoria ha interrotto il browser: memoryAbort=true, durata 20722 ms. Fonte: tests/codex/creazione-naturale-pilot.json. Il clic sul primo provino non è arrivato a completamento; questo è un limite della macchina e del banco, non un difetto di gioco verificato.

## Anomalie osservate

| Tipo | Conteggio | Primo esempio |
| --- | --- | --- |
| contract | 198 | seme 3, S6 / W1: expiresAtSeason=5<6 |
| save-restore | 18 | seme 3, S3 / W1: snapshot changed after reload: [{"path":"playedMd.s","before":2,"after":3},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before": |
| harness-intervention | 15 | seme 3, S2 / W2: goScreen dashboard from clubPresentation |
| stuck | 1 | seme 6, S8 / W21: season/week unchanged for 9 steps; last step=simulated; screen=dashboard |

I conteggi sono osservazioni ripetute nei passaggi settimanali, non contratti o salvataggi distinti. Le differenze di reload non sono qui classificate come perdite. Le anomalie sono fatti del test automatico; un difetto visibile nell’interfaccia resta non verificato se non è stato riprodotto lì.

## Confronto con 7.999.86

| Segnale | 7.999.86 | Build attuale |
| --- | --- | --- |
| Errori JS parentClub | 23 | 0 |
| Osservazioni GF/GA | 41 | 0 |
| Carriere con differenze al reload | 14 | 5 |
| Stagioni a zero presenze | 1 | 10 |

I campioni sono di versioni e semi diversi: le differenze di conteggio non dimostrano da sole una correzione.

## 4. Scelte biforcate

20 coppie su due stagioni: **non verificato** finché non sono presenti nel grezzo due rami dello stesso salvataggio con una sola scelta diversa.

## 5. Gemelli economici

5 coppie staff/accademia/investimenti contro controllo: **non verificato**.

## 6. Impulsi ed eventi

Identificativi osservati nei campioni nuovi: 128; ripetuti almeno due volte: 119. La condizione dichiarata e il seguito causale sono **non verificati** da questi contatori.
| ID | Occorrenze |
| --- | --- |
| impulses:wi_insonnia | 14 |
| impulses:wi_intervista_sorpresa | 14 |
| impulses:wi_scuola_calcio | 14 |
| impulses:wi_asta_maglia | 14 |
| impulses:wi_crioterapia | 14 |
| impulses:wi_donazione | 13 |
| impulses:wi_media | 13 |
| impulses:wi_primo_mister | 13 |
| impulses:wi_mental_coach | 13 |
| impulses:wi_compagno_prestito | 13 |
| impulses:wi_analisi_video | 13 |
| impulses:wi_giovani_accademia | 13 |
| impulses:wi_campo_bagnato | 13 |
| impulses:wi_genitori_tribuna | 13 |
| impulses:wi_ristorante_socio | 13 |


## 7. Nazionale

| Seme | Età prima stagione con presenze | OVR | Presenze a fine stagione |
| --- | --- | --- | --- |
| 6 | 18 | 92 | 1 |
| 15 | 21 | 88 | 1 |

Il primo anno con presenze non è necessariamente la prima convocazione. Le convocazioni senza presenze e la variante senza `__CPM_SIM_NAT=1` restano **non verificate**.

## 8. Difficoltà

| Fascia età | Stagioni osservate | Voto medio | Gol+assist/partita |
| --- | --- | --- | --- |
| 17–20 | 11 | 6.09 | 0.56 |
| 21–25 | 22 | 5.97 | 0.45 |
| 26–30 | 8 | 6.06 | 0.52 |
| 31+ | 0 | non verificato | non verificato |

Titolare %, trofei per fascia, dominio del percorso normale: **non verificato** senza relativo campione.

## 9. Economia e Ufficio

Gli effetti di ciascuna voce entro due stagioni e le voci mai usate sono **non verificati** senza gemelli economici.

## 10. Ricontrollo classifica e fine prestito

Errori JS con «parentClub» nei campioni nuovi: 0. Osservazioni GF/GA: 0. Ogni caso deve essere letto nel grezzo prima di attribuire una causa.
