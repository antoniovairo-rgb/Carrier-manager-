---
name: patch-only
description: "Disciplina di scrittura su CARRIER-MANAGER-AV.html: da usare al momento di APPLICARE una modifica al file di gioco — Write vietato, Edit con ancora univoca o script python con assert count==1, verifica che l'edit sia atterrato (grep vecchio/nuovo + git diff --stat), bump GAME_VERSION con marcatore [7.xxx.0]."
---

# patch-only — come si scrive dentro il file di gioco

Qui si parla **solo del gesto di scrittura**: il piano viene prima (`architect`), la
verifica del comportamento dopo (`game-qa`), la pubblicazione dopo ancora
(`production-ready`). Garantisce una cosa sola: che sul disco finisca esattamente quello
che volevi, e nient'altro.

## Quando si attiva

Ogni volta che stai per modificare `CARRIER-MANAGER-AV.html` (33.981 righe, 3,3 MB,
un solo file). Vale anche per il fix di una parola, anche per il bump di versione.

## Regola zero

**`Write` è VIETATO su `CARRIER-MANAGER-AV.html`.** Nessuna eccezione: riscrivere il
file significa reimmetterlo intero da contesto, cioè perdere silenziosamente tutto
quello che non stavi guardando. Si usa `Edit`, oppure uno script python di sostituzione
puntuale. Non creare MAI file `.js` separati per il gioco.

## Procedura

**1 — Controlli d'ingresso (30 secondi, sempre).**
- `grep -n 'const GAME_VERSION="' CARRIER-MANAGER-AV.html` → la versione che leggi ORA
  è la sola verità. Il container ha già riavvolto il clone tre volte: quella che ricordi
  dall'inizio della sessione può non esistere più.
- `git status --short` deve essere pulito o contenere solo le TUE modifiche.
- Il gate non deve essere in esecuzione: editare mentre gira produce un verdetto su un
  file che non esiste più. Se un gate è partito, aspetta che finisca.

**2 — Scegli l'ancora.** Deve essere **univoca** e **stabile**:
- Univoca: verificala con `grep -c` PRIMA di scrivere. Se conta ≠ 1, allarga l'ancora
  includendo la riga sopra o sotto, non «speri» che sia quella giusta.
- Stabile: ancora al **corpo** del codice che stai cambiando (una condizione, una
  costante, un commento marcatore), **MAI alla riga di firma di un componente**
  (`function X(...)`, `const X=({...})=>`). Un'ancora sulla firma che sbaglia di un
  carattere non fallisce: **divora l'intestazione**. È già successo a
  `SeasonAwardsScreen`, e il gate è rimasto verde perché quella schermata è fuori-gate.
- Non ancorare mai a righe-bomba: la riga di `GAME_VERSION` da sola pesa 26 KB.

**3 — Applica.** `Edit` con `old_string` univoco (preferito: fallisce da solo se
l'ancora non è unica). Per sostituzioni multiple o testo con caratteri ostici, script
python con **assert prima di scrivere** (`str.replace` NON fallisce se non trova nulla:
è così che un import mancato ha ucciso un gate dopo sei minuti).

**4 — Verifica che sia atterrato.** Tre prove, sempre tutte e tre: `grep -c` del NUOVO
(≥1) · `grep -c` del VECCHIO (=0) · `git diff --stat` (se vedi centinaia di righe toccate
hai riscritto qualcosa senza volerlo: `git checkout` e ricomincia).

**5 — Bump `GAME_VERSION`, sempre, anche per un fix minimo.** Il marcatore nuovo si
INFILA in testa alla catena esistente (la riga è uno storico impilato, i vecchi restano).
Il commento è in italiano e dichiara **CAUSA misurata** e **MISURA presa** — non «fix
posizionamento» ma «il bersaglio cadeva fra i pali (48,2) → cap a GOAL_LINE_X−5,2, misurato 43,4».
Campo obbligatorio nuovo in `player` ⇒ serve anche `SAVE_VERSION` + migration: è materia
di `architect`, torna lì prima di procedere.

## Comandi

```bash
cd /home/user/Carrier-manager-

# 1. ingresso
grep -n 'const GAME_VERSION="' CARRIER-MANAGER-AV.html | cut -c1-60
git status --short

# 2. l'ancora è univoca? (deve stampare esattamente 1)
grep -c 'TESTO_ANCORA' CARRIER-MANAGER-AV.html

# 3. sostituzione via python, con assert PRIMA di scrivere
python3 - <<'PY'
p="CARRIER-MANAGER-AV.html"
old="TESTO_VECCHIO"
new="TESTO_NUOVO"
s=open(p,encoding="utf-8").read()
assert s.count(old)==1, f"ancora non univoca: {s.count(old)} occorrenze"
open(p,"w",encoding="utf-8").write(s.replace(old,new,1))
print("ok")
PY

# 4. verifica dell'atterraggio (nuovo>=1, vecchio=0, diff plausibile)
grep -c 'TESTO_NUOVO' CARRIER-MANAGER-AV.html
grep -c 'TESTO_VECCHIO' CARRIER-MANAGER-AV.html
git diff --stat

# 5. bump versione — ancora sul PREFISSO, il resto della catena resta
python3 - <<'PY'
p="CARRIER-MANAGER-AV.html"
old='const GAME_VERSION="7.345.0"; // ['
new='const GAME_VERSION="7.346.0"; // [7.346.0 causa misurata e misura presa] // ['
s=open(p,encoding="utf-8").read()
assert s.count(old)==1
open(p,"w",encoding="utf-8").write(s.replace(old,new,1))
PY
```

## Criteri di uscita

- `grep -c` nuovo ≥1 **e** `grep -c` vecchio =0.
- `git diff --stat` mostra 1 file e un numero di righe coerente con l'intenzione.
- `GAME_VERSION` bumpata, marcatore in testa, catena precedente intatta.
- Nessun file `.js` nuovo, nessun `Write` sul file di gioco nel transcript.
- Poi si passa a `game-qa`: una patch non verificata dal gate non è finita.

## Errori già commessi

- **L'intestazione divorata.** Ancora sulla riga di firma di `SeasonAwardsScreen` → il
  componente è partito insieme all'ancora. Il gate è rimasto **verde**: quella schermata
  non è coperta. Un gate verde non è prova che l'edit sia atterrato bene.
- **`str.replace` silenzioso.** Nessuna eccezione se il pattern non c'è: lo script stampa
  «fatto», il file è invariato, il gate muore sei minuti dopo su un import mancante.
  L'`assert count==1` esiste per questo.
- **La versione ricordata a memoria.** Il clone è stato riavvolto tre volte in una
  sessione: si rilegge `GAME_VERSION` col grep prima di ogni bump, non si deduce.
- **Editare durante il gate.** Il verdetto arriva su un file che nel frattempo è cambiato:
  non vale nulla, in nessuna delle due direzioni.
- **Ancorare alla riga di `GAME_VERSION` intera.** 26 KB: non va letta, non va stampata,
  non va incollata in un `old_string`. Si ancora al prefisso `const GAME_VERSION="x.y.z"; // [`.
- **`replace_all` per comodità.** Su un file con 252 club e 191 situations una stringa
  «ovvia» compare venti volte. Se servono più occorrenze, si elencano e si sostituiscono
  una per una con ancore diverse.
