# Rapporto giro 35 — PO-207/PO-228 «Restringi, poi ritara»

Data: 15-16/10/2026 · Ramo `sviluppo/ripartenza-228-giro35`, base `sviluppo/passaggi-228-giro32` (7.999.170 + sonde del giro 32,
`35c9b86`) · GAME_VERSION e SAVE_VERSION invariate · nessun push su `main`, `poc/*`, `lavoro/*` · Zona G non toccata.

## Esito in breve

1. **Restrizione fatta.** Lo schieramento dei ventidue con palla tenuta 11 passi (giro 27) scatta solo dopo un gol **dell'eroe
   in scena** (highlight, rigore/punizione, gol subito nella sua scena). Dopo ogni altro gol si riparte comunque **dal centro**
   (PO-207 resta soddisfatta), senza schieramento né palla tenuta, come sulla 7.999.169. Rosso `__CPM_NO_RIP235`, guardiano
   nuovo `ripartenza-235`.
2. **Dopo la restrizione (40 partite dal vivo):** tiri 21,4 · xG 1,86 · cross 23,0 tornano verso la 169 (22,5 · 1,68 · 26,7);
   i passaggi scendono a **779,7**, non a 739 come previsto dal giro 32.
3. **Ritaratura:** con 780 di partenza la variante da +9 % del giro 32 avrebbe portato a ~850 (fuori tolleranza). Ho tarato al
   banco la quota che manca (+4,4 %): solo nel modo vissuto `adv` 70 → 76 e `pAtt` 0,05 → 0,06. **Dopo (40 partite dal vivo):
   passaggi 807,2 — dentro 790-838** (−0,8 % da 814).
4. Tiri −1,05 (−4,9 %) e xG −0,19 fra «dopo restrizione» e «dopo ritaratura» dal vivo: **entro il rumore** (≈1,3 errori standard
   della differenza), e al banco sugli stessi semi sono fermi (tiri −0,4/+0,2 %, xG +0,9/+1,4 %). Lo dichiaro comunque: i due
   segni vanno nello stesso verso.

## 1. La restrizione (src/15-live-match.jsx)

- `golScena235Ref` (nuovo ref accanto a `ko207Ref`): vale 1 quando l'ultimo gol è dell'eroe in scena. Si accende nei tre punti
  dove nasce un gol di scena: `fireGoalCeleb` (gol/assist da highlight, `src:"highlight"`), il gol su piazzato dell'eroe
  (`src:"setpiece"`), il gol subito nell'highlight (`goal_against`). Si spegne quando la ripresa dal centro lo consuma.
- Ramo KO207 fuori scena (r. ~5562): `riprendi({centro:true, lato, schiera:_sch235})` con `_sch235 = golScena235Ref || __CPM_NO_RIP235`.
  Prima era `schiera:true` a ogni aumento del punteggio.
- Il ramo di fine scena del motore (`riprendi({... schiera:_c207 ...})`, r. ~5585) **non** è cambiato: lì il gol è nato in scena.
- Testimone `__CPM_KO207` arricchito: `eroe` (gol di scena), `sch` (schieramento chiesto), e l'**effetto** misurato subito dopo la
  ripresa: `fuori` (giocatori di movimento nella metà sbagliata) e `hold` (passi di palla tenuta).

### Guardiano `ripartenza-235` (nuovo, `npm run ripartenza-235`)

Partita vera dal salvataggio S12, autoplay seedato, fino al primo gol ambientale; poi delega il caso rigore a
`ripartenza-piazzato-27` (braccio verde).

| braccio | gol | ripresa | fuori | hold | esito |
|---|---|---|---|---|---|
| verde | cronaca al 14' | kickoff, (50,50) | 9 | 0 | centro sì, schieramento no ✅ |
| rosso `__CPM_NO_RIP235` | cronaca al 14' | kickoff, (50,50) | 0 | 11 | regola larga visibile ✅ |
| rigore dell'eroe (verde) | setpiece | kickoff, (50,50) | 0 alla battuta | 11 | schieramento c'è ✅ |

`ripartenza-piazzato` intero (rigore + punizione, verde + rosso `__CPM_NO_SCHIERA27`): verde fuori 0 / hold 11, rosso fuori 6 /
hold 2 — invariato rispetto al giro 27. `ripartenza-207`: verde.

## 2. Misura dal vivo

