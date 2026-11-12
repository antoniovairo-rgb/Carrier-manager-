# Giro 176 — Regia verticale delle azioni salienti 3D (PO-367, difetti D1 e D11 del giro 170)

Ramo `sviluppo/giro176-regia-salienti`, partito da `lavoro/191`. Destinazione 7.999.192. `GAME_VERSION` non toccato.
Contatto pubblico del progetto: korward.devteam@gmail.com

## 0. In una riga

Nelle azioni salienti l'eroe al momento del gesto passa dal **~12% al ~19% dell'altezza dello schermo** (telefono e PC),
nella scelta i suoi piedi stanno **18-20% di schermo sopra il pannello** invece di 4-8% (a 375 px prima finiva sotto il
pannello in 6 scene su 18), e le targhette dei nomi sopra i corpi altrui scendono da **11-12% a 0,2-0,7%**. Nessun
moltiplicatore globale: la camera si sposta solo nella finestra del gesto, la mira è uno scorrimento d'ottica. Rosso
`window.__CPM_NO_G176 = true`, guardiano `npm run regia-176` (verde col verde, rosso col rosso, misurato).

## 1. Tabella dei provini per il PO (scelta della taglia)

Foto in `docs/sviluppo/giro176/provini/` (telefono 412×915, corpi veri, una scena per famiglia, foto scattata a 0,6 s
di **tempo di scena** dall'inizio dell'esito). Ogni foglio `tel412-<famiglia>-gesto-provini.jpg` affianca:
PRIMA (regia di oggi) · P · M · G.

| Provino | Taglia chiesta (altezza dello schermo) | Eroe misurato al gesto, 412×915 (9 famiglie) | Come si sceglie |
|---|---|---|---|
| Prima (oggi) | — | 5,7-11,0% (mediana ~10%) | `window.__CPM_NO_G176 = true` |
| **P** | 15% | 11,4-13,8% (mediana 13,7%) | `window.__CPM_TAGLIA176 = 'p'` |
| **M — predefinito** | 20% | 16,3-18,3% (mediana 18,2%) | nessun parametro (oppure `'m'`) |
| **G** | 25% | 18,8-22,8% (mediana 22,6%) | `window.__CPM_TAGLIA176 = 'g'` |

Il parametro accetta anche un numero (es. `0.22`) per un provino intermedio. È letto solo dal renderer: nessun salvataggio,
nessun menu. Ho messo come predefinita la taglia **intermedia (M)**, come chiesto: la scelta è del PO, sul telefono.

**Domanda per la sessione madre (da girare al PO)**: quale taglia? Ricordo i due precedenti: la 0,24 del 7.505 fu bocciata
sul telefono («zoom troppo stretto») e la taglia di partita è scesa fino a 0,12 col 7.713. Qui la differenza è che la
stretta vale **solo nei primi ~2,2 s dell'esito** (poi riapre in 0,8 s) e solo quando il soggetto della regia è l'eroe:
nella scelta e nel resto dell'azione la distanza è quella di oggi.

## 2. Misure (prima → dopo)

Sonda `tests/visual/regia-176-misura.mjs` (anche guardiano). Tre formati, pagina nuova per formato, corpi veri, teatro
attivo, 2 scene per famiglia (18 scene per formato), esito forzato «riuscito». Numeri da `__CPM_REGIA176()` (aggancio di
sola prova in `src/12`): eroe, pallone e linea di porta proiettati in pixel di schermo, confrontati col rettangolo vero
del pannello `[data-cpm="scelte"]`. Il gesto si campiona a **tempo di scena** (0,4-2,2 s della finestra), mai a orologio.
Registri completi: `docs/sviluppo/giro176/regia-176-rosso.log` / `-verde.log` (+ `.json`).

### 2.1 Riepilogo per formato

| Formato | Eroe al gesto (mediana) | Margine piedi→pannello nella scelta | Eroe sotto il pannello (scelta) | Targhette su corpi altrui |
|---|---|---|---|---|
| Telefono 375×812 | 11,6% → **18,9%** | 4,2% → **18,2%** | 6 scene su 18 → **0** | 11,6% → **0,7%** |
| Telefono 412×915 | 11,8% → **19,0%** | 7,8% → **20,1%** | 0 → 0 | 11,3% → **0,2%** |
| PC 1440×900 | 12,5% → **18,8%** | il pannello non copre il riquadro 3D | — | 6,1% → **0,2%** |

### 2.2 Per famiglia (telefono 412×915; 375 e PC nei registri)

