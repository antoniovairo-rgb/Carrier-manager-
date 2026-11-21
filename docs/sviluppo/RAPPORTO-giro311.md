# Giro 311 — ritocchi del giro 310 (treno 7.999.200)

Ramo `sviluppo/giro311-ritocchi`, partito da `sviluppo/giro310-bilanciamento` (f07d222). Decisioni del PO: `docs/governo/DECISIONI.md`
su `poc/marioprada-character-system`, 21/11 14:40. Nessun bump di `GAME_VERSION`, nessuna riga di roadmap: giro su ramo di sviluppo.

## 1. Infortuni ~0,6 a stagione in carriera

**Dove.** `src/18-career-app.jsx`, `rischio310`: è la funzione unica usata sia dalla simulata (`simInjuryRoll`) sia dal percorso
giocato (`onMatchEnd`). Cambia solo la base: **1,0% → 2,5%** per partita giocata. Il resto della regola del 310 è invariato
(+0,04% per punto di fatica di partita sopra 40, +3% sopra 82, sconto del preparatore, quota di minuti, nessun tiro senza minuti).
Rossi: `__CPM_NO_G310D` (regola di prima del 310, invariato) e, nuovo, `__CPM_NO_G311D` (base del 310, 1,0%).

**Misura.** Le stesse 5 carriere da bandiera del 310 (FC Ciociaro, OVR 68 dalle stagioni 1/4/10/13, OVR 78 dalla 7; fatica curata;
14 stagioni ciascuna; `misura-310-carriera.mjs`, file in `tests/visual/out/misura-311/`, non versionati).

| base per partita | infortuni in 70 stagioni | a stagione | settimane fuori | fonte |
|---|---|---|---|---|
| 1,0% (giro 310) | 21 | 0,30 | — | rapporto 310 |
| 2,0% (prima prova) | 34 | 0,49 | 177 | giro 311 |
| **2,5% (applicata)** | **44** | **0,63** | 215 | giro 311 |

La relazione è quasi lineare (0,30/1,6% e 0,49/2,6% di rischio medio danno lo stesso rapporto): con 2,0% la carriera restava appena
sotto la banda 0,5–0,7, perciò sono salito a 2,5%. Presenze medie a stagione 35,9 → 34,9 (più settimane fuori).
⚠️ Le carriere non sono appaiate (lo dice già il 310 §3): con 34–44 infortuni l'incertezza statistica è circa ±15%.

## 2. Il rosso non azzera i gialli

**Dove.** `cartellini310` (simulate) e il percorso giocato (`_newYellAccum75`, «Sprint 75»), entrambi sotto `__CPM_NO_G310E`.
Col rosso: squalifica di 1 giornata, il conto dei gialli **resta quello di prima**; i gialli presi nella partita dell'espulsione
non si sommano (vedi dubbio 2). Il conto si azzera solo dopo la squalifica per 5 gialli. Col rosso `__CPM_NO_G310E` il percorso
giocato torna ad azzerare (comportamento del 7.999.199), e le simulate tornano a non contare i cartellini.

**Misura (bilancio-310, E).** Conto 2 + rosso: verde `yellAccum 2, isSuspended true` (prima del giro 311: `yellAccum 0`).
Squalifiche dell'eroe nelle carriere: **0,57 a stagione** (40 in 70, base 2,0%) e **0,67** (47 in 70, base 2,5%), contro 0,53 del 310.
L'effetto del solo punto 2 non è separabile in queste carriere: i rossi sono rari e i campioni non sono appaiati; la crescita viene
soprattutto dalle carriere diverse. Non posso confermare quanto dei +0,14 sia dovuto al rosso che tiene i gialli.

## 3. Coperture mancanti del punto E (dubbio 8 del 310)

