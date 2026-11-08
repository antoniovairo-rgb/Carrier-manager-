# Giro 125 — PO-328 · «Alcuni highlights sono da distanza troppo importante, in particolare i colpi di testa» — SOLA MISURA

Base: `sviluppo/giro121-angolo` (7.999.184 + rimedi 117A/119P/121H/C/M). Nessuna modifica a `src/`. Branch `collaudo/giro125-distanze`.
Strumenti nuovi (solo `tests/visual`): `distanze-125.mjs` (flusso vero), `distanze-125-testa.mjs` (colpi di testa mirati), `distanze-125-analisi.mjs` (tabelle).
Dati grezzi in `docs/collaudo-grafico/125/dati/`.

## 1. Metodo

- **Testimone**: `__CPM_CONT121` (src/12-three-match-view.jsx:4242) — registra il fotogramma in cui l'arco del colpo PARTE; `gx` = 48,6 − x eroe (distanza dalla linea di porta lungo x), `z` = scostamento laterale, `a` = angolo corpo↔porta. Svuotato a ogni giro di poll (l'anello è a 40 voci). Scena abbinata via `__CPM_CURSIT` (titolo), esito via `__CPM_RES218`.
- **Flusso vero**: partita giocata con `__CPM_AUTOPLAY` politica *casuale seedata*, salvataggi s1/s5/s12 × 8 semi = 24 partite per braccio, GLB spento (`__CPM_GLB=false`).
- **Due bracci**: *acceso* = codice del ramo; *spento* = `__CPM_NO_G117A, _G119P, _G121H, _G121C, _G121M` (= 7.999.185). Stesso nome+seme ⇒ stessa partita di base.
- **Integrazione mirata alle teste** (la politica casuale ne produce pochi): scene angolo/cross costruite dal motore (`scenaDalMotoreCross`, come `angolo-117`), 6 posizioni di partenza (da centrocampo a dentro l'area) × 2 tipi × tutte le azioni di testa (fino a 2), pagina nuova per caso, entrambi i bracci. Non è flusso vero: è la scena vera del motore con occasione forzata.
- **Distanza in metri**: `dCentro = hypot(gx, z) × 1,05 m/u` (eroe↔centro porta; x −50..50 = 105 m, **stima** dichiarata: nel repo il dischetto è 10,5 u = 11 m). `dPorta` (solo x) è nei file `.righe.json`.

### Limiti dichiarati (onestà)
- **GLB acceso: NON eseguito.** La catena GLB è stata interrotta per il tetto di tempo e per lasciare la CPU alle teste mirate. La posizione dell'eroe è logica, non dipende dal modello, ma il campione GLB richiesto manca. Resta da fare.
- **Minuto della scena: non registrato** dalla sonda; le scene si identificano con salvataggio / seme / indice di highlight (`i`) e titolo.
- La politica casuale produce soprattutto tiri e contrasti: i colpi di testa nel flusso vero sono 14 (acceso) e 16 (spento) — pochi per statistiche fini; per questo l'integrazione mirata.
- Rigore (2) e cross (2) hanno campioni minimi. Contrasti/passaggi/dribbling: la distanza dalla porta non è un difetto di per sé (sono gesti di gioco, non conclusioni): riportati per completezza.
- I riferimenti «realistici» sono **stime di conoscenza generale del calcio, NON da una fonte verificata che io abbia consultato**: colpo di testa in area, ≤ 16,5 m (area di rigore), gran parte entro 11 m; tiro da fuori area 18-30 m (oltre 30 m raro); punizione diretta 18-30 m; rigore 11 m. Il PO può sostituirle.

## 2. Risultati del flusso vero (≥150 per braccio: 157 acceso, 151 spento)

Tabella: distanza eroe↔centro porta (m) al contatto. «% oltre» = oltre il riferimento (testa 16,5 m; altri 30 m).

### Rimedi ACCESI (n = 157)
| gesto | n | mediana | p90 | max | % oltre |
|---|---|---|---|---|---|
| tiro (shot) | 75 | 26,9 | 37,7 | 39,3 | 39% (29) |
| contrasto (tackle) | 22 | 41,2 | 54,3 | 62,5 | n/a |
| passaggio (pass) | 20 | 34,7 | 38,4 | 41,6 | n/a |
| **colpo di testa** | 14 | 10,7 | 14,0 | 14,0 | **0%** |
| dribbling | 12 | 38,2 | 39,3 | 39,3 | n/a |
| punizione | 10 | 22,3 | 24,2 | 24,2 | 0% |
| rigore | 2 | 13,6 | 13,6 | 13,6 | 0% |
| cross | 2 | 39,5 | 39,5 | 39,5 | n/a |

### Rimedi SPENTI (= 7.999.185) (n = 151)
| gesto | n | mediana | p90 | max | % oltre |
|---|---|---|---|---|---|
| tiro (shot) | 67 | 29,2 | 38,2 | 39,3 | 45% (30) |
| contrasto | 22 | 41,0 | 54,5 | 62,5 | n/a |
| passaggio | 21 | 34,1 | 38,2 | 41,6 | n/a |
| **colpo di testa** | 16 | **26,1** | **40,8** | **46,2** | **81% (13)** |
| punizione | 12 | 22,2 | 24,2 | 24,8 | 0% |
| dribbling | 11 | 36,8 | 39,1 | 39,3 | n/a |
| cross | 2 | 39,5 | 39,5 | 39,5 | n/a |

**Lettura 1 — il PO ha ragione sui colpi di testa, e il ramo li ripara.** Senza rimedi la mediana del colpo di testa è 26 m, il 90° percentile 41 m, il massimo 46 m: 13 teste su 16 oltre l'area (tutte da angolo/cross: stesse scene «Calcio d'angolo di LUZI/SPENCER: attacca il pallone!»). Con i rimedi: mediana 10,7 m, massimo 14 m, nessuna oltre l'area.

