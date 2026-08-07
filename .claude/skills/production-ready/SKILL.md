---
name: production-ready
description: "Rituale di chiusura di Korward Elite: quando la modifica e' finita e va pubblicata — transpile, gate 14/14 col fingerprint 00001505 letto da run-summary.json, bump GAME_VERSION con causa/misura/guardiano, commit e push sui due branch, promozione su main ff-only, annuncio, filiera store (build-dist, validate-dist, audit-copyright)."
---

# production-ready — dal file modificato al push annunciato

## Quando si attiva
La patch e' scritta e verificata nel merito. Da qui in poi non si discute piu' *se* la modifica e' giusta:
si esegue la chiusura, in ordine, senza saltare passi.
Quale suite lanciare e come misurare un difetto NON si decide qui: `game-qa` (router) e `auto-regression`
(probe permanenti). Questa skill assume che quel lavoro sia gia' stato fatto.

## Procedura (in ordine, nessun passo saltabile)

**0 · Igiene, prima di toccare qualsiasi cosa.**
Leggi la versione VERA sul disco, non quella che ricordi. Il clone di questo container e' stato riavvolto
piu' volte: se e' **piu' bassa** di quella gia' pubblicata, il lavoro e' perso — fermati e recupera da
`git fetch origin && git log origin/main -1` prima di scrivere una riga.

**1 · Transpile.** Il gioco e' JSX transpilato nel browser: un errore di sintassi = pagina bianca, e il
gate ci mette 10 minuti a dirtelo. 3 secondi qui.

**2 · Gate 14/14.** Obbligatorio per ogni push che tocca `CARRIER-MANAGER-AV.html`. ~10 min.
**Mentre gira NON si edita il file**: il gate lo rilegge, e misureresti una cosa mentre ne pubblichi
un'altra. L'esito si legge da `run-summary.json`, mai a occhio dallo scroll del terminale.

**3 · Guardiani, se l'area li richiede.** Carriera / settimana / classifiche / tornei / economia /
mercato / migration → i quattro guardiani. Il gate e' cieco su tutto questo. Altre aree: vedi `game-qa`.