Sonda `passaggi-228-vivo-misura` del giro 32, stessa procedura (salvataggio `save-190-s12-ovr93`, GLB spento, velocità 4,
autoplay seedato, una partita alla volta, tabellino da `__CPM_MOTORE_OBJ().tabellino()`). Serie A = 20 nomi del collaudo
(`Collaudo169 Atleta 01…20`), serie B = 20 nomi del giro 32 (`Giro32 Serie B 01…20`). 160 partite, tutte arrivate al fischio.
Riepilogo: `node docs/sviluppo/dati-giro35/riepilogo.mjs <file.jsonl…>`.

Medie per partita, due squadre insieme.

| Voce | 169 collaudo (20) | 170 (40, giro 32) | **dopo restrizione (40)** | **dopo ritaratura (40)** | sd (40, dopo) |
|---|---|---|---|---|---|
| Passaggi | 739,1 | 811,3 | **779,7** | **807,2** | 56,7 |
| Tiri | 22,5 | 18,7 | **21,35** | **20,30** | 3,9 |
| Tiri in porta | 8,0 | 6,75 | 7,35 | 7,58 | 2,4 |
| Gol | 2,4 | 2,23 | 2,70 | 2,60 | 1,5 |
| xG | 1,68 | 1,39 | **1,86** | **1,67** | 0,67 |
| Cross | 26,7 | 20,7 | **22,95** | **24,57** | 6,5 |
| Dribbling tentati | 24,2 | 22,9 | 22,7 | 22,3 | 10,5 |
| Dribbling riusciti | — | 12,2 | 12,45 | 12,50 | — |
| Possesso casa % | 51,2 | 52,3 | 51,7 | 52,3 | 3,5 |
| Passaggi riusciti % | 90,8 | 90,9 | 90,8 | 91,0 | 1,1 |

Per serie: restrizione A 787,6 / B 771,9 passaggi · tiri 21,35 / 21,35 · xG 1,83 / 1,88; ritaratura A 800,9 / B 813,6 ·
tiri 20,8 / 19,8 · xG 1,75 / 1,59.

Dati grezzi: `docs/sviluppo/dati-giro35/restr-serieA.jsonl`, `restr-serieB.jsonl`, `ritar-serieA.jsonl`, `ritar-serieB.jsonl`.

### Lettura

- **Restrizione.** Sulle prime 10 gare della serie A, k1, k4, k7, k9 danno tabellini **identici al numero** a quelli dello
  screening del giro 32 con la regola spenta (`__CPM_NO_SCHIERA27`), e k4/k7 (0-0) identici anche a 169/170: la restrizione
  si comporta come «regola spenta» sui gol ambientali. Media delle stesse 10 gare: 755,6 passaggi contro 737,1 dello screening
  e 723,7 della 169 (differenza entro il rumore di 10 gare, ~27).
- **Perché 780 e non 739.** Sulle 40 partite la differenza con la 169 (+40,6) è circa 2,4 errori standard (la 169 ha solo 20
  partite e sd 63). **Non posso confermare** se sia rumore o un residuo reale: lo schieramento dopo i gol dell'eroe in scena è
  rimasto (è la regola chiesta), e la 170 porta anche altri rami non verificati uno per uno (giro 32 §4). Ho quindi tarato
  sulla misura fatta, non sul 739 atteso.
- **xG dopo la restrizione (1,86)** è sopra la 169 (1,68) e sopra la fascia 1,5-1,7 indicata: la sd per partita della 169 non
  l'ho; con quella della 170 (0,51) la differenza vale ~1,1 errori standard. Dopo la ritaratura è 1,67, dentro la fascia.
- **Cross** tornano a 23-25 (fascia del giro 16: 20-30), non del tutto ai 26,7 della 169.

## 3. La ritaratura (src/14-motore-possesso.jsx)

Base: la patch del giro 32 (`dati-giro32/ritaratura-pronta-non-adottata.patch`), solo il modo vissuto (`cfg.brainLive`), rosso
`__CPM_NO_PASSVIVO228` = motore della 7.999.170, simulazione rapida identica al bit. Costanti: `_K228V = {adv:76}`,
`pAtt × 0,06/0,05`.

Banco (`passaggi-228`, N=1500 per braccio, semi da 1000), passaggi verde/rosso:

