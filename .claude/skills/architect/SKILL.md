---
name: architect
description: "Da invocare PRIMA di toccare CARRIER-MANAGER-AV.html: pianifica la modifica (obiettivo, causa misurata, punto d'intervento trovato per grep, cosa cambia e cosa NON cambia, ambito chiuso), individua il chokepoint unico dove va la logica, vieta refactoring e rinomine opportunistiche."
---

# Architect — il piano prima della patch

## Quando si attiva

Prima di ogni edit a `CARRIER-MANAGER-AV.html` (~34.000 righe, un file solo, scope globale,
niente build step). Anche per il fix «da una riga»: in questo file una riga sbagliata non la
prende il compilatore, la prende il PO in campo.

Non si attiva per: leggere/ridurre contesto (→ `minimal-context`), scrivere il diff
(→ `patch-only`), eseguire gate e probe (→ `game-qa`).

## Procedura

Produci un PIANO di 6 voci, breve, prima di aprire l'editor. Se una voce resta vuota, non
si scrive: si torna a misurare.

1. **Obiettivo** — una frase, in italiano, come la direbbe il PO. Se arriva da collaudo,
   cita la frase testuale del PO.
2. **Causa MISURATA** — un numero, non un sospetto. «il compagno è a 34,6u all'apertura»,
   «la cadenza deriva ×3,14». *No Blind Fix*: senza misura si scrive prima la probe.
   ⚠️ Verifica che la misura non sia un artefatto (catalogo delle trappole di misura: `realism-reviewer`).
3. **Punto d'intervento** — nome del simbolo + riga trovata ORA con `grep -n`. Mai i numeri
   di riga di CLAUDE.md: sono storici e derivati di migliaia di righe.
4. **Chokepoint** — se aggiungi LOGICA (non display), dichiara il punto UNICO dove va.
   Se la logica finisce in un ramo invece che nel chokepoint, il piano è sbagliato.
5. **Cosa NON cambia** — l'elenco esplicito degli invarianti che la patch non tocca:
   fingerprint `00001505`, firma golden, SAVE_VERSION, path gemelli, resa in altri meteo/ore.
6. **Ambito chiuso** — cosa resta fuori. Un difetto scoperto strada facendo si annota, non
   si corregge nello stesso push.

## Chokepoint: la regola che chiude la classe STAB

Tre percorsi fanno avanzare la settimana e **divergono se la logica vive in uno solo**:
`simulateAndAdvance` (~25447) · `onMatchEnd=result=>` (career, ~25638) · `doAdvanceWeek`
(~26369). 17 bug (stabilizzazione 6.32→6.37) nascono tutti da qui.
⚠️ `onMatchEnd=r=>` (~20980) è quello di TrialFlow: non è un path di carriera.

Chokepoint esistenti, da RIUSARE invece di duplicare:

| logica | chokepoint |
|---|---|
| stipendio, costi staff, agente, sponsor | `weeklyEconomyFields` |
| training, declino d'età, drift morale, valore | `weeklyGrowthFields` |
| fiducia/chimica (mean-reversion) | `weeklyStaffRel` |
| tornei Nazionali | `natTournamentPatch` / `applyNatTournamentTrigger` |
| girone europeo → KO | `euroGroupKOPatch` |
| classifica | `updateStandings` |
| riparazione save | `migratePlayer` |
| esito dell'azione live | `handleAction` |

`tripath-chokepoint-test.mjs` sorveglia i primi quattro: sono nel piano solo se il test li
vedrà. Un chokepoint NUOVO va aggiunto alla lista `REQUIRED` del test, altrimenti nasce
già senza guardiano.

## Vietato in questo file

- **Refactoring e rinomine opportunistiche.** Scope globale, nessun type checker, nessun
  linter, JSX transpilato a runtime: una rinomina rompe in silenzio e si scopre a schermo.
  Il riordino si fa solo se È l'obiettivo del push, da solo, col suo gate.
- **File JS separati.** Il gioco è un file.
- **`Math.random()` nudo** nel gameplay o nel setup: `hashStr` + aritmetica (Determinism First,
  e il check `determinism` del gate lo intercetta).
- **Toccare la firma golden** senza dichiararlo: se cambia, si rigenera deliberatamente
  (`npm run validate-situations:update-golden`) e lo si scrive nel piano.
- **Bump di `SAVE_VERSION`** senza migration backward-compat nello stesso piano.

## Comandi

Controlli d'ingresso prima di pianificare un edit (versione vera sul disco, working tree pulito):
`patch-only`.

```bash
# trovare il punto d'intervento (mai per numero di riga)
grep -n 'const nomeFunzione=' CARRIER-MANAGER-AV.html
grep -n 'weeklyEconomyFields\|weeklyGrowthFields\|natTournamentPatch' CARRIER-MANAGER-AV.html
grep -n 'const simulateAndAdvance=\|const onMatchEnd=result=>\|const doAdvanceWeek=' CARRIER-MANAGER-AV.html

# i tre path delegano ancora a tutti i chokepoint? (statico, istantaneo)
cd tests/visual && node tripath-chokepoint-test.mjs

# esiste già una probe per questa cosa? (240 script: quasi sempre sì)
ls tests/visual/ | grep -i '<tema>'
grep -rln '<simbolo>' tests/visual/*.mjs
```

## Criteri di uscita

- Le 6 voci sono compilate, la 2 con un numero e la 3 con una riga da `grep -n` di adesso.
- Se il piano tocca settimana/classifiche/tornei/economia/mercato/migration: nomina i
  guardiani carriera da eseguire (`career-invariants`, `stab-nat-trigger`, `career-sim`,
  `tripath-chokepoint`) — l'esecuzione è di `game-qa`.
- Se il piano tocca qualcosa di gate-cieco (carriera, movimento, GLB, audio, camera,
  transizioni, cerimonie, UI di CareerApp), nomina la probe che lo coprirà, esistente o nuova.
- È dichiarato il testo del bump `GAME_VERSION`: causa e misura, in italiano.

## Errori già commessi

- **Pianificare sui numeri di riga di CLAUDE.md.** Sono storici. Solo `grep -n`, adesso.
- **Editare senza aver letto `GAME_VERSION`.** Si sono ri-applicati edit su una base sbagliata
  (regola in `patch-only`).
- **Misurare un artefatto e chiamarlo causa.** Un piano costruito su una misura falsa nasce morto:
  le trappole note (presentazione spenta, medie su sottogruppi opposti, campione singolo) sono
  catalogate in `realism-reviewer` — passaci prima di compilare la voce 2.
- **Mettere la logica nel ramo invece che nel chokepoint.** 7.160.0: il fix fatica era andato
  solo in `weeklyGrowthFields` e i rami gemelli divergevano. Chi gioca dal vivo, chi simula e
  chi avanza devono ottenere lo stesso.
- **Ampliare l'ambito strada facendo.** Il push che «già che c'ero» tocca un secondo sistema
  è quello che non si riesce più a bisezionare quando il gate cade.
- **Dare per scontato che il gate copra.** È cieco su carriera, movimento dal vivo, GLB,
  audio, camera, transizioni, cerimonie, UI di CareerApp: lì il piano deve nominare una probe.
- **Editare mentre gira il gate.** Regola in `patch-only`.