### Colpi di testa per variante e origine (flusso vero)
| braccio | variante / origine | n | mediana | max |
|---|---|---|---|---|
| spento | header_near_post / angolo | 10 | 29,7 | 46,2 |
| spento | header_diving / angolo | 3 | 26,1 | 40,8 |
| spento | header_diving / cross | 3 | 15,6 | 25,8 |
| acceso | header_near_post / angolo | 7 | 10,7 | 14,0 |
| acceso | header_near_post / cross | 2 | 14,0 | 14,0 |
| acceso | header_diving / cross | 3 | 11,3 | 12,0 |
| acceso | header_diving / angolo | 2 | 9,6 | 9,6 |

## 3. Colpi di testa — integrazione mirata (20 casi per braccio, GLB spento)
Posizioni dell'occasione dichiarata (logiche): (48,50) (58,22) (66,36) (78,50) (90,54) (82,70) × angolo/cross.

| braccio | n | mediana m | p90 m | max m | > 16,5 m | > 11 m |
|---|---|---|---|---|---|---|
| acceso | 20 | 8,7 | 12,8 | 12,8 | 0 | 7 |
| spento | 20 | 31,2 | 43,4 | 43,6 | 12 | 17 |

Spento, `gx` in unità per posizione: da (48,50) 41,5 / 38,3 u; (58,22) 34,5; (66,36) 24-27; (78,50) 12-15; (90,54) 4,6; (82,70) 8-11. Cioè **l'eroe stacca dove il motore dichiara l'occasione**; acceso, `gx` sta sempre 4,2-6,7 u (ancora riportata in area dal rimedio 117A, src/04:1027). Il «>11 m» acceso (7 casi) sono teste da (82,70)/(78,50) con z laterale — dentro l'area, ma a lato della porta.

## 4. Il problema vero che resta: i TIRI (non le teste)

Anche **con tutti i rimedi** il 39% dei tiri (29/75) parte oltre 30 m e 20/75 oltre 35 m; la mediana del tiro di potenza è 34,5 m (47 scene, max 39,3 m). Il censimento per titolo dà un colpevole netto:

