# Rapporto giro 31 — PO-220 «Correggi tutto in un giro»: le chiusure difensive dell'eroe nel 3D

Ramo `sviluppo/difesa-220-giro31`, partito da `lavoro/170` (gioco 7.999.170). `GAME_VERSION` e `SAVE_VERSION` **non** cambiate
(istruzione del giro). Zona G (carriera/economia) non toccata. Nessun push su `main` né su `poc/*`, nessun force push.

Fonti: `docs/collaudi/RAPPORTO-difesa-220.md` (collaudo di sola misura, ramo `collaudo/difesa-220`, portato qui insieme alla sua sonda
`tests/visual/collaudo-difesa-220-3d.mjs`, al generatore di tabelle e ai dati grezzi; le foto del collaudo restano sul suo ramo).

## 1. Sintesi

| Metrica (stesse definizioni del collaudo) | Collaudo 7.999.169 (17 scene) | **Prima** 7.999.170 (21 scene) | **Dopo** questo ramo (22 scene) |
|---|---|---|---|
| eroe–portatore **dichiarato** dal motore all'apertura (`__CPM_CAST219`, mediana) | 1,1 u | 1,1 u | 1,1 u |
| eroe–portatore nel 3D all'inizio del risultato (mediana · p75) | 5,3 · 6,2 u | 4,4 · 5,6 u | **1,8 · 1,8 u** |
| scene con eroe–portatore all'apertura > 3 u | 15/17 | 18/21 | **1/22** |
| eroe–portatore al contatto (mediana) | 5,1 u | 4,3 u | **1,8 u** |
| eroe–pallone al contatto (mediana) | 4,5 u | 3,7 u | **1,1 u** |
| **(A)** almeno un indicatore di non-arrivo | 15/17 (88%) | 19/21 (90%) | **2/22 (9%)** |
| compenetrazione (corpi < 0,5 u o pallone < 0,25 u dal centro dell'eroe) | 0/17 | 3/21 | **0/22** |
| **(B) forti** (esito smentito dal possesso 3D a fine esito) | 3/17 (18%) | 5/21 (24%) | **1/22 (5%)** |
| pallone di **nessuno** (nessuno entro 3 u) a fine esito | 10/17 (59%) | 13/21 (62%) | **0/22 (0%)** |
| «palla recuperata» → pallone a un nostro a fine esito | 2/7 | 3/6 | **7/7** |
| «fallita» → pallone a un avversario a fine esito | 2/10 | 0/15 | **14/15** |
| l'eroe **torna indietro** (entro metà dell'escursione, escursione ≥ 1,5 u) | 15/17 | 11/13 (85%) | **0/9** |

Campioni: flusso vero dal salvataggio S12, autoplay seedato, **GLB acceso**, `__CPM_PRESENT=1`, **tempo di scena reale
(`__CPM_DTREAL`)**, una scena difensiva ogni 6 minuti (`__CPM_DIF220_OGNI=6`), **pagina nuova per partita**, viewport 412×915.
«Prima» e «dopo» sono le **stesse sei partite** (semi 21–26): «prima» girato su una copia intatta di `lavoro/170`, «dopo» sul build
finale di questo ramo. La colonna del collaudo è ricalcolata dai suoi dati grezzi con lo stesso script.
Dati grezzi in `docs/sviluppo/dati-giro31/` (`prima-*.jsonl.gz`, `dopo-*.jsonl.gz`; si rileggono con
`ANALIZZA=<file> node tests/visual/collaudo-difesa-220-3d.mjs`).

