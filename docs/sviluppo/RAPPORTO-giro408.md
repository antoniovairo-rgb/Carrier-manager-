# Rapporto giro 408 — PO-674 «La cornice dell'agente è sballata»

Base: `lavoro/202` (c1efcce, 7.999.216 + giro 401). Ramo: `sviluppo/giro408-cornice-agente`. GAME_VERSION e docs/governo non toccati.

## Il difetto (foto PO 26/11, `docs/collaudo-po/216-cornice-agente.jpg`)
Nella finestra «Il confronto» il ritratto del procuratore aveva una doppia cornice (bordo chiaro esterno + riquadro interno
con angoli diversi) e la foto non riempiva il riquadro (fascia vuota in alto e ai lati).

## Causa misurata
`FigurinaKorward23` (src/01) è la figurina da album: fondo sfumato nella tinta della cornice, fascia alta per il marchio
KORWARD, riquadro della foto con anello bianco (`box-shadow 0 0 0 1px`), pannello di testo in basso. Sotto i 120 px non
entra nessuna riga di testo, e a 58 px non entra nemmeno la scritta KORWARD: restano il fondo sfumato (3 px ai lati,
10 px in alto riservati a un marchio che non si disegna) + l'anello del riquadro = **due cornici**, e la foto copre solo
una parte del riquadro.

## Misure (sonda/guardiano `cornice-408`, rettangoli del DOM, 412×915 e 1280×900, pagina nuova per schermata)

| Dove | Riquadro | Prima: bordi · foto copre | Dopo: bordi · foto copre · raggio cornice/foto |
|---|---|---|---|
| «Il confronto» (procuratore) | 58×82 | 2 (anello + fondo 11,2 px) · **72,7%** | 1 · **100%** · 6/6 |
| «Il primo incontro» (procuratore) | 58×82 | 2 (anello + fondo 11,2 px) · **72,7%** | 1 · **100%** · 6/6 |
| Scheda Agente (procuratore) | 38×54 | 2 (anello + fondo 1,7 px) · **85,5%** | 1 · **100%** · 6/6 |

Identiche a 412 e 1280. Home, Ufficio e Profilo col salvataggio S12 non mostrano ritratti senza testo (0 misurati).
Il rosso `__CPM_NO_G408` torna esattamente ai numeri «prima» su tutte e tre.

Foto: `docs/collaudo-po/408-prima-{412,1280}-{confronto,incontro,agente}.png`, `408-dopo-…`, e il confronto ravvicinato
`408-confronto-prima-dopo.png` (sopra prima, sotto dopo).

## Correzione (alla sorgente, un punto solo)
`src/01-bootstrap-tema-avatar.jsx`, funzione `FigurinaKorward23`: quando la figurina **non ha righe di testo** è un
ritratto → un solo contenitore col raggio della scala `RAD`, foto `object-fit: cover` a tutto riquadro (volto al 28%
dall'alto, come prima), un solo filo `inset` nella tinta della cornice standard (PO-208, grigio chiaro), disegnato sopra la
foto con lo stesso raggio; fondo `TH.card`, ombra `TH.el1/el3`. Nessun colore nuovo: solo token e la tinta già decisa da
PO-208. Le figurine con testo (eroe nella home, carte grandi) restano la carta da album invariata.
Poiché ogni ritratto passa da `Figurina` → `FigurinaKorward23`, la regola vale ovunque: procuratore (52/40/34/28 px),
mister, giornalisti, dirigente, arbitro, compagni in miniatura nella partita e nelle cerimonie.
Rosso: `window.__CPM_NO_G408` (cornice di prima). `CARRIER-MANAGER-AV.html` ricomposto con `tools/build-src.mjs`.

## File toccati
- `src/01-bootstrap-tema-avatar.jsx` — `FigurinaKorward23` (ramo ritratto 408).
- `CARRIER-MANAGER-AV.html` — ricomposto da src/.
- `tests/visual/cornice-408.mjs` — guardiano nuovo (verde + rosso).
- `tests/visual/package.json` — script `cornice-408`.
- `tests/visual/ci-runner.mjs` — `cornice-408` nella riga esistente della MAPPA `src/0[0-8]-` (mappa-unica verde).
- `docs/collaudo-po/408-*.png`, `docs/collaudo-po/216-cornice-agente.jpg` (la foto del PO, copiata da main) — foto.
- `docs/sviluppo/RAPPORTO-giro408.md` — questo rapporto.

## Guardiano
`npm run cornice-408`: per ogni ritratto (figurina con volto e senza testo) a 412 e 1280 in sei schermate: un solo bordo
(border visibile, anello di box-shadow, o fondo della figurina visibile attorno alla foto), foto ≥ 98% del riquadro, raggio
dell'elemento che ritaglia la foto = raggio della cornice, immagine caricata. «Non giudicato» (ritratto del confronto
assente, immagine non caricata) = rosso. Braccio rosso `__CPM_NO_G408`: deve cadere sul confronto. Esito: verde 6/6, rosso
cade su 6/6.

Giro: `node ci-runner.mjs giro cornice-408` (guardiano + 17 sentinelle) su 7.999.216: **18/18 verdi**, nessun passo instabile
(fra i passi: design-system, tema-unico, griglia-mobile, career-critical, partita-vera, web-237, schermate-97). `mappa-unica` verde.

## Dubbi per il PO (la consigliata è la prima, già applicata)
1. **[APPLICATA] Ritratto pulito, filo sottile grigio chiaro (1 px sotto i 64 px, 2 px sopra)**, la tinta scelta in PO-208,
   foto a tutto riquadro. Minimo cambiamento, coerente con «cornice sottile grigia come l'eroe nella home».
2. Filo nel colore del club / `TH.primary` invece del grigio: lega il ritratto al club, ma PO-208 aveva bocciato la cornice
   rossa del procuratore.
3. Nessun filo, solo ombra `TH.el1`: ancora più pulito, ma sul fondo scuro un ritratto con fondo chiaro perde il contorno.
4. Estendere la stessa cornice anche alle carte con testo (eroe nella home): fuori ambito qui, cambierebbe la carta da album.

## Fuori ambito
La figurina senza volto (ramo `Figurina` senza url, bianco neutro con bordo singolo) era già a un bordo e non è toccata.
