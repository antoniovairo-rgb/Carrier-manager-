# Ricollaudo difesa 3D — checkpoint, non concluso

Base del caso registrato: commit `d5d60bedec39b2d2dfbd7ebceccfa206999f36d2`, `GAME_VERSION="7.999.91"`. Ramo: `codex/2026-10-01-ricollaudo-difesa-3d`. Il piano comprende 16 scene × 2 esiti, cioè 32 casi. Questo documento **non è il rapporto finale**.

## Stato misurato

| Casi pianificati | Casi validi | Tentativi non validi | Casi ancora senza prova valida |
| ---: | ---: | ---: | ---: |
| 32 | 10 | 2 | 22 |

Fonte: `tests/codex/ricollaudo-difesa-3d.json`; riproduzione: `$env:CPM_BATCH='1'; $env:CPM_CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'; node tests/codex/ricollaudo-difesa-3d.mjs`. Il primo caso valido era già nel checkpoint prima di questa ripresa. Non è stato ripetuto. Dopo che il PO ha liberato memoria, sono stati eseguiti il caso gi33/fail, un lotto con `$env:CPM_BATCH='3'` e un lotto con `$env:CPM_BATCH='6'`. Quest'ultimo ha concluso quattro casi; prima del quinto ha stampato «Lotto fermato: pausa o RAM iniziale sotto 2,2 GB». Dopo la chiusura del browser la RAM libera era 3,63 GiB. I casi non avviati non sono conteggiati come tentativi.

| Scena | Azione | Esito richiesto | Esito osservato | Prova |
| --- | --- | --- | --- | --- |
| 33 «Muro in area» | «Blocca con il corpo» | success | `ActionResolved.ok=true`, chiave `save`; caso valido | Sei PNG `reports/codex/ricollaudo-difesa-3d/gi33-a0-success-v91-01-apertura.png` … `06-esito.png`. |
| 33 «Muro in area» | «Blocca con il corpo» | fail | `ok=false`, `goal_against`; caso valido al terzo tentativo | Sei PNG con suffisso `-r2-`; l'ordine delle foto è corretto. |
| 133 «Recupero sulla linea di fondo» | «Sprint disperato sulla linea» | success | `ok=true`, `save`; caso valido | Sei PNG; apertura usata: `gi133-a0-success-v91-01-apertura-retry1.png`. |
| 133 «Recupero sulla linea di fondo» | stessa | fail | `ok=false`, `goal_against`; caso valido | Sei PNG; apertura usata: `gi133-a0-fail-v91-01-apertura-retry1.png`. |
| 134 «Sfida aerea» | «Stacco dominante» | success | `ok=true`, `save`; caso valido | Sei PNG; apertura `gi134-a0-success-v91-01-apertura.png`. |
| 134 «Sfida aerea» | stessa | fail | `ok=false`, `goal_against`; caso valido | Sei PNG; apertura usata: `gi134-a0-fail-v91-01-apertura-retry1.png`. |
| 138 «Allineati con la difesa» | «Allineamento difensivo immediato» | success | `ok=true`, `save`; caso valido | Sei PNG; apertura `gi138-a0-success-v91-01-apertura.png`. |
| 138 «Allineati con la difesa» | stessa | fail | `ok=false`, `through`; caso valido | Sei PNG; apertura usata: `gi138-a0-fail-v91-01-apertura-retry1.png`. |
| 168 «Ultimo uomo» | «Tackle duro — rischio rosso» | success | `ok=true`, `recovery`; caso valido | Sei PNG; apertura usata: `gi168-a0-success-v91-01-apertura-retry1.png`. |
| 168 «Ultimo uomo» | stessa | fail | `ok=false`, `foul`; caso valido | Sei PNG; apertura usata: `gi168-a0-fail-v91-01-apertura-retry1.png`. |

Nel gi33/success, pallone e giocatori sono nel quadro all'apertura; la foto dell'esito mostra 0–0 e «Salvataggio decisivo». Nel gi33/fail ripetuto, il tabellone è 0–0 nelle foto 03–05 e 0–1 nella 06: il cambio anticipato visto nella 7.999.84 **non compare in questi campioni**. La foto 05 non mostra però l'arrivo del pallone in rete, quindi la coerenza visiva completa dell'esito resta non verificata.

