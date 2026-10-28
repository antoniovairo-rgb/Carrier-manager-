# Rapporto giro 96a — scena 3D degli highlight (collaudo grafico PO-299, build 7.999.178)

Ramo `sviluppo/giro96a-scena3d` (da `sviluppo/giro95-highlight`). Toccati **solo** `src/12-three-match-view.jsx` (+ `CARRIER-MANAGER-AV.html`
ricomposto con `node tools/build-src.mjs`) e i test. **Non toccati:** `src/14*`, `src/15-live-match.jsx`, `GAME_VERSION`, `docs/governo/*`,
probabilita' ed esiti del motore (le modifiche sono regia, animazione, corpi, grafica).

Misure: guardiano nuovo **`tests/visual/scena3d-96.mjs`** (`npm run scena3d-96`), highlight veri GLB acceso, pagina nuova ogni 4 scene,
telefono 412×915 (16 scene, 10 famiglie + i 2 rigori del catalogo gi5/gi58), PC 1440×900 (9), tablet 820×1180 (3) e 1180×820 (3), ingresso
in campo dal salvataggio `fixtures/save-190-s12-ovr93.json` su telefono e PC. Ogni fotogramma legge il testimone di sola prova
**`__CPM_G96`** (src/12): piedi E testa dell'eroe, pallone, quota di prato, quota sopra l'orizzonte, corpi DISEGNATI (radici GLB visibili),
rettangolo a schermo di ogni targhetta, portiere col suo gesto, scrittore del pallone del fotogramma. Interruttori rossi
`__CPM_NO_G96D2/D3/D4/D5/D8/D10/D11/D13` (`CPM_G96_ROSSO=tutti` li accende tutti).

## Esito per punto — misura prima → causa → correzione → misura dopo

| Punto | Prima (base 178 / rosso) | Causa misurata | Correzione | Dopo |
|---|---|---|---|---|
| **D2** eroe fuori quadro sui formati larghi | PC gi18 0,054 · gi31 0,09 · gi15 0,18-0,22 · tablet orizz. gi15 0,23 (rosso: PC gi18 0,42, gi31 0,38, tablet orizz. gi18 0,37) | la regia (otto passate, reti post-lerp) ragiona sul quadro verticale e spegne le reti sull'eroe quando il soggetto passa al pallone; nel quadro largo l'eroe resta sul bordo basso | **«quadro dell'eroe» sul fotogramma disegnato**: prima di `renderer.render` si ruota la camera (giro attorno alla verticale del mondo + inclinazione) quanto basta per tenere piedi E testa dell'eroe dentro il quadro (rampa morbida 76%→90% del semiquadro), e si toglie all'inizio del fotogramma dopo: nessuna memoria, nessuna retroazione sulla regia (vedi «Perche' cosi'») | **0** in tutte le 31 scene, tutti i formati |
| **D3** punizioni/cross: camera sul vuoto, esito non visto | telefono gi15 eroe fuori 0,47-0,59 e pallone fuori a fine scena 1,0; gi64 0,95; tablet vert. gi15 0,50 | gi15 «Giocata corta»: eroe a (23,28), pallone in porta a (39,4), 29u; camera di lato a 12u (pallone a ndc x -3..-5), poi vaga (x 11→0,4→13 in 3 s). Di lato, in un quadro verticale, i due non ci stanno con nessuna ottica | (a) **inquadratura a due** sull'esito: quando il pallone si allontana dall'eroe oltre 10u (peso che sale fra 10 e 16u, niente salti), il bersaglio della camera scivola 13,5u dietro l'eroe sulla linea pallone→eroe, 5u in alto, sguardo a meta' strada — eroe e pallone allineati con lo sguardo; esclusi gli highlight difensivi; (b) nel «quadro dell'eroe» il pallone d'esito entra con l'ottica che si apre fino a un tetto (62° verticale / 56° nei formati larghi) | eroe fuori **0**, pallone fuori a fine scena **0** su gi15 (parata e gol), gi64, gi16, gi89 |
| **D4** rigore: portiere a terra col pallone al piede | gi5: `gk_block` armato a 1,66 s di scena, portiere sul palo (z 2,77) a 2,11, pallone che parte a 2,23 → **13 fotogrammi** di tuffo prima del tiro, 2,77u (gi58: 13, 0,66u) | l'arco del rigore nasce con `ballArcT` negativo (rincorsa + caricamento) e il gesto del portiere avanzava dall'armo, non dal calcio | sui piazzati (rigore, punizione) il tempo dell'azione del portiere resta fermo e la clip non si monta finche' l'arco e' nella rincorsa (`sr.current._pk96`, sullo stesso punto unico del tempo di reazione 7.800) | 1-2 fotogrammi (quello del contatto, ≤0,58u), **tuffo in volo 14-43 fotogrammi**; verificato su gi5 e gi58 (i soli 2 rigori del catalogo), parata e gol |
| **D5** compenetrazioni | rosso: gi128 38 fotogrammi <0,45u, gi16 5, gi58 7, gi63 4, PC gi100 8, tablet gi64 8; aperture gi31 0,22u ×6 | le reti di separazione dell'AI off-ball lavorano sulle posizioni logiche e si spengono nei gesti e nei congelamenti di lettura | nei soli highlight, sui corpi disegnati, ogni coppia piu' vicina di 0,62u si allarga sulla congiungente (l'eroe non si muove mai), partendo sempre dalla posizione logica: vale per il fotogramma, non si accumula | **0 fotogrammi <0,45u**, minimo 0,61u, aperture comprese |
| **D8** camera alta/larga, figurina | sopra l'orizzonte 0,27-0,42 del quadro (90° percentile); prato mediano 0,50-0,54; rosso gi64 eroe 0,051 a fine scena | nessun vincolo sull'orizzonte; sull'esito la camera si allontana | nel «quadro dell'eroe»: inclinazione in giu' fino a non piu' del 15% sopra l'orizzonte (mai oltre cio' che tiene dentro eroe, pallone d'esito e la porta gia' inquadrata); sull'esito un eroe sotto il 7% dell'altezza si avvicina stringendo l'ottica, mai oltre cio' che tiene dentro pallone ed eroe | sopra l'orizzonte **0,15**; prato mediano tel 0,667 · PC 0,674 · tablet 0,743 / 0,729; eroe a fine scena ≥0,07 |
| **D10** targhette | taglia max/min fino a 7,2x (gi5), 8,5x (gi58); sovrapposte fino a 74 fotogrammi (gi128) | targhette oggetti di scena a misura fissa (2,1×0,39u): in prospettiva crescono in primo piano | stessa altezza a schermo (2,8% del quadro, 20-28 px; eroe +12%), sopra il corpo disegnato, collocate in ordine (eroe, poi dal piu' vicino al pallone), un gradino in su se urtano, altrimenti non disegnate in quel fotogramma; fuori dal bordo non disegnate (l'eroe sempre) | **1,12x** (eroe/altre), **0** sovrapposizioni |
| **D11** salti del pallone | gi16 cross 2, gi16 intercetto 2, gi100 1-2 (3,0-3,6u in 0,05 s) | tutti dello scrittore `buildup-volo`, sul ritorno dell'uno-due verso l'eroe: il piano percorre 10-11u in ~0,2 s, 60-72 u/s di punta | sui beat di volo (non conduzione) il pallone insegue il punto del piano a non piu' di 48 u/s | **0** |
| **D13** logo del cerchio capovolto all'ingresso | letture dritte 0,40 (tel, PC, tablet v.) - 0,53 (tablet o.) | tappeto fisso con l'alto verso -z, camera d'ingresso che gira attorno al centrocampo | l'alto del logo punta lontano dalla camera; all'accensione si allinea, poi la segue a ≤~50°/s (niente tappeto che «gira» a vista) | **0,93** |
| **D9** «GOOOOL!» illeggibile | — | **non e' nella scena 3D**: e' il sovrimpresso DOM `goalCinema` di `src/15-live-match.jsx:11216-11217` (colore del club, corsivo, alone dello stesso colore) | **punto aperto** (file del giro 96b) | — |

