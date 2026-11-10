# Rapporto giro 127 — PO-329, ingresso dell'eroe dalla panchina

Lotto 7.999.187 · ramo `sviluppo/giro127-panchina` · base `lavoro/186` (7.999.186). `GAME_VERSION` non toccata.

Segnalazione PO (08/11): «Quando l'eroe entra dalla panchina si vedono erroneamente le tribune da dietro
(se più semplice, cambiare inquadratura di fronte e non di spalle)».

## 1. La scena e la misura

- Scena: cerimonia d'ingresso del subentrante (5.49.6), `src/12-three-match-view.jsx`, timer `subEntryT`
  (`SUB_DUR` 4,2 s, cinque varianti). La attiva `src/15-live-match.jsx` quando `benchPhase` passa a `entering`
  (`setSubEntryKey`). Regia nel blocco «regia dell'INGRESSO SUBENTRANTE» del render-loop.
- Regia vecchia: camera a `(eroe.x-12, 5,0-5,6, eroe.z-11)`. L'eroe parte da `(-6, -35,5)`, quindi la camera
  stava a z ≈ -44,5, oltre la linea laterale, e guardava verso il campo (+z).
- Strumento: testimone di sola prova `__CPM_G127` (src/12, solo sotto `cpmtest`). Per ciascuna delle quattro
  tribune porta la posizione della camera in coordinate locali del gruppo (`buildStadium` ora esporta i gruppi,
  `stands127`, con larghezza/profondità/altezza in `userData.dim127`) e conta i gradoni (`userData.tier127`)
  dentro il tronco di vista e visti dalla faccia posteriore (camera dal lato opposto alla normale rivolta a
  campo e cielo). Riporta anche l'eroe in ndc e la visibilità sua e del suo GLB.
- Flusso vero: carriera dal salvataggio `fixtures/save-190-s12-ovr93.json`, GLB acceso, panchina forzata
  (`__CPM_FORCE_BENCH`) e minuto d'ingresso di collaudo (`__CPM_BENCH_MIN`). Due stadi: trasferta (FC Tyneside,
  tribuna lato panchine alta 24,1) e casa (impianto del club, gara europea con FC Paris; tribuna alta 36,7).

Misura «prima» (braccio rosso `__CPM_NO_G127`, ultima corsa completa):

| formato | caso | fotogrammi | camera dentro/dietro tribuna | gradoni dal retro |
|---|---|---|---|---|
| 360x800 | trasferta | 86 | 52 | 50 |
| 360x800 | casa | 85 | 36 | 43 |
| 412x915 | trasferta | 85 | 52 | 51 |
| 412x915 | casa | 86 | 35 | 43 |
| 1440x900 | trasferta | 162 | 94 | 50 |
| 1440x900 | casa | 129 | 11 | 34 |

Posizione locale tipica: 9-14 u oltre il fronte della tribuna, a quota 4,6-4,8, cioè sotto i gradoni.
Le foto «prima» mostrano l'interno grigio della struttura e il retro dei gradoni con le figure del pubblico
viste da dietro.

## 2. La correzione (rosso `__CPM_NO_G127` = tutto com'era)

1. **Camera sul prato, di fronte all'eroe**, rivolta verso la panchina: `(eroe.x+2, 3,6-4,0, eroe.z+11)`, sguardo
   sull'eroe. Alle sue spalle c'è il fronte della tribuna, visto dal lato giusto. Se l'eroe arriva vicino alla
   linea opposta, la camera non supera z 26 e recupera la distanza di 11 u di lato (verso l'attacco).
2. **Ultima parola alla regia d'ingresso** durante la scena, in due punti: prima dello stacco di scena (lo stacco
   di un highlight accodato faceva scattare la camera sul bersaglio dell'highlight; a 1440x900, a scena congelata,
   l'eroe restava a ndc 1,3, fuori dal quadro) e prima dell'arbitro d'inerzia (regola 7.521).
3. **La guardia-palla degli highlight non ruota lo sguardo** durante l'ingresso (prima spostava l'eroe a ndc ±0,8).
4. **Lo sguardo anticipa la corsa** di 0,125 s, pari al ritardo a regime del lerp (kl = dt·8). Con kl = dt·3 lo
   sguardo restava circa 3 u indietro sull'eroe che corre.
