# Giro 329 — trenini a 15 macchine, orfani solo di notte (PO-621, ritocco del 328)

Ramo: `sviluppo/giro329-trenini-15` (da `sviluppo/giro328-trenini-corti` = 7d0a80c). Non tocca `src/` né `GAME_VERSION`. Niente
browser, niente push su `lavoro/**`, `prova/**`, `main`, `poc`, nessuna corsa su Actions.

## Decisioni del PO (22/11 19:40) e cosa ho fatto

**1. Trenini fino a 15 macchine.** `TETTO_TRENINO` 4 → 15 (`tests/visual/ci-treno-308.mjs`), `TETTI_328.trenino` 4 → 15
(`tools/trenino-317.mjs`). `confronta` di `tools/mappa-stretta-328.mjs` ora legge i tetti da lì: prima erano scritti a mano (4/15).

**Due corse insieme sforano le 20 macchine.** Treno grande 15 + trenino 15 = 30. Due trenini su due `lavoro/**` diversi = 30. Il
gruppo di prima (`treno-guardiani-${{ github.ref }}`) li lasciava correre insieme. Ho messo **una concorrenza unica** per tutte le
corse del treno:

```yaml
concurrency:
  group: treno-guardiani
  cancel-in-progress: false
```

Ne segue: una corsa del treno alla volta, al massimo 15 macchine. Più il deploy avviato dal rilascio fa 16 su 20: restano sempre 4
posti liberi. `validate-situations.yml` (2 job) parte solo su `main`/`staging`/`claude/**`. Anche quando coincide con un rilascio su main:
15 + 2 + 1 = 18 su 20.

Cosa cambia rispetto a prima, da sapere:
- **Un push nuovo sullo stesso `lavoro/**` non annulla più il trenino in corsa.** Prima lo annullava. Ora il push nuovo aspetta.
- **Limite di GitHub, scritto nel workflow:** un gruppo tiene **una** corsa in corso e **una** in attesa. Se arriva una terza corsa,
  quella in attesa viene annullata, quella in corsa no. Esempio: c'è un trenino in corsa, il treno grande delle 01:07 è in attesa,
  arriva un push su `lavoro/**`. Il treno grande di quella notte salta e al suo posto gira il trenino. Lo dico perché il treno grande
  comanda il blocco dei rilasci. Non ho trovato un modo, dentro Actions, per mettere in fila più di una corsa senza un servizio esterno.
  Non posso confermare che GitHub offra oggi una coda più lunga: non l'ho verificato.

**2. I 46+4 guardiani senza riga restano solo nel treno grande notturno.** Il 328 ne aveva trovati 50: 46 delle catene
`grafica`/`guardiani` e 4 della catena `carriera` (`rimbalzo-189`, `scene-190`, `rigori-190`, `debito-190`). Il rapporto del 328 li
contava insieme nel dubbio 2 («I 46+4 guardiani senza riga»), quindi li ho tolti tutti e 50. Sono stati tolti da 130 posti nelle righe.
Le righe della MAPPA ora coincidono **esattamente** con quelle di `lavoro/201`, tranne due: la riga `src/18|16|10`, che diventa
`src/18|10`, e la riga propria di **src/16** (63 guardiani), che resta. Restano anche le sonde neutre e la regola «se il trenino finirebbe
dopo la mappa intera si gira la mappa intera».

I 50 sono dichiarati in `SOLO_NOTTE_329` in `tests/visual/ci-runner.mjs` (`leggiMappa` lo restituisce come `SOLO_NOTTE`). Girano di
notte perché stanno in `CATENE` e la mappa intera esegue tutte le catene. Se il PO vuole riportarne uno nel trenino, gli si dà una riga e
lo si toglie dall'elenco.

## Tabella prima/dopo, stessi 8 vagoni, 15 macchine

`node tools/mappa-stretta-328.mjs confronta origin/lavoro/201 3cb166a 7614065 df2a359 acf137c c25e6e6 e94052e 86a7d74 251db90`.
Il metodo è quello del 328 (durate di `DURATE-GUARDIANI.json`, taglio di `ci-treno-308 piano`, senza installazione né code). Ora però
**15 macchine anche per il trenino**, in tutte le colonne. Formato: guardiani · parti · somma · parete.

| vagone | src | prima (mappa di lavoro/201) | dopo 328 con orfani | **dopo 329** | 328 col tetto 4 (dal suo rapporto) |
|---|---|---|---|---|---|
| 323 salto-gennaio | 08 18 | 133 · 7 · 485 · ~100 | 166 · 9 · 569 · ~100 | **133 · 7 · 485 · ~100** | completo ~136 |
| 326 deploy | — | 20 · 1 · 65 · ~65 | uguale | **uguale** | ~65 |
| 321 salvataggio-giornata | 09 | 35 · 3 · 190 · ~64 | uguale | **uguale** | ~64 |
| 320 nome-intro | 09 17 19 | completo (4 sonde) 353 · 29 · 1985 · ~135 | completo (più lento) ~135 | **trenino 209 · 23 · 1560 · ~133** | completo ~135 |
| 318 testi | 11 18 | 137 · 8 · 505 · ~100 | 160 · 8 · 559 · ~100 | **137 · 8 · 505 · ~100** | completo ~135 |
| 316 musica-serata | 09 17 | completo (assets/audio) ~135 | uguale | **uguale** | uguale |
| 314 serata-tifosi | 11 16 | 136 · 8 · 500 · ~100 | 121 · 8 · 494 · ~100 | **107 · 7 · 480 · ~100** | completo ~134 |
| 311 ritocchi | 09 10 14 15 18 | completo (15 sonde) 349 · 29 · 1965 · ~133 | trenino 256 · 21 · 1415 · ~131 | **completo (più lento) 349 · 29 · 1965 · ~133** | completo ~133 |

