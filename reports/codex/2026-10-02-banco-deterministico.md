# Banco deterministico e carriere — CPM 7.999.105

Base verificata: `b2094979df9c6fdce4bc8c62b836cde43fac8eef`, `GAME_VERSION="7.999.105"`. Ramo `codex/2026-10-02-banco-deterministico`. Solo sonde e rapporti esterni; nessun file del gioco modificato.

## A. Difesa 3D

La sonda `tests/codex/banco-difesa-3d.mjs` applica l'orologio virtuale, il seme per scena e la risoluzione dopo tre letture ferme trascritti da `tests/visual/inquadratura-185.mjs`. Prevede le 16 scene, i due esiti, entrambi i corpi e due prove identiche per gi33, 133, 45 e 24. Registra `__CPM_FRAME480`, `ActionResolved`, sei scatti per il primo giro e ogni tentativo scartato in `tests/codex/banco-difesa-3d.json`.

**Esecuzione parziale; giudizio 001/002/003 non verificato.** Il grezzo `tests/codex/banco-difesa-3d.json.gz` contiene 82 tentativi, nessuno valido: 63 respinti dalla soglia di memoria del banco, 9 senza assestamento del pallone entro 25 s virtuali, 8 senza un `ActionResolved` concorde, 2 passati a `hl_result` prima della risoluzione. I 13 PNG in `reports/codex/banco-difesa-3d/` sono prove dei tentativi scartati, non casi valutati. Conteggio riproducibile: `node -e "const d=require('./tests/codex/banco-difesa-3d.json');const c={};for(const x of d.cases)c[x.rejected||'valido']=(c[x.rejected||'valido']||0)+1;console.log(c)"` dopo aver decompresso il `.gz` con Node.

Con memoria libera sopra 5 GB, il comando `$env:CPM_SCENES='45'; $env:CPM_MODE='0'; $env:CPM_OUTCOME='success'; $env:CPM_REPEAT='1'; $env:CPM_NO_SHOTS='1'; node tests/codex/banco-difesa-3d.mjs` ha prodotto 29 letture `__CPM_FRAME480`, ma `phaseBefore:'hl_result'`, `ActionResolved:null`: **caso scartato**. La risoluzione dopo tre fotogrammi con pallone fermo scatta solo quando la scena è già nell'esito. La sonda ora interrompe la prova appena la fase esce da `hl_choose` prima dell'assestamento; i tentativi storici restano nel grezzo. Il guardiano originale `tests/visual/inquadratura-185.mjs` riporta quote di quadro ma non richiede `ActionResolved`; le sue percentuali, da sole, non convalidano l'esito richiesto. Questa è una limitazione verificata del protocollo di prova, non una prova di difetto del gioco. Mancano i 64 casi validi e le ripetizioni per quattro scene. Ripresa: `node tests/codex/banco-difesa-3d.mjs` dopo che il protocollo di assestamento sia stato reso valido; il checkpoint conserva tutti gli scarti.

## B. Europeo del seme 6

La sonda `tests/codex/banco-europeo-181.mjs` riprende il banco carriere esterno con `__CPM_SIM_NAT=1`, forza il seme 6, registra i passi fra S8/W19 e W25 e conserva un checkpoint a fine stagione. Il primo avvio è stato interrotto dopo sei stagioni per liberare memoria; la seconda esecuzione dalla stagione 1 è arrivata oltre W24 senza blocco. Dal suo checkpoint S8/W1 sono state poi eseguite due prove appaiate con lo stesso salvataggio: una normale e una con `CPM_RED181=1`. La sonda non azzera il torneo quando compare `blocked:`: in tal caso avrebbe salvato il blocco come esito.

| Braccio appaiato | Flag letto in pagina | Passi del banco | Prima fase `group` | Stato a W24 | `blocked:euroMondiale` |
| --- | --- | ---: | --- | --- | --- |
| Normale | `false` | 56 | S8/W21 | `done` | 0 |
| Rosso `__CPM_NO181=1` | `true` | 56 | S8/W21 | `done` | 0 |

Comandi, dalla radice del repository (PowerShell):

```powershell
$env:CPM_RED181='0'; $env:CPM_RESUME181='tests/codex/banco-europeo-181-checkpoint-s8.json'; $env:CPM_TIME_LIMIT_MS='900000'; $env:CPM_OUTPUT='banco-europeo-181-verde-appaiato.json'; node tests/codex/banco-europeo-181.mjs
$env:CPM_RED181='1'; $env:CPM_RESUME181='tests/codex/banco-europeo-181-checkpoint-s8.json'; $env:CPM_TIME_LIMIT_MS='900000'; $env:CPM_OUTPUT='banco-europeo-181-rosso.json'; node tests/codex/banco-europeo-181.mjs
```

Grezzo: `tests/codex/banco-europeo-181-appaiato.json.gz`, percorso completo dalla stagione 1 in `tests/codex/banco-europeo-181-verde-full.json.gz`, checkpoint `tests/codex/banco-europeo-181-checkpoint-s8.json`. Il braccio rosso **non riproduce** il blocco atteso. In `src/18-career-app.jsx:3351` la simulazione della seconda qualificazione può passare direttamente a `phase:"group"` nella stessa W21; il guardiano di attesa a `:702` riguarda invece `phase:"qualificazioni"` con `qualDone=true`. Questa è una spiegazione coerente col codice e col tracciato, ma il percorso naturale senza `__CPM_SIM_NAT` è **non verificato**. Anche l'aspettativa «group alla W24» non è soddisfatta nel banco sintetico: a W24 il torneo è già `done`.

## C. Contratti del vecchio grezzo

Fonte: `tests/codex/carriere-fase1-sintetiche-a.json` sul ramo `codex/2026-10-01-carriere-fase1`, versione 7.999.94. Riproduzione offline: impostare `CPM_OLD_CAREERS` al percorso del grezzo e lanciare `node tests/codex/banco-contratti.mjs`; risultati in `tests/codex/banco-contratti-vecchi.json.gz`.

| Misura | Risultato verificato |
| --- | ---: |
| Osservazioni `contract` | 198 |
| Coppie distinte seme/stagione/settimana | 198 |
| Seme 3 | 41 (S6/W1, S10/W1–39, S11/W1) |
| Seme 15 | 157 (S6–9/W1–39, S10/W1) |

Per coppia seme/scadenza, le righe si raccolgono in tre gruppi: seme 3 con scadenza S5 (1 osservazione a S6/W1), seme 3 con scadenza S9 (40 osservazioni da S10/W1 a S11/W1), seme 15 con scadenza S5 (157 osservazioni da S6/W1 a S10/W1). Sono **gruppi del dato registrato**, non una prova che esistano esattamente tre oggetti contratto.

Tutte le osservazioni provengono dal ramo del vecchio banco che controllava `s.proStatus==='pro'` e `expiresAtSeason<s.season`. **Non sono 198 contratti diversi.** Le settimane distinte mostrano che la carriera avanzava anche mentre un contratto risultava scaduto. Il vecchio registratore deduplicava per seme/stagione/settimana/tipo: non permette di contare quante volte lo *stesso passo* sia stato ripetuto. La presenza di un'offerta pendente non era registrata per ogni settimana, quindi il campo è `null` nel grezzo nuovo e resta **non verificato**; non viene trasformato arbitrariamente in sì o no. Il ricontrollo di C sulla 7.999.105 è ancora da eseguire.

I rilievi sul gioco restano ipotesi finché il team non li riproduce con un proprio guardiano.
