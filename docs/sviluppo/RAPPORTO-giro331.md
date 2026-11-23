# Rapporto giro 331 — guardiani 3D instabili (PO-610, PO-620)

Base: `lavoro/201` = `55a500d5` (7.999.205). Ramo: `sviluppo/giro331-instabili-3d`. `GAME_VERSION` non toccata.
Banco: sessione cloud 4 cpu, `CPM_CHROME=/opt/pw-browsers/chromium`, corpi GLB accesi dove il guardiano li prevede.
I numeri dei treni vengono dai log di GitHub Actions (corse 44947424529, 45010544455, 44992349900, 45050383306, 45066026690).

## Esito in una tabella

| guardiano | che cos'era | prima | dopo | 5 corse di fila | braccio rosso | ROSSI-DICHIARATI |
|---|---|---|---|---|---|---|
| `pelle-240` | strumento | serata: lo stesso viso fra 2,4 e 27 fra due passate; nel treno 12,3 su soglia 12 | serata massima 8,3-8,5 | **5 verdi su 5** | rosso 5 su 5 | **tolto** |
| `walkout-fermi-197` | strumento | verde «somma» 6 sul banco, 8 nel treno, soglia 7 | verde somma 4,3 (limite 6,2), identico al decimale | **5 verdi su 5** | rosso 5 su 5 (somma 18,6) | resta, in attesa del dubbio 2 |
| `scene-178` | **difetto vero del gioco** | rosso 3 su 3 anche sulla base (4 fotogrammi con l'eroe fuori dal quadro) | corretto in `src/19` (rosso `__CPM_NO_G331`) | vedi sotto | due bracci rossi | non c'era |
| `movimento-147` | strumento **e** difetto vero | rosso per cecità (28-77 campioni su 100) | strumento riparato; a velocità reale il verde sta a 25-32% su tetto 25 | **0 verdi su 5**: non è stabile-verde, è rosso vero | rosso sempre evidente (86-94%) | resta, con il motivo nuovo (dubbio 1) |

## pelle-240 — il riquadro cadeva sulle labbra

**Causa (misurata).** Il testimone `misuraPelle240` fa un primo piano di ogni viso e legge la mediana dei pixel di pelle in un
riquadro al centro, di lato 10% dell'altezza. Il primo piano punta 7 cm sopra l'osso della testa, cioè alla **bocca**. Nella serata
le teste si muovono (saluto): il riquadro cade ora sulle labbra (eroe: 194,110,93) ora sulla guancia (224,170,141).
Sonda `tests/visual/misura-331-pelle.mjs`, 8 passate per viso, tre corse sullo stesso commit: ogni viso alterna due valori, per
esempio l'eroe 19,8 · 2,4 · 16,1 · 2,9 · 15,6 · 2,4 · 27,1 · 26,8 e «Rupert Hammond» 14,7 · 16,3 · 12,3 · 17,2 · 10,3 · 16,6 · 5,1 · 16,0.
Il guardiano prendeva la passata migliore di otto: per chi sta quasi sempre «sulle labbra» il minimo usciva sopra o sotto 12 a caso
(nei treni 45050383306 e 45066026690: «Rupert Hammond … → 12.3»). Le luci non c'entrano: nella serata le intensità misurate sono
costanti (4 fari 1,4 · 4 punti 0,5 · ambiente 0,3 · sole 0,34 · emisfero 0,22) e non ci sono fuochi durante la misura. L'ipotesi
«fuochi e flash» scritta nel guardiano non è confermata dalla misura.

**Correzione (solo strumento).** Il testimone accetta `W.raggio` (frazione dell'altezza; senza, il 5% di prima). Il guardiano chiede
0,18: riquadro di lato 36%, la mediana è della pelle del viso. Soglia (12) e criterio («ogni corpo entro la soglia» nelle scene
ferme, mediana e quota nelle scene in movimento) invariati. `CPM_RAGGIO=0.05` rifà la misura di prima.

**Prima / dopo, stessa scena, 8 passate:** col riquadro di prima lo stesso viso varia fino a 25 punti; col riquadro largo varia di
1-2 su 255 per canale (eroe 215-217, 151-154, 122-126). Distanze della serata col riquadro largo: 3,4 · 3,6 · 6,3 · 6,7 · 7,8 · 8,4.

**5 corse di fila (comando npm, verde + rosso):** 5 verdi su 5; la prima girava insieme a un'altra sonda (sotto carico).

| scena | massima nelle 5 corse (verde) | prima passata = migliore? | braccio rosso (mediana) |
|---|---|---|---|
| ingresso | 6,8 · 6,8 · 6,8 · 6,8 · 6,8 | sì | 26,7-27,5 |
| gioco | 5,8-6,3 | sì | 22,7-23 |
| premiazione | 5,6-9,9 | sì | 25,6-26,1 |
| festa | 6,1-8,9 | sì | 21,3-22,5 |
| serata | 8,4 · 8,3 · 8,5 · 8,3 · 8,4 | sì | (non si misura: è del giro 225) |
| parata | 10,6 · 10,5 · 10,5 · 10,5 · 10,5 | sì | 35,4-35,8 |

Effetto collaterale utile: in premiazione e gioco l'eroe stava a 14-17,7 (riga fra parentesi nei treni); ora 5,6-9,9.
Da tenere d'occhio: la **parata** passa da 5,1 a 10,5 (ripetibile al decimale, ma a 1,5 dalla soglia): le compensazioni della parata
(`RESA240.parata`) furono tarate col riquadro piccolo. Non l'ho ritarata: è una modifica del gioco, non dello strumento.

## walkout-fermi-197 — contava la fase del campionamento

**Causa (misurata).** Il guardiano contava i corpi che «corrono da fermi» in un campione ogni 0,5 s di scena. Col registratore
fotogramma per fotogramma (320 fotogrammi di ingresso) nel braccio verde non ci sono «due corpi che corrono da fermi per 1,5 s»:
**ogni corpo corre da fermo per 0,10 s (due fotogrammi) quando arriva al suo posto**, e i 21 arrivi sono sfalsati fra 18,9 e 21,3 s.
Un campione ogni 0,5 s ne pesca 0 o 2 a seconda del fotogramma in cui cade: banco `20:2 20.5:2 21:2` = 6, treno 44992349900
`19.5:2 20:2 20.5:2 21:2` = 8, soglia 7. Nel braccio rosso ogni corpo corre da fermo 0,40-0,50 s.

**Correzione (solo strumento).** Il registratore sta nella pagina (sostituisce il `push` del testimone `__CPM_WALK245`, che il gioco
chiama a ogni fotogramma) e somma per ogni corpo i secondi di scena di corsa da fermo; gli stacchi di montaggio non contano come tempo.
`somma` = secondi-corpo / 0,5 (la grandezza di prima senza la fase). Soglie invariate (`verde ≤ rosso/3`, `rosso ≥ 15`, `picco ≤ 2`).
Il ciclo esterno aspetta la fine della fase d'ingresso (evento); motivo stampato per ultimo.

**5 corse di fila:** 5 verdi su 5, **identiche al decimale** (anche la prima, sotto carico): verde 2,15 s → somma 4,3, picco 1,2;
rosso 9,3 s → somma 18,6, picco 4,4. In headless ogni fotogramma dell'ingresso vale 0,05 s di scena su qualunque macchina, quindi
mi aspetto gli stessi numeri sul runner; **non posso confermarlo** finché un treno non lo gira.

## scene-178 — difetto vero, corretto

**Non è instabile.** Rosso 3 su 3 nel giro 320 e 1 su 1 qui sulla base: `intro tel: S3 4/214 fotogrammi con l'eroe fuori`, sempre i
primi (tempo dell'intro 0,05-0,35 s, 0% delle ossa nel quadro). Non girava in nessun treno: non stava in nessuna riga della mappa.

**Causa.** La camera dell'intro nasce in (0,0,0), cioè a terra a centrocampo, e raggiunge l'orbita d'apertura con lo smorzamento
(costante ~0,2 s). Dal giro 233 l'orologio dell'intro parte coi corpi già pronti: quel volo da terra si vede, con l'eroe alle spalle.

**Correzione nel gioco** (`src/19-app-root.jsx`): al primo fotogramma camera e sguardo si mettono sul bersaglio; lo smorzamento lavora
dal secondo. Rosso `window.__CPM_NO_G331`. È una modifica visibile: l'intro si apre già sull'orbita invece che con mezzo secondo di
volo da terra. Il guardiano ha un terzo braccio (`CPM_ROSSO=331`: deve uscire rosso **solo** per S3) ed è entrato nella riga di
`src/19` della mappa.

**Prima / dopo:** fotogrammi con l'eroe fuori 4/214 e 4/247 → 0/232 e 0/224; col rosso `__CPM_NO_G331` 4/220 e 4/235.

**5 corse di fila** (`npm run scene-178` = verde + rosso 178 + rosso 331): **5 verdi su 5** (~7 minuti l'una); in ognuna il braccio rosso 178 è rosso (21 motivi) e il braccio rosso 331 è rosso solo per S3 (4-5 fotogrammi con l'eroe fuori).

## movimento-147 — strumento riparato, e sotto c'è un rosso vero

**Causa dell'instabilità (misurata).** Tre difetti dello strumento:
1. *Cecità.* Raccoglieva per 150 s di orologio a partita, due partite per braccio, e pretendeva 100 campioni. Nei treni rossi ne
   aveva 77 e 67 (44947424529), 74 e 28 (45010544455); sul banco 55 e 4. Usciva rosso in tutti e due i bracci per mancanza di
   campioni, e con 55-77 campioni la quota del verde ballava fra 12 e 22.
2. *Arrotondamento.* La velocità si calcolava fra due campioni consecutivi (40-150 ms): a 0,5 m/s lo spostamento vale 2-7 cm, meno
   dell'arrotondamento delle posizioni (7-10 cm).
3. *Velocità della macchina.* L'attesa attiva si muove sull'**orologio** (`sin(now·0,0016)`), la velocità si misurava sul **tempo di
   scena**, che in headless scorre a una frazione dell'orologio diversa da macchina a macchina (banco 0,5-0,8). Stesse partite,
   stesso codice: compagni fermi **21% a rapporto 0,5** e **27-30% a rapporto 1**.

**Correzione (solo strumento):** raccolta a evento (una partita alla volta fino al fischio, finché ci sono 180 campioni per parte;
tetto 4 partite; sotto 100 = «non giudicato»), registratore dentro la pagina, velocità su base fissa di 0,3 s di scena, tempo di
scena agganciato all'orologio (`__CPM_DTREAL`, rapporto stampato). Soglie invariate (verde ≤ 25, rosso ≥ 30).

**Che cosa dice lo strumento riparato** (rapporto scena/orologio 1,01-1,05):

| corsa | verde compagni / avversari (campioni) | rosso compagni / avversari | esito |
|---|---|---|---|
| misura (2 partite) | 30,0% / 20,6% (190 / 316) | 85,6% / 81,8% | rosso |
| 1 (3 partite) | 25,1% / 25,1% (275 / 509) | 91,2% / 87,6% | rosso |
| 2 (3 partite) | 31,9% / 27,3% (317 / 604) | 94,2% / 91,1% | rosso |
| catena del giro (seconda prova del runner, 3 partite) | 27,0% / 26,0% (233 / 447) | 92,4% / 90… (riga troncata dal runner) | rosso |

Il braccio verde sta fra 25 e 32% contro il tetto 25: **0 corse verdi su 5** (le quattro della tabella più la prima prova del runner nella catena, anch'essa rossa). Non è rumore: un moto avanti-e-indietro
(1 unità, 1,6 rad/s) passa dallo zero di velocità due volte per giro e sta sotto 0,5 m/s per circa il 22% del tempo per costruzione;
a questo si sommano i corpi tenuti fermi vicino al pallone (giro 286). Il verde di prima (10-12%) veniva dalla macchina lenta, che
gonfiava le velocità. La differenza fra i due bracci resta netta (25-32% contro 86-94%).
Il guardiano resta in `ROSSI-DICHIARATI` col motivo nuovo. Dura ~18 minuti (tre partite per braccio, i due bracci insieme).

## Dubbi per il PO

**Dubbio 1 — movimento-147: a velocità reale i compagni fermi prima dell'azione sono 25-32%, il tetto del guardiano è 25 (la tua
decisione del 06/10 dice «al massimo il 30%»).**
1. *(consigliata)* Cambiare il movimento d'attesa nel gioco: un piccolo giro (ellisse) al posto dell'avanti-e-indietro, così la
   velocità non passa mai dallo zero. Soglie invariate; serve un giro dedicato e il tuo collaudo sul telefono.
2. Portare il tetto del braccio verde a 30, che è il numero della tua decisione (25 era un margine): con le tre misure di oggi
   (compagni 30,0 · 25,1 · 31,9) resterebbe sul filo, quindi da sola non basta.
3. Lasciare il gioco com'è e tenere il guardiano fra i rossi dichiarati.
4. Tornare a misurare sul tempo di scena senza aggancio: verde sul banco (21%), ma il risultato dipende dalla macchina. Sconsigliata.

**Dubbio 2 — walkout-fermi-197: come si legge «al massimo 2 per campione» ora che la misura è su tutti i fotogrammi.**
Ho dovuto scegliere una lettura per far funzionare il guardiano; è provvisoria e il guardiano resta in lista finché non decidi.
1. *(consigliata, applicata)* Media dei corpi che corrono da fermi sulla finestra peggiore di 0,5 s (è il valore atteso del vecchio
   campione): verde 1,2, rosso 4,4, soglia 2.
2. Massimo istantaneo su ogni fotogramma: oggi il verde fa 4 (quattro corpi arrivano nello stesso fotogramma, per due fotogrammi) e
   sarebbe rosso stabile; servirebbe una modifica del gioco.
3. Togliere il picco e giudicare solo la somma.

**Dubbio 3 — pelle-240: la parata sta a 10,5 su soglia 12 con la misura nuova (prima 5,1).**
1. *(consigliata)* Ritarare `RESA240.parata` con la misura nuova in un giro breve dedicato.
2. Lasciarla: è ripetibile al decimale (10,5-10,6 in sei corse), quindi oggi non è instabile.
3. Per la sola parata tornare al riquadro piccolo: sconsigliata, due misure diverse nello stesso guardiano.

## File toccati

- Gioco: `src/19-app-root.jsx` (camera dell'intro, rosso `__CPM_NO_G331`); `src/16-scene-3d-cerimonie.jsx` (solo il testimone
  `misuraPelle240`: `W.raggio`, nessun effetto senza il testimone armato); `CARRIER-MANAGER-AV.html` ricomposto.
- Guardiani: `tests/visual/pelle-240.mjs`, `walkout-fermi-197.mjs`, `scene-178.mjs`, `movimento-147.mjs`, `hl-credibilita.mjs`,
  `hl-credibilita-analisi.mjs` (opzioni spente se non chieste), `package.json` (terzo braccio di scene-178), `ci-runner.mjs`
  (scene-178 nella riga di `src/19`).
- Sonda nuova: `tests/visual/misura-331-pelle.mjs`.
- Governo: `docs/governo/ROSSI-DICHIARATI.json`.

## Catena del giro

`node ci-runner.mjs giro scene-178 pelle-240 walkout-fermi-197 movimento-147` sul commit del ramo: **20 verdi su 21**.
- Guardiani del giro: `scene-178` verde (419 s), `pelle-240` verde (386 s), `walkout-fermi-197` verde (217 s),
  `movimento-147` **rosso** in tutte e due le prove del runner (2220 s in tutto): è il rosso dichiarato sopra.
- Sentinelle, 17 su 17 verdi: mappa-unica, test:logic, save-compat, replay, migrazione-194, design-system, tema-unico,
  griglia-mobile, render-3d-023, tunnel-285, home-298, web-237, career-critical, battito-264, partita-vera, gk-dive-sync, schermate-97.
- `build-src` + `check-src`: il ricomposto è allineato ai frammenti.
- Le foto di `docs/collaudo-grafico/g0` rigenerate da una sentinella sono state rimesse com'erano.

## Che cosa non è stato verificato

- Nessuno dei quattro è stato rigirato sul runner di GitHub: la stabilità è dimostrata sul banco.
- Sul telefono non ho guardato l'apertura dell'intro corretta: la misura è del guardiano (ossa dell'eroe nel quadro).
- `movimento-147` dura 18 minuti a corsa e il runner lo riprova: nella catena pesa 37 minuti finché resta rosso.
- Gli altri guardiani che coprono `src/16` e `src/19` (oltre alle sentinelle) non li ho girati: li gira il treno al push dell'unione.
