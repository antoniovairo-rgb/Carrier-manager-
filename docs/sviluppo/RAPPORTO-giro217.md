# Rapporto giro 217 — `piazzato-204` stabile: lo stacco nero si giudica su tutta la foto

Ramo `sviluppo/giro217-piazzato-stabile`, partito da `lavoro/195` (d95d504, contiene i giri 204, 208, 214, 216). `GAME_VERSION` non
toccata, roadmap non toccata, **nessuna modifica a `src/`** (`check-src`: allineato a HEAD). Ogni numero qui sotto è **misurato** con la
sonda o il guardiano indicato. Foto in `docs/sviluppo/giro217/`.

Riprende il dubbio 1 del giro 216: il braccio «verde maxischermo» di `piazzato-204` (almeno 300 pixel bianchi della scritta «RIGORI» in
ogni campione fuori dallo stacco nero) usciva rosso 3 volte su 4, ogni volta con **un** campione a 0 fra nove sopra 1.100.

## 0. In breve

| Punto | Prima | Dopo |
|---|---|---|
| Causa degli zeri | — | **campionamento del guardiano**, non difetto del gioco: lo stacco nero fra due rigori (0,5 s, giro 191 B) compare e sparisce *durante* la foto (0,65-0,95 s), mentre la sonda lo controllava solo *prima* |
| `piazzato-204` | 1 verde su 4 (giro 216) | **5 verdi su 5 consecutive**, rossi visti in tutte e 5 (G204 ramo «già calciato», G204 lotteria, G208 maxischermo) |
| Soglia | 300 pixel bianchi | **invariata** (300); minimo misurato fuori dagli stacchi 1.130-1.160 |
| Gioco | — | nessuna correzione: niente `__CPM_NO_G217` (la scritta non sparisce mai da sola, vedi §1) |

## 1. Misura prima (sonda nuova `tests/visual/sonda-217.mjs`)

Stesso percorso del braccio verde della lotteria di `sonda-90-204.mjs` (lotteria in casa, `isHome: true`, autoplay seme 8080), ripetuto
**6 volte** sullo stesso codice di `lavoro/195`. Per ogni campione registra: istante dall'inizio della lotteria, stato della serie
(`__CPM_SO_STATE`: `step`, punteggio) **prima e dopo** la foto, presenza del nero `data-cpm="stacco191"` prima e dopo, camera e punto
guardato (`__CPM_STATE`) prima e dopo, durata della foto, ritaglio salvato.

60 campioni, 4 sotto i 300 pixel bianchi (tutti a 0):

| Corsa · campione | Istante | Stacco prima / dopo la foto | `step` prima→dopo | Serie | Durata foto | Giudicato dal guardiano? |
|---|---|---|---|---|---|---|
| 1 · 8 | 17,9 s | no / no | **7→8** | 2-0 | 766 ms | **sì → rosso** |
| 5 · 4 | 10,2 s | no / no | **3→4** | 1-0 | 951 ms | **sì → rosso** |
| 4 · 4 | 10,2 s | sì / no | 4→4 | 1-0 | 650 ms | no (stacco dichiarato) |
| 4 · 9 | 18,4 s | sì / no | 8→8 | 2-0 | 836 ms | no (stacco dichiarato) |

- **Camera**: identica prima e dopo in tutti e quattro (23,5 · 3,8 · 2,4, guarda 46,5 · 1 · -0,3) e uguale a quella dei campioni buoni →
  non è un cambio d'inquadratura.
- **Maxischermo**: il testimone `__CPM_SB208` dice «rigori» col punteggio della serie anche in quei campioni → la texture non è stata
  ridisegnata senza scritta.
- **Foto del ritaglio** (`zero-corsa1-campione8-nero-al-cambio-tiro.png`, `zero-corsa5-campione4-nero-al-cambio-tiro.png`): la scena è
  coperta dal velo nero al 97% e sotto si legge appena «RIGORI». È lo stesso aspetto del campione con stacco dichiarato
  (`zero-corsa4-campione4-stacco-dichiarato.png`). Confronto: `normale-corsa1-campione7.png` (1.143 pixel).
- **Legame col cambio di tiro**: dei campioni fuori stacco dichiarato, 24 hanno visto cambiare `step` durante la foto e 2 di questi sono
  a 0; 20 non l'hanno visto cambiare e **0** sono a 0. Lo stacco parte al cambio di tiro (`soFx.key`, src/15 r. 2614) e dura 500 ms
  (`STACCO191_MS`): più corto della foto, quindi può comparire e sparire tutto dentro la foto, e il controllo prima/dopo lo perde.

Conclusione: è un fotogramma di transizione (lo stacco nero voluto dal giro 191 B), non una scritta che sparisce. Il giocatore in quei
300-500 ms vede il nero, non il maxischermo.

