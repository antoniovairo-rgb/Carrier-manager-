# Collaudo esterno delle carriere — 7.999.86

**Eseguito davvero:** 14 carriere avviate, 14 con almeno 10 stagioni, 140 stagioni concluse, 5474 settimane osservate, 7000897 ms di esecuzione dello script. Commit base `5f89267e970ea256f9917ff6c695e873969454d7`. Il grezzo consegnato è `tests/codex/collaudo-carriere.json.gz`; il comando di riproduzione genera prima `tests/codex/collaudo-carriere-matrix86.json` e poi lo comprime.

**Non eseguito o non verificato:** campione richiesto 60 × 10 (ripiego 30 × 10), sei carriere fino al ritiro, 20 coppie biforcate, gemelli economici, riferimenti reali alla nazionale con fonte, lettura visiva di ogni testo; indicare questi punti come non verificato anche se il rapporto contiene altri indizi. La base dichiarata nella scheda era 7.999.83; il collaudo è stato ripreso sulla main disponibile 7.999.86, senza modifiche al gioco.

## Le 10 anomalie più gravi osservate

| # | Seme | S/W | Gravità | Tipo | Ripetizioni | Prima osservazione |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 17 | 3/2 | alta | standings-goals | 19 | GF=21, GA=15 |
| 2 | 35 | 3/2 | alta | standings-goals | 19 | GF=34, GA=37 |
| 3 | 4 | 4/3 | alta | standings-goals | 3 | GF=47, GA=48 |
| 4 | 1 | ?/? | media | loan-parentClub-pageerror | 1 | 2 errori JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 |
| 5 | 2 | ?/? | media | loan-parentClub-pageerror | 1 | 2 errori JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 |
| 6 | 8 | ?/? | media | loan-parentClub-pageerror | 1 | 2 errori JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 |
| 7 | 13 | ?/? | media | loan-parentClub-pageerror | 1 | 1 errore JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 |
| 8 | 0 | 3/1 | media | save-restore | 1 | Snapshot diverso al reload: playedMd.s, playedMd.md, cup.club; dettagli prima/dopo nella tabella seguente |
| 9 | 1 | 3/1 | media | save-restore | 1 | Snapshot diverso al reload: playedMd.s, playedMd.md, cup.club; dettagli prima/dopo nella tabella seguente |
| 10 | 8 | 10/39 | media | national-zero-high-ovr | 1 | 10 stagioni, OVR massimo 96, presenze nazionale registrate sempre 0 |

Le voci sono osservazioni del collaudo: restano ipotesi di difetto del gioco finché il team non le riproduce. Gli interventi dell’harness sono limiti del test.

## Cinque controlli prioritari per il team

1. Analizzare lo scarto GF/GA della classifica: il seme 17 lo riproduce; il seme 35 e la causa restano da verificare.
2. Riprodurre l’errore `parentClub` nelle notifiche differite di fine prestito (`src/18-career-app.jsx:4839,4847,4856,4859`).
3. Classificare campo per campo le differenze di salvataggio dopo il reload, separando rigenerazione prevista da perdita visibile.
4. Verificare nella UI rinnovi, ruoli sintetici e contenuti narrativi con testimoni che includano minuti e stato del capitano.
5. Eseguire gemelli di scelta e investimento prima di attribuire effetti causali a stile o economia.

## Riproduzione e perimetro

Da radice repository, in PowerShell:
```powershell
$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='0,1,2,4,8,9,13,17,19,22,26,29,31,35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; $env:CPM_OUTPUT='collaudo-carriere-matrix86.json'; node tests/codex/career-matrix.mjs
node tests/codex/career-report.mjs
```
La matrice applica ruoli e valori iniziali sintetici nel salvataggio: il percorso normale di creazione fissa Attaccante (`src/17-menu-creazione-pannelli.jsx:291`). I profili forti partono già da OVR elevato; il numero di carriere dominanti **non** misura la difficoltà della creazione normale. Lo stile etichettato governa soltanto la gestione delle offerte forzate nello script; le scelte di intervista sono state completate con il primo pulsante attivo. Le differenze causali fra stili sono quindi **non verificate**. Il test imposta `__CPM_GLB=false` e `__CPM_SIM_NAT=1`.

## Copertura