Nei due gi133 la prima foto acquisita a 900 ms è nera; la ripresa 32 ms dopo mostra eroe, portatore e pallone sopra la scheda. Le foto nere sono conservate come tentativi e **non** sono state usate come `01-apertura` valida. Il vecchio rilievo 001/002 non si vede nelle aperture valide di questi due casi; l'intera gestualità resta da giudicare. Per gi134, le due aperture valide mostrano i protagonisti in quadro; nel fail il contatto fisico non è misurato (`contactTrigger=timed-proxy-no-contact`). Nessun codice del taccuino assegnato automaticamente.

Nei due gi138, la foto 01 mostra prato e almeno un giocatore granata, ma **non mostra il pallone né il portatore**. Il difetto di apertura 001 segnalato nella 7.999.84 resta visibile in entrambi i casi su questa build; il titolo dice di allinearsi mentre la posizione del pallone non è leggibile. Nei due gi168, invece, la foto 01 usata mostra eroe, avversario e pallone sopra la scheda. Il fail di gi168 termina con «Fallo! Sei stato ammonito» e punteggio 0–0, compatibile con `ActionResolved.key=foul`; non va contato come gol subito.

### Confronto provvisorio con la 7.999.84

| Scena | Codici precedenti success/fail | Osservazione attuale sui casi validi |
| --- | --- | --- |
| 33 | — / 003 | Il tabellone del fail resta 0–0 fino alla foto 05; la traiettoria completa del gol resta non verificata. |
| 133 | 001,002 / 001,002,003 | Aperture utilizzabili dopo un retry di 32 ms; eroe, portatore e pallone in quadro. Gesto ed esito visivo completo non verificati. |
| 134 | 001 / 001,003 | Aperture utilizzabili; contatto del fail non misurato dal testimone. |
| 138 | 001 / 001 | **001 ancora visibile** nelle due foto 01: pallone e portatore non compaiono. |
| 168 | 001,002 / 001,002 | Aperture utilizzabili; inquadratura durante tutto il gesto ancora da giudicare. |

I codici della colonna precedente provengono da `tests/codex/precedente-difesa-84.json`. Questa tabella è un confronto dei **cinque indici già acquisiti**, non il conteggio definitivo sui 32 casi.

La macchina aveva 2,41 GiB liberi prima del primo tentativo gi33/fail; durante il caricamento è scesa sotto il limite di sicurezza di 1,5 GiB, poi è risalita a 2,63 GiB dopo la chiusura. Le letture provengono da `Get-CimInstance Win32_OperatingSystem` e dal campo `stopFreeGB` del grezzo. Un secondo tentativo gi33/fail ha prodotto le foto nell'ordine sbagliato (`04-contatto` prima di `03-rincorsa`): l'esito `ActionResolved` era corretto, ma la prova fotografica è marcata non valida nel grezzo. La sonda è stata corretta e il terzo tentativo è valido. Questi sono limiti del banco, non difetti del gioco. Non sono state misurate prestazioni o fluidità.

## Per la ripresa

Conservare il checkpoint e continuare dai casi senza una prova `valid=true`, con pagina nuova per ciascuno. La sonda verifica **3,5 GiB liberi prima di avviare Chromium**; una verifica sotto soglia ha stampato «Lotto non avviato» e lasciato invariato il contatore `runs`. La sonda controlla ora anche l'ordine 01–06 delle sei foto e non considera valido un caso con sequenza invertita. Comandi: `node --check tests/codex/ricollaudo-difesa-3d.mjs` e `$env:CPM_BATCH='1'; node tests/codex/ricollaudo-difesa-3d.mjs`. Il browser headless usa SwiftShader. Restano da produrre la tabella completa di confronto con 7.999.84, i conteggi dei codici sui 32 casi e le cinque segnalazioni più gravi. Fino ad allora tutti questi risultati sono **non verificati**.
