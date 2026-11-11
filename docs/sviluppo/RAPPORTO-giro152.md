# Giro 152 — «a volte l'eroe vola con le braccia alzate» (PO-355, 10/11)

Ramo `sviluppo/giro152-esultanza` (da `lavoro/189`). `GAME_VERSION` non toccata. Rosso: `__CPM_NO_G152`.
Guardiano nuovo: `npm run esultanza-152`.

## 1. Misura (prima di correggere, corpi 3D accesi)

Il gioco scrive un testimone per fotogramma, solo sotto `?cpmtest=1` (`window.__CPM_G152W`, src/12 dopo
l'aggiornamento del mixer dell'eroe): contesto (`cel` esultanza in campo · `cer` festa/premiazione), piano
d'esultanza, posizione e quota del corpo, piede più basso sopra il prato (rispetto al piede da fermo misurato in
partita, `_fs203`), clip montata, tempo e pausa, peso del gesto, peso della corsa (jog + scatto).

Percorsi misurati: 14 gol forzati con l'esultanza **imposta** (tutte le 7 voci di `CELEBRATIONS`, a turno), 3 gol
seguiti da «CONTINUA» (ripresa dal centro), festa di fine partita leggera e premiazione con coppa tenute aperte 16 s
di scena, 3 partite vere seedate con nomi diversi (`Vera152a/b/c`, autoplay).

**Baseline (codice di lavoro/189):**

| percorso | esultanze | in volo | cosa si vede |
|---|---|---|---|
| `run_wide` (corsa verso la bandierina) | 3 | 2 | eroe a 13 u/s per 2,2 s, clip `mx-victory-jump` **in pausa** a peso 0,75-1, corsa 0-0,13 |
| `run_to_crowd` (corsa sotto la curva) | 3 | 3 | stesso quadro a 1,8-9 u/s |
| `arms_up`, `jump_arms_up`, `contained`, `run_to_mates`, `knee_slide` | 11 | 1 (*) | nessuna scivolata |
| ripresa dal centro | 3 | 0-1 (**) | l'esultanza si chiude dopo 0,4 s al «CONTINUA» |
| festa di fine partita (leggera) | 1 | 0 | crossfade di due fotogrammi all'avvio dello scatto (vedi §2) |
| premiazione con coppa | 1 | 1 | salita sul palco con la posa congelata (vedi §4) |
| partite vere (3) | 1 gol dell'eroe | 0 | l'autoplay chiude l'esultanza dopo 5 fotogrammi: **non giudicabile** |

(*) `contained` con la prima stesura delle soglie: il saltello della clip `mx-fist-pump` *mentre suona*; non è un
corpo appeso (la clip avanza) e le soglie definitive lo escludono. (**) un fotogramma a 1,5 u/s, sotto la soglia di
distanza.

Frequenza nel gioco: dalla funzione di scelta pura (`pickCelebration`) su una griglia uniforme di intensità/posizione
— **indicativa, non è la distribuzione delle partite vere** — le due corse a braccia alzate pesano ~19% dei gol
dell'eroe (`run_to_crowd` 12,3% · `run_wide` 6,9%). Nei gol forzati con quelle due voci il volo c'era in 5 casi su 6.

**Causa.** Nell'esultanza in campo (src/12, blocco QW-C/7.371) `_celLift371` vale 1 per tutto il piano quando la
clip è `lift`, anche quando lo stesso piano fa correre l'eroe con `animOne`. Con `_celLift371=1` la selezione dei
gesti monta `lift` e il congelamento all'apice del 7.384 la tiene in pausa; il peso del gesto toglie peso alla corsa
(`run.weight = lbW·(1−gTot)`): braccia al cielo immobili e gambe ferme che scivolano. La festa di fine partita aveva
già la regola giusta (7.999.80, `_muove80`); l'esultanza in campo no.

## 2. Correzione

src/12, esultanza in campo, dopo la corsa del piano: velocità reale dell'eroe da un fotogramma all'altro (sale
subito, scende smussata: niente ri-armi a scatti; oltre 40 u/s è uno stacco e vale zero). Se supera 1,5 u/s — la
stessa soglia della festa — oppure se il piano ha una corsa e l'eroe è ancora a più di 1,5u dal suo bersaglio,
`_celLift371` torna 0: in moto comanda la locomozione (gambe e braccia della corsa); arrivato, le braccia tornano al
cielo e la posa si tiene da fermo. Stato azzerato a inizio e fine esultanza.

Festa (7.999.80): la stessa velocità ora sale subito invece della sola media mobile, che teneva le braccia al cielo
per due fotogrammi di scatto (2,2-2,9 u/s, beat `present`). Stessa soglia, stesso interruttore rosso.

Nessuna seconda logica, nessun `Math.random` nuovo, nessun campo salvato.

## 3. Guardiano `esultanza-152` e soglie (fissate dopo la misura)

- **Scivolata**: velocità > 1,5 u/s con `lift` montata a peso > 0,5, oppure corsa (jog+scatto) sotto 0,30 — «in
  volo» se percorre di fila più di **1,0u** (circa un passo). Sotto c'è la dissolvenza posa→corsa all'avvio di uno
  scatto, misurata 0,1-0,75u su tutte le esultanze in corsa, anche quelle senza braccia al cielo.