| variante | passaggi | tiri | xG | gol | cross | dribbling | occasioni eroe |
|---|---|---|---|---|---|---|---|
| giro 32 «+9 %» (advC 72 · adv 80 · pAtt 0,08) | +9,2 % | +0,3 % | +1,4 % | −3,9 % | +0,2 % | −2,2 % | +1,0 % |
| **adottata: adv 76 · pAtt 0,06** | **+4,4 %** | +0,2 % | +1,4 % | +0,1 % | +1,5 % | −1,1 % | −1,8 % |
| advC 71 · adv 76 · pAtt 0,065 | +5,9 % | −0,2 % | +1,0 % | −0,1 % | +1,8 % | −2,6 % | −1,0 % |
| advC 72 · adv 75 · pAtt 0,065 | +7,4 % | −2,3 % | 0,0 % | −2,3 % | +3,9 % | −5,0 % | −2,9 % |

Conferma su semi indipendenti (N=2000, semi da 777): passaggi **+4,3 %**, tiri −0,4 %, xG +0,9 %, gol −0,7 %, cross +2,1 %,
possesso +0,27, rapida identica → **VERDE**. Prova del rosso (`CPM_ROSSO=1`, N=600): passaggi +0,0 % → **ROSSO**, exit 1.
Banda del guardiano portata da [+1 %, +5 %] a **[+2,5 %, +6,5 %]** (bersaglio +4,4 %).

Dal vivo: +27,5 passaggi (+3,5 %, atteso +4,4 %), 807,2 contro bersaglio 814 ± 3 %.

## 4. Guardiani e catena

Build: `CPM_FORZA_BUILD=1 node tools/build-src.mjs` + `node tools/check-src.mjs` → identico byte per byte (21 frammenti).

Determinismo e guardiani richiesti dal giro (uno alla volta o dentro la catena, sul build finale):

| guardiano | esito | durata | nota |
|---|---|---|---|
| `seme-a` | ✅ verde | 618 s | 3 giri, seme 2311: ingressi del motore, sorteggi per minuto e punteggio identici |
| `goleade` | ✅ verde | 27 s | 95 contro 50: 7+ gol 0,0 %, scarto 5+ 2,0 %, 2,37 gol (identico al giro 32: la rapida non cambia) |
| `ripartenza-piazzato` | ✅ verde | 178 s | rigore e punizione: verde fuori 0 / hold 11, rosso fuori 6 / hold 2 |
| `replay` | ✅ verde | 43 s | in catena |
| `partita-vera` | ✅ verde | 511 s | in catena |
| `tabellino-228` | ✅ verde | 308 s | in catena |
| `statistiche-228` | ✅ verde | 142 s | in catena (rapida) |
| `ripartenza-207` | ✅ verde | 463 s | in catena |
| `ripartenza-235` (nuovo) | ✅ verde, rosso visibile | 427 s | in catena; tabella al §1 |
| `passaggi-228` | ✅ verde, rosso exit 1 | 79 s | in catena; tabella al §3 |
| `validate-situations` | ✅ verde | 643 s | in catena |

**Catena completa** (`node ci-runner.mjs completa`, 47 passi): **46/47 verdi**. L'unico rosso è `crediti-238` (0 s): lo script
non esiste più in `package.json` dalla 7.999.170 (rimosso con PO-254, sostituito da `crediti-254`, che è verde), ma la catena lo
elenca ancora. È preesistente e non dipende da questo giro: verificato che `8fd95fe` (7.999.170) non ha lo script. Non l'ho
toccato (fuori ambito). Il giro è registrato in `docs/governo/STABILITA.json` dall'esecutore.

## 5. File toccati

- `src/15-live-match.jsx` (restrizione + testimone), `src/14-motore-possesso.jsx` (ritaratura del modo vissuto),
  `CARRIER-MANAGER-AV.html` (ricomposto).
- `tests/visual/ripartenza-235.mjs` (nuovo), `tests/visual/passaggi-228.mjs` (dalla patch del giro 32, banda nuova).
- `tests/visual/package.json`: `ripartenza-235`, `passaggi-228`.
- `tests/visual/ci-runner.mjs`: MAPPA `src/15-` + `ripartenza-235`, `src/14-` + `passaggi-228`; catena completa +
  `ripartenza-207`, `ripartenza-235`, `passaggi-228`.
- `docs/sviluppo/dati-giro35/` (dati grezzi e riepilogo).

## 6. Cosa resta al PO

1. Confermare 807 (790-838) per PO-228 e il nuovo profilo: tiri ~20-21, xG ~1,7-1,9, cross ~23-25.
2. Il residuo 780 contro 739 dopo la restrizione non è spiegato (vedi §2): se serve, una bisezione sui rami della 170.
3. `crediti-238` nella catena completa punta a uno script che non esiste più (rimosso con PO-254): da togliere dalla catena.