| Seme | Partenza | Forza | Stile | Ruolo sintetico | Lega richiesta | Stagioni | Passi | Stato | Errori JS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Primavera | debole | prudente | Difensore | Lega A | 10 | 799 | target-reached | 0 |
| 1 | Primavera | debole | ambizioso | Centrocampista | Premier Division | 10 | 821 | target-reached | 2 |
| 2 | Primavera | debole | casuale | Attaccante | Liga Ibérica | 10 | 812 | target-reached | 2 |
| 4 | Primavera | media | ambizioso | Centrocampista | Ligue Nationale | 10 | 842 | target-reached | 0 |
| 8 | Primavera | forte | casuale | Attaccante | Liga Anatolica | 10 | 831 | target-reached | 2 |
| 9 | piccolo | debole | prudente | Difensore | Lega B | 10 | 800 | target-reached | 0 |
| 13 | piccolo | media | ambizioso | Centrocampista | Liga Ibérica 2 | 10 | 841 | target-reached | 1 |
| 17 | piccolo | forte | casuale | Attaccante | Deutsche Liga | 10 | 824 | target-reached | 3 |
| 19 | medio | debole | ambizioso | Centrocampista | Liga Lusitana | 10 | 827 | target-reached | 1 |
| 22 | medio | media | ambizioso | Centrocampista | Liga Anatolica | 10 | 835 | target-reached | 3 |
| 26 | medio | forte | casuale | Attaccante | Ligue Nationale 2 | 10 | 838 | target-reached | 3 |
| 29 | vertice | debole | casuale | Attaccante | Premier Division | 10 | 807 | target-reached | 2 |
| 31 | vertice | media | ambizioso | Centrocampista | Deutsche Liga | 10 | 860 | target-reached | 0 |
| 35 | vertice | forte | casuale | Attaccante | Liga Belga | 10 | 838 | target-reached | 4 |

Partenze: {"Primavera":5,"medio":3,"piccolo":3,"vertice":3}. Ruoli: {"Attaccante":6,"Centrocampista":6,"Difensore":2}. Stili dichiarati: {"ambizioso":6,"casuale":6,"prudente":2}. Leghe richieste distinte: 11 (Lega A, Premier Division, Liga Ibérica, Ligue Nationale, Liga Anatolica, Lega B, Liga Ibérica 2, Deutsche Liga, Liga Lusitana, Ligue Nationale 2, Liga Belga). Sei traiettorie deboli richieste: osservate 6.

## Invarianti e anomalie

| Tipo | Conteggio |
| --- | --- |
| harness-intervention | 93 |
| save-restore | 56 |
| standings-goals | 41 |
| loan-parentClub-pageerror | 10 |
| contract | 1 |
| national-zero-high-ovr | 1 |

Conservazione GF/GA nelle classifiche (a parità di lega la somma dei gol fatti deve uguagliare quella dei gol subiti): i casi seguenti sono osservazioni settimanali raggruppate. Il rapporto con un trasferimento precoce nella stagione precedente è una correlazione, **non** una causa verificata.

| Seme | Stagione | Settimane con scarto | Primo GF/GA | Ultimo GF/GA | Trasferimento precedente |
| --- | --- | --- | --- | --- | --- |
| 4 | 4 | 3 | GF=47, GA=48 | GF=91, GA=94 | non osservato |
| 17 | 3 | 19 | GF=21, GA=15 | GF=405, GA=370 | S2/W5: boc → aug |
| 35 | 3 | 19 | GF=34, GA=37 | GF=405, GA=439 | S2/W5: and → gui |

**Ripetizione indipendente del seme 17:** 19 scarti nella stagione 3, contro 19 iniziali; sequenza di stagione, settimana e GF/GA identica (99332 ms, build 7.999.86, commit 5f89267e970ea256f9917ff6c695e873969454d7). Fonte: `tests/codex/career-gf-repro17.json`. Il riscontro riguarda il percorso sintetico dell’harness, non una partita naturale. Comando integrale: `$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='2'; $env:CPM_TIME_LIMIT_MS='360000'; $env:CPM_OUTPUT='career-gf-repro17.json'; node tests/codex/career-matrix.mjs`.

Controlli di salvataggio al ricaricamento: 56; snapshot modificati: 56. I campi mutati più frequenti sono: cup.club (56), playedMd.md.0 (56), playedMd.md.1 (56), playedMd.md.10 (56), playedMd.md.11 (56), playedMd.md.12 (56), playedMd.md.13 (56), playedMd.md.14 (56), playedMd.md.15 (56), playedMd.md.16 (56), playedMd.md.17 (56), playedMd.md.18 (56), playedMd.md.19 (56), playedMd.md.2 (56), playedMd.md.20 (56). Lo snapshot diverso è verificato; perdita visibile al giocatore: **non verificato**.

