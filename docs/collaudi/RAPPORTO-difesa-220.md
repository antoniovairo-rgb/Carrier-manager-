# RAPPORTO PO-220 — «le chiusure difensive dell'eroe ancora non credibili»

Collaudo 3D del 15/10/2026 · ramo `collaudo/difesa-220` · gioco 7.999.169 (main) · **solo misura**: `src/` e `CARRIER-MANAGER-AV.html` non sono stati toccati.
Ambiente: Chromium headless con GL software (7–13 fps), **GLB acceso** (`__CPM_GLB=true`), `__CPM_PRESENT=1`, **pagina nuova per ogni scena forzata e per ogni partita** (lezione 7.483).

## 1. Sintesi

1. **(A) L'eroe non arriva sull'uomo: confermato; la discrepanza che lo produce è misurata, la causa è coerente col codice (prova diretta non eseguita).** Il motore dichiara il portatore a **1,1 u** dall'eroe (mediana, p90 1,9 u; 43 scene con contatto), ma all'apertura della scena il 3D li mette a **5,1 u** (p25–p75 3,2–5,9 u; oltre 3 u in 35 scene su 43). Al contatto dichiarato l'eroe sta a **5,1 u** dal portatore (mediana; flusso a tempo di scena reale, 17 scene) e a **4,5 u** dal pallone; in 15 scene su 17 (88%) almeno un indicatore di non-arrivo scatta.
2. **(B) L'esito non torna: confermato, ma è più «non si vede» che «si vede il contrario».** Contraddizioni nette fra riquadro e possesso 3D a +2 s: **3 scene su 17** (18%; flusso a tempo reale). Il caso dominante è il pallone **libero** a +2 s (nessuno entro 3 u): 10 scene su 17 (59%). Nelle 5 scene «recuperata» con esito completo, a +2 s il pallone è di un nostro entro 3 u in **1 caso su 5**.
3. **Difetto non chiesto ma misurato: l'eroe «torna indietro» dopo l'intervento.** In **13 scene su 15** (a tempo reale) e **27 su 29** (a clock tappato) con esito completo, a +2 s l'eroe è tornato entro metà dell'escursione al punto da cui era partito la scena, anche quando il riquadro dice «palla recuperata» (a +2 s l'eroe sta a 3,7–10,5 u dal pallone nelle 5 «recuperate»). Il bersaglio logico dell'eroe resta fermo per tutta la scena (misurato con `__CPM_HERODRV769`).
4. La **compenetrazione fra corpi è rara**: 0 scene su 17 a tempo reale (6 su 50 a clock tappato, minimo eroe–avversario < 0,5 u). L'«attraversamento» come sorpasso in x entro 1,5 u di lato del portatore compare in 6 scene su 43 (14%): **non è una prova di interpenetrazione** (vedi §6).

## 2. Metodo, strumenti, definizioni

**Strumenti già esistenti nel gioco** (nessuna modifica): `__CPM_REC_BUF` (fotogramma per fotogramma: eroe, pallone, 21 mesh, bersaglio logico), `__CPM_TK220` (testimone del contatto: `tC` = istante in cui la posa arriva a u=0,18 della vita del gesto), `__CPM_CAST219` (portatore e posizione dell'eroe **dichiarati dal motore**), `__CPM_RES218`/`__CPM_OUTCOME` (esito raccontato), `__CPM_MP` (squadre), `__CPM_HERODRV769` (bersaglio del driver dell'eroe), `__CPM_DIF220_OGNI` (una scena difensiva ogni 6 minuti invece di una a partita), `__CPM_DTREAL` (tempo di scena = tempo reale, come il telefono). Sonda nuova, solo lettura: `tests/visual/collaudo-difesa-220-3d.mjs` (+ `collaudo-difesa-220-rapporto.mjs` per le tabelle). Le sonde esistenti `difesa-220` e `difesa-220-scena` misurano a GLB spento: qui sono state estese a GLB acceso.

**Tempo di scena.** Mai attese fisse: ogni fotogramma porta il suo istante e il tempo di scena è la somma dei `dt` tappati. A clock tappato (dt ≤ 0,05 s, come il render-loop in headless) la scena corre a **0,28 volte** il tempo reale (mediana delle scene con contatto, range 0,21–0,37): la finestra d'esito, che è un `setTimeout` reale, chiude le scene «recuperata» **0–0,8 s di scena dopo il contatto**, troppo presto per giudicare l'esito. Per questo il campione di riferimento è il **flusso a tempo di scena reale (`__CPM_DTREAL`, dt ≤ 0,3 s)**, dove la stessa scena dura 4–5 s dopo il contatto; il campione a clock tappato resta come controllo (Tabella C) e il suo giudizio sugli esiti «recuperata» **non vale**.

**Definizioni** (unità = unità logiche del campo, 1 u ≈ 1 m in lunghezza):
- *Contatto dichiarato*: fotogramma in cui `__CPM_TK220.tC` si valorizza (gesto di contrasto a piena estensione, 0,31 s dopo l'avvio del gesto).
- *d eroe–portatore / eroe–palla*: distanze fra i centri dei mesh al contatto. Il portatore è quello dichiarato da `__CPM_CAST219` (flusso); **nelle forzate il motore non dichiara un portatore**, quindi lì si misura solo eroe–palla.
- *Ritardo palla*: dal contatto al primo fotogramma con il pallone entro 2 u dall'eroe (0 = già entro 2 u; «mai» = non entro 2 s di scena; «>scena» = la scena finisce prima).
- *Compenetrazione*: distanza minima dei centri eroe–avversario < 0,5 u, oppure pallone < 0,25 u dal centro dell'eroe (soglie del collaudo, proxy del raggio dei corpi).
- *Chi ha il pallone nel 3D*: il mesh (eroe, nostri, avversari, esclusi arbitro) più vicino al pallone, valido se entro 3 u; altrimenti «nessuno» con le due distanze (nostri/loro). Letto a +1 s e a +2 s di scena dal contatto.
- *Casi (A)*: scena con almeno uno fra: portatore > 3 u al contatto, pallone > 3 u al contatto, pallone non raggiunto in 2 s, ritardo > 0,6 s, compenetrazione.
- *Casi (B) forti*: riquadro «recuperata» ma a +2 s il pallone è di un avversario entro 3 u, **oppure** riquadro «fallita» ma è di un nostro entro 3 u. *Indeterminato*: nessuno entro 3 u.
- *Gravità*: alta = bersaglio (portatore se flusso, palla se forzata) > 6 u, o pallone mai raggiunto con scena completa, o (B) forte con bersaglio > 3 u; media = due o più indicatori, o bersaglio > 3 u, o (B); bassa = un solo indicatore lieve; ok = nessuno. È una scala del collaudo, non del PO.

**Campioni.**
| Campione | Partite | Record | Scartati | Giudicabili |
|---|---|---|---|---|
| Flusso vero, **tempo di scena reale** (riferimento) | 6 (K21–26, 412×915) | 26 | 9 «code» (il seguitore leggeva i fotogrammi residui della scena precedente: errore dello strumento) | **17** |
| Flusso vero, clock tappato (controllo) | 17 (K1–12 a 412×915, K13–17 a 260×460) | 67 | 16 code | **50** (+1 col gesto mai arrivato a piena estensione) |
| Forzate: le 30 SITUATIONS `type:'def'` (azione 0) + azioni 1 e 2 di gi33/133/134/138/168 | 40 pagine nuove | 40 | 0 | **40** |

In totale **67 scene difensive di flusso giudicate** (17 + 50, partite distinte) più 40 forzate. Foto in `docs/collaudi/foto-difesa-220/` (avvio · contatto · +1 s per ogni scena, JPEG; sottocartelle `flusso-reale/`, `flusso-clock-tappato/`, `forzate/`), dati grezzi compressi in `docs/collaudi/dati-difesa-220/`.

## 3. Tabelle per scena

Leggenda colonne: *d eroe–portatore / eroe–palla* in u; *Chi ha il pallone* = a +1 s e a +2 s dal contatto (†: scena chiusa prima di +2 s, vale l'ultimo fotogramma; «nessuno (a/b)» = distanza del nostro più vicino / del loro più vicino); *Esito = 3D?*: sì · **NO** (smentita netta) · indet. (nessuno entro 3 u). ⚠ = compenetrazione.

## Tabella A — scene difensive del FLUSSO VERO (partite S12, autoplay seedato, GLB acceso, tempo di scena = tempo reale `__CPM_DTREAL`)

| Scena | Etichetta (gesto) | d eroe–portatore / eroe–palla al contatto (u) | Ritardo palla (s) | Distanza minima eroe–avversario / eroe–palla (u) | Esito dichiarato | Chi ha il pallone nel 3D | Esito = 3D? | Gravità |
|---|---|---|---|---|---|---|---|---|
| V-k21-s1 | 🛑 Chiusura immediata (lunge) | 4,8 / 1,5 | 0 | 2,71 / 1,5 | fallita (deflected_out) | +1 s nessuno (7,2/10,6) · +2 s nessuno (10/9,3) | indet. | media |
| V-k21-s3 | 💪 Contrasto pulito senza fallo (lunge) | 6,5 / 0,7 | 0 | 5,75 / 0,66 | recuperata | +1 s nostro#8 · +2 s nostro#9 | sì | alta |
| V-k22-s1 | 🛑 Chiusura immediata (lunge) | 2,3 / 1,4 | 0 | 1,44 / 1,38 | fallita (beaten) | +1 s avv#15 · +2 s avv#16 | sì | ok |
| V-k22-s3 | 🛡️ Scivolata netta (slide) | 3 / 2,5 | >scena | 2,5 / 2,54 | recuperata | +1 s nessuno (3,4/5,8) · +2 s nostro#5 † | sì | bassa |
| V-k23-s1 | 🛡️ Scivolata netta (slide) | 6,7 / 4,6 | 0,59 | 1,26 / 0,54 | fallita (deflected_out) | +1 s nessuno (3,4/5,8) · +2 s nessuno (3,3/3,5) | indet. | alta |
| V-k23-s3 | 🤼 Raddoppio coordinato col compagno (lunge) | 7,4 / 6,4 | mai | 3,36 / 3,08 | fallita (deflected_out) | +1 s nessuno (7,1/7,1) · +2 s nessuno (9,3/7,5) | indet. | alta |
| V-k23-s4 | 🛡️ Scivolata netta (slide) | 5,1 / 4,5 | 0,34 | 3,43 / 0,51 | fallita (deflected_out) | +1 s nessuno (3,2/7) · +2 s nessuno (7,1/5,8) | indet. | media |
| V-k24-s1 | 💪 Contrasto pulito senza fallo (lunge) | 4,8 / 7,1 | 0,55 | 2,58 / 1,71 | recuperata | +1 s eroe · +2 s nessuno (3,8/5,7) † | indet. | media |
| V-k24-s2 | 🛡️ Scivolata netta (slide) | 6,2 / 4,9 | 0,44 | 1,83 / 0,91 | fallita (beaten) | +1 s avv#11 · +2 s nessuno (6,3/4,4) | indet. | alta |
| V-k25-s1 | 💪 Contrasto pulito senza fallo (lunge) | 3 / 2 | mai | 0,51 / 2,05 | fallita (missed) | +1 s avv#16 · +2 s avv#15 | sì | alta |
| V-k25-s3 | 🛑 Chiusura immediata (lunge) | 3,4 / 11,1 | mai | 2,35 / 2,72 | recuperata | +1 s nessuno (3/7,3) · +2 s nessuno (7,5/7,3) | indet. | alta |
| V-k25-s4 | 💪 Contrasto pulito senza fallo (lunge) | 5,8 / 3,1 | 0,17 | 2,47 / 0,95 | recuperata | +1 s eroe · +2 s nessuno (3,7/5,8) | indet. | media |
| V-k25-s5 | 🛑 Chiusura immediata (lunge) | 2,6 / 0,7 | 0 | 1,06 / 0,38 | recuperata | +1 s nostro#8 · +2 s avv#16 | **NO** | media |
| V-k26-s1 | 💪 Contrasto pulito senza fallo (lunge) | 2 / 4,5 | 0,5 | 2,04 / 1,27 | recuperata | +1 s eroe · +2 s avv#17 | **NO** | alta |
| V-k26-s2 | 💪 Contrasto pulito senza fallo (lunge) | 5,4 / 1,5 | 0 | 2,24 / 1,55 | fallita (beaten) | +1 s nessuno (5,2/7,3) · +2 s nostro#8 | **NO** | alta |
| V-k26-s4 | 🧠 Anticipa sul primo controllo (lunge) | 6,8 / 7,6 | mai | 0,97 / 7,65 | fallita (beaten) | +1 s nessuno (10/9,8) · +2 s nessuno (10/10) | indet. | alta |
| V-k26-s6 | 🛡️ Scivolata netta (slide) | 9,9 / 8,1 | mai | 0,92 / 4,09 | fallita (missed) | +1 s nessuno (8,2/8) · +2 s nessuno (12,5/10,2) | indet. | alta |

† scena chiusa prima di +2 s dal contatto: «+2 s» è l'ultimo fotogramma disponibile.

**Flusso vero** — 17 scene giudicabili + 0 con il gesto mai arrivato a piena estensione nella scena (9 code duplicate dello strumento scartate).

- eroe–portatore al contatto: mediana 5,1 u · p75 6,5 u · max 9,9 u · oltre 3 u: 12/17 (71%) (scene col portatore come bersaglio)
- eroe–palla al contatto: mediana 4,5 u · p75 6,4 u · oltre 3 u: 10/17 (59%)
- eroe–portatore a inizio gesto: mediana 5,3 u
- ritardo contatto→pallone entro 2 u: mediana 0,17 s fra le 11 scene in cui arriva · oltre 0,6 s: 0/17 (0%) · **mai entro 2 s** (scene con ≥2 s dopo il contatto): 5/15 (33%)
- distanza minima eroe–avversario mai sotto 2 u: 10/17 (59%) · compenetrazione (corpi <0,5 u o pallone <0,25 u dal centro eroe): 0/17 (0%)
- **Casi (A)** (almeno un indicatore di non-arrivo: lontano/palla>3u/mai/tardi/compenetra): 15/17 (88%)
- **Casi (B) forti** (esito dichiarato smentito dal possesso a +2 s entro 3 u): 3/17 (18%) · indeterminati (nessuno entro 3 u a +2 s): 10/17 (59%)
- (A) e (B) insieme: 2/17 (12%)
- per esito dichiarato — recuperate: 7 scene, eroe–palla >3 u al contatto 4, scena ≥2 s dopo il contatto 5; fallite: 10 scene, eroe–palla >3 u 6, scena ≥2 s 10
- (B) sulle sole scene con esito completo (≥2 s dopo il contatto): forti 3/15, indeterminati 9/15

## Tabella B — scene SITUATIONS di tipo `def` FORZATE (pagina nuova per scena)

| Scena | Etichetta (gesto) | d eroe–portatore / eroe–palla al contatto (u) | Ritardo palla (s) | Distanza minima eroe–avversario / eroe–palla (u) | Esito dichiarato | Chi ha il pallone nel 3D | Esito = 3D? | Gravità |
|---|---|---|---|---|---|---|---|---|
| F-gi31-k0 | 🛡️ Scivolata netta (slide) | n/d / 5,9 | 0,37 | 11,89 / 0,69 | recuperata | +1 s nessuno (3/18,4) · +2 s nessuno (4,9/9,9) | indet. | media |
| F-gi32-k0 | ✋ Anticipo di posizione (lunge) | n/d / 3,8 | 0,27 | 3,77 / 0,37 | recuperata | +1 s eroe · +2 s nessuno (4,6/8,4) | indet. | media |
| F-gi33-k0 | 🧱 Blocca con il corpo (lunge) | n/d / 5 | mai | 27,85 / 1,84 | fallita (deflected_out) | +1 s nessuno (7,2/51,7) · +2 s nessuno (7,3/42,9) | indet. | alta |
| F-gi34-k0 | 🏃 Pressing aggressivo (press) | n/d / 4,2 | 0,22 | 3,06 / 0,17 ⚠ PALLA | recuperata | +1 s eroe · +2 s avv#16 | **NO** | alta |
| F-gi35-k0 | ⚡ Sprint di rientro (press) | n/d / 9,2 | mai | 19,49 / 4,6 | fallita (beaten) | +1 s nessuno (3,8/29,5) · +2 s nessuno (6,6/21,6) | indet. | alta |
| F-gi36-k0 | ✈️ Stacco di testa (—) | n/d / 0,9 | 0 | 33,74 / 0,61 | recuperata | +1 s nessuno (9,1/27,5) · +2 s nessuno (12,5/20,3) | indet. | bassa |
| F-gi44-k0 | ✈️ Stacco di testa deciso (—) | n/d / 1,1 | 0 | 25,89 / 0,5 | fallita | +1 s nessuno (6,4/51,3) · +2 s nessuno (7,2/43,5) | indet. | bassa |
| F-gi45-k0 | 🧱 Corpo sulla traiettoria (lunge) | n/d / 3,2 | 0,54 | 40,43 / 0,25 ⚠ PALLA | recuperata | +1 s eroe · +2 s nessuno (5,4/42,2) | indet. | media |
| F-gi54-k0 | 🏃 Pressing aggressivo (press) | n/d / 5,2 | mai | 0,99 / 1,15 | fallita (beaten) | +1 s nessuno (7/4,8) · +2 s avv#16 | sì | alta |
| F-gi127-k0 | 💪 Contrasto duro sull'avversario (press) | n/d / 3,8 | 0,27 | 3,24 / 0,99 | recuperata | +1 s eroe · +2 s nessuno (4,9/4,3) | indet. | media |
| F-gi128-k0 | 🛑 Chiusura immediata (press) | n/d / 9 | mai | 13,69 / 2,97 | recuperata | +1 s nostro#4 · +2 s nostro#4 | sì | alta |
| F-gi129-k0 | 🤼 Raddoppio coordinato col compagno (press) | n/d / 2,8 | 0,15 | 14,1 / 0,16 ⚠ PALLA | recuperata | +1 s eroe · +2 s nessuno (3,7/16,4) | indet. | bassa |
| F-gi130-k0 | ✋ Anticipo sulla traiettoria (press) | n/d / 24,2 | mai | 14,41 / 10,44 | recuperata | +1 s nostro#5 · +2 s nostro#5 | sì | alta |
| F-gi131-k0 | 🛡️ Fallo intelligente in zona (press) | n/d / 10,2 | 0,63 | 2,81 / 0,3 | recuperata | +1 s nostro#7 · +2 s nostro#7 | sì | alta |
| F-gi132-k0 | 🧱 Blocco col corpo sulla traiettoria (lunge) | n/d / 10,8 | mai | 37,48 / 0,76 | recuperata | +1 s nostro#2 · +2 s nostro#2 | sì | alta |
| F-gi133-k0 | 🏃 Sprint disperato sulla linea (press) | n/d / 21,1 | 0,64 | 42,07 / 0,08 ⚠ PALLA | recuperata | +1 s eroe · +2 s nessuno (6,9/36,1) | indet. | alta |
| F-gi134-k0 | ✈️ Stacco dominante (—) | n/d / 1 | 0 | 11,88 / 0,26 | recuperata | +1 s nostro#3 · +2 s nostro#3 | sì | bassa |
| F-gi135-k0 | 🤝 Copro la sua posizione (press) | n/d / 20,8 | mai | 25,87 / 9,15 | fallita (beaten) | +1 s nessuno (7/24,7) · +2 s nessuno (5,2/18,4) | indet. | alta |
| F-gi136-k0 | 🛑 Blocca il cross con il corpo (—) | n/d / 5,2 | mai | 25,52 / 2,44 | recuperata | +1 s nostro#2 · +2 s nostro#2 | sì | alta |
| F-gi137-k0 | ⚡ Tackle in corsa preciso (press) | n/d / 19,1 | mai | 8,96 / 14,15 | fallita (beaten) | +1 s nessuno (14,2/7,1) · +2 s nessuno (18,7/11,1) | indet. | alta |
| F-gi138-k0 | 📣 Allineamento difensivo immediato (press) | n/d / 8,9 | 0,32 | 34,97 / 0,58 | fallita (missed) | +1 s nessuno (5,8/46,9) · +2 s eroe | **NO** | alta |
| F-gi139-k0 | 🏃 Pressing a zona coordinato (press) | n/d / 12,3 | mai | 1,56 / 5,4 | fallita (beaten) | +1 s nessuno (5,4/8,8) · +2 s nessuno (12,7/9,7) | indet. | alta |
| F-gi146-k0 | 🛡️ Blocca con tutto il fisico (press) | n/d / 30,9 | mai | 18,16 / 21,51 | fallita (beaten) | +1 s avv#19 · +2 s nessuno (17,5/4,3) | indet. | alta |
| F-gi155-k0 | 🧠 Anticipi la giocata avversaria (press) | n/d / 16,9 | mai | 3,17 / 11,11 | fallita (beaten) | +1 s nessuno (11,2/6,9) · +2 s avv#17 | sì | alta |
| F-gi157-k0 | 🤸 Gettati sulla traiettoria (lunge) | n/d / 5,3 | mai | 31,74 / 2,29 | fallita (beaten) | +1 s nessuno (7,7/57,2) · +2 s nessuno (7,6/48,5) | indet. | alta |
| F-gi168-k0 | 🛡️ Tackle duro — rischio rosso (slide) | n/d / 5,9 | mai | 20,92 / 2,13 | recuperata | +1 s eroe · +2 s nessuno (3,2/19,7) | indet. | alta |
| F-gi183-k0 | 🧠 Anticipa il pallone sulla punta (press) | n/d / 15,9 | mai | 1,78 / 10,74 | fallita (beaten) | +1 s nessuno (10,8/8,1) · +2 s avv#17 | sì | alta |
| F-gi184-k0 | ✋ Intercetta il filtrante (lunge) | n/d / 9,6 | 0,51 | 8,9 / 1,3 | recuperata | +1 s nostro#2 · +2 s nostro#2 | sì | alta |
| F-gi189-k0 | 🧠 Anticipa sul primo controllo (lunge) | n/d / 5 | mai | 1,34 / 4,83 | fallita (missed) | +1 s nessuno (7,1/7,5) · +2 s nessuno (7,9/9,5) | indet. | alta |
| F-gi190-k0 | ✋ Intercetta lo scarico centrale (press) | n/d / 26,2 | mai | 11,82 / 21,03 | fallita (deflected_out) | +1 s nessuno (12,8/8,5) · +2 s nessuno (18,5/4) | indet. | alta |
| F-gi33-k1 | ✋ Devia col piede (press) | n/d / 25,5 | mai | 31,44 / 8,89 | recuperata | +1 s nostro#3 · +2 s nostro#3 | sì | alta |
| F-gi33-k2 | 📣 Chiama il portiere (call) | n/d / 1,9 | 0 | 24,52 / 1,86 | fallita (beaten) | +1 s nessuno (7,2/48,1) · +2 s nessuno (7,3/39,5) | indet. | ok |
| F-gi133-k1 | ✋ Intercetto prima del fondo (lunge) | n/d / 4,4 | 0,38 | 43,25 / 0,41 | recuperata | +1 s eroe · +2 s nessuno (6,1/40,7) | indet. | media |
| F-gi133-k2 | 📣 Chiamo il portiere (call) | n/d / 28,1 | mai | 39,87 / 25,68 | fallita (beaten) | +1 s nessuno (7,1/50) · +2 s nessuno (7,2/41,4) | indet. | alta |
| F-gi134-k1 | 💪 Contrasto fisico in volo (press) | n/d / 3,2 | mai | 17,76 / 2,3 | recuperata | +1 s eroe · +2 s nessuno (5,9/19) | indet. | alta |
| F-gi134-k2 | 📣 Chiamo il portiere (call) | n/d / 2,4 | mai | 17,28 / 1,62 | recuperata | +1 s gk-nostro#0 · +2 s gk-nostro#0 | sì | alta |
| F-gi138-k1 | 💪 Contrasto fisico duro (press) | n/d / 4,5 | mai | 32,72 / 4,47 | fallita (beaten) | +1 s nessuno (6,6/51,2) · +2 s nessuno (7,9/42,6) | indet. | alta |
| F-gi138-k2 | ⚡ Pressing immediato sul portatore (press) | n/d / 46,5 | mai | 35,74 / 38,26 | fallita (beaten) | +1 s nessuno (15,8/4,6) · +2 s nessuno (9,2/6,2) | indet. | alta |
| F-gi168-k1 | ⚡ Sprint laterale preventivo (press) | n/d / 32,3 | mai | 21,49 / 24,06 | fallita (beaten) | +1 s nessuno (15,9/3,6) · +2 s nessuno (10,1/7,8) | indet. | alta |
| F-gi168-k2 | 📣 Guida i compagni e copri (press) | n/d / 17,8 | mai | 21,77 / 2,38 | recuperata | +1 s nostro#2 · +2 s nostro#2 | sì | alta |

**Forzate** — 40 scene giudicabili + 0 con il gesto mai arrivato a piena estensione nella scena (0 code duplicate dello strumento scartate).

- eroe–portatore: non misurabile nelle forzate (il motore non dichiara il portatore)
- eroe–palla al contatto: mediana 5,9 u · p75 19,1 u · oltre 3 u: 34/40 (85%)
- ritardo contatto→pallone entro 2 u: mediana 0,27 s fra le 15 scene in cui arriva · oltre 0,6 s: 2/40 (5%) · **mai entro 2 s** (scene con ≥2 s dopo il contatto): 25/40 (63%)
- distanza minima eroe–avversario mai sotto 2 u: 36/40 (90%) · compenetrazione (corpi <0,5 u o pallone <0,25 u dal centro eroe): 4/40 (10%)
- **Casi (A)** (almeno un indicatore di non-arrivo: lontano/palla>3u/mai/tardi/compenetra): 36/40 (90%)
- **Casi (B) forti** (esito dichiarato smentito dal possesso a +2 s entro 3 u): 2/40 (5%) · indeterminati (nessuno entro 3 u a +2 s): 25/40 (63%)
- (A) e (B) insieme: 2/40 (5%)
- per esito dichiarato — recuperate: 21 scene, eroe–palla >3 u al contatto 17, scena ≥2 s dopo il contatto 21; fallite: 19 scene, eroe–palla >3 u 17, scena ≥2 s 19
- (B) sulle sole scene con esito completo (≥2 s dopo il contatto): forti 2/40, indeterminati 25/40

**Forzate per famiglia** (bersaglio dell'eroe): portatore: 19 scene, eroe–palla al contatto mediana 9 u, (A) 19, (B) 2 · linea-passaggio: 4 scene, eroe–palla al contatto mediana 9,6 u, (A) 4, (B) 0 · tiro-in-volo: 7 scene, eroe–palla al contatto mediana 5,2 u, (A) 6, (B) 0 · rientro-copertura: 5 scene, eroe–palla al contatto mediana 20,8 u, (A) 5, (B) 0 · aereo: 5 scene, eroe–palla al contatto mediana 1,1 u, (A) 2, (B) 0

## Tabella C — flusso vero a clock di scena tappato (dt ≤ 0,05 s, ~7 fps headless): campione di controllo

<details><summary>Righe per scena (67 record)</summary>

| Scena | Etichetta (gesto) | d eroe–portatore / eroe–palla al contatto (u) | Ritardo palla (s) | Distanza minima eroe–avversario / eroe–palla (u) | Esito dichiarato | Chi ha il pallone nel 3D | Esito = 3D? | Gravità |
|---|---|---|---|---|---|---|---|---|
| V-k1-s1 | 🛑 Chiusura immediata (lunge) | 3,7 / 1,4 | 0 | 0,57 / 0,84 | recuperata | +1 s eroe · +2 s eroe † | sì | media |
| V-k1-s2 | 🛑 Chiusura immediata (lunge) | 3,6 / 1,1 | 0 | 3,32 / 0,55 | fallita (beaten) | +1 s nessuno (8,1/10,3) · +2 s nessuno (6,7/6,3) | indet. | media |
| V-k2-s1 | 🛑 Chiusura immediata (lunge) | 6 / 10 | mai | 3,81 / 4,59 | fallita (beaten) | +1 s avv#13 · +2 s avv#13 | sì | alta |
| V-k2-s2 | 🤼 Raddoppio coordinato col compagno (lunge) | 8,8 / 7,8 | mai | 3,01 / 6,65 | fallita (beaten) | +1 s nessuno (7,7/10) · +2 s nessuno (12,3/12,8) | indet. | alta |
| V-k2-s3 | 🛑 Chiusura immediata (lunge) | 7 / 1,6 | 0 | 4,05 / 0,44 | fallita (beaten) | +1 s avv#16 · +2 s avv#16 | sì | alta |
| V-k2-s4 | 🛡️ Scivolata netta (slide) | 9,9 / 10,8 | mai | 6 / 2,12 | fallita (beaten) | +1 s nessuno (3,6/5,4) · +2 s nessuno (5,1/4,9) | indet. | alta |
| V-k3-s1 | 🧠 Anticipa sul primo controllo (lunge) | 9,7 / 11,7 | mai | 1,29 / 1,35 | fallita (deflected_out) | +1 s nostro#5 · +2 s nessuno (5,3/12,2) | indet. | alta |
| V-k3-s2 | 🛑 Chiusura immediata (lunge) | 3,4 / 0,9 | 0 | 2,02 / 0,54 | fallita (beaten) | +1 s nostro#6 · +2 s nessuno (6,4/3,5) | indet. | media |
| V-k3-s4 | 🛑 Chiusura immediata (lunge) | 9 / 1,3 | 0 | 4,65 / 1,08 | fallita (beaten) | +1 s nessuno (8,4/9,1) · +2 s nessuno (11,7/10,2) | indet. | alta |
| V-k4-s1 | 🛑 Chiusura immediata (lunge) | 3,5 / 4,1 | >scena | 2,98 / 4,11 | recuperata | +1 s nessuno (4,1/6,8) · +2 s nessuno (4,1/6,8) † | indet. | media |
| V-k4-s2 | 🧠 Anticipa sul primo controllo (lunge) | 3,6 / 1,1 | 0 | 3,25 / 0,42 | recuperata | +1 s nessuno (4,1/8,2) · +2 s nessuno (4,1/8,2) † | indet. | media |
| V-k5-s1 | 🧠 Anticipa sul primo controllo (lunge) | 4,4 / 1,1 | 0 | 0,7 / 0,99 | fallita (deflected_out) | +1 s nessuno (10,6/15,6) · +2 s nessuno (3,9/14,6) | indet. | media |
| V-k5-s3 | 🤼 Raddoppio coordinato col compagno (lunge) | 1,9 / 1,3 | 0 | 1,13 / 0,52 | recuperata | +1 s nostro#5 · +2 s nostro#5 † | sì | ok |
| V-k5-s4 | 🧠 Anticipa sul primo controllo (lunge) | 8 / 2,5 | >scena | 5,84 / 0,22 ⚠ PALLA | recuperata | +1 s nostro#8 · +2 s nostro#8 † | sì | alta |
| V-k6-s1 | 💪 Contrasto pulito senza fallo (lunge) | 3,1 / 3,8 | >scena | 2,23 / 0,81 | recuperata | +1 s nostro#8 · +2 s nostro#8 † | sì | media |
| V-k6-s2 | 🛑 Chiusura immediata (lunge) | 5,9 / 9,4 | mai | 0,17 / 5,94 ⚠ CORPO | fallita (beaten) | +1 s nessuno (10,1/3,4) · +2 s avv#13 | sì | alta |
| V-k6-s3 | 🛡️ Scivolata netta (slide) | 2,8 / 3,3 | >scena | 2,02 / 2,27 | recuperata | +1 s nessuno (3,3/4,6) · +2 s nessuno (3,3/4,6) † | indet. | media |
| V-k6-s4 | 🛡️ Scivolata netta | — | — | — | — | — | — | non giudicabile |
| V-k7-s1 | 🧠 Anticipa sul primo controllo (lunge) | 5,3 / 7,1 | mai | 3,78 / 4,71 | fallita (beaten) | +1 s nessuno (12,4/9) · +2 s nessuno (15/11,4) | indet. | alta |
| V-k8-s1 | 🛑 Chiusura immediata (lunge) | 1,8 / 1 | 0 | 0,96 / 0,95 | fallita (deflected_out) | +1 s nessuno (10,9/6,1) · +2 s nessuno (7,1/8,6) | indet. | ok |
| V-k8-s3 | 🛡️ Scivolata netta (slide) | 1,3 / 1,3 | 0 | 0,14 / 0,54 ⚠ CORPO | recuperata | +1 s nostro#8 · +2 s nostro#8 † | sì | bassa |
| V-k8-s4 | 🤼 Raddoppio coordinato col compagno (lunge) | 1,8 / 1,2 | 0 | 0,58 / 0,59 | fallita (deflected_out) | +1 s avv#17 · +2 s avv#17 | sì | ok |
| V-k9-s1 | 🛡️ Scivolata netta (slide) | 7,7 / 7 | mai | 1,92 / 3,93 | fallita (deflected_out) | +1 s nessuno (4,7/10,7) · +2 s nessuno (9,8/7,7) | indet. | alta |
| V-k9-s2 | 🛑 Chiusura immediata (lunge) | 7,8 / 1,1 | 0 | 5,39 / 0,59 | recuperata | +1 s nessuno (5,4/5) · +2 s nessuno (5,4/5) † | indet. | alta |
| V-k9-s3 | 🛑 Chiusura immediata (lunge) | 4,9 / 8,3 | mai | 1,2 / 2,32 | fallita (deflected_out) | +1 s avv#12 · +2 s nessuno (4,7/3,2) | indet. | alta |
| V-k10-s1 | 🤼 Raddoppio coordinato col compagno (lunge) | 5,8 / 1,4 | 0 | 2,46 / 0,41 | recuperata | +1 s nostro#8 · +2 s nostro#8 † | sì | media |
| V-k10-s2 | 🤼 Raddoppio coordinato col compagno (lunge) | 3,2 / 1,2 | 0 | 2,78 / 0,35 | recuperata | +1 s nostro#5 · +2 s nostro#5 † | sì | media |
| V-k11-s1 | 🛡️ Scivolata netta (slide) | 2,6 / 3,1 | 0,27 | 0,21 / 0,59 ⚠ CORPO | recuperata | +1 s eroe · +2 s eroe † | sì | media |
| V-k11-s2 | 💪 Contrasto pulito senza fallo (lunge) | 4,7 / 1,4 | 0 | 2,64 / 0,52 | recuperata | +1 s nostro#8 · +2 s nostro#8 † | sì | media |
| V-k11-s3 | 💪 Contrasto pulito senza fallo (lunge) | 5,5 / 1,1 | 0 | 5,34 / 0,27 | fallita (beaten) | +1 s nessuno (13/9,9) · +2 s nessuno (12/7,7) | indet. | media |
| V-k11-s5 | 🤼 Raddoppio coordinato col compagno (lunge) | 5 / 1,3 | 0 | 3,79 / 0,36 | recuperata | +1 s nostro#8 · +2 s nostro#8 † | sì | media |
| V-k11-s6 | 🤼 Raddoppio coordinato col compagno (lunge) | 4,7 / 0,3 | 0 | 4,59 / 0,35 | recuperata | +1 s nostro#8 · +2 s nostro#8 † | sì | media |
| V-k12-s1 | 🛑 Chiusura immediata (lunge) | 1,3 / 5,8 | 0,22 | 0,46 / 1,06 ⚠ CORPO | fallita (beaten) | +1 s avv#11 · +2 s eroe | **NO** | alta |
| V-k12-s2 | 🛡️ Scivolata netta (slide) | 5,1 / 2 | 0 | 4,08 / 1,04 | recuperata | +1 s eroe · +2 s eroe † | sì | media |
| V-k12-s3 | 🛡️ Scivolata netta (press) | 6 / 10 | mai | 3,74 / 8,65 | fallita (beaten) | +1 s nessuno (12,1/6,9) · +2 s nessuno (14,4/15,5) | indet. | alta |
| V-k12-s5 | 💪 Contrasto pulito senza fallo (lunge) | 2,3 / 0,9 | 0 | 1,79 / 0,73 | fallita (beaten) | +1 s avv#17 · +2 s avv#17 | sì | ok |
| V-k13-s1 | 🛑 Chiusura immediata (lunge) | 7,3 / 7 | mai | 0,59 / 3,75 | fallita (deflected_out) | +1 s avv#17 · +2 s nessuno (6,3/3) | indet. | alta |
| V-k13-s3 | 🛑 Chiusura immediata (lunge) | 2,1 / 1,3 | 0 | 1 / 0,58 | recuperata | +1 s nostro#9 · +2 s nostro#9 † | sì | ok |
| V-k13-s4 | 🧠 Anticipa sul primo controllo (lunge) | 2,5 / 0,9 | 0 | 2,14 / 0,27 | recuperata | +1 s eroe · +2 s eroe † | sì | ok |
| V-k14-s1 | 🧠 Anticipa sul primo controllo (lunge) | 4,7 / 1,4 | 0 | 0,52 / 0,65 | fallita (beaten) | +1 s nessuno (11,8/13,1) · +2 s nessuno (8,1/14,1) | indet. | media |
| V-k14-s3 | 💪 Contrasto pulito senza fallo (lunge) | 1,7 / 1 | 0 | 1,24 / 0,64 | fallita (beaten) | +1 s nessuno (5,9/7,2) · +2 s nessuno (5,6/6,4) | indet. | ok |
| V-k14-s5 | 💪 Contrasto pulito senza fallo (lunge) | 5,6 / 4,7 | 0,34 | 4,89 / 1,79 | recuperata | +1 s eroe · +2 s eroe † | sì | media |
| V-k15-s1 | 🧠 Anticipa sul primo controllo (lunge) | 1,3 / 1,1 | 0 | 1,07 / 0,31 | fallita (beaten) | +1 s nessuno (22,6/13,2) · +2 s nessuno (19,4/11,9) | indet. | ok |
| V-k15-s3 | 💪 Contrasto pulito senza fallo (lunge) | 2,8 / 1,1 | 0 | 2,81 / 0,41 | fallita (beaten) | +1 s nessuno (10,8/13,1) · +2 s nessuno (10,4/10,6) | indet. | ok |
| V-k15-s5 | 🛑 Chiusura immediata (lunge) | 2,8 / 5,8 | mai | 0,91 / 0,6 | fallita (beaten) | +1 s nessuno (13,9/12,2) · +2 s nessuno (13,7/10,1) | indet. | alta |
| V-k16-s1 | 🛡️ Scivolata netta (slide) | 4,3 / 4,1 | 0,28 | 2,04 / 1,61 | fallita (beaten) | +1 s nessuno (6,5/8,9) · +2 s nessuno (7,6/9,4) | indet. | media |
| V-k16-s3 | 🧠 Anticipa sul primo controllo (lunge) | 3,2 / 8,2 | mai | 2,69 / 1,65 | fallita (missed) | +1 s nessuno (6,3/5,2) · +2 s avv#12 | sì | alta |
| V-k16-s4 | 🧠 Anticipa sul primo controllo (lunge) | 5,7 / 1,4 | 0 | 5,51 / 1,37 | recuperata | +1 s nessuno (6,1/7,7) · +2 s nessuno (6,1/7,7) † | indet. | media |
| V-k17-s1 | 🧠 Anticipa sul primo controllo (lunge) | 5,8 / 8,3 | mai | 2,69 / 6,8 | fallita (beaten) | +1 s nessuno (7,6/5,4) · +2 s nessuno (12,1/4,9) | indet. | alta |
| V-k17-s2 | 💪 Contrasto pulito senza fallo (lunge) | 6 / 1 | 0 | 5,17 / 0,87 | recuperata | +1 s eroe · +2 s eroe † | sì | media |
| V-k17-s3 | 🛡️ Scivolata netta (slide) | 9,9 / 8,8 | mai | 0,32 / 7,4 ⚠ CORPO | fallita (missed) | +1 s nessuno (10,7/4,9) · +2 s nessuno (15/4,7) | indet. | alta |

</details>

**Flusso vero, clock tappato** — 50 scene giudicabili + 1 con il gesto mai arrivato a piena estensione nella scena (16 code duplicate dello strumento scartate).

- eroe–portatore al contatto: mediana 4,7 u · p75 6 u · max 9,9 u · oltre 3 u: 36/50 (72%) (scene col portatore come bersaglio)
- eroe–palla al contatto: mediana 1,4 u · p75 7 u · oltre 3 u: 21/50 (42%)
- eroe–portatore a inizio gesto: mediana 4,8 u
- ritardo contatto→pallone entro 2 u: mediana 0 s fra le 32 scene in cui arriva · oltre 0,6 s: 0/50 (0%) · **mai entro 2 s** (scene con ≥2 s dopo il contatto): 14/29 (48%)
- distanza minima eroe–avversario mai sotto 2 u: 30/50 (60%) · compenetrazione (corpi <0,5 u o pallone <0,25 u dal centro eroe): 6/50 (12%)
- **Casi (A)** (almeno un indicatore di non-arrivo: lontano/palla>3u/mai/tardi/compenetra): 41/50 (82%)
- **Casi (B) forti** (esito dichiarato smentito dal possesso a +2 s entro 3 u): 1/50 (2%) · indeterminati (nessuno entro 3 u a +2 s): 27/50 (54%)
- (A) e (B) insieme: 1/50 (2%)
- per esito dichiarato — recuperate: 21 scene, eroe–palla >3 u al contatto 5, scena ≥2 s dopo il contatto 0; fallite: 29 scene, eroe–palla >3 u 16, scena ≥2 s 29
- (B) sulle sole scene con esito completo (≥2 s dopo il contatto): forti 1/29, indeterminati 22/29

**Scene nominate dal PO** (forzate, `__CPM_FORCE_SIT` + `__CPM_RESOLVE`; nelle forzate il portatore non è dichiarato, quindi si legge eroe–palla): gi33 «Muro in area» k0: palla a 5,0 u al contatto, mai raggiunta in 2 s, nessun avversario a meno di 27,9 u dall'eroe; gi133 «Recupero sulla linea di fondo» k0: palla a 21,1 u al contatto, pallone entro 2 u dall'eroe solo a +0,64 s (minimo 0,08 u), a +2 s il pallone è libero (nostri 6,9 u / loro 36,1 u) con riquadro «recuperata»; gi134 «Sfida aerea» k0: palla a 1,0 u, pallone a un nostro (#3) a +1 s e +2 s — **coerente**; gi138 «Allineati con la difesa» k0: palla a 8,9 u, nessun avversario a meno di 35 u, riquadro «fallita (missed)» ma a +2 s il pallone è dell'eroe (**NO**); gi168 «Ultimo uomo» k0: palla a 5,9 u, pallone mai raggiunto, riquadro «Pallone recuperato!», nessun avversario a meno di 20,9 u (foto `forzate/F-gi168-k0-2contatto.jpg`: eroe e pallone, nessun avversario in quadro) e a +2 s pallone libero.

**Foto di riferimento.**
- (A) l'eroe resta a 6 u dall'uomo e il gesto parte lo stesso: `flusso-clock-tappato/V-k2-s2-1avvio|2contatto|3piu1s.jpg` (riquadro «Superato dall'avversario»).
- (B)+ritorno: `flusso-reale/V-k26-s1-1avvio|2contatto|3piu1s.jpg` — banner «Intercetto netto — palla nostra!», ma a +1 s il pallone è fermo, coperto dall'etichetta in basso, l'eroe a 4,7 u e un avversario a 2,7 u.
- (B): `flusso-reale/V-k25-s5-*.jpg` — «recuperata»: il pallone passa a un nostro (#8), poi resta fermo e a +1,7 s un avversario (#16) è a 1,0 u.

## 4. Riepilogo delle quote

| Misura | Flusso, tempo reale (17) | Flusso, clock tappato (50) | Forzate (40) |
|---|---|---|---|
| **(A)** almeno un indicatore di non-arrivo | **15/17 (88%)** | 41/50 (82%) | 36/40 (90%) |
| portatore > 3 u al contatto | 12/17 (71%) | 36/50 (72%) | n/d |
| pallone > 3 u al contatto | 10/17 (59%) | 21/50 (42%) | 34/40 (85%) |
| pallone non raggiunto entro 2 s (scene complete) | 5/15 (33%) | 14/29 (48%) | 25/40 (63%) |
| ritardo contatto→pallone > 0,6 s | 0/17 | 0/50 | 2/40 (5%) |
| eroe–avversario mai sotto 2 u | 10/17 (59%) | 30/50 (60%) | 36/40 (90%) |
| compenetrazione (corpi o pallone) | 0/17 | 6/50 (12%) | 4/40 (10%) |
| **(B) forte** (esito smentito dal possesso a +2 s) | **3/17 (18%)** | 1/50 (2%) † | 2/40 (5%) |
| (B) indeterminato (pallone libero a +2 s) | 10/17 (59%) | 27/50 (54%) † | 25/40 (63%) |
| (A) e (B) insieme | 2/17 (12%) | 1/50 (2%) † | 2/40 (5%) |
| l'eroe «torna indietro» (scene complete) | 13/15 (87%) | 27/29 (93%) | non misurato |

† A clock tappato le 21 scene «recuperata» sono tutte chiuse prima di +2 s (0 con esito completo): la quota (B) di quella colonna vale solo per le 29 «fallita». Il riferimento per (B) è la colonna a tempo reale.

**Casi «recuperata» con esito completo (tempo reale, 5):** a +2 s il pallone è di un nostro entro 3 u in 1, di un avversario entro 3 u in 2, libero in 2. **Casi «fallita» (10):** pallone di un avversario entro 3 u in 2, di un nostro in 1 (contraddizione), libero in 7.

**Prevalenza A contro B.** Su 17 scene a tempo reale: solo (A) 13, (A)+(B) 2, solo (B) 1, nessuno dei due 1 (la scena V-k22-s1: eroe a 2,3 u, esito coerente). In sintesi il difetto (A) è **diffuso** (88%), il (B) è **minoritario ma reale** (18%, 3 scene), e il pallone «senza padrone» a fine scena (59%) è il sintomo più frequente sul lato dell'esito.

## 5. Cause (solo dove la misura le dimostra)

Etichette: **Misurata** = la misura isola il meccanismo · **Coerente** = la misura è compatibile e il codice lo spiega, ma non ho eseguito la prova che lo toglie (non posso modificare `src/`) · **Non posso confermarlo**.

**C1 — Il 3D apre la scena con il portatore a ~4,5 u dall'eroe, mentre il motore lo dichiara a ~1 u. [Misurata la discrepanza · causa Coerente]**
- Il motore apre la scena difensiva quando il portatore è entro 4 u dall'eroe: `src/14-motore-possesso.jsx:632` (`hyp(P.x,P.y,H.x,H.y)<=4`). Misurato su 43 scene: **1,1 u** di mediana (p90 1,9; max 3,9) fra `cast.eroe` e `cast.portatore` al momento della dichiarazione.
- La regia 3D porta il portatore a `pPos.x + 4,5 + sin(…)·1,1` davanti all'eroe: `src/15-live-match.jsx:3760` (costante introdotta dal 7.999.84 perché il portatore «attraversava l'eroe»). Misurato all'inizio della fase `hl_result`: **5,1 u** di mediana (p25–p75 3,2–5,9; 35/43 oltre 3 u); la distanza logica `ht`↔`lp[portatore]` è 5,5 u di mediana. L'intervallo 3,4–5,6 u previsto dalla costante coincide con la distribuzione osservata. *Prova diretta (togliere la costante) non eseguita.*
- Corollario misurato (flusso a tempo reale, 17 scene): fra l'inizio del risultato e il contatto (0,6 s di mediana) l'eroe si muove a ~0,9 u/s di mediana; la distanza eroe–portatore è **5,3 u sia all'inizio del risultato sia all'avvio del gesto** (mediane identiche) e il portatore non si sposta nei 0,31 s fra avvio e contatto (mediana 0 u): **la distanza di partenza non viene chiusa dalla corsa**, ma solo dalla spinta del gesto.

**C2 — La spinta del contrasto è un offset temporaneo sul bersaglio: finito il gesto l'eroe torna al punto di partenza. [Misurata]**
- `src/12-three-match-view.jsx:7703` calcola una volta sola, all'avvio del gesto, la spinta verso la palla (tetto 7,5 u, `_tkPush420`); `src/12-three-match-view.jsx:6803–6805` la somma al bersaglio dell'eroe **solo mentre `actType==="tackle"`** (vita 1,7 s). Con `__CPM_HERODRV769` il bersaglio logico dell'eroe è risultato **costante per tutta la scena** (62,3/42,5 e 76,8/44,4 nelle due scene verificate) mentre il mesh esce di 3,5–6 u e rientra entro +2,2–2,6 s. Escursione massima a +0,5…+1,06 s dal contatto, rientro 13/15 (a tempo reale) e 27/29 (a clock tappato).
- Effetto sul pallone «recuperato»: a +2 s l'eroe sta a 3,7–10,5 u dal pallone nelle 5 «recuperate» complete — il giocatore che ha vinto il contrasto si allontana dal pallone che ha vinto.

**C3 — Il gesto parte dopo al più 0,5 s anche se il pallone è lontano; oltre 8 u degrada a pressing. [Coerente]**
- `src/12-three-match-view.jsx:7683` (`_hold415`: attesa tetto 0,5 s, `__CPM_NO_ATT220` la riporta a 1,4 s), `7691–7712` (spinta tetto 7,5 u; degrado a «press» oltre 8 u), `7713` (`actT` parte comunque). Misurato: attesa mediana 0–0,5 s, gesto a piena estensione con l'eroe a 4,5 u dalla palla (mediana) e il pallone mai a meno di 2 u nei 2 s successivi in 5 scene su 15. Nelle scene «fallita» il pallone si sposta di 6–16 u fra avvio del gesto e contatto (passaggio dell'avversario): il gesto cade in uno spazio ormai vuoto. **Non posso confermare** che sia un difetto invece del racconto voluto dell'esito «beaten»: la misura mostra l'effetto, non l'intenzione di design.

**C4 — Pallone libero a fine scena. [Misurato il sintomo · causa: Non posso confermarlo]**
- 59% delle scene a +2 s senza nessuno entro 3 u; nelle «recuperate» complete 2 su 5. Una sonda che attribuisce il padrone del pallone (`__CPM_OWN497`/`__CPM_WS`) non è stata eseguita su queste scene: non so se manchi il «vincitore si prende il pallone» (esiste per il dribbling, `src/12-three-match-view.jsx:7502–7513`, 7.415.0) o se il pallone viene respinto lontano da una traiettoria d'esito.

**Escluso dalla misura:** teletrasporti a scena aperta (nei campioni controllati — K1–6 a clock tappato e K21–26 a tempo reale — nessun salto > 4 u di eroe o portatore oltre al primo fotogramma di `hl_intro`, che è lo snap voluto) · contrasti fuori dalla propria scena (67 contatti su 67 dentro `hl_result`).

## 6. Limiti dichiarati

- **Non è il telefono.** Headless a 7–13 fps; `__CPM_DTREAL` porta il tempo di scena al tempo reale ma con passi di integrazione fino a 0,3 s, più grossolani di un telefono a 30–60 fps. Il collaudo sul dispositivo del PO resta il giudice finale.
- **Campioni piccoli.** 17 scene a tempo reale (5 «recuperate» complete, 10 «fallite»): le quote (B) hanno intervalli ampi (3/17 = 18%, intervallo di Wilson al 95%: 6–41%). Il campione a clock tappato è più grande ma non giudica le «recuperate».
- **Una sola carriera** (salvataggio S12, ovr 93, autoplay con politica «seeded»): non rappresenta altri ruoli.
- **Soglie del collaudo** (3 u, 0,6 s, 0,5 u, 0,25 u, 2 s, 1,5 u): sono mie e dichiarate, non del PO; cambiandole cambiano le percentuali.
- **«Attraversamento»**: l'indicatore (l'eroe supera il portatore in x passando entro 1,5 u di lato; 3/17 a tempo reale + 3/26 a clock tappato) può descrivere anche uno scivolamento legittimo; l'interpenetrazione vera è quella misurata dalla compenetrazione dei centri, 0/17 a tempo reale.
- **Forzate**: la regia posiziona gli attori con regole diverse dal flusso (`src/15-live-match.jsx:3478–3486`: un solo uomo portato a 7 u davanti all'eroe solo se è oltre 8 u); le distanze eroe–avversario (spesso > 20 u) non sono rappresentative del gioco vero.
- Le scene «code» (25 record) sono un errore del mio seguitore (leggeva i fotogrammi residui della scena precedente), scartate; i due campioni di flusso non hanno record in comune.
- Foto: scattate dopo un breve ritardo dalla rilevazione del contatto (qualche fotogramma): l'istante esatto è nei dati, non nell'immagine.

## 7. Proposta di correzione e guardiano che la misurerebbe

*(Non applicata: il collaudo è solo misura. Le proposte sono per il PO e per il giro di sviluppo.)*

| # | Intervento proposto | Dove | Guardiano (misura) | Prova del rosso |
|---|---|---|---|---|
| P1 | Portatore a ~1,6–2,0 u davanti all'eroe invece di 4,5 u (tenendo la garanzia del 7.999.84: mai oltre l'eroe) | `src/15-live-match.jsx:3760` | **`difesa-220-contatto`**: su ≥ 20 scene di flusso a tempo reale, eroe–portatore al contatto ≤ 2,5 u in ≥ 80% e mediana ≤ 2,0 u; compenetrazione 0 | ripristinare la costante 4,5 (`__CPM_NO_PALLA84` esiste per la versione precedente; serve un interruttore dedicato) → mediana ~5 u |
| P2 | Dopo il contatto l'eroe non rientra: la spinta diventa nuovo punto di appoggio (o la scena rilascia il bersaglio logico) fino alla chiusura dell'esito | `src/12-three-match-view.jsx:6803–6805`, `7703` | stesso guardiano: a +2 s distanza dal punto di partenza ≥ 50% dell'escursione in ≥ 75% delle scene complete; eroe–palla a +2 s ≤ 3 u nelle «recuperate» | interruttore → tornano 13/15 |
| P3 | Chiudere l'esito «recuperata» sul pallone: il vincitore lo prende e lo porta (come per il dribbling) | `src/12-three-match-view.jsx` (post-contrasto, cfr. 7502–7513) | stesso guardiano: «recuperata» ⇒ nostro entro 1,5 u a +2 s ≥ 80%, mai un avversario entro 3 u; «fallita» ⇒ avversario entro 3 u o pallone fuori, mai un nostro entro 3 u | interruttore → «recuperata» 1/5 come oggi |
| P4 | (da decidere col PO) il gesto di contrasto non parte «nel vuoto»: se il pallone si è allontanato oltre 5 u fra avvio e contatto, degradare a pressing già al contatto (non solo all'avvio) | `src/12-three-match-view.jsx:7712` | indicatore «pallone > 3 u al contatto» ≤ 25% | — |

**Forma del guardiano `difesa-220-contatto`.** Una sonda non-gate sul flusso vero (`tests/visual/collaudo-difesa-220-3d.mjs` è già la base: stesse misure, `DTREAL=1`, `OGNI=6`), 6 partite ≈ 30 minuti con GL software: troppo lenta per la catena `mirata`, adatta alla catena `notte`. Soglie dichiarate, **pavimento di copertura** (≥ 20 scene con contatto, altrimenti esce ≠ 0 dichiarando la copertura insufficiente), tempo di scena reale obbligatorio (a clock tappato le «recuperate» vengono tagliate prima di +2 s e il guardiano sarebbe cieco), e **prova del rosso** con un interruttore dedicato per ogni intervento (verde 3/3, rosso 3/3 come negli altri guardiani del repo). Una variante rapida e deterministica per la CI: aprire una scena difensiva del motore con `__CPM_DIF220_OGNI=1`, leggere la distanza eroe–portatore al primo fotogramma di `hl_result` (si misura in pochi secondi dopo il primo minuto utile) e giudicare solo P1.

## 8. Come rifare la misura

```bash
cd tests/visual && npm install   # solo se mancano i node_modules
export CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
# flusso vero a tempo di scena reale (riferimento) — ~5 minuti a partita
DTREAL=1 MODE=flow K=21,22,23,24,25,26 OGNI=6 OUT=flusso.jsonl FOTO=foto node collaudo-difesa-220-3d.mjs
# bersaglio logico dell'eroe per scena: aggiungere DRV=1
# forzate (pagina nuova per scena, ~50 s l'una)
MODE=forced GIS=33:0,133:0,134:0,138:0,168:0 OUT=forzate.jsonl FOTO=foto-forzate node collaudo-difesa-220-3d.mjs
# solo analisi di un file già raccolto
ANALIZZA=flusso.jsonl node collaudo-difesa-220-3d.mjs
# tabelle di questo rapporto
node collaudo-difesa-220-rapporto.mjs flusso.jsonl forzate.jsonl flusso-clock-tappato.jsonl
```
I dati grezzi di questo collaudo sono in `docs/collaudi/dati-difesa-220/*.jsonl.gz` (`gunzip` e `ANALIZZA=`).