**Unica scena fuori regola nel «dopo»: V-k23-s2** (portatore a 11,8 u all'apertura, causa non isolata: vedi §5).

## 2. Le cause, misurate in questo giro

1. **Il portatore non stava dove lo mette il motore** — due cause, entrambe misurate col tracciato per fotogramma:
   - il bersaglio *logico* del portatore è a 4,5 u dall'eroe (`src/15`, regia 7.999.84);
   - il suo bersaglio *3D* passava per la marcatura (PASS 1b: i portatori 12 e 13 sono «difensori» per la forma e venivano trascinati
     verso un nostro attaccante: logico a 70,5/37,3, mesh a 76,6/38,2), per la bolla di repulsione di 6,5 u attorno all'eroe e per il
     congelamento di lettura.
   - Primo tentativo **revocato**: spostare il portatore in `matchPlayers` (src/15) entra nella simulazione (il motore legge
     `matchPlayers`, lezione PO-143). La correzione vive solo nel 3D.
   - Scoperto strada facendo: il cast nel 3D (`castBrainRef`) **non porta il tipo di scena**, quindi un primo controllo
     `C.tipo==='difesa'` cadeva sempre sul ripiego (avversario più vicino, 2,2 u fissi). Ora `castBrainRef` porta `tipo31` e
     `dEroe31` (distanza dichiarata), solo lettura.
2. **L'eroe arrivava sopra al pallone o dentro all'uomo**: il pallone stava nel centro del corpo del portatore e il bersaglio del
   contrasto era *pallone + spinta* (cioè oltre il pallone di quanto la spinta era lunga). Inoltre l'arco d'esito partiva 0,35 s dopo
   l'inizio del risultato qualunque cosa facesse l'eroe: se il gesto partiva tardi, al contatto il pallone era già a 5–14 u.
3. **L'eroe tornava indietro**: il suo bersaglio insegue il pallone solo durante il contrasto (0,9 s riuscito / 0,55 s fallito, regola
   7.249) e la spinta vale solo mentre `actType` è «tackle»; finiti quelli il bersaglio torna al punto logico, fermo per tutta la scena.