| Seme | Stagione dopo reload | Uguale | Campi diversi |
| --- | --- | --- | --- |
| 0 | 3 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 0 | 5 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 0 | 7 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 0 | 9 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 1 | 3 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 1 | 5 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 1 | 7 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 1 | 9 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 2 | 3 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 2 | 5 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 2 | 7 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 2 | 9 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 4 | 3 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 4 | 5 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 4 | 7 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 4 | 9 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 8 | 3 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 8 | 5 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 8 | 7 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 8 | 9 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 9 | 4 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 9 | 6 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 9 | 8 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 9 | 10 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 13 | 4 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 13 | 6 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 13 | 8 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 13 | 10 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 17 | 4 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 17 | 6 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 17 | 8 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 17 | 10 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 19 | 4 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 19 | 6 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 19 | 8 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 19 | 10 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 22 | 4 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 22 | 6 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 22 | 8 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 22 | 10 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 26 | 4 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 26 | 6 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 26 | 8 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 26 | 10 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 29 | 4 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 29 | 6 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 29 | 8 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 29 | 10 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 31 | 4 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 31 | 6 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 31 | 8 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 31 | 10 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 35 | 4 | no | club.lg, calendar.0.opponentId, calendar.0.opponentName, calendar.1.opponentId, calendar.1.opponentName, calendar.2.opponentId, calendar.2.opponentName, calendar.3.opponentId, calendar.3.opponentName, calendar.4.opponentId, calendar.4.opponentName, calendar.5. |
| 35 | 6 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 35 | 8 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |
| 35 | 10 | no | playedMd.s, playedMd.md.0, playedMd.md.1, playedMd.md.2, playedMd.md.3, playedMd.md.4, playedMd.md.5, playedMd.md.6, playedMd.md.7, playedMd.md.8, playedMd.md.9, playedMd.md.10, playedMd.md.11, playedMd.md.12, playedMd.md.13 |