| Famiglia | Eroe nella scelta | Eroe al gesto prima → dopo | Pannello (% schermo) | Pallone fuori al gesto (dopo) | Porta fuori al gesto prima → dopo |
|---|---|---|---|---|---|
| tiro | 7,4% | 12,3% → 19,3% | 31% | 0/18 | 0/23 → 0/24 |
| cross | 7,2% | 12,1% → 18,9% | 33% | 0/16 | — |
| testa | 9,5% | 14,3% → 19,1% | 33% | 8/30 (prima 6/29) | 30/30 → 30/30 |
| rigore | 6,4% | 11,3% → 18,9% | 30% | 0/20 | 0/31 → 0/32 |
| punizione | 8,7% | 11,7% → 18,1% | 32% | 0/9 | 11/29 → 15/32 |
| passaggio | 7,5% | 12,0% → 19,0% | 31% | — | — |
| dribbling | 7,9% | 11,9% → 19,2% | 31% | — | — |
| difesa | 9,9% | 12,1% → 19,1% | 33% | — | — |
| costruzione | 7,8% | 12,8% → 19,1% | 31% | — | — |

Note di lettura:
- **L'eroe nella scelta resta 6-10%**: per vincolo (§7 del giro 170) la distanza cambia solo nella finestra del gesto. Nella
  scelta cambia la **mira**, cioè dove sta l'eroe, non quanto è grande. Vedi domanda D2 in §6.
- Il pannello delle scelte copre **30-37%** dello schermo sul telefono (misurato, rettangolo DOM), non il 40% stimato al giro 170.
- Il «prima» qui (11-12%) è più alto del 7-10% del giro 170 perché misura **dentro la finestra del gesto, col soggetto
  eroe**; il giro 170 fotografava la scelta.

## 3. Cosa ho cambiato (tutto in `src/12-three-match-view.jsx`, tutto spento da `__CPM_NO_G176`)

1. **Finestra del gesto** (`sr.current._g176`): peso che sale in ~0,3 s all'ingresso in `hl_result`, resta pieno fino a
   2,2 s di scena e si spegne entro 3,0 s; azzerato a ogni cambio di scena o fase. Fuori da cerimonie, rigori di serie, replay.
2. **Stretta di distanza** (taglia F6, quella del 7.505): solo dentro la finestra, la taglia chiesta sale da 0,12 a quella
   del provino. Esente col soggetto-pallone (già lo era: `_w252`). **Esente sul colpo di testa**: il pallone arriva dall'alto
   e di lato e con la camera addosso all'eroe finiva alle sue spalle.
3. **Stretta d'ottica** (passata per-fotogramma del giro 96, punto 4): la soglia «eroe più piccolo del 7%» sale fino alla
   taglia del provino, convertita da altezza dello schermo ad altezza del riquadro 3D. Serve perché la camera impiega ~1,5 s
   di scena ad avvicinarsi: senza l'ottica la stretta arrivava **dopo** il contatto (misurato: eroe 7%→15% solo a 1,1 s).
   Si rilascia da sola man mano che la camera arriva. Vincoli: eroe intero e pallone dentro (come prima), la **porta già
   inquadrata** dentro (nuovo), e i punti dell'eroe seguono lo **stacco** del salto (nuovo: col colpo di testa la testa
   usciva dall'alto 2-3 campioni su 10). Spenta quando il soggetto passa al pallone.
4. **Mira sopra il pannello** (accanto allo scorrimento 72/86/88, stessa leva `setViewOffset`): nella scelta, se il pannello
   copre il riquadro 3D, il busto dell'eroe va al 42% della zona libera fra bordo alto del pannello e bordo alto del quadro.
   Rettangolo del pannello letto dal DOM ogni 0,25 s. Tetti: testa sotto ndc 0,86, pallone sotto 0,92, al massimo 45%
   dell'altezza. La camera non si muove: l'erba vuota finisce dietro il pannello e la tribuna esce dall'alto.
5. **D11 — targhette**: nella posa delle targhette (D10 del giro 96a) i corpi disegnati entrano fra gli ostacoli; una
   targhetta che copre oltre il 25% di un corpo altrui sale di una o due righe, altrimenti non si disegna (quella dell'eroe
   resta sempre). Nessuna allocazione per fotogramma.
6. **Aggancio di prova** `window.__CPM_REGIA176()` e testimone `window.__CPM_TAG176` (solo `?cpmtest=1`/`__CPM_REC`).

Non toccati (come da §7 del giro 170): `_spalle146`/`_corrPostura23`, riflesso del portiere 148, braccia da fermo 152,
folla 147, 3D nel gioco fluido, ombre, passo dell'ingresso. Nessun moltiplicatore globale della camera.

