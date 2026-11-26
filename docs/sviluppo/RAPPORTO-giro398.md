# Rapporto giro 398 — `pelle-240` instabile due volte (PO-538)

Base: `lavoro/201` = `5ec4ea0` (7.999.216). Ramo: `sviluppo/giro398-pelle`. `GAME_VERSION` e `docs/governo` non toccati.
Banco: sessione cloud 4 cpu, 15 GB, `CPM_CHROME=/opt/pw-browsers/chromium`, corpi GLB accesi (come vuole il guardiano), ora
congelata `night` (il guardiano la forza da sempre con `window.__CPM_TOD`: l'ora del giorno NON era la causa).

## In una riga

**Non c'è più niente da riparare: l'instabilità di PO-538 era dello strumento ed è stata chiusa dal giro 331** (riquadro del viso
largo, raggio 0,18 al posto di 0,05). Tutte le bocciature registrate sono precedenti a quella correzione; dopo, il guardiano è verde
su ogni corsa misurata (banco e treno) e il rosso `__CPM_NO_G240` vede ancora il difetto. **Nessun file di gioco né del guardiano
toccato**: il giro consegna solo questo rapporto. Resta aperta una voce di governo che non posso toccare (vedi «Dubbi», 1).

## Dove oscillava e perché (misurato)

Le bocciature di PO-538 sono **tutte nella serata di presentazione** e **tutte prima del giro 331** (7.999.205, 23/11 01:08):

| dove | quando | misura |
|---|---|---|
| ramo del giro 276 | 19/11 | serata, «Gary Howard» 12,4 su soglia 12 (rosso 2/2) |
| giro 285 | 20/11 | serata 12,2 · 9,4 · 7,4 sullo stesso build |
| verifica 204 | 22/11 | serata, un viso fra 6 e 17,7 fra due corse sullo stesso commit |
| treni 45050383306 / 45066026690 | 22/11 | «Rupert Hammond … → 12,3» |

Causa (giro 331, ri-misurata qui): il riquadro del viso del testimone `misuraPelle240` era piccolo e cadeva ora sulle labbra ora sulla
guancia mentre le teste della serata si muovono (saluto); il guardiano prende la migliore di otto passate, e per chi stava quasi
sempre «sulle labbra» il minimo usciva sopra o sotto 12 a caso. Non è il gioco (pelle e capelli giusti), non è l'ora (congelata), non
è la pagina stanca (ogni scena ha la sua pagina nuova), non sono le luci (intensità costanti nella serata, giro 331).

**Prova prima/dopo sullo stesso commit, stessa corsa** (`CPM_SOLO=verde CPM_SCENE=serata,parata CPM_PASSATE_TUTTE=1`: otto
passate per scena, nessuna uscita anticipata; distanza CIE76 di ogni passata dalla figurina, minimo–massimo per viso):

| viso | riquadro di prima (raggio 0,05) | riquadro attuale (0,18) |
|---|---|---|
| serata · Dylan Gray | 5,0 – **25,9** | 5,3 – 6,1 |
| serata · Rupert Hammond | 4,7 – **16,6** | 6,1 – 7,5 |
| serata · Max Stanley | 3,1 – **18,4** | 3,6 – 4,4 |
| serata · Isaac Hughes | 2,9 – **19,5** | 2,8 – 4,1 |
| serata · Gary Howard | 3,4 – **20,8** | 6,0 – 8,4 |
| serata · eroe | 2,3 – **22,0** | 7,3 – 8,6 |
| parata · 8 corpi | 0,4 – 5,8 | 5,4 – 10,6 (escursione per viso ≤ 1,7) |

Col riquadro di prima ogni viso della serata attraversa la soglia 12 fra una passata e l'altra (= l'instabilità vista due volte);
con quello attuale l'escursione per viso è al massimo 2,4 e il più lontano sta a 8,6, cioè 3,4 sotto la soglia.

## Verde stabile e rosso che vede ancora (N corse dichiarate)

Comando intero `node pelle-240.mjs` (verde + rosso), build `5ec4ea0`:

| corsa | condizioni | esito | serata massima | parata massima | rosso (mediane ingresso · gioco · premiazione · festa · parata) |
|---|---|---|---|---|---|
| 1 | da sola | ✅ | 8,1 | 10,6 | 27,5 · 22,7 · 27,4 · 22,3 · 35,4 |
| 2 | **due corse insieme** (il runner fa girare i passi lenti a coppie) | ✅ | 8,1 | 10,6 | parata 35,6 |
| 3 | **due corse insieme** | ✅ | 8,1 | 10,6 | parata 35,6 |
| treno 45787013506 (runner GitHub, parte 20, 7.999.216) | runner conteso | ✅ (336 s), «noto tornato verde» | — | — | — |
| 4 · `node ci-runner.mjs giro pelle-240` | dentro il giro (sentinelle dopo) | ✅ (294 s) | 7,9 | 10,6 | 27,5 · 22 · 24,9 · 22,4 · 35,6 |

