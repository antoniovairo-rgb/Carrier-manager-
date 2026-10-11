# PO-225 · Ingresso in campo con GLB acceso: la grafica TV pre-partita esce dopo 4 s — collaudo

**Build:** `GAME_VERSION="7.999.158"` (stessa build del PO-224).
**Sonda:** `docs/collaudi/sonde-158/collaudo-po225.mjs` (`ARM=verde|rosso node collaudo-po225.mjs`, da `tests/visual/` di una build 7.999.158).
**Dati:** `docs/collaudi/dati-158/po225-verde.json`, `po225-rosso.json`.
**Strada verso il walkout:** la stessa di `ingresso-59.mjs` (carriera salvata con una coppa, «Continua», `__CPM_PHASE` fino a `walkout`), a 375×812, `__CPM_GLB=true`.

## 1. Esito

| Istante (tempo d'animazione) | Verde (`__CPM_NO_TV225` assente) | Rosso (`__CPM_NO_TV225=1`) |
|---|---|---|
| 0 s | 0 (entrata `logoIn` in corso) | 0 (entrata) |
| 2 s | **1** | 1 |
| 4 s | **1** | 1 |
| 4,5 s | **0,623** | 1 |
| 4,9 s | **0** (fine della dissolvenza) | 1 |
| 6 s · 8 s · 10 s | **0** | 1 |

- **Verde:** la grafica resta piena fino a 4 s, esce in dissolvenza tra 4 e 4,9 s e poi resta a 0. Le animazioni presenti sono `logoIn` e `tvOut225`, come da codice (`src/15-live-match.jsx:10418`: `tvOut225 0.9s ease-in 4s forwards`).
- **Rosso:** resta a 1 a ogni istante. Solo `logoIn` è presente, quindi il rosso riproduce il difetto del PO (la grafica copre l'ingresso).
- `pageerror` = 0 in entrambi i bracci.

## 2. Come è stata letta l'opacità (e perché non «a ogni fotogramma reale»)

- Il primo tentativo registrava l'opacità a ogni `requestAnimationFrame`. Con GLB acceso, in headless, il rendering scorre a pochi fps: in 12 s ho ottenuto solo 6 fotogrammi, e il campionamento saltava da 2,1 s a 4,9 s. Non era leggibile.
- Il metodo usato: si mettono in pausa le animazioni della grafica (`el.getAnimations()`), si imposta `currentTime` a 0, 2, 4, 4,5, 4,9, 6, 8, 10 s e si legge `getComputedStyle(el).opacity` a ogni istante. Il valore dipende dal tempo d'animazione, non dagli fps, quindi è **deterministico**.
- **Limite:** è una lettura per istante d'animazione, non una cattura di fotogrammi reali. Il tempo reale di comparsa in headless non si misura da qui.

## 3. Cosa non ho verificato

- **GLB:** il flag `__CPM_GLB=true` è armato, ma **non ho verificato** che i modelli CH38 si carichino in quella corsa. Il dato sulla grafica TV non dipende dai modelli, ma la prova «con GLB acceso» è riferita al flag, non a un caricamento confermato.
- Il tempo d'ingresso reale sul telefono: non misurato.

## 4. Riproduzione

```
ARM=verde node collaudo-po225.mjs
ARM=rosso node collaudo-po225.mjs
```
Ciascun braccio circa 1 minuto e mezzo in headless.

---
_Collaudo eseguito dalla sessione collaudatrice del team CPM (sola lettura sul gioco)._
