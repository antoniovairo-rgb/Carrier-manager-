# Rapporto giro 78 — PO-156 con lo stile unico: ritaratura della leva 4 sul Finalizzatore

**Ramo:** `sviluppo/difficolta-unico-giro78` da `sviluppo/stile-unico-giro75`. **GAME_VERSION** e **SAVE_VERSION** non toccate.
**Decisione che lo richiede:** sessione madre, punto aperto 1 del giro 75, opzione (a): i bersagli della curva A restano, si ritara la
leva 4 del giro 69 (gol per minuti/OVR) sul solo Finalizzatore, dietro il rosso esistente `__CPM_NO_156`.

## 1. Cosa cambia

**`src/10-folla-stadi-ritiro.jsx`, `_pSimStats` (r. 956-973).** Solo nel ramo PO-156 (quota di minuti presente, cioè non sotto
`__CPM_NO_156`) e solo se lo stile passato è `finalizzatore` (letto **prima** della traduzione nell'archetipo `bomber`):
- niente premio d'archetipo da bomber (+0,14) sul λ dei gol;
- sotto i 31 anni la pendenza attorno a OVR 76 è più ripida: +0,05 a punto sopra (tetto +0,35, era +0,03 e +0,3), −0,025 a punto
  sotto (tetto −0,05, prima nessun malus);
- da 31 anni premio da fuoriclasse 0,025 a punto (era 0,03).

Per saperlo la partita simulata espone l'età: `simulateMatch` aggiunge `eta156` al risultato del ramo PO-156 (r. ~945), accanto a
`quota156`/`stato156`/`ovr156`. Assist, voto, minuti, scelta del mister: invariati. Altri stili (il motore li conosce ancora):
invariati.

**`tests/visual/difficolta-156.mjs`.** Un solo stile (Finalizzatore attaccante). Semi 2 → **10** e pagine in parallelo 6 → 8: 40
carriere invece di 24 (motivo al §3). Bersagli, tolleranze, club, regola verde/rosso: invariati.

## 2. Prima / dopo (solo Finalizzatore, voto · gol · vittorie · minuti · titolare)

Tutte le misure con il guardiano a stile unico di questo giro; file in `docs/sviluppo/dati-giro78/`.

| Fase | Bersaglio A | Prima (build giro 75, 24 carr.) | Rosso `__CPM_NO_156` (40) | **Dopo, passata 1** (40) | **Dopo, passata 2** (40) |
|---|---|---|---|---|---|
| Gavetta | 6,0 · 0,15 · 35 · 55' · 45% | 5,94 · 0,149 · 33,3 · 60,1' · 52,3% | 5,97 · **0,306** · 32,8 · **83,7'** · **90,2%** | 5,92 · 0,105 · 33,4 · 60,4' · 51,9% | 5,91 · 0,105 · 32,9 · 60,1' · 51,2% |
| Affermazione | 6,4 · 0,30 · 45 · 75' · 75% | 6,46 · **0,420** · 48,4 · 79,7' · 83,4% | 6,22 · **0,412** · 44,1 · **85,1'** · **92%** | 6,42 · 0,347 · 45,4 · 80,5' · 84,7% | 6,39 · 0,342 · 43,3 · 79,2' · 82,7% |
| Élite | 6,9 · 0,50 · 55 · 85' · 95% | 6,86 · 0,496 · 48,7 · 89,1' · 98,5% | **6,19** · **0,359** · **36,9** · 85,5' · 93,1% | 6,85 · 0,498 · 50,3 · 87,6' · 96,3% | 6,86 · 0,495 · 50,1 · 87,4' · 95,9% |
| Declino | 6,3 · 0,25 · 45 · 65' · 60% | **6,58** · **0,409** · **56,6** · 69' · 65,8% | 6,24 · **0,411** · 43,2 · **88,7'** · **98%** | 6,44 · 0,286 · 49,1 · 62,8' · 57% | 6,39 · 0,253 · 46,5 · 60,5' · 53,5% |
| **Celle** | | **16/20** | **8/20** (12 fuori) | **20/20** | **20/20** |

Verde 2/2 (`difficolta-156-verde-{1,2}`), rosso visto (`difficolta-156-rosso`, almeno 4 fuori: 12). «Prima»:
`difficolta-156-base75` (build del giro 75 rimesso al suo posto il tempo della corsa, guardiano già a stile unico ma a 6 semi).
Zero carriere interrotte, zero `pageerror` in tutte le passate.

**Margini stretti (da sapere):** affermazione·titolare 84,7 contro il limite 85 nella passata 1 (82,7 nella 2); gavetta·gol 0,105
contro il limite basso 0,07; declino·titolare 53,5 contro 50. La titolarità è la leva 1 (scelta del mister), non la 4: non l'ho
toccata (fuori mandato).

## 3. Le prove scartate e il rumore dello strumento

| Prova | Declino da 31 anni | Sotto 31 | Esito (24 carr.) |
|---|---|---|---|
| 1 `prova1-taglio-pieno` | premio fuoriclasse 0 | pendenza 0,03 | 18/20: declino 0,203 gol ma 56,7' · 48,5% titolare |
| 2 `prova2-meta-declino` | 0,015 | 0,03 | 18/20: gavetta tit 55,2 · affermazione tit 86,4 |
| 3 `prova3-pendenza` | 0,015 (come la 2) | 0,05 / −0,025 | 18/20: declino 55,5' · 47,1% |

Due cose misurate:
- **Meno gol → meno minuti.** Togliere tutto il premio al veterano porta i gol in bersaglio ma il mister lo fa giocare meno
  (prova 1 contro base: titolare declino 65,8 → 48,5%). Per questo il premio da 31 anni è ridotto, non azzerato.
- **Il banco a 24 carriere è rumoroso quanto la tolleranza.** Prove 2 e 3 hanno lo **stesso** codice per il declino e danno gol
  0,255 contro 0,200, titolare 57,9 contro 47,1%. Anche la gavetta (codice identico fra prova 1 e 2): titolare 47,1 contro 55,2%, e
  il numero di decisioni campionate per la stessa carriera cambia fra un giro e l'altro (es. seme 6: 45 contro 38). La causa del non
  determinismo **non l'ho indagata: Non posso confermarla.** Passare a 40 carriere riduce il rumore (atteso ~1/√(40/24)), non lo
  toglie: le due passate verdi a 40 differiscono ancora di 3,5 punti sul titolare di declino. Durata a 40 carriere: 505 s a braccio.

## 4. Guardiani (build finale)

| Guardiano | Esito | File |
|---|---|---|
| difficolta-156 verde ×2 | 20/20 · 20/20 | `difficolta-156-verde-{1,2}.{txt,json}` |
| difficolta-156 `--rosso` | rosso visto, 12 fuori | `difficolta-156-rosso.{txt,json}` |
| stili-098 | verde | `stili-098.txt` |
| stili-098-migrazione | verde | `stili-098-migrazione.txt` |
| stile-unico-75 | verde (rosso: 48 violazioni) | `stile-unico-75.txt` |
| save-compat | 12/12 | `save-compat.txt` |
| career-critical (11 passi, spezzato in tre chiamate) | 11/11 exit 0 | `career-critical.txt` |

`node tools/build-src.mjs` + `node tools/check-src.mjs`: identico byte per byte. Chiavi oggetto doppie in `src/10`: **0** (stesso
controllo del giro 75, plugin Babel su ogni `ObjectExpression`).

**Non eseguiti** (fuori dal mandato di questo giro): gate 14/14, catena `mirata`/`notte`. Il ritocco tocca solo la simulazione delle
partite di club dell'eroe nel ramo PO-156, che il gate (situazioni forzate) non esercita.

## 5. Punti aperti

1. Margine affermazione·titolare (84,7/85 in una passata): se la catena lo vede rosso, la leva giusta è la 1 (scelta del mister) per il
   Finalizzatore, non la 4 — decisione della sessione madre.
2. Non determinismo del banco `difficolta-156` (§3): da indagare prima di stringere la tolleranza o ridurre le carriere.
3. Gli stili Regista/Incursore/Trascinatore non sono più misurati da `difficolta-156`; se il motore li riusasse servirebbe un banco a
   parte.
