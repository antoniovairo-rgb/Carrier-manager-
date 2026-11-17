# Rapporto giro 223 — PO-487 («codice 111 — portiere fuori tempo» sul tiro sbagliato)

Ramo `sviluppo/giro223-portiere-111`, partito da `lavoro/196`. `GAME_VERSION` non toccata (la porta la sessione di rilascio,
consegna «7.999.196»). Roadmap non toccata per lo stesso motivo.
Taccuino del PO: `docs/collaudo-po/195-taccuino-codice111-conclusione-di-prima.txt` (ramo `poc/marioprada-character-system`):
S.16 W.1 74' vs FC Stamford, «💥 Palla buona al limite dell'area!» → «⚡ Conclusione di prima», esito miss.

## 1. Misura prima

Sonda (poi guardiano) `tests/visual/portiere-223.mjs`, nata da `gk-miss-229` (stesso testimone `__CPM_GK229`, tempo di scena,
pagina fresca per scena, corpi procedurali). Scena del taccuino ricostruita come la costruisce il gioco
(`scenaDalMotoreConclusione`, zona `limite`, titolo «Palla buona al limite dell'area!», azione `prima`). Tre misure nuove
oltre alle quattro del 229 (fermo · in ritardo · verso · largo):

- **attraverso**: il pallone passa a < 0,7 u dal centro del portiere (quota ≤ 2 u) fra calcio e linea;
- **presto**: distesa completa > 0,25 s di scena prima che il pallone arrivi sul suo piano;
- **rialzato**: gesto già finito quando un pallone a portata gli passa.

**La scena del taccuino**, prima: arco del tiro fuori che **muore a x 43,8**, il portiere si tuffa con l'arco, il pallone
gli passa a **0,5 u** dal corpo e solo sulla linea scivola oltre il palo (canale `wide_slide`).

**Censimento su tutte le azioni di tiro** (229 azioni di tiro nel catalogo; campione stratificato per variante: 39 scene
del catalogo + 4 scene P6C = 43 scene × esito fuori e palo = **86 tiri sbagliati**):

| | prima | dopo |
|---|---|---|
| difetti totali | **69** | **2** |
| pallone dentro il portiere | 29 | 1 (gi55) |
| tuffo/riflesso già finito o già disteso al passaggio | ~35 | 0 |
| portiere fermo con pallone a portata | 6 | 0 |
| tuffo dalla parte sbagliata / su pallone largo | 6 | 0 |
| gesti del portiere | 75 su 86 | 23 su 86 |

Esempio misurato (volée gi1, fuori): arco a x 43,4 col portiere a x 47,2; portiere disteso e rialzato a 1,93 s, il pallone
gli arriva rotolando a 2,42 s e gli passa nei piedi.

**Causa.** Sul tiro sbagliato il bersaglio dell'arco è quello della variante (x `AWAY_GOAL_X−4…+1`, z sorteggiata anche dentro
lo specchio) e muore davanti al portiere; il tuffo vive quanto l'arco (7.465), quindi finisce mentre il pallone, nel post-arco,
gli rotola ancora incontro. In più il tuffo del 229 andava all'80% della distanza, lasciando il corpo a 0,4-0,7 u dal pallone.

## 2. Correzione (`src/12-three-match-view.jsx`, tutto sotto il rosso `window.__CPM_NO_G223`)