5. **Linea d'attesa sul prato**: l'eroe parte da z -34,4 e non più da -35,5. A -35,5 stava 0,3 u dietro il
   cartellone (z -35,2, alto 1,3) e, con la camera di fronte, si vedeva solo la targhetta (misurato: eroe
   acceso, GLB acceso, al centro del quadro, ma coperto). È l'unico spostamento della scena: gesti, varianti,
   attesa, corsa e `SUB_DUR` sono rimasti com'erano.

## 3. Guardiano nuovo `panchina-127` (`npm run panchina-127`)

- T1: nessun fotogramma con la camera dentro o dietro il volume di una tribuna.
- T2: nessun fotogramma con gradoni visti dalla faccia posteriore.
- T3: eroe inquadrato (piedi e testa nel quadro) in almeno il 90% dei fotogrammi.
- Il rosso (`__CPM_NO_G127`) deve far cadere T1 o T2, altrimenti il guardiano è cieco. Se una scena ha meno di
  20 fotogrammi è «non giudicata», cioè rossa. Braccio e motivo vengono stampati per ultimi.
- Uso: `CPM_P127_FORMATI=m360,tel,pc` (default), `CPM_P127_CASI`, `CPM_P127_SOLO=verde|rosso`, `CPM_P127_FOTO=1`.
  Un formato con entrambi i bracci impiega circa 4-5 minuti (PC circa 7), quindi va lanciato un formato per chiamata.
- ⚠️ T3 misura la proiezione, non l'occlusione: la copertura dietro il cartellone (punto 5) è stata trovata
  dalle foto, non dal guardiano.

Misura «dopo» (verde, ultima corsa completa, build 68e444d):

| formato | caso | fotogrammi | dentro/dietro | gradoni dal retro | eroe inquadrato |
|---|---|---|---|---|---|
| 360x800 | trasferta | 86 | 0 | 0 | 1,00 |
| 360x800 | casa | 86 | 0 | 0 | 1,00 |
| 412x915 | trasferta | 86 | 0 | 0 | 1,00 |
| 412x915 | casa | 87 | 0 | 0 | 1,00 |
| 1440x900 | trasferta | 125 | 0 | 0 | 1,00 |
| 1440x900 | casa | 126 | 0 | 0 | 1,00 |

Eroe in ndc durante la corsa: entro ±0,28 dal centro su 412x915 e 1440x900 (prima della correzione 4 era ±0,8).

## 4. Controlli (in sequenza, uno alla volta, CPM_CHROME=/opt/pw-browsers/chromium)

| controllo | esito |
|---|---|
| panchina-127 (3 formati × 2 casi, verde + rosso) | verde, il rosso si vede |
| scena3d-96 (diviso per formato: tel · pc · tabv+tabo, perché in un'unica passata supera i 10 minuti) | verde 16/16 · 9/9 · 6/6, errori di pagina 0 |
| intro-118 | verde |
| bambini-124 | verde, il rosso si vede |
| partita-v2 (verde + rosso) | verde, contrasto minimo 4,93:1, rosso atteso OK |
| replay | PASS, 8 highlight |
| test:logic | fail 0 |
| save-compat | 12 pass · 0 fail |

`node tools/build-src.mjs` e `node tools/check-src.mjs` danno l'HTML identico byte per byte ai frammenti.

## 5. Cosa resta fuori / da sapere

- Durante la corsa di prova un highlight si accoda e la sua scheda di scelta compare sopra la scena d'ingresso
  (si vede nelle foto, sia prima sia dopo). È il comportamento esistente del flusso (panchina forzata a 2×) e non
  è stato toccato. Ora la camera, però, resta sull'eroe finché dura l'ingresso.
- La regia d'uscita del sostituito (`subExitT`) usa lo stesso schema (camera a eroe.z-12). Non era nella
  segnalazione e non l'ho né misurata né toccata. Merita la stessa sonda (il testimone `__CPM_G127` serve anche lì).
- Roadmap e `GAME_VERSION`: non toccate in questa sessione figlia, come da consegna.

## Foto

`docs/sviluppo/foto-giro127/`: `prima-*` e `dopo-*` per {trasferta, casa} × {360x800, 412x915, 1440x900}, 4
fotogrammi chiave (scena a 0,3 · 1,2 · 2,4 · 3,6 s) più tre provini riassuntivi `provino-<formato>.png`
(righe: prima trasferta · dopo trasferta · prima casa · dopo casa).
