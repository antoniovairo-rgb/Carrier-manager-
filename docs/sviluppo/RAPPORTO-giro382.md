# Giro 382 — riparazione di `reazione-252` (rilascio 7.999.216 fermato)

Base: `lavoro/201` @ 8543a9cc (7.999.215 + giro 364 «fasce», PO-650). Ramo: `sviluppo/giro382-reazione`.
GAME_VERSION e `docs/governo` non toccati.

## Il fatto

Treno 45728929446 su 8543a9cc: 18 parti verdi, rilascio fermato con «rossi nuovi (1): reazione-252». Parte 09:

```
[verde] 3 giudicate · senza reazione 0 · movimento 0/0 — gi148 riesce: gesto cross a 6.7u; sbaglia 7.7u; intercetto 8.7u
[rosso] 3 giudicate · senza reazione 0 · movimento 0/0 — gi148 riesce 8.9u; sbaglia 8.8u; intercetto 7.3u
❌ reazione-252: verde ok · rosso CIECO
```

## Causa (misurata)

Il guardiano (giro 42, PO-252/8) si regge su UN soggetto: il cross di gi148, in cui il difensore più vicino al punto di
caduta stava oltre i 9u (oltre il tetto del gesto 7.519) e quindi doveva *correre* verso il punto (reazione del 252). Il rosso
`__CPM_NO_REAZ252` spegne quella corsa e il guardiano pretende di vedere almeno una conclusione senza reazione.

Il giro 364 (braccio B) fa cadere il cross sul rifinitore che arriva: il punto si è spostato verso la zona marcata e il
difensore più vicino è ora a cavallo della soglia. Sonda `tests/visual/misura-382.mjs` (gi148, tre esiti, pagina nuova per
esecuzione, 2 ripetizioni, distanza all'armo; g = gesto <9u, m = movimento):

| braccio | distanze misurate |
|---|---|
| giro 364 acceso (com'è oggi) | 9,8m · 12,5m · 7,3g · 12,9m · 11,4m · 8,0g |
| `__CPM_NO_G364B=1` (cross com'era prima del 364) | 14,2m · 9,8m · 15,6m · 15,9m · 12,9m · 15,1m |

In locale il guardiano originale è ancora uscito verde una volta (rosso con 1 caso su 3); in CI, dove i runner sono più
lenti, tutte e sei le distanze sono finite sotto i 9u. **Non è un difetto del gioco**: in entrambi i bracci del treno ogni
conclusione aveva la sua reazione (il gesto del 7.519), cioè proprio ciò che il 252 voleva garantire. È il guardiano
rimasto senza soggetti. In più il suo verde passava con «movimento 0/0» (`V.mov === 0 ||` nella condizione): un verde vuoto.

Ho cercato scene in cui il caso «difensore fra 9 e 24u» esista da solo dopo il 364. Censimento su pagina stanca (scene in fila):
candidate gi68, gi72, gi159, gi160 (12-22u). Su **pagina nuova** (lo standard del guardiano, 7.483), 2 ripetizioni × 3 esiti:
tutte gesti, 0,9-7,4u. Nessun soggetto naturale stabile.

## Correzione

1. **Gancio solo-collaudo `__CPM_LON382`** (src/12, accanto alla scelta del difensore della reazione 7.519, attivo solo con
   `?cpmtest=1`, sul modello di `__CPM_LAT295`): all'armo dell'arco ogni avversario di movimento (non il diretto) più vicino di
   *u* al punto della reazione viene messo in linea retta a *u* dal punto, fermo. La scelta del difensore, il gesto, la corsa del
   252 e il driver off-ball restano quelli del gioco. Testimone `__CPM_LON382N` (il gancio è scattato).
2. **`reazione-252.mjs`** — sette esecuzioni per braccio:
   - naturali: gi148 riesce/sbaglia/intercetto — nessuna conclusione senza reazione (gesto o movimento);
   - provocati a 14u: gi148 riesce/sbaglia (cross), gi72 riesce/sbaglia (tiro).
   - Verde: 7/7 giudicate, 0 senza reazione, **movimento su 4/4 provocati**, accorciamento mediano ≥ 4u (soglia invariata).
   - Rosso: 7/7 giudicate, **4/4 provocati senza reazione**.
   - Un errore o un gancio non scattato = «NON GIUDICATA» = rosso. «Movimento 0/0» non può più essere verde.

## Prima / dopo (locale, banco)

| | prima (8543a9cc) | dopo |
|---|---|---|
| verde | 3 giudicate, movimento dipendente dalla distanza (CI: 0/0, passava vuoto) | 7/7, senza reazione 0, provocati con movimento 4/4, accorciamento mediano 8,7u |
| rosso | 0-1 senza reazione su 3 (CI: 0 → CIECO) | 5 senza reazione, provocati 4/4 |
| durata | ~2,3 min | ~5,1 min |

Esiti delle catene: vedi in fondo.

## File toccati

- `src/12-three-match-view.jsx` (gancio `__CPM_LON382`) + `CARRIER-MANAGER-AV.html` ricomposto (`build-src`, `check-src` IDENTICO).
- `tests/visual/reazione-252.mjs` (soggetti e verdetto).
- `tests/visual/misura-382.mjs` (sonda nuova, nessuno script npm: neutra per il trenino, regola del giro 328).
- `docs/sviluppo/RAPPORTO-giro382.md`.

## Dubbi per il PO

1. **(consigliata, applicata)** Caso provocato col gancio solo-collaudo + i tre casi naturali di gi148 come controllo di «reazione
   sempre presente». Deterministico, indipendente dalla lentezza dei runner, il rosso vede per costruzione. Costo: il soggetto
   del movimento non è più nato dal gioco ma dalla sonda (come `portiere-295` col `__CPM_LAT295`).
2. Cercare un soggetto naturale con margine ampio (altro seme di partita via `openMatch({name})`, altra scena-esca, scene in fila
   su pagina stanca come nel censimento): più «vero», ma oggi nessun candidato regge su pagina nuova e ogni ritocco del motore
   (come il 364) può togliergli di nuovo il caso.
3. Allargare la reazione di movimento anche sotto i 9u quando il gesto non c'è, o alzare il tetto del gesto: è un cambio del
   gioco, non del guardiano, e il 364 ha reso il gesto il caso normale sul cross — non consigliato senza una richiesta.
4. Da decidere a parte: il censimento ha trovato tiri con il difensore **oltre i 24u** e quindi senza alcuna reazione (gi69,
   gi73-77, 28-39u, su pagina stanca). Il 252 aveva tetto 24u apposta; non toccato qui (fuori ambito).
5. `DURATE-GUARDIANI.json` (docs/governo, non toccato): reazione-252 ora dura ~5 min invece di ~2,3; il bilanciamento del treno
   va aggiornato da chi governa quel file.

## Catene

Tutte sul banco locale, build ricomposto di questo ramo (GAME_VERSION invariata, 7.999.215):

- `reazione-252`: ✅ verde (7/7, provocati con movimento 4/4, accorciamento mediano 8,7u) e il rosso vede (provocati senza reazione 4/4).
- `node ci-runner.mjs giro reazione-252` (guardiano + 17 sentinelle): **✅ 18/18 verdi**, nessun passo instabile.
- `fasce-364`: ✅ VERDE — verde (A) 288 cross da largo, 0 accentrati; (B) 14 cross giudicati, 0 bocciati, ricevente all'arrivo
  mediana 0,9u; rosso `__CPM_NO_G364` vede il difetto (14/14 bocciati). Il giro 364 resta intatto.