## Perche' cosi' (la scelta che regge tutto)

La camera degli highlight ha una storia lunga di reti correttive a valle che, rimisurando cio' che avevano gia' corretto, producevano il
dondolio dello sguardo (codice 007, note 7.544/7.598/7.671/7.702 nel file). Il «quadro dell'eroe» NON e' una rete in piu': la regia resta
identica, la correzione si applica al solo fotogramma disegnato e si toglie all'inizio del successivo (riga dopo `requestAnimationFrame`).
E' una funzione continua dello stato del fotogramma, senza memoria. Unica eccezione voluta: l'inquadratura a due di D3 e' un bersaglio
della regia (prima dei lerp, come la taglia F6), perche' lo spostamento della camera non puo' essere istantaneo.

## Guardiani

- `scena3d-96`: verde (telefono 16/16, PC 9/9, tablet 6/6, ingresso tel+PC) e **rosso con gli interruttori**: `CPM_G96_ROSSO=tutti` → visti
  D2, D3, D4, D5, D8, D10, D11, D13 (tel 18 rossi, PC/tablet idem). Aggiunto a `ci-runner.mjs` (catene carriera e completa, MAPPA di src/12,
  fra i lenti) e a `package.json`.
- Esistenti: vedi tabella in fondo (eseguiti uno alla volta).

## Punti aperti (scelta prudente, nessuna decisione presa al posto del PO)

1. **D9** — il «GOOOOL!» e' DOM in `src/15` (fuori dal mio perimetro). Proposta per il 96b: testo bianco con contorno scuro e ombra nera
   (non nel colore del club), niente corsivo, eventuale pillola scura dietro; resta centrato nel quadro 3D.
2. **Taglia nell'inquadratura a due (D3)**: l'eroe sta al 16% dell'altezza (la regia normale chiede 0,12 dopo il collaudo PO 7.713).
   Scelta prudente: 13,5u dietro l'eroe (a 11u era 0,18). Da confermare sul telefono.
3. **Il pannello di scelta/esito copre il fondo del quadro** (D6, src/15): le quote «prato/orizzonte» sono calcolate sul quadro intero;
   la parte visibile sopra il pannello mostra ancora molta tribuna nella fase di scelta. Non misurato qui.
4. **Camera troppo vicina** in qualche contrasto (gi31: eroe e indicatore giganti in primo piano a fine scivolata): non era fra i punti,
   annotato.
5. Il tempo-scena headless e' 1/10-1/30 del reale: la morbidezza dell'inquadratura a due e dell'orientamento del logo va vista sul
   dispositivo.
