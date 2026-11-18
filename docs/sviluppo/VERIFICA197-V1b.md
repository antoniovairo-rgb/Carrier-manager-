# VERIFICA 7.999.197 — blocco V1b (sessione 2 di 3)

Base: `lavoro/197` a **30a456b3** (detached, poi ramo `sviluppo/verifica197-v1b`). Confronto: 7.999.196 pubblicata (`origin/main` 3076a1b7).
Nessun file di `src/` o `tests/` modificato. `node tools/build-src.mjs` → «byte identici a prima»; `node tools/check-src.mjs` → allineato a HEAD.
Modo: un controllo alla volta, `CPM_CI_PAR=0 CPM_CHROME=/opt/pw-browsers/chromium npm run -s <nome>` in `tests/visual`, `timeout 2400`;
`free -m` e `df -h` prima di ognuno (in `diario`, memoria libera ~15 GB, disco 29 GB); dopo ognuno `git checkout -- docs/`.

## Come ho ricavato l'elenco

- In `tests/visual/ci-runner.mjs` la PRIMA riga di `MAPPA` che risponde sia a `src/12-…` sia a `src/13-…` è la stessa:
  `[/src\/12-|src\/13-/, [...]]` (indice 0, **76 guardiani**). Verificato con `MAPPA.findIndex` su `src/12-x.jsx` e `src/13-x.jsx`.
- Parte src/12: la riga meno i 13 eseguiti dal giro 265 = **63 guardiani**, gli stessi 63 nomi elencati al §5 di
  `RAPPORTO-giro265.md` (il rapporto scrive «gli altri 64» ma i nomi elencati sono 63: controllato confrontando i due insiemi, nessuna differenza).
- Parte src/13: la stessa riga meno i 4 eseguiti dal giro 262 (`formazioni-262`, `rigorista-257`, `ingresso-245`, `nomi-182`), aggiungendo
  in coda solo quelli non già presenti = 13 guardiani.
- Tolti gli esclusi presenti nella riga: `formazioni-262`, `coreografie-244`, `lotteria-191`, `spazio-296`, `giornale-244`, `stadi-071`,
  `parata-100`, `portiere-223`, `validate-situations`, `portiere-252`, `esiti-241`. Totale: **65**.

**Scelta da segnalare (dubbio 1):** ho letto «quelli di src/12 non eseguiti dal 265 *più* quelli di src/13 non eseguiti dal 262» come
UNIONE. Siccome le due righe coincidono, l'unione ricomprende guardiani che uno dei due giri ha già eseguito: `rigorista-257`, `nomi-182`,
`ingresso-245` (eseguiti dal 262) e `portiere-265`…`parata-258` (posizioni 58-65, eseguiti dal 265). Con la lettura «intersezione»
(nessuno dei due giri li ha eseguiti) l'elenco sarebbe di 62 e la numerazione cambierebbe. Ho seguito la lettura letterale.

## Elenco completo numerato (★ = mia parte, posizioni 2, 5, 8, …)

| # | guardiano | parte | # | guardiano | parte | # | guardiano | parte |
|---|---|---|---|---|---|---|---|---|
| 1 | rigorista-257 | 12 | 23 ★ | avvicinamento-61 | 12 | 45 | piedi-252 | 12 |
| 2 ★ | tunnel-245 | 12 | 24 | linee-61 | 12 | 46 | difesa-252 | 12 |
| 3 | salienti-243 | 12 | 25 | pallone-278 | 12 | 47 ★ | aereo-252 | 12 |
| 4 | guardalinee-222 | 12 | 26 ★ | ingresso-277 | 12 | 48 | difesa-220-giro31 | 12 |
| 5 ★ | tocco3d-219 | 12 | 27 | inquadra-273 | 12 | 49 | apertura-261 | 12 |
| 6 | piazzato-204 | 12 | 28 | salti-274 | 12 | 50 ★ | camera-252 | 12 |
| 7 | pullman-204 | 12 | 29 ★ | memoria-275 | 12 | 51 | reazione-252 | 12 |
| 8 ★ | nomi-182 | 12 | 30 | buildup-sync | 12 | 52 | spot-266 | 12 |
| 9 | chiusura-99 | 12 | 31 | po229-gi38 | 12 | 53 ★ | testa-143 | 12 |
| 10 | consegna-103 | 12 | 32 ★ | esiti-218 | 12 | 54 | cerimonie | 12 |
| 11 ★ | colla-103 | 12 | 33 | cross-218 | 12 | 55 | passaggio-coppa-137 | 12 |
| 12 | contatto-103 | 12 | 34 | scene-221 | 12 | 56 ★ | kit-061 | 12 |
| 13 | carriera3-94 | 12 | 35 ★ | fila-227 | 12 | 57 | strisce-corpo | 12 |
| 14 ★ | assist-298 | 12 | 36 | bambini-294 | 12 | 58 | portiere-265 | 13 |
| 15 | scena3d-96 | 12 | 37 | partita-vera | 12 | 59 ★ | dribbling-226 | 13 |
| 16 | panchina-293 | 12 | 38 ★ | bambini-236 | 12 | 60 | gk-dive-sync | 13 |
| 17 ★ | pc-tablet-292 | 12 | 39 | pressing-143 | 12 | 61 | gk-miss-229 | 13 |
| 18 | ingresso-285 | 12 | 40 | conduci-242 | 12 | 62 ★ | goal-postarc | 13 |
| 19 | corpi-073 | 12 | 41 ★ | ingresso-245 | 12 | 63 | rete-252 | 13 |
| 20 ★ | ingresso-276 | 12 | 42 | difesa-220-scena | 12 | 64 | rinvio-252 | 13 |
| 21 | stadi-064 | 12 | 43 | ingresso-camminata-245 | 12 | 65 ★ | parata-258 | 13 |
| 22 | render-3d-023 | 12 | 44 ★ | analisi-217 | 12 | | | |

