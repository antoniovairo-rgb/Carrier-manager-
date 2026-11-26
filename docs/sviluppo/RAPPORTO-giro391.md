# Giro 391 — dopo-partita: salto nei giri, partita intera nel treno (PO-523)

Base `lavoro/201` (29d758c8, 7.999.215). Ramo `sviluppo/giro391-dopo-partita`. Giro di **controlli**: il gioco non è toccato.
Decisione PO 18/11 16:40 (dubbio 2 del giro 270): «Entrambi» — salto all'85' nei controlli dei giri, partita intera nella verifica del treno.

## 1. Chi salta all'85' (censimento)

Punto unico: `tests/visual/lib/fischio-270.mjs` (`aspettaFischio270`). Lo usano tre controlli:

| controllo | chiamata | salto | cosa giudica |
|---|---|---|---|
| `partita-rigiocata-194` | 2 (verde + rosso) | 10' → 85' | conferenza che non si riapre dopo il fischio |
| `spazio-296` | 1 per formato nel braccio verde (tel, pc); i rossi hanno `CPM_SENZA_POST` | 10' → 85' | spazi del post partita |
| `spazio-270` | 1 per braccio, con `punteggio: 1-1` | 3' → 80' | il salto **provoca** il pari dopo il 75' (scheda del momento) |

Altri salti con `__CPM_SALTA297`, **non** in ambito (non sono attese del fischio per il dopo-partita): `partita2d-297`,
`partita2d-141`, `freccia-107`, `gigante-212`, `schede-246`, `c180-partita` (provocano punteggio/minuto); `lib/partita-v2.mjs`
`finePartita` (88', usato da `partita-v2`, `foto-v2-*`), `c184-provini` e `flussi-115` (88') — vedi dubbio 2.

## 2. Misure (banco di questa sessione, Chromium headless, 4 CPU)

| controllo | col salto | a partita intera | note |
|---|---|---|---|
| `partita-rigiocata-194` (2 bracci) | **328 s** totali · attesa del fischio 98 s + 92 s | **2.099 s** totali · attesa 971 s + 985 s | verde in entrambi i modi; la partita intera girava in parallelo con l'altra misura e poi col giro delle sentinelle (contesa: il numero assoluto è alto, vedi sotto) |
| `spazio-296` (tel, braccio verde) | **122 s** · attesa 55 s | **364 s** · attesa 298 s | senza contesa (misurato dopo il giro); +242 s per formato |

⚠️ A partita intera un braccio ha aspettato 971-985 s: **oltre il vecchio tetto di parete di 900 s**. Senza alzarlo, il
controllo sarebbe uscito «niente fischio» (rosso falso). Per questo a partita intera il tetto di sicurezza sale a 2.400 s
(`TETTO_INTERA391_MS`); le soglie di **giudizio** non cambiano (l'orologio fermo per 120 s in gioco resta rosso).

Nel braccio rosso di `partita-rigiocata-194` a partita intera, la riapertura dopo il fischio (riga informativa, non giudicata) è uscita «no»
invece di «SI». Il verdetto non cambia (il rosso si giudica su `confPrima`, che resta falso): lo segnalo perché la partita intera
non è identica a quella corta.

## 3. Cosa cambia (file e funzioni toccati)

- `tests/visual/lib/fischio-270.mjs`: nuove `partitaIntera391()` e `TETTO_INTERA391_MS`; in `aspettaFischio270` con
  `CPM_PARTITA_INTERA=1` niente salto (tranne quando la chiamata passa `punteggio`: lì il salto provoca un momento e resta) e tetto di
  parete alzato. Il ritorno porta `intera`. `CPM_NO_G391=1` = comportamento di prima.
- `.github/workflows/verifica-guardiani.yml`: `CPM_PARTITA_INTERA: '1'` nell'env del job `guardiani` (le parti: trenino, mappa,
  treno grande di notte avviato da `treno-notte-330.yml`).