| Seme | Stagione | Campo | Prima | Dopo |
| --- | --- | --- | --- | --- |
| 0 | 3 | playedMd.s | 2 | 3 |
| 0 | 3 | playedMd.md.0 | 1 |  |
| 0 | 3 | playedMd.md.1 | 2 |  |
| 0 | 3 | playedMd.md.2 | 3 |  |
| 0 | 3 | playedMd.md.3 | 4 |  |
| 0 | 3 | playedMd.md.4 | 5 |  |
| 0 | 3 | playedMd.md.5 | 6 |  |
| 0 | 3 | playedMd.md.6 | 7 |  |
| 0 | 3 | playedMd.md.7 | 8 |  |
| 0 | 3 | playedMd.md.8 | 990 |  |
| 0 | 3 | playedMd.md.9 | 9 |  |
| 0 | 3 | playedMd.md.10 | 10 |  |
| 0 | 3 | playedMd.md.11 | 11 |  |
| 0 | 3 | playedMd.md.12 | 12 |  |
| 0 | 3 | playedMd.md.13 | 13 |  |
| 0 | 3 | playedMd.md.14 | 14 |  |
| 0 | 3 | playedMd.md.15 | 15 |  |
| 0 | 3 | playedMd.md.16 | 16 |  |
| 0 | 3 | playedMd.md.17 | 17 |  |
| 0 | 3 | playedMd.md.18 | 18 |  |
| 0 | 3 | playedMd.md.19 | 19 |  |
| 0 | 3 | playedMd.md.20 | 20 |  |
| 0 | 3 | playedMd.md.21 | 21 |  |
| 0 | 3 | playedMd.md.22 | 22 |  |
| 0 | 3 | playedMd.md.23 | 23 |  |
| 0 | 3 | playedMd.md.24 | 24 |  |
| 0 | 3 | playedMd.md.25 | 25 |  |
| 0 | 3 | playedMd.md.26 | 26 |  |
| 0 | 3 | playedMd.md.27 | 27 |  |
| 0 | 3 | playedMd.md.28 | 28 |  |
| 0 | 3 | playedMd.md.29 | 29 |  |
| 0 | 3 | playedMd.md.30 | 30 |  |
| 0 | 3 | playedMd.md.31 | 31 |  |
| 0 | 3 | playedMd.md.32 | 32 |  |
| 0 | 3 | playedMd.md.33 | 33 |  |
| 0 | 3 | playedMd.md.34 | 34 |  |
| 0 | 3 | cup.club |  | "tor" |
| 0 | 3 | rival | null | {"name":"Esteban Bianchi","nation":"Italia","age":20,"ovr":71,"club":{"n":"Torino Athletic","id":"juve","p":95,"lg":"Lega A","c":"#f5f5f5","nat":"🇮🇹"},"goals":7,"totalGoals":6,"assists":5,"trophies":0,"seasons":1,"relationship":"sconosciuto","history":[],"aw |
| 0 | 3 | presentedClub |  | "tor" |
| 0 | 5 | playedMd.md.35 | 34 |  |
| 0 | 7 | playedMd.md.36 | 33 |  |
| 0 | 7 | playedMd.md.37 | 34 |  |
| 1 | 3 | teammates.0.name | "Marco Saladino" | "Michel Willems" |
| 1 | 3 | teammates.1.name | "Lorenzo Villa" | "Hugo Peeters" |
| 1 | 3 | teammates.2.name | "Luca Silvestri" | "Quentin Martens" |
| 1 | 9 | playedMd.md.38 | 30 |  |
| 1 | 9 | playedMd.md.39 | 31 |  |
| 1 | 9 | playedMd.md.40 | 32 |  |
| 1 | 9 | playedMd.md.41 | 33 |  |
| 1 | 9 | playedMd.md.42 | 34 |  |
| 4 | 7 | playedMd.md.43 | 999 |  |
| 4 | 7 | playedMd.md.44 | 994 |  |
| 4 | 7 | playedMd.md.45 | 32 |  |
| 4 | 7 | playedMd.md.46 | 33 |  |
| 4 | 7 | playedMd.md.47 | 34 |  |
| 35 | 4 | club.lg | "Ligue Nationale 2" | "Ligue Nationale" |
| 35 | 4 | calendar.0.opponentId | "gre" | "str" |
| 35 | 4 | calendar.0.opponentName | "FC Grenoble" | "FC Strasburgo" |
| 35 | 4 | calendar.1.opponentId | "aja2" | "mtp" |
| 35 | 4 | calendar.1.opponentName | "FC Ajaccio" | "FC Montpel" |

## Varietà narrativa

Su 5474 settimane campionate: 1440 senza messaggi/diario/ID registrati. Distinti osservati: impulsi 99, vita 23, momenti 7, voci diario 16, messaggi 1131. Il log può includere resoconti ordinari delle partite; questi conteggi non equivalgono al numero di eventi di ciascun catalogo. Voci mai uscite rispetto ai cataloghi completi e prima ripetizione per catalogo: **non verificato**.

| Testo più frequente nel log | Occorrenze |
| --- | --- |
| 💬 Non tutto è arrivato — Qualche obiettivo dichiarato è rimasto per strada. | 116 |
| 📉 Obiettivi personali mancati — la promessa fatta a te stesso. | 98 |
| ❌ Mancato: Finisci nei primi 3 | 51 |
| 📈 Obiettivi personali: 1/2 — la promessa fatta a te stesso. | 38 |
| ❌ Mancato: Finisci nei primi 6 | 32 |
| ✅ Finisci nei primi 3 | 31 |
| 🏆 Coppa Nazionale: il cammino continua col nuovo club (Ottavi di Finale) | 26 |
| 🏆 Coppa Nazionale: col nuovo club riparti dai Semifinale | 23 |
| 🌍 KCC: il club ha superato il girone — entri agli Ottavi (Settimana 23) | 21 |
| 🎯 Parola mantenuta — Gli obiettivi dichiarati in conferenza sono arrivati. | 19 |

| Seme | Settimane | Senza contenuto | Impulsi distinti/ripetuti/prima ripetizione | Vita distinti/ripetuti/prima ripetizione | Momenti distinti/ripetuti/prima ripetizione |
| --- | --- | --- | --- | --- | --- |
| 0 | 391 | 98 | 92/146/4 | 21/0/— | 4/0/— |
| 1 | 391 | 113 | 97/118/5 | 23/0/— | 3/0/— |
| 2 | 391 | 99 | 97/130/5 | 23/0/— | 0/0/— |
| 4 | 391 | 109 | 93/135/4 | 21/0/— | 1/0/— |
| 8 | 391 | 89 | 98/142/4 | 22/0/— | 0/0/— |
| 9 | 391 | 92 | 87/153/5 | 22/0/— | 4/0/— |
| 13 | 391 | 112 | 88/125/5 | 22/0/— | 0/0/— |
| 17 | 391 | 113 | 88/125/6 | 22/0/— | 0/0/— |
| 19 | 391 | 106 | 88/140/5 | 23/0/— | 3/0/— |
| 22 | 391 | 96 | 87/139/5 | 21/0/— | 1/0/— |
| 26 | 391 | 104 | 88/135/5 | 22/0/— | 0/0/— |
| 29 | 391 | 104 | 87/140/5 | 22/0/— | 0/0/— |
| 31 | 391 | 98 | 88/141/5 | 22/0/— | 3/0/— |
| 35 | 391 | 107 | 87/129/5 | 22/0/— | 0/0/— |

## Coerenza narrativa C1–C8

- C1: minuti nelle ultime tre partite non presenti nel testimone (minutes=null); non verificato
- C2: verificati solo i candidati con quattro vittorie nei matchHistory osservati; le sconfitte consecutive non verificato
- C3: verificati solo i candidati testuali «il tuo gol» contro ultimo match senza gol; il riferimento temporale resta ipotesi
- C4: stato Primavera/professionista disponibile ma distinzione fra riferimento storico e attuale non verificato
- C5: stato infortunio disponibile, tempo preciso dell’evento rispetto al cambio stato non verificato
- C6: capitano non rilevato; riferimenti alla nazionale senza presenze possono riguardare convocazioni; non verificato
- C7: nomi di club/avversari nella lega non salvati nel grezzo; non verificato
- C8: due testi nella stessa settimana possono riferirsi a momenti diversi; non verificato

Candidati rilevati dalle due regole strette C2/C3: 0. Non sono difetti confermati senza ricostruzione del contesto narrativo.

| Regola | Seme | S/W | Testo | Motivo |
| --- | --- | --- | --- | --- |
| — | — | — | — | — |

## Conseguenze delle scelte

Biforcazioni identiche a 1, 5 e 20 settimane: **non verificato**. Le scelte UI compiute per sbloccare finestre sono nel grezzo `interventions`, ma non costituiscono gemelli causali.

## Nazionale

Stagioni con campo presenze nazionale numerico: 140; incremento totale osservato fra stagioni: 25. Questo non misura le partite degli NPC né il calendario delle convocazioni. Età della prima convocazione, avversari/livello, tornei e benchmark reale: **non verificato**.

| Seme | Stagione | Presenze cumulative | Incremento |
| --- | --- | --- | --- |
| 4 | 5 | 1 | 1 |
| 4 | 9 | 2 | 1 |
| 4 | 10 | 7 | 5 |
| 13 | 5 | 1 | 1 |
| 13 | 9 | 2 | 1 |
| 13 | 10 | 6 | 4 |
| 17 | 4 | 1 | 1 |
| 22 | 5 | 1 | 1 |
| 22 | 7 | 2 | 1 |
| 22 | 9 | 4 | 2 |
| 22 | 10 | 8 | 4 |
| 26 | 4 | 1 | 1 |
| 31 | 9 | 1 | 1 |
| 35 | 4 | 1 | 1 |

## Difficoltà

Soglie della scheda: dominante = almeno 3 campionati o OVR ≥88 prima dei 26 anni; fallita = OVR <70 a 25 anni o fuori dal professionismo; normale = resto. La lettura dei trofei dal grezzo è parziale; classificazioni con evidenza insufficiente sono orientative.

| Seme | Classe orientativa | Evidenza | Ultima età | Ultimo OVR | Ultime presenze |
| --- | --- | --- | --- | --- | --- |
| 0 | normale | nessuna soglia nel campione | 25 | 81 | 35 |
| 1 | normale | nessuna soglia nel campione | 25 | 80 | 38 |
| 2 | normale | nessuna soglia nel campione | 25 | 82 | 45 |
| 4 | dominante | OVR/trofei soglia | 25 | 89 | 37 |
| 8 | dominante | OVR/trofei soglia | 25 | 96 | 43 |
| 9 | normale | nessuna soglia nel campione | 29 | 78 | 0 |
| 13 | normale | nessuna soglia nel campione | 29 | 88 | 46 |
| 17 | dominante | OVR/trofei soglia | 29 | 94 | 34 |
| 19 | normale | nessuna soglia nel campione | 29 | 81 | 46 |
| 22 | normale | nessuna soglia nel campione | 29 | 88 | 46 |
| 26 | dominante | OVR/trofei soglia | 29 | 94 | 38 |
| 29 | normale | nessuna soglia nel campione | 29 | 81 | 40 |
| 31 | normale | nessuna soglia nel campione | 29 | 89 | 45 |
| 35 | dominante | OVR/trofei soglia | 29 | 94 | 38 |

Distribuzioni osservate per età, ruolo sintetico, partenza e stile dichiarato. Medie su stagioni concluse; salari nell’unità del salvataggio. I trofei non sono mediati perché il formato contiene tipi diversi e il conteggio di campionati non è normalizzato.

| Età | N | OVR medio | Gol medi | Assist medi | Valore medio | Stipendio medio |
| --- | --- | --- | --- | --- | --- | --- |
| 16 | 5 | 72 | 8 | 7 | 27.11 | 41737 |
| 17 | 5 | 74 | 10.6 | 5 | 33.19 | 77243.2 |
| 18 | 5 | 75.8 | 11.6 | 5.4 | 38.31 | 114697.4 |
| 19 | 5 | 77.2 | 10.8 | 6.2 | 45.25 | 139511 |
| 20 | 14 | 77.86 | 10.43 | 5.64 | 40.08 | 106216.29 |
| 21 | 14 | 79.64 | 14.71 | 8.86 | 53.13 | 157921.36 |
| 22 | 14 | 80.93 | 15.64 | 8.64 | 54.3 | 176321.57 |
| 23 | 14 | 82.29 | 17.36 | 9.43 | 62.09 | 198482.93 |
| 24 | 14 | 83.86 | 17.64 | 8.07 | 70.31 | 201470.71 |
| 25 | 14 | 84.93 | 17.29 | 10.07 | 67.54 | 223911.86 |
| 26 | 9 | 85.44 | 17.89 | 10.78 | 70.32 | 223837.78 |
| 27 | 9 | 86.22 | 20.44 | 10.78 | 78.27 | 251018.44 |
| 28 | 9 | 87 | 21.56 | 8.11 | 61.93 | 295801.33 |
| 29 | 9 | 87.44 | 17 | 8 | 59.27 | 303286.44 |

| Ruolo sintetico | N | OVR medio | Gol medi | Assist medi | Valore medio | Stipendio medio |
| --- | --- | --- | --- | --- | --- | --- |
| Attaccante | 60 | 86.28 | 17.8 | 8.37 | 87.49 | 290129.93 |
| Centrocampista | 60 | 80.38 | 15.62 | 9.2 | 41.18 | 148494.05 |
| Difensore | 20 | 73.15 | 9.75 | 5.65 | 14.57 | 5727.3 |

| Partenza | N | OVR medio | Gol medi | Assist medi | Valore medio | Stipendio medio |
| --- | --- | --- | --- | --- | --- | --- |
| medio | 30 | 83.63 | 16.97 | 9.67 | 62.05 | 236258.97 |
| piccolo | 30 | 83.2 | 16.33 | 8.2 | 59.93 | 213035.8 |
| Primavera | 50 | 79.3 | 13.34 | 7.64 | 52.18 | 146451.44 |
| vertice | 30 | 83.1 | 17.8 | 8.3 | 58.11 | 187685.67 |

| Stile dichiarato | N | OVR medio | Gol medi | Assist medi | Valore medio | Stipendio medio |
| --- | --- | --- | --- | --- | --- | --- |
| ambizioso | 60 | 80.38 | 15.62 | 9.2 | 41.18 | 148494.05 |
| casuale | 60 | 86.28 | 17.8 | 8.37 | 87.49 | 290129.93 |
| prudente | 20 | 73.15 | 9.75 | 5.65 | 14.57 | 5727.3 |

## Economia e Ufficio

Gemelli con/senza staff privato, accademia, investimenti e beni a 1, 3, 10 stagioni: **non verificato**. Gli importi nei singoli snapshot non dimostrano effetti causali.

## Stabilità

Errori JavaScript di pagina registrati: 23; comandi falliti: 0; carriere bloccate o fallite: 0.

`console.error` non è stato intercettato dal testimone, quindi il suo conteggio è **non verificato**.

| Seme | Errore |
| --- | --- |
| 1 | Cannot read properties of null (reading 'parentClub') |
| 1 | Cannot read properties of null (reading 'parentClub') |
| 2 | Cannot read properties of null (reading 'parentClub') |
| 2 | Cannot read properties of null (reading 'parentClub') |
| 8 | Cannot read properties of null (reading 'parentClub') |
| 8 | Cannot read properties of null (reading 'parentClub') |
| 13 | Cannot read properties of null (reading 'parentClub') |
| 17 | Cannot read properties of null (reading 'parentClub') |
| 17 | Cannot read properties of null (reading 'parentClub') |
| 17 | Cannot read properties of null (reading 'parentClub') |
| 19 | Cannot read properties of null (reading 'parentClub') |
| 22 | Cannot read properties of null (reading 'parentClub') |
| 22 | Cannot read properties of null (reading 'parentClub') |
| 22 | Cannot read properties of null (reading 'parentClub') |
| 26 | Cannot read properties of null (reading 'parentClub') |
| 26 | Cannot read properties of null (reading 'parentClub') |
| 26 | Cannot read properties of null (reading 'parentClub') |
| 29 | Cannot read properties of null (reading 'parentClub') |
| 29 | Cannot read properties of null (reading 'parentClub') |
| 35 | Cannot read properties of null (reading 'parentClub') |
| 35 | Cannot read properties of null (reading 'parentClub') |
| 35 | Cannot read properties of null (reading 'parentClub') |
| 35 | Cannot read properties of null (reading 'parentClub') |

## Elenco completo delle segnalazioni

| Seme | S/W | Tipo | Gravità | Osservato | Atteso / limite | Stato | Riproduzione |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 2/2 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='0'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 0 | 3/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":2,"after":3},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='0'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 0 | 5/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":4,"after":5},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='0'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 0 | 7/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":6,"after":7},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='0'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 0 | 9/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":8,"after":9},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='0'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 1 | 1/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='1'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 1 | 2/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='1'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 1 | 3/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":2,"after":3},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='1'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 1 | 3/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='1'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 1 | 5/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":4,"after":5},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='1'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 1 | 5/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='1'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 1 | 7/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":6,"after":7},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='1'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 1 | 7/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='1'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 1 | 9/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":8,"after":9},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='1'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 1/21 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 2/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 3/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":2,"after":3},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 3/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 4/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 5/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":4,"after":5},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 5/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 6/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 7/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":6,"after":7},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 7/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 8/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 9/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":8,"after":9},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 9/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | 10/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 2/1 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 3/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":2,"after":3},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 3/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 4/3 | standings-goals | alta | GF=47, GA=48 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 4/4 | standings-goals | alta | GF=65, GA=67 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 4/5 | standings-goals | alta | GF=91, GA=94 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 4/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 5/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":4,"after":5},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 5/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 7/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":6,"after":7},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 8/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 9/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":8,"after":9},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 4 | 10/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='4'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 1/21 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 2/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 3/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":2,"after":3},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 3/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 4/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 5/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":4,"after":5},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 5/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 6/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 7/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":6,"after":7},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 7/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 8/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 9/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":8,"after":9},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 9/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 10/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 9 | 4/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":3,"after":4},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='9'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 9 | 6/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":5,"after":6},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='9'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 9 | 8/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":7,"after":8},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='9'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 9 | 10/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":9,"after":10},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pa | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='9'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 9 | 12/1 | contract | bassa | expiresAtSeason=11<12 | invariante del tipo rispettata | falso positivo del controllo: contratto già scaduto al rollover | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='9'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 13 | 2/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='13'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 13 | 3/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='13'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 13 | 4/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":3,"after":4},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='13'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 13 | 4/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='13'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 13 | 5/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='13'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 13 | 6/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":5,"after":6},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='13'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 13 | 6/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='13'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 13 | 8/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":7,"after":8},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='13'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 13 | 9/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='13'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 13 | 10/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":9,"after":10},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pa | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='13'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 2/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/2 | standings-goals | alta | GF=21, GA=15 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/3 | standings-goals | alta | GF=49, GA=42 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/4 | standings-goals | alta | GF=69, GA=57 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/5 | standings-goals | alta | GF=83, GA=74 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/6 | standings-goals | alta | GF=102, GA=90 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/7 | standings-goals | alta | GF=126, GA=113 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/8 | standings-goals | alta | GF=151, GA=133 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/9 | standings-goals | alta | GF=170, GA=150 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/10 | standings-goals | alta | GF=170, GA=150 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/11 | standings-goals | alta | GF=199, GA=176 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/12 | standings-goals | alta | GF=231, GA=202 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/13 | standings-goals | alta | GF=259, GA=228 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/14 | standings-goals | alta | GF=279, GA=253 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/15 | standings-goals | alta | GF=305, GA=276 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/16 | standings-goals | alta | GF=328, GA=299 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/17 | standings-goals | alta | GF=349, GA=319 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/18 | standings-goals | alta | GF=377, GA=346 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/19 | standings-goals | alta | GF=405, GA=370 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/20 | standings-goals | alta | GF=405, GA=370 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 3/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 4/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":3,"after":4},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 4/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 5/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 6/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":5,"after":6},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 6/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 7/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 8/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":7,"after":8},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 8/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 9/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 10/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":9,"after":10},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pa | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 10/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | 11/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 19 | 2/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='19'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 19 | 4/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":3,"after":4},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='19'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 19 | 5/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='19'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 19 | 6/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":5,"after":6},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='19'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 19 | 6/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='19'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 19 | 7/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='19'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 19 | 8/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":7,"after":8},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='19'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 19 | 10/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":9,"after":10},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pa | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='19'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 2/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 2/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 3/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 4/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":3,"after":4},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 4/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 4/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 5/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 6/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":5,"after":6},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 6/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 7/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 8/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":7,"after":8},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 9/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | 10/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":9,"after":10},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pa | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 2/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 3/21 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 4/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":3,"after":4},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 4/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 5/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 6/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":5,"after":6},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 6/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 7/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 8/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":7,"after":8},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 8/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 9/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 10/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":9,"after":10},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pa | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 10/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | 11/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 2/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 3/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 4/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":3,"after":4},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 4/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 5/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 6/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":5,"after":6},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 6/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 7/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 8/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":7,"after":8},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 8/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 9/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 10/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":9,"after":10},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pa | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 10/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | 11/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 31 | 4/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":3,"after":4},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='31'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 31 | 6/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":5,"after":6},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='31'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 31 | 8/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":7,"after":8},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='31'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 31 | 10/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":9,"after":10},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pa | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='31'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 31 | 10/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='31'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 31 | 10/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='31'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 2/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/2 | standings-goals | alta | GF=34, GA=37 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/3 | standings-goals | alta | GF=54, GA=55 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/4 | standings-goals | alta | GF=90, GA=92 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/5 | standings-goals | alta | GF=110, GA=113 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/6 | standings-goals | alta | GF=140, GA=144 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/7 | standings-goals | alta | GF=152, GA=157 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/8 | standings-goals | alta | GF=174, GA=180 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/9 | standings-goals | alta | GF=198, GA=210 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/10 | standings-goals | alta | GF=198, GA=210 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/11 | standings-goals | alta | GF=217, GA=233 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/12 | standings-goals | alta | GF=234, GA=251 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/13 | standings-goals | alta | GF=262, GA=281 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/14 | standings-goals | alta | GF=285, GA=306 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/15 | standings-goals | alta | GF=303, GA=326 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/16 | standings-goals | alta | GF=330, GA=353 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/17 | standings-goals | alta | GF=359, GA=383 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/18 | standings-goals | alta | GF=381, GA=411 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/19 | standings-goals | alta | GF=405, GA=439 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/20 | standings-goals | alta | GF=405, GA=439 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 3/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 4/1 | save-restore | media | snapshot changed after reload: [{"path":"club.lg","before":"Ligue Nationale 2","after":"Ligue Nationale"},{"path":"calendar.0.opponentId","before":"gre","after":"str"},{"path":"calendar.0.opponentName","before":"FC Grenoble","after":"FC Strasburgo"},{"path":"c | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 4/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 5/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 6/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":5,"after":6},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 6/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 7/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 8/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":7,"after":8},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pat | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 8/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 9/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 10/1 | save-restore | media | snapshot changed after reload: [{"path":"playedMd.s","before":9,"after":10},{"path":"playedMd.md.0","before":1},{"path":"playedMd.md.1","before":2},{"path":"playedMd.md.2","before":3},{"path":"playedMd.md.3","before":4},{"path":"playedMd.md.4","before":5},{"pa | snapshot invariato salvo rigenerazioni documentate | differenza verificata; impatto non verificato | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 10/22 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | 11/7 | harness-intervention | media | goScreen dashboard from clubPresentation | nessun intervento strumentale | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | 10/39 | national-zero-high-ovr | media | 10 stagioni, OVR massimo 96, presenze nazionale registrate sempre 0 | invariante del tipo rispettata | ipotesi | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 1 | ?/? | loan-parentClub-pageerror | media | 2 errori JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='1'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 2 | ?/? | loan-parentClub-pageerror | media | 2 errori JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='2'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 8 | ?/? | loan-parentClub-pageerror | media | 2 errori JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='8'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 13 | ?/? | loan-parentClub-pageerror | media | 1 errore JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='13'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 17 | ?/? | loan-parentClub-pageerror | media | 3 errori JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='17'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 19 | ?/? | loan-parentClub-pageerror | media | 1 errore JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='19'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 22 | ?/? | loan-parentClub-pageerror | media | 3 errori JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='22'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 26 | ?/? | loan-parentClub-pageerror | media | 3 errori JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='26'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 29 | ?/? | loan-parentClub-pageerror | media | 2 errori JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='29'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |
| 35 | ?/? | loan-parentClub-pageerror | media | 4 errori JS «Cannot read properties of null (reading 'parentClub')»; letture in richiami ritardati src/18-career-app.jsx:4839,4847,4856; _loanE3=null a riga 4859 | invariante del tipo rispettata | verificata | $env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='35'; $env:CPM_MAX_SEASONS='10'; $env:CPM_TIME_LIMIT_MS='7800000'; node tests/codex/career-matrix.mjs |

Limiti dichiarati dal processo: nessuno. Errori di comando nel grezzo: 0. La fonte consegnata dei numeri è `tests/codex/collaudo-carriere.json.gz`, generata dal comando integrale sopra.