Coerente con parata-258 / giro 119 (stesso punto: armo dell'arco) e con il 229 (stesso ramo del tuffo sul tiro sbagliato):

1. **Il tiro sbagliato arriva sulla linea.** Fuori: x `AWAY_GOAL_X+2,5`, z fuori dal palo (≥ 4,36), dal lato scelto dalla
   variante finché esiste un fuori vero (a ≥ 2,6 u dal portiere in pianta lungo la traiettoria, anche dove arriva col tuffo, e
   mai davanti allo specchio prima della linea); altrimenti l'altro lato. Palo: x `GOAL_LINE_X−0,3`, il palo con più margine
   dal portiere. Traversa: z entro ±3,2 con più margine. Durata scalata sulla corda (stessa velocità, tetto 1,6 s).
2. **La traiettoria è quella disegnata** (`_curva223`): corda + pancia del tiro a giro (7.231, che su un tiro obliquo è quasi
   tutta lungo x) + quota (0,22 + 0,65·`ballArcH`·sin + corda contatto→arrivo). Il coefficiente 0,65 è **misurato** sui
   fotogrammi del censimento: la pancia reale vale 0,55-0,77 × `ballArcH` in tutte le varianti.
3. **Portata = definizione del 229** (4,5 u di lato, 5,5 in pianta, 2,6 di quota nel punto di massimo avvicinamento): il
   portiere ci prova solo lì, sia sul fuori sia sul palo; oltre lo guarda uscire. Il fuori evita la fascia di ±0,25 u
   attorno a quelle soglie (lì il verdetto dipenderebbe dallo scarto della stima).
4. **Sfiora, non attraversa**: il centro del corpo disteso si ferma a 1,3 u dal pallone (la mano), lungo tutto il percorso.
   Se così non c'è tuffo possibile (< 0,3 u), riflesso col corpo con lo scatto negli ultimi 0,19 s prima dell'arrivo.
5. **Distesa completa quando il pallone passa sul suo piano**, non a fine arco.

Parate, gol, rigori e punizioni non passano da questi rami (condizioni: `hlSuccess===false`, esito fuori/palo, tiro o testa).

## 3. Guardiano

`tests/visual/portiere-223.mjs` (`npm run portiere-223` = verde + `CPM_ROSSO=1`). Campione dichiarato: la scena del
taccuino + sei scene una per famiglia (volée gi1, di prima gi62, potenza gi165, a giro gi17, primo palo gi90, secondo palo
gi86) × fuori e palo = 14 tiri; sotto metà giudicati = cieco (rosso).

- VERDE: 14 tiri giudicati, 0 difetti.
- ROSSO `__CPM_NO_G223`: 14 difetti (pallone dentro il portiere, già disteso/rialzato, fermo, tuffo largo).

Messo una sola volta nelle catene `completa` e `carriera` di `ci-runner.mjs`, nei LENTI e nelle due mappe mirate di `src/12`
(`node --check` ok).

## 4. Controlli (uno alla volta; dopo ogni modifica `build-src` + `check-src`)

| controllo | esito |
|---|---|
| portiere-223 | ✅ verde + rosso bocciato |
| gk-dive-sync | ✅ PASS (distesa mediana −0,05 s dall'arrivo) |
| gk-miss-229 | ✅ VERDE (12 tiri, compreso il braccio geometrico del palo) |
| goal-postarc | ✅ PASS (6 gol, 6 in porta) |
| esiti-96 | ✅ PASS (verde; braccio rosso bocciato) |
| scena3d-96 | ✅ VERDE (31/31 scene, 0 errori di pagina) |
| tpose-196 | ✅ verde (4 scenari) + rosso atteso; le foto di `docs/sviluppo/giro196/` rigenerate rimesse con `git checkout --` |
| test:logic | ✅ 51/51 |
| save-compat | ✅ 12 pass · 0 fail |
| career-critical | ✅ FINE 0 |
| highlight-95 | ✅ verde (e il rosso si vede), FINE 0 — lanciato per ultimo in sottofondo, atteso sulla riga FINE |

## Dubbi per il PO

1. **Il portiere si tuffa molto meno sui tiri sbagliati** (23 gesti su 86, prima 75): sui palloni che passano fuori portata
   ora guarda uscire. Prima i gesti c'erano ma quasi tutti incoerenti (pallone nel corpo, tuffo già finito). Va confermato
   al telefono che il «guarda uscire» non sembri un portiere passivo.
2. **Il tiro fuori può cambiare lato** rispetto al sorteggio della variante, ed esce di 0,7-8 u dal palo: è il prezzo di
   «mai dentro il portiere». Il testo dell'esito non dice il lato, quindi nessun disallineamento con la cronaca.
3. **Residuo dichiarato: gi55 «Stacco sul palo lontano» sul palo** — colpo di testa da z −18 (dalla bandierina): il pallone
   attraversa lo specchio proprio dove sta il portiere, nessun palo lo evita. Il difetto cambia a ogni giro (bersaglio di
   partenza non seminato). Servirebbe una decisione: su quella scena il «palo» ha senso?
4. La stima della quota è tarata in headless sui corpi procedurali; non l'ho verificata coi corpi GLB né al telefono.
5. Nel lavoro ho usato una volta un ciclo d'attesa con `pgrep -f` (vietato): l'ho fermato appena accortomi, nessun effetto
   sul repo.
