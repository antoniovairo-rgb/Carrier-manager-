# Rapporto giro 212 — PO-474 («Nelle scene 3d c'è un gigante in campo!»)

Ramo `sviluppo/giro212-gigante`, partito da `lavoro/195`. `GAME_VERSION` non toccata (nel file vale `7.999.194`; la
consegna parla di 7.999.195: segnalo la differenza, non la correggo).

Foto del PO (7.999.194, telefono): `docs/collaudo-po/194-gigante-in-campo-fischio-finale.jpg` sul ramo
`poc/marioprada-character-system`. Festa del fischio finale (FC Islington – Merseyside 0-2 in trasferta, «FISCHIO FINALE ·
DOPPIETTA»): mentre il n. 77 esulta, oltre i cartelloni c'è un corpo enorme (pantaloncini azzurri, calzettoni blu con righe,
scarpe bianche) che occupa metà dell'inquadratura.

---

## 1. Lo strumento: un testimone dei corpi per ogni scena 3D

`misuraCorpi212(scena, scene, camera, chi)` — `src/12-three-match-view.jsx`, funzione globale, solo lettura, accesa solo quando
la sonda arma `window.__CPM_G212W` (array). È chiamata dopo ogni disegno in:

| Scena | Dove |
|---|---|
| partita: ingresso, gioco, highlight, festa del fischio finale, premiazione | `src/12` render-loop di `ThreeMatchView` (accanto al testimone `__CPM_T196W`) |
| intervista, presentazione, parata col pullman, gala | `src/16-scene-3d-cerimonie.jsx` (i quattro `renderer.render`) |
| intro della schermata d'avvio | `src/19-app-root.jsx` |

Per ogni corpo con scheletro visibile registra:

- **statura**, indipendente dalla posa: estensione delle ossa lungo l'asse piede→testa della posa di legame del file (lo stesso
  metro di `_skeletonWorldHeight`, con cui il gioco scala i corpi), riportata al mondo col rapporto fra il percorso d'ossa
  piede→testa di adesso e lo stesso percorso nella posa di legame. Vale per i file Y-su (CGTrader, Mixamo) e Z-su (Rocketbox
  del mister: la prima versione del metro, solo asse Y, lo misurava 0,22 m — era il metro, non il mister);
- **metri**: in verticale 1 unità = 1 metro, la convenzione del gioco (la traversa sta a 2,44; vedi Dubbi, punto 3);
- **scala** del corpo nel mondo, **distanza** dalla camera (bacino e osso più vicino), **piano near**, ossa **dentro il near** o
  **dietro la camera**, **quota dell'inquadratura** (rettangolo delle ossa proiettate, ritagliato allo schermo);
- **a chi appartiene**: eroe, casa/ospiti (indice in `glbAvatars`), portiere, arbitro, guardalinee, bambino, panchina, mister,
  mister della premiazione — e, se nessuno lo reclama, la catena dei genitori con le loro scale.

## 2. La misura — chi è il gigante

Prima misura (festa forzata, 375×812, GLB acceso), corpi senza padrone in `glbAvatars`:

| corpo | catena dei genitori | scala nel mondo | statura | posizione |
|---|---|---|---|---|
| sconosciuto (poi: guardalinee) | `CGTraderRetargetRig*0,010 < Scene*17,200 < Group < Group < Scene` | **0,172** | **26,5 u** | (0, 16, **−36**) |
| sconosciuto (poi: guardalinee) | idem | **0,172** | **26,9 u** | (0, 16, **+36**) |
| eroe, compagni, avversari, arbitro | — | 0,010–0,011 | 1,59–1,64 u | in campo |
| comparse della panchina | `… < Scene*1,0–1,18 < Group < Scene` | 0,010–0,012 | 1,0–1,2 u (seduti: la statura non cambia con la posa) | z −36/−38 |