- **KO europeo nella Simula** (`simulateAndAdvance`, ramo `isEuroKO`): ora chiama `cartellini310` come il girone europeo
  (squalifica scontata se l'eroe era squalificato, altrimenti conta i cartellini se ha giocato).
- **Partite extra della settimana** (`_xopp`, recupero di più partite in un colpo in «Avanza»): un conto progressivo `_xc` porta
  cartellini e squalifica attraverso le partite extra; se l'eroe è squalificato salta quella partita (niente presenza né gol/assist,
  voce `squalificato`) e sconta. Le extra sono di fatto solo di lega: coppa ed Europa vengono già rimandate al loro ramo.
- Nessuna prova dedicata alle due coperture (non ho trovato un modo economico di provocarle dal banco senza grafica): sono coperte
  solo dalla non-regressione (career-sim, career-invariants, tripath). Dichiarato.

## Controlli (uno alla volta, CPM_CI_PAR=0, CPM_CHROME=/opt/pw-browsers/chromium)

| controllo | esito |
|---|---|
| `bilancio-310` (A–F; D con tre bracci) | ✅ 13/13 bracci con l'esito atteso |
| `test:logic` | ✅ 51/51 |
| `save-compat` | ✅ 12 pass · 0 fail |
| `squalifica-222` | ✅ verde |
| `infortunio-263` | ✅ verde |
| `career-invariants` | ✅ |
| `career-sim` | ✅ 2 stagioni |
| `tripath-chokepoint` | ✅ |
| `simula-v2` | ✅ verde e rosso atteso |
| `sim-motore` | ❌ rosso dichiarato (PO-599): **gol 2,29** contro soglia 2,3, invariato dal 310 |

`node tools/build-src.mjs` + `node tools/check-src.mjs`: **IDENTICO BYTE PER BYTE**.

**Guardiano bilancio-310, braccio D.** Misurava la funzione a 90' pieni e fatica 38 con banda 0,45–0,80, tarata sulla base del 310.
Con la base nuova la funzione a 90' pieni dà **1,103** (che in carriera diventa 0,63). Nuova banda verde **0,85–1,30**; braccio
`rosso` (`__CPM_NO_G310D`) **0,000**; braccio nuovo `rosso311` (`__CPM_NO_G311D`, base del 310) **0,597** → cade sotto 0,85.
La banda si è alzata (non abbassata). **Braccio E**: in più pretende `yellAccum 2` dopo il rosso.

## Dubbi per il PO

1. **Base 2,5% invece di «circa 1,8–2%».** Con 2,0% le carriere davano 0,49 (appena fuori dalla banda 0,5–0,7); con 2,5% danno 0,63.
   Se il PO preferisce restare nel 2%, il risultato in carriera è ~0,5.
2. **Gialli della partita dell'espulsione.** Col rosso non li sommo al conto: il motore senza grafica non dice se il rosso è per
   doppia ammonizione (dove nel calcio vero i due gialli non contano) o diretto dopo un giallo (dove il giallo di solito conta).
   Ho scelto la regola della doppia ammonizione per tutti i rossi; se va contato il giallo prima del rosso diretto, serve che il
   motore distingua i due casi (oggi `cart310` porta solo `y` e `r`).
3. **Squalifiche 0,57–0,67 a stagione**, ancora sotto l'«~1-2» citato nel 310 (dubbio 4 del 310, non deciso esplicitamente dal PO
   oltre alla regola 5 gialli/rosso). Le ho solo misurate.
4. **Coperture del punto E senza prova dedicata** (KO europeo nella Simula, partite extra): solo non-regressione.
5. **Carriera con fatica trascurata non rimisurata** (tetto del limite settimanale): con la base più alta gli infortuni lì
   saliranno (310: 7 in 8 stagioni con 1,0%).
6. **Dal vivo il rosso ora tiene i gialli** (decisione PO «anche dal vivo»): nessun controllo esercita il percorso giocato con un
   rosso dopo dei gialli (squalifica-222 è verde ma non lo prova direttamente).

## Limiti dichiarati

- Nessuna partita 3D; nessun `highlight-95`, `ingresso-206`, `career-critical` (per istruzione).
- Carriere non appaiate; 70 stagioni per braccio di base.
