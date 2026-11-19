# Verifica 7.999.198 — blocco D (solo verifica, nessuna correzione)

**Domanda.** Sulla build unita `prova/198-finale` (086cdba = lavoro/198 f4051ca0 + giro 286 + giro 291, entrambi in
`src/12-three-match-view.jsx`) la prima corsa della madre ha dato due rossi nel braccio verde:
- `portatore-286`: «1 difetti su 9 casi — gi37 battitore #2: avanti e indietro (1.48 inversioni/s), si sposta (1.54 u)»;
- `intercetto-291`: «9 scene su 10 verso la porta avversaria (sbagliate 0, ferme 1)».

Sui rami dei singoli giri erano verdi. Instabilità o interazione fra i due giri?

**Come.** `CPM_CHROME=/opt/pw-browsers/chromium CPM_CI_PAR=0 timeout 2400 npm run -s <nome>` in `tests/visual`, una corsa
alla volta, `free -m`/`df -h` prima di ognuna (memoria libera ≥ 12,4 GB, disco 57 GB liberi in tutte).
- A = build unita 086cdba (questa cartella)
- B = worktree `../solo286` su `origin/sviluppo/giro286-portatore` (d3a1395), `node_modules` collegato
- C = worktree `../solo291` su `origin/sviluppo/giro291-intercetto` (c572410), `node_modules` collegato

## Risultati

### portatore-286

| corsa | braccio VERDE | braccio ROSSO (`__CPM_NO_G286`) | gi37 nel verde | gi37 nel rosso |
|---|---|---|---|---|
| A-1 | 0 difetti su 9 casi | 7 su 7 scene forzate | 0 inv/s · 0 u | 1,45/s · 0,17 u |
| A-2 | 0 difetti su 9 casi | 7 su 7 scene forzate | 0 inv/s · 0 u | 1,45/s · 0,17 u |
| B-1 | 0 difetti su 9 casi | 7 su 7 scene forzate | 0 inv/s · 0 u | 39,52/s · 3,99 u |
| B-2 | 0 difetti su 9 casi | 7 su 7 scene forzate | 0 inv/s · 0 u | 36,1/s · 14,54 u |

Tutte e quattro **✅ VERDE**. Il caso della madre (gi37 verde 1,48/s, 1,54 u) **non si è riprodotto** in 4 corse (2 su A, 2 su B).

### intercetto-291

| corsa | braccio VERDE | braccio ROSSO (`__CPM_NO_G291`) | esito | gi34 verde (vincitore → verdetto) | gi34 rosso |
|---|---|---|---|---|---|
| A-1 | 9/10 avanti, **ferme 1** | 9/9 sbagliate | **❌** | altro (appoggio) → **ferma** (sp 0,7 u) | altro → non portata (dFine 2,1) |
| A-2 | 9/9 avanti | 9/10 sbagliate, ferme 1 | ✅ | eroe → avanti | altro → ferma (sp 0,6 u) |
| C-1 | 10/10 avanti | 9/9 sbagliate | ✅ | eroe → avanti | eroe → sbagliata |
| C-2 | 10/10 avanti | 9/9 sbagliate | ✅ | eroe → avanti | eroe → sbagliata |

**Il caso che cade è sempre gi34** («Pressing aggressivo», famiglia portatore) — riprodotto in A-1 identico alla madre
(9 su 10, ferme 1). Anche gi36 cambia vincitore fra corse (A-1 verde eroe, A-2 verde altro → «non portata»; C rosso altro),
ma lì il verdetto resta «non portata» e non fa rosso.

### Approfondimento su gi34 (sonda in modo scena singola, `GIS=34:0`)

| build | braccio | vincitore → verdetto, una riga per corsa |
|---|---|---|
| A (086cdba), 286 acceso | verde | eroe → avanti · **altro → ferma** · eroe → avanti |
| A (086cdba), `__CPM_NO_G286` | 286 spento | eroe → avanti · eroe → avanti · **altro → non portata** |
| C (solo 291) | verde | eroe → avanti ×4 · **altro → non portata** ×1 (4ª di 5) |

## Conclusione

**Instabilità, non interazione fra i due giri.**

1. **intercetto-291.** Il rosso nasce da gi34, e solo quando il vincitore dell'esito (`_w31`, giro 31) **non è l'eroe** ma un
   altro giocatore («appoggio»). Questo succede anche **col giro 286 spento** sulla stessa build (1 su 3) e **sul ramo del
   solo giro 291** (1 su 5): il vincitore di gi34 non è deterministico da una pagina all'altra, indipendentemente da 286.
   Quando vince «altro», la sonda decide fra «non portata» e «ferma» con la sola distanza pallone–eroe (≤ 1,6 u per almeno 3
   fotogrammi, `analizza()` in `intercetto-291.mjs`), non con `win === 'eroe'`: col pallone che si ferma a ~2 u dall'eroe la
   scena cade una volta da un lato (non portata, neutro) e una dall'altro (ferma, rosso). Sul ramo 291 i 4 bracci del guardiano
   hanno avuto per caso sempre «eroe», per questo era verde.
   I due meccanismi non si toccano per costruzione: 286 agisce solo nelle fasi di lettura (`hl_intro/hl_move/hl_choose`,
   base `_frz685` moltiplicata per `_k286`), 291 solo nell'esito (`_via31`/`_post31`, verso dell'eroe **dopo** che il vincitore
   è stato scelto). 291 non cambia chi vince; 286 potrebbe spostare la geometria di partenza dell'esito (tiene fermo il
   portatore difensivo `_tackleCarrier`), ma la misura col rosso `__CPM_NO_G286` dice che lo scambio eroe/altro avviene anche
   senza di lui.
2. **portatore-286.** Il caso della madre (gi37) non si è riprodotto in 4 corse su 4 (A e B). Non posso confermarne la causa.
   Osservazione: sulla build unita il **rosso** di gi37 vale 1,45/s · 0,17 u (solo il «respiro», appena sopra la soglia 1,0/s),
   mentre sul ramo 286 vale 36-39/s · 4-15 u: la base lavoro/198 (src/12 e altri file oltre ai due giri) cambia la messa in
   scena del battitore di gi37. Il valore della madre (1,48/s) è dello stesso ordine del rosso sulla build unita, ma con
   escursione 1,54 u: compatibile con un fotogramma in cui il fermo del battitore non ha agito, ma **non verificato**.

## Dubbi per il PO / per la madre

- intercetto-291 è **instabile su gi34** anche sul suo ramo (vincitore non deterministico + criterio «portata» per distanza).
  Riparazione possibile (non fatta, fuori ambito): giudicare «portata» solo con `win === 'eroe'` nel testimone `__CPM_G291W`,
  oppure capire perché `_w31` su gi34 non è riproducibile fra pagine nuove (regola «controlli instabili», PROCESSO.md: un
  guardiano instabile si ripara, non si ripete).
- portatore-286 su gi37: un rosso visto una volta e non riprodotto in 4 corse; il rosso di gi37 sulla build unita è al limite
  della soglia, quindi il caso «verde vs rosso» su quella scena è poco separato sulla 198.
- Nessun controllo ha modificato file in `docs/` (verificato con `git status`).
