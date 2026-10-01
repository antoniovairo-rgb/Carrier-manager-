# PO-176 — Salvataggio e ricaricamento

**Base verificata:** main `b332f92766c5ef48ae3c1d148e33c193905e010e`, `GAME_VERSION=7.999.92`. 6 carriere, 21 punti prima/dopo, 150 differenze di campo nel salvataggio. Classi: **A 21**, **B 120**, **C 6**, **non verificato 3**. Il JSON compresso `tests/codex/salvataggio-ricarica.json.gz` contiene i salvataggi completi, gli snapshot, le cinque viste e tutti i percorsi di campo.

## Condizioni e riproduzione

Le sei carriere usano gli stessi semi e la stessa funzione di creazione del precedente career-matrix; ogni carriera ha storage isolato. Prima del reload aspetto il salvataggio, salvo `cpm-v3` e `__CPM_CAREER.snapshot()`, acquisisco Home, Calendario, Classifica, Coppe, Profilo; poi ricarico la pagina, uso Continua quando richiesto e ripeto. GLB spenti per ridurre il carico. Le foto sono nel percorso `reports/codex/salvataggio-ricarica/`.
```powershell
$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='0'; $env:CPM_OUTPUT='salvataggio-ricarica-pilot.json.gz'; node tests/codex/salvataggio-ricarica.mjs
$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='1,8,13,17,35'; $env:CPM_OUTPUT='salvataggio-ricarica-rest.json.gz'; node tests/codex/salvataggio-ricarica.mjs
$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='0,13'; $env:CPM_OUTPUT='salvataggio-ricarica-masked.json.gz'; $env:CPM_STOP_AT='S2W1'; $env:CPM_RUN_TAG='masked-'; $env:CPM_MASK_MODAL='1'; node tests/codex/salvataggio-ricarica.mjs
$env:CPM_CHROME='C:\Program Files\Google\Chrome\Application\chrome.exe'; $env:CPM_SEEDS='1,8'; $env:CPM_OUTPUT='salvataggio-ricarica-masked-1-8.json.gz'; $env:CPM_STOP_AT='S2W1'; $env:CPM_RUN_TAG='masked-'; $env:CPM_MASK_MODAL='1'; node tests/codex/salvataggio-ricarica.mjs
node tests/codex/salvataggio-ricarica-report.mjs
```

I semi 13, 17 e 35 iniziano alla stagione 2 nel career-matrix: **S1/W10 non raggiungibile** per quei semi. Gli altri checkpoint si sono cercati senza impostare artificialmente settimana o stagione. Le partite sono simulate dall’harness; il comportamento durante una partita giocata in diretta è non verificato. Per fotografare le sezioni sottostanti, negli scatti supplementari S2/W1 ho nascosto solo i modali fissi temporanei tramite DOM (nessun campo del giocatore cambiato); gli scatti originali senza questa maschera restano nella cartella delle immagini.

## Esiti per checkpoint

| Seme | Punto | Δ salvataggio | Δ snapshot | Giornate giocate perse | Giornata corrente già giocata? | Club coppa prima → dopo |
| --- | --- | ---: | ---: | ---: | --- | --- |
| 0 | S1W10 | 2 | 1 | 0 | no | assente → assente |
| 0 | S2W1 | 40 | 39 | 0 | no | assente → tor |
| 0 | post-cup | 1 | 0 | 0 | no | tor → tor |
| 0 | S3W20 | 2 | 1 | 0 | no | assente → tor |
| 1 | S1W10 | 2 | 1 | 0 | no | assente → assente |
| 1 | S2W1 | 40 | 39 | 0 | no | assente → sas |
| 1 | post-cup | 1 | 0 | 0 | no | sas → sas |
| 1 | S3W20 | 2 | 1 | 0 | no | assente → sas |
| 8 | S1W10 | 2 | 1 | 0 | no | assente → assente |
| 8 | S2W1 | 40 | 39 | 0 | no | assente → inter |
| 8 | post-cup | 1 | 0 | 0 | no | inter → inter |
| 8 | S3W20 | 2 | 1 | 0 | no | assente → inter |
| 13 | S2W1 | 2 | 1 | 0 | no | assente → assente |
| 13 | post-cup | 2 | 1 | 0 | no | assente → alb |
| 13 | S3W20 | 1 | 0 | 0 | no | alb → alb |
| 17 | S2W1 | 2 | 1 | 0 | no | assente → assente |
| 17 | post-cup | 2 | 1 | 0 | no | assente → boc |
| 17 | S3W20 | 1 | 0 | 0 | no | boc → boc |
| 35 | S2W1 | 2 | 1 | 0 | no | assente → assente |
| 35 | post-cup | 2 | 1 | 0 | no | assente → and |
| 35 | S3W20 | 1 | 0 | 0 | no | and → and |

