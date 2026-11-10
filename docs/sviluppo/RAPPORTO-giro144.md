# Giro 144 — Il chiamato saluta (PO-347) · marchio della sala stampa (PO-346)

Ramo `sviluppo/giro144-saluto-marchio` (da `sviluppo/giro142-presentazione`). `GAME_VERSION` non toccata, nessun campo nuovo nel
salvataggio. Sorgente modificato: solo `src/16-scene-3d-cerimonie.jsx` (poi `tools/build-src.mjs` + `tools/check-src.mjs`).

## 1. PO-347 «Sì, saluta»

**Clip di saluto fra gli asset: nessuna.** Controllati i nomi delle animazioni dentro `cgtrader-clip-mixamo.glb` (54 clip mx-*, tutte di
gioco o di portiere), `cgtrader-clip-po.glb` (defend-ready, disappunto, fist-pump, ruleta, victory, victory-jump), `cgtrader-clip-po2.glb`,
i `cgtrader-review-*` (le clip di locomozione/gesto di gioco) e `korward-regular-anims/`. Quindi il gesto è procedurale sulle ossa, come
dice la decisione.

**Misura prima** (GLB acceso, `tests/visual/saluto-144-misura.mjs`, salvataggio di prova con 8 beat e 7 corpi):

| grandezza | prima | dopo |
|---|---|---|
| mano destra rispetto alla spalla, chiamato (beat 3) | −0,38…−0,40 m per tutto il beat (mai alzata) | culmine +0,42…+0,49 m |
| tempo di scena con la mano sopra la spalla (+0,15 m) | 0 s | 2,6 s (compagno 2,62 · eroe 2,67) |
| palmo verso la tribuna (coseno normale-palmo · sguardo) | −0,28 | 0,97 al culmine |
| chi avanza all'ultimo beat («…e il vostro numero 9») | il corpo #5, un compagno (l'eroe è il #6) | l'eroe #6 |
| dopo il saluto | resta avanti per tutto il beat | riabbassa la mano e torna in fila (scarto dalla fila ≤ 0,4) |

La seconda riga della tabella è un difetto trovato misurando: col calcolo `b-2` l'ultimo beat inquadrava il clone N-2, quindi l'eroe
non veniva mai chiamato e al suo posto faceva il passo un compagno. Per fare valere il saluto «anche per l'eroe chiamato» (decisione del
PO), l'ultimo beat ora chiama l'indice dell'eroe.

**Cosa cambia** (`src/16`):
- `_saluto144(av)`, creata da `_posa142` sullo stesso corpo. Tutto in spazio mondo, letto dal corpo: l'omero va su, di lato e un po' in
  avanti; l'avambraccio sta quasi verticale e ondeggia di lato; il palmo gira verso la tribuna intorno all'asse dell'avambraccio (metà
  della torsione all'osso `lowerarm_twist_01_r`, tutta alla mano); le dita vanno verso la posa di legame dello scheletro (ricavata dalle
  matrici inverse), perché nella clip `idle` sono piegate e la prima stesura mostrava un pugno alzato. Le ossa toccate ripartono dalla
  loro base a ogni fotogramma (nessun accumulo). Nessun `Math.random`.
- Nel tick di `PresentationStage3D`: un orologio del chiamato sullo stesso `dt` del passo — passo 0–0,9 s, mano su 0,9–1,4, saluto fino a
  3,6, mano giù 3,6–4,1, poi torna in fila. La camera segue la z del chiamato (prima puntava sempre sulla posizione avanzata).
- Rosso `__CPM_NO_G144S`: niente saluto, niente ritorno in fila, ultimo beat col vecchio indice.

## 2. PO-346 «Sì, nella 189»

| dove | prima (letto dal DOM) | dopo |
|---|---|---|
| piastrelle del pannello (`src/16` r.~277) | «K rward Elite» ×6 (K + cerchietto + rward in un flex con spazio 2 px) | «Korward Elite» ×6: testo unico, la «o» è una lettera vera disegnata come anello (stesso stile della striscia del giro 142b) |
| tovaglia (`TavoloStampa24`, SVG) | «K●rward Elite» (il simbolo «●» col contorno, sporgente sopra la riga) | «Korward Elite»: la «o» è la lettera vera, che a peso 900 è già un anello pieno della sua altezza |

Il pallone del titolo iniziale (`src/17`, «K⚽rward») non è toccato, come deciso. Rosso `__CPM_NO_G144M`. Gli attributi
`data-cpm="marchio144p"` / `"marchio144t"` stanno su elementi presenti in **entrambi** i bracci, così il rosso cade per il contenuto e non
per un elemento che manca.