Il bacino a quota 16 è coerente con un corpo 17 volte più grande in piedi sul prato. Sono i **due guardalinee**:
`_replaceAssistantsWithHyper` (`src/12`, giro 196, PO-449: «i guardalinee erano le ultime due figure procedurali in campo»).

**Causa** (riga del codice di prima):

```js
const raw=new THREE.Box3().setFromObject(visual),height=Math.max(0.1,raw.max.y-raw.min.y);visual.scale.setScalar(1.72/height);
```

`Box3.setFromObject` sul pacchetto CGTrader LOD legge la posa di legame delle SkinnedMesh e restituisce meno di 0,1 (lo stesso
inganno già scritto nel codice il 23/09 per i LOD: «bounding box alto 0,021 contro uno scheletro di 1,837»). Il tetto
`Math.max(0.1, …)` la porta a 0,1, e **1,72 / 0,1 = 17,2**: esattamente la scala misurata. Bambini e panchina, costruiti nello
stesso blocco, leggevano già lo scheletro (`_skeletonWorldHeight`) e infatti avevano altezze giuste.

Non è un corpo dentro il near della camera: in tutte le scene misurate le ossa dentro il near sono **0**. È un corpo con scala
sbagliata, in piedi dove stanno i guardalinee (|z| ≈ 36, oltre i cartelloni): dalla camera bassa della festa, che guarda verso
gli spalti, ne entrano le gambe — come nella foto.

Il difetto non è della sola festa: col rosso il guardalinee gigante è in scena anche nell'**ingresso** e negli **highlight**
(29 m, `partita:walkout` e `partita:hl_intro`); si vede quando la camera guarda verso quel lato.