Il calendario completo è rimasto identico in 21/21 reload; non è stata aggiunta una seconda voce né una gara giocata è tornata da giocare. La sonda `thisWeekMd()` non restituisce una gara già marcata `played` in questi checkpoint. **Un tentativo effettivo di rigiocare dall’interfaccia una giornata già disputata non è stato eseguito: non verificato.**

## Classificazione delle differenze

| Campo/famiglia | Eventi | Classe | Prima → dopo (esempio misurato) | Motivo |
| --- | ---: | --- | --- | --- |
| `agentPlan` | 3 | non verificato | null → {"season":2,"base":8.29,"target":11.19,"hold":false} | il pannello Agente calcola un valore sostitutivo, ma il verdetto a fine stagione legge il campo salvato: effetto futuro non misurato |
| `clubSponsor` | 3 | C | null → {"name":"FORTEZZA","annual":4710000,"since":2,"until":6,"clubId":"tor"} | sponsor assente prima e assegnato dopo; sezione «Sponsor di maglia» appare in Club |
| `cup.club` | 9 | B | null → "tor" | ID del club corrente completato nello stato della coppa; tabellone e calendario invariati |
| `fitnessCoachRel` | 3 | B | null → 50 | valore di default 50 già usato dalla UI e dalle formule |
| `playedMd.md.*` | 102 | B | 1 → null | registro della stagione precedente azzerato alla stagione corrente; calendario invariato |
| `playedMd.s` | 3 | B | 1 → 2 | registro della stagione precedente azzerato alla stagione corrente; calendario invariato |
| `presentedClub` | 3 | B | null → "tor" | marcatore della presentazione del club inizializzato al caricamento |
| `rival` | 3 | C | null → {"name":"Esteban Bianchi","nation":"Italia","age":19,"ovr":68,"club":{"n":"Torino Athletic","id":"juve","p":95,"lg":"Lega A","c… | rivale assente prima e presente dopo; nome visibile in Profilo |
| `savedAt` | 21 | A | 1790844987989 → 1790845025446 | metadato temporale del file; non cambia l’eroe |

**A** = differenza tecnica o di forma senza variazione del contenuto. **B** = ricostruzione da dati già salvati con lo stesso effetto. **C** = contenuto del giocatore o della UI che cambia dopo il reload. La classe misura il prima/dopo; la causa precisa resta un’ipotesi finché il team non la riproduce.

## Differenze visibili (C)

| Seme/punto | Campo | Prima → dopo | Schermata e prove |
| --- | --- | --- | --- |
| 0 S2W1 | `player.rival` | null → {"name":"Esteban Bianchi","nation":"Italia","age":19,"ovr":68,"club":{"n":"Torino Athletic","id":"juve","p":95,"lg":"Lega A","c… | profile: [prima](salvataggio-ricarica/masked-s0-S2W1-before-profile.png) / [dopo](salvataggio-ricarica/masked-s0-S2W1-after-profile.png) |
| 0 S2W1 | `player.clubSponsor` | null → {"name":"FORTEZZA","annual":4710000,"since":2,"until":6,"clubId":"tor"} | club: [prima](salvataggio-ricarica/masked-s0-S2W1-before-club.png) / [dopo](salvataggio-ricarica/masked-s0-S2W1-after-club.png) |
| 1 S2W1 | `player.rival` | null → {"name":"Esteban Bianchi","nation":"Italia","age":19,"ovr":69,"club":{"n":"Torino Athletic","id":"juve","p":95,"lg":"Lega A","c… | profile: [prima](salvataggio-ricarica/masked-s1-S2W1-before-profile.png) / [dopo](salvataggio-ricarica/masked-s1-S2W1-after-profile.png) |
| 1 S2W1 | `player.clubSponsor` | null → {"name":"FORTEZZA","annual":4462000,"since":2,"until":6,"clubId":"sas"} | club: [prima](salvataggio-ricarica/masked-s1-S2W1-before-club.png) / [dopo](salvataggio-ricarica/masked-s1-S2W1-after-club.png) |
| 8 S2W1 | `player.rival` | null → {"name":"Esteban Bianchi","nation":"Italia","age":19,"ovr":88,"club":{"n":"Torino Athletic","id":"juve","p":95,"lg":"Lega A","c… | profile: [prima](salvataggio-ricarica/masked-s8-S2W1-before-profile.png) / [dopo](salvataggio-ricarica/masked-s8-S2W1-after-profile.png) |
| 8 S2W1 | `player.clubSponsor` | null → {"name":"METEORA","annual":7918000,"since":2,"until":5,"clubId":"inter"} | club: [prima](salvataggio-ricarica/masked-s8-S2W1-before-club.png) / [dopo](salvataggio-ricarica/masked-s8-S2W1-after-club.png) |

I tre `agentPlan` nati dopo il reload nei semi 13/17/35 restano **non verificati**: il pannello Agente calcola lo stesso obiettivo sostitutivo anche se il campo manca, ma `agentPlanOutcome` (`src/18-career-app.jsx:1499`) legge solo il campo persistito a fine stagione. Un possibile effetto futuro diverso è una deduzione dal codice, non misurata nel confronto prima/dopo.

## Appendice: ogni campo diverso

I campi indicizzati come `playedMd.md.0` sono elencati singolarmente. Per i valori lunghi la tabella abbrevia; il grezzo contiene il valore integrale.
| Seme | Punto | Percorso | Classe | Prima → dopo |
| --- | --- | --- | --- | --- |
| 0 | S1W10 | `player.fitnessCoachRel` | B | null → 50 |
| 0 | S1W10 | `savedAt` | A | 1790844987989 → 1790845025446 |
| 0 | S2W1 | `player.playedMd.s` | B | 1 → 2 |
| 0 | S2W1 | `player.playedMd.md.0` | B | 1 → null |
| 0 | S2W1 | `player.playedMd.md.1` | B | 2 → null |
| 0 | S2W1 | `player.playedMd.md.2` | B | 3 → null |
| 0 | S2W1 | `player.playedMd.md.3` | B | 4 → null |
| 0 | S2W1 | `player.playedMd.md.4` | B | 5 → null |
| 0 | S2W1 | `player.playedMd.md.5` | B | 6 → null |
| 0 | S2W1 | `player.playedMd.md.6` | B | 7 → null |
| 0 | S2W1 | `player.playedMd.md.7` | B | 8 → null |
| 0 | S2W1 | `player.playedMd.md.8` | B | 9 → null |
| 0 | S2W1 | `player.playedMd.md.9` | B | 10 → null |
| 0 | S2W1 | `player.playedMd.md.10` | B | 11 → null |
| 0 | S2W1 | `player.playedMd.md.11` | B | 12 → null |
| 0 | S2W1 | `player.playedMd.md.12` | B | 13 → null |
| 0 | S2W1 | `player.playedMd.md.13` | B | 14 → null |
| 0 | S2W1 | `player.playedMd.md.14` | B | 15 → null |
| 0 | S2W1 | `player.playedMd.md.15` | B | 16 → null |
| 0 | S2W1 | `player.playedMd.md.16` | B | 17 → null |
| 0 | S2W1 | `player.playedMd.md.17` | B | 18 → null |
| 0 | S2W1 | `player.playedMd.md.18` | B | 19 → null |
| 0 | S2W1 | `player.playedMd.md.19` | B | 20 → null |
| 0 | S2W1 | `player.playedMd.md.20` | B | 21 → null |
| 0 | S2W1 | `player.playedMd.md.21` | B | 22 → null |
| 0 | S2W1 | `player.playedMd.md.22` | B | 23 → null |
| 0 | S2W1 | `player.playedMd.md.23` | B | 24 → null |
| 0 | S2W1 | `player.playedMd.md.24` | B | 25 → null |
| 0 | S2W1 | `player.playedMd.md.25` | B | 26 → null |
| 0 | S2W1 | `player.playedMd.md.26` | B | 27 → null |
| 0 | S2W1 | `player.playedMd.md.27` | B | 28 → null |
| 0 | S2W1 | `player.playedMd.md.28` | B | 29 → null |
| 0 | S2W1 | `player.playedMd.md.29` | B | 30 → null |
| 0 | S2W1 | `player.playedMd.md.30` | B | 31 → null |
| 0 | S2W1 | `player.playedMd.md.31` | B | 32 → null |
| 0 | S2W1 | `player.playedMd.md.32` | B | 33 → null |
| 0 | S2W1 | `player.playedMd.md.33` | B | 34 → null |
| 0 | S2W1 | `player.cup.club` | B | null → "tor" |
| 0 | S2W1 | `player.rival` | C | null → {"name":"Esteban Bianchi","nation":"Italia","age":19,"ovr":68,"club":{"n":"Torino Athletic","id":"juve","p":95,"lg":"Lega A","c… |
| 0 | S2W1 | `player.clubSponsor` | C | null → {"name":"FORTEZZA","annual":4710000,"since":2,"until":6,"clubId":"tor"} |
| 0 | S2W1 | `player.presentedClub` | B | null → "tor" |
| 0 | S2W1 | `savedAt` | A | 1790845079900 → 1790845111110 |
| 0 | post-cup | `savedAt` | A | 1790845125216 → 1790845157513 |
| 0 | S3W20 | `player.cup.club` | B | null → "tor" |
| 0 | S3W20 | `savedAt` | A | 1790845244162 → 1790845277605 |
| 1 | S1W10 | `player.fitnessCoachRel` | B | null → 50 |
| 1 | S1W10 | `savedAt` | A | 1790845425412 → 1790845460645 |
| 1 | S2W1 | `player.playedMd.s` | B | 1 → 2 |
| 1 | S2W1 | `player.playedMd.md.0` | B | 1 → null |
| 1 | S2W1 | `player.playedMd.md.1` | B | 2 → null |
| 1 | S2W1 | `player.playedMd.md.2` | B | 3 → null |
| 1 | S2W1 | `player.playedMd.md.3` | B | 4 → null |
| 1 | S2W1 | `player.playedMd.md.4` | B | 5 → null |
| 1 | S2W1 | `player.playedMd.md.5` | B | 6 → null |
| 1 | S2W1 | `player.playedMd.md.6` | B | 7 → null |
| 1 | S2W1 | `player.playedMd.md.7` | B | 8 → null |
| 1 | S2W1 | `player.playedMd.md.8` | B | 9 → null |
| 1 | S2W1 | `player.playedMd.md.9` | B | 10 → null |
| 1 | S2W1 | `player.playedMd.md.10` | B | 11 → null |
| 1 | S2W1 | `player.playedMd.md.11` | B | 12 → null |
| 1 | S2W1 | `player.playedMd.md.12` | B | 13 → null |
| 1 | S2W1 | `player.playedMd.md.13` | B | 14 → null |
| 1 | S2W1 | `player.playedMd.md.14` | B | 15 → null |
| 1 | S2W1 | `player.playedMd.md.15` | B | 16 → null |
| 1 | S2W1 | `player.playedMd.md.16` | B | 17 → null |
| 1 | S2W1 | `player.playedMd.md.17` | B | 18 → null |
| 1 | S2W1 | `player.playedMd.md.18` | B | 19 → null |
| 1 | S2W1 | `player.playedMd.md.19` | B | 20 → null |
| 1 | S2W1 | `player.playedMd.md.20` | B | 21 → null |
| 1 | S2W1 | `player.playedMd.md.21` | B | 22 → null |
| 1 | S2W1 | `player.playedMd.md.22` | B | 23 → null |
| 1 | S2W1 | `player.playedMd.md.23` | B | 24 → null |
| 1 | S2W1 | `player.playedMd.md.24` | B | 25 → null |
| 1 | S2W1 | `player.playedMd.md.25` | B | 26 → null |
| 1 | S2W1 | `player.playedMd.md.26` | B | 27 → null |
| 1 | S2W1 | `player.playedMd.md.27` | B | 28 → null |
| 1 | S2W1 | `player.playedMd.md.28` | B | 29 → null |
| 1 | S2W1 | `player.playedMd.md.29` | B | 30 → null |
| 1 | S2W1 | `player.playedMd.md.30` | B | 31 → null |
| 1 | S2W1 | `player.playedMd.md.31` | B | 32 → null |
| 1 | S2W1 | `player.playedMd.md.32` | B | 33 → null |
| 1 | S2W1 | `player.playedMd.md.33` | B | 34 → null |
| 1 | S2W1 | `player.cup.club` | B | null → "sas" |
| 1 | S2W1 | `player.rival` | C | null → {"name":"Esteban Bianchi","nation":"Italia","age":19,"ovr":69,"club":{"n":"Torino Athletic","id":"juve","p":95,"lg":"Lega A","c… |
| 1 | S2W1 | `player.clubSponsor` | C | null → {"name":"FORTEZZA","annual":4462000,"since":2,"until":6,"clubId":"sas"} |
| 1 | S2W1 | `player.presentedClub` | B | null → "sas" |
| 1 | S2W1 | `savedAt` | A | 1790845502820 → 1790845529880 |
| 1 | post-cup | `savedAt` | A | 1790845544830 → 1790845574795 |
| 1 | S3W20 | `player.cup.club` | B | null → "sas" |
| 1 | S3W20 | `savedAt` | A | 1790845645819 → 1790845678377 |
| 8 | S1W10 | `player.fitnessCoachRel` | B | null → 50 |
| 8 | S1W10 | `savedAt` | A | 1790845716285 → 1790845745337 |
| 8 | S2W1 | `player.playedMd.s` | B | 1 → 2 |
| 8 | S2W1 | `player.playedMd.md.0` | B | 1 → null |
| 8 | S2W1 | `player.playedMd.md.1` | B | 2 → null |
| 8 | S2W1 | `player.playedMd.md.2` | B | 3 → null |
| 8 | S2W1 | `player.playedMd.md.3` | B | 4 → null |
| 8 | S2W1 | `player.playedMd.md.4` | B | 5 → null |
| 8 | S2W1 | `player.playedMd.md.5` | B | 6 → null |
| 8 | S2W1 | `player.playedMd.md.6` | B | 7 → null |
| 8 | S2W1 | `player.playedMd.md.7` | B | 8 → null |
| 8 | S2W1 | `player.playedMd.md.8` | B | 9 → null |
| 8 | S2W1 | `player.playedMd.md.9` | B | 10 → null |
| 8 | S2W1 | `player.playedMd.md.10` | B | 11 → null |
| 8 | S2W1 | `player.playedMd.md.11` | B | 12 → null |
| 8 | S2W1 | `player.playedMd.md.12` | B | 13 → null |
| 8 | S2W1 | `player.playedMd.md.13` | B | 14 → null |
| 8 | S2W1 | `player.playedMd.md.14` | B | 15 → null |
| 8 | S2W1 | `player.playedMd.md.15` | B | 16 → null |
| 8 | S2W1 | `player.playedMd.md.16` | B | 17 → null |
| 8 | S2W1 | `player.playedMd.md.17` | B | 18 → null |
| 8 | S2W1 | `player.playedMd.md.18` | B | 19 → null |
| 8 | S2W1 | `player.playedMd.md.19` | B | 20 → null |
| 8 | S2W1 | `player.playedMd.md.20` | B | 21 → null |
| 8 | S2W1 | `player.playedMd.md.21` | B | 22 → null |
| 8 | S2W1 | `player.playedMd.md.22` | B | 23 → null |
| 8 | S2W1 | `player.playedMd.md.23` | B | 24 → null |
| 8 | S2W1 | `player.playedMd.md.24` | B | 25 → null |
| 8 | S2W1 | `player.playedMd.md.25` | B | 26 → null |
| 8 | S2W1 | `player.playedMd.md.26` | B | 27 → null |
| 8 | S2W1 | `player.playedMd.md.27` | B | 28 → null |
| 8 | S2W1 | `player.playedMd.md.28` | B | 29 → null |
| 8 | S2W1 | `player.playedMd.md.29` | B | 30 → null |
| 8 | S2W1 | `player.playedMd.md.30` | B | 31 → null |
| 8 | S2W1 | `player.playedMd.md.31` | B | 32 → null |
| 8 | S2W1 | `player.playedMd.md.32` | B | 33 → null |
| 8 | S2W1 | `player.playedMd.md.33` | B | 34 → null |
| 8 | S2W1 | `player.cup.club` | B | null → "inter" |
| 8 | S2W1 | `player.rival` | C | null → {"name":"Esteban Bianchi","nation":"Italia","age":19,"ovr":88,"club":{"n":"Torino Athletic","id":"juve","p":95,"lg":"Lega A","c… |
| 8 | S2W1 | `player.clubSponsor` | C | null → {"name":"METEORA","annual":7918000,"since":2,"until":5,"clubId":"inter"} |
| 8 | S2W1 | `player.presentedClub` | B | null → "inter" |
| 8 | S2W1 | `savedAt` | A | 1790845789289 → 1790845816657 |
| 8 | post-cup | `savedAt` | A | 1790845829636 → 1790845860282 |
| 8 | S3W20 | `player.cup.club` | B | null → "inter" |
| 8 | S3W20 | `savedAt` | A | 1790846242094 → 1790846316213 |
| 13 | S2W1 | `player.agentPlan` | non verificato | null → {"season":2,"base":8.29,"target":11.19,"hold":false} |
| 13 | S2W1 | `savedAt` | A | 1790846390407 → 1790846491809 |
| 13 | post-cup | `player.cup.club` | B | null → "alb" |
| 13 | post-cup | `savedAt` | A | 1790846639334 → 1790846683145 |
| 13 | S3W20 | `savedAt` | A | 1790846706106 → 1790846743565 |
| 17 | S2W1 | `player.agentPlan` | non verificato | null → {"season":2,"base":39.7,"target":53.6,"hold":false} |
| 17 | S2W1 | `savedAt` | A | 1790846781709 → 1790846821569 |
| 17 | post-cup | `player.cup.club` | B | null → "boc" |
| 17 | post-cup | `savedAt` | A | 1790846904623 → 1790846937412 |
| 17 | S3W20 | `savedAt` | A | 1790846957402 → 1790846988408 |
| 35 | S2W1 | `player.agentPlan` | non verificato | null → {"season":2,"base":32.41,"target":43.75,"hold":false} |
| 35 | S2W1 | `savedAt` | A | 1790847018684 → 1790847051595 |
| 35 | post-cup | `player.cup.club` | B | null → "and" |
| 35 | post-cup | `savedAt` | A | 1790847128618 → 1790847163064 |
| 35 | S3W20 | `savedAt` | A | 1790847181781 → 1790847205915 |

## Limiti

- Le schermate possono contenere modali transitori generati dalla simulazione settimanale. I semplici cambi di toast, orologio o modale non sono contati come perdita di dati; le differenze sono ancorate ai campi dello stato.
- I salvataggi sono seedati dall’harness: la frequenza in carriere iniziate manualmente è non verificata.
- Il club della coppa è confrontato con l’ID del club dell’eroe; la completezza di tutti gli accoppiamenti della coppa è non verificata.
- Nessuna modifica al gioco, nessuna patch proposta.
