---
name: minimal-context
description: "Disciplina di lettura del repo Korward Elite: da usare PRIMA di aprire CARRIER-MANAGER-AV.html (34.000 righe) o un doc grande — trovare il simbolo con grep -n e leggere solo l'intorno con offset/limit, evitare le righe-bomba, cercare dentro i doc invece di leggerli, delegare le ricerche ampie."
---

# Contesto minimo — come si legge questo repo

## Quando si attiva

Prima di **ogni** Read su `CARRIER-MANAGER-AV.html` (34.000 righe / 3,3 MB) o su un doc grande
(`docs/RELEASE_HISTORY.md` 292 KB, `VALIDATORS.md` 96 KB, `LIVE_MATCH_QA_SPEC.md` 55 KB,
`CLAUDE.md` 42 KB). Vale anche quando "sembra una riga sola": in questo file una riga può pesare 57 KB.

Confine: come **scrivere** poco (output, riassunti) è di `token-optimizer`; **pianificare** un intervento
multi-fase è di `architect`. Qui si tratta solo di quanto codice entra nel contesto.

## Procedura

1. **Ancora.** `grep -n '<simbolo>' CARRIER-MANAGER-AV.html` → numero di riga assoluto.
   Se il simbolo è comune (`hlType` 62 hit, `outKind` 50, `ballArcTgtX` 53) restringi con un pattern
   più lungo (`function `, `const `, `P.hlType===`) o filtra per intervallo (punto 3).
2. **Lettura chirurgica.** `Read file_path=... offset=<riga-15> limit=90`. Novanta righe bastano per
   firma + corpo di un helper. Se non basta, allarga di 60 alla volta — mai "leggo il componente".
3. **Restringere a un componente** senza perdere i numeri assoluti:
   ```bash
   grep -n 'animOne' CARRIER-MANAGER-AV.html | awk -F: '$1>9496 && $1<14815'  # solo ThreeMatchView
   ```
4. **Doc: si cercano, non si leggono.** `RELEASE_HISTORY`, `VALIDATORS`, `LIVE_MATCH_QA_SPEC` hanno un
   blocco **COME SI CONSULTA** nelle prime righe con i grep giusti: `head -12 <doc>`, poi cerca.
   `RELEASE_HISTORY.md` è stato estratto da CLAUDE.md proprio perché caricarlo costava ~76k token a turno.
5. **Delega** quando la domanda è esplorativa (punto 4 sotto).

## Comandi

```bash
cd /home/user/Carrier-manager-

# ancore stabili (i numeri cambiano a ogni release: NON impararli, ri-grepparli)
grep -n 'function ThreeMatchView\|function LiveMatch\|function CareerApp\|function App(' CARRIER-MANAGER-AV.html
grep -n 'const SITUATIONS\|const CLUBS\|function migratePlayer' CARRIER-MANAGER-AV.html

# valori: SEMPRE con -o, mai la riga intera (vedi trappole)
grep -o 'GAME_VERSION="[0-9.]*"' CARRIER-MANAGER-AV.html | head -1
grep -o 'SAVE_VERSION=[0-9]*'    CARRIER-MANAGER-AV.html | head -1

# mappa dei check del gate senza aprire il runner
ls tests/visual/checks/
grep -n 'export' tests/visual/lib/harness.mjs | head -20

# righe-bomba: se devi guardarle, tronca sempre
sed -n '3993p' CARRIER-MANAGER-AV.html | cut -c1-200
```

### Tabella — voglio X, cerco così

| Voglio | Comando |
|---|---|
| Render-loop 3D, `animOne`, AI off-ball, archi palla | `grep -n 'function ThreeMatchView'` |
| Macchina di stato partita (`hl_*`, shootout, ceremony) | `grep -n 'function LiveMatch'` |
| Carriera, settimana, rollover | `grep -n 'function CareerApp'` |
| Migration dei save | `grep -n 'function migratePlayer'` |
| Motore d'esito / decisione | `grep -n 'function decideExecution'` |
| Cinematica dell'highlight | `grep -n 'function deriveHL\|function hlBallState'` |
| Una situation (191) | `grep -n 'const SITUATIONS'` poi Read con offset |
| Un club (252) | `grep -n '"salernitana"' CARRIER-MANAGER-AV.html` |
| Versione corrente / SAVE_VERSION | `grep -o` (vedi sopra) |
| Un hook di test | `grep -n '__CPM_FORCE_SIT\|__CPM_PRESENT'` |
| Quando si è già toccato un tema | `grep -n -i 'portiere' docs/RELEASE_HISTORY.md` |
| Cosa dice una release | `grep -n '7.203' docs/RELEASE_HISTORY.md` |
| Un validator per codice | `grep -n 'LMV-014' VALIDATORS.md` |
| Indice di un doc | `grep -n '^#' <doc>` |
| Quale script copre un tema | `ls tests/visual \| grep -i gk` (240 script) |

### Quando delegare a un subagent

Delega (Task) — e chiedi **solo righe + riassunto, mai il codice incollato** — quando:
- la domanda è "dove, in tutto il file, si decide X" e non hai un'ancora;
- devi setacciare i 240 script di `tests/visual/` o più doc insieme;
- serve leggere un output lungo (report del gate, `run-summary.json` grande, log di una probe) per
  estrarne tre numeri.

Non delegare una lettura che sai già puntare: costa più il giro che il Read.

## Criteri di uscita

- Hai il **numero di riga esatto** del punto da toccare.
- Hai letto **≤ ~200 righe** in totale del file di gioco.
- Nessuna riga >2000 caratteri è entrata nel contesto non troncata.
- Se stai per superare 400 righe lette: fermati, ri-greppa con un pattern più stretto o delega.

## Errori già commessi

- **`grep -n GAME_VERSION` senza `-o`**: la riga 3993 contiene versione **+ changelog inline** ed è lunga
  **26.406 caratteri** — un solo hit ti stampa ~7k token. Usa `grep -o` o `| cut -c1-160`.
- **Read con offset vicino all'inizio**: la **riga 48 è un font WOFF2 in base64 da 57.204 caratteri**.
  Un `offset=40 limit=20` innocente scarica 57 KB di base64. In tutto ci sono **9 righe >2000 char**
  (48, 3993, 4009, 9975, 25504, 25535, 25568, 26053, 27428): trattale come binarie.
- **Fidarsi dei numeri di riga di CLAUDE.md**: sono storici e derivati di centinaia di righe. Servono come
  *ordine* dei layer, mai come offset. Verifica sempre con `grep -n`.
- **Fidarsi di un valore ricordato**: CLAUDE.md dice `SAVE_VERSION 8`, il codice dice **9**. I numeri si
  greppano, non si citano a memoria. Vale doppio per `GAME_VERSION`: **greppalo prima di ogni edit** —
  il container ha già riavvolto il clone tre volte e si è ripartiti da una versione vecchia.
- **Leggere `docs/RELEASE_HISTORY.md`** per sapere "com'è andata": 292 KB. Si greppa per tema o release.
- **Leggere un componente intero** per cambiare tre righe: `LiveMatch` da solo è ~5.300 righe
  (9496→14815 solo `ThreeMatchView`). Nessun intervento in questo repo richiede di vederlo tutto.
- **`Grep output_mode:"content"` senza `head_limit`** su un simbolo comune: 62 hit di `hlType` con
  contesto riempiono lo stesso il contesto. Prima `files_with_matches`/`count`, poi mira.
- **Editare mentre gira il gate** (~10 min): il file cambia sotto il runner e il risultato non vale nulla.
