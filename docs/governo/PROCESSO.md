# Processo — come lavoriamo (PO + team Claude Code + Codex)

Nato dal prompt PO «Governo del progetto» del 30/09 (voci PO-GOV-*). I file di governo stanno tutti in
`docs/governo/`: `BACKLOG.md`, `ROADMAP.md` (unico file di roadmap: lotti + registro delle release),
`DECISIONI.md`, `RISCHI.md`, `ARCHITETTURA.md` e questo. I vecchi file roadmap sono in `docs/archivio/`.

## Ogni risposta al PO comincia con
`Lotto in corso: … · Voci toccate: PO-… · Richieste nuove registrate: PO-…`

## Smistamento (triage) — entro la risposta successiva
| Classe | Cosa succede |
|---|---|
| **Bloccante** (dati persi, gioco bloccato, carriera che non prosegue, errore evidente in produzione) | release correttiva dedicata, subito |
| **Difetto non bloccante** | entra nel lotto della roadmap a cui appartiene |
| **Miglioramento / nuova funzione** | voce «in attesa PO» finché il PO non ne decide la priorità |
| **In conflitto** con decisioni prese o lavoro in corso | lo diciamo subito, con alternative, in un questionario |

Una segnalazione non apre mai da sola una release.

## Definizione di «pronto» (si può iniziare)
Obiettivo chiaro · criteri di accettazione scritti e misurabili · dipendenze risolte · domande al PO chiuse
(questionario registrato in `DECISIONI.md`) · stima con ipotesi.

## Definizione di «fatto» (si può chiudere)
1. Criteri di accettazione soddisfatti **e misurati** (numero prima/dopo nella nota).
2. Guardiano nuovo o aggiornato: **rosso** con l'interruttore `__CPM_NO_*`, **verde** con la modifica.
3. Suite completa verde (`npm run ci` + `career-critical`), non solo i guardiani del lotto.
4. `save-compat` verde; campi nuovi additivi.
5. Prestazioni non peggiorate oltre le soglie qui sotto.
6. Build web e build store generate e avviate (`build-dist` + `validate-dist`).
7. Nota di rilascio per il PO scritta.
8. Voce del backlog chiusa con release e guardiani.

### Soglie di prestazione proposte (da approvare)
L'headless non misura gli FPS del telefono (renderer software): si misurano grandezze relative, e il
giudice finale resta il telefono del PO.
- Peso di `CARRIER-MANAGER-AV.html`: **+2% massimo per lotto** (oggi 6,5 MB).
- Tempo di avvio headless (dal caricamento alla Home): **+10% massimo** rispetto alla release precedente.
- Heap JS in partita dopo 60 s: **+10% massimo**.
- FPS: nessuna soglia headless; controllo sul telefono del PO a fine lotto.

## Cadenza delle release
- **Release di lotto**: nessun tetto giornaliero (decisione PO 01/10, sostituisce il tetto di 6): conta **non perdere pezzi** — ogni release ha la sua riga nel registro e ogni voce toccata è aggiornata nel backlog.
- **Release correttive**: solo per i bloccanti.
- **Tag git** `v7.999.x` a ogni release. Ritorno alla precedente: `git checkout main && git reset --hard v7.999.x && git push --force-with-lease origin main`
  (solo su ordine del PO) oppure, più sicuro, `git revert` del merge.
- **Limite di lavoro in parallelo**: un lotto principale più le correzioni bloccanti.
- **Cambio di priorità a metà lotto**: solo su decisione esplicita del PO, con il costo dichiarato
  (cosa resta a metà, cosa va rifatto).

## Nota di rilascio per il PO (formato)
```
CPM 7.999.x — <titolo in italiano semplice>
Cosa vedrai di diverso: <3–5 righe, dove guardarlo nel gioco>
Voci chiuse: PO-… · Guardiani: <npm run …>
```

## Stato settimanale (una pagina, ogni lunedì)
Lotto in corso e avanzamento · voci chiuse · voci aperte per gravità · richieste in attesa di decisione PO
· indicatori di stabilità (errori raccolti dal taccuino, difetti riaperti, difetti trovati da Codex contro
quelli trovati dal PO, guardiani aggiunti) · rischi cambiati · cosa serve dal PO.

## Dubbi che solo il PO può sciogliere
Questionario a scelta guidata: al massimo 4 domande per giro, ognuna con 2–4 opzioni. Per ogni opzione:
effetto, costo, rischio. La consigliata va per prima, con il motivo. Si può sempre rispondere a parole.
Le domande si raggruppano. Mentre si aspetta, si lavora sulle voci indipendenti. Ogni risposta finisce in
`DECISIONI.md` con data, domanda, scelta e voce collegata.

## Riconciliazione
A ogni fine lotto: ogni richiesta PO arrivata nel frattempo deve avere il suo `PO-…` nel backlog.

## Codex
Solo collaudatore. Le direttive le scriviamo noi (`reports/codex/PROMPT-*.md`). Scrive solo in
`reports/codex/` e `tests/codex/`, pusha solo su rami `codex/…`.