Come leggerla:
- **Il tetto a 15 dà quasi tutto il guadagno di parete.** Ogni trenino che contiene `highlight-95` (100 min da solo, il guardiano più
  lungo) finisce in ~100 min invece dei 128-158 col tetto 4. Sotto quel numero non si scende senza spezzare `highlight-95`.
- **Togliere gli orfani accorcia la somma, non la parete.** Sul 323: 569 → 485 minuti-macchina; sul 318: 559 → 505. Il 314 scende a 107
  guardiani e 480 min grazie alla riga propria di src/16.
- **La regola «più lento → completo» a 15 macchine scatta una volta su 8 (311).** Il trenino da 214 guardiani fa 19 parti, quindi due
  ondate: ~136 min contro ~133 della mappa intera. Il margine è di 3 minuti, quindi scatta per il taglio in parti, non per un vero
  guadagno di tempo. Per il 311 si gira la mappa intera (1.965 contro ~1.430 minuti-macchina del trenino). Con la mappa del 328 lo
  stesso vagone restava trenino (256 guardiani · 21 parti · ~131): anche qui è un effetto di taglio. Non ho toccato la regola, perché il PO
  ha chiesto di tenerla. Dubbio 2.
- **320 torna trenino:** le sonde neutre lo tolgono dal completo; con 15 macchine il trenino da 209 guardiani non è più lento.

## Prove (in questa sessione)

| guardiano | verde | rosso |
|---|---|---|
| `npm run mappa-unica` | ✅ | ✅ «rosso con la mappa vecchia» (braccio interno) |
| `npm run trenino-317` | ✅ (sezione E: 12 controlli) | `CPM_NO_G317=1` → 12 falliti, uscita 1 · `CPM_NO_G328=1` → 6 falliti, uscita 1 · **nuovo `CPM_NO_G329=1`** (mappa del commit finale del 328, copia ferma `fixtures/ci-runner-giro328-orfani.mjs.txt`) → 1 fallito, uscita 1 |
| `npm run deploy-326` | ✅ «una corsa del treno alla volta: 15 + deploy = 16 ≤ 20» | `CPM_NO_G326=1` → 13 falliti · col gruppo per ramo rimesso nel workflow (prova a mano, poi ripristinato) → «31 ≤ 20» rosso · braccio interno sempre giocato: gruppo per ramo con 15/15 = 31 |
| `npm run rilascio-312` | ✅ | `CPM_NO_G312=1` → 4 falliti, uscita 1 |

Cosa controlla di nuovo la sezione E di `trenino-317`:
- ogni guardiano delle catene sta in una riga oppure è dichiarato solo notturno;
- i 50 solo notturni non stanno in nessuna riga e stanno tutti in `CATENE`;
- la regola «più lento» ricalcolata: src/19 (193 guardiani) farebbe ~275 min su 4 macchine contro ~140 della mappa, ~70 su 15, quindi
  resta trenino. I numeri escono con durate finte di 300 s per guardiano;
- i tetti del confronto sono 15/15.

`deploy-326` sezione C ora calcola il caso peggiore dalla concorrenza del workflow. Gruppo fisso senza annullare: `max(tetti) + 1`.
Altrimenti: `grande + trenino + 1`.

Nota d'ambiente, come nel 328: sul clone della sessione `trenino-317` cadeva perché mancavano i riferimenti `origin/poc/…`, `origin/main`
e `origin/lavoro/200|201`. Dopo il `git fetch` di quei rami è verde.

**Non provato su Actions.** Né la concorrenza unica né il tetto 15 hanno ancora girato su una corsa vera. Il primo trenino dopo l'unione
lo dirà: «al massimo 15 alla volta» nel riepilogo del piano, e una seconda corsa «Pending» invece che in parallelo.

## Dubbi per il PO

1. **Il treno grande in attesa può saltare** (limite di GitHub, vedi sopra). Succede solo se, mentre gira una corsa, arrivano altre due
   corse: il treno grande in attesa e un push. Se il PO preferisce un'altra protezione per la notte, le strade che conosco sono due.
   (a) Gruppo separato per la notte con tetto combinato: per esempio notte 15 e trenino 4 di giorno, cioè tornare indietro. (b) Il
   piano del treno grande che controlla da sé se c'è già una corsa e si rilancia dopo; è codice in più, da scrivere e provare.
2. **La regola «più lento → completo» a 15 contro 15 decide su pochi minuti** (311: 136 contro 133) e raddoppia quasi le macchine. Si
   potrebbe chiedere un margine, per esempio «completo solo se il trenino è più lento di almeno il 10%». È una soglia nuova: la lascio
   decidere al PO.
3. **I 4 guardiani della catena `carriera`** sono fra i 50 tolti. La decisione diceva «46», ma il dubbio 2 del 328 parlava di 46+4
   insieme. Se andavano lasciati nelle righe, basta rimetterli: sono 4 nomi in `SOLO_NOTTE_329`.