- **Sospeso**: piede più basso > 0,10 sopra il prato con la clip ferma o mentre si sposta, per più di 0,40 s di
  scena. Esclusi il salto previsto (quota procedurale, mezzo secondo per costruzione) e il saltello della clip
  mentre suona.
- Verde: zero esultanze in volo su almeno 8 giudicate (≥ 6 fotogrammi) e zero pageerror; rosso `__CPM_NO_G152`:
  il volo deve ricomparire; «non giudicato» = rosso. Le partite vere sono opzionali (`CPM_VERE=1`): misurate qui,
  ma l'autoplay non lascia vivere l'esultanza.

**Dopo la correzione** (prima corsa completa del guardiano, poi confermata dalla catena in §5): verde 0 esultanze in volo su 17 in campo/ripresa + festa
(scivolata massima 0,55u); rosso 4 esultanze in campo in volo, scivolate fino a **19,7u**. La riga della coppa,
allora ancora nel verdetto, faceva fallire il verde: vedi §4. Esito della catena in §5.

Foto (GLB acceso, `esultanza-152-foto.mjs`, `run_wide` imposta) in `docs/sviluppo/giro152/`:
`prima-corsa.png` (braccia al cielo, corsa 0, clip in pausa, 4,5 u/s) · `prima-arrivo.png` ·
`dopo-corsa.png` (5,3 u/s, gesto rilasciato, corsa 0,52 e in crescita). L'eroe è piccolo nel quadro: le foto
accompagnano i numeri, non li sostituiscono.

## 4. Trovato e NON corretto

- **Premiazione con coppa — salita sul palco.** Nel beat `lift` l'eroe va da (−2,3; 1,4) al centro del palco: 2,7u
  in 0,55 s di scena, quota fino a 1,05, con `mx-victory` congelata al 45% e corsa 0. È preesistente, identica nei
  due bracci, ed è esclusa di proposito da `_muove80` (`&&!_onPodium`). Toccarla vuol dire passare per il ri-armo
  della clip (riparte da 0 e impiega ~1,5 s a tornare all'apice, con la coppa in mano) e sta sotto i guardiani del
  giro 191. Il guardiano la misura e la stampa come «FUORI GIUDIZIO».
- **Intro della home (src/19).** La clip `lift` parte a 11,75 s, quando l'eroe rallenta ancora a ~2 u/s per
  ~0,25 s. Fuori dal testimone (non è una partita), non misurato.
- **Partite vere**: con l'autoplay l'esultanza vive 0,25-0,42 s; per misurarla sul flusso vero serve un'attesa
  prima del «CONTINUA» automatico.

## 5. Catena

Un controllo alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, memoria libera ~15,5 GB e disco 29 GB prima di ognuno.
Il container è stato riavviato due volte durante il giro (catene in sottofondo uccise): le corse interrotte non valgono e
sono state rifatte da capo sul build del commit 6532254.

| controllo | esito |
|---|---|
| `esultanza-152` | ✅ verde 0/18 esultanze in volo · rosso `__CPM_NO_G152` cade 4/18 (run_to_crowd 2/3, run_wide 2/3) · coppa fuori giudizio (scivolata 2,72u in entrambi) |
| `festa-57` | ✅ verde + rosso + rosso61 |
| `premiazione-132` | ✅ verde, i rossi cadono |
| `posa-sollevamento-191` | ✅ (clipT 0,45 verde, 0,34 rosso) |
| `premiazione-palco-191` | ✅ (in volo 0/27 verde, 5/27 rosso) |
| `validate-situations` | ✅ PASS · fingerprint 00001505 · 0 failure |
| `highlight-95` (completo) | ✅ verde (103 highlight, D4 0) e il rosso si vede — durata ~89 min |
| `test:logic` | ✅ |
| `save-compat` | ✅ 12 pass · 0 fail |
| `scena3d-96` (tel · pc · tabv · tabo) | ⏸ **non eseguito**: tetto delle 4 ore |
| `goal-postarc` | ⏸ **non eseguito**: tetto delle 4 ore |
| `partita-vera` | ⏸ **non eseguito**: tetto delle 4 ore |

La catena non è completa: prima di promuovere servono `scena3d-96` nei quattro formati, `goal-postarc` e
`partita-vera`. La modifica tocca solo l'esultanza in campo e la velocità della festa; nessuno dei tre passi mancanti
è stato eseguito, quindi il loro esito **non posso confermarlo**.

## Domande aperte al PO

1. La salita sul palco col trofeo (§4) va fatta camminando (gambe della corsa, braccia tenute sulla coppa), oppure
   la scivolata breve è accettabile come «salto sul palco»?
2. Con la correzione, nelle corse corte (`run_to_crowd` a 2,2 s) le braccia al cielo arrivano solo all'arrivo, a
   metà esultanza o dopo. Va bene così, o la corsa sotto la curva deve avere un'esultanza «in corsa» propria (oggi
   non c'è una clip di corsa a braccia alzate fra gli asset)?
