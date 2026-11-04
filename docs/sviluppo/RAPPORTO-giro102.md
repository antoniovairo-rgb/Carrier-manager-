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

## 4. Corse

(in compilazione)
