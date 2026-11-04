# Rapporto giro 102 — esiti-241 rosso nella catena notte 178

Ramo `sviluppo/giro102-esiti241` (da `lavoro/178`, 4a4ff494: 7.999.178 con i giri 90-100 uniti). `GAME_VERSION` e `docs/governo/*`
non toccati (la 7.999.178 si chiude con l'unione dei giri 101-102).

## 1. Misura: il rosso non era gi150

La riga del registro della catena (`catena-178-t3.log`, riga 25) riporta il **primo** `❌` dell'uscita del guardiano, e il guardiano
stampa entrambi i bracci: la riga gi150 «🌀 Dribbling provocatorio — il fallo c'è!» chance/win_freekick «Palla d'oro!» è il
**braccio rosso** (`__CPM_NO_ESITI241`), dove la contraddizione è attesa. Il motivo vero è dopo, troncato nel registro («· verd…»).

Rigiocato `esiti-241` sul build 4a4ff494 (corsa 1, 390 s, sessione senza altro carico):

```
VERDE … B contraddizioni 2/3
  gi14 «↗️ Cross basso teso» chance/chance … ❌ chance: il portiere si tuffa su una consegna in area (PO-250)
  gi16 «↗️ Cross teso» chance/chance …       ❌ chance: il portiere si tuffa su una consegna in area (PO-250)
  gi150 «🌀 Dribbling provocatorio — il fallo c'è!» chance/win_freekick «Subisce il fallo» «🟢 Steso da un avversario: calcio piazzato.»
❌ esiti-241 · verde B: gi14 … · gi16 …
```

Il fallo cercato riuscito è raccontato **correttamente** («Subisce il fallo», `_fc241`/`_falloOk38` intatti): confermato anche con la
sonda `sonda-g102.mjs` su gi150 da sola. Il difetto riproducibile è sulle **consegne in area** gi14 e gi16 (cross riusciti, esito
`chance`): il riquadro e la cronaca dicono «pallone messo in mezzo, mischia, palla viva» (`_CHANCE_TX241.aerea`), il 3D fa tuffare il
portiere.

**Causa: giro 100 D3** (commit 44f4e5d, `src/12`). Il ramo `cross_goal` con esito «occasione» prima rimbalzava subito in area
(`deflect`); il giro 100 lo ha convertito **sempre** in consegna + incornata + `assist_shot` (tuffo e respinta del portiere), per
riparare il caso SEIFERT di highlight-95 (passaggio raccolto lontano dalla porta, ricevente a x<22, «il portiere dice no a SEIFERT»).
Ma `cross_goal` nasce in tre punti: cross dell'eroe, punizione «palla in area», e passaggio raccolto lontano. Sui primi due, con
esito occasione e nessun tiro del compagno scritto dal motore, il racconto è la consegna che balla in area: il tuffo lo contraddice.

Sonda su gi14 da sola (pagina unica):
- con la regola del giro 100 (`__CPM_NO_G102`): post-arco `cross_goal > assist_shot > deflect`, `gk_dive`, `home:header` → contraddizione;
- con la correzione: `cross_goal > deflect`, nessun gesto del portiere → 0.

## 2. Correzione (src/12, src/15)

- `src/12-three-match-view.jsx`: la conversione del giro 100 D3 vale solo se
  - il `cross_goal` nasce dal **passaggio raccolto** (ramo del ricevente, nuovo segno `sr.current._cg102`, scritto in ognuno dei tre
    punti che assegnano `cross_goal`: vero solo nel ramo del ricevente), **oppure**
  - il motore ha **scritto il tiro sprecato del compagno** (nuova prop `hlSpreca102 = !!outcome.mate298`).
  Altrimenti la consegna in area con esito occasione torna al rimbalzo `deflect` di prima del giro 100.
- `src/15-live-match.jsx`: passa la prop `hlSpreca102` a `ThreeMatchView`.
- Interruttore rosso **`__CPM_NO_G102`**: comportamento attuale (giro 100: conversione su ogni consegna). `__CPM_NO_G100D3` resta
  com'era e ha la precedenza (deflect ovunque).

Perché anche `hlSpreca102`: la prima stesura (solo `_cg102`) è stata bocciata da highlight-95 — «↗️ Palla in area» s5/7 (punizione
in area, «Assist perfetto — para il portiere su il compagno») tornava col pallone mai entro 6,8 dal portiere, lo stesso numero
misurato dal giro 98 prima del giro 100. Lì il motore ha scritto la parata del compagno, quindi il tuffo è giusto.

⚠️ **Osservazione fuori ambito (non toccata):** la prop `hlMate298` letta dal 3D in quattro punti (`src/12`, righe ~4327, ~4387,
~4810) **non viene mai passata** da `LiveMatch` (nessun `hlMate298=` in `src/15`; `outcome.mate298` esiste). Quei rami del giro 93/95
(«il compagno spreca» fuori/palo/murato nel 3D, uno-due che non torna all'eroe) sono quindi spenti. Non l'ho collegata: accenderla
cambierebbe il comportamento di rami che nessuno ha misurato acceso. Ho usato una prop nuova, booleana, letta solo dalla mia
condizione. Va decisa a parte.

## 3. Guardiano

`esiti-241.mjs`:
- **Parte D** (nuova): terzo braccio `__CPM_NO_G102` sulle sole gi14/gi16; deve vedere il portiere che si tuffa su una consegna in
  area in ≥1 scena su 2. Nel verde la parte B resta a 0 contraddizioni (soglie invariate).
- **Finestra di osservazione** di gi14/gi16 portata da 4 a 7 s di scena (tetto di parete 40 → 90 s) **in tutti i bracci**: il tuffo
  arriva dopo l'incornata e con due guardiani in parallelo 4 s non bastavano (braccio G102 0/2 in due corse sotto carico, 2/2 da
  solo). Nel verde la finestra più lunga guarda di più, non di meno.

## 4. Corse (build del ramo, `CARRIER-MANAGER-AV.html` ricomposto da `src/`)

⚠️ Il container della sessione è ripartito **due volte** a metà dei rituali: le corse interrotte non contano e sono state rifatte.
Dove un guardiano ha girato in parallelo con un altro lo scrivo, perché alcuni (parata-100, esiti-241 parte D) sono sensibili al
carico.

| guardiano | esito | durata | numeri |
|---|---|---|---|
| esiti-241 corsa 1 (base 4a4ff494, prima della correzione) | ❌ | 390 s | verde B **2/3** (gi14, gi16 portiere in tuffo su consegna) · gi150 corretto |
| esiti-241 corsa 2 (prima stesura) | ✅ | 467 s | verde B **0/3** · rosso B 2/3 · rosso G102 **2/2** |
| esiti-241 corse 3-4 (seconda stesura, accanto a highlight-95) | ❌ | 653 / 647 s | verde B **0/3**; rosso G102 0/2 e rosso B 1/3 → carico: finestra di 4 s troppo corta per il tuffo |
| sonda-g102 gi14 da sola | — | ~60 s ×2 | rosso G102: `cross_goal>assist_shot>deflect` + `gk_dive` · verde: `cross_goal>deflect`, nessun gesto |
| esiti-241 corsa 5 (finestra 7 s, accanto a esiti-218) | ✅ | 601 s | verde B **0/3** · rosso B 2/3 · rosso G102 **2/2** |
| esiti-241 corsa 6 (versione finale, da solo) | ✅ | 462 s | verde A1 0/2 · A2 0/16 · A3 contrasto · B **0/3** · C 2/2 · rosso B 2/3 · rosso G102 **2/2** |
| highlight-95 corsa 1 (prima stesura, accanto a parata-100) | ❌ verde | — | «↗️ Palla in area» s5/7 minimo 6,8 dal portiere → prima stesura bocciata, aggiunta `hlSpreca102` |
| highlight-95 (seconda stesura, accanto ad altri guardiani) | ✅ verde | ~60 min | verde **118 highlight, 0 difetti** (4 parate giudicate, 25 non giudicabili per la guardia di parete); rosso D1/D2/D3 visibili; D4 «non visto» perché il browser è morto col riavvio del container sulle partite s12 (rosso s12 «errore… browser has been closed») |
| highlight-95 solo rosso, s12 seme 1234 + scena senza esito | ✅ D4 visibile | 260 s | rosso **D4 senza esito 7** (il ❌ della corsa ridotta è atteso: D1-D3 non hanno partite qui) |
| parata-100 (accanto a highlight-95) | ⚠️ verde ✅ | 1020 s | verde **4/4 parate al portiere, 0 difetti** (1 sul ramo cross_goal); rosso «non si vede» con 2 non giudicabili (carico: 5 pagine) |
| parata-100 solo rosso, da solo | ✅ | 308 s | rosso SEIFERT **minGB 22,3** (giro 100: 22,4), 0 non giudicabili |
| assist-298 verde (accanto a highlight-95) | ✅ | — | 16 scene giudicate (pavimento 15) · passaggi riusciti 93,8% · gol compagno 25% · **0 difetti** |
| assist-298 solo rosso | ✅ | 533 s | difetti visibili (uno-due HOWARD/SPENCER) |
| assist-nome-98 (verde e rosso) | ⚠️ verde ✅ | 3025 s | verde: nome coerente 100% su 12, 3D ricevente = cast 8/12, D3 0, D4 0, B ok; rosso: D1/D3/B visibili, D4 «0 seguiti» |
| assist-nome-98 solo rosso parte A | ✅ | 1086 s | rosso **D4 visibile** (seme 3: seguito con giocata d'assist dopo passaggio respinto) → il «0 seguiti» era frequenza |
| esiti-96 | ✅ | 759 s | verde OK D1, D2, D3, B15, D6, D7, D12, D15, D14 · rosso atteso su tutti |
| chiusura-99 (corsa intera ×3) | ❌ strumento | 80-97 s | si schianta in parte D9: `document.querySelector('[data-g99m]')` nullo (il riquadro «GOOOOL!» sparisce fra due fotografie) — nessun giudizio emesso |
| chiusura-99 D9 sul build di BASE 4a4ff494 (verde) | ❌ | — | gol 6/6, 1 sotto contrasto 3 → **rosso già sulla base** (la corsa non si è schiantata) |
| chiusura-99 D9 sul ramo (verde, poi rosso) | ✅ | ~2×100 s | verde 6/6, mediana 5,81, 0 sotto 3 · rosso mediana 1,37, 5 sotto 3 |
| chiusura-99 RIC (verde e rosso) | ✅ | 1098 s | verde servito = nominato **6/6 (100%)**; rosso visibile |
| esiti-218 (guardiano della base, accanto a esiti-241) | ❌ copertura | 1066 s | verde **0 contraddizioni** su 11 scene (pavimento 12) · rosso 4 — preesistente, diagnosticato dal giro 101 |
| esiti-218 (seconda corsa) | ❌ copertura | 1074 s | verde 0 contraddizioni su 11 scene |
| esiti-218 **versione giro 101** (`origin/sviluppo/giro101-esiti`, file temporaneo non committato) sul ramo | ✅ | 1607 s | verde **18 scene / 0** · rosso 19 / 5 |
| test:logic | ✅ | — | 43/43 |
| save-compat | ✅ | — | 12 pass · 0 fail |

`node tools/build-src.mjs` + `node tools/check-src.mjs`: identico byte per byte, allineato.

## 5. Punti aperti e note per l'unione

1. **Causa comune col giro 101?** No, per quanto ho misurato. Il giro 101 ripara il racconto del **tiro dell'eroe** (esiti-218: il
   riquadro dice «murato» dove il motore dice «fuori», src/05/15) e il suo rosso nella catena era di **copertura** (11 scene su 12,
   0 contraddizioni). Il rosso di esiti-241 era del **3D** (src/12): il giro 100 D3 aveva esteso il tuffo del portiere a ogni consegna
   in area. Stessa famiglia («il racconto deve dire la verità del motore»), cause diverse. File toccati da questo giro: `src/12`
   (quattro righe), `src/15` (una prop sulla riga di `<ThreeMatchView>`), `tests/visual/esiti-241.mjs`, `tests/visual/sonda-g102.mjs`
   (sonda, non guardiano), questo rapporto. Nessun conflitto atteso con `src/05`.
2. **Il registro della catena inganna**: `ci-runner` riporta il primo `❌` dell'uscita, che per i guardiani verde+rosso può essere una
   riga del **braccio rosso** (contraddizione voluta). Qui ha mandato a cercare un difetto su gi150 che non c'era. Suggerimento (non
   applicato, fuori ambito): riportare la riga dopo «❌ <nome>» (il motivo), non il primo ❌.
3. **`hlMate298` mai passata al 3D** (vedi §2): rami del giro 93/95 spenti. Da decidere a parte, con misura.
4. **chiusura-99 D9 si schianta nella corsa intera** (3/3 su questo ramo; sulla base la stessa parte da sola è risultata **rossa**
   per contrasto, 1 gol sotto 3). La mia modifica non tocca il riquadro del gol né i tiri da gol usati da D9 (`shot`/`goal`, non
   `cross_goal`/`chance`). Da riparare la sonda (attesa dell'elemento prima della seconda fotografia) e, se ricompare, il contrasto.
5. **Sensibilità al carico**: parata-100 rosso e la parte D di esiti-241 cambiano esito con più di due pagine attive. La catena
   gira due guardiani alla volta: per esiti-241 la finestra di 7 s su gi14/gi16 ha retto accanto a esiti-218 (G102 2/2).
6. `GAME_VERSION` non toccata: la riparazione chiude la 7.999.178.