**4 · Bump `GAME_VERSION`.** Riga ~3993, marcatore `[7.xxx.0 …]` in testa al commento, in italiano.
Il commento deve contenere tre cose e non due:
- **causa** (che cosa era rotto e perche', non il sintomo),
- **misura** prima→dopo (il numero che lo dimostra),
- **guardiano** lasciato (o perche' non serviva).
Un commento senza numero e' un commento che non ha dimostrato nulla.

**5 · `CLAUDE.md` solo se cambia il MODO DI LAVORARE.** Nuovo hook, nuova probe permanente, nuovo
vincolo, nuova trappola di misura, direttiva PO. La **cronologia** di cosa e' cambiato in una release
va in `docs/RELEASE_HISTORY.md`, non in CLAUDE.md: quel file si paga in token a ogni singolo turno.

**6 · Commit.** Corpo in italiano che racconta causa → misura → correzione → guardiano.
Trailer richiesti, esattamente questi due, e **niente altro**:
`Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` e `Claude-Session: <url>`.
**MAI** scrivere l'identificativo del modello (`claude-opus-5`, `Opus 5 …`) nel titolo o nel corpo.
Prima del commit: `git status --short` — verifica che i file NUOVI compaiano davvero. `.claude/skills/`
era gitignorato e `git add -A` saltava dieci file in silenzio; se un file nuovo non compare,
`git check-ignore -v <path>` dice quale riga di `.gitignore` lo mangia.

**7 · Push sui due branch + promozione.** Branch di lavoro corrente, poi `main` in **ff-only**.
Con gate verde la promozione e' **automatica** (direttiva PO), non serve chiedere.

**8 · Annuncio**, testuale: `Pushato su GitHub — CPM x.y.z.`

**9 · Solo per il rilascio store** (non a ogni push): `DEVTOOLS_DEFAULT` a `false` (riga ~5745),
poi build-dist → validate-dist → audit-copyright **0 hit**. Tutti e tre devono passare, e
`audit-copyright` e' bloccante.

## Comandi

```bash
cd /home/user/Carrier-manager-

# 0 · versione vera sul disco
grep -n "GAME_VERSION=" CARRIER-MANAGER-AV.html | head -1 | cut -c1-90

# 1 · transpile (~3 s) — becca le lexical declaration in un if senza graffe
node -e 'const fs=require("fs"),B=require("./tests/visual/node_modules/@babel/standalone"),h=fs.readFileSync("CARRIER-MANAGER-AV.html","utf8"),s=h.indexOf("<script type=\"text/babel\""),b=h.indexOf(">",s)+1,e=h.lastIndexOf("</script>");try{B.transform(h.slice(b,e),{presets:["react"]});console.log("TRANSPILE OK")}catch(x){console.log("TRANSPILE FAIL:",x.message.split("\n")[0]);process.exit(1)}'

# 2 · gate completo (~10 min) — non editare il file mentre gira
cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run validate-situations

# 2b · VERDETTO, letto dal file (non dallo scroll)
node -p "const s=require('./out/validate/run-summary.json'),c=s.counts;[s.ok?'PASS':'FAIL','fp='+s.fingerprint,(c.checks-c.checksFailed)+'/'+c.checks,'failures='+c.failures,'v='+s.gameVersion].join(' ')"
# atteso esatto: PASS fp=00001505 14/14 failures=0 v=<la versione che hai appena messo>

# 3 · guardiani carriera (solo se l'area li richiede)
node career-invariants.mjs && node stab-nat-trigger-test.mjs \
  && node career-sim-test.mjs && node tripath-chokepoint-test.mjs

# 6-7 · commit e promozione
cd /home/user/Carrier-manager-
git status --short                       # i file NUOVI ci sono?
git add -A && git commit -F /tmp/msg.txt
BR=$(git branch --show-current)
git push origin "$BR"
git fetch origin main && git checkout -B main origin/main \
  && git merge --ff-only "$BR" && git push origin main && git checkout "$BR"

# 9 · filiera store
node tools/build-dist.mjs && node tools/validate-dist.mjs && node tools/audit-copyright.mjs
```

## Criteri di uscita
- Transpile OK.
- `run-summary.json`: `ok:true`, **`fingerprint 00001505`**, `14/14`, `failures 0`, e `gameVersion` =
  la versione appena bumpata (se e' quella vecchia, stai leggendo un run stantio: il gate non e' girato).
- Guardiani richiesti dall'area: verdi.
- `GAME_VERSION` bumpato, commento con causa + numero prima→dopo + guardiano.
- Commit senza identificativo del modello, coi due trailer, coi file nuovi dentro.
- `git log origin/main -1` mostra il commit. Annuncio dato.
- Store: `DEVTOOLS_DEFAULT=false`, validate-dist OK, audit-copyright **0 hit**.

## Errori gia' commessi (i piu' costosi)
- **Fingerprint letto a occhio.** Lo scroll del gate e' lungo e il fingerprint scorre via; si e' dichiarato
  verde un run che non lo era. Si legge da `run-summary.json`, sempre. E se `gameVersion` nel summary non
  e' quella sul disco, quel summary e' di un altro run.
- **File editato mentre il gate girava.** Il gate ricarica il sorgente: il risultato non descrive ne' la
  versione vecchia ne' la nuova. Dieci minuti buttati, e a volte creduti.
- **Versione regredita e non notata.** Il clone e' stato riavvolto tre volte. Senza il `grep` iniziale si
  bumpa 7.201 sopra un file che era gia' 7.345 e si pubblica un salto indietro di 140 release.
- **File nuovi mai committati.** `.claude/skills/*` era coperto da `.claude/*` in `.gitignore`: `git add -A`
  li saltava senza un warning, il commit "che li conteneva" aveva due file, e il riavvolgimento successivo
  li ha cancellati tutti e dieci. Guarda sempre `git status --short`.
- **Identificativo del modello finito nel commit.** Vietato: i trailer sono quelli e basta.
- **Cronologia scritta in CLAUDE.md.** Erano 305 KB caricati a ogni turno, ~76.000 token pagati anche
  quando la storia non serviva. Sta in `docs/RELEASE_HISTORY.md`, si consulta con `grep`.
- **Commento di versione senza misura.** «Migliorato il posizionamento» non e' un commento: senza il
  numero prima→dopo non c'e' modo di sapere, tra sei release, se quella patch aveva funzionato.
- **`main` promosso con merge non-ff.** Solo `--ff-only`: se rifiuta, il branch non e' aggiornato su
  `origin/main` — si rebasa, non si forza.
- **Store pubblicato con DEVTOOLS_DEFAULT a true.** La riga ~5744 lo dice a chiare lettere e la si e'
  saltata lo stesso: gli strumenti di sviluppo finivano visibili al giocatore.