**Mia parte (22):** tunnel-245, tocco3d-219, nomi-182, colla-103, assist-298, pc-tablet-292, ingresso-276, avvicinamento-61,
ingresso-277, memoria-275, esiti-218, fila-227, bambini-236, ingresso-245, analisi-217, aereo-252, camera-252, testa-143, kit-061,
dribbling-226, goal-postarc, parata-258.

## Esiti

Esito = codice d'uscita del comando (0 verde; 124 = ucciso dal tetto di 2400 s). Durate in secondi.

| # | controllo | esito 1ª | esito 2ª | esito sulla 196 | classificazione | ultima riga del controllo |
|---|---|---|---|---|---|---|
| 2 | tunnel-245 | ✅ verde (2008 s) | — | — | verde | «ROSSO VISTO: il guardiano riconosce lo schieramento a sinistra, la panca bassa e la sostituzione attraverso gli oggetti.» |
| 5 | tocco3d-219 | ❌ rosso (437 s) | ❌ rosso (456 s) | ❌ rosso (536 s, «verde 3/9 · rosso bocciato 6/6», stessa causa G3) | **dichiarato** (rosso anche sulla 196) | «ultimo: verde 2/9 · rosso bocciato 6/6» (2ª: «verde 0/9 · rosso bocciato 6/6»). Causa stampata sul braccio verde: «G3 compito lungo 748-1001 ms > 600 fra tocco e scena chiusa» |
| 8 | nomi-182 | ✅ verde (284 s) | — | — | verde | «nomi-182: ROSSO (26 ok · 2 ko)» = braccio rosso atteso; verde «28 ok · 0 ko» |
| 11 | colla-103 | ✅ verde (256 s) | — | — | verde | «✓ colla-103 VERDE (e il rosso si vede)» |
| 14 | assist-298 | ⏱ oltre tetto (2400 s) | ⏱ oltre tetto (2400 s) | in coda (tetto 60 min) | oltre tetto | braccio verde chiuso «VERDE scene 19 giudicate 19 · passaggi riusciti 100.0% …» in entrambe; il braccio rosso non ha chiuso nessun seme prima del tetto (~8 min per seme, 5 semi per braccio) |
| 17 | pc-tablet-292 | ✅ verde (725 s) | — | — | verde | «PC-TABLET-292: ✅ VERDE» |
| 20 | ingresso-276 | ✅ verde (316 s) | — | — | verde | «✅ ingresso-276 verde (calciatori nel quadro nei primi 12 s, fila leggibile a fine ingresso) e il rosso si vede» |
| 23 | avvicinamento-61 | ✅ verde (101 s) | — | — | verde | «✅ avvicinamento-61 verde (e il rosso si vede)» |
| 26 | ingresso-277 | ✅ verde (463 s) | — | — | verde | «✅ ingresso-277 verde (durata intermedia, nessun velo, saltabile, corpi pronti a fine ingresso) e il rosso si vede» |
| 29 | memoria-275 | ❌ rosso (493 s) | ❌ rosso (507 s) | ✅ verde (583 s, «✅ PASS memoria-275: scene 1 · renderer 2→2 · corpi animati 962→976 · heap dopo GC 370 MB») | **NATO nella 197** (verde sulla 196) | «❌ FAIL memoria-275: scene 2 · renderer 2→3 · corpi animati 869→1846 · heap dopo GC 305 MB» (identica nelle due corse: dopo la seconda partita la prima scena non è stata rilasciata, Object3D 13222→26458) |
| 32 | esiti-218 | ❌ rosso (2354 s) | in corsa | | | «· partite non arrivate al fischio: verde 1234 fermo in playing» (verde: 17 scene, 0 contraddizioni; rosso visto: 7 contraddizioni) |

<!-- TABELLA -->

## Dubbi

1. Lettura «unione» dell'elenco (sopra).
2. **`memoria-275` è NATO nella 197 e per la regola PO-516 blocca l'uscita.** Sulla 197, in due corse uguali, dopo la seconda
   partita la scena della prima resta viva: `Scene` 1→2, `Renderer` 2→3, corpi animati 869→1846, Object3D 13222→26458, heap dopo GC
   188→302 MB (anche togliendo i 368 agganci `__CPM*`: 305 MB). Sulla 196, stesso comando: una scena, renderer 2→2, corpi 962→976.
   Non ho cercato la causa (consegna: solo eseguire e classificare). Indizio da verificare per chi ripara: il rilascio della partita
   allo smontaggio (`__CPM_SMONTA219`, invariante del giro 219) e ciò che i giri del lotto 197 hanno aggiunto in src/12-13.
