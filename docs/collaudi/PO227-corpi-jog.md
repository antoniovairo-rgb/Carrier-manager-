# PO-227 · residuo del giro 7: corpi «non identificati» e bambini fermi che corrono — collaudo giro 8

**Base:** `main` 7.999.160 (commit 10288c7a). **Build misurata:** `CARRIER-MANAGER-AV.html`, allineato ai 21 frammenti di `src/` (`node tools/build-src.mjs --check`: «già allineato»).
**Sola lettura:** nessuna modifica a `src/` né al file di gioco. Nessuna correzione proposta.

## Esito in una riga

I due corpi «non identificati» del giro 7 **non sono visibili**: sono un clone di misura creato da `_passoNaturale7`, mai agganciato alla scena, quindi non disegnato. Resta invece un punto aperto sui bambini: **8 bambini su 22 hanno 2–4 letture ciascuno di corsa sopra 0,3 mentre sono fermi** (27 su 1105 letture ferme in quadro, 2,4 %). L'attesa «nessun bambino con corsa da fermo» non è soddisfatta; la causa non l'ho verificata.

## 1. Metodo

- **Sonda:** `docs/collaudi/sonde/po227-residuo-160.mjs` (sola osservazione). Aggiunge due sottoclassi di lettura nel browser: `THREE.AnimationMixer` (per ogni corpo: stack di creazione, clip, scala, e a ogni update posizione della radice, velocità = spostamento / dt di scena, peso della clip `jog`) e `THREE.WebGLRenderer` (scena e camera per l'inquadratura).
- **Aggancio alla scena:** un corpo è «agganciato» se risalendo i genitori della radice si arriva alla scena che il renderer disegna. Il test di inquadratura da solo non basta: un oggetto staccato dalla scena ma davanti alla camera non viene disegnato (il mio primo tentativo lo ha contato come «in quadro»; corretto nella versione finale).
- **Partita:** `tests/visual/fixtures/save-194-primavera-w38.json`, GLB acceso, `?cpmtest=1`, walkout forzato come `fila-227.mjs`.
- **Dati grezzi:** `docs/collaudi/PO227-dati/po227-residuo-160.json` (116 mixer, 222 render intercettati).
- **Fermo:** velocità < 0,5 u/s su dt di scena > 0 (stessa soglia di `fila-227.mjs`).

## 2. I due corpi «non identificati»

| Corpo | Scala | Aggiornamenti | Agganciati alla scena | Radice | Clip |
|---|---|---|---|---|---|
| 1 | 0,97 | 49 | **0** | `Group:Scene`, senza genitore | solo `jog` |
| 2 | 1,04 | 49 | **0** | `Group:Scene`, senza genitore | solo `jog` |

- **Chi li crea:** lo stack di creazione porta `_passoNaturale7` come prima funzione (poi `loop`). Nel sorgente, `_passoNaturale7` clona il corpo con `THREE.SkeletonUtils.clone(src)` (`src/12-three-match-view.jsx:879-882`) e crea un mixer sul clone (`:882`, `new THREE.AnimationMixer(c)`). Nel file singolo: `CARRIER-MANAGER-AV.html:13741` e `:13744`. L'attribuzione si regge sullo stack (due sole voci, quindi non completo) e sul codice, non su una cattura completa.
- **Perché non sono visibili:** il clone non viene mai aggiunto alla scena: la radice non ha genitori e non è figlia di `Scene`. Il renderer non disegna oggetti fuori dal grafo.
- **Correzione del giro 7:** il rapporto precedente le diceva entrambe di scala 1,04. Nella misura di oggi una è 0,97 e una 1,04.
- **Non ho fotografato il corpo.** La conclusione «non visibile» si basa sull'aggancio al grafo di scena, che è la condizione di disegno di three.js, non su un'immagine.

## 3. Bambini (22 corpi, creatore `_replaceMascotsWithHyper`, `CARRIER-MANAGER-AV.html:14417`)

- **Aggancio:** 22 su 22 agganciati alla scena (212 aggiornamenti ciascuno).
- **Letture ferme in quadro:** 1105 in totale.
- **Letture ferme con corsa > 0,3:** 27 (2,4 %), distribuite su **8 bambini**, da 2 a 4 letture ciascuno (4, 3, 4, 3, 4, 3, 4, 2).
- **Confronto col giro 7:** il giro 7 misurava la corsa a fermo al 100 % per 22 bambini, con il testimone interno del gioco (`_sp227`). Oggi misuro lo spostamento: sono strumenti diversi, il confronto è indicativo, non una prova di miglioramento.
- **Codice del fix:** il peso della corsa è legato alla velocità: `CARRIER-MANAGER-AV.html:18707` (`let _rw227=1,_iw227=0.25`) e `:18715` (`run.weight=_rw227`).
- **Causa delle 27 letture: non verificata.** Un'ipotesi che non ho controllato è che cadano nelle transizioni da fermo a corsa, dove la velocità smussata del gioco (`_sp227`, `src/12-three-match-view.jsx:5849`) e lo spostamento istantaneo divergono. Per dirlo servirebbe una serie temporale per bambino, che questa misura non registra. **Non posso confermarlo.**

## 4. Altri corpi (per completezza)

- **Corpi LOD di variante** (`_makeVariant`, creati invisibili: `src/12-three-match-view.jsx:1506`, `CARRIER-MANAGER-AV.html:14368`): 1 solo aggiornamento ciascuno, non agganciati. Sono dormienti: non girano nel walkout.
- **Avatar legacy** (`_buildAvatars907` → `_mkA`): 1–4 aggiornamenti ciascuno, quasi tutti non agganciati. Sostituiti dal lineup hyper durante l'ingresso.
- **Lineup hyper** (`_replaceIntroLineupWithHyper`, giocatori dell'ingresso): agganciati in quasi tutti gli aggiornamenti (ad esempio 212/213 e 92/93). Una sola lettura di corsa > 0,3 mentre fermi, su un giocatore (56 letture ferme in quadro su quel corpo): da non leggere come un dato, è un episodio singolo che non ho analizzato.

## 5. Limiti

- **Headless:** il tempo di scena scorre molto più lento del reale (`dt` di scena di circa 20 s su 49 aggiornamenti per il clone). I risultati sono rapporti adimensionali e conteggi, non durate reali.
- **Velocità misurata come spostamento**, non come il valore interno del gioco.
- **Non misurato:** telefono, GLB spento, e la sequenza temporale per bambino.

## Riproduzione

```bash
cd /home/user/Carrier-manager-
CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node docs/collaudi/sonde/po227-residuo-160.mjs
```

Tempo: alcuni minuti in headless.

---

**Stato: NON CHIUSO.** Motivo: 8 bambini su 22 hanno 2–4 letture ciascuno di corsa sopra 0,3 mentre sono fermi (27 su 1105, 2,4 %), quindi l'attesa «nessuno» non è soddisfatta, e la causa non è verificata. Chiuso invece il punto dei due corpi «non identificati»: non sono agganciati alla scena e non vengono disegnati.

_Collaudo eseguito dalla sessione collaudatrice (sola lettura sul gioco)._