- `tests/visual/ci-runner.mjs`: blocco `giro` → `delete process.env.CPM_PARTITA_INTERA` (i giri col salto anche se la variabile è
  nell'ambiente); `dopo-partita-391` nella riga della MAPPA che esiste già (quella della macchina del treno), più il suo file nel regex.
- `tests/visual/ci-treno-308.mjs` (`piano`): tabella `INTERA_391` — il piano usa per i due controlli la durata a partita intera
  (DURATE-GUARDIANI.json conosce solo quella col salto e `docs/governo` non è mio). Rosso `CPM_NO_G391=1` = durate di prima.
- `tests/visual/dopo-partita-391.mjs` + script npm `dopo-partita-391`: guardiano nuovo.
- Fuori ambito: gioco (`src/`, ricomposto), `GAME_VERSION`, `docs/governo`, soglie di tutti i controlli.

## 4. Effetto sulla durata del treno

Stima runner = banco × 0,74 (rapporto runner/banco di `partita-rigiocata-194` col salto: 243 s in DURATE-GUARDIANI contro 328 s qui):
`partita-rigiocata-194` 243 → **1.600 s** (numero del banco con contesa: probabilmente largo), `spazio-296` 468 → **900 s** (due formati × +242 s × 0,74 = +358 s, arrotondato in su). Sono i valori
di `INTERA_391`. `spazio-270` non cambia (salto di provocazione).

Piano della mappa intera ricalcolato sul ramo (`node ci-treno-308.mjs piano`, `CPM_TRENO_TIPO=mappa`):

| | parti | parte più lunga | somma |
|---|---|---|---|
| prima (`CPM_NO_G391=1`) | 32 | 4.090 s | 130.773 s |
| dopo (tabella finale: 1.600 / 900) | **32** | **4.144 s** | 132.562 s (+1.789 s, +1,4%) |

Dentro i tetti: obiettivo per parte 4.200 s, bilancio 6.600 s, timeout del job 120 min; stesso numero di parti → stesse ondate col
tetto di 15 macchine. Il trenino paga la partita intera solo quando tocca una riga che contiene uno dei due controlli.

## 5. Guardiano `npm run dopo-partita-391` (statico + pagina finta in node, ~1 s)

A env del job del treno · B `ci-runner giro` toglie la variabile · C1 giro: salto all'85' e fischio · C2 treno: nessun salto, 90 minuti,
fischio · C4 treno con `punteggio`: il salto resta · C3 tetto alzato solo a partita intera · E piano con le durate a partita intera ·
D i tre controlli usano `aspettaFischio270` e nessuno salta da sé.
Verde **10/10**; rosso `CPM_NO_G391=1` (workflow, ci-runner e piano della base 29d758c8, lib che salta sempre) **6/10, esce 1**.

## 6. Rituali di questa consegna

- `node ci-runner.mjs giro dopo-partita-391`: **18/18 verdi** su 7.999.215 (guardiano + 17 sentinelle). Il guardiano è stato poi
  esteso (C4, E) e rigirato da solo: verde + rosso.
- Rigirati a mano dopo le ultime modifiche: `mappa-unica` ✅, `treno-tempo-358` ✅, `deploy-326` ✅.
- ⚠️ `trenino-317` **rosso anche sulla base** (stesso controllo: «piano di ci-treno-308 con CPM_TRENO_TIPO=trenino: tipo ?»), quindi non
  nato da questo giro; lo giudica il treno. Non indagato (fuori ambito).
- I file scritti dai rituali (`docs/governo/STABILITA.json`, foto di `docs/collaudo-grafico/g0`) sono stati rimessi come erano.

## 7. Dubbi per il PO (la consigliata è la prima, già applicata)

1. **Il salto che provoca un momento** (`spazio-270`, punteggio 1-1 dopo il 75'):
   a. **resta anche nel treno** (applicata: senza, il pari non nasce e il controllo resterebbe «non giudicato»);
   b. partita intera e momento provocato a fine partita (servirebbe un varco nuovo nel gioco: non è un giro di controlli);
   c. partita intera senza provocazione, accettando «non giudicato» quando il pari non capita.
2. **`finePartita` di `lib/partita-v2.mjs` (88') e i salti a 88' di `c184-provini`/`flussi-115`:**
   a. **fuori ambito per ora** (applicata: guardano grafica del post partita in più formati; a partita intera `partita-v2` passerebbe
      da minuti a ore, oltre i tetti delle parti);
   b. stessa variabile anche per loro, con durate rimisurate e il piano ritarato;
   c. solo `partita-v2` a partita intera, in un solo formato.
3. **Durate nel piano:**
   a. **tabella `INTERA_391` nel piano finché DURATE-GUARDIANI.json non si ritara** sulle corse vere (applicata);
   b. aggiornare subito DURATE-GUARDIANI.json a mano (è `docs/governo`: decisione vostra);
   c. nessuna correzione e lasciare che il bilanciamento sbagli finché non arrivano le misure del runner.
4. **Tetto di parete a partita intera (2.400 s):**
   a. **2.400 s** (applicata: misurato 985 s sul banco con contesa, margine circa 2,4 volte);
   b. 1.800 s; c. nessun tetto, solo l'orologio fermo.