## Guardiano `npm run presentazione-142` (esteso)
Oltre ai cinque punti del giro 142: saluto del compagno (beat 3) e dell'eroe (ultimo beat) — mano sopra la spalla di 0,15 m per almeno
1,5 s di tempo di scena, palmo ≥ 0,7 al culmine, poi mano sotto la spalla di 0,25 m e corpo di nuovo in fila; all'ultimo beat deve
avanzare l'eroe; sala stampa: piastrelle e tovaglia lette dal DOM uguali a «Korward Elite». Campioni insufficienti o scena sotto 5,5 s =
«non giudicato» = rosso. Soglie fissate dopo la misura.

Esito (stampato per ultimo dal guardiano):
- **verde**: saluto compagno 2,62 s · picco +0,415 m · palmo 0,97 · torna in fila; eroe 2,67 s · +0,434 m · 0,97 · in fila; sala stampa
  «Korward Elite» su piastrelle e tovaglia; i cinque punti del 142 verdi (aspetti 6/7, testa max 8,8°, piedi 0 fuori, fermo max 0,39 s).
- **rosso** (`__CPM_NO_G142` + `__CPM_NO_G142M` + `__CPM_NO_G144S` + `__CPM_NO_G144M`): cade su tutto — mano mai sopra la spalla (picco −0,40 m),
  non torna in fila, all'ultimo beat avanza il #5 e non l'eroe #6, sala stampa «K rward Elite» / «K●rward Elite», più i cinque punti del 142.

Sonde nuove (non guardiani): `saluto-144-misura.mjs` (campionamento), `saluto-144-foto.mjs` (foto a metà saluto e dopo il ritorno in
fila), `stampa-144-foto.mjs` (foto e lettura DOM della sala stampa).

## Foto prima/dopo (`docs/sviluppo/giro144/`, GLB acceso)
- `prima-360x800-beat3.png`, `prima-1440x900-beat3.png` — il chiamato col braccio giù; `prima-360x800-beat7.png` — ultimo beat, avanti un compagno.
- `dopo-360x800-beat3-saluto.png`, `dopo-1440x900-beat3-saluto.png` — il saluto; `dopo-*-beat3-fila.png` — di nuovo in fila;
  `dopo-*-beat7-saluto.png` — l'eroe che saluta all'ultimo beat.
- `prima-stampa-412x915.png` / `dopo-stampa-412x915.png` — piastrelle e tovaglia.

## Catena (un controllo alla volta, `free -m`/`df -h` prima di ognuno)
| controllo | esito |
|---|---|
| presentazione-142 (esteso) | verde, il rosso cade |
| intro-118 | verde |
| intervista (sala stampa 2D) | verde |
| leggibile-68 (testi del pannello, marchi dietro i microfoni) | verde, rosso riprodotto |
| scena3d-96 tel / pc / tabv / tabo | verde 16/16 · 9/9 · 3/3 · 3/3 (pc in un gruppo lungo, atteso in primo piano fino alla fine) |
| griglia-mobile | uscita 0; stampa ancora «NON misurato: prepartita: playMatch → nomatch», come nel giro 142 (non toccato da questo giro). Le sue foto in `docs/collaudo-grafico/g0` sono state ripristinate, non committate |
| design-system | verde |
| test:logic | verde (43/43) |
| save-compat | verde 12/12 |
| audit-copyright | verde, 0 riferimenti |

## Limiti dichiarati
- Il saluto è procedurale: tre rotazioni in spazio mondo più l'ondeggio dell'avambraccio, non un movimento catturato. Spalla e busto non
  accompagnano il gesto.
- In headless la scena gira lenta (l'orologio `dt` avanza ~0,3 s per secondo reale): i tempi del gesto (≈ 4 s di scena, ≈ 4 s anche sul
  telefono a fotogrammi pieni) sono misurati sull'orologio di scena, non giudicati a occhio.
- Il ritorno in fila avviene anche se il giocatore non preme «Avanti»: il chiamato resta inquadrato in fila finché il beat non cambia.

## Domande aperte per il PO
1. I tempi del gesto (passo ~0,9 s, saluto ~2,7 s, ritorno in fila dopo ~4 s) vanno bene, o preferisce che il chiamato resti avanti
   fino al beat successivo?
2. Sulla tovaglia la «o» è la lettera vera a peso 900 (un anello pieno), non l'anello sottile disegnato delle piastrelle e della
   striscia: va bene così o vuole lo stesso anello sottile anche lì?
3. Saluta solo il braccio destro, per tutti (anche per i mancini): va bene?