- **27 dei 29 tiri > 30 m sono scene «Ricevi fra le linee: hai spazio!» / «Fra le linee, X esce in ritardo!»** (tutte le 29 scene di questo tipo con tiro: 28,8-39,3 m, mediana ≈ 36 m). Gli altri due: «Spazio per il tiro dal limite», «Palla buona al limite dell'area» (titoli che promettono il limite, ma >30 m).
- Origine ambientale per tiro: azione n60 mediana 29,3 (max 39,3); angolo n10 mediana 23,3 (max 30,9 — «shot_one_on_one», tiro dopo l'angolo); cross n5 mediana 15,4 (max 17,5).
- Spento: stesso quadro (azione 30,7; angolo fino a 39,1 u con volée; cross fino a 36,9).

## 5. Esempi peggiori (salvataggio / seme / indice highlight / titolo)

Colpi di testa SPENTO (flusso vero):
| dist. m | salv. | seme | hl | variante | esito | titolo |
|---|---|---|---|---|---|---|
| 46,2 | s1 | 8 | 1 | header_near_post (angolo) | fallito/miss | 🚩 Calcio d'angolo di LUZI: attacca il pallone! |
| 40,8 | s1 | 3 | 2 | header_diving (angolo) | miss | 🚩 Calcio d'angolo di LUZI: attacca il pallone! |
| 35,6 | s12 | 8 | 3 | header_near_post (angolo) | miss | 🚩 Calcio d'angolo di SPENCER: attacca il pallone! |
| 33,5 | s12 | 4 | 2 | header_near_post (angolo) | miss | 🚩 Calcio d'angolo di SPENCER: attacca il pallone! |
| 30,3 | s12 | 6 | 5 | header_near_post (angolo) | miss | 🚩 Calcio d'angolo: il pallone spiove in area! |

Tiri ACCESO (rimedi inclusi), tutti shot_power da «fra le linee» (esiti perlopiù intercept/miss):
| dist. m | salv. | seme | hl | titolo |
|---|---|---|---|---|
| 39,3 | s1 | 6 | 0 | 🧠 Ricevi fra le linee: hai spazio! |
| 38,8 | s12 | 7 | 5 | 🧠 Fra le linee, MITCHELL esce in ritardo! |
| 38,5 | s5 | 6 | 0 | 🧠 Fra le linee, JUNG esce in ritardo! |
| 38,4 | s5 | 2 | 2 | 🧠 Fra le linee, JUNG esce in ritardo! |
| 38,2 | s1 | 1 | 3 | 🧠 Ricevi fra le linee: hai spazio! |

## 6. Da quale codice nasce la distanza (file:riga probabile — ipotesi dal codice, non provate con interruttore dedicato salvo dove indicato)

1. **Colpi di testa da angolo/cross lontani** — `src/04-situazioni-zone-piazzati.jsx:1011-1030` (`scenaDalMotoreCross`): la scena nasceva dove il motore dichiara l'occasione (`occ.x`, anche a centrocampo, x logico 48-50); il rimedio 117A (r.1027) sposta l'ancora a x 87-93. **Provato**: bracci acceso/spento di questo rapporto (26→10,7 m flusso; 31→8,7 mirato).
2. **Tiri da «fra le linee» a 29-39 m** — `src/14-motore-possesso.jsx:822-826` (`_tipoOcc`: zona «trequarti» con |y−50|<22 ⇒ tipo `fra-le-linee`), `:480` (finestra `a>=60&&a<76` per dichiarare l'occasione) e `:1223` (bersaglio dell'eroe `xDa(68,…)`) ⇒ l'eroe sta a x≈61-68 logico = 31-38 u dalla linea di porta; poi `src/04:989-996` (`scenaDalMotoreLinee`) costruisce la scena **senza alcun clamp** e `src/04:972-979` (`P6_LINEE`, voci `fuori` «Tiro da fuori» e `conduci`) offre il tiro con `shot_power` da quel punto. Il catalogo storico ebbe già il rimedio «tiri da distanza siderale» 7.751 (r.284, 445, 471, 584, 611: partenze portate a 30 m): la costruzione dal motore ne è fuori. *Ipotesi*: non è stato bucato con interruttore in questo giro.
3. **Dribbling/contrasto/passaggio a 35-60 m** — gesti non conclusivi; la distanza segue l'ancora dell'occasione (`_tipoOcc` «costruzione», `:1223` `xDa(46)`). Non è un difetto di distanza.
4. **Tiro «shot_one_on_one» dopo angolo fino a 39 u (spento) / 31 u (acceso)** — stessa famiglia di (1) (`scenaDalMotoreCross`, azioni di tiro del catalogo `P6_CROSS`, r.1004): il rimedio 117A copre solo l'ancora, non filtra le azioni; col pallone che parte lontano resta una conclusione da fuori.
5. **Volée da angolo a 39 u (spento)**: come (1).

## 7. Proposte di correzione (NON implementate)

| tipo | proposta | rischio / guardiano |
|---|---|---|
| colpo di testa (angolo/cross) | già riparato dal ramo (117A+121). Proposta di solo contorno: portare l'ancora anche per le azioni di *testa* nel catalogo non-motore (se esistono) e fissare la soglia di `angolo-117` (10,5 u) come limite anche per `cross` da azione. | `angolo-117` già lo guarda; aggiungere un caso cross-da-azione |
| tiro «fra le linee» / tiro di potenza | clampare l'ancora di `scenaDalMotoreLinee` (come r.1027 per il cross): x logico ≥ ~73 (≈ 28 m) per le scene che offrono un tiro; oppure togliere/ammorbidire `fuori` e `conduci` quando |x|>30 m dalla porta, offrendo al loro posto avanzamento/filtrante. Alternativa: spostare `xDa(68)` a `xDa(74)` in r.1223. | tocca motore-possesso (`bg-decision`/`bg-rhythm`/`possesso`, replay); la prima è locale alla scena ⇒ più sicura. Guardiano nuovo: tiro ≤ 30 m (soglia da concordare col PO) |
| tiro dopo angolo (`shot_one_on_one`, volée) | filtrare le azioni di `P6_CROSS` per distanza dell'ancora, o ancora più interna per le azioni di tiro (x 89-93). | `angolo-117` e `volee-d3-119` |
| punizione (22-25 m) | nei limiti del realistico: nessuna correzione. | — |
| rigore | 13,6 m (campione di 2): da verificare che il dischetto sia a 10,5 u; non è una distanza anomala della sonda (il contatto include la rincorsa/z). | campione troppo piccolo |
| contrasto/passaggio/dribbling | nessuna: la distanza dalla porta non è un criterio per questi gesti. | — |

## 8. Cosa NON è stato fatto
GLB acceso (campione); minuti delle scene; ripetizioni a ≥3 giri per stabilità; prova con interruttore dedicato per l'ipotesi (2). Il resto è misurato.