4. **Il pallone a fine esito era di nessuno**: finito l'arco d'esito difensivo nessun codice lo raccoglie (l'inseguitore del punto
   logico tace in `hl_result` senza arco). Sulle fallite, in più, il post-arco `deflect` (con velocità casuali) lo allontanava dal
   portatore che lo aveva appena tenuto — misurato col testimone nuovo `__CPM_W31` (gi54 «L'avversario passa»: `arco → esito:deflect`).

## 3. Le correzioni (tutte in `src/12-three-match-view.jsx`, più due campi di sola lettura in `src/15`)

| # | Correzione | Interruttore rosso |
|---|---|---|
| 1 | **POSTO**: nella scena difensiva il portatore dichiarato dal cast (ripiego: l'avversario logico più vicino, scelto una volta per scena) sta davanti all'eroe alla distanza dichiarata, tenuta fra 1,8 u (separazione dei corpi) e 3 u; snap compreso, niente congelamento di lettura, niente marcatura/repulsione. Il pallone di lettura segue lui. | `__CPM_NO_POSTO31` |
| 2 | **ARRIVO**: pallone ai piedi del portatore 0,7 u davanti, dal lato dell'eroe; l'inseguimento del contrasto mira a 0,8 u dal pallone senza sommare la spinta; l'arco d'esito aspetta il contatto del gesto (u = 0,18, tetto 1,2 s); mentre aspetta, il pallone resta ai piedi del portatore. | `__CPM_NO_ARRIVO31` |
| 3 | **TIENI**: finito l'inseguimento l'eroe resta dove è arrivato. Al lancio dell'arco d'esito si elegge il **vincitore**: riuscita → il compagno cercato dall'esito o il nostro più vicino al punto d'arrivo (se un avversario sarebbe più vicino, il pallone resta all'eroe, di lato e lontano dal portatore battuto); fallita → il portatore, che porta il pallone *attorno* all'eroe dal lato libero dei nostri. Il vincitore corre al punto d'arrivo, poi pallone al piede e conduzione (canale `_carry526` per gli altri, driver ordinario per l'eroe). Sulla fallita col vincitore eletto niente post-arco `deflect`. | `__CPM_NO_TIENI31` |

Tutte e tre sono **spente sotto il gate** (`?cpmtest=1` senza l'opt-in `__CPM_CINE`), come il ramo 7.777: il gate resta bit-identico fra
macchine. Le sonde del collaudo e il guardiano nuovo accendono `__CPM_CINE`. Testimoni test-only nuovi: `__CPM_TIENI31`
(stato del vincitore) e `__CPM_W31` (chi scrive il pallone nell'esito difensivo), armati da `__CPM_TIENI31ON`; i due nuovi scrittori del
pallone sono **firmati** nel testimone F2 (`vincitore`, `portatore31`).

## 4. Guardiani fatti girare

| Guardiano | Esito | Note |
|---|---|---|
| **`difesa-220-giro31`** (nuovo) | ✅ **VERDE** | verde (semi 31–34, 11 scene): apertura 1,8 u (dichiarata 1,1) · contatto 1,8 u · (A) 0% · (B) 0% · nessuno 0% · ritorno 0/6. Rosso con i tre interruttori (10 scene): apertura 7,3 u · contatto 7,3 u · (A) 100% · nessuno 60% · ritorno 6/9 → **6 soglie violate su 7** (servono ≥ 3). Due corse precedenti del guardiano, su build intermedi, sono state rosse e hanno guidato le ultime correzioni (§6). |
| `validate-situations` (gate 14/14) | ✅ PASS · fingerprint **00001505** · 0 failure | Una prima corsa con tre browser in parallelo (2 fps) è stata rossa su due scene **offensive** (gi79 salto palla 47,6, gi8 passo indietro −17); rifatta da sola: verde. Le correzioni sono spente sotto il gate. |
| `seme-a` | ❌ ROSSO — **preesistente, non peggiorato** | Ramo: 1 giro divergente su 2, primo ingresso divergente **#486 al 17'** (`chiedi.riprendi`, posizione dell'eroe). Base 7.999.170 intatta, da sola: **2 su 2**, stesso #486 al 17'. Sotto seme-a (cpmtest senza `__CPM_CINE`) le correzioni di questo giro sono spente per costruzione. Da aprire come voce a sé. |
| `replay` | ✅ PASS | 8 highlight, completi e coerenti. |
| `difesa-220` | ✅ VERDE | verde: gesti {lunge: 4}, distanza minima 0,8/3/3,8/0,4 u; rosso {press: 3, lunge: 1}. |
| `difesa-220-scena` | ❌ ROSSO — **preesistente, non peggiorato** | Ramo, due corse: «contrasto mai partito nella sua scena» in 6 e 7 scene (la seconda anche con sole 2 scene misurate). **Base 7.999.170 intatta, stesse condizioni: rossa per la stessa ragione** (4 scene). La sonda gira `?cpmtest=1` senza `__CPM_CINE` e a GLB spento: le correzioni di questo giro lì sono spente per costruzione, quindi il suo braccio verde è lo stesso codice della base. |
| `partita-vera` | ✅ PASS | «le bande d'accettazione tengono». |
| `test:logic` · `test:vision` · `typing-shortcuts` · `save-compat` · `career-critical` · `design-system` | ✅ tutti verdi | `test:logic` 43/43 · `save-compat` 12/12 · `career-critical` catena intera verde. |

### 4.1 Due rossi preesistenti da aprire come voci a sé

- **`seme-a`**: la stessa partita giocata due volte diverge al 17' (ingresso #486, `chiedi.riprendi` riceve l'eroe in punti diversi:
  84,7/47,9 contro 82,7/52,9). Sulla base 7.999.170 da sola: 2 giri divergenti su 2. Non è toccato da questo giro.
- **`difesa-220-scena`**: «contrasto mai partito» nelle scene a GLB spento. Rosso anche sulla base.

Non li ho corretti: sono fuori dall'ambito del giro (il primo è determinismo del motore, il secondo il gesto a GLB spento) e
correggerli senza misura propria sarebbe un *blind fix*.

## 5. Limiti dichiarati

- **Non è il telefono.** Headless a 2–13 fps; `__CPM_DTREAL` porta il tempo di scena al tempo reale ma con passi fino a 0,3 s. Il
  collaudo sul dispositivo del PO resta il giudice.
- **Finestra d'esito corta.** A tempo reale la finestra d'esito chiude 1,7–3 s dopo il contatto: «a +2 s» vale l'ultimo fotogramma
  quando la scena chiude prima (stessa regola del collaudo). Il «ritorno» si giudica solo se la scena dura almeno +1 s dopo il
  contatto e l'eroe si è spostato di almeno 1,5 u: nel «dopo» l'eroe parte già sull'uomo e si sposta poco, quindi le scene giudicabili
  sono 9 su 22.
- **V-k23-s2**: portatore a 11,8 u all'apertura nonostante la correzione 1; il seguitore della sonda ha agganciato la scena già in
  `hl_result`. Causa **non isolata** (non posso confermare se il portatore fosse escluso dal driver da un altro canale).
- **Una sola carriera** (S12, ovr 93); 22 scene «dopo» e 21 «prima»: le quote hanno intervalli ampi.
- **Foto**: scattate qualche fotogramma dopo la rilevazione (latenza dello screenshot headless); a volte la scena è già chiusa o
  coperta da un riquadro. L'istante esatto è nei dati, non nell'immagine.
- Le scene **forzate** non fanno parte delle tabelle: due prove a mano (gi54 k0 fallita, gi31 k0 riuscita) danno 2,1–2,2 u
  eroe–portatore al contatto e possesso coerente, ma non le ho censite tutte.

## 6. Come ci si è arrivati (misure intermedie, semi 21–26)

| Build | apertura | contatto | (A) | (B) | nessuno | ritorno | cosa ha mostrato |
|---|---|---|---|---|---|---|---|
| v1 (portatore in `matchPlayers`) | 3,4–8,7 | — | — | — | — | — | logico a 2,5 u, mesh no → marcatura/repulsione; e scrittura nella simulazione: revocata |
| v4 (POSTO nel 3D + vincitore) | 1,8 | 1,8 | 19/23 | 0/23 | 11/23 | 7/13 | compenetrazione eroe–pallone, `deflect` sulle fallite |
| v6 (+ niente deflect, arrivo a 0,8 u) | 1,8 | 1,8 | 5/19 | 1/19 | 1/19 | 0/9 | pallone già via al contatto in 3 scene |
| v8 (+ arco al contatto) | 1,8 | 1,8 | 2/19 | 4/19 | 0/19 | 0/2 | riuscita: «tocco avanti» verso il portatore; fallita: atterraggio accanto all'eroe |
| **finale** | **1,8** | **1,8** | **2/22** | **1/22** | **0/22** | **0/9** | |

## 7. Foto

`docs/sviluppo/foto-giro31/prima/` (base 7.999.170) e `docs/sviluppo/foto-giro31/dopo/` (build finale), tre fotogrammi per scena
(`1avvio` · `2contatto` · `3piu1s`).
- Prima, **V-k21-s2-1avvio**: eroe (rosso, 77) a ~5 u dal portatore bianconero; esito «Niente da fare».
- Dopo, **V-k24-s1-2contatto**: «Anticipo da campione», l'eroe ha il pallone al piede e il portatore (Bailey) è a ~3 u alle sue spalle.
- Dopo, **V-k25-s2**: fallo sulla scivolata, il pallone resta all'avversario; **V-k21-s1**: riuscita col pallone girato a un compagno (#8).

## 8. Come rifare la misura

```bash
cd tests/visual && export CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
npm run difesa-220-giro31                                    # guardiano: verde e rosso in parallelo, ~22 min
DTREAL=1 MODE=flow K=21,22,23 OGNI=6 OUT=f.jsonl node collaudo-difesa-220-3d.mjs   # misura libera (ROSSO=__CPM_NO_POSTO31,... per il braccio rosso)
ANALIZZA=f.jsonl node collaudo-difesa-220-3d.mjs             # rianalisi
```