Nel braccio rosso (`__CPM_NO_G240`) il difetto si vede in tutte le scene giudicate: capelli sbagliati 3-14 per scena e visi a
22-47 dalla figurina. Soglia (12), quota (0,75) e criterio invariati.

**Giro del runner** (`node ci-runner.mjs giro pelle-240`, il programma si dichiara 7.999.215 = `GAME_VERSION` del file sulla base):
**18/18 verdi**, nessun passo instabile, nessuna riprova — `pelle-240` 294 s · `mappa-unica` · `test:logic` · `save-compat` ·
`replay` · `migrazione-194` · `design-system` · `tema-unico` · `griglia-mobile` 180 s · `render-3d-023` · `tunnel-285` 172 s ·
`home-298` · `web-237` · `career-critical` 344 s · `battito-264` 384 s · `partita-vera` 673 s · `gk-dive-sync` · `schermate-97`.

Totale dichiarato: **5 corse verdi su 5** (4 sul banco, di cui 2 a coppie sotto carico, + il treno 45787013506), **rosso visto
5 volte su 5**. Massima della serata in tutte: 7,9-8,1; della parata: 10,6.

## File toccati

- `docs/sviluppo/RAPPORTO-giro398.md` (questo). Nient'altro: nessun file di gioco, nessun guardiano, nessuna soglia, `GAME_VERSION`
  e `docs/governo` intatti. Nessun rosso `__CPM_NO_G398`: non c'è un difetto del gioco da spegnere.
- `docs/governo/STABILITA.json` è stato riscritto da `ci-runner.mjs` durante il giro e **ripristinato** prima del commit (regola del
  giro: non toccare `docs/governo`); la riga del giro è riportata sopra.

## Dubbi per il PO

**Dubbio 1 — la voce `pelle-240` in `ROSSI-DICHIARATI.json` è vecchia.** Il giro 331 l'aveva tolta (commit `91615ae`); il giro 344
(`7924506`, 23/11 11:59) l'ha rimessa con il testo di prima («verifica 204, 22/11 … la misura va resa stabile»), che descrive la
misura col riquadro piccolo. Dal giro 331 in poi non risulta una bocciatura. Opzioni:
1. *(consigliata, applicata per la parte che mi spetta: nessuna modifica al guardiano)* Togliere `pelle-240` da `ROSSI-DICHIARATI`
   e chiudere PO-538 come «fatto nel giro 331, verificato nel giro 398» — lo fa chi può scrivere `docs/governo`. Finché resta
   dichiarato, un suo rosso vero verrebbe letto come «noto» e non fermerebbe il rilascio.
2. Lasciarlo dichiarato ancora per qualche treno grande e toglierlo dopo tre notti verdi di fila.
3. Lasciarlo dichiarato indefinitamente: sconsigliata, nasconde un eventuale ritorno del difetto.

**Dubbio 2 — la parata sta a 10,6 su soglia 12 (margine 1,4).** È ripetibile al decimale (10,6 in tutte le corse di questo giro e del
giro 331), quindi non è instabile; ma è il punto più vicino alla soglia. Opzioni:
1. *(consigliata, applicata: lasciarla così)* Il numero non si muove; un cambiamento vero delle luci della parata lo farebbe saltare,
   ed è giusto che salti.
2. Ritarare `RESA240.parata` (src/16) con la misura del riquadro largo, in un giro breve dedicato: è un ritocco del gioco (colore
   reso dei visi nella parata) e va collaudato a occhio.
3. Abbassare il riquadro per la sola parata: sconsigliata, due misure diverse nello stesso guardiano.

**Dubbio 3 — far dichiarare allo strumento la propria stabilità.** Oggi il guardiano esce alla prima passata già verde, quindi non
misura quanto oscilla ogni viso; l'oscillazione si vede solo con `CPM_PASSATE_TUTTE=1`. Opzioni:
1. *(consigliata, applicata: nessuna modifica)* Lasciarlo com'è: il ritorno del difetto (riquadro piccolo o testimone che si sposta)
   farebbe comunque superare 12 a qualche viso della serata, come nei giri 276-285, e la misura sopra è ripetibile con un comando.
2. Aggiungere al guardiano un controllo «escursione per viso fra le passate ≤ 4» sulle scene ferme, a passate tutte: più robusto, ma
   allunga ogni corsa di ~1-2 minuti e chiede una taratura propria.
3. Una sonda a parte che lo misura solo di notte nel treno grande.