Le altre scene 3D cercate (intervista, presentazione, parata, gala, intro d'avvio, premiazione) non hanno corpi fuori misura:
vedi la tabella del guardiano.

## 3. La correzione (rosso `window.__CPM_NO_G212`)

`src/12-three-match-view.jsx`, `_replaceAssistantsWithHyper`: l'altezza del guardalinee si legge dallo **scheletro**
(`_skeletonWorldHeight`, come bambini e panchina) e si applica la stessa scala dei corpi in campo (`_scalaCorpo21`, 0,9).
Il rosso rimette la riga di prima (bounding box + tetto 0,1, senza `_scalaCorpo21`).

Misurato dopo: guardalinee **1,54–1,56 m**, scala 0,0099 (gli altri corpi 0,010–0,011).

Foto, stessa inquadratura (festa forzata, camera sul prato a 22 u dal guardalinee del lato lontano, gancio di collaudo
`__CPM_CAM904`; strumento `tests/visual/foto-gigante-212.mjs [--rosso]`):

- `docs/sviluppo/giro212/prima-festa-guardalinee-in-quadro.jpg` — il gigante della foto del PO: pantaloncini azzurri,
  calzettoni blu con le righe, scarpe bianche; 26,7 m, **82% dell'inquadratura**;
- `docs/sviluppo/giro212/dopo-festa-guardalinee-in-quadro.jpg` — stessa camera: nessun gigante; il guardalinee (1,54 m) è
  coperto dai cartelloni (vedi Dubbi, punto 1).

Le altre foto della cartella (`dopo-*`, `rosso-*`) sono quelle che scatta il guardiano in ogni scena.

## 4. Il guardiano `gigante-212`

`tests/visual/gigante-212.mjs`, `npm run gigante-212` (= verde su tutti gli scenari + rosso su `trasferta-tel`), nelle catene
`completa` e `carriera` di `ci-runner.mjs`, una volta sola per catena (`node --check` verde, nessun doppione).

Scenari, GLB acceso:

| scenario | percorso | scene giudicate |
|---|---|---|
| `trasferta-tel` | salvataggio pro (fixture `save-190-s12-ovr93`), campionato in trasferta, 375×812 | ingresso, highlight (2 risolti), festa «Doppietta» |
| `casa-pc` | stesso salvataggio, coppa in casa (gara inserita in testa al calendario come fa `tpose-196`), 1280×720; premiazione di coppa su pagina propria | ingresso, highlight, festa, premiazione |
| `festa-vera-tel` | partita del provino giocata fino al fischio (autoplay, 2 gol forzati con `__CPM_FESTA942_FORCE`), 375×812 | la festa che nasce dal fischio finale vero |
| `cerimonie-tel` | presentazione (beat 3), gala, parata col pullman, intro d'avvio, 375×812 | le quattro scene |

Criteri dichiarati: statura **[1,45 · 2,05] m** (bambini dell'ingresso **[1,05 · 1,45] m**), nessun corpo inquadrato con ossa
dentro il near, nessun corpo oltre il **60%** dell'inquadratura; ogni scena deve avere almeno 8 fotogrammi con corpi
(«non giudicato» = rosso). Rosso: col `__CPM_NO_G212` almeno un corpo sopra 2,05 m.

ESITI — vedi sezione 5.

## 5. Controlli

ESITI_CONTROLLI

## Dubbi per il PO

1. **I guardalinee stanno dietro i cartelloni.** I loro marker (preesistenti, non toccati) sono a |z| ≈ 35,5, oltre la fila dei
   cartelloni: con la statura giusta, dalla camera bassa della festa non si vedono (foto «dopo»). Va bene così o vanno portati
   sulla linea laterale, davanti ai cartelloni? Non l'ho cambiato: è una scelta di regia.
2. **La divisa del guardalinee.** Il codice dichiara maglia gialla e pantaloncini/calzettoni scuri (`#f4d43c` / `#1b2638`), ma
   la foto del PO e la mia foto «prima» mostrano pantaloncini azzurri e calzettoni blu con righe oro/bianche: sembra che il kit
   non si applichi al pacchetto LOD leggero. Non l'ho misurato né corretto (fuori dall'ambito del gigante).
3. **Quale metro per «metri».** Il gioco usa in verticale 1 u = 1 m (traversa a 2,44), ma la porta è larga 6,70 u (7,32 m veri):
   in orizzontale 1 u ≈ 1,09 m. Ho usato la verticale. In più i corpi in campo sono disegnati a 0,9 della statura dichiarata
   per scelta del giro 21 (`_scalaCorpo21`): un calciatore «da 1,80» misura 1,62. Per questo il minimo dichiarato è 1,45 m e
   non 1,60 come nell'esempio della consegna: con 1,60 il guardiano boccerebbe i corpi giusti di oggi. Se il PO vuole 1,60 va
   deciso prima se togliere lo 0,9.
4. **Pareggio e «festa dei compagni».** Con le regole attuali la festa del fischio finale nasce solo su una vittoria importante o
   su una prestazione super (`_vinta && (_imp23 || _super23)`): sul pareggio non c'è festa da misurare. L'abbraccio dei compagni
   è dentro la festa leggera ed è misurato lì (festa forzata e festa vera). Non ho trovato una scena «festa dei compagni» separata.
5. **Intervista 3D** (`InterviewStage3D`) si monta solo col rosso di un altro giro (`__CPM_NO963`): il testimone c'è, ma il
   guardiano non la percorre perché il gioco oggi mostra l'intervista 2D.
6. **Altri costruttori col bounding box.** Lo stesso schema `Box3 + Math.max(0.1, …)` esiste ancora in altri punti (`src/12`
   `_replaceBenchWithHyper`, riga ~1943, usato solo nella modalità «full» dei corpi; `src/16` corpi delle cerimonie; `src/19`
   intro). Quelli di `src/16` e `src/19` oggi misurano altezze giuste (tabella sopra) perché usano file diversi dal pacchetto LOD;
   la panchina «full» non è percorsa dal guardiano (non è la modalità predefinita) e potrebbe avere lo stesso guasto se
   ricevesse il pacchetto LOD: non l'ho misurata. Non li ho toccati: nessuna misura li accusa.