## 2. Correzione (solo `tests/visual/sonda-90-204.mjs`)

- La pagina tiene un **diario dello stacco** (lato sonda, `MutationObserver` nell'init script: istante in cui il nero compare e
  scompare, `window.__CPM_STACCHI217`). Il gioco non cambia.
- Un campione è «sotto stacco» se un nero si sovrappone alla finestra **[prima della foto − 400 ms, dopo la foto]**, oppure se c'era
  già all'istante prima (il criterio vecchio resta). I 400 ms coprono il nero già tolto dal DOM ma ancora dipinto nell'ultimo
  fotogramma: è il fotogramma più lungo misurato in headless durante la lotteria (due corse: mediana 117-133 ms, p95 200-233, massimo
  333-400).
- La soglia (300 pixel), il minimo di campioni giudicati (3) e tutti gli altri controlli restano come prima. Il risultato espone anche
  `staccoSoloInFoto` (quanti campioni il criterio vecchio avrebbe giudicato) e `bianchiSottoStacco` (i pixel dei campioni esclusi), così
  si vede cosa si toglie.

Effetto misurato nelle 5 corse di §3: campioni giudicati da ~9 a **5-6 su 10**; fra gli esclusi, gli zeri del braccio verde sono 1, 0,
3, 1, 0. Gli esclusi non a zero (1.135-1.175) sono campioni vicini a uno stacco in cui il nero non è finito nella foto: il margine li toglie
per prudenza.

## 3. Controlli (uno alla volta, `CPM_CHROME=/opt/pw-browsers/chromium`, `free -m` / `df -h` prima di ciascuno)

| Controllo | Esito |
|---|---|
| `piazzato-204` ×5 consecutive | ✅ 5/5 verdi. Verde maxischermo: minimo 1.156 · 1.135 · 1.141 · 1.130 · 1.139 su 6·6·5·6·6 campioni. Rossi visti 5/5: G204 ramo «già calciato» (nessuna scena di sola visione), G204 lotteria (minuto disegnato 10/10, 418-432 pixel gialli), G208 maxischermo (punteggio della partita 20-23/20-23, «RIGORI» 0, pixel bianchi 0) |
| `tabellone-214` | ✅ verdi A, B, D · rossi C (`__CPM_NO_G214`) ed E (`__CPM_NO_G216`) visti · ~13 min, eseguito in sottofondo con attesa sull'esito |
| `lotteria-191` | ✅ verdi telefono e PC (stacco 6/6), tre rossi visti (G191B, G191C, G191D) |
| `rigore-191` | ✅ verde-prod, verde-banco, rosso `__CPM_NO_G191A` visto |
| `career-critical` | ✅ uscita 0, 5 «✅ PASS», nessun ❌ |
| `test:logic` | ✅ pass 51 · fail 0 |
| `save-compat` | ✅ 12 pass · 0 fail. Nota: un primo lancio, partito per errore **senza** `CPM_CHROME`, è uscito con un errore di Node; rilanciato con `CPM_CHROME` |

`node tools/check-src.mjs`: `CARRIER-MANAGER-AV.html` allineato a HEAD (nessuna modifica a `src/`, quindi `build-src` non serviva).
All'inizio la sonda non partiva perché mancavano i `node_modules` nel container: `npm install` in `tests/visual`.

## 4. Dubbi per il PO

1. **Il margine di 400 ms toglie anche campioni buoni.** Si passa da ~9 a 5-6 campioni giudicati su 10 per corsa. Il minimo resta 3,
   quindi il guardiano giudica, ma con meno margine: se un giorno la lotteria si accorcia, i campioni potrebbero scendere sotto 3 e il
   guardiano diventerebbe «non giudicato» (= rosso). L'alternativa è ripetere la foto quando cade sotto uno stacco, invece di scartarla;
   non l'ho fatta per non cambiare il ritmo di campionamento del guardiano.
2. **I 400 ms dipendono dalla velocità della macchina.** Sono il fotogramma più lungo misurato qui; su un runner CI più lento un
   fotogramma può durare di più e il nero restare dipinto più a lungo. Non posso confermare quanto duri là.
3. **Altri guardiani con la stessa trappola?** Ho cercato `stacco191` in `tests/visual`: oltre a `sonda-90-204` lo usano
   `lotteria-191` (campiona lo stato ogni 50 ms nella pagina, nessuna foto da giudicare a pixel) e `sonda-214` (lo stacco serve solo a
   scegliere quale foto salvare, le misure sono sul DOM). Non vedo la stessa trappola lì, ma non ho controllato i guardiani che
   fotografano la lotteria senza nominare lo stacco.
