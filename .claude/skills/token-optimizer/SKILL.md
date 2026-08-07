---
name: token-optimizer
description: "Disciplina di esecuzione e output su Korward Elite quando il lavoro rischia di sprecare token o tempo: chiamate indipendenti in parallelo, comandi che danno il verdetto invece del dump, niente ri-letture dopo un Edit, output rumoroso troncato, risposta finale asciutta, delega a subagent del materiale voluminoso."
---

# token-optimizer — spendere poco per concludere presto

Qui si parla di **come si eseguono i tool e come si risponde**.
Cosa leggere e quanto → `minimal-context`. Come scrivere le modifiche → `patch-only`.

## Quando si attiva

- Il compito richiede più di 2-3 tool call, o tocca il gate (~10 min a run).
- Stai per lanciare qualcosa che stampa centinaia di righe (gate, sweep, live-validator, `git log`, `ls tests/visual`).
- Stai per ripetere a parole un output che l'utente ha già visto.
- Devi setacciare molto materiale per arrivare a una conclusione corta (audit di ~240 script, 191 situations, decine di frame).

## Procedura

1. **Parallelizza.** Tutte le chiamate indipendenti in UN solo messaggio. Grep di `GAME_VERSION` + lettura di `run-summary.json` + `ls` non hanno dipendenze fra loro: vanno insieme. Si serializza solo quando il secondo comando ha bisogno del risultato del primo.
2. **Dopo un Edit non si ri-legge.** `Edit` fallisce da sé se `old_string` non combacia: se è passato, la modifica c'è. Niente Read di verifica, niente `grep` di conferma sulla riga appena scritta. La verifica vera è il gate o una probe, non un secondo sguardo.
3. **Chiedi il verdetto, non il dump.** Non far stampare il file: fai calcolare la risposta. `grep -c` invece di `grep`, `wc -l` invece di `cat`, un one-liner `node -e` su `run-summary.json` invece del report intero. Un numero e un PASS/FAIL valgono quanto 400 righe.
4. **Tronca ciò che resta rumoroso.** `| tail -30`, `| head -20`, `2>&1 | grep -E "PASS|FAIL|✅|❌|Error"`. Se serve tutto, scrivi su file e leggi solo la coda.
5. **Riusa i fatti già in mano.** La versione, il fingerprint, il numero di riga di un componente, l'esito dell'ultimo gate: se sono già emersi in questa sessione non si ri-misurano. Eccezione dura: `GAME_VERSION` **prima di ogni edit** (il container ha riavvolto il clone tre volte).
6. **Delega il volume.** Lavoro ad alto materiale e bassa conclusione → subagent, con l'istruzione esplicita di restituire **solo il verdetto** (poche righe, niente codice ricopiato). Casi tipici: scandagliare i ~240 script di `tests/visual/` per trovare la probe giusta, classificare l'output di `action-sweep`, confrontare fogli-provini, cercare tutte le occorrenze di un pattern nel file da 34.000 righe.
7. **Rispondi corto.** Cosa è cambiato, dove, con quale misura, esito del gate. Niente riepilogo del percorso, niente ri-descrizione del codice mostrato dai tool, niente elenco puntato di ciò che è ovvio.

## Comandi

Verdetto del gate senza rileggere il report (`cd tests/visual`):

```bash
node -e "const s=require('./out/validate/run-summary.json');console.log((s.ok?'PASS':'FAIL'),s.fingerprint,'checks',(s.counts.checks-s.counts.checksFailed)+'/'+s.counts.checks,'fail',s.counts.failures,'warn',s.counts.warnings);s.failures.slice(0,5).forEach(f=>console.log(' -',f.check,f.gi,f.msg))"
```

Prima di ottimizzare il gate, guarda dove spende (campo `timings` in `meta`, presente dai run strumentati):

```bash
node -e "const m=require('./out/validate/report.json').meta||{};console.log(JSON.stringify(m.timings||'nessun timings: run precedente alla strumentazione'))"
```

Gate con output ridotto all'essenziale:

```bash
CPM_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  npm run validate-situations 2>&1 | tail -30
```

Loop di sviluppo: `npm run quick-gate` (~2 min) mentre iteri, gate completo (~10 min) una volta sola prima del push.

Domande sul file di gioco che si rispondono con un numero:

```bash
cd /home/user/Carrier-manager-
grep -n 'GAME_VERSION *=' CARRIER-MANAGER-AV.html | head -3   # versione prima di editare
grep -c 'pattern_da_sostituire' CARRIER-MANAGER-AV.html       # unicità prima di un Edit
grep -n 'const ThreeMatchView' CARRIER-MANAGER-AV.html        # confine di un componente
```

Trovare la probe esistente senza elencare la cartella:

```bash
ls tests/visual | grep -iE 'gk|shootout|crowd' | head -20
```

## Criteri di uscita

- Ogni gruppo di chiamate indipendenti è partito in un solo messaggio.
- Nessuna Read successiva a un Edit sulla stessa regione.
- Nessun comando ha stampato più di ~40 righe senza che servissero.
- Il gate completo è girato **una volta**, alla fine, non a ogni tentativo.
- La risposta finale sta in poche righe e non ricopia output già visibile.

## Errori già commessi

- **Ri-leggere il file dopo l'Edit** «per sicurezza»: 3,3 MB non si rileggono mai per intero, e la sicurezza la dà il fallimento dell'Edit.
- **Lanciare il gate completo dopo ogni micro-modifica**: 10 minuti a giro. Si itera con `quick-gate` o con la probe mirata; il gate chiude, non accompagna.
- **Editare mentre il gate gira**: si valida un file che non esiste più, e il verdetto è carta straccia.
- **Ripetere a parole il diff o l'output di un comando** subito dopo che il tool l'ha mostrato: raddoppia il costo e non aggiunge nulla.
- **Chiedere `cat` di `run-summary.json`**: è lungo e il 99% è rumore; le uniche cose che contano sono `ok`, `fingerprint`, `counts`, `failures`.
- **Setacciare in prima persona 191 situations o 240 script** invece di delegare: il materiale entra tutto in contesto e la conclusione era una riga.
- **Fidarsi di un fatto vecchio di sessione sulla versione**: `GAME_VERSION` va ri-verificato prima dell'edit, sempre.
- **Ottimizzare il gate a naso**: senza `timings` non sai se il costo è il boot di Babel, le 191 forzature o gli screenshot — misura prima.