## 4. Guardiano `regia-176`

`npm run regia-176` (verde) · `npm run regia-176:rosso` (deve dire rosso: esce 0 solo se vede il rosso). Giudica, per ogni
formato: (1) taglia mediana dell'eroe al gesto ≥ 15% dello schermo; (2) piedi mai sotto il pannello e margine mediano ≥ 12%
dove il pannello copre il 3D; (3) pallone fuori quadro ≤ 10% (aggregato) e ≤ 25% per famiglia su tiro, cross, rigore,
punizione, porta fuori ≤ 10% su tiro e rigore; (4) targhette su corpi o targhette altrui ≤ 5%; (5) almeno 2 scene giudicate
per famiglia (non giudicato = rosso). Si giudicano i campioni del gesto col **soggetto eroe**; quelli col soggetto-pallone
sono dichiarati a parte. Aggiunto in `ci-runner.mjs` all'area `src/12` e fra i passi lenti (una sola volta per catena).
Durata: ~25-30 min (il PC headless scorre a 1/6 del tempo reale).

Esito: **verde** sul verde; sul rosso **rosso** per 12 motivi (taglia nei tre formati, margine nei due telefoni, eroe sotto
il pannello in 4 famiglie a 375, targhette nei tre formati).

## 5. Rituali eseguiti

(vedi §8, compilata a fine giro)

## 6. Dubbi e domande per la sessione madre

- **D1 — Quale taglia** (§1). Predefinita M.
- **D2 — L'eroe nella scelta resta piccolo (6-10%).** Il vincolo del giro 170 dice «stretta solo nella finestra del gesto».
  La lamentela del PO («5-10% dell'altezza») vale anche per la scelta, che dura di più. Se il PO lo vuole, la stessa ottica
  si può applicare anche alla scelta con taglia propria: è una decisione, non l'ho presa.
- **D3 — Colpo di testa: porta e pallone.** Col colpo di testa la porta è fuori quadro in tutti i campioni, **anche prima**
  (30/30 → 30/30), e il pallone in arrivo dal cross esce 6/29 prima e 8/30 dopo sul 412 (gi134 isolata: 4/15 prima, 2/17
  dopo). Il guardiano lo **dichiara senza giudicarlo**. È un difetto della regia del colpo di testa che esiste già: da
  mettere in un giro suo?
- **D4 — Punizione: porta.** Su gi14 (punizione dalla fascia, di fatto un cross) la porta è fuori anche prima; su 412 il
  dato aggregato passa 11/29 → 15/32. Dichiarato, non giudicato. Va decisa: in una punizione-cross serve la porta?
- **D5 — gi124 («testa»)**: camera a 8-10u che gira e porta alle spalle già **col rosso** (misurato). Non toccata.
- **D6 — Anomalia non riprodotta**: in un provino (braccio M, prima scena della pagina, foto della scelta) la camera
  guardava quasi a picco e l'eroe era sul bordo alto destro (`provini/anomalia-tel412-tiro-m-scelta.jpg`). Due sequenze di
  14 foto sulla stessa scena (scala 1 e 2) e un secondo giro del braccio M non l'hanno riprodotta. Lo segnalo perché sul
  telefono va guardato.
- **D7 — Durata del guardiano**: ~25-30 min nella catena. Se pesa troppo, si può fare una versione rapida (solo 412, 1
  scena per famiglia) — ma con una scena per famiglia il rumore è alto (si veda D3).
- Nota di metodo: due trappole incontrate e corrette nella sonda, da tenere presenti: (a) il gesto va campionato a tempo di
  scena (a orologio il PC misurava la rampa d'ingresso: 12,8% invece di ~19%); (b) subito dopo la risoluzione il contatore
  della finestra vale ancora il tempo della **scelta** (si azzera al primo fotogramma di `hl_result`): una foto «a 0,6 s»
  partiva troppo presto. Il registro del guardiano in `regia-176-*.log` è stato prodotto **prima** della correzione (b):
  la (b) toglie al più i primi campioni di ogni esito; la corsa del guardiano nella catena (§8) usa la sonda corretta.

## 7. Foto prima/dopo

`docs/sviluppo/giro176/provini/`:
- `tel412-<famiglia>-gesto-provini.jpg` — PRIMA · P · M · G al gesto (9 famiglie);
- `<formato>-<famiglia>-scelta-prima-dopo.jpg` — la scelta prima/dopo (mira sopra il pannello), 412, 375, PC;
- `<formato>-<famiglia>-gesto-prima-dopo.jpg` — 375 e PC, prima/dopo al gesto.

## 8. Rituali

(compilata a fine giro)
